/**
 * 统计更新模块
 * 负责更新页面底部的统计信息（有效行数、日期/数值范围、模式标签）
 */

/** DOM 引用缓存 */
var rowCountSpan = document.getElementById('rowCount');
var dateRangeSpan = document.getElementById('dateRange');
var modeLabelSpan = document.getElementById('modeLabel');

/**
 * 更新统计信息区域
 */
function updateStats() {
    var rows = GanttState.rows;
    var validRows = rows.filter(function(r) {
        var name = (r.name || '').trim();
        return name && r.start && r.end;
    });
    rowCountSpan.textContent = validRows.length + ' 行有效';
    modeLabelSpan.textContent = GanttState.mode === 'date' ? '日期模式' : '序数模式';

    if (validRows.length === 0) {
        dateRangeSpan.textContent = '无有效数据';
        return;
    }

    if (GanttState.mode === 'date') {
        var dates = validRows.map(function(r) {
            return { start: parseDate(r.start), end: parseDate(r.end) };
        }).filter(function(d) { return d.start && d.end && isValidDate(d.start) && isValidDate(d.end); });
        if (dates.length === 0) {
            dateRangeSpan.textContent = '无有效日期';
            return;
        }
        var minDate = dates[0].start;
        var maxDate = dates[0].end;
        dates.forEach(function(d) {
            if (d.start < minDate) minDate = d.start;
            if (d.end > maxDate) maxDate = d.end;
        });
        dateRangeSpan.textContent = formatDate(minDate) + ' ～ ' + formatDate(maxDate);
    } else {
        var nums = validRows.map(function(r) {
            var s = extractNumber(r.start);
            var e = extractNumber(r.end);
            return { start: s, end: e };
        }).filter(function(d) { return d.start !== null && d.end !== null; });
        if (nums.length === 0) {
            dateRangeSpan.textContent = '无有效数字';
            return;
        }
        var minVal = nums[0].start;
        var maxVal = nums[0].end;
        nums.forEach(function(d) {
            if (d.start < minVal) minVal = d.start;
            if (d.end > maxVal) maxVal = d.end;
        });
        var minUser = parseInt(document.getElementById('rangeMin').value);
        var maxUser = parseInt(document.getElementById('rangeMax').value);
        if (!isNaN(minUser) && !isNaN(maxUser)) {
            dateRangeSpan.textContent = minUser + ' ～ ' + maxUser + ' (手动)';
        } else {
            dateRangeSpan.textContent = minVal + ' ～ ' + maxVal;
        }
    }
}
