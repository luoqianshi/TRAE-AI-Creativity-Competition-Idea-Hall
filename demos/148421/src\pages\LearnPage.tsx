import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Settings2, RefreshCw, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import WordCard from '../components/WordCard/WordCard';
import SpellInput from '../components/SpellInput/SpellInput';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import { GRADE_LABELS, type GradeCategory } from '../types';
import { useSpeech } from '../hooks/useSpeech';

export default function LearnPage() {
  const navigate = useNavigate();
  const { words, currentLearnList, generateLearnList, settings, setSelectedGrade, markWordStudied, getOrCreateRecord } = useAppStore();
  const { speakWord } = useSpeech();
  const [index, setIndex] = useState(0);
  const [showSpell, setShowSpell] = useState(false);
  const [learned, setLearned] = useState<Set<number>>(new Set());
  const [sessionStart] = useState(() => Date.now());

  const listIds = currentLearnList.length > 0 ? currentLearnList : [];

  useEffect(() => {
    if (listIds.length === 0) {
      generateLearnList(15, settings.selectedGrade, true);
    }
  }, [listIds.length, generateLearnList, settings.selectedGrade]);

  const currentWord = useMemo(() => {
    if (listIds.length === 0) return null;
    const safe = index % listIds.length;
    return words.find((w) => w.id === listIds[safe]) || null;
  }, [listIds, index, words]);

  useEffect(() => {
    if (currentWord) {
      const r = getOrCreateRecord(currentWord.id);
      void r;
      setTimeout(() => speakWord(currentWord.word), 400);
    }
  }, [currentWord?.id, speakWord, getOrCreateRecord]);

  const goPrev = () => {
    setShowSpell(false);
    setIndex((i) => (i - 1 + listIds.length) % listIds.length);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const goNext = () => {
    setShowSpell(false);
    if (index + 1 >= listIds.length) {
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleKnow = () => {
    if (!currentWord) return;
    markWordStudied(currentWord.id, true);
    setLearned((s) => new Set(s).add(currentWord.id));
  };

  const handleDontKnow = () => {
    if (!currentWord) return;
    markWordStudied(currentWord.id, false);
  };

  const handleSpellCorrect = () => {
    if (!currentWord) return;
    markWordStudied(currentWord.id, true);
    setLearned((s) => new Set(s).add(currentWord.id));
    setTimeout(() => {
      setShowSpell(false);
      goNext();
    }, 800);
  };

  const handleSpellWrong = () => {
    if (!currentWord) return;
    markWordStudied(currentWord.id, false);
  };

  const handleRegenerate = () => {
    setIndex(0);
    generateLearnList(15, settings.selectedGrade, true);
    setLearned(new Set());
  };

  const progressPct = listIds.length === 0 ? 0 : Math.round(((index + 1) / listIds.length) * 100);
  const sessionMin = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="text-8xl animate-float">⏳</div>
        <h2 className="title-kid text-3xl text-kid-sky">正在准备单词...</h2>
        <button onClick={handleRegenerate} className="btn-sky !text-lg">
          <RefreshCw size={20} /> 手动生成学习列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* 顶部控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-kid py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-kid font-bold text-sm text-kid-text transition-all hover:scale-105"
        >
          <ArrowLeft size={18} /> 返回首页
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-xl bg-kid-sky/10 border-2 border-kid-sky/30 overflow-hidden">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 font-kid text-xs md:text-sm font-bold transition-all ${settings.selectedGrade === 'all' ? 'bg-kid-sky text-white' : 'text-kid-sky hover:bg-kid-sky/20'}`}
            >全部</button>
            {(['grade1', 'grade2', 'grade3'] as GradeCategory[]).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2 md:px-3 py-1.5 font-kid text-xs md:text-sm font-bold transition-all ${settings.selectedGrade === g ? 'bg-kid-sky text-white' : 'text-kid-sky hover:bg-kid-sky/20'}`}
              >{GRADE_LABELS[g].slice(0, 2)}</button>
            ))}
            <select
              value={settings.selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as GradeCategory | 'all')}
              className="hidden md:block px-2 py-1.5 bg-transparent font-kid text-xs md:text-sm font-bold text-kid-sky outline-none cursor-pointer"
            >
              <option value="grade4">四年级</option>
              <option value="grade5">五年级</option>
              <option value="grade6">六年级</option>
            </select>
          </div>

          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-kid-lemon/30 hover:bg-kid-lemon/50 font-kid font-bold text-sm text-amber-700 transition-all hover:scale-105"
            title="重新生成单词列表"
          >
            <RefreshCw size={16} /> 换一批
          </button>
        </div>

        <div className="flex items-center gap-3 font-kid font-bold text-sm">
          <span className="tag-kid bg-kid-mint/20 text-green-700">
            <CheckCircle size={14} /> 本轮：{learned.size}/{listIds.length}
          </span>
          <span className="tag-kid bg-kid-lavender/20 text-kid-lavender">
            <Trophy size={14} /> {sessionMin}分钟
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="card-kid py-3 space-y-2">
        <div className="flex items-center justify-between text-sm font-kid">
          <span className="flex items-center gap-2">
            <ChevronLeft size={16} onClick={goPrev} className="cursor-pointer text-kid-sky hover:scale-125 transition-transform" />
            学习进度：第 <b className="text-kid-sky">{index + 1}</b> / {listIds.length} 个单词
            <ChevronRight size={16} onClick={goNext} className="cursor-pointer text-kid-sky hover:scale-125 transition-transform" />
          </span>
          <span className="font-bold text-kid-text">{progressPct}%</span>
        </div>
        <ProgressBar value={progressPct} color="lavender" size="lg" />
      </div>

      {/* 单词卡片 */}
      <div key={currentWord.id} className="animate-slide-in-right">
        <WordCard
          word={currentWord}
          onPrev={goPrev}
          onNext={goNext}
          onKnow={handleKnow}
          onDontKnow={handleDontKnow}
        />
      </div>

      {/* 拼写练习切换 */}
      <div className="card-kid space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setShowSpell((s) => !s)}
            className={`flex items-center gap-2 font-kid font-bold transition-all ${showSpell ? 'text-kid-coral' : 'text-kid-sky'}`}
          >
            <Settings2 size={20} className={showSpell ? 'animate-spin-slow' : ''} />
            {showSpell ? '关闭拼写练习 ▲' : '打开拼写练习 ▼ 巩固记忆'}
          </button>
          {learned.has(currentWord.id) && (
            <span className="tag-kid bg-kid-mint/25 text-green-700 animate-pop">
              <CheckCircle size={16} /> 本轮已掌握！
            </span>
          )}
        </div>
        {showSpell && (
          <div className="animate-slide-up">
            <SpellInput
              word={currentWord.word}
              onCorrect={handleSpellCorrect}
              onWrong={handleSpellWrong}
            />
          </div>
        )}
      </div>

      {/* 完成提示 */}
      {learned.size >= Math.max(1, Math.ceil(listIds.length * 0.6)) && (
        <div className="card-gradient bg-gradient-to-br from-kid-lemon via-kid-coral/60 to-kid-pink text-white space-y-3 relative overflow-hidden animate-pop">
          <div className="absolute inset-0 bg-stripes opacity-20" />
          <div className="absolute -right-6 -top-6 text-8xl opacity-30 animate-wiggle">🎊</div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-bounce-slow">🏆</div>
              <div>
                <h3 className="title-kid text-2xl md:text-3xl text-stroke">太棒了！学习过半啦！</h3>
                <p className="font-kid opacity-95">已掌握 {learned.size} 个单词，继续加油哦～</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => navigate('/test')} className="btn-mint !bg-white !text-green-600 hover:!bg-white/90">
                🎯 做测试巩固
              </button>
              <button onClick={() => navigate('/')} className="btn-coral">
                🏠 回首页休息
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部小统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border-2 border-kid-mint/40 text-center">
          <CheckCircle size={22} className="mx-auto text-kid-mint mb-1" />
          <p className="title-kid text-2xl text-kid-mint">{learned.size}</p>
          <p className="font-kid text-xs text-kid-textLight">本轮通过</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-kid-coral/40 text-center">
          <XCircle size={22} className="mx-auto text-kid-coral mb-1" />
          <p className="title-kid text-2xl text-kid-coral">{Math.max(0, listIds.length - learned.size)}</p>
          <p className="font-kid text-xs text-kid-textLight">待继续</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-kid-sky/40 text-center">
          <Trophy size={22} className="mx-auto text-kid-sky mb-1" />
          <p className="title-kid text-2xl text-kid-sky">{progressPct}%</p>
          <p className="font-kid text-xs text-kid-textLight">进度</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border-2 border-kid-lavender/40 text-center">
          <Settings2 size={22} className="mx-auto text-kid-lavender mb-1" />
          <p className="title-kid text-2xl text-kid-lavender">{sessionMin}</p>
          <p className="font-kid text-xs text-kid-textLight">学习分钟</p>
        </div>
      </div>
    </div>
  );
}
