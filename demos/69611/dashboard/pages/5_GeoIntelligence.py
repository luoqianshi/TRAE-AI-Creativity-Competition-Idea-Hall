"""Page 5: Geo Intelligence — interactive map dashboard with layer controls.

Renders entities and events from Neo4j on an interactive pydeck/MapLibre map.
Supports layer toggling, entity type filters, tier filters, and tooltip details.

Reference: WorldMonitor's 56 map layer types, 3D globe + flat map dual engine.
"""

import os
import logging
import streamlit as st
import pandas as pd
import pydeck as pdk
import requests
from typing import Any, Dict, List, Optional

try:
    from _theme import apply_theme, page_header
except ImportError:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from _theme import apply_theme, page_header

st.set_page_config(
    page_title="Geo Intelligence - OmniLog",
    page_icon="🌍",
    layout="wide",
)

# ── API helpers ──────────────────────────────────────────────────────────

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("OMNILOG_API_KEY", "")
_logger = logging.getLogger("dashboard.geo")


def _h():
    d = {}
    if API_KEY:
        d["X-API-Key"] = API_KEY
        d["Authorization"] = "Bearer " + API_KEY
    return d


def _get(path: str, params: Optional[Dict] = None) -> Optional[Any]:
    try:
        r = requests.get(
            API_BASE_URL + path, headers=_h(), params=params, timeout=10
        )
        if r.status_code == 200:
            return r.json()
        _logger.warning("GET %s -> %s", path, r.status_code)
        return None
    except Exception as e:
        _logger.warning("GET %s failed: %s", path, e)
        return None


# 注入主题与动效
apply_theme()


# ── Layer definitions ───────────────────────────────────────────────────

LAYERS: Dict[str, Dict[str, Any]] = {
    "entities_all": {
        "name": "All Entities",
        "icon": "📍",
        "visible": True,
    },
    "entities_tier1_2": {
        "name": "High-Value (Tier 1-2)",
        "icon": "⭐",
        "visible": False,
    },
    "events_active": {
        "name": "Active Events (7d)",
        "icon": "🔥",
        "visible": True,
    },
    "events_critical": {
        "name": "Critical Events",
        "icon": "🚨",
        "visible": False,
    },
    "chokepoints": {
        "name": "Maritime Chokepoints",
        "icon": "⚓",
        "visible": True,
    },
    "entity_heatmap": {
        "name": "Criticality Heatmap",
        "icon": "🌡️",
        "visible": False,
    },
}

ENTITY_COLORS: Dict[str, List[int]] = {
    "ORG": [66, 133, 244, 180],
    "PERSON": [234, 67, 53, 180],
    "LOCATION": [52, 168, 83, 180],
    "GPE": [251, 188, 4, 180],
    "EVENT": [255, 87, 34, 180],
    "PRODUCT": [156, 39, 176, 180],
    "TECHNOLOGY": [0, 188, 212, 180],
    "CONCEPT": [158, 158, 158, 150],
    "": [128, 128, 128, 150],
}


# ── Data loading functions ──────────────────────────────────────────────

@st.cache_data(ttl=120)
def fetch_geo_entities(tier: Optional[int] = None, entity_type: Optional[str] = None) -> List[Dict]:
    """Fetch geo-tagged entities from the API with caching."""
    params = {"limit": 2000}
    if tier is not None:
        params["tier"] = tier
    if entity_type:
        params["entity_type"] = entity_type
    data = _get("/api/intelligence/geo/entities", params=params)
    return (data or {}).get("features", [])


@st.cache_data(ttl=120)
def fetch_geo_events(severity: Optional[str] = None, days: int = 7) -> List[Dict]:
    """Fetch geo-tagged events from the API with caching."""
    params = {"days": days, "limit": 500}
    if severity:
        params["severity"] = severity
    data = _get("/api/intelligence/geo/events", params=params)
    return (data or {}).get("features", [])


@st.cache_data(ttl=300)
def fetch_geo_stats() -> Dict:
    """Fetch geographic coverage statistics."""
    data = _get("/api/intelligence/geo/stats")
    return data or {}


# ── Layer builders ──────────────────────────────────────────────────────

def _features_to_df(features: List[Dict]) -> pd.DataFrame:
    """Convert GeoJSON features to pandas DataFrame for pydeck."""
    rows = []
    for f in features:
        if not isinstance(f, dict):
            continue
        props = f.get("properties") or {}
        # 修复: geometry 可能为 None (GeoJSON 中 null geometry 合法)
        geometry = f.get("geometry") or {}
        coords = geometry.get("coordinates") or [0, 0]
        # coords 可能是嵌套结构，确保取到 [lon, lat]
        if coords and isinstance(coords, (list, tuple)):
            lon = coords[0] if len(coords) > 0 else 0
            lat = coords[1] if len(coords) > 1 else 0
        else:
            lon, lat = 0, 0
        rows.append({
            "name": props.get("name") or "Unknown",
            "type": props.get("type") or "",
            # 修复: tier 可能是字符串，统一转 numeric
            "tier": pd.to_numeric(props.get("tier"), errors="coerce"),
            "score": props.get("score"),
            "lat": lat,
            "lon": lon,
        })
    return pd.DataFrame(rows)


def _get_color(row) -> List[int]:
    return ENTITY_COLORS.get(row.get("type", ""), ENTITY_COLORS[""])


def build_entity_layer(df: pd.DataFrame, layer_id: str, visible: bool) -> Optional[pdk.Layer]:
    if df.empty or not visible:
        return None
    return pdk.Layer(
        "ScatterplotLayer",
        id=layer_id,
        data=df,
        get_position=["lon", "lat"],
        get_radius=200000,
        get_fill_color=_get_color,
        pickable=True,
        auto_highlight=True,
        radius_scale=1.5,
        radius_min_pixels=3,
        radius_max_pixels=50,
    )


def build_tier_filtered_layer(df_all: pd.DataFrame, max_tier: int, layer_id: str, visible: bool) -> Optional[pdk.Layer]:
    if df_all.empty or not visible:
        return None
    df = df_all[df_all["tier"].notna() & (df_all["tier"] <= max_tier)].copy()
    if df.empty:
        return None
    return pdk.Layer(
        "ScatterplotLayer",
        id=layer_id,
        data=df,
        get_position=["lon", "lat"],
        get_radius=400000,
        get_fill_color=[255, 50, 50, 200],
        pickable=True,
        auto_highlight=True,
        radius_scale=2.0,
        radius_min_pixels=5,
        radius_max_pixels=60,
    )


def build_events_layer(features: List[Dict], layer_id: str, visible: bool) -> Optional[pdk.Layer]:
    if not features or not visible:
        return None
    rows = []
    for f in features:
        props = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [0, 0])
        weight = 3.0 if props.get("severity") == "critical" else (
            2.0 if props.get("severity") == "warning" else 1.0
        )
        rows.append({
            "lat": coords[1] if len(coords) > 1 else 0,
            "lon": coords[0] if len(coords) > 0 else 0,
            "weight": weight,
            "summary": (props.get("summary") or "")[:80],
            "severity": props.get("severity", "info"),
        })
    df = pd.DataFrame(rows)
    if df.empty:
        return None
    return pdk.Layer(
        "HeatmapLayer",
        id=layer_id,
        data=df,
        get_position=["lon", "lat"],
        get_weight="weight",
        radius_pixels=60,
        intensity=1.2,
        threshold=0.05,
    )


def build_chokepoint_layer(visible: bool) -> Optional[pdk.Layer]:
    if not visible:
        return None
    chokepoints = [
        {"name": "Strait of Hormuz", "lat": 26.5, "lon": 56.0, "ci": 9.5},
        {"name": "Malacca Strait", "lat": 2.0, "lon": 102.0, "ci": 9.0},
        {"name": "Suez Canal", "lat": 30.5, "lon": 32.5, "ci": 8.5},
        {"name": "Bab el-Mandeb", "lat": 12.6, "lon": 43.4, "ci": 8.0},
        {"name": "Panama Canal", "lat": 9.0, "lon": -79.5, "ci": 8.0},
        {"name": "Taiwan Strait", "lat": 25.0, "lon": 120.0, "ci": 8.5},
        {"name": "Gibraltar Strait", "lat": 36.0, "lon": -5.5, "ci": 7.0},
        {"name": "Bosphorus Strait", "lat": 41.1, "lon": 29.0, "ci": 7.0},
        {"name": "Dover Strait", "lat": 51.0, "lon": 1.5, "ci": 6.5},
    ]
    df = pd.DataFrame(chokepoints)
    return pdk.Layer(
        "ScatterplotLayer",
        id="chokepoints",
        data=df,
        get_position=["lon", "lat"],
        get_radius=300000,
        get_fill_color=[255, 165, 0, 220],
        pickable=True,
        auto_highlight=True,
        radius_min_pixels=6,
    )


def build_heatmap_layer(features: List[Dict], visible: bool) -> Optional[pdk.Layer]:
    if not features or not visible:
        return None
    rows = []
    for f in features:
        if not isinstance(f, dict):
            continue
        props = f.get("properties") or {}
        # 修复: geometry 可能为 None
        geometry = f.get("geometry") or {}
        coords = geometry.get("coordinates") or [0, 0]
        if not isinstance(coords, (list, tuple)):
            coords = [0, 0]
        # 修复: score=0 是合法最低分，不能用 `or` 误判
        score = props.get("score")
        if score is None:
            score = 5.0
        try:
            weight = float(score) / 10.0
        except (TypeError, ValueError):
            weight = 0.5
        rows.append({
            "lat": coords[1] if len(coords) > 1 else 0,
            "lon": coords[0] if len(coords) > 0 else 0,
            "weight": weight,
        })
    df = pd.DataFrame(rows)
    if df.empty:
        return None
    return pdk.Layer(
        "HeatmapLayer",
        id="entity_heatmap",
        data=df,
        get_position=["lon", "lat"],
        get_weight="weight",
        radius_pixels=40,
        intensity=1.5,
        threshold=0.1,
    )


# ── Tooltip helper ──────────────────────────────────────────────────────
# 修复: 与全应用浅色主题一致，使用 omnilog-tooltip 样式

TOOLTIP = {
    "html": (
        "<div class='omnilog-tooltip'>"
        "<div class='title'>{name}</div>"
        "<div class='meta'>Type: {type}</div>"
        "<div class='meta'>{summary}</div>"
        "</div>"
    ),
    "style": {"backgroundColor": "transparent"},
}


# ── UI ──────────────────────────────────────────────────────────────────

page_header(
    "🌍",
    "Geo Intelligence",
    "Interactive intelligence map — entities, events, and infrastructure",
)

# ── Sidebar: controls ──────────────────────────────────────────────────

with st.sidebar:
    st.markdown("### 🗺️ Layer Controls")

    layer_toggles: Dict[str, bool] = {}
    for lid, ldef in LAYERS.items():
        layer_toggles[lid] = st.checkbox(
            f"{ldef['icon']} {ldef['name']}",
            value=ldef["visible"],
            key=f"layer_{lid}",
        )

    st.markdown("---")
    st.markdown("### 🔍 Filters")

    entity_type_filter = st.selectbox(
        "Entity Type",
        options=["All", "ORG", "PERSON", "LOCATION", "GPE", "EVENT", "TECHNOLOGY"],
        index=0,
    )

    col1, col2 = st.columns(2)
    with col1:
        days_back = st.number_input("Event days", min_value=1, max_value=90, value=7)
    with col2:
        pass

    st.markdown("---")
    if st.button("🔄 Refresh Data"):
        st.cache_data.clear()
        st.rerun()

    # Stats
    st.markdown("### 📊 Geo Stats")
    stats = fetch_geo_stats()
    mc1, mc2, mc3 = st.columns(3)
    mc1.metric("Geo Entities", stats.get("total_geo_entities", "?"))
    mc2.metric("Entity Types", stats.get("entity_types", "?"))
    mc3.metric("Tiers", stats.get("tiers_represented", "?"))

# ── Map ─────────────────────────────────────────────────────────────────

# Fetch data
entity_type_param = entity_type_filter if entity_type_filter != "All" else None
entities = fetch_geo_entities(entity_type=entity_type_param)
events = fetch_geo_events(days=days_back)

df_entities = _features_to_df(entities)

# Build visible layers
map_layers: List[pdk.Layer] = []

# 1. Entity scatterplot
entity_layer = build_entity_layer(df_entities, "entities_all", layer_toggles["entities_all"])
if entity_layer:
    map_layers.append(entity_layer)

# 2. Tier 1-2 filtered
tier_layer = build_tier_filtered_layer(df_entities, 2, "entities_tier1_2", layer_toggles["entities_tier1_2"])
if tier_layer:
    map_layers.append(tier_layer)

# 3. Events heatmap
events_layer = build_events_layer(events, "events_active", layer_toggles["events_active"])
if events_layer:
    map_layers.append(events_layer)

# 4. Chokepoints
cp_layer = build_chokepoint_layer(layer_toggles["chokepoints"])
if cp_layer:
    map_layers.append(cp_layer)

# 5. Heatmap
hm_layer = build_heatmap_layer(entities, layer_toggles["entity_heatmap"])
if hm_layer:
    map_layers.append(hm_layer)

# Initial view — 修复: 视图中心随数据自适应，避免数据在东亚而地图中心在非洲
if not df_entities.empty and "lat" in df_entities.columns and "lon" in df_entities.columns:
    valid = df_entities.dropna(subset=["lat", "lon"])
    if not valid.empty:
        center_lat = float(valid["lat"].mean())
        center_lon = float(valid["lon"].mean())
    else:
        center_lat, center_lon = 30.0, 20.0
else:
    center_lat, center_lon = 30.0, 20.0

view_state = pdk.ViewState(
    latitude=center_lat,
    longitude=center_lon,
    zoom=1.5,
    pitch=0,
    bearing=0,
)

# 修复: Mapbox style 需 token，未配置时切换到免费的 CARTO basemap
_mapbox_token = os.getenv("MAPBOX_API_KEY", "")
if _mapbox_token:
    pdk.settings.api_key = _mapbox_token
    _map_style = "mapbox://styles/mapbox/light-v10"
else:
    _map_style = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"

# Render
if map_layers:
    deck = pdk.Deck(
        layers=map_layers,
        initial_view_state=view_state,
        tooltip=TOOLTIP,
        map_style=_map_style,
    )
    st.pydeck_chart(deck, use_container_width=True, height=600)
else:
    st.info("No layers active — toggle layers in the sidebar to populate the map.")

# ── Data table ──────────────────────────────────────────────────────────

with st.expander("📋 Raw Entity Data", expanded=False):
    if not df_entities.empty:
        st.dataframe(
            df_entities[["name", "type", "tier", "score", "lat", "lon"]],
            use_container_width=True,
            hide_index=True,
        )
    else:
        st.caption("No geo-tagged entities available yet. Run the pipeline to populate data.")

st.caption(
    "Data source: Neo4j knowledge graph · Rendered with pydeck (deck.gl) · "
    "Reference: WorldMonitor map-layer-definitions.ts"
)
