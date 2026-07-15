import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Star, Zap, Award } from 'lucide-react';
import { AnimalStatus } from '../components/AnimalStatus';

export const Growth = () => {
  const { animals, currentAnimalId } = useGameStore();
  const navigate = useNavigate();

  const currentAnimal = animals.find((a) => a.id === currentAnimalId);

  const handleBack = () => {
    navigate('/');
  };

  const levelRewards = [
    { level: 1, description: '解锁小星星', emoji: '⭐' },
    { level: 2, description: '解锁闪亮星', emoji: '🌟' },
    { level: 3, description: '解锁彩虹', emoji: '🌈' },
    { level: 4, description: '解锁礼物', emoji: '🎁' },
    { level: 5, description: '解锁独角兽', emoji: '🦄' },
    { level: 6, description: '解锁糖果', emoji: '🍭' },
    { level: 7, description: '解锁蝴蝶', emoji: '🦋' },
    { level: 8, description: '解锁皇冠', emoji: '👑' },
  ];

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg">返回</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">🐾 动物成长</h1>
        <div className="w-20" />
      </header>

      {currentAnimal && (
        <section className="mb-6">
          <AnimalStatus animal={currentAnimal} />
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-sunny-yellow" />
          等级奖励
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {levelRewards.map((reward) => {
            const isUnlocked = currentAnimal?.level >= reward.level;
            const isCurrent = currentAnimal?.level === reward.level;
            
            return (
              <div
                key={reward.level}
                className={`p-4 rounded-2xl ${
                  isUnlocked
                    ? 'bg-white/80 shadow-md'
                    : 'bg-gray-100 opacity-50'
                } ${isCurrent ? 'ring-2 ring-sunny-yellow' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{isUnlocked ? reward.emoji : '🔒'}</span>
                  <span className="text-lg font-bold text-gray-700">
                    Lv.{reward.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{reward.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-sunny-yellow" />
          成长小贴士
        </h2>
        
        <div className="bg-white/80 rounded-2xl p-4 shadow-md">
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-xl">📚</span>
              <span>每天完成学习任务可以获得经验值</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">✅</span>
              <span>答对题目可以获得更多经验值</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">⭐</span>
              <span>升级后可以解锁更多奖励哦！</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">🎯</span>
              <span>完成所有学习关卡可以快速升级</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          当前状态
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-sunny-yellow" />
              <div>
                <p className="text-sm text-gray-500">总等级</p>
                <p className="text-2xl font-bold">{currentAnimal?.level || 1}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">总经验</p>
                <p className="text-2xl font-bold">{currentAnimal?.exp || 0}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">已获得奖励</p>
                <p className="text-2xl font-bold">{currentAnimal?.rewards.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-sm text-gray-500">距离下一等级</p>
                <p className="text-2xl font-bold">
                  {currentAnimal ? currentAnimal.maxExp - currentAnimal.exp : 100}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
