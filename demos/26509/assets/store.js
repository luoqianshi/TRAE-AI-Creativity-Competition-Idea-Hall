/* ============================================================
   坏情绪粉碎机 · 数据存储模块
   ============================================================ */

(function () {
  'use strict';

  const KEY = {
    count: 'mc_count',
    today: 'mc_today',
    todayDate: 'mc_today_date',
    welcomed: 'mc_welcomed',
    diaries: 'mc_diaries',           // 全部日记 [{id, date, ts, content, mood, emotions:{...}}]
    todayBurst: 'mc_today_burst',    // 今日发泄明细 {date, items:[{text, ts, mood}]}
    streak: 'mc_streak',             // 连续打卡
    lastVisit: 'mc_last_visit',
  };

  function load(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v === null) return fallback;
      return JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* quota */ }
  }
  function todayStr() { return new Date().toDateString(); }

  // ---------- 打卡 streak ----------
  function bumpStreak() {
    const last = localStorage.getItem(KEY.lastVisit);
    const cur = todayStr();
    if (last === cur) return parseInt(localStorage.getItem(KEY.streak) || '0', 10);
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yest = y.toDateString();
    const prev = parseInt(localStorage.getItem(KEY.streak) || '0', 10);
    const next = (last === yest) ? prev + 1 : 1;
    localStorage.setItem(KEY.lastVisit, cur);
    localStorage.setItem(KEY.streak, String(next));
    return next;
  }

  // ---------- 日记 ----------
  function getDiaries() {
    return load(KEY.diaries, []) || [];
  }
  function addDiary(content, mood, emotions) {
    const list = getDiaries();
    const id = 'd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const item = {
      id,
      ts: Date.now(),
      date: todayStr(),
      content: (content || '').slice(0, 1000),
      mood: mood || '😐',
      emotions: emotions || null,
    };
    list.unshift(item);
    // 限制最多 200 条
    if (list.length > 200) list.length = 200;
    save(KEY.diaries, list);
    return item;
  }
  function updateDiary(id, patch) {
    const list = getDiaries();
    const i = list.findIndex(d => d.id === id);
    if (i < 0) return null;
    list[i] = { ...list[i], ...patch };
    save(KEY.diaries, list);
    return list[i];
  }
  function deleteDiary(id) {
    const list = getDiaries().filter(d => d.id !== id);
    save(KEY.diaries, list);
  }
  function getDiary(id) {
    return getDiaries().find(d => d.id === id) || null;
  }

  // ---------- 今日发泄明细 ----------
  function getTodayBurst() {
    const data = load(KEY.todayBurst, null);
    if (!data || data.date !== todayStr()) {
      return { date: todayStr(), items: [] };
    }
    return data;
  }
  function addBurstItem(text, mood) {
    const data = getTodayBurst();
    data.items.push({ text, ts: Date.now(), mood: mood || null });
    save(KEY.todayBurst, data);
  }
  function getTodayDiaries() {
    return getDiaries().filter(d => d.date === todayStr());
  }

  // ---------- 计数 ----------
  function getCount() { return parseInt(localStorage.getItem(KEY.count) || '0', 10); }
  function getToday() { return parseInt(localStorage.getItem(KEY.today) || '0', 10); }
  function incCount(n) {
    const c = getCount() + n;
    const t = getToday() + n;
    localStorage.setItem(KEY.count, String(c));
    localStorage.setItem(KEY.today, String(t));
    return { total: c, today: t };
  }
  function resetAll() {
    Object.values(KEY).forEach(k => localStorage.removeItem(k));
  }

  // ---------- 导出 ----------
  window.MCStore = {
    KEY,
    todayStr,
    bumpStreak,
    getDiaries, addDiary, updateDiary, deleteDiary, getDiary,
    getTodayBurst, addBurstItem, getTodayDiaries,
    getCount, getToday, incCount, resetAll,
  };
})();
