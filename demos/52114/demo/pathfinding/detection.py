from config import GRID_SIZE, get_setting
import random
from typing import List, Tuple, Optional, Any
from .collision import calculate_distance
from config.constants import SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT


# 从配置中获取检测相关参数
def get_detection_settings():
    """
    获取检测相关的配置参数
    """
    return {
        'danger_detection_distance': get_setting('herbivore', 'danger_detection_distance', 15),
        'escape_probability': get_setting('herbivore', 'escape_probability', 80),
        'food_detection_distance': get_setting('herbivore', 'food_detection_distance', 20),
        'follow_distance': get_setting('carnivore', 'follow_distance', 25),
        'follow_probability': get_setting('carnivore', 'follow_probability', 80)
    }


def check_line_of_sight(pos1: Tuple[int, int], pos2: Tuple[int, int], obstacles: List[Any], is_herbivore: bool = False, is_food_detection: bool = False, grid_size: int = GRID_SIZE) -> bool:
    """
    检查两点之间是否有视线（没有障碍物阻挡）
    使用简化的射线检测算法
    
    参数：
        pos1: 起始位置 (x, y)
        pos2: 目标位置 (x, y)
        obstacles: 障碍物列表（岩石、植物等）
        is_herbivore: 是否为食草动物
        is_food_detection: 是否为食物检测（如果是食草动物且是食物检测，则植物不遮挡）
        grid_size: 网格大小
    
    返回：
        是否有视线
    """
    # 如果没有障碍物，直接返回True
    if not obstacles:
        return True
    
    # 根据检测类型过滤障碍物
    # 对于食草动物的食物检测，移除植物作为障碍物
    filtered_obstacles = []
    for obstacle in obstacles:
        if hasattr(obstacle, 'is_alive') and obstacle.is_alive():
            # 如果是食草动物且是食物检测，且障碍物是植物（Producer），则不将其视为障碍物
            if is_herbivore and is_food_detection and hasattr(obstacle, '__class__') and obstacle.__class__.__name__ == 'Producer':
                continue
            filtered_obstacles.append(obstacle)
    
    # 获取所有存活障碍物的位置集合
    obstacle_positions = {(o.x, o.y) for o in filtered_obstacles}
    
    # 快速检查：如果起始位置或目标位置有障碍物，视线被阻挡
    if (pos1[0], pos1[1]) in obstacle_positions or (pos2[0], pos2[1]) in obstacle_positions:
        return False
    
    # 使用Bresenham算法的简化版本来检测路径上的障碍物
    x1, y1 = pos1
    x2, y2 = pos2
    
    # 计算方向和步长
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    sx = 1 if x2 > x1 else -1
    sy = 1 if y2 > y1 else -1
    
    # 如果距离很近，直接检查中间点
    if dx <= grid_size and dy <= grid_size:
        return True
    
    # 简化的Bresenham算法，检查路径上的网格点
    current_x, current_y = x1, y1
    for _ in range(max(dx, dy) // grid_size + 1):
        # 检查当前网格是否有障碍物
        grid_x = int(round(current_x / grid_size)) * grid_size
        grid_y = int(round(current_y / grid_size)) * grid_size
        
        if (grid_x, grid_y) in obstacle_positions:
            return False
        
        # 如果到达目标，结束检查
        if abs(current_x - x2) < grid_size and abs(current_y - y2) < grid_size:
            break
        
        # 移动到下一个网格
        current_x += sx * grid_size
        current_y += sy * grid_size
    
    return True

def find_nearby_targets(organism_pos: Tuple[int, int], targets: List, distance: int, 
                       obstacles: List[Any] = None, grid_size: int = GRID_SIZE, 
                       is_herbivore: bool = False, is_food_detection: bool = False) -> List:
    """
    查找感知范围内且视线未被阻挡的所有目标
    
    参数：
        organism_pos: 生物体的位置 (x, y)
        targets: 目标列表
        distance: 感知距离（网格数量）
        obstacles: 障碍物列表（岩石、植物等）
        grid_size: 网格大小
        is_herbivore: 是否为食草动物
        is_food_detection: 是否为食物检测
    
    返回：
        感知范围内且视线未被阻挡的目标列表
    """
    if obstacles is None:
        obstacles = []
        
    nearby_targets = []
    max_distance = distance * grid_size
    for target in targets:
        if hasattr(target, 'is_alive') and not target.is_alive():
            continue
        d = calculate_distance((organism_pos[0], organism_pos[1]), (target.x, target.y), SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT)
        if d <= max_distance:
            # 检查视线是否被障碍物阻挡
            if check_line_of_sight(organism_pos, (target.x, target.y), obstacles, is_herbivore, is_food_detection, grid_size):
                nearby_targets.append(target)
    
    return nearby_targets


def find_nearby_dangers(organism_pos: Tuple[int, int], dangers: List, distance: Optional[int] = None, 
                       obstacles: List[Any] = None, grid_size: int = GRID_SIZE, 
                       is_herbivore: bool = False) -> List:
    """
    查找感知范围内且视线未被阻挡的所有危险（食肉动物）
    
    参数：
        organism_pos: 生物体的位置 (x, y)
        dangers: 危险列表（食肉动物）
        distance: 感知距离（网格数量）
        obstacles: 障碍物列表（岩石、植物等）
        grid_size: 网格大小
        is_herbivore: 是否为食草动物
    
    返回：
        感知范围内且视线未被阻挡的危险列表
    """
    if obstacles is None:
        obstacles = []
        
    nearby_dangers = []
    if distance is None:
        distance = 10
    max_distance = distance * grid_size
    for danger in dangers:
        if hasattr(danger, 'is_alive') and not danger.is_alive():
            continue
        d = calculate_distance((organism_pos[0], organism_pos[1]), (danger.x, danger.y), SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT)
        if d <= max_distance:
            # 检查视线是否被障碍物阻挡
            # 对于危险检测，植物应阻挡视线
            if check_line_of_sight(organism_pos, (danger.x, danger.y), obstacles, is_herbivore, False, grid_size):
                nearby_dangers.append(danger)
    
    return nearby_dangers


def decide_action_priority(organism, nearby_food: List, nearby_dangers: List) -> str:
    """
    根据能量状态决定行动优先级
    
    参数：
        organism: 当前生物体
        nearby_food: 附近的食物列表
        nearby_dangers: 附近的危险列表
    
    返回：
        'towards_food' 或 'away_from_danger' 或 'random'
    """
    # 获取检测相关配置
    settings = get_detection_settings()
    # 获取当前能量和最大能量
    current_energy = organism.energy
    max_energy = organism.max_energy
    # 计算半能量阈值（不单独存储为变量，直接在条件判断中使用）
    
    # 使用配置中的逃逸概率
    escape_prob = settings['escape_probability'] / 100  # 转换为0-1概率值
    
    # 没有食物和危险时，随机移动
    if not nearby_food and not nearby_dangers:
        return 'random'
    
    # 只有食物时，趋向食物
    if nearby_food and not nearby_dangers:
        return 'towards_food'
    
    # 只有危险时，有概率躲避
    if not nearby_food and nearby_dangers:
        if random.random() < escape_prob:
            return 'away_from_danger'
        else:
            return 'random'
    
    # 当能量小于最大能量的60%时，优先趋向食物
    if current_energy < max_energy * 0.3:
        if random.random() < 0.7:  # 70%概率选择趋向食物
            return 'towards_food'
        else:
            # 30%概率根据是否有危险决定是否躲避
            if random.random() < escape_prob:
                return 'away_from_danger'
            else:
                return 'towards_food'
    
    # 当能量大于最大能量一半时，优先远离危险
    elif current_energy > max_energy * 0.5:
        if random.random() < 0.7:  # 70%概率选择远离危险
            return 'away_from_danger'
        else:
            # 30%概率趋向食物
            return 'towards_food'
    
    # 当能量介于初始值和最大能量一半之间时，综合比较
    else:
        # 计算能量比例（0-1之间，0表示初始能量，1表示最大能量的一半）
        initial_energy = organism.initial_energy
        health_ratio = (current_energy - initial_energy) / (max_energy * 0.5 - initial_energy)
        
        # 危险距离越近，躲避概率越高
        min_danger_distance = float('inf')
        for danger in nearby_dangers:
            dx = abs(danger.x - organism.x)
            dy = abs(danger.y - organism.y)
            distance = dx + dy
            min_danger_distance = min(min_danger_distance, distance)
        
        # 食物距离越近，趋向概率越高
        min_food_distance = float('inf')
        for food in nearby_food:
            dx = abs(food.x - organism.x)
            dy = abs(food.y - organism.y)
            distance = dx + dy
            min_food_distance = min(min_food_distance, distance)
        
        # 归一化距离（使用配置中的危险检测距离）
        max_distance = settings['danger_detection_distance'] * GRID_SIZE
        danger_distance_ratio = min_danger_distance / max_distance
        food_distance_ratio = min_food_distance / max_distance
        
        # 计算躲避和趋向的权重
        danger_weight = (1 - health_ratio) * (1 - danger_distance_ratio)
        food_weight = health_ratio * (1 - food_distance_ratio)
        
        # 归一化权重
        total_weight = danger_weight + food_weight
        if total_weight == 0:
            return 'random'
        
        danger_prob = danger_weight / total_weight
        
        if random.random() < danger_prob:
            return 'away_from_danger'
        else:
            return 'towards_food'
