# ADR-0001: 拆解上帝模块 report_generator.py

- **状态**: 已接受
- **日期**: 2026-06-21
- **迭代**: P1-1
- **决策者**: 架构审查

## 背景

`reporting/report_generator.py` 在重构前为 1179 行的单文件，承担 7+ 种职责：

1. 数据库连接管理（ES/Neo4j/PG/MongoDB/MinIO）
2. 多源数据采集与聚合
3. LLM 调用与提示词构造
4. Markdown → HTML 渲染（含 XSS 消毒）
5. 报告持久化（MinIO/PG/MongoDB）
6. 报告差异计算（与前一天对比）
7. 业务编排（调度全流程）

这违反了单一职责原则（SRP），导致：
- 修改渲染逻辑可能意外影响持久化
- 测试困难——测试任一功能都需 mock 全部外部依赖
- 代码审查认知负担高
- 新成员上手困难

## 决策

按职责将纯函数子集抽取到独立模块，原模块保留编排职责：

| 抽取模块 | 职责 | 行数 |
|---------|------|------|
| `reporting/html_renderer.py` | Markdown→HTML、XSS 消毒、事件章节、降级报告 | 254 |
| `reporting/diff.py` | 报告差异计算（PG 主存 → MongoDB 降级） | 88 |
| `reporting/report_generator.py`（保留） | 连接管理、数据采集、LLM 调用、持久化、编排 | 912 |

**关键设计**：
- `diff.py` 通过依赖注入接收 `get_pg_pool` 和 `get_mongo_db` 回调，不直接依赖容器，便于单元测试
- `html_renderer.py` 的 `_format_*` 函数内部延迟 import `SourceMerger`，避免循环依赖
- `report_generator.py` 中的 6 个方法替换为委托调用，保持公共 API 不变

## 备选方案

1. **按层拆分（data/render/persist 三层）** — 否决，过度拆分会增加模块间通信成本
2. **策略模式（每种报告类型一个策略类）** — 已在 `report_strategies.py` 实现，与本次拆分正交
3. **完全拆分到 7 个模块** — 否决，编排逻辑强耦合数据采集和 LLM 调用，强行拆分反而增加复杂度

## 后果

**正面**：
- `report_generator.py` 从 1179 → 912 行（-23%）
- `html_renderer.py` 和 `diff.py` 可纯单元测试（无需 mock 数据库）
- 渲染逻辑变更不影响持久化代码

**负面**：
- 多了一层委托调用的间接性
- `html_renderer.py` 延迟 import `SourceMerger` 是妥协，理想情况应通过参数注入

## 验证

- `tests/test_html_renderer.py`：25 个测试覆盖 XSS 消毒、Markdown 转换、事件章节、降级报告
- `tests/test_diff.py`：8 个测试覆盖 PG 命中/降级/无差异/截断
- 全量 248 测试通过
