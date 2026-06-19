#!/usr/bin/env python3
"""TRAE Demo Hall Crawler - Discourse API client and data processor."""

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
            "User-Agent": "TRAE-Demo-Hall-Crawler/1.0"
        })

    def _request(self, endpoint, params=None):
        """Make a rate-limited request with exponential backoff retry."""
        url = urljoin(self.config["api_base"], endpoint)
        max_retries = self.config["max_retries"]
        backoff = self.config["retry_backoff_base"]

        for attempt in range(max_retries):
            try:
                time.sleep(self.config["rate_limit_delay"])
                resp = self.session.get(url, params=params, timeout=30)

                if resp.status_code == 429:
                    retry_after = int(resp.headers.get("Retry-After", backoff ** attempt))
                    print(f"  Rate limited, waiting {retry_after}s...")
                    time.sleep(retry_after)
                    continue

                resp.raise_for_status()
                return resp.json()

            except requests.exceptions.RequestException as e:
                wait = backoff ** attempt
                print(f"  Request failed (attempt {attempt + 1}/{max_retries}): {e}, retrying in {wait}s...")
                time.sleep(wait)

        raise RuntimeError(f"Failed to fetch {url} after {max_retries} attempts")

    def get_category_topics(self, page=0):
        """Get topics from the target category."""
        endpoint = f"/c/{self.config['category_id']}.json"
        params = {"page": page} if page > 0 else {}
        return self._request(endpoint, params)

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
            # Fallback to href in the onebox
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
            # Check parent text for demo keywords
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
        # Remove www. prefix for comparison
        if domain.startswith("www."):
            domain = domain[4:]
        for excluded in self.exclude_domains:
            if excluded in domain:
                return False
        # Exclude forum internal topic links
        if "/t/topic/" in url:
            return False
        return True


class DataManager:
    """Manage demos.json with incremental updates."""

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
            "demos": []
        }

    def save(self):
        """Save data to JSON file."""
        self.data_path.parent.mkdir(parents=True, exist_ok=True)
        self.data["total_count"] = len([d for d in self.data["demos"] if not d.get("archived", False)])
        with open(self.data_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def get_existing_ids(self):
        """Return set of existing topic IDs."""
        return {d["topic_id"] for d in self.data["demos"]}

    def add_or_update(self, demo_record):
        """Add new demo or update existing one."""
        for i, existing in enumerate(self.data["demos"]):
            if existing["topic_id"] == demo_record["topic_id"]:
                self.data["demos"][i] = demo_record
                return
        self.data["demos"].append(demo_record)

    def archive_missing(self, current_ids):
        """Archive demos whose topics no longer exist."""
        for demo in self.data["demos"]:
            if demo["topic_id"] not in current_ids:
                demo["archived"] = True

    def get_active_demos(self):
        """Return non-archived demos sorted by created_at desc."""
        return sorted(
            [d for d in self.data["demos"] if not d.get("archived", False)],
            key=lambda x: x["created_at"],
            reverse=True
        )

    def clean_old_logs(self, days=7):
        """Remove log files older than specified days."""
        log_dir = Path(self.config["data_dir"])
        cutoff = datetime.now(timezone.utc).timestamp() - days * 86400
        for log_file in log_dir.glob("crawl-*.log"):
            if log_file.stat().st_mtime < cutoff:
                log_file.unlink()


class DemoHallCrawler:
    """Main crawler orchestrator."""

    def __init__(self, config_path="crawler/config.json"):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        self.client = DiscourseClient(self.config)
        self.extractor = DemoExtractor(self.config)
        self.data_mgr = DataManager(self.config)

    def crawl(self):
        """Run the full crawl cycle."""
        print(f"[{datetime.now()}] Starting crawl...")
        new_count = 0
        updated_count = 0
        all_topic_ids = set()

        # Fetch all topics from the category
        page = 0
        while True:
            print(f"Fetching page {page}...")
            resp = self.client.get_category_topics(page)
            topics = resp.get("topic_list", {}).get("topics", [])
            if not topics:
                break

            for topic in topics:
                topic_id = topic["id"]
                all_topic_ids.add(topic_id)

                # Skip already processed topics (incremental)
                if topic_id in self.data_mgr.get_existing_ids():
                    continue

                print(f"  Processing topic {topic_id}: {topic['title'][:50]}...")

                try:
                    detail = self.client.get_topic_detail(topic_id)
                except Exception as e:
                    print(f"    ERROR fetching topic {topic_id}: {e}")
                    continue

                # Extract demo resources
                demo_info = self.extractor.extract_from_topic(detail)

                # Build record
                record = self._build_record(topic, detail, demo_info)

                # Download attachment if present
                if demo_info.get("attachment_url"):
                    try:
                        dest = Path(self.config["demos_dir"]) / str(topic_id) / demo_info["attachment_filename"]
                        self.client.download_file(demo_info["attachment_url"], dest)
                        record["demo_file"] = str(dest)
                        record["demo_url"] = f"/demos/{topic_id}/{demo_info['attachment_filename']}"
                        print(f"    Downloaded: {dest}")
                    except Exception as e:
                        print(f"    ERROR downloading attachment: {e}")
                        record["has_demo"] = False

                self.data_mgr.add_or_update(record)
                new_count += 1

            # Check if more pages exist
            more_url = resp.get("topic_list", {}).get("more_topics_url")
            if not more_url:
                break
            page += 1

        # Archive removed topics
        self.data_mgr.archive_missing(all_topic_ids)

        # Update metadata
        self.data_mgr.data["last_updated"] = datetime.now(timezone.utc).isoformat()
        self.data_mgr.save()

        print(f"[{datetime.now()}] Crawl complete. New: {new_count}, Updated: {updated_count}")
        return new_count

    def _build_record(self, topic, detail, demo_info):
        """Build a demo record from topic and detail data."""
        first_post = detail.get("post_stream", {}).get("posts", [{}])[0]
        tags = [t["name"] if isinstance(t, dict) else t for t in topic.get("tags", [])]

        return {
            "topic_id": topic["id"],
            "title": topic["title"],
            "forum_url": f"{self.config['forum_url']}/t/topic/{topic['id']}",
            "author": first_post.get("username", "unknown"),
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

    def render(self):
        """Render the static HTML page."""
        env = Environment(loader=FileSystemLoader("."))
        template = env.get_template(self.config["template_file"])

        demos = self.data_mgr.get_active_demos()

        # Compute stats
        stats = {"total": len(demos)}
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
    import subprocess

    crawler = DemoHallCrawler()
    new_count = crawler.crawl()
    crawler.render()

    # Auto git commit and push
    if new_count > 0:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        commit_msg = f"auto-update: {date_str} +{new_count} new demos"

        try:
            subprocess.run(["git", "add", "demos/", "data/demos.json", "index.html"],
                          check=True, capture_output=True)
            result = subprocess.run(["git", "diff", "--cached", "--quiet"],
                                   capture_output=True)
            if result.returncode != 0:
                subprocess.run(["git", "commit", "-m", commit_msg],
                              check=True, capture_output=True)
                subprocess.run(["git", "push", "origin", "main"],
                              check=True, capture_output=True)
                print(f"Pushed {new_count} new demos to GitHub.")
            else:
                print("No changes to commit.")
        except subprocess.CalledProcessError as e:
            print(f"Git operation failed: {e}")
    else:
        print("No new demos found.")


if __name__ == "__main__":
    main()
