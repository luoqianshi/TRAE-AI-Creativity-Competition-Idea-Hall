/**
 * rule-interceptor.js
 * 规则拦截器
 * 验证ML建议是否违反角色性格边界，确保AI决策不偏离角色设定。
 *
 * 完全无外部依赖，可独立使用。
 */

const RuleInterceptor = {

    /**
     * 根据三维权重动态计算允许范围
     * @param {Object} personalityWeights - 性格权重 { attack, defense, cooperation }
     * @returns {Object} 各参数的允许范围
     */
    calculateBounds(personalityWeights) {
        const w = personalityWeights || { attack: 1, defense: 1, cooperation: 1 };

        return {
            healThreshold: {
                min: 0.10 * w.attack + 0.30 * w.defense + 0.20 * w.cooperation,
                max: 0.40 * w.attack + 0.70 * w.defense + 0.60 * w.cooperation
            },
            attackPriority: {
                min: 20 * w.attack + 60 * w.defense + 20 * w.cooperation,
                max: 100 * w.attack + 60 * w.defense + 70 * w.cooperation
            },
            defendPriority: {
                min: 10 * w.defense + 30 * w.attack + 20 * w.cooperation,
                max: 80 * w.defense + 30 * w.attack + 50 * w.cooperation
            },
            healAllyThreshold: {
                min: 0.20 * w.cooperation + 0.10 * w.attack + 0.10 * w.defense,
                max: 0.60 * w.cooperation + 0.40 * w.attack + 0.40 * w.defense
            }
        };
    },

    /**
     * 验证条件阈值建议
     * @param {Object} personalityWeights - 性格权重
     * @param {string} paramPath - 参数路径
     * @param {number} suggestedValue - 建议值
     * @returns {Object} { passed, severity, adjustedValue, reason }
     */
    validateThreshold(personalityWeights, paramPath, suggestedValue) {
        const bounds = this.calculateBounds(personalityWeights);
        let range;

        // 根据 paramPath 选择对应的阈值范围
        if (paramPath.includes('heal') || paramPath.includes('hp')) {
            range = bounds.healThreshold;
        } else if (paramPath.includes('tp')) {
            // tpThreshold 使用默认范围 5-50
            range = { min: 5, max: 50 };
        } else {
            // 未匹配的参数路径，默认放行
            return {
                passed: true,
                severity: 'ok',
                adjustedValue: suggestedValue,
                reason: `参数路径 "${paramPath}" 未匹配到特定阈值范围，默认放行`
            };
        }

        const rangeWidth = range.max - range.min;
        const tolerance = rangeWidth * 0.10; // 允许超出范围的10%

        // 在范围内 → ok
        if (suggestedValue >= range.min && suggestedValue <= range.max) {
            return {
                passed: true,
                severity: 'ok',
                adjustedValue: suggestedValue,
                reason: `建议值 ${suggestedValue} 在允许范围 [${range.min.toFixed(3)}, ${range.max.toFixed(3)}] 内`
            };
        }

        // 超出范围但在 ±10% 以内 → downgrade（调整到边界值）
        if (suggestedValue < range.min && suggestedValue >= range.min - tolerance) {
            return {
                passed: true,
                severity: 'downgrade',
                adjustedValue: range.min,
                reason: `建议值 ${suggestedValue} 略低于下界 ${range.min.toFixed(3)}，已调整到下界`
            };
        }
        if (suggestedValue > range.max && suggestedValue <= range.max + tolerance) {
            return {
                passed: true,
                severity: 'downgrade',
                adjustedValue: range.max,
                reason: `建议值 ${suggestedValue} 略高于上界 ${range.max.toFixed(3)}，已调整到上界`
            };
        }

        // 超出范围 > 10% → blocked
        if (suggestedValue < range.min - tolerance) {
            return {
                passed: false,
                severity: 'blocked',
                adjustedValue: range.min,
                reason: `建议值 ${suggestedValue} 严重低于下界 ${range.min.toFixed(3)}，已拦截`
            };
        }
        // suggestedValue > range.max + tolerance
        return {
            passed: false,
            severity: 'blocked',
            adjustedValue: range.max,
            reason: `建议值 ${suggestedValue} 严重高于上界 ${range.max.toFixed(3)}，已拦截`
        };
    },

    /**
     * 验证技能顺位建议
     * 顺位调整不违反性格边界，始终放行
     * @param {Object} personalityWeights - 性格权重
     * @param {string} branchId - 分支ID
     * @param {string} skillId - 技能ID
     * @param {number} newOrder - 新顺位
     * @returns {Object} { passed, severity, adjustedValue, reason }
     */
    validateSkillOrder(personalityWeights, branchId, skillId, newOrder) {
        return {
            passed: true,
            severity: 'ok',
            adjustedValue: newOrder,
            reason: `技能顺位调整不违反性格边界，放行`
        };
    },

    /**
     * 验证分支增减
     * @param {Object} personalityWeights - 性格权重
     * @param {string} changeType - 变更类型 'add' 或 'remove'
     * @param {string} branchId - 分支ID
     * @returns {Object} { passed, severity, adjustedValue, reason }
     */
    validateBranchChange(personalityWeights, changeType, branchId) {
        const w = personalityWeights || { attack: 1, defense: 1, cooperation: 1 };

        // 移除治疗分支且合作权重较高时拦截
        if (changeType === 'remove' && branchId.includes('heal') && w.cooperation > 0.5) {
            return {
                passed: false,
                severity: 'blocked',
                adjustedValue: null,
                reason: `移除治疗分支与高合作性格 (cooperation=${w.cooperation}) 冲突，已拦截`
            };
        }

        return {
            passed: true,
            severity: 'ok',
            adjustedValue: null,
            reason: `分支变更 "${changeType}" 未违反性格边界，放行`
        };
    },

    /**
     * 批量验证一组建议
     * 遍历每条建议，根据 type 调用对应的验证方法
     * @param {Object} personalityWeights - 性格权重
     * @param {Array} suggestions - 建议数组
     * @returns {Array} 验证后的建议数组（每条增加 validated 字段）
     */
    validateSuggestions(personalityWeights, suggestions) {
        if (!Array.isArray(suggestions)) return [];

        return suggestions.map(suggestion => {
            const type = suggestion.type;
            let validated;

            switch (type) {
                case 'threshold':
                    validated = this.validateThreshold(
                        personalityWeights,
                        suggestion.paramPath,
                        suggestion.suggestedValue
                    );
                    break;

                case 'skill_order':
                    validated = this.validateSkillOrder(
                        personalityWeights,
                        suggestion.branchId,
                        suggestion.skillId,
                        suggestion.suggestedValue
                    );
                    break;

                case 'branch_change':
                    validated = this.validateBranchChange(
                        personalityWeights,
                        suggestion.changeType,
                        suggestion.branchId
                    );
                    break;

                default:
                    // 未知类型默认放行
                    validated = {
                        passed: true,
                        severity: 'ok',
                        adjustedValue: suggestion.suggestedValue != null ? suggestion.suggestedValue : null,
                        reason: `未知建议类型 "${type}"，默认放行`
                    };
                    break;
            }

            return {
                ...suggestion,
                validated
            };
        });
    }
};

export default RuleInterceptor;
