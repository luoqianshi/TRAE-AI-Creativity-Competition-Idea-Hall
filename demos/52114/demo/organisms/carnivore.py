import random
import pygame
from config import GRID_SIZE, RED, YELLOW, get_setting
from .base_organism import BaseOrganism
from utils.coordinate import scale_point
from pathfinding import move_towards_targets_or_random

class Carnivore(BaseOrganism):
    """肉食动物类"""
    def __init__(self, x: int, y: int, initial_energy=None, max_energy=None, move_interval=None):
        super().__init__("carnivore")
        # 覆盖随机位置，使用传入的坐标
        self.x = x
        self.y = y
        # 设置能量属性
        self.initial_energy = initial_energy if initial_energy is not None else get_setting('carnivore', 'initial_energy', 800)
        self.max_energy = max_energy if max_energy is not None else get_setting('carnivore', 'max_energy', 1500)
        self.energy = self.initial_energy
        # 肉食动物特有属性
        self.children = 0  # 后代计数
        self.actions = 0  # 动作计数器，用于控制移动间隔
        self.move_count = 0  # 移动计数
        self.age = 0.0
        self.detected_food = False  # 标记是否检测到食物（草食动物）
        # 添加蠕动效果相关属性
        self.wiggle_time = 0
        # 移动间隔（帧）：值越小移动越频繁，越快
        if move_interval is not None:
            # 确保移动间隔在合理范围内
            min_interval = get_setting('movement', 'min_move_interval', 1)
            max_interval = get_setting('movement', 'max_move_interval', 10)
            self.move_interval = max(min_interval, min(max_interval, move_interval))
        else:
            # 初始默认移动间隔
            self.move_interval = get_setting('carnivore', 'move_interval', 2)
        # 保存原始移动间隔
        self.original_move_interval = self.move_interval
        # 去同步初始移动帧相位，避免群体同拍
        try:
            import random as _r
            self.frame_counter = _r.randint(0, max(1, self.move_interval - 1))
        except Exception:
            pass
    
    def should_move(self) -> bool:
        """检查是否应该在当前帧移动"""
        return self.actions % self.move_interval == 0
    
    def move(self, target_organisms=None, same_species=None, follow_distance=None):
        """肉食动物移动"""
        # 检查是否应该在当前帧移动
        if not self.should_move() or not self.is_alive():
            return False
        
        # 使用pathfinding模块进行移动
        follow_dist = follow_distance if follow_distance is not None else get_setting('carnivore', 'follow_distance', 8)
        follow_prob = get_setting('carnivore', 'follow_probability', 80) / 100
        
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
            # 斜向移动额外消耗
            if prev_x != self.x and prev_y != self.y:
                frequency_based_cost = int(frequency_based_cost * (2 ** 0.5))
            self.consume_energy(frequency_based_cost)
        
        return moved
    
    def eat(self, herbivores) -> tuple[bool, int]:
        """肉食动物进食"""
        if not self.is_alive():
            return False, 0
            
        # 检查当前位置是否有草食动物
        for herbivore in herbivores[:]:  # 使用副本进行迭代
            if herbivore.x == self.x and herbivore.y == self.y and herbivore.is_alive():
                # 获取肉食动物的energy_from_food值
                energy_from_food = get_setting('carnivore', 'energy_from_food', 30)
                
                # 根据草食动物当前能量和energy_from_food确定实际获取的能量
                if herbivore.energy <= energy_from_food:
                    # 如果草食动物能量小于等于energy_from_food，仅获取草食动物当前能量
                    energy_gain = herbivore.energy
                else:
                    # 如果草食动物能量大于energy_from_food，仅获取energy_from_food值
                    energy_gain = energy_from_food
                
                # 恢复肉食动物的能量（不超过最大值）
                self.gain_energy(energy_gain)
                
                # 草食动物被捕获时扣除肉食动物获取能量的1.5倍
                herbivore.consume_energy(int(energy_gain * 1.5))
                # 死亡判断由consume_energy方法根据能量值是否<=0来决定
                
                # 设置进食成功标志，用于控制繁殖时机
                self.has_eaten_this_update = True
                
                return True, energy_gain
        
        # 如果没有进食，设置标志为False
        self.has_eaten_this_update = False
        return False, 0
    
    def can_reproduce(self) -> bool:
        """检查是否可以繁殖"""
        # 直接实现繁殖条件，不依赖父类方法
        min_energy_for_reproduction = get_setting('carnivore', 'min_energy_for_reproduction', 500)
        
        # 确保has_eaten_this_update属性已初始化
        if not hasattr(self, 'has_eaten_this_update'):
            self.has_eaten_this_update = False
        
        # 新条件：必须进食后才能繁殖，并且能量要足够
        if self.energy < min_energy_for_reproduction or not self.has_eaten_this_update:
            return False
        
        # 使用修正的繁殖概率计算公式：（当前能量/最大能量）*reproduction_probability/100
        # 注意：reproduction_prob已经是百分比值，但需要转换为小数
        reproduction_prob = get_setting('carnivore', 'reproduction_probability', 20)  # 肉食动物繁殖概率较低
        energy_ratio = self.energy / self.max_energy
        actual_probability = energy_ratio * (reproduction_prob / 100)
        
        return random.random() <= actual_probability
    
    def gain_energy(self, amount):
        """增加能量，不超过最大值"""
        self.energy = min(self.energy + amount, self.max_energy)
        
    def consume_energy(self, amount):
        """消耗能量，能量不足时设置为死亡状态"""
        self.energy -= amount
        if self.energy <= 0:
            self.dead = True
            self.energy = 0
    
    def reproduce(self) -> 'Carnivore':
        """肉食动物繁殖"""
        if not self.can_reproduce():
            return None
        
        # 获取系统设置的初始能量作为后代能量
        offspring_initial_energy = get_setting('carnivore', 'initial_energy', 50)
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
        
        # 创建新的肉食动物 - 继承父代的移动间隔，但使用网格中心点坐标
        new_carnivore = Carnivore(centered_x, centered_y,
                                 initial_energy=offspring_initial_energy,
                                 max_energy=self.max_energy,
                                 move_interval=self.move_interval)
        new_carnivore.generation = self.generation + 1
        # 减少父代能量：扣除子代初始能量的1.5倍
        self.consume_energy(energy_cost)
        # 增加后代计数
        self.children += 1
        return new_carnivore
    
    def draw(self, screen, screen_x, screen_y, zoom, selected: bool = False):
        import math
        # 生物尺寸设置
        BIG_BLOCK_SIZE = (20, 12)  # 主体大方块
        SMALL_BLOCK_SIZE = (3, 4)  # 小方块
        SMALL_BLOCK_COUNT = 8      # 小方块数量
        
        # 小方块相对于大方块的基础位置（下方排成两行，直接连接）
        small_base_positions = [
            # 第一排（原来的小方块）
            (1, BIG_BLOCK_SIZE[1]),
            (6, BIG_BLOCK_SIZE[1]+1),
            (12, BIG_BLOCK_SIZE[1]+1),
            (17, BIG_BLOCK_SIZE[1]),
            # 第二排（新增的小方块，在第一排下方）
            (1, BIG_BLOCK_SIZE[1] + SMALL_BLOCK_SIZE[1]),
            (6, BIG_BLOCK_SIZE[1] + SMALL_BLOCK_SIZE[1]),
            (12, BIG_BLOCK_SIZE[1] + SMALL_BLOCK_SIZE[1]),
            (17, BIG_BLOCK_SIZE[1] + SMALL_BLOCK_SIZE[1])
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
            screen, RED,
            (big_x, big_y, scaled_big_width, scaled_big_height)
        )
        
        # 绘制选中状态（边框）
        if selected:
            pygame.draw.rect(
                screen, YELLOW,
                (big_x - 2, big_y - 2, scaled_big_width + 4, scaled_big_height + 4),
                2  # 线宽
            )
        
        # 绘制4个小方块，添加蠕动效果
        for i in range(SMALL_BLOCK_COUNT):
            # 计算蠕动偏移量（仅水平方向移动）
            wiggle_horizontal = math.cos(self.wiggle_time + i * 0.5) * 0.5  # 水平偏移
            
            # 计算基础位置
            base_x, base_y = small_base_positions[i]
            scaled_base_x = int(base_x * scale)
            scaled_base_y = int(base_y * scale)
            
            # 计算小方块的最终位置（仅考虑水平蠕动效果）
            small_x = big_x + scaled_base_x + wiggle_horizontal
            small_y = big_y + scaled_base_y  # 不再有垂直偏移
            
            # 绘制小方块
            pygame.draw.rect(
                screen, RED,
                (small_x, small_y, scaled_small_width, scaled_small_height)
            )
    
    def get_info(self):
        er = min(self.energy / self.max_energy, 1.0)
        # 获取当前检测状态
        detected_food = getattr(self, 'detected_food', False)
        detected_danger = getattr(self, 'detected_danger', False)
        
        # 计算当前繁殖概率
        reproduction_prob = get_setting('carnivore', 'reproduction_probability', 20)
        actual_probability = er * (reproduction_prob / 100)
        
        return {
            "类型": "肉食动物",
            "位置": f"({self.x}, {self.y})",
            "能量": f"{int(self.energy)}/{int(self.max_energy)}",
            "能量比": f"{er:.2f}",
            "年龄": f"{self.age:.1f}",
            "世代": self.generation,
            "基础移动间隔": f"{getattr(self, 'original_move_interval', self.move_interval)}帧",
            "实时移动间隔": f"{self.move_interval}帧",
            "移动次数": self.move_count,
            "食物感知距离": self.get_detection_radius(),
            "危险感知距离": self.get_danger_detection_radius(),
            "检测到食物": "是" if detected_food else "否",
            "检测到危险": "是" if detected_danger else "否",
            "跟随概率%": get_setting('carnivore', 'follow_probability', 80),
            "后代数量": self.children,
            "繁殖概率": f"{actual_probability:.4f} ({actual_probability*100:.2f}%)",
            "繁殖条件满足": "是" if (self.energy >= get_setting('carnivore', 'min_energy_for_reproduction', 500) and getattr(self, 'has_eaten_this_update', False)) else "否"
        }
    
    def update(self, delta_time=1.0):
        """更新肉食动物状态"""
        if not self.is_alive():
            return
            
        # 重置进食标志，确保每个更新周期开始时为False
        self.has_eaten_this_update = False
            
        # 调用父类的update方法进行位置校准
        super().update(delta_time)
        
        # 更新蠕动动画时间
        self.wiggle_time += delta_time * 2  # 调整蠕动速度
        
        self.actions = getattr(self, 'actions', 0) + 1
        
        # 只进行基础能量消耗的扣减
        base_cost = get_setting('carnivore', 'base_energy_consumption', 1)
        self.consume_energy(base_cost * delta_time)  # 肉食动物的基础消耗本身就较高
        
        # 确保original_move_interval已初始化
        if not hasattr(self, 'original_move_interval'):
            self.original_move_interval = self.move_interval
        
        # 能量不足时降低移动频率（在未探测到目标时生效）
        if hasattr(self, 'energy') and hasattr(self, 'max_energy'):
            if self.energy < self.max_energy * 0.3 and not getattr(self, 'detected_food', False):
                self.move_interval = min(int(self.original_move_interval * 2), 20)
            elif not getattr(self, 'detected_food', False):
                # 能量恢复且未探测到目标，恢复基础移动间隔
                self.move_interval = self.original_move_interval
    
    def set_target_detection(self, target_detected):
        """
        设置目标检测状态并调整移动间隔
        当检测到目标时，move_interval=max(move_interval/2,1)
        当目标丢失时，恢复原始移动间隔
        
        Args:
            target_detected: 是否检测到目标（草食动物）
        """
        # 确保original_move_interval已初始化
        if not hasattr(self, 'original_move_interval'):
            self.original_move_interval = self.move_interval
        
        # 如果目标检测状态改变
        if target_detected != self.detected_food:
            self.detected_food = target_detected
            
            if target_detected:
                # 检测到目标，移动间隔缩短，但不小于1
                self.move_interval = max(int(self.original_move_interval / 2), 1)
            else:
                # 目标丢失，恢复原始移动间隔
                self.move_interval = self.original_move_interval
    
    def get_target_types(self):
        """获取目标生物类型"""
        from organisms import Herbivore
        return [Herbivore]
    
    def get_danger_types(self):
        """获取危险生物类型"""
        # 肉食动物没有天敌
        return []
    
    def get_detection_radius(self):
        """获取目标检测半径"""
        return get_setting('carnivore', 'follow_distance', 25)
    
    def get_danger_detection_radius(self):
        """获取危险检测半径"""
        return 0
    
    def get_render_info(self):
        """获取渲染所需的信息"""
        # 直接创建render info字典而不是调用super，因为基类可能没有这个方法
        return {
            'color': RED,
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
        if category in ('carnivore', 'movement'):
            # 如果是肉食动物或移动相关配置更新，重新加载所有配置
            self.update_config()
    
    def update_config(self):
        """
        更新配置到肉食动物实例
        重新加载所有肉食动物相关的配置参数
        """
        # 更新最大能量值，但保持当前能量值不变
        self.max_energy = get_setting('carnivore', 'max_energy', 1500)
        # 确保能量不会超过新的最大能量值
        self.energy = min(self.energy, self.max_energy)
        # 更新移动间隔
        min_interval = get_setting('movement', 'min_move_interval', 1)
        max_interval = get_setting('movement', 'max_move_interval', 10)
        new_move_interval = max(min_interval, min(max_interval, get_setting('carnivore', 'move_interval', 2)))
        # 更新原始移动间隔
        self.original_move_interval = new_move_interval
        # 如果没有检测到目标，直接使用新的移动间隔
        # 如果检测到目标，保持当前调整后的移动间隔
        if not getattr(self, 'detected_food', False):
            self.move_interval = new_move_interval
        # 更新初始能量（只用于新创建的实例，不影响当前实例）
        self.initial_energy = get_setting('carnivore', 'initial_energy', 800)
