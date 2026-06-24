'use client';

import { motion } from 'framer-motion';

export function MagicLoader({ text = '小精灵正在编故事…' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 text-6xl origin-center"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          🌟
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -right-2 text-3xl"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          ✨
        </motion.div>
      </div>
      <p className="font-serif-cn text-[var(--color-muted)] text-base animate-pulse">{text}</p>
    </div>
  );
}
