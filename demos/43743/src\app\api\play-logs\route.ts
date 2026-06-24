import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { execute, query } from '@/lib/db';
import { getCurrentProfile } from '@/lib/auth';

const Schema = z.object({
  childId: z.string().min(1),
  storyId: z.string().min(1),
  listenedSeconds: z.number().min(0).max(36000),
});

export async function POST(req: NextRequest) {
  try {
    const profile = getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: { code: 'INVALID_INPUT' } }, { status: 400 });
    }
    const { childId, storyId, listenedSeconds } = parsed.data;
    execute(
      `INSERT INTO play_logs (id, child_id, story_id, listened_seconds) VALUES (:id, :cid, :sid, :sec)`,
      { id: uuid(), cid: childId, sid: storyId, sec: Math.round(listenedSeconds) }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('play-log error', e);
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR' } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const profile = getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }
    const childId = req.nextUrl.searchParams.get('childId');
    if (!childId) {
      return NextResponse.json({ ok: false, error: { code: 'MISSING_CHILD' } }, { status: 400 });
    }
    // 今日累计
    const today = query<{ total: number }>(
      `SELECT COALESCE(SUM(listened_seconds), 0) AS total
       FROM play_logs
       WHERE child_id = :cid AND date(played_at) = date('now', 'localtime')`,
      { cid: childId }
    );
    return NextResponse.json({
      ok: true,
      data: { listenedTodaySeconds: today[0]?.total || 0 },
    });
  } catch (e) {
    console.error('play-log GET', e);
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR' } }, { status: 500 });
  }
}
