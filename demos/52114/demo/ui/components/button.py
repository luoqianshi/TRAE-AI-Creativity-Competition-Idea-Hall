import pygame
from typing import Optional, Callable, Tuple, Union
from config import GRAY, LIGHT_GRAY, BLACK
from ui.fonts import get_chinese_font


class Button:
    def __init__(self,
                 x: int, y: int,
                 width: int, height: int,
                 text: str,
                 action: Optional[Callable[[], None]] = None,
                 color: Tuple[int, int, int] = GRAY,
                 hover_color: Tuple[int, int, int] = LIGHT_GRAY,
                 text_color: Tuple[int, int, int] = BLACK,
                 font_size: int = 12,
                 border_radius: int = 0):
        """
        创建一个新的按钮组件
        
        Args:
            x: 按钮x坐标
            y: 按钮y坐标
            width: 按钮宽度
            height: 按钮高度
            text: 按钮文字
            action: 按钮点击时执行的回调函数
            color: 按钮正常状态颜色
            hover_color: 按钮悬停状态颜色
            text_color: 文字颜色
            font_size: 文字大小
            border_radius: 边框圆角半径
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.action = action
        self.color = color
        self.hover_color = hover_color
        self.text_color = text_color
        self.is_hovered = False
        self.is_disabled = False
        self.border_radius = border_radius
        self.font = get_chinese_font(font_size)
        
        # 预渲染文字以提高性能
        self._rendered_text = None
        self._text_rect = None
        self._render_text()
    
    def _render_text(self) -> None:
        """预渲染按钮文字以提高性能"""
        self._rendered_text = self.font.render(self.text, True, self.text_color)
        self._text_rect = self._rendered_text.get_rect(center=self.rect.center)
    
    def set_text(self, text: str) -> None:
        """更新按钮文字"""
        if self.text != text:
            self.text = text
            self._render_text()
    
    def set_enabled(self, enabled: bool) -> None:
        """设置按钮是否可用"""
        self.is_disabled = not enabled
    
    def is_enabled(self) -> bool:
        """检查按钮是否可用"""
        return not self.is_disabled
    
    def get_rect(self) -> pygame.Rect:
        """获取按钮矩形区域"""
        return self.rect.copy()
    
    def is_point_inside(self, point: Tuple[int, int]) -> bool:
        """检查点是否在按钮内"""
        return self.rect.collidepoint(point)
    
    def set_position(self, x: int, y: int) -> None:
        """设置按钮位置"""
        self.rect.topleft = (x, y)
        # 更新文字位置
        if self._text_rect:
            self._text_rect.center = self.rect.center
    
    def draw(self, screen: pygame.Surface) -> None:
        """绘制按钮到屏幕"""
        # 根据状态选择颜色
        if self.is_disabled:
            color = tuple(max(0, c - 50) for c in self.color)  # 禁用时颜色变暗
        else:
            color = self.hover_color if self.is_hovered else self.color
        
        # 绘制按钮背景
        pygame.draw.rect(screen, color, self.rect, border_radius=self.border_radius)
        pygame.draw.rect(screen, BLACK, self.rect, 1, border_radius=self.border_radius)  # 边框
        
        # 绘制按钮文字
        if self._rendered_text and self._text_rect:
            screen.blit(self._rendered_text, self._text_rect)
    
    def handle_event(self, event: pygame.event.Event) -> bool:
        """处理事件
        
        Args:
            event: pygame事件对象
            
        Returns:
            bool: 如果事件被处理，返回True
        """
        if self.is_disabled:
            return False
        
        # 只有鼠标事件才有pos属性
        if hasattr(event, 'pos'):
            # 更新悬停状态
            self.is_hovered = self.rect.collidepoint(event.pos)
        
        # 处理点击事件
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.is_hovered and self.action:
                self.action()
                # 添加点击音效支持（如果需要）
                return True
        
        # 处理键盘Tab导航（提高可访问性）
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE or event.key == pygame.K_RETURN:
                if self.is_hovered and self.action:
                    self.action()
                    return True
        
        return False