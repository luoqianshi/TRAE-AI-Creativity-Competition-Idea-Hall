import { Request, Response, NextFunction } from 'express';

// 内存存储：username -> { count, lastAttempt }
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

const WINDOW_MS = 5 * 60 * 1000; // 5 分钟
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 分钟锁定

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const username = req.body?.username;
  if (!username) return next();

  const now = Date.now();
  const record = loginAttempts.get(username);

  if (record) {
    // 检查是否在锁定中
    if (now - record.lastAttempt < LOCKOUT_MS && record.count >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_MS - (now - record.lastAttempt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `登录失败次数过多，请 ${remaining} 秒后重试`,
      });
    }

    // 窗口过期，重置计数
    if (now - record.lastAttempt > WINDOW_MS) {
      loginAttempts.set(username, { count: 1, lastAttempt: now });
    } else {
      record.count++;
      record.lastAttempt = now;
    }
  } else {
    loginAttempts.set(username, { count: 1, lastAttempt: now });
  }

  next();
}

export function recordFailedLogin(username: string) {
  const record = loginAttempts.get(username);
  if (record) {
    record.count = MAX_ATTEMPTS; // 触发锁定
    record.lastAttempt = Date.now();
  }
}

export function clearLoginAttempts(username: string) {
  loginAttempts.delete(username);
}
