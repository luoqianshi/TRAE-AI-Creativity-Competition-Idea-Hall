# Tasks

- [x] Task 1: 修复山体颜色渲染
  - 增大环境光强度 0.7 → 1.0
  - 降低方向光强度 1.3 → 0.9
  - 半球光地面色改为 #8BC34A 匹配山体基色

- [x] Task 2: 修改 MAX_HEIGHT 常量
  - game3d.js: MAX_GAME_HEIGHT = 10000
  - game.js: MAX_HEIGHT = 10000，新增 LEVEL_HEIGHT = 1000

- [x] Task 3: 关卡编号 UI 显示
  - index.html 新增 id="levelLabel" 显示"第 X 关"
  - game.js updateHeightUI() 中计算并更新关卡编号

- [x] Task 4: 更新金币奖励阶梯
  - 0-2000m: 10/100m
  - 2000-5000m: 25/100m
  - 5000-10000m: 50/100m

- [x] Task 5: 进度条适配
  - 百分比基于 10000 米计算（自动适配）

# Task Dependencies
- Task 1 独立
- Task 3、5 依赖 Task 2
