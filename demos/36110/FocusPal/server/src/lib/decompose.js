/** 三级拆解：阶段 → 任务分组 → 每日行动 */

export const PRESET_TEMPLATES = [
  {
    id: 'kaoyan_english',
    name: '考研英语',
    icon: '📚',
    keywords: ['考研英语', '英语考研', '考研 英语'],
    phases: [
      {
        title: '基础阶段',
        groups: [
          {
            title: '词汇背诵',
            actions: ['每天背 50 个新词', '复习前日 100 词', '周末完成词汇小测'],
          },
          {
            title: '语法学习',
            actions: ['学习 1 个语法专题', '完成 20 道语法题', '整理语法错题笔记'],
          },
          {
            title: '阅读训练',
            actions: ['精读 1 篇真题阅读', '积累 10 个长难句', '复盘阅读错题'],
          },
        ],
      },
      {
        title: '强化阶段',
        groups: [
          {
            title: '真题演练',
            actions: ['完成 1 套阅读真题', '分析错题原因', '总结解题技巧'],
          },
          {
            title: '写作提升',
            actions: ['背诵 2 篇范文', '仿写 1 篇作文', '修改并润色'],
          },
        ],
      },
      {
        title: '冲刺阶段',
        groups: [
          {
            title: '模考冲刺',
            actions: ['限时完成 1 套模拟卷', '对照答案订正', '查漏补缺重点'],
          },
        ],
      },
    ],
  },
  {
    id: 'cet',
    name: '四六级',
    icon: '🎓',
    keywords: ['四级', '六级', '四六级', 'cet4', 'cet6'],
    phases: [
      {
        title: '词汇基础',
        groups: [
          {
            title: '核心词汇',
            actions: ['背诵 80 个高频词', '听写 30 个易错词', '复习本周词汇'],
          },
        ],
      },
      {
        title: '专项突破',
        groups: [
          {
            title: '听力训练',
            actions: ['精听 1 段听力材料', '跟读模仿 3 遍', '完成 5 道听力题'],
          },
          {
            title: '阅读写作',
            actions: ['完成 2 篇阅读理解', '写 1 篇 120 词作文', '修改语法错误'],
          },
        ],
      },
      {
        title: '考前冲刺',
        groups: [
          {
            title: '模拟测试',
            actions: ['完成 1 套真题', '分析失分点', '制定明日计划'],
          },
        ],
      },
    ],
  },
  {
    id: 'programming',
    name: '编程学习',
    icon: '💻',
    keywords: ['编程', '代码', '开发', 'react', 'vue', 'python', 'javascript'],
    phases: [
      {
        title: '入门基础',
        groups: [
          {
            title: '语法核心',
            actions: ['学习 1 个语法概念', '完成 10 道练习题', '写 1 段示例代码'],
          },
          {
            title: '环境搭建',
            actions: ['安装开发工具', '运行 Hello World', '熟悉调试流程'],
          },
        ],
      },
      {
        title: '项目实战',
        groups: [
          {
            title: '功能开发',
            actions: ['实现 1 个小功能', '编写单元测试', '代码 Review 优化'],
          },
        ],
      },
      {
        title: '进阶提升',
        groups: [
          {
            title: '架构与性能',
            actions: ['阅读 1 篇技术文章', '重构 1 处代码', '总结学习笔记'],
          },
        ],
      },
    ],
  },
  {
    id: 'exam_general',
    name: '通用备考',
    icon: '📝',
    keywords: ['考试', '考研', '备考', '复习'],
    phases: [
      {
        title: '知识梳理',
        groups: [
          {
            title: '教材通读',
            actions: ['阅读 1 章教材', '整理知识框架', '标注重点难点'],
          },
        ],
      },
      {
        title: '强化练习',
        groups: [
          {
            title: '刷题巩固',
            actions: ['完成 30 道练习题', '订正错题', '归纳解题方法'],
          },
        ],
      },
      {
        title: '冲刺模考',
        groups: [
          {
            title: '模拟考试',
            actions: ['限时完成模拟卷', '分析得分情况', '调整复习策略'],
          },
        ],
      },
    ],
  },
]

const CLARIFICATION_RULES = [
  {
    test: (goal) => /提升.*英语|提高.*英语|学英语|英语能力/.test(goal),
    unless: (c) => c.focus,
    question: {
      id: 'focus',
      text: '你想重点提升哪方面？',
      options: ['词汇', '听力', '阅读', '写作', '全面备考（考研）'],
    },
  },
  {
    test: (goal) => /^(学习|提升|进步|变好)/.test(goal.trim()) && goal.length < 8,
    unless: (c) => c.category,
    question: {
      id: 'category',
      text: '你的学习目标属于哪一类？',
      options: ['考研/考试', '四六级', '编程开发', '其他技能'],
    },
  },
  {
    test: (goal) => /编程|代码|开发/.test(goal) && !/python|javascript|vue|react|java|前端|后端/i.test(goal),
    unless: (c) => c.tech,
    question: {
      id: 'tech',
      text: '你想学习哪种技术方向？',
      options: ['前端 (Vue/React)', 'Python', 'JavaScript 基础', '全栈开发'],
    },
  },
]

function matchTemplate(goal, clarifications = {}) {
  const lower = goal.toLowerCase()

  if (clarifications.focus === '全面备考（考研）' || /考研英语/.test(goal)) {
    return PRESET_TEMPLATES.find((t) => t.id === 'kaoyan_english')
  }
  if (clarifications.category === '四六级' || /四级|六级|cet/.test(lower)) {
    return PRESET_TEMPLATES.find((t) => t.id === 'cet')
  }
  if (
    clarifications.category === '编程开发' ||
    clarifications.tech ||
    /编程|代码|开发|python|javascript|vue|react/.test(lower)
  ) {
    return PRESET_TEMPLATES.find((t) => t.id === 'programming')
  }
  if (clarifications.category === '考研/考试' || /考试|考研|备考/.test(goal)) {
    return PRESET_TEMPLATES.find((t) => t.id === 'exam_general')
  }

  for (const template of PRESET_TEMPLATES) {
    if (template.keywords.some((kw) => lower.includes(kw.toLowerCase()) || goal.includes(kw))) {
      return template
    }
  }

  return null
}

function buildFromTemplate(template, goal) {
  const phases = template.phases.map((phase) => ({
    title: phase.title,
    level: 1,
    groups: phase.groups.map((group) => ({
      title: group.title,
      level: 2,
      actions: group.actions.map((action) => ({
        title: action,
        level: 3,
      })),
    })),
  }))

  return {
    title: goal,
    template_id: template.id,
    template_name: template.name,
    phases,
    total_actions: phases.reduce(
      (sum, p) => sum + p.groups.reduce((s, g) => s + g.actions.length, 0),
      0
    ),
  }
}

function buildGeneric(goal) {
  const phases = [
    {
      title: '准备阶段',
      level: 1,
      groups: [
        {
          title: '目标明确',
          level: 2,
          actions: [
            { title: '明确学习目标与截止时间', level: 3 },
            { title: '收集所需学习资料', level: 3 },
          ],
        },
      ],
    },
    {
      title: '执行阶段',
      level: 1,
      groups: [
        {
          title: '每日学习',
          level: 2,
          actions: [
            { title: '完成今日核心学习任务', level: 3 },
            { title: '复习昨日内容', level: 3 },
            { title: '记录学习笔记', level: 3 },
          ],
        },
      ],
    },
    {
      title: '巩固阶段',
      level: 1,
      groups: [
        {
          title: '总结复盘',
          level: 2,
          actions: [
            { title: '周总结与自测', level: 3 },
            { title: '调整下周计划', level: 3 },
          ],
        },
      ],
    },
  ]

  return {
    title: goal,
    template_id: 'generic',
    template_name: '智能生成',
    phases,
    total_actions: 7,
  }
}

export function analyzeGoal(goal, clarifications = {}, templateId = null) {
  const trimmed = (goal || '').trim()
  if (!trimmed) {
    return { error: '请输入学习目标' }
  }

  if (templateId) {
    const template = PRESET_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      return { preview: buildFromTemplate(template, trimmed) }
    }
  }

  for (const rule of CLARIFICATION_RULES) {
    if (rule.test(trimmed) && !rule.unless(clarifications)) {
      return {
        needs_clarification: true,
        questions: [rule.question],
        partial_goal: trimmed,
      }
    }
  }

  const template = matchTemplate(trimmed, clarifications)
  if (template) {
    return { preview: buildFromTemplate(template, trimmed) }
  }

  return { preview: buildGeneric(trimmed) }
}

export function listTemplates() {
  return PRESET_TEMPLATES.map(({ id, name, icon, keywords }) => ({
    id,
    name,
    icon,
    keywords,
  }))
}
