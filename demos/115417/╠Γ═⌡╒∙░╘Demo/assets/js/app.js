class QuizApp {
  constructor() {
    this.gameManager = new GameManager();
    this.videoManager = new CharacterVideoManager();
    this.currentPage = 'login';
    this.currentSubject = null;
    
    this.loginUI = new LoginUI('app-container');
    
    this.previewCategoryUI = new PreviewCategoryUI('app-container');
    this.previewLevelUI = new PreviewLevelUI('app-container');
    this.previewGameUI = new PreviewGameUI('app-container');
    
    this.previewGameUI.setVideoManager(this.videoManager);
    
    this.bindEvents();
    this.init();
  }

  init() {
    this.gameManager.init();
    this.showLogin();
  }

  bindEvents() {
    this.loginUI.setOnPreview(() => {
      this.showPreviewCategory();
    });

    this.previewCategoryUI.setOnSelectCategory((categoryId) => {
      this.currentSubject = categoryId;
      this.videoManager.playIntro(categoryId, () => {
        this.videoManager.startIdle(categoryId);
        this.showPreviewLevel(categoryId);
      });
    });

    this.previewCategoryUI.setOnLogout(() => {
      this.gameManager.currentUser = null;
      this.gameManager.saveProgress();
      this.videoManager.hideAllVideos();
      this.showLogin();
    });

    this.previewLevelUI.setOnSelectUnit((unitNumber) => {
      this.startPreviewGame(unitNumber);
    });

    this.previewLevelUI.setOnBack(() => {
      this.showPreviewCategory();
    });

    this.previewGameUI.setOnRetry(() => {
      const chapter = this.gameManager.getPreviewChapter(this.currentSubject);
      if (chapter) {
        const unit = chapter.getUnit(this.currentUnit);
        if (unit) {
          this.previewGameUI.render(unit.knowledgePoints, unit.questions);
        }
      }
    });

    this.previewGameUI.setOnNextLevel(() => {
      const nextUnit = this.currentUnit + 1;
      const chapter = this.gameManager.getPreviewChapter(this.currentSubject);
      if (chapter && chapter.getUnit(nextUnit)) {
        this.startPreviewGame(nextUnit);
      } else {
        this.showPreviewLevel(this.currentSubject);
      }
    });

    this.previewGameUI.setOnHome(() => {
      this.showPreviewCategory();
    });
  }

  showLogin() {
    this.currentPage = 'login';
    this.videoManager.hideAllVideos();
    gsap.set('#app-container', { opacity: 0 });
    this.loginUI.render();
    gsap.to('#app-container', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  showPreviewCategory() {
    this.currentPage = 'preview_category';
    this.videoManager.hideAllVideos();
    gsap.set('#app-container', { opacity: 0 });
    this.previewCategoryUI.render();
    gsap.to('#app-container', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  showPreviewLevel(categoryId) {
    this.currentPage = 'preview_level';
    gsap.set('#app-container', { opacity: 0 });
    
    const chapter = this.gameManager.getPreviewChapter(categoryId);
    if (chapter) {
      this.previewLevelUI.setChapter(chapter);
      this.previewLevelUI.setGameManager(this.gameManager);
      this.previewLevelUI.setSubjectId(categoryId);
      this.previewLevelUI.render();
    }
    
    gsap.to('#app-container', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  startPreviewGame(unitNumber) {
    this.currentUnit = unitNumber;
    this.currentPage = 'preview_game';
    gsap.set('#app-container', { opacity: 0 });
    
    const chapter = this.gameManager.getPreviewChapter(this.currentSubject);
    if (chapter) {
      const unit = chapter.getUnit(unitNumber);
      if (unit) {
        this.previewGameUI.setSubjectId(this.currentSubject);
        this.previewGameUI.setGameManager(this.gameManager);
        this.previewGameUI.setCurrentUnit(unitNumber);
        this.videoManager.startIdle(this.currentSubject);
        this.previewGameUI.render(unit.knowledgePoints, unit.questions);
      }
    }
    
    gsap.to('#app-container', {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new QuizApp();
});