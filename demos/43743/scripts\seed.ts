// 种子数据导入：6 个经典故事 + demo 家长
// 运行：npm run db:seed
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'dev.db');
const SEED_FILE = path.join(process.cwd(), 'data', 'seed', 'stories.json');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON');

interface SeedStory {
  id: string;
  title: string;
  theme: string;
  ageGroup: string;
  durationSeconds: number;
  fullText: string;
}

const stories: SeedStory[] = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));

// 1. 创建/更新 demo profile
const DEMO_EMAIL = 'demo@fantasy.local';
const DEMO_PASSWORD = 'demo1234';
const DEMO_PROFILE_ID = 'demo-profile-0001';

const existing = db.prepare('SELECT id FROM profiles WHERE id = :id').get({ id: DEMO_PROFILE_ID });
if (!existing) {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  db.prepare(
    'INSERT INTO profiles (id, email, password_hash) VALUES (:id, :email, :hash)'
  ).run({ id: DEMO_PROFILE_ID, email: DEMO_EMAIL, hash });
  console.log(`[seed] 创建 demo 家长: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
} else {
  console.log(`[seed] demo 家长已存在`);
}

// 2. 创建 demo child "小柚"
const DEMO_CHILD_ID = 'demo-child-0001';
const childExists = db.prepare('SELECT id FROM children WHERE id = :id').get({ id: DEMO_CHILD_ID });
if (!childExists) {
  db.prepare(
    `INSERT INTO children (id, profile_id, nickname, age_group, avatar_emoji, favorite_themes)
     VALUES (:id, :pid, :nick, :age, :emoji, :themes)`
  ).run({
    id: DEMO_CHILD_ID,
    pid: DEMO_PROFILE_ID,
    nick: '小柚',
    age: '3-4',
    emoji: '🐰',
    themes: JSON.stringify(['animal', 'space', 'car']),
  });
  // 同步 settings
  const pinHash = bcrypt.hashSync('0000', 10);
  db.prepare(
    `INSERT INTO settings (id, child_id, daily_limit_minutes, auto_close_minutes, pin_hash, is_auto_play)
     VALUES (:id, :cid, 30, 0, :ph, 1)`
  ).run({ id: uuid(), cid: DEMO_CHILD_ID, ph: pinHash });
  console.log(`[seed] 创建 demo 孩子: 小柚 (3-4 岁)`);
} else {
  console.log(`[seed] demo 孩子已存在`);
}

// 3. 导入 6 个 seed stories（用特殊 child_id = '__public__' 表示公共）
const PUBLIC_CHILD = '__public__';
// 公共 child 走特殊处理：直接关闭外键检查
db.exec('PRAGMA foreign_keys = OFF');
const insertStmt = db.prepare(
  `INSERT OR IGNORE INTO stories
   (id, child_id, title, theme, full_text, audio_url, duration_seconds, is_seed)
   VALUES (:id, :cid, :title, :theme, :text, NULL, :dur, 1)`
);
let inserted = 0;
for (const s of stories) {
  const exists = db.prepare('SELECT id FROM stories WHERE id = :id').get({ id: s.id });
  if (exists) continue;
  insertStmt.run({
    id: s.id,
    cid: PUBLIC_CHILD,
    title: s.title,
    theme: s.theme,
    text: s.fullText,
    dur: s.durationSeconds,
  });
  inserted += 1;
}
db.exec('PRAGMA foreign_keys = ON');
console.log(`[seed] 导入 ${inserted} 个 seed 故事`);

console.log('\n[seed] ✓ 完成。你可以登录：');
console.log(`       邮箱: ${DEMO_EMAIL}`);
console.log(`       密码: ${DEMO_PASSWORD}`);
console.log('       默认 PIN: 0000');

db.close();
