class GameManager {
  constructor() {
    this.currentUser = null;
    this.currentChapter = null;
    this.currentLevel = null;
    this.currentGame = null;
    this.progress = {};
    this.storage = StorageManager;
    this.chapters = {};
    this.previewChapters = {};
  }

  init() {
    this.loadProgress();
    this.initChapters();
    this.initPreviewChapters();
  }

  initChapters() {
    this.chapters = {
      chinese: new ChineseChapter(),
      math: new MathChapter(),
      english: new EnglishChapter(),
      history: new HistoryChapter(),
      politics: new PoliticsChapter(),
      geography: new GeographyChapter(),
      physics: new PhysicsChapter(),
      chemistry: new ChemistryChapter(),
      biology: new BiologyChapter()
    };
  }

  initPreviewChapters() {
    this.previewChapters = {
      preview_chinese: new PreviewChineseChapter(),
      preview_math: new PreviewMathChapter(),
      preview_english: new PreviewEnglishChapter(),
      preview_history: new PreviewHistoryChapter(),
      preview_politics: new PreviewPoliticsChapter(),
      preview_geography: new PreviewGeographyChapter(),
      preview_physics: new PreviewPhysicsChapter(),
      preview_chemistry: new PreviewChemistryChapter(),
      preview_biology: new PreviewBiologyChapter()
    };
  }

  getPreviewChapter(chapterId) {
    return this.previewChapters[chapterId];
  }

  updatePreviewProgress(subjectId, unitNumber, allCorrect) {
    const stars = allCorrect ? 3 : 0;
    this.updateProgress(subjectId, unitNumber, stars);
    this.saveProgress();
  }

  isPreviewUnitUnlocked(subjectId, unitNumber) {
    if (unitNumber === 1) return true;
    const prevUnitProgress = this.getLevelProgress(subjectId, unitNumber - 1);
    return prevUnitProgress.completed;
  }

  login(username) {
    this.currentUser = username || '玩家';
    this.progress.username = this.currentUser;
    this.saveProgress();
    return true;
  }

  selectChapter(chapterId) {
    this.currentChapter = this.chapters[chapterId];
    if (!this.currentChapter) {
      console.error('Chapter not found:', chapterId);
      return false;
    }
    return true;
  }

  selectLevel(levelNumber) {
    if (!this.currentChapter) return false;
    if (!this.isLevelUnlocked(this.currentChapter.id, levelNumber)) {
      return false;
    }
    this.currentLevel = levelNumber;
    return true;
  }

  isLevelUnlocked(chapterId, levelNumber) {
    if (levelNumber === 1) return true;
    const prevLevelProgress = this.getLevelProgress(chapterId, levelNumber - 1);
    return prevLevelProgress.completed;
  }

  startGame(gameType) {
    if (!this.currentChapter || !this.currentLevel) return null;
    
    switch (gameType) {
      case 'multiple-choice':
        this.currentGame = new MultipleChoiceGame(this.currentChapter, this.currentLevel);
        break;
      default:
        this.currentGame = new MultipleChoiceGame(this.currentChapter, this.currentLevel);
    }
    
    if (this.currentGame) {
      this.currentGame.init();
      this.currentGame.start();
    }
    
    return this.currentGame;
  }

  finishGame(result) {
    if (!this.currentChapter || !this.currentLevel) return;
    
    if (result.passed) {
      this.currentChapter.unlockLevel(this.currentLevel + 1);
      this.updateProgress(this.currentChapter.id, this.currentLevel, 3);
    }
    
    this.saveProgress();
    return result;
  }

  navigateTo(page) {
    const pages = {
      'login': 'index.html',
      'category': 'category.html',
      'level': 'level.html',
      'game': 'game.html',
      'results': 'results.html'
    };
    
    if (pages[page]) {
      window.location.href = pages[page];
    }
  }

  loadProgress() {
    const saved = this.storage.load('quiz_progress');
    if (saved) {
      this.progress = saved;
    } else {
      this.initDefaultProgress();
    }
  }

  saveProgress() {
    this.storage.save('quiz_progress', this.progress);
  }

  initDefaultProgress() {
    this.progress = {
      username: '',
      categories: {
        chinese: { unlocked: true, completedLevels: 0, starCount: 0 },
        math: { unlocked: true, completedLevels: 0, starCount: 0 },
        english: { unlocked: true, completedLevels: 0, starCount: 0 },
        history: { unlocked: true, completedLevels: 0, starCount: 0 },
        politics: { unlocked: true, completedLevels: 0, starCount: 0 },
        geography: { unlocked: true, completedLevels: 0, starCount: 0 },
        physics: { unlocked: true, completedLevels: 0, starCount: 0 },
        chemistry: { unlocked: true, completedLevels: 0, starCount: 0 },
        biology: { unlocked: true, completedLevels: 0, starCount: 0 }
      },
      levels: {},
      lastPlayedCategory: 'math',
      lastPlayedLevel: 1
    };

    Object.keys(this.progress.categories).forEach(catId => {
      for (let i = 1; i <= 10; i++) {
        this.progress.levels[`${catId}_level_${i}`] = {
          completed: false,
          stars: 0
        };
      }
    });

    this.saveProgress();
  }

  updateProgress(categoryId, levelNumber, stars) {
    if (!this.progress.categories[categoryId]) return;
    
    const levelKey = `${categoryId}_level_${levelNumber}`;
    
    if (!this.progress.levels[levelKey]) {
      this.progress.levels[levelKey] = { completed: false, stars: 0 };
    }
    
    if (!this.progress.levels[levelKey].completed || 
        stars > this.progress.levels[levelKey].stars) {
      this.progress.levels[levelKey].completed = true;
      this.progress.levels[levelKey].stars = stars;
      
      const cat = this.progress.categories[categoryId];
      const currentCompleted = cat.completedLevels;
      if (levelNumber > currentCompleted) {
        cat.completedLevels = levelNumber;
      }
      cat.starCount += stars;
      
      this.progress.lastPlayedCategory = categoryId;
      this.progress.lastPlayedLevel = levelNumber;
    }
  }

  getChapterProgress(chapterId) {
    return this.progress.categories[chapterId] || {
      unlocked: true,
      completedLevels: 0,
      starCount: 0
    };
  }

  getLevelProgress(chapterId, levelNumber) {
    const key = `${chapterId}_level_${levelNumber}`;
    return this.progress.levels[key] || {
      completed: false,
      stars: 0
    };
  }
}
