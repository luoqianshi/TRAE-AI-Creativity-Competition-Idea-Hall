import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getStatistics,
  approveExpense
} from '../controllers/expenseController.js';
import { authenticateToken, optionalAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

// 获取费用列表（家长可免登录查看，管理员需要登录）
router.get('/', optionalAuth, [
  query('org_id').optional().isInt({ min: 1 }),
  query('class_id').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['待审核', '进行中', '已完成']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getExpenses);

// 获取统计数据（必须放在 /:id 之前，否则 "stats" 会被当作 id）
router.get('/stats/summary', optionalAuth, [
  query('org_id').optional().isInt({ min: 1 }),
  query('class_id').optional().isInt({ min: 1 }),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601()
], getStatistics);

// 获取费用详情（家长可免登录查看）
router.get('/:id', optionalAuth, [
  param('id').isInt({ min: 1 })
], getExpenseById);

// 创建费用记录（需要创建费用权限）
router.post('/', authenticateToken, requirePermission('expense:create'), [
  body('date').isDate().withMessage('日期格式不正确'),
  body('category').notEmpty().withMessage('类目不能为空'),
  body('amount').isFloat({ min: 0.01 }).withMessage('金额必须大于0'),
  body('handler').notEmpty().withMessage('经手人不能为空'),
  body('status').optional().isIn(['待审核', '进行中', '已完成']),
  body('remark').optional().isString(),
  body('class_id').optional().isInt({ min: 1 }),
  body('org_id').optional().isInt({ min: 1 })
], createExpense);

// 更新费用记录（需要更新费用权限）
router.put('/:id', authenticateToken, requirePermission('expense:update'), [
  param('id').isInt({ min: 1 }),
  body('date').optional().isDate(),
  body('category').optional().notEmpty(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('handler').optional().notEmpty(),
  body('status').optional().isIn(['待审核', '进行中', '已完成']),
  body('remark').optional().isString(),
  body('class_id').optional().isInt({ min: 1 }),
  body('org_id').optional().isInt({ min: 1 })
], updateExpense);

// 删除费用记录（需要删除费用权限）
router.delete('/:id', authenticateToken, requirePermission('expense:delete'), [
  param('id').isInt({ min: 1 })
], deleteExpense);

// 审批费用记录（需要更新费用权限）
router.post('/:id/approve', authenticateToken, requirePermission('expense:update'), [
  param('id').isInt({ min: 1 })
], approveExpense);

export default router;