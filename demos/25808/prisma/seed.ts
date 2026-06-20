import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superadminPassword = process.env.SEED_SUPERADMIN_PASSWORD || 'admin123';
  const directorPassword = process.env.SEED_DIRECTOR_PASSWORD || 'admin123';
  const supervisorPassword = process.env.SEED_SUPERVISOR_PASSWORD || '123456';

  const superadminHash = await bcrypt.hash(superadminPassword, 12);
  const directorHash = await bcrypt.hash(directorPassword, 12);
  const supervisorHash = await bcrypt.hash(supervisorPassword, 12);

  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      passwordHash: superadminHash,
      role: 'superadmin',
      name: '超级管理员',
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: directorHash,
      role: 'engineer_director',
      name: '工程总监',
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { username: 'engineer' },
    update: {},
    create: {
      username: 'engineer',
      passwordHash: supervisorHash,
      role: 'engineer_supervisor',
      name: '工程主管',
      status: 'active',
    },
  });

  console.log('种子数据已创建。');
  console.log('默认用户: superadmin, admin, engineer');
  console.log('密码通过环境变量 SEED_SUPERADMIN_PASSWORD / SEED_DIRECTOR_PASSWORD / SEED_SUPERVISOR_PASSWORD 配置');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
