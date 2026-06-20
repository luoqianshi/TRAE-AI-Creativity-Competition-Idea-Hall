// 暖邻帮 - AI智能匹配引擎

class AIMatchingEngine {
  constructor() {
    this.weights = {
      distance: 0.35,      // 距离权重 35%
      skill: 0.25,         // 技能匹配权重 25%
      credit: 0.20,        // 信用评分权重 20%
      availability: 0.10,  // 可用性权重 10%
      experience: 0.10     // 经验权重 10%
    };
  }

  // 主匹配函数
  async findBestMatches(task, candidates, topN = 3) {
    const results = [];

    for (const candidate of candidates) {
      const score = await this.calculateMatchScore(task, candidate);
      const factors = this.getScoreBreakdown(task, candidate);
      const reasons = this.generateMatchReasons(task, candidate, factors);

      results.push({
        candidate,
        score,
        factors,
        reasons,
        estimatedTime: this.estimateArrivalTime(candidate.distance),
        confidence: this.getConfidenceLevel(score)
      });
    }

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topN);
  }

  // 计算匹配分数
  async calculateMatchScore(task, volunteer) {
    let score = 0;

    // 1. 距离评分 (0-100)
    const distanceScore = this.evaluateDistance(volunteer.distance);
    score += distanceScore * this.weights.distance;

    // 2. 技能匹配评分 (0-100)
    const skillScore = this.evaluateSkills(task.type, volunteer.skills);
    score += skillScore * this.weights.skill;

    // 3. 信用评分 (0-100)
    const creditScore = this.evaluateCredit(volunteer.creditScore);
    score += creditScore * this.weights.credit;

    // 4. 可用性评分 (0-100)
    const availabilityScore = this.evaluateAvailability(volunteer, task.urgency);
    score += availabilityScore * this.weights.availability;

    // 5. 经验评分 (0-100)
    const experienceScore = this.evaluateExperience(volunteer.completedTasks);
    score += experienceScore * this.weights.experience;

    return Math.round(score);
  }

  // 距离评估
  evaluateDistance(distance) {
    const distanceValue = parseInt(distance);
    if (distanceValue <= 200) return 100;
    if (distanceValue <= 500) return 85;
    if (distanceValue <= 1000) return 70;
    if (distanceValue <= 2000) return 50;
    return 30;
  }

  // 技能评估
  evaluateSkills(taskType, volunteerSkills) {
    // 技能映射表
    const skillMap = {
      medicine: ['代买药'],
      hospital: ['陪诊挂号'],
      delivery: ['代取快递'],
      heavy: ['搬运重物'],
      device: ['智能设备教学'],
      chat: ['聊天陪伴'],
      urgent: ['代买药', '陪诊挂号', '聊天陪伴']
    };

    const requiredSkills = skillMap[taskType] || [];

    if (requiredSkills.length === 0) return 70;

    const matchedSkills = requiredSkills.filter(skill =>
      volunteerSkills.some(vs => vs.includes(skill.replace('代', '').replace('陪', '')))
    );

    if (matchedSkills.length === requiredSkills.length) return 100;
    if (matchedSkills.length > 0) return 70;
    return 40;
  }

  // 信用评估
  evaluateCredit(creditScore) {
    if (creditScore >= 950) return 100;
    if (creditScore >= 900) return 85;
    if (creditScore >= 850) return 70;
    if (creditScore >= 800) return 55;
    return 40;
  }

  // 可用性评估
  evaluateAvailability(volunteer, urgency) {
    if (!volunteer.available) return 0;

    // 紧急任务优先考虑响应快的志愿者
    if (urgency === 'urgent') {
      const fastResponders = ['180米', '200米'];
      return fastResponders.includes(volunteer.distance) ? 100 : 60;
    }

    return 100;
  }

  // 经验评估
  evaluateExperience(completedTasks) {
    if (completedTasks >= 50) return 100;
    if (completedTasks >= 30) return 85;
    if (completedTasks >= 10) return 70;
    if (completedTasks >= 5) return 55;
    return 40;
  }

  // 获取分数明细
  getScoreBreakdown(task, volunteer) {
    return {
      distance: {
        value: this.evaluateDistance(volunteer.distance),
        weight: this.weights.distance,
        label: '距离评分'
      },
      skill: {
        value: this.evaluateSkills(task.type, volunteer.skills),
        weight: this.weights.skill,
        label: '技能匹配'
      },
      credit: {
        value: this.evaluateCredit(volunteer.creditScore),
        weight: this.weights.credit,
        label: '信用评分'
      },
      availability: {
        value: this.evaluateAvailability(volunteer, task.urgency),
        weight: this.weights.availability,
        label: '响应速度'
      },
      experience: {
        value: this.evaluateExperience(volunteer.completedTasks),
        weight: this.weights.experience,
        label: '服务经验'
      }
    };
  }

  // 生成匹配原因
  generateMatchReasons(task, volunteer, factors) {
    const reasons = [];

    // 技能匹配原因
    const skillMatch = taskTypes.find(t => t.id === task.type);
    if (skillMatch && volunteer.skills.some(s => s.includes(skillMatch.name.replace('代', '').replace('陪', '')))) {
      reasons.push(`擅长${skillMatch.name}服务`);
    }

    // 距离原因
    const distanceValue = parseInt(volunteer.distance);
    if (distanceValue <= 200) {
      reasons.push('距离很近，响应快');
    } else if (distanceValue <= 500) {
      reasons.push('步行可达范围');
    }

    // 信用原因
    if (volunteer.creditScore >= 950) {
      reasons.push('五星信用认证');
    } else if (volunteer.creditScore >= 900) {
      reasons.push('高信用评分');
    }

    // 经验原因
    if (volunteer.completedTasks >= 30) {
      reasons.push(`已完成${volunteer.completedTasks}次互助`);
    }

    // 好评原因
    if (volunteer.rating >= 4.8) {
      reasons.push('服务好评如潮');
    }

    return reasons;
  }

  // 估算到达时间
  estimateArrivalTime(distance) {
    const distanceValue = parseInt(distance);
    // 假设步行速度 1m/s
    const minutes = Math.ceil(distanceValue / 80); // 考虑老年人走得慢一些
    return `${minutes}分钟内可达`;
  }

  // 获取置信度等级
  getConfidenceLevel(score) {
    if (score >= 85) return { level: 'high', text: '非常推荐', color: '#00B894' };
    if (score >= 70) return { level: 'medium', text: '推荐', color: '#F39C12' };
    return { level: 'low', text: '一般', color: '#E74C3C' };
  }

  // 模拟AI派单过程
  async simulateMatchingProcess(task, onProgress) {
    const steps = [
      { progress: 0, text: '正在分析任务需求...' },
      { progress: 20, text: '正在筛选可用志愿者...' },
      { progress: 40, text: '正在计算距离评分...' },
      { progress: 60, text: '正在评估技能匹配度...' },
      { progress: 80, text: '正在生成推荐方案...' },
      { progress: 100, text: '匹配完成！' }
    ];

    for (const step of steps) {
      onProgress(step.progress, step.text);
      await this.delay(300 + Math.random() * 200);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出实例
const aiMatchingEngine = new AIMatchingEngine();

// 任务类型数据（供引擎使用）
const taskTypes = [
  { id: 'medicine', name: '代买药', icon: '💊' },
  { id: 'hospital', name: '陪诊挂号', icon: '🏥' },
  { id: 'delivery', name: '代取快递', icon: '📦' },
  { id: 'heavy', name: '搬运重物', icon: '🏋️' },
  { id: 'device', name: '智能设备教学', icon: '📱' },
  { id: 'chat', name: '聊天陪伴', icon: '💬' },
  { id: 'urgent', name: '紧急求助', icon: '🆘' }
];

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIMatchingEngine, aiMatchingEngine, taskTypes };
}
