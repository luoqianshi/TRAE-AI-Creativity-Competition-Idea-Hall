"""Report storage — handles persisting reports to PostgreSQL, MinIO, and MongoDB fallback."""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from io import BytesIO
from typing import Any, Dict, List, Optional

from minio import Minio

from config import get_config
from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

MINIO_BUCKET = "reports"


class ReportStorage:
    """Stores report content to MinIO (HTML) and PostgreSQL (metadata + markdown).

    Falls back to MongoDB if PostgreSQL is unavailable.
    """

    def __init__(
        self,
        minio_endpoint: Optional[str] = None,
        minio_access_key: Optional[str] = None,
        minio_secret_key: Optional[str] = None,
        mongo_uri: Optional[str] = None,
        mongo_db: Optional[str] = None,
        use_pool_manager: bool = True,
    ):
        config = get_config()
        self.minio_endpoint = minio_endpoint or config.minio.endpoint
        self.minio_access_key = minio_access_key or config.minio.access_key
        self.minio_secret_key = minio_secret_key or config.minio.secret_key
        self._minio_secure = config.minio.secure
        self.mongo_uri = mongo_uri or config.mongodb.url
        self.mongo_db = mongo_db or config.mongodb.database
        self._use_pool_manager = use_pool_manager

        self._minio_client: Optional[Minio] = None
        self._minio_bucket_ready = False
        self._pool_manager = None
        self._pg_pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_pg_pool(self):
        """Get PostgreSQL connection pool (preferring unified pool manager)."""
        if self._pg_pool_manager is None:
            self._pg_pool_manager = await self._get_pool_manager()
        return await self._pg_pool_manager.postgres.get_pool()

    def _get_minio(self) -> Minio:
        """Get MinIO client (synchronous)."""
        if self._minio_client is None:
            self._minio_client = Minio(
                self.minio_endpoint,
                access_key=self.minio_access_key,
                secret_key=self.minio_secret_key,
                secure=self._minio_secure,
            )
        return self._minio_client

    async def _get_minio_async(self) -> Minio:
        """Get MinIO client, attempting pool manager first."""
        if self._minio_client is None:
            if self._use_pool_manager:
                try:
                    pool = await self._get_pool_manager()
                    self._minio_client = await pool.minio.get_client()
                    return self._minio_client
                except Exception as e:
                    logger.warning("Pool MinIO unavailable, using standalone: %s", e)
            self._minio_client = self._get_minio()
        return self._minio_client

    def _ensure_minio_bucket(self):
        """Ensure MinIO bucket exists (synchronous, run in executor)."""
        if self._minio_bucket_ready:
            return
        client = self._get_minio()
        if not client.bucket_exists(MINIO_BUCKET):
            client.make_bucket(MINIO_BUCKET)
        self._minio_bucket_ready = True

    async def store_html_to_minio(self, html_content: str, date_str: str) -> str:
        """Store HTML report to MinIO and return the public URL."""
        client = await self._get_minio_async()
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._ensure_minio_bucket)

        object_name = f"daily/{date_str}/report.html"
        html_bytes = html_content.encode("utf-8")
        client.put_object(
            MINIO_BUCKET,
            object_name,
            data=BytesIO(html_bytes),
            length=len(html_bytes),
            content_type="text/html; charset=utf-8",
        )
        return f"/api/reports/html/{date_str}"

    async def store_to_postgres(
        self,
        date_str: str,
        markdown_report: str,
        html_content: str,
        html_url: str,
        es_stats: Dict[str, Any],
        neo4j_data: Dict[str, Any],
        diff_text: str,
        rag_info: Dict[str, Any],
    ):
        """Store report to PostgreSQL daily_reports table (primary path).

        Falls back to MongoDB on failure.
        """
        try:
            pg_pool = await self._get_pg_pool()

            report_id = str(uuid.uuid4())
            summary = markdown_report[:500] if len(markdown_report) > 500 else markdown_report
            title = markdown_report.split("\n", 1)[0].lstrip("# ").strip()[:512] if markdown_report else ""

            metadata = {
                "html_url": html_url,
                "diff_from_previous": diff_text,
                "stats": es_stats,
                "entities": [
                    {"name": e.get("name", ""), "type": e.get("type", ""), "trend": e.get("trend", "")}
                    for e in neo4j_data.get("entities", [])
                ],
                "events": [
                    {"id": e.get("id", ""), "summary": e.get("summary", "")}
                    for e in neo4j_data.get("events", [])
                ],
                "impact_paths": [
                    {"id": p.get("id", ""), "description": p.get("description", ""), "confidence": p.get("confidence", 0)}
                    for p in neo4j_data.get("impact_paths", [])
                ],
            }

            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO daily_reports
                    (id, report_date, title, summary, full_markdown, html_content, metadata, rag_info, classification)
                    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)
                    ON CONFLICT (report_date) DO UPDATE SET
                        title = EXCLUDED.title, summary = EXCLUDED.summary,
                        full_markdown = EXCLUDED.full_markdown, html_content = EXCLUDED.html_content,
                        metadata = EXCLUDED.metadata, rag_info = EXCLUDED.rag_info,
                        updated_at = NOW()
                    """,
                    report_id, date_str, title, summary, markdown_report, html_content,
                    json.dumps(metadata, ensure_ascii=False),
                    json.dumps(rag_info, ensure_ascii=False),
                    "internal",
                )
            logger.info("Report stored to PostgreSQL: %s", date_str)
        except Exception as e:
            logger.warning("PostgreSQL storage failed, falling back to MongoDB: %s", e)
            await self._store_to_mongodb(
                date_str=date_str, markdown_report=markdown_report,
                html_url=html_url, es_stats=es_stats, neo4j_data=neo4j_data, diff_text=diff_text,
            )

    async def _store_to_mongodb(
        self,
        date_str: str, markdown_report: str, html_url: str,
        es_stats: Dict[str, Any], neo4j_data: Dict[str, Any], diff_text: str,
    ):
        """Fallback: store report to MongoDB."""
        try:
            pool = await self._get_pool_manager()
            client = await pool.mongodb.get_client()
            db = client[self.mongo_db]
            collection = db[os.getenv("MONGO_COLLECTION", "daily_reports")]

            summary = markdown_report[:500] if len(markdown_report) > 500 else markdown_report
            document = {
                "date": date_str,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "summary": summary,
                "entities": [{"name": e.get("name", ""), "type": e.get("type", ""), "trend": e.get("trend", "")}
                             for e in neo4j_data.get("entities", [])],
                "events": [{"id": e.get("id", ""), "summary": e.get("summary", "")}
                           for e in neo4j_data.get("events", [])],
                "impact_paths": [{"id": p.get("id", ""), "description": p.get("description", ""), "confidence": p.get("confidence", 0)}
                                 for p in neo4j_data.get("impact_paths", [])],
                "full_markdown": markdown_report,
                "html_url": html_url, "diff_from_previous": diff_text, "stats": es_stats,
            }
            await collection.update_one({"date": date_str}, {"$set": document}, upsert=True)
            logger.info("Report stored to MongoDB (fallback): %s", date_str)
        except Exception as e:
            logger.error("MongoDB fallback storage also failed: %s", e)

    async def close(self):
        """Close storage connections."""
        if self._minio_client is not None:
            try:
                if hasattr(self._minio_client, '_http'):
                    self._minio_client._http.clear()
            except Exception:
                pass
