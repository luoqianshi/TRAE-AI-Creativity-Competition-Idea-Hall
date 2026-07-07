"""Geo-visualization utilities for the intelligence map dashboard.

Builds pydeck layers from Neo4j entity/event data and map layer configurations.
Bridges the gap between backend data (GeoJSON) and frontend rendering (deck.gl).
"""

import logging
from typing import Any, Dict, List, Optional

import yaml
import os

logger = logging.getLogger(__name__)

# Color palettes by entity type
ENTITY_COLORS: Dict[str, List[int]] = {
    "ORG": [66, 133, 244, 180],
    "PERSON": [234, 67, 53, 180],
    "LOCATION": [52, 168, 83, 180],
    "GPE": [251, 188, 4, 180],
    "EVENT": [255, 87, 34, 180],
    "PRODUCT": [156, 39, 176, 180],
    "TECHNOLOGY": [0, 188, 212, 180],
    "CONCEPT": [158, 158, 158, 150],
    "ASSET": [255, 193, 7, 180],
    "UNKNOWN": [128, 128, 128, 150],
}

SEVERITY_COLORS: Dict[str, List[int]] = {
    "critical": [255, 0, 0, 200],
    "warning": [255, 165, 0, 200],
    "info": [66, 133, 244, 180],
}


def load_map_layers(config_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Load map layer definitions from YAML config."""
    if config_path is None:
        config_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "config",
            "map_layers.yaml",
        )
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data.get("layers", [])
    except Exception as e:
        logger.error("Failed to load map layers: %s", e)
        return []


def get_default_layers(config_path: Optional[str] = None) -> List[str]:
    """Get the list of default active layer IDs."""
    config_path = config_path or os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "config", "map_layers.yaml"
    )
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data.get("default_layers", [])
    except Exception:
        return ["entities_all", "events_active"]


def get_map_defaults(config_path: Optional[str] = None) -> Dict[str, Any]:
    """Get default map view settings."""
    config_path = config_path or os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "config", "map_layers.yaml"
    )
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data.get("map_defaults", {})
    except Exception:
        return {}


def build_entity_scatterplot(
    geo_features: List[Dict[str, Any]],
    layer_config: Dict[str, Any],
    color_by_type: bool = True,
) -> List[Dict[str, Any]]:
    """Convert GeoJSON entity features to pydeck ScatterplotLayer data.

    Returns a list of dicts suitable for ``pydeck.Layer("ScatterplotLayer", data=...)``.
    """
    if color_by_type:
        get_color = (
            "properties.type",
            lambda t: ENTITY_COLORS.get(t, ENTITY_COLORS["UNKNOWN"]),
        )
    else:
        get_color = ENTITY_COLORS["UNKNOWN"]

    rows = []
    for f in geo_features:
        props = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [0, 0])
        rows.append({
            "name": props.get("name", "Unknown"),
            "type": props.get("type", "UNKNOWN"),
            "tier": props.get("tier"),
            "score": props.get("score"),
            "lat": coords[1] if len(coords) > 1 else 0,
            "lon": coords[0] if len(coords) > 0 else 0,
        })

    return [
        {
            "@@type": "ScatterplotLayer",
            "id": layer_config.get("id", "entities"),
            "data": rows,
            "get_position": ["lon", "lat"],
            "get_radius": layer_config.get("pydeck_layer", {}).get(
                "get_radius", 200000
            ),
            "get_fill_color": get_color,
            "pickable": True,
            "auto_highlight": True,
            "radius_scale": 1.5,
            "radius_min_pixels": 3,
            "radius_max_pixels": 50,
        }
    ]


def build_event_heatmap(
    geo_features: List[Dict[str, Any]],
    layer_config: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Build a HeatmapLayer from event GeoJSON features."""
    rows = []
    for f in geo_features:
        props = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [0, 0])
        weight = 1.0
        if props.get("severity") == "critical":
            weight = 3.0
        elif props.get("severity") == "warning":
            weight = 2.0
        rows.append({
            "lat": coords[1] if len(coords) > 1 else 0,
            "lon": coords[0] if len(coords) > 0 else 0,
            "weight": weight,
            "summary": props.get("summary", "")[:80],
        })

    return [
        {
            "@@type": "HeatmapLayer",
            "id": layer_config.get("id", "events"),
            "data": rows,
            "get_position": ["lon", "lat"],
            "get_weight": "weight",
            "radius_pixels": layer_config.get("pydeck_layer", {}).get(
                "radius_pixels", 60
            ),
            "intensity": layer_config.get("pydeck_layer", {}).get(
                "intensity", 1.0
            ),
            "threshold": layer_config.get("pydeck_layer", {}).get(
                "threshold", 0.05
            ),
        }
    ]


def build_chokepoint_layer(
    inline_data: List[Dict[str, Any]],
    layer_config: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Build a static scatterplot layer from inline data (e.g. chokepoints)."""
    rows = []
    for item in inline_data:
        lat = float(item.get("lat", 0))
        lon = float(item.get("lon", 0))
        rows.append({
            "name": item.get("name", "Point"),
            "lat": lat,
            "lon": lon,
            "criticality": item.get("criticality", 5.0),
        })

    return [
        {
            "@@type": "ScatterplotLayer",
            "id": layer_config.get("id", "chokepoints"),
            "data": rows,
            "get_position": ["lon", "lat"],
            "get_radius": layer_config.get("pydeck_layer", {}).get(
                "get_radius", 300000
            ),
            "get_fill_color": layer_config.get("pydeck_layer", {}).get(
                "get_fill_color", [255, 165, 0, 200]
            ),
            "pickable": True,
            "auto_highlight": True,
        }
    ]


def get_layer_builder(layer_config: Dict[str, Any]):
    """Return the appropriate builder function for a layer type."""
    layer_type = layer_config.get("pydeck_layer", {}).get("type", "ScatterplotLayer")
    builders = {
        "ScatterplotLayer": build_entity_scatterplot,
        "HeatmapLayer": build_event_heatmap,
        "ColumnLayer": build_entity_scatterplot,
    }
    return builders.get(layer_type, build_entity_scatterplot)
