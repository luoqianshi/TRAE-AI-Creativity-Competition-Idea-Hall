/**
 * experience-solidifier.js
 * 核心经验固化机制模块
 * 将反复验证的战斗会议建议固化为行为树参数，
 * 并重置对应分支的GBDT模型以适应新基线。
 *
 * 依赖：window.RuleInterceptor（延迟访问）
 *       window.MicroGBDT（延迟访问）
 */

// ========== 辅助方法 ==========

/**
 * 生成建议追踪键
 * @param {Object} suggestion - 单条建议
 * @returns {string} 追踪键
 */
function generateTrackingKey(suggestion) {
    const branchId = suggestion.branchId || suggestion.targetNodeId || 'global';
    const param = suggestion.paramPath || suggestion.type;
    const direction = suggestion.direction || suggestion.targetNodeId || 'unknown';
    return `${branchId}_${param}_${direction}`;
}

/**
 * 在行为树中找到分支并根据参数路径定位具体参数
 * @param {Object} char - 角色对象
 * @param {string} branchId - 分支ID
 * @param {string} paramPath - 参数路径（如 'condition.value'）
 * @returns {{ branch: Object, target: *, currentValue: * } | null}
 */
function findBranchAndParam(char, branchId, paramPath) {
    const tree = char.aiConfig && char.aiConfig.behaviorTree;
    if (!tree) return null;

    // 在行为树中查找匹配的分支节点
    const branch = tree.find(node => node.id === branchId);
    if (!branch) return null;

    // 根据 paramPath 路由到具体参数
    let target = null;
    const parts = paramPath.split('.');

    if (parts.length === 1) {
        // 顶层属性，如 'priority'
        target = branch[parts[0]];
    } else if (parts.length === 2) {
        // 二级属性，如 'condition.value'
        target = branch[parts[0]] ? branch[parts[0]][parts[1]] : undefined;
    } else if (parts[0] === 'skills' && parts.length >= 3) {
        // skills[N].order / skills[N].enabled
        const index = parseInt(parts[1], 10);
        if (!isNaN(index) && branch.skills && branch.skills[index]) {
            target = branch.skills[index][parts[2]];
        }
    }

    if (target === undefined || target === null) return null;

    return { branch, target, currentValue: target };
}

// ========== 模块主体 ==========

const ExperienceSolidifier = {

    // ---------- 固化常量 ----------
    MIN_CONSECUTIVE_COUNT: 3,       // 连续推荐次数阈值
    MIN_SCORE_IMPROVEMENT: 0.10,    // 最低评分提升比例（10%）

    // ========== 核心方法 ==========

    /**
     * 1. 检查是否有可固化的经验
     * @param {Object} char - 角色对象（含 char.battleData）
     * @param {Object[]} currentSuggestions - 当前战斗会议生成的建议数组
     * @param {Object} [previousSuggestions] - 上次追踪数据（char.battleData.suggestionTracking）
     * @returns {{ solidifications: Object[], updatedTracking: Object }}
     */
    checkSolidification(char, currentSuggestions, previousSuggestions) {
        // 初始化追踪数据
        if (!char.battleData) char.battleData = {};
        if (!char.battleData.suggestionTracking) {
            char.battleData.suggestionTracking = {};
        }

        const tracking = char.battleData.suggestionTracking;
        const solidifications = [];

        for (const suggestion of currentSuggestions) {
            const key = generateTrackingKey(suggestion);
            const prev = tracking[key];

            // 检查方向是否一致
            const direction = suggestion.direction || suggestion.targetNodeId || 'unknown';
            const isConsistent = prev && prev.direction === direction;

            if (isConsistent) {
                // 方向一致，累加计数
                prev.count = (prev.count || 1) + 1;
                prev.lastSuggestedValue = suggestion.suggestedValue;
                prev.lastScoreImprovement = suggestion.scoreImprovement || prev.lastScoreImprovement || 0;
            } else {
                // 方向不一致或首次出现，重置计数
                tracking[key] = {
                    count: 1,
                    direction: direction,
                    lastSuggestedValue: suggestion.suggestedValue,
                    lastScoreImprovement: suggestion.scoreImprovement || 0,
                    branchId: suggestion.branchId || suggestion.targetNodeId || 'global',
                    paramPath: suggestion.paramPath || suggestion.type,
                    firstSeen: Date.now()
                };
            }

            const current = tracking[key];

            // 固化三条件检查
            const countMet = current.count >= this.MIN_CONSECUTIVE_COUNT;
            const improvementMet = current.lastScoreImprovement >= this.MIN_SCORE_IMPROVEMENT;

            // 性格一致性检查（延迟访问 RuleInterceptor）
            let personalityMet = true;
            if (window.RuleInterceptor && window.RuleInterceptor.validateThreshold) {
                const personalityWeights = char.personalityWeights || { attack: 1, defense: 1, cooperation: 1 };
                const result = window.RuleInterceptor.validateThreshold(
                    personalityWeights,
                    current.paramPath,
                    current.lastSuggestedValue
                );
                personalityMet = result.passed;
            }

            if (countMet && improvementMet && personalityMet) {
                // 定位当前值
                const branchId = current.branchId;
                const paramPath = current.paramPath;
                const located = findBranchAndParam(char, branchId, paramPath);
                const currentValue = located ? located.currentValue : (suggestion.currentValue || 0);

                solidifications.push({
                    branch: branchId,
                    param: paramPath,
                    currentValue: currentValue,
                    solidifiedValue: current.lastSuggestedValue,
                    reason: `连续${current.count}次推荐，评分提升${Math.round(current.lastScoreImprovement * 100)}%`,
                    timestamp: Date.now()
                });
            }
        }

        return {
            solidifications,
            updatedTracking: { ...tracking }
        };
    },

    /**
     * 2. 执行固化：将经验值写入行为树
     * @param {Object} char - 角色对象
     * @param {Object} solidification - 固化数据
     */
    applySolidification(char, solidification) {
        const { branch: branchId, param: paramPath, solidifiedValue, timestamp, reason, currentValue } = solidification;
        const tree = char.aiConfig && char.aiConfig.behaviorTree;
        if (!tree) {
            console.warn('[ExperienceSolidifier] 角色缺少 aiConfig.behaviorTree，无法固化');
            return;
        }

        // 找到分支并修改参数值
        const located = findBranchAndParam(char, branchId, paramPath);
        if (!located) {
            console.warn(`[ExperienceSolidifier] 未找到分支 ${branchId} 或参数 ${paramPath}`);
            return;
        }

        // 根据路径类型直接赋值
        const parts = paramPath.split('.');
        const branch = located.branch;

        if (parts.length === 1) {
            branch[parts[0]] = solidifiedValue;
        } else if (parts.length === 2) {
            branch[parts[0]][parts[1]] = solidifiedValue;
        } else if (parts[0] === 'skills' && parts.length >= 3) {
            const index = parseInt(parts[1], 10);
            if (!isNaN(index) && branch.skills && branch.skills[index]) {
                branch.skills[index][parts[2]] = solidifiedValue;
            }
        }

        // 追加固化记录
        if (!char.battleData.solidifiedExperiences) {
            char.battleData.solidifiedExperiences = [];
        }
        char.battleData.solidifiedExperiences.push({
            branch: branchId,
            param: paramPath,
            value: solidifiedValue,
            solidifiedAt: timestamp,
            reason: reason,
            previousValue: currentValue
        });

        console.log(`[ExperienceSolidifier] 固化完成: ${branchId}.${paramPath} = ${solidifiedValue} (${reason})`);
    },

    /**
     * 3. 更新建议追踪数据
     * @param {Object} char - 角色对象
     * @param {Object[]} suggestions - 建议数组
     */
    updateSuggestionTracking(char, suggestions) {
        if (!char.battleData) char.battleData = {};
        if (!char.battleData.suggestionTracking) {
            char.battleData.suggestionTracking = {};
        }

        const tracking = char.battleData.suggestionTracking;

        for (const suggestion of suggestions) {
            const key = generateTrackingKey(suggestion);
            const direction = suggestion.direction || suggestion.targetNodeId || 'unknown';
            const prev = tracking[key];

            if (prev && prev.direction === direction) {
                prev.count = (prev.count || 1) + 1;
                prev.lastSuggestedValue = suggestion.suggestedValue;
                prev.lastScoreImprovement = suggestion.scoreImprovement || prev.lastScoreImprovement || 0;
            } else {
                tracking[key] = {
                    count: 1,
                    direction: direction,
                    lastSuggestedValue: suggestion.suggestedValue,
                    lastScoreImprovement: suggestion.scoreImprovement || 0,
                    branchId: suggestion.branchId || suggestion.targetNodeId || 'global',
                    paramPath: suggestion.paramPath || suggestion.type,
                    firstSeen: Date.now()
                };
            }
        }
    },

    /**
     * 4. 固化后重置对应分支的GBDT模型
     * @param {Object} modelGroup - 模型组（含 models 字典）
     * @param {string} branchId - 分支ID
     */
    resetBranchModel(modelGroup, branchId) {
        if (!window.MicroGBDT || !modelGroup || !modelGroup.models) {
            console.warn('[ExperienceSolidifier] MicroGBDT 不可用或 modelGroup 无效');
            return;
        }

        const model = modelGroup.models[branchId];
        if (!model) {
            console.warn(`[ExperienceSolidifier] 未找到分支 ${branchId} 的GBDT模型`);
            return;
        }

        // 重置树的集合和训练计数
        model.trees = [];
        model.lastTrainedBattleCount = 0;

        console.log(`[ExperienceSolidifier] 已重置分支 ${branchId} 的GBDT模型`);
    },

    /**
     * 5. 检查固化值是否符合核心性格
     * @param {Object} personalityWeights - 性格权重 { attack, defense, cooperation }
     * @param {string} branchId - 分支ID
     * @param {string} paramPath - 参数路径
     * @param {number} value - 待验证的值
     * @returns {boolean}
     */
    checkPersonalityAlignment(personalityWeights, branchId, paramPath, value) {
        if (!window.RuleInterceptor || !window.RuleInterceptor.validateThreshold) {
            console.warn('[ExperienceSolidifier] RuleInterceptor 不可用，默认放行');
            return true;
        }

        const result = window.RuleInterceptor.validateThreshold(personalityWeights, paramPath, value);
        return result.passed === true;
    }
};

export default ExperienceSolidifier;
