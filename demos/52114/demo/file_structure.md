# 项目文件结构树（版本 0.2）

/Users/martiansui/Downloads/moni/0.2/
├── code_structure.txt  # 项目结构概览（版本 0.2）
├── config.json  # 项目配置文件，存储各类生物和系统设置
├── module_dependencies.md  # 模块依赖分析文档
├── module_dependency_diagram.md  # ASCII格式模块依赖图
├── module_dependency_graph.md  # 模块依赖关系图
├── file_structure.md  # 项目文件结构树（本文件）
├── main.py  # 模块：游戏主入口；函数：main()；关键变量：pygame、screen、simulation、renderer；功能：初始化游戏、创建核心组件、启动主循环
├── .trae/
│   └── documents/
│       └── 重构到版本 0.4（全面优化与结构整理）.md
├── config/  # 配置模块
│   ├── __init__.py  # 配置模块导出文件
│   ├── constants.py  # 核心需求：提供全局常量；关键变量：GRID_SIZE、SCREEN_WIDTH、SCREEN_HEIGHT、WORLD_WIDTH、WORLD_HEIGHT、颜色定义
│   └── settings.py  # 模块：配置管理系统；函数：get_setting()、set_setting()、load_config()、save_config()；关键变量：settings、_config_listeners；功能：配置加载、保存、动态更新和变更通知
├── core/  # 核心游戏逻辑模块
│   ├── __init__.py  # 核心模块导出文件
│   ├── event_handler.py  # 模块：事件处理系统；类：EventHandler；方法：handle_events()、register_component()；关键变量：components、selected_organism；功能：处理鼠标/键盘事件、管理UI组件、生物体选择交互
│   ├── game_loop.py  # 模块：游戏主循环；类：GameLoop；方法：_main_loop()、register_update()、register_render()、toggle_pause()；关键变量：update_callbacks、render_callbacks、current_time、delta_time；功能：帧率控制、暂停/恢复、速度调节、组件通信
│   └── simulation.py  # 模块：生态系统模拟；类：Simulation；方法：update()、add_organism()、remove_organism()；关键变量：producers、herbivores、carnivores、population_history；功能：管理生物体生命周期、生态系统交互
├── organisms/  # 生物体实现模块
│   ├── __init__.py  # 生物体模块导出文件
│   ├── base_organism.py  # 模块：生物体基类；类：BaseOrganism、Animal；关键变量：energy、max_energy、age；方法：gain_energy()、consume_energy()、update()；功能：定义共同属性和生命周期方法
│   ├── carnivore.py  # 模块：肉食动物；类：Carnivore；方法：move()、eat()、reproduce()、can_reproduce()；关键变量：children、age、detected_food；功能：猎食行为、繁殖机制、移动决策
│   ├── herbivore.py  # 模块：草食动物；类：Herbivore；方法：move()、eat()、reproduce()、set_danger_detection()；关键变量：eigenvalue_vision、detected_danger、children；功能：觅食行为、危险逃避、繁殖机制
│   └── producer.py  # 模块：生产者（植物）；类：Producer；方法：update()、can_reproduce()、reproduce()；关键变量：energy、max_energy、age；功能：能量增长、繁殖机制、生长状态
├── pathfinding/  # 寻路与移动模块
│   ├── __init__.py  # 路径查找模块导出文件
│   ├── collision.py  # 核心需求：处理生物体碰撞；函数：calculate_distance()、check_collision()、process_ecosystem_collisions()；功能：碰撞检测与处理
│   ├── detection.py  # 核心需求：目标与危险检测；函数：find_nearby_targets()、find_nearby_dangers()、decide_action_priority()；功能：生物体感知系统
│   └── movement.py  # 核心需求：移动方向计算；函数：get_move_direction_towards_target()、get_move_direction_away_from_danger()、move_towards_targets_or_random()；功能：移动决策与位置更新
├── ui/  # 用户界面模块
│   ├── __init__.py  # UI模块导出文件
│   ├── fonts.py  # 模块：字体管理；函数：get_font()；关键变量：fonts；功能：加载和缓存字体资源
│   ├── renderer.py  # 模块：渲染系统；类：Renderer；方法：render()、draw_grid()、draw_organism()；关键变量：text_cache；功能：绘制世界、生物体、UI元素
│   ├── components/  # UI基础组件
│   │   ├── __init__.py  # 组件模块导出文件
│   │   ├── button.py  # 模块：按钮组件；类：Button；方法：handle_event()、draw()；关键变量：callback、hovered、pressed；功能：交互响应与状态管理
│   │   ├── scrollbar.py  # 模块：滚动条组件；类：Scrollbar；方法：handle_event()、draw()；功能：内容滚动控制
│   │   └── slider.py  # 模块：滑块组件；类：Slider；方法：handle_event()、draw()；关键变量：value、min_value、max_value；功能：数值参数调节
│   └── panels/  # UI面板组件
│       ├── __init__.py  # 面板模块导出文件
│       ├── eigenvalue_panel.py  # 模块：特征值面板；类：EigenvaluePanel；功能：显示生物体行为特性
│       ├── info_panel.py  # 模块：信息面板；类：InfoPanel；方法：update()、draw()；关键变量：organism；功能：显示选中生物体详情
│       ├── settings_panel.py  # 模块：设置面板；类：SettingsPanel；方法：update_settings()；功能：游戏参数调节
│       └── stats_panel.py  # 模块：统计面板；类：StatsPanel；方法：update()、draw()；关键变量：simulation；功能：显示生态系统数据和种群数量图表
└── utils/  # 工具函数库
    ├── __init__.py  # 工具模块导出文件
    ├── coordinate.py  # 模块：坐标转换；函数：scale_point()、unscale_point()、clamp_offset()；功能：世界坐标与屏幕坐标互转、边界限制
    ├── data.py  # 模块：数据管理；函数：add_point()、get_data()；功能：曲线数据处理和统计数据管理
    ├── debug.py  # 模块：调试工具；函数：draw_debug_info()、get_debug_mode()；功能：调试信息可视化和调试模式控制
    └── perf.py  # 模块：性能监控；函数：start_timer()、stop_timer()、get_fps()；功能：帧率统计和资源使用监控

## 核心模块说明

### core模块
- **game_loop.py**: 实现GameLoop类，提供游戏主循环控制功能，包括帧率管理、暂停/恢复、速度调节和回调函数系统，支持组件间通信和性能监控。
- **simulation.py**: 实现Simulation类，管理生态系统中所有生物体的创建、更新和删除，包含生产者、草食动物和肉食动物的生命周期管理。
- **event_handler.py**: 实现EventHandler类，处理用户输入（鼠标点击、键盘操作）和UI事件，管理生物体选择、缩放、拖动等交互功能。

### organisms模块
- **base_organism.py**: 定义BaseOrganism基类，实现位置管理、动画系统和配置监听，以及共同的能量获取、消耗和繁殖基础方法。
- **producer.py**: 实现Producer类，表示生产者（植物），具有能量获取、消耗、繁殖和生长逻辑。
- **herbivore.py**: 实现Herbivore类，表示草食动物，具有觅食、逃避危险、繁殖和移动行为，包含视力特征值等个体特性。
- **carnivore.py**: 实现Carnivore类，表示肉食动物，具有猎食草食动物、繁殖和移动行为。

### pathfinding模块
- 提供目标检测、危险感知、移动方向计算和碰撞处理等功能，支持生物体在生态系统中的智能移动和交互。

### config模块
- **constants.py**: 定义游戏常量，包括网格大小、屏幕尺寸、颜色定义等静态配置。
- **settings.py**: 实现配置管理系统，支持配置文件加载和保存，动态设置更新和配置变更通知机制。

### ui模块
- **renderer.py**: 实现Renderer类，负责绘制网格、生物体、感知范围和UI组件，管理文本缓存和统计渲染。
- **panels/**: 包含各类信息面板，显示生物体详情、种群统计、设置选项和行为特征值等信息。
- **components/**: 提供基础UI组件，如按钮、滑块和滚动条等，构建交互界面元素。

### utils模块
- 提供坐标转换、数据管理、调试输出和性能监控等工具函数，支持游戏核心功能实现。

## 主要交互流程
1. **初始化流程**: main.py加载配置，初始化pygame，创建Simulation、Renderer、GameLoop和EventHandler等核心组件
2. **游戏循环**: GameLoop控制帧更新，依次调用注册的更新和渲染回调
3. **事件处理**: EventHandler处理用户输入，更新游戏状态和UI交互
4. **生态模拟**: Simulation管理生物体更新，包括能量变化、移动、进食和繁殖等行为
5. **渲染流程**: Renderer根据游戏状态绘制世界和生物体，按层级渲染不同类型的生物体
