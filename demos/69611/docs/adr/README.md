# 架构决策记录（ADR）索引

本目录记录 OmniLog Intelligence 项目的架构决策。每个 ADR 遵循 [Michael Nygard 模板](https://github.com/joelparkerhenderson/architecture-decision-record)。

## ADR 列表

| 编号 | 标题 | 状态 | 日期 | 迭代 |
|------|------|------|------|------|
| [0001](0001-decompose-god-module.md) | 拆解上帝模块 report_generator.py | 已接受 | 2026-06-21 | P1-1 |
| [0002](0002-enable-di-container.md) | 启用 DI 容器统一服务生命周期 | 已接受 | 2026-06-21 | P1-2 |
| [0003](0003-unify-connection-embedding-timezone.md) | 统一连接池、嵌入生成与时区处理 | 已接受 | 2026-06-21 | P1-3/4/5 + P2-2c |
| [0004](0004-unify-utils-layer.md) | 工具层统一与死代码清理 | 已接受 | 2026-06-21 | P2-2 |

## 编写规范

- **文件名**：`NNNN-kebab-case-title.md`（N 为四位序号，从 0001 开始）
- **状态**：提议 / 已接受 / 已废弃 / 已替代
- **必含章节**：背景、决策、备选方案、后果、验证
- **日期**：ISO 8601 格式（YYYY-MM-DD）
- **语言**：中文
