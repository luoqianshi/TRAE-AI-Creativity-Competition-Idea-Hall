#!/usr/bin/env python3
"""TRAE Demo Hall Crawler v2 - Lark approved list as primary source, Discourse API as supplement."""

import json
import os
import re
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from jinja2 import Environment, FileSystemLoader


class DiscourseClient:
    """Discourse forum API client with rate limiting and retry logic."""

    def __init__(self, config):
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "TRAE-Demo-Hall-Crawler/2.0"
        })

    def _request(self, endpoint, params=None, skip_404=False):
        """Make a rate-limited request with exponential backoff retry."""
        url = urljoin(self.config["api_base"], endpoint)
        max_retries = self.config["max_retries"]
        backoff = self.config["retry_backoff_base"]

        for attempt in range(max_retries):
            try:
                time.sleep(self.config["rate_limit_delay"])
                resp = self.session.get(url, params=params, timeout=15)

                if resp.status_code == 404 and skip_404:
                    raise requests.exceptions.HTTPError("404 Not Found", response=resp)

                if resp.status_code == 429:
                    retry_after = int(resp.headers.get("Retry-After", backoff ** attempt))
                    print(f"  Rate limited, waiting {retry_after}s...")
                    time.sleep(retry_after)
                    continue

                resp.raise_for_status()
                return resp.json()

            except requests.exceptions.HTTPError as e:
                if "404" in str(e):
                    raise
                wait = min(backoff ** attempt, 8)
                print(f"  Request failed (attempt {attempt + 1}/{max_retries}): {e}, retrying in {wait}s...")
                time.sleep(wait)

            except requests.exceptions.RequestException as e:
                wait = min(backoff ** attempt, 8)
                print(f"  Request failed (attempt {attempt + 1}/{max_retries}): {e}, retrying in {wait}s...")
                time.sleep(wait)

        raise RuntimeError(f"Failed to fetch {url} after {max_retries} attempts")

    def get_topic_detail(self, topic_id):
        """Get full topic details including cooked HTML content."""
        endpoint = f"/t/{topic_id}.json"
        return self._request(endpoint)

    def download_file(self, url, dest_path):
        """Download a file with size limit check."""
        max_size = self.config["max_html_file_size_mb"] * 1024 * 1024
        resp = self.session.get(url, stream=True, timeout=60)
        resp.raise_for_status()

        content_length = resp.headers.get("Content-Length")
        if content_length and int(content_length) > max_size:
            raise ValueError(f"File too large: {content_length} bytes > {max_size} bytes")

        dest_path.parent.mkdir(parents=True, exist_ok=True)
        downloaded = 0
        with open(dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                downloaded += len(chunk)
                if downloaded > max_size:
                    raise ValueError(f"File exceeds size limit while downloading")
                f.write(chunk)
        return True


class DemoExtractor:
    """Extract demo resources from Discourse topic cooked HTML."""

    def __init__(self, config):
        self.config = config
        self.exclude_domains = set(config["exclude_domains"])
        self.demo_keywords = config["demo_keywords"]

    def extract_from_topic(self, topic_detail):
        """Extract demo info from a topic detail response."""
        posts = topic_detail.get("post_stream", {}).get("posts", [])
        if not posts:
            return {"has_demo": False, "demo_type": None}

        first_post = posts[0]
        cooked = first_post.get("cooked", "")
        soup = BeautifulSoup(cooked, "html.parser")

        # Strategy 1: Discourse HTML attachment (highest priority)
        attachment = self._extract_attachment(soup)
        if attachment:
            return {
                "has_demo": True,
                "demo_type": "attachment",
                "attachment_url": attachment["url"],
                "attachment_filename": attachment["filename"],
                "external_url": None
            }

        # Strategy 2: External Onebox link
        onebox_url = self._extract_onebox(soup)
        if onebox_url:
            return {
                "has_demo": True,
                "demo_type": "external",
                "attachment_url": None,
                "attachment_filename": None,
                "external_url": onebox_url
            }

        # Strategy 3: Fallback - first external link with demo keyword context
        fallback_url = self._extract_fallback(soup)
        if fallback_url:
            return {
                "has_demo": True,
                "demo_type": "external",
                "attachment_url": None,
                "attachment_filename": None,
                "external_url": fallback_url
            }

        return {"has_demo": False, "demo_type": None}

    def _extract_attachment(self, soup):
        """Extract HTML attachment link."""
        for a in soup.find_all("a", class_="attachment"):
            href = a.get("href", "")
            if href.endswith(".html") or href.endswith(".htm"):
                filename = a.get_text(strip=True)
                full_url = urljoin(self.config["forum_url"], href)
                return {"url": full_url, "filename": filename}
        return None

    def _extract_onebox(self, soup):
        """Extract external URL from Onebox preview."""
        for aside in soup.find_all("aside", class_="onebox"):
            url = aside.get("data-onebox-src", "")
            if url and self._is_valid_external_url(url):
                return url
            a_tag = aside.find("a", href=True)
            if a_tag:
                url = a_tag["href"]
                if self._is_valid_external_url(url):
                    return url
        return None

    def _extract_fallback(self, soup):
        """Fallback: find first external link with demo keyword context."""
        for a in soup.find_all("a", href=True):
            url = a["href"]
            if not self._is_valid_external_url(url):
                continue
            parent = a.find_parent(["p", "li", "div"])
            if parent:
                parent_text = parent.get_text(strip=True).lower()
                if any(kw in parent_text for kw in self.demo_keywords):
                    return url
        return None

    def _is_valid_external_url(self, url):
        """Check if URL is a valid external demo link."""
        parsed = urlparse(url)
        if not parsed.netloc:
            return False
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        for excluded in self.exclude_domains:
            if excluded in domain:
                return False
        if "/t/topic/" in url:
            return False
        return True


class DataManager:
    """Manage demos.json with dual-source data."""

    def __init__(self, config):
        self.config = config
        self.data_path = Path(config["data_dir"]) / "demos.json"
        self.demos_dir = Path(config["demos_dir"])
        self.data = self._load()

    def _load(self):
        """Load existing data or return empty structure."""
        if self.data_path.exists():
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "last_updated": None,
            "total_count": 0,
            "approved_count": 0,
            "unapproved_count": 0,
            "demos": []
        }

    def save(self):
        """Save data to JSON file."""
        self.data_path.parent.mkdir(parents=True, exist_ok=True)
        active = [d for d in self.data["demos"] if not d.get("archived", False)]
        self.data["total_count"] = len(active)
        self.data["approved_count"] = sum(1 for d in active if d.get("approved", False))
        self.data["unapproved_count"] = sum(1 for d in active if not d.get("approved", False))
        with open(self.data_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def get_existing_ids(self):
        """Return set of existing topic IDs."""
        return {d["topic_id"] for d in self.data["demos"]}

    def add_or_update(self, demo_record):
        """Add new demo or update existing one."""
        for i, existing in enumerate(self.data["demos"]):
            if existing["topic_id"] == demo_record["topic_id"]:
                # Merge: preserve existing fields not in new record
                for key, value in demo_record.items():
                    if value is not None or key not in existing:
                        self.data["demos"][i][key] = value
                return
        self.data["demos"].append(demo_record)

    def get_active_demos(self):
        """Return non-archived demos sorted by created_at desc."""
        return sorted(
            [d for d in self.data["demos"] if not d.get("archived", False)],
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )


class DemoHallCrawler:
    """Main crawler orchestrator v2."""

    def __init__(self, config_path="crawler/config.json"):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        self.client = DiscourseClient(self.config)
        self.extractor = DemoExtractor(self.config)
        self.data_mgr = DataManager(self.config)

    def load_approved_list(self, approved_path="data/approved_projects.json"):
        """Load approved projects from Lark Bitable."""
        if not Path(approved_path).exists():
            print(f"Approved list not found at {approved_path}")
            return []

        with open(approved_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        records = data.get("records", [])
        print(f"Loaded {len(records)} approved projects from Lark Bitable")
        return records

    def crawl(self, force=False):
        """Run the full crawl cycle with dual-source strategy.

        Args:
            force: If True, re-process all topics even if already in data.
        """
        print(f"[{datetime.now()}] Starting crawl v2... (force={force})")

        # Step 1: Load approved list as primary source
        approved_records = self.load_approved_list()
        if not approved_records:
            print("No approved list available, falling back to Discourse API only")
            return self._crawl_discourse_only(force)

        existing_ids = self.data_mgr.get_existing_ids()
        processed = 0
        new_count = 0
        updated_count = 0

        # Step 2: Process each approved project
        for record in approved_records:
            topic_id = record.get("topic_id")
            if not topic_id:
                continue

            topic_id_int = int(topic_id) if topic_id.isdigit() else None
            if not topic_id_int:
                continue

            is_existing = topic_id_int in existing_ids
            if is_existing and not force:
                continue

            action = "Re-processing" if is_existing else "Processing"
            print(f"  {action} approved topic {topic_id_int}: {record['title'][:50]}...")

            # Fetch topic detail from Discourse API to supplement metadata
            try:
                detail = self.client.get_topic_detail(topic_id_int)
            except requests.exceptions.HTTPError as e:
                if "404" in str(e):
                    print(f"    SKIP: Topic {topic_id_int} not found (404)")
                    # Create minimal record from approved list only
                    detail = None
                else:
                    print(f"    WARNING: Could not fetch topic {topic_id_int}: {e}")
                    detail = None
            except Exception as e:
                print(f"    WARNING: Could not fetch topic {topic_id_int}: {e}")
                detail = None

            # Build record from approved list + Discourse API
            demo_record = self._build_record_from_approved(record, detail)

            # Extract demo resources if detail available
            if detail:
                demo_info = self.extractor.extract_from_topic(detail)
                if demo_info.get("has_demo"):
                    demo_record["has_demo"] = True
                    demo_record["demo_type"] = demo_info.get("demo_type")
                    demo_record["external_url"] = demo_info.get("external_url")

                    # Download attachment if present
                    if demo_info.get("attachment_url"):
                        try:
                            dest = Path(self.config["demos_dir"]) / str(topic_id_int) / demo_info["attachment_filename"]
                            self.client.download_file(demo_info["attachment_url"], dest)
                            demo_record["demo_file"] = str(dest)
                            demo_record["demo_url"] = f"demos/{topic_id_int}/{demo_info['attachment_filename']}"
                            print(f"    Downloaded: {dest}")
                        except Exception as e:
                            print(f"    ERROR downloading attachment: {e}")

            self.data_mgr.add_or_update(demo_record)
            if is_existing:
                updated_count += 1
            else:
                new_count += 1
            processed += 1

            # Periodic save every 100 records
            if processed % 100 == 0:
                print(f"  [Checkpoint] Saving after {processed} records...")
                self.data_mgr.save()

        # Step 3: Also crawl Discourse API for any topics not in approved list
        # (to catch recently posted but not yet approved topics)
        print(f"\n  Checking Discourse API for additional topics...")
        extra_count = self._crawl_discourse_extra(existing_ids, force)

        # Update metadata
        self.data_mgr.data["last_updated"] = datetime.now(timezone.utc).isoformat()
        self.data_mgr.save()

        print(f"[{datetime.now()}] Crawl complete. Approved processed: {processed}, New: {new_count}, Updated: {updated_count}, Extra from API: {extra_count}")
        return processed + extra_count

    def _build_record_from_approved(self, approved_record, topic_detail=None):
        """Build a demo record from approved list data + optional Discourse detail."""
        topic_id = int(approved_record["topic_id"])
        title = approved_record["title"]
        forum_url = approved_record["forum_url"]
        nickname = approved_record["nickname"]

        record = {
            "topic_id": topic_id,
            "title": title,
            "forum_url": forum_url,
            "author": nickname,
            "approved": True,
            "approved_source": "lark_bitable",
            "created_at": "",
            "tags": [],
            "views": 0,
            "like_count": 0,
            "excerpt": "",
            "cover_image": None,
            "demo_type": None,
            "demo_file": None,
            "demo_url": None,
            "external_url": None,
            "has_demo": False,
            "archived": False
        }

        # Supplement with Discourse API data if available
        if topic_detail:
            topic = topic_detail
            first_post = topic.get("post_stream", {}).get("posts", [{}])[0]
            tags = [t["name"] if isinstance(t, dict) else t for t in topic.get("tags", [])]

            record.update({
                "author": first_post.get("username", nickname),
                "created_at": topic.get("created_at", ""),
                "tags": tags,
                "views": topic.get("views", 0),
                "like_count": topic.get("like_count", 0),
                "excerpt": topic.get("excerpt", ""),
                "cover_image": topic.get("image_url"),
            })

        return record

    def _crawl_discourse_extra(self, existing_ids, force):
        """Crawl Discourse API for topics not in approved list."""
        extra_count = 0
        page = 0

        while True:
            print(f"    Fetching Discourse page {page}...")
            try:
                resp = self.client.get_category_topics(page)
            except Exception as e:
                print(f"    ERROR fetching page {page}: {e}")
                break

            topics = resp.get("topic_list", {}).get("topics", [])
            if not topics:
                break

            for topic in topics:
                topic_id = topic["id"]

                # Skip if already in approved list
                if topic_id in existing_ids:
                    continue

                print(f"      Extra topic {topic_id}: {topic['title'][:40]}...")

                try:
                    detail = self.client.get_topic_detail(topic_id)
                except Exception as e:
                    print(f"        ERROR: {e}")
                    continue

                demo_info = self.extractor.extract_from_topic(detail)
                record = self._build_record_from_discourse(topic, detail, demo_info)
                record["approved"] = False
                record["approved_source"] = None

                if demo_info.get("attachment_url"):
                    try:
                        dest = Path(self.config["demos_dir"]) / str(topic_id) / demo_info["attachment_filename"]
                        self.client.download_file(demo_info["attachment_url"], dest)
                        record["demo_file"] = str(dest)
                        record["demo_url"] = f"demos/{topic_id}/{demo_info['attachment_filename']}"
                    except Exception as e:
                        print(f"        ERROR downloading: {e}")

                self.data_mgr.add_or_update(record)
                extra_count += 1

            more_url = resp.get("topic_list", {}).get("more_topics_url")
            if not more_url:
                break
            page += 1

        return extra_count

    def _build_record_from_discourse(self, topic, detail, demo_info):
        """Build a demo record from Discourse API data (legacy)."""
        first_post = detail.get("post_stream", {}).get("posts", [{}])[0]
        tags = [t["name"] if isinstance(t, dict) else t for t in topic.get("tags", [])]

        return {
            "topic_id": topic["id"],
            "title": topic["title"],
            "forum_url": f"{self.config['forum_url']}/t/topic/{topic['id']}",
            "author": first_post.get("username", "unknown"),
            "approved": False,
            "approved_source": None,
            "created_at": topic.get("created_at", ""),
            "tags": tags,
            "views": topic.get("views", 0),
            "like_count": topic.get("like_count", 0),
            "excerpt": topic.get("excerpt", ""),
            "cover_image": topic.get("image_url"),
            "demo_type": demo_info.get("demo_type"),
            "demo_file": None,
            "demo_url": None,
            "external_url": demo_info.get("external_url"),
            "has_demo": demo_info.get("has_demo", False),
            "archived": False
        }

    def _crawl_discourse_only(self, force):
        """Fallback: crawl only from Discourse API (legacy mode)."""
        print("Running legacy Discourse-only crawl...")
        # This is the old crawl logic, simplified
        return 0

    def render(self):
        """Render the static HTML page."""
        env = Environment(loader=FileSystemLoader("."))
        template = env.get_template(self.config["template_file"])

        demos = self.data_mgr.get_active_demos()

        # Compute stats
        stats = {
            "total": len(demos),
            "approved": sum(1 for d in demos if d.get("approved", False)),
            "unapproved": sum(1 for d in demos if not d.get("approved", False)),
            "with_demo": sum(1 for d in demos if d.get("has_demo", False)),
            "without_demo": sum(1 for d in demos if not d.get("has_demo", False)),
        }
        for tag_name in self.config["track_tags"].values():
            stats[tag_name] = sum(1 for d in demos if tag_name in d.get("tags", []))

        html = template.render(
            demos=demos,
            stats=stats,
            last_updated=self.data_mgr.data.get("last_updated", ""),
            track_tags=self.config["track_tags"]
        )

        with open(self.config["output_file"], "w", encoding="utf-8") as f:
            f.write(html)

        print(f"Rendered {self.config['output_file']} with {len(demos)} demos")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="TRAE Demo Hall Crawler v2")
    parser.add_argument("--force", action="store_true", help="Re-process all topics even if already in data")
    args = parser.parse_args()

    crawler = DemoHallCrawler()
    total_count = crawler.crawl(force=args.force)
    crawler.render()

    # Auto git commit and push
    if total_count > 0:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        commit_msg = f"auto-update: {date_str} +{total_count} demos (v2 dual-source)"

        try:
            subprocess.run(["git", "add", "demos/", "data/", "index.html"],
                          check=True, capture_output=True)
            result = subprocess.run(["git", "diff", "--cached", "--quiet"],
                                   capture_output=True)
            if result.returncode != 0:
                subprocess.run(["git", "commit", "-m", commit_msg],
                              check=True, capture_output=True)
                subprocess.run(["git", "push", "origin", "main"],
                              check=True, capture_output=True)
                print(f"Pushed {total_count} demos to GitHub.")
            else:
                print("No changes to commit.")
        except subprocess.CalledProcessError as e:
            print(f"Git operation failed: {e}")
    else:
        print("No new demos found.")


if __name__ == "__main__":
    main()
