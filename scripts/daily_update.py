#!/usr/bin/env python3
"""Daily update script for TRAE AI Creativity Competition Demo Hall."""

import json
import os
import re
import subprocess
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
DATA_DIR = PROJECT_ROOT / 'data'
DEMOS_DIR = PROJECT_ROOT / 'demos'
CRAWLER_DIR = PROJECT_ROOT / 'crawler'

def run_cmd(cmd, cwd=None, check=True):
    """Run shell command and return output."""
    print(f"$ {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd or PROJECT_ROOT, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    if check and result.returncode != 0:
        raise RuntimeError(f"Command failed: {cmd}\nstderr: {result.stderr}")
    return result

def fetch_wiki_outline():
    """Fetch wiki outline and extract h2 sections with dates."""
    result = run_cmd(
        'lark-cli docs +fetch --api-version v2 '
        '--doc "https://bytedance.larkoffice.com/wiki/WN1CwOygLiyM7BkW8X3cMgh7nob" '
        '--scope outline --max-depth 3',
        check=False
    )
    data = json.loads(result.stdout)
    if not data.get('ok'):
        raise RuntimeError(f"Failed to fetch wiki outline: {data}")
    
    content = data['data']['document']['content']
    sections = []
    for match in re.finditer(r'<h2 id="([^"]+)">([^<]+)</h2>', content):
        h2_id = match.group(1)
        title = match.group(2)
        date_match = re.search(r'(\d+)月(\d+)日', title)
        if date_match:
            date_str = f"{int(date_match.group(1))}月{int(date_match.group(2))}日"
        else:
            date_str = title
        sections.append({'id': h2_id, 'title': title, 'date': date_str})
    return sections

def fetch_bitable_info(h2_id):
    """Fetch section and extract bitable token and table-id."""
    result = run_cmd(
        f'lark-cli docs +fetch --api-version v2 '
        f'--doc "https://bytedance.larkoffice.com/wiki/WN1CwOygLiyM7BkW8X3cMgh7nob" '
        f'--scope section --start-block-id "{h2_id}" --detail with-ids --max-depth 2',
        check=False
    )
    data = json.loads(result.stdout)
    if not data.get('ok'):
        raise RuntimeError(f"Failed to fetch section {h2_id}: {data}")
    
    content = data['data']['document']['content']
    match = re.search(r'<bitable[^>]+table-id="([^"]+)"[^>]+token="([^"]+)"', content)
    if not match:
        raise RuntimeError(f"No bitable found in section {h2_id}")
    
    return {'table_id': match.group(1), 'token': match.group(2)}

def fetch_bitable_records(token, table_id, date_str):
    """Fetch all records from a bitable with pagination."""
    all_records = []
    offset = 0
    limit = 200
    
    while True:
        result = run_cmd(
            f'lark-cli base +record-list '
            f'--base-token "{token}" '
            f'--table-id "{table_id}" '
            f'--limit {limit} --offset {offset} --format json',
            check=False
        )
        data = json.loads(result.stdout)
        if not data.get('ok'):
            raise RuntimeError(f"Failed to fetch records: {data}")
        
        resp_data = data['data']
        rows = resp_data.get('data', [])
        fields = resp_data.get('fields', [])
        
        if not rows:
            break
        
        nickname_idx = next((i for i, f in enumerate(fields) if '昵称' in f), 0)
        title_idx = next((i for i, f in enumerate(fields) if '标题' in f), 1)
        link_idx = next((i for i, f in enumerate(fields) if '链接' in f or 'url' in f.lower()), 2)
        
        for row in rows:
            nickname = row[nickname_idx] if nickname_idx < len(row) else ''
            title = row[title_idx] if title_idx < len(row) else ''
            link_field = row[link_idx] if link_idx < len(row) else ''
            
            # link_field might be None, list, or dict in some edge cases
            if not isinstance(link_field, str):
                link_field = str(link_field) if link_field is not None else ''
            if not isinstance(nickname, str):
                nickname = str(nickname) if nickname is not None else ''
            if not isinstance(title, str):
                title = str(title) if title is not None else ''
            
            url_match = re.search(r'\[([^\]]+)\]', link_field)
            forum_url = url_match.group(1) if url_match else link_field
            
            topic_match = re.search(r'/topic/(\d+)', forum_url)
            topic_id = topic_match.group(1) if topic_match else None
            
            if topic_id:
                all_records.append({
                    'topic_id': topic_id,
                    'title': title.strip(),
                    'forum_url': forum_url,
                    'nickname': nickname.strip(),
                    'date': date_str,
                })
        
        if not resp_data.get('has_more', False):
            break
        offset += len(rows)
    
    return all_records

def update_approved_projects(sections):
    """Sync approved_projects.json from wiki.
    
    Strategy: Start with existing local records as baseline, then merge in
    newly fetched records from wiki. If a batch fails to fetch, existing
    records from that batch are preserved rather than lost.
    """
    approved_path = DATA_DIR / 'approved_projects.json'
    with open(approved_path, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
    
    # Start with existing records as dict (preserves data even if some batches fail)
    unique_records = {}
    for r in existing_data.get('records', []):
        tid = r.get('topic_id', '')
        if tid:
            unique_records[tid] = r
    existing_ids = set(unique_records.keys())
    
    fetch_errors = []
    new_from_wiki = []
    for section in sections:
        print(f"  Processing {section['title']}...")
        try:
            bitable = fetch_bitable_info(section['id'])
            records = fetch_bitable_records(bitable['token'], bitable['table_id'], section['date'])
            print(f"    Fetched {len(records)} records")
            new_from_wiki.extend(records)
        except Exception as e:
            err_msg = f"Failed to fetch batch '{section['title']}': {e}"
            print(f"    ERROR: {err_msg}")
            traceback.print_exc()
            fetch_errors.append(err_msg)
    
    # Merge wiki records into unique_records (overwriting with fresh data)
    for r in new_from_wiki:
        tid = r['topic_id']
        unique_records[tid] = r
    
    new_records = [r for tid, r in unique_records.items() if tid not in existing_ids]
    print(f"\nTotal unique approved records (merged): {len(unique_records)}")
    print(f"Existing local records: {len(existing_ids)}")
    print(f"New records added: {len(new_records)}")
    if fetch_errors:
        print(f"WARNING: {len(fetch_errors)} batch(es) failed to fetch, existing data preserved")
    
    today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    updated_approved = {
        'last_synced': today_str,
        'total': len(unique_records),
        'records': list(unique_records.values())
    }
    with open(approved_path, 'w', encoding='utf-8') as f:
        json.dump(updated_approved, f, ensure_ascii=False, indent=2)
    print(f"Saved approved_projects.json with {len(unique_records)} records")
    
    return unique_records, new_records, fetch_errors

def update_demos_json_approved(wiki_ids):
    """Step 3: Check and fix approved status in demos.json."""
    demos_json_path = DATA_DIR / 'demos.json'
    if not demos_json_path.exists():
        print("demos.json not found, skipping approved status check")
        return 0
    
    with open(demos_json_path, 'r', encoding='utf-8') as f:
        demos_data = json.load(f)
    
    updated_count = 0
    for demo in demos_data.get('demos', []):
        tid = str(demo.get('topic_id', ''))
        if tid in wiki_ids and not demo.get('approved', False):
            demo['approved'] = True
            demo['approved_source'] = 'lark_bitable'
            updated_count += 1
    
    active = [d for d in demos_data.get('demos', []) if not d.get('archived', False)]
    demos_data['total_count'] = len(active)
    demos_data['approved_count'] = sum(1 for d in active if d.get('approved', False))
    demos_data['unapproved_count'] = sum(1 for d in active if not d.get('approved', False))
    demos_data['last_updated'] = datetime.now(timezone.utc).isoformat()
    
    with open(demos_json_path, 'w', encoding='utf-8') as f:
        json.dump(demos_data, f, ensure_ascii=False, indent=2)
    print(f"Updated {updated_count} demos to approved=True")
    print(f"Stats: total={demos_data['total_count']}, approved={demos_data['approved_count']}, unapproved={demos_data['unapproved_count']}")
    return updated_count

def render_demos_min_js():
    """Regenerate demos.min.js from demos.json."""
    demos_json_path = DATA_DIR / 'demos.json'
    if not demos_json_path.exists():
        print("demos.json not found, skipping render")
        return
    
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
    print(f"Generated demos.min.js with {len(frontend_demos)} records")

def render_index_html():
    """Render index.html from template."""
    try:
        sys.path.insert(0, str(CRAWLER_DIR))
        from crawler_v2 import DemoHallCrawler
        crawler = DemoHallCrawler()
        crawler.render()
        print("Rendered index.html successfully")
    except Exception as e:
        print(f"Warning: Failed to render index.html: {e}")
        traceback.print_exc()

def update_readme():
    """Update README.md stats."""
    try:
        sys.path.insert(0, str(PROJECT_ROOT / 'scripts'))
        import update_readme as ur
        ur.main()
    except Exception as e:
        print(f"Warning: Failed to update README.md: {e}")
        traceback.print_exc()

def log_issues_to_update_md(issues):
    """Append new issues to prompt/update.md."""
    if not issues:
        return
    
    update_md_path = PROJECT_ROOT / 'prompt' / 'update.md'
    if not update_md_path.exists():
        print("update.md not found, skipping issue logging")
        return
    
    with open(update_md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    today_str = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    new_section = f"\n### 自动记录问题（{today_str}）\n\n"
    for issue in issues:
        new_section += f"- {issue}\n"
    new_section += "\n"
    
    # Insert before "## 注意事项"
    marker = "\n## 注意事项"
    if marker in content:
        content = content.replace(marker, new_section + marker)
    else:
        content += new_section
    
    with open(update_md_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Logged {len(issues)} issues to update.md")

def main():
    print("=" * 60)
    print("TRAE Demo Hall Daily Update")
    print(f"Started at: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)
    
    issues = []
    
    try:
        # Step 1: Fetch wiki sections
        print("\n[Step 1] Fetching wiki outline...")
        sections = fetch_wiki_outline()
        print(f"Found {len(sections)} batches")
        
        # Step 2: Update approved_projects.json
        print("\n[Step 2] Syncing approved_projects.json...")
        wiki_ids, new_records, fetch_errors = update_approved_projects(sections)
        wiki_id_set = set(wiki_ids.keys())
        issues.extend(fetch_errors)
        
        # Step 3: Check approved status in demos.json
        print("\n[Step 3] Checking approved status in demos.json...")
        updated = update_demos_json_approved(wiki_id_set)
        
        # Step 4: Render
        print("\n[Step 4] Rendering demos.min.js and index.html...")
        render_demos_min_js()
        render_index_html()
        
        # Step 5: Update README
        print("\n[Step 5] Updating README.md...")
        update_readme()
        
        print("\n[Done] Update completed successfully!")
        
    except Exception as e:
        error_msg = f"Update failed: {str(e)}"
        print(f"\nERROR: {error_msg}")
        traceback.print_exc()
        issues.append(error_msg)
    
    # Log issues to update.md
    if issues:
        log_issues_to_update_md(issues)
    
    print(f"Finished at: {datetime.now(timezone.utc).isoformat()}")
    return len(issues) == 0

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
