# 项目架构文档

## 目录结构

```
engineer/
├── src/                          # 前端源码
│   ├── modules/                  # 业务模块（按功能分组）
│   │   ├── auth/                # 认证模块
│   │   │   ├── LoginView.tsx    # 登录页面
│   │   │   └── index.ts         # 模块导出
│   │   │
│   │   ├── dashboard/           # 能耗大盘模块
│   │   │   ├── EnergyDashboard.tsx    # 综合能耗大盘
│   │   │   ├── PowerDashboard.tsx     # 用电看板
│   │   │   ├── WaterDashboard.tsx     # 用水看板
│   │   │   ├── GasDashboard.tsx       # 用气看板
│   │   │   ├── CombinedTrendChart.tsx # 走势图组件
│   │   │   └── index.ts
│   │   │
│   │   ├── meter-entry/         # 抄表录入模块
│   │   │   ├── DailyEntryView.tsx     # 日常/月度录入页面
│   │   │   ├── DailyForm.tsx          # 日常表单
│   │   │   ├── MonthlyForm.tsx        # 月度表单
│   │   │   └── index.ts
│   │   │
│   │   ├── history/             # 历史记录模块
│   │   │   ├── HistoryArchiveView.tsx        # 历史库主页
│   │   │   ├── HistoryDailyDetailList.tsx    # 日明细列表
│   │   │   ├── HistoryDailySummaryList.tsx   # 日汇总列表
│   │   │   ├── HistoryMonthlyDetailList.tsx  # 月明细列表
│   │   │   ├── HistoryMonthlySummaryList.tsx # 月汇总列表
│   │   │   └── index.ts
│   │   │
│   │   ├── config/              # 系统配置模块
│   │   │   ├── SystemConfigView.tsx           # 配置主页
│   │   │   ├── DailyFieldsConfigTab.tsx       # 日常字段配置
│   │   │   ├── MonthlyCircuitConfigTab.tsx   # 月度回路配置
│   │   │   ├── RateLimitConfigTab.tsx        # 费率配置
│   │   │   ├── DataBackupConfigTab.tsx       # 数据备份配置
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts             # 模块总导出
│   │
│   ├── shared/                  # 共享资源（可跨模块复用）
│   │   ├── components/         # 共享组件
│   │   │   ├── AppShell.tsx           # 应用外壳
│   │   │   ├── RouteController.tsx   # 路由控制器
│   │   │   ├── Header.tsx            # 顶部导航
│   │   │   ├── Sidebar.tsx           # 侧边栏
│   │   │   ├── UserMenu.tsx          # 用户菜单
│   │   │   ├── EnergyCard.tsx        # 能耗卡片
│   │   │   ├── TrendViewToggle.tsx   # 视图切换
│   │   │   ├── TrendBarChart.tsx     # 柱状图
│   │   │   ├── SystemDialogWrapper.tsx # 弹窗包装器
│   │   │   ├── MonthlyImporter.tsx    # 月度导入器
│   │   │   ├── utils.ts              # 工具函数
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/              # 共享Hooks
│   │   │   ├── useAuth.ts              # 认证状态管理
│   │   │   ├── useEnergyConfig.ts      # 配置管理
│   │   │   ├── useMeterRecords.ts      # 抄表记录管理
│   │   │   ├── useGasGroups.ts         # 气表分组
│   │   │   ├── useSystemDialog.ts      # 弹窗管理
│   │   │   └── index.ts
│   │   │
│   │   ├── services/            # 共享服务
│   │   │   ├── apiService.ts          # API请求服务
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/               # 共享工具
│   │   │   ├── exportExcel.ts          # Excel导出
│   │   │   ├── pricing.ts              # 费率计算
│   │   │   └── index.ts
│   │   │
│   │   ├── types/               # 类型定义
│   │   │   ├── types.ts               # 类型接口
│   │   │   ├── data.ts                # 默认数据
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts             # 共享资源总导出
│   │
│   ├── App.tsx                  # 应用入口
│   └── main.tsx                 # React渲染入口
│
├── server/                      # 后端服务
│   ├── controllers/            # 控制器层
│   │   ├── authController.ts   # 认证控制器
│   │   └── recordsController.ts # 记录控制器
│   │
│   ├── services/               # 服务层
│   │   ├── authService.ts      # 认证服务
│   │   └── recordsService.ts   # 记录服务
│   │
│   ├── repositories/           # 数据访问层
│   │   ├── userRepository.ts   # 用户数据访问
│   │   ├── dailyRepository.ts  # 日记录数据访问
│   │   ├── monthlyRepository.ts # 月记录数据访问
│   │   └── configRepository.ts  # 配置数据访问
│   │
│   ├── routes/                 # 路由定义
│   │   └── index.ts
│   │
│   ├── middleware/             # 中间件
│   │   └── auth.ts             # 认证中间件
│   │
│   └── index.ts                # 服务入口
│
├── prisma/                     # 数据库ORM
│   └── schema.prisma           # 数据模型定义
│
└── package.json
```

## 架构说明

### 前后端分离架构

```
┌─────────────────────────────────────────────────────────┐
│                    前端 React + Vite                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 modules/                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │   │
│  │  │  auth/   │ │dashboard/│ │ meter-entry/ │   │   │
│  │  └──────────┘ └──────────┘ └──────────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐                    │   │
│  │  │ history/ │ │ config/  │                    │   │
│  │  └──────────┘ └──────────┘                    │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 shared/                          │   │
│  │  components │ hooks │ services │ utils │ types │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│              ┌───────────┴───────────┐                 │
│              │     API Service       │                 │
│              │  (apiService.ts)       │                 │
│              └───────────┬───────────┘                 │
└──────────────────────────┼─────────────────────────────┘
                           │ HTTP/REST
                           │ 3001
┌──────────────────────────┼─────────────────────────────┐
│                    后端 Express                         │
│              ┌───────────┴───────────┐                 │
│              │      Routes           │                 │
│              └───────────┬───────────┘                 │
│                          │                              │
│  ┌───────────────────────┼───────────────────────┐    │
│  │              Controllers                         │    │
│  │  ┌──────────────────┐┌─────────────────────┐  │    │
│  │  │ authController   ││ recordsController   │  │    │
│  │  └──────────────────┘└─────────────────────┘  │    │
│  └────────────────────────────────────────────────┘    │
│                          │                              │
│  ┌────────────────────────────────────────────────┐    │
│  │              Services                           │    │
│  │  ┌──────────────────┐┌─────────────────────┐   │    │
│  │  │ authService      ││ recordsService      │   │    │
│  │  └──────────────────┘└─────────────────────┘   │    │
│  └────────────────────────────────────────────────┘    │
│                          │                              │
│  ┌────────────────────────────────────────────────┐    │
│  │              Repositories                        │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │    │
│  │  │  User   │ │  Daily  │ │ Monthly │ │ Config│ │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └───────┘ │    │
│  └────────────────────────────────────────────────┘    │
│                          │                              │
│              ┌───────────┴───────────┐                 │
│              │   Prisma ORM + SQLite │                 │
│              └───────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

### 数据流程

```
用户操作 → 抄表录入(DailyEntryView)
                │
                ▼
         useMeterRecords (Hook)
                │
                ▼
         apiService.saveDailyRecord()
                │
                ▼
         后端 recordsController
                │
                ▼
         recordsService
                │
                ▼
         dailyRepository (Prisma)
                │
                ▼
         SQLite 数据库
```

### AI理解指南

#### 1. 查找组件位置
- **业务组件**: `src/modules/{模块名}/`
- **共享组件**: `src/shared/components/`
- **页面入口**: 路由对应的页面组件在 `src/App.tsx` 的条件渲染中

#### 2. 理解数据流向
- **前端数据管理**: Hooks 在 `src/shared/hooks/`
- **API调用**: `src/shared/services/apiService.ts`
- **后端API**: `src/server/routes/index.ts`

#### 3. 添加新功能的步骤
1. 在对应模块目录创建组件
2. 在模块 `index.ts` 中导出
3. 在 `App.tsx` 中导入并添加路由
4. 如需API，创建后端 controller → service → repository

#### 4. 命名规范
- **组件文件**: PascalCase (如 `EnergyDashboard.tsx`)
- **Hook文件**: camelCase + use前缀 (如 `useAuth.ts`)
- **工具文件**: camelCase (如 `pricing.ts`)
- **类型文件**: PascalCase (如 `types.ts`)

## 后端结构

### 路由 -> 控制器 -> 服务 -> 仓库 模式

```
请求 → 路由匹配 → 控制器处理 → 服务业务逻辑 → 仓库数据访问 → 数据库
```

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| GET | /api/auth/profile | 获取用户信息 |
| GET | /api/records/daily | 获取日常记录 |
| GET | /api/records/daily/stats | 获取日统计数据 |
| POST | /api/records/daily | 保存日常记录 |
| GET | /api/records/monthly | 获取月度记录 |
| POST | /api/records/monthly | 保存月度记录 |
| GET | /api/config | 获取配置 |
| PUT | /api/config | 更新配置 |
| POST | /api/backup/export | 导出备份 |
| POST | /api/backup/import | 导入备份 |

## 数据库模型

参见 `prisma/schema.prisma`

主要模型:
- **User**: 用户账号
- **DailyRecord**: 日常抄表记录
- **MonthlyRecord**: 月度抄表记录
- **Config**: 系统配置
