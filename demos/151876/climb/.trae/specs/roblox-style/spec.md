# Roblox 风格视觉改造 规范

## Why
当前游戏风格偏写实（MeshStandardMaterial、暗色 UI、渐变背景），用户希望整体视觉风格对标 Roblox 的低多边形、明亮色彩、玩具质感。

## What Changes
- 3D 场景：材质从写实改为卡通风格（MeshToonMaterial），角色改为方块化几何体，色彩更鲜艳饱和
- UI 面板：明亮的色块、粗圆角边框、粗体文字、更多玩具感
- 整体氛围：从暗色渐变改为明亮活泼的配色

## Impact
- Affected specs: mountain-climb-3d-view（材质与模型变更）
- Affected code: game3d.js（材质/颜色/角色几何体重写）、style.css（UI 配色全面改造）

## MODIFIED Requirements

### Requirement: 3D 卡通风格场景
系统 SHALL 使用卡通渲染风格，山峰和地面使用鲜艳颜色和 MeshToonMaterial，呈现低多边形玩具质感。

#### Scenario: 卡通材质
- **WHEN** 场景渲染
- **THEN** 山峰、地面、树木均使用 MeshToonMaterial（替代 MeshStandardMaterial）
- **AND** 颜色明快饱和（亮绿草地、暖灰岩石、纯白雪顶）

#### Scenario: 方块化角色
- **WHEN** 场景渲染
- **THEN** 玩家角色身体和四肢使用 BoxGeometry（替代 CylinderGeometry）
- **AND** 头部保持球体但颜色更卡通（亮黄皮肤、大红上衣、亮蓝裤子）

#### Scenario: 明亮天空
- **WHEN** 场景初始化
- **THEN** 天空背景为亮蓝色（#B0E0FF），无雾气效果

### Requirement: Roblox 风格 UI
系统 SHALL 使用明亮色彩、粗圆角和粗体文字的 UI 风格。

#### Scenario: UI 配色
- **WHEN** 页面渲染
- **THEN** UI 面板背景为亮色半透明块，按钮使用鲜艳纯色渐变
- **AND** 文字加粗、字号加大，边框加粗
