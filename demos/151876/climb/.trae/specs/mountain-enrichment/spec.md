# 角色可见性 & 山体场景丰富 规范

## Why
1. 玩家头部黄色与山体/天空颜色相近，难以辨识
2. 山体太小，玩家缺乏"置身山中"的沉浸感
3. 山体表面空旷无物，缺少风景细节

## What Changes
- 玩家皮肤色改为更明显的肤色，头部加一顶红色帽子
- 山体尺寸放大（高度 45，底部半径 15），地面扩大
- 山体表面添加岩石、灌木、弯曲小径、溪流、草丛
- 调整摄像机起始高度匹配新山体

## Impact
- Affected specs: roblox-style, surrounding-scenery, third-person-camera
- Affected code: game3d.js（山体尺寸、角色头饰、山面装饰物）

## MODIFIED Requirements

### Requirement: 角色头部可见性
系统 SHALL 让玩家头部清晰可见，不与背景混淆。

#### Scenario: 头部辨识
- **WHEN** 摄像机跟随玩家
- **THEN** 头部颜色与山体/天空形成明显对比
- **AND** 头顶有红色装饰物（帽子）

### Requirement: 大型山体
系统 SHALL 渲染更大尺寸的山峰使玩家有置身山中的感觉。

#### Scenario: 山体尺寸
- **WHEN** 场景加载
- **THEN** 山峰高度约 45 单位，底部半径约 15 单位
- **AND** 地面扩展到 100×100

### Requirement: 山面风景
系统 SHALL 在山体表面添加岩石、灌木、小径、溪流等装饰。

#### Scenario: 装饰可见
- **WHEN** 玩家攀爬时
- **THEN** 山面可见随机散布的岩石和灌木
- **AND** 可见弯曲小径和蓝色溪流
