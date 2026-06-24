'use client';

import { motion } from 'framer-motion';
import { emojiFor, bgFor } from '@/lib/theme';
import { formatSeconds } from '@/utils/format';

export interface StoryCardProps {
  title: string;
  theme: string;
  durationSeconds: number;
  size?: 'lg' | 'md';
  onClick?: () => void;
}

export function StoryCard({ title, theme, durationSeconds, size = 'md', onClick }: StoryCardProps) {
  const emoji = emojiFor(theme);
  const bg = bgFor(theme);
  const isLg = size === 'lg';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`cover-soft ${bg} relative flex flex-col items-stretch text-left overflow-hidden w-full`}
      style={{
        height: isLg ? 360 : 220,
      }}
    >
      {/* 上半部分：背景 + 大 Emoji */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* 装饰圆点 */}
        <span className="absolute top-4 left-4 tag-soft">{theme === 'animal' ? '小动物' : theme === 'dinosaur' ? '恐龙' : theme === 'princess' ? '公主' : theme === 'car' ? '汽车' : theme === 'space' ? '太空' : '故事'}</span>
        <span className="absolute top-4 right-4 tag-soft">{formatSeconds(durationSeconds)}</span>
        <motion.span
          className={`${isLg ? 'text-[140px]' : 'text-[88px]'} leading-none`}
          animate={{ y: [0, -6, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.span>
      </div>

      {/* 下半部分：标题 */}
      <div
        className="px-5 py-4"
        style={{ background: 'rgba(255, 253, 247, 0.92)' }}
      >
        <p className="font-serif-cn text-[var(--color-ink)] font-semibold text-lg line-clamp-1">
          {title}
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-1">点击卡片查看 · 朗读专属声音</p>
      </div>
    </motion.button>
  );
}
