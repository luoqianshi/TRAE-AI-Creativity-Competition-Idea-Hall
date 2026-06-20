// ========== Error Book ==========
function saveToErrorBook(btn) {
    const question = btn.getAttribute('data-question');
    const answer = btn.getAttribute('data-answer');

    const subject = state.currentSubject;
    const items = state.role === 'student' ? state.subjects : state.projects;
    const item = items.find(i => i.id === subject);

    if (!item.errors) item.errors = [];

    const error = {
        id: Date.now(),
        question: question,
        answer: answer,
        correction: '',
        advice: '',
        subject: item.name,
        date: new Date().toLocaleDateString('zh-CN'),
        mastered: false
    };

    item.errors.push(error);
    btn.innerHTML = '<i class="fas fa-check"></i> 已保存';
    btn.disabled = true;
    btn.style.opacity = '0.6';

    updateErrorCount();
    StorageManager.saveErrors(subject, item.errors);
    showToast('success', '已保存到错题本');
}

function updateErrorCount() {
    let total = 0, mastered = 0, newToday = 0;
    const today = new Date().toLocaleDateString('zh-CN');

    // 首先尝试从 state.subjects 读取
    let hasErrorsInState = false;
    state.subjects.forEach(s => {
        if (s.errors && s.errors.length > 0) {
            hasErrorsInState = true;
        }
        if (s.errors) {
            total += s.errors.length;
            s.errors.forEach(e => {
                if (e.mastered) mastered++;
                if (e.date === today) newToday++;
            });
        }
    });

    // 如果 state.subjects 中没有错题数据，从 localStorage 直接读取备份数据
    if (total === 0) {
        const userId = state.currentUser ? state.currentUser.id : 'guest';
        state.subjects.forEach(s => {
            try {
                const key = 'user_' + userId + '_errors_' + s.id;
                const saved = localStorage.getItem(key);
                if (saved) {
                    const errors = JSON.parse(saved);
                    if (errors && errors.length > 0) {
                        total += errors.length;
                        errors.forEach(e => {
                            if (e.mastered) mastered++;
                            if (e.date === today) newToday++;
                        });
                        // 同步回 state.subjects
                        s.errors = errors;
                    }
                }
            } catch (e) { /* ignore */ }
        });
    }

    const badge = document.getElementById('errorCount');
    if (badge) badge.textContent = mastered + '/' + total + '/' + newToday;
    // Also update the error page stats
    const totalEl = document.getElementById('totalErrors');
    const masteredEl = document.getElementById('masteredErrors');
    const newEl = document.getElementById('newErrors');
    if (totalEl) totalEl.textContent = total;
    if (masteredEl) masteredEl.textContent = mastered;
    if (newEl) newEl.textContent = newToday;
}

function renderErrors() {
    const container = document.getElementById('errorCards');
    const filtersContainer = document.getElementById('errorFilters');

    // Collect all errors
    let allErrors = [];
    const subjectNames = new Set();

    state.subjects.forEach(s => {
        if (s.errors) {
            s.errors.forEach(e => {
                allErrors.push({ ...e, subjectId: s.id });
                subjectNames.add(s.name);
            });
        }
    });

    // Render filters - keep the static buttons in HTML, just update active state
    // Filter
    let filtered = allErrors;
    if (state.currentErrorFilter === 'mastered') {
        filtered = allErrors.filter(e => e.mastered);
    } else if (state.currentErrorFilter === 'unmastered') {
        filtered = allErrors.filter(e => !e.mastered);
    } else if (state.currentErrorFilter !== 'all') {
        filtered = allErrors.filter(e => e.subject === state.currentErrorFilter);
    }

    // Stats
    const today = new Date().toLocaleDateString('zh-CN');
    const newToday = allErrors.filter(e => e.date === today).length;
    document.getElementById('totalErrors').textContent = allErrors.length;
    document.getElementById('masteredErrors').textContent = allErrors.filter(e => e.mastered).length;
    const newEl = document.getElementById('newErrors');
    if (newEl) newEl.textContent = newToday;

    if (filtered.length === 0) {
        const emptyEl = document.getElementById('emptyErrors');
        if (emptyEl) emptyEl.style.display = allErrors.length === 0 ? 'block' : 'none';
        container.innerHTML = `
            <div class="empty-state" id="emptyErrors">
                <i class="fas fa-inbox"></i>
                <p>暂无错题记录</p>
                <p style="font-size:12px;margin-top:8px;">在AI问答中将问题保存为错题即可在此查看</p>
            </div>
        `;
        return;
    }

    // Hide empty state, show cards
    const emptyEl = document.getElementById('emptyErrors');
    if (emptyEl) emptyEl.style.display = 'none';

    let html = '';
    filtered.forEach(error => {
        html += `
            <div class="error-card" data-id="${error.id}">
                <div class="error-card-header">
                    <span class="subject-tag">${error.subject}</span>
                    <span class="date">${error.date}</span>
                </div>
                <div class="error-card-body">
                    <div class="error-section">
                        <div class="error-section-title error">
                            <i class="fas fa-times-circle"></i> 错误题目
                        </div>
                        <div class="error-section-content">${escapeHtml(error.question)}</div>
                    </div>
                    <div class="error-section">
                        <div class="error-section-title correction">
                            <i class="fas fa-user"></i> 你的回答
                        </div>
                        <div class="error-section-content">${escapeHtml(error.correction || '未记录')}</div>
                    </div>
                    <div class="error-card-answer" style="display:none;">
                        <div class="error-section">
                            <div class="error-section-title correction">
                                <i class="fas fa-check-circle"></i> 参考答案
                            </div>
                            <div class="error-section-content">${escapeHtml(error.answer || '未记录')}</div>
                        </div>
                        <div class="error-section">
                            <div class="error-section-title advice">
                                <i class="fas fa-lightbulb"></i> 额外建议
                            </div>
                            <div class="error-section-content">${escapeHtml(error.advice || '复习相关知识点，多做类似题目巩固。')}</div>
                        </div>
                    </div>
                </div>
                <div class="error-card-footer" style="display:flex;gap:4px;justify-content:flex-end;padding:6px 8px;">
                    <button onclick="redoError('${error.id}')" style="background:var(--primary);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;"><i class="fas fa-redo"></i> 重新做</button>
                    <button onclick="toggleMastered(${error.id})" class="${error.mastered ? '' : ''}" style="${error.mastered ? '' : 'background:var(--success);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;'}">
                        <i class="fas ${error.mastered ? 'fa-undo' : 'fa-check'}"></i> ${error.mastered ? '取消掌握' : '已掌握'}
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add double-click flip to toggle answer visibility
    container.querySelectorAll('.error-card').forEach(card => {
        card.onclick = null;
        card.ondblclick = function() {
            const answer = this.querySelector('.error-card-answer');
            if (answer) {
                answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
            }
        };
    });
}

function filterErrors(filter) {
    state.currentErrorFilter = filter;
    document.querySelectorAll('.error-filter').forEach(f => f.classList.remove('active'));
    event.target.classList.add('active');
    renderErrors();
}

function toggleMastered(id) {
    state.subjects.forEach(s => {
        if (s.errors) {
            const error = s.errors.find(e => e.id === id);
            if (error) {
                error.mastered = !error.mastered;
                StorageManager.saveErrors(s.id, s.errors);
                showToast('success', error.mastered ? '已标记为掌握' : '已取消掌握标记');
            }
        }
    });
    renderErrors();
}

function deleteError(id) {
    state.subjects.forEach(s => {
        if (s.errors) {
            s.errors = s.errors.filter(e => e.id !== id);
            StorageManager.saveErrors(s.id, s.errors);
        }
    });
    updateErrorCount();
    renderErrors();
    showToast('success', '错题已删除');
}

function editError(id) {
    const correction = prompt('输入修正方案：');
    if (correction !== null) {
        const advice = prompt('输入额外建议（可选）：');
        state.subjects.forEach(s => {
            if (s.errors) {
                const error = s.errors.find(e => e.id === id);
                if (error) {
                    error.correction = correction;
                    if (advice) error.advice = advice;
                    StorageManager.saveErrors(s.id, s.errors);
                }
            }
        });
        renderErrors();
        showToast('success', '错题已更新');
    }
}

// 重新做：将错题发送到聊天
function redoError(id) {
    let question = '';
    state.subjects.forEach(s => {
        if (s.errors) {
            const error = s.errors.find(e => e.id === id);
            if (error) question = error.question;
        }
    });
    if (question) {
        switchPage('chat');
        document.getElementById('questionInput').value = question;
        submitQuestion();
        showToast('info', '错题已发送到聊天，请重新作答');
    }
}

// 错题统计
function getErrorStatistics() {
    let allErrors = [];
    let subjectCount = {};
    let dateCount = {};

    state.subjects.forEach(s => {
        if (s.errors) {
            s.errors.forEach(e => {
                allErrors.push(e);
                subjectCount[e.subject] = (subjectCount[e.subject] || 0) + 1;
                dateCount[e.date] = (dateCount[e.date] || 0) + 1;
            });
        }
    });

    // Most common error subjects
    const sortedSubjects = Object.entries(subjectCount).sort((a, b) => b[1] - a[1]);
    // Error trends (last 7 days)
    const dates = Object.keys(dateCount).sort().slice(-7);

    return {
        total: allErrors.length,
        mastered: allErrors.filter(e => e.mastered).length,
        unmastered: allErrors.filter(e => !e.mastered).length,
        topSubjects: sortedSubjects,
        recentDates: dates.map(d => ({ date: d, count: dateCount[d] }))
    };
}

function showErrorStatistics() {
    const stats = getErrorStatistics();
    if (stats.total === 0) {
        showToast('info', '暂无错题数据');
        return;
    }

    let html = '<div style="padding:12px;">';
    html += '<h3 style="margin-bottom:12px;">错题统计</h3>';
    html += '<p>总错题：' + stats.total + ' | 已掌握：' + stats.mastered + ' | 未掌握：' + stats.unmastered + '</p>';

    if (stats.topSubjects.length > 0) {
        html += '<h4 style="margin:12px 0 8px;">错题最多的科目</h4>';
        html += '<ul>';
        stats.topSubjects.slice(0, 5).forEach(([name, count]) => {
            const pct = Math.round(count / stats.total * 100);
            html += '<li>' + name + '：' + count + '题（' + pct + '%）</li>';
        });
        html += '</ul>';
    }

    if (stats.recentDates.length > 0) {
        html += '<h4 style="margin:12px 0 8px;">近期错题趋势</h4>';
        html += '<ul>';
        stats.recentDates.forEach(d => {
            html += '<li>' + d.date + '：' + d.count + '题</li>';
        });
        html += '</ul>';
    }

    html += '</div>';

    // Show in a modal or as a section
    var modal = document.getElementById('errorStatsModal');
    if (modal) {
        modal.querySelector('.modal-body').innerHTML = html;
        openModal('errorStatsModal');
    } else {
        var div = document.createElement('div');
        div.className = 'modal-overlay';
        div.id = 'errorStatsModal';
        div.innerHTML = '<div class="modal" style="max-width:500px;">' +
            '<div class="modal-header"><h2>错题统计</h2><button class="modal-close" onclick="closeModal(\'errorStatsModal\')">&times;</button></div>' +
            '<div class="modal-body">' + html + '</div>' +
            '</div>';
        document.body.appendChild(div);
        div.style.display = 'flex';
    }
}
