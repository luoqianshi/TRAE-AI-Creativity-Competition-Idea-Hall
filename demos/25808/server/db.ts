import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'prisma', 'energy.db')}`,
});

export const prisma = new PrismaClient({ adapter });
