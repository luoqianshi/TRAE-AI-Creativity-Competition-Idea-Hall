# RealSpeek - 房产销售话术拆解微信小程序 实施计划

## 摘要

**产品名称**: RealSpeek（话术拆解助手）
**产品定位**: 面向购房者的智能防忽悠工具，通过 AI 拆解房产销售话术，识别无用信息、吹嘘、逼单、虚假信息，并与真实数据对比打假。
**产品形态**: 微信小程序
**技术路线**: LLM API 驱动（DeepSeek-V4-Flash + 微信云开发）
**目标范围**: 阶段一聚焦房产领域，验证需求后扩展至汽车/保险

---

## 一、当前状态分析

### 1.1 市场空白

经过市场调研，目前中国市场**尚未发现**一款专门以"房产销售话术拆解"为核心功能的小程序或 App。现有产品集中在：
- 综合房产交易平台（贝壳找房、安居客）：侧重交易撮合，不涉及话术拆解
- 房产资讯自媒体（公众号、头条号）：内容零散、非结构化
- 房产直播话术工具（房在线）：服务于销售端，而非买房端

**这是一个明确的蓝海机会。**

### 1.2 用户痛点

| 痛点场景 | 典型话术 | 用户困境 |
|---------|---------|---------|
| 距离夸大 | "五分钟直达地铁口"（实际步行20分钟） | 无法快速验证真假 |
| 学区虚假 | "对口XX名校，目送式教育" | 不知学区是否已变更 |
| 价格操控 | "即将涨价，再不买就亏了" | 不知是否真实涨价 |
| 稀缺制造 | "整个片区只剩这几套" | 无法验证房源真实性 |
| 定金陷阱 | "交2万锁定房源，不买全退" | 不知定金是否真的可退 |

### 1.3 技术可行性

- 微信云开发 `extend.AI` 已支持 DeepSeek/GLM 等模型，新开发者赠送 1 亿 Token 免费算力
- 高德地图 API 可精确计算步行/驾车距离，用于验证距离声称
- 贝壳开放平台提供成交案例数据，可用于房价对比
- 微信 AI 小程序成长计划提供免费云开发 + 10 亿 Token 激励资源

---

## 二、技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户层 (Client)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  uni-app (Vue3 + TypeScript) 微信小程序              │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │  │
│  │  │话术输入 │ │拆解结果  │ │数据对比│ │历史记录   │  │  │
│  │  │(文本/OCR│ │展示      │ │验证    │ │           │  │  │
│  │  │ /语音)  │ │          │ │        │ │           │  │  │
│  │  └─────────┘ └──────────┘ └────────┘ └───────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │  阶段一: 云开发    │  阶段二: 自建后端
          │  (wx.cloud)        │  (Node.js/Express)
          └─────────┬─────────┘
                    │
    ┌───────────────┼───────────────────┐
    │               │                   │
┌───┴───┐   ┌──────┴──────┐   ┌───────┴──────┐
│AI能力  │   │云函数/后端  │   │数据验证服务  │
│       │   │             │   │              │
│wx.cloud│  │- 内容安全   │   │- 高德地图API │
│.extend │   │  msgSecCheck│   │  (距离验证)  │
│.AI     │   │- 业务逻辑   │   │- 贝壳开放平台│
│       │   │- 数据CRUD   │   │  (房价数据)  │
│模型:   │   │             │   │- 政府公开数据│
│deepseek│   │             │   │  (学区/规划) │
│-v4-flash│  │             │   │              │
└───────┘   └──────┬──────┘   └──────────────┘
                   │
          ┌────────┴────────┐
          │   数据层          │
          │ ┌──────────────┐ │
          │ │ 云开发数据库  │ │  (MongoDB 风格)
          │ └──────────────┘ │
          │ ┌──────────────┐ │  (阶段二)
          │ │ Milvus向量库  │ │
          │ └──────────────┘ │
          └─────────────────┘
```

### 2.2 核心调用链路

```
用户输入话术文本
    │
    ├── [内容安全检查] msgSecCheck (云函数端调用)
    │       ├── 不通过 → 提示用户修改
    │       └── 通过 ↓
    │
    ├── [话术分类] LLM 分析 → 识别 7 大类话术
    │       ├── [数据验证触发] 根据分类决定是否调用外部 API
    │       │       ├── 地铁距离 → 高德地图 API
    │       │       ├── 房价对比 → 贝壳开放平台
    │       │       └── 学区信息 → 政府公开数据
    │       └── [RAG 增强] (阶段二) Milvus 检索相关知识
    │
    └── [结果组装] 话术拆解 + 风险评级 + 真实数据对比 + 建议
            └── 返回结构化结果给前端渲染
```

### 2.3 技术选型决策

| 决策项 | 选择 | 理由 |
|-------|------|------|
| 前端框架 | uni-app (Vue3 + TypeScript) | 一套代码多端，Vue3 生态成熟，社区活跃 |
| AI 调用 (阶段一) | wx.cloud.extend.AI | 零运维，免费 Token 额度，原生流式支持 |
| 主力 LLM | DeepSeek-V4-Flash | 云开发已支持，极低成本（约 0.03 元/次分析），中文能力强 |
| 备选 LLM | Qwen3.6-Plus | 阿里云百炼平台稳定性好，支持 Tool Calling |
| 状态管理 | Pinia | Vue3 官方推荐，TypeScript 支持好 |
| 内容安全 | 云函数代理调用 msgSecCheck | 避免前端暴露 access_token |
| 数据验证 (MVP) | 高德地图 API | 成熟稳定，免费额度充足，距离夸大是最常见话术 |
| OCR | 微信内置 OCR + 腾讯云 OCR | 微信内置免费额度，腾讯云精度更高 |

---

## 三、话术分类体系

### 3.1 七大分类

| 分类 | 英文标识 | 典型话术 | 心理机制 | 风险等级 |
|------|---------|---------|---------|---------|
| 价格操控类 | price_manipulation | "即将涨价""工抵房特价""团购优惠" | 制造紧迫感、稀缺感 | 高 |
| 配套虚假承诺类 | facility_false_promise | "步行5分钟到地铁""对口XX名校" | 画大饼、偷换概念 | 高 |
| 样板间误导类 | showroom_misleading | "这就是交付标准""家具都是赠送的" | 视觉欺骗 | 中 |
| 定金/认购陷阱类 | deposit_trap | "交2万锁定房源，不买全退" | 沉没成本锁定 | 高 |
| 市场行情误导类 | market_misleading | "房价永远只涨不跌""楼市回暖赶紧上车" | 恐惧错失 (FOMO) | 高 |
| 贷款/税费话术类 | loan_tax_speech | "零首付""我们可以帮你做假流水" | 降低门槛感知 | 高 |
| 房源信息话术类 | property_info_speech | "这是最后一套了""房东急售""满五唯一" | 虚假信息诱导 | 中 |

### 3.2 风险等级定义

- **critical（严重）**: 涉及法律风险、重大经济损失、虚假宣传
- **high（高）**: 信息严重失实、存在明显误导
- **medium（中）**: 存在一定夸大或模糊表述
- **low（低）**: 常规销售话术，无明显风险

---

## 四、分阶段实施计划

### 阶段一：MVP（核心功能闭环）

**目标**: 实现话术输入 → AI 拆解 → 结果展示的完整闭环

#### Step 1.1: 项目初始化与基础架构

**任务清单**:
1. 使用 CLI 创建 uni-app 项目（Vue3 + TypeScript + Vite）
   ```bash
   npx degit dcloudio/uni-preset-vue#vite-ts real-speek
   ```
2. 配置 `manifest.json`：填入微信小程序 AppID，基础库最低版本 3.15.1，开启云开发
3. 配置 `pages.json` 路由：首页、分析页、结果页、历史页、个人中心
4. 安装核心依赖：`pinia`、`sass`
5. 搭建云开发环境：开通云开发，获取环境 ID，初始化 `wx.cloud.init()`
6. 创建云函数：`contentCheck`（内容安全检查）、`dataVerify`（数据验证代理）

**产出文件**: `src/main.ts`、`src/App.vue`、`src/pages.json`、`src/manifest.json`、`src/config/index.ts`、`cloudfunctions/contentCheck/index.js`、`cloudfunctions/dataVerify/index.js`

#### Step 1.2: 核心 UI 开发

**页面清单**:

1. **首页** (`pages/index/index.vue`)
   - 产品介绍/Slogan
   - "开始分析"主按钮
   - 3 个快捷入口：文本输入 / 拍照识别 / 历史记录
   - 最近分析记录（最多 3 条）
   - 底部 AI 声明

2. **分析页** (`pages/analyze/index.vue`)
   - 文本输入区域（textarea，最大 2000 字）
   - 拍照/选图按钮（调用微信 OCR）
   - 字数统计 + "开始拆解"按钮（带 loading）
   - 输入示例提示

3. **结果页** (`pages/result/index.vue`)
   - 总体风险等级卡片（颜色编码：绿/黄/橙/红）
   - 话术拆解列表（每条可展开/收起）
   - 每条包含：原文片段 / 分类标签 / 风险等级 / 解释 / 真相 / 应对策略
   - 数据验证区域（如有）
   - 综合建议区域
   - 操作按钮：收藏 / 分享 / 再来一次

4. **历史页** (`pages/history/index.vue`)
   - 按日期分组的分析记录列表
   - 每条显示：摘要 / 风险等级 / 时间
   - 支持删除

5. **个人中心** (`pages/profile/index.vue`)
   - 用户头像/昵称
   - 今日剩余免费次数
   - 累计分析次数

**产出文件**: `src/pages/**/*.vue`、`src/components/**/*.vue`

#### Step 1.3: AI 核心逻辑开发

**任务清单**:

1. **封装 wx.cloud.extend.AI 调用** (`services/ai/cloudAI.ts`)
   - 非流式调用方法
   - 流式调用方法（打字机效果）

2. **Prompt 工程** (`prompts/` 目录)
   - 基础系统 Prompt：定义话术分析师角色、7 大分类体系、风险等级
   - 话术拆解 Prompt：结构化 JSON 输出，包含分类/风险/解释/真相/应对策略
   - 距离验证增强 Prompt：结合高德地图数据核查距离声称
   - Few-shot 示例：3-5 个典型话术拆解示例

3. **内容安全检查** (`composables/useContentSecurity.ts`)
   - 调用云函数 `contentCheck`
   - 用户输入预检查 + AI 输出后检查

4. **分析流程编排** (`composables/useAnalysis.ts`)
   ```
   用户输入 → 内容安全检查 → AI 话术分析 → 解析 JSON 结果
     → 判断是否需要数据验证 → 调用 dataVerify 云函数 → 增强结果
     → 内容安全检查(AI输出) → 保存到云数据库 → 返回结果
   ```

5. **数据验证服务** (`services/external/amap.ts` + 云函数)
   - 高德地图 API 接入（通过云函数代理，API Key 存储在环境变量）
   - 实现距离计算：步行距离 / 驾车距离 / 直线距离

**产出文件**: `src/services/ai/cloudAI.ts`、`src/composables/useAnalysis.ts`、`src/composables/useContentSecurity.ts`、`src/services/external/amap.ts`、`src/types/analysis.ts`、`prompts/**/*.md`

#### Step 1.4: 数据持久化与用户系统

**任务清单**:

1. **云数据库初始化**：创建集合 `users`、`analyses`、`app_config`，设置索引和权限
2. **用户管理** (`composables/useAuth.ts`)：静默登录、自动创建用户记录、每日免费次数管理（默认 5 次/天）
3. **历史记录** (`composables/useHistory.ts`)：保存/查询/收藏/删除
4. **状态管理** (`store/`)：Pinia store（user、analysis、history）

**产出文件**: `src/services/cloud/database.ts`、`src/composables/useAuth.ts`、`src/composables/useHistory.ts`、`src/store/*.ts`

#### Step 1.5: 合规与发布准备

**任务清单**:

1. **AI 声明组件** (`AiDisclaimer.vue`)：所有 AI 生成内容页面底部固定显示
2. **内容安全**：接入 `security.msgSecCheck`（通过云函数）
3. **隐私政策与用户协议**：编写页面 + 首次使用弹窗同意
4. **小程序审核准备**：
   - 注册企业/个体工商户主体
   - 添加「深度合成-AI问答」服务类目
   - 通过云开发平台获取算法备案资料并提交
5. **性能优化**：长文本分片处理、结果缓存、图片压缩

#### Step 1.6: 测试与优化

**任务清单**:

1. **功能测试**：准备 50+ 条典型房产话术测试用例，覆盖 7 大分类
2. **Prompt 调优**：根据测试结果调整 Prompt、Few-shot 示例、温度参数
3. **性能测试**：首屏加载、AI 响应时间（目标：流式首字 < 2 秒）
4. **体验优化**：加载动画、流式打字机效果、错误处理与重试

---

### 阶段二：功能增强

#### Step 2.1: 自建后端服务

- 搭建 Node.js/Express 后端，直接调用 DeepSeek API
- 支持模型切换（DeepSeek-V4-Flash / Qwen3.6-Plus）
- 实现 SSE 流式输出
- 前端适配器模式，支持云开发/自建后端无缝切换

#### Step 2.2: RAG 知识库

- 部署 Milvus 向量数据库
- 使用阿里百炼 `text-embedding-v4` 进行向量化
- 知识库内容：房产法律法规、典型案例、各城市购房政策、避坑指南
- RAG 检索流程：用户输入 → 向量化 → Milvus 检索 Top-5 → 注入 Prompt → LLM 分析

#### Step 2.3: 数据验证增强

- 接入贝壳开放平台 API（房价数据）
- 接入政府公开数据（学区划分、城市规划）
- 接入更多验证维度：价格对比、学区验证、规划信息核查

#### Step 2.4: 社区功能

- 帖子发布（文本 + 图片，可关联分析记录）
- 内容审核（msgSecCheck + 敏感词过滤）
- 互动功能（点赞、评论、分享）
- 推荐算法（基于标签的相关推荐）

#### Step 2.5: 高级功能

- 语音输入（微信语音识别 API → 实时转文字 → 自动分析）
- 图片 OCR 增强（腾讯云 OCR，支持宣传单/合同截图）
- 对比分析（多个楼盘话术对比）
- 个性化推荐（基于用户所在城市的政策信息）

---

## 五、数据库设计

### 5.1 云开发数据库（MongoDB 风格）

#### 集合: `users`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| _openid | string | 微信 openid（唯一索引） |
| nickName | string | 昵称 |
| avatarUrl | string | 头像 |
| role | 'free' \| 'vip' | 用户角色 |
| analysisCount | number | 累计分析次数 |
| dailyCount | number | 当日分析次数 |
| lastAnalysisDate | string | 最后分析日期 |
| createdAt | string | 注册时间 |

#### 集合: `analyses`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| _openid | string | 用户 openid（复合索引 with createdAt） |
| inputText | string | 原始输入文本 |
| inputType | 'text' \| 'ocr' \| 'voice' | 输入方式 |
| result.summary | string | 总体评估摘要 |
| result.overallRisk | 'low' \| 'medium' \| 'high' \| 'critical' | 总体风险 |
| result.items | AnalysisItem[] | 拆解条目列表 |
| result.suggestions | string[] | 综合建议 |
| result.dataVerifications | DataVerification[] | 数据验证结果 |
| model | string | 使用的模型 |
| duration | number | 分析耗时(ms) |
| isBookmarked | boolean | 是否收藏 |
| createdAt | string | 创建时间 |

**AnalysisItem 结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| originalText | string | 原始话术片段 |
| category | SpeechCategory | 话术分类（7 大类英文标识） |
| subCategory | string | 子分类 |
| technique | string | 使用的话术技巧 |
| riskLevel | 'low' \| 'medium' \| 'high' \| 'critical' | 风险等级 |
| explanation | string | 解释说明 |
| truth | string | 真实情况 |
| counterStrategy | string | 应对策略 |

**DataVerification 结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| type | 'distance' \| 'price' \| 'school' \| 'planning' | 验证类型 |
| claim | string | 中介声称的内容 |
| verifiedData | string | 验证后的真实数据 |
| source | string | 数据来源 |
| isConsistent | boolean | 是否一致 |
| deviation | string | 偏差说明 |

#### 集合: `app_config`

| 字段 | 类型 | 说明 |
|------|------|------|
| key | string | 配置键 |
| value | any | 配置值 |
| description | string | 说明 |

预置配置：`daily_free_limit`(5)、`max_input_length`(2000)、`current_model`、`maintenance_mode`

### 5.2 Milvus 向量库（阶段二）

集合名: `real_estate_knowledge`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT64 (PK) | 主键 |
| embedding | FLOAT_VECTOR | 文本向量 |
| knowledge_id | VARCHAR | 对应云数据库 knowledge_base 的 _id |
| category | VARCHAR | 分类标签 |
| content_hash | VARCHAR | 内容哈希（去重） |

---

## 六、API 设计

### 6.1 云函数 API（阶段一）

#### contentCheck - 内容安全检查

```
请求: { "content": "待检查文本" }
响应: { "code": 0, "data": { "pass": true, "suggest": "", "label": "" } }
```

#### dataVerify - 数据验证代理

```
请求: {
  "type": "distance" | "price" | "school",
  "params": {
    "origin": { "lng": number, "lat": number, "name": "string" },
    "destination": { "lng": number, "lat": number, "name": "string" },
    "claimedDistance": number
  }
}
响应: {
  "code": 0,
  "data": {
    "type": "distance",
    "verified": true,
    "actualDistance": 1200,
    "claimedDistance": 500,
    "isConsistent": false,
    "source": "高德地图"
  }
}
```

#### userManage - 用户管理

```
POST /userManage?action=getUserInfo
POST /userManage?action=updateDailyCount
POST /userManage?action=getAnalysisHistory
POST /userManage?action=toggleBookmark
```

### 6.2 自建后端 API（阶段二）

```
POST /api/v1/analysis/analyze          # AI 分析
POST /api/v1/analysis/analyze/stream   # SSE 流式
GET  /api/v1/verify/distance           # 距离验证
GET  /api/v1/verify/price              # 价格验证
GET  /api/v1/verify/school             # 学区验证
POST /api/v1/rag/search                # RAG 检索
POST /api/v1/community/posts           # 社区帖子
```

---

## 七、Prompt 工程设计

### 7.1 架构策略

采用**单次调用 + 结构化 JSON 输出**策略（MVP 阶段），减少 API 调用次数和延迟。

```
用户输入
    → 系统Prompt（角色定义 + 分类体系 + 输出格式）
    → 用户Prompt（原始话术 + Few-shot示例）
    → LLM 一次性输出完整 JSON 结果
    → 前端解析渲染
```

### 7.2 核心 Prompt 模板

**系统 Prompt 要点**:
- 角色定义："RealSpeek 话术分析师"，专注中国房地产销售话术拆解
- 7 大分类体系定义（含子分类和典型话术）
- 风险等级定义（critical/high/medium/low）
- 输出约束：客观中立、具体可操作建议、引用法规需准确、承认信息局限性

**话术拆解 Prompt 要点**:
- 严格 JSON 输出格式：summary、overallRisk、items[]、suggestions[]、needDataVerify
- 每个 item 包含：originalText、category、technique、riskLevel、explanation、truth、counterStrategy
- needDataVerify 标记是否需要距离/价格/学区验证
- 分析要求：逐句分析、说明心理操纵技巧、给出应对话术、标记可核查数据

**参数设置**:
- temperature = 0.1（保证一致性）
- max_tokens = 2000（控制输出长度）
- 模型：deepseek-v4-flash（日常）/ deepseek-v4-pro（复杂场景）

---

## 八、项目文件结构

```
f:\workspace\trae\real-speek\
├── src/
│   ├── main.ts                          # 入口文件
│   ├── App.vue                          # 根组件
│   ├── pages.json                       # 页面路由配置
│   ├── manifest.json                    # 应用配置
│   ├── uni.scss                         # 全局样式变量
│   ├── pages/
│   │   ├── index/index.vue              # 首页
│   │   ├── analyze/index.vue            # 话术分析页
│   │   ├── result/index.vue             # 分析结果页
│   │   ├── history/index.vue            # 历史记录
│   │   ├── knowledge/index.vue          # 避坑知识库（阶段二）
│   │   ├── community/index.vue          # 社区分享（阶段二）
│   │   └── profile/index.vue           # 个人中心
│   ├── components/
│   │   ├── TextInput/TextInput.vue      # 文本输入组件
│   │   ├── ImageOcr/ImageOcr.vue        # 图片 OCR 组件
│   │   ├── AnalysisResult/
│   │   │   ├── ResultCard.vue           # 拆解结果卡片
│   │   │   ├── RiskBadge.vue            # 风险等级标签
│   │   │   ├── DataCompare.vue          # 数据对比组件
│   │   │   └── SuggestionList.vue       # 建议列表
│   │   └── Common/
│   │       ├── LoadingOverlay.vue       # 加载遮罩
│   │       ├── EmptyState.vue           # 空状态
│   │       └── AiDisclaimer.vue         # AI 声明
│   ├── composables/
│   │   ├── useAnalysis.ts               # 话术分析核心逻辑
│   │   ├── useCloudAI.ts                # 云开发 AI 封装
│   │   ├── useContentSecurity.ts        # 内容安全检查
│   │   ├── useDataVerify.ts             # 数据验证
│   │   ├── useOcr.ts                    # OCR 识别封装
│   │   ├── useHistory.ts                # 历史记录管理
│   │   └── useAuth.ts                   # 用户授权管理
│   ├── services/
│   │   ├── ai/cloudAI.ts                # 阶段一: 云开发 AI
│   │   ├── ai/selfHostedAI.ts           # 阶段二: 自建后端 AI
│   │   ├── ai/aiAdapter.ts              # AI 适配器
│   │   ├── cloud/database.ts            # 云数据库操作
│   │   └── external/amap.ts             # 高德地图 API
│   ├── store/                           # Pinia 状态管理
│   ├── types/                           # TypeScript 类型定义
│   ├── utils/                           # 工具函数
│   ├── config/                          # 配置文件
│   ├── static/                          # 静态资源
│   └── styles/                          # 样式文件
├── cloudfunctions/                      # 云函数
│   ├── contentCheck/index.js
│   ├── dataVerify/index.js
│   └── userManage/index.js
├── prompts/                             # Prompt 工程
│   ├── system/base-system.md
│   ├── analysis/speech-decompose.md
│   └── verify/distance-check.md
└── package.json
```

---

## 九、验证方案

### 9.1 AI 分析质量验证

**测试用例矩阵**（10 条核心用例）:

| 话术 | 预期分类 | 预期风险 |
|------|---------|---------|
| "这个价格月底就涨了，现在买最划算" | price_manipulation | medium |
| "这是工抵房，比正常价格便宜30%" | price_manipulation | high |
| "出门就是地铁站，步行5分钟" | facility_false_promise | medium-high |
| "这个小区是XX小学学区房，100%能上" | facility_false_promise | critical |
| "你看这个样板间，交付就是这个标准" | showroom_misleading | high |
| "今天交2万定金，明天就没了" | deposit_trap | critical |
| "这个区域明年房价至少涨20%" | market_misleading | high |
| "我们可以做零首付，月供只要2000" | loan_tax_speech | critical |
| "这个户型全小区就剩最后3套了" | property_info_speech | medium |
| "这个小区绿化率35%，物业费2.5/平" | normal | low |

**验证指标**:
- 分类准确率 > 90%
- JSON 格式解析失败率 < 2%
- 幻觉率（引用不存在的法规/数据）< 5%
- 流式首字响应 < 2 秒

### 9.2 数据验证准确性

| 验证类型 | 测试方法 |
|---------|---------|
| 距离验证 | 高德步行导航 API 对比声称距离 |
| 价格验证 | 贝壳挂牌均价对比声称价格 |
| 学区验证 | 教育局公示学区划分对比声称学区 |

### 9.3 合规验证清单

- [ ] 企业/个体工商户主体已注册
- [ ] 「深度合成-AI问答」服务类目已添加
- [ ] 算法备案已完成并提交
- [ ] AI 声明在所有 AI 生成内容页面展示
- [ ] msgSecCheck 内容安全接口已接入
- [ ] 隐私政策 + 用户协议页面已完善
- [ ] 首次使用弹窗同意机制已实现

---

## 十、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|---------|
| 算法备案周期长 | 小程序无法上架 | 提前启动备案；备案期间用体验版测试 |
| 云开发 Token 不够用 | 用户无法使用 | 每日免费次数限制；阶段二切换自建后端 |
| AI 输出格式不稳定 | 前端解析失败 | JSON Schema 约束；解析失败重试；降级为纯文本 |
| 高德 API 额度耗尽 | 距离验证不可用 | 结果缓存；免费额度监控 |
| Prompt 被绕过 | 输出不当内容 | 内容安全后检查；定期红队测试 |

---

## 十一、成本估算

单次分析（约 3000 字话术）Token 消耗：
- 话术分类 + 拆解：约 0.01 元
- 数据验证增强：约 0.016 元
- **单次合计约 0.03 元**

每日 100 次分析，月成本约 **100 元**（DeepSeek-V4-Flash）。
