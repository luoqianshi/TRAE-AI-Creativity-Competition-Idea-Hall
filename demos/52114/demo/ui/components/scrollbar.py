import pygame
from typing import Optional, Callable
from config import GRAY, LIGHT_GRAY, BLACK


class ScrollBar:
    def __init__(self,
                 x: int,
                 y: int,
                 width: int,
                 height: int,
                 content_height: int,
                 viewport_height: int,
                 orientation: str = 'vertical',
                 min_handle_size: int = 20,
                 scroll_speed: int = 20,
                 callback: Optional[Callable[[float], None]] = None):
        """
        创建一个新的滚动条组件
        
        Args:
            x: 滚动条x坐标
            y: 滚动条y坐标
            width: 滚动条宽度
            height: 滚动条高度
            content_height: 内容总高度
            viewport_height: 可视区域高度
            orientation: 滚动条方向 ('vertical' 或 'horizontal')
            min_handle_size: 手柄最小尺寸
            scroll_speed: 滚动速度
            callback: 滚动位置改变时的回调函数（可选）
        """
        self.rect = pygame.Rect(x, y, width, height)
        self.content_height = content_height  # 内容总高度
        self.viewport_height = viewport_height  # 可视区域高度
        self.orientation = orientation.lower()
        self.min_handle_size = min_handle_size
        self.scroll_speed = scroll_speed
        self.callback = callback
        
        self.scroll_position = 0  # 当前滚动位置
        self.is_dragging = False
        self.drag_offset = 0
        self.is_disabled = False
        
        # 计算滚动条手柄大小
        self.handle_rect = pygame.Rect(0, 0, 0, 0)
        self.update_handle_size()
    
    def update_handle_size(self) -> None:
        """
        更新滚动条手柄大小
        """
        if self.content_height <= 0:
            self.handle_height = self.rect.height
        else:
            ratio = min(1.0, self.viewport_height / self.content_height)
            self.handle_height = max(self.min_handle_size, int(self.rect.height * ratio))
        
        self.update_handle_position()
    
    def update_handle_position(self) -> None:
        """
        更新滚动条手柄位置
        """
        if self.content_height <= self.viewport_height:
            # 内容不足时，手柄位于顶部
            self.handle_rect = pygame.Rect(self.rect.x, self.rect.y, self.rect.width, self.handle_height)
            self.scroll_position = 0
        else:
            # 根据滚动位置计算手柄位置
            ratio = self.scroll_position / (self.content_height - self.viewport_height)
            handle_y = self.rect.y + ratio * (self.rect.height - self.handle_height)
            self.handle_rect = pygame.Rect(self.rect.x, handle_y, self.rect.width, self.handle_height)
    
    def set_enabled(self, enabled: bool) -> None:
        """设置滚动条是否可用"""
        self.is_disabled = not enabled
    
    def is_enabled(self) -> bool:
        """检查滚动条是否可用"""
        return not self.is_disabled
    
    def set_content_height(self, content_height: int) -> None:
        """
        设置内容高度
        
        Args:
            content_height: 新的内容高度
        """
        if content_height != self.content_height:
            self.content_height = content_height
            self.update_handle_size()
            
            # 确保滚动位置有效
            self.scroll_position = min(self.scroll_position, max(0, self.content_height - self.viewport_height))
            self.update_handle_position()
    
    def set_viewport_height(self, viewport_height: int) -> None:
        """
        设置可视区域高度
        
        Args:
            viewport_height: 新的可视区域高度
        """
        if viewport_height != self.viewport_height:
            self.viewport_height = viewport_height
            self.update_handle_size()
    
    def set_scroll_position(self, position: float) -> None:
        """
        设置滚动位置
        
        Args:
            position: 新的滚动位置
        """
        # 限制在有效范围内
        old_position = self.scroll_position
        self.scroll_position = max(0, min(position, max(0, self.content_height - self.viewport_height)))
        
        # 如果位置发生变化，更新手柄位置并调用回调
        if self.scroll_position != old_position:
            self.update_handle_position()
            if self.callback:
                self.callback(self.scroll_position)
    
    def scroll_by(self, amount: float) -> None:
        """
        按指定数量滚动
        
        Args:
            amount: 滚动量（正值向下/向右，负值向上/向左）
        """
        self.set_scroll_position(self.scroll_position + amount)
    
    def scroll_to_top(self) -> None:
        """滚动到顶部"""
        self.set_scroll_position(0)
    
    def scroll_to_bottom(self) -> None:
        """滚动到底部"""
        self.set_scroll_position(max(0, self.content_height - self.viewport_height))
    
    def get_scroll_ratio(self) -> float:
        """
        获取滚动比例 (0.0 - 1.0)
        
        Returns:
            float: 滚动比例
        """
        if self.content_height <= self.viewport_height:
            return 0.0
        return self.scroll_position / (self.content_height - self.viewport_height)
    
    def get_scroll_offset(self) -> float:
        """
        获取滚动偏移量
        
        Returns:
            float: 滚动偏移量
        """
        return self.scroll_position
    
    def is_visible(self) -> bool:
        """
        检查滚动条是否可见
        
        Returns:
            bool: 如果内容高度大于可视区域高度则返回True
        """
        return self.content_height > self.viewport_height
    
    def draw(self, screen: pygame.Surface) -> None:
        """
        绘制滚动条到屏幕
        
        Args:
            screen: pygame表面对象
        """
        # 只有当内容高度大于可视区域高度时才绘制
        if not self.is_visible():
            return
        
        # 根据状态选择颜色
        if self.is_disabled:
            bg_color = tuple(max(0, c - 30) for c in LIGHT_GRAY)
            handle_color = tuple(max(0, c - 50) for c in GRAY)
        else:
            bg_color = LIGHT_GRAY
            handle_color = GRAY
        
        # 绘制滚动条背景
        pygame.draw.rect(screen, bg_color, self.rect, border_radius=2)
        pygame.draw.rect(screen, BLACK, self.rect, 1, border_radius=2)  # 边框
        
        # 绘制滚动条手柄
        pygame.draw.rect(screen, handle_color, self.handle_rect, border_radius=1)
        pygame.draw.rect(screen, BLACK, self.handle_rect, 1, border_radius=1)  # 边框
    
    def handle_event(self, event: pygame.event.Event) -> bool:
        """
        处理事件
        
        Args:
            event: pygame事件对象
            
        Returns:
            bool: 如果事件被处理，返回True
        """
        if self.is_disabled or not self.is_visible():
            return False
        
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            # 检查是否点击了手柄
            if self.handle_rect.collidepoint(event.pos):
                self.is_dragging = True
                self.drag_offset = event.pos[1] - self.handle_rect.y
                return True
            # 检查是否点击了轨道
            elif self.rect.collidepoint(event.pos):
                # 点击轨道时，滚动到相应位置
                click_y = event.pos[1] - self.rect.y
                ratio = click_y / self.rect.height
                new_position = ratio * (self.content_height - self.viewport_height)
                
                # 如果点击在手柄上方，滚动到上一页；如果点击在手柄下方，滚动到下一页
                if click_y < self.handle_rect.y - self.rect.y:
                    # 上一页
                    new_position = max(0, self.scroll_position - self.viewport_height)
                elif click_y > self.handle_rect.y + self.handle_height - self.rect.y:
                    # 下一页
                    new_position = min(self.content_height - self.viewport_height, 
                                      self.scroll_position + self.viewport_height)
                
                self.set_scroll_position(new_position)
                return True
        
        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            self.is_dragging = False
        
        elif event.type == pygame.MOUSEMOTION and self.is_dragging:
            # 计算新的手柄位置
            new_y = event.pos[1] - self.drag_offset - self.rect.y
            new_y = max(0, min(new_y, self.rect.height - self.handle_height))
            ratio = new_y / (self.rect.height - self.handle_height)
            new_position = ratio * (self.content_height - self.viewport_height)
            
            self.set_scroll_position(new_position)
            return True
        
        # 处理鼠标滚轮
        elif event.type == pygame.MOUSEWHEEL:
            # 检查鼠标是否在滚动条上或相关区域
            if self.rect.collidepoint(pygame.mouse.get_pos()):
                # 滚轮向上减小偏移量（向上滚动），向下增大偏移量（向下滚动）
                scroll_amount = -event.y * self.scroll_speed
                self.scroll_by(scroll_amount)
                return True
        
        # 键盘控制（提高可访问性）
        elif event.type == pygame.KEYDOWN:
            # 只有当鼠标在滚动条上时才响应键盘
            if self.rect.collidepoint(pygame.mouse.get_pos()):
                if event.key == pygame.K_UP:
                    self.scroll_by(-self.scroll_speed)
                    return True
                elif event.key == pygame.K_DOWN:
                    self.scroll_by(self.scroll_speed)
                    return True
                elif event.key == pygame.K_PAGEUP:
                    self.scroll_by(-self.viewport_height)
                    return True
                elif event.key == pygame.K_PAGEDOWN:
                    self.scroll_by(self.viewport_height)
                    return True
                elif event.key == pygame.K_HOME:
                    self.scroll_to_top()
                    return True
                elif event.key == pygame.K_END:
                    self.scroll_to_bottom()
                    return True
        
        return False