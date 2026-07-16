// ========== 行动计划生成模块 ==========

// 学习资源池
const resourcePool = {
  '互联网': [
    { name: 'Coursera - Google Data Analytics', type: '在线课程', url: 'https://www.coursera.org', desc: '系统学习数据分析基础' },
    { name: 'B站 - 前端开发入门', type: '视频教程', url: 'https://www.bilibili.com', desc: '免费前端开发学习资源' },
    { name: '网易公开课', type: '公开课', url: 'https://open.163.com', desc: '国内外名校课程' },
    { name: '得到APP - 职场技能', type: '知识付费', url: 'https://www.igetget.com', desc: '碎片化学习职场技能' }
  ],
  '金融': [
    { name: 'CFA Institute - 投资基础', type: '在线课程', url: 'https://www.cfainstitute.org', desc: '金融投资知识体系' },
    { name: 'B站 - 财务分析实战', type: '视频教程', url: 'https://www.bilibili.com', desc: '财务分析实操教程' },
    { name: '网易公开课 - 经济学', type: '公开课', url: 'https://open.163.com', desc: '经济学原理课程' }
  ],
  '教育': [
    { name: 'Coursera - Learning How to Learn', type: '在线课程', url: 'https://www.coursera.org', desc: '学习方法论经典课程' },
    { name: 'B站 - 教学设计', type: '视频教程', url: 'https://www.bilibili.com', desc: '教学设计方法学习' }
  ],
  '医疗': [
    { name: 'Coursera - 医学基础', type: '在线课程', url: 'https://www.coursera.org', desc: '医学基础知识体系' },
    { name: '网易公开课 - 公共卫生', type: '公开课', url: 'https://open.163.com', desc: '公共卫生相关课程' }
  ],
  'default': [
    { name: 'Coursera - 职业发展', type: '在线课程', url: 'https://www.coursera.org', desc: '职业规划与发展课程' },
    { name: 'B站 - 职场技能', type: '视频教程', url: 'https://www.bilibili.com', desc: '免费职场技能教程' },
    { name: '网易公开课', type: '公开课', url: 'https://open.163.com', desc: '国内外名校公开课' },
    { name: '得到APP', type: '知识付费', url: 'https://www.igetget.com', desc: '碎片化学习平台' }
  ]
};

// 生成行动计划
function generateActionPlan(career, skillGaps, profile) {
  // 找出差距最大的技能
  const sortedGaps = [...skillGaps].sort((a, b) => (b.required - b.level) - (a.required - a.level));
  const topGap1 = sortedGaps[0] ? sortedGaps[0].name : '核心技能';
  const topGap2 = sortedGaps[1] ? sortedGaps[1].name : '专业技能';

  // 30天：基础准备
  const phase30 = {
    title: '第一阶段（0-30天）',
    subtitle: '基础准备',
    color: 'phase-blue',
    goals: [
      '完成' + career.name + '岗位的全面调研，了解JD核心要求',
      '梳理自身现有技能与目标岗位的差距',
      '建立每日学习计划，每天投入1-2小时'
    ],
    weeklyActions: [
      {
        week: '第1周',
        actions: [
          '收集5份目标岗位JD进行关键词分析',
          '注册相关学习平台账号',
          '加入1-2个行业社群'
        ]
      },
      {
        week: '第2周',
        actions: [
          '开始学习差距最大的核心技能：' + topGap1,
          '完成1个入门级实践项目',
          '整理学习笔记'
        ]
      },
      {
        week: '第3周',
        actions: [
          '深入学习第2项核心技能：' + topGap2,
          '尝试输出1篇学习总结或作品',
          '寻找行业导师或前辈'
        ]
      },
      {
        week: '第4周',
        actions: [
          '完成1个综合实践项目',
          '复盘30天学习成果',
          '调整下一阶段计划'
        ]
      }
    ]
  };

  // 60天：能力提升
  const phase60 = {
    title: '第二阶段（31-60天）',
    subtitle: '能力提升',
    color: 'phase-teal',
    goals: [
      '核心技能达到入门水平',
      '完成2-3个相关实践项目',
      '建立行业人脉网络'
    ],
    weeklyActions: [
      {
        week: '第5-6周',
        actions: [
          '系统学习' + topGap1 + '进阶课程',
          '参与开源项目或实习',
          '每周输出学习笔记'
        ]
      },
      {
        week: '第7-8周',
        actions: [
          '完成进阶实践项目',
          '参加行业交流活动',
          '准备作品集/简历'
        ]
      }
    ]
  };

  // 90天：实战冲刺
  const phase90 = {
    title: '第三阶段（61-90天）',
    subtitle: '实战冲刺',
    color: 'phase-orange',
    goals: [
      '技能达到可求职水平',
      '完善个人作品集/简历',
      '开始投递目标岗位'
    ],
    weeklyActions: [
      {
        week: '第9-10周',
        actions: [
          '完善作品集/项目展示',
          '模拟面试练习',
          '开始投递简历'
        ]
      },
      {
        week: '第11-12周',
        actions: [
          '参加面试并复盘',
          '根据反馈查漏补缺',
          '持续优化求职策略'
        ]
      }
    ]
  };

  return { phase30, phase60, phase90 };
}

// 获取学习资源
function getLearningResources(career) {
  return resourcePool[career.industry] || resourcePool['default'];
}

// 展示行动计划
function showActionPlan(career, skillGaps) {
  const section = document.getElementById('actionPlanSection');
  const content = document.getElementById('actionPlanContent');

  section.style.display = 'block';

  const profile = assessmentData.profile || {};
  const plan = generateActionPlan(career, skillGaps, profile);
  const resources = getLearningResources(career);

  let html = '';

  // 时间线
  html += '<div class="action-timeline">';

  // 阶段30
  html += renderPhase(plan.phase30);
  // 阶段60
  html += renderPhase(plan.phase60);
  // 阶段90
  html += renderPhase(plan.phase90);

  html += '</div>';

  // 学习资源
  html += '<div class="resource-section">';
  html += '<div class="resource-title">&#128218; 推荐学习资源</div>';
  html += '<div class="resource-grid">';
  resources.forEach(r => {
    html += '<a class="resource-card" href="' + r.url + '" target="_blank" rel="noopener">';
    html += '<div class="resource-type">' + r.type + '</div>';
    html += '<div class="resource-name">' + r.name + '</div>';
    html += '<div class="resource-desc">' + r.desc + '</div>';
    html += '</a>';
  });
  html += '</div></div>';

  content.innerHTML = html;
}

// 渲染单个阶段
function renderPhase(phase) {
  let html = '<div class="timeline-phase ' + phase.color + '">';
  html += '<div class="timeline-phase-header">';
  html += '<div class="timeline-dot"></div>';
  html += '<div class="timeline-phase-title">' + phase.title + '</div>';
  html += '<div class="timeline-phase-subtitle">' + phase.subtitle + '</div>';
  html += '</div>';

  // 目标
  html += '<div class="timeline-goals">';
  phase.goals.forEach(g => {
    html += '<div class="timeline-goal-item">&#9745; ' + g + '</div>';
  });
  html += '</div>';

  // 每周行动
  html += '<div class="timeline-weeks">';
  phase.weeklyActions.forEach(w => {
    html += '<div class="timeline-week">';
    html += '<div class="timeline-week-label">' + w.week + '</div>';
    html += '<div class="timeline-week-actions">';
    w.actions.forEach(a => {
      html += '<div class="timeline-action-item">&#8226; ' + a + '</div>';
    });
    html += '</div></div>';
  });
  html += '</div></div>';

  return html;
}
