"""Report data collector — fetches data from Elasticsearch and Neo4j for report generation."""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from config import get_config
from utils.db_pool import get_pool_manager
from utils.timezone import BUSINESS_TZ

logger = logging.getLogger(__name__)


class ReportDataCollector:
    """Collects ES stats and Neo4j graph data for daily report generation."""

    def __init__(
        self,
        es_hosts: Optional[List[str]] = None,
        es_index: Optional[str] = None,
        neo4j_uri: Optional[str] = None,
        neo4j_user: Optional[str] = None,
        neo4j_password: Optional[str] = None,
        use_pool_manager: bool = True,
    ):
        self.es_hosts = es_hosts or get_config().elasticsearch.hosts
        self.es_index = es_index or "omnilog_docs"
        self.neo4j_uri = neo4j_uri or get_config().neo4j.uri
        self.neo4j_user = neo4j_user or get_config().neo4j.user
        self.neo4j_password = neo4j_password or get_config().neo4j.password
        self._use_pool_manager = use_pool_manager

        self._es_client = None
        self._neo4j_driver = None
        self._pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def _get_es(self):
        """Get Elasticsearch client, preferring the unified pool manager."""
        if self._es_client is None:
            if self._use_pool_manager:
                try:
                    pool = await self._get_pool_manager()
                    self._es_client = await pool.elasticsearch.get_client()
                    return self._es_client
                except Exception as e:
                    logger.warning("Pool ES unavailable, using standalone: %s", e)
            from elasticsearch import AsyncElasticsearch
            self._es_client = AsyncElasticsearch(hosts=self.es_hosts)
        return self._es_client

    async def _get_neo4j(self):
        """Get Neo4j driver, preferring the unified pool manager."""
        if self._neo4j_driver is None:
            if self._use_pool_manager:
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

    async def collect_es_stats(self, date: datetime) -> Dict[str, Any]:
        """Collect document statistics from Elasticsearch for the given date."""
        es = await self._get_es()

        start_time = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=BUSINESS_TZ)
        end_time = start_time + timedelta(days=1)
        time_range = {
            "range": {
                "timestamp": {
                    "gte": start_time.isoformat(),
                    "lt": end_time.isoformat(),
                }
            }
        }

        # Document count
        count_result = await es.count(index=self.es_index, query=time_range)
        total_docs = count_result["count"]

        # Aggregations: tags, sources, languages (single request with multi terms)
        agg_query = {
            "size": 0,
            "query": time_range,
            "aggs": {
                "top_tags": {"terms": {"field": "tags", "size": 20}},
                "top_sources": {"terms": {"field": "source", "size": 10}},
                "languages": {"terms": {"field": "language", "size": 5}},
            },
        }
        agg_result = await es.search(index=self.es_index, **agg_query)
        aggs = agg_result["aggregations"]

        return {
            "total_docs": total_docs,
            "top_tags": [
                {"tag": b["key"], "count": b["doc_count"]}
                for b in aggs["top_tags"]["buckets"]
            ],
            "top_sources": [
                {"source": b["key"], "count": b["doc_count"]}
                for b in aggs["top_sources"]["buckets"]
            ],
            "languages": [
                {"language": b["key"], "count": b["doc_count"]}
                for b in aggs["languages"]["buckets"]
            ],
            "date": date.strftime("%Y-%m-%d"),
        }

    async def collect_neo4j_data(self, date: datetime) -> Dict[str, Any]:
        """Collect events, entities, and impact paths from Neo4j for the given date."""
        driver = await self._get_neo4j()

        start_time = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=BUSINESS_TZ)
        end_time = start_time + timedelta(days=1)
        start_iso = start_time.isoformat()
        end_iso = end_time.isoformat()

        async with driver.session() as session:
            # 1. New events with evolution tracking
            result = await session.run(
                """
                MATCH (e:Event)
                WHERE e.start_time >= $start AND e.start_time < $end
                OPTIONAL MATCH (e)-[:EVOLUTION_OF]->(parent:Event)
                RETURN e.id as id, e.summary as summary,
                       e.start_time as start_time, e.end_time as end_time,
                       e.impact_score as impact_score,
                       e.type as event_type, e.entities as entities,
                       e.severity as severity,
                       parent.id as parent_event_id,
                       parent.summary as parent_summary,
                       parent.start_time as parent_start_time
                ORDER BY e.start_time DESC
                LIMIT 20
                """,
                start=start_iso,
                end=end_iso,
            )
            events = [dict(record) async for record in result]

            # 2. Active entities
            result = await session.run(
                """
                MATCH (e:Entity)-[:MENTIONED_IN]->(d:Document)
                WHERE d.timestamp >= $start AND d.timestamp < $end
                RETURN DISTINCT e.name as name, e.type as type,
                       e.trend as trend, e.is_anomaly as is_anomaly,
                       e.last_mention_count as mention_count
                ORDER BY mention_count DESC
                LIMIT 30
                """,
                start=start_iso,
                end=end_iso,
            )
            entities = [dict(record) async for record in result]

            # 3. Impact paths
            result = await session.run(
                """
                MATCH (p:ImpactPath)
                WHERE p.created_at >= $start AND p.created_at < $end
                OPTIONAL MATCH (p)-[:ORIGINATES_FROM]->(src:Event)
                OPTIONAL MATCH (p)-[:LEADS_TO]->(tgt:Event)
                RETURN p.id as id, p.description as description,
                       p.confidence as confidence,
                       src.summary as source_summary,
                       tgt.summary as target_summary
                ORDER BY p.confidence DESC
                LIMIT 20
                """,
                start=start_iso,
                end=end_iso,
            )
            impact_paths = [dict(record) async for record in result]

            # 4. High-weight entity relationships
            result = await session.run(
                """
                MATCH (a:Entity)-[r:RELATED_TO]->(b:Entity)
                WHERE r.cooccurrence_weight >= 3
                RETURN a.name as source, a.type as source_type,
                       b.name as target, b.type as target_type,
                       r.predicate as predicate,
                       r.cooccurrence_weight as weight
                ORDER BY r.cooccurrence_weight DESC
                LIMIT 30
                """
            )
            entity_relations = [dict(record) async for record in result]

        return {
            "events": events,
            "entities": entities,
            "impact_paths": impact_paths,
            "entity_relations": entity_relations,
        }

    async def close(self):
        """Close collector connections."""
        if self._es_client:
            await self._es_client.close()
        if self._neo4j_driver and not self._use_pool_manager:
            await self._neo4j_driver.close()
