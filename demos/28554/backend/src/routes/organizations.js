import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization
} from '../controllers/organizationController.js';
import { authenticateToken, optionalAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

// 获取所有机构（家长可免登录查看）
router.get('/', optionalAuth, getAllOrganizations);

// 创建机构（需要机构管理权限）
router.post('/', authenticateToken, requirePermission('org:manage'), [
  body('name').notEmpty().withMessage('机构名称不能为空')
], createOrganization);

// 更新机构状态（需要机构管理权限）
router.patch('/:id/status', authenticateToken, requirePermission('org:manage'), [
  param('id').isInt({ min: 1 }).withMessage('机构ID必须是正整数'),
  body('is_active').isBoolean().withMessage('is_active必须是布尔值')
], updateOrganization);

export default router;