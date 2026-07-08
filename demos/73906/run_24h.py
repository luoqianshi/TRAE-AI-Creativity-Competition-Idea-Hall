"""24小时长时间运行脚本 — 每1秒释放一次能量，运行结束后截图"""
import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'

import pygame
import sys
import time
import gc
sys.path.insert(0, '/workspace/atom-simulator')

from main import AtomSimulator

pygame.display.init()
pygame.font.init()

sim = AtomSimulator()

start_time = time.time()
target_duration = 24 * 3600  # 24小时
frame_count = 0
last_energy_time = 0
energy_interval = 1.0  # 每1秒释放一次能量
gc_interval = 600      # 每10分钟清理一次内存
last_gc_time = 0

print(f"开始运行，目标时长: 24小时，每1秒释放一次能量...")
print(f"预计结束时间: {time.time() + target_duration:.0f} (当前时间戳)")

while time.time() - start_time < target_duration:
    sim.handle_events()
    sim.update()
    frame_count += 1

    elapsed = time.time() - start_time

    # 每1秒释放能量
    if elapsed - last_energy_time >= energy_interval:
        sim._release_energy()
        last_energy_time = elapsed

    # 定期清理内存
    if elapsed - last_gc_time >= gc_interval:
        last_gc_time = elapsed
        gc.collect()
        # 同时清理过期的特效列表，防止无限增长
        sim.flashes = [f for f in sim.flashes if f.timer > 0]
        sim.burst_particles = [p for p in sim.burst_particles if p.timer > 0]
        sim.energy_waves = [w for w in sim.energy_waves if w.timer > 0]
        sim.photon_particles = [p for p in sim.photon_particles if p.timer > 0]
        sim.reaction_labels = [l for l in sim.reaction_labels if l.timer > 0]

    # 每30分钟打印一次进度
    if int(elapsed) % 1800 == 0 and int(elapsed) > 0:
        hours = int(elapsed) // 3600
        minutes = (int(elapsed) % 3600) // 60
        print(f"进度: {hours}h {minutes}m | 帧: {frame_count} | 原子: {len(sim.atoms)} | 分子: {len(sim.molecules)}")

# 最终渲染并截图
sim.render()
pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_24h.png')

elapsed = time.time() - start_time
print(f"运行完成! 总时长: {elapsed/3600:.2f}小时 | 总帧数: {frame_count}")
print(f"最终状态: 原子={len(sim.atoms)} 分子={len(sim.molecules)}")

pygame.quit()
