# ADR-0003: 统一连接池、嵌入生成与时区处理

- **状态**: 已接受
- **日期**: 2026-06-21
- **迭代**: P1-3/4/5 + P2-2c
- **决策者**: 架构审查

## 背景

P1 前项目存在三类"散落实现"问题：

### 连接池散落（15 处独立创建）
各模块直接 `aioredis.from_url()` / `AsyncGraphDatabase.driver()` 创建连接，绕过 `utils/db_pool.py` 的 `ConnectionPoolManager`，导致：
- 连接数失控（每个模块独立连接池）
- 配置不一致（decode_responses/max_connections 参数差异）
- 健康检查缺失

### 嵌入生成散落（3 处重复实现）
- `utils/embedding.py`：`all-MiniLM-L6-v2`（384 维）
- `analysis/event_detector.py`：`all-MiniLM-L6-v2`（重复加载模型）
- `pipelines/write_consumers.py`：`paraphrase-multilingual-MiniLM-L12-v2`（模型名不一致！）

### 时区散落（11 处硬编码）
`datetime.now(timezone(timedelta(hours=8)))` 散落在 11 个文件中，且：
- `utils/auth.py` 使用弃用的 `datetime.utcnow()`
- `reporting/subscription.py` 未读取 `BUSINESS_TZ_OFFSET` 环境变量

## 决策

### 统一连接池（P1-3 + P2-2c）
所有数据库连接优先使用 `get_pool_manager()` 的子池，失败时降级到独立连接：

```python
async def _get_redis(self):
    if self._redis is None:
        try:
            pool = await get_pool_manager()
            self._redis = await pool.redis.get_connection()
            return self._redis
        except Exception as e:
            logger.warning(f"统一连接池 Redis 获取失败，降级到独立连接: {e}")
        self._redis = aioredis.from_url(self.redis_url, decode_responses=True)
    return self._redis
```

**例外**：`pipelines/standardization.py` 的同步 Redis 客户端保持独立创建（Bytewax 同步环境无法使用 async pool_manager）

**涉及模块**（P1-3 + P2-2c 共 7 处）：
- `analysis/neo4j_writer.py`、`analysis/event_evolution.py`、`analysis/entity_extractor.py`、`analysis/event_detector.py`
- `ingestion/status_recorder.py`
- `collectors/base.py`、`utils/stream_consumer.py`、`ingestion/redis_publisher.py`

### 统一嵌入生成（P1-4）
- 统一模型名：`sentence-transformers/all-MiniLM-L6-v2`（384 维）
- `utils/embedding.py` 提供 3 个入口：`generate_embedding()`（异步单条）、`generate_embeddings_batch()`（异步批量）、`generate_embedding_sync()`（同步）
- 提供 `reset_embedding_model()` 测试钩子，强制走 hash 降级
- 删除 `event_detector.py`、`write_consumers.py`、`standardization.py` 的重复实现

### 统一时区（P1-5）
创建 `utils/timezone.py`，提供：
- `BUSINESS_TZ`：从 `BUSINESS_TZ_OFFSET` 环境变量读取（默认 8）
- `business_now()` / `utc_now()` / `utc_now_naive()` / `business_now_naive()`
- `to_business(dt)`：naive datetime 视为 UTC 转换为业务时区
- `business_date_today()` / `business_date_yesterday()`

迁移 11+ 处硬编码，修复 `auth.py` 弃用 API 和 `subscription.py` 环境变量 bug。

## 备选方案

### 连接池
- **强制使用 pool_manager，无降级**：否决，独立进程（Bytewax worker）可能无法访问 pool_manager 初始化路径
- **移除 pool_manager，全部独立创建**：否决，连接数失控

### 嵌入
- **统一用 768 维模型**：否决，384 维已满足语义相似度需求，且内存占用更小
- **移除 hash 降级**：否决，sentence-transformers 是可选依赖，降级保证可用性

### 时区
- **用 pytz/zoneinfo 库**：否决，标准库 `datetime.timezone` 已足够，减少依赖
- **全用 UTC，展示层转换**：否决，业务逻辑（如"今日报告"）需要业务时区

## 后果

**正面**：
- 连接数可控，统一配置和健康检查
- 嵌入模型名一致，避免向量维度不匹配
- 时区可配置（`BUSINESS_TZ_OFFSET`），支持多时区部署
- 降级路径保证可用性

**负面**：
- 降级路径增加代码复杂度（try/except 包裹）
- `standardization.py` 的同步 Redis 是例外，破坏一致性

## 验证

- `tests/test_timezone.py`：14 个测试
- `tests/test_embedding.py`：16 个测试（hash 降级路径）
- `tests/test_db_pool.py`：39 个测试（连接池初始化/获取/关闭/健康检查）
- 全量 248 测试通过
