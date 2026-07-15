// pages/parent/parent.js — 家长简版看板
const { getWeekOverview } = require('../../services/growth');
const { pageView } = require('../../utils/track');

Page({
  data: {
    childName: '小满',
    weekData: {
      taskCount: 12,
      doneCount: 9,
      totalMinutes: 86,
      coins: 28,
    },
    shortcuts: [
      { title: '成长雷达', desc: '六维能力图谱', icon: '📡', path: '/subpackages/dashboard/pages/radar/radar', color: '#DCEAD8' },
      { title: '本周周报', desc: 'AI 成长总结', icon: '📋', path: '/subpackages/dashboard/pages/weekly/weekly', color: '#D4ECF1' },
      { title: '体验课程', desc: '7 天免费试学', icon: '🎁', path: '/subpackages/marketing/pages/trial/trial', color: '#FBEBC4' },
      { title: '邀请有礼', desc: '分享得成长币', icon: '🎉', path: '/subpackages/marketing/pages/share/share', color: '#E6DDF2' },
    ],
  },

  onLoad() {
    pageView('pages/parent');
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  goShortcut(e) {
    const { path } = e.currentTarget.dataset;
    wx.navigateTo({ url: path });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.childName}这周在芽芽星学了 ${this.data.weekData.doneCount} 个任务！`,
      path: '/pages/index/index',
    };
  },
});
