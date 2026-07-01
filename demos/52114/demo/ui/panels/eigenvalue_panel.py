import pygame
from typing import Dict, List, Tuple, Any
from config import WHITE, BLACK, GRAY, LIGHT_GRAY, EIGENVALUE_PANEL_WIDTH, EIGENVALUE_PANEL_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT, STATS_PANEL_WIDTH, STATS_PANEL_HEIGHT
from ui.fonts import get_chinese_font


class EigenvaluePanel:
    """
    特征值面板类
    参考stats_panel的设计风格
    """
    
    def __init__(self):
        """
        初始化特征值面板
        位置在stats_panel的右边，使用一致的颜色和字体风格
        """
        # 面板基础设置 - 参考stats_panel的位置和大小，放在其右边
        self.width = EIGENVALUE_PANEL_WIDTH  # 使用配置文件中的宽度
        self.height = STATS_PANEL_HEIGHT  # 使用与stats_panel相同的高度
        self.x = 10 + STATS_PANEL_WIDTH + 10  # stats_panel的x + 宽度 + 10像素间隔
        self.y = SCREEN_HEIGHT - STATS_PANEL_HEIGHT - 40  # 与stats_panel相同的y坐标
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
        # 设置字体 - 使用与stats_panel相同的字体获取方式
        self.font = get_chinese_font(12)  # 与stats_panel一致的字体
        self.button_font = get_chinese_font(10)  # 稍小的按钮字体
        
        # 图表区域设置
        self.chart_x = self.x + 20  # 图表起始x坐标
        self.chart_y = self.y + 10  # 图表起始y坐标
        self.chart_width = self.width - 40  # 图表宽度
        self.chart_height = 80  # 图表高度
        
        # 生物类型设置
        self.current_organism_type = "herbivore"  # 默认类型
        self.organism_types = ["herbivore", "carnivore", "producer"]
        self.type_names = {"herbivore": "草食动物", "carnivore": "肉食动物", "producer": "植物"}
        
        # 按钮设置 - 调整为更适合面板的尺寸
        self.button_width = 80
        self.button_height = 25
        self.button_spacing = 5
        
        # 生物体数据
        self.organisms = None
        
        # 简单的按钮矩形存储
        self.button_rects = {}
        
        # 绘制按钮矩形区域
        self._create_button_rects()
        
        # 调试输出
        print(f"参考stats_panel设计的EigenvaluePanel初始化: 位置=({self.x},{self.y}), 尺寸={self.width}x{self.height}")
    
    def _create_button_rects(self):
        """
        创建按钮矩形区域，居中显示
        """
        total_width = len(self.organism_types) * self.button_width + (len(self.organism_types) - 1) * self.button_spacing
        start_x = self.x + (self.width - total_width) // 2
        button_y = self.y + self.height - self.button_height - 10
        
        for i, organism_type in enumerate(self.organism_types):
            button_x = start_x + i * (self.button_width + self.button_spacing)
            self.button_rects[organism_type] = pygame.Rect(button_x, button_y, self.button_width, self.button_height)
    
    def update(self, organisms: Dict[str, List] = None) -> None:
        """
        更新面板数据
        """
        self.organisms = organisms
    
    def draw(self, screen: pygame.Surface) -> None:
        """
        绘制面板 - 只保留按钮和曲线绘制功能
        """
        # 绘制面板背景和边框
        pygame.draw.rect(screen, WHITE, self.rect, border_radius=5)
        pygame.draw.rect(screen, BLACK, self.rect, 2, border_radius=5)
        
        # 绘制按钮
        self._draw_buttons(screen)
        
        # 仅在切换到草食动物时绘制曲线
        if self.current_organism_type == "herbivore" and self.organisms and "herbivore" in self.organisms:
            self._draw_eigenvalue_distribution(screen)
    
    def _draw_buttons(self, screen: pygame.Surface) -> None:
        """
        绘制按钮 - 使用更简洁的风格
        """
        for organism_type in self.organism_types:
            button_rect = self.button_rects[organism_type]
            
            # 参考stats_panel的颜色风格
            if organism_type == self.current_organism_type:
                # 选中状态 - 使用LIGHT_GRAY作为背景
                bg_color = LIGHT_GRAY
                text_color = BLACK
                border_width = 2
            else:
                # 未选中状态 - 使用白色背景
                bg_color = WHITE
                text_color = BLACK
                border_width = 1
            
            # 绘制按钮背景和边框 - 保持简洁风格
            pygame.draw.rect(screen, bg_color, button_rect, border_radius=3)
            pygame.draw.rect(screen, BLACK, button_rect, border_width, border_radius=3)
            
            # 绘制按钮文本
            text_surface = self.button_font.render(self.type_names[organism_type], True, text_color)
            text_x = button_rect.centerx - text_surface.get_width() // 2
            text_y = button_rect.centery - text_surface.get_height() // 2
            screen.blit(text_surface, (text_x, text_y))
    
    def handle_event(self, event: pygame.event.Event) -> bool:
        """
        处理事件
        """
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            pos = event.pos
            for organism_type, rect in self.button_rects.items():
                if rect.collidepoint(pos):
                    self.current_organism_type = organism_type
                    print(f"切换到: {self.type_names[organism_type]}")
                    return True
        return False
    
    def is_point_inside(self, point: Tuple[int, int]) -> bool:
        """
        检查点是否在面板内
        """
        return self.rect.collidepoint(point)
    
    def _draw_eigenvalue_distribution(self, screen: pygame.Surface) -> None:
        """
        绘制草食动物的eigenvalue_vision值分布曲线
        横轴范围：-1到1，纵轴为对应值的存活个体数量
        """
        try:
            # 1. 绘制图表区域边框
            chart_rect = pygame.Rect(self.chart_x, self.chart_y, self.chart_width, self.chart_height)
            pygame.draw.rect(screen, LIGHT_GRAY, chart_rect, border_radius=2)
            
            # 2. 提取所有草食动物的eigenvalue_vision值
            herbivores = self.organisms.get("herbivore", [])
            eigenvalues = []
            
            for herbivore in herbivores:
                try:
                    # 尝试获取eigenvalue_vision属性
                    if hasattr(herbivore, 'eigenvalue_vision'):
                        eigenvalue = herbivore.eigenvalue_vision
                        # 确保值在-1到1范围内
                        if -1.0 <= eigenvalue <= 1.0:
                            eigenvalues.append(eigenvalue)
                except Exception:
                    pass
            
            # 如果有有效数据，绘制分布曲线
            if eigenvalues:
                # 3. 绘制坐标轴
                self._draw_axes(screen)
                
                # 4. 计算分布直方图数据
                bins = 10  # 分成10个区间
                bin_width = 2.0 / bins  # 区间宽度
                bin_counts = [0] * bins  # 每个区间的计数
                
                # 统计每个区间的个体数量
                for value in eigenvalues:
                    # 将-1到1映射到0到bins-1的索引
                    bin_index = int((value + 1.0) / bin_width)
                    # 确保索引在有效范围内
                    bin_index = max(0, min(bins - 1, bin_index))
                    bin_counts[bin_index] += 1
                
                # 5. 绘制分布直方图
                max_count = max(bin_counts) if bin_counts else 1
                bar_width = (self.chart_width - 20) / bins  # 每个柱子的宽度
                
                for i, count in enumerate(bin_counts):
                    # 计算柱子的高度（归一化到图表高度）
                    bar_height = 0
                    if max_count > 0:
                        bar_height = (count / max_count) * (self.chart_height - 30)
                    
                    # 计算柱子的位置
                    bar_x = self.chart_x + 10 + i * bar_width
                    bar_y = self.chart_y + self.chart_height - 20 - bar_height
                    
                    # 绘制柱子
                    pygame.draw.rect(screen, (100, 150, 255), 
                                    (bar_x, bar_y, bar_width - 2, bar_height))
                    pygame.draw.rect(screen, BLACK, 
                                    (bar_x, bar_y, bar_width - 2, bar_height), 1)
                    
                    # 在柱子上方绘制数量
                    if count > 0:
                        count_text = self.font.render(str(count), True, BLACK)
                        screen.blit(count_text, (bar_x + bar_width/2 - count_text.get_width()/2, bar_y - 15))
        except Exception as e:
            # 防止绘制错误导致程序崩溃
            print(f"绘制特征值分布时出错: {e}")
    
    def _draw_axes(self, screen: pygame.Surface) -> None:
        """
        绘制坐标轴和标签
        """
        # 1. 绘制X轴和Y轴
        # X轴
        pygame.draw.line(screen, BLACK, 
                        (self.chart_x + 10, self.chart_y + self.chart_height - 20),
                        (self.chart_x + self.chart_width - 10, self.chart_y + self.chart_height - 20),
                        2)
        # Y轴
        pygame.draw.line(screen, BLACK, 
                        (self.chart_x + 10, self.chart_y + 10),
                        (self.chart_x + 10, self.chart_y + self.chart_height - 20),
                        2)
        
        # 2. 绘制X轴标签
        x_labels = [-1.0, -0.5, 0.0, 0.5, 1.0]
        for label in x_labels:
            # 将-1到1映射到图表的X坐标
            x_pos = self.chart_x + 10 + (label + 1.0) / 2.0 * (self.chart_width - 20)
            y_pos = self.chart_y + self.chart_height - 5
            
            # 绘制刻度线
            pygame.draw.line(screen, BLACK, (x_pos, y_pos), (x_pos, y_pos + 5), 1)
            
            # 绘制标签文本
            label_text = self.font.render(str(label), True, BLACK)
            screen.blit(label_text, (x_pos - label_text.get_width()/2, y_pos + 7))
        
        # 3. 绘制Y轴标签（数量）
        y_label_text = self.font.render("数量", True, BLACK)
        screen.blit(y_label_text, (self.chart_x + 12, self.chart_y + 15))
        
        # 4. 绘制X轴说明文本
        x_desc_text = self.font.render("eigenvalue_vision值", True, BLACK)
        screen.blit(x_desc_text, (self.chart_x + self.chart_width/2 - x_desc_text.get_width()/2, 
                                 self.chart_y + self.chart_height + 5))
    
    def get_rect(self) -> pygame.Rect:
        """
        获取面板的矩形区域
        """
        return self.rect.copy()