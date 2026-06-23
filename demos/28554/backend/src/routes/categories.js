import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateToken, optionalAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

// 获取所有类目（家长可免登录查看）
router.get('/', optionalAuth, getAllCategories);

// 创建类目（需要类目管理权限）
router.post('/', authenticateToken, requirePermission('category:manage'), [
  body('name').notEmpty().withMessage('类目名称不能为空'),
  body('color').optional().isURL().withMessage('颜色必须是有效的十六进制颜色值')
], createCategory);

// 更新类目（需要类目管理权限）
router.put('/:id', authenticateToken, requirePermission('category:manage'), [
  param('id').isInt({ min: 1 }).withMessage('类目ID必须是正整数'),
  body('name').optional().notEmpty().withMessage('类目名称不能为空'),
  body('color').optional().isURL().withMessage('颜色必须是有效的十六进制颜色值'),
  body('sort_order').optional().isInt().withMessage('排序序号必须是整数'),
  body('is_active').optional().isBoolean().withMessage('is_active必须是布尔值')
], updateCategory);

// 删除类目（软删除，需要类目管理权限）
router.delete('/:id', authenticateToken, requirePermission('category:manage'), [
  param('id').isInt({ min: 1 }).withMessage('类目ID必须是正整数')
], deleteCategory);

export default router;