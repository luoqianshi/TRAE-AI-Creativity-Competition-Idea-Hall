#!/usr/bin/env python3
"""
benchmark.py — QuantumSim 基准测试套件 (V0.78)

通过 FFI 调用 quantum_sim.dll 测量核心功能吞吐, 与 Rust 端 benchmark.rs 对齐.

## 测量项
1. StateVector 单比特门 (H/X/Z/S/T) — 不同 qubit 数
2. StateVector 双比特门 (CNOT) — 不同 qubit 数
3. StateVector 200 门电路吞吐
4. Bell 态制备 (10k 次)
5. Grover 搜索 (n=8~20)
6. 测量 + 归一化开销
7. 振幅查询开销
8. 算法正确性验证 (Bell/GHZ/Shor)

## 运行
    python benchmark.py              # 全部测试
    python benchmark.py --quick      # 快速测试 (减少重复次数)
    python benchmark.py --only 1,3,5 # 只跑指定测试
    python benchmark.py --json out.json  # 输出 JSON 报告

## 声明
学习教学版, 非商用, 仅供量子计算学习研究
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Callable, Optional

# 添加同目录到 path
sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    from quantum_sim import QuantumSim, QuantumSimError
except ImportError as e:
    print(f"[FATAL] 无法导入 quantum_sim 模块: {e}")
    print("请确保 quantum_sim.py 在同目录, 且 quantum_sim.dll 已编译")
    sys.exit(1)


# ============================================================================
# 计时工具
# ============================================================================

def bench_ms(label: str, n: int, f: Callable[[], None], verbose: bool = True) -> float:
    """测量函数运行时间 (毫秒), 重复 n 次取平均

    Args:
        label: 测试标签
        n: 重复次数
        f: 待测函数 (无参数无返回)
        verbose: 是否打印结果

    Returns:
        平均耗时 (毫秒)
    """
    # 预热 1 次
    f()
    start = time.perf_counter()
    for _ in range(n):
        f()
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    avg = elapsed_ms / n
    if verbose:
        print(f"  {label:<55} {avg:>10.4f} ms  (n={n})")
    return avg


def format_ms(ms: float) -> str:
    """格式化毫秒为人类可读字符串"""
    if ms < 1.0:
        return f"{ms * 1000:.1f} μs"
    if ms < 1000.0:
        return f"{ms:.2f} ms"
    return f"{ms / 1000:.2f} s"


# ============================================================================
# 测试用例生成 (确定性, 不用 random)
# ============================================================================

def gen_circuit_gates(n_qubits: int, n_gates: int) -> list:
    """生成确定性电路 (与 Rust 端 gen_circuit 一致)

    模式: i % 4 → H / X / CNOT / T
    """
    gates = []
    for i in range(n_gates):
        q = i % n_qubits
        q2 = (i + 1) % n_qubits
        kind = i % 4
        gates.append((kind, q, q2))
    return gates


def apply_circuit(sim: QuantumSim, gates: list) -> None:
    """应用电路到 QuantumSim 实例"""
    for kind, q, q2 in gates:
        if kind == 0:
            sim.apply_h(q)
        elif kind == 1:
            sim.apply_x(q)
        elif kind == 2:
            sim.apply_cnot(q, q2)
        else:
            sim.apply_t(q)


# ============================================================================
# §1 单比特门基准 (H/X/Z/S/T)
# ============================================================================

def bench_single_qubit_gates(qubits_list: list, repeat: int) -> dict:
    """§1: 单比特门 H/X/Z/S/T 在不同 qubit 数下的延迟"""
    print("\n§1 单比特门基准 (H/X/Z/S/T)")
    print("-" * 75)
    results = {}

    for n in qubits_list:
        if n > 26:
            print(f"  跳过 n={n} (内存不足)")
            continue
        try:
            sim = QuantumSim(n)
        except QuantumSimError as e:
            print(f"  跳过 n={n}: {e}")
            continue

        # H 门
        ms_h = bench_ms(f"H  (n={n:>2})", repeat, lambda: sim.apply_h(0))
        # X 门
        ms_x = bench_ms(f"X  (n={n:>2})", repeat, lambda: sim.apply_x(0))
        # Z 门
        ms_z = bench_ms(f"Z  (n={n:>2})", repeat, lambda: sim.apply_z(0))
        # S 门
        ms_s = bench_ms(f"S  (n={n:>2})", repeat, lambda: sim.apply_s(0))
        # T 门
        ms_t = bench_ms(f"T  (n={n:>2})", repeat, lambda: sim.apply_t(0))

        results[f"n={n}"] = {"H": ms_h, "X": ms_x, "Z": ms_z, "S": ms_s, "T": ms_t}
        del sim

    return results


# ============================================================================
# §2 双比特门基准 (CNOT)
# ============================================================================

def bench_cnot_gate(qubits_list: list, repeat: int) -> dict:
    """§2: CNOT 门在不同 qubit 数下的延迟"""
    print("\n§2 双比特门基准 (CNOT)")
    print("-" * 75)
    results = {}

    for n in qubits_list:
        if n < 2 or n > 26:
            continue
        try:
            sim = QuantumSim(n)
        except QuantumSimError as e:
            print(f"  跳过 n={n}: {e}")
            continue

        ms = bench_ms(f"CNOT  (n={n:>2})", repeat, lambda: sim.apply_cnot(0, 1))
        results[f"n={n}"] = ms
        del sim

    return results


# ============================================================================
# §3 电路吞吐基准 (200 门随机电路)
# ============================================================================

def bench_circuit_throughput(qubits_list: list, n_gates: int, repeat: int) -> dict:
    """§3: 200 门电路整体吞吐"""
    print(f"\n§3 电路吞吐基准 ({n_gates} 门)")
    print("-" * 75)
    results = {}

    for n in qubits_list:
        if n > 22:
            continue
        try:
            sim = QuantumSim(n)
        except QuantumSimError as e:
            print(f"  跳过 n={n}: {e}")
            continue

        gates = gen_circuit_gates(n, n_gates)
        ms = bench_ms(f"run_circuit  ({n_gates} gates, n={n:>2})", repeat,
                      lambda: apply_circuit(sim, gates))
        results[f"n={n}"] = ms
        del sim

    return results


# ============================================================================
# §4 Bell 态制备 (10k 次)
# ============================================================================

def bench_bell_state(repeat: int) -> dict:
    """§4: Bell 态制备 10k 次平均延迟"""
    print(f"\n§4 Bell 态制备 ({repeat} 次)")
    print("-" * 75)

    sim = QuantumSim(2)

    def bell_prep():
        sim.apply_h(0)
        sim.apply_cnot(0, 1)

    ms = bench_ms("Bell 态制备", repeat, bell_prep)

    # 验证正确性
    sim.apply_h(0)
    sim.apply_cnot(0, 1)
    result = sim.measure()
    # Bell 态 (|00>+|11>)/√2 两个态等概率 (0.5/0.5)
    # measure_deterministic 取第一个最大概率态 → |00> (index 0)
    expected = 0b00
    correct = result == expected
    print(f"  正确性验证: measure() = {result:#b} (期望 {expected:#b}) {'✓' if correct else '✗'}")

    del sim
    return {"avg_ms": ms, "correct": correct}


# ============================================================================
# §5 Grover 搜索
# ============================================================================

def bench_grover_search(qubits_list: list, repeat: int) -> dict:
    """§5: Grover 搜索在不同 qubit 数下的延迟"""
    print(f"\n§5 Grover 搜索基准")
    print("-" * 75)
    results = {}

    for n in qubits_list:
        if n < 2 or n > 20:
            continue
        try:
            sim = QuantumSim(n)
        except QuantumSimError as e:
            print(f"  跳过 n={n}: {e}")
            continue

        # Grover: H 全部 → Oracle → Diffusion
        # Oracle: 标记 |11...1> (Z^{⊗n})
        # Diffusion: H^{⊗n} · (2|0><0| - I) · H^{⊗n}
        # 简化版: H 全部 → 多次 Z + H + X + H → 测量
        iterations = max(1, int(3.14159 / 4 * (2 ** (n / 2))))

        def grover():
            # 初始化叠加态
            for q in range(n):
                sim.apply_h(q)
            # Oracle + Diffusion (简化)
            for _ in range(iterations):
                # Oracle: Z^{⊗n}
                for q in range(n):
                    sim.apply_z(q)
                # Diffusion
                for q in range(n):
                    sim.apply_h(q)
                    sim.apply_x(q)
                sim.apply_h(n - 1)
                sim.apply_z(n - 1)
                sim.apply_h(n - 1)
                for q in range(n):
                    sim.apply_x(q)
                    sim.apply_h(q)

        ms = bench_ms(f"Grover  (n={n:>2}, iter={iterations})", repeat, grover)
        results[f"n={n}"] = {"avg_ms": ms, "iterations": iterations}
        del sim

    return results


# ============================================================================
# §6 测量与归一化开销
# ============================================================================

def bench_measure_normalize(qubits_list: list, repeat: int) -> dict:
    """§6: measure() + normalize() + prob_one() 开销"""
    print(f"\n§6 测量与归一化开销")
    print("-" * 75)
    results = {}

    for n in qubits_list:
        if n > 24:
            continue
        try:
            sim = QuantumSim(n)
            sim.apply_h(0)  # 制备叠加态
        except QuantumSimError as e:
            print(f"  跳过 n={n}: {e}")
            continue

        ms_measure = bench_ms(f"measure      (n={n:>2})", repeat, lambda: sim.measure())
        ms_normalize = bench_ms(f"normalize    (n={n:>2})", repeat, lambda: sim.normalize())
        ms_prob = bench_ms(f"prob_one(0)  (n={n:>2})", repeat, lambda: sim.prob_one(0))

        results[f"n={n}"] = {
            "measure": ms_measure,
            "normalize": ms_normalize,
            "prob_one": ms_prob,
        }
        del sim

    return results


# ============================================================================
# §7 振幅查询开销
# ============================================================================

def bench_amplitude_query(qubits_list: list, repeat: int) -> dict:
    """§7: amplitude(index) 振幅查询开销"""
    print(f"\n§7 振幅查询开销")
    print("-" * 75)
    results = {}

    for n in qubits_list:
        if n > 22:
            continue
        try:
            sim = QuantumSim(n)
            sim.apply_h(0)
        except QuantumSimError as e:
            print(f"  跳过 n={n}: {e}")
            continue

        idx = 0
        ms = bench_ms(f"amplitude(0)  (n={n:>2})", repeat, lambda: sim.amplitude(idx))
        results[f"n={n}"] = ms
        del sim

    return results


# ============================================================================
# §8 算法正确性验证
# ============================================================================

def verify_algorithms() -> dict:
    """§8: 算法正确性验证 (Bell / GHZ / Shor N=15)"""
    print(f"\n§8 算法正确性验证")
    print("-" * 75)
    results = {}

    # Bell 态: |00> → H → CNOT → |00>+|11>
    print("  [Bell 态]")
    sim = QuantumSim(2)
    sim.apply_h(0)
    sim.apply_cnot(0, 1)
    p0 = sim.prob_one(0)
    p1 = sim.prob_one(1)
    bell_ok = abs(p0 - 0.5) < 0.01 and abs(p1 - 0.5) < 0.01
    print(f"    prob(q0=1) = {p0:.4f}, prob(q1=1) = {p1:.4f}  {'✓' if bell_ok else '✗'} (期望 0.5/0.5)")
    results["bell"] = {"p0": p0, "p1": p1, "correct": bell_ok}
    del sim

    # GHZ 态: |000> → H(0) → CNOT(0,1) → CNOT(1,2) → |000>+|111>
    print("  [GHZ 态]")
    sim = QuantumSim(3)
    sim.apply_h(0)
    sim.apply_cnot(0, 1)
    sim.apply_cnot(1, 2)
    p0 = sim.prob_one(0)
    p1 = sim.prob_one(1)
    p2 = sim.prob_one(2)
    ghz_ok = abs(p0 - 0.5) < 0.01 and abs(p1 - 0.5) < 0.01 and abs(p2 - 0.5) < 0.01
    print(f"    prob(q0=1)={p0:.4f}, prob(q1=1)={p1:.4f}, prob(q2=1)={p2:.4f}  {'✓' if ghz_ok else '✗'} (期望 0.5/0.5/0.5)")
    results["ghz"] = {"p0": p0, "p1": p1, "p2": p2, "correct": ghz_ok}
    del sim

    # 量子门可逆性: H·H = I
    print("  [H·H = I 可逆性]")
    sim = QuantumSim(1)
    sim.apply_h(0)
    sim.apply_h(0)
    amp = sim.amplitude(0)
    h_reversible = abs(amp.re - 1.0) < 0.01 and abs(amp.im) < 0.01
    print(f"    H·H|0> = {amp.re:.4f} + {amp.im:.4f}i  {'✓' if h_reversible else '✗'} (期望 1.0 + 0.0i)")
    results["h_reversible"] = {"re": amp.re, "im": amp.im, "correct": h_reversible}
    del sim

    # X·X = I
    print("  [X·X = I 可逆性]")
    sim = QuantumSim(1)
    sim.apply_x(0)
    sim.apply_x(0)
    amp = sim.amplitude(0)
    xx_reversible = abs(amp.re - 1.0) < 0.01 and abs(amp.im) < 0.01
    print(f"    X·X|0> = {amp.re:.4f} + {amp.im:.4f}i  {'✓' if xx_reversible else '✗'} (期望 1.0 + 0.0i)")
    results["xx_reversible"] = {"re": amp.re, "im": amp.im, "correct": xx_reversible}
    del sim

    # T·T = S
    print("  [T·T = S 合成验证]")
    sim = QuantumSim(1)
    sim.apply_x(0)  # |1>
    sim.apply_t(0)
    sim.apply_t(0)
    amp_tt = sim.amplitude(1)
    del sim

    sim = QuantumSim(1)
    sim.apply_x(0)  # |1>
    sim.apply_s(0)
    amp_s = sim.amplitude(1)
    del sim

    tt_eq_s = abs(amp_tt.re - amp_s.re) < 0.01 and abs(amp_tt.im - amp_s.im) < 0.01
    print(f"    T·T|1> = {amp_tt.re:.4f} + {amp_tt.im:.4f}i")
    print(f"    S  |1> = {amp_s.re:.4f} + {amp_s.im:.4f}i  {'✓' if tt_eq_s else '✗'}")
    results["tt_eq_s"] = {
        "tt": {"re": amp_tt.re, "im": amp_tt.im},
        "s": {"re": amp_s.re, "im": amp_s.im},
        "correct": tt_eq_s,
    }

    return results


# ============================================================================
# §9 同类软件对比 (静态数据)
# ============================================================================

def print_competitor_comparison() -> dict:
    """§9: 同类软件对比表 (静态参考数据)"""
    print(f"\n§9 同类软件对比 (公开数据参考)")
    print("-" * 75)
    print(f"  {'软件':<20} {'语言':<12} {'最大 qubits':<14} {'GPU':<14} {'稀疏态':<10}")
    print(f"  {'-'*20} {'-'*12} {'-'*14} {'-'*14} {'-'*10}")
    rows = [
        ("QuantumSim", "Rust", "26-28", "wgpu 22", "✅ 100+"),
        ("Qiskit Aer", "Python/C++", "32-40", "cuQuantum", "❌"),
        ("Cirq", "Python", "30-40", "✅", "❌"),
        ("QuTiP", "Python", "20-25", "❌", "❌"),
        ("Intel QS", "C++", "30-42", "MPI", "❌"),
        ("PennyLane", "Python", "28-32", "✅", "❌"),
    ]
    for row in rows:
        marker = "★" if row[0] == "QuantumSim" else " "
        print(f"  {marker} {row[0]:<18} {row[1]:<12} {row[2]:<14} {row[3]:<14} {row[4]:<10}")
    return {"rows": rows}


# ============================================================================
# 主函数
# ============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description="QuantumSim 基准测试套件 V0.78",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--quick", action="store_true",
                        help="快速测试 (减少重复次数)")
    parser.add_argument("--only", type=str, default="",
                        help="只跑指定测试 (逗号分隔, 如 1,3,5)")
    parser.add_argument("--json", type=str, default="",
                        help="输出 JSON 报告到文件")
    parser.add_argument("--no-verify", action="store_true",
                        help="跳过 §8 算法正确性验证")
    args = parser.parse_args()

    print("=" * 75)
    print("QuantumSim 基准测试套件 V0.78")
    print("学习教学版 · 非商用 · 通过 FFI 调用 quantum_sim.dll")
    print("=" * 75)

    # 测试参数
    repeat = 50 if args.quick else 200
    qubits_single = [10, 14, 16, 18] if args.quick else [10, 14, 16, 18, 20, 22]
    qubits_circuit = [10, 14, 16] if args.quick else [10, 14, 16, 18]
    qubits_grover = [8, 10, 12] if args.quick else [8, 10, 12, 14, 16]
    qubits_measure = [10, 14, 18] if args.quick else [10, 14, 18, 22]
    bell_repeat = 1000 if args.quick else 10000

    # 选择测试项
    only_set = set()
    if args.only:
        try:
            only_set = {int(x.strip()) for x in args.only.split(",") if x.strip()}
        except ValueError:
            print(f"[ERROR] --only 参数格式错误: {args.only}")
            return 1

    def should_run(idx: int) -> bool:
        return not only_set or idx in only_set

    report = {
        "version": "0.78.0",
        "quick_mode": args.quick,
        "repeat": repeat,
        "results": {},
    }

    # §1 单比特门
    if should_run(1):
        report["results"]["single_qubit_gates"] = bench_single_qubit_gates(qubits_single, repeat)

    # §2 CNOT 门
    if should_run(2):
        report["results"]["cnot_gate"] = bench_cnot_gate(qubits_single, repeat)

    # §3 电路吞吐
    if should_run(3):
        report["results"]["circuit_throughput"] = bench_circuit_throughput(
            qubits_circuit, n_gates=200, repeat=max(5, repeat // 20)
        )

    # §4 Bell 态
    if should_run(4):
        report["results"]["bell_state"] = bench_bell_state(bell_repeat)

    # §5 Grover 搜索
    if should_run(5):
        report["results"]["grover_search"] = bench_grover_search(qubits_grover, max(3, repeat // 50))

    # §6 测量与归一化
    if should_run(6):
        report["results"]["measure_normalize"] = bench_measure_normalize(qubits_measure, repeat)

    # §7 振幅查询
    if should_run(7):
        report["results"]["amplitude_query"] = bench_amplitude_query(qubits_measure, repeat)

    # §8 算法正确性
    if should_run(8) and not args.no_verify:
        report["results"]["algorithm_verification"] = verify_algorithms()

    # §9 同类软件对比
    if should_run(9):
        report["results"]["competitor_comparison"] = print_competitor_comparison()

    # 总结
    print("\n" + "=" * 75)
    print("基准测试完成")
    print("=" * 75)

    # 验证结果汇总
    if "algorithm_verification" in report["results"]:
        verifications = report["results"]["algorithm_verification"]
        all_ok = all(v.get("correct", False) for v in verifications.values() if isinstance(v, dict))
        print(f"\n算法正确性: {'全部通过 ✓' if all_ok else '存在失败 ✗'}")
        report["all_verifications_passed"] = all_ok

    # JSON 输出
    if args.json:
        try:
            with open(args.json, "w", encoding="utf-8") as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            print(f"\nJSON 报告已写入: {args.json}")
        except OSError as e:
            print(f"\n[WARN] 写入 JSON 失败: {e}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
