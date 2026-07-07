"""Async Neo4j writer — write entities and relations to the graph database."""

import logging
from typing import Any, Dict, List, Optional

from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)


class Neo4jWriter:
    """Async writer for persisting entities and relations to Neo4j."""

    def __init__(self):
        self._pool_manager = None

    async def _get_pool_manager(self):
        if self._pool_manager is None:
            self._pool_manager = get_pool_manager()
        return self._pool_manager

    async def update_entity_scores(
        self, entity_id: str, criticality: float, risk: float, tier: int
    ) -> bool:
        """Update scoring attributes on an existing Entity node.

        Args:
            entity_id: Unique entity identifier.
            criticality: criticality_score value (0-100).
            risk: risk_score value (0-100).
            tier: tier value (1-5).

        Returns:
            True if the update succeeded.
        """
        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()
            async with driver.session() as session:
                result = await session.run(
                    """
                    MATCH (e:Entity {entity_id: $entity_id})
                    SET
                        e.criticality_score = $criticality,
                        e.risk_score = $risk,
                        e.tier = $tier,
                        e.updated_at = timestamp()
                    RETURN e.name
                    """,
                    entity_id=entity_id,
                    criticality=criticality,
                    risk=risk,
                    tier=tier,
                )
                record = await result.single()
                if record:
                    logger.debug(
                        "Updated scores for entity '%s' — crit=%.1f risk=%.1f tier=%d",
                        entity_id, criticality, risk, tier,
                    )
                    return True
                logger.warning("Entity %s not found for score update", entity_id)
                return False
        except Exception as e:
            logger.error("Failed to update entity scores: %s", e)
            return False

    async def update_entity_location(
        self,
        entity_id: str,
        latitude: float,
        longitude: float,
        source: str = "geocoding",
        geo_json: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Set location attributes on an existing Entity node.

        Args:
            entity_id: Unique entity identifier.
            latitude: WGS84 latitude.
            longitude: WGS84 longitude.
            source: Origin of the coordinate data.
            geo_json: Optional GeoJSON Point geometry dict.

        Returns:
            True if the update succeeded.
        """
        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()
            async with driver.session() as session:
                result = await session.run(
                    """
                    MATCH (e:Entity {entity_id: $entity_id})
                    SET
                        e.latitude = $latitude,
                        e.longitude = $longitude,
                        e.geo_source = $source,
                        e.geo_json = $geo_json,
                        e.updated_at = timestamp()
                    RETURN e.name
                    """,
                    entity_id=entity_id,
                    latitude=latitude,
                    longitude=longitude,
                    source=source,
                    geo_json=geo_json or None,
                )
                record = await result.single()
                if record:
                    logger.debug(
                        "Set location for '%s' — (%.4f, %.4f) from %s",
                        entity_id, latitude, longitude, source,
                    )
                    return True
                logger.warning("Entity %s not found for location update", entity_id)
                return False
        except Exception as e:
            logger.error("Failed to update entity location: %s", e)
            return False

    async def write_entities(
        self, entities: List[Dict[str, Any]], doc_id: str
    ) -> int:
        """Write or merge entities into Neo4j.

        Creates Entity nodes with MERGE (idempotent), links them to the
        source Document, and sets properties.

        Args:
            entities: List of entity dicts with entity_id, name, type, etc.
            doc_id: Source document ID for the MENTIONED_IN relationship.

        Returns:
            Number of entities written.
        """
        if not entities:
            return 0

        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()

            async with driver.session() as session:
                count = 0
                for entity in entities:
                    entity_id = entity.get("entity_id") or entity.get("name", "")
                    name = entity.get("canonical_name") or entity.get("name", "")
                    entity_type = entity.get("type") or entity.get("label", "UNKNOWN")
                    confidence = entity.get("confidence") or entity.get(
                        "link_confidence", 0.0
                    )

                    await session.run(
                        """
                        MERGE (e:Entity {entity_id: $entity_id})
                        ON CREATE SET
                            e.name = $name,
                            e.type = $type,
                            e.confidence = $confidence,
                            e.created_at = timestamp()
                        ON MATCH SET
                            e.name = $name,
                            e.confidence = CASE
                                WHEN $confidence > coalesce(e.confidence, 0)
                                THEN $confidence
                                ELSE e.confidence
                            END,
                            e.updated_at = timestamp()
                        """,
                        entity_id=entity_id,
                        name=name,
                        type=entity_type,
                        confidence=confidence,
                    )

                    # Link entity to source document
                    if doc_id:
                        await session.run(
                            """
                            MATCH (e:Entity {entity_id: $entity_id})
                            MERGE (d:Document {id: $doc_id})
                            MERGE (e)-[r:MENTIONED_IN]->(d)
                            ON CREATE SET r.count = 1
                            ON MATCH SET r.count = coalesce(r.count, 0) + 1
                            """,
                            entity_id=entity_id,
                            doc_id=doc_id,
                        )
                    count += 1

                return count
        except Exception as e:
            logger.error("Failed to write entities to Neo4j: %s", e)
            return 0

    async def write_relations(
        self, relations: List[Dict[str, Any]]
    ) -> int:
        """Write relations between entities into Neo4j.

        Creates RELATED_TO relationships between existing Entity nodes.
        Uses entity_id when available, falls back to name matching.

        Args:
            relations: List of relation dicts with subject/subject_id,
                       predicate, object/object_id.

        Returns:
            Number of relations written.
        """
        if not relations:
            return 0

        relations_with_id = []
        relations_without_id = []

        for rel in relations:
            if rel.get("subject_id") and rel.get("object_id"):
                relations_with_id.append(rel)
            else:
                relations_without_id.append(rel)

        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()

            async with driver.session() as session:
                # Batch write relations with entity_id
                if relations_with_id:
                    await session.run(
                        """
                        UNWIND $rels AS rel
                        MATCH (s:Entity {entity_id: rel.subject_id})
                        MATCH (o:Entity {entity_id: rel.object_id})
                        MERGE (s)-[r:RELATED_TO {predicate: rel.predicate}]->(o)
                        ON CREATE SET
                            r.cooccurrence_weight = 1,
                            r.weight = 1
                        ON MATCH SET
                            r.cooccurrence_weight = coalesce(r.cooccurrence_weight, 0) + 1,
                            r.weight = coalesce(r.weight, 0) + 1
                        """,
                        rels=relations_with_id,
                    )

                # Fallback: match by name
                if relations_without_id:
                    await session.run(
                        """
                        UNWIND $rels AS rel
                        MATCH (s:Entity {name: rel.subject})
                        MATCH (o:Entity {name: rel.object})
                        MERGE (s)-[r:RELATED_TO {predicate: rel.predicate}]->(o)
                        ON CREATE SET
                            r.cooccurrence_weight = 1,
                            r.weight = 1
                        ON MATCH SET
                            r.cooccurrence_weight = coalesce(r.cooccurrence_weight, 0) + 1,
                            r.weight = coalesce(r.weight, 0) + 1
                        """,
                        rels=relations_without_id,
                    )

                return len(relations)
        except Exception as e:
            logger.error("Failed to write relations to Neo4j: %s", e)
            return 0

    async def write_document_node(
        self, doc_id: str, title: str = "", source: str = "", url: str = ""
    ):
        """Create or update a Document node in Neo4j.

        Args:
            doc_id: Unique document identifier.
            title: Document title.
            source: Source name.
            url: Source URL.
        """
        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()

            async with driver.session() as session:
                await session.run(
                    """
                    MERGE (d:Document {id: $doc_id})
                    ON CREATE SET
                        d.title = $title,
                        d.source = $source,
                        d.url = $url,
                        d.indexed_at = timestamp()
                    ON MATCH SET
                        d.title = $title,
                        d.url = $url
                    """,
                    doc_id=doc_id,
                    title=title,
                    source=source,
                    url=url,
                )
        except Exception as e:
            logger.warning("Failed to write document node: %s", e)

    async def link_document_to_report(
        self, doc_id: str, report_id: str
    ):
        """Link a document to a report via PART_OF relationship.

        Args:
            doc_id: Document identifier.
            report_id: Report identifier.
        """
        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()

            async with driver.session() as session:
                await session.run(
                    """
                    MATCH (d:Document {id: $doc_id})
                    MERGE (r:Report {id: $report_id})
                    MERGE (d)-[:PART_OF]->(r)
                    """,
                    doc_id=doc_id,
                    report_id=report_id,
                )
        except Exception as e:
            logger.warning("Failed to link document to report: %s", e)

    async def get_stats(self) -> Dict[str, Any]:
        """Get basic graph statistics from Neo4j.

        Returns:
            Dict with counts of entities, documents, relations, and events.
        """
        try:
            pool = await self._get_pool_manager()
            driver = await pool.neo4j.get_driver()

            async with driver.session() as session:
                result = await session.run(
                    """
                    MATCH (e:Entity)
                    WITH count(e) as entity_count
                    OPTIONAL MATCH (d:Document)
                    WITH entity_count, count(d) as doc_count
                    OPTIONAL MATCH ()-[r:RELATED_TO]->()
                    WITH entity_count, doc_count, count(r) as relation_count
                    OPTIONAL MATCH (ev:Event)
                    RETURN entity_count, doc_count, relation_count, count(ev) as event_count
                    """
                )
                record = await result.single()
                if record:
                    return {
                        "entities": record["entity_count"],
                        "documents": record["doc_count"],
                        "relations": record["relation_count"],
                        "events": record["event_count"],
                    }
                return {
                    "entities": 0,
                    "documents": 0,
                    "relations": 0,
                    "events": 0,
                }
        except Exception as e:
            logger.error("Failed to get Neo4j stats: %s", e)
            return {
                "entities": 0,
                "documents": 0,
                "relations": 0,
                "events": 0,
            }


# Global singleton
_writer: Optional[Neo4jWriter] = None


def get_neo4j_writer() -> Neo4jWriter:
    """Get or create the global Neo4jWriter singleton."""
    global _writer
    if _writer is None:
        _writer = Neo4jWriter()
    return _writer


async def write_to_neo4j(
    entities: List[Dict[str, Any]],
    relations: List[Dict[str, Any]],
    doc_id: str,
    title: str = "",
    source: str = "",
    url: str = "",
) -> Dict[str, int]:
    """Convenience function: write entities, relations, and document node.

    Args:
        entities: List of entity dicts.
        relations: List of relation dicts.
        doc_id: Document identifier.
        title: Document title.
        source: Source name.
        url: Source URL.

    Returns:
        Dict with counts of entities_written and relations_written.
    """
    writer = get_neo4j_writer()
    entity_count = await writer.write_entities(entities, doc_id)
    relation_count = await writer.write_relations(relations)
    await writer.write_document_node(doc_id, title, source, url)
    return {
        "entities_written": entity_count,
        "relations_written": relation_count,
    }
