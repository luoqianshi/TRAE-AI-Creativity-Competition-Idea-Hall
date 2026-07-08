"""长时间运行脚本 — 运行30分钟后截图"""
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

# 30分钟 = 1800秒，60fps = 108000帧
# 为了效率，每10帧渲染一次画面，但物理更新保持每帧
start_time = time.time()
target_duration = 30 * 60  # 30分钟
frame_count = 0
render_interval = 10  # 每10帧渲染一次

print(f"开始运行，目标时长: 30分钟...")

while time.time() - start_time < target_duration:
    # 物理更新（每帧都执行）
    sim.handle_events()
    sim.update()
    
    frame_count += 1
    
    # 定期渲染
    if frame_count % render_interval == 0:
        sim.render()
    
    # 每60秒打印一次进度
    elapsed = time.time() - start_time
    if int(elapsed) % 60 == 0 and int(elapsed) > 0:
        mins = int(elapsed) // 60
        atoms = len(sim.atoms)
        mols = len(sim.molecules)
        print(f"进度: {mins}/30分钟 | 帧: {frame_count} | 原子: {atoms} | 分子: {mols}")

# 最终渲染并截图
sim.render()
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_30min.png')

elapsed = time.time() - start_time
print(f"运行完成! 总时长: {elapsed:.1f}秒 | 总帧数: {frame_count}")
print(f"最终状态: 原子={len(sim.atoms)} 分子={len(sim.molecules)}")

pygame.quit()
