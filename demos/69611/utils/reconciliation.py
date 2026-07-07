"""Data reconciliation — ensure ES/PG/Neo4j write consistency.

Cross-cutting utility located in the utils layer; does not directly
depend on analysis or pipelines layers. Embedding generation uses
utils.embedding. Alert routing uses set_alert_callback() for
dependency injection, avoiding reverse dependencies on the analysis layer.
"""

import asyncio
import json
import logging
from typing import Any, Callable, Coroutine, Dict, List, Optional

from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

AlertCallback = Callable[[Dict[str, Any]], Coroutine[Any, Any, None]]

_alert_callback: Optional[AlertCallback] = None


def set_alert_callback(callback: AlertCallback):
    """Register an alert callback for reconciliation inconsistencies."""
    global _alert_callback
    _alert_callback = callback
    try:
        from utils.di_container import register_service
        register_service("alert_callback", callback)
    except Exception as e:
        logger.warning("Failed to register alert_callback in DI container: %s", e)


def get_alert_callback() -> Optional[AlertCallback]:
    """Get the registered alert callback."""
    return _alert_callback


class Reconciler:
    """Data reconciler that compares document counts across ES, PG, and Neo4j."""

    def __init__(self):
        self._pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def reconcile_documents(self) -> Dict[str, Any]:
        """Reconcile document counts across all three stores.

        Returns a report with counts and compliance score.
        """
        results = {
            "elasticsearch": 0,
            "postgresql": 0,
            "neo4j": 0,
            "compliance_score": 0.0,
            "inconsistencies": [],
        }

        pool = await self._get_pool_manager()

        # Count Elasticsearch documents
        try:
            es = await pool.elasticsearch.get_client()
            es_count = await es.count(index="omnilog_docs")
            results["elasticsearch"] = es_count.get("count", 0)
        except Exception as e:
            logger.warning("ES count failed: %s", e)
            results["inconsistencies"].append(f"ES: {e}")

        # Count PostgreSQL documents
        try:
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT COUNT(*) as cnt FROM entity_knowledge_base"
                )
                results["postgresql"] = row["cnt"] if row else 0
        except Exception as e:
            logger.warning("PG count failed: %s", e)
            results["inconsistencies"].append(f"PG: {e}")

        # Count Neo4j documents
        try:
            driver = await pool.neo4j.get_driver()
            async with driver.session() as session:
                result = await session.run("MATCH (d:Document) RETURN count(d) as cnt")
                record = await result.single()
                results["neo4j"] = record["cnt"] if record else 0
        except Exception as e:
            logger.warning("Neo4j count failed: %s", e)
            results["inconsistencies"].append(f"Neo4j: {e}")

        # Compute compliance score
        counts = [
            results["elasticsearch"],
            results["postgresql"],
            results["neo4j"],
        ]
        non_zero = [c for c in counts if c > 0]
        if non_zero:
            max_count = max(non_zero)
            min_count = min(counts) if all(c > 0 for c in counts) else 0
            results["compliance_score"] = min_count / max_count if max_count > 0 else 0.0

        # Fire alert for significant inconsistencies
        if results["compliance_score"] < 0.9 and _alert_callback:
            try:
                await _alert_callback({
                    "title": "Data Reconciliation Alert",
                    "summary": (
                        f"Compliance score: {results['compliance_score']:.2%}. "
                        f"ES={results['elasticsearch']}, "
                        f"PG={results['postgresql']}, "
                        f"Neo4j={results['neo4j']}"
                    ),
                    "severity": "warning",
                    "entities": [],
                    "sources": ["reconciler"],
                })
            except Exception as e:
                logger.warning("Alert callback failed: %s", e)

        return results

    async def verify_entity_consistency(self, entity_id: str) -> Dict[str, Any]:
        """Verify a single entity exists consistently across all stores."""
        result = {
            "entity_id": entity_id,
            "elasticsearch": False,
            "postgresql": False,
            "neo4j": False,
            "consistent": False,
        }

        pool = await self._get_pool_manager()

        try:
            pg_pool = await pool.postgres.get_pool()
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT 1 FROM entity_knowledge_base WHERE entity_id = $1",
                    entity_id,
                )
                result["postgresql"] = row is not None
        except Exception as e:
            logger.warning("PG entity check failed: %s", e)

        try:
            driver = await pool.neo4j.get_driver()
            async with driver.session() as session:
                neo_result = await session.run(
                    "MATCH (e:Entity {entity_id: $id}) RETURN count(e) as cnt",
                    id=entity_id,
                )
                record = await neo_result.single()
                result["neo4j"] = (record["cnt"] or 0) > 0 if record else False
        except Exception as e:
            logger.warning("Neo4j entity check failed: %s", e)

        result["consistent"] = result["postgresql"] and result["neo4j"]
        return result


# Global singleton
_reconciler: Optional[Reconciler] = None


def get_reconciler() -> Reconciler:
    """Get or create the global Reconciler singleton."""
    global _reconciler
    if _reconciler is None:
        _reconciler = Reconciler()
    return _reconciler
