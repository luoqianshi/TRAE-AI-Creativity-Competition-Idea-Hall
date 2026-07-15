import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Target, CheckCircle, XCircle, RotateCcw, Home, BookOpen, RefreshCw, Volume2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import StarRating from '../components/StarRating/StarRating';
import { formatDuration } from '../utils/date';
import { useSpeech } from '../hooks/useSpeech';

export default function TestResultPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { words, getTestRecordById, testRecords, generateTest, learningRecords, settings } = useAppStore();
  const { speakWord } = useSpeech();

  const idParam = params.get('id');
  const record = useMemo(() => {
    if (idParam) return getTestRecordById(Number(idParam));
    // fallback to latest
    return testRecords[0];
  }, [idParam, getTestRecordById, testRecords]);

  const stars = useMemo(() => {
    if (!record) return 0;
    const acc = record.totalCount === 0 ? 0 : record.correctCount / record.totalCount;
    if (acc >= 0.98) return 5;
    if (acc >= 0.85) return 4;
    if (acc >= 0.7) return 3;
    if (acc >= 0.5) return 2;
    return 1;
  }, [record]);

  const wrongWords = useMemo(() => {
    if (!record) return [];
    return record.wrongWordIds
      .map((id) => words.find((w) => w.id === id))
      .filter(Boolean) as typeof words;
  }, [record, words]);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-5 text-center">
        <div className="text-8xl animate-float">📭</div>
        <h2 className="title-kid text-3xl text-kid-coral">还没有测试记录哦</h2>
        <p className="font-kid text-kid-textLight max-w-md">先去完成一次测试，然后再来查看你的成绩单吧！</p>
        <button onClick={() => navigate('/test')} className="btn-coral !text-lg">
          <Target size={22} /> 现在去测试
        </button>
      </div>
    );
  }

  const accuracy = record.totalCount === 0 ? 0 : Math.round((record.correctCount / record.totalCount) * 100);
  const isChoice = record.testType === 'choice';

  const handleRetry = () => {
    const ok = generateTest(record.testType, record.totalCount, settings.selectedGrade);
    if (ok) navigate('/test');
  };

  const handleReviewWords = () => {
    // 设置学习列表为错题
    const list = wrongWords.length > 0 ? wrongWords.map((w) => w.id) : [];
    if (list.length > 0) {
      useAppStore.getState().setCurrentLearnList(list);
      navigate('/learn');
    }
  };

  // 彩带装饰
  const confettiColors = ['from-kid-sky', 'from-kid-coral', 'from-kid-lemon', 'from-kid-mint', 'from-kid-lavender', 'from-kid-pink'];

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* 背景彩带 */}
      <div className="absolute inset-0 pointer-events-none">
        {accuracy >= 70 && Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-8 rounded-full bg-gradient-to-b ${confettiColors[i % confettiColors.length]} opacity-80 animate-confetti`}
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${-20 - (i % 5) * 8}%`,
              animationDelay: `${(i * 0.08) % 1}s`,
              animationDuration: `${1.2 + (i % 4) * 0.2}s`,
              animationIterationCount: 'infinite',
            }}
          />
        ))}
      </div>

      {/* 顶部导航 */}
      <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
        <button
          onClick={() => navigate('/test')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-kid font-kid font-bold text-sm text-kid-text hover:scale-105 transition-all"
        >
          <ArrowLeft size={18} /> 返回测试
        </button>
        <h1 className="title-kid text-xl md:text-2xl text-kid-sky flex items-center gap-2">
          <Trophy size={26} /> 测试成绩单
        </h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-kid font-kid font-bold text-sm text-kid-text hover:scale-105 transition-all"
        >
          <Home size={18} /> 回首页
        </button>
      </div>

      {/* 主成绩单卡片 */}
      <div className="card-gradient bg-gradient-to-br from-kid-lemon via-kid-coral/70 to-kid-pink text-white relative overflow-hidden p-6 md:p-10 animate-pop">
        <div className="absolute inset-0 bg-stripes opacity-25" />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/15 blur-3xl" />

        <div className="relative text-center space-y-5">
          <div className="text-7xl md:text-8xl animate-bounce-slow">
            {accuracy >= 85 ? '🏆' : accuracy >= 60 ? '🎖️' : '💪'}
          </div>
          <StarRating value={stars} size="xl" />
          <div>
            <p className="font-kid text-sm md:text-base opacity-95 mb-1">总正确率</p>
            <p className="title-kid text-5xl md:text-7xl text-stroke">{accuracy}%</p>
          </div>
          <p className="font-kid text-base md:text-xl opacity-95">
            {isChoice ? '🎯 选择题测试' : '✏️ 填空题测试'} ·
            {record.category !== 'all' && record.category ? ` ${record.category.replace('grade', '').replace(/^/, '').padStart(1, ' ')}年级` : ' 综合测试'}
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
        <div className="card-kid text-center">
          <Target size={24} className="mx-auto text-kid-sky mb-1" />
          <p className="title-kid text-3xl text-kid-sky">{record.totalCount}</p>
          <p className="font-kid text-xs md:text-sm text-kid-textLight">总题数</p>
        </div>
        <div className="card-kid text-center">
          <CheckCircle size={24} className="mx-auto text-kid-mint mb-1" />
          <p className="title-kid text-3xl text-kid-mint">{record.correctCount}</p>
          <p className="font-kid text-xs md:text-sm text-kid-textLight">答对</p>
        </div>
        <div className="card-kid text-center">
          <XCircle size={24} className="mx-auto text-kid-coral mb-1" />
          <p className="title-kid text-3xl text-kid-coral">{record.wrongCount}</p>
          <p className="font-kid text-xs md:text-sm text-kid-textLight">答错</p>
        </div>
        <div className="card-kid text-center">
          <Clock size={24} className="mx-auto text-kid-lavender mb-1" />
          <p className="title-kid text-3xl text-kid-lavender">{formatDuration(record.durationSeconds)}</p>
          <p className="font-kid text-xs md:text-sm text-kid-textLight">用时</p>
        </div>
      </div>

      {/* 错题回顾 */}
      {wrongWords.length > 0 && (
        <div className="card-kid relative z-10 space-y-4 border-4 border-kid-coral/20 bg-gradient-to-br from-kid-coral/5 via-white to-kid-lemon/5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="title-kid text-xl text-kid-coral flex items-center gap-2">
              <RefreshCw size={22} /> 错题回顾（{wrongWords.length}）
            </h3>
            <button
              onClick={handleReviewWords}
              className="btn-coral !py-2 !text-sm"
            >
              <BookOpen size={18} /> 针对性复习
            </button>
          </div>
          <p className="font-kid text-sm md:text-base text-kid-text mb-3">
            👆 以下单词需要多加练习哦，点右边喇叭可以听发音～
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {wrongWords.map((w) => {
              const rec = learningRecords[w.id];
              return (
                <div
                  key={w.id}
                  className="flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-white border-2 border-kid-coral/30 hover:border-kid-coral hover:scale-[1.01] transition-all"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-kid-coral/20 to-kid-lemon/30 flex items-center justify-center text-2xl md:text-3xl shrink-0">
                    {w.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="title-kid text-lg md:text-xl text-kid-text truncate">{w.word}</p>
                    <p className="font-kid text-xs md:text-sm text-kid-textLight truncate">
                      {w.meaning}
                    </p>
                    {rec && (
                      <p className="font-kid text-[11px] md:text-xs text-kid-coral mt-0.5">
                        正确 {rec.correctCount} / 错误 {rec.wrongCount}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => speakWord(w.word)}
                    className="shrink-0 w-10 h-10 rounded-full bg-kid-sky/20 flex items-center justify-center hover:bg-kid-sky hover:text-white transition-all text-kid-sky"
                  >
                    <Volume2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 relative z-10">
        <button onClick={handleRetry} className="btn-coral !text-base md:!text-lg">
          <RotateCcw size={20} /> 再来一次
        </button>
        <button onClick={() => navigate('/learn')} className="btn-sky !text-base md:!text-lg">
          <BookOpen size={20} /> 再学习一下
        </button>
        <button onClick={() => navigate('/progress')} className="btn-lavender !text-base md:!text-lg">
          <Trophy size={20} /> 查看历史成绩
        </button>
      </div>

      {/* 鼓励语 */}
      <div className="text-center space-y-2 relative z-10 py-4">
        <p className="font-kid text-lg md:text-xl text-kid-text">
          {accuracy >= 90 ? '🌟 完美！你是单词小天才！继续保持！🌟' :
           accuracy >= 70 ? '👏 表现很不错，再努力一点就满分啦！' :
           accuracy >= 50 ? '💪 有进步空间哦，多复习几遍就记住了！' :
           '🌱 慢慢来，每天学一点就会越来越厉害的！'}
        </p>
        <p className="font-kid text-sm text-kid-textLight">
          测试时间：{new Date(record.createdAt).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
