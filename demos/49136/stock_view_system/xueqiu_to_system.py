#!/usr/bin/env python3
"""直接用已获取的雪球数据集成到系统"""
import json
import datetime
import re
import os
import requests as std_requests

DEEPSEEK_API_KEY = "sk-04c7e6349cf94f528b0820806614647f"
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIEWS_FILE = os.path.join(_BASE_DIR, "views.json")

# 从浏览器快照中提取的帖子数据
xueqiu_posts = [
    {
        "text": "开仓臻宝，第一时间已告知。次新风险和波动极大，请注意风险，操作自行把握",
        "time": "2026-06-24 4小时前",
        "stocks": ["臻宝科技"]
    },
    {
        "text": "市场未对N臻宝按照存储进行充分定价，这就是预期差所在 $N臻宝(SH688797)$",
        "time": "2026-06-24 4小时前",
        "stocks": ["N臻宝(SH688797)"]
    },
    {
        "text": "富信科技、联瑞新材、臻宝科技、盛合晶微、联讯仪器都看好，也是这几个月我买过的5只股。个股自行选股，不局限于我说的，前提是AI产业链受益核心标的",
        "time": "2026-06-24 7小时前",
        "stocks": ["富信科技", "联瑞新材", "臻宝科技"]
    },
    {
        "text": "富信只保留底仓，新开仓臻宝。打开评论权限，仅讨论基本面和逻辑，关于交易层面均不回复",
        "time": "2026-06-24 7小时前",
        "stocks": ["富信科技", "臻宝科技"]
    },
    {
        "text": "感谢富信科技、联瑞新材、联讯仪器、盛合晶微、N臻宝。这就是厚积薄发吧！！！",
        "time": "2026-06-24 3小时前",
        "stocks": ["富信科技", "联瑞新材", "N臻宝(SH688797)"]
    },
    {
        "text": "存为王，臻宝为先锋，必将所向披靡",
        "time": "2026-06-24 4小时前",
        "stocks": ["臻宝科技"]
    },
    {
        "text": "回头看看操作，400元的买点",
        "time": "2026-06-24 4小时前",
        "stocks": ["臻宝科技"]
    },
    {
        "text": "专栏丨 臻宝科技：零部件国产替代提速，2026涂层、碳化硅业务高增可期。公司积极推进零部件产品在设备厂商的测试验证，并已通过客户5等设备厂商的认证",
        "time": "2026-06-24 1小时前",
        "stocks": ["臻宝科技"]
    },
]

# 使用已有知识补充股票代码
stock_code_map = {
    "臻宝科技": "SH688797",
    "N臻宝": "SH688797",
    "N臻宝(SH688797)": "SH688797",
    "富信科技": "SH688662",
    "联瑞新材": "SH688300",
    "联讯仪器": None,
    "盛合晶微": None,
}

print("="*60)
print("雪球观点提取与集成")
print("="*60)

combined = ""
for i, p in enumerate(xueqiu_posts):
    stocks = p.get('stocks', [])
    stock_info = f"[涉及股票: {', '.join(stocks)}]" if stocks else ""
    combined += f"[帖子{i+1}] {p['time']} {stock_info}\n{p['text']}\n\n"

print(f"\n[1/2] DeepSeek分析 {len(xueqiu_posts)} 条帖子...")

headers = {
    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
    "Content-Type": "application/json"
}

today = datetime.datetime.now().strftime("%Y-%m-%d")

prompt = f"""分析以下雪球用户的帖子，提取所有具体的股票买卖观点。

返回JSON格式:
{{{{
  "views": [
    {{{{
      "stock_name": "股票名称",
      "stock_code": "股票代码(臻宝科技=SH688797, 富信科技=SH688662, 联瑞新材=SH688300, 不确定填null)",
      "direction": "买入/卖出/持有观望",
      "reason": "核心观点(15字内)",
      "target_price": null,
      "author": "专注做AI华仔",
      "source": "雪球",
      "date": "{today}"
    }}}}
  ]
}}}}

规则：
- "开仓"、"看好"、"看多" = 买入
- "减仓"、"底仓" = 持有观望或卖出
- 明确提到股票代码的优先用代码
- 只输出JSON

帖子内容：
{combined[:6000]}"""

payload = {
    "model": "deepseek-chat",
    "messages": [
        {"role": "system", "content": "专业股票观点提取助手，只输出JSON。"},
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
            analysis = json.loads(jm.group())
            print(json.dumps(analysis, ensure_ascii=False, indent=2))
            new_views = analysis.get("views", [])
        else:
            new_views = []
    else:
        print(f"API错误: {resp.text[:200]}")
        new_views = []
except Exception as e:
    print(f"错误: {e}")
    new_views = []

print(f"\n[2/2] 合并到系统...")

if new_views:
    try:
        with open(VIEWS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except:
        data = {"views": [], "fetch_time": ""}
    
    existing = set()
    for v in data.get("views", []):
        key = f"{v.get('author','')}|{v.get('stock_name','')}|{v.get('direction','')}|{v.get('date','')[:10]}"
        existing.add(key)
    
    added = 0
    for v in new_views:
        v["publish_date"] = v.get("date", "")
        v["source_name"] = "专注做AI华仔"
        key = f"{v.get('author','')}|{v.get('stock_name','')}|{v.get('direction','')}|{v.get('date','')[:10]}"
        if key not in existing:
            data["views"].append(v)
            existing.add(key)
            added += 1
    
    data["total_views"] = len(data["views"])
    data["fetch_time"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with open(VIEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  新增 {added} 条观点，共 {data['total_views']} 条")
else:
    print("  无新观点")

print("\n完成!")