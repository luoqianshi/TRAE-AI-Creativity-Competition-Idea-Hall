# ADR-0004: 工具层统一与死代码清理

- **状态**: 已接受
- **日期**: 2026-06-21
- **迭代**: P2-2
- **决策者**: 架构审查

## 背景

P2 调研发现 `utils/` 工具层存在三类问题：

### 死代码（766 行未使用）
- `utils/stream_optimizer.py`（458 行）：定义了 `StreamOptimizer`、`BatchProcessor` 等类，全项目无任何 import
- `utils/business_metrics.py`（308 行）：定义了 `BusinessMetricsCollector`，全项目无任何 import

### 散落工具函数
通用工具函数散落在非 `utils/` 目录，违反"工具函数集中在 utils/"约定：
- `pipelines/text_utils.py`：纯函数 `clean_text()`，无外部依赖
- `pipelines/simhash.py`：纯函数 `compute_simhash()` 等 + `SimHashDeduplicator` 类
- `analysis/source_merger.py`：纯工具类 `SourceMerger`，无外部依赖

### Redis 连接绕过（5 处）
`collectors/base.py`、`utils/stream_consumer.py`、`ingestion/redis_publisher.py` 直接 `aioredis.from_url()` 绕过统一连接池。

## 决策

### 删除死代码
- 删除 `utils/stream_optimizer.py`（458 行）
- 删除 `utils/business_metrics.py`（308 行）

### 移动散落工具到 utils/
| 源文件 | 目标 | 说明 |
|--------|------|------|
| `pipelines/text_utils.py` | `utils/text_utils.py` | 纯函数，更新 3 处 import |
| `pipelines/simhash.py` | `utils/simhash.py` | 纯函数 + SimHashDeduplicator，更新 2 处 import |
| `analysis/source_merger.py` | `utils/source_merger.py` | 纯工具类，更新 3 处 import |

`pipelines/__init__.py` 的 re-export 保持不变（`from utils.text_utils import clean_text`），公共 API 兼容。

### 统一 Redis 连接（P2-2c）
3 处独立连接改为 pool_manager 优先 + 降级（详见 ADR-0003）。

## 备选方案

### 死代码
- **保留以备后用**：否决，YAGNI 原则，766 行死代码增加维护负担和认知成本
- **标记 deprecated 而非删除**：否决，无任何引用，直接删除更干净

### 散落工具
- **保留在原目录**：否决，违反工具层统一约定，且 `analysis/source_merger.py` 被 `reporting/html_renderer.py` 跨层引用
- **只移动纯函数，保留有状态类**：否决，`SimHashDeduplicator` 和 `SourceMerger` 与纯函数强耦合，拆分增加复杂度

## 后果

**正面**：
- `utils/` 工具层职责清晰，所有通用工具集中管理
- 删除 766 行死代码，减少维护负担
- `source_merger` 移到 utils/ 后，`html_renderer` 不再跨层引用 analysis/
- 工具函数可独立测试，不受业务模块初始化影响

**负面**：
- `pipelines/simhash.py` 的 `SimHashDeduplicator` 依赖 Redis，移到 utils/ 后 utils 层引入了 Redis 依赖（但已通过 pool_manager 统一）
- import 路径变更需更新文档和外部引用（本项目无外部包引用）

## 验证

- 全量 248 测试通过
- `ruff check` 通过（`standardization.py` 的 F821 误报为预存问题）
- `pipelines/__init__.py` 的 `__all__` 导出不变，公共 API 兼容
