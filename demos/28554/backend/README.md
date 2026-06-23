# 幼儿园财务管理系统后端

基于 Node.js + Express + MySQL 的 RESTful API 后端服务。

## 功能特性

- 用户认证（JWT + bcrypt 密码加密）
- 基于角色的权限管理（RBAC）
- 机构、班级、类目、费用、管理员全流程管理
- 操作日志记录
- 数据统计与分析
- CORS 跨域支持
- 请求验证与错误处理
- Winston 日志记录

## 技术栈

- **Node.js**: 20+
- **Express**: 4.x
- **MySQL**: 8.0+
- **bcrypt**: 密码加密
- **jsonwebtoken**: JWT 认证
- **express-validator**: 参数验证
- **cors**: 跨域支持
- **winston**: 日志管理
- **dotenv**: 环境变量管理

## 目录结构

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # 数据库连接配置
│   ├── controllers/         # 控制器层
│   │   ├── adminController.js
│   │   ├── adminManagementController.js
│   │   ├── categoryController.js
│   │   ├── classController.js
│   │   ├── expenseController.js
│   │   ├── logController.js
│   │   └── organizationController.js
│   ├── middleware/
│   │   ├── auth.js          # 认证与权限中间件
│   │   └── errorHandler.js  # 错误处理
│   ├── routes/              # API 路由
│   │   ├── auth.js
│   │   ├── organizations.js
│   │   ├── classes.js
│   │   ├── categories.js
│   │   ├── expenses.js
│   │   ├── admins.js
│   │   └── logs.js
│   └── server.js            # 服务入口
├── .env                     # 环境变量（需自行创建）
├── .env.example            # 环境变量示例
├── package.json
└── README.md
```

## 快速开始

### 1. 环境准备

确保安装了 Node.js 20+ 和 MySQL 8.0+。

### 2. 数据库初始化

使用 `database/schema.sql` 创建数据库表结构，然后使用 `database/seed.sql` 插入初始数据。

**注意**：在插入管理员数据前，需要先运行 `node database/generate-hash.js` 生成密码哈希。

```bash
# 1. 导入 schema
mysql -u root -p caiwu < database/schema.sql

# 2. 生成密码哈希
cd database
node generate-hash.js

# 3. 复制生成的哈希值，替换 seed.sql 中的占位符

# 4. 导入初始数据
mysql -u root -p caiwu < database/seed.sql
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

复制 `.env.example` 为 `.env` 并根据实际情况修改数据库配置：

```bash
cp .env.example .env
```

必需配置：
- `DB_HOST`: 数据库主机
- `DB_PORT`: 数据库端口
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_DATABASE`: 数据库名
- `JWT_SECRET`: JWT 密钥（生产环境请使用强随机字符串）

### 5. 启动服务

开发模式（支持热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务默认运行在 `http://localhost:3001`。

## API 文档

### 认证接口

#### POST /api/auth/login
登录接口

请求体：
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": 1,
      "name": "李老师",
      "phone": "13800138000",
      "roles": ["SuperAdmin"],
      "permissions": ["expense:create", ...]
    }
  }
}
```

### 机构接口

- `GET /api/organizations` - 获取所有机构
- `POST /api/organizations` - 创建机构（需要 org:manage）
- `PATCH /api/organizations/:id/status` - 更新机构状态（需要 org:manage）

### 班级接口

- `GET /api/classes/by-org/:orgId` - 获取机构的班级列表
- `POST /api/classes` - 创建班级（需要 org:manage）
- `PATCH /api/classes/:id/status` - 更新班级状态（需要 org:manage）

### 类目接口

- `GET /api/categories` - 获取所有类目
- `POST /api/categories` - 创建类目（需要 category:manage）
- `PUT /api/categories/:id` - 更新类目（需要 category:manage）
- `DELETE /api/categories/:id` - 删除类目（软删除，需要 category:manage）

### 费用接口

- `GET /api/expenses` - 获取费用列表（支持筛选）
- `GET /api/expenses/:id` - 获取费用详情
- `POST /api/expenses` - 创建费用（需要 expense:create）
- `PUT /api/expenses/:id` - 更新费用（需要 expense:update）
- `DELETE /api/expenses/:id` - 删除费用（需要 expense:delete）
- `GET /api/expenses/stats/summary` - 获取统计摘要
- `POST /api/expenses/:id/approve` - 审批费用（需要 expense:update）

### 管理员接口（需要 admin:manage）

- `GET /api/admins` - 获取所有管理员
- `POST /api/admins` - 创建管理员
- `PATCH /api/admins/:id/status` - 更新管理员状态
- `POST /api/admins/:id/reset-password` - 重置密码
- `GET /api/admins/roles-permissions` - 获取所有角色和权限

### 操作日志接口（需要 log:view）

- `GET /api/logs` - 获取操作日志（支持筛选）

### 用户信息接口

- `GET /api/auth/me` - 获取当前管理员信息
- `POST /api/auth/change-password` - 修改密码

## 默认管理员账户

初始化后，有两个默认管理员账户：

| 姓名 | 手机号 | 密码   | 角色       |
|------|--------|--------|------------|
| 李老师 | 13800138000 | 123456 | SuperAdmin |
| 王老师 | 13900139000 | 123456 | Admin      |

> 注意：生产环境请务必修改默认密码。

## 权限系统

系统使用 RBAC（基于角色的访问控制）模型：

- **SuperAdmin**: 拥有所有权限
- **Admin**: 财务管理员，拥有费用管理、类目管理、机构管理和报表查看权限
- **Viewer**: 查看者，仅能查看费用和报表

所有需要权限的接口都会在文档中标注所需权限，中间件会自动检查用户是否拥有相应权限。

## 日志记录

所有关键操作都会被记录到 `operation_logs` 表中，包括：
- 用户登录/登出
- 机构、班级、类目、费用的增删改
- 管理员账户操作

前端可以通过 `/api/logs` 接口查看操作日志（需要 `log:view` 权限）。

## 开发指南

### 添加新的 API 接口

1. 在 `src/controllers/` 创建或修改控制器函数
2. 在 `src/routes/` 添加路由定义
3. 在 `src/server.js` 中注册路由
4. 如果需要权限控制，在路由定义中添加 `requirePermission()`

### 数据库操作

使用 `getConnection()` 获取数据库连接，然后执行查询：

```javascript
import { getConnection } from '../config/database.js';

const conn = await getConnection();
const [rows] = await conn.query('SELECT * FROM table WHERE id = ?', [id]);
```

所有查询建议使用参数化查询（? 占位符）防止 SQL 注入。

### 错误处理

使用 express 的错误处理中间件，控制器中抛出错误会自动被捕获：

```javascript
// 在控制器中
if (!record) {
  const err = new Error('记录不存在');
  err.statusCode = 404;
  throw err;
}
```

## 部署说明

### Docker 部署

可以创建 Dockerfile 和 docker-compose.yml 来简化部署。

### 环境变量

生产环境必须修改以下配置：
- `JWT_SECRET`: 使用强随机字符串
- `NODE_ENV=production`
- 数据库配置为生产数据库

### 日志查看

日志文件位于 `logs/` 目录：
- `combined.log`: 所有请求日志
- `error.log`: 错误日志

## 与前端集成

前端需要：
1. 将 API 请求发送到 `http://localhost:3001/api`
2. 登录成功后保存返回的 JWT token（localStorage 或 Cookie）
3. 后续请求在 Authorization header 中添加 `Bearer <token>`

示例：
```javascript
fetch('/api/expenses', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

## 故障排除

**错误: 数据库连接失败**
- 检查数据库是否启动
- 检查连接配置（host, port, user, password）
- 确认数据库 `caiwu` 已创建

**错误: 密码哈希不匹配**
- 确保在 `seed.sql` 中使用真实的 bcrypt 哈希值
- 运行 `node database/generate-hash.js` 生成哈希

**错误: 权限不足**
- 检查管理员账户是否关联了正确的角色
- 确保角色拥有所需的权限

## 许可证

MIT