# spatial.py — 空间网格碰撞检测，将 O(n²) 降到 O(n)

from config import WINDOW_WIDTH

CELL_SIZE = 80  # 网格单元大小，略大于最大原子直径


class SpatialGrid:
    def __init__(self, width=WINDOW_WIDTH, height=None, cell_size=CELL_SIZE):
        self.cell_size = cell_size
        # 优化: 直接 dict.get + 1 次写入, 避免 if key not in dict 2 次查找
        self.grid = {}
        # 优化: 复用的 scratch set, 避免 get_nearby 每次分配新 set
        # 注意: 仅在单线程使用, 调用方须在使用完 set 后立即结束
        self._scratch = set()
        # 优化: 复用的 cells scratch list, 避免 _get_cells 每次分配新 list
        # 一次性预填, get_nearby/insert 前先 .clear()
        self._cells_buf = []
        # 优化: 单格快速路径 scratch (col, row) 元组缓存
        self._single_cell_buf = [None]

    def clear(self):
        self.grid.clear()

    def _get_cells(self, entity):
        """获取实体覆盖的所有格子坐标
        优化: 内联 x/y/radius, 避免方法调用 + hasattr
        优化: 1 单元格快速路径 (r+r <= cell_size 时)
        优化: 复用 self._cells_buf scratch list, 避免每帧 list 分配
        """
        x = entity.x
        y = entity.y
        r = entity.radius
        cs = self.cell_size
        # 优化: 单格快速路径 (r+r <= cs 即 2r <= cs, 多数小原子命中)
        if r + r <= cs:
            # 1 个格子, 直接使用 scratch 缓存避免分配
            col = int(x // cs)
            row = int(y // cs)
            self._single_cell_buf[0] = (col, row)
            return self._single_cell_buf
        # 多格路径, 复用 scratch list
        out = self._cells_buf
        out.clear()
        min_col = int((x - r) // cs)
        max_col = int((x + r) // cs)
        min_row = int((y - r) // cs)
        max_row = int((y + r) // cs)
        for col in range(min_col, max_col + 1):
            for row in range(min_row, max_row + 1):
                out.append((col, row))
        return out

    def insert(self, entity, idx):
        """将实体插入网格
        优化: 用 dict.get + None 检查代替 'if key not in dict', 减少 1 次查找
        """
        for key in self._get_cells(entity):
            cell = self.grid.get(key)
            if cell is None:
                cell = self.grid[key] = []
            cell.append(idx)

    def insert_multi(self, entity, indices):
        """将同一实体插入多个索引, 复用 _get_cells 结果

        优化: 避免为每个 idx 重复调用 _get_cells
        优化: dict.get + None 检查
        """
        for key in self._get_cells(entity):
            cell = self.grid.get(key)
            if cell is None:
                cell = self.grid[key] = []
            for idx in indices:
                cell.append(idx)

    def get_nearby(self, entity):
        """获取实体附近的所有候选索引 (复用 scratch set, 单线程安全)

        警告: 返回值引用内部 scratch set, 调用方必须在使用完之前不再次调用 get_nearby
        由于 Python 内部迭代由 C 实现且不会被用户代码重入, 正常使用安全
        若需长期持有返回值, 应 set(nearby) 复制

        优化: _get_cells 现在复用 scratch list, 不再分配新 list
        """
        result = self._scratch
        result.clear()
        for key in self._get_cells(entity):
            cell_list = self.grid.get(key)
            if cell_list:
                for idx in cell_list:
                    result.add(idx)
        return result

    def get_nearby_copy(self, entity):
        """获取实体附近的所有候选索引的副本 (安全用于长期持有)"""
        return set(self.get_nearby(entity))
