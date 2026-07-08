# config.py — 元素预设、颜色、物理常量、反应数据库

# ============================================================
# 导入完整元素周期表 (Z=1..118)
# ============================================================
from elements_data import (
    ELEMENTS as _ELEMENTS_RAW,
    NUCLEAR_BINDING_FULL,
    PROTON_TO_SYMBOL,
)

# 为每个元素补 "symbol" 字段 (现有代码 el['symbol'] 访问需要)
ELEMENTS = {}
for _sym, _el in _ELEMENTS_RAW.items():
    _entry = dict(_el)
    _entry["symbol"] = _sym
    ELEMENTS[_sym] = _entry
del _sym, _el, _ELEMENTS_RAW

# NUCLEAR_BINDING 使用完整 118 元素表 (兼容旧代码)
NUCLEAR_BINDING = NUCLEAR_BINDING_FULL

# ============================================================
# 窗口设置
# ============================================================
WINDOW_WIDTH = 1200
WINDOW_HEIGHT = 800
FPS = 60
BG_COLOR = (5, 5, 20)
STAR_COUNT = 200

# ============================================================
# 物理常量
# ============================================================
FUSION_SPEED_THRESHOLD = 8.0        # 超过此相对速度触发核聚变
FUSION_SPEED_THRESHOLD_SQ = FUSION_SPEED_THRESHOLD * FUSION_SPEED_THRESHOLD  # 平方值用于避免 sqrt
ENERGY_PULSE_STRENGTH = 3.0         # 释放能量强度
ENERGY_PULSE_DURATION = 60          # 释放能量持续时间（帧，1秒）
MAX_SPEED = 25.0                    # 最大速度（加快）
MAX_SPEED_SQ = MAX_SPEED * MAX_SPEED  # 平方值用于避免 sqrt
HYDROGEN_SPAWN_INTERVAL = 30        # 氢原子补充间隔（帧）
HYDROGEN_SPAWN_COUNT_MIN = 3        # 每次补充最少氢原子数
HYDROGEN_SPAWN_COUNT_MAX = 5        # 每次补充最多氢原子数

# ============================================================
# 元素分类中文标签 (覆盖所有 118 元素类别)
# ============================================================
CATEGORY_LABELS = {
    "nonmetal": "非金属",
    "halogen": "卤素",
    "noble_gas": "惰性气体",
    "alkali": "碱金属",
    "alkaline": "碱土金属",
    "metalloid": "类金属",
    "transition": "过渡金属",
    "post_transition": "后过渡金属",
    "lanthanide": "镧系",
    "actinide": "锕系",
}

# 惰性气体集合 (所有 7 种稀有气体)
NOBLE_GASES = {"He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"}

# ============================================================
# 化学反应数据库
# ============================================================
# 格式: (反应物1, 反应物2, 产物分子式, 键结构, 能量变化,
#        产物原子符号列表, 键连接方式)
# 产物原子符号列表: 明确产物分子包含哪些原子
# 键连接方式: "chain"=直线链, "bent"=弯曲, "ring"=环形, "complex"=复杂
# 注意: 反应式已简化为碰撞双方各消耗1个实体
REACTIONS = [
    # === 非金属 + 非金属 化合 ===
    ("H", "H", "H2", "H-H", "放热", ["H", "H"], "chain"),
    ("H2", "O", "H2O", "H-O-H", "放热", ["H", "O", "H"], "bent"),
    ("O", "O", "O2", "O=O", "放热", ["O", "O"], "chain"),
    ("C", "O2", "CO2", "O=C=O", "放热", ["O", "C", "O"], "chain"),
    ("C", "O", "CO", "C≡O", "放热", ["C", "O"], "chain"),
    ("CO", "O", "CO2", "O=C=O", "放热", ["O", "C", "O"], "chain"),
    ("N", "N", "N2", "N≡N", "放热", ["N", "N"], "chain"),
    # 修复: N2 + H2 → NH2 配平错误 (应为 NH3 反应或 N2 + 3H2 → 2NH3, 简化为 NH 配对)
    ("N2", "H2", "N2H2", "H-N=N-H", "放热", ["N", "H", "H", "N"], "chain"),
    ("H2", "S", "H2S", "H-S-H", "放热", ["H", "S", "H"], "bent"),
    ("S", "O2", "SO2", "O=S=O", "放热", ["O", "S", "O"], "bent"),
    # 修复: SO3 应含 1S+3O, 修正产物列表
    ("SO2", "O", "SO3", "O-S-O-O", "放热", ["S", "O", "O", "O"], "bent"),
    # 修复: H2 + F2 → 2HF, 简化为 1HF + 释放 1H+1F
    ("H2", "F2", "HF", "H-F", "放热", ["H", "F"], "chain"),
    ("H2", "Cl2", "HCl", "H-Cl", "放热", ["H", "Cl"], "chain"),
    # 修复: C + H2 → CH4 (甲烷) 更稳定
    ("C", "H2", "CH2", "C-H-H", "放热", ["C", "H", "H"], "complex"),
    ("Si", "O2", "SiO2", "O=Si=O", "放热", ["O", "Si", "O"], "chain"),
    ("B", "O2", "BO2", "复杂", "放热", ["B", "O", "O"], "complex"),
    ("P", "O2", "PO2", "复杂", "放热", ["P", "O", "O"], "complex"),
    # 修复: H2 + O2 → H2O2 (过氧化氢) 更符合化学配平
    ("H2", "O2", "H2O2", "H-O-O-H", "放热", ["H", "O", "O", "H"], "bent"),

    # === 金属 + 非金属 ===
    # 修复: 命名规范, Li + O2 → Li2O (释放 1O)
    ("Li", "O2", "LiO", "Li-O", "放热", ["Li", "O"], "chain"),
    ("Na", "O2", "NaO", "Na-O", "放热", ["Na", "O"], "chain"),
    ("Mg", "O2", "MgO", "Mg=O", "放热", ["Mg", "O"], "chain"),
    ("Ca", "O2", "CaO", "Ca=O", "放热", ["Ca", "O"], "chain"),
    ("Al", "O2", "AlO2", "复杂", "放热", ["Al", "O", "O"], "complex"),
    ("Be", "O2", "BeO", "Be=O", "放热", ["Be", "O"], "chain"),
    ("Fe", "O2", "FeO2", "复杂", "放热", ["Fe", "O", "O"], "complex"),

    ("Na", "Cl2", "NaCl", "Na-Cl", "放热", ["Na", "Cl"], "chain"),
    ("Mg", "Cl2", "MgCl2", "Cl-Mg-Cl", "放热", ["Mg", "Cl", "Cl"], "bent"),
    ("Ca", "Cl2", "CaCl2", "Cl-Ca-Cl", "放热", ["Ca", "Cl", "Cl"], "bent"),
    ("Li", "Cl2", "LiCl", "Li-Cl", "放热", ["Li", "Cl"], "chain"),
    ("Al", "Cl2", "AlCl2", "三角平面", "放热", ["Al", "Cl", "Cl"], "complex"),
    ("K", "Cl2", "KCl", "K-Cl", "放热", ["K", "Cl"], "chain"),
    ("Fe", "Cl2", "FeCl2", "三角平面", "放热", ["Fe", "Cl", "Cl"], "complex"),

    # 修复: MgN2, CaN2, LiN → 改为单一 N 原子的简化配平
    ("Mg", "N2", "MgN2", "N-Mg-N", "放热", ["Mg", "N", "N"], "chain"),
    ("Ca", "N2", "CaN2", "N-Ca-N", "放热", ["Ca", "N", "N"], "chain"),
    ("Li", "N2", "LiN", "Li-N", "放热", ["Li", "N"], "chain"),
    ("Si", "C", "SiC", "Si≡C", "放热", ["Si", "C"], "chain"),

    # === 金属 + 水（产生分子 + 释放 H₂ 原子） ===
    ("Na", "H2O", "NaOH", "Na-O-H", "放热", ["Na", "O", "H"], "bent"),
    # 修复: Ca(OH)2 分子式与产物列表不一致, 改为 CaOH (简化)
    ("Ca", "H2O", "CaOH", "Ca-O-H", "放热", ["Ca", "O", "H"], "bent"),
    ("Li", "H2O", "LiOH", "Li-O-H", "放热", ["Li", "O", "H"], "bent"),
    ("K", "H2O", "KOH", "K-O-H", "放热", ["K", "O", "H"], "bent"),
    ("Mg", "H2O", "MgO", "Mg=O", "放热", ["Mg", "O"], "chain"),

    # 修复: NaO + CO2 → NaCO3 命名错误, 简化为 NaO + CO2 → NaO-CO2 分子
    ("NaO", "CO2", "NaOCO2", "Na-O-CO-O", "放热", ["Na", "O", "C", "O"], "bent"),
    # 修复: CaO + CO2 → CaCO3 分子式与产物列表 3 原子不一致, 改为 CaO + CO2 → CaOCO2 (4 原子)
    ("CaO", "CO2", "CaOCO2", "Ca-O-CO-O", "放热", ["Ca", "O", "C", "O"], "bent"),

    # === 酸 + 碱中和 ===
    ("NaOH", "HCl", "NaCl", "Na-Cl", "放热", ["Na", "Cl"], "chain"),
    # 修复: CaCl 应为 CaCl2 (消耗 2HCl), 简化为 CaCl
    ("Ca(OH)2", "HCl", "CaCl", "Ca-Cl", "放热", ["Ca", "Cl"], "chain"),
    ("KOH", "HCl", "KCl", "K-Cl", "放热", ["K", "Cl"], "chain"),

    # === 吸热反应 ===
    ("N2", "O2", "NO", "N=O", "吸热", ["N", "O"], "chain"),
    # 修复: C + CO2 → 2CO (Boudouard 反应, 碳气化), 简化为 1CO + 释放 1C+1O
    # 实际反应是 1C + 1CO2 = 2CO, 产物 CO 数量为 2,释放 1O 后变成 1CO + 1C + 1O
    # 保留简化为 1CO + 释放 1C+1O 的形式
    ("C", "CO2", "CO", "C≡O", "吸热", ["C", "O"], "chain"),
    # 修复: H2 + CO2 → CO + H2O (水煤气变换), 简化为 CO + 释放 H+OH
    ("H2", "CO2", "CO", "C≡O", "吸热", ["C", "O"], "chain"),

    # === 补充常见反应 (P0-5) ===
    # 甲烷燃烧: CH4 + 2O2 → CO2 + 2H2O, 简化为 1CH2 + 1O2 → 1H2O + 1CO (释放 C+OH)
    ("CH2", "O2", "CO2", "O=C=O", "放热", ["O", "C", "O"], "chain"),
    # NH3 合成: N2 + 3H2 → 2NH3, 简化为 N2 + H2 → 1NH + 释放 NH (二聚物)
    ("N2", "H2", "N2H2", "H-N=N-H", "放热", ["N", "H", "H", "N"], "chain"),
    # 钠与水: 已有
    # 氯 + 钠: 已有 (NaCl)
    # 氨气: N + 3H → NH3, 简化为 N + H → NH (二聚物)
    ("N", "H2", "NH2", "H-N-H", "放热", ["H", "N", "H"], "bent"),
    # 硫酸: SO3 + H2O → H2SO4, 简化为 1SO2 + 1H2O → 1H2SO3 (亚硫酸, 更稳定)
    ("SO3", "H2O", "H2SO4", "H-O-S-O-O-H", "放热", ["H", "O", "S", "O", "O", "H"], "chain"),
    # 碳酸盐分解: CaO + CO2 → CaCO3 (已有 CaOCO2)
    # 硅烷: Si + 2H2 → SiH4, 简化为 Si + H2 → SiH2
    ("Si", "H2", "SiH2", "H-Si-H", "放热", ["H", "Si", "H"], "bent"),
    # 氧化铝: 2Al + 3O2 → 2Al2O3, 简化为 Al + O2 → AlO2 (已有)
    # 硫酸: H2 + S → H2S (已有)
    # 氧化铁: 4Fe + 3O2 → 2Fe2O3, 简化为 Fe + O2 → FeO2 (已有)
    # 碘化氢: 类比 HCl, H2 + I (但 I 元素未在表)
    # 硝酸: N2 + 5O2 + 2H2O → 2HNO3 + ... 太复杂, 简化为 NO2 + H2O → HNO3 + NO
    ("NO", "O2", "NO2", "O=N=O", "放热", ["O", "N", "O"], "bent"),
    # 氧化钙: Ca + O2 → CaO (已有)
    # 过氧化氢分解: 2H2O2 → 2H2O + O2, 简化为 H2O2 → H2O + O
    ("H2O2", "H2", "H2O", "H-O-H", "放热", ["H", "O", "H"], "bent"),
    # 盐酸 + NaOH → NaCl + H2O (已有 HCl + NaOH)
    # 镁 + HCl: Mg + 2HCl → MgCl2 + H2
    ("Mg", "HCl", "MgCl2", "Cl-Mg-Cl", "放热", ["Mg", "Cl", "Cl"], "bent"),
    # 磷 + O2 → P2O5, 简化为 P + O2 → PO2 (已有)
    # 硅 + HCl: Si + 4HCl → SiCl4 + 2H2, 简化为 Si + HCl → SiHCl
    ("Si", "HCl", "SiHCl", "H-Si-Cl", "放热", ["H", "Si", "Cl"], "chain"),
    # 钠 + S: 2Na + S → Na2S, 简化为 Na + S → NaS
    ("Na", "S", "NaS", "Na-S", "放热", ["Na", "S"], "chain"),
    # 铝 + S: 2Al + 3S → Al2S3, 简化为 Al + S → AlS
    ("Al", "S", "AlS", "Al=S", "放热", ["Al", "S"], "chain"),
    # 氰化氢: H2 + N2 + C → 2HCN 太复杂, 跳过
    # 氧化铁 + CO: FeO2 + CO → Fe + CO2, 高炉反应
    ("FeO2", "CO", "Fe", "Fe", "放热", ["Fe"], "chain"),
]

# ============================================================
# 反应闪光颜色 (F0 颜色体系): 基于真实火焰/反应色
# ============================================================
REACTION_FLASH_COLORS = {
    # key: (reactant1, reactant2) → RGB
    # 氢氧燃烧
    ("H", "H"):     (200, 220, 255),   # H2 形成
    ("H2", "O"):    (180, 220, 255),   # H2O 形成 (氢氧焰淡蓝)
    ("H2", "O2"):   (255, 200, 100),   # H2O2 形成
    ("O", "O"):     (255, 200, 180),   # O2 形成
    # 碳燃烧
    ("C", "O2"):    (255, 140, 50),    # CO2 (碳燃烧橙红)
    ("C", "C"):     (220, 200, 180),   # 碳碳键
    ("C", "H2"):    (180, 220, 255),   # CH2 (甲烷无色)
    ("CH2", "O2"):  (200, 200, 255),   # CO2 形成 (甲烷燃烧蓝焰)
    # 金属燃烧
    ("Mg", "O2"):   (255, 255, 220),   # MgO (镁燃烧耀眼白)
    ("Na", "Cl2"):  (255, 220, 80),    # NaCl (钠在氯中黄焰)
    ("Na", "O2"):   (255, 180, 50),    # NaO (钠燃烧黄)
    ("Na", "H2O"):  (255, 150, 50),    # NaOH (钠水反应橙)
    ("Li", "Cl2"):  (200, 80, 200),    # LiCl (锂紫红)
    ("K", "Cl2"):   (180, 80, 255),    # KCl (钾紫)
    ("K", "H2O"):   (200, 100, 255),   # KOH (钾水反应紫)
    ("Ca", "O2"):   (255, 180, 80),    # CaO (钙橙红)
    ("Ca", "Cl2"):  (255, 160, 60),    # CaCl2 (钙橙)
    ("Fe", "O2"):   (220, 100, 80),    # FeO2 (铁锈红)
    ("Fe", "Cl2"):  (255, 180, 100),   # FeCl2
    ("Al", "O2"):   (255, 240, 220),   # AlO2 (铝燃烧白)
    # 硫燃烧
    ("S", "O2"):    (100, 150, 255),   # SO2 (硫燃烧蓝焰)
    ("S", "H2"):    (255, 220, 80),    # H2S
    # 氮反应
    ("N", "N"):     (180, 180, 255),   # N2
    ("N2", "O2"):   (150, 150, 200),   # NO (吸热反应，弱色)
    ("N", "H2"):    (180, 220, 255),   # NH2
    # 卤素
    ("H2", "Cl2"):  (100, 255, 100),   # HCl (氯气绿色)
    ("H2", "F2"):   (255, 255, 255),   # HF (强烈反应白)
    # 硅
    ("Si", "O2"):   (255, 200, 150),   # SiO2 (石英无色)
    ("Si", "C"):    (80, 80, 100),     # SiC (碳化硅黑/深色)
}

def get_reaction_flash_color(r1, r2):
    """获取反应闪光颜色，使用查表 + 基于能量的默认色"""
    key = (r1, r2)
    rev_key = (r2, r1)
    if key in REACTION_FLASH_COLORS:
        return REACTION_FLASH_COLORS[key]
    if rev_key in REACTION_FLASH_COLORS:
        return REACTION_FLASH_COLORS[rev_key]
    # 默认色: 蓝白色 (通用放热反应)
    return (220, 230, 255)

# ============================================================
# 反应条件元数据 (温度 + 气压)
# ============================================================
# 温度单位: K (开尔文)
# 气压单位: atm
# 每个反应可声明:
#   - temp_min / temp_optimum / temp_max: 温度窗口 (K)
#   - Ea: 活化能 (kJ/mol), 用于 Arrhenius 公式
#   - pressure_min / pressure_optimum / pressure_max: 气压窗口
#   - reversible: 是否可逆反应 (勒夏特列原理)
#   - delta_H: 反应焓变 (kJ/mol), 正=吸热, 负=放热
# 未声明的反应默认在常温常压下都能发生 (legacy 兼容)
#
# 物理原理:
#   1. 温度高 → 分子动能高 → 突破 Ea 概率大 → 反应速率 ↑
#   2. 气压高 → 浓度大 → 碰撞频率 ↑ → 反应速率 ↑ (理想气体 PV=nRT)
#   3. 温度影响平衡: 放热反应低温有利, 吸热反应高温有利
#
# 典型活化能参考:
#   H + H → H2:     Ea ≈ 0 kJ/mol (无势垒, 实际量子隧穿)
#   N2 + 3H2 → 2NH3: Ea ≈ 230 kJ/mol (高温高压催化剂)
#   C + O2 → CO2:   Ea ≈ 120 kJ/mol
#   2H2 + O2 → 2H2O: Ea ≈ 200 kJ/mol
#   分解反应 (如 CaCO3 → CaO + CO2): 高温驱动
#   燃烧反应: 需达到燃点

# 反应条件注册表 (key: 产物分子 formula, 备用: 任意正向匹配)
# 注意: 这里用 formula 作为 key, 因为同一产物可能由不同反应物生成
REACTION_CONDITIONS = {
    # H2O 水的生成
    "H2O":    {"temp_min": 0,    "temp_optimum": 600,  "temp_max": 3000, "Ea": 50,   "pressure_min": 0.5, "pressure_max": 10, "reversible": True,  "delta_H": -286},
    # H2 氢分子 (H+H 几乎无势垒, 但需要足够动能)
    "H2":     {"temp_min": 0,    "temp_optimum": 300,  "temp_max": 5000, "Ea": 0,    "pressure_min": 0,   "pressure_max": 100, "reversible": True,  "delta_H": -436},
    # CO2 二氧化碳 (燃烧产物, 需高温点火, 放热)
    "CO2":    {"temp_min": 200,  "temp_optimum": 1000, "temp_max": 5000, "Ea": 120,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -394},
    # CO 一氧化碳 (不完全燃烧, 高温)
    "CO":     {"temp_min": 400,  "temp_optimum": 1500, "temp_max": 5000, "Ea": 150,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -111},
    # NH3 氨气 (Haber-Bosch 高温高压, 实际需催化剂)
    "NH3":    {"temp_min": 600,  "temp_optimum": 800,  "temp_max": 1500, "Ea": 230,  "pressure_min": 100, "pressure_max": 1000,"reversible": True,  "delta_H": -46},
    # CH4 甲烷
    "CH4":    {"temp_min": 100,  "temp_optimum": 600,  "temp_max": 2500, "Ea": 80,   "pressure_min": 0.5, "pressure_max": 50, "reversible": True,  "delta_H": -75},
    # HCl 氯化氢
    "HCl":    {"temp_min": 0,    "temp_optimum": 400,  "temp_max": 3000, "Ea": 20,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -92},
    # NaCl 氯化钠 (离子化合物, 任何条件下都生成)
    "NaCl":   {"temp_min": 0,    "temp_optimum": 300,  "temp_max": 5000, "Ea": 0,    "pressure_min": 0,   "pressure_max": 1000,"reversible": False, "delta_H": -411},
    # MgO 氧化镁 (镁燃烧)
    "MgO":    {"temp_min": 600,  "temp_optimum": 1200, "temp_max": 5000, "Ea": 200,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -602},
    # H2S 硫化氢
    "H2S":    {"temp_min": 0,    "temp_optimum": 500,  "temp_max": 3000, "Ea": 30,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -21},
    # NaOH 氢氧化钠
    "NaOH":   {"temp_min": 0,    "temp_optimum": 400,  "temp_max": 2000, "Ea": 40,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -425},
    # NH4Cl 氯化铵
    "NH4Cl":  {"temp_min": 0,    "temp_optimum": 500,  "temp_max": 2000, "Ea": 50,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -314},
    # SiO2 二氧化硅
    "SiO2":   {"temp_min": 800,  "temp_optimum": 1500, "temp_max": 5000, "Ea": 300,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -911},
    # Al2O3 氧化铝
    "Al2O3":  {"temp_min": 800,  "temp_optimum": 1500, "temp_max": 5000, "Ea": 280,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -1676},
    # FeO / Fe2O3 氧化铁
    "FeO2":   {"temp_min": 600,  "temp_optimum": 1200, "temp_max": 5000, "Ea": 180,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -824},
    # CaO 氧化钙
    "CaO":    {"temp_min": 500,  "temp_optimum": 1000, "temp_max": 5000, "Ea": 200,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -635},
    # CaCO3 碳酸钙 (高温分解, 可逆)
    "CaOCO2": {"temp_min": 0,    "temp_optimum": 800,  "temp_max": 5000, "Ea": 150,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -120},
    # Na2O 氧化钠
    "Na2O":   {"temp_min": 100,  "temp_optimum": 600,  "temp_max": 5000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -416},
    # Li2O 氧化锂
    "Li2O":   {"temp_min": 200,  "temp_optimum": 700,  "temp_max": 5000, "Ea": 120,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -596},
    # LiH 氢化锂
    "LiH":    {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 80,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -90},
    # BeH2 氢化铍
    "BeH2":   {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -127},
    # HHe 氢氦 (实际不存在, 但仿星器中可见)
    "HHe":    {"temp_min": 0,    "temp_optimum": 200,  "temp_max": 1000, "Ea": 5,    "pressure_min": 0,   "pressure_max": 100, "reversible": True,  "delta_H": 0},
    # NH2 氨基 (氨合成中间体)
    "NH2":    {"temp_min": 300,  "temp_optimum": 800,  "temp_max": 2000, "Ea": 150,  "pressure_min": 1,   "pressure_max": 200, "reversible": True,  "delta_H": 0},
    # NO 一氧化氮 (高温)
    "NO":     {"temp_min": 1500, "temp_optimum": 2500, "temp_max": 5000, "Ea": 318,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": 91},
    # NO2 二氧化氮
    "NO2":    {"temp_min": 300,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": 33},
    # SO2 二氧化硫
    "SO2":    {"temp_min": 300,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 120,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -297},
    # SO3 三氧化硫
    "SO3":    {"temp_min": 400,  "temp_optimum": 700,  "temp_max": 3000, "Ea": 200,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True,  "delta_H": -396},
    # H2SO4 硫酸
    "H2SO4":  {"temp_min": 0,    "temp_optimum": 500,  "temp_max": 2000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -735},
    # SiH2 硅烷
    "SiH2":   {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -50},
    # MgCl2 氯化镁
    "MgCl2":  {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 80,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -641},
    # SiHCl 三氯氢硅
    "SiHCl":  {"temp_min": 400,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 150,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -150},
    # NaS 硫化钠
    "NaS":    {"temp_min": 100,  "temp_optimum": 500,  "temp_max": 3000, "Ea": 80,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -350},
    # AlS 硫化铝
    "AlS":    {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 120,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -200},
    # CaOH 氢氧化钙
    "CaOH":   {"temp_min": 0,    "temp_optimum": 400,  "temp_max": 2000, "Ea": 50,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -234},
    # N2H2 二胺
    "N2H2":   {"temp_min": 400,  "temp_optimum": 1000, "temp_max": 3000, "Ea": 200,  "pressure_min": 50,  "pressure_max": 500, "reversible": True, "delta_H": 50},
    # H2O2 过氧化氢 (实际是分解反应, 这里简化为生成)
    "H2O2":   {"temp_min": 0,    "temp_optimum": 300,  "temp_max": 1500, "Ea": 30,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -191},
    # === 补充缺失的反应条件 (P1-config-fix) ===
    # O2 氧气 (双原子, 几乎无势垒, 但需足够动能)
    "O2":     {"temp_min": 0,    "temp_optimum": 500,  "temp_max": 5000, "Ea": 5,    "pressure_min": 0,   "pressure_max": 100, "reversible": True, "delta_H": -498},
    # N2 氮气 (三键, 极高活化能, Haber-Bosch)
    "N2":     {"temp_min": 0,    "temp_optimum": 800,  "temp_max": 5000, "Ea": 945,  "pressure_min": 0.1, "pressure_max": 1000, "reversible": True, "delta_H": -945},
    # HF 氟化氢
    "HF":     {"temp_min": 0,    "temp_optimum": 300,  "temp_max": 2000, "Ea": 10,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -567},
    # CH2 亚甲基 (甲烷前体, 高活性)
    "CH2":    {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": 0},
    # 金属氧化物 (单原子+单原子)
    "LiO":    {"temp_min": 100,  "temp_optimum": 600,  "temp_max": 5000, "Ea": 80,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -300},
    "NaO":    {"temp_min": 100,  "temp_optimum": 600,  "temp_max": 5000, "Ea": 80,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -250},
    "BeO":    {"temp_min": 400,  "temp_optimum": 1000, "temp_max": 5000, "Ea": 150,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -610},
    "AlO2":   {"temp_min": 400,  "temp_optimum": 1000, "temp_max": 5000, "Ea": 180,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -560},
    "BO2":    {"temp_min": 500,  "temp_optimum": 1000, "temp_max": 5000, "Ea": 200,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -300},
    "PO2":    {"temp_min": 300,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 120,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -280},
    # 氯化物
    "CaCl2":  {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 60,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -795},
    "LiCl":   {"temp_min": 0,    "temp_optimum": 400,  "temp_max": 3000, "Ea": 30,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -408},
    "AlCl2":  {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -500},
    "KCl":    {"temp_min": 0,    "temp_optimum": 400,  "temp_max": 3000, "Ea": 30,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -436},
    "FeCl2":  {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -341},
    "CaCl":   {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 60,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -400},
    # 氮化物
    "MgN2":   {"temp_min": 600,  "temp_optimum": 1500, "temp_max": 5000, "Ea": 250,  "pressure_min": 1,   "pressure_max": 200, "reversible": True, "delta_H": -462},
    "CaN2":   {"temp_min": 600,  "temp_optimum": 1500, "temp_max": 5000, "Ea": 250,  "pressure_min": 1,   "pressure_max": 200, "reversible": True, "delta_H": -431},
    "LiN":    {"temp_min": 200,  "temp_optimum": 800,  "temp_max": 3000, "Ea": 100,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -150},
    # 碳化硅
    "SiC":    {"temp_min": 1500, "temp_optimum": 2500, "temp_max": 5000, "Ea": 200,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -73},
    # 氢氧化物
    "LiOH":   {"temp_min": 0,    "temp_optimum": 400,  "temp_max": 2000, "Ea": 40,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -485},
    "KOH":    {"temp_min": 0,    "temp_optimum": 400,  "temp_max": 2000, "Ea": 40,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -424},
    "NaOCO2": {"temp_min": 100,  "temp_optimum": 600,  "temp_max": 3000, "Ea": 50,   "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": -400},
    # 金属单质 (高炉反应)
    "Fe":     {"temp_min": 600,  "temp_optimum": 1500, "temp_max": 5000, "Ea": 200,  "pressure_min": 0.1, "pressure_max": 50, "reversible": True, "delta_H": 0},
}

# ============================================================
# 全局热力学参数 (用户可调)
# ============================================================
# 温度预设 (K)
TEMPERATURE_PRESETS = {
    "cryogenic": 50,       # 液氦温度
    "cold":      200,      # 极冷 (南极冬季)
    "ambient":   298,      # 标准室温
    "warm":      500,      # 热水
    "hot":       1000,     # 炽热
    "flame":     2000,     # 火焰
    "sun":       5800,     # 太阳表面
    "star_core": 15000000, # 恒星核心
}

# 气压预设 (atm)
PRESSURE_PRESETS = {
    "vacuum":     1e-10,   # 真空
    "low":        0.1,     # 高空
    "ambient":    1.0,     # 海平面
    "high":       10,      # 工业高压
    "extreme":    200,     # 深海 / 高压釜
    "diamond":    30000,   # 钻石生成压
    "jupiter":    1000000, # 木星核心
}

# 温度 → 颜色 (热辐射近似, 维恩位移定律简化)
def temperature_to_color(T):
    """根据温度估算热辐射颜色 (K → RGB)
    简化模型:
      T < 800K:  暗灰 → 暗红平滑过渡 (修复: 修复 800K 处的不连续)
      800-1500:  暗红
      1500-3000: 橙红
      3000-5500: 黄白
      5500-8000: 白
      > 8000:    蓝白
    """
    if T < 800:
        # 修复: 0..800K 平滑过渡到 800K 的暗红 (60,20,20), 避免突变
        t = T / 800.0
        return (int(40 + 20 * t), int(40 - 20 * t), int(50 - 30 * t))
    elif T < 1500:
        t = (T - 800) / 700
        return (int(60 + 195 * t), int(20 + 50 * t), int(20 + 30 * t))
    elif T < 3000:
        t = (T - 1500) / 1500
        return (255, int(80 + 120 * t), int(20 + 30 * t))
    elif T < 5500:
        t = (T - 3000) / 2500
        return (255, int(200 + 55 * t), int(50 + 100 * t))
    elif T < 8000:
        t = (T - 5500) / 2500
        return (255, 255, int(150 + 105 * t))
    elif T < 15000:
        t = (T - 8000) / 7000
        return (int(255 - 100 * t), int(255 - 30 * t), 255)
    else:
        return (155, 225, 255)

# 物理常量
R_GAS = 8.314  # 理想气体常数 J/(mol·K)
AVOGADRO = 6.022e23  # 阿伏伽德罗常数
KB = 1.381e-23  # 玻尔兹曼常数 J/K

# ============================================================
# 核聚变能量等级映射
# ============================================================
# 物理: 铁-56 (Z=26) 是结合能每核子的峰值, 超过铁的聚变是吸能反应
# 简化: 反应物中任一质子数 >= 26 (Fe) 时聚变不释放能量
FUSION_IRON_PEAK = 26

def get_fusion_energy(p1, p2):
    """计算两个质子数聚变后的能量

    返回 (total_p, energy_delta, level) 或 (None, 0, "low") 当不能聚变。

    物理规则:
    - H→Fe: 聚变放能 (binding energy 递增)
    - Fe 及以上: 聚变吸能, 返回 None
    - Z > 118: 超出元素周期表, 返回 None
    """
    total_p = p1 + p2
    # 铁峰以上聚变吸能 (简化物理模型)
    if max(p1, p2) >= FUSION_IRON_PEAK:
        return None, 0, "low"
    if total_p > 118:
        return None, 0, "low"
    e1 = NUCLEAR_BINDING.get(p1, 0)
    e2 = NUCLEAR_BINDING.get(p2, 0)
    e_total = NUCLEAR_BINDING.get(total_p, 0)
    if e_total == 0 and total_p <= 26:
        # 插值估算 (轻元素间)
        if total_p >= 4:
            e_total = total_p * total_p * 0.4
        elif total_p >= 2:
            e_total = total_p * 2.0
        else:
            e_total = 0
    delta = e_total - e1 - e2
    if delta <= 0:
        return None, 0, "low"
    if delta > 20:
        return total_p, delta, "extreme"
    elif delta > 10:
        return total_p, delta, "high"
    elif delta > 5:
        return total_p, delta, "medium"
    else:
        return total_p, delta, "low"

# 能量等级 → 特效参数
FUSION_EFFECTS = {
    "extreme": {"flash_radius": 8, "particle_count": 30, "speed_mult": 6},
    "high":     {"flash_radius": 5, "particle_count": 20, "speed_mult": 4},
    "medium":   {"flash_radius": 3, "particle_count": 12, "speed_mult": 3},
    "low":      {"flash_radius": 2, "particle_count": 6,  "speed_mult": 2},
}

# ============================================================
# 能量 → 颜色映射 (F0 颜色体系)
# ============================================================
def energy_to_color(energy_mev, mode="fire"):
    """能量值映射到颜色, 模拟热辐射 + 物理色
    mode:
      - "fire": 黑体辐射 (低能暗红→中能橙→高能黄白→极高能蓝白)
      - "particle": 粒子速度→轨迹色 (慢绿→中黄→快红→极快蓝)
    """
    if mode == "fire":
        e = abs(energy_mev)
        if e < 0.1:
            return (60, 60, 80)
        elif e < 1:
            return (180, 60, 40)
        elif e < 10:
            return (255, 120, 40)
        elif e < 50:
            return (255, 220, 80)
        elif e < 200:
            return (255, 255, 200)
        else:
            return (200, 220, 255)
    elif mode == "particle":
        v = abs(energy_mev)
        if v < 1:
            return (100, 255, 100)
        elif v < 5:
            return (255, 255, 100)
        elif v < 20:
            return (255, 150, 80)
        else:
            return (120, 180, 255)
    return (255, 255, 255)

# 核物理约定色
NUCLEAR_COLORS = {
    "alpha":    (255, 200, 80),   # α 粒子 (He 核) 黄
    "beta":     (100, 180, 255),  # β 电子 蓝白 (切伦科夫辐射)
    "gamma":    (220, 255, 255),  # γ 射线 蓝白
    "neutron":  (150, 150, 150),  # 中子 灰
    "fission":  (200, 220, 255),  # 裂变闪光 蓝白 (200MeV)
}

# ============================================================
# 电子颜色 (按元素类别区分, 焰色反应/光谱色)
# ============================================================
ELECTRON_COLORS = {
    "nonmetal":       (120, 200, 255),   # 非金属: 青蓝
    "halogen":        (150, 255, 120),   # 卤素: 黄绿 (氯气色)
    "noble_gas":      (255, 180, 255),   # 惰性气体: 粉紫 (霓虹灯)
    "alkali":         (255, 180, 80),    # 碱金属: 橙金 (焰色反应)
    "alkaline":       (255, 150, 100),   # 碱土金属: 橙红
    "metalloid":      (180, 220, 180),   # 类金属: 浅绿
    "transition":     (200, 210, 230),   # 过渡金属: 银白
    "post_transition":(200, 220, 200),   # 后过渡金属: 银绿
    "lanthanide":     (255, 200, 150),   # 镧系: 浅橙
    "actinide":       (120, 255, 150),   # 锕系: 荧光绿 (放射性)
}

# 质子/中子高光颜色
PROTON_COLOR = (255, 100, 100)
NEUTRON_COLOR = (180, 180, 200)
NUCLEON_HIGHLIGHT = (255, 255, 255, 180)  # 核子高光点

# ============================================================
# 放射性衰变配置 (F1)
# 演示半衰期 (帧@60FPS): 真实半衰期太长, 演示用 60s 内可见
# ============================================================
RADIOACTIVE_ISOTOPES = {
    # symbol: (half_life_frames, decay_type, daughter_symbol, ejectile, energy_mev, flash_color)
    # 演示半衰期: 缩短至 5-15 秒可见 (60FPS)
    # α 衰变: 释放 He (α 粒子), 子核 Z-2
    "U":  (480,  "alpha", "Th", "He", 4.2,  NUCLEAR_COLORS["alpha"]),   # 8s
    "Pu": (300,  "alpha", "U",  "He", 5.5,  NUCLEAR_COLORS["alpha"]),   # 5s
    "Th": (420,  "alpha", "Ra", "He", 4.0,  NUCLEAR_COLORS["alpha"]),   # 7s
    "Ra": (240,  "beta",  "Ac", None, 0.2,  NUCLEAR_COLORS["beta"]),    # 4s
    "Rn": (180,  "alpha", "Po", "He", 5.6,  NUCLEAR_COLORS["alpha"]),   # 3s
    "Po": (120,  "alpha", "Pb", "He", 5.4,  NUCLEAR_COLORS["alpha"]),   # 2s
    "Ac": (300,  "beta",  "Th", None, 0.1,  NUCLEAR_COLORS["beta"]),    # 5s
}

# ============================================================
# 核裂变配置 (F2)
# ============================================================
FISSION_CONFIG = {
    "U235": {
        "fissionable": True,
        "probability": 0.7,      # 中子击中后裂变概率
        "neutrons_released": 3,   # 释放中子数
        "energy_mev": 200,        # 释放能量 MeV
        "fragments": [("Ba", 56), ("Kr", 36)],  # 裂变产物 (Z 数)
        "neutron_speed": 10,
    }
}

# ============================================================
# 冲击波配置 (F3)
# ============================================================
SHOCKWAVE_CONFIG = {
    "speed": 5,           # 波前速度 (像素/帧)
    "max_radius": 500,    # 最大半径
    "life": 80,           # 寿命 (帧)
    "force_mult": 0.5,    # 推动力系数
    "thickness": 8,       # 波前厚度 (像素)
}

# ============================================================
# 动态温度配置 (F4)
# ============================================================
THERMAL_CONFIG = {
    "K_default": 50.0,     # 默认温度系数 K (T = avg_ke * K)
    "K_min": 5.0,          # K 最小值
    "K_max": 500.0,        # K 最大值
    "K_step": 1.5,         # [ / ] 调整倍数
    "smoothing_frames": 30, # 滑动平均帧数 (防止 T 跳动)
}

# ============================================================
# 辐射冷却配置 (黑体辐射, 能量 ∝ T⁴)
# ============================================================
COOLING_CONFIG = {
    "enabled": True,
    "damping_base": 0.9995,    # 基础阻尼 (速度每帧乘以此系数)
    "damping_thermal": 0.00001, # 热阻尼系数 (高温时额外阻尼 ∝ v²)
    "min_velocity": 0.05,       # 速度低于此值不再冷却
}

# ============================================================
# 屏幕震动配置
# ============================================================
SHAKE_CONFIG = {
    "enabled": True,
    "decay": 0.88,        # 每帧震动强度衰减系数
    "max_intensity": 20,  # 最大震动像素
    "fission": 12,        # 核裂变震动强度
    "extreme_fusion": 6,  # 极端聚变震动强度
    "energy_pulse": 8,    # 能量脉冲震动强度
    "alpha_decay": 3,     # α 衰变震动强度
}

# ============================================================
# 相机配置
# ============================================================
CAMERA_CONFIG = {
    "zoom_min": 0.3,
    "zoom_max": 3.0,
    "zoom_step": 1.15,    # 滚轮缩放步进
    "pan_speed": 1.0,
}

# ============================================================
# 辉光配置
# ============================================================
GLOW_CONFIG = {
    "enabled": True,
    "hot_temp_threshold": 2000,   # 温度超过此值开始发光 (K)
    "glow_size_mult": 2.5,        # 辉光半径 = 粒子半径 * 此值
    "alpha_max": 100,             # 最大辉光 alpha
}