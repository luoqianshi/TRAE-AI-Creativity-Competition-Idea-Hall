const storageService = require('../../services/storageService.js')

Page({
  data: {
    scenes: [
      { label: '成绩进步', value: '成绩进步' },
      { label: '成绩退步', value: '成绩退步' },
      { label: '作业完成情况', value: '作业完成情况' },
      { label: '课堂表现', value: '课堂表现' },
      { label: '知识点掌握', value: '知识点掌握情况' },
      { label: '家校配合请求', value: '家校配合请求' },
      { label: '自定义', value: '自定义' }
    ],
    selectedScene: '',
    templates: []
  },

  onShow: function() {
    this.loadTemplates()
  },

  loadTemplates: function() {
    let templates = storageService.getTemplates()
    if (this.data.selectedScene) {
      templates = templates.filter(t => t.scene === this.data.selectedScene)
    }
    this.setData({ templates })
  },

  selectScene: function(e) {
    this.setData({ selectedScene: e.currentTarget.dataset.value })
    this.loadTemplates()
  },

  selectTemplate: function(e) {
    const id = e.currentTarget.dataset.id
    const template = this.data.templates.find(t => t.id === id)
    if (template) {
      wx.setClipboardData({
        data: template.content,
        success: () => {
          wx.showToast({ title: '已复制模板内容', icon: 'success' })
        }
      })
    }
  },

  editTemplate: function(e) {
    e.stopPropagation()
    const id = e.currentTarget.dataset.id
    const template = this.data.templates.find(t => t.id === id)
    if (template) {
      wx.showModal({
        title: '编辑模板',
        editable: true,
        placeholderText: '请编辑模板内容',
        content: template.content,
        success: (res) => {
          if (res.confirm && res.content.trim()) {
            storageService.updateTemplate(id, { content: res.content.trim() })
            wx.showToast({ title: '修改成功', icon: 'success' })
            this.loadTemplates()
          }
        }
      })
    }
  },

  deleteTemplate: function(e) {
    e.stopPropagation()
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个模板吗？',
      success: (res) => {
        if (res.confirm) {
          storageService.deleteTemplate(id)
          wx.showToast({ title: '删除成功', icon: 'success' })
          this.loadTemplates()
        }
      }
    })
  },

  addTemplate: function() {
    wx.showModal({
      title: '添加模板',
      editable: true,
      placeholderText: '请输入模板名称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          wx.showModal({
            title: '输入模板内容',
            editable: true,
            placeholderText: '请输入模板内容，支持变量替换：{name} {grade} {className} {subject} {score} {lastScore} {improvement} {rank} {totalStudents} {homework} {behavior} {weakPoints}',
            success: (res2) => {
              if (res2.confirm && res2.content.trim()) {
                storageService.saveTemplate({
                  id: Date.now().toString(),
                  name: res.content.trim(),
                  scene: '自定义',
                  style: '自定义',
                  channel: '自定义',
                  content: res2.content.trim(),
                  createdAt: Date.now()
                })
                wx.showToast({ title: '添加成功', icon: 'success' })
                this.loadTemplates()
              }
            }
          })
        }
      }
    })
  }
})
