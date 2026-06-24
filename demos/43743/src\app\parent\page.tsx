import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { ParentClient } from './ParentClient';

export const dynamic = 'force-dynamic';

export default async function ParentPage() {
  const profile = getCurrentProfile();
  if (!profile) redirect('/login');

  const child = queryOne<{
    id: string;
    nickname: string;
    age_group: string;
    avatar_emoji: string;
  }>(
    'SELECT id, nickname, age_group, avatar_emoji FROM children WHERE profile_id = :pid ORDER BY created_at ASC LIMIT 1',
    { pid: profile.profileId }
  );
  if (!child) redirect('/onboarding');

  const settings = queryOne<{
    daily_limit_minutes: number;
    auto_close_minutes: number;
    is_auto_play: number;
  }>(
    'SELECT daily_limit_minutes, auto_close_minutes, is_auto_play FROM settings WHERE child_id = :cid',
    { cid: child.id }
  );

  const today = queryOne<{ total: number }>(
    `SELECT COALESCE(SUM(listened_seconds), 0) AS total
     FROM play_logs WHERE child_id = :cid AND date(played_at) = date('now', 'localtime')`,
    { cid: child.id }
  );

  // 最近 7 天听读
  const weekly = query<{ day: string; total: number }>(
    `SELECT date(played_at) AS day, COALESCE(SUM(listened_seconds), 0) AS total
     FROM play_logs
     WHERE child_id = :cid AND played_at >= datetime('now', '-6 days', 'localtime')
     GROUP BY date(played_at)
     ORDER BY day ASC`,
    { cid: child.id }
  );

  return (
    <ParentClient
      child={{
        id: child.id,
        nickname: child.nickname,
        ageGroup: child.age_group as '1-3' | '3-4' | '4-6',
        avatarEmoji: child.avatar_emoji,
      }}
      initialSettings={{
        dailyLimitMinutes: settings?.daily_limit_minutes || 30,
        autoCloseMinutes: settings?.auto_close_minutes || 0,
        isAutoPlay: settings?.is_auto_play === 1,
      }}
      listenedTodaySeconds={today?.total || 0}
      weekly={weekly.map((w) => ({ day: w.day, total: w.total }))}
    />
  );
}
