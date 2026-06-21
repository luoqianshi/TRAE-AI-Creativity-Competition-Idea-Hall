<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTaskStore, type DecomposePreview, type TaskNode } from '../stores/tasks'
import {
  Plus, Trash2, ChevronDown, ChevronUp, Sparkles,
  CheckCircle, Circle, Loader2, GripVertical, Edit3, X, Save
} from 'lucide-vue-next'

const taskStore = useTaskStore()

const aiInput = ref('')
const aiLoading = ref(false)
const selectedTemplate = ref<string | null>(null)
const expandedTasks = ref<Set<number>>(new Set())
const expandedPhases = ref<Set<string>>(new Set())

const showClarify = ref(false)
const clarifyQuestions = ref<Array<{ id: string; text: string; options: string[] }>>([])
const clarifyAnswers = ref<Record<string, string>>({})

const showPreview = ref(false)
const previewData = ref<DecomposePreview | null>(null)
const editingPreview = ref(false)

const dragItem = ref<{ taskId: number; nodeId: number; parentId: number | null } | null>(null)

const groupedTasks = computed(() => ({
  pending: taskStore.tasks.filter((t) => !t.completed),
  completed: taskStore.tasks.filter((t) => t.completed),
}))

function toggleExpand(taskId: number) {
  expandedTasks.value.has(taskId)
    ? expandedTasks.value.delete(taskId)
    : expandedTasks.value.add(taskId)
}

function togglePhase(key: string) {
  expandedPhases.value.has(key)
    ? expandedPhases.value.delete(key)
    : expandedPhases.value.add(key)
}

function levelLabel(level: number) {
  return { 1: '阶段', 2: '任务组', 3: '每日行动' }[level] || ''
}

function levelColor(level: number) {
  return { 1: '#6366f1', 2: '#22d3ee', 3: '#10b981' }[level] || '#94a3b8'
}

async function handleAIDecompose() {
  if (!aiInput.value.trim()) return
  aiLoading.value = true
  try {
    const result = await taskStore.decomposeGoal({
      goal: aiInput.value,
      template_id: selectedTemplate.value || undefined,
    })
    if (result.needs_clarification) {
      clarifyQuestions.value = result.questions
      clarifyAnswers.value = {}
      showClarify.value = true
    } else if (result.preview) {
      previewData.value = JSON.parse(JSON.stringify(result.preview))
      showPreview.value = true
    }
  } catch {
    alert('AI 分解失败，请稍后重试')
  } finally {
    aiLoading.value = false
  }
}

async function handleClarifySubmit() {
  showClarify.value = false
  aiLoading.value = true
  try {
    const result = await taskStore.decomposeGoal({
      goal: aiInput.value,
      clarifications: clarifyAnswers.value,
      template_id: selectedTemplate.value || undefined,
    })
    if (result.preview) {
      previewData.value = JSON.parse(JSON.stringify(result.preview))
      showPreview.value = true
    }
  } catch {
    alert('AI 分解失败')
  } finally {
    aiLoading.value = false
  }
}

async function handleConfirmPreview() {
  if (!previewData.value) return
  aiLoading.value = true
  try {
    await taskStore.confirmDecompose(previewData.value)
    showPreview.value = false
    previewData.value = null
    aiInput.value = ''
    clarifyAnswers.value = {}
    selectedTemplate.value = null
  } catch {
    alert('保存任务失败')
  } finally {
    aiLoading.value = false
  }
}

async function handleUseTemplate(templateId: string) {
  selectedTemplate.value = selectedTemplate.value === templateId ? null : templateId
  if (!aiInput.value.trim()) {
    const t = taskStore.templates.find((x) => x.id === templateId)
    if (t) aiInput.value = t.name
  }
}

async function handleToggleComplete(task: { id: number; completed: boolean }) {
  try {
    if (!task.completed) {
      await taskStore.completeTask(task.id)
    } else {
      await taskStore.updateTask(task.id, { completed: false })
    }
  } catch {
    alert('更新任务失败')
  }
}

async function handleToggleNode(taskId: number, node: TaskNode) {
  await taskStore.toggleNode(taskId, node.id, !node.completed)
}

async function handleDeleteTask(taskId: number) {
  if (!confirm('确定删除此任务及全部拆解内容？')) return
  await taskStore.deleteTask(taskId)
}

async function handleDeleteNode(taskId: number, nodeId: number) {
  if (!confirm('确定删除此项及其子项？')) return
  await taskStore.deleteNode(taskId, nodeId)
}

async function handleAddAction(taskId: number, groupId: number) {
  const title = prompt('输入每日行动：')
  if (!title?.trim()) return
  await taskStore.addNode(taskId, { title: title.trim(), level: 3, parent_id: groupId })
}

async function handleEditNode(taskId: number, node: TaskNode) {
  const title = prompt('编辑标题：', node.title)
  if (title?.trim() && title !== node.title) {
    await taskStore.updateNodeTitle(taskId, node.id, title.trim())
  }
}

function onDragStart(taskId: number, node: TaskNode) {
  dragItem.value = { taskId, nodeId: node.id, parentId: node.parent_id }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

async function onDrop(taskId: number, targetNode: TaskNode) {
  if (!dragItem.value || dragItem.value.taskId !== taskId) return
  if (dragItem.value.parentId !== targetNode.parent_id) return
  if (dragItem.value.nodeId === targetNode.id) return

  const task = taskStore.tasks.find((t) => t.id === taskId)
  if (!task) return

  const siblings = findSiblings(task.phases, targetNode.parent_id)
  const fromIdx = siblings.findIndex((n) => n.id === dragItem.value!.nodeId)
  const toIdx = siblings.findIndex((n) => n.id === targetNode.id)
  if (fromIdx < 0 || toIdx < 0) return

  const [moved] = siblings.splice(fromIdx, 1)
  siblings.splice(toIdx, 0, moved)
  siblings.forEach((n, i) => { n.sort_order = i })

  await taskStore.savePhases(taskId, task.phases)
  dragItem.value = null
}

function findSiblings(phases: TaskNode[], parentId: number | null): TaskNode[] {
  if (parentId === null) return phases
  const walk = (nodes: TaskNode[]): TaskNode[] | null => {
    for (const n of nodes) {
      if (n.id === parentId) return n.children
      const found = walk(n.children || [])
      if (found) return found
    }
    return null
  }
  return walk(phases) || []
}

function taskProgress(task: { phases: TaskNode[] }) {
  return taskStore.countNodes(task.phases || [])
}

onMounted(() => {
  taskStore.fetchTasks()
  taskStore.fetchTemplates()
})
</script>

<template>
  <div class="tasks-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">学习任务</h1>
        <p class="page-subtitle">三级拆解：阶段 → 任务组 → 每日行动</p>
      </div>
    </div>

    <div class="ai-decompose-card">
      <div class="ai-header">
        <Sparkles :size="20" class="ai-icon" />
        <span>AI 目标拆解</span>
      </div>
      <p class="ai-description">
        输入学习目标或选择预设模板，AI 将拆解为三级任务体系。目标模糊时会智能追问，结果支持编辑调整。
      </p>

      <div class="template-row">
        <button
          v-for="tpl in taskStore.templates"
          :key="tpl.id"
          class="template-chip"
          :class="{ active: selectedTemplate === tpl.id }"
          @click="handleUseTemplate(tpl.id)"
        >
          <span>{{ tpl.icon }}</span>
          <span>{{ tpl.name }}</span>
        </button>
      </div>

      <div class="ai-input-group">
        <input
          v-model="aiInput"
          placeholder="例如：考研英语 / 提升英语 / 学习 Vue 开发..."
          @keyup.enter="handleAIDecompose"
        />
        <button class="btn-ai" @click="handleAIDecompose" :disabled="aiLoading || !aiInput.trim()">
          <Loader2 v-if="aiLoading" :size="18" class="spin" />
          <Sparkles v-else :size="18" />
          <span>{{ aiLoading ? '分解中...' : '智能分解' }}</span>
        </button>
      </div>
    </div>

    <div class="tasks-section">
      <h2 class="section-title">进行中 ({{ groupedTasks.pending.length }})</h2>
      <div class="task-list">
        <div v-if="groupedTasks.pending.length === 0" class="empty-state">
          <p>暂无进行中的任务，试试 AI 智能分解你的学习目标</p>
        </div>

        <div v-for="task in groupedTasks.pending" :key="task.id" class="task-card">
          <div class="task-main" @click="toggleExpand(task.id)">
            <button class="task-check" @click.stop="handleToggleComplete(task)">
              <Circle :size="20" />
            </button>
            <div class="task-content">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-meta">
                <span class="level-badge">三级拆解</span>
                {{ taskProgress(task).done }}/{{ taskProgress(task).total }} 项完成
                <ChevronDown v-if="!expandedTasks.has(task.id)" :size="16" />
                <ChevronUp v-else :size="16" />
              </span>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: taskProgress(task).total
                      ? `${(taskProgress(task).done / taskProgress(task).total) * 100}%`
                      : '0%',
                  }"
                />
              </div>
            </div>
            <button class="task-delete" @click.stop="handleDeleteTask(task.id)">
              <Trash2 :size="18" />
            </button>
          </div>

          <div v-if="expandedTasks.has(task.id)" class="hierarchy">
            <div v-for="phase in task.phases" :key="phase.id" class="phase-block">
              <div class="node-row level-1" @click.stop="togglePhase(`${task.id}-${phase.id}`)">
                <span class="level-tag" :style="{ background: levelColor(1) }">阶段</span>
                <CheckCircle
                  v-if="phase.completed" :size="16" class="check-icon completed"
                  @click.stop="handleToggleNode(task.id, phase)"
                />
                <Circle v-else :size="16" class="check-icon" @click.stop="handleToggleNode(task.id, phase)" />
                <span class="node-title" :class="{ completed: phase.completed }">{{ phase.title }}</span>
                <button class="icon-btn" @click.stop="handleEditNode(task.id, phase)"><Edit3 :size="14" /></button>
                <ChevronDown v-if="!expandedPhases.has(`${task.id}-${phase.id}`)" :size="14" />
                <ChevronUp v-else :size="14" />
              </div>

              <div v-if="expandedPhases.has(`${task.id}-${phase.id}`)" class="phase-children">
                <div v-for="group in phase.children" :key="group.id" class="group-block">
                  <div class="node-row level-2">
                    <span class="level-tag" :style="{ background: levelColor(2) }">任务组</span>
                    <CheckCircle
                      v-if="group.completed" :size="16" class="check-icon completed"
                      @click.stop="handleToggleNode(task.id, group)"
                    />
                    <Circle v-else :size="16" class="check-icon" @click.stop="handleToggleNode(task.id, group)" />
                    <span class="node-title" :class="{ completed: group.completed }">{{ group.title }}</span>
                    <button class="icon-btn" @click.stop="handleEditNode(task.id, group)"><Edit3 :size="14" /></button>
                    <button class="icon-btn danger" @click.stop="handleDeleteNode(task.id, group.id)"><Trash2 :size="14" /></button>
                  </div>

                  <div class="action-list">
                    <div
                      v-for="action in group.children"
                      :key="action.id"
                      class="node-row level-3"
                      draggable="true"
                      @dragstart="onDragStart(task.id, action)"
                      @dragover="onDragOver"
                      @drop="onDrop(task.id, action)"
                    >
                      <GripVertical :size="14" class="drag-handle" />
                      <span class="level-tag" :style="{ background: levelColor(3) }">行动</span>
                      <CheckCircle
                        v-if="action.completed" :size="16" class="check-icon completed"
                        @click.stop="handleToggleNode(task.id, action)"
                      />
                      <Circle v-else :size="16" class="check-icon" @click.stop="handleToggleNode(task.id, action)" />
                      <span class="node-title" :class="{ completed: action.completed }">{{ action.title }}</span>
                      <button class="icon-btn" @click.stop="handleEditNode(task.id, action)"><Edit3 :size="14" /></button>
                      <button class="icon-btn danger" @click.stop="handleDeleteNode(task.id, action.id)"><Trash2 :size="14" /></button>
                    </div>
                    <button class="add-action-btn" @click="handleAddAction(task.id, group.id)">
                      <Plus :size="14" /> 添加每日行动
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="groupedTasks.completed.length > 0" class="tasks-section">
      <h2 class="section-title completed-title">已完成 ({{ groupedTasks.completed.length }})</h2>
      <div class="task-list">
        <div v-for="task in groupedTasks.completed" :key="task.id" class="task-card completed">
          <div class="task-main">
            <button class="task-check" @click.stop="handleToggleComplete(task)">
              <CheckCircle :size="20" class="completed" />
            </button>
            <div class="task-content">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-meta">{{ taskProgress(task).total }} 项已全部完成</span>
            </div>
            <button class="task-delete" @click.stop="handleDeleteTask(task.id)">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能追问 -->
    <div v-if="showClarify" class="modal-overlay" @click.self="showClarify = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>AI 智能追问</h3>
          <button @click="showClarify = false"><X :size="18" /></button>
        </div>
        <p class="modal-desc">目标有点模糊，回答以下问题以获得更精准的拆解：</p>
        <div v-for="q in clarifyQuestions" :key="q.id" class="clarify-block">
          <p class="clarify-q">{{ q.text }}</p>
          <div class="clarify-options">
            <button
              v-for="opt in q.options"
              :key="opt"
              class="option-btn"
              :class="{ active: clarifyAnswers[q.id] === opt }"
              @click="clarifyAnswers[q.id] = opt"
            >
              {{ opt }}
            </button>
          </div>
        </div>
        <button
          class="btn-ai full"
          :disabled="clarifyQuestions.some((q) => !clarifyAnswers[q.id])"
          @click="handleClarifySubmit"
        >
          继续拆解
        </button>
      </div>
    </div>

    <!-- 预览确认 -->
    <div v-if="showPreview && previewData" class="modal-overlay" @click.self="showPreview = false">
      <div class="modal-card wide">
        <div class="modal-header">
          <h3>拆解预览 · {{ previewData.template_name }}</h3>
          <button @click="showPreview = false"><X :size="18" /></button>
        </div>
        <p class="modal-desc">
          共 {{ previewData.total_actions }} 项每日行动，确认后可继续编辑、拖拽调整
        </p>
        <div class="preview-tree">
          <div v-for="(phase, pi) in previewData.phases" :key="pi" class="preview-phase">
            <div class="preview-level-1">
              <span class="level-tag" :style="{ background: levelColor(1) }">阶段</span>
              {{ phase.title }}
            </div>
            <div v-for="(group, gi) in phase.groups" :key="gi" class="preview-group">
              <div class="preview-level-2">
                <span class="level-tag" :style="{ background: levelColor(2) }">任务组</span>
                {{ group.title }}
              </div>
              <div v-for="(action, ai) in group.actions" :key="ai" class="preview-action">
                <span class="level-tag" :style="{ background: levelColor(3) }">行动</span>
                {{ typeof action === 'string' ? action : action.title }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showPreview = false">取消</button>
          <button class="btn-ai" :disabled="aiLoading" @click="handleConfirmPreview">
            <Save :size="16" />
            {{ aiLoading ? '保存中...' : '确认创建任务' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tasks-page { max-width: 960px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Orbitron', sans-serif; font-size: 28px; color: var(--text-primary); }
.page-subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }

.ai-decompose-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}
.ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.ai-icon { color: #fbbf24; }
.ai-header span { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 600; }
.ai-description { color: var(--text-muted); font-size: 14px; margin-bottom: 16px; line-height: 1.6; }

.template-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.template-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 20px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  color: var(--text-secondary); cursor: pointer; font-size: 13px; transition: all 0.2s;
}
.template-chip.active, .template-chip:hover {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.15);
  color: var(--text-primary);
}

.ai-input-group { display: flex; gap: 12px; }
.ai-input-group input {
  flex: 1; padding: 14px 16px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 10px; color: var(--text-primary); font-size: 15px;
}
.ai-input-group input:focus { outline: none; border-color: var(--accent-primary); }

.btn-ai {
  display: flex; align-items: center; gap: 8px; padding: 14px 20px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border: none; border-radius: 10px; color: white; font-size: 14px;
  font-weight: 500; cursor: pointer; white-space: nowrap;
}
.btn-ai.full { width: 100%; justify-content: center; margin-top: 16px; }
.btn-ai:disabled { opacity: 0.6; cursor: not-allowed; }

.tasks-section { margin-bottom: 32px; }
.section-title { font-family: 'Orbitron', sans-serif; font-size: 16px; color: var(--text-secondary); margin-bottom: 16px; }
.completed-title { color: var(--accent-success); }
.task-list { display: flex; flex-direction: column; gap: 12px; }
.empty-state { text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--border-color); }

.task-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; transition: border-color 0.2s; }
.task-card:hover { border-color: var(--accent-primary); }
.task-card.completed { opacity: 0.7; }

.task-main { display: flex; align-items: center; gap: 12px; padding: 16px; cursor: pointer; }
.task-check { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; display: flex; }
.task-check .completed { color: var(--accent-success); }
.task-content { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.task-title { font-weight: 500; color: var(--text-primary); }
.task-meta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
.level-badge { padding: 2px 8px; border-radius: 4px; background: rgba(99,102,241,0.2); color: var(--accent-primary); font-size: 11px; }
.progress-bar { height: 4px; background: var(--bg-secondary); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #22d3ee); transition: width 0.3s; }
.task-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; opacity: 0; transition: opacity 0.2s; }
.task-card:hover .task-delete { opacity: 1; }
.task-delete:hover { color: #ef4444; }

.hierarchy { padding: 0 16px 16px 48px; display: flex; flex-direction: column; gap: 8px; }
.phase-block { border-left: 2px solid rgba(99,102,241,0.3); padding-left: 12px; }
.group-block { margin-left: 12px; margin-top: 6px; }
.phase-children { margin-top: 4px; }
.action-list { margin-left: 24px; margin-top: 4px; display: flex; flex-direction: column; gap: 4px; }

.node-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 8px;
  background: var(--bg-secondary); font-size: 14px;
}
.node-row.level-3 { cursor: grab; }
.node-row.level-3:active { cursor: grabbing; }
.node-row.level-1 { cursor: pointer; background: rgba(99,102,241,0.08); }
.level-tag { padding: 2px 6px; border-radius: 4px; font-size: 10px; color: white; flex-shrink: 0; }
.node-title { flex: 1; color: var(--text-primary); }
.node-title.completed { text-decoration: line-through; color: var(--text-muted); }
.check-icon { color: var(--text-muted); flex-shrink: 0; cursor: pointer; }
.check-icon.completed { color: var(--accent-success); }
.drag-handle { color: var(--text-muted); flex-shrink: 0; }
.icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; }
.icon-btn.danger:hover { color: #ef4444; }

.add-action-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; background: none;
  border: 1px dashed var(--border-color); border-radius: 8px;
  color: var(--text-muted); font-size: 13px; cursor: pointer; margin-top: 4px;
}
.add-action-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 24px; width: min(480px, 100%);
  max-height: 80vh; overflow-y: auto;
}
.modal-card.wide { width: min(640px, 100%); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.modal-header h3 { font-family: 'Orbitron', sans-serif; font-size: 18px; color: var(--text-primary); }
.modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
.modal-desc { color: var(--text-muted); font-size: 14px; margin-bottom: 16px; line-height: 1.6; }

.clarify-block { margin-bottom: 16px; }
.clarify-q { font-weight: 500; color: var(--text-primary); margin-bottom: 10px; }
.clarify-options { display: flex; flex-wrap: wrap; gap: 8px; }
.option-btn {
  padding: 8px 14px; border-radius: 8px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  color: var(--text-secondary); cursor: pointer; font-size: 13px;
}
.option-btn.active { border-color: var(--accent-primary); background: rgba(99,102,241,0.15); color: var(--text-primary); }

.preview-tree { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.preview-phase { border-left: 3px solid #6366f1; padding-left: 12px; }
.preview-level-1 { font-weight: 600; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.preview-group { margin-left: 12px; margin-bottom: 8px; }
.preview-level-2 { font-weight: 500; color: var(--text-secondary); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
.preview-action { margin-left: 24px; padding: 4px 0; color: var(--text-muted); font-size: 13px; display: flex; align-items: center; gap: 8px; }

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn-secondary {
  padding: 12px 20px; border-radius: 10px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  color: var(--text-primary); cursor: pointer;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
