/**
 * personality-engine.js
 * 三维性格评分引擎 —— 纯计算模块，零依赖
 * 维度：attack(进攻) / defense(防御) / cooperation(协作)
 */

// ========== 辅助函数 ==========

/** 数值夹紧 */
function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

/** 深拷贝 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ========== 模块主体 ==========

const PersonalityEngine = {

  // ---------- 性格权重模板 ----------
  personalityTemplates: {
    reckless:  { attack: 0.7,  defense: 0.2, cooperation: 0.1, name: '鲁莽', desc: '纯进攻型，冲在最前面' },
    cautious:  { attack: 0.2,  defense: 0.7, cooperation: 0.1, name: '小心', desc: '纯防御型，谨慎作战' },
    backstage: { attack: 0.1,  defense: 0.2, cooperation: 0.7, name: '幕后', desc: '纯辅助型，支援队友' },
    balanced:  { attack: 0.33, defense: 0.33, cooperation: 0.34, name: '均衡', desc: '攻守兼备，灵活应对' }
  },

  // ---------- AI预设 → 性格映射 ----------
  aiPresetToPersonality: {
    aggressive: 'reckless',
    defensive: 'cautious',
    balanced: 'balanced',
    support: 'backstage'
  },

  // ========== 核心方法 ==========

  /**
   * 1. 计算单次决策的三维性格评分
   * @param {Object} actionContext
   * @returns {{ attack_score: number, defense_score: number, cooperation_score: number }}
   */
  calculateDecisionScores(actionContext) {
    const {
      actionType, damageDealt, healingDone, buffCount, controlCount,
      isBossDamage, totalTeamDamage, totalTeamHealing,
      turnCount, totalTurns, survived, deathThisBattle, hasDamageAvoided
    } = actionContext;

    // --- 进攻评分 ---
    const damageOutputRatio = damageDealt / Math.max(1, totalTeamDamage);
    const killContribution = damageDealt > 0 ? 0.5 : 0;
    const bossDamageRatio = isBossDamage ? 0.5 : 0;
    const wastedAction = (actionType === 'defend' && damageDealt === 0 && healingDone === 0) ? 1 : 0;
    const attack_score = clamp(0, 1,
      damageOutputRatio * 1.5 + killContribution * 2 + bossDamageRatio * 2 - wastedAction * 0.5
    );

    // --- 防御评分 ---
    const survivalTimeRatio = survived ? (turnCount / Math.max(1, totalTurns)) : 0;
    const damageTakenRatio = 0; // 简化，需要外部数据
    const avoidanceCount = hasDamageAvoided ? 1 : 0;
    const deathPenalty = deathThisBattle ? 1 : 0;
    const defense_score = clamp(0, 1,
      survivalTimeRatio * 2 + damageTakenRatio * 1 + avoidanceCount * 1.5 - deathPenalty * 3
    );

    // --- 协作评分 ---
    const healingRatio = healingDone / Math.max(1, totalTeamHealing);
    const buffContribution = buffCount > 0 ? 0.5 : 0;
    const controlContribution = controlCount > 0 ? 0.5 : 0;
    const abandonPenalty = 0; // 简化
    const cooperation_score = clamp(0, 1,
      healingRatio * 2 + buffContribution * 1.5 + controlContribution * 2 - abandonPenalty * 3
    );

    return { attack_score, defense_score, cooperation_score };
  },

  /**
   * 2. 计算整场战斗的最终性格评分
   * @param {Object} battleRecord - { decisions: [], summary: {} }
   * @returns {{ attack_score: number, defense_score: number, cooperation_score: number }}
   */
  calculateBattleFinalScore(battleRecord) {
    const decisions = battleRecord.decisions || [];
    if (decisions.length === 0) {
      return { attack_score: 0, defense_score: 0, cooperation_score: 0 };
    }

    let sumAtk = 0, sumDef = 0, sumCoop = 0;
    for (const dec of decisions) {
      const scores = this.calculateDecisionScores(dec);
      sumAtk += scores.attack_score;
      sumDef += scores.defense_score;
      sumCoop += scores.cooperation_score;
    }

    const n = decisions.length;
    return {
      attack_score: sumAtk / n,
      defense_score: sumDef / n,
      cooperation_score: sumCoop / n
    };
  },

  /**
   * 3. 最终训练标签 = (三维加权评分) * 0.7 + 战斗结果(胜=1/负=0) * 0.3
   * @param {Object} battleRecord
   * @param {{ attack: number, defense: number, cooperation: number }} personalityWeights
   * @returns {number} 0~1
   */
  calculateFinalLabel(battleRecord, personalityWeights) {
    const scores = this.calculateBattleFinalScore(battleRecord);
    const weightedScore =
      scores.attack_score * personalityWeights.attack +
      scores.defense_score * personalityWeights.defense +
      scores.cooperation_score * personalityWeights.cooperation;

    const resultBonus = (battleRecord.summary && battleRecord.summary.result === 'win') ? 1 : 0;
    return clamp(0, 1, weightedScore * 0.7 + resultBonus * 0.3);
  },

  /**
   * 4. 根据AI预设名获取初始性格权重
   * @param {string} aiPresetName
   * @returns {{ attack: number, defense: number, cooperation: number, name: string, desc: string }}
   */
  getInitialWeights(aiPresetName) {
    const key = this.aiPresetToPersonality[aiPresetName] || 'balanced';
    return deepClone(this.personalityTemplates[key]);
  },

  /**
   * 5. 调整性格权重
   * @param {{ attack: number, defense: number, cooperation: number }} currentWeights
   * @param {'aggressive'|'balanced'|'conservative'} direction
   * @returns {{ attack: number, defense: number, cooperation: number }}
   */
  adjustWeights(currentWeights, direction) {
    const w = deepClone(currentWeights);

    if (direction === 'aggressive') {
      w.attack += 0.05;
      w.defense -= 0.025;
      w.cooperation -= 0.025;
    } else if (direction === 'conservative') {
      w.attack -= 0.025;
      w.defense += 0.05;
      w.cooperation -= 0.025;
    }
    // balanced 不调整

    // 单维范围 0.1-0.8
    w.attack = clamp(0.1, 0.8, w.attack);
    w.defense = clamp(0.1, 0.8, w.defense);
    w.cooperation = clamp(0.1, 0.8, w.cooperation);

    // 归一化使总和=1.0
    const sum = w.attack + w.defense + w.cooperation;
    w.attack /= sum;
    w.defense /= sum;
    w.cooperation /= sum;

    return w;
  },

  /**
   * 6. 验证权重合法性：单维0.1-0.8，总和=1.0（允许±0.01误差）
   * @param {{ attack: number, defense: number, cooperation: number }} weights
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateWeights(weights) {
    const errors = [];
    const dims = ['attack', 'defense', 'cooperation'];

    for (const dim of dims) {
      if (weights[dim] < 0.1 || weights[dim] > 0.8) {
        errors.push(`${dim} 超出范围 [0.1, 0.8]: ${weights[dim]}`);
      }
    }

    const sum = weights.attack + weights.defense + weights.cooperation;
    if (Math.abs(sum - 1.0) > 0.01) {
      errors.push(`权重总和不为1.0: ${sum}`);
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * 7. 性格驱动的冷启动参数
   * @param {'self_hp_below'|'self_tp_above'|'ally_hp_below'} conditionType
   * @param {{ attack: number, defense: number, cooperation: number }} weights
   * @returns {number}
   */
  calculateInitialThreshold(conditionType, weights) {
    switch (conditionType) {
      case 'self_hp_below':
        return 25 + (weights.defense - weights.attack) * 30;
      case 'self_tp_above':
        return 20 + (weights.attack - weights.defense) * 20;
      case 'ally_hp_below':
        return 40 + (weights.cooperation - weights.attack) * 30;
      default:
        return 0;
    }
  },

  /**
   * 8. 技能基础优先级
   * @param {'attack'|'defend'|'heal'|'buff'|'control'} skillType
   * @param {{ attack: number, defense: number, cooperation: number }} weights
   * @returns {number}
   */
  calculateSkillPriority(skillType, weights) {
    const { attack: a, defense: d, cooperation: c } = weights;
    switch (skillType) {
      case 'attack':  return 80 * a + 40 * d + 30 * c;
      case 'defend':  return 30 * a + 80 * d + 50 * c;
      case 'heal':    return 40 * a + 50 * d + 80 * c;
      case 'buff':    return 30 * a + 40 * d + 80 * c;
      case 'control': return 50 * a + 30 * d + 70 * c;
      default:        return 0;
    }
  },

  /**
   * 9. 返回性格倾向描述文本
   * @param {{ attack: number, defense: number, cooperation: number }} weights
   * @returns {string} 如 "鲁莽型(攻0.70/防0.20/协0.10)"
   */
  getPersonalityLabel(weights) {
    // 找到权重最高的维度
    const { attack, defense, cooperation } = weights;
    let maxDim = 'attack';
    if (defense > attack && defense >= cooperation) maxDim = 'defense';
    if (cooperation > attack && cooperation >= defense) maxDim = 'cooperation';

    // 匹配最接近的模板
    let bestMatch = 'balanced';
    let bestDist = Infinity;
    for (const [key, tmpl] of Object.entries(this.personalityTemplates)) {
      const dist = Math.abs(tmpl.attack - attack) +
                   Math.abs(tmpl.defense - defense) +
                   Math.abs(tmpl.cooperation - cooperation);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = key;
      }
    }

    const tmpl = this.personalityTemplates[bestMatch];
    return `${tmpl.name}型(攻${attack.toFixed(2)}/防${defense.toFixed(2)}/协${cooperation.toFixed(2)})`;
  },

  /**
   * 10. 判断建议的性格倾向
   * @param {string} suggestion - 建议文本
   * @param {{ attack: number, defense: number, cooperation: number }} weights
   * @returns {'aggressive'|'balanced'|'conservative'}
   */
  classifyTendency(suggestion, weights) {
    // 降低治疗阈值 或 提高进攻优先级 → aggressive
    if (/降低.*治疗|提高.*进攻|增加.*攻击|降低.*治疗阈值/i.test(suggestion)) {
      return 'aggressive';
    }
    // 提高治疗阈值 或 降低进攻优先级 → conservative
    if (/提高.*治疗|降低.*进攻|增加.*防御|提高.*治疗阈值/i.test(suggestion)) {
      return 'conservative';
    }
    return 'balanced';
  }
};

export default PersonalityEngine;
