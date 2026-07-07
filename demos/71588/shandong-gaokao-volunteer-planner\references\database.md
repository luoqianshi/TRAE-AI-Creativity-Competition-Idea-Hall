# volunteer_main 字段说明与查询原则

## 数据库基本信息

- 默认数据库路径：`E:\qq wenjian\高考skill\shandong_gaokao_2026_ai.db`
- 默认查询视图：`volunteer_main`（25,655 行，来自第二张"已合并 26 年招生计划"主表）
- 备用表：
  - `volunteer_core`（61,807 行，两张 Excel 合并后的全量统一表，含重复来源）
  - `expert_raw_58`（第一张 Excel 原始 58 列）
  - `merged_plan_raw_67`（第二张 Excel 原始 67 列）
  - `dataset_meta`（数据集元信息）
- **优先查 `volunteer_main`**。只有需要交叉验证两表差异时才查 `volunteer_core` 或原始表。

## volunteer_main 完整字段

按用途分组列出（已与 SQLite 实际 schema 核对）。

### 标识与来源

| 字段 | 类型 | 含义 |
|---|---|---|
| `source_file` | TEXT | 来源 Excel 文件名 |
| `source_table` | TEXT | 来源原始表名 |
| `source_row` | INTEGER | 来源行号 |
| `id` | REAL | 记录 ID |
| `year` | REAL | 招生年份 |
| `province` | TEXT | 招生省份（山东） |
| `subject_type` | TEXT | 科类（综合） |
| `batch` | TEXT | 批次（一段/二段） |
| `batch_note` | TEXT | 批次备注 |
| `plan_type` | TEXT | 计划类型（普通计划/地方专项/中外合作等） |

### 院校与专业

| 字段 | 类型 | 含义 |
|---|---|---|
| `school_code` | TEXT | 院校代码 |
| `school_name` | TEXT | 院校名称 |
| `major_code` | TEXT | 专业代码 |
| `major_full_name` | TEXT | 专业全名（含师范类等后缀） |
| `major_name` | TEXT | 专业名（不含后缀） |
| `major_note` | TEXT | 专业备注，常含校区、合作办学、体检限制、师范类、高收费 |
| `major_level` | TEXT | 专业层次（本科/职业本科/专科） |
| `elective_requirement` | TEXT | 选科要求（如"物理"、"物理和化学"、"政治和历史"、"不限"） |
| `plan_count` | REAL | 2026 计划人数 |
| `duration` | TEXT | 学制（年） |
| `tuition` | REAL | 学费（元/年） |
| `discipline` | TEXT | 门类（工学/理学/医学/法学/经济学/管理学/文学/教育学等） |
| `major_category` | TEXT | 专业类（如计算机类、电子信息类） |

### 位次与历年录取

| 字段 | 类型 | 含义 |
|---|---|---|
| `estimated_rank_2026` | REAL | 2026 年预估位次（重要参考） |
| `is_new` | TEXT | 是否新增（"新增"或 NULL） |
| `history_year_1` | REAL | 最近一年年份 |
| `admit_count_1` | REAL | 最近一年录取人数 |
| `min_score_1` | REAL | 最近一年最低分 |
| `min_rank_1` | REAL | 最近一年最低位次 |
| `avg_score_1` | REAL | 最近一年平均分 |
| `avg_rank_1` | REAL | 最近一年平均位次 |
| `old_batch_1` | TEXT | 最近一年批次 |
| `plan_count_result_1` | REAL | 最近一年计划完成数 |
| `history_year_2` | REAL | 上一年年份 |
| `admit_count_2` | REAL | 上一年录取人数 |
| `min_score_2` | REAL | 上一年最低分 |
| `min_rank_2` | REAL | 上一年最低位次 |
| `avg_score_2` | REAL | 上一年平均分 |
| `avg_rank_2` | REAL | 上一年平均位次 |
| `old_batch_2` | TEXT | 上一年批次 |
| `plan_count_result_2` | REAL | 上一年计划完成数 |
| `history_year_3` | REAL | 更早一年年份 |
| `admit_count_3` | REAL | 更早一年录取人数 |
| `min_score_3` | REAL | 更早一年最低分 |
| `min_rank_3` | REAL | 更早一年最低位次 |
| `avg_score_3` | REAL | 更早一年平均分 |
| `avg_rank_3` | REAL | 更早一年平均位次 |
| `old_batch_3` | TEXT | 更早一年批次 |
| `plan_count_result_3` | REAL | 更早一年计划完成数 |

### 院校属性

| 字段 | 类型 | 含义 |
|---|---|---|
| `school_province` | TEXT | 院校所在省份 |
| `city` | TEXT | 院校所在城市 |
| `city_tier` | TEXT | 城市层级（一线/新一线/二线/三线/四线/五线） |
| `school_tags` | TEXT | 院校标签（如 985/211/双一流） |
| `school_level` | TEXT | 院校层级 |
| `rename_merge_transfer` | TEXT | 更名/合并/转设信息 |
| `authority` | TEXT | 主管部门 |
| `school_type` | TEXT | 院校类型（综合/理工/师范/医药/财经/政法等） |
| `ownership` | TEXT | 公私性质（公办/民办/中外合作办学/内地与港澳台合作办学/境外高校独立办学） |
| `degree_level` | TEXT | 学历层次（本科/职业本科/专科） |
| `postgraduate_recommend_rate` | TEXT | 保研率 |
| `school_rank` | REAL | 院校软科排名 |
| `major_transfer_policy` | TEXT | 转专业政策 |
| `school_master_major_count` | REAL | 院校硕士点数量 |
| `school_master_majors` | TEXT | 院校硕士点列表 |
| `school_phd_major_count` | REAL | 院校博士点数量 |
| `school_phd_majors` | TEXT | 院校博士点列表 |

### 招生章程与学科质量

| 字段 | 类型 | 含义 |
|---|---|---|
| `admission_brochure_2025` | TEXT | 2025 招生章程 |
| `admission_brochure` | TEXT | 招生章程链接 |
| `admission_rule` | TEXT | 录取规则（专业优先/分数优先/专业级差） |
| `soft_rank_rating` | TEXT | 软科评级 |
| `soft_rank` | TEXT | 软科排名 |
| `subject_evaluation` | TEXT | 学科评估（A+/A/A-/B+等） |
| `major_quality_level` | TEXT | 专业水平（国家级一流/省级一流等） |
| `major_master_degree` | TEXT | 本专业硕士点 |
| `major_phd_degree` | TEXT | 本专业博士点 |

## 实际数据分布（用于校准过滤阈值）

- 总行数：25,655
- `ownership`：公办 22,217 / 民办 3,353 / 中外合作办学 58 / 内地与港澳台合作办学 20 / 境外高校独立办学 7
- `degree_level`：本科 24,947 / 职业本科 566 / 专科 142
- `is_new`：NULL 21,393 / "新增" 4,262
- `estimated_rank_2026`：14 ~ 577,542，共 24,914 条非空
- `tuition`：2,500 ~ 190,000，共 24,606 条非空

## 查询原则

1. **优先看位次，不要只看分数。** 山东新高考按位次录取，分数受试卷难度影响波动大。
2. **`estimated_rank_2026` 是重要参考，但要结合 `min_rank_1/2/3` 看波动。** 单看一年数据容易被异常年误导。
3. **筛选前先硬过滤**：选科不符、用户明确排斥、身体限制冲突、学费超限且不能接受、批次不符、学历层次不符（必须本科则排除职业本科和专科）。
4. **民办 / 中外合作 / 高收费可作为保底候选**，但 `risk_note` 必须强备注，不得伪装成优先推荐。
5. **新增专业（`is_new = '新增'`）必须单独标记**，不得当作稳妥保底（无稳定历史数据）。
6. **体检限制、色觉限制、校区、中外合作、高收费等信息可能藏在 `major_note` / `admission_rule` / `admission_brochure` 中**，必须 LIKE 模糊匹配检查。
7. **不要把整张表塞进上下文**。先用 SQL 查出候选，再让 AI 分析。

## 选科匹配规则

`elective_requirement` 常见取值与匹配规则：

| elective_requirement 值 | 含义 | 匹配逻辑 |
|---|---|---|
| `不限` | 不限选科 | 任意组合都可报 |
| `物理` | 必选物理 | 学生选科含物理即可 |
| `物理和化学` | 必选物理+化学 | 学生选科同时含物理和化学 |
| `物理或化学` | 物理化学二选一 | 学生选科含物理或化学之一 |
| `历史` | 必选历史 | 学生选科含历史 |
| `政治和历史` | 必选政治+历史 | 学生选科同时含政治和历史 |
| `物理或历史` | 物理历史二选一 | 学生选科含物理或历史 |
| `化学` | 必选化学 | 学生选科含化学 |
| `化学和生物` | 必选化学+生物 | 学生选科同时含化学和生物 |
| `生物` | 必选生物 | 学生选科含生物 |
| `政治` | 必选政治 | 学生选科含政治 |
| `地理` | 必选地理 | 学生选科含地理 |
| `物理和化学和生物` | 必选物化生 | 学生选科同时含这三门 |

脚本 `query_candidates.py` 中实现了 `elective_match()` 函数处理这些情况，**不要在 SQL 里硬写 LIKE**，否则会漏掉"物理和化学"等组合。

## 高收费识别

满足以下任一条件视为高收费：

- `tuition >= 50000`
- `major_note` 含"高收费"
- `major_note` 含"中外合作" 或 `ownership` 含"中外合作" 且 `tuition >= 30000`
- `major_note` 含"合作办学"

## 体检/色觉风险识别

满足以下任一条件视为体检风险候选，需结合学生 `health_limits` 二次判断：

- `major_note` 含"色"、"体检"、"不予录取"
- `admission_rule` 含"色"、"体检"
- `major_name` 属于医学/化工/生物/食品/地质/矿业/公安类等需要体检合格的专业

## 示例 SQL（节选自 query_examples.sql）

```sql
-- 查 480 分、256869 位次附近的本科公办候选
SELECT school_name, major_name, city, ownership, major_category,
       estimated_rank_2026, min_rank_1, min_rank_2, min_rank_3,
       plan_count, tuition, major_note
FROM volunteer_main
WHERE degree_level LIKE '%本科%'
  AND ownership LIKE '%公办%'
  AND (estimated_rank_2026 BETWEEN 230000 AND 285000
       OR min_rank_1 BETWEEN 230000 AND 285000)
ORDER BY COALESCE(estimated_rank_2026, min_rank_1)
LIMIT 200;

-- 查可能存在体检/色觉风险的专业
SELECT school_name, major_name, major_note, admission_rule, admission_brochure
FROM volunteer_main
WHERE major_note LIKE '%色%' OR major_note LIKE '%体检%' OR major_note LIKE '%不予录取%'
   OR admission_rule LIKE '%色%'
LIMIT 200;

-- 查高收费、中外合作风险
SELECT school_name, major_name, city, ownership, tuition, major_note,
       estimated_rank_2026, min_rank_1
FROM volunteer_main
WHERE major_note LIKE '%合作%' OR major_note LIKE '%中外%' OR major_note LIKE '%高收费%'
   OR tuition >= 20000
LIMIT 200;
```

完整示例见 `E:\qq wenjian\高考skill\query_examples.sql`。

## 字段命名注意

- 计划文件提到的 `admission_brochure` 在数据库中是真实存在的字段，存的是招生章程链接。
- `admission_brochure_2025` 字段也存在（2025 年章程全文，多数为 NULL）。
- `major_level` 和 `degree_level` 都存在：`major_level` 偏向专业层次（本科/职业本科/专科），`degree_level` 偏向学历层次，实际取值基本一致。过滤本科时用 `degree_level LIKE '%本科%'` 可同时覆盖"本科"和"职业本科"，按需调整。
