Page({
  data: {
    records: []
  },

  onLoad() {
    this.loadRecords()
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    try {
      const records = wx.getStorageSync('baziRecords') || []
      this.setData({ records })
    } catch (e) {
      console.error('读取记录失败', e)
    }
  },

  viewRecord(e) {
    const record = e.currentTarget.dataset.record
    const params = [
      `year=${record.year}`,
      `month=${record.month}`,
      `day=${record.day}`,
      `hour=${record.hour}`,
      `minute=0`,
      `gender=${record.gender}`,
      `origHour=${record.hour}`,
      `origMinute=0`,
      `region=${encodeURIComponent('')}`,
      `lat=0`,
      `lng=0`,
      `name=${encodeURIComponent(record.name || '')}`
    ].join('&')
    wx.navigateTo({ url: `/pages/bazi/result?${params}` })
  },

  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    const records = this.data.records.filter(r => r.id !== id)
    wx.setStorageSync('baziRecords', records)
    this.setData({ records })
    wx.showToast({ title: '删除成功', icon: 'success' })
  },

  viewFortune(e) {
    const record = e.currentTarget.dataset.record
    wx.setStorageSync('selectedBaZiRecord', record)
    wx.switchTab({ url: '/pages/calendar/index' })
  },

  formatDate(record) {
    const date = new Date(record.saveTime)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
})
