import express from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { analyzeGoal, listTemplates } from '../lib/decompose.js'

const router = express.Router()

router.use(authMiddleware)

function buildSubtaskTree(flatSubtasks) {
  const nodes = flatSubtasks.map((s) => ({
    ...s,
    id: s.id,
    completed: !!s.completed,
    level: s.level || 1,
    parent_id: s.parent_id ?? null,
    sort_order: s.sort_order ?? 0,
    children: [],
  }))

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const roots = []

  for (const node of nodes) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id).children.push(node)
    } else if (node.level === 1 || !node.parent_id) {
      roots.push(node)
    }
  }

  const sortChildren = (list) => {
    list.sort((a, b) => a.sort_order - b.sort_order)
    list.forEach((item) => sortChildren(item.children))
  }
  sortChildren(roots)

  return roots
}

function persistPhases(taskId, phases) {
  db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(taskId)

  let sortOrder = 0
  for (const phase of phases) {
    const phaseRow = db.prepare(
      'INSERT INTO subtasks (task_id, title, level, parent_id, sort_order, completed) VALUES (?, ?, 1, NULL, ?, 0)'
    ).run(taskId, phase.title, sortOrder++)
    const phaseId = phaseRow.lastInsertRowid

    for (const group of phase.groups || []) {
      const groupRow = db.prepare(
        'INSERT INTO subtasks (task_id, title, level, parent_id, sort_order, completed) VALUES (?, ?, 2, ?, ?, 0)'
      ).run(taskId, group.title, phaseId, sortOrder++)
      const groupId = groupRow.lastInsertRowid

      for (const action of group.actions || []) {
        const title = typeof action === 'string' ? action : action.title
        db.prepare(
          'INSERT INTO subtasks (task_id, title, level, parent_id, sort_order, completed) VALUES (?, ?, 3, ?, ?, 0)'
        ).run(taskId, title, groupId, sortOrder++)
      }
    }
  }
}

function getTaskWithTree(taskId, userId) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId)
  if (!task) return null

  const subtasks = db.prepare(
    'SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC, id ASC'
  ).all(taskId)

  return {
    ...task,
    completed: !!task.completed,
    phases: buildSubtaskTree(subtasks),
    subtasks: subtasks.map((s) => ({ ...s, completed: !!s.completed })),
  }
}

router.get('/templates', (req, res) => {
  res.json({ success: true, data: listTemplates() })
})

router.post('/ai-decompose', (req, res) => {
  const { goal, clarifications, template_id, confirm, phases: clientPhases, template_name, total_actions } = req.body

  if (confirm && clientPhases?.length) {
    const taskResult = db.prepare(
      'INSERT INTO tasks (user_id, title, category, estimated_hours) VALUES (?, ?, ?, ?)'
    ).run(req.userId, goal, template_id || 'ai', total_actions || 0)

    persistPhases(taskResult.lastInsertRowid, clientPhases)
    return res.json({ success: true, data: getTaskWithTree(taskResult.lastInsertRowid, req.userId) })
  }

  const result = analyzeGoal(goal, clarifications || {}, template_id)

  if (result.error) {
    return res.status(400).json({ success: false, message: result.error })
  }

  if (result.needs_clarification) {
    return res.json({ success: true, data: result })
  }

  return res.json({ success: true, data: { preview: result.preview } })
})

router.get('/', (req, res) => {
  const tasks = db.prepare(`
    SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.userId)

  const tasksWithPhases = tasks.map((task) => getTaskWithTree(task.id, req.userId))
  res.json({ success: true, data: tasksWithPhases })
})

router.post('/', (req, res) => {
  const { title, category, estimated_hours, phases } = req.body

  const result = db.prepare(
    'INSERT INTO tasks (user_id, title, category, estimated_hours) VALUES (?, ?, ?, ?)'
  ).run(req.userId, title, category || 'general', estimated_hours || 0)

  const taskId = result.lastInsertRowid
  if (phases?.length) {
    persistPhases(taskId, phases)
  }

  res.json({ success: true, data: getTaskWithTree(taskId, req.userId) })
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const { title, completed, phases } = req.body

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId)
  if (!existing) {
    return res.status(404).json({ success: false, message: '任务不存在' })
  }

  if (title !== undefined) {
    db.prepare('UPDATE tasks SET title = ? WHERE id = ? AND user_id = ?').run(title, id, req.userId)
  }

  if (completed !== undefined) {
    db.prepare('UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?').run(completed ? 1 : 0, id, req.userId)
    if (completed) {
      db.prepare('UPDATE subtasks SET completed = 1 WHERE task_id = ?').run(id)
    }
  }

  if (phases !== undefined) {
    persistPhases(id, phases)
  }

  res.json({ success: true, data: getTaskWithTree(id, req.userId) })
})

router.put('/:id/subtasks/:subtaskId', (req, res) => {
  const { id, subtaskId } = req.params
  const { title, completed } = req.body

  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId)
  if (!task) {
    return res.status(404).json({ success: false, message: '任务不存在' })
  }

  if (title !== undefined) {
    db.prepare('UPDATE subtasks SET title = ? WHERE id = ? AND task_id = ?').run(title, subtaskId, id)
  }
  if (completed !== undefined) {
    db.prepare('UPDATE subtasks SET completed = ? WHERE id = ? AND task_id = ?').run(completed ? 1 : 0, subtaskId, id)
  }

  res.json({ success: true, data: getTaskWithTree(id, req.userId) })
})

router.post('/:id/subtasks', (req, res) => {
  const { id } = req.params
  const { title, level, parent_id } = req.body

  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId)
  if (!task) {
    return res.status(404).json({ success: false, message: '任务不存在' })
  }

  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM subtasks WHERE task_id = ?'
  ).get(id)

  db.prepare(
    'INSERT INTO subtasks (task_id, title, level, parent_id, sort_order, completed) VALUES (?, ?, ?, ?, ?, 0)'
  ).run(id, title, level || 3, parent_id || null, (maxOrder?.max_order || 0) + 1)

  res.json({ success: true, data: getTaskWithTree(id, req.userId) })
})

router.delete('/:id/subtasks/:subtaskId', (req, res) => {
  const { id, subtaskId } = req.params

  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId)
  if (!task) {
    return res.status(404).json({ success: false, message: '任务不存在' })
  }

  const descendants = [Number(subtaskId)]
  let i = 0
  while (i < descendants.length) {
    const children = db.prepare('SELECT id FROM subtasks WHERE parent_id = ? AND task_id = ?').all(descendants[i], id)
    children.forEach((c) => descendants.push(c.id))
    i++
  }

  for (const nodeId of descendants) {
    db.prepare('DELETE FROM subtasks WHERE id = ? AND task_id = ?').run(nodeId, id)
  }

  res.json({ success: true, data: getTaskWithTree(id, req.userId) })
})

router.put('/:id/reorder', (req, res) => {
  const { id } = req.params
  const { items } = req.body

  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId)
  if (!task) {
    return res.status(404).json({ success: false, message: '任务不存在' })
  }

  for (const item of items || []) {
    db.prepare(
      'UPDATE subtasks SET sort_order = ?, parent_id = ? WHERE id = ? AND task_id = ?'
    ).run(item.sort_order, item.parent_id ?? null, item.id, id)
  }

  res.json({ success: true, data: getTaskWithTree(id, req.userId) })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(id)
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, req.userId)
  res.json({ success: true })
})

router.post('/:id/complete', (req, res) => {
  const { id } = req.params

  db.prepare('UPDATE tasks SET completed = 1 WHERE id = ? AND user_id = ?').run(id, req.userId)
  db.prepare('UPDATE subtasks SET completed = 1 WHERE task_id = ?').run(id)

  const expReward = 100
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)
  const newExp = user.exp + expReward

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
      ...getTaskWithTree(id, req.userId),
      expEarned: expReward,
      newLevel,
    },
  })
})

export default router
