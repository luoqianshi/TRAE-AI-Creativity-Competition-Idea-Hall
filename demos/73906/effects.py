# effects.py — 粒子特效

import math
import random
import collections
import pygame

class FlashEffect:
    """闪光特效 (支持自定义颜色)"""
    def __init__(self, x, y, max_radius=60, duration=15, color=(255, 255, 200)):
        self.x = x
        self.y = y
        self.max_radius = max_radius
        self.radius = 0
        self.duration = max(1, duration)  # 避免除零
        self.timer = self.duration
        self.color = color

    def update(self):
        self.timer -= 1
        progress = 1 - self.timer / self.duration
        self.radius = self.max_radius * progress
        return self.timer > 0

    def get_params(self):
        if self.duration <= 0:
            return (self.x, self.y, self.radius, 0)
        # 修复: alpha 应该是"满 alpha → 0"渐隐(闪光开始时最亮,然后淡出)
        alpha = int(255 * self.timer / self.duration)
        return (self.x, self.y, self.radius, max(0, min(255, alpha)))


class BurstParticle:
    """爆散粒子"""
    def __init__(self, x, y, speed, angle, color, lifetime=30):
        self.x = x
        self.y = y
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed
        self.color = color
        self.lifetime = max(1, lifetime)  # 避免除零
        self.timer = self.lifetime
        self.radius = 3

    def update(self):
        self.timer -= 1
        self.x += self.vx
        self.y += self.vy
        self.vx *= 0.96
        self.vy *= 0.96
        self.radius *= 0.98
        return self.timer > 0

    def get_params(self):
        if self.lifetime <= 0:
            return (self.x, self.y, self.radius, 0)
        alpha = int(255 * self.timer / self.lifetime)
        return (self.x, self.y, self.radius, alpha)


class EnergyWave:
    """能量波纹"""
    def __init__(self, x, y, max_radius=150, duration=40):
        self.x = x
        self.y = y
        self.max_radius = max_radius
        self.radius = 0
        self.duration = max(1, duration)  # 避免除零
        self.timer = self.duration

    def update(self):
        self.timer -= 1
        progress = 1 - self.timer / self.duration
        self.radius = self.max_radius * progress
        return self.timer > 0

    def get_params(self):
        if self.duration <= 0:
            return (self.x, self.y, self.radius, 0)
        # 修复: alpha 应该是"满 alpha → 0"渐隐(波纹扩散时逐渐变暗)
        alpha = int(200 * self.timer / self.duration)
        return (self.x, self.y, self.radius, max(0, min(255, alpha)))


class PhotonParticle:
    """光子粒子（电子跃迁释放 / 伽马射线）"""
    def __init__(self, x, y, color=(255, 255, 200), speed=None, angle=None, lifetime=20):
        self.x = x
        self.y = y
        if angle is not None and speed is not None:
            self.vx = math.cos(angle) * speed
            self.vy = math.sin(angle) * speed
        elif speed is not None:
            ang = random.uniform(0, 2 * math.pi)
            self.vx = math.cos(ang) * speed
            self.vy = math.sin(ang) * speed
        else:
            self.vx = random.uniform(-2, 2)
            self.vy = random.uniform(-2, 2)
        self.color = color
        self.lifetime = max(1, lifetime)
        self.timer = self.lifetime
        self.radius = 2

    def update(self):
        self.timer -= 1
        self.x += self.vx
        self.y += self.vy
        return self.timer > 0

    def get_params(self):
        if self.lifetime <= 0:
            return (self.x, self.y, self.radius, 0)
        alpha = int(255 * self.timer / self.lifetime)
        return (self.x, self.y, self.radius, alpha)


class ReactionLabel:
    """反应标签（显示化学方程式）"""
    def __init__(self, x, y, text, lifetime=60):
        self.x = x
        self.y = y
        self.text = text
        self.lifetime = max(1, lifetime)  # 避免除零
        self.timer = self.lifetime
        # 预计算淡出起点(原 get_params 中每帧重算, 移到 __init__ 只算一次)
        self.fade_start = min(self.lifetime * 0.3, 30)

    def update(self):
        self.timer -= 1
        self.y -= 0.7  # 上浮
        return self.timer > 0

    def get_params(self):
        if self.lifetime <= 0:
            return (self.x, self.y, self.text, 0)
        # 修复: 用 lifetime 完整周期作为淡出时间,前段保持满 alpha 0.3s,然后平滑淡出
        # lifetime=60 帧,前 18 帧保持 255(约 0.3s),后 42 帧平滑淡出
        fade_start = self.fade_start
        if self.timer > fade_start:
            alpha = 255
        else:
            alpha = int(255 * self.timer / max(1, fade_start))
        return (self.x, self.y, self.text, max(0, min(255, alpha)))


# P0-3: 轨迹类
# 用 deque 存 N 个历史点, alpha 渐隐绘制, 给高速粒子视觉冲击

class Trail:
    """原子/分子轨迹（拖尾）
    用 deque 存最近 N 个 (x, y) 点
    使用临时 SRCALPHA surface 绘制带 alpha 的线条，然后 blit 到屏幕
    """
    def __init__(self, max_len=20):
        self.points = collections.deque(maxlen=max_len)

    def add(self, x, y):
        """每帧调用, 添加当前点"""
        self.points.append((x, y))

    def draw(self, screen, color):
        """绘制轨迹: 越老越透明 (alpha 0→255)
        使用临时 SRCALPHA surface 以支持逐线 alpha 混合
        """
        n = len(self.points)
        if n < 2:
            return
        cr, cg, cb = color[0], color[1], color[2]
        # 计算包围盒以创建最小临时 surface
        xs = [p[0] for p in self.points]
        ys = [p[1] for p in self.points]
        min_x, max_x = int(min(xs)) - 4, int(max(xs)) + 4
        min_y, max_y = int(min(ys)) - 4, int(max(ys)) + 4
        w = max(10, max_x - min_x)
        h = max(10, max_y - min_y)
        # 创建临时 SRCALPHA surface
        tmp = pygame.Surface((w, h), pygame.SRCALPHA)
        pts = self.points
        prev = pts[0]
        for i in range(1, n):
            cur = pts[i]
            # alpha: 0 (oldest, i=0 near) → 255 (newest, i=n-1)
            t = i / max(1, n - 1)
            alpha = int(255 * t)
            line_w = max(1, int(3 * t))
            px = int(prev[0]) - min_x
            py = int(prev[1]) - min_y
            cx = int(cur[0]) - min_x
            cy = int(cur[1]) - min_y
            pygame.draw.line(tmp, (cr, cg, cb, alpha), (px, py), (cx, cy), line_w)
            prev = cur
        screen.blit(tmp, (min_x, min_y))


class ShockWave:
    """冲击波 (F3): 从爆炸点扩散的环形波前, 推动粒子运动"""
    def __init__(self, x, y, speed=5, max_radius=500, life=80, color=(255, 200, 100)):
        self.x = x
        self.y = y
        self.radius = 0
        self.speed = speed
        self.max_radius = max_radius
        self.life = max(1, life)
        self.timer = self.life
        self.color = color
        self.thickness = 8
        self.force_mult = 0.5

    def update(self):
        self.timer -= 1
        self.radius += self.speed
        # 波前逐渐减速
        self.speed *= 0.98
        return self.timer > 0 and self.radius < self.max_radius

    def get_params(self):
        if self.life <= 0:
            return (self.x, self.y, self.radius, 0, self.color)
        alpha = int(180 * self.timer / self.life)
        return (self.x, self.y, self.radius, max(0, min(255, alpha)), self.color)

    def applies_force(self, obj_x, obj_y):
        """判断对象是否在波前上 (应受推力), 返回力的方向单位向量和力度"""
        dx = obj_x - self.x
        dy = obj_y - self.y
        dist = math.sqrt(dx * dx + dy * dy)
        wave_front = self.radius
        # 波前厚度范围
        if abs(dist - wave_front) < self.thickness and dist > 0:
            nx = dx / dist
            ny = dy / dist
            force = self.force_mult * (self.timer / self.life)
            return (nx, ny, force)
        return None


class Neutron:
    """自由中子 (F2): 裂变释放的中子, 触发链式反应"""
    def __init__(self, x, y, vx, vy):
        from config import NUCLEAR_COLORS
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.radius = 4
        self.lifetime = 180  # 3秒后消失
        self.timer = self.lifetime
        self.color = NUCLEAR_COLORS["neutron"]
        self.mass = 1
        self.symbol = "n"
        # 拖尾
        self.trail = collections.deque(maxlen=8)

    def update(self):
        from config import WINDOW_WIDTH, WINDOW_HEIGHT
        self.timer -= 1
        self.trail.append((self.x, self.y))
        self.x += self.vx
        self.y += self.vy
        # 墙壁反弹
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
        elif self.y + r > WINDOW_HEIGHT - 50:  # UI 面板区域不进入
            self.y = WINDOW_HEIGHT - 50 - r
            self.vy = -abs(self.vy)
        self.vx *= 0.995
        self.vy *= 0.995
        return self.timer > 0

    def get_params(self):
        alpha = int(255 * min(1, self.timer / 30))
        return (self.x, self.y, self.radius, max(0, min(255, alpha)), self.color)