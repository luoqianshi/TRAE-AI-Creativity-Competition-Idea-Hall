import express from 'express'
import bcrypt from 'bcryptjs'
import db from '../db/index.js'
import { authMiddleware, generateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body
    
    if (!email || !password || !nickname) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' })
    }
    
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existingUser) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' })
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)'
    ).run(email, passwordHash, nickname)
    
    const token = generateToken(result.lastInsertRowid)
    const user = {
      id: result.lastInsertRowid,
      email,
      nickname,
      level: 1,
      exp: 0
    }
    
    res.json({ success: true, data: { token, user } })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' })
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' })
    }
    
    const token = generateToken(user.id)
    const userData = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      level: user.level,
      exp: user.exp
    }
    
    res.json({ success: true, data: { token, user: userData } })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.get('/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, nickname, level, exp, created_at FROM users WHERE id = ?').get(req.userId)
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }
  res.json({ success: true, data: user })
})

router.put('/profile', authMiddleware, (req, res) => {
  const { nickname } = req.body
  db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, req.userId)
  const user = db.prepare('SELECT id, email, nickname, level, exp FROM users WHERE id = ?').get(req.userId)
  res.json({ success: true, data: user })
})

export default router
