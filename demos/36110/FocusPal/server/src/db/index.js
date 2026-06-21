import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '../../data.db')

let db

async function initDb() {
  const SQL = await initSqlJs()
  
  // 尝试读取已存在的数据库
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      estimated_hours INTEGER,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      estimated_hours INTEGER,
      completed INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      parent_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `)

  migrateSubtasksColumns()
  
  db.run(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_id INTEGER,
      duration_minutes INTEGER NOT NULL,
      exp_earned INTEGER NOT NULL,
      started_at DATETIME,
      ended_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      exp_reward INTEGER DEFAULT 0
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id),
      UNIQUE(user_id, achievement_id)
    )
  `)

  // 初始化成就数据
  const result = db.exec('SELECT COUNT(*) as count FROM achievements')
  const count = result.length > 0 ? result[0].values[0][0] : 0
  
  if (count === 0) {
    db.run("INSERT INTO achievements (code, name, description, icon, exp_reward) VALUES ('first_study', '首次学习', '完成第一次学习', 'book', 50)")
    db.run("INSERT INTO achievements (code, name, description, icon, exp_reward) VALUES ('seven_days', '连续7天打卡', '连续学习7天', 'fire', 200)")
    db.run("INSERT INTO achievements (code, name, description, icon, exp_reward) VALUES ('fifty_hours', '学习50小时', '累计学习满50小时', 'clock', 500)")
    db.run("INSERT INTO achievements (code, name, description, icon, exp_reward) VALUES ('first_task', '首个任务', '完成第一个任务', 'check', 100)")
    db.run("INSERT INTO achievements (code, name, description, icon, exp_reward) VALUES ('level_5', '卷王之王', '达到Lv5等级', 'crown', 1000)")
  }
  
  saveDb()
  return db
}

function migrateSubtasksColumns() {
  const columns = [
    'level INTEGER DEFAULT 1',
    'parent_id INTEGER',
    'sort_order INTEGER DEFAULT 0',
  ]
  for (const col of columns) {
    try {
      db.run(`ALTER TABLE subtasks ADD COLUMN ${col}`)
    } catch {
      // column already exists
    }
  }
}

function saveDb() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

// 数据库操作辅助函数
const dbHelper = {
  prepare(sql) {
    return {
      run(...params) {
        db.run(sql, params)
        saveDb()
        return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0].values[0][0] }
      },
      get(...params) {
        const stmt = db.prepare(sql)
        stmt.bind(params)
        if (stmt.step()) {
          const row = stmt.getAsObject()
          stmt.free()
          return row
        }
        stmt.free()
        return null
      },
      all(...params) {
        const result = db.exec(sql, params)
        if (result.length === 0) return []
        const columns = result[0].columns
        return result[0].values.map(row => {
          const obj = {}
          columns.forEach((col, i) => obj[col] = row[i])
          return obj
        })
      }
    }
  },
  exec(sql) {
    db.run(sql)
    saveDb()
  }
}

// 导出初始化函数和数据库访问接口
export default dbHelper
export { initDb }
