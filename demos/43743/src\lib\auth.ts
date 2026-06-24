// Session 与 PIN 工具
import 'server-only';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDB, queryOne } from './db';
import { v4 as uuid } from 'uuid';

const SESSION_COOKIE = 'fantasy_session';
export const SALT_ROUNDS = 10;
export const DEFAULT_PIN = '0000';
export const DEFAULT_PIN_HASH = bcrypt.hashSync(DEFAULT_PIN, SALT_ROUNDS);
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 天

export interface SessionProfile {
  profileId: string;
  email: string;
}

export function createSession(profileId: string) {
  cookies().set(SESSION_COOKIE, profileId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function getSessionId(): string | null {
  return cookies().get(SESSION_COOKIE)?.value || null;
}

export function getCurrentProfile(): SessionProfile | null {
  const id = getSessionId();
  if (!id) return null;
  const row = queryOne<{ id: string; email: string }>(
    'SELECT id, email FROM profiles WHERE id = :id',
    { id }
  );
  if (!row) return null;
  return { profileId: row.id, email: row.email };
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(pin, hash);
  } catch {
    return false;
  }
}

export function generateId(): string {
  return uuid();
}

// 首次为某 child 创建 settings（默认 PIN 0000）
export function ensureSettingsForChild(childId: string) {
  const existing = queryOne<{ id: string }>('SELECT id FROM settings WHERE child_id = :cid', { cid: childId });
  if (existing) return;
  getDB()
    .prepare('INSERT INTO settings (id, child_id, daily_limit_minutes, auto_close_minutes, pin_hash, is_auto_play) VALUES (?, ?, 30, 0, ?, 1)')
    .run(uuid(), childId, DEFAULT_PIN_HASH);
}
