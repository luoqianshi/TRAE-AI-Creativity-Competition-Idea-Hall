import pygame
from typing import Dict, List, Tuple, Any
from config import BLACK, WHITE, GRAY, LIGHT_GRAY, SCREEN_WIDTH, SCREEN_HEIGHT
from config import get_setting, set_setting, save_config, settings
from ui.fonts import get_chinese_font
from ui.components import Slider, Button
from utils.debug import toggle_debug_mode, get_debug_mode


class SettingsPanel:
    """
    参数设置面板类
    
    负责显示和调整生态系统模拟中的各种参数，包括草食动物、肉食动物和植物的各项属性设置。
    提供滑块控件让用户实时调整参数，并保存到配置文件中。
    """
    
    def __init__(self, simulation=None, x: int = None, y: int = None, width: int = 380, height: int = 520):
        """
        初始化设置面板
        
        Args:
            simulation: Simulation实例引用，用于刷新生物配置
            x: 面板x坐标，默认为右上角位置
            y: 面板y坐标，默认为右上角位置
            width: 面板宽度
            height: 面板高度
        """
        # 面板位置调整为右上角
        self.x = x if x is not None else SCREEN_WIDTH - width - 10
        self.y = y if y is not None else 10
        self.width = width
        self.height = height
        # 创建面板矩形对象
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        # 初始化字体
        self.font = get_chinese_font(12)
        # 渲染标题文本
        self.title_surface = self.font.render("参数设置", True, BLACK)
        # 存储所有控制组件的列表
        self.controls: List[Any] = []
        # 存储simulation实例引用，用于刷新配置
        self.simulation = simulation
        # 创建所有控制组件
        self._create_controls()

    def _create_controls(self) -> None:
        """
        创建所有控制组件
        
        内部方法，用于创建所有滑块控件和保存按钮。
        为每种生物类型创建相应的参数调整滑块，并设置适当的范围和默认值。
        """
        # 设置控件的初始位置和大小
        cx = self.x + 120  # 控件X坐标
        cy = self.y + 44  # 控件Y坐标
        w = self.width - 160  # 控件宽度
        h = 14  # 控件高度

        # 使用列表来存储y坐标，以便在内部函数中修改
        cy_nonlocal = [cy]
        
        def add_slider(label: str, cat: str, key: str, min_v: float, max_v: float, def_v: float, step: float, precision: int = 0):
            """
            添加一个滑块控件
            
            Args:
                label: 滑块标签文本
                cat: 配置类别
                key: 配置键
                min_v: 最小值
                max_v: 最大值
                def_v: 默认值
                step: 步进值
                precision: 小数精度
            """
            # 从配置中获取当前值
            val = float(get_setting(cat, key, def_v))
            # 创建滑块控件
            slider = Slider(
                cx, cy_nonlocal[0], w, h,  # 位置和大小
                min_v, max_v, val,  # 范围和初始值
                label=label, precision=precision, step=step,  # 显示和步进设置
                callback=lambda v: set_setting(cat, key, v)  # 值改变时的回调函数
            )
            self.controls.append(slider)
            cy_nonlocal[0] += 24  # 更新下一个控件的Y坐标

        def add_int_slider(label: str, cat: str, key: str, min_v: int, max_v: int, def_v: int):
            """
            添加一个整数滑块控件（简化的包装函数）
            
            Args:
                label: 滑块标签文本
                cat: 配置类别
                key: 配置键
                min_v: 最小值
                max_v: 最大值
                def_v: 默认值
            """
            add_slider(label, cat, key, float(min_v), float(max_v), float(get_setting(cat, key, def_v)), 1.0, 0)

        # 添加草食动物相关参数滑块
        add_int_slider("草食-移动间隔", "herbivore", "move_interval", 1, 20, 10)
        add_int_slider("草食-食物能量", "herbivore", "energy_from_food", 10, 200, 50)
        add_slider("草食-基础消耗", "herbivore", "base_energy_consumption", 0.0, 10.0, float(get_setting("herbivore", "base_energy_consumption", 0.03)), 0.1, 1)
        add_int_slider("草食-繁殖概率%", "herbivore", "reproduction_probability", 0, 100, 3)
        add_int_slider("草食-食物侦测距", "herbivore", "food_detection_distance", 1, 50, 20)
        add_int_slider("草食-危险侦测距", "herbivore", "danger_detection_distance", 1, 50, 15)

        # 添加肉食动物相关参数滑块
        add_int_slider("肉食-移动间隔", "carnivore", "move_interval", 1, 20, 8)
        add_int_slider("肉食-食物能量", "carnivore", "energy_from_food", 10, 300, 80)
        add_slider("肉食-基础消耗", "carnivore", "base_energy_consumption", 0.0, 10.0, float(get_setting("carnivore", "base_energy_consumption", 0.03)), 0.1, 1)
        add_int_slider("肉食-繁殖概率%", "carnivore", "reproduction_probability", 0, 100, 3)
        add_int_slider("肉食-跟随距离", "carnivore", "follow_distance", 1, 100, 25)
        add_int_slider("肉食-跟随概率%", "carnivore", "follow_probability", 0, 100, 80)

        # 添加植物相关参数滑块
        add_slider("植物-生长速率", "producer", "energy_increase_rate", 0.0, 5.0, float(get_setting("producer", "energy_increase_rate", 0.5)), 0.05, 2)
        add_int_slider("植物-相邻繁殖%", "producer", "adjacent_reproduction_probability", 0, 100, 70)
        add_int_slider("植物-繁殖间隔", "producer", "reproduction_interval", 1, 20, int(get_setting("producer", "reproduction_interval", 5)))

        # 添加通用参数滑块
        add_slider("通用-能量转移率", "general", "energy_transfer_rate", 0.0, 1.0, float(get_setting("general", "energy_transfer_rate", 0.7)), 0.05, 2)

        # 创建保存按钮
        save_btn_x = self.x + self.width - 110
        save_btn_y = self.y + self.height - 36
        self.save_button = Button(save_btn_x, save_btn_y, 100, 26, "保存", action=self._save_settings)
        
        # 创建Debug模式按钮
        debug_btn_x = self.x + 10
        debug_btn_y = self.y + self.height - 90
        self.debug_button = Button(debug_btn_x, debug_btn_y, 100, 26, "调试模式: 关闭", action=self._toggle_debug_mode)
        
        # 创建感知距离复选框
        vision_btn_x = self.x + 120
        vision_btn_y = self.y + self.height - 90
        self.vision_button = Button(vision_btn_x, vision_btn_y, 50, 26, "感知", action=self._toggle_vision_range)
        
        # 创建目标连线复选框
        target_btn_x = self.x + 180
        target_btn_y = self.y + self.height - 90
        self.target_button = Button(target_btn_x, target_btn_y, 50, 26, "目标", action=self._toggle_target_lines)

    def _save_settings(self) -> None:
        """
        保存设置并刷新生物配置
        
        内部方法，当用户点击保存按钮时调用。
        1. 将当前配置保存到文件中
        2. 如果有simulation实例引用，刷新所有存活生物体的配置
        """
        # 调用不带参数的save_config，它会使用全局的settings变量
        save_config()
        print("设置已保存")
        
        # 如果有simulation实例引用，刷新所有生物配置
        if self.simulation and hasattr(self.simulation, 'refresh_all_organism_configs'):
            self.simulation.refresh_all_organism_configs()
            print("所有生物配置已刷新")
    
    def _toggle_debug_mode(self) -> None:
        """
        切换调试模式并更新按钮文本
        """
        # 切换debug模式
        new_debug_state = toggle_debug_mode()
        
        # 更新按钮文本
        self.debug_button.set_text(f"调试模式: {'开启' if new_debug_state else '关闭'}")
        
        # 更新其他调试控制按钮的状态
        self.vision_button.set_enabled(new_debug_state)
        self.target_button.set_enabled(new_debug_state)
    
    def _toggle_vision_range(self) -> None:
        """
        切换感知距离显示
        """
        from utils.debug import set_debug_flag, get_debug_flag
        
        # 切换标志状态
        current_state = get_debug_flag('draw_vision_range')
        new_state = not current_state
        set_debug_flag('draw_vision_range', new_state)
        
        # 更新按钮文本
        self.vision_button.set_text(f"感知{'on' if new_state else 'off'}")
    
    def _toggle_target_lines(self) -> None:
        """
        切换目标连线显示
        """
        from utils.debug import set_debug_flag, get_debug_flag
        
        # 切换标志状态
        current_state = get_debug_flag('draw_targets')
        new_state = not current_state
        set_debug_flag('draw_targets', new_state)
        
        # 更新按钮文本
        self.target_button.set_text(f"目标{'on' if new_state else 'off'}")

    def draw(self, screen: pygame.Surface) -> None:
        """
        绘制设置面板
        
        Args:
            screen: pygame表面对象，用于绘制面板和所有控件
        """
        # 绘制面板背景，带圆角
        pygame.draw.rect(screen, WHITE, self.rect, border_radius=5)
        # 绘制面板边框，带圆角
        pygame.draw.rect(screen, BLACK, self.rect, 2, border_radius=5)
        # 绘制面板标题
        screen.blit(self.title_surface, (self.x + 10, self.y + 10))
        # 绘制所有控制组件
        for ctrl in self.controls:
            ctrl.draw(screen)
        # 绘制保存按钮和Debug按钮
        self.save_button.draw(screen)
        self.debug_button.draw(screen)
        self.vision_button.draw(screen)
        self.target_button.draw(screen)
        
        # 初始化调试控制按钮状态（如果是第一次绘制）
        if not hasattr(self, '_initialized_debug_controls'):
            self._initialized_debug_controls = True
            
            # 获取当前调试模式状态
            from utils.debug import get_debug_mode, get_debug_flag
            debug_state = get_debug_mode()
            vision_state = get_debug_flag('draw_vision_range')
            target_state = get_debug_flag('draw_targets')
            
            # 更新按钮状态和文本
            self.debug_button.set_text(f"调试模式: {'开启' if debug_state else '关闭'}")
            self.vision_button.set_enabled(debug_state)
            self.target_button.set_enabled(debug_state)
            self.vision_button.set_text(f"感知{'on' if vision_state else 'off'}")
            self.target_button.set_text(f"目标{'on' if target_state else 'off'}")

    def handle_event(self, event: pygame.event.Event) -> bool:
        """
        处理事件
        
        Args:
            event: pygame事件对象
            
        Returns:
            bool: 如果事件被处理返回True，否则返回False
        """
        # 首先检查鼠标是否在面板范围内
        if self.rect.collidepoint(pygame.mouse.get_pos()):
            # 处理所有滑块控件的事件
            for ctrl in self.controls:
                if ctrl.handle_event(event):
                    return True
            # 处理保存按钮和Debug按钮事件
        if self.save_button.handle_event(event):
            return True
        if self.debug_button.handle_event(event):
            return True
        if self.vision_button.handle_event(event):
            return True
        if self.target_button.handle_event(event):
            return True
        return False
