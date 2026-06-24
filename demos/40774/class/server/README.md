# 排课系统后端服务

本目录为中小学智能排课系统的后端服务，采用 **Node.js + Express + MongoDB(Mongoose)** 架构，将原前端 IndexedDB 存储与 Web Worker 排课计算迁移到后端。

---

## 一、目录结构

```
class/
├── server/                          # 后端服务目录
│   ├── server.js                    # 服务入口
│   ├── package.json                 # 依赖配置
│   ├── README.md                    # 本文件
│   ├── frontend-guide.md            # 前端改造指南
│   ├── models/                      # Mongoose 数据模型
│   │   ├── index.js
│   │   ├── Teacher.js
│   │   ├── Class.js
│   │   ├── Course.js
│   │   ├── Schedule.js
│   │   ├── Config.js
│   │   ├── Direction.js
│   │   └── Log.js
│   ├── routes/                      # 路由
│   │   ├── storeRoutes.js           # 通用 CRUD 路由
│   │   └── scheduleRoutes.js        # 排课任务路由
│   └── services/
│       └── scheduleService.js       # 排课算法服务
└── 排课系统_企业版.html              # 前端页面（与后端同级）
```

---

## 二、环境要求

- Node.js >= 16
- MongoDB >= 5.0（本地或远程均可）

---

## 三、快速启动

### 1. 安装依赖

打开命令行，进入 `class/server` 目录：

```powershell
cd "c:\Users\shao\Desktop\python cdod3e\class\server"
npm install
```

### 2. 启动 MongoDB

确保本地 MongoDB 已启动，默认连接地址：

```
mongodb://127.0.0.1:27017/edu_schedule
```

如果 MongoDB 在其他地址，可通过环境变量指定：

```powershell
$env:MONGO_URI="mongodb://user:pass@host:27017/edu_schedule"
```

### 3. 启动后端服务

```powershell
npm start
```

默认启动在 `http://127.0.0.1:3000`。

如需开发热重载：

```powershell
npm run dev
```

### 4. 验证服务

浏览器或接口工具访问：

```
http://127.0.0.1:3000/api/health
```

正常返回：

```json
{ "status": "ok", "mongodb": 1 }
```

---

## 四、API 说明

### 4.1 通用数据接口

每个 store（`teachers/classes/courses/schedules/configs/directions/logs`）均支持以下接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/:store` | 获取全部数据 |
| GET | `/api/:store/:id` | 按自定义 id 获取单条 |
| POST | `/api/:store` | 新增或更新（upsert），body 可为对象或数组 |
| PUT | `/api/:store/:id` | 更新单条 |
| DELETE | `/api/:store/:id` | 删除单条 |
| POST | `/api/:store/batch-delete` | 批量删除，body: `{ ids: [Number] }` |
| DELETE | `/api/:store/clear` | 清空整表 |

### 4.2 排课任务接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/schedule/run` | 启动排课任务，body: `{ dayEnd, periodEnd }`，返回 `{ taskId }` |
| GET | `/api/schedule/status/:taskId` | 查询任务状态与进度 |

---

## 五、前端改造

详见同目录下的 [frontend-guide.md](./frontend-guide.md)。

核心改动：

1. 引入 `axios` 和 `api.js`。
2. 将原 `DB` 对象替换为 `DB_API`。
3. 将 Web Worker 排课改为调用后端 `/api/schedule/run` 并轮询状态。
4. 界面和交互逻辑完全不变。

---

## 六、注意事项

- 所有数据表使用自定义数字 `id` 作为主键，与前端 IndexedDB 时代的 `id` 保持一致。
- `schedules` 表建立了 `day/period/classId/teacherId` 复合索引，便于后续课表查询和冲突检测。
- 排课任务状态存储在内存中，服务重启后任务记录会丢失。
- 重新排课时，后端会先清空 `schedules` 集合，再插入新结果。

---

## 七、常见问题

**Q: 启动时报 MongoDB 连接失败？**

A: 请确认 MongoDB 服务已启动，并检查 `MONGO_URI` 是否正确。

**Q: 前端请求后端提示跨域错误？**

A: 后端已开启 CORS 全部允许，请确认前端访问地址正确（默认 `http://127.0.0.1:3000`）。

**Q: 排课任务状态一直显示 running？**

A: 请检查后端日志，确认 `teachers/classes/courses` 数据是否为空；或查看 `/api/schedule/status/:taskId` 返回的日志详情。
