import random
import pygame
from config import GRID_SIZE, SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT, YELLOW
from config.settings import get_setting, add_config_listener, remove_config_listener

class BaseOrganism:
    """所有生物的基类，提供共有的属性和方法"""
    def __init__(self, organism_type):
        # 随机位置，但确保在网格点上
        self.x = random.randint(0, (SIMULATION_AREA_WIDTH // GRID_SIZE) - 1) * GRID_SIZE
        self.y = random.randint(0, (SIMULATION_AREA_HEIGHT // GRID_SIZE) - 1) * GRID_SIZE
        # 生物类型
        self.organism_type = organism_type
        # 世代信息
        self.generation = 1
        # 死亡状态
        self.dead = False
        # 配置更新监听器
        self._config_listener = None
        # 注册配置更新监听器
        self._register_config_listener()
        self._draw_x = self.x
        self._draw_y = self.y
        self._anim_from = None
        self._anim_to = None
        self._anim_t = 1.0
        self._anim_duration = 0.2
    
    def is_alive(self):
        """检查生物是否存活"""
        # 只检查dead标志，不检查energy，因为energy检查可能导致新创建的生物被错误判定为死亡
        return not getattr(self, 'dead', False)
    
    def get_info(self):
        """获取生物基本信息"""
        return {
            "位置": f"({self.x}, {self.y})",
            "世代": f"{self.generation}"
        }
    
    def draw(self, screen, selected=False, zoom=1.0, offset=(0, 0)):
        """基类绘制方法，子类应该重写此方法"""
        raise NotImplementedError("子类必须实现draw方法")
    
    def update(self, delta_time=1.0):
        """基类更新方法，进行位置网格对齐"""
        from config import GRID_SIZE
        grid_x = self.x // GRID_SIZE
        grid_y = self.y // GRID_SIZE
        self.x = grid_x * GRID_SIZE
        self.y = grid_y * GRID_SIZE
        self.advance_animation(delta_time)

    def _ease_in_out(self, t: float) -> float:
        if t <= 0.0:
            return 0.0
        if t >= 1.0:
            return 1.0
        if t < 0.5:
            return 4.0 * (t - 0.5) ** 3 + 0.5
        return 1.0 - 4.0 * (1.0 - t - 0.5) ** 3

    def start_move_animation(self, from_pos, to_pos, duration: float):
        self._anim_from = from_pos
        self._anim_to = to_pos
        self._anim_duration = max(0.001, float(duration))
        self._anim_t = 0.0

    def advance_animation(self, dt: float):
        if self._anim_t < 1.0 and self._anim_from and self._anim_to:
            from config.constants import SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT
            self._anim_t = min(1.0, self._anim_t + (dt / self._anim_duration))
            p = self._ease_in_out(self._anim_t)
            fx, fy = self._anim_from
            tx, ty = self._anim_to
            dx = tx - fx
            dy = ty - fy
            # 环绕最短路径处理
            if abs(dx) > SIMULATION_AREA_WIDTH / 2:
                if dx > 0:
                    dx = dx - SIMULATION_AREA_WIDTH
                else:
                    dx = dx + SIMULATION_AREA_WIDTH
            if abs(dy) > SIMULATION_AREA_HEIGHT / 2:
                if dy > 0:
                    dy = dy - SIMULATION_AREA_HEIGHT
                else:
                    dy = dy + SIMULATION_AREA_HEIGHT
            ix = fx + dx * p
            iy = fy + dy * p
            # 映射回有效世界坐标
            self._draw_x = ix % SIMULATION_AREA_WIDTH
            self._draw_y = iy % SIMULATION_AREA_HEIGHT
        else:
            self._draw_x = self.x
            self._draw_y = self.y

    def get_draw_position(self):
        return (self._draw_x, self._draw_y)
    
    def _register_config_listener(self):
        """注册配置更新监听器"""
        # 创建监听器函数
        self._config_listener = lambda category, key, new_value: self._handle_config_update(category, key, new_value)
        # 添加到全局监听器列表
        add_config_listener(self._config_listener)
    
    def _unregister_config_listener(self):
        """取消注册配置更新监听器"""
        if self._config_listener:
            remove_config_listener(self._config_listener)
            self._config_listener = None
    
    def _handle_config_update(self, category, key, new_value):
        """
        处理配置更新的回调方法
        子类应该重写此方法以响应特定的配置变化
        
        Args:
            category: 配置类别
            key: 配置键
            new_value: 新的配置值
        """
        # 子类可以重写此方法以响应配置变化
        pass
    
    def __del__(self):
        """析构函数，确保取消注册监听器"""
        self._unregister_config_listener()
        
    def update_config(self):
        """
        更新配置到生物实例
        子类应该重写此方法以更新其特定的配置属性
        """
        # 子类应该重写此方法
        
    

class Animal(BaseOrganism):
    """动物基类，继承自BaseOrganism"""
    def __init__(self, organism_type):
        super().__init__(organism_type)
        # 移动间隔相关
        self.move_interval = None
        self.original_move_interval = None
        self.frame_counter = 0
        
    def adjust_move_interval_by_energy(self):
        """
        根据能量水平调整移动间隔
        当能量小于最大能量的30%时，move_interval = min(original_move_interval*2, 20)
        能量恢复后，恢复原始移动间隔
        """
        # 初始化original_move_interval（如果尚未设置）
        if self.original_move_interval is None and self.move_interval is not None:
            self.original_move_interval = self.move_interval
        
        # 检查能量水平是否低于30%
        if hasattr(self, 'energy') and hasattr(self, 'max_energy'):
            if self.energy < self.max_energy * 0.3:
                # 能量不足，减慢移动速度
                if self.original_move_interval is not None:
                    self.move_interval = min(int(self.original_move_interval * 2), 20)
            else:
                # 能量恢复时，恢复原始移动间隔
                if self.original_move_interval is not None and self.move_interval != self.original_move_interval:
                    self.move_interval = self.original_move_interval
    
    def update(self, delta_time=1.0):
        """更新动物状态，包括位置校准、移动间隔自适应与年龄累计"""
        super().update(delta_time)
        self.adjust_move_interval_by_energy()
        if not hasattr(self, 'age'):
            self.age = 0.0
        try:
            self.age += float(delta_time)
        except Exception:
            pass
    
    def should_move(self):
        """检查当前帧是否应该移动"""
        self.frame_counter += 1
        if self.frame_counter >= self.move_interval:
            self.frame_counter = 0
            return True
        return False
    
    def move(self, *args, **kwargs):
        """动物移动方法，子类应该重写此方法"""
        raise NotImplementedError("子类必须实现move方法")
    
    def eat(self, *args, **kwargs):
        """动物进食方法，子类应该重写此方法"""
        raise NotImplementedError("子类必须实现eat方法")
    
    def reproduce(self, threshold, prob):
        """动物繁殖方法，子类可以重写此方法"""
        raise NotImplementedError("子类必须实现reproduce方法")
    
    def get_info(self):
        """获取动物信息"""
        info = super().get_info()
        info.update({
            "年龄": f"{self.age}",
            "后代数量": f"{self.children}"
        })
        # 添加移动间隔相关信息
        if hasattr(self, 'move_interval') and self.move_interval is not None:
            info["移动间隔"] = f"{self.move_interval}"
        if hasattr(self, 'original_move_interval') and self.original_move_interval is not None:
            info["原始移动间隔"] = f"{self.original_move_interval}"
        return info
