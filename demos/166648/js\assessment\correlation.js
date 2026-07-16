// ========== 跨测评关联分析引擎 ==========
// 纯规则引擎：接收标准化分数对象，输出关联洞察数组
// 不直接读 localStorage，由调用方（profile.js）收集数据后传入

// 关联规则定义：当两个或多个测评的特定维度同时满足条件时，生成洞察
var CORRELATION_RULES = [
  // ── RIASEC × Big5 ──
  {
    id: 'riasec_i_big5_o',
    require: ['riasec', 'big5'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'I' && s.big5.O >= 4;
    },
    title: '研究型 × 开放性高',
    insight: '你对抽象思考和新观念有强烈兴趣，适合从事需要持续学习和创新的工作。',
    careers: ['研究员', '产品经理', '战略顾问', '数据科学家']
  },
  {
    id: 'riasec_s_big5_a',
    require: ['riasec', 'big5'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'S' && s.big5.A >= 4;
    },
    title: '社会型 × 宜人性高',
    insight: '你天生善于理解他人、乐于助人，在教育、咨询、HR等领域有天然优势。',
    careers: ['教师', '心理咨询师', 'HR', '用户研究']
  },
  {
    id: 'riasec_e_big5_e',
    require: ['riasec', 'big5'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'E' && s.big5.E >= 4;
    },
    title: '企业型 × 外向性高',
    insight: '你具备领导力和影响力，适合在商业、销售、管理岗位发挥能量。',
    careers: ['销售经理', '创业者', '项目经理', '市场总监']
  },
  {
    id: 'riasec_r_big5_c',
    require: ['riasec', 'big5'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'R' && s.big5.C >= 4;
    },
    title: '实用型 × 尽责性高',
    insight: '你动手能力强且做事严谨负责，在工程、技术实操类岗位能快速看到产出。',
    careers: ['工程师', '技术专家', '供应链管理', '质量管控']
  },
  {
    id: 'riasec_a_big5_o',
    require: ['riasec', 'big5'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'A' && s.big5.O >= 4;
    },
    title: '艺术型 × 开放性高',
    insight: '你对美感和创意有双重追求，在设计、内容创作、品牌方向有突出潜力。',
    careers: ['设计师', '内容创作者', '品牌策划', '艺术指导']
  },
  {
    id: 'riasec_c_big5_c',
    require: ['riasec', 'big5'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'C' && s.big5.C >= 4;
    },
    title: '常规型 × 尽责性高',
    insight: '你注重秩序与细节，适合在财务、运营、合规等需要严谨执行的领域发展。',
    careers: ['财务', '审计', '运营管理', '合规专员']
  },

  // ── RIASEC × Anchor ──
  {
    id: 'riasec_i_anchor_technical',
    require: ['riasec', 'anchor'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'I' && s.anchor === '技术职能型';
    },
    title: '研究型 × 技术职能锚',
    insight: '你既热爱钻研又追求专业深度，在技术专家、研究员等深耕型岗位能获得最大满足感。',
    careers: ['技术专家', '研究员', '数据科学家', '架构师']
  },
  {
    id: 'riasec_e_anchor_management',
    require: ['riasec', 'anchor'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'E' && s.anchor === '管理型';
    },
    title: '企业型 × 管理锚',
    insight: '你天生具备商业嗅觉和领导意愿，在管理岗位上能充分发挥你的影响力和组织能力。',
    careers: ['总经理', '事业部负责人', '销售总监', '创业者']
  },
  {
    id: 'riasec_s_anchor_service',
    require: ['riasec', 'anchor'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'S' && s.anchor === '服务奉献型';
    },
    title: '社会型 × 服务奉献锚',
    insight: '你乐于助人且以服务为核心价值，在教育、医疗、社工等领域能找到强烈的意义感。',
    careers: ['教师', '医生', '心理咨询师', '社工']
  },
  {
    id: 'riasec_r_anchor_technical',
    require: ['riasec', 'anchor'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'R' && s.anchor === '技术职能型';
    },
    title: '实用型 × 技术职能锚',
    insight: '你动手能力强且追求专业精进，在工程、制造、技术实操类岗位能持续成长并获得成就感。',
    careers: ['工程师', '技术专家', '工匠', '质量管控']
  },
  {
    id: 'riasec_a_anchor_autonomy',
    require: ['riasec', 'anchor'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'A' && s.anchor === '自主独立型';
    },
    title: '艺术型 × 自主独立锚',
    insight: '你追求创意表达和自由空间，自由职业、独立创作、工作室模式最能释放你的才华。',
    careers: ['自由设计师', '独立创作者', '艺术指导', '内容创业者']
  },
  {
    id: 'riasec_c_anchor_security',
    require: ['riasec', 'anchor'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'C' && s.anchor === '安全稳定型';
    },
    title: '常规型 × 安全稳定锚',
    insight: '你做事有条理且追求稳定可预期，在体制内、大型企业的行政/财务/运营岗位最为适配。',
    careers: ['公务员', '财务', '行政专员', '运营管理']
  },
  {
    id: 'riasec_i_anchor_management',
    require: ['riasec', 'anchor'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return top === 'I' && s.anchor === '管理型';
    },
    title: '研究型 × 管理锚',
    insight: '你既有钻研精神又有管理意愿，适合走向技术管理路线，从专家型管理者是你的最佳发展路径。',
    careers: ['技术总监', '研发经理', '产品总监', 'CTO']
  },

  // ── Anchor × Values ──
  {
    id: 'anchor_service_values_security',
    require: ['anchor', 'values'],
    condition: function(s) {
      return s.anchor === '服务奉献型' && s.values.security >= 4;
    },
    title: '服务奉献 × 重视安全',
    insight: '你既想贡献社会又追求稳定，公共服务、教育、医疗等领域能同时满足你的双重需求。',
    careers: ['公务员', '教师', '医生', '社工']
  },
  {
    id: 'anchor_autonomy_values_autonomy',
    require: ['anchor', 'values'],
    condition: function(s) {
      return s.anchor === '自主独立型' && s.values.autonomy >= 4;
    },
    title: '自主独立 × 重视自主',
    insight: '你对自由和独立决策有强烈需求，适合自由职业、创业或高度授权的岗位。',
    careers: ['自由职业者', '创业者', '独立顾问', '研究员']
  },
  {
    id: 'anchor_management_values_achievement',
    require: ['anchor', 'values'],
    condition: function(s) {
      return s.anchor === '管理型' && s.values.achievement >= 4;
    },
    title: '管理型 × 追求成就',
    insight: '你既有管理意愿又追求成就感，适合在快节奏的成长型企业中承担领导角色。',
    careers: ['事业部负责人', '创业CEO', '总监', '合伙人']
  },

  // ── DISC × Anchor ──
  {
    id: 'disc_d_anchor_management',
    require: ['disc', 'anchor'],
    condition: function(s) {
      return s.disc.D >= 4 && s.anchor === '管理型';
    },
    title: 'D型 × 管理锚',
    insight: '你天生适合带领团队达成目标，在快节奏、结果导向的环境中如鱼得水。',
    careers: ['运营总监', '事业部负责人', '创业CEO', '咨询合伙人']
  },
  {
    id: 'disc_i_anchor_service',
    require: ['disc', 'anchor'],
    condition: function(s) {
      return s.disc.I >= 4 && s.anchor === '服务奉献型';
    },
    title: 'I型 × 服务奉献',
    insight: '你热情开朗又乐于助人，在需要感染他人、传递价值的岗位有独特优势。',
    careers: ['培训师', '销售', '品牌大使', '社群运营']
  },

  // ── Gallup × RIASEC ──
  {
    id: 'gallup_achiever_riasec_r',
    require: ['gallup', 'riasec'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return s.gallup.indexOf('成就') !== -1 && top === 'R';
    },
    title: '成就优势 × 实用型',
    insight: '你动手能力强且追求成果，在工程、技术、实操类岗位能快速看到产出。',
    careers: ['工程师', '技术专家', '运营', '供应链管理']
  },
  {
    id: 'gallup_strategic_riasec_i',
    require: ['gallup', 'riasec'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return s.gallup.indexOf('战略') !== -1 && top === 'I';
    },
    title: '战略思维 × 研究型',
    insight: '你善于思考且喜欢探索未知，在战略规划、研究分析类岗位能发挥最大价值。',
    careers: ['战略顾问', '分析师', '研究员', '产品规划']
  },

  // ── Aptitude × RIASEC ──
  {
    id: 'aptitude_numerical_riasec_i',
    require: ['aptitude', 'riasec'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return s.aptitude.numerical >= 4 && top === 'I';
    },
    title: '数理优势 × 研究型',
    insight: '你逻辑数理能力强且对研究有热情，在数据科学、量化分析方向有突出潜力。',
    careers: ['数据科学家', '量化分析师', '算法工程师', '金融研究员']
  },
  {
    id: 'aptitude_interpersonal_riasec_s',
    require: ['aptitude', 'riasec'],
    condition: function(s) {
      var top = getTopRIASECType(s.riasec);
      return s.aptitude.interpersonal >= 4 && top === 'S';
    },
    title: '人际优势 × 社会型',
    insight: '你人际交往能力强且乐于助人，在需要高频互动和影响他人的岗位有天然优势。',
    careers: ['HR', '心理咨询师', '用户研究', '社群运营']
  },

  // ── Maturity × Satisfaction ──
  {
    id: 'maturity_high_satisfaction_low',
    require: ['maturity', 'satisfaction'],
    condition: function(s) {
      var avg = (s.maturity.awareness + s.maturity.planning + s.maturity.decision) / 3;
      return avg >= 4 && s.satisfaction.overall < 3;
    },
    title: '高成熟度 × 低满意度',
    insight: '你职业认知清晰但当前工作满意度偏低，是时候认真考虑转型或调整了。利用决策平衡单评估下一步。',
    careers: []
  }
];

// 辅助函数：获取RIASEC最高分类型
function getTopRIASECType(riasecScores) {
  if (!riasecScores) return null;
  var entries = Object.keys(riasecScores).map(function(k) {
    return [k, riasecScores[k]];
  });
  if (entries.length === 0) return null;
  entries.sort(function(a, b) { return b[1] - a[1]; });
  return entries[0][0];
}

// 主入口：生成关联洞察
// scores 标准化结构：
// {
//   riasec: { R:25, I:30, ... } | null,
//   anchor: '管理型' | null,
//   big5: { O:4.2, C:3.5, ... } | null,
//   disc: { D:18, I:12, S:8, C:6 } | null,
//   gallup: ['成就','战略'] | null,
//   values: { achievement:4, security:3, ... } | null,
//   aptitude: { verbal:3, numerical:4, ... } | null,
//   maturity: { awareness:4, planning:3, decision:4 } | null,
//   satisfaction: { work:3, reward:2, people:4, growth:3, overall:3 } | null
// }
function generateCorrelationInsights(scores) {
  var insights = [];
  CORRELATION_RULES.forEach(function(rule) {
    // 检查所需数据是否齐全
    var hasAllData = rule.require.every(function(key) {
      return scores[key] !== null && scores[key] !== undefined;
    });
    if (!hasAllData) return;

    try {
      if (rule.condition(scores)) {
        insights.push({
          id: rule.id,
          title: rule.title,
          insight: rule.insight,
          careers: rule.careers || []
        });
      }
    } catch (e) {
      // 单条规则失败不影响其他
    }
  });
  return insights;
}
