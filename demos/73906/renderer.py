# renderer.py — 渲染层

import math
import random
import logging
import pygame
from config import (
    WINDOW_WIDTH, WINDOW_HEIGHT, BG_COLOR, STAR_COUNT,
    SHAKE_CONFIG, GLOW_CONFIG, PROTON_COLOR, NEUTRON_COLOR,
    energy_to_color, ELECTRON_COLORS, CAMERA_CONFIG,
)

_log = logging.getLogger("atom_sim.renderer")

def _get_font(size, bold=False):
    """获取支持中文的字体，跨平台兼容（结果缓存）"""
    cache_key = (size, bold)
    if cache_key in _get_font._cache:
        return _get_font._cache[cache_key]
    candidates = [
        "simsun", "simhei", "microsoftyahei", "microsoftyaheibold",
        "notosanssc", "notosanscjksc", "wenquanyimicrohei",
        "arialunicodems", "arial",
        "dejavusans", "freesans", None  # None = pygame 默认
    ]
    last_err = None
    for name in candidates:
        try:
            f = pygame.font.SysFont(name, size, bold=bold)
            if f is not None:
                _get_font._cache[cache_key] = f
                return f
        except Exception as e:  # 记录具体异常便于调试
            last_err = e
            continue
    # 全部失败时回退到默认字体
    try:
        f = pygame.font.Font(None, size)
        _get_font._cache[cache_key] = f
        if last_err is not None:
            _log.warning("使用默认字体 (所有候选失败，最后错误=%r)", last_err)
        return f
    except Exception as e:
        _log.error("无法加载任何字体 (size=%d, bold=%s): %r", size, bold, e)
        raise

_get_font._cache = {}

class Renderer:
    def __init__(self, screen):
        self.screen = screen
        self.font_small = _get_font(14)
        self.font_medium = _get_font(18)
        self.font_large = _get_font(24)
        self.font_title = _get_font(32, bold=True)

        # 屏幕震动
        self.shake_x = 0
        self.shake_y = 0
        self.shake_intensity = 0

        # 相机系统
        self.cam_cx = WINDOW_WIDTH / 2   # 相机中心世界坐标 X
        self.cam_cy = WINDOW_HEIGHT / 2  # 相机中心世界坐标 Y
        self.cam_scale = 1.0             # 缩放倍率

        # 光晕缓存 (key: (radius, color) → surface)
        self._glow_cache = {}

        # P1-1: 8 档 tint 预渲染, 避免每帧分配 3.84MB surface
        # 桶化: 将任意 RGB 颜色量化为 8 档, 命中预渲染 surface
        self._tint_cache = {}

        # 星空
        self.stars = [(random.randint(0, WINDOW_WIDTH),
                       random.randint(0, WINDOW_HEIGHT),
                       random.uniform(0.5, 2.0),
                       random.randint(100, 255)) for _ in range(STAR_COUNT)]

        # 反应标签文本缓存（避免每帧重复 render）
        # 修复: 使用 OrderedDict 实现 LRU 淘汰
        from collections import OrderedDict
        # 优化: 初始化直接用 OrderedDict, 避免每帧 isinstance 检查
        self._label_cache = OrderedDict()

        # 修复: 常用 UI 文本 surface 缓存, 避免每帧重复 render
        # 注意: 文本内容依赖于 speed_multiplier/atom_count/molecule_count 等动态值
        # 仅缓存完全静态的文本
        self._ui_static_cache = {
            "pause": self.font_small.render("暂停", True, (0, 0, 0)),
            "resume": self.font_small.render("开始", True, (0, 0, 0)),
            "energy_btn": self.font_small.render("释放能量", True, (255, 255, 255)),
        }

        # 闪光/波纹 surface 池（避免每帧分配）
        # 修复: 池中 surface 用 convert_alpha 优化 blit 速度
        self._surface_pool = {size: pygame.Surface((size, size), pygame.SRCALPHA).convert_alpha()
                              for size in (32, 64, 128, 256, 512, 1024)}
        # 修复: 预排序池尺寸, 避免 _get_pooled_surface 每次都 sorted
        self._pool_sizes_sorted = sorted(self._surface_pool.keys())
        self._pool_max = max(self._pool_sizes_sorted)
        # 修复: surface 池最大尺寸限制, 防止 _get_pooled_surface 中无界增长
        self._pool_max_size = 1024

        # 修复: 星空预渲染到 surface, 避免每帧 200 次 draw.circle
        self._star_surf = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA).convert_alpha()
        for sx, sy, sr, sb in self.stars:
            pygame.draw.circle(self._star_surf, (sb, sb, sb), (int(sx), int(sy)), int(sr))

        # 修复: 动态文本缓存(避免每帧 render 同样的 text)
        # 缓存 atom symbol 渲染结果 (21 种元素最多 21 条)
        self._atom_label_cache = {}

        # 修复: 分子 formula label 缓存 (按 formula 字符串)
        self._formula_label_cache = {}

        # 优化: 原子静态部分预渲染缓存 (按 symbol)
        # 包括: 电子轨道圆环, 原子核背景, 核边界, 选中环
        # 不包括: 运动的电子, 核内质子/中子 (需要每帧重画)
        # 修复: 按 (symbol, selected) 缓存, 因为 selected 状态会改变颜色
        # 修复: 缓存用 OrderedDict, 超过上限时 LRU 淘汰
        # 修复: orbit_expanded 也算 key, 防止释放能量时缓存命中旧轨道
        from collections import OrderedDict
        self._atom_static_cache = OrderedDict()
        self._atom_static_cache_max = 128  # 防止内存无界增长

        # 修复: 反应标签和动态 UI 文本缓存, 仅在内容变化时重 render
        self._ui_dynamic_cache = {
            "speed_text": None,
            "speed_val": None,
            "stats_text": None,
            "atom_count": -1,
            "molecule_count": -1,
            "info_text": None,
            "info_str": None,
        }

        # 修复: 菜单背景缓存, 避免每帧创建新 surface
        # key: (menu_width, menu_height) → surface
        self._menu_bg_cache = {}

    def _get_menu_bg(self, menu_width, menu_height):
        """获取缓存的菜单背景 surface"""
        key = (menu_width, menu_height)
        if key not in self._menu_bg_cache:
            s = pygame.Surface(key, pygame.SRCALPHA).convert_alpha()
            s.fill((30, 30, 60, 220))
            self._menu_bg_cache[key] = s
        return self._menu_bg_cache[key]

    def trigger_shake(self, intensity):
        """触发屏幕震动，叠加震动强度"""
        self.shake_intensity = min(self.shake_intensity + intensity, SHAKE_CONFIG["max_intensity"])

    def update_shake(self):
        """每帧调用：更新震动偏移和衰减。应在所有世界绘制前调用。"""
        if self.shake_intensity > 0.5:
            inti = self.shake_intensity
            self.shake_x = random.uniform(-inti, inti)
            self.shake_y = random.uniform(-inti, inti)
            self.shake_intensity *= SHAKE_CONFIG["decay"]
        else:
            self.shake_x = 0
            self.shake_y = 0
            self.shake_intensity = 0

    def set_camera(self, cx, cy, scale):
        """设置相机位置和缩放"""
        self.cam_cx = cx
        self.cam_cy = cy
        self.cam_scale = max(CAMERA_CONFIG["zoom_min"], min(CAMERA_CONFIG["zoom_max"], scale))

    def world_to_screen(self, wx, wy):
        """世界坐标 → 屏幕坐标 (含震动偏移)"""
        sx = (wx - self.cam_cx) * self.cam_scale + WINDOW_WIDTH / 2 + self.shake_x
        sy = (wy - self.cam_cy) * self.cam_scale + WINDOW_HEIGHT / 2 + self.shake_y
        return int(sx), int(sy)

    def screen_to_world(self, sx, sy):
        """屏幕坐标 → 世界坐标 (不含震动偏移)"""
        wx = (sx - WINDOW_WIDTH / 2) / self.cam_scale + self.cam_cx
        wy = (sy - WINDOW_HEIGHT / 2) / self.cam_scale + self.cam_cy
        return wx, wy

    def scale_r(self, r):
        """世界半径 → 屏幕半径"""
        return max(1, int(r * self.cam_scale))

    def _scale_linew(self, w):
        """世界线宽 → 屏幕线宽"""
        return max(1, int(w * self.cam_scale))

    def _get_glow_sprite(self, radius, color):
        """获取或创建径向渐变光晕 surface（白色中心→透明边缘），按 (radius, color) 缓存。"""
        key = (int(radius), color)
        if key in self._glow_cache:
            return self._glow_cache[key]
        size = int(radius * 2)
        if size < 2:
            size = 2
        s = pygame.Surface((size, size), pygame.SRCALPHA)
        cx, cy = size // 2, size // 2
        cr, cg, cb = color
        # 径向渐变：中心白色亮，向外渐变为 color 再到透明
        for r in range(int(radius), 0, -1):
            t = r / radius  # 0=center, 1=edge
            alpha = int(255 * (1 - t) ** 2)
            # 中心白色，边缘过渡到给定 color
            blend = t
            rr = int(255 * (1 - blend) + cr * blend)
            gg = int(255 * (1 - blend) + cg * blend)
            bb = int(255 * (1 - blend) + cb * blend)
            rr = max(0, min(255, rr))
            gg = max(0, min(255, gg))
            bb = max(0, min(255, bb))
            pygame.draw.circle(s, (rr, gg, bb, alpha), (cx, cy), r)
        # 缓存大小限制
        if len(self._glow_cache) > 64:
            # 淘汰最旧的
            self._glow_cache.pop(next(iter(self._glow_cache)))
        self._glow_cache[key] = s
        return s

    def draw_background(self, tint=(0, 0, 0)):
        """P0: 温度热辐射背景色调 (星空随震动偏移)"""
        self.screen.fill(BG_COLOR)
        ox, oy = int(self.shake_x), int(self.shake_y)
        # 星空随震动偏移
        self.screen.blit(self._star_surf, (ox, oy))
        # 温度色调叠加
        if tint != (0, 0, 0):
            rb = (tint[0] // 32) * 32
            gb = (tint[1] // 32) * 32
            bb = (tint[2] // 32) * 32
            key = (rb, gb, bb)
            tint_surf = self._tint_cache.get(key)
            if tint_surf is None:
                tint_surf = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA)
                tint_surf.fill((rb, gb, bb, 50))
                self._tint_cache[key] = tint_surf
                if len(self._tint_cache) > 16:
                    self._tint_cache.pop(next(iter(self._tint_cache)))
            # tint 是全屏覆盖，不随震动偏移
            self.screen.blit(tint_surf, (0, 0))

    def _get_atom_static_surf(self, atom):
        """获取或创建原子的静态部分预渲染 surface (轨道 + 核背景 + 核边界 + 选中环)
        优化: 静态部分(不动的)预渲染一次, 后续只画运动部分(电子/核子)

        修复: 缓存键必须包含 orbit_expanded, 否则 expand_orbits 后视觉不刷新
        修复: surface 尺寸必须覆盖最大轨道半径, 否则重原子轨道环被裁切
        修复: OrderedDict LRU 淘汰, 防止内存无界增长
        """
        # 修复: 包含 orbit_expanded 状态, 保证释放能量时轨道环扩散视觉生效
        key = (atom.symbol, atom.selected, atom.orbit_expanded)
        cached = self._atom_static_cache.get(key)
        if cached is not None:
            # 修复: 命中后移到末尾 (LRU)
            self._atom_static_cache.move_to_end(key)
            return cached
        # 修复: 表面尺寸 = max(选中环外径, 最大轨道半径) + 边距
        # 之前只用 atom.radius+8 太小, H以上元素的电子轨道环全部被 clip 裁切
        # 优化: 复选 _orbit_radii 时防御性 max
        max_orbit = max(atom._orbit_radii) if atom._orbit_radii else 0
        # 修复: 中心对齐, 最大半径 = max(选中环, 最大轨道, 核+padding)
        max_r = max(atom.radius + 8, max_orbit + 4, atom.nucleus_radius + 4)
        size = max_r * 2
        s = pygame.Surface((size, size), pygame.SRCALPHA).convert_alpha()
        cx, cy = size // 2, size // 2
        # 电子轨道
        orbit_color = (80, 80, 140) if atom.selected else (40, 40, 80)
        # 修复: 选中时高亮轨道, expand 时变亮 + 加粗
        if atom.orbit_expanded:
            orbit_color = (180, 180, 255) if atom.selected else (120, 120, 200)
        for orbit_r in atom._orbit_radii:
            line_w = 2 if atom.orbit_expanded else 1
            pygame.draw.circle(s, orbit_color, (cx, cy), orbit_r, line_w)
        # 原子核背景
        pygame.draw.circle(s, (20, 20, 40), (cx, cy), atom.nucleus_radius + 4)
        # 核边界
        pygame.draw.circle(s, (60, 60, 80), (cx, cy), atom.nucleus_radius, 1)
        # 选中环
        if atom.selected:
            pygame.draw.circle(s, (255, 255, 100), (cx, cy), atom.radius + 5, 2)
        # 修复: LRU 淘汰, 防止内存无界增长
        self._atom_static_cache[key] = s
        if len(self._atom_static_cache) > self._atom_static_cache_max:
            self._atom_static_cache.popitem(last=False)  # 弹出最旧
        return s

    def _draw_trail(self, trail, color):
        """绘制轨迹 (世界坐标点 → 屏幕坐标, 含相机变换)"""
        n = len(trail.points)
        if n < 2:
            return
        cr, cg, cb = color[0], color[1], color[2]
        # 先将所有点转换到屏幕坐标
        sx_list = []
        sy_list = []
        for p in trail.points:
            sx, sy = self.world_to_screen(p[0], p[1])
            sx_list.append(sx)
            sy_list.append(sy)
        min_x = min(sx_list) - 4
        max_x = max(sx_list) + 4
        min_y = min(sy_list) - 4
        max_y = max(sy_list) + 4
        w = max(10, max_x - min_x)
        h = max(10, max_y - min_y)
        tmp = pygame.Surface((w, h), pygame.SRCALPHA)
        prev_x = sx_list[0] - min_x
        prev_y = sy_list[0] - min_y
        for i in range(1, n):
            t = i / max(1, n - 1)
            alpha = int(255 * t)
            line_w = self._scale_linew(max(1, int(3 * t)))
            cx = sx_list[i] - min_x
            cy = sy_list[i] - min_y
            pygame.draw.line(tmp, (cr, cg, cb, alpha), (prev_x, prev_y), (cx, cy), line_w)
            prev_x, prev_y = cx, cy
        self.screen.blit(tmp, (min_x, min_y))

    def draw_atom(self, atom, show_label=True):
        """绘制原子"""
        x, y = self.world_to_screen(atom.x, atom.y)

        # P0-3: 绘制轨迹 (拖动中不画, 避免拖动残留)
        if atom._trail_enabled and not atom.dragging:
            sp_sq = atom.vx * atom.vx + atom.vy * atom.vy
            if sp_sq > 4.0:
                self._draw_trail(atom._trail, atom.color)

        # 优化: 静态部分(轨道+核背景+核边界+选中环)预渲染, 按缩放比例缩放
        static_surf = self._get_atom_static_surf(atom)
        sw = static_surf.get_width()
        sw_scaled = self.scale_r(sw // 2) * 2  # 缩放到屏幕尺寸
        if self.cam_scale != 1.0:
            try:
                scaled_static = pygame.transform.smoothscale(static_surf, (sw_scaled, sw_scaled))
            except Exception:
                scaled_static = pygame.transform.scale(static_surf, (sw_scaled, sw_scaled))
            self.screen.blit(scaled_static, (x - sw_scaled // 2, y - sw_scaled // 2))
        else:
            self.screen.blit(static_surf, (x - sw // 2, y - sw // 2))

        # 光晕效果 (热原子: speed > 5 或 temperature > 2000K)
        sp = math.sqrt(atom.vx * atom.vx + atom.vy * atom.vy)
        temp_K = getattr(atom, 'temperature_K', 0)
        is_hot = sp > 5.0 or temp_K > GLOW_CONFIG["hot_temp_threshold"]
        if is_hot and GLOW_CONFIG["enabled"]:
            glow_world_r = atom.radius * GLOW_CONFIG["glow_size_mult"]
            glow_screen_r = self.scale_r(glow_world_r)
            # 根据速度决定光晕颜色: 慢=蓝, 中=黄, 快=红/白
            glow_color = energy_to_color(sp, mode="particle")
            glow_surf = self._get_glow_sprite(glow_screen_r, glow_color)
            gw = glow_surf.get_width()
            self.screen.blit(glow_surf, (x - gw // 2, y - gw // 2), special_flags=pygame.BLEND_RGB_ADD)

        # 电子 (运动部分)
        for e in atom.electrons:
            ex, ey = self.world_to_screen(e.x, e.y)
            er = self.scale_r(e.radius)
            # 电子发光环使用电子自身颜色
            ecr, ecg, ecb = e.color
            pygame.draw.circle(self.screen, (ecr // 4, ecg // 4, ecb // 3), (ex, ey), er + self._scale_linew(2), self._scale_linew(1))
            pygame.draw.circle(self.screen, e.color, (ex, ey), er)

        # 中子 (运动部分)
        for n in atom.neutron_list:
            nx, ny = self.world_to_screen(n.x, n.y)
            nr = self.scale_r(n.radius)
            pygame.draw.circle(self.screen, n.color, (nx, ny), nr)
            # 中子高光 (略暗)
            hr = max(1, int(nr * 0.35))
            pygame.draw.circle(self.screen, (220, 220, 230),
                               (int(nx - nr * 0.3), int(ny - nr * 0.3)), hr)

        # 质子 (运动部分)
        for p in atom.proton_list:
            px, py = self.world_to_screen(p.x, p.y)
            pr = self.scale_r(p.radius)
            pygame.draw.circle(self.screen, p.color, (px, py), pr)
            # 质子高光 (白色亮点)
            hr = max(1, int(pr * 0.35))
            pygame.draw.circle(self.screen, (255, 255, 255),
                               (int(px - pr * 0.3), int(py - pr * 0.3)), hr)

        # 标签
        if show_label:
            sym = atom.symbol
            if sym not in self._atom_label_cache:
                self._atom_label_cache[sym] = self.font_small.render(sym, True, (200, 200, 200))
            label = self._atom_label_cache[sym]
            panel_top = WINDOW_HEIGHT - 50
            ar = self.scale_r(atom.radius)
            lx = max(2, x - ar - 15)
            ly = max(2, y - ar - 10)
            lx = min(lx, WINDOW_WIDTH - label.get_width() - 2)
            ly = min(ly, panel_top - label.get_height() - 2)
            self.screen.blit(label, (lx, ly))

    def draw_molecule(self, mol, show_label=True):
        """绘制分子"""
        mx, my = self.world_to_screen(mol.x, mol.y)

        # P0-3: 绘制分子轨迹
        if mol._trail_enabled and not mol.dragging:
            sp_sq = mol.vx * mol.vx + mol.vy * mol.vy
            if sp_sq > 4.0:
                trail_color = mol.atoms[0].color if mol.atoms else (180, 180, 180)
                self._draw_trail(mol._trail, trail_color)

        # 先绘制化学键 (bonds 在原子下方，原子覆盖键端)
        for bi, bj, border in mol.bonds:
            if bi < len(mol.atoms) and bj < len(mol.atoms):
                x1, y1 = self.world_to_screen(mol.atoms[bi].x, mol.atoms[bi].y)
                x2, y2 = self.world_to_screen(mol.atoms[bj].x, mol.atoms[bj].y)
                self._draw_bond(x1, y1, x2, y2, border)

        # 然后绘制原子 (原子覆盖键端, 键看起来连接到原子表面而非穿过核)
        for a in mol.atoms:
            x, y = self.world_to_screen(a.x, a.y)
            # 核背景
            nuc_bg_r = self.scale_r(a.nucleus_radius + 3)
            pygame.draw.circle(self.screen, (25, 25, 45), (x, y), nuc_bg_r)
            nuc_r = max(1, self.scale_r(a.nucleon_radius))
            # 质子
            for p in a.proton_list:
                px, py = self.world_to_screen(p.x, p.y)
                pygame.draw.circle(self.screen, p.color, (px, py), nuc_r)
                # 质子高光
                hr = max(1, int(nuc_r * 0.35))
                pygame.draw.circle(self.screen, (255, 255, 255),
                                   (int(px - nuc_r * 0.3), int(py - nuc_r * 0.3)), hr)
            # 中子
            for n in a.neutron_list:
                nx, ny = self.world_to_screen(n.x, n.y)
                pygame.draw.circle(self.screen, n.color, (nx, ny), nuc_r)
                # 中子高光 (略暗)
                hr = max(1, int(nuc_r * 0.35))
                pygame.draw.circle(self.screen, (220, 220, 230),
                                   (int(nx - nuc_r * 0.3), int(ny - nuc_r * 0.3)), hr)
            # 核边界
            pygame.draw.circle(self.screen, (60, 60, 80), (x, y), self.scale_r(a.nucleus_radius), self._scale_linew(1))
            # 电子 (分子中电子发光环用电子自身颜色)
            for e in a.electrons:
                ex, ey = self.world_to_screen(e.x, e.y)
                er = self.scale_r(e.radius)
                ecr, ecg, ecb = e.color
                pygame.draw.circle(self.screen, (ecr // 4, ecg // 4, ecb // 3), (ex, ey), er + self._scale_linew(1), self._scale_linew(1))
                pygame.draw.circle(self.screen, e.color, (ex, ey), er)

        # 选中高亮
        if mol.selected:
            sel_r = self.scale_r(mol.radius + 5)
            pygame.draw.circle(self.screen, (255, 255, 100), (mx, my), sel_r, self._scale_linew(2))

        # 标签
        if show_label:
            formula = mol.formula
            if formula not in self._formula_label_cache:
                self._formula_label_cache[formula] = self.font_small.render(
                    formula, True, (200, 255, 200))
            label = self._formula_label_cache[formula]
            panel_top = WINDOW_HEIGHT - 50
            mr = self.scale_r(mol.radius)
            lx = max(5, min(WINDOW_WIDTH - label.get_width() - 5, mx - 15))
            ly = max(5, min(panel_top - label.get_height() - 5, my - mr - 15))
            self.screen.blit(label, (lx, ly))

    def _draw_bond(self, x1, y1, x2, y2, order):
        dx = x2 - x1
        dy = y2 - y1
        dist_sq = dx * dx + dy * dy
        # 修复: 浮点严格 == 不安全
        if dist_sq < 1e-18:
            return
        # 优化: 用 inv_dist 代替 hypot, 避免 sqrt
        dist = math.sqrt(dist_sq)
        inv = 1.0 / dist
        nx = -dy * inv
        ny = dx * inv
        offset = self.scale_r(3)
        # 优化: 2x 偏移提到分支外
        offset2 = offset * 2
        # P0-1: 键级颜色区分
        # 单键=白, 双键=黄, 三键=红, 便于化学教学
        bond_color = (200, 200, 200)
        if order == 2:
            bond_color = (255, 220, 80)   # 双键 - 黄
        elif order == 3:
            bond_color = (255, 80, 80)    # 三键 - 红
        lw = self._scale_linew(2)
        # order == 1: 单键 - 白
        if order == 1:
            pygame.draw.line(self.screen, bond_color, (x1, y1), (x2, y2), lw)
        elif order == 2:
            pygame.draw.line(self.screen, bond_color, (x1 + nx * offset, y1 + ny * offset),
                             (x2 + nx * offset, y2 + ny * offset), lw)
            pygame.draw.line(self.screen, bond_color, (x1 - nx * offset, y1 - ny * offset),
                             (x2 - nx * offset, y2 - ny * offset), lw)
        elif order == 3:
            pygame.draw.line(self.screen, bond_color, (x1, y1), (x2, y2), lw)
            pygame.draw.line(self.screen, bond_color, (x1 + nx * offset2, y1 + ny * offset2),
                             (x2 + nx * offset2, y2 + ny * offset2), lw)
            pygame.draw.line(self.screen, bond_color, (x1 - nx * offset2, y1 - ny * offset2),
                             (x2 - nx * offset2, y2 - ny * offset2), lw)

    def _get_pooled_surface(self, size):
        """从池中获取或创建指定尺寸的 surface
        修复: 限制动态创建的最大 surface 数量,避免内存泄漏
        修复: 使用预排序的 _pool_sizes_sorted, 避免每次调用 sorted()
        """
        # 找到池中 >= size 的最近尺寸
        for pool_size in self._pool_sizes_sorted:
            if pool_size >= size:
                return self._surface_pool[pool_size], pool_size
        # 超出池中最大尺寸,使用最大池尺寸并裁剪
        if self._surface_pool:
            return self._surface_pool[self._pool_max], self._pool_max
        # 池完全为空时(理论不应发生),创建一个 (限制最大尺寸)
        new_size = max(64, min(self._pool_max_size, size))
        new_surf = pygame.Surface((new_size, new_size), pygame.SRCALPHA).convert_alpha()
        self._surface_pool[new_size] = new_surf
        self._pool_sizes_sorted = sorted(self._surface_pool.keys())
        self._pool_max = max(self._pool_sizes_sorted)
        return new_surf, new_size

    def draw_effect_waves(self, waves):
        """绘制能量波纹"""
        for w in waves:
            wx, wy, wr, wa = w.get_params()
            wa = max(0, min(255, int(wa)))
            if wr < 2:
                continue
            sx, sy = self.world_to_screen(wx, wy)
            sr = self.scale_r(wr)
            if sr < 2:
                continue
            lw = self._scale_linew(3)
            if sr < self.scale_r(20):
                pygame.draw.circle(self.screen,
                                   (255, 200, 100, min(wa, 255)),
                                   (sx, sy),
                                   sr, lw)
                continue
            size = max(4, int(sr * 2))
            s, pool_size = self._get_pooled_surface(size)
            s.fill((0, 0, 0, 0))
            pygame.draw.circle(s, (255, 200, 100, wa // 3), (pool_size // 2, pool_size // 2), sr, lw)
            self.screen.blit(s, (sx - pool_size // 2, sy - pool_size // 2))

    def draw_effect_particles(self, particles):
        """绘制粒子特效"""
        for p in particles:
            px, py, pr, pa = p.get_params()
            pa = max(0, min(255, int(pa)))
            if pr < 1:
                continue
            sx, sy = self.world_to_screen(px, py)
            sr = self.scale_r(pr)
            if sr < 1:
                continue
            if sr < self.scale_r(8):
                pygame.draw.circle(self.screen,
                                   (p.color[0], p.color[1], p.color[2], min(pa, 255)),
                                   (sx, sy),
                                   max(1, sr))
                continue
            size = max(4, int(sr * 4))
            s, pool_size = self._get_pooled_surface(size)
            s.fill((0, 0, 0, 0))
            pygame.draw.circle(s, (p.color[0], p.color[1], p.color[2], pa),
                              (pool_size // 2, pool_size // 2), max(1, sr))
            self.screen.blit(s, (sx - pool_size // 2, sy - pool_size // 2))

    def draw_effect_flashes(self, flashes):
        """绘制闪光 (支持自定义颜色 F0), 背后添加光晕层"""
        for f in flashes:
            fx, fy, fr, fa = f.get_params()
            fa = max(0, min(255, int(fa)))
            if fr < 2:
                continue
            base_color = getattr(f, 'color', (255, 255, 200))
            cr, cg, cb = base_color
            sx, sy = self.world_to_screen(fx, fy)
            sr = self.scale_r(fr)
            if sr < 2:
                continue
            # 光晕层 (大半径, 半透明, 加法混合)
            if GLOW_CONFIG["enabled"] and fr > 10:
                glow_world_r = int(fr * GLOW_CONFIG["glow_size_mult"] * 0.6)
                glow_screen_r = self.scale_r(glow_world_r)
                glow_surf = self._get_glow_sprite(glow_screen_r, base_color)
                gw = glow_surf.get_width()
                glow_alpha = max(20, int(fa * 0.4))
                tmp_glow = glow_surf.copy()
                tmp_glow.set_alpha(glow_alpha)
                self.screen.blit(tmp_glow, (sx - gw // 2, sy - gw // 2), special_flags=pygame.BLEND_RGB_ADD)
            # 多层闪光圈
            if sr < self.scale_r(25):
                ix, iy = sx, sy
                for i in range(3):
                    r = int(sr * (1 - i * 0.3))
                    a = fa // (i + 1)
                    if r > 0:
                        pygame.draw.circle(self.screen, (cr, cg, cb, min(a, 255)),
                                          (ix, iy), max(1, r))
                continue
            size = max(4, int(sr * 2))
            s, pool_size = self._get_pooled_surface(size)
            s.fill((0, 0, 0, 0))
            for i in range(3):
                r = int(sr * (1 - i * 0.3))
                a = fa // (i + 1)
                if r > 0:
                    pygame.draw.circle(s, (cr, cg, cb, a),
                                      (pool_size // 2, pool_size // 2), max(1, r))
            self.screen.blit(s, (sx - pool_size // 2, sy - pool_size // 2))

    def draw_reaction_labels(self, labels):
        """绘制反应标签（缓存文本 surface，仅 alpha 变化）"""
        if len(self._label_cache) > 200:
            while len(self._label_cache) > 150:
                self._label_cache.popitem(last=False)
        for l in labels:
            lx, ly, text, alpha = l.get_params()
            alpha = max(0, min(255, int(alpha)))
            if alpha < 10:
                continue
            alpha_bucket = (alpha >> 4) & 0xF
            cache_key = (text, alpha_bucket)
            cached = self._label_cache.get(cache_key)
            if cached is None:
                base_s = self._label_cache.get(text)
                if base_s is None:
                    base_s = self.font_small.render(text, True, (255, 255, 100))
                    self._label_cache[text] = base_s
                quantized_alpha = alpha_bucket * 16 + 8
                s = base_s.copy()
                s.set_alpha(quantized_alpha)
                self._label_cache[cache_key] = s
                cached = s
            sx, sy = self.world_to_screen(lx, ly)
            self.screen.blit(cached, (int(sx - cached.get_width() // 2), int(sy)))

    def draw_shockwaves(self, shockwaves):
        """F3: 绘制冲击波 (扩散环形): 主亮环 + 尾随暗环 + 内部半透明圆盘"""
        for sw in shockwaves:
            sx, sy, sr, sa, scolor = sw.get_params()
            sa = max(0, min(255, int(sa)))
            if sr < 2 or sa < 5:
                continue
            screen_x, screen_y = self.world_to_screen(sx, sy)
            screen_r = self.scale_r(sr)
            if screen_r < 2:
                continue
            cr, cg, cb = scolor
            # 内部半透明圆盘 (密度效果)
            if sr > 5:
                disc_alpha = max(5, int(sa * 0.08))
                disc_size = max(2, int(screen_r * 2))
                disc_surf = pygame.Surface((disc_size, disc_size), pygame.SRCALPHA)
                pygame.draw.circle(disc_surf, (cr, cg, cb, disc_alpha),
                                   (disc_size // 2, disc_size // 2), screen_r)
                self.screen.blit(disc_surf, (screen_x - disc_size // 2, screen_y - disc_size // 2))
            # 主亮前环 (厚, 白/黄染色)
            front_width_world = max(3, 8 - int((1 - sa / 180) * 4))
            front_width = self._scale_linew(front_width_world)
            front_r = screen_r
            # 混合白色到主色
            fcr = min(255, int(cr * 0.5 + 255 * 0.5))
            fcg = min(255, int(cg * 0.5 + 240 * 0.5))
            fcb = min(255, int(cb * 0.5 + 200 * 0.5))
            pygame.draw.circle(self.screen, (fcr, fcg, fcb, sa),
                               (screen_x, screen_y), front_r, front_width)
            # 2-3 个尾随暗环 (更薄, 渐隐)
            for i in range(1, 4):
                r = front_r - self.scale_r(i * 6)
                if r < 3:
                    continue
                trail_alpha = max(5, int(sa * (0.5 - i * 0.12)))
                trail_width = max(1, front_width - self._scale_linew(i + 1))
                tcr = int(cr * (0.7 - i * 0.1))
                tcg = int(cg * (0.7 - i * 0.1))
                tcb = int(cb * (0.7 - i * 0.1))
                pygame.draw.circle(self.screen, (tcr, tcg, tcb, trail_alpha),
                                   (screen_x, screen_y), r, trail_width)

    def draw_neutrons(self, neutrons):
        """F2: 绘制自由中子 (灰色小球 + 拖尾)"""
        for n in neutrons:
            nx, ny, nr, na, ncolor = n.get_params()
            na = max(0, min(255, int(na)))
            if na < 5:
                continue
            cr, cg, cb = ncolor
            sx, sy = self.world_to_screen(nx, ny)
            sr = self.scale_r(nr)
            # 拖尾
            if hasattr(n, 'trail') and len(n.trail) >= 2:
                pts = list(n.trail)
                prev_psx, prev_psy = self.world_to_screen(pts[0][0], pts[0][1])
                for i in range(1, len(pts)):
                    p1 = pts[i - 1]
                    p2 = pts[i]
                    t = i / max(1, len(pts) - 1)
                    alpha = int(na * t * 0.5)
                    w = max(1, self.scale_r(nr * t))
                    psx, psy = self.world_to_screen(p2[0], p2[1])
                    pygame.draw.line(self.screen, (cr, cg, cb, alpha),
                                     (prev_psx, prev_psy),
                                     (psx, psy), w)
                    prev_psx, prev_psy = psx, psy
            # 中子本体
            pygame.draw.circle(self.screen, (cr, cg, cb, na),
                               (sx, sy), max(2, sr))
            # 高亮
            pygame.draw.circle(self.screen, (220, 220, 220, na),
                               (int(sx - sr * 0.3), int(sy - sr * 0.3)), max(1, int(sr * 0.3)))

    def draw_ui(self, paused, speed_multiplier, atom_count, molecule_count, energy_pulse_active,
                selected_info=None):
        """绘制底部 UI

        selected_info: str (旧版) 或 list[str] (新版多行)
        P0-3: 支持多行信息卡, 展示选中物体的完整信息
        """
        # 底部面板
        panel_y = WINDOW_HEIGHT - 50
        pygame.draw.rect(self.screen, (20, 20, 35), (0, panel_y, WINDOW_WIDTH, 50))
        pygame.draw.line(self.screen, (60, 60, 100), (0, panel_y), (WINDOW_WIDTH, panel_y), 2)

        # 暂停/开始按钮
        btn_color = (100, 200, 100) if not paused else (200, 150, 50)
        btn_rect = pygame.Rect(20, panel_y + 10, 100, 30)
        pygame.draw.rect(self.screen, btn_color, btn_rect, border_radius=5)
        # 修复: 使用缓存的静态 UI 文本
        btn_text = self._ui_static_cache["pause"] if not paused else self._ui_static_cache["resume"]
        self.screen.blit(btn_text, (btn_rect.x + 25, btn_rect.y + 5))

        # 释放能量按钮
        energy_color = (255, 100, 50) if energy_pulse_active else (200, 80, 30)
        energy_rect = pygame.Rect(140, panel_y + 10, 100, 30)
        pygame.draw.rect(self.screen, energy_color, energy_rect, border_radius=5)
        # 修复: 使用缓存的静态 UI 文本
        self.screen.blit(self._ui_static_cache["energy_btn"], (energy_rect.x + 10, energy_rect.y + 5))

        # 速度滑块
        slider_x = 270
        # 修复: 速度文字仅在 speed_multiplier 变化时重 render
        cache_d = self._ui_dynamic_cache
        if cache_d["speed_val"] != speed_multiplier:
            cache_d["speed_text"] = self.font_small.render(
                f"速度: {speed_multiplier:.1f}x", True, (200, 200, 200))
            cache_d["speed_val"] = speed_multiplier
        slider_text = cache_d["speed_text"]
        self.screen.blit(slider_text, (slider_x, panel_y + 15))
        # 滑块条
        slider_bar = pygame.Rect(slider_x + 80, panel_y + 18, 100, 8)
        pygame.draw.rect(self.screen, (80, 80, 80), slider_bar, border_radius=4)
        # 修复: 滑块位置 clamp, 避免 slider_multiplier 超出范围时滑块脱离滑条
        slider_pos = slider_bar.x + int((speed_multiplier - 0.5) / 2.5 * slider_bar.width)
        slider_pos = max(slider_bar.x, min(slider_bar.x + slider_bar.width, slider_pos))
        pygame.draw.circle(self.screen, (200, 200, 200), (slider_pos, slider_bar.y + 4), 6)

        # 统计
        # 修复: 统计文字仅在 atom/molecule 数量变化时重 render
        if cache_d["atom_count"] != atom_count or cache_d["molecule_count"] != molecule_count:
            cache_d["stats_text"] = self.font_small.render(
                f"原子: {atom_count}  分子: {molecule_count}  空格=暂停/开始  E=释放能量  C=清空  R=重置  Del=删除  F1=帮助",
                True, (150, 150, 150))
            cache_d["atom_count"] = atom_count
            cache_d["molecule_count"] = molecule_count
        stats_text = cache_d["stats_text"]
        self.screen.blit(stats_text, (470, panel_y + 15))

        # 选中信息
        # P0-3: 支持多行信息卡, 选中物体上方展示
        if selected_info:
            if isinstance(selected_info, str):
                lines = [selected_info]
            else:
                lines = list(selected_info)
            info_key = "|".join(lines)
            # 优化: 仅在内容变化时重 render 多行
            if cache_d["info_str"] != info_key:
                cache_d["info_text"] = [self.font_medium.render(line, True, (255, 255, 100)) for line in lines]
                cache_d["info_str"] = info_key
            info_surfs = cache_d["info_text"]
            y = 20
            for surf in info_surfs:
                # 半透明背景, 让文字更清晰可读
                bg_rect = pygame.Rect(15, y - 2, surf.get_width() + 10, surf.get_height() + 4)
                bg_surf = pygame.Surface(bg_rect.size, pygame.SRCALPHA)
                bg_surf.fill((0, 0, 0, 160))
                self.screen.blit(bg_surf, bg_rect)
                self.screen.blit(surf, (20, y))
                y += surf.get_height() + 2

        return btn_rect, energy_rect, slider_bar

    def draw_hover_highlight(self, obj):
        """P0-2: 鼠标 hover 高亮 (画半透明外环)"""
        x, y = self.world_to_screen(obj.x, obj.y)
        r = self.scale_r(obj.radius + 6)
        lw1 = self._scale_linew(2)
        lw2 = self._scale_linew(1)
        pygame.draw.circle(self.screen, (255, 255, 50, 100), (x, y), r, lw1)
        pygame.draw.circle(self.screen, (255, 255, 150, 80), (x, y), r - self.scale_r(4), lw2)

    def draw_hover_label(self, obj, mouse_pos):
        """P0-7: hover 时显示元素身份 (鼠标旁) - 不随震动偏移(鼠标位置是屏幕坐标)"""
        from config import ELEMENTS
        if hasattr(obj, 'symbol'):  # Atom
            el = ELEMENTS.get(obj.symbol, {})
            label_text = f"{el.get('name', obj.symbol)} {obj.symbol} (Z={obj.protons})"
            color = (255, 255, 100)
        else:  # Molecule
            label_text = f"{obj.formula}"
            color = (200, 200, 100)

        surf = self.font_small.render(label_text, True, color)
        mx, my = mouse_pos
        lx = min(mx + 15, WINDOW_WIDTH - surf.get_width() - 5)
        ly = min(my + 15, WINDOW_HEIGHT - 70)
        bg_rect = pygame.Rect(lx - 3, ly - 2, surf.get_width() + 6, surf.get_height() + 4)
        bg_surf = pygame.Surface(bg_rect.size, pygame.SRCALPHA)
        bg_surf.fill((0, 0, 0, 180))
        self.screen.blit(bg_surf, bg_rect)
        self.screen.blit(surf, (lx, ly))

    def draw_energy_pulse_visual(self, x, y, radius, alpha):
        """P0-6: 能量脉冲可视化 (屏幕中央扩散环)"""
        ox, oy = int(self.shake_x), int(self.shake_y)
        if radius < 2 or alpha < 5:
            return
        x = int(x) + ox
        y = int(y) + oy
        pygame.draw.circle(self.screen, (255, 200, 100, alpha), (x, y), int(radius), 4)
        pygame.draw.circle(self.screen, (255, 255, 50, alpha // 2), (x, y), int(radius * 0.85), 2)
        pygame.draw.circle(self.screen, (255, 100, 50, alpha // 3), (x, y), int(radius * 0.7), 1)

    def draw_reaction_prediction(self, sel, neighbor, label):
        """P1-5: 拖动时反应预测预览"""
        x1, y1 = self.world_to_screen(sel.x, sel.y)
        x2, y2 = self.world_to_screen(neighbor.x, neighbor.y)
        dx = x2 - x1
        dy = y2 - y1
        dist = max(1, (dx * dx + dy * dy) ** 0.5)
        seg = self.scale_r(10)
        gap = self.scale_r(6)
        cur = 0.0
        lw = self._scale_linew(2)
        while cur < dist:
            sx = x1 + dx * cur / dist
            sy = y1 + dy * cur / dist
            ex = x1 + dx * min(cur + seg, dist) / dist
            ey = y1 + dy * min(cur + seg, dist) / dist
            pygame.draw.line(self.screen, (100, 255, 100), (int(sx), int(sy)), (int(ex), int(ey)), lw)
            cur += seg + gap
        nr = self.scale_r(neighbor.radius + 6)
        pygame.draw.circle(self.screen, (100, 255, 100), (x2, y2), nr, lw)
        lx = (x1 + x2) // 2
        ly = (y1 + y2) // 2
        surf = self.font_small.render(label, True, (100, 255, 100))
        bg_rect = pygame.Rect(lx - surf.get_width() // 2 - 4, ly - surf.get_height() // 2 - 2,
                              surf.get_width() + 8, surf.get_height() + 4)
        bg_surf = pygame.Surface(bg_rect.size, pygame.SRCALPHA)
        bg_surf.fill((0, 0, 0, 180))
        self.screen.blit(bg_surf, bg_rect)
        self.screen.blit(surf, (lx - surf.get_width() // 2, ly - surf.get_height() // 2))

    def draw_fps(self, fps, atom_count, molecule_count, T_K=298, P_atm=1.0,
                 neutron_count=0, dynamic_temp=False):
        """右上角 FPS 叠加显示 + T/P 状态 + 中子数/动态T标记 (UI元素, 不随震动偏移)"""
        if fps <= 0:
            return
        if T_K >= 1e6:
            t_str = f"{T_K/1e6:.2f}M K"
        elif T_K >= 1e3:
            t_str = f"{T_K/1e3:.1f}k K"
        else:
            t_str = f"{T_K:.0f} K"
        if dynamic_temp:
            t_str = "(动态) " + t_str
        if P_atm >= 1000:
            p_str = f"{P_atm/1e3:.1f}k atm"
        elif P_atm < 0.01:
            p_str = f"{P_atm*1e3:.1f} mbar"
        elif P_atm >= 10:
            p_str = f"{P_atm:.0f} atm"
        else:
            p_str = f"{P_atm:.2f} atm"

        parts = [f"FPS: {fps:.0f}", f"原子: {atom_count}", f"分子: {molecule_count}"]
        if neutron_count > 0:
            parts.append(f"中子: {neutron_count}")
        parts.append(f"T: {t_str}")
        parts.append(f"P: {p_str}")
        text = self.font_small.render("  ".join(parts), True, (120, 220, 120))
        # 右上角位置
        bg_rect = pygame.Rect(WINDOW_WIDTH - text.get_width() - 20, 10,
                              text.get_width() + 10, text.get_height() + 4)
        bg_surf = pygame.Surface(bg_rect.size, pygame.SRCALPHA)
        bg_surf.fill((0, 0, 0, 140))
        self.screen.blit(bg_surf, bg_rect)
        self.screen.blit(text, (WINDOW_WIDTH - text.get_width() - 15, 12))

    def draw_pause_hint(self, alpha):
        """P1-2: 屏幕中央 "已暂停" 提示, alpha 0-255 渐隐"""
        if alpha <= 0:
            return
        text = self.font_large.render("已暂停", True, (255, 255, 100))
        # 半透明背景
        tw, th = text.get_width(), text.get_height()
        bg_surf = pygame.Surface((tw + 40, th + 20), pygame.SRCALPHA)
        bg_surf.fill((0, 0, 0, int(alpha * 0.6)))
        self.screen.blit(bg_surf,
                         (WINDOW_WIDTH // 2 - (tw + 40) // 2,
                          WINDOW_HEIGHT // 2 - (th + 20) // 2))
        # 应用 alpha 到文字
        text_surf = text.copy()
        text_surf.set_alpha(alpha)
        self.screen.blit(text_surf,
                         (WINDOW_WIDTH // 2 - tw // 2,
                          WINDOW_HEIGHT // 2 - th // 2))

    def draw_help_screen(self):
        """P1-1: 全屏帮助页 (F1 切换)"""
        # 半透明覆盖层
        overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 200))
        self.screen.blit(overlay, (0, 0))

        help_lines = [
            "原子运动模拟器 — 快捷键帮助",
            "",
            "【控制】",
            "  空格 / 暂停按钮     暂停 / 继续",
            "  E / 能量按钮         释放能量 (加速所有粒子, 触发聚变/反应)",
            "  C                      清空场景",
            "  R                      重置场景 (清空后重新生成初始原子)",
            "  Del / Backspace  删除选中的原子或分子",
            "  ESC                   关闭菜单 / 帮助页",
            "  F1                      切换本帮助页",
            "  p                      截图 (保存到 screenshots/)",
            "",
            "【速度】",
            "  滑块                   调整倍速 (0.1x ~ 5.0x)",
            "  = 键                   倍速微调 +0.25x",
            "  , / .                  倍速粗调 (÷1.5 / ×1.5)",
            "",
            "【视角】",
            "  鼠标滚轮              缩放画面 (以鼠标为中心)",
            "  中键拖拽              平移视角",
            "  Home                  重置视角 (回到中心, 缩放1x)",
            "",
            "【热力学】",
            "  T                      循环温度预设 (50K ~ 15M K)",
            "  Shift+P              循环气压预设 (1e-10 ~ 1M atm)",
            "  [ / ]                  微调温度 (1.5x / 0.67x)",
            "  Shift+[ / ]         微调气压 (1.5x / 0.67x)",
            "  G                      切换动态温度模式 (T 由系统动能决定)",
            "",
            "【元素生成】",
            "  数字键 1-8         H / He / C / N / O / Na / Cl / Fe",
            "  数字键 9 / 0        U(铀) / Pu(钚) - 放射性元素, 可衰变/裂变",
            "  - 键                  Th(钍) - 放射性元素",
            "  左键空白处           弹出全元素菜单 (118 种元素)",
            "  N 键                 在鼠标位置释放中子 (用于触发裂变)",
            "",
            "【核物理】",
            "  放射性衰变:      U/Pu/Th/Ra/Rn/Po/Ac 会自动衰变",
            "                     α 衰变释放 He (黄色闪光), β 衰变释放电子 (蓝色)",
            "  核裂变:              中子轰击 U 可触发裂变 → Ba+Kr+中子 + 冲击波",
            "                     裂变中子可继续触发其他 U 裂变 (链式反应)",
            "  冲击波:              大能量事件产生扩散环, 推动周围粒子",
            "  动态温度 (G):   T 随系统动能自动变化, 蓝→红表示冷热",
            "  聚变铁峰:           Fe 以上重元素聚变吸能, 无法通过聚变获得",
            "  辐射冷却:           高温物体会通过辐射缓慢散热",
            "",
            "【反应】",
            "  高速碰撞 (>8 单位/秒) 可能触发核聚变 (原子 + 原子, 轻元素)",
            "  低速碰撞              可能触发化学反应 (需温度在窗口内)",
            "  释放能量              给所有粒子加速, 触发大量反应",
            "  颜色体系:           闪光颜色基于真实火焰/反应色",
            "",
            "按 F1 或 ESC 关闭",
        ]
        y = 30
        for i, line in enumerate(help_lines):
            color = (255, 255, 100) if i == 0 else (200, 200, 200) if line.startswith("【") else (180, 180, 180)
            font = self.font_medium if i == 0 else self.font_small
            text = font.render(line, True, color)
            self.screen.blit(text, (40, y))
            y += 22 if i == 0 else 18
