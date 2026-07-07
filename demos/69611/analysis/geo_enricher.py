"""Geographic enrichment — extract coordinates from entity text and location names.

Uses a tiered resolution strategy:
1. LLM-based extraction from entity name/description (for structured entities)
2. Geocoding via Nominatim / geopy (for location names)
3. Pre-loaded gazetteer fallback (common cities, regions, chokepoints)

Reference: WorldMonitor geo-map.ts (194KB geographic data), map-layer-definitions.ts.
"""

import asyncio
import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------


@dataclass
class GeoCoordinate:
    """Standardized geographic coordinate."""

    latitude: float
    longitude: float
    source: str  # "llm", "geocoding", "gazetteer", "manual"
    confidence: float = 1.0
    geo_json: Optional[Dict[str, Any]] = None  # optional GeoJSON Point geometry


# ---------------------------------------------------------------------------
# Built-in gazetteer (common places, chokepoints, reference locations)
# ---------------------------------------------------------------------------

_GAZETTEER: Dict[str, Tuple[float, float]] = {
    # Maritime chokepoints
    "strait of hormuz": (26.5, 56.0),
    "malacca strait": (2.0, 102.0),
    "south china sea": (12.0, 113.0),
    "bab el-mandeb": (12.6, 43.4),
    "suez canal": (30.5, 32.5),
    "panama canal": (9.0, -79.5),
    "taiwan strait": (25.0, 120.0),
    "bosphorus strait": (41.1, 29.0),
    "dover strait": (51.0, 1.5),
    "gibraltar strait": (36.0, -5.5),
    # Major data center hubs
    "ashburn": (39.0, -77.5),
    "northern virginia": (38.8, -77.3),
    "singapore": (1.35, 103.82),
    "dublin": (53.35, -6.26),
    "tokyo": (35.68, 139.69),
    "frankfurt": (50.11, 8.68),
    "london": (51.51, -0.13),
    "são paulo": (-23.55, -46.63),
    # Key geopolitical locations
    "silicon valley": (37.4, -122.0),
    "washington d.c.": (38.9, -77.0),
    "beijing": (39.9, 116.4),
    "moscow": (55.76, 37.62),
    "taipei": (25.03, 121.57),
    "hong kong": (22.32, 114.17),
    "shanghai": (31.23, 121.47),
    "seoul": (37.57, 126.98),
    "pyongyang": (39.04, 125.76),
    "tehran": (35.69, 51.39),
    "jerusalem": (31.77, 35.22),
    "kiev": (50.45, 30.52),
    "delhi": (28.61, 77.23),
    "mumbai": (19.08, 72.88),
}

_GEO_JSON_TEMPLATE: Dict[str, Any] = {"type": "Point", "coordinates": [0.0, 0.0]}

_COORDINATE_PATTERN = re.compile(
    r"(-?\d+\.?\d*)\s*[,;]\s*(-?\d+\.?\d*)"
)

_LOCATION_TYPE_HINTS = {"LOCATION", "GPE"}


# ---------------------------------------------------------------------------
# GeoEnricher
# ---------------------------------------------------------------------------


class GeoEnricher:
    """Resolve geographic coordinates for entities.

    Uses gazetteer → geocoding → LLM extraction in descending priority.
    """

    def __init__(self, user_agent: str = "Machine-Intelligence/1.0"):
        self._user_agent = user_agent
        self._geocode_semaphore = asyncio.Semaphore(5)
        self._geocoder = None  # lazy init Nominatim

    async def enrich(self, entity: Dict[str, Any]) -> Optional[GeoCoordinate]:
        """Resolve a coordinate for a single entity dict.

        The entity dict should contain at minimum ``name`` and optionally
        ``type``, ``metadata``, or ``description`` fields.
        """
        name: str = entity.get("name") or entity.get("canonical_name", "")
        entity_type: str = entity.get("type") or entity.get("label", "")
        description: str = entity.get("description", "")
        metadata: dict = entity.get("metadata") or {}
        source: str = metadata.get("source", "")

        # 1 — Check for explicit lat/lon in metadata
        lat = metadata.get("latitude") or metadata.get("lat")
        lon = metadata.get("longitude") or metadata.get("lon") or metadata.get("lng")
        if lat is not None and lon is not None:
            return GeoCoordinate(
                latitude=float(lat),
                longitude=float(lon),
                source="manual",
                confidence=0.95,
            )

        # 2 — Check gazetteer
        result = self._lookup_gazetteer(name)
        if result:
            return result

        # 3 — Try LLM extraction for location-type entities
        if entity_type in _LOCATION_TYPE_HINTS or not entity_type:
            result = self._extract_coordinate_from_text(name, description)
            if result:
                return result

        # 4 — Geocode (only for location-like names)
        if entity_type in _LOCATION_TYPE_HINTS:
            result = await self._geocode(name)
            if result:
                return result

        return None

    async def enrich_batch(
        self, entities: List[Dict[str, Any]]
    ) -> Dict[str, Optional[GeoCoordinate]]:
        """Enrich many entities in parallel.

        Returns a dict of ``entity_id → GeoCoordinate | None``.
        """
        tasks = {
            e.get("entity_id", e.get("name", str(idx))): self.enrich(e)
            for idx, e in enumerate(entities)
        }
        results = await asyncio.gather(*tasks.values())
        return dict(zip(tasks.keys(), results))

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _lookup_gazetteer(self, name: str) -> Optional[GeoCoordinate]:
        key = name.strip().lower()
        if key in _GAZETTEER:
            lat, lon = _GAZETTEER[key]
            gj: Dict[str, Any] = {"type": "Point", "coordinates": [lon, lat]}
            return GeoCoordinate(
                latitude=lat, longitude=lon, source="gazetteer", confidence=0.9, geo_json=gj
            )
        return None

    def _extract_coordinate_from_text(
        self, name: str, description: str
    ) -> Optional[GeoCoordinate]:
        """Try to find a coordinate pair embedded in text.

        Handles patterns like "35.5, 139.7", "51.5 N, 0.1 W".
        """
        text = f"{name} {description}"
        # Decimal degrees
        m = _COORDINATE_PATTERN.search(text)
        if m:
            lat, lon = float(m.group(1)), float(m.group(2))
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                gj: Dict[str, Any] = {"type": "Point", "coordinates": [lon, lat]}
                return GeoCoordinate(
                    latitude=lat,
                    longitude=lon,
                    source="llm",
                    confidence=0.7,
                    geo_json=gj,
                )
        return None

    async def _geocode(self, location_name: str) -> Optional[GeoCoordinate]:
        """Resolve via Nominatim (rate-limited)."""
        try:
            from geopy.adapters import AioHTTPAdapter
            from geopy.geocoders import Nominatim
        except ImportError:
            logger.debug("geopy not installed — skipping geocoding for '%s'", location_name)
            return None

        async with self._geocode_semaphore:
            try:
                if self._geocoder is None:
                    self._geocoder = Nominatim(
                        user_agent=self._user_agent,
                        adapter_factory=AioHTTPAdapter,
                    )
                location = await self._geocoder.geocode(location_name, exactly_one=True)
                if location and location.latitude and location.longitude:
                    gj: Dict[str, Any] = {
                        "type": "Point",
                        "coordinates": [location.longitude, location.latitude],
                    }
                    return GeoCoordinate(
                        latitude=location.latitude,
                        longitude=location.longitude,
                        source="geocoding",
                        confidence=0.8,
                        geo_json=gj,
                    )
            except Exception as exc:
                logger.warning("Geocoding failed for '%s': %s", location_name, exc)
            return None
