class ResultsUI extends UI {
  constructor(containerId) {
    super(containerId);
    this.onRetry = null;
    this.onNextLevel = null;
    this.onBackToLevels = null;
    this.result = null;
  }

  render() {
    this.clear();

    const resultsContainer = this.createElement('div', 'results-container');
    gsap.set(resultsContainer, { opacity: 0, scale: 0.9 });

    const header = this.createElement('div', 'results-header');
    gsap.set(header, { opacity: 0, y: -50 });
    
    const title = this.createElement('h1', 'results-title');
    title.textContent = this.result.passed ? '恭喜通关！' : '挑战失败';
    gsap.set(title, { opacity: 0, scale: 0.5 });
    
    header.appendChild(title);
    resultsContainer.appendChild(header);

    const scoreSection = this.createElement('div', 'score-section');
    gsap.set(scoreSection, { opacity: 0, y: 30 });
    
    const score = this.createElement('div', 'score');
    score.textContent = `0 / ${this.result.totalQuestions}`;
    gsap.set(score, { opacity: 0, scale: 0.8 });
    
    const accuracy = this.createElement('div', 'accuracy');
    accuracy.textContent = `正确率: 0%`;
    gsap.set(accuracy, { opacity: 0 });
    
    scoreSection.appendChild(score);
    scoreSection.appendChild(accuracy);
    resultsContainer.appendChild(scoreSection);

    const stars = this.createElement('div', 'result-stars');
    gsap.set(stars, { opacity: 0, y: 20 });
    for (let i = 0; i < 3; i++) {
      const star = this.createElement('i', `fas fa-star ${i < this.result.stars ? 'filled' : ''}`);
      gsap.set(star, { opacity: 0, scale: 0, rotation: -180 });
      stars.appendChild(star);
    }
    resultsContainer.appendChild(stars);

    if (this.result.passed) {
      const message = this.createElement('div', 'success-message');
      message.textContent = '你已解锁下一关！';
      gsap.set(message, { opacity: 0, scale: 0.8 });
      resultsContainer.appendChild(message);
    } else {
      const message = this.createElement('div', 'fail-message');
      message.textContent = '正确率未达到100%，请重新挑战！';
      gsap.set(message, { opacity: 0, scale: 0.8 });
      resultsContainer.appendChild(message);
    }

    const answersSection = this.createElement('div', 'answers-section');
    gsap.set(answersSection, { opacity: 0, y: 30 });
    
    const aCorner1 = this.createElement('div', 'corner-decoration');
    aCorner1.style.top = '10px';
    aCorner1.style.left = '10px';
    aCorner1.style.width = '30px';
    aCorner1.style.height = '30px';
    aCorner1.style.borderRight = 'none';
    aCorner1.style.borderBottom = 'none';
    gsap.set(aCorner1, { opacity: 0, scale: 0 });
    answersSection.appendChild(aCorner1);
    
    const aCorner2 = this.createElement('div', 'corner-decoration');
    aCorner2.style.top = '10px';
    aCorner2.style.right = '10px';
    aCorner2.style.width = '30px';
    aCorner2.style.height = '30px';
    aCorner2.style.borderLeft = 'none';
    aCorner2.style.borderBottom = 'none';
    gsap.set(aCorner2, { opacity: 0, scale: 0 });
    answersSection.appendChild(aCorner2);
    
    const aCorner3 = this.createElement('div', 'corner-decoration');
    aCorner3.style.bottom = '10px';
    aCorner3.style.left = '10px';
    aCorner3.style.width = '30px';
    aCorner3.style.height = '30px';
    aCorner3.style.borderRight = 'none';
    aCorner3.style.borderTop = 'none';
    gsap.set(aCorner3, { opacity: 0, scale: 0 });
    answersSection.appendChild(aCorner3);
    
    const aCorner4 = this.createElement('div', 'corner-decoration');
    aCorner4.style.bottom = '10px';
    aCorner4.style.right = '10px';
    aCorner4.style.width = '30px';
    aCorner4.style.height = '30px';
    aCorner4.style.borderLeft = 'none';
    aCorner4.style.borderTop = 'none';
    gsap.set(aCorner4, { opacity: 0, scale: 0 });
    answersSection.appendChild(aCorner4);
    
    const answersTitle = this.createElement('h2', 'answers-title');
    answersTitle.textContent = '答题详情';
    gsap.set(answersTitle, { opacity: 0, x: -20 });
    
    answersSection.appendChild(answersTitle);

    const answersList = this.createElement('div', 'answers-list');
    
    this.result.answers.forEach((answer, index) => {
      const answerItem = this.createElement('div', `answer-item ${answer.isCorrect ? 'correct' : 'wrong'}`);
      gsap.set(answerItem, { opacity: 0, x: -20 });
      
      const questionNum = this.createElement('span', 'question-num');
      questionNum.textContent = `${index + 1}.`;
      
      const questionText = this.createElement('span', 'question-text');
      questionText.textContent = answer.question;
      
      const answerInfo = this.createElement('div', 'answer-info');
      const selected = this.createElement('span', 'selected');
      selected.textContent = `你的答案: ${answer.selectedAnswer}`;
      const correct = this.createElement('span', 'correct-answer');
      correct.textContent = `正确答案: ${answer.correctAnswer}`;
      
      answerInfo.appendChild(selected);
      answerInfo.appendChild(correct);
      
      const explanation = this.createElement('div', 'explanation');
      explanation.textContent = answer.explanation;
      
      answerItem.appendChild(questionNum);
      answerItem.appendChild(questionText);
      answerItem.appendChild(answerInfo);
      answerItem.appendChild(explanation);
      
      answersList.appendChild(answerItem);
    });

    answersSection.appendChild(answersList);
    resultsContainer.appendChild(answersSection);

    const actions = this.createElement('div', 'results-actions');
    gsap.set(actions, { opacity: 0, y: 20 });

    if (this.result.passed && this.result.hasNextLevel) {
      const nextButton = this.createButton('进入下一关', () => {
        gsap.to(nextButton, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            if (this.onNextLevel) {
              this.onNextLevel();
            }
          }
        });
      }, 'next-level-button');
      actions.appendChild(nextButton);
    }

    const retryButton = this.createButton('重新挑战', () => {
      gsap.to(this.container, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (this.onRetry) {
            this.onRetry();
          }
        }
      });
    }, 'retry-button');
    actions.appendChild(retryButton);

    const backButton = this.createButton('返回关卡列表', () => {
      gsap.to(this.container, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (this.onBackToLevels) {
            this.onBackToLevels();
          }
        }
      });
    }, 'back-button');
    actions.appendChild(backButton);

    resultsContainer.appendChild(actions);

    this.container.appendChild(resultsContainer);

    this.playAnimations();
  }

  playAnimations() {
    const tl = gsap.timeline();
    
    tl.to('.results-container', {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.5)'
    })
    .to('.results-header', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3')
    .to('.results-title', {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.3')
    .to('.score-section', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.score', {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.3');

    const scoreElement = document.querySelector('.score');
    const accuracyElement = document.querySelector('.accuracy');
    
    if (scoreElement && accuracyElement) {
      const targetScore = this.result.score;
      const targetAccuracy = this.result.accuracy;
      
      const scoreTl = gsap.timeline();
      scoreTl.to({ val: 0 }, {
        val: targetScore,
        duration: 1,
        ease: 'power2.out',
        onUpdate: function() {
          scoreElement.textContent = `${Math.round(this.targets()[0].val)} / ${this.result.totalQuestions}`;
        }.bind(this)
      });
      
      const accTl = gsap.timeline();
      accTl.to({ val: 0 }, {
        val: targetAccuracy,
        duration: 1,
        ease: 'power2.out',
        onUpdate: function() {
          accuracyElement.textContent = `正确率: ${Math.round(this.targets()[0].val)}%`;
        }.bind(this)
      });
    }
    
    tl.to('.accuracy', {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.8')
    .to('.result-stars', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3');

    const starElements = document.querySelectorAll('.result-stars .fa-star');
    starElements.forEach((star, index) => {
      if (index < this.result.stars) {
        tl.to(star, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          delay: index * 0.2,
          ease: 'back.out(1.7)'
        });
        
        tl.to(star, {
          scale: 1.2,
          duration: 0.2,
          yoyo: true,
          repeat: 2,
          delay: index * 0.2 + 0.5
        });
      } else {
        tl.to(star, {
          opacity: 0.3,
          scale: 1,
          rotation: 0,
          duration: 0.3,
          delay: 0.6,
          ease: 'power2.out'
        });
      }
    });
    
    tl.to('.success-message, .fail-message', {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.5)'
    }, '-=0.3')
    .to('.answers-section', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.corner-decoration', {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.answers-title', {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.answer-item', {
      opacity: 1,
      x: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power2.out'
    }, '-=0.2')
    .to('.results-actions', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.2');

    if (this.result.passed) {
      this.createCelebration();
    }
  }

  createCelebration() {
    const colors = ['#ffd700', '#ff4500', '#00ffff', '#ff69b4', '#32cd32'];
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.style.position = 'fixed';
      particle.style.left = Math.random() * window.innerWidth + 'px';
      particle.style.top = '-20px';
      particle.style.width = Math.random() * 10 + 5 + 'px';
      particle.style.height = Math.random() * 10 + 5 + 'px';
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '999';
      document.body.appendChild(particle);

      gsap.to(particle, {
        top: window.innerHeight + 20,
        left: '+=' + (Math.random() - 0.5) * 200,
        opacity: 0,
        scale: [1, 0],
        rotation: Math.random() * 360,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
        ease: 'power2.in',
        onComplete: () => {
          particle.remove();
        }
      });
    }
  }

  setResult(result) {
    this.result = result;
  }

  setOnRetry(callback) {
    this.onRetry = callback;
  }

  setOnNextLevel(callback) {
    this.onNextLevel = callback;
  }

  setOnBackToLevels(callback) {
    this.onBackToLevels = callback;
  }
}