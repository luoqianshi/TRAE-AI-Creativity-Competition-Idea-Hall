import pygame
from typing import Optional, Callable, Tuple
from config import GRAY, LIGHT_GRAY, BLACK, WHITE
from ui.fonts import get_chinese_font


class Slider:
    def __init__(self,
                 x: int, y: int,
                 width: int, height: int,
                 min_value: float,
                 max_value: float,
                 default_value: float,
                 label: str = "",
                 precision: int = 0,
                 step: Optional[float] = None,
                 callback: Optional[Callable[[float], None]] = None,
                 font_size: int = 12):
        """
        创建一个新的滑块组件
        
        Args:
            x: 滑块x坐标
            y: 滑块y坐标
            width: 滑块轨道宽度
            height: 滑块轨道高度
            min_value: 最小值
            max_value: 最大值
            default_value: 默认值
            label: 滑块标签
            precision: 数值精度
            step: 步长（可选）
            callback: 值改变时的回调函数（可选）
            font_size: 字体大小
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.min_value = min_value
        self.max_value = max_value
        self.step = step
        self.value = default_value
        self.label = label
        self.precision = precision
        self.callback = callback
        self.is_dragging = False
        self.is_disabled = False
        self.font = get_chinese_font(font_size)
        
        # 计算滑块尺寸
        self.slider_width = 16
        self.slider_height = height + 4
        
        # 预渲染文本
        self._label_surface = None
        self._value_surface = None
        self._render_label()
        
        # 设置初始值
        self.set_value(default_value)
    
    def _render_label(self) -> None:
        """预渲染标签文本"""
        if self.label:
            self._label_surface = self.font.render(self.label, True, BLACK)
    
    def _render_value(self) -> None:
        """预渲染数值文本"""
        value_text = f"{self.value:.{self.precision}f}"
        self._value_surface = self.font.render(value_text, True, BLACK)
    
    def update_slider_position(self) -> None:
        """
        根据当前值更新滑块位置
        """
        ratio = (self.value - self.min_value) / (self.max_value - self.min_value)
        self.slider_x = self.rect.x + ratio * (self.rect.width - self.slider_width)
        self.slider_rect = pygame.Rect(self.slider_x, self.rect.y - 3, self.slider_width, self.slider_height)
    
    def set_enabled(self, enabled: bool) -> None:
        """设置滑块是否可用"""
        self.is_disabled = not enabled
    
    def is_enabled(self) -> bool:
        """检查滑块是否可用"""
        return not self.is_disabled
    
    def get_value(self) -> float:
        """获取当前值"""
        return self.value
    
    def set_value(self, value: float) -> None:
        """
        设置滑块值
        
        Args:
            value: 要设置的值
        """
        # 限制在范围内
        value = max(self.min_value, min(value, self.max_value))
        
        # 应用步长
        if self.step is not None:
            value = round(value / self.step) * self.step
        
        # 应用精度
        if self.precision == 0:
            value = int(round(value))
        else:
            value = round(value, self.precision)
        
        # 如果值发生变化，更新并调用回调
        if value != self.value:
            old_value = self.value
            self.value = value
            self.update_slider_position()
            self._render_value()
            
            # 调用回调
            if self.callback:
                self.callback(value)
        else:
            # 即使值没变，也确保位置和渲染正确
            self.update_slider_position()
            self._render_value()
    
    def set_range(self, min_value: float, max_value: float) -> None:
        """设置滑块的最小值和最大值"""
        self.min_value = min_value
        self.max_value = max_value
        # 重新设置当前值以确保在新范围内
        self.set_value(self.value)
    
    def set_label(self, label: str) -> None:
        """设置滑块标签"""
        self.label = label
        self._render_label()
    
    def draw(self, screen: pygame.Surface) -> None:
        """绘制滑块到屏幕"""
        # 根据状态选择颜色
        if self.is_disabled:
            track_color = tuple(max(0, c - 30) for c in LIGHT_GRAY)
            slider_color = tuple(max(0, c - 50) for c in GRAY)
        else:
            track_color = LIGHT_GRAY
            slider_color = GRAY
        
        # 绘制标签在滑块左侧
        if self._label_surface:
            lx = self.rect.x - self._label_surface.get_width() - 10
            ly = self.rect.y - 2
            screen.blit(self._label_surface, (lx, ly))
        
        # 绘制滑块轨道
        pygame.draw.rect(screen, track_color, self.rect, border_radius=2)
        pygame.draw.rect(screen, BLACK, self.rect, 1, border_radius=2)  # 边框
        
        # 绘制滑块
        pygame.draw.rect(screen, slider_color, self.slider_rect, border_radius=3)
        pygame.draw.rect(screen, BLACK, self.slider_rect, 1, border_radius=3)  # 边框
        
        # 绘制数值在滑块右侧
        if self._value_surface:
            vx = self.rect.x + self.rect.width + 10
            vy = self.rect.y - 2
            screen.blit(self._value_surface, (vx, vy))
    
    def handle_event(self, event: pygame.event.Event) -> bool:
        """处理事件
        
        Args:
            event: pygame事件对象
            
        Returns:
            bool: 如果事件被处理，返回True
        """
        if self.is_disabled:
            return False
        
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            # 检查是否点击了滑块
            if self.slider_rect.collidepoint(event.pos):
                self.is_dragging = True
                return True
            # 检查是否点击了轨道
            elif self.rect.collidepoint(event.pos):
                self.is_dragging = True
                self.update_value_from_position(event.pos[0])
                return True
        
        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            self.is_dragging = False
        
        elif event.type == pygame.MOUSEMOTION and self.is_dragging:
            self.update_value_from_position(event.pos[0])
            return True
        
        # 处理鼠标滚轮
        elif event.type == pygame.MOUSEWHEEL:
            if self.rect.collidepoint(pygame.mouse.get_pos()):
                # 滚轮向上增加，向下减少
                step = self.step if self.step is not None else (self.max_value - self.min_value) / 10
                delta = step if event.y > 0 else -step
                self.set_value(self.value + delta)
                return True
        
        # 键盘控制（提高可访问性）
        elif event.type == pygame.KEYDOWN:
            # 只有当鼠标在滑块上时才响应键盘
            if self.rect.collidepoint(pygame.mouse.get_pos()):
                step = self.step if self.step is not None else (self.max_value - self.min_value) / 10
                if event.key == pygame.K_LEFT or event.key == pygame.K_DOWN:
                    self.set_value(self.value - step)
                    return True
                elif event.key == pygame.K_RIGHT or event.key == pygame.K_UP:
                    self.set_value(self.value + step)
                    return True
        
        return False
    
    def update_value_from_position(self, mouse_x: int) -> None:
        """
        根据鼠标位置更新滑块值
        
        Args:
            mouse_x: 鼠标x坐标
        """
        # 限制在轨道范围内
        x = max(self.rect.x, min(mouse_x, self.rect.x + self.rect.width - self.slider_width))
        ratio = (x - self.rect.x) / (self.rect.width - self.slider_width)
        raw_value = self.min_value + ratio * (self.max_value - self.min_value)
        
        # 使用set_value来处理步长、精度和回调
        self.set_value(raw_value)
