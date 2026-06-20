// ========== Chat Input Toggle ==========
function toggleChatInput() {
    const chatInputArea = document.getElementById('chatInputArea');
    const chatInputToggle = document.getElementById('chatInputToggle');
    if (!chatInputArea || !chatInputToggle) return;

    const isCollapsed = chatInputArea.classList.toggle('collapsed');
    chatInputToggle.classList.toggle('collapsed', isCollapsed);

    // 保存用户偏好到 localStorage
    localStorage.setItem('chatInputCollapsed', isCollapsed ? '1' : '0');
}

// 页面加载时恢复输入区折叠状态
function initChatInputToggle() {
    const chatInputArea = document.getElementById('chatInputArea');
    const chatInputToggle = document.getElementById('chatInputToggle');
    if (!chatInputArea || !chatInputToggle) return;

    const saved = localStorage.getItem('chatInputCollapsed');
    if (saved === '1') {
        chatInputArea.classList.add('collapsed');
        chatInputToggle.classList.add('collapsed');
    }
}

// ========== Role Selection ==========
function selectRole(role) {
    state.role = role;
    document.getElementById('rolePage').classList.add('hidden');
    document.getElementById('appContainer').classList.add('active');
    updateUIForRole();
    showToast('success', `已切换到${role === 'student' ? '学生' : '工作者'}模式`);
}

function switchRole() {
    document.getElementById('appContainer').classList.remove('active');
    document.getElementById('rolePage').classList.remove('hidden');
    state.role = null;
}

function updateUIForRole() {
    const badge = document.getElementById('roleBadge');
    const subjectsLabel = document.getElementById('subjectsLabel');
    const navChatLabel = document.getElementById('navChatLabel');
    const navErrorsLabel = document.getElementById('navErrorsLabel');
    const chatTitle = document.getElementById('chatTitle');
    const chatSubtitle = document.getElementById('chatSubtitle');

    if (state.role === 'student') {
        badge.innerHTML = '<i class="fas fa-graduation-cap"></i><span>学生模式</span>';
        // 只更新文字，保留添加按钮
        const labelTextNode = subjectsLabel.childNodes[0];
        if (labelTextNode) labelTextNode.textContent = '我的科目';
        navChatLabel.textContent = 'AI问答';
        navErrorsLabel.textContent = '错题本';
        chatTitle.textContent = 'AI 学习助手';
        chatSubtitle.textContent = '上传截图或输入题目，AI帮你分析解题思路';
        document.querySelector('.nav-item[data-page="errors"]').style.display = 'flex';
    } else {
        badge.innerHTML = '<i class="fas fa-briefcase"></i><span>工作者模式</span>';
        const labelTextNode = subjectsLabel.childNodes[0];
        if (labelTextNode) labelTextNode.textContent = '我的功能';
        navChatLabel.textContent = 'AI助手';
        navErrorsLabel.textContent = '错题本';
        chatTitle.textContent = 'AI 工作助手';
        chatSubtitle.textContent = '上传文件或描述需求，AI辅助你高效完成工作';
        document.querySelector('.nav-item[data-page="errors"]').style.display = 'none';
    }

    state.currentSubject = null;
    renderSubjects();
    switchPage('chat');
}

// ========== Subjects / Projects Rendering ==========
function renderSubjects() {
    const items = state.role === 'student' ? state.subjects : state.projects;

    // 更新添加按钮标题
    const addBtn = document.getElementById('addSubjectBtnInline');
    if (addBtn) {
        addBtn.title = '添加' + (state.role === 'student' ? '科目' : '项目');
    }

    if (state.role === 'student') {
        // 学生模式：分为默认科目和自建科目两行
        const defaultSlider = document.getElementById('defaultSubjectsSlider');
        const customSlider = document.getElementById('customSubjectsSlider');

        const defaults = state.subjects.filter(s => s.isDefault);
        const customs = state.subjects.filter(s => !s.isDefault);

        defaultSlider.innerHTML = defaults.map(s => {
            const count = s.errors ? s.errors.length : 0;
            const isActive = state.currentSubject === s.id;
            return `
                <button class="subject-btn ${isActive ? 'active' : ''}" onclick="selectSubject('${s.id}')">
                    <span>${s.icon}</span>
                    <span>${s.name}</span>
                    ${count > 0 ? `<span class="count">${count}</span>` : ''}
                </button>
            `;
        }).join('');

        if (customs.length > 0) {
            customSlider.innerHTML = customs.map(s => {
                const count = s.errors ? s.errors.length : 0;
                const isActive = state.currentSubject === s.id;
                return `
                    <button class="subject-btn ${isActive ? 'active' : ''}" onclick="selectSubject('${s.id}')">
                        <span>${s.icon}</span>
                        <span>${s.name}</span>
                        ${count > 0 ? `<span class="count">${count}</span>` : ''}
                    </button>
                `;
            }).join('');
            customSlider.closest('.subjects-category').style.display = '';
        } else {
            customSlider.closest('.subjects-category').style.display = 'none';
        }

        // 显示默认科目和自建科目的分类标签
        document.querySelectorAll('.subjects-category').forEach(el => {
            el.style.display = '';
        });
        if (customs.length === 0) {
            const customCategory = customSlider.closest('.subjects-category');
            if (customCategory) customCategory.style.display = 'none';
        }
    } else {
        // 工作者模式：使用默认科目slider显示项目
        const defaultSlider = document.getElementById('defaultSubjectsSlider');
        const customSlider = document.getElementById('customSubjectsSlider');

        defaultSlider.innerHTML = items.map(item => {
            const isActive = state.currentSubject === item.id;
            return `
                <button class="subject-btn ${isActive ? 'active' : ''}" onclick="selectSubject('${item.id}')">
                    <span>${item.icon}</span>
                    <span>${item.name}</span>
                </button>
            `;
        }).join('');

        // 工作者模式隐藏分类标签和自建科目行
        document.querySelectorAll('.subjects-category-label').forEach(el => {
            el.style.display = 'none';
        });
        if (customSlider) {
            const customCategory = customSlider.closest('.subjects-category');
            if (customCategory) customCategory.style.display = 'none';
        }
    }

    // 渲染咨询栏目
    let consultSlider = document.getElementById('consultSlider');
    if (!consultSlider) {
        // 首次创建咨询区域
        const subjectsSection = document.querySelector('.subjects-section');
        const consultDiv = document.createElement('div');
        consultDiv.className = 'consult-section';
        consultDiv.id = 'consultSection';
        consultDiv.innerHTML = `
            <div class="subjects-label">咨询</div>
            <div class="subjects-slider-wrapper">
                <div class="subjects-slider" id="consultSlider"></div>
            </div>
        `;
        subjectsSection.parentNode.insertBefore(consultDiv, subjectsSection.nextSibling);
        consultSlider = document.getElementById('consultSlider');
    }

    if (state.consultations && state.consultations.length > 0) {
        let chtml = '';
        state.consultations.forEach((item) => {
            const isActive = state.currentSubject === item.id;
            chtml += `
                <button class="subject-btn ${isActive ? 'active' : ''}" onclick="selectSubject('${item.id}')">
                    <span>${item.icon}</span>
                    <span>${item.name}</span>
                </button>
            `;
        });
        consultSlider.innerHTML = chtml;
        document.getElementById('consultSection').style.display = '';
    }
}

function selectSubject(id) {
    // Clear quiz state when switching subjects to prevent cross-conversation issues
    currentQuiz = null;
    lastAIPrompt = null;

    // 如果重复选择当前科目/项目，则退出回到基本AI对话
    if (state.currentSubject === id) {
        state.currentSubject = null;
        renderSubjects();
        // 重置为通用AI对话界面
        const chatTitle = document.getElementById('chatTitle');
        const chatSubtitle = document.getElementById('chatSubtitle');
        const questionInput = document.getElementById('questionInput');
        if (state.role === 'student') {
            chatTitle.textContent = 'AI 学习助手';
            chatSubtitle.textContent = '直接输入问题，AI会自动识别科目并回答';
            questionInput.placeholder = '输入你的问题，AI会自动识别科目...\n\n例如：求解方程 x² + 3x - 4 = 0\n例如：翻译 "Hello world"\n例如：分析《静夜思》的写作手法';
        } else {
            chatTitle.textContent = 'AI 工作助手';
            chatSubtitle.textContent = '描述你的工作需求，AI会智能匹配项目类型';
            questionInput.placeholder = '输入你的工作需求...\n\n例如：帮我制作一份项目汇报PPT';
        }
        switchPage('chat');
        renderChatHistory();
        showToast('success', '已退出当前科目，进入通用AI对话模式');
        return;
    }

    state.currentSubject = id;
    renderSubjects();

    const items = state.role === 'student' ? state.subjects : state.projects;
    let item = items.find(i => i.id === id);
    if (!item && state.consultations) {
        item = state.consultations.find(i => i.id === id);
    }

    const aiOnlyIds = ['law', 'mental', 'funcounsel'];
    if (state.role === 'worker' && item && item.type !== 'files' && !aiOnlyIds.includes(id)) {
        renderProjectDetail(item);
        switchPage('project');
    } else {
        // Update chat title
        const chatTitle = document.getElementById('chatTitle');
        const chatSubtitle = document.getElementById('chatSubtitle');
        const questionInput = document.getElementById('questionInput');
        if (state.role === 'student') {
            chatTitle.textContent = `${item.icon} ${item.name} · AI助手`;
            chatSubtitle.textContent = `在${item.name}科目下提问，AI帮你分析解题思路`;
            // Update placeholder based on subject
            const examples = {
                'math': '例如：求解方程 x² + 3x - 4 = 0 的根',
                'english': '例如：分析这个句子的语法结构',
                'chinese': '例如：分析《岳阳楼记》的写作手法',
                'biology': '例如：光合作用的化学方程式是什么？',
                'chemistry': '例如：如何配平化学方程式？',
                'history': '例如：中国朝代的先后顺序是什么？',
                'politics': '例如：社会主义核心价值观的内容是什么？',
                'physics': '例如：牛顿第二定律的公式是什么？',
                'law': '例如：劳动法中关于试用期的规定是什么？',
                'mental': '例如：考试焦虑应该怎么缓解？'
            };
            const customExample = item.id.startsWith('custom_') ? `例如：在${item.name}科目下提问...` : null;
            questionInput.placeholder = `输入你的问题或粘贴题目内容...\n\n${customExample || examples[item.id] || '例如：求解这道题的详细步骤'}`;
        } else {
            chatTitle.textContent = `${item.icon} ${item.name}`;
            chatSubtitle.textContent = '上传文件或描述需求，AI辅助你高效完成工作';
            questionInput.placeholder = '输入你的需求或描述工作内容...\n\n例如：帮我整理这份项目文档的要点';
        }
        switchPage('chat');
        renderChatHistory();
    }

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
}

// ========== Page Switching ==========
function switchPage(page) {
    state.currentPage = page;
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    if (page === 'errors') renderErrors();
    if (page === 'notepad') renderNotes();
    if (page === 'chat') renderChatHistory();
    if (page === 'settings') loadSettings();
    if (page === 'stats') renderStats();
    if (page === 'flashcards') {
        if (typeof updateErrorCount === 'function') updateErrorCount();
    }
}

// ========== Input Tab Switching ==========
function switchInputTab(tab) {
    state.inputTab = tab;
    document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.input-tab').classList.add('active');

    var textWrapper = document.getElementById('textInputWrapper');
    var imageArea = document.getElementById('imageUploadArea');
    if (tab === 'text') {
        if (textWrapper) textWrapper.style.display = 'block';
        if (imageArea) { imageArea.style.display = 'none'; imageArea.classList.remove('active'); }
    } else if (tab === 'image') {
        if (textWrapper) textWrapper.style.display = 'none';
        if (imageArea) { imageArea.style.display = 'block'; imageArea.classList.add('active'); }
    } else if (tab === 'screenshot') {
        if (textWrapper) textWrapper.style.display = 'block';
        if (imageArea) { imageArea.style.display = 'none'; imageArea.classList.remove('active'); }
        showToast('info', '请使用系统截图工具（Ctrl+Shift+S / Cmd+Shift+S）截取题目，然后粘贴到输入框或点击上传');
    }
}

// ========== Document File Upload ==========
function handleDocFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const content = ev.target.result;
        const fileName = file.name;
        // 切换到聊天页面，将文件内容作为问题发送
        switchPage('chat');
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            const ext = fileName.split('.').pop().toLowerCase();
            let prefix = '';
            if (['csv', 'json'].includes(ext)) {
                prefix = '请帮我分析以下' + ext.toUpperCase() + '文件数据：\n';
            } else if (['txt', 'md'].includes(ext)) {
                prefix = '请帮我阅读并总结以下文档内容：\n';
            } else if (['html', 'css', 'js', 'py'].includes(ext)) {
                prefix = '请帮我审查以下代码：\n';
            } else {
                prefix = '请帮我处理以下文件（' + fileName + '）：\n';
            }
            chatInput.value = prefix + content.substring(0, 3000);
            if (content.length > 3000) {
                chatInput.value += '\n\n[文件内容过长，仅显示前3000字符]';
            }
            chatInput.focus();
        }
        showToast('success', '文件"' + fileName + '"已加载，可在输入框中编辑后发送');
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ========== Image Upload ==========
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
        state.uploadedImage = ev.target.result;
        document.getElementById('previewImg').src = ev.target.result;
        document.getElementById('imagePreview').classList.add('active');
        // 隐藏文件input，避免遮挡预览图片和删除按钮
        const imageInput = document.getElementById('imageInput');
        if (imageInput) imageInput.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    state.uploadedImage = null;
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.value = '';
        imageInput.style.display = '';
    }
    document.getElementById('imagePreview').classList.remove('active');
}

// ========== Document Editor ==========
function openDocumentEditor() {
    switchPage('docEditor');
    const saved = localStorage.getItem('docEditorContent');
    if (saved) {
        document.getElementById('docEditorContent').innerHTML = saved;
    }
}

function toggleDocAI() {
    const panel = document.getElementById('docAIPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

function checkDocErrors() {
    const content = document.getElementById('docEditorContent').textContent;
    const errors = [];
    const commonErrors = [
        ['的地得', '的→地（副词前）的→得（动词后）'],
        ['已以', '已（完成）以（将来）'],
        ['在再', '在（存在）再（重复）'],
        ['做作', '做（动作）作（抽象）'],
        ['哪那', '哪（疑问）那（指示）'],
        ['带戴', '带（携带）戴（穿戴）'],
        ['反应反映', '反应（回应）反映（映射）'],
        ['必须必需', '必须（一定要）必需（不可缺少）'],
        ['截止截至', '截止（停止）截至（到某个时间）'],
        ['制定制订', '制定（创制）制订（起草）'],
        ['启示启事', '启示（启发）启事（公告）'],
        ['权力权利', '权力（控制力）权利（权益）'],
        ['功夫工夫', '功夫（技能）工夫（时间）'],
        ['交代交待', '交代（说明）'],
        ['像象', '像（相似）象（形象）']
    ];
    commonErrors.forEach(([pair, hint]) => {
        for (let i = 0; i < pair.length - 1; i++) {
            if (content.includes(pair[i])) {
                errors.push(hint);
            }
        }
    });
    if (errors.length > 0) {
        showToast('info', '发现可能的问题：' + errors.join('；'));
    } else {
        showToast('info', '文档检查完成，未发现明显错别字');
    }
}

function formatDoc(type) {
    document.execCommand(type === 'heading' ? 'formatBlock' : type, false, type === 'heading' ? 'h2' : null);
}

function saveDocument() {
    const content = document.getElementById('docEditorContent').innerHTML;
    localStorage.setItem('docEditorContent', content);
    showToast('success', '文档已保存');
}

function sendDocAI() {
    const input = document.getElementById('docAIInput');
    const panel = document.getElementById('docAIPanel');
    if (!input || !panel) return;
    const question = input.value.trim();
    if (!question) return;

    // 添加用户消息到面板
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'padding:8px;margin:4px 0;background:var(--primary);color:#fff;border-radius:8px;font-size:13px;';
    userMsg.textContent = question;
    panel.appendChild(userMsg);

    input.value = '';

    // 调用AI回复
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.style.cssText = 'padding:8px;margin:4px 0;background:var(--bg-secondary);border-radius:8px;font-size:13px;line-height:1.6;';
        let response = '';
        if (typeof generateWorkerResponse === 'function') {
            response = generateWorkerResponse(question, 'writing');
        } else if (typeof generateAIResponse === 'function') {
            response = generateAIResponse(question);
        } else {
            response = 'AI助手暂时不可用，请稍后再试。';
        }
        aiMsg.innerHTML = response;
        panel.appendChild(aiMsg);
        panel.scrollTop = panel.scrollHeight;
    }, 500);
}

// ========== Spreadsheet Editor ==========
function openSpreadsheetEditor() { switchPage('spreadsheet'); }

function getSpreadsheetTable() {
    return document.getElementById('spreadsheetTable');
}

function addSpreadsheetRow() {
    const table = getSpreadsheetTable();
    if (!table) return;
    const tbody = table.querySelector('tbody');
    const colCount = table.querySelector('thead tr').children.length - 1;
    const rowNum = tbody.children.length + 1;
    let html = '<tr><th>' + rowNum + '</th>';
    for (let i = 0; i < colCount; i++) {
        html += '<td contenteditable="true"></td>';
    }
    html += '</tr>';
    tbody.insertAdjacentHTML('beforeend', html);
    showToast('success', '已添加一行');
}

function addSpreadsheetCol() {
    const table = getSpreadsheetTable();
    if (!table) return;
    const theadRow = table.querySelector('thead tr');
    const colCount = theadRow.children.length - 1;
    const colLetter = String.fromCharCode(65 + colCount);
    const th = document.createElement('th');
    th.textContent = colLetter;
    theadRow.appendChild(th);
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        row.appendChild(td);
    });
    showToast('success', '已添加一列');
}

function deleteSpreadsheetRow() {
    const table = getSpreadsheetTable();
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (tbody.children.length <= 1) {
        showToast('warning', '至少保留一行');
        return;
    }
    tbody.removeChild(tbody.lastElementChild);
    showToast('success', '已删除最后一行');
}

function deleteSpreadsheetCol() {
    const table = getSpreadsheetTable();
    if (!table) return;
    const theadRow = table.querySelector('thead tr');
    if (theadRow.children.length <= 2) {
        showToast('warning', '至少保留一列');
        return;
    }
    theadRow.removeChild(theadRow.lastElementChild);
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.children.length > 1) {
            row.removeChild(row.lastElementChild);
        }
    });
    showToast('success', '已删除最后一列');
}

function saveSpreadsheet() {
    const table = getSpreadsheetTable();
    if (!table) return;
    const data = [];
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => rowData.push(cell.textContent));
        data.push(rowData);
    });
    localStorage.setItem('spreadsheetData', JSON.stringify(data));
    showToast('success', '表格已保存');
}

function exportSpreadsheetCSV() {
    const table = getSpreadsheetTable();
    if (!table) return;
    let csv = '';
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const values = [];
        cells.forEach(cell => {
            let val = cell.textContent.replace(/"/g, '""');
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                val = '"' + val + '"';
            }
            values.push(val);
        });
        csv += values.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'CSV已导出');
}

function loadSpreadsheet() {
    const saved = localStorage.getItem('spreadsheetData');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        const table = getSpreadsheetTable();
        if (!table) return;
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach((rowData, idx) => {
            let html = '<tr><th>' + (idx + 1) + '</th>';
            rowData.forEach(val => {
                html += '<td contenteditable="true">' + escapeHtml(val) + '</td>';
            });
            html += '</tr>';
            tbody.insertAdjacentHTML('beforeend', html);
        });
    } catch (e) {
        console.error('Load spreadsheet failed', e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initChatInputToggle();
    loadSpreadsheet();
    // 绑定文档上传事件
    const docFileInput = document.getElementById('docFileInput');
    if (docFileInput) docFileInput.addEventListener('change', handleDocFileUpload);
});
