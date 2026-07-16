# Tasks

- [x] Task 1: 改造 3D 场景材质为卡通风格
  - 将所有 MeshStandardMaterial 替换为 MeshToonMaterial
  - 调整颜色为更鲜艳饱和的色值
  - 移除雾气效果，天空改为亮蓝色
  - 地面改为亮绿色

- [x] Task 2: 改造 3D 角色为方块化
  - 身体和四肢用 BoxGeometry 替代 CylinderGeometry
  - 角色颜色改为亮黄皮肤(#fdd835)、大红上衣(#ff3d3d)、亮蓝裤子(#2979ff)
  - 移除阴影投射简化渲染

- [x] Task 3: 改造山峰树木为更风格化
  - 树木树干和树冠用更鲜艳的绿色/棕色
  - 山峰颜色：亮绿底部、暖灰中部、纯白雪顶

- [x] Task 4: 改造 UI 为 Roblox 风格
  - CSS 变量颜色全面改为明亮色系
  - 卡片/面板增加粗边框和更大圆角
  - 按钮使用鲜艳渐变和更大字号
  - 攀爬按钮改为醒目的大圆形
  - 字体加粗，间距加大

# Task Dependencies
- Task 1、Task 2、Task 3 可并行（均在 game3d.js）
- Task 4 与前三项并行（在 style.css）
