import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { AnimalCard } from '../components/AnimalCard';
import { AnimalStatus } from '../components/AnimalStatus';
import { Play, Trophy, BarChart3, Sparkles } from 'lucide-react';
import { QuestionCategory } from '../types';

export const Home = () => {
  const { animals, currentAnimalId, selectAnimal } = useGameStore();
  const navigate = useNavigate();

  const currentAnimal = animals.find((a) => a.id === currentAnimalId);

  const handleStartGame = (category: QuestionCategory) => {
    if (!currentAnimalId) return;
    navigate(`/game?category=${category}`);
  };

  return (
    <div className="min-h-screen p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🎓 爱学习
          <span className="text-3xl ml-2">✨</span>
        </h1>
        <p className="text-xl text-gray-600">和小动物一起学学学！</p>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sunny-yellow" />
          选择你的学习伙伴
        </h2>
        <div className="flex justify-center gap-6">
          {animals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              isSelected={animal.id === currentAnimalId}
              onClick={() => selectAnimal(animal.id)}
            />
          ))}
        </div>
      </section>

      {currentAnimal && (
        <section className="mb-6">
          <AnimalStatus animal={currentAnimal} />
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-500" />
          开始学习
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => handleStartGame('numbers')}
            className="btn-primary flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🔢</span>
            <span>数字识别</span>
          </button>
          <button
            onClick={() => handleStartGame('colors')}
            className="btn-primary flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #87CEEB, #40E0D0)' }}
          >
            <span className="text-2xl">🎨</span>
            <span>颜色认知</span>
          </button>
          <button
            onClick={() => handleStartGame('vocabulary')}
            className="btn-primary flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #98FB98, #ADFF2F)' }}
          >
            <span className="text-2xl">📚</span>
            <span>简单词汇</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/growth')}
          className="btn-secondary flex flex-col items-center gap-2"
        >
          <Trophy className="w-8 h-8 text-sunny-yellow" />
          <span>动物成长</span>
        </button>
        <button
          onClick={() => navigate('/stats')}
          className="btn-secondary flex flex-col items-center gap-2"
        >
          <BarChart3 className="w-8 h-8 text-blue-500" />
          <span>学习统计</span>
        </button>
      </section>
    </div>
  );
};
