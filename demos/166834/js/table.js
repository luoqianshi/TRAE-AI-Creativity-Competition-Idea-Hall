/**
 * 表格渲染 + 节点操作模块
 * 负责表格 DOM 渲染、输入事件绑定（增量更新）、节点的增删操作
 */

/** DOM 引用缓存 */
var tbody = document.getElementById('tableBody');

/**
 * 同步父节点输入框的值（增量更新，不重建 DOM）
 * 在子节点数据变更导致父节点时间重算后调用
 */
function syncParentInputs() {
    var rows = GanttState.rows;
    tbody.querySelectorAll('.cell-input').forEach(function(el) {
        var id = parseInt(el.dataset.id, 10);
        if (isNaN(id)) return;
        var field = el.dataset.field;
        if (!field || field === 'name') return;

        var row = rows.find(function(r) { return r.id === id; });
        if (!row) return;

        var isParent = rows.some(function(r) { return r.parentId === id; });
        var isAuto = !row.isManual && isParent;

        // 更新值
        if (document.activeElement !== el) {
            el.value = row[field] || '';
        }

        // 更新 parent-auto 样式
        if (isAuto) {
            el.classList.add('parent-auto');
        } else {
            el.classList.remove('parent-auto');
        }
    });
}

/**
 * 全量渲染表格
 * 仅在结构性变更时调用（增删行、模式切换、导入等）
 */
function renderTable() {
    var rows = GanttState.rows;
    tbody.innerHTML = '';

    if (rows.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 5;
        td.style.textAlign = 'center';
        td.style.color = '#94a3b8';
        td.style.padding = '20px';
        td.textContent = '暂无数据，请导入或添加';
        tr.appendChild(td);
        tbody.appendChild(tr);
        updateStats();
        return;
    }

    var tree = buildTree(rows);
    var flat = flattenTree(tree, null, []);
    GanttState.rows = flat;
    rows = flat;
    var depthMap = getDepthMap(rows);
    var seqMap = calcSequence(rows);

    var parentIds = rows.filter(function(r) { return r.parentId !== null; }).map(function(r) { return r.parentId; });
    var uniqueParents = [];
    parentIds.forEach(function(pid) {
        if (uniqueParents.indexOf(pid) === -1) uniqueParents.push(pid);
    });
    uniqueParents.forEach(function(pid) { recalcParentTime(pid, rows); });

    rows.forEach(function(row, index) {
        var tr = document.createElement('tr');
        tr.dataset.id = row.id;

        var depth = depthMap[row.id] || 0;
        var isParent = rows.some(function(r) { return r.parentId === row.id; });
        var isAuto = !row.isManual && isParent;

        // 序号列
        var seqTd = document.createElement('td');
        seqTd.className = 'col-seq';
        seqTd.textContent = seqMap[row.id] || '';
        tr.appendChild(seqTd);

        // 名称列
        var nameTd = document.createElement('td');
        nameTd.className = 'col-name';
        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'cell-input indent-' + Math.min(depth, 9);
        nameInput.value = row.name || '';
        nameInput.placeholder = '节点名称';
        nameInput.dataset.field = 'name';
        nameInput.dataset.id = row.id;
        nameTd.appendChild(nameInput);
        tr.appendChild(nameTd);

        // 开始列
        var startTd = document.createElement('td');
        startTd.className = 'col-start';
        var startInput = document.createElement('input');
        startInput.type = GanttState.mode === 'date' ? 'date' : 'text';
        startInput.className = 'cell-input' + (isAuto ? ' parent-auto' : '');
        startInput.value = row.start || '';
        if (GanttState.mode !== 'date') startInput.placeholder = '1';
        startInput.dataset.field = 'start';
        startInput.dataset.id = row.id;
        startTd.appendChild(startInput);
        tr.appendChild(startTd);

        // 结束列
        var endTd = document.createElement('td');
        endTd.className = 'col-end';
        var endInput = document.createElement('input');
        endInput.type = GanttState.mode === 'date' ? 'date' : 'text';
        endInput.className = 'cell-input' + (isAuto ? ' parent-auto' : '');
        endInput.value = row.end || '';
        if (GanttState.mode !== 'date') endInput.placeholder = '2';
        endInput.dataset.field = 'end';
        endInput.dataset.id = row.id;
        endTd.appendChild(endInput);
        tr.appendChild(endTd);

        // 操作列
        var actionTd = document.createElement('td');
        actionTd.className = 'col-actions';

        // 上移按钮
        var siblings = getSiblingNodes(row.id, rows);
        var sibIndex = siblings.findIndex(function(s) { return s.id === row.id; });
        if (sibIndex > 0) {
            var upBtn = document.createElement('button');
            upBtn.className = 'btn-action';
            upBtn.title = '上移';
            upBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12V4"/><path d="M4 8l4-4 4 4"/></svg>';
            upBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                moveNodeUp(row.id);
            });
            actionTd.appendChild(upBtn);
        }

        // 下移按钮
        if (sibIndex < siblings.length - 1) {
            var downBtn = document.createElement('button');
            downBtn.className = 'btn-action';
            downBtn.title = '下移';
            downBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4v8"/><path d="M4 8l4 4 4-4"/></svg>';
            downBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                moveNodeDown(row.id);
            });
            actionTd.appendChild(downBtn);
        }

        // 添加子节点按钮
        var addBtn = document.createElement('button');
        addBtn.className = 'btn-action';
        addBtn.title = '添加子节点';
        addBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v10"/><path d="M3 8h10"/></svg>';
        addBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            addChildNode(row.id);
        });
        actionTd.appendChild(addBtn);

        // 重置自动计算按钮（仅手动覆盖的父节点显示）
        if (isParent && row.isManual) {
            var resetBtn = document.createElement('button');
            resetBtn.className = 'btn-action reset';
            resetBtn.title = '重置为自动计算';
            resetBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8A5.5 5.5 0 0 1 12 4.5"/><path d="M13.5 8A5.5 5.5 0 0 1 4 11.5"/><path d="M12 2v3h-3"/><path d="M4 14v-3h3"/></svg>';
            resetBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                row.isManual = false;
                recalcParentTime(row.id, GanttState.rows);
                renderTable();
                updateStats();
                generateGantt();
            });
            actionTd.appendChild(resetBtn);
        }

        // 删除按钮
        var delBtn = document.createElement('button');
        delBtn.className = 'btn-action danger';
        delBtn.title = '删除';
        delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10"/><path d="M6 4V3h4v1"/><path d="M4.5 4l.5 9h6l.5-9"/><path d="M6.5 7v4"/><path d="M9.5 7v4"/></svg>';
        delBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var children = getChildrenIds(row.id, GanttState.rows);
            if (children.length > 0) {
                if (!confirm('删除 "' + (row.name || '未命名') + '" 及其 ' + children.length + ' 个子节点？')) return;
            } else {
                if (!confirm('确认删除 "' + (row.name || '未命名') + '" ？')) return;
            }
            deleteNode(row.id);
        });
        actionTd.appendChild(delBtn);

        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });

    // 绑定输入事件——增量更新，不调用 renderTable()，避免移动端输入法闪烁
    tbody.querySelectorAll('.cell-input').forEach(function(el) {
        var id = parseInt(el.dataset.id, 10);
        if (isNaN(id)) return;
        var field = el.dataset.field;
        if (!field) return;

        el.addEventListener('input', function() {
            var row = GanttState.rows.find(function(r) { return r.id === id; });
            if (!row) return;

            // 更新数据状态
            row[field] = this.value;

            // 名称变更：只需更新统计和甘特图
            if (field === 'name') {
                updateStats();
                generateGantt();
                return;
            }

            // 日期/数值变更：标记手动覆盖，重算父节点时间
            var isParent = GanttState.rows.some(function(r) { return r.parentId === id; });
            if (isParent) {
                row.isManual = true;
                this.classList.remove('parent-auto');
            }

            // 向上递归重算祖先节点时间
            var parentRow = GanttState.rows.find(function(r) { return r.id === row.parentId; });
            if (parentRow) {
                recalcParentTime(parentRow.id, GanttState.rows);
                var p = parentRow;
                while (p && p.parentId !== null) {
                    recalcParentTime(p.parentId, GanttState.rows);
                    p = GanttState.rows.find(function(r) { return r.id === p.parentId; });
                }
            }
            if (isParent) {
                recalcParentTime(id, GanttState.rows);
            }

            // 增量刷新父节点输入框的值（不重建 DOM）
            syncParentInputs();

            updateStats();
            generateGantt();
        });

        // 日期模式下，文本输入框失焦时归一化日期格式（兼容不支持 type=date 的浏览器）
        if (GanttState.mode === 'date' && el.type === 'text' && field !== 'name') {
            el.addEventListener('change', function() {
                var row = GanttState.rows.find(function(r) { return r.id === id; });
                if (!row) return;
                var normalized = normalizeDateStr(this.value);
                if (normalized !== this.value) {
                    this.value = normalized;
                    row[field] = normalized;
                    // 重算父节点时间
                    var isParent = GanttState.rows.some(function(r) { return r.parentId === id; });
                    if (isParent) recalcParentTime(id, GanttState.rows);
                    var parentRow = GanttState.rows.find(function(r) { return r.id === row.parentId; });
                    if (parentRow) {
                        recalcParentTime(parentRow.id, GanttState.rows);
                    }
                    syncParentInputs();
                    updateStats();
                    generateGantt();
                }
            });
        }
    });

    updateStats();
}

/**
 * 添加子节点
 * @param {number} parentId - 父节点 ID
 */
function addChildNode(parentId) {
    var parent = GanttState.rows.find(function(r) { return r.id === parentId; });
    if (!parent) return;
    var newRow = {
        id: GanttState.nextId++,
        name: '新子节点',
        parentId: parentId,
        start: '',
        end: '',
        isManual: false
    };
    var insertIndex = GanttState.rows.findIndex(function(r) { return r.id === parentId; }) + 1;
    GanttState.rows.splice(insertIndex, 0, newRow);
    renderTable();
    updateStats();
    generateGantt();
    setTimeout(function() {
        var inputs = tbody.querySelectorAll('.cell-input[data-field="name"]');
        var target = Array.from(inputs).find(function(el) { return parseInt(el.dataset.id, 10) === newRow.id; });
        if (target) target.focus();
    }, 50);
}

/**
 * 删除节点及其所有子孙节点
 * @param {number} nodeId - 待删除节点 ID
 */
function deleteNode(nodeId) {
    var toDelete = [nodeId].concat(getChildrenIds(nodeId, GanttState.rows));
    GanttState.rows = GanttState.rows.filter(function(r) { return toDelete.indexOf(r.id) === -1; });
    renderTable();
    updateStats();
    generateGantt();
}

/**
 * 获取同级兄弟节点列表（parentId 相同的节点，按 rows 中的顺序排列）
 * @param {number} nodeId - 节点 ID
 * @param {Array} flatRows - 扁平行数据数组
 * @returns {Array} 同级兄弟节点数组
 */
function getSiblingNodes(nodeId, flatRows) {
    var row = flatRows.find(function(r) { return r.id === nodeId; });
    if (!row) return [];
    return flatRows.filter(function(r) { return r.parentId === row.parentId; });
}

/**
 * 获取节点及其所有子孙在 flatRows 中的连续索引区间 [start, end]
 * @param {number} nodeId - 节点 ID
 * @param {Array} flatRows - 扁平行数据数组
 * @returns {{start: number, end: number}|null} 区间对象，找不到返回 null
 */
function getSubtreeRange(nodeId, flatRows) {
    var start = -1;
    var depth = 0;
    var end = -1;
    for (var i = 0; i < flatRows.length; i++) {
        if (flatRows[i].id === nodeId) {
            start = i;
            depth = getNodeDepth(nodeId, flatRows);
            end = i;
            continue;
        }
        if (start !== -1) {
            var d = getNodeDepth(flatRows[i].id, flatRows);
            if (d > depth) {
                end = i;
            } else {
                break;
            }
        }
    }
    return start !== -1 ? { start: start, end: end } : null;
}

/**
 * 上移节点（与上方同级兄弟交换位置）
 * 仅调整同级节点顺序，子树整体移动
 * @param {number} nodeId - 待上移节点 ID
 */
function moveNodeUp(nodeId) {
    var rows = GanttState.rows;
    var siblings = getSiblingNodes(nodeId, rows);
    var sibIndex = siblings.findIndex(function(s) { return s.id === nodeId; });
    // 已经是第一个同级兄弟，无法上移
    if (sibIndex <= 0) return;

    var prevSib = siblings[sibIndex - 1];
    var curRange = getSubtreeRange(nodeId, rows);
    var prevRange = getSubtreeRange(prevSib.id, rows);
    if (!curRange || !prevRange) return;

    // 提取两个子树
    var prevSubtree = rows.splice(prevRange.start, prevRange.end - prevRange.start + 1);
    // splice 后 curRange 的 start 前移了
    var newCurStart = curRange.start - prevSubtree.length;
    var curSubtree = rows.splice(newCurStart, curRange.end - curRange.start + 1);

    // 先插入当前子树到原 prevRange.start 位置，再插入 prev 子树到后面
    var insertPos = prevRange.start;
    curSubtree.forEach(function(r, i) { rows.splice(insertPos + i, 0, r); });
    prevSubtree.forEach(function(r, i) { rows.splice(insertPos + curSubtree.length + i, 0, r); });

    renderTable();
    updateStats();
    generateGantt();
}

/**
 * 下移节点（与下方同级兄弟交换位置）
 * 仅调整同级节点顺序，子树整体移动
 * @param {number} nodeId - 待下移节点 ID
 */
function moveNodeDown(nodeId) {
    var rows = GanttState.rows;
    var siblings = getSiblingNodes(nodeId, rows);
    var sibIndex = siblings.findIndex(function(s) { return s.id === nodeId; });
    // 已经是最后一个同级兄弟，无法下移
    if (sibIndex >= siblings.length - 1) return;

    var nextSib = siblings[sibIndex + 1];
    var curRange = getSubtreeRange(nodeId, rows);
    var nextRange = getSubtreeRange(nextSib.id, rows);
    if (!curRange || !nextRange) return;

    // 提取两个子树
    var curSubtree = rows.splice(curRange.start, curRange.end - curRange.start + 1);
    // splice 后 nextRange 的 start 前移了
    var newNextStart = nextRange.start - curSubtree.length;
    var nextSubtree = rows.splice(newNextStart, nextRange.end - nextRange.start + 1);

    // 先插入 next 子树到原 curRange.start 位置，再插入 cur 子树到后面
    var insertPos = curRange.start;
    nextSubtree.forEach(function(r, i) { rows.splice(insertPos + i, 0, r); });
    curSubtree.forEach(function(r, i) { rows.splice(insertPos + nextSubtree.length + i, 0, r); });

    renderTable();
    updateStats();
    generateGantt();
}

/**
 * 添加根节点
 */
function addRootNode() {
    var newRow = {
        id: GanttState.nextId++,
        name: '新阶段',
        parentId: null,
        start: '',
        end: '',
        isManual: false
    };
    GanttState.rows.push(newRow);
    renderTable();
    updateStats();
    generateGantt();
    setTimeout(function() {
        var inputs = tbody.querySelectorAll('.cell-input[data-field="name"]');
        var target = Array.from(inputs).find(function(el) { return parseInt(el.dataset.id, 10) === newRow.id; });
        if (target) target.focus();
    }, 50);
}
