# UI模块初始化文件
import pygame
from typing import Dict, List, Tuple, Optional, Any, Union

# 从组件导入
from .components import Button, Slider, ScrollBar

# 从面板导入
from .panels import InfoPanel, StatsPanel, SettingsPanel, EigenvaluePanel

# 从渲染器导入
from .renderer import Renderer

# 从字体工具导入
from .fonts import (
    get_chinese_font,
    clear_font_cache,
    get_current_font_info,
    preload_font_sizes,
    register_additional_fonts
)

# 导出列表
__all__: List[str] = [
    # 组件
    'Button',
    'Slider',
    'ScrollBar',
    # 面板
    'InfoPanel',
    'StatsPanel',
    'SettingsPanel',
    'EigenvaluePanel',
    # 渲染器
    'Renderer',
    # 字体工具
    'get_chinese_font',
    'clear_font_cache',
    'get_current_font_info',
    'preload_font_sizes',
    'register_additional_fonts',
]

# 版本信息
__version__ = "1.0.0"

# 模块描述
__description__ = "生态系统模拟UI模块，提供组件、面板和渲染功能"

# 快速访问常用功能的辅助函数
def create_ui_manager(screen: Optional[pygame.Surface] = None) -> Dict[str, Any]:
    """
    创建一个简单的UI管理器，包含常用的UI组件和面板
    
    Args:
        screen: pygame屏幕表面，如果为None则只创建面板和组件，不创建渲染器
        
    Returns:
        Dict: 包含UI组件、面板和可能的渲染器的字典
    """
    # 创建渲染器（如果提供了屏幕）
    renderer = Renderer(screen) if screen else None
    
    # 创建面板
    stats_panel = StatsPanel()
    info_panel = InfoPanel()
    eigenvalue_panel = EigenvaluePanel()
    
    # 创建组件列表
    components = []
    panels = [stats_panel, info_panel]
    
    return {
        'renderer': renderer,
        'stats_panel': stats_panel,
        'info_panel': info_panel,
        'eigenvalue_panel': eigenvalue_panel,
        'components': components,
        'panels': panels
    }

# 预加载常用字体
def initialize_ui() -> None:
    """
    初始化UI模块，预加载字体等资源
    """
    # 预加载常用字体大小
    preload_font_sizes([10, 12, 14, 16, 18, 20, 24, 32])
    
    # 输出初始化信息
    font_name, sizes = get_current_font_info()
    if font_name:
        print(f"UI模块初始化完成，使用字体: {font_name}")
        print(f"预加载字体大小: {', '.join(map(str, sizes))}")
