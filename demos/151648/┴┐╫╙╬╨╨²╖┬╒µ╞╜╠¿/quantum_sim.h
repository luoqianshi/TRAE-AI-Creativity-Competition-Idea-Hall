// ============================================================================
// quantum_sim.h — HappyFace Quantum Simulator C ABI 头文件
// ============================================================================
//
// 供 C/C++/Python/Go/JS 等外部语言直接通过 FFI 调用量子仿真库.
// 不提供 REST API, 直接 FFI 对接, 零网络开销.
//
// 版本: V0.78.0 (Learning/Education Edition - Non-Commercial)
//
// ## 设计原则
// - C ABI 兼容 (extern "C")
// - 所有权明确: 调用方负责释放
// - 错误码: 0=成功, 非0=错误
// - 无 panic 跨 FFI 边界 (catch_unwind 包装)
//
// ## 声明
// 本库为真实量子计算学习教学版, 非商用, 仅供学习教学研究
//
// ============================================================================

#ifndef QUANTUM_SIM_H
#define QUANTUM_SIM_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stddef.h>

// ============================================================================
// 版本信息
// ============================================================================

#define QSIM_VERSION_MAJOR 12
#define QSIM_VERSION_MINOR 78
#define QSIM_VERSION_PATCH 0

// ============================================================================
// 错误码 (16 个, 0=成功, 非0=错误)
// ============================================================================

#define QSIM_OK                       0   // 成功
#define QSIM_ERR_NULL_PTR             1   // 空指针
#define QSIM_ERR_INVALID_QUBITS       2   // 无效量子比特数
#define QSIM_ERR_INVALID_INDEX        3   // 量子比特索引越界
#define QSIM_ERR_INVALID_PARAM        4   // 无效参数
#define QSIM_ERR_OUT_OF_MEMORY        5   // 内存不足
#define QSIM_ERR_CANCELLED            6   // 进度回调请求取消
#define QSIM_ERR_PANIC                7   // FFI 内部 panic (catch_unwind 捕获)
#define QSIM_ERR_TIMEOUT              8   // 执行超时 (OpenQASM 沙箱)
#define QSIM_ERR_INPUT_TOO_LARGE      9   // 输入过大 (OpenQASM 沙箱)
#define QSIM_ERR_SECURITY_NOT_INIT    10  // 安全上下文未初始化
#define QSIM_ERR_SECURITY_DEBUGGER    11  // 检测到调试器
#define QSIM_ERR_SECURITY_INTEGRITY   12  // 完整性校验失败 (binary 被篡改)
#define QSIM_ERR_SECURITY_CANARY      13  // 反 dump canary 校验失败
#define QSIM_ERR_SECURITY_TIMELOCK    14  // 时间锁过期
#define QSIM_ERR_SECURITY_THREAT      15  // 威胁评分超阈值

// ============================================================================
// 量子门类型码 (用于 QsimGate.gate_type)
// ============================================================================

#define QSIM_GATE_H         0   // Hadamard 门
#define QSIM_GATE_X         1   // Pauli-X 门
#define QSIM_GATE_Y         2   // Pauli-Y 门
#define QSIM_GATE_Z         3   // Pauli-Z 门
#define QSIM_GATE_S         4   // S 门 (π/2 相位)
#define QSIM_GATE_T         5   // T 门 (π/4 相位)
#define QSIM_GATE_CNOT      6   // CNOT 门 (控制-非)
#define QSIM_GATE_CZ        7   // CZ 门 (控制-相位)
#define QSIM_GATE_TOFFOLI   8   // Toffoli 门 (双控制-非)
#define QSIM_GATE_SWAP      9   // SWAP 门
#define QSIM_GATE_RX        10  // Rx 旋转门
#define QSIM_GATE_RY        11  // Ry 旋转门
#define QSIM_GATE_RZ        12  // Rz 旋转门
#define QSIM_GATE_U3        13  // U3 通用单比特酉门 U(θ, φ, λ)
#define QSIM_GATE_ISWAP     14  // iSWAP 门
#define QSIM_GATE_XX        15  // XX 交互门
#define QSIM_GATE_YY        16  // YY 交互门
#define QSIM_GATE_CRX       17  // 控制-Rx 门
#define QSIM_GATE_CRY       18  // 控制-Ry 门
#define QSIM_GATE_CRZ       19  // 控制-Rz 门
#define QSIM_GATE_FREDKIN   20  // Fredkin 门 (控制-SWAP)

// ============================================================================
// 精度模式常量
// ============================================================================

#define QSIM_PRECISION_F32_ONLY        0  // GPU 纯 f32 (7 位精度, 速度最快)
#define QSIM_PRECISION_HYBRID_F32_F64  1  // GPU f32 + CPU f64 Kahan 校正 (15 位, 当前默认)
#define QSIM_PRECISION_F128_PLANNED    2  // f128 任意精度 (规划中, 未实现)
#define QSIM_PRECISION_F128_MPFR       3  // MPFR 任意精度 (规划中, 未实现, 依赖 libmpfr)

// ============================================================================
// 不透明句柄 (调用方仅持有指针, 不直接访问内部字段)
// ============================================================================

// 量子态向量句柄 (StateVector, 密集存储, 上限 32 qubits)
typedef struct QsimState QsimState;
typedef struct QsimState *QsimStateHandle;

// 稀疏态向量句柄 (SparseStateVector, 上限 64 qubits)
typedef struct QsimSparse QsimSparse;
typedef struct QsimSparse *QsimSparseHandle;

// MPS 句柄 (MatrixProductState, 上限 100000 qubits)
typedef struct QsimMps QsimMps;
typedef struct QsimMps *QsimMpsHandle;

// 混合加速器句柄 (HybridAccelerator, GPU/CPU 自动切换)
typedef struct QsimHybrid QsimHybrid;
typedef struct QsimHybrid *QsimHybridHandle;

// Stabilizer 态句柄 (Clifford 电路高效模拟, 上限 256 qubits)
typedef struct QsimStabilizer QsimStabilizer;
typedef struct QsimStabilizer *QsimStabilizerHandle;

// 柯西留数涡旋场句柄 (GUI 渲染)
typedef struct CauchyVortexField CauchyVortexField;
typedef struct CauchyVortexField *CauchyVortexHandle;

// ============================================================================
// FFI 类型定义
// ============================================================================

// 复数 (f64 精度, 与 numpy complex128 内存布局一致)
typedef struct {
    double re;  // 实部
    double im;  // 虚部
} Cplx;

// RGBA 像素 (8-bit per channel, 用于涡旋场渲染)
typedef struct {
    uint8_t r;  // 红
    uint8_t g;  // 绿
    uint8_t b;  // 蓝
    uint8_t a;  // Alpha (始终为 255)
} RgbaPixel;

// FFI 量子门描述 (C 兼容布局, 用于批量电路执行)
typedef struct {
    int      gate_type;  // 门类型码 (QSIM_GATE_*)
    uint32_t q;          // 目标量子比特
    uint32_t q2;         // 控制量子比特 (CNOT/CZ/Toffoli/SWAP 用)
    uint32_t q3;         // 第二控制量子比特 (Toffoli 用)
    double   theta;      // 旋转角度 θ (Rx/Ry/Rz/U3 用)
    double   phi;        // 相位 φ (U3 用)
    double   lambda;     // 相位 λ (U3 用)
} QsimGate;

// ============================================================================
// 回调函数类型
// ============================================================================

// 进度回调函数类型 (批量电路执行的进度监控与取消支持)
// current: 当前已执行门数
// total:   总门数
// user_data: 调用方传入的不透明指针
// 返回值: 0=继续执行, 非0=请求取消
typedef int (*QsimProgressCallback)(size_t current, size_t total, void *user_data);

// ============================================================================
// StateVector 生命周期 (密集存储, 上限 32 qubits)
// ============================================================================

// 创建 n_qubits 量子态向量 (|0...0⟩), n_qubits 范围 [1, 32]
// 返回: 句柄指针, 失败返回 NULL
QsimStateHandle qsim_state_new(uint32_t n_qubits);

// 释放态向量 (handle 必须由 qsim_state_new 返回, 只能释放一次, 传 NULL 为空操作)
void qsim_state_free(QsimStateHandle handle);

// 获取量子比特数, 失败返回 -1
int qsim_state_n_qubits(QsimStateHandle handle);

// 获取态维度 (2^n), 失败返回 0
uint64_t qsim_state_dim(QsimStateHandle handle);

// ============================================================================
// StateVector 量子门
// ============================================================================

// 应用 Hadamard 门到 qubit q
int qsim_state_apply_h(QsimStateHandle handle, uint32_t q);

// 应用 Pauli-X 门到 qubit q
int qsim_state_apply_x(QsimStateHandle handle, uint32_t q);

// 应用 Pauli-Y 门到 qubit q
int qsim_state_apply_y(QsimStateHandle handle, uint32_t q);

// 应用 Pauli-Z 门到 qubit q
int qsim_state_apply_z(QsimStateHandle handle, uint32_t q);

// 应用 S 门 (π/2 相位) 到 qubit q
int qsim_state_apply_s(QsimStateHandle handle, uint32_t q);

// 应用 T 门 (π/4 相位) 到 qubit q
int qsim_state_apply_t(QsimStateHandle handle, uint32_t q);

// 应用 CNOT 门 (control 控制 target)
int qsim_state_apply_cnot(QsimStateHandle handle, uint32_t control, uint32_t target);

// 应用 CZ 门 (control 控制 target)
int qsim_state_apply_cz(QsimStateHandle handle, uint32_t control, uint32_t target);

// 应用 Toffoli 门 (c1, c2 双控制 target)
int qsim_state_apply_toffoli(QsimStateHandle handle, uint32_t c1, uint32_t c2, uint32_t target);

// 应用 SWAP 门 (交换 q1 和 q2)
int qsim_state_apply_swap(QsimStateHandle handle, uint32_t q1, uint32_t q2);

// 应用 Rx 旋转门 (角度 theta)
int qsim_state_apply_rx(QsimStateHandle handle, uint32_t q, double theta);

// 应用 Ry 旋转门 (角度 theta)
int qsim_state_apply_ry(QsimStateHandle handle, uint32_t q, double theta);

// 应用 Rz 旋转门 (角度 theta)
int qsim_state_apply_rz(QsimStateHandle handle, uint32_t q, double theta);

// 应用任意单比特酉门 U(θ, φ, λ) — IBM Qiskit 标准 U3 门
int qsim_state_apply_u(QsimStateHandle handle, uint32_t q, double theta, double phi, double lambda);

// 在所有量子比特上应用 Hadamard (创建均匀叠加)
int qsim_state_apply_h_all(QsimStateHandle handle);

// ============================================================================
// StateVector 测量与查询
// ============================================================================

// 确定性测量 (返回最大概率态的索引), 失败返回 UINT64_MAX
uint64_t qsim_state_measure(QsimStateHandle handle);

// 测量 qubit q 为 |1⟩ 的概率, 失败返回 -1.0
double qsim_state_prob_one(QsimStateHandle handle, uint32_t q);

// 测量 qubit q 为 |0⟩ 的概率, 失败返回 -1.0
double qsim_state_prob_zero(QsimStateHandle handle, uint32_t q);

// 归一化态向量
int qsim_state_normalize(QsimStateHandle handle);

// 获取指定索引处的振幅 (实部 + 虚部)
// out_re, out_im 必须指向有效的 double 内存
int qsim_state_amplitude(QsimStateHandle handle, uint64_t index, double *out_re, double *out_im);

// 批量拷贝全部振幅 (一次 FFI 调用, 零拷贝 memcpy)
// Cplx {re, im} 内存布局 = interleaved [re, im, re, im, ...]
// 与 numpy complex128 布局一致, Python 端可用 np.frombuffer().view(complex128) 零拷贝
// out_ptr 必须指向至少 dim × 2 个 double 的有效内存
int qsim_state_copy_amplitudes(QsimStateHandle handle, double *out_ptr, size_t out_len);

// 确定性采样: 返回前 K 个最可能结果
// out_indices 和 out_probs 必须指向至少 k 个元素的有效内存
// out_actual_len 可为 NULL; 若非 NULL 则写入实际结果数
int qsim_state_sample_top_k(QsimStateHandle handle, size_t k,
                            uint64_t *out_indices, double *out_probs,
                            size_t *out_actual_len);

// ============================================================================
// 电路执行 (StateVector)
// ============================================================================

// 批量执行量子门 (一次 FFI 调用执行整个电路, 消除逐门 FFI 开销)
// gates_ptr 必须指向至少 gates_len 个 QsimGate 的有效内存
int qsim_state_run_circuit(QsimStateHandle handle, const QsimGate *gates_ptr, size_t gates_len);

// 带进度回调的批量电路执行 (允许调用方监控进度并中途取消)
// 每执行完一个门后调用 progress_cb; 若回调返回非 0, 立即停止并返回 QSIM_ERR_CANCELLED
int qsim_state_run_circuit_with_progress(QsimStateHandle handle,
                                         const QsimGate *gates_ptr, size_t gates_len,
                                         QsimProgressCallback progress_cb,
                                         void *user_data);

// 设置精度模式 (仅影响 GPU 路径, CPU StateVector 内部始终 f64)
// precision_mode: 见 QSIM_PRECISION_* 常量; F128 模式返回 QSIM_ERR_INVALID_PARAM
int qsim_state_set_precision_mode(QsimStateHandle handle, int precision_mode);

// ============================================================================
// QASM 互通
// ============================================================================

// 导出当前态为 QASM 2.0 字符串 (仅含寄存器声明 + 测量, 不含门序列)
// 调用方负责用 qsim_string_free 释放返回的字符串; 失败返回 NULL
char *qsim_state_to_qasm(QsimStateHandle handle);

// 从门列表生成 QASM 2.0 字符串 (电路序列化)
// 调用方负责用 qsim_string_free 释放; 失败返回 NULL
char *qsim_circuit_to_qasm(const QsimGate *gates_ptr, size_t gates_len, uint32_t n_qubits);

// 从 QASM 2.0 字符串解析门列表 (电路反序列化)
// qasm 必须为以 '\0' 结尾的有效 C 字符串
// out_gates_ptr 指向调用方预分配的 QsimGate 数组, out_gates_capacity 为容量
// out_gates_len 写入实际解析出的门数, out_n_qubits 写入量子比特数
// 若容量不足, 返回 QSIM_ERR_INVALID_INDEX 并通过 out_gates_len 写入所需容量
int qsim_circuit_from_qasm(const char *qasm,
                           QsimGate *out_gates_ptr, size_t out_gates_capacity,
                           size_t *out_gates_len, uint32_t *out_n_qubits);

// 执行 OpenQASM 2.0 电路字符串, 返回态向量句柄
// 兼容 Qiskit / Cirq 生成的 OpenQASM 2.0 电路
// DFL 确定性测量: 零 rand, 取概率最大结果
// 输入上限 1MB; 调用方负责用 qsim_state_free 释放返回的句柄
QsimStateHandle qsim_run_openqasm(const char *qasm_src);

// ============================================================================
// SparseStateVector (稀疏存储, 上限 64 qubits)
// ============================================================================

// 创建稀疏态向量 (支持 64 qubits), n_qubits 范围 [1, 64]
// 超过 64 qubits 请用 qsim_mps_new (MPS 支持任意量子比特数)
QsimSparseHandle qsim_sparse_new(uint32_t n_qubits);

// 释放稀疏态向量
void qsim_sparse_free(QsimSparseHandle handle);

// 稀疏态: 应用 H 门
int qsim_sparse_apply_h(QsimSparseHandle handle, uint32_t q);

// 稀疏态: 应用 X 门
int qsim_sparse_apply_x(QsimSparseHandle handle, uint32_t q);

// 稀疏态: 应用 CNOT 门
int qsim_sparse_apply_cnot(QsimSparseHandle handle, uint32_t control, uint32_t target);

// 稀疏态: 非零项数
uint64_t qsim_sparse_nonzero(QsimSparseHandle handle);

// 稀疏态: 创建 GHZ 态
int qsim_sparse_create_ghz(QsimSparseHandle handle);

// ============================================================================
// MPS — Matrix Product State (上限 100000 qubits)
// ============================================================================

// 创建 MPS (|0...0⟩ 态)
// n_qubits: 量子比特数 (可达 10000+), 范围 [1, 100000]
// max_chi: 最大键维度 (推荐 16-64), 范围 [1, ...]
QsimMpsHandle qsim_mps_new(uint32_t n_qubits, uint32_t max_chi);

// 释放 MPS
void qsim_mps_free(QsimMpsHandle handle);

// MPS: 应用 H 门
int qsim_mps_apply_h(QsimMpsHandle handle, uint32_t q);

// MPS: 应用 X 门
int qsim_mps_apply_x(QsimMpsHandle handle, uint32_t q);

// MPS: 应用 Z 门
int qsim_mps_apply_z(QsimMpsHandle handle, uint32_t q);

// MPS: 应用 S 门 (π/2 相位)
int qsim_mps_apply_s(QsimMpsHandle handle, uint32_t q);

// MPS: 应用 T 门 (π/4 相位)
int qsim_mps_apply_t(QsimMpsHandle handle, uint32_t q);

// MPS: 应用 CNOT 门
int qsim_mps_apply_cnot(QsimMpsHandle handle, uint32_t control, uint32_t target);

// MPS: 应用长程 CNOT (非相邻量子比特, 通过 SWAP 链实现)
int qsim_mps_apply_cnot_long_range(QsimMpsHandle handle, uint32_t control, uint32_t target);

// MPS: 应用 SWAP 门 (交换相邻量子比特 q 和 q+1)
int qsim_mps_apply_swap(QsimMpsHandle handle, uint32_t q);

// MPS: 压缩比 (state_vector / MPS), 失败返回 -1.0
double qsim_mps_compression_ratio(QsimMpsHandle handle);

// MPS: 字节大小, 失败返回 0
uint64_t qsim_mps_byte_size(QsimMpsHandle handle);

// MPS: 获取指定 bond 位置的纠缠熵 S = -Σ λ² log(λ²)
// bond: bond 索引 (0 到 n_qubits-2); 失败返回 -1.0
double qsim_mps_entanglement_entropy(QsimMpsHandle handle, uint32_t bond);

// MPS: 批量执行电路 (支持 H, X, Z, S, T, CNOT, SWAP; 不支持的门返回 QSIM_ERR_INVALID_PARAM)
// 非相邻 SWAP 通过链式相邻 SWAP 实现
int qsim_mps_run_circuit(QsimMpsHandle handle, const QsimGate *gates_ptr, size_t gates_len);

// MPS: 性能统计 — 压缩比 + 平均纠缠熵 + 最大键维数 (返回 JSON 字符串)
// 调用方负责用 qsim_string_free 释放
char *qsim_mps_performance_stats(QsimMpsHandle handle);

// ============================================================================
// Stabilizer 态 (Clifford 电路高效模拟, O(n²), 上限 256 qubits)
// ============================================================================

// 创建 Stabilizer 态 (Tableau 算法, 非 2^n 内存), n_qubits 范围 [1, 256]
QsimStabilizerHandle qsim_stabilizer_new(uint32_t n_qubits);

// 释放 Stabilizer 态
void qsim_stabilizer_free(QsimStabilizerHandle handle);

// Stabilizer: 应用 H 门
int qsim_stabilizer_apply_h(QsimStabilizerHandle handle, uint32_t q);

// Stabilizer: 应用 X 门
int qsim_stabilizer_apply_x(QsimStabilizerHandle handle, uint32_t q);

// Stabilizer: 应用 Z 门
int qsim_stabilizer_apply_z(QsimStabilizerHandle handle, uint32_t q);

// Stabilizer: 应用 S 门
int qsim_stabilizer_apply_s(QsimStabilizerHandle handle, uint32_t q);

// Stabilizer: 应用 CNOT 门
int qsim_stabilizer_apply_cnot(QsimStabilizerHandle handle, uint32_t c, uint32_t t);

// Stabilizer: 应用 CZ 门
int qsim_stabilizer_apply_cz(QsimStabilizerHandle handle, uint32_t c, uint32_t t);

// Stabilizer: 应用 SWAP 门
int qsim_stabilizer_apply_swap(QsimStabilizerHandle handle, uint32_t a, uint32_t b);

// Stabilizer: 测量 (DFL 确定性, 不确定时返回 0)
// 返回: 0 或 1 = 测量结果, -1 = 错误
int qsim_stabilizer_measure(QsimStabilizerHandle handle, uint32_t q);

// Stabilizer: 确定性测量检查
// 返回: 0 或 1 = 确定结果, -1 = 不确定或错误
int qsim_stabilizer_measure_deterministic(QsimStabilizerHandle handle, uint32_t q);

// ============================================================================
// HybridAccelerator (GPU/CPU 自动切换, 上限 32 qubits)
// ============================================================================

// 创建混合加速器 (GPU 优先, 失败自动回退 CPU)
// GPU 可用且 n_qubits <= 28: 用 GPU 批量操作; 否则纯 CPU f64 精度
QsimHybridHandle qsim_hybrid_new(uint32_t n_qubits);

// 释放混合加速器
void qsim_hybrid_free(QsimHybridHandle handle);

// 获取当前后端 (0=CPU, 1=GPU, -1=错误)
int qsim_hybrid_backend(QsimHybridHandle handle);

// GPU 是否可用 (0=否, 1=是, -1=错误)
int qsim_hybrid_gpu_available(QsimHybridHandle handle);

// 获取量子比特数 (-1 = 错误)
int qsim_hybrid_n_qubits(QsimHybridHandle handle);

// Hadamard 门 (自动分发 GPU/CPU)
int qsim_hybrid_apply_h(QsimHybridHandle handle, uint32_t q);

// Pauli-X 门 (自动分发 GPU/CPU)
int qsim_hybrid_apply_x(QsimHybridHandle handle, uint32_t q);

// Pauli-Z 门 (自动分发 GPU/CPU)
int qsim_hybrid_apply_z(QsimHybridHandle handle, uint32_t q);

// CNOT 门 (自动分发 GPU/CPU)
int qsim_hybrid_apply_cnot(QsimHybridHandle handle, uint32_t c, uint32_t t);

// 测量 (DFL argmax, 返回最大概率基态索引)
uint64_t qsim_hybrid_measure(QsimHybridHandle handle);

// qubit q 处于 |1⟩ 的概率 (f64 精度), 失败返回 -1.0
double qsim_hybrid_prob_one(QsimHybridHandle handle, uint32_t q);

// 归一化 (f64 精度)
int qsim_hybrid_normalize(QsimHybridHandle handle);

// 批量门操作 (GPU 可用时自动批量加速)
// gates 数组格式: 每个 uint64_t 编码一个门
// - 高 32 位: 门类型 (0=H, 1=X, 2=Z, 3=CNOT, 4=S, 5=T, 6=SDag, 7=TDag)
// - 低 32 位: 操作数 (单门=q, 双门=(c<<16)|t)
int qsim_hybrid_apply_gates_batch(QsimHybridHandle handle, const uint64_t *gates_ptr, size_t n_gates);

// ============================================================================
// 安全接口 (CognitiveFirewall 四重防御)
// ============================================================================

// 安全初始化 — 启动时调用, 激活 CognitiveFirewall 四重防御
// 流程: 反分析检测 → 硬件指纹 → CognitiveFirewall 创建 → 完整性自校验 → 进入认知态
int qsim_security_init(void);

// 带过期时间的安全初始化 (时间锁场景)
// expiry_timestamp: Unix 时间戳 (秒)
int qsim_security_init_with_expiry(uint64_t expiry_timestamp);

// 仿真主循环周期安全检测 — 每 N 步调用一次
// 检测: 反调试 + canary + 时间锁 + 间隔演化
int qsim_security_tick(void);

// 主动安全扫描 — 关键操作前调用
// 立即执行所有检测 (反调试 + 完整性 + canary + VM + 威胁评分)
int qsim_security_scan_now(void);

// 安全终结 — 退出认知态, 清理敏感数据 (幂等)
int qsim_security_finalize(void);

// 获取当前威胁评分 (0-100+, >=100 触发拒绝)
uint32_t qsim_security_threat_score(void);

// 重置威胁评分 (仅用于测试/恢复场景)
int qsim_security_reset_threat_score(void);

// ============================================================================
// 数论加速接口
// ============================================================================

// O(1) 查表 Fibonacci(n)
uint64_t qsim_fibonacci_fast(uint32_t n);

// O(1) 查表 tanh²(n·lnφ)
double qsim_tanh_sq_ln_phi(uint32_t n);

// Ramsey R(5,5) 数论加速比
double qsim_ramsey_r55_speedup(void);

// Möbius 函数 μ(n) — 素数结构奇偶性
// 返回: 1 (偶数个不同素数), -1 (奇数个), 0 (有平方因子)
int32_t qsim_mobius_mu(uint64_t n);

// Mertens 函数 M(n) = Σ_{k=1}^n μ(k)
// Riemann Hypothesis 等价: M(n) = O(n^(1/2+ε))
int64_t qsim_mertens_function(uint64_t n);

// j-不变量 j(τ) = 1728·E₄³ / (E₄³ - E₆²)
// 模形式核心不变量, 标识椭圆曲线同构类; j(i) = 1728, j(ρ) = 0
// tau_re, tau_im: τ 的实部和虚部; terms: 级数项数
double qsim_j_invariant(double tau_re, double tau_im, size_t terms);

// 2-元中国剩余定理: 求解 x ≡ r1 (mod m1), x ≡ r2 (mod m2)
// 返回 QSIM_OK 并通过 out_x/out_m 返回解, 或返回 QSIM_ERR_INVALID_PARAM (非互素)
// out_x 和 out_m 必须指向有效的 int64_t 内存
int qsim_crt_solve_pair(int64_t r1, int64_t m1, int64_t r2, int64_t m2,
                        int64_t *out_x, int64_t *out_m);

// ============================================================================
// 版本与精度信息
// ============================================================================

// 获取版本字符串 (静态存储, 无需释放)
const char *qsim_version(void);

// 获取精度模式: 0=f32, 1=f64, 2=f64+Kahan, 3=f64+Kahan+FMA
int qsim_precision_mode(void);

// 获取精度位数 (有效十进制位数)
int qsim_precision_digits(void);

// 获取分解方法: 0=SVD(已弃用), 1=QR, 2=Householder QR
int qsim_decomposition_method(void);

// 查询当前混合精度模式支持状态 (返回 QSIM_PRECISION_HYBRID_F32_F64)
int qsim_hybrid_precision_mode(void);

// f128 任意精度支持状态 (0=未实现, 1=已实现)
int qsim_f128_supported(void);

// f128 规划目标精度位数 (f128 quad: 33-34 位)
int qsim_f128_planned_digits(void);

// ============================================================================
// 系统资源查询
// ============================================================================

// 查询系统物理内存总量 (字节); 非 Windows 返回 0
uint64_t qsim_system_ram_bytes(void);

// 查询系统可用物理内存 (字节)
uint64_t qsim_available_ram_bytes(void);

// 查询内存负载百分比 (0-100)
uint32_t qsim_memory_load_percent(void);

// 查询 GPU VRAM (字节); 失败回退到 2GB
uint64_t qsim_gpu_vram_bytes(void);

// 查询 CPU 逻辑核心数
size_t qsim_cpu_cores(void);

// 查询 CPU 物理核心数 (估计值: logical_cores / 2)
size_t qsim_cpu_physical_cores(void);

// 查询 GPU 名称 (调用方负责用 qsim_string_free 释放)
char *qsim_gpu_name(void);

// 查询 GPU 厂商 (调用方负责用 qsim_string_free 释放)
char *qsim_gpu_vendor(void);

// 查询 GPU 设备类型 (调用方负责用 qsim_string_free 释放)
// 返回: "DiscreteGpu" / "IntegratedGpu" / "VirtualGpu" / "Cpu" / "Other"
char *qsim_gpu_device_type(void);

// 基于给定 VRAM (字节) 计算该精度模式下的最大量子比特数
// precision_mode: 0/1 → 每振幅 8 字节; 2/3 → 每振幅 32 字节
// 返回最大 n, 满足 2^n × bytes_per_amp ≤ vram × 0.8
size_t qsim_gpu_max_qubits(uint64_t vram_bytes, int precision_mode);

// 基于真实硬件计算最大量子比特数 — 动态
size_t qsim_hardware_max_qubits(int precision_mode);

// f64 模式最大量子比特数 — 动态
size_t qsim_hardware_max_qubits_f64(void);

// 推荐并行阈值 (基于 CPU 核心数) — 动态
size_t qsim_recommended_parallel_threshold(void);

// 推荐批量子门数 (基于 GPU 规模) — 动态
size_t qsim_recommended_batch_size(void);

// 获取完整硬件信息 (JSON 字符串, 调用方负责用 qsim_string_free 释放)
char *qsim_hardware_info_json(void);

// ============================================================================
// 工具函数
// ============================================================================

// 错误码转字符串 (静态存储, 无需释放)
const char *qsim_error_string(int code);

// 释放由 qsim_state_to_qasm / qsim_circuit_to_qasm / qsim_mps_performance_stats /
// qsim_gpu_name / qsim_gpu_vendor / qsim_gpu_device_type / qsim_hardware_info_json
// 返回的字符串 (传 NULL 为空操作)
void qsim_string_free(char *ptr);

// ============================================================================
// Cauchy 涡旋渲染 (GUI 量子场可视化)
// ============================================================================

// 创建空涡旋场
CauchyVortexHandle cauchy_vortex_new(void);

// 释放涡旋场 (handle 必须由 cauchy_vortex_new 返回)
void cauchy_vortex_free(CauchyVortexHandle handle);

// 添加涡旋核 (x, y 复平面位置, charge 拓扑荷)
// charge: 正=逆时针, 负=顺时针
int cauchy_vortex_add(CauchyVortexHandle handle, double x, double y, int charge);

// 添加 Fibonacci 涡旋阵列 (黄金角 2π/φ 分布, 体现数论加速)
// n: 涡旋数; radius: 半径
int cauchy_vortex_add_fibonacci(CauchyVortexHandle handle, uint32_t n, double radius);

// 添加 Bragg 共振涡旋阵列 (Coxeter E₈ 周期 2π/30)
// n: 涡旋数; radius: 半径
int cauchy_vortex_add_bragg(CauchyVortexHandle handle, uint32_t n, double radius);

// 设置视场 (center_x, center_y 视场中心; zoom 半宽)
int cauchy_vortex_set_view(CauchyVortexHandle handle, double center_x, double center_y, double zoom);

// 获取总拓扑荷 (柯西留数和), 失败返回 0
int cauchy_vortex_total_charge(CauchyVortexHandle handle);

// 获取涡旋核数量, 失败返回 0
uint32_t cauchy_vortex_count(CauchyVortexHandle handle);

// 无分辨率渲染: 涡旋场 → RGBA 缓冲区
// 归一化坐标, 任意 width×height
// mode: 0=PhaseBrightness, 1=Probability, 2=PhaseOnly, 3=ResidueHeatmap
// 返回 RGBA 缓冲区指针 (调用方负责用 cauchy_vortex_free_buffer 释放)
RgbaPixel *cauchy_vortex_render(CauchyVortexHandle handle, uint32_t width, uint32_t height, int mode);

// 查询渲染缓冲区像素数 (width × height)
// 返回 0 表示 width/height 非法或乘积溢出 uint32_t
uint32_t cauchy_vortex_buffer_size(uint32_t width, uint32_t height);

// 释放渲染缓冲区
// ptr 必须由 cauchy_vortex_render 返回; size 必须匹配 cauchy_vortex_buffer_size(width, height)
void cauchy_vortex_free_buffer(RgbaPixel *ptr, uint32_t size);

#ifdef __cplusplus
} // extern "C"
#endif

#endif // QUANTUM_SIM_H
