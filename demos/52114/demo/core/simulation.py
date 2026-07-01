import random
from typing import Optional, Dict, Any, List, Tuple
from config import settings, SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT, GRID_SIZE, get_setting
from config.settings import add_config_listener, remove_config_listener
from organisms import Producer, Herbivore, Carnivore, Water, Rock
from organisms.base_organism import BaseOrganism
from pathfinding import move_towards_targets_or_random, process_ecosystem_collisions, find_nearby_targets, find_nearby_dangers
from utils import clamp_offset


class Simulation:
    def __init__(self):
        self.organisms = []
        self.zoom = 1.0
        self.offset = (0, 0)
        self.time_elapsed = 0.0  # 经过的时间
        self.cycle_count = 0  # 周期计数
        self.stats_callback = None  # 统计回调函数
        # 初始化人口历史记录
        self.population_history = {
            'producer': [],
            'herbivore': [],
            'carnivore': []
        }
        # 初始化世代计数
        self.generation_count = {
            'producer': 1,
            'herbivore': 1,
            'carnivore': 1
        }
        # 注册配置更新监听器
        self._config_listener = lambda category, key, new_value: self._handle_config_update(category, key, new_value)
        add_config_listener(self._config_listener)
        self.initialize_simulation()
    
    def initialize_simulation(self):
        """
        初始化模拟环境
        """
        # 清空现有生物体
        self.organisms.clear()
        print("[调试] 初始化模拟环境，清空现有生物体")
        
        # 创建水与岩石
        self._create_obstacle_clusters()

        # 创建生产者
        initial_producers = get_setting('producer', 'initial_count', 50)
        producers_created = 0
        max_attempts = initial_producers * 20  # 增加最大尝试次数，因为需要避开更多障碍
        attempts = 0
        
        # 提取水和岩石的位置，用于快速检查
        water_rock_positions = {(w.x, w.y) for w in self.organisms if isinstance(w, (Water, Rock))}
        
        while producers_created < initial_producers and attempts < max_attempts:
            # 使用网格对齐的位置
            x = random.randint(0, (SIMULATION_AREA_WIDTH - GRID_SIZE) // GRID_SIZE) * GRID_SIZE
            y = random.randint(0, (SIMULATION_AREA_HEIGHT - GRID_SIZE) // GRID_SIZE) * GRID_SIZE
            
            # 检查该位置是否已有生物体，并且不在水或岩石的位置
            if (x, y) not in water_rock_positions and not self.find_organism_at_position(x + GRID_SIZE/2, y + GRID_SIZE/2):
                producer = Producer(x, y)
                self.organisms.append(producer)
                producers_created += 1
            attempts += 1
        print(f"[调试] 创建了 {producers_created} 个生产者")
        
        # 创建草食动物
        initial_herbivores = get_setting('herbivore', 'initial_count', 10)
        herbivores_created = 0
        attempts = 0
        max_attempts = initial_herbivores * 20
        
        while herbivores_created < initial_herbivores and attempts < max_attempts:
            x = random.randint(0, SIMULATION_AREA_WIDTH // GRID_SIZE - 1) * GRID_SIZE
            y = random.randint(0, SIMULATION_AREA_HEIGHT // GRID_SIZE - 1) * GRID_SIZE
            
            # 确保不在水或岩石的位置
            if (x, y) not in water_rock_positions:
                herbivore = Herbivore(x, y)
                self.organisms.append(herbivore)
                herbivores_created += 1
            attempts += 1
        print(f"[调试] 创建了 {herbivores_created} 个草食动物")
        
        # 创建肉食动物
        initial_carnivores = get_setting('carnivore', 'initial_count', 3)
        carnivores_created = 0
        attempts = 0
        max_attempts = initial_carnivores * 20
        
        while carnivores_created < initial_carnivores and attempts < max_attempts:
            x = random.randint(0, SIMULATION_AREA_WIDTH // GRID_SIZE - 1) * GRID_SIZE
            y = random.randint(0, SIMULATION_AREA_HEIGHT // GRID_SIZE - 1) * GRID_SIZE
            
            # 确保不在水或岩石的位置
            if (x, y) not in water_rock_positions:
                carnivore = Carnivore(x, y)
                self.organisms.append(carnivore)
                carnivores_created += 1
            attempts += 1
        print(f"[调试] 创建了 {carnivores_created} 个肉食动物")
        print(f"[调试] 创建了 {initial_carnivores} 个肉食动物")
        print(f"[调试] 总共创建了 {len(self.organisms)} 个生物体")
        
        # 重置视图
        self.zoom = 1.0
        self.offset = (0, 0)
    
    def update(self, delta_time: float) -> None:
        """
        更新模拟状态
        
        参数：
            delta_time: 帧间隔时间（秒）
        """
        # 更新时间和周期计数
        self.time_elapsed += delta_time
        self.cycle_count += 1
        
        # 处理生物体更新
        self._update_organisms(delta_time)
        
        # 处理生态系统碰撞
        producers, herbivores, carnivores, waters, rocks = self._classify_organisms_extended()
        
        # 处理碰撞
        process_ecosystem_collisions(herbivores, carnivores, producers, waters, rocks)
        self._update_stuck_status()
        
        # 清理死亡的生物体
        self._cleanup_dead_organisms()
        
        # 水域繁殖植物
        if self.cycle_count % 300 == 0:
            self._spawn_plants_near_water()

        # 维持种群平衡
        self._maintain_population_balance()
        
        # 每10帧记录一次统计信息
        if self.cycle_count % 10 == 0:
            self._record_population_stats()
            if hasattr(self, 'stats_callback') and self.stats_callback:
                self.stats_callback(self.get_organism_counts(), self.time_elapsed)
            # 每100帧输出一次详细调试信息
            if self.cycle_count % 100 == 0:
                counts = self.get_organism_counts()
                print(f"[调试] 周期 {self.cycle_count} - 存活生物体: 生产者={counts.get('producer', 0)}, 草食动物={counts.get('herbivore', 0)}, 肉食动物={counts.get('carnivore', 0)}")
    
    def register_stats_callback(self, callback):
        """
        注册统计信息回调函数
        
        参数：
            callback: 回调函数，将接收生物体计数和经过时间作为参数
        """
        self.stats_callback = callback
        
    def _update_organisms(self, delta_time: float) -> None:
        """
        更新所有生物体
        
        参数：
            delta_time: 帧间隔时间（秒）
        """
        # 缓存植物位置，避免在遮挡检查中重复计算
        self._cached_plant_positions = {(p.x, p.y) for p in self.organisms if isinstance(p, Producer) and p.is_alive()}
        
        # 创建副本以避免迭代中修改
        organisms_copy = self.organisms.copy()
        
        # 预先构建生产者位置集合用于邻域判断
        producer_positions = self._cached_plant_positions

        # 繁殖成功计数
        reproduction_count = 0
        
        for organism in organisms_copy:
            if organism.is_alive():
                # 更新生物体状态
                organism.update(delta_time)
                
                # 处理移动
                self._handle_organism_movement(organism)
                
                # 处理进食
                if isinstance(organism, Herbivore):
                    # 获取当前位置的所有植物
                    producers_at_pos = [
                        p for p in self.organisms 
                        if isinstance(p, Producer) and p.is_alive() and 
                        p.x == organism.x and p.y == organism.y
                    ]
                    organism.eat(producers_at_pos)
                elif isinstance(organism, Carnivore):
                    # 获取当前位置的所有草食动物
                    herbivores_at_pos = [
                        h for h in self.organisms 
                        if isinstance(h, Herbivore) and h.is_alive() and 
                        h.x == organism.x and h.y == organism.y
                    ]
                    organism.eat(herbivores_at_pos)
                
                # 处理繁殖 - 调整为进食后立即检查繁殖
                # 对生产者增加休眠优化：满能量且被生产者包围则跳过繁殖计算
                is_producer = isinstance(organism, Producer)
                dorm_surrounded = False
                if is_producer and getattr(organism, 'energy', 0) >= getattr(organism, 'max_energy', 0):
                    # 检查周围8个方向是否都是生产者（循环边界）
                    surrounding_count = 0
                    for dx in [-GRID_SIZE, 0, GRID_SIZE]:
                        for dy in [-GRID_SIZE, 0, GRID_SIZE]:
                            if dx == 0 and dy == 0:
                                continue
                            check_x = (organism.x + dx) % SIMULATION_AREA_WIDTH
                            check_y = (organism.y + dy) % SIMULATION_AREA_HEIGHT
                            # 网格对齐
                            check_x = int(check_x / GRID_SIZE) * GRID_SIZE
                            check_y = int(check_y / GRID_SIZE) * GRID_SIZE
                            if (check_x, check_y) in producer_positions:
                                surrounding_count += 1
                    dorm_surrounded = surrounding_count >= 8
                    setattr(organism, 'dormant', dorm_surrounded)

                # 繁殖逻辑
                if is_producer and dorm_surrounded:
                    pass
                elif hasattr(organism, 'can_reproduce'):
                    # 调用can_reproduce()检查繁殖条件
                    if organism.can_reproduce():
                        new_organism = organism.reproduce()
                        if new_organism:
                            print(f"[调试-繁殖成功] 生物体({organism.__class__.__name__}) 繁殖成功!")
                            # 设置新生物体的世代信息
                            organism_type = organism.__class__.__name__.lower()
                            new_organism.generation = organism.generation + 1
                            # 更新最大世代数
                            self.generation_count[organism_type] = max(
                                self.generation_count[organism_type],
                                new_organism.generation
                            )
                            
                            # 特殊处理生产者的繁殖位置
                            if organism_type == 'producer':
                                # 检查周围8个方向是否都被占据（实现边缘贯通）
                                surrounding_count = 0
                                # 只检查周围8个相邻格子，不包括自身
                                for dx in [-GRID_SIZE, 0, GRID_SIZE]:
                                    for dy in [-GRID_SIZE, 0, GRID_SIZE]:
                                        if dx == 0 and dy == 0:
                                            continue  # 跳过自身位置
                                         
                                        # 计算检查位置（实现边缘贯通）
                                        check_x = (organism.x + dx) % SIMULATION_AREA_WIDTH
                                        check_y = (organism.y + dy) % SIMULATION_AREA_HEIGHT
                                        # 确保坐标是网格对齐的
                                        check_x = int(check_x / GRID_SIZE) * GRID_SIZE
                                        check_y = int(check_y / GRID_SIZE) * GRID_SIZE
                                         
                                        # 检查该位置是否有生物体
                                        if self.find_organism_at_position(check_x + GRID_SIZE/2, check_y + GRID_SIZE/2):
                                            surrounding_count += 1
                                
                                # 如果周围8个格子都被占据，则不能繁殖
                                if surrounding_count >= 8:
                                    # 不添加新植物，但部分重置繁殖间隔计数器，避免植物一直尝试繁殖
                                    if hasattr(organism, 'frame_since_last_reproduction') and hasattr(organism, 'reproduction_interval'):
                                        organism.frame_since_last_reproduction = max(0, organism.frame_since_last_reproduction - organism.reproduction_interval // 2)
                                    continue
                                
                                # 找到周围随机的空位（实现边缘贯通）
                                empty_positions = []
                                # 检查3x3网格内的位置
                                for dx in [-GRID_SIZE, 0, GRID_SIZE]:
                                    for dy in [-GRID_SIZE, 0, GRID_SIZE]:
                                        if dx == 0 and dy == 0:
                                            continue  # 跳过自身位置
                                         
                                        # 计算新位置（实现边缘贯通）
                                        new_x = (organism.x + dx) % SIMULATION_AREA_WIDTH
                                        new_y = (organism.y + dy) % SIMULATION_AREA_HEIGHT
                                        # 确保坐标是网格对齐的
                                        new_x = int(new_x / GRID_SIZE) * GRID_SIZE
                                        new_y = int(new_y / GRID_SIZE) * GRID_SIZE
                                         
                                        # 确保坐标在有效范围内
                                        if 0 <= new_x <= SIMULATION_AREA_WIDTH - GRID_SIZE and \
                                           0 <= new_y <= SIMULATION_AREA_HEIGHT - GRID_SIZE:
                                            # 检查该位置是否有生物体（确保是空白位置）
                                            if not self.find_organism_at_position(new_x + GRID_SIZE/2, new_y + GRID_SIZE/2):
                                                empty_positions.append((new_x, new_y))
                                
                                # 如果有空闲位置，随机选择一个放置新植物
                                if empty_positions:
                                    new_x, new_y = random.choice(empty_positions)
                                    new_organism.x = new_x
                                    new_organism.y = new_y
                                    # 繁殖成功，让母植物消耗繁殖能量
                                    reproduction_cost = get_setting('producer', 'reproduction_cost', 30)
                                    organism.consume_energy(reproduction_cost)
                                    # 添加新植物到生物体列表
                                    self.organisms.append(new_organism)
                                    # 繁殖成功，重置繁殖间隔计数器
                                    if hasattr(organism, 'frame_since_last_reproduction'):
                                        organism.frame_since_last_reproduction = 0
                                    reproduction_count += 1
                                else:
                                    # 如果没有找到空位置，部分重置繁殖间隔计数器
                                    if hasattr(organism, 'frame_since_last_reproduction') and hasattr(organism, 'reproduction_interval'):
                                        organism.frame_since_last_reproduction = max(0, organism.frame_since_last_reproduction - organism.reproduction_interval // 2)
                                continue  # 继续下一个生物体的处理
                            # 对于非生产者，直接添加到生物体列表
                            self.organisms.append(new_organism)
                            
                            # 繁殖成本已经在reproduce方法中处理，不需要在这里重复消耗能量
                            reproduction_count += 1
        
        # 如果有繁殖成功，更新统计信息
        if reproduction_count > 0:
            # 可以在这里添加繁殖统计信息，但不打印调试日志
            pass

    
    def _handle_organism_movement(self, organism: BaseOrganism) -> None:
        """
        处理生物体移动
        
        参数：
            organism: 要移动的生物体
        """
        # 只有可移动的生物体才需要处理移动
        if hasattr(organism, 'should_move') and organism.should_move():
            organism.attempted_move = True
            # 确定目标和危险类型
            target_types = organism.get_target_types()
            danger_types = organism.get_danger_types()
            
            # 找到附近的目标和危险
            # 过滤目标类型
            obstacles = [o for o in self.organisms if isinstance(o, Water) and o.is_alive()] + [o for o in self.organisms if isinstance(o, Rock) and o.is_alive()]
            potential_targets_all = [t for t in self.organisms if any(isinstance(t, target_type) for target_type in target_types)]
            # 对目标进行半径粗过滤，减少后续计算量
            detection_radius_px = organism.get_detection_radius() * GRID_SIZE if hasattr(organism, 'get_detection_radius') else 0
            ox, oy = organism.x, organism.y
            def within_radius(tx, ty):
                dx = abs(ox - tx)
                dy = abs(oy - ty)
                dx = min(dx, SIMULATION_AREA_WIDTH - dx)
                dy = min(dy, SIMULATION_AREA_HEIGHT - dy)
                return dx <= detection_radius_px and dy <= detection_radius_px
            potential_targets = [t for t in potential_targets_all if within_radius(t.x, t.y)]
            
            # 过滤危险类型（通常数量较少，无需预过滤）
            potential_dangers = [d for d in self.organisms if any(isinstance(d, danger_type) for danger_type in danger_types)]
            
            # 传递位置元组而不是生物体对象
            organism_pos = (organism.x, organism.y)
            
            # 准备障碍物列表：岩石、植物和水
            obstacles = []
            if self.organisms:
                obstacles.extend([o for o in self.organisms if isinstance(o, (Rock, Producer, Water)) and o.is_alive()])
            
            # 确定生物体类型和检测类型
            is_herbivore = isinstance(organism, Herbivore)
            
            # 对于食草动物，其目标是植物，属于食物检测
            is_food_detection = is_herbivore and potential_targets and isinstance(potential_targets[0], Producer)
            
            targets = find_nearby_targets(
                organism_pos,
                potential_targets,
                organism.get_detection_radius(),
                obstacles,
                is_herbivore=is_herbivore,
                is_food_detection=is_food_detection
            )
            # 遮挡检查已在find_nearby_targets函数中实现，不再需要这里的重复检查
            
            dangers = find_nearby_dangers(
                organism_pos,
                potential_dangers,
                organism.get_danger_detection_radius(),
                obstacles,
                is_herbivore=is_herbivore
            )
            # 遮挡检查已在find_nearby_dangers函数中实现，不再需要这里的重复检查
            
            # 检测到的目标和危险
            has_food = len(targets) > 0
            has_danger = len(dangers) > 0
            
            # 保存检测状态到生物体
            organism.detected_food = has_food
            organism.detected_danger = has_danger
            
            # 触发移动间隔调整方法
            # 对草食动物调用危险检测调整方法
            if hasattr(organism, 'set_danger_detection'):
                organism.set_danger_detection(has_danger)
            # 对肉食动物调用目标检测调整方法
            if hasattr(organism, 'set_target_detection'):
                organism.set_target_detection(has_food)
            
            # 移动生物体
            # 获取生物体类的移动参数
            organism_type = organism.__class__.__name__.lower()
            follow_prob = get_setting(organism_type, 'follow_probability', 50) / 100.0
            # 为不同类型动物设置合适的默认跟踪距离
            if organism_type == 'herbivore':
                follow_dist = get_setting(organism_type, 'follow_distance', 30)  # 草食动物默认跟踪距离
            else:
                follow_dist = get_setting(organism_type, 'follow_distance', 20)
            
            # 获取同类生物体
            same_species = [o for o in self.organisms if isinstance(o, organism.__class__) and o != organism and o.is_alive()]
            
            # 调用移动函数，接收返回值
            # 设置障碍（植物）以便肉食动物绕开（复用上方已计算）
            moved, new_pos = move_towards_targets_or_random(
                organism,
                targets,
                follow_prob,
                follow_dist,
                same_species,
                dangers,
                obstacles,
                max_width=SIMULATION_AREA_WIDTH,
                max_height=SIMULATION_AREA_HEIGHT
            )
            
            # 更新位置
            if moved:
                # 记录上一位置用于碰撞回退
                if not hasattr(organism, 'prev_x'):
                    organism.prev_x = organism.x
                    organism.prev_y = organism.y
                else:
                    organism.prev_x = organism.x
                    organism.prev_y = organism.y
                new_x, new_y = new_pos
                organism.x = new_x
                organism.y = new_y
                organism.stuck_frames = 0
                try:
                    from config.constants import FPS
                    duration = 10.0 / FPS
                except Exception:
                    duration = 0.3
                # 斜向移动动画时长按√2倍，保持视觉速度一致
                if hasattr(organism, 'start_move_animation'):
                    is_diagonal = (organism.prev_x != new_x) and (organism.prev_y != new_y)
                    anim_duration = duration * (2 ** 0.5) if is_diagonal else duration
                    organism.start_move_animation((organism.prev_x, organism.prev_y), (new_x, new_y), anim_duration)
            
            # 减少能量消耗
            if hasattr(organism, 'consume_energy'):
                move_energy_cost = get_setting(
                    organism.__class__.__name__.lower(), 
                    'move_energy_cost', 
                    1.0
                )
                organism.consume_energy(move_energy_cost)
        else:
            organism.attempted_move = False
    
    def _cleanup_dead_organisms(self) -> None:
        """
        清理死亡的生物体，并根据能量转移率在原地生成植物
        """
        alive_organisms = []
        dead_organisms = []
        
        # 分离存活和死亡的生物体
        for organism in self.organisms:
            if organism.is_alive():
                alive_organisms.append(organism)
            else:
                dead_organisms.append(organism)
        
        # 处理死亡生物体：根据能量转移率在原地生成植物
        energy_transfer_rate = get_setting('general', 'energy_transfer_rate', 0.7)
        for dead_organism in dead_organisms:
            # 只有因为能量耗尽死亡的生物才可能生成植物
            # 检查是否是因为能量不足导致死亡（energy <= 0）
            if hasattr(dead_organism, 'energy') and dead_organism.energy <= 0:
                # 根据能量转移率决定是否生成新植物
                if random.random() < energy_transfer_rate:
                    # 在死亡生物的位置创建新植物
                    new_producer = Producer(dead_organism.x, dead_organism.y)
                    new_producer.generation = 0
                    alive_organisms.append(new_producer)
        
        # 更新生物体列表，只保留存活的生物体和新生成的植物
        self.organisms = alive_organisms
    
    def _record_population_stats(self) -> None:
        """
        记录人口统计信息
        """
        counts = self.get_organism_counts()
        for organism_type in ['producer', 'herbivore', 'carnivore']:
            self.population_history[organism_type].append(
                counts.get(organism_type, 0)
            )
    
    def _maintain_population_balance(self) -> None:
        """
        维持种群平衡
        """
        # 获取当前各类型生物数量
        counts = self.get_organism_counts()
        
        # 自动添加生产者（如果数量太少）
        producer_min = get_setting('producer', 'min_count', 10)
        if counts.get('producer', 0) < producer_min:
            needed = producer_min - counts.get('producer', 0)
            for _ in range(needed):
                # 确保生成的位置在有效范围内，并且避免在已有生物体的位置生成
                max_attempts = 100  # 最大尝试次数，防止无限循环
                attempts = 0
                while attempts < max_attempts:
                    x = random.randint(0, (SIMULATION_AREA_WIDTH - GRID_SIZE) // GRID_SIZE) * GRID_SIZE
                    y = random.randint(0, (SIMULATION_AREA_HEIGHT - GRID_SIZE) // GRID_SIZE) * GRID_SIZE
                    
                    # 检查该位置是否已有生物体
                    if not self.find_organism_at_position(x + GRID_SIZE/2, y + GRID_SIZE/2):
                        producer = Producer(x, y)
                        producer.generation = 0
                        self.organisms.append(producer)
                        break
                    attempts += 1
        
        # 自动添加草食动物（如果数量太少且有足够的生产者）
        herbivore_min = get_setting('herbivore', 'min_count', 5)
        if counts.get('herbivore', 0) < herbivore_min and counts.get('producer', 0) > 10:
            needed = herbivore_min - counts.get('herbivore', 0)
            for _ in range(needed):
                x = random.randint(0, SIMULATION_AREA_WIDTH - GRID_SIZE)
                y = random.randint(0, SIMULATION_AREA_HEIGHT - GRID_SIZE)
                herbivore = Herbivore(x, y)
                herbivore.generation = 0
                self.organisms.append(herbivore)
        
        # 限制肉食动物数量（如果数量太多）
        carnivore_max = get_setting('carnivore', 'max_count', 20)
        if counts.get('carnivore', 0) > carnivore_max:
            # 移除多余的肉食动物
            carnivores = [o for o in self.organisms if o.__class__.__name__ == 'Carnivore']
            excess = len(carnivores) - carnivore_max
            for _ in range(excess):
                if carnivores:
                    # 移除能量最低的肉食动物
                    carnivores.sort(key=lambda o: o.energy)
                    self.organisms.remove(carnivores[0])
                    carnivores.pop(0)
    
    def find_organism_at_position(self, x: float, y: float) -> Optional[BaseOrganism]:
        """
        查找指定位置的生物体（支持循环边界检测）
        
        参数：
            x: 世界坐标x
            y: 世界坐标y
        
        返回：
            找到的生物体，未找到返回None
        """
        # 对坐标应用循环边界处理
        x = x % SIMULATION_AREA_WIDTH
        y = y % SIMULATION_AREA_HEIGHT
        
        for organism in reversed(self.organisms):
            if organism.is_alive():
                # 检查生物体是否在指定位置的网格内
                # 使用精确的边界检查，确保正确识别生物体位置
                if (organism.x <= x <= organism.x + GRID_SIZE and 
                    organism.y <= y <= organism.y + GRID_SIZE):
                    return organism
        return None
    
    def get_organism_at_position(self, screen_pos: Tuple[int, int]) -> Optional[BaseOrganism]:
        """
        通过屏幕坐标查找生物体
        
        参数：
            screen_pos: 屏幕坐标位置
        
        返回：
            找到的生物体，未找到返回None
        """
        from utils.coordinate import unscale_point
        world_x, world_y = unscale_point(screen_pos, self.zoom, self.offset)
        return self.find_organism_at_position(world_x, world_y)
    
    def get_organism_counts(self) -> Dict[str, int]:
        """
        获取各类型生物体数量
        
        返回：
            各类型生物体的数量统计
        """
        counts = {
            'producer': 0,
            'herbivore': 0,
            'carnivore': 0,
            'water': 0,
            'rock': 0
        }
        
        for organism in self.organisms:
            if organism.is_alive():
                organism_type = organism.__class__.__name__.lower()
                if organism_type in counts:
                    counts[organism_type] += 1
        
        return counts
    
    def get_ecosystem_stats(self) -> Dict[str, Any]:
        """
        获取生态系统统计信息
        
        返回：
            包含各种统计信息的字典
        """
        counts = self.get_organism_counts()
        return {
            'population': counts,
            'max_generations': self.generation_count,
            'time_elapsed': self.time_elapsed,
            'cycle_count': self.cycle_count,
            'total_organisms': sum(counts.values())
        }
    
    def export_population_history(self) -> Dict[str, List[int]]:
        """
        导出人口历史记录
        
        返回：
            各类型生物体的历史数量记录
        """
        return self.population_history.copy()
    
    def reset(self):
        """
        重置模拟
        """
        self.initialize_simulation()
    
    def __del__(self):
        """析构函数，确保保存配置并取消注册监听器"""
        try:
            # 取消注册配置更新监听器
            if hasattr(self, '_config_listener'):
                remove_config_listener(self._config_listener)
        except Exception as e:
            print(f"清理监听器失败: {e}")
    
    def _handle_config_update(self, category, key, new_value):
        """
        处理配置更新的回调方法
        
        Args:
            category: 配置类别
            key: 配置键
            new_value: 新的配置值
        """
        # 记录配置更新日志
        print(f"配置已更新: {category}.{key} = {new_value}")
    
    def refresh_all_organism_configs(self):
        """
        刷新所有生物实例的配置
        当配置更新时，调用此方法以确保所有生物实例使用最新配置
        """
        producers, herbivores, carnivores = self._classify_organisms()
        
        # 刷新所有生产者配置
        for producer in producers:
            producer.update_config()
        
        # 刷新所有草食动物配置
        for herbivore in herbivores:
            herbivore.update_config()
        
        # 刷新所有肉食动物配置
        for carnivore in carnivores:
            carnivore.update_config()
        
        print(f"已刷新所有生物配置: {len(producers)} 生产者, {len(herbivores)} 草食动物, {len(carnivores)} 肉食动物")

    def _classify_organisms(self):
        """分类当前存活生物体为三类列表"""
        producers = [o for o in self.organisms if isinstance(o, Producer) and o.is_alive()]
        herbivores = [o for o in self.organisms if isinstance(o, Herbivore) and o.is_alive()]
        carnivores = [o for o in self.organisms if isinstance(o, Carnivore) and o.is_alive()]
        return producers, herbivores, carnivores

    def _classify_organisms_extended(self):
        producers = [o for o in self.organisms if isinstance(o, Producer) and o.is_alive()]
        herbivores = [o for o in self.organisms if isinstance(o, Herbivore) and o.is_alive()]
        carnivores = [o for o in self.organisms if isinstance(o, Carnivore) and o.is_alive()]
        waters = [o for o in self.organisms if isinstance(o, Water) and o.is_alive()]
        rocks = [o for o in self.organisms if isinstance(o, Rock) and o.is_alive()]
        return producers, herbivores, carnivores, waters, rocks

    def _is_occluded_by_plants(self, src: Tuple[int, int], dst: Tuple[int, int], plants: set) -> bool:
        # 快速路径：如果源点和目标点相同，或者植物集合为空，则没有遮挡
        if src == dst or not plants:
            return False
            
        sx, sy = src
        dx, dy = dst
        
        # 直接使用网格坐标计算，避免浮点数运算
        src_grid = (sx // GRID_SIZE, sy // GRID_SIZE)
        dst_grid = (dx // GRID_SIZE, dy // GRID_SIZE)
        
        # 使用简化的Bresenham算法检查路径上的网格点
        dx_grid = dst_grid[0] - src_grid[0]
        dy_grid = dst_grid[1] - src_grid[1]
        
        # 检查直线路径上的每个网格点（不包括起点和终点）
        x, y = src_grid
        dx_abs, dy_abs = abs(dx_grid), abs(dy_grid)
        
        # 避免过多步骤，设置最大检查步数为20
        max_steps = min(20, max(dx_abs, dy_abs) + 1)
        
        if dx_abs >= dy_abs:
            # 水平为主方向
            for i in range(1, max_steps):
                if i > dx_abs:
                    break
                x = src_grid[0] + (i if dx_grid > 0 else -i)
                # 根据斜率计算y
                y = src_grid[1] + int((dy_grid / dx_abs) * i) if dx_abs > 0 else src_grid[1]
                # 转换回像素坐标
                check_pos = (x * GRID_SIZE, y * GRID_SIZE)
                if check_pos in plants:
                    return True
        else:
            # 垂直为主方向
            for i in range(1, max_steps):
                if i > dy_abs:
                    break
                y = src_grid[1] + (i if dy_grid > 0 else -i)
                # 根据斜率计算x
                x = src_grid[0] + int((dx_grid / dy_abs) * i) if dy_abs > 0 else src_grid[0]
                # 转换回像素坐标
                check_pos = (x * GRID_SIZE, y * GRID_SIZE)
                if check_pos in plants:
                    return True
                    
        return False
    def _update_stuck_status(self):
        for o in self.organisms:
            if not o.is_alive():
                continue
            if o.__class__.__name__ not in ('Herbivore', 'Carnivore'):
                continue
            attempted = getattr(o, 'attempted_move', False)
            if attempted and hasattr(o, 'prev_x') and hasattr(o, 'prev_y'):
                if o.x == o.prev_x and o.y == o.prev_y:
                    o.stuck_frames = getattr(o, 'stuck_frames', 0) + 1
                    if o.stuck_frames >= 600:
                        o.dead = True
                else:
                    o.stuck_frames = 0
            o.attempted_move = False

    def _create_obstacle_clusters(self):
        count_water = random.randint(2, 3)
        count_rock = random.randint(3, 5)
        occupied = {(o.x, o.y) for o in self.organisms}
        
        def grow_irregular_cluster(max_tiles: int, is_water: bool = False) -> list:
            seeds = []
            # 随机选择起始点
            x = random.randint(0, (SIMULATION_AREA_WIDTH - GRID_SIZE) // GRID_SIZE) * GRID_SIZE
            y = random.randint(0, (SIMULATION_AREA_HEIGHT - GRID_SIZE) // GRID_SIZE) * GRID_SIZE
            
            if (x, y) in occupied:
                return seeds
            
            seeds.append((x, y))
            # 使用栈而不是队列，这样会产生更不规则的分支形状
            frontier = [(x, y)]
            
            # 对于水域，使用稍小的最小瓦片数，岩石保持原样
            min_tiles = max_tiles // 2 if is_water else max_tiles // 3
            
            while frontier and len(seeds) < max_tiles:
                # 随机从边界中选择一个点，而不是总是从开始选择
                fx, fy = random.choice(frontier)
                
                # 包含对角线方向，使形状更加不规则
                neighbors = [
                    (-GRID_SIZE, 0), (GRID_SIZE, 0), (0, -GRID_SIZE), (0, GRID_SIZE),
                    (-GRID_SIZE, -GRID_SIZE), (-GRID_SIZE, GRID_SIZE), 
                    (GRID_SIZE, -GRID_SIZE), (GRID_SIZE, GRID_SIZE)
                ]
                
                random.shuffle(neighbors)
                
                for dx, dy in neighbors:
                    # 对于对角线移动，需要特别处理，确保在边界内
                    if dx in (-GRID_SIZE, GRID_SIZE) and dy in (-GRID_SIZE, GRID_SIZE):
                        # 50%的概率生成对角线邻居，增加不规则性
                        if random.random() > 0.5:
                            continue
                    
                    nx = (fx + dx) % SIMULATION_AREA_WIDTH
                    ny = (fy + dy) % SIMULATION_AREA_HEIGHT
                    nx = (nx // GRID_SIZE) * GRID_SIZE
                    ny = (ny // GRID_SIZE) * GRID_SIZE
                    
                    # 随机决定是否添加这个邻居，使形状更加不规则
                    if (nx, ny) not in occupied and (nx, ny) not in seeds:
                        # 当接近最小瓦片数时，提高添加概率
                        prob = 0.3 + (0.7 * min(len(seeds) / min_tiles, 1.0)) if len(seeds) < max_tiles else 0.5
                        if random.random() < prob:
                            seeds.append((nx, ny))
                            frontier.append((nx, ny))
                            if len(seeds) >= max_tiles:
                                break
                
                # 随机移除一些边界点，创建缺口，使形状更加不规则
                if len(frontier) > 5 and random.random() < 0.3:
                    # 从边界中移除1-2个点
                    remove_count = random.randint(1, 2)
                    for _ in range(remove_count):
                        if frontier:
                            frontier.pop(random.randrange(len(frontier)))
                
                if len(seeds) >= max_tiles:
                    break
            
            return seeds
        
        # 生成水域集群
        for _ in range(count_water):
            tiles = grow_irregular_cluster(100, True)
            for (wx, wy) in tiles:
                w = Water(wx, wy)
                self.organisms.append(w)
                occupied.add((wx, wy))
        
        # 生成岩石集群
        for _ in range(count_rock):
            # 随机调整岩石集群大小，使其更加多样化
            rock_size = random.randint(20, 35)
            tiles = grow_irregular_cluster(rock_size, False)
            for (rx, ry) in tiles:
                r = Rock(rx, ry)
                self.organisms.append(r)
                occupied.add((rx, ry))

    def _spawn_plants_near_water(self):
        waters = [o for o in self.organisms if isinstance(o, Water) and o.is_alive()]
        if not waters:
            return
        for w in waters:
            if random.random() < 0.1:
                candidates = []
                for dx in [-GRID_SIZE, 0, GRID_SIZE]:
                    for dy in [-GRID_SIZE, 0, GRID_SIZE]:
                        if dx == 0 and dy == 0:
                            continue
                        nx = (w.x + dx) % SIMULATION_AREA_WIDTH
                        ny = (w.y + dy) % SIMULATION_AREA_HEIGHT
                        nx = (nx // GRID_SIZE) * GRID_SIZE
                        ny = (ny // GRID_SIZE) * GRID_SIZE
                        if not self.find_organism_at_position(nx + GRID_SIZE/2, ny + GRID_SIZE/2):
                            candidates.append((nx, ny))
                if candidates:
                    px, py = random.choice(candidates)
                    self.organisms.append(Producer(px, py))
