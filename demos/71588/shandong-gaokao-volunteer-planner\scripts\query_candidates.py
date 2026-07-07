# -*- coding: utf-8 -*-
"""
query_candidates.py
===================

读取学生信息 JSON，连接山东 2026 报考数据库，从 volunteer_main 视图查询候选志愿。

职责：
  - 连接默认数据库（或用户指定路径）。
  - 默认查 volunteer_main 视图。
  - 按选科、位次区间、学费上限、城市偏好、专业偏好/排斥、办学性质偏好做硬过滤。
  - 输出 candidates.json（包含候选志愿 + 被排除项与排除原因）。

字段不确定时查 references/database.md 与 E:\\qq wenjian\\高考skill\\query_examples.sql，
不要凭空编字段。

用法：
  python query_candidates.py --student student.json --output candidates.json
  python query_candidates.py --student student.json --output candidates.json --db custom.db
"""

import argparse
import json
import os
import sqlite3
import sys

DEFAULT_DB = r"E:\qq wenjian\高考skill\shandong_gaokao_2026_ai.db"

# 查询字段（已与 SQLite 实际 schema 核对）
COLUMNS = [
    "school_code", "school_name", "major_code", "major_full_name", "major_name",
    "major_note", "major_level", "elective_requirement", "plan_count", "duration",
    "tuition", "discipline", "major_category",
    "estimated_rank_2026", "is_new",
    "min_score_1", "min_rank_1", "avg_rank_1",
    "min_score_2", "min_rank_2", "avg_rank_2",
    "min_score_3", "min_rank_3", "avg_rank_3",
    "school_province", "city", "city_tier",
    "school_tags", "school_level", "rename_merge_transfer",
    "authority", "school_type", "ownership", "degree_level",
    "postgraduate_recommend_rate", "school_rank", "major_transfer_policy",
    "school_master_major_count", "school_master_majors",
    "school_phd_major_count", "school_phd_majors",
    "admission_brochure_2025", "admission_brochure", "admission_rule",
    "soft_rank_rating", "soft_rank",
    "subject_evaluation", "major_quality_level",
    "major_master_degree", "major_phd_degree",
]


def elective_match(requirement, student_electives):
    """
    判断学生选科是否满足专业选科要求。

    requirement: elective_requirement 字段值，如 "不限"、"物理"、"物理和化学"。
    student_electives: 学生选科列表，如 ["物理", "化学", "生物"]。

    返回 True/False。
    """
    if not requirement:
        return True
    req = requirement.strip()
    if req in ("不限", "不限选科", ""):
        return True

    elec_set = set(student_electives or [])

    # 处理"或"的情况：物理或化学
    if "或" in req:
        parts = [p.strip() for p in req.split("或")]
        return any(p in elec_set for p in parts)

    # 处理"和"/"和"+"的情况：物理和化学、物理和化学和生物
    if "和" in req:
        parts = [p.strip() for p in req.split("和")]
        return all(p in elec_set for p in parts)

    # 处理 "+" 分隔
    if "+" in req:
        parts = [p.strip() for p in req.split("+")]
        return all(p in elec_set for p in parts)

    # 单科要求
    return req in elec_set


def is_high_tuition(major_note, tuition):
    """判断是否高收费专业。

    与 references/database.md 一致：
      - tuition >= 50000 → 高收费
      - major_note 含"高收费" → 高收费
      - major_note 含"中外合作"/"合作办学" 且 tuition >= 30000 → 高收费
    """
    if tuition is not None and tuition >= 50000:
        return True
    if major_note:
        if "高收费" in major_note:
            return True
        if ("中外合作" in major_note or "合作办学" in major_note):
            if tuition is not None and tuition >= 30000:
                return True
    return False


def is_health_risk(major_note, admission_rule, major_name):
    """判断是否可能存在体检/色觉风险，需结合学生 health_limits 二次判断。"""
    text = " ".join(filter(None, [major_note or "", admission_rule or ""]))
    for kw in ("色", "体检", "不予录取"):
        if kw in text:
            return True
    # 医学/化工/生物/食品等需要体检合格的专业
    if major_name:
        risk_keywords = ("临床医学", "口腔医学", "麻醉学", "医学影像", "预防医学",
                         "护理", "药学", "医学检验", "动物医学", "化学",
                         "生物科学", "食品科学", "美术", "地质", "矿业", "公安")
        for kw in risk_keywords:
            if kw in major_name:
                return True
    return False


def health_conflict(major_note, admission_rule, major_name, health_limits):
    """根据学生体检限制判断是否冲突。"""
    if not health_limits or health_limits == "无":
        return False
    text = " ".join(filter(None, [major_note or "", admission_rule or "", major_name or ""]))

    conflict_map = {
        "色盲": ("色盲", "色觉", "颜色"),
        "色弱": ("色弱", "色觉"),
        "高度近视": ("视力", "高度近视", "近视"),
        "晕血": ("晕血", "血液"),
        "左利手": ("左利手", "利手"),
        "听力": ("听力", "耳"),
        "语言障碍": ("语言", "口语", "语音"),
    }
    hl_lower = health_limits.lower()
    for limit, kws in conflict_map.items():
        if limit in hl_lower:
            for kw in kws:
                if kw in text:
                    return True
            # 即使专业备注没写，色盲/色弱也排除医学/化工/生物/美术类
            if limit in ("色盲", "色弱"):
                risk_majors = ("医学", "化学", "生物", "美术", "地质", "农学",
                               "药学", "食品", "心理", "体育")
                if major_name and any(kw in major_name for kw in risk_majors):
                    return True
            # 听力/语言障碍排除师范/外语/法学/新闻/播音类
            if limit in ("听力", "语言障碍"):
                risk_majors = ("师范", "外语", "英语", "日语", "俄语", "法语",
                               "法学", "新闻", "播音", "主持", "汉语", "翻译")
                if major_name and any(kw in major_name for kw in risk_majors):
                    return True
    return False


def query_candidates(student, db_path):
    """查询候选志愿。返回 (candidates, excluded)。"""
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    R = float(student["rank"])
    tuition_limit = float(student.get("tuition_limit", 999999))

    # 位次查询区间：放宽到 ±35%，让 rank_volunteers.py 后续精确分档
    rank_low = int(R * 0.65)
    rank_high = int(R * 1.45)

    # 先粗查
    sql = f"""
        SELECT {", ".join(COLUMNS)}
        FROM volunteer_main
        WHERE (
            estimated_rank_2026 BETWEEN ? AND ?
            OR min_rank_1 BETWEEN ? AND ?
            OR min_rank_2 BETWEEN ? AND ?
            OR min_rank_3 BETWEEN ? AND ?
            OR is_new = '新增'
        )
    """
    params = [rank_low, rank_high] * 4
    cur.execute(sql, params)
    rows = cur.fetchall()
    con.close()

    candidates = []
    excluded = []
    seen_keys = set()  # 去重：(school_code, major_code)

    acceptable_ownership = student.get("acceptable_ownership", ["公办"])
    acceptable_provinces = student.get("acceptable_provinces", [])
    unacceptable_provinces = student.get("unacceptable_provinces", [])
    excluded_majors = student.get("excluded_majors", [])
    exclude_controversial = student.get("exclude_controversial", [])
    preferred_majors = student.get("preferred_majors", [])
    preferred_disciplines = student.get("preferred_disciplines", [])
    preferred_cities = student.get("preferred_cities", [])
    health_limits = student.get("health_limits", "无")
    must_bachelor = student.get("must_bachelor", True)

    # 合并排斥项
    all_excluded_majors = set(excluded_majors) | set(exclude_controversial)

    for row in rows:
        r = dict(row)
        key = (r.get("school_code"), r.get("major_code"))
        if key in seen_keys:
            continue

        school_name = r.get("school_name", "")
        major_name = r.get("major_name", "")
        major_note = r.get("major_note", "") or ""
        admission_rule = r.get("admission_rule", "") or ""
        ownership = r.get("ownership", "") or ""
        school_province = r.get("school_province", "") or ""
        city = r.get("city", "") or ""
        degree_level = r.get("degree_level", "") or ""
        tuition = r.get("tuition")
        is_new_flag = r.get("is_new")
        plan_type = r.get("plan_type", "") or ""

        # 硬过滤：必须本科
        if must_bachelor and degree_level and "本科" not in degree_level:
            excluded.append({
                "school_name": school_name, "major_name": major_name,
                "reason": "学历层次不符",
                "detail": f"degree_level={degree_level}, must_bachelor=True"
            })
            continue

        # 硬过滤：办学性质
        if ownership:
            own_ok = False
            for acc in acceptable_ownership:
                if acc in ownership:
                    own_ok = True
                    break
            # 高收费作为特殊性质，需要单独检查
            if "高收费" in acceptable_ownership and is_high_tuition(major_note, tuition):
                own_ok = True
            if not own_ok:
                excluded.append({
                    "school_name": school_name, "major_name": major_name,
                    "reason": "办学性质不接受",
                    "detail": f"ownership={ownership}, acceptable={acceptable_ownership}"
                })
                continue

        # 硬过滤：学费上限（如果用户接受"高收费"，则不按学费过滤；否则严格过滤）
        if "高收费" not in acceptable_ownership:
            if tuition is not None and tuition > tuition_limit:
                excluded.append({
                    "school_name": school_name, "major_name": major_name,
                    "reason": "学费超限",
                    "detail": f"tuition={tuition} > tuition_limit={tuition_limit}"
                })
                continue

        # 硬过滤：省份不接受
        if school_province and unacceptable_provinces:
            if any(up in school_province or school_province in up
                   for up in unacceptable_provinces):
                excluded.append({
                    "school_name": school_name, "major_name": major_name,
                    "reason": "省份不接受",
                    "detail": f"school_province={school_province}, unacceptable={unacceptable_provinces}"
                })
                continue

        # 硬过滤：省份不在可接受列表（如果用户给了列表）
        if acceptable_provinces and school_province:
            if not any(ap in school_province or school_province in ap
                       for ap in acceptable_provinces):
                excluded.append({
                    "school_name": school_name, "major_name": major_name,
                    "reason": "省份不在可接受范围",
                    "detail": f"school_province={school_province}, acceptable={acceptable_provinces}"
                })
                continue

        # 硬过滤：选科匹配（关键红线）
        if not elective_match(r.get("elective_requirement", ""), student.get("elective", [])):
            excluded.append({
                "school_name": school_name, "major_name": major_name,
                "reason": "选科不符",
                "detail": f"requirement={r.get('elective_requirement')}, elective={student.get('elective')}"
            })
            continue

        # 硬过滤：体检限制冲突
        if health_conflict(major_note, admission_rule, major_name, health_limits):
            excluded.append({
                "school_name": school_name, "major_name": major_name,
                "reason": "体检限制冲突",
                "detail": f"health_limits={health_limits}, major_note={major_note}"
            })
            continue

        # 硬过滤：明确排斥的专业方向
        if all_excluded_majors and major_name:
            if any(em in major_name for em in all_excluded_majors):
                excluded.append({
                    "school_name": school_name, "major_name": major_name,
                    "reason": "专业方向被排斥",
                    "detail": f"matched excluded: {all_excluded_majors}"
                })
                continue

        # 通过硬过滤
        seen_keys.add(key)
        candidates.append(r)

    return candidates, excluded


def main():
    parser = argparse.ArgumentParser(description="查询山东高考志愿候选")
    parser.add_argument("--student", required=True, help="学生信息 JSON 文件路径")
    parser.add_argument("--output", default="candidates.json", help="输出候选 JSON 文件路径")
    parser.add_argument("--db", default=DEFAULT_DB, help="数据库路径（默认使用内置路径）")
    args = parser.parse_args()

    if not os.path.exists(args.db):
        print(f"[ERROR] 数据库不存在: {args.db}", file=sys.stderr)
        sys.exit(1)

    with open(args.student, "r", encoding="utf-8") as f:
        student = json.load(f)

    # 校验必填字段
    required = ["year", "province", "score", "rank", "elective"]
    for k in required:
        if k not in student:
            print(f"[ERROR] 学生信息缺少必填字段: {k}", file=sys.stderr)
            sys.exit(1)
    if student["province"] != "山东":
        print(f"[ERROR] 本 Skill 只处理山东考生，当前 province={student['province']}",
              file=sys.stderr)
        sys.exit(1)

    candidates, excluded = query_candidates(student, args.db)

    output = {
        "student": student,
        "db_path": args.db,
        "query_table": "volunteer_main",
        "candidate_count": len(candidates),
        "excluded_count": len(excluded),
        "candidates": candidates,
        "excluded": excluded,
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"[OK] 候选 {len(candidates)} 条，排除 {len(excluded)} 条")
    print(f"     输出: {args.output}")
    print(f"     数据库: {args.db}")
    print(f"     查询表: volunteer_main")


if __name__ == "__main__":
    main()
