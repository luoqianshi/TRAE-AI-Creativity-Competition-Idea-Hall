/**
 * 公考 AI 学习助手 - 工具函数与 Mock 数据
 */

// ============================================
// Mock 数据
// ============================================
const MockData = {
  // 用户初始状态
  userState: {
    isFirstVisit: true,
    nickname: '备考人',
    currentExam: 'national',
    currentExamDate: '2026-11-29',
    todayTasks: [
      { id: 1, title: '行测判断推理 20题', type: 'practice', done: false, target: 20, current: 0, subject: 'reasoning' },
      { id: 2, title: '申论小题批改', type: 'essay', done: false, target: 1, current: 0 },
      { id: 3, title: '错题复习 10题', type: 'wrongbook', done: true, target: 10, current: 10 },
      { id: 4, title: '每日时政阅读', type: 'news', done: false, target: 1, current: 0 }
    ],
    streakDays: 12,
    totalQuestions: 1523,
    correctRate: 0.68,
    totalStudyMinutes: 3280,
    lastPractice: {
      subject: 'reasoning',
      correct: 14,
      total: 20,
      date: '2026-07-05'
    }
  },

  // 题目数据
  questions: [
    {
      id: 101,
      examType: 'national',
      subject: 'reasoning',
      questionType: 'logic',
      content: '所有公务员都要为人民服务，小张是公务员，所以小张要为人民服务。以下哪项与上述推理结构相同？',
      options: ['A. 所有金属都导电，铜是金属，所以铜导电', 'B. 有些鸟会飞，企鹅是鸟，所以企鹅会飞', 'C. 所有学生都要考试，小李是学生，所以小李不要考试', 'D. 有些花是红色的，玫瑰是花，所以玫瑰是红色的'],
      correct: 0,
      analysis: '题干是三段论推理，大前提"所有A是B"，小前提"C是A"，结论"C是B"。只有A项完全符合这一结构。',
      aiSolution: {
        审题: '识别推理结构，找出与题干相同的三段论形式',
        踩分点: ['确认大前提形式（全称肯定）', '确认小前提形式（个体属于类）', '确认结论形式（个体具有属性）'],
        材料定位: '题干中的"所有...都..."结构',
        答题框架: '逐一对比选项的三段论结构',
        注意事项: '注意区分"所有"和"有些"，注意结论的肯定/否定'
      },
      difficulty: 3,
      year: 2024
    },
    {
      id: 102,
      examType: 'national',
      subject: 'reasoning',
      questionType: 'graphic',
      content: '请从四个选项中选择最适合填入问号处的图形，使之呈现一定的规律性。（描述：第一行：圆形、三角形、正方形；第二行：正方形、圆形、三角形；第三行：三角形、正方形、？）',
      options: ['A. 圆形', 'B. 三角形', 'C. 正方形', 'D. 五角星'],
      correct: 0,
      analysis: '每行都是圆形、三角形、正方形的循环排列。第三行已有三角形、正方形，缺少圆形。',
      aiSolution: {
        审题: '寻找图形的排列规律',
        踩分点: ['观察每行图形的种类', '寻找循环或位移规律'],
        材料定位: '三行三列的图形矩阵',
        答题框架: '逐行分析图形组成 → 发现循环规律 → 确定缺失图形',
        注意事项: '不要只看形状，还要注意位置关系'
      },
      difficulty: 2,
      year: 2024
    },
    {
      id: 103,
      examType: 'national',
      subject: 'data',
      questionType: 'calculation',
      content: '2024年某省GDP为12000亿元，同比增长8.5%。求2023年该省GDP约为多少亿元？',
      options: ['A. 10800', 'B. 11000', 'C. 11060', 'D. 11200'],
      correct: 2,
      analysis: '设2023年GDP为x，则 x × (1 + 8.5%) = 12000，x = 12000 / 1.085 ≈ 11060亿元。',
      aiSolution: {
        审题: '已知现期值和增长率，求基期值',
        踩分点: ['识别公式：基期 = 现期 / (1 + 增长率)', '准确进行除法计算'],
        材料定位: '题干中的"同比增长8.5%"',
        答题框架: '列出公式 → 代入数据 → 计算结果',
        注意事项: '注意增长率是8.5%不是8%，除数应为1.085'
      },
      difficulty: 2,
      year: 2024
    },
    {
      id: 104,
      examType: 'national',
      subject: 'language',
      questionType: 'fill',
      content: '在国际形势_____的当下，我们更需要保持战略定力，坚持走自己的路。',
      options: ['A. 风起云涌', 'B. 变幻莫测', 'C. 瞬息万变', 'D. 错综复杂'],
      correct: 3,
      analysis: '"错综复杂"强调形势复杂、头绪多，与"保持战略定力"形成对比，最符合语境。',
      aiSolution: {
        审题: '根据语境选择最恰当的成语',
        踩分点: ['分析语境需要的语义（复杂/变化/激烈）', '辨析近义成语的细微差别'],
        材料定位: '"更需要保持战略定力"暗示外部环境的复杂性',
        答题框架: '分析语境 → 辨析选项 → 选择最契合项',
        注意事项: '注意成语的感情色彩和适用对象'
      },
      difficulty: 3,
      year: 2024
    },
    {
      id: 105,
      examType: 'national',
      subject: 'common',
      questionType: 'knowledge',
      content: '下列关于我国宪法的说法，正确的是：',
      options: ['A. 宪法是普通法律的总和', 'B. 宪法具有最高法律效力', 'C. 宪法规定了公民的所有权利', 'D. 宪法可以随便修改'],
      correct: 1,
      analysis: '宪法是国家的根本法，具有最高法律效力，是普通法律的立法基础和依据。',
      aiSolution: {
        审题: '判断关于宪法的基本说法',
        踩分点: ['宪法的地位（根本法）', '宪法的效力（最高）', '宪法的稳定性（修改程序严格）'],
        材料定位: '宪法的基本特征',
        答题框架: '逐一排除错误选项 → 确定正确选项',
        注意事项: '宪法规定的是基本权利而非所有权利'
      },
      difficulty: 2,
      year: 2024
    }
  ],

  // 申论批改数据
  essayEvaluation: {
    essayId: 501,
    topic: '根据给定材料，概括"数字乡村建设"的主要举措和成效。',
    userAnswer: '近年来，我国积极推进数字乡村建设。一是加强农村信息基础设施建设，实现了宽带网络全覆盖。二是推广智慧农业，利用物联网技术提升农业生产效率。三是建设农村电商平台，帮助农民拓宽销售渠道。四是推进乡村数字治理，提升公共服务水平。成效方面，农民收入有所增加，农业现代化水平提升，乡村治理更加高效。',
    models: [
      {
        name: 'DeepSeek-V3',
        score: 72,
        dimensions: { 立意: 75, 结构: 70, 语言: 72, 内容: 71 },
        comment: ['要点基本齐全，涵盖了基础设施、智慧农业、电商、治理四个方面。', '概括语言较为准确，但部分表述略显笼统。', '缺少具体数据支撑，说服力不足。', '建议补充典型案例和量化成果。']
      },
      {
        name: 'Qwen-Max',
        score: 75,
        dimensions: { 立意: 78, 结构: 73, 语言: 75, 内容: 74 },
        comment: ['对材料的提炼能力较好，四个维度划分合理。', '语言规范，表述简洁明了。', '成效部分过于简略，未充分展开。', '建议加强成效与举措的对应关系。']
      },
      {
        name: 'Doubao-Pro',
        score: 70,
        dimensions: { 立意: 72, 结构: 68, 语言: 70, 内容: 70 },
        comment: ['要点识别完整，但逻辑层次不够清晰。', '语言表述通顺，但缺乏亮点。', '成效概括过于泛泛，缺少针对性。', '建议增加问题与对策的呼应。']
      }
    ],
    weakness: ['概括不够精炼，存在口语化表达', '缺乏具体数据和案例支撑', '成效与举措的对应关系不够紧密'],
    recommendedTarget: '提升归纳概括能力：每日精读2篇人民日报评论，提炼核心观点并控制在50字以内。'
  },

  // 错题本数据
  wrongQuestions: [
    {
      questionId: 101,
      wrongCount: 2,
      lastWrongAt: '2026-07-05',
      wrongReason: '概念混淆',
      wrongReasonDetail: '未能准确识别三段论的结构形式',
      similarQuestions: [201, 202, 203],
      isCollected: true,
      userAnswer: 1
    },
    {
      questionId: 103,
      wrongCount: 1,
      lastWrongAt: '2026-07-04',
      wrongReason: '计算失误',
      wrongReasonDetail: '增长率计算时除数使用错误',
      similarQuestions: [204, 205, 206],
      isCollected: false,
      userAnswer: 1
    }
  ],

  // 相似题（举一反三）
  similarQuestions: {
    201: {
      id: 201,
      content: '所有科学家都勤于思考，爱因斯坦是科学家，所以爱因斯坦勤于思考。以下哪项推理结构与上述相同？',
      options: ['A. 所有医生都穿白大褂，张医生是医生，所以张医生穿白大褂', 'B. 有些老师很严格，王老师是老师，所以王老师很严格', 'C. 所有运动员都锻炼身体，小李不是运动员，所以小李不锻炼身体', 'D. 有些鸟不会飞，鸵鸟是鸟，所以鸵鸟不会飞'],
      correct: 0,
      analysis: '同样是标准三段论：所有A是B，C是A，所以C是B。'
    },
    202: {
      id: 202,
      content: '凡是有生命力的文化都是在交流中发展的，中华文化是有生命力的，所以中华文化是在交流中发展的。以下哪项结构相同？',
      options: ['A. 凡是真理都经得起实践检验，马克思主义是真理，所以马克思主义经得起实践检验', 'B. 有些理论是创新的，相对论是理论，所以相对论是创新的', 'C. 所有植物都需要阳光，蘑菇不是植物，所以蘑菇不需要阳光', 'D. 有些动物是哺乳动物，鲸是动物，所以鲸是哺乳动物'],
      correct: 0,
      analysis: '标准三段论结构，与题干完全一致。'
    },
    203: {
      id: 203,
      content: '所有正义的事业都是值得支持的，环保事业是正义的事业，所以环保事业是值得支持的。以下哪项结构相同？',
      options: ['A. 所有违法行为都应受惩罚，偷税是违法行为，所以偷税应受惩罚', 'B. 有些政策受欢迎，减税政策是政策，所以减税政策受欢迎', 'C. 所有学生都应学习，小李是学生，所以小李不应学习', 'D. 有些疾病可治愈，感冒是疾病，所以感冒可治愈'],
      correct: 0,
      analysis: '经典三段论推理，结构与题干完全对应。'
    }
  },

  // 生成练习报告
  generateReport(sessionData) {
    const { total, correct, duration, subjectBreakdown, timeCurve } = sessionData;
    const wrong = total - correct;
    const avgTime = Math.round(duration / total);
    return {
      total,
      correct,
      wrong,
      duration,
      avgTime,
      correctRate: Math.round((correct / total) * 100),
      timeCurve: timeCurve || Array.from({length: total}, () => Math.floor(Math.random() * 80) + 40),
      subjectBreakdown: subjectBreakdown || {
        reasoning: { total: 5, correct: 4 },
        data: { total: 5, correct: 3 },
        language: { total: 5, correct: 4 },
        math: { total: 3, correct: 2 },
        common: { total: 2, correct: 1 }
      },
      abilityRadar: {
        速度: 75,
        准确率: correct / total * 100,
        稳定性: 70,
        知识覆盖: 80,
        难题突破: 65
      }
    };
  },

  // 学习数据（看板用）
  studyData: {
    dailyCorrectRate: [62, 65, 68, 70, 66, 72, 68],
    dailyLabels: ['6.30', '7.01', '7.02', '7.03', '7.04', '7.05', '7.06'],
    essayScores: [65, 68, 70, 72, 75, 73, 72],
    moduleStrength: {
      reasoning: { score: 78, level: 'strong' },
      data: { score: 65, level: 'weak' },
      language: { score: 72, level: 'medium' },
      math: { score: 58, level: 'weak' },
      common: { score: 70, level: 'medium' }
    },
    weeklyMinutes: [45, 60, 30, 90, 120, 75, 60],
    checkInDays: Array.from({length: 30}, (_, i) => ({
      day: i + 1,
      intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0
    }))
  }
};

// ============================================
// 状态管理（localStorage 封装）
// ============================================
const Store = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`gk_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    localStorage.setItem(`gk_${key}`, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(`gk_${key}`);
  },

  // 初始化用户状态
  initUserState() {
    if (!this.get('userState')) {
      this.set('userState', MockData.userState);
    }
  },

  // 获取用户状态
  getUserState() {
    return this.get('userState', MockData.userState);
  },

  // 更新用户状态
  updateUserState(updater) {
    const state = this.getUserState();
    const newState = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    this.set('userState', newState);
    return newState;
  },

  // 获取当前练习
  getCurrentPractice() {
    return this.get('currentPractice', null);
  },

  setCurrentPractice(data) {
    this.set('currentPractice', data);
  },

  // 获取最后报告
  getLastReport() {
    return this.get('lastReport', null);
  },

  setLastReport(data) {
    this.set('lastReport', data);
  },

  // 添加错题
  addWrongQuestion(questionId, userAnswer, reason = '未知') {
    const wrongs = this.get('wrongQuestions', []);
    const existing = wrongs.find(w => w.questionId === questionId);
    if (existing) {
      existing.wrongCount++;
      existing.lastWrongAt = new Date().toISOString().split('T')[0];
      existing.userAnswer = userAnswer;
    } else {
      wrongs.push({
        questionId,
        wrongCount: 1,
        lastWrongAt: new Date().toISOString().split('T')[0],
        wrongReason: reason,
        wrongReasonDetail: '',
        similarQuestions: [201, 202, 203],
        isCollected: false,
        userAnswer
      });
    }
    this.set('wrongQuestions', wrongs);
  },

  // 获取错题列表
  getWrongQuestions() {
    return this.get('wrongQuestions', MockData.wrongQuestions);
  },

  // 清除所有数据（调试用）
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('gk_'))
      .forEach(k => localStorage.removeItem(k));
  }
};

// ============================================
// 路由工具
// ============================================
const Router = {
  go(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullUrl = query ? `${url}?${query}` : url;
    window.location.href = fullUrl;
  },

  back() {
    window.history.back();
  },

  getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  },

  getParams() {
    const params = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      params[k] = v;
    });
    return params;
  }
};

// ============================================
// 动画工具
// ============================================
const Animation = {
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  },

  fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  },

  slideUp(element, duration = 300) {
    element.style.transform = 'translateY(20px)';
    element.style.opacity = '0';
    element.style.transition = `all ${duration}ms ease`;
    requestAnimationFrame(() => {
      element.style.transform = 'translateY(0)';
      element.style.opacity = '1';
    });
  },

  // 数字增长动画
  countUp(element, target, duration = 1000, suffix = '') {
    const start = 0;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);
      element.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  },

  // 打字机效果
  typewriter(element, text, speed = 30) {
    return new Promise(resolve => {
      let i = 0;
      element.textContent = '';
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }
};

// ============================================
// 计时器
// ============================================
class Timer {
  constructor() {
    this.seconds = 0;
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.seconds++;
      if (this.onTick) this.onTick(this.seconds);
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.interval);
  }

  stop() {
    this.pause();
    const total = this.seconds;
    this.seconds = 0;
    return total;
  }

  format() {
    const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
    const s = (this.seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  static formatSeconds(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) {
      return `${m}分${s}秒`;
    }
    return `${s}秒`;
  }
}

// ============================================
// Toast 提示
// ============================================
function Toast(message, type = 'success', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-circle'
  };

  toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}" style="width:18px;height:18px;"></i><span>${message}</span>`;
  container.appendChild(toast);

  if (window.lucide) {
    lucide.createIcons({ nodes: [toast] });
  }

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// 工具函数
// ============================================
const Utils = {
  // 获取问候语
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  },

  // 计算倒计时天数
  getCountdownDays(targetDate) {
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  // 随机打乱数组
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // 生成唯一ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // 截断文本
  truncate(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // 防抖
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // 节流到下一帧
  rafThrottle(fn) {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
        ticking = true;
      }
    };
  }
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  Store.initUserState();

  // 初始化 Lucide 图标
  if (window.lucide) {
    lucide.createIcons();
  }
});
