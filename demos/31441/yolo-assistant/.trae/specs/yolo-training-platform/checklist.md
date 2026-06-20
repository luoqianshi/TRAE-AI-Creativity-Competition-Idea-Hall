Set-Content -Path "d:\TraeWorkspace\yolo-assistant.trae\specs\yolo-training-platform\checklist.md" -Value @'

# YOLO模型训练平台前端 - 验证检查清单

- Checkpoint 1: 登录页面能正常访问，表单包含用户名和密码输入框
- Checkpoint 2: 登录表单验证功能正常（空字段、错误密码提示）
- Checkpoint 3: 使用admin/admin登录成功跳转到主界面
- Checkpoint 4: 主页面布局完整（侧边栏+主内容区）
- Checkpoint 5: 导航菜单点击能切换到对应模块页面
- Checkpoint 6: 文件上传组件支持拖放和选择两种方式
- Checkpoint 7: 文件上传进度条能模拟0-100%更新
- Checkpoint 8: 图片标注工具能创建、调整、删除矩形标注框
- Checkpoint 9: 数据集列表展示完整信息（名称、数量、时间）
- Checkpoint 10: 数据集搜索、筛选、分页功能正常工作
- Checkpoint 11: 训练参数配置表单包含epochs、batch size、learning rate
- Checkpoint 12: 训练控制按钮（开始/暂停/停止）状态切换正确
- Checkpoint 13: 训练进度条实时更新，日志滚动显示
- Checkpoint 14: 训练状态指示和异常提示功能正常
- Checkpoint 15: 模型列表展示模型名称、训练时间、精度指标、大小
- Checkpoint 16: 模型预览弹窗显示结构和性能曲线
- Checkpoint 17: 模型排序和筛选功能正常
- Checkpoint 18: 模型下载按钮触发下载进度模拟
- Checkpoint 19: 下载完成后显示提示并记录到历史
- Checkpoint 20: 页面在桌面端（≥1200px）布局正常
- Checkpoint 21: 页面在平板端（768px-1199px）布局正常
- Checkpoint 22: 页面在移动端（<768px）布局正常
- Checkpoint 23: 页面切换有平滑过渡效果
- Checkpoint 24: 所有交互元素有操作反馈（按钮悬停、表单提交等）
  '@

