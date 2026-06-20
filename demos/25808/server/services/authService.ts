import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { clearLoginAttempts } from '../middleware/rateLimit';
import { JWT_CONFIG } from '../config/jwt';

export interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
    name: string;
  };
  token?: string;
  message?: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByUsername(username);

    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }

    if (user.status !== 'active') {
      return { success: false, message: '账户已被禁用' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, message: '用户名或密码错误' };
    }

    clearLoginAttempts(username);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      JWT_CONFIG.SECRET,
      { expiresIn: JWT_CONFIG.EXPIRES_IN_SECONDS }
    );

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      token,
    };
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    };
  },
};
