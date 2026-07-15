# 好习惯打卡 —— AI 驱动的习惯养成伙伴

> TRAE AI 创造力大赛 · 社会公益赛道 · 青少年身心健康方向
>
> 版本：V1.2.0 ｜ 构建日期：2026-07-14

---

## 项目简介

"好习惯打卡"是一个由 AI 驱动的习惯养成 Web 应用。它不仅帮你记录每日习惯完成情况，更通过 AI 对话式交互，像一位温柔耐心的伙伴一样，陪你设定目标、拆解步骤、克服懈怠、庆祝进步。

**核心差异化**：产品不是又一个冷冰冰的打卡工具，而是一个有温度、会思考、能共情的 AI 成长伙伴。

---

## 功能模块

| 模块 | 说明 |
|------|------|
| 欢迎/登录 | 渐变欢迎页 + 昵称登录 |
| 今日打卡仪表盘 | SVG 进度圆环、一键打卡、彩纸庆祝特效 |
| 习惯管理 | 创建/编辑/删除习惯，4 分类 + 20 可选图标 |
| AI 伙伴对话 | 每日问候、打卡鼓励、懈怠干预、快捷入口 |
| 数据统计 | 12 周热力图、分类分布、习惯排名、成就徽章 |
| 个人管理 | 昵称/签名/性别/生日编辑、身高体重 + BMI计算、6色头像 |

---

## 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 运行 Demo（开发模式）

```bash
# 1. 进入项目目录
cd habit-tracker

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

浏览器访问 **http://localhost:5173/** 即可体验。

### 构建生产版本

```bash
# 构建（输出到 dist/ 目录）
npm run build

# 预览构建结果
npm run preview
```

### 直接使用构建产物

`dist/` 目录为纯静态文件，可用任意 HTTP 服务器托管：

```bash
# 方式1：使用 Vite 预览
npm run preview

# 方式2：使用 Python
python -m http.server 8080 -d dist

# 方式3：使用 Node.js npx serve
npx serve dist
```

---

## 项目结构

```
habit-tracker/
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── components/          # 通用组件
│   │   ├── Icon.tsx         #   统一 SVG 图标映射（Lucide）
│   │   └── Layout.tsx       #   顶栏 + 底栏导航壳
│   ├── pages/               # 页面组件
│   │   ├── LoginPage.tsx    #   欢迎页 / 登录页
│   │   ├── DashboardPage.tsx #  今日打卡仪表盘
│   │   ├── HabitManagePage.tsx # 习惯管理
│   │   ├── StatsPage.tsx    #   数据统计
│   │   ├── ChatPage.tsx     #   AI 伙伴对话
│   │   └── ProfilePage.tsx  #   我的（个人管理）
│   ├── store.tsx            # 全局状态管理（React Context）
│   ├── types.ts             # TypeScript 类型定义
│   ├── App.tsx              # 路由配置 + AuthGuard
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式 + Tailwind 主题 + 动画
├── dist/                    # 生产构建产物
├── index.html               # HTML 入口
├── vite.config.ts           # Vite 构建配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 项目依赖
└── README.md                # 本文件
```

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript 6 |
| 样式 | Tailwind CSS 4 + 自定义主题 |
| 图标 | Lucide React（20+ SVG 图标） |
| 构建 | Vite 8 + Rolldown |
| 路由 | React Router 7（SPA） |
| 数据持久化 | LocalStorage |

### 构建指标

| 指标 | 值 |
|------|-----|
| TypeScript 检查 | 零错误 |
| JS 体积（gzip） | ~93 KB |
| CSS 体积（gzip） | ~8 KB |
| 首屏加载 | < 2 秒 |

---

## 设计风格

采用温暖色系配色，传达「陪伴感」而非「工具感」：

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色 | 温暖橙 | `#FF8C42` |
| 辅助色 | 柔和蓝 | `#5B8FCF` |
| 成功色 | 薄荷绿 | `#6DC77A` |
| 背景 | 奶油白 | `#FFF9F5` |
| 文字 | 深棕灰 | `#3D3D3D` |

支持手机 / 平板 / 桌面三端响应式布局，移动端采用小程序风格毛玻璃底栏导航。

---

## AI 对话说明

Demo 阶段使用预设 Prompt 模板引擎模拟对话，覆盖以下场景：

- 每日问候（基于打卡状态生成个性化问候）
- 打卡反馈（基于连续天数生成具体鼓励）
- 懈怠干预（连续 3 天未打卡触发关怀对话）
- 习惯咨询（通用鼓励性回复）

生产环境可替换模板引擎为真实 LLM API 接入。

---

## 相关文件

- 创意需求说明书：`好习惯打卡_创意需求说明书.docx`
- 报名帖（Markdown）：`好习惯打卡_报名帖.md`

---

## 许可

本项目为 TRAE AI 创造力大赛参赛作品。
