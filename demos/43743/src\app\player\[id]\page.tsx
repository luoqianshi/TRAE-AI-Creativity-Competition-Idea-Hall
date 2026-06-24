import { redirect, notFound } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { PlayerClient } from './PlayerClient';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const profile = getCurrentProfile();
  if (!profile) redirect('/login');

  const story = queryOne<{
    id: string;
    child_id: string;
    title: string;
    theme: string;
    full_text: string;
    audio_url: string | null;
    duration_seconds: number;
  }>(
    `SELECT s.id, s.child_id, s.title, s.theme, s.full_text, s.audio_url, s.duration_seconds
     FROM stories s JOIN children c ON c.id = s.child_id
     WHERE s.id = :id AND c.profile_id = :pid`,
    { id: params.id, pid: profile.profileId }
  );

  if (!story) notFound();

  const child = queryOne<{
    id: string;
    nickname: string;
    age_group: string;
    favorite_themes: string;
  }>(
    'SELECT id, nickname, age_group, favorite_themes FROM children WHERE id = :id',
    { id: story.child_id }
  );

  if (!child) notFound();

  // 今日已听时长
  const today = queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(listened_seconds), 0) AS total
     FROM play_logs WHERE child_id = :cid AND date(played_at) = date('now', 'localtime')`,
    { cid: child.id }
  );

  const settings = queryOne<{ daily_limit_minutes: number }>(
    'SELECT daily_limit_minutes FROM settings WHERE child_id = :cid',
    { cid: child.id }
  );

  return (
    <PlayerClient
      story={{
        id: story.id,
        title: story.title,
        theme: story.theme,
        fullText: story.full_text,
        audioUrl: story.audio_url,
        durationSeconds: story.duration_seconds,
      }}
      child={{
        id: child.id,
        nickname: child.nickname,
        ageGroup: child.age_group as '1-3' | '3-4' | '4-6',
        favoriteThemes: JSON.parse(child.favorite_themes || '[]'),
      }}
      listenedTodaySeconds={today?.total || 0}
      dailyLimitMinutes={settings?.daily_limit_minutes || 30}
    />
  );
}
