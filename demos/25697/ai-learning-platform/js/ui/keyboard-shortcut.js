        // ========== Keyboard Shortcut ==========
        document.addEventListener('keydown', function(e) {
            const input = document.getElementById('questionInput');
            const isInputFocused = document.activeElement === input;
            const sendMode = state.settings?.sendMode || 'ctrl_enter';

            if (isInputFocused && state.currentPage === 'chat') {
                if (sendMode === 'enter') {
                    // Enter发送，Shift+Enter或Ctrl+Enter换行
                    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        submitQuestion();
                    } else if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        const start = input.selectionStart;
                        const end = input.selectionEnd;
                        input.value = input.value.substring(0, start) + '\n' + input.value.substring(end);
                        input.selectionStart = input.selectionEnd = start + 1;
                    }
                } else {
                    // Ctrl+Enter发送，Enter换行
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        submitQuestion();
                    } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        const start = input.selectionStart;
                        const end = input.selectionEnd;
                        input.value = input.value.substring(0, start) + '\n' + input.value.substring(end);
                        input.selectionStart = input.selectionEnd = start + 1;
                    }
                }
            }

            // Ctrl+/ 切换AI日志面板
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                const panel = document.getElementById('aiLogPanel');
                if (panel) {
                    if (panel.style.display === 'none') {
                        panel.style.display = 'block';
                    } else {
                        panel.classList.toggle('collapsed');
                    }
                }
            }

            // Ctrl+N 切换快速笔记
            if (e.ctrlKey && !e.shiftKey && e.key === 'n') {
                e.preventDefault();
                if (typeof toggleQuickNote === 'function') {
                    toggleQuickNote();
                }
            }

            // Ctrl+Shift+C 清空聊天
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                if (state.currentPage === 'chat') {
                    clearChat();
                }
            }

            // Escape 关闭任何打开的模态框
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal-overlay.active, .modal-overlay[style*="display: flex"]');
                modals.forEach(function(modal) {
                    if (modal.id !== 'guideModal') {
                        modal.style.display = 'none';
                        modal.classList.remove('active');
                    }
                });
                // 关闭搜索栏
                const searchBar = document.getElementById('chatSearchBar');
                if (searchBar && searchBar.style.display === 'flex') {
                    searchBar.style.display = 'none';
                    clearChatSearch();
                }
                // 关闭快捷键帮助
                const shortcutHelp = document.getElementById('shortcutHelpTooltip');
                if (shortcutHelp) shortcutHelp.style.display = 'none';
                // 关闭快速笔记
                const quickNote = document.getElementById('quickNoteFloat');
                if (quickNote && quickNote.style.display === 'flex') {
                    quickNote.style.display = 'none';
                }
            }
        });

        // ========== Keyboard Shortcut Help ==========
        function toggleShortcutHelp() {
            const tooltip = document.getElementById('shortcutHelpTooltip');
            if (!tooltip) return;
            if (tooltip.style.display === 'block') {
                tooltip.style.display = 'none';
            } else {
                tooltip.style.display = 'block';
            }
        }

        // 点击其他区域关闭快捷键帮助
        document.addEventListener('click', function(e) {
            const tooltip = document.getElementById('shortcutHelpTooltip');
            const trigger = document.getElementById('shortcutHelpBtn');
            if (tooltip && trigger && !tooltip.contains(e.target) && !trigger.contains(e.target)) {
                tooltip.style.display = 'none';
            }
        });
