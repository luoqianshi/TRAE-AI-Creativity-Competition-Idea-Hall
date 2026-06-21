import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'focuspal-secret-key-2024'

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权访问' })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token 无效或已过期' })
  }
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}
