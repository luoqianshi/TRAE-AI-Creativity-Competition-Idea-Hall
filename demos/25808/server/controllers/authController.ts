import { Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { recordFailedLogin } from '../middleware/rateLimit';
import {
  successResponse,
  badRequest,
  unauthorized,
  handleError,
} from '../middleware/apiResponse';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authController = {
  async login(req: AuthRequest, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, '参数错误', 'INVALID_INPUT');
      }

      const { username, password } = parsed.data;
      const result = await authService.login(username, password);

      if (!result.success) {
        recordFailedLogin(username);
        return unauthorized(res, result.message || '用户名或密码错误', 'AUTH_FAILED');
      }

      // 设置 httpOnly Cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 小时
      });

      return successResponse(res, result.user, '登录成功');
    } catch (err) {
      handleError(res, err);
    }
  },

  async logout(_req: AuthRequest, res: Response) {
    res.clearCookie('token');
    return successResponse(res, null, '已退出登录');
  },

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return unauthorized(res, '未登录', 'NOT_AUTHENTICATED');
      }

      const user = await authService.getMe(req.user.id);
      if (!user) {
        return unauthorized(res, '用户不存在', 'USER_NOT_FOUND');
      }

      return successResponse(res, user);
    } catch (err) {
      handleError(res, err);
    }
  },
};
