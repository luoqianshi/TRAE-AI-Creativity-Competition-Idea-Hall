# 模块依赖关系图

## 详细依赖关系图

```
+-------------------+      +---------------------+      +---------------------+
|                   |      |                     |      |                     |
|     main.py       |──────▶     core/           |──────▶    organisms/      |
|                   |      |                     |      |                     |
+--------+----------+      +----------+----------+      +----------+----------+
         |                            |                           |
         |                            |                           |
         ▼                            ▼                           ▼
+--------+----------+      +----------+----------+      +----------+----------+
|                   |      |                     |      |                     |
|       ui/         |◀─────┤      utils/         |◀─────┤       config/       |
|                   |      |                     |      |                     |
+--------+----------+      +---------------------+      +---------------------+
         |
         |
         ▼
+---------------------+
|                     |
|    pathfinding/     |
|                     |
+---------------------+

# 详细依赖关系说明

# 1. 主程序 (main.py)
   ├── 核心逻辑 (core/)
   │   ├── simulation.py
   │   └── event_handler.py
   ├── 界面组件 (ui/)
   ├── 工具函数 (utils/)
   └── 配置常量 (config/)

# 2. 核心逻辑 (core/)
   ├── 生物体 (organisms/)
   ├── 工具函数 (utils/)
   │   ├── 坐标转换
   │   └── 调试工具
   └── 配置常量 (config/)

# 3. 生物体模块 (organisms/)
   ├── 基类: base_organism.py
   ├── 子类: producer.py, herbivore.py, carnivore.py
   ├── 配置常量 (config/)
   └── 路径查找 (pathfinding/)

# 4. 界面模块 (ui/)
   ├── 组件: components/ (Button, Slider, ScrollBar)
   ├── 面板: panels/ (InfoPanel, StatsPanel)
   ├── 工具函数 (utils/)
   │   ├── 坐标转换
   │   └── 数据管理
   └── 配置常量 (config/)

# 5. 工具模块 (utils/)
   ├── coordinate.py (坐标转换)
   ├── data.py (数据管理)
   ├── debug.py (调试工具)
   ├── perf.py (性能监控)
   └── 配置常量 (config/)

# 6. 路径查找 (pathfinding/)
   ├── detection.py
   └── 配置常量 (config/)

# 7. 配置模块 (config/)
   └── constants.py (被所有其他模块导入)
```