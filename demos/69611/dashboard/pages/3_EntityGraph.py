"""Page 3: Entity Graph & Watchlist — entity profile, relationship graph,
and watchlist management.

Enhanced with entity profile view, watchlist add/remove, and scoring display.
Reference: WorldMonitor Country Brief Page entity deep-dive patterns.
"""

import os
import urllib.parse
import logging
import streamlit as st
import requests

try:
    from _theme import apply_theme, page_header
except ImportError:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from _theme import apply_theme, page_header

st.set_page_config(
    page_title="Entity Graph - OmniLog",
    page_icon="🔍",
    layout="wide",
)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("OMNILOG_API_KEY", "")
_logger = logging.getLogger("dashboard.entitygraph")


def _h():
    d = {}
    if API_KEY:
        d["X-API-Key"] = API_KEY
        d["Authorization"] = "Bearer " + API_KEY
    return d


def _get(path, params=None):
    try:
        r = requests.get(API_BASE_URL + path, headers=_h(), params=params, timeout=10)
        if r.status_code == 200:
            return r.json()
        _logger.warning("GET %s -> %s", path, r.status_code)
        return None
    except Exception as e:
        _logger.warning("GET %s failed: %s", path, e)
        return None


def _post(path, params=None):
    try:
        r = requests.post(API_BASE_URL + path, headers=_h(), params=params, timeout=10)
        if r.status_code == 200:
            return r.json()
        _logger.warning("POST %s -> %s", path, r.status_code)
        return None
    except Exception as e:
        _logger.warning("POST %s failed: %s", path, e)
        return None


def _delete(path, params=None):
    try:
        r = requests.delete(API_BASE_URL + path, headers=_h(), params=params, timeout=10)
        if r.status_code == 200:
            return True
        _logger.warning("DELETE %s -> %s", path, r.status_code)
        return False
    except Exception as e:
        _logger.warning("DELETE %s failed: %s", path, e)
        return False


# 注入主题与动效
apply_theme()
page_header("🔍", "Entity Intelligence", "Entity profiles, relationships, and monitoring")

# ── Sidebar: Controls ────────────────────────────────────────────────

with st.sidebar:
    st.markdown("### 🔎 Explore")
    entity_type = st.selectbox(
        "Type",
        ["ALL", "PERSON", "ORG", "PRODUCT", "LOCATION", "GPE", "EVENT", "TECHNOLOGY"],
    )
    limit = st.slider("Nodes", 10, 100, 50)
    show_events = st.checkbox("Show Events", value=True)
    min_score = st.slider("Min Criticality", 0, 100, 0, 10)

    st.markdown("---")
    st.markdown("### 👁️ Watchlist")

    watchlist_data = _get("/api/intelligence/watchlist")
    watched_entities = watchlist_data.get("entries", []) if watchlist_data else []
    # 修复: 容错缺失 entity_name 的条目
    watched_names = {
        e["entity_name"]: e
        for e in watched_entities
        if isinstance(e, dict) and e.get("entity_name")
    }

    if watched_entities:
        st.caption(f"{len(watched_entities)} watched entities")
        for we in watched_entities[:5]:
            st.markdown(f"- {we['entity_name']} ({we.get('entity_type', '?')})")
        if len(watched_entities) > 5:
            st.caption(f"... and {len(watched_entities)-5} more")
    else:
        st.caption("No watched entities yet.")

# ── Main content ─────────────────────────────────────────────────────

tab_graph, tab_watchlist = st.tabs(["Entity Graph", "Watchlist Manager"])

with tab_graph:
    with st.spinner("Loading entity graph..."):
        gd = _get("/api/graph", {"entity_type": entity_type, "limit": limit})
        ed = _get("/api/events", {"limit": 50}) if show_events else None

    entities = gd.get("entities", []) if gd else []
    relations = gd.get("relations", []) if gd else []
    evts = ed.get("events", []) if isinstance(ed, dict) else (ed if isinstance(ed, list) else [])

    # Filter by score
    # 修复: 原逻辑因运算符优先级解析为 `e.get("criticality_score", 0) or (0 >= min_score)`，
    # 导致 score=0/None 的实体被错误保留，高分的反而被过滤。改为显式括号。
    if min_score > 0 and entities:
        entities = [
            e for e in entities
            if (e.get("criticality_score") or 0) >= min_score
        ]

    c1, c2 = st.columns([3, 2])
    with c1:
        st.subheader("Statistics")
        if entities:
            a, b, c, d = st.columns(4)
            with a:
                st.metric("Entities", len(entities))
            with b:
                st.metric("Relations", len(relations))
            with c:
                types_set = set(e["type"] for e in entities if "type" in e)
                st.metric("Types", len(types_set))
            with d:
                st.metric("Events", len(evts))

            # Entity type distribution
            st.subheader("Entity Distribution")
            type_counts = {}
            for e in entities:
                et = e.get("type", "UNKNOWN")
                type_counts[et] = type_counts.get(et, 0) + 1
            st.bar_chart(type_counts, horizontal=True)
        else:
            st.info("No data available")

        # Entity list with profile expansion
        st.subheader("Entities")
        if entities:
            # 修复: 预构建 relations 索引，避免 O(N*M) 重复遍历
            _rel_idx = {}
            for r in relations:
                if not isinstance(r, dict):
                    continue
                for key in (r.get("subject"), r.get("object")):
                    if key:
                        _rel_idx.setdefault(key, []).append(r)

            for i, e in enumerate(entities):
                # 修复: 用 index 加进 key 防止 eid 重复导致 DuplicateWidgetIDError
                eid = e.get("entity_id") or e.get("name") or f"idx_{i}"
                ename = e.get("name") or "Unnamed"
                etype = e.get("type") or "?"
                score = e.get("criticality_score")
                tier = e.get("tier")

                prefix = "⭐" if ename in watched_names else "🔵"
                label = f"{prefix} **{ename}** ({etype})"
                if score is not None:
                    label += f" — Score: {score:.0f}"
                if tier:
                    label += f" — Tier {tier}"

                expand = st.expander(label, expanded=False)
                with expand:
                    # Entity profile
                    c_a, c_b = st.columns([3, 1])
                    with c_a:
                        st.markdown(f"**Entity ID:** `{eid}`")
                        st.markdown(f"**Type:** {etype}")
                        if score is not None:
                            st.markdown(f"**Criticality Score:** {score:.1f}/100")
                        if tier:
                            st.markdown(f"**Tier:** {tier}")

                    with c_b:
                        # 修复: key 加 index 防止重复
                        btn_key_rmv = f"rmv_{i}_{eid}"
                        btn_key_add = f"add_{i}_{eid}"
                        if ename in watched_names:
                            if st.button("Remove from Watchlist", key=btn_key_rmv):
                                # 修复: 用 params 让 requests 自动 URL 编码
                                if _delete(
                                    "/api/intelligence/watchlist",
                                    params={"entity_id": eid},
                                ):
                                    st.success("Removed")
                                    st.rerun()
                        else:
                            if st.button("Watch", key=btn_key_add):
                                result = _post(
                                    "/api/intelligence/watchlist",
                                    params={
                                        "entity_id": eid,
                                        "entity_name": ename,
                                        "entity_type": etype,
                                    },
                                )
                                # 修复: 检查 result 真值 + ok 字段，避免 200+error 被误判
                                if result and (result.get("ok", True) is not False):
                                    st.success("Added to watchlist!")
                                    st.rerun()
                                elif result:
                                    st.error(result.get("error", "Failed to add"))

                    # Show related entities (from relations) — 用索引查找
                    related = _rel_idx.get(ename, [])
                    if related:
                        st.markdown("**Relationships:**")
                        for r in related[:10]:
                            sub = r.get("subject", "")
                            obj = r.get("object", "")
                            pred = r.get("predicate", "related_to")
                            st.markdown(f"- {sub} → **{pred}** → {obj}")
        else:
            st.info("No entities to display")

    with c2:
        st.subheader("Recently Watched Entities")
        if watched_entities:
            for we in watched_entities[:15]:
                st.markdown(
                    f"- {we['entity_name']} "
                    f"({we.get('entity_type', '?')})",
                )
        else:
            st.caption("No entities in your watchlist yet.")

        st.subheader("Recent Events")
        if evts:
            for ev in evts[:10]:
                sev = ev.get("severity", "info")
                icon = {"critical": "🚨", "warning": "⚠️", "info": "ℹ️"}.get(sev, "📌")
                st.markdown(
                    f"{icon} {ev.get('summary', '')[:100]}"
                )

with tab_watchlist:
    st.subheader("Your Watchlist")

    wl = _get("/api/intelligence/watchlist")
    entries = wl.get("entries", []) if wl else []

    if not entries:
        st.info(
            "Your watchlist is empty. Go to the Entity Graph tab and click "
            "**Watch** on any entity to start monitoring."
        )
    else:
        for i, we in enumerate(entries):
            if not isinstance(we, dict):
                continue
            with st.container(border=True):
                cols = st.columns([3, 1, 1, 1])
                cols[0].markdown(
                    f"**{we.get('entity_name', '?')}** "
                    f"({we.get('entity_type', '?')})"
                )
                cols[1].markdown(
                    f"🔔 {'On' if we.get('alert_on_appearance') else 'Off'}"
                )
                if we.get("notes"):
                    cols[2].markdown(str(we["notes"])[:30])
                # 修复: 容错缺失 entity_id，用 index+id 作为按钮 key
                we_id = we.get("entity_id") or f"idx_{i}"
                if cols[3].button("Remove", key=f"del_{i}_{we_id}"):
                    if _delete(
                        "/api/intelligence/watchlist",
                        params={"entity_id": we_id},
                    ):
                        st.success("Removed")
                        st.rerun()
