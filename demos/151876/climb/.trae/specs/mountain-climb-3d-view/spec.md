# 3D 山体与玩家视图 规范

## Why
目前的爬山游戏仅有文字数字和进度条展示高度变化，缺少直观的视觉反馈。添加 Three.js 三维视图，让玩家看到一个立体的山峰和攀爬中的人物，增强沉浸感和趣味性。

## What Changes
- 在游戏页面新增 Three.js 3D 场景，展示圆锥形山峰和攀爬人物模型
- 玩家高度变化实时映射到 3D 人物在山体上的位置
- 攀爬/滑落时 3D 人物有对应动画
- 3D 场景与现有 UI 面板共存，不破坏原有功能
- 使用 CDN 加载 Three.js，无需本地构建

## Impact
- Affected specs: mountain-climb-game（新增 3D 视图模块）
- Affected code: index.html（新增 3D 容器）、style.css（3D 容器样式）、新增 game3d.js（Three.js 3D 逻辑）

## ADDED Requirements

### Requirement: 3D 山体场景
系统 SHALL 在游戏界面中渲染一个三维山体场景，展示圆锥形山峰、天空背景和地面。

#### Scenario: 场景初始化
- **WHEN** 游戏页面加载完成
- **THEN** 3D 场景渲染一座圆锥形山峰（3000 米对应 30 个单位高度）、蓝白渐变背景、绿色地面

#### Scenario: 山峰外观
- **WHEN** 场景渲染
- **THEN** 山峰底部为绿色/棕色（树林），中部为灰色岩石，顶部为白色雪顶

### Requirement: 3D 玩家人物
系统 SHALL 在 3D 场景中展示一个攀爬者人物，位置随高度实时变化。

#### Scenario: 人物位置映射
- **WHEN** 玩家高度为 H 米（0-3000）
- **THEN** 3D 人物位于山体侧面，高度 = H / 3000 × 山峰高度，紧贴山体表面

#### Scenario: 人物外观
- **WHEN** 场景渲染
- **THEN** 人物由简单几何体组成（球体头 + 圆柱身体 + 四肢），有鲜艳颜色便于识别

### Requirement: 攀爬动画
系统 SHALL 在玩家攀爬时展示 3D 人物的攀爬动作动画。

#### Scenario: 攀爬动作
- **WHEN** 玩家点击攀爬
- **THEN** 人物手臂和腿部交替摆动（模拟攀爬动作），持续 0.35 秒

#### Scenario: 滑落动画
- **WHEN** 玩家能量耗尽滑落
- **THEN** 人物沿山体表面快速下滑至山脚，伴随旋转动画

### Requirement: 3D 与 UI 共存
系统 SHALL 确保 3D 场景与现有游戏 UI 面板共存，不互相遮挡。

#### Scenario: 布局
- **WHEN** 页面渲染
- **THEN** 桌面端：左侧 3D 场景占 55% 宽度，右侧 UI 面板占 45%
- 移动端：3D 场景在顶部占 40% 高度，UI 面板在下方
- 3D 场景可响应窗口大小变化

### Requirement: 场景交互
系统 SHALL 支持用户旋转/缩放 3D 场景视角。

#### Scenario: 视角旋转
- **WHEN** 用户在 3D 场景区域拖拽鼠标/手指
- **THEN** 摄像机围绕山峰旋转

#### Scenario: 视角缩放
- **WHEN** 用户滚动鼠标滚轮/双指缩放
- **THEN** 摄像机拉近/拉远
