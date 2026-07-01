import pygame
from typing import Dict, List, Tuple
from config import WHITE, BLACK, GRAY, LIGHT_GRAY, STATS_PANEL_WIDTH, STATS_PANEL_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT
from ui.fonts import get_chinese_font
from utils import curve_data


class StatsPanel:
    """
    生态统计面板类
    
    用于显示生态系统中各类型生物体的数量统计和历史趋势图表的UI面板。
    包含生产者、草食动物和肉食动物的实时数量显示，以及数量变化的历史曲线。
    """
    
    def __init__(self):
        """
        初始化统计面板
        
        设置面板的位置、尺寸、字体、图表区域以及文本缓存等属性。
        面板默认位于屏幕左下角，显示生态统计数据和趋势图表。
        """
        # 面板位置调整为左下角
        self.x: int = 10  # 面板x坐标
        self.y: int = SCREEN_HEIGHT - STATS_PANEL_HEIGHT - 40  # 面板y坐标
        self.width: int = STATS_PANEL_WIDTH  # 面板宽度
        self.height: int = STATS_PANEL_HEIGHT  # 面板高度
        self.rect: pygame.Rect = pygame.Rect(self.x, self.y, self.width, self.height)  # 面板矩形区域
        
        # 设置字体
        self.font = get_chinese_font(12)  # 获取中文字体
        
        # 图表区域设置
        self.chart_x: int = self.x + 100  # 图表起始x坐标
        self.chart_y: int = self.y + 20  # 图表起始y坐标
        self.chart_width: int = self.width - 150  # 图表宽度
        self.chart_height: int = 100  # 图表高度
        
        # 缓存渲染的文本表面，提高性能
        self._cached_texts: Dict[str, pygame.Surface] = {}  # 缓存文本表面
        self._cached_counts: Dict[str, int] = {}  # 缓存计数值
        self._title_surface: pygame.Surface = self.font.render("生态统计", True, BLACK)  # 面板标题
    
    def update(self, organism_counts: Dict[str, int]) -> None:
        """
        更新统计数据
        
        处理传入的生物类型数量信息，更新内部缓存以提高渲染性能。
        此方法确保文本渲染仅在计数值变化时才会重新生成。
        
        Args:
            organism_counts: 字典，键为生物类型名称（'producer', 'herbivore', 'carnivore'等），
                           值为对应的当前数量
        """
        # 更新计数缓存，存储各类型生物的最新数量
        for organism_type, count in organism_counts.items():
            self._cached_counts[organism_type] = count
        
        # 绘制函数会处理曲线绘制，这里不需要调用update_curve
        
    def update_stats(self, organism_counts: Dict[str, int], *args, **kwargs) -> None:
        """
        更新统计数据的回调方法，供Simulation类调用
        
        Args:
            organism_counts: 各种生物类型及其数量的字典
            *args: 额外的位置参数
            **kwargs: 额外的关键字参数
        """
        self.update(organism_counts)
        # 确保使用的是生物体数量而非能量总和
        producer = organism_counts.get('producer', 0)
        herbivore = organism_counts.get('herbivore', 0)
        carnivore = organism_counts.get('carnivore', 0)
        try:
            # 直接使用传入的计数数据，确保曲线显示的是存活数量
            curve_data.add_point(producer, herbivore, carnivore)
        except Exception as e:
            # 添加简单的错误捕获，避免程序崩溃
            pass
    
    def reset(self):
        """
        重置统计面板数据
        
        清空所有缓存的计数和文本表面，当生态系统重置时调用此方法。
        这确保了新的模拟开始时统计面板能够从头开始显示数据，避免旧数据的干扰。
        """
        # 清空缓存的计数，移除所有存储的生物数量信息
        self._cached_counts.clear()
        # 清空文本表面缓存，确保重新生成文本渲染
        self._cached_texts.clear()
    
    def draw(self, screen: pygame.Surface, organism_counts: Dict[str, int]) -> None:
        """
        绘制统计面板
        
        将面板的背景、边框、标题、统计数据和趋势图表绘制到屏幕上。
        使用缓存机制优化文本渲染性能，只在计数值变化时重新生成文本表面。
        
        Args:
            screen: pygame表面对象，用于绘制面板内容
            organism_counts: 字典，包含当前生态系统中各类型生物的数量
        """
        # 绘制面板背景和边框
        pygame.draw.rect(screen, WHITE, self.rect, border_radius=5)  # 白色圆角背景
        pygame.draw.rect(screen, BLACK, self.rect, 2, border_radius=5)  # 2像素宽的黑色边框
        
        # 绘制面板标题"生态统计"
        screen.blit(self._title_surface, (self.x + 10, self.y + 10))
        
        # 绘制当前统计数据，每种生物类型一行
        y_offset: int = 40  # 起始垂直偏移
        for organism_type, count in organism_counts.items():
            self._draw_count_text(screen, organism_type, count, y_offset)
            y_offset += 20  # 每行间隔20像素
        
        # 绘制图表区域边框，增强视觉分隔
        pygame.draw.rect(screen, LIGHT_GRAY, 
                         (self.chart_x - 1, self.chart_y - 1, self.chart_width + 2, self.chart_height + 2), border_radius=2)
        
        # 绘制曲线图，显示各生物类型的数量变化趋势
        self._draw_curves(screen)
    
    def _draw_count_text(self, screen: pygame.Surface, organism_type: str, count: int, y_offset: int) -> None:
        """
        绘制带缓存的数量文本
        
        内部方法，使用缓存机制高效绘制生物数量文本，避免不必要的文本重绘。
        只有当生物类型或数量发生变化时才会重新生成文本表面，提高渲染性能。
        
        Args:
            screen: pygame表面对象，用于绘制文本
            organism_type: 生物类型标识符（如'producer'、'herbivore'）
            count: 当前数量
            y_offset: 文本垂直偏移量
        """
        # 检查缓存是否有效（文本未生成或数量变化时重渲染）
        if organism_type not in self._cached_texts or self._cached_counts.get(organism_type) != count:
            text: str = f"{organism_type}: {count}"
            self._cached_texts[organism_type] = self.font.render(text, True, BLACK)
            self._cached_counts[organism_type] = count
        
        # 绘制缓存的文本表面，避免重复渲染相同内容
        screen.blit(self._cached_texts[organism_type], (self.x + 20, self.y + y_offset))
    
    def _draw_curves(self, screen: pygame.Surface) -> None:
        """
        绘制生物数量趋势曲线
        
        内部方法，从curve_data模块获取历史数据，并为每种生物类型绘制对应的趋势曲线。
        使用不同的颜色区分生产者（绿色）、草食动物（橙色）和肉食动物（红色）。
        现在所有生物类型使用相同的纵坐标比例，便于比较观察。
        
        Args:
            screen: pygame表面对象，用于绘制曲线
        """
        # 从curve_data模块获取所有生物类型的历史数据
        data = curve_data.get_all_data()
        
        # 定义要绘制的曲线系列，包括标签、数据源和颜色
        series = [
            ('生产者', data.get('producer_counts', []), (0, 200, 0)),      # 绿色表示生产者
            ('草食动物', data.get('herbivore_counts', []), (255, 165, 0)),  # 橙色表示草食动物
            ('肉食动物', data.get('carnivore_counts', []), (255, 0, 0)),    # 红色表示肉食动物
        ]
        
        # 计算所有曲线的最大Y值，用于统一纵坐标比例
        max_value = 1  # 默认最小值，避免除零错误
        for _, values, _ in series:
            if values:
                current_max = max(values)
                if current_max > max_value:
                    max_value = current_max
        
        # 遍历每个曲线系列，调用_draw_single_curve方法绘制单条曲线，并传递统一的最大值
        for label, values, color in series:
            self._draw_single_curve(screen, values, color, label, max_value)
    
    def _draw_single_curve(self, screen: pygame.Surface, values: List[int], 
                          color: Tuple[int, int, int], label: str, max_value: int) -> None:
        """
        绘制单条生物数量趋势曲线
        
        内部方法，根据历史数据绘制特定生物类型的数量变化曲线。
        包括计算曲线点坐标、绘制线条和在曲线末端绘制标签，确保曲线在图表区域内正确显示。
        使用异常处理确保绘制过程中的错误不会导致整个程序崩溃。
        现在使用统一的纵坐标比例，所有生物类型在同一比例下显示，便于比较。
        
        Args:
            screen: pygame表面对象，用于绘制曲线
            values: 历史数据值列表
            color: 曲线颜色
            label: 生物类型标签
            max_value: 所有生物类型的最大数量，用于统一纵坐标比例
        """
        # 确保有足够的数据点来绘制曲线
        if len(values) < 2:
            return
        
        try:
            # 使用传入的统一最大Y值，确保所有曲线使用相同的纵坐标比例
            if max_value == 0:
                max_value = 1
            
            # 绘制曲线
            points: List[Tuple[float, float]] = []
            # 遍历历史数据点，计算其在图表中的坐标位置
            for i, value in enumerate(values):
                # 计算X坐标，基于数据点索引在图表宽度范围内均匀分布
                x: float = self.chart_x + (i / (len(values) - 1)) * self.chart_width
                # 确保Y坐标在有效范围内，通过归一化处理防止数据超出图表边界
                normalized_value: float = min(value / max_value, 1.0)  # 使用统一的最大值进行归一化
                # 计算Y坐标，并考虑pygame坐标系Y轴向下的特点
                y: float = self.chart_y + self.chart_height - (normalized_value * self.chart_height)
                # 确保Y坐标在图表区域内
                points.append((x, max(self.chart_y, min(self.chart_y + self.chart_height, y))))
            
            # 绘制曲线，宽度为2像素
            if points:
                pygame.draw.lines(screen, color, False, points, 2)
                
                # 在曲线末端绘制标签，便于用户识别不同生物类型的曲线
                last_x, last_y = points[-1]
                text_surface: pygame.Surface = self.font.render(label, True, color)
                # 确保标签不超出屏幕边界
                text_x: int = int(last_x + 5)
                text_y: int = int(last_y - 10)
                if text_x + text_surface.get_width() > self.rect.right:
                    # 如果右侧超出边界，则将标签放在曲线左侧
                    text_x = int(last_x - text_surface.get_width() - 5)
                screen.blit(text_surface, (text_x, text_y))
        except Exception:
            # 防止绘制错误导致程序崩溃
            pass
    
    def handle_event(self, event: pygame.event.Event) -> bool:
        """
        处理事件
        
        Args:
            event: pygame事件
            
        Returns:
            bool: 是否处理了事件
        """
        # 统计面板本身不需要处理事件
        return False
    
    def is_point_inside(self, point: Tuple[int, int]) -> bool:
        """
        检查点是否在面板内
        
        Args:
            point: (x, y)坐标点
            
        Returns:
            bool: 点是否在面板内
        """
        return self.rect.collidepoint(point)
    
    def get_rect(self) -> pygame.Rect:
        """
        获取面板的矩形区域
        
        Returns:
            pygame.Rect: 面板的矩形区域
        """
        return self.rect.copy()
