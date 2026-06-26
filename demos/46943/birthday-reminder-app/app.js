App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true
      })
    }

    // 从本地存储加载全局数据
    this.loadGlobalData()
  },

  onShow: function () {
    // 每次显示时同步数据
    this.syncBirthdays()
  },

  // 全局数据
  globalData: {
    userInfo: null,
    birthdays: [],
    settings: {
      reminderEnabled: true,
      reminderDays: [0, 1, 3, 7],
      reminderTime: '09:00',
      defaultSort: 'date',
      showLunar: true
    }
  },

  // 从本地存储加载数据
  loadGlobalData: function () {
    try {
      const birthdays = wx.getStorageSync('birthdays')
      if (birthdays && birthdays.length > 0) {
        this.globalData.birthdays = birthdays
      }

      const settings = wx.getStorageSync('settings')
      if (settings) {
        this.globalData.settings = { ...this.globalData.settings, ...settings }
      }

      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = userInfo
      }
    } catch (e) {
      console.error('加载全局数据失败:', e)
    }
  },

  // 保存生日数据到本地
  saveBirthdays: function (birthdays) {
    this.globalData.birthdays = birthdays
    wx.setStorageSync('birthdays', birthdays)
  },

  // 保存设置到本地
  saveSettings: function (settings) {
    this.globalData.settings = { ...this.globalData.settings, ...settings }
    wx.setStorageSync('settings', this.globalData.settings)
  },

  // 同步生日数据（本地优先，云开发为可选）
  syncBirthdays: function () {
    try {
      const birthdays = wx.getStorageSync('birthdays')
      if (birthdays) {
        this.globalData.birthdays = birthdays
      }
    } catch (e) {
      console.error('同步生日数据失败:', e)
    }
  },

  // 获取生日数据
  getBirthdays: function () {
    return this.globalData.birthdays || []
  },

  // 添加/更新生日
  upsertBirthday: function (birthday) {
    const birthdays = this.getBirthdays()
    const index = birthdays.findIndex(b => b.id === birthday.id)

    if (index > -1) {
      birthdays[index] = { ...birthdays[index], ...birthday, updatedAt: Date.now() }
    } else {
      birthday.id = birthday.id || this.generateId()
      birthday.createdAt = Date.now()
      birthdays.push(birthday)
    }

    this.saveBirthdays(birthdays)
    return birthday
  },

  // 删除生日
  deleteBirthday: function (id) {
    const birthdays = this.getBirthdays().filter(b => b.id !== id)
    this.saveBirthdays(birthdays)
  },

  // 生成唯一ID
  generateId: function () {
    return 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
  },

  // 获取设置
  getSettings: function () {
    return this.globalData.settings
  },

  // 更新设置
  updateSettings: function (newSettings) {
    this.saveSettings(newSettings)
  },

  // 设置提醒
  setReminder: function (birthdayId, reminderConfig) {
    const birthdays = this.getBirthdays()
    const index = birthdays.findIndex(b => b.id === birthdayId)
    if (index > -1) {
      birthdays[index].reminder = reminderConfig
      this.saveBirthdays(birthdays)
    }
  },

  // 获取用户信息
  getUserInfo: function () {
    return this.globalData.userInfo
  },

  // 设置用户信息
  setUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  }
})
