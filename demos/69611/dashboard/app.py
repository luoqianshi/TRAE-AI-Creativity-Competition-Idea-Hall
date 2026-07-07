"""OmniLog Intelligence Dashboard - Streamlit v2.0"""
import os
import streamlit as st
import requests
from datetime import datetime
from typing import Optional, Dict, Any

try:
    from _theme import apply_theme, nav_card
except ImportError:
    # 兼容直接运行 pages 下的文件
    import sys
    sys.path.insert(0, os.path.dirname(__file__))
    from _theme import apply_theme, nav_card

st.set_page_config(
    page_title="OmniLog Intelligence",
    page_icon="📋",
    layout="wide",
    initial_sidebar_state="expanded"
)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("OMNILOG_API_KEY", "")
_REQUEST_TIMEOUT = 10

_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.isfile(_env_path):
    try:
        with open(_env_path, "r", encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if not _line or _line.startswith("#") or "=" not in _line:
                    continue
                _k, _v = _line.split("=", 1)
                _k, _v = _k.strip(), _v.strip().strip('"').strip("'")
                if _k == "OMNILOG_API_KEY" and not API_KEY:
                    API_KEY = _v
                if _k == "API_BASE_URL" and not os.getenv("API_BASE_URL"):
                    API_BASE_URL = _v
    except Exception:
        pass

if API_KEY:
    os.environ.setdefault("OMNILOG_API_KEY", API_KEY)
if API_BASE_URL:
    os.environ.setdefault("API_BASE_URL", API_BASE_URL)

def _build_headers():
    h = {}
    if API_KEY:
        h["X-API-Key"] = API_KEY
        h["Authorization"] = "Bearer " + API_KEY
    return h

def safe_api_get(path, params=None, timeout=_REQUEST_TIMEOUT):
    try:
        resp = requests.get(API_BASE_URL + path, headers=_build_headers(), params=params, timeout=timeout)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 401:
            st.warning("Auth failed - check OMNILOG_API_KEY")
        return None
    except (requests.ConnectionError, requests.Timeout):
        return None
    except Exception:
        return None

def check_api_health():
    try:
        return requests.get(API_BASE_URL + "/health", timeout=5).status_code == 200
    except Exception:
        return False

# 注入统一主题与动效 (替代之前的 inline CSS)
apply_theme()

with st.sidebar:
    st.markdown("""
    <div style="text-align:center; padding:0.5rem 0;">
        <span style="font-size:2.2rem;">📋</span>
        <h2 style="margin:0; font-weight:800;">OmniLog</h2>
        <p style="color:#6b7280; font-size:0.8rem;">Intelligence</p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("---")
    health_ok = check_api_health()
    if health_ok:
        st.success("API Connected")
        details = safe_api_get("/api/health")
        if details:
            st.markdown("**System Components**")
            for name, status in details.get("components", {}).items():
                ok = str(status).lower() in ("connected", "running", "ok", "healthy", "up")
                st.markdown(("✅ " if ok else "❌ ") + str(name))
    else:
        st.error("API Connection Failed")
        st.warning("Ensure FastAPI is running at " + API_BASE_URL)
    if not API_KEY:
        st.warning("Auth Key not configured")
    st.markdown("---")
    st.markdown("### Navigation")
    if st.button("Home", use_container_width=True):
        st.switch_page("app.py")
    if st.button("Data Flow", use_container_width=True):
        st.switch_page("pages/1_DataFlowMonitor.py")
    if st.button("Reports", use_container_width=True):
        st.switch_page("pages/2_DailyReports.py")
    if st.button("Entity Graph", use_container_width=True):
        st.switch_page("pages/3_EntityGraph.py")
    if st.button("Search", use_container_width=True):
        st.switch_page("pages/4_SearchTrace.py")
    st.markdown("---")
    st.markdown("**" + datetime.now().strftime("%Y-%m-%d %H:%M") + "**")
    st.caption("API: " + API_BASE_URL)

st.markdown('<div class="omnilog-main-header">OmniLog Intelligence</div>', unsafe_allow_html=True)
st.markdown('<div class="omnilog-sub-header">AI-Driven OSINT Platform</div>', unsafe_allow_html=True)

col_a, col_b, col_c, col_d = st.columns(4)
with col_a:
    st.markdown(nav_card("📷", "Data Flow", "Real-time collection status and health", delay=0.0), unsafe_allow_html=True)
    if st.button("Monitor", key="btn_m", use_container_width=True):
        st.switch_page("pages/1_DataFlowMonitor.py")
with col_b:
    st.markdown(nav_card("📪", "Reports", "Daily deep analysis reports", delay=0.05), unsafe_allow_html=True)
    if st.button("Reports", key="btn_r", use_container_width=True):
        st.switch_page("pages/2_DailyReports.py")
with col_c:
    st.markdown(nav_card("🗡", "Entity Graph", "Entity relationships and events", delay=0.1), unsafe_allow_html=True)
    if st.button("Graph", key="btn_g", use_container_width=True):
        st.switch_page("pages/3_EntityGraph.py")
with col_d:
    st.markdown(nav_card("🔍", "Search", "Full-text search and trace", delay=0.15), unsafe_allow_html=True)
    if st.button("Search", key="btn_s", use_container_width=True):
        st.switch_page("pages/4_SearchTrace.py")

st.markdown("---")
st.subheader("System Overview")
with st.spinner("Loading metrics..."):
    metrics = safe_api_get("/api/metrics")
    events_raw = safe_api_get("/api/events", {"limit": 100})
    events_list = events_raw if isinstance(events_raw, list) else (events_raw.get("events", []) if isinstance(events_raw, dict) else [])

m1 = metrics or {}
c1, c2, c3, c4 = st.columns(4)
with c1:
    val = m1.get("today_collected")
    st.metric("Today", str(val) if val is not None else "-")
with c2:
    st.metric("Events", str(len(events_list)))
with c3:
    val = m1.get("es_doc_count")
    st.metric("ES Docs", str(val) if val is not None else "-")
with c4:
    val = m1.get("redis_stream_length")
    st.metric("Queue", str(val) if val is not None else "-")

if metrics is None and not health_ok:
    st.info("Backend API not reachable. Start the FastAPI server first.")

st.markdown("---")
st.markdown('<div style="text-align:center;color:#9ca3af;padding:1rem 0;">OmniLog v2.0 | Streamlit + FastAPI</div>', unsafe_allow_html=True)
