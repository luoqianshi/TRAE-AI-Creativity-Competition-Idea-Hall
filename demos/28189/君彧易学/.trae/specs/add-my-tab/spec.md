# 添加"我的"导航栏 Spec

## Why

当前小程序底部只有示例导航项，用户需要一个"我的"导航入口，以便访问个人中心或相关功能。

## What Changes

* 在 app.json 的 tabBar 配置中添加"我的"导航项

* 创建 pages/my/index 页面作为"我的"页面

* 添加对应的图标资源

* 配置 tabBar 样式（选中态颜色等）

## Impact

* Affected specs: tabBar 导航系统

* Affected code: app.json, pages/my/*, images/icons/my-*

## ADDED Requirements

### Requirement: 底部导航栏支持"我的" Tab

系统 SHALL 提供包含"我的"选项的底部导航栏。

#### Scenario: 用户点击"我的" Tab

* **WHEN** 用户点击底部导航栏的"我的"图标

* **THEN** 导航至"我的"页面，并高亮当前 Tab

#### Scenario: 用户点击其他 Tab

* **WHEN** 用户点击底部导航栏的其他图标（如"示例"）

* **THEN** 导航至对应页面，并高亮当前 Tab

### Requirement: "我的"页面基础结构

系统 SHALL 提供"我的"页面的基础框架。

#### Scenario: 页面展示

* **WHEN** 用户进入"我的"页面

* **THEN** 显示页面标题"我的"及占位内容

## MODIFIED Requirements

### Requirement: app.json tabBar 配置

* 添加 tabBar 字段配置底部导航栏

* 包含"示例"和"我的"两个导航项

* 设置合适的选中态颜色和默认图标

