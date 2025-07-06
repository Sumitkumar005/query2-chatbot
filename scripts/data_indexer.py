#!/usr/bin/env python3
import sys
import json
import os
import shutil
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
from langchain.text_splitter import RecursiveCharacterTextSplitter

def main():
    try:
        # Load and index all text data
        result = load_and_index_data()
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "chunks": 0,
            "files": 0
        }
        print(json.dumps(error_result))
        sys.exit(1)

def load_and_index_data():
    """Load and index data for FAISS"""
    all_texts = []
    files_processed = 0
    
    # Load university_info.txt
    uni_info_file = "data/university_info.txt"
    if os.path.exists(uni_info_file):
        with open(uni_info_file, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if content:
                all_texts.append(content)
                files_processed += 1
    
    # Load scraped_data
    scraped_dir = "scraped_data"
    if os.path.exists(scraped_dir):
        for file_name in os.listdir(scraped_dir):
            if file_name.endswith(".txt"):
                file_path = os.path.join(scraped_dir, file_name)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        all_texts.append(content)
                        files_processed += 1
    
    if not all_texts:
        return {
            "success": True,
            "message": "No text data found for indexing",
            "chunks": 0,
            "files": 0
        }
    
    # Split texts into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = []
    for text in all_texts:
        chunks.extend(text_splitter.split_text(text))
    
    if not chunks:
        return {
            "success": True,
            "message": "No chunks created",
            "chunks": 0,
            "files": files_processed
        }
    
    # Create embeddings
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = embedding_model.encode(chunks)
    
    # Create FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings.astype('float32'))
    
    # Save index and chunks
    os.makedirs("vectorstore", exist_ok=True)
    
    # Remove old index if exists
    if os.path.exists("vectorstore/index.faiss"):
        os.remove("vectorstore/index.faiss")
    if os.path.exists("vectorstore/chunks.pkl"):
        os.remove("vectorstore/chunks.pkl")
    
    # Save new index
    faiss.write_index(index, "vectorstore/index.faiss")
    
    # Save chunks
    with open("vectorstore/chunks.pkl", 'wb') as f:
        pickle.dump(chunks, f)
    
    return {
        "success": True,
        "message": f"Successfully indexed {len(chunks)} chunks from {files_processed} files",
        "chunks": len(chunks),
        "files": files_processed
    }

if __name__ == "__main__":
    main()
