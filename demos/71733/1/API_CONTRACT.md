# 四神兽养成游戏 — 后端 API 契约

## 1. 架构概述

```
微信小程序 ←→ 自建后端服务器 ←→ MySQL
     │                │
  wx.login()     jscode2session
     │                │
  静默获取openid   校验&颁发token
```

- **认证方式**：`wx.login` 静默登录 → 后端换取 openid → 签发 JWT token
- **数据同步策略**：云端优先 + 本地缓存，基于 `updatedAt` 时间戳做 Last-Write-Wins 合并
- **数据存储**：PetData 整体以 JSON 存储（不拆列），避免频繁 schema 变更

---

## 2. 数据库设计

### 2.1 users 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 用户ID |
| openid | VARCHAR(64) | UNIQUE, NOT NULL, INDEX | 微信openid |
| union_id | VARCHAR(64) | NULL | 微信unionid（预留） |
| nickname | VARCHAR(64) | NULL | 昵称（预留，暂不用） |
| avatar_url | VARCHAR(512) | NULL | 头像URL（预留，暂不用） |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 注册时间 |
| last_login_at | DATETIME | NOT NULL, DEFAULT NOW() | 最后登录时间 |

```sql
CREATE TABLE users (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  openid      VARCHAR(64)   NOT NULL UNIQUE,
  union_id    VARCHAR(64)   NULL,
  nickname    VARCHAR(64)   NULL,
  avatar_url  VARCHAR(512)  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.2 pet_data 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 记录ID |
| user_id | BIGINT | UNIQUE, NOT NULL, FK | 关联 users.id |
| data | JSON | NOT NULL | PetData 完整 JSON |
| updated_at | DATETIME | NOT NULL | 数据最后更新时间（用于同步冲突判断） |
| created_at | DATETIME | NOT NULL | 首次创建时间 |

```sql
CREATE TABLE pet_data (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT        NOT NULL UNIQUE,
  data        JSON          NOT NULL,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**data 字段 JSON 结构**（对应客户端 `PetData` + 扩展的 `updatedAt`）：

```json
{
  "hasEgg": false,
  "eggClickCount": 0,
  "currentPet": null,
  "level": 1,
  "exp": 0,
  "lastFeedTime": 0,
  "totalFeedCount": 0,
  "isEscaped": false,
  "collection": [],
  "newCollectionCount": 0,
  "savedBeasts": {},
  "dailyArenaCounts": {},
  "lastArenaResetDate": "",
  "updatedAt": "2026-06-02T10:30:00.000Z"
}
```

> `updatedAt` 为同步专用字段，客户端每次修改数据时必须更新此值。

---

## 3. 认证流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        静默登录流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  小程序                        后端服务器                        │
│    │                              │                             │
│    │  1. wx.login()               │                             │
│    │  ─────────────────►          │                             │
│    │  返回 code                   │                             │
│    │                              │                             │
│    │  2. POST /api/auth/login     │                             │
│    │  { code: "xxx" }            │                             │
│    │  ─────────────────►          │                             │
│    │                              │  3. 调用微信 jscode2session │
│    │                              │  ──────────────────────►     │
│    │                              │  返回 openid + session_key  │
│    │                              │                             │
│    │                              │  4. 查找/创建用户            │
│    │                              │  5. 生成 JWT token          │
│    │                              │                             │
│    │  返回 { token, userInfo }    │                             │
│    │  ◄─────────────────          │                             │
│    │                              │                             │
│    │  6. 本地存储 token           │                             │
│    │  后续请求 Header:            │                             │
│    │  Authorization: Bearer xxx   │                             │
│    │                              │                             │
└─────────────────────────────────────────────────────────────────┘
```

**JWT Token 载荷**：

```json
{
  "userId": 1,
  "openid": "oXXXXXXXXXXXX",
  "exp": 1748889600
}
```

- **有效期**：6 个月
- **刷新策略**：每次有效请求（非登录接口）自动续期，签发新 token 放入响应 Header `X-New-Token`，有效期重新计算为6个月
- **客户端处理**：每次响应检查 `X-New-Token`，有则替换本地存储的 token

---

## 4. API 接口清单

### 基础信息

- **Base URL**：`https://<你的域名>/api`
- **通用请求头**：

| Header | 值 | 说明 |
|--------|-----|------|
| Authorization | Bearer \<token\> | 除登录接口外必传 |
| Content-Type | application/json | POST/PUT 请求必传 |

- **通用响应格式**：

```json
// 成功
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 失败
{
  "code": 40001,
  "message": "token 已过期",
  "data": null
}
```

- **错误码表**：

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 40001 | 未登录或 token 无效/过期 |
| 40002 | 参数错误 |
| 50001 | 服务器内部错误 |
| 50002 | 微信接口调用失败 |

---

### 4.1 POST /api/auth/login

静默登录，用 wx.login 获取的 code 换取 token。

**请求**：

```json
{
  "code": "0a3XXX..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | wx.login() 返回的 code |

**响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 15552000,
    "userInfo": {
      "userId": 1,
      "isNewUser": true
    }
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT token |
| expiresIn | number | 有效期（秒） |
| userInfo.userId | number | 用户ID |
| userInfo.isNewUser | boolean | 是否首次注册 |

**后端逻辑**：

1. 用 code 调用微信 `jscode2session` 接口获取 openid
2. 根据 openid 查询 users 表
   - 存在 → 更新 `last_login_at`
   - 不存在 → 插入新用户 + 初始化 pet_data（DEFAULT_PET_DATA）
3. 签发 JWT token 并返回

---

### 4.2 GET /api/pet/data

获取云端宠物数据（用于启动时同步）。

**请求**：无参数

**响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "hasEgg": false,
    "eggClickCount": 0,
    "currentPet": "qinglong",
    "level": 5,
    "exp": 32,
    "lastFeedTime": 1748841600000,
    "totalFeedCount": 32,
    "isEscaped": false,
    "collection": ["baihu"],
    "newCollectionCount": 1,
    "savedBeasts": {
      "baihu": { "level": 10, "exp": 380, "totalFeedCount": 380 }
    },
    "dailyArenaCounts": { "beginner": 3 },
    "lastArenaResetDate": "2026-06-02",
    "updatedAt": "2026-06-02T10:30:00.000Z"
  }
}
```

**后端逻辑**：

1. 从 token 解析 userId
2. 查询 pet_data 表 WHERE user_id = userId
3. 返回 data JSON 字段
4. 若无记录（理论上不应发生），返回 DEFAULT_PET_DATA

---

### 4.3 POST /api/pet/sync

双向同步：客户端上传本地数据，服务端根据时间戳决定接受还是返回云端数据。

**请求**：

```json
{
  "localData": {
    "hasEgg": false,
    "eggClickCount": 0,
    "currentPet": "qinglong",
    "level": 5,
    "exp": 32,
    "lastFeedTime": 1748841600000,
    "totalFeedCount": 32,
    "isEscaped": false,
    "collection": ["baihu"],
    "newCollectionCount": 1,
    "savedBeasts": {
      "baihu": { "level": 10, "exp": 380, "totalFeedCount": 380 }
    },
    "dailyArenaCounts": { "beginner": 3 },
    "lastArenaResetDate": "2026-06-02",
    "updatedAt": "2026-06-02T10:30:00.000Z"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| localData | object | 是 | 客户端当前的完整 PetData（含 updatedAt） |

**响应 — 情况A：本地更新，云端接受**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "action": "accepted",
    "serverData": { ... }
  }
}
```

**响应 — 情况B：云端更新，客户端应采用云端数据**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "action": "override",
    "serverData": { ... }
  }
}
```

**后端逻辑**：

```
1. 解析 userId，查询云端 pet_data
2. 比较时间戳：
   - localData.updatedAt > 云端 updated_at → 接受本地数据，写入云端
     → action = "accepted"，serverData = 写入后的数据
   - localData.updatedAt <= 云端 updated_at → 拒绝本地数据
     → action = "override"，serverData = 云端数据
3. 返回结果
```

---

### 4.4 POST /api/pet/save

单向保存：直接将本地数据推送到云端（用于关键操作后的即时保存）。

**请求**：

```json
{
  "data": {
    "hasEgg": false,
    "eggClickCount": 0,
    "currentPet": "qinglong",
    "level": 6,
    "exp": 50,
    "lastFeedTime": 1748841600000,
    "totalFeedCount": 50,
    "isEscaped": false,
    "collection": ["baihu"],
    "newCollectionCount": 1,
    "savedBeasts": {
      "baihu": { "level": 10, "exp": 380, "totalFeedCount": 380 }
    },
    "dailyArenaCounts": { "beginner": 3 },
    "lastArenaResetDate": "2026-06-02",
    "updatedAt": "2026-06-02T11:00:00.000Z"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| data | object | 是 | 完整 PetData（含 updatedAt） |

**响应**：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "saved": true,
    "updatedAt": "2026-06-02T11:00:00.000Z"
  }
}
```

**后端逻辑**：

1. 解析 userId
2. UPSERT pet_data（存在则更新，不存在则插入）
3. 更新 `updated_at` 为请求中的 `updatedAt` 值
4. 返回保存结果

---

## 5. 客户端数据同步逻辑

### 5.1 PetData 扩展字段

在现有 `PetData` 基础上增加：

```typescript
export interface PetData {
  // ... 现有字段不变 ...

  /** 同步用：数据最后修改时间（ISO 8601），每次本地修改必须更新 */
  updatedAt?: string;
}
```

### 5.2 同步时机

| 时机 | 动作 | 说明 |
|------|------|------|
| 小程序启动（onLaunch） | 调用 `GET /api/pet/data` | 拉取云端数据，与本地合并 |
| 关键操作后 | 调用 `POST /api/pet/save` | 孵化、喂养升级、领养新神兽、竞技场战斗后 |
| 小程序切后台（onHide） | 调用 `POST /api/pet/save` | 防止数据丢失 |
| 网络恢复时 | 调用 `POST /api/pet/sync` | 离线期间有操作则同步 |

### 5.3 合并策略流程

```
小程序启动
    │
    ▼
本地有 token？
    ├── 否 → 调用 wx.login → POST /api/auth/login → 存储 token
    │
    └── 是 ↓
        │
        ▼
    调用 GET /api/pet/data 获取云端数据
        │
        ▼
    本地有 PetData？
    ├── 否 → 直接使用云端数据 → 结束
    │
    └── 是 → 比较 updatedAt
              │
              ├── 云端 updatedAt > 本地 updatedAt → 使用云端数据覆盖本地
              │
              ├── 本地 updatedAt > 云端 updatedAt → 调用 POST /api/pet/save 推送本地数据
              │
              └── 相等 → 无需操作 → 结束
```

### 5.4 工具函数清单（客户端待开发）

| 函数名 | 所在文件 | 说明 |
|--------|---------|------|
| `silentLogin()` | `utils/auth.ts` | 封装 wx.login + 调用 /api/auth/login |
| `getToken()` | `utils/auth.ts` | 从本地存储获取 token |
| `ensureLogin()` | `utils/auth.ts` | 确保 token 有效，无效则重新登录 |
| `fetchCloudData()` | `utils/sync.ts` | 调用 GET /api/pet/data 拉取云端数据 |
| `saveToCloud()` | `utils/sync.ts` | 调用 POST /api/pet/save 推送数据 |
| `syncWithCloud()` | `utils/sync.ts` | 调用 POST /api/pet/sync 双向同步 |
| `mergeData()` | `utils/sync.ts` | 基于 updatedAt 合并本地与云端数据 |
| `request()` | `utils/request.ts` | 通用请求封装（自动附加 token、处理 401 重新登录、检查 X-New-Token） |

---

## 6. 关键操作后的保存策略

| 操作 | 触发位置 | 保存时机 | 说明 |
|------|---------|---------|------|
| 孵化神兽 | `pet-store.ts` → `clickEgg()` | 孵化成功后立即 | 防止丢失新宠物 |
| 喂养升级 | `pet-store.ts` → `feedPet()` | 升级时立即 | 关键里程碑 |
| 满级达成 | `pet-store.ts` → `feedPet()` | 满级时立即 | 解锁图鉴，重要数据 |
| 领养新神兽 | `pet-store.ts` → `adoptNewBeast()` | 操作完成后立即 | 重置数据，必须同步 |
| 切换神兽 | `pet-store.ts` → `switchToBeast()` | 操作完成后立即 | 数据切换 |
| 竞技场战斗 | `arena-store.ts` → `giveArenaReward()` | 战斗结束后 | 经验奖励 |
| 切后台 | `app.ts` → `onHide()` | 即时 | 兜底保存 |

---

## 7. 安全考虑

| 项目 | 方案 |
|------|------|
| HTTPS | 全站 HTTPS，微信小程序强制要求 |
| Token 安全 | JWT 签名密钥仅服务端持有，token 存本地 Storage |
| openid 保护 | openid 仅存服务端，不下发给客户端 |
| 接口鉴权 | 除 `/api/auth/login` 外所有接口需验证 token |
| 数据校验 | 服务端对 PetData 做 schema 校验，拒绝非法字段/值 |
| 频率限制 | 登录接口限流（同一 IP 10次/分钟），保存接口限流（同一用户 30次/分钟） |

---

## 8. 后端配置项（需准备的常量）

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| WECHAT_APPID | 小程序 AppID | `wxf4c92a96663ed587` |
| WECHAT_SECRET | 小程序 AppSecret | （保密） |
| JWT_SECRET | JWT 签名密钥 | 随机32位字符串 |
| JWT_EXPIRES_IN | Token 有效期（秒） | `15552000`（6个月） |
| DB_HOST | MySQL 地址 | `localhost` |
| DB_PORT | MySQL 端口 | `3306` |
| DB_NAME | 数据库名 | `pet_game` |
| DB_USER | 数据库用户 | `pet_game` |
| DB_PASSWORD | 数据库密码 | （保密） |
