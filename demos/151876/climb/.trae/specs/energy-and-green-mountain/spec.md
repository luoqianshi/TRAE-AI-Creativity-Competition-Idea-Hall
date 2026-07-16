# 能量升级 & 山体全绿渐变 规范

## Why
1. 越高关卡需要更多能量支撑攀爬，每过一关能量上限+100 增加游戏深度
2. 山体颜色需统一为绿色渐变（底部深绿→顶部浅绿），去除黄色和白色

## What Changes
- 每达到 1000 米整数倍（过关），最大能量 +100
- 能量上限从固定 100 变为可增长（初始 100，最高 1000）
- 山体三层均改为绿色渐变：底 #388E3C → 中 #66BB6A → 顶 #A5D6A7
- **BREAKING**: MAX_ENERGY 从常量变为可变 state 属性

## Impact
- Affected specs: level-system, mountain-enrichment
- Affected code: game.js（能量上限逻辑、UI）, game3d.js（山体颜色）

## MODIFIED Requirements

### Requirement: 能量随关卡增长
系统 SHALL 在玩家每通过一关（1000米的整数倍）时将最大能量上限增加 100。

#### Scenario: 通关增能
- **WHEN** 玩家攀爬高度达到 1000 的整数倍
- **THEN** 最大能量上限 +100，能量条满格刷新
- **AND** 滑落时能量重置为新上限

### Requirement: 山体全绿渐变
系统 SHALL 渲染整座山为绿色渐变，从底部深绿到顶部浅绿。
