// ========== Subject Stats Tracking ==========

function showSubjectStats() {
    switchPage('stats');
}

function renderStats() {
    const container = document.getElementById('statsContent');
    if (!container) return;

    const items = state.role === 'student' ? state.subjects : state.projects;
    const allStats = state.learningStats || {};

    // Calculate totals
    let totalQuestions = 0;
    let subjectData = [];

    items.forEach(item => {
        const stats = allStats[item.id];
        let subjectTotal = 0;
        let dates = [];

        if (stats) {
            for (const [date, dayData] of Object.entries(stats)) {
                subjectTotal += dayData.count || 0;
                dates.push({ date, count: dayData.count, entries: dayData.entries || [] });
            }
            dates.sort((a, b) => b.date.localeCompare(a.date));
        }

        totalQuestions += subjectTotal;
        if (subjectTotal > 0) {
            subjectData.push({ id: item.id, name: item.name, icon: item.icon, total: subjectTotal, dates });
        }
    });

    if (subjectData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <p>暂无学习记录</p>
                <p style="font-size:12px;margin-top:8px;">开始提问后，这里会显示你的学习统计</p>
            </div>
        `;
        return;
    }

    subjectData.sort((a, b) => b.total - a.total);

    let html = `
        <div class="stats-overview">
            <div class="stats-total-card">
                <div class="stats-total-num">${totalQuestions}</div>
                <div class="stats-total-label">总提问次数</div>
            </div>
            <div class="stats-total-card">
                <div class="stats-total-num">${subjectData.length}</div>
                <div class="stats-total-label">活跃科目</div>
            </div>
        </div>
    `;

    subjectData.forEach(subject => {
        html += `
            <div class="stats-subject-card">
                <div class="stats-subject-header">
                    <div class="stats-subject-info">
                        <span class="stats-subject-icon">${subject.icon}</span>
                        <span class="stats-subject-name">${subject.name}</span>
                    </div>
                    <div class="stats-subject-total">${subject.total} 次</div>
                </div>
                <div class="stats-dates">
        `;

        subject.dates.forEach(day => {
            html += `
                <div class="stats-date-group">
                    <div class="stats-date-header">
                        <span class="stats-date-label">${day.date}</span>
                        <span class="stats-date-count">${day.count} 次</span>
                    </div>
                    <div class="stats-entries">
            `;

            day.entries.forEach((entry, idx) => {
                const qText = (entry.q || '无问题').substring(0, 40) + ((entry.q || '').length > 40 ? '...' : '');
                html += `
                    <div class="stats-entry" onclick="scrollToMessage('${entry.msgId || ''}')">
                        <span class="stats-entry-time">${entry.time || ''}</span>
                        <span class="stats-entry-q" title="${escapeHtml(entry.q || '')}">${escapeHtml(qText)}</span>
                        <i class="fas fa-arrow-right stats-entry-arrow"></i>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function scrollToMessage(msgId) {
    if (!msgId) return;
    // Switch to chat page first
    switchPage('chat');
    // Find and scroll to the message
    setTimeout(() => {
        const msgEl = document.querySelector(`[data-msg-id="${msgId}"]`);
        if (msgEl) {
            msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            msgEl.style.background = 'rgba(108,92,231,0.15)';
            msgEl.style.borderRadius = 'var(--radius-sm)';
            msgEl.style.transition = 'background 0.5s ease';
            setTimeout(() => { msgEl.style.background = ''; }, 2000);
        } else {
            showToast('info', '该消息可能在当前科目切换后被清空');
        }
    }, 300);
}

function clearAllStats() {
    if (!confirm('确定要清除所有学习统计数据吗？此操作不可恢复。')) return;
    state.learningStats = {};
    const items = state.role === 'student' ? state.subjects : state.projects;
    items.forEach(item => {
        StorageManager.saveStats(item.id, {});
    });
    renderStats();
    showToast('success', '学习统计已清除');
}
