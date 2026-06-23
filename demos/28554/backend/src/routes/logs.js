import { Router } from 'express';
import { query } from 'express-validator';
import { getOperationLogs } from '../controllers/logController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = Router();

// 获取操作日志（需要查看日志权限）
router.get('/', authenticateToken, requirePermission('log:view'), [
  query('admin_id').optional().isInt({ min: 1 }),
  query('operator').optional().isString(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], getOperationLogs);

export default router;