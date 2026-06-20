import { Response } from 'express';
import { z } from 'zod';
import { recordsService } from '../services/recordsService';
import { AuthRequest } from '../middleware/auth';
import {
  successResponse,
  badRequest,
  notFound,
  handleError,
  requireParams,
} from '../middleware/apiResponse';

const readingsSchema = z.record(z.string(), z.any());

const dailyRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readings: readingsSchema,
});

const monthlyRecordItemSchema = z.object({
  circuitId: z.string(),
  value: z.number(),
  swap: z.boolean().optional(),
  oldFinal: z.number().optional(),
  newStart: z.number().optional(),
});

const monthlyRecordsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  records: z.array(monthlyRecordItemSchema),
});

export const recordsController = {
  async getDailyRecords(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const records = await recordsService.getDailyRecords(
        startDate as string,
        endDate as string,
      );
      return successResponse(res, records);
    } catch (err) {
      handleError(res, err);
    }
  },

  async getDailyStatistics(req: AuthRequest, res: Response) {
    try {
      const missing = requireParams(req.query as Record<string, unknown>, ['month']);
      if (missing) return badRequest(res, missing);

      const stats = await recordsService.getDailyStatistics(req.query.month as string);
      return successResponse(res, stats);
    } catch (err) {
      handleError(res, err);
    }
  },

  async getDailyRecordByDate(req: AuthRequest, res: Response) {
    try {
      const record = await recordsService.getDailyRecordByDate(req.params.date);
      if (!record) return notFound(res, '记录不存在', 'RECORD_NOT_FOUND');
      return successResponse(res, record);
    } catch (err) {
      handleError(res, err);
    }
  },

  async saveDailyRecord(req: AuthRequest, res: Response) {
    try {
      const parsed = dailyRecordSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, '参数错误', 'INVALID_INPUT');
      }

      const { date, readings } = parsed.data;
      const record = await recordsService.saveDailyRecord(date, readings);
      return successResponse(res, { ...record, readings: JSON.parse(record.readings) }, '记录保存成功');
    } catch (err) {
      handleError(res, err);
    }
  },

  async getMonthlyRecords(req: AuthRequest, res: Response) {
    try {
      const missing = requireParams(req.query as Record<string, unknown>, ['month']);
      if (missing) return badRequest(res, missing);

      const records = await recordsService.getMonthlyRecords(req.query.month as string);
      return successResponse(res, records);
    } catch (err) {
      handleError(res, err);
    }
  },

  async saveMonthlyRecords(req: AuthRequest, res: Response) {
    try {
      const parsed = monthlyRecordsSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, '参数错误', 'INVALID_INPUT');
      }

      const { month, records } = parsed.data;
      const result = await recordsService.saveMonthlyRecords(month, records);
      return successResponse(res, result, '月度记录保存成功');
    } catch (err) {
      handleError(res, err);
    }
  },
};
