#!/usr/bin/env python3
"""
图媒适配文案分发工具 - 本地API服务
桥接红狐数据API，为前端提供小红书爆款笔记查询能力
"""

import http.server
import json
import os
import ssl
import subprocess
import sys
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

PORT = 8766
SKILL_SCRIPT = os.path.expanduser(
    "~/.trae-cn/builtin/work/default/skills/xhs-hotnotes/scripts/fetch_xhs_hot_articles.py"
)

# 场景关键词映射
SCENE_KEYWORDS = {
    "food": "美食探店",
    "cafe": "咖啡店",
    "travel": "旅行攻略",
    "shopping": "好物推荐",
    "lifestyle": "日常记录",
    "beauty": "美妆测评",
    "home": "家居好物",
    "pet": "萌宠日常",
}


class APIHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/hot-notes":
            self.handle_hot_notes(parsed.query)
        elif path == "/api/health":
            self.send_json({"status": "ok"})
        else:
            self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/analyze-image":
            self.handle_analyze_image()
        else:
            self.send_json({"error": "not found"}, 404)

    def handle_analyze_image(self):
        """接收前端上传的图片，调用豆包视觉模型进行真实识别"""
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0 or content_length > 10 * 1024 * 1024:
            self.send_json({"error": "图片数据无效或过大（限制10MB）"}, 400)
            return

        try:
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))
        except Exception:
            self.send_json({"error": "请求格式错误"}, 400)
            return

        image_data_url = data.get("image", "")
        if not image_data_url or not image_data_url.startswith("data:image"):
            self.send_json({"error": "缺少图片数据"}, 400)
            return

        api_key = os.environ.get("ARK_API_KEY", "")
        model = os.environ.get("ARK_MODEL", "doubao-1.5-vision-pro-32k")

        if not api_key:
            self.send_json({
                "error": "未配置ARK_API_KEY",
                "detail": "请在环境变量中设置ARK_API_KEY（火山引擎方舟API Key）"
            }, 500)
            return

        try:
            result = self._call_ark_vision(image_data_url, api_key, model)
            self.send_json(result)
        except urllib.error.HTTPError as e:
            error_body = ""
            try:
                error_body = e.read().decode("utf-8")[:300]
            except Exception:
                pass
            self.send_json({
                "error": f"豆包API调用失败（HTTP {e.code}）",
                "detail": error_body
            }, 502)
        except Exception as e:
            self.send_json({"error": f"AI识别失败: {str(e)}"}, 500)

    def _call_ark_vision(self, image_data_url, api_key, model):
        """调用火山引擎方舟（豆包）视觉模型，返回结构化识别结果"""
        url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

        prompt = """你是一个社交媒体图片分析专家。请分析这张图片，返回JSON格式的分析结果。

要求：
1. scene必须从以下选择：food（美食/餐厅）, cafe（咖啡店/甜品）, travel（旅行/景点）, shopping（好物/商品）, lifestyle（日常/生活）, beauty（美妆/穿搭）, home（家居/装修）, pet（萌宠/动物）
2. 识别图片中的关键元素（菜品名、产品名、景点名等具体名称）
3. 推测适合的文案关键词和地点类型
4. 推测人均价格或商品价格范围

只返回纯JSON，不要包含```或任何其他文字：
{"scene":"food","scene_label":"美食","objects":["水煮鱼","米饭"],"mood":"温馨热闹","keyword":"川菜","dishes":["水煮鱼"],"products":[],"location_type":"商场","price_range":"80-120","description":"餐桌上的美食照片"}"""

        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_data_url}}
                    ]
                }
            ],
            "max_tokens": 800,
            "temperature": 0.1,
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        # 设置SSL证书
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.load_verify_locations("/etc/ssl/cert.pem")

        with urllib.request.urlopen(req, timeout=45, context=ssl_ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"].strip()

            # 清理可能的markdown代码块包裹
            if content.startswith("```"):
                lines = content.split("\n")
                content = "\n".join(lines[1:])
                if content.rstrip().endswith("```"):
                    content = content.rstrip()[:-3].strip()

            return json.loads(content)

    def handle_hot_notes(self, query_string):
        params = urllib.parse.parse_qs(query_string)
        scene = params.get("scene", ["food"])[0]
        keyword = params.get("keyword", [SCENE_KEYWORDS.get(scene, "美食探店")])[0]

        # 计算起始日期（最近30天，获取更多数据）
        from datetime import datetime, timedelta
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

        env = os.environ.copy()
        env["REDFOX_API_KEY"] = os.environ.get("REDFOX_API_KEY", "")
        env["SSL_CERT_FILE"] = "/etc/ssl/cert.pem"

        # 对多个关键词分别搜索，合并去重
        keywords = [k.strip() for k in keyword.split(",") if k.strip()]
        if not keywords:
            keywords = [SCENE_KEYWORDS.get(scene, "美食探店")]

        all_items = []
        seen_links = set()

        try:
            for kw in keywords:
                try:
                    result = subprocess.run(
                        [
                            sys.executable,
                            SKILL_SCRIPT,
                            "--keyword", kw,
                            "--start-date", start_date,
                            "--page-size", "50",
                        ],
                        capture_output=True,
                        text=True,
                        env=env,
                        timeout=25,
                    )

                    if result.returncode == 0 and result.stdout.strip():
                        data = json.loads(result.stdout)
                        for item in data.get("items", []):
                            link = item.get("noteLink", "")
                            if link and link not in seen_links:
                                seen_links.add(link)
                                all_items.append(item)
                    elif result.stdout.strip():
                        try:
                            data = json.loads(result.stdout)
                            for item in data.get("items", []):
                                link = item.get("noteLink", "")
                                if link and link not in seen_links:
                                    seen_links.add(link)
                                    all_items.append(item)
                        except json.JSONDecodeError:
                            pass
                except (subprocess.TimeoutExpired, json.JSONDecodeError, Exception):
                    continue

            # 按互动数排序，取前25条
            all_items.sort(key=lambda x: self._parse_interactions(x.get("interactiveCount", "0")), reverse=True)
            self.send_json(self._format_notes({"items": all_items[:25]}, keyword))

        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    def _parse_interactions(self, s):
        """解析互动数字符串，如 '3w+' -> 30000"""
        if not s:
            return 0
        s = str(s).replace("+", "").strip()
        if "w" in s.lower():
            return int(float(s.lower().replace("w", "")) * 10000)
        if "k" in s.lower():
            return int(float(s.lower().replace("k", "")) * 1000)
        try:
            return int(s)
        except ValueError:
            return 0

    def _format_notes(self, data, keyword):
        """提取关键字段返回给前端"""
        items = []
        for item in data.get("items", [])[:25]:
            items.append({
                "title": item.get("title", ""),
                "author": item.get("authorNickname", ""),
                "interactions": item.get("interactiveCount", ""),
                "link": item.get("noteLink", ""),
                "date": item.get("createTime", "")[:10],
                "desc": (item.get("desc", "") or "")[:200],
            })
        return {
            "keyword": keyword,
            "total": data.get("total", 0),
            "items": items,
            "relatedSearches": [r.get("keyword", "") for r in data.get("relatedSearches", [])][:5],
        }

    def send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, format, *args):
        pass  # 静默日志


def main():
    server = http.server.HTTPServer(("127.0.0.1", PORT), APIHandler)
    print(f"API server running on http://127.0.0.1:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
