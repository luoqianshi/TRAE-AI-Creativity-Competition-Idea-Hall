# physics.py — 碰撞检测、融合判定、反应判定

import math
import random
from collections import defaultdict
from config import (
    FUSION_SPEED_THRESHOLD, REACTIONS, NOBLE_GASES, REACTION_CONDITIONS,
    ELEMENTS, get_fusion_energy, FUSION_EFFECTS, R_GAS, temperature_to_color,
    RADIOACTIVE_ISOTOPES, FISSION_CONFIG, NUCLEAR_COLORS, energy_to_color,
    THERMAL_CONFIG, get_reaction_flash_color, PROTON_TO_SYMBOL,
)
from effects import FlashEffect, BurstParticle, EnergyWave, PhotonParticle, ReactionLabel, ShockWave, Neutron as FreeNeutron
from molecule import Molecule
from atom import Atom
from particle import Proton, Neutron, Electron


# ============================================================
# 温度/气压门控 (Arrhenius + 勒夏特列原理)
# ============================================================
def _arrhenius_factor(Ea_kJ, T_K):
    """Arrhenius 因子: k = A * exp(-Ea / RT)
    Ea 单位: kJ/mol, R = 8.314 J/(mol·K)

    修复: Ea=0 时 exp(0) = 1, 完美反应
    修复: T_K=0 时除零, 返回 0
    优化: 提前返回避免 log/exp 性能开销
    """
    if T_K <= 0:
        return 0.0
    if Ea_kJ <= 0:
        return 1.0
    # Ea/RT 单位换算: Ea_kJ -> J (×1000)
    exponent = -Ea_kJ * 1000.0 / (R_GAS * T_K)
    # 修复: 防溢出 (exponent < -700 时 exp → 0)
    if exponent < -700:
        return 0.0
    # 修复: 溢出上限 (exponent > 50 时 exp → 5e21, 视为瞬间反应)
    if exponent > 50:
        return 1.0
    return math.exp(exponent)


def _reaction_can_occur(reaction, T_K, P_atm, local_density=1.0):
    """P0-4: 合并 _reaction_can_occur 和 _calc_reaction_probability, 一次计算

    返回 (bool, reason_str, probability):
    - bool: True=可以发生
    - reason_str: 失败原因, 成功时为空
    - probability: 反应概率 0..1, 失败时为 0
    """
    r1, r2, product, bond, energy, product_atoms, bond_type = reaction
    cond = REACTION_CONDITIONS.get(product)
    if cond is None:
        # 未注册的反应: 兼容老逻辑, 始终可以发生
        # 优化: probability = 1.0 (默认反应不需要门控)
        return True, "", 1.0

    # 1. 温度窗口
    T_min = cond.get("temp_min", 0)
    T_max = cond.get("temp_max", 1e9)
    if T_K < T_min:
        return False, f"温度过低 ({T_K:.0f}K < {T_min:.0f}K)", 0.0
    if T_K > T_max:
        return False, f"温度过高 ({T_K:.0f}K > {T_max:.0f}K, 分子已解离)", 0.0

    # 2. 气压窗口
    P_min = cond.get("pressure_min", 0)
    P_max = cond.get("pressure_max", 1e9)
    if P_atm < P_min:
        return False, f"气压过低 ({P_atm:.2f} < {P_min:.2f} atm)", 0.0
    if P_atm > P_max:
        return False, f"气压过高 ({P_atm:.0f} > {P_max:.0f} atm)", 0.0

    # 3. Arrhenius + 气压 + 浓度: 一次算完
    Ea = cond.get("Ea", 0)
    if Ea > 0:
        arr = _arrhenius_factor(Ea, T_K)
    else:
        arr = 1.0
    # 气压系数
    p_factor = min(2.0, max(0.1, P_atm))
    # 浓度加成
    d_factor = min(2.0, max(0.5, local_density))
    prob = arr * p_factor * d_factor
    return True, "", min(1.0, prob)


def get_local_density(entity, atoms, molecules, radius=150):
    """计算实体附近的局部粒子密度 (单位: particles/radius^2)

    用于浓度影响反应速率 (近邻效应)
    优化: 平方比较代替 hypot
    """
    count = 0
    r_sq = radius * radius
    ex, ey = entity.x, entity.y
    for a in atoms:
        if a is entity:
            continue
        ddx = a.x - ex
        ddy = a.y - ey
        if ddx * ddx + ddy * ddy < r_sq:
            count += 1
    for m in molecules:
        ddx = m.x - ex
        ddy = m.y - ey
        if ddx * ddx + ddy * ddy < r_sq:
            count += 1
    # 归一化到合理范围 (5-15 个粒子为基准密度 1.0)
    return max(0.1, count / 10.0)


# 修复: 质子数到元素符号的反向索引,O(1) 查找
_PROTON_TO_SYMBOL = {}
for _sym, _el in ELEMENTS.items():
    _PROTON_TO_SYMBOL[_el["protons"]] = _sym
del _sym, _el

# 优化: 按 T_K 桶量化缓存聚变阈值因子, 避免每次碰撞都 pow
_fusion_threshold_cache = {}


def check_collision(a1, a2):
    """检查两个物体是否碰撞
    优化: 内联 get_position/hasattr, 平方比较代替 math.hypot
    """
    dx = a2.x - a1.x
    dy = a2.y - a1.y
    r_sum = a1.radius + a2.radius
    return dx * dx + dy * dy < r_sum * r_sum


def resolve_elastic_collision(a1, a2):
    """弹性碰撞（不反应）"""
    dx = a2.x - a1.x
    dy = a2.y - a1.y
    dist_sq = dx * dx + dy * dy
    # 修复: 浮点严格 == 不安全, 用 1e-9 阈值
    if dist_sq < 1e-18:
        return

    # 分离
    r1 = a1.radius
    r2 = a2.radius
    dist = math.sqrt(dist_sq)
    inv_dist = 1.0 / dist
    nx = dx * inv_dist
    ny = dy * inv_dist
    overlap = r1 + r2 - dist
    if overlap > 0:
        a1.x -= nx * overlap / 2
        a1.y -= ny * overlap / 2
        a2.x += nx * overlap / 2
        a2.y += ny * overlap / 2

    # 速度交换（直接复用上面算好的 nx, ny）
    # 优化: 缓存 2 * m / (m1 + m2), 避免重复计算
    m1 = a1.mass
    m2 = a2.mass

    dvx = a1.vx - a2.vx
    dvy = a1.vy - a2.vy
    dvn = dvx * nx + dvy * ny

    if dvn > 0:
        # 优化: 仅在 dvn > 0 (实际需要交换速度) 时才计算 inv_sum/f1/f2
        inv_sum = 1.0 / (m1 + m2)
        f1 = 2.0 * m2 * inv_sum
        f2 = 2.0 * m1 * inv_sum
        a1.vx -= f1 * dvn * nx
        a1.vy -= f1 * dvn * ny
        a2.vx += f2 * dvn * nx
        a2.vy += f2 * dvn * ny


def get_relative_speed_sq(a1, a2):
    """返回相对速度的平方 (避免 sqrt), 用于阈值比较
    修复: 调用方通常仅与 FUSION_SPEED_THRESHOLD 比较, 平方比较更高效
    """
    dvx = a1.vx - a2.vx
    dvy = a1.vy - a2.vy
    return dvx * dvx + dvy * dvy


def get_relative_speed(a1, a2):
    """返回相对速度(标量), 内部用 sqrt
    优化: 调用方如果只需比较阈值, 应使用 get_relative_speed_sq
    """
    return math.hypot(a1.vx - a2.vx, a1.vy - a2.vy)


def get_entity_type(entity):
    """获取实体类型标识"""
    if isinstance(entity, Atom):
        return entity.symbol
    elif isinstance(entity, Molecule):
        return entity.formula
    return None


def try_chemical_reaction(e1, e2, T_K=298, P_atm=1.0, local_density=1.0):
    """尝试化学反应，返回 (新分子, 释放的多余原子列表, 反应标签文本) 或 None

    返回值: (molecule, released_atoms, label_text)
    - molecule: 产物分子
    - released_atoms: 反应中未消耗的原子（作为独立原子释放回场景）
    - label_text: 反应方程式文本

    P0: 引入温度/气压门控 (Arrhenius + 浓度效应)
    P0: 反应式标签显示当前 T / P
    """
    # 惰性气体不反应
    # 优化: 惰性气体检查提前, 避免对惰性气体调用 get_entity_type 的开销
    if isinstance(e1, Atom) and e1.is_noble:
        return None
    if isinstance(e2, Atom) and e2.is_noble:
        return None
    # 修复: Molecule 含惰性气体原子时也不参与反应 (防御性)
    # 优化: _has_noble 在 Molecule.__init__ 中已设置, 无需 getattr 防御
    if isinstance(e1, Molecule) and e1._has_noble:
        return None
    if isinstance(e2, Molecule) and e2._has_noble:
        return None

    t1 = get_entity_type(e1)
    t2 = get_entity_type(e2)
    if t1 is None or t2 is None:
        return None

    # 查找匹配反应（双向匹配 + 字典缓存）
    reaction = _REACTION_CACHE.get((t1, t2))
    if reaction is None:
        return None
    r1, r2, product, bond, energy, product_atoms, bond_type = reaction

    # P0: 温度/气压门控 (Arrhenius + 浓度) + 概率计算 (合并)
    can, reason, prob = _reaction_can_occur(reaction, T_K, P_atm, local_density)
    if not can:
        # 失败时不显示标签, 避免刷屏
        return None

    # P0-4: 概率门控 (仅一次 random.random, 不再二次计算 Arrhenius)
    if random.random() > prob:
        return None

    # 收集参与反应的所有原子
    all_atoms = _collect_atoms(e1) + _collect_atoms(e2)
    if not all_atoms:
        return None

    # 从所有原子中挑选产物需要的原子
    mol_atoms, released = _pick_atoms_for_product(all_atoms, product_atoms, bond_type)

    if not mol_atoms:
        return None

    # 创建分子
    mol = Molecule(product, mol_atoms, bond, bond_type)
    # P0: 标签显示当前温度/气压 (让用户了解反应条件)
    label_text = f"{t1} + {t2} → {product} ({energy}, T={T_K:.0f}K)"

    return mol, released, label_text


# 构建反应缓存（避免每次碰撞遍历 49 条反应）
_REACTION_CACHE = {}
def _build_reaction_cache():
    for reaction in REACTIONS:
        r1, r2 = reaction[0], reaction[1]
        # 双向缓存
        _REACTION_CACHE[(r1, r2)] = reaction
        _REACTION_CACHE[(r2, r1)] = reaction
_build_reaction_cache()

def _reaction_cache_lookup(t1, t2):
    """拖动预测时查询反应缓存, 返回反应条目或 None"""
    return _REACTION_CACHE.get((t1, t2))


def _collect_atoms(entity):
    """从实体中收集所有原子"""
    atoms = []
    if isinstance(entity, Atom):
        atoms.append(entity)
    elif isinstance(entity, Molecule):
        atoms.extend(entity.atoms)
    return atoms


def _pick_atoms_for_product(all_atoms, product_atom_symbols, bond_type="chain"):
    """从所有原子中挑选产物需要的原子，返回 (产物原子列表, 多余原子列表)

    product_atom_symbols: 产物分子需要的原子符号列表，如 ["H", "O", "H"]
    bond_type: 分子键类型, "bent" 模式下中心原子位置有化学意义

    优化: 按 symbol 预分组 + 记录符号 → 索引 位置, 避免每次 needed 都要扫全表
    """
    # 预分组: symbol → [index, ...] (未使用索引)
    by_sym = defaultdict(list)
    for i, atom in enumerate(all_atoms):
        by_sym[atom.symbol].append(i)

    mol_atoms = []
    used_indices = set()

    for needed_sym in product_atom_symbols:
        bucket = by_sym.get(needed_sym)
        if not bucket:
            return None, []
        # 找到第一个未使用的索引
        for idx in bucket:
            if idx not in used_indices:
                used_indices.add(idx)
                mol_atoms.append(all_atoms[idx])
                break
        else:
            return None, []

    # 多余的原子作为独立原子释放
    released = [atom for i, atom in enumerate(all_atoms) if i not in used_indices]

    # 如果未能凑齐产物需要的原子，反应失败
    if len(mol_atoms) < len(product_atom_symbols):
        return None, []

    return mol_atoms, released


def try_fusion(e1, e2, rel_speed, T_K=298):
    """尝试核聚变，返回 (新原子, 特效列表, 标签文本) 或 None

    高速碰撞 (>= FUSION_SPEED_THRESHOLD) 时调用 NUCLEAR_BINDING 表计算
    质子总数对应的核结合能差值，并生成对应等级的视觉特效。

    P0: 温度影响聚变阈值
    - 高温降低聚变阈值 (粒子动能已高, 需较小相对速度即可)
    - 低温需要更高相对速度 (热动能不足, 需碰撞动能补)
    """
    if not isinstance(e1, Atom) or not isinstance(e2, Atom):
        return None
    # 防御: 自身与自身聚变无意义
    if e1 is e2:
        return None
    # P0: 温度动态调整聚变阈值
    # 原理: 实际需要的相对动能 = 库仑势垒 - 粒子平均热动能
    #       平均热动能 = (3/2)kT
    #       在 1e7 K (恒星核心), kT ~ 1 keV, 显著降低所需碰撞速度
    # 简化: effective_threshold = base_threshold * (300 / T_K)^0.3
    #       T=300K → 1.0, T=2000K → ~0.58, T=10000K → ~0.36
    # 修复: T_K <= 0 时防御性
    if T_K > 0:
        ratio = 300.0 / T_K
        # 优化: 快速近似 ratio^0.3 (避免 pow 调用)
        # 实际: pow(300/T, 0.3), 但 (300/T) 极端时 (>100) 直接 clamp
        ratio = max(0.01, min(100.0, ratio))
        # 优化: 按 T_K 量化到 100K 桶缓存, 避免每次 pow 调用
        bucket = int(T_K // 100) * 100
        threshold_factor = _fusion_threshold_cache.get(bucket)
        if threshold_factor is None:
            threshold_factor = math.pow(ratio, 0.3)
            _fusion_threshold_cache[bucket] = threshold_factor
        eff_threshold = FUSION_SPEED_THRESHOLD * threshold_factor
    else:
        eff_threshold = FUSION_SPEED_THRESHOLD
    if rel_speed < eff_threshold:
        return None

    p1 = e1.protons
    p2 = e2.protons
    result = get_fusion_energy(p1, p2)
    if result[0] is None:
        return None

    total_p, energy, level = result

    # 修复: 用反向字典 O(1) 查找目标元素,避免每次聚变都线性扫描
    target_symbol = _PROTON_TO_SYMBOL.get(total_p)

    mx = (e1.x + e2.x) / 2
    my = (e1.y + e2.y) / 2

    # 创建新原子
    if target_symbol:
        new_atom = Atom(target_symbol, mx, my, 0, 0)
    else:
        # 超出预设范围，创建未知元素
        new_atom = _create_unknown_atom(total_p, mx, my)

    # 继承速度（按质量加权平均）
    m1 = e1.mass
    m2 = e2.mass
    total_m = m1 + m2
    if total_m > 0:
        new_atom.vx = (e1.vx * m1 + e2.vx * m2) / total_m
        new_atom.vy = (e1.vy * m1 + e2.vy * m2) / total_m

    # 聚变能量 kick: medium/high/extreme 等级给产物原子额外速度冲击
    if level in ("medium", "high", "extreme"):
        kick = energy * 0.05
        kick_angle = random.uniform(0, 2 * math.pi)
        new_atom.vx += math.cos(kick_angle) * kick
        new_atom.vy += math.sin(kick_angle) * kick

    # 视觉特效（按等级）
    effects = []
    eff = FUSION_EFFECTS[level]
    effects.append(FlashEffect(mx, my, e1.radius * eff["flash_radius"]))
    for _ in range(eff["particle_count"]):
        angle = random.uniform(0, 2 * math.pi)
        speed = random.uniform(2, eff["speed_mult"])
        color = (255, random.randint(100, 255), random.randint(50, 150))
        effects.append(BurstParticle(mx, my, speed, angle, color))
    effects.append(EnergyWave(mx, my, 120, 40))

    # 伽马光子 (medium/high/extreme 聚变释放 1-3 个伽马射线)
    if level in ("medium", "high", "extreme"):
        gamma_color = NUCLEAR_COLORS["gamma"]
        n_gamma = {"medium": 1, "high": 2, "extreme": 3}[level]
        for _ in range(n_gamma):
            a = random.uniform(0, 2 * math.pi)
            spd = random.uniform(15, 20)
            effects.append(PhotonParticle(mx, my, gamma_color, speed=spd, angle=a, lifetime=25))

    mev_text = f"{energy:.1f}"
    # P0: 聚变标签显示温度 (T 在 1e6+ 时用 "1M K" 格式)
    if T_K >= 1e6:
        t_label = f"T={T_K/1e6:.1f}M K"
    elif T_K >= 1e3:
        t_label = f"T={T_K/1e3:.1f}k K"
    else:
        t_label = f"T={T_K:.0f}K"
    if target_symbol:
        label = f"{e1.symbol} + {e2.symbol} → {target_symbol} + {mev_text} MeV ({t_label})"
    else:
        label = f"{e1.symbol} + {e2.symbol} → X(Z={total_p}) + {mev_text} MeV ({t_label})"

    return new_atom, effects, label, level


def _create_unknown_atom(protons, x, y):
    """创建未知元素原子"""
    a = Atom("H", x, y, 0, 0)
    a.protons = protons
    # 中子数估算: 轻元素 N≈P, 重元素 N≈1.5P
    a.neutrons = int(protons * 1.2)
    a.symbol = f"X{protons}"
    a.name = f"未知({protons})"
    a.color = (255, 100, 255)
    a.radius = 20 + protons * 2
    a.nucleus_radius = max(8, a.radius * 0.4)
    # 修复: 同步更新 nucleon_radius 使核内粒子大小与新 nucleus_radius 匹配
    a.nucleon_radius = max(2, min(4, a.nucleus_radius / max(1, (a.protons + a.neutrons) ** 0.5) * 1.5))
    a.mass = a.protons + a.neutrons
    # 重建电子（基于实际质子数）
    a.electrons = []
    base_radius = a.radius + 10
    orbits = {1: 2, 2: 8, 3: 18, 4: 32, 5: 32, 6: 18, 7: 8}
    remaining = a.protons
    orbit_idx = 0
    for layer, capacity in orbits.items():
        if remaining <= 0:
            break
        count = min(remaining, capacity)
        orbit_r = base_radius + layer * 18
        for i in range(count):
            e = Electron(a.x, a.y, orbit_r, orbit_idx, color=(80, 200, 255))
            e.angle = 2 * math.pi * i / count
            a.electrons.append(e)
        remaining -= count
        orbit_idx += 1
    # 重建粒子（基于实际质子/中子数）
    # 修复: 传入 nucleon_radius, 避免粒子用默认 radius
    a.proton_list = []
    for i in range(a.protons):
        angle = 2 * math.pi * i / max(1, a.protons)
        r = random.uniform(0, a.nucleus_radius * 0.5)
        a.proton_list.append(Proton(a.x + math.cos(angle) * r,
                                     a.y + math.sin(angle) * r,
                                     a.nucleus_radius,
                                     a.nucleon_radius))  # 修复: 传 nucleon_radius
    a.neutron_list = []
    for i in range(a.neutrons):
        angle = 2 * math.pi * i / max(1, a.neutrons)
        r = random.uniform(0, a.nucleus_radius * 0.5)
        a.neutron_list.append(Neutron(a.x + math.cos(angle) * r,
                                       a.y + math.sin(angle) * r,
                                       a.nucleus_radius,
                                       a.nucleon_radius))  # 修复: 传 nucleon_radius
    # 修复: 重建 electrons 后必须刷新 _orbit_radii 缓存, 否则 draw_atom 会 AttributeError
    a._refresh_orbit_cache()
    return a


def resolve_molecule_collision(m1, m2):
    """分子间弹性碰撞"""
    resolve_elastic_collision(m1, m2)


def resolve_atom_molecule_collision(atom, mol, T_K=298.0, P_atm=1.0, local_density=1.0):
    """原子与分子碰撞，返回 (新分子, 释放原子列表, 标签) 或 None

    处理顺序：
    1. 慢速碰撞 → 尝试化学反应
    2. 否则弹性碰撞

    注：高速核聚变由 main.py 在调用此函数前单独处理。

    修复: 透传 T_K/P_atm/local_density, 让原子-分子反应也受温度/气压/勒夏特列控制
    """
    # 慢速碰撞：尝试化学反应
    result = try_chemical_reaction(atom, mol, T_K=T_K, P_atm=P_atm, local_density=local_density)
    if result:
        return result

    # 否则弹性碰撞
    resolve_elastic_collision(atom, mol)
    return None


# ============================================================
# F1: 放射性衰变
# ============================================================
def try_radioactive_decay(atom, frame_count):
    """尝试放射性衰变 (演示半衰期模型)

    返回: (daughter_atom, ejectiles, effects_list, label) 或 None
    - daughter_atom: 子核原子
    - ejectiles: 释放出的粒子列表 (α=He原子, β=None)
    - effects_list: 特效列表
    - label: 显示标签
    """
    if not isinstance(atom, Atom):
        return None
    sym = atom.symbol
    iso = RADIOACTIVE_ISOTOPES.get(sym)
    if iso is None:
        return None

    half_life, decay_type, daughter_sym, ejectile_sym, energy_mev, flash_color = iso

    # 演示半衰期: 每帧衰变概率 p = 1 - 2^(-1/half_life)
    # 确保 half_live 帧后约一半衰变
    if half_life <= 0:
        p = 1.0
    else:
        p = 1.0 - math.pow(2.0, -1.0 / half_life)

    if random.random() > p:
        return None

    # 衰变发生!
    mx, my = atom.x, atom.y
    effects = []

    # 子核 (初始继承原子速度, 之后根据反冲修正)
    daughter = None
    daughter_mass = 1
    if daughter_sym in ELEMENTS:
        daughter = Atom(daughter_sym, mx, my, atom.vx, atom.vy)
        daughter_mass = daughter.mass

    # 发射粒子
    ejectiles = []
    ejectile = None
    if ejectile_sym and ejectile_sym in ELEMENTS:
        # α 粒子 (He 核): 高速发射
        angle = random.uniform(0, 2 * math.pi)
        speed = 4 + energy_mev * 0.5
        ejectile = Atom(ejectile_sym, mx, my,
                        math.cos(angle) * speed,
                        math.sin(angle) * speed)
        ejectiles.append(ejectile)
        # β 衰变: 释放高速电子 (用 BurstParticle 表示)
        if decay_type == "beta":
            for _ in range(8):
                a = random.uniform(0, 2 * math.pi)
                effects.append(BurstParticle(mx, my, random.uniform(3, 8), a,
                                             NUCLEAR_COLORS["beta"], lifetime=25))

    # 动量守恒反冲: 子核获得与射出粒子相反方向的动量
    # daughter.v = atom.v - (m_eject / m_daughter) * (v_eject - v_atom)
    if daughter is not None and ejectile is not None:
        m_e = ejectile.mass
        m_d = daughter.mass
        daughter.vx = atom.vx - (m_e / m_d) * (ejectile.vx - atom.vx)
        daughter.vy = atom.vy - (m_e / m_d) * (ejectile.vy - atom.vy)

    # 伽马光子 (1-2 个, α/β 衰变都释放)
    gamma_color = NUCLEAR_COLORS["gamma"]
    for _ in range(random.randint(1, 2)):
        a = random.uniform(0, 2 * math.pi)
        spd = random.uniform(15, 20)
        effects.append(PhotonParticle(mx, my, gamma_color, speed=spd, angle=a, lifetime=25))

    # 视觉特效
    effects.append(FlashEffect(mx, my, max_radius=80, duration=25, color=flash_color))
    effects.append(EnergyWave(mx, my, max_radius=100, duration=35))
    for _ in range(15):
        a = random.uniform(0, 2 * math.pi)
        spd = random.uniform(2, 6)
        effects.append(BurstParticle(mx, my, spd, a, flash_color))

    # 冲击波 (α/强衰变时)
    if energy_mev >= 4.0:
        effects.append(ShockWave(mx, my, speed=6, max_radius=200, life=50,
                                  color=flash_color))

    # 标签
    label_map = {"alpha": "α 衰变", "beta": "β⁻ 衰变"}
    decay_name = label_map.get(decay_type, "衰变")
    label = f"{sym} →{decay_name}→ {daughter_sym or '?'} + {energy_mev:.1f} MeV"

    return daughter, ejectiles, effects, label


# ============================================================
# F2: 核裂变
# ============================================================
def try_fission(atom, neutron=None):
    """尝试核裂变 (中子轰击 U-235 / Pu-239)

    返回: (fragments, new_neutrons, effects, label) 或 None
    - fragments: 裂变产物原子列表 (Ba + Kr)
    - new_neutrons: 新释放的自由中子列表
    - effects: 特效列表
    - label: 标签文本
    """
    if not isinstance(atom, Atom):
        return None
    sym = atom.symbol
    cfg = None
    if sym == "U":
        cfg = FISSION_CONFIG.get("U235")
    if cfg is None:
        return None

    # 需要中子轰击才能裂变 (模拟)
    if neutron is None:
        return None

    if random.random() > cfg["probability"]:
        return None

    mx, my = atom.x, atom.y
    energy = cfg["energy_mev"]
    effects = []

    # 裂变碎片: 两个产物核背向飞出
    # 质量数: Ba~141, Kr~92; 动量守恒 m1*v1 = m2*v2 → v_kr/v_ba = m_ba/m_kr ≈ 1.53
    angle = random.uniform(0, 2 * math.pi)
    # 重碎片 (Ba) 基础速度
    frag_speed_heavy = 2 + energy * 0.035
    # 质量比 (近似): Ba 约 141, Kr 约 92, ratio ≈ 1.53
    m_ba = 141
    m_kr = 92
    mass_ratio = m_ba / m_kr  # ~1.53
    frag_speed_light = frag_speed_heavy * mass_ratio
    fragments = []
    frag_angle = angle
    for idx, (frag_sym, frag_z) in enumerate(cfg["fragments"]):
        if frag_sym in ELEMENTS:
            fx = mx + math.cos(frag_angle) * 20
            fy = my + math.sin(frag_angle) * 20
            # 第一个碎片(Ba,重)用慢速，第二个(Kr,轻)用快速
            spd = frag_speed_heavy if idx == 0 else frag_speed_light
            fvx = math.cos(frag_angle) * spd + atom.vx
            fvy = math.sin(frag_angle) * spd + atom.vy
            frag = Atom(frag_sym, fx, fy, fvx, fvy)
            fragments.append(frag)
        frag_angle += math.pi  # 反向

    # 释放新中子 (2-3个随机方向, 触发链式反应)
    new_neutrons = []
    n_count = cfg["neutrons_released"] + random.randint(-1, 1)
    n_speed = cfg["neutron_speed"]
    for _ in range(max(2, n_count)):
        a = random.uniform(0, 2 * math.pi)
        nx = mx + math.cos(a) * 15
        ny = my + math.sin(a) * 15
        nvx = math.cos(a) * n_speed + random.uniform(-1, 1)
        nvy = math.sin(a) * n_speed + random.uniform(-1, 1)
        new_neutrons.append(FreeNeutron(nx, ny, nvx, nvy))

    # 伽马光子 (2-4 个, 200MeV 能量释放产生大量伽马射线)
    gamma_color = NUCLEAR_COLORS["gamma"]
    for _ in range(random.randint(2, 4)):
        a = random.uniform(0, 2 * math.pi)
        spd = random.uniform(15, 20)
        effects.append(PhotonParticle(mx, my, gamma_color, speed=spd, angle=a, lifetime=30))

    # 巨大特效: 200MeV 能量释放
    fission_color = NUCLEAR_COLORS["fission"]
    effects.append(FlashEffect(mx, my, max_radius=200, duration=35, color=fission_color))
    effects.append(ShockWave(mx, my, speed=10, max_radius=600, life=70,
                              color=(255, 200, 100)))
    for _ in range(50):
        a = random.uniform(0, 2 * math.pi)
        spd = random.uniform(3, 10)
        effects.append(BurstParticle(mx, my, spd, a, fission_color, lifetime=50))
    effects.append(EnergyWave(mx, my, max_radius=300, duration=50))

    label = f"{sym} 裂变! → {cfg['fragments'][0][0]}+{cfg['fragments'][1][0]} + {n_count}n + {energy} MeV"

    return fragments, new_neutrons, effects, label


# ============================================================
# F4: 动态温度计算
# ============================================================
def compute_kinetic_temperature(atoms, molecules, neutrons=None):
    """根据系统粒子平均动能计算温度 T (任意单位, 用于动态温度)

    T ~ <(1/2)mv²> * K
    K 是一个缩放系数, 将像素速度映射到 K 温度
    """
    total_ke = 0.0
    count = 0

    for a in atoms:
        v2 = a.vx * a.vx + a.vy * a.vy
        total_ke += 0.5 * a.mass * v2
        count += 1
    for m in molecules:
        v2 = m.vx * m.vx + m.vy * m.vy
        total_ke += 0.5 * m.mass * v2
        count += 1
    if neutrons:
        for n in neutrons:
            v2 = n.vx * n.vx + n.vy * n.vy
            total_ke += 0.5 * n.mass * v2
            count += 1

    if count == 0:
        return 300.0

    avg_ke = total_ke / count
    # K 缩放: 将像素速度映射到温度
    # 室温 (300K) 对应 ~速度0.5-1, 聚变温度 (1e7K) 对应 ~速度10+
    K = THERMAL_CONFIG["K_default"]
    T = avg_ke * K

    # Clamp 到合理范围
    return max(50.0, min(50000000.0, T))


# ============================================================
# 中子与原子碰撞 (裂变触发)
# ============================================================
def resolve_neutron_collision(neutron, atom):
    """自由中子与原子碰撞: 检查是否触发裂变, 否则弹性散射
    中子与原子核相互作用（不是电子云），碰撞截面使用 nucleus_radius
    """
    if not isinstance(atom, Atom):
        return None
    dx = atom.x - neutron.x
    dy = atom.y - neutron.y
    # 中子与原子核碰撞: 使用 nucleus_radius 而非 atom.radius (电子云半径)
    r_sum = atom.nucleus_radius + neutron.radius + 2
    if dx*dx + dy*dy >= r_sum*r_sum:
        return None

    # 尝试裂变
    fission_result = try_fission(atom, neutron)
    if fission_result:
        return ("fission", fission_result)

    # 弹性散射
    resolve_elastic_collision(neutron, atom)
    return ("scatter", None)


# ============================================================
# 冲击波施加力到物体
# ============================================================
def apply_shockwave_force(shockwave, obj):
    """对物体施加冲击波推力, 返回 True 表示受影响
    推力与质量成反比 (F=ma → a=F/m)；中子电中性，受力大幅减弱
    """
    fx = obj.x
    fy = obj.y
    force_info = shockwave.applies_force(fx, fy)
    if force_info is None:
        return False
    nx, ny, force = force_info
    # 质量依赖的速度增量: dv = force * k / m
    mass = getattr(obj, 'mass', 1)
    # 中子 (symbol=="n") 电中性，受力减为 0.2x
    is_neutron = getattr(obj, 'symbol', '') == 'n'
    force_mult = 0.2 if is_neutron else 1.0
    dv = force * 8 * force_mult / max(1, mass)
    obj.vx += nx * dv
    obj.vy += ny * dv
    return True