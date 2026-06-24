'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-7xl mb-4">🌙</p>
        <h1 className="font-serif-cn text-3xl font-semibold text-[var(--color-ink)] mb-2">
          故事飞走了
        </h1>
        <p className="text-[var(--color-muted)] mb-6">这个故事不在书架上，回到首页再找找吧</p>
        <Link
          href="/home"
          className="inline-block px-6 h-12 leading-[3rem] rounded-2xl btn-cta"
        >
          回到首页
        </Link>
      </motion.div>
    </main>
  );
}
