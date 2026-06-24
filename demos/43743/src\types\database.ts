// 数据库类型定义 — 与 data/migrations/001_init.sql 保持一致

export interface Profile {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export type AgeGroup = '1-3' | '3-4' | '4-6';

export interface Child {
  id: string;
  profile_id: string;
  nickname: string;
  age_group: AgeGroup;
  avatar_emoji: string;
  favorite_themes: string; // JSON 字符串
  created_at: string;
}

export interface Story {
  id: string;
  child_id: string;
  title: string;
  theme: string;
  full_text: string;
  audio_url: string | null;
  duration_seconds: number;
  is_seed: number; // 0 | 1
  created_at: string;
}

export interface Settings {
  id: string;
  child_id: string;
  daily_limit_minutes: number;
  auto_close_minutes: number;
  pin_hash: string;
  is_auto_play: number; // 0 | 1
}

export interface PlayLog {
  id: string;
  child_id: string;
  story_id: string;
  listened_seconds: number;
  played_at: string;
}
