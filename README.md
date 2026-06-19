# TRAE AI 创造力大赛 · 灵感 Demo Hall

*「每天自动汇总大赛报名专区的创意产物，一键在线体验每一个 HTML Demo。」*

一个纯静态的 Demo 展示网站，自动从 [TRAE 中文社区](https://forum.trae.cn) 大赛报名专区爬取所有灵感帖，提取 HTML Demo 附件，以卡片形式分类展示。不依赖后端服务，GitHub Pages 零成本托管，TRAE 定时任务每日自动更新。

**你看到的数据，都是实时的。** 每天爬虫从论坛 API 拉取最新帖子，下载 Demo 文件，重新生成静态页面，推送到 GitHub Pages。从发帖到上线，全程无人干预。

[在线访问](https://luoqianshi.github.io/TRAE-AI-Creativity-Competition-Idea-Hall) · [前往社区报名](https://forum.trae.cn/c/38-category/40-category/40) · [TRAE 官网](https://www.trae.cn)

## 当前数据

| 维度 | 数量 |
|---|---|
| 总报名帖 | **628** |
| 含 HTML Demo | **457** |
| 暂无 Demo | **171** |
| 生活娱乐 | 210 |
| 学习工作 | 257 |
| 社会服务 | 105 |
| 社会公益 | 101 |
| 硬件交互 | 22 |

> 数据更新时间：2026-06-19 · 来源：[forum.trae.cn 大赛报名专区](https://forum.trae.cn/c/38-category/40-category/40)

## 功能特性

**自动爬取**
- 通过 Discourse API 获取大赛报名专区（Category ID: 39）的所有帖子
- 三层 Demo 提取策略：HTML 附件 > Onebox 外部链接 > 关键词上下文兜底
- 增量更新：只处理新增帖子，已有帖子跳过（支持 `--force` 全量重建）
- 无 Demo 的帖子同样记录在册，卡片按钮置灰显示「暂无 Demo」

**分类展示**
- 按五大赛道自动分类：生活娱乐、学习工作、社会服务、硬件交互、社会公益
- 支持按赛道筛选、关键词搜索、按时间/浏览量/点赞数排序
- 每张卡片展示标题、摘要、浏览量、点赞数、作者

**在线体验**
- HTML Demo 在新窗口直接打开，无需下载
- 社区原帖链接一键跳转
- 所有 Demo 文件以相对路径部署，兼容 GitHub Pages 子路径

**TRAE 深色科技风 UI**
- 纯黑底色 + 荧光绿（`#22c55e`）强调色
- Canvas 2D 粒子动画背景，支持鼠标交互
- 赛道图标从 TRAE 官网提取，SVG 图标替换 emoji
- 响应式布局，移动端适配

## 技术架构

```
TRAE 定时任务（每日 10:00）
    │
    ▼
Python 爬虫（Discourse API）
    ├── 获取帖子列表 → 增量比对
    ├── 提取 Demo 附件/链接
    ├── 下载 HTML 文件到 demos/
    └── 更新 data/demos.json
    │
    ▼
Jinja2 模板渲染
    └── 生成 index.html（纯静态）
    │
    ▼
Git push → GitHub Actions → GitHub Pages
```

**技术选型理由**：纯静态生成（SSG），没有服务器、没有数据库、没有运行时依赖。GitHub Pages 免费托管，域名自带 HTTPS。爬虫和渲染在 TRAE 定时任务里跑，push 触发 Actions 自动部署。整条链路成本为零。

## 仓库结构

```
TRAE-AI-Creativity-Competition-Idea-Hall/
├── index.html              # 生成的静态首页（Git 追踪）
├── styles.css             # TRAE 深色科技风样式
├── script.js              # 粒子动画、筛选、搜索、排序
├── templates/
│   └── index.html.j2       # Jinja2 模板
├── crawler/
│   ├── crawler.py          # 爬虫主程序（爬取 + 渲染 + Git 推送）
│   ├── config.json         # 爬虫配置
│   └── requirements.txt    # Python 依赖
├── data/
│   └── demos.json          # 所有帖子的结构化数据
├── demos/                  # 下载的 HTML Demo 文件（按 topic_id 分目录）
├── assets/
│   ├── trae-work.png       # Logo & Favicon
│   ├── icons/              # SVG 图标（eye/heart/user/play/external）
│   └── tracks/             # 赛道图标 PNG（5 赛道 × default/active）
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署配置
└── README.md
```

## 本地开发

```bash
# 安装依赖
cd crawler
pip install -r requirements.txt

# 增量爬取（只处理新增帖子）
python crawler.py

# 全量重建（重新处理所有帖子）
python crawler.py --force

# 仅渲染（不爬取，用现有数据重新生成 index.html）
python -c "from crawler.crawler import DemoHallCrawler; DemoHallCrawler().render()"

# 本地预览
cd ..
python -m http.server 8889
# 打开 http://localhost:8889
```

## 自动更新机制

### TRAE 定时任务

每日 10:00（北京时间）自动执行爬虫，增量拉取新帖子并推送到 GitHub：

```
cron: 0 10 * * *
```

### GitHub Actions

每次 push 到 `main` 分支自动触发部署到 GitHub Pages：

- `actions/checkout@v4` → 拉取代码
- `actions/upload-pages-artifact@v3` → 上传静态资源
- `actions/deploy-pages@v4` → 部署

### Demo 提取策略

| 优先级 | 策略 | 说明 |
|---|---|---|
| 1 | HTML 附件 | Discourse `<a class="attachment">` 标签中的 .html/.htm 文件 |
| 2 | Onebox 链接 | Discourse 自动生成的外部链接预览卡片 |
| 3 | 关键词兜底 | 帖子正文中包含 demo/体验/预览/产物/在线 的外部链接 |

## 作者

[@骆谦实](https://forum.trae.cn/u/%E9%AA%86%E8%B0%A6%E5%AE%9E/summary) · TRAE 中文社区

## License

MIT
