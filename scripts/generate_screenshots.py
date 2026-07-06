#!/usr/bin/env python3
"""Generate screenshot thumbnails for all demos with HTML files.

Uses Playwright to load each demo's HTML file, capture the first screen,
and save as WebP format in assets/screenshots/{topic_id}.webp.

Supports incremental processing (skips existing screenshots),
checkpoint resume, and concurrent processing via multiprocessing.
"""

import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse
from multiprocessing import Pool, cpu_count

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
DATA_DIR = PROJECT_ROOT / 'data'
SCREENSHOTS_DIR = PROJECT_ROOT / 'assets' / 'screenshots'
PROGRESS_FILE = DATA_DIR / 'screenshot_progress.json'
ERROR_LOG = DATA_DIR / 'screenshot_errors.log'

# Configuration
VIEWPORT_WIDTH = 1280
VIEWPORT_HEIGHT = 800
PAGE_TIMEOUT_MS = 15000
RENDER_WAIT_MS = 1500
CHECKPOINT_INTERVAL = 100
WORKERS = min(6, cpu_count())  # Use up to 6 workers


def load_demos_data():
    """Load demos.json and return the demos list."""
    with open(DATA_DIR / 'demos.json', 'r', encoding='utf-8') as f:
        return json.load(f)


def get_screenshot_target(demo):
    """Determine the URL to load for screenshotting."""
    if not demo.get('has_demo'):
        return None

    demo_url = demo.get('demo_url')
    if demo_url:
        local_path = PROJECT_ROOT / demo_url
        if local_path.exists():
            return local_path.resolve().as_uri()
        return None

    external_url = demo.get('external_url')
    if external_url:
        parsed = urlparse(external_url)
        if parsed.scheme in ('http', 'https'):
            return external_url
        return None

    return None


def screenshot_exists(topic_id):
    """Check if screenshot file already exists."""
    return (SCREENSHOTS_DIR / f'{topic_id}.webp').exists()


def process_chunk(chunk_data):
    """Process a chunk of demos in a separate process.

    Each worker gets its own Playwright browser instance.
    Returns list of (topic_id, status, screenshot_path) tuples.
    """
    from playwright.sync_api import sync_playwright

    chunk, worker_id = chunk_data
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT}
        )

        for demo in chunk:
            topic_id = demo['topic_id']

            if screenshot_exists(topic_id):
                results.append((topic_id, 'skipped', f'assets/screenshots/{topic_id}.webp'))
                continue

            url = get_screenshot_target(demo)
            if not url:
                results.append((topic_id, 'no_target', None))
                continue

            try:
                page = context.new_page()
                page.goto(url, wait_until='networkidle', timeout=PAGE_TIMEOUT_MS)
                page.wait_for_timeout(RENDER_WAIT_MS)
                jpeg_path = SCREENSHOTS_DIR / f'{topic_id}.jpg'
                webp_path = SCREENSHOTS_DIR / f'{topic_id}.webp'
                page.screenshot(
                    path=str(jpeg_path),
                    type='jpeg',
                    quality=75,
                    clip={'x': 0, 'y': 0, 'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT}
                )
                page.close()

                # Convert jpeg to webp using PIL
                from PIL import Image
                img = Image.open(jpeg_path)
                img.save(webp_path, 'webp', quality=75, method=6)
                img.close()
                jpeg_path.unlink()

                results.append((topic_id, 'success', f'assets/screenshots/{topic_id}.webp'))
            except Exception as e:
                with open(ERROR_LOG, 'a', encoding='utf-8') as f:
                    f.write(f'{topic_id}: {str(e)}\n')
                results.append((topic_id, 'error', None))

        context.close()
        browser.close()

    return results


def save_demos_json(demos_data):
    """Save updated demos.json with screenshot fields."""
    with open(DATA_DIR / 'demos.json', 'w', encoding='utf-8') as f:
        json.dump(demos_data, f, ensure_ascii=False, indent=2)


def save_progress(processed, errors, current, total):
    """Save progress for resume capability."""
    progress = {
        'processed': processed,
        'errors': errors,
        'current': current,
        'total': total,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S')
    }
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2)


def build_work_list(demos_data, limit=None, topic_ids=None):
    """Build the list of demos that need screenshotting."""
    work_items = []
    for demo in demos_data.get('demos', []):
        tid = demo['topic_id']
        if topic_ids and tid not in topic_ids:
            if screenshot_exists(tid):
                demo['screenshot'] = f'assets/screenshots/{tid}.webp'
            else:
                demo['screenshot'] = None
            continue
        if screenshot_exists(tid):
            demo['screenshot'] = f'assets/screenshots/{tid}.webp'
            continue
        url = get_screenshot_target(demo)
        if url:
            work_items.append(demo)
        else:
            demo['screenshot'] = None

    if limit:
        work_items = work_items[:limit]

    return work_items


def run_batch(demos_data, limit=None, topic_ids=None):
    """Run screenshot generation using multiprocessing."""
    work_items = build_work_list(demos_data, limit, topic_ids)

    print(f"Total screenshots to generate: {len(work_items)}")
    print(f"Using {WORKERS} parallel workers")
    if not work_items:
        print("All screenshots already exist. Nothing to do.")
        return 0

    # Split work into chunks for each worker
    chunk_size = max(1, len(work_items) // WORKERS)
    chunks = []
    for i in range(0, len(work_items), chunk_size):
        chunk = work_items[i:i + chunk_size]
        chunks.append((chunk, i // chunk_size))

    processed = 0
    errors = 0
    completed = 0

    # Create demo lookup for fast updates
    demo_by_id = {d['topic_id']: d for d in demos_data.get('demos', [])}

    with Pool(processes=WORKERS) as pool:
        for result_list in pool.imap_unordered(process_chunk, chunks):
            for topic_id, status, screenshot_path in result_list:
                demo = demo_by_id.get(topic_id)
                if demo:
                    demo['screenshot'] = screenshot_path

                if status == 'success':
                    processed += 1
                elif status == 'error':
                    errors += 1

                completed += 1

                # Checkpoint save
                if completed % CHECKPOINT_INTERVAL == 0:
                    save_demos_json(demos_data)
                    save_progress(processed, errors, completed, len(work_items))
                    print(f"  [Checkpoint {completed}/{len(work_items)}] "
                          f"Processed: {processed}, Errors: {errors}", flush=True)

    # Final save
    save_demos_json(demos_data)
    save_progress(processed, errors, len(work_items), len(work_items))

    print(f"\nDone! Screenshots generated: {processed}, Errors: {errors}")
    return errors


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate demo screenshots')
    parser.add_argument('--limit', type=int, default=None,
                        help='Max screenshots to generate')
    parser.add_argument('--topic-id', type=int, default=None,
                        help='Generate screenshot for a single topic')
    args = parser.parse_args()

    print("=" * 60)
    print("TRAE Demo Hall Screenshot Generator")
    print("=" * 60)

    demos_data = load_demos_data()
    print(f"Loaded {len(demos_data.get('demos', []))} demos")

    if args.topic_id:
        topic_ids = {args.topic_id}
        errors = run_batch(demos_data, topic_ids=topic_ids)
    else:
        errors = run_batch(demos_data, limit=args.limit)

    sys.exit(0 if errors == 0 else 1)


if __name__ == '__main__':
    main()
