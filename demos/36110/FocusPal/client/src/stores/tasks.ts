import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

const API = 'http://localhost:3000'

export interface TaskNode {
  id: number
  title: string
  completed: boolean
  level: number
  parent_id: number | null
  sort_order: number
  children: TaskNode[]
}

export interface TaskPhase {
  title: string
  groups: TaskGroup[]
}

export interface TaskGroup {
  title: string
  actions: Array<{ title: string } | string>
}

export interface DecomposePreview {
  title: string
  template_id: string
  template_name: string
  phases: TaskPhase[]
  total_actions: number
}

export interface TaskTemplate {
  id: string
  name: string
  icon: string
  keywords: string[]
}

export interface Task {
  id: number
  title: string
  completed: boolean
  phases: TaskNode[]
  subtasks: TaskNode[]
  category?: string
  created_at: string
}

function authHeaders() {
  const authStore = useAuthStore()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authStore.token}`,
  }
}

function phasesToPayload(phases: TaskNode[]): TaskPhase[] {
  return phases.map((phase) => ({
    title: phase.title,
    groups: (phase.children || []).map((group) => ({
      title: group.title,
      actions: (group.children || []).map((action) => ({ title: action.title })),
    })),
  }))
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const templates = ref<TaskTemplate[]>([])
  const loading = ref(false)

  async function fetchTasks() {
    loading.value = true
    try {
      const response = await fetch(`${API}/api/tasks`, { headers: authHeaders() })
      const data = await response.json()
      if (data.success) tasks.value = data.data
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchTemplates() {
    try {
      const response = await fetch(`${API}/api/tasks/templates`, { headers: authHeaders() })
      const data = await response.json()
      if (data.success) templates.value = data.data
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  async function decomposeGoal(options: {
    goal: string
    template_id?: string
    clarifications?: Record<string, string>
    confirm?: boolean
  }) {
    const response = await fetch(`${API}/api/tasks/ai-decompose`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(options),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || '分解失败')
    return data.data
  }

  async function confirmDecompose(preview: DecomposePreview) {
    const response = await fetch(`${API}/api/tasks/ai-decompose`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        goal: preview.title,
        template_id: preview.template_id,
        template_name: preview.template_name,
        total_actions: preview.total_actions,
        phases: preview.phases,
        confirm: true,
      }),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || '保存失败')
    if (data.data?.id) tasks.value.unshift(data.data)
    return data.data
  }

  async function createTask(task: { title: string; phases?: TaskPhase[] }) {
    const response = await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(task),
    })
    const data = await response.json()
    if (data.success) {
      tasks.value.unshift(data.data)
      return data.data
    }
    throw new Error(data.message)
  }

  async function updateTask(taskId: number, updates: Partial<Task> & { phases?: TaskPhase[] }) {
    const response = await fetch(`${API}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    })
    const data = await response.json()
    if (data.success) {
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) tasks.value[index] = data.data
      return data.data
    }
    throw new Error(data.message)
  }

  async function completeTask(taskId: number) {
    const response = await fetch(`${API}/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: authHeaders(),
    })
    const data = await response.json()
    if (data.success) {
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) tasks.value[index] = data.data
      return data.data
    }
    throw new Error(data.message)
  }

  async function deleteTask(taskId: number) {
    const response = await fetch(`${API}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    const data = await response.json()
    if (data.success) {
      tasks.value = tasks.value.filter((t) => t.id !== taskId)
    } else {
      throw new Error(data.message)
    }
  }

  async function toggleNode(taskId: number, nodeId: number, completed: boolean) {
    const response = await fetch(`${API}/api/tasks/${taskId}/subtasks/${nodeId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ completed }),
    })
    const data = await response.json()
    if (data.success) {
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) tasks.value[index] = data.data
    }
  }

  async function updateNodeTitle(taskId: number, nodeId: number, title: string) {
    const response = await fetch(`${API}/api/tasks/${taskId}/subtasks/${nodeId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ title }),
    })
    const data = await response.json()
    if (data.success) {
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) tasks.value[index] = data.data
    }
  }

  async function addNode(
    taskId: number,
    payload: { title: string; level: number; parent_id: number | null }
  ) {
    const response = await fetch(`${API}/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (data.success) {
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) tasks.value[index] = data.data
    }
  }

  async function deleteNode(taskId: number, nodeId: number) {
    const response = await fetch(`${API}/api/tasks/${taskId}/subtasks/${nodeId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    const data = await response.json()
    if (data.success) {
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) tasks.value[index] = data.data
    }
  }

  async function savePhases(taskId: number, phases: TaskNode[]) {
    return updateTask(taskId, { phases: phasesToPayload(phases) })
  }

  function countNodes(phases: TaskNode[]) {
    let total = 0
    let done = 0
    const walk = (nodes: TaskNode[]) => {
      for (const n of nodes) {
        total++
        if (n.completed) done++
        if (n.children?.length) walk(n.children)
      }
    }
    walk(phases)
    return { total, done }
  }

  return {
    tasks,
    templates,
    loading,
    fetchTasks,
    fetchTemplates,
    decomposeGoal,
    confirmDecompose,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    toggleNode,
    updateNodeTitle,
    addNode,
    deleteNode,
    savePhases,
    countNodes,
  }
})
