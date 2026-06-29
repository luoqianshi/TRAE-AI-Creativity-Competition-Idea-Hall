#!/usr/bin/env python3
"""
股票观点验证系统 - Streamlit可视化面板
功能：
1. 上证指数K线图 + 观点标注
2. 个股分时/日线图 + 观点标注
3. 观点收益验证
4. 手动添加观点
5. 自动刷新
"""
import streamlit as st
import pandas as pd
import numpy as np
import json
import datetime
import time
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data_fetcher import fetch_all_and_analyze, get_all_stock_data, add_manual_view, VIEWS_FILE, calculate_view_return

# ========== 页面配置 ==========
st.set_page_config(
    page_title="股票观点验证系统",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ========== 样式 ==========
st.markdown("""
<style>
    .main-header { text-align: center; padding: 1rem; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border-radius: 10px; margin-bottom: 1rem; }
    .main-header h1 { color: #e94560; margin: 0; font-size: 2rem; }
    .main-header p { color: #aaa; margin: 0; }
    .view-card { background: #1e1e2e; border-radius: 8px; padding: 1rem; margin: 0.5rem 0; border-left: 4px solid #e94560; }
    .view-card.buy { border-left-color: #00ff88; }
    .view-card.sell { border-left-color: #ff4444; }
    .view-card.hold { border-left-color: #ffaa00; }
    .metric-card { background: #1e1e2e; border-radius: 8px; padding: 1rem; text-align: center; }
    .metric-card .label { color: #888; font-size: 0.8rem; }
    .metric-card .value { font-size: 1.5rem; font-weight: bold; }
    .stButton button { width: 100%; }
    .correct { color: #00ff88; }
    .wrong { color: #ff4444; }
    .pending { color: #ffaa00; }
</style>
""", unsafe_allow_html=True)

# ========== 初始化 Session State ==========
if "views" not in st.session_state:
    st.session_state.views = []
if "index_data" not in st.session_state:
    st.session_state.index_data = None
if "stock_data" not in st.session_state:
    st.session_state.stock_data = {}
if "last_refresh" not in st.session_state:
    st.session_state.last_refresh = None
if "auto_refresh" not in st.session_state:
    st.session_state.auto_refresh = False
if "latest_price" not in st.session_state:
    st.session_state.latest_price = None

# ========== 数据加载函数 ==========
@st.cache_data(ttl=60)
def load_data():
    """加载所有数据（缓存60秒）"""
    data = get_all_stock_data()
    return data

@st.cache_data(ttl=300)
def load_index_data():
    """仅加载指数数据（缓存5分钟）"""
    import akshare as ak
    try:
        df = ak.stock_zh_index_daily(symbol="sh000001")
        df = df.rename(columns={
            'date': 'date', 'open': 'open', 'high': 'high',
            'low': 'low', 'close': 'close', 'volume': 'volume'
        })
        df['date'] = pd.to_datetime(df['date'])
        cutoff = pd.Timestamp.now() - pd.Timedelta(days=365)
        df = df[df['date'] >= cutoff]
        return df
    except:
        return None

def refresh_data():
    """刷新数据"""
    with st.spinner("正在刷新数据..."):
        data = load_data()
        st.session_state.index_data = data.get("index_data")
        st.session_state.stock_data = data.get("stock_data", {})
        st.session_state.views = data.get("views", [])
        st.session_state.latest_price = data.get("latest_index_price")
        st.session_state.last_refresh = datetime.datetime.now()

def fetch_new_articles():
    """重新抓取文章并分析"""
    with st.spinner("正在抓取并分析文章..."):
        result = fetch_all_and_analyze()
        refresh_data()
        st.success(f"抓取完成！共提取 {result.get('total_views', 0)} 条观点")
        time.sleep(1)
        st.rerun()

# ========== 侧边栏 ==========
with st.sidebar:
    st.markdown("## ⚙️ 控制面板")
    
    # 数据刷新
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 刷新数据", use_container_width=True):
            refresh_data()
            st.rerun()
    with col2:
        if st.button("📥 抓取新文章", use_container_width=True):
            fetch_new_articles()
    
    # 自动刷新
    auto_refresh = st.checkbox("自动刷新(30秒)", value=st.session_state.auto_refresh)
    st.session_state.auto_refresh = auto_refresh
    
    st.divider()
    
    # 手动添加观点
    st.markdown("### 📝 手动添加观点")
    with st.form("add_view_form"):
        col1, col2 = st.columns(2)
        with col1:
            stock_name = st.text_input("股票名称", placeholder="如: 上证指数")
        with col2:
            stock_code = st.text_input("股票代码", placeholder="如: 000001.SH")
        
        direction = st.selectbox("方向", ["买入", "卖出", "持有观望"])
        reason = st.text_input("观点理由", placeholder="简短描述")
        
        col1, col2 = st.columns(2)
        with col1:
            author = st.text_input("来源", placeholder="作者名")
        with col2:
            view_date = st.date_input("观点日期", value=datetime.date.today())
        
        target_price = st.text_input("目标价(可选)", placeholder="如: 3500")
        
        if st.form_submit_button("✅ 添加观点", use_container_width=True):
            tp = float(target_price) if target_price else None
            add_manual_view(
                stock_name, stock_code, direction, reason,
                author, view_date.strftime("%Y-%m-%d"), tp
            )
            st.success(f"已添加观点: {stock_name} {direction}")
            refresh_data()
            time.sleep(0.5)
            st.rerun()
    
    st.divider()
    
    # 系统信息
    st.markdown("### ℹ️ 系统信息")
    if st.session_state.last_refresh:
        st.caption(f"最后刷新: {st.session_state.last_refresh.strftime('%H:%M:%S')}")
    if st.session_state.latest_price:
        st.metric("上证指数", f"{st.session_state.latest_price}")
    st.caption(f"观点总数: {len(st.session_state.views)}")
    
    # 股票代码查询帮助
    with st.expander("📖 常见股票代码"):
        st.code("""
        上证指数: 000001.SH
        创业板指: 399006.SZ
        贵州茅台: 600519.SH
        宁德时代: 300750.SZ
        中国平安: 601318.SH
        招商银行: 600036.SH
        东方财富: 300059.SZ
        """)

# ========== 主界面 ==========
st.markdown("""
<div class="main-header">
    <h1>📈 股票观点验证系统</h1>
    <p>信息源：微信公众号（暮烟风雨、爱在冰川） | 雪球（专注做AI华仔）</p>
</div>
""", unsafe_allow_html=True)

# 加载数据
if st.session_state.index_data is None:
    refresh_data()

# ========== K线图 + 观点标注 ==========
st.markdown("## 📊 上证指数 K线图 + 观点标注")

if st.session_state.index_data:
    index_df = pd.DataFrame(st.session_state.index_data)
    index_df['date'] = pd.to_datetime(index_df['date'])
    
    # 构建图表
    fig = make_subplots(
        rows=2, cols=1,
        shared_xaxes=True,
        vertical_spacing=0.05,
        row_heights=[0.75, 0.25],
        subplot_titles=("上证指数", "成交量")
    )
    
    # K线
    fig.add_trace(go.Candlestick(
        x=index_df['date'],
        open=index_df['open'],
        high=index_df['high'],
        low=index_df['low'],
        close=index_df['close'],
        name="上证指数",
        increasing_line_color='#ef5350',
        decreasing_line_color='#26a69a',
    ), row=1, col=1)
    
    # 成交量
    colors = ['#26a69a' if index_df['close'].iloc[i] >= index_df['open'].iloc[i] else '#ef5350' 
              for i in range(len(index_df))]
    fig.add_trace(go.Bar(
        x=index_df['date'],
        y=index_df['volume'],
        name="成交量",
        marker_color=colors,
        opacity=0.5
    ), row=2, col=1)
    
    # 标注观点
    for v in st.session_state.views:
        code = v.get("stock_code", "") or ""
        is_index = "000001" in code if code else False
        
        # 只显示上证指数相关的观点，或者没有具体代码但名称涉及大盘的观点
        stock_name = v.get("stock_name", "")
        is_index_view = is_index or "大盘" in stock_name or "上证" in stock_name or "指数" in stock_name or "股市" in stock_name
        
        if not is_index_view and code:
            continue  # 个股观点在个股图表中显示
        
        # 获取观点日期
        v_date = v.get("date", "")
        if not v_date:
            continue
        
        try:
            v_dt = pd.Timestamp(v_date)
        except:
            continue
        
        # 找到对应日期的价格
        mask = index_df['date'] >= v_dt
        matched = index_df[mask]
        if len(matched) == 0:
            continue
        
        # 标注
        direction = v.get("direction", "买入")
        
        if direction == "买入":
            marker_color = '#00ff88'
            marker_symbol = 'triangle-up'
            text_prefix = "🟢 买入"
        elif direction == "卖出":
            marker_color = '#ff4444'
            marker_symbol = 'triangle-down'
            text_prefix = "🔴 卖出"
        else:
            marker_color = '#ffaa00'
            marker_symbol = 'diamond'
            text_prefix = "🟡 观望"
        
        price = matched.iloc[0]['close']
        label = f"{text_prefix} {v.get('stock_name','')}<br>{v.get('reason','')}"
        
        fig.add_trace(go.Scatter(
            x=[matched.iloc[0]['date']],
            y=[price],
            mode='markers+text',
            marker=dict(symbol=marker_symbol, size=14, color=marker_color, line=dict(width=1, color='white')),
            name=f"{v.get('source_name','')}: {v.get('stock_name','')} {direction}",
            text=[label],
            textposition="top center",
            textfont=dict(size=10, color=marker_color),
            hoverinfo='text',
            hovertext=f"<b>{v.get('author', v.get('source_name',''))}</b><br>"
                      f"{v.get('stock_name','')} - {direction}<br>"
                      f"时间: {v_date}<br>"
                      f"理由: {v.get('reason','')}"
        ), row=1, col=1)
    
    # 更新布局
    fig.update_layout(
        height=650,
        template='plotly_dark',
        xaxis_rangeslider_visible=False,
        hovermode='x unified',
        legend=dict(
            orientation='h',
            yanchor='bottom',
            y=1.02,
            xanchor='right',
            x=1
        ),
        margin=dict(l=50, r=50, t=50, b=50)
    )
    
    fig.update_yaxes(title_text="点位", row=1, col=1)
    fig.update_yaxes(title_text="成交量", row=2, col=1)
    
    st.plotly_chart(fig, use_container_width=True)
else:
    st.warning("无法获取上证指数数据，请检查网络连接")

# ========== 观点收益验证表格 ==========
st.markdown("## 🎯 观点验证与收益分析")

if st.session_state.views:
    # 准备验证数据
    index_df = pd.DataFrame(st.session_state.index_data) if st.session_state.index_data else None
    if index_df is not None:
        index_df['date'] = pd.to_datetime(index_df['date'])
    
    stock_data_dfs = {}
    for code, data in st.session_state.stock_data.items():
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        stock_data_dfs[code] = df
    
    # 计算每个观点的收益
    view_results = []
    for v in st.session_state.views:
        stock_code = v.get("stock_code", "") or ""
        is_index = "000001" in stock_code
        
        if is_index or not stock_code:
            result = calculate_view_return(v, index_data=index_df)
        elif stock_code in stock_data_dfs:
            result = calculate_view_return(v, stock_data_dict={stock_code: stock_data_dfs[stock_code]})
        else:
            result = {"return_pct": None, "days_held": None, "status": "缺少数据", "start_price": None, "current_price": None}
        
        result["stock_name"] = v.get("stock_name", "")
        result["direction"] = v.get("direction", "")
        result["reason"] = v.get("reason", "")
        result["author"] = v.get("author", v.get("source_name", ""))
        result["date"] = v.get("date", "")
        result["stock_code"] = stock_code if stock_code else "-"
        view_results.append(result)
    
    # 显示统计摘要
    cols = st.columns(4)
    total = len(view_results)
    verified = [r for r in view_results if r.get("return_pct") is not None]
    correct = [r for r in verified if r.get("hit", False)]
    
    with cols[0]:
        st.markdown(f"""
        <div class="metric-card">
            <div class="label">总观点数</div>
            <div class="value">{total}</div>
        </div>
        """, unsafe_allow_html=True)
    with cols[1]:
        avg_return = np.mean([r.get("return_pct", 0) for r in verified if r.get("return_pct") is not None]) if verified else 0
        st.markdown(f"""
        <div class="metric-card">
            <div class="label">平均收益</div>
            <div class="value" style="color:{'#00ff88' if avg_return > 0 else '#ff4444'}">{avg_return:.1f}%</div>
        </div>
        """, unsafe_allow_html=True)
    with cols[2]:
        win_rate = len(correct) / len(verified) * 100 if verified else 0
        st.markdown(f"""
        <div class="metric-card">
            <div class="label">正确率</div>
            <div class="value">{win_rate:.0f}%</div>
        </div>
        """, unsafe_allow_html=True)
    with cols[3]:
        st.markdown(f"""
        <div class="metric-card">
            <div class="label">已验证</div>
            <div class="value">{len(verified)}/{total}</div>
        </div>
        """, unsafe_allow_html=True)
    
    # 详细表格
    st.markdown("### 观点详情")
    
    table_data = []
    for r in view_results:
        status_icon = "✅" if r.get("hit") else ("❌" if r.get("return_pct") is not None else "⏳")
        ret_val = r.get("return_pct")
        return_str = f"{ret_val:+.2f}%" if ret_val is not None else "待验证"
        return_color = "color: #00ff88" if (ret_val is not None and ret_val > 0) else ("color: #ff4444" if (ret_val is not None and ret_val < 0) else "color: #888")
        
        table_data.append({
            "状态": status_icon,
            "来源": r.get("author", "-"),
            "品种": r.get("stock_name", ""),
            "方向": r.get("direction", ""),
            "理由": r.get("reason", ""),
            "日期": r.get("date", ""),
            "起始价": f"{r.get('start_price', '-')}" if r.get("start_price") else "-",
            "现价": f"{r.get('current_price', '-')}" if r.get("current_price") else "-",
            "收益": return_str,
            "持有天数": f"{r.get('days_held', '-')}天" if r.get("days_held") else "-",
            "最大涨幅": f"{r.get('max_return', 0):+.2f}%" if r.get("max_return") else "-",
            "最大回撤": f"{r.get('max_drawdown', 0):+.2f}%" if r.get("max_drawdown") else "-",
        })
    
    if table_data:
        st.data_editor(
            table_data,
            use_container_width=True,
            hide_index=True,
            column_config={
                "收益": st.column_config.TextColumn("收益", width="small"),
                "理由": st.column_config.TextColumn("理由", width="medium"),
            },
            disabled=True
        )

else:
    st.info("暂无观点数据。请点击左侧「抓取新文章」或手动添加观点。")

# ========== 个股分时图 ==========
st.markdown("## 📈 个股观点详情")

# 找出所有个股观点
stock_views = {}
for v in st.session_state.views:
    code = v.get("stock_code", "") or ""
    if code and "000001" not in code:
        name = v.get("stock_name", code)
        if code not in stock_views:
            stock_views[code] = {"name": name, "views": []}
        stock_views[code]["views"].append(v)

if stock_views:
    tabs = st.tabs([f"{sv['name']} ({code})" for code, sv in stock_views.items()])
    
    for i, (code, sv) in enumerate(stock_views.items()):
        with tabs[i]:
            st.markdown(f"**{sv['name']} ({code})** 相关观点")
            
            for v in sv["views"]:
                direction = v.get("direction", "")
                emoji = "🟢" if direction == "买入" else ("🔴" if direction == "卖出" else "🟡")
                st.markdown(f"""
                <div class="view-card {direction}">
                    <b>{emoji} {direction}</b> | {v.get('reason','')}<br>
                    <small>作者: {v.get('author', v.get('source_name',''))} | 日期: {v.get('date','')}</small>
                </div>
                """, unsafe_allow_html=True)
            
            # 显示个股K线
            if code in st.session_state.stock_data:
                stock_df = pd.DataFrame(st.session_state.stock_data[code])
                stock_df['date'] = pd.to_datetime(stock_df['date'])
                
                fig2 = go.Figure()
                fig2.add_trace(go.Candlestick(
                    x=stock_df['date'],
                    open=stock_df['open'],
                    high=stock_df['high'],
                    low=stock_df['low'],
                    close=stock_df['close'],
                    name=sv['name'],
                    increasing_line_color='#ef5350',
                    decreasing_line_color='#26a69a',
                ))
                
                # 标注观点
                for v in sv["views"]:
                    v_date = v.get("date", "")
                    if not v_date: continue
                    try:
                        v_dt = pd.Timestamp(v_date)
                    except: continue
                    
                    mask = stock_df['date'] >= v_dt
                    matched = stock_df[mask]
                    if len(matched) == 0: continue
                    
                    direction = v.get("direction", "")
                    color = '#00ff88' if direction == '买入' else ('#ff4444' if direction == '卖出' else '#ffaa00')
                    symbol = 'triangle-up' if direction == '买入' else ('triangle-down' if direction == '卖出' else 'diamond')
                    
                    fig2.add_trace(go.Scatter(
                        x=[matched.iloc[0]['date']],
                        y=[matched.iloc[0]['close']],
                        mode='markers',
                        marker=dict(symbol=symbol, size=14, color=color, line=dict(width=1, color='white')),
                        name=f"{direction} {v_date}"
                    ))
                
                fig2.update_layout(
                    height=450,
                    template='plotly_dark',
                    xaxis_rangeslider_visible=False,
                    title=f"{sv['name']} K线图"
                )
                
                st.plotly_chart(fig2, use_container_width=True)
            else:
                st.info(f"个股 {code} 行情数据暂未获取")
else:
    st.info("当前没有个股观点数据。当观点中包含具体股票代码时，将在此显示个股K线图。")

# ========== 底部信息 ==========
st.divider()
col1, col2, col3 = st.columns(3)
with col1:
    st.caption(f"📅 当前时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
with col2:
    st.caption(f"🔄 数据更新: 每60秒自动刷新")
with col3:
    st.caption(f"📊 数据来源: akshare + DeepSeek API")

# ========== 自动刷新 ==========
if st.session_state.auto_refresh:
    time.sleep(30)
    st.rerun()