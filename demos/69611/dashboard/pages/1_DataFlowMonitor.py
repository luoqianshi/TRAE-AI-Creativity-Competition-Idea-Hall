"""Page 1: Data Flow Monitor - v2.0"""
import os
import logging
import streamlit as st
import requests
import pandas as pd

try:
    from _theme import apply_theme, health_grid
except ImportError:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from _theme import apply_theme, health_grid

st.set_page_config(page_title="Data Flow - OmniLog", page_icon="📷", layout="wide")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("OMNILOG_API_KEY", "")
_logger = logging.getLogger("dashboard.dataflow")


def _h():
    d = {}
    if API_KEY:
        d["X-API-Key"] = API_KEY
        d["Authorization"] = "Bearer " + API_KEY
    return d


def _get(path, params=None, timeout=8):
    try:
        r = requests.get(API_BASE_URL + path, headers=_h(), params=params, timeout=timeout)
        if r.status_code == 200:
            return r.json()
        _logger.warning("GET %s -> %s", path, r.status_code)
        return None
    except Exception as e:
        _logger.warning("GET %s failed: %s", path, e)
        return None


# 注入主题
apply_theme()

if "auto_refresh" not in st.session_state:
    st.session_state.auto_refresh = True
if "refresh_interval" not in st.session_state:
    st.session_state.refresh_interval = 15  # 默认 15 秒，降低后端压力

st.title("Data Flow Monitor")
st.caption("Real-time collection status and system health")

col_a, col_b = st.columns([1, 5])
with col_a:
    st.session_state.auto_refresh = st.checkbox("Auto Refresh", value=st.session_state.auto_refresh)
with col_b:
    if st.session_state.auto_refresh:
        # 最低 10 秒，避免高频请求压垮后端
        st.session_state.refresh_interval = st.slider(
            "Interval (sec)", 10, 120, st.session_state.refresh_interval
        )

st.subheader("System Metrics")
with st.spinner("Loading metrics..."):
    metrics = _get("/api/metrics")

if metrics:
    cols = st.columns(5)
    labels = ["Redis Queue", "ES Docs", "Today", "Collectors", "Success Rate"]
    keys = ["redis_stream_length", "es_doc_count", "today_collected", "active_collectors", "success_rate"]
    for i, (lab, key) in enumerate(zip(labels, keys)):
        with cols[i]:
            val = metrics.get(key, 0)
            # 修复: 0 是有效值，不应显示为 "-"
            display = str(val) if val is not None else "-"
            st.metric(lab, display)
else:
    st.info("Metrics not available")

st.markdown("---")
st.subheader("Collector Status")
colrs = _get("/api/collectors")
if colrs and isinstance(colrs, list):
    st.dataframe(pd.DataFrame(colrs), use_container_width=True, hide_index=True)
else:
    st.info("No collector data available")

st.markdown("---")
st.subheader("24-Hour Trend")
tl = _get("/api/search/timeline", {"q": ""})
if tl and tl.get("timeline"):
    df_t = pd.DataFrame(tl["timeline"])
    if not df_t.empty and "date" in df_t.columns:
        df_t["date"] = pd.to_datetime(df_t["date"])
        df_t = df_t.set_index("date")
        st.line_chart(df_t["count"])
else:
    st.info("No trend data available")

st.markdown("---")
st.subheader("System Health")
health = _get("/api/health")
if health and isinstance(health, dict):
    components = health.get("components", {}) or {}
    if components:
        # 使用主题中的 health_grid (含 status-dot 脉冲动画 + XSS 转义 + 精确状态判定)
        st.markdown(health_grid(components), unsafe_allow_html=True)
    else:
        st.info("No component data available")
else:
    st.warning("Unable to get health info")

if st.session_state.auto_refresh:
    # 修复: 使用 st.fragment 局部刷新避免整页闪烁; time.sleep 仍然必要但放在最末尾
    # 间隔时间到后自动 rerun
    import time
    time.sleep(st.session_state.refresh_interval)
    st.rerun()
