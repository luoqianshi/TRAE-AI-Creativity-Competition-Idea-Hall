// 工具函数
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 秒数 -> "00:00"
export function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// 估算中文朗读时长：每秒 3.5 字
export function estimateDurationSeconds(text: string): number {
  const length = [...text.replace(/\s/g, '')].length; // 移除空白后的字符数
  return Math.max(30, Math.round(length / 3.5));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(pwd: string): boolean {
  return typeof pwd === 'string' && pwd.length >= 6;
}
