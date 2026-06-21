import express from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware)

// AI 目标拆解
router.post('/decompose', (req, res) => {
  const { goal } = req.body
  
  // 简化的AI拆解逻辑（实际项目中可接入AI API）
  const templates = {
    '项目': [
      { title: '需求分析', estimated_hours: 4 },
      { title: '技术选型', estimated_hours: 2 },
      { title: '系统设计', estimated_hours: 6 },
      { title: '编码开发', estimated_hours: 20 },
      { title: '测试优化', estimated_hours: 6 },
      { title: '部署上线', estimated_hours: 2 }
    ],
    '考试': [
      { title: '知识梳理', estimated_hours: 8 },
      { title: '重点复习', estimated_hours: 12 },
      { title: '刷题练习', estimated_hours: 10 },
      { title: '模拟考试', estimated_hours: 4 },
      { title: '查漏补缺', estimated_hours: 6 }
    ],
    'default': [
      { title: '资料收集', estimated_hours: 3 },
      { title: '学习计划制定', estimated_hours: 2 },
      { title: '基础知识学习', estimated_hours: 8 },
      { title: '进阶内容学习', estimated_hours: 10 },
      { title: '实践应用', estimated_hours: 6 },
      { title: '总结回顾', estimated_hours: 3 }
    ]
  }
  
  let subtasks = templates.default
  const goalLower = goal.toLowerCase()
  
  if (goalLower.includes('项目') || goalLower.includes('开发')) {
    subtasks = templates['项目']
  } else if (goalLower.includes('考试') || goalLower.includes('考研') || goalLower.includes('四级') || goalLower.includes('六级')) {
    subtasks = templates['考试']
  }
  
  const total_hours = subtasks.reduce((sum, t) => sum + t.estimated_hours, 0)
  
  res.json({ 
    success: true, 
    data: { 
      subtasks,
      total_hours,
      original_goal: goal
    } 
  })
})

// AI 学习助手
router.post('/chat', (req, res) => {
  const { message } = req.body
  
  // 简化的AI回复逻辑（实际项目中可接入AI API）
  const responses = {
    'vue': 'Vue 组件通信有多种方式：\n1. Props/Emit：父子组件通信\n2. Pinia/Vuex：全局状态管理\n3. Provide/Inject：跨级组件通信\n4. Event Bus：任意组件通信\n\n你想了解哪种方式的详细实现？',
    'javascript': 'JavaScript 闭包是指一个函数能够访问其词法作用域外部的变量。\n\n基本示例：\n```javascript\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  }\n}\n```\n\n闭包常用于：\n- 数据私有化\n- 函数工厂\n- 缓存计算结果',
    'react': 'React Hooks 是 React 16.8 引入的新特性：\n\n常用 Hooks：\n- useState：管理组件状态\n- useEffect：处理副作用\n- useContext：跨组件传值\n- useReducer：复杂状态管理\n- useMemo/useCallback：性能优化',
    'default': '这是一个很好的问题！让我来帮你解答。\n\n建议：\n1. 先理清问题的核心要点\n2. 查阅官方文档或优质教程\n3. 动手实践，加深理解\n4. 总结归纳，形成自己的知识体系\n\n如果你有具体的技术问题，可以详细描述一下，我来帮你分析！'
  }
  
  let reply = responses.default
  const msgLower = message.toLowerCase()
  
  if (msgLower.includes('vue')) reply = responses['vue']
  else if (msgLower.includes('javascript') || msgLower.includes('闭包') || msgLower.includes('js')) reply = responses['javascript']
  else if (msgLower.includes('react')) reply = responses['react']
  
  res.json({ success: true, data: { reply } })
})

export default router
