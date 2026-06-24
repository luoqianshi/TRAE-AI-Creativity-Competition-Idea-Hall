import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { execute, queryOne } from '@/lib/db';
import { createSession, SALT_ROUNDS } from '@/lib/auth';
import { isValidEmail, isValidPassword } from '@/utils/format';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: '请输入合法邮箱与至少 6 位密码' } },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;
    if (!isValidEmail(email) || !isValidPassword(password)) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: '邮箱或密码格式不正确' } },
        { status: 400 }
      );
    }

    // 检查是否已注册
    const existing = queryOne<{ id: string }>(
      'SELECT id FROM profiles WHERE email = :email',
      { email }
    );
    if (existing) {
      return NextResponse.json(
        { ok: false, error: { code: 'EMAIL_TAKEN', message: '该邮箱已注册，请直接登录' } },
        { status: 409 }
      );
    }

    const id = uuid();
    const hash = bcrypt.hashSync(password, SALT_ROUNDS);
    execute('INSERT INTO profiles (id, email, password_hash) VALUES (:id, :email, :hash)', {
      id, email, hash,
    });
    createSession(id);

    return NextResponse.json({ ok: true, data: { profileId: id, email } });
  } catch (e) {
    console.error('register error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '注册失败，请稍后再试' } },
      { status: 500 }
    );
  }
}
