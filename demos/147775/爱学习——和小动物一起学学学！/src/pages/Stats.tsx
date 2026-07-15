import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Clock, Target, Flame, Trophy, Star, Calendar } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';

export const Stats = () => {
  const { stats, gameSessions } = useGameStore();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const categoryStats = {
    numbers: gameSessions.filter(s => s.category === 'numbers').length,
    colors: gameSessions.filter(s => s.category === 'colors').length,
    vocabulary: gameSessions.filter(s => s.category === 'vocabulary').length,
  };

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
        <h1 className="text-2xl font-bold text-gray-800">📊 学习统计</h1>
        <div className="w-20" />
      </header>

      <section className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          title="学习天数"
          value={`${stats.streakDays} 天`}
          emoji="📅"
          color="border-blue-400"
        />
        <StatCard
          title="完成关卡"
          value={stats.completedLevels}
          emoji="🎯"
          color="border-green-400"
        />
        <StatCard
          title="答题正确率"
          value={`${stats.correctRate}%`}
          emoji="✅"
          color="border-purple-400"
        />
        <StatCard
          title="游戏次数"
          value={stats.totalGamesPlayed}
          emoji="🎮"
          color="border-orange-400"
        />
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          连续学习
        </h2>
        
        <div className="bg-white/80 rounded-2xl p-6 shadow-md text-center">
          <div className="text-6xl mb-4">
            {stats.streakDays >= 7 ? '🏆' : stats.streakDays >= 3 ? '🔥' : stats.streakDays >= 1 ? '⭐' : '🌱'}
          </div>
          <p className="text-2xl font-bold text-gray-800">
            连续学习 {stats.streakDays} 天
          </p>
          {stats.streakDays >= 7 && (
            <p className="text-lg text-sunny-yellow mt-2">🎉 太棒了！获得学习之星称号！</p>
          )}
          {stats.streakDays >= 3 && stats.streakDays < 7 && (
            <p className="text-lg text-orange-500 mt-2">🔥 继续加油！坚持就是胜利！</p>
          )}
          {stats.streakDays === 0 && (
            <p className="text-lg text-gray-500 mt-2">🌱 今天开始你的学习之旅吧！</p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          学习进度
        </h2>
        
        <div className="bg-white/80 rounded-2xl p-6 shadow-md">
          <ProgressBar progress={stats.correctRate} label="正确率" />
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="text-xl">🔢</span>
                <span>数字识别</span>
              </span>
              <span className="font-bold">{categoryStats.numbers} 次</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <span>颜色认知</span>
              </span>
              <span className="font-bold">{categoryStats.colors} 次</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <span>简单词汇</span>
              </span>
              <span className="font-bold">{categoryStats.vocabulary} 次</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-sunny-yellow" />
          成就徽章
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              emoji: '🎯',
              title: '初学者',
              description: '完成第一次学习',
              unlocked: stats.totalGamesPlayed >= 1,
            },
            {
              emoji: '🔥',
              title: '坚持者',
              description: '连续学习3天',
              unlocked: stats.streakDays >= 3,
            },
            {
              emoji: '⭐',
              title: '学霸',
              description: '正确率达到80%',
              unlocked: stats.correctRate >= 80,
            },
            {
              emoji: '🏆',
              title: '学习之星',
              description: '连续学习7天',
              unlocked: stats.streakDays >= 7,
            },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl ${
                achievement.unlocked
                  ? 'bg-white/80 shadow-md'
                  : 'bg-gray-100 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.unlocked ? achievement.emoji : '🔒'}</div>
              <p className="font-bold text-gray-800">{achievement.title}</p>
              <p className="text-sm text-gray-500">{achievement.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
