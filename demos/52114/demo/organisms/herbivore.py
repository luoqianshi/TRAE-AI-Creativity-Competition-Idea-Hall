import random
import pygame
from config import GRID_SIZE, BLUE, YELLOW, get_setting
from .base_organism import BaseOrganism
from utils.coordinate import scale_point
from pathfinding import move_towards_targets_or_random
from config.settings import get_setting

class Herbivore(BaseOrganism):
    """草食动物类"""
    def __init__(self, x: int, y: int, initial_energy=None, max_energy=None, move_interval=None, eigenvalue_vision=None):
        super().__init__("herbivore")
        # 覆盖随机位置，使用传入的坐标
        self.x = x
        self.y = y
        # 设置能量属性
        self.initial_energy = initial_energy if initial_energy is not None else get_setting('herbivore', 'initial_energy', 500)
        self.max_energy = max_energy if max_energy is not None else get_setting('herbivore', 'max_energy', 1000)
        self.energy = self.initial_energy
        # 草食动物特有属性
        self.children = 0  # 后代计数
        self.actions = 0  # 动作计数器，用于控制移动间隔
        self.age = 0.0
        self.move_count = 0
        self.detected_danger = False  # 标记是否检测到危险
        self.wiggle_time = 0  # 用于小方块蠕动效果的时间变量
        # 视力特征值：(-1, 1)区间的随机两位小数
        # 如果没有提供，生成随机值
        if eigenvalue_vision is None:
            # 生成-1到1之间的随机两位小数
            self.eigenvalue_vision = round(random.uniform(-1, 1), 2)
        else:
            # 确保传入的值在合理范围内
            self.eigenvalue_vision = max(-0.99, min(0.99, eigenvalue_vision))
        # 移动间隔（帧）：值越小移动越频繁，越快
        if move_interval is not None:
            # 确保移动间隔在合理范围内
            min_interval = get_setting('movement', 'min_move_interval', 1)
            max_interval = get_setting('movement', 'max_move_interval', 10)
            self.move_interval = max(min_interval, min(max_interval, move_interval))
        else:
            # 初始默认移动间隔
            self.move_interval = get_setting('herbivore', 'move_interval', 2)
        # 保存原始移动间隔
        self.original_move_interval = self.move_interval
        # 去同步初始移动帧相位，避免群体同拍
        try:
            import random as _r
            self.frame_counter = _r.randint(0, max(1, self.move_interval - 1))
        except Exception:
            pass
    
    def gain_energy(self, amount):
        """增加能量，不超过最大值"""
        self.energy = min(self.energy + amount, self.max_energy)
        
    def consume_energy(self, amount):
        """消耗能量，能量不足时设置为死亡状态"""
        self.energy -= amount
        if self.energy <= 0:
            self.dead = True
            self.energy = 0
    
    def should_move(self) -> bool:
        """检查是否应该在当前帧移动"""
        return self.actions % self.move_interval == 0
    
    def move(self, target_organisms=None, same_species=None, dangers=None, follow_prob=None):
        """草食动物移动"""
        # 检查是否应该在当前帧移动
        if not self.should_move() or not self.is_alive():
            return False
        
        # 使用pathfinding模块进行移动
        # 从get_detection_radius方法获取基于视力特征值调整后的检测距离
        follow_dist = self.get_detection_radius()
        
        # 确保follow_prob有有效值
        if follow_prob is None:
            follow_prob = get_setting('herbivore', 'follow_probability', 70) / 100
        
        # 调用寻路模块的移动函数
        moved, new_pos = move_towards_targets_or_random(
            self,
            target_organisms or [],
            follow_prob,
            follow_dist,
            same_species or []
        )
        
        # 更新位置
        if moved:
            self.move_count += 1
            prev_x, prev_y = self.x, self.y
            self.x, self.y = new_pos
            # 消耗能量 - 使用基于移动间隔的计算公式
            frequency_based_cost = max(0, int(12 * ((1 - (self.move_interval - 1) / 19) ** 1.5)))
            # 斜向移动额外消耗，保持视觉速度一致
            if prev_x != self.x and prev_y != self.y:
                frequency_based_cost = int(frequency_based_cost * (2 ** 0.5))
            self.consume_energy(frequency_based_cost)
        
        return moved
    
    def eat(self, producers) -> tuple[bool, int]:
        if not self.is_alive():
            return False, 0
            
        print(f"[调试-进食] 食草动物({self.x},{self.y})：尝试进食，当前能量={self.energy}")
        
        # 检查当前位置是否有植物
        if not producers:
            print(f"[调试-进食] 食草动物({self.x},{self.y})：当前位置无植物可食")
            self.has_eaten_this_update = False
            print(f"[调试-进食] 食草动物({self.x},{self.y})：设置进食标志为False")
            return False, 0
            
        for producer in producers[:]:  # 使用副本进行迭代
            if producer.x == self.x and producer.y == self.y and producer.is_alive():
                print(f"[调试-进食] 食草动物({self.x},{self.y})：找到可食用植物，植物能量={producer.energy}")
                
                # 获取食草动物的energy_from_food值
                energy_from_food = get_setting('herbivore', 'energy_from_food', 50)
                
                # 根据植物当前能量和energy_from_food确定实际获取的能量
                if producer.energy <= energy_from_food:
                    # 如果植物能量小于等于energy_from_food，仅获取植物当前能量
                    energy_gain = producer.energy
                else:
                    # 如果植物能量大于energy_from_food，仅获取energy_from_food值
                    energy_gain = energy_from_food
                
                print(f"[调试-进食] 食草动物({self.x},{self.y})：获取能量={energy_gain}")
                
                # 恢复食草动物的能量（不超过最大值）
                self.gain_energy(energy_gain)
                print(f"[调试-进食] 食草动物({self.x},{self.y})：进食后能量={self.energy}")
                
                # 植物扣除与食草动物获得相同的能量
                producer.consume_energy(energy_gain)
                
                # 只有当植物能量小于等于0时，才标记为死亡
                if producer.energy <= 0:
                    producer.dead = True
                    print(f"[调试-进食] 食草动物({self.x},{self.y})：植物被完全消耗")
                
                # 设置进食成功标志，用于控制繁殖时机
                self.has_eaten_this_update = True
                print(f"[调试-进食] 食草动物({self.x},{self.y})：设置进食标志为True")
                
                return True, energy_gain
        
        # 如果没有进食，设置标志为False
        print(f"[调试-进食] 食草动物({self.x},{self.y})：未找到可食用植物")
        self.has_eaten_this_update = False
        print(f"[调试-进食] 食草动物({self.x},{self.y})：设置进食标志为False")
        return False, 0
    
    def can_reproduce(self) -> bool:
        """
        判断是否可以繁殖
        返回True表示可以繁殖，False表示不能繁殖
        """
        # 确保has_eaten_this_update属性存在
        if not hasattr(self, 'has_eaten_this_update'):
            self.has_eaten_this_update = False
            print(f"[调试-繁殖] 食草动物({self.x},{self.y})：初始化has_eaten_this_update为False")
            
        # 直接从类实例获取min_energy_for_reproduction，确保使用正确的值
        min_energy = getattr(self, 'min_energy_for_reproduction', 300)
        print(f"[调试-繁殖] 食草动物({self.x},{self.y})：能量={self.energy}, 最小繁殖能量={min_energy}, 是否已进食={self.has_eaten_this_update}")
        
        # 检查基础繁殖条件 - 这是最关键的判断
        has_enough_energy = self.energy >= min_energy
        has_eaten = self.has_eaten_this_update
        base_condition = has_enough_energy and has_eaten
        
        print(f"[调试-繁殖] 基础条件分解：能量充足={has_enough_energy}, 已进食={has_eaten}, 组合条件={base_condition}")
        
        # 如果基础条件不满足，直接返回False
        if not base_condition:
            if not has_enough_energy:
                print(f"[调试-繁殖] 食草动物({self.x},{self.y})：能量不足，无法繁殖")
            elif not has_eaten:
                print(f"[调试-繁殖] 食草动物({self.x},{self.y})：未进食，无法繁殖")
            return False
        
        print(f"[调试-繁殖] 食草动物({self.x},{self.y})：基础繁殖条件满足！")
        
        # 计算繁殖概率
        max_energy = get_setting('herbivore', 'max_energy', 1000)
        reproduction_probability = get_setting('herbivore', 'reproduction_probability', 10) / 100
        
        # 繁殖概率与当前能量成正比
        probability = (self.energy / max_energy) * reproduction_probability/100
        
        # 恢复随机数判断逻辑
        random_value = random.random()
        result = random_value < probability
        
        print(f"[调试-繁殖] 食草动物({self.x},{self.y})：繁殖概率={probability:.4f}, 随机值={random_value:.4f}, 繁殖结果={'成功' if result else '失败'}")
        
        return result
    
    def reproduce(self) -> 'Herbivore':
        """草食动物繁殖"""
        if not self.can_reproduce():
            return None
        
        # 获取系统设置的初始能量作为后代能量
        offspring_initial_energy = get_setting('herbivore', 'initial_energy', 50)
        # 计算父代需要扣除的能量：子代初始能量的1.5倍
        energy_cost = int(offspring_initial_energy * 1.5)
        
        # 重置进食标志，避免连续繁殖
        self.has_eaten_this_update = False
        
        # 确保后代坐标位于网格中心点
        # 计算父代位置所在网格的索引
        grid_x = self.x // GRID_SIZE
        grid_y = self.y // GRID_SIZE
        # 转换回网格中心点坐标
        centered_x = grid_x * GRID_SIZE
        centered_y = grid_y * GRID_SIZE
        
        # 决定后代的视力特征值
        # 70%概率继承父代的eigenvalue_vision，30%概率生成新的随机值
        if random.random() < 0.7:
            # 继承父代的视力特征值
            offspring_eigenvalue_vision = self.eigenvalue_vision
        else:
            # 生成新的随机视力特征值
            offspring_eigenvalue_vision = round(random.uniform(-1, 1), 2)
        
        # 创建新的草食动物 - 继承父代的移动间隔和可能的视力特征值，但使用网格中心点坐标
        new_herbivore = Herbivore(centered_x, centered_y, 
                                 initial_energy=offspring_initial_energy,
                                 max_energy=self.max_energy,
                                 move_interval=self.move_interval,
                                 eigenvalue_vision=offspring_eigenvalue_vision)
        new_herbivore.generation = self.generation + 1
        # 减少父代能量：扣除子代初始能量的1.5倍
        self.consume_energy(energy_cost)
        # 增加后代计数
        self.children += 1
        return new_herbivore
    
    def draw(self, screen, screen_x, screen_y, zoom, selected: bool = False):
        import math
        # 生物尺寸设置
        BIG_BLOCK_SIZE = (20, 15)  # 主体大方块
        SMALL_BLOCK_SIZE = (3, 3)  # 小方块
        SMALL_BLOCK_COUNT = 4      # 小方块数量
        
        # 小方块相对于大方块的基础位置（下方排成一行，直接连接）
        small_base_positions = [
            (1, BIG_BLOCK_SIZE[1]),
            (6, BIG_BLOCK_SIZE[1]),
            (12, BIG_BLOCK_SIZE[1]),
            (17, BIG_BLOCK_SIZE[1])
        ]
        
        # 根据能量计算缩放比例
        energy_ratio = min(self.energy / self.max_energy, 1.0)
        scale = 0.3 + 0.9 * energy_ratio
        
        # 计算实际方块尺寸（考虑缩放和能量影响）
        scaled_big_width = int(BIG_BLOCK_SIZE[0] * scale * zoom)
        scaled_big_height = int(BIG_BLOCK_SIZE[1] * scale * zoom)
        scaled_small_width = int(SMALL_BLOCK_SIZE[0] * scale * zoom)
        scaled_small_height = int(SMALL_BLOCK_SIZE[1] * scale * zoom)
        
        # 计算大方块的左上角位置（居中显示）
        big_x = int(screen_x - scaled_big_width / 2)
        big_y = int(screen_y - scaled_big_height / 2)
        
        # 绘制大方块主体
        pygame.draw.rect(
            screen, BLUE,
            (big_x, big_y, scaled_big_width, scaled_big_height)
        )
        
        # 绘制选中状态（边框）
        if selected:
            pygame.draw.rect(
                screen, (255, 255, 0),
                (big_x, big_y, scaled_big_width, scaled_big_height),
                2  # 线宽
            )
        
        # 绘制4个小方块（带蠕动效果）
        for i in range(SMALL_BLOCK_COUNT):
            # 计算蠕动偏移量（仅水平方向）
            wiggle_horizontal = math.cos(self.wiggle_time + i * 0.5) * 0.5  # 水平偏移
            
            # 计算小方块位置（仅考虑水平蠕动效果）
            small_x = big_x + int(small_base_positions[i][0] * scale) + wiggle_horizontal
            small_y = big_y + int(small_base_positions[i][1] * scale)  # 无垂直偏移
            
            # 绘制小方块
            pygame.draw.rect(
                screen, BLUE,
                (small_x, small_y, scaled_small_width, scaled_small_height)
            )
    
    def get_info(self):
        er = min(self.energy / self.max_energy, 1.0)
        # 获取当前检测状态
        detected_food = getattr(self, 'detected_food', False)
        detected_danger = getattr(self, 'detected_danger', False)
        
        # 计算当前繁殖概率
        reproduction_prob = get_setting('herbivore', 'reproduction_probability', 30)
        actual_probability = er * (reproduction_prob / 100)
        
        return {
            "类型": "草食动物",
            "位置": f"({self.x}, {self.y})",
            "能量": f"{int(self.energy)}/{int(self.max_energy)}",
            "能量比": f"{er:.2f}",
            "年龄": f"{self.age:.1f}",
            "世代": self.generation,
            "基础移动间隔": f"{getattr(self, 'original_move_interval', self.move_interval)}帧",
            "实时移动间隔": f"{self.move_interval}帧",
            "移动次数": getattr(self, 'move_count', 0),
            "视力特征值": f"{self.eigenvalue_vision:.2f}",
            "食物感知距离": self.get_detection_radius(),
            "危险感知距离": self.get_danger_detection_radius(),
            "检测到食物": "是" if detected_food else "否",
            "检测到危险": "是" if detected_danger else "否",
            "后代数量": self.children,
            "繁殖概率": f"{actual_probability:.4f} ({actual_probability*100:.2f}%)",
            "繁殖条件满足": "是" if (self.energy >= get_setting('herbivore', 'min_energy_for_reproduction', 300) and getattr(self, 'has_eaten_this_update', False)) else "否"
        }
    
    def update(self, delta_time=1.0):
        """更新草食动物状态"""
        if not self.is_alive():
            return
            
        # 添加更新开始的调试日志
        current_has_eaten = getattr(self, 'has_eaten_this_update', None)
        print(f"[调试-更新] 食草动物({self.x},{self.y})：更新开始，当前能量={self.energy}，进食标志状态={current_has_eaten}")
            
        # 重置进食标志，确保每个更新周期开始时为False
        self.has_eaten_this_update = False
        print(f"[调试-更新] 食草动物({self.x},{self.y})：重置进食标志为False")
            
        # 调用父类的update方法进行位置校准
        super().update(delta_time)
        
        # 更新蠕动动画时间
        self.wiggle_time += delta_time * 2  # 调整蠕动速度
        
        self.actions = getattr(self, 'actions', 0) + 1
        
        # 只进行基础能量消耗的扣减
        base_cost = get_setting('herbivore', 'base_energy_consumption', 1)
        self.consume_energy(base_cost * delta_time)
        
        # 确保original_move_interval已初始化
        if not hasattr(self, 'original_move_interval'):
            self.original_move_interval = self.move_interval
        
        # 能量不足时降低移动频率（在无危险时生效）
        if hasattr(self, 'energy') and hasattr(self, 'max_energy'):
            if self.energy < self.max_energy * 0.3 and not getattr(self, 'detected_danger', False):
                self.move_interval = min(int(self.original_move_interval * 2), 20)
            elif not getattr(self, 'detected_danger', False):
                # 能量恢复且无危险，恢复基础移动间隔
                self.move_interval = self.original_move_interval
    
    def set_danger_detection(self, danger_detected):
        """
        设置危险检测状态并调整移动间隔
        当检测到危险时，move_interval=max(move_interval/1.5,1)
        当危险解除时，恢复原始移动间隔
        
        Args:
            danger_detected: 是否检测到危险
        """
        # 确保original_move_interval已初始化
        if not hasattr(self, 'original_move_interval'):
            self.original_move_interval = self.move_interval
        
        # 如果危险检测状态改变
        if danger_detected != self.detected_danger:
            self.detected_danger = danger_detected
            
            if danger_detected:
                # 检测到危险，移动间隔缩短，但不小于1
                self.move_interval = max(int(self.original_move_interval / 1.5), 1)
            else:
                # 危险解除，恢复原始移动间隔
                self.move_interval = self.original_move_interval
    
    def get_target_types(self):
        """获取目标生物类型"""
        from organisms import Producer
        return [Producer]
    
    def get_danger_types(self):
        """获取危险生物类型"""
        from organisms import Carnivore
        return [Carnivore]
    
    def get_detection_radius(self):
        """获取目标检测半径，基于视力特征值调整"""
        base_distance = get_setting('herbivore', 'food_detection_distance', 20)
        # 食物检测距离 * (1-eigenvalue_vision)，使用//转换为整数
        # 视力特征值为负时，食物检测距离增加；为正时，食物检测距离减少
        return int(base_distance * (1 - self.eigenvalue_vision))
    
    def get_danger_detection_radius(self):
        """获取危险检测半径，基于视力特征值调整"""
        base_distance = get_setting('herbivore', 'danger_detection_distance', 15)
        # 危险检测距离 * (1+eigenvalue_vision)，使用//转换为整数
        # 视力特征值为正时，危险检测距离增加；为负时，危险检测距离减少
        return int(base_distance * (1 + self.eigenvalue_vision))
    
    def get_render_info(self):
        """获取渲染所需的信息"""
        # 直接创建render info字典
        return {
            'color': BLUE,
            'shape': 'circle',
            'radius_ratio': min(self.energy / self.max_energy, 1.0)
        }
    
    def _handle_config_update(self, category, key, new_value):
        """
        处理配置更新的回调方法
        
        Args:
            category: 配置类别
            key: 配置键
            new_value: 新的配置值
        """
        if category in ('herbivore', 'movement'):
            # 如果是草食动物或移动相关配置更新，重新加载所有配置
            self.update_config()
    
    def update_config(self):
        """
        更新配置到草食动物实例
        重新加载所有草食动物相关的配置参数
        """
        # 更新最大能量值，但保持当前能量值不变
        self.max_energy = get_setting('herbivore', 'max_energy', 500)
        # 确保能量不会超过新的最大能量值
        self.energy = min(self.energy, self.max_energy)
        # 更新移动间隔
        min_interval = get_setting('movement', 'min_move_interval', 1)
        max_interval = get_setting('movement', 'max_move_interval', 10)
        new_move_interval = max(min_interval, min(max_interval, get_setting('herbivore', 'move_interval', 3)))
        # 更新原始移动间隔
        self.original_move_interval = new_move_interval
        # 如果没有检测到危险，直接使用新的移动间隔
        # 如果检测到危险，保持当前调整后的移动间隔
        if not getattr(self, 'detected_danger', False):
            self.move_interval = new_move_interval
        # 更新初始能量（只用于新创建的实例，不影响当前实例）
        self.initial_energy = get_setting('herbivore', 'initial_energy', 300)
