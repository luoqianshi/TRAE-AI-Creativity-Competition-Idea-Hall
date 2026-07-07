"""Event detection module — vector clustering-based event discovery with LLM summarization."""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import numpy as np
from sklearn.cluster import DBSCAN
import redis.asyncio as aioredis

from config import get_config
from utils.embedding import generate_embeddings_batch, DEFAULT_EMBEDDING_MODEL
from utils.llm_client import get_llm_client

logger = logging.getLogger(__name__)

DBSCAN_EPS = 0.3
DBSCAN_MIN_SAMPLES = 3
EVENTS_STREAM = "detected_events"


class EventDetector:
    """Event detector using vector clustering on document embeddings."""

    def __init__(
        self,
        embedding_model: Optional[str] = None,
        redis_url: Optional[str] = None,
        neo4j_uri: Optional[str] = None,
        neo4j_user: Optional[str] = None,
        neo4j_password: Optional[str] = None,
        llm_base_url: Optional[str] = None,
        llm_api_key: Optional[str] = None,
        llm_model: Optional[str] = None,
        use_pool_manager: bool = True,
    ):
        """Initialize the event detector.

        Args:
            embedding_model: Embedding model name.
            redis_url: Redis URL (standalone mode).
            neo4j_uri: Neo4j URI (standalone mode).
            neo4j_user: Neo4j username (standalone mode).
            neo4j_password: Neo4j password (standalone mode).
            llm_base_url: LLM API base URL.
            llm_api_key: LLM API key.
            llm_model: LLM model name.
            use_pool_manager: Whether to use the unified ConnectionPoolManager.
        """
        self.use_pool_manager = use_pool_manager
        self.embedding_model = embedding_model or os.getenv(
            "EMBEDDING_MODEL", DEFAULT_EMBEDDING_MODEL
        )
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.neo4j_uri = neo4j_uri or os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.neo4j_user = neo4j_user or os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = neo4j_password or os.getenv("NEO4J_PASSWORD", "")
        self.llm_base_url = llm_base_url
        self.llm_api_key = llm_api_key
        self.llm_model = llm_model

        self._redis: Optional[aioredis.Redis] = None
        self._neo4j_driver: Optional[Any] = None
        self._pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            from utils.db_pool import get_pool_manager
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_redis(self) -> aioredis.Redis:
        if self._redis is None:
            if self.use_pool_manager:
                try:
                    pool = await self._get_pool_manager()
                    self._redis = await pool.redis.get_connection()
                    return self._redis
                except Exception as e:
                    logger.warning("Pool Redis unavailable, using standalone: %s", e)
            self._redis = aioredis.from_url(self.redis_url, decode_responses=True, max_connections=10)
        return self._redis

    async def _get_neo4j_driver(self):
        if self._neo4j_driver is None:
            if self.use_pool_manager:
                try:
                    pool = await self._get_pool_manager()
                    self._neo4j_driver = await pool.neo4j.get_driver()
                    return self._neo4j_driver
                except Exception as e:
                    logger.warning("Pool Neo4j unavailable, using standalone: %s", e)
            from neo4j import AsyncGraphDatabase
            self._neo4j_driver = AsyncGraphDatabase.driver(
                self.neo4j_uri,
                auth=(self.neo4j_user, self.neo4j_password),
            )
        return self._neo4j_driver

    async def detect_events(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Detect events by clustering recent documents.

        Args:
            hours: Look-back window in hours.

        Returns:
            List of detected event dicts.
        """
        try:
            docs = await self._fetch_recent_documents(hours)
            if len(docs) < DBSCAN_MIN_SAMPLES:
                logger.info(
                    "Too few documents (%d) for clustering, skipping", len(docs)
                )
                return []

            texts = [d.get("clean_text", "")[:2000] for d in docs]
            embeddings = await generate_embeddings_batch(
                texts, model=self.embedding_model
            )
            if embeddings is None or len(embeddings) == 0:
                return []

            embeddings_array = np.array(embeddings)
            clustering = DBSCAN(
                eps=DBSCAN_EPS,
                min_samples=DBSCAN_MIN_SAMPLES,
                metric="cosine",
            ).fit(embeddings_array)

            labels = clustering.labels_
            events = []
            unique_labels = set(labels)

            for label_id in unique_labels:
                if label_id == -1:  # Noise points
                    continue
                cluster_indices = [i for i, l in enumerate(labels) if l == label_id]
                cluster_docs = [docs[i] for i in cluster_indices]

                event = await self._summarize_cluster(label_id, cluster_docs)
                if event:
                    events.append(event)

            # Publish events to Redis stream
            await self._publish_events(events)

            logger.info(
                "Event detection complete: %d events from %d documents",
                len(events),
                len(docs),
            )
            return events

        except Exception as e:
            logger.error("Event detection failed: %s", e, exc_info=True)
            return []

    async def _fetch_recent_documents(
        self, hours: int
    ) -> List[Dict[str, Any]]:
        """Fetch recent documents from Elasticsearch, with pgvector fallback."""
        docs = []
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours))

        try:
            if self.use_pool_manager:
                pool = await self._get_pool_manager()
                try:
                    es = await pool.elasticsearch.get_client()
                    response = await es.search(
                        index="omnilog_docs",
                        query={
                            "range": {
                                "timestamp": {"gte": cutoff.isoformat()}
                            }
                        },
                        size=500,
                        sort=[{"timestamp": {"order": "desc"}}],
                    )
                    for hit in response["hits"]["hits"]:
                        docs.append(hit["_source"])
                except Exception as e:
                    logger.warning("ES fetch failed: %s", e)

            # Fallback: try pgvector store
            if not docs:
                try:
                    from utils.pgvector_store import get_pgvector_store
                    store = get_pgvector_store()
                    pg_docs = await store.get_by_timestamp_range(
                        start=cutoff, end=datetime.now(timezone.utc)
                    )
                    docs = [
                        {
                            "id": d.get("doc_id", ""),
                            "clean_text": d.get("content", ""),
                            "source": d.get("source", ""),
                            "timestamp": d.get("timestamp", ""),
                        }
                        for d in pg_docs
                    ]
                except Exception as e:
                    logger.warning("pgvector fallback fetch failed: %s", e)

        except Exception as e:
            logger.warning("Document fetch failed: %s", e)

        return docs

    async def _summarize_cluster(
        self, label_id: int, cluster_docs: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Generate an event summary for a document cluster using LLM."""
        try:
            combined = "\n\n---\n\n".join(
                d.get("clean_text", "")[:500] for d in cluster_docs[:5]
            )

            llm = get_llm_client()
            response = await llm.chat_completion(
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an intelligence analyst. Summarize the following "
                            "set of related documents into a single event description. "
                            "Include: event type, key entities, location, severity "
                            "(critical/warning/info), and a 2-3 sentence summary."
                        ),
                    },
                    {"role": "user", "content": combined},
                ],
                temperature=0.3,
                max_tokens=300,
            )
            summary = response["choices"][0]["message"]["content"].strip()

            event = {
                "event_id": f"evt_{uuid.uuid4().hex[:16]}",
                "cluster_id": int(label_id),
                "doc_count": len(cluster_docs),
                "doc_ids": [d.get("id", "") for d in cluster_docs],
                "summary": summary,
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "severity": self._infer_severity(summary),
                "entities": self._extract_entity_names(cluster_docs),
            }
            return event

        except Exception as e:
            logger.warning("Cluster summarization failed: %s", e)
            return None

    def _infer_severity(self, summary: str) -> str:
        """Infer event severity from the summary text."""
        summary_lower = summary.lower()
        if any(kw in summary_lower for kw in ["critical", "emergency", "breach"]):
            return "critical"
        elif any(kw in summary_lower for kw in ["warning", "alert", "concern"]):
            return "warning"
        return "info"

    def _extract_entity_names(
        self, docs: List[Dict[str, Any]]
    ) -> List[str]:
        """Extract unique entity names from clustered documents."""
        names = set()
        for doc in docs:
            for entity in doc.get("entities", []):
                name = entity.get("name") or entity.get("canonical_name", "")
                if name:
                    names.add(name)
        return list(names)[:50]

    async def _publish_events(self, events: List[Dict[str, Any]]):
        """Publish detected events to the Redis stream."""
        if not events:
            return
        try:
            redis = await self._get_redis()
            for event in events:
                await redis.xadd(
                    EVENTS_STREAM,
                    {"data": json.dumps(event, ensure_ascii=False)},
                    maxlen=10000,
                )
        except Exception as e:
            logger.warning("Failed to publish events to stream: %s", e)

    async def close(self):
        """Close all connections."""
        if self._redis:
            await self._redis.close()
            self._redis = None
        if self._neo4j_driver and not self.use_pool_manager:
            await self._neo4j_driver.close()
            self._neo4j_driver = None


# Convenience functions

_detector: Optional[EventDetector] = None


def _get_detector() -> EventDetector:
    global _detector
    if _detector is None:
        _detector = EventDetector()
    return _detector


async def detect_events(hours: int = 24) -> List[Dict[str, Any]]:
    """Detect events from recent documents (convenience function)."""
    detector = _get_detector()
    return await detector.detect_events(hours=hours)


async def store_documents(documents: List[Dict[str, Any]]) -> int:
    """Store documents for event detection (convenience function).

    Document embeddings are already stored via the pgvector pipeline writer.
    This function is preserved as a no-op for API compatibility.
    Returns the number of documents passed.
    """
    if not documents:
        return 0
    # Documents are already indexed in Elasticsearch and pgvector
    # by the standardization pipeline. No additional storage needed here.
    return len(documents)
