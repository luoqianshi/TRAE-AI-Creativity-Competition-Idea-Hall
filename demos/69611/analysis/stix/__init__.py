"""STIX 2.1 intelligence export module.

Maps Machine's Neo4j knowledge graph entities and events to STIX 2.1
Structured Data Objects (SDOs) for interoperability with threat intelligence
platforms.

Supports:
- Export individual entities as STIX Identity / ThreatActor / Location
- Export events as STIX Report / Incident
- Export entity relationships as STIX Relationship SROs
- TAXII 2.x client for consuming external threat feeds

Reference: OASIS STIX 2.1 spec, MITRE ATT&CK.
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ── STIX type mappings ──────────────────────────────────────────────

ENTITY_TYPE_TO_STIX = {
    "ORG": "identity",
    "PERSON": "threat-actor",
    "LOCATION": "location",
    "GPE": "location",
    "EVENT": "incident",
    "PRODUCT": "tool",
    "TECHNOLOGY": "attack-pattern",
    "ASSET": "infrastructure",
    "CONCEPT": "campaign",
}

SEVERITY_TO_STIX = {
    "critical": "high",
    "warning": "medium",
    "info": "low",
}

STIX_IDENTITY_CLASS = {
    "ORG": "organization",
    "PERSON": "individual",
    "GPE": "unknown",
}


def _stix_id(prefix: str, local_id: str) -> str:
    """Generate a deterministic STIX identifier from a local id."""
    namespace = uuid.NAMESPACE_DNS
    name = f"omnilog:{prefix}:{local_id}"
    uid = uuid.uuid5(namespace, name)
    return f"{prefix}--{uid.hex[:36]}"


def _timestamp(dt=None) -> str:
    if dt is None:
        dt = datetime.now(timezone.utc)
    if isinstance(dt, (int, float)):
        dt = datetime.fromtimestamp(dt / 1000, tz=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%fZ")


# ── Export functions ────────────────────────────────────────────────


def entity_to_stix(entity: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Convert a Machine entity dict to a STIX 2.1 SDO."""
    etype = entity.get("type", "UNKNOWN")
    stix_type = ENTITY_TYPE_TO_STIX.get(etype)
    if not stix_type:
        logger.debug("No STIX mapping for entity type %s", etype)
        return None

    entity_id = entity.get("entity_id") or entity.get("name", "unknown")
    name = entity.get("canonical_name") or entity.get("name", "Unnamed")

    base: Dict[str, Any] = {
        "id": _stix_id(stix_type, entity_id),
        "spec_version": "2.1",
        "type": stix_type,
        "name": name,
        "created": _timestamp(entity.get("created_at")),
        "modified": _timestamp(entity.get("updated_at")),
    }

    # Type-specific fields
    if stix_type == "identity":
        base["identity_class"] = STIX_IDENTITY_CLASS.get(etype, "unknown")
        if entity.get("description"):
            base["description"] = entity["description"]
    elif stix_type == "location":
        lat = entity.get("latitude")
        lon = entity.get("longitude")
        if lat is not None and lon is not None:
            base["latitude"] = float(lat)
            base["longitude"] = float(lon)
    elif stix_type == "threat-actor":
        base["threat_actor_types"] = ["individual"]
        if entity.get("description"):
            base["description"] = entity["description"]
    elif stix_type == "incident":
        base["incident_type"] = entity.get("event_type", "unknown")
        sev = entity.get("severity", "info")
        base["severity"] = SEVERITY_TO_STIX.get(sev, "medium")
    elif stix_type == "tool":
        base["tool_types"] = ["information-gathering"]
    elif stix_type == "attack-pattern":
        base["description"] = entity.get("description", "")
    elif stix_type == "infrastructure":
        base["infrastructure_types"] = ["unknown"]

    # Confidence
    confidence = entity.get("confidence") or entity.get("link_confidence")
    if confidence is not None:
        base["confidence"] = int(float(confidence) * 100)

    return base


def relation_to_stix_relationship(
    rel: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """Convert a Machine relation to a STIX Relationship SRO."""
    subject = rel.get("subject", "")
    obj = rel.get("object", "")
    predicate = rel.get("predicate", "related-to")

    # Map predicate to STIX relationship_type
    stix_rel = {
        "related_to": "related-to",
        "owned_by": "owns",
        "part_of": "part-of",
        "subsidiary_of": "part-of",
        "invests_in": "related-to",
        "supplies": "related-to",
        "competes_with": "related-to",
    }.get(predicate, "related-to")

    return {
        "id": _stix_id("relationship", f"{subject}-{predicate}-{obj}"),
        "spec_version": "2.1",
        "type": "relationship",
        "relationship_type": stix_rel,
        "source_ref": _stix_id("identity", subject),
        "target_ref": _stix_id("identity", obj),
        "created": _timestamp(),
        "modified": _timestamp(),
    }


def event_to_stix_report(event: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a detected event to a STIX Report."""
    event_id = event.get("event_id") or event.get("id", "unknown")
    summary = event.get("summary", "No summary")
    sev = event.get("severity", "info")

    report = {
        "id": _stix_id("report", event_id),
        "spec_version": "2.1",
        "type": "report",
        "name": summary[:120],
        "description": summary,
        "report_types": [event.get("event_type", "intelligence"),
                        f"severity:{sev}"],
        "published": _timestamp(event.get("start_time") or event.get("detected_at")),
        "created": _timestamp(event.get("detected_at")),
        "modified": _timestamp(),
        "object_refs": [],
    }

    # Add entity references
    for ent_name in event.get("entities", []):
        report["object_refs"].append(_stix_id("identity", ent_name))

    return report


def export_bundle(objects: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Wrap STIX objects in a STIX 2.1 Bundle."""
    return {
        "type": "bundle",
        "id": _stix_id("bundle", f"bundle_{datetime.now(timezone.utc).timestamp()}"),
        "spec_version": "2.1",
        "objects": objects,
    }


# ── Bulk export from Neo4j ──────────────────────────────────────────


async def export_graph_as_stix(
    entity_limit: int = 100,
    relation_limit: int = 200,
    event_limit: int = 50,
) -> Dict[str, Any]:
    """Export the entire knowledge graph as a STIX 2.1 bundle.

    Args:
        entity_limit: Max entities to export.
        relation_limit: Max relations to export.
        event_limit: Max events to export.

    Returns:
        STIX 2.1 Bundle dict.
    """
    objects: List[Dict[str, Any]] = []

    try:
        from utils.db_pool import get_pool_manager
        pool = await get_pool_manager()
        driver = await pool.neo4j.get_driver()

        async with driver.session() as session:
            # Export entities
            result = await session.run(
                """
                MATCH (e:Entity)
                RETURN e.entity_id as entity_id, e.name as name,
                       e.type as type, e.confidence as confidence,
                       e.created_at as created_at,
                       e.updated_at as updated_at,
                       e.description as description,
                       e.latitude as latitude, e.longitude as longitude
                LIMIT $limit
                """,
                limit=entity_limit,
            )
            async for record in result:
                stix_obj = entity_to_stix(dict(record))
                if stix_obj:
                    objects.append(stix_obj)

            # Export relations
            result = await session.run(
                """
                MATCH (a)-[r:RELATED_TO]->(b)
                RETURN a.name as subject, r.predicate as predicate,
                       b.name as object
                LIMIT $limit
                """,
                limit=relation_limit,
            )
            async for record in result:
                rel_obj = relation_to_stix_relationship(dict(record))
                if rel_obj:
                    objects.append(rel_obj)

            # Export events
            result = await session.run(
                """
                MATCH (ev:Event)
                RETURN ev.id as event_id, ev.summary as summary,
                       ev.severity as severity, ev.type as event_type,
                       ev.start_time as start_time,
                       ev.detected_at as detected_at,
                       ev.entities as entities
                ORDER BY ev.start_time DESC
                LIMIT $limit
                """,
                limit=event_limit,
            )
            async for record in result:
                report_obj = event_to_stix_report(dict(record))
                objects.append(report_obj)

    except Exception as e:
        logger.error("STIX export failed: %s", e)

    return export_bundle(objects)


# ── TAXII 2.x Client ────────────────────────────────────────────────


class TAXIIClient:
    """Lightweight TAXII 2.1 client for consuming external threat intelligence.

    Currently supports:
    - Discovery (GET /taxii2/)
    - Get API Root info
    - Get Collections
    - Get Collection objects
    """

    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    async def get_collections(self) -> List[Dict[str, Any]]:
        """List available TAXII collections."""
        import aiohttp
        headers = {"Accept": "application/taxii+json;version=2.1"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(
                    f"{self.base_url}/collections/", timeout=aiohttp.ClientTimeout(total=15)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("collections", [])
        except Exception as e:
            logger.warning("TAXII collection fetch failed: %s", e)
        return []

    async def get_objects(
        self, collection_id: str, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch STIX objects from a TAXII collection."""
        import aiohttp
        headers = {"Accept": "application/taxii+json;version=2.1"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(
                    f"{self.base_url}/collections/{collection_id}/objects/",
                    params={"limit": limit},
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("objects", [])
        except Exception as e:
            logger.warning("TAXII objects fetch failed: %s", e)
        return []
