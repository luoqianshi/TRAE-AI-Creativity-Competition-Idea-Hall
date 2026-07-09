// components/beast-icon/beast-icon.js - 神兽图标组件
const { BEAST_CONFIG } = require('../../utils/constants')

Component({
  properties: {
    // 神兽ID
    beastId: {
      type: String,
      value: ''
    },
    // 大小：small / medium / large
    size: {
      type: String,
      value: 'medium'
    },
    // 是否显示光环
    showAura: {
      type: Boolean,
      value: false
    },
    // 是否置灰（未收集）
    locked: {
      type: Boolean,
      value: false
    }
  },

  data: {
    emoji: '',
    name: '',
    element: '',
    color: ''
  },

  observers: {
    'beastId': function(beastId) {
      if (beastId && BEAST_CONFIG[beastId]) {
        const config = BEAST_CONFIG[beastId]
        this.setData({
          emoji: config.emoji,
          name: config.name,
          element: config.element,
          color: config.color
        })
      }
    }
  },

  lifetimes: {
    attached() {
      if (this.data.beastId && BEAST_CONFIG[this.data.beastId]) {
        const config = BEAST_CONFIG[this.data.beastId]
        this.setData({
          emoji: config.emoji,
          name: config.name,
          element: config.element,
          color: config.color
        })
      }
    }
  }
})
