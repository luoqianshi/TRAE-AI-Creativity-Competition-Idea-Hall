# Tasks

- [x] Task 1: 搭建项目骨架与页面结构
  - [x] SubTask 1.1: 创建 `index.html`，包含应用容器、四个视图区域（首页 / 记录 / 奖励 / 设置）和底部导航栏骨架
  - [x] SubTask 1.2: 创建 `css/style.css`，定义 CSS 变量主题色、全局重置、卡片样式、底部导航栏样式、响应式断点
  - [x] SubTask 1.3: 创建 `js/utils.js`，实现通用工具函数（DOM 选择器封装、日期格式化、UUID 生成、Toast 提示、确认弹窗）

- [x] Task 2: 实现数据存储层
  - [x] SubTask 2.1: 创建 `js/storage.js`，定义 localStorage 键名 `baby_points_data` 和数据结构
  - [x] SubTask 2.2: 实现数据初始化逻辑（首次启动时写入默认操作人、默认行为模板）
  - [x] SubTask 2.3: 实现 `loadData()` 和 `saveData()` 函数，所有模块通过此接口读写数据
  - [x] SubTask 2.4: 实现各实体的 CRUD 辅助函数（babies / behaviors / records / rewards / exchanges / operators）

- [x] Task 3: 实现应用主控制器与路由
  - [x] SubTask 3.1: 创建 `js/app.js`，实现视图切换逻辑（点击底部导航切换页面）
  - [x] SubTask 3.2: 实现当前宝宝选择器（顶部下拉，切换 currentBabyId 并刷新所有视图）
  - [x] SubTask 3.3: 实现当前操作人选择器（顶部显示，可切换 currentOperatorId）
  - [x] SubTask 3.4: 实现页面初始化入口，应用启动时加载数据并渲染首页

- [x] Task 4: 实现家庭成员（宝宝）管理模块
  - [x] SubTask 4.1: 创建 `js/baby.js`，实现宝宝列表渲染（设置页内）
  - [x] SubTask 4.2: 实现添加 / 编辑宝宝表单（昵称、emoji 头像选择、生日、主题色）
  - [x] SubTask 4.3: 实现删除宝宝（二次确认，级联删除关联记录和兑换记录）
  - [x] SubTask 4.4: 实现切换当前宝宝时刷新全应用数据

- [x] Task 5: 实现行为积分系统模块
  - [x] SubTask 5.1: 创建 `js/behavior.js`，实现行为模板列表渲染（分加分 / 扣分两组）
  - [x] SubTask 5.2: 实现添加 / 编辑行为表单（名称、分值、emoji 图标、类型）
  - [x] SubTask 5.3: 实现删除行为（二次确认，仅删模板保留历史记录）
  - [x] SubTask 5.4: 实现首页快捷操作按钮区，点击即记录行为并触发反馈动画

- [x] Task 6: 实现积分看板与趋势图模块
  - [x] SubTask 6.1: 创建 `js/dashboard.js`，实现总积分大数字展示和宝宝信息
  - [x] SubTask 6.2: 实现今日摘要（加分次数、扣分次数、净积分）
  - [x] SubTask 6.3: 使用 Canvas 实现近 7 天 / 30 天柱状趋势图（绿色正值 / 红色负值）
  - [x] SubTask 6.4: 实现趋势图周期切换交互

- [x] Task 7: 实现奖励兑换系统模块
  - [x] SubTask 7.1: 创建 `js/reward.js`，实现奖励列表渲染（名称、所需积分、图标、兑换按钮）
  - [x] SubTask 7.2: 实现添加 / 编辑奖励表单
  - [x] SubTask 7.3: 实现申请兑换逻辑（积分校验、创建待确认记录）
  - [x] SubTask 7.4: 实现家长确认 / 拒绝兑换逻辑（确认时扣分并记日志）
  - [x] SubTask 7.5: 实现兑换申请列表展示（状态标签：待确认 / 已兑换 / 已拒绝）

- [x] Task 8: 实现成长记录时间线模块
  - [x] SubTask 8.1: 创建 `js/record.js`，实现时间线渲染（倒序，含行为记录和兑换记录）
  - [x] SubTask 8.2: 实现日期范围筛选（今天 / 近 7 天 / 近 30 天 / 全部）
  - [x] SubTask 8.3: 实现空状态提示

- [x] Task 9: 实现操作反馈动画与视觉打磨
  - [x] SubTask 9.1: 实现加分动画（总积分绿色弹跳放大）
  - [x] SubTask 9.2: 实现扣分动画（总积分红色震动）
  - [x] SubTask 9.3: 实现 Toast 提示组件（自动消失）
  - [x] SubTask 9.4: 打磨整体视觉风格（圆角、阴影、配色、间距）

- [x] Task 10: 创建项目说明文档
  - [x] SubTask 10.1: 创建 `PROJECT_GUIDE.md`，包含项目简介、目录结构、启动方式、技术栈、扩展方向

- [x] Task 11: 整体测试与验证
  - [x] SubTask 11.1: 验证首次启动默认数据初始化正常
  - [x] SubTask 11.2: 验证完整业务流程：添加宝宝 → 添加行为 → 加扣分 → 申请兑换 → 确认兑换 → 查看时间线
  - [x] SubTask 11.3: 验证数据持久化（刷新页面数据保留）
  - [x] SubTask 11.4: 验证移动端布局在手机宽度下正常显示

# Task Dependencies
- Task 2 依赖 Task 1（需要项目骨架）
- Task 3 依赖 Task 2（需要数据层）
- Task 4、Task 5、Task 6、Task 7、Task 8 依赖 Task 3（需要主控制器和路由）
- Task 9 依赖 Task 5（反馈动画触发于加分 / 扣分操作）
- Task 10 可与 Task 4-8 并行
- Task 11 依赖所有功能模块完成
