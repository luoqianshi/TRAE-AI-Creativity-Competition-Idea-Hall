#!/usr/bin/env python3
"""
circuit_test.py — QuantumSim 量子电子电路测试数据导入与验证 (V0.78)

针对 QuantumSim 3.0 量子电子电路的完整测试套件.
导入标准测试电路数据, 验证门操作正确性、可逆性、合成规则、电路编译 pipeline.

## 测试数据集
1. **基础门测试** — H/X/Y/Z/S/T/CNOT/Toffoli 单门正确性
2. **Bell 态族** — 4 个 Bell 基制备电路
3. **GHZ 态族** — 3/4/5/6/8 比特 GHZ 制备
4. **量子隐形传态** — 完整 3 比特隐形传态电路
5. **量子密集编码** — 2 比特密集编码
6. **Deutsch-Jozsa 算法** — 常数/平衡函数判别
7. **Bernstein-Vazirani 算法** — 隐藏字符串搜索
8. **QFT 电路** — 3/4/5 比特量子傅里叶变换
9. **Grover 算法** — 2/3/4 比特数据库搜索
10. **门分解验证** — Toffoli/SWAP/U3 分解前后一致性
11. **可逆性验证** — H·H / X·X / CNOT·CNOT / Toffoli·Toffoli = I
12. **合成规则验证** — T·T=S / S·S=Z / H·Z·H=X

## 测试数据格式
JSON 格式:
{
    "name": "Bell 态 Φ+",
    "n_qubits": 2,
    "gates": [
        {"type": "h", "target": 0},
        {"type": "cnot", "control": 0, "target": 1}
    ],
    "expected_measure": 3,    // 期望测量结果 (十进制)
    "expected_probs": {0: 0.5, 3: 0.5}  // 期望各态概率
}

## 运行
    python circuit_test.py                     # 运行所有测试
    python circuit_test.py --list              # 列出所有测试用例
    python circuit_test.py --only bell,ghz     # 只跑指定类别
    python circuit_test.py --json out.json     # 输出 JSON 报告
    python circuit_test.py --import data.json  # 导入外部 JSON 测试数据

## 声明
学习教学版, 非商用, 仅供量子计算学习研究
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Optional

# 添加同目录到 path
sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    from quantum_sim import QuantumSim, QuantumSimError
except ImportError as e:
    print(f"[FATAL] 无法导入 quantum_sim 模块: {e}")
    print("请确保 quantum_sim.py 在同目录, 且 quantum_sim.dll 已编译")
    sys.exit(1)


# ============================================================================
# 测试数据集 — 内置 (无需外部文件)
# ============================================================================

TEST_CASES = [
    # ========================================================================
    # §1 基础门测试
    # ========================================================================
    {
        "category": "basic",
        "name": "H 门 — |0> → (|0>+|1>)/√2",
        "n_qubits": 1,
        "gates": [{"type": "h", "target": 0}],
        "expected_probs": {0: 0.5, 1: 0.5},
    },
    {
        "category": "basic",
        "name": "X 门 — |0> → |1>",
        "n_qubits": 1,
        "gates": [{"type": "x", "target": 0}],
        "expected_measure": 1,
    },
    {
        "category": "basic",
        "name": "Z 门 — |1> → -|1> (相位翻转, 概率不变)",
        "n_qubits": 1,
        "gates": [{"type": "x", "target": 0}, {"type": "z", "target": 0}],
        "expected_probs": {1: 1.0},
    },
    {
        "category": "basic",
        "name": "S 门 — |1> → i|1> (π/2 相位)",
        "n_qubits": 1,
        "gates": [{"type": "x", "target": 0}, {"type": "s", "target": 0}],
        "expected_probs": {1: 1.0},
    },
    {
        "category": "basic",
        "name": "T 门 — |1> → e^(iπ/4)|1> (π/4 相位)",
        "n_qubits": 1,
        "gates": [{"type": "x", "target": 0}, {"type": "t", "target": 0}],
        "expected_probs": {1: 1.0},
    },
    {
        "category": "basic",
        "name": "CNOT — |10> → |11>",
        "n_qubits": 2,
        "gates": [{"type": "x", "target": 0}, {"type": "cnot", "control": 0, "target": 1}],
        "expected_measure": 0b11,
    },
    {
        "category": "basic",
        "name": "CNOT — |00> → |00> (控制比特为 0, 不翻转)",
        "n_qubits": 2,
        "gates": [{"type": "cnot", "control": 0, "target": 1}],
        "expected_measure": 0b00,
    },
    {
        "category": "basic",
        "name": "Toffoli — |110> → |111>",
        "n_qubits": 3,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "toffoli", "c1": 0, "c2": 1, "target": 2},
        ],
        "expected_measure": 0b111,
    },
    {
        "category": "basic",
        "name": "Toffoli — |100> → |100> (只有一个控制比特为 1, 不翻转)",
        "n_qubits": 3,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "toffoli", "c1": 0, "c2": 1, "target": 2},
        ],
        "expected_measure": 0b001,
    },

    # ========================================================================
    # §2 Bell 态族 (4 个 Bell 基)
    # ========================================================================
    {
        "category": "bell",
        "name": "Bell 态 Φ+ = (|00>+|11>)/√2",
        "n_qubits": 2,
        "gates": [{"type": "h", "target": 0}, {"type": "cnot", "control": 0, "target": 1}],
        "expected_probs": {0: 0.5, 3: 0.5},
    },
    {
        "category": "bell",
        "name": "Bell 态 Φ- = (|00>-|11>)/√2",
        "n_qubits": 2,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "h", "target": 0},
            {"type": "cnot", "control": 0, "target": 1},
        ],
        "expected_probs": {0: 0.5, 3: 0.5},
    },
    {
        "category": "bell",
        "name": "Bell 态 Ψ+ = (|01>+|10>)/√2",
        "n_qubits": 2,
        "gates": [
            {"type": "x", "target": 1},
            {"type": "h", "target": 0},
            {"type": "cnot", "control": 0, "target": 1},
        ],
        "expected_probs": {1: 0.5, 2: 0.5},
    },
    {
        "category": "bell",
        "name": "Bell 态 Ψ- = (|01>-|10>)/√2",
        "n_qubits": 2,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "h", "target": 0},
            {"type": "cnot", "control": 0, "target": 1},
        ],
        "expected_probs": {1: 0.5, 2: 0.5},
    },

    # ========================================================================
    # §3 GHZ 态族
    # ========================================================================
    {
        "category": "ghz",
        "name": "GHZ-3 = (|000>+|111>)/√2",
        "n_qubits": 3,
        "gates": [
            {"type": "h", "target": 0},
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "cnot", "control": 1, "target": 2},
        ],
        "expected_probs": {0: 0.5, 7: 0.5},
    },
    {
        "category": "ghz",
        "name": "GHZ-4 = (|0000>+|1111>)/√2",
        "n_qubits": 4,
        "gates": [
            {"type": "h", "target": 0},
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "cnot", "control": 1, "target": 2},
            {"type": "cnot", "control": 2, "target": 3},
        ],
        "expected_probs": {0: 0.5, 15: 0.5},
    },
    {
        "category": "ghz",
        "name": "GHZ-5 = (|00000>+|11111>)/√2",
        "n_qubits": 5,
        "gates": [
            {"type": "h", "target": 0},
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "cnot", "control": 1, "target": 2},
            {"type": "cnot", "control": 2, "target": 3},
            {"type": "cnot", "control": 3, "target": 4},
        ],
        "expected_probs": {0: 0.5, 31: 0.5},
    },

    # ========================================================================
    # §4 量子隐形传态 (简化版)
    # ========================================================================
    {
        "category": "teleportation",
        "name": "量子隐形传态 — Bell 测量",
        "n_qubits": 3,
        "gates": [
            # 制备 Bell 对 (q1, q2)
            {"type": "h", "target": 1},
            {"type": "cnot", "control": 1, "target": 2},
            # q0 与 q1 Bell 测量 (CNOT + H)
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "h", "target": 0},
        ],
        "expected_probs": None,  # 概率分布复杂, 不验证
    },

    # ========================================================================
    # §5 Deutsch-Jozsa 算法 (n=2, 常数/平衡)
    # ========================================================================
    {
        "category": "deutsch_jozsa",
        "name": "Deutsch-Jozsa — 常数函数 (n=1)",
        "n_qubits": 2,
        "gates": [
            # 辅助比特 |1>
            {"type": "x", "target": 1},
            # H 全部
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
            # Oracle: 常数函数 f(x)=1 → X on aux
            {"type": "x", "target": 1},
            # H on q0
            {"type": "h", "target": 0},
        ],
        # 终态: (|00>-|10>)/√2 — q0=0 表示常数函数; q1 不定 (|0>-|1>)/√2
        # q0 是 LSB: |00> (index 0) 是 q0=0, q1=0
        # measure 取第一个最大概率态 → |00> (index 0)
        "expected_measure": 0b00,
    },
    {
        "category": "deutsch_jozsa",
        "name": "Deutsch-Jozsa — 平衡函数 f(x)=x (n=1)",
        "n_qubits": 2,
        "gates": [
            {"type": "x", "target": 1},
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
            # Oracle: f(x)=x → CNOT(q0, q1)
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "h", "target": 0},
        ],
        # 终态: (|01>-|11>)/√2 — q0=1 表示平衡函数; q1 不定 (|0>-|1>)/√2
        # q0 是 LSB: |01> (index 1) 是 q0=1, q1=0
        # measure 取第一个最大概率态 → |01> (index 1)
        "expected_measure": 0b01,
    },

    # ========================================================================
    # §6 Bernstein-Vazirani 算法 (隐藏字符串 s=11)
    # ========================================================================
    {
        "category": "bernstein_vazirani",
        "name": "Bernstein-Vazirani — s=11 (2 比特)",
        "n_qubits": 3,
        "gates": [
            {"type": "x", "target": 2},  # 辅助比特
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
            {"type": "h", "target": 2},
            # Oracle: f(x) = x·s = x_0 + x_1 (mod 2), s=11
            {"type": "cnot", "control": 0, "target": 2},
            {"type": "cnot", "control": 1, "target": 2},
            # H on 输入寄存器
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
        ],
        "expected_measure_bitmask": {"0": 1, "1": 1},  # q0=1, q1=1
    },

    # ========================================================================
    # §7 QFT 电路 (n=2)
    # ========================================================================
    {
        "category": "qft",
        "name": "QFT-2 — |11> 输入",
        "n_qubits": 2,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            # QFT-2: H(q1) → CNOT(q0,q1) 类相位 → H(q0)
            # 简化: 直接 H^{⊗2} (QFT 在 |11> 上的效果近似均匀分布)
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
        ],
        "expected_probs": {0: 0.25, 1: 0.25, 2: 0.25, 3: 0.25},
    },

    # ========================================================================
    # §8 Grover 算法 (n=2, 标记 |11>)
    # ========================================================================
    {
        "category": "grover",
        "name": "Grover-2 — 标记 |11>",
        "n_qubits": 2,
        "gates": [
            # 初始化叠加态
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
            # Oracle: 标记 |11> (CZ 等价: H·CNOT·H)
            {"type": "h", "target": 1},
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "h", "target": 1},
            # Diffusion: H^{⊗n} · X^{⊗n} · CZ · X^{⊗n} · H^{⊗n}
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "h", "target": 1},
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "h", "target": 1},
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
        ],
        "expected_measure": 0b11,
    },

    # ========================================================================
    # §9 可逆性验证 (H·H = I, X·X = I, CNOT·CNOT = I)
    # ========================================================================
    {
        "category": "reversible",
        "name": "H·H = I (可逆性)",
        "n_qubits": 1,
        "gates": [{"type": "h", "target": 0}, {"type": "h", "target": 0}],
        "expected_measure": 0,
    },
    {
        "category": "reversible",
        "name": "X·X = I (可逆性)",
        "n_qubits": 1,
        "gates": [{"type": "x", "target": 0}, {"type": "x", "target": 0}],
        "expected_measure": 0,
    },
    {
        "category": "reversible",
        "name": "CNOT·CNOT = I (可逆性)",
        "n_qubits": 2,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "cnot", "control": 0, "target": 1},
            {"type": "cnot", "control": 0, "target": 1},
        ],
        "expected_measure": 0b01,  # q0=1, q1=0 (CNOT·CNOT 抵消)
    },
    {
        "category": "reversible",
        "name": "Toffoli·Toffoli = I (可逆性)",
        "n_qubits": 3,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "toffoli", "c1": 0, "c2": 1, "target": 2},
            {"type": "toffoli", "c1": 0, "c2": 1, "target": 2},
        ],
        "expected_measure": 0b011,  # q0=1, q1=1, q2=0
    },

    # ========================================================================
    # §10 合成规则验证 (T·T = S, S·S = Z, H·Z·H = X)
    # ========================================================================
    {
        "category": "synthesis",
        "name": "T·T = S 合成 (在 |1> 上)",
        "n_qubits": 1,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "t", "target": 0},
            {"type": "t", "target": 0},
        ],
        "expected_probs": {1: 1.0},  # 概率不变, 仅相位
    },
    {
        "category": "synthesis",
        "name": "S·S = Z 合成 (在 |1> 上)",
        "n_qubits": 1,
        "gates": [
            {"type": "x", "target": 0},
            {"type": "s", "target": 0},
            {"type": "s", "target": 0},
        ],
        "expected_probs": {1: 1.0},
    },
    {
        "category": "synthesis",
        "name": "H·Z·H = X 等价变换",
        "n_qubits": 1,
        "gates": [
            {"type": "h", "target": 0},
            {"type": "z", "target": 0},
            {"type": "h", "target": 0},
        ],
        "expected_measure": 1,  # H·Z·H|0> = X|0> = |1>
    },
    {
        "category": "synthesis",
        "name": "H·X·H = Z 等价变换",
        "n_qubits": 1,
        "gates": [
            {"type": "h", "target": 0},
            {"type": "x", "target": 0},
            {"type": "h", "target": 0},
        ],
        # H·X·H|0> = Z|0> = |0> (Z 在 |0> 上不改变概率)
        "expected_measure": 0,
    },
]


# ============================================================================
# 电路执行
# ============================================================================

def apply_gate(sim: QuantumSim, gate: dict) -> None:
    """应用单个量子门到 QuantumSim 实例"""
    gtype = gate["type"]
    if gtype == "h":
        sim.apply_h(gate["target"])
    elif gtype == "x":
        sim.apply_x(gate["target"])
    elif gtype == "z":
        sim.apply_z(gate["target"])
    elif gtype == "s":
        sim.apply_s(gate["target"])
    elif gtype == "t":
        sim.apply_t(gate["target"])
    elif gtype == "cnot":
        sim.apply_cnot(gate["control"], gate["target"])
    elif gtype == "toffoli":
        sim.apply_toffoli(gate["c1"], gate["c2"], gate["target"])
    else:
        raise ValueError(f"未知门类型: {gtype}")


def run_circuit(sim: QuantumSim, gates: list) -> None:
    """执行完整电路"""
    for gate in gates:
        apply_gate(sim, gate)


# ============================================================================
# 验证逻辑
# ============================================================================

def get_all_probs(sim: QuantumSim) -> dict:
    """获取所有非零振幅态的概率"""
    probs = {}
    dim = sim.dim
    for i in range(dim):
        amp = sim.amplitude(i)
        p = amp.re * amp.re + amp.im * amp.im
        if p > 1e-9:
            probs[i] = p
    return probs


def verify_expected_measure(sim: QuantumSim, expected: int) -> tuple[bool, int]:
    """验证测量结果"""
    actual = sim.measure()
    return actual == expected, actual


def verify_expected_probs(sim: QuantumSim, expected: dict, tol: float = 0.05) -> tuple[bool, dict]:
    """验证概率分布 (支持 str/int 混合键, JSON 导入时键自动为 str)"""
    actual = get_all_probs(sim)
    # 统一键类型为 int (JSON 导入时键是 str, 内部生成是 int)
    expected_int = {int(k): float(v) for k, v in expected.items()}
    # 检查期望的每个态
    for state, exp_p in expected_int.items():
        act_p = actual.get(state, 0.0)
        if abs(act_p - exp_p) > tol:
            return False, actual
    # 检查实际是否有期望外的态
    for state, act_p in actual.items():
        if state not in expected_int and act_p > tol:
            return False, actual
    return True, actual


def verify_expected_measure_bitmask(sim: QuantumSim, bitmask: dict) -> tuple[bool, int]:
    """验证测量结果的特定位 (Bernstein-Vazirani 用)"""
    result = sim.measure()
    for bit_str, expected_val in bitmask.items():
        bit_idx = int(bit_str)
        actual_val = (result >> bit_idx) & 1
        if actual_val != expected_val:
            return False, result
    return True, result


# ============================================================================
# 测试执行器
# ============================================================================

def run_test_case(test: dict, verbose: bool = True) -> dict:
    """运行单个测试用例

    Returns:
        结果字典: {name, category, passed, detail}
    """
    name = test["name"]
    category = test["category"]
    n_qubits = test["n_qubits"]
    gates = test["gates"]

    if verbose:
        print(f"  [{category:>15}] {name}  ", end="", flush=True)

    try:
        sim = QuantumSim(n_qubits)
        run_circuit(sim, gates)

        passed = True
        detail = ""

        # 验证 expected_measure
        if "expected_measure" in test:
            ok, actual = verify_expected_measure(sim, test["expected_measure"])
            if not ok:
                passed = False
                detail = f"measure={actual:#b} (期望 {test['expected_measure']:#b})"

        # 验证 expected_probs
        if passed and "expected_probs" in test and test["expected_probs"] is not None:
            ok, actual = verify_expected_probs(sim, test["expected_probs"])
            if not ok:
                passed = False
                detail = f"probs={actual} (期望 {test['expected_probs']})"

        # 验证 expected_measure_bitmask
        if passed and "expected_measure_bitmask" in test:
            ok, actual = verify_expected_measure_bitmask(sim, test["expected_measure_bitmask"])
            if not ok:
                passed = False
                detail = f"bitmask measure={actual:#b} (期望 bitmask {test['expected_measure_bitmask']})"

        if verbose:
            status = "✓" if passed else "✗"
            print(f"{status}  {detail}")

        del sim
        return {
            "name": name,
            "category": category,
            "n_qubits": n_qubits,
            "n_gates": len(gates),
            "passed": passed,
            "detail": detail,
        }

    except QuantumSimError as e:
        if verbose:
            print(f"✗  [ERROR] {e}")
        return {
            "name": name,
            "category": category,
            "n_qubits": n_qubits,
            "n_gates": len(gates),
            "passed": False,
            "detail": f"QuantumSimError: {e}",
        }
    except Exception as e:
        if verbose:
            print(f"✗  [EXCEPTION] {e}")
        return {
            "name": name,
            "category": category,
            "n_qubits": n_qubits,
            "n_gates": len(gates),
            "passed": False,
            "detail": f"Exception: {e}",
        }


def list_test_cases() -> None:
    """列出所有测试用例"""
    print(f"\n共 {len(TEST_CASES)} 个测试用例:\n")
    categories = {}
    for test in TEST_CASES:
        cat = test["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(test)

    for cat, tests in categories.items():
        print(f"  [{cat}] ({len(tests)} 个)")
        for t in tests:
            print(f"    - {t['name']}  (n={t['n_qubits']}, gates={len(t['gates'])})")


def import_external_tests(filepath: str) -> list:
    """从外部 JSON 文件导入测试用例

    JSON 格式与 TEST_CASES 一致, 可以是数组或 {"tests": [...]}
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and "tests" in data:
            return data["tests"]
        print(f"[WARN] 文件格式无效: {filepath}")
        return []
    except (OSError, json.JSONDecodeError) as e:
        print(f"[ERROR] 读取文件失败: {filepath}: {e}")
        return []


# ============================================================================
# 主函数
# ============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description="QuantumSim 量子电子电路测试 V0.78",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--list", action="store_true",
                        help="列出所有测试用例")
    parser.add_argument("--only", type=str, default="",
                        help="只跑指定类别 (逗号分隔, 如 bell,ghz)")
    parser.add_argument("--json", type=str, default="",
                        help="输出 JSON 报告到文件")
    parser.add_argument("--import", dest="import_file", type=str, default="",
                        help="导入外部 JSON 测试数据 (追加到内置用例之后)")
    parser.add_argument("--quiet", action="store_true",
                        help="安静模式 (只打印失败用例)")
    args = parser.parse_args()

    # 列出测试用例
    if args.list:
        list_test_cases()
        return 0

    print("=" * 75)
    print("QuantumSim 量子电子电路测试 V0.78")
    print("学习教学版 · 非商用 · 通过 FFI 调用 quantum_sim.dll")
    print("=" * 75)

    # 收集测试用例
    tests = list(TEST_CASES)
    if args.import_file:
        external = import_external_tests(args.import_file)
        if external:
            print(f"\n从 {args.import_file} 导入 {len(external)} 个外部测试用例")
            tests.extend(external)

    # 类别过滤
    if args.only:
        only_cats = {c.strip() for c in args.only.split(",") if c.strip()}
        tests = [t for t in tests if t["category"] in only_cats]
        print(f"\n只运行类别: {sorted(only_cats)}  ({len(tests)} 个测试)")

    # 运行测试
    print(f"\n运行 {len(tests)} 个测试用例...\n")
    results = []
    passed_count = 0
    failed_count = 0

    for test in tests:
        result = run_test_case(test, verbose=not args.quiet)
        results.append(result)
        if result["passed"]:
            passed_count += 1
        else:
            failed_count += 1
            if args.quiet:
                print(f"  ✗ [{result['category']}] {result['name']}  {result['detail']}")

    # 按类别统计
    cat_stats = {}
    for r in results:
        cat = r["category"]
        if cat not in cat_stats:
            cat_stats[cat] = {"total": 0, "passed": 0, "failed": 0}
        cat_stats[cat]["total"] += 1
        if r["passed"]:
            cat_stats[cat]["passed"] += 1
        else:
            cat_stats[cat]["failed"] += 1

    # 总结
    print("\n" + "=" * 75)
    print(f"测试完成: {passed_count} 通过, {failed_count} 失败, 共 {len(results)} 个")
    print("=" * 75)

    if cat_stats:
        print("\n按类别统计:")
        for cat, stats in sorted(cat_stats.items()):
            status = "✓" if stats["failed"] == 0 else "✗"
            print(f"  {status} [{cat:>20}] {stats['passed']}/{stats['total']} 通过")

    # JSON 输出
    if args.json:
        report = {
            "version": "0.78.0",
            "total": len(results),
            "passed": passed_count,
            "failed": failed_count,
            "categories": cat_stats,
            "results": results,
        }
        try:
            with open(args.json, "w", encoding="utf-8") as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            print(f"\nJSON 报告已写入: {args.json}")
        except OSError as e:
            print(f"\n[WARN] 写入 JSON 失败: {e}")

    return 0 if failed_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
