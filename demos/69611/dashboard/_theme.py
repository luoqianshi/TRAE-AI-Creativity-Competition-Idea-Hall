"""OmniLog Dashboard 共享主题与动效模块 v2.0

提供:
- 设计令牌 (design tokens): 统一颜色、字号、圆角、阴影、缓动函数
- 全局 CSS 注入: 页面过渡、卡片 hover、metric 数字动效、骨架屏、staggered list
- 无障碍: prefers-reduced-motion 降级
- 公共 API 帮助函数: apply_theme(), page_header(), nav_card(), animated_metric()
"""
from __future__ import annotations
import html
import streamlit as st

# ============================================================
# 设计令牌 (Design Tokens)
# ============================================================
TOKENS = {
    # 品牌色
    "primary":        "#4361ee",
    "primary_dark":   "#3a4fd1",
    "primary_light":  "#667eea",
    "accent":         "#7209b7",
    # 语义色
    "success":        "#06d6a0",
    "warning":        "#ffd166",
    "danger":         "#ef476f",
    "info":           "#118ab2",
    # 中性色
    "text_primary":   "#1f2937",
    "text_secondary": "#6b7280",
    "text_muted":     "#9ca3af",
    "bg_page":        "#f8f9fc",
    "bg_card":        "#ffffff",
    "bg_subtle":      "#f3f4f6",
    "border":         "#e5e7eb",
    "border_hover":   "#c7d2fe",
    # 圆角
    "radius_sm":      "8px",
    "radius_md":      "12px",
    "radius_lg":      "16px",
    "radius_pill":    "999px",
    # 阴影
    "shadow_sm":      "0 1px 2px rgba(0,0,0,0.04)",
    "shadow_md":      "0 4px 12px rgba(0,0,0,0.06)",
    "shadow_lg":      "0 12px 32px rgba(67,97,238,0.12)",
    "shadow_focus":   "0 0 0 3px rgba(67,97,238,0.18)",
    # 缓动函数 (cubic-bezier)
    "ease_out":       "cubic-bezier(0.16, 1, 0.3, 1)",
    "ease_in_out":    "cubic-bezier(0.65, 0, 0.35, 1)",
    "ease_spring":    "cubic-bezier(0.34, 1.56, 0.64, 1)",
}

# ============================================================
# 全局 CSS (动画 + 动效 + 主题)
# ============================================================
GLOBAL_CSS = """
<style>
:root {
    --primary: {{primary}};
    --primary-dark: {{primary_dark}};
    --primary-light: {{primary_light}};
    --accent: {{accent}};
    --success: {{success}};
    --warning: {{warning}};
    --danger: {{danger}};
    --info: {{info}};
    --text-primary: {{text_primary}};
    --text-secondary: {{text_secondary}};
    --text-muted: {{text_muted}};
    --bg-page: {{bg_page}};
    --bg-card: {{bg_card}};
    --bg-subtle: {{bg_subtle}};
    --border: {{border}};
    --border-hover: {{border_hover}};
    --radius-sm: {{radius_sm}};
    --radius-md: {{radius_md}};
    --radius-lg: {{radius_lg}};
    --radius-pill: {{radius_pill}};
    --shadow-sm: {{shadow_sm}};
    --shadow-md: {{shadow_md}};
    --shadow-lg: {{shadow_lg}};
    --shadow-focus: {{shadow_focus}};
    --ease-out: {{ease_out}};
    --ease-in-out: {{ease_in_out}};
    --ease-spring: {{ease_spring}};
}

/* ------------------------------------------------------------
   全局背景与字体平滑
   ------------------------------------------------------------ */
.stApp, .main, section[data-testid="stMain"] {
    background: var(--bg-page);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ------------------------------------------------------------
   页面进入动画 (fade + slight upward motion)
   ------------------------------------------------------------ */
.stApp, .main > div {
    animation: page-fade-in 0.45s var(--ease-out) both;
}
@keyframes page-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ------------------------------------------------------------
   主标题 (渐变文字 + 入场动画)
   ------------------------------------------------------------ */
.omnilog-main-header {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, {{primary}} 0%, {{accent}} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
    animation: header-slide-in 0.6s var(--ease-out) both;
}
.omnilog-sub-header {
    color: var(--text-secondary);
    font-size: 1.05rem;
    margin-bottom: 1.5rem;
    animation: header-slide-in 0.6s var(--ease-out) 0.08s both;
}
.omnilog-page-header {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    margin: 0 0 0.25rem 0;
    animation: header-slide-in 0.5s var(--ease-out) both;
}
.omnilog-page-subheader {
    color: var(--text-secondary);
    font-size: 0.95rem;
    margin: 0 0 1.25rem 0;
    animation: header-slide-in 0.5s var(--ease-out) 0.05s both;
}
@keyframes header-slide-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ------------------------------------------------------------
   导航卡片 (hover 抬升 + 渐变描边光晕)
   ------------------------------------------------------------ */
.omnilog-nav-card {
    position: relative;
    background: var(--bg-card);
    border-radius: var(--radius-md);
    padding: 1.5rem 1.25rem;
    box-shadow: var(--shadow-md);
    text-align: center;
    border: 1px solid var(--border);
    height: 100%;
    transition:
        transform 0.28s var(--ease-out),
        box-shadow 0.28s var(--ease-out),
        border-color 0.28s var(--ease-out);
    overflow: hidden;
    animation: card-pop-in 0.5s var(--ease-out) both;
}
.omnilog-nav-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(67,97,238,0.08), rgba(114,9,183,0.06));
    opacity: 0;
    transition: opacity 0.3s var(--ease-out);
    pointer-events: none;
}
.omnilog-nav-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-hover);
}
.omnilog-nav-card:hover::before { opacity: 1; }
.omnilog-nav-card .emoji {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    display: block;
    transition: transform 0.4s var(--ease-spring);
}
.omnilog-nav-card:hover .emoji { transform: scale(1.15) rotate(-4deg); }
.omnilog-nav-card h3 {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0.25rem 0;
    color: var(--text-primary);
}
.omnilog-nav-card p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
}
@keyframes card-pop-in {
    from { opacity: 0; transform: translateY(12px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ------------------------------------------------------------
   Metric 卡片 (number count-up 占位 + 微妙 hover)
   ------------------------------------------------------------ */
div[data-testid="metric-container"] {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    padding: 0.85rem 1rem !important;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
    transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
    animation: metric-fade-in 0.5s var(--ease-out) both;
}
div[data-testid="metric-container"]:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}
div[data-testid="metric-container"] label {
    color: var(--text-secondary) !important;
    font-size: 0.78rem !important;
    font-weight: 500 !important;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
div[data-testid="metric-container"] [data-testid="stMetricValue"] {
    color: var(--text-primary) !important;
    font-weight: 700 !important;
}
@keyframes metric-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ------------------------------------------------------------
   健康状态网格 (页面 1)
   ------------------------------------------------------------ */
.omnilog-health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
    margin: 1rem 0;
}
.omnilog-health-item {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    padding: 0.9rem 0.75rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
    transition: transform 0.22s var(--ease-out), box-shadow 0.22s var(--ease-out);
    animation: health-pop 0.45s var(--ease-out) both;
}
.omnilog-health-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}
.omnilog-health-item .status-dot {
    display: inline-block;
    width: 10px; height: 10px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
    animation: pulse-dot 2s var(--ease-in-out) infinite;
}
.omnilog-health-item .status-dot.ok    { background: var(--success); box-shadow: 0 0 0 4px rgba(6,214,160,0.18); }
.omnilog-health-item .status-dot.down  { background: var(--danger);  box-shadow: 0 0 0 4px rgba(239,71,111,0.18); }
@keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.15); opacity: 0.75; }
}
@keyframes health-pop {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
}

/* ------------------------------------------------------------
   日历单元格 (页面 2) - hover 抬升 + 选中态过渡
   ------------------------------------------------------------ */
.omnilog-cal-cell {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.45rem 0;
    text-align: center;
    font-size: 0.85rem;
    transition: all 0.2s var(--ease-out);
    cursor: pointer;
}
.omnilog-cal-cell:hover {
    transform: translateY(-1px);
    border-color: var(--primary-light);
    box-shadow: var(--shadow-sm);
}
.omnilog-cal-cell.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: white;
    border-color: transparent;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(67,97,238,0.25);
}
.omnilog-cal-cell.muted { color: var(--text-muted); opacity: 0.6; }

/* ------------------------------------------------------------
   列表项 staggered fade-in (用于搜索结果、报告列表、briefs 列表)
   ------------------------------------------------------------ */
.omnilog-stagger-item {
    animation: stagger-in 0.4s var(--ease-out) both;
}
@keyframes stagger-in {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
}

/* ------------------------------------------------------------
   侧边栏
   ------------------------------------------------------------ */
section[data-testid="stSidebar"] {
    background: var(--bg-page);
    border-right: 1px solid var(--border);
}
section[data-testid="stSidebar"] button {
    transition: transform 0.18s var(--ease-out), background 0.18s var(--ease-out) !important;
}
section[data-testid="stSidebar"] button:hover {
    transform: translateX(2px);
}

/* ------------------------------------------------------------
   按钮 (Streamlit 默认按钮的微动效增强)
   ------------------------------------------------------------ */
.stButton > button {
    transition:
        transform 0.18s var(--ease-out),
        box-shadow 0.18s var(--ease-out),
        background 0.18s var(--ease-out) !important;
}
.stButton > button:hover {
    transform: translateY(-1px);
}
.stButton > button:active {
    transform: translateY(0);
    transition-duration: 0.05s !important;
}

/* ------------------------------------------------------------
   分隔线 (柔和渐变)
   ------------------------------------------------------------ */
hr {
    border: none !important;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--border), transparent) !important;
    margin: 1.5rem 0 !important;
}

/* ------------------------------------------------------------
   Spinner 增强旋转
   ------------------------------------------------------------ */
.stSpinner > div > svg {
    animation-duration: 0.8s !important;
}

/* ------------------------------------------------------------
   数据表格 hover 高亮
   ------------------------------------------------------------ */
.stDataFrame [data-testid="stDataFrameStyled"] div:hover {
    background: var(--bg-subtle);
}

/* ------------------------------------------------------------
   标签页 (tabs) 切换过渡
   ------------------------------------------------------------ */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px;
}
.stTabs [data-baseweb="tab"] {
    transition: color 0.2s var(--ease-out), background 0.2s var(--ease-out) !important;
}
.stTabs [aria-selected="true"] {
    color: var(--primary) !important;
    font-weight: 600;
}

/* ------------------------------------------------------------
   骨架屏占位 (配合 st.spinner 使用时的友好过渡)
   ------------------------------------------------------------ */
.omnilog-skeleton {
    background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--border) 37%, var(--bg-subtle) 63%);
    background-size: 400% 100%;
    animation: skeleton-shimmer 1.4s var(--ease-in-out) infinite;
    border-radius: var(--radius-sm);
    min-height: 18px;
    margin: 0.4rem 0;
}
@keyframes skeleton-shimmer {
    0%   { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* ------------------------------------------------------------
   Tooltip (页面 5 地图) 暗色风格统一为浅色
   ------------------------------------------------------------ */
.omnilog-tooltip {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.8rem;
    color: var(--text-primary);
    box-shadow: var(--shadow-md);
    font-size: 0.85rem;
}
.omnilog-tooltip .title { font-weight: 600; margin-bottom: 0.2rem; }
.omnilog-tooltip .meta  { color: var(--text-secondary); font-size: 0.78rem; }

/* ------------------------------------------------------------
   无障碍: 用户偏好减少动效时降级
   ------------------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
    }
    .omnilog-health-item .status-dot { animation: none !important; }
}
</style>
"""


def apply_theme() -> None:
    """注入全局主题 CSS。在每个页面顶部调用一次。"""
    css = GLOBAL_CSS
    for k, v in TOKENS.items():
        css = css.replace("{{" + k + "}}", v)
    st.markdown(css, unsafe_allow_html=True)


def page_header(emoji: str, title: str, subtitle: str) -> None:
    """统一的页面标题（替代各页面重复的 inline HTML）。

    使用语义化 HTML h1，配合主题动效。
    """
    safe_emoji = html.escape(str(emoji))
    safe_title = html.escape(str(title))
    safe_sub = html.escape(str(subtitle))
    st.markdown(
        f'<h1 class="omnilog-page-header">{safe_emoji} {safe_title}</h1>'
        f'<p class="omnilog-page-subheader">{safe_sub}</p>',
        unsafe_allow_html=True,
    )


def nav_card(emoji: str, title: str, description: str, delay: float = 0.0) -> str:
    """生成导航卡片 HTML。

    delay: 用于 staggered animation (秒)。
    """
    safe_emoji = html.escape(str(emoji))
    safe_title = html.escape(str(title))
    safe_desc = html.escape(str(description))
    style = f"animation-delay: {delay:.2f}s;" if delay > 0 else ""
    return (
        f'<div class="omnilog-nav-card" style="{style}">'
        f'<span class="emoji">{safe_emoji}</span>'
        f'<h3>{safe_title}</h3>'
        f'<p>{safe_desc}</p>'
        f'</div>'
    )


def health_grid(components: dict) -> str:
    """生成健康状态网格 HTML。

    components: {name: status_str} 字典。
    所有值均经 html.escape 转义，避免 XSS。
    """
    items_html = []
    for i, (name, status) in enumerate(components.items()):
        s_lower = str(status).lower()
        ok = s_lower in ("connected", "running", "ok", "healthy", "up")
        dot_cls = "ok" if ok else "down"
        label = "OK" if ok else "DOWN"
        color = "var(--success)" if ok else "var(--danger)"
        items_html.append(
            f'<div class="omnilog-health-item" style="animation-delay:{i * 0.04}s">'
            f'<span class="status-dot {dot_cls}"></span>'
            f'<strong>{html.escape(str(name))}</strong><br>'
            f'<span style="color:{color}; font-size:0.78rem;">{label} · {html.escape(str(status))}</span>'
            f'</div>'
        )
    return '<div class="omnilog-health-grid">' + "".join(items_html) + '</div>'


def stagger_style(index: int, base: float = 0.04) -> str:
    """返回 staggered fade-in 的 inline style，用于列表项。"""
    return f'class="omnilog-stagger-item" style="animation-delay:{index * base:.2f}s"'


def skeleton(n: int = 3, height: int = 18) -> str:
    """生成 n 个骨架占位块的 HTML。"""
    return "".join(
        f'<div class="omnilog-skeleton" style="height:{height}px"></div>'
        for _ in range(n)
    )
