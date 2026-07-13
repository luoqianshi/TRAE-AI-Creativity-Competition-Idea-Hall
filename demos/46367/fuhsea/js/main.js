function init() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');
    const dots = document.querySelectorAll('.scroll-dot');
    const navToggle = document.getElementById('nav-toggle');
    const navLinksList = document.getElementById('nav-links');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        let currentSection = 0;
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 250 && window.scrollY < sectionTop + sectionHeight - 250) {
                currentSection = index;
            }
        });
        
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSection) {
                dot.classList.add('active');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            const targetSection = document.querySelector(href);
            if (targetSection) {
                const sectionTop = targetSection.offsetTop;
                const sectionHeight = targetSection.clientHeight;
                if (window.scrollY >= sectionTop - 250 && window.scrollY < sectionTop + sectionHeight - 250) {
                    link.classList.add('active');
                }
            }
        });
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const targetSection = document.querySelector(href);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 65;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            navLinksList.classList.remove('active');
        });
    });
    
    navToggle.addEventListener('click', function() {
        navLinksList.classList.toggle('active');
    });

    const particleBg = document.getElementById('particle-bg');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-20px';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particleBg.appendChild(particle);
    }

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });

    const statNumbers = document.querySelectorAll('.stat-number');
    const ctaSection = document.querySelector('.cta-section');
    
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;
                    
                    const animate = () => {
                        current += step;
                        if (current < target) {
                            stat.textContent = Math.floor(current).toLocaleString();
                            requestAnimationFrame(animate);
                        } else {
                            stat.textContent = target.toLocaleString();
                        }
                    };
                    
                    animate();
                });
                statObserver.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });
    
    if (ctaSection) {
        statObserver.observe(ctaSection);
    }
}