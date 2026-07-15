// utils/store.js — 轻量全局状态（发布订阅模式）
// MVP 阶段不引入 MobX，用观察者模式封装，足够覆盖多角色状态共享

const listeners = {};
const state = {
  role: null,
  childId: null,
  todayTasks: [],
  growthCoins: 0,
  weeklyReport: null,
};

const store = {
  get(key) {
    return state[key];
  },
  set(key, value) {
    state[key] = value;
    (listeners[key] || []).forEach((fn) => fn(value));
    // 同步到 globalData
    const app = getApp();
    if (app && app.globalData) app.globalData[key] = value;
  },
  subscribe(key, fn) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(fn);
    return () => {
      listeners[key] = listeners[key].filter((f) => f !== fn);
    };
  },
  // 批量设置
  patch(obj) {
    Object.keys(obj).forEach((k) => this.set(k, obj[k]));
  },
};

module.exports = store;
