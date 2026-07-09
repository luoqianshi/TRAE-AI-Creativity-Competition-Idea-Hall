// pages/arena/arena.js - 竞技场页面
const { getPetData, calculatePower } = require('../../utils/pet-store')
const { fightArena, getArenaStatus } = require('../../utils/arena-store')
const { BEAST_CONFIG, ARENA_CONFIG, ENEMY_CONFIG, SKILL_NAMES } = require('../../utils/constants')

Page({
  data: {
    // 我的神兽信息
    myBeastEmoji: '',
    myBeastName: '',
    myPower: 0,
    myLevel: 1,

    // 竞技场列表
    arenas: [],

    // 无宠物
    noPet: false,

    // === 战斗动画状态 ===
    isFighting: false,
    showResult: false,
    battleResult: null,
    battlePhase: '',

    // 当前神兽ID（用于元素特效）
    currentBeastId: '',

    // 动画 class 控制
    playerAnimClass: '',
    enemyAnimClass: '',
    vsAnimClass: '',
    screenShakeClass: '',

    // 血条
    myHP: 100,
    enemyHP: 100,

    // 伤害数字
    damageNumbers: [],

    // 技能名称
    showSkillName: false,
    skillName: '',
    skillNameClass: '',

    // 元素特效
    showElementEffect: false,
    elementEffectClass: '',

    // 光环与攻击特效
    showPlayerAura: false,
    showEnemyStrike: false,

    // 敌人信息
    enemyEmoji: '👹',
    enemyName: '小妖',
    enemyType: 'beginner',

    // 回合提示
    showRoundText: false,
    roundText: '',

    // 粒子
    particles: [],

    // 战斗详情
    battleDetail: null,

    // 结果动画
    resultAnimClass: ''
  },

  // 内部计时器与战斗数据
  _battleTimers: [],
  _battleData: null,
  _battleResult: null,
  _battleArena: null,
  _damageIdCounter: 0,

  onLoad() {
    this.refreshData()
  },

  onShow() {
    this.refreshData()
  },

  onHide() {
    this.cleanupBattle()
  },

  onUnload() {
    this.cleanupBattle()
  },

  refreshData() {
    const petData = getPetData()

    if (!petData || !petData.currentPet) {
      this.setData({ noPet: true })
      return
    }

    const beastConfig = BEAST_CONFIG[petData.currentPet]
    const myPower = calculatePower(petData.currentPet, petData.level)
    const arenas = getArenaStatus()

    // 为每个竞技场增加视觉状态
    const processedArenas = arenas.map(arena => ({
      ...arena,
      statusText: arena.locked ? '🔒 未解锁' : arena.remaining > 0 ? `今日剩余 ${arena.remaining} 次` : '今日已用完',
      canFight: !arena.locked && arena.remaining > 0,
      powerColor: myPower >= arena.powerRequirement ? '#38ef7d' : '#e94560'
    }))

    this.setData({
      myBeastEmoji: beastConfig.emoji,
      myBeastName: beastConfig.name,
      myPower,
      myLevel: petData.level,
      currentBeastId: petData.currentPet,
      arenas: processedArenas,
      noPet: false
    })
  },

  /**
   * 发起战斗
   */
  onFight(e) {
    const arenaId = e.currentTarget.dataset.id
    const arena = this.data.arenas.find(a => a.id === arenaId)

    if (!arena || !arena.canFight) {
      wx.showToast({ title: arena.locked ? '战力不足' : '次数已用完', icon: 'none' })
      return
    }

    // 1. 先计算战斗结果（预定剧本）
    const result = fightArena(arenaId)
    if (!result.success) {
      wx.showToast({ title: result.message, icon: 'none' })
      return
    }

    // 2. 获取战斗配置
    const petData = getPetData()
    const enemyConfig = ENEMY_CONFIG[arena.enemyId || arenaId]

    // 3. 生成战斗过程数据
    const battleData = this.generateBattleData(result)

    // 4. 启动战斗动画序列
    this.startBattle(battleData, result, arena, enemyConfig)
  },

  /**
   * 根据预定胜负构造视觉战斗过程数据
   */
  generateBattleData(result) {
    const victory = result.victory
    let rounds = []
    let myHP = 100, enemyHP = 100

    if (victory) {
      // 胜利路线：2回合击杀
      const r1MyDmg = 35 + Math.floor(Math.random() * 10)
      const r1EnemyDmg = 15 + Math.floor(Math.random() * 10)
      rounds.push({ myDmg: r1MyDmg, enemyDmg: r1EnemyDmg, isCritical: false })
      enemyHP -= r1MyDmg
      myHP -= r1EnemyDmg

      const r2MyDmg = enemyHP
      const r2EnemyDmg = 10 + Math.floor(Math.random() * 5)
      rounds.push({ myDmg: r2MyDmg, enemyDmg: r2EnemyDmg, isCritical: true })
      enemyHP = 0
      myHP -= r2EnemyDmg
    } else {
      // 失败路线：2回合后我方倒下
      const r1MyDmg = 15 + Math.floor(Math.random() * 10)
      const r1EnemyDmg = 25 + Math.floor(Math.random() * 10)
      rounds.push({ myDmg: r1MyDmg, enemyDmg: r1EnemyDmg, isCritical: false })
      enemyHP -= r1MyDmg
      myHP -= r1EnemyDmg

      const r2MyDmg = 10 + Math.floor(Math.random() * 5)
      const r2EnemyDmg = myHP
      rounds.push({ myDmg: r2MyDmg, enemyDmg: r2EnemyDmg, isCritical: false })
      myHP = 0
      enemyHP -= r2MyDmg
    }

    return {
      victory,
      rounds,
      totalDamage: rounds.reduce((sum, r) => sum + r.myDmg, 0),
      finalMyHP: Math.max(0, myHP),
      finalEnemyHP: Math.max(0, enemyHP)
    }
  },

  /**
   * 核心战斗时序编排
   */
  startBattle(battleData, result, arena, enemyConfig) {
    const petData = getPetData()
    const skillName = SKILL_NAMES[petData.currentPet] || '攻击'

    // 初始化战斗状态
    this.setData({
      isFighting: true,
      battlePhase: 'entrance',
      currentBeastId: petData.currentPet,
      myHP: 100,
      enemyHP: 100,
      enemyEmoji: enemyConfig.emoji,
      enemyName: enemyConfig.name,
      enemyType: arena.id,
      playerAnimClass: '',
      enemyAnimClass: '',
      vsAnimClass: '',
      screenShakeClass: '',
      damageNumbers: [],
      showSkillName: false,
      showElementEffect: false,
      showPlayerAura: false,
      showEnemyStrike: false,
      showRoundText: false,
      particles: [],
      battleDetail: null,
      resultAnimClass: '',
      showResult: false
    })

    // 存储战斗数据
    this._battleData = battleData
    this._battleResult = result
    this._battleArena = arena
    this._damageIdCounter = 0

    // ========== 阶段1: 入场 ==========
    this.scheduleAnim(0, () => {
      this.setData({ playerAnimClass: 'slide-in-left' })
    })
    this.scheduleAnim(100, () => {
      this.setData({ enemyAnimClass: 'slide-in-right' })
    })
    this.scheduleAnim(400, () => {
      this.setData({ vsAnimClass: 'vs-pop' })
    })
    this.scheduleAnim(700, () => {
      this.setData({
        playerAnimClass: 'idle-breathe',
        enemyAnimClass: 'idle-breathe',
        battlePhase: 'ready'
      })
    })

    // ========== 阶段2: 回合1 我方攻击 ==========
    const R1 = 800
    this.scheduleAnim(R1, () => {
      this.setData({
        battlePhase: 'round1-player',
        showRoundText: true,
        roundText: '回合 1',
        playerAnimClass: 'player-lunge',
        showPlayerAura: true
      })
    })
    this.scheduleAnim(R1 + 200, () => {
      this.setData({
        showSkillName: true,
        skillName,
        skillNameClass: 'skill-flash'
      })
    })
    this.scheduleAnim(R1 + 300, () => {
      this.setData({ showSkillName: false })
    })
    this.scheduleAnim(R1 + 200, () => {
      this.setData({ showElementEffect: true, elementEffectClass: 'active' })
    })
    this.scheduleAnim(R1 + 600, () => {
      this.setData({ showElementEffect: false, showPlayerAura: false })
    })
    this.scheduleAnim(R1 + 400, () => {
      const dmg = battleData.rounds[0].myDmg
      const newEnemyHP = Math.max(0, 100 - dmg)
      this.setData({
        enemyAnimClass: 'hit-shake',
        screenShakeClass: 'screen-shake-light',
        enemyHP: newEnemyHP
      })
      this.spawnDamageNumber(dmg, true, false)
    })
    this.scheduleAnim(R1 + 600, () => {
      this.setData({ screenShakeClass: '', showRoundText: false })
    })
    this.scheduleAnim(R1 + 700, () => {
      this.setData({
        playerAnimClass: 'player-retreat',
        enemyAnimClass: 'idle-breathe'
      })
    })
    this.scheduleAnim(R1 + 1000, () => {
      this.setData({ playerAnimClass: 'idle-breathe' })
    })

    // ========== 阶段3: 回合1 敌方反击 ==========
    const R1E = 2100
    this.scheduleAnim(R1E, () => {
      this.setData({
        battlePhase: 'round1-enemy',
        enemyAnimClass: 'enemy-lunge'
      })
    })
    this.scheduleAnim(R1E + 200, () => {
      this.setData({ showEnemyStrike: true })
    })
    this.scheduleAnim(R1E + 500, () => {
      this.setData({ showEnemyStrike: false })
    })
    this.scheduleAnim(R1E + 300, () => {
      const dmg = battleData.rounds[0].enemyDmg
      const newMyHP = Math.max(0, 100 - dmg)
      this.setData({
        playerAnimClass: 'hit-shake',
        screenShakeClass: 'screen-shake-light',
        myHP: newMyHP
      })
      this.spawnDamageNumber(dmg, false, false)
    })
    this.scheduleAnim(R1E + 500, () => {
      this.setData({ screenShakeClass: '' })
    })
    this.scheduleAnim(R1E + 600, () => {
      this.setData({
        enemyAnimClass: 'enemy-retreat',
        playerAnimClass: 'idle-breathe'
      })
    })
    this.scheduleAnim(R1E + 900, () => {
      this.setData({ enemyAnimClass: 'idle-breathe' })
    })

    // ========== 阶段4: 回合2 我方攻击（强化） ==========
    const R2 = 3200
    this.scheduleAnim(R2, () => {
      this.setData({
        battlePhase: 'round2-player',
        showRoundText: true,
        roundText: '回合 2',
        playerAnimClass: 'player-lunge',
        showPlayerAura: true
      })
    })
    this.scheduleAnim(R2 + 150, () => {
      this.setData({
        showSkillName: true,
        skillName,
        skillNameClass: 'skill-flash-intensified'
      })
    })
    this.scheduleAnim(R2 + 350, () => {
      this.setData({ showSkillName: false })
    })
    this.scheduleAnim(R2 + 150, () => {
      this.setData({ showElementEffect: true, elementEffectClass: 'active intensified' })
    })
    this.scheduleAnim(R2 + 550, () => {
      this.setData({ showElementEffect: false, showPlayerAura: false })
    })
    this.scheduleAnim(R2 + 350, () => {
      const dmg = battleData.rounds[1].myDmg
      const isCrit = battleData.rounds[1].isCritical
      const prevEnemyHP = this.data.enemyHP
      const newEnemyHP = isCrit ? 0 : Math.max(0, prevEnemyHP - dmg)
      this.setData({
        enemyAnimClass: 'hit-shake',
        screenShakeClass: 'screen-shake-heavy',
        enemyHP: newEnemyHP
      })
      this.spawnDamageNumber(dmg, true, isCrit)
    })
    this.scheduleAnim(R2 + 550, () => {
      this.setData({ screenShakeClass: '', showRoundText: false })
    })
    this.scheduleAnim(R2 + 600, () => {
      this.setData({
        playerAnimClass: 'player-retreat',
        enemyAnimClass: 'idle-breathe'
      })
    })
    this.scheduleAnim(R2 + 900, () => {
      this.setData({ playerAnimClass: 'idle-breathe' })
    })

    // ========== 阶段5: 决胜 ==========
    const FINALE = 4200
    if (battleData.victory) {
      this.scheduleAnim(FINALE, () => {
        this.setData({ enemyHP: 0, battlePhase: 'finale' })
      })
      this.scheduleAnim(FINALE + 100, () => {
        this.setData({ enemyAnimClass: 'defeat-fade' })
        this.createVictoryParticles()
      })
      this.scheduleAnim(FINALE + 400, () => {
        this.setData({ playerAnimClass: 'victory-stand' })
      })
    } else {
      this.scheduleAnim(FINALE, () => {
        this.setData({ myHP: 0, battlePhase: 'finale' })
      })
      this.scheduleAnim(FINALE + 100, () => {
        this.setData({ playerAnimClass: 'defeat-fall' })
      })
      this.scheduleAnim(FINALE + 300, () => {
        this.setData({ enemyAnimClass: 'enemy-taunt' })
      })
      this.scheduleAnim(FINALE + 400, () => {
        this.setData({ screenShakeClass: 'defeat-grayscale' })
      })
    }

    // ========== 阶段6: 结果展示 ==========
    const RESULT = 4700
    this.scheduleAnim(RESULT, () => {
      this.setData({
        isFighting: false,
        showResult: true,
        battleResult: {
          ...this._battleResult,
          arenaName: this._battleArena.name
        },
        battleDetail: {
          rounds: this._battleData.rounds.length,
          totalDamage: this._battleData.totalDamage
        },
        resultAnimClass: 'result-slide-up'
      })
    })

    // 安全清理
    this.scheduleAnim(10000, () => {
      this.cleanupBattle()
    })
  },

  /**
   * 统一动画调度，自动管理 setTimeout
   */
  scheduleAnim(delay, callback) {
    const id = setTimeout(() => {
      callback()
    }, delay)
    this._battleTimers.push(id)
  },

  /**
   * 生成伤害数字
   */
  spawnDamageNumber(value, isEnemy, isCritical) {
    const id = this._damageIdCounter++
    const damageNumbers = [...this.data.damageNumbers, {
      id,
      value: isCritical ? '💥' + value : '-' + value,
      isEnemy,
      isCritical
    }]
    this.setData({ damageNumbers })

    // 800ms后移除
    setTimeout(() => {
      const filtered = this.data.damageNumbers.filter(d => d.id !== id)
      this.setData({ damageNumbers: filtered })
    }, 800)
  },

  /**
   * 胜利粒子效果
   */
  createVictoryParticles() {
    const particles = []
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10
      particles.push({
        id: i,
        x: 50,
        y: 50,
        px: Math.floor(Math.cos(angle) * 200),
        py: Math.floor(Math.sin(angle) * 200),
        type: 'victory',
        delay: Math.random() * 0.3,
        duration: 0.6 + Math.random() * 0.4
      })
    }
    this.setData({ particles })
    setTimeout(() => this.setData({ particles: [] }), 1500)
  },

  /**
   * 清理所有战斗状态和计时器
   */
  cleanupBattle() {
    if (this._battleTimers) {
      this._battleTimers.forEach(id => clearTimeout(id))
      this._battleTimers = []
    }
  },

  /**
   * 关闭战斗结果
   */
  onCloseResult() {
    this.setData({
      showResult: false,
      screenShakeClass: '',
      particles: [],
      damageNumbers: [],
      battleDetail: null,
      resultAnimClass: ''
    })
    this.refreshData()
  }
})
