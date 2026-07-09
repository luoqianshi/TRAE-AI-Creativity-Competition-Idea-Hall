import os

html_head = '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">\n<title>家有小厨 - Web 预览</title>\n'

with open('web/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

html_body_start = '</style>\n</head>\n<body>\n<div id="app">\n  <div class="phone">\n    <div class="status-bar">\n      <span id="sb-time">9:41</span>\n      <span class="sb-icons">📶 🔋</span>\n    </div>\n    <div class="screen" id="screen"></div>\n    <nav class="tabbar" id="tabbar"></nav>\n  </div>\n</div>\n<script>\n'

with open('web/data.js', 'r', encoding='utf-8') as f:
    data = f.read()

with open('web/recipe-covers.js', 'r', encoding='utf-8') as f:
    covers = f.read()

with open('web/step-svgs.js', 'r', encoding='utf-8') as f:
    steps = f.read()

with open('web/app.js', 'r', encoding='utf-8') as f:
    app = f.read()

html_end = '</script>\n</body>\n</html>'

full = html_head + '<style>' + css + html_body_start + data + covers + steps + app + html_end

with open('家有小厨-单文件版.html', 'w', encoding='utf-8') as f:
    f.write(full)

print('Done! File size:', len(full))
