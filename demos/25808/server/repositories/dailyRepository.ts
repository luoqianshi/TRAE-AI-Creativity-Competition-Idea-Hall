import { prisma } from '../db';

export const dailyRepository = {
  async findByDate(date: Date) {
    return prisma.dailyRecord.findUnique({
      where: { date },
    });
  },

  async findAll(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    return prisma.dailyRecord.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  },

  async upsert(date: Date, readings: Record<string, any>) {
    const readingsStr = JSON.stringify(readings);
    return prisma.dailyRecord.upsert({
      where: { date },
      update: { readings: readingsStr },
      create: { date, readings: readingsStr },
    });
  },
};
