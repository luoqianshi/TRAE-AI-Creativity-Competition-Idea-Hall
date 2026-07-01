import pygame
from config import GRID_SIZE
from .base_organism import BaseOrganism


class Water(BaseOrganism):
    def __init__(self, x: int, y: int):
        super().__init__("water")
        self.x = x
        self.y = y

    def draw(self, screen, screen_x, screen_y, zoom, selected: bool = False):
        # 计算网格大小
        grid_size = int(GRID_SIZE * zoom)
        center_x, center_y = int(screen_x), int(screen_y)
        
        # 绘制正方形水域
        rect = pygame.Rect(
            center_x - grid_size // 2,
            center_y - grid_size // 2,
            grid_size,
            grid_size
        )
        pygame.draw.rect(screen, (0, 229, 238), rect)
        
        # 如果选中，绘制边框
        if selected:
            pygame.draw.rect(screen, (255, 255, 0), rect, 2)

    def start_move_animation(self, from_pos, to_pos, duration: float):
        self._draw_x = self.x
        self._draw_y = self.y
        self._anim_t = 1.0

    def get_draw_position(self):
        return (self.x, self.y)

    def get_info(self):
        return {
            "类型": "水",
            "位置": f"({self.x}, {self.y})"
        }