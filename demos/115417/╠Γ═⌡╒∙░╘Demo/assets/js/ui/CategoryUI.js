class CategoryUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.onSelectCategory = null;
    this.onLogout = null;
    this.videoManager = null;
  }

  render() {
    this.clear();

    const header = this.createElement('div', 'category-header');
    gsap.set(header, { opacity: 0, y: -30 });
    
    const title = this.createElement('h1', 'category-title');
    title.textContent = '选择学科';
    gsap.set(title, { opacity: 0, x: -50 });
    
    const logoutButton = this.createButton('退出登录', () => {
      gsap.to(this.container, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (this.onLogout) {
            this.onLogout();
          }
        }
      });
    }, 'logout-button');
    gsap.set(logoutButton, { opacity: 0, x: 50 });

    header.appendChild(title);
    header.appendChild(logoutButton);
    this.container.appendChild(header);

    const grid = this.createElement('div', 'category-grid');

    const categories = [
      { id: 'chinese', name: '语文', icon: 'fa-book-open', rune: '☽' },
      { id: 'math', name: '数学', icon: 'fa-calculator', rune: '☿' },
      { id: 'english', name: '英语', icon: 'fa-language', rune: '♃' },
      { id: 'history', name: '历史', icon: 'fa-landmark', rune: '♄' },
      { id: 'politics', name: '道法', icon: 'fa-scale-unbalanced', rune: '♆' },
      { id: 'geography', name: '地理', icon: 'fa-globe', rune: '☉' },
      { id: 'physics', name: '物理', icon: 'fa-atom', rune: '☽' },
      { id: 'chemistry', name: '化学', icon: 'fa-flask-conical', rune: '☿' },
      { id: 'biology', name: '生物', icon: 'fa-dna', rune: '♃' }
    ];

    categories.forEach((cat, index) => {
      const progress = this.gameManager ? this.gameManager.getChapterProgress(cat.id) : { completedLevels: 0, starCount: 0 };
      
      const card = this.createElement('div', 'category-card');
      gsap.set(card, { opacity: 0, scale: 0.8, y: 50 });
      
      const corner1 = this.createElement('div', 'corner-decoration');
      corner1.style.top = '10px';
      corner1.style.left = '10px';
      corner1.style.borderRight = 'none';
      corner1.style.borderBottom = 'none';
      gsap.set(corner1, { opacity: 0, scale: 0 });
      card.appendChild(corner1);
      
      const corner2 = this.createElement('div', 'corner-decoration');
      corner2.style.top = '10px';
      corner2.style.right = '10px';
      corner2.style.borderLeft = 'none';
      corner2.style.borderBottom = 'none';
      gsap.set(corner2, { opacity: 0, scale: 0 });
      card.appendChild(corner2);
      
      const corner3 = this.createElement('div', 'corner-decoration');
      corner3.style.bottom = '10px';
      corner3.style.left = '10px';
      corner3.style.borderRight = 'none';
      corner3.style.borderTop = 'none';
      gsap.set(corner3, { opacity: 0, scale: 0 });
      card.appendChild(corner3);
      
      const corner4 = this.createElement('div', 'corner-decoration');
      corner4.style.bottom = '10px';
      corner4.style.right = '10px';
      corner4.style.borderLeft = 'none';
      corner4.style.borderTop = 'none';
      gsap.set(corner4, { opacity: 0, scale: 0 });
      card.appendChild(corner4);
      
      const iconDiv = this.createElement('div', 'category-icon');
      gsap.set(iconDiv, { opacity: 0, scale: 0.5 });
      
      if (this.videoManager) {
        const imagePath = this.videoManager.getCharacterImage(cat.id);
        if (imagePath) {
          const img = this.createElement('img', 'category-character-img');
          img.src = imagePath;
          img.alt = cat.name;
          iconDiv.appendChild(img);
        } else {
          const icon = this.createElement('i', `fas ${cat.icon}`);
          iconDiv.appendChild(icon);
        }
      } else {
        const icon = this.createElement('i', `fas ${cat.icon}`);
        iconDiv.appendChild(icon);
      }
      
      const name = this.createElement('h3', 'category-name');
      name.textContent = cat.name;
      gsap.set(name, { opacity: 0, y: 10 });
      
      const characterName = this.createElement('div', 'character-name');
      if (this.videoManager) {
        characterName.textContent = this.videoManager.getCharacterName(cat.id);
      }
      gsap.set(characterName, { opacity: 0 });
      
      const progressDiv = this.createElement('div', 'category-progress');
      const stars = this.createElement('div', 'category-stars');
      for (let i = 0; i < 3; i++) {
        const star = this.createElement('i', `fas fa-star ${i < Math.floor(progress.starCount / 10) ? 'filled' : ''}`);
        stars.appendChild(star);
      }
      
      const levelText = this.createElement('span', 'category-levels');
      levelText.textContent = `已通关 ${progress.completedLevels} / 10 关`;
      
      progressDiv.appendChild(stars);
      progressDiv.appendChild(levelText);
      gsap.set(progressDiv, { opacity: 0 });
      
      card.appendChild(iconDiv);
      card.appendChild(name);
      card.appendChild(characterName);
      card.appendChild(progressDiv);
      
      card.addEventListener('click', () => {
        gsap.to(card, {
          scale: 0.9,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in'
        });
        
        gsap.to(this.container, {
          opacity: 0,
          duration: 0.3,
          delay: 0.1,
          ease: 'power2.in',
          onComplete: () => {
            if (this.onSelectCategory) {
              this.onSelectCategory(cat.id);
            }
          }
        });
      });
      
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.08,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      grid.appendChild(card);
    });

    this.container.appendChild(grid);

    this.playAnimations();
  }

  playAnimations() {
    const tl = gsap.timeline();
    
    tl.to('.category-header', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    })
    .to('.category-title', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.logout-button', {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.category-card', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.5)'
    }, '-=0.2')
    .to('.corner-decoration', {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.category-icon', {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.category-name', {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.15')
    .to('.character-name', {
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.1')
    .to('.category-progress', {
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.05');
  }

  setVideoManager(videoManager) {
    this.videoManager = videoManager;
  }

  setOnSelectCategory(callback) {
    this.onSelectCategory = callback;
  }

  setOnLogout(callback) {
    this.onLogout = callback;
  }
}