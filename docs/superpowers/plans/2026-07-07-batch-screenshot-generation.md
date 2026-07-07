# Batch Screenshot Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the existing screenshot generator to support batch-date filtering, then execute it for the 2026-07-06 and 2026-07-03 approval batches.

**Architecture:** Add a `--batch-dates` CLI flag to `generate_screenshots.py`. When provided, the script loads `approved_projects.json`, filters records by date, extracts their `topic_id`s, and passes that set into the existing multiprocessing pipeline. All other behavior (Playwright rendering, WebP conversion, checkpointing, error handling) remains unchanged.

**Tech Stack:** Python 3, Playwright, Pillow, multiprocessing

---

### Task 1: Create screenshots directory

**Files:**
- Create: `assets/screenshots/` (directory)

- [ ] **Step 1: Create the directory**

```bash
mkdir -p assets/screenshots
```

- [ ] **Step 2: Verify it exists**

```bash
ls -ld assets/screenshots
```

Expected: `drwxr-xr-x ... assets/screenshots`

- [ ] **Step 3: Commit**

```bash
git add assets/screenshots
git commit -m "chore: create screenshots output directory"
```

---

### Task 2: Add batch-date filtering to generate_screenshots.py

**Files:**
- Modify: `scripts/generate_screenshots.py`

- [ ] **Step 1: Add helper functions after existing constants**

Insert after line 31 (`WORKERS = ...`):

```python

def load_approved_projects():
    """Load approved_projects.json and return the records list."""
    with open(DATA_DIR / 'approved_projects.json', 'r', encoding='utf-8') as f:
        return json.load(f)


def get_topic_ids_by_dates(batch_dates):
    """Return set of topic_ids whose approval date is in batch_dates."""
    data = load_approved_projects()
    target_dates = set(batch_dates)
    return {
        r['topic_id']
        for r in data.get('records', [])
        if r.get('date') in target_dates
    }
```

- [ ] **Step 2: Modify main() to add --batch-dates argument**

Replace the `main()` function (lines 227–252) with:

```python
def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate demo screenshots')
    parser.add_argument('--limit', type=int, default=None,
                        help='Max screenshots to generate')
    parser.add_argument('--topic-id', type=int, default=None,
                        help='Generate screenshot for a single topic')
    parser.add_argument('--batch-dates', type=str, default=None,
                        help='Comma-separated approval dates (e.g. 2026-07-06,2026-07-03)')
    args = parser.parse_args()

    print("=" * 60)
    print("TRAE Demo Hall Screenshot Generator")
    print("=" * 60)

    demos_data = load_demos_data()
    print(f"Loaded {len(demos_data.get('demos', []))} demos")

    topic_ids = None
    if args.batch_dates:
        dates = [d.strip() for d in args.batch_dates.split(',')]
        topic_ids = get_topic_ids_by_dates(dates)
        print(f"Filtering by dates: {dates} -> {len(topic_ids)} topics")

    if args.topic_id:
        topic_ids = {args.topic_id}
        errors = run_batch(demos_data, topic_ids=topic_ids)
    else:
        errors = run_batch(demos_data, limit=args.limit, topic_ids=topic_ids)

    sys.exit(0 if errors == 0 else 1)
```

- [ ] **Step 3: Verify syntax**

```bash
python3 -m py_compile scripts/generate_screenshots.py
```

Expected: no output (success)

- [ ] **Step 4: Test argument parsing**

```bash
python3 scripts/generate_screenshots.py --batch-dates 2026-07-06,2026-07-03 --limit 0
```

Expected output contains:
- `Filtering by dates: ['2026-07-06', '2026-07-03'] -> 2008 topics`
- `Total screenshots to generate: 0` (because limit=0)

- [ ] **Step 5: Commit**

```bash
git add scripts/generate_screenshots.py
git commit -m "feat: add --batch-dates filter to screenshot generator"
```

---

### Task 3: Install Playwright dependencies

**Files:**
- None (system setup)

- [ ] **Step 1: Check if Playwright browsers are installed**

```bash
python3 -c "from playwright.sync_api import sync_playwright; p = sync_playwright().start(); p.chromium.launch(headless=True); p.stop(); print('OK')"
```

- [ ] **Step 2: If the above fails, install browsers**

```bash
playwright install chromium
```

Expected: Downloads and installs Chromium

---

### Task 4: Run the batch screenshot generation

**Files:**
- Modify: `data/demos.json` (screenshot fields updated)
- Create: `assets/screenshots/*.webp` (generated files)

- [ ] **Step 1: Run the generator for 2026-07-06 and 2026-07-03**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
python3 scripts/generate_screenshots.py --batch-dates 2026-07-06,2026-07-03
```

Expected: Processes ~2000 screenshots over 30–60 minutes. Output shows progress checkpoints every 100 screenshots.

- [ ] **Step 2: Verify results**

```bash
ls assets/screenshots/*.webp | wc -l
```

Expected: ~1500–2000 files (some entries have no demo or fail)

- [ ] **Step 3: Check demos.json was updated**

```bash
python3 -c "import json; d=json.load(open('data/demos.json')); print(sum(1 for x in d['demos'] if x.get('screenshot')))"
```

Expected: Number increases by the successful screenshot count.

---

### Task 5: Commit and push

**Files:**
- Modify: `data/demos.json`
- Create: `assets/screenshots/*.webp`

- [ ] **Step 1: Stage changes**

```bash
git add data/demos.json assets/screenshots/
```

- [ ] **Step 2: Commit**

```bash
git commit -m "data: generate screenshots for 2026-07-06 and 2026-07-03 batches

- Processed ~2008 approved entries from latest two batches
- Generated ~1500-2000 WebP screenshots
- Updated demos.json screenshot fields"
```

- [ ] **Step 3: Push to origin/main**

```bash
git push origin main
```

Expected: Push succeeds. GitHub Actions triggers auto-deployment.

---

## Self-Review

1. **Spec coverage:**
   - `--batch-dates` parameter ✓ (Task 2)
   - Filter by 7月6日 + 7月3日 ✓ (Task 4)
   - Skip no-demo entries ✓ (existing `get_screenshot_target` logic)
   - WebP output ✓ (existing pipeline)
   - Update demos.json ✓ (existing `save_demos_json`)
   - Commit and push ✓ (Task 5)

2. **Placeholder scan:** No TBD/TODO/"implement later" found.

3. **Type consistency:** `topic_ids` is a `set` in both the new `get_topic_ids_by_dates()` and the existing `run_batch()` signature. Consistent.
