import random
from typing import Tuple, Optional, List, Dict, Any
from config.constants import SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT, GRID_SIZE
from config.settings import get_setting


def get_move_direction_towards_target(current_pos: Tuple[float, float], 
                                     target_pos: Tuple[float, float], 
                                     grid_size: int = GRID_SIZE, 
                                     max_width: int = SIMULATION_AREA_WIDTH, 
                                     max_height: int = SIMULATION_AREA_HEIGHT) -> str:
    """
    计算朝向目标的移动方向，支持跨边缘寻路（上下左右贯通）
    
    参数：
        current_pos: 当前位置 (x, y)
        target_pos: 目标位置 (x, y)
        grid_size: 网格大小
        max_width: 模拟区域宽度
        max_height: 模拟区域高度
    
    返回：
        移动方向 ('up', 'down', 'left', 'right', 'up_left', 'up_right', 'down_left', 'down_right', 'stay')
    """
    current_x, current_y = current_pos
    target_x, target_y = target_pos
    
    # 如果已经在目标位置，不移动
    if current_x == target_x and current_y == target_y:
        return 'stay'
    
    # 计算直接路径的距离
    direct_dx = target_x - current_x
    direct_dy = target_y - current_y
    
    # 计算跨左/右边缘的距离（考虑左右贯通）
    if direct_dx > 0:
        cross_dx_right = direct_dx - max_width  # 从右侧边缘穿
    else:
        cross_dx_right = direct_dx + max_width  # 从左侧边缘穿
    
    # 计算跨上/下边缘的距离（考虑上下贯通）
    if direct_dy > 0:
        cross_dy_down = direct_dy - max_height  # 从下边缘穿
    else:
        cross_dy_down = direct_dy + max_height  # 从上边缘穿
    
    # 确定在X方向上的最短路径（直接或跨边缘）
    dx = direct_dx
    if abs(cross_dx_right) < abs(dx):
        dx = cross_dx_right
    
    # 确定在Y方向上的最短路径（直接或跨边缘）
    dy = direct_dy
    if abs(cross_dy_down) < abs(dy):
        dy = cross_dy_down
    
    # 当两个方向都存在差异时，优先斜向移动
    if dx != 0 and dy != 0:
        horiz = 'right' if dx > 0 else 'left'
        vert = 'down' if dy > 0 else 'up'
        return f"{vert}_{horiz}"
    # 否则选择单轴方向
    if abs(dx) > abs(dy):
        return 'right' if dx > 0 else 'left'
    else:
        return 'down' if dy > 0 else 'up'


def get_random_move_direction() -> str:
    """
    获取随机移动方向
    
    返回：
        随机移动方向 ('up', 'down', 'left', 'right', 'up_left', 'up_right', 'down_left', 'down_right', 'stay')
    """
    return random.choice(['up', 'down', 'left', 'right', 'up_left', 'up_right', 'down_left', 'down_right', 'stay'])


def calculate_new_position(current_pos: Tuple[float, float], 
                          direction: str, 
                          grid_size: int = GRID_SIZE, 
                          max_width: int = SIMULATION_AREA_WIDTH, 
                          max_height: int = SIMULATION_AREA_HEIGHT) -> Tuple[float, float]:
    """
    根据方向计算新位置，实现无边界模式（左右互通、上下互通）
    
    参数：
        current_pos: 当前位置 (x, y)
        direction: 移动方向
        grid_size: 网格大小
        max_width: 最大宽度
        max_height: 最大高度
    
    返回：
        新位置 (x, y)
    """
    x, y = current_pos
    
    if direction == 'up':
        y = y - grid_size
        # 无边界模式：上边界和下边界互通
        if y < 0:
            y = max_height - grid_size
    elif direction == 'down':
        y = y + grid_size
        # 无边界模式：上边界和下边界互通
        if y >= max_height:
            y = 0
    elif direction == 'left':
        x = x - grid_size
        # 无边界模式：左边界和右边界互通
        if x < 0:
            x = max_width - grid_size
    elif direction == 'right':
        x = x + grid_size
        # 无边界模式：左边界和右边界互通
        if x >= max_width:
            x = 0
    elif direction == 'up_left':
        x = x - grid_size
        y = y - grid_size
        if x < 0:
            x = max_width - grid_size
        if y < 0:
            y = max_height - grid_size
    elif direction == 'up_right':
        x = x + grid_size
        y = y - grid_size
        if x >= max_width:
            x = 0
        if y < 0:
            y = max_height - grid_size
    elif direction == 'down_left':
        x = x - grid_size
        y = y + grid_size
        if x < 0:
            x = max_width - grid_size
        if y >= max_height:
            y = 0
    elif direction == 'down_right':
        x = x + grid_size
        y = y + grid_size
        if x >= max_width:
            x = 0
        if y >= max_height:
            y = 0
    # 'stay' 方向保持位置不变
    
    return (x, y)


def get_move_direction_away_from_danger(current_pos: Tuple[float, float], 
                                       danger_pos: Tuple[float, float], 
                                       grid_size: int = GRID_SIZE, 
                                       max_width: int = SIMULATION_AREA_WIDTH, 
                                       max_height: int = SIMULATION_AREA_HEIGHT) -> Tuple[str, Tuple[float, float]]:
    """
    计算远离危险的移动方向，选择能到达感知范围内最远安全区域的方向，支持跨边缘寻路
    
    参数：
        current_pos: 当前位置 (x, y)
        danger_pos: 危险位置 (x, y)
        grid_size: 网格大小
        max_width: 模拟区域宽度
        max_height: 模拟区域高度
    
    返回：
        移动方向 ('up', 'down', 'left', 'right', 'stay'), 安全目标位置 (x, y)
    """
    # 获取当前位置和危险位置的坐标
    current_x, current_y = current_pos
    danger_x, danger_y = danger_pos
    
    # 计算感知范围内的最远安全点（距离危险最远）
    detection_range = get_setting('herbivore', 'danger_detection_distance', 15)
    
    # 计算在x和y方向上远离危险的最大可能偏移量
    # 确保在横向和纵向方向都远离危险
    max_x_offset = detection_range * grid_size
    max_y_offset = detection_range * grid_size
    
    # 确定x方向的最佳偏移（远离危险），考虑跨边缘情况
    # 计算直接远离的位置
    if current_x < danger_x:
        # 如果当前在危险左侧，向左移动尽可能远
        direct_best_x = max(0, danger_x - max_x_offset)
    elif current_x > danger_x:
        # 如果当前在危险右侧，向右移动尽可能远
        direct_best_x = min(max_width - grid_size, danger_x + max_x_offset)
    else:
        # 如果在同一列，随机选择左右方向
        if random.random() < 0.5:
            direct_best_x = max(0, danger_x - max_x_offset)
        else:
            direct_best_x = min(max_width - grid_size, danger_x + max_x_offset)
    
    # 计算跨边缘的位置选项
    cross_best_x_left = direct_best_x
    cross_best_x_right = direct_best_x
    
    # 如果危险接近右边缘，考虑从左侧远离
    if danger_x > max_width / 2:
        cross_best_x_left = danger_x - max_x_offset
        if cross_best_x_left < 0:
            cross_best_x_left = max_width + cross_best_x_left  # 跨左边缘
    # 如果危险接近左边缘，考虑从右侧远离
    else:
        cross_best_x_right = danger_x + max_x_offset
        if cross_best_x_right >= max_width:
            cross_best_x_right = cross_best_x_right - max_width  # 跨右边缘
    
    # 选择离危险最远的x位置
    best_x = direct_best_x
    direct_distance = abs(direct_best_x - danger_x)
    cross_left_distance = min(abs(cross_best_x_left - danger_x), max_width - abs(cross_best_x_left - danger_x))
    cross_right_distance = min(abs(cross_best_x_right - danger_x), max_width - abs(cross_best_x_right - danger_x))
    
    if cross_left_distance > direct_distance:
        best_x = cross_best_x_left
    if cross_right_distance > direct_distance:
        best_x = cross_best_x_right
    
    # 确定y方向的最佳偏移（远离危险），考虑跨边缘情况
    # 计算直接远离的位置
    if current_y < danger_y:
        # 如果当前在危险上方，向上移动尽可能远
        direct_best_y = max(0, danger_y - max_y_offset)
    elif current_y > danger_y:
        # 如果当前在危险下方，向下移动尽可能远
        direct_best_y = min(max_height - grid_size, danger_y + max_y_offset)
    else:
        # 如果在同一行，随机选择上下方向
        if random.random() < 0.5:
            direct_best_y = max(0, danger_y - max_y_offset)
        else:
            direct_best_y = min(max_height - grid_size, danger_y + max_y_offset)
    
    # 计算跨边缘的位置选项
    cross_best_y_up = direct_best_y
    cross_best_y_down = direct_best_y
    
    # 如果危险接近下边缘，考虑从上侧远离
    if danger_y > max_height / 2:
        cross_best_y_up = danger_y - max_y_offset
        if cross_best_y_up < 0:
            cross_best_y_up = max_height + cross_best_y_up  # 跨上边缘
    # 如果危险接近上边缘，考虑从下侧远离
    else:
        cross_best_y_down = danger_y + max_y_offset
        if cross_best_y_down >= max_height:
            cross_best_y_down = cross_best_y_down - max_height  # 跨下边缘
    
    # 选择离危险最远的y位置
    best_y = direct_best_y
    direct_distance = abs(direct_best_y - danger_y)
    cross_up_distance = min(abs(cross_best_y_up - danger_y), max_height - abs(cross_best_y_up - danger_y))
    cross_down_distance = min(abs(cross_best_y_down - danger_y), max_height - abs(cross_best_y_down - danger_y))
    
    if cross_up_distance > direct_distance:
        best_y = cross_best_y_up
    if cross_down_distance > direct_distance:
        best_y = cross_best_y_down
    
    # 确保坐标是网格对齐的
    best_x = round(best_x / grid_size) * grid_size
    best_y = round(best_y / grid_size) * grid_size
    
    # 确保坐标在有效范围内（0 <= x < max_width, 0 <= y < max_height）
    # 由于是循环地图，我们可以对坐标进行模运算
    best_x = best_x % max_width
    best_y = best_y % max_height
    
    # 安全目标位置
    safe_target_pos = (best_x, best_y)
    
    # 计算从当前位置到安全目标位置的移动方向，考虑跨边缘情况
    best_direction = get_move_direction_towards_target(current_pos, safe_target_pos, grid_size, max_width, max_height)
    
    return best_direction, safe_target_pos

def move_towards_targets_or_random(organism: Any, 
                                  targets: List[Any], 
                                  follow_prob: float, 
                                  follow_dist: float, 
                                  same_species: List[Any] = None,
                                  dangers: List[Any] = None,
                                  obstacles: List[Any] = None,
                                  grid_size: int = GRID_SIZE, 
                                  max_width: int = SIMULATION_AREA_WIDTH, 
                                  max_height: int = SIMULATION_AREA_HEIGHT) -> Tuple[bool, Tuple[float, float]]:
    """
    根据目标和危险决定移动方向并更新位置
    
    参数：
        organism: 生物实例
        targets: 目标列表
        follow_prob: 跟随概率
        follow_dist: 跟随距离
        same_species: 同一物种列表
        dangers: 危险列表
        grid_size: 网格大小
        max_width: 模拟区域宽度
        max_height: 模拟区域高度
    
    返回：
        (是否移动成功, 新位置)
    """
    current_pos = (organism.x, organism.y)
    
    # 初始化target和danger属性为None
    organism.target = None
    organism.danger = None
    
    # 预过滤存活的目标和危险，减少不必要的计算
    if targets:
        targets = [t for t in targets if t.is_alive()]
    if dangers:
        dangers = [d for d in dangers if d.is_alive()]
    
    # 使用集合进行快速障碍物检测
    obstacle_positions = set()
    if obstacles:
        obstacle_positions = {(o.x, o.y) for o in obstacles if o.is_alive()}
    
    # 辅助：方向→下一位置与障碍检测
    def next_pos_for_dir(dir_: str) -> Tuple[float, float]:
        return calculate_new_position(current_pos, dir_, grid_size, max_width, max_height)

    def is_obstacle_at(pos: Tuple[float, float]) -> bool:
        return pos in obstacle_positions
    
    # 简化距离计算函数，避免重复计算
    def calculate_distance(pos1, pos2):
        dx = min(abs(pos1[0] - pos2[0]), max_width - abs(pos1[0] - pos2[0]))
        dy = min(abs(pos1[1] - pos2[1]), max_height - abs(pos1[1] - pos2[1]))
        # 使用dx*dx + dy*dy而不是sqrt，因为排序时不需要精确距离
        return dx * dx + dy * dy

    def choose_alternative(primary_dir: str) -> str:
        # 简化替代方向选择，优先尝试基础方向
        directions_to_try = []
        
        # 基础方向集合
        base_dirs = ['up', 'down', 'left', 'right']
        
        # 首先尝试原方向
        directions_to_try.append(primary_dir)
        
        # 添加基础方向（避免重复）
        for d in base_dirs:
            if d != primary_dir:
                directions_to_try.append(d)
        
        # 尝试每个方向，返回第一个没有障碍物的
        for d in directions_to_try:
            if not is_obstacle_at(next_pos_for_dir(d)):
                return d
        
        # 如果所有方向都有障碍物，返回原方向
        return primary_dir

    direction = 'stay'  # 默认不移动
    
    # 优先躲避危险（限制最大危险数量以提高性能）
    if dangers:
        # 最多考虑前10个危险，避免过多计算
        dangers_to_consider = dangers[:10]
        
        # 选择最近的危险
        closest_danger = min(dangers_to_consider, key=lambda d: calculate_distance(current_pos, (d.x, d.y)))
        danger_pos = (closest_danger.x, closest_danger.y)
        direction, _ = get_move_direction_away_from_danger(current_pos, danger_pos, grid_size, max_width, max_height)
        organism.danger = closest_danger
    # 其次寻找目标（限制最大目标数量）
    elif targets and random.random() < follow_prob:
        # 最多考虑前20个目标
        targets_to_consider = targets[:20]
        
        # 选择最近的目标
        closest_target = min(targets_to_consider, key=lambda t: calculate_distance(current_pos, (t.x, t.y)))
        target_pos = (closest_target.x, closest_target.y)
        
        # 只有当目标在跟随距离内时才追踪
        distance_to_target = calculate_distance(current_pos, target_pos)
        # 将follow_dist转换为像素距离并平方，确保单位一致
        follow_distance_pixels = follow_dist * grid_size
        if distance_to_target <= follow_distance_pixels * follow_distance_pixels:  # 避免开平方
            direction = get_move_direction_towards_target(current_pos, target_pos, grid_size, max_width, max_height)
            organism.target = closest_target
        else:
            # 超出跟踪距离，随机移动
            direction = get_random_move_direction()
    # 否则随机移动
    else:
        direction = get_random_move_direction()
    
    # 全局绕障：任何方向选择都需避开障碍
    if is_obstacle_at(next_pos_for_dir(direction)):
        direction = choose_alternative(direction)
    
    # 计算新位置
    new_pos = calculate_new_position(current_pos, direction, grid_size, max_width, max_height)
    
    # 确保新位置位于网格中心点，这是关键修复
    # 计算网格索引
    grid_x = new_pos[0] // grid_size
    grid_y = new_pos[1] // grid_size
    # 转换回网格中心点坐标
    centered_x = grid_x * grid_size
    centered_y = grid_y * grid_size
    
    centered_new_pos = (centered_x, centered_y)
    
    # 判断是否实际移动了
    moved = centered_new_pos != current_pos
    
    return moved, centered_new_pos