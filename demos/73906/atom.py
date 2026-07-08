# atom.py — 原子类

import math
import random
from particle import Proton, Neutron, Electron
from config import WINDOW_WIDTH, WINDOW_HEIGHT, MAX_SPEED, MAX_SPEED_SQ, ELEMENTS, NOBLE_GASES, ELECTRON_COLORS

class Atom:
    def __init__(self, symbol, x, y, vx=None, vy=None):
        el = ELEMENTS[symbol]
        self.symbol = symbol
        self.name = el["name"]
        self.protons = el["protons"]
        self.neutrons = el["neutrons"]
        self.color = el["color"]
        self.radius = el["radius"]
        self.x = float(x)
        self.y = float(y)
        self.vx = vx if vx is not None else random.uniform(-2, 2)
        self.vy = vy if vy is not None else random.uniform(-2, 2)
        self.is_noble = symbol in NOBLE_GASES

        # 核半径（随质子数缩放，避免重原子核内过于密集）
        self.nucleus_radius = max(8, self.radius * 0.45)
        # 核内粒子半径随核大小缩放
        self.nucleon_radius = max(2, min(4, self.nucleus_radius / max(1, (self.protons + self.neutrons) ** 0.5) * 1.5))

        # 创建质子
        self.proton_list = []
        for i in range(self.protons):
            angle = 2 * math.pi * i / max(1, self.protons)
            r = random.uniform(0, self.nucleus_radius * 0.6)
            px = self.x + math.cos(angle) * r
            py = self.y + math.sin(angle) * r
            self.proton_list.append(Proton(px, py, self.nucleus_radius, self.nucleon_radius))

        # 创建中子
        self.neutron_list = []
        total_nucleons = self.protons + self.neutrons
        for i in range(self.neutrons):
            angle = 2 * math.pi * (i + self.protons) / max(1, total_nucleons)
            r = random.uniform(0, self.nucleus_radius * 0.6)
            nx = self.x + math.cos(angle) * r
            ny = self.y + math.sin(angle) * r
            self.neutron_list.append(Neutron(nx, ny, self.nucleus_radius, self.nucleon_radius))

        # 创建电子轨道
        self.electrons = []
        self._create_electrons()

        # 轨道是否扩大中
        self.orbit_expanded = False
        self.orbit_expand_timer = 0
        # P0-3: 轨迹 (用于高速粒子视觉)
        from effects import Trail
        # 优化: 防御 max_len <= 0
        self._trail = Trail(max_len=20)
        # 优化: 拖动时不记录轨迹, 避免拖动中画残留拖尾
        self._trail_enabled = True

        # 选中状态
        self.selected = False
        self.dragging = False

        # 质量
        self.mass = self.protons + self.neutrons

    def _create_electrons(self):
        el = ELEMENTS[self.symbol]
        # 轨道半径随原子大小缩放
        base_radius = el["radius"] + 10
        self.electrons = []

        # 根据元素类别获取电子颜色
        category = el.get("category", "nonmetal")
        e_color = ELECTRON_COLORS.get(category, (80, 200, 255))

        # 轨道分配 (扩展到 n=7 容纳全部 118 元素)
        # 总容量: 2+8+18+32+32+18+8 = 118, 覆盖 Og(Z=118)
        orbits = {1: 2, 2: 8, 3: 18, 4: 32, 5: 32, 6: 18, 7: 8}
        remaining = self.protons
        orbit_idx = 0
        for layer, capacity in orbits.items():
            if remaining <= 0:
                break
            count = min(remaining, capacity)
            orbit_r = base_radius + layer * 18
            for i in range(count):
                e = Electron(self.x, self.y, orbit_r, orbit_idx, color=e_color)
                e.angle = 2 * math.pi * i / count
                self.electrons.append(e)
            remaining -= count
            orbit_idx += 1
        # 优化: 缓存去重后的轨道半径, 供 draw_atom 使用, 避免每帧 set()
        self._refresh_orbit_cache()

    def _refresh_orbit_cache(self):
        """刷新轨道半径缓存, 在 expand_orbits/_restore_orbits 时调用"""
        self._orbit_radii = sorted({int(e.orbit_radius) for e in self.electrons})

    def update(self, dt=1.0):
        # 优化: 预算属性到本地变量, 减少热循环中重复属性访问
        if self.dragging:
            # 拖动中也要更新内部粒子位置
            # 修复: 拖动中也要更新内部粒子位置, 防止核/电子停在原处
            # 优化: 合并质子+中子循环为一次遍历 (它们都接受 set_base)
            # P-13 后续: 电子统一使用 e.atom_x/e.atom_y, 直接写属性
            ax, ay = self.x, self.y
            for p in self.proton_list:
                p.base_x = ax
                p.base_y = ay
                p.update()
            for n in self.neutron_list:
                n.base_x = ax
                n.base_y = ay
                n.update()
            # 修复: e.atom_x/e.atom_y 是 Electron 实际读取的字段
            for e in self.electrons:
                e.atom_x = ax
                e.atom_y = ay
                e.update()
            return

        # 运动
        self.x += self.vx * dt
        self.y += self.vy * dt

        # P0-3: 记录轨迹 (拖动中不记)
        if self._trail_enabled:
            self._trail.add(self.x, self.y)

        # 边界反弹 - 优化: 预算 self.radius 到本地变量
        r = self.radius
        if self.x - r < 0:
            self.x = r
            self.vx = abs(self.vx)
        elif self.x + r > WINDOW_WIDTH:
            self.x = WINDOW_WIDTH - r
            self.vx = -abs(self.vx)
        if self.y - r < 0:
            self.y = r
            self.vy = abs(self.vy)
        elif self.y + r > WINDOW_HEIGHT:
            self.y = WINDOW_HEIGHT - r
            self.vy = -abs(self.vy)

        # 速度限制
        # 优化: 平方比较代替 math.sqrt
        speed_sq = self.vx * self.vx + self.vy * self.vy
        if speed_sq > MAX_SPEED_SQ:
            speed = math.sqrt(speed_sq)
            self.vx = self.vx / speed * MAX_SPEED
            self.vy = self.vy / speed * MAX_SPEED

        # 更新核内粒子 + 电子 (P-13 合并 3 循环为 1, 减少方法调用)
        # 修复: proton 和 neutron 都用 set_base, 合并为单循环
        # 优化: 预算到本地, 减少属性访问
        # 修复: 电子使用 e.atom_x/e.atom_y (Electron.update 只读这俩字段)
        ax, ay = self.x, self.y
        for p in self.proton_list:
            p.base_x = ax
            p.base_y = ay
            p.update()
        for n in self.neutron_list:
            n.base_x = ax
            n.base_y = ay
            n.update()
        # 修复: 电子的实际字段是 atom_x/atom_y, 不是 center_x/center_y
        for e in self.electrons:
            e.atom_x = ax
            e.atom_y = ay
            e.update()

        # 轨道恢复
        if self.orbit_expanded:
            self.orbit_expand_timer -= 1
            if self.orbit_expand_timer <= 0:
                self._restore_orbits()

    def expand_orbits(self):
        # 防止重复展开: 已展开的电子再次 expand 会导致半径叠加
        if self.orbit_expanded:
            # 仅重置计时器，保留展开状态
            self.orbit_expand_timer = 40
            return
        for e in self.electrons:
            e.expand_orbit(1.8)
        self.orbit_expanded = True
        self.orbit_expand_timer = 40  # 约0.67s，肉眼可见
        # 优化: 刷新轨道半径缓存
        self._refresh_orbit_cache()

    def _restore_orbits(self):
        for e in self.electrons:
            e.restore_orbit()
        self.orbit_expanded = False
        # 优化: 刷新轨道半径缓存
        self._refresh_orbit_cache()

    def contains_point(self, px, py):
        # 优化: 平方比较代替 math.hypot
        dx = px - self.x
        dy = py - self.y
        return dx * dx + dy * dy < self.radius * self.radius

    def move_to(self, x, y):
        self.x = x
        self.y = y

    def set_velocity(self, vx, vy):
        self.vx = vx
        self.vy = vy

    def get_position(self):
        return (self.x, self.y)

    def accelerate(self, factor):
        # 保护: factor<=0 会让速度归零（且反转方向），导致原子永远静止
        if not isinstance(factor, (int, float)):
            return
        if factor <= 0:
            return
        self.vx *= factor
        self.vy *= factor
        # 优化: 平方比较代替 sqrt
        speed_sq = self.vx * self.vx + self.vy * self.vy
        if speed_sq > MAX_SPEED_SQ:
            speed = math.sqrt(speed_sq)
            self.vx = self.vx / speed * MAX_SPEED
            self.vy = self.vy / speed * MAX_SPEED