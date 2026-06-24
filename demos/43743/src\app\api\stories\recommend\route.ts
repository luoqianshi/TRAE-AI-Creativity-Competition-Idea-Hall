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

    // 1) 拉该 child 最近的 3 个故事
    const rows = query<{
      id: string;
      title: string;
      theme: string;
      duration_seconds: number;
      is_seed: number;
      created_at: string;
    }>(
      `SELECT id, title, theme, duration_seconds, is_seed, created_at
       FROM stories
       WHERE child_id = :cid
       ORDER BY created_at DESC
       LIMIT 3`,
      { cid: childId }
    );

    if (rows.length >= 3) {
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
          })),
        },
      });
    }

    // 2) 不足 3 个 → 补充 seed
    const seedRows = query<{
      id: string;
      title: string;
      theme: string;
      duration_seconds: number;
      is_seed: number;
    }>(
      `SELECT id, title, theme, duration_seconds, is_seed
       FROM stories
       WHERE is_seed = 1
       ORDER BY created_at ASC`
    );

    // 把 seed 复制给该 child（仅首次）
    const childSeed = query<{ id: string }>(
      'SELECT id FROM stories WHERE child_id = :cid AND is_seed = 1 LIMIT 1',
      { cid: childId }
    );
    if (childSeed.length === 0) {
      for (const s of seedRows) {
        const fullText = query<{ full_text: string }>(
          'SELECT full_text FROM stories WHERE id = :id',
          { id: s.id }
        )[0]?.full_text || '';
        query(
          `INSERT OR IGNORE INTO stories
           (id, child_id, title, theme, full_text, audio_url, duration_seconds, is_seed)
           SELECT :nid, :cid, title, theme, full_text, audio_url, duration_seconds, 1
           FROM stories WHERE id = :sid`,
          { nid: `seed_${childId.slice(0, 6)}_${s.id.slice(-4)}`, cid: childId, sid: s.id }
        );
      }
    }

    const finalRows = query<{
      id: string;
      title: string;
      theme: string;
      duration_seconds: number;
      is_seed: number;
    }>(
      `SELECT id, title, theme, duration_seconds, is_seed
       FROM stories WHERE child_id = :cid
       ORDER BY is_seed DESC, created_at DESC LIMIT 3`,
      { cid: childId }
    );

    return NextResponse.json({
      ok: true,
      data: {
        stories: finalRows.map((r) => ({
          id: r.id,
          title: r.title,
          theme: r.theme,
          emoji: emojiFor(r.theme),
          durationSeconds: r.duration_seconds,
          isSeed: !!r.is_seed,
        })),
      },
    });
  } catch (e) {
    console.error('recommend error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '推荐失败' } },
      { status: 500 }
    );
  }
}
