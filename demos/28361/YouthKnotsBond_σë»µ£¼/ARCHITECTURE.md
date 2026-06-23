# YouthKnotsBond 系统架构与逻辑说明

## 一、系统架构概览

### 1.1 技术栈
- **前端**: iOS (Swift/SwiftUI)
- **后端**: Node.js + Express
- **数据库**: MySQL (阿里云RDS)
- **AI服务**: 阿里云千问Agent (qwen3.5-plus)
- **短信服务**: 阿里云短信服务
- **部署**: 阿里云ECS + Nginx + PM2
- **协议**: HTTPS (iOS要求)

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         iOS App                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  登录    │  │  对话    │  │  卡片    │  │  时间轴  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (443端口)                           │
│              SSL证书 + 反向代理                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend (3002端口)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  认证中间件 (JWT)                                      │  │
│  │  使用次数检查中间件                                     │  │
│  │  参数验证中间件                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │Conversation│ │  Card    │  │ Timeline │  │
│  │Controller│  │ Controller │ │Controller│  │Controller│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  阿里云短信   │    │ 阿里云Agent  │    │  MySQL数据库  │
│   服务       │    │   (千问)     │    │   (RDS)      │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 二、核心业务流程

### 2.1 用户认证流程

```
用户输入手机号
    ↓
发送验证码 → 阿里云短信服务
    ↓
用户输入验证码
    ↓
验证码校验 → 数据库查询
    ↓
新用户? → 是 → 创建用户(赠送1次免费)
    ↓
    否 → 查询用户信息
    ↓
生成JWT Token
    ↓
返回Token + 用户信息
```

**关键代码**: `authController.js`
- 验证码5分钟有效期
- 60秒内不能重复发送
- 新用户自动赠送1次免费使用
- JWT Token 30天有效期

### 2.2 对话交互流程

```
用户发送问题 (300字内)
    ↓
JWT认证 → 验证Token
    ↓
检查使用次数 → remaining_count > 0?
    ↓
    否 → 返回"次数不足"
    ↓
    是 → 继续
    ↓
获取会话历史 (最近3次)
    ↓
调用阿里云Agent
    ├─ 传入: 用户问题 + 历史上下文
    └─ Agent处理 (共情→分析→建议→安抚)
    ↓
Agent返回回复
    ↓
提取核心记录 + 建议标签
    ↓
保存对话记录到数据库
    ↓
扣除使用次数 (remaining_count - 1)
    ↓
记录使用日志
    ↓
返回: 回复内容 + 核心记录 + 建议标签 + 剩余次数
```

**关键代码**: `conversationController.js` + `agentService.js`
- 上下文控制: 只保留最近3次对话
- 事务处理: 确保对话记录和次数扣除的原子性
- 标签提取: 基于关键词匹配自动推荐标签

### 2.3 问题卡片流程

```
用户确认创建卡片
    ↓
选择对话记录
    ↓
编辑核心描述
    ↓
选择/添加标签
    ├─ 预设标签 (12个)
    └─ 自定义标签
    ↓
可选: 补充信息补充信息
    ↓
保存卡片到数据库
    ├─ problem_cards表
    ├─ card_tags关联表
    └─ 更新标签使用次数
    ↓
返回完整卡片信息
```

**关键代码**: `cardController.js`
- 卡片与对话关联: `conversation_id`
- 多对多关系: 卡片-标签通过`card_tags`表关联
- 轻量编辑: 支持"补充信息"和标签调整

### 2.4 时间轴展示流程

```
用户进入时间轴
    ↓
可选: 筛选标签
    ↓
查询用户的所有卡片记录
    ↓
按时间正序排列
    ↓
分析关键节点
    ├─ 首次出现 (绿色)
    ├─ 反复出现 (橙色)
    └─ 明显改善 (紫色)
    ↓
返回时间轴数据
    ├─ 卡片信息
    ├─ 关联标签
    └─ 节点类型/颜色
```

**关键代码**: `timelineController.js`
- 节点分析逻辑:
  - 首次: 第一条记录
  - 反复: 标签重复出现
  - 改善: 关键词检测("好转"、"改善"等)
- 支持标签筛选

### 2.5 付费机制流程

```
新用户注册
    ↓
赠送1次免费使用
    ↓
使用完毕后
    ↓
提示购买套餐
    ├─ 套餐: 29元/50次/30天
    └─ 9元10次: 1元/1次
    ↓
用户选择购买类型
    ↓
创建订单
    ↓
调用支付接口 (待集成)
    ↓
支付成功回调
    ↓
更新用户次数
    ├─ 套餐: 设置次数+到期时间
    └─ 9元10次: 增加次数
    ↓
返回购买成功
```

**关键代码**: `paymentController.js`
- 套餐有效期: 30天自动过期
- 过期检查: 每次使用前检查`package_expire_time`
- 订单状态: pending → paid

## 三、数据库设计

### 3.1 核心表结构

#### users (用户表)
```sql
- id: 用户ID
- phone: 手机号 (唯一)
- remaining_count: 剩余使用次数 (默认1)
- package_expire_time: 套餐到期时间
- is_first_time: 是否首次使用
- total_usage_count: 累计使用次数
```

#### conversations (对话记录表)
```sql
- id: 对话ID
- user_id: 用户ID (外键)
- user_input: 用户输入
- agent_reply: Agent回复
- core_record: 核心记录
- session_id: 会话ID (用于上下文)
- created_at: 对话时间
```

#### problem_cards (问题卡片表)
```sql
- id: 卡片ID
- user_id: 用户ID (外键)
- conversation_id: 关联对话ID (外键)
- core_description: 核心问题描述
- additional_notes: 补充信息
- created_at: 创建时间
```

#### tags (标签表)
```sql
- id: 标签ID
- tag_name: 标签名称 (唯一)
- usage_count: 使用次数
- is_preset: 是否预设标签
```

#### card_tags (卡片标签关联表)
```sql
- card_id: 卡片ID (外键)
- tag_id: 标签ID (外键)
- 联合唯一索引: (card_id, tag_id)
```

### 3.2 数据关系

```
users (1) ──────< (N) conversations
  │
  └──────< (N) problem_cards
                  │
                  └──────< (N) card_tags >──────< (N) tags
```

## 四、Agent集成逻辑

### 4.1 Agent配置
- **应用ID**: ffe5a2dde7bc44b9ae885eb0b69106f2
- **模型**: qwen3.5-plus
- **上下文**: 最近3次对话
- **回复逻辑**: 共情 → 分析 → 建议 → 安抚

### 4.2 Agent与数据库交互

#### 写入数据库 (每次对话后)
```javascript
{
  user_input: "用户问题",
  agent_reply: "Agent回复",
  core_record: "提炼的核心记录",
  session_id: "会话标识"
}
```

#### 读取数据库 (对话前)
```javascript
// 获取最近3次对话作为上下文
SELECT user_input, agent_reply 
FROM conversations 
WHERE user_id = ? AND session_id = ? 
ORDER BY created_at DESC 
LIMIT 3
```

#### 读取历史记录 (时间轴相关对话)
```javascript
// 当用户询问历史问题时，Agent可读取相关标签的历史
SELECT core_description, additional_notes, created_at
FROM problem_cards
WHERE user_id = ? AND tag_id IN (?)
ORDER BY created_at DESC
LIMIT 5
```

### 4.3 标签提取逻辑

基于关键词匹配自动推荐标签:
```javascript
{
  '写作业拖延': ['作业', '拖延', '磨蹭'],
  '情绪低落': ['情绪低落', '不开心', '郁闷'],
  '学习压力': ['学习压力', '考试', '成绩'],
  // ... 更多标签
}
```

## 五、安全与性能

### 5.1 安全措施
1. **HTTPS强制**: iOS要求，Nginx配置SSL
2. **JWT认证**: 所有接口(除登录)需要Token
3. **参数验证**: express-validator中间件
4. **SQL注入防护**: 使用参数化查询
5. **密码加密**: bcryptjs (预留)
6. **验证码限制**: 60秒内不能重复发送

### 5.2 性能优化
1. **数据库连接池**: 最大10个连接
2. **索引优化**: 
   - user_id, phone, created_at等字段建立索引
   - card_tags联合唯一索引
3. **分页查询**: 所有列表接口支持分页
4. **事务处理**: 关键操作使用事务保证一致性
5. **PM2集群模式**: 支持多进程部署

### 5.3 容错处理
1. **Agent调用失败**: 返回友好提示，不扣除次数
2. **数据库事务**: 失败自动回滚
3. **日志记录**: Morgan + PM2日志
4. **健康检查**: /health接口监控服务状态

## 六、部署架构

### 6.1 端口分配
- **3000**: care-free-backend (已占用)
- **3001**: cat-app-backend (已占用)
- **3002**: youthknotsbond-backend (本项目)
- **80**: Nginx HTTP (重定向到443)
- **443**: Nginx HTTPS

### 6.2 目录结构
```
/root/
├── care-free-backend/          # 已有项目1
├── cat-app-backend/            # 已有项目2
└── youthknotsbond-backend/     # 本项目
    ├── src/
    ├── logs/
    ├── ssl/
    │   ├── youthknotsbond.qingguoguang.com.pem
    │   └── youthknotsbond.qingguoguang.com.key
    └── .env
```

### 6.3 Nginx配置
- 监听443端口 (HTTPS)
- SSL证书配置
- 反向代理到127.0.0.1:3002
- 80端口自动重定向到443

### 6.4 PM2配置
- 应用名: youthknotsbond-backend
- 集群模式: 1个实例 (可扩展)
- 自动重启: 内存超过500M或崩溃
- 日志管理: logs/error.log, logs/out.log

## 七、前端对接指南

### 7.1 基础配置
```swift
let baseURL = "https://youthknotsbond.qingguoguang.com/api"
let headers = [
    "Content-Type": "application/json",
    "Authorization": "Bearer \(token)"
]
```

### 7.2 关键接口调用顺序

#### 首次使用流程
```
1. 发送验证码: POST /api/auth/send-code
2. 登录: POST /api/auth/login
3. 保存Token到本地
4. 获取用户信息: GET /api/auth/user-info
```

#### 对话流程
```
1. 检查剩余次数 (从用户信息获取)
2. 发起对话: POST /api/conversation/chat
3. 展示Agent回复
4. 提示创建卡片 (可选)
```

#### 创建卡片流程
```
1. 获取预设标签: GET /api/tags/preset
2. 用户编辑卡片信息
3. 创建卡片: POST /api/cards
4. 刷新时间轴
```

#### 时间轴流程
```
1. 获取所有标签: GET /api/tags
2. 用户选择标签筛选 (可选)
3. 获取时间轴: GET /api/timeline?tagId=1
4. 渲染时间轴节点 (根据nodeType和nodeColor)
```

### 7.3 错误处理
```swift
if response.code == "NO_REMAINING_COUNT" {
    // 显示购买套餐弹窗
    showPurchaseAlert()
} else if response.code == "PACKAGE_EXPIRED" {
    // 提示套餐已过期
    showExpiredAlert()
}
```

## 八、测试建议

### 8.1 单元测试
- 认证流程: 验证码发送、登录、Token验证
- 对话流程: Agent调用、次数扣除、上下文管理
- 卡片流程: 创建、更新、标签管理
- 支付流程: 订单创建、回调处理

### 8.2 集成测试
- 完整用户流程: 注册→对话→创建卡片→查看时间轴
- 付费流程: 免费使用→购买套餐→继续使用
- 并发测试: 多用户同时对话

### 8.3 压力测试
- 100并发用户对话
- Agent响应时间监控
- 数据库连接池压力测试

## 九、后续优化方向

1. **支付集成**: 对接支付宝/微信支付SDK
2. **Agent优化**: 
   - 更智能的标签提取
   - 更精准的核心记录提炼
   - 支持多轮深度对话
3. **数据分析**: 
   - 用户行为分析
   - 问题趋势分析
   - 改善效果评估
4. **功能扩展**:
   - 家长社区
   - 专家咨询
   - 课程推荐
5. **性能优化**:
   - Redis缓存
   - CDN加速
   - 数据库读写分离

---

**文档版本**: v1.0  
**更新时间**: 2026-03-06  
**维护者**: YouthKnotsBond Team
