import pygame
from typing import List, Dict, Any, Tuple, Optional, Union
from config import BACKGROUND_COLOR, GRID_COLOR, GRID_SIZE, YELLOW
from utils import scale_point, draw_debug_info
from utils.debug import get_debug_mode
from ui.fonts import get_chinese_font
from ui.panels import StatsPanel, EigenvaluePanel


class Renderer:
    def __init__(self, screen: pygame.Surface):
        self.screen = screen
        self.font = get_chinese_font(12)
        
        # 缓存渲染的文本表面
        self._text_cache: Dict[str, Dict[Tuple[int, int, int], pygame.Surface]] = {}
        
        # 渲染统计
        self._frame_count: int = 0
        self._last_draw_time: Optional[float] = None
        # 视野绘制缓存（仅用于选中肉食动物的方块可视化）
        self._vision_cache: Dict[str, Any] = {
            'organism_id': None,
            'center': None,
            'radius': None,
            'plant_sig': None,
            'visible_cells': None
        }
    
    def clear(self) -> None:
        """
        清除屏幕
        """
        self.screen.fill(BACKGROUND_COLOR)
    
    def draw_grid(self, zoom: float, offset: Tuple[float, float]) -> None:
        """
        绘制网格和沙盒边界边框
        参数：
            zoom: 缩放比例
            offset: 偏移量 (x, y)
        """
        from config import SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT
        
        screen_width, screen_height = self.screen.get_size()
        
        # 计算网格线的实际像素间距 - 确保精确的浮点数计算
        grid_spacing = GRID_SIZE * zoom
        
        # 计算起始位置，确保网格线与世界坐标精确对齐
        # 先计算世界坐标原点在屏幕上的位置
        origin_x = -offset[0] * zoom
        origin_y = -offset[1] * zoom
        
        # 基于原点位置计算起始网格线位置，确保网格精确对齐
        start_x = origin_x % grid_spacing
        start_y = origin_y % grid_spacing
        
        # 绘制垂直线 - 使用浮点数计算提高精度
        x = start_x
        while x < screen_width:
            pygame.draw.line(self.screen, GRID_COLOR, (x, 0), (x, screen_height))
            x += grid_spacing
        
        # 绘制水平线 - 使用浮点数计算提高精度
        y = start_y
        while y < screen_height:
            pygame.draw.line(self.screen, GRID_COLOR, (0, y), (screen_width, y))
            y += grid_spacing
        
        # 绘制沙盒边界边框
        # 计算沙盒边界在屏幕上的位置
        sandbox_left = offset[0] * zoom
        sandbox_top = offset[1] * zoom
        sandbox_right = (offset[0] + SIMULATION_AREA_WIDTH) * zoom
        sandbox_bottom = (offset[1] + SIMULATION_AREA_HEIGHT) * zoom
        
        # 确保边框只在可见区域内绘制
        if sandbox_right > 0 and sandbox_bottom > 0 and sandbox_left < screen_width and sandbox_top < screen_height:
            # 绘制边框 - 使用更粗的线条和不同颜色
            pygame.draw.rect(self.screen, (100, 100, 100), 
                            (sandbox_left, sandbox_top, 
                             sandbox_right - sandbox_left, 
                             sandbox_bottom - sandbox_top), 
                            2)  # 线宽为2像素
    
    def draw_organisms(self, organisms: List[Any], zoom: float, offset: Tuple[float, float]) -> None:
        """
        绘制所有生物体
        参数：
            organisms: 生物体列表
            zoom: 缩放比例
            offset: 偏移量 (x, y)
        """
        # 调试信息
        if get_debug_mode():
            alive_organisms = [o for o in organisms if o.is_alive()]
            print(f"[渲染调试] 准备绘制: 生物体总数={len(organisms)}, 存活生物体={len(alive_organisms)}")
            
        waters = [o for o in organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Water']
        rocks = [o for o in organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Rock']
        carnivores = [o for o in organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Carnivore']
        herbivores = [o for o in organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Herbivore']
        producers = [o for o in organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Producer']
        ordered = waters + rocks + producers + herbivores + carnivores
        for organism in ordered:
            try:
                if organism.is_alive():
                    ox, oy = (organism.get_draw_position() if hasattr(organism, 'get_draw_position') else (organism.x, organism.y))
                    cx_world = (ox + GRID_SIZE / 2, oy + GRID_SIZE / 2)
                    screen_x, screen_y = scale_point(cx_world, zoom, offset)
                    selected = getattr(self, 'selected_organism', None) is organism
                    organism.draw(self.screen, screen_x, screen_y, zoom, selected=selected)
            except Exception as e:
                if get_debug_mode():
                    print(f"渲染生物体时出错: {e}")

    def draw_selection_outline(self, organism: Any, zoom: float, offset: Tuple[float, float]) -> None:
        return
    
    def draw_perception_ranges(self, organism: Any, zoom: float, offset: Tuple[float, float], plants: set = None) -> None:
        """
        绘制生物体的感知范围（使用细线条）
        参数：
            organism: 生物体对象
            zoom: 缩放比例
            offset: 偏移量 (x, y)
        """
        from utils.debug import _debug_flags, get_debug_mode
        
        # 只有当draw_vision_range标志为True时才绘制感知范围
        if _debug_flags.get('draw_vision_range', True):
            if not organism or not organism.is_alive():
                return
            
            # 获取生物体中心的世界坐标和屏幕坐标（使用插值后的绘制位置）
            ox, oy = (organism.get_draw_position() if hasattr(organism, 'get_draw_position') else (organism.x, organism.y))
            cx_world = (ox + GRID_SIZE / 2, oy + GRID_SIZE / 2)
            sx, sy = scale_point(cx_world, zoom, offset)
            
            # 绘制食物感知范围（绿色线条）
            if hasattr(organism, 'get_detection_radius'):
                detection_radius = organism.get_detection_radius()
                screen_radius = int(detection_radius * GRID_SIZE * zoom)
                # 使用细线条绿色
                pygame.draw.circle(self.screen, (0, 200, 0), (int(sx), int(sy)), screen_radius, 1)
                
                if get_debug_mode() and hasattr(organism, '__class__') and organism.__class__.__name__ == 'Carnivore':
                    from config import SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT
                    world_w_cells = SIMULATION_AREA_WIDTH // GRID_SIZE
                    world_h_cells = SIMULATION_AREA_HEIGHT // GRID_SIZE
                    cx = (organism.x // GRID_SIZE)
                    cy = (organism.y // GRID_SIZE)
                    # 计算植物签名（数量与坐标和），降低重复计算成本
                    plant_sig = None
                    plant_cells = set()
                    if plants:
                        sumx = 0
                        sumy = 0
                        for (px, py) in plants:
                            gx = (px // GRID_SIZE) % world_w_cells
                            gy = (py // GRID_SIZE) % world_h_cells
                            plant_cells.add((gx, gy))
                            sumx += gx
                            sumy += gy
                        plant_sig = (len(plant_cells), sumx % 1000003, sumy % 1000003)
                    cache_key_matches = (
                        self._vision_cache['organism_id'] == id(organism) and
                        self._vision_cache['center'] == (cx, cy) and
                        self._vision_cache['radius'] == detection_radius and
                        self._vision_cache['plant_sig'] == plant_sig
                    )
                    if not cache_key_matches:
                        visible_cells = []
                        # Bresenham 线算法检查遮挡（在环绕坐标系中使用最短位移）
                        def visible(gx, gy):
                            if not plant_cells:
                                return True
                            dx = gx - cx
                            dy = gy - cy
                            # 最短环绕位移
                            if abs(dx) > world_w_cells // 2:
                                dx = dx - world_w_cells if dx > 0 else dx + world_w_cells
                            if abs(dy) > world_h_cells // 2:
                                dy = dy - world_h_cells if dy > 0 else dy + world_h_cells
                            x = 0
                            y = 0
                            sx_step = 1 if dx >= 0 else -1
                            sy_step = 1 if dy >= 0 else -1
                            dx_abs = abs(dx)
                            dy_abs = abs(dy)
                            err = dx_abs - dy_abs
                            curx = cx
                            cury = cy
                            while True:
                                # 前进一个格后，检查是否是植物（跳过起点）
                                if (curx, cury) != (cx, cy) and (curx % world_w_cells, cury % world_h_cells) in plant_cells:
                                    return False
                                if (curx % world_w_cells, cury % world_h_cells) == (gx % world_w_cells, gy % world_h_cells):
                                    break
                                e2 = 2 * err
                                if e2 > -dy_abs:
                                    err -= dy_abs
                                    curx = (curx + sx_step) % world_w_cells
                                if e2 < dx_abs:
                                    err += dx_abs
                                    cury = (cury + sy_step) % world_h_cells
                            return True
                        for ddx in range(-detection_radius, detection_radius + 1):
                            for ddy in range(-detection_radius, detection_radius + 1):
                                if ddx*ddx + ddy*ddy <= detection_radius*detection_radius:
                                    gx = (cx + ddx) % world_w_cells
                                    gy = (cy + ddy) % world_h_cells
                                    if visible(gx, gy):
                                        visible_cells.append((gx, gy))
                        self._vision_cache = {
                            'organism_id': id(organism),
                            'center': (cx, cy),
                            'radius': detection_radius,
                            'plant_sig': plant_sig,
                            'visible_cells': visible_cells
                        }
                    # 使用缓存绘制可见方块
                    if self._vision_cache.get('visible_cells'):
                        for (gx, gy) in self._vision_cache['visible_cells']:
                            block_x = gx * GRID_SIZE
                            block_y = gy * GRID_SIZE
                            screen_x, screen_y = scale_point((block_x, block_y), zoom, offset)
                            pygame.draw.rect(self.screen, (224, 211, 209), 
                                            (screen_x, screen_y, GRID_SIZE * zoom, GRID_SIZE * zoom), 1)
            
            # 绘制危险感知范围（红色线条）
            if hasattr(organism, 'get_danger_detection_radius'):
                danger_radius = organism.get_danger_detection_radius()
                screen_radius = int(danger_radius * GRID_SIZE * zoom)
                # 使用细线条红色
                pygame.draw.circle(self.screen, (255, 165, 0), (int(sx), int(sy)), screen_radius, 1)

    def draw_debug_layers(self, organisms: List[Any], zoom: float, offset: Tuple[float, float], selected: Any = None, plants: set = None) -> None:
        from utils.debug import get_debug_mode, get_debug_flag
        if not get_debug_mode():
            return
        show_targets = get_debug_flag('draw_targets')
        show_vision = get_debug_flag('draw_vision_range')
        show_dangers = get_debug_flag('draw_dangers')
        # 当未开启目标/感知，但有选中对象时，仅显示选中对象的调试
        for organism in organisms:
            try:
                if not organism.is_alive():
                    continue
                only_selected = (selected is not None) and not (show_targets or show_vision or show_dangers)
                if only_selected and organism is not selected:
                    continue
                draw_debug_info(self.screen, organism, self.font, zoom, offset)
                if show_vision or only_selected:
                    self.draw_perception_ranges(organism if only_selected else selected or organism, zoom, offset, plants=plants)
            except Exception:
                pass
    
    def draw_ui_components(self, components: List[Any]) -> None:
        """
        绘制所有UI组件
        参数：
            components: UI组件列表
        """
        for component in components:
            try:
                component.draw(self.screen)
            except Exception as e:
                if get_debug_mode():
                    print(f"渲染UI组件时出错: {e}")
    
    def draw_panels(self, panels: List[Any], **panel_data: Any) -> None:
        """
        绘制所有面板
        参数：
            panels: 面板列表
            **panel_data: 传递给面板的额外数据
        """
        # 先更新所有面板数据
        for panel in panels:
            try:
                if hasattr(panel, 'update'):
                    # 如果是EigenvaluePanel且有organisms_by_type数据，则传递完整生物体数据
                    if isinstance(panel, EigenvaluePanel) and 'organisms_by_type' in panel_data:
                        panel.update(panel_data['organisms_by_type'])
            except Exception as e:
                if get_debug_mode():
                    print(f"更新面板数据时出错: {e}")
        
        # 按Z轴顺序绘制面板（如果有z_index属性）
        sorted_panels = sorted(panels, key=lambda p: getattr(p, 'z_index', 0))
        
        for panel in sorted_panels:
            try:
                if hasattr(panel, 'draw'):
                    # 根据面板类型传递相应的数据
                    if isinstance(panel, StatsPanel) and 'organism_counts' in panel_data:
                        panel.draw(self.screen, panel_data['organism_counts'])
                    else:
                        panel.draw(self.screen)
            except Exception as e:
                if get_debug_mode():
                    print(f"渲染面板时出错: {e}")
    
    def draw_status_text(self, text: str, x: int, y: int, color: Tuple[int, int, int] = (0, 0, 0)) -> pygame.Rect:
        """
        绘制状态文本
        参数：
            text: 要显示的文本
            x, y: 文本位置
            color: 文本颜色
        
        返回：
            文本的矩形区域
        """
        return self._draw_text(text, (x, y), color)
    
    def _draw_text(self, text: str, position: Tuple[int, int], color: Tuple[int, int, int] = (0, 0, 0)) -> pygame.Rect:
        """
        内部方法：绘制文本，使用缓存提高性能
        """
        # 检查缓存
        if text not in self._text_cache:
            self._text_cache[text] = {}
        
        if color not in self._text_cache[text]:
            # 创建新的文本表面
            text_surface = self.font.render(text, True, color)
            self._text_cache[text][color] = text_surface
        
        # 获取缓存的表面
        text_surface = self._text_cache[text][color]
        
        # 绘制文本
        rect = self.screen.blit(text_surface, position)
        
        # 更新帧计数
        self._frame_count += 1
        
        return rect
    
    def update_display(self) -> None:
        """
        更新显示
        """
        pygame.display.flip()
        
        # 记录帧时间
        current_time = pygame.time.get_ticks() / 1000.0  # 转换为秒
        if self._last_draw_time is not None:
            frame_time = current_time - self._last_draw_time
            # 可以在这里计算FPS等性能指标
        self._last_draw_time = current_time
    
    def clear_text_cache(self) -> None:
        """
        清除文本缓存，在需要时调用以释放内存
        """
        self._text_cache.clear()
    
    def get_render_stats(self) -> Dict[str, Any]:
        """
        获取渲染统计信息
        
        返回：
            渲染统计信息字典
        """
        return {
            "frame_count": self._frame_count,
            "text_cache_size": sum(len(text_dict) for text_dict in self._text_cache.values())
        }
