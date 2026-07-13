import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { getDatabase } from '../config/database'

const router = Router()

router.get('/qrcode', (_req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(2, 15)
  const qrcodeUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${process.env.WECHAT_APP_ID}&redirect_uri=http://localhost:5173/auth/callback&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`
  
  res.json({ qrcodeUrl, state })
})

router.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query
  
  if (!code) {
    return res.status(400).json({ error: 'Missing code' })
  }
  
  const openid = `test_openid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const db = await getDatabase()
  const existingClient = await db.get('SELECT * FROM clients WHERE openid = ?', [openid])
  
  let clientId = ''
  if (existingClient) {
    clientId = existingClient.id
  }
  
  const token = jwt.sign(
    { id: clientId, openid, role: 'client' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
  
  res.redirect(`http://localhost:5173/callback?token=${token}&openid=${openid}&hasProfile=${!!existingClient}`)
})

router.post('/client/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' })
  }
  
  const db = await getDatabase()
  const client = await db.get('SELECT * FROM clients WHERE username = ?', [username])
  
  if (!client) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  if (!client.password) {
    return res.status(401).json({ error: 'Account not set up for password login' })
  }
  
  const isPasswordValid = await bcrypt.compare(password, client.password)
  
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const token = jwt.sign(
    { id: client.id, openid: client.openid || '', role: 'client' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
  
  res.json({ 
    token, 
    role: 'client',
    hasProfile: true,
    status: client.status
  })
})

router.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { id: 'admin', role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )
    
    res.json({ token, role: 'admin' })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

export default router