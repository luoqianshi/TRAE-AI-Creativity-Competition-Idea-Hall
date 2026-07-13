class AnimationManager {
  constructor() {
    this.tl = null;
    this.isAnimating = false;
  }

  fadeIn(element, duration = 0.5, delay = 0) {
    gsap.set(element, { opacity: 0 });
    gsap.to(element, {
      opacity: 1,
      duration: duration,
      delay: delay,
      ease: 'power2.out'
    });
  }

  fadeOut(element, duration = 0.3) {
    return new Promise((resolve) => {
      gsap.to(element, {
        opacity: 0,
        duration: duration,
        ease: 'power2.in',
        onComplete: () => resolve()
      });
    });
  }

  slideInFromLeft(element, duration = 0.6, delay = 0) {
    gsap.set(element, { opacity: 0, x: -100 });
    gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: duration,
      delay: delay,
      ease: 'power3.out'
    });
  }

  slideInFromRight(element, duration = 0.6, delay = 0) {
    gsap.set(element, { opacity: 0, x: 100 });
    gsap.to(element, {
      opacity: 1,
      x: 0,
      duration: duration,
      delay: delay,
      ease: 'power3.out'
    });
  }

  slideInFromTop(element, duration = 0.6, delay = 0) {
    gsap.set(element, { opacity: 0, y: -80 });
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: duration,
      delay: delay,
      ease: 'power3.out'
    });
  }

  slideInFromBottom(element, duration = 0.6, delay = 0) {
    gsap.set(element, { opacity: 0, y: 80 });
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: duration,
      delay: delay,
      ease: 'power3.out'
    });
  }

  scaleIn(element, duration = 0.5, delay = 0) {
    gsap.set(element, { opacity: 0, scale: 0.8 });
    gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration: duration,
      delay: delay,
      ease: 'back.out(1.7)'
    });
  }

  bounceIn(element, duration = 0.6, delay = 0) {
    gsap.set(element, { opacity: 0, scale: 0.3 });
    gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration: duration,
      delay: delay,
      ease: 'elastic.out(1, 0.3)'
    });
  }

  shake(element, duration = 0.5) {
    gsap.to(element, {
      x: [0, -10, 10, -10, 10, 0],
      duration: duration,
      ease: 'power2.inOut'
    });
  }

  pulse(element, duration = 1, repeat = -1) {
    gsap.to(element, {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      duration: duration,
      repeat: repeat,
      ease: 'sine.inOut'
    });
  }

  glow(element, color = '#ffd700', duration = 1) {
    gsap.to(element, {
      boxShadow: [
        `0 0 5px ${color}`,
        `0 0 20px ${color}`,
        `0 0 5px ${color}`
      ],
      duration: duration,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }

  textReveal(element, duration = 0.8) {
    const text = element.textContent;
    element.textContent = '';
    
    gsap.set(element, { opacity: 0 });
    gsap.to(element, {
      opacity: 1,
      duration: 0.3
    });

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i];
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      element.appendChild(span);
      
      gsap.to(span, {
        opacity: 1,
        y: [20, 0],
        duration: 0.15,
        delay: 0.3 + i * 0.05,
        ease: 'power2.out'
      });
    }
  }

  flipIn(element, duration = 0.6) {
    gsap.set(element, { 
      opacity: 0, 
      rotationX: -90,
      transformOrigin: 'center top'
    });
    gsap.to(element, {
      opacity: 1,
      rotationX: 0,
      duration: duration,
      ease: 'power3.out'
    });
  }

  rotateIn(element, duration = 0.8) {
    gsap.set(element, { 
      opacity: 0, 
      rotation: -180,
      scale: 0.5
    });
    gsap.to(element, {
      opacity: 1,
      rotation: 0,
      scale: 1,
      duration: duration,
      ease: 'power3.out'
    });
  }

  morphScale(element, targetScale = 1.2, duration = 0.3) {
    gsap.to(element, {
      scale: targetScale,
      duration: duration,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  }

  shimmer(element, duration = 2) {
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer-effect';
    shimmer.style.position = 'absolute';
    shimmer.style.top = '0';
    shimmer.style.left = '-100%';
    shimmer.style.width = '100%';
    shimmer.style.height = '100%';
    shimmer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)';
    shimmer.style.pointerEvents = 'none';
    element.style.position = 'relative';
    element.appendChild(shimmer);

    gsap.to(shimmer, {
      left: '100%',
      duration: duration,
      repeat: -1,
      ease: 'linear'
    });
  }

  successEffect(element) {
    gsap.set(element, { opacity: 0, scale: 0 });
    
    const tl = gsap.timeline();
    tl.to(element, {
      opacity: 1,
      scale: 1.2,
      duration: 0.3,
      ease: 'back.out(2)'
    })
    .to(element, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.in'
    })
    .to(element, {
      boxShadow: '0 0 30px rgba(46, 204, 113, 0.8)',
      duration: 0.3
    })
    .to(element, {
      boxShadow: '0 0 10px rgba(46, 204, 113, 0.4)',
      duration: 0.5
    });
  }

  errorEffect(element) {
    gsap.set(element, { opacity: 1 });
    
    const tl = gsap.timeline();
    tl.to(element, {
      x: [-5, 5, -5, 5, 0],
      duration: 0.4,
      ease: 'power2.inOut'
    })
    .to(element, {
      boxShadow: '0 0 30px rgba(231, 76, 60, 0.8)',
      duration: 0.3
    })
    .to(element, {
      boxShadow: '0 0 10px rgba(231, 76, 60, 0.4)',
      duration: 0.5
    });
  }

  cardFlip(element) {
    gsap.set(element, { rotationY: 90 });
    gsap.to(element, {
      rotationY: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
      transformStyle: 'preserve-3d'
    });
  }

  float(element, duration = 3) {
    gsap.to(element, {
      y: [-10, 10],
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  spiral(element, duration = 2) {
    gsap.to(element, {
      rotation: 360,
      scale: [1, 1.1, 1],
      duration: duration,
      repeat: -1,
      ease: 'linear'
    });
  }

  pageTransitionOut(element, callback) {
    gsap.to(element, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: callback
    });
  }

  pageTransitionIn(element) {
    gsap.set(element, { opacity: 0, scale: 0.9 });
    gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  staggerChildren(parent, duration = 0.3, stagger = 0.1) {
    const children = parent.children;
    gsap.set(children, { opacity: 0, y: 30 });
    
    gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: duration,
      stagger: stagger,
      ease: 'power2.out'
    });
  }

  numberCountUp(element, target, duration = 1) {
    gsap.fromTo(element, { innerHTML: '0' }, {
      innerHTML: target,
      duration: duration,
      ease: 'power2.out',
      onUpdate: function() {
        element.textContent = Math.round(this.targets()[0].innerHTML);
      }
    });
  }

  starRating(container, stars, duration = 0.5) {
    const starElements = container.querySelectorAll('.fa-star');
    starElements.forEach((star, index) => {
      gsap.set(star, { opacity: 0.3, scale: 0.5 });
      
      if (index < stars) {
        gsap.to(star, {
          opacity: 1,
          scale: 1.2,
          duration: duration,
          delay: index * 0.2,
          ease: 'back.out(1.7)'
        });
        
        gsap.to(star, {
          scale: 1,
          duration: 0.2,
          delay: index * 0.2 + duration,
          ease: 'power2.in'
        });
      }
    });
  }

  burstEffect(element) {
    const particles = [];
    const colors = ['#ffd700', '#ff4500', '#00ffff', '#ff69b4'];
    
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      particle.style.position = 'fixed';
      particle.style.left = element.offsetLeft + element.offsetWidth / 2 + 'px';
      particle.style.top = element.offsetTop + element.offsetHeight / 2 + 'px';
      particle.style.width = '10px';
      particle.style.height = '10px';
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = colors[i % colors.length];
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      document.body.appendChild(particle);
      particles.push(particle);
    }

    const angleStep = 360 / particles.length;
    particles.forEach((particle, index) => {
      const angle = (angleStep * index) * (Math.PI / 180);
      const distance = 150;
      
      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          particle.remove();
        }
      });
    });
  }

  rippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.position = 'absolute';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2px solid rgba(184, 134, 11, 0.8)';
    ripple.style.pointerEvents = 'none';
    element.style.position = 'relative';
    element.appendChild(ripple);

    gsap.to(ripple, {
      width: '300px',
      height: '300px',
      opacity: 0,
      borderWidth: '0px',
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        ripple.remove();
      }
    });
  }

  fireflies(element) {
    for (let i = 0; i < 8; i++) {
      const firefly = document.createElement('div');
      firefly.className = 'firefly';
      firefly.style.position = 'absolute';
      firefly.style.width = '6px';
      firefly.style.height = '6px';
      firefly.style.borderRadius = '50%';
      firefly.style.backgroundColor = '#ffff00';
      firefly.style.boxShadow = '0 0 10px #ffff00';
      firefly.style.left = Math.random() * 100 + '%';
      firefly.style.top = Math.random() * 100 + '%';
      firefly.style.pointerEvents = 'none';
      element.appendChild(firefly);

      gsap.to(firefly, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
        repeat: -1,
        ease: 'sine.inOut'
      });
    }
  }
}