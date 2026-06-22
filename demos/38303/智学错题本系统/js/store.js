/**
 * 智学错题本 - 数据存储管理
 * 基于 localStorage 的本地数据持久化
 */
const Store = {
  DB_KEY: 'zxctb_db_v1',
  db: null,

  /** 初始化数据库 */
  init() {
    const saved = localStorage.getItem(this.DB_KEY);
    if (saved) {
      this.db = JSON.parse(saved);
    } else {
      this.db = this._seedData();
      this._save();
    }
    return this.db;
  },

  _save() {
    localStorage.setItem(this.DB_KEY, JSON.stringify(this.db));
  },

  _genId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  _now() { return Date.now(); },

  /** 种子数据 */
  _seedData() {
    const now = Date.now();
    const day = 86400000;
    return {
      user: {
        name: '小明同学',
        grade: '初三',
        avatar: '📚',
        totalStudyDays: 12,
        streak: 5,
        lastCheckIn: now - day,
      },
      subjects: [
        { id: 's1', name: '数学', color: '#4A90D9', icon: '🔢' },
        { id: 's2', name: '语文', color: '#E8654A', icon: '📖' },
        { id: 's3', name: '英语', color: '#4CAF7D', icon: '🔤' },
        { id: 's4', name: '物理', color: '#9B6BCD', icon: '⚡' },
        { id: 's5', name: '化学', color: '#F5A623', icon: '🧪' },
      ],
      questions: [
        {
          id: 'q1', subjectId: 's1', subjectName: '数学',
          knowledgePoint: '一元二次方程',
          question: '已知方程 x² - 5x + 6 = 0，求x的值。',
          myAnswer: 'x=2, x=3',
          correctAnswer: 'x=2, x=3',
          isCorrect: false,
          errorType: '计算错误',
          difficulty: 2,
          note: '因式分解法：(x-2)(x-3)=0',
          photo: '',
          status: 'mastered',
          addDate: now - 7 * day,
          reviewCount: 3,
          nextReview: now - day,
          reviewHistory: [now - 6 * day, now - 4 * day, now - 2 * day],
        },
        {
          id: 'q2', subjectId: 's1', subjectName: '数学',
          knowledgePoint: '几何证明',
          question: '证明：等腰三角形底边上的中线也是高线和角平分线。',
          myAnswer: '利用SSS证明两个三角形全等',
          correctAnswer: '通过作底边中线，利用SSS证明△ABD≅△ACD，得出对应角相等',
          isCorrect: false,
          errorType: '思路不清',
          difficulty: 3,
          note: '关键：利用等腰三角形性质 + 全等三角形判定',
          photo: '',
          status: 'learning',
          addDate: now - 3 * day,
          reviewCount: 1,
          nextReview: now,
          reviewHistory: [now - 2 * day],
        },
        {
          id: 'q3', subjectId: 's3', subjectName: '英语',
          knowledgePoint: '现在完成时',
          question: '选择正确选项：I ___ my homework already. (A.have finished B.finished C.finish)',
          myAnswer: 'B. finished',
          correctAnswer: 'A. have finished',
          isCorrect: false,
          errorType: '语法混淆',
          difficulty: 1,
          note: 'already常与现在完成时搭配，表示已经完成的动作',
          photo: '',
          status: 'learning',
          addDate: now - 2 * day,
          reviewCount: 0,
          nextReview: now,
          reviewHistory: [],
        },
        {
          id: 'q4', subjectId: 's4', subjectName: '物理',
          knowledgePoint: '电路分析',
          question: '一个并联电路中有两个电阻R1=6Ω和R2=3Ω，求总电阻。',
          myAnswer: '9Ω',
          correctAnswer: '2Ω (1/R = 1/R1 + 1/R2 = 1/6 + 1/3 = 1/2, R=2Ω)',
          isCorrect: false,
          errorType: '概念错误',
          difficulty: 2,
          note: '并联电阻公式：1/R = 1/R1 + 1/R2，不是直接相加！',
          photo: '',
          status: 'learning',
          addDate: now - 1 * day,
          reviewCount: 0,
          nextReview: now,
          reviewHistory: [],
        },
        {
          id: 'q5', subjectId: 's2', subjectName: '语文',
          knowledgePoint: '文言文翻译',
          question: '翻译：学而不思则罔，思而不学则殆。',
          myAnswer: '只学习不思考就会迷惑，只思考不学习就会危险。',
          correctAnswer: '只学习不思考就会迷惑而无所得，只思考不学习就会精神疲倦而无所得。',
          isCorrect: false,
          errorType: '理解偏差',
          difficulty: 2,
          note: '"殆"意为"精神疲倦"，不是"危险"',
          photo: '',
          status: 'mastered',
          addDate: now - 10 * day,
          reviewCount: 4,
          nextReview: now + 3 * day,
          reviewHistory: [now - 9 * day, now - 7 * day, now - 4 * day, now - day],
        },
        {
          id: 'q6', subjectId: 's5', subjectName: '化学',
          knowledgePoint: '化学方程式配平',
          question: '配平：Fe + O₂ → Fe₃O₄',
          myAnswer: '2Fe + 2O₂ → Fe₃O₄',
          correctAnswer: '3Fe + 2O₂ → Fe₃O₄',
          isCorrect: false,
          errorType: '计算错误',
          difficulty: 2,
          note: 'Fe有3个，所以前面系数是3；O有4个，O₂系数是2',
          photo: '',
          status: 'learning',
          addDate: now - 5 * day,
          reviewCount: 1,
          nextReview: now - day,
          reviewHistory: [now - 4 * day],
        },
      ],
      studyLogs: [
        { id: 'sl1', date: now - day, duration: 45, type: 'review', count: 3, note: '复习数学错题' },
        { id: 'sl2', date: now - 2 * day, duration: 30, type: 'add', count: 2, note: '添加英语和物理错题' },
        { id: 'sl3', date: now - 3 * day, duration: 60, type: 'review', count: 5, note: '全面复习' },
        { id: 'sl4', date: now - 4 * day, duration: 20, type: 'review', count: 2, note: '快速复习语文' },
        { id: 'sl5', date: now - 5 * day, duration: 40, type: 'add', count: 1, note: '添加化学错题' },
      ],
      tags: ['一元二次方程', '几何证明', '现在完成时', '电路分析', '文言文翻译', '化学方程式配平'],
    };
  },

  // ==================== 用户 ====================
  getUser() { return this.db.user; },
  updateUser(data) { this.db.user = { ...this.db.user, ...data }; this._save(); },

  /** 学习打卡 */
  checkIn() {
    const user = this.db.user;
    const today = new Date(); today.setHours(0,0,0,0);
    const last = new Date(user.lastCheckIn); last.setHours(0,0,0,0);
    const diffDays = Math.round((today - last) / 86400000);

    if (diffDays === 0) return { success: false, msg: '今天已经打卡了' };
    if (diffDays === 1) user.streak += 1;
    else user.streak = 1;

    user.totalStudyDays += 1;
    user.lastCheckIn = Date.now();
    this._save();
    return { success: true, streak: user.streak };
  },

  // ==================== 学科 ====================
  getSubjects() { return this.db.subjects; },
  getSubjectById(id) { return this.db.subjects.find(s => s.id === id); },

  // ==================== 错题 ====================
  getQuestions(filter = {}) {
    let qs = this.db.questions;
    if (filter.subjectId) qs = qs.filter(q => q.subjectId === filter.subjectId);
    if (filter.status) qs = qs.filter(q => q.status === filter.status);
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      qs = qs.filter(q =>
        q.question.toLowerCase().includes(kw) ||
        q.knowledgePoint.toLowerCase().includes(kw) ||
        (q.note && q.note.toLowerCase().includes(kw))
      );
    }
    return qs.sort((a, b) => b.addDate - a.addDate);
  },

  getQuestionById(id) { return this.db.questions.find(q => q.id === id); },

  addQuestion(data) {
    const subject = this.getSubjectById(data.subjectId);
    const question = {
      id: this._genId('q'),
      subjectName: subject ? subject.name : '',
      isCorrect: false,
      difficulty: 1,
      note: '',
      photo: '',
      status: 'learning',
      addDate: this._now(),
      reviewCount: 0,
      nextReview: this._now(),
      reviewHistory: [],
      ...data,
    };
    this.db.questions.push(question);
    // 添加知识点标签
    if (data.knowledgePoint && !this.db.tags.includes(data.knowledgePoint)) {
      this.db.tags.push(data.knowledgePoint);
    }
    this._save();
    return question;
  },

  updateQuestion(id, data) {
    const idx = this.db.questions.findIndex(q => q.id === id);
    if (idx >= 0) {
      this.db.questions[idx] = { ...this.db.questions[idx], ...data };
      this._save();
      return this.db.questions[idx];
    }
    return null;
  },

  deleteQuestion(id) {
    this.db.questions = this.db.questions.filter(q => q.id !== id);
    this._save();
  },

  /** 标记复习完成（艾宾浩斯遗忘曲线） */
  reviewQuestion(id, result) {
    const q = this.getQuestionById(id);
    if (!q) return null;

    // 艾宾浩斯复习间隔（天）：1, 2, 4, 7, 15
    const intervals = [1, 2, 4, 7, 15];
    q.reviewCount += 1;
    q.reviewHistory.push(this._now());

    if (result === 'mastered') {
      q.status = 'mastered';
      const intervalIdx = Math.min(q.reviewCount - 1, intervals.length - 1);
      q.nextReview = this._now() + intervals[intervalIdx] * 86400000;
    } else {
      // 没掌握，明天继续复习
      q.status = 'learning';
      q.nextReview = this._now() + 86400000;
    }
    this._save();
    return q;
  },

  /** 获取今日待复习 */
  getTodayReview() {
    const now = this._now();
    return this.db.questions.filter(q => q.status === 'learning' && q.nextReview <= now);
  },

  // ==================== 学习日志 ====================
  getStudyLogs() {
    return this.db.studyLogs.sort((a, b) => b.date - a.date);
  },

  addStudyLog(data) {
    const log = { id: this._genId('sl'), date: this._now(), ...data };
    this.db.studyLogs.push(log);
    this._save();
    return log;
  },

  // ==================== 统计 ====================
  getStats() {
    const qs = this.db.questions;
    const subjects = this.db.subjects;
    const todayReview = this.getTodayReview();

    // 按学科统计
    const bySubject = subjects.map(s => {
      const subjectQs = qs.filter(q => q.subjectId === s.id);
      return {
        ...s,
        total: subjectQs.length,
        mastered: subjectQs.filter(q => q.status === 'mastered').length,
        learning: subjectQs.filter(q => q.status === 'learning').length,
      };
    });

    // 按错误类型统计
    const errorTypes = {};
    qs.forEach(q => {
      errorTypes[q.errorType] = (errorTypes[q.errorType] || 0) + 1;
    });

    // 掌握率
    const masteredCount = qs.filter(q => q.status === 'mastered').length;
    const masteryRate = qs.length > 0 ? Math.round((masteredCount / qs.length) * 100) : 0;

    // 近7天学习时长
    const now = this._now();
    const day = 86400000;
    const recent7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dateStart = now - i * day;
      const d = new Date(dateStart); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const dayLogs = this.db.studyLogs.filter(l => l.date >= d.getTime() && l.date < next.getTime());
      recent7Days.push({
        date: d.getTime(),
        label: `${d.getMonth()+1}/${d.getDate()}`,
        duration: dayLogs.reduce((sum, l) => sum + l.duration, 0),
        count: dayLogs.reduce((sum, l) => sum + l.count, 0),
      });
    }

    return {
      total: qs.length,
      mastered: masteredCount,
      learning: qs.filter(q => q.status === 'learning').length,
      masteryRate,
      todayReviewCount: todayReview.length,
      bySubject,
      errorTypes,
      recent7Days,
      totalStudyDays: this.db.user.totalStudyDays,
      streak: this.db.user.streak,
    };
  },

  /** 重置数据 */
  reset() {
    localStorage.removeItem(this.DB_KEY);
    this.init();
  }
};
