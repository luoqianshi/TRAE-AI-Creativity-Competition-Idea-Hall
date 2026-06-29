/**
 * 综采队设备管理系统 - 公共功能模块
 * 包含所有设备管理页面的公共逻辑和组件
 */

// ==================== 模态框组件 ====================

/**
 * 创建并显示一个模态框
 * @param {string} title - 模态框标题
 * @param {string} message - 模态框内容
 * @param {Array} buttons - 按钮配置数组 [{text: '确定', class: 'btn-primary', onclick: () => {}}]
 * @param {boolean} showInput - 是否显示输入框
 * @param {string} inputPlaceholder - 输入框占位符
 * @returns {Promise} 返回用户输入或按钮点击结果
 */
function showModal(title, message, buttons = [], showInput = false, inputPlaceholder = '') {
    return new Promise((resolve) => {
        // 移除已存在的模态框
        const existingModal = document.querySelector('.custom-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // 创建模态框结构
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'custom-modal-header';
        modalHeader.innerHTML = `<h3>${title}</h3>`;
        
        const modalBody = document.createElement('div');
        modalBody.className = 'custom-modal-body';
        modalBody.innerHTML = `<p>${message}</p>`;
        
        const modalFooter = document.createElement('div');
        modalFooter.className = 'custom-modal-footer';
        
        // 添加输入框（如果需要）
        let inputElement = null;
        if (showInput) {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'custom-modal-input';
            inputElement.placeholder = inputPlaceholder;
            modalBody.appendChild(inputElement);
            
            // 输入框焦点设置
            setTimeout(() => inputElement.focus(), 100);
            
            // 支持回车键提交
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && buttons.length > 0) {
                    buttons[0].onclick && buttons[0].onclick();
                }
            });
        }
        
        // 添加按钮
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.textContent = button.text;
            btn.className = button.class || 'custom-modal-btn';
            btn.onclick = () => {
                const result = showInput ? inputElement.value : (button.value !== undefined ? button.value : null);
                button.onclick && button.onclick(result);
                overlay.remove();
                resolve(result);
            };
            modalFooter.appendChild(btn);
        });
        
        // 组装模态框
        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 支持点击遮罩层关闭（如果有取消按钮）
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && buttons.some(btn => btn.text === '取消')) {
                overlay.remove();
                resolve(null);
            }
        });
        
        // 支持 ESC 键关闭
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
                resolve(null);
            }
        });
    });
}

/**
 * 显示确认对话框
 * @param {string} message - 确认消息
 * @param {string} title - 对话框标题
 * @returns {Promise<boolean>} 用户是否确认
 */
function showConfirm(message, title = '确认') {
    return showModal(title, message, [
        { text: '确定', class: 'custom-modal-btn-primary', value: true },
        { text: '取消', value: false }
    ]);
}

/**
 * 显示输入对话框
 * @param {string} message - 提示消息
 * @param {string} placeholder - 输入框占位符
 * @param {string} title - 对话框标题
 * @returns {Promise<string>} 用户输入的内容
 */
function showPrompt(message, placeholder = '', title = '输入') {
    return showModal(title, message, [
        { text: '确定', class: 'custom-modal-btn-primary' },
        { text: '取消', value: null }
    ], true, placeholder);
}

/**
 * 显示提示对话框
 * @param {string} message - 提示消息
 * @param {string} title - 对话框标题
 * @returns {Promise}
 */
function showAlert(message, title = '提示') {
    return showModal(title, message, [
        { text: '确定', class: 'custom-modal-btn-primary' }
    ]);
}

// ==================== 加载动画组件 ====================

/**
 * 显示加载动画
 * @param {string} message - 加载提示信息
 */
function showLoading(message = '加载中...') {
    const existingLoader = document.querySelector('.loading-overlay');
    if (existingLoader) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    
    const text = document.createElement('div');
    text.className = 'loading-text';
    text.textContent = message;
    
    overlay.appendChild(loader);
    overlay.appendChild(text);
    document.body.appendChild(overlay);
}

/**
 * 隐藏加载动画
 */
function hideLoading() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
}

/**
 * 显示操作成功提示
 * @param {string} message - 成功消息
 */
function showSuccessToast(message) {
    showToast(message, 'success');
}

/**
 * 显示操作失败提示
 * @param {string} message - 失败消息
 */
function showErrorToast(message) {
    showToast(message, 'error');
}

/**
 * 显示提示消息
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型: 'success', 'error', 'info', 'warning'
 * @param {number} duration - 显示时长（毫秒）
 */
function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 动画显示
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== 公共计算函数 ====================

/**
 * 计算下次检修日期
 * @param {string} lastInspectionDate - 上次检修日期
 * @param {number} inspectionCycle - 检修周期（天）
 * @returns {Date} 下次检修日期
 */
function calculateNextInspectionDate(lastInspectionDate, inspectionCycle) {
    const nextDate = new Date(lastInspectionDate);
    nextDate.setDate(nextDate.getDate() + inspectionCycle);
    return nextDate;
}

/**
 * 更新检修状态
 * @param {Date} nextInspectionDate - 下次检修日期
 * @returns {string} 检修状态
 */
function updateInspectionStatus(nextInspectionDate) {
    const today = new Date();
    return today >= nextInspectionDate ? '待检修' : '正常';
}

/**
 * 数据排序
 * @param {Array} data - 数据数组
 * @param {string} sortField - 排序字段
 * @param {boolean} ascending - 是否升序
 * @returns {Array} 排序后的数据
 */
function sortData(data, sortField, ascending = true) {
    const sorted = [...data].sort((a, b) => {
        if (a[sortField] < b[sortField]) return ascending ? -1 : 1;
        if (a[sortField] > b[sortField]) return ascending ? 1 : -1;
        return 0;
    });
    return sorted;
}

// ==================== 设备管理公共函数 ====================

/**
 * 处理设备删除操作（带确认）
 * @param {Array} data - 设备数据数组
 * @param {string} storageKey - localStorage 存储键
 * @param {Array} historyRecords - 历史记录数组
 * @param {string} historyStorageKey - 历史记录存储键
 * @param {Function} loadTableData - 重新加载表格的函数
 * @returns {Promise}
 */
async function handleDeleteDeviceCommon(data, storageKey, historyRecords, historyStorageKey, loadTableData) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'admin') {
        showAlert('只有管理员可以删除设备！', '权限不足');
        return;
    }
    
    const deviceIndices = await showPrompt('请输入要删除的设备序号（多个序号用逗号分隔）', '例如: 1,3,5', '删除设备');
    if (!deviceIndices) return;
    
    const indices = deviceIndices.split(',').map(Number).filter(index => index > 0 && index <= data.length);
    if (indices.length === 0) {
        showAlert('请输入有效的设备序号！', '输入错误');
        return;
    }
    
    // 获取要删除的设备名称
    const deviceNames = indices.map(index => data[index - 1]?.name || '未知设备').join(', ');
    
    // 确认删除
    const confirmed = await showConfirm(`确定要删除以下设备吗？\n${deviceNames}`, '确认删除');
    if (!confirmed) return;
    
    showLoading('正在删除设备...');
    
    try {
        const tableBody = document.getElementById('deviceTableBody');
        tableBody.innerHTML = '';
        
        indices.sort((a, b) => b - a).forEach(index => {
            // 记录历史
            const deletedDevice = data[index - 1];
            historyRecords.push({
                type: '删除设备',
                deviceName: deletedDevice.name,
                timestamp: new Date().toLocaleString(),
                details: JSON.stringify(deletedDevice)
            });
            
            data.splice(index - 1, 1);
        });
        
        localStorage.setItem(storageKey, JSON.stringify(data));
        localStorage.setItem(historyStorageKey, JSON.stringify(historyRecords));
        
        loadTableData();
        
        hideLoading();
        showSuccessToast('设备删除成功！');
    } catch (error) {
        hideLoading();
        showErrorToast('删除设备失败，请重试');
        console.error('删除设备失败:', error);
    }
}

/**
 * 处理设备检修操作
 * @param {number} index - 设备索引
 * @param {Array} data - 设备数据数组
 * @param {Array} historyRecords - 历史记录数组
 * @param {Function} loadTableData - 重新加载表格的函数
 * @returns {Promise}
 */
async function handleInspectionCommon(index, data, historyRecords, loadTableData) {
    const device = data[index];
    if (!device) return;
    
    const inspector = await showPrompt(`请输入设备"${device.name}"的检查人姓名`, '检查人姓名', '设备检修');
    if (!inspector) {
        showAlert('必须填写检修人姓名才能执行检修操作！', '操作提示');
        return;
    }
    
    showLoading('正在完成检修...');
    
    try {
        const today = new Date();
        device.lastRepairDate = today.toISOString().split('T')[0];
        device.inspector = inspector;
        
        // 记录历史
        historyRecords.push({
            type: '设备检修',
            deviceName: device.name,
            timestamp: new Date().toLocaleString(),
            inspector: inspector || '未知',
            details: `检修周期: ${device.repairCycle}天`
        });
        
        // 重新加载表格以更新显示
        loadTableData();
        
        hideLoading();
        showSuccessToast(`设备 "${device.name}" 检修完成！检查人: ${inspector}`);
    } catch (error) {
        hideLoading();
        showErrorToast('检修操作失败，请重试');
        console.error('检修操作失败:', error);
    }
}

/**
 * 保存数据到 localStorage
 * @param {string} storageKey - 数据存储键
 * @param {string} historyStorageKey - 历史记录存储键
 * @param {string} tableName - 表格 body 的 ID
 * @param {Array} historyRecords - 历史记录数组
 * @returns {boolean} 是否保存成功
 */
function saveDataCommon(storageKey, historyStorageKey, tableName, historyRecords) {
    showLoading('正在保存数据...');
    
    try {
        const rows = document.querySelectorAll(`#${tableName} tr`);
        const updatedData = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                name: cells[1].textContent.trim(),
                category: cells[2].textContent.trim(),
                model: cells[3].textContent.trim(),
                checkContent: cells[4].textContent.trim(),
                checkMethod: cells[5].textContent.trim(),
                standardRequirement: cells[6].textContent.trim(),
                repairCycle: parseInt(cells[7].textContent.trim(), 10) || 30,
                lastRepairDate: cells[8].textContent.trim() || new Date().toISOString().split('T')[0],
                inspector: cells[13].textContent.trim()
            };
        });
        
        // 限制历史记录只保存最近的30条
        if (historyRecords.length > 30) {
            historyRecords.splice(0, historyRecords.length - 30);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        localStorage.setItem(historyStorageKey, JSON.stringify(historyRecords));
        
        hideLoading();
        showSuccessToast('数据已保存到本地存储');
        return true;
    } catch (e) {
        hideLoading();
        showErrorToast('保存数据失败，请重试');
        console.error('保存数据失败:', e);
        return false;
    }
}

/**
 * 搜索设备
 * @param {Array} data - 设备数据数组
 * @param {Function} loadTableData - 重新加载表格的函数
 * @returns {Promise}
 */
async function searchDeviceCommon(data, loadTableData) {
    const searchTerm = await showPrompt('请输入搜索关键词（设备名称/分类/型号）', '搜索关键词', '搜索设备');
    if (!searchTerm) return;
    
    showLoading('正在搜索...');
    
    try {
        const term = searchTerm.toLowerCase().trim();
        const filteredData = data.filter(item => 
            item.name.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term) ||
            item.model.toLowerCase().includes(term)
        );
        
        if (filteredData.length === 0) {
            hideLoading();
            showAlert(`未找到包含 "${searchTerm}" 的设备`, '搜索结果');
            return;
        }
        
        // 临时替换数据数组进行搜索结果展示
        const originalData = data;
        data.length = 0;
        data.push(...filteredData);
        
        loadTableData();
        hideLoading();
        showSuccessToast(`找到 ${filteredData.length} 条匹配结果`);
        
        // 恢复原始数据（用户刷新页面时会加载原始数据）
        setTimeout(() => {
            data.length = 0;
            data.push(...originalData);
        }, 100);
    } catch (error) {
        hideLoading();
        showErrorToast('搜索失败，请重试');
        console.error('搜索失败:', error);
    }
}

// ==================== 历史记录管理 ====================

/**
 * 显示历史记录
 * @param {string} historyStorageKey - 历史记录存储键
 */
function showHistoryCommon(historyStorageKey) {
    const container = document.getElementById('historyContainer');
    const tableBody = document.getElementById('historyTableBody');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        tableBody.innerHTML = '';
        
        // 重新加载历史记录数据
        let savedHistory;
        try {
            savedHistory = JSON.parse(localStorage.getItem(historyStorageKey)) || [];
        } catch (e) {
            console.error('加载历史记录失败:', e);
            savedHistory = [];
        }
        
        if (savedHistory.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">暂无历史记录</td></tr>';
            return;
        }
        
        savedHistory.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.type}</td>
                <td>${record.deviceName}</td>
                <td>${record.timestamp}</td>
                <td>${record.inspector || ''}</td>
                <td>${record.details}</td>
            `;
            tableBody.appendChild(row);
        });
        
        // 移除现有的清空按钮（如果有）
        const existingButton = container.querySelector('button[onclick="clearHistory"]');
        if (existingButton) {
            existingButton.remove();
        }
        
        // 添加清空按钮
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '清空历史记录';
        clearBtn.style.marginTop = '10px';
        clearBtn.style.backgroundColor = '#e74c3c';
        clearBtn.style.color = 'white';
        clearBtn.style.border = 'none';
        clearBtn.style.padding = '8px 16px';
        clearBtn.style.borderRadius = '4px';
        clearBtn.style.cursor = 'pointer';
        clearBtn.onclick = () => clearHistoryCommon(historyStorageKey);
        container.appendChild(clearBtn);
    } else {
        container.style.display = 'none';
    }
}

/**
 * 清空历史记录
 * @param {string} historyStorageKey - 历史记录存储键
 * @returns {Promise}
 */
async function clearHistoryCommon(historyStorageKey) {
    const confirmed = await showConfirm('确定要清空所有历史记录吗？', '确认清空');
    if (confirmed) {
        localStorage.removeItem(historyStorageKey);
        showHistoryCommon(historyStorageKey);
        showSuccessToast('历史记录已清空');
    }
}

// ==================== Excel 导入导出 ====================

/**
 * 导出数据到 Excel
 * @param {Array} data - 设备数据数组
 * @param {string} fileName - 文件名
 */
function exportToExcelCommon(data, fileName = '设备数据.xlsx') {
    if (data.length === 0) {
        showAlert('没有可导出的数据', '导出提示');
        return;
    }
    
    showLoading('正在导出 Excel...');
    
    try {
        const exportData = data.map(item => ({
            '设备名称': item.name,
            '设备分类': item.category,
            '设备型号': item.model,
            '检查内容': item.checkContent || '',
            '检查方法': item.checkMethod || '',
            '标准要求': item.standardRequirement || '',
            '检修周期 (天)': item.repairCycle,
            '上次检修时间': item.lastRepairDate,
            '检查人': item.inspector || ''
        }));
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '设备数据');
        XLSX.writeFile(wb, fileName);
        
        hideLoading();
        showSuccessToast('Excel 导出成功！');
    } catch (error) {
        hideLoading();
        showErrorToast('导出失败，请重试');
        console.error('导出失败:', error);
    }
}

/**
 * 从 Excel 导入数据
 * @param {Array} data - 设备数据数组（会被清空并填充新数据）
 * @param {string} storageKey - 数据存储键
 * @param {Function} loadTableData - 重新加载表格的函数
 * @returns {Promise}
 */
async function importFromExcelCommon(data, storageKey, loadTableData) {
    const confirmed = await showConfirm('导入将清空现有数据，确定要继续吗？', '确认导入');
    if (!confirmed) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        showLoading('正在导入数据...');
        
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const fileData = new Uint8Array(e.target.result);
                const workbook = XLSX.read(fileData, {type: 'array'});
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                if (jsonData.length > 0) {
                    data.length = 0; // 清空现有数据
                    jsonData.forEach(row => {
                        data.push({
                            name: row['设备名称'] || '',
                            category: row['设备分类'] || '',
                            model: row['设备型号'] || '',
                            checkContent: row['检查内容'] || '',
                            checkMethod: row['检查方法'] || '',
                            standardRequirement: row['标准要求'] || '',
                            repairCycle: parseInt(row['检修周期 (天)']) || 30,
                            lastRepairDate: row['上次检修时间'] || new Date().toISOString().split('T')[0],
                            inspector: row['检查人'] || ''
                        });
                    });
                    
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    loadTableData();
                    hideLoading();
                    showSuccessToast(`成功导入 ${jsonData.length} 条设备数据`);
                } else {
                    hideLoading();
                    showAlert('Excel 文件中没有数据', '导入提示');
                }
            } catch (error) {
                hideLoading();
                showErrorToast('导入失败，请检查文件格式');
                console.error('导入失败:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    };
    
    input.click();
}

// ==================== 登录状态管理 ====================

/**
 * 检查登录状态
 * @returns {boolean} 是否已登录
 */
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * 退出登录
 */
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

/**
 * 设置退出按钮
 */
function setupLogoutButton() {
    const logoutBtn = document.querySelector('button[onclick="window.location.href=\'login.html\'"]');
    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }
}

// ==================== 表格渲染函数 ====================

/**
 * 加载表格数据
 * @param {Array} data - 设备数据数组
 * @param {string} tableName - 表格 body 的 ID
 * @param {Function} handleInspection - 检修处理函数
 * @param {Function} handleDelete - 删除处理函数
 * @param {boolean} isAdmin - 是否是管理员
 */
function loadTableDataCommon(data, tableName, handleInspection, handleDelete, isAdmin = false) {
    const tableBody = document.getElementById(tableName);
    const today = new Date();
    
    // 先对数据进行排序，到期设备排在前面
    const sortedData = [...data].sort((a, b) => {
        const aLastRepairDate = a.lastRepairDate ? new Date(a.lastRepairDate) : new Date();
        const aNextRepairDate = calculateNextInspectionDate(aLastRepairDate, a.repairCycle);
        const aReminderDate = new Date(aNextRepairDate);
        aReminderDate.setDate(aNextRepairDate.getDate() - 2);
        const aDaysUntilReminder = Math.floor((aReminderDate - today) / (1000 * 60 * 60 * 24));
        
        const bLastRepairDate = b.lastRepairDate ? new Date(b.lastRepairDate) : new Date();
        const bNextRepairDate = calculateNextInspectionDate(bLastRepairDate, b.repairCycle);
        const bReminderDate = new Date(bNextRepairDate);
        bReminderDate.setDate(bNextRepairDate.getDate() - 2);
        const bDaysUntilReminder = Math.floor((bReminderDate - today) / (1000 * 60 * 60 * 24));
        
        return aDaysUntilReminder - bDaysUntilReminder;
    });
    
    tableBody.innerHTML = '';
    
    sortedData.forEach((item, sortedIndex) => {
        // 找到在原始data数组中的索引
        const originalIndex = data.findIndex(d => d.name === item.name && d.model === item.model);
        const lastRepairDate = item.lastRepairDate && !isNaN(new Date(item.lastRepairDate)) ? new Date(item.lastRepairDate) : new Date();
        const nextRepairDate = calculateNextInspectionDate(lastRepairDate, item.repairCycle);
        const reminderDate = new Date(nextRepairDate);
        reminderDate.setDate(nextRepairDate.getDate() - 2);
        const daysUntilReminder = Math.floor((reminderDate - today) / (1000 * 60 * 60 * 24));
        const nextRepairDateStr = nextRepairDate && !isNaN(nextRepairDate) ? nextRepairDate.toISOString().split('T')[0] : '';
        const reminderDateStr = reminderDate && !isNaN(reminderDate) ? reminderDate.toISOString().split('T')[0] : '';
        
        const row = document.createElement('tr');
        
        // 创建单元格
        const cells = [
            { text: sortedIndex + 1 },
            { text: item.name, editable: isAdmin },
            { text: item.category, editable: isAdmin },
            { text: item.model, editable: isAdmin },
            { text: item.checkContent || '', editable: isAdmin },
            { text: item.checkMethod || '', editable: isAdmin },
            { text: item.standardRequirement || '', editable: isAdmin },
            { text: item.repairCycle, editable: isAdmin },
            { text: item.lastRepairDate, editable: isAdmin },
            { text: nextRepairDateStr },
            { text: reminderDateStr, highlight: daysUntilReminder <= 0 },
            { text: daysUntilReminder <= 0 ? '检修到期' : '待检修' }
        ];
        
        cells.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData.text;
            if (cellData.editable) {
                cell.setAttribute('contenteditable', 'true');
            }
            if (cellData.highlight) {
                cell.className = 'highlight';
            }
            row.appendChild(cell);
        });
        
        // 添加检修按钮
        const inspectCell = document.createElement('td');
        const inspectBtn = document.createElement('button');
        inspectBtn.textContent = '一键检修';
        inspectBtn.onclick = () => handleInspection(originalIndex);
        inspectCell.appendChild(inspectBtn);
        row.appendChild(inspectCell);
        
        // 添加检查人单元格
        const inspectorCell = document.createElement('td');
        inspectorCell.textContent = item.inspector || '';
        row.appendChild(inspectorCell);
        
        // 添加删除按钮
        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.style.backgroundColor = '#e74c3c';
        deleteBtn.style.color = 'white';
        deleteBtn.onclick = () => handleDelete(String(originalIndex + 1));
        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);
        
        tableBody.appendChild(row);
    });
}