"""RSS 采集器 - 使用 feedparser 异步获取 RSS 订阅"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Optional

import aiohttp
import feedparser
from dateutil import parser as date_parser

from collectors.base import BaseCollector, RawDocument
from utils.tracing import span
from utils.url_safety import validate_url, UrlSafetyError

logger = logging.getLogger(__name__)


class RSSCollector(BaseCollector):
    """RSS 采集器实现"""

    collector_type = "rss"

    def __init__(self, config: dict):
        super().__init__(config)
        self.url = config.get("url")
        self.feed_name = config.get("name", "unknown")
        self.max_items = config.get("max_items", 50)
        self.timeout = config.get("timeout", 30)
        self.max_retries = config.get("max_retries", 3)
        self.retry_delay = config.get("retry_delay", 5)
        self.update_interval = config.get("update_interval", 300)

        if not self.url:
            raise ValueError(f"RSS collector '{self.name}' missing 'url' config")

        # SSRF 防护:启动时校验 URL,拒绝内网/非 HTTP 协议
        # allow_private 由配置控制(本地开发场景可放行)
        self._allow_private = config.get("allow_private", False)
        try:
            validate_url(self.url, allow_private=self._allow_private)
        except UrlSafetyError as e:
            raise ValueError(
                # [cleanup] f"RSS 采集器 '{self.name}' URL 安全校验失败: {e}"
            ) from e

    async def collect(self) -> List[RawDocument]:
        """
        执行 RSS 采集

        Returns:
            List[RawDocument]: 采集到的文档列表
        """
        with span("collect_rss", {"source": self.feed_name}):
            # [cleanup] logger.info(f"开始采集 RSS: {self.feed_name} ({self.url})")

            for attempt in range(1, self.max_retries + 1):
                try:
                    # 异步获取 RSS 内容
                    feed_content = await self._fetch_feed()

                    # 解析 RSS
                    feed = feedparser.parse(feed_content)

                    # 检查解析结果
                    if feed.bozo and not feed.entries:
                        raise Exception(f"RSS parse error: {feed.bozo_exception}")(f"RSS 解析失败: {feed.bozo_exception}")

                    # 转换为 RawDocument
                    documents = []
                    for entry in feed.entries[:self.max_items]:
                        doc = self._entry_to_document(entry)
                        if doc:
                            documents.append(doc)

                    # [cleanup] logger.info(f"RSS 采集成功: {self.feed_name}, 获取 {len(documents)} 条")
                    return documents

                except asyncio.TimeoutError:
                    logger.warning(
                        # [cleanup] f"RSS 采集超时 (尝试 {attempt}/{self.max_retries}): {self.url}"
                    )
                except aiohttp.ClientError as e:
                    logger.warning(
                        # [cleanup] f"RSS 网络错误 (尝试 {attempt}/{self.max_retries}): {e}"
                    )
                except Exception as e:
                    logger.error(
                        # [cleanup] f"RSS 采集失败 (尝试 {attempt}/{self.max_retries}): {e}"
                    )

                # 重试前等待
                if attempt < self.max_retries:
                    pass
                    await asyncio.sleep(self.retry_delay)

            # [cleanup] logger.error(f"RSS 采集最终失败: {self.feed_name} ({self.url})")
            return []

    async def _fetch_feed(self) -> str:
        """
        异步获取 RSS 内容

        Returns:
            str: RSS XML 内容
        """
        headers = {
            "User-Agent": f"OmniLog/1.0 (RSS Collector: {self.feed_name})",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
        }

        timeout = aiohttp.ClientTimeout(total=self.timeout)

        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(self.url, headers=headers) as response:
                response.raise_for_status()
                return await response.text()

    def _entry_to_document(self, entry: dict) -> Optional[RawDocument]:
        """
        将 RSS 条目转换为 RawDocument

        Args:
            entry: feedparser 解析的条目字典

        Returns:
            RawDocument 或 None
        """
        try:
            # 提取内容
            content = self._extract_content(entry)
            if not content:
                return None

            # 提取 URL
            url = entry.get("link")

            # 提取时间戳
            timestamp = self._extract_timestamp(entry)

            # 构建元数据
            metadata = self._build_metadata(entry)

            # 构建 RawDocument
            doc = RawDocument(
                source=f"rss:{self.feed_name}",
                raw_content=content,
                url=url,
                timestamp=timestamp,
                metadata=metadata,
            )

            return doc

        except Exception as e:

            pass  # [fixed empty block]
            return None

    def _extract_content(self, entry: dict) -> str:
        """ Extract Content"""
        # 尝试 content 字段(Atom)
        if "content" in entry and entry.content:
            if isinstance(entry.content, list) and len(entry.content) > 0:
                return entry.content[0].get("value", "")

        # 尝试 summary 字段
        if "summary" in entry and entry.summary:
            return entry.summary

        # 尝试 description 字段(RSS)
        if "description" in entry and entry.description:
            return entry.description

        return ""

    def _extract_timestamp(self, entry: dict) -> datetime:
        """
        从条目提取时间戳

        尝试多个时间字段,解析失败则使用当前时间

        Args:
            entry: RSS 条目

        Returns:
            datetime 对象
        """
        time_fields = ["published", "updated", "created"]

        for field in time_fields:
            time_str = entry.get(field)
            if time_str:
                try:
                    return date_parser.parse(time_str)
                except (ValueError, TypeError):
                    continue

        # 尝试 published_parsed(struct_time)
        parsed = entry.get("published_parsed")
        if parsed:
            try:
                return datetime(*parsed[:6])
            except Exception:
                pass  # struct_time parse failed, use current time below

        # 默认使用当前时间
        return datetime.now(timezone.utc).replace(tzinfo=None)

    def _build_metadata(self, entry: dict) -> dict:
        """
        构建条目元数据

        Args:
            entry: RSS 条目

        Returns:
            元数据字典
        """
        metadata = {
            "feed_name": self.feed_name,
            "feed_url": self.url,
        }

        # 提取标题
        if "title" in entry:
            metadata["title"] = entry.title

        # 提取作者
        if "author" in entry:
            metadata["author"] = entry.author

        # 提取标签/分类
        if "tags" in entry and entry.tags:
            metadata["tags"] = [tag.get("term") for tag in entry.tags if tag.get("term")]

        # 提取 GUID
        if "id" in entry:
            metadata["guid"] = entry.id

        # 提取链接
        if "link" in entry:
            metadata["link"] = entry.link

        # 提取评论链接
        if "comments" in entry:
            metadata["comments_url"] = entry.comments

        return metadata

    async def validate_config(self) -> bool:
        """验证配置是否有效"""
        if not self.url:
            return False

        if self.max_items <= 0:
            return False

        if self.timeout <= 0:
            return False

        return True
