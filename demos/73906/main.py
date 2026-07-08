# main.py — 原子运动模拟器 主入口

import logging
import traceback
import heapq
import pygame
import sys
import random
import math
from config import (
    WINDOW_WIDTH, WINDOW_HEIGHT, FPS, ELEMENTS, NOBLE_GASES, CATEGORY_LABELS,
    HYDROGEN_SPAWN_INTERVAL, HYDROGEN_SPAWN_COUNT_MIN, HYDROGEN_SPAWN_COUNT_MAX,
    ENERGY_PULSE_STRENGTH, ENERGY_PULSE_DURATION, MAX_SPEED, MAX_SPEED_SQ,
    FUSION_SPEED_THRESHOLD, FUSION_SPEED_THRESHOLD_SQ,
    TEMPERATURE_PRESETS, PRESSURE_PRESETS, REACTION_CONDITIONS, temperature_to_color,
    get_reaction_flash_color, THERMAL_CONFIG, RADIOACTIVE_ISOTOPES,
    COOLING_CONFIG, SHAKE_CONFIG, CAMERA_CONFIG,
)
from atom import Atom
from molecule import Molecule
from effects import FlashEffect, BurstParticle, EnergyWave, PhotonParticle, ReactionLabel, ShockWave, Neutron as FreeNeutron
from physics import (
    check_collision, resolve_elastic_collision,
    try_chemical_reaction, try_fusion, get_relative_speed, get_relative_speed_sq,
    resolve_molecule_collision, resolve_atom_molecule_collision,
    get_local_density, try_radioactive_decay, try_fission,
    compute_kinetic_temperature, resolve_neutron_collision, apply_shockwave_force,
)
from renderer import Renderer
from spatial import SpatialGrid


class AtomSimulator:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption("原子运动模拟器 — 核聚变 & 化学反应")
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        self.clock = pygame.time.Clock()
        self.renderer = Renderer(self.screen)
        self.running = True

        # 状态
        self.atoms = []
        self.molecules = []
        self.flashes = []
        self.burst_particles = []
        self.energy_waves = []
        self.photon_particles = []
        self.reaction_labels = []
        # F2: 自由中子 (裂变链式反应)
        self.neutrons = []
        # F3: 冲击波
        self.shockwaves = []
        # F4: 动态温度模式 (按系统动能计算 T)
        self.dynamic_temperature = False
        self._temp_history = []  # 滑动平均
        self._temp_K_factor = THERMAL_CONFIG["K_default"]

        self.paused = False
        self.speed_multiplier = 1.0
        # 修复: 倍速累加器,实现小数倍速平滑运行
        self._speed_accumulator = 0.0
        self.energy_pulse_active = False
        self.energy_pulse_timer = 0
        self.energy_pulse_total = 0  # P0-6: 用于进度条
        # P0-6: 能量脉冲倒计时可视化
        self._energy_visual_x = 0
        self._energy_visual_y = 0
        self._energy_visual_radius = 0
        self._energy_visual_alpha = 0
        self.hydrogen_spawn_timer = 0
        # P1-1: FPS 跟踪
        self._fps_display = 0.0
        self._fps_frame_count = 0
        self._fps_time_acc = 0.0
        # P1-1: 帮助页
        self.help_visible = False
        # P1-2: 暂停提示渐隐
        self._pause_hint_alpha = 0
        # P0-2: 鼠标位置 (用于 hover)
        self.mouse_pos = (0, 0)
        # P0: 全局热力学参数 (用户可调)
        # 默认室温常压, 用户可通过 UI 调节
        self.temperature_K = TEMPERATURE_PRESETS["ambient"]  # 298 K
        self.pressure_atm = PRESSURE_PRESETS["ambient"]     # 1.0 atm
        # P0: 温度 → 屏幕背景色 (热辐射)
        self.bg_tint = (0, 0, 0)  # 背景色调叠加
        # P1-新: local_density 缓存 (key: 原子 idx → density), 每帧清空
        self._density_cache = {}
        self.selected_object = None
        self.dragging = False
        self.drag_offset_x = 0
        self.drag_offset_y = 0
        # 修复: 记录拖动开始位置, 用于判断"单击 vs 真正拖动" (>3px 才算拖动)
        self._drag_start_pos = (0, 0)
        self._drag_moved = False

        # 按钮点击
        self.btn_pause = None
        self.btn_energy = None
        self.slider_bar = None
        self.slider_dragging = False

        # 元素菜单
        self.element_menu_visible = False
        self.menu_pos = (0, 0)
        self.menu_draw_pos = (0, 0)  # 修正后的绘制位置
        # 所有 118 元素都在菜单中 (惰性气体也可生成, 虽然不反应)
        self.element_list = list(ELEMENTS.keys())
        self.element_list.sort(key=lambda s: ELEMENTS[s]["protons"])

        # 相机系统 (缩放/平移)
        self.camera_x = WINDOW_WIDTH / 2
        self.camera_y = WINDOW_HEIGHT / 2
        self.camera_zoom = 1.0
        self.panning = False
        self.pan_start_x = 0
        self.pan_start_y = 0
        self.pan_start_cx = 0
        self.pan_start_cy = 0

        # 初始化
        self._init_atoms()
        self.grid = SpatialGrid()

    def _init_atoms(self):
        """初始状态：60个氢原子 + 少量其他元素（避免初始重叠）"""
        placed = []  # 已放置的 (x, y, radius) 列表
        h_count = 0

        def try_place(symbol, x, y, vx, vy, min_dist=None):
            """尝试放置原子，若与已有重叠则不放置"""
            r = ELEMENTS[symbol]["radius"]
            md = min_dist if min_dist is not None else r * 2
            for px, py, pr in placed:
                if math.hypot(px - x, py - y) < pr + md:
                    return False
            self.atoms.append(Atom(symbol, x, y, vx, vy))
            placed.append((x, y, r))
            return True

        # 60个氢原子（带最小距离检测，更宽容的重试次数）
        target_h = 60
        attempts = 0
        max_attempts = 500  # 给予足够重试
        while h_count < target_h and attempts < max_attempts:
            x = random.uniform(50, WINDOW_WIDTH - 50)
            y = random.uniform(50, WINDOW_HEIGHT - 100)
            vx = random.uniform(-3.0, 3.0)
            vy = random.uniform(-3.0, 3.0)
            if try_place("H", x, y, vx, vy):
                h_count += 1
            attempts += 1

        # 额外: 2个碳, 2个氧, 1个氮（更大最小距离）
        for sym in ["C", "C", "O", "O", "N"]:
            attempts = 0
            placed_ok = False
            while attempts < 100:
                x = random.uniform(50, WINDOW_WIDTH - 50)
                y = random.uniform(50, WINDOW_HEIGHT - 100)
                if try_place(sym, x, y, 0, 0, min_dist=50):
                    placed_ok = True
                    break
                attempts += 1
            if not placed_ok:
                import sys
                print(f"警告: 无法为元素 {sym} 找到不重叠的位置 (已尝试 100 次)", file=sys.stderr)

    def _spawn_hydrogen(self):
        """从边缘补充氢原子（避免与现有原子重叠）"""
        # 最多尝试 5 次寻找不重叠的位置
        for _ in range(5):
            edge = random.choice(['top', 'bottom', 'left', 'right'])
            if edge == 'top':
                x = random.uniform(0, WINDOW_WIDTH)
                y = -10
                vx = random.uniform(-2, 2)
                vy = random.uniform(2, 5)
            elif edge == 'bottom':
                x = random.uniform(0, WINDOW_WIDTH)
                y = WINDOW_HEIGHT + 10
                vx = random.uniform(-2, 2)
                vy = random.uniform(-5, -2)
            elif edge == 'left':
                x = -10
                y = random.uniform(0, WINDOW_HEIGHT)
                vx = random.uniform(2, 5)
                vy = random.uniform(-2, 2)
            else:
                x = WINDOW_WIDTH + 10
                y = random.uniform(0, WINDOW_HEIGHT)
                vx = random.uniform(-5, -2)
                vy = random.uniform(-2, 2)

            # 检查不与现有原子/分子重叠
            # 优化: 平方比较代替 math.hypot
            collision = False
            for ea in self.atoms:
                ddx = ea.x - x
                ddy = ea.y - y
                r_sum = ea.radius + 20
                if ddx * ddx + ddy * ddy < r_sum * r_sum:
                    collision = True
                    break
            if not collision:
                # 修复: 也检查分子, 防止氢原子出现在分子内部
                for em in self.molecules:
                    ddx = em.x - x
                    ddy = em.y - y
                    r_sum = em.radius + 20
                    if ddx * ddx + ddy * ddy < r_sum * r_sum:
                        collision = True
                        break
            if not collision:
                self.atoms.append(Atom("H", x, y, vx, vy))
                return

        # 5 次都重叠则接受当前位置
        self.atoms.append(Atom("H", x, y, vx, vy))

    def _release_energy(self):
        """释放能量"""
        # 修复: 暂停时不响应能量释放(否则会瞬移)
        if self.paused:
            return
        self.energy_pulse_active = True
        self.energy_pulse_timer = ENERGY_PULSE_DURATION
        # P0-6: 记录总时长用于进度计算
        self.energy_pulse_total = ENERGY_PULSE_DURATION
        # 能量脉冲触发屏幕震动
        self.renderer.trigger_shake(SHAKE_CONFIG["energy_pulse"])
        # P0-6: 设置可视化初始参数 (屏幕中央脉冲圈)
        # 修复: 从屏幕中央扩散, 缩放随时间衰减
        self._energy_visual_x = WINDOW_WIDTH // 2
        self._energy_visual_y = WINDOW_HEIGHT // 2
        self._energy_visual_radius = 50
        self._energy_visual_alpha = 255

        # 修复: 所有原子加速 + 静止原子加随机冲量, 跳过 dragging 状态
        pulse_factor = 1.0 + ENERGY_PULSE_STRENGTH * 0.8
        # 优化: 速度平方阈值预计算, 避免每原子重复乘
        relax_sq = (MAX_SPEED * 0.7) ** 2
        for a in self.atoms:
            # 修复: 跳过拖动中的原子, 避免破坏拖动位置
            if a.dragging:
                continue
            sp_sq = a.vx * a.vx + a.vy * a.vy
            if sp_sq < relax_sq:
                # 修复: 静止原子 (vx=vy=0) 不能仅靠 multiply, 需要加随机冲量
                if sp_sq < 0.0001:
                    ang = random.uniform(0, 2 * math.pi)
                    a.vx = math.cos(ang) * 3.0
                    a.vy = math.sin(ang) * 3.0
                else:
                    a.accelerate(pulse_factor)
            # 同时执行电子跃迁
            a.expand_orbits()

        # 所有分子加速
        for m in self.molecules:
            sp_sq = m.vx * m.vx + m.vy * m.vy
            if sp_sq < relax_sq:
                # 修复: 静止分子同样加随机冲量
                if sp_sq < 0.0001:
                    ang = random.uniform(0, 2 * math.pi)
                    m.vx = math.cos(ang) * 3.0
                    m.vy = math.sin(ang) * 3.0
                else:
                    m.accelerate(pulse_factor)
            # 同时执行分子内原子电子跃迁
            for a in m.atoms:
                a.expand_orbits()

        # 分子断裂 - 跳过 dragging 分子
        broken = set()
        for m in self.molecules:
            # 修复: 跳过拖动中的分子
            if m.dragging:
                continue
            if m.bond_order <= 2:  # 单键和双键断裂
                new_atoms = m.break_bonds()
                broken.add(id(m))
                # 修复: 清除分子自身残留状态, 防止后续渲染/选中逻辑错乱
                m.dragging = False
                m.selected = False
                # 修复: 若 selected_object 指向本分子, 立即清空
                if self.selected_object is m:
                    self.selected_object = None
                for na in new_atoms:
                    # 修复: 新原子静止时给随机冲量
                    # 优化: 平方比较代替 math.hypot
                    sp_sq = na.vx * na.vx + na.vy * na.vy
                    if sp_sq < 0.0001:
                        ang = random.uniform(0, 2 * math.pi)
                        na.vx = math.cos(ang) * 3.0
                        na.vy = math.sin(ang) * 3.0
                    else:
                        na.accelerate(1.5)
                    # 修复: 强制清除新生原子的 dragging/selected 标志, 防止错位
                    na.dragging = False
                    na.selected = False
                    # P2: 验证新原子不与现有原子/分子重叠
                    # 优化: 平方比较代替 math.hypot
                    collision_found = False
                    for ea in self.atoms:
                        ddx = ea.x - na.x
                        ddy = ea.y - na.y
                        r_sum = ea.radius + na.radius + 5
                        if ddx * ddx + ddy * ddy < r_sum * r_sum:
                            collision_found = True
                            break
                    if not collision_found:
                        for em in self.molecules:
                            if id(em) in broken:
                                continue
                            ddx = em.x - na.x
                            ddy = em.y - na.y
                            r_sum = em.radius + na.radius + 5
                            if ddx * ddx + ddy * ddy < r_sum * r_sum:
                                collision_found = True
                                break
                    if collision_found:
                        # 沿新原子径向再外推 30px
                        na_dx = na.x - m.x
                        na_dy = na.y - m.y
                        na_dist = max(0.1, math.hypot(na_dx, na_dy))
                        push_x = na_dx / na_dist * 30
                        push_y = na_dy / na_dist * 30
                        na.x += push_x
                        na.y += push_y
                        # 边界 clamp
                        r = na.radius
                        na.x = max(r + 5, min(WINDOW_WIDTH - r - 5, na.x))
                        na.y = max(r + 5, min(WINDOW_HEIGHT - r - 5, na.y))
                    self.atoms.append(na)
        # 收集待删除的分子（在循环外删除，避免迭代中修改）
        self.molecules = [m for m in self.molecules if id(m) not in broken]

        # 全局能量波纹
        cx, cy = WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2
        self.energy_waves.append(EnergyWave(cx, cy, 300, 60))

        # 全局闪光（视觉冲击）
        self.flashes.append(FlashEffect(cx, cy, 250, 18))

        # 中心爆散粒子（橙色，象征能量辐射）
        for _ in range(24):
            ang = random.uniform(0, 2 * math.pi)
            sp = random.uniform(2, 6)
            self.burst_particles.append(
                BurstParticle(cx, cy, sp, ang, (255, 180, 80), lifetime=30)
            )

        # 光子粒子（电子跃迁释放）— 优先选电子多的原子
        # 修复: 同时收集自由原子和分子内原子, 避免重分子内电子跃迁视觉上比轻原子弱
        # 优化: 用 heapq.nlargest(30) 代替 sorted()[:30], 复杂度 O(n log 30) vs O(n log n)
        all_atoms_for_photon = list(self.atoms)
        for m in self.molecules:
            all_atoms_for_photon.extend(m.atoms)
        sorted_atoms = heapq.nlargest(30, all_atoms_for_photon, key=lambda a: len(a.electrons))
        for a in sorted_atoms:
            # 优化: 手动取前 2 个避免切片分配
            count = 0
            for e in a.electrons:
                if count >= 2:
                    break
                self.photon_particles.append(
                    PhotonParticle(e.x, e.y, (200, 220, 255))
                )
                count += 1

    def _spawn_atom_at(self, symbol, x, y):
        """在指定位置生成原子（避免与现有原子/分子重叠）"""
        # 优化: 缓存新原子半径, 外层计算最小距离平方阈值
        new_radius = ELEMENTS[symbol]["radius"]
        min_gap = 5
        min_dist_sq = (new_radius + min_gap) ** 2
        # 优化: 预算边界检查常量
        margin = 50
        margin_y = 60
        for dx, dy in [(0, 0), (0, -25), (0, 25), (25, 0), (-25, 0),
                       (0, -50), (0, 50), (50, 0), (-50, 0),
                       (30, -30), (-30, 30), (40, 40), (-40, -40)]:
            test_x, test_y = x + dx, y + dy
            if not (margin < test_x < WINDOW_WIDTH - margin and margin < test_y < WINDOW_HEIGHT - margin_y):
                continue
            collision = False
            # 优化: 平方比较代替 math.hypot
            for ea in self.atoms:
                ddx = ea.x - test_x
                ddy = ea.y - test_y
                r_sum = ea.radius + new_radius + min_gap
                if ddx * ddx + ddy * ddy < r_sum * r_sum:
                    collision = True
                    break
            if not collision:
                for em in self.molecules:
                    ddx = em.x - test_x
                    ddy = em.y - test_y
                    r_sum = em.radius + new_radius + min_gap
                    if ddx * ddx + ddy * ddy < r_sum * r_sum:
                        collision = True
                        break
            if not collision:
                self.atoms.append(Atom(symbol, test_x, test_y,
                                        random.uniform(-1, 1), random.uniform(-1, 1)))
                return
        # 全部失败，强制生成
        self.atoms.append(Atom(symbol, x, y, random.uniform(-1, 1), random.uniform(-1, 1)))

    def _cycle_temperature(self):
        """P0: T 键循环切换温度预设
        P1-4: 同时支持 [ / ] 微调 (1.5x / 0.67x), 实现精确温度控制
        """
        keys = list(TEMPERATURE_PRESETS.keys())
        # 找当前预设
        current_key = "ambient"
        for k, v in TEMPERATURE_PRESETS.items():
            if abs(self.temperature_K - v) < 1.0:
                current_key = k
                break
        idx = keys.index(current_key) if current_key in keys else 0
        new_idx = (idx + 1) % len(keys)
        new_key = keys[new_idx]
        self.temperature_K = TEMPERATURE_PRESETS[new_key]
        # 同时更新背景色调 (热辐射)
        self.bg_tint = temperature_to_color(self.temperature_K)
        # 同步提示标签
        self.reaction_labels.append(ReactionLabel(
            WINDOW_WIDTH // 2, 100,
            f"🌡 温度: {self.temperature_K:.0f} K ({new_key})"
        ))

    def _adjust_temperature(self, factor):
        """P1-4: 按比例调整温度 (用于 [/] 微调)
        修复: T_K 不超出 [0.1, 1e9] 物理合理范围
        """
        old = self.temperature_K
        new = old * factor
        # 修复: 防御性 clamp, 避免极小/极大值
        new = max(0.1, min(1e9, new))
        self.temperature_K = new
        self.bg_tint = temperature_to_color(new)
        # 同步提示
        self.reaction_labels.append(ReactionLabel(
            WINDOW_WIDTH // 2, 100,
            f"🌡 温度: {old:.0f}K → {new:.0f}K (×{factor})"
        ))

    def _adjust_pressure(self, factor):
        """P1-4: 按比例调整气压 (用于 Shift+[ / ] 微调)"""
        old = self.pressure_atm
        new = old * factor
        # 修复: 防御性 clamp, 避免极小/极大值
        new = max(1e-15, min(1e10, new))
        self.pressure_atm = new
        self.reaction_labels.append(ReactionLabel(
            WINDOW_WIDTH // 2, 100,
            f"💨 气压: {old:.2e} → {new:.2e} atm (×{factor})"
        ))

    def _cycle_pressure(self):
        """P0: Shift+P 循环切换气压预设"""
        keys = list(PRESSURE_PRESETS.keys())
        # 找当前预设 (对数比较, 避免浮点精度)
        import math
        current_key = "ambient"
        for k, v in PRESSURE_PRESETS.items():
            if self.pressure_atm > 0 and v > 0 and abs(math.log10(self.pressure_atm) - math.log10(v)) < 0.1:
                current_key = k
                break
        idx = keys.index(current_key) if current_key in keys else 0
        new_idx = (idx + 1) % len(keys)
        new_key = keys[new_idx]
        self.pressure_atm = PRESSURE_PRESETS[new_key]
        self.reaction_labels.append(ReactionLabel(
            WINDOW_WIDTH // 2, 130,
            f"💨 气压: {self.pressure_atm:.2e} atm ({new_key})"
        ))

    def _take_screenshot(self):
        """P0: p 键截图保存"""
        import os
        os.makedirs("screenshots", exist_ok=True)
        from datetime import datetime
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = f"screenshots/atom_{ts}.png"
        # 修复: flip 已经在 render 末尾调用, 直接 grab 当前 framebuffer
        try:
            pygame.image.save(self.renderer.screen, path)
            self.reaction_labels.append(ReactionLabel(
                WINDOW_WIDTH // 2, 160,
                f"📸 截图: {path}"
            ))
        except Exception as e:
            self.reaction_labels.append(ReactionLabel(
                WINDOW_WIDTH // 2, 160,
                f"截图失败: {e}"
            ))

    def _spawn_atom_at_mouse(self, sym):
        """P0-5: 在鼠标位置快速生成原子 (数字键)"""
        mx, my = self.mouse_pos
        # 修复: 边界保护, 避免在 UI 面板或窗口外生成
        if my >= WINDOW_HEIGHT - 50:
            my = WINDOW_HEIGHT - 80
        if mx < 30:
            mx = 30
        if mx > WINDOW_WIDTH - 30:
            mx = WINDOW_WIDTH - 30
        if my < 30:
            my = 30
        # 屏幕坐标 → 世界坐标
        wx, wy = self.renderer.screen_to_world(mx, my)
        self._spawn_atom_at(sym, wx, wy)

    def _find_predicted_reaction(self):
        """P1-5: 拖动时检测可反应邻居
        返回: (neighbor, label_text) 或 (None, None)
        """
        if not self.dragging or not self._drag_moved or not self.selected_object:
            return None, None
        sel = self.selected_object
        if isinstance(sel, Atom):
            t1 = sel.symbol
            sx, sy = sel.x, sel.y
        else:
            t1 = sel.formula
            sx, sy = sel.x, sel.y

        # 搜索最近邻居 (只在合理拖动距离内)
        # 优化: 用平方比较, max_search_radius = 200px
        best = None
        best_dsq = 200 * 200
        # 优先分子
        for m in self.molecules:
            if m is sel:
                continue
            ddx = m.x - sx
            ddy = m.y - sy
            dsq = ddx * ddx + ddy * ddy
            if dsq < best_dsq:
                # 检查 reaction cache
                from physics import _reaction_cache_lookup
                t2 = m.formula
                # 尝试双向
                for a, b in [(t1, t2), (t2, t1)]:
                    if _reaction_cache_lookup(a, b) is not None:
                        best = m
                        best_dsq = dsq
                        # 复用 main 的标签格式
                        label = f"{t1} + {t2} → ?"
                        return best, label
        # 其次原子
        for a in self.atoms:
            if a is sel:
                continue
            ddx = a.x - sx
            ddy = a.y - sy
            dsq = ddx * ddx + ddy * ddy
            if dsq < best_dsq:
                from physics import _reaction_cache_lookup
                t2 = a.symbol
                for x, y in [(t1, t2), (t2, t1)]:
                    if _reaction_cache_lookup(x, y) is not None:
                        best = a
                        best_dsq = dsq
                        label = f"{t1} + {t2} → ?"
                        return best, label
        return None, None

    def _get_hover_object(self):
        """P0-2: 找到鼠标当前 hover 的原子/分子

        修复: 不在菜单/UI 区域时跳过
        优化: 用平方比较代替 hypot
        """
        # 鼠标位置在 UI 区域或元素菜单时, 不显示 hover
        if self.element_menu_visible:
            return None
        # 优化: 预算当前鼠标位置 (屏幕坐标 → 世界坐标)
        mx, my = self.mouse_pos
        # 跳过 UI 底部面板
        if my >= WINDOW_HEIGHT - 50:
            return None
        # 转换鼠标屏幕坐标到世界坐标
        wx, wy = self.renderer.screen_to_world(mx, my)
        # 优先: 分子 (分子是更"大"的对象, 选中范围更大)
        # 优化: 平方比较
        best = None
        best_dsq = float("inf")
        for m in self.molecules:
            ddx = m.x - wx
            ddy = m.y - wy
            # 修复: 分子半径 = self.radius, 选中范围 = 半径
            dsq = ddx * ddx + ddy * ddy
            r = m.radius
            if dsq < r * r and dsq < best_dsq:
                best = m
                best_dsq = dsq
        if best is not None:
            return best
        # 其次: 自由原子
        for a in self.atoms:
            ddx = a.x - wx
            ddy = a.y - wy
            dsq = ddx * ddx + ddy * ddy
            r = a.radius
            if dsq < r * r and dsq < best_dsq:
                best = a
                best_dsq = dsq
        return best

    def _build_selected_info_lines(self):
        """P0-3: 构建选中物体的多行信息卡

        返回 list[str], 每行一句, 不会截断
        """
        sel = self.selected_object
        if isinstance(sel, Atom):
            el = ELEMENTS.get(sel.symbol, {})
            cat_label = CATEGORY_LABELS.get(el.get("category", "nonmetal"), "非金属")
            weight = el.get("atomic_weight", sel.mass / 14.0)
            e_config = el.get("e_config", "未知")
            # 第一行: 名称 + 符号
            line1 = f"【原子】 {sel.name} ({sel.symbol})  [{cat_label}]"
            # 第二行: 物理量
            line2 = f"质子: {sel.protons}  中子: {sel.neutrons}  电子: {len(sel.electrons)}  原子量: {weight:.3f}"
            # 第三行: 电子构型
            line3 = f"电子构型: {e_config}"
            # 第四行: 速度
            # 优化: 平方计算代替 math.hypot, 少一次 sqrt
            sp = math.sqrt(sel.vx * sel.vx + sel.vy * sel.vy)
            line4 = f"速度: {sp:.2f} 单位/秒"
            return [line1, line2, line3, line4]
        elif isinstance(sel, Molecule):
            m = sel
            # 第一行: 分子式 + 键结构
            line1 = f"【分子】 {m.formula}  键: {m.bond_structure}"
            # 第二行: 原子组成
            atoms_str = " ".join(f"{a.symbol}({a.protons})" for a in m.atoms)
            line2 = f"原子: {atoms_str}"
            # 第三行: 物性
            line3 = f"分子量: {m.mass:.3f}  键级: {m.bond_order}  类型: {m.bond_type}"
            # 第四行: 速度
            # 优化: 平方计算代替 math.hypot
            sp = math.sqrt(m.vx * m.vx + m.vy * m.vy)
            line4 = f"速度: {sp:.2f}  角速度: {m.angular_vel:.3f}  含 {len(m.atoms)} 个原子"
            return [line1, line2, line3, line4]
        return None

    def _update_pause_hint(self):
        """P1-2: 更新暂停提示透明度
        暂停时立即满显, 解除暂停后 1 秒渐隐到 0
        """
        if self.paused:
            self._pause_hint_alpha = 255
        else:
            # 解除后渐隐, 每帧 -8 (约 30 帧 / 0.5 秒)
            if self._pause_hint_alpha > 0:
                self._pause_hint_alpha = max(0, self._pause_hint_alpha - 8)

    def _delete_selected(self):
        """P0-2: 删除选中的原子或分子"""
        if not self.selected_object:
            return
        sel = self.selected_object
        # 取消其选中状态
        if hasattr(sel, 'selected'):
            sel.selected = False
        if hasattr(sel, 'dragging'):
            sel.dragging = False
        # 从对应列表移除
        if isinstance(sel, Atom):
            if sel in self.atoms:
                self.atoms.remove(sel)
        elif isinstance(sel, Molecule):
            if sel in self.molecules:
                self.molecules.remove(sel)
            # 分子内原子也清理
            for a in sel.atoms:
                a.dragging = False
                a.selected = False
        # 清空选中状态
        self.selected_object = None
        self._drag_moved = False
        self._drag_start_pos = (0, 0)

    def _clear_all(self):
        self.atoms.clear()
        self.molecules.clear()
        self.flashes.clear()
        self.burst_particles.clear()
        self.energy_waves.clear()
        self.photon_particles.clear()
        self.reaction_labels.clear()
        self.neutrons.clear()
        self.shockwaves.clear()
        # 修复: 清理所有交互状态,避免悬空引用
        self.selected_object = None
        self.dragging = False
        # 修复: 重置 drag_offset, 防止下次拖动使用陈旧偏移导致位置跳跃
        self.drag_offset_x = 0
        self.drag_offset_y = 0
        # 修复: 重置 _drag_moved 和 _drag_start_pos, 避免残留状态
        self._drag_moved = False
        self._drag_start_pos = (0, 0)
        # 修复: 重置 _speed_accumulator, 避免上次残留导致行为不一致
        self._speed_accumulator = 0.0
        self.slider_dragging = False
        self.element_menu_visible = False
        # 修复: 清空菜单文本缓存, 保证下次打开时重建
        if hasattr(self, '_menu_text_cache'):
            self._menu_text_cache = None
        self.energy_pulse_active = False
        self.energy_pulse_timer = 0
        # 重新初始化少量原子，避免场景完全空白
        self.hydrogen_spawn_timer = 0
        # 均匀分布在窗口内（而非全部从边缘涌入）
        # 修复: 增加最小距离检测,避免瞬间重叠原子
        new_h_radius = ELEMENTS["H"]["radius"]
        min_dist = new_h_radius * 2 + 5
        for _ in range(20):
            placed = False
            for _try in range(50):
                x = random.uniform(50, WINDOW_WIDTH - 50)
                y = random.uniform(50, WINDOW_HEIGHT - 60)
                collision = False
                for ea in self.atoms:
                    if math.hypot(ea.x - x, ea.y - y) < ea.radius + new_h_radius + 5:
                        collision = True
                        break
                if not collision:
                    vx = random.uniform(-2, 2)
                    vy = random.uniform(-2, 2)
                    self.atoms.append(Atom("H", x, y, vx, vy))
                    placed = True
                    break
            if not placed:
                # 实在找不到位置, 直接放一个
                x = random.uniform(50, WINDOW_WIDTH - 50)
                y = random.uniform(50, WINDOW_HEIGHT - 60)
                vx = random.uniform(-2, 2)
                vy = random.uniform(-2, 2)
                self.atoms.append(Atom("H", x, y, vx, vy))

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            # 修复: 窗口失焦时强制重置拖动状态,避免死锁
            elif event.type == pygame.ACTIVEEVENT:
                if event.gain == 0 and self.dragging:
                    # 窗口失焦
                    if self.selected_object:
                        self.selected_object.selected = False
                        if isinstance(self.selected_object, Molecule):
                            self.selected_object.dragging = False
                        elif isinstance(self.selected_object, Atom):
                            self.selected_object.dragging = False
                    self.dragging = False
                    self.selected_object = None
                    self.slider_dragging = False
                    # 修复: 重置 _drag_moved 和 _drag_start_pos, 避免残留状态
                    self._drag_moved = False
                    self._drag_start_pos = (0, 0)

            elif event.type == pygame.KEYDOWN:
                # 修复: 忽略操作系统自动重复产生的 KEYDOWN 事件,
                # 避免长按空格/K_e 等键导致状态被反复切换
                if event.repeat:
                    continue
                if event.key == pygame.K_SPACE:
                    self.paused = not self.paused
                elif event.key == pygame.K_e:
                    self._release_energy()
                elif event.key == pygame.K_c:
                    self._clear_all()
                elif event.key == pygame.K_r:
                    # R 键重置场景 (先清空再初始化)
                    self._clear_all()
                    self._init_atoms()
                elif event.key in (pygame.K_DELETE, pygame.K_BACKSPACE):
                    # P0-2: Delete/Backspace 删除选中物体
                    self._delete_selected()
                elif event.key == pygame.K_f1:
                    # P1-1: F1 切换帮助页
                    self.help_visible = not getattr(self, 'help_visible', False)
                elif event.key == pygame.K_t:
                    # P0: T 键调节温度
                    self._cycle_temperature()
                elif event.key == pygame.K_p:
                    # 修复: P 键改为气压 (pause 已用 SPACE)
                    # 修复: 区分大小写, 大写 P 气压, 小写 p 截图
                    if event.mod & pygame.KMOD_SHIFT:
                        self._cycle_pressure()
                    else:
                        self._take_screenshot()
                elif event.key in (pygame.K_1, pygame.K_2, pygame.K_3, pygame.K_4,
                                   pygame.K_5, pygame.K_6, pygame.K_7, pygame.K_8,
                                   pygame.K_9, pygame.K_0):
                    # P0-5: 数字键 1-8 快速生成常用元素 (鼠标位置)
                    # F2: 9=U, 0=Pu (放射性元素)
                    key_to_element = {
                        pygame.K_1: "H", pygame.K_2: "He", pygame.K_3: "C",
                        pygame.K_4: "N", pygame.K_5: "O", pygame.K_6: "Na",
                        pygame.K_7: "Cl", pygame.K_8: "Fe",
                        pygame.K_9: "U", pygame.K_0: "Pu",
                    }
                    sym = key_to_element[event.key]
                    self._spawn_atom_at_mouse(sym)
                elif event.key == pygame.K_MINUS:
                    # - 键: 生成钍 (Th)
                    self._spawn_atom_at_mouse("Th")
                elif event.key == pygame.K_EQUALS or event.key == pygame.K_KP_PLUS:
                    # = 键: 倍速微调 +0.25x
                    self.speed_multiplier = min(5.0, self.speed_multiplier + 0.25)
                elif event.key == pygame.K_COMMA:
                    # , 键: 倍速粗调 ÷1.5
                    self.speed_multiplier = max(0.1, self.speed_multiplier / 1.5)
                elif event.key == pygame.K_PERIOD:
                    # . 键: 倍速粗调 ×1.5
                    self.speed_multiplier = min(5.0, self.speed_multiplier * 1.5)
                elif event.key == pygame.K_HOME:
                    # Home 键: 重置相机
                    self.camera_x = WINDOW_WIDTH / 2
                    self.camera_y = WINDOW_HEIGHT / 2
                    self.camera_zoom = 1.0
                elif event.key == pygame.K_g:
                    # G 键: 切换动态温度模式 (F4)
                    self.dynamic_temperature = not self.dynamic_temperature
                    if self.dynamic_temperature:
                        self._temp_history = []
                elif event.key == pygame.K_n:
                    # N 键: 在鼠标位置释放几个中子 (触发裂变链式反应)
                    mx, my = self.mouse_pos
                    # 屏幕坐标 → 世界坐标
                    wx, wy = self.renderer.screen_to_world(mx, my)
                    import random
                    for _ in range(3):
                        angle = random.uniform(0, 2 * math.pi)
                        speed = random.uniform(5, 10)
                        from effects import Neutron as FreeN
                        self.neutrons.append(FreeN(wx, wy,
                                                    math.cos(angle) * speed,
                                                    math.sin(angle) * speed))
                elif event.key in (pygame.K_LEFTBRACKET, pygame.K_RIGHTBRACKET):
                    # P1-4: [ / ] 微调温度/气压 (按比例)
                    # 修复: [ 减小, ] 增大 (与化学式书写顺序一致)
                    # 修复: Shift+[ 调气压, 否则调温度
                    factor = 1.5
                    if event.key == pygame.K_LEFTBRACKET:
                        factor = 1.0 / 1.5
                    if event.mod & pygame.KMOD_SHIFT:
                        self._adjust_pressure(factor)
                    else:
                        self._adjust_temperature(factor)
                elif event.key == pygame.K_ESCAPE:
                    # 修复: 优先关闭元素菜单/帮助页, 而不是直接退出
                    if self.element_menu_visible:
                        self.element_menu_visible = False
                        continue
                    if getattr(self, 'help_visible', False):
                        self.help_visible = False
                        continue
                    self.running = False

            elif event.type == pygame.MOUSEBUTTONDOWN:
                mx, my = event.pos

                # 中键: 开始平移视角
                if event.button == 2:
                    self.panning = True
                    self.pan_start_x = mx
                    self.pan_start_y = my
                    self.pan_start_cx = self.camera_x
                    self.pan_start_cy = self.camera_y
                    continue

                # 滚轮处理在 MOUSEWHEEL 事件中 (pygame 2)
                # 但在某些 pygame 版本中滚轮表现为 button 4/5
                if event.button == 4:  # 滚轮上 (zoom in)
                    self._zoom_at_mouse(mx, my, zoom_in=True)
                    continue
                if event.button == 5:  # 滚轮下 (zoom out)
                    self._zoom_at_mouse(mx, my, zoom_in=False)
                    continue

                # 右键关闭菜单
                if event.button == 3:
                    self.element_menu_visible = False
                    continue

                # 左键处理
                if event.button != 1:
                    continue

                # 如果正在平移, 不处理左键
                if self.panning:
                    continue

                # 关闭元素菜单
                if self.element_menu_visible:
                    self._handle_menu_click(mx, my)
                    self.element_menu_visible = False
                    continue

                # 修复: 点击新物体前先清理旧拖动状态,防止旧原子状态泄漏卡死
                if self.dragging and self.selected_object:
                    old_obj = self.selected_object
                    old_obj.selected = False
                    old_obj.dragging = False
                    # 修复: 同步清除分子内原子的 dragging 状态
                    if isinstance(old_obj, Molecule):
                        for a in old_obj.atoms:
                            a.dragging = False
                    self.dragging = False
                    # 修复: 重置 _drag_moved 标志,防止新点击立即被识别为"已移动"
                    self._drag_moved = False

                # 检查 UI 按钮 (屏幕坐标, 不转换)
                if self.btn_pause and self.btn_pause.collidepoint(mx, my):
                    self.paused = not self.paused
                    continue
                if self.btn_energy and self.btn_energy.collidepoint(mx, my):
                    self._release_energy()
                    continue
                if self.slider_bar and self.slider_bar.collidepoint(mx, my):
                    self.slider_dragging = True
                    self._update_slider(mx)
                    continue

                # 屏幕坐标 → 世界坐标 (用于碰撞检测)
                wx, wy = self.renderer.screen_to_world(mx, my)

                # 检查是否点击了原子 (世界坐标命中检测)
                clicked = False
                for a in reversed(self.atoms):
                    if a.contains_point(wx, wy):
                        self.selected_object = a
                        a.selected = True
                        a.dragging = True  # 让 Atom.update 暂停位置更新
                        self.dragging = True
                        self.drag_offset_x = a.x - wx
                        self.drag_offset_y = a.y - wy
                        # 修复: 记录起始位置, 区分单击和拖动
                        self._drag_start_pos = (mx, my)
                        self._drag_moved = False
                        clicked = True
                        break

                # 检查分子 (世界坐标命中检测)
                if not clicked:
                    for m in reversed(self.molecules):
                        if m.contains_point(wx, wy):
                            self.selected_object = m
                            m.selected = True
                            m.dragging = True
                            self.dragging = True
                            self.drag_offset_x = m.x - wx
                            self.drag_offset_y = m.y - wy
                            # 修复: 记录起始位置
                            self._drag_start_pos = (mx, my)
                            self._drag_moved = False
                            clicked = True
                            break

                # 点击空白 → 弹出元素菜单（限制在窗口内）
                if not clicked and my < WINDOW_HEIGHT - 50:
                    # 修复: 弹出菜单前清空旧选中状态
                    if self.selected_object and not self.dragging:
                        self.selected_object.selected = False
                        self.selected_object = None
                    self.element_menu_visible = True
                    self.menu_pos = (mx, my)
                    # 立即计算 menu_draw_pos 以便同一帧内点击就能命中
                    self.menu_draw_pos = self._compute_menu_draw_pos(mx, my)

            elif event.type == pygame.MOUSEBUTTONUP:
                # 中键释放: 停止平移
                if event.button == 2:
                    self.panning = False
                    continue
                if self.dragging:
                    # 修复: 只有真正移动过 (drag_moved=True) 才算"拖动完成", 取消选中
                    # 否则视为单击, 保留选中状态
                    if self._drag_moved and self.selected_object:
                        self.selected_object.selected = False
                        if isinstance(self.selected_object, Molecule):
                            self.selected_object.dragging = False
                            # 修复: 同步清除分子内原子的 dragging
                            for a in self.selected_object.atoms:
                                a.dragging = False
                        elif isinstance(self.selected_object, Atom):
                            self.selected_object.dragging = False
                        self.selected_object = None
                    # 即使没真正拖动, 也清除 dragging 状态 (但保留 selected_object)
                    elif self.selected_object:
                        if isinstance(self.selected_object, Molecule):
                            self.selected_object.dragging = False
                            for a in self.selected_object.atoms:
                                a.dragging = False
                        elif isinstance(self.selected_object, Atom):
                            self.selected_object.dragging = False
                    self.dragging = False
                    self._drag_moved = False
                self.slider_dragging = False

            elif event.type == pygame.MOUSEMOTION:
                # P0-2: 记录鼠标位置用于 hover 检测
                self.mouse_pos = event.pos

                # 中键平移
                if self.panning:
                    mx, my = event.pos
                    dx = mx - self.pan_start_x
                    dy = my - self.pan_start_y
                    self.camera_x = self.pan_start_cx - dx / self.camera_zoom
                    self.camera_y = self.pan_start_cy - dy / self.camera_zoom
                    continue

                if self.dragging and self.selected_object:
                    mx, my = event.pos
                    # 修复: 鼠标移动超过 3px 才算"真正拖动", 否则视为单击
                    if not self._drag_moved:
                        start_x, start_y = self._drag_start_pos
                        # 优化: 平方比较代替 math.hypot
                        dx_m = mx - start_x
                        dy_m = my - start_y
                        if dx_m * dx_m + dy_m * dy_m > 9:
                            self._drag_moved = True
                    # 屏幕坐标 → 世界坐标
                    wx, wy = self.renderer.screen_to_world(mx, my)
                    new_x = wx + self.drag_offset_x
                    new_y = wy + self.drag_offset_y
                    # 计算位移并更新分子/原子的相对位置
                    if isinstance(self.selected_object, Molecule):
                        mol = self.selected_object
                        dx = new_x - mol.x
                        dy = new_y - mol.y
                        mol.x = new_x
                        mol.y = new_y
                        # 修复: 同步分子内原子的内部粒子基座, 防止电子/质子停留在原处
                        for a in mol.atoms:
                            a.x += dx
                            a.y += dy
                            # _rel_x/_rel_y 保持不变
                            a.dragging = True  # 修复: 同步设置 a.dragging, 防止 Atom.update 推动
                        mol.vx = 0
                        mol.vy = 0
                    else:
                        self.selected_object.x = new_x
                        self.selected_object.y = new_y
                        self.selected_object.vx = 0
                        self.selected_object.vy = 0
                if self.slider_dragging:
                    self._update_slider(event.pos[0])

            elif event.type == pygame.MOUSEWHEEL:
                # pygame 2: 鼠标滚轮事件
                mx, my = self.mouse_pos
                if event.y > 0:
                    self._zoom_at_mouse(mx, my, zoom_in=True)
                elif event.y < 0:
                    self._zoom_at_mouse(mx, my, zoom_in=False)

    def _zoom_at_mouse(self, mx, my, zoom_in=True):
        """以鼠标位置为中心缩放"""
        # 记录缩放前鼠标指向的世界坐标
        wx_before = (mx - WINDOW_WIDTH / 2) / self.camera_zoom + self.camera_x
        wy_before = (my - WINDOW_HEIGHT / 2) / self.camera_zoom + self.camera_y
        if zoom_in:
            self.camera_zoom = min(CAMERA_CONFIG["zoom_max"],
                                   self.camera_zoom * CAMERA_CONFIG["zoom_step"])
        else:
            self.camera_zoom = max(CAMERA_CONFIG["zoom_min"],
                                   self.camera_zoom / CAMERA_CONFIG["zoom_step"])
        # 调整相机位置使鼠标指向的世界坐标点保持在鼠标下方
        self.camera_x = wx_before - (mx - WINDOW_WIDTH / 2) / self.camera_zoom
        self.camera_y = wy_before - (my - WINDOW_HEIGHT / 2) / self.camera_zoom

    def _handle_menu_click(self, mx, my):
        """处理元素菜单点击 (紧凑 118 元素布局)"""
        menu_x, menu_y = self.menu_draw_pos
        item_height = 22
        items_per_col = 24
        col_width = 90
        cols = (len(self.element_list) + items_per_col - 1) // items_per_col

        for i, sym in enumerate(self.element_list):
            col = i // items_per_col
            row = i % items_per_col
            item_x = menu_x + 5 + col * col_width
            item_y = menu_y + 5 + row * item_height
            rect = pygame.Rect(item_x, item_y, col_width - 10, item_height - 2)
            if rect.collidepoint(mx, my):
                # 菜单弹出位置是屏幕坐标, 转换为世界坐标再生成
                px, py = self.menu_pos
                wx, wy = self.renderer.screen_to_world(px, py)
                self._spawn_atom_at(sym, wx, wy)
                return

    def _update_slider(self, mx):
        if self.slider_bar:
            left = self.slider_bar.x
            right = self.slider_bar.x + self.slider_bar.width
            width = right - left
            if width <= 0:
                return
            ratio = (mx - left) / width
            ratio = max(0, min(1, ratio))
            self.speed_multiplier = 0.5 + ratio * 2.5

    def update(self):
        # 修复: 特效在 paused 时仍更新, 让闪光/标签自然衰减消失
        self._update_effects()
        if self.paused:
            return
        # 修复: 氢原子补充 timer 按 wall clock 累加, 不受 frames=0 (speed_multiplier<1) 影响
        # 这样 0.5x 慢放时氢仍按正常节奏补充
        self.hydrogen_spawn_timer += 1.0
        if self.hydrogen_spawn_timer >= HYDROGEN_SPAWN_INTERVAL:
            self.hydrogen_spawn_timer = 0
            count = random.randint(HYDROGEN_SPAWN_COUNT_MIN, HYDROGEN_SPAWN_COUNT_MAX)
            for _ in range(count):
                self._spawn_hydrogen()

        # 修复: 能量脉冲 timer 按 wall clock 递减, 0.5x 慢放时也能正常结束
        if self.energy_pulse_active:
            self.energy_pulse_timer -= 1
            if self.energy_pulse_timer <= 0:
                self.energy_pulse_active = False
                # 结束时执行一次阻尼衰减
                # 修复: 仅对真正在动的原子进行衰减, 静止原子 vx=vy=0 时 *= 0.5 无意义
                # 修复: 跳过 dragging 的原子, 防止拖动状态被破坏
                for a in self.atoms:
                    if a.dragging:
                        continue
                    if a.vx != 0 or a.vy != 0:
                        a.vx *= 0.5
                        a.vy *= 0.5
                for m in self.molecules:
                    if m.dragging:
                        continue
                    if m.vx != 0 or m.vy != 0:
                        m.vx *= 0.5
                        m.vy *= 0.5

        # 修复: 使用累加器模式,保持小数倍速 (0.5x~3.0x 全部平滑)
        # 累加器累计小数倍速,每累计到 1 就跑一帧,余下的小数累计到下次
        # 这样 0.5x 实际每秒只跑 30 帧, 3.0x 跑 180 帧
        self._speed_accumulator += self.speed_multiplier
        frames = int(self._speed_accumulator)
        self._speed_accumulator -= frames
        if frames < 1:
            return  # 修复: <1x 速度时本帧不模拟任何步骤
        # 修复: 角度、布朗运动、速度积分等"每帧"操作应按时间步长缩放,
        # 否则 speed_multiplier=3 时所有"每帧"操作会被执行 3 次,角速度等被错误放大
        dt = 1.0 / frames

        for step_idx in range(frames):
            # 修复: 倍速下,除最后一个 step 外跳过碰撞检测,
            # 避免同一原子在 dt 内被多次判定碰撞
            skip_collisions = (step_idx != frames - 1)
            # apply_damping 已在 update() 开头按 wall clock 处理, _update_step 不再需要
            self._update_step(dt=dt, skip_collisions=skip_collisions)

    def _update_step(self, dt=1.0, skip_collisions=False):
        # 修复: 氢原子补充已移到 update() 开头 (按 wall clock 累加)
        # 高倍速时不会爆炸, 0.5x 慢放时仍正常补充

        # 更新原子
        for a in self.atoms:
            a.update(dt=dt)

        # 更新分子
        for m in self.molecules:
            m.update(dt=dt)

        # F2: 更新自由中子
        for n in self.neutrons:
            n.update()

        # F3: 更新冲击波
        for sw in self.shockwaves:
            sw.update()

        # 一次性构建空间网格（原子+分子，不同偏移区分类型）
        self._build_spatial_grid()

        # 修复: 倍速下,除最后一个 step 外跳过碰撞检测,避免同一原子在 dt 内被多次判定
        if not skip_collisions:
            # 原子-原子碰撞
            self._check_atom_atom_collisions()

            # 原子-分子碰撞
            self._check_atom_molecule_collisions()

            # 分子-分子碰撞
            self._check_molecule_molecule_collisions()

            # F2: 中子-原子碰撞 (裂变触发)
            self._check_neutron_collisions()

        # F1: 放射性衰变检查 (每帧,不受倍速影响)
        if not skip_collisions:
            self._check_radioactive_decay()

        # F3: 冲击波施加力
        if self.shockwaves:
            self._apply_shockwave_forces()

        # 黑体辐射冷却 (速度阻尼): 基础阻尼 + 热阻尼(v² 项)
        if COOLING_CONFIG["enabled"]:
            base_damp = COOLING_CONFIG["damping_base"]
            thermal_damp = COOLING_CONFIG["damping_thermal"]
            min_v = COOLING_CONFIG["min_velocity"]
            for a in self.atoms:
                vx, vy = a.vx, a.vy
                sp_sq = vx*vx + vy*vy
                if sp_sq < min_v * min_v:
                    continue
                sp = math.sqrt(sp_sq)
                # 基础阻尼 (微弱阻力)
                damp = base_damp
                # 热阻尼: 速度越快阻尼越大 (模拟高速粒子辐射能量更多)
                damp -= thermal_damp * sp_sq
                damp = max(0.9, damp)  # 防止过阻尼
                a.vx = vx * damp
                a.vy = vy * damp
            for m in self.molecules:
                vx, vy = m.vx, m.vy
                sp_sq = vx*vx + vy*vy
                if sp_sq < min_v * min_v:
                    continue
                sp = math.sqrt(sp_sq)
                damp = base_damp
                damp -= thermal_damp * sp_sq
                damp = max(0.9, damp)
                m.vx = vx * damp
                m.vy = vy * damp

        # F4: 动态温度计算
        if self.dynamic_temperature and not skip_collisions:
            self._update_dynamic_temperature()

        # 清理已死亡的中子和冲击波
        self.neutrons = [n for n in self.neutrons if n.timer > 0]
        self.shockwaves = [s for s in self.shockwaves if s.timer > 0 and s.radius < s.max_radius]

        # 修复: 能量脉冲 timer 已在 update() 开头按 wall clock 处理
        # 不再在 _update_step 内重复, 避免倍速下重复衰减

        # 修复: 特效在 update() 开头已更新, _update_step 内不再重复
        # (paused 时也要更新特效, 移到 update() 开头)

    def _build_spatial_grid(self):
        """一次性构建空间网格，包含原子和分子，用不同偏移区分类型"""
        self.grid.clear()
        # P1-新: 清空 local_density 缓存 (新帧所有 idx 重新计算)
        self._density_cache.clear()
        # 原子用 0~N-1 和 100000~100000+N-1 两套索引（分别用于原子-原子和原子-分子碰撞）
        # 优化: 用 insert_multi 复用 _get_cells 结果, 避免重复算 4 次 // cell_size
        for i, a in enumerate(self.atoms):
            self.grid.insert_multi(a, (i, 100000 + i))
        # 分子用 200000~200000+M-1 索引
        for j, m in enumerate(self.molecules):
            self.grid.insert(m, 200000 + j)

    def _clear_dangling_selection(self, *removed_objects):
        """若 selected_object 在已移除列表中, 立即清空, 防止后续帧访问悬空引用
        修复: 碰撞路径(原子-原子, 原子-分子, 分子-分子)清除对象时未清理 selected_object, 会导致
        render() 访问 .atoms/.protons 等属性时 AttributeError
        """
        if not self.selected_object:
            return
        if self.selected_object in removed_objects:
            self.selected_object = None

    def _check_atom_atom_collisions(self):
        to_remove = set()
        to_add_atoms = []
        to_add_molecules = []

        # 修复: 去掉冗余的 checked = set(), (j <= i) 早期 continue 已保证每对只检查一次
        for i, a1 in enumerate(self.atoms):
            # 优化: 仅在 to_remove 非空时检查 (绝大多数帧 to_remove 为空)
            if to_remove and i in to_remove:
                continue
            # 防御: 拖动中的原子不参与反应 (用户意图保留)
            if a1.dragging:
                continue
            nearby = self.grid.get_nearby(a1)
            for j in nearby:
                if j >= 100000:  # 跳过分子索引（原子重复索引）
                    continue
                if j <= i or j in to_remove:
                    continue

                a2 = self.atoms[j]
                # 修复: 拖动中的原子不参与反应, 避免被融合/反应清除后 selected_object 悬空
                if a2.dragging:
                    continue
                if not check_collision(a1, a2):
                    continue

                rel_speed_sq = get_relative_speed_sq(a1, a2)

                # 判断核聚变
                if rel_speed_sq >= FUSION_SPEED_THRESHOLD_SQ:
                    # 修复: try_fusion 需要标量速度, 在高速分支内 sqrt 一次
                    rel_speed = math.sqrt(rel_speed_sq)
                    # P0: 传温度给 try_fusion (高温降低聚变阈值)
                    fusion_result = try_fusion(a1, a2, rel_speed, T_K=self.temperature_K)
                    if fusion_result:
                        new_atom, effects, label, level = fusion_result
                        to_remove.add(i)
                        to_remove.add(j)
                        to_add_atoms.append(new_atom)
                        for eff in effects:
                            if isinstance(eff, FlashEffect):
                                self.flashes.append(eff)
                            elif isinstance(eff, BurstParticle):
                                self.burst_particles.append(eff)
                            elif isinstance(eff, EnergyWave):
                                self.energy_waves.append(eff)
                            elif isinstance(eff, PhotonParticle):
                                self.photon_particles.append(eff)
                            elif isinstance(eff, ShockWave):
                                self.shockwaves.append(eff)
                        self.reaction_labels.append(ReactionLabel(
                            new_atom.x, new_atom.y - 30, label))
                        # 聚变震动 (medium/high/extreme)
                        if level == "extreme":
                            self.renderer.trigger_shake(SHAKE_CONFIG["extreme_fusion"])
                        elif level == "high":
                            self.renderer.trigger_shake(SHAKE_CONFIG["extreme_fusion"] * 0.5)
                        elif level == "medium":
                            self.renderer.trigger_shake(SHAKE_CONFIG["extreme_fusion"] * 0.25)
                        break  # i 已被移除，跳出内层
                    # 修复: 高速聚变失败 (无对应反应) 时不继续化学反应, 避免连锁
                    # 高速原子立即形成化学键会造成场景爆炸
                    continue

                # 尝试化学反应
                # P0: 传温度/气压/局部密度给 try_chemical_reaction
                # P1-新: 缓存 local_density (每原子每帧算一次, 避免 O(N)² 重复扫描)
                _ld_key = (i,)
                local_d = self._density_cache.get(_ld_key)
                if local_d is None:
                    local_d = get_local_density(a1, self.atoms, self.molecules)
                    self._density_cache[_ld_key] = local_d
                chem_result = try_chemical_reaction(
                    a1, a2,
                    T_K=self.temperature_K,
                    P_atm=self.pressure_atm,
                    local_density=local_d
                )
                if chem_result:
                    mol, released_atoms, label = chem_result
                    to_remove.add(i)
                    to_remove.add(j)
                    to_add_molecules.append(mol)
                    # 释放多余原子（创建新副本），速度沿远离分子方向
                    rx, ry = mol.x, mol.y
                    for idx, ra in enumerate(released_atoms):
                        # 修复: 让释放原子沿远离分子中心方向喷出, 避免立即重叠
                        # 使用 idx 索引分散角度,避免多个原子都朝同一方向
                        base_ang = (idx * 2.094 + random.uniform(-0.4, 0.4))  # 120° + 抖动
                        sp = random.uniform(2.5, 4.5)
                        offset_dist = max(40, ra.radius + 8)  # 至少离分子中心 40px
                        # 优化: cos/sin 各算一次, 避免 4 次重复
                        c = math.cos(base_ang)
                        s = math.sin(base_ang)
                        new_x = rx + c * offset_dist
                        new_y = ry + s * offset_dist
                        # 修复: 边界 clamp, 防止原子出现在屏幕外
                        new_x = max(ra.radius + 5, min(WINDOW_WIDTH - ra.radius - 5, new_x))
                        new_y = max(ra.radius + 5, min(WINDOW_HEIGHT - ra.radius - 5, new_y))
                        new_free = Atom(ra.symbol,
                                        new_x,
                                        new_y,
                                        c * sp,
                                        s * sp)
                        to_add_atoms.append(new_free)
                    self.reaction_labels.append(ReactionLabel(
                        mol.x, mol.y - mol.radius - 10, label))  # 修复: 标签 y 随分子大小调整
                    # F0: 反应闪光颜色 (基于反应物查表)
                    flash_col = get_reaction_flash_color(a1.symbol, a2.symbol)
                    self.flashes.append(FlashEffect(mol.x, mol.y, 40, 12, color=flash_col))
                    break  # i 已被移除，跳出内层

                # 弹性碰撞
                resolve_elastic_collision(a1, a2)

        # 移除标记的原子
        if to_remove:
            # 修复: 清理 selected_object 引用, 防止悬空指针
            removed = [a for idx, a in enumerate(self.atoms) if idx in to_remove]
            self._clear_dangling_selection(*removed)
            self.atoms = [a for idx, a in enumerate(self.atoms) if idx not in to_remove]
        self.atoms.extend(to_add_atoms)
        self.molecules.extend(to_add_molecules)

    def _check_atom_molecule_collisions(self):
        to_remove_atoms = set()
        to_remove_mols = set()
        to_add_mols = []
        to_add_atoms_free = []

        for i, a in enumerate(self.atoms):
            if i in to_remove_atoms:
                continue
            # 防御: 拖动中的原子不参与反应
            if a.dragging:
                continue
            nearby = self.grid.get_nearby(a)
            for nid in nearby:
                if nid < 200000:
                    continue  # 跳过其他原子
                j = nid - 200000
                if j in to_remove_mols:
                    continue
                m = self.molecules[j]
                # 修复: 拖动中的分子不参与反应, 防止 selected_object 悬空
                if m.dragging:
                    continue
                if not check_collision(a, m):
                    continue

                # 高速碰撞先尝试核聚变
                fusion_done = False
                # 优化: 使用分子预缓存的重原子列表, 避免每帧排序
                for ta in m._heavy_atoms:
                    # 修复: 拖动中的分子内原子不参与聚变, 防止 selected_object 子节点被剥离
                    if ta.dragging:
                        continue
                    rel_speed_sq = get_relative_speed_sq(a, ta)
                    if rel_speed_sq >= FUSION_SPEED_THRESHOLD_SQ:
                        # 修复: try_fusion 需要标量速度, 仅在高速分支 sqrt
                        rel_speed = math.sqrt(rel_speed_sq)
                        # P0: 传温度
                        fusion_result = try_fusion(a, ta, rel_speed, T_K=self.temperature_K)
                        if fusion_result:
                            new_atom, effects, label, level = fusion_result
                            # 移除聚变伙伴原子，剩余 + 聚变产物作为新分子
                            remaining = [x for x in m.atoms if x is not ta]
                            for r in remaining:
                                r.dragging = False
                                r.selected = False
                            remaining.append(new_atom)
                            formula_str = "".join(atom.symbol for atom in remaining)
                            bond_struct = m.bond_structure
                            new_mol = Molecule(formula_str, remaining, bond_struct, m.bond_type)
                            new_mol.vx = m.vx
                            new_mol.vy = m.vy
                            # 特效
                            for eff in effects:
                                if isinstance(eff, FlashEffect):
                                    self.flashes.append(eff)
                                elif isinstance(eff, BurstParticle):
                                    self.burst_particles.append(eff)
                                elif isinstance(eff, EnergyWave):
                                    self.energy_waves.append(eff)
                                elif isinstance(eff, PhotonParticle):
                                    self.photon_particles.append(eff)
                                elif isinstance(eff, ShockWave):
                                    self.shockwaves.append(eff)
                            self.reaction_labels.append(ReactionLabel(
                                new_atom.x, new_atom.y - 30, label))
                            # 聚变震动
                            if level == "extreme":
                                self.renderer.trigger_shake(SHAKE_CONFIG["extreme_fusion"])
                            elif level == "high":
                                self.renderer.trigger_shake(SHAKE_CONFIG["extreme_fusion"] * 0.5)
                            elif level == "medium":
                                self.renderer.trigger_shake(SHAKE_CONFIG["extreme_fusion"] * 0.25)
                            to_remove_atoms.add(i)
                            to_remove_mols.add(j)
                            to_add_mols.append(new_mol)
                            fusion_done = True
                            break
                if fusion_done:
                    break  # 当前原子已处理，继续下一个原子

                # 修复: 透传 T_K/P_atm/local_density 让原子-分子反应受温度/气压控制
                # 优化: local_density 缓存 (每原子每帧算一次)
                _ld_key = (i,)
                local_d = self._density_cache.get(_ld_key)
                if local_d is None:
                    local_d = get_local_density(a, self.atoms, self.molecules)
                    self._density_cache[_ld_key] = local_d
                result = resolve_atom_molecule_collision(a, m,
                                                         T_K=self.temperature_K,
                                                         P_atm=self.pressure_atm,
                                                         local_density=local_d)
                if result:
                    new_mol, released_atoms, label = result
                    to_remove_atoms.add(i)
                    to_remove_mols.add(j)
                    to_add_mols.append(new_mol)
                    # 修复: 释放原子沿远离分子中心方向喷出, 避免立即重叠
                    rx, ry = new_mol.x, new_mol.y
                    for idx, ra in enumerate(released_atoms):
                        base_ang = (idx * 2.094 + random.uniform(-0.4, 0.4))
                        sp = random.uniform(2.5, 4.5)
                        offset_dist = max(40, ra.radius + 8)
                        # 优化: cos/sin 各算一次, 避免 4 次重复
                        c = math.cos(base_ang)
                        s = math.sin(base_ang)
                        nx = rx + c * offset_dist
                        ny = ry + s * offset_dist
                        nx = max(ra.radius + 5, min(WINDOW_WIDTH - ra.radius - 5, nx))
                        ny = max(ra.radius + 5, min(WINDOW_HEIGHT - ra.radius - 5, ny))
                        new_free_atom = Atom(ra.symbol, nx, ny,
                                             c * sp,
                                             s * sp)
                        to_add_atoms_free.append(new_free_atom)
                    self.reaction_labels.append(ReactionLabel(
                        new_mol.x, new_mol.y - new_mol.radius - 10, label))  # 修复: 标签 y 随分子大小
                    # F0: 反应闪光颜色
                    flash_col = get_reaction_flash_color(a.symbol, m.formula)
                    self.flashes.append(FlashEffect(new_mol.x, new_mol.y, 40, 12, color=flash_col))
                    break  # 原子已被移除，无需继续检查其他分子

        if to_remove_atoms:
            # 修复: 清理 selected_object 引用, 防止悬空指针
            removed_atoms = [a for idx, a in enumerate(self.atoms) if idx in to_remove_atoms]
            self._clear_dangling_selection(*removed_atoms)
            self.atoms = [a for idx, a in enumerate(self.atoms) if idx not in to_remove_atoms]
        if to_remove_mols:
            # 修复: 清理 selected_object 引用, 防止悬空指针
            removed_mols = [m for idx, m in enumerate(self.molecules) if idx in to_remove_mols]
            self._clear_dangling_selection(*removed_mols)
            self.molecules = [m for idx, m in enumerate(self.molecules) if idx not in to_remove_mols]
        self.molecules.extend(to_add_mols)
        self.atoms.extend(to_add_atoms_free)

    def _check_molecule_molecule_collisions(self):
        # 修复: 去掉冗余 checked = set(), (j <= i) 早期 continue 已保证每对只检查一次
        for i, m1 in enumerate(self.molecules):
            # 防御: 拖动中的分子不参与反应
            if m1.dragging:
                continue
            nearby = self.grid.get_nearby(m1)
            for nid in nearby:
                if nid < 200000:
                    continue  # 跳过原子
                j = nid - 200000
                if j <= i:
                    continue
                m2 = self.molecules[j]
                if m2.dragging:
                    continue
                if check_collision(m1, m2):
                    resolve_molecule_collision(m1, m2)

    def _check_radioactive_decay(self):
        """F1: 检查放射性元素衰变"""
        to_remove = set()
        to_add_atoms = []
        frame = pygame.time.get_ticks() // 16  # 近似帧计数
        for i, a in enumerate(self.atoms):
            if a.symbol not in RADIOACTIVE_ISOTOPES:
                continue
            if a.dragging:
                continue
            result = try_radioactive_decay(a, frame)
            if result is None:
                continue
            daughter, ejectiles, effects_list, label = result
            to_remove.add(i)
            if daughter:
                to_add_atoms.append(daughter)
            for ej in ejectiles:
                to_add_atoms.append(ej)
            # 特效
            for eff in effects_list:
                if isinstance(eff, FlashEffect):
                    self.flashes.append(eff)
                elif isinstance(eff, BurstParticle):
                    self.burst_particles.append(eff)
                elif isinstance(eff, EnergyWave):
                    self.energy_waves.append(eff)
                elif isinstance(eff, ShockWave):
                    self.shockwaves.append(eff)
                elif isinstance(eff, PhotonParticle):
                    self.photon_particles.append(eff)
            self.reaction_labels.append(ReactionLabel(a.x, a.y - 30, label))
            # α 衰变触发轻微震动
            from config import SHAKE_CONFIG
            self.renderer.trigger_shake(SHAKE_CONFIG["alpha_decay"])
        if to_remove:
            removed = [a for idx, a in enumerate(self.atoms) if idx in to_remove]
            self._clear_dangling_selection(*removed)
            self.atoms = [a for idx, a in enumerate(self.atoms) if idx not in to_remove]
            self.atoms.extend(to_add_atoms)

    def _check_neutron_collisions(self):
        """F2: 中子与原子碰撞 (裂变触发)"""
        to_remove_neutrons = set()
        to_remove_atoms = set()
        to_add_atoms = []
        to_add_neutrons = []
        for ni, neutron in enumerate(self.neutrons):
            if ni in to_remove_neutrons:
                continue
            for ai, atom in enumerate(self.atoms):
                if ai in to_remove_atoms:
                    continue
                if atom.dragging:
                    continue
                result = resolve_neutron_collision(neutron, atom)
                if result is None:
                    continue
                kind, data = result
                if kind == "fission":
                    fragments, new_ns, effects_list, label = data
                    to_remove_neutrons.add(ni)
                    to_remove_atoms.add(ai)
                    for frag in fragments:
                        to_add_atoms.append(frag)
                    for n in new_ns:
                        to_add_neutrons.append(n)
                    # 特效
                    for eff in effects_list:
                        if isinstance(eff, FlashEffect):
                            self.flashes.append(eff)
                        elif isinstance(eff, BurstParticle):
                            self.burst_particles.append(eff)
                        elif isinstance(eff, EnergyWave):
                            self.energy_waves.append(eff)
                        elif isinstance(eff, ShockWave):
                            self.shockwaves.append(eff)
                        elif isinstance(eff, PhotonParticle):
                            self.photon_particles.append(eff)
                    self.reaction_labels.append(ReactionLabel(atom.x, atom.y - 30, label))
                    # 核裂变触发强震动
                    from config import SHAKE_CONFIG
                    self.renderer.trigger_shake(SHAKE_CONFIG["fission"])
                    break  # 中子已被吸收
                # scatter 不做特殊处理 (弹性碰撞已在 resolve 中完成)
        # 中子-分子弹性碰撞 (简单反弹, 不触发裂变)
        for ni, neutron in enumerate(self.neutrons):
            if ni in to_remove_neutrons:
                continue
            nr = neutron.radius
            for mol in self.molecules:
                if mol.dragging:
                    continue
                dx = neutron.x - mol.x
                dy = neutron.y - mol.y
                dist_sq = dx*dx + dy*dy
                min_dist = nr + mol.radius
                if dist_sq < min_dist * min_dist and dist_sq > 0:
                    dist = math.sqrt(dist_sq)
                    nx = dx / dist
                    ny = dy / dist
                    # 反弹中子
                    overlap = min_dist - dist
                    neutron.x += nx * overlap
                    neutron.y += ny * overlap
                    dot = neutron.vx * nx + neutron.vy * ny
                    neutron.vx -= 2 * dot * nx
                    neutron.vy -= 2 * dot * ny
                    neutron.vx *= 0.8
                    neutron.vy *= 0.8
        if to_remove_neutrons:
            self.neutrons = [n for idx, n in enumerate(self.neutrons) if idx not in to_remove_neutrons]
        if to_remove_atoms:
            removed = [a for idx, a in enumerate(self.atoms) if idx in to_remove_atoms]
            self._clear_dangling_selection(*removed)
            self.atoms = [a for idx, a in enumerate(self.atoms) if idx not in to_remove_atoms]
            self.atoms.extend(to_add_atoms)
        self.neutrons.extend(to_add_neutrons)
        # 限制中子数量防止链式反应爆炸
        if len(self.neutrons) > 50:
            self.neutrons = self.neutrons[:50]

    def _apply_shockwave_forces(self):
        """F3: 冲击波对所有原子/分子施加径向推力"""
        for sw in self.shockwaves:
            for a in self.atoms:
                if a.dragging:
                    continue
                apply_shockwave_force(sw, a)
            for m in self.molecules:
                if m.dragging:
                    continue
                apply_shockwave_force(sw, m)
            for n in self.neutrons:
                apply_shockwave_force(sw, n)

    def _update_dynamic_temperature(self):
        """F4: 根据系统动能动态更新温度"""
        T = compute_kinetic_temperature(self.atoms, self.molecules, self.neutrons)
        # 滑动平均
        self._temp_history.append(T)
        if len(self._temp_history) > THERMAL_CONFIG["smoothing_frames"]:
            self._temp_history.pop(0)
        avg_T = sum(self._temp_history) / len(self._temp_history)
        self.temperature_K = avg_T
        # 更新背景色调
        self.bg_tint = temperature_to_color(self.temperature_K)

    def _update_effects(self):
        # 优化: 无特效时早返回, 避免空列表开销
        if not (self.flashes or self.burst_particles or self.energy_waves
                or self.photon_particles or self.reaction_labels or self.shockwaves):
            return
        # P1-2: 原地更新 + 倒序删除, 避免 list comprehension 创建新列表
        # 修复: 必须倒序遍历, 否则 del 会跳过元素
        for lst in (self.flashes, self.burst_particles, self.energy_waves,
                    self.photon_particles, self.reaction_labels, self.shockwaves):
            # 倒序遍历, 过期元素原地 del
            for i in range(len(lst) - 1, -1, -1):
                if not lst[i].update():
                    del lst[i]
        # 限制最大数量 (截断保留最新的)
        _MAX_FLASHES = 50
        if len(self.flashes) > _MAX_FLASHES:
            del self.flashes[0:len(self.flashes) - _MAX_FLASHES]
        _MAX_BURST = 150
        if len(self.burst_particles) > _MAX_BURST:
            del self.burst_particles[0:len(self.burst_particles) - _MAX_BURST]
        _MAX_WAVES = 10
        if len(self.energy_waves) > _MAX_WAVES:
            del self.energy_waves[0:len(self.energy_waves) - _MAX_WAVES]
        _MAX_PHOTONS = 60
        if len(self.photon_particles) > _MAX_PHOTONS:
            del self.photon_particles[0:len(self.photon_particles) - _MAX_PHOTONS]
        _MAX_LABELS = 30
        if len(self.reaction_labels) > _MAX_LABELS:
            del self.reaction_labels[0:len(self.reaction_labels) - _MAX_LABELS]
        _MAX_SHOCKWAVES = 8
        if len(self.shockwaves) > _MAX_SHOCKWAVES:
            del self.shockwaves[0:len(self.shockwaves) - _MAX_SHOCKWAVES]

    def render(self):
        # 更新屏幕震动状态 (必须在所有世界绘制之前调用)
        self.renderer.update_shake()
        # 同步相机状态到渲染器
        self.renderer.set_camera(self.camera_x, self.camera_y, self.camera_zoom)

        # P0: 背景色调反映温度
        self.renderer.draw_background(tint=self.bg_tint)

        # F3: 绘制冲击波 (在分子/原子下方, 作为背景光环)
        self.renderer.draw_shockwaves(self.shockwaves)

        # 绘制分子（分子数>80时隐藏标签）
        show_mol_labels = len(self.molecules) <= 80
        for m in self.molecules:
            self.renderer.draw_molecule(m, show_label=show_mol_labels)

        # 绘制原子（原子数>100时隐藏标签）
        show_labels = len(self.atoms) <= 100
        for a in self.atoms:
            self.renderer.draw_atom(a, show_label=show_labels)

        # F2: 绘制自由中子
        self.renderer.draw_neutrons(self.neutrons)

        # P1-5: 拖动时反应预测预览
        if self.dragging and self._drag_moved and self.selected_object:
            pred_neighbor, pred_label = self._find_predicted_reaction()
            if pred_neighbor is not None:
                # 画虚线连接 + 绿色环高亮
                self.renderer.draw_reaction_prediction(
                    self.selected_object, pred_neighbor, pred_label
                )
        # P0-2: 鼠标 hover 高亮
        hover_obj = self._get_hover_object()
        if hover_obj is not None and hover_obj is not self.selected_object:
            self.renderer.draw_hover_highlight(hover_obj)
            # P0-7: hover 时显示元素身份
            self.renderer.draw_hover_label(hover_obj, self.mouse_pos)

        # 绘制特效
        self.renderer.draw_effect_flashes(self.flashes)
        self.renderer.draw_effect_waves(self.energy_waves)
        self.renderer.draw_effect_particles(self.burst_particles)
        self.renderer.draw_effect_particles(self.photon_particles)
        self.renderer.draw_reaction_labels(self.reaction_labels)

        # P0-6: 能量脉冲可视化 (屏幕中央扩散圈)
        if self.energy_pulse_active and self.energy_pulse_total > 0:
            progress = 1.0 - self.energy_pulse_timer / self.energy_pulse_total
            self._energy_visual_radius = 50 + progress * 600
            self._energy_visual_alpha = int(255 * (1.0 - progress))
            self.renderer.draw_energy_pulse_visual(
                self._energy_visual_x, self._energy_visual_y,
                self._energy_visual_radius, self._energy_visual_alpha
            )

        # 选中信息
        # P0-3: 扩展选中信息卡, 显示更详细信息(原子量/分子量/分类/电子构型)
        # 使用多行结构, 避免截断
        selected_info_lines = None
        if self.selected_object:
            selected_info_lines = self._build_selected_info_lines()

        # UI
        self.btn_pause, self.btn_energy, self.slider_bar = self.renderer.draw_ui(
            self.paused, self.speed_multiplier,
            len(self.atoms), len(self.molecules),
            self.energy_pulse_active, selected_info_lines
        )

        # 元素菜单
        if self.element_menu_visible:
            self._draw_element_menu()

        # P1-1: FPS 叠加显示 + P0: T/P 状态
        self.renderer.draw_fps(self._fps_display, len(self.atoms), len(self.molecules),
                               T_K=self.temperature_K, P_atm=self.pressure_atm,
                               neutron_count=len(self.neutrons),
                               dynamic_temp=self.dynamic_temperature)

        # P1-2: 暂停提示
        self._update_pause_hint()
        if self._pause_hint_alpha > 0:
            self.renderer.draw_pause_hint(self._pause_hint_alpha)

        # P1-1: 帮助页
        if self.help_visible:
            self.renderer.draw_help_screen()

        pygame.display.flip()

    def _compute_menu_draw_pos(self, mx, my, menu_width=None, menu_height=None):
        """根据点击位置计算菜单绘制位置（边界修正）"""
        if menu_width is None or menu_height is None:
            # 计算尺寸
            item_height = 22
            items_per_col = 24
            col_width = 90
            cols = (len(self.element_list) + items_per_col - 1) // items_per_col
            max_rows = (len(self.element_list) + cols - 1) // cols if cols > 0 else 0
            menu_width = cols * col_width + 10
            menu_height = max_rows * item_height + 10
        if mx + menu_width > WINDOW_WIDTH:
            mx = WINDOW_WIDTH - menu_width - 5
        if my + menu_height > WINDOW_HEIGHT - 50:
            my = WINDOW_HEIGHT - 50 - menu_height - 5
        mx = max(5, mx)
        my = max(5, my)
        return (mx, my)

    def _draw_element_menu(self):
        """绘制元素菜单 (支持 118 元素: 紧凑多列布局)"""
        item_height = 22
        items_per_col = 24  # 每列 24 项, 118 元素 → 5 列
        col_width = 90
        cols = (len(self.element_list) + items_per_col - 1) // items_per_col
        max_rows = (len(self.element_list) + cols - 1) // cols if cols > 0 else 0
        menu_width = cols * col_width + 10
        menu_height = max_rows * item_height + 10

        mx, my = self.menu_pos
        self.menu_draw_pos = self._compute_menu_draw_pos(mx, my, menu_width, menu_height)
        mx, my = self.menu_draw_pos

        # 背景
        s = self.renderer._get_menu_bg(menu_width, menu_height)
        self.screen.blit(s, (mx, my))

        # 文字缓存
        if not hasattr(self, '_menu_text_cache') or self._menu_text_cache is None:
            self._menu_text_cache = {}
        cache = self._menu_text_cache
        if len(cache) > 200:
            cache.clear()

        for i, sym in enumerate(self.element_list):
            el = ELEMENTS[sym]
            col = i // items_per_col
            row = i % items_per_col
            if row >= max_rows:
                break
            item_x = mx + 5 + col * col_width
            item_y = my + 5 + row * item_height

            rect = pygame.Rect(item_x, item_y, col_width - 10, item_height - 2)
            pygame.draw.rect(self.screen, el["color"], rect, border_radius=2)
            key = sym
            if key not in cache:
                # 紧凑格式: "符号 名称" (省略 Z= 以节省空间)
                cache[key] = self.renderer.font_small.render(
                    f"{el['symbol']} {el['name']}", True, (255, 255, 255))
            text = cache[key]
            self.screen.blit(text, (item_x + 4, item_y + 2))

    def run(self):
        try:
            while self.running:
                # 修复: 每帧加 try/except,单帧异常不影响程序继续运行
                try:
                    self.handle_events()
                    self.update()
                    self.render()
                except pygame.error as e:
                    # Pygame 错误 (如视频设备失效),记录并继续
                    logging.getLogger("atom_sim").warning("pygame 错误: %r", e)
                except Exception as e:
                    # 其他异常,记录 traceback 但不退出
                    logging.getLogger("atom_sim").error(
                        "单帧异常: %r\n%s", e, traceback.format_exc()
                    )
                self.clock.tick(FPS)
                # P1-1: 累加 FPS 统计 (每 0.5 秒更新一次显示)
                self._fps_frame_count += 1
                self._fps_time_acc += self.clock.get_time() / 1000.0
                if self._fps_time_acc >= 0.5:
                    self._fps_display = self._fps_frame_count / self._fps_time_acc
                    self._fps_frame_count = 0
                    self._fps_time_acc = 0.0
        except KeyboardInterrupt:
            pass
        finally:
            try:
                pygame.quit()
            except Exception:
                pass
            sys.exit()


if __name__ == "__main__":
    sim = AtomSimulator()
    sim.run()