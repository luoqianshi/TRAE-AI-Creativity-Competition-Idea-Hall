# 家庭药品管理助手（Family Med Manager）— 实施计划

## 一、总结

基于用户提供的 PRD，从零搭建一个家庭药品管理 Web 应用，采用**复古草本药铺风**视觉设计，实现药品库存管理、过期提醒、用药记录三大核心功能，数据通过 `localStorage` 持久化，无需后端。

技术栈：React 18 + TypeScript + Vite + Tailwind CSS 3 + Zustand（`react-ts` 模板，含 react-router-dom）。

交付物：一个"能跑通、能体验"的完整 Demo，界面富有文化质感与记忆点。

---

## 二、当前状态分析

- 工作目录 `d:\trae work\fmm` 为**空目录**，属全新 greenfield 项目。
- 用户已提供详尽 PRD（中文），核心功能、优先级、用户场景均明确。
- 数据持久化明确为 `localStorage`（P0），无后端需求 → 选用纯前端 `react-ts` 模板。
- 视觉方向经确认：**复古草本药铺风**（墨绿 + 赭石 + 米黄，经典衬线字 + 手写装饰，磨砂纹理，标本式卡片）。

---

## 三、技术决策与假设

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 框架 | React 18 + TypeScript | web-dev skill 默认偏好，类型安全 |
| 构建 | Vite | react-ts 模板自带，快速热更新 |
| 样式 | Tailwind CSS 3 | 模板自带，原子化高效迭代 |
| 状态管理 | Zustand + persist 中间件 | 轻量，原生支持 localStorage 持久化 |
| 路由 | react-router-dom v6 | 模板自带，多页面切换 |
| 图标 | lucide-react | skill 指定，风格统一 |
| 后端 | 无 | PRD 明确 localStorage，Demo 范围 |
| 包管理器 | npm | 环境未确认 pnpm，按 skill 规则回退 npm |
| 设计基准 | 桌面优先 + 移动自适应 | skill 默认 |
| 语言 | 中文 UI，代码标识符英文 | 与 user_input 语言一致 |

**假设**：Node.js 已安装（用户环境已告知）。若无，实施时先安装。

---

## 四、视觉设计系统（复古草本药铺风）

### 4.1 色彩 Token

| Token | 色值 | 用途 |
|-------|------|------|
| `--herbal-green` | `#2D4A3E` | 主色（墨绿，标题/主按钮/导航） |
| `--herbal-green-deep` | `#1F3329` | 深墨绿（hover/强调） |
| `--ochre` | `#B8763E` | 次色（赭石，装饰/图标/次按钮） |
| `--ochre-light` | `#D9A86C` | 浅赭石（高亮） |
| `--paper` | `#F5EFE0` | 背景（米黄/宣纸） |
| `--paper-light` | `#FAF6EC` | 卡片表面 |
| `--ink` | `#2A2520` | 主文字（墨色） |
| `--ink-muted` | `#6B5D4F` | 次文字 |
| `--seal-red` | `#8B3A3A` | 过期/危险（印章红） |
| `--amber` | `#C8923A` | 临近过期（琥珀） |
| `--moss` | `#5A7D5A` | 正常状态（苔绿） |

### 4.2 字体

- **标题/展示**：`Noto Serif SC`（思源宋体）— 经典衬线，文化质感
- **正文**：`Noto Serif SC` regular + 备选 `Noto Sans SC`
- **数字/标签**：`Cormorant Garamond`（拉丁衬线，用于日期、剂量等数字呈现，增强标本感）
- **装饰手写**：`Ma Shan Zheng`（马善政体，仅用于少量装饰性短语/Logo 副标）

通过 Google Fonts 引入，在 `index.html` 添加 `<link>`。

### 4.3 质感与装饰

- **背景纹理**：CSS `radial-gradient` + SVG 噪点滤镜叠加，模拟宣纸/磨砂质感
- **标本卡片**：药品卡片采用"草本标本卡"样式 — 米黄底、细墨绿边框、四角小装饰角标、左上角圆形状态印章
- **状态印章**：过期=红色印章"已过"、临近=琥珀印章"将过"、正常=苔绿印章"可用"，轻微旋转 `-6deg` 模拟手盖
- **分隔线**：双线 + 中间小菱形装饰（中式书卷感）
- **章节标题**：左侧竖线 + 衬线大字 + 右侧赭石细线延伸
- **过渡动画**：卡片入场 staggered fade-up，hover 轻微上浮 + 阴影加深，印章 hover 轻微旋转回正

---

## 五、数据模型

### 5.1 Medicine（药品）

```ts
interface Medicine {
  id: string;            // uuid
  name: string;          // 药品名称
  expiryDate: string;    // 有效期 ISO 日期 YYYY-MM-DD
  purpose: string;       // 用途/备注
  quantity: number;      // 数量
  category?: string;     // 分类（可选，如"退烧"/"肠胃"/"慢性病"）
  createdAt: number;
  updatedAt: number;
}
```

### 5.2 MedicationRecord（用药记录）

```ts
interface MedicationRecord {
  id: string;
  medicineId: string;    // 关联药品
  medicineName: string;  // 冗余存名（防止药品删除后记录无意义）
  timestamp: number;     // 服用时间
  dosage: string;        // 剂量（如"1片"/"5ml"）
  note?: string;         // 备注（如"饭后"/"儿童减半"）
}
```

### 5.3 派生计算（非存储）

- `daysUntilExpiry(expiryDate): number` — 距过期天数
- `getStatus(days): 'expired' | 'expiring' | 'safe'` — `<0` 过期 / `<=30` 临近 / `>30` 正常

---

## 六、页面与路由

应用共 3 个路由页面，功能内聚丰富（skill 要求 ≤3 页时增加单页复杂度）。

| 路由 | 页面 | 核心模块 |
|------|------|----------|
| `/` | 药箱总览（Dashboard） | 统计概览、临近过期提醒墙、最近用药记录、快捷入口 |
| `/inventory` | 药品库存 | 药品标本卡片网格、搜索/筛选/排序、新增/编辑/删除 |
| `/records` | 用药记录 | 用药时间线、新增记录、按药品筛选 |

### 6.1 药箱总览 `/`

- **顶部统计区**：4 张标本风统计卡 — 药品总数 / 将过期数 / 已过期数 / 本月用药次数
- **临近过期提醒墙**：30 天内过期 + 已过期药品横向卡片，印章醒目，按剩余天数升序
- **最近用药记录**：最近 5 条用药记录，时间线样式
- **快捷入口**：新增药品、新增用药记录按钮

### 6.2 药品库存 `/inventory`

- **工具栏**：搜索框（按名称/用途）、状态筛选（全部/正常/临近/过期）、排序（剩余天数/名称/数量）
- **卡片网格**：每张标本卡展示 名称、用途、数量、有效期、剩余天数、状态印章
- **新增/编辑**：模态框表单 — 名称、有效期（date picker）、用途、数量、分类
- **删除**：二次确认（轻量内联确认，非系统 alert）
- **空状态**：药箱空时的引导插画与文案

### 6.3 用药记录 `/records`

- **时间线列表**：按时间倒序，每条展示 药品名、时间、剂量、备注
- **新增记录**：模态框 — 选择药品（下拉，显示库存）、剂量、时间（默认 now）、备注
- **筛选**：按药品筛选
- **空状态**：暂无记录引导

---

## 七、实施步骤（执行阶段）

### 阶段 A：文档生成（Plan 通过后首先执行）

1. 创建 `.trae/documents/PRD.md` — 按 web-docs-guideline 模板，中文，含产品概述、核心功能、页面详情、核心流程（Mermaid）、UI 设计
2. 创建 `.trae/documents/technical-architecture.md` — 架构图、技术栈、路由定义、数据模型（Mermaid ER）、localStorage 方案
3. 调用 `NotifyUser` 请求用户审阅文档

### 阶段 B：项目初始化（文档批准后）

4. 用 `react-ts` 模板初始化：`npm init vite-init@latest -y . "--" --template react-ts --force`（Windows 命令格式）
5. 配置 `package.json` 依赖（确保 zustand、lucide-react、react-router-dom 在位，按需补 uuid）
6. `npm install` 安装依赖
7. 在 `index.html` 引入 Google Fonts（Noto Serif SC / Cormorant Garamond / Ma Shan Zheng）
8. 配置 `tailwind.config.js`：扩展色彩 token、字体族、自定义动画
9. 在 `src/index.css` 设定全局背景纹理、CSS 变量、基础排版

### 阶段 C：核心骨架

10. `src/types/index.ts` — 定义 `Medicine`、`MedicationRecord` 类型
11. `src/store/useMedicineStore.ts` — Zustand store + persist，含药品 CRUD
12. `src/store/useRecordStore.ts` — Zustand store + persist，含用药记录 CRUD
13. `src/utils/date.ts` — `daysUntilExpiry`、`formatDate`、`getStatus` 工具函数
14. `src/App.tsx` — 路由结构与布局壳（Header + Nav + 主内容区）

### 阶段 D：通用组件

15. `src/components/Layout/Header.tsx` — 顶部导航（Logo + 药铺名 + 导航链接）
16. `src/components/Layout/Nav.tsx` — 路由导航（药箱总览/药品库存/用药记录）
17. `src/components/MedicineCard.tsx` — 标本风药品卡片（状态印章、剩余天数、操作按钮）
18. `src/components/StatusSeal.tsx` — 状态印章组件（过期/临近/正常）
19. `src/components/MedicineFormModal.tsx` — 新增/编辑药品模态框
20. `src/components/RecordFormModal.tsx` — 新增用药记录模态框
21. `src/components/EmptyState.tsx` — 空状态引导组件
22. `src/components/ConfirmDialog.tsx` — 轻量删除确认
23. `src/components/ui/` — 小型通用件（Button、Input、Badge 等如需）

### 阶段 E：页面实现

24. `src/pages/Dashboard.tsx` — 总览页（统计卡 + 提醒墙 + 最近记录）
25. `src/pages/Inventory.tsx` — 库存页（工具栏 + 卡片网格 + 模态框联动）
26. `src/pages/Records.tsx` — 记录页（时间线 + 筛选 + 新增）

### 阶段 F：细节打磨

27. 动画：卡片 staggered 入场（CSS animation-delay）、印章 hover 旋转、模态框淡入
28. 装饰：SVG 草本线稿点缀、章节标题装饰线、卡片四角角标
29. 响应式：桌面优先栅格，移动端单列
30. 预置示例数据（首次进入若空，提供"加载示例药箱"按钮，方便 Demo 展示）

### 阶段 G：验证

31. `npm run check` 类型检查通过
32. `npm run dev` 启动开发服务器（后台运行），`OpenPreview` 展示
33. 浏览器验证清单：
    - 新增/编辑/删除药品，刷新后数据保留
    - 过期/临近/正常三态印章与颜色正确
    - 列表按剩余天数排序正确
    - 新增用药记录，时间线倒序展示
    - 总览统计数字与库存/记录联动一致
    - 筛选、搜索功能正常
    - 移动端布局可用

---

## 八、关键文件清单

```
d:\trae work\fmm\
├── .trae\documents\
│   ├── PRD.md                          (阶段 A)
│   ├── technical-architecture.md       (阶段 A)
│   └── family-medicine-manager-plan.md (本文件)
├── index.html                          (Google Fonts)
├── package.json                        (依赖)
├── tailwind.config.js                  (色彩/字体/动画扩展)
├── src\
│   ├── index.css                       (全局样式/纹理/变量)
│   ├── App.tsx                         (路由+布局)
│   ├── main.tsx                        (入口)
│   ├── types\index.ts                  (类型)
│   ├── store\
│   │   ├── useMedicineStore.ts
│   │   └── useRecordStore.ts
│   ├── utils\date.ts
│   ├── components\
│   │   ├── Layout\{Header,Nav}.tsx
│   │   ├── MedicineCard.tsx
│   │   ├── StatusSeal.tsx
│   │   ├── MedicineFormModal.tsx
│   │   ├── RecordFormModal.tsx
│   │   ├── EmptyState.tsx
│   │   └── ConfirmDialog.tsx
│   └── pages\
│       ├── Dashboard.tsx
│       ├── Inventory.tsx
│       └── Records.tsx
```

---

## 九、风险与对策

| 风险 | 对策 |
|------|------|
| Zustand persist 版本兼容 | 使用 `zustand/middleware` 的 `persist`，标准用法 |
| 复古风格过度装饰影响可用性 | 装饰仅用于背景/卡片角标/印章，核心信息保持高对比可读 |
| localStorage 数据迁移 | Demo 范围无需迁移；store 设版本号字段预留 |
| 字体加载慢 | Google Fonts 带 `display=swap`；正文 fallback 到系统衬线 |

---

## 十、验证标准（完成定义）

- [ ] `npm run check` 无类型错误
- [ ] 开发服务器可正常启动并预览
- [ ] P0 功能全部可用：药品增删改查、按有效期排序、三态颜色标识、过期/临近提醒、localStorage 持久化
- [ ] P1 功能可用：用药记录新增与查看
- [ ] 视觉呈现符合"复古草本药铺风"：墨绿/赭石/米黄配色、衬线标题、标本卡片、状态印章
- [ ] 桌面与移动端均可正常使用
