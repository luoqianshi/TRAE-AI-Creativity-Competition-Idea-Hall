/**
 * CSV 解析 / 导入 / 导出模块
 * 处理 CSV 文件的解析、导入和导出逻辑
 * 支持三种格式：5列（序号+名称+父节点+开始+结束）、4列含序号、4列含父节点
 */

/**
 * 解析 CSV 文本为二维数组
 * 支持引号包裹字段、换行和逗号分隔
 * @param {string} text - 原始 CSV 文本
 * @param {number} maxCols - 最大列数（4 或 5）
 * @returns {Array<Array<string>>} 解析后的二维数组
 */
function parseCSV(text, maxCols) {
    maxCols = maxCols || 5;
    var lines = [];
    var current = '', insideQuotes = false, i = 0, len = text.length;
    while (i < len) {
        var ch = text[i];
        if (insideQuotes) {
            if (ch === '"') {
                if (i + 1 < len && text[i + 1] === '"') { current += '"'; i += 2; }
                else { insideQuotes = false; i++; }
            } else { current += ch; i++; }
        } else {
            if (ch === '"') { insideQuotes = true; i++; }
            else if (ch === '\n' || ch === '\r') {
                if (ch === '\r' && i + 1 < len && text[i + 1] === '\n') i++;
                if (current.trim() !== '' || lines.length > 0) lines.push(current);
                current = ''; i++;
            } else { current += ch; i++; }
        }
    }
    if (current.trim() !== '' || lines.length > 0) lines.push(current);

    var result = [];
    for (var li = 0; li < lines.length; li++) {
        var line = lines[li];
        if (line.trim() === '') continue;
        var fields = [];
        var field = '', inQuotes = false, j = 0, l = line.length;
        while (j < l) {
            var c = line[j];
            if (inQuotes) {
                if (c === '"') {
                    if (j + 1 < l && line[j + 1] === '"') { field += '"'; j += 2; }
                    else { inQuotes = false; j++; }
                } else { field += c; j++; }
            } else {
                if (c === '"') { inQuotes = true; j++; }
                else if (c === ',') { fields.push(field); field = ''; j++; }
                else { field += c; j++; }
            }
        }
        fields.push(field);
        var cleaned = fields.map(function(f) { return f.trim(); });
        if (cleaned.length >= maxCols) result.push(cleaned.slice(0, maxCols));
        else {
            var padded = cleaned.slice();
            while (padded.length < maxCols) padded.push('');
            result.push(padded);
        }
    }
    return result;
}

/**
 * 检测 CSV 数据的列格式
 * @param {Array<Array<string>>} dataRows - 数据行（不含表头）
 * @returns {string} '5col' (序号+名称+父节点+开始+结束) | '4col-seq' (序号+名称+开始+结束) | '4col-parent' (名称+父节点+开始+结束)
 */
function detectCSVFormat(dataRows) {
    // 检查最大列数
    var maxLen = 0;
    dataRows.forEach(function(fields) {
        if (fields.length > maxLen) maxLen = fields.length;
    });

    if (maxLen >= 5) return '5col';

    // 4列：判断第一列是序号还是名称
    // 序号特征：包含 .（如 1.1, 1.2.1）或为纯数字
    var seqCount = 0;
    var total = 0;
    dataRows.forEach(function(fields) {
        if (fields.length < 4) return;
        var first = fields[0].trim();
        if (!first) return;
        total++;
        // 含 . 或为纯数字（1, 2, 3 等）视为序号
        if (first.indexOf('.') !== -1 || /^\d+$/.test(first)) seqCount++;
    });

    // 超过半数的第一列像序号 → 4列含序号格式
    return (total > 0 && seqCount > total / 2) ? '4col-seq' : '4col-parent';
}

/**
 * 根据序号字符串推断父节点的序号
 * @param {string} seq - 当前节点的序号（如 "1.2.1"）
 * @returns {string|null} 父节点的序号（如 "1.2"），根节点返回 null
 */
function getParentSeq(seq) {
    if (!seq) return null;
    var lastDot = seq.lastIndexOf('.');
    if (lastDot === -1) return null; // 根节点
    return seq.substring(0, lastDot);
}

/**
 * 自动检测 CSV 数据的模式（日期 / 序数）
 * @param {Array<Array<string>>} dataRows - 数据行
 * @param {string} format - 列格式（'5col' | '4col-seq' | '4col-parent'）
 * @returns {string} 'date' 或 'ordinal'
 */
function detectCSVMode(dataRows, format) {
    var dateCount = 0;
    var total = 0;
    dataRows.forEach(function(fields) {
        var start, end;
        if (format === '5col') {
            start = (fields[3] || '').trim();
            end = (fields[4] || '').trim();
        } else if (format === '4col-seq') {
            start = (fields[2] || '').trim();
            end = (fields[3] || '').trim();
        } else {
            start = (fields[2] || '').trim();
            end = (fields[3] || '').trim();
        }
        if (!start && !end) return;
        total++;
        if (parseDate(start) || parseDate(end)) dateCount++;
    });
    return (total > 0 && dateCount > total / 2) ? 'date' : 'ordinal';
}

/**
 * 导入 CSV 文件并填充行数据
 * 支持三种格式自动检测，日期模式下归一化为 YYYY-MM-DD
 * @param {File} file - 用户选择的 CSV 文件
 */
function importCSV(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var text = e.target.result;
        try {
            // 先按5列解析，后续根据格式判断
            var parsed = parseCSV(text, 5);
            if (parsed.length === 0) {
                showError('CSV 文件为空或格式无法识别。');
                return;
            }

            // 检测是否有表头
            var hasHeader = parsed[0].some(function(f) {
                return f.includes('序号') || f.includes('父节点') || f.includes('工作阶段');
            });
            var dataStart = hasHeader ? 1 : 0;
            var dataRows = parsed.slice(dataStart);

            // 检测列格式
            var format = detectCSVFormat(dataRows);

            // 检测日期/序数模式
            var detectedMode = detectCSVMode(dataRows, format);

            GanttState.nextId = 1;
            var newRows = [];
            var nameToId = {};   // 名称 → ID 映射（用于父节点名称匹配）
            var seqToId = {};    // 序号 → ID 映射（用于序号推断层级）

            for (var i = 0; i < dataRows.length; i++) {
                var fields = dataRows[i];
                var seq = '', name = '', parentName = '', start = '', end = '';

                if (format === '5col') {
                    // 序号, 工作阶段, 父节点, 开始, 结束
                    seq = (fields[0] || '').trim();
                    name = (fields[1] || '').trim();
                    parentName = (fields[2] || '').trim();
                    start = (fields[3] || '').trim();
                    end = (fields[4] || '').trim();
                } else if (format === '4col-seq') {
                    // 序号, 工作阶段, 开始, 结束
                    seq = (fields[0] || '').trim();
                    name = (fields[1] || '').trim();
                    start = (fields[2] || '').trim();
                    end = (fields[3] || '').trim();
                } else {
                    // 工作阶段, 父节点, 开始, 结束
                    name = (fields[0] || '').trim();
                    parentName = (fields[1] || '').trim();
                    start = (fields[2] || '').trim();
                    end = (fields[3] || '').trim();
                }

                if (!name) continue;

                // 日期模式下归一化日期格式
                if (detectedMode === 'date') {
                    start = normalizeDateStr(start);
                    end = normalizeDateStr(end);
                }

                var id = GanttState.nextId++;

                // 确定父节点 ID：优先用序号推断，回退到父节点名称
                var parentId = null;
                if (seq) {
                    var parentSeq = getParentSeq(seq);
                    if (parentSeq && seqToId[parentSeq]) {
                        parentId = seqToId[parentSeq];
                    }
                }
                // 序号推断失败且有父节点名称，回退到名称匹配
                if (parentId === null && parentName) {
                    parentId = nameToId[parentName] || null;
                }

                newRows.push({ id: id, name: name, parentId: parentId, start: start, end: end, isManual: false });
                nameToId[name] = id;
                if (seq) seqToId[seq] = id;
            }

            // 对于4col-parent格式，二次匹配父节点名称（处理行序问题）
            if (format === '4col-parent' || format === '5col') {
                newRows.forEach(function(r, idx) {
                    if (r.parentId !== null) return; // 已匹配到
                    var parentName2 = (dataRows[idx] || [])[format === '5col' ? 2 : 1];
                    if (parentName2) {
                        parentName2 = parentName2.trim();
                        if (nameToId[parentName2]) {
                            r.parentId = nameToId[parentName2];
                        }
                    }
                });
            }

            // 切换到检测到的模式
            GanttState.rows = newRows;
            setMode(detectedMode);
            clearError();
        } catch (err) {
            showError('解析 CSV 失败：' + err.message);
        }
    };
    reader.onerror = function() {
        showError('读取文件失败，请检查文件权限。');
    };
    reader.readAsText(file, 'UTF-8');
}

/**
 * 导出当前行数据为 CSV 文件并下载
 * 保持原有4列格式（工作阶段,父节点,开始,结束）
 */
function exportCSV() {
    var rows = GanttState.rows;
    if (rows.length === 0) {
        alert('没有数据可导出。');
        return;
    }
    var nameMap = {};
    rows.forEach(function(r) { nameMap[r.id] = r.name; });
    var csv = '工作阶段,父节点,开始,结束\n';
    rows.forEach(function(r) {
        var parentName = r.parentId !== null ? (nameMap[r.parentId] || '') : '';
        csv += '"' + (r.name || '') + '","' + parentName + '","' + (r.start || '') + '","' + (r.end || '') + '"\n';
    });
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '甘特图数据_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
