"""截图脚本 — 运行模拟器并保存截图"""
import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'

import pygame
import sys
sys.path.insert(0, '/workspace/atom-simulator')

from main import AtomSimulator

# 初始化 pygame
pygame.display.init()
pygame.font.init()

# 创建模拟器
sim = AtomSimulator()

# 运行 300 帧让画面先稳定，出现一些反应
for frame in range(300):
    sim.handle_events()
    sim.update()
    sim.render()
    if frame % 60 == 0:
        print(f"Frame {frame}... atoms={len(sim.atoms)} molecules={len(sim.molecules)}")

# 保存截图
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot.png')
print(f"Screenshot saved! atoms={len(sim.atoms)} molecules={len(sim.molecules)}")

pygame.quit()