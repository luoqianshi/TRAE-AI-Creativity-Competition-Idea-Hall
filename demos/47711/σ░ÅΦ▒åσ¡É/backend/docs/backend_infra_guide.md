# 后端基础设施与并行开发规范

## 1. 目录约定

后端采用经典 FastAPI 分层结构，统一以 `backend/app` 为应用根目录：

- `app/main.py`
  - 应用入口。
  - 负责 CORS、中间件、统一异常注册、启动初始化、静态上传目录挂载。
- `app/core`
  - 基础配置、异常、异常处理器、安全能力、启动初始化。
- `app/db`
  - `Base`、`engine`、`SessionLocal`。
- `app/models`
  - SQLAlchemy 模型。
  - 新模型创建后必须在 `app/models/__init__.py` 注册导出。
- `app/schemas`
  - 请求/响应 DTO。
  - 分为领域 schema 和公共 schema。
- `app/services`
  - 纯业务编排与数据写读，不放 FastAPI 路由代码。
- `app/api`
  - 依赖注入、路由聚合。
- `app/api/v1/endpoints`
  - 各业务域 router 文件。
  - 每个业务域只维护自己的 endpoint 文件，不跨域改别人的 router。
- `alembic`
  - 迁移环境。

## 2. 公共规范

### 2.1 统一响应模型

所有新接口统一返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

约定：

- `code = 0` 表示成功。
- 失败时 `code` 默认与 HTTP 状态码一致。
- 所有新接口使用 `app.schemas.response.ApiResponse[T]`。

### 2.2 统一异常处理

统一使用 `app.core.exceptions` 中的异常：

- `BadRequestException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`

不要在 service 层直接返回 `HTTPException`。统一抛业务异常，交给全局 handler 转标准响应。

### 2.3 JWT 鉴权依赖

统一使用：

- `app.api.deps.get_current_user`

约定：

- 前端把 token 放到 `Authorization: Bearer <token>`
- 需要登录的接口统一依赖 `get_current_user`
- service 层不自行解析 token

### 2.4 分页基础

统一使用：

- `app.schemas.pagination.PageParams`
- `app.schemas.pagination.PageData`
- `app.schemas.pagination.build_page_data`
- `app.api.deps.get_pagination_params`

分页查询约定：

- 查询参数：`page`、`size`
- 返回结构：`items + pagination`

### 2.5 文件上传基础约定

当前基础设施只提供公共服务约定，不提供业务域接口。

公共能力位置：

- `app.schemas.file`
- `app.services.file_service`

统一约定：

- 上传字段名固定为 `file`
- 目录字段名固定为 `folder`
- 文件服务返回 `StoredFile`
- 本地开发默认使用 `backend/uploads`
- 静态访问前缀固定为 `/uploads/<storage_key>`

## 3. 业务域并行开发边界

各业务窗口只需要在以下路径开发自己的内容：

- `app/models/<domain>.py`
- `app/schemas/<domain>.py`
- `app/services/<domain>_service.py`
- `app/api/v1/endpoints/<domain>.py`

不要改这些公共基础文件：

- `app/core/*`
- `app/db/*`
- `app/api/deps.py`
- `app/api/v1/api.py`
- `app/main.py`

如确实需要扩展公共能力，先合并到基础设施窗口，再统一调整。

## 4. Router 规范

每个域 router 文件必须导出同名变量：

```python
router = APIRouter(prefix="/forum", tags=["forum"])
```

当前统一聚合入口：

- `app/api/v1/api.py`

该文件已经预留以下域的自动挂载：

- `auth`
- `user`
- `oc`
- `chat`
- `forum`
- `activity`
- `commission`
- `shop`
- `generate`
- `file`

规则：

- 只要 `app/api/v1/endpoints/<domain>.py` 存在且暴露 `router`，聚合入口会自动挂载。
- 域模块不存在时会自动跳过，不阻塞后端启动。
- 如果模块存在但没有 `router`，启动会直接报错，防止假集成。

## 5. Alembic 使用约定

已初始化：

- `alembic.ini`
- `alembic/env.py`
- `alembic/script.py.mako`
- `alembic/versions/`

推荐流程：

1. 新增或修改模型。
2. 确保模型已在 `app/models/__init__.py` 注册。
3. 在 `backend` 目录执行：

```powershell
alembic revision --autogenerate -m "add forum tables"
alembic upgrade head
```

说明：

- 本地/测试环境如果未显式设置 `DATABASE_URL`，后端默认使用 `MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_USER`、`MYSQL_PASSWORD` 和 `MYSQL_DATABASE` 连接 MySQL。
- 当前应用启动仍会自动 `create_all`，用于本地快速起库起表。
- 正式迁移记录仍以 Alembic revision 为准。

## 6. 前端 API 目录约定

前端统一使用：

- `frontend/utils/api.js` 作为底层请求封装
- `frontend/api/*.js` 作为分域 API 封装

已预留：

- `frontend/api/auth.js`
- `frontend/api/user.js`
- `frontend/api/oc.js`
- `frontend/api/chat.js`
- `frontend/api/forum.js`
- `frontend/api/activity.js`
- `frontend/api/commission.js`
- `frontend/api/shop.js`
- `frontend/api/generate.js`
- `frontend/api/file.js`

约定：

- 每个文件只处理一个业务域。
- 页面层不要直接拼接 URL，统一从 `frontend/api/*.js` 调用。
- 新接口落地后，优先补齐对应域 API 文件，再接页面。

## 7. 最终集成说明

基础设施负责人最终只做两件事：

1. 检查每个域 router 是否能被 `app/api/v1/api.py` 正常加载。
2. 统一执行 import 检查与启动检查，修正跨模块引用错误。

各业务窗口交付前自检清单：

- endpoint 文件导出了 `router`
- 所有 schema / service / model import 正常
- 需要鉴权的接口已挂 `get_current_user`
- 返回值统一走 `ApiResponse`
- 列表接口统一走分页结构
