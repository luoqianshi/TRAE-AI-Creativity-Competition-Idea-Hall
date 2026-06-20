import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { recordsController } from '../controllers/recordsController';
import { configController } from '../controllers/configController';
import { backupController } from '../controllers/backupController';

const router = Router();

// Daily Records
router.get('/records/daily', authenticate, recordsController.getDailyRecords);
router.get('/records/daily/stats', authenticate, recordsController.getDailyStatistics);
router.get('/records/daily/:date(\\d{4}-\\d{2}-\\d{2})', authenticate, recordsController.getDailyRecordByDate);
router.post('/records/daily', authenticate, recordsController.saveDailyRecord);

// Monthly Records
router.get('/records/monthly', authenticate, recordsController.getMonthlyRecords);
router.post('/records/monthly', authenticate, recordsController.saveMonthlyRecords);

// Config
router.get('/config', authenticate, configController.getConfig);
router.put('/config', authenticate, requireRole('superadmin', 'engineer_director'), configController.updateConfig);

// Backup
router.post('/backup/export', authenticate, requireRole('superadmin', 'engineer_director'), backupController.exportBackup);
router.post('/backup/import', authenticate, requireRole('superadmin'), backupController.importBackup);

export default router;
