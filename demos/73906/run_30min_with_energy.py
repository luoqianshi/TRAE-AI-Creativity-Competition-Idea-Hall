"""长时间运行脚本 — 每2分钟释放一次能量，持续30分钟后截图"""
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
target_duration = 30 * 60  # 30分钟
frame_count = 0
render_interval = 10
last_energy_time = 0
energy_interval = 120  # 每2分钟释放一次能量

print(f"开始运行，目标时长: 30分钟，每2分钟释放一次能量...")

while time.time() - start_time < target_duration:
    sim.handle_events()
    sim.update()
    
    frame_count += 1
    
    if frame_count % render_interval == 0:
        sim.render()
    
    # 每2分钟释放能量
    elapsed = time.time() - start_time
    if elapsed - last_energy_time >= energy_interval:
        sim._release_energy()
        last_energy_time = elapsed
        print(f"[{int(elapsed)//60}分钟] 释放能量！")
    
    if int(elapsed) % 60 == 0 and int(elapsed) > 0:
        mins = int(elapsed) // 60
        atoms = len(sim.atoms)
        mols = len(sim.molecules)
        print(f"进度: {mins}/30分钟 | 帧: {frame_count} | 原子: {atoms} | 分子: {mols}")

# 最终渲染并截图
sim.render()
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_30min_energy.png')

elapsed = time.time() - start_time
print(f"运行完成! 总时长: {elapsed:.1f}秒 | 总帧数: {frame_count}")
print(f"最终状态: 原子={len(sim.atoms)} 分子={len(sim.molecules)}")

pygame.quit()
