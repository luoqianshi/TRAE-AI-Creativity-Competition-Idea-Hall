# TRAE AI 创造力大赛 · 灵感 Demo Hall

*「每天自动汇总大赛报名专区的创意产物，一键在线体验每一个 HTML Demo。」*

一个纯静态的 Demo 展示网站，自动从 [TRAE 中文社区](https://forum.trae.cn) 大赛报名专区爬取所有灵感帖，提取 HTML Demo 附件，以卡片形式分类展示。不依赖后端服务，GitHub Pages 零成本托管，TRAE 定时任务每日自动更新。

**你看到的数据，都是实时的。** 每天爬虫从论坛 API 拉取最新帖子，下载 Demo 文件，重新生成静态页面，推送到 GitHub Pages。从发帖到上线，全程无人干预。

[在线访问](https://luoqianshi.github.io/TRAE-AI-Creativity-Competition-Idea-Hall) · [灵感孵化舱](https://trae-idea-incubator.netlify.app/) · [前往社区报名](https://forum.trae.cn/c/38-category/40-category/40) · [大赛官网](https://www.trae.cn/ai-creativity?utm_source=community)

---

## 当前数据

| 维度 | 数量 |
|---|---|
| 总报名帖 | **23,388** |
| 含 HTML Demo | **19,266** |
| 官方审核通过 | **19,385** |
| 暂无 Demo / 未审核 | **4,003** |
| 学习工作 | 7,637 |
| 生活娱乐 | 5,603 |
| 社会服务 | 3,000 |
| 社会公益 | 2,555 |
| 硬件交互 | 769 |
| 野蛮生长（未分类） | 1,071 |
| 已生成 Insight 洞见 | 17,022 |

> 数据更新时间：2026-07-07 · 来源：[forum.trae.cn 大赛报名专区](https://forum.trae.cn/c/38-category/40-category/40) + 飞书官方审核名单（6月16日 + 6月18日 + 6月22日 + 6月23日 + 6月24日 + 6月25日 + 6月26日 + 6月29日 + 6月30日 + 7月1日 + 7月2日 + 7月3日 + 7月6日）

---

## 功能特性

### 自动爬取

- 通过 **Discourse API** 获取大赛报名专区（Category ID: 39）的所有帖子
- **双数据源策略（v2）**：以飞书多维表格审批名单为主数据源，Discourse API 为补充，确保已审核项目优先收录
- **四层 Demo 提取策略**：HTML 附件 > ZIP 附件（解压提取）> Onebox 外部链接 > 关键词上下文兜底
- **增量更新**：只处理新增帖子，已有帖子跳过（支持 `--force` 全量重建）
- **重新检查**：`--recheck` 模式仅对当前无 Demo 的帖子重新爬取，发现遗漏的 ZIP 等附件
- 无 Demo 的帖子同样记录在册，卡片按钮置灰显示「暂无 Demo」
- 每 100 条记录自动保存检查点，防止中断丢失数据

### Insight 洞见生成

- **规则引擎**：基于 title + excerpt 自动为每张卡片生成一句话洞见（平均 26 字），无需外部 API
- **四层提取策略**（按优先级）：
  1. 提取「想解决什么问题」后的核心描述
  2. 提取「创意介绍」后的项目说明
  3. 取 excerpt 中第一个有意义的句子
  4. 从 title 中提取副标题（`——` 后的部分）或整个标题
- **文本清洗**：自动去除 HTML 标签、Discourse 格式标记（`【标题】`、`【标签】`、`【正文】`）、赛道前缀、填充词等噪音
- **质量保障**：截断至 60 字符，赛道前缀残留率 0%，仅 2 条回退为「暂无简介」
- 已集成到爬虫渲染管线，每次爬取自动执行

### 分类展示

- 按五大赛道自动分类：生活娱乐、学习工作、社会服务、硬件交互、社会公益，无法识别的帖子归入「野蛮生长」
- **赛道推断**：对无标签帖子，通过标题/摘要关键词匹配自动推断赛道（96.4% 成功率）
- 支持按赛道筛选、关键词搜索（标题 + 洞见 + 摘要）、按时间/浏览量/点赞数排序
- **审核状态筛选**：Toggle 开关切换「仅展示官方审核通过」/「展示全部」
- **已删除帖子过滤**：自动识别「话题已被作者删除」的帖子，前端不展示
- 每张卡片展示赛道图标、标题、一句话洞见、浏览量、点赞数、作者、审核标记

### 在线体验

- HTML Demo 在新窗口直接打开，无需下载
- 社区原帖链接一键跳转
- 所有 Demo 文件以相对路径部署（`demos/{topic_id}/xxx.html`），兼容 GitHub Pages 子路径

### 前端性能优化

- **数据外置**：卡片数据从 HTML 内联移至 `data/demos.min.js`（约 6.9MB），index.html 仅 6.3KB 骨架
- **数据字段精简**：前端数据文件仅包含渲染必需字段（移除 excerpt），体积减少 39%
- **手动加载更多**：首屏渲染 50 张卡片，底部「加载更多」按钮手动触发下一批（每批 50 张）
- **DOM 回收**：卡片超过 200 张时自动移除顶部批次（保留 150 张缓冲），保持 DOM 轻量
- **数据层过滤**：搜索/排序/标签筛选在 JS 数组上完成（O(n)），不操作 DOM
- **CSS 渲染优化**：`content-visibility: auto` 跳过离屏卡片渲染，`contain-intrinsic-size` 预留空间
- **Gzip 压缩**：GitHub Pages 自动启用 Gzip，传输体积压缩至原始大小的 23%

### TRAE 深色科技风 UI

- 纯黑底色（`#0a0a0a`）+ 荧光绿（`#22c55e`）强调色
- **Canvas 2D 粒子动画背景**：60 个粒子 + 距离连线 + 鼠标交互（150px 范围内高亮连线）
- 毛玻璃导航栏（`backdrop-filter: blur(14px)`），滚动后加深背景
- 赛道图标使用语义化 SVG（奖杯/书本/用户群/网格/爱心/发芽），内联渲染
- 浏览量/点赞/作者/按钮均使用自定义荧光绿 SVG 图标（非 emoji）
- **Hero 区域**：大赛横幅图 + 非官方提醒条 + 灵感孵化舱/大赛官网链接
- 响应式布局，移动端适配
- 卡片滚动入场动画（IntersectionObserver + 逐张延迟 30ms）

---

## 技术架构

```
TRAE 定时任务（每日 4:00 北京时间）
    │
    ▼
Python 爬虫（双数据源）
    ├── Step 1: 加载飞书多维表格审批名单（data/approved_projects.json）
    ├── Step 2: 逐个处理审批项目，通过 Discourse API 补充元数据
    │           ├── 提取 Demo 附件/链接（四层策略，含 ZIP 解压）
    │           ├── 下载 HTML 文件到 demos/{topic_id}/
    │           └── 标记 approved: True
    ├── Step 3: 爬取 Discourse API 获取未审批的新帖子
    │           └── 标记 approved: False
    └── 更新 data/demos.json（每 100 条自动保存）
    │
    ▼
Jinja2 模板渲染
    ├── 生成 index.html（骨架 HTML，约 6.3KB）
    ├── 生成 data/demos.min.js（前端数据文件，约 6.9MB）
    │   └── 含 insight 洞见字段（规则引擎自动生成）
    └── Insight 生成（规则引擎，无外部 API 依赖）
    │
    ▼
Git push → GitHub Actions → GitHub Pages
    │
    ▼
浏览器加载
    ├── index.html（骨架）+ styles.css
    ├── data/demos.min.js（17,022 条卡片数据）
    └── script.js（手动加载 + 筛选 + 搜索 + 排序）
```

**技术选型理由**：纯静态生成（SSG），没有服务器、没有数据库、没有运行时依赖。GitHub Pages 免费托管，域名自带 HTTPS。爬虫和渲染在 TRAE 定时任务里跑，push 触发 Actions 自动部署。整条链路成本为零。

---

## 技术实现细节

### 1. 爬虫架构（crawler/crawler.py & crawler_v2.py）

爬虫采用面向对象设计，由四个核心类组成：

#### DiscourseClient — API 客户端

- 封装 Discourse 论坛 REST API，带**限速和指数退避重试**
- 每次请求间隔 1.5s（`rate_limit_delay`），最多重试 5 次，退避基数 2，上限 8s
- 遇到 HTTP 429 时读取 `Retry-After` 头动态等待
- 超时设置：API 请求 15s，文件下载 60s
- 核心方法：
  - `get_category_topics(page)` — 分页获取分类帖子列表
  - `get_topic_detail(topic_id)` — 获取帖子详情（含 cooked HTML 正文）
  - `download_file(url, dest_path, max_size_mb)` — 流式下载，支持自定义大小限制（HTML 5MB / ZIP 10MB）

#### DemoExtractor — Demo 资源提取器

从 Discourse 帖子的 `cooked` HTML 中提取 Demo，采用**四层优先级策略**：

| 优先级 | 策略 | 实现方式 | 说明 |
|---|---|---|---|
| 1 | HTML 附件 | 解析 `<a class="attachment">` | 提取 `.html/.htm` 后缀的附件链接 |
| 1b | ZIP 附件 | 解析 `<a class="attachment">` | 提取 `.zip` 后缀附件，下载后解压并查找 HTML 文件 |
| 2 | Onebox 链接 | 解析 `<aside class="onebox">` | 提取 Discourse 自动生成的外部链接预览卡片 |
| 3 | 关键词兜底 | 遍历 `<a>` 标签 + 父元素文本匹配 | 查找父元素包含 demo/体验/预览/产物/在线 的外部链接 |

URL 校验规则：
- 排除域名：`github.com`、`bilibili.com`、`forum.trae.cn`、`trae-forum-cdn.trae.com.cn`
- 排除论坛内部链接（含 `/t/topic/`）
- 去除 `www.` 前缀后匹配

#### DataManager — 数据管理器

管理 `demos.json` 的读写，核心特性：
- **增量更新**：通过 `get_existing_ids()` 返回已有 topic_id 集合，跳过已处理帖子
- **合并写入**：`add_or_update()` 采用合并模式，新数据只覆盖非 None 字段，保留已有字段不被覆盖
- **自动统计**：`save()` 时自动计算 `total_count`、`approved_count`、`unapproved_count`
- **归档机制**：支持 `archived` 标记，`get_active_demos()` 返回非归档帖子并按时间倒序排列

#### DemoHallCrawler — 主编排器

串联整个爬取-提取-下载-渲染流程：

**v1（crawler.py）**：纯 Discourse API 单数据源，分页遍历 Category 39 所有帖子

**v2（crawler_v2.py）**：双数据源策略
1. 加载飞书多维表格审批名单作为主数据源（`data/approved_projects.json`）
2. 逐个处理审批项目，调用 Discourse API 补充元数据（浏览量、标签、摘要等）
3. 再爬 Discourse API 获取不在审批列表中的额外帖子（捕获尚未审批的新帖）
4. 降级方案：审批名单不存在时回退到纯 Discourse 模式

**新增方法**：
- `_download_and_process_attachment(demo_info, topic_id, record)` — 统一处理 HTML 和 ZIP 附件下载
  - ZIP 类型：下载 ZIP → 解压到 `demos/{topic_id}/` → 删除 ZIP 文件 → 查找 HTML 文件（优先 `index.html`）
  - HTML 类型：直接下载到 `demos/{topic_id}/`
- `recheck_no_demo()` — 仅重新检查 `has_demo: false` 的帖子，用于发现遗漏的 ZIP 附件等

### 2. 数据结构（data/demos.json）

```json
{
  "last_updated": "2026-06-25T17:46:17.811572+00:00",
  "total_count": 17022,
  "approved_count": 12524,
  "unapproved_count": 4498,
  "demos": [
    {
      "topic_id": 34392,
      "title": "MIND SPACE 心情日记",
      "forum_url": "https://forum.trae.cn/t/topic/34392",
      "author": "username",
      "created_at": "2026-06-19T09:16:36.232Z",
      "tags": ["生活娱乐", "社会公益"],
      "views": 128,
      "like_count": 5,
      "excerpt": "帖子摘要文本...",
      "insight": "城市居民家中大量闲置物品堆积占空间，线下置换渠道少、信息不互通",
      "cover_image": "https://...",
      "approved": true,
      "approved_source": "lark_bitable",
      "demo_type": "attachment",
      "demo_file": "/absolute/path/to/demos/34392/demo.html",
      "demo_url": "demos/34392/demo.html",
      "external_url": null,
      "has_demo": true,
      "archived": false
    }
  ]
}
```

关键字段说明：
- `approved` / `approved_source`：审核状态及来源（`lark_bitable` 或 null）
- `demo_type`：`attachment`（本地下载）/ `external`（外部链接）/ `null`（无 Demo）
- `demo_url`：相对路径，用于网页引用（兼容 GitHub Pages）
- `demo_file`：本地绝对路径，用于爬虫内部管理
- `insight`：规则引擎生成的一句话洞见（平均 26 字），前端卡片展示优先使用

### 3. 模板渲染（templates/index.html.j2）

使用 Jinja2 模板引擎，渲染时传入：
- `demos`：所有非归档帖子列表（按时间倒序）
- `stats`：统计字典（总数 + 各赛道数量）
- `track_tags`：赛道标签映射
- `last_updated`：最后更新时间

模板结构（骨架模式）：
- **Disclaimer 提醒条**：非官方网站声明（可关闭）
- **大赛横幅**：全宽 promotional banner 图片（可关闭）
- **Hero 区域**：项目标题 + 描述 + CTA 按钮（灵感孵化舱 + 大赛官网）+ 统计数字（总作品 + 五赛道）
- **Filter Bar**：赛道标签筛选 + 排序下拉 + 审核状态 Toggle
- **Cards Grid**：空容器 `<div id="cards-grid">`，由 JS 动态填充
- **Loading / No Results**：加载指示器和无结果提示（由 JS 控制显隐）
- **Footer**：数据来源 + 作者链接 + 更新时间

渲染输出两个文件：
- `index.html`：骨架 HTML（约 6.3KB），不含卡片数据
- `data/demos.min.js`：前端数据文件（约 6.9MB），格式为 `window.DEMOS_DATA = [...]`，仅包含前端所需字段（topic_id, title, insight, tags, views, like_count, author, created_at, demo_url, external_url, has_demo, approved）

### 4. 前端交互（script.js）

全部原生 JavaScript，无框架依赖，由五个模块组成：

#### 数据清洗与初始化
- **HTML 属性转义**：`escapeAttr()` 防止双引号等特殊字符破坏 `data-*` 属性
- **HTML 标签剥离**：`stripHTML()` 移除 Discourse 渲染残留的 HTML 标签和实体
- **已删除帖子过滤**：正则匹配「话题已被作者删除」，从数据数组中移除
- **空标签补全**：无赛道标签的帖子自动归入「野蛮生长」

#### 粒子动画系统
- Canvas 2D 实现，60 个粒子，随机位置/速度/半径
- **粒子连线**：距离 < 120px 的粒子间绘制半透明绿色连线（opacity 随距离线性衰减，最大 0.2）
- **鼠标交互**：距离 < 150px 的粒子与鼠标位置连线（opacity 最大 0.3，线宽 0.8）
- 使用 `requestAnimationFrame` 驱动动画循环，窗口 resize 自适应
- 延迟 500ms 启动，避免与初始渲染竞争

#### 导航栏与 Banner
- 监听 `scroll` 事件，滚动超过 50px 时添加 `.scrolled` 类加深背景透明度
- Banner 关闭按钮：点击后隐藏横幅图，状态不持久化

#### 手动加载引擎
- **数据驱动渲染**：从 `window.DEMOS_DATA` 读取数据，通过 `createCardHTML()` 生成卡片 HTML 字符串
- **分批渲染**：每批 50 张（`BATCH_SIZE`），使用 `DocumentFragment` 批量插入 DOM
- **手动触发**：底部「加载更多」按钮点击后调用 `loadMore()`，无自动滚动
- **DOM 回收**：卡片超过 200 张（`MAX_DOM_CARDS`）时移除顶部多余卡片，保留 150 张缓冲（`BUFFER_CARDS`）
- **入场动画**：`IntersectionObserver`（阈值 0.1）逐张添加 `.visible` 类，每张延迟 30ms
- **按钮状态**：
  - **可加载**：绿色边框，显示「加载更多（已加载 50 / 12350）」
  - **加载中**：灰色 + 旋转 spinner + 「加载中...」，按钮禁用
  - **已完成**：灰色半透明 + 「已展示全部 12350 个作品」，按钮禁用

#### 筛选 / 搜索 / 排序
- **数据层过滤**：在 JS 数组上完成（O(n)），不操作 DOM
- **赛道筛选**：点击 tag-pill 切换 active 状态，按 `tags` 数组过滤
- **关键词搜索**：300ms 防抖，匹配 `title` + `insight`（大小写不敏感）
- **排序**：支持最新发布（`created_at`）、最多浏览（`views`）、最多点赞（`like_count`）
- **审核筛选**：Toggle 开关控制 `approved` 字段过滤（默认仅展示审核通过）
- 过滤/排序后调用 `setFilteredDemos()` 重新渲染，清空网格并从头加载

### 5. 样式体系（styles.css）

CSS 变量驱动的设计系统：

| 类别 | 变量 | 值 | 用途 |
|---|---|---|---|
| 背景 | `--bg-base` | `#0a0a0a` | 页面底色 |
| 背景 | `--bg-card` | `#18181b` | 卡片背景 |
| 背景 | `--bg-tag` | `#27272a` | 标签/筛选栏 |
| 强调 | `--accent` | `#22c55e` | 荧光绿主色 |
| 强调 | `--accent-glow` | `rgba(34,197,94,0.35)` | 发光效果 |
| 文字 | `--text-primary` | `#ffffff` | 主标题 |
| 文字 | `--text-secondary` | `#a1a1aa` | 摘要/描述 |
| 布局 | `--container` | `1280px` | 最大内容宽度 |
| 布局 | `--radius-card` | `16px` | 卡片圆角 |

字体栈：
- 无衬线：`Inter` → `SF Pro Display` → `PingFang SC` → `Microsoft YaHei` → 系统字体
- 等宽：`JetBrains Mono` → `SF Mono` → `Menlo` → `Consolas`

性能相关样式：
- `.card`：`content-visibility: auto` + `contain-intrinsic-size: 0 300px`，跳过离屏卡片渲染
- `.card`：`transition` 仅对 `opacity`、`transform`、`border-color`、`box-shadow` 启用（避免 layout thrashing）
- `.load-more-btn`：绿色边框按钮，hover 填充，三种状态（可加载/加载中/已完成）

### 6. CI/CD 部署（.github/workflows/deploy.yml）

标准 GitHub Pages 部署流程：

```yaml
触发条件: push 到 main 分支 / 手动 workflow_dispatch
权限: contents:read, pages:write, id-token:write
并发控制: group: pages, cancel-in-progress: false
步骤:
  1. actions/checkout@v4        — 拉取代码
  2. actions/configure-pages@v4  — 配置 Pages 环境
  3. actions/upload-pages-artifact@v3 — 上传整个仓库根目录
  4. actions/deploy-pages@v4     — 部署到 GitHub Pages
```

### 7. 爬虫配置（crawler/config.json）

```json
{
  "forum_url": "https://forum.trae.cn",
  "category_id": 39,
  "api_base": "https://forum.trae.cn",
  "posts_per_page": 30,
  "rate_limit_delay": 1.5,
  "max_retries": 5,
  "retry_backoff_base": 2,
  "max_html_file_size_mb": 5,
  "max_zip_file_size_mb": 10,
  "exclude_domains": ["github.com", "bilibili.com", "forum.trae.cn", "trae-forum-cdn.trae.com.cn"],
  "demo_keywords": ["demo", "体验", "预览", "产物", "在线"]
}
```

---

## 仓库结构

```
TRAE-AI-Creativity-Competition-Idea-Hall/
├── index.html                          # 生成的骨架首页（约 6.3KB）
├── styles.css                          # TRAE 深色科技风样式（CSS 变量体系，约 14.7KB）
├── script.js                           # 前端交互（手动加载/筛选/搜索/排序/加载更多，约 22.3KB）
├── plan.md                             # 加载与访问效率优化方案
├── templates/
│   └── index.html.j2                   # Jinja2 模板
├── crawler/
│   ├── crawler.py                      # 爬虫 v1（单数据源：Discourse API）
│   ├── crawler_v2.py                   # 爬虫 v2（双数据源：飞书审批 + Discourse API + Insight 生成）
│   ├── config.json                     # 爬虫配置（API 地址/限速/赛道标签/排除域名）
│   └── requirements.txt                # Python 依赖（requests + beautifulsoup4 + jinja2）
├── data/
│   ├── demos.json                       # 所有帖子的结构化数据（17,022 条，含 insight 字段）
│   ├── demos.min.js                    # 前端数据文件（仅含渲染所需字段，约 6.9MB）
│   └── approved_projects.json          # 飞书多维表格审批数据源（13,144 条，6月16日-25日共6批）
├── demos/                              # 下载的 HTML Demo 文件（按 topic_id 分目录，约 3.8GB / 32,008 文件）
├── prompts/
│   └── update.md                       # 自动更新提示词（供 TRAE Work 定时执行）
├── assets/
│   ├── trae-logo.png                    # Logo & Favicon
│   ├── banner.webp                     # 大赛横幅图（WebP，48KB）
│   ├── icons/                          # SVG 图标（eye/heart/user/play/external 等 16 个）
│   └── tracks/                         # 赛道图标 SVG（5 赛道 + 野蛮生长，内联渲染）
├── .github/
│   └── workflows/
│       └── deploy.yml                   # GitHub Actions 部署配置
└── README.md
```

---

## 本地开发

```bash
# 安装依赖
cd crawler
pip install -r requirements.txt

# 增量爬取（只处理新增帖子，推荐）
python crawler_v2.py

# 全量重建（重新处理所有帖子）
python crawler_v2.py --force

# 重新检查无 Demo 的帖子（发现遗漏的 ZIP 附件等）
python crawler_v2.py --recheck

# 仅渲染（不爬取，用现有数据重新生成 index.html + demos.min.js）
python -c "from crawler.crawler_v2 import DemoHallCrawler; DemoHallCrawler().render()"

# 批量生成 Insight 洞见（独立脚本，读取 demos.json 写入 insight 字段）
python scripts/generate_insights.py

# 本地预览
cd ..
python -m http.server 8889
# 打开 http://localhost:8889
```

---

## 自动更新机制

### TRAE 定时任务

每日 4:00（北京时间）自动执行爬虫 v2，增量拉取新帖子并推送到 GitHub：

```
cron: 0 4 * * *
```

### 自动更新提示词

`prompts/update.md` 中包含完整的自动化更新流程提示词，可直接交给 TRAE Work 执行。涵盖从飞书 Wiki 获取审核名单、数据爬取、静态站点渲染到 Git 推送部署的完整六步流程，支持增量更新（跳过已爬取数据）和审核状态遗漏检查。

### GitHub Actions

每次 push 到 `main` 分支自动触发部署到 GitHub Pages：

- `actions/checkout@v4` → 拉取代码
- `actions/upload-pages-artifact@v3` → 上传静态资源
- `actions/deploy-pages@v4` → 部署

### Demo 提取策略

| 优先级 | 策略 | 说明 |
|---|---|---|
| 1 | HTML 附件 | Discourse `<a class="attachment">` 标签中的 .html/.htm 文件 |
| 1b | ZIP 附件 | Discourse `<a class="attachment">` 标签中的 .zip 文件，下载后解压并提取 HTML |
| 2 | Onebox 链接 | Discourse 自动生成的外部链接预览卡片 |
| 3 | 关键词兜底 | 帖子正文中包含 demo/体验/预览/产物/在线 的外部链接 |

---

## 作者

[@骆谦实](https://forum.trae.cn/u/%E9%AA%86%E8%B0%A6%E5%AE%9E/summary) · TRAE 中文社区

## License

MIT
