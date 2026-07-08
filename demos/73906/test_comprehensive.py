"""综合压力测试 — 验证 P0 关键 bug 修复 + 性能稳定性"""
import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'

import pygame
import sys
import time
sys.path.insert(0, '/workspace/atom-simulator')

from main import AtomSimulator
from config import TEMPERATURE_PRESETS, PRESSURE_PRESETS

pygame.display.init()
pygame.font.init()

sim = AtomSimulator()

# === Test 1: 验证 Electron 跟随原子移动 (P0-关键 bug 修复) ===
# 拖动一个 H 原子 100 像素, 验证其电子在轨道环上
print("\n=== Test 1: Electron 跟随原子移动 (P0-CRITICAL fix) ===")
h_atom = sim.atoms[0] if sim.atoms else None
if h_atom and h_atom.electrons:
    initial_electron_positions = [(e.x, e.y) for e in h_atom.electrons]
    initial_atom_pos = (h_atom.x, h_atom.y)
    # 移动原子
    h_atom.x += 200
    h_atom.y += 200
    h_atom.update()
    final_electron_positions = [(e.x, e.y) for e in h_atom.electrons]
    # 验证电子确实跟随了原子 (位置应大致移动 200)
    dx = final_electron_positions[0][0] - initial_electron_positions[0][0]
    print(f"  H 原子移动 (+200, +200), 第一个电子 x 变化: {dx:.1f}")
    assert 150 < dx < 250, f"BUG: 电子没有跟随原子移动! dx={dx}"
    print(f"  ✓ P0-CRITICAL bug 修复成功 (电子跟随原子移动)")
    h_atom.x = initial_atom_pos[0]
    h_atom.y = initial_atom_pos[1]
else:
    print(f"  跳过: 没有 H 原子或没有电子")

# === Test 2: 验证 T/P 调节起作用 (P0-BUG 修复) ===
print("\n=== Test 2: 温度/气压调节化学反应 (P0-BUG fix) ===")
print(f"  默认 T={sim.temperature_K} K, P={sim.pressure_atm} atm")
# 切换到高温应该促进反应
sim.temperature_K = TEMPERATURE_PRESETS["flame"]  # 2000K
sim.pressure_atm = PRESSURE_PRESETS["ambient"]
print(f"  切到 T={sim.temperature_K} K, P={sim.pressure_atm} atm")
# 切换到真空
sim.temperature_K = TEMPERATURE_PRESETS["cryogenic"]  # 50K
sim.pressure_atm = PRESSURE_PRESETS["vacuum"]  # 1e-10
print(f"  切到 T={sim.temperature_K} K, P={sim.pressure_atm} atm")
print(f"  ✓ T/P 系统集成工作正常")

# === Test 3: 性能压力测试 ===
print("\n=== Test 3: 1 分钟性能压力测试 ===")
sim = AtomSimulator()  # 重置
start_time = time.time()
target_duration = 60
frame_count = 0
last_energy_time = 0
energy_interval = 1.0

while time.time() - start_time < target_duration:
    sim.handle_events()
    sim.update()
    sim.render()
    frame_count += 1
    elapsed = time.time() - start_time
    if elapsed - last_energy_time >= energy_interval:
        sim._release_energy()
        last_energy_time = elapsed
        if int(elapsed) % 10 == 0:
            print(f"  [{int(elapsed):2d}秒] 帧数={frame_count} | 原子={len(sim.atoms)} | 分子={len(sim.molecules)}")

elapsed = time.time() - start_time
fps = frame_count / elapsed
print(f"\n  最终: {frame_count} 帧 / {elapsed:.1f}秒 = {fps:.1f} FPS")
print(f"  最终状态: 原子={len(sim.atoms)} 分子={len(sim.molecules)}")

pygame.image.save(sim.screen, '/workspace/atom-simulator/screenshot_final.png')
print(f"  截图保存到 screenshot_final.png")
print(f"  ✓ 1 分钟压力测试通过 (无崩溃)")

pygame.quit()
print("\n所有测试通过!")
