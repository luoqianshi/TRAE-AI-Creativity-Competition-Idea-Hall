// 数据存储层 V1.1 - 三层权限 + 障碍归因 + 精熟维持
const STORAGE_KEY = 'autism_teaching_system_v11';

// ===== 障碍归因标签库 =====
export const BARRIER_TAGS = [
  { id: 'bt1', name: '视觉注意力问题', color: '#3B82F6', description: '学生无法持续关注教学材料或指令' },
  { id: 'bt2', name: '辅助依赖问题', color: '#8B5CF6', description: '学生过度依赖提示才能完成正确反应' },
  { id: 'bt3', name: '动机情绪问题', color: '#EF4444', description: '学生缺乏动机或出现情绪行为' },
  { id: 'bt4', name: '泛化不足问题', color: '#F59E0B', description: '技能在特定情境外无法维持' },
  { id: 'bt5', name: '环境感官干扰', color: '#10B981', description: '环境中的声音、光线等感官刺激影响表现' },
];

// ===== 辅助层级 =====
export const PROMPT_LEVELS = [
  { level: 0, name: '独立', description: '无任何辅助，学生独立完成' },
  { level: 1, name: '视觉提示', description: '手势、图片等视觉辅助' },
  { level: 2, name: '听觉提示', description: '语言指令、声音提示' },
  { level: 3, name: '肢体辅助', description: '手把手引导、身体辅助' },
];

// ===== 用户角色 =====
export const ROLES = {
  SUPERVISOR: 'supervisor',  // 督导：最高权限
  TEACHER: 'teacher',        // 教师：执行权限
  ASSISTANT: 'assistant',     // 助教：只读权限
  ADMIN: 'admin',             // 管理员：管理督导/教师，不可查看学生信息
}

export const ROLE_LABELS = {
  admin: '管理员',
  supervisor: '督导',
  teacher: '教师',
  assistant: '助教',
};

// ===== 初始示例数据 =====
const initialData = {
  // 用户数据
  users: [
    { id: 'u0', name: '管理员', role: 'admin', phone: '188****8888', password: '123456' },
    { id: 'u1', name: '陈督导', role: 'supervisor', phone: '130****0001', password: '123456' },
    { id: 'u2', name: '张老师', role: 'teacher', phone: '138****1234', password: '123456' },
    { id: 'u3', name: '李老师', role: 'teacher', phone: '139****5678', password: '123456' },
    { id: 'u4', name: '王助教', role: 'assistant', phone: '137****9012', password: '123456' },
  ],
  currentUser: null, // 当前登录用户

  students: [
    {
      id: 's1', name: '王小明', gender: '男', birthDate: '2020-03-15', age: 6,
      diagnosisType: '自闭症谱系障碍', diagnosisHospital: '北京儿童医院', diagnosisDate: '2022-06-10',
      guardianName: '王先生', guardianPhone: '138****1234', address: '北京市朝阳区',
      status: 'active', currentStage: 'VB-MAPP 二阶', lastAssessmentDate: '2026-06-15',
      enrolledAt: '2024-12-01', notes: '对视觉提示反应良好，语言提要求能力正在发展中',
      assignedTeacherIds: ['u2', 'u3'], assignedAssistantIds: ['u4'],
      screening: {
        carsScore: '45',
        abcScore: '67',
        assessmentDate: '2024-11-20',
        developmentalAge: '3岁6个月',
        additionalNotes: '初次入园评估',
      },
    },
    {
      id: 's2', name: '李小红', gender: '女', birthDate: '2021-01-20', age: 5,
      diagnosisType: '自闭症谱系障碍', diagnosisHospital: '上海儿童医学中心', diagnosisDate: '2023-03-05',
      guardianName: '李女士', guardianPhone: '139****5678', address: '上海市浦东新区',
      status: 'active', currentStage: 'VB-MAPP 一阶', lastAssessmentDate: '2026-06-10',
      enrolledAt: '2025-01-15', notes: '社交互动意愿较强，模仿能力良好',
      assignedTeacherIds: ['u3'], assignedAssistantIds: ['u4'],
    },
    {
      id: 's3', name: '张小华', gender: '男', birthDate: '2018-08-10', age: 8,
      diagnosisType: '自闭症谱系障碍', diagnosisHospital: '南京脑科医院', diagnosisDate: '2021-05-20',
      guardianName: '张先生', guardianPhone: '137****9012', address: '南京市鼓楼区',
      status: 'active', currentStage: 'ABLLS-R C区', lastAssessmentDate: '2026-06-01',
      enrolledAt: '2023-09-01', notes: '认知能力较强，需要加强社交技能训练',
      assignedTeacherIds: ['u2'], assignedAssistantIds: [],
    }
  ],
  assessments: [
    {
      id: 'a1', studentId: 's1', toolType: 'VB-MAPP', assessmentDate: '2026-06-15',
      assessorName: '陈督导', status: 'completed',
      results: {
        mand: { score: 65, level: 2 }, tact: { score: 70, level: 2 },
        listener: { score: 55, level: 2 }, visual: { score: 80, level: 2 },
        play: { score: 45, level: 1 }, social: { score: 35, level: 1 },
        imitation: { score: 60, level: 2 }, spontaneous: { score: 50, level: 2 }
      }
    },
    {
      id: 'a2', studentId: 's1', toolType: 'VB-MAPP', assessmentDate: '2026-03-10',
      assessorName: '陈督导', status: 'completed',
      results: {
        mand: { score: 45, level: 1 }, tact: { score: 50, level: 1 },
        listener: { score: 40, level: 1 }, visual: { score: 60, level: 1 },
        play: { score: 30, level: 1 }, social: { score: 25, level: 1 },
        imitation: { score: 40, level: 1 }, spontaneous: { score: 35, level: 1 }
      }
    }
  ],
  iepGoals: [
    // 一级目标：VB-MAPP 里程碑
    { id: 'g1', studentId: 's1', type: 'level1', description: '提升语言提要求能力', domain: '提要求', stage: 'VB-MAPP 二阶', locked: true },
    { id: 'g2', studentId: 's1', type: 'level1', description: '提升视觉匹配能力', domain: '视觉匹配', stage: 'VB-MAPP 二阶', locked: true },
    // 二级目标：课程框架（督导管控）
    { id: 'g3', studentId: 's1', type: 'level2', parentGoalId: 'g1', description: '命名常见物品并提要求', domain: '提要求', stage: '课程框架', locked: true },
    { id: 'g4', studentId: 's1', type: 'level2', parentGoalId: 'g2', description: '6块拼图独立完成', domain: '视觉匹配', stage: '课程框架', locked: true },
    // 三级目标：细分训练项（教师可增删）
    { id: 'g5', studentId: 's1', type: 'level3', parentGoalId: 'g3', description: '能在提示下使用"我要+名词"表达需求', criteria: '连续3天每天5次机会中成功4次以上', startDate: '2026-04-01', endDate: '2026-07-01', status: 'active', progressPct: 67, domain: '语言行为' },
    { id: 'g6', studentId: 's1', type: 'level3', parentGoalId: 'g3', description: '能自发使用"我要+名词"表达需求', criteria: '连续3天每天5次机会中成功4次以上，无提示', startDate: '2026-05-01', endDate: '2026-07-01', status: 'active', progressPct: 25, domain: '语言行为' },
    { id: 'g7', studentId: 's1', type: 'level3', parentGoalId: 'g4', description: '能独立完成6块拼图', criteria: '连续3天成功率80%以上', startDate: '2026-04-01', endDate: '2026-06-15', status: 'mastered', progressPct: 100, domain: '认知' },
    // 中期目标
    { id: 'g8', studentId: 's1', type: 'mid_term', parentGoalId: 'g1', description: '技能泛化到自然环境', criteria: '在3个不同场景中均能自发提要求', startDate: '2026-04-01', endDate: '2026-07-01', status: 'active', progressPct: 40 },
    // 长期目标
    { id: 'g9', studentId: 's1', type: 'long_term', parentGoalId: 'g1', description: '融合安置提升', criteria: '能在普通幼儿园参与集体活动30分钟', startDate: '2026-04-01', endDate: '2026-10-01', status: 'active', progressPct: 15 },
  ],
  trainingRecords: [
    { id: 't1', studentId: 's1', goalId: 'g5', dataType: '准确率', value: 4, totalTrials: 5, correctTrials: 4, errorTrials: 1, promptLevel: 1, recordDate: '2026-06-19', recorderName: '张老师', recorderId: 'u2', notes: '今天表现很好', barrierTags: [] },
    { id: 't2', studentId: 's1', goalId: 'g5', dataType: '准确率', value: 3, totalTrials: 5, correctTrials: 3, errorTrials: 2, promptLevel: 1, recordDate: '2026-06-18', recorderName: '张老师', recorderId: 'u2', notes: '', barrierTags: ['bt2'] },
    { id: 't3', studentId: 's1', goalId: 'g5', dataType: '准确率', value: 4, totalTrials: 5, correctTrials: 4, errorTrials: 1, promptLevel: 2, recordDate: '2026-06-17', recorderName: '李老师', recorderId: 'u3', notes: '有进步', barrierTags: ['bt1'] },
    { id: 't4', studentId: 's1', goalId: 'g7', dataType: '准确率', value: 5, totalTrials: 6, correctTrials: 5, errorTrials: 1, promptLevel: 0, recordDate: '2026-06-19', recorderName: '张老师', recorderId: 'u2', notes: '', barrierTags: [] },
    { id: 't5', studentId: 's1', goalId: 'g7', dataType: '准确率', value: 4, totalTrials: 5, correctTrials: 4, errorTrials: 1, promptLevel: 0, recordDate: '2026-06-18', recorderName: '张老师', recorderId: 'u2', notes: '', barrierTags: [] },
  ],
  skillStatuses: [
    { id: 'sk1', studentId: 's1', skillCode: '2-M1', skillName: '能在提示下使用"我要+名词"', domain: '提要求', status: 'partial', evaluatedAt: '2026-06-15' },
    { id: 'sk2', studentId: 's1', skillCode: '2-M2', skillName: '能自发使用"我要+名词"', domain: '提要求', status: 'not_mastered', evaluatedAt: '2026-06-15' },
    { id: 'sk3', studentId: 's1', skillCode: '2-M3', skillName: '能使用"我要+动词"表达行为需求', domain: '提要求', status: 'not_mastered', evaluatedAt: '2026-06-15' },
    { id: 'sk4', studentId: 's1', skillCode: '2-T1', skillName: '能命名常见物品', domain: '命名', status: 'mastered', evaluatedAt: '2026-06-15' },
    { id: 'sk5', studentId: 's1', skillCode: '2-T2', skillName: '能命名动作', domain: '命名', status: 'partial', evaluatedAt: '2026-06-15' },
    { id: 'sk6', studentId: 's1', skillCode: '2-L1', skillName: '能听从两步指令', domain: '听者反应', status: 'partial', evaluatedAt: '2026-06-15' },
    { id: 'sk7', studentId: 's1', skillCode: '2-V1', skillName: '能完成6块拼图', domain: '视觉匹配', status: 'mastered', evaluatedAt: '2026-06-15' },
    { id: 'sk8', studentId: 's1', skillCode: '2-V2', skillName: '能进行物品分类', domain: '视觉匹配', status: 'partial', evaluatedAt: '2026-06-15' },
    { id: 'sk9', studentId: 's1', skillCode: '2-P1', skillName: '能独立进行功能性游戏', domain: '独立游戏', status: 'not_mastered', evaluatedAt: '2026-06-15' },
    { id: 'sk10', studentId: 's1', skillCode: '2-S1', skillName: '能参与小组活动', domain: '社交', status: 'not_mastered', evaluatedAt: '2026-06-15' },
  ],
  // 精熟维持池：技能达标后进入双周观察
  maintenancePool: [
    {
      id: 'mp1', studentId: 's1', goalId: 'g7', skillName: '能独立完成6块拼图',
      enteredDate: '2026-06-15', week: 1, status: 'observing',
      week1Records: [
        { date: '2026-06-16', accuracy: 90, passed: true },
        { date: '2026-06-17', accuracy: 85, passed: true },
        { date: '2026-06-18', accuracy: 80, passed: true },
      ],
      week2Records: [
        { date: '2026-06-19', accuracy: 83, passed: true },
      ],
    }
  ],
  // 精熟库：通过双周维持的技能，用于日常穿插复习
  masteredLibrary: [
    { id: 'ml1', studentId: 's1', skillName: '能命名常见物品', domain: '命名', masteredDate: '2026-05-01', reviewCount: 12 },
  ],
  // 家庭训练任务
  familyTasks: [
    { id: 'ft1', studentId: 's1', goalId: 'g5', task: '在家中练习"我要+名词"提要求，每天至少5次', assignedDate: '2026-06-19', status: 'pending', assignedBy: 'u2' },
  ],
  // 呼叫助教记录
  callRecords: [],
  // 教学会话（备课+上课记录）
  teachingSessions: [],
  // 强化物偏好评估 - sample data
  reinforcerAssessments: [
    { id: 'ra1', studentId: 's1', name: '小熊饼干', category: 'edible', preferenceLevel: 'high', lastAssessedDate: '2026-06-18', assessedBy: 'u2', notes: '连续3天偏好稳定' },
    { id: 'ra2', studentId: 's1', name: '泡泡玩具', category: 'toy', preferenceLevel: 'high', lastAssessedDate: '2026-06-17', assessedBy: 'u2', notes: '吹泡泡时注意力最好' },
    { id: 'ra3', studentId: 's1', name: 'iPad 动画片', category: 'sensory', preferenceLevel: 'medium', lastAssessedDate: '2026-06-15', assessedBy: 'u2', notes: '有时会沉迷' },
    { id: 'ra4', studentId: 's1', name: '口头表扬"真棒"', category: 'social', preferenceLevel: 'low', lastAssessedDate: '2026-06-10', assessedBy: 'u2', notes: '单独使用效果有限' },
    { id: 'ra5', studentId: 's1', name: '拼图', category: 'toy', preferenceLevel: 'medium', lastAssessedDate: '2026-06-16', assessedBy: 'u2', notes: '完成拼图后给予' },
  ],
  communicationLogs: [
    {
      id: 'cl1',
      studentId: 's1',
      date: '2026-06-15',
      type: 'parent_meeting',
      content: '家长反馈孩子本周在家表现良好，主动提要求增加',
      contactPerson: '王先生',
      recordedBy: '陈督导',
      recordedById: 'u1',
    },
    {
      id: 'cl2',
      studentId: 's1',
      date: '2026-06-01',
      type: 'phone',
      content: '电话沟通关于泛化训练方案',
      contactPerson: '王先生',
      recordedBy: '张老师',
      recordedById: 'u2',
    },
  ],
  classHours: {
    s1: {
      totalHours: 120,
      usedHours: 87,
      remainingHours: 33,
      schedule: [
        { day: '周一', time: '上午 9:00-11:00', teacher: '张老师' },
        { day: '周三', time: '上午 9:00-11:00', teacher: '张老师' },
        { day: '周五', time: '上午 9:00-11:00', teacher: '李老师' },
      ],
      renewalDate: '2026-09-01',
    },
  },
  assessmentAttachments: {
    s1: [
      {
        id: 'at1',
        name: 'VB-MAPP纸质评估底稿.pdf',
        uploadDate: '2026-06-15',
        uploadedBy: '陈督导',
        size: '2.3 MB',
        type: 'vbmapp',
      },
    ],
  },
};

// ===== 基础操作 =====
function getData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    // 兼容旧数据：确保新字段存在
    if (!data.behaviorRecords) data.behaviorRecords = [];
    if (!data.callRecords) data.callRecords = [];
    if (!data.teachingSessions) data.teachingSessions = [];
    if (!data.reinforcerAssessments) data.reinforcerAssessments = [];
    if (!data.communicationLogs) data.communicationLogs = [];
    if (!data.classHours) data.classHours = {};
    if (!data.assessmentAttachments) data.assessmentAttachments = {};
    if (!data.assessmentQueues) data.assessmentQueues = [];
    if (!data.teachingQueues) data.teachingQueues = [];
    // 同时确保 students 中 screening 字段有默认值
    if (data.students) {
      data.students.forEach(s => { if (!s.screening) s.screening = {}; });
    }
    // 修正 progressPct 超过100的脏数据
    if (data.iepGoals) {
      data.iepGoals.forEach(g => {
        if (g.progressPct !== undefined && g.progressPct > 100) g.progressPct = 100;
      });
    }
    // 迁移：确保管理员账号存在
    if (data.users && !data.users.find(u => u.role === 'admin')) {
      data.users.unshift({ id: 'u0', name: '管理员', role: 'admin', phone: '188****8888', password: '123456' });
      saveData(data);
    }
    return data;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return JSON.parse(JSON.stringify(initialData));
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

// ===== 认证相关 =====
export function login(phone, password) {
  const data = getData();
  // 支持完整手机号匹配掩码格式的存储数据（如 13000000001 匹配 130****0001）
  const user = data.users.find(u => {
    const stored = u.phone;
    // 如果存储的是掩码格式（含*），尝试用完整手机号匹配
    if (stored.includes('*')) {
      const prefix = stored.split('*')[0];
      const suffix = stored.split('*').pop();
      return phone.startsWith(prefix) && phone.endsWith(suffix) && u.password === password;
    }
    return stored === phone && u.password === password;
  });
  if (user) {
    data.currentUser = user;
    saveData(data);
    return user;
  }
  return null;
}

export function logout() {
  const data = getData();
  data.currentUser = null;
  saveData(data);
}

export function getCurrentUser() {
  return getData().currentUser;
}

// ===== 注册相关 =====
export function registerUser({ name, phone, password, role = 'teacher' }) {
  const data = getData();
  // 检查手机号是否已存在
  const exists = data.users.find(u => u.phone === phone || (u.phone.includes('*') && phone.startsWith(u.phone.split('*')[0]) && phone.endsWith(u.phone.split('*').pop())));
  if (exists) {
    return { success: false, message: '该手机号已被注册' };
  }
  const newUser = {
    id: generateId(),
    name,
    phone,
    password,
    role,
  };
  data.users.push(newUser);
  saveData(data);
  return { success: true, user: newUser };
}

// ===== 重置密码 =====
export function resetPassword(phone, newPassword) {
  const data = getData();
  const user = data.users.find(u => {
    const stored = u.phone;
    if (stored.includes('*')) {
      const prefix = stored.split('*')[0];
      const suffix = stored.split('*').pop();
      return phone.startsWith(prefix) && phone.endsWith(suffix);
    }
    return stored === phone;
  });
  if (!user) {
    return { success: false, message: '该手机号未注册' };
  }
  user.password = newPassword;
  saveData(data);
  return { success: true };
}

export function hasPermission(requiredRole) {
  const user = getCurrentUser();
  if (!user) return false;
  // admin 拥有所有权限（但路由层面限制看不到学生信息）
  if (user.role === 'admin') return true;
  const hierarchy = { supervisor: 3, teacher: 2, assistant: 1 };
  return hierarchy[user.role] >= hierarchy[requiredRole];
}

// ===== 学生相关 =====
export function getStudents() {
  const data = getData();
  const user = data.currentUser;
  if (!user) return [];
  if (user.role === 'supervisor') return data.students;
  if (user.role === 'teacher') return data.students.filter(s =>
    s.assignedTeacherIds?.includes(user.id) || s.assignedAssistantIds?.includes(user.id)
  );
  if (user.role === 'assistant') return data.students.filter(s => s.assignedAssistantIds?.includes(user.id));
  return [];
}

export function getStudentById(id) { return getData().students.find(s => s.id === id); }
export function addStudent(student) {
  const data = getData();
  const newStudent = { ...student, id: generateId(), status: 'active' };
  data.students.push(newStudent);
  saveData(data);
  return newStudent;
}
export function updateStudent(id, updates) {
  const data = getData();
  const index = data.students.findIndex(s => s.id === id);
  if (index !== -1) { data.students[index] = { ...data.students[index], ...updates }; saveData(data); }
}

// ===== 评估相关 =====
export function getAssessmentsByStudent(studentId) { return getData().assessments.filter(a => a.studentId === studentId); }
export function addAssessment(assessment) {
  const data = getData();
  data.assessments.push({ ...assessment, id: generateId() });
  saveData(data);
}

// ===== IEP目标相关（三层） =====
export function getGoalsByStudent(studentId) { return getData().iepGoals.filter(g => g.studentId === studentId); }
export function getGoalsByType(studentId, type) { return getData().iepGoals.filter(g => g.studentId === studentId && g.type === type); }
export function getChildGoals(parentGoalId) { return getData().iepGoals.filter(g => g.parentGoalId === parentGoalId); }
export function addGoal(goal) {
  const data = getData();
  data.iepGoals.push({ ...goal, id: generateId() });
  saveData(data);
}
export function updateGoal(goalId, updates) {
  const data = getData();
  const idx = data.iepGoals.findIndex(g => g.id === goalId);
  if (idx !== -1) { data.iepGoals[idx] = { ...data.iepGoals[idx], ...updates }; saveData(data); }
}
export function updateGoalProgress(goalId, progressPct) { updateGoal(goalId, { progressPct }); }

// ===== 训练记录相关 =====
export function getTrainingRecordsByStudent(studentId) { return getData().trainingRecords.filter(t => t.studentId === studentId); }
export function getTrainingRecordsByGoal(goalId) { return getData().trainingRecords.filter(t => t.goalId === goalId); }
export function addTrainingRecord(record) {
  const data = getData();
  const newRecord = { ...record, id: generateId() };
  data.trainingRecords.push(newRecord);
  saveData(data);
  updateGoalProgressFromRecords(record.goalId);
  return newRecord;
}
function updateGoalProgressFromRecords(goalId) {
  const records = getTrainingRecordsByGoal(goalId);
  if (!records.length) return;
  const recent = records.slice(-7);
  // r.value 已经是百分比（0-100），直接取平均值
  const avg = recent.reduce((s, r) => s + (r.value || 0), 0) / recent.length;
  updateGoalProgress(goalId, Math.min(100, Math.round(avg)));
}

// ===== 精熟维持相关 =====
export function getMaintenancePool(studentId) { return getData().maintenancePool.filter(m => m.studentId === studentId); }
export function getMasteredLibrary(studentId) { return getData().masteredLibrary.filter(m => m.studentId === studentId); }

export function addToMaintenancePool(goalId, studentId, skillName) {
  const data = getData();
  const entry = {
    id: generateId(), studentId, goalId, skillName,
    enteredDate: new Date().toISOString().split('T')[0],
    week: 1, status: 'observing',
    week1Records: [], week2Records: [],
  };
  data.maintenancePool.push(entry);
  saveData(data);
  return entry;
}

export function addMaintenanceRecord(poolId, accuracy, date) {
  const data = getData();
  const entry = data.maintenancePool.find(m => m.id === poolId);
  if (!entry) return;
  const record = { date, accuracy, passed: accuracy >= 80 };
  if (entry.week === 1) {
    entry.week1Records.push(record);
    if (entry.week1Records.length >= 3) {
      entry.week = 2;
    }
  } else {
    entry.week2Records.push(record);
    // 双周判定
    if (entry.week2Records.length >= 3) {
      const w1Pass = entry.week1Records.every(r => r.passed);
      const w2Pass = entry.week2Records.every(r => r.passed);
      if (w1Pass && w2Pass) {
        entry.status = 'passed';
        // 进入精熟库
        data.masteredLibrary.push({
          id: generateId(), studentId: entry.studentId, goalId: entry.goalId,
          skillName: entry.skillName, domain: '', masteredDate: date, reviewCount: 0,
        });
      } else {
        entry.status = 'failed';
        // 回流：重置目标状态
        const goal = data.iepGoals.find(g => g.id === entry.goalId);
        if (goal) { goal.status = 'active'; goal.progressPct = 0; }
      }
    }
  }
  saveData(data);
  return entry;
}

// ===== 障碍分析相关 =====
export function getBarrierStats(studentId) {
  const records = getTrainingRecordsByStudent(studentId);
  const stats = {};
  BARRIER_TAGS.forEach(tag => { stats[tag.id] = { name: tag.name, color: tag.color, count: 0 }; });
  records.forEach(r => {
    (r.barrierTags || []).forEach(tagId => {
      if (stats[tagId]) stats[tagId].count++;
    });
  });
  return Object.values(stats).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
}

// ===== 家庭任务相关 =====
export function getFamilyTasks(studentId) { return getData().familyTasks.filter(f => f.studentId === studentId); }
export function addFamilyTask(task) {
  const data = getData();
  data.familyTasks.push({ ...task, id: generateId() });
  saveData(data);
}

// ===== 呼叫助教相关 =====
export function addCallRecord(record) {
  const data = getData();
  const newRecord = { ...record, id: generateId(), createdAt: new Date().toISOString() };
  data.callRecords.push(newRecord);
  saveData(data);
  return newRecord;
}

export function getCallRecordsByStudent(studentId) {
  return getData().callRecords
    .filter(c => c.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPendingCalls() {
  return getData().callRecords
    .filter(c => c.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateCallStatus(callId, status) {
  const data = getData();
  const idx = data.callRecords.findIndex(c => c.id === callId);
  if (idx !== -1) {
    data.callRecords[idx].status = status;
    if (status === 'accepted') {
      data.callRecords[idx].respondedAt = new Date().toISOString();
    }
    saveData(data);
  }
}

// ===== 统计数据 =====
export function getStudentStats(studentId) {
  const skills = getData().skillStatuses.filter(s => s.studentId === studentId);
  const goals = getGoalsByStudent(studentId);
  const records = getTrainingRecordsByStudent(studentId);
  const pool = getMaintenancePool(studentId);
  const library = getMasteredLibrary(studentId);
  const barrierStats = getBarrierStats(studentId);
  return {
    masteredCount: skills.filter(s => s.status === 'mastered').length,
    learningCount: skills.filter(s => s.status === 'partial').length,
    pendingCount: skills.filter(s => s.status === 'not_mastered').length,
    totalGoals: goals.filter(g => g.type === 'level1').length,
    avgProgress: goals.filter(g => ['level3', 'short_term'].includes(g.type) && g.progressPct !== undefined).reduce((s, g) => s + g.progressPct, 0) / (goals.filter(g => ['level3', 'short_term'].includes(g.type)).length || 1),
    totalRecords: records.length,
    thisWeekRecords: records.filter(r => { const d = new Date(r.recordDate); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; }).length,
    maintenancePoolSize: pool.length,
    masteredLibrarySize: library.length,
    barrierStats,
  };
}

// ===== 兼容函数 =====
export function getLongTermGoals(studentId) { return getGoalsByType(studentId, 'long_term'); }
export function getShortTermGoals(studentId, parentGoalId) { 
  return getData().iepGoals.filter(g => g.studentId === studentId && g.type === 'level3' && g.parentGoalId === parentGoalId); 
}
export function getSkillStatusesByStudent(studentId) { return getData().skillStatuses.filter(s => s.studentId === studentId); }
export function updateSkillStatus(studentId, skillCode, status) {
  const data = getData();
  const idx = data.skillStatuses.findIndex(s => s.studentId === studentId && s.skillCode === skillCode);
  if (idx !== -1) { data.skillStatuses[idx].status = status; data.skillStatuses[idx].evaluatedAt = new Date().toISOString().split('T')[0]; }
  else { data.skillStatuses.push({ id: generateId(), studentId, skillCode, skillName: skillCode, domain: '', status, evaluatedAt: new Date().toISOString().split('T')[0] }); }
  saveData(data);
}

// ===== 问题行为 ABC 记录 =====
export const BEHAVIOR_TYPES = [
  { id: 'bt_aggression', name: '攻击他人', icon: '👊', description: '打人、抓人、推人、踢人' },
  { id: 'bt_self_injury', name: '自伤行为', icon: '🤕', description: '咬手、撞头、抓脸、拍打自己' },
  { id: 'bt_screaming', name: '尖叫哭闹', icon: '😱', description: '大声尖叫、持续哭闹' },
  { id: 'bt_elopement', name: '逃离/乱跑', icon: '🏃', description: '突然跑开、离开座位' },
  { id: 'bt_throw', name: '扔/摔物品', icon: '💥', description: '扔教具、摔桌子、踢椅子' },
  { id: 'bt_stereotypy', name: '刻板行为', icon: '🔄', description: '摇晃身体、手指摆动、旋转物品' },
  { id: 'bt_refusal', name: '拒绝/抗拒', icon: '🚫', description: '拒绝指令、推开教具、逃避任务' },
  { id: 'bt_other', name: '其他', icon: '❓', description: '其他问题行为' },
];

export const ANTECEDENT_OPTIONS = [
  { id: 'ant_demand', name: '指令/要求', description: '老师下达指令或要求学生完成任务' },
  { id: 'ant_denial', name: '拒绝/说"不"', description: '拒绝了学生的请求或想要的东西' },
  { id: 'ant_transition', name: '活动转换', description: '从一项活动切换到另一项活动' },
  { id: 'ant_remove', name: '拿走物品', description: '拿走了学生喜欢的物品或活动' },
  { id: 'ant_attention', name: '注意力转移', description: '老师关注其他学生或离开' },
  { id: 'ant_difficult', name: '困难任务', description: '任务难度过高，学生无法完成' },
  { id: 'ant_sensory', name: '感官刺激', description: '环境中的声音、光线等感官刺激' },
  { id: 'ant_wait', name: '等待', description: '需要等待较长时间' },
  { id: 'ant_other', name: '其他', description: '其他前事刺激' },
];

export const CONSEQUENCE_OPTIONS = [
  { id: 'con_redirect', name: '语言引导/重定向', description: '用语言引导学生回到任务' },
  { id: 'con_ignore', name: '忽略/不给予关注', description: '不给予关注，等待行为停止' },
  { id: 'con_prompt', name: '辅助/提示', description: '提供肢体或视觉辅助帮助学生' },
  { id: 'con_escape', name: '暂停/移除任务', description: '暂时移除任务让学生冷静' },
  { id: 'con_reinforce', name: '给予强化物', description: '在行为停止后给予奖励' },
  { id: 'con_physical', name: '肢体保护', description: '保护学生或他人安全' },
  { id: 'con_other', name: '其他', description: '其他处理方式' },
];

export const SEVERITY_LEVELS = [
  { level: 1, name: '轻微', color: '#10b981', description: '行为短暂，未造成影响' },
  { level: 2, name: '中等', color: '#f59e0b', description: '行为持续，需要干预' },
  { level: 3, name: '严重', color: '#ef4444', description: '行为激烈，造成伤害或严重干扰' },
];

// ===== 问题行为记录相关 =====
export function addBehaviorRecord(record) {
  const data = getData();
  data.behaviorRecords.push({ ...record, id: generateId(), createdAt: new Date().toISOString() });
  saveData(data);
}

export function getBehaviorRecordsByStudent(studentId) {
  return getData().behaviorRecords.filter(b => b.studentId === studentId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getAllBehaviorRecords() {
  return getData().behaviorRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ===== 教学会话相关 =====
export function createTeachingSession(session) {
  const data = getData();
  const newSession = {
    ...session,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'planned', // planned | in_progress | completed
  };
  data.teachingSessions.push(newSession);
  saveData(data);
  return newSession;
}

export function updateTeachingSession(sessionId, updates) {
  const data = getData();
  const idx = data.teachingSessions.findIndex(s => s.id === sessionId);
  if (idx !== -1) { data.teachingSessions[idx] = { ...data.teachingSessions[idx], ...updates }; saveData(data); }
}

export function getTeachingSessionsByStudent(studentId) {
  return getData().teachingSessions
    .filter(s => s.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getTeachingSessionById(sessionId) {
  return getData().teachingSessions.find(s => s.id === sessionId);
}

export function getTodaySessions(studentId) {
  const today = new Date().toISOString().split('T')[0];
  return getData().teachingSessions
    .filter(s => s.studentId === studentId && s.date === today)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// 更新会话中某个目标的逐次记录（按 goalId 查找）
export function updateSessionTrialGoal(sessionId, goalId, updates) {
  const data = getData();
  const session = data.teachingSessions.find(s => s.id === sessionId);
  if (!session || !session.trialGoals) return;
  const goal = session.trialGoals.find(tg => tg.goalId === goalId);
  if (!goal) return;
  Object.assign(goal, updates);
  saveData(data);
  return goal;
}

// 自动判定会话中所有目标是否通过（当天通过）
export function judgeSessionGoals(sessionId) {
  const data = getData();
  const session = data.teachingSessions.find(s => s.id === sessionId);
  if (!session || !session.trialGoals) return session;
  
  session.trialGoals.forEach((goal, idx) => {
    let passed = null;
    // 方式1：首测和尾测都为 +（不需要逐次记录）
    if (goal.probeResult === '+' && goal.finalProbeResult === '+') {
      passed = true;
    }
    // 方式2：逐次记录中只有 + 算正确，>= 80%（10个回合中至少8个 +）
    if (goal.trials && goal.trials.length >= 10) {
      const correctCount = goal.trials.filter(t => t === '+').length;
      if (correctCount >= 8) {
        passed = true;
      } else {
        passed = false;
      }
    }
    // 如果首测+尾测方式有结果但未通过
    if (passed === null && goal.probeResult !== null && goal.finalProbeResult !== null) {
      passed = false;
    }
    if (passed !== null) {
      session.trialGoals[idx].passed = passed;
    }
  });
  
  saveData(data);
  
  // 判定连续三天通过 → 正式通过（更新IEP目标状态）
  checkConsecutivePass(session.studentId);
  
  return session;
}

// 检查目标是否连续三天通过，如果是则标记IEP目标为mastered
export function checkConsecutivePass(studentId) {
  const data = getData();
  const sessions = data.teachingSessions
    .filter(s => s.studentId === studentId && s.status === 'completed' && s.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // 按goalId收集每天的通过情况
  const goalPassMap = {}; // goalId -> [date, date, ...]
  sessions.forEach(session => {
    if (!session.trialGoals) return;
    session.trialGoals.forEach(goal => {
      if (goal.passed && goal.goalId) {
        if (!goalPassMap[goal.goalId]) goalPassMap[goal.goalId] = [];
        if (!goalPassMap[goal.goalId].includes(session.date)) {
          goalPassMap[goal.goalId].push(session.date);
        }
      }
    });
  });
  
  // 检查每个目标是否有连续3天通过
  Object.entries(goalPassMap).forEach(([goalId, dates]) => {
    if (dates.length < 3) return;
    const sortedDates = dates.sort();
    // 检查最近3天是否连续
    for (let i = sortedDates.length - 1; i >= 2; i--) {
      const d1 = new Date(sortedDates[i]);
      const d2 = new Date(sortedDates[i - 1]);
      const d3 = new Date(sortedDates[i - 2]);
      const diff1 = (d1 - d2) / (1000 * 60 * 60 * 24);
      const diff2 = (d2 - d3) / (1000 * 60 * 60 * 24);
      if (diff1 === 1 && diff2 === 1) {
        // 连续3天通过！更新IEP目标
        const goalIdx = data.iepGoals.findIndex(g => g.id === goalId);
        if (goalIdx !== -1 && data.iepGoals[goalIdx].status === 'active') {
          data.iepGoals[goalIdx].status = 'mastered';
          data.iepGoals[goalIdx].progressPct = 100;
          data.iepGoals[goalIdx].masteredDate = sortedDates[i];
        }
        break;
      }
    }
  });
  
  saveData(data);
}

// ===== 教师管理相关 =====
export function getUsers() {
  return getData().users.filter(u => u.role !== 'supervisor');
}

// 管理员专用：获取所有督导+教师+助教（含督导）
export function getAllStaff() {
  return getData().users.filter(u => u.role !== 'admin');
}

// 管理员专用：删除用户
export function deleteUser(userId) {
  const data = getData();
  data.users = data.users.filter(u => u.id !== userId);
  saveData(data);
}

// 管理员专用：修改用户角色
export function updateUserRole(userId, newRole) {
  const data = getData();
  const user = data.users.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    saveData(data);
    return { success: true };
  }
  return { success: false, message: '用户不存在' };
}

// 管理员专用：重置用户密码
export function adminResetUserPassword(userId, newPassword) {
  const data = getData();
  const user = data.users.find(u => u.id === userId);
  if (user) {
    user.password = newPassword;
    saveData(data);
    return { success: true };
  }
  return { success: false, message: '用户不存在' };
}

export function assignStudentToTeacher(studentId, teacherId, role) {
  const data = getData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;
  if (role === 'teacher') {
    if (!student.assignedTeacherIds) student.assignedTeacherIds = [];
    if (!student.assignedTeacherIds.includes(teacherId)) student.assignedTeacherIds.push(teacherId);
  } else if (role === 'assistant') {
    if (!student.assignedAssistantIds) student.assignedAssistantIds = [];
    if (!student.assignedAssistantIds.includes(teacherId)) student.assignedAssistantIds.push(teacherId);
  }
  saveData(data);
}

export function removeStudentFromTeacher(studentId, teacherId, role) {
  const data = getData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return;
  if (role === 'teacher' && student.assignedTeacherIds) {
    student.assignedTeacherIds = student.assignedTeacherIds.filter(id => id !== teacherId);
  } else if (role === 'assistant' && student.assignedAssistantIds) {
    student.assignedAssistantIds = student.assignedAssistantIds.filter(id => id !== teacherId);
  }
  saveData(data);
}

// ===== 强化物偏好评估 =====
export function addReinforcerItem(item) {
  const data = getData();
  data.reinforcerAssessments.push({
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
  });
  saveData(data);
}

export function updateReinforcerItem(itemId, updates) {
  const data = getData();
  const idx = data.reinforcerAssessments.findIndex(r => r.id === itemId);
  if (idx !== -1) { data.reinforcerAssessments[idx] = { ...data.reinforcerAssessments[idx], ...updates }; saveData(data); }
}

export function deleteReinforcerItem(itemId) {
  const data = getData();
  data.reinforcerAssessments = data.reinforcerAssessments.filter(r => r.id !== itemId);
  saveData(data);
}

export function getReinforcersByStudent(studentId) {
  return getData().reinforcerAssessments
    .filter(r => r.studentId === studentId)
    .sort((a, b) => {
      // Sort by preference level (high first), then by lastAssessedDate (recent first)
      const levelOrder = { high: 0, medium: 1, low: 2, unknown: 3 };
      const aLevel = levelOrder[a.preferenceLevel] ?? 3;
      const bLevel = levelOrder[b.preferenceLevel] ?? 3;
      if (aLevel !== bLevel) return aLevel - bLevel;
      return new Date(b.lastAssessedDate || 0) - new Date(a.lastAssessedDate || 0);
    });
}

// ===== 初筛信息相关 =====
export function getScreeningByStudent(studentId) {
  const student = getData().students.find(s => s.id === studentId);
  return student ? (student.screening || {}) : {};
}
export function updateScreening(studentId, updates) {
  const data = getData();
  const idx = data.students.findIndex(s => s.id === studentId);
  if (idx !== -1) {
    data.students[idx].screening = { ...(data.students[idx].screening || {}), ...updates };
    saveData(data);
  }
}

// ===== 家校沟通记录相关 =====
export function getCommunicationLogsByStudent(studentId) {
  return getData().communicationLogs.filter(l => l.studentId === studentId).sort((a, b) => new Date(b.date) - new Date(a.date));
}
export function addCommunicationLog(log) {
  const data = getData();
  const newLog = { ...log, id: generateId() };
  data.communicationLogs.push(newLog);
  saveData(data);
  return newLog;
}
export function deleteCommunicationLog(logId) {
  const data = getData();
  data.communicationLogs = data.communicationLogs.filter(l => l.id !== logId);
  saveData(data);
}

// ===== 课时统计相关 =====
export function getClassHoursByStudent(studentId) {
  const data = getData();
  const hours = data.classHours[studentId];
  if (hours) return hours;
  // 默认值
  return { totalHours: 0, usedHours: 0, remainingHours: 0, schedule: [], renewalDate: '' };
}
export function updateClassHours(studentId, updates) {
  const data = getData();
  const current = data.classHours[studentId] || { totalHours: 0, usedHours: 0, remainingHours: 0, schedule: [], renewalDate: '' };
  data.classHours[studentId] = { ...current, ...updates };
  saveData(data);
}

// ===== 评估附件上传相关 =====
export function getAttachmentsByStudent(studentId) {
  const data = getData();
  return data.assessmentAttachments[studentId] || [];
}
export function addAttachment(studentId, attachment) {
  const data = getData();
  if (!data.assessmentAttachments[studentId]) data.assessmentAttachments[studentId] = [];
  const newAtt = { ...attachment, id: generateId() };
  data.assessmentAttachments[studentId].push(newAtt);
  saveData(data);
  return newAtt;
}
export function deleteAttachment(studentId, attachmentId) {
  const data = getData();
  if (data.assessmentAttachments[studentId]) {
    data.assessmentAttachments[studentId] = data.assessmentAttachments[studentId].filter(a => a.id !== attachmentId);
    saveData(data);
  }
}

export function resetData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData)); }

// ===== 评估队列相关 =====
export function getAssessmentQueues(studentId) {
  return getData().assessmentQueues
    .filter(q => q.studentId === studentId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
export function getAssessmentQueue(queueId) {
  return getData().assessmentQueues.find(q => q.id === queueId) || null;
}
export function createAssessmentQueue(queue) {
  const data = getData();
  const newQueue = {
    ...queue,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
  data.assessmentQueues.push(newQueue);
  saveData(data);
  return newQueue;
}
export function updateAssessmentQueue(queueId, updates) {
  const data = getData();
  const idx = data.assessmentQueues.findIndex(q => q.id === queueId);
  if (idx !== -1) {
    data.assessmentQueues[idx] = { ...data.assessmentQueues[idx], ...updates, updatedAt: new Date().toISOString() };
    saveData(data);
  }
}
export function updateAssessmentQueueItem(queueId, itemId, updates) {
  const data = getData();
  const queue = data.assessmentQueues.find(q => q.id === queueId);
  if (!queue) return;
  const item = queue.items.find(i => i.id === itemId);
  if (!item) return;
  Object.assign(item, updates);
  if (updates.result) item.status = 'assessed';
  queue.updatedAt = new Date().toISOString();
  const allDone = queue.items.every(i => i.status !== 'pending');
  if (allDone && queue.items.length > 0) queue.status = 'completed';
  else if (queue.items.some(i => i.status === 'assessed' || i.status === 'skipped')) queue.status = 'in_progress';
  saveData(data);
}
export function deleteAssessmentQueue(queueId) {
  const data = getData();
  data.assessmentQueues = data.assessmentQueues.filter(q => q.id !== queueId);
  saveData(data);
}
export function syncAssessmentQueueToSkillStatuses(queueId) {
  const data = getData();
  const queue = data.assessmentQueues.find(q => q.id === queueId);
  if (!queue) return;
  queue.items.forEach(item => {
    if (item.result && item.skillCode) {
      const idx = data.skillStatuses.findIndex(
        s => s.studentId === queue.studentId && s.skillCode === item.skillCode
      );
      if (idx !== -1) {
        data.skillStatuses[idx].status = item.result;
        data.skillStatuses[idx].evaluatedAt = new Date().toISOString().split('T')[0];
      } else {
        data.skillStatuses.push({
          id: generateId(),
          studentId: queue.studentId,
          skillCode: item.skillCode,
          skillName: item.description,
          domain: item.domainKey,
          status: item.result,
          evaluatedAt: new Date().toISOString().split('T')[0],
        });
      }
    }
  });
  saveData(data);
}

// ===== 上课队列相关 =====
export function getTeachingQueues(studentId) {
  return getData().teachingQueues
    .filter(q => q.studentId === studentId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
export function getTeachingQueue(queueId) {
  return getData().teachingQueues.find(q => q.id === queueId) || null;
}
export function createTeachingQueue(queue) {
  const data = getData();
  const newQueue = {
    ...queue,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };
  data.teachingQueues.push(newQueue);
  saveData(data);
  return newQueue;
}
export function updateTeachingQueue(queueId, updates) {
  const data = getData();
  const idx = data.teachingQueues.findIndex(q => q.id === queueId);
  if (idx !== -1) {
    data.teachingQueues[idx] = { ...data.teachingQueues[idx], ...updates, updatedAt: new Date().toISOString() };
    saveData(data);
  }
}
export function updateTeachingQueueItem(queueId, itemId, updates) {
  const data = getData();
  const queue = data.teachingQueues.find(q => q.id === queueId);
  if (!queue) return;
  const item = queue.items.find(i => i.id === itemId);
  if (!item) return;
  Object.assign(item, updates);
  queue.updatedAt = new Date().toISOString();
  const allDone = queue.items.every(i => i.status === 'completed' || i.status === 'skipped');
  if (allDone && queue.items.length > 0) queue.status = 'completed';
  else if (queue.items.some(i => i.status === 'recording' || i.status === 'completed' || i.status === 'skipped')) queue.status = 'in_progress';
  saveData(data);
}
export function deleteTeachingQueue(queueId) {
  const data = getData();
  data.teachingQueues = data.teachingQueues.filter(q => q.id !== queueId);
  saveData(data);
}
export function syncTeachingQueueToSession(queueId) {
  const data = getData();
  const queue = data.teachingQueues.find(q => q.id === queueId);
  if (!queue) return null;
  const trialGoals = queue.items.filter(i => i.status !== 'skipped').map(item => ({
    goalId: item.goalId,
    description: item.description,
    domain: item.domain,
    hierarchyPath: item.hierarchyPath,
    type: item.type,
    probeResult: item.probeResult,
    trials: item.trials || [],
    finalProbeResult: item.finalProbeResult,
    passed: item.passed,
    promptLevel: item.promptLevel || 0,
    barrierTags: item.barrierTags || [],
  }));
  // 判定通过
  trialGoals.forEach(goal => {
    if (goal.probeResult === '+' && goal.finalProbeResult === '+') goal.passed = true;
    if (goal.trials && goal.trials.length >= 10) {
      const correct = goal.trials.filter(t => t === '+').length;
      goal.passed = correct >= 8;
    }
  });
  const session = {
    id: generateId(),
    studentId: queue.studentId,
    date: new Date().toISOString().split('T')[0],
    teacherId: data.currentUser?.id,
    teacherName: data.currentUser?.name,
    trialGoals,
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  data.teachingSessions.push(session);
  // 写入训练记录
  trialGoals.forEach(goal => {
    if (!goal.probeResult && goal.trials.length === 0 && !goal.finalProbeResult) return;
    const correct = goal.trials.filter(t => t === '+').length;
    data.trainingRecords.push({
      id: generateId(),
      studentId: queue.studentId,
      goalId: goal.goalId,
      recordDate: session.date,
      value: goal.trials.length > 0 ? Math.round((correct / goal.trials.length) * 100) : 0,
      totalTrials: goal.trials.length || 1,
      correctTrials: correct,
      errorTrials: goal.trials.length - correct,
      promptLevel: goal.promptLevel || 0,
      barrierTags: goal.barrierTags || [],
      notes: goal.passed === true ? '上课通过' : goal.passed === false ? '上课未通过' : '上课记录',
      recorderId: data.currentUser?.id,
      recorderName: data.currentUser?.name,
    });
  });
  queue.status = 'completed';
  saveData(data);
  return session;
}
