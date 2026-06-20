import { Response } from 'express';
import { z } from 'zod';
import { configRepository } from '../repositories/configRepository';
import { AuthRequest } from '../middleware/auth';
import {
  successResponse,
  badRequest,
  handleError,
} from '../middleware/apiResponse';

const updateConfigSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

export const configController = {
  async getConfig(_req: AuthRequest, res: Response) {
    try {
      const configs = await configRepository.findAll();
      return successResponse(res, configs);
    } catch (err) {
      handleError(res, err);
    }
  },

  async updateConfig(req: AuthRequest, res: Response) {
    try {
      const parsed = updateConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, '参数错误', 'INVALID_INPUT');
      }

      const { key, value } = parsed.data;
      const config = await configRepository.upsert(key, value);
      return successResponse(
        res,
        { key: config.key, value: JSON.parse(config.value) },
        `配置项 "${key}" 更新成功`,
      );
    } catch (err) {
      handleError(res, err);
    }
  },
};
