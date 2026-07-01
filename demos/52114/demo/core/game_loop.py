import pygame
import time
from typing import Optional, Callable, Dict, Any
from config.constants import FPS
from utils.perf import PerfMonitor
from config.settings import get_setting


class GameLoop:
    """
    游戏主循环类，负责帧率控制、模拟启停逻辑和循环调度
    """
    def __init__(self, event_handler=None, simulation=None, renderer=None):
        self.event_handler = event_handler
        self.simulation = simulation
        self.renderer = renderer
        self.clock = pygame.time.Clock()
        self.running = False
        self.paused = False
        self.simulation_speed = get_setting('general', 'simulation_speed', 1.0)
        
        self.perf = PerfMonitor()
        # 回调函数注册系统
        self.update_callbacks: Dict[str, Callable[[float], None]] = {}
        self.render_callbacks: Dict[str, Callable[[pygame.Surface], None]] = {}
        self.pre_tick_callbacks: Dict[str, Callable[[], None]] = {}
        self.post_tick_callbacks: Dict[str, Callable[[], None]] = {}
        
        # 时间相关变量
        self.current_time = 0
        self.last_time = 0
        self.delta_time = 0
    
    def start(self):
        """
        开始游戏主循环
        """
        self.running = True
        self._main_loop()
    
    def stop(self):
        """
        停止游戏主循环
        """
        self.running = False
    
    def toggle_pause(self):
        """
        切换暂停/继续状态
        """
        self.paused = not self.paused
    
    def set_speed(self, speed):
        """
        设置模拟速度
        参数：
            speed: 速度值 (0.5-3.0)
        """
        self.simulation_speed = max(0.5, min(speed, 3.0))
    
    def update_time(self) -> None:
        """
        更新时间相关变量
        """
        self.current_time = time.time()
        self.delta_time = self.current_time - self.last_time
        self.last_time = self.current_time
    
    def register_update_callback(self, name: str, callback: Callable[[float], None]) -> None:
        """
        注册更新回调函数
        
        参数：
            name: 回调名称
            callback: 回调函数，接收delta_time参数
        """
        self.update_callbacks[name] = callback
    
    def unregister_update_callback(self, name: str) -> None:
        """
        取消注册更新回调函数
        
        参数：
            name: 回调名称
        """
        if name in self.update_callbacks:
            del self.update_callbacks[name]
    
    def register_render_callback(self, name: str, callback: Callable[[pygame.Surface], None]) -> None:
        """
        注册渲染回调函数
        
        参数：
            name: 回调名称
            callback: 回调函数，接收surface参数
        """
        self.render_callbacks[name] = callback
    
    def unregister_render_callback(self, name: str) -> None:
        """
        取消注册渲染回调函数
        
        参数：
            name: 回调名称
        """
        if name in self.render_callbacks:
            del self.render_callbacks[name]
    
    def register_pre_tick_callback(self, name: str, callback: Callable[[], None]) -> None:
        """
        注册每帧开始前的回调函数
        
        参数：
            name: 回调名称
            callback: 回调函数
        """
        self.pre_tick_callbacks[name] = callback
    
    def register_post_tick_callback(self, name: str, callback: Callable[[], None]) -> None:
        """
        注册每帧结束后的回调函数
        
        参数：
            name: 回调名称
            callback: 回调函数
        """
        self.post_tick_callbacks[name] = callback
    
    def _main_loop(self):
        """
        主循环实现
        """
        self.last_time = time.time()
        
        while self.running:
            # 更新时间
            self.update_time()
            
            # 执行帧前回调
            for callback in self.pre_tick_callbacks.values():
                callback()
            
            # 处理事件
            if self.event_handler and self.event_handler.handle_events():
                continue  # 如果事件处理返回True（如退出），则继续下一轮循环
            
            # 更新模拟（如果未暂停）
            if not self.paused:
                # 根据模拟速度调整更新
                adjusted_delta = self.delta_time * self.simulation_speed
                
                # 执行自定义更新回调
                for callback in self.update_callbacks.values():
                    callback(adjusted_delta)
                
                # 如果有simulation对象，执行其更新
                if self.simulation:
                    self.simulation.update(adjusted_delta)
            
            # 渲染画面
            self._render_frame()
            
            # 执行帧后回调
            for callback in self.post_tick_callbacks.values():
                callback()
            
            # 控制帧率
            self.clock.tick(FPS)
    
    def get_fps(self) -> float:
        """
        获取当前帧率
        
        返回：
            当前帧率值
        """
        return self.clock.get_fps()
    
    def set_fps(self, fps: int) -> None:
        """
        设置目标帧率
        
        参数：
            fps: 目标帧率
        """
        self.clock.tick_busy_loop(fps)  # 先更新clock的帧率设置
        self.clock.tick(fps)  # 然后确保实际限制
    
    def _render_frame(self):
        """
        渲染一帧画面
        """
        if self.renderer:
            # 清除屏幕
            self.renderer.clear()
            
            # 执行自定义渲染回调
            for callback in self.render_callbacks.values():
                callback(self.renderer.screen)
            
            # 如果有simulation和event_handler对象，执行原有渲染逻辑
            if self.simulation:
                # 绘制网格
                self.renderer.draw_grid(
                    self.simulation.zoom,
                    self.simulation.offset
                )
                
                # 先绘制调试层（感知/链接），再绘制生物体，确保层级正确
                if self.event_handler:
                    # 传递选中对象用于描边与单独调试绘制
                    self.renderer.selected_organism = getattr(self.event_handler, 'selected_organism', None)
                    plant_set = set()
                    rock_set = set()
                    if self.simulation:
                        try:
                            plant_set = {(o.x, o.y) for o in self.simulation.organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Producer' and o.is_alive()}
                            rock_set = {(o.x, o.y) for o in self.simulation.organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Rock' and o.is_alive()}
                        except Exception:
                            plant_set = set()
                            rock_set = set()
                    self.renderer.draw_debug_layers(
                        self.simulation.organisms,
                        self.simulation.zoom,
                        self.simulation.offset,
                        selected=self.renderer.selected_organism,
                        plants=plant_set.union(rock_set)
                    )
                # 绘制生物体
                self.renderer.draw_organisms(
                    self.simulation.organisms,
                    self.simulation.zoom,
                    self.simulation.offset
                )
            
            if self.event_handler:
                # 绘制UI组件
                self.renderer.draw_ui_components(
                    self.event_handler.ui_components
                )
                
                # 绘制面板
                if self.simulation:
                    organism_counts = self.simulation.get_organism_counts()
                    
                    # 按类型分类生物体数据，传递给EigenvaluePanel
                    organisms_by_type = {
                        'producer': [o for o in self.simulation.organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Producer' and o.is_alive()],
                        'herbivore': [o for o in self.simulation.organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Herbivore' and o.is_alive()],
                        'carnivore': [o for o in self.simulation.organisms if hasattr(o, '__class__') and o.__class__.__name__ == 'Carnivore' and o.is_alive()]
                    }
                    
                    self.renderer.draw_panels(
                        self.event_handler.panels,
                        organism_counts=organism_counts,
                        organisms_by_type=organisms_by_type
                    )
            
            # 绘制状态文本
            if self.paused:
                self.renderer.draw_status_text(
                    "已暂停",
                    10, self.renderer.screen.get_height() - 30,
                    (255, 0, 0)
                )
            # 左上角性能叠加
            fps = self.get_fps()
            _, cpu = self.perf.sample()
            gpu = self.perf.gpu_usage()
            self.renderer.draw_status_text(f"FPS: {fps:.1f}", 10, 10, (0,0,0))
            self.renderer.draw_status_text(f"CPU: {cpu:.0f}%", 10, 28, (0,0,0))
            self.renderer.draw_status_text(f"GPU: {gpu:.0f}%", 10, 46, (0,0,0))
            
            # 更新显示
            self.renderer.update_display()
