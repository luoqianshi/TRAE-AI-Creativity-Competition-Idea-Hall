import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: string
    openid: string
    role: string
  }
}

export function authenticateClient(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      openid: string
      role: string
    }
    
    if (decoded.role !== 'client') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    
    (req as AuthRequest).user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      role: string
    }
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    
    (req as AuthRequest).user = decoded as { id: string; openid: string; role: string }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}