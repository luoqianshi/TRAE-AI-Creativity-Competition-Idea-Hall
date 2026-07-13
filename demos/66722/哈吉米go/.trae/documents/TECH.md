# 喵域图鉴 Meowdex — 技术架构文档

## 1. 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 工程类型 | 纯静态单页 HTML | Demo 形态，零依赖、零安装、任何浏览器即开即玩 |
| 结构 | 单 `index.html` + 模块化内联 JS | 不引入构建工具，保留可读性 |
| 样式 | 原生 CSS（CSS Variables + Grid + Flex） | 体量小、可控性高，便于精细调参 |
| 动效 | CSS keyframes + Web Animations API | 罐头投掷、星星飘散、明信片翻入 |
| 图标 | 内联 SVG / emoji | 不依赖图标库，零网络请求 |
| 图片 | 极少量 CSS 生成的"插画风"猫剪影 + 文本占位 | 避免外网图片 404；保持风格统一 |
| 字体 | Google Fonts: Caveat、Patrick Hand；中文系统回退 | 仅 2 个字符集 |
| 路由 | 简单 hash 路由 + 全局状态机 | 4 个屏 + 浮层 |

## 2. 目录结构

```
哈吉米go/
├── index.html              # 单页入口
├── styles/
│   ├── tokens.css          # 颜色/字号/间距变量
│   ├── shell.css           # 手机外壳、桌面预览
│   ├── collection.css      # 图鉴页
│   ├── camera.css          # 拍照页
│   ├── catfound.css        # 解锁弹层
│   ├── detail.css          # 档案页
│   ├── map.css             # 地图页
│   ├── profile.css         # 个人页
│   ├── name.css            # 命名弹窗
│   └── animations.css      # 通用 keyframes
├── scripts/
│   ├── data.js             # 8 只猫的 mock 数据
│   ├── state.js            # 全局状态 + localStorage
│   ├── router.js           # hash 路由
│   ├── render.js           # 各屏渲染
│   └── main.js             # 启动入口 + 事件绑定
└── .trae/documents/        # 已生成的 PRD / Tech
```

> 实际 Demo 也可选择把全部样式合并到单一 `<style>`、JS 合并到一个 `<script type="module">`，以减少文件数；本架构文档说明理想结构，最终实现会按可读性做权衡。

## 3. 全局状态

```js
state = {
  coins: 4285,
  xp: 580,
  hearts: 2,
  tries: 3,                 // 今日剩余投喂次数
  cats: [/* 8 只猫 + unlocked/affection */],
  collected: ['fluffyfur', 'cleverlatte', 'drpancake', /* ... */],
  currentTab: 'collection', // collection | map | camera | store | profile
  // 浮层
  overlay: null,            // null | 'catfound' | 'name'
  pendingCat: null,         // 待命名/解锁的猫
}
```

`state.js` 暴露 `getState() / setState(patch) / persist()`，持久化到 `localStorage.meowdex_v1`，刷新后保留进度。

## 4. 路由

- `#/collection` → 渲染图鉴
- `#/camera` → 渲染相机
- `#/cat/:id` → 渲染档案
- `#/map` → 渲染地图
- `#/profile` → 渲染个人
- `#/name` → 命名弹窗（通常是 `#/camera` 触发后跳转）

底部 Tab 切换直接修改 `state.currentTab` + `location.hash`，由 `router.js` 统一调度。

## 5. 关键动效

| 动效 | 实现 | 时长 |
|------|------|------|
| 罐头投掷 | 顶部 `transform: translate(...) rotate(...)` | 700ms ease-in |
| 星星飘散 | 8 颗 SVG star，循环放大 + 旋转 + 透明度，stagger 60ms | 1.6s |
| CAT FOUND 卡升起 | `transform: translateY(120%) → 0` + opacity，cubic-bezier | 500ms |
| 卡片翻入 Collection | scale 0.6 → 1 + rotate(-6deg → 随机) | 600ms |
| 亲密度进度条 | width 过渡 | 800ms ease-out |
| Tab 切换 | 屏幕 fade + 8px 上移 | 220ms |

## 6. 性能 & 兼容

- 单屏 DOM 节点 < 300，无大图，主要靠 CSS 绘制
- 支持 Chrome / Edge / Safari 16+
- 移动端真机可全屏（`<meta viewport>`），桌面端显示手机外壳预览

## 7. 风险与对策

| 风险 | 对策 |
|------|------|
| iOS Safari 对 `backdrop-filter` 较弱 | 弹层用不透明奶油色而非毛玻璃 |
| 字体加载慢导致首屏抖动 | 关键文本直接 system 回退；Google Fonts 异步 |
| localStorage 不可用 | catch 后回退到内存态 |

## 8. 验证流程

1. `python -m http.server 8000` 启动（或直接 file:// 打开）
2. 浏览器访问，验证：
   - 5 个 Tab 都能切换
   - Camera → READY TO CATCH → 弹层 → Collection 全链路
   - 亲密度进度条变化
   - 地图点位点击
3. 刷新后进度保留
