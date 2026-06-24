import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { execute, queryOne } from '@/lib/db';
import { getCurrentProfile } from '@/lib/auth';

const Schema = z.object({
  childId: z.string().min(1),
  dailyLimitMinutes: z.number().min(5).max(240).optional(),
  autoCloseMinutes: z.number().min(0).max(120).optional(),
  isAutoPlay: z.boolean().optional(),
});

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
    const row = queryOne<{
      daily_limit_minutes: number;
      auto_close_minutes: number;
      is_auto_play: number;
    }>(
      `SELECT s.daily_limit_minutes, s.auto_close_minutes, s.is_auto_play
       FROM settings s JOIN children c ON c.id = s.child_id
       WHERE s.child_id = :cid AND c.profile_id = :pid`,
      { cid: childId, pid: profile.profileId }
    );
    if (!row) {
      return NextResponse.json({ ok: false, error: { code: 'NO_SETTINGS' } }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      data: {
        dailyLimitMinutes: row.daily_limit_minutes,
        autoCloseMinutes: row.auto_close_minutes,
        isAutoPlay: !!row.is_auto_play,
      },
    });
  } catch (e) {
    console.error('settings GET', e);
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR' } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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
    const { childId, dailyLimitMinutes, autoCloseMinutes, isAutoPlay } = parsed.data;
    const child = queryOne<{ id: string }>(
      'SELECT id FROM children WHERE id = :id AND profile_id = :pid',
      { id: childId, pid: profile.profileId }
    );
    if (!child) {
      return NextResponse.json({ ok: false, error: { code: 'CHILD_NOT_FOUND' } }, { status: 404 });
    }
    const fields: string[] = [];
    const params: Record<string, unknown> = { cid: childId };
    if (dailyLimitMinutes !== undefined) {
      fields.push('daily_limit_minutes = :dlim');
      params.dlim = dailyLimitMinutes;
    }
    if (autoCloseMinutes !== undefined) {
      fields.push('auto_close_minutes = :aclose');
      params.aclose = autoCloseMinutes;
    }
    if (isAutoPlay !== undefined) {
      fields.push('is_auto_play = :ap');
      params.ap = isAutoPlay ? 1 : 0;
    }
    if (fields.length === 0) {
      return NextResponse.json({ ok: true, data: { updated: false } });
    }
    execute(`UPDATE settings SET ${fields.join(', ')} WHERE child_id = :cid`, params);
    return NextResponse.json({ ok: true, data: { updated: true } });
  } catch (e) {
    console.error('settings PATCH', e);
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR' } }, { status: 500 });
  }
}
