# 物理仿真增强设计文档（含基于实际反应的颜色体系）

> 状态: 设计中 - 待用户审阅
> 日期: 2026-06-23
> 项目: atom-simulator (pygame 原子/分子/核反应仿真)
> 版本: v2 (新增 F0 颜色体系 + F5 现有闪光修复)

## 1. 背景与目标

当前模拟器已具备基础化学反应（含温度/气压门控）、核聚变、能量脉冲、截图等功能，但缺少更深层的物理现象：

1. **放射性衰变** - 重元素自发分解，无法观察 α/β 衰变等核心核物理现象
2. **核裂变与链式反应** - 缺少核能、核武器等现实世界重要物理过程的演示
3. **冲击波连锁** - 能量脉冲只是简单加速，没有真正的物理波传播
4. **动态温度** - 当前 T 只能由用户手动切换，不能反映系统真实热状态
5. **颜色与物理脱节** - 现有特效（化学反应闪光等）使用通用占位色，未遵循实际化学/物理颜色约定

本设计目标：
- 在不破坏现有架构与性能（>180 FPS）的前提下，加入 4 个新物理功能
- **建立基于实际反应的颜色体系**：元素色符合化学真实，化学反应闪光色符合火焰色/产物特征色，核反应色符合核物理约定
- 修复现有特效的占位色，统一到颜色体系

## 2. 范围

### 2.1 包含
- **F0 颜色体系**（新增）：基于实际反应/物理的颜色规则 — 元素色、反应 flash_color、核物理约定色、能量→颜色映射函数
- **F1 放射性衰变**：新增 U-238、U-235、Th-232、Ra-226 重元素；重元素按概率发生 α 衰变（→ 子核 + He-4）或 β 衰变（→ 下一代 + 电子）
- **F2 核裂变与链式反应**：U-235 + 中子 → 裂变产物（Ba + Kr + 2~3 中子 + 200 MeV 能量）
- **F3 冲击波连锁**：能量脉冲产生真实冲击波，波前推动附近原子连锁反应
- **F4 动态温度**：T 由系统平均动能动态决定，反应/碰撞/能量输入提升 T，碰撞后高能原子推动 T 上升
- **F5 现有闪光颜色修复**：现有化学反应闪光从默认白色改为每条反应指定 `flash_color`（基于产物特征色/火焰色）

### 2.2 不包含（YAGNI）
- 完整的元素周期表（仅新增 4 个放射性元素）
- β⁺ 衰变、电子俘获（仅实现 α 和 β⁻）
- 中微子释放（不可见，无视）
- 同位素区分（U-235 / U-238 视为同一种 "U" 元素，概率混合）
- 多步骤链反应（如 U→Th→Ra→Rn 多代衰变链）
- 用户手动设置基准 T（仅 100% 动态）

## 3. 架构与数据流

### 3.1 现有架构（参考）

```
main.py (AtomSimulator) — 主循环
  ├── config.py — 元素、反应、物理常量
  ├── physics.py — 碰撞、聚变、反应
  ├── atom.py / molecule.py — 实体类
  ├── particle.py — 质子/中子/电子
  ├── spatial.py — 碰撞检测网格
  ├── effects.py — 视觉特效
  └── renderer.py — 绘制
```

### 3.2 新增模块

**`config.py` 新增：**
- 4 个新元素（U, Pu, Th, Ra）
- 放射性元素表 `RADIOACTIVE_ISOTOPES`（含衰变类型、半衰期、产物）
- 链反应配置 `FISSION_CONFIG`（U-235 裂变产物分布、释放中子数）
- 动态温度配置 `THERMAL_DYNAMICS_CONFIG`（参考温度 T_ref、衰减系数 α）
- 冲击波配置 `SHOCKWAVE_CONFIG`（波速、寿命、推动力）

**`physics.py` 新增：**
- `try_radioactive_decay(atom)` → (new_atom, alpha_particle, beta_electron, energy) 或 None
- `try_nuclear_fission(atom, neutron)` → (fragments, neutrons, energy) 或 None
- `compute_system_kinetic_temperature(atoms, molecules)` → T_K（由系统动能动态决定）
- `ShockWave` 类（带位置、半径、寿命、波速）

**`main.py` 新增/修改：**
- `self.thermal_mode = "dynamic"` — 动态/手动 切换（默认动态）
- `self.T_user_baseline` — 用户手动基准（仅当切回手动时使用）
- 每帧调用 `compute_system_kinetic_temperature()` 更新 `self.temperature_K`
- 每帧检查每个原子是否发生衰变（按半衰期概率）
- 能量脉冲时生成 `ShockWave` 实体
- 裂变产物入 `to_add_atoms`

**`renderer.py` 新增：**
- `draw_shockwave(wave)` — 绘制冲击波圆环 + 波前效果
- `draw_radioactive_glow(atom)` — 放射性原子发光脉动效果
- `draw_thermal_mode_indicator(mode)` — 角落显示"🌡 动态/手动"模式

**`effects.py` 新增：**
- `RadioactiveDecayEffect` — 衰变时短暂闪绿/黄光 + 文字"α 衰变"
- `FissionBurstEffect` — 裂变时大爆炸 + 多条光线

### 3.3 数据流

```
update() 流程 (扩展后):
  1. 原子/分子位置更新
  2. 碰撞检测与反应
  3. ★ 新: 检查每个原子是否衰变 (按概率)
  4. ★ 新: 检查新生成 U 是否与中子碰撞触发裂变
  5. ★ 新: 推进所有 ShockWave 位置, 推动路径上原子
  6. ★ 新: compute_system_kinetic_temperature() → 更新 self.temperature_K
  7. 渲染时: ★ 新: 画放射性发光、冲击波、衰变特效
```

## 4. 详细设计

### 4.0 颜色体系（重要：基于实际反应的颜色）

**核心原则**：每个元素的颜色应符合化学/物理真实颜色，反应/衰变/裂变的视觉颜色应符合该现象的物理约定。

#### 4.0.1 元素基础色（已部分实现，需补全）

| 元素 | 颜色 (RGB) | 依据 |
|---|---|---|
| H | (200,200,255) 淡蓝白 | 无色气体，UI 区分 |
| He | (255,180,200) 粉白 | 氦气放电粉红 |
| Li | (200,50,200) 紫红 | 锂火焰洋红 |
| C | (60,60,60) 黑灰 | 碳单质 |
| N | (100,150,255) 浅蓝 | 氮气无色，UI 区分 |
| O | (255,100,80) 橙红 | 氧气无色，UI 区分（液态氧浅蓝） |
| Na | (255,220,80) 黄 | 钠火焰特征黄 |
| Mg | (180,255,100) 亮绿 | 镁燃烧耀眼白光 |
| Al | (200,200,210) 银白 | 铝金属银白 |
| S | (255,220,80) 硫黄 | 硫磺黄 |
| Cl | (100,255,100) 绿 | 氯气黄绿（取绿色作 UI 区分） |
| K | (180,80,255) 紫 | 钾火焰紫 |
| Ca | (150,220,255) 橙红 | 钙火焰橙红 |
| Fe | (220,100,80) 红棕 | 铁锈色 |
| **U** | **(100,255,100) 荧光绿** | 铀玻璃荧光绿 |
| **Pu** | **(200,100,50) 棕红** | 钚金属灰，取棕红区分 |
| **Th** | **(180,200,100) 黄绿** | 钍氧化物色 |
| **Ra** | **(255,200,50) 银蓝** | 镭发光蓝白（取黄绿区分） |

**修复点**：现有 `ELEMENTS` 中部分颜色不符合实际（如 O 用了橙红，Fe 用了红棕），按上表对齐。

#### 4.0.2 REACTIONS 字典增 flash_color 字段

**修复点**：现有 49 条反应全部用默认占位色（黄/白），改为每条反应指定 `flash_color`，基于产物特征色或火焰色。

```python
REACTIONS = [
    # 格式: (r1, r2, product, bond, energy, atoms, bond_type, flash_color)
    # flash_color 基于: (1) 产物特征色, (2) 火焰色实验值, (3) 能量大小
    ("H", "H", "H2", "H-H", "放热", ["H","H"], "chain", (200,200,255)),  # H2 无色，UI 淡蓝白
    ("H2", "O", "H2O", "H-O-H", "放热", ["H","O","H"], "bent", (180,220,255)),  # 氢氧燃烧→水，几近无色
    ("O", "O", "O2", "O=O", "放热", ["O","O"], "chain", (255,200,180)),  # 氧气无色，UI 浅橙
    ("C", "O2", "CO2", "O=C=O", "放热", ["O","C","O"], "chain", (255,140,50)),  # 碳燃烧→橙红火光
    ("Na", "Cl2", "NaCl", "Na-Cl", "放热", ["Na","Cl"], "chain", (255,220,80)),  # 钠在氯中燃烧→黄
    ("Mg", "O2", "MgO", "Mg=O", "强放热", ["Mg","O"], "chain", (255,255,200)),  # 镁燃烧→耀眼白
    ("Fe", "S", "FeS", "Fe-S", "放热", ["Fe","S"], "chain", (180,100,50)),  # 铁硫反应→红热
    ("K", "H2O", "KOH", "K-O-H", "强放热", ["K","O","H"], "bent", (180,80,255)),  # 钾水反应→紫
    ("Ca", "O2", "CaO", "Ca=O", "放热", ["Ca","O"], "chain", (255,150,80)),  # 钙燃烧→砖红
    ("Cu", "Cl2", "CuCl2", "Cl-Cu-Cl", "放热", ["Cl","Cu","Cl"], "bent", (180,80,40)),  # 铜在氯中→棕烟
    ("H2", "Cl2", "HCl", "H-Cl", "放热", ["H","Cl"], "chain", (180,255,180)),  # 氢氯→苍白火焰
    ("N", "H2", "NH2", "H-N-H", "放热", ["H","N","H"], "bent", (140,180,255)),  # 氨合成→淡蓝
    ("S", "O2", "SO2", "O=S=O", "放热", ["O","S","O"], "bent", (180,180,180)),  # 硫燃烧→蓝焰
    ("P", "O2", "P2O5", "O=P-O-P=O", "放热", ["O","P","O","P","O"], "chain", (255,255,200)),  # 磷燃烧→耀眼白光
    # 默认占位色（未指定时）: 按能量映射
]
```

**默认 fallback**：未指定 `flash_color` 时，按 `delta_H` 绝对值映射（强放热→黄白，中放热→橙红，吸热→淡蓝）。

#### 4.0.3 核物理约定色

| 现象 | 颜色 (RGB) | 物理依据 |
|---|---|---|
| α 粒子 (He 核) | (255,200,80) 黄 | He 原子基础色 |
| β 电子 | (100,180,255) 蓝白 | 高速电子切伦科夫辐射 |
| γ 射线 | (220,255,255) 蓝白 | 高能光子 |
| 中子 | (150,150,150) 灰 | 中性粒子无色 |
| 裂变碎片 | 用产物原子色混合 | 见 F2 |
| 放射性原子发光 | 元素色 + alpha 脉动 | 见 F1 |
| 冲击波 | 按能量映射：低能(60,255,60)绿→中能(255,200,80)黄→高能(255,80,80)红 | 物理波能级 |

#### 4.0.4 能量→颜色映射函数（用于默认 fallback 和冲击波）

```python
def energy_to_color(energy_mev, mode="fire"):
    """能量值映射到颜色, 模拟热辐射 + 物理色
    mode:
      - "fire": 黑体辐射 (低能暗红→中能橙→高能黄白→极高能蓝白)
      - "particle": 粒子速度→轨迹色 (慢绿→中黄→快红→极快蓝)
    """
    if mode == "fire":
        # Wien 位移近似
        e = abs(energy_mev)
        if e < 0.1: return (60, 60, 80)       # 几近无光
        elif e < 1: return (180, 60, 40)      # 暗红
        elif e < 10: return (255, 120, 40)    # 橙红
        elif e < 50: return (255, 220, 80)    # 金黄
        elif e < 200: return (255, 255, 200)  # 耀眼白
        else: return (200, 220, 255)          # 蓝白
    elif mode == "particle":
        v = abs(energy_mev)
        if v < 1: return (100, 255, 100)
        elif v < 5: return (255, 255, 100)
        elif v < 20: return (255, 150, 80)
        else: return (120, 180, 255)
```

#### 4.0.5 现有代码需改的通用占位色

| 位置 | 现状 | 改为 |
|---|---|---|
| `_release_energy` 中 FlashEffect (主闪) | 250, 18 (大小) 颜色默认 (255,255,255) | 改为能量映射色，200MeV 蓝白 |
| 化学反应 FlashEffect | 默认白色 | 改为 `reaction[7]` flash_color |
| 数字键生成原子 | 用 ELEMENTS 色 | 已是元素色，OK |
| 选中环 | (255,255,100) 黄 | 保持 |
| 拖动预测线 | (100,255,100) 绿 | 保持（提示用） |

### 4.1 放射性衰变 (F1)

#### 4.1.1 新增元素

```python
"U":  {"name": "铀", "protons": 92, "neutrons": 146, "color": (100, 255, 100), "radius": 72, "category": "actinide", "atomic_weight": 238.03, "e_config": "[Rn]5f³6d¹7s²"},
"Pu": {"name": "钚", "protons": 94, "neutrons": 145, "color": (200, 100, 50), "radius": 74, "category": "actinide", "atomic_weight": 244.06, "e_config": "[Rn]5f⁶7s²"},
"Th": {"name": "钍", "protons": 90, "neutrons": 142, "color": (180, 200, 100), "radius": 70, "category": "actinide", "atomic_weight": 232.04, "e_config": "[Rn]6d²7s²"},
"Ra": {"name": "镭", "protons": 88, "neutrons": 138, "color": (255, 200, 50), "radius": 68, "category": "alkaline", "atomic_weight": 226.03, "e_config": "[Rn]7s²"},
```

**数字键映射** 9 → U, 0 → Pu (扩展 1-8 → 1-10, 0 改为 Ra)

#### 4.1.2 衰变规则表

```python
RADIOACTIVE_ISOTOPES = {
    # symbol: (半衰期帧数@60FPS, 衰变类型, 子核symbol, 释放粒子, 释放能量 MeV)
    "U":  (3600,  "alpha", "Th", "He", 4.2),    # U-238 半衰期 4.5e9 年 → 演示用 3600 帧 ≈ 1 分钟
    "Pu": (1800,  "alpha", "U",  "He", 5.5),    # Pu-244 演示半衰期
    "Th": (2400,  "alpha", "Ra", "He", 4.0),
    "Ra": (1200,  "beta",  "U",  None, 0.2),   # β 衰变, 不释放 He, 释放高速电子
}
```

**半衰期演示调整**：真实半衰期太长，演示用 60s 内可见 → 60 FPS × 60s = 3600 帧。半衰期 3600 帧意味着每秒 ~1.16% 概率衰变。

#### 4.1.3 衰变执行

```python
def try_radioactive_decay(atom):
    spec = RADIOACTIVE_ISOTOPES.get(atom.symbol)
    if not spec: return None
    half_life_frames, decay_type, daughter, ejectile, energy = spec
    # 每帧概率 = 1 - 0.5^(1/half_life)
    if random.random() < 1 - 0.5 ** (1.0 / half_life_frames):
        # 产生子核
        daughter_atom = Atom(daughter, atom.x, atom.y, ...)
        # 释放粒子
        ejectile_atom = None
        if ejectile == "He":
            # α 粒子以高速射出
            ang = random.uniform(0, 2*math.pi)
            speed = 8 + energy * 0.5  # MeV → 速度
            ejectile_atom = Atom("He", atom.x, atom.y,
                                 math.cos(ang)*speed, math.sin(ang)*speed)
        elif decay_type == "beta":
            # β 粒子, 标记为高速电子 (暂时不实现, 用 PhotonParticle 替代)
            pass
        return (daughter_atom, ejectile_atom, energy, decay_type)
    return None
```

#### 4.1.4 视觉效果

- 放射性原子周期性发光（脉动 alpha 50~150），发光色 = 元素本身色（U 绿、Pu 棕、Th 黄绿、Ra 黄）
- 衰变瞬间闪光颜色：
  - α 衰变：He 黄色 (255,200,80) 闪光，因为产物是 He 原子
  - β 衰变：蓝白色 (100,180,255) 闪光，因为产物是高速电子
- 屏幕漂字颜色与闪光色一致
- 衰变产物（Th、Ra 等子核）继承真实元素色

### 4.2 核裂变与链式反应 (F2)

#### 4.2.1 触发条件

U-235 原子被中子击中 → 检查 `try_nuclear_fission(atom, neutron)`。

**前提**：需要中子来源。中子可由：
- α 衰变释放（暂时简化：α 粒子本身就是 He 原子，不放中子）
- 用户按 `N` 键发射自由中子
- **裂变产物释放 2~3 个中子** → 这些中子又可触发其他 U-235 裂变

#### 4.2.2 裂变产物

简化版：U-235 + n → Ba-141 + Kr-92 + 3n + 200 MeV

```python
FISSION_CONFIG = {
    "U235": {
        "fragments": [("Ba", 56, 82), ("Kr", 36, 56)],  # 简化: 用最轻和最重产物
        "neutrons_released": 3,
        "energy_mev": 200,
    }
}
```

由于 ELEMENTS 表中无 Ba、Kr，**简化方案**：U-235 → 2 个 K (39) + 2 个 Ca (40) + 3 个 He (4) + 200 MeV
（K 39+Ca 40+He 4+He 4+He 4 = 91, 接近 U-235 的 92+143=235 质量数）

#### 4.2.3 链式反应概率

```python
def try_nuclear_fission(atom, neutron):
    if atom.symbol != "U": return None
    # 真实: U-235 热中子截面 585 barns
    # 演示: 70% 概率裂变 (高)
    if random.random() < 0.7:
        return generate_fission_products(atom)
    return None
```

#### 4.2.4 自由中子

- 添加 `Neutron` 实体（独立类型，不在 Atom 中）
- 质量小（mass=1），半径 2，灰色
- 速度 8~15，不参与化学反应
- 击中 U 触发裂变，击中其他原子 → 弹性碰撞或被吸收

#### 4.2.4 视觉

- 裂变主闪光：能量映射色 — 200 MeV 蓝白色 (200,220,255)（基于 energy_to_color 模式 "fire"）
- 释放的多条光线 = PhotonParticle 群，颜色用 γ 射线约定色 (220,255,255) 蓝白
- 裂变产物原子继承各自元素色（K 黄、Ca 橙、He 黄）
- 屏幕漂"⚡ 链式反应！" 文字用蓝白色
- 链式反应触发时屏幕中心大字提示，颜色 = γ 蓝白

### 4.3 冲击波连锁 (F3)

#### 4.3.1 ShockWave 数据类

```python
class ShockWave:
    def __init__(self, x, y, source_energy, max_radius=400):
        self.x, self.y = x, y
        self.max_radius = max_radius
        self.radius = 0
        self.speed = 5  # 像素/帧
        self.life = 80  # 帧
        self.timer = self.life
        self.source_energy = source_energy  # 影响推动力
        self.hit_atoms = set()  # 已影响过的原子 (避免重复)
```

#### 4.3.2 推进逻辑

```python
def update(self, atoms, molecules):
    self.radius += self.speed
    # 推动路径上原子 (波前 ~5px 厚度)
    for a in atoms:
        if id(a) in self.hit_atoms: continue
        dx, dy = a.x - self.x, a.y - self.y
        dist = math.hypot(dx, dy)
        if abs(dist - self.radius) < 6:  # 波前
            # 沿径向推动
            ux, uy = dx/dist, dy/dist
            force = self.source_energy * 0.5
            a.vx += ux * force
            a.vy += uy * force
            self.hit_atoms.add(id(a))
    self.timer -= 1
    return self.timer > 0 and self.radius < self.max_radius
```

#### 4.3.3 与能量脉冲集成

- `_release_energy()` 中创建 `ShockWave(center_x, center_y, ENERGY_PULSE_STRENGTH)`
- 多波（连续按 E 可叠加 2~3 个波）

#### 4.3.4 视觉

- 主圆环颜色 = `energy_to_color(source_energy, mode="fire")`：
  - 低能波 (E<0.5)：暗红 (180,60,40)
  - 中能波 (E=1~5)：橙红 (255,120,40)
  - 高能波 (E=10~50)：金黄 (255,220,80)
  - 极高能 (E>100)：蓝白 (200,220,255)
- 内部淡色填充用同色 + alpha 40
- 透明度随生命衰减
- 推动被波及原子时，短暂闪一次波色（提示"被冲击波影响"）

### 4.4 动态温度 (F4)

#### 4.4.1 温度公式

```python
def compute_system_kinetic_temperature(atoms, molecules):
    # 平均动能 = (1/2) m v²
    total_ke = 0.0
    total_n = 0
    for a in atoms:
        if a.dragging: continue
        ke = 0.5 * a.mass * (a.vx**2 + a.vy**2)
        total_ke += ke
        total_n += 1
    for m in molecules:
        if m.dragging: continue
        ke = 0.5 * m.mass * (m.vx**2 + m.vy**2)
        total_ke += ke
        total_n += 1
    if total_n == 0: return 298.0  # 默认室温
    avg_ke = total_ke / total_n
    # 1/2 m v² = (3/2) kT
    # T = avg_ke * mass_unit / (3 * KB_scaled)
    # 演示用比例系数（避免真实物理单位问题）
    # 实测: 室温 298K 对应 v_avg ≈ 1.5
    T_K = avg_ke * 50.0  # 经验系数
    return max(1.0, min(1e7, T_K))
```

#### 4.4.2 与用户 T 控制的关系

**重大变更**：原有 `T` 键（循环预设）、`[` `]` 键（微调）仍保留，但作为**用户基准温度**：

- 动态模式下：实际 T = `compute_system_kinetic_temperature()`
- 基准 T 仅作为反应速率的"目标值"（UI 提示）
- 提供切换键 `Ctrl+T` 切回手动模式（手动模式下保留旧行为）

**简化设计**：直接采用"完全动态"模式，**去掉手动切换**，让所有 T 控制（[/]T）变为"调整基准（仅 UI 显示，不影响实际 T）"。这样最简洁，符合"由系统能量动态决定 T"的需求。

**最终决策**：T 键改为显示当前 T 状态信息，[/] 改为调整系数（让静态系统也能升温，比如"低能量 → 高 T"系数）。[ ] 控制乘性系数 K（K 默认 50），T = avg_ke * K。

#### 4.4.3 视觉

- 角落显示"🌡 动态 T: 1234 K (基准 ×K=50)"，文字色 = 温度对应黑体色（用 `temperature_to_color`），直观反映热状态
- [/] 提示当前系数 K
- 温度变化时背景色调（已存在）跟随 `temperature_to_color(T)` 平滑过渡

### 4.5 性能考虑

- 衰变检查：每帧每原子 1 次 `random.random()` → O(N)，可接受
- 裂变检查：仅在中子击中 U 时触发，不在热路径
- 冲击波：每帧仅 1~3 个，最多影响 200 原子（已用 set 避免重复）
- 动态 T：每帧 O(N) 求和，已预算局部变量优化
- 预计性能影响：<5% FPS 下降（从 200 → 190+ FPS）

## 5. UI 与快捷键

### 5.1 新增快捷键

| 键 | 功能 |
|---|---|
| `9` | 在鼠标位置生成 U 原子（替代原 9 切到 R-Key） |
| `0` | 在鼠标位置生成 Pu 原子 |
| `-` | 在鼠标位置生成 Th 原子（替代原 - 切到 K） |
| `N` | 在场景中心释放一个自由中子（链式反应触发） |
| `Ctrl+T` | 切换"动态 T" / "手动 T" 模式（仅作 UI 提示，**默认始终动态**） |

### 5.2 帮助页更新

新增 4 段：

```
【放射性 (新)】
  数字键 9 0 - (=)  生成 U / Pu / Th / Ra
  重元素按半衰期概率自动 α/β 衰变
  U → Th + He (α 粒子)
  Ra → U + 电子 (β 衰变)

【核裂变 (新)】
  N 键释放自由中子
  中子击中 U 触发裂变 → 2 重原子 + 3 中子 + 200 MeV
  多个 U 靠近时形成链式反应

【冲击波 (新)】
  按 E 释放能量 → 产生冲击波
  冲击波波前推动原子 → 连锁加速

【动态温度 (新)】
  T = 系统平均动能 × 系数
  [ / ]  调整温度系数 K
  碰撞剧烈时 T 自动升高
```

### 5.3 新增 UI 元素

- 角落动态 T 指示器（与 FPS 同行）
- 模式提示：右下角小标签"动态 T 模式"
- 衰变 / 裂变 / 冲击波发生时屏幕中心显示大字提示

## 6. 测试策略

### 6.1 单元测试

```python
# test_decay.py
def test_u_alpha_decay():
    u = Atom("U", 0, 0)
    # 在 3600 帧内，~63% 概率衰变
    decayed = 0
    for _ in range(1000):
        a = Atom("U", 0, 0)
        result = try_radioactive_decay(a)
        if result: decayed += 1
    # 期望 1000 * (1 - 0.5^(1/3600)) ≈ 0.19 次 → 实际因 random 波动
    assert 0 <= decayed <= 5  # 1000 次调用中预期 ~0.19 次

def test_fission_products():
    u = Atom("U", 0, 0)
    n = Atom("n", 0, 0)  # 自由中子
    frags = try_nuclear_fission(u, n)
    assert frags is not None
    fragments, neutrons, energy = frags
    assert len(fragments) == 2  # 2 重原子
    assert len(neutrons) == 3   # 3 个新中子
    assert 150 < energy < 250   # ~200 MeV

def test_shockwave_propagation():
    sw = ShockWave(100, 100, energy=5.0)
    a = Atom("H", 200, 100, 0, 0)  # 在波前 100px
    initial_vx = a.vx
    for _ in range(20):
        sw.update([a], [])
    assert a.vx > initial_vx  # 原子被推动
```

### 6.2 集成测试

```python
# test_integration_decay.py
# 1000 帧内放置 100 个 U 原子, 验证 ~15% 发生衰变 (100 * 0.19)
```

### 6.3 性能测试

- 200 原子 + 4 个冲击波 + 50 U 原子衰变检查
- 目标: >180 FPS

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 4 个 U 原子持续衰变产生大量 α 粒子 | 性能下降、视觉混乱 | 半衰期保守 + α 粒子有寿命（击中其他原子后转化为 He 原子） |
| 链式反应失控（U 链爆） | 性能崩溃 | 单次裂变最多产生 3 中子，单个中子命中 U 概率 70%，天然限制 |
| 动态 T 数值跳动大 | UI 闪烁 | 滑动平均（最近 30 帧） |
| 冲击波反复推动同一原子 | 能量爆炸 | `hit_atoms` set 记录已推动原子 |
| U 原子太大（radius=72）导致场景拥挤 | 视觉差 | 渲染时缩放：实际绘制 = min(radius, 50) |

## 8. 实施计划概要

按依赖关系分 6 步（每步独立可验收）：

| 步骤 | 内容 | 验收标准 |
|---|---|---|
| 0 | F0 颜色体系（基础设施） | 元素色修正、REACTIONS 加 flash_color、energy_to_color 函数 |
| 1 | F4 动态 T（最独立） | [/] 调整 K，T = avg_ke × K，FPS 不降 |
| 2 | F1 放射性衰变（需新元素） | 1 分钟内可见 U→Th+He 发生 |
| 3 | F3 冲击波（与 F1 独立） | E 键产生可见圆环波，原子被推动 |
| 4 | F2 裂变 + 链反应（依赖 F1 的 U） | N 键释放中子，击中 U 产生裂变 |
| 5 | F5 现有闪光颜色修复 | 现有化学反应的 FlashEffect 颜色 = reaction[7] |

## 9. 验收清单

### F0 颜色体系
- [ ] ELEMENTS 中 O/Mg/Cl/Fe 等元素色按实际修正
- [ ] REACTIONS 每条都有 flash_color（第 8 个元组字段）
- [ ] config.py 中有 `energy_to_color(energy, mode)` 函数
- [ ] 未指定 flash_color 的反应自动 fallback 到能量映射色
- [ ] 4 个放射性元素（U/Pu/Th/Ra）颜色符合物理

### F1 放射性衰变
- [ ] 4 个放射性元素可生成、半衰期正确
- [ ] α 衰变产生子核 + He，闪光色 = He 黄色
- [ ] β 衰变仅产生子核，闪光色 = 蓝白色（电子色）
- [ ] 放射性原子脉动发光色 = 元素色

### F2 核裂变
- [ ] 中子 N 键可释放
- [ ] 中子击中 U 触发裂变
- [ ] 链式反应：1 个 U 裂变产生的中子可触发邻近 U
- [ ] 裂变主闪光 = 200MeV 蓝白色

### F3 冲击波
- [ ] 冲击波 E 键产生，推动路径上原子
- [ ] 冲击波颜色按能量映射（低能暗红→高能蓝白）

### F4 动态温度
- [ ] 动态 T = 系统动能 × 系数
- [ ] [/] 调整 T 系数
- [ ] T 文字色 = 温度黑体色

### F5 现有闪光
- [ ] 现有化学反应 FlashEffect 使用 reaction[7] flash_color
- [ ] 能量脉冲主闪光使用 energy_to_color 映射

### 总体
- [ ] 帮助页 F1 更新所有新功能
- [ ] 性能 > 180 FPS
- [ ] 1 分钟压力测试无崩溃
- [ ] 24 小时测试（可选）

## 10. 不在范围

- 同位素区分（U-235/U-238 混合）
- 完整的元素周期表（>118 号元素）
- β⁺ 衰变、电子俘获
- 中微子、暗物质、引力波等不可见物理
- 用户手动基准 T 切换（仅作 UI 提示）
