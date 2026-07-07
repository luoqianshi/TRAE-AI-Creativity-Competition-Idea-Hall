# 评分模型与冲稳保分档规则

## 一、固定输出 100 个志愿

山东最终填报 96 个平行志愿，本 Skill 固定先给 100 个候选，留 4 个家庭讨论余地。

## 二、默认分档比例

| 档位 | 数量 | 说明 |
|---|---|---|
| 冲 | 25-30 | 录取位次明显优于考生位次，有风险但值得尝试 |
| 稳 | 35-45 | 位次接近考生，专业/城市/学校性质综合匹配，主体区间 |
| 保底 | 25-30 | 录取位次明显低于考生位次，负责兜底本科和可接受底线 |
| 新增/特殊 | 0-10 | 无稳定历史数据，单独标记，不计入稳/保底 |

实际数量允许在上述区间内浮动，但**总数必须为 100**。

## 三、分档判定逻辑（基于位次）

设考生位次为 `R`，每个候选的有效参考位次 `ref_rank`：

```
ref_rank = COALESCE(estimated_rank_2026, min_rank_1, min_rank_2, min_rank_3)
```

判定：

| 档位 | 条件 | 备注 |
|---|---|---|
| 新增/特殊 | `is_new = '新增'` 或 `ref_rank` 为 NULL（无任何历史数据） | 单独标记，不参与稳/保底 |
| 冲 | `ref_rank < R * 0.85`（即录取位次显著高于考生，差距 ≥ 15%） | 风险较高 |
| 稳 | `R * 0.85 ≤ ref_rank ≤ R * 1.15`（位次接近考生，±15% 内） | 主体区间 |
| 保底 | `ref_rank > R * 1.15`（录取位次显著低于考生） | 兜底区间 |

如果考生位次 R 较低（如 > 250000），可适当放宽稳区间到 ±20%，避免稳档过少。

如果候选不足 100 个：

- 先尝试放宽位次区间（冲到 0.80，保底到 1.30）。
- 再尝试放宽城市/学费约束（如果用户允许）。
- 仍不足 100 时，按实际数量输出，并在报告中说明候选不足的原因。

## 四、可解释评分模型

每个候选志愿按以下 6 个维度打分，总分 100。

| 维度 | 权重 | 说明 |
|---|---|---|
| 录取安全度 | 35% | 位次匹配度，越接近稳档越高 |
| 专业匹配度 | 25% | 与 `preferred_majors` / `preferred_disciplines` 匹配度 |
| 办学性质与费用适配 | 15% | 公办 > 民办 > 中外合作；学费是否在 `tuition_limit` 内 |
| 城市/地域适配 | 10% | 是否在 `preferred_cities` / `acceptable_provinces` 内 |
| 考研考公适配 | 10% | 保研率、硕士点、博士点、学科评估、专业水平 |
| 风险惩罚 | 5% | 民办/中外合作/高收费/体检/校区偏远/新增专业 |

### 4.1 录取安全度（35 分）

```
位次差 ratio = ref_rank / R
- ratio ∈ [0.90, 1.10]（稳档核心）: 35 分
- ratio ∈ [0.85, 0.90) ∪ (1.10, 1.15]: 30 分
- ratio ∈ [0.80, 0.85) ∪ (1.15, 1.25]: 25 分
- ratio < 0.80（冲得太狠）: 15 分
- ratio > 1.25（保底过深）: 20 分
- 无 ref_rank（新增/无数据）: 10 分
```

### 4.2 专业匹配度（25 分）

- `major_name` 命中 `preferred_majors` 关键词：25 分
- `discipline` 命中 `preferred_disciplines`：20 分
- `major_category` 含 `preferred_majors` 关键词：22 分
- 都不命中但 `major_name` 未在 `excluded_majors`：12 分
- 命中 `excluded_majors`：0 分（应在硬过滤阶段排除）

### 4.3 办学性质与费用适配（15 分）

- `ownership = 公办` 且 `tuition <= tuition_limit`：15 分
- `ownership = 公办` 且 `tuition > tuition_limit`：8 分
- `ownership = 民办` 且 `tuition <= tuition_limit`：10 分
- `ownership` 含 `中外合作` 且 `tuition <= tuition_limit`：7 分
- `ownership = 民办` 且 `tuition > tuition_limit`：3 分
- 高收费且超出 `tuition_limit`：0 分（应在硬过滤阶段排除，除非用户接受）

### 4.4 城市/地域适配（10 分）

- `city` 命中 `preferred_cities`：10 分
- `school_province` 命中 `acceptable_provinces`：7 分
- `prefer_in_province = true` 且 `school_province = 山东`：+2 分（叠加，上限 10）
- `school_province` 命中 `unacceptable_provinces`：0 分（应在硬过滤阶段排除）

### 4.5 考研考公适配（10 分）

- `postgraduate_recommend_rate` 数值 ≥ 10%：+3 分
- `major_master_degree` 非空（有硕士点）：+2 分
- `major_phd_degree` 非空（有博士点）：+2 分
- `subject_evaluation` 含 A 类（A+/A/A-）：+3 分
- `subject_evaluation` 含 B 类：+1 分
- `major_quality_level` 含"国家级一流"：+2 分
- `major_quality_level` 含"省级一流"：+1 分
- 上限 10 分。

考公适配：法学、汉语言、计算机、会计、财政、统计、经济、金融、税收、审计等专业考公适配较高，可在 `major_name` 命中时 +1 分（叠加至上限）。

### 4.6 风险惩罚（5 分，扣分制）

每命中一项扣 1 分，扣完为止：

- `ownership` 为民办
- `ownership` 含中外合作
- `tuition >= 50000` 或 `major_note` 含"高收费"
- `major_note` 含"色"/"体检"/"不予录取"且与 `health_limits` 冲突
- `city_tier` 含"四线"/"五线"（校区偏远）
- `is_new = '新增'`
- `plan_count` ≤ 2（招生计划过少，录取波动大）
- `min_rank_1` 与 `min_rank_3` 差距 ≥ 30%（位次波动大）

最终 `score = max(0, sum(各项得分))`。

## 五、排序规则

1. 先按档位分组：冲 / 稳 / 保底 / 新增。
2. 组内按总分降序排。
3. 同分时按位次接近度排（稳档优先 `ref_rank` 接近 R 的；冲档优先 `ref_rank` 较高的；保底优先 `ref_rank` 较低的）。
4. 民办/中外合作/高收费即使在保底组中也应排在同组末尾，并强备注。

## 六、入选理由与风险提醒（每条必填）

每条志愿输出时必须包含：

```json
{
  "tier": "冲|稳|保底|新增",
  "score": 82.5,
  "reason": "入选理由：xxx",
  "risk_note": "风险提醒：xxx",
  "keep_priority": "建议优先保留|可备选|谨慎考虑"
}
```

`reason` / `risk_note` 的写作模板见 `references/report-writing.md`。

## 七、被排除项留痕

`rank_volunteers.py` 输出的 JSON 中必须保留 `excluded` 字段，记录被硬过滤排除的项及原因，便于复查和向用户解释"为什么没有 X 学校"。

```json
{
  "excluded": [
    {
      "school_name": "xxx",
      "major_name": "xxx",
      "reason": "学费超限",
      "detail": "tuition=56000 > tuition_limit=30000"
    }
  ]
}
```
