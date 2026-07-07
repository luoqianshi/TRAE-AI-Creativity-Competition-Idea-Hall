"""Intelligence traceability API with audit logging and watchlist management."""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from utils.auth import APIKeyInfo, require_classification, verify_api_key
from utils.audit_logger import get_audit_logger
from utils.classification import get_classifier
from utils.db_pool import get_pool_manager

from analysis.watchlist import get_watchlist_manager
from analysis.stix import export_graph_as_stix

logger = logging.getLogger(__name__)

router = APIRouter(tags=["intelligence"])


# ── Watchlist endpoints ──────────────────────────────────────────────


@router.get("/watchlist")
async def list_watchlist(
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """List all watchlist entries for the current user."""
    user_id = auth_info.key_hash[:8]
    manager = get_watchlist_manager()
    entries = await manager.list_for_user(user_id)
    return {
        "entries": [
            {
                "id": e.id,
                "entity_id": e.entity_id,
                "entity_name": e.entity_name,
                "entity_type": e.entity_type,
                "notes": e.notes,
                "alert_on_appearance": e.alert_on_appearance,
                "alert_on_trend_change": e.alert_on_trend_change,
                "created_at": e.created_at,
            }
            for e in entries
        ],
        "total": len(entries),
    }


@router.post("/watchlist")
async def add_to_watchlist(
    entity_id: str = Query(...),
    entity_name: str = Query(...),
    entity_type: Optional[str] = Query(None),
    notes: str = Query(""),
    alert_on_appearance: bool = Query(True),
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Add an entity to the user's watchlist."""
    user_id = auth_info.key_hash[:8]
    manager = get_watchlist_manager()
    entry = await manager.add(
        user_id=user_id,
        entity_id=entity_id,
        entity_name=entity_name,
        entity_type=entity_type,
        notes=notes,
        alert_on_appearance=alert_on_appearance,
    )
    if not entry:
        raise HTTPException(status_code=500, detail="Failed to add watchlist entry")
    return {"status": "added", "entry_id": entry.id}


@router.delete("/watchlist")
async def remove_from_watchlist(
    entity_id: str = Query(...),
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Remove an entity from the user's watchlist."""
    user_id = auth_info.key_hash[:8]
    manager = get_watchlist_manager()
    removed = await manager.remove(user_id, entity_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    return {"status": "removed"}


# ── STIX export endpoint ────────────────────────────────────────────


@router.get("/export/stix")
async def export_stix(
    entity_limit: int = Query(100, le=500),
    relation_limit: int = Query(200, le=1000),
    event_limit: int = Query(50, le=200),
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Export the knowledge graph as a STIX 2.1 bundle.

    Returns entities as STIX Identity/ThreatActor/Location objects,
    relationships as STIX Relationship SROs, and events as STIX Report/Incident objects.
    """
    try:
        bundle = await export_graph_as_stix(
            entity_limit=entity_limit,
            relation_limit=relation_limit,
            event_limit=event_limit,
        )
        return bundle
    except Exception as e:
        logger.error("STIX export failed: %s", e)
        raise HTTPException(status_code=500, detail=f"STIX export failed: {str(e)[:200]}")


# ── Existing traceability endpoints ──────────────────────────────────


@router.get("/reports/{report_id}/traceability")
async def get_report_traceability(
    report_id: str,
    request: Request,
    auth_info: APIKeyInfo = Depends(require_classification("internal")),
):
    """Get report traceability information.

    Returns the source documents, associated entities, and provenance
    chain for a report. All access is recorded in the audit log.
    """
    audit = get_audit_logger()
    await audit.log_access(
        user=auth_info.key_hash[:8],
        resource=f"report:{report_id}",
        action="view",
        ip=request.client.host if request.client else "",
        classification=auth_info.classification_level,
    )

    traceability: Dict[str, Any] = {
        "report_id": report_id,
        "documents": [],
        "entities": [],
    }

    try:
        pool_manager = get_pool_manager()

        # 1. Query documents and entities linked to this report from Neo4j
        try:
            driver = await pool_manager.neo4j.get_driver()
            async with driver.session() as session:
                doc_query = """
                MATCH (d:Document)-[:PART_OF]->(r:Report {id: $report_id})
                RETURN d.id as id, d.source as source, d.url as url, d.timestamp as timestamp
                ORDER BY d.timestamp DESC
                LIMIT 50
                """
                result = await session.run(doc_query, report_id=report_id)
                classifier = get_classifier()
                async for record in result:
                    doc = {
                        "id": record["id"],
                        "source": record["source"] if record["source"] else "",
                        "url": record["url"] if record["url"] else "",
                        "timestamp": str(record["timestamp"]) if record["timestamp"] else "",
                    }
                    doc["classification"] = classifier.classify_document(doc)
                    traceability["documents"].append(doc)

                ent_query = """
                MATCH (e:Entity)-[:MENTIONED_IN]->(d:Document)-[:PART_OF]->(r:Report {id: $report_id})
                RETURN e.name as name, e.type as type, count(d) as doc_count
                ORDER BY doc_count DESC
                LIMIT 30
                """
                result = await session.run(ent_query, report_id=report_id)
                async for record in result:
                    traceability["entities"].append({
                        "name": record["name"],
                        "type": record["type"],
                        "doc_count": record.get("doc_count", 0),
                    })
        except Exception as e:
            logger.warning("Neo4j report traceability query failed: %s", e)

    except Exception as e:
        logger.error("Failed to get report traceability: %s", e)
        raise HTTPException(status_code=503, detail="Traceability service temporarily unavailable")

    return traceability


@router.get("/documents/{doc_id}/traceability")
async def get_document_traceability(
    doc_id: str,
    request: Request,
    auth_info: APIKeyInfo = Depends(require_classification("internal")),
):
    """Get document traceability information.

    Returns the document source metadata, classification, and associated
    entities from the knowledge graph. All access is audited.
    """
    audit = get_audit_logger()
    await audit.log_access(
        user=auth_info.key_hash[:8],
        resource=f"document:{doc_id}",
        action="view",
        ip=request.client.host if request.client else "",
        classification=auth_info.classification_level,
    )

    traceability: Dict[str, Any] = {
        "doc_id": doc_id,
        "source": "",
        "url": "",
        "classification": "public",
        "entities": [],
    }

    try:
        pool_manager = get_pool_manager()

        # 1. Get document metadata from Elasticsearch
        try:
            es_client = await pool_manager.elasticsearch.get_client()
            if await es_client.exists(index="omnilog_docs", id=doc_id):
                result = await es_client.get(index="omnilog_docs", id=doc_id)
                source = result["_source"]
                traceability["source"] = source.get("source", "")
                traceability["url"] = source.get("url", "")
                classifier = get_classifier()
                traceability["classification"] = classifier.classify_document(source)
        except Exception as e:
            logger.warning("Elasticsearch document query failed: %s", e)

        # 2. Get associated entities from Neo4j
        try:
            driver = await pool_manager.neo4j.get_driver()
            async with driver.session() as session:
                query = """
                MATCH (e:Entity)-[r:MENTIONED_IN]->(d:Document {id: $doc_id})
                RETURN e.name as name, e.type as type, r.confidence as confidence
                ORDER BY confidence DESC
                """
                result = await session.run(query, doc_id=doc_id)
                async for record in result:
                    traceability["entities"].append({
                        "name": record["name"],
                        "type": record["type"],
                        "confidence": record.get("confidence", 0.0),
                    })
        except Exception as e:
            logger.warning("Neo4j entity query failed: %s", e)

    except Exception as e:
        logger.error("Failed to get document traceability: %s", e)
        raise HTTPException(status_code=503, detail="Traceability service temporarily unavailable")

    return traceability
