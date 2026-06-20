# TRAE Demo Hall 前端性能优化设计文档

**日期**：2026-06-20
**状态**：已确认，待实施

---

## 问题分析

### 当前性能瓶颈

| 指标 | 当前值 | 问题 |
|---|---|---|
| `index.html` 大小 | 21 MB / 425,733 行 | 首屏加载极慢 |
| DOM 卡片节点 | 10,071 个 | 内存占用巨大 |
| `<img>` 标签 | 59,651 个 | 每卡片约 6 个 img 节点 |
| 筛选/排序方式 | `appendChild` 移动 DOM 节点 | 触发 layout reflow |
| IntersectionObserver 目标 | 10,071 个 | 持续追踪开销 |
| `.card { transition: all }` | 10,071 个元素 | 监听所有属性变化 |

### 根本原因

Jinja2 模板通过 `{% for demo in demos %}` 将全部 10,071 张卡片一次性渲染为静态 HTML。前端没有任何分页或虚拟化机制。

---

## 设计方案：数据外置 + JS 动态渲染 + 无限滚动

### 架构变更

**改造前**：
```
Jinja2 模板渲染全部卡片 → 21MB index.html → 浏览器解析 10,071 个 DOM 节点
```

**改造后**：
```
Jinja2 渲染骨架 (~50KB) + demos.min.js (~3MB, gzip ~500KB)
    → 浏览器加载骨架 + 数据
    → JS 动态渲染前 50 张卡片
    → 滚动时无限加载下一批
    → 筛选/排序在数据层完成
```

### 数据层改造

#### 1. 新增 `data/demos.min.js`

爬虫的 `render()` 方法额外生成此文件：

```javascript
window.DEMOS_DATA = [
  {
    "topic_id": 34392,
    "title": "MIND SPACE 心情日记",
    "excerpt": "...",
    "tags": ["生活娱乐"],
    "views": 128,
    "like_count": 5,
    "author": "username",
    "created_at": "2026-06-19T09:16:36.232Z",
    "demo_url": "demos/34392/demo.html",
    "external_url": null,
    "has_demo": true,
    "approved": true
  },
  ...
];
```

**字段精简**：仅保留前端需要的 11 个字段，去除 `demo_file`（本地绝对路径）、`cover_image`、`forum_url`（可从 topic_id 计算）、`archived`（已过滤）、`approved_source`、`demo_type`。

**预计大小**：每条约 300 字节 × 10,071 条 ≈ 3MB，gzip 后约 500KB。

#### 2. Jinja2 模板改造

`templates/index.html.j2` 移除 `{% for demo in demos %}` 卡片循环，替换为：

```html
<section class="cards-section" id="demos">
  <div class="cards-grid" id="cards-grid">
    <!-- 卡片由 JS 动态渲染 -->
  </div>
  <div class="loading-indicator" id="loading" style="display:none;">
    <div class="spinner"></div>
  </div>
  <div class="no-results" id="no-results" style="display:none;">
    没有找到匹配的作品
  </div>
</section>

<script src="data/demos.min.js"></script>
<script src="script.js"></script>
```

#### 3. 爬虫 render() 方法修改

在 `crawler.py` 和 `crawler_v2.py` 的 `render()` 方法中：
- 渲染骨架 HTML（传入 `stats`、`last_updated`、`track_tags`，不传入 `demos`）
- 生成 `data/demos.min.js`（精简字段 + JSON 序列化 + `window.DEMOS_DATA = ` 前缀）

### 前端渲染引擎

#### 无限滚动

| 参数 | 值 | 说明 |
|---|---|---|
| 批次大小 | 50 张/批 | 每次渲染 50 张卡片 |
| 预加载阈值 | 500px | 距底部 500px 时触发加载 |
| DOM 上限 | 200 张 | 超过后回收顶部不可见批次 |
| 缓冲区 | 150 张 | 回收时保留 150 张缓冲 |

**加载流程**：
1. 页面加载 → 解析 `window.DEMOS_DATA` → 渲染前 50 张
2. 用户向下滚动 → 距底部 500px → 渲染下一批 50 张
3. DOM 节点超过 200 → 移除最顶部已滚出视口的批次（`removeChild`）
4. 用户向上滚动回顶部 → 重新渲染被回收的批次

**DOM 回收策略**：
- 维护一个 `renderedBatches` 数组，记录每批的起始索引和 DOM 片段
- 回收时从 DOM 移除顶部批次，但保留数据索引
- 用户回滚到顶部时，从数据中重新生成被回收的批次

#### 卡片生成函数

```javascript
function createCardHTML(demo) {
  const tagImgMap = {
    '生活娱乐': 'life-default.png',
    '学习工作': 'study-default.png',
    '社会服务': 'common-env-default.png',
    '硬件交互': 'hardware-default.png',
    '社会公益': 'special-default.png'
  };
  const tag = demo.tags[0] || '';
  const tagImg = tagImgMap[tag] || '';
  const approvedBadge = demo.approved ? '<span class="approved-badge" title="官方审核通过">&#10003;</span>' : '';
  const demoBtn = demo.has_demo
    ? (demo.demo_url
      ? `<a href="${demo.demo_url}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt=""> 查看 Demo</a>`
      : demo.external_url
        ? `<a href="${demo.external_url}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt=""> 查看 Demo</a>`
        : '')
    : '<button class="btn btn-primary btn-sm disabled" disabled><img src="assets/icons/play.svg" class="btn-icon" alt=""> 暂无 Demo</button>';
  const forumUrl = `https://forum.trae.cn/t/topic/${demo.topic_id}`;

  return `<div class="card"
    data-tags="${demo.tags.join(',')}"
    data-title="${demo.title}"
    data-excerpt="${demo.excerpt || ''}"
    data-created="${demo.created_at}"
    data-views="${demo.views}"
    data-likes="${demo.like_count}"
    data-approved="${demo.approved ? 'true' : 'false'}">
    <div class="card-tag-row">
      ${tagImg ? `<img src="assets/tracks/${tagImg}" alt="${tag}" class="card-tag-img">` : ''}
      <span class="card-tag-text">${tag}</span>
      ${approvedBadge}
    </div>
    <h3 class="card-title">${demo.title}</h3>
    <p class="card-excerpt">${demo.excerpt || '暂无描述'}</p>
    <div class="card-meta">
      <span class="meta-item"><img src="assets/icons/eye.svg" class="meta-icon" alt="views"> ${demo.views}</span>
      <span class="meta-item"><img src="assets/icons/heart.svg" class="meta-icon" alt="likes"> ${demo.like_count}</span>
      <span class="meta-item"><img src="assets/icons/user.svg" class="meta-icon" alt="author"> ${demo.author}</span>
    </div>
    <div class="card-actions">
      ${demoBtn}
      <a href="${forumUrl}" target="_blank" class="btn btn-secondary btn-sm"><img src="assets/icons/external.svg" class="btn-icon" alt=""> 社区帖子</a>
    </div>
  </div>`;
}
```

#### 筛选/排序引擎

**数据层操作**（不操作 DOM）：

```javascript
function getFilteredSorted() {
  let result = [...window.DEMOS_DATA];

  // 赛道筛选
  if (activeTag !== 'all') {
    result = result.filter(d => d.tags.includes(activeTag));
  }

  // 审核筛选
  if (approvedOnly) {
    result = result.filter(d => d.approved);
  }

  // 关键词搜索
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(d =>
      d.title.toLowerCase().includes(q) ||
      (d.excerpt || '').toLowerCase().includes(q)
    );
  }

  // 排序
  switch (sortBy) {
    case 'newest': result.sort((a, b) => b.created_at.localeCompare(a.created_at)); break;
    case 'views': result.sort((a, b) => b.views - a.views); break;
    case 'likes': result.sort((a, b) => b.like_count - a.like_count); break;
  }

  return result;
}
```

**筛选/排序变化时**：
1. 调用 `getFilteredSorted()` 获取过滤后的数据
2. 清空 Cards Grid
3. 渲染前 50 张
4. 重置无限滚动状态

### CSS 优化

| 改动 | 位置 | 说明 |
|---|---|---|
| `transition: all 0.25s` → `transition: opacity 0.25s, transform 0.25s` | `.card` | 避免监听所有属性 |
| 新增 `content-visibility: auto` | `.card` | 浏览器跳过屏幕外卡片的渲染 |
| 新增 `loading="lazy"` | card 内所有 `<img>` | 图片懒加载 |
| 新增 `.loading-indicator` 样式 | styles.css | 底部加载指示器 |
| 新增 `.no-results` 样式 | styles.css | 无结果提示 |

### 粒子动画调整

- 将 `initParticles()` 调用延迟到首屏卡片渲染完成后
- 通过 `setTimeout(initParticles, 500)` 实现

### 滚动入场动画调整

- 只对新渲染的卡片注册 IntersectionObserver
- 已回收的卡片取消观察
- 延迟从 `i * 50ms` 改为 `i * 30ms`

---

## 改动文件清单

| 文件 | 改动类型 | 说明 |
|---|---|---|
| `templates/index.html.j2` | 修改 | 移除卡片循环，渲染骨架 + 引用 demos.min.js |
| `crawler/crawler.py` | 修改 | `render()` 新增生成 `data/demos.min.js` |
| `crawler/crawler_v2.py` | 修改 | `render()` 新增生成 `data/demos.min.js` |
| `script.js` | 重写 | 数据解析、createCardHTML、无限滚动、筛选排序引擎、DOM 回收 |
| `styles.css` | 修改 | transition 优化、content-visibility、loading=lazy、新增 loading/no-results 样式 |

**不改动**：
- `data/demos.json`（完整数据，爬虫内部使用）
- `demos/` 目录（Demo 文件）
- `assets/` 目录（图标、赛道图片）
- `.github/workflows/deploy.yml`（部署流程不变）

---

## 预期效果

| 指标 | 改造前 | 改造后 |
|---|---|---|
| 首屏 HTML 大小 | 21 MB | ~50KB 骨架 + ~500KB 数据 (gzip) |
| DOM 卡片节点 | 10,071 | 50-200（动态） |
| `<img>` 标签 | 59,651 | 300-1,200（动态） |
| 筛选/排序响应 | 数百毫秒（DOM 重排） | <10ms（纯 JS 数组操作） |
| 滚动流畅度 | 卡顿（10,000+ 节点） | 始终流畅（节点数受控） |

---

## 约束与决策

1. **保持纯静态架构**：不引入 Node.js 构建工具或前端框架，GitHub Pages 兼容
2. **SEO 不考虑**：这是工具型展示站，不需要搜索引擎索引
3. **向后兼容**：`data/demos.json` 保持完整数据供爬虫使用，`data/demos.min.js` 是精简版供前端使用
4. **赛道图标复用**：5 个赛道 × default 状态 = 5 个 PNG，浏览器缓存后无额外请求
5. **SVG 图标同理**：eye/heart/user/play/external 共 5 个 SVG，浏览器缓存后无额外请求
