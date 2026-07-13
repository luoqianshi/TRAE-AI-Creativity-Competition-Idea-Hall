class LevelUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.onSelectLevel = null;
    this.onBack = null;
    this.chapter = null;
    this.gameManager = null;
    this.videoManager = null;
  }

  render() {
    this.clear();

    if (this.chapter && this.videoManager) {
      const bgImage = this.videoManager.getCharacterImage(this.chapter.id);
      if (bgImage) {
        const bgDiv = this.createElement('div', 'level-character-bg');
        bgDiv.style.backgroundImage = `url(${bgImage})`;
        gsap.set(bgDiv, { opacity: 0 });
        this.container.appendChild(bgDiv);
      }
    }

    const header = this.createElement('div', 'level-header');
    gsap.set(header, { opacity: 0, y: -30 });
    
    const backButton = this.createButton('返回', () => {
      gsap.to(this.container, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (this.onBack) {
            this.onBack();
          }
        }
      });
    }, 'back-button');
    
    const title = this.createElement('h1', 'level-title');
    title.textContent = this.chapter ? this.chapter.name : '选择关卡';
    gsap.set(title, { opacity: 0, x: -30 });

    header.appendChild(backButton);
    header.appendChild(title);
    this.container.appendChild(header);

    const info = this.createElement('div', 'level-info');
    info.textContent = '正确率达到100%解锁下一关';
    gsap.set(info, { opacity: 0, y: 20 });
    this.container.appendChild(info);

    const grid = this.createElement('div', 'level-grid');

    if (this.chapter) {
      const levels = this.chapter.getAllLevels();
      
      levels.forEach((level, index) => {
        const progress = this.gameManager ? 
          this.gameManager.getLevelProgress(this.chapter.id, level.levelNumber) : 
          { completed: false, stars: 0 };
        
        const isUnlocked = this.gameManager ? 
          this.gameManager.isLevelUnlocked(this.chapter.id, level.levelNumber) : 
          level.levelNumber === 1;

        const card = this.createElement('div', `level-card ${isUnlocked ? 'unlocked' : 'locked'}`);
        gsap.set(card, { opacity: 0, scale: 0.7, y: 30 });
        
        const corner1 = this.createElement('div', 'corner-decoration');
        corner1.style.top = '5px';
        corner1.style.left = '5px';
        corner1.style.width = '25px';
        corner1.style.height = '25px';
        corner1.style.borderRight = 'none';
        corner1.style.borderBottom = 'none';
        gsap.set(corner1, { opacity: 0 });
        card.appendChild(corner1);
        
        const corner2 = this.createElement('div', 'corner-decoration');
        corner2.style.top = '5px';
        corner2.style.right = '5px';
        corner2.style.width = '25px';
        corner2.style.height = '25px';
        corner2.style.borderLeft = 'none';
        corner2.style.borderBottom = 'none';
        gsap.set(corner2, { opacity: 0 });
        card.appendChild(corner2);
        
        const corner3 = this.createElement('div', 'corner-decoration');
        corner3.style.bottom = '5px';
        corner3.style.left = '5px';
        corner3.style.width = '25px';
        corner3.style.height = '25px';
        corner3.style.borderRight = 'none';
        corner3.style.borderTop = 'none';
        gsap.set(corner3, { opacity: 0 });
        card.appendChild(corner3);
        
        const corner4 = this.createElement('div', 'corner-decoration');
        corner4.style.bottom = '5px';
        corner4.style.right = '5px';
        corner4.style.width = '25px';
        corner4.style.height = '25px';
        corner4.style.borderLeft = 'none';
        corner4.style.borderTop = 'none';
        gsap.set(corner4, { opacity: 0 });
        card.appendChild(corner4);
        
        if (isUnlocked) {
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
                if (this.onSelectLevel) {
                  this.onSelectLevel(level.levelNumber);
                }
              }
            });
          });
          
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              scale: 1.05,
              duration: 0.2,
              ease: 'power2.out'
            });
          });
          
          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              scale: 1,
              duration: 0.2,
              ease: 'power2.out'
            });
          });
        }

        const levelNum = this.createElement('div', 'level-number');
        levelNum.textContent = level.levelNumber;
        gsap.set(levelNum, { opacity: 0, scale: 0.5 });
        
        const levelName = this.createElement('h3', 'level-name');
        levelName.textContent = level.name;
        gsap.set(levelName, { opacity: 0, y: 10 });
        
        const difficulty = this.createElement('div', 'level-difficulty');
        for (let i = 0; i < 5; i++) {
          const star = this.createElement('i', `fas fa-star ${i < level.difficulty ? 'filled' : ''}`);
          difficulty.appendChild(star);
        }
        gsap.set(difficulty, { opacity: 0 });

        const stars = this.createElement('div', 'level-stars');
        for (let i = 0; i < 3; i++) {
          const star = this.createElement('i', `fas fa-star ${i < progress.stars ? 'filled' : ''}`);
          stars.appendChild(star);
        }
        gsap.set(stars, { opacity: 0, scale: 0.8 });

        if (!isUnlocked) {
          const lockIcon = this.createElement('i', 'fas fa-lock lock-icon');
          card.appendChild(lockIcon);
          gsap.set(lockIcon, { opacity: 0, rotation: 180 });
        }

        card.appendChild(levelNum);
        card.appendChild(levelName);
        card.appendChild(difficulty);
        card.appendChild(stars);
        
        grid.appendChild(card);
      });
    }

    this.container.appendChild(grid);

    this.playAnimations();
  }

  playAnimations() {
    const tl = gsap.timeline();
    
    tl.to('.level-character-bg', {
      opacity: 0.3,
      duration: 1,
      ease: 'power2.out'
    })
    .to('.level-header', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.5')
    .to('.level-title', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.level-info', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.level-card', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: 'back.out(1.5)'
    }, '-=0.2')
    .to('.corner-decoration', {
      opacity: 1,
      duration: 0.2,
      stagger: 0.02,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.level-number', {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.level-name', {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.out'
    }, '-=0.15')
    .to('.level-difficulty', {
      opacity: 1,
      duration: 0.2,
      stagger: 0.04,
      ease: 'power2.out'
    }, '-=0.1')
    .to('.level-stars', {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.out'
    }, '-=0.05')
    .to('.lock-icon', {
      opacity: 1,
      rotation: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.05');
  }

  setChapter(chapter) {
    this.chapter = chapter;
  }

  setGameManager(gameManager) {
    this.gameManager = gameManager;
  }

  setVideoManager(videoManager) {
    this.videoManager = videoManager;
  }

  setOnSelectLevel(callback) {
    this.onSelectLevel = callback;
  }

  setOnBack(callback) {
    this.onBack = callback;
  }
}