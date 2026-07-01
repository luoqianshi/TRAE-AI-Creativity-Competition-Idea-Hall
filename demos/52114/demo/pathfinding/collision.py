
from typing import Tuple, List, Optional, Any
from config.constants import GRID_SIZE, SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT
from config.settings import get_setting


def calculate_distance(pos1: Tuple[float, float], pos2: Tuple[float, float], 
                       max_width: int = SIMULATION_AREA_WIDTH, 
                       max_height: int = SIMULATION_AREA_HEIGHT) -> float:
    """
    计算两点之间的最短距离，考虑循环地图的边界情况
    
    参数：
        pos1: 第一个位置 (x, y)
        pos2: 第二个位置 (x, y)
        max_width: 模拟区域宽度
        max_height: 模拟区域高度
    
    返回：
        最短距离值
    """
    x1, y1 = pos1
    x2, y2 = pos2
    
    # 计算X方向的最短距离（考虑循环地图）
    dx = abs(x1 - x2)
    dx = min(dx, max_width - dx)
    
    # 计算Y方向的最短距离（考虑循环地图）
    dy = abs(y1 - y2)
    dy = min(dy, max_height - dy)
    
    # 使用欧几里得距离公式
    return (dx**2 + dy**2) ** 0.5


def check_collision(organism1: Any, organism2: Any, 
                    grid_size: int = GRID_SIZE) -> bool:
    """
    检查两个生物是否发生碰撞（基于距离的检测）
    
    参数：
        organism1: 第一个生物实例
        organism2: 第二个生物实例
        grid_size: 网格大小
    
    返回：
        是否发生碰撞
    """
    # 检查两个生物是否存活
    if not (hasattr(organism1, 'is_alive') and organism1.is_alive() and hasattr(organism2, 'is_alive') and organism2.is_alive()):
        return False
    
    # 使用基于距离的碰撞检测，当两个生物体足够接近时认为发生碰撞
    # 使用grid_size作为距离阈值，这样当生物体接近到一个网格大小时就会触发碰撞
    distance = calculate_distance((organism1.x, organism1.y), (organism2.x, organism2.y))
    return distance <= grid_size


def handle_predator_prey_collision(predator: Any, prey: Any) -> bool:
    """
    处理捕食者和猎物之间的碰撞
    
    参数：
        predator: 捕食者实例
        prey: 猎物实例
    
    返回：
        是否成功捕食
    """
    if not (hasattr(predator, 'is_alive') and predator.is_alive() and hasattr(prey, 'is_alive') and prey.is_alive()):
        return False
    
    predator_type = getattr(predator, 'organism_type', '').lower()
    prey_type = getattr(prey, 'organism_type', '').lower()

    if predator_type == 'herbivore' and prey_type == 'producer':
        amount = min(prey.energy, float(get_setting('herbivore', 'energy_from_food', 50)))
        predator.gain_energy(amount)
        if hasattr(prey, 'consume_energy'):
            prey.consume_energy(amount)
        else:
            prey.energy = max(0, prey.energy - amount)
        if prey.energy <= 0:
            prey.dead = True
        return True
    elif predator_type == 'carnivore' and prey_type == 'herbivore':
        # 调试日志
        print(f"[调试] 肉食动物捕食草食动物 - 捕食前草食动物能量: {prey.energy}")
        
        # 获取肉食动物的energy_from_food值
        energy_from_food = float(get_setting('carnivore', 'energy_from_food', 30))
        
        # 根据草食动物当前能量和energy_from_food确定实际获取的能量
        if prey.energy <= energy_from_food:
            # 如果草食动物能量小于等于energy_from_food，仅获取草食动物当前能量
            energy_gain = prey.energy
        else:
            # 如果草食动物能量大于energy_from_food，仅获取energy_from_food值
            energy_gain = energy_from_food
        
        # 恢复肉食动物的能量（不超过最大值）
        predator.gain_energy(energy_gain)
        print(f"[调试] 肉食动物获取能量: {energy_gain}")
        
        # 草食动物被捕获时扣除肉食动物获取能量的1.5倍
        # 使用consume_energy方法，让它根据能量值是否<=0来决定死亡
        energy_deduction = int(energy_gain * 1.5)
        print(f"[调试] 草食动物扣除能量: {energy_deduction}")
        
        if hasattr(prey, 'consume_energy'):
            prey.consume_energy(energy_deduction)
        else:
            prey.energy = max(0, prey.energy - energy_deduction)
            if prey.energy <= 0:
                prey.dead = True
        
        # 调试日志 - 捕食后状态
        print(f"[调试] 捕食后草食动物能量: {prey.energy}, 死亡状态: {prey.dead}")
        
        return True
    else:
        rate = float(get_setting('general', 'energy_transfer_rate', 0.7))
        energy_gained = float(prey.energy) * rate
        predator.gain_energy(energy_gained)
        prey.dead = True
        prey.energy = 0
    
    return True


def handle_same_species_collision(new_pos: Tuple[float, float], 
                                 organism: Any, 
                                 same_species_list: List[Any]) -> Tuple[bool, Tuple[float, float]]:
    """
    处理与同类的碰撞
    
    参数：
        new_pos: 新位置 (x, y)
        organism: 当前生物体
        same_species_list: 同类生物体列表
    
    返回：
        (是否发生碰撞, 应该使用的位置)
    """
    for other in same_species_list:
        if other is not organism and check_collision(organism, other):
            return True, (organism.x, organism.y)  # 碰撞发生，返回原位置
    
    return False, new_pos  # 无碰撞，返回新位置


def find_colliding_organisms(organism: Any, 
                            all_organisms: List[Any], 
                            grid_size: int = GRID_SIZE) -> List[Any]:
    """
    查找与指定生物碰撞的所有其他生物
    
    参数：
        organism: 目标生物实例
        all_organisms: 所有生物的列表
        grid_size: 网格大小
    
    返回：
        发生碰撞的生物列表
    """
    # 快速位置检查优化
    org_pos = (organism.x, organism.y)
    collisions = [o for o in all_organisms if organism is not o and (o.x, o.y) == org_pos]
    return collisions


def process_ecosystem_collisions(herbivores: List[Any], 
                                 carnivores: List[Any], 
                                 producers: List[Any],
                                 waters: List[Any],
                                 rocks: List[Any]) -> Tuple[int, int]:
    """
    处理生态系统中的所有碰撞
    
    参数：
        herbivores: 草食动物列表
        carnivores: 肉食动物列表
        producers: 生产者列表
    
    返回：
        (被草食动物吃掉的植物数量, 被肉食动物吃掉的草食动物数量)
    """
    plants_eaten = 0
    herbivores_eaten = 0
    
    # 预过滤存活的生物体，避免重复检查is_alive
    alive_herbivores = [h for h in herbivores if h.is_alive()]
    alive_carnivores = [c for c in carnivores if c.is_alive()]
    alive_producers = [p for p in producers if p.is_alive()]
    
    # 使用集合进行快速位置查询，避免O(n)遍历
    occupied_positions = set()
    
    # 添加所有障碍物位置
    for o in waters + rocks:
        if o.is_alive():
            occupied_positions.add((o.x, o.y))
    
    # 添加所有生物体位置
    for o in alive_producers + alive_herbivores + alive_carnivores:
        occupied_positions.add((o.x, o.y))
    
    # 快速位置检查函数
    def is_occupied(pos: Tuple[int, int]) -> bool:
        return pos in occupied_positions

    def find_adjacent_free_cell(prev_pos: Tuple[int, int]) -> Tuple[int, int]:
        px, py = prev_pos
        candidates = [
            (px, (py - GRID_SIZE) % SIMULATION_AREA_HEIGHT),
            (px, (py + GRID_SIZE) % SIMULATION_AREA_HEIGHT),
            ((px - GRID_SIZE) % SIMULATION_AREA_WIDTH, py),
            ((px + GRID_SIZE) % SIMULATION_AREA_WIDTH, py)
        ]
        for nx, ny in candidates:
            if not is_occupied((nx, ny)):
                return (nx, ny)
        return prev_pos

    # 使用基于距离的碰撞检测，更宽松和合理
    def quick_check_collision(organism, others):
        # 使用check_collision函数而不是严格的位置比较
        return [o for o in others if check_collision(organism, o)]
    
    # 处理草食动物与植物：先结算能量，再决定占位或回退
    for herbivore in alive_herbivores:
        current_pos = (herbivore.x, herbivore.y)
        
        # 快速检查是否与障碍物碰撞
        if current_pos in occupied_positions:
            # 检查是否真的与障碍物碰撞（因为集合中也包含其他生物）
            obstacle_here = False
            for o in waters + rocks:
                if o.is_alive() and (o.x, o.y) == current_pos:
                    obstacle_here = True
                    break
            
            if obstacle_here and hasattr(herbivore, 'prev_x') and hasattr(herbivore, 'prev_y'):
                desired = (herbivore.prev_x, herbivore.prev_y)
                # 简化处理：直接回退，不再寻找相邻格子
                herbivore.x, herbivore.y = desired
                continue
        
        # 快速检查与植物的碰撞
        plant_collisions = quick_check_collision(herbivore, alive_producers)
        if plant_collisions:
            # 只处理第一个植物碰撞
            plant = plant_collisions[0]
            pre_dead = getattr(plant, 'dead', False)
            handle_predator_prey_collision(herbivore, plant)
            post_dead = getattr(plant, 'dead', False)
            
            if post_dead and not pre_dead:
                plants_eaten += 1
                # 植物死亡后，从占用位置集合中移除
                if (plant.x, plant.y) in occupied_positions:
                    occupied_positions.remove((plant.x, plant.y))
            else:
                # 植物未被消灭，草食者退回原位
                if hasattr(herbivore, 'prev_x') and hasattr(herbivore, 'prev_y'):
                    herbivore.x, herbivore.y = (herbivore.prev_x, herbivore.prev_y)
    
    # 处理肉食动物与草食动物：同样遵循占位规则
    for carnivore in alive_carnivores:
        current_pos = (carnivore.x, carnivore.y)
        
        # 快速检查是否与障碍物碰撞
        obstacle_here = False
        for o in producers + waters + rocks:
            if o.is_alive() and (o.x, o.y) == current_pos:
                obstacle_here = True
                break
        
        if obstacle_here and hasattr(carnivore, 'prev_x') and hasattr(carnivore, 'prev_y'):
            # 简化处理：直接回退
            carnivore.x, carnivore.y = (carnivore.prev_x, carnivore.prev_y)
            continue
        
        # 快速检查与草食动物的碰撞
        herbivore_collisions = quick_check_collision(carnivore, alive_herbivores)
        if herbivore_collisions:
            # 只处理第一个草食动物碰撞
            herbivore = herbivore_collisions[0]
            # 再次检查草食动物是否存活
            if not herbivore.is_alive():
                continue
                
            pre_dead = getattr(herbivore, 'dead', False)
            handle_predator_prey_collision(carnivore, herbivore)
            post_dead = getattr(herbivore, 'dead', False)
            
            if post_dead and not pre_dead:
                herbivores_eaten += 1
                # 允许占位到被捕食者位置
                carnivore.x, carnivore.y = herbivore.x, herbivore.y
                # 从占用位置集合中移除被吃掉的草食动物
                if (herbivore.x, herbivore.y) in occupied_positions:
                    occupied_positions.remove((herbivore.x, herbivore.y))
            else:
                # 未消灭则回退到原位
                if hasattr(carnivore, 'prev_x') and hasattr(carnivore, 'prev_y'):
                    carnivore.x, carnivore.y = (carnivore.prev_x, carnivore.prev_y)

    # 优化同类碰撞处理：使用位置映射快速检测碰撞
    def resolve_same_species(species):
        # 使用字典记录每个位置上的生物体
        pos_to_organisms = {}
        for org in species:
            pos = (org.x, org.y)
            if pos not in pos_to_organisms:
                pos_to_organisms[pos] = []
            pos_to_organisms[pos].append(org)
        
        # 处理每个位置上有多个生物体的情况
        for pos, orgs in pos_to_organisms.items():
            if len(orgs) > 1:
                # 保留第一个生物体，回退其他生物体
                for org in orgs[1:]:
                    if hasattr(org, 'prev_x') and hasattr(org, 'prev_y'):
                        # 直接回退到之前的位置
                        org.x, org.y = (org.prev_x, org.prev_y)
    
    # 只处理存活的生物体
    resolve_same_species(alive_herbivores)
    resolve_same_species(alive_carnivores)
    resolve_same_species(alive_producers)

    return plants_eaten, herbivores_eaten
