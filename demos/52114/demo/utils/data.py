import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from config.constants import BLACK, WHITE, GREEN, BLUE, RED

# 确保matplotlib不使用交互式后端
plt.switch_backend('Agg')


class CurveData:
    """
    曲线数据管理类，用于存储和管理生态系统统计数据
    """
    def __init__(self, max_points: int = 100):
        self.max_points: int = max_points
        self.timestamps: List[float] = []  # 时间戳列表
        self.producer_counts: List[int] = []  # 植物数量列表
        self.herbivore_counts: List[int] = []  # 草食动物数量列表
        self.carnivore_counts: List[int] = []  # 肉食动物数量列表
        self.current_time: float = 0.0  # 当前时间
        self.last_update_time: float = 0.0  # 上次更新时间
    
    def add_point(self, producer_count: int, herbivore_count: int, carnivore_count: int, 
                  time_delta: Optional[float] = None) -> None:
        """
        添加一个数据点
        
        参数：
            producer_count: 植物数量
            herbivore_count: 草食动物数量
            carnivore_count: 肉食动物数量
            time_delta: 时间增量，如果为None则递增1
        """
        # 更新时间
        if time_delta is not None:
            self.current_time += time_delta
        else:
            self.current_time += 1.0
            
        # 添加数据点
        self.timestamps.append(self.current_time)
        self.producer_counts.append(producer_count)
        self.herbivore_counts.append(herbivore_count)
        self.carnivore_counts.append(carnivore_count)
        
        # 保持数据点数量在最大值以内
        while len(self.timestamps) > self.max_points:
            self.timestamps.pop(0)
            self.producer_counts.pop(0)
            self.herbivore_counts.pop(0)
            self.carnivore_counts.pop(0)
    
    def add_batch_data(self, data: Dict[str, List[Any]], timestamps: List[float]) -> None:
        """
        批量添加数据
        
        参数：
            data: 包含各类生物体数量的字典
            timestamps: 对应的时间戳列表
        """
        if len(timestamps) == 0:
            return
            
        self.timestamps.extend(timestamps)
        self.producer_counts.extend(data.get('producer_counts', []))
        self.herbivore_counts.extend(data.get('herbivore_counts', []))
        self.carnivore_counts.extend(data.get('carnivore_counts', []))
        
        # 保持数据点数量在最大值以内
        while len(self.timestamps) > self.max_points:
            self.timestamps.pop(0)
            self.producer_counts.pop(0)
            self.herbivore_counts.pop(0)
            self.carnivore_counts.pop(0)
        
        if self.timestamps:
            self.current_time = max(self.timestamps)
    
    def reset(self):
        """
        重置数据
        """
        self.timestamps = []
        self.producer_counts = []
        self.herbivore_counts = []
        self.carnivore_counts = []
        self.current_time = 0
    
    def get_all_data(self) -> Dict[str, List[Any]]:
        """
        获取所有数据
        
        返回：
            包含所有数据的字典
        """
        return {
            'timestamps': self.timestamps,
            'producer_counts': self.producer_counts,
            'herbivore_counts': self.herbivore_counts,
            'carnivore_counts': self.carnivore_counts
        }
    
    def get_statistics(self) -> Dict[str, Dict[str, float]]:
        """
        计算统计信息
        
        返回：
            包含统计信息的字典
        """
        stats = {}
        
        # 计算每种生物体的统计信息
        for organism_type in ['producer', 'herbivore', 'carnivore']:
            data_list = getattr(self, f'{organism_type}_counts')
            if data_list:
                stats[organism_type] = {
                    'mean': float(np.mean(data_list)),
                    'min': float(np.min(data_list)),
                    'max': float(np.max(data_list)),
                    'std': float(np.std(data_list)) if len(data_list) > 1 else 0.0
                }
            else:
                stats[organism_type] = {
                    'mean': 0.0,
                    'min': 0.0,
                    'max': 0.0,
                    'std': 0.0
                }
        
        return stats
    
    def get_recent_trend(self, lookback: int = 10) -> Dict[str, str]:
        """
        获取最近的数据趋势
        
        参数：
            lookback: 回溯的时间点数量
        
        返回：
            包含趋势信息的字典
        """
        trends = {}
        
        for organism_type in ['producer', 'herbivore', 'carnivore']:
            data_list = getattr(self, f'{organism_type}_counts')
            if len(data_list) >= lookback:
                recent = data_list[-lookback:]
                if recent[0] == 0:
                    trend = 'stable'  # 避免除以零
                else:
                    change = (recent[-1] - recent[0]) / recent[0]
                    if change > 0.1:
                        trend = 'increasing'
                    elif change < -0.1:
                        trend = 'decreasing'
                    else:
                        trend = 'stable'
            else:
                trend = 'insufficient_data'
            
            trends[organism_type] = trend
        
        return trends


# 全局曲线数据实例
curve_data = CurveData()

# 全局图表对象缓存
_figure_cache = None
_axis_cache = None
_canvas_cache = None


def init_curve(width: int = 6, height: int = 4, dpi: int = 100) -> Tuple[plt.Figure, plt.Axes, FigureCanvasAgg]:
    """
    初始化曲线图
    
    参数：
        width: 图表宽度
        height: 图表高度
        dpi: 图表分辨率
    
    返回：
        (fig, ax, canvas) 元组
    """
    global _figure_cache, _axis_cache, _canvas_cache
    
    # 如果已有缓存，先清理
    if _figure_cache is not None:
        plt.close(_figure_cache)
    
    # 创建图形和坐标轴
    fig, ax = plt.subplots(figsize=(width, height), dpi=dpi)
    
    # 设置图表背景颜色为白色（使用0-1范围的颜色值）
    white_color = tuple(c/255 for c in WHITE)
    fig.patch.set_facecolor(white_color)
    ax.set_facecolor(white_color)
    
    # 设置坐标轴标签
    ax.set_xlabel('时间')
    ax.set_ylabel('数量')
    
    # 设置图表标题
    ax.set_title('生态系统数量变化')
    
    # 设置坐标轴颜色
    ax.spines['bottom'].set_color(BLACK)
    ax.spines['top'].set_color(BLACK)
    ax.spines['left'].set_color(BLACK)
    ax.spines['right'].set_color(BLACK)
    
    # 设置刻度颜色
    ax.tick_params(axis='x', colors=BLACK)
    ax.tick_params(axis='y', colors=BLACK)
    
    # 创建画布
    canvas = FigureCanvasAgg(fig)
    
    # 更新缓存
    _figure_cache = fig
    _axis_cache = ax
    _canvas_cache = canvas
    
    return fig, ax, canvas

def get_cached_figure() -> Optional[Tuple[plt.Figure, plt.Axes, FigureCanvasAgg]]:
    """
    获取缓存的图表对象
    
    返回：
        如果有缓存，返回(fig, ax, canvas)元组，否则返回None
    """
    global _figure_cache, _axis_cache, _canvas_cache
    if _figure_cache is not None and _axis_cache is not None and _canvas_cache is not None:
        return _figure_cache, _axis_cache, _canvas_cache
    return None


def update_curve(screen, producer_count: int, herbivore_count: int, carnivore_count: int, 
                fig: plt.Figure, ax: plt.Axes, canvas: FigureCanvasAgg, 
                position: Tuple[int, int] = (10, 300), 
                time_delta: Optional[float] = None) -> None:
    """
    更新曲线图
    
    参数：
        screen: Pygame屏幕
        producer_count: 植物数量
        herbivore_count: 草食动物数量
        carnivore_count: 肉食动物数量
        fig: 图形对象
        ax: 坐标轴对象
        canvas: 画布对象
        position: 图表在屏幕上的位置
        time_delta: 时间增量
    """
    # 添加新数据点
    curve_data.add_point(producer_count, herbivore_count, carnivore_count, time_delta)
    
    # 获取数据
    data = curve_data.get_all_data()
    
    # 清除当前图表
    ax.clear()
    
    # 绘制曲线
    if data['timestamps']:
        ax.plot(data['timestamps'], data['producer_counts'], color=GREEN, label='生产者', linewidth=2)
        ax.plot(data['timestamps'], data['herbivore_counts'], color=BLUE, label='草食动物', linewidth=2)
        ax.plot(data['timestamps'], data['carnivore_counts'], color=RED, label='肉食动物', linewidth=2)
    
    # 设置坐标轴标签
    ax.set_xlabel('时间')
    ax.set_ylabel('数量')
    
    # 设置图表标题
    ax.set_title('生态系统数量变化')
    
    # 设置坐标轴颜色
    ax.spines['bottom'].set_color(BLACK)
    ax.spines['top'].set_color(BLACK)
    ax.spines['left'].set_color(BLACK)
    ax.spines['right'].set_color(BLACK)
    
    # 设置刻度颜色
    ax.tick_params(axis='x', colors=BLACK)
    ax.tick_params(axis='y', colors=BLACK)
    
    # 添加图例
    ax.legend(loc='upper right')
    
    # 设置背景颜色（使用0-1范围的颜色值）
    white_color = tuple(c/255 for c in WHITE)
    ax.set_facecolor(white_color)
    
    # 设置Y轴从0开始
    ax.set_ylim(bottom=0)
    
    # 调整布局
    plt.tight_layout()
    
    # 渲染图表
    try:
        canvas.draw()
        
        # 获取渲染后的图像
        renderer = canvas.get_renderer()
        raw_data = renderer.tostring_rgb()
        
        # 获取图像大小
        size = canvas.get_width_height()
        
        # 创建Pygame表面
        import pygame
        surf = pygame.image.fromstring(raw_data, size, "RGB")
        
        # 显示在屏幕上
        screen.blit(surf, position)
    except Exception as e:
        print(f"更新图表时出错: {e}")

def create_data_snapshot() -> Dict[str, Any]:
    """
    创建当前数据的快照
    
    返回：
        包含数据快照和统计信息的字典
    """
    snapshot = {
        'timestamp': curve_data.current_time,
        'raw_data': curve_data.get_all_data(),
        'statistics': curve_data.get_statistics(),
        'trends': curve_data.get_recent_trend()
    }
    return snapshot

def export_data(filename: str = 'ecosystem_data.csv') -> bool:
    """
    导出数据到CSV文件
    
    参数：
        filename: 文件名
    
    返回：
        是否成功导出
    """
    try:
        import csv
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            # 写入表头
            writer.writerow(['时间', '生产者数量', '草食动物数量', '肉食动物数量'])
            
            # 写入数据
            data = curve_data.get_all_data()
            for i in range(len(data['timestamps'])):
                writer.writerow([
                    data['timestamps'][i],
                    data['producer_counts'][i],
                    data['herbivore_counts'][i],
                    data['carnivore_counts'][i]
                ])
        
        return True
    except Exception as e:
        print(f"导出数据时出错: {e}")
        return False


def reset_curve_data():
    """
    重置曲线数据
    """
    curve_data.reset()