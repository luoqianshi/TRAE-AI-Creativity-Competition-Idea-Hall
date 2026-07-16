# 修复 3D 场景 CDN 加载 规范

## Why
Three.js r150+ 移除了 `examples/js/` 目录（非模块版本），导致 OrbitControls 的 CDN 链接返回 404，3D 场景初始化时抛出 TypeError，山峰和人物均不渲染。

## What Changes
- 将 Three.js CDN 版本从 0.150.0 降级到 0.128.0（该版本同时保留 `build/three.min.js` 和 `examples/js/controls/OrbitControls.js`）
- `index.html` 中两行 CDN script 标签的版本号修改

## Impact
- Affected specs: mountain-climb-3d-view（修复运行时错误）
- Affected code: index.html（CDN URL 版本号）

## MODIFIED Requirements

### Requirement: 3D 场景初始化
系统 SHALL 成功加载 Three.js 核心库和 OrbitControls 插件，并正确渲染 3D 山峰场景和攀爬人物。

#### Scenario: CDN 加载成功
- **WHEN** 页面加载完成
- **THEN** `THREE.OrbitControls` 全局对象可用
- **AND** 3D 场景正常渲染山峰、地面、人物
