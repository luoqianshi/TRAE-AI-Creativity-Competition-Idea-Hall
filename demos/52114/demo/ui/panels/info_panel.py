import pygame
from typing import Optional, Dict, Any
from config import WHITE, BLACK, GRAY, LIGHT_GRAY, INFO_PANEL_WIDTH, INFO_PANEL_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH
from ui.fonts import get_chinese_font


class InfoPanel:
    """
    生物体信息面板类
    
    用于显示被选中生物体的详细信息的UI面板。当用户点击屏幕上的生物体时，
    该面板会显示该生物体的类型、能量、年龄等属性。
    """
    
    def __init__(self,
                 x: Optional[int] = None,
                 y: Optional[int] = None,
                 width: int = INFO_PANEL_WIDTH,
                 height: int = INFO_PANEL_HEIGHT,
                 font_size: int = 12):
        """
        初始化信息面板
        
        Args:
            x: 面板x坐标，如果为None则使用默认位置（右下角）
            y: 面板y坐标，如果为None则使用默认位置（右下角）
            width: 面板宽度
            height: 面板高度
            font_size: 字体大小
        """
        # 设置面板位置和尺寸（如果未指定则默认在右下角）
        self.x = x if x is not None else SCREEN_WIDTH - width - 10  # 面板x坐标
        self.y = y if y is not None else SCREEN_HEIGHT - height - 10  # 面板y坐标
        self.width = width  # 面板宽度
        self.height = height  # 面板高度
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)  # 面板矩形区域
        
        # 初始化状态变量
        self.selected_organism = None  # 当前选中的生物体
        self.font = get_chinese_font(font_size)  # 获取中文字体
        
        # 预渲染静态文本（提高渲染性能）
        self._title_surface = None  # 标题文本表面
        self._no_selection_surface = None  # 无选择状态文本表面
        self._render_static_texts()  # 渲染静态文本
        
        # 缓存信息项以提高性能
        self._cached_info_items = None  # 缓存的生物体信息项
        self._cached_organism_id = None  # 缓存的生物体ID，用于判断是否需要更新缓存
    
    def _render_static_texts(self) -> None:
        """
        预渲染静态文本
        
        内部方法，预渲染面板中不会改变的静态文本，如标题和提示信息，
        以提高渲染性能，避免在每帧重复创建相同的文本表面。
        """
        # 预渲染面板标题
        self._title_surface = self.font.render("生物信息", True, BLACK)
        # 预渲染无选择状态的提示文本
        self._no_selection_surface = self.font.render("点击生物查看详细信息", True, GRAY)
    
    def set_selected_organism(self, organism: Optional[Any]) -> None:
        """
        设置选中的生物体
        
        Args:
            organism: 选中的生物体对象，为None时取消选择
            
        当生物体发生变化时，会相应更新内部缓存状态，确保面板显示正确的信息。
        若生物体为None，则完全清除缓存；若生物体不同，则更新缓存ID并清除内容缓存。
        """
        self.selected_organism = organism
        # 清除缓存
        if organism is None:
            self._cached_info_items = None
            self._cached_organism_id = None
        else:
            # 检查是否需要刷新缓存
            current_id = id(organism)
            if current_id != self._cached_organism_id:
                self._cached_organism_id = current_id
                self._cached_info_items = None
    
    def clear_selection(self) -> None:
        """清除选中的生物体"""
        self.set_selected_organism(None)
    
    def update(self, dt: float) -> None:
        """
        更新面板状态
        
        Args:
            dt: 时间增量（秒），用于同步动画和游戏状态更新
            
        检查选中生物体的存活状态，如果生物体已死亡，则自动清除选择，
        确保不会显示不再存在的生物体信息。
        """
        # 如果有选中的生物体但已死亡，清除选择
        if self.selected_organism and hasattr(self.selected_organism, 'is_alive'):
            if not self.selected_organism.is_alive():
                self.clear_selection()
    
    def draw(self, screen: pygame.Surface) -> None:
        """
        绘制信息面板
        
        Args:
            screen: pygame表面对象，用于绘制面板内容
            
        按照以下顺序绘制面板内容：
        1. 绘制面板背景和边框（带圆角）
        2. 绘制面板标题
        3. 根据选中状态绘制内容：
           - 无有效选择：显示提示信息
           - 有有效选择：获取生物体信息并按格式绘制
        包括自动处理文本长度限制和面板溢出情况。
        """
        # 绘制面板背景和边框
        pygame.draw.rect(screen, WHITE, self.rect, border_radius=5)  # 白色背景，带圆角
        pygame.draw.rect(screen, BLACK, self.rect, 2, border_radius=5)  # 黑色边框，带圆角
        
        # 绘制标题
        screen.blit(self._title_surface, (self.x + 10, self.y + 10))
        
        # 检查是否有选中的生物体且存活
        has_valid_selection = (self.selected_organism and 
                              hasattr(self.selected_organism, 'is_alive') and 
                              self.selected_organism.is_alive())
        
        if not has_valid_selection:
            # 没有选中生物时显示提示
            screen.blit(self._no_selection_surface, (self.x + 20, self.y + 40))
            return
        
        # 绘制生物详细信息
        y_offset = 40  # 信息文本起始垂直偏移量
        
        try:
            if hasattr(self.selected_organism, 'get_info'):
                self._cached_info_items = self.selected_organism.get_info()
        except Exception:
            self._cached_info_items = None
        
        # 绘制信息
        if isinstance(self._cached_info_items, dict):
            # 优先显示位置信息（坐标），确保用户能立即看到
            if "位置" in self._cached_info_items:
                position_text = f"位置: {self._cached_info_items['位置']}"
                position_surface = self.font.render(position_text, True, BLACK)
                screen.blit(position_surface, (self.x + 20, self.y + y_offset))
                y_offset += 20
            
            # 然后显示其他信息，但跳过已经显示的位置信息
            for key, value in self._cached_info_items.items():
                # 跳过已经显示的位置信息
                if key == "位置":
                    continue
                    
                # 限制文本长度以避免超出面板
                display_text = f"{key}: {value}"
                if len(display_text) > 40:  # 限制最大字符数
                    display_text = display_text[:37] + "..."
                
                text_surface = self.font.render(display_text, True, BLACK)
                
                # 确保文本不会超出面板底部
                if y_offset + self.font.get_height() < self.height - 10:
                    screen.blit(text_surface, (self.x + 20, self.y + y_offset))
                    y_offset += 20  # 每行信息之间的间距
                else:
                    # 显示省略号，表示还有更多信息
                    more_text = self.font.render("...", True, GRAY)
                    screen.blit(more_text, (self.x + 20, self.y + y_offset))
                    break
        else:
            # 显示无数据提示
            screen.blit(self.font.render("暂无数据", True, GRAY), (self.x + 20, self.y + y_offset))
    
    def handle_event(self, event: pygame.event.Event) -> bool:
        """
        处理事件
        
        Args:
            event: pygame事件对象
            
        Returns:
            bool: 如果事件被处理，返回True
        """
        # 信息面板本身通常不需要处理事件
        # 事件处理在主循环中完成
        return False
    
    def is_point_inside(self, point: tuple) -> bool:
        """
        检查点是否在面板内
        
        Args:
            point: (x, y) 坐标点
            
        Returns:
            bool: 如果点在面板内返回True
        """
        return self.rect.collidepoint(point)
    
    def get_rect(self) -> pygame.Rect:
        """
        获取面板的矩形区域
        
        Returns:
            pygame.Rect: 面板的矩形区域
        """
        return self.rect.copy()
