# Tasks

- [x] Task 1: 添加远山地平线
  - 在 game3d.js 中创建 4 座 ConeGeometry 远山
  - 远山分布在半径 30-50 的环上，高度 6-15
  - 颜色使用渐远渐淡的绿色/蓝绿色（#7CB342, #9CCC65, #AED581, #C5E1A5）
  - 使用 MeshToonMaterial

- [x] Task 2: 添加湖泊
  - 创建圆形 PlaneGeometry 湖泊
  - 放置在地面 y=-14.9，距中心约 28 单位
  - 颜色 #5C9CE5（Roblox 风格湖水蓝）

- [x] Task 3: 添加 3D 云朵
  - 创建 10 个 BoxGeometry 白色方块云朵
  - 大小随机 1-3 单位，高度随机 20-40
  - 在 render() 循环中缓慢漂移

- [x] Task 4: 扩大树木分布范围
  - 将树木生成半径从 12~28 扩大到 12~40
  - 数量从 40 增加到 60
