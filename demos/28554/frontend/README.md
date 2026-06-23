# 幼儿园班级费用记账管理系统 - 前端

基于 Vue 3 + Vant 4 + TypeScript 构建的幼儿园财务管理系统前端项目。

## 技术栈

- **框架**: Vue 3.4+
- **UI组件库**: Vant 4
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **构建工具**: Vite 5
- **语言**: TypeScript
- **日期处理**: Day.js

## 项目结构

```
src/
├── api/              # API接口
│   └── index.ts      # 所有API调用
├── assets/           # 静态资源
│   └── styles/       # 全局样式
├── components/       # 组件
│   ├── AddExpenseForm.vue
│   └── AddToCategoryForm.vue
├── router/           # 路由配置
│   └── index.ts
├── stores/           # 状态管理
│   ├── auth.ts       # 认证状态
│   └── app.ts        # 应用状态
├── types/            # TypeScript类型定义
│   └── index.ts
├── utils/            # 工具函数
│   └── index.ts
├── views/            # 页面组件
│   ├── Login.vue
│   ├── Home.vue
│   ├── Dashboard.vue
│   ├── Expenses.vue
│   ├── Statistics.vue
│   ├── Categories.vue
│   ├── Admins.vue
│   ├── Organizations.vue
│   └── Logs.vue
├── App.vue           # 根组件
└── main.ts          # 入口文件
```

## 功能模块

### 1. 用户认证
- 手机号+密码登录
- 登录状态持久化
- 权限控制（超级管理员、财务老师、家长）

### 2. 数据看板
- 总收缴金额、已支出总额、当前余额展示
- 机构/班级筛选
- 快捷操作入口

### 3. 费用管理
- 费用列表展示（支持筛选、分页、下拉刷新）
- 新增/编辑/删除费用记录
- 追加金额功能
- 费用状态管理（待审核/进行中/已完成）

### 4. 统计分析
- 按类目统计（进度条展示）
- 按状态统计（卡片展示）
- 支持机构/班级筛选

### 5. 类目管理
- 预设类目：教材费用、玩具采购、伙食费、水电费、活动经费、其他
- 支持添加自定义类目
- 类目颜色标识

### 6. 管理员管理（仅超级管理员）
- 管理员列表
- 新增管理员
- 角色分配（财务老师/超级管理员）

### 7. 机构管理（仅超级管理员）
- 机构列表
- 新增机构
- 机构下新增班级

### 8. 操作日志
- 系统操作记录
- 按时间倒序展示
- 操作人、操作内容、操作时间

## 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:5176

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## API配置

项目已配置开发代理，所有 `/api` 请求会代理到后端服务（默认 http://localhost:3001）。

代理配置在 `vite.config.ts` 中：

```typescript
server: {
  port: 5176,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### 后端API接口

项目依赖以下后端API接口：

- `POST /api/login` - 用户登录
- `GET /api/expenses` - 获取费用列表
- `POST /api/expenses` - 新增费用
- `PUT /api/expenses/:id` - 更新费用
- `DELETE /api/expenses/:id` - 删除费用
- `POST /api/expenses/add-to-category` - 追加金额
- `GET /api/statistics/overview` - 获取概览数据
- `GET /api/statistics/category` - 按类目统计
- `GET /api/statistics/status` - 按状态统计
- `GET /api/categories` - 获取类目列表
- `POST /api/categories` - 新增类目
- `GET /api/admins` - 获取管理员列表
- `POST /api/admins` - 新增管理员
- `GET /api/organizations` - 获取机构列表
- `POST /api/organizations` - 新增机构
- `POST /api/classes` - 新增班级
- `GET /api/logs` - 获取操作日志

## 权限说明

- **家长用户**：免登录可查看费用信息（只读）
- **财务老师**：可管理费用、类目，查看日志
- **超级管理员**：拥有所有权限，包括管理员管理、机构管理

## 数据筛选

- 费用列表和统计支持按机构、班级、状态筛选
- 筛选条件会实时更新数据

## 样式定制

全局样式位于 `src/assets/styles/index.css`，可根据需求修改主题色、间距等。

Vant 组件样式默认引入，可通过覆盖 CSS 变量进行定制。

## 注意事项

1. 项目使用 TypeScript，建议开启 IDE 的类型提示
2. 所有金额显示使用千分位格式化
3. 日期显示使用 Day.js 处理
4. 登录token存储在 localStorage 中
5. 请求拦截器会自动添加 Authorization 头
6. 响应拦截器会处理 401 状态码（自动跳转登录）

## 后续优化建议

- [ ] 添加数据导出功能（Excel/PDF）
- [ ] 实现图表可视化（ECharts）
- [ ] 添加数据缓存策略
- [ ] 优化移动端体验
- [ ] 添加更多统计维度
- [ ] 实现家长缴费功能
- [ ] 多语言支持

## 许可证

MIT
