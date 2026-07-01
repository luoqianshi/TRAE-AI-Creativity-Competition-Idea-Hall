import pygame
import sys
import os
import logging

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 导入各个模块
from config.constants import SCREEN_WIDTH, SCREEN_HEIGHT
from config.settings import load_config
from core import GameLoop, EventHandler, Simulation
from ui import Renderer, initialize_ui, create_ui_manager
from ui.components import Button
from ui.panels import InfoPanel, StatsPanel, SettingsPanel, EigenvaluePanel
from utils.data import init_curve


def main():
    """
    主程序入口
    初始化所有模块并启动核心循环
    """
    try:
        # 初始化配置
        logger.info("初始化配置...")
        config = load_config()
        logger.info("配置初始化完成")
    except Exception as e:
        logger.error(f"配置初始化失败: {e}")
        print(f"错误: 无法初始化配置 - {e}")
        return
    
    try:
        # 初始化Pygame
        logger.info("初始化Pygame...")
        pygame.init()
        logger.info("Pygame初始化完成")
        
        # 设置字体支持中文
        pygame.font.init()
        pygame.display.set_caption("生态系统模拟")
    except Exception as e:
        logger.error(f"Pygame初始化失败: {e}")
        print(f"错误: 无法初始化Pygame - {e}")
        return
    
    try:
        # 创建屏幕
        logger.info(f"创建屏幕: {SCREEN_WIDTH}x{SCREEN_HEIGHT}")
        screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    except Exception as e:
        logger.error(f"屏幕创建失败: {e}")
        print(f"错误: 无法创建游戏窗口 - {e}")
        pygame.quit()
        return
    
    try:
        # 初始化UI模块
        logger.info("初始化UI模块...")
        initialize_ui()
        logger.info("UI模块初始化完成")
    except Exception as e:
        logger.error(f"UI初始化失败: {e}")
        print(f"错误: 无法初始化UI模块 - {e}")
        pygame.quit()
        return
    
    try:
        # 初始化曲线数据
        logger.info("初始化数据结构...")
        init_curve()
    except Exception as e:
        logger.warning(f"数据初始化警告: {e}")
    
    try:
        # 创建核心组件
        logger.info("创建核心组件...")
        simulation = Simulation()
        renderer = Renderer(screen)  # 使用新的Renderer初始化方式
        
        # 创建游戏循环（暂时不传入event_handler）
        logger.info("创建游戏循环...")
        game_loop = GameLoop(None, simulation, renderer)
        
        # 创建事件处理器（需要simulation和game_loop）
        logger.info("创建事件处理器...")
        event_handler = EventHandler(simulation, game_loop)
        
        # 更新游戏循环的事件处理器引用
        game_loop.event_handler = event_handler

        # 创建UI面板
        logger.info("创建UI组件...")
        info_panel = InfoPanel()
        stats_panel = StatsPanel()
        settings_panel = SettingsPanel(simulation)
        eigenvalue_panel = EigenvaluePanel()
        
        # 注册统计回调
        simulation.register_stats_callback(stats_panel.update_stats)
        
        # 创建控制按钮
        def toggle_pause():
            game_loop.toggle_pause()
        
        def reset_simulation():
            simulation.reset()
            info_panel.set_selected_organism(None)
            stats_panel.reset()
        
        pause_button = Button(
            SCREEN_WIDTH // 2 - 60, SCREEN_HEIGHT - 40,
            120, 30, "暂停/继续", toggle_pause
        )
        
        reset_button = Button(
            SCREEN_WIDTH // 2 - 200, SCREEN_HEIGHT - 40,
            80, 30, "重置", reset_simulation
        )
        
        # 添加UI组件到事件处理器
        event_handler.add_panel(info_panel)
        event_handler.add_panel(stats_panel)
        event_handler.add_panel(settings_panel)
        event_handler.add_panel(eigenvalue_panel)
        event_handler.add_ui_component(pause_button)
        event_handler.add_ui_component(reset_button)
        
        # 将UI组件存储在适当的列表中，用于渲染
        ui_components = [pause_button, reset_button]
        panels = [info_panel, stats_panel, settings_panel, eigenvalue_panel]
    
        # 显示帮助信息
        print("\n=== 生态系统模拟 ===")
        print("控制说明：")
        print("- 空格键：暂停/继续模拟")
        print("- R键：重置模拟")
        print("- 鼠标左键：选择生物体查看详细信息")
        print("- 鼠标右键：拖动视图")
        print("- 鼠标滚轮：缩放视图")
        print("- +/-键：调整模拟速度")
        print("- ESC键：退出程序")
        print("\n程序正在运行...\n")
        logger.info("游戏循环启动中...")
        
        # 启动游戏循环
        game_loop.start()
        
    except KeyboardInterrupt:
        logger.info("程序被用户中断")
        print("\n程序被用户中断")
    except Exception as e:
        logger.error(f"运行时错误: {e}", exc_info=True)
        print(f"\n错误: 程序运行时发生异常 - {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 清理资源
        logger.info("清理资源...")
        try:
            pygame.quit()
        except:
            pass
        logger.info("程序已退出")
        print("程序已退出")


if __name__ == "__main__":
    main()
