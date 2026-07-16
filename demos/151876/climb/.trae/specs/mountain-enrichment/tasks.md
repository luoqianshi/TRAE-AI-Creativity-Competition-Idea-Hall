# Tasks

- [x] Task 1: 修复角色头部可见性
  - 皮肤色从 #FDD835 改为 #FFB74D（橙粉色，与绿色山体对比明显）
  - 在头部上方添加红色 BoxGeometry 帽子（#FF3D3D，尺寸 0.6×0.2×0.5）

- [x] Task 2: 放大山体和地面
  - MOUNTAIN_HEIGHT: 30 → 45
  - MOUNTAIN_BASE_RADIUS: 10 → 15
  - 调整三层圆柱体的几何参数适配新比例
  - 地面 PlaneGeometry: 60×60 → 100×100
  - 地面 y 位置: -15 → -22.5
  - 调整远山/湖泊/云朵参数适配新比例

- [x] Task 3: 添加山面岩石
  - 在山体各层表面散布 30 个随机小石块（BoxGeometry 灰色 #9E9E9E）
  - 岩石随机旋转，紧贴山体表面

- [x] Task 4: 添加山面灌木和小树
  - 在山体下层（y 0~20）散布 20 个小灌木（绿色小 ConeGeometry）
  - 颜色 #66BB6A、#81C784 交替

- [x] Task 5: 添加弯曲小径
  - 使用 BoxGeometry 块螺旋摆放，绕山 3 圈从山脚到山顶
  - 颜色 #A1887F

- [x] Task 6: 添加溪流
  - 在山体一侧从 60% 高度向下蜿蜒流动
  - 颜色 #64B5F6

# Task Dependencies
- Task 2 需先完成（其他装饰基于新山体尺寸）
- Task 3、4、5、6 可并行
