// components/custom-tab-bar/index.js — 自定义 tabBar（按角色切换）
Component({
  data: {
    selected: 0,
    role: 'parent',
    // 家长视角默认双 tab
    list: [
      { pagePath: '/pages/index/index', text: '探究岛', icon: '🏝️' },
      { pagePath: '/pages/parent/parent', text: '成长', icon: '🌱' },
    ],
  },

  lifetimes: {
    attached() {
      const app = getApp();
      const role = app.globalData.role || 'parent';
      this.setData({ role });
      // 教师角色切换 tab 配置（预留）
      if (role === 'teacher') {
        this.setData({
          list: [
            { pagePath: '/pages/index/index', text: '班级', icon: '👨‍🏫' },
            { pagePath: '/pages/parent/parent', text: '我的', icon: '👤' },
          ],
        });
      }
    },
  },

  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset;
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    },
  },
});
