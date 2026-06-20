import { prisma } from '../db';

export const monthlyRepository = {
  async findByMonth(monthDate: Date) {
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    return prisma.monthlyRecord.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
  },

  async upsertBatch(monthDate: Date, records: Array<{
    circuitId: string;
    value: number;
    swap?: boolean;
    oldFinal?: number;
    newStart?: number;
  }>) {
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);

    return prisma.$transaction(async (tx) => {
      await tx.monthlyRecord.deleteMany({
        where: {
          date: {
            gte: startOfMonth,
            lt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
          },
        },
      });

      return tx.monthlyRecord.createMany({
        data: records.map((r) => ({
          date: startOfMonth,
          circuitId: r.circuitId,
          value: r.value,
          swap: r.swap || false,
          oldFinal: r.oldFinal,
          newStart: r.newStart,
        })),
      });
    });
  },
};
