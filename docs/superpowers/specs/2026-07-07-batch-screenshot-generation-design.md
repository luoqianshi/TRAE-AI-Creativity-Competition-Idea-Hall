# Batch Screenshot Generation Design

## Background

The TRAE AI Creativity Competition Idea Hall already has a screenshot generation pipeline (`scripts/generate_screenshots.py`) and a visual upgrade design (2026-07-06). The current task is to execute a batch screenshot run for the **latest ~2000 approved entries** from the Feishu Wiki approval list.

## Goal

Generate first-screen screenshots (as WebP) for the **2026-07-06** and **2026-07-03** batches of approved projects — approximately **2008 entries** — and update `demos.json` with the `screenshot` field.

## Data Source

- `data/approved_projects.json` — Feishu Wiki approval records, each with a `date` field
- `data/demos.json` — Full demo metadata, includes `demo_url`, `external_url`, `has_demo`

## Approach

Extend `scripts/generate_screenshots.py` with a `--batch-dates` CLI argument.

### CLI Usage

```bash
python scripts/generate_screenshots.py --batch-dates 2026-07-06,2026-07-03
```

### Behavior

1. Parse the comma-separated date list.
2. Load `approved_projects.json` and collect all `topic_id`s whose `date` matches any of the provided dates.
3. Pass this `topic_ids` set into the existing `build_work_list()` and `run_batch()` flow.
4. All other behavior (multiprocessing, checkpointing, error logging, WebP conversion) remains unchanged.

### Filtering Logic

- Skip entries where `has_demo == false` (no screenshot target).
- Skip entries where a screenshot already exists (incremental support).
- For `demo_url`: load via `file://` if the local file exists.
- For `external_url`: load via `http(s)://` if a valid URL is present.

### Output

- Screenshots saved to `assets/screenshots/{topic_id}.webp`
- `demos.json` updated with `screenshot` field for processed entries
- `data/screenshot_errors.log` appended with any failures
- `data/screenshot_progress.json` saved for resume support

## Error Handling

- **Network timeouts** (`PAGE_TIMEOUT_MS = 15000`): logged, skipped.
- **Files too large / 404**: logged, skipped.
- **Rendering failures**: logged, skipped.
- All errors are non-blocking; the batch continues.

## Performance

- Uses existing multiprocessing pool (`WORKERS = min(6, cpu_count())`).
- Checkpoint save every 100 screenshots.
- Estimated runtime: ~30–60 minutes for ~2000 screenshots.

## Post-Execution

After the batch completes:
1. Git-commit the new screenshots and updated JSON files.
2. Push to `origin/main`.
3. GitHub Actions auto-deploys to GitHub Pages.
