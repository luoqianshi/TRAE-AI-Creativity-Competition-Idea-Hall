import pygame
from typing import Tuple
from config import MIN_ZOOM, MAX_ZOOM, SCREEN_WIDTH, SCREEN_HEIGHT
from utils import unscale_point


class EventHandler:
    def __init__(self, simulation, game_loop):
        self.simulation = simulation
        self.game_loop = game_loop
        self.ui_components = []
        self.panels = []
        self.dragging = False
        self.last_mouse_pos = (0, 0)
        self.selected_organism = None
        # 初始化所有回调字典
        self.mouse_click_callbacks = {}
        self.mouse_move_callbacks = {}
        self.zoom_callbacks = {}
        self.keyboard_callbacks = {}
    
    def add_ui_component(self, component):
        """
        添加UI组件
        """
        self.ui_components.append(component)
    
    def add_panel(self, panel):
        """
        添加面板
        """
        self.panels.append(panel)
        # 如果是信息面板，设置引用
        if hasattr(panel, 'set_selected_organism'):
            self.info_panel = panel
    
    def handle_events(self):
        """
        处理所有事件
        返回：
            bool: 如果需要退出循环，返回True
        """
        for event in pygame.event.get():
            if self._handle_quit_event(event):
                return True
            
            if self._handle_ui_events(event):
                continue  # 如果UI组件处理了事件，跳过其他处理
            
            self._handle_mouse_events(event)
            self._handle_keyboard_events(event)
        
        return False
    
    def _handle_quit_event(self, event):
        """
        处理退出事件
        """
        if event.type == pygame.QUIT:
            self.game_loop.stop()
            pygame.quit()
            return True
        return False
    
    def _handle_ui_events(self, event: pygame.event.Event) -> bool:
        """
        处理UI组件事件
        
        返回：
            bool: 如果UI组件处理了事件，返回True
        """
        # 优先处理面板事件
        for panel in reversed(self.panels):
            if hasattr(panel, 'handle_event'):
                if panel.handle_event(event):
                    return True
        
        # 然后处理UI组件事件
        for component in reversed(self.ui_components):
            if hasattr(component, 'handle_event') and component.handle_event(event):
                return True
        
        return False
    
    def _handle_mouse_events(self, event: pygame.event.Event) -> None:
        """
        处理鼠标事件
        """
        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # 左键点击
                self._handle_left_click(event.pos)
                # 鼠标左键点击处理完成
            elif event.button == 3:  # 右键
                self.dragging = True
                self.last_mouse_pos = event.pos
            elif event.button == 4:  # 滚轮上滚（放大）
                self._handle_zoom(1.1)
            elif event.button == 5:  # 滚轮下滚（缩小）
                self._handle_zoom(0.9)
        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 3:  # 右键释放
                self.dragging = False
        elif event.type == pygame.MOUSEMOTION:
            self._handle_mouse_move(event.pos)
    
    def _handle_left_click(self, pos: Tuple[int, int]) -> None:
        """
        处理鼠标左键点击
        """
        # 检查是否点击了生物体
        if self.simulation:
            world_x, world_y = unscale_point(pos, self.simulation.zoom, self.simulation.offset)
            organism = self.simulation.find_organism_at_position(world_x, world_y)
            if organism:
                self.select_organism(organism)
                return
            # 点击空白处取消选择
            self.select_organism(None)
    
    def _handle_zoom(self, factor: float) -> None:
        """
        处理缩放
        """
        if self.simulation:
            new_zoom = self.simulation.zoom * factor
            new_zoom = max(MIN_ZOOM, min(MAX_ZOOM, new_zoom))
            self.simulation.zoom = new_zoom
            
            # 缩放处理完成
    
    def _handle_mouse_move(self, pos):
        """
        处理鼠标移动
        """
        if self.dragging:
            # 计算拖动偏移
            dx = pos[0] - self.last_mouse_pos[0]
            dy = pos[1] - self.last_mouse_pos[1]
            
            # 更新世界偏移
            self.simulation.offset = (
                self.simulation.offset[0] + dx,
                self.simulation.offset[1] + dy
            )
            
            # 更新鼠标位置
            self.last_mouse_pos = pos
    
    def select_organism(self, organism):
        """
        选择生物体并更新相关UI
        参数：
            organism: 要选择的生物体，如果为None则取消选择
        """
        self.selected_organism = organism
        # 更新信息面板
        if hasattr(self, 'info_panel'):
            self.info_panel.set_selected_organism(organism)
    
    def _handle_keyboard_events(self, event: pygame.event.Event) -> None:
        """
        处理键盘事件
        """
        if event.type == pygame.KEYDOWN:
            # 执行自定义键盘回调
            for callback in self.keyboard_callbacks.values():
                callback(event)
            
            if event.key == pygame.K_SPACE:
                # 空格键切换暂停/继续
                self.game_loop.toggle_pause()
            elif event.key == pygame.K_r:
                # R键重置模拟
                self.simulation.reset()
                if hasattr(self, 'info_panel'):
                    self.info_panel.set_selected_organism(None)
                self.selected_organism = None
            elif event.key == pygame.K_ESCAPE:
                # ESC键取消选择
                self.select_organism(None)
            elif event.key == pygame.K_PLUS or event.key == pygame.K_KP_PLUS:
                # +键增加模拟速度
                if self.game_loop and hasattr(self.game_loop, 'set_speed'):
                    self.game_loop.set_speed(self.game_loop.simulation_speed + 0.5)
            elif event.key == pygame.K_MINUS or event.key == pygame.K_KP_MINUS:
                # -键减少模拟速度
                if self.game_loop and hasattr(self.game_loop, 'set_speed'):
                    self.game_loop.set_speed(self.game_loop.simulation_speed - 0.5)