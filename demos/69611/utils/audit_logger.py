"""Audit logger with tamper-proof hash chain for intelligence access logs.

Features:
- SHA256 hash chain linking records to detect tampering
- Redis distributed lock for multi-worker safe hash chain writes
- PostgreSQL as primary store with local file fallback
- MinIO archival with optional object lock (WORM compliance)
- Classification-aware query filtering
"""

import asyncio
import hashlib
import hmac
import json
import logging
import os
from datetime import datetime, timedelta, timezone
from io import BytesIO
from typing import Any, Dict, List, Optional
from uuid import uuid4

from utils.db_pool import get_pool_manager
from utils.timezone import business_now

logger = logging.getLogger(__name__)

# Hash chain constants
_CHAIN_SALT = "omnilog_audit_chain_v1"
_GENESIS_HASH = "GENESIS"

# Redis keys for distributed hash chain coordination
_AUDIT_REDIS_KEY = "omnilog:audit:last_hash"
_AUDIT_REDIS_TTL_SECONDS = 86400  # 24h
_AUDIT_CHAIN_LOCK_KEY = "omnilog:audit:chain_lock"
_AUDIT_CHAIN_LOCK_TTL_SECONDS = 10
_AUDIT_CHAIN_LOCK_WAIT_SECONDS = 5

# Fallback directory for audit records when PG is unavailable
_AUDIT_FALLBACK_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "audit_fallback")

# MinIO archival config
_MINIO_AUDIT_BUCKET = "omnilog-audit-archive"
_AUDIT_ARCHIVE_ENABLED = os.getenv("AUDIT_ARCHIVE_ENABLED", "false").lower() == "true"


class AuditLogger:
    """Tamper-proof audit logger with hash chain integrity.

    Every audit record contains a record_hash computed from the record
    content and the previous record's hash, forming an append-only chain.
    Any tampering breaks the chain and is detectable via verify_chain().
    """

    def __init__(self):
        self._pool_manager = None
        self._last_hash: Optional[str] = None
        self._hash_cache_lock = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_redis(self):
        """Get Redis connection for cross-worker prev_hash sharing."""
        pool = await self._get_pool_manager()
        return await pool.redis.get_connection()

    async def _fetch_last_hash_from_pg(self) -> Optional[str]:
        """Fetch the last audit record hash from PostgreSQL as fallback."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT record_hash FROM intelligence_audit_log "
                    "ORDER BY timestamp DESC, id DESC LIMIT 1"
                )
                return row["record_hash"] if row else None
        except Exception as e:
            logger.warning("Failed to fetch last audit hash from PG: %s", e)
            return None

    async def _get_last_hash(self) -> str:
        """Get the last audit record hash for the hash chain.

        Resolution order:
        1. Local cache (fastest)
        2. Redis (cross-worker shared)
        3. PostgreSQL (fallback)
        4. GENESIS (first record)
        """
        if self._hash_cache_lock is None:
            self._hash_cache_lock = asyncio.Lock()

        async with self._hash_cache_lock:
            if self._last_hash is not None:
                return self._last_hash

        try:
            redis = await self._get_redis()
            cached = await redis.get(_AUDIT_REDIS_KEY)
            if cached:
                async with self._hash_cache_lock:
                    self._last_hash = cached
                return cached
        except Exception:
            pass

        pg_hash = await self._fetch_last_hash_from_pg()
        if pg_hash:
            async with self._hash_cache_lock:
                self._last_hash = pg_hash
            return pg_hash

        return _GENESIS_HASH

    def _compute_record_hash(self, record: dict, prev_hash: str) -> str:
        """Compute the SHA256 hash for a single audit record.

        Includes all core fields plus the previous hash in the chain.
        The record_hash field itself is excluded from computation.
        """
        hash_content = {
            "prev_hash": prev_hash,
            "id": record.get("id", ""),
            "user_id": record.get("user_id", ""),
            "resource_id": record.get("resource_id", ""),
            "action": record.get("action", ""),
            "ip": record.get("ip", ""),
            "classification": record.get("classification", ""),
            "timestamp": (
                record.get("timestamp", "").isoformat()
                if hasattr(record.get("timestamp"), "isoformat")
                else str(record.get("timestamp", ""))
            ),
            "metadata": record.get("metadata", {}),
        }
        content_str = json.dumps(hash_content, sort_keys=True, ensure_ascii=False)
        return hmac.new(
            _CHAIN_SALT.encode(), content_str.encode(), hashlib.sha256
        ).hexdigest()

    async def log_access(
        self,
        user: str,
        resource: str,
        action: str,
        ip: str = "",
        classification: str = "public",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Log an intelligence access event with hash chain integrity.

        Uses a Redis distributed lock (SET NX EX) to wrap the
        read-compute-write flow, preventing hash chain breaks under
        concurrent multi-worker writes.

        Args:
            user: User identifier (API Key prefix or username).
            resource: Resource identifier (report/doc/event ID).
            action: Action performed (view/search/export/delete).
            ip: Client IP address.
            classification: Resource classification level.
            metadata: Additional metadata to store.
        """
        log_id = str(uuid4())
        timestamp = datetime.now(timezone.utc).replace(tzinfo=None)
        metadata_dict = metadata or {}

        lock_acquired = False
        redis = None
        try:
            redis = await self._get_redis()
            retry_count = max(1, _AUDIT_CHAIN_LOCK_WAIT_SECONDS * 10)
            for _ in range(retry_count):
                lock_acquired = await redis.set(
                    _AUDIT_CHAIN_LOCK_KEY,
                    "1",
                    nx=True,
                    ex=_AUDIT_CHAIN_LOCK_TTL_SECONDS,
                )
                if lock_acquired:
                    break
                await asyncio.sleep(0.1)
            if not lock_acquired:
                logger.warning(
                    "Audit hash chain lock timeout after %ds, proceeding but chain integrity may be affected",
                    _AUDIT_CHAIN_LOCK_WAIT_SECONDS,
                )
        except Exception:
            pass

        try:
            prev_hash = await self._get_last_hash()

            full_record = {
                "id": log_id,
                "user_id": user,
                "resource_id": resource,
                "action": action,
                "ip": ip,
                "classification": classification,
                "timestamp": timestamp,
                "metadata": metadata_dict,
            }

            record_hash = self._compute_record_hash(full_record, prev_hash)

            try:
                pool = await self._get_pool_manager()
                pg_pool = await pool.postgres.get_pool()

                async with pg_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO intelligence_audit_log
                        (id, user_id, resource_id, action, ip, classification,
                         metadata, timestamp, prev_hash, record_hash)
                        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
                        """,
                        log_id,
                        user,
                        resource,
                        action,
                        ip,
                        classification,
                        json.dumps(metadata_dict, ensure_ascii=False),
                        timestamp,
                        prev_hash,
                        record_hash,
                    )

                async with self._hash_cache_lock:
                    self._last_hash = record_hash

                try:
                    redis_conn = await self._get_redis()
                    await redis_conn.set(
                        _AUDIT_REDIS_KEY, record_hash, ex=_AUDIT_REDIS_TTL_SECONDS
                    )
                except Exception:
                    pass

            except Exception:
                audit_record = {
                    "id": log_id,
                    "timestamp": timestamp.isoformat(),
                    "user_id": user,
                    "resource_id": resource,
                    "action": action,
                    "ip": ip,
                    "classification": classification,
                    "metadata": metadata_dict,
                    "prev_hash": prev_hash,
                    "record_hash": record_hash,
                }
                logger.error(
                    "Audit log PG write failed, falling back to local file. Record: %s",
                    json.dumps(audit_record, ensure_ascii=False),
                )
                self._write_fallback(audit_record)
        finally:
            if lock_acquired and redis:
                try:
                    await redis.delete(_AUDIT_CHAIN_LOCK_KEY)
                except Exception:
                    pass

    def _write_fallback(self, record: dict):
        """Write an audit record to a local backup file.

        Organized by date so records can be replayed when PG recovers.
        """
        try:
            os.makedirs(_AUDIT_FALLBACK_DIR, exist_ok=True)
            date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            filepath = os.path.join(_AUDIT_FALLBACK_DIR, f"audit_{date_str}.jsonl")
            with open(filepath, "a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
        except Exception as fallback_err:
            logger.error("Audit local fallback write also failed: %s", fallback_err)

    async def verify_chain(self, limit: int = 1000) -> Dict[str, Any]:
        """Verify hash chain integrity for the most recent records.

        Scans records from oldest to newest, recomputing each hash.
        Reports the first broken link and total tampered count.

        Returns:
            {
                "total_checked": int,
                "valid": bool,
                "broken_at": Optional[str],
                "broken_count": int,
            }
        """
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()

            async with pg_pool.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT id, user_id, resource_id, action, ip, classification, "
                    "metadata, timestamp, prev_hash, record_hash "
                    "FROM intelligence_audit_log "
                    "ORDER BY timestamp DESC, id DESC LIMIT $1",
                    limit,
                )

            if not rows:
                return {
                    "total_checked": 0,
                    "valid": True,
                    "broken_at": None,
                    "broken_count": 0,
                }

            rows_list = list(reversed(rows))
            expected_prev = _GENESIS_HASH
            broken_at = None
            broken_count = 0

            for row in rows_list:
                record = dict(row)
                stored_hash = record.pop("record_hash", "")
                stored_prev = record.pop("prev_hash", "")

                if stored_prev != expected_prev:
                    if broken_at is None:
                        broken_at = record["id"]
                    broken_count += 1
                    expected_prev = stored_hash
                    continue

                computed_hash = self._compute_record_hash(record, stored_prev)
                if computed_hash != stored_hash:
                    if broken_at is None:
                        broken_at = record["id"]
                    broken_count += 1

                expected_prev = stored_hash

            return {
                "total_checked": len(rows_list),
                "valid": broken_count == 0,
                "broken_at": broken_at,
                "broken_count": broken_count,
            }
        except Exception as e:
            logger.error("Hash chain verification failed: %s", e)
            return {
                "total_checked": 0,
                "valid": False,
                "broken_at": None,
                "broken_count": 0,
                "error": str(e),
            }

    async def archive_to_minio(self, date: Optional[datetime] = None) -> bool:
        """Archive audit logs for a given date to MinIO.

        Archived files are immutable when object lock is enabled,
        satisfying WORM compliance requirements.

        Args:
            date: Date to archive (default: yesterday).

        Returns:
            True if archival succeeded or there were no records.
        """
        if not _AUDIT_ARCHIVE_ENABLED:
            return False

        try:
            if date is None:
                date = business_now() - timedelta(days=1)

            date_str = date.strftime("%Y-%m-%d")
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()

            start = datetime.combine(date, datetime.min.time())
            end = start + timedelta(days=1)

            async with pg_pool.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT * FROM intelligence_audit_log "
                    "WHERE timestamp >= $1 AND timestamp < $2 "
                    "ORDER BY timestamp ASC",
                    start,
                    end,
                )

            if not rows:
                return True

            lines = []
            for row in rows:
                record = dict(row)
                for k, v in record.items():
                    if hasattr(v, "isoformat"):
                        record[k] = v.isoformat()
                lines.append(json.dumps(record, ensure_ascii=False, default=str))

            content = "\n".join(lines).encode("utf-8")
            object_name = f"audit_{date_str}.jsonl"

            pool = await self._get_pool_manager()
            # 修复: ConnectionPoolManager 没有 minio 属性 (仅有
            # redis/elasticsearch/neo4j/mongodb/postgres).
            # 原代码 `pool.minio.get_client()` 必抛 AttributeError,
            # 被外层 except 捕获后返回 False, 审计归档功能完全不可用.
            # 改为防御性检查: 若 MinIO 池未配置, 跳过归档并记录明确告警.
            minio_pool = getattr(pool, "minio", None)
            if minio_pool is None:
                logger.warning(
                    "Audit archive skipped: MinIO pool not configured on "
                    "ConnectionPoolManager. %d records for %s not archived. "
                    "To enable, add a MinIO pool to ConnectionPoolManager.",
                    len(rows), date_str,
                )
                return False

            # MinIO SDK 调用是同步的, 在 async 上下文中应通过 to_thread 避免阻塞事件循环
            minio_client = await minio_pool.get_client()

            # 修复: MinIO SDK 的 bucket_exists/make_bucket/put_object 是同步方法,
            # 直接在 async 函数中调用会阻塞事件循环. 用 asyncio.to_thread 包装.
            import asyncio as _asyncio
            bucket_exists = await _asyncio.to_thread(
                minio_client.bucket_exists, _MINIO_AUDIT_BUCKET
            )
            if not bucket_exists:
                await _asyncio.to_thread(
                    minio_client.make_bucket, _MINIO_AUDIT_BUCKET
                )

            await _asyncio.to_thread(
                minio_client.put_object,
                bucket_name=_MINIO_AUDIT_BUCKET,
                object_name=object_name,
                data=BytesIO(content),
                length=len(content),
                content_type="application/x-ndjson",
            )

            logger.info(
                "Audit archive complete: %s, %d records -> %s/%s",
                date_str,
                len(rows),
                _MINIO_AUDIT_BUCKET,
                object_name,
            )
            return True

        except Exception as e:
            logger.error("Audit archive failed: %s", e, exc_info=True)
            return False

    async def query_logs(
        self,
        user: Optional[str] = None,
        resource: Optional[str] = None,
        action: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
        max_classification: Optional[str] = None,
    ) -> list:
        """Query audit logs with optional filters.

        Args:
            user: Filter by user identifier.
            resource: Filter by resource identifier.
            action: Filter by action type.
            start_time: Filter records after this time.
            end_time: Filter records before this time.
            limit: Maximum records to return.
            max_classification: Only return records at or below this
                classification level (fail-safe: defaults to public).

        Returns:
            List of audit record dicts.
        """
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()

            conditions = []
            params = []
            idx = 1

            if user:
                conditions.append(f"user_id = ${idx}")
                params.append(user)
                idx += 1
            if resource:
                conditions.append(f"resource_id = ${idx}")
                params.append(resource)
                idx += 1
            if action:
                conditions.append(f"action = ${idx}")
                params.append(action)
                idx += 1
            if start_time:
                conditions.append(f"timestamp >= ${idx}")
                params.append(start_time)
                idx += 1
            if end_time:
                conditions.append(f"timestamp <= ${idx}")
                params.append(end_time)
                idx += 1

            if max_classification is not None:
                from utils.classification import get_classifier
                classifier = get_classifier()
                allowed_levels = [
                    lvl
                    for lvl, info in classifier.LEVELS.items()
                    if info["level"]
                    <= classifier.LEVELS.get(
                        max_classification, classifier.LEVELS["public"]
                    )["level"]
                ]
                placeholders = ", ".join(
                    f"${idx + i}" for i in range(len(allowed_levels))
                )
                conditions.append(f"classification IN ({placeholders})")
                params.extend(allowed_levels)
                idx += len(allowed_levels)

            where_clause = " AND ".join(conditions) if conditions else "TRUE"
            params.append(limit)

            async with pg_pool.acquire() as conn:
                rows = await conn.fetch(
                    f"SELECT * FROM intelligence_audit_log "
                    f"WHERE {where_clause} "
                    f"ORDER BY timestamp DESC LIMIT ${idx}",
                    *params,
                )
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error("Audit log query failed: %s", e)
            return []


# Global singleton
_audit_logger: Optional[AuditLogger] = None


def get_audit_logger() -> AuditLogger:
    """Get or create the global AuditLogger singleton."""
    global _audit_logger
    if _audit_logger is None:
        _audit_logger = AuditLogger()
    return _audit_logger
