# 物业监管平台 - 技术架构文档

## 1. 架构概述

### 1.1 架构风格
采用 **MVVM (Model-View-ViewModel)** 架构模式，使用 Vue 3 作为前端框架，结合 TailwindCSS 进行样式管理，Chart.js 进行数据可视化。

### 1.2 模块划分
- **首页模块**: 总览页面，包含服务评分、投诉趋势、费用状态
- **费用透明模块**: 物业费收支明细、公共收益流向
- **投诉中心模块**: 投诉表单、进度跟踪、满意度评价
- **服务记录模块**: 服务履约记录、信用评分
- **监管看板模块**: 投诉热力图、数据统计

---

## 2. 技术栈

| 分类 | 技术 | 版本 | 用途 |
| :--- | :--- | :--- | :--- |
| 前端框架 | Vue 3 | 3.4+ | 组件化开发、响应式数据 |
| 样式框架 | TailwindCSS 3 | 3.4+ | 快速样式开发、响应式布局 |
| 图表库 | Chart.js | 4.4+ | 数据可视化图表 |
| 图标库 | Lucide Icons | 1.0+ | 图标展示 |
| 构建工具 | Vite | 6.5+ | 快速开发构建 |

---

## 3. 文件结构

```
/
├── index.html              # 主入口HTML
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite配置
├── tailwind.config.js      # TailwindCSS配置
├── postcss.config.js       # PostCSS配置
├── src/
│   ├── main.js             # 应用入口
│   ├── App.vue             # 根组件
│   ├── style.css           # 全局样式
│   ├── components/         # 组件目录
│   │   ├── Navbar.vue      # 导航栏组件
│   │   ├── Footer.vue      # 页脚组件
│   │   ├── ScoreCard.vue   # 评分卡片组件
│   │   ├── TrendChart.vue  # 趋势图表组件
│   │   ├── ComplaintForm.vue # 投诉表单组件
│   │   ├── ServiceCard.vue # 服务卡片组件
│   │   └── HeatMap.vue     # 热力图组件
│   ├── views/              # 页面视图
│   │   ├── Home.vue        # 首页总览
│   │   ├── Finance.vue     # 费用透明
│   │   ├── Complaint.vue   # 投诉中心
│   │   ├── Service.vue     # 服务记录
│   │   └── Dashboard.vue   # 监管看板
│   └── data/               # 模拟数据
│       └── mockData.js     # 模拟数据文件
```

---

## 4. 组件设计

### 4.1 Navbar 导航栏组件

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| activeTab | String | 当前激活的标签页 |

| 事件 | 说明 |
| :--- | :--- |
| tab-change | 切换标签页 |

### 4.2 ScoreCard 评分卡片组件

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| score | Number | 评分值 (0-5) |
| title | String | 标题 |
| subtitle | String | 副标题 |

### 4.3 TrendChart 趋势图表组件

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| data | Array | 图表数据 |
| title | String | 图表标题 |

### 4.4 ComplaintForm 投诉表单组件

| 事件 | 说明 |
| :--- | :--- |
| submit | 提交投诉 |

### 4.5 ServiceCard 服务卡片组件

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| service | Object | 服务数据对象 |

### 4.6 HeatMap 热力图组件

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| data | Array | 热力图数据 |

---

## 5. 数据模型

### 5.1 投诉数据结构
```javascript
{
  id: String,           // 投诉ID
  type: String,         // 投诉类型（卫生/维修/安保等）
  description: String,  // 投诉描述
  images: Array,        // 图片URL数组
  status: String,       // 状态：pending/processing/completed
  createdAt: Date,      // 创建时间
  updatedAt: Date,      // 更新时间
  rating: Number        // 满意度评分
}
```

### 5.2 费用数据结构
```javascript
{
  id: String,           // 费用ID
  category: String,     // 分类
  type: String,         // 类型：income/expense
  amount: Number,       // 金额
  description: String,  // 描述
  date: Date            // 日期
}
```

### 5.3 服务记录结构
```javascript
{
  id: String,           // 服务ID
  serviceType: String,  // 服务类型
  title: String,        // 标题
  description: String,  // 描述
  status: String,       // 状态：completed/pending
  completedAt: Date,    // 完成时间
  rating: Number        // 评分
}
```

### 5.4 热力图数据结构
```javascript
{
  district: String,     // 区域名称
  count: Number,        // 投诉数量
  lat: Number,          // 纬度
  lng: Number           // 经度
}
```

---

## 6. 页面路由

| 路径 | 组件 | 说明 |
| :--- | :--- | :--- |
| / | Home.vue | 首页总览 |
| /finance | Finance.vue | 费用透明 |
| /complaint | Complaint.vue | 投诉中心 |
| /service | Service.vue | 服务记录 |
| /dashboard | Dashboard.vue | 监管看板 |

---

## 7. API 接口设计

### 7.1 投诉相关接口

| 接口 | 方法 | 说明 |
| :--- | :--- | :--- |
| /api/complaints | GET | 获取投诉列表 |
| /api/complaints | POST | 提交新投诉 |
| /api/complaints/:id | GET | 获取投诉详情 |
| /api/complaints/:id | PUT | 更新投诉状态 |
| /api/complaints/:id/rating | POST | 提交满意度评价 |

### 7.2 费用相关接口

| 接口 | 方法 | 说明 |
| :--- | :--- | :--- |
| /api/finance | GET | 获取费用列表 |
| /api/finance/income | GET | 获取收入明细 |
| /api/finance/expense | GET | 获取支出明细 |

### 7.3 服务相关接口

| 接口 | 方法 | 说明 |
| :--- | :--- | :--- |
| /api/services | GET | 获取服务记录列表 |
| /api/services/:id | GET | 获取服务详情 |

### 7.4 监管相关接口

| 接口 | 方法 | 说明 |
| :--- | :--- | :--- |
| /api/dashboard/stats | GET | 获取统计数据 |
| /api/dashboard/heatmap | GET | 获取热力图数据 |

---

## 8. 部署与运行

### 8.1 开发环境
```bash
npm install
npm run dev
```

### 8.2 生产构建
```bash
npm run build
```

### 8.3 部署方式
- 静态文件部署至 CDN 或静态服务器
- 支持 Docker 容器化部署

---

## 9. 安全性考虑

| 安全点 | 措施 |
| :--- | :--- |
| XSS攻击 | 使用 Vue 模板自动转义 |
| CSRF攻击 | 配置 CSRF token |
| 文件上传 | 限制文件类型和大小 |
| 数据验证 | 前后端双重验证 |
| HTTPS | 强制使用 HTTPS |
