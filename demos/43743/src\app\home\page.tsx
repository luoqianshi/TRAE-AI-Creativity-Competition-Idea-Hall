import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { HomeClient } from './HomeClient';
import type { AgeGroup } from '@/types/story';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const profile = getCurrentProfile();
  if (!profile) redirect('/login');

  const child = queryOne<{
    id: string;
    nickname: string;
    age_group: AgeGroup;
    avatar_emoji: string;
    favorite_themes: string;
  }>(
    'SELECT id, nickname, age_group, avatar_emoji, favorite_themes FROM children WHERE profile_id = :pid ORDER BY created_at ASC LIMIT 1',
    { pid: profile.profileId }
  );
  if (!child) redirect('/onboarding');

  // 首次访问：把公共 seed 复制到该 child
  const childSeed = query<{ id: string }>(
    'SELECT id FROM stories WHERE child_id = :cid AND is_seed = 1 LIMIT 1',
    { cid: child.id }
  );
  if (childSeed.length === 0) {
    const publicSeeds = query<{
      id: string;
      title: string;
      theme: string;
      full_text: string;
      audio_url: string | null;
      duration_seconds: number;
    }>(
      `SELECT id, title, theme, full_text, audio_url, duration_seconds
       FROM stories WHERE is_seed = 1 AND child_id = '__public__'`
    );
    const { execute } = await import('@/lib/db');
    for (const s of publicSeeds) {
      const newId = `seed_${child.id.slice(0, 6)}_${s.id.slice(-4)}`;
      try {
        execute(
          `INSERT OR IGNORE INTO stories
           (id, child_id, title, theme, full_text, audio_url, duration_seconds, is_seed)
           VALUES (:id, :cid, :title, :theme, :text, :audio, :dur, 1)`,
          { id: newId, cid: child.id, title: s.title, theme: s.theme, text: s.full_text, audio: s.audio_url, dur: s.duration_seconds }
        );
      } catch {
        // ignore dup
      }
    }
  }

  const initialStories = query<{
    id: string;
    title: string;
    theme: string;
    duration_seconds: number;
  }>(
    `SELECT id, title, theme, duration_seconds
     FROM stories
     WHERE child_id = :cid
     ORDER BY is_seed DESC, created_at DESC
     LIMIT 6`,
    { cid: child.id }
  );

  const settings = queryOne<{ daily_limit_minutes: number }>(
    'SELECT daily_limit_minutes FROM settings WHERE child_id = :cid',
    { cid: child.id }
  );

  return (
    <HomeClient
      child={{
        id: child.id,
        nickname: child.nickname,
        ageGroup: child.age_group,
        avatarEmoji: child.avatar_emoji,
        favoriteThemes: JSON.parse(child.favorite_themes || '[]'),
      }}
      initialStories={initialStories.map((s) => ({
        id: s.id,
        title: s.title,
        theme: s.theme,
        durationSeconds: s.duration_seconds,
      }))}
      dailyLimitMinutes={settings?.daily_limit_minutes || 30}
    />
  );
}
