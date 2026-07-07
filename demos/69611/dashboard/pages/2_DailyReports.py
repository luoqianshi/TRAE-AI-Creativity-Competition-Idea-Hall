"""Page 2: Daily Reports - v2.0"""
import os
import calendar
import html
import logging
import streamlit as st
import requests
from datetime import datetime, timedelta

try:
    from _theme import apply_theme, page_header
except ImportError:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from _theme import apply_theme, page_header

st.set_page_config(page_title="Reports - OmniLog", page_icon="📪", layout="wide")

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY = os.getenv("OMNILOG_API_KEY", "")
_logger = logging.getLogger("dashboard.reports")


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


def render_calendar(year, month, cal_data, selected_date=None):
    """渲染日历。selected_date: 当前选中的日期字符串 (YYYY-MM-DD)，用于高亮显示。"""
    cal = calendar.monthcalendar(year, month)
    st.markdown("### " + str(year) + "-" + str(month).zfill(2))
    hc = st.columns(7)
    for i, d in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]):
        hc[i].markdown(
            "<div style='text-align:center;font-weight:700;color:var(--primary);font-size:0.85rem;'>" + d + "</div>",
            unsafe_allow_html=True,
        )
    sel = None
    for week in cal:
        rc = st.columns(7)
        for i, day in enumerate(week):
            if day == 0:
                rc[i].empty()
                continue
            date_str = str(year) + "-" + str(month).zfill(2) + "-" + str(day).zfill(2)
            has_report = bool(cal_data.get(str(day), False))
            is_selected = (date_str == selected_date)
            # 修复: 移除重复的 markdown div，只用 button + CSS class
            cls = "omnilog-cal-cell"
            if is_selected:
                cls += " active"
            elif not has_report:
                cls += " muted"
            label = str(day) if has_report else str(day)
            if rc[i].button(
                label,
                key="cal_" + date_str,
                help=("Has report" if has_report else "No report"),
                use_container_width=True,
            ):
                sel = date_str
    return sel


# 注入主题
apply_theme()
page_header("📪", "Daily Reports", "Browse daily deep analysis reports")

with st.sidebar:
    now = datetime.now()
    # 修复: 动态年份范围，避免 2027 后越界
    _year_options = list(range(2024, now.year + 2))
    _year_default_idx = min(max(now.year - 2024, 0), len(_year_options) - 1)
    year = st.selectbox("Year", _year_options, index=_year_default_idx)
    month = st.selectbox("Month", range(1, 13), index=now.month - 1)
    month_str = str(year) + "-" + str(month).zfill(2)
    cal_raw = _get("/api/reports/calendar", {"month": month_str})

    # 修复: fallback 逻辑错误 — 使用 monthrange 获取真实天数，仅当查看当前月份时才以 now.day 截断
    if cal_raw and cal_raw.get("calendar"):
        cal_data = cal_raw["calendar"]
    else:
        days_in_month = calendar.monthrange(year, month)[1]
        if year == now.year and month == now.month:
            cal_data = {str(d): (d <= now.day) for d in range(1, days_in_month + 1)}
        else:
            # 历史月份: 假定所有日子都可能有报告; 未来月份: 无报告
            is_future = (year > now.year) or (year == now.year and month > now.month)
            cal_data = {str(d): (not is_future) for d in range(1, days_in_month + 1)}

    # 修复: 选中日期持久化到 session_state，避免 rerun 时丢失
    if "cal_selected_date" not in st.session_state:
        st.session_state.cal_selected_date = None
    sel_date = render_calendar(year, month, cal_data, st.session_state.cal_selected_date)
    if sel_date:
        st.session_state.cal_selected_date = sel_date

    di = st.date_input("Or pick date", now - timedelta(days=1))
    # 修复: di 始终是 date 对象，移除死代码 fallback
    final_date = sel_date or st.session_state.cal_selected_date or di.strftime("%Y-%m-%d")

with st.spinner("Loading " + final_date + "..."):
    report = _get("/api/reports", {"date": final_date})

if report:
    st.success(final_date + " report loaded")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        stats = report.get("stats") or {}
        val = stats.get("total_docs")
        st.metric("Docs", str(val) if val is not None else "-")
    with c2:
        st.metric("Events", len(report.get("events") or []))
    with c3:
        st.metric("Entities", len(report.get("entities") or []))
    with c4:
        st.metric("Impact Paths", len(report.get("impact_paths") or []))

    t1, t2, t3, t4 = st.tabs(["Full", "Events", "Entities", "Impact"])
    with t1:
        md = report.get("full_markdown") or ""
        if md:
            st.markdown(md)
            st.download_button("Download", md, file_name="report_" + final_date + ".md")
        else:
            st.info("No content available")
    with t2:
        for e in report.get("events") or []:
            st.markdown("- " + str(e.get("summary", ""))[:80])
    with t3:
        for e in report.get("entities") or []:
            icon = {"rising": "Up", "falling": "Down", "stable": "-"}.get(
                e.get("trend", "stable"), "-"
            )
            st.markdown("**" + str(e.get("name", "N/A")) + "** " + icon + " " + str(e.get("type", "")))
    with t4:
        for p in report.get("impact_paths") or []:
            # 修复: confidence 为 None 时崩溃
            conf = p.get("confidence")
            if conf is None:
                conf = 0.0
            try:
                conf = float(conf)
            except (TypeError, ValueError):
                conf = 0.0
            c = "#06d6a0" if conf >= 0.7 else "#ffd166" if conf >= 0.4 else "#ef476f"
            # 修复: HTML escape 防 XSS
            desc = html.escape(str(p.get("description", ""))[:80])
            st.markdown(
                '<div style="background:#f8f9fa;border-left:4px solid ' + c +
                ';padding:1rem;margin:0.5rem 0;border-radius:0 8px 8px 0;">'
                '<strong>' + desc + '</strong> <span style="color:' + c +
                ';">(' + str(int(conf * 100)) + '%)</span></div>',
                unsafe_allow_html=True,
            )

    # 修复: diff 放进 expander 懒加载
    with st.expander("View Diff vs Previous Day", expanded=False):
        diff = _get("/api/reports/" + final_date + "/diff")
        if diff and diff.get("has_diff"):
            st.code(diff.get("diff", ""), language="diff")
        else:
            st.caption("No diff available")
else:
    st.warning("No report found for " + final_date)

st.caption("Data from PG + MongoDB")
