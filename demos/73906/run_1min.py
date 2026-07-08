"""1分钟运行脚本 — 每1秒释放一次能量，运行1分钟后截图"""
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

start_time = time.time()
target_duration = 60  # 1分钟
frame_count = 0
last_energy_time = 0
energy_interval = 1.0  # 每1秒释放一次能量

print(f"开始运行，目标时长: 1分钟，每1秒释放一次能量...")

while time.time() - start_time < target_duration:
    sim.handle_events()
    sim.update()
    frame_count += 1

    elapsed = time.time() - start_time

    # 每1秒释放能量
    if elapsed - last_energy_time >= energy_interval:
        sim._release_energy()
        last_energy_time = elapsed
        energy_count = int(elapsed)
        atoms_now = len(sim.atoms)
        mols_now = len(sim.molecules)
        print(f"[{energy_count}秒] 释放能量 | 原子: {atoms_now} | 分子: {mols_now}")

# 最终渲染并截图
sim.render()
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_1min.png')

elapsed = time.time() - start_time
print(f"\n运行完成! 总时长: {elapsed:.1f}秒 | 总帧数: {frame_count}")
print(f"最终状态: 原子={len(sim.atoms)} 分子={len(sim.molecules)}")

pygame.quit()
