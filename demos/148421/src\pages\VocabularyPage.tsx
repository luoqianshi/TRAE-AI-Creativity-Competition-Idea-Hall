import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Volume2, ChevronRight, Filter, BookMarked } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { GRADE_LABELS, STATUS_LABELS, STATUS_COLORS, type GradeCategory, type LearningStatus } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import ProgressBar from '../components/ProgressBar/ProgressBar';

export default function VocabularyPage() {
  const navigate = useNavigate();
  const { words, learningRecords, settings, setSelectedGrade, setCurrentLearnList } = useAppStore();
  const { speakWord } = useSpeech();

  const [grade, setGrade] = useState<GradeCategory | 'all'>(settings.selectedGrade);
  const [status, setStatus] = useState<LearningStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      if (grade !== 'all' && w.category !== grade) return false;
      const rec = learningRecords[w.id];
      const st = rec?.status ?? 'not_started';
      if (status !== 'all' && st !== status) return false;
      if (q && !w.word.toLowerCase().includes(q) && !w.meaning.includes(search)) return false;
      return true;
    });
  }, [words, learningRecords, grade, status, search]);

  const stats = useMemo(() => {
    const target = grade === 'all' ? words : words.filter((w) => w.category === grade);
    const mastered = target.filter((w) => learningRecords[w.id]?.status === 'mastered').length;
    const total = target.length;
    return { mastered, total, pct: total === 0 ? 0 : Math.round((mastered / total) * 100) };
  }, [words, learningRecords, grade]);

  const handleStartLearn = () => {
    setSelectedGrade(grade);
    const ids = filtered.slice(0, Math.min(20, filtered.length)).map((w) => w.id);
    if (ids.length > 0) {
      setCurrentLearnList(ids);
      navigate('/learn');
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* 头部统计 */}
      <div className="card-gradient bg-gradient-to-br from-kid-lavender via-purple-400 to-kid-pink text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-20" />
        <div className="absolute -right-10 -top-10 text-[140px] opacity-20 animate-float">📚</div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="title-kid text-2xl md:text-4xl text-stroke mb-2 flex items-center gap-2">
              <BookMarked size={28} /> 单词库
            </h2>
            <p className="font-kid opacity-95 text-sm md:text-base">
              {grade === 'all' ? '全部年级' : GRADE_LABELS[grade]} ·
              {' '}共 <b>{stats.total}</b> 个单词 ·
              {' '}已掌握 <b>{stats.mastered}</b> 个
            </p>
          </div>
          <div className="w-full md:w-72 space-y-2">
            <ProgressBar value={stats.pct} color="lemon" size="lg" showLabel />
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="card-kid space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} className="text-kid-sky" />
          <span className="font-kid font-bold text-kid-text">年级：</span>
          <div className="flex flex-wrap gap-2 flex-1">
            {(['all', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const).map((g, i) => {
              const active = grade === g;
              const colors = [
                'from-gray-400 to-gray-500',
                'from-kid-sky to-blue-400',
                'from-kid-mint to-green-400',
                'from-kid-lemon to-yellow-400 text-amber-900',
                'from-kid-coral to-orange-400',
                'from-kid-lavender to-purple-400',
                'from-kid-pink to-rose-400',
              ];
              const count = g === 'all' ? words.length : words.filter((w) => w.category === g).length;
              return (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-3 py-1.5 rounded-xl font-kid font-bold text-xs md:text-sm transition-all ${
                    active
                      ? `bg-gradient-to-br ${colors[i]} text-white shadow-kid scale-105`
                      : 'bg-gray-100 text-kid-text hover:bg-gray-200'
                  }`}
                >
                  {g === 'all' ? '全部' : GRADE_LABELS[g]} <span className="opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} className="text-kid-mint" />
          <span className="font-kid font-bold text-kid-text">状态：</span>
          <div className="flex flex-wrap gap-2 flex-1">
            {(['all', 'not_started', 'learning', 'need_review', 'mastered'] as const).map((s) => {
              const active = status === s;
              const count = s === 'all' ? words.length : words.filter((w) => (learningRecords[w.id]?.status ?? 'not_started') === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-full font-kid font-bold text-xs md:text-sm transition-all ${
                    active
                      ? 'bg-gradient-to-br from-kid-sky to-blue-400 text-white shadow-kid scale-105'
                      : STATUS_COLORS[s === 'all' ? 'learning' : s]
                  }`}
                >
                  {s === 'all' ? '全部状态' : STATUS_LABELS[s]} <span className="opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-kid-textLight" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索单词或中文意思..."
            className="input-kid !pl-12"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 border-t-2 border-dashed border-gray-100 pt-3">
          <p className="font-kid text-sm md:text-base text-kid-textLight">
            找到 <b className="text-kid-sky">{filtered.length}</b> 个单词
          </p>
          <button
            onClick={handleStartLearn}
            disabled={filtered.length === 0}
            className="btn-mint !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} /> 学习这 {Math.min(20, filtered.length)} 个
          </button>
        </div>
      </div>

      {/* 单词列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filtered.map((w, idx) => {
          const rec = learningRecords[w.id];
          const st = rec?.status ?? 'not_started';
          const mastery = rec?.masteryLevel ?? 0;
          const gradients = [
            'from-kid-sky/15 to-blue-100 border-kid-sky/30',
            'from-kid-mint/15 to-green-100 border-kid-mint/30',
            'from-kid-lemon/20 to-yellow-100 border-kid-lemon/40',
            'from-kid-coral/15 to-orange-100 border-kid-coral/30',
            'from-kid-lavender/15 to-purple-100 border-kid-lavender/30',
            'from-kid-pink/15 to-rose-100 border-kid-pink/30',
          ];
          const categoryIdx = Number(w.category.replace('grade', '')) - 1;
          return (
            <div
              key={w.id}
              className={`relative group card-kid !p-4 cursor-pointer transition-all hover:scale-[1.02] hover:-translate-y-0.5 border-4 bg-gradient-to-br ${gradients[categoryIdx] || gradients[0]}`}
              style={{ animationDelay: `${(idx % 12) * 0.03}s` }}
              onClick={() => {
                setCurrentLearnList([w.id]);
                navigate('/learn');
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-kid-inner flex items-center justify-center text-3xl md:text-4xl shrink-0 group-hover:animate-wiggle">
                  {w.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="title-kid text-lg md:text-xl text-kid-text truncate">{w.word}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(w.word);
                      }}
                      className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-kid-sky hover:bg-kid-sky hover:text-white transition-all shadow-kid"
                    >
                      <Volume2 size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                  <p className="font-kid text-xs md:text-sm text-kid-textLight italic">{w.phonetic}</p>
                  <p className="font-kid text-sm md:text-base text-kid-text mt-1 truncate">{w.meaning}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-kid">
                  <span className={`tag-kid !py-0.5 !px-2 !text-xs ${STATUS_COLORS[st]}`}>
                    {STATUS_LABELS[st]}
                  </span>
                  <span className="text-kid-textLight">
                    {GRADE_LABELS[w.category]} · {w.unit} · {mastery}%
                  </span>
                </div>
                <ProgressBar
                  value={mastery}
                  color={mastery >= 90 ? 'mint' : mastery >= 60 ? 'lemon' : mastery >= 30 ? 'coral' : 'sky'}
                  size="sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-kid text-center py-12 space-y-3">
          <div className="text-7xl animate-float">🔍</div>
          <h3 className="title-kid text-2xl text-kid-coral">没有找到匹配的单词</h3>
          <p className="font-kid text-kid-textLight">试试换一个筛选条件或者清空搜索～</p>
        </div>
      )}
    </div>
  );
}
