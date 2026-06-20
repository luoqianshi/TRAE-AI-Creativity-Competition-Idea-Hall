import { z } from 'zod';

// 支持旧版本和新版本的应用名
const appNameSchema = z.union([
  z.literal('GuoxinFinancialHotelEnergySystem'),
  z.literal('HotelEnergyManagement'),
  z.string(), // 未来其他应用名
]);

export const backupImportSchema = z.object({
  appName: appNameSchema,
  version: z.string(),
  timestamp: z.string(),
  data: z.object({
    dailyRecords: z
      .array(
        z.object({
          date: z.string(),
          readings: z.record(z.string(), z.unknown()),
        }),
      )
      .optional(),
    monthlyRecords: z
      .array(
        z.object({
          month: z.string(),
          data: z.record(z.string(), z.unknown()),
        }),
      )
      .optional(),
    configs: z.record(z.string(), z.unknown()).optional(),
  }),
});
