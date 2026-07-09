# ProjectMind — 项目全生命周期 AI 上下文管理系统

> **让 AI 真正"记住"你的项目，从第一天到最后一天。**

[![Version](https://img.shields.io/badge/version-0.1.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()

---

## 目录

- [为什么需要 ProjectMind？](#为什么需要-projectmind)
- [核心思想](#核心思想)
- [与现有方案对比](#与现有方案对比)
- [系统架构](#系统架构)
- [核心概念](#核心概念)
- [快速开始](#快速开始)
- [命令参考](#命令参考)
- [AI 平台集成](#ai-平台集成)
- [工作流程示例](#工作流程示例)
- [开发指南](#开发指南)
- [最佳实践](#最佳实践)
- [Q&A](#qa)

---

## 为什么需要 ProjectMind？

### 痛点：AI 没有"长期记忆"

当你使用 AI 辅助开发时，是否遇到过这些问题：

```
第一天 - 你花了 2 小时解释项目架构
AI 非常理解，帮了很多忙

第二天 - 打开新的聊天窗口
你：继续开发我的项目
AI：什么项目？你能重新描述一下吗？
你：又花了 20 分钟重新解释...
```

**更糟糕的情况：**

- AI 尝试了一个修复方案，失败了，但你忘记记录
- 三天后，AI 又提出了完全相同的失败方案
- 项目越来越大，AI 每次都要从头阅读所有文件
- 换了不同的 AI 工具（Claude → Cursor → Copilot），每次都要重新"培训"

### 解决方案：系统的上下文管理

**ProjectMind** 通过结构化的上下文管理系统，为 AI 提供**跨会话、跨平台**的"项目记忆"。它像一个专业的"项目副驾驶"，记录项目的每一个关键节点，让 AI 在任何时候都能快速恢复对项目的完整理解。

---

## 核心思想

ProjectMind 基于三大设计原则：

### 1. 事件溯源（Event Sourcing）

将所有关键操作记录为不可变的事件流，就像 Git 记录代码变更一样，ProjectMind 记录**项目上下文变更**。

```
事件的不可变日志 timeline:
[Project Init] → [架构设计] → [Bug 发现] → [修复尝试(失败)]
→ [修复尝试(成功)] → [性能问题] → [优化完成] → [复盘总结]
```

### 2. AI 复盘机制（AI Review Mechanism）

每次 AI 工作前，先"复盘"——阅读结构化的上下文摘要，确保完全了解项目当前状态。这类似于人类开发者阅读团队的 Weekly Report。

```
每次对话前：
  1. 运行 pmd review → 获取项目复盘上下文
  2. 阅读复盘摘要 → 了解当前状态、待办事项、已知教训
  3. 预操作检查 → 避免重复失败方案
```

### 3. 预操作判断门（Judgment Gate）

在 AI 执行操作前进行智能检查，防止重复已失败的方案。这是 ProjectMind 区别于纯文档方案的核心创新。

```
AI 要修复 Bug → Judgment Gate 检查：
  → 这个修复方案和 3 天前失败的方案相似度 80%
  → ⚠️ 警告！请查看历史记录后再决定
  → 避免重复相同的错误
```

---

## 与现有方案对比

| 特性 | ProjectMind | Cline Memory Bank | ai-memory | Context Sync | ProjectMem |
|------|:-----------:|:-----------------:|:---------:|:------------:|:----------:|
| 标准化目录结构 | ✅ | ✅ | ❌ | ❌ | ✅ |
| CLI 工具 | ✅ | ✅ | ✅ | ✅ | ✅ |
| MCP 跨平台 | ✅ | ⚠️ 仅 Cline | ✅ | ✅ | ✅ |
| 预操作判断门 | ✅ | ❌ | ❌ | ❌ | ✅ |
| 事件溯源 | ✅ | ❌ | ❌ | ❌ | ✅ |
| AI 复盘摘要 | ✅ | ⚠️ 被动读取 | ✅ | ✅ | ⚠️ 部分 |
| 纯文本可读 | ✅ | ✅ | ⚠️ SQLite | ⚠️ SQLite | ✅ |
| Git 原生友好 | ✅ | ✅ | ❌ | ❌ | ✅ |
| .pmdrules 规则文件 | ✅ | ⚠️ .clinerules | ❌ | ❌ | ❌ |
| 模板系统 | ✅ | ✅ | ❌ | ⚠️ 无 | ❌ |
| 打包导出 | ✅ | ❌ | ✅ | ✅ | ❌ |
| 零外部依赖运行 | ✅ | ✅ | ✅ | ❌ (Node.js) | ✅ |
| 跨项目记忆 | ✅ | ❌ | ✅ | ✅ | ✅ |

### 与 Cline Memory Bank 的相似之处

ProjectMind 在概念上受 Cline Memory Bank 启发，两者都采用**结构化 Markdown 文件作为 AI 记忆载体**。核心差异在于：

- **Cline**: 文件驱动，AI 主动读写 Markdown
- **ProjectMind**: 事件驱动 + CLI 工具 + MCP 协议，更系统化，更跨平台

### 与 ProjectMem 的相似之处

两者都采用了**事件溯源**和**预操作判断门**的架构。ProjectMind 的 JudgmentGate 和 ProjectMem 的 `pre-action gate` 目标相同——在 AI 重复失败前阻止它。差异在于：

- **ProjectMem**: Python 包，学术出身，强调不可变事件日志
- **ProjectMind**: TypeScript/Node.js，工程实践导向，同时注重开发体验和跨平台集成

### 与 ai-memory 的相似之处

都支持**跨 AI 平台的 MCP 集成**和**持久化存储**。ai-memory 是 Rust 编写的高性能通用记忆层，ProjectMind 则更聚焦于**软件工程项目的全生命周期管理**，提供了更贴合开发场景的模板和流程。

---

## 系统架构

```
┌──────────────────────────────────────────────────────────────┐
│                       AI 平台层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Claude   │  │ Cursor   │  │ VS Code  │  │ Copilot /   │  │
│  │ Desktop  │  │ IDE      │  │ + GA     │  │ Codex /...  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
│       │              │              │               │         │
│       └──────────────┴──────┬──────┴───────────────┘         │
│                             │ MCP Protocol (stdio)            │
└─────────────────────────────┼────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                   ProjectMind 核心层                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │               Context Manager                         │    │
│  │        项目上下文的中央调度器                          │    │
│  └────┬──────────┬──────────┬──────────┬───────────────┘    │
│       │          │          │          │                     │
│  ┌────▼──┐  ┌───▼───┐  ┌──▼────┐  ┌──▼──────────┐         │
│  │Event  │  │Summary│  │Judgment│  │ MCP Server   │         │
│  │Sourcing│  │Engine │  │Gate   │  │ (stdio RPC)  │         │
│  └────┬──┘  └───────┘  └───────┘  └──────────────┘         │
│       │                                                      │
│  ┌────▼──────────────────────────────────────────────────┐  │
│  │              存储层                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │  │
│  │  │ FileStore    │  │ MemoryStore │  │ Templates     │  │  │
│  │  │ (JSON Lines) │  │ (LRU Cache) │  │ (Markdown)    │  │  │
│  │  └──────┬──────┘  └─────────────┘  └──────┬────────┘  │  │
│  └─────────┼──────────────────────────────────┼───────────┘  │
└────────────┼──────────────────────────────────┼──────────────┘
             │                                  │
┌────────────▼──────────────────────────────────▼──────────────┐
│         项目目录 .pmd/ 文件系统                               │
│                                                              │
│  .pmd/                                                       │
│  ├── events.jsonl     ← 不可变事件日志（JSON Lines）        │
│  ├── config.json      ← 项目配置                            │
│  ├── summary.md       ← AI 复盘摘要（自动生成）             │
│  ├── index.md         ← 项目索引                            │
│  ├── architecture.md  ← 架构设计记录                        │
│  ├── decisions.md     ← 决策日志                            │
│  ├── bugs.md          ← Bug 追踪                            │
│  ├── features.md      ← 功能开发记录                        │
│  └── review.md        ← 复盘总结记录                        │
│                                                              │
│  .pmdrules            ← AI 规则文件（每次对话前必读）       │
└──────────────────────────────────────────────────────────────┘
```

### 架构分层

| 层级 | 职责 | 技术实现 |
|------|------|----------|
| **AI 平台层** | 各种 AI 开发工具 | MCP stdio 协议 |
| **核心层** | 上下文管理逻辑 | TypeScript |
| **存储层** | 数据持久化 | JSON Lines + 文件系统 |
| **项目目录层** | 最终交付物 | Markdown + JSON |

---

## 核心概念

### 1. 事件类型（EventType）

覆盖项目全生命周期的 11 种关键事件类型：

| 事件类型 | 用途 | 示例 |
|----------|------|------|
| `project_init` | 项目初始化 | "初始化 React + TypeScript 前端项目" |
| `architecture` | 架构设计 | "决定采用微服务架构" |
| `decision` | 决策记录 | "选择 PostgreSQL 作为主数据库" |
| `bug` | Bug 报告 | "登录页面在 iOS 上白屏" |
| `bug_fix` | Bug 修复 | "修复了 iOS 上 Flexbox 兼容性问题" |
| `feature` | 功能开发 | "实现用户权限管理模块" |
| `feature_done` | 功能完成 | "权限管理模块通过测试" |
| `perf_issue` | 性能问题 | "首页加载时间超过 5 秒" |
| `perf_optimization` | 性能优化 | "添加懒加载使首页加载降至 1.2 秒" |
| `review` | 复盘总结 | "第一阶段开发复盘" |
| `note` | 笔记 | "此区域代码需要特别小心并发问题" |

### 2. 预操作判断（Judgment Gate）

Judgment Gate 是一个**确定性判断层**，在 AI 执行操作前检查：

```
AI: "我来修复这个空指针异常，在 run.ts:42 加个 if guard"
                                    │
                    Judgment Gate 检查 │
                                    ▼
  ┌─ 1. 关键词匹配历史失败事件 ────→ "run.ts:42 的空指针之前试过 if guard，
  │                                  但栈上层的空值才是根因——那次失败了"
  ├─ 2. 检查涉及文件是否脆弱 ─────→ "src/utils/parser.ts 被修改过 7 次，
  │                                  是脆弱区域"
  ├─ 3. 检查待处理决策 ──────────→ "无相关待决策项"
  │
  └─ 结果: ⚠️ 警告 + 建议查阅历史事件 #0042
```

### 3. AI 复盘摘要（AISummary）

摘要引擎从事件日志中智能分析生成：

```json
{
  "projectState": "项目共记录了 47 个事件，已完成 3 个功能...",
  "recentActivity": "最近 10 条活动记录...",
  "unresolvedIssues": ["[Bug] 登录页白屏 (pending)", "[Bug] 导出 CSV 乱码 (failed)"],
  "pendingDecisions": ["[architecture] 是否需要引入状态管理库"],
  "lessonsLearned": ["在 parser.ts 上加 if-not-x 不能解决空指针，根因在调用方"],
  "fragileAreas": ["src/utils/parser.ts (修改 7 次)", "src/pages/login.tsx (修改 5 次)"],
  "failedAttempts": ["iOS Flexbox 修复: 尝试了 position:fixed 但导致键盘遮挡"],
  "nextSuggestedAction": "优先处理 2 个未解决的 Bug..."
}
```

### 4. .pmdrules 规则文件

放置在项目根目录，定义了 AI 在每次对话前必须执行的操作：

```markdown
## 每次对话前必须执行的操作

1. 运行 `npx pmd review` → 获取项目复盘上下文
2. 阅读 `.pmd/summary.md` → 了解最新状态
3. 使用 Judgment Gate 检查操作是否与历史失败重复
```

任何支持 MCP 或 CLI 的 AI 工具都可以遵循这些规则。

---

## 快速开始

### 安装

```bash
# 全局安装
npm install -g project-mind

# 或从源码编译
git clone <repo-url>
cd project-mind
npm install
npm run build
npm link
```

### 初始化项目

```bash
# 进入你的项目目录
cd my-project

# 初始化 ProjectMind 上下文
pmd init "我的项目" --description "一个使用 React + Node.js 的全栈项目"

# 输出：
# 🚀 正在初始化项目 "我的项目"...
# ✅ .pmd 目录已创建: /path/to/my-project/.pmd
# 📄 已复制模板: index.md
# 📄 已复制模板: architecture.md
# ...
# 📋 已生成规则文件: .pmdrules
```

### 开始使用

**记录架构决策：**

```bash
pmd log architecture "采用微服务架构" \
  --description "将后端拆分为用户服务、订单服务和支付服务，使用 RabbitMQ 通信" \
  --tags "架构,后端" \
  --outcome success
```

**记录 Bug 和修复过程：**

```bash
# 记录 Bug
pmd log bug "iOS 登录页白屏" \
  --description "首次打开登录页，点击输入框后页面白屏" \
  --location "src/pages/login.tsx" \
  --tags "iOS,UI" \
  --outcome pending

# 记录修复尝试（失败）
pmd log bug_fix "尝试 position:fixed 修复" \
  --description "给输入框加了 position:fixed，键盘弹出不遮挡了但页面滚动失败" \
  --location "src/pages/login.tsx" \
  --tags "iOS,UI,CSS" \
  --outcome failed \
  --relatedEvents <上一步的事件ID>

# 记录成功修复
pmd log bug_fix "使用 visualViewport API 修复" \
  --description "监听 visualViewport 的 resize 事件调整布局" \
  --location "src/pages/login.tsx" \
  --tags "iOS,UI,viewport" \
  --outcome success \
  --relatedEvents <上一步的事件ID>
```

**生成复盘摘要：**

```bash
pmd summarize
```

**生成 AI 对话前的复盘上下文：**

```bash
pmd review

# 输出：
# # 项目复盘上下文 - 我的项目
# > 生成时间: 2026-06-22T...
# ...
# ## 失败的尝试（避免重复）
# - ❌ 尝试 position:fixed 修复: 给输入框加了 position:fixed...
```

**打包导出：**

```bash
# 导出为 JSON（跨 AI 共享）
pmd pack --format json --output ./context-backup.json

# 导出为 Markdown（人类可读）
pmd pack --format markdown --output ./context-report.md
```

---

## 命令参考

| 命令 | 描述 | 必选参数 | 选项 |
|------|------|----------|------|
| `pmd init` | 初始化项目上下文 | `<name>` | `-d, --description` |
| `pmd log` | 记录事件 | `<type> <title>` | `-d, -l, -t, -o, -i` |
| `pmd summarize` | 生成复盘摘要 | — | `-o, --output` |
| `pmd review` | 生成复盘上下文 | — | `-s, --save` |
| `pmd pack` | 打包导出上下文 | — | `-f, --format; -o, --output` |
| `pmd mcp` | 启动 MCP 服务器 | — | — |

### 事件类型（`pmd log` 的 `<type>` 参数）

```
project_init       architecture     decision
bug                bug_fix          feature
feature_done       perf_issue       perf_optimization
review             note
```

### log 命令的详细选项

| 选项 | 简写 | 说明 |
|------|------|------|
| `--description` | `-d` | 事件详细描述（支持多行） |
| `--location` | `-l` | 关联的文件路径 |
| `--tags` | `-t` | 逗号分隔的标签列表 |
| `--outcome` | `-o` | 结果状态：`success/failed/partial/pending` |
| `--interactive` | `-i` | 交互式输入模式 |

---

## AI 平台集成

### MCP 协议支持

ProjectMind 通过 **MCP (Model Context Protocol)** 实现跨 AI 平台的集成。任何支持 MCP 的 AI 工具都可以直接使用 ProjectMind 的上下文管理能力。

#### Claude Desktop / Cursor IDE

将以下配置添加到 MCP 设置中：

```json
{
  "mcpServers": {
    "project-mind": {
      "command": "npx",
      "args": ["project-mind", "mcp"],
      "description": "ProjectMind - 项目全生命周期 AI 上下文管理系统"
    }
  }
}
```

详细配置请参考 `mcp-config/claude.json`。

#### Continue.dev (VS Code 插件)

```yaml
mcpServers:
  - name: project-mind
    command: npx
    args: ["project-mind", "mcp"]
```

#### OpenAI Codex CLI

```toml
[mcp_servers.project-mind]
command = "npx"
args = ["project-mind", "mcp"]
enabled = true
```

### MCP 工具清单

启动 MCP 服务器后，AI 平台可以调用以下工具：

| 工具名称 | 描述 | 核心参数 |
|----------|------|----------|
| `get_context` | 获取项目上下文快照 | `projectPath` |
| `get_summary` | 获取 AI 复盘摘要 | `projectPath`, `detailed` |
| `record_event` | 记录新事件 | `type`, `title`, `description`, `location`, `tags`, `outcome` |
| `check_action` | 预操作检查 | `action` (要执行的操作描述) |
| `pack_context` | 打包导出上下文 | `format`, `output` |

### 不使用 MCP 的集成方式

如果 AI 平台不支持 MCP，ProjectMind 仍然可以通过以下方式工作：

1. **CLI 输出** — AI 可以执行 `npx pmd review` 并读取输出
2. **文件读取** — AI 可以直接读取 `.pmd/` 目录下的 Markdown 文件
3. **打包文件** — 导出为 JSON/Markdown 后交给任何 AI 平台

---

## 工作流程示例

### 典型工作流

```
【项目启动】
  pmd init "电商平台" --description "Next.js + Supabase 全栈电商"
  
  ↓
  
【架构设计】
  pmd log architecture "采用 T3 Stack 架构" --description "..." --outcome success
  pmd log decision "使用 Prisma ORM" --description "..." --outcome success
  
  ↓
  
【功能开发循环】
  pmd log feature "实现用户注册" --description "..." --outcome pending
  → AI 开发中...
  pmd log feature_done "用户注册完成" --description "..."
  → 自动触发摘要更新
  
  ↓
  
【Bug 修复循环】
  pmd log bug "注册页验证码不显示" --location "pages/register.tsx" --outcome pending
  → AI 尝试修复方案 A：
    pmd log bug_fix "方案A: rel=canonical 修复" --outcome failed --relatedEvents <bugId>
  → AI 尝试修复方案 B：
    pmd log bug_fix "方案B: 调整 CSP 策略" --outcome success --relatedEvents <bugId>
  
  ↓
  
【性能优化】
  pmd log perf_issue "首页 LCP 超过 4s" --location "pages/index.tsx"
  pmd log perf_optimization "添加图片懒加载 + 预加载关键资源" --outcome success
  
  ↓
  
【复盘总结】
  pmd log review "Sprint 1 复盘" --description "经验：..."

→ 任何时候切换 AI 会话：
  pmd review  → AI 复盘上下文（获取完整项目状态）
```

### 跨会话示例

```bash
# 会话 1：与 Claude Desktop 配合
$ pmd init "Blog App"
$ pmd log architecture "Pages Router + Tailwind CSS"
$ pmd log feature "实现文章列表页" --outcome pending
# Claude 帮助开发了文章列表页...
$ pmd log feature_done "文章列表页完成"

# 关闭聊天，第二天打开 VS Code + Copilot

# 会话 2：与 GitHub Copilot 配合
$ pmd review
# 输出项目完整复盘上下文
# Copilot 读取后：
# "我了解到这是 Blog App 项目，使用了 Pages Router + Tailwind CSS，
#  文章列表页已完成。请问今天要做什么？"
```

---

## 开发指南

### 项目结构

```
project-mind/
├── src/
│   ├── cli.ts                    # CLI 入口（commander）
│   ├── types/index.ts            # 类型定义
│   ├── core/
│   │   ├── context-manager.ts    # 上下文管理器（中枢调度）
│   │   ├── event-sourcing.ts     # 事件溯源引擎
│   │   ├── summary-engine.ts     # 摘要生成引擎
│   │   └── judgment-gate.ts      # 预操作判断门
│   ├── storage/
│   │   ├── file-store.ts         # 文件存储（JSON Lines）
│   │   └── memory-store.ts       # 内存缓存（LRU）
│   ├── mcp/
│   │   ├── server.ts             # MCP 服务器（stdio JSON-RPC）
│   │   └── tools.ts              # MCP 工具定义
│   └── commands/
│       ├── init.ts               # init 命令
│       ├── log.ts                # log 命令
│       ├── summarize.ts          # summarize 命令
│       ├── review.ts             # review 命令
│       └── pack.ts               # pack 命令
├── templates/                    # 项目启动模板（7个 Markdown 文件）
├── mcp-config/                   # AI 平台 MCP 配置模板
├── package.json
└── tsconfig.json
```

### 构建

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式（监视文件变化）
npm run dev
```

### 核心架构说明

**ContextManager** 是整个系统的中枢，聚合了五个子模块：

```
ContextManager
  ├── EventSourcing    → 不可变事件日志的追加、查询、重放
  ├── SummaryEngine    → 事件分析、模式检测、摘要生成
  ├── JudgmentGate     → 预操作检查、重复方案检测
  ├── FileStore        → JSON Lines 文件读写、配置存储
  └── MemoryStore      → LRU 缓存加速查询
```

### 存储格式

事件日志使用 **JSON Lines** 格式，每行一个完整的事件对象：

```json
{"id":"a1b2c3","type":"bug","timestamp":"2026-06-22T10:30:00Z","title":"iOS 白屏","description":"点击输入框后页面白屏","location":"src/pages/login.tsx","tags":["iOS","UI"],"outcome":"pending","relatedEvents":[],"metadata":{}}
```

这种格式的优势：
- **追加写入** — O(1) 写入性能，无需解析整个文件
- **可 grep** — 直接用命令行搜索
- **Git 友好** — 每行一个 JSON，diff 清晰
- **易于解析** — 逐行 JSON.parse

---

## 最佳实践

### 1. 在项目初始化时就启用 ProjectMind

不要等到项目变大后再添加。从一开始就使用 ProjectMind，AI 可以完整了解项目的**设计初衷和演进过程**。

### 2. 记录失败的尝试

失败的修复方案比成功的更有价值——它们能帮 AI 避免走弯路。**任何时候记录 bug_fix 时如果 outcome 为 failed，Judgment Gate 会自动在后续检查中匹配类似方案。**

```bash
# ✅ 好的实践：记录失败方案的具体原因
pmd log bug_fix "尝试 X 方案" --outcome failed --description "失败原因：..."

# ❌ 不好的实践：只记录成功
pmd log bug_fix "修复完成" --outcome success
```

### 3. 每次关键对话前后运行 summarize

```bash
# 对话前：了解当前状态
pmd review

# 对话后：更新项目上下文
pmd summarize
```

### 4. 使用关联事件构建关系图

当事件之间存在因果关系时，使用 `--relatedEvents` 关联它们：

```bash
pmd log bug "Bug A" --outcome pending
# → 得到事件 ID: abc123

pmd log bug_fix "修复尝试" --relatedEvents abc123 --outcome failed
pmd log bug_fix "最终修复" --relatedEvents abc123 --outcome success
pmd log decision "决定彻底重构该模块" --relatedEvents abc123
```

### 5. 阶段性复盘

完成一个里程碑后，执行 `pmd log review` 记录经验教训。这些内容会出现在下次 AI 对话的 review 上下文中。

### 6. 打包备份

在迁移项目、切换 AI 平台或交付时，打包导出上下文：

```bash
# 完整备份
pmd pack --format json --output ./backups/$(date +%Y%m%d)-context.json

# 交付报告
pmd pack --format markdown --output ./项目上下文报告.md
```

---

## Q&A

### Q: ProjectMind 会泄露我的代码吗？

不会。所有数据存储在项目本地的 `.pmd/` 目录中，**没有任何外部网络请求**。数据格式是纯文本（JSON Lines + Markdown），完全受你控制。MCP 服务器也只在本地 stdio 上运行。

### Q: 必须使用 MCP 吗？

不是必须的。MCP 提供了最佳集成体验，但 ProjectMind 同样支持：
- **CLI 方式**：AI 执行 `npx pmd review` 读取输出
- **文件方式**：AI 直接读取 `.pmd/` 下的 Markdown
- **打包方式**：导出为文件后交给任何 AI 平台

### Q: 事件日志会变得很大吗？

每个事件通常 200-500 字节。1000 个事件大约 200-500KB，对于现代项目来说非常轻量。当事件超过配置的阈值（默认 100 条）时，会自动触发摘要压缩。

### Q: 和 Git commit message 有什么区别？

Git 记录的是**代码变更**，ProjectMind 记录的是**AI 上下文**：
- Git: "fix: login page white screen on iOS"
- ProjectMind: "尝试了 position:fixed 失败，原因是键盘弹出改变了视口大小"
- Git 告诉 AI **改了哪里**，ProjectMind 告诉 AI **为什么这么改、改之前踩过什么坑**

两者是互补关系。

### Q: 如何迁移到新项目？

```bash
# 在旧项目打包
cd old-project
pmd pack --format json -o ./context.json

# 在新项目导入
cd new-project
pmd init "新项目"
# 手动将 context.json 中的事件复制到 .pmd/events.jsonl
```

### Q: 团队多人协作时怎么用？

建议：
- 将 `.pmd/` 目录加入 Git 版本控制（建议配置 `.gitignore` 排除 `events.jsonl` 到 `.gitignore` 中，或者在 CI 中自动生成摘要）
- 核心架构决策记录在模板文件中（会纳入 Git 管理）
- 团队成员各自运行 `pmd summarize` 保持同步

---

## 许可证

MIT License. 欢迎贡献和反馈。

---

> **ProjectMind** — 让每一个 AI 对话都不再从零开始。