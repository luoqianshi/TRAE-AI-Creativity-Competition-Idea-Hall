'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Moon, Loader2, ChevronRight } from 'lucide-react';
import { ParentNav } from '@/components/ParentNav';
import { PinDialog } from '@/components/PinDialog';
import { StoryCard } from '@/components/StoryCard';
import { useProfileStore, type CurrentChild } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { emojiFor, bgFor } from '@/lib/theme';
import { AGE_LABELS, type ThemeKey } from '@/types/story';

interface StoryItem {
  id: string;
  title: string;
  theme: string;
  durationSeconds: number;
}

interface HomeClientProps {
  child: CurrentChild;
  initialStories: StoryItem[];
  dailyLimitMinutes: number;
}

export function HomeClient({ child, initialStories, dailyLimitMinutes }: HomeClientProps) {
  const router = useRouter();
  const setChild = useProfileStore((s) => s.setCurrentChild);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [stories, setStories] = useState(initialStories);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [now, setNow] = useState<string>('');

  useEffect(() => {
    setChild(child);
    setSettings({ dailyLimitMinutes });
  }, [child, dailyLimitMinutes, setChild, setSettings]);

  useEffect(() => {
    setNow(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // 推荐故事（顶部大卡）
  const featured = stories[0];
  const otherStories = stories.slice(1, 4);

  async function handlePlay(storyId: string) {
    router.push(`/player/${storyId}`);
  }

  async function handlePinSubmit(pin: string) {
    setPinError(null);
    const res = await fetch('/api/settings/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: child.id, action: 'verify', pin }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setPinError(data.error?.message || 'PIN 错误');
      throw new Error('pin invalid');
    }
    setPinOpen(false);
    setTimeout(() => router.push('/parent'), 200);
  }

  return (
    <main
      className="min-h-[100dvh] flex flex-col no-zoom"
      style={{
        background:
          'linear-gradient(180deg, rgba(242,226,213,0.4) 0%, rgba(248,244,236,0) 30%, rgba(215,227,236,0.3) 100%)',
      }}
    >
      {/* 顶部信息条 */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-1">
            {now ? `${now} · 晚安时间` : '晚安时间'}
          </p>
          <h1 className="font-serif-cn text-2xl font-semibold text-[var(--color-ink)]">
            你好，{child.nickname}
            <span className="inline-block ml-1 animate-wiggle origin-bottom">{child.avatarEmoji}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag-soft">{AGE_LABELS[child.ageGroup]}</span>
          <span className="w-10 h-10 rounded-full flex items-center justify-center bg-white/60">
            <Moon className="w-5 h-5 text-[var(--color-muted)]" />
          </span>
        </div>
      </header>

      {/* 主舞台 */}
      {/*
        关键修复：flex-auto（flex: 1 1 auto）取代 flex-1（flex: 1 1 0%）。
        flex-1 的 basis: 0% 会让 section 在内容超出剩余空间时卡在"剩余空间"高度不增长，
        内容溢出但父容器不滚动。flex-auto 的 basis: auto 让 section 跟随内容增长，
        父容器（min-h-[100dvh]）随之撑高，body 才能正常滚到底。
      */}
      <section className="flex-auto flex flex-col items-center justify-center px-6 py-4">
        {featured ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm"
          >
            <div className={`cover-soft ${bgFor(featured.theme)} relative h-72 mb-8`}>
              <span className="absolute top-5 left-5 tag-soft">为你推荐</span>
              <span className="absolute top-5 right-5 tag-soft">{
                Math.round(featured.durationSeconds / 60 * 10) / 10
              } 分钟</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-[160px] leading-none drop-shadow"
                  animate={{ y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {emojiFor(featured.theme)}
                </motion.span>
              </div>
              {/* 装饰圆圈 */}
              <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, var(--color-accent-soft) 0%, transparent 70%)' }} />
            </div>

            {/* 大听故事按钮 —— 纯图标：耳机 + 扩散声波 + 呼吸光晕 */}
            <button
              type="button"
              onClick={() => handlePlay(featured.id)}
              aria-label="听故事"
              className="relative w-full aspect-square max-w-[300px] mx-auto rounded-full btn-cta flex items-center justify-center active:scale-95 transition-transform overflow-hidden"
              style={{ boxShadow: '0 20px 50px rgba(216, 123, 90, 0.4), inset 0 -4px 0 rgba(0,0,0,0.08)' }}
            >
              {/* 外圈呼吸光晕：白色半透明，缓慢放大淡出，模拟"声波传出" */}
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 65%)',
                  animation: 'cta-pulse 2.4s ease-out infinite',
                }}
              />

              {/* 3 道扩散声波弧线 —— 1-6 岁儿童一眼就懂"会发出声音" */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="absolute rounded-full border-2 border-white/55"
                    style={{
                      width: '70%',
                      height: '70%',
                      animation: `cta-ripple 2.4s ease-out ${i * 0.4}s infinite`,
                    }}
                  />
                ))}
              </span>

              {/* 中心耳机图标 */}
              <Headphones
                className="relative w-24 h-24 text-white drop-shadow-md"
                strokeWidth={2.2}
                fill="currentColor"
                fillOpacity={0.15}
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))' }}
              />

              {/* 右下角小三角"播放"叠加，强化"点这个就开始" */}
              <span
                className="absolute bottom-[18%] right-[18%] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg"
                aria-hidden
              >
                <span
                  className="block ml-[3px]"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid #D87B5A',
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                  }}
                />
              </span>
            </button>

            {/* 给儿童一个轻微的文字补充（家长也能看到），不靠它引导 */}
            <p className="text-center mt-4 text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
              tap to listen
            </p>

            <p className="text-center mt-6 font-serif-cn text-lg text-[var(--color-ink)] line-clamp-1">
              《{featured.title}》
            </p>
          </motion.div>
        ) : (
          <div className="text-center text-[var(--color-muted)] py-10">
            正在为你准备第一个故事…
          </div>
        )}

        {/* 其他故事 */}
        {otherStories.length > 0 && (
          <div className="w-full max-w-sm mt-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif-cn text-lg font-semibold text-[var(--color-ink)]">
                猜你也喜欢
              </h2>
              <span className="text-xs text-[var(--color-muted)]">
                共 {stories.length} 个故事
              </span>
            </div>
            <div className="space-y-3">
              {otherStories.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlePlay(s.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/70 hover:bg-white transition text-left"
                >
                  <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: bgFor(s.theme) }}>
                    {emojiFor(s.theme)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-ink)] truncate">{s.title}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {Math.round(s.durationSeconds / 60 * 10) / 10} 分钟
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--color-muted)]" />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 底部导航 */}
      <div className="sticky bottom-0">
        <ParentNav onParentClick={() => { setPinError(null); setPinOpen(true); }} />
      </div>

      <PinDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSubmit={handlePinSubmit}
        errorMessage={pinError || undefined}
      />
    </main>
  );
}
