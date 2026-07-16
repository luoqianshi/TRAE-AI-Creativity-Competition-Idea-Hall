/**
 * 模式切换模块
 * 管理日期/序数模式的切换逻辑
 */

/** DOM 引用缓存 */
var modeDateBtn = document.getElementById('modeDate');
var modeOrdinalBtn = document.getElementById('modeOrdinal');
var rangeMinInput = document.getElementById('rangeMin');
var rangeMaxInput = document.getElementById('rangeMax');
var ordinalUnitInput = document.getElementById('ordinalUnit');

/**
 * 切换模式（日期/序数）
 * @param {string} newMode - 目标模式：'date' 或 'ordinal'
 */
function setMode(newMode) {
    GanttState.mode = newMode;
    modeDateBtn.classList.toggle('active', GanttState.mode === 'date');
    modeOrdinalBtn.classList.toggle('active', GanttState.mode === 'ordinal');
    var isOrdinal = GanttState.mode === 'ordinal';
    rangeMinInput.disabled = !isOrdinal;
    rangeMaxInput.disabled = !isOrdinal;
    rangeMinInput.placeholder = isOrdinal ? '起始' : '自动';
    rangeMaxInput.placeholder = isOrdinal ? '结束' : '自动';
    ordinalUnitInput.disabled = !isOrdinal;

    // 更新所有日期输入框的 placeholder
    document.querySelectorAll('.col-start .cell-input, .col-end .cell-input').forEach(function(el) {
        var isStart = el.closest('td').classList.contains('col-start');
        el.placeholder = GanttState.mode === 'date' ? (isStart ? '2026-07-14' : '2026-07-16') : (isStart ? '1' : '2');
    });

    // 重算父节点时间并重新渲染
    var parentIds = GanttState.rows.filter(function(r) { return r.parentId !== null; }).map(function(r) { return r.parentId; });
    var uniqueParents = [];
    parentIds.forEach(function(pid) {
        if (uniqueParents.indexOf(pid) === -1) uniqueParents.push(pid);
    });
    uniqueParents.forEach(function(pid) { recalcParentTime(pid, GanttState.rows); });
    renderTable();
    updateStats();
    generateGantt();
}
