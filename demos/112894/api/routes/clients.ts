import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { getDatabase } from '../config/database'
import { authenticateClient, authenticateAdmin, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { openid, username, password, companyName, phone } = req.body
  
  if (!companyName || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  const db = await getDatabase()
  
  try {
    let existingClient = null
    
    if (openid) {
      existingClient = await db.get('SELECT * FROM clients WHERE openid = ?', [openid])
    } else if (username) {
      existingClient = await db.get('SELECT * FROM clients WHERE username = ?', [username])
    }
    
    if (existingClient) {
      const updateFields: string[] = ['company_name = ?', 'phone = ?']
      const updateValues: unknown[] = [companyName, phone]
      
      if (username) {
        updateFields.push('username = ?')
        updateValues.push(username)
      }
      
      if (password) {
        updateFields.push('password = ?')
        updateValues.push(await bcrypt.hash(password, 10))
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP')
      
      if (openid) {
        updateValues.push(openid)
        await db.run(
          `UPDATE clients SET ${updateFields.join(', ')} WHERE openid = ?`,
          updateValues
        )
      } else if (username) {
        updateValues.push(username)
        await db.run(
          `UPDATE clients SET ${updateFields.join(', ')} WHERE username = ?`,
          updateValues
        )
      }
      
      return res.json({ id: existingClient.id, status: existingClient.status })
    }
    
    const insertFields: string[] = ['company_name', 'phone']
    const insertValues: unknown[] = [companyName, phone]
    
    if (openid) {
      insertFields.push('openid')
      insertValues.push(openid)
    }
    
    if (username) {
      insertFields.push('username')
      insertValues.push(username)
    }
    
    if (password) {
      insertFields.push('password')
      insertValues.push(await bcrypt.hash(password, 10))
    }
    
    const result = await db.run(
      `INSERT INTO clients (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
      insertValues
    )
    
    res.json({ id: result.lastID, status: 'pending' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to register client' })
  }
})

router.post('/create', authenticateAdmin, async (req: Request, res: Response) => {
  const { username, password, companyName, phone } = req.body
  
  if (!username || !password || !companyName || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  const db = await getDatabase()
  
  try {
    const existingClient = await db.get('SELECT * FROM clients WHERE username = ?', [username])
    
    if (existingClient) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const result = await db.run(
      'INSERT INTO clients (username, password, company_name, phone, status) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, companyName, phone, 'approved']
    )
    
    res.json({ id: result.lastID, status: 'approved' })
  } catch (error) {
    console.error('Create client error:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
})

router.put('/:id/password', authenticateAdmin, async (req: Request, res: Response) => {
  const { id } = req.params
  const { password } = req.body
  
  if (!password) {
    return res.status(400).json({ error: 'Missing password' })
  }
  
  const db = await getDatabase()
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await db.run(
      'UPDATE clients SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    )
    
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
  const { status } = req.query as { status?: string }
  
  const db = await getDatabase()
  let query = 'SELECT id, username, company_name, phone, status, created_at, updated_at FROM clients ORDER BY created_at DESC'
  const params: unknown[] = []
  
  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }
  
  const clients = await db.all(query, params)
  res.json({ clients })
})

router.put('/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body as { status: 'approved' | 'rejected' }
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  
  const db = await getDatabase()
  
  try {
    await db.run(
      'UPDATE clients SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    )
    
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to update status' })
  }
})

router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  const { id } = req.params
  
  const db = await getDatabase()
  
  try {
    await db.run('DELETE FROM clients WHERE id = ?', [id])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete client' })
  }
})

router.get('/me', authenticateClient, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!
  
  const db = await getDatabase()
  
  let client = null
  if (user.openid) {
    client = await db.get('SELECT * FROM clients WHERE openid = ?', [user.openid])
  }
  
  if (!client && user.id) {
    client = await db.get('SELECT * FROM clients WHERE id = ?', [user.id])
  }
  
  if (!client) {
    return res.status(404).json({ error: 'Client not found' })
  }
  
  res.json({
    id: client.id,
    companyName: client.company_name,
    phone: client.phone,
    status: client.status,
    createdAt: client.created_at
  })
})

export default router