class PreviewGameUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.onAnswer = null;
    this.currentQuestionIndex = 0;
    this.totalQuestions = 0;
    this.currentKnowledgePoint = null;
    this.knowledgePoints = [];
    this.questions = [];
    this.kpIndex = 0;
    this.showingKnowledgePoint = true;
    this.score = 0;
    this.correctCount = 0;
    this.videoManager = null;
    this.subjectId = null;
    this.gameManager = null;
    this.currentUnit = null;
  }

  render(knowledgePoints, questions) {
    this.clear();
    this.knowledgePoints = knowledgePoints;
    this.questions = questions;
    this.kpIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    
    this.gameContainer = this.createElement('div', 'game-container');
    this.container.appendChild(this.gameContainer);
    
    this.gameMainArea = this.createElement('div', 'game-main-area');
    this.gameContainer.appendChild(this.gameMainArea);
    
    this.renderKnowledgePoint();
  }

  renderKnowledgePoint() {
    if (this.kpIndex >= this.knowledgePoints.length) {
      const allCorrect = this.correctCount === this.knowledgePoints.length;
      
      if (this.gameManager) {
        this.gameManager.updatePreviewProgress(this.subjectId, this.currentUnit, allCorrect);
      }
      
      if (this.questionContainer) {
        gsap.to(this.questionContainer, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            this.questionContainer.remove();
            this.questionContainer = null;
            if (allCorrect && this.videoManager && this.subjectId) {
              this.videoManager.playVictory(this.subjectId, () => {
                this.showResults(allCorrect);
              });
            } else {
              this.showResults(allCorrect);
            }
          }
        });
      } else {
        if (allCorrect && this.videoManager && this.subjectId) {
          this.videoManager.playVictory(this.subjectId, () => {
            this.showResults(allCorrect);
          });
        } else {
          this.showResults(allCorrect);
        }
      }
      return;
    }
    
    this.showingKnowledgePoint = true;
    this.currentKnowledgePoint = this.knowledgePoints[this.kpIndex];
    
    const kpContainer = this.createElement('div', 'knowledge-point-container');
    gsap.set(kpContainer, { opacity: 0, scale: 0.9 });
    
    const kpTitle = this.createElement('h2', 'knowledge-point-title');
    kpTitle.textContent = `知识点 ${this.kpIndex + 1}`;
    
    const kpContent = this.createElement('div', 'knowledge-point-content');
    
    const kpHeader = this.createElement('div', 'knowledge-point-header');
    const kpName = this.createElement('h3', 'knowledge-point-name');
    kpName.textContent = this.currentKnowledgePoint.title;
    kpHeader.appendChild(kpName);
    
    const kpBody = this.createElement('div', 'knowledge-point-body');
    kpBody.textContent = this.currentKnowledgePoint.content;
    
    kpContent.appendChild(kpHeader);
    kpContent.appendChild(kpBody);
    
    const kpHint = this.createElement('div', 'knowledge-point-hint');
    kpHint.textContent = '按任意键继续';
    
    kpContainer.appendChild(kpTitle);
    kpContainer.appendChild(kpContent);
    kpContainer.appendChild(kpHint);
    
    this.gameMainArea.appendChild(kpContainer);
    
    gsap.to(kpContainer, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    this.kpContainer = kpContainer;
    this.setupKeyListener();
  }

  setupKeyListener() {
    this.keyHandler = (e) => {
      if (this.showingKnowledgePoint) {
        this.hideKnowledgePoint();
      }
    };
    this.clickHandler = (e) => {
      if (this.showingKnowledgePoint) {
        e.stopPropagation();
        e.preventDefault();
        this.hideKnowledgePoint();
      }
    };
    document.addEventListener('keydown', this.keyHandler);
    document.addEventListener('click', this.clickHandler);
  }

  hideKnowledgePoint() {
    if (!this.kpContainer) return;
    
    this.showingKnowledgePoint = false;
    document.removeEventListener('keydown', this.keyHandler);
    document.removeEventListener('click', this.clickHandler);
    
    gsap.to(this.kpContainer, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.kpContainer.remove();
        this.renderQuestion();
      }
    });
  }

  renderQuestion() {
    const kpId = this.currentKnowledgePoint.id;
    const question = this.questions.find(q => q.knowledgePointId === kpId) || 
                     this.questions[this.kpIndex % this.questions.length];
    
    const questionContainer = this.createElement('div', 'question-container');
    gsap.set(questionContainer, { opacity: 0, y: 20 });
    
    const gameHeader = this.createElement('div', 'game-header');
    
    const progress = this.createElement('div', 'game-progress');
    progress.textContent = `知识点 ${this.kpIndex + 1}/${this.knowledgePoints.length}`;
    
    const scoreDisplay = this.createElement('div', 'game-timer');
    scoreDisplay.textContent = `得分: ${this.score}`;
    
    gameHeader.appendChild(progress);
    gameHeader.appendChild(scoreDisplay);
    
    const questionArea = this.createElement('div', 'question-area');
    
    const questionText = this.createElement('div', 'question-text');
    questionText.textContent = question.question;
    
    questionArea.appendChild(questionText);
    
    const optionsArea = this.createElement('div', 'options-area');
    
    question.options.forEach(option => {
      const optionButton = this.createElement('button', 'option-button');
      
      const optionKey = this.createElement('span', 'option-key');
      optionKey.textContent = option.key;
      
      const optionValue = this.createElement('span', 'option-value');
      optionValue.textContent = option.value;
      
      optionButton.appendChild(optionKey);
      optionButton.appendChild(optionValue);
      
      optionButton.addEventListener('click', () => this.handleAnswer(option.key, option, question));
      
      optionsArea.appendChild(optionButton);
    });
    
    questionContainer.appendChild(gameHeader);
    questionContainer.appendChild(questionArea);
    questionContainer.appendChild(optionsArea);
    
    this.gameMainArea.appendChild(questionContainer);
    
    this.questionContainer = questionContainer;
    
    gsap.to(questionContainer, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  handleAnswer(selectedKey, selectedOption, question) {
    this.showingKnowledgePoint = false;
    document.removeEventListener('keydown', this.keyHandler);
    document.removeEventListener('click', this.clickHandler);
    
    const isCorrect = question.correctAnswer.includes(selectedKey);
    const correctKeys = question.correctAnswer.split('');
    
    const optionButtons = this.questionContainer.querySelectorAll('.option-button');
    optionButtons.forEach(btn => btn.disabled = true);
    
    optionButtons.forEach((btn, index) => {
      const option = question.options[index];
      if (correctKeys.includes(option.key)) {
        btn.classList.add('selected', 'correct');
      }
      if (option.key === selectedKey && !correctKeys.includes(option.key)) {
        btn.classList.add('selected', 'wrong');
      }
    });
    
    if (isCorrect) {
      this.score += 10;
      this.correctCount++;
      
      const resultMessage = this.createElement('div', 'result-message', 'correct');
      resultMessage.textContent = '回答正确！';
      this.questionContainer.appendChild(resultMessage);
      
      gsap.to(resultMessage, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.5)'
      });
      
      if (this.videoManager && this.subjectId) {
        this.videoManager.playCorrect(this.subjectId, () => {
          this.nextKnowledgePoint();
        });
      } else {
        setTimeout(() => {
          this.nextKnowledgePoint();
        }, 1500);
      }
    } else {
      const resultMessage = this.createElement('div', 'result-message', 'wrong');
      resultMessage.textContent = '回答错误！';
      this.questionContainer.appendChild(resultMessage);
      
      gsap.to(resultMessage, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      if (this.videoManager && this.subjectId) {
        this.videoManager.playWrong(this.subjectId, () => {
          this.showExplanation(question);
        });
      } else {
        setTimeout(() => {
          this.showExplanation(question);
        }, 1000);
      }
    }
  }

  showExplanation(question) {
    const correctKeys = question.correctAnswer.split('');
    const explanationPanel = this.createElement('div', 'explanation-panel');
    
    const expTitle = this.createElement('div', 'explanation-title');
    expTitle.textContent = '答案解析';
    
    const correctAnswerDiv = this.createElement('div', 'correct-answer');
    const correctOptions = question.options.filter(o => correctKeys.includes(o.key));
    correctAnswerDiv.textContent = '正确答案: ' + correctOptions.map(o => o.key + '. ' + o.value).join('；');
    
    const mainExplanation = this.createElement('div', 'main-explanation');
    mainExplanation.textContent = question.explanation;
    
    const optionExplanations = this.createElement('div', 'option-explanations');
    
    question.options.forEach(option => {
      const optExp = this.createElement('div', 'option-explanation');
      if (correctKeys.includes(option.key)) {
        optExp.classList.add('correct');
      }
      
      const optHeader = this.createElement('div', 'option-explanation-header');
      const optKey = this.createElement('span', 'option-key');
      optKey.textContent = option.key;
      const optLabel = this.createElement('span', 'option-label');
      optLabel.textContent = option.value;
      
      optHeader.appendChild(optKey);
      optHeader.appendChild(optLabel);
      
      const optText = this.createElement('div', 'option-explanation-text');
      optText.textContent = option.explanation;
      
      optExp.appendChild(optHeader);
      optExp.appendChild(optText);
      optionExplanations.appendChild(optExp);
    });
    
    explanationPanel.appendChild(expTitle);
    explanationPanel.appendChild(correctAnswerDiv);
    explanationPanel.appendChild(mainExplanation);
    explanationPanel.appendChild(optionExplanations);
    
    this.gameContainer.appendChild(explanationPanel);
    
    gsap.set(explanationPanel, { opacity: 0, x: 50 });
    gsap.to(explanationPanel, {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
    
    const continueBtn = this.createElement('button', 'next-button');
    continueBtn.textContent = '继续';
    continueBtn.style.marginTop = '20px';
    
    continueBtn.addEventListener('click', () => {
      gsap.to(explanationPanel, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          explanationPanel.remove();
          continueBtn.remove();
          this.nextKnowledgePoint();
        }
      });
    });
    
    this.questionContainer.appendChild(continueBtn);
  }

  nextKnowledgePoint() {
    gsap.to(this.questionContainer, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.questionContainer.remove();
        this.kpIndex++;
        this.renderKnowledgePoint();
      }
    });
  }

  showResults(allCorrect) {
    const resultsContainer = this.createElement('div', 'results-container');
    
    const resultsHeader = this.createElement('div', 'results-header');
    
    const resultsTitle = this.createElement('h1', 'results-title');
    resultsTitle.textContent = allCorrect ? '预习通关！' : '预习完成';
    
    resultsHeader.appendChild(resultsTitle);
    
    const scoreSection = this.createElement('div', 'score-section');
    
    const score = this.createElement('div', 'score');
    score.textContent = this.score;
    
    const accuracy = this.createElement('div', 'accuracy');
    accuracy.textContent = `正确率: ${Math.round((this.correctCount / this.knowledgePoints.length) * 100)}%`;
    
    scoreSection.appendChild(score);
    scoreSection.appendChild(accuracy);
    
    const resultStars = this.createElement('div', 'result-stars');
    const starCount = allCorrect ? 3 :
                      this.correctCount >= Math.floor(this.knowledgePoints.length * 0.7) ? 2 :
                      this.correctCount >= Math.floor(this.knowledgePoints.length * 0.4) ? 1 : 0;
    
    for (let i = 0; i < 3; i++) {
      const star = this.createElement('i', 'fa', 'fa-star');
      if (i < starCount) star.classList.add('filled');
      resultStars.appendChild(star);
    }
    
    const message = this.createElement('div', allCorrect ? 'success-message' : 'fail-message');
    message.textContent = allCorrect ? '全部答对！下一关已解锁！' : '再接再厉！多多复习！';
    
    const resultsActions = this.createElement('div', 'results-actions');
    
    const retryBtn = this.createElement('button', 'retry-button');
    if (allCorrect) {
      retryBtn.textContent = '下一关';
      retryBtn.addEventListener('click', () => {
        if (this.onNextLevel) {
          this.onNextLevel();
        }
      });
    } else {
      retryBtn.textContent = '重新预习';
      retryBtn.addEventListener('click', () => {
        if (this.onRetry) {
          this.onRetry();
        }
      });
    }
    
    const homeBtn = this.createElement('button', 'next-level-button');
    homeBtn.textContent = '返回主页';
    homeBtn.addEventListener('click', () => {
      if (this.onHome) {
        this.onHome();
      }
    });
    
    resultsActions.appendChild(retryBtn);
    resultsActions.appendChild(homeBtn);
    
    resultsContainer.appendChild(resultsHeader);
    resultsContainer.appendChild(scoreSection);
    resultsContainer.appendChild(resultStars);
    resultsContainer.appendChild(message);
    resultsContainer.appendChild(resultsActions);
    
    this.container.appendChild(resultsContainer);
    
    gsap.set(resultsContainer, { opacity: 0, scale: 0.9 });
    gsap.to(resultsContainer, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  setOnAnswer(callback) {
    this.onAnswer = callback;
  }

  setOnRetry(callback) {
    this.onRetry = callback;
  }

  setOnNextLevel(callback) {
    this.onNextLevel = callback;
  }

  setOnHome(callback) {
    this.onHome = callback;
  }

  setVideoManager(videoManager) {
    this.videoManager = videoManager;
  }

  setSubjectId(subjectId) {
    this.subjectId = subjectId;
  }

  setGameManager(gameManager) {
    this.gameManager = gameManager;
  }

  setCurrentUnit(unitNumber) {
    this.currentUnit = unitNumber;
  }
}