"""Historical intelligence search API.

Provides historical intelligence retrieval with entity, event type,
time range, and keyword search. All endpoints require authentication
and record audit logs.
"""

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from config import get_config
from utils.auth import APIKeyInfo, verify_api_key
from utils.audit_logger import get_audit_logger
from utils.db_pool import get_pool_manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["history"])


@router.get("/intelligence/search")
async def search_intelligence(
    request: Request,
    entity: Optional[str] = Query(None, description="Filter by entity name"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    date_from: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    keyword: Optional[str] = Query(None, description="Keyword search"),
    severity: Optional[str] = Query(None, description="Severity filter: critical/warning/info"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Search historical intelligence.

    Supports combined filtering by entity, event type, time range,
    keyword, and severity.
    """
    audit = get_audit_logger()
    await audit.log_access(
        user=auth_info.key_hash[:8],
        resource="intelligence_search",
        action="search",
        ip=request.client.host if request.client else "",
        classification="internal",
        metadata={
            "entity": entity,
            "event_type": event_type,
            "date_from": date_from,
            "date_to": date_to,
            "keyword": keyword,
            "severity": severity,
        },
    )

    try:
        pool_manager = get_pool_manager()
        es = await pool_manager.elasticsearch.get_client()

        must_clauses = []
        filter_clauses = []

        if keyword:
            must_clauses.append({
                "multi_match": {
                    "query": keyword,
                    "fields": ["clean_text^2", "title", "entities.text", "tags"],
                }
            })

        if entity:
            must_clauses.append({"match": {"entities.text": entity}})

        if event_type:
            doc_ids = await _get_docs_by_event_type(event_type, date_from, date_to)
            if doc_ids:
                filter_clauses.append({"ids": {"values": doc_ids}})
            else:
                return {"total": 0, "items": [], "page": page, "page_size": page_size}

        if severity:
            filter_clauses.append({"term": {"severity": severity}})

        if date_from or date_to:
            date_range = {}
            if date_from:
                date_range["gte"] = date_from
            if date_to:
                date_range["lte"] = date_to
            filter_clauses.append({"range": {"timestamp": date_range}})

        query_body = {"bool": {"must": must_clauses, "filter": filter_clauses}}
        if not must_clauses and not filter_clauses:
            query_body = {"match_all": {}}

        from_offset = (page - 1) * page_size
        response = await es.search(
            index="omnilog_docs",
            query=query_body,
            from_=from_offset,
            size=page_size,
            sort=[{"timestamp": {"order": "desc"}}],
            _source=[
                "id", "source", "title", "clean_text", "timestamp", "url",
                "tags", "entities", "metadata", "fingerprint",
            ],
        )

        total = (
            response["hits"]["total"]["value"]
            if isinstance(response["hits"]["total"], dict)
            else response["hits"]["total"]
        )
        items = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            items.append({
                "doc_id": hit["_id"],
                "title": source.get("metadata", {}).get("title", source.get("title", "")),
                "source": source.get("source", ""),
                "url": source.get("url", ""),
                "timestamp": source.get("timestamp", ""),
                "summary": (source.get("clean_text", "") or "")[:300],
                "tags": source.get("tags", []),
                "entities": source.get("entities", []),
                "fingerprint": source.get("fingerprint", ""),
                "quality_score": source.get("metadata", {}).get("quality_score", 0),
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
            "items": items,
        }

    except Exception as e:
        logger.error("Historical intelligence search failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="Historical intelligence search service temporarily unavailable",
        )


@router.get("/intelligence/entities/{entity_name}/timeline")
async def get_entity_timeline(
    entity_name: str,
    request: Request,
    days: int = Query(30, ge=1, le=365, description="Days to look back"),
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Get entity intelligence timeline.

    Returns all intelligence related to the entity within the last N days,
    sorted chronologically.
    """
    audit = get_audit_logger()
    await audit.log_access(
        user=auth_info.key_hash[:8],
        resource=f"entity_timeline:{entity_name}",
        action="view",
        ip=request.client.host if request.client else "",
        classification="internal",
    )

    try:
        pool_manager = get_pool_manager()
        es = await pool_manager.elasticsearch.get_client()

        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)

        response = await es.search(
            index="omnilog_docs",
            query={
                "bool": {
                    "must": [{"match": {"entities.text": entity_name}}],
                    "filter": [{
                        "range": {
                            "timestamp": {
                                "gte": start_date.isoformat(),
                                "lte": end_date.isoformat(),
                            }
                        }
                    }],
                }
            },
            size=100,
            sort=[{"timestamp": {"order": "asc"}}],
            _source=[
                "source", "title", "clean_text", "timestamp", "url",
                "tags", "entities", "metadata",
            ],
        )

        timeline = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            timeline.append({
                "timestamp": source.get("timestamp", ""),
                "title": source.get("metadata", {}).get("title", source.get("title", "")),
                "source": source.get("source", ""),
                "url": source.get("url", ""),
                "summary": (source.get("clean_text", "") or "")[:200],
                "tags": source.get("tags", []),
            })

        events = await _get_entity_events(entity_name, days)

        return {
            "entity": entity_name,
            "days": days,
            "document_count": len(timeline),
            "event_count": len(events),
            "timeline": timeline,
            "events": events,
        }

    except Exception as e:
        logger.error("Failed to get entity timeline: %s", e, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="Entity timeline query service temporarily unavailable",
        )


@router.get("/intelligence/events/timeline")
async def get_events_timeline(
    request: Request,
    event_type: Optional[str] = Query(None, description="Event type filter"),
    days: int = Query(30, ge=1, le=365),
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """Get events timeline."""
    audit = get_audit_logger()
    await audit.log_access(
        user=auth_info.key_hash[:8],
        resource="events_timeline",
        action="view",
        ip=request.client.host if request.client else "",
        classification="internal",
        metadata={"event_type": event_type, "days": days},
    )

    try:
        events = await _get_events_timeline(event_type, days)
        return {
            "event_type": event_type,
            "days": days,
            "total": len(events),
            "events": events,
        }
    except Exception as e:
        logger.error("Failed to get events timeline: %s", e, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="Events timeline query service temporarily unavailable",
        )


@router.get("/intelligence/reports")
async def list_reports(
    request: Request,
    date_from: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    auth_info: APIKeyInfo = Depends(verify_api_key),
):
    """List historical daily reports.

    Reports are stored in MongoDB daily_reports collection, paginated
    by date descending.
    """
    audit = get_audit_logger()
    await audit.log_access(
        user=auth_info.key_hash[:8],
        resource="reports_list",
        action="view",
        ip=request.client.host if request.client else "",
        classification="internal",
    )

    try:
        pool_manager = get_pool_manager()
        config = get_config()
        mongo_client = await pool_manager.mongodb.get_client()
        collection = mongo_client[config.mongodb.database][
            os.getenv("MONGO_COLLECTION", "daily_reports")
        ]

        query_filter = {}
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to
        if date_filter:
            query_filter["date"] = date_filter

        total = await collection.count_documents(query_filter)

        skip = (page - 1) * page_size
        cursor = collection.find(
            query_filter,
            {
                "date": 1, "summary": 1, "generated_at": 1, "html_url": 1,
                "entities": 1, "events": 1, "_id": 0,
            },
        ).sort("date", -1).skip(skip).limit(page_size)

        items = []
        async for doc in cursor:
            items.append({
                "date": doc.get("date", ""),
                "summary": doc.get("summary", ""),
                "generated_at": doc.get("generated_at", ""),
                "html_url": doc.get("html_url", ""),
                "entity_count": len(doc.get("entities", [])),
                "event_count": len(doc.get("events", [])),
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size if total > 0 else 0,
            "items": items,
        }

    except Exception as e:
        logger.error("Failed to list reports: %s", e, exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="Report list query service temporarily unavailable",
        )


# ============================================================
# Helper functions
# ============================================================

async def _get_docs_by_event_type(
    event_type: str,
    date_from: Optional[str],
    date_to: Optional[str],
) -> List[str]:
    """Query Neo4j for document IDs linked to events of a given type.

    Optionally filters by date range. Returns empty list on failure.
    """
    try:
        pool_manager = get_pool_manager()
        driver = await pool_manager.neo4j.get_driver()

        date_conditions = []
        params = {"event_type": event_type}
        if date_from:
            date_conditions.append("e.start_time >= $date_from")
            params["date_from"] = date_from
        if date_to:
            date_conditions.append("e.start_time <= $date_to")
            params["date_to"] = date_to

        where_clause = "WHERE e.type = $event_type"
        if date_conditions:
            where_clause += " AND " + " AND ".join(date_conditions)

        async with driver.session() as session:
            result = await session.run(
                f"""
                MATCH (e:Event)-[:MENTIONS]->(d:Document)
                {where_clause}
                RETURN DISTINCT d.id as doc_id
                LIMIT 1000
                """,
                **params,
            )
            records = await result.data()
            return [r["doc_id"] for r in records if r.get("doc_id")]
    except Exception as e:
        logger.warning("Failed to query event-linked documents: %s", e)
        return []


async def _get_entity_events(entity_name: str, days: int) -> List[dict]:
    """Get events related to an entity within the last N days."""
    try:
        pool_manager = get_pool_manager()
        driver = await pool_manager.neo4j.get_driver()

        threshold = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

        async with driver.session() as session:
            result = await session.run(
                """
                MATCH (e:Event)-[:MENTIONS]->(ent:Entity)
                WHERE (ent.name = $entity_name OR ent.canonical_name = $entity_name)
                  AND e.start_time >= $threshold
                RETURN e.id as event_id, e.type as event_type, e.summary as summary,
                       e.severity as severity, e.start_time as timestamp
                ORDER BY e.start_time DESC
                LIMIT 50
                """,
                entity_name=entity_name,
                threshold=threshold,
            )
            records = await result.data()
            return records or []
    except Exception as e:
        logger.warning("Failed to query entity events: %s", e)
        return []


async def _get_events_timeline(
    event_type: Optional[str], days: int
) -> List[dict]:
    """Get the events timeline from Neo4j."""
    try:
        pool_manager = get_pool_manager()
        driver = await pool_manager.neo4j.get_driver()

        threshold = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

        async with driver.session() as session:
            if event_type:
                result = await session.run(
                    """
                    MATCH (e:Event)
                    WHERE e.type = $event_type AND e.start_time >= $threshold
                    RETURN e.id as event_id, e.type as event_type, e.summary as summary,
                           e.severity as severity, e.start_time as timestamp
                    ORDER BY e.start_time DESC
                    LIMIT 200
                    """,
                    event_type=event_type,
                    threshold=threshold,
                )
            else:
                result = await session.run(
                    """
                    MATCH (e:Event)
                    WHERE e.start_time >= $threshold
                    RETURN e.id as event_id, e.type as event_type, e.summary as summary,
                           e.severity as severity, e.start_time as timestamp
                    ORDER BY e.start_time DESC
                    LIMIT 200
                    """,
                    threshold=threshold,
                )
            records = await result.data()
            return records or []
    except Exception as e:
        logger.warning("Failed to query events timeline: %s", e)
        return []
