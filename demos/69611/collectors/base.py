"""采集器基础模块 — 定义原始文档数据结构和采集器抽象基类. """

import hashlib
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------


@dataclass
class RawDocument:
    """原始文档——采集器产出的最小数据单元. """

    source: str
    raw_content: str
    url: Optional[str] = None
    timestamp: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEDUP_TTL = 7 * 24 * 60 * 60
DEDUP_FAILURE_THRESHOLD = 5
DEDUP_KEY_PREFIX = "collector:dedup:"
WATERMARK_KEY_PREFIX = "collector:watermark:"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# BaseCollector
# ---------------------------------------------------------------------------


class BaseCollector(ABC):
    """采集器抽象基类. """

    _status_recorder: Optional[Any] = None

    def __init__(self, config: dict) -> None:
        self.config = config
        self.name = config.get("name", self.__class__.__name__)
        self.enabled = config.get("enabled", True)
        self._redis: Optional[aioredis.Redis] = None
        self._dedup_enabled = config.get("dedup_enabled", True)
        self._consecutive_dedup_failures = 0

    # ------------------------------------------------------------------
    # Redis helpers
    # ------------------------------------------------------------------

    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            try:
                from utils.db_pool import get_pool_manager
                pool = await get_pool_manager()
                self._redis = await pool.redis.get_connection()
            except Exception as exc:
                logger.warning("fallback to standalone Redis: %s", exc)
                redis_url = self.config.get("redis_url", "redis://localhost:6379")
                self._redis = aioredis.from_url(redis_url, decode_responses=True, max_connections=10)
        return self._redis

    def _dedup_key(self) -> str:
        return f"{DEDUP_KEY_PREFIX}{self.name}"

    def _watermark_key(self) -> str:
        return f"{WATERMARK_KEY_PREFIX}{self.name}"

    # ------------------------------------------------------------------
    # Dedup
    # ------------------------------------------------------------------

    async def _is_url_collected(self, url: str) -> bool:
        if not self._dedup_enabled or not url:
            return False
        try:
            redis = await self._get_redis()
            url_hash = hashlib.md5(url.encode()).hexdigest()
            # SISMEMBER returns 1 if member exists
            exists = await redis.sismember(self._dedup_key(), url_hash)
            if not exists:
                async with redis.pipeline() as pipe:
                    pipe.sadd(self._dedup_key(), url_hash)
                    pipe.expire(self._dedup_key(), DEDUP_TTL)
                    await pipe.execute()
            return bool(exists)
        except Exception:
            return False

    async def _filter_duplicate_urls(
        self, documents: List[RawDocument]
    ) -> List[RawDocument]:
        if not self._dedup_enabled:
            return documents
        unique = []
        for doc in documents:
            if doc.url and await self._is_url_collected(doc.url):
                continue
            unique.append(doc)
        return unique

    async def _mark_documents_collected(self, documents: List[RawDocument]) -> None:
        for doc in documents:
            if doc.url:
                await self._is_url_collected(doc.url)  # idempotent mark

    # ------------------------------------------------------------------
    # Watermark
    # ------------------------------------------------------------------

    async def get_watermark(self) -> Optional[datetime]:
        try:
            redis = await self._get_redis()
            val = await redis.get(self._watermark_key())
            if val:
                return datetime.fromisoformat(val)
        except Exception:
            pass
        return None

    async def _update_watermark(self, timestamp: Optional[datetime] = None) -> None:
        try:
            redis = await self._get_redis()
            await redis.set(
                self._watermark_key(),
                (timestamp or _utc_now()).isoformat(),
            )
        except Exception:
            logger.exception("Failed to update watermark")

    # ------------------------------------------------------------------
    # Status recorder (injected by scheduler)
    # ------------------------------------------------------------------

    @classmethod
    def set_status_recorder(cls, recorder: Any) -> None:
        cls._status_recorder = recorder

    async def _get_status_recorder(self):
        return BaseCollector._status_recorder

    async def _record_request(
        self,
        url: str,
        method: str = "GET",
        status_code: Optional[int] = None,
        response_time_ms: Optional[int] = None,
        retry_count: int = 0,
        content_length: Optional[int] = None,
        error_message: Optional[str] = None,
        run_id: Optional[int] = None,
        requested_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
    ) -> None:
        recorder = await self._get_status_recorder()
        if recorder is None:
            return
        try:
            await recorder.record_request(
                collector_type=self.__class__.__name__,
                url=url,
                method=method,
                status_code=status_code,
                response_time_ms=response_time_ms,
                retry_count=retry_count,
                content_length=content_length,
                error_message=error_message,
                run_id=run_id,
                requested_at=requested_at or _utc_now(),
                completed_at=completed_at or _utc_now(),
            )
        except Exception as e:
            logger.debug("record_request failed: %s", e)

    # ------------------------------------------------------------------
    # Collect (abstract)
    # ------------------------------------------------------------------

    @abstractmethod
    async def collect(self) -> List[RawDocument]:
        """执行全量数据采集. 子类必须实现. """

    async def collect_with_dedup(self) -> List[RawDocument]:
        """带 URL 去重的全量采集."""
        documents = await self.collect()
        if not documents:
            return []
        unique = await self._filter_duplicate_urls(documents)
        if unique:
            await self._mark_documents_collected(unique)
        await self._update_watermark()
        return unique

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def validate_config(self) -> bool:
        return True

    async def close(self) -> None:
        if self._redis:
            await self._redis.close()

    def __repr__(self) -> str:
        return f"<{type(self).__name__}(name={self.name}, enabled={self.enabled})>"
