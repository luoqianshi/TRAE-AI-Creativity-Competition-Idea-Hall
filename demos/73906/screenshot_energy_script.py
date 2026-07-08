"""截图脚本2 — 释放能量瞬间"""
import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'

import pygame
import sys
sys.path.insert(0, '/workspace/atom-simulator')

from main import AtomSimulator

pygame.display.init()
pygame.font.init()

sim = AtomSimulator()

# 先运行 200 帧
for frame in range(200):
    sim.handle_events()
    sim.update()
    sim.render()

print(f"Before energy: atoms={len(sim.atoms)} molecules={len(sim.molecules)}")

# 触发释放能量
sim._release_energy()

# 运行 30 帧捕捉能量效果
for frame in range(30):
    sim.handle_events()
    sim.update()
    sim.render()

print(f"After energy: atoms={len(sim.atoms)} molecules={len(sim.molecules)}")

pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_energy.png')
print("Energy screenshot saved!")

pygame.quit()