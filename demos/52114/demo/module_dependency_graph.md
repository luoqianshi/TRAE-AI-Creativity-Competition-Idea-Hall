# 生态系统模拟项目模块依赖图

## 整体架构概述

这个生态系统模拟项目由多个模块组成，每个模块负责特定功能，形成完整的模拟系统。以下是各模块之间的依赖关系图。

## 模块依赖关系表

| 模块 | 主要组件 | 依赖模块 | 功能说明 |
|------|---------|----------|----------|
| **core** | GameLoop, EventHandler, Simulation | config, organisms, pathfinding, utils | 核心控制逻辑，包含游戏循环、事件处理和模拟引擎 |
| **organisms** | BaseOrganism, Producer, Herbivore, Carnivore | config, pathfinding, utils | 生物体实现，包含生产者、草食动物和肉食动物 |
| **pathfinding** | movement, detection, collision | config | 路径查找和碰撞检测，包含移动、感知和碰撞处理 |
| **config** | constants, settings | - | 配置管理，提供常量和设置功能 |
| **utils** | 工具函数 | - | 通用工具函数集合 |
| **ui** | 界面组件 | - | 用户界面组件（待分析） |

## 详细依赖关系图（Mermaid格式）

```mermaid
graph TD
    subgraph 核心模块
        core_GameLoop["GameLoop (core)"]
        core_EventHandler["EventHandler (core)"]
        core_Simulation["Simulation (core)"]
    end

    subgraph 生物体模块
        org_BaseOrganism["BaseOrganism (organisms)"]
        org_Producer["Producer (organisms)"]
        org_Herbivore["Herbivore (organisms)"]
        org_Carnivore["Carnivore (organisms)"]
    end

    subgraph 路径查找模块
        path_movement["movement (pathfinding)"]
        path_detection["detection (pathfinding)"]
        path_collision["collision (pathfinding)"]
    end

    subgraph 配置和工具
        config["config"]
        utils["utils"]
    end

    subgraph 用户界面
        ui["ui"]
    end

    %% core模块依赖
    core_GameLoop --> core_EventHandler
    core_GameLoop --> core_Simulation
    core_GameLoop --> config
    core_GameLoop --> utils
    core_EventHandler --> config
    core_EventHandler --> utils
    core_EventHandler --> core_GameLoop
    core_EventHandler --> core_Simulation
    core_Simulation --> org_BaseOrganism
    core_Simulation --> org_Producer
    core_Simulation --> org_Herbivore
    core_Simulation --> org_Carnivore
    core_Simulation --> path_collision
    core_Simulation --> config
    core_Simulation --> utils

    %% organisms模块依赖
    org_Producer --> org_BaseOrganism
    org_Producer --> config
    org_Herbivore --> org_BaseOrganism
    org_Herbivore --> path_movement
    org_Herbivore --> path_detection
    org_Herbivore --> config
    org_Herbivore --> utils
    org_Carnivore --> org_BaseOrganism
    org_Carnivore --> path_movement
    org_Carnivore --> path_detection
    org_Carnivore --> config
    org_Carnivore --> utils
    org_BaseOrganism --> config

    %% pathfinding模块依赖
    path_movement --> config
    path_detection --> path_collision
    path_detection --> config
    path_collision --> config

    %% ui模块依赖（待分析）
    ui -.-> core_GameLoop
    ui -.-> core_EventHandler
    ui -.-> config

    %% 依赖方向说明
    classDef module fill:#f9f,stroke:#333,stroke-width:2px
    classDef submodule fill:#bbf,stroke:#333,stroke-width:1px
    
    class core_GameLoop,core_EventHandler,core_Simulation,org_BaseOrganism,org_Producer,org_Herbivore,org_Carnivore submodule
    class core,organisms,pathfinding,config,utils,ui module
```

## 继承关系图

```mermaid
graph TD
    org_BaseOrganism["BaseOrganism"]
    org_Producer["Producer"]
    org_Herbivore["Herbivore"]
    org_Carnivore["Carnivore"]
    org_Animal["Animal (内部类)"]
    
    org_Animal --> org_BaseOrganism
    org_Producer --> org_BaseOrganism
    org_Herbivore --> org_Animal
    org_Carnivore --> org_Animal
    
    classDef base fill:#f9f,stroke:#333,stroke-width:2px
    classDef child fill:#bbf,stroke:#333,stroke-width:1px
    
    class org_BaseOrganism base
    class org_Producer,org_Herbivore,org_Carnivore,org_Animal child
```

## 模块间调用关系说明

1. **core模块** 是系统的核心控制中心：
   - `GameLoop` 控制整个程序的运行循环
   - `EventHandler` 处理用户输入和UI事件
   - `Simulation` 管理所有生物体和生态系统逻辑

2. **organisms模块** 实现了生态系统中的各种生物：
   - `BaseOrganism` 提供所有生物共有的属性和方法
   - `Producer` 实现生产者（植物）的功能
   - `Herbivore` 实现草食动物的功能
   - `Carnivore` 实现肉食动物的功能

3. **pathfinding模块** 为生物体提供移动和感知功能：
   - `movement` 处理移动方向计算和新位置确定
   - `detection` 负责目标和危险的感知
   - `collision` 处理碰撞检测和捕食关系

4. **config模块** 为整个系统提供配置支持：
   - 提供常量定义
   - 管理系统设置

5. **utils模块** 提供通用工具函数：
   - 性能测量
   - 数学计算
   - 其他辅助功能

## 注意事项

- 此依赖图基于对代码的静态分析，可能不包含所有运行时依赖
- ui模块的依赖关系尚未完全分析，以虚线表示
- 某些内部依赖（如类之间的调用）未在图中完全显示

*最后更新时间：2023-XX-XX*