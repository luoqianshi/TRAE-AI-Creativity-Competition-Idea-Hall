document.addEventListener('DOMContentLoaded', () => {
    const sections = Array.from(document.querySelectorAll('.section'));
    const dots = Array.from(document.querySelectorAll('.page-dot'));
    const reveals = document.querySelectorAll('.reveal');
    const orbWraps = document.querySelectorAll('.orb-wrap');

    let currentIndex = sections.findIndex((s) => s.classList.contains('section-active')) || 0;

    // Trigger initial load animation
    requestAnimationFrame(() => {
        document.body.classList.add('page-loaded');
    });
    let previousIndex = currentIndex;
    let isScrolling = false;
    const scrollLockDuration = 800;

    // Set custom delays and distances from data attributes
    reveals.forEach((el) => {
        const delay = el.dataset.delay;
        const distance = el.dataset.distance;
        if (delay !== undefined) {
            el.style.setProperty('--delay', delay);
        }
        if (distance !== undefined) {
            el.style.setProperty('--distance', `${distance}px`);
        }
    });

    function updateDots() {
        const activeId = sections[currentIndex]?.id;
        dots.forEach((dot) => {
            dot.classList.toggle('active', dot.dataset.target === activeId);
        });
    }

    function activateSection(index) {
        if (index === currentIndex) return;

        // Mark previous section as leaving
        sections[previousIndex].classList.remove('section-active');
        sections[previousIndex].classList.add('section-leaving');

        // Clear old leaving states after transition
        setTimeout(() => {
            sections.forEach((s) => s.classList.remove('section-leaving'));
        }, 600);

        currentIndex = index;
        sections[currentIndex].classList.remove('section-leaving');
        sections[currentIndex].classList.add('section-active');
        previousIndex = currentIndex;
        updateDots();
    }

    function scrollToSection(index) {
        if (index < 0 || index >= sections.length || index === currentIndex) return;
        activateSection(index);
        isScrolling = true;
        sections[index].scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            isScrolling = false;
        }, scrollLockDuration);
    }

    // Wheel debounce: one swipe = one section
    window.addEventListener('wheel', (e) => {
        if (isScrolling) {
            e.preventDefault();
            return;
        }

        if (Math.abs(e.deltaY) < 30) return;

        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        scrollToSection(currentIndex + direction);
    }, { passive: false });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (isScrolling) {
            e.preventDefault();
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            scrollToSection(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToSection(currentIndex - 1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            scrollToSection(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            scrollToSection(sections.length - 1);
        }
    });

    // Dot navigation
    dots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const target = dot.dataset.target;
            const index = sections.findIndex((s) => s.id === target);
            scrollToSection(index);
        });
    });

    // Sync active section on scroll (for touch / manual scroll)
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
                const index = sections.indexOf(entry.target);
                if (index !== -1 && index !== currentIndex && !isScrolling) {
                    activateSection(index);
                }
            }
        });
    }, { threshold: 0.6 });

    sections.forEach((section) => sectionObserver.observe(section));

    // Subtle 3D tilt on phones
    const phoneObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const phone = entry.target.querySelector('.phone');
            if (!phone) return;

            if (entry.isIntersecting) {
                phone.style.transform = 'rotateY(0deg) rotateX(0deg)';
            } else {
                const rect = entry.boundingClientRect;
                const isAbove = rect.bottom < 0;
                phone.style.transform = isAbove
                    ? 'rotateY(-8deg) rotateX(6deg)'
                    : 'rotateY(8deg) rotateX(-6deg)';
            }
        });
    }, {
        threshold: 0.25
    });

    document.querySelectorAll('.phone-wrap').forEach((wrap) => {
        phoneObserver.observe(wrap);
    });

    // Parallax ambient orbs on scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                orbWraps.forEach((wrap, index) => {
                    const speed = 0.02 + index * 0.01;
                    wrap.style.transform = `translateY(${scrollY * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initialize
    updateDots();
});
