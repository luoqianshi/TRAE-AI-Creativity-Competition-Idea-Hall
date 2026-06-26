const WEEK_TEXT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const DAY_OPTIONS = [
  { label: '当天', value: 0 },
  { label: '提前1天', value: 1 },
  { label: '提前3天', value: 3 },
  { label: '提前7天', value: 7 },
  { label: '提前30天', value: 30 }
]
const CHANNEL_OPTIONS = [
  { label: '微信', value: 'wechat', wechat: true, email: false },
  { label: '邮件', value: 'email', wechat: false, email: true },
  { label: '微信+邮件', value: 'both', wechat: true, email: true }
]
const RELATION_OPTIONS = [
  { label: '家人', value: 'family' },
  { label: '好友', value: 'friend' },
  { label: '同事', value: 'colleague' },
  { label: '领导', value: 'leader' },
  { label: '自定义', value: 'other' }
]
const EVENT_TYPE_OPTIONS = [
  { label: '生日提醒', value: 'birthday' },
  { label: '事件提醒', value: 'custom' }
]
const REPEAT_OPTIONS = [
  { label: '每天', value: 1 },
  { label: '每周', value: 7 },
  { label: '每月', value: 30 },
  { label: '每年', value: 365 }
]

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getWeek(dateStr) {
  const d = new Date(dateStr.replace(/-/g, '/'))
  return WEEK_TEXT[d.getDay()]
}

function getDayLabel(dayValue) {
  const found = DAY_OPTIONS.find(item => item.value === Number(dayValue))
  return found ? found.label : `提前${dayValue}天`
}

function getChannelLabel(item) {
  if (item.wechat && item.email) return '微信+邮件'
  if (item.wechat) return '微信'
  if (item.email) return '邮件'
  return '微信'
}

function buildReminderItem(item) {
  const data = {
    dayValue: Number(item.dayValue || item.daysBefore || 0),
    timeValue: item.timeValue || item.time || '09:00',
    wechat: item.wechat !== undefined ? item.wechat : true,
    email: item.email !== undefined ? item.email : true
  }
  if (item.channels) {
    data.wechat = item.channels.includes('wechat')
    data.email = item.channels.includes('email')
  }
  data.dayLabel = getDayLabel(data.dayValue)
  data.channelLabel = getChannelLabel(data)
  return data
}

function formatReminders(list) {
  return list.map(buildReminderItem).sort((a, b) => {
    if (b.dayValue !== a.dayValue) return b.dayValue - a.dayValue
    return (a.timeValue || '09:00').localeCompare(b.timeValue || '09:00')
  })
}

function defaultForm() {
  const now = new Date()
  const today = formatDate(now)
  return {
    id: '',
    type: 'birthday',
    name: '',
    birthDate: '1990-01-01',
    birthWeek: getWeek('1990-01-01'),
    dateType: 'solar',
    relation: 'friend',
    relationText: '好友',
    customRelation: '',
    eventName: '',
    targetDate: today,
    targetWeek: getWeek(today),
    targetDateType: 'solar',
    category: '',
    showAge: false,
    repeatInterval: 365,
    repeatLabel: '每年',
    useRepeatReminder: true
  }
}

function seedRecords() {
  const y = new Date().getFullYear()
  return [
    {
      id: 'b1',
      type: 'birthday',
      name: '妈妈',
      birthDate: '1971-06-22',
      dateType: 'solar',
      relation: 'family',
      relationText: '家人',
      showAge: false,
      remindStrategy: [{ dayValue: 7, timeValue: '09:00', wechat: true, email: true }]
    },
    {
      id: 'b2',
      type: 'birthday',
      name: '爸爸',
      birthDate: '1969-08-15',
      dateType: 'solar',
      relation: 'family',
      relationText: '家人',
      showAge: false,
      remindStrategy: [{ dayValue: 7, timeValue: '09:00', wechat: true, email: true }]
    },
    {
      id: 'c1',
      type: 'custom',
      eventName: '项目会议',
      targetDate: `${y}-06-26`,
      targetDateType: 'solar',
      category: '会议',
      repeatInterval: 365,
      repeatLabel: '每年',
      useRepeatReminder: false,
      remindStrategy: [{ dayValue: 0, timeValue: '09:00', wechat: true, email: true }]
    },
    {
      id: 'c2',
      type: 'custom',
      eventName: '结婚纪念日',
      targetDate: `${y}-07-08`,
      targetDateType: 'solar',
      category: '纪念日',
      repeatInterval: 365,
      repeatLabel: '每年',
      useRepeatReminder: true,
      remindStrategy: [{ dayValue: 0, timeValue: '09:00', wechat: true, email: true }]
    }
  ]
}

Page({
  data: {
    navTitle: '事件提醒',
    currentPage: 'home',
    showTabBar: true,
    showSearch: false,
    searchKeyword: '',
    records: [],
    homeRecords: [],
    listRecords: [],
    filters: [
      { label: '全部', key: 'all' },
      { label: '生日', key: 'birthday' },
      { label: '事件', key: 'custom' },
      { label: '今天', key: 'today' }
    ],
    currentFilter: 'all',
    form: defaultForm(),
    remindStrategy: formatReminders([{ dayValue: 0, timeValue: '09:00', wechat: true, email: true }]),
    latestReminderChannel: null,
    multiReminderOn: true,
    pickerOpen: false,
    pickerTitle: '',
    pickerItems: [],
    pickerSelected: '',
    pickerType: '',
    pickerIndex: null,
    profileEmail: 'user@example.com',
    wechatPushOn: true,
    calendarOn: false,
    themePanelOpen: false,
    themeColors: [
      { name: '暖橙', color: '#E8654A' },
      { name: '森林', color: '#3A8F6B' },
      { name: '海蓝', color: '#3478F6' },
      { name: '紫色', color: '#8E5CF7' }
    ]
  },

  onLoad() {
    const stored = wx.getStorageSync('prototypeRecords')
    const records = stored && stored.length ? stored : seedRecords()
    this.setData({ records })
    this.refreshViews()
  },

  saveRecords(records) {
    wx.setStorageSync('prototypeRecords', records)
  },

  switchPage(e) {
    const page = e.currentTarget.dataset.page
    this.openPage(page)
  },

  openPage(page) {
    const titles = { home: '事件提醒', profile: '我的', add: '添加事件', list: '数据管理' }
    this.setData({
      currentPage: page,
      navTitle: titles[page],
      showTabBar: page === 'home' || page === 'profile'
    })
    this.refreshViews()
  },

  goToAdd() {
    this.setData({
      form: defaultForm(),
      remindStrategy: formatReminders([{ dayValue: 0, timeValue: '09:00', wechat: true, email: true }]),
      latestReminderChannel: null,
      multiReminderOn: true
    })
    this.openPage('add')
  },

  cancelForm() {
    this.openPage('home')
  },

  toggleSearch() {
    const show = !this.data.showSearch
    this.setData({ showSearch: show, searchKeyword: show ? this.data.searchKeyword : '' })
    this.refreshViews()
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.refreshViews()
  },

  daysUntil(dateStr) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(dateStr.replace(/-/g, '/'))
    let target = new Date(today.getFullYear(), d.getMonth(), d.getDate())
    target.setHours(0, 0, 0, 0)
    if (target < today) target = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate())
    return Math.round((target - today) / 86400000)
  },

  eventDaysUntil(dateStr) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr.replace(/-/g, '/'))
    target.setHours(0, 0, 0, 0)
    return Math.max(0, Math.round((target - today) / 86400000))
  },

  getNextReminder(days, strategy) {
    const list = formatReminders(strategy || [])
      .filter(item => item.dayValue <= days)
      .sort((a, b) => b.dayValue - a.dayValue)
    if (!list.length) return null
    return list[0]
  },

  buildDisplayRecord(record) {
    const isBirthday = record.type === 'birthday'
    const name = isBirthday ? record.name : record.eventName
    const date = isBirthday ? record.birthDate : record.targetDate
    const parts = date.split('-')
    const days = isBirthday ? this.daysUntil(date) : this.eventDaysUntil(date)
    const nextReminder = this.getNextReminder(days, record.remindStrategy)
    const reminderText = nextReminder ? `${nextReminder.dayLabel} ${nextReminder.timeValue}` : '未设置提醒'
    const relation = isBirthday ? record.relation : 'other'
    const detail = isBirthday
      ? `${record.dateType === 'lunar' ? '阴历' : ''}${Number(parts[1])}/${Number(parts[2])} ${getWeek(`${new Date().getFullYear()}-${parts[1]}-${parts[2]}`)}`
      : `${record.targetDateType === 'lunar' ? '阴历' : ''}${Number(parts[1])}/${Number(parts[2])} ${getWeek(date)}`
    return {
      ...record,
      id: record.id,
      name,
      icon: isBirthday ? '🎂' : '✦',
      relation,
      daysUntil: days,
      isToday: days === 0,
      detail,
      nextReminder,
      reminderText
    }
  },

  refreshViews() {
    const keyword = (this.data.searchKeyword || '').trim().toLowerCase()
    let homeRecords = this.data.records.map(r => this.buildDisplayRecord(r))
    if (keyword) {
      homeRecords = homeRecords.filter(item => item.name.toLowerCase().includes(keyword))
    }
    homeRecords.sort((a, b) => a.daysUntil - b.daysUntil)

    let listRecords = homeRecords
    if (this.data.currentFilter === 'birthday') listRecords = listRecords.filter(item => item.type === 'birthday')
    if (this.data.currentFilter === 'custom') listRecords = listRecords.filter(item => item.type === 'custom')
    if (this.data.currentFilter === 'today') listRecords = listRecords.filter(item => item.isToday)

    this.setData({ homeRecords, listRecords })
  },

  editRecord(e) {
    const id = e.currentTarget.dataset.id
    const record = this.data.records.find(item => item.id === id)
    if (!record) return
    const form = { ...defaultForm(), ...record }
    if (record.type === 'birthday') {
      form.birthWeek = getWeek(record.birthDate)
      const relationOption = RELATION_OPTIONS.find(item => item.value === record.relation)
      form.relationText = record.relationText || (relationOption ? relationOption.label : '好友')
    } else {
      form.targetWeek = getWeek(record.targetDate)
    }
    this.setData({
      form,
      remindStrategy: formatReminders(record.remindStrategy || [{ dayValue: 0, timeValue: '09:00', wechat: true, email: true }]),
      multiReminderOn: true,
      latestReminderChannel: null
    })
    this.openPage('add')
  },

  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定删除这条记录吗？',
      success: res => {
        if (!res.confirm) return
        const records = this.data.records.filter(item => item.id !== id)
        this.setData({ records })
        this.saveRecords(records)
        this.refreshViews()
      }
    })
  },

  setFilter(e) {
    this.setData({ currentFilter: e.currentTarget.dataset.key })
    this.refreshViews()
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onBirthDateChange(e) {
    const value = e.detail.value
    this.setData({ 'form.birthDate': value, 'form.birthWeek': getWeek(value) })
  },

  onTargetDateChange(e) {
    const value = e.detail.value
    this.setData({ 'form.targetDate': value, 'form.targetWeek': getWeek(value) })
  },

  selectDateType(e) {
    this.setData({ 'form.dateType': e.currentTarget.dataset.type })
  },

  selectTargetDateType(e) {
    this.setData({ 'form.targetDateType': e.currentTarget.dataset.type })
  },

  toggleShowAge() {
    this.setData({ 'form.showAge': !this.data.form.showAge })
  },

  toggleRepeat() {
    this.setData({ 'form.useRepeatReminder': !this.data.form.useRepeatReminder })
  },

  toggleMultiReminder() {
    this.setData({ multiReminderOn: !this.data.multiReminderOn })
  },

  openPicker(title, type, items, selected, index = null) {
    this.setData({ pickerOpen: true, pickerTitle: title, pickerType: type, pickerItems: items, pickerSelected: selected, pickerIndex: index })
  },

  closePicker() {
    this.setData({ pickerOpen: false })
  },

  stopTap() {},

  openEventTypePicker() {
    this.openPicker('选择类型', 'eventType', EVENT_TYPE_OPTIONS, this.data.form.type)
  },

  openRelationPicker() {
    this.openPicker('选择关系', 'relation', RELATION_OPTIONS, this.data.form.relation)
  },

  openRepeatPicker() {
    this.openPicker('选择重复周期', 'repeat', REPEAT_OPTIONS, this.data.form.repeatInterval)
  },

  openReminderDayPicker(e) {
    const index = Number(e.currentTarget.dataset.index)
    this.openPicker('选择提前天数', 'reminderDay', DAY_OPTIONS, this.data.remindStrategy[index].dayValue, index)
  },

  openReminderTimePicker(e) {
    const index = Number(e.currentTarget.dataset.index)
    const items = []
    for (let h = 0; h < 24; h++) {
      const value = `${pad(h)}:00`
      items.push({ label: value, value })
    }
    this.openPicker('选择提醒时间', 'reminderTime', items, this.data.remindStrategy[index].timeValue, index)
  },

  openReminderChannelPicker(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.remindStrategy[index]
    const selected = item.wechat && item.email ? 'both' : item.wechat ? 'wechat' : 'email'
    this.openPicker('选择通知方式', 'reminderChannel', CHANNEL_OPTIONS, selected, index)
  },

  selectPickerItem(e) {
    const value = e.currentTarget.dataset.value
    const type = this.data.pickerType
    const index = this.data.pickerIndex
    const item = this.data.pickerItems.find(opt => String(opt.value) === String(value))
    if (!item) return

    if (type === 'eventType') {
      this.setData({ 'form.type': value })
    } else if (type === 'relation') {
      this.setData({ 'form.relation': value, 'form.relationText': item.label })
    } else if (type === 'repeat') {
      this.setData({ 'form.repeatInterval': Number(value), 'form.repeatLabel': item.label })
    } else if (type === 'reminderDay') {
      this.patchReminder(index, { dayValue: Number(value) })
    } else if (type === 'reminderTime') {
      this.patchReminder(index, { timeValue: value })
    } else if (type === 'reminderChannel') {
      this.patchReminder(index, { wechat: item.wechat, email: item.email })
      this.setData({ latestReminderChannel: { wechat: item.wechat, email: item.email } })
    }
    this.setData({ pickerSelected: value })
  },

  patchReminder(index, patch) {
    const list = this.data.remindStrategy.slice()
    list[index] = { ...list[index], ...patch }
    this.setData({ remindStrategy: formatReminders(list) })
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
    const steps = [0, 1, 7, 30]
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
        newItem = { dayValue: 0, timeValue: `${pad(h)}:${pad(m)}`, wechat: curWechat, email: curEmail }
      }
    } else {
      let newDay = 30
      for (let i = 0; i < steps.length; i++) {
        if (curDay < steps[i]) {
          newDay = steps[i]
          break
        }
      }
      if (curDay >= 30) newDay = curDay + 30
      newItem = { dayValue: newDay, timeValue: curTime, wechat: curWechat, email: curEmail }
    }
    list.splice(index + 1, 0, newItem)
    this.setData({ remindStrategy: formatReminders(list) })
  },

  deleteReminderItem(e) {
    const index = Number(e.currentTarget.dataset.index)
    const list = this.data.remindStrategy.slice()
    if (list.length <= 1) return
    list.splice(index, 1)
    this.setData({ remindStrategy: formatReminders(list) })
  },

  submitForm() {
    const form = this.data.form
    if (form.type === 'birthday' && !form.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (form.type === 'custom' && !form.eventName.trim()) {
      wx.showToast({ title: '请输入事件名称', icon: 'none' })
      return
    }
    const record = {
      ...form,
      id: form.id || `${form.type}_${Date.now()}`,
      remindStrategy: this.data.remindStrategy.map(item => ({
        dayValue: item.dayValue,
        timeValue: item.timeValue,
        wechat: item.wechat,
        email: item.email,
        daysBefore: item.dayValue,
        time: item.timeValue,
        channels: [item.wechat ? 'wechat' : '', item.email ? 'email' : ''].filter(Boolean)
      }))
    }
    const records = this.data.records.slice()
    const index = records.findIndex(item => item.id === record.id)
    if (index >= 0) records[index] = record
    else records.push(record)
    this.setData({ records })
    this.saveRecords(records)
    wx.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => this.openPage('home'), 500)
  },

  onProfileEmailInput(e) {
    this.setData({ profileEmail: e.detail.value })
  },

  toggleWechatPush() {
    this.setData({ wechatPushOn: !this.data.wechatPushOn })
  },

  toggleCalendar() {
    this.setData({ calendarOn: !this.data.calendarOn })
  },

  showCalendarSuccess() {
    wx.showToast({ title: '已添加到日历', icon: 'success' })
  },

  openThemePanel() {
    this.setData({ themePanelOpen: true })
  },

  closeThemePanel() {
    this.setData({ themePanelOpen: false })
  },

  selectTheme(e) {
    const color = e.currentTarget.dataset.color
    wx.showToast({ title: `已选择主题`, icon: 'none' })
  },

  showInfoModal(e) {
    wx.showModal({
      title: e.currentTarget.dataset.title,
      content: e.currentTarget.dataset.content,
      showCancel: false
    })
  },

  confirmClearAll() {
    wx.showModal({
      title: '确认清除',
      content: '这将删除所有测试记录，确定吗？',
      success: res => {
        if (!res.confirm) return
        this.setData({ records: [] })
        this.saveRecords([])
        this.refreshViews()
      }
    })
  }
})
