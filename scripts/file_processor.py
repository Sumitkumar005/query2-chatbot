#!/usr/bin/env python3
import sys
import json
import os
import sqlite3
import pandas as pd
import PyPDF2
import datetime
import pytz

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        file_path = data['filePath']
        file_name = data['fileName']
        file_ext = file_name.split('.')[-1].lower()
        
        result = {"processed": True, "type": file_ext}
        
        if file_ext in ['csv', 'xlsx']:
            result.update(process_structured_file(file_path, file_ext))
        elif file_ext == 'sql':
            result.update(process_sql_file(file_path))
        elif file_ext == 'pdf':
            result.update(process_pdf_file(file_path))
        elif file_ext == 'txt':
            result.update(process_text_file(file_path, file_name))
        else:
            result["processed"] = False
            result["error"] = f"Unsupported file type: {file_ext}"
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "processed": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

def process_structured_file(file_path: str, file_ext: str) -> dict:
    """Process CSV or XLSX files"""
    try:
        # Read file
        if file_ext == 'csv':
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
        
        # Check for expected columns
        expected_columns = ['university', 'program', 'tuition', 'location', 'visa_service']
        if not all(col in df.columns for col in expected_columns):
            return {
                "processed": False,
                "error": f"File must have columns: {', '.join(expected_columns)}"
            }
        
        # Initialize database
        db_path = "data/chatbot.db"
        conn = sqlite3.connect(db_path)
        
        # Insert data
        df.to_sql('universities', conn, if_exists='append', index=False)
        conn.close()
        
        return {
            "rows_inserted": len(df),
            "columns": list(df.columns)
        }
        
    except Exception as e:
        return {"processed": False, "error": str(e)}

def process_sql_file(file_path: str) -> dict:
    """Process SQL files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        db_path = "data/chatbot.db"
        conn = sqlite3.connect(db_path)
        conn.executescript(sql_content)
        conn.commit()
        conn.close()
        
        return {"sql_executed": True}
        
    except Exception as e:
        return {"processed": False, "error": str(e)}

def process_pdf_file(file_path: str) -> dict:
    """Process PDF files"""
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
        
        if not text.strip():
            return {"processed": False, "error": "No text extracted from PDF"}
        
        # Save extracted text
        os.makedirs("scraped_data", exist_ok=True)
        timestamp = datetime.datetime.now(pytz.timezone('Asia/Kolkata')).strftime('%Y%m%d_%H%M')
        text_file = f"scraped_data/pdf_upload_{timestamp}.txt"
        
        with open(text_file, "w", encoding="utf-8") as f:
            f.write(text)
        
        return {
            "text_extracted": True,
            "text_length": len(text),
            "saved_to": text_file
        }
        
    except Exception as e:
        return {"processed": False, "error": str(e)}

def process_text_file(file_path: str, file_name: str) -> dict:
    """Process text files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # If it's university_info.txt, keep it in data directory
        if file_name == "university_info.txt":
            final_path = "data/university_info.txt"
        else:
            # Move to scraped_data directory
            os.makedirs("scraped_data", exist_ok=True)
            timestamp = datetime.datetime.now(pytz.timezone('Asia/Kolkata')).strftime('%Y%m%d_%H%M')
            final_path = f"scraped_data/txt_upload_{timestamp}.txt"
            
            with open(final_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        return {
            "text_length": len(content),
            "saved_to": final_path
        }
        
    except Exception as e:
        return {"processed": False, "error": str(e)}

if __name__ == "__main__":
    main()
