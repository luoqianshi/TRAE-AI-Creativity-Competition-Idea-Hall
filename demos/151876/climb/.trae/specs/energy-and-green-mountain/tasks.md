# Tasks

- [x] Task 1: 能量上限随关卡增长 (game.js)
  - state 添加 `maxEnergy: 100` 和 `lastCheckLevel: 0`
  - 在 updateHeightUI() 中检测过关，过关时 maxEnergy += 100
  - 能量回满至新上限，更新 UI 百分比计算
  - 滑落/重启时能量 = maxEnergy

- [x] Task 2: 山体全绿渐变 (game3d.js)
  - 底层颜色: #8BC34A → #388E3C（深绿）
  - 顶层颜色: #FFFFFF → #A5D6A7（浅绿）
  - 中层保持 #66BB6A
