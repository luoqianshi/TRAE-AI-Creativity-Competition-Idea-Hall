/**
 * 甘特图 SVG 生成模块
 * 根据行数据生成完整的甘特图 SVG 并渲染到页面
 */

/** DOM 引用缓存 */
var emptyState = document.getElementById('emptyState');
var svgContainer = document.getElementById('svgContainer');

/**
 * 生成甘特图 SVG 并渲染
 * 包含日期/序数两种模式的轴计算、条形绘制、标签生成
 */
function generateGantt() {
    var rows = GanttState.rows;

    // 重算所有父节点时间
    var parentIds = rows.filter(function(r) { return r.parentId !== null; }).map(function(r) { return r.parentId; });
    var uniqueParents = [];
    parentIds.forEach(function(pid) {
        if (uniqueParents.indexOf(pid) === -1) uniqueParents.push(pid);
    });
    uniqueParents.forEach(function(pid) { recalcParentTime(pid, rows); });

    var validRows = [];
    var errors = [];

    if (GanttState.mode === 'date') {
        validRows = rows.filter(function(r) {
            var name = (r.name || '').trim();
            var start = parseDate(r.start);
            var end = parseDate(r.end);
            if (!name) { errors.push('名称为空'); return false; }
            if (!start) { errors.push('开始日期格式错误: ' + r.name); return false; }
            if (!end) { errors.push('结束日期格式错误: ' + r.name); return false; }
            if (!isValidDate(start) || !isValidDate(end)) return false;
            return true;
        }).map(function(r) {
            return Object.assign({}, r, { startDate: parseDate(r.start), endDate: parseDate(r.end) });
        });
    } else {
        validRows = rows.filter(function(r) {
            var name = (r.name || '').trim();
            var start = extractNumber(r.start);
            var end = extractNumber(r.end);
            if (!name) { errors.push('名称为空'); return false; }
            if (start === null) { errors.push('开始无法提取数字: ' + r.name); return false; }
            if (end === null) { errors.push('结束无法提取数字: ' + r.name); return false; }
            return true;
        }).map(function(r) {
            return Object.assign({}, r, { startVal: extractNumber(r.start), endVal: extractNumber(r.end) });
        });
    }

    if (errors.length > 0) showError('⚠️ 数据错误：\n' + errors.join('\n'));
    else clearError();

    if (validRows.length === 0) {
        emptyState.style.display = 'block';
        svgContainer.style.display = 'none';
        svgContainer.innerHTML = '';
        return;
    }
    emptyState.style.display = 'none';
    svgContainer.style.display = 'block';

    var depthMap = getDepthMap(rows);
    var seqMap = calcSequence(rows);

    // 读取显示配置
    var cfg = GanttState.displayConfig;

    // 计算左侧各列的最大宽度（列式对齐）
    var colMaxSeq = 0, colMaxName = 0, colMaxStart = 0, colMaxEnd = 0;
    validRows.forEach(function(r) {
        var depth = depthMap[r.id] || 0;
        var seq = seqMap[r.id] || '';
        if (cfg.seq && seq) {
            var sw = seq.length * 8 + 8;
            if (sw > colMaxSeq) colMaxSeq = sw;
        }
        if (cfg.name) {
            var nw = (r.name || '').length * 12 + depth * 18 + 10;
            if (nw > colMaxName) colMaxName = nw;
        }
        if (cfg.start) {
            var startStr = GanttState.mode === 'date' ? (r.start || '') : String(r.startVal != null ? r.startVal : '');
            var stw = startStr.length * 7 + 10;
            if (stw > colMaxStart) colMaxStart = stw;
        }
        if (cfg.end) {
            var endStr = GanttState.mode === 'date' ? (r.end || '') : String(r.endVal != null ? r.endVal : '');
            var edw = endStr.length * 7 + 10;
            if (edw > colMaxEnd) colMaxEnd = edw;
        }
    });

    // 计算各列起始 X 坐标
    var colXStart = 8;
    var colXSeq = cfg.seq ? colXStart : colXStart;
    var colXName = colXSeq + colMaxSeq;
    var colXStartField = colXName + colMaxName;
    var colXEndField = colXStartField + colMaxStart;

    // 左侧总宽度 = 最后一个可见列的末尾 + 右边距
    var leftNameWidth = colXEndField + colMaxEnd + 4;
    if (!cfg.end) leftNameWidth = colXStartField + colMaxStart + 4;
    if (!cfg.start && !cfg.end) leftNameWidth = colXName + colMaxName + 4;
    if (!cfg.name && !cfg.start && !cfg.end) leftNameWidth = colXSeq + colMaxSeq + 4;
    if (!cfg.seq && !cfg.name && !cfg.start && !cfg.end) leftNameWidth = 50;
    leftNameWidth = Math.max(100, leftNameWidth);
    var leftTotal = leftNameWidth + 6;

    var plotWidth = 800;
    var labelAreaWidth = 50;
    var effectivePlotWidth = plotWidth - labelAreaWidth;
    var rightPadding = 4;
    var totalWidth = leftTotal + plotWidth + rightPadding;
    var rowHeight = 30;
    var barHeight = 10;
    var paddingTop = 40;
    var paddingBottom = 30;

    // 计算轴范围
    var minVal, maxVal;
    if (GanttState.mode === 'date') {
        var minDate = null, maxDate = null;
        validRows.forEach(function(r) {
            if (!minDate || r.startDate < minDate) minDate = r.startDate;
            if (!maxDate || r.endDate > maxDate) maxDate = r.endDate;
        });
        minVal = minDate;
        maxVal = maxDate;
    } else {
        var minNum = Infinity, maxNum = -Infinity;
        validRows.forEach(function(r) {
            if (r.startVal < minNum) minNum = r.startVal;
            if (r.endVal > maxNum) maxNum = r.endVal;
        });
        var minUser = parseInt(document.getElementById('rangeMin').value);
        var maxUser = parseInt(document.getElementById('rangeMax').value);
        if (!isNaN(minUser) && !isNaN(maxUser) && minUser < maxUser) {
            minVal = minUser;
            maxVal = maxUser;
        } else {
            var padding = Math.max(1, Math.round((maxNum - minNum) * 0.05));
            minVal = minNum - padding;
            maxVal = maxNum + padding;
        }
    }

    /** 值到 X 坐标的映射函数 */
    function valueToX(value) {
        if (GanttState.mode === 'date') {
            var d = new Date(value.getFullYear(), value.getMonth(), value.getDate());
            var min = new Date(minVal.getFullYear(), minVal.getMonth(), minVal.getDate());
            var max = new Date(maxVal.getFullYear(), maxVal.getMonth(), maxVal.getDate());
            var total = daysBetween(min, max);
            if (total === 0) return leftTotal + effectivePlotWidth / 2;
            var days = daysBetween(min, d);
            return leftTotal + (days / total) * effectivePlotWidth;
        } else {
            var total2 = maxVal - minVal;
            if (total2 === 0) return leftTotal + effectivePlotWidth / 2;
            return leftTotal + ((value - minVal) / total2) * effectivePlotWidth;
        }
    }

    // 计算刻度
    var ticks = [], tickLabels = [];

    if (GanttState.mode === 'date') {
        var totalDays = daysBetween(minVal, maxVal) + 1;
        var tickUnit = 'day';
        if (totalDays > 365) tickUnit = 'quarter';
        else if (totalDays > 90) tickUnit = 'month';
        else if (totalDays > 31) tickUnit = 'week';
        else tickUnit = 'day';

        var tickDates = [];
        var current = new Date(minVal);
        tickDates.push(new Date(current));

        if (tickUnit === 'day') {
            var d = new Date(current);
            d.setDate(d.getDate() + 1);
            while (d <= maxVal) { tickDates.push(new Date(d)); d.setDate(d.getDate() + 1); }
        } else if (tickUnit === 'week') {
            var d2 = new Date(current);
            d2.setDate(d2.getDate() + 7);
            while (d2 <= maxVal) { tickDates.push(new Date(d2)); d2.setDate(d2.getDate() + 7); }
        } else if (tickUnit === 'month') {
            var allMonthTicks = [];
            var d3 = new Date(current.getFullYear(), current.getMonth(), 1);
            while (d3 <= maxVal) { allMonthTicks.push(new Date(d3)); d3.setMonth(d3.getMonth() + 1); }
            if (current.getDate() > 15 && allMonthTicks.length > 0) {
                if (allMonthTicks[0].getFullYear() === current.getFullYear() &&
                    allMonthTicks[0].getMonth() === current.getMonth()) {
                    allMonthTicks.shift();
                }
            }
            tickDates.length = 0;
            tickDates.push(new Date(current));
            allMonthTicks.forEach(function(d) { if (d > current) tickDates.push(new Date(d)); });
        } else if (tickUnit === 'quarter') {
            var allQuarterTicks = [];
            var d4 = new Date(current.getFullYear(), Math.floor(current.getMonth() / 3) * 3, 1);
            while (d4 <= maxVal) { allQuarterTicks.push(new Date(d4)); d4.setMonth(d4.getMonth() + 3); }
            if (current.getDate() > 15 && allQuarterTicks.length > 0) {
                if (allQuarterTicks[0].getFullYear() === current.getFullYear() &&
                    allQuarterTicks[0].getMonth() === Math.floor(current.getMonth() / 3) * 3) {
                    allQuarterTicks.shift();
                }
            }
            tickDates.length = 0;
            tickDates.push(new Date(current));
            allQuarterTicks.forEach(function(d) { if (d > current) tickDates.push(new Date(d)); });
        }

        tickDates.forEach(function(d, idx) {
            ticks.push(d);
            if (tickUnit === 'day' || tickUnit === 'week') {
                tickLabels.push(formatDate(d).slice(5));
            } else if (tickUnit === 'month') {
                tickLabels.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
            } else if (tickUnit === 'quarter') {
                tickLabels.push(d.getFullYear() + ' Q' + (Math.floor(d.getMonth() / 3) + 1));
            }
        });
    } else {
        var totalSpan = maxVal - minVal;
        var step = 1;
        if (totalSpan > 60) step = 10;
        else if (totalSpan > 30) step = 5;
        else if (totalSpan > 12) step = 2;
        else step = 1;

        var labelMap = {};
        validRows.forEach(function(r) {
            var label = (r.name || '').trim();
            if (r.startVal !== undefined && r.startVal !== null) {
                if (!labelMap[r.startVal]) labelMap[r.startVal] = label;
            }
            if (r.endVal !== undefined && r.endVal !== null) {
                if (!labelMap[r.endVal]) labelMap[r.endVal] = label;
            }
        });

        for (var v = Math.ceil(minVal / step) * step; v <= maxVal; v += step) {
            if (v >= minVal) {
                ticks.push(v);
                tickLabels.push(labelMap[v] || String(v));
            }
        }
        if (ticks.length > 0 && ticks[0] > minVal) {
            ticks.unshift(minVal);
            tickLabels.unshift(labelMap[minVal] || String(minVal));
        }
        var last = ticks[ticks.length - 1];
        if (last !== undefined && last < maxVal) {
            ticks.push(maxVal);
            tickLabels.push(labelMap[maxVal] || String(maxVal));
        }
    }

    // 构建 SVG
    var totalHeight = paddingTop + validRows.length * rowHeight + paddingBottom + 30;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + totalWidth + '" height="' + totalHeight +
        '" style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,\'PingFang SC\',\'Microsoft YaHei\',sans-serif;">';

    // 交替行背景
    validRows.forEach(function(row, idx) {
        var y = paddingTop + idx * rowHeight;
        if (idx % 2 === 0) {
            svg += '<rect x="' + leftTotal + '" y="' + y + '" width="' + plotWidth + '" height="' + rowHeight + '" fill="#f8fafc" rx="2"/>';
        }
    });

    // 一级节点分割线（在斑马线之上绘制，确保虚线可见）
    var prevRoot = false;
    validRows.forEach(function(row, idx) {
        var depth = depthMap[row.id] || 0;
        if (depth === 0) {
            if (prevRoot) {
                var divY = paddingTop + idx * rowHeight;
                svg += '<line x1="4" y1="' + divY + '" x2="' + (leftTotal + plotWidth) + '" y2="' + divY + '" stroke="#cbd5e1" stroke-dasharray="4 3" stroke-width="1"/>';
            }
            prevRoot = true;
        }
    });

    // 顶部轴线
    var yAxisTop = paddingTop - 8;
    svg += '<line x1="' + leftTotal + '" y1="' + yAxisTop + '" x2="' + (leftTotal + plotWidth) + '" y2="' + yAxisTop + '" stroke="#b0b8c4" stroke-width="1"/>';

    // 刻度线和标签
    var tickLabelFontSize = (GanttState.mode === 'date' && ticks.length > 20) ? 9 : 11;
    ticks.forEach(function(tick, idx) {
        var x = valueToX(tick);
        if (x < leftTotal || x > leftTotal + plotWidth) return;
        svg += '<line x1="' + x + '" y1="' + (yAxisTop - 4) + '" x2="' + x + '" y2="' + (yAxisTop + 4) + '" stroke="#94a3b8" stroke-width="1"/>';
        var label = tickLabels[idx] || String(tick);
        svg += '<text x="' + x + '" y="' + (yAxisTop - 10) + '" text-anchor="middle" font-size="' + tickLabelFontSize + '" fill="#64748b" transform="rotate(-25 ' + x + ',' + (yAxisTop - 10) + ')">' + escapeXml(label) + '</text>';
    });

    // 颜色渐变参数
    var startR = 10, startG = 61, startB = 132;
    var endR = 10, endG = 198, endB = 198;
    var totalCount = validRows.length;

    // 单位文本
    var unitText = '天';
    if (GanttState.mode === 'ordinal') {
        unitText = document.getElementById('ordinalUnit').value.trim() || '个单位';
    }

    // ---- 绘制每一行 ----
    validRows.forEach(function(row, idx) {
        var y = paddingTop + idx * rowHeight;
        var depth = depthMap[row.id] || 0;
        var isRoot = depth === 0;

        var t = totalCount > 1 ? idx / (totalCount - 1) : 0;
        var r = Math.round(startR + (endR - startR) * t);
        var g = Math.round(startG + (endG - startG) * t);
        var b = Math.round(startB + (endB - startB) * t);
        var barColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';

        var textY = y + 19;

        // 序号列
        if (cfg.seq) {
            var seq = seqMap[row.id] || '';
            if (seq) {
                svg += '<text x="' + colXSeq + '" y="' + textY + '" font-size="11" font-weight="' + (isRoot ? '600' : '400') + '" fill="' + (isRoot ? '#0f172a' : '#475569') + '" text-anchor="start">' + escapeXml(seq) + '</text>';
            }
        }

        // 名称列（带层级缩进）
        if (cfg.name) {
            var nameX = colXName + depth * 18;
            svg += '<text x="' + nameX + '" y="' + textY + '" font-size="12" font-weight="' + (isRoot ? '600' : '400') + '" fill="' + (isRoot ? '#0f172a' : '#475569') + '" text-anchor="start">' + escapeXml(row.name || '') + '</text>';
        }

        // 开始日期列
        if (cfg.start) {
            var startText = GanttState.mode === 'date' ? (row.start || '') : (row.startVal != null ? String(row.startVal) : '');
            svg += '<text x="' + colXStartField + '" y="' + textY + '" font-size="10" fill="#64748b" text-anchor="start">' + escapeXml(startText) + '</text>';
        }

        // 结束日期列
        if (cfg.end) {
            var endText = GanttState.mode === 'date' ? (row.end || '') : (row.endVal != null ? String(row.endVal) : '');
            svg += '<text x="' + colXEndField + '" y="' + textY + '" font-size="10" fill="#64748b" text-anchor="start">' + escapeXml(endText) + '</text>';
        }

        // 甘特条
        var startX, endX;
        if (GanttState.mode === 'date') {
            startX = valueToX(row.startDate);
            endX = valueToX(row.endDate);
        } else {
            startX = valueToX(row.startVal);
            endX = valueToX(row.endVal);
        }
        var maxX = leftTotal + effectivePlotWidth;
        if (endX > maxX) endX = maxX;
        if (startX > maxX) startX = maxX;

        var barX = Math.min(startX, endX);
        var barWidth = Math.abs(endX - startX);
        if (barWidth < 1) { barWidth = 2; barX = startX - 1; }
        if (barWidth < 2) barWidth = 2;
        var barY = y + (rowHeight - barHeight) / 2;

        svg += '<rect x="' + barX + '" y="' + barY + '" width="' + barWidth + '" height="' + barHeight + '" rx="3" fill="' + barColor + '" opacity="1"/>';

        // 持续时间标注（条右侧）
        if (cfg.duration) {
            var days;
            if (GanttState.mode === 'date') days = daysBetween(row.startDate, row.endDate);
            else days = row.endVal - row.startVal + 1;
            var label2 = days + unitText;
            var labelX = endX + 6;
            var maxLabelX = leftTotal + plotWidth - 4;
            if (labelX > maxLabelX) labelX = maxLabelX - 20;
            if (labelX + 40 <= leftTotal + plotWidth) {
                svg += '<text x="' + labelX + '" y="' + (y + 19) + '" font-size="10" fill="#1e293b" font-weight="500" text-anchor="start">' + label2 + '</text>';
            } else {
                svg += '<text x="' + barX + '" y="' + (y - 4) + '" font-size="9" fill="#64748b" text-anchor="start">' + label2 + '</text>';
            }
        }
    });

    svg += '</svg>';
    svgContainer.innerHTML = svg;
    updateStats();
}
