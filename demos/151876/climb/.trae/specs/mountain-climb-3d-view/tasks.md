# Tasks

- [x] Task 1: 搭建 Three.js 3D 基础场景
  - 在 `index.html` 中新增 3D 场景容器 `<div id="scene3d">` 和 CDN 引入 Three.js
  - 创建 `game3d.js`，初始化 Three.js 渲染器、场景、摄像机、光照
  - 添加 OrbitControls 支持用户旋转/缩放视角
  - 设置蓝白天空背景和绿色地面

- [x] Task 2: 构建 3D 山峰模型
  - 使用 ConeGeometry 创建圆锥形山峰（底半径 10，高 30 单位）
  - 山峰材质分三层：底部绿色（树林）、中部灰色（岩石）、顶部白色（雪顶）
  - 使用三个堆叠的 CylinderGeometry 实现颜色分层
  - 添加树木装饰（40棵随机散布的简易几何树）

- [x] Task 3: 构建 3D 玩家人物模型
  - 用简单几何体组合人物：球体头部、圆柱体身体、圆柱体四肢
  - 人物颜色鲜艳（红色上衣、蓝色裤子）
  - 手臂和腿部分别分组以支持动画控制

- [x] Task 4: 实现人物位置与高度同步
  - 在 `game3d.js` 中暴露 `updatePlayerHeight(height)` 函数
  - 在 `game.js` 的 `updateHeightUI()` 中调用该函数
  - 人物位置映射：3D y 坐标 = (state.height / 3000) × 30
  - 人物在山体侧面根据高度计算圆锥表面位置

- [x] Task 5: 实现攀爬与滑落动画
  - 攀爬时人物手臂和腿交替摆动（350ms 正弦波动画）
  - 滑落时人物沿山体表面快速下滑 + Y轴旋转翻滚
  - 在 `game.js` 中调用对应的动画触发函数

- [x] Task 6: 布局整合与响应式适配
  - 桌面端左右分栏（3D 场景 55% + UI 45%）
  - 移动端上下布局（3D 场景 40vh + UI 下方滚动）
  - 桌面端隐藏 2D 背景装饰，移动端保留

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2、Task 3
- Task 5 依赖 Task 4
- Task 6 依赖 Task 1（可并行）
