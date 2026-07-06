# TRAE Idea Hall 视觉升级 + Demo 截图卡片改造

**日期**: 2026-07-06
**状态**: 已确认，待实现

## 背景与目标

当前 TRAE AI 创造力大赛灵感 Demo Hall 网站采用深色科技风 + 荧光绿配色，功能完整但视觉精致度有提升空间。本次升级旨在：

1. 在保留 TRAE 官方品牌元素（Logo、配色基调）的前提下提升视觉高级感
2. 将默认筛选模式从「最多浏览」改为「最新发布」
3. 重新设计 Hero 板块为全宽沉浸式布局
4. 用 Demo 首屏截图替代卡片中的文字简介，提升浏览体验

## 已确认的设计决策

| 决策点 | 选择 |
|--------|------|
| 截图覆盖范围 | 方案 B：本地 HTML 截图 + 外部链接尝试截图 + 无 Demo 显示占位图 |
| 视觉风格方向 | 方案 A：保持深色基调，增加玻璃拟态、微光渐变、层次感 |
| Hero 布局 | 方案 C：全宽沉浸式，占满首屏，动态渐变 + 粒子增强，统计浮动条 |
| 截图存储位置 | 方案 B：统一存入 `assets/screenshots/{topic_id}.webp` |
| 截图生成方案 | 方案 A：Python Playwright 批处理脚本 + 增量更新 |

## 1. 视觉风格升级

### 1.1 配色升级

在现有深色基调上增加层次感，保留 TRAE 品牌绿（`#22c55e`）不变。

| 角色 | 现有值 | 升级后 |
|------|--------|--------|
| 基底背景 | `#0a0a0a` | `#08080c`（更深的近黑） |
| 卡片背景 | `#18181b` | `rgba(24,24,27,0.6)` + `backdrop-filter: blur(12px)` |
| 强调色 | `#22c55e` | 保持不变 |
| 渐变光晕（新增） | 无 | `radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 60%)` |
| 玻璃边框（新增） | 无 | `border: 1px solid rgba(255,255,255,0.06)` + 内层高光 |

### 1.2 玻璃拟态应用范围

- **导航栏**：增强现有 `backdrop-filter: blur(14px)`，加入半透明渐变底色 `linear-gradient(180deg, rgba(8,8,12,0.7), rgba(8,8,12,0.4))`
- **筛选栏**：从纯色背景改为 `rgba(8,8,12,0.8)` + `backdrop-filter: blur(10px)`
- **卡片**：半透明背景 `rgba(24,24,27,0.6)` + 模糊 + 细边框 `1px solid rgba(255,255,255,0.06)`，hover 时边框渐亮 + 微光阴影
- **按钮**：主按钮保持荧光绿实心，次按钮改为玻璃描边风格（`background: rgba(255,255,255,0.03)` + `border: 1px solid rgba(255,255,255,0.1)`）

### 1.3 背景增强

保留现有粒子动画，在粒子层上方叠加：
- 径向渐变光晕（位于 Hero 区域中心，固定定位）
- 网格纹理：`repeating-linear-gradient` 生成 40px 网格，颜色 `rgba(255,255,255,0.015)` 覆盖全屏

### 1.4 字体微调

保持 Inter 字族：
- 标题 `letter-spacing` 从 `-1.5px` 调整为 `-2px`
- 副标题字重从 400 提升到 500

## 2. 默认筛选改为「最新发布」

### 改动范围

仅前端逻辑改动，无视觉影响：

- `script.js`：`let sortBy = 'views'` → `let sortBy = 'newest'`
- `templates/index.html.j2`：`<select>` 中 `<option value="newest">` 添加 `selected` 属性
- `index.html`：同步更新（由渲染流程生成）
- `sessionStorage` 恢复逻辑的默认值同步更新

## 3. Hero 全宽沉浸式升级

### 3.1 布局结构

```
┌─────────────────────────────────────────────────────┐
│  [粒子背景 + 径向光晕 + 网格纹理]                      │
│                                                     │
│              [pill-tag: TRAE AI 创造力大赛]            │
│                                                     │
│         汇总大赛报名专区的                              │
│         创意产物 与 Demo 展示                          │
│         (标题字号 clamp(40px, 6vw, 64px))             │
│                                                     │
│      每日自动爬取 forum.trae.cn ...                    │
│                                                     │
│   [浏览全部 Demo] [✨ 纯享模式] [前往社区报名]           │
│   [灵感孵化舱] [大赛官网]                              │
│                                                     │
│  ──────────── 底部浮动统计条 ────────────              │
│  │ 总作品 22031 │ 学习工作 9129 │ 生活娱乐 6812 │ ...  │
│  ──────────────────────────────────────              │
└─────────────────────────────────────────────────────┘
```

### 3.2 Hero 容器

- `min-height: 100vh`（占满首屏）
- `display: flex; flex-direction: column; justify-content: center`
- 保留 `.container` 限制内容宽度，背景光效全宽

### 3.3 背景层叠（从底到顶）

- 第 0 层：`#particle-canvas`（粒子，保持不变）
- 第 1 层：径向渐变光晕 — `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34,197,94,0.12), transparent 70%)`，固定在 Hero 区域
- 第 2 层：网格纹理 — `repeating-linear-gradient` 生成 40px 网格，颜色 `rgba(255,255,255,0.015)`

### 3.4 标题升级

- 字号从 `clamp(36px, 5vw, 56px)` 提升到 `clamp(40px, 6vw, 64px)`
- `letter-spacing: -2px`，`line-height: 1.05`
- `.accent` 渐变保持，增加 `text-shadow: 0 0 40px rgba(34,197,94,0.3)` 微光

### 3.5 CTA 按钮区

- 保留全部 5 个按钮（浏览全部 Demo、纯享模式、前往社区报名、灵感孵化舱、大赛官网）
- 按钮间距 `gap: 12px`，增加 hover 时的 `translateY(-2px)` 位移
- 主按钮增加内阴影高光：`box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 8px 24px var(--accent-glow)`

### 3.6 统计数据浮动条

- 从当前 flex 散列布局改为底部固定横条
- `display: flex; justify-content: space-between` 的水平条
- 每项用竖线分隔，背景 `rgba(255,255,255,0.03)` + `backdrop-filter: blur(8px)`
- 位置：`position: absolute; bottom: 32px; left: 0; right: 0`
- 数字字号从 24px 降到 20px，标签用 `text-transform: uppercase; letter-spacing: 1.5px`

## 4. 卡片改造 — 截图替代简介

### 4.1 新卡片结构

```
┌──────────────────────────────┐
│  [截图区域 16:9]               │
│  ┌────────────────────────┐   │
│  │                        │   │
│  │   Demo 首屏截图 webp    │   │
│  │   (object-fit: cover)  │   │
│  │                        │   │
│  └────────────────────────┘   │
│  [标签行] [审核徽章]            │
│  [标题 (2行截断)]              │
│  [👁 1234  ❤ 56  👤 author]   │
│  [查看 Demo] [社区帖子]        │
└──────────────────────────────┘
```

### 4.2 删除内容

- 删除 `.card-excerpt`（简介文字段落）及其 CSS
- 删除 `createCardHTML()` 中的 insight/excerpt 渲染逻辑

### 4.3 截图区域

- 容器：`aspect-ratio: 16/9; overflow: hidden; border-radius: 12px`
- 截图：`width: 100%; height: 100%; object-fit: cover`
- 无截图时占位：显示赛道图标 + 「暂无预览」文字，背景 `rgba(255,255,255,0.02)`
- hover 时截图轻微放大：`transform: scale(1.03); transition: transform 0.3s`

### 4.4 截图懒加载

- `<img loading="lazy" src="assets/screenshots/{topic_id}.webp">`
- 截图不存在时 `onerror` 回退到占位图（赛道图标 + 文字）

### 4.5 卡片高度调整

- 删除简介后卡片高度差异减小，网格更整齐
- `contain-intrinsic-size` 从 `0 300px` 调整为 `0 360px`（截图区域增加高度）

## 5. 截图生成管道

### 5.1 脚本：`scripts/generate_screenshots.py`

**技术栈**：Python Playwright（`pip install playwright`）

### 5.2 处理范围

- 优先级 1：有本地 `demo_url` 的 17,706 条 — 通过 `file://` 协议加载本地 HTML
- 优先级 2：有 `external_url` 的 157 条 — 通过 HTTP 加载外部链接
- 优先级 3：`has_demo=True` 但无 URL 的约 162 条 — 跳过，前端显示占位图
- 优先级 4：无 Demo 的 4,033 条 — 跳过，前端显示占位图

### 5.3 输出

- 目录：`assets/screenshots/`
- 命名：`{topic_id}.webp`
- 格式：WebP，质量 75（兼顾清晰度和体积，单张约 30-80KB）

### 5.4 配置参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 视口 | `1280x800` | 16:10 截图，前端按 16:9 裁切显示 |
| 等待策略 | `networkidle` + 1.5s | 确保页面渲染完成 |
| 超时 | 15 秒/页 | 超时跳过并记录 |
| 并发 | 10 个浏览器上下文 | 并行截图 |
| WebP 质量 | 75 | 平衡清晰度与体积 |

### 5.5 增量与断点续传

- 增量：检查 `assets/screenshots/{topic_id}.webp` 是否存在，已存在则跳过
- Checkpoint：每 100 张保存进度到 `data/screenshot_progress.json`
- 断点续传：重新运行时从上次中断处继续

### 5.6 数据写入

- 截图成功后在 `demos.json` 对应记录添加 `"screenshot": "assets/screenshots/{topic_id}.webp"`
- `demos.min.js` 同步包含 `screenshot` 字段
- 截图失败的记录 `"screenshot": null`

### 5.7 错误处理

- 页面加载失败：记录到日志文件 `data/screenshot_errors.log`，`screenshot: null`
- 外部链接跨域/超时：同上
- 磁盘空间不足：终止并告警

### 5.8 与 daily_update.py 集成

- 在 `daily_update.py` 末尾增加可选调用：新增审核记录若有 Demo，自动触发该记录的截图生成
- 也可独立运行：`python3 scripts/generate_screenshots.py`
- `generate_screenshots.py` 提供单条截图函数 `generate_single_screenshot(topic_id)` 供 daily_update 调用

## 6. 文件改动清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `styles.css` | 修改 | 配色升级、玻璃拟态、Hero 沉浸式、卡片截图样式、统计浮动条 |
| `script.js` | 修改 | 默认排序改 newest、卡片渲染删除简介改截图、截图懒加载+onerror |
| `templates/index.html.j2` | 修改 | Hero 结构调整、统计条重布局（模板是源，index.html 由此生成） |
| `index.html` | 修改 | 由模板渲染生成，不直接编辑 |
| `scripts/generate_screenshots.py` | 新增 | Playwright 截图批处理脚本 |
| `data/demos.json` | 修改 | 新增 screenshot 字段 |
| `data/demos.min.js` | 修改 | 新增 screenshot 字段 |
| `crawler/requirements.txt` | 修改 | 添加 `playwright>=1.40` |
| `assets/screenshots/` | 新增目录 | 存储截图 WebP 文件 |

## 7. 测试策略

- **视觉回归**：手动对比修改前后的页面截图，确认配色、布局、卡片样式符合预期
- **功能测试**：筛选（标签/排序/审核/Demo toggle）、搜索、加载更多、卡片链接跳转
- **截图脚本测试**：先对 10 条记录测试运行，确认输出格式和增量逻辑
- **响应式测试**：768px / 1024px / 1280px 三档断点检查

## 8. 实现顺序

1. 先运行截图生成脚本（耗时最长，约 1-2 小时）
2. 截图生成的同时进行 CSS/JS/HTML 改动
3. 截图完成后更新 demos.json 和 demos.min.js 的 screenshot 字段
4. 整体测试验证
5. 提交并推送
