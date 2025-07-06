#!/usr/bin/env python3
import sys
import json
import sqlite3
import os
from typing import List, Dict, Any
import google.generativeai as genai
from deep_translator import GoogleTranslator
from tavily import TavilyClient
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
from langchain.text_splitter import RecursiveCharacterTextSplitter
import datetime
import pytz
import time

class ChatProcessor:
    def __init__(self):
        self.setup_apis()
        self.setup_database()
        self.setup_embeddings()
    
    def setup_apis(self):
        """Initialize API clients"""
        self.genai_api_key = os.getenv('GOOGLE_API_KEY')
        self.tavily_api_key = os.getenv('TAVILY_API_KEY')
        
        try:
            if not self.genai_api_key:
                raise ValueError("GOOGLE_API_KEY is not set")
            genai.configure(api_key=self.genai_api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            print("Gemini API initialized successfully", file=sys.stderr)
        except Exception as e:
            print(f"Error initializing Gemini API: {e}", file=sys.stderr)
            self.model = None
        
        try:
            if not self.tavily_api_key:
                raise ValueError("TAVILY_API_KEY is not set")
            self.tavily_client = TavilyClient(api_key=self.tavily_api_key)
            print("Tavily API initialized successfully", file=sys.stderr)
        except Exception as e:
            print(f"Error initializing Tavily API: {e}", file=sys.stderr)
            self.tavily_client = None
    
    def setup_database(self):
        """Initialize SQLite database"""
        os.makedirs("data", exist_ok=True)
        self.db_path = "data/chatbot.db"
        
        if not os.path.exists(self.db_path):
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS universities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    university TEXT,
                    program TEXT,
                    tuition INTEGER,
                    location TEXT,
                    visa_service TEXT
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversation_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    query TEXT,
                    response TEXT,
                    timestamp TEXT
                )
            """)
            
            # Add sample data
            cursor.execute("""
                INSERT OR IGNORE INTO universities (university, program, tuition, location, visa_service)
                VALUES
                    ('MIT', 'Computer Science', 57340, 'Cambridge, MA', 'F-1 Visa Support'),
                    ('Stanford University', 'Computer Science', 56170, 'Stanford, CA', 'F-1 Visa Support'),
                    ('Visamonk University', 'AI Studies', 50000, 'Online', 'F-1 Visa Support')
            """)
            
            conn.commit()
            conn.close()
            print("Database initialized with sample data", file=sys.stderr)
    
    def setup_embeddings(self):
        """Initialize embedding model and FAISS index"""
        try:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            self.load_faiss_index()
            print("Embeddings and FAISS index loaded successfully", file=sys.stderr)
        except Exception as e:
            print(f"Error setting up embeddings: {e}", file=sys.stderr)
            self.embedding_model = None
            self.faiss_index = None
            self.text_chunks = []
    
    def load_faiss_index(self):
        """Load or create FAISS index"""
        index_path = "vectorstore/index.faiss"
        chunks_path = "vectorstore/chunks.pkl"
        
        if os.path.exists(index_path) and os.path.exists(chunks_path):
            self.faiss_index = faiss.read_index(index_path)
            with open(chunks_path, 'rb') as f:
                self.text_chunks = pickle.load(f)
            print(f"Loaded FAISS index with {len(self.text_chunks)} chunks", file=sys.stderr)
        else:
            self.faiss_index = None
            self.text_chunks = []
            print("No FAISS index found, using empty index", file=sys.stderr)
    
    def process_query(self, query: str, language: str = "en", history: List[Dict] = None) -> Dict[str, Any]:
        """Main query processing function"""
        start_time = time.time()
        print(f"Processing query: {query}", file=sys.stderr)
        
        try:
            # Try SQL query first
            sql_response = self.try_sql_query(query, language)
            if sql_response["success"]:
                print(f"SQL query successful, took: {time.time() - start_time:.2f}s", file=sys.stderr)
                return sql_response
            
            # Fall back to RAG query
            rag_response = self.try_rag_query(query, language, history)
            print(f"RAG query successful, took: {time.time() - start_time:.2f}s", file=sys.stderr)
            return rag_response
            
        except Exception as e:
            print(f"Error processing query: {e}", file=sys.stderr)
            return {
                "success": False,
                "text": "I'm experiencing technical difficulties. Please try again or ask about universities, programs, or visa requirements.",
                "followUps": self.generate_follow_ups(query)
            }
    
    def try_sql_query(self, query: str, language: str) -> Dict[str, Any]:
        """Attempt to answer query using SQL database"""
        sql_start = time.time()
        try:
            # Translate query to English if needed
            if language != "en":
                translated_query = GoogleTranslator(source=language, target="en").translate(query)
            else:
                translated_query = query
            print(f"Translated query: {translated_query}", file=sys.stderr)
            
            # Generate SQL query using Gemini
            if not self.model:
                return {"success": False, "error": "Gemini API not available"}
            sql_query = self.generate_sql_query(translated_query)
            print(f"Generated SQL query: {sql_query}", file=sys.stderr)
            
            if not sql_query.startswith('SELECT'):
                return {"success": False, "error": "Invalid SQL query generated"}
            
            # Execute SQL query
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(sql_query)
            results = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            conn.close()
            print(f"SQL query executed, results: {len(results)}, took: {time.time() - sql_start:.2f}s", file=sys.stderr)
            
            if not results:
                return {"success": False, "error": "No results found"}
            
            # Format response
            if len(results) == 1 and len(columns) == 1:
                response = str(results[0][0])
            else:
                response = "\n".join([
                    f"{', '.join([f'{col}: {val}' for col, val in zip(columns, row)])}" 
                    for row in results
                ])
            
            # Translate response back if needed
            if language != "en":
                response = GoogleTranslator(source="en", target=language).translate(response)
            
            return {
                "success": True,
                "text": response,
                "followUps": self.generate_follow_ups(query)
            }
            
        except Exception as e:
            print(f"SQL query error: {e}", file=sys.stderr)
            return {"success": False, "error": str(e)}
    
    def try_rag_query(self, query: str, language: str, history: List[Dict] = None) -> Dict[str, Any]:
        """Attempt to answer query using RAG"""
        rag_start = time.time()
        try:
            if not self.faiss_index or not self.embedding_model:
                print("No FAISS index available, returning fallback response", file=sys.stderr)
                return {
                    "success": True,
                    "text": "I'm here to help with university information! Please ask me about specific universities, programs, tuition fees, or visa requirements.",
                    "followUps": self.generate_follow_ups(query)
                }
            
            # Translate query to English if needed
            if language != "en":
                translated_query = GoogleTranslator(source=language, target="en").translate(query)
            else:
                translated_query = query
            
            # Get relevant documents using FAISS
            query_embedding = self.embedding_model.encode([translated_query])
            distances, indices = self.faiss_index.search(query_embedding, k=3)
            print(f"FAISS search returned {len(indices[0])} results, took: {time.time() - rag_start:.2f}s", file=sys.stderr)
            
            # Get context from retrieved chunks
            context = ""
            for idx in indices[0]:
                if idx < len(self.text_chunks):
                    context += self.text_chunks[idx] + "\n\n"
            
            # Generate response using Gemini
            if not self.model:
                return {"success": False, "error": "Gemini API not available"}
            response = self.generate_rag_response(translated_query, context, history)
            
            # Translate response back if needed
            if language != "en":
                response = GoogleTranslator(source="en", target=language).translate(response)
            
            print(f"RAG response generated, took: {time.time() - rag_start:.2f}s", file=sys.stderr)
            return {
                "success": True,
                "text": response,
                "followUps": self.generate_follow_ups(query)
            }
            
        except Exception as e:
            print(f"RAG query error: {e}", file=sys.stderr)
            return {
                "success": True,
                "text": "I encountered an error processing your query. Please try asking about specific universities, programs, or visa requirements.",
                "followUps": self.generate_follow_ups(query)
            }
    
    def generate_sql_query(self, query: str) -> str:
        """Generate SQL query using Gemini"""
        prompt = f"""
        You are an expert SQL assistant for a university chatbot. Convert the user's query into a valid SQLite SELECT query.
        
        Table schema:
        - universities (university TEXT, program TEXT, tuition INTEGER, location TEXT, visa_service TEXT)
        
        Rules:
        1. Generate only the SQL SELECT query
        2. If the query cannot be answered with available data, return: 'No relevant data in database.'
        3. Use exact table name 'universities'
        4. Handle ambiguous queries by assuming they refer to the universities table
        
        Examples:
        - "What is the tuition at Sample University?" -> SELECT tuition FROM universities WHERE university = 'Sample University';
        - "Which universities offer Computer Science?" -> SELECT university FROM universities WHERE program = 'Computer Science';
        
        User query: {query}
        SQL query:
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating SQL: {e}", file=sys.stderr)
            return f"No relevant data in database."
    
    def generate_rag_response(self, query: str, context: str, history: List[Dict] = None) -> str:
        """Generate response using RAG with Gemini"""
        history_context = ""
        if history:
            history_context = "\n".join([
                f"Previous Q: {msg.get('content', '')}" 
                for msg in history[-3:] if msg.get('type') == 'user'
            ])
        
        full_context = f"{history_context}\n\n{context}" if history_context else context
        
        prompt = f"""
        You are a helpful university and visa information assistant. Provide a concise and informative answer based on the context provided. If the answer isn't in the context, provide general guidance about university admissions and visa processes.
        
        Context: {full_context}
        
        Question: {query}
        
        Instructions:
        - Be helpful and informative
        - If specific information isn't available, provide general guidance
        - Keep responses concise but comprehensive
        - Focus on university admissions, programs, and visa requirements
        
        Answer:
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating RAG response: {e}", file=sys.stderr)
            return "I'm here to help with university and visa information. Please ask me about specific universities, programs, admission requirements, or visa processes."
    
    def generate_follow_ups(self, query: str) -> List[str]:
        """Generate follow-up questions"""
        follow_ups = [
            "What are the admission requirements?",
            "Tell me about tuition fees",
            "What programs are available?",
            "How do I apply for a student visa?",
            "What documents do I need for F-1 visa?",
            "Which universities offer scholarships?"
        ]
        
        import random
        return random.sample(follow_ups, min(3, len(follow_ups)))
    
    def save_conversation(self, query: str, response: str):
        """Save conversation to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            timestamp = datetime.datetime.now(pytz.timezone('Asia/Kolkata')).strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(
                "INSERT INTO conversation_history (query, response, timestamp) VALUES (?, ?, ?)",
                (query, response, timestamp)
            )
            conn.commit()
            conn.close()
            print("Conversation saved to database", file=sys.stderr)
        except Exception as e:
            print(f"Error saving conversation: {e}", file=sys.stderr)

def main():
    start_time = time.time()
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        print(f"Input received: {data}", file=sys.stderr)
        
        processor = ChatProcessor()
        result = processor.process_query(
            data['message'], 
            data.get('language', 'en'), 
            data.get('history', [])
        )
        
        # Save conversation
        processor.save_conversation(data['message'], result['text'])
        
        # Output result as JSON
        print(json.dumps(result))
        print(f"Total processing time: {time.time() - start_time:.2f}s", file=sys.stderr)
        
    except Exception as e:
        print(f"Main error: {e}", file=sys.stderr)
        error_result = {
            "success": False,
            "text": "I'm experiencing technical difficulties. Please try again or ask about universities, programs, or visa requirements.",
            "followUps": [
                "What programs are available?",
                "Tell me about admission requirements",
                "How do I apply for a student visa?"
            ]
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()