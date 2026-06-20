        // ========== Utilities ==========
        function escapeHtml(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function showToast(type, message) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle' };
            toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${message}</span>`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(40px)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const toggleBtn = document.getElementById('sidebarToggleOuter');
            const toggleIcon = document.getElementById('sidebarToggleIcon2');
            const mobileToggle = document.getElementById('mobileToggle');
            const mobileToggleIcon = mobileToggle ? mobileToggle.querySelector('i') : null;
            
            const isCollapsed = sidebar.classList.contains('collapsed');
            const isOpen = sidebar.classList.contains('open');
            const isNormal = !isCollapsed && !isOpen; // 正常展开状态
            
            if (window.innerWidth <= 768) {
                // 移动端：切换 open 类
                if (isOpen) {
                    sidebar.classList.remove('open');
                    if (mobileToggleIcon) mobileToggleIcon.className = 'fas fa-bars';
                } else {
                    sidebar.classList.add('open');
                    if (mobileToggleIcon) mobileToggleIcon.className = 'fas fa-times';
                }
            } else {
                // 桌面端：切换 collapsed 类
                if (isCollapsed) {
                    // 当前收起 → 展开
                    sidebar.classList.remove('collapsed');
                    if (toggleIcon) {
                        toggleIcon.className = 'fas fa-chevron-left';
                        if (toggleBtn) toggleBtn.style.left = sidebar.style.width || '260px';
                    }
                } else {
                    // 当前展开（正常或open） → 收起
                    sidebar.classList.add('collapsed');
                    sidebar.classList.remove('open');
                    if (toggleIcon) {
                        toggleIcon.className = 'fas fa-chevron-right';
                        if (toggleBtn) toggleBtn.style.left = '0';
                    }
                }
            }
        }
