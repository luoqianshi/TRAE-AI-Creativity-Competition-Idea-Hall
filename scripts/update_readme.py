#!/usr/bin/env python3
"""Update README.md with latest stats."""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path('/workspace/TRAE-AI-Creativity-Competition-Idea-Hall')
DATA_DIR = PROJECT_ROOT / 'data'
README_PATH = PROJECT_ROOT / 'README.md'

def main():
    # Load demos.json
    with open(DATA_DIR / 'demos.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    demos = data.get('demos', [])
    active = [d for d in demos if not d.get('archived', False)]
    
    total = len(active)
    approved = sum(1 for d in active if d.get('approved', False))
    unapproved = total - approved
    with_demo = sum(1 for d in active if d.get('has_demo', False))
    
    # Tag stats
    tag_counts = {}
    for d in active:
        tags = d.get('tags', [])
        if tags:
            tag = tags[0]
        else:
            tag = '野蛮生长'
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    # Read approved_projects.json for batch dates
    with open(DATA_DIR / 'approved_projects.json', 'r', encoding='utf-8') as f:
        approved_data = json.load(f)
    
    dates = sorted(set(r.get('date', '') for r in approved_data.get('records', []) if r.get('date')))
    dates_str = ' + '.join(dates)
    
    today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    # Read README
    with open(README_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update stats table
    content = re.sub(
        r'\| 总报名帖 \| \*\*[^*]+\*\* \|',
        f'| 总报名帖 | **{total:,}** |',
        content
    )
    content = re.sub(
        r'\| 含 HTML Demo \| \*\*[^*]+\*\* \|',
        f'| 含 HTML Demo | **{with_demo:,}** |',
        content
    )
    content = re.sub(
        r'\| 官方审核通过 \| \*\*[^*]+\*\* \|',
        f'| 官方审核通过 | **{approved:,}** |',
        content
    )
    content = re.sub(
        r'\| 暂无 Demo / 未审核 \| \*\*[^*]+\*\* \|',
        f'| 暂无 Demo / 未审核 | **{unapproved:,}** |',
        content
    )
    content = re.sub(
        r'\| 学习工作 \| \d+ \|',
        f'| 学习工作 | {tag_counts.get("学习工作", 0):,} |',
        content
    )
    content = re.sub(
        r'\| 生活娱乐 \| \d+ \|',
        f'| 生活娱乐 | {tag_counts.get("生活娱乐", 0):,} |',
        content
    )
    content = re.sub(
        r'\| 社会服务 \| \d+ \|',
        f'| 社会服务 | {tag_counts.get("社会服务", 0):,} |',
        content
    )
    content = re.sub(
        r'\| 社会公益 \| \d+ \|',
        f'| 社会公益 | {tag_counts.get("社会公益", 0):,} |',
        content
    )
    content = re.sub(
        r'\| 硬件交互 \| \d+ \|',
        f'| 硬件交互 | {tag_counts.get("硬件交互", 0):,} |',
        content
    )
    content = re.sub(
        r'\| 野蛮生长（未分类） \| \d+ \|',
        f'| 野蛮生长（未分类） | {tag_counts.get("野蛮生长", 0):,} |',
        content
    )
    content = re.sub(
        r'\| 已生成 Insight 洞见 \| \d+ \|',
        f'| 已生成 Insight 洞见 | {total:,} |',
        content
    )
    
    # Update date line
    content = re.sub(
        r'> 数据更新时间：\d{4}-\d{2}-\d{2} · 来源：\[forum\.trae\.cn 大赛报名专区\]\([^)]+\) \+ 飞书官方审核名单（[^）]+）',
        f'> 数据更新时间：{today_str} · 来源：[forum.trae.cn 大赛报名专区](https://forum.trae.cn/c/38-category/40-category/40) + 飞书官方审核名单（{dates_str}）',
        content
    )
    
    with open(README_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated README.md:")
    print(f"  Total: {total}")
    print(f"  Approved: {approved}")
    print(f"  Unapproved: {unapproved}")
    print(f"  With Demo: {with_demo}")
    print(f"  Tags: {tag_counts}")

if __name__ == '__main__':
    main()
