// 主题 -> Emoji 映射
import type { ThemeKey } from '@/types/story';

export const THEME_EMOJI: Record<string, string> = {
  dinosaur: '🦕',
  princess: '👸',
  car: '🚗',
  space: '🚀',
  animal: '🐰',
  default: '📖',
};

// Tailwind 原子类（用于 className）
export const THEME_BG: Record<string, string> = {
  dinosaur: 'bg-[#DDEBD3]',
  princess: 'bg-[#F8E1E7]',
  car: 'bg-[#FFE2C2]',
  space: 'bg-[#D7E3EC]',
  animal: 'bg-[#F4E4C1]',
  default: 'bg-[#EDE3D2]',
};

// 原始十六进制色（用于内联 style）
export const THEME_COLOR: Record<string, string> = {
  dinosaur: '#DDEBD3',
  princess: '#F8E1E7',
  car: '#FFE2C2',
  space: '#D7E3EC',
  animal: '#F4E4C1',
  default: '#EDE3D2',
};

export function emojiFor(theme: string | null | undefined): string {
  if (!theme) return THEME_EMOJI.default;
  return THEME_EMOJI[theme] || THEME_EMOJI.default;
}

export function bgFor(theme: string | null | undefined): string {
  if (!theme) return THEME_BG.default;
  return THEME_BG[theme] || THEME_BG.default;
}

export function colorFor(theme: string | null | undefined): string {
  if (!theme) return THEME_COLOR.default;
  return THEME_COLOR[theme] || THEME_COLOR.default;
}
