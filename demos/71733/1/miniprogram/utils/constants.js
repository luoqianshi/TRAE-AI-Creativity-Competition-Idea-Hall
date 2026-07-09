// constants.js - 游戏常量配置

// 神兽配置
const BEAST_CONFIG = {
  qinglong: {
    id: 'qinglong',
    name: '青龙',
    element: '木',
    description: '东方守护神兽，掌控风雷之力',
    color: '#00d2ff',
    gradientFrom: '#00d2ff',
    gradientTo: '#3a7bd5',
    emoji: '🐉',
    basePower: 10,
    growthRate: 1.2
  },
  baihu: {
    id: 'baihu',
    name: '白虎',
    element: '金',
    description: '西方守护神兽，主掌杀伐之气',
    color: '#f5f7fa',
    gradientFrom: '#f5f7fa',
    gradientTo: '#c3cfe2',
    emoji: '🐅',
    basePower: 12,
    growthRate: 1.15
  },
  zhuque: {
    id: 'zhuque',
    name: '朱雀',
    element: '火',
    description: '南方守护神兽，涅槃重生之焰',
    color: '#f5af19',
    gradientFrom: '#f12711',
    gradientTo: '#f5af19',
    emoji: '🦅',
    basePower: 11,
    growthRate: 1.18
  },
  xuanwu: {
    id: 'xuanwu',
    name: '玄武',
    element: '水',
    description: '北方守护神兽，厚土深渊之力',
    color: '#38ef7d',
    gradientFrom: '#11998e',
    gradientTo: '#38ef7d',
    emoji: '🐢',
    basePower: 14,
    growthRate: 1.1
  }
}

// 等级配置
const LEVEL_CONFIG = {
  maxLevel: 100,
  // 升级所需经验公式: baseExp * level * growthFactor
  baseExp: 10,
  growthFactor: 1.5,
  getExpForLevel(level) {
    return Math.floor(this.baseExp * Math.pow(level, this.growthFactor))
  }
}

// 孵蛋配置
const EGG_CONFIG = {
  clickToHatch: 10, // 点击次数孵化
  clickInterval: 300 // 点击间隔（毫秒），防止连点
}

// 喂养配置
const FEED_CONFIG = {
  feedExpGain: 5,    // 每次喂养获得经验
  feedCooldown: 3000, // 喂养冷却（毫秒）
  maxLevelExp: 999    // 满级后经验不再增长
}

// 竞技场配置
const ARENA_CONFIG = {
  levels: {
    beginner: {
      id: 'beginner',
      name: '初级竞技场',
      description: '新手训练场',
      powerRequirement: 0,
      expReward: 10,
      dailyLimit: 5,
      enemyId: 'beginner'
    },
    intermediate: {
      id: 'intermediate',
      name: '中级竞技场',
      description: '挑战更强的对手',
      powerRequirement: 30,
      expReward: 25,
      dailyLimit: 5,
      enemyId: 'intermediate'
    },
    advanced: {
      id: 'advanced',
      name: '高级竞技场',
      description: '只有强者才能生存',
      powerRequirement: 60,
      expReward: 50,
      dailyLimit: 5,
      enemyId: 'advanced'
    }
  },
  resetHour: 0 // 每日重置时间（0点）
}

// 敌人配置（各竞技场对手）
const ENEMY_CONFIG = {
  beginner: {
    id: 'beginner',
    name: '小妖',
    emoji: '👹',
    power: 15,
    skillName: '妖气弹',
    color: '#9c27b0',
    description: '山野间的小妖，实力平平'
  },
  intermediate: {
    id: 'intermediate',
    name: '夜叉',
    emoji: '👺',
    power: 40,
    skillName: '暗影爪',
    color: '#e94560',
    description: '暗夜中的猎手，爪牙锋利'
  },
  advanced: {
    id: 'advanced',
    name: '修罗',
    emoji: '😈',
    power: 80,
    skillName: '修罗破天',
    color: '#b71c1c',
    description: '修罗道中走出的强者'
  }
}

// 神兽技能名映射
const SKILL_NAMES = {
  qinglong: '风雷斩',
  baihu: '庚金裂空',
  zhuque: '涅槃之焰',
  xuanwu: '深渊潮涌'
}

// 默认宠物数据
const DEFAULT_PET_DATA = {
  hasEgg: false,
  eggClickCount: 0,
  currentPet: null,
  level: 1,
  exp: 0,
  lastFeedTime: 0,
  totalFeedCount: 0,
  isEscaped: false,
  collection: [],
  newCollectionCount: 0,
  savedBeasts: {},
  dailyArenaCounts: {},
  lastArenaResetDate: '',
  updatedAt: null
}

// 本地存储键名
const STORAGE_KEYS = {
  TOKEN: 'pet_game_token',
  PET_DATA: 'pet_game_data',
  USER_INFO: 'pet_game_user_info'
}

module.exports = {
  BEAST_CONFIG,
  LEVEL_CONFIG,
  EGG_CONFIG,
  FEED_CONFIG,
  ARENA_CONFIG,
  ENEMY_CONFIG,
  SKILL_NAMES,
  DEFAULT_PET_DATA,
  STORAGE_KEYS
}
