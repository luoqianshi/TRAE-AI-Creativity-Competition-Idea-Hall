class GameUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.game = null;
    this.currentQuestionIndex = 0;
    this.onAnswer = null;
    this.onFinish = null;
    this.selectedOption = null;
    this.isAnswered = false;
    this.videoManager = null;
    this.subjectId = null;
    this.isPlayingWrongVideo = false;
    this.explanationPanel = null;
  }

  render() {
    this.clear();

    const gameContainer = this.createElement('div', 'game-container');
    gsap.set(gameContainer, { opacity: 0 });

    const mainArea = this.createElement('div', 'game-main-area');

    const header = this.createElement('div', 'game-header');
    gsap.set(header, { opacity: 0, y: -20 });
    
    const progress = this.createElement('div', 'game-progress');
    progress.textContent = `第 ${this.currentQuestionIndex + 1} / ${this.game.getQuestionCount()} 题`;
    
    const timer = this.createElement('div', 'game-timer');
    timer.textContent = '180秒';

    header.appendChild(progress);
    header.appendChild(timer);
    mainArea.appendChild(header);

    const questionArea = this.createElement('div', 'question-area');
    gsap.set(questionArea, { opacity: 0, y: 30 });
    
    const qCorner1 = this.createElement('div', 'corner-decoration');
    qCorner1.style.top = '10px';
    qCorner1.style.left = '10px';
    qCorner1.style.width = '30px';
    qCorner1.style.height = '30px';
    qCorner1.style.borderRight = 'none';
    qCorner1.style.borderBottom = 'none';
    gsap.set(qCorner1, { opacity: 0, scale: 0 });
    questionArea.appendChild(qCorner1);
    
    const qCorner2 = this.createElement('div', 'corner-decoration');
    qCorner2.style.top = '10px';
    qCorner2.style.right = '10px';
    qCorner2.style.width = '30px';
    qCorner2.style.height = '30px';
    qCorner2.style.borderLeft = 'none';
    qCorner2.style.borderBottom = 'none';
    gsap.set(qCorner2, { opacity: 0, scale: 0 });
    questionArea.appendChild(qCorner2);
    
    const qCorner3 = this.createElement('div', 'corner-decoration');
    qCorner3.style.bottom = '10px';
    qCorner3.style.left = '10px';
    qCorner3.style.width = '30px';
    qCorner3.style.height = '30px';
    qCorner3.style.borderRight = 'none';
    qCorner3.style.borderTop = 'none';
    gsap.set(qCorner3, { opacity: 0, scale: 0 });
    questionArea.appendChild(qCorner3);
    
    const qCorner4 = this.createElement('div', 'corner-decoration');
    qCorner4.style.bottom = '10px';
    qCorner4.style.right = '10px';
    qCorner4.style.width = '30px';
    qCorner4.style.height = '30px';
    qCorner4.style.borderLeft = 'none';
    qCorner4.style.borderTop = 'none';
    gsap.set(qCorner4, { opacity: 0, scale: 0 });
    questionArea.appendChild(qCorner4);
    
    const question = this.createElement('h2', 'question-text');
    const currentQuestion = this.game.getCurrentQuestion();
    question.textContent = currentQuestion.question;
    gsap.set(question, { opacity: 0, x: -20 });
    
    questionArea.appendChild(question);
    mainArea.appendChild(questionArea);

    const optionsArea = this.createElement('div', 'options-area');
    gsap.set(optionsArea, { opacity: 0 });
    
    currentQuestion.options.forEach((option, index) => {
      const optionButton = this.createElement('button', `option-button ${this.selectedOption === option.key ? 'selected' : ''}`);
      gsap.set(optionButton, { opacity: 0, y: 20, scale: 0.95 });
      
      const optionKey = this.createElement('span', 'option-key');
      optionKey.textContent = option.key;
      
      const optionValue = this.createElement('span', 'option-value');
      optionValue.textContent = option.value;
      
      optionButton.appendChild(optionKey);
      optionButton.appendChild(optionValue);
      
      if (!this.isAnswered) {
        optionButton.addEventListener('click', () => {
          this.selectOption(option.key);
        });
      }
      
      optionsArea.appendChild(optionButton);
    });

    mainArea.appendChild(optionsArea);

    const actionArea = this.createElement('div', 'action-area');
    gsap.set(actionArea, { opacity: 0 });
    
    if (!this.isAnswered) {
      const submitButton = this.createButton('确认答案', () => {
        this.submitAnswer();
      }, 'submit-button');
      actionArea.appendChild(submitButton);
    } else {
      const currentQuestion = this.game.getCurrentQuestion();
      const resultDiv = this.createElement('div', `result-message ${this.lastAnswerResult ? 'correct' : 'wrong'}`);
      resultDiv.textContent = this.lastAnswerResult ? '回答正确！' : '回答错误！';
      gsap.set(resultDiv, { opacity: 0, scale: 0.8 });
      actionArea.appendChild(resultDiv);

      const nextButton = this.createButton(this.currentQuestionIndex < this.game.getQuestionCount() - 1 ? '下一题' : '查看结果', () => {
        this.nextQuestion();
      }, 'next-button');
      gsap.set(nextButton, { opacity: 0, y: 20 });
      actionArea.appendChild(nextButton);
    }

    mainArea.appendChild(actionArea);
    gameContainer.appendChild(mainArea);

    if (this.isAnswered) {
      this.renderExplanationPanel();
    }

    this.container.appendChild(gameContainer);

    this.playAnimations();
  }

  playAnimations() {
    const tl = gsap.timeline();
    
    tl.to('.game-container', {
      opacity: 1,
      duration: 0.15,
      ease: 'none'
    })
    .to('.game-header', {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'none'
    })
    .to('.question-area', {
      opacity: 1,
      y: 0,
      duration: 0.2,
      ease: 'none'
    }, '-=0.1')
    .to('.question-text', {
      opacity: 1,
      x: 0,
      duration: 0.15,
      ease: 'none'
    }, '-=0.1')
    .to('.options-area', {
      opacity: 1,
      duration: 0.15,
      ease: 'none'
    }, '-=0.1')
    .to('.option-button', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.15,
      stagger: 0.03,
      ease: 'none'
    }, '-=0.1')
    .to('.action-area', {
      opacity: 1,
      duration: 0.15,
      ease: 'none'
    }, '-=0.05');

    if (this.isAnswered) {
      tl.to('.result-message', {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      }, '-=0.05')
      .to('.next-button', {
        opacity: 1,
        y: 0,
        duration: 0.15,
        ease: 'none'
      }, '-=0.1');
    }
  }

  renderExplanationPanel() {
    const currentQuestion = this.game.getCurrentQuestion();
    
    const panel = this.createElement('div', 'explanation-panel');
    
    const title = this.createElement('h3', 'explanation-title');
    title.textContent = '答案解析';
    panel.appendChild(title);

    const correctAnswer = this.createElement('div', 'correct-answer');
    const correctOpt = currentQuestion.options.find(o => o.key === currentQuestion.correctAnswer);
    correctAnswer.innerHTML = `<strong>正确答案：${currentQuestion.correctAnswer}. ${correctOpt ? correctOpt.value : ''}</strong>`;
    panel.appendChild(correctAnswer);

    if (currentQuestion.explanation) {
      const mainExplanation = this.createElement('div', 'main-explanation');
      mainExplanation.textContent = currentQuestion.explanation;
      panel.appendChild(mainExplanation);
    }

    const optionExplanations = this.createElement('div', 'option-explanations');
    
    currentQuestion.options.forEach(option => {
      const optDiv = this.createElement('div', `option-explanation ${option.key === currentQuestion.correctAnswer ? 'correct' : ''}`);
      const optHeader = this.createElement('div', 'option-explanation-header');
      optHeader.innerHTML = `<span class="option-key">${option.key}</span><span class="option-label">${option.value}</span>`;
      optDiv.appendChild(optHeader);
      
      if (option.explanation) {
        const optText = this.createElement('div', 'option-explanation-text');
        optText.textContent = option.explanation;
        optDiv.appendChild(optText);
      } else if (option.key === currentQuestion.correctAnswer) {
        const optText = this.createElement('div', 'option-explanation-text');
        optText.textContent = '该选项符合题目要求，是正确答案。';
        optDiv.appendChild(optText);
      } else {
        const optText = this.createElement('div', 'option-explanation-text');
        optText.textContent = '该选项不符合题目要求，是错误答案。';
        optDiv.appendChild(optText);
      }
      
      optionExplanations.appendChild(optDiv);
    });
    
    panel.appendChild(optionExplanations);

    this.container.appendChild(panel);
  }

  setGame(game) {
    this.game = game;
    this.currentQuestionIndex = 0;
    this.selectedOption = null;
    this.isAnswered = false;
  }

  setVideoManager(videoManager) {
    this.videoManager = videoManager;
  }

  setSubjectId(subjectId) {
    this.subjectId = subjectId;
  }

  selectOption(key) {
    if (this.isAnswered) return;
    this.selectedOption = key;
    this.render();
  }

  submitAnswer() {
    if (!this.selectedOption || this.isAnswered) return;
    
    this.isAnswered = true;
    const result = this.game.answer(this.selectedOption);
    this.lastAnswerResult = result.isCorrect;
    
    if (this.onAnswer) {
      this.onAnswer(result);
    }
    
    if (result.isCorrect) {
      this.playCorrectAnimation();
    }
    
    this.render();

    if (!result.isCorrect && this.videoManager && this.subjectId) {
      this.playWrongVideo();
    }
  }

  playCorrectAnimation() {
    const selectedButton = document.querySelector('.option-button.selected');
    if (selectedButton) {
      selectedButton.style.boxShadow = '0 0 20px rgba(46, 204, 113, 0.6)';
    }
  }

  playWrongVideo() {
    if (this.isPlayingWrongVideo) return;
    this.isPlayingWrongVideo = true;

    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.style.opacity = '0.3';
      gameContainer.style.pointerEvents = 'none';
    }

    const skipHandler = () => {
      document.removeEventListener('click', skipHandler);
      document.removeEventListener('keydown', skipHandler);
      this.videoManager.videos.wrong.pause();
      this.finishWrongVideo();
    };

    document.addEventListener('click', skipHandler);
    document.addEventListener('keydown', skipHandler);

    this.videoManager.playWrong(this.subjectId, () => {
      document.removeEventListener('click', skipHandler);
      document.removeEventListener('keydown', skipHandler);
      this.finishWrongVideo();
    });
  }

  finishWrongVideo() {
    this.isPlayingWrongVideo = false;
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.style.opacity = '1';
      gameContainer.style.pointerEvents = 'auto';
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.game.getQuestionCount() - 1) {
      this.currentQuestionIndex++;
      this.selectedOption = null;
      this.isAnswered = false;
      this.game.nextQuestion();
      this.render();
    } else {
      const result = this.game.finish();
      if (this.onFinish) {
        this.onFinish(result);
      }
    }
  }

  setOnAnswer(callback) {
    this.onAnswer = callback;
  }

  setOnFinish(callback) {
    this.onFinish = callback;
  }
}