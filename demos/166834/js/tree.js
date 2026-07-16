/**
 * 树形结构工具模块
 * 提供树构建、展平、深度计算、子节点查找、父节点时间重算等功能
 */

/**
 * 根据扁平数据构建树形结构
 * @param {Array} flatRows - 扁平行数据数组
 * @returns {Array} 根节点数组，每个节点含 children 子节点
 */
function buildTree(flatRows) {
    var map = {};
    var roots = [];
    flatRows.forEach(function(r) { map[r.id] = Object.assign({}, r, { children: [] }); });
    flatRows.forEach(function(r) {
        var node = map[r.id];
        if (r.parentId !== null && map[r.parentId]) {
            map[r.parentId].children.push(node);
        } else {
            roots.push(node);
        }
    });
    var orderMap = {};
    flatRows.forEach(function(r, i) { orderMap[r.id] = i; });
    function sortNodes(nodes) {
        nodes.sort(function(a, b) { return orderMap[a.id] - orderMap[b.id]; });
        nodes.forEach(function(n) { sortNodes(n.children); });
    }
    sortNodes(roots);
    return roots;
}

/**
 * 将树形结构展平为数组
 * @param {Array} nodes - 树节点数组
 * @param {number|null} parentId - 父节点 ID
 * @param {Array} result - 累积结果数组
 * @returns {Array} 展平后的行数据数组
 */
function flattenTree(nodes, parentId, result) {
    nodes.forEach(function(node) {
        result.push({
            id: node.id,
            name: node.name,
            parentId: parentId,
            start: node.start,
            end: node.end,
            isManual: node.isManual || false
        });
        flattenTree(node.children, node.id, result);
    });
    return result;
}

/**
 * 计算指定节点的层级深度
 * @param {number} nodeId - 节点 ID
 * @param {Array} flatRows - 扁平行数据数组
 * @returns {number} 深度值，根节点为 0
 */
function getNodeDepth(nodeId, flatRows) {
    var depth = 0;
    var current = flatRows.find(function(r) { return r.id === nodeId; });
    while (current && current.parentId !== null) {
        depth++;
        current = flatRows.find(function(r) { return r.id === current.parentId; });
    }
    return depth;
}

/**
 * 获取指定节点的所有子孙节点 ID（递归）
 * @param {number} nodeId - 节点 ID
 * @param {Array} flatRows - 扁平行数据数组
 * @returns {Array<number>} 所有子孙节点 ID 数组
 */
function getChildrenIds(nodeId, flatRows) {
    var result = [];
    var direct = flatRows.filter(function(r) { return r.parentId === nodeId; });
    direct.forEach(function(r) {
        result.push(r.id);
        result.push.apply(result, getChildrenIds(r.id, flatRows));
    });
    return result;
}

/**
 * 重算父节点的时间范围（根据子节点自动推导）
 * 仅更新 isManual === false 的父节点
 * @param {number} nodeId - 父节点 ID
 * @param {Array} flatRows - 扁平行数据数组
 */
function recalcParentTime(nodeId, flatRows) {
    var node = flatRows.find(function(r) { return r.id === nodeId; });
    if (!node) return;
    if (node.isManual) return;
    var children = flatRows.filter(function(r) { return r.parentId === nodeId; });
    if (children.length === 0) return;
    var minStart = null, maxEnd = null;
    children.forEach(function(c) {
        if (c.start !== null && c.start !== '') {
            var s = GanttState.mode === 'date' ? parseDate(c.start) : extractNumber(c.start);
            if (s !== null && s !== undefined) {
                if (minStart === null || s < minStart) minStart = s;
            }
        }
        if (c.end !== null && c.end !== '') {
            var e = GanttState.mode === 'date' ? parseDate(c.end) : extractNumber(c.end);
            if (e !== null && e !== undefined) {
                if (maxEnd === null || e > maxEnd) maxEnd = e;
            }
        }
        recalcParentTime(c.id, flatRows);
    });
    if (minStart !== null && maxEnd !== null) {
        var newStart = GanttState.mode === 'date' ? formatDate(minStart) : String(minStart);
        var newEnd = GanttState.mode === 'date' ? formatDate(maxEnd) : String(maxEnd);
        if (node.start === '' || node.start === null || node.start === undefined) {
            node.start = newStart;
        } else {
            var curStart = GanttState.mode === 'date' ? parseDate(node.start) : extractNumber(node.start);
            if (curStart !== null && minStart < curStart) node.start = newStart;
        }
        if (node.end === '' || node.end === null || node.end === undefined) {
            node.end = newEnd;
        } else {
            var curEnd = GanttState.mode === 'date' ? parseDate(node.end) : extractNumber(node.end);
            if (curEnd !== null && maxEnd > curEnd) node.end = newEnd;
        }
    }
}

/**
 * 批量计算所有节点的深度映射
 * @param {Array} flatRows - 扁平行数据数组
 * @returns {Object<string, number>} 节点 ID → 深度值的映射
 */
function getDepthMap(flatRows) {
    var map = {};
    flatRows.forEach(function(r) {
        map[r.id] = getNodeDepth(r.id, flatRows);
    });
    return map;
}

/**
 * 根据层级关系计算序号映射（如 1, 1.1, 1.2.1）
 * 序号不存储在数据中，每次调用实时计算
 * @param {Array} flatRows - 扁平行数据数组
 * @returns {Object<string, string>} 节点 ID → 序号字符串的映射
 */
function calcSequence(flatRows) {
    var seqMap = {};
    var tree = buildTree(flatRows);

    /**
     * 递归遍历树节点，生成层级序号
     * @param {Array} nodes - 当前层级的节点数组
     * @param {string} prefix - 父级序号前缀（如 "1.2"）
     */
    function walk(nodes, prefix) {
        nodes.forEach(function(node, idx) {
            var seq = prefix ? (prefix + '.' + (idx + 1)) : String(idx + 1);
            seqMap[node.id] = seq;
            if (node.children && node.children.length > 0) {
                walk(node.children, seq);
            }
        });
    }

    walk(tree, '');
    return seqMap;
}
