# 国信金融酒店能耗系统 — 彻底重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 localStorage 单点存储系统重构为 Express + Prisma + SQLite 的后端持久化架构，消除硬编码凭证，修正 Prisma schema，统一计算逻辑。

**Architecture:** 分层架构：React 前端 → API Service → Express Controller → Service → Repository(Prisma) → SQLite。前端 localStorage 降级为只读缓存。

**Tech Stack:** Node.js, Express, Prisma, SQLite, bcrypt, jsonwebtoken, zod, React 19

---

## 文件结构

```
engineer/
├── prisma/
│   ├── schema.prisma          # 重写：支持 JSON 动态字段
│   └── seed.ts                # 重写：初始化用户数据（bcrypt 哈希）
├── server/
│   ├── index.ts               # 新建：Express 服务入口
│   ├── middleware/
│   │   ├── auth.ts            # 新建：JWT 验证中间件
│   │   ├── errorHandler.ts    # 新建：统一错误处理
│   │   └── rateLimit.ts       # 新建：登录限流
│   ├── controllers/
│   │   ├── authController.ts  # 新建：认证接口
│   │   ├── recordsController.ts # 新建：日常/月度记录接口
│   │   ├── configController.ts # 新建：配置接口
│   │   └── backupController.ts # 新建：备份接口
│   ├── services/
│   │   ├── authService.ts     # 新建：认证业务逻辑
│   │   ├── recordsService.ts  # 新建：记录业务逻辑
│   │   ├── configService.ts   # 新建：配置业务逻辑
│   │   └── pricingService.ts  # 新建：计算逻辑（从 pricing.ts 迁移）
│   ├── repositories/
│   │   ├── dailyRepository.ts # 新建：日常记录 Prisma 操作
│   │   ├── monthlyRepository.ts # 新建：月度记录 Prisma 操作
│   │   └── userRepository.ts  # 新建：用户 Prisma 操作
│   └── routes/
│       └── index.ts           # 新建：路由聚合
├── scripts/
│   └── migrate-localStorage.ts # 新建：Phase 0 数据迁移脚本
└── src/
    ├── services/
    │   └── apiService.ts      # 新建：前端统一 API 调用层
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx   # 新建：布局框架
    │   │   └── RouteController.tsx # 新建：路由分发
    │   └── ...
    ├── App.tsx                # 修改：精简为 Provider 聚合
    ├── hooks/
    │   └── useMeterRecords.ts  # 修改：对接 apiService
    └── utils/
        └── pricing.ts         # 修改：移除组件内联计算，保持纯函数
```

---

## Phase 0: 数据迁移工具

### Task 0.1: 创建迁移脚本

**Files:**
- Create: `scripts/migrate-localStorage.ts`

- [ ] **Step 1: 创建 scripts 目录和迁移脚本骨架**

```typescript
// scripts/migrate-localStorage.ts
import { writeFileSync } from 'fs';

// 从 localStorage 读取数据的辅助函数
function getLocalStorage(key: string): any {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// 迁移报告类型
interface MigrationReport {
  success: boolean;
  records: {
    daily: number;
    monthly: number;
  };
  errors: string[];
  timestamp: string;
}

async function migrate(): Promise<MigrationReport> {
  const report: MigrationReport = {
    success: true,
    records: { daily: 0, monthly: 0 },
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. 读取 localStorage
    const dailyHistory = getLocalStorage('酒店抄表历史');
    const monthlyHistory = getLocalStorage('酒店月度抄表历史');
    const systemConfig = getLocalStorage('系统字典限额');
    const dailyFields = getLocalStorage('酒店日常回路配置');
    const monthlyCircuits = getLocalStorage('酒店月度回路配置');

    // 2. 输出迁移数据 JSON 供检查
    const migrationData = {
      dailyHistory,
      monthlyHistory,
      systemConfig,
      dailyFields,
      monthlyCircuits,
    };

    writeFileSync(
      './migration-backup.json',
      JSON.stringify(migrationData, null, 2)
    );

    console.log('[迁移] 数据已导出至 migration-backup.json，请检查后继续');
    return report;
  } catch (error) {
    report.success = false;
    report.errors.push(`迁移失败: ${error}`);
    return report;
  }
}

migrate().then(console.log);
```

- [ ] **Step 2: 验证脚本可运行**

```bash
cd c:/Users/Administrator/Desktop/engineer
npx tsx scripts/migrate-localStorage.ts
```

Expected: 打印 migration report，无报错

- [ ] **Step 3: 更新脚本，添加 API 调用逻辑（Phase 1 后端完成后再填充）**

在 `migrate()` 函数中预留 API 端点注释：
```typescript
// TODO: Phase 1 完成后，替换为实际 API 调用
// await fetch('/api/records/daily', { method: 'POST', body: ... })
```

---

## Phase 1: 后端骨架

### Task 1.1: 安装后端依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 添加后端依赖**

```bash
cd c:/Users/Administrator/Desktop/engineer
npm install express cors helmet cookie-parser bcrypt jsonwebtoken zod uuid
npm install -D @types/express @types/cors @types/cookie-parser @types/bcrypt @types/jsonwebtoken @types/uuid tsx
```

- [ ] **Step 2: 创建 server 目录结构**

```bash
mkdir -p server/middleware server/controllers server/services server/repositories server/routes
```

### Task 1.2: 重写 Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 编写新的 Prisma schema**

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
  status       String   @default("active") // "active" | "disabled"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model DailyRecord {
  id        String   @id @default(uuid())
  date      DateTime @unique
  readings  String   // JSON: { "李体线电表": 123.5, "swap_李体线电表": true, ... }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model MonthlyRecord {
  id        String   @id @default(uuid())
  date      DateTime // 月份第一天 00:00:00
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

- [ ] **Step 2: 配置环境变量**

Create: `.env`
```env
DATABASE_URL="file:./prisma/energy.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
BCRYPT_ROUNDS=12
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

- [ ] **Step 3: 更新 .env.example**

```env
DATABASE_URL="file:./prisma/energy.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
BCRYPT_ROUNDS=12
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

- [ ] **Step 4: 生成 Prisma Client 并创建数据库**

```bash
cd c:/Users/Administrator/Desktop/engineer
npx prisma generate
npx prisma db push
```

Expected: 生成 `node_modules/.prisma/client`，创建 `prisma/energy.db`

### Task 1.3: 重写 Prisma Seed（用户初始化）

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: 编写 seed 脚本（bcrypt 哈希密码）**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const BCRYPT_ROUNDS = 12;

  // 创建超级管理员
  const superadminPassword = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      passwordHash: superadminPassword,
      role: 'superadmin',
      name: '超级管理员',
      status: 'active',
    },
  });

  // 创建工程总监
  const adminPassword = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'engineer_director',
      name: '工程总监',
      status: 'active',
    },
  });

  // 创建工程主管
  const engineerPassword = await bcrypt.hash('123456', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { username: 'engineer' },
    update: {},
    create: {
      username: 'engineer',
      passwordHash: engineerPassword,
      role: 'engineer_supervisor',
      name: '工程主管',
      status: 'active',
    },
  });

  console.log('[Seed] 用户数据初始化完成');
}

main()
  .catch((e) => {
    console.error('[Seed] 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: 添加 seed 脚本到 package.json**

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 3: 运行 seed**

```bash
cd c:/Users/Administrator/Desktop/engineer
npx prisma db seed
```

Expected: 输出 `[Seed] 用户数据初始化完成`

### Task 1.4: 实现中间件

**Files:**
- Create: `server/middleware/auth.ts`
- Create: `server/middleware/errorHandler.ts`
- Create: `server/middleware/rateLimit.ts`

- [ ] **Step 1: 实现 JWT 验证中间件**

```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    name: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: '登录已过期' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }
    next();
  };
}
```

- [ ] **Step 2: 实现统一错误处理中间件**

```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `路由 ${req.method} ${req.path} 不存在`,
  });
}
```

- [ ] **Step 3: 实现登录限流中间件**

```typescript
// server/middleware/rateLimit.ts
import { Request, Response, NextFunction } from 'express';

// 内存存储：username -> { count, lastAttempt }
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

const WINDOW_MS = 5 * 60 * 1000; // 5 分钟
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 分钟锁定

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const username = req.body.username;
  if (!username) return next();

  const now = Date.now();
  const record = loginAttempts.get(username);

  if (record) {
    // 检查是否在锁定中
    if (now - record.lastAttempt < LOCKOUT_MS && record.count >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_MS - (now - record.lastAttempt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `登录失败次数过多，请 ${remaining} 秒后重试`,
      });
    }

    // 窗口过期，重置计数
    if (now - record.lastAttempt > WINDOW_MS) {
      loginAttempts.set(username, { count: 1, lastAttempt: now });
    } else {
      record.count++;
      record.lastAttempt = now;
    }
  } else {
    loginAttempts.set(username, { count: 1, lastAttempt: now });
  }

  next();
}

export function recordFailedLogin(username: string) {
  const record = loginAttempts.get(username);
  if (record) {
    record.count = MAX_ATTEMPTS; // 触发锁定
    record.lastAttempt = Date.now();
  }
}

export function clearLoginAttempts(username: string) {
  loginAttempts.delete(username);
}
```

### Task 1.5: 实现 User Repository

**Files:**
- Create: `server/repositories/userRepository.ts`

- [ ] **Step 1: 编写 User Repository**

```typescript
// server/repositories/userRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  role: string;
  name: string;
}

export const userRepository = {
  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: CreateUserInput) {
    return prisma.user.create({ data });
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },
};
```

### Task 1.6: 实现 Auth Service

**Files:**
- Create: `server/services/authService.ts`

- [ ] **Step 1: 编写 Auth Service**

```typescript
// server/services/authService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { clearLoginAttempts } from '../middleware/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
    name: string;
  };
  token?: string;
  message?: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByUsername(username);

    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }

    if (user.status !== 'active') {
      return { success: false, message: '账户已被禁用' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 登录成功，清除限流记录
    clearLoginAttempts(username);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      token,
    };
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    };
  },
};
```

### Task 1.7: 实现 Auth Controller

**Files:**
- Create: `server/controllers/authController.ts`

- [ ] **Step 1: 编写 Auth Controller**

```typescript
// server/controllers/authController.ts
import { Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { recordFailedLogin } from '../middleware/rateLimit';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authController = {
  async login(req: AuthRequest, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        code: 'INVALID_INPUT',
      });
    }

    const { username, password } = parsed.data;
    const result = await authService.login(username, password);

    if (!result.success) {
      recordFailedLogin(username);
      return res.status(401).json(result);
    }

    // 设置 httpOnly Cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 小时
    });

    return res.json({
      success: true,
      data: result.user,
    });
  },

  async logout(req: AuthRequest, res: Response) {
    res.clearCookie('token');
    return res.json({ success: true });
  },

  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const user = await authService.getMe(req.user.id);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    return res.json({ success: true, data: user });
  },
};
```

### Task 1.8: 实现 Express 服务入口

**Files:**
- Create: `server/index.ts`

- [ ] **Step 1: 编写 Express 服务入口**

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { loginRateLimit } from './middleware/rateLimit';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// 限流（仅登录接口）
app.use('/api/auth/login', loginRateLimit);

// 路由
app.use('/api/auth', authRoutes);

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] 运行在 http://localhost:${PORT}`);
});

export default app;
```

- [ ] **Step 2: 创建路由文件**

Create: `server/routes/auth.ts`
```typescript
import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
```

- [ ] **Step 3: 更新 package.json 添加后端启动脚本**

```json
{
  "scripts": {
    "server": "tsx server/index.ts",
    "dev:server": "tsx watch server/index.ts"
  }
}
```

- [ ] **Step 4: 启动后端验证**

```bash
npm run server
```

Expected: 输出 `[Server] 运行在 http://localhost:3001`

- [ ] **Step 5: 测试登录接口**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -c cookies.txt
```

Expected: 返回 JSON `{success: true, data: {id, username, role, name}}` 并设置 Cookie

---

## Phase 2: 后端业务接口

### Task 2.1: 实现 Daily Record Repository

**Files:**
- Create: `server/repositories/dailyRepository.ts`

- [ ] **Step 1: 编写 Daily Record Repository**

```typescript
// server/repositories/dailyRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dailyRepository = {
  async findByDate(date: Date) {
    return prisma.dailyRecord.findUnique({
      where: { date },
    });
  },

  async findAll(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    return prisma.dailyRecord.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  },

  async upsert(date: Date, readings: Record<string, any>) {
    const readingsStr = JSON.stringify(readings);
    return prisma.dailyRecord.upsert({
      where: { date },
      update: { readings: readingsStr },
      create: { date, readings: readingsStr },
    });
  },
};
```

### Task 2.2: 实现 Monthly Record Repository

**Files:**
- Create: `server/repositories/monthlyRepository.ts`

- [ ] **Step 1: 编写 Monthly Record Repository**

```typescript
// server/repositories/monthlyRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const monthlyRepository = {
  async findByMonth(monthDate: Date) {
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    return prisma.monthlyRecord.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
  },

  async upsertBatch(monthDate: Date, records: Array<{
    circuitId: string;
    value: number;
    swap?: boolean;
    oldFinal?: number;
    newStart?: number;
  }>) {
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

    // 使用事务删除旧记录并插入新记录
    return prisma.$transaction(async (tx) => {
      // 删除该月所有记录
      await tx.monthlyRecord.deleteMany({
        where: {
          date: {
            gte: startOfMonth,
            lt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
          },
        },
      });

      // 批量创建新记录
      const created = await tx.monthlyRecord.createMany({
        data: records.map((r) => ({
          date: startOfMonth,
          circuitId: r.circuitId,
          value: r.value,
          swap: r.swap || false,
          oldFinal: r.oldFinal,
          newStart: r.newStart,
        })),
      });

      return created;
    });
  },
};
```

### Task 2.3: 实现 Records Service

**Files:**
- Create: `server/services/recordsService.ts`

- [ ] **Step 1: 编写 Records Service（含换表计量计算）**

```typescript
// server/services/recordsService.ts
import { dailyRepository } from '../repositories/dailyRepository';
import { monthlyRepository } from '../repositories/monthlyRepository';
import { getFieldConsumption } from './pricingService';

export const recordsService = {
  async getDailyRecords(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const records = await dailyRepository.findAll(start, end);

    return records.map((r) => ({
      ...r,
      readings: JSON.parse(r.readings),
    }));
  },

  async getDailyRecordByDate(date: string) {
    const d = new Date(date);
    const record = await dailyRepository.findByDate(d);
    if (!record) return null;
    return {
      ...record,
      readings: JSON.parse(record.readings),
    };
  },

  async saveDailyRecord(date: string, readings: Record<string, any>) {
    const d = new Date(date);
    return dailyRepository.upsert(d, readings);
  },

  async getMonthlyRecords(month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const monthDate = new Date(year, monthNum - 1, 1);
    return monthlyRepository.findByMonth(monthDate);
  },

  async saveMonthlyRecords(month: string, records: Array<{
    circuitId: string;
    value: number;
    swap?: boolean;
    oldFinal?: number;
    newStart?: number;
  }>) {
    const [year, monthNum] = month.split('-').map(Number);
    const monthDate = new Date(year, monthNum - 1, 1);
    return monthlyRepository.upsertBatch(monthDate, records);
  },
};
```

- [ ] **Step 2: 创建 pricingService（从 pricing.ts 迁移）**

Create: `server/services/pricingService.ts`

从 `src/utils/pricing.ts` 复制 `getFieldConsumption` 和 `getBillingPriceAtDate` 函数到 `server/services/pricingService.ts`，确保逻辑一致。

### Task 2.4: 实现 Records Controller

**Files:**
- Create: `server/controllers/recordsController.ts`

- [ ] **Step 1: 编写 Records Controller**

```typescript
// server/controllers/recordsController.ts
import { Response } from 'express';
import { z } from 'zod';
import { recordsService } from '../services/recordsService';
import { AuthRequest } from '../middleware/auth';

const readingsSchema = z.record(z.any());

const dailyRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readings: readingsSchema,
});

const monthlyRecordItemSchema = z.object({
  circuitId: z.string(),
  value: z.number(),
  swap: z.boolean().optional(),
  oldFinal: z.number().optional(),
  newStart: z.number().optional(),
});

const monthlyRecordsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  records: z.array(monthlyRecordItemSchema),
});

export const recordsController = {
  async getDailyRecords(req: AuthRequest, res: Response) {
    const { startDate, endDate } = req.query;
    const records = await recordsService.getDailyRecords(
      startDate as string,
      endDate as string
    );
    return res.json({ success: true, data: records });
  },

  async getDailyRecordByDate(req: AuthRequest, res: Response) {
    const { date } = req.params;
    const record = await recordsService.getDailyRecordByDate(date);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }
    return res.json({ success: true, data: record });
  },

  async saveDailyRecord(req: AuthRequest, res: Response) {
    const parsed = dailyRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        code: 'INVALID_INPUT',
      });
    }

    const { date, readings } = parsed.data;
    const record = await recordsService.saveDailyRecord(date, readings);
    return res.json({
      success: true,
      data: { ...record, readings: JSON.parse(record.readings) },
    });
  },

  async getMonthlyRecords(req: AuthRequest, res: Response) {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ success: false, message: '缺少 month 参数' });
    }
    const records = await recordsService.getMonthlyRecords(month as string);
    return res.json({ success: true, data: records });
  },

  async saveMonthlyRecords(req: AuthRequest, res: Response) {
    const parsed = monthlyRecordsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        code: 'INVALID_INPUT',
      });
    }

    const { month, records } = parsed.data;
    const result = await recordsService.saveMonthlyRecords(month, records);
    return res.json({ success: true, data: result });
  },
};
```

- [ ] **Step 2: 更新路由**

Modify: `server/routes/auth.ts` → 创建新文件 `server/routes/index.ts`

```typescript
// server/routes/index.ts
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { recordsController } from '../controllers/recordsController';
import { authController } from '../controllers/authController';

const router = Router();

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/logout', authenticate, authController.logout);
router.get('/auth/me', authenticate, authController.me);

// Daily Records
router.get('/records/daily', authenticate, recordsController.getDailyRecords);
router.get('/records/daily/:date', authenticate, recordsController.getDailyRecordByDate);
router.post('/records/daily', authenticate, recordsController.saveDailyRecord);

// Monthly Records
router.get('/records/monthly', authenticate, recordsController.getMonthlyRecords);
router.post('/records/monthly', authenticate, recordsController.saveMonthlyRecords);

export default router;
```

- [ ] **Step 3: 更新 server/index.ts 引入新路由**

```typescript
import routes from './routes/index';
app.use('/api', routes);
```

### Task 2.5: 实现 Config 接口

**Files:**
- Create: `server/repositories/configRepository.ts`
- Create: `server/services/configService.ts`
- Create: `server/controllers/configController.ts`
- Modify: `server/routes/index.ts`

- [ ] **Step 1: 实现 Config Repository**

```typescript
// server/repositories/configRepository.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const configRepository = {
  async findByKey(key: string) {
    return prisma.systemConfig.findUnique({ where: { key } });
  },

  async upsert(key: string, value: any) {
    const valueStr = JSON.stringify(value);
    return prisma.systemConfig.upsert({
      where: { key },
      update: { value: valueStr },
      create: { key, value: valueStr },
    });
  },

  async findAll() {
    const configs = await prisma.systemConfig.findMany();
    const result: Record<string, any> = {};
    for (const c of configs) {
      result[c.key] = JSON.parse(c.value);
    }
    return result;
  },
};
```

- [ ] **Step 2: 实现 Config Controller**

```typescript
// server/controllers/configController.ts
import { Response } from 'express';
import { z } from 'zod';
import { configRepository } from '../repositories/configRepository';
import { AuthRequest } from '../middleware/auth';

const updateConfigSchema = z.object({
  key: z.string(),
  value: z.any(),
});

export const configController = {
  async getConfig(req: AuthRequest, res: Response) {
    const configs = await configRepository.findAll();
    return res.json({ success: true, data: configs });
  },

  async updateConfig(req: AuthRequest, res: Response) {
    const parsed = updateConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: '参数错误',
        code: 'INVALID_INPUT',
      });
    }

    const { key, value } = parsed.data;
    const config = await configRepository.upsert(key, value);
    return res.json({
      success: true,
      data: { key: config.key, value: JSON.parse(config.value) },
    });
  },
};
```

- [ ] **Step 3: 更新路由**

```typescript
router.get('/config', authenticate, configController.getConfig);
router.put('/config', authenticate, requireRole('superadmin', 'engineer_director'), configController.updateConfig);
```

### Task 2.6: 实现 Backup 接口

**Files:**
- Create: `server/controllers/backupController.ts`
- Modify: `server/routes/index.ts`

- [ ] **Step 1: 实现 Backup Controller**

```typescript
// server/controllers/backupController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dailyRepository } from '../repositories/dailyRepository';
import { monthlyRepository } from '../repositories/monthlyRepository';
import { configRepository } from '../repositories/configRepository';

export const backupController = {
  async exportBackup(req: AuthRequest, res: Response) {
    const dailyRecords = await dailyRepository.findAll();
    const configs = await configRepository.findAll();

    const backup = {
      appName: 'GuoxinFinancialHotelEnergySystem',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      data: {
        dailyRecords: dailyRecords.map((r) => ({
          ...r,
          readings: JSON.parse(r.readings),
        })),
        configs,
      },
    };

    res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
    res.setHeader('Content-Type', 'application/json');
    return res.json(backup);
  },

  async importBackup(req: AuthRequest, res: Response) {
    // TODO: 实现导入逻辑
    return res.status(501).json({ success: false, message: '待实现' });
  },
};
```

- [ ] **Step 2: 更新路由**

```typescript
router.post('/backup/export', authenticate, requireRole('superadmin', 'engineer_director'), backupController.exportBackup);
router.post('/backup/import', authenticate, requireRole('superadmin'), backupController.importBackup);
```

---

## Phase 3: 前端架构拆分

### Task 3.1: 创建 apiService

**Files:**
- Create: `src/services/apiService.ts`

- [ ] **Step 1: 实现 apiService**

```typescript
// src/services/apiService.ts
const API_BASE = '/api';

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiService {
  private getUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, window.location.origin + API_BASE);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return url.toString();
  }

  private async request<T>(path: string, options?: ApiOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.getUrl(path, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || '请求失败');
    }

    return data.data;
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Daily Records
  async getDailyRecords(startDate?: string, endDate?: string) {
    return this.request<any[]>('/records/daily', {
      params: { startDate, endDate },
    });
  }

  async getDailyRecordByDate(date: string) {
    return this.request<any>(`/records/daily/${date}`);
  }

  async saveDailyRecord(date: string, readings: Record<string, any>) {
    return this.request<any>('/records/daily', {
      method: 'POST',
      body: JSON.stringify({ date, readings }),
    });
  }

  // Monthly Records
  async getMonthlyRecords(month: string) {
    return this.request<any[]>('/records/monthly', {
      params: { month },
    });
  }

  async saveMonthlyRecords(month: string, records: any[]) {
    return this.request<any>('/records/monthly', {
      method: 'POST',
      body: JSON.stringify({ month, records }),
    });
  }

  // Config
  async getConfig() {
    return this.request<any>('/config');
  }

  async updateConfig(key: string, value: any) {
    return this.request<any>('/config', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }

  // Backup
  async exportBackup() {
    const response = await fetch(`${API_BASE}/backup/export`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.blob();
  }
}

export const apiService = new ApiService();
```

### Task 3.2: 创建 AppShell

**Files:**
- Create: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: 实现 AppShell**

```typescript
// src/components/layout/AppShell.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { SystemDialogWrapper } from '../SystemDialogWrapper';
import { useSystemDialog } from '../../hooks/useSystemDialog';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    系统弹窗,
    closeDialog,
    set系统弹窗,
  } = useSystemDialog();

  return (
    <div className="flex bg-zinc-100 h-screen overflow-hidden">
      <motion.div
        key="dashboard_container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-1"
      >
        {children}
      </motion.div>

      <SystemDialogWrapper
        isOpen={系统弹窗.isOpen}
        title={系统弹窗.title}
        message={系统弹窗.message}
        type={系统弹窗.type}
        value={系统弹窗.value}
        closeDialog={closeDialog}
        set系统弹窗={set系统弹窗}
        onConfirm={系统弹窗.onConfirm}
      />
    </div>
  );
}
```

### Task 3.3: 创建 RouteController

**Files:**
- Create: `src/components/layout/RouteController.tsx`

- [ ] **Step 1: 实现 RouteController**

```typescript
// src/components/layout/RouteController.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnergyDashboard } from '../EnergyDashboard';
import { PowerDashboard } from '../PowerDashboard';
import { WaterDashboard } from '../WaterDashboard';
import { GasDashboard } from '../GasDashboard';
import { DailyEntryView } from '../DailyEntryView';
import { HistoryArchiveView } from '../HistoryArchiveView';
import { SystemConfigView } from '../SystemConfigView';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useEnergyConfig } from '../../hooks/useEnergyConfig';
import { useMeterRecords } from '../../hooks/useMeterRecords';

export function RouteController() {
  const { 当前路由, 用户, 安全跳转路由, 触发退出登录 } = useAuth();
  const { 限额配置 } = useEnergyConfig(当前路由, () => {}, () => {});
  const { 历史数据, 最新记录 } = useMeterRecords(/* 简化参数 */);

  return (
    <>
      <Sidebar
        当前路由={当前路由}
        用户={用户}
        安全跳转路由={安全跳转路由}
        触发退出登录={触发退出登录}
        酒店名称={限额配置.酒店名称}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          当前路由={当前路由}
          最新记录日期={最新记录?.日期}
          用户={用户}
          触发退出登录={触发退出登录}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 p-10 bg-zinc-50/70">
          <AnimatePresence mode="wait">
            {当前路由 === '能效大盘' && <EnergyDashboard />}
            {当前路由 === '用电看板' && <PowerDashboard />}
            {当前路由 === '用水看板' && <WaterDashboard />}
            {当前路由 === '用气看板' && <GasDashboard />}
            {当前路由 === '日常抄表' && <DailyEntryView />}
            {当前路由 === '历史抄表库' && <HistoryArchiveView />}
            {当前路由 === '字典配置' && <SystemConfigView />}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
```

### Task 3.4: 精简 App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 简化 App.tsx 为 Provider 聚合**

```typescript
// src/App.tsx
import React from 'react';
import { LoginView } from './components/LoginView';
import { AppShell } from './components/layout/AppShell';
import { RouteController } from './components/layout/RouteController';
import { useAuth } from './hooks/useAuth';
import { useSystemDialog } from './hooks/useSystemDialog';
import { useEnergyConfig } from './hooks/useEnergyConfig';
import { useMeterRecords } from './hooks/useMeterRecords';

export default function App() {
  const { openPrompt, openConfirm, openAlert } = useSystemDialog();
  const {
    用户,
    登录账号,
    set登录账号,
    登录密码,
    set登录密码,
    登录错误,
    触发登录Action,
  } = useAuth();

  const {
    限额配置,
  } = useEnergyConfig('能效大盘', openAlert, openPrompt);

  const {
    历史数据,
    最新记录,
  } = useMeterRecords(/* params */);

  if (!用户) {
    return (
      <LoginView
        登录账号={登录账号}
        set登录账号={set登录账号}
        登录密码={登录密码}
        set登录密码={set登录密码}
        登录错误={登录错误}
        触发登录Action={触发登录Action}
      />
    );
  }

  return (
    <AppShell>
      <RouteController />
    </AppShell>
  );
}
```

---

## Phase 4: 业务逻辑收敛

### Task 4.1: 统一 pricing.ts 为唯一计算源

**Files:**
- Modify: `src/utils/pricing.ts`
- Modify: `src/components/EnergyDashboard.tsx`

- [ ] **Step 1: EnergyDashboard 调用 pricing.ts 而非内联计算**

将 EnergyDashboard 中的 `getTrendData()` 逻辑抽取为调用 `getEnrichedDailyRecords()`（已存在于 pricing.ts），移除内联计算代码。

### Task 4.2: 统一组件计算调用

**Files:**
- Modify: `src/components/DailyForm.tsx`
- Modify: `src/components/MonthlyForm.tsx`

- [ ] **Step 1: DailyForm 和 MonthlyForm 的实时预览计算改为调用 pricing.ts**

将表单内的内联计算预览改为调用 `getFieldConsumption()` 函数。

---

## Phase 5: 质量加固

### Task 5.1: 配置 ESLint + Prettier

**Files:**
- Create: `.eslintrc.json`
- Create: `.prettierrc`

- [ ] **Step 1: 创建 ESLint 配置**

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn"
  }
}
```

- [ ] **Step 2: 创建 Prettier 配置**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 3: 运行检查**

```bash
npm run lint
```

Expected: 无 Error（Warning 可接受）

### Task 5.2: 验收标准自检

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

## 实施终检

完成 Phase 0-5 后，按照以下清单逐项验证：

1. 后端服务正常启动在 port 3001
2. 登录接口返回 JWT Cookie
3. 所有认证接口正确验证 JWT
4. 写操作接口正确校验角色权限
5. 日常记录 CRUD 正常
6. 月度记录 CRUD 正常
7. 换表计量计算逻辑与旧系统一致
8. 前端 App.tsx 行数 < 150
9. `npm run lint` 无 Error

---

*计划完成时间：约 8 个工作日*
