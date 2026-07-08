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

def infer_tags(title):
    """Infer track tags from title text."""
    tag_map = {
        '学习工作': '学习工作',
        '生活娱乐': '生活娱乐',
        '社会服务': '社会服务',
        '硬件交互': '硬件交互',
        '社会公益': '社会公益',
    }
    for kw, tag in tag_map.items():
        if kw in str(title):
            return [tag]
    return ['野蛮生长']

def ensure_demo_dir_has_record(demos_data, tid):
    """Check if demos/<tid>/ has files and patch the record accordingly."""
    demo_dir = DEMOS_DIR / str(tid)
    if not demo_dir.is_dir():
        return False
    for r in demos_data['demos']:
        if r['topic_id'] == tid and r.get('has_demo'):
            return False  # already has demo
    # Find HTML file in the directory
    html_files = [f for f in demo_dir.iterdir() if f.suffix.lower() == '.html' and f.is_file()]
    if not html_files:
        for sub in demo_dir.iterdir():
            if sub.is_dir() and sub.name != '__MACOSX':
                sub_html = [f for f in sub.iterdir() if f.suffix.lower() == '.html' and f.is_file()]
                if sub_html:
                    html_files = sub_html
                    break
    if not html_files:
        return False
    # Find or create the record
    record = None
    for r in demos_data['demos']:
        if r['topic_id'] == tid:
            record = r
            break
    if not record:
        return False
    html_file = html_files[0]
    record['has_demo'] = True
    record['demo_file'] = str(html_file)
    rel = html_file.relative_to(PROJECT_ROOT)
    record['demo_url'] = str(rel)
    record['demo_type'] = 'attachment'
    return True

def update_demos_json_approved(wiki_ids, new_approved_records):
    """Step 3: Sync approved status and add missing records in demos.json.
    
    Args:
        wiki_ids: set of topic_id strings from approved_projects.json
        new_approved_records: list of records newly added from this sync
    """
    demos_json_path = DATA_DIR / 'demos.json'
    if not demos_json_path.exists():
        print("demos.json not found, skipping approved status check")
        return 0, []
    
    with open(demos_json_path, 'r', encoding='utf-8') as f:
        demos_data = json.load(f)
    
    existing_ids = {r['topic_id'] for r in demos_data.get('demos', [])}
    
    # 1. Mark existing records as approved
    updated_count = 0
    for demo in demos_data.get('demos', []):
        tid = str(demo.get('topic_id', ''))
        if tid in wiki_ids and not demo.get('approved', False):
            demo['approved'] = True
            demo['approved_source'] = 'lark_bitable'
            updated_count += 1
    
    # 2. Add minimal records for newly approved topics not yet in demos.json
    needs_demo_crawl = []  # topic_ids that need demo recheck
    added_count = 0
    fixed_from_disk = 0
    for rec in new_approved_records:
        tid = int(rec['topic_id'])
        if tid in existing_ids:
            # Already in demos.json, check if it needs demo recheck
            for r in demos_data['demos']:
                if r['topic_id'] == tid and not r.get('has_demo'):
                    needs_demo_crawl.append(tid)
                    break
            continue
        
        # Create minimal record
        title = rec.get('title', '')
        # Check if demo dir already exists on disk
        demo_dir = DEMOS_DIR / str(tid)
        has_demo = False
        demo_file = None
        demo_url = None
        if demo_dir.is_dir():
            for f in demo_dir.iterdir():
                if f.suffix.lower() == '.html' and f.is_file():
                    has_demo = True
                    demo_file = str(f)
                    demo_url = f'demos/{tid}/{f.name}'
                    break
            if not has_demo:
                for sub in demo_dir.iterdir():
                    if sub.is_dir() and sub.name != '__MACOSX':
                        for f2 in sub.iterdir():
                            if f2.suffix.lower() == '.html' and f2.is_file():
                                has_demo = True
                                demo_file = str(f2)
                                demo_url = f'demos/{tid}/{sub.name}/{f2.name}'
                                break
                        if has_demo:
                            break
        
        demos_data['demos'].append({
            'topic_id': tid,
            'title': str(title) if title else f'Topic {tid}',
            'forum_url': rec.get('forum_url', ''),
            'author': str(rec.get('nickname', 'unknown')) if rec.get('nickname') else 'unknown',
            'approved': True,
            'approved_source': 'lark_bitable',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'tags': infer_tags(title),
            'views': 0,
            'like_count': 0,
            'excerpt': str(title)[:200] if title else '',
            'cover_image': None,
            'demo_type': 'attachment' if has_demo else None,
            'demo_file': demo_file,
            'demo_url': demo_url,
            'external_url': None,
            'has_demo': has_demo,
            'archived': False,
            'insight': str(title)[:200] if title else '',
            'screenshot': None,
        })
        existing_ids.add(tid)
        added_count += 1
        
        if not has_demo:
            needs_demo_crawl.append(tid)
        else:
            fixed_from_disk += 1
    
    # 3. Fix existing records that have demo files on disk but has_demo=False
    for r in demos_data['demos']:
        if r.get('approved') and not r.get('has_demo'):
            if ensure_demo_dir_has_record(demos_data, r['topic_id']):
                fixed_from_disk += 1
                if r['topic_id'] in needs_demo_crawl:
                    needs_demo_crawl.remove(r['topic_id'])
    
    active = [d for d in demos_data.get('demos', []) if not d.get('archived', False)]
    demos_data['total_count'] = len(active)
    demos_data['approved_count'] = sum(1 for d in active if d.get('approved', False))
    demos_data['unapproved_count'] = sum(1 for d in active if not d.get('approved', False))
    demos_data['last_updated'] = datetime.now(timezone.utc).isoformat()
    
    with open(demos_json_path, 'w', encoding='utf-8') as f:
        json.dump(demos_data, f, ensure_ascii=False, indent=2)
    
    print(f"Updated {updated_count} existing demos to approved=True")
    print(f"Added {added_count} new approved records to demos.json")
    print(f"Fixed {fixed_from_disk} records with existing demo files on disk")
    print(f"Need demo crawl: {len(needs_demo_crawl)} records")
    print(f"Stats: total={demos_data['total_count']}, approved={demos_data['approved_count']}, unapproved={demos_data['unapproved_count']}")
    return updated_count + added_count, needs_demo_crawl

def crawl_missing_demos(topic_ids):
    """Step 4: Crawl demo attachments for approved topics that have no demo.
    
    Uses crawler_v2.py's DiscourseClient + DemoExtractor to recheck each
    topic and download HTML/ZIP attachments.
    """
    if not topic_ids:
        print("No topics need demo crawl, skipping")
        return 0
    
    print(f"\n[Step 4] Crawling demos for {len(topic_ids)} approved topics without demo...")
    sys.path.insert(0, str(CRAWLER_DIR))
    from crawler_v2 import DemoHallCrawler
    
    crawler = DemoHallCrawler()
    crawler.data_mgr.data = json.load(open(DATA_DIR / 'demos.json', 'r'))
    
    # Build lookup for topic_ids
    target_ids = set(topic_ids)
    updated = 0
    errors = []
    
    for i, record in enumerate(crawler.data_mgr.data['demos']):
        tid = record['topic_id']
        if tid not in target_ids:
            continue
        
        print(f"  [{i+1}/{len(topic_ids)}] Rechecking topic {tid}: {record.get('title', '')[:40]}...")
        
        try:
            detail = crawler.client.get_topic_detail(tid)
        except Exception as e:
            err = f"Topic {tid}: fetch error - {e}"
            errors.append(err)
            print(f"    ERROR: {err}")
            continue
        
        demo_info = crawler.extractor.extract_from_topic(detail)
        
        if not demo_info.get('has_demo'):
            print(f"    Still no demo")
            continue
        
        record['has_demo'] = True
        record['demo_type'] = demo_info.get('demo_type')
        record['external_url'] = demo_info.get('external_url')
        
        if demo_info.get('attachment_url'):
            try:
                crawler._download_and_process_attachment(demo_info, tid, record)
            except Exception as e:
                err = f"Topic {tid}: download error - {e}"
                errors.append(err)
                print(f"    ERROR: {err}")
                record['has_demo'] = False
                continue
        
        if record.get('has_demo'):
            updated += 1
            print(f"    FOUND DEMO: {record.get('demo_url', record.get('external_url', 'N/A'))}")
        
        # Checkpoint save every 25 records
        if (updated + 1) % 25 == 0:
            crawler.data_mgr.save()
            print(f"    [Checkpoint] Saved after {updated + 1} demos found")
    
    # Final save
    crawler.data_mgr.save()
    print(f"Demo crawl complete: {updated}/{len(topic_ids)} demos found")
    if errors:
        print(f"Errors: {len(errors)}")
        for e in errors[:5]:
            print(f"  - {e}")
    
    return updated

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
            'screenshot': d.get('screenshot'),
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
        
        # Step 3: Sync approved status + add missing records in demos.json
        print("\n[Step 3] Syncing approved status in demos.json...")
        updated, needs_demo_crawl = update_demos_json_approved(wiki_id_set, new_records)
        
        # Step 4: Crawl demo attachments for topics without demos
        if needs_demo_crawl:
            demos_found = crawl_missing_demos(needs_demo_crawl)
            if demos_found > 0:
                print(f"Crawled {demos_found} new demos")
        else:
            print("\n[Step 4] No topics need demo crawl, skipping")
        
        # Step 5: Render
        print("\n[Step 5] Rendering demos.min.js and index.html...")
        render_demos_min_js()
        render_index_html()
        
        # Step 6: Update README
        print("\n[Step 6] Updating README.md...")
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
