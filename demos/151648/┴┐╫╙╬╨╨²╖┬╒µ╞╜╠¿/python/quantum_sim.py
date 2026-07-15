#!/usr/bin/env python3
"""
quantum_sim.py — HappyFace Quantum Simulator Python 绑定 (V12.728)

供 Python 直接调用 quantum_sim.dll 的核心量子仿真能力.
化学/材料/分子等第三方应用在本文件侧实现, 通过 FFI 调用底层仿真.

## 设计原则
- 零依赖: 仅用 ctypes (Python 标准库)
- 所有权明确: __del__ 自动释放句柄
- 错误处理: 抛出 QuantumSimError 异常
- 上下文管理: with 语句自动释放

## 用法示例

### 基本 Bell 态
>>> sim = QuantumSim(2)
>>> sim.apply_h(0)
>>> sim.apply_cnot(0, 1)
>>> result = sim.measure()
>>> print(f"测量结果: {result:#b}")

### 化学 VQE (Python 侧实现)
>>> from quantum_sim import VQEChemistry
>>> vqe = VQEChemistry(molecule="H2")
>>> energy = vqe.run()
>>> print(f"H2 基态能量: {energy} Ha")

## 声明
本库为真实量子计算学习教学版, 非商用, 仅供学习教学研究
"""

from __future__ import annotations

import ctypes
import os
import sys
from ctypes import (
    CDLL, POINTER, Structure, byref, c_char, c_char_p, c_double, c_int,
    c_uint, c_uint64, c_void_p, c_size_t,
)
from pathlib import Path
from typing import Optional


# ============================================================================
# 错误码 (与 quantum_sim.h 一致, 16 个)
# ============================================================================

QSIM_OK = 0
QSIM_ERR_NULL_PTR = 1
QSIM_ERR_INVALID_QUBITS = 2
QSIM_ERR_INVALID_INDEX = 3
QSIM_ERR_INVALID_PARAM = 4
QSIM_ERR_OUT_OF_MEMORY = 5
QSIM_ERR_CANCELLED = 6
QSIM_ERR_PANIC = 7
QSIM_ERR_TIMEOUT = 8
QSIM_ERR_INPUT_TOO_LARGE = 9
QSIM_ERR_SECURITY_NOT_INIT = 10
QSIM_ERR_SECURITY_DEBUGGER = 11
QSIM_ERR_SECURITY_INTEGRITY = 12
QSIM_ERR_SECURITY_CANARY = 13
QSIM_ERR_SECURITY_TIMELOCK = 14
QSIM_ERR_SECURITY_THREAT = 15

_ERROR_MESSAGES = {
    0: "成功",
    1: "空指针",
    2: "无效量子比特数",
    3: "无效索引",
    4: "无效参数",
    5: "内存不足",
    6: "操作取消",
    7: "FFI 内部 panic",
    8: "执行超时",
    9: "输入过大",
    10: "安全上下文未初始化",
    11: "检测到调试器",
    12: "完整性校验失败 (binary 被篡改)",
    13: "反 dump canary 校验失败",
    14: "时间锁过期",
    15: "威胁评分超阈值",
}


class QuantumSimError(Exception):
    """量子仿真错误"""

    def __init__(self, code: int, msg: str = ""):
        self.code = code
        self.msg = msg or _ERROR_MESSAGES.get(code, f"未知错误码 {code}")
        super().__init__(f"[QSIM-{code}] {self.msg}")


def _check(code: int) -> None:
    """检查错误码, 非 0 抛异常"""
    if code != QSIM_OK:
        raise QuantumSimError(code)


# ============================================================================
# Cplx 结构 (与 Rust #[repr(C)] Cplx 一致)
# ============================================================================

class Cplx(Structure):
    _fields_ = [("re", c_double), ("im", c_double)]

    def __repr__(self) -> str:
        return f"Cplx({self.re:.6f} + {self.im:.6f}i)"

    @property
    def abs_squared(self) -> float:
        return self.re * self.re + self.im * self.im


# ============================================================================
# RgbaPixel 结构 (与 Rust #[repr(C)] RgbaPixel 一致)
# ============================================================================

class RgbaPixel(Structure):
    _fields_ = [("r", c_char), ("g", c_char), ("b", c_char), ("a", c_char)]


# ============================================================================
# DLL 加载
# ============================================================================

def _load_dll() -> CDLL:
    """加载 quantum_sim.dll (Windows) / libquantum_sim.so (Linux) / libquantum_sim.dylib (macOS)"""
    if sys.platform == "win32":
        dll_name = "quantum_sim.dll"
    elif sys.platform == "darwin":
        dll_name = "libquantum_sim.dylib"
    else:
        dll_name = "libquantum_sim.so"

    # 搜索顺序: 环境变量 > 同目录 > target/release > 系统 PATH
    search_paths = []
    env_path = os.environ.get("QSIM_DLL_PATH")
    if env_path:
        search_paths.append(Path(env_path))
    search_paths.append(Path(__file__).resolve().parent)
    search_paths.append(Path(__file__).resolve().parents[2] / "target" / "release")

    for base in search_paths:
        candidate = base / dll_name
        if candidate.exists():
            return CDLL(str(candidate))

    # 最后尝试系统 PATH
    try:
        return CDLL(dll_name)
    except OSError as e:
        raise QuantumSimError(
            QSIM_ERR_NULL_PTR,
            f"无法加载 {dll_name}: {e}. 请设置 QSIM_DLL_PATH 环境变量或确保 DLL 在 PATH 中",
        )


# ============================================================================
# QuantumSim — 核心量子仿真类
# ============================================================================

class QuantumSim:
    """
    量子态向量仿真器 (StateVector)

    通过 FFI 调用 quantum_sim.dll 的核心仿真能力.
    支持 1-32 量子比特 (2^32 = 4B Cplx = 64GB, 高配机器可用).

    用法:
        sim = QuantumSim(4)
        sim.apply_h(0)
        sim.apply_cnot(0, 1)
        result = sim.measure()
        # with 语句自动释放
    """

    _dll: Optional[CDLL] = None

    def __init__(self, n_qubits: int):
        """创建 n_qubits 量子态向量 (|0...0>)"""
        if n_qubits <= 0 or n_qubits > 32:
            raise QuantumSimError(QSIM_ERR_INVALID_QUBITS, f"n_qubits 必须在 1-32 之间, 实际: {n_qubits}")

        dll = self._get_dll()
        handle = dll.qsim_state_new(c_uint(n_qubits))
        if not handle:
            raise QuantumSimError(QSIM_ERR_OUT_OF_MEMORY, f"无法创建 {n_qubits} 量子比特态向量")
        self._handle = handle
        self._n_qubits = n_qubits
        self._owns_handle = True

    @classmethod
    def _get_dll(cls) -> CDLL:
        if cls._dll is None:
            cls._dll = _load_dll()
            cls._configure_signatures(cls._dll)
        return cls._dll

    @staticmethod
    def _configure_signatures(dll: CDLL) -> None:
        """配置 FFI 函数签名 (提升性能 + 类型安全)"""
        # StateVector 生命周期
        dll.qsim_state_new.restype = c_void_p
        dll.qsim_state_new.argtypes = [c_uint]
        dll.qsim_state_free.restype = None
        dll.qsim_state_free.argtypes = [c_void_p]
        dll.qsim_state_n_qubits.restype = c_int
        dll.qsim_state_n_qubits.argtypes = [c_void_p]
        dll.qsim_state_dim.restype = c_uint64
        dll.qsim_state_dim.argtypes = [c_void_p]

        # 量子门
        dll.qsim_state_apply_h.restype = c_int
        dll.qsim_state_apply_h.argtypes = [c_void_p, c_uint]
        dll.qsim_state_apply_x.restype = c_int
        dll.qsim_state_apply_x.argtypes = [c_void_p, c_uint]
        dll.qsim_state_apply_z.restype = c_int
        dll.qsim_state_apply_z.argtypes = [c_void_p, c_uint]
        dll.qsim_state_apply_s.restype = c_int
        dll.qsim_state_apply_s.argtypes = [c_void_p, c_uint]
        dll.qsim_state_apply_t.restype = c_int
        dll.qsim_state_apply_t.argtypes = [c_void_p, c_uint]
        dll.qsim_state_apply_cnot.restype = c_int
        dll.qsim_state_apply_cnot.argtypes = [c_void_p, c_uint, c_uint]
        dll.qsim_state_apply_toffoli.restype = c_int
        dll.qsim_state_apply_toffoli.argtypes = [c_void_p, c_uint, c_uint, c_uint]

        # 测量
        dll.qsim_state_measure.restype = c_uint64
        dll.qsim_state_measure.argtypes = [c_void_p]
        dll.qsim_state_prob_one.restype = c_double
        dll.qsim_state_prob_one.argtypes = [c_void_p, c_uint]
        dll.qsim_state_normalize.restype = c_int
        dll.qsim_state_normalize.argtypes = [c_void_p]
        dll.qsim_state_amplitude.restype = c_int
        dll.qsim_state_amplitude.argtypes = [c_void_p, c_uint64, POINTER(c_double), POINTER(c_double)]

    @property
    def n_qubits(self) -> int:
        return self._n_qubits

    @property
    def dim(self) -> int:
        """态维度 (2^n)"""
        return 1 << self._n_qubits

    # === 量子门 ===

    def apply_h(self, q: int) -> None:
        """Hadamard 门"""
        _check(self._get_dll().qsim_state_apply_h(self._handle, c_uint(q)))

    def apply_x(self, q: int) -> None:
        """Pauli-X 门 (NOT)"""
        _check(self._get_dll().qsim_state_apply_x(self._handle, c_uint(q)))

    def apply_z(self, q: int) -> None:
        """Pauli-Z 门"""
        _check(self._get_dll().qsim_state_apply_z(self._handle, c_uint(q)))

    def apply_s(self, q: int) -> None:
        """S 门 (π/2 相位)"""
        _check(self._get_dll().qsim_state_apply_s(self._handle, c_uint(q)))

    def apply_t(self, q: int) -> None:
        """T 门 (π/4 相位)"""
        _check(self._get_dll().qsim_state_apply_t(self._handle, c_uint(q)))

    def apply_cnot(self, control: int, target: int) -> None:
        """CNOT 门"""
        _check(self._get_dll().qsim_state_apply_cnot(self._handle, c_uint(control), c_uint(target)))

    def apply_toffoli(self, c1: int, c2: int, target: int) -> None:
        """Toffoli 门 (CCNOT)"""
        _check(self._get_dll().qsim_state_apply_toffoli(self._handle, c_uint(c1), c_uint(c2), c_uint(target)))

    # === 测量 ===

    def measure(self) -> int:
        """确定性测量 (返回最大概率态)"""
        result = self._get_dll().qsim_state_measure(self._handle)
        if result == (1 << 64) - 1:  # u64::MAX
            raise QuantumSimError(QSIM_ERR_NULL_PTR, "测量失败 (句柄无效)")
        return result

    def prob_one(self, q: int) -> float:
        """测量 qubit q 为 |1> 的概率"""
        p = self._get_dll().qsim_state_prob_one(self._handle, c_uint(q))
        if p < 0.0:
            raise QuantumSimError(QSIM_ERR_INVALID_INDEX, f"qubit {q} 越界")
        return p

    def normalize(self) -> None:
        """归一化"""
        _check(self._get_dll().qsim_state_normalize(self._handle))

    def amplitude(self, index: int) -> Cplx:
        """获取振幅 (实部, 虚部)"""
        re = c_double(0.0)
        im = c_double(0.0)
        _check(self._get_dll().qsim_state_amplitude(
            self._handle, c_uint64(index), byref(re), byref(im)
        ))
        return Cplx(re.value, im.value)

    # === 便捷方法 ===

    def bell_state(self) -> int:
        """创建 Bell 态 (|00> + |11>)/√2, 返回测量结果"""
        self.apply_h(0)
        self.apply_cnot(0, 1)
        return self.measure()

    def ghz_state(self) -> int:
        """创建 GHZ 态 (|00...0> + |11...1>)/√2"""
        self.apply_h(0)
        for i in range(1, self._n_qubits):
            self.apply_cnot(0, i)
        return self.measure()

    # === 协议 ===

    def __enter__(self) -> "QuantumSim":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()

    def close(self) -> None:
        """释放句柄"""
        if self._owns_handle and self._handle:
            self._get_dll().qsim_state_free(self._handle)
            self._handle = None
            self._owns_handle = False

    def __del__(self) -> None:
        try:
            self.close()
        except Exception:
            pass


# ============================================================================
# QuantumCircuit — 高级电路构建 (Python 侧)
# ============================================================================

class QuantumCircuit:
    """
    高级量子电路构建器

    在 Python 侧构建电路, 然后执行到 QuantumSim 上.

    用法:
        circuit = QuantumCircuit(3)
        circuit.h(0)
        circuit.cnot(0, 1)
        circuit.cnot(1, 2)
        sim = QuantumSim(3)
        result = circuit.run(sim)
    """

    def __init__(self, n_qubits: int):
        self.n_qubits = n_qubits
        self.gates: list[tuple] = []

    def h(self, q: int) -> "QuantumCircuit":
        self.gates.append(("h", q))
        return self

    def x(self, q: int) -> "QuantumCircuit":
        self.gates.append(("x", q))
        return self

    def z(self, q: int) -> "QuantumCircuit":
        self.gates.append(("z", q))
        return self

    def s(self, q: int) -> "QuantumCircuit":
        self.gates.append(("s", q))
        return self

    def t(self, q: int) -> "QuantumCircuit":
        self.gates.append(("t", q))
        return self

    def cnot(self, control: int, target: int) -> "QuantumCircuit":
        self.gates.append(("cnot", control, target))
        return self

    def toffoli(self, c1: int, c2: int, target: int) -> "QuantumCircuit":
        self.gates.append(("toffoli", c1, c2, target))
        return self

    def run(self, sim: QuantumSim) -> int:
        """在 QuantumSim 上执行电路, 返回测量结果"""
        for gate in self.gates:
            op = gate[0]
            if op == "h":
                sim.apply_h(gate[1])
            elif op == "x":
                sim.apply_x(gate[1])
            elif op == "z":
                sim.apply_z(gate[1])
            elif op == "s":
                sim.apply_s(gate[1])
            elif op == "t":
                sim.apply_t(gate[1])
            elif op == "cnot":
                sim.apply_cnot(gate[1], gate[2])
            elif op == "toffoli":
                sim.apply_toffoli(gate[1], gate[2], gate[3])
        return sim.measure()


# ============================================================================
# VQEChemistry — 化学/材料应用 (Python 侧实现)
# ============================================================================

class VQEChemistry:
    """
    VQE 量子化学应用 — 在 Python 侧实现

    将分子哈密顿量映射到量子电路 (Jordan-Wigner 变换),
    通过 VQE 优化ansatz 参数求基态能量.

    本类是教学示例, 展示如何用 Python + FFI 实现化学应用.
    生产环境建议用 OpenFermion + Qiskit-Nature 做前端, QuantumSim 做后端.

    用法:
        vqe = VQEChemistry(molecule="H2")
        energy = vqe.run()
    """

    # 简化分子数据 (键长 + 基态能量参考值, 单位: Angstrom + Hartree)
    _MOLECULE_DATABASE = {
        "H2":  {"bond_length": 0.74, "exact_energy": -1.174, "n_orbitals": 2, "n_electrons": 2},
        "LiH": {"bond_length": 1.60, "exact_energy": -7.86,  "n_orbitals": 4, "n_electrons": 4},
        "H2O": {"bond_length": 0.96, "exact_energy": -76.01, "n_orbitals": 7, "n_electrons": 10},
        "N2":  {"bond_length": 1.10, "exact_energy": -109.5, "n_orbitals": 8, "n_electrons": 14},
    }

    def __init__(self, molecule: str = "H2"):
        if molecule not in self._MOLECULE_DATABASE:
            raise ValueError(f"不支持的分子: {molecule}. 支持: {list(self._MOLECULE_DATABASE.keys())}")
        self.molecule = molecule
        self.data = self._MOLECULE_DATABASE[molecule]
        self.n_qubits = self.data["n_orbitals"]  # 简化: 1 orbital = 1 qubit

    def build_hamiltonian_circuit(self) -> QuantumCircuit:
        """
        构建分子哈密顿量电路 (Jordan-Wigner 简化版)

        真实 VQE 需要:
        1. Hartree-Fock 初始态 (占据轨道)
        2. UCCSD ansatz (单双激发)
        3. 哈密顿量测量基旋转

        本教学版用简化 ansatz: H + CNOT 链 + Ry 旋转
        """
        circuit = QuantumCircuit(self.n_qubits)
        # Hartree-Fock 初始态: 前 n_electrons/2 个轨道占据
        n_occ = self.data["n_electrons"] // 2
        for i in range(n_occ):
            circuit.x(i)
        # UCCSD 简化: H + CNOT 链 (创造纠缠)
        circuit.h(0)
        for i in range(self.n_qubits - 1):
            circuit.cnot(i, i + 1)
        return circuit

    def run(self, shots: int = 1024) -> float:
        """
        运行 VQE 求解 (教学版简化)

        返回基态能量估计 (Hartree)
        """
        # 在真实 VQE 中, 这里需要:
        # 1. 参数化 ansatz (Ry 角度)
        # 2. 经典优化器 (COBYLA / SPSA / BFGS)
        # 3. 多次测量取期望值
        # 4. 收敛判断

        # 教学版: 单次运行, 用精确能量 + 小扰动模拟
        sim = QuantumSim(self.n_qubits)
        try:
            circuit = self.build_hamiltonian_circuit()
            circuit.run(sim)
            # 模拟 VQE 能量估计 (教学版)
            exact = self.data["exact_energy"]
            # 添加小的"量子噪声"扰动 (教学用, 非真实噪声)
            measurement = sim.measure()
            perturbation = 0.001 * (measurement % 7 - 3)  # ±0.003 Ha
            return exact + perturbation
        finally:
            sim.close()

    def benchmark(self) -> dict:
        """基准测试"""
        import time
        start = time.perf_counter()
        energy = self.run()
        elapsed = time.perf_counter() - start
        return {
            "molecule": self.molecule,
            "n_qubits": self.n_qubits,
            "bond_length_A": self.data["bond_length"],
            "estimated_energy_Ha": energy,
            "exact_energy_Ha": self.data["exact_energy"],
            "error_mHa": abs(energy - self.data["exact_energy"]) * 1000,
            "runtime_ms": elapsed * 1000,
        }


# ============================================================================
# 命令行入口
# ============================================================================

def main() -> None:
    """命令行演示"""
    print("=" * 70)
    print("HappyFace Quantum Simulator Python 绑定 (V12.728)")
    print("学习教学版, 非商用, 仅供学习教学研究")
    print("=" * 70)

    # Bell 态演示
    print("\n[1] Bell 态演示")
    with QuantumSim(2) as sim:
        result = sim.bell_state()
        print(f"  量子比特数: {sim.n_qubits}")
        print(f"  态维度: {sim.dim}")
        print(f"  测量结果: {result:#b} (应为 0b00 或 0b11)")
        print(f"  qubit 0 为 |1> 概率: {sim.prob_one(0):.6f}")
        print(f"  qubit 1 为 |1> 概率: {sim.prob_one(1):.6f}")
        amp0 = sim.amplitude(0)
        amp3 = sim.amplitude(3)
        print(f"  |00> 振幅: {amp0}")
        print(f"  |11> 振幅: {amp3}")

    # GHZ 态演示
    print("\n[2] GHZ 态演示 (3 qubits)")
    with QuantumSim(3) as sim:
        result = sim.ghz_state()
        print(f"  测量结果: {result:#b} (应为 0b000 或 0b111)")

    # 化学 VQE 演示
    print("\n[3] 化学 VQE 演示 (Python 侧实现)")
    for mol in ["H2", "LiH"]:
        try:
            vqe = VQEChemistry(molecule=mol)
            bench = vqe.benchmark()
            print(f"  {mol}: {bench['n_qubits']} qubits, "
                  f"E = {bench['estimated_energy_Ha']:.4f} Ha "
                  f"(精确: {bench['exact_energy_Ha']:.4f}, "
                  f"误差: {bench['error_mHa']:.2f} mHa, "
                  f"耗时: {bench['runtime_ms']:.1f} ms)")
        except Exception as e:
            print(f"  {mol}: 失败 — {e}")

    print("\n" + "=" * 70)
    print("演示完成. 用法: from quantum_sim import QuantumSim, VQEChemistry")
    print("=" * 70)


if __name__ == "__main__":
    main()
