// ========== Initialize ==========
// Initialize UserManager
UserManager.init();

// Set default date for reminder
document.getElementById('reminderDate').valueAsDate = new Date(Date.now() + 86400000);
document.getElementById('reminderTime').value = '09:00';

// Apply initial settings
applySettings();

// 初始化错题计数（确保页面加载时显示正确）
if (typeof updateErrorCount === 'function') {
    updateErrorCount();
}

// Check for existing login session
(function checkExistingSession() {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
        const user = UserManager.users.find(u => u.id === savedUserId);
        if (user) {
            state.currentUser = user;
            StorageManager.loadAllUserData();
            updateSidebarUser();
            // 加载用户数据后更新错题计数
            if (typeof updateErrorCount === 'function') {
                updateErrorCount();
            }
            document.getElementById('loginPage').classList.add('hidden');
            // Show role page (user was already logged in)

            // 为已有会话刷新头像框显示
            requestAnimationFrame(function() {
                if (typeof AvatarFrameSystem !== 'undefined') {
                    var frameId = user.avatarFrame || AvatarFrameSystem.getActiveFrame() || 'none';
                    if (frameId !== 'none') {
                        var frame = AvatarFrameSystem.frames.find(function(f) { return f.id === frameId; });
                        if (frame && frame.css) {
                            var avatars = document.querySelectorAll('.chat-message.user .chat-avatar');
                            avatars.forEach(function(avatarEl) {
                                avatarEl.style.position = 'relative';
                                avatarEl.classList.add('has-frame', frame.css);
                            });
                        }
                    }
                }
            });
        } else {
            localStorage.removeItem('currentUserId');
            // No valid session, ensure login page is shown and role page hidden
            document.getElementById('rolePage').classList.add('hidden');
        }
    } else {
        // Not logged in, hide role page
        document.getElementById('rolePage').classList.add('hidden');
    }
})();
