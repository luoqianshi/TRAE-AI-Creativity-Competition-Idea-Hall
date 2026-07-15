import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameQuestion } from '../components/GameQuestion';
import { GameOption } from '../components/GameOption';
import { ArrowLeft, CheckCircle, XCircle, Star, Zap } from 'lucide-react';
import { QuestionCategory } from '../types';

export const Game = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const {
    startGame,
    questions,
    currentQuestionIndex,
    answerQuestion,
    nextQuestion,
    score,
    correctCount,
    currentAnimalId,
    animals,
  } = useGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const category = searchParams.get('category') as QuestionCategory || 'numbers';
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnimal = animals.find((a) => a.id === currentAnimalId);

  useEffect(() => {
    if (!currentQuestion) {
      startGame(category);
    }
  }, [category, currentQuestion, startGame]);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    const correct = answerQuestion(answer);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
    nextQuestion();
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">加载中...</div>
      </div>
    );
  }

  const categoryNames: Record<QuestionCategory, string> = {
    numbers: '数字识别',
    colors: '颜色认知',
    vocabulary: '简单词汇',
  };

  return (
    <div className="min-h-screen p-4 relative">
      {confetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {['⭐', '🌟', '💫', '🎊', '🎉'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <header className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg">返回</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-sunny-yellow fill-sunny-yellow" />
            <span className="text-lg font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-bold">{correctCount}</span>
          </div>
        </div>
      </header>

      <div className="text-center mb-4">
        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-lg font-bold">
          {categoryNames[category]}
        </span>
      </div>

      {currentAnimal && (
        <div className="text-center mb-4">
          <span className="text-4xl animate-bounce-slow">{currentAnimal.emoji}</span>
          <p className="text-gray-600">和 {currentAnimal.name} 一起学习！</p>
        </div>
      )}

      <GameQuestion
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <GameOption
            key={option}
            option={option}
            isSelected={selectedAnswer === option}
            isCorrect={isCorrect && option === currentQuestion.correctAnswer}
            isIncorrect={selectedAnswer === option && !isCorrect}
            onClick={() => handleSelectAnswer(option)}
            disabled={selectedAnswer !== null}
          />
        ))}
      </div>

      {showFeedback && (
        <div className={`mt-6 p-4 rounded-2xl ${isCorrect ? 'bg-grass-green' : 'bg-red-400'} text-white text-center pop-animation`}>
          {isCorrect ? (
            <div>
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-2xl font-bold">太棒了！🎉</p>
              <p className="text-lg">获得 10 经验值！</p>
            </div>
          ) : (
            <div>
              <XCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-2xl font-bold">加油哦！💪</p>
              <p className="text-lg">正确答案是：{currentQuestion.correctAnswer}</p>
            </div>
          )}
          
          <button
            onClick={handleNext}
            className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-full font-bold hover:bg-gray-100 transition-colors"
          >
            {currentQuestionIndex < questions.length - 1 ? '下一题' : '完成'}
          </button>
        </div>
      )}
    </div>
  );
};
