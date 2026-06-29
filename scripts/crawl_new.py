#!/usr/bin/env python3
"""Incrementally crawl only NEW approved topics not yet in demos.json."""

import json
import re
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

PROJECT_ROOT = Path('/workspace/TRAE-AI-Creativity-Competition-Idea-Hall')
DATA_DIR = PROJECT_ROOT / 'data'
DEMOS_DIR = PROJECT_ROOT / 'demos'

# Reuse crawler_v2 functions
sys.path.insert(0, str(PROJECT_ROOT / 'crawler'))
from crawler_v2 import DemoHallCrawler

def main():
    crawler = DemoHallCrawler()
    
    # Load existing demos
    demos = crawler.load_demos()
    existing_ids = {d['topic_id'] for d in demos}
    print(f"Existing demos: {len(existing_ids)}")
    
    # Load approved projects
    with open(DATA_DIR / 'approved_projects.json', 'r', encoding='utf-8') as f:
        approved = json.load(f)
    
    # Find new approved topics not in demos
    new_topics = []
    for r in approved['records']:
        tid = int(r['topic_id'])
        if tid not in existing_ids:
            new_topics.append(r)
    
    print(f"New approved topics to process: {len(new_topics)}")
    
    if not new_topics:
        print("No new topics to process.")
        return
    
    # Process each new topic
    processed = 0
    errors = 0
    for i, r in enumerate(new_topics):
        tid = int(r['topic_id'])
        title = r.get('title', '')[:50]
        print(f"\n[{i+1}/{len(new_topics)}] Processing topic {tid}: {title}...")
        try:
            demo = crawler.fetch_discourse_topic(tid)
            if demo:
                crawler.process_topic_demo(demo)
                # Apply tag rules
                tags = crawler.apply_tag_rules(demo)
                # Generate insight
                demo['insight'] = crawler.generate_insight(demo.get('title', ''), demo.get('excerpt', ''))
                demo['approved'] = True
                demo['approved_source'] = 'lark_bitable'
                if demo not in demos:
                    demos.append(demo)
                processed += 1
                print(f"  OK: tags={tags}, has_demo={demo.get('has_demo', False)}")
            else:
                print(f"  SKIP: Could not fetch topic")
                errors += 1
            
            # Save checkpoint every 50 records
            if processed % 50 == 0:
                crawler.demos = demos
                crawler.save_demos()
                crawler.render()
                print(f"  [Checkpoint] Saved after {processed} records")
            
            time.sleep(1.5)  # Rate limiting
        except Exception as e:
            print(f"  ERROR: {e}")
            traceback.print_exc()
            errors += 1
    
    # Final save
    crawler.demos = demos
    crawler.save_demos()
    crawler.render()
    
    # Update stats
    active = [d for d in demos if not d.get('archived', False)]
    approved_count = sum(1 for d in active if d.get('approved', False))
    print(f"\n=== Done ===")
    print(f"Processed: {processed}, Errors: {errors}")
    print(f"Total demos: {len(active)}, Approved: {approved_count}")

if __name__ == '__main__':
    main()
