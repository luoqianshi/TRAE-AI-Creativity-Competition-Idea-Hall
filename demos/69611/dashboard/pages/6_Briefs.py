"""Page 6: Intelligence Briefs — generate, browse, and view briefs.

Supports Executive Summary, Sector Brief, and Flash Report types.
Reference: WorldMonitor AI-powered news brief synthesis.
"""

import os
import logging
import urllib.parse
import streamlit as st
import requests
from datetime import datetime

try:
    from _theme import apply_theme, page_header
except ImportError:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from _theme import apply_theme, page_header

st.set_page_config(
    page_title="Briefs - OmniLog",
    page_icon="📋",
    layout="wide",
)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("OMNILOG_API_KEY", "")
_logger = logging.getLogger("dashboard.briefs")


def _h():
    d = {}
    if API_KEY:
        d["X-API-Key"] = API_KEY
        d["Authorization"] = "Bearer " + API_KEY
    return d


def _get(path, params=None):
    try:
        r = requests.get(API_BASE_URL + path, headers=_h(), params=params, timeout=15)
        if r.status_code == 200:
            return r.json()
        _logger.warning("GET %s -> %s", path, r.status_code)
        return None
    except Exception as e:
        _logger.warning("GET %s failed: %s", path, e)
        return None


def _post(path, params=None):
    try:
        r = requests.post(API_BASE_URL + path, headers=_h(), params=params, timeout=60)
        if r.status_code == 200:
            return r.json()
        _logger.warning("POST %s -> %s", path, r.status_code)
        return None
    except Exception as e:
        _logger.warning("POST %s failed: %s", path, e)
        return None


# 注入主题与动效
apply_theme()
page_header("📋", "Intelligence Briefs", "Multi-level structured intelligence products")

tab_generate, tab_browse = st.tabs(["Generate", "Browse Briefs"])

# ── Generate Tab ─────────────────────────────────────────────────────

with tab_generate:
    st.markdown("### Generate New Brief")

    col1, col2 = st.columns([1, 1])
    with col1:
        # 修复: format_func 用 .get(x, x) 防止未来扩展时 KeyError
        _BRIEF_LABELS = {
            "executive": "🗄 Executive Summary",
            "sector": "📊 Sector Brief",
            "flash": "🚨 Flash Report",
        }
        brief_type = st.selectbox(
            "Brief Type",
            options=["executive", "sector", "flash"],
            format_func=lambda x: _BRIEF_LABELS.get(x, x),
        )
    with col2:
        # 修复: 不再用 `if ... else st.empty()` 反模式，始终渲染但禁用
        sector_value = st.text_input(
            "Sector (required for sector briefs)",
            placeholder="e.g., technology, energy, finance",
            disabled=(brief_type != "sector"),
            key="brief_sector_input",
        )

    report_id = st.text_input(
        "Base Report ID (optional)",
        placeholder="Generate from an existing report...",
    )
    generate_from_report = st.checkbox("Generate from report", value=bool(report_id))

    if st.button("Generate Brief", type="primary", use_container_width=True):
        # 修复: sector 必填校验
        if brief_type == "sector" and not sector_value:
            st.error("Sector is required for sector briefs.")
        else:
            with st.spinner("Generating intelligence brief via LLM..."):
                params = {"brief_type": brief_type}
                # 修复: 仅在 sector 有值时加入参数(避免 DeltaGenerator 被传给后端)
                if sector_value and brief_type == "sector":
                    params["sector"] = sector_value
                if report_id:
                    params["report_id"] = report_id
                    params["generate_from_report"] = str(generate_from_report).lower()

                result = _post("/api/intelligence/briefs/generate", params=params)

                if result and result.get("ok", True) is not False:
                    st.success(f"✅ Generated: {result.get('title') or 'Brief'}")
                    st.session_state["last_brief"] = result
                    # 修复: 不立即 rerun，让 success 提示可见
                elif result:
                    st.error(result.get("error", "Failed to generate brief."))
                else:
                    st.error("Failed to generate brief. Check API / LLM availability.")

    # Show last generated brief
    if "last_brief" in st.session_state:
        brief = st.session_state["last_brief"]
        st.markdown("---")
        st.markdown(f"### {brief.get('title') or 'Brief'}")

        meta_cols = st.columns(4)
        meta_cols[0].metric("Type", brief.get("brief_type") or "")
        # 修复: confidence/entities/events 为 None 时崩溃
        conf_val = brief.get("confidence") or 0
        meta_cols[1].metric("Confidence", f"{conf_val:.2f}")
        meta_cols[2].metric("Entities", len(brief.get("entities") or []))
        meta_cols[3].metric("Events", len(brief.get("events") or []))

        with st.expander("View Full Brief", expanded=True):
            st.markdown(brief.get("markdown") or "No content")

        key_findings = brief.get("key_findings") or []
        if key_findings:
            with st.expander("Key Findings"):
                for f in key_findings:
                    st.markdown(f"- {f}")

# ── Browse Tab ───────────────────────────────────────────────────────

with tab_browse:
    st.markdown("### Recent Briefs")

    briefs_data = _get("/api/intelligence/briefs", {"limit": 50})
    briefs = briefs_data.get("briefs", []) if briefs_data else []

    if not briefs:
        st.info("No briefs generated yet. Use the Generate tab to create one.")
    else:
        for i, b in enumerate(briefs):
            if not isinstance(b, dict):
                continue
            with st.container(border=True):
                cols = st.columns([3, 1, 1])
                cols[0].markdown(f"**{b.get('title') or 'Untitled'}**")
                b_date = b.get("date") or ""
                cols[1].markdown(str(b_date)[:10] if b_date else "")
                # 修复: 容错 b 缺 id，用 index 作 key
                b_id = b.get("id") or f"idx_{i}"
                if cols[2].button("View", key=f"view_{i}_{b_id}"):
                    st.session_state["view_brief_id"] = b_id
                    st.rerun()

    # View selected brief detail
    if "view_brief_id" in st.session_state:
        bid = st.session_state["view_brief_id"]
        # 修复: bid URL 编码
        detail = _get(
            f"/api/intelligence/briefs/{urllib.parse.quote(str(bid), safe='')}"
        )
        if detail:
            st.markdown("---")
            st.markdown(f"### {detail.get('title') or 'Brief'}")
            if detail.get("markdown"):
                st.markdown(detail["markdown"])
            else:
                st.markdown(detail.get("summary") or "")
            st.caption(f"Classification: {detail.get('classification') or 'N/A'}")
