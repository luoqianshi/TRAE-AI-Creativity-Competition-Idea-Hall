import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { createSession } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: '邮箱或密码格式不正确' } },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;
    const row = queryOne<{ id: string; email: string; password_hash: string }>(
      'SELECT id, email, password_hash FROM profiles WHERE email = :email',
      { email }
    );
    if (!row) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' } },
        { status: 401 }
      );
    }
    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' } },
        { status: 401 }
      );
    }
    createSession(row.id);

    // 检查是否完成 onboarding
    const child = queryOne<{ id: string }>(
      'SELECT id FROM children WHERE profile_id = :pid LIMIT 1',
      { pid: row.id }
    );
    return NextResponse.json({
      ok: true,
      data: { profileId: row.id, email: row.email, hasOnboarded: !!child },
    });
  } catch (e) {
    console.error('login error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '登录失败，请稍后再试' } },
      { status: 500 }
    );
  }
}
