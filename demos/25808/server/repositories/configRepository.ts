import { prisma } from '../db';

export const configRepository = {
  async findByKey(key: string) {
    return prisma.systemConfig.findUnique({ where: { key } });
  },

  async upsert(key: string, value: any) {
    const valueStr = JSON.stringify(value);
    return prisma.systemConfig.upsert({
      where: { key },
      update: { value: valueStr },
      create: { key, value: valueStr },
    });
  },

  async findAll() {
    const configs = await prisma.systemConfig.findMany();
    const result: Record<string, any> = {};
    for (const c of configs) {
      result[c.key] = JSON.parse(c.value);
    }
    return result;
  },
};
