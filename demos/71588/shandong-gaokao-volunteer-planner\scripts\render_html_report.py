# -*- coding: utf-8 -*-
"""
render_html_report.py
=====================

读取 volunteers_100.json 与学生信息，渲染单文件 HTML 报告。

输出：
  - 单文件 HTML，CSS/JS/数据全部内嵌
  - 用户双击即可打开，不需要启动服务器
  - 顶部有"冲档分析""稳档分析""保底分析"三个入口按钮
  - 主表支持筛选/搜索
  - 每行包含推荐理由和风险提醒
  - 民办/中外合作/高收费/新增专业用特殊颜色标注

用法：
  python render_html_report.py --input volunteers_100.json --output 山东高考志愿100方案.html
"""

import argparse
import datetime
import json
import os
import sys

TEMPLATE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             "..", "assets", "report-template.html")


def build_top10_cards(volunteers):
    """构建最值得保留的 10 个志愿卡片 HTML。"""
    # 按 score 降序 + keep_priority 优先
    priority_order = {"建议优先保留": 0, "可备选": 1, "慎重考虑": 2}
    sorted_v = sorted(volunteers,
                      key=lambda x: (-x.get("score", 0),
                                     priority_order.get(x.get("keep_priority", ""), 3)))
    top10 = sorted_v[:10]

    cards = []
    for c in top10:
        tier = c.get("tier", "")
        tier_class = {"冲": "tier-chong", "稳": "tier-wen",
                      "保底": "tier-bao", "新增": "tier-new"}.get(tier, "")
        risk_class = ""
        ownership = c.get("ownership", "") or ""
        if "民办" in ownership:
            risk_class = "card-minban"
        elif "中外合作" in ownership or "合作" in ownership:
            risk_class = "card-coop"
        elif c.get("is_high_tuition", False):
            risk_class = "card-highfee"

        cards.append(f"""
        <div class="top-card {risk_class}">
          <div class="card-header">
            <span class="tier-tag {tier_class}">{tier}</span>
            <span class="card-school">{c.get('school_name','')}</span>
            <span class="card-score">评分 {c.get('score',0)}</span>
          </div>
          <div class="card-major">{c.get('major_full_name') or c.get('major_name','')}</div>
          <div class="card-meta">
            <span>📍 {c.get('city','')}</span>
            <span>🏫 {c.get('ownership','')}</span>
            <span>💰 {int(c.get('tuition') or 0)}元/年</span>
            <span>📊 位次 {c.get('ref_rank') or '无'}</span>
          </div>
          <div class="card-reason">✅ {c.get('reason','')}</div>
          <div class="card-risk">⚠️ {c.get('risk_note','')}</div>
          <div class="card-priority">优先级：{c.get('keep_priority','')}</div>
        </div>
        """)

    return "\n".join(cards)


def build_analysis_chong(volunteers, student):
    """构建冲档分析 HTML。"""
    chong = [c for c in volunteers if c.get("tier") == "冲"]
    R = student.get("rank", 0)

    schools = set()
    cities = set()
    for c in chong:
        schools.add(c.get("school_name", ""))
        cities.add(c.get("city", ""))

    double_first = [c for c in chong if c.get("school_tags") and
                    ("双一流" in c.get("school_tags", "") or
                     "985" in c.get("school_tags", "") or
                     "211" in c.get("school_tags", ""))]

    html = f"""
    <h2>🎯 冲档分析</h2>
    <div class="analysis-stat">
      <p>本方案冲档共 <strong>{len(chong)}</strong> 个志愿，建议排在 96 个平行志愿的前 25-30 位。</p>
      <p>涉及院校 {len(schools)} 所，覆盖城市 {len(cities)} 个。其中双一流/985/211 院校志愿 {len(double_first)} 个。</p>
    </div>
    <h3>冲档的核心</h3>
    <p>冲档的核心是<strong>录取位次显著优于考生位次</strong>（参考位次通常低于考生位次 15% 以上），存在落榜风险，但学校或专业价值值得尝试。冲档不是赌博，而是用低概率博取高价值录取机会。</p>
    <h3>哪些值得冲</h3>
    <ul>
      <li>学校层次明显提升（如双一流、985、211、省属重点）。</li>
      <li>专业方向与考生偏好匹配（命中 preferred_majors）。</li>
      <li>城市意向匹配（命中 preferred_cities）。</li>
      <li>有硕士点、博士点、学科评估 B 类以上。</li>
    </ul>
    <h3>哪些只是看起来好但不适合</h3>
    <ul>
      <li>冲档专业与考生明确排斥方向冲突（本方案已在硬过滤阶段排除）。</li>
      <li>冲档中外合作但学费超限（本方案已按 tuition_limit 过滤）。</li>
      <li>冲档校区偏远（四线/五线城市），实习就业资源受限。</li>
      <li>冲档体检受限专业（本方案已结合 health_limits 排除冲突项）。</li>
    </ul>
    <div class="teacher-advice">
      <h3>👨‍🏫 老师建议</h3>
      <p>本考生位次 {R}，冲档区间参考位次约 {int(R*0.65)}~{int(R*0.85)}。建议冲档控制在 25-30 个以内，避免冲档过多导致滑档。冲档志愿建议放在 96 个志愿的前 1-30 位，但务必确保后方稳档和保底充足。本方案冲档中公办占比应≥80%，民办/中外合作冲档需谨慎评估。</p>
      <p>请重点关注本方案冲档卡片中标注"建议优先保留"的志愿，这些是综合评分最高的冲档候选。</p>
    </div>
    """
    return html


def build_analysis_wen(volunteers, student):
    """构建稳档分析 HTML。"""
    wen = [c for c in volunteers if c.get("tier") == "稳"]
    R = student.get("rank", 0)

    gongban = [c for c in wen if "公办" in (c.get("ownership") or "")]
    has_master = [c for c in wen if c.get("major_master_degree")]
    has_phd = [c for c in wen if c.get("major_phd_degree")]
    has_eval = [c for c in wen if c.get("subject_evaluation")]

    html = f"""
    <h2>✅ 稳档分析</h2>
    <div class="analysis-stat">
      <p>本方案稳档共 <strong>{len(wen)}</strong> 个志愿，建议排在 96 个平行志愿的中部（第 30-75 位左右），是录取的主力区间。</p>
      <p>公办 {len(gongban)} 个，有硕士点 {len(has_master)} 个，有博士点 {len(has_phd)} 个，有学科评估 {len(has_eval)} 个。</p>
    </div>
    <h3>稳档的核心</h3>
    <p>稳档是<strong>位次接近考生</strong>（参考位次在考生位次 ±15% 以内）的志愿，录取概率较高。稳档是 96 个志愿的中坚，应优先保证<strong>专业满意度、城市意向、公办属性、考研考公适配度</strong>。</p>
    <h3>稳档应重点考察</h3>
    <ul>
      <li>学科评估（A/B 类反映学科实力）。</li>
      <li>硕士点、博士点（关系考研深造）。</li>
      <li>保研率（部分高校公布，反映深造机会）。</li>
      <li>专业水平（国家级一流/省级一流本科专业）。</li>
      <li>录取规则（分数优先 / 专业优先 / 专业级差，影响志愿排序策略）。</li>
    </ul>
    <div class="teacher-advice">
      <h3>👨‍🏫 老师建议</h3>
      <p>本考生位次 {R}，稳档区间参考位次约 {int(R*0.85)}~{int(R*1.15)}。建议稳档 35-45 个，是 96 个志愿的主体。专业方向上应优先匹配考生偏好（{", ".join(student.get("preferred_majors", [])) or "未指定"}），城市上优先匹配偏好城市（{", ".join(student.get("preferred_cities", [])) or "未指定"}）。</p>
      <p>录取规则为"专业级差"的院校，建议把心仪专业放在该院校志愿的第一位，避免被级差扣分。录取规则为"分数优先"的院校，志愿排序相对灵活。</p>
      <p>稳档志愿建议重点保留"建议优先保留"标记的项，这些综合评分高、录取概率大、专业匹配度好。</p>
    </div>
    """
    return html


def build_analysis_bao(volunteers, student):
    """构建保底分析 HTML。"""
    bao = [c for c in volunteers if c.get("tier") == "保底"]
    R = student.get("rank", 0)

    gongban = [c for c in bao if "公办" in (c.get("ownership") or "")]
    minban = [c for c in bao if "民办" in (c.get("ownership") or "")]
    coop = [c for c in bao if "中外合作" in (c.get("ownership") or "") or "合作" in (c.get("ownership") or "")]
    highfee = [c for c in bao if c.get("is_high_tuition", False)]

    html = f"""
    <h2>🛡️ 保底分析</h2>
    <div class="analysis-stat">
      <p>本方案保底共 <strong>{len(bao)}</strong> 个志愿，建议排在 96 个平行志愿的后 20-25 位。</p>
      <p>公办兜底 {len(gongban)} 个，民办 {len(minban)} 个，中外合作 {len(coop)} 个，高收费 {len(highfee)} 个。</p>
    </div>
    <h3>保底的核心</h3>
    <p>保底的核心是<strong>保证本科和底线可接受，避免滑档</strong>。录取位次显著低于考生位次（参考位次高于考生位次 15% 以上），录取概率高。保底不是凑数，而是真正的安全网。</p>
    <h3>保底策略</h3>
    <ul>
      <li>公办保底优先，建议至少 5-10 个公办本科兜底。</li>
      <li>民办、中外合作、高收费可作为补充保底，但必须强备注学费、性质、风险。</li>
      <li>保底不能太少，避免全部依赖冲稳导致滑档。</li>
      <li>保底专业尽量选可接受的，避免"为了保底而读完全不喜欢的专业"。</li>
    </ul>
    <div class="warning-box">
      <h3>⚠️ 重点提醒</h3>
      <p>民办院校学费通常 1.5-3 万/年，社会认可度低于公办；中外合作学费通常 5-15 万/年，培养模式特殊；高收费专业学费可高达 19 万/年。本方案中：</p>
      <ul>
        <li>民办保底志愿 {len(minban)} 个，已强备注学费与性质。</li>
        <li>中外合作保底志愿 {len(coop)} 个，已强备注培养模式与学位授予方式。</li>
        <li>高收费保底志愿 {len(highfee)} 个，已强备注家庭经济压力。</li>
      </ul>
      <p>这些志愿<strong>不得伪装成优先推荐</strong>，在主表中已用橙黄色背景醒目标注，请家庭务必确认经济承受能力后再决定是否保留。</p>
    </div>
    <div class="teacher-advice">
      <h3>👨‍🏫 老师建议</h3>
      <p>本考生位次 {R}，保底区间参考位次约 {int(R*1.15)}~{int(R*1.45)}。建议保底 25-30 个。如果家庭经济条件允许，民办/中外合作可作为保底补充；如果学费敏感，请重点保留公办保底，并在最终 96 个志愿中确保至少 10 个公办兜底。</p>
      <p>本方案中标注"慎重考虑"的保底志愿（民办/中外合作/高收费）建议放在 96 个志愿的最后几位，仅作兜底用途，不应挤占稳档位置。</p>
    </div>
    """
    return html


def render_html(data, template_path, output_path):
    """渲染 HTML 报告。"""
    student = data["student"]
    volunteers = data["volunteers"]
    overview = data["overview"]

    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    # 学生画像
    student_info = {
        "year": student.get("year", ""),
        "province": student.get("province", ""),
        "score": student.get("score", ""),
        "rank": student.get("rank", ""),
        "elective": student.get("elective", []),
        "single_subjects": student.get("single_subjects", {}),
        "priorities": student.get("priorities", []),
        "tuition_limit": student.get("tuition_limit", ""),
        "acceptable_ownership": student.get("acceptable_ownership", []),
        "preferred_majors": student.get("preferred_majors", []),
        "preferred_cities": student.get("preferred_cities", []),
        "preferred_disciplines": student.get("preferred_disciplines", []),
        "health_limits": student.get("health_limits", "无"),
        "acceptable_provinces": student.get("acceptable_provinces", []),
        "unacceptable_provinces": student.get("unacceptable_provinces", []),
    }

    # 替换占位符
    html = template.replace("{{STUDENT_INFO}}", json.dumps(student_info, ensure_ascii=False))
    html = html.replace("{{VOLUNTEERS_DATA}}", json.dumps(volunteers, ensure_ascii=False))
    html = html.replace("{{OVERVIEW}}", json.dumps(overview, ensure_ascii=False))
    html = html.replace("{{TOP10}}", build_top10_cards(volunteers))
    html = html.replace("{{ANALYSIS_CHONG}}", build_analysis_chong(volunteers, student))
    html = html.replace("{{ANALYSIS_WEN}}", build_analysis_wen(volunteers, student))
    html = html.replace("{{ANALYSIS_BAO}}", build_analysis_bao(volunteers, student))

    generated_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    html = html.replace("{{GENERATED_AT}}", generated_at)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    return output_path


def main():
    parser = argparse.ArgumentParser(description="渲染山东高考志愿 HTML 报告")
    parser.add_argument("--input", default="volunteers_100.json", help="100 志愿 JSON 文件路径")
    parser.add_argument("--output", default="山东高考志愿100方案.html", help="输出 HTML 文件路径")
    parser.add_argument("--template", default=None, help="HTML 模板路径（默认使用 assets/report-template.html）")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"[ERROR] 输入文件不存在: {args.input}", file=sys.stderr)
        sys.exit(1)

    template_path = args.template or os.path.normpath(TEMPLATE_PATH)
    if not os.path.exists(template_path):
        print(f"[ERROR] HTML 模板不存在: {template_path}", file=sys.stderr)
        sys.exit(1)

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    output_path = render_html(data, template_path, args.output)

    print(f"[OK] HTML 报告已生成: {output_path}")
    print(f"     志愿数量: {len(data['volunteers'])}")
    print(f"     生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"     双击文件即可在浏览器中打开")


if __name__ == "__main__":
    main()
