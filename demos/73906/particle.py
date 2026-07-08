# particle.py — 粒子类（质子/中子/电子）

import math
import random
from config import PROTON_COLOR, NEUTRON_COLOR


def _brownian_step(self):
    """核内布朗运动 + 边界约束（质子/中子共用）
    优化: 缓存 nucleus_radius², 避免每帧重新计算
    """
    self.vx += random.uniform(-0.2, 0.2)
    self.vy += random.uniform(-0.2, 0.2)
    self.vx *= 0.95
    self.vy *= 0.95
    self.vx = max(-1.5, min(1.5, self.vx))
    self.vy = max(-1.5, min(1.5, self.vy))
    self.x += self.vx
    self.y += self.vy
    # 约束在核内（优化: 先平方比较, 多数情况下不需要 sqrt）
    dx = self.x - self.base_x
    dy = self.y - self.base_y
    dist_sq = dx * dx + dy * dy
    # 优化: 缓存的 nucleus_radius², 父原子重置 nucleus_radius 时需刷新
    nr_sq = self._nucleus_radius_sq
    if dist_sq > nr_sq:
        # 修复: 防御性 max, 避免 dx/dy 退化时除零
        safe_dist_sq = max(dist_sq, 1e-18)
        safe_dist = math.sqrt(safe_dist_sq)
        scale = self.nucleus_radius / safe_dist
        self.x = self.base_x + dx * scale
        self.y = self.base_y + dy * scale
        self.vx *= -0.5
        self.vy *= -0.5


class Proton:
    """质子"""
    def __init__(self, x, y, nucleus_radius=15, radius=4):
        self.x = x
        self.y = y
        self.base_x = x
        self.base_y = y
        self.radius = radius
        self.color = PROTON_COLOR
        self.nucleus_radius = nucleus_radius
        # 优化: 缓存 nucleus_radius², 父原子改变 nucleus_radius 时需更新
        self._nucleus_radius_sq = nucleus_radius * nucleus_radius
        self.vx = random.uniform(-0.5, 0.5)
        self.vy = random.uniform(-0.5, 0.5)

    def update(self):
        _brownian_step(self)

    def set_base(self, x, y):
        self.base_x = x
        self.base_y = y


class Neutron:
    """中子"""
    def __init__(self, x, y, nucleus_radius=15, radius=4):
        self.x = x
        self.y = y
        self.base_x = x
        self.base_y = y
        self.radius = radius
        self.color = NEUTRON_COLOR
        self.nucleus_radius = nucleus_radius
        # 优化: 缓存 nucleus_radius²
        self._nucleus_radius_sq = nucleus_radius * nucleus_radius
        self.vx = random.uniform(-0.5, 0.5)
        self.vy = random.uniform(-0.5, 0.5)

    def update(self):
        _brownian_step(self)

    def set_base(self, x, y):
        self.base_x = x
        self.base_y = y


class Electron:
    """电子
    修复: 统一使用 atom_x/atom_y 字段, 避免 P-13 优化后 e.center_x/e.center_y 写入
    静默失败 (update 只读 atom_x/atom_y, 导致电子不跟随原子移动)
    """
    def __init__(self, atom_x, atom_y, orbit_radius, orbit_index=0, color=(80, 200, 255)):
        self.atom_x = atom_x
        self.atom_y = atom_y
        self.orbit_radius = orbit_radius
        self.base_orbit_radius = orbit_radius
        self.angle = random.uniform(0, 2 * math.pi)
        self.radius = 3
        self.color = color
        self.speed = 0.03 + orbit_index * 0.005
        self.orbit_index = orbit_index
        self.orbit_perturbation = random.uniform(0, 2 * math.pi)
        # 优化: 缓存 nucleus_radius² 风格 — 缓存三角函数 0 值点
        self._two_pi = 2 * math.pi
        # 初始位置
        self.x = self.atom_x + math.cos(self.angle) * self.orbit_radius
        self.y = self.atom_y + math.sin(self.angle) * self.orbit_radius

    def update(self):
        # 优化: 预算属性到本地变量, 减少热循环中重复属性访问
        self.angle += self.speed
        if self.angle > self._two_pi:
            self.angle -= self._two_pi
        # 微小径向扰动
        ax, ay = self.atom_x, self.atom_y
        # 优化: cos/sin 各只算一次, 复用
        c = math.cos(self.angle)
        s = math.sin(self.angle)
        # 优化: 三角扰动项内联, 减少一次 math.sin 调用
        r = self.orbit_radius + math.sin(self.angle * 3 + self.orbit_perturbation) * 3
        self.x = ax + c * r
        self.y = ay + s * r

    def expand_orbit(self, factor=1.8):
        self.orbit_radius = self.base_orbit_radius * factor

    def restore_orbit(self):
        self.orbit_radius = self.base_orbit_radius

    def set_center(self, x, y):
        """兼容性: 仍接受 (x, y) 写法, 但写入 atom_x/atom_y
        这样老的 set_center 调用也能正确工作, 不会出现电子不跟随原子"""
        self.atom_x = x
        self.atom_y = y
