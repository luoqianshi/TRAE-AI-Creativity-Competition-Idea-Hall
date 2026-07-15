// pages/index/index.js — 儿童探究岛（首页）
const { ensureLogin } = require('../../utils/auth');
const { getTodayTasks } = require('../../services/task');
const { pageView } = require('../../utils/track');

Page({
  data: {
    childName: '小满',
    emotion: null,          // 今日心情
    todayTasks: [],         // 今日任务
    growthCoins: 0,         // 成长币
    loading: true,
    emotions: [
      { key: 'happy', emoji: '😄', label: '开心' },
      { key: 'calm', emoji: '😊', label: '平静' },
      { key: 'curious', emoji: '🤔', label: '好奇' },
      { key: 'tired', emoji: '😴', label: '有点累' },
    ],
  },

  onLoad() {
    pageView('pages/index');
  },

  onShow() {
    // 每次展示刷新 tabBar 选中态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.loadHome();
  },

  async loadHome() {
    try {
      await ensureLogin();
      const app = getApp();
      const childId = app.globalData.childId || 'demo';
      // MVP 阶段先用 mock 数据，云函数就绪后替换
      this.setData({
        todayTasks: this.getMockTasks(),
        growthCoins: 28,
        loading: false,
      });
      // const tasks = await getTodayTasks(childId);
      // this.setData({ todayTasks: tasks, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  // 心情打卡
  pickEmotion(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ emotion: key });
    wx.vibrateShort({ type: 'light' });
  },

  // 进入任务
  goTask(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/subpackages/learning/pages/task/task?id=${id}` });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.childName}在芽芽星探究岛学得超开心！`,
      path: '/pages/index/index',
      imageUrl: '',
    };
  },

  onShareTimeline() {
    return {
      title: `${this.data.childName}的幼小衔接成长日记`,
    };
  },

  getMockTasks() {
    return [
      { id: 1, title: '发现问题：校园里有什么形状？', type: 'observe', done: false, icon: '🔍' },
      { id: 2, title: '完成任务：数一数 10 以内的朋友', type: 'math', done: false, icon: '🔢' },
      { id: 3, title: '表达作品：画一幅"我的上学路"', type: 'express', done: true, icon: '🎨' },
    ];
  },
});
