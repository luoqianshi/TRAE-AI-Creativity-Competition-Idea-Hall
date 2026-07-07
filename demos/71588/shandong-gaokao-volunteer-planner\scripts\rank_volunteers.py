# -*- coding: utf-8 -*-
"""
rank_volunteers.py
==================

读取 candidates.json，对候选进行过滤、分档、评分、排序，
固定输出 100 个志愿到 volunteers_100.json，并保留被排除项与原因。

评分模型详见 references/scoring-rules.md：
  - 录取安全度 35%
  - 专业匹配度 25%
  - 办学性质与费用适配 15%
  - 城市/地域适配 10%
  - 考研考公适配 10%
  - 风险惩罚 5%

用法：
  python rank_volunteers.py --input candidates.json --output volunteers_100.json
"""

import argparse
import json
import os
import sys


def safe_float(v, default=None):
    try:
        if v is None or v == "":
            return default
        return float(v)
    except (ValueError, TypeError):
        return default


def get_ref_rank(c):
    """获取参考位次：estimated_rank_2026 -> min_rank_1 -> min_rank_2 -> min_rank_3"""
    for k in ("estimated_rank_2026", "min_rank_1", "min_rank_2", "min_rank_3"):
        v = safe_float(c.get(k))
        if v is not None and v > 0:
            return v
    return None


def is_high_tuition(major_note, tuition):
    """判断是否高收费专业（与 query_candidates.py / database.md 一致）。"""
    if tuition is not None and tuition >= 50000:
        return True
    if major_note:
        if "高收费" in major_note:
            return True
        if ("中外合作" in major_note or "合作办学" in major_note):
            if tuition is not None and tuition >= 30000:
                return True
    return False


def is_health_risk_item(major_note, admission_rule, major_name):
    """是否标注了体检风险（不一定冲突，仅用于 risk_note）。"""
    text = " ".join(filter(None, [major_note or "", admission_rule or ""]))
    for kw in ("色", "体检", "不予录取"):
        if kw in text:
            return True
    return False


def score_safety(ref_rank, R):
    """录取安全度（35 分）。"""
    if ref_rank is None:
        return 10.0
    if not R or R <= 0:
        # rank 非法（0 或负数），无法计算位次匹配度，给低分
        return 10.0
    ratio = ref_rank / R
    # R 较低时（>250000）放宽稳区间到 ±20%，避免稳档过少
    if R > 250000:
        if 0.80 <= ratio <= 1.20:
            return 35.0
        elif (0.75 <= ratio < 0.80) or (1.20 < ratio <= 1.25):
            return 30.0
        elif (0.70 <= ratio < 0.75) or (1.25 < ratio <= 1.30):
            return 25.0
        elif ratio < 0.70:
            return 15.0
        else:
            return 20.0
    if 0.90 <= ratio <= 1.10:
        return 35.0
    elif (0.85 <= ratio < 0.90) or (1.10 < ratio <= 1.15):
        return 30.0
    elif (0.80 <= ratio < 0.85) or (1.15 < ratio <= 1.25):
        return 25.0
    elif ratio < 0.80:
        return 15.0
    else:  # ratio > 1.25
        return 20.0


def score_major_match(major_name, major_category, discipline,
                      preferred_majors, preferred_disciplines, excluded_majors):
    """专业匹配度（25 分）。"""
    if not major_name:
        return 5.0
    # 命中排斥项应该在硬过滤阶段排除，这里防御性检查
    if excluded_majors and any(em in major_name for em in excluded_majors):
        return 0.0
    # 命中 preferred_majors
    if preferred_majors:
        for pm in preferred_majors:
            if pm in major_name:
                return 25.0
        if major_category:
            for pm in preferred_majors:
                if pm in major_category:
                    return 22.0
    # 命中 preferred_disciplines
    if preferred_disciplines and discipline:
        for pd in preferred_disciplines:
            if pd in discipline:
                return 20.0
    # 默认中性
    return 12.0


def score_ownership_tuition(ownership, tuition, tuition_limit):
    """办学性质与费用适配（15 分）。"""
    own = ownership or ""
    if "公办" in own:
        if tuition is None or tuition <= tuition_limit:
            return 15.0
        return 8.0
    if "民办" in own:
        if tuition is None or tuition <= tuition_limit:
            return 10.0
        return 3.0
    if "中外合作" in own or "合作" in own:
        if tuition is None or tuition <= tuition_limit:
            return 7.0
        return 3.0
    return 8.0


def score_city(city, school_province, preferred_cities,
               acceptable_provinces, prefer_in_province):
    """城市/地域适配（10 分）。"""
    s = 0.0
    if preferred_cities and city:
        for pc in preferred_cities:
            if pc in city or city in pc:
                s += 10.0
                break
    if s == 0 and acceptable_provinces and school_province:
        for ap in acceptable_provinces:
            if ap in school_province or school_province in ap:
                s += 7.0
                break
    if prefer_in_province and school_province == "山东":
        s += 2.0
    return min(s, 10.0)


def score_grad_civil(major_name, postgraduate_recommend_rate,
                     major_master_degree, major_phd_degree,
                     subject_evaluation, major_quality_level):
    """考研考公适配（10 分）。"""
    s = 0.0
    # 保研率
    rate = safe_float(postgraduate_recommend_rate, 0)
    if rate and rate >= 10:
        s += 3.0
    elif rate and rate > 0:
        s += 1.0
    # 硕士点
    if major_master_degree:
        s += 2.0
    # 博士点
    if major_phd_degree:
        s += 2.0
    # 学科评估
    if subject_evaluation:
        if any(g in subject_evaluation for g in ("A+", "A-", "A类", "A ")):
            s += 3.0
        elif "B" in subject_evaluation:
            s += 1.0
    # 专业水平
    if major_quality_level:
        if "国家级" in major_quality_level:
            s += 2.0
        elif "省级" in major_quality_level:
            s += 1.0
    # 考公适配专业
    civil_majors = ("法学", "汉语言", "计算机", "会计", "财政", "统计",
                    "经济", "金融", "税收", "审计")
    if major_name and any(cm in major_name for cm in civil_majors):
        s += 1.0
    return min(s, 10.0)


def score_risk_penalty(c, health_limits):
    """风险惩罚（5 分，扣分制）。"""
    penalty = 0.0
    ownership = c.get("ownership", "") or ""
    major_note = c.get("major_note", "") or ""
    admission_rule = c.get("admission_rule", "") or ""
    major_name = c.get("major_name", "") or ""
    tuition = safe_float(c.get("tuition"))
    city_tier = c.get("city_tier", "") or ""
    is_new_flag = c.get("is_new", "")
    plan_count = safe_float(c.get("plan_count"))
    min_rank_1 = safe_float(c.get("min_rank_1"))
    min_rank_3 = safe_float(c.get("min_rank_3"))

    if "民办" in ownership:
        penalty += 1.0
    if "中外合作" in ownership or "合作" in ownership:
        penalty += 1.0
    if is_high_tuition(major_note, tuition):
        penalty += 1.0
    if is_health_risk_item(major_note, admission_rule, major_name) and health_limits and health_limits != "无":
        penalty += 1.0
    if city_tier and ("四线" in city_tier or "五线" in city_tier):
        penalty += 1.0
    if is_new_flag == "新增":
        penalty += 1.0
    if plan_count is not None and plan_count <= 2:
        penalty += 1.0
    if min_rank_1 and min_rank_3 and min_rank_1 > 0 and min_rank_3 > 0:
        diff = abs(min_rank_1 - min_rank_3) / max(min_rank_1, min_rank_3)
        if diff >= 0.30:
            penalty += 1.0
    return min(penalty, 5.0)


def total_score(c, student, R, ref_rank):
    """计算综合评分。"""
    s_safety = score_safety(ref_rank, R)
    s_major = score_major_match(
        c.get("major_name", ""), c.get("major_category", ""), c.get("discipline", ""),
        student.get("preferred_majors", []), student.get("preferred_disciplines", []),
        student.get("excluded_majors", []) + student.get("exclude_controversial", [])
    )
    s_own_tui = score_ownership_tuition(
        c.get("ownership", ""), safe_float(c.get("tuition")),
        float(student.get("tuition_limit", 999999))
    )
    s_city = score_city(
        c.get("city", ""), c.get("school_province", ""),
        student.get("preferred_cities", []), student.get("acceptable_provinces", []),
        student.get("prefer_in_province", False)
    )
    s_grad = score_grad_civil(
        c.get("major_name", ""), c.get("postgraduate_recommend_rate", ""),
        c.get("major_master_degree", ""), c.get("major_phd_degree", ""),
        c.get("subject_evaluation", ""), c.get("major_quality_level", "")
    )
    penalty = score_risk_penalty(c, student.get("health_limits", "无"))
    total = s_safety + s_major + s_own_tui + s_city + s_grad - penalty
    return max(0.0, total)


def determine_tier(c, R, ref_rank):
    """判定档位：冲/稳/保底/新增。"""
    is_new_flag = c.get("is_new", "")
    if is_new_flag == "新增" or ref_rank is None:
        return "新增"
    if not R or R <= 0:
        # rank 非法（0 或负数），无法判定档位，归为新增避免冲/保底误判
        return "新增"
    ratio = ref_rank / R
    # R 较低时（>250000）放宽稳区间到 ±20%，避免稳档过少
    if R > 250000:
        if ratio < 0.80:
            return "冲"
        elif ratio <= 1.20:
            return "稳"
        else:
            return "保底"
    if ratio < 0.85:
        return "冲"
    elif ratio <= 1.15:
        return "稳"
    else:
        return "保底"


def build_reason(c, student, R, ref_rank, tier):
    """生成入选理由。"""
    parts = []
    parts.append(f"[{tier}] {c.get('school_name','')} + {c.get('major_full_name') or c.get('major_name','')}")
    parts.append(f"{c.get('city','')} + {c.get('ownership','')} + {int(c.get('tuition') or 0)}元/年")
    if ref_rank is not None:
        diff = int(ref_rank - R)
        parts.append(f"位次匹配：考生位次 {int(R)}，本专业参考位次 {int(ref_rank)}，位次差 {diff:+d}，{tier}区间")
    else:
        parts.append("位次匹配：新增专业无往年数据，参考位次缺失")
    match_points = []
    preferred_majors = student.get("preferred_majors", [])
    if preferred_majors and c.get("major_name"):
        for pm in preferred_majors:
            if pm in c["major_name"]:
                match_points.append(f"专业方向命中'{pm}'")
                break
    preferred_cities = student.get("preferred_cities", [])
    if preferred_cities and c.get("city"):
        for pc in preferred_cities:
            if pc in c["city"] or c["city"] in pc:
                match_points.append(f"城市命中'{pc}'")
                break
    if c.get("subject_evaluation"):
        match_points.append(f"学科评估{c['subject_evaluation']}")
    if c.get("postgraduate_recommend_rate"):
        match_points.append(f"保研率{c['postgraduate_recommend_rate']}")
    if c.get("ownership") and "公办" in c["ownership"]:
        match_points.append("公办性价比高")
    if c.get("major_master_degree"):
        match_points.append("有硕士点")
    if c.get("major_phd_degree"):
        match_points.append("有博士点")
    if match_points:
        parts.append("匹配点：" + "、".join(match_points))
    return "。".join(parts) + "。"


def build_risk_note(c, student, R, ref_rank, tier):
    """生成风险提醒。"""
    notes = []
    ownership = c.get("ownership", "") or ""
    major_note = c.get("major_note", "") or ""
    admission_rule = c.get("admission_rule", "") or ""
    major_name = c.get("major_name", "") or ""
    tuition = safe_float(c.get("tuition"))
    city_tier = c.get("city_tier", "") or ""
    is_new_flag = c.get("is_new", "")
    plan_count = safe_float(c.get("plan_count"))
    health_limits = student.get("health_limits", "无")

    if "民办" in ownership:
        notes.append(f"民办院校，学费 {int(tuition or 0)} 元/年，社会认可度低于公办，建议家庭确认经济承受能力")
    if "中外合作" in ownership or "合作" in ownership:
        notes.append(f"中外合作办学，学费 {int(tuition or 0)} 元/年，培养模式特殊，出国衔接与学位授予方式需核实当年招生章程")
    if is_high_tuition(major_note, tuition):
        notes.append(f"高收费专业，学费 {int(tuition or 0)} 元/年，家庭经济压力较大")
    if is_health_risk_item(major_note, admission_rule, major_name):
        if health_limits and health_limits != "无":
            notes.append(f"本专业对体检有要求，考生体检结论为 {health_limits}，需确认是否符合录取条件")
        else:
            notes.append("本专业备注含体检要求，建议核实当年招生章程确认录取条件")
    if is_new_flag == "新增":
        notes.append("新增专业，无往年录取数据参考，实际录取位次可能大幅波动")
    if ref_rank is None and is_new_flag != "新增":
        notes.append("无任何往年录取数据，参考价值低，建议谨慎填报")
    if city_tier and ("四线" in city_tier or "五线" in city_tier):
        notes.append(f"校区位于{city_tier}城市，区位偏远，实习就业资源相对有限")
    if plan_count is not None and plan_count <= 2:
        notes.append(f"2026 计划招生 {int(plan_count)} 人，计划数过少，录取位次波动风险高")
    min_rank_1 = safe_float(c.get("min_rank_1"))
    min_rank_3 = safe_float(c.get("min_rank_3"))
    if min_rank_1 and min_rank_3 and min_rank_1 > 0 and min_rank_3 > 0:
        diff = abs(min_rank_1 - min_rank_3) / max(min_rank_1, min_rank_3)
        if diff >= 0.30:
            notes.append(f"近三年最低位次波动幅度 {int(diff*100)}%，稳定性较差")
    if admission_rule and "级差" in admission_rule:
        notes.append("录取规则为专业级差，志愿排序需谨慎，建议放在前部位置")
    if tier == "冲":
        notes.append("冲档志愿，录取位次显著优于考生，存在落榜风险")

    if not notes:
        return "暂无明显风险，建议核实当年招生章程"
    return "；".join(notes) + "。"


def build_keep_priority(c, tier, total):
    """生成 keep_priority。"""
    ownership = c.get("ownership", "") or ""
    major_note = c.get("major_note", "") or ""
    tuition = safe_float(c.get("tuition"))
    is_new_flag = c.get("is_new", "")

    # 风险项标"慎重考虑"
    if "民办" in ownership or "中外合作" in ownership or is_high_tuition(major_note, tuition):
        return "慎重考虑"
    if is_new_flag == "新增":
        return "慎重考虑"

    # 稳档高分 -> 优先保留
    if tier == "稳" and total >= 70:
        return "建议优先保留"
    if tier == "保底" and "公办" in ownership:
        return "可备选"
    if tier == "冲":
        return "可备选"
    return "可备选"


def rank_and_score(candidates, student):
    """对所有候选打分、分档、排序，返回处理后的列表。"""
    R = float(student["rank"])
    processed = []
    for c in candidates:
        ref_rank = get_ref_rank(c)
        tier = determine_tier(c, R, ref_rank)
        score = total_score(c, student, R, ref_rank)
        reason = build_reason(c, student, R, ref_rank, tier)
        risk_note = build_risk_note(c, student, R, ref_rank, tier)
        keep_priority = build_keep_priority(c, tier, score)

        c_out = dict(c)
        c_out["ref_rank"] = int(ref_rank) if ref_rank else None
        c_out["rank_diff"] = int(ref_rank - R) if ref_rank else None
        c_out["tier"] = tier
        c_out["score"] = round(score, 2)
        c_out["reason"] = reason
        c_out["risk_note"] = risk_note
        c_out["keep_priority"] = keep_priority
        c_out["is_high_tuition"] = is_high_tuition(c.get("major_note", ""), safe_float(c.get("tuition")))
        c_out["is_health_risk"] = is_health_risk_item(c.get("major_note", ""), c.get("admission_rule", ""), c.get("major_name", ""))
        processed.append(c_out)

    # 分组
    groups = {"冲": [], "稳": [], "保底": [], "新增": []}
    for c in processed:
        groups[c["tier"]].append(c)

    # 组内排序
    # 冲：ref_rank 越高（越接近 R）越稳，但冲的本质是 ref_rank < R*0.85，所以按 ref_rank 降序（接近 R 的在前）
    groups["冲"].sort(key=lambda x: -(x["ref_rank"] or 0))
    # 稳：ref_rank 接近 R 的在前
    groups["稳"].sort(key=lambda x: abs((x["ref_rank"] or R) - R))
    # 保底：ref_rank 接近 R 的在前（兜得更稳的在后）
    groups["保底"].sort(key=lambda x: (x["ref_rank"] or R))
    # 新增：按 score 降序
    groups["新增"].sort(key=lambda x: -x["score"])

    # 组内再按 score 微调（稳定排序：先按 score 降序，再按上述位次接近度）
    for k in groups:
        groups[k].sort(key=lambda x: -x["score"])
        # 二次排序：保留同分时位次接近度
        # 使用稳定排序，所以同分时前面的位次排序仍然有效

    # 民办/中外合作/高收费排到同组末尾
    for k in groups:
        risk_items = []
        normal_items = []
        for c in groups[k]:
            ownership = c.get("ownership", "") or ""
            if ("民办" in ownership or "中外合作" in ownership or
                c.get("is_high_tuition", False)):
                risk_items.append(c)
            else:
                normal_items.append(c)
        groups[k] = normal_items + risk_items

    return groups


def pick_100(groups, target=100):
    """从分组中选 100 个：冲 25-30 / 稳 35-45 / 保底 25-30 / 新增 0-10。

    总数严格等于 100（候选不足时按实际数量）。
    """
    # 默认配额：25 + 40 + 25 + 10 = 100
    quotas = {"冲": 25, "稳": 40, "保底": 25, "新增": 10}

    # 限制不超过实际候选
    for k in quotas:
        quotas[k] = min(quotas[k], len(groups[k]))

    # 不足 100 时按优先级补：稳 -> 冲 -> 保底 -> 新增
    order = ["稳", "冲", "保底", "新增"]
    while sum(quotas.values()) < target:
        added = False
        for k in order:
            max_cap = {"冲": 30, "稳": 45, "保底": 30, "新增": 10}[k]
            if quotas[k] < min(len(groups[k]), max_cap):
                quotas[k] += 1
                added = True
                if sum(quotas.values()) >= target:
                    break
        if not added:
            break  # 候选不足

    picked = []
    for k in ["冲", "稳", "保底", "新增"]:
        picked.extend(groups[k][:quotas[k]])

    # 如果仍不足 100，从剩余候选中按 score 补
    # 严格限制每个档位上限：冲 30 / 稳 45 / 保底 30 / 新增 10
    max_caps = {"冲": 30, "稳": 45, "保底": 30, "新增": 10}
    if len(picked) < target:
        # 统计当前已选各档位数量
        picked_count_by_tier = {"冲": 0, "稳": 0, "保底": 0, "新增": 0}
        for c in picked:
            picked_count_by_tier[c["tier"]] = picked_count_by_tier.get(c["tier"], 0) + 1

        # 收集剩余候选，按 score 降序
        remaining = []
        for k in ["冲", "稳", "保底", "新增"]:
            remaining.extend(groups[k][quotas[k]:])
        remaining.sort(key=lambda x: -x["score"])

        for c in remaining:
            if len(picked) >= target:
                break
            tier = c["tier"]
            # 检查该档位是否已达上限
            if picked_count_by_tier.get(tier, 0) >= max_caps.get(tier, 0):
                continue
            picked.append(c)
            picked_count_by_tier[tier] = picked_count_by_tier.get(tier, 0) + 1

    # 编号
    for i, c in enumerate(picked, 1):
        c["seq"] = i

    return picked


def main():
    parser = argparse.ArgumentParser(description="山东高考志愿分档评分排序")
    parser.add_argument("--input", default="candidates.json", help="候选 JSON 文件路径")
    parser.add_argument("--output", default="volunteers_100.json", help="输出 100 志愿 JSON 文件路径")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"[ERROR] 输入文件不存在: {args.input}", file=sys.stderr)
        sys.exit(1)

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    student = data["student"]
    candidates = data["candidates"]
    excluded = data.get("excluded", [])

    # 校验 rank 必须为正数
    R_raw = student.get("rank")
    if not isinstance(R_raw, (int, float)) or R_raw <= 0:
        print(f"[ERROR] 学生位次 rank 非法（必须为正数）：{R_raw}", file=sys.stderr)
        sys.exit(1)

    groups = rank_and_score(candidates, student)
    picked = pick_100(groups, target=100)

    # 统计
    overview = {
        "total": len(picked),
        "冲": len([c for c in picked if c["tier"] == "冲"]),
        "稳": len([c for c in picked if c["tier"] == "稳"]),
        "保底": len([c for c in picked if c["tier"] == "保底"]),
        "新增": len([c for c in picked if c["tier"] == "新增"]),
        "民办": len([c for c in picked if "民办" in (c.get("ownership") or "")]),
        "中外合作": len([c for c in picked if "中外合作" in (c.get("ownership") or "") or "合作" in (c.get("ownership") or "")]),
        "高收费": len([c for c in picked if c.get("is_high_tuition", False)]),
        "体检风险": len([c for c in picked if c.get("is_health_risk", False)]),
        "公办": len([c for c in picked if "公办" in (c.get("ownership") or "")]),
    }

    output = {
        "student": student,
        "overview": overview,
        "volunteers": picked,
        "excluded": excluded,
        "candidate_count": len(candidates),
        "picked_count": len(picked),
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"[OK] 选中 {len(picked)} 个志愿")
    print(f"     冲 {overview['冲']} | 稳 {overview['稳']} | 保底 {overview['保底']} | 新增 {overview['新增']}")
    print(f"     民办 {overview['民办']} | 中外合作 {overview['中外合作']} | 高收费 {overview['高收费']} | 体检风险 {overview['体检风险']}")
    print(f"     输出: {args.output}")
    if len(picked) < 100:
        print(f"[WARN] 候选不足 100，实际选中 {len(picked)} 个")


if __name__ == "__main__":
    main()
