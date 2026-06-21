# FocusPal - AI 学习监督官

> **TRAE AI 创造力大赛参赛作品** | 面向大学生和考研群体的 AI 学习监督与成长系统

## 🎯 项目简介

FocusPal 是一款创新性的 AI 学习监督与成长系统，旨在帮助用户克服拖延症、提高学习效率。通过 AI 智能目标拆解、游戏化激励机制和实时学习监督，将枯燥的学习过程转化为充满成就感的成长旅程。

### 核心功能

| 功能模块 | 描述 |
|----------|------|
| **AI 目标拆解** | 输入笼统目标，AI 自动分解为可执行任务并估算耗时 |
| **AI 学习监督** | 番茄钟计时 + 智能提醒 + 效率统计 |
| **AI 学习助手** | 随时提问获取学习指导和知识解答 |
| **游戏化成长** | 经验值、等级体系、成就徽章 |
| **数据可视化** | 学习时长、任务完成率、打卡记录图表 |
| **拖延症分析** | 识别拖延模式，提供个性化改进方案 |

### 等级体系

| 等级 | 名称 | 所需经验 |
|------|------|----------|
| Lv1 | 新手学员 | 0 |
| Lv2 | 自律达人 | 500 |
| Lv3 | 学霸 | 1500 |
| Lv4 | 学神 | 3500 |
| Lv5 | 卷王之王 | 7000 |

---

## 📁 项目结构

```
├── client/                 # 前端应用
│   ├── src/
│   │   ├── views/          # 页面组件（8个）
│   │   ├── components/     # 公共组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── router/         # Vue Router
│   │   └── api/            # API 封装
│   └── package.json
│
├── server/                 # 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # 中间件（JWT认证）
│   │   ├── services/       # 业务逻辑
│   │   └── db/             # SQLite 数据库
│   └── package.json
│
├── showcase/               # 创意展示页面（可直接打开）
│   └── index.html
│
└── .trae/documents/        # 文档目录
    ├── PRD.md              # 产品需求文档
    └── TECH_ARCHITECTURE.md # 技术架构文档
```

---

## 🚀 快速开始

> **重要提示**：不要直接双击 `client/index.html`，Vite 项目必须通过开发服务器运行。

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 一键启动

```bash
# 1. 进入项目目录
cd FocusPal

# 2. 安装所有依赖
npm install

# 3. 同时启动前端和后端
npm run dev

# 4. 浏览器访问
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

### 单独启动

```bash
# 仅启动前端
npm run dev:client

# 仅启动后端
npm run dev:server

# 构建前端
npm run build

# 预览构建结果
npm run preview
```

---

## 🌐 页面预览

| 页面 | 路径 | 功能 |
|------|------|------|
| 登录页 | `/login` | 用户登录 |
| 注册页 | `/register` | 用户注册 |
| 仪表盘 | `/` | 学习概览、统计卡片 |
| 任务管理 | `/tasks` | AI 目标拆解、任务列表 |
| AI 监督 | `/study` | 番茄钟、学习监督 |
| 数据统计 | `/stats` | ECharts 图表展示 |
| 成就中心 | `/achievements` | 徽章墙 |
| 个人中心 | `/profile` | 用户信息、设置 |

---

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 | ^3.4 |
| 构建工具 | Vite | ^5.0 |
| UI 组件 | Element Plus | ^2.5 |
| 图表库 | ECharts | ^5.4 |
| 状态管理 | Pinia | ^2.1 |
| 路由 | Vue Router | ^4.2 |
| 后端框架 | Express | ^4.18 |
| 数据库 | SQLite | ^3 |
| 认证 | JWT | ^9.0 |

---

## 📊 API 接口

| 模块 | 接口 | 方法 |
|------|------|------|
| 认证 | `/api/auth/login` | POST |
| 认证 | `/api/auth/register` | POST |
| 任务 | `/api/tasks` | GET/POST |
| AI | `/api/ai/decompose` | POST |
| AI | `/api/ai/chat` | POST |
| 学习 | `/api/study/sessions` | GET/POST |
| 统计 | `/api/stats/daily` | GET |
| 统计 | `/api/stats/weekly` | GET |
| 成就 | `/api/achievements` | GET |
| 分析 | `/api/analysis/procrastination` | GET |

---

## 🎨 设计风格

- **主题色**：深蓝色科技风 (#0a0e17)
- **主色调**：靛蓝渐变 (#6366f1 → #22d3ee)
- **字体**：Orbitron（标题）+ Noto Sans SC（正文）
- **动效**：平滑过渡、数字滚动、脉冲发光

---

## 📝 文档说明

- `PRD.md` - 产品需求文档，包含完整的需求分析和用户流程
- `TECH_ARCHITECTURE.md` - 技术架构文档，包含系统设计和数据库 ER 图

---

## 📄 许可证

MIT License

---

**TRAE AI 创造力大赛参赛作品** | 2026