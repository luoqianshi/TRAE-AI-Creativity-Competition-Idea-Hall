import os
import json
from .constants import GRID_SIZE
from typing import List, Callable, Any

# 配置文件路径
CONFIG_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config.json')

# 全局配置变量，使用organism_settings作为顶层结构
settings = {'organism_settings': {}}

# 配置更新监听器列表
_config_listeners: List[Callable[[str, str, Any], None]] = []

# 默认配置结构
def get_default_settings():
    """返回默认的生物和系统配置"""
    return {
        "producer": {
            "initial_energy": 10,
            "max_energy": 200,
            "base_size_factor": 1.0,
            "size_variation_range": 0.3,
            "energy_increase_rate": 0.5,
            "initial_count": 50,  # 植物初始数量
            "regeneration_probability": 10,  # 植物再生概率(%)
            "adjacent_reproduction_probability": 70,  # 植物相邻繁殖概率(%)
            "reproduction_interval": 5  # 植物繁殖间隔（帧）
        },
        "herbivore": {
            "default_initial_energy": 200,
            "initial_energy": 500,
            "max_energy": 1000,
            "base_radius_factor": 1.2,
            "radius_variation_range": 0.3,
            "move_interval": 10,
            "food_detection_distance": 20,
            "danger_detection_distance": 15,
            "follow_probability": 70,
            "follow_distance": 30,  # 跟踪距离
            "escape_probability": 80,
            "energy_from_food": 50,
            "base_energy_consumption": 0.03,  # 基础能量消耗（每帧）
            "frequency_based_energy_cost": 2,  # 频率相关的能量消耗（移动后）
            "energy_per_move": 2,
            "initial_count": 10,  # 草食动物初始数量
            "reproduction_probability": 3  # 草食动物繁殖概率(%)
        },
        "carnivore": {
            "default_initial_energy": 200,
            "initial_energy": 800,
            "max_energy": 1500,
            "base_radius_factor": 1.5,
            "radius_variation_range": 0.3,
            "move_interval": 8,
            "follow_distance": 25,
            "follow_probability": 80,
            "energy_from_food": 80,
            "base_energy_consumption": 0.03,  # 基础能量消耗（每帧）
            "frequency_based_energy_cost": 3,  # 频率相关的能量消耗（移动后）
            "energy_per_move": 3,
            "initial_count": 3,  # 肉食动物初始数量
            "reproduction_probability": 3  # 肉食动物繁殖概率(%)
        },
        "movement": {
            "min_move_interval": 1,
            "max_move_interval": 20,
            "min_reproduction_interval": 1,
            "max_reproduction_interval": 20,
            "environment_update_speed": 60  # 环境更新速度(FPS)
        },
        "reproduction": {
            "after_eat_probability": 0.1  # 进食后繁殖概率(0.1 = 10%)
        }
    }

def save_config(config=None):
    """将配置保存到config.json文件"""
    global settings
    
    # 如果提供了配置，使用它，否则使用当前配置
    config_to_save = config or settings
    
    # 尝试保存配置
    try:
        # 确保目录存在
        os.makedirs(os.path.dirname(CONFIG_FILE_PATH), exist_ok=True)
        
        # 保存配置到文件，确保使用正确的结构格式
        with open(CONFIG_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(config_to_save, f, indent=2, ensure_ascii=False)
            
        print(f"配置已成功保存到: {CONFIG_FILE_PATH}")
        return True
    except Exception as e:
        print(f"保存配置失败: {e}")
        return False

def load_config():
    """从config.json文件加载配置，如果失败则使用默认配置"""
    global settings
    
    # 获取默认配置
    default_settings = get_default_settings()
    
    # 尝试从文件加载配置
    try:
        if os.path.exists(CONFIG_FILE_PATH):
            with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as f:
                loaded_settings = json.load(f)
                # 检查是否有organism_settings外层
                if isinstance(loaded_settings, dict):
                    if 'organism_settings' in loaded_settings and isinstance(loaded_settings['organism_settings'], dict):
                        # 使用organism_settings内的配置
                        settings = {'organism_settings': loaded_settings['organism_settings']}
                    else:
                        # 直接使用加载的配置
                        settings = loaded_settings
                    print(f"配置已成功从: {CONFIG_FILE_PATH} 加载")
                else:
                    settings = {'organism_settings': default_settings}
                    print("加载的配置格式不正确，使用默认配置")
        else:
            # 如果配置文件不存在，使用默认配置并创建配置文件
            settings = {'organism_settings': default_settings}
            save_config(settings)
            print(f"配置文件不存在，已创建默认配置: {CONFIG_FILE_PATH}")
            
        return settings
    except Exception as e:
        print(f"加载配置失败: {e}")
        # 如果加载失败，使用默认配置
        settings = {'organism_settings': default_settings}
        return settings

def get_setting(category, key, default=None):
    """获取特定配置值，支持嵌套查找"""
    # 优先检查organism_settings中的配置
    if 'organism_settings' in settings and category in settings['organism_settings']:
        return settings['organism_settings'][category].get(key, default)
    # 也支持直接查找顶层配置
    if category in settings:
        return settings[category].get(key, default)
    return default

def set_setting(category, key, value):
    """
    设置指定类别的配置项
    
    Args:
        category: 配置类别（如'producer', 'herbivore'等）
        key: 配置键
        value: 配置值
    """
    # 确保使用organism_settings结构
    if 'organism_settings' not in settings:
        settings['organism_settings'] = {}
    if category not in settings['organism_settings']:
        settings['organism_settings'][category] = {}
    old_value = settings['organism_settings'][category].get(key)
    settings['organism_settings'][category][key] = value
    
    # 通知所有监听器配置已更新
    notify_config_updated(category, key, value)

def add_config_listener(listener: Callable[[str, str, Any], None]) -> None:
    """
    添加配置更新监听器
    
    Args:
        listener: 当配置更新时调用的回调函数，接收(category, key, new_value)参数
    """
    if listener not in _config_listeners:
        _config_listeners.append(listener)

def remove_config_listener(listener: Callable[[str, str, Any], None]) -> None:
    """
    移除配置更新监听器
    
    Args:
        listener: 要移除的监听器函数
    """
    if listener in _config_listeners:
        _config_listeners.remove(listener)

def notify_config_updated(category: str, key: str, new_value: Any) -> None:
    """
    通知所有监听器配置已更新
    
    Args:
        category: 配置类别
        key: 配置键
        new_value: 新的配置值
    """
    for listener in _config_listeners:
        try:
            listener(category, key, new_value)
        except Exception as e:
            print(f"配置更新通知失败: {e}")

# 初始化加载配置
load_config()
