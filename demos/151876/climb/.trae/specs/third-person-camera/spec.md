# 第三人称摄像机跟随 规范

## Why
当前摄像机是固定全景视角（OrbitControls 围绕山峰中心），攀爬时看不出玩家人物。改为第三人称跟随视角，摄像机始终在玩家身后，增强代入感。

## What Changes
- 移除 OrbitControls，摄像机自动跟随玩家
- 摄像机位于玩家身后上方（向外偏移 + 抬高），平滑跟随
- 摄像机始终注视玩家位置
- 鼠标滚轮可调整摄像机距离

## Impact
- Affected specs: mountain-climb-3d-view（摄像机控制变更）
- Affected code: game3d.js（摄像机逻辑重写）

## MODIFIED Requirements

### Requirement: 第三人称摄像机
系统 SHALL 让摄像机始终位于玩家身后上方，平滑跟随玩家移动。

#### Scenario: 摄像机跟随
- **WHEN** 玩家高度变化（攀爬/滑落）
- **THEN** 摄像机平滑移动到玩家身后上方位置
- **AND** 摄像机始终注视玩家

#### Scenario: 滚轮调距
- **WHEN** 用户滚动鼠标滚轮
- **THEN** 摄像机与玩家的距离在 8~20 单位之间缩放
