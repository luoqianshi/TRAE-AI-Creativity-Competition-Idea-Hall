// ========== Sidebar Resize & Toggle ==========
(function() {
    const sidebar = document.getElementById('sidebar');
    const handle = document.getElementById('sidebarResizeHandle');
    const toggleBtn = document.getElementById('sidebarToggleOuter');
    const toggleIcon = document.getElementById('sidebarToggleIcon2');
    let isResizing = false;

    // Drag to resize
    if (handle) {
        handle.addEventListener('mousedown', function(e) {
            isResizing = true;
            handle.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        const newWidth = Math.min(400, Math.max(180, e.clientX));
        sidebar.style.width = newWidth + 'px';
        sidebar.style.minWidth = newWidth + 'px';
        // Update toggle button position
        if (toggleBtn) toggleBtn.style.left = newWidth + 'px';
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            if (handle) handle.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    // Toggle sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // 统一调用 toggleSidebar 避免逻辑分散
            if (typeof toggleSidebar === 'function') {
                toggleSidebar();
            } else {
                // fallback
                const isCollapsed = sidebar.classList.contains('collapsed');
                const isOpen = sidebar.classList.contains('open');
                if (window.innerWidth <= 768) {
                    sidebar.classList.toggle('open');
                } else {
                    sidebar.classList.toggle('collapsed');
                }
                // update icon and position
                const nowCollapsed = sidebar.classList.contains('collapsed');
                const nowOpen = sidebar.classList.contains('open');
                if (nowCollapsed || !nowOpen) {
                    toggleIcon.className = 'fas fa-chevron-right';
                    toggleBtn.style.left = '0';
                } else {
                    toggleIcon.className = 'fas fa-chevron-left';
                    toggleBtn.style.left = sidebar.style.width || '260px';
                }
            }
        });
    }
})();

// ========== Subjects Slider Touch/Drag Scroll ==========
(function() {
    function initSlider(slider) {
        if (!slider) return;
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;

        // Prevent click events after drag on buttons
        slider.addEventListener('click', (e) => {
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                hasDragged = false;
            }
        }, true);

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            hasDragged = false;
            slider.classList.add('dragging');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('dragging');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('dragging');
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5;
            if (Math.abs(walk) > 3) hasDragged = true;
            slider.scrollLeft = scrollLeft - walk;
        });

        // Touch support - use passive: false to allow preventDefault
        let touchStartX = 0;
        let touchScrollLeft = 0;
        let touchHasDragged = false;

        slider.addEventListener('touchstart', (e) => {
            touchHasDragged = false;
            touchStartX = e.touches[0].clientX;
            touchScrollLeft = slider.scrollLeft;
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].clientX;
            const walk = (touchStartX - touchX) * 1.2;
            if (Math.abs(walk) > 3) touchHasDragged = true;
            slider.scrollLeft = touchScrollLeft + walk;
        }, { passive: true });

        // Wheel horizontal scroll
        slider.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                slider.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    // Init main subjects sliders
    initSlider(document.getElementById('defaultSubjectsSlider'));
    initSlider(document.getElementById('customSubjectsSlider'));

    // Init consult slider when rendered
    const observer = new MutationObserver(() => {
        const consultSlider = document.getElementById('consultSlider');
        if (consultSlider && !consultSlider.dataset.dragInit) {
            consultSlider.dataset.dragInit = '1';
            initSlider(consultSlider);
        }
    });
    const subjectsSection = document.querySelector('.subjects-section');
    if (subjectsSection) {
        observer.observe(subjectsSection.parentElement || document.body, { childList: true, subtree: true });
    }
})();
