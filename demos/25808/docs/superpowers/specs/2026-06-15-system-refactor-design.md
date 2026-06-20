# 国信金融酒店能耗系统 — 彻底重构规格文档

**版本**：v1.0.0
**日期**：2026-06-15
**状态**：已批准，待实施

---

## 1. 背景与目标

### 1.1 现状问题

| 优先级 | 问题 |
|--------|------|
| P0 | localStorage 无服务端备份，数据丢失风险 |
| P0 | 硬编码凭证 + 密码明文存储 |
| P0 | Prisma schema 与业务数据严重偏差（换表元数据字段缺失） |
| P1 | App.tsx 巨型组件，职责过重（360+ 行） |
| P1 | 换表计量逻辑分散在 4 个文件中 |
| P1 | 权限校验仅前端拦截，可被绕过 |

### 1.2 重构目标

1. 引入 Express 后端 + Prisma + SQLite，实现数据持久化
2. 消除硬编码凭证，引入 JWT 认证 + bcrypt 密码哈希
3. 修正 Prisma schema，支持换表/清零元数据
4. 前端架构拆分，降低单文件复杂度
5. 统一计算逻辑到 pricing.ts
6. 保留 localStorage 作为只读缓存（新数据写后端）

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  AppShell   │  │ RouteController │  │ View Components │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         └─────────────────┼──────────────────┘          │
│                    ┌──────▼──────┐                       │
│                    │  apiService │ (统一 HTTP + 错误处理) │
│                    └──────┬──────┘                       │
└───────────────────────────┼─────────────────────────────┘
                            │ HTTP + JWT Cookie
┌───────────────────────────▼─────────────────────────────┐
│                    Express Backend                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Controllers │→ │  Services   │→ │  Repositories   │ │
│  └─────────────┘  └─────────────┘  └────────┬────────┘ │
└─────────────────────────────────────────────┼───────────┘
                                              │
┌─────────────────────────────────────────────▼───────────┐
│                  Prisma ORM + SQLite                    │
│  DailyRecord │ MonthlyRecord │ User │ Config │ PriceHistory │
└──────────────────────────────────────────────────────────┘
```

### 2.2 分层规范

| 层 | 职责 |
|----|------|
| **视图层** | React 组件，仅做 UI 渲染和用户交互 |
| **业务层** | Hooks（useMeterRecords 等），处理业务逻辑和状态 |
| **服务层** | apiService.ts，统一封装 HTTP 请求和错误处理 |
| **后端 Controller** | 收参、响应、参数校验 |
| **后端 Service** | 纯业务逻辑（计算、权限判断） |
| **后端 Repository** | Prisma 数据库操作 |

---

## 3. 后端设计

### 3.1 技术栈

- **Runtime**：Node.js + Express
- **ORM**：Prisma
- **数据库**：SQLite（文件：`prisma/energy.db`）
- **认证**：JWT（`httpOnly` Cookie）+ bcrypt 密码哈希
- **验证**：Zod（请求参数校验）

### 3.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  role         String   // "superadmin" | "engineer_director" | "engineer_supervisor"
  name         String
  status       String   // "active" | "disabled"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model DailyRecord {
  id        String   @id @default(uuid())
  date      DateTime @unique
  readings  String   // JSON: { fieldId: value, swap_fieldId: bool, old_final_fieldId: num, new_start_fieldId: num }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model MonthlyRecord {
  id        String   @id @default(uuid())
  date      DateTime // 第一天 00:00:00
  circuitId String
  value     Float
  swap      Boolean  @default(false)
  oldFinal  Float?
  newStart  Float?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([date, circuitId])
}

model SystemConfig {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String   // JSON string
  updatedAt DateTime @updatedAt
}
```

**设计说明**：
- `DailyRecord.readings` 使用 JSON string 存储动态字段，支持任意字段扩展
- 换表/清零元数据（`swap_`、`old_final_`、`new_start_`）内嵌于 `readings` JSON 中
- `MonthlyRecord` 采用独立行存储每个回路，解决多回路字段扩展问题

### 3.3 API 设计

#### 认证接口

| Method | Path | Body | Response | 说明 |
|--------|------|------|----------|------|
| POST | `/api/auth/login` | `{username, password}` | `{user, token}` | 设置 httpOnly Cookie |
| POST | `/api/auth/logout` | - | `{success}` | 清除 Cookie |
| GET | `/api/auth/me` | - | `{user}` | 获取当前用户 |

#### 日常记录接口

| Method | Path | Body / Query | Response | 权限 |
|--------|------|--------------|----------|------|
| GET | `/api/records/daily` | `?startDate=&endDate=` | `DailyRecord[]` | 认证 |
| GET | `/api/records/daily/:date` | - | `DailyRecord` | 认证 |
| POST | `/api/records/daily` | `{date, readings}` | `DailyRecord` | 认证（主管及以上可改历史） |
| PUT | `/api/records/daily/:date` | `{readings}` | `DailyRecord` | 总监+超管 |

#### 月度记录接口

| Method | Path | Body / Query | Response | 权限 |
|--------|------|--------------|----------|------|
| GET | `/api/records/monthly` | `?month=` | `MonthlyRecord[]` | 认证 |
| POST | `/api/records/monthly` | `{month, records[]}` | `MonthlyRecord[]` | 认证（主管及以上可改历史） |

#### 配置接口

| Method | Path | Body | Response | 权限 |
|--------|------|------|----------|------|
| GET | `/api/config` | - | `SystemConfig` | 认证 |
| PUT | `/api/config` | `{key, value}` | `SystemConfig` | 总监+ |

#### 备份接口

| Method | Path | Body | Response | 权限 |
|--------|------|------|----------|------|
| POST | `/api/backup/export` | - | `JSON file` | 总监+ |
| POST | `/api/backup/import` | `FormData(file)` | `{imported}` | 超管 |

### 3.4 统一响应格式

```ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string; // 业务错误码
}
```

### 3.5 安全设计

| 措施 | 实现 |
|------|------|
| 密码哈希 | bcrypt，强度 12 |
| JWT 存储 | `httpOnly; Secure; SameSite=Strict` Cookie |
| JWT 有效期 | 24 小时 |
| 登录限流 | 5 分钟内失败 5 次，锁定 15 分钟（内存 Map） |
| 写操作权限 | 后端二次校验角色 + 日期 |
| SQL 注入 | Prisma 参数化查询 |
| CORS | 仅允许前端域名 |

---

## 4. 前端架构设计

### 4.1 App.tsx 拆分

**现状**：App.tsx 360+ 行，承担全局状态聚合、路由分发、组件渲染

**目标拆分**：

```
src/
├── App.tsx                    # 主入口，仅做 Provider 聚合
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # 整体布局框架（Sidebar + Header + main）
│   │   └── RouteController.tsx # 路由分发逻辑
│   └── ...
├── hooks/
│   ├── useAuth.ts            # 不变
│   ├── useEnergyConfig.ts     # 不变
│   ├── useMeterRecords.ts     # 改造为调用 apiService
│   └── useApi.ts             # 新增：统一 HTTP 封装
├── services/
│   └── apiService.ts          # 新增：统一 API 调用层
```

### 4.2 API Service 层

```ts
// services/apiService.ts
class ApiService {
  private baseUrl = '/api';

  private async request<T>(path: string, options?: RequestInit): Promise<T>;

  // 对外方法
  async login(username: string, password: string): Promise<User>;
  async getDailyRecords(params?: {startDate?: string; endDate?: string}): Promise<DailyRecord[]>;
  async saveDailyRecord(date: string, readings: Record<string, any>): Promise<DailyRecord>;
  async getMonthlyRecords(month: string): Promise<MonthlyRecord[]>;
  async saveMonthlyRecords(month: string, records: MonthlyRecordInput[]): Promise<MonthlyRecord[]>;
  async getConfig(): Promise<SystemConfig>;
  async updateConfig(key: string, value: any): Promise<SystemConfig>;
}
```

### 4.3 localStorage 策略

| 数据类型 | localStorage | 后端 | 说明 |
|----------|-------------|------|------|
| 用户会话 | 写 | 读（JWT Cookie） | 登录后从后端获取用户信息 |
| 抄表历史 | 只读缓存 | 主存储 | 首次加载从后端拉取，后续更新写后端 |
| 配置 | 读缓存 | 主存储 | 写入后端，同时更新本地缓存 |

---

## 5. 数据迁移设计

### 5.1 迁移脚本

**文件**：`scripts/migrate-localStorage.ts`

**流程**：
1. 从 localStorage 读取所有 key
2. 解析 JSON，转换为 Prisma 格式
3. 调用后端 API 批量写入 SQLite
4. 完成后输出迁移报告

**迁移 keys**：
- `酒店抄表历史` → `DailyRecord[]`
- `酒店月度抄表历史` → `MonthlyRecord[]`
- `系统字典限额` → `SystemConfig`
- `酒店日常回路配置` → `SystemConfig`
- `酒店月度回路配置` → `SystemConfig`

### 5.2 迁移后处理

- 迁移完成后，原 localStorage 数据保留（标记 `migrated: true`）
- 前端优先从后端读取，后端故障时降级读 localStorage

---

## 6. Phase 实施计划

### Phase 0：数据迁移工具（预估 0.5 天）

1. 创建 `scripts/migrate-localStorage.ts`
2. 实现 localStorage → 后端 API 的数据转换
3. 手动执行迁移，验证数据完整性

### Phase 1：后端骨架（预估 2 天）

1. 安装依赖（express, prisma, bcrypt, jsonwebtoken, zod, cors）
2. 重写 Prisma schema（含 JSON 字段支持）
3. 实现 `prisma/seed.ts`（初始化用户数据）
4. 实现认证 Controller + Service
5. 实现基础中间件（JWT 验证、错误处理、限流）
6. 启动 Express 服务，验证 API 可调

### Phase 2：后端业务接口（预估 2 天）

1. 实现日常记录 CRUD
2. 实现月度记录 CRUD
3. 实现配置管理接口
4. 实现备份导出/导入
5. 后端权限校验完整实现

### Phase 3：前端架构拆分（预估 1.5 天）

1. 创建 `AppShell.tsx` 和 `RouteController.tsx`
2. 创建 `apiService.ts`
3. 改造 `useMeterRecords.ts` 对接 API
4. 改造 `useAuth.ts` 对接后端登录
5. 集成测试：登录 → 读写记录 → 登出

### Phase 4：业务逻辑收敛（预估 1 天）

1. `pricing.ts` 作为唯一计算源
2. 各组件改为调用 `pricing.ts`，移除内联计算
3. 统一错误处理和用户提示

### Phase 5：质量加固（预估 1 天）

1. 配置 ESLint + Prettier
2. 添加基础单元测试（Vitest）
3. TypeScript strict 模式逐步开启

---

## 7. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 迁移过程数据丢失 | 高 | 迁移前强制导出 JSON 备份 |
| JWT 秘钥管理 | 高 | 存入 `.env`，不提交 Git |
| 前后端联调周期 | 中 | Phase 3 预留充足联调时间 |
| localStorage 降级逻辑复杂 | 低 | 降级方案推后实现 |

---

## 8. 验收标准

- [ ] 用户可登录后端，JWT 正常颁发和验证
- [ ] 日常记录可正常增删改查
- [ ] 月度记录可正常增删改查
- [ ] 换表/清零计量计算结果与旧系统一致
- [ ] 历史数据迁移后无丢失
- [ ] 无硬编码凭证
- [ ] 前端 App.tsx 行数降至 150 行以内
- [ ] 所有 API 调用走 apiService.ts
- [ ] ESLint + TypeScript 无报错

---

*本规格文档经审查批准，作为后续实施的唯一依据。*
