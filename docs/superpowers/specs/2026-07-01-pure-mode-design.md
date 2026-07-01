# 纯享模式 (Pure Mode) 设计文档

> 日期: 2026-07-01
> 状态: 已批准，待实现

## 概述

新增"纯享模式"功能：用户从首页点击入口按钮跳转到独立页面 `pure.html`，以类似刷短视频的方式随机浏览项目中已部署的 Web Demo 作品。支持历史回溯导航（上一个/下一个）、新标签页全局打开，以及键盘快捷键操作。

## 需求

1. **入口按钮**：放在首页 hero-cta 区域，"灵感孵化舱"按钮之前；视觉风格比该按钮更突出（使用 `.btn-primary` 实心荧光绿，对比 `.btn-secondary` 透明边框）。
2. **随机浏览**：从所有 `has_demo === true` 的作品中随机抽取，以 iframe 嵌入展示。
3. **历史回溯导航**：
   - "下一个"：随机抽取一条新作品（排除当前），追加到浏览历史。
   - "上一个"：回退到历史中的前一条记录。
   - 在历史中间位置点"下一个"时，截断后续历史再追加新记录（浏览器式导航语义）。
4. **新标签页打开**：每个作品可通过按钮在新标签页中全屏打开。
5. **风格一致**：复用现有 `styles.css` 的 CSS 变量、配色和组件风格。
6. **作品信息**：iframe 上方显示顶部信息条（标题、作者、赛道标签、浏览/点赞数）。

## 方案

独立页面 `pure.html`，复用 `data/demos.min.js` 数据源和 `styles.css` 基础样式。页面自包含内联 CSS 和 JS，与首页逻辑完全解耦。

### 文件清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `pure.html` | 新增 | 纯享模式页面（HTML + 内联 CSS + JS） |
| `index.html` | 修改 | hero-cta 中插入入口按钮 |
| `templates/index.html.j2` | 修改 | 同步入口按钮 |

不修改 `styles.css`、`script.js`、`daily_update.py`、`crawler/`、数据层。

## 页面结构

```
pure.html
├── <head>
│   ├── 复用 styles.css
│   ├── 复用 Google Fonts (Inter)
│   └── 内联 <style>（纯享模式专属样式，约 60-80 行）
├── <body>
│   ├── navbar（logo + 返回首页链接）
│   ├── .pure-stage（flex 全屏布局容器）
│   │   ├── .pure-info-bar（顶部信息条）
│   │   │   ├── 作品标题（省略号截断）
│   │   │   ├── 赛道标签（.tag-pill 复用）
│   │   │   └── 浏览数 · 点赞数 · 作者
│   │   ├── .pure-iframe-wrap（iframe 容器，flex-grow 占满）
│   │   │   └── <iframe loading="lazy">
│   │   └── .pure-controls（底部控制栏）
│   │       ├── ◀ 上一个按钮
│   │       ├── 序号计数 (当前 / 已浏览)
│   │       ├── 下一个按钮 ▶
│   │       └── 新标签页打开链接
│   ├── <script src="data/demos.min.js">
│   └── <script> 内联 JS（导航逻辑）
```

## 交互逻辑

### 数据源

从 `window.DEMOS_DATA` 中筛选 `has_demo === true` 的记录，构建作品池 `demoPool`（约 17,000 条）。

### 状态管理

```javascript
let demoPool = [];        // 有 Demo 的作品列表
let history = [];         // 已浏览记录的索引（指向 demoPool 中的位置）
let currentPos = -1;      // 当前在 history 中的位置（-1 表示尚未开始）
```

### 导航行为

**初始化**：页面加载后自动调用 `nextDemo()`，随机抽取第一条。

**下一个 `nextDemo()`**：
1. 从 `demoPool` 中随机选一个索引，排除当前正在显示的索引。
2. 如果 `currentPos` 不在 `history` 末尾（即用户回退过），截断 `history` 到 `currentPos + 1`。
3. 将新索引追加到 `history`，`currentPos++`。
4. 更新 iframe `src` 和信息条。

**上一个 `prevDemo()`**：
1. 如果 `currentPos > 0`，`currentPos--`。
2. 加载 `history[currentPos]` 对应的作品。
3. 如果已在历史起点，"上一个"按钮禁用。

**新标签页打开**：`<a href="{demo_url}" target="_blank">`，`demo_url` 为相对路径。

### 键盘快捷键

| 按键 | 动作 |
|---|---|
| `←` | 上一个 |
| `→` 或 `Space` | 下一个 |

监听 `keydown` 事件，阻止默认行为避免页面滚动。

### iframe 加载

- `src` 设为作品的 `demo_url`（相对路径，如 `demos/34392/MindSpace.html`）。
- `loading="lazy"` 延迟加载。
- 切换时直接替换 `src`，浏览器自动处理旧页面卸载。

## 样式设计

### 入口按钮（index.html）

```html
<a href="pure.html" class="btn btn-primary">✨ 纯享模式</a>
```

放在 `<a href="#demos" class="btn btn-primary">浏览全部 Demo</a>` 之后、`<a href="...灵感孵化舱" class="btn btn-secondary">灵感孵化舱</a>` 之前。

### 纯享页面专属样式（内联）

```css
.pure-stage {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);  /* 减去 navbar 高度 */
  margin-top: 64px;
}

.pure-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.pure-info-bar .pure-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.pure-iframe-wrap {
  flex: 1;
  position: relative;
  background: #000;
}

.pure-iframe-wrap iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.pure-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 24px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.pure-nav-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pure-nav-btn:hover:not(:disabled) {
  background: var(--accent);
  color: #000;
  box-shadow: 0 0 20px var(--accent-glow);
}

.pure-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pure-counter {
  font-size: 14px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 80px;
  text-align: center;
}

.pure-open-link {
  margin-left: 16px;
}
```

## 边界情况

1. **作品池为空**：如果 `demoPool` 为空（数据加载失败），显示空状态提示。
2. **iframe 加载失败**：部分 Demo 文件可能因路径问题无法加载，iframe 显示浏览器默认错误页，不影响导航。
3. **历史只有一条**：首次进入时"上一个"按钮禁用。
4. **随机去重**：`nextDemo()` 排除当前索引，避免连续两次显示同一作品（作品池 > 1 时）。
5. **响应式**：移动端下信息条和控制栏保持可用，iframe 占满剩余空间。

## 测试要点

- 入口按钮在首页正确显示，点击跳转到 `pure.html`
- 页面加载后自动显示第一个随机作品
- "下一个"随机抽取新作品，"上一个"回退到前一个
- 在历史中间点"下一个"时截断后续历史
- "新标签页打开"正确跳转到 Demo 文件
- 键盘快捷键 ←/→/Space 正常工作
- 在历史起点时"上一个"按钮禁用
- 页面风格与首页一致（配色、字体、按钮样式）
