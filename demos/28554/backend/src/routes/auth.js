import { Router } from 'express';
import { body } from 'express-validator';
import { login, getCurrentAdmin, changePassword } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// 登录
router.post('/login', [
  body('phone').notEmpty().withMessage('手机号不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], login);

// 获取当前管理员信息（需要登录）
router.get('/me', authenticateToken, getCurrentAdmin);

// 修改密码（需要登录）
router.post('/change-password', authenticateToken, [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码长度不能少于6位')
], changePassword);

export default router;