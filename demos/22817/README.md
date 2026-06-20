# 携程多账号批量产品库存改价工作台

这是一个可直接打开的前端交互原型，入口文件：

`ctrip-price-workbench.html`

## 使用方式

在浏览器中打开该 HTML 文件即可运行，不需要安装依赖或启动 dev server。

已实现页面：

- 工作台
- 账号管理
- 产品列表
- 库存改价
- 批量任务
- 操作日志
- 系统设置

当前阶段已实现交互：

- 清空初始假账号、假产品、假任务、假日志
- 添加携程账号接入记录
- 打开携程商家后台登录页
- 手动确认登录完成后，将账号标记为已授权
- 本地保存账号接入记录，方便刷新页面后继续查看

## 后续接真实接口的建议

当前静态页面不会读取、展示或明文保存携程原始 Cookie。要在登录后托管携程会话，建议下一步增加本地后端或浏览器扩展：

- 由受控服务打开或接管携程登录页
- 登录成功后安全读取授权状态
- 加密保存会话引用，而不是把 Cookie 暴露给前端页面
- 前端只保存账号 ID、授权状态、店铺名称、最近同步时间等业务字段

后续真实接口建议保留字段：

- `accountId`
- `venueId`
- `product.id`
- `sku.id`
- `date`
- `price`
- `stock`
- `status`

迁移到 React + TypeScript 时，建议拆成：

- `services/accountService.ts`
- `services/productService.ts`
- `services/priceService.ts`
- `services/taskService.ts`
- `components/ProductCard.tsx`
- `components/SkuTable.tsx`
- `pages/PriceWorkbench.tsx`
- `pages/TaskList.tsx`
