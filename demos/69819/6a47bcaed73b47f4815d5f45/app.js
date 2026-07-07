const state = {
    files: [],
    currentMode: 'auto-number',
    config: {
        'auto-number': {
            prefix: '',
            startNumber: 1,
            digits: 3,
            suffix: ''
        },
        'prefix-suffix': {
            prefix: '',
            suffix: '',
            keepExtension: true
        },
        'find-replace': {
            findText: '',
            replaceText: '',
            caseSensitive: false,
            useRegex: false
        },
        'append-number': {
            position: 'end',
            startNumber: 1,
            digits: 3,
            separator: '_'
        },
        'insert-content': {
            content: '',
            position: 1,
            fromEnd: false
        },
        'delete-content': {
            startPos: 1,
            length: 1,
            fromEnd: false,
            keepExtension: true
        }
    },
    searchQuery: '',
    showChangedOnly: false
};

const modeNames = {
    'auto-number': '自动序号',
    'prefix-suffix': '前缀后缀',
    'find-replace': '查找替换',
    'append-number': '追加序号',
    'insert-content': '插入内容',
    'delete-content': '删减内容'
};

function padNumber(num, digits) {
    return String(num).padStart(digits, '0');
}

function getFileNameAndExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return { name: filename, extension: '' };
    }
    return {
        name: filename.substring(0, lastDotIndex),
        extension: filename.substring(lastDotIndex)
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function renameAutoNumber(filename, index, config) {
    const { prefix, startNumber, digits, suffix } = config;
    const { extension } = getFileNameAndExtension(filename);
    const number = padNumber(startNumber + index, digits);
    return `${prefix}${number}${suffix}${extension}`;
}

function renamePrefixSuffix(filename, index, config) {
    const { prefix, suffix, keepExtension } = config;
    if (keepExtension) {
        const { name, extension } = getFileNameAndExtension(filename);
        return `${prefix}${name}${suffix}${extension}`;
    }
    return `${prefix}${filename}${suffix}`;
}

function renameFindReplace(filename, index, config) {
    const { findText, replaceText, caseSensitive, useRegex } = config;
    if (!findText) return filename;
    
    try {
        if (useRegex) {
            const flags = caseSensitive ? 'g' : 'gi';
            const regex = new RegExp(findText, flags);
            return filename.replace(regex, replaceText);
        } else {
            if (caseSensitive) {
                return filename.split(findText).join(replaceText);
            } else {
                const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                return filename.replace(regex, replaceText);
            }
        }
    } catch (e) {
        return filename;
    }
}

function renameAppendNumber(filename, index, config) {
    const { position, startNumber, digits, separator } = config;
    const number = padNumber(startNumber + index, digits);
    const { name, extension } = getFileNameAndExtension(filename);
    
    if (position === 'start') {
        return `${number}${separator}${name}${extension}`;
    } else {
        return `${name}${separator}${number}${extension}`;
    }
}

function renameInsertContent(filename, index, config) {
    const { content, position, fromEnd } = config;
    const { name, extension } = getFileNameAndExtension(filename);
    
    let pos = position;
    if (fromEnd) {
        pos = name.length - position;
    }
    pos = Math.max(0, Math.min(pos, name.length));
    
    const newName = name.substring(0, pos) + content + name.substring(pos);
    return newName + extension;
}

function renameDeleteContent(filename, index, config) {
    const { startPos, length, fromEnd, keepExtension } = config;
    
    if (keepExtension) {
        const { name, extension } = getFileNameAndExtension(filename);
        let start = startPos - 1;
        let len = length;
        
        if (fromEnd) {
            start = name.length - startPos - length + 1;
        }
        
        start = Math.max(0, Math.min(start, name.length));
        const end = Math.min(start + len, name.length);
        const newName = name.substring(0, start) + name.substring(end);
        return newName + extension;
    } else {
        let start = startPos - 1;
        let len = length;
        
        if (fromEnd) {
            start = filename.length - startPos - length + 1;
        }
        
        start = Math.max(0, Math.min(start, filename.length));
        const end = Math.min(start + len, filename.length);
        return filename.substring(0, start) + filename.substring(end);
    }
}

function getNewName(filename, index, mode, config) {
    switch (mode) {
        case 'auto-number':
            return renameAutoNumber(filename, index, config['auto-number']);
        case 'prefix-suffix':
            return renamePrefixSuffix(filename, index, config['prefix-suffix']);
        case 'find-replace':
            return renameFindReplace(filename, index, config['find-replace']);
        case 'append-number':
            return renameAppendNumber(filename, index, config['append-number']);
        case 'insert-content':
            return renameInsertContent(filename, index, config['insert-content']);
        case 'delete-content':
            return renameDeleteContent(filename, index, config['delete-content']);
        default:
            return filename;
    }
}

function renderConfigForm() {
    const form = document.getElementById('configForm');
    const mode = state.currentMode;
    const config = state.config[mode];
    
    let html = '';
    
    switch (mode) {
        case 'auto-number':
            html = `
                <div class="form-group">
                    <label class="form-label">前面字符（前缀）</label>
                    <input type="text" class="form-input" id="config_prefix" value="${config.prefix}" placeholder="例如：IMG_">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">开始序号</label>
                        <input type="number" class="form-input" id="config_startNumber" value="${config.startNumber}" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">固定位数</label>
                        <input type="number" class="form-input" id="config_digits" value="${config.digits}" min="1" max="10">
                        <span class="form-hint">序号自动补0，位数为3则1变成001</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">后面字符（后缀）</label>
                    <input type="text" class="form-input" id="config_suffix" value="${config.suffix}" placeholder="可为空">
                </div>
            `;
            break;
            
        case 'prefix-suffix':
            html = `
                <div class="form-group">
                    <label class="form-label">前缀字符</label>
                    <input type="text" class="form-input" id="config_prefix" value="${config.prefix}" placeholder="在文件名前添加">
                </div>
                <div class="form-group">
                    <label class="form-label">后缀字符</label>
                    <input type="text" class="form-input" id="config_suffix" value="${config.suffix}" placeholder="在文件名后添加">
                </div>
                <div class="form-checkbox">
                    <input type="checkbox" id="config_keepExtension" ${config.keepExtension ? 'checked' : ''}>
                    <label for="config_keepExtension">保留文件扩展名（后缀添加在扩展名前）</label>
                </div>
            `;
            break;
            
        case 'find-replace':
            html = `
                <div class="form-group">
                    <label class="form-label">查找内容</label>
                    <input type="text" class="form-input" id="config_findText" value="${config.findText}" placeholder="要查找的文本">
                </div>
                <div class="form-group">
                    <label class="form-label">替换为</label>
                    <input type="text" class="form-input" id="config_replaceText" value="${config.replaceText}" placeholder="替换后的文本">
                </div>
                <div class="form-checkbox">
                    <input type="checkbox" id="config_caseSensitive" ${config.caseSensitive ? 'checked' : ''}>
                    <label for="config_caseSensitive">区分大小写</label>
                </div>
                <div class="form-checkbox">
                    <input type="checkbox" id="config_useRegex" ${config.useRegex ? 'checked' : ''}>
                    <label for="config_useRegex">使用正则表达式</label>
                </div>
            `;
            break;
            
        case 'append-number':
            html = `
                <div class="form-group">
                    <label class="form-label">序号位置</label>
                    <select class="form-input" id="config_position">
                        <option value="start" ${config.position === 'start' ? 'selected' : ''}>文件名开头</option>
                        <option value="end" ${config.position === 'end' ? 'selected' : ''}>文件名结尾</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">开始序号</label>
                        <input type="number" class="form-input" id="config_startNumber" value="${config.startNumber}" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">固定位数</label>
                        <input type="number" class="form-input" id="config_digits" value="${config.digits}" min="1" max="10">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">分隔符</label>
                    <input type="text" class="form-input" id="config_separator" value="${config.separator}" placeholder="序号与原名之间的分隔符">
                </div>
            `;
            break;
            
        case 'insert-content':
            html = `
                <div class="form-group">
                    <label class="form-label">插入内容</label>
                    <input type="text" class="form-input" id="config_content" value="${config.content}" placeholder="要插入的文本">
                </div>
                <div class="form-group">
                    <label class="form-label">插入位置（第几个字符后）</label>
                    <input type="number" class="form-input" id="config_position" value="${config.position}" min="0">
                </div>
                <div class="form-checkbox">
                    <input type="checkbox" id="config_fromEnd" ${config.fromEnd ? 'checked' : ''}>
                    <label for="config_fromEnd">从末尾开始计数</label>
                </div>
            `;
            break;
            
        case 'delete-content':
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">起始位置</label>
                        <input type="number" class="form-input" id="config_startPos" value="${config.startPos}" min="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">删除长度</label>
                        <input type="number" class="form-input" id="config_length" value="${config.length}" min="1">
                    </div>
                </div>
                <div class="form-checkbox">
                    <input type="checkbox" id="config_fromEnd" ${config.fromEnd ? 'checked' : ''}>
                    <label for="config_fromEnd">从末尾开始计数</label>
                </div>
                <div class="form-checkbox">
                    <input type="checkbox" id="config_keepExtension" ${config.keepExtension ? 'checked' : ''}>
                    <label for="config_keepExtension">保留文件扩展名（不删除扩展名部分）</label>
                </div>
            `;
            break;
    }
    
    form.innerHTML = html;
    
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', handleConfigChange);
        input.addEventListener('change', handleConfigChange);
    });
}

function handleConfigChange(e) {
    const mode = state.currentMode;
    const id = e.target.id;
    const key = id.replace('config_', '');
    
    let value;
    if (e.target.type === 'checkbox') {
        value = e.target.checked;
    } else if (e.target.type === 'number') {
        value = parseInt(e.target.value) || 0;
    } else {
        value = e.target.value;
    }
    
    state.config[mode][key] = value;
    updatePreview();
}

function renderFileList() {
    const container = document.getElementById('fileListContainer');
    const list = document.getElementById('fileList');
    const countEl = document.getElementById('fileCount');
    
    countEl.textContent = `${state.files.length} 个文件`;
    
    if (state.files.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    list.innerHTML = state.files.map((file, index) => `
        <div class="file-item">
            <div class="file-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
            </div>
            <span class="file-item-name" title="${file.name}">${file.name}</span>
            <span class="file-item-size">${formatFileSize(file.size)}</span>
            <button class="file-item-remove" data-index="${index}" title="移除">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    list.querySelectorAll('.file-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            state.files.splice(index, 1);
            renderFileList();
            updatePreview();
        });
    });
}

function updatePreview() {
    const emptyEl = document.getElementById('previewEmpty');
    const tableContainer = document.getElementById('previewTableContainer');
    const tbody = document.getElementById('previewBody');
    const changedCountEl = document.getElementById('changedCount');
    const unchangedCountEl = document.getElementById('unchangedCount');
    
    if (state.files.length === 0) {
        emptyEl.style.display = 'flex';
        tableContainer.style.display = 'none';
        changedCountEl.textContent = '变更: 0';
        unchangedCountEl.textContent = '未变: 0';
        return;
    }
    
    emptyEl.style.display = 'none';
    tableContainer.style.display = 'block';
    
    let changedCount = 0;
    let unchangedCount = 0;
    
    const rows = state.files.map((file, index) => {
        const newName = getNewName(file.name, index, state.currentMode, state.config);
        const changed = newName !== file.name;
        
        if (changed) changedCount++;
        else unchangedCount++;
        
        if (state.showChangedOnly && !changed) return '';
        
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            if (!file.name.toLowerCase().includes(query) && !newName.toLowerCase().includes(query)) {
                return '';
            }
        }
        
        return `
            <tr>
                <td class="preview-index">${index + 1}</td>
                <td class="original-name">${escapeHtml(file.name)}</td>
                <td style="text-align: center;">
                    <svg style="width: 16px; height: 16px; color: var(--text-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </td>
                <td class="new-name ${changed ? 'changed' : 'name-unchanged'}">${escapeHtml(newName)}</td>
                <td class="row-status">
                    <span class="status-badge ${changed ? 'changed' : 'unchanged'}">
                        ${changed ? 
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' :
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>'
                        }
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
    changedCountEl.textContent = `变更: ${changedCount}`;
    unchangedCountEl.textContent = `未变: ${unchangedCount}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msg = document.getElementById('toastMessage');
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    
    toast.className = `toast ${type}`;
    icon.textContent = icons[type] || 'ℹ';
    msg.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function exportCSV() {
    if (state.files.length === 0) {
        showToast('请先上传文件', 'error');
        return;
    }
    
    const rows = [
        ['序号', '原文件名', '新文件名', '是否变更']
    ];
    
    state.files.forEach((file, index) => {
        const newName = getNewName(file.name, index, state.currentMode, state.config);
        const changed = newName !== file.name ? '是' : '否';
        rows.push([index + 1, file.name, newName, changed]);
    });
    
    const csvContent = rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `重命名映射表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('映射表已导出', 'success');
}

async function downloadRenamedFiles() {
    if (state.files.length === 0) {
        showToast('请先上传文件', 'error');
        return;
    }
    
    showToast('正在准备下载...', 'info');
    
    for (let i = 0; i < state.files.length; i++) {
        const file = state.files[i];
        const newName = getNewName(file.name, i, state.currentMode, state.config);
        
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = newName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    showToast('文件下载完成', 'success');
}

function resetConfig() {
    state.config = {
        'auto-number': {
            prefix: '',
            startNumber: 1,
            digits: 3,
            suffix: ''
        },
        'prefix-suffix': {
            prefix: '',
            suffix: '',
            keepExtension: true
        },
        'find-replace': {
            findText: '',
            replaceText: '',
            caseSensitive: false,
            useRegex: false
        },
        'append-number': {
            position: 'end',
            startNumber: 1,
            digits: 3,
            separator: '_'
        },
        'insert-content': {
            content: '',
            position: 1,
            fromEnd: false
        },
        'delete-content': {
            startPos: 1,
            length: 1,
            fromEnd: false,
            keepExtension: true
        }
    };
    
    state.searchQuery = '';
    state.showChangedOnly = false;
    
    document.getElementById('searchInput').value = '';
    document.getElementById('showAllBtn').classList.add('active');
    document.getElementById('showChangedBtn').classList.remove('active');
    
    renderConfigForm();
    updatePreview();
    showToast('已重置配置', 'info');
}

function initModeSelector() {
    const dropdown = document.getElementById('modeDropdown');
    const options = document.getElementById('modeOptions');
    const selector = document.querySelector('.mode-selector');
    const modeText = document.getElementById('modeText');
    
    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
        if (!selector.contains(e.target)) {
            selector.classList.remove('open');
        }
    });
    
    const optionEls = options.querySelectorAll('.mode-option');
    optionEls.forEach(opt => {
        opt.addEventListener('click', () => {
            const mode = opt.dataset.mode;
            state.currentMode = mode;
            modeText.textContent = modeNames[mode];
            selector.classList.remove('open');
            
            optionEls.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            
            renderConfigForm();
            updatePreview();
        });
    });
    
    optionEls[0].classList.add('selected');
}

function initFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
        fileInput.value = '';
    });
}

function addFiles(files) {
    const newFiles = files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        file: f
    }));
    
    state.files = [...state.files, ...newFiles];
    renderFileList();
    updatePreview();
    
    if (newFiles.length > 0) {
        showToast(`已添加 ${newFiles.length} 个文件`, 'success');
    }
}

function init() {
    initModeSelector();
    initFileUpload();
    renderConfigForm();
    renderFileList();
    updatePreview();
    
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        if (state.files.length > 0) {
            state.files = [];
            renderFileList();
            updatePreview();
            showToast('已清空所有文件', 'info');
        }
    });
    
    document.getElementById('resetBtn').addEventListener('click', resetConfig);
    document.getElementById('exportBtn').addEventListener('click', exportCSV);
    document.getElementById('downloadBtn').addEventListener('click', downloadRenamedFiles);
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        updatePreview();
    });
    
    document.getElementById('showAllBtn').addEventListener('click', () => {
        state.showChangedOnly = false;
        document.getElementById('showAllBtn').classList.add('active');
        document.getElementById('showChangedBtn').classList.remove('active');
        updatePreview();
    });
    
    document.getElementById('showChangedBtn').addEventListener('click', () => {
        state.showChangedOnly = true;
        document.getElementById('showChangedBtn').classList.add('active');
        document.getElementById('showAllBtn').classList.remove('active');
        updatePreview();
    });
}

document.addEventListener('DOMContentLoaded', init);
