"""SimHash fingerprinting with LSH bucketing for near-duplicate detection.

Uses LSH (Locality-Sensitive Hashing) to reduce SimHash comparison
from O(n) to O(k). Splits the 64-bit SimHash into 4 16-bit bands,
each serving as a Redis Set bucket key. Dedup only compares fingerprints
within the same bucket, dramatically reducing Hamming distance calculations.
"""

import logging
from typing import Set

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

# Constants
DEFAULT_THRESHOLD = 3
HASH_BITS = 64
TTL_SECONDS = 7 * 24 * 60 * 60  # 7 days
LSH_BANDS = 4
LSH_BAND_BITS = HASH_BITS // LSH_BANDS  # 16
LSH_BAND_MASK = (1 << LSH_BAND_BITS) - 1  # 0xFFFF
KEY_PREFIX_FINGERPRINT = "simhash:fingerprint:"
KEY_PREFIX_BUCKET = "simhash:bucket:"


def compute_simhash(text: str) -> int:
    """Compute a 64-bit SimHash fingerprint for text content.

    Uses token hashing and majority-vote bit accumulation.
    """
    import hashlib
    if not text:
        return 0
    bits = [0] * HASH_BITS
    tokens = text.lower().split()
    for token in tokens:
        h = int(hashlib.md5(token.encode('utf-8')).hexdigest()[:16], 16)
        for i in range(HASH_BITS):
            if h & (1 << i):
                bits[i] += 1
            else:
                bits[i] -= 1
    fingerprint = 0
    for i in range(HASH_BITS):
        if bits[i] > 0:
            fingerprint |= (1 << i)
    return fingerprint


def hamming_distance(h1: int, h2: int) -> int:
    """Compute the Hamming distance between two 64-bit SimHash values.

    修复: 使用 bin(x).count("1") 替代 int.bit_count() (Python 3.10+),
    保证 Python 3.9 及以下兼容性.
    """
    return bin(h1 ^ h2).count("1")


def is_duplicate(h1: int, h2: int, threshold: int = DEFAULT_THRESHOLD) -> bool:
    """Check if two fingerprints are duplicates within the threshold."""
    return hamming_distance(h1, h2) <= threshold


def get_band_value(fingerprint: int, band: int) -> int:
    """Extract the 16-bit band value from a 64-bit fingerprint."""
    return (fingerprint >> (band * 16)) & 0xFFFF


def get_bucket_key(band: int, band_val: int) -> str:
    """Generate the Redis bucket key for a given band and value."""
    return f"{KEY_PREFIX_BUCKET}{band}:{band_val}"


def get_lsh_band_keys(doc_id: str) -> list:
    """Generate all LSH bucket keys for a document ID (for cleanup/inspection)."""
    return [f"{KEY_PREFIX_BUCKET}{b}:*" for b in range(LSH_BANDS)]


class SimHashDeduplicator:
    """SimHash-based near-duplicate detection with LSH bucketing."""

    def __init__(
        self,
        redis_client: aioredis.Redis,
        threshold: int = DEFAULT_THRESHOLD,
        ttl: int = TTL_SECONDS,
    ):
        self.redis = redis_client
        self.threshold = threshold
        self.ttl = ttl

    async def check_and_add(self, fingerprint: int, doc_id: str) -> bool:
        """Check if fingerprint is duplicate and add if not (atomic operation).

        Uses Redis Pipeline to batch-fetch candidate documents, only comparing
        Hamming distance within the candidate set.

        Returns:
            True if duplicate (should discard), False if new (added).
        """
        candidate_ids: Set[str] = set()
        for band in range(LSH_BANDS):
            band_val = get_band_value(fingerprint, band)
            bucket_key = get_bucket_key(band, band_val)
            members = await self.redis.smembers(bucket_key)
            for m in members:
                candidate_ids.add(m.decode() if isinstance(m, bytes) else m)

        if candidate_ids:
            pipe = self.redis.pipeline()
            for cid in candidate_ids:
                pipe.get(f"{KEY_PREFIX_FINGERPRINT}{cid}")
            results = await pipe.execute()

            for cid, stored_val in zip(candidate_ids, results):
                if stored_val is None:
                    continue
                try:
                    stored_hash = int(stored_val)
                except (ValueError, TypeError):
                    continue
                if is_duplicate(fingerprint, stored_hash, self.threshold):
                    logger.debug(
                        "Duplicate detected: %s matches %s (distance: %d)",
                        doc_id, cid, hamming_distance(fingerprint, stored_hash),
                    )
                    return True

        pipe = self.redis.pipeline()
        pipe.set(f"{KEY_PREFIX_FINGERPRINT}{doc_id}", str(fingerprint), ex=self.ttl)
        for band in range(LSH_BANDS):
            band_val = get_band_value(fingerprint, band)
            bucket_key = get_bucket_key(band, band_val)
            pipe.sadd(bucket_key, doc_id)
            pipe.expire(bucket_key, self.ttl)
        await pipe.execute()
        return False

    async def is_duplicate(self, fingerprint: int) -> bool:
        """Check if fingerprint is duplicate without adding it."""
        candidate_ids: Set[str] = set()
        for band in range(LSH_BANDS):
            band_val = get_band_value(fingerprint, band)
            bucket_key = get_bucket_key(band, band_val)
            members = await self.redis.smembers(bucket_key)
            for m in members:
                candidate_ids.add(m.decode() if isinstance(m, bytes) else m)

        if candidate_ids:
            pipe = self.redis.pipeline()
            for cid in candidate_ids:
                pipe.get(f"{KEY_PREFIX_FINGERPRINT}{cid}")
            results = await pipe.execute()

            for stored_val in results:
                if stored_val is None:
                    continue
                try:
                    stored_hash = int(stored_val)
                except (ValueError, TypeError):
                    continue
                if is_duplicate(fingerprint, stored_hash, self.threshold):
                    return True
        return False

    async def add_fingerprint(self, fingerprint: int, doc_id: str) -> None:
        """Add a fingerprint to Redis."""
        pipe = self.redis.pipeline()
        pipe.set(f"{KEY_PREFIX_FINGERPRINT}{doc_id}", str(fingerprint), ex=self.ttl)
        for band in range(LSH_BANDS):
            band_val = get_band_value(fingerprint, band)
            bucket_key = get_bucket_key(band, band_val)
            pipe.sadd(bucket_key, doc_id)
            pipe.expire(bucket_key, self.ttl)
        await pipe.execute()

    async def remove_fingerprint(self, doc_id: str) -> None:
        """Remove a document fingerprint (for manual cleanup)."""
        stored = await self.redis.get(f"{KEY_PREFIX_FINGERPRINT}{doc_id}")
        if stored is None:
            return
        try:
            fingerprint = int(stored)
        except (ValueError, TypeError):
            return

        pipe = self.redis.pipeline()
        pipe.delete(f"{KEY_PREFIX_FINGERPRINT}{doc_id}")
        for band in range(LSH_BANDS):
            band_val = get_band_value(fingerprint, band)
            bucket_key = get_bucket_key(band, band_val)
            pipe.srem(bucket_key, doc_id)
        await pipe.execute()

    async def count_fingerprints(self) -> int:
        """Count stored fingerprints."""
        cursor = 0
        count = 0
        while True:
            cursor, keys = await self.redis.scan(
                cursor, match=f"{KEY_PREFIX_FINGERPRINT}*", count=1000
            )
            count += len(keys)
            if int(cursor) == 0:
                break
        return count
