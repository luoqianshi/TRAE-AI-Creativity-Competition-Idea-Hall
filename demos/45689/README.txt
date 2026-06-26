# 对称剪纸底稿生成器

## 启动方式

1. 创建虚拟环境并安装依赖：
```
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

2. 启动 Web 服务：
```
python src\server.py
```

3. 浏览器访问：http://127.0.0.1:5000

## 项目结构
- `src/server.py` — Flask 后端
- `src/static/index.html` — Web 界面
- `src/sector_crop.py` — 对称剖分
- `src/width_detect.py` — 宽度检测
- `src/connectivity_detect.py` — 连通性检测
- `src/colorize.py` — 线稿染色
- `presets/` — 测试图片
