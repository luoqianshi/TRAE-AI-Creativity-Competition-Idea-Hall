'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Sparkles, AlertCircle, Volume2, Moon, Sun } from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MagicLoader } from '@/components/MagicLoader';
import { StarCard } from '@/components/StarCard';
import { emojiFor, colorFor } from '@/lib/theme';
import type { ThemeKey, AgeGroup } from '@/types/story';
import { cn } from '@/utils/format';

interface PlayerClientProps {
  story: {
    id: string;
    title: string;
    theme: string;
    fullText: string;
    audioUrl: string | null;
    durationSeconds: number;
  };
  child: {
    id: string;
    nickname: string;
    ageGroup: AgeGroup;
    favoriteThemes: ThemeKey[];
  };
  listenedTodaySeconds: number;
  dailyLimitMinutes: number;
}

export function PlayerClient({
  story,
  child,
  listenedTodaySeconds,
  dailyLimitMinutes,
}: PlayerClientProps) {
  const router = useRouter();
  const [currentStory, setCurrentStory] = useState(story);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [audioKey, setAudioKey] = useState(0);
  const [listenedSeconds, setListenedSeconds] = useState(listenedTodaySeconds);
  const sessionStartRef = useRef<number>(Date.now());
  const reachedLimit = listenedSeconds >= dailyLimitMinutes * 60;
  const [ambientOn, setAmbientOn] = useState(true);  // 暖室底噪开关，默认开

  useEffect(() => {
    // 卸载时记录这次播放
    return () => {
      const seconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (seconds > 3) {
        // 异步记录，不 await
        fetch('/api/play-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childId: child.id,
            storyId: currentStory.id,
            listenedSeconds: seconds,
          }),
        }).catch(() => {});
      }
    };
  }, [child.id, currentStory.id]);

  async function ensureAudio(s: { id: string; fullText: string; audioUrl: string | null }): Promise<string> {
    if (s.audioUrl && s.audioUrl !== '/offline/tts') {
      setAudioKey((k) => k + 1);
      return s.audioUrl;
    }
    // 后端有 TTS 自动调用，但这里我们直接在客户端 trigger
    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: s.id, text: s.fullText }),
      });
      const data = await res.json();
      if (data?.ok && data.data?.audioUrl) {
        setAudioKey((k) => k + 1);
        return data.data.audioUrl as string;
      }
    } catch (e) {
      console.warn('ensureAudio fetch failed', e);
    }
    return '';
  }

  async function handleNext(theme?: ThemeKey, customPromptText?: string) {
    if (reachedLimit) {
      setError('今日听读时间已满，请家长解锁后继续');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { childId: child.id };
      if (theme) payload.theme = theme;
      if (customPromptText) payload.customPrompt = customPromptText;

      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error?.message || '生成失败，请稍后再试');
        return;
      }
      const newStory = data.data.story;
      // 立刻拉一份音频，并拿到真实 URL（空字符串表示走浏览器 TTS 兜底）
      const audioUrl = await ensureAudio({ id: newStory.id, fullText: newStory.fullText, audioUrl: null });
      setCurrentStory({
        id: newStory.id,
        title: newStory.title,
        theme: newStory.theme,
        fullText: newStory.fullText,
        audioUrl: audioUrl || null, // 空字符串 → null，AudioPlayer 走浏览器 TTS
        durationSeconds: newStory.durationSeconds,
      });
      sessionStartRef.current = Date.now();
      // 改用 router 替换 URL
      window.history.replaceState(null, '', `/player/${newStory.id}`);
    } catch (e) {
      setError('网络异常');
    } finally {
      setLoading(false);
    }
  }

  function pickRandomTheme(): ThemeKey {
    const themes = child.favoriteThemes.length > 0 ? child.favoriteThemes : (['animal', 'space', 'car', 'princess', 'dinosaur'] as ThemeKey[]);
    return themes[Math.floor(Math.random() * themes.length)];
  }

  function handleNextClick() {
    if (reachedLimit) {
      setError('今日听读时间已满，请家长解锁后继续');
      return;
    }
    handleNext(pickRandomTheme());
  }

  function handleCustomSubmit() {
    if (!customPrompt.trim()) return;
    if (reachedLimit) {
      setError('今日听读时间已满，请家长解锁后继续');
      return;
    }
    handleNext(undefined, customPrompt.trim());
    setCustomPrompt('');
    setShowCustom(false);
  }

  return (
    <main
      className="min-h-[100dvh] flex flex-col no-zoom"
      style={{ background: 'var(--color-paper)' }}
    >
      {/* 顶部 */}
      <header className="px-5 pt-6 pb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/home')}
          aria-label="返回"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/70 hover:bg-white transition"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-ink)]" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">正在听</p>
          <h1 className="font-serif-cn text-lg font-semibold text-[var(--color-ink)] line-clamp-1">
            《{currentStory.title}》
          </h1>
        </div>
        <span className="w-12 h-12 rounded-full flex items-center justify-center bg-white/60">
          <span className="text-xs text-[var(--color-muted)]">{currentStory.theme === 'animal' ? '🐰' : currentStory.theme === 'dinosaur' ? '🦕' : currentStory.theme === 'princess' ? '👸' : currentStory.theme === 'car' ? '🚗' : currentStory.theme === 'space' ? '🚀' : '📖'}</span>
        </span>
      </header>

      {/* 主舞台 */}
      {/*
        关键修复：flex-auto 取代 flex-1。
        flex-1（basis: 0%）在内容超高时会让 section 卡在父容器剩余高度不增长，
        导致 180px emoji 在低端机上被裁掉上半截或下半截。
        flex-auto（basis: auto）让 section 跟随内容自然撑高，body 可滚到底。
      */}
      <section
        className="flex-auto flex flex-col items-center justify-center px-6 relative overflow-hidden"
        style={{ minHeight: '50vh' }}
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${colorFor(currentStory.theme)} 0%, transparent 70%)`,
            opacity: 0.7,
          }}
        />
        <motion.div
          key={currentStory.id}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className="text-center"
        >
          <span
            className="inline-block text-[180px] leading-none animate-breathe"
            style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.08))' }}
          >
            {emojiFor(currentStory.theme)}
          </span>
        </motion.div>
        <p className="text-[var(--color-muted)] text-sm mt-2 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5" />
          正在用温柔的女声朗读
          <span className="text-pink-400">🩷</span>
        </p>
      </section>

      {/* 闪卡彩蛋层 */}
      <StarCard />

      {/* 加载遮罩 */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(248, 244, 236, 0.85)', backdropFilter: 'blur(8px)' }}
          >
            <MagicLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mx-5 mb-3 rounded-2xl bg-[var(--color-rose)] px-4 py-3 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-ink)] flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs text-[var(--color-muted)] underline"
            >
              知道了
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 播放器 + 底部按钮 */}
      <section className="px-5 pb-6 pt-2">
        <div className="rounded-3xl bg-white/80 p-5 mb-4">
          <AudioPlayer
            key={audioKey}
            src={currentStory.audioUrl && currentStory.audioUrl !== '/offline/tts' ? currentStory.audioUrl : null}
            fallbackText={currentStory.fullText}
            initialVolume={0.7}
            enableAmbient={ambientOn}
            ambientVolume={0.045}
            onTimeUpdate={(t) => setListenedSeconds(listenedTodaySeconds + t)}
            onComplete={() => {
              // 听完可自动跳到下一个
            }}
          />
          {/* 暖室底噪开关 */}
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setAmbientOn((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition px-3 py-1.5 rounded-full"
              style={{ background: ambientOn ? 'var(--color-rose)' : 'transparent' }}
            >
              {ambientOn ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  暖室底噪 · 开
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  暖室底噪 · 关
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleNextClick}
            disabled={loading || reachedLimit}
            className={cn(
              'h-16 rounded-2xl border-2 flex items-center justify-center gap-2 font-medium transition',
              reachedLimit
                ? 'border-[var(--color-divider)] text-[var(--color-muted)] opacity-50'
                : 'border-[var(--color-forest)] text-[var(--color-forest)] hover:bg-[var(--color-forest)] hover:text-white',
            )}
          >
            <RefreshCw className="w-5 h-5" />
            换一个
          </button>
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            disabled={loading || reachedLimit}
            className={cn(
              'h-16 rounded-2xl flex items-center justify-center gap-2 font-medium transition',
              reachedLimit
                ? 'bg-[var(--color-divider)] text-[var(--color-muted)]'
                : 'btn-cta',
            )}
          >
            <Sparkles className="w-5 h-5" />
            我要指定
          </button>
        </div>

        {reachedLimit && (
          <p className="text-center text-xs text-[var(--color-muted)] mt-3">
            今日已听 {Math.round(listenedSeconds / 60)} 分钟，触达限额。请家长到家长中心解锁。
          </p>
        )}
      </section>

      {/* 自定义输入弹窗 */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(42, 42, 42, 0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowCustom(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl p-6"
              style={{ background: '#FFFEFB' }}
            >
              <div className="w-12 h-1 rounded-full bg-[var(--color-divider)] mx-auto mb-5" />
              <h2 className="font-serif-cn text-2xl font-semibold text-center mb-2">想听什么故事？</h2>
              <p className="text-center text-sm text-[var(--color-muted)] mb-5">
                比如：去月球冒险 / 小恐龙学会了分享
              </p>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value.slice(0, 100))}
                placeholder="写一个关键词，越具体越好…"
                className="input-warm w-full h-28 resize-none"
                maxLength={100}
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="flex-1 h-12 rounded-2xl bg-[var(--color-sand)] text-[var(--color-muted)]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  disabled={!customPrompt.trim() || loading}
                  className="flex-1 h-12 rounded-2xl btn-cta disabled:opacity-50"
                >
                  编一个
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
