/**
 * MicroGBDT - 极简梯度提升决策树实现
 * 零外部依赖，用于黄金地下王国的行为树分支预测
 */

const STORAGE_KEY = 'world_tree_maze_gbdt_models';

// ==================== 工具函数 ====================

/** 计算数组指定索引子集的均值 */
function mean(arr, indices) {
    if (indices.length === 0) return 0;
    let sum = 0;
    for (const i of indices) sum += arr[i];
    return sum / indices.length;
}

/** 计算数组均值（全量） */
function meanAll(arr) {
    if (arr.length === 0) return 0;
    let sum = 0;
    for (const v of arr) sum += v;
    return sum / arr.length;
}

// ==================== 树节点操作 ====================

/**
 * 单棵决策树预测
 * @param {Object|Array} tree - 树节点（对象或数组格式）
 * @param {number[]} features - 特征向量
 * @returns {number} 预测值
 */
function predictTree(tree, features) {
    // 兼容数组格式（反序列化后可能是数组）
    if (Array.isArray(tree)) {
        if (tree[4]) return tree[5]; // isLeaf=true → 返回 value
        if (features[tree[0]] <= tree[1]) return predictTree(tree[2], features);
        return predictTree(tree[3], features);
    }
    // 对象格式
    if (tree.isLeaf) return tree.value;
    if (features[tree.featureIndex] <= tree.threshold) return predictTree(tree.left, features);
    return predictTree(tree.right, features);
}

// ==================== 最优分裂点 ====================

/**
 * 寻找最优分裂点（平方损失增益最大）
 * @param {number[][]} features - 特征矩阵
 * @param {number[]} gradients - 梯度/残差向量
 * @returns {{ featureIndex: number, threshold: number, gain: number }}
 */
function findBestSplit(features, gradients) {
    let bestGain = 0;
    let bestFeature = -1;
    let bestThreshold = 0;

    const nFeatures = features[0].length;
    const globalMean = meanAll(gradients);
    const globalSS = features.length * globalMean * globalMean;

    for (let f = 0; f < nFeatures; f++) {
        // 收集该特征的所有唯一值作为候选阈值
        const seen = new Set();
        const values = [];
        for (let i = 0; i < features.length; i++) {
            const v = features[i][f];
            if (!seen.has(v)) {
                seen.add(v);
                values.push(v);
            }
        }
        values.sort((a, b) => a - b);

        for (const threshold of values) {
            const leftIndices = [];
            const rightIndices = [];
            for (let i = 0; i < features.length; i++) {
                if (features[i][f] <= threshold) leftIndices.push(i);
                else rightIndices.push(i);
            }
            if (leftIndices.length < 2 || rightIndices.length < 2) continue;

            // 计算分裂增益
            const leftMean = mean(gradients, leftIndices);
            const rightMean = mean(gradients, rightIndices);
            const gain = (leftIndices.length * leftMean * leftMean + rightIndices.length * rightMean * rightMean) - globalSS;

            if (gain > bestGain) {
                bestGain = gain;
                bestFeature = f;
                bestThreshold = threshold;
            }
        }
    }

    return { featureIndex: bestFeature, threshold: bestThreshold, gain: bestGain };
}

// ==================== 训练单棵CART回归树 ====================

/**
 * 训练单棵CART回归树（平方损失）
 * @param {number[][]} features - 特征矩阵
 * @param {number[]} gradients - 梯度/残差向量
 * @param {number} depth - 当前深度
 * @param {number} maxDepth - 最大深度
 * @param {number} minSamplesSplit - 最小分裂样本数
 * @returns {Object} TreeNode
 */
function trainTree(features, gradients, depth, maxDepth, minSamplesSplit) {
    // 终止条件：达到最大深度或样本不足
    if (depth >= maxDepth || features.length < minSamplesSplit) {
        return { isLeaf: true, value: meanAll(gradients) };
    }

    // 寻找最优分裂点
    const split = findBestSplit(features, gradients);

    // 增益为零或负，无法有效分裂
    if (split.gain <= 0) {
        return { isLeaf: true, value: meanAll(gradients) };
    }

    // 按最优分裂点划分数据
    const leftFeatures = [], leftGradients = [];
    const rightFeatures = [], rightGradients = [];
    for (let i = 0; i < features.length; i++) {
        if (features[i][split.featureIndex] <= split.threshold) {
            leftFeatures.push(features[i]);
            leftGradients.push(gradients[i]);
        } else {
            rightFeatures.push(features[i]);
            rightGradients.push(gradients[i]);
        }
    }

    // 递归构建左右子树
    const left = trainTree(leftFeatures, leftGradients, depth + 1, maxDepth, minSamplesSplit);
    const right = trainTree(rightFeatures, rightGradients, depth + 1, maxDepth, minSamplesSplit);

    return {
        featureIndex: split.featureIndex,
        threshold: split.threshold,
        left,
        right,
        isLeaf: false,
        value: null
    };
}

// ==================== GBDT预测 ====================

/**
 * GBDT模型预测
 * @param {Object} model - GBDT模型
 * @param {number[]} features - 特征向量
 * @returns {number} 预测值（无树时返回0.5）
 */
function predict(model, features) {
    if (!model.trees || model.trees.length === 0) return 0.5;

    let sum = 0;
    for (const tree of model.trees) {
        sum += predictTree(tree, features);
    }
    return model.learningRate * sum;
}

// ==================== 增量训练 ====================

/**
 * 增量训练：在现有模型基础上追加一棵新树
 * @param {Object} model - GBDT模型
 * @param {number[][]} features - 特征矩阵
 * @param {number[]} labels - 标签向量
 */
function incrementalTrain(model, features, labels) {
    // 用当前模型预测所有样本
    const predictions = features.map(f => predict(model, f));

    // 计算残差
    const residuals = labels.map((label, i) => label - predictions[i]);

    // 用残差训练一棵新树
    const newTree = trainTree(features, residuals, 0, model.maxDepth, model.minSamplesSplit);

    // 追加新树
    model.trees.push(newTree);

    // 超过最大树数量时移除最旧的树
    if (model.trees.length > model.maxTrees) {
        model.trees.shift();
    }

    // 更新训练计数
    model.lastTrainedBattleCount = (model.lastTrainedBattleCount || 0) + 1;
}

// ==================== 训练参数策略 ====================

/**
 * 根据战斗场次返回训练参数
 * @param {number} totalBattleCount - 总战斗场次
 * @returns {{ windowSize: number, trainFreq: number, treesPerTrain: number, maxTrees: number }}
 */
function getTrainingParams(totalBattleCount) {
    if (totalBattleCount <= 20) {
        return { windowSize: 10, trainFreq: 5, treesPerTrain: 5, maxTrees: 20 };
    }
    if (totalBattleCount <= 100) {
        return { windowSize: 30, trainFreq: 10, treesPerTrain: 8, maxTrees: 50 };
    }
    return { windowSize: 50, trainFreq: 20, treesPerTrain: 10, maxTrees: 100 };
}

/**
 * 判断是否需要训练
 * @param {number} totalBattleCount - 总战斗场次
 * @param {number} lastTrainedBattleCount - 上次训练时的战斗场次
 * @returns {boolean}
 */
function shouldTrain(totalBattleCount, lastTrainedBattleCount) {
    const params = getTrainingParams(totalBattleCount);
    return totalBattleCount - lastTrainedBattleCount >= params.trainFreq;
}

// ==================== 序列化 / 反序列化 ====================

/**
 * 将树节点转为数组格式（紧凑存储）
 * @param {Object} node - 树节点
 * @returns {Array}
 */
function _nodeToArray(node) {
    if (node.isLeaf) {
        return [null, null, null, null, true, node.value];
    }
    return [node.featureIndex, node.threshold, _nodeToArray(node.left), _nodeToArray(node.right), false, null];
}

/**
 * 将数组格式恢复为树节点对象
 * @param {Array} arr - 数组格式节点
 * @returns {Object}
 */
function _arrayToNode(arr) {
    if (arr[4]) { // isLeaf
        return { isLeaf: true, value: arr[5] };
    }
    return {
        featureIndex: arr[0],
        threshold: arr[1],
        left: _arrayToNode(arr[2]),
        right: _arrayToNode(arr[3]),
        isLeaf: false,
        value: null
    };
}

/**
 * 序列化GBDT模型为紧凑JSON字符串
 * @param {Object} model - GBDT模型
 * @returns {string} JSON字符串
 */
function serialize(model) {
    const data = {
        branchId: model.branchId,
        trees: model.trees.map(_nodeToArray),
        maxTrees: model.maxTrees,
        learningRate: model.learningRate,
        maxDepth: model.maxDepth,
        minSamplesSplit: model.minSamplesSplit,
        lastTrainedBattleCount: model.lastTrainedBattleCount
    };
    return JSON.stringify(data);
}

/**
 * 从JSON字符串反序列化GBDT模型
 * @param {string} jsonStr - JSON字符串
 * @returns {Object} GBDT模型
 */
function deserialize(jsonStr) {
    const data = JSON.parse(jsonStr);
    return {
        branchId: data.branchId,
        trees: data.trees.map(_arrayToNode),
        maxTrees: data.maxTrees,
        learningRate: data.learningRate,
        maxDepth: data.maxDepth,
        minSamplesSplit: data.minSamplesSplit,
        lastTrainedBattleCount: data.lastTrainedBattleCount
    };
}

// ==================== 模型创建 ====================

/**
 * 创建单个GBDT模型
 * @param {string} characterId - 角色ID
 * @param {string} branchId - 行为树分支ID
 * @returns {Object} GBDT模型
 */
function createModel(characterId, branchId) {
    return {
        branchId,
        trees: [],
        maxTrees: 100,
        learningRate: 0.1,
        maxDepth: 4,
        minSamplesSplit: 3,
        lastTrainedBattleCount: 0
    };
}

/**
 * 创建模型组（一个角色的全部GBDT模型）
 * @param {string} characterId - 角色ID
 * @param {string[]} branchIds - 行为树分支ID列表
 * @returns {Object} 模型组
 */
function createModelGroup(characterId, branchIds) {
    const models = {};
    for (const branchId of branchIds) {
        models[branchId] = createModel(characterId, branchId);
    }
    return { characterId, models };
}

// ==================== localStorage 持久化 ====================

/**
 * 将模型组序列化后存入 localStorage
 * @param {Object} modelGroup - 模型组
 */
function saveModelGroup(modelGroup) {
    const data = {};
    for (const [branchId, model] of Object.entries(modelGroup.models)) {
        data[branchId] = serialize(model);
    }
    const key = `${STORAGE_KEY}_${modelGroup.characterId}`;
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 从 localStorage 读取并反序列化模型组
 * @param {string} characterId - 角色ID
 * @returns {Object|null} 模型组，不存在返回null
 */
function loadModelGroup(characterId) {
    const key = `${STORAGE_KEY}_${characterId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        const data = JSON.parse(raw);
        const models = {};
        for (const [branchId, jsonStr] of Object.entries(data)) {
            models[branchId] = deserialize(jsonStr);
        }
        return { characterId, models };
    } catch (e) {
        console.warn(`[MicroGBDT] 反序列化模型组失败: ${characterId}`, e);
        return null;
    }
}

/**
 * 从 localStorage 删除模型组
 * @param {string} characterId - 角色ID
 */
function clearModelGroup(characterId) {
    const key = `${STORAGE_KEY}_${characterId}`;
    localStorage.removeItem(key);
}

// ==================== 模块导出 ====================

const MicroGBDT = {
    predictTree,
    predict,
    trainTree,
    incrementalTrain,
    getTrainingParams,
    shouldTrain,
    serialize,
    deserialize,
    createModel,
    createModelGroup,
    saveModelGroup,
    loadModelGroup,
    clearModelGroup
};

export default MicroGBDT;
