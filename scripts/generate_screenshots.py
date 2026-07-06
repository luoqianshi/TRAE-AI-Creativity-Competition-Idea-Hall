#!/usr/bin/env python3
"""Generate screenshot thumbnails for all demos with HTML files.

Uses Playwright to load each demo's HTML file, capture the first screen,
and save as WebP format in assets/screenshots/{topic_id}.webp.

Supports incremental processing (skips existing screenshots) and
checkpoint resume (saves progress every 100 items).
"""

import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
DATA_DIR = PROJECT_ROOT / 'data'
SCREENSHOTS_DIR = PROJECT_ROOT / 'assets' / 'screenshots'
DEMOS_DIR = PROJECT_ROOT / 'demos'
PROGRESS_FILE = DATA_DIR / 'screenshot_progress.json'
ERROR_LOG = DATA_DIR / 'screenshot_errors.log'

# Configuration
VIEWPORT_WIDTH = 1280
VIEWPORT_HEIGHT = 800
PAGE_TIMEOUT_MS = 15000
RENDER_WAIT_MS = 1500
CHECKPOINT_INTERVAL = 100


def load_demos_data():
    """Load demos.json and return the demos list."""
    with open(DATA_DIR / 'demos.json', 'r', encoding='utf-8') as f:
        return json.load(f)


def get_screenshot_target(demo):
    """Determine the URL to load for screenshotting.

    Returns:
        (url, source_type) tuple where source_type is 'file' or 'http'.
        Returns (None, None) if no screenshotable content exists.
    """
    if not demo.get('has_demo'):
        return None, None

    demo_url = demo.get('demo_url')
    if demo_url:
        # Local file - convert relative path to file:// URL
        local_path = PROJECT_ROOT / demo_url
        if local_path.exists():
            return local_path.resolve().as_uri(), 'file'
        return None, None

    external_url = demo.get('external_url')
    if external_url:
        parsed = urlparse(external_url)
        if parsed.scheme in ('http', 'https'):
            return external_url, 'http'
        return None, None

    return None, None


def screenshot_exists(topic_id):
    """Check if screenshot file already exists."""
    return (SCREENSHOTS_DIR / f'{topic_id}.webp').exists()


def generate_single_screenshot(page, demo):
    """Generate screenshot for a single demo using an existing page.

    Args:
        page: Playwright Page object (already created).
        demo: Demo record dict from demos.json.

    Returns:
        'success' if screenshot saved, 'skipped' if already exists,
        'no_target' if no screenshotable content, 'error' if failed.
    """
    topic_id = demo['topic_id']

    if screenshot_exists(topic_id):
        return 'skipped'

    url, source_type = get_screenshot_target(demo)
    if not url:
        return 'no_target'

    try:
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
        # Convert jpeg to webp using PIL
        from PIL import Image
        img = Image.open(jpeg_path)
        img.save(webp_path, 'webp', quality=75, method=6)
        img.close()
        jpeg_path.unlink()  # Remove temporary jpeg
        return 'success'
    except Exception as e:
        with open(ERROR_LOG, 'a', encoding='utf-8') as f:
            f.write(f'{topic_id}: {str(e)}\n')
        return 'error'


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


def run_batch(demos_data, limit=None, topic_ids=None):
    """Run screenshot generation for all demos needing screenshots.

    Args:
        demos_data: Loaded demos.json data.
        limit: Optional max number of screenshots to generate.
        topic_ids: Optional set of specific topic_ids to process.
    """
    from playwright.sync_api import sync_playwright

    # Build work list
    work_items = []
    for demo in demos_data.get('demos', []):
        tid = demo['topic_id']
        if topic_ids and tid not in topic_ids:
            # Still mark screenshot field if exists
            if screenshot_exists(tid):
                demo['screenshot'] = f'assets/screenshots/{tid}.webp'
            else:
                demo['screenshot'] = None
            continue
        if screenshot_exists(tid):
            demo['screenshot'] = f'assets/screenshots/{tid}.webp'
            continue
        url, source_type = get_screenshot_target(demo)
        if url:
            work_items.append(demo)
        else:
            demo['screenshot'] = None

    if limit:
        work_items = work_items[:limit]

    print(f"Total screenshots to generate: {len(work_items)}")
    if not work_items:
        print("All screenshots already exist. Nothing to do.")
        return 0

    processed = 0
    errors = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT}
        )

        for i, demo in enumerate(work_items):
            tid = demo['topic_id']
            print(f"  [{i+1}/{len(work_items)}] Screenshotting topic {tid}...", flush=True)

            page = context.new_page()
            result = generate_single_screenshot(page, demo)
            page.close()

            if result == 'success':
                demo['screenshot'] = f'assets/screenshots/{tid}.webp'
                processed += 1
            elif result == 'error':
                demo['screenshot'] = None
                errors += 1
            elif result == 'skipped':
                demo['screenshot'] = f'assets/screenshots/{tid}.webp'
            elif result == 'no_target':
                demo['screenshot'] = None

            # Checkpoint save
            if (i + 1) % CHECKPOINT_INTERVAL == 0:
                save_demos_json(demos_data)
                save_progress(processed, errors, i + 1, len(work_items))
                print(f"  [Checkpoint] Saved. Processed: {processed}, Errors: {errors}")

        context.close()
        browser.close()

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
