const aiService = require('../../services/aiService.js')
const storageService = require('../../services/storageService.js')

Page({
  data: {
    scenes: [
      { label: '成绩进步', value: '成绩进步' },
      { label: '成绩退步', value: '成绩退步' },
      { label: '作业完成情况', value: '作业完成情况' },
      { label: '课堂表现', value: '课堂表现' },
      { label: '知识点掌握', value: '知识点掌握情况' },
      { label: '家校配合请求', value: '家校配合请求' }
    ],
    styles: [
      { label: '温和鼓励型', value: '温和鼓励型' },
      { label: '专业直接型', value: '专业直接型' },
      { label: '建设性建议型', value: '建设性建议型' },
      { label: '关怀提醒型', value: '关怀提醒型' }
    ],
    channels: [
      { label: '微信', value: '微信' },
      { label: '短信', value: '短信' },
      { label: '邮件', value: '邮件' },
      { label: '电话要点', value: '电话沟通要点' }
    ],
    selectedScene: '',
    selectedStyle: '温和鼓励型',
    selectedChannel: '微信',
    studentInfo: {
      name: '',
      grade: '',
      className: '',
      subject: ''
    },
    performance: {
      score: '',
      lastScore: '',
      rank: '',
      totalStudents: '',
      homework: '',
      classBehavior: '',
      knowledge: ''
    }
  },

  selectScene: function(e) {
    this.setData({ selectedScene: e.currentTarget.dataset.value })
  },

  selectStyle: function(e) {
    this.setData({ selectedStyle: e.currentTarget.dataset.value })
  },

  selectChannel: function(e) {
    this.setData({ selectedChannel: e.currentTarget.dataset.value })
  },

  onNameInput: function(e) {
    this.setData({ 'studentInfo.name': e.detail.value })
  },

  onGradeInput: function(e) {
    this.setData({ 'studentInfo.grade': e.detail.value })
  },

  onClassInput: function(e) {
    this.setData({ 'studentInfo.className': e.detail.value })
  },

  onSubjectInput: function(e) {
    this.setData({ 'studentInfo.subject': e.detail.value })
  },

  onScoreInput: function(e) {
    this.setData({ 'performance.score': e.detail.value })
  },

  onLastScoreInput: function(e) {
    this.setData({ 'performance.lastScore': e.detail.value })
  },

  onRankInput: function(e) {
    this.setData({ 'performance.rank': e.detail.value })
  },

  onTotalStudentsInput: function(e) {
    this.setData({ 'performance.totalStudents': e.detail.value })
  },

  onHomeworkInput: function(e) {
    this.setData({ 'performance.homework': e.detail.value })
  },

  onClassBehaviorInput: function(e) {
    this.setData({ 'performance.classBehavior': e.detail.value })
  },

  onKnowledgeInput: function(e) {
    this.setData({ 'performance.knowledge': e.detail.value })
  },

  validateForm: function() {
    const { selectedScene, studentInfo, selectedStyle, selectedChannel } = this.data
    
    if (!selectedScene) {
      wx.showToast({ title: '请选择沟通场景', icon: 'none' })
      return false
    }
    
    if (!studentInfo.name) {
      wx.showToast({ title: '请输入学生姓名', icon: 'none' })
      return false
    }
    
    if (!studentInfo.subject) {
      wx.showToast({ title: '请输入科目', icon: 'none' })
      return false
    }
    
    return true
  },

  generateMessage: function() {
    if (!this.validateForm()) return

    wx.showLoading({ title: '生成中...' })

    const requestData = {
      scene: this.data.selectedScene,
      studentInfo: this.data.studentInfo,
      performance: this.data.performance,
      style: this.data.selectedStyle,
      channel: this.data.selectedChannel
    }

    aiService.generateMessage(requestData).then(result => {
      wx.hideLoading()
      
      if (result.success) {
        storageService.saveHistory({
          ...requestData,
          message: result.message,
          suggestions: result.suggestions || [],
          createdAt: Date.now()
        })

        wx.navigateTo({
          url: `/pages/result/result?message=${encodeURIComponent(result.message)}&suggestions=${encodeURIComponent(JSON.stringify(result.suggestions || []))}`
        })
      } else {
        wx.showToast({ title: result.message || '生成失败', icon: 'none' })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '生成失败，请重试', icon: 'none' })
      console.error(err)
    })
  },

  useTemplate: function() {
    if (!this.validateForm()) return
    
    const templates = storageService.getTemplates()
    const filtered = templates.filter(t => 
      t.scene === this.data.selectedScene && 
      t.style === this.data.selectedStyle &&
      t.channel === this.data.selectedChannel
    )
    
    if (filtered.length > 0) {
      const template = filtered[0]
      const message = this.fillTemplate(template.content)
      
      storageService.saveHistory({
        scene: this.data.selectedScene,
        studentInfo: this.data.studentInfo,
        performance: this.data.performance,
        style: this.data.selectedStyle,
        channel: this.data.selectedChannel,
        message: message,
        suggestions: [],
        createdAt: Date.now()
      })

      wx.navigateTo({
        url: `/pages/result/result?message=${encodeURIComponent(message)}&suggestions=[]`
      })
    } else {
      wx.showToast({ title: '暂无匹配模板', icon: 'none' })
    }
  },

  fillTemplate: function(template) {
    const { studentInfo, performance } = this.data
    const improvement = performance.score && performance.lastScore 
      ? parseInt(performance.score) - parseInt(performance.lastScore)
      : ''
    
    return template
      .replace(/{name}/g, studentInfo.name)
      .replace(/{grade}/g, studentInfo.grade)
      .replace(/{className}/g, studentInfo.className)
      .replace(/{subject}/g, studentInfo.subject)
      .replace(/{score}/g, performance.score || '')
      .replace(/{lastScore}/g, performance.lastScore || '')
      .replace(/{improvement}/g, improvement > 0 ? improvement : '')
      .replace(/{rank}/g, performance.rank || '')
      .replace(/{totalStudents}/g, performance.totalStudents || '')
      .replace(/{homework}/g, performance.homework || '')
      .replace(/{behavior}/g, performance.classBehavior || '')
      .replace(/{weakPoints}/g, performance.knowledge || '')
  }
})
