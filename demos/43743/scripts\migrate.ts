// 数据库迁移脚本
// 运行：npm run db:migrate
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'dev.db');
const MIGRATIONS_DIR = path.join(process.cwd(), 'data', 'migrations');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON');

const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
console.log(`[migrate] 找到 ${files.length} 个迁移文件`);

for (const file of files) {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
  console.log(`[migrate] 执行 ${file}`);
  try {
    db.exec(sql);
    console.log(`  ✓ 完成`);
  } catch (err) {
    console.error(`  ✗ 失败:`, err);
    process.exit(1);
  }
}

console.log('[migrate] ✓ 全部完成');
db.close();
