const lunar = require('../../utils/lunar.js')

const DAY_PRESETS = [
  { label: '当天', value: 0 },
  { label: '提前1天', value: 1 },
  { label: '提前3天', value: 3 },
  { label: '提前7天', value: 7 },
  { label: '提前30天', value: 30 }
]

const CHANNEL_OPTIONS = [
  { label: '微信', wechat: true, email: false },
  { label: '邮件', wechat: false, email: true },
  { label: '微信+邮件', wechat: true, email: true }
]

Page({
  data: {
    form: {
      name: '',
      birthdayType: 'solar',
      birthdayMonth: null,
      birthdayDay: null,
      birthYear: null,
      relation: 'friend',
      customTag: '',
      email: '',
      remark: ''
    },
    remindStrategy: [
      { dayValue: 0, timeValue: '09:00', wechat: true, email: true }
    ],
    latestReminderChannel: null,
    pickedYear: 1990,
    pickedMonth: 1,
    pickedDay: 1,
    pickedMonthStr: '01',
    pickedDayStr: '01',
    showPicker: false,
    pickerTitle: '',
    pickerItems: [],
    pickerValue: [0],
    pickerSelected: null,
    pickerType: '',
    pickerTargetIndex: null,
    isEdit: false,
    editId: null
  },

  onLoad(options) {
    this.initDateValues()
    if (options.mode === 'edit' && options.id) {
      this.loadBirthdayForEdit(options.id)
    } else if (options.id) {
      this.loadBirthdayForEdit(options.id)
    }
  },

  initDateValues() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    this.setData({
      pickedYear: year,
      pickedMonth: month,
      pickedDay: day,
      pickedMonthStr: String(month).padStart(2, '0'),
      pickedDayStr: String(day).padStart(2, '0'),
      'form.birthYear': year,
      'form.birthdayMonth': month,
      'form.birthdayDay': day
    })
  },

  async loadBirthdayForEdit(id) {
    const db = wx.cloud.database()
    try {
      const { data } = await db.collection('birthdays').doc(id).get()
      const item = data
      this.setData({
        isEdit: true,
        editId: id,
        form: {
          name: item.name || '',
          birthdayType: item.birthdayType || 'solar',
          birthdayMonth: item.birthdayMonth || 1,
          birthdayDay: item.birthdayDay || 1,
          birthYear: item.birthYear || null,
          relation: item.relation || 'friend',
          customTag: item.relation === 'other' ? (item.relationText || '') : '',
          email: item.email || '',
          remark: item.remark || ''
        },
        remindStrategy: this.normalizeReminderStrategy(item),
        pickedYear: item.birthYear || 1990,
        pickedMonth: item.birthdayMonth || 1,
        pickedDay: item.birthdayDay || 1,
        pickedMonthStr: String(item.birthdayMonth || 1).padStart(2, '0'),
        pickedDayStr: String(item.birthdayDay || 1).padStart(2, '0')
      })
    } catch (err) {
      console.error('加载编辑数据失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  normalizeReminderStrategy(item) {
    if (Array.isArray(item.remindStrategy) && item.remindStrategy.length > 0) {
      return item.remindStrategy.map(strategy => {
        const channels = strategy.channels || []
        return {
          dayValue: Number(strategy.daysBefore || strategy.dayValue || 0),
          timeValue: strategy.time || strategy.timeValue || '09:00',
          wechat: channels.includes('wechat') || strategy.wechat === true,
          email: channels.includes('email') || strategy.email === true
        }
      })
    }

    const days = Array.isArray(item.remindDays) && item.remindDays.length > 0 ? item.remindDays : [0]
    const wechat = item.enableWechat !== false
    const email = item.enableEmail === true
    return days.map(day => ({
      dayValue: Number(day),
      timeValue: item.reminderTime || '09:00',
      wechat,
      email
    }))
  },

  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value })
  },

  selectType(type) {
    this.setData({ 'form.birthdayType': type })
  },

  showTypePicker() {
    const items = [
      { label: '公历（阳历）', value: 'solar' },
      { label: '农历（阴历）', value: 'lunar' }
    ]
    const selected = this.data.form.birthdayType
    const index = items.findIndex(i => i.value === selected)
    this.openPicker('选择日历类型', items, index >= 0 ? index : 0, selected, 'type')
  },

  showYearPicker() {
    const items = []
    const currentYear = new Date().getFullYear()
    let selectedIndex = 0
    for (let y = currentYear; y >= 1920; y--) {
      items.push({ label: y + '年', value: y })
      if (y === this.data.pickedYear) selectedIndex = items.length - 1
    }
    this.openPicker('选择年', items, selectedIndex, this.data.pickedYear, 'year')
  },

  showMonthPicker() {
    const items = []
    for (let m = 1; m <= 12; m++) {
      items.push({ label: m + '月', value: m })
    }
    this.openPicker('选择月', items, this.data.pickedMonth - 1, this.data.pickedMonth, 'month')
  },

  showDayPicker() {
    const items = []
    const maxDay = new Date(this.data.pickedYear, this.data.pickedMonth, 0).getDate()
    for (let d = 1; d <= maxDay; d++) {
      items.push({ label: d + '日', value: d })
    }
    let day = this.data.pickedDay
    if (day > maxDay) day = maxDay
    this.openPicker('选择日', items, day - 1, day, 'day')
  },

  openPicker(title, items, index, selected, type, targetIndex = null) {
    this.setData({
      showPicker: true,
      pickerTitle: title,
      pickerItems: items,
      pickerValue: [index],
      pickerSelected: selected,
      pickerType: type,
      pickerTargetIndex: targetIndex
    })
  },

  onPickerChange(e) {
    const index = e.detail.value[0]
    const item = this.data.pickerItems[index]
    if (!item) return

    const type = this.data.pickerType
    const targetIndex = this.data.pickerTargetIndex

    if (type === 'type') {
      this.setData({
        'form.birthdayType': item.value,
        pickerSelected: item.value
      })
    } else if (type === 'year') {
      this.setData({
        pickedYear: item.value,
        'form.birthYear': item.value,
        pickerSelected: item.value
      })
    } else if (type === 'month') {
      this.setData({
        pickedMonth: item.value,
        'form.birthdayMonth': item.value,
        pickedMonthStr: String(item.value).padStart(2, '0'),
        pickerSelected: item.value
      })
      const maxDay = new Date(this.data.pickedYear, item.value, 0).getDate()
      if (this.data.pickedDay > maxDay) {
        this.setData({
          pickedDay: maxDay,
          'form.birthdayDay': maxDay,
          pickedDayStr: String(maxDay).padStart(2, '0')
        })
      }
    } else if (type === 'day') {
      this.setData({
        pickedDay: item.value,
        'form.birthdayDay': item.value,
        pickedDayStr: String(item.value).padStart(2, '0'),
        pickerSelected: item.value
      })
    } else if (type === 'reminderDay') {
      this.updateReminder(targetIndex, { dayValue: item.value })
      this.setData({ pickerSelected: item.value })
    } else if (type === 'reminderTime') {
      this.updateReminder(targetIndex, { timeValue: item.value })
      this.setData({ pickerSelected: item.value })
    } else if (type === 'reminderChannel') {
      this.updateReminder(targetIndex, { wechat: item.wechat, email: item.email })
      this.setData({
        latestReminderChannel: { wechat: item.wechat, email: item.email },
        pickerSelected: item.value
      })
    }
  },

  closePicker() {
    this.setData({ showPicker: false })
  },

  closePickerDirect() {
    this.setData({ showPicker: false })
  },

  preventClose() {},

  selectRelation(e) {
    this.setData({ 'form.relation': e.currentTarget.dataset.value })
  },

  onCustomTagInput(e) {
    this.setData({ 'form.customTag': e.detail.value })
  },

  onEmailInput(e) {
    this.setData({ 'form.email': e.detail.value })
  },

  onRemarkInput(e) {
    this.setData({ 'form.remark': e.detail.value })
  },

  getDayLabel(dayValue) {
    const found = DAY_PRESETS.find(item => item.value === Number(dayValue))
    return found ? found.label : '提前' + dayValue + '天'
  },

  getChannelLabel(item) {
    if (item.wechat && item.email) return '微信+邮件'
    if (item.wechat) return '微信'
    if (item.email) return '邮件'
    return '微信'
  },

  formatReminderStrategy(list) {
    return list
      .map(item => ({
        ...item,
        dayLabel: this.getDayLabel(item.dayValue),
        channelLabel: this.getChannelLabel(item)
      }))
      .sort((a, b) => {
        if (b.dayValue !== a.dayValue) return b.dayValue - a.dayValue
        return (a.timeValue || '09:00').localeCompare(b.timeValue || '09:00')
      })
  },

  updateReminder(index, patch) {
    if (index === null || index === undefined) return
    const list = this.data.remindStrategy.slice()
    list[index] = { ...list[index], ...patch }
    this.setData({ remindStrategy: this.formatReminderStrategy(list) })
  },

  showReminderDayPicker(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.remindStrategy[index]
    const items = DAY_PRESETS
    const selectedIndex = Math.max(0, items.findIndex(opt => opt.value === item.dayValue))
    this.openPicker('选择提前天数', items, selectedIndex, item.dayValue, 'reminderDay', index)
  },

  showReminderTimePicker(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.remindStrategy[index]
    const items = []
    for (let h = 0; h < 24; h++) {
      const value = String(h).padStart(2, '0') + ':00'
      items.push({ label: value, value })
    }
    const selectedIndex = Math.max(0, items.findIndex(opt => opt.value === item.timeValue))
    this.openPicker('选择提醒时间', items, selectedIndex, item.timeValue, 'reminderTime', index)
  },

  showReminderChannelPicker(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.remindStrategy[index]
    const items = CHANNEL_OPTIONS.map((opt, optIndex) => ({
      ...opt,
      value: String(optIndex)
    }))
    const selectedIndex = Math.max(0, items.findIndex(opt => opt.wechat === item.wechat && opt.email === item.email))
    this.openPicker('选择通知方式', items, selectedIndex, String(selectedIndex), 'reminderChannel', index)
  },

  addReminderItem(e) {
    if (this.data.remindStrategy.length >= 15) {
      wx.showToast({ title: '最多添加15个提醒', icon: 'none' })
      return
    }

    const index = Number(e.currentTarget.dataset.index)
    const list = this.data.remindStrategy.slice()
    const curItem = list[index]
    const curDay = Number(curItem.dayValue || 0)
    const curTime = curItem.timeValue || '09:00'
    const latest = this.data.latestReminderChannel
    const curWechat = latest ? latest.wechat : curItem.wechat !== false
    const curEmail = latest ? latest.email : curItem.email !== false
    const reminderSteps = [0, 1, 7, 30]
    let newItem

    if (curDay === 0) {
      const hasAdvance1 = list.some(item => Number(item.dayValue) === 1)
      if (!hasAdvance1) {
        newItem = { dayValue: 1, timeValue: curTime, wechat: curWechat, email: curEmail }
      } else {
        const parts = curTime.split(':')
        let h = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) || 0
        h = (h + 1) % 24
        const newTime = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')
        newItem = { dayValue: 0, timeValue: newTime, wechat: curWechat, email: curEmail }
      }
    } else {
      let newDay = 30
      for (let i = 0; i < reminderSteps.length; i++) {
        if (curDay < reminderSteps[i]) {
          newDay = reminderSteps[i]
          break
        }
      }
      if (curDay >= 30) newDay = curDay + 30
      newItem = { dayValue: newDay, timeValue: curTime, wechat: curWechat, email: curEmail }
    }

    list.splice(index + 1, 0, newItem)
    this.setData({ remindStrategy: this.formatReminderStrategy(list) })
  },

  deleteReminderItem(e) {
    const index = Number(e.currentTarget.dataset.index)
    const list = this.data.remindStrategy.slice()
    if (list.length <= 1) {
      wx.showToast({ title: '至少保留1个提醒', icon: 'none' })
      return
    }
    list.splice(index, 1)
    this.setData({ remindStrategy: this.formatReminderStrategy(list) })
  },

  buildSubmitReminderStrategy() {
    return this.data.remindStrategy.map(item => {
      const channels = []
      if (item.wechat) channels.push('wechat')
      if (item.email) channels.push('email')
      return {
        daysBefore: Number(item.dayValue || 0),
        time: item.timeValue || '09:00',
        channels
      }
    }).filter(item => item.channels.length > 0)
  },

  async submitForm() {
    const { form, isEdit, editId } = this.data

    if (!form.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!form.birthdayMonth || !form.birthdayDay) {
      wx.showToast({ title: '请选择生日日期', icon: 'none' })
      return
    }

    const remindStrategy = this.buildSubmitReminderStrategy()
    if (remindStrategy.length === 0) {
      wx.showToast({ title: '请至少保留一个通知方式', icon: 'none' })
      return
    }

    const needEmail = remindStrategy.some(item => item.channels.includes('email'))
    if (needEmail && !form.email.trim()) {
      wx.showToast({ title: '请填写邮箱地址', icon: 'none' })
      return
    }

    let relationText = ''
    if (form.relation === 'other') {
      if (!form.customTag.trim()) {
        wx.showToast({ title: '请输入自定义标签', icon: 'none' })
        return
      }
      relationText = form.customTag.trim()
    }

    wx.showLoading({ title: '保存中...' })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenId'
      })
      const openid = result.openid

      const db = wx.cloud.database()
      const birthDate = `${form.birthYear || new Date().getFullYear()}-${String(form.birthdayMonth).padStart(2, '0')}-${String(form.birthdayDay).padStart(2, '0')}`
      const selectedDays = Array.from(new Set(remindStrategy.map(item => item.daysBefore)))
      const enableWechat = remindStrategy.some(item => item.channels.includes('wechat'))
      const enableEmail = remindStrategy.some(item => item.channels.includes('email'))

      const data = {
        userOpenId: openid,
        name: form.name.trim(),
        birthdayType: form.birthdayType,
        birthdayMonth: form.birthdayMonth,
        birthdayDay: form.birthdayDay,
        birthYear: form.birthYear,
        birthDate: birthDate,
        relation: form.relation,
        relationText: relationText,
        phone: '',
        email: form.email.trim(),
        enableWechat,
        enableSms: false,
        enableEmail,
        remindDays: selectedDays,
        remindStrategy,
        remark: form.remark
      }

      if (isEdit && editId) {
        await db.collection('birthdays').doc(editId).update({ data })
      } else {
        data.createdAt = db.serverDate()
        await db.collection('birthdays').add({ data })
      }

      wx.hideLoading()
      wx.showToast({ title: isEdit ? '更新成功' : '保存成功', icon: 'success' })

      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } catch (err) {
      wx.hideLoading()
      console.error('保存失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
