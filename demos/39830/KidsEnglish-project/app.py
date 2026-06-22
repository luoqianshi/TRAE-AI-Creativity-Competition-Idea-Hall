"""
KidsEnglish 幼儿英语启蒙 - 桌面应用启动器
功能：启动本地 HTTP 服务器，自动打开浏览器
"""
import http.server
import threading
import webbrowser
import os
import sys
import tempfile
import zipfile
import time


def get_app_dir():
    """获取应用资源目录"""
    if getattr(sys, 'frozen', False):
        return os.path.join(sys._MEIPASS, 'app')
    else:
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')


def extract_resources():
    """如果资源是 zip 格式，解压到临时目录"""
    app_dir = get_app_dir()
    if os.path.isdir(app_dir) and os.path.exists(os.path.join(app_dir, 'index.html')):
        return app_dir

    zip_path = os.path.join(get_app_dir(), '..', 'app.zip')
    if not os.path.exists(zip_path):
        zip_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.zip')

    if os.path.exists(zip_path):
        temp_dir = tempfile.mkdtemp(prefix='KidsEnglish_')
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(temp_dir)
        return temp_dir

    return app_dir


def find_free_port(start=18899, max_tries=10):
    """查找可用端口"""
    for port in range(start, start + max_tries):
        try:
            test_server = http.server.HTTPServer(('127.0.0.1', port), http.server.SimpleHTTPRequestHandler)
            test_server.server_close()
            return port
        except OSError:
            continue
    return start


def open_browser(url):
    """跨平台打开浏览器"""
    import subprocess
    import platform

    system = platform.system()
    try:
        if system == 'Windows':
            subprocess.Popen(['start', 'chrome', '--new-window', url], shell=True)
        elif system == 'Darwin':
            subprocess.Popen(['open', '-a', 'Google Chrome', url], shell=False)
        else:
            browsers = [
                ['google-chrome', '--new-window', url],
                ['chromium-browser', '--new-window', url],
                ['firefox', '--new-window', url],
            ]
            for cmd in browsers:
                try:
                    subprocess.Popen(cmd, shell=False)
                    return
                except FileNotFoundError:
                    continue
            webbrowser.open(url, new=1)
    except Exception:
        webbrowser.open(url, new=1)


def main():
    app_dir = extract_resources()
    index_path = os.path.join(app_dir, 'index.html')

    if not os.path.exists(index_path):
        print("错误: 找不到 index.html")
        print("请确保 app 目录包含所有 HTML 文件")
        input("按回车键退出...")
        return

    port = find_free_port()
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.HTTPServer(('127.0.0.1', port), handler)

    os.chdir(app_dir)

    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    cache_bust = int(time.time())
    url = 'http://127.0.0.1:%d/index.html?_=%d' % (port, cache_bust)

    open_browser(url)

    print("KidsEnglish 幼儿英语启蒙已启动!")
    print("访问地址: " + url)
    print("关闭此窗口即可退出应用。")

    try:
        while True:
            input()
    except (EOFError, KeyboardInterrupt):
        pass

    httpd.shutdown()


if __name__ == '__main__':
    main()
