import express from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/', (req, res) => {
  const { range = 'week' } = req.query

  if (range === 'today') {
    const stats = db.prepare(`
      SELECT 
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(SUM(exp_earned), 0) as total_exp,
        COUNT(DISTINCT task_id) as tasks_completed
      FROM study_sessions 
      WHERE user_id = ? AND date(started_at) = date('now')
    `).get(req.userId)

    return res.json({
      success: true,
      data: {
        study_history: [{ date: new Date().toISOString().split('T')[0], minutes: stats.total_minutes }],
        task_stats: { completed: stats.tasks_completed, total: stats.tasks_completed },
        total_minutes: stats.total_minutes,
      },
    })
  }

  const days = range === 'month' ? 30 : 7
  const dailyStats = db.prepare(`
    SELECT 
      date(started_at) as date,
      SUM(duration_minutes) as minutes
    FROM study_sessions 
    WHERE user_id = ? AND started_at >= datetime('now', '-${days} days')
    GROUP BY date(started_at)
    ORDER BY date(started_at)
  `).all(req.userId)

  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(duration_minutes), 0) as total_minutes,
      COUNT(DISTINCT task_id) as tasks_completed
    FROM study_sessions 
    WHERE user_id = ? AND started_at >= datetime('now', '-${days} days')
  `).get(req.userId)

  res.json({
    success: true,
    data: {
      study_history: dailyStats.map((d) => ({ date: d.date, minutes: d.minutes })),
      task_stats: { completed: totals.tasks_completed, total: totals.tasks_completed },
      total_minutes: totals.total_minutes,
    },
  })
})

router.post('/session', (req, res) => {
  const { minutes, task_id } = req.body
  const duration_minutes = minutes || 25

  const expEarned = Math.floor(duration_minutes / 30) * 50 + (duration_minutes >= 5 ? 10 : 0)

  const result = db.prepare(`
    INSERT INTO study_sessions (user_id, task_id, duration_minutes, exp_earned, started_at, ended_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(req.userId, task_id || null, duration_minutes, expEarned)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)
  const newExp = user.exp + expEarned

  let newLevel = user.level
  const levelThresholds = [500, 1500, 3500, 7000]
  for (let i = 0; i < levelThresholds.length; i++) {
    if (newExp < levelThresholds[i]) {
      newLevel = i + 1
      break
    }
    newLevel = 5
  }

  db.prepare('UPDATE users SET exp = ?, level = ? WHERE id = ?').run(newExp, newLevel, req.userId)

  res.json({
    success: true,
    data: {
      id: result.lastInsertRowid,
      duration_minutes,
      exp_earned: expEarned,
      newLevel,
      newExp,
    },
  })
})

router.get('/daily', (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  
  const stats = db.prepare(`
    SELECT 
      COALESCE(SUM(duration_minutes), 0) as total_minutes,
      COALESCE(SUM(exp_earned), 0) as total_exp,
      COUNT(DISTINCT task_id) as tasks_completed
    FROM study_sessions 
    WHERE user_id = ? AND date(started_at) = date('now')
  `).get(req.userId)
  
  // 计算连续天数
  const streakDays = calculateStreak(req.userId)
  
  res.json({ 
    success: true, 
    data: { 
      ...stats,
      streak_days: streakDays,
      date: today
    } 
  })
})

router.get('/weekly', (req, res) => {
  const dailyStats = db.prepare(`
    SELECT 
      date(started_at) as date,
      SUM(duration_minutes) as minutes,
      SUM(exp_earned) as exp
    FROM study_sessions 
    WHERE user_id = ? AND started_at >= datetime('now', '-7 days')
    GROUP BY date(started_at)
    ORDER BY date(started_at)
  `).all(req.userId)
  
  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(duration_minutes), 0) as total_minutes,
      COALESCE(SUM(exp_earned), 0) as total_exp,
      COUNT(DISTINCT task_id) as tasks_completed
    FROM study_sessions 
    WHERE user_id = ? AND started_at >= datetime('now', '-7 days')
  `).get(req.userId)
  
  res.json({ 
    success: true, 
    data: { 
      ...totals,
      daily_stats: dailyStats
    } 
  })
})

function calculateStreak(userId) {
  const sessions = db.prepare(`
    SELECT DISTINCT date(started_at) as study_date
    FROM study_sessions
    WHERE user_id = ?
    ORDER BY study_date DESC
  `).all(userId)
  
  if (sessions.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const session of sessions) {
    const sessionDate = new Date(session.study_date)
    sessionDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak || diffDays === streak + 1) {
      streak++
      currentDate = sessionDate
    } else {
      break
    }
  }
  
  return streak
}

export default router
