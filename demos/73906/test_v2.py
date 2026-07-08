"""测试第二轮修复"""
import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'

import pygame
import sys
import time
sys.path.insert(0, '/workspace/atom-simulator')

from main import AtomSimulator

pygame.display.init()
pygame.font.init()

sim = AtomSimulator()

# 运行 5 秒
start = time.time()
for frame in range(300):
    sim.handle_events()
    sim.update()
    sim.render()

print(f"5秒运行完成: atoms={len(sim.atoms)} molecules={len(sim.molecules)}")
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_v2.png')

# 再运行5秒后释放能量
for frame in range(300):
    sim.handle_events()
    sim.update()
    sim.render()

sim._release_energy()
print(f"释放能量: atoms={len(sim.atoms)} molecules={len(sim.molecules)}")

# 运行60帧捕捉效果
for frame in range(60):
    sim.handle_events()
    sim.update()
    sim.render()

print(f"能量衰减后: atoms={len(sim.atoms)} molecules={len(sim.molecules)}")
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_v2_energy.png')

# 再运行5秒观察恢复
for frame in range(300):
    sim.handle_events()
    sim.update()
    sim.render()

print(f"恢复后: atoms={len(sim.atoms)} molecules={len(sim.molecules)}")
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_v2_recover.png')

pygame.quit()
print("测试完成!")
