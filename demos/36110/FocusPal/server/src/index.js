import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { initDb } from './db/index.js'
import authRoutes from './routes/auth.js'
import tasksRoutes from './routes/tasks.js'
import aiRoutes from './routes/ai.js'
import studyRoutes from './routes/study.js'
import statsRoutes from './routes/stats.js'
import achievementsRoutes from './routes/achievements.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/study', studyRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/achievements', achievementsRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FocusPal API is running' })
})

// 拖延症分析
app.get('/api/analysis/procrastination', (req, res) => {
  const analysis = {
    procrastination_times: ['下午 2-4 点', '晚上 9点后'],
    difficult_task_types: ['需要深度思考的任务', '长时间持续性任务'],
    peak_efficiency_time: '上午 9-11 点',
    suggestions: [
      '建议在上午优先处理复杂任务',
      '下午可以安排一些轻松的工作',
      '注意休息，每45分钟休息5-10分钟'
    ]
  }
  
  res.json({ success: true, data: analysis })
})

// 初始化数据库后启动服务器
async function startServer() {
  try {
    await initDb()
    console.log('Database initialized')
    
    app.listen(PORT, () => {
      console.log(`FocusPal API server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
