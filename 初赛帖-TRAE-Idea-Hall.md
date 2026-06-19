# 【学习工作赛道】TRAE Idea Hall —— 大赛灵感 Demo 实时聚合展示平台

## 标签

`学习工作`

---

## 1. Demo 简介

**是什么：** 一个纯静态的 Demo 聚合展示网站（Web），自动从 TRAE 中文社区大赛报名专区爬取所有灵感帖，提取 HTML Demo 附件，以卡片形式按赛道分类展示，支持在线查看 Demo 和跳转社区原帖。

**面向谁：**
- 大赛参赛者：浏览他人创意产物，寻找灵感
- 大赛评委/组织者：快速了解整体参赛情况和赛道分布
- TRAE 社区用户：一键发现有趣的 AI 创意 Demo

**主要功能：**

| 功能 | 说明 |
|---|---|
| 自动爬取 & 增量更新 | Discourse API 三层提取策略，每日定时增量拉取 |
| 赛道分类 & 多维筛选 | 五大赛道标签筛选 + 关键词搜索 + 时间/浏览量/点赞排序 |
| 在线体验 & 一键跳转 | HTML Demo 新窗口直接打开，社区原帖一键直达 |
| 全量记录 & 无遗漏 | 无 Demo 帖子同样收录，确保所有报名帖记录在册 |

**在线体验地址：** https://luoqianshi.github.io/TRAE-AI-Creativity-Competition-Idea-Hall

> 当前已收录 **628** 个报名帖、**457** 个 HTML Demo，覆盖生活娱乐、学习工作、社会服务、硬件交互、社会公益五大赛道。

---

## 2. Demo 创作思路

**灵感来源：**
在浏览大赛报名专区时，发现大量优秀的 HTML Demo 被埋在帖子列表里。每次想看一个 Demo 都要：点进帖子 → 找到附件 → 下载 → 本地打开。600+ 个作品，没有一个统一的聚合入口。这本身就是一个值得用 TRAE 解决的社区问题。

**想解决的问题：**
- 报名帖分散，没有按赛道分类的统一展示
- HTML Demo 需要逐帖下载，无法在线直接体验
- 无法快速了解整体参赛情况和赛道分布
- 新作品没有实时更新机制，信息滞后

**为什么做这个方向：**
大赛的核心是「展示创意」，但展示渠道本身却不够高效。与其做一个新的创意产物，不如先解决「如何让所有创意产物被看见」这个基础设施问题。这个项目也是「用 TRAE 构建 TRAE 社区工具」的最佳实践。

---

## 3. Demo 体验地址

**在线访问（GitHub Pages）：**
https://luoqianshi.github.io/TRAE-AI-Creativity-Competition-Idea-Hall

**创意产物 HTML 文件：**
请查看下方附件中的 `创意展示-TRAE-Idea-Hall.html`，这是本项目的创意展示页面（CRT 开机动画 + 粗野主义排版 + 像素风格数据可视化）。

---

## 4. TRAE 实践过程

### 开发流程概览

整个项目从 0 到上线，完全由 TRAE 驱动开发，经历了以下迭代阶段：

**阶段一：技术调研 & 方案设计**
- 分析 Discourse API 结构，确定 Category ID: 39 为大赛报名专区
- 选择纯静态生成（SSG）方案：Python 爬虫 + Jinja2 模板 + GitHub Pages 托管
- 设计增量更新策略：通过 `data/demos.json` 记录已爬取 topic_id

**阶段二：核心爬虫开发**
- 实现 `DiscourseClient`：带速率限制和指数退避重试的 API 客户端
- 实现 `DemoExtractor`：三层 Demo 提取策略（HTML 附件 > Onebox 链接 > 关键词兜底）
- 实现 `DataManager`：增量更新、数据持久化、归档管理

**阶段三：前端 UI 开发**
- 提取 TRAE 官网赛道图标素材
- 实现 Canvas 2D 粒子动画背景（绿色粒子 + 距离连线 + 鼠标交互）
- 卡片布局：赛道筛选、关键词搜索、排序功能
- 响应式设计，移动端适配

**阶段四：自动化部署**
- GitHub Actions 配置：push 触发自动部署到 GitHub Pages
- TRAE 定时任务：每日 10:00 自动执行爬虫并推送更新

**阶段五：迭代优化**
- Logo 替换为 `trae_work.png`，添加 favicon
- emoji 替换为荧光绿 SVG 图标，提升高级感
- 全量重建数据：从 323 条扩展到 628 条，覆盖所有报名帖（含无 Demo 的）
- 创意展示页面：CRT 开机动画 + 粗野主义排版 + 像素风格数据可视化

### 技术架构

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
Jinja2 模板渲染 → 生成 index.html
    │
    ▼
Git push → GitHub Actions → GitHub Pages
```

**技术选型理由：** 纯静态生成（SSG），没有服务器、没有数据库、没有运行时依赖。GitHub Pages 免费托管，整条链路成本为零。

### 关键开发步骤截图

> （请在此处插入 TRAE 开发过程中的关键步骤截图，建议包含以下场景）
> 1. 爬虫代码开发阶段的对话界面
> 2. 前端 UI 调试阶段的对话界面
> 3. GitHub Actions 部署配置阶段的对话界面

### 关键任务 Session ID

> （请在此处补充实际开发过程中保留的 TRAE Session ID，不少于 3 个）
> - Session ID 1: [爬虫开发阶段]
> - Session ID 2: [前端 UI 开发阶段]
> - Session ID 3: [自动化部署配置阶段]
> - Session ID 4: [数据重建 & 迭代优化阶段]

---

## 附录：报名帖链接

报名帖地址：https://forum.trae.cn/t/topic/[报名帖topic_id]

---

**作者：** [@骆谦实](https://forum.trae.cn/u/%E9%AA%86%E8%B0%A6%E5%AE%9E/summary) · TRAE 中文社区
