import { Request, Response } from 'express';
import { dailyRepository } from '../repositories/dailyRepository';
import { configRepository } from '../repositories/configRepository';
import { monthlyRepository } from '../repositories/monthlyRepository';
import { backupImportSchema } from '../validators/backupValidator';
import {
  successResponse,
  badRequest,
  errorResponse,
  handleError,
} from '../middleware/apiResponse';

export const backupController = {
  async exportBackup(_req: Request, res: Response) {
    try {
      const dailyRecords = await dailyRepository.findAll();
      const configs = await configRepository.findAll();

      // 日记录按月份收集所有月份（用于后续查询月度记录）
      const allDailyMonths = new Set<string>();
      for (const r of dailyRecords) {
        const dateStr = r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date;
        allDailyMonths.add(dateStr.substring(0, 7)); // "YYYY-MM"
      }

      // 月度记录按月份分组
      const monthlyByMonth: Record<string, Record<string, number>> = {};
      // 按月份查询月度记录（每条记录是 { circuitId, value }）
      const allMonthlyMonths = [...allDailyMonths];
      for (const month of allMonthlyMonths) {
        const [year, m] = month.split('-').map(Number);
        const monthDate = new Date(year, m - 1, 1);
        const records = await monthlyRepository.findByMonth(monthDate);
        const data: Record<string, number> = {};
        for (const rec of records) {
          data[rec.circuitId] = rec.value;
        }
        if (Object.keys(data).length > 0) {
          monthlyByMonth[month] = data;
        }
      }

      const backup = {
        appName: 'HotelEnergyManagement',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        data: {
          dailyRecords: dailyRecords.map((r: any) => ({
            date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
            readings:
              typeof r.readings === 'string' ? JSON.parse(r.readings) : r.readings,
          })),
          monthlyRecords: Object.entries(monthlyByMonth).map(([month, data]) => ({
            month,
            data,
          })),
          configs,
        },
      };

      return successResponse(res, backup, '备份导出成功');
    } catch (err) {
      handleError(res, err);
    }
  },

  async importBackup(req: Request, res: Response) {
    try {
      const parsed = backupImportSchema.safeParse(req.body);

      if (!parsed.success) {
        return errorResponse(
          res,
          400,
          '备份文件格式不合法',
          'INVALID_BACKUP_FORMAT',
        );
      }

      const backup = parsed.data;
      let importedDailyRecords = 0;
      let importedMonthlyRecords = 0;
      let importedConfigs = 0;

      if (backup.data.dailyRecords) {
        for (const record of backup.data.dailyRecords) {
          const dateObj = new Date(record.date);
          if (isNaN(dateObj.getTime())) {
            return badRequest(res, `无效的日期格式: ${record.date}`, 'INVALID_DATE');
          }
          await dailyRepository.upsert(dateObj, record.readings);
          importedDailyRecords++;
        }
      }

      if (backup.data.monthlyRecords) {
        for (const record of backup.data.monthlyRecords) {
          // 格式: { month: "2024-06", data: { "回路id": 123.5 } }
          const [year, m] = record.month.split('-').map(Number);
          const monthDate = new Date(year, m - 1, 1);

          const records = Object.entries(record.data).map(([circuitId, value]) => ({
            circuitId,
            value: Number(value),
          }));

          await monthlyRepository.upsertBatch(monthDate, records);
          importedMonthlyRecords++;
        }
      }

      if (backup.data.configs) {
        for (const [key, value] of Object.entries(backup.data.configs)) {
          await configRepository.upsert(
            key,
            typeof value === 'string' ? value : JSON.stringify(value),
          );
          importedConfigs++;
        }
      }

      return successResponse(
        res,
        { importedDailyRecords, importedMonthlyRecords, importedConfigs },
        `成功导入 ${importedDailyRecords} 条日记录、${importedMonthlyRecords} 条月记录和 ${importedConfigs} 项配置`,
      );
    } catch (err) {
      handleError(res, err);
    }
  },
};
