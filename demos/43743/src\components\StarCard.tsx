'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const VOCAB = [
  { emoji: '🦕', word: '小恐龙' },
  { emoji: '🌟', word: '亮星星' },
  { emoji: '🌈', word: '彩虹' },
  { emoji: '🦋', word: '蝴蝶' },
  { emoji: '🌸', word: '小花' },
  { emoji: '🐰', word: '小兔子' },
  { emoji: '🍎', word: '红苹果' },
  { emoji: '🌙', word: '月亮' },
  { emoji: '🐠', word: '小鱼' },
  { emoji: '🎈', word: '气球' },
];

const POSITIONS = [
  { x: '8%', y: '20%' },
  { x: '72%', y: '15%' },
  { x: '10%', y: '60%' },
  { x: '70%', y: '55%' },
  { x: '40%', y: '12%' },
  { x: '35%', y: '70%' },
];

export interface StarCardHandle {
  trigger: () => void;
}

export function StarCard() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState(POSITIONS[0]);
  const [item, setItem] = useState(VOCAB[0]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    function schedule() {
      const delay = 12000 + Math.random() * 14000; // 12-26 秒
      const t = setTimeout(() => {
        if (!mounted) return;
        const newItem = VOCAB[Math.floor(Math.random() * VOCAB.length)];
        const newPos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
        setItem(newItem);
        setPos(newPos);
        setKey((k) => k + 1);
        setVisible(true);
        // 自动消失
        setTimeout(() => {
          if (mounted) setVisible(false);
        }, 4500);
        schedule();
      }, delay);
      return t;
    }
    const t = schedule();
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key={key}
          type="button"
          onClick={() => setVisible(false)}
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.4, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          whileTap={{ scale: 0.92 }}
          className="absolute z-30 px-5 py-3 rounded-2xl flex items-center gap-3 hand-drawn-border"
          style={{
            left: pos.x,
            top: pos.y,
            background: 'rgba(255, 253, 247, 0.95)',
            boxShadow: '0 12px 32px rgba(216, 123, 90, 0.18)',
          }}
        >
          <motion.span
            className="text-5xl"
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {item.emoji}
          </motion.span>
          <span className="text-lg font-serif-cn font-semibold text-[var(--color-ink)]">
            {item.word}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
