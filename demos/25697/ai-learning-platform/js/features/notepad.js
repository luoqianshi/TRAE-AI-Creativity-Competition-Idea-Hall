// ========== Notepad ==========
function toggleAddNote() {
    const form = document.getElementById('addNoteForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function toggleReminderOptions() {
    const check = document.getElementById('noteReminderCheck');
    const options = document.getElementById('reminderOptions');
    if (check.checked) {
        options.classList.add('active');
    } else {
        options.classList.remove('active');
    }
}

function selectReminderType(btn, type) {
    document.querySelectorAll('.reminder-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedReminderType = type;
}

function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const hasReminder = document.getElementById('noteReminderCheck').checked;

    if (!title) {
        showToast('warning', '请输入笔记标题');
        return;
    }

    if (!content) {
        showToast('warning', '请输入笔记内容');
        return;
    }

    const note = {
        id: Date.now(),
        title,
        content,
        hasReminder,
        reminderDate: hasReminder ? document.getElementById('reminderDate').value : null,
        reminderTime: hasReminder ? document.getElementById('reminderTime').value : null,
        reminderType: hasReminder ? state.selectedReminderType : null,
        loginReminder: hasReminder ? document.getElementById('loginReminderCheck').checked : false,
        isImportant: false, // 默认非重要笔记
        createdAt: new Date().toLocaleString('zh-CN'),
        notified: false
    };

    state.notes.push(note);
    StorageManager.saveNotes(state.notes);

    // Reset form
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteReminderCheck').checked = false;
    document.getElementById('loginReminderCheck').checked = false;
    document.getElementById('reminderOptions').classList.remove('active');
    toggleAddNote();

    renderNotes();
    showToast('success', hasReminder ? '笔记已保存，将在指定时间提醒' : '笔记已保存');
}

function switchNoteTab(tab) {
    state.currentNoteFilter = tab;
    document.querySelectorAll('.notepad-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.notepad-tab').classList.add('active');
    renderNotes();
}

function renderNotes() {
    const container = document.getElementById('notepadList');
    let filtered = state.notes;

    if (state.currentNoteFilter === 'reminder') {
        filtered = state.notes.filter(n => n.hasReminder);
    } else if (state.currentNoteFilter === 'normal') {
        filtered = state.notes.filter(n => !n.hasReminder);
    } else if (state.currentNoteFilter === 'important') {
        filtered = state.notes.filter(n => n.isImportant);
    }

    // Update counts
    document.getElementById('allNoteCount').textContent = state.notes.length;
    document.getElementById('reminderNoteCount').textContent = state.notes.filter(n => n.hasReminder).length;
    document.getElementById('normalNoteCount').textContent = state.notes.filter(n => !n.hasReminder).length;
    document.getElementById('importantNoteCount').textContent = state.notes.filter(n => n.isImportant).length;

    // Update reminder badge
    const reminderBadge = document.getElementById('noteReminderCount');
    const activeReminders = state.notes.filter(n => n.hasReminder && !n.notified).length;
    if (activeReminders > 0) {
        reminderBadge.style.display = 'inline';
        reminderBadge.textContent = activeReminders;
    } else {
        reminderBadge.style.display = 'none';
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <p>暂无笔记</p>
                <p style="font-size:12px;margin-top:8px;">点击"新建笔记"开始记录</p>
            </div>
        `;
        return;
    }

    let html = '';
    filtered.forEach(note => {
        html += `
            <div class="note-card ${note.isImportant ? 'important' : ''}">
                <div class="note-card-header">
                    <h3>${note.isImportant ? '<i class="fas fa-star" style="color:var(--warning);margin-right:6px;"></i>' : ''}${escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        ${note.hasReminder ? `<span class="reminder-tag"><i class="fas fa-bell"></i> ${note.reminderType}</span>` : ''}
                        <button onclick="toggleNoteImportant(${note.id})" class="note-important-btn ${note.isImportant ? 'active' : ''}" title="${note.isImportant ? '取消重要' : '标为重要'}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button onclick="deleteNote(${note.id})" class="delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="note-card-body">${escapeHtml(note.content)}</div>
                <div class="note-card-meta">
                    <span><i class="fas fa-clock"></i> ${note.createdAt}</span>
                    ${note.hasReminder && note.reminderDate ? `
                        <span class="reminder-time"><i class="fas fa-bell"></i> ${note.reminderDate} ${note.reminderTime || ''}</span>
                    ` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleNoteImportant(id) {
    const note = state.notes.find(n => n.id === id);
    if (note) {
        note.isImportant = !note.isImportant;
        StorageManager.saveNotes(state.notes);
        renderNotes();
        showToast('success', note.isImportant ? '已标为重要笔记' : '已取消重要标记');
    }
}

function deleteNote(id) {
    state.notes = state.notes.filter(n => n.id !== id);
    StorageManager.saveNotes(state.notes);
    renderNotes();
    showToast('success', '笔记已删除');
}
