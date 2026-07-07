"""PG+pgvector vector store — replacement for ChromaDB.

Provides equivalent vector search capabilities to ChromaDB while also
hosting report storage (replacing MongoDB). If the pgvector extension
is unavailable, callers should fall back to ChromaDB.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

EXPECTED_VECTOR_DIM = 384


class PGVectorStore:
    """PostgreSQL + pgvector vector store.

    Replaces ChromaDB with equivalent vector search capabilities.
    """

    def __init__(self):
        self._pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def ensure_tables(self):
        """Ensure tables and indexes exist.

        Raises:
            Exception: If table creation fails (caller should handle fallback).
        """
        pool = await self._get_pool_manager()
        pg_pool = await pool.postgres.get_pool()
        async with pg_pool.acquire() as conn:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS document_vectors (
                    doc_id VARCHAR(128) PRIMARY KEY,
                    embedding vector(384),
                    content TEXT,
                    source VARCHAR(64),
                    timestamp TIMESTAMP DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'
                )
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_document_vectors_embedding
                ON document_vectors USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100)
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_document_vectors_timestamp
                ON document_vectors (timestamp DESC)
            """)

    async def insert(
        self,
        doc_id: str,
        embedding: List[float],
        content: str = "",
        source: str = "",
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict] = None,
    ):
        """Insert or update a document vector.

        Args:
            doc_id: Document ID.
            embedding: Vector as list of floats.
            content: Document text content.
            source: Source identifier.
            timestamp: Document timestamp.
            metadata: Additional metadata dict.
        """
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            emb_str = "[" + ",".join(str(x) for x in embedding) + "]"
            metadata_str = json.dumps(metadata or {}, ensure_ascii=False)

            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO document_vectors (doc_id, embedding, content, source, timestamp, metadata)
                    VALUES ($1, $2::vector, $3, $4, $5, $6::jsonb)
                    ON CONFLICT (doc_id) DO UPDATE SET
                        embedding = EXCLUDED.embedding,
                        content = EXCLUDED.content,
                        timestamp = EXCLUDED.timestamp
                    """,
                    doc_id,
                    emb_str,
                    content,
                    source,
                    timestamp or datetime.now(timezone.utc),
                    metadata_str,
                )
        except Exception as e:
            logger.error("Failed to insert document vector: %s", e)
            raise

    async def query_by_similarity(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        where_filter: Optional[Dict] = None,
        days_back: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Vector similarity search.

        Args:
            query_embedding: Query vector.
            top_k: Number of results.
            where_filter: Optional filter (e.g., {"source": "rss"}).
            days_back: Only search within N days.

        Returns:
            List of dicts with doc_id, content, source, timestamp, metadata, similarity.
        """
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            emb_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

            conditions = []
            params: List[Any] = [emb_str, top_k]
            idx = 3

            if where_filter:
                if "source" in where_filter:
                    conditions.append(f"source = ${idx}")
                    params.append(where_filter["source"])
                    idx += 1

            if days_back:
                conditions.append(
                    f"timestamp >= NOW() - INTERVAL '{int(days_back)} days'"
                )

            where_clause = " AND ".join(conditions) if conditions else "TRUE"

            async with pg_pool.acquire() as conn:
                rows = await conn.fetch(
                    f"""
                    SELECT doc_id, content, source, timestamp, metadata,
                           1 - (embedding <=> $1::vector) as similarity
                    FROM document_vectors
                    WHERE {where_clause}
                    ORDER BY embedding <=> $1::vector
                    LIMIT $2
                    """,
                    *params,
                )
                return [dict(row) for row in rows]
        except Exception as e:
            logger.warning("Similarity query failed: %s", e)
            return []

    async def get_by_timestamp_range(
        self, start: datetime, end: datetime
    ) -> List[Dict[str, Any]]:
        """Get documents by timestamp range."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT doc_id, content, source, timestamp, metadata
                    FROM document_vectors
                    WHERE timestamp >= $1 AND timestamp < $2
                    ORDER BY timestamp DESC
                    """,
                    start,
                    end,
                )
                return [dict(row) for row in rows]
        except Exception as e:
            logger.warning("Timestamp range query failed: %s", e)
            return []

    async def count(self, days_back: Optional[int] = None) -> int:
        """Get total document count."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                if days_back:
                    row = await conn.fetchrow(
                        "SELECT COUNT(*) as cnt FROM document_vectors "
                        "WHERE timestamp >= NOW() - make_interval(days => $1)",
                        int(days_back),
                    )
                else:
                    row = await conn.fetchrow(
                        "SELECT COUNT(*) as cnt FROM document_vectors"
                    )
                return row["cnt"] if row else 0
        except Exception as e:
            logger.warning("Count query failed: %s", e)
            return 0

    async def delete(self, doc_id: str):
        """Delete a document vector."""
        try:
            pool = await self._get_pool_manager()
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    "DELETE FROM document_vectors WHERE doc_id = $1", doc_id
                )
        except Exception as e:
            logger.warning("Failed to delete document %s: %s", doc_id, e)


# Global singleton
_pgvector_store: Optional[PGVectorStore] = None


def get_pgvector_store() -> PGVectorStore:
    """Get or create the global PGVectorStore singleton."""
    global _pgvector_store
    if _pgvector_store is None:
        _pgvector_store = PGVectorStore()
    return _pgvector_store
