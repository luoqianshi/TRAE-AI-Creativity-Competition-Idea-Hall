import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllAdmins,
  createAdmin,
  updateAdminStatus,
  resetAdminPassword,
  getAllRolesAndPermissions
} from '../controllers/adminManagementController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = Router();

// 获取所有管理员（需要管理员管理权限）
router.get('/', authenticateToken, requirePermission('admin:manage'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getAllAdmins);

// 创建新管理员（需要管理员管理权限）
router.post('/', authenticateToken, requirePermission('admin:manage'), [
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
  body('role_ids').optional().isArray().withMessage('角色ID必须是数组'),
  body('role').optional().isIn(['Admin', 'Viewer']).withMessage('role 只能是 Admin 或 Viewer')
], createAdmin);

// 更新管理员状态（需要管理员管理权限）
router.patch('/:id/status', authenticateToken, requirePermission('admin:manage'), [
  param('id').isInt({ min: 1 }),
  body('is_active').isBoolean().withMessage('is_active必须是布尔值')
], updateAdminStatus);

// 重置管理员密码（需要管理员管理权限）
router.post('/:id/reset-password', authenticateToken, requirePermission('admin:manage'), [
  param('id').isInt({ min: 1 }),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码长度不能少于6位')
], resetAdminPassword);

// 获取所有角色和权限（需要管理员管理权限）
router.get('/roles-permissions', authenticateToken, requirePermission('admin:manage'), getAllRolesAndPermissions);

export default router;