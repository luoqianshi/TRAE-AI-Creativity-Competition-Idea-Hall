"""Redis Stream consumer base class.

Extracts common logic for PEL reclaim (xautoclaim), retry counting,
DLQ, and local dead-letter fallback. Shared by pipelines.write_consumers
and analysis.consumer to eliminate duplicate implementations.

Key behaviors:
- DLQ write failures do NOT ACK; messages stay in PEL for next retry
- Exceeding DLQ failure limit triggers forced ACK + local dead-letter log
- Bounded retry counter (OrderedDict) prevents OOM from PEL growth
"""

import asyncio
import json
import logging
import os
import time
from collections import OrderedDict
from typing import Any, Dict, Optional

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

# Default configuration
DEFAULT_BATCH_SIZE = 10
DEFAULT_BATCH_TIMEOUT_MS = 5000
DEFAULT_MAX_RETRY_COUNT = 3
DEFAULT_MAX_RETRY_TRACKED = 10000
DEFAULT_PEL_RECLAIM_MIN_IDLE_MS = 300000  # 5 minutes
DEFAULT_DLQ_FAIL_RETRY_LIMIT = 5

# Local dead-letter directory
_LOCAL_DLQ_DIR = os.path.join(
    os.path.dirname(__file__), "..", "data", "dead_letter"
)


class BaseStreamConsumer:
    """Base Redis Stream consumer with retry, DLQ, and PEL reclaim.

    Subclasses must override class attributes:
        input_stream, consumer_group, consumer_name, dlq_stream
    """

    # Subclass must override these
    input_stream: str = ""
    consumer_group: str = ""
    consumer_name: str = ""
    dlq_stream: str = ""

    # Overridable configuration
    batch_size: int = DEFAULT_BATCH_SIZE
    batch_timeout_ms: int = DEFAULT_BATCH_TIMEOUT_MS
    max_retry_count: int = DEFAULT_MAX_RETRY_COUNT
    max_retry_tracked: int = DEFAULT_MAX_RETRY_TRACKED
    pel_reclaim_min_idle_ms: int = DEFAULT_PEL_RECLAIM_MIN_IDLE_MS
    dlq_fail_retry_limit: int = DEFAULT_DLQ_FAIL_RETRY_LIMIT

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url
        self._redis: Optional[aioredis.Redis] = None
        self._running: bool = False
        # 修复: 标记 _redis 是否来自统一连接池.
        # True: stop() 时不应关闭它 (会破坏共享池); False: 独立连接, 应关闭.
        self._redis_from_pool: bool = False

    # ============================================================
    # Redis connection
    # ============================================================

    async def _get_redis(self) -> aioredis.Redis:
        """Get Redis client (prefers unified connection pool).

        修复: 原代码 `pool = await get_pool_manager()` 中,
        get_pool_manager 是同步函数, await 它会抛
        TypeError: object ConnectionPoolManager can't be used in 'await' expression.
        except 捕获后降级为 aioredis.from_url 新建独立连接,
        导致连接池永远不被使用, 每个消费者创建独立 Redis 连接.
        """
        if self._redis is None:
            if not self.redis_url:
                raise RuntimeError("redis_url not configured")
            try:
                from utils.db_pool import get_pool_manager
                # 修复: 去掉 await (get_pool_manager 是同步函数)
                pool = get_pool_manager()
                self._redis = await pool.redis.get_connection()
                # 标记此连接来自池, stop() 时不应关闭它
                self._redis_from_pool = True
                return self._redis
            except Exception as e:
                logger.warning(
                    "Pool Redis unavailable, using standalone: %s", e
                )
                self._redis_from_pool = False
            self._redis = aioredis.from_url(
                self.redis_url, decode_responses=True, max_connections=10
            )
        return self._redis

    # ============================================================
    # Consumer group management
    # ============================================================

    async def _ensure_group(self):
        """Ensure the consumer group exists, creating it if needed."""
        redis = await self._get_redis()
        try:
            await redis.xgroup_create(
                self.input_stream,
                self.consumer_group,
                id="0",
                mkstream=True,
            )
            logger.info(
                "Created consumer group %s on stream %s",
                self.consumer_group,
                self.input_stream,
            )
        except aioredis.ResponseError as e:
            if "BUSYGROUP" not in str(e):
                raise

    # ============================================================
    # Retry counter
    # ============================================================

    def make_retry_counter(self) -> OrderedDict:
        """Create a bounded OrderedDict for tracking message retry counts."""
        return OrderedDict()

    def bump_retry(self, counter: OrderedDict, msg_id: str) -> int:
        """Increment retry count for a message and enforce the bounded cap."""
        count = counter.get(msg_id, 0) + 1
        counter[msg_id] = count
        if len(counter) > self.max_retry_tracked:
            counter.popitem(last=False)
        return count

    def clear_retry(self, counter: OrderedDict, msg_id: str):
        """Remove a message from the retry counter."""
        counter.pop(msg_id, None)

    # ============================================================
    # PEL reclaim
    # ============================================================

    async def reclaim_stale_messages(self, retry_counts: OrderedDict):
        """Reclaim stale messages from the PEL using xautoclaim."""
        try:
            redis = await self._get_redis()
            while True:
                results = await redis.xautoclaim(
                    name=self.input_stream,
                    groupname=self.consumer_group,
                    consumername=self.consumer_name,
                    min_idle_time=self.pel_reclaim_min_idle_ms,
                    count=self.batch_size,
                )
                claimed_messages = results[1] if len(results) > 1 else []
                if not claimed_messages:
                    break
                for msg_id, msg_data in claimed_messages:
                    logger.warning(
                        "Reclaimed stale PEL message: %s", msg_id
                    )
        except Exception as e:
            logger.debug("PEL reclaim check failed: %s", e)

    # ============================================================
    # DLQ (Dead Letter Queue)
    # ============================================================

    async def send_to_dlq(
        self, msg_id: Any, msg_data: Dict, reason: str
    ) -> bool:
        """Send a message to the DLQ stream.

        Returns True if the DLQ write succeeded.
        """
        try:
            redis = await self._get_redis()
            await redis.xadd(
                self.dlq_stream,
                {
                    "original_msg_id": str(msg_id),
                    "data": json.dumps(msg_data, ensure_ascii=False, default=str),
                    "reason": reason,
                    "timestamp": str(time.time()),
                },
                maxlen=10000,
            )
            return True
        except Exception as e:
            logger.error("DLQ write failed: %s", e)
            return False

    async def check_dlq_failure_limit(self, msg_id: str) -> bool:
        """Check if DLQ failures exceed limit, forcing ACK if so."""
        failures = getattr(self, "_dlq_failures", {})
        count = failures.get(msg_id, 0) + 1
        failures[msg_id] = count
        self._dlq_failures = failures
        if count >= self.dlq_fail_retry_limit:
            self._write_local_dead_letter(msg_id, "DLQ failure limit exceeded")
            return True
        return False

    def _write_local_dead_letter(self, msg_id: str, reason: str):
        """Write a dead-letter record to the local filesystem."""
        try:
            os.makedirs(_LOCAL_DLQ_DIR, exist_ok=True)
            filepath = os.path.join(
                _LOCAL_DLQ_DIR,
                f"dead_letter_{time.strftime('%Y%m%d')}.jsonl",
            )
            with open(filepath, "a", encoding="utf-8") as f:
                f.write(
                    json.dumps(
                        {
                            "msg_id": str(msg_id),
                            "reason": reason,
                            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
                        },
                        ensure_ascii=False,
                    )
                    + "\n"
                )
        except Exception as e:
            logger.error("Local dead-letter write failed: %s", e)

    # ============================================================
    # Message processing
    # ============================================================

    async def process_message(self, msg_data: Dict[str, Any]) -> None:
        """Process a single message (subclass must implement)."""
        raise NotImplementedError

    # ============================================================
    # Consume loop
    # ============================================================

    async def consume(self) -> None:
        """Consume messages from Redis Stream with retry and DLQ support."""
        await self._ensure_group()
        self._running = True
        logger.info(
            "%s started, consuming %s", self.__class__.__name__, self.input_stream
        )

        redis = await self._get_redis()
        retry_counts = self.make_retry_counter()

        while self._running:
            try:
                await self.reclaim_stale_messages(retry_counts)

                results = await redis.xreadgroup(
                    groupname=self.consumer_group,
                    consumername=self.consumer_name,
                    streams={self.input_stream: ">"},
                    count=self.batch_size,
                    block=self.batch_timeout_ms,
                )

                if not results:
                    continue

                for _stream, messages in results:
                    for msg_id, msg_data in messages:
                        msg_id_str = str(msg_id)
                        try:
                            await self.process_message(msg_data)
                            await redis.xack(
                                self.input_stream,
                                self.consumer_group,
                                msg_id,
                            )
                            self.clear_retry(retry_counts, msg_id_str)
                        except Exception as e:
                            logger.error(
                                "Message processing failed %s: %s",
                                msg_id,
                                e,
                                exc_info=True,
                            )
                            count = self.bump_retry(retry_counts, msg_id_str)
                            if count >= self.max_retry_count:
                                dlq_ok = await self.send_to_dlq(
                                    msg_id,
                                    msg_data,
                                    f"Exceeded max retry count {self.max_retry_count}",
                                )
                                if dlq_ok:
                                    await redis.xack(
                                        self.input_stream,
                                        self.consumer_group,
                                        msg_id,
                                    )
                                    self.clear_retry(retry_counts, msg_id_str)
                                    logger.warning(
                                        "Message %s exceeded max retries (%d), sent to DLQ",
                                        msg_id,
                                        self.max_retry_count,
                                    )
                                else:
                                    force_ack = await self.check_dlq_failure_limit(
                                        msg_id_str
                                    )
                                    if force_ack:
                                        await redis.xack(
                                            self.input_stream,
                                            self.consumer_group,
                                            msg_id,
                                        )
                                        self.clear_retry(retry_counts, msg_id_str)
                                    else:
                                        logger.error(
                                            "Message %s DLQ write failed, keeping in PEL for retry",
                                            msg_id,
                                        )
                            else:
                                logger.warning(
                                    "Message %s processing failed (attempt %d/%d), will retry",
                                    msg_id,
                                    count,
                                    self.max_retry_count,
                                )

            except asyncio.CancelledError:
                logger.info("Consumer cancelled")
                break
            except Exception as e:
                logger.error("Consume loop error: %s", e, exc_info=True)
                await asyncio.sleep(1)

    async def stop(self) -> None:
        """Stop the consumer and close connections.

        修复: 若 _redis 来自统一连接池, aclose() 会关闭整个池,
        影响所有其他使用者. 仅关闭独立创建的连接.
        """
        self._running = False
        if self._redis and not self._redis_from_pool:
            await self._redis.aclose()
        self._redis = None
        logger.info("%s stopped", self.__class__.__name__)
