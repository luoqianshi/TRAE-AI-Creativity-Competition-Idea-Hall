import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { execute, query, queryOne } from '@/lib/db';
import { getCurrentProfile, hashPin, verifyPin } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

const PinSchema = z.object({
  childId: z.string().min(1),
  action: z.enum(['verify', 'update']),
  pin: z.string().length(4).regex(/^\d{4}$/),
  newPin: z.string().length(4).regex(/^\d{4}$/).optional(),
});

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
    const parsed = PinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'PIN 必须为 4 位数字' } },
        { status: 400 }
      );
    }
    const { childId, action, pin, newPin } = parsed.data;

    // 验证 child 归属
    const child = queryOne<{ id: string }>(
      'SELECT id FROM children WHERE id = :id AND profile_id = :pid',
      { id: childId, pid: profile.profileId }
    );
    if (!child) {
      return NextResponse.json(
        { ok: false, error: { code: 'CHILD_NOT_FOUND', message: '孩子档案不存在' } },
        { status: 404 }
      );
    }

    const settings = queryOne<{ id: string; pin_hash: string }>(
      'SELECT id, pin_hash FROM settings WHERE child_id = :cid',
      { cid: childId }
    );
    if (!settings) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_SETTINGS', message: '未找到设置' } },
        { status: 404 }
      );
    }

    if (action === 'verify') {
      const ok = await verifyPin(pin, settings.pin_hash);
      if (!ok) {
        return NextResponse.json(
          { ok: false, error: { code: 'INVALID_PIN', message: 'PIN 错误' } },
          { status: 401 }
        );
      }
      return NextResponse.json({ ok: true, data: { verified: true } });
    }

    if (action === 'update') {
      if (!newPin) {
        return NextResponse.json(
          { ok: false, error: { code: 'MISSING_NEWPIN', message: '请提供新 PIN' } },
          { status: 400 }
        );
      }
      // 先验证旧 PIN
      const ok = await verifyPin(pin, settings.pin_hash);
      if (!ok) {
        return NextResponse.json(
          { ok: false, error: { code: 'INVALID_PIN', message: '当前 PIN 错误' } },
          { status: 401 }
        );
      }
      const newHash = await hashPin(newPin);
      execute('UPDATE settings SET pin_hash = :h WHERE id = :id', { h: newHash, id: settings.id });
      return NextResponse.json({ ok: true, data: { updated: true } });
    }
    return NextResponse.json({ ok: false, error: { code: 'UNKNOWN_ACTION' } }, { status: 400 });
  } catch (e) {
    console.error('pin error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: 'PIN 操作失败' } },
      { status: 500 }
    );
  }
}
