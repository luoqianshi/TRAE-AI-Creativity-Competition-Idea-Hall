// Future Scene - Control Page Interactions

document.addEventListener('DOMContentLoaded', () => {
    // ===== Navigation Scroll & Highlight =====
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const contentArea = document.getElementById('content-area');

    // Smooth scroll on nav click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Highlight current section on scroll
    function updateActiveNav() {
        let current = '';
        const scrollPos = contentArea.scrollTop + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollPos >= sectionTop) {
                current = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    contentArea.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // ===== Character Tab Switching =====
    const charTabs = document.querySelectorAll('.char-tab');
    const charPanels = document.querySelectorAll('.char-panel');

    charTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const char = tab.dataset.char;

            // Update tabs
            charTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panels
            charPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === 'panel-' + char) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // ===== Entrance Animations =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass-card, .ability-card, .future-item').forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });

    console.log('Future Scene - Control page loaded');
});
