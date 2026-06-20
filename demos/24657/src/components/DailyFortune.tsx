import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, RotateCcw, Tag } from 'lucide-react';
import { DailyFortune } from '../types';
import { getDailyFortune, clearDailyFortune } from '../data';

interface DailyFortuneProps {
  onClose: () => void;
}

const levelStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  '上上签': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    glow: 'shadow-amber-200/50',
  },
  '上签': {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    glow: 'shadow-teal-200/50',
  },
  '中签': {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    glow: 'shadow-slate-200/50',
  },
  '下签': {
    bg: 'bg-stone-50',
    text: 'text-stone-600',
    border: 'border-stone-200',
    glow: 'shadow-stone-200/50',
  },
};

export default function DailyFortuneView({ onClose }: DailyFortuneProps) {
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const f = getDailyFortune();
    setFortune(f);
    const timer = setTimeout(() => setIsRevealed(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleRedraw = () => {
    clearDailyFortune();
    const f = getDailyFortune();
    setFortune(f);
    setIsRevealed(false);
    setTimeout(() => setIsRevealed(true), 400);
  };

  if (!fortune) return null;

  const style = levelStyles[fortune.level] || levelStyles['中签'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#382f1e]/30 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-[#fff8f2] border border-white/40 w-full max-w-md rounded-[36px] shadow-2xl z-10 overflow-hidden"
      >
        {/* Decorative top gradient */}
        <div className={`absolute top-0 left-0 right-0 h-32 ${style.bg} opacity-60`} />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#fff8f2]" />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${style.bg} ${style.text}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-[#424849]/60">
                每日求签
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5 text-[#424849]" />
            </button>
          </div>

          {/* Fortune Level Badge */}
          <AnimatePresence mode="wait">
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="text-center mb-6"
              >
                <span
                  className={`inline-block px-5 py-2 rounded-full text-lg font-bold ${style.bg} ${style.text} border ${style.border} shadow-lg ${style.glow}`}
                >
                  {fortune.level}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title & Poem */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-center space-y-4 mb-6"
              >
                <h3 className="text-2xl font-light text-[#221b0b] tracking-wide">
                  {fortune.title}
                </h3>
                <p className="text-base text-[#4f6167] font-light italic leading-relaxed">
                  「{fortune.poem}」
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#a2b5bb]/20" />
            <Sparkles className="w-3 h-3 text-[#a2b5bb]/40" />
            <div className="flex-1 h-px bg-[#a2b5bb]/20" />
          </div>

          {/* Meaning */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-4 mb-6"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#424849]/50">
                    签文释义
                  </p>
                  <p className="text-sm text-[#424849] leading-relaxed font-light">
                    {fortune.meaning}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#424849]/50">
                    今日建议
                  </p>
                  <p className="text-sm text-[#424849] leading-relaxed font-light">
                    {fortune.advice}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {fortune.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="flex gap-3 pt-2"
              >
                <button
                  onClick={handleRedraw}
                  className="flex-1 py-3.5 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-100/50 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新求签
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-full text-sm font-medium bg-[#4f6167] hover:bg-[#35474c] text-white transition-all shadow-md"
                >
                  收下这份指引
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
