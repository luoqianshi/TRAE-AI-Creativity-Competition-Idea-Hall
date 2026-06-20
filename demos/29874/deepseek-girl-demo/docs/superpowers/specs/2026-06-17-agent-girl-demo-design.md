# DeepGirl Agent 女友创意展示 Demo 设计文档

## 背景与目标

为 Deep Search AI 助手的「agent 女友」参赛创意制作一个独立展示 Demo。Demo 不污染原项目，单独存放在 `deepseek-girl-demo/` 文件夹中，用于报名材料展示和路演。

## 设计决策

- **展示形式：** 单页长滚动网站 + 嵌入式 iPhone App 模拟器
- **视觉风格：** iOS 18 液态玻璃风（毛玻璃、柔光晕、大圆角、黑色主调）
- **交互深度：** 纯静态展示，优先保证视觉和叙事效果
- **滚动交互：** 全屏分页滚动，每次鼠标滚轮/触控板 swipe 只切换一个模块
- **导航：** 右侧固定圆点导航，可点击跳转并显示当前位置
- **板块结构：**
  1. Hero：女友人设名称 + 一句话定位，背景缓慢流动柔光粒子
  2. 痛点共鸣：现代人孤独与陪伴缺失，三个场景卡片
  3. 长期记忆：文字说明 + iPhone 模拟展示专属记忆
  4. 情感陪伴：文字说明 + iPhone 模拟展示暖心对话
  5. 结尾 CTA：邀请语 + 行动按钮

## 视觉规范

- **主色调：** 黑色 `#000000` 作为背景
- **辅助色：** 深灰 `#1C1C1E`、中灰 `#2C2C2E`、玻璃白 `rgba(255,255,255,0.08)`
- **强调色：** 柔粉 `#FFB6C1`、淡紫 `#D8BFD8`、暖白 `#F5F5F7`
- **字体：** 系统默认无衬线（-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif）
- **圆角：** 卡片 24px，iPhone 外框 40px，按钮 9999px

## 动效规范

- **滚动淡入：** 元素从各自初始状态过渡到 `opacity: 1; transform: none; filter: blur(0)`
- **持续时间：** 1s（入场），0.55s（离场）
- **缓动函数：** 主缓动 `cubic-bezier(0.22, 1, 0.36, 1)`；Apple 风格入场缓动 `cubic-bezier(0.16, 1, 0.3, 1)`
- **错开动画：** 同组元素间隔 0.12s 依次出现
- **入场动画类型：**
  - `fade-up`：从下方 60px 淡入（可自定义距离）
  - `fade-left`：从左侧 80px 淡入
  - `fade-right`：从右侧 80px 淡入
  - `scale-in`：从 scale(0.85) + blur(10px) + translateY(40px) 放大清晰进入
- **页面切换：** 当前 section 离开时元素向上淡出、缩小、轻微模糊；新 section 进入时元素按层次依次进入
- **液态玻璃：** `backdrop-filter: blur(20px)` + `border: 1px solid rgba(255,255,255,0.1)` + 内阴影
- **iPhone 模拟器：** 随滚动产生轻微 3D 倾斜，进入视口时回正
- **背景粒子：** 缓慢漂浮的柔光模糊圆点，营造呼吸感
- **全屏分页：** CSS `scroll-snap-type: y mandatory` + `scroll-snap-stop: always` 保证每次吸附到一个模块
- **滚动防抖：** JS 在 800ms 滚动锁内阻止连续 wheel 事件，避免一次跳过多屏
- **圆点导航：** 当前模块圆点放大 + 白色高亮 + 柔光外阴影

## 文件结构

```
deepseek-girl-demo/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── docs/superpowers/specs/
    └── 2026-06-17-agent-girl-demo-design.md
```

## 技术栈

- HTML5
- CSS3（Flexbox/Grid、scroll-snap、backdrop-filter、CSS 变量、关键帧动画）
- 原生 JavaScript（IntersectionObserver、wheel/keyboard 事件控制分页）

## 注意事项

- 不使用任何外部框架，保证单文件即可运行
- 图片资源使用 CSS 渐变和 emoji/SVG 代替，避免外部依赖
- 移动端优先适配，iPhone 模拟器在窄屏下缩小或改为全宽卡片
- 滚动条已隐藏，需通过右侧圆点导航或滑动感知当前位置
- 背景光晕使用双层结构（`.orb-wrap` + `.orb`），使漂浮动画与滚动视差互不冲突
