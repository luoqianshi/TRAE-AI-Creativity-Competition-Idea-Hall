"""PostgreSQL 状态记录模块 - 记录采集运行状态"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from enum import Enum

import asyncpg

logger = logging.getLogger(__name__)


class RunStatus(str, Enum):
    """采集运行状态枚举"""
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"


class IngestionRunRecorder:
    """采集运行状态记录器"""

    def __init__(self, dsn: str):
        self.dsn = dsn
        self._pool: Optional[asyncpg.Pool] = None
        self._connect_lock = asyncio.Lock()

    async def connect(self):
        """连接数据库连接池"""
        if self._pool is not None:
            return
        async with self._connect_lock:
            if self._pool is not None:
                return
            self._pool = await asyncpg.create_pool(self.dsn, min_size=2, max_size=10)

    async def disconnect(self):
        """断开数据库连接"""
        if self._pool:
            await self._pool.close()
            self._pool = None

    async def start_run(self, source: str) -> int:
        """记录开始采集"""
        await self.connect()
        async with self._pool.acquire() as conn:
            return await conn.fetchval(
                "INSERT INTO ingestion_runs (source, status) VALUES ($1, 'running') RETURNING id",
                source,
            )

    async def finish_run(
        self, run_id: int, status: RunStatus, docs_count: int = 0,
        error_message: Optional[str] = None,
    ):
        """记录采集完成"""
        await self.connect()
        async with self._pool.acquire() as conn:
            await conn.execute(
                "UPDATE ingestion_runs SET status=$1, docs_count=$2, error_message=$3, end_time=NOW() WHERE id=$4",
                status.value, docs_count, error_message, run_id,
            )

    async def get_source_stats(self, source: str, hours: int = 24) -> Optional[dict]:
        """获取采集源统计信息"""
        await self.connect()
        threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=hours)
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT COUNT(*) as total_runs,
                       COUNT(CASE WHEN status = 'success' THEN 1 END) as success_runs,
                       COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_runs,
                       COALESCE(SUM(docs_count), 0) as total_docs,
                       MAX(end_time) as last_run_time
                FROM ingestion_runs
                WHERE source = $1 AND start_time > $2
                """, source, threshold,
            )
            if not row or row["total_runs"] == 0:
                return None
            avg_docs = row["total_docs"] / row["total_runs"] if row["total_runs"] > 0 else 0
            return {
                "source": source,
                "total_runs": row["total_runs"],
                "success_runs": row["success_runs"],
                "failed_runs": row["failed_runs"],
                "total_docs": row["total_docs"],
                "avg_docs_per_run": avg_docs,
                "last_run_time": row["last_run_time"],
                "consecutive_failures": 0,
            }

    async def record_request(
        self, collector_type: str, url: str, method: str = "GET",
        status_code: Optional[int] = None, response_time_ms: Optional[int] = None,
        retry_count: int = 0, content_length: Optional[int] = None,
        error_message: Optional[str] = None, user_agent: Optional[str] = None,
        run_id: Optional[int] = None, requested_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
    ) -> Optional[int]:
        """记录单个采集请求"""
        if not url:
            return None
        await self.connect()
        import hashlib as _hashlib
        url_hash = _hashlib.md5(url.encode()).hexdigest()
        now = requested_at or datetime.now(timezone.utc).replace(tzinfo=None)
        try:
            async with self._pool.acquire() as conn:
                return await conn.fetchval(
                    """
                    INSERT INTO collector_requests
                        (run_id, collector_type, url, url_hash, method,
                         status_code, response_time_ms, retry_count,
                         content_length, error_message, user_agent,
                         requested_at, completed_at)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
                    RETURNING id
                    """,
                    run_id, collector_type, url, url_hash, method.upper(),
                    status_code, response_time_ms, retry_count,
                    content_length, error_message, user_agent,
                    now, completed_at,
                )
        except Exception as e:
            logger.warning("记录采集请求失败: %s", e)
            return None

    async def get_request_by_url(self, url: str) -> Optional[dict]:
        """查询采集请求记录"""
        if not url:
            return None
        await self.connect()
        import hashlib as _hashlib
        url_hash = _hashlib.md5(url.encode()).hexdigest()
        try:
            async with self._pool.acquire() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT cr.id, cr.run_id, cr.collector_type, cr.url, cr.method,
                           cr.status_code, cr.response_time_ms, cr.retry_count,
                           cr.content_length, cr.error_message, cr.user_agent,
                           cr.requested_at, cr.completed_at,
                           ir.source as run_source, ir.status as run_status,
                           ir.start_time as run_start_time, ir.end_time as run_end_time
                    FROM collector_requests cr
                    LEFT JOIN ingestion_runs ir ON cr.run_id = ir.id
                    WHERE cr.url_hash = $1
                    ORDER BY cr.requested_at DESC LIMIT 1
                    """, url_hash,
                )
                return dict(row) if row else None
        except Exception as e:
            logger.warning("查询采集请求记录失败: %s", e)
            return None
