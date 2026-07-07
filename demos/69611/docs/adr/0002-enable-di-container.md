# ADR-0002: 启用 DI 容器统一服务生命周期

- **状态**: 已接受
- **日期**: 2026-06-21
- **迭代**: P1-2
- **决策者**: 架构审查

## 背景

项目已有 `utils/di_container.py`（173 行）提供 `DependencyContainer` 类，但在 P1 前完全未使用。服务获取依赖两种模式：

1. **Setter 注入**：`main.py` lifespan 启动时调用 `set_xxx()` 将服务注入路由/调度器（5 处）
2. **全局单例**：模块级 `_global_xxx` 变量 + `get_xxx()` 工厂函数（22 处）

问题：
- Setter 注入与全局单例两套路径并存，消费者需知道用哪种
- 服务生命周期无人管理——进程退出时连接不释放
- 测试困难——全局单例难以隔离
- 启动顺序耦合——`set_xxx()` 必须在 `get_xxx()` 之前调用，否则 NoneType 错误

## 决策

采用**双路径解析 + 统一生命周期管理**：

1. **Setter 注入同时注册到容器**：`set_xxx()` 内部调用 `register_service("xxx", instance)`
2. **消费者双路径解析**：优先用 setter 注入的实例，降级到 `resolve_service("xxx")`
3. **关闭时统一释放**：`main.py` lifespan shutdown 调用 `get_container().dispose_all()`

```python
# Setter 注入（注册到容器）
def set_reports_collection(collection):
    global _reports_collection
    _reports_collection = collection
    register_service("reports_collection", collection)

# 消费者双路径解析
def _resolve_reports_collection():
    if _reports_collection is not None:
        return _reports_collection
    return resolve_service("reports_collection")
```

**涉及模块**：
- `main.py`：lifespan 注册 config/pool_manager/reports_collection/ingestion_scheduler/alert_router
- `routes/reports.py`、`routes/health.py`、`services/scheduler_service.py`：双路径解析
- `utils/reconciliation.py`：alert_callback 注册到容器

## 备选方案

1. **完全迁移到容器**：移除所有全局单例和 setter 注入，全部用 `resolve_service()` — 否决，改动范围过大，且全局单例在独立脚本（如 Bytewax pipeline）中仍有价值
2. **移除容器，统一用 setter**：否决，容器提供 `dispose_all()` 生命周期管理，setter 无法实现
3. **用 FastAPI Depends**：否决，Depends 仅在请求作用域有效，后台任务和调度器无法使用

## 后果

**正面**：
- 服务生命周期统一管理，进程退出时 `dispose_all()` 释放所有连接
- 测试可通过 `register_service()` 注入 mock，无需修改全局变量
- 双路径保证向后兼容，渐进式迁移

**负面**：
- 双路径增加认知复杂度（需理解 setter 优先 + 容器降级）
- 迁移未完成——22 处全局单例仍存在，需后续迭代逐步迁移

## 验证

- `tests/test_di_container.py`：17 个测试覆盖 register/resolve/factory/dispose/scope
- 全量 248 测试通过
