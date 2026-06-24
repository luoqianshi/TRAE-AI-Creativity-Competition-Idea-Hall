'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { cn } from '@/utils/format';
import { ALL_THEMES, THEME_LABELS, AGE_LABELS, AGE_DESCRIPTIONS, type AgeGroup, type ThemeKey } from '@/types/story';
import { emojiFor } from '@/lib/theme';

const STEPS = [
  { key: 'nickname', title: '孩子的昵称', subtitle: '用 TA 平时最喜欢的小名' },
  { key: 'age', title: '孩子的年龄段', subtitle: '我们会用适合的语言讲故事' },
  { key: 'theme', title: 'TA 喜欢的主题', subtitle: '可多选，至少选一个' },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [themes, setThemes] = useState<ThemeKey[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function canNext() {
    if (step === 0) return nickname.trim().length > 0;
    if (step === 1) return !!ageGroup;
    if (step === 2) return themes.length > 0;
    return false;
  }

  function toggleTheme(t: ThemeKey) {
    setThemes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleFinish() {
    if (!ageGroup || themes.length === 0 || !nickname.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          ageGroup,
          avatarEmoji: '🐰',
          favoriteThemes: themes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error?.message || '保存失败');
        return;
      }
      router.push('/home');
      router.refresh();
    } catch (e) {
      setError('网络异常');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* 顶部进度条 */}
      <div className="flex items-center justify-between mb-8">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-sand)] transition"
            aria-label="上一步"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <span className="w-11" />
        )}
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-8 bg-[var(--color-accent)]' : i < step ? 'w-3 bg-[var(--color-forest)]' : 'w-3 bg-[var(--color-divider)]',
              )}
            />
          ))}
        </div>
        <span className="w-11" />
      </div>

      <AnimatePresence mode="wait">
        {/*
          关键修复：flex-auto 取代 flex-1。
          第 2 步的主题选择有 5x2 网格（10 个按钮），在低端机会超出 100dvh，
          原本的 flex-1 会让内容被裁掉、body 无法滚动。flex-auto 让容器跟随内容增长。
        */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex-auto flex flex-col"
        >
          <div className="mb-1 text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
            第 {step + 1} 步 · 共 {STEPS.length} 步
          </div>
          <h1 className="font-serif-cn text-3xl font-semibold text-[var(--color-ink)] mb-2">
            {STEPS[step].title}
          </h1>
          <p className="text-[var(--color-muted)] text-sm mb-8">{STEPS[step].subtitle}</p>

          {step === 0 && (
            <div className="flex-auto">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 8))}
                placeholder="比如：小柚"
                className="input-warm w-full text-2xl font-serif-cn py-5"
                maxLength={8}
                autoFocus
              />
              <div className="flex gap-2 mt-4 flex-wrap">
                {['小柚', '糖糖', '豆豆', '果果', '安安'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setNickname(name)}
                    className="px-4 py-2 rounded-full text-sm border border-[var(--color-divider)] bg-white/60 text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex-auto space-y-3">
              {(['1-3', '3-4', '4-6'] as AgeGroup[]).map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setAgeGroup(age)}
                  className={cn(
                    'w-full rounded-2xl p-5 text-left flex items-center gap-4 transition-all',
                    ageGroup === age
                      ? 'bg-white border-2 border-[var(--color-accent)] shadow-card'
                      : 'bg-white/60 border-2 border-transparent hover:border-[var(--color-divider)]',
                  )}
                >
                  <span className="text-4xl">{
                    age === '1-3' ? '🐣' : age === '3-4' ? '🐰' : '🦊'
                  }</span>
                  <div className="flex-1">
                    <p className="font-serif-cn text-xl font-semibold text-[var(--color-ink)]">
                      {AGE_LABELS[age]}
                    </p>
                    <p className="text-sm text-[var(--color-muted)] mt-1">
                      {AGE_DESCRIPTIONS[age]}
                    </p>
                  </div>
                  {ageGroup === age && (
                    <span className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--color-accent)' }}>
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex-auto">
              <div className="grid grid-cols-2 gap-3">
                {ALL_THEMES.map((t) => {
                  const active = themes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTheme(t)}
                      className={cn(
                        'aspect-square rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-all',
                        active
                          ? 'bg-white border-2 border-[var(--color-accent)] shadow-card'
                          : 'bg-white/60 border-2 border-transparent hover:border-[var(--color-divider)]',
                      )}
                    >
                      <span className="text-5xl">{emojiFor(t)}</span>
                      <span className={cn(
                        'text-sm font-medium',
                        active ? 'text-[var(--color-ink)]' : 'text-[var(--color-muted)]',
                      )}>{THEME_LABELS[t]}</span>
                      {active && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--color-accent)' }}>
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="mt-4 text-sm text-[var(--color-accent)] bg-[var(--color-rose)] rounded-xl px-3 py-2.5">
          {error}
        </div>
      )}

      {/* 底部按钮 */}
      <div className="mt-8 flex gap-3">
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canNext()}
            onClick={() => setStep((s) => s + 1)}
            className="w-full h-14 rounded-2xl btn-cta font-medium text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canNext() || submitting}
            onClick={handleFinish}
            className="w-full h-14 rounded-2xl btn-cta font-medium text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {submitting ? '准备中…' : '完成，开始奇想'}
          </button>
        )}
      </div>
    </main>
  );
}
