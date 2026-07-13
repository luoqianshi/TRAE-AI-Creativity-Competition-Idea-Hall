class MultipleChoiceGame extends Game {
  constructor(chapter, level) {
    super(chapter, level);
  }

  init() {
    this.questions = this.chapter.getLevelQuestions(this.level);
  }

  start() {
    super.start();
  }

  answer(selectedOption) {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return null;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      this.score++;
    }

    this.answers.push({
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      explanation: currentQuestion.explanation
    });

    return {
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
      question: currentQuestion
    };
  }

  nextQuestion() {
    return super.nextQuestion();
  }

  finish() {
    return super.finish();
  }
}
