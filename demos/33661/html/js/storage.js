/* ============================================================
   本地存储层 —— LocalStorage 封装
   命名空间：poemnotes_
   ============================================================ */

const Store = {
  PREFIX: 'poemnotes_',
  KEYS: {
    PROFILE: 'profile',
    CHRONICLES: 'chronicles',
    SALARIES: 'salaries',
    SKILLS: 'skills',
    CONTRACTS: 'contracts',
    DREAMS: 'dreams',
    CERTS: 'certs',
    SETTINGS: 'settings',
    USED_POEMS: 'used_poems'
  },

  _read(key) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Store read fail:', key, e);
      return null;
    }
  },

  _write(key, val) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.warn('Store write fail:', key, e);
      return false;
    }
  },

  /* —— 档案 —— */
  getProfile() {
    return this._read(this.KEYS.PROFILE) || {
      nickname: '打工人',
      craft: '',
      hometown: '',
      goal: '',
      createdAt: Date.now()
    };
  },
  setProfile(p) { return this._write(this.KEYS.PROFILE, { ...this.getProfile(), ...p }); },

  /* —— 诗笺（四时志） —— */
  getChronicles() { return this._read(this.KEYS.CHRONICLES) || []; },
  addChronicle(entry) {
    const list = this.getChronicles();
    entry.id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    entry.createdAt = Date.now();
    list.unshift(entry);
    this._write(this.KEYS.CHRONICLES, list);
    return entry;
  },
  updateChronicle(id, patch) {
    const list = this.getChronicles();
    const i = list.findIndex(e => e.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; this._write(this.KEYS.CHRONICLES, list); }
  },
  deleteChronicle(id) {
    const list = this.getChronicles().filter(e => e.id !== id);
    this._write(this.KEYS.CHRONICLES, list);
  },

  /* —— 薪火（收入） —— */
  getSalaries() { return this._read(this.KEYS.SALARIES) || []; },
  addSalary(rec) {
    const list = this.getSalaries();
    rec.id = 's_' + Date.now();
    rec.createdAt = Date.now();
    list.unshift(rec);
    this._write(this.KEYS.SALARIES, list);
    return rec;
  },
  deleteSalary(id) {
    this._write(this.KEYS.SALARIES, this.getSalaries().filter(s => s.id !== id));
  },

  /* —— 匠心（技能） —— */
  getSkills() { return this._read(this.KEYS.SKILLS) || []; },
  addSkill(sk) {
    const list = this.getSkills();
    sk.id = 'k_' + Date.now();
    sk.createdAt = Date.now();
    sk.totalHours = 0;
    sk.totalSessions = 0;
    list.unshift(sk);
    this._write(this.KEYS.SKILLS, list);
    return sk;
  },
  updateSkill(id, patch) {
    const list = this.getSkills();
    const i = list.findIndex(s => s.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; this._write(this.KEYS.SKILLS, list); }
  },
  deleteSkill(id) {
    this._write(this.KEYS.SKILLS, this.getSkills().filter(s => s.id !== id));
  },
  /** 记一次修炼 */
  practiceSkill(id, hours) {
    const list = this.getSkills();
    const i = list.findIndex(s => s.id === id);
    if (i < 0) return null;
    const s = list[i];
    s.totalHours = (s.totalHours || 0) + hours;
    s.totalSessions = (s.totalSessions || 0) + 1;
    // 自动判定突破
    const realms = ['初学', '入门', '精进', '大成'];
    const thresholds = [
      { hours: 30, sessions: 10 },
      { hours: 100, sessions: 50 },
      { hours: 500, sessions: 200 }
    ];
    let newRealm = 0;
    for (let r = 0; r < thresholds.length; r++) {
      if (s.totalHours >= thresholds[r].hours && s.totalSessions >= thresholds[r].sessions) {
        newRealm = r + 1;
      }
    }
    const broke = newRealm > (s.realm || 0);
    s.realm = newRealm;
    s.realmName = realms[newRealm];
    list[i] = s;
    this._write(this.KEYS.SKILLS, list);
    return { skill: s, broke };
  },

  /* —— 归园田（梦想） —— */
  getDreams() { return this._read(this.KEYS.DREAMS) || []; },
  addDream(d) {
    const list = this.getDreams();
    d.id = 'd_' + Date.now();
    d.createdAt = Date.now();
    d.allocated = 0;
    d.fulfilled = 0;
    list.unshift(d);
    this._write(this.KEYS.DREAMS, list);
    return d;
  },
  updateDream(id, patch) {
    const list = this.getDreams();
    const i = list.findIndex(d => d.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; this._write(this.KEYS.DREAMS, list); }
  },
  deleteDream(id) {
    this._write(this.KEYS.DREAMS, this.getDreams().filter(d => d.id !== id));
  },
  /** 向梦想划拨金额 */
  allocateToDream(id, amount) {
    const list = this.getDreams();
    const i = list.findIndex(d => d.id === id);
    if (i < 0) return;
    list[i].allocated = (list[i].allocated || 0) + amount;
    if (list[i].allocated >= list[i].targetAmount) list[i].fulfilled = 1;
    this._write(this.KEYS.DREAMS, list);
  },

  /* —— 设置 —— */
  getSettings() {
    return this._read(this.KEYS.SETTINGS) || {
      theme: 'celadon',
      font: 'serif',
      remindDaily: true,
      remindTerm: true,
      allocateRate: 30
    };
  },
  setSettings(s) { return this._write(this.KEYS.SETTINGS, { ...this.getSettings(), ...s }); },

  /* —— 用过的诗（去重） —— */
  getUsedPoems() { return this._read(this.KEYS.USED_POEMS) || []; },
  addUsedPoem(pid) {
    const list = this.getUsedPoems();
    list.push({ pid, ts: Date.now() });
    // 只保留近 30 天
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
    this._write(this.KEYS.USED_POEMS, list.filter(x => x.ts > cutoff));
  },

  /* —— 统计 —— */
  getStats() {
    const chronicles = this.getChronicles();
    const salaries = this.getSalaries();
    const skills = this.getSkills();
    const dreams = this.getDreams();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const monthSalary = salaries
      .filter(s => s.payDate >= monthStart)
      .reduce((sum, s) => sum + s.amount, 0);

    const totalHours = chronicles.reduce((sum, c) => sum + (c.workHours || 0), 0);

    const monthHours = chronicles
      .filter(c => c.entryDate >= monthStart)
      .reduce((sum, c) => sum + (c.workHours || 0), 0);

    const dreamProgress = dreams.length > 0
      ? dreams.reduce((sum, d) => sum + Math.min(1, (d.allocated || 0) / d.targetAmount), 0) / dreams.length
      : 0;

    return {
      chronicleCount: chronicles.length,
      salaryCount: salaries.length,
      skillCount: skills.length,
      dreamCount: dreams.length,
      monthSalary,
      totalHours,
      monthHours,
      dreamProgress,
      topRealm: skills.reduce((max, s) => Math.max(max, s.realm || 0), 0)
    };
  },

  /* —— 导出 —— */
  exportAll() {
    const data = {};
    Object.values(this.KEYS).forEach(k => { data[k] = this._read(k); });
    return data;
  },

  /* —— 清空 —— */
  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(this.PREFIX + k));
  }
};
