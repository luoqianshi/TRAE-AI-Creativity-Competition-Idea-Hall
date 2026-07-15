import { useState, useEffect } from 'react';
import { Volume2, RotateCw } from 'lucide-react';
import type { Word } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';
import { GRADE_LABELS, STATUS_COLORS, STATUS_LABELS } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import ProgressBar from '../ProgressBar/ProgressBar';

interface WordCardProps {
  word: Word;
  onNext?: () => void;
  onPrev?: () => void;
  onKnow?: () => void;
  onDontKnow?: () => void;
}

export default function WordCard({ word, onNext, onPrev, onKnow, onDontKnow }: WordCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const { speakWord } = useSpeech();
  const { learningRecords } = useAppStore();
  const record = learningRecords[word.id];
  const mastery = record?.masteryLevel ?? 0;
  const status = record?.status ?? 'not_started';

  useEffect(() => {
    setFlipped(false);
  }, [word.id]);

  const handleSpeak = () => {
    speakWord(word.word);
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 800);
  };

  const gradients = [
    'from-kid-sky via-blue-300 to-indigo-300',
    'from-kid-coral via-orange-300 to-amber-300',
    'from-kid-mint via-green-300 to-teal-300',
    'from-kid-lavender via-purple-300 to-pink-300',
    'from-kid-lemon via-yellow-300 to-orange-300',
  ];
  const frontGradient = gradients[word.id % gradients.length];
  const backGradient = gradients[(word.id + 2) % gradients.length];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div
        className={`flip-card cursor-pointer select-none ${flipped ? 'flipped' : ''}`}
        style={{ height: 'min(60vh, 440px)' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="flip-card-inner">
          {/* 正面：英文 */}
          <div
            className={`flip-card-front bg-gradient-to-br ${frontGradient} text-white p-6 md:p-10 shadow-kid-lg border-8 border-white flex flex-col justify-between relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-stripes opacity-20" />
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-white/15 blur-xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex gap-2 flex-wrap">
                <span className="tag-kid bg-white/30 backdrop-blur-sm text-white border border-white/30">
                  {GRADE_LABELS[word.category]}
                </span>
                <span className="tag-kid bg-white/25 backdrop-blur-sm text-white border border-white/25">
                  {word.unit}
                </span>
              </div>
              <span className="tag-kid bg-white/35 backdrop-blur-sm text-white">
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${STATUS_COLORS[status].split(' ')[0]}`} />
                {STATUS_LABELS[status]}
              </span>
            </div>

            <div className="relative text-center">
              <div className="text-6xl md:text-8xl mb-4 animate-float inline-block drop-shadow-xl">
                {word.emoji}
              </div>
              <h2 className="title-kid text-5xl md:text-7xl text-stroke mb-4 break-words leading-tight">
                {word.word}
              </h2>
              <p className="font-kid text-xl md:text-2xl opacity-95 mb-3">
                {word.phonetic}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak();
                }}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white font-kid font-bold shadow-kid transition-all hover:bg-white/40 hover:scale-105 active:scale-95 ${speaking ? 'animate-pop ring-4 ring-white/60' : ''}`}
              >
                <Volume2 size={22} className={speaking ? 'animate-pulse' : ''} strokeWidth={2.5} />
                <span className="text-base md:text-lg">点我听发音</span>
              </button>
            </div>

            <div className="relative text-center font-kid text-sm md:text-base opacity-90 flex items-center justify-center gap-2">
              <RotateCw size={16} className="animate-spin-slow" />
              点击卡片查看中文意思
            </div>
          </div>

          {/* 背面：中文 */}
          <div
            className={`flip-card-back bg-gradient-to-br ${backGradient} text-white p-6 md:p-10 shadow-kid-lg border-8 border-white flex flex-col justify-between relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-stripes opacity-20" />
            <div className="absolute top-6 right-6 text-5xl opacity-30 animate-spin-slow">⭐</div>

            <div className="relative">
              <p className="font-kid text-sm md:text-base opacity-90 mb-2">中文意思</p>
              <h3 className="title-kid text-3xl md:text-5xl text-stroke mb-6">
                {word.meaning}
              </h3>
              <div className="space-y-2">
                <div className="p-4 rounded-2xl bg-white/25 backdrop-blur-sm border border-white/30">
                  <p className="font-kid font-bold text-base md:text-lg mb-1">📖 例句</p>
                  <p className="font-kid text-base md:text-lg italic">"{word.example}"</p>
                </div>
                <p className="font-kid text-sm md:text-base pl-4 opacity-95">
                  👉 {word.exampleMeaning}
                </p>
              </div>
            </div>

            <div className="relative space-y-2">
              <div className="flex items-center justify-between text-sm font-kid opacity-90">
                <span>掌握度</span>
                <span>{mastery}%</span>
              </div>
              <ProgressBar value={mastery} color={mastery >= 90 ? 'mint' : mastery >= 60 ? 'lemon' : 'coral'} size="lg" />
              <p className="text-center font-kid text-xs md:text-sm opacity-85 pt-1">
                点击卡片翻回正面
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <button onClick={onPrev} className="btn-lavender md:!py-4 !text-sm md:!text-base">
          ← 上一个
        </button>
        <button onClick={handleSpeak} className="btn-sky md:!py-4 !text-sm md:!text-base">
          <Volume2 size={18} /> 再听一遍
        </button>
        <button
          onClick={() => {
            onDontKnow?.();
            onNext?.();
          }}
          className="btn-coral md:!py-4 !text-sm md:!text-base"
        >
          还不熟 😅
        </button>
        <button
          onClick={() => {
            onKnow?.();
            onNext?.();
          }}
          className="btn-mint md:!py-4 !text-sm md:!text-base"
        >
          我会啦！ 🎉
        </button>
      </div>
    </div>
  );
}
