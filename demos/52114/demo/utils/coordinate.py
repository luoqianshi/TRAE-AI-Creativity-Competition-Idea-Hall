
from typing import Tuple, List, Union


def scale_point(point: Tuple[float, float], zoom: float, offset: Tuple[float, float]) -> Tuple[float, float]:
    """
    将世界坐标转换为屏幕坐标
    
    参数：
        point: 世界坐标点 (x, y)
        zoom: 缩放因子
        offset: 偏移量 (offset_x, offset_y)
    
    返回：
        转换后的屏幕坐标 (screen_x, screen_y)
    """
    x, y = point
    return (x - offset[0]) * zoom, (y - offset[1]) * zoom


def unscale_point(point: Tuple[float, float], zoom: float, offset: Tuple[float, float]) -> Tuple[float, float]:
    """
    将屏幕坐标转换为世界坐标
    
    参数：
        point: 屏幕坐标点 (screen_x, screen_y)
        zoom: 缩放因子
        offset: 偏移量 (offset_x, offset_y)
    
    返回：
        转换后的世界坐标 (world_x, world_y)
    """
    x, y = point
    return x / zoom + offset[0], y / zoom + offset[1]


def clamp_offset(offset: Tuple[float, float], world_width: float, world_height: float, 
                 screen_width: float, screen_height: float, zoom: float) -> Tuple[float, float]:
    """
    限制偏移量，确保视图不会滚动到世界边界之外
    
    参数：
        offset: 当前偏移量 (offset_x, offset_y)
        world_width: 世界宽度
        world_height: 世界高度
        screen_width: 屏幕宽度
        screen_height: 屏幕高度
        zoom: 缩放因子
    
    返回：
        限制后的偏移量
    """
    # 计算可见区域大小
    visible_width = screen_width / zoom
    visible_height = screen_height / zoom
    
    # 计算最小和最大偏移量
    min_offset_x = 0
    max_offset_x = max(0, world_width - visible_width)
    min_offset_y = 0
    max_offset_y = max(0, world_height - visible_height)
    
    # 限制偏移量
    clamped_x = max(min_offset_x, min(max_offset_x, offset[0]))
    clamped_y = max(min_offset_y, min(max_offset_y, offset[1]))
    
    return (clamped_x, clamped_y)


def clamp_position(x: float, y: float, world_width: float, world_height: float, 
                   grid_size: float = 1.0) -> Tuple[float, float]:
    """
    确保位置在世界边界内或实现无边界环绕
    
    参数：
        x: 世界坐标x
        y: 世界坐标y
        world_width: 世界宽度
        world_height: 世界高度
        grid_size: 网格大小，用于对齐
    
    返回：
        处理后的坐标 (x, y)
    """
    # 无边界模式 - 环绕效果
    x = x % world_width
    y = y % world_height
    
    # 如果需要网格对齐
    if grid_size > 0:
        x = round(x / grid_size) * grid_size
        y = round(y / grid_size) * grid_size
    
    return (x, y)


def calculate_distance(point1: Tuple[float, float], point2: Tuple[float, float]) -> float:
    """
    计算两点之间的欧几里得距离
    
    参数：
        point1: 第一个点 (x1, y1)
        point2: 第二个点 (x2, y2)
    
    返回：
        两点之间的距离
    """
    return ((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2) ** 0.5


def convert_to_grid_position(x: float, y: float, grid_size: float) -> Tuple[int, int]:
    """
    将世界坐标转换为网格坐标
    
    参数：
        x: 世界坐标x
        y: 世界坐标y
        grid_size: 网格大小
    
    返回：
        网格坐标 (grid_x, grid_y)
    """
    return (int(x // grid_size), int(y // grid_size))


def convert_to_world_position(grid_x: int, grid_y: int, grid_size: float) -> Tuple[float, float]:
    """
    将网格坐标转换为世界坐标（网格中心点）
    
    参数：
        grid_x: 网格坐标x
        grid_y: 网格坐标y
        grid_size: 网格大小
    
    返回：
        世界坐标 (x, y)
    """
    return (grid_x * grid_size + grid_size / 2, grid_y * grid_size + grid_size / 2)