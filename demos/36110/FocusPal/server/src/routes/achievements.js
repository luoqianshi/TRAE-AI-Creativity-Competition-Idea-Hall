import express from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/', (req, res) => {
  const achievements = db.prepare('SELECT * FROM achievements').all()
  
  const userAchievements = db.prepare(`
    SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?
  `).all(req.userId)
  
  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievement_id, ua.unlocked_at])
  )
  
  const achievementsWithStatus = achievements.map(a => ({
    ...a,
    unlocked: userAchievementMap.has(a.id),
    unlocked_at: userAchievementMap.get(a.id) || null
  }))
  
  res.json({ success: true, data: achievementsWithStatus })
})

router.post('/:id/unlock', (req, res) => {
  const { id } = req.params
  
  const existing = db.prepare(`
    SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?
  `).get(req.userId, id)
  
  if (existing) {
    return res.status(400).json({ success: false, message: '已解锁' })
  }
  
  const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(id)
  if (!achievement) {
    return res.status(404).json({ success: false, message: '成就不存在' })
  }
  
  db.prepare(`
    INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)
  `).run(req.userId, id)
  
  // 给用户增加经验
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)
  const newExp = user.exp + achievement.exp_reward
  
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
      achievement,
      exp_earned: achievement.exp_reward,
      newLevel,
      newExp
    } 
  })
})

export default router
