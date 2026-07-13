class PreviewLevelUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.onSelectUnit = null;
    this.onBack = null;
    this.chapter = null;
    this.gameManager = null;
    this.subjectId = null;
  }

  setChapter(chapter) {
    this.chapter = chapter;
  }

  setGameManager(gameManager) {
    this.gameManager = gameManager;
  }

  setSubjectId(subjectId) {
    this.subjectId = subjectId;
  }

  render() {
    this.clear();

    if (!this.chapter) return;

    const levelContainer = this.createElement('div', 'level-container');
    gsap.set(levelContainer, { opacity: 0 });
    
    const levelHeader = this.createElement('div', 'level-header');
    
    const backButton = this.createElement('button', 'back-button');
    backButton.textContent = '返回';
    backButton.addEventListener('click', () => {
      if (this.onBack) {
        this.onBack();
      }
    });
    
    const levelTitle = this.createElement('h2', 'level-title');
    levelTitle.textContent = this.chapter.name;
    
    levelHeader.appendChild(backButton);
    levelHeader.appendChild(levelTitle);
    
    const levelInfo = this.createElement('div', 'level-info');
    levelInfo.textContent = '选择单元开始预习';
    
    const levelGrid = this.createElement('div', 'level-grid');
    
    this.chapter.units.forEach(unit => {
      const isUnlocked = this.gameManager && this.subjectId 
        ? this.gameManager.isPreviewUnitUnlocked(this.subjectId, unit.unitNumber) 
        : unit.unitNumber === 1;
      
      const levelCard = this.createElement('div', 'level-card', isUnlocked ? 'unlocked' : 'locked');
      gsap.set(levelCard, { opacity: 0, y: 20 });
      
      const levelNumber = this.createElement('div', 'level-number');
      levelNumber.textContent = `Unit ${unit.unitNumber}`;
      
      const levelName = this.createElement('div', 'level-name');
      levelName.textContent = unit.name;
      
      const levelDesc = this.createElement('div', 'level-name');
      levelDesc.style.fontSize = '12px';
      levelDesc.style.opacity = '0.6';
      levelDesc.textContent = unit.description;
      
      const levelStats = this.createElement('div', 'category-progress');
      
      const kpCount = this.createElement('div', 'category-levels');
      kpCount.textContent = `${unit.knowledgePoints.length}个知识点 · ${unit.questions.length}道题`;
      
      levelStats.appendChild(kpCount);
      
      levelCard.appendChild(levelNumber);
      levelCard.appendChild(levelName);
      levelCard.appendChild(levelDesc);
      levelCard.appendChild(levelStats);
      
      if (isUnlocked) {
        levelCard.addEventListener('click', () => {
          gsap.to(levelCard, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              if (this.onSelectUnit) {
                this.onSelectUnit(unit.unitNumber);
              }
            }
          });
        });
      }
      
      levelGrid.appendChild(levelCard);
    });
    
    levelContainer.appendChild(levelHeader);
    levelContainer.appendChild(levelInfo);
    levelContainer.appendChild(levelGrid);
    
    this.container.appendChild(levelContainer);
    
    gsap.to(levelContainer, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    gsap.to('.level-card', {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.3
    });
  }

  setOnSelectUnit(callback) {
    this.onSelectUnit = callback;
  }

  setOnBack(callback) {
    this.onBack = callback;
  }
}