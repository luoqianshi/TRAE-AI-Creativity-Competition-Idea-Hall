# 从constants.py导入所有常量
from .constants import *

# 从settings.py导入设置管理函数
from .settings import settings, load_config, save_config, get_setting, set_setting

# 导出列表
__all__ = [
    # 常量
    'GRID_SIZE', 'SCREEN_WIDTH', 'SCREEN_HEIGHT', 'CONTROL_PANEL_WIDTH',
    'SIMULATION_AREA_WIDTH', 'CURVE_AREA_HEIGHT', 'SIMULATION_AREA_HEIGHT',
    'WORLD_WIDTH', 'WORLD_HEIGHT', 'FPS', 'SIMULATION_SPEED',
    'INFO_PANEL_WIDTH', 'INFO_PANEL_HEIGHT', 'STATS_PANEL_WIDTH', 'STATS_PANEL_HEIGHT',
    'BACKGROUND_COLOR', 'GRID_COLOR', 'DEBUG', 'MIN_ZOOM', 'MAX_ZOOM', 'ZOOM_STEP',
    'WHITE', 'GREEN', 'BLUE', 'RED', 'BLACK', 'GRAY', 'LIGHT_GRAY', 'CURVE_BG', 'YELLOW', 'PANEL_BG',
    'MPL_GREEN', 'MPL_BLUE', 'MPL_RED', 'MPL_CURVE_BG',
    'DEBUG_GRID_COLOR', 'DEBUG_TARGET_LINE_COLOR', 'DEBUG_HERBIVORE_TARGET_COLOR', 'DEBUG_CARNIVORE_TARGET_COLOR',
    # 设置管理
    'settings', 'load_config', 'save_config', 'get_setting', 'set_setting'
]