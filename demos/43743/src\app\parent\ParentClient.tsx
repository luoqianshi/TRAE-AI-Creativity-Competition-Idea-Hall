'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Mic, Clock, Check, AlertCircle, LogOut } from 'lucide-react';
import { AGE_LABELS, type AgeGroup } from '@/types/story';
import { formatSeconds } from '@/utils/format';
import { cn } from '@/utils/format';

interface ParentClientProps {
  child: {
    id: string;
    nickname: string;
    ageGroup: AgeGroup;
    avatarEmoji: string;
  };
  initialSettings: {
    dailyLimitMinutes: number;
    autoCloseMinutes: number;
    isAutoPlay: boolean;
  };
  listenedTodaySeconds: number;
  weekly: { day: string; total: number }[];
}

const LIMIT_OPTIONS = [15, 30, 45, 60];
const CLOSE_OPTIONS = [0, 15, 30, 45];

export function ParentClient({ child, initialSettings, listenedTodaySeconds, weekly }: ParentClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [savingLimit, setSavingLimit] = useState(false);
  const [savingClose, setSavingClose] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const listenedMinutes = Math.round(listenedTodaySeconds / 60);
  const limitMinutes = settings.dailyLimitMinutes;
  const progress = Math.min(1, listenedTodaySeconds / (limitMinutes * 60));
  const reached = listenedTodaySeconds >= limitMinutes * 60;

  // 环形进度图参数
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  async function updateLimit(v: number) {
    setSavingLimit(true);
    setSettings((s) => ({ ...s, dailyLimitMinutes: v }));
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, dailyLimitMinutes: v }),
      });
      showToast('已更新每日限额');
    } finally {
      setSavingLimit(false);
    }
  }

  async function updateClose(v: number) {
    setSavingClose(true);
    setSettings((s) => ({ ...s, autoCloseMinutes: v }));
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, autoCloseMinutes: v }),
      });
      showToast('已更新定时关闭');
    } finally {
      setSavingClose(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  // 周数据填充缺失的日期
  const weeklyData = (() => {
    const map = new Map(weekly.map((w) => [w.day, w.total]));
    const out: { day: string; label: string; total: number; date: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
      out.push({
        day: key,
        label: i === 0 ? '今' : label,
        total: map.get(key) || 0,
        date: d,
      });
    }
    return out;
  })();

  const maxBar = Math.max(...weeklyData.map((d) => d.total), 60);

  return (
    <main className="min-h-[100dvh] flex flex-col pb-12">
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
        <h1 className="flex-1 font-serif-cn text-xl font-semibold text-[var(--color-ink)]">家长中心</h1>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="退出登录"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/60 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="px-5 mt-2 space-y-5">
        {/* 孩子信息条 */}
        <div className="rounded-3xl p-5 flex items-center gap-4 hand-drawn-border"
          style={{ background: 'rgba(255, 253, 247, 0.9)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'var(--color-sand)' }}>
            {child.avatarEmoji}
          </div>
          <div className="flex-1">
            <p className="font-serif-cn text-xl font-semibold">{child.nickname}</p>
            <p className="text-sm text-[var(--color-muted)]">{AGE_LABELS[child.ageGroup]}</p>
          </div>
          {reached && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-rose)] text-[var(--color-accent)] font-medium">
              今日已满
            </span>
          )}
        </div>

        {/* 今日听读报告 */}
        <section className="rounded-3xl p-6 hand-drawn-border"
          style={{ background: 'rgba(255, 253, 247, 0.9)' }}>
          <h2 className="font-serif-cn text-xl font-semibold mb-5">今日听读报告</h2>
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="var(--color-divider)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="var(--color-accent)"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 600ms ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-serif-cn font-semibold tabular-nums text-[var(--color-ink)]">
                  {listenedMinutes}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  / {limitMinutes} 分钟
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-muted)] mt-4">
              今日已陪伴 {formatSeconds(listenedTodaySeconds)}
            </p>
          </div>
        </section>

        {/* 周柱状图 */}
        <section className="rounded-3xl p-6 hand-drawn-border"
          style={{ background: 'rgba(255, 253, 247, 0.9)' }}>
          <h2 className="font-serif-cn text-lg font-semibold mb-4">最近 7 天</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((d) => {
              const heightPct = d.total > 0 ? (d.total / maxBar) * 100 : 4;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] text-[var(--color-muted)] mb-1">
                      {d.total > 0 ? Math.round(d.total / 60) : ''}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="w-full rounded-t-lg"
                      style={{
                        background: d.total > 0
                          ? 'linear-gradient(180deg, #E6A88A 0%, #D87B5A 100%)'
                          : 'var(--color-divider)',
                        minHeight: 4,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--color-muted)]">{d.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 每日限额 */}
        <section className="rounded-3xl p-6 hand-drawn-border"
          style={{ background: 'rgba(255, 253, 247, 0.9)' }}>
          <h2 className="font-serif-cn text-lg font-semibold mb-1">每日听读限额</h2>
          <p className="text-sm text-[var(--color-muted)] mb-4">超过后孩子端会暂停「换一个」按钮</p>
          <div className="grid grid-cols-4 gap-2">
            {LIMIT_OPTIONS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => updateLimit(v)}
                disabled={savingLimit}
                className={cn(
                  'h-14 rounded-2xl text-sm font-medium transition',
                  settings.dailyLimitMinutes === v
                    ? 'btn-cta'
                    : 'bg-[var(--color-sand)] text-[var(--color-muted)] hover:bg-[var(--color-rose)]',
                )}
              >
                {v} 分
              </button>
            ))}
          </div>
        </section>

        {/* 定时关闭 */}
        <section className="rounded-3xl p-6 hand-drawn-border"
          style={{ background: 'rgba(255, 253, 247, 0.9)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[var(--color-forest)]" />
            <h2 className="font-serif-cn text-lg font-semibold">定时关闭</h2>
          </div>
          <p className="text-sm text-[var(--color-muted)] mb-4">播放到时间后自动暂停</p>
          <div className="grid grid-cols-4 gap-2">
            {CLOSE_OPTIONS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => updateClose(v)}
                disabled={savingClose}
                className={cn(
                  'h-14 rounded-2xl text-sm font-medium transition',
                  settings.autoCloseMinutes === v
                    ? 'btn-cta'
                    : 'bg-[var(--color-sand)] text-[var(--color-muted)] hover:bg-[var(--color-rose)]',
                )}
              >
                {v === 0 ? '关闭' : `${v} 分`}
              </button>
            ))}
          </div>
        </section>

        {/* 声音复刻（演示） */}
        <section className="rounded-3xl p-6 hand-drawn-border"
          style={{ background: 'rgba(255, 253, 247, 0.9)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Mic className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-serif-cn text-lg font-semibold">声音复刻</h2>
            <span className="ml-auto tag-soft">预留接口</span>
          </div>
          <p className="text-sm text-[var(--color-muted)] mb-4">录下 3 段声音，让 TA 在睡前听到最熟悉的人</p>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-dashed p-4 flex items-center gap-3"
                style={{ borderColor: 'var(--color-divider)' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-sand)' }}>
                  <Volume2 className="w-4 h-4 text-[var(--color-muted)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">第 {i} 段录音</p>
                  <p className="text-xs text-[var(--color-muted)]">建议 10-30 秒</p>
                </div>
                <span className="text-xs text-[var(--color-muted)]">演示中</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-forest)] bg-[#E5EFE7] rounded-2xl px-4 py-3">
            <Check className="w-4 h-4" />
            <span>正在使用妈妈的声音</span>
            <span className="text-pink-400">🩷</span>
          </div>
        </section>

        <p className="text-center text-xs text-[var(--color-muted)] py-4">
          奇想小剧场 · 把睡前故事交给温柔的声音
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-ink)] text-white px-5 py-2.5 rounded-full text-sm shadow-lg z-50"
        >
          {toast}
        </motion.div>
      )}
    </main>
  );
}
