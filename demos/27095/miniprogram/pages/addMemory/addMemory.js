const app = getApp()

Page({
  data: {
    isViewMode: false,
    memory: {},
    form: {
      title: '',
      date: '',
      location: '',
      description: '',
      tags: '',
      images: []
    }
  },

  onLoad(options) {
    if (options.mode === 'view' && options.id) {
      const memory = app.globalData.memories.find(m => m.id === parseInt(options.id))
      if (memory) {
        this.setData({
          isViewMode: true,
          memory
        })
        wx.setNavigationBarTitle({ title: memory.title })
      }
    } else {
      // 默认今天
      const today = new Date().toISOString().split('T')[0]
      this.setData({
        'form.date': today
      })
    }
  },

  onTitleInput(e) {
    this.setData({ 'form.title': e.detail.value })
  },

  onDateChange(e) {
    this.setData({ 'form.date': e.detail.value })
  },

  onLocationInput(e) {
    this.setData({ 'form.location': e.detail.value })
  },

  onDescInput(e) {
    this.setData({ 'form.description': e.detail.value })
  },

  onTagsInput(e) {
    this.setData({ 'form.tags': e.detail.value })
  },

  chooseMedia() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = res.tempFiles.map(file => file.tempFilePath)
        this.setData({
          'form.images': [...this.data.form.images, ...images]
        })
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.form.images.filter((_, i) => i !== index)
    this.setData({ 'form.images': images })
  },

  submitMemory() {
    const { title, date, location, description, tags, images } = this.data.form

    if (!title || !date) {
      wx.showToast({ title: '请填写标题和日期', icon: 'none' })
      return
    }

    const newMemory = {
      id: Date.now(),
      title,
      date,
      location,
      description,
      tags: tags.split(',').filter(t => t.trim()).map(t => t.trim()),
      images,
      type: images.length > 0 ? 'image' : 'text'
    }

    app.globalData.memories.push(newMemory)

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  }
})
