# AI比价大师 - TRAE AI创造力大赛参赛作品

## 项目简介
AI驱动的消费前比价与碳普惠系统。用户搜索想买的商品，系统给出比价卡片，展示省钱金额和复利预期，AI人格全程陪伴消费决策。

## 文件说明

| 文件 | 说明 |
|------|------|
| `trae-contest-bijia.html` | 参赛展示页面（项目介绍、功能说明、架构图） |
| `AI-BiJia-Master-Demo.html` | **可交互Demo**（双击打开即可体验完整功能） |
| `_shared/` | 展示页依赖的JS库（ECharts、Mermaid） |
| `assets/` | 展示页图片资源 |

## 如何体验
1. **交互Demo**：直接双击 `AI-BiJia-Master-Demo.html` 在浏览器中打开，即可体验比价搜索、AI对话、复利计算、低碳足迹等全部交互功能（无需联网）
2. **展示页面**：直接双击 `trae-contest-bijia.html` 查看完整的项目介绍

## 核心功能
- 消费前比价（3km本地+线上平台）
- AI人格陪伴（14种角色，先附和再打破策略）
- 复利展示（省钱自动入钱包，可视化增长）
- 低碳行为激励（对接碳普惠体系）
- 智能钱包（Round-Up自动储蓄）

## 技术栈
- 后端：Express 4 + TypeORM + PostgreSQL 16 + Redis 7
- 移动端：uni-app 3.0 + Vue 3 + Pinia + Vite 5
- 管理端：Vue 3 + Element Plus + Vite 8
- AI：智谱清言 GLM-4-Flash（OpenAI兼容）

## 许可
MIT License
