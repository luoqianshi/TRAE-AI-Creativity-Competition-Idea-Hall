class Game {
  constructor(chapter, level) {
    this.chapter = chapter;
    this.level = level;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.startTime = null;
    this.answers = [];
  }

  init() {}

  start() {
    this.startTime = Date.now();
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.answers = [];
  }

  answer(answer) {}

  nextQuestion() {
    this.currentQuestionIndex++;
    return this.currentQuestionIndex < this.questions.length;
  }

  finish() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    const accuracy = this.questions.length > 0 
      ? Math.round(this.score / this.questions.length * 100) 
      : 0;
    
    return {
      score: this.score,
      totalQuestions: this.questions.length,
      accuracy,
      duration,
      passed: this.score === this.questions.length,
      answers: this.answers
    };
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  getQuestionCount() {
    return this.questions.length;
  }

  getCurrentQuestionIndex() {
    return this.currentQuestionIndex;
  }
}
