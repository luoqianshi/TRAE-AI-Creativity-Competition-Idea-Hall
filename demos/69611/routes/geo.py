"""Geo-spatial intelligence API endpoints.

Serves entity/event coordinates and map layer data for the Geo Intelligence
Dashboard (Phase 2). Data is fetched from Neo4j, Elasticsearch, and config.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query

from utils.db_pool import get_pool_manager
from utils.auth import verify_api_key
from config import get_config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/intelligence/geo", tags=["intelligence-geo"])


@router.get("/entities")
async def get_geo_entities(
    tier: Optional[int] = Query(None, description="Filter by tier (1-5)"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(500, le=5000),
    _=Depends(verify_api_key),
) -> Dict[str, Any]:
    """Get all geo-tagged entities from Neo4j as GeoJSON FeatureCollection."""
    try:
        pool = await get_pool_manager()
        driver = await pool.neo4j.get_driver()

        filters = ["e.latitude IS NOT NULL", "e.longitude IS NOT NULL"]
        params: Dict[str, Any] = {}
        if tier is not None:
            filters.append("e.tier = $tier")
            params["tier"] = tier
        if entity_type:
            filters.append("e.type = $type")
            params["type"] = entity_type

        where_clause = " AND ".join(filters)

        async with driver.session() as session:
            result = await session.run(
                f"""
                MATCH (e:Entity)
                WHERE {where_clause}
                RETURN e.entity_id as id, e.name as name, e.type as type,
                       e.latitude as lat, e.longitude as lon,
                       e.criticality_score as score, e.tier as tier
                LIMIT $limit
                """,
                limit=limit,
                **params,
            )
            records = await result.data()

    except Exception as e:
        logger.error("Failed to fetch geo entities: %s", e)
        records = []

    features = []
    for r in records:
        lat = r.get("lat")
        lon = r.get("lon")
        if lat is None or lon is None:
            continue
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat],
            },
            "properties": {
                "id": r.get("id"),
                "name": r.get("name"),
                "type": r.get("type"),
                "score": r.get("score"),
                "tier": r.get("tier"),
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "total": len(features),
    }


@router.get("/events")
async def get_geo_events(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    days: int = Query(7, le=90),
    limit: int = Query(200, le=1000),
    _=Depends(verify_api_key),
) -> Dict[str, Any]:
    """Get recent events with geographic context."""
    try:
        pool = await get_pool_manager()
        driver = await pool.neo4j.get_driver()

        # Events linked to geo entities
        async with driver.session() as session:
            result = await session.run(
                """
                MATCH (ev:Event)
                WHERE ev.start_time > (timestamp() - $days * 24 * 60 * 60 * 1000)
                  AND ($severity IS NULL OR ev.severity = $severity)
                OPTIONAL MATCH (ev)-[:MENTIONS]->(e:Entity)
                WHERE e.latitude IS NOT NULL
                RETURN ev.id as event_id, ev.summary as summary,
                       ev.severity as severity, ev.type as event_type,
                       e.latitude as lat, e.longitude as lon,
                       e.name as entity_name, ev.start_time as time
                LIMIT $limit
                """,
                days=days,
                severity=severity,
                limit=limit,
            )
            records = await result.data()

    except Exception as e:
        logger.error("Failed to fetch geo events: %s", e)
        records = []

    # Build features, grouping by event
    features = []
    seen: set = set()
    for r in records:
        eid = r.get("event_id")
        lat = r.get("lat")
        lon = r.get("lon")
        if not eid or lat is None or lon is None:
            continue
        if eid in seen:
            continue
        seen.add(eid)

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat],
            },
            "properties": {
                "event_id": eid,
                "summary": r.get("summary", "")[:200],
                "severity": r.get("severity", "info"),
                "type": r.get("event_type", "unknown"),
                "entity": r.get("entity_name", ""),
                "time": str(r.get("time", "")),
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "total": len(features),
    }


@router.get("/stats")
async def get_geo_stats(_=Depends(verify_api_key)) -> Dict[str, Any]:
    """Get geographic coverage statistics."""
    try:
        pool = await get_pool_manager()
        driver = await pool.neo4j.get_driver()

        async with driver.session() as session:
            result = await session.run(
                """
                MATCH (e:Entity)
                WHERE e.latitude IS NOT NULL
                RETURN
                    count(e) as total_geo_entities,
                    count(DISTINCT e.type) as entity_types,
                    count(DISTINCT e.tier) as tiers_represented
                """
            )
            record = await result.single()
            total = record["total_geo_entities"] if record else 0
            types = record["entity_types"] if record else 0
            tiers = record["tiers_represented"] if record else 0

        return {
            "total_geo_entities": total,
            "entity_types": types,
            "tiers_represented": tiers,
            "geo_coverage_pct": round(
                min(100.0, total / max(1, total + 100) * 100), 1
            ),
        }
    except Exception as e:
        logger.error("Failed to fetch geo stats: %s", e)
        return {
            "total_geo_entities": 0,
            "entity_types": 0,
            "tiers_represented": 0,
            "geo_coverage_pct": 0.0,
            "error": str(e),
        }
