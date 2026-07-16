# Tasks

- [x] Task 1: 实现第三人称摄像机跟随
  - 移除 OrbitControls 相关代码（new OrbitControls、controls.update()）
  - 在 render() 中计算摄像机目标位置：玩家身后（远离山体中心方向）上方
  - 使用 lerp 平滑插值实现跟随效果
  - 摄像机注视玩家位置
  - 添加鼠标滚轮调整摄像机距离（8~20 单位）
  - 保留 resize 处理和渲染循环
