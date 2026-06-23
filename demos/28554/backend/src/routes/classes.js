import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllClasses,
  getClassesByOrg,
  createClass,
  updateClass
} from '../controllers/classController.js';
import { authenticateToken, optionalAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

// 获取所有班级（家长可免登录查看）
router.get('/', optionalAuth, getAllClasses);

// 获取机构的班级列表（家长可免登录查看）
router.get('/by-org/:orgId', optionalAuth, [
  query('orgId', '机构ID必须是正整数').optional().isInt({ min: 1 })
], getClassesByOrg);

// 创建班级（需要机构管理权限）
router.post('/', authenticateToken, requirePermission('org:manage'), [
  body('org_id').isInt({ min: 1 }).withMessage('机构ID必须是正整数'),
  body('name').notEmpty().withMessage('班级名称不能为空')
], createClass);

// 更新班级状态（需要机构管理权限）
router.patch('/:id/status', authenticateToken, requirePermission('org:manage'), [
  param('id').isInt({ min: 1 }).withMessage('班级ID必须是正整数'),
  body('is_active').isBoolean().withMessage('is_active必须是布尔值')
], updateClass);

export default router;