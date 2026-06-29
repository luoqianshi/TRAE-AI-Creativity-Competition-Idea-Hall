#!/usr/bin/env python3
"""
股票观点数据获取模块
- 从微信公众号抓取文章
- 使用DeepSeek API分析观点
- 通过akshare获取股票行情数据
"""
import json
import re
import time
import datetime
import os
import pandas as pd
import numpy as np
from curl_cffi import requests as curl_requests
import requests as std_requests

# ========== 配置 ==========
DEEPSEEK_API_KEY = "sk-04c7e6349cf94f528b0820806614647f"
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

# 信息源配置
SOURCES = {
    "wechat": [
        {"name": "暮烟风雨", "url": "https://mp.weixin.qq.com/s/-cooy9i08aCZzASmhopAuw"},
        {"name": "爱在冰川", "url": "https://mp.weixin.qq.com/s/99Qsd-Z68-h1lJe6BK6lMA"},
    ],
    "xueqiu": [
        {"name": "专注做AI华仔", "user_id": "4184484807"},
    ]
}

# 使用脚本所在目录的相对路径
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIEWS_FILE = os.path.join(_BASE_DIR, "views.json")
STOCK_CACHE_DIR = os.path.join(_BASE_DIR, "cache")

# 确保views.json存在
if not os.path.exists(VIEWS_FILE):
    with open(VIEWS_FILE, "w", encoding="utf-8") as f:
        json.dump({"views": [], "fetch_time": "", "total_views": 0}, f, ensure_ascii=False, indent=2)


# ========== 微信公众号抓取 ==========

def fetch_wechat_article(url):
    """获取微信公众号文章内容"""
    try:
        resp = curl_requests.get(url, impersonate="chrome124", timeout=20,
            headers={
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.34(0x16082222) NetType/WIFI Language/zh_CN",
            }
        )
        resp.encoding = 'utf-8'
        html = resp.text
        
        # 提取标题
        title = ""
        m = re.search(r'var title = "(.*?)"', html)
        if m: title = m.group(1)
        
        # 提取公众号名称
        author = ""
        m = re.search(r'var nickname = "(.*?)"', html)
        if m: author = m.group(1)
        
        # 提取时间
        pub_time = ""
        m = re.search(r'var ct = "(\d+)"', html)
        if m:
            ts = int(m.group(1))
            pub_time = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")
            pub_date = datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
        
        # 提取正文 - 定位js_content并提取纯文本
        content = ""
        pos = html.find('id="js_content"')
        if pos > 0:
            # 找到内容起始位置（第一个>之后）
            tag_end = html.find('>', pos)
            content_start = tag_end + 1
            
            # 找到内容结束 - 查找匹配的</div>
            # js_content内部有嵌套div，所以需要计数找到正确的闭合标签
            depth = 1
            i = content_start
            while i < len(html) and depth > 0:
                if html[i:i+4] == '<div' and html[i+4] not in 'abcdefghijklmnopqrstuvwxyz':
                    depth += 1
                    i += 4
                elif html[i:i+6] == '</div>':
                    depth -= 1
                    i += 6
                else:
                    i += 1
            
            if depth == 0:
                raw_content = html[content_start:i-6]
                # 去除HTML标签，保留段落
                text = re.sub(r'<[^>]+>', '\n', raw_content)
                text = re.sub(r'&nbsp;', ' ', text)
                text = re.sub(r'&amp;', '&', text)
                text = re.sub(r'&lt;', '<', text)
                text = re.sub(r'&gt;', '>', text)
                # 去重行（微信文章常有重复）
                lines = text.split('\n')
                unique_lines = []
                seen = set()
                for line in lines:
                    line_stripped = line.strip()
                    if line_stripped and line_stripped not in seen:
                        seen.add(line_stripped)
                        unique_lines.append(line_stripped)
                content = '\n'.join(unique_lines)
        
        return {
            "source": "wechat",
            "url": url,
            "title": title,
            "author": author,
            "publish_time": pub_time,
            "publish_date": pub_time[:10] if pub_time else "",
            "content": content[:4000]
        }
    except Exception as e:
        return {"source": "wechat", "url": url, "error": str(e), "content": ""}


# ========== DeepSeek分析 ==========

def analyze_article_with_deepseek(article_text, author="", title=""):
    """用DeepSeek分析文章中的股票观点"""
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""分析以下股票文章，提取所有具体的股票买卖观点（含指数和个股）。

要求：
1. 识别文中明确提到的股票代码或名称
2. 判断观点方向（买入/卖出/持有观望）
3. 识别观点对应的具体时间
4. 如果需要DeepSeek自己理解才能判断是否有观点，也请提取

返回严格JSON格式：
{{
  "views": [
    {{
      "stock_name": "股票或指数名称",
      "stock_code": "股票代码(上证指数=000001.SH, 其他如不确定填null)",
      "direction": "买入/卖出/持有观望",
      "reason": "核心观点(20字内)",
      "target_price": 目标价(没有填null),
      "time_hint": "文中提到的对应时间点",
      "author": "{author}",
      "source_title": "{title}"
    }}
  ]
}}

如果完全没有具体观点返回 {{"views": []}}
只输出JSON。

文章：
{article_text[:4000]}"""
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是一个专业的股票观点提取助手，严格按JSON格式输出。"},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 2000,
        "temperature": 0.1
    }
    
    try:
        resp = std_requests.post(DEEPSEEK_URL, json=payload, headers=headers, timeout=60)
        if resp.status_code == 200:
            content = resp.json()['choices'][0]['message']['content']
            jm = re.search(r'\{.*\}', content, re.DOTALL)
            if jm:
                return json.loads(jm.group())
        return {"views": []}
    except Exception as e:
        return {"views": [], "error": str(e)}


# ========== 股票行情获取 ==========

def get_index_daily(code="000001.SH"):
    """获取指数日线数据"""
    import akshare as ak
    try:
        # 上证指数
        df = ak.stock_zh_index_daily(symbol="sh000001")
        df = df.rename(columns={
            'date': 'date', 'open': 'open', 'high': 'high',
            'low': 'low', 'close': 'close', 'volume': 'volume'
        })
        df['date'] = pd.to_datetime(df['date'])
        # 只保留近1年数据
        cutoff = pd.Timestamp.now() - pd.Timedelta(days=365)
        df = df[df['date'] >= cutoff]
        return df
    except Exception as e:
        print(f"获取指数数据失败: {e}")
        return None

def get_stock_daily(stock_code):
    """获取个股日线数据"""
    import akshare as ak
    try:
        # 格式处理
        if '.' in stock_code:
            symbol = stock_code.replace('.SH', '').replace('.SZ', '')
        else:
            symbol = stock_code
        
        df = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
        if df is not None and len(df) > 0:
            df = df.rename(columns={
                '日期': 'date', '开盘': 'open', '最高': 'high',
                '最低': 'low', '收盘': 'close', '成交量': 'volume'
            })
            df['date'] = pd.to_datetime(df['date'])
            # 近1年
            cutoff = pd.Timestamp.now() - pd.Timedelta(days=365)
            df = df[df['date'] >= cutoff]
            return df
    except Exception as e:
        print(f"获取个股{stock_code}数据失败: {e}")
    return None

def get_stock_minute_data(stock_code, date_str=None):
    """获取个股分时数据"""
    import akshare as ak
    try:
        if '.' in stock_code:
            symbol = stock_code.replace('.SH', '').replace('.SZ', '')
        else:
            symbol = stock_code
        
        if date_str is None:
            date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        
        df = ak.stock_zh_a_hist_min_em(
            symbol=symbol,
            period="1",
            start_date=f"{date_str} 09:30:00",
            end_date=f"{date_str} 15:00:00",
            adjust=""
        )
        if df is not None and len(df) > 0:
            df = df.rename(columns={
                '时间': 'time', '开盘': 'open', '收盘': 'close',
                '最高': 'high', '最低': 'low', '成交量': 'volume'
            })
            return df
    except Exception as e:
        print(f"获取个股{stock_code}分时数据失败: {e}")
    return None


# ========== 观点验证（收益计算） ==========

def calculate_view_return(view, index_data=None, stock_data_dict=None):
    """
    计算观点发布后的收益表现
    返回: {return_pct, days_held, max_return, max_drawdown, current_price, start_price}
    """
    import pandas as pd
    import numpy as np
    
    result = {
        "return_pct": None,
        "days_held": None,
        "max_return": None,
        "max_drawdown": None,
        "start_price": None,
        "current_price": None,
        "status": "待验证"
    }
    
    # 获取观点日期
    view_date = view.get("date", "")
    if not view_date:
        view_date = view.get("publish_date", "")
    if not view_date or len(view_date) < 10:
        return result
    
    try:
        view_dt = pd.Timestamp(view_date)
    except:
        return result
    
    # 判断是指数还是个股
    stock_code = view.get("stock_code", "")
    is_index = stock_code and "000001" in stock_code
    
    if is_index and index_data is not None:
        data = index_data
    elif stock_code and stock_data_dict and stock_code in stock_data_dict:
        data = stock_data_dict[stock_code]
    else:
        return {**result, "status": "缺少数据"}
    
    if data is None or len(data) == 0:
        return {**result, "status": "缺少数据"}
    
    # 找到观点日期之后的数据
    mask = data['date'] >= view_dt
    after_data = data[mask].sort_values('date')
    
    if len(after_data) < 2:
        return {**result, "status": "数据不足"}
    
    start_price = after_data.iloc[0]['close']
    current_price = after_data.iloc[-1]['close']
    
    # 计算出持有天数和收益率
    days = (after_data.iloc[-1]['date'] - after_data.iloc[0]['date']).days
    return_pct = (current_price - start_price) / start_price * 100
    
    # 计算最大涨幅和最大回撤
    max_price = after_data['close'].max()
    min_price = after_data['close'].min()
    max_return_pct = (max_price - start_price) / start_price * 100
    max_drawdown_pct = (min_price - max_price) / max_price * 100
    
    # 判断方向是否符合
    direction = view.get("direction", "买入")
    if direction in ["买入"]:
        hit = return_pct > 0
    elif direction in ["卖出"]:
        hit = return_pct < 0
    else:
        hit = abs(return_pct) < 2  # 观望则基本持平
    
    return {
        "return_pct": round(return_pct, 2),
        "days_held": days,
        "max_return": round(max_return_pct, 2),
        "max_drawdown": round(max_drawdown_pct, 2),
        "start_price": round(start_price, 2),
        "current_price": round(current_price, 2),
        "status": "✅ 验证正确" if hit else "❌ 验证错误",
        "hit": hit
    }


# ========== 主流程 ==========

def fetch_all_and_analyze():
    """完整的抓取和分析流程"""
    print("="*60)
    print(f"观点获取时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    views = []
    
    # 1. 抓取微信公众号
    print("\n[1] 抓取微信公众号...")
    for src in SOURCES["wechat"]:
        print(f"  → {src['name']}...")
        article = fetch_wechat_article(src["url"])
        if article.get("content"):
            print(f"    内容长度: {len(article['content'])}字")
            # DeepSeek分析
            print(f"    正在用DeepSeek分析...")
            analysis = analyze_article_with_deepseek(
                article['content'], 
                article.get('author', src['name']),
                article.get('title', '')
            )
            for v in analysis.get("views", []):
                v["publish_date"] = article.get("publish_date", "")
                v["source"] = "微信公众号"
                v["source_name"] = article.get("author", src['name'])
                if not v.get("date"):
                    v["date"] = article.get("publish_date", "")
                views.append(v)
            print(f"    提取到 {len(analysis.get('views',[]))} 条观点")
        else:
            print(f"    ✗ {article.get('error', '获取失败')}")
        time.sleep(1)
    
    # 2. 尝试抓取雪球
    print("\n[2] 尝试获取雪球数据...")
    # 通过浏览器方式获取（游客可访问）
    try:
        import subprocess
        result_xq = subprocess.run(
            ["python3", "/data/user/work/xueqiu_to_system.py"],
            capture_output=True, text=True, timeout=120
        )
        print(result_xq.stdout[-500:] if result_xq.stdout else "  无输出")
        if result_xq.returncode != 0:
            print(f"  stderr: {result_xq.stderr[-200:]}")
    except Exception as e:
        print(f"  雪球抓取失败: {e}")
    
    # 重新读取views（包含雪球新增的）
    try:
        with open(VIEWS_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
            views = existing.get("views", views)
    except:
        pass
    
    # 3. 保存结果
    import pandas as pd
    result = {
        "fetch_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "views": views,
        "total_views": len(views)
    }
    
    # 保存views
    with open(VIEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n总计提取 {len(views)} 条观点")
    return result


# ========== 手动添加观点 ==========

def add_manual_view(stock_name, stock_code, direction, reason, author, date, target_price=None):
    """手动添加一条观点"""
    views_data = {"views": [], "fetch_time": "", "total_views": 0}
    try:
        with open(VIEWS_FILE, "r", encoding="utf-8") as f:
            views_data = json.load(f)
    except:
        pass
    
    if "views" not in views_data:
        views_data["views"] = []
    
    new_view = {
        "stock_name": stock_name,
        "stock_code": stock_code,
        "direction": direction,
        "reason": reason,
        "target_price": target_price,
        "author": author,
        "date": date,
        "publish_date": date,
        "source": "手动输入",
        "source_name": author,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    views_data["views"].append(new_view)
    views_data["total_views"] = len(views_data["views"])
    views_data["fetch_time"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with open(VIEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(views_data, f, ensure_ascii=False, indent=2)
    
    return new_view


# ========== 导出数据给前端 ==========

def _get_stock_data_tencent(symbol):
    """从腾讯源获取个股数据（绕过代理限制）"""
    import pandas as pd
    import requests as std_requests
    
    # 清理代码格式
    clean_symbol = symbol.replace('SH', '').replace('SZ', '').replace('sh', '').replace('sz', '').strip()
    
    # 判断是沪市还是深市
    if clean_symbol.startswith('6') or clean_symbol.startswith('688') or clean_symbol.startswith('9'):
        prefix = 'sh'
    elif clean_symbol.startswith('0') or clean_symbol.startswith('3') or clean_symbol.startswith('2'):
        prefix = 'sz'
    else:
        prefix = 'sh'
    
    full_code = f"{prefix}{clean_symbol}"
    url = f"https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param={full_code},day,2025-01-01,,500,qfq"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://finance.qq.com/'
    }
    
    try:
        resp = std_requests.get(url, headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('code') == 0:
                raw = data.get('data', {}).get(full_code, [])
                # 腾讯API可能返回list(直接是k线数组)或dict(包含'day'/'qfqday'等key)
                if isinstance(raw, dict):
                    days = raw.get('day', raw.get('qfqday', []))
                elif isinstance(raw, list):
                    days = raw
                else:
                    days = []
                if days:
                    rows = []
                    for d in days:
                        if len(d) >= 6:
                            rows.append({
                                'date': d[0],
                                'open': float(d[1]) if d[1] else 0,
                                'close': float(d[2]) if d[2] else 0,
                                'high': float(d[3]) if d[3] else 0,
                                'low': float(d[4]) if d[4] else 0,
                                'volume': int(float(d[5])) if d[5] else 0,
                            })
                    if rows:
                        return pd.DataFrame(rows)
    except Exception as e:
        print(f"  腾讯源获取{symbol}失败: {e}")
    
    return None

def get_all_stock_data():
    """获取所有用于前端展示的数据"""
    import akshare as ak
    import pandas as pd
    import numpy as np
    
    data = {
        "index_data": None,
        "stock_data": {},
        "views": [],
        "latest_index_price": None,
        "last_update": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # 1. 读取观点
    try:
        with open(VIEWS_FILE, "r", encoding="utf-8") as f:
            vd = json.load(f)
            data["views"] = vd.get("views", [])
    except:
        pass
    
    # 2. 获取上证指数日线
    try:
        df_index = ak.stock_zh_index_daily(symbol="sh000001")
        df_index = df_index.rename(columns={
            'date': 'date', 'open': 'open', 'high': 'high',
            'low': 'low', 'close': 'close', 'volume': 'volume'
        })
        df_index['date'] = pd.to_datetime(df_index['date'])
        cutoff = pd.Timestamp.now() - pd.Timedelta(days=365)
        df_index = df_index[df_index['date'] >= cutoff]
        
        data["index_data"] = {
            "date": df_index['date'].dt.strftime('%Y-%m-%d').tolist(),
            "open": df_index['open'].tolist(),
            "high": df_index['high'].tolist(),
            "low": df_index['low'].tolist(),
            "close": df_index['close'].tolist(),
            "volume": df_index['volume'].tolist(),
        }
        data["latest_index_price"] = round(df_index['close'].iloc[-1], 2)
    except Exception as e:
        print(f"获取指数失败: {e}")
    
    # 3. 获取观点中提到的个股数据
    stock_codes_needed = set()
    for v in data["views"]:
        code = v.get("stock_code", "")
        if code and "000001" not in code:
            stock_codes_needed.add(code)
    
    for code in stock_codes_needed:
        try:
            symbol = code.replace('.SH', '').replace('.SZ', '')
            # 尝试从腾讯源获取（东财被代理拦截）
            df = _get_stock_data_tencent(symbol)
            if df is not None and len(df) > 0:
                df = df.rename(columns={
                    'date': 'date', 'open': 'open', 'high': 'high',
                    'low': 'low', 'close': 'close', 'volume': 'volume'
                })
                df['date'] = pd.to_datetime(df['date'])
                cutoff = pd.Timestamp.now() - pd.Timedelta(days=365)
                df = df[df['date'] >= cutoff]
                
                data["stock_data"][code] = {
                    "date": df['date'].dt.strftime('%Y-%m-%d').tolist(),
                    "open": df['open'].tolist(),
                    "high": df['high'].tolist(),
                    "low": df['low'].tolist(),
                    "close": df['close'].tolist(),
                }
        except Exception as e:
            print(f"获取{code}数据失败: {e}")
    
    return data


# ========== 启动时自动抓取 ==========

if __name__ == "__main__":
    # 首次运行时自动抓取
    import os
    if not os.path.exists(VIEWS_FILE):
        print("首次运行，自动抓取观点...")
        fetch_all_and_analyze()
    else:
        print("观点数据已存在，跳过抓取")
        print(f"文件: {VIEWS_FILE}")
    
    # 测试数据获取
    data = get_all_stock_data()
    print(f"\n上证指数最新价: {data.get('latest_index_price')}")
    print(f"观点数量: {len(data['views'])}")
    print(f"个股数据: {list(data['stock_data'].keys())}")