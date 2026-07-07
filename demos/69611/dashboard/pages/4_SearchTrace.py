"""Page 4: Search & Trace — full-text search with traceability graph.

Enhanced with provenance chain visualization using pyvis/networkx.
Reference: WorldMonitor data provenance and traceability patterns.
"""

import os
import json
import logging
import tempfile
import urllib.parse
import streamlit as st
import requests
import pandas as pd
from datetime import datetime, timedelta

try:
    from _theme import apply_theme, page_header
except ImportError:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from _theme import apply_theme, page_header

st.set_page_config(
    page_title="Search - OmniLog",
    page_icon="🔍",
    layout="wide",
)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("OMNILOG_API_KEY", "")
_logger = logging.getLogger("dashboard.search")
_HIST_MAX = 20  # 历史记录上限


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


if "page" not in st.session_state:
    st.session_state.page = 1
if "sq" not in st.session_state:
    st.session_state.sq = ""
if "sel" not in st.session_state:
    st.session_state.sel = None
if "hist" not in st.session_state:
    st.session_state.hist = []
if "trace_doc_id" not in st.session_state:
    st.session_state.trace_doc_id = None

# 注入主题与动效
apply_theme()
page_header("🔍", "Search & Trace", "Full-text search with provenance chain visualization")

# ── Search ────────────────────────────────────────────────────────────

cs1, cs2 = st.columns([4, 1])
with cs1:
    q = st.text_input(
        "Search",
        "",
        placeholder="AI / Apple / OpenAI...",
        label_visibility="collapsed",
        value=st.session_state.sq,
    )
with cs2:
    searched = st.button("Search", use_container_width=True)

if searched:
    if not q:
        st.warning("Please enter a search query")
    else:
        st.session_state.sq = q
        st.session_state.page = 1
        # 修复: history 上限 + 去重 + 最新的放最前
        if q in st.session_state.hist:
            st.session_state.hist.remove(q)
        st.session_state.hist.insert(0, q)
        st.session_state.hist = st.session_state.hist[:_HIST_MAX]

with st.expander("Filters"):
    lf = st.selectbox("Language", ["All", "en", "zh-cn"])
    sf = st.selectbox("Source", ["All", "rss:hacker_news", "rss:techcrunch", "rss:arxiv"])
    tf = st.multiselect(
        "Tags",
        ["Tech", "AI", "Product", "Research", "Cloud", "Aerospace", "Open Source"],
        default=[],
    )
    dr = st.date_input(
        "Date range",
        (datetime.now() - timedelta(days=7), datetime.now()),
        max_value=datetime.now(),
    )

# ── Tabs: Search Results / Traceability ──────────────────────────────

tab_search, tab_trace, tab_history = st.tabs([
    "Search Results", "Document Traceability", "Search History"
])

with tab_search:
    if st.session_state.sq:
        filters = {}
        if lf != "All":
            filters["language"] = lf
        if sf != "All":
            filters["source"] = sf
        if tf:
            filters["tags"] = tf
        if len(dr) == 2:
            filters["start_date"] = dr[0].isoformat()
            filters["end_date"] = dr[1].isoformat()

        with st.spinner("Searching..."):
            params = {
                "q": st.session_state.sq,
                "page": st.session_state.page,
                "size": 20,
            }
            # 修复: 原代码漏掉 tags/start_date/end_date，过滤器被静默丢弃
            if filters.get("language"):
                params["language"] = filters["language"]
            if filters.get("source"):
                params["source"] = filters["source"]
            if filters.get("tags"):
                # 多标签按逗号拼接，后端按需解析
                params["tags"] = ",".join(filters["tags"])
            if filters.get("start_date"):
                params["start_date"] = filters["start_date"]
            if filters.get("end_date"):
                params["end_date"] = filters["end_date"]

            sd = _get("/api/search", params)

        if sd and sd.get("results"):
            total = sd.get("total", 0)
            st.success(f"Found {total} results")
            for doc in sd["results"]:
                doc_id = doc.get("id") or ""
                with st.container(border=True):
                    # 修复: 容忍 title/source 为 None
                    title_val = doc.get("title") or doc.get("source") or "Document"
                    st.markdown(f"**{title_val}**")
                    cols = st.columns(5)
                    cols[0].markdown(f"📰 {doc.get('source') or '?'}")
                    cols[1].markdown(f"🌐 {doc.get('language') or '?'}")
                    # 修复: tags 为 None 时崩溃
                    doc_tags = doc.get("tags") or []
                    if isinstance(doc_tags, list) and doc_tags:
                        cols[2].markdown(f"🏷 {', '.join(str(t) for t in doc_tags[:2])}")
                    else:
                        cols[2].markdown("🏷 —")

                    # Traceability button
                    if cols[3].button("🔗 Trace", key=f"trace_{doc_id}"):
                        st.session_state.trace_doc_id = doc_id
                        st.rerun()

                    # 修复: 用 st.link_button 避免恶意 URL 注入 markdown
                    doc_url = doc.get("url")
                    if doc_url and isinstance(doc_url, str) and doc_url.startswith(("http://", "https://")):
                        cols[4].link_button("Link", doc_url)

                    # 修复: content/clean_text 为 None 时崩溃
                    snippet = (doc.get("content") or doc.get("clean_text") or "")[:300]
                    if snippet:
                        st.markdown(f"{snippet}...")

            # 修复: 分页 off-by-one (total=20 时原代码会算出 2 页)
            import math
            pg = max(1, math.ceil(total / 20))
            pg_cols = st.columns([1, 2, 1])
            with pg_cols[0]:
                if st.session_state.page > 1 and st.button("← Previous"):
                    st.session_state.page -= 1
                    st.rerun()
            with pg_cols[2]:
                if st.session_state.page < pg and st.button("Next →"):
                    st.session_state.page += 1
                    st.rerun()
        else:
            st.info("No results found")
    else:
        st.info("Enter a search query to begin")

with tab_trace:
    if st.session_state.trace_doc_id:
        doc_id = st.session_state.trace_doc_id
        st.markdown(f"### Traceability: `{str(doc_id)[:24]}...`")

        with st.spinner("Loading provenance chain..."):
            # 修复: doc_id URL 编码，避免 /、空格、特殊字符破坏路径
            trace_data = _get(
                f"/api/intelligence/documents/{urllib.parse.quote(str(doc_id), safe='')}/traceability"
            )

        if trace_data:
            st.markdown(f"**Source:** {trace_data.get('source') or '?'}")
            if trace_data.get("url"):
                st.markdown(f"**URL:** [{trace_data['url']}]({trace_data['url']})")
            st.markdown(f"**Classification:** {trace_data.get('classification') or '?'}")

            # Entity association
            entities = trace_data.get("entities") or []
            if entities:
                st.markdown(f"**Associated Entities ({len(entities)}):**")
                for ent in entities[:10]:
                    ent = ent if isinstance(ent, dict) else {}
                    # 修复: confidence 为 None 时崩溃
                    conf_val = ent.get("confidence") or 0
                    st.markdown(
                        f"- {ent.get('name') or '?'} "
                        f"({ent.get('type') or '?'}) "
                        f"[conf: {conf_val:.2f}]"
                    )

            # Visual provenance graph
            if entities:
                st.markdown("#### Provenance Graph")
                try:
                    from pyvis.network import Network
                    import networkx as nx

                    g = nx.DiGraph()
                    g.add_node("document", label="Document", title=str(doc_id)[:16],
                               color="#4361ee", shape="box")
                    g.add_node("source", label=trace_data.get("source") or "Source",
                               color="#06d6a0", shape="ellipse")

                    for ent in entities[:8]:
                        ent = ent if isinstance(ent, dict) else {}
                        ename = ent.get("name") or "entity"
                        conf_val = ent.get("confidence") or 0
                        g.add_node(ename, label=ename,
                                   color={
                                       "PERSON": "#ef476f", "ORG": "#4361ee",
                                       "LOCATION": "#06d6a0", "GPE": "#ffd166",
                                   }.get(ent.get("type", ""), "#888888"),
                                   shape="diamond",
                                   title=f"{ent.get('type', '')} conf={conf_val:.2f}")
                        g.add_edge(ename, "document")

                    g.add_edge("source", "document")

                    net = Network(height="400px", width="100%", directed=True,
                                  notebook=False, cdn_resources="remote")
                    net.from_nx(g)
                    net.set_options("""
                    {
                      "physics": {"barnesHut": {"gravitationalConstant": -2000}},
                      "edges": {"arrows": {"to": {"enabled": true}}}
                    }
                    """)

                    # 修复: 不再用共享文件路径(竞态+污染)，使用 tempfile
                    with tempfile.NamedTemporaryFile(
                        mode="w", suffix=".html", delete=False, encoding="utf-8"
                    ) as tf:
                        html_path = tf.name
                    try:
                        net.save_graph(html_path)
                        with open(html_path, "r", encoding="utf-8") as f:
                            html_content = f.read()
                        st.components.v1.html(html_content, height=420, scrolling=False)
                    finally:
                        try:
                            os.unlink(html_path)
                        except OSError:
                            pass

                except ImportError:
                    st.caption("Graph visualization requires `pyvis` and `networkx` packages.")
                except Exception as e:
                    _logger.warning("Trace graph rendering failed: %s", e)
                    st.caption("Graph visualization unavailable. See logs for details.")

            # Raw trace
            with st.expander("Raw Trace Data"):
                st.json(trace_data)
        else:
            st.warning("Trace data not available for this document")

        if st.button("← Clear Trace Selection"):
            st.session_state.trace_doc_id = None
            st.rerun()
    else:
        st.info(
            "Search for a document, then click **Trace** to view its "
            "provenance chain."
        )

with tab_history:
    if st.session_state.hist:
        for i, h in enumerate(st.session_state.hist):
            if st.button(f"🔍 {h}", key=f"hist_{i}_{h[:20]}"):
                st.session_state.sq = h
                st.session_state.page = 1
                st.rerun()
    else:
        st.caption("No search history yet")
