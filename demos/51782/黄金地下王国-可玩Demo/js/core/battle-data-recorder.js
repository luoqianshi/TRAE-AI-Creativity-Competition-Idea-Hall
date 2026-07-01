/**
 * battle-data-recorder.js
 * 增强版逐决策战斗数据记录器
 * 记录每场战斗中每个决策点的状态、选择和结果，
 * 提供滚动窗口管理和GBDT训练数据转换功能。
 *
 * 依赖：window.PersonalityEngine（延迟访问，模块顶层不 import）
 */

/** 特征提取顺序（固定10维） */
const FEATURE_KEYS = [
    'self_hp_percent', 'teammate_lowest_hp_percent', 'enemy_count',
    'self_tp', 'boss_present', 'turn_count', 'self_tp_percent',
    'alive_allies_count', 'alive_enemies_count', 'enemy_avg_hp_percent'
];

const BattleDataRecorder = {

    /**
     * 创建本场战斗记录
     * 存储在 char._currentBattleRecord（临时属性，不存档）
     * @param {Object} char - 角色对象
     */
    startBattleRecord(char) {
        char._currentBattleRecord = {
            battle_id: 'b_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: Date.now(),
            decisions: [],
            summary: null
        };
    },

    /**
     * 记录单次决策
     * @param {Object} char - 角色对象
     * @param {Object} decisionContext - 决策上下文
     * @param {number} decisionContext.turn - 回合数
     * @param {Object} decisionContext.state - 当前状态快照
     * @param {string} decisionContext.triggered_branch - 触发的分支ID
     * @param {string[]} decisionContext.available_skills - 分支内可用技能ID列表
     * @param {string} decisionContext.chosen_skill - 选择的技能ID
     * @param {number} decisionContext.chosen_order - 选择的顺位
     * @param {Object} decisionContext.result - 决策结果
     * @param {Object} decisionContext.personality_snapshot - 性格快照
     */
    recordDecision(char, decisionContext) {
        if (!char._currentBattleRecord) {
            console.warn('[BattleDataRecorder] 未找到当前战斗记录，请先调用 startBattleRecord');
            return;
        }

        // 深拷贝决策上下文，避免外部引用被修改
        const record = {
            turn: decisionContext.turn,
            state: { ...decisionContext.state },
            triggered_branch: decisionContext.triggered_branch,
            available_skills: [...decisionContext.available_skills],
            chosen_skill: decisionContext.chosen_skill,
            chosen_order: decisionContext.chosen_order,
            result: { ...decisionContext.result },
            personality_snapshot: { ...decisionContext.personality_snapshot }
        };

        char._currentBattleRecord.decisions.push(record);
    },

    /**
     * 结束战斗记录
     * 计算摘要，追加到滚动窗口，裁剪旧数据
     * @param {Object} char - 角色对象
     * @param {Object} result - 战斗结果
     * @param {string} result.result - 'win' 或 'lose'
     * @param {number} result.total_turns - 总回合数
     */
    endBattleRecord(char, result) {
        if (!char._currentBattleRecord) {
            console.warn('[BattleDataRecorder] 未找到当前战斗记录，无法结束');
            return;
        }

        // 通过延迟访问 PersonalityEngine 计算最终性格评分
        let final_personality_score = 0;
        if (window.PersonalityEngine && typeof window.PersonalityEngine.calculateBattleFinalScore === 'function') {
            final_personality_score = window.PersonalityEngine.calculateBattleFinalScore(char);
        }

        // 填充战斗摘要
        char._currentBattleRecord.summary = {
            result: result.result,
            total_turns: result.total_turns,
            final_personality_score
        };

        // 确保角色有战斗数据结构
        if (!char.battleData) {
            char.battleData = { battles: 0, battleDataWindow: [], personalityWeights: null };
        }
        if (!char.battleData.battleDataWindow) {
            char.battleData.battleDataWindow = [];
        }

        // 追加到滚动窗口
        char.battleData.battleDataWindow.push(char._currentBattleRecord);

        // 更新总场次计数
        char.battleData.battles = (char.battleData.battles || 0) + 1;

        // 删除临时战斗记录
        delete char._currentBattleRecord;

        // 裁剪滚动窗口
        this.trimWindow(char);
    },

    /**
     * 获取滚动窗口数据
     * @param {Object} char - 角色对象
     * @returns {Array} 战斗记录数组
     */
    getWindowData(char) {
        if (!char.battleData || !char.battleData.battleDataWindow) {
            return [];
        }
        return char.battleData.battleDataWindow;
    },

    /**
     * 根据总场次返回窗口大小
     * @param {number} totalBattleCount - 总场次
     * @returns {number} 窗口大小
     */
    getWindowSize(totalBattleCount) {
        if (totalBattleCount <= 20) return 10;
        if (totalBattleCount <= 100) return 30;
        return 50;
    },

    /**
     * 裁剪滚动窗口，保留最近 maxSize 场
     * @param {Object} char - 角色对象
     * @param {number} [maxSize] - 可选，不传则根据总场次自动计算
     */
    trimWindow(char, maxSize) {
        if (!char.battleData || !char.battleData.battleDataWindow) return;

        const size = maxSize != null ? maxSize : this.getWindowSize(char.battleData.battles || 0);
        const window = char.battleData.battleDataWindow;

        if (window.length > size) {
            char.battleData.battleDataWindow = window.slice(window.length - size);
        }
    },

    /**
     * 重置滚动窗口
     * @param {Object} char - 角色对象
     */
    resetWindow(char) {
        if (!char.battleData) {
            char.battleData = { battles: 0, battleDataWindow: [], personalityWeights: null };
        }
        char.battleData.battleDataWindow = [];
    },

    /**
     * 将滚动窗口数据转换为GBDT训练格式
     * @param {Object} char - 角色对象
     * @param {string} branchId - 目标分支ID
     * @returns {Object} { features: number[][], labels: number[] }
     */
    toTrainingData(char, branchId) {
        const window = this.getWindowData(char);
        const weights = char.battleData && char.battleData.personalityWeights
            ? char.battleData.personalityWeights
            : { attack: 1, defense: 1, cooperation: 1 };

        const features = [];
        const labels = [];

        for (const battle of window) {
            if (!battle.decisions) continue;

            for (const decision of battle.decisions) {
                // 仅筛选目标分支的决策
                if (decision.triggered_branch !== branchId) continue;

                // 提取10维特征（固定顺序）
                const featureVector = FEATURE_KEYS.map(key => {
                    return decision.state[key] != null ? decision.state[key] : 0;
                });
                features.push(featureVector);

                // 计算加权评分作为标签
                const snapshot = decision.personality_snapshot || {};
                const label =
                    (snapshot.attack_score || 0) * weights.attack +
                    (snapshot.defense_score || 0) * weights.defense +
                    (snapshot.cooperation_score || 0) * weights.cooperation;
                labels.push(label);
            }
        }

        return { features, labels };
    }
};

export default BattleDataRecorder;
