# 关卡系统 & 颜色渲染修复 规范

## Why
1. 山体颜色虽已设为绿色，但因光照设置问题渲染后看起来偏灰
2. 需要 10 关系统，每关 1000 米，总高度 10000 米

## What Changes
- 修复光照使山体绿色可见（增加环境光、降低方向光强度）
- MAX_HEIGHT: 3000 → 10000（10 关 × 1000 米）
- 高程进度条适配 10000 米
- UI 显示当前关卡编号
- 金币奖励阶梯相应调整
- 3D 山体高度映射不变（视觉高度仍为 45 单位）

## Impact
- Affected specs: all previous game specs
- Affected code: game3d.js（光照调整、常量）, game.js（MAX_HEIGHT、关卡逻辑、奖励阶梯）, style.css（进度条）, index.html（关卡显示）

## ADDED Requirements

### Requirement: 关卡系统
系统 SHALL 按每 1000 米划分一关，共 10 关，山顶 = 10000 米 = 第 10 关通关。

#### Scenario: 关卡显示
- **WHEN** 玩家攀爬
- **THEN** UI 显示当前关卡编号（当前高度/1000 取整 +1）
- **AND** 进度条按 10000 米计算百分比

### Requirement: 山峰颜色可见
系统 SHALL 确保山体绿色在渲染时肉眼可见为绿色。

#### Scenario: 颜色可见
- **WHEN** 场景渲染
- **THEN** 山体底层和中层呈现绿色（非灰色）
