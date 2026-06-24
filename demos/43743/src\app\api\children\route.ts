import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { execute, query, queryOne } from '@/lib/db';
import { getCurrentProfile, ensureSettingsForChild } from '@/lib/auth';
import type { AgeGroup, ThemeKey } from '@/types/story';

const CreateChildSchema = z.object({
  nickname: z.string().min(1).max(8),
  ageGroup: z.enum(['1-3', '3-4', '4-6']),
  avatarEmoji: z.string().min(1).max(8).optional(),
  favoriteThemes: z.array(z.string()).max(8).optional(),
});

export async function GET() {
  try {
    const profile = getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }
    const rows = query<{
      id: string;
      nickname: string;
      age_group: AgeGroup;
      avatar_emoji: string;
      favorite_themes: string;
      created_at: string;
    }>(
      `SELECT id, nickname, age_group, avatar_emoji, favorite_themes, created_at
       FROM children WHERE profile_id = :pid ORDER BY created_at ASC`,
      { pid: profile.profileId }
    );
    return NextResponse.json({
      ok: true,
      data: {
        children: rows.map((r) => ({
          id: r.id,
          nickname: r.nickname,
          ageGroup: r.age_group,
          avatarEmoji: r.avatar_emoji,
          favoriteThemes: JSON.parse(r.favorite_themes || '[]') as ThemeKey[],
          createdAt: r.created_at,
        })),
      },
    });
  } catch (e) {
    console.error('children GET error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '加载失败' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }
    const body = await req.json();
    const parsed = CreateChildSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: '请检查输入：昵称 1-8 字，年龄段必选' } },
        { status: 400 }
      );
    }
    const { nickname, ageGroup, avatarEmoji, favoriteThemes } = parsed.data;
    const id = uuid();
    execute(
      `INSERT INTO children (id, profile_id, nickname, age_group, avatar_emoji, favorite_themes)
       VALUES (:id, :pid, :nick, :age, :emoji, :themes)`,
      {
        id,
        pid: profile.profileId,
        nick: nickname,
        age: ageGroup,
        emoji: avatarEmoji || '🐰',
        themes: JSON.stringify(favoriteThemes || []),
      }
    );
    ensureSettingsForChild(id);
    return NextResponse.json({
      ok: true,
      data: {
        child: {
          id,
          nickname,
          ageGroup,
          avatarEmoji: avatarEmoji || '🐰',
          favoriteThemes: favoriteThemes || [],
        },
      },
    });
  } catch (e) {
    console.error('children POST error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '创建失败' } },
      { status: 500 }
    );
  }
}
