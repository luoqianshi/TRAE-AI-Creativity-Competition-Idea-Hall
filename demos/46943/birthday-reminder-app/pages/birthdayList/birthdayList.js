const lunar = require('../../utils/lunar.js')

const RELATION_MAP = {
  family: '家人',
  friend: '好友',
  colleague: '同事',
  leader: '领导',
  other: '自定义标签'
}

Page({
  data: {
    allBirthdays: [],
    filteredList: [],
    groupedList: [],
    currentFilter: 'all'
  },

  onLoad() {
    this.loadBirthdays()
  },

  onShow() {
    this.loadBirthdays()
  },

  async loadBirthdays() {
    const db = wx.cloud.database()

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenId'
      })
      const openid = result.openid

      const { data } = await db.collection('birthdays')
        .where({ userOpenId: openid })
        .get()

      const processed = data.map(item => {
        const countdown = lunar.getDaysUntilBirthday(
          item.birthdayMonth,
          item.birthdayDay,
          item.birthdayType
        )

        const typeLabel = item.birthdayType === 'lunar' ? '农历' : '公历'
        const dateDisplay = `${typeLabel}${item.birthdayMonth}/${item.birthdayDay}`

        return {
          ...item,
          relationText: item.relationText || RELATION_MAP[item.relation] || '其他',
          daysUntil: countdown.daysUntil,
          targetDateStr: countdown.targetDateStr,
          dateDisplay,
          isToday: countdown.daysUntil === 0
        }
      }).sort((a, b) => a.daysUntil - b.daysUntil)

      this.setData({
        allBirthdays: processed
      })

      this.applyFilter()
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.applyFilter()
  },

  applyFilter() {
    const { allBirthdays, currentFilter } = this.data
    let filtered = allBirthdays

    if (currentFilter !== 'all') {
      filtered = allBirthdays.filter(item => item.relation === currentFilter)
    }

    // 全部模式：不分组，直接按日期排序
    if (currentFilter === 'all') {
      this.setData({
        filteredList: filtered,
        groupedList: []
      })
      return
    }

    // 筛选模式：按标签分组
    const groups = {}
    filtered.forEach(item => {
      const key = item.relation === 'other' ? (item.relationText || '自定义标签') : item.relation
      if (!groups[key]) {
        groups[key] = {
          groupName: item.relation === 'other' ? (item.relationText || '自定义标签') : (RELATION_MAP[item.relation] || item.relation),
          items: []
        }
      }
      groups[key].items.push(item)
    })

    const groupOrder = ['family', 'friend', 'colleague', 'leader']
    const orderedGroups = []

    groupOrder.forEach(key => {
      if (groups[key]) {
        orderedGroups.push(groups[key])
        delete groups[key]
      }
    })

    Object.keys(groups).forEach(key => {
      orderedGroups.push(groups[key])
    })

    this.setData({
      filteredList: [],
      groupedList: orderedGroups
    })
  },

  editItem(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/addBirthday/addBirthday?id=${id}&mode=edit`
    })
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条生日记录吗？',
      confirmColor: '#E8654A',
      success: async (res) => {
        if (res.confirm) {
          try {
            const db = wx.cloud.database()
            await db.collection('birthdays').doc(id).remove()
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadBirthdays()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/addBirthday/addBirthday' })
  }
})
