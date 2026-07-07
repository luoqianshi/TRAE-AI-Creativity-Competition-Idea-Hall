"""Redis cache layer for hot-query caching.

Cache failures do not block business logic — the system degrades
gracefully to direct queries. Includes cache penetration protection
via empty-result sentinels and cache avalanche prevention via TTL jitter.
"""

import asyncio
import json
import logging
import random
from typing import Any, Optional

from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

# Sentinel value for empty results to prevent cache penetration
_EMPTY_SENTINEL = "__OMNILOG_CACHE_EMPTY__"
_EMPTY_TTL = 60  # TTL for cached empty results (seconds)


class CacheManager:
    """Redis cache manager with penetration and avalanche protection.

    Usage:
        cache = get_cache_manager()
        result = await cache.get_or_set(
            "top_entities:today",
            lambda: graph_service.compute_top_entities(),
            ttl=300
        )
    """

    def __init__(self):
        self._pool_manager = None
        self._key_locks: dict = {}
        self._locks_lock = asyncio.Lock()

    def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_key_lock(self, key: str) -> asyncio.Lock:
        """Get a per-key asyncio.Lock to prevent cache stampede."""
        async with self._locks_lock:
            if key not in self._key_locks:
                self._key_locks[key] = asyncio.Lock()
            return self._key_locks[key]

    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache. Returns None on miss or failure."""
        try:
            pool = self._get_pool_manager()
            redis = await pool.redis.get_connection()
            raw = await redis.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as e:
            logger.warning("Cache get failed for key %s: %s", key, e)
            return None

    async def set(self, key: str, value: Any, ttl: int = 300):
        """Set a value in cache with TTL jitter to prevent avalanche.

        TTL is randomized by +/-10% so keys don't expire simultaneously.
        """
        try:
            pool = self._get_pool_manager()
            redis = await pool.redis.get_connection()

            jitter = int(ttl * 0.1)
            actual_ttl = ttl + random.randint(-jitter, jitter) if jitter > 0 else ttl
            actual_ttl = max(actual_ttl, 1)

            await redis.setex(key, actual_ttl, json.dumps(value, default=str))
        except Exception as e:
            logger.warning("Cache set failed for key %s: %s", key, e)

    async def get_or_set(
        self,
        key: str,
        factory,
        ttl: int = 300,
    ) -> Optional[Any]:
        """Get from cache, or compute via factory and cache the result.

        Uses per-key locking to prevent cache stampede: only one concurrent
        caller invokes the factory per key. Empty results are cached with
        a short TTL to prevent cache penetration.
        """
        # Check cache first
        cached = await self.get(key)
        if cached is not None:
            if cached == _EMPTY_SENTINEL:
                return None
            return cached

        # Acquire per-key lock to prevent stampede
        key_lock = await self._get_key_lock(key)
        async with key_lock:
            # Double-check: cache may have been filled while waiting for lock
            cached = await self.get(key)
            if cached is not None:
                if cached == _EMPTY_SENTINEL:
                    return None
                return cached

            # Compute value via factory
            value = await factory()

            # Cache the result (empty results too, to prevent penetration)
            if value is None or (isinstance(value, (list, dict)) and len(value) == 0):
                await self.set(key, _EMPTY_SENTINEL, ttl=_EMPTY_TTL)
            else:
                await self.set(key, value, ttl)

            return value

    async def delete(self, key: str):
        """Delete a cached key."""
        try:
            pool = self._get_pool_manager()
            redis = await pool.redis.get_connection()
            await redis.delete(key)
        except Exception as e:
            logger.warning("Cache delete failed for key %s: %s", key, e)

    async def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching a pattern.

        Uses SCAN to iterate matching keys and delete them in batches,
        avoiding the blocking KEYS command.
        """
        try:
            pool = self._get_pool_manager()
            redis = await pool.redis.get_connection()

            cursor = 0
            while True:
                cursor, keys = await redis.scan(cursor, match=pattern, count=100)
                if keys:
                    await redis.delete(*keys)
                if int(cursor) == 0:
                    break
        except Exception as e:
            logger.warning("Cache pattern invalidation failed for %s: %s", pattern, e)


# Global singleton
_cache_manager: Optional[CacheManager] = None


def get_cache_manager() -> CacheManager:
    """Get or create the global CacheManager singleton."""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = CacheManager()
    return _cache_manager
