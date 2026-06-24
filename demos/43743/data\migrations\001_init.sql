-- 奇想小剧场 — SQLite 初始化迁移
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('1-3', '3-4', '4-6')),
  avatar_emoji TEXT NOT NULL DEFAULT '🐰',
  favorite_themes TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  full_text TEXT NOT NULL,
  audio_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_seed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  daily_limit_minutes INTEGER NOT NULL DEFAULT 30,
  auto_close_minutes INTEGER NOT NULL DEFAULT 0,
  pin_hash TEXT NOT NULL,
  is_auto_play INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS play_logs (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  listened_seconds INTEGER NOT NULL DEFAULT 0,
  played_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stories_child ON stories(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlogs_child_day ON play_logs(child_id, played_at);
CREATE INDEX IF NOT EXISTS idx_children_profile ON children(profile_id);
