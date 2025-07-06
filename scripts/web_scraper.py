#!/usr/bin/env python3
import sys
import json
import os
from tavily import TavilyClient
import datetime
import pytz

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        url = data['url']
        keep_old_data = data.get('keepOldData', False)
        
        # Initialize Tavily client
        tavily_api_key = os.getenv('TAVILY_API_KEY')
        if not tavily_api_key:
            raise Exception("TAVILY_API_KEY not found")
        
        tavily_client = TavilyClient(api_key=tavily_api_key)
        
        # Create scraped_data directory
        os.makedirs("scraped_data", exist_ok=True)
        
        # Clear old data if requested
        if not keep_old_data:
            for file in os.listdir("scraped_data"):
                if file.endswith('.txt'):
                    os.remove(os.path.join("scraped_data", file))
        
        # Scrape website
        crawl_results = tavily_client.crawl(url=url, max_depth=3, extract_depth="advanced")
        
        if not crawl_results["results"]:
            raise Exception("No data scraped from the website")
        
        pages_scraped = 0
        for i, result in enumerate(crawl_results["results"]):
            content = result.get("raw_content", "")
            if content.strip():
                timestamp = datetime.datetime.now(pytz.timezone('Asia/Kolkata')).strftime('%Y%m%d_%H%M')
                file_path = f"scraped_data/page_{i+1}_{url.replace('https://', '').replace('/', '_')}_{timestamp}.txt"
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                
                pages_scraped += 1
        
        result = {
            "success": True,
            "pages": pages_scraped,
            "url": url
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "pages": 0
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
