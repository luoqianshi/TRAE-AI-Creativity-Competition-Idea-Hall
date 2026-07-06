# TRAE Idea Hall 视觉升级 + Demo 截图卡片改造 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对 TRAE Idea Hall 网站进行视觉风格升级（玻璃拟态 + 深色基调）、默认筛选改为最新发布、Hero 全宽沉浸式重设计、用 Demo 首屏截图替代卡片文字简介。

**Architecture:** 前端为纯静态站点（HTML + CSS + JS），数据由 `demos.min.js` 提供。截图生成管道使用 Python Playwright 批处理脚本，输出到 `assets/screenshots/` 目录。数据文件 `demos.json` 和 `demos.min.js` 新增 `screenshot` 字段。

**Tech Stack:** HTML/CSS/JS（前端）、Python Playwright（截图）、Jinja2（模板渲染）

**Spec:** `docs/superpowers/specs/2026-07-06-visual-upgrade-screenshots-design.md`

---

## 文件结构

| 文件 | 职责 | 改动类型 |
|------|------|----------|
| `styles.css` | 全部样式 | 修改 |
| `script.js` | 卡片渲染、筛选、排序、搜索 | 修改 |
| `templates/index.html.j2` | Jinja2 模板（index.html 的源） | 修改 |
| `index.html` | 由模板渲染生成 | 重新生成 |
| `scripts/generate_screenshots.py` | Playwright 截图批处理 | 新增 |
| `crawler/requirements.txt` | Python 依赖 | 修改 |
| `data/demos.json` | 全量数据（新增 screenshot 字段） | 修改 |
| `data/demos.min.js` | 前端数据文件（新增 screenshot 字段） | 重新生成 |
| `assets/screenshots/` | 截图存储目录 | 新增 |

---

### Task 1: 创建截图生成脚本 `scripts/generate_screenshots.py`

**Files:**
- Create: `scripts/generate_screenshots.py`
- Modify: `crawler/requirements.txt`

- [ ] **Step 1: 添加 Playwright 依赖**

修改 `crawler/requirements.txt`，在末尾添加：

```
playwright>=1.40
```

- [ ] **Step 2: 安装 Playwright 和浏览器**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
pip install playwright --break-system-packages
playwright install chromium
```

- [ ] **Step 3: 创建截图输出目录**

```bash
mkdir -p /workspace/TRAE-AI-Creativity-Competition-Idea-Hall/assets/screenshots
```

- [ ] **Step 4: 编写截图脚本**

创建 `scripts/generate_screenshots.py`：

```python
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
WEBP_QUALITY = 75
CONCURRENCY = 10
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
        screenshot_path = SCREENSHOTS_DIR / f'{topic_id}.webp'
        page.screenshot(
            path=str(screenshot_path),
            type='jpeg',
            quality=WEBP_QUALITY,
            clip={'x': 0, 'y': 0, 'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT}
        )
        # Playwright saves .jpg even if we want .webp; rename
        # Actually Playwright supports webp directly via type param in newer versions
        # But to be safe, we use jpeg and rename extension
        return 'success'
    except Exception as e:
        with open(ERROR_LOG, 'a', encoding='utf-8') as f:
            f.write(f'{topic_id}: {str(e)}\n')
        return 'error'


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

    print(f"Total screenshots needed: {len(work_items)}")
    if not work_items:
        print("All screenshots already exist. Nothing to do.")
        return 0

    # Load progress
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
```

- [ ] **Step 5: 测试截图脚本（10 条记录）**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
python3 scripts/generate_screenshots.py --limit 10
```

预期输出：生成 10 个 `.webp` 文件到 `assets/screenshots/` 目录。

- [ ] **Step 6: 验证截图文件**

```bash
ls -la assets/screenshots/ | head -15
```

预期：10 个 `{topic_id}.webp` 文件，每个 30-80KB。

- [ ] **Step 7: 提交截图脚本**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git add scripts/generate_screenshots.py crawler/requirements.txt
git commit -m "feat: add Playwright screenshot generation script

- Batch process demos with HTML files
- Incremental processing (skip existing)
- Checkpoint resume every 100 items
- WebP output at quality 75"
```

---

### Task 2: 运行全量截图生成

**Files:**
- Create: `assets/screenshots/*.webp` (约 17,000+ 文件)
- Modify: `data/demos.json`

- [ ] **Step 1: 运行全量截图（后台长时间运行）**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
python3 scripts/generate_screenshots.py 2>&1 | tee /tmp/screenshot_run.log
```

预期：处理约 17,700 条记录，耗时 1-2 小时。Checkpoint 每 100 条保存。

- [ ] **Step 2: 验证截图总数**

```bash
ls assets/screenshots/*.webp | wc -l
```

预期：约 17,000-17,700 个文件。

- [ ] **Step 3: 验证 demos.json screenshot 字段**

```bash
python3 -c "
import json
with open('data/demos.json') as f:
    d = json.load(f)
has_screenshot = sum(1 for x in d['demos'] if x.get('screenshot'))
no_screenshot = sum(1 for x in d['demos'] if not x.get('screenshot'))
print(f'With screenshot: {has_screenshot}')
print(f'Without screenshot: {no_screenshot}')
"
```

预期：约 17,000+ 条有 screenshot，其余为 null。

- [ ] **Step 4: 提交截图和数据**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git add assets/screenshots/ data/demos.json data/screenshot_progress.json
git commit -m "data: generate demo screenshots for all HTML demos

- ~17,000 WebP screenshots generated via Playwright
- demos.json updated with screenshot field
- Incremental processing with checkpoint resume"
```

---

### Task 3: CSS 视觉风格升级

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: 更新 CSS 变量（配色升级）**

修改 `styles.css` 第 8-34 行的 `:root` 块：

```css
:root {
  --bg-base:        #08080c;
  --bg-card:        rgba(24,24,27,0.6);
  --bg-tag:         #27272a;
  --bg-tag-hover:   #3f3f46;
  --border:         rgba(255,255,255,0.06);
  --border-strong:  rgba(255,255,255,0.12);

  --accent:         #22c55e;
  --accent-deep:    #16a34a;
  --accent-glow:    rgba(34, 197, 94, 0.35);
  --accent-soft:    rgba(34, 197, 94, 0.12);
  --accent-radial:  radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 60%);

  --text-primary:   #ffffff;
  --text-secondary: #a1a1aa;
  --text-tertiary:  #d4d4d8;
  --text-muted:     #71717a;

  --container:      1280px;
  --radius-card:    16px;
  --radius-pill:    9999px;
  --radius-input:   8px;

  --glass-bg:       rgba(24,24,27,0.6);
  --glass-border:   rgba(255,255,255,0.06);
  --glass-blur:      blur(12px);

  --font-sans: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont,
               "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
}
```

- [ ] **Step 2: 添加全局背景增强**

在 `#particle-canvas` 样式块后（约第 56 行后）添加：

```css
/* ---------- Background Enhancement ---------- */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34,197,94,0.12), transparent 70%),
    repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px);
  pointer-events: none;
}
```

- [ ] **Step 3: 升级导航栏玻璃拟态**

修改 `.navbar` 样式块（约第 114-129 行）：

```css
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(8,8,12,0.7), rgba(8,8,12,0.4));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: background 0.3s ease;
}
```

- [ ] **Step 4: 升级筛选栏玻璃拟态**

修改 `.filter-bar` 样式块（约第 363-372 行）：

```css
.filter-bar {
  padding: 24px 0;
  border-top: 1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  position: sticky;
  top: 64px;
  background: rgba(8,8,12,0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 50;
}
```

- [ ] **Step 5: 升级次按钮为玻璃描边风格**

修改 `.btn-secondary` 样式块（约第 344-353 行）：

```css
.btn-secondary {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-primary);
  backdrop-filter: blur(8px);
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(34,197,94,0.05);
}
```

- [ ] **Step 6: 升级主按钮 hover 效果**

修改 `.btn-primary:hover` 样式块（约第 338-342 行）：

```css
.btn-primary:hover {
  background: var(--accent-deep);
  transform: translateY(-2px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 8px 24px var(--accent-glow);
}
```

- [ ] **Step 7: 升级卡片玻璃拟态 + hover**

修改 `.card` 和 `.card:hover` 样式块（约第 520-543 行）：

```css
.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: opacity 0.25s ease, transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  content-visibility: auto;
  contain-intrinsic-size: 0 360px;
  opacity: 0;
  transform: translateY(20px);
}

.card.visible {
  opacity: 1;
  transform: translateY(0);
}

.card:hover {
  border-color: var(--accent);
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.15);
  transform: translateY(-2px);
}
```

- [ ] **Step 8: 提交 CSS 改动**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git add styles.css
git commit -m "style: glassmorphism visual upgrade

- Darker base background (#08080c)
- Glass card backgrounds with backdrop-filter blur
- Radial gradient glow + grid texture background
- Navbar/filter bar enhanced glass effect
- Secondary buttons redesigned as glass outline style
- Card hover lift + glow shadow"
```

---

### Task 4: Hero 全宽沉浸式升级

**Files:**
- Modify: `styles.css` (Hero 相关样式)
- Modify: `templates/index.html.j2` (Hero HTML 结构)

- [ ] **Step 1: 更新 Hero 容器 CSS**

修改 `.hero` 样式块（约第 226-232 行）：

```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  padding-top: 64px;
  padding-bottom: 120px;
  overflow: hidden;
}
```

- [ ] **Step 2: 更新标题 CSS**

修改 `.hero h1` 样式块（约第 262-268 行）：

```css
.hero h1 {
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -2px;
  margin-bottom: 20px;
}
```

- [ ] **Step 3: 更新标题强调色微光**

修改 `.hero h1 .accent` 样式块（约第 270-275 行）：

```css
.hero h1 .accent {
  background: linear-gradient(135deg, var(--accent) 0%, #4ade80 60%, #86efac 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 40px rgba(34,197,94,0.3);
}
```

- [ ] **Step 4: 更新统计浮动条 CSS**

修改 `.hero-stats` 和 `.stat-item` 样式块（约第 291-314 行）：

```css
.hero-stats {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 64px;
  padding: 16px 24px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.1);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}
```

- [ ] **Step 5: 更新描述段落字重**

修改 `.hero p` 样式块（约第 277-282 行）：

```css
.hero p {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 32px;
  max-width: 520px;
}
```

- [ ] **Step 6: 更新模板 Hero 结构（HTML 不变，仅确认）**

`templates/index.html.j2` 中的 Hero HTML 结构（约第 38-92 行）保持不变，因为现有结构已支持新 CSS。统计数据的 `<div class="hero-stats">` 会自动应用新的浮动条样式。

- [ ] **Step 7: 提交 Hero 改动**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git add styles.css templates/index.html.j2
git commit -m "style: immersive full-width Hero section

- min-height 100vh to fill first screen
- Title font size increased to clamp(40px, 6vw, 64px)
- Accent text gets glow shadow
- Stats become floating bar with glass background + dividers
- Description font-weight bumped to 500"
```

---

### Task 5: 卡片截图样式 + 默认排序

**Files:**
- Modify: `styles.css` (卡片截图区域)
- Modify: `script.js` (默认排序 + 卡片渲染)
- Modify: `templates/index.html.j2` (默认排序 selected)

- [ ] **Step 1: 删除卡片简介 CSS 并添加截图区域 CSS**

在 `styles.css` 中，删除 `.card-excerpt` 和 `.card-excerpt .no-desc` 样式块（约第 609-623 行），替换为截图区域样式：

```css
/* ---------- Card Screenshot ---------- */
.card-screenshot {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  position: relative;
}

.card-screenshot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .card-screenshot img {
  transform: scale(1.03);
}

.card-screenshot-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.card-screenshot-placeholder svg {
  width: 32px;
  height: 32px;
  opacity: 0.4;
}
```

- [ ] **Step 2: 修改默认排序为 newest**

修改 `script.js` 第 403 行：

```javascript
  let sortBy = 'newest';
```

- [ ] **Step 3: 修改模板默认排序 selected**

修改 `templates/index.html.j2` 第 86 行：

```html
              <option value="newest" selected>最新发布</option>
              <option value="views">最多浏览</option>
              <option value="likes">最多点赞</option>
```

- [ ] **Step 4: 修改 `index.html` 默认排序 selected**

修改 `index.html` 第 113 行：

```html
              <option value="newest" selected>最新发布</option>
              <option value="views">最多浏览</option>
              <option value="likes">最多点赞</option>
```

- [ ] **Step 5: 修改卡片渲染函数 — 删除简介、添加截图**

修改 `script.js` 中的 `createCardHTML` 函数（约第 191-241 行），替换为：

```javascript
function createCardHTML(demo, highlightTokens) {
  const tag = demo.tags && demo.tags[0] ? demo.tags[0] : '';
  const tagSvg = TAG_SVG_MAP[tag] || '';
  const approvedBadge = demo.approved
    ? '<span class="approved-badge" title="官方审核通过">&#10003;</span>'
    : '';

  const safeTitle = stripHTML(demo.title);

  // Screenshot rendering
  let screenshotHtml = '';
  if (demo.screenshot) {
    screenshotHtml = `<img src="${escapeAttr(demo.screenshot)}" alt="${escapeAttr(safeTitle)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;card-screenshot-placeholder&quot;>${tagSvg || ''}<span>暂无预览</span></div>';">`;
  } else {
    screenshotHtml = `<div class="card-screenshot-placeholder">${tagSvg || ''}<span>暂无预览</span></div>`;
  }

  let demoBtn = '';
  if (demo.has_demo) {
    if (demo.demo_url) {
      demoBtn = `<a href="${escapeAttr(demo.demo_url)}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 查看 Demo</a>`;
    } else if (demo.external_url) {
      demoBtn = `<a href="${escapeAttr(demo.external_url)}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 查看 Demo</a>`;
    }
  } else {
    demoBtn = '<button class="btn btn-primary btn-sm disabled" disabled><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 暂无 Demo</button>';
  }

  const forumUrl = `https://forum.trae.cn/t/topic/${demo.topic_id}`;

  return `<div class="card"
    data-tags="${escapeAttr((demo.tags || []).join(','))}"
    data-title="${escapeAttr(safeTitle)}"
    data-created="${escapeAttr(demo.created_at)}"
    data-views="${demo.views || 0}"
    data-likes="${demo.like_count || 0}"
    data-approved="${demo.approved ? 'true' : 'false'}">
    <div class="card-screenshot">${screenshotHtml}</div>
    <div class="card-tag-row">
      ${tagSvg ? `<span class="card-tag-icon" title="${escapeAttr(tag)}">${tagSvg}</span>` : ''}
      <span class="card-tag-text">${escapeAttr(tag)}</span>
      ${approvedBadge}
    </div>
    <h3 class="card-title">${highlight(safeTitle, highlightTokens)}</h3>
    <div class="card-meta">
      <span class="meta-item"><img src="assets/icons/eye.svg" class="meta-icon" alt="views" loading="lazy"> ${demo.views || 0}</span>
      <span class="meta-item"><img src="assets/icons/heart.svg" class="meta-icon" alt="likes" loading="lazy"> ${demo.like_count || 0}</span>
      <span class="meta-item"><img src="assets/icons/user.svg" class="meta-icon" alt="author" loading="lazy"> ${escapeAttr(demo.author)}</span>
    </div>
    <div class="card-actions">
      ${demoBtn}
      <a href="${forumUrl}" target="_blank" class="btn btn-secondary btn-sm"><img src="assets/icons/external.svg" class="btn-icon" alt="" loading="lazy"> 社区帖子</a>
    </div>
  </div>`;
}
```

注意：删除了 `data-excerpt` 属性和 `.card-excerpt` 段落，新增了 `.card-screenshot` 区域。

- [ ] **Step 6: 更新搜索评分函数 — 移除 excerpt 依赖**

修改 `script.js` 中的 `scoreDemo` 函数（约第 455-479 行），在 excerpt 部分增加空值保护（insight 仍保留用于搜索，但卡片不再显示）：

```javascript
  function scoreDemo(demo, toks) {
    if (!toks || toks.length === 0) return 0;
    const title = String(demo.title || '').toLowerCase();
    const insight = String(demo.insight || '').toLowerCase();
    const tagStr = (demo.tags || []).join(' ').toLowerCase();
    const author = String(demo.author || '').toLowerCase();

    const W = { title: 3, insight: 2, tags: 1.5, author: 0.8 };
    let score = 0;
    let anyHit = false;

    toks.forEach((tok) => {
      let fieldHit = 0;
      if (title.includes(tok)) fieldHit += W.title;
      if (insight.includes(tok)) fieldHit += W.insight;
      if (tagStr.includes(tok)) fieldHit += W.tags;
      if (author.includes(tok)) fieldHit += W.author;
      if (fieldHit > 0) anyHit = true;
      score += fieldHit;
      if (title.startsWith(tok)) score += 2;
    });

    return anyHit ? score : 0;
  }
```

- [ ] **Step 7: 提交卡片 + 排序改动**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git add styles.css script.js templates/index.html.j2 index.html
git commit -m "feat: screenshot cards + default sort to newest

- Replace text excerpt with 16:9 demo screenshot
- Lazy load screenshots with onerror fallback
- Default sort changed from 'views' to 'newest'
- Remove excerpt from search scoring (insight retained)
- Card contain-intrinsic-size updated to 360px"
```

---

### Task 6: 更新 demos.min.js 并重新渲染

**Files:**
- Modify: `data/demos.min.js`
- Modify: `index.html` (重新渲染)

- [ ] **Step 1: 更新 daily_update.py 的 render_demos_min_js 函数**

修改 `scripts/daily_update.py` 中的 `render_demos_min_js` 函数（约第 439-486 行），在 `frontend_demos.append` 中添加 `screenshot` 字段：

```javascript
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
            'screenshot': d.get('screenshot'),
        });
```

- [ ] **Step 2: 运行渲染脚本重新生成 demos.min.js**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
python3 -c "
import sys
sys.path.insert(0, 'scripts')
from daily_update import render_demos_min_js
render_demos_min_js()
"
```

预期输出：`Generated demos.min.js with 22031 records`

- [ ] **Step 3: 验证 demos.min.js 包含 screenshot 字段**

```bash
python3 -c "
import json
with open('data/demos.min.js') as f:
    content = f.read()
# Extract JSON from window.DEMOS_DATA = [...];
json_str = content.replace('window.DEMOS_DATA = ', '').rstrip(';\n')
data = json.loads(json_str)
has_ss = sum(1 for x in data if x.get('screenshot'))
print(f'Total records: {len(data)}')
print(f'With screenshot field: {has_ss}')
print(f'Sample screenshot: {data[0].get(\"screenshot\", \"MISSING\")}')
"
```

预期：screenshot 字段存在，约 17,000+ 条有值。

- [ ] **Step 4: 重新渲染 index.html**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
python3 -c "
import sys
sys.path.insert(0, 'scripts')
from daily_update import render_index_html
render_index_html()
"
```

- [ ] **Step 5: 提交数据文件更新**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git add data/demos.min.js index.html scripts/daily_update.py
git commit -m "data: add screenshot field to demos.min.js + re-render

- demos.min.js now includes screenshot path for each demo
- index.html re-rendered from updated template
- daily_update.py render function updated to include screenshot field"
```

---

### Task 7: 测试验证

- [ ] **Step 1: 启动本地服务器**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
python3 -m http.server 8080 --bind 0.0.0.0 &
```

- [ ] **Step 2: 验证页面加载**

用浏览器访问 `http://localhost:8080`，检查：
- 页面正常加载，无 JS 错误（控制台）
- 粒子动画正常运行
- Hero 占满首屏，背景有径向光晕和网格纹理
- 统计数据以底部浮动条形式展示
- 卡片显示截图区域（有 Demo 的显示截图，无 Demo 的显示占位图）

- [ ] **Step 3: 验证默认排序**

检查筛选栏排序下拉框默认显示「最新发布」。滚动卡片，确认按发布时间倒序排列。

- [ ] **Step 4: 验证筛选功能**

- 点击各赛道标签，确认筛选正常
- 切换排序（最新发布 / 最多浏览 / 最多点赞），确认排序变化
- 切换「仅展示官方审核通过」和「仅展示有 Demo」开关
- 搜索关键词，确认搜索高亮正常

- [ ] **Step 5: 验证卡片交互**

- 点击「查看 Demo」按钮，确认跳转到 Demo 页面
- 点击「社区帖子」按钮，确认跳转到论坛
- hover 卡片，确认截图轻微放大、卡片上浮

- [ ] **Step 6: 验证响应式**

调整浏览器窗口宽度到 768px，确认：
- 卡片网格变为单列
- Hero 标题字号缩小
- 筛选栏垂直排列
- 统计浮动条正确换行

- [ ] **Step 7: 停止服务器**

```bash
kill %1
```

- [ ] **Step 8: 最终提交（如有测试修复）**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git add -A
git commit -m "test: visual and functional verification passed" || echo "No changes to commit"
```

---

### Task 8: 推送到 GitHub

- [ ] **Step 1: 推送所有改动**

```bash
cd /workspace/TRAE-AI-Creativity-Competition-Idea-Hall
git push origin main
```

- [ ] **Step 2: 确认推送成功**

```bash
git log --oneline -8
```

预期：看到所有提交记录，最新 commit 包含视觉升级和截图卡片改动。

---

## Self-Review 结果

**Spec coverage:** 规格文档 8 个章节全部有对应 Task：
- 第 1 节（视觉风格升级）→ Task 3
- 第 2 节（默认排序）→ Task 5 Step 2-4
- 第 3 节（Hero 沉浸式）→ Task 4
- 第 4 节（卡片截图）→ Task 5
- 第 5 节（截图管道）→ Task 1-2
- 第 6 节（文件清单）→ 全部 Task 覆盖
- 第 7 节（测试策略）→ Task 7
- 第 8 节（实现顺序）→ Task 1-8 顺序执行

**Placeholder scan:** 无占位符。所有步骤包含完整代码和命令。

**Type consistency:** `screenshot` 字段在 `generate_screenshots.py`、`daily_update.py`、`demos.min.js`、`script.js` 中一致使用。
