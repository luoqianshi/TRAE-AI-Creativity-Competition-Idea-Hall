import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { query } from '@/lib/db';
import { emojiFor } from '@/lib/theme';

export async function GET(req: NextRequest) {
  try {
    const profile = getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }
    const childId = req.nextUrl.searchParams.get('childId');
    if (!childId) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_CHILD', message: '缺少 childId' } },
        { status: 400 }
      );
    }
    const rows = query<{
      id: string;
      title: string;
      theme: string;
      duration_seconds: number;
      is_seed: number;
      created_at: string;
    }>(
      `SELECT id, title, theme, duration_seconds, is_seed, created_at
       FROM stories WHERE child_id = :cid
       ORDER BY created_at DESC LIMIT 20`,
      { cid: childId }
    );
    return NextResponse.json({
      ok: true,
      data: {
        stories: rows.map((r) => ({
          id: r.id,
          title: r.title,
          theme: r.theme,
          emoji: emojiFor(r.theme),
          durationSeconds: r.duration_seconds,
          isSeed: !!r.is_seed,
          createdAt: r.created_at,
        })),
      },
    });
  } catch (e) {
    console.error('list error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '加载失败' } },
      { status: 500 }
    );
  }
}
