import pygame
import time
import functools
from typing import Dict, List, Optional, Any, Callable, Union, Tuple
from datetime import datetime

from config.constants import DEBUG, GRID_SIZE, SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT

# 全局调试模式标志
_global_debug_mode = DEBUG

# 日志级别
LOG_LEVELS = {
    'DEBUG': 0,
    'INFO': 1,
    'WARNING': 2,
    'ERROR': 3,
    'CRITICAL': 4
}

# 默认日志级别
_current_log_level = LOG_LEVELS['DEBUG'] if _global_debug_mode else LOG_LEVELS['INFO']

def toggle_debug_mode() -> bool:
    """
    切换调试模式
    
    Returns:
        bool: 切换后的调试模式状态
    """
    global _global_debug_mode
    _global_debug_mode = not _global_debug_mode
    
    return _global_debug_mode

def set_debug_flag(flag_name: str, value: bool) -> None:
    """设置特定调试标志"""
    if flag_name in _debug_flags:
        _debug_flags[flag_name] = value

def get_debug_flag(flag_name: str) -> bool:
    """获取调试标志值"""
    return _debug_flags.get(flag_name, False)

def get_debug_mode() -> bool:
    """
    获取当前调试模式状态
    
    返回：
        当前调试模式状态
    """
    return _global_debug_mode

# 性能监控数据
_performance_data = {
    'function_times': {},
    'frame_times': [],
    'start_time': time.time()
}

# 调试标记
_debug_flags = {
    'draw_targets': True,
    'draw_dangers': True,
    'draw_safe_positions': True,
    'draw_pathfinding': False,
    'draw_vision_range': False,
    'draw_hitboxes': False
}


def set_log_level(level: str) -> None:
    """
    设置日志级别
    
    参数：
        level: 日志级别字符串 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    global _current_log_level
    if level in LOG_LEVELS:
        _current_log_level = LOG_LEVELS[level]


def log_debug(message: str) -> None:
    """
    调试日志输出
    
    参数：
        message: 日志消息
    """
    if LOG_LEVELS['DEBUG'] >= _current_log_level:
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        print(f"[DEBUG] [{timestamp}] {message}")


def log_info(message: str) -> None:
    """
    信息日志输出
    
    参数：
        message: 日志消息
    """
    if LOG_LEVELS['INFO'] >= _current_log_level:
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        print(f"[INFO] [{timestamp}] {message}")


def log_warning(message: str) -> None:
    """
    警告日志输出
    
    参数：
        message: 日志消息
    """
    if LOG_LEVELS['WARNING'] >= _current_log_level:
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        print(f"[WARNING] [{timestamp}] {message}")


def log_error(message: str) -> None:
    """
    错误日志输出
    
    参数：
        message: 日志消息
    """
    if LOG_LEVELS['ERROR'] >= _current_log_level:
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        print(f"[ERROR] [{timestamp}] {message}")


def log_critical(message: str) -> None:
    """
    严重错误日志输出
    
    参数：
        message: 日志消息
    """
    if LOG_LEVELS['CRITICAL'] >= _current_log_level:
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        print(f"[CRITICAL] [{timestamp}] {message}")


def find_boundary_intersection(start: Tuple[float, float], end: Tuple[float, float], world_width: float, world_height: float) -> Tuple[Tuple[float, float], Tuple[float, float]]:
    """
    查找线段与世界边界的交点，并返回连接的两个端点
    
    参数：
        start: 起始点坐标
        end: 目标点坐标
        world_width: 世界宽度（像素）
        world_height: 世界高度（像素）
    
    返回：
        调整后的两个端点坐标
    """
    # 直接使用世界尺寸像素值
    world_width_pixels = world_width
    world_height_pixels = world_height
    
    # 计算两点之间的直线距离
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    
    # 计算最短路径方向（考虑环绕世界）
    # 对于宽度方向
    if abs(dx) > world_width_pixels / 2:
        # 如果直接距离超过世界宽度的一半，考虑环绕路径
        # 确定哪一侧更近
        if dx > 0:
            # 从右侧环绕
            adjusted_end_x = end[0] - world_width_pixels
        else:
            # 从左侧环绕
            adjusted_end_x = end[0] + world_width_pixels
        return (start, (adjusted_end_x, end[1]))
    
    # 对于高度方向
    if abs(dy) > world_height_pixels / 2:
        # 如果直接距离超过世界高度的一半，考虑环绕路径
        if dy > 0:
            # 从底部环绕
            adjusted_end_y = end[1] - world_height_pixels
        else:
            # 从顶部环绕
            adjusted_end_y = end[1] + world_height_pixels
        return (start, (end[0], adjusted_end_y))
    
    # 如果不需要环绕，直接返回原始点
    return (start, end)

def draw_debug_info(screen: pygame.Surface, organism: Any, font: pygame.font.Font, zoom: float = 1.0, offset: Tuple[float, float] = (0, 0)) -> None:
    """
    绘制调试信息，显示目标和危险
    
    参数：
        screen: Pygame屏幕
        organism: 生物体对象
        font: 字体对象
        zoom: 缩放比例
        offset: 偏移量 (x, y)
    """
    from utils import scale_point
    
    if not get_debug_mode():
        return
    
    # 绘制目标连接线
    if _debug_flags['draw_targets'] and hasattr(organism, 'target') and organism.target:
        try:
            # 使用绘制位置而非瞬时网格位置
            ox, oy = (organism.get_draw_position() if hasattr(organism, 'get_draw_position') else (organism.x, organism.y))
            tx, ty = (organism.target.get_draw_position() if hasattr(organism.target, 'get_draw_position') else (organism.target.x, organism.target.y))
            
            # 计算生物体中心坐标
            org_center = (ox + GRID_SIZE // 2, oy + GRID_SIZE // 2)
            target_center = (tx + GRID_SIZE // 2, ty + GRID_SIZE // 2)
            
            # 查找跨边界的连接点
            start_point, end_point = find_boundary_intersection(org_center, target_center, SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT)
            
            # 应用缩放和偏移
            org_screen_x, org_screen_y = scale_point(start_point, zoom, offset)
            target_screen_x, target_screen_y = scale_point(end_point, zoom, offset)
            
            # 使用更明显的颜色
            color = (0, 255, 0) if getattr(organism, 'organism_type', '').lower() == 'herbivore' else (100, 100, 255)
            
            # 增加线条宽度，确保可见性
            pygame.draw.line(screen, color,
                            (int(org_screen_x), int(org_screen_y)),
                            (int(target_screen_x), int(target_screen_y)),
                            3)
        except Exception as e:
            log_debug(f"绘制目标连线时出错: {e}")
    
    # 绘制危险连接线
    # 修改：危险连接线的显示也依赖于目标感知开关，确保目标感知关闭时不显示威胁感知连线
    if _debug_flags['draw_dangers'] and _debug_flags['draw_targets'] and hasattr(organism, 'danger') and organism.danger:
        try:
            ox, oy = (organism.get_draw_position() if hasattr(organism, 'get_draw_position') else (organism.x, organism.y))
            dx_, dy_ = (organism.danger.get_draw_position() if hasattr(organism.danger, 'get_draw_position') else (organism.danger.x, organism.danger.y))
            
            # 计算中心点
            org_center = (ox + GRID_SIZE // 2, oy + GRID_SIZE // 2)
            danger_center = (dx_ + GRID_SIZE // 2, dy_ + GRID_SIZE // 2)
            
            # 查找跨边界的连接点
            start_point, end_point = find_boundary_intersection(org_center, danger_center, SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT)
            
            # 应用缩放和偏移
            org_screen_x, org_screen_y = scale_point(start_point, zoom, offset)
            danger_screen_x, danger_screen_y = scale_point(end_point, zoom, offset)
            
            color = (255, 165, 0) if getattr(organism, 'organism_type', '').lower() == 'herbivore' else (255, 100, 100)
            pygame.draw.line(screen, color,
                            (int(org_screen_x - 1), int(org_screen_y - 1)),
                            (int(danger_screen_x - 1), int(danger_screen_y - 1)),
                            2)
        except Exception as e:
            log_debug(f"绘制危险连线时出错: {e}")
    
    # 绘制安全目标位置
    if _debug_flags['draw_safe_positions'] and hasattr(organism, 'safe_target_pos') and organism.safe_target_pos:
        pygame.draw.circle(screen, (0, 255, 0),
                          (int(organism.safe_target_pos[0] + GRID_SIZE // 2),
                           int(organism.safe_target_pos[1] + GRID_SIZE // 2)),
                          5, 2)
        # 显示"SAFE"文本
        safe_text = font.render("SAFE", True, (0, 255, 0))
        screen.blit(safe_text, (organism.safe_target_pos[0], organism.safe_target_pos[1] - 20))
    
    # 绘制视野范围
    if _debug_flags['draw_vision_range'] and hasattr(organism, 'vision_range'):
        pygame.draw.circle(screen, (100, 100, 255, 50),
                          (organism.x + GRID_SIZE // 2, organism.y + GRID_SIZE // 2),
                          organism.vision_range * GRID_SIZE, 1)
    
    # 绘制路径
    if _debug_flags['draw_pathfinding'] and hasattr(organism, 'path') and organism.path:
        for i in range(len(organism.path) - 1):
            start_x, start_y = organism.path[i]
            end_x, end_y = organism.path[i + 1]
            pygame.draw.line(screen, (255, 255, 0),
                           (start_x + GRID_SIZE // 2, start_y + GRID_SIZE // 2),
                           (end_x + GRID_SIZE // 2, end_y + GRID_SIZE // 2),
                           1)
    
    # 绘制碰撞框
    if _debug_flags['draw_hitboxes']:
        pygame.draw.rect(screen, (200, 80, 80),
                        (organism.x, organism.y, GRID_SIZE, GRID_SIZE), 1)
    
    # 绘制生物体状态信息
    if hasattr(organism, 'energy'):
        energy_text = font.render(f"{int(organism.energy)}", True, (120, 120, 120))
        screen.blit(energy_text, (organism.x, organism.y + GRID_SIZE - 10))
    
    if hasattr(organism, 'health'):
        health_text = font.render(f"{int(organism.health)}", True, (120, 120, 120))
        screen.blit(health_text, (organism.x, organism.y + GRID_SIZE - 10))


def draw_performance_stats(screen: pygame.Surface, font: pygame.font.Font, position: tuple = (10, 10)) -> None:
    """
    绘制性能统计信息
    
    参数：
        screen: Pygame屏幕
        font: 字体对象
        position: 绘制位置
    """
    if not get_debug_mode():
        return
    
    y_offset = 0
    
    # 计算FPS
    current_time = time.time()
    elapsed = current_time - _performance_data['start_time']
    
    if _performance_data['frame_times']:
        avg_frame_time = sum(_performance_data['frame_times']) / len(_performance_data['frame_times'])
        fps = 1.0 / avg_frame_time if avg_frame_time > 0 else 0
        fps_text = font.render(f"FPS: {fps:.1f}", True, (255, 255, 255))
        screen.blit(fps_text, (position[0], position[1] + y_offset))
        y_offset += 20
    
    # 显示运行时间
    run_time_text = font.render(f"Run Time: {elapsed:.1f}s", True, (255, 255, 255))
    screen.blit(run_time_text, (position[0], position[1] + y_offset))
    y_offset += 20
    
    # 显示函数执行时间统计
    if _performance_data['function_times']:
        y_offset += 10
        stats_header = font.render("Function Performance:", True, (255, 255, 255))
        screen.blit(stats_header, (position[0], position[1] + y_offset))
        y_offset += 20
        
        # 只显示最慢的5个函数
        sorted_functions = sorted(
            _performance_data['function_times'].items(),
            key=lambda x: x[1]['avg'],
            reverse=True
        )[:5]
        
        for func_name, stats in sorted_functions:
            func_text = font.render(f"{func_name}: {stats['avg']*1000:.2f}ms", True, (255, 255, 255))
            screen.blit(func_text, (position[0] + 10, position[1] + y_offset))
            y_offset += 15


def track_frame_time() -> None:
    """
    记录帧时间，用于计算FPS
    """
    current_time = time.time()
    
    # 保留最近100帧的时间
    if len(_performance_data['frame_times']) >= 100:
        _performance_data['frame_times'].pop(0)
    
    _performance_data['frame_times'].append(current_time - _performance_data.get('last_frame_time', current_time))
    _performance_data['last_frame_time'] = current_time


def profile_function(func: Callable) -> Callable:
    """
    函数性能分析装饰器
    
    参数：
        func: 要分析的函数
    
    返回：
        包装后的函数
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if not DEBUG:
            return func(*args, **kwargs)
        
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        # 更新性能数据
        func_name = func.__name__
        if func_name not in _performance_data['function_times']:
            _performance_data['function_times'][func_name] = {
                'total': 0.0,
                'count': 0,
                'avg': 0.0,
                'min': float('inf'),
                'max': 0.0
            }
        
        stats = _performance_data['function_times'][func_name]
        duration = end_time - start_time
        stats['total'] += duration
        stats['count'] += 1
        stats['avg'] = stats['total'] / stats['count']
        stats['min'] = min(stats['min'], duration)
        stats['max'] = max(stats['max'], duration)
        
        # 如果函数执行时间超过100ms，记录警告
        if duration > 0.1:
            log_warning(f"函数 {func_name} 执行时间过长: {duration*1000:.2f}ms")
        
        return result
    
    return wrapper


def draw_grid_debug(screen: pygame.Surface, grid_width: int, grid_height: int) -> None:
    """
    绘制网格调试信息
    
    参数：
        screen: Pygame屏幕
        grid_width: 网格宽度
        grid_height: 网格高度
    """
    if not get_debug_mode():
        return
    
    # 绘制网格线
    for x in range(0, grid_width * GRID_SIZE, GRID_SIZE):
        pygame.draw.line(screen, (50, 50, 50), (x, 0), (x, grid_height * GRID_SIZE))
    
    for y in range(0, grid_height * GRID_SIZE, GRID_SIZE):
        pygame.draw.line(screen, (50, 50, 50), (0, y), (grid_width * GRID_SIZE, y))


def clear_performance_data() -> None:
    """
    清除性能监控数据
    """
    _performance_data['function_times'] = {}
    _performance_data['frame_times'] = []
    _performance_data['start_time'] = time.time()