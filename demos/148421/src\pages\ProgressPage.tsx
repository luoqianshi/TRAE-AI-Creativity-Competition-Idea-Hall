import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Flame, Calendar, Award, BookOpen, Target, Sparkles, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { todayKey, addDays, formatDate } from '../utils/date';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import StarRating from '../components/StarRating/StarRating';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { words, learningRecords, testRecords, dailyStats, settings } = useAppStore();
  const stats = useAppStore((s) => s.getStats());

  // 各年级掌握情况
  const gradeStats = useMemo(() => {
    return (['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const).map((g) => {
      const arr = words.filter((w) => w.category === g);
      const mastered = arr.filter((w) => learningRecords[w.id]?.status === 'mastered').length;
      const learning = arr.filter((w) => learningRecords[w.id]?.status === 'learning').length;
      const total = arr.length;
      const pct = total === 0 ? 0 : Math.round((mastered / total) * 100);
      return { grade: g, total, mastered, learning, pct };
    });
  }, [words, learningRecords]);

  // 学习状态分布
  const statusDist = useMemo(() => {
    return [
      { key: 'mastered', label: '已掌握', value: stats.mastered, color: 'bg-kid-mint', text: 'text-kid-mint' },
      { key: 'need_review', label: '待复习', value: stats.needReview, color: 'bg-kid-coral', text: 'text-kid-coral' },
      { key: 'learning', label: '学习中', value: stats.learning, color: 'bg-kid-sky', text: 'text-kid-sky' },
      { key: 'not_started', label: '未学习', value: stats.notStarted, color: 'bg-gray-300', text: 'text-gray-500' },
    ];
  }, [stats]);

  // 学习日历（最近30天）
  const calendarData = useMemo(() => {
    const days: { date: string; learned: number; tested: number; intensity: 0 | 1 | 2 | 3 | 4 }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = addDays(today, -i);
      const key = todayKey(d);
      const stat = dailyStats[key];
      const learned = stat?.wordsLearned ?? 0;
      const tested = stat?.wordsTested ?? 0;
      const total = learned + tested;
      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (total >= 40) intensity = 4;
      else if (total >= 20) intensity = 3;
      else if (total >= 10) intensity = 2;
      else if (total >= 1) intensity = 1;
      days.push({ date: key, learned, tested, intensity });
    }
    return days;
  }, [dailyStats]);

  // 连续打卡天数
  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const d = addDays(new Date(), -i);
      const key = todayKey(d);
      const stat = dailyStats[key];
      if ((stat?.wordsLearned ?? 0) + (stat?.wordsTested ?? 0) > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [dailyStats]);

  // 最近7天学习量
  const weeklyData = useMemo(() => {
    const arr: { label: string; learned: number; tested: number; key: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i);
      const key = todayKey(d);
      const stat = dailyStats[key];
      arr.push({
        label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
        learned: stat?.wordsLearned ?? 0,
        tested: stat?.wordsTested ?? 0,
        key,
      });
    }
    return arr;
  }, [dailyStats]);

  const weeklyMax = Math.max(5, ...weeklyData.map((d) => d.learned + d.tested));

  // 最近测试记录
  const recentTests = testRecords.slice(0, 5);

  // 成就徽章
  const achievements = useMemo(() => {
    const list: { icon: string; title: string; desc: string; unlocked: boolean; progress?: number }[] = [];
    list.push({
      icon: '🌱', title: '初次学习', desc: '完成第一个单词学习',
      unlocked: stats.total - stats.notStarted >= 1,
    });
    list.push({
      icon: '📚', title: '小小学霸', desc: '掌握10个单词',
      unlocked: stats.mastered >= 10,
      progress: Math.min(100, Math.round((stats.mastered / 10) * 100)),
    });
    list.push({
      icon: '🎯', title: '满分达人', desc: '在测试中获得满分',
      unlocked: testRecords.some((t) => t.correctCount === t.totalCount && t.totalCount >= 5),
    });
    list.push({
      icon: '🔥', title: '三天连续', desc: '连续学习打卡3天',
      unlocked: streakDays >= 3,
      progress: Math.min(100, Math.round((streakDays / 3) * 100)),
    });
    list.push({
      icon: '🏆', title: '单词大师', desc: '掌握50个单词',
      unlocked: stats.mastered >= 50,
      progress: Math.min(100, Math.round((stats.mastered / 50) * 100)),
    });
    list.push({
      icon: '⭐', title: '坚持一周', desc: '连续学习7天',
      unlocked: streakDays >= 7,
      progress: Math.min(100, Math.round((streakDays / 7) * 100)),
    });
    return list;
  }, [stats, testRecords, streakDays]);

  const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const firstMonth = calendarData.length > 0 ? new Date(calendarData[0].date).getMonth() : 0;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* 头部总览 */}
      <div className="card-gradient bg-gradient-to-br from-kid-sky via-kid-lavender to-kid-pink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-20" />
        <div className="absolute -right-14 -top-14 text-[180px] opacity-20 animate-float">🏆</div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="title-kid text-3xl md:text-5xl text-stroke mb-2 flex items-center gap-3">
              <Trophy size={40} /> 学习报告
            </h2>
            <p className="font-kid opacity-95 text-sm md:text-lg">
              已累计学习 <b>{stats.total - stats.notStarted}</b> 个单词 · 正确率 <b>{stats.totalAccuracy}</b> · 总测试 <b>{stats.totalTests}</b> 次
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="w-20 md:w-28 h-20 md:h-28 rounded-2xl-kid bg-white/25 backdrop-blur-sm text-center flex flex-col items-center justify-center border-2 border-white/40">
              <Award size={22} className="mb-0.5 md:mb-1" />
              <span className="title-kid text-2xl md:text-4xl text-stroke">{stats.mastered}</span>
              <span className="font-kid text-[10px] md:text-xs opacity-90">已掌握</span>
            </div>
            <div className="w-20 md:w-28 h-20 md:h-28 rounded-2xl-kid bg-white/25 backdrop-blur-sm text-center flex flex-col items-center justify-center border-2 border-white/40">
              <Flame size={22} className="mb-0.5 md:mb-1" />
              <span className="title-kid text-2xl md:text-4xl text-stroke">{streakDays}</span>
              <span className="font-kid text-[10px] md:text-xs opacity-90">连续天数</span>
            </div>
            <div className="w-20 md:w-28 h-20 md:h-28 rounded-2xl-kid bg-white/25 backdrop-blur-sm text-center flex flex-col items-center justify-center border-2 border-white/40">
              <TrendingUp size={22} className="mb-0.5 md:mb-1" />
              <span className="title-kid text-2xl md:text-4xl text-stroke">{stats.totalAccuracy}</span>
              <span className="font-kid text-[10px] md:text-xs opacity-90">正确率</span>
            </div>
          </div>
        </div>
      </div>

      {/* 学习状态分布 + 年级进度 */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <div className="card-kid">
          <h3 className="title-kid text-xl mb-4 flex items-center gap-2 text-kid-lavender">
            <Sparkles size={22} /> 单词掌握分布
          </h3>
          <div className="flex items-center gap-6 mb-5">
            <div className="relative w-36 h-36 md:w-40 md:h-40 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const total = stats.total || 1;
                  let offset = 0;
                  const radius = 16;
                  const circ = 2 * Math.PI * radius;
                  const segments = statusDist.map((s) => {
                    const len = (s.value / total) * circ;
                    const el = (
                      <circle
                        key={s.key}
                        cx="18"
                        cy="18"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeDasharray={`${len} ${circ - len}`}
                        strokeDashoffset={-offset}
                        className={s.color}
                        strokeLinecap="round"
                      />
                    );
                    offset += len;
                    return el;
                  });
                  return segments;
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="title-kid text-3xl md:text-4xl text-kid-text">{stats.total}</span>
                <span className="font-kid text-xs text-kid-textLight">总单词</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {statusDist.map((s) => {
                const pct = stats.total === 0 ? 0 : Math.round((s.value / stats.total) * 100);
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between text-sm font-kid mb-1">
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${s.color}`} />
                        {s.label}
                      </span>
                      <span className={s.text}>
                        <b>{s.value}</b> · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card-kid">
          <h3 className="title-kid text-xl mb-4 flex items-center gap-2 text-kid-sky">
            <BookOpen size={22} /> 各年级进度
          </h3>
          <div className="space-y-3">
            {gradeStats.map((g, i) => {
              const colors = [
                'sky', 'mint', 'lemon', 'coral', 'lavender', 'pink'
              ] as const;
              const color = colors[i];
              return (
                <div key={g.grade}>
                  <div className="flex items-center justify-between text-sm md:text-base font-kid mb-1.5">
                    <span className="font-bold">
                      {`${['🌱','🌿','🌳','🌸','🎓','🚀'][i]} ${(['一','二','三','四','五','六'] as const)[i]}年级`}
                    </span>
                    <span className="text-kid-textLight">
                      <b className={`text-${color}`}>{g.mastered}</b>
                      <span className="text-gray-400"> / </span>
                      {g.total} · {g.pct}%
                    </span>
                  </div>
                  <ProgressBar value={g.pct} color={color} size="md" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 每日目标 + 学习日历 */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <div className="card-gradient bg-gradient-to-br from-kid-lemon via-kid-coral/80 to-kid-pink text-white relative overflow-hidden p-5 md:p-6">
          <div className="absolute inset-0 bg-stripes opacity-20" />
          <div className="absolute -right-4 -bottom-6 text-8xl opacity-25 animate-bounce-slow">🎯</div>
          <div className="relative space-y-4">
            <h3 className="title-kid text-xl md:text-2xl text-stroke flex items-center gap-2">
              <Target size={24} /> 每日目标
            </h3>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="font-kid">今日学习</span>
                <span className="title-kid text-3xl text-stroke">
                  {stats.todayLearned} <span className="text-lg opacity-80">/ {settings.dailyGoal}</span>
                </span>
              </div>
              <ProgressBar
                value={Math.min(100, Math.round((stats.todayLearned / settings.dailyGoal) * 100))}
                color="mint"
                size="lg"
              />
            </div>
            <p className="font-kid text-sm opacity-95 flex items-center gap-2">
              <Flame size={18} />
              {streakDays >= 1 ? `已连续学习 ${streakDays} 天啦！` : '今天开始，坚持学习吧！'}
            </p>
          </div>
        </div>

        <div className="card-kid lg:col-span-2">
          <h3 className="title-kid text-xl mb-4 flex items-center gap-2 text-kid-mint flex-wrap">
            <Calendar size={22} /> 30天学习热力图
            <span className="font-kid text-sm text-kid-textLight font-normal ml-2">
              {calendarData.filter((d) => d.intensity > 0).length} / 30 天有学习记录
            </span>
          </h3>
          <div className="mb-2 flex justify-between font-kid text-xs text-kid-textLight">
            <span>{monthLabels[firstMonth]}</span>
            <span>周日 &nbsp;&nbsp; 周一 &nbsp;&nbsp; 周二 &nbsp;&nbsp; 周三 &nbsp;&nbsp; 周四 &nbsp;&nbsp; 周五 &nbsp;&nbsp; 周六</span>
          </div>
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1.5">
            {/* 周标签 */}
            {['', '', '', '', '', '', ''].map((_, i) => (
              <div key={`week-${i}`} />
            ))}
            {calendarData.map((d) => {
              const classes = [
                'bg-gray-100 border-gray-200',
                'bg-kid-mint/30 border-kid-mint/40',
                'bg-kid-mint/50 border-kid-mint/60',
                'bg-kid-mint/70 border-kid-mint/80',
                'bg-kid-mint border-green-600 text-white',
              ];
              const total = d.learned + d.tested;
              return (
                <div
                  key={d.date}
                  title={`${formatDate(d.date)}：学习${d.learned}个，测试${d.tested}个`}
                  className={`aspect-square rounded-lg border-2 ${classes[d.intensity]} hover:scale-110 transition-transform cursor-pointer flex items-center justify-center`}
                >
                  {d.intensity >= 3 && total >= 10 && (
                    <span className="text-[10px] md:text-xs font-bold">{total}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-3 font-kid text-xs text-kid-textLight">
            <span>少</span>
            {[0, 1, 2, 3, 4].map((i) => {
              const classes = [
                'bg-gray-100',
                'bg-kid-mint/30',
                'bg-kid-mint/50',
                'bg-kid-mint/70',
                'bg-kid-mint',
              ];
              return <div key={i} className={`w-4 h-4 rounded ${classes[i]}`} />;
            })}
            <span>多</span>
          </div>
        </div>
      </div>

      {/* 近7天柱状图 + 最近测试 */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <div className="card-kid">
          <h3 className="title-kid text-xl mb-5 flex items-center gap-2 text-kid-coral">
            <TrendingUp size={22} /> 近7天学习量
          </h3>
          <div className="flex items-end justify-between gap-2 h-44 mb-3 px-1">
            {weeklyData.map((d, i) => {
              const total = d.learned + d.tested;
              const h = Math.round((total / weeklyMax) * 100);
              const max1 = Math.round((d.learned / Math.max(1, total)) * 100);
              const today = i === weeklyData.length - 1;
              return (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-xs font-kid text-kid-text mb-1">{total > 0 ? total : ''}</div>
                  <div className="w-full max-w-12 rounded-t-xl overflow-hidden flex flex-col justify-end shadow-kid" style={{ height: `${Math.max(4, h)}%` }}>
                    <div className="w-full bg-gradient-to-t from-kid-sky to-blue-400" style={{ height: `${100}%`, display: 'flex', flexDirection: 'column-reverse' }}>
                      <div className="w-full bg-gradient-to-t from-kid-coral to-orange-400" style={{ height: `${100 - max1}%` }} />
                    </div>
                  </div>
                  <div className={`font-kid text-sm ${today ? 'font-bold text-kid-coral' : 'text-kid-textLight'}`}>
                    {d.label}{today && ' 今天'}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 font-kid text-xs md:text-sm border-t border-gray-100 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-gradient-to-t from-kid-sky to-blue-400" />
              学习 {weeklyData.reduce((s, d) => s + d.learned, 0)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-gradient-to-t from-kid-coral to-orange-400" />
              测试 {weeklyData.reduce((s, d) => s + d.tested, 0)}
            </span>
          </div>
        </div>

        <div className="card-kid">
          <div className="flex items-center justify-between mb-4">
            <h3 className="title-kid text-xl flex items-center gap-2 text-kid-lavender">
              <Award size={22} /> 最近测试记录
            </h3>
            {recentTests.length > 0 && (
              <button
                onClick={() => navigate('/test')}
                className="text-kid-sky font-kid font-bold text-sm hover:underline flex items-center gap-0.5"
              >
                更多 <ChevronRight size={16} />
              </button>
            )}
          </div>
          {recentTests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-6xl animate-float">📝</div>
              <p className="font-kid text-kid-textLight">还没有测试记录，去挑战一下吧！</p>
              <button onClick={() => navigate('/test')} className="btn-coral mt-2">
                <Target size={18} /> 开始第一次测试
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTests.map((t) => {
                const acc = t.totalCount === 0 ? 0 : Math.round((t.correctCount / t.totalCount) * 100);
                const stars = acc >= 95 ? 5 : acc >= 80 ? 4 : acc >= 65 ? 3 : acc >= 50 ? 2 : 1;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 hover:border-kid-sky/40 hover:bg-kid-sky/5 cursor-pointer transition-all group"
                    onClick={() => navigate(`/test/result?id=${t.id}`)}
                  >
                    <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-kid-lavender/20 to-kid-pink/20 flex items-center justify-center">
                      {t.testType === 'choice' ? '🎯' : '✏️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="font-kid font-bold text-sm md:text-base truncate">
                          {t.testType === 'choice' ? '选择题' : '填空题'}
                          <span className="font-normal text-kid-textLight ml-1">· {t.totalCount}题</span>
                        </p>
                        <StarRating value={stars} size="sm" showLabel={false} animate={false} />
                      </div>
                      <p className="font-kid text-xs md:text-sm text-kid-textLight flex items-center gap-2 flex-wrap">
                        <span className="text-kid-mint font-bold">{t.correctCount}✓</span>
                        <span className="text-kid-coral font-bold">{t.wrongCount}✗</span>
                        <span>正确率 <b className="text-kid-sky">{acc}%</b></span>
                        <span className="text-kid-textLight ml-auto">
                          {new Date(t.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-kid-sky group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 成就 */}
      <div className="card-kid">
        <h3 className="title-kid text-xl mb-5 flex items-center gap-2 text-kid-coral">
          <Sparkles size={22} /> 成就徽章
          <span className="font-kid text-sm text-kid-textLight font-normal">
            （已获得 {achievements.filter((a) => a.unlocked).length} / {achievements.length}）
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {achievements.map((a, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl-kid text-center transition-all ${
                a.unlocked
                  ? 'bg-gradient-to-br from-kid-lemon/30 via-kid-coral/20 to-kid-lavender/30 border-2 border-kid-lemon/60 shadow-kid hover:scale-105'
                  : 'bg-gray-50 border-2 border-dashed border-gray-200 opacity-60 hover:opacity-80'
              }`}
            >
              <div className={`text-4xl md:text-5xl mb-2 inline-block ${a.unlocked ? 'animate-bounce-slow' : 'grayscale'}`}>
                {a.icon}
              </div>
              <p className={`font-kid font-bold text-sm md:text-base mb-0.5 ${a.unlocked ? 'text-kid-text' : 'text-gray-400'}`}>
                {a.title}
              </p>
              <p className={`font-kid text-[11px] md:text-xs mb-2 ${a.unlocked ? 'text-kid-textLight' : 'text-gray-300'}`}>
                {a.desc}
              </p>
              {!a.unlocked && a.progress !== undefined && (
                <ProgressBar value={a.progress} color="lemon" size="sm" />
              )}
              {a.unlocked && (
                <span className="tag-kid bg-kid-mint/25 text-green-700 !text-[10px] md:!text-xs !py-0.5">
                  已获得 ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
