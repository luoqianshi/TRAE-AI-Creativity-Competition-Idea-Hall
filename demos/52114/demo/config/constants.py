# 常量定义 - 这些值在程序运行期间不可修改

# 网格和屏幕设置
GRID_SIZE = 20  # 网格大小定义
SCREEN_WIDTH = 1400
SCREEN_HEIGHT = 1000  # 窗口高度
CONTROL_PANEL_WIDTH = 400
SIMULATION_AREA_WIDTH = SCREEN_WIDTH - CONTROL_PANEL_WIDTH  # 模拟区宽度
CURVE_AREA_HEIGHT = 200  # 底部曲线区域高度
SIMULATION_AREA_HEIGHT = SCREEN_HEIGHT - CURVE_AREA_HEIGHT  # 模拟区高度

# 世界尺寸
WORLD_WIDTH = 200  # 世界宽度（网格数）
WORLD_HEIGHT = 150  # 世界高度（网格数）

# 性能相关
FPS = 30  # 帧率
SIMULATION_SPEED = 1.0  # 模拟速度

# 面板设置
INFO_PANEL_WIDTH = 380
INFO_PANEL_HEIGHT = 400
STATS_PANEL_WIDTH = 500
STATS_PANEL_HEIGHT = 150
EIGENVALUE_PANEL_WIDTH = 300
EIGENVALUE_PANEL_HEIGHT = 150

# 背景色
BACKGROUND_COLOR = (240, 240, 240)
GRID_COLOR = (220, 220, 220)

# 调试模式默认值
DEBUG = True  # 开启Debug模式，显示目标和威胁连接线
# 注意：实际使用时请通过utils.debug.get_debug_mode()获取当前调试模式状态

# 缩放相关常量
MIN_ZOOM = 0.5  # 最小缩放比例
MAX_ZOOM = 3.0  # 最大缩放比例
ZOOM_STEP = 0.1  # 缩放步进值

# 颜色定义
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)    # 植物
BLUE = (0, 0, 255)     # 草食动物
RED = (255, 0, 0)      # 肉食动物
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)
LIGHT_GRAY = (230, 230, 230)
CURVE_BG = (245, 245, 245)  # 曲线背景色
YELLOW = (255, 255, 0)  # 选中状态颜色
PANEL_BG = (255, 255, 240)  # 信息面板背景色

# matplotlib颜色定义（使用0-1范围）
MPL_GREEN = (0/255, 255/255, 0/255)    # 植物曲线颜色
MPL_BLUE = (0/255, 0/255, 255/255)     # 草食动物曲线颜色
MPL_RED = (255/255, 0/255, 0/255)      # 肉食动物曲线颜色
MPL_CURVE_BG = (245/255, 245/255, 245/255)  # 曲线背景色

# Debug颜色
DEBUG_GRID_COLOR = (200, 200, 200)  # 网格线颜色
DEBUG_TARGET_LINE_COLOR = (150, 150, 250)  # 默认目标连接线颜色
DEBUG_HERBIVORE_TARGET_COLOR = BLUE  # 草食动物目标连接线颜色
DEBUG_CARNIVORE_TARGET_COLOR = RED  # 肉食动物目标连接线颜色
