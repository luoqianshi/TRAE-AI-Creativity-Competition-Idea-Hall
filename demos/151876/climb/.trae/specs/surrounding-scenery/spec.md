# 山周风景 规范

## Why
当前 3D 场景只有主山峰、地面和树木，缺少远景。攀爬时视野空旷，没有"在高山上眺望四周"的感觉。需要在山地周围添加低多边形风景元素。

## What Changes
- 在场景远处添加低多边形远山/Hills（不同颜色层次）
- 在地面远处添加蓝色湖泊/水域平面
- 添加 3D 方块云朵漂浮在不同高度
- 将树木散布范围扩大到远景区域
- 保持 Roblox 低多边形卡通风格

## Impact
- Affected specs: roblox-style, mountain-climb-3d-view
- Affected code: game3d.js（场景元素添加）

## ADDED Requirements

### Requirement: 远山地平线
系统 SHALL 在主山峰周围渲染 3~5 座低多边形远山，分布在 30-50 单位半径外，高度 5-15 单位，颜色从近到远由深绿到浅蓝渐变。

#### Scenario: 场景加载
- **WHEN** 3D 场景初始化
- **THEN** 远处可见多座低多边形山丘环绕主山峰
- **AND** 颜色与 Roblox 卡通风格一致

### Requirement: 湖泊
系统 SHALL 在地面远处（约 25-30 单位外）放置一个蓝色半透明湖泊平面。

#### Scenario: 场景加载
- **WHEN** 3D 场景初始化
- **THEN** 远处可见蓝色湖泊

### Requirement: 3D 云朵
系统 SHALL 在场景中生成 8~12 个白色方块云朵，漂浮在高度 20~40 单位之间，随机大小和位置。

#### Scenario: 云朵漂浮
- **WHEN** 渲染循环运行
- **THEN** 云朵缓慢水平漂移，营造天空氛围

### Requirement: 远景树木
系统 SHALL 将树木散布范围从原本的 12~28 单位半径扩大到 12~40 单位，增加远景植被密度。
