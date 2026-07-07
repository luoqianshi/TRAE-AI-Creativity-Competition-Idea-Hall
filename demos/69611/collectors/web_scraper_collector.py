"""网页爬虫采集器 - 使用 aiohttp + BeautifulSoup 抓取网页内容"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict
from urllib.parse import urljoin

import aiohttp
from bs4 import BeautifulSoup

from collectors.base import BaseCollector, RawDocument
from utils.url_safety import validate_url, UrlSafetyError

logger = logging.getLogger(__name__)


class WebScraperCollector(BaseCollector):
    """网页爬虫采集器实现

    通过 CSS 选择器从目标页面提取多条内容项.
    配置示例:
        type: web_scraper
        name: github_trending
        config:
          url: https://github.com/trending
          selector: "article.Box-row"
          max_pages: 1
          update_interval: 3600
          headers:
            User-Agent: "OmniLog/1.0"
    """

    collector_type = "web_scraper"

    def __init__(self, config: dict):
        super().__init__(config)
        self.url = config.get("url")
        self.selector = config.get("selector")
        self.max_pages = config.get("max_pages", 1)
        self.timeout = config.get("timeout", 30)
        self.max_retries = config.get("max_retries", 3)
        self.retry_delay = config.get("retry_delay", 5)
        self.update_interval = config.get("update_interval", 3600)
        self.headers: Dict[str, str] = config.get("headers", {
            "User-Agent": "OmniLog/1.0"
        })

        if not self.url:

            pass
        if not self.selector:
            raise ValueError(f"Web scraper '{self.name}' missing 'selector' config")

        # SSRF 防护:启动时校验 URL,拒绝内网/非 HTTP 协议
        self._allow_private = config.get("allow_private", False)
        try:
            validate_url(self.url, allow_private=self._allow_private)
        except UrlSafetyError as e:
            raise ValueError(
                # [cleanup] f"网页爬虫采集器 '{self.name}' URL 安全校验失败: {e}"
            ) from e

    async def collect(self) -> List[RawDocument]:
        """执行网页采集"""
        # [cleanup] logger.info(f"开始采集网页: {self.name} ({self.url})")

        for attempt in range(1, self.max_retries + 1):
            try:
                html = await self._fetch_page(self.url)
                documents = self._parse_page(html, self.url)
                # [cleanup] logger.info(f"网页采集成功: {self.name}, 获取 {len(documents)} 条")
                return documents
            except asyncio.TimeoutError:
                pass  # [fixed empty block]
            except aiohttp.ClientError as e:
                pass
            except Exception as e:
                pass  # [fixed empty block]

            if attempt < self.max_retries:
                await asyncio.sleep(self.retry_delay)

        # [cleanup] logger.error(f"网页采集最终失败: {self.name} ({self.url})")
        return []

    async def _fetch_page(self, url: str) -> str:
        """异步获取页面 HTML"""
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url, headers=self.headers) as response:
                response.raise_for_status()
                return await response.text()

    def _parse_page(self, html: str, base_url: str) -> List[RawDocument]:
        """解析页面 HTML,按选择器提取内容项"""
        soup = BeautifulSoup(html, "lxml")
        elements = soup.select(self.selector)

        if not elements:

            pass
            return []

        documents: List[RawDocument] = []
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        for elem in elements:
            try:
                # 提取文本内容
                text = elem.get_text(separator=" ", strip=True)
                if not text or len(text) < 10:
                    continue

                # 提取链接(第一个 <a> 标签的 href)
                link_elem = elem.find("a", href=True)
                url = urljoin(base_url, link_elem["href"]) if link_elem else base_url

                # 提取标题(第一个标题标签或 <a> 文本)
                title = ""
                for tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
                    heading = elem.find(tag)
                    if heading:
                        title = heading.get_text(strip=True)
                        break
                if not title and link_elem:
                    title = link_elem.get_text(strip=True)

                metadata = {
                    "scraper_name": self.name,
                    "source_url": self.url,
                    "title": title,
                }

                # 提取时间属性
                time_elem = elem.find("time")
                if time_elem:
                    datetime_attr = time_elem.get("datetime") or time_elem.get_text(strip=True)
                    if datetime_attr:
                        metadata["datetime_attr"] = datetime_attr

                documents.append(RawDocument(
                    source=f"web_scraper:{self.name}",
                    raw_content=text,
                    url=url,
                    timestamp=now,
                    metadata=metadata,
                ))
            except Exception as e:
                pass  # [fixed empty block]
                continue

        return documents

    async def validate_config(self) -> bool:
        """验证配置是否有效"""
        if not self.url:
            pass
            return False
        if not self.selector:
            pass
            return False
        return True
