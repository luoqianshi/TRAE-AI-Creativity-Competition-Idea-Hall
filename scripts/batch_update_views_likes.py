#!/usr/bin/env python3
"""Batch update views and like_count using Discourse category API."""

import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
DATA_DIR = PROJECT_ROOT / 'data'
CRAWLER_DIR = PROJECT_ROOT / 'crawler'

# Load config
with open(CRAWLER_DIR / 'config.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

API_BASE = config['api_base']
CATEGORY_ID = config['category_id']
RATE_LIMIT = config['rate_limit_delay']

session = requests.Session()
session.headers.update({"User-Agent": "TRAE-Demo-Hall-Crawler/2.0"})


def fetch_all_category_topics():
    """Fetch all topics from category API with pagination."""
    all_topics = {}
    page = 0
    print("[Phase 1] Fetching topics from category API...")
    while True:
        url = f"{API_BASE}/c/{CATEGORY_ID}.json?page={page}"
        try:
            time.sleep(RATE_LIMIT)
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            topics = data.get('topic_list', {}).get('topics', [])
            if not topics:
                break
            for t in topics:
                all_topics[t['id']] = {
                    'views': t.get('views', 0),
                    'like_count': t.get('like_count', 0),
                }
            more = data.get('topic_list', {}).get('more_topics_url')
            if not more:
                break
            page += 1
            if page % 50 == 0:
                print(f"  Page {page}, collected: {len(all_topics)}")
        except Exception as e:
            print(f"  Error on page {page}: {e}")
            break
    print(f"  Total from category API: {len(all_topics)} topics ({page + 1} pages)")
    return all_topics


def update_demos_json(topic_data):
    """Update demos.json with fetched views/like_count."""
    demos_json_path = DATA_DIR / 'demos.json'
    with open(demos_json_path, 'r', encoding='utf-8') as f:
        demos_data = json.load(f)

    updated = 0
    missing = 0
    for demo in demos_data.get('demos', []):
        tid = demo['topic_id']
        if tid in topic_data:
            demo['views'] = topic_data[tid]['views']
            demo['like_count'] = topic_data[tid]['like_count']
            updated += 1
        else:
            missing += 1

    demos_data['last_updated'] = datetime.now(timezone.utc).isoformat()
    with open(demos_json_path, 'w', encoding='utf-8') as f:
        json.dump(demos_data, f, ensure_ascii=False, indent=2)
    print(f"[Phase 2] Updated {updated} demos, {missing} not found in category API")
    return updated


def render_demos_min_js():
    """Regenerate demos.min.js from demos.json."""
    demos_json_path = DATA_DIR / 'demos.json'
    with open(demos_json_path, 'r', encoding='utf-8') as f:
        demos_data = json.load(f)

    active = [d for d in demos_data.get('demos', []) if not d.get('archived', False)]
    frontend_demos = []
    for d in active:
        raw_excerpt = d.get('excerpt', '') or ''
        clean_excerpt = re.sub(r'<[^>]+>', '', raw_excerpt)
        clean_excerpt = re.sub(r'&nbsp;?', ' ', clean_excerpt, flags=re.IGNORECASE)
        clean_excerpt = re.sub(r'&(amp|lt|gt|quot|apos|#\d+|\w+);', '', clean_excerpt)
        clean_excerpt = re.sub(r'\s{3,}', ' ', clean_excerpt).strip()

        if not clean_excerpt:
            clean_title = re.sub(r'<[^>]+>', '', d.get('title', ''))
            clean_excerpt = clean_title[:200] if len(clean_title) > 20 else clean_title

        insight = (d.get('insight', '') or '').strip()
        if not insight:
            insight = clean_excerpt[:200] or d.get('title', '')[:200]

        frontend_demos.append({
            'topic_id': d['topic_id'],
            'title': re.sub(r'<[^>]+>', '', d.get('title', '')),
            'insight': insight,
            'tags': d.get('tags', []),
            'views': d.get('views', 0),
            'like_count': d.get('like_count', 0),
            'author': d.get('author', 'unknown'),
            'created_at': d.get('created_at', ''),
            'demo_url': d.get('demo_url'),
            'external_url': d.get('external_url'),
            'has_demo': d.get('has_demo', False),
            'approved': d.get('approved', False),
        })

    demos_min_js_path = DATA_DIR / 'demos.min.js'
    with open(demos_min_js_path, 'w', encoding='utf-8') as f:
        f.write('window.DEMOS_DATA = ')
        json.dump(frontend_demos, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')
    print(f"[Phase 3] Generated demos.min.js with {len(frontend_demos)} records")


def render_index_html():
    """Render index.html from template."""
    sys.path.insert(0, str(CRAWLER_DIR))
    from crawler_v2 import DemoHallCrawler
    crawler = DemoHallCrawler()
    crawler.render()
    print("[Phase 4] Rendered index.html successfully")


def main():
    print("=" * 60)
    print("Batch Update Views & Like Count")
    print(f"Started at: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    topic_data = fetch_all_category_topics()
    updated = update_demos_json(topic_data)
    render_demos_min_js()
    render_index_html()

    print("\n[Done] All phases completed!")
    print(f"Finished at: {datetime.now(timezone.utc).isoformat()}")
    return updated


if __name__ == '__main__':
    main()
