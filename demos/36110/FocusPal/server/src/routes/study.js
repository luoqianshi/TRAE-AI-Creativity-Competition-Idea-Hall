import express from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/sessions', (req, res) => {
  const sessions = db.prepare(`
    SELECT * FROM study_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 50
  `).all(req.userId)
  
  res.json({ success: true, data: sessions })
})

router.post('/sessions', (req, res) => {
  const { task_id, duration_minutes } = req.body
  
  const expEarned = Math.floor(duration_minutes / 30) * 50 + (duration_minutes >= 30 ? 20 : 0)
  
  const result = db.prepare(`
    INSERT INTO study_sessions (user_id, task_id, duration_minutes, exp_earned, started_at, ended_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(req.userId, task_id || null, duration_minutes, expEarned)
  
  // 更新用户经验
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
      task_id,
      duration_minutes,
      exp_earned: expEarned,
      newLevel,
      newExp
    } 
  })
})

router.post('/sessions/:id/heartbeat', (req, res) => {
  res.json({ success: true, data: { ok: true } })
})

export default router
