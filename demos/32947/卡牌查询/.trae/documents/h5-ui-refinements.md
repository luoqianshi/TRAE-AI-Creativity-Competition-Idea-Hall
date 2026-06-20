# H5 详情页 UI 精修计划

针对用户最近一次 `/plan` 反馈,3 个 UI 调整项的实施方案。

---

## 1. Summary(概要)

| # | 位置 | 改动 | 范围 |
|---|------|------|------|
| 1 | 首页 AGC 盾牌 | 删除盾牌内 "AUTHENTIC" 副字,只保留 "AGC" | 1 个 SVG text 元素 |
| 2 | 详情页 hero | 重新布局 / 缩略图放大 / 分数徽章改盾形 / 内含 AGC | 1 个 HTML 块 + 1 个 CSS 调整 |
| 3 | 详情页基础信息字段 | icon + label + value 文字全部改为金色 | 2 处 CSS 颜色调整 |

---

## 2. Current State Analysis(现状分析)

### 2.1 涉及文件

| 文件 | 关键代码位置 | 说明 |
|------|-------------|------|
| [public/h5/index.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/index.html) | L47-61 `.home-brand-shield` SVG | 图1 AGC 盾牌 |
| [public/h5/detail.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/detail.html) | L23-37 `.detail-grade-badge` SVG | 图2 分数徽章 |
| [public/h5/detail.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/detail.html) | L16-54 `.detail-hero` 整体 | 图2 hero 布局 |
| [public/h5/detail.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/detail.html) | L63-125 `.detail-fields` 5 个字段 | 图3 基础信息 |
| [public/h5/css/h5.css](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/css/h5.css) | L402-410 `.detail-grade-badge` | 徽章尺寸 78×78 |
| [public/h5/css/h5.css](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/css/h5.css) | L458-510 `.detail-thumbs` / `.detail-thumb` | 缩略图 100×140 |
| [public/h5/css/h5.css](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/css/h5.css) | L565-597 `.detail-field-icon` / `.detail-field-label` / `.detail-field-value` | 字段三色定义 |

### 2.2 现状

- **图1 AGC盾牌**:盾形路径 + `AGC` 文字 + 下方 `AUTHENTIC` 小字,用户只想要 `AGC`
- **图2 详情页 hero**:
  - `.detail-hero` `min-height: 480px` + 居中堆叠布局
  - 徽章 `<circle>` 圆形,内含数字 10 + "GEM MINT"
  - 缩略图 `100px × 140px`,两个并排居中
  - `.detail-thumbs` `padding: 0 0 30px; gap: 16px`
- **图3 基础信息字段**:
  - `.detail-field-icon` 内 `color: var(--gold-300)`(已是金色,保持)
  - `.detail-field-label` `color: var(--silver-300)`(银灰)
  - `.detail-field-value` `color: white`(白)
  - `.detail-field-value .mono` `color: var(--gold-200)`(浅金,已是金色)

### 2.3 颜色 token(已有,直接复用)

- `--gold-100: #fbf3d9`(最浅金)
- `--gold-200: #f1de9f`
- `--gold-300: #e6c870` ← 字段 label / icon 沿用
- `--gold-400: #d4af37`(主金)
- `--gold-500: #b8902a`

---

## 3. Proposed Changes(具体变更)

### 3.1 任务 ① — 删除 AGC 盾牌内 "AUTHENTIC" 副字

**文件:** [public/h5/index.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/index.html) L59

**操作:** 删除该行整段 `<text>...</text>`,只保留 L58 的 AGC `<text>`。

**变更前(L58-59):**
```html
<text x="32" y="42" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="14" font-weight="700" fill="#0a1530" letter-spacing="0.5">AGC</text>
<text x="32" y="55" text-anchor="middle" font-family="PingFang SC, sans-serif" font-size="5" letter-spacing="1" fill="#0a1530">AUTHENTIC</text>
```

**变更后(只保留 AGC):**
```html
<text x="32" y="44" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="14" font-weight="700" fill="#0a1530" letter-spacing="0.5">AGC</text>
```

> 微调:`y` 从 42 → 44,因为删除下方副字后视觉上让 AGC 居中(盾形垂直中心 y≈42,但加上文本 baseline 偏移,44 看起来更居中)。
> 其他不变(用户要求 "其他不变")。

---

### 3.2 任务 ② — 详情页 hero 重新设计

#### 3.2.1 分数徽章:圆形 → 盾形

**文件:** [public/h5/detail.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/detail.html) L23-37

**设计思路:** 沿用首页 AGC盾牌的盾形语言(viewBox 改为 0 0 78 84 适应盾形高度),数字 10 居中,下方"AGC"小字替换原"GEM MINT",内边框用深蓝 `#0a1530` 描出与外层金色形成层次。

**变更后 SVG:**
```html
<div class="detail-grade-badge" id="gradeBadge">
  <svg viewBox="0 0 78 84" fill="none">
    <defs>
      <linearGradient id="badge-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f1de9f"/>
        <stop offset="50%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#8c6c1d"/>
      </linearGradient>
    </defs>
    <!-- 外层盾形 + 金色描边 -->
    <path d="M39 0 L75 12 L75 42 Q75 64 39 82 Q3 64 3 42 L3 12 Z"
          fill="url(#badge-grad)" stroke="#fbf3d9" stroke-width="1"/>
    <!-- 内层盾形 + 深蓝描边 -->
    <path d="M39 6 L69 16 L69 42 Q69 60 39 76 Q9 60 9 42 L9 16 Z"
          fill="none" stroke="#0a1530" stroke-width="0.8"/>
    <!-- 分数 -->
    <text id="badgeNum" x="39" y="40" text-anchor="middle"
          font-family="Cormorant Garamond, serif" font-size="22" font-weight="700"
          fill="#0a1530">10</text>
    <!-- AGC 小字(替换原 GEM MINT) -->
    <text x="39" y="58" text-anchor="middle"
          font-family="PingFang SC, sans-serif" font-size="6"
          letter-spacing="2" font-weight="700" fill="#0a1530">AGC</text>
  </svg>
</div>
```

#### 3.2.2 重新布局,减少空白

**文件:** [public/h5/css/h5.css](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/css/h5.css)

**调整项:**

| 元素 | 变更 | 值 |
|------|------|------|
| `.detail-hero` | `min-height` 缩短 | `480px` → `420px` |
| `.detail-hero` | `padding` 收紧 | `60px 24px 24px` → `56px 24px 16px` |
| `.detail-grade-badge` | 适配盾形高度 | `78×78` → `78×84` |
| `.detail-grade-badge` | `margin-bottom` 收紧 | `14px` → `10px` |
| `.detail-title-wrap` | `margin-bottom` 收紧 | `20px` → `14px` |
| `.detail-thumbs` | `padding-bottom` 收紧 | `30px` → `16px` |

**变更后代码段:**
```css
.detail-hero {
  position: relative;
  min-height: 420px;            /* ← 由 480 改 420 */
  background-color: var(--ink-800);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  padding: 56px 24px 16px;      /* ← 60/24/24 → 56/24/16 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-grade-badge {
  position: relative;
  z-index: 5;
  width: 78px;
  height: 84px;                 /* ← 新增,适配盾形 */
  margin: 0 auto 10px;          /* ← 14 → 10 */
  filter: drop-shadow(0 6px 18px rgba(212,175,55,0.4));
}
.detail-grade-badge svg { width: 100%; height: 100%; display: block; }

.detail-title-wrap {
  text-align: center;
  position: relative;
  z-index: 5;
  margin-bottom: 14px;          /* ← 20 → 14 */
  padding: 0 8px;
}

.detail-thumbs {
  display: flex;
  justify-content: center;
  gap: 18px;                    /* ← 16 → 18 */
  position: relative;
  z-index: 5;
  padding: 0 0 16px;            /* ← 30 → 16 */
}
```

#### 3.2.3 缩略图略微放大

**文件:** [public/h5/css/h5.css](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/css/h5.css) `.detail-thumb` (L466)

| 属性 | 变更 |
|------|------|
| `width` | `100px` → `118px` |
| `height` | `140px` → `166px` |

**变更后:**
```css
.detail-thumb {
  width: 118px;                 /* ← 100 → 118 */
  height: 166px;                /* ← 140 → 166 */
  border-radius: 10px;
  background: linear-gradient(135deg, #f1de9f 0%, #d4af37 30%, #8c6c1d 70%, #d4af37 100%);
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.4);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}
```

> 比例保持 100:140 ≈ 0.714,新值 118:166 ≈ 0.711(几乎一致,形状不变)。

---

### 3.3 任务 ③ — 基础信息字段全部金色

**文件:** [public/h5/css/h5.css](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/css/h5.css) L578-597

| 元素 | 现状 | 变更为 |
|------|------|--------|
| `.detail-field-icon` `color` | `var(--gold-300)` | (已金色,保持) |
| `.detail-field-label` `color` | `var(--silver-300)` | `var(--gold-300)` |
| `.detail-field-value` `color` | `white` | `var(--gold-200)` |
| `.detail-field-value .mono` `color` | `var(--gold-200)` | `var(--gold-100)`(提亮,跟外层有对比层次) |

**变更后代码段:**
```css
.detail-field-label {
  font-size: 11px;
  color: var(--gold-300);       /* ← 由 --silver-300 改金色 */
  letter-spacing: 0.15em;
  margin-bottom: 2px;
}
.detail-field-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--gold-200);       /* ← 由 white 改金色 */
  letter-spacing: 0.02em;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}
.detail-field-value .mono {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  letter-spacing: 0.05em;
  color: var(--gold-100);       /* ← 由 --gold-200 提亮到 --gold-100 */
}
```

**可读性说明:**
- 背景为深蓝渐变 `linear-gradient(135deg, rgba(20,35,75,0.9), rgba(14,26,56,0.9))`,与 `--gold-200` / `--gold-300` 对比度均 > 7:1(WCAG AAA),完全可读。
- 字段背景整体偏深,金色文字会形成"奢华典藏"质感,符合 AGC 鉴真品牌调性。

---

## 4. Assumptions & Decisions(决策说明)

| 决策 | 说明 |
|------|------|
| 盾形 SVG 路径 | 与首页 AGC 盾牌同源风格,viewBox 适配高度(0 0 78 84) |
| AGC 小字位置 | 用户指定"替换 GEM MINT",放在数字 10 下方;字号与原 GEM MINT 一致(6px),加粗 700 提升识别 |
| 缩略图放大比例 | 100×140 → 118×166(约 1.18 倍),保持原 0.71 宽高比 |
| 字段金色色阶 | icon 沿用 `--gold-300`;label 用 `--gold-300`;value 用 `--gold-200`;mono 提亮到 `--gold-100`,形成三层金色梯度 |
| 详情页 hero 高度 | 由 480px 减到 420px,垂直方向更紧凑,符合"不要这么空" |
| 其他保持不变 | 用户对图1明确说"其他不变",其余文件(JS、数据等)不改动 |

---

## 5. Verification(验证步骤)

执行修改后,人工 / 浏览器按以下顺序验证:

### 5.1 图1 验证(首页)
1. 浏览器打开 `http://localhost:3000/h5/`
2. 顶部居中盾牌 SVG 内 **只** 显示 "AGC" 一行文字,无 "AUTHENTIC"
3. 盾牌尺寸、渐变、位置不变

### 5.2 图2 验证(详情页 hero)
1. 输入内部编号查询一张卡牌,进入详情页
2. 分数徽章形状为**盾形**(非圆),内含分数 + "AGC" 三字符(无 GEM MINT)
3. 缩略图明显比之前大(目测 ~118×166)
4. 整页 hero 区不再有"半空"感,布局更紧凑(无明显大块留白)
5. hero 区下方"商品基础信息"标题位置合理,未与缩略图重叠

### 5.3 图3 验证(基础信息字段)
1. 详情页"商品基础信息"区域 5 个字段
2. 5 个 icon 仍为金色(原有不变)
3. 5 个 label(卡牌名称 / 卡牌编号 / 内部编号 / 评级分数 / 卡牌版本)文字为金色
4. 5 个 value 文字为金色
5. 内部编号 / 卡牌编号的 mono 字体(等宽)颜色比 value 略亮(分层)

### 5.4 回归
- 列表其他页面、后台 B 端不受影响
- 没有改动 JS,无需重启后端服务
- 如启用了 PM2,无需 `pm2 restart`

---

## 6. Files To Modify(待修改文件清单)

| # | 文件 | 修改类型 | 行数估计 |
|---|------|---------|---------|
| 1 | [public/h5/index.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/index.html) | 删除 1 行 + 微调 y 坐标 | -1 行 |
| 2 | [public/h5/detail.html](file:///c:/Users/30516/Desktop/卡牌查询/public/h5/detail.html) | 替换 SVG 块(15 行) | 重写 15 行 |
| 3 | [public/h5/css/h5.css](file:///c:/Users/30515/Desktop/卡牌查询/public/h5/css/h5.css) | 调整 6 处样式属性 | 编辑 6 行 |

预计总工作量:**3 个文件,1 个 HTML SVG 重写 + 1 个 HTML 删 1 行 + 1 个 CSS 调 6 行。**
