'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { cn, isValidEmail, isValidPassword } from '@/utils/format';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError('请输入合法邮箱');
      return;
    }
    if (!isValidPassword(password)) {
      setError('密码至少 6 位');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error?.message || '请求失败');
        return;
      }
      // 成功：判断是否完成 onboarding
      if (data.data?.hasOnboarded) {
        router.push('/home');
      } else {
        router.push('/onboarding');
      }
      router.refresh();
    } catch (err) {
      setError('网络异常，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  async function fillDemo() {
    setEmail('demo@fantasy.local');
    setPassword('demo1234');
    setMode('login');
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* 顶部装饰：飘浮小符号 */}
        <div className="text-center mb-8 relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-1 dashed-soft" />
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)] mb-2">
            奇想 · 小剧场
          </p>
          <h1 className="font-serif-cn text-4xl font-semibold text-[var(--color-ink)] mb-3">
            为孩子讲一个<br />只属于 TA 的故事
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            睡前十分钟 · 让爸爸妈妈的声音一直都在
          </p>
        </div>

        {/* 登录卡片 */}
        <div
          className="rounded-3xl p-7 hand-drawn-border"
          style={{ background: 'rgba(255, 253, 247, 0.9)' }}
        >
          {/* 模式切换 */}
          <div className="flex p-1 rounded-2xl mb-6"
            style={{ background: 'var(--color-sand)' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all',
                mode === 'login'
                  ? 'bg-white text-[var(--color-ink)] shadow-sm'
                  : 'text-[var(--color-muted)]'
              )}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all',
                mode === 'register'
                  ? 'bg-white text-[var(--color-ink)] shadow-sm'
                  : 'text-[var(--color-muted)]'
              )}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-[var(--color-muted)] mb-1.5 block">家长邮箱</span>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-warm w-full pl-12"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-[var(--color-muted)] mb-1.5 block">
                密码 <span className="text-xs">（至少 6 位）</span>
              </span>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="input-warm w-full pl-12"
                  required
                />
              </div>
            </label>

            {error && (
              <div className="flex items-start gap-2 text-sm text-[var(--color-accent)] bg-[var(--color-rose)] rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl btn-cta font-medium text-base flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  请稍候…
                </>
              ) : (
                <span>{mode === 'login' ? '进入剧场' : '创建账号'}</span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[var(--color-divider)] flex items-center justify-between text-sm">
            <span className="text-[var(--color-muted)]">想先看看？</span>
            <button
              type="button"
              onClick={fillDemo}
              className="text-[var(--color-forest)] font-medium hover:underline"
            >
              使用体验账号 →
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)] mt-6 leading-relaxed">
          体验账号：demo@fantasy.local / demo1234<br />
          家长 PIN：0000
        </p>
      </motion.div>
    </main>
  );
}
