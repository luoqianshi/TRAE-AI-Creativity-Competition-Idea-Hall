import { useNavigate } from 'react-router-dom';
import { RefreshCw, Flame, Target } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import StatCard from '../components/StatCard/StatCard';
import NavButton from '../components/NavButton/NavButton';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { GRADE_LABELS } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { getStats, settings, generateLearnList, generateTest } = useAppStore();
  const stats = getStats();

  const handleStartLearn = () => {
    generateLearnList(15, settings.selectedGrade, true);
    navigate('/learn');
  };

  const handleStartTest = () => {
    const ok = generateTest('choice', 10, settings.selectedGrade);
    if (ok) navigate('/test');
  };

  const handleStartFill = () => {
    const ok = generateTest('fill', 8, settings.selectedGrade);
    if (ok) navigate('/test');
  };

  const todayPct = Math.min(100, Math.round((stats.todayLearned / settings.dailyGoal) * 100));

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 欢迎区域 */}
      <section className="card-gradient bg-gradient-to-br from-kid-sky via-kid-lemon/50 to-kid-mint relative overflow-hidden animate-slide-up">
        <div className="absolute inset-0 bg-stripes opacity-20" />
        <div className="absolute -top-10 -right-10 text-[140px] md:text-[180px] opacity-20 animate-float">🎈</div>
        <div className="absolute -bottom-12 -left-6 text-[110px] md:text-[140px] opacity-15 animate-float" style={{ animationDelay: '1s' }}>🌈</div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-sm text-kid-text font-kid font-bold text-xs md:text-sm mb-3">
              <span className="animate-wiggle inline-block">👋</span>
              欢迎回来，小小学霸！
            </p>
            <h2 className="title-kid text-3xl md:text-5xl text-white text-stroke mb-3">
              今天也要加油 <span className="animate-wiggle inline-block">💪</span>
            </h2>
            <p className="font-kid text-sm md:text-base text-white/95 max-w-md">
              {settings.selectedGrade === 'all' ? '全部年级' : GRADE_LABELS[settings.selectedGrade]} ·
              {' '}已学 {stats.todayLearned}/{settings.dailyGoal} 个单词 ·
              {' '}目标进度 {todayPct}%
            </p>
            <div className="mt-4 w-full md:w-80">
              <ProgressBar value={todayPct} color="mint" size="lg" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="text-7xl animate-bounce-slow">🦄</div>
            <div className="text-5xl animate-wiggle" style={{ animationDelay: '0.3s' }}>🎒</div>
          </div>
        </div>
      </section>

      {/* 统计卡片 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard
          icon="🏆"
          label="已掌握"
          value={stats.mastered}
          gradient="from-kid-mint to-green-500"
          subtitle={`共 ${stats.total} 词`}
        />
        <StatCard
          icon="📖"
          label="学习中"
          value={stats.learning}
          gradient="from-kid-sky to-blue-500"
          subtitle="继续加油"
        />
        <StatCard
          icon="🔔"
          label="待复习"
          value={stats.needReview}
          gradient="from-kid-coral to-orange-500"
          subtitle="记得回顾哦"
        />
        <StatCard
          icon="✅"
          label="正确率"
          value={stats.totalAccuracy}
          gradient="from-kid-lavender to-purple-500"
          subtitle={`${stats.totalTests} 次测试`}
        />
      </section>

      {/* 待复习提醒 */}
      {stats.needReview > 0 && (
        <section
          className="card-kid bg-gradient-to-r from-kid-lemon/30 via-white to-kid-coral/30 border-4 border-kid-lemon/50 cursor-pointer hover:scale-[1.01] transition-all animate-pop"
          onClick={handleStartLearn}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-kid-lemon to-kid-coral flex items-center justify-center text-3xl md:text-4xl shadow-kid animate-pulse-slow shrink-0">
              <RefreshCw size={32} className="text-white animate-spin-slow" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="title-kid text-lg md:text-xl text-kid-coral mb-1 flex items-center gap-2">
                <Flame size={20} className="text-kid-coral" />
                今日待复习提醒
              </h3>
              <p className="font-kid text-sm md:text-base text-kid-text">
                有 <span className="text-kid-coral font-extrabold text-xl">{stats.needReview}</span> 个单词等着你复习哦，复习能记得更牢！
              </p>
            </div>
            <div className="hidden sm:block px-5 py-3 rounded-xl bg-gradient-to-br from-kid-coral to-orange-500 text-white font-kid font-bold shadow-kid animate-bounce-slow">
              马上复习 →
            </div>
          </div>
        </section>
      )}

      {/* 功能导航 */}
      <section>
        <h3 className="title-kid text-xl md:text-2xl mb-4 flex items-center gap-2 text-kid-text">
          <Target className="text-kid-lavender" size={24} />
          选择今天要做的事
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <NavButton
            icon="📚"
            title="开始学习"
            subtitle="单词卡片 + 发音 + 拼写"
            gradient="from-kid-sky via-blue-400 to-indigo-400"
            onClick={handleStartLearn}
          />
          <NavButton
            icon="🎯"
            title="选择测试"
            subtitle="四选一趣味答题"
            gradient="from-kid-coral via-orange-400 to-amber-400"
            onClick={handleStartTest}
            badge={stats.needReview > 0 ? stats.needReview : undefined}
          />
          <NavButton
            icon="✏️"
            title="填空测试"
            subtitle="根据释义写单词"
            gradient="from-kid-mint via-green-400 to-teal-400"
            onClick={handleStartFill}
          />
          <NavButton
            icon="📊"
            title="学习报告"
            subtitle="查看进度和成就"
            gradient="from-kid-lavender via-purple-400 to-pink-400"
            onClick={() => navigate('/progress')}
          />
        </div>
      </section>

      {/* 快速操作 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-kid">
          <div className="flex items-center justify-between mb-4">
            <h4 className="title-kid text-lg text-kid-sky flex items-center gap-2">
              <span>📖</span> 浏览单词库
            </h4>
            <button
              onClick={() => navigate('/vocabulary')}
              className="btn-sky !py-2 !px-4 !text-sm"
            >
              查看全部 →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {(['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const).map((g, i) => {
              const count = useAppStore.getState().words.filter((w) => w.category === g).length;
              const mastered = useAppStore.getState().words.filter(
                (w) => w.category === g && useAppStore.getState().learningRecords[w.id]?.status === 'mastered'
              ).length;
              const colors = [
                'from-kid-sky/20 to-blue-200 text-kid-sky border-kid-sky/30',
                'from-kid-mint/20 to-green-200 text-green-600 border-kid-mint/30',
                'from-kid-lemon/30 to-yellow-200 text-amber-700 border-kid-lemon/50',
                'from-kid-coral/20 to-orange-200 text-kid-coral border-kid-coral/30',
                'from-kid-lavender/20 to-purple-200 text-kid-lavender border-kid-lavender/30',
                'from-kid-pink/20 to-rose-200 text-kid-pink border-kid-pink/30',
              ];
              return (
                <div
                  key={g}
                  className={`p-3 rounded-2xl border-2 bg-gradient-to-br ${colors[i]} transition-all hover:scale-105 cursor-pointer`}
                  onClick={() => {
                    useAppStore.getState().setSelectedGrade(g);
                    navigate('/vocabulary');
                  }}
                >
                  <p className="font-kid font-bold text-sm md:text-base">{GRADE_LABELS[g]}</p>
                  <p className="text-xs font-kid mt-1 opacity-80">
                    {mastered}/{count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-gradient bg-gradient-to-br from-kid-lemon via-kid-pink/70 to-kid-lavender relative overflow-hidden">
          <div className="absolute inset-0 bg-stripes opacity-20" />
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-25 rotate-12">🎪</div>
          <div className="relative text-white">
            <h4 className="title-kid text-xl mb-2">💡 小提示</h4>
            <ul className="font-kid text-sm md:text-base space-y-2 opacity-95">
              <li className="flex items-start gap-2">
                <span>🔊</span>
                <span>每个单词都要点小喇叭听发音，多听几遍记得更清楚！</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔁</span>
                <span>学过的单词24小时后一定要复习，效果翻倍哦！</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🎮</span>
                <span>学习和测试交替进行，保持大脑活跃不犯困～</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏅</span>
                <span>坚持每天打卡，很快就能成为单词小达人！</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
