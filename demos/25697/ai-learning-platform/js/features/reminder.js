// ========== Reminder Check ==========
function checkReminders() {
    const now = new Date();
    let hasExpired = false;
    state.notes.forEach(note => {
        if (!note.hasReminder) return;

        // 登录提醒：作为附加选项，在截止前2-4小时内登录时触发
        if (note.loginReminder) {
            if (note.reminderDate) {
                const reminderDate = new Date(note.reminderDate + 'T' + (note.reminderTime || '00:00'));
                const hoursUntil = (reminderDate - now) / 3600000;
                // 截止前2-4小时内登录时提醒
                if (hoursUntil > 0 && hoursUntil <= 4 && !note.loginNotified) {
                    showToast('warning', `📌 登录提醒：「${note.title}」将在约${Math.ceil(hoursUntil)}小时后到期`);
                    note.loginNotified = true;
                }
            } else {
                // 没有设置到期时间的登录提醒，每次登录提醒一次
                if (!note.loginNotified) {
                    showToast('warning', `📌 登录提醒：${note.title}`);
                    note.loginNotified = true;
                }
            }
        }

        // 定时提醒
        if (!note.notified && note.reminderDate) {
            const reminderDate = new Date(note.reminderDate + 'T' + (note.reminderTime || '00:00'));
            if (now >= reminderDate) {
                showToast('warning', `⏰ 提醒：${note.title}`);
                note.notified = true;
                hasExpired = true;
                StorageManager.saveNotes(state.notes);
            }
        }
    });

    // 自动归档过期的一次性提醒到"无需提醒"
    if (hasExpired) {
        autoArchiveExpiredNotes();
    }

    renderNotes();
}

// 自动归档过期的一次性提醒
function autoArchiveExpiredNotes() {
    const now = new Date();
    let archivedCount = 0;
    state.notes.forEach(note => {
        if (note.hasReminder && note.reminderType === '一次性' && note.notified && note.reminderDate) {
            const reminderDate = new Date(note.reminderDate + 'T' + (note.reminderTime || '00:00'));
            // 过期超过1小时后自动归档
            if (now.getTime() - reminderDate.getTime() > 3600000) {
                note.hasReminder = false;
                note.reminderDate = null;
                note.reminderTime = null;
                note.reminderType = null;
                note.notified = false;
                archivedCount++;
            }
        }
    });
    if (archivedCount > 0) {
        showToast('success', `已自动归档 ${archivedCount} 条过期提醒到"无需提醒"`);
        StorageManager.saveNotes(state.notes);
    }
}

// Check reminders every 30 seconds
setInterval(checkReminders, 30000);
