#!/usr/bin/env python3
"""双色球对奖助手 - 本地服务器（含API代理）
用法: python3 server.py [端口号]
默认端口: 8000

功能:
1. 提供静态文件服务（HTML、JSON、CSS、JS）
2. 提供 /api/latest 代理接口，从福彩官网获取最新开奖数据
3. 自动更新 ssq_data.json 数据库
"""

import http.server
import json
import os
import ssl
import sys
import urllib.request
import urllib.parse


class SSQHandler(http.server.SimpleHTTPRequestHandler):
    """自定义HTTP请求处理器，增加API代理端点"""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API代理：获取最新开奖数据
        if path == '/api/latest':
            self.handle_api_latest()
            return

        # 默认：提供静态文件服务
        super().do_GET()

    def handle_api_latest(self):
        """从福彩官网获取最新开奖数据并返回"""
        try:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            url = 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount=10'
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Referer': 'https://www.cwl.gov.cn/'
            })
            resp = urllib.request.urlopen(req, context=ctx, timeout=15)
            data = json.loads(resp.read().decode('utf-8'))

            if data.get('state') == 0 and data.get('result'):
                # 读取本地数据库，合并新数据
                db_path = os.path.join(os.path.dirname(__file__), 'ssq_data.json')
                try:
                    with open(db_path, 'r', encoding='utf-8') as f:
                        db = json.load(f)
                    existing = set(d['code'] for d in db)
                    new_count = 0
                    for item in data['result']:
                        code = item['code']
                        if code not in existing:
                            db.append({
                                'code': code,
                                'date': item['date'].split('(')[0],
                                'red': item['red'],
                                'blue': item['blue']
                            })
                            new_count += 1
                    if new_count > 0:
                        db.sort(key=lambda x: x['code'])
                        with open(db_path, 'w', encoding='utf-8') as f:
                            json.dump(db, f, ensure_ascii=False, indent=2)
                        print(f"数据库已更新: +{new_count}期, 共{len(db)}期 ({db[0]['code']}-{db[-1]['code']})")
                except Exception as e:
                    print(f"数据库更新失败: {e}")

                # 返回最新数据给前端
                result = []
                for item in data['result']:
                    result.append({
                        'code': item['code'],
                        'date': item['date'].split('(')[0],
                        'red': item['red'],
                        'blue': item['blue']
                    })

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
                return

            self.send_error(502, 'API返回数据异常')
        except Exception as e:
            print(f"API代理错误: {e}")
            self.send_error(502, f'API代理失败: {str(e)}')

    def log_message(self, format, *args):
        # 简化日志输出
        if '/api/latest' in str(args):
            print(f"[API] 获取最新数据请求")
        else:
            super().log_message(format, *args)


def main():
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"错误: 无效端口号 '{sys.argv[1]}'")
            sys.exit(1)

    # 切换到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    server = http.server.HTTPServer(('0.0.0.0', port), SSQHandler)
    print(f"双色球对奖助手服务器已启动")
    print(f"访问地址: http://127.0.0.1:{port}/ssq_v1.6.html")
    print(f"API代理:  http://127.0.0.1:{port}/api/latest")
    print(f"按 Ctrl+C 停止服务器")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.server_close()


if __name__ == '__main__':
    main()