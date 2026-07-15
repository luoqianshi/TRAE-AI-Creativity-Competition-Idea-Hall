const MOCK_DATA = {
  profile: {
    name: '张秀兰',
    age: 72,
    dialect: '四川话',
    theme_mode: 'accessible'
  },
  visit_records: [{
    id: 'v_001',
    date: '2026-06-27',
    department: '心内科',
    doctor: '李医生',
    hospital: 'XX市人民医院',
    diagnosis: { text: '冠心病、高脂血症稳定期', confidence: 92 },
    medications: [
      { generic: '美托洛尔', brand: '倍他乐克', dosage: '25mg', frequency: '每日2次', amount: '半片', time: '早晚', confidence: 94 },
      { generic: '阿托伐他汀', brand: '立普妥', dosage: '20mg', frequency: '每日1次', amount: '1片', time: '睡前', confidence: 91 }
    ],
    medication_rules: [
      { rule: '阿托伐他汀需睡前服用', type: 'timing', confidence: 88 },
      { rule: '避免与西柚汁同服', type: 'contraindication', confidence: 88 }
    ],
    follow_up: { date: '2026-07-24', items: '肝功能、心电图', department: '心内科', confidence: 78 },
    dialect_phrases: [
      { dialect: '四川话', original: '脑壳昏', standard: '头晕' },
      { dialect: '四川话', original: '心口闷', standard: '胸闷' }
    ],
    safety_level: 'green'
  }, {
    id: 'v_002',
    date: '2026-06-10',
    department: '内分泌科',
    doctor: '王医生',
    hospital: 'XX市人民医院',
    diagnosis: { text: '2型糖尿病', confidence: 95 },
    medications: [
      { generic: '二甲双胍', brand: '格华止', dosage: '500mg', frequency: '每日2次', amount: '1片', time: '早晚', confidence: 96 }
    ],
    medication_rules: [
      { rule: '二甲双胍需随餐服用', type: 'timing', confidence: 92 }
    ],
    follow_up: { date: '2026-07-10', items: '糖化血红蛋白', department: '内分泌科', confidence: 90 },
    dialect_phrases: [],
    safety_level: 'green'
  }, {
    id: 'v_003',
    date: '2026-05-25',
    department: '心内科',
    doctor: '李医生',
    hospital: 'XX市人民医院',
    diagnosis: { text: '高血压', confidence: 78 },
    medications: [
      { generic: '硝苯地平', brand: '拜新同', dosage: '30mg', frequency: '每日1次', amount: '1片', time: '早上', confidence: 82 }
    ],
    medication_rules: [],
    follow_up: { date: '2026-06-25', items: '血压监测', department: '心内科', confidence: 76 },
    dialect_phrases: [],
    safety_level: 'green'
  }, {
    id: 'v_004',
    date: '2026-04-20',
    department: '骨科',
    doctor: '赵医生',
    hospital: 'XX市人民医院',
    diagnosis: { text: '膝关节退行性病变', confidence: 86 },
    medications: [],
    medication_rules: [],
    follow_up: null,
    dialect_phrases: [],
    safety_level: 'green'
  }],
  medication_logs: [
    { date: '2026-06-27', time: '08:15', drug: '美托洛尔', status: 'taken', source: 'voice' },
    { date: '2026-06-26', time: '08:10', drug: '美托洛尔', status: 'taken', source: 'voice' },
    { date: '2026-06-26', time: '20:30', drug: '阿托伐他汀', status: 'taken', source: 'voice' },
    { date: '2026-06-26', time: '08:10', drug: '二甲双胍', status: 'taken', source: 'voice' },
    { date: '2026-06-26', time: '18:30', drug: '二甲双胍', status: 'taken', source: 'voice' },
    { date: '2026-06-25', time: '08:10', drug: '美托洛尔', status: 'taken', source: 'voice' },
    { date: '2026-06-25', time: '20:45', drug: '阿托伐他汀', status: 'taken', source: 'voice' }
  ],
  reminder_settings: { medication: true, medication_time: '08:00', follow_up: true },
  health_logs: [
    {
      id: 'hl_001', date: '2026-06-27', time: '14:30', source: 'voice',
      text: '今天血压有点高，头有点晕，胃口不太好。吃完药后胃有点不舒服。',
      extracted: { symptoms: ['头晕', '胃口不好', '胃不舒服'], medication_related: true, severity: 'mild' },
      confidence: 85
    },
    {
      id: 'hl_002', date: '2026-06-27', time: '08:00', source: 'manual',
      text: '血压 148/92，心率 78',
      extracted: { symptoms: [], measurements: { bp_sys: 148, bp_dia: 92, hr: 78 } },
      confidence: 95
    },
    {
      id: 'hl_003', date: '2026-06-26', time: '16:00', source: 'voice',
      text: '头不晕了，感觉好多了。',
      extracted: { symptoms: ['头晕缓解'], medication_related: false, severity: 'mild' },
      confidence: 72
    },
    {
      id: 'hl_004', date: '2026-06-25', time: '09:00', source: 'voice',
      text: '今天血压正常了，没什么不舒服。',
      extracted: { symptoms: [], medication_related: false, severity: 'none' },
      confidence: 88
    }
  ],
  self_measurements: [
    { date: '2026-06-27', type: 'bp_sys', value: 148, unit: 'mmHg' },
    { date: '2026-06-26', type: 'bp_sys', value: 145, unit: 'mmHg' },
    { date: '2026-06-25', type: 'bp_sys', value: 142, unit: 'mmHg' },
    { date: '2026-06-24', type: 'bp_sys', value: 140, unit: 'mmHg' },
    { date: '2026-06-23', type: 'bp_sys', value: 138, unit: 'mmHg' }
  ],
  family_members: [
    { id: 'f_001', name: '小芳', relation: '女儿' },
    { id: 'f_002', name: '小明', relation: '儿子' },
    { id: 'f_003', name: '张建国', relation: '配偶' }
  ],
  share_logs: [
    { date: '2026-06-27', target: '女儿 小芳', record_id: 'v_001', status: 'shared' }
  ],
  safety_levels: {
    green: {
      level: 'green',
      threshold: '≥ 85%',
      description: '安全通过，自动同步至子女端',
      example: { drug: '美托洛尔 25mg bid', confidence: 94 }
    },
    yellow: {
      level: 'yellow',
      threshold: '65-84%',
      description: '需子女确认，半自动同步',
      example: { drug: '氯吡格雷+奥美拉唑', confidence: 72, risk: '潜在药物相互作用' }
    },
    red: {
      level: 'red',
      threshold: '< 65%',
      description: '硬中断，阻止同步',
      example: { drug: '华法林+阿司匹林', confidence: 58, risk: '严重药物相互作用（出血风险）' },
      triggers: [
        '华法林+阿司匹林',
        '氯吡格雷+奥美拉唑',
        '地高辛+呋塞米',
        '华法林 > 10mg',
        '胰岛素 > 50 单位',
        '地高辛 > 0.5mg'
      ]
    }
  },
  offline_samples: [
    { id: 'sample_1', name: '普通话：心内科复诊', dialect: 'mandarin', scenario: '冠心病复诊' },
    { id: 'sample_2', name: '四川话：糖尿病随访', dialect: 'sichuan', scenario: '糖尿病随访' },
    { id: 'sample_3', name: '粤语：高血压初诊', dialect: 'cantonese', scenario: '高血压初诊' }
  ]
};

// 初始化 Mock 数据到 localStorage（如果尚未初始化）
function initMockData() {
  if (!localStorage.getItem('my_visit_records')) {
    localStorage.setItem('my_visit_records', JSON.stringify(MOCK_DATA.visit_records));
  }
  if (!localStorage.getItem('my_medication_logs')) {
    localStorage.setItem('my_medication_logs', JSON.stringify(MOCK_DATA.medication_logs));
  }
  if (!localStorage.getItem('my_reminder_settings')) {
    localStorage.setItem('my_reminder_settings', JSON.stringify(MOCK_DATA.reminder_settings));
  }
  if (!localStorage.getItem('my_health_logs')) {
    localStorage.setItem('my_health_logs', JSON.stringify(MOCK_DATA.health_logs));
  }
  if (!localStorage.getItem('my_self_measurements')) {
    localStorage.setItem('my_self_measurements', JSON.stringify(MOCK_DATA.self_measurements));
  }
  if (!localStorage.getItem('my_family_members')) {
    localStorage.setItem('my_family_members', JSON.stringify(MOCK_DATA.family_members));
  }
  if (!localStorage.getItem('my_share_logs')) {
    localStorage.setItem('my_share_logs', JSON.stringify(MOCK_DATA.share_logs));
  }
  if (!localStorage.getItem('theme_mode')) {
    localStorage.setItem('theme_mode', 'accessible');
  }
  if (!localStorage.getItem('family_confirmed_records')) {
    localStorage.setItem('family_confirmed_records', JSON.stringify([]));
  }
  if (!localStorage.getItem('demo_current_mode')) {
    localStorage.setItem('demo_current_mode', 'online');
  }
}