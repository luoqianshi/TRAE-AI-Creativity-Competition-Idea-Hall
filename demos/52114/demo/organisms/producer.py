import random
import pygame
from config import get_setting, GRID_SIZE, GREEN, YELLOW
from .base_organism import BaseOrganism
from utils.coordinate import scale_point

class Producer(BaseOrganism):
    """生产者（植物）类"""
    def __init__(self, x: int, y: int, initial_energy=None, max_energy=None):
        super().__init__("producer")
        self.x = x
        self.y = y
        self.initial_energy = initial_energy if initial_energy is not None else get_setting('producer', 'initial_energy', 10)
        self.max_energy = max_energy if max_energy is not None else get_setting('producer', 'max_energy', 100)
        self.energy = self.initial_energy
        self.age = 0.0
        self.reproduction_interval = get_setting('producer', 'reproduction_interval', 5)
        self.frame_since_last_reproduction = 0
    
    def draw(self, screen, screen_x, screen_y, zoom, selected: bool = False):
        energy_ratio = min(self.energy / self.max_energy, 1.0)
        base_size = GRID_SIZE * 0.6
        scale = 0.3 + 0.9 * energy_ratio
        scaled_size = base_size * scale * zoom
        
        # 根据能量调整颜色深浅
        # 能量越高颜色越绿，越低颜色越黄
        r = int(0)
        g = int(min(255, 150 + energy_ratio * 105))
        b = int(0)
        
        rect = pygame.Rect(0, 0, int(scaled_size), int(scaled_size))
        rect.center = (int(screen_x), int(screen_y))
        pygame.draw.rect(screen, (r, g, b), rect)
        if selected:
            pygame.draw.rect(screen, (255, 255, 0), rect, 2)

    def start_move_animation(self, from_pos, to_pos, duration: float):
        self._draw_x = self.x
        self._draw_y = self.y
        self._anim_t = 1.0

    def get_draw_position(self):
        return (self.x, self.y)
    
    def get_info(self):
        er = min(self.energy / self.max_energy, 1.0)
        return {
            "类型": "植物",
            "位置": f"({self.x}, {self.y})",
            "能量": f"{int(self.energy)}/{int(self.max_energy)}",
            "能量比": f"{er:.2f}",
            "年龄": f"{self.age:.1f}",
            "世代": self.generation
        }
    
    def update(self, delta_time=1.0):
        # 调用父类的update方法进行位置校准
        super().update(delta_time)
        
        energy_increase_rate = get_setting('producer', 'energy_increase_rate', 2)
        self.gain_energy(energy_increase_rate * delta_time)
        self.age += delta_time
        
        # 更新繁殖间隔计数器
        self.frame_since_last_reproduction += 1
        
    def can_reproduce(self):
        """检查是否可以繁殖"""
        # 检查繁殖间隔
        if self.frame_since_last_reproduction < self.reproduction_interval:
            return False
        
        # 繁殖概率为：当前能量值占最大能量值的比例 * adjacent_reproduction_probability
        energy_ratio = self.energy / self.max_energy
        adj_reproduction_prob = get_setting('producer', 'adjacent_reproduction_probability', 20)
        # 计算实际的繁殖概率
        reproduction_probability = energy_ratio * adj_reproduction_prob
        # 生成0-100之间的随机数进行比较
        return random.randint(1, 100) <= reproduction_probability
    
    def reproduce(self) -> 'Producer':
        if not self.can_reproduce():
            return None
        reproduction_cost = get_setting('producer', 'reproduction_cost', 30)
        
        # 准备创建后代
        grid_x = self.x // GRID_SIZE
        grid_y = self.y // GRID_SIZE
        centered_x = grid_x * GRID_SIZE
        centered_y = grid_y * GRID_SIZE
        offspring = Producer(
            centered_x,
            centered_y,
            initial_energy=1,
            max_energy=self.max_energy
        )
        offspring.generation = self.generation + 1
        
        # 注意：繁殖间隔计数器的重置将在simulation.py中根据繁殖是否成功来处理
        # 这样可以避免在没有成功繁殖时重置计数器
        
        # 只有在真正繁殖成功时才消耗能量
        # 注意：在simulation.py中还需要额外判断周围是否有空位
        # 这里先准备好后代，消耗能量的逻辑在simulation中成功添加时执行
        return offspring
    
    def gain_energy(self, amount):
        """增加能量，不超过最大能量限制"""
        self.energy = min(self.energy + amount, self.max_energy)
    
    def consume_energy(self, amount):
        """消耗能量"""
        self.energy -= amount
        if self.energy <= 0:
            self.dead = True
    
    def get_render_info(self):
        """
        获取渲染所需的信息
        """
        # 先确保info字典存在，避免调用不存在的super().get_render_info()
        info = {}
        # 再更新信息
        info.update({
            'color': GREEN,
            'shape': 'rectangle',
            'energy_ratio': self.energy / self.max_energy
        })
        return info
    
    def _handle_config_update(self, category, key, new_value):
        """
        处理配置更新的回调方法
        
        Args:
            category: 配置类别
            key: 配置键
            new_value: 新的配置值
        """
        if category == 'producer':
            # 如果是生产者相关配置更新，重新加载所有配置
            self.update_config()
            
    def update_config(self):
        """
        更新配置到生产者实例
        重新加载所有生产者相关的配置参数
        """
        # 更新最大能量值，但保持当前能量值不变
        self.max_energy = get_setting('producer', 'max_energy', 100)
        # 确保能量不会超过新的最大能量值
        self.energy = min(self.energy, self.max_energy)
        # 更新初始能量（只用于新创建的实例，不影响当前实例）
        self.initial_energy = get_setting('producer', 'initial_energy', 10)
