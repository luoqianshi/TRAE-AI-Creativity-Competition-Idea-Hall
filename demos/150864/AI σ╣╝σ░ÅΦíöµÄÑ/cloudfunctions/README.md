# cloudfunctions/ — 云函数目录

每个子目录为一个云函数，部署到微信云开发。

## 云函数清单

| 目录 | 职责 | 触发方式 | 依赖 |
|------|------|----------|------|
| `login/` | 登录鉴权，返回 openid、角色信息 | 客户端 callFunction | wx-server-sdk |
| `ai-generate/` | AI 调度核心：出题、评估、语音、推荐 | 客户端 callFunction | wx-server-sdk, axios（调大模型） |
| `ai-weekly/` | 每周成长周报生成 | 客户端 / 定时触发器 | wx-server-sdk, axios |
| `task-engine/` | 任务引擎：今日任务、提交、详情 | 客户端 callFunction | wx-server-sdk |
| `growth-stats/` | 成长统计：雷达、周概览、同期群 | 客户端 callFunction | wx-server-sdk |
| `share-trace/` | 分享追踪、海报、体验课领取 | 客户端 callFunction | wx-server-sdk |
| `pay-order/` | 微信支付统一下单（v1.1） | 客户端 callFunction | wx-server-sdk |
| `track/` | 自定义埋点上报 | 客户端 callFunction | wx-server-sdk |

## 部署步骤

1. 在微信开发者工具中，右键 `cloudfunctions/login` → 「上传并部署：云端安装依赖」
2. 依次部署其余云函数
3. 在云开发控制台 → 云函数 → 环境变量，配置：
   - `AI_API_KEY`：大模型 API Key（DeepSeek/通义/智谱）
   - `AI_API_URL`：大模型接口地址
   - `AI_MODEL`：模型名称

## 单个云函数结构示例（login）

```
login/
├── index.js      # 入口
├── package.json  # 依赖声明
└── config.json   # 云函数配置（超时、内存）
```

> MVP 阶段先实现 `login` + `ai-generate` + `task-engine` 三个即可支撑核心流程。
