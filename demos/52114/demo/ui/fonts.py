import pygame
import sys
import os
from typing import Dict, List, Optional, Tuple

# 字体缓存
_font_cache: Dict[int, pygame.font.Font] = {}

# 指定的中文字体文件路径
_SPECIFIED_FONT_PATH = "/Users/martiansui/Library/Fonts/PingFang-SC-Light-2.otf"

# 中文字体列表（优先级排序）
_chinese_font_candidates: List[str] = [
    "SimHei",  # 黑体
    "WenQuanYi Micro Hei",  # 文泉驿微米黑
    "Heiti TC",  # 黑体-简
    "NSimSun",  # 新宋体
    "Arial Unicode MS",  # 备用字体
    pygame.font.get_default_font()  # 系统默认字体
]

# 当前成功加载的字体名称
_current_font_name: Optional[str] = None


def get_chinese_font(size: int) -> pygame.font.Font:
    """
    获取中文字体
    
    Args:
        size: 字体大小
        
    Returns:
        pygame.font.Font对象
    """
    # 在函数开头声明全局变量
    global _current_font_name
    
    # 检查缓存
    if size in _font_cache:
        return _font_cache[size]
    
    # 首先尝试加载指定的字体文件
    try:
        if os.path.exists(_SPECIFIED_FONT_PATH):
            font = pygame.font.Font(_SPECIFIED_FONT_PATH, size)
            # 测试字体是否能正确渲染中文
            if _test_font_supports_chinese(font):
                _font_cache[size] = font
                _current_font_name = os.path.basename(_SPECIFIED_FONT_PATH).split('.')[0]
                return font
    except (pygame.error, OSError):
        # 指定字体加载失败，继续尝试其他字体
        pass
    
    # 尝试加载中文字体
    font = None
    for font_name in _chinese_font_candidates:
        try:
            # 测试字体是否能正确渲染中文
            font = pygame.font.SysFont(font_name, size)
            if _test_font_supports_chinese(font):
                _font_cache[size] = font
                _current_font_name = font_name
                return font
        except (pygame.error, OSError):
            # 字体加载失败，尝试下一个
            continue
    
    # 如果所有字体都失败，使用默认字体
    try:
        if not font:
            font = pygame.font.Font(None, size)
        _font_cache[size] = font
        
        # 在非中文系统上可能会遇到问题，显示警告
        if _current_font_name is None:
            print("警告: 无法找到合适的中文字体，可能会导致中文显示异常。")
        
        return font
    except Exception as e:
        print(f"严重错误: 无法加载任何字体 - {e}")
        # 创建一个空白字体作为最后的后备
        return pygame.font.SysFont(None, size) if pygame.font.get_init() else None


def _test_font_supports_chinese(font: pygame.font.Font) -> bool:
    """
    测试字体是否支持中文显示
    
    Args:
        font: 要测试的字体对象
        
    Returns:
        bool: 如果字体支持中文返回True
    """
    try:
        # 测试多个汉字以确保全面支持
        test_texts = ["测试", "中文显示", "生态系统", "生产者", "消费者"]
        
        for test_text in test_texts:
            # 渲染测试文本
            text_surface = font.render(test_text, True, (0, 0, 0))
            
            # 检查渲染结果是否有效
            if text_surface.get_width() <= 0 or text_surface.get_height() <= 0:
                return False
            
            # 检查是否有字符被渲染（宽度应明显大于单个字符宽度）
            avg_char_width = text_surface.get_width() / len(test_text)
            if avg_char_width < 5:  # 太窄，可能没有正确渲染
                return False
        
        return True
    except Exception:
        return False


def clear_font_cache() -> None:
    """
    清除字体缓存
    """
    global _font_cache
    _font_cache = {}


def get_current_font_info() -> Tuple[Optional[str], List[int]]:
    """
    获取当前字体信息
    
    Returns:
        Tuple: (字体名称, 已缓存的字体大小列表)
    """
    return _current_font_name, list(_font_cache.keys())


def preload_font_sizes(sizes: Optional[List[int]] = None) -> Dict[int, bool]:
    """
    预加载指定的字体大小
    
    Args:
        sizes: 要预加载的字体大小列表，如果为None则使用常用大小
        
    Returns:
        Dict: 预加载结果，键为字体大小，值为是否成功
    """
    if sizes is None:
        sizes = [12, 14, 16, 18, 24]  # 常用字体大小
    
    results: Dict[int, bool] = {}
    
    for size in sizes:
        try:
            get_chinese_font(size)
            results[size] = True
        except Exception:
            results[size] = False
    
    return results


def register_additional_fonts(font_paths: List[str]) -> Dict[str, bool]:
    """
    注册额外的字体文件
    
    Args:
        font_paths: 字体文件路径列表
        
    Returns:
        Dict: 注册结果，键为字体路径，值为是否成功
    """
    results: Dict[str, bool] = {}
    
    for font_path in font_paths:
        try:
            if os.path.exists(font_path):
                # 尝试加载字体文件
                font_name = os.path.basename(font_path).split('.')[0]
                # 将字体添加到候选列表的最前面
                _chinese_font_candidates.insert(0, font_name)
                # 清除缓存以使用新字体
                clear_font_cache()
                results[font_path] = True
            else:
                results[font_path] = False
        except Exception:
            results[font_path] = False
    
    return results


# 初始化时尝试预加载几种常用字体大小
def _preload_common_fonts() -> None:
    """
    预加载常用字体大小
    """
    preload_font_sizes()


# 自动预加载常用字体
if pygame.font.get_init():
    _preload_common_fonts()