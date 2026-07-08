# molecule.py — 分子类

import math
import random
import heapq
from config import WINDOW_WIDTH, WINDOW_HEIGHT, MAX_SPEED, MAX_SPEED_SQ, ELEMENTS

class Molecule:
    def __init__(self, formula, atoms, bond_structure="H-H", bond_type="chain"):
        self.formula = formula
        self.atoms = atoms  # Atom 对象列表
        self.bond_structure = bond_structure
        self.bond_type = bond_type  # "chain", "bent", "complex"
        # 防御: 空原子列表会触发除零
        n = len(atoms)
        if n == 0:
            # 不应发生,但 API 不做检查时退化为默认值
            self.x = WINDOW_WIDTH / 2
            self.y = WINDOW_HEIGHT / 2
            self.vx = 0.0
            self.vy = 0.0
            self.radius = 30
            self.mass = 1.0
        else:
            self.x = sum(a.x for a in atoms) / n
            self.y = sum(a.y for a in atoms) / n
            self.vx = sum(a.vx for a in atoms) / n
            self.vy = sum(a.vy for a in atoms) / n
            self.radius = max(a.radius for a in atoms) + 20
            self.mass = sum(a.mass for a in atoms)
        self.angle = random.uniform(0, 2 * math.pi)
        self.angular_vel = random.uniform(-0.01, 0.01)
        self.selected = False
        self.dragging = False
        # P0-3: 分子轨迹
        from effects import Trail
        self._trail = Trail(max_len=10)
        self._trail_enabled = True

        # 键数: 累加结构中所有键级
        # 修复: O=C=O 有 2 个 = 应该是 4 (2 个双键 = 4 个键), 之前只检测到 1 个 = 给 2 (1 个双键 = 2 键)
        # ≡ 是单字符, count 不会把它当成 3 个 = 重数
        num_triple = bond_structure.count("≡")
        num_double = bond_structure.count("=")  # 普通 = (双键)
        # 每个 = 贡献 2 键 (双键), 每个 ≡ 贡献 3 键 (三键)
        self.bond_order = num_triple * 3 + num_double * 2
        if self.bond_order < 1:
            self.bond_order = 1

        # 键连接定义: 哪些原子之间有键 [(i, j, order), ...]
        self.bonds = []
        self._define_bonds()

        # 安排原子位置
        self._arrange_atoms()

        # 优化: 预计算重原子列表(质量最大前 2), 避免聚变碰撞中重复排序
        # 优化: 用 heapq.nlargest 代替 sorted[:2], 复杂度 O(n) vs O(n log n)
        self._heavy_atoms = heapq.nlargest(2, self.atoms, key=lambda a: a.mass)
        # 优化: 缓存是否含惰性气体, 避免化学碰撞中重复 any+isinstance
        self._has_noble = any(a.is_noble for a in self.atoms)

    def _refresh_caches(self):
        """P0-3: 刷新 _heavy_atoms 和 _has_noble 缓存
        在原子增减后必须调用, 否则 _heavy_atoms 持有悬空引用
        """
        # 修复: 防御性 - 当 atoms 为空时清空, 避免返回空列表后下游误用
        if not self.atoms:
            self._heavy_atoms = []
            self._has_noble = False
            return
        # 优化: heapq.nlargest 复杂度 O(n), 优于 sorted
        self._heavy_atoms = heapq.nlargest(2, self.atoms, key=lambda a: a.mass)
        self._has_noble = any(a.is_noble for a in self.atoms)

    def _define_bonds(self):
        """定义分子内化学键连接"""
        n = len(self.atoms)
        self.bonds = []

        if n == 2:
            # 双原子分子: bond_order 反映整体键级 (1=单, 2=双, 3=三)
            self.bonds = [(0, 1, self.bond_order)]
        elif n == 3:
            # 三原子分子: 总键级平均到各键
            # 例如 CO2 (O=C=O) bond_order=4 → 每键 2
            per_bond = max(1, self.bond_order // 2)
            if self.bond_type == "bent":
                # 弯曲型 (H2O 等): 各键都是单键, 中心原子提供 1+1 价
                self.bonds = [(0, 1, 1), (1, 2, 1)]
            elif self.bond_type == "complex":
                # 复合型: 类似 bent, 各键单键
                self.bonds = [(0, 1, 1), (1, 2, 1)]
            else:
                # 链式 (CO2=O=C=O=CO2 等): 总键级平均到 2 键
                self.bonds = [(0, 1, per_bond), (1, 2, per_bond)]
        elif n >= 4:
            if self.bond_type == "complex":
                # 复合型：中心原子连接所有其他原子
                for i in range(1, n):
                    self.bonds.append((0, i, 1))
            else:
                # 链式或其他
                for i in range(n - 1):
                    self.bonds.append((i, i + 1, 1))

    def _arrange_atoms(self):
        """根据分子中心位置安排所有原子位置"""
        n = len(self.atoms)
        if n == 0:
            # 防御: 空分子不安排原子
            return
        if n == 1:
            self.atoms[0].x = self.x
            self.atoms[0].y = self.y
            r = self.atoms[0].radius
            self.x = max(r, min(WINDOW_WIDTH - r, self.x))
            self.y = max(r, min(WINDOW_HEIGHT - r, self.y))
            self.atoms[0].x = self.x
            self.atoms[0].y = self.y
        elif n == 2:
            self.atoms[0].x = self.x - 30
            self.atoms[0].y = self.y
            self.atoms[1].x = self.x + 30
            self.atoms[1].y = self.y
            self._clamp_atoms_to_window()
        elif n == 3:
            if self.bond_type == "bent":
                # 弯曲型（V形）：中心原子 + 两端分别偏移
                self.atoms[1].x = self.x
                self.atoms[1].y = self.y
                self.atoms[0].x = self.x - 25
                self.atoms[0].y = self.y - 20
                self.atoms[2].x = self.x + 25
                self.atoms[2].y = self.y - 20
                self._clamp_atoms_to_window()
            elif self.bond_type == "complex":
                # 修复: n=3 complex (如 CH2): 中心原子 + 周围 2 原子按角度均匀分布
                self.atoms[0].x = self.x  # 中心
                self.atoms[0].y = self.y
                for i in (1, 2):
                    ang = self.angle + math.pi * (0.5 + (i - 1))  # 90°, 270°
                    self.atoms[i].x = self.x + math.cos(ang) * 28
                    self.atoms[i].y = self.y + math.sin(ang) * 28
                self._clamp_atoms_to_window()
            else:
                # 链式 / 其他：直线
                self.atoms[0].x = self.x - 35
                self.atoms[0].y = self.y
                self.atoms[1].x = self.x
                self.atoms[1].y = self.y
                self.atoms[2].x = self.x + 35
                self.atoms[2].y = self.y
                self._clamp_atoms_to_window()
        else:  # n >= 4
            if self.bond_type in ("chain", "bent"):
                # 修复: bent n>=4 (如 SO3) 走链式布局, 而非环状 (之前落入 else 分支画成环)
                # bent 在化学上是"带折角的链", 而非封闭环
                total_len = (n - 1) * 30
                start_x = self.x - total_len / 2
                # 边界保护: 防止原子超出窗口
                if start_x < 30:
                    self.x += 30 - start_x
                    start_x = 30
                if start_x + total_len > WINDOW_WIDTH - 30:
                    self.x -= (start_x + total_len) - (WINDOW_WIDTH - 30)
                    start_x = WINDOW_WIDTH - 30 - total_len
                # y 边界保护
                max_r = max(a.radius for a in self.atoms)
                if self.y - max_r < 30:
                    self.y = 30 + max_r
                if self.y + max_r > WINDOW_HEIGHT - 30:
                    self.y = WINDOW_HEIGHT - 30 - max_r
                for i, a in enumerate(self.atoms):
                    a.x = start_x + i * 30
                    a.y = self.y
            elif self.bond_type == "complex":
                # 修复: n>=4 complex: 中心原子在 self.x,self.y, 其余均匀环绕
                # 这与 _define_bonds 中的"中心连接所有"键结构一致
                self.atoms[0].x = self.x
                self.atoms[0].y = self.y
                for i in range(1, n):
                    ang = self.angle + 2 * math.pi * (i - 1) / (n - 1)
                    self.atoms[i].x = self.x + math.cos(ang) * 32
                    self.atoms[i].y = self.y + math.sin(ang) * 32
                self._clamp_atoms_to_window()
            else:
                # 环状排列: 起始角度 +π/2,让第一个原子在顶部
                base_angle = self.angle + math.pi / 2
                for i, a in enumerate(self.atoms):
                    ang = base_angle + 2 * math.pi * i / n
                    a.x = self.x + math.cos(ang) * 30
                    a.y = self.y + math.sin(ang) * 30
                self._clamp_atoms_to_window()

        # 初始化 _rel_x/_rel_y（用于后续增量移动）
        for a in self.atoms:
            a._rel_x = a.x - self.x
            a._rel_y = a.y - self.y

    def _clamp_atoms_to_window(self):
        """将分子内的原子限制在窗口内（自动平移分子中心）"""
        if not self.atoms:
            return
        # x 边界
        min_x = min(a.x - a.radius for a in self.atoms)
        if min_x < 30:
            shift = 30 - min_x
            self.x += shift
            for a in self.atoms:
                a.x += shift
        max_x = max(a.x + a.radius for a in self.atoms)
        if max_x > WINDOW_WIDTH - 30:
            shift = max_x - (WINDOW_WIDTH - 30)
            self.x -= shift
            for a in self.atoms:
                a.x -= shift
        # y 边界
        min_y = min(a.y - a.radius for a in self.atoms)
        if min_y < 30:
            shift = 30 - min_y
            self.y += shift
            for a in self.atoms:
                a.y += shift
        max_y = max(a.y + a.radius for a in self.atoms)
        if max_y > WINDOW_HEIGHT - 30:
            shift = max_y - (WINDOW_HEIGHT - 30)
            self.y -= shift
            for a in self.atoms:
                a.y -= shift

    def update(self, dt=1.0):
        if self.dragging:
            # 修复: 拖动中也要更新分子内原子的内部粒子位置, 防止电子/质子/中子停在原处
            # 修复: 电子字段是 atom_x/atom_y, 直接写属性避免方法调用
            for a in self.atoms:
                a.x = self.x + a._rel_x
                a.y = self.y + a._rel_y
                ax_a, ay_a = a.x, a.y
                for p in a.proton_list:
                    p.base_x = ax_a
                    p.base_y = ay_a
                    p.update()
                for n in a.neutron_list:
                    n.base_x = ax_a
                    n.base_y = ay_a
                    n.update()
                for e in a.electrons:
                    e.atom_x = ax_a
                    e.atom_y = ay_a
                    e.update()
            return
        self.x += self.vx * dt
        self.y += self.vy * dt
        # P0-3: 记录分子轨迹
        if self._trail_enabled:
            self._trail.add(self.x, self.y)
        # 修复: 角度按 dt 缩放,避免 speed_multiplier>1 时分子越转越快
        self.angle += self.angular_vel * dt
        # 优化: 直接 modulo 避免分支, 防止长期运行累计导致精度下降
        # Python float modulo 处理 0..2π 范围很快
        if self.angle > 6.2831853 or self.angle < -6.2831853:
            self.angle %= 6.2831853

        # 边界反弹
        if self.x - self.radius < 0:
            self.x = self.radius
            self.vx = abs(self.vx)
        if self.x + self.radius > WINDOW_WIDTH:
            self.x = WINDOW_WIDTH - self.radius
            self.vx = -abs(self.vx)
        if self.y - self.radius < 0:
            self.y = self.radius
            self.vy = abs(self.vy)
        if self.y + self.radius > WINDOW_HEIGHT:
            self.y = WINDOW_HEIGHT - self.radius
            self.vy = -abs(self.vy)

        speed_sq = self.vx**2 + self.vy**2
        if speed_sq > MAX_SPEED_SQ:
            speed = math.sqrt(speed_sq)
            self.vx = self.vx / speed * MAX_SPEED
            self.vy = self.vy / speed * MAX_SPEED

        # 优化: ang_step / cos_a / sin_a 提到 for 循环外, 避免每原子重复计算
        ang_step = self.angular_vel * dt
        cos_a = math.cos(ang_step)
        sin_a = math.sin(ang_step)
        # 增量移动原子（仅跟随平移/旋转，保留碰撞后的相对位移）
        for a in self.atoms:
            # 优化: _rel_x/_rel_y 在 _arrange_atoms 已保证设置, 去掉 hasattr 检查
            rx = a._rel_x * cos_a - a._rel_y * sin_a
            ry = a._rel_x * sin_a + a._rel_y * cos_a
            a._rel_x = rx
            a._rel_y = ry
            a.x = self.x + rx
            a.y = self.y + ry
            # 边界保护: 防止旋转/碰撞后原子飞出窗口
            # 修复: clamp 后同步更新 _rel_x/_rel_y, 防止分子长期贴边导致结构逐渐变形
            r = a.radius
            if a.x - r < 0:
                a.x = r
                a._rel_x = a.x - self.x
            elif a.x + r > WINDOW_WIDTH:
                a.x = WINDOW_WIDTH - r
                a._rel_x = a.x - self.x
            if a.y - r < 0:
                a.y = r
                a._rel_y = a.y - self.y
            elif a.y + r > WINDOW_HEIGHT:
                a.y = WINDOW_HEIGHT - r
                a._rel_y = a.y - self.y
            # 优化: 位置更新后立即更新内部粒子, 避免二次遍历
            # 修复: 内部粒子位置与原子位置同步, 否则粒子会滞留在旧位置
            # P-13: 直接写属性代替 set_base/set_center, 节省方法调用
            # 修复: 电子字段是 atom_x/atom_y, 不是 center_x/center_y
            ax_a, ay_a = a.x, a.y
            for p in a.proton_list:
                p.base_x = ax_a
                p.base_y = ay_a
                p.update()
            for n in a.neutron_list:
                n.base_x = ax_a
                n.base_y = ay_a
                n.update()
            for e in a.electrons:
                e.atom_x = ax_a
                e.atom_y = ay_a
                e.update()

    def contains_point(self, px, py):
        # 优化: 平方比较代替 math.hypot
        dx = px - self.x
        dy = py - self.y
        return dx * dx + dy * dy < self.radius * self.radius

    def get_position(self):
        return (self.x, self.y)

    def get_atom_symbols(self):
        return [a.symbol for a in self.atoms]

    def break_bonds(self):
        """断裂为独立原子，速度沿远离分子中心方向发散"""
        n = len(self.atoms)
        result = []
        jitter_r = 8
        # 优化: 一次性算所有 cos/sin 减少重复
        cos_cache = []
        sin_cache = []
        for i in range(n):
            ring_angle = 2 * math.pi * i / n
            cos_cache.append(math.cos(ring_angle))
            sin_cache.append(math.sin(ring_angle))
        for i, a in enumerate(self.atoms):
            # 径向方向（远离分子中心）
            dx = a.x - self.x
            dy = a.y - self.y
            dist = max(0.1, math.hypot(dx, dy))
            c = cos_cache[i]
            s = sin_cache[i]
            # 修复: 当 dist 极小(中心原子)时, 用 ring_angle 作为方向而非 0
            if dist < 1.0:
                ux = c
                uy = s
            else:
                ux = dx / dist
                uy = dy / dist
            # 分子速度 + 径向发散速度
            sp = random.uniform(2, 4)
            new_x = self.x + ux * 30 + c * jitter_r
            new_y = self.y + uy * 30 + s * jitter_r
            # 修复: 边界 clamp, 防止原子出现在屏幕外
            r = a.radius
            new_x = max(r + 5, min(WINDOW_WIDTH - r - 5, new_x))
            new_y = max(r + 5, min(WINDOW_HEIGHT - r - 5, new_y))
            a.x = new_x
            a.y = new_y
            a.vx = self.vx + ux * sp
            a.vy = self.vy + uy * sp
            result.append(a)
        return result

    def accelerate(self, factor):
        # 保护: factor<=0 会让速度归零（且反转方向），导致分子永远静止
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
