// components/pet-card/pet-card.js - 宠物卡片组件
const { BEAST_CONFIG, LEVEL_CONFIG } = require('../../utils/constants')
const { calculatePower } = require('../../utils/pet-store')

Component({
  properties: {
    // 神兽ID
    beastId: {
      type: String,
      value: ''
    },
    // 等级
    level: {
      type: Number,
      value: 1
    },
    // 经验
    exp: {
      type: Number,
      value: 0
    },
    // 是否当前出战
    isCurrent: {
      type: Boolean,
      value: false
    },
    // 喂养次数
    totalFeedCount: {
      type: Number,
      value: 0
    }
  },

  data: {
    emoji: '',
    name: '',
    element: '',
    description: '',
    color: '',
    power: 0,
    expForNextLevel: 0,
    expProgress: 0,
    isMaxLevel: false
  },

  observers: {
    'beastId, level, exp': function(beastId, level, exp) {
      if (beastId && BEAST_CONFIG[beastId]) {
        const config = BEAST_CONFIG[beastId]
        const expForNextLevel = LEVEL_CONFIG.getExpForLevel(level)
        const isMaxLevel = level >= LEVEL_CONFIG.maxLevel
        const expProgress = isMaxLevel ? 100 : Math.floor((exp / expForNextLevel) * 100)

        this.setData({
          emoji: config.emoji,
          name: config.name,
          element: config.element,
          description: config.description,
          color: config.color,
          power: calculatePower(beastId, level),
          expForNextLevel,
          expProgress,
          isMaxLevel
        })
      }
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { beastId: this.data.beastId })
    }
  }
})
