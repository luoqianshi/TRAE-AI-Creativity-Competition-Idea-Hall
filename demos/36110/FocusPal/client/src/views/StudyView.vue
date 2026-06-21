<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStudyStore } from '../stores/study'
import { useTaskStore } from '../stores/tasks'
import { useStatsStore } from '../stores/stats'
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Target } from 'lucide-vue-next'

const studyStore = useStudyStore()
const taskStore = useTaskStore()
const statsStore = useStatsStore()

const timerDisplay = ref('25:00')
const currentTaskId = ref<number | null>(null)
const aiMessages = ref<string[]>([])
const sessionStats = ref({
  focusTime: 0,
  breaksTaken: 0,
  completedPomodoros: 0
})

const isRunning = computed(() => studyStore.isRunning)
const isBreak = computed(() => studyStore.isBreak)
const currentMode = computed(() => studyStore.currentMode)

const progress = computed(() => {
  const total = currentMode.value === 'focus' ? studyStore.totalFocusSeconds : studyStore.totalBreakSeconds
  const remaining = studyStore.remainingTime
  return ((total - remaining) / total) * 100
})

const circumference = 2 * Math.PI * 120
const strokeDashoffset = computed(() => {
  return circumference - (progress.value / 100) * circumference
})

const tips = [
  '保持专注，避免分心',
  '适当的休息能提高效率',
  '每完成一个番茄钟，记得站起来活动一下',
  '深呼吸引导可以帮助你放松',
  '设定明确的目标会让学习更高效',
  '保持良好的坐姿有助于集中注意力'
]

const randomTip = ref(tips[Math.floor(Math.random() * tips.length)])

watch(() => studyStore.remainingTime, (newTime) => {
  const minutes = Math.floor(newTime / 60)
  const seconds = newTime % 60
  timerDisplay.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

function startTimer() {
  studyStore.startTimer()
  if (sessionStats.value.completedPomodoros === 0) {
    addAIMessage('开始学习吧！保持专注，你一定可以的 💪')
  }
}

function pauseTimer() {
  studyStore.pauseTimer()
  addAIMessage('学习暂停了，休息一下也好，不要给自己太大压力')
}

function resetTimer() {
  studyStore.resetTimer()
  sessionStats.value = {
    focusTime: 0,
    breaksTaken: 0,
    completedPomodoros: 0
  }
  addAIMessage('计时器已重置，准备好开始新的学习周期了吗？')
}

function takeBreak() {
  studyStore.startBreak()
  sessionStats.value.breaksTaken++
  randomTip.value = tips[Math.floor(Math.random() * tips.length)]
  addAIMessage('休息时间！站起来活动活动，喝杯水吧 ☕')
}

function addAIMessage(message: string) {
  aiMessages.value = [message, ...aiMessages.value.slice(0, 2)]
}

function selectTask(taskId: number) {
  currentTaskId.value = taskId
  const task = taskStore.tasks.find(t => t.id === taskId)
  if (task) {
    addAIMessage(`正在学习：${task.title}`)
  }
}

async function completePomodoro(minutes: number) {
  sessionStats.value.completedPomodoros++
  sessionStats.value.focusTime += minutes

  const bonus = Math.random() < 0.2 ? ' 🎁 彩蛋奖励：额外经验值！' : ''
  try {
    await statsStore.recordStudySession({
      minutes,
      task_id: currentTaskId.value ?? undefined,
    })
    if (minutes <= 5) {
      addAIMessage(`已完成 ${minutes} 分钟！继续学习可获得额外奖励 💪${bonus}`)
    } else {
      addAIMessage(`太棒了！已完成 ${sessionStats.value.completedPomodoros} 个番茄钟 🎉${bonus}`)
    }
  } catch {
    addAIMessage('学习完成！但记录保存失败')
  }
}

function startMicroSession() {
  studyStore.setMicroMode(5)
  timerDisplay.value = '05:00'
  addAIMessage('微任务模式：只需 5 分钟，降低启动门槛！')
  startTimer()
}

function startFullSession() {
  studyStore.setMicroMode(25)
  timerDisplay.value = '25:00'
  startTimer()
}

function onUserActivity() {
  studyStore.recordActivity()
}

onMounted(() => {
  taskStore.fetchTasks()
  studyStore.setFocusCompleteCallback(completePomodoro)
  window.addEventListener('mousemove', onUserActivity)
  window.addEventListener('keydown', onUserActivity)
})

onUnmounted(() => {
  if (isRunning.value) studyStore.pauseTimer()
  window.removeEventListener('mousemove', onUserActivity)
  window.removeEventListener('keydown', onUserActivity)
})
</script>

<template>
  <div class="study-page">
    <div class="privacy-banner">
      <span>🔒 隐私保护：不采集屏幕内容，仅检测操作活跃度；数据本地存储，支持导出/删除</span>
    </div>
    <div class="study-container">
      <div class="timer-section">
        <div class="mode-indicator" :class="{ break: isBreak }">
          {{ isBreak ? '休息时间' : '专注学习' }}
        </div>
        
        <div class="timer-ring">
          <svg class="progress-ring" viewBox="0 0 260 260">
            <circle
              class="progress-ring-bg"
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke-width="8"
            />
            <circle
              class="progress-ring-progress"
              :class="{ break: isBreak }"
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke-width="8"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              transform="rotate(-90 130 130)"
            />
          </svg>
          <div class="timer-content">
            <span class="timer-display">{{ timerDisplay }}</span>
            <span class="timer-label">{{ currentMode === 'focus' ? '专注中' : '休息中' }}</span>
          </div>
        </div>

        <div class="timer-controls">
          <button
            v-if="!isRunning"
            class="control-btn primary"
            @click="startFullSession"
          >
            <Play :size="24" />
            <span>{{ isBreak ? '继续休息' : '开始学习' }}</span>
          </button>
          <button 
            v-else 
            class="control-btn warning" 
            @click="pauseTimer"
          >
            <Pause :size="24" />
            <span>暂停</span>
          </button>
          
          <button class="control-btn secondary" @click="resetTimer">
            <RotateCcw :size="20" />
          </button>
          
          <button 
            v-if="!isBreak && sessionStats.completedPomodoros > 0" 
            class="control-btn tertiary"
            @click="takeBreak"
          >
            <Coffee :size="20" />
            <span>休息一下</span>
          </button>

          <button
            v-if="!isBreak && !isRunning"
            class="control-btn micro"
            @click="startMicroSession"
          >
            <Zap :size="18" />
            <span>只学 5 分钟</span>
          </button>
        </div>

        <div v-if="studyStore.isIdle && isRunning && !isBreak" class="idle-alert">
          ⚠️ 检测到长时间无操作，要不要休息一下再继续？
        </div>

        <div v-if="sessionStats.completedPomodoros > 0" class="session-stats">
          <div class="stat-item">
            <Zap :size="18" class="stat-icon" />
            <span class="stat-value">{{ sessionStats.completedPomodoros }}</span>
            <span class="stat-label">番茄钟</span>
          </div>
          <div class="stat-item">
            <Brain :size="18" class="stat-icon" />
            <span class="stat-value">{{ sessionStats.focusTime }} 分钟</span>
            <span class="stat-label">专注时长</span>
          </div>
          <div class="stat-item">
            <Coffee :size="18" class="stat-icon" />
            <span class="stat-value">{{ sessionStats.breaksTaken }}</span>
            <span class="stat-label">休息次数</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="current-task-card" v-if="currentTaskId">
          <div class="card-header">
            <Target :size="18" />
            <span>当前任务</span>
          </div>
          <div class="task-name">
            {{ taskStore.tasks.find(t => t.id === currentTaskId)?.title }}
          </div>
        </div>

        <div class="ai-reminder-card">
          <div class="card-header">
            <Brain :size="18" />
            <span>AI 提醒</span>
          </div>
          <div class="ai-tips">
            <div class="tip-item">
              <span class="tip-icon">💡</span>
              <span>{{ randomTip }}</span>
            </div>
          </div>
          <div class="ai-messages">
            <div 
              v-for="(msg, index) in aiMessages" 
              :key="index" 
              class="ai-message"
              :style="{ opacity: 1 - index * 0.3 }"
            >
              {{ msg }}
            </div>
          </div>
        </div>

        <div class="task-select-card">
          <div class="card-header">
            <Target :size="18" />
            <span>选择学习任务</span>
          </div>
          <div class="task-list">
            <div 
              v-for="task in taskStore.tasks.filter(t => !t.completed)" 
              :key="task.id"
              class="task-option"
              :class="{ active: currentTaskId === task.id }"
              @click="selectTask(task.id)"
            >
              {{ task.title }}
            </div>
            <div v-if="taskStore.tasks.filter(t => !t.completed).length === 0" class="no-tasks">
              暂无进行中的任务
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.study-page {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 12px;
}

.privacy-banner {
  width: 100%;
  max-width: 1000px;
  padding: 10px 20px;
  margin-bottom: 12px;
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.25);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

.idle-alert {
  padding: 12px 20px;
  margin-bottom: 16px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 10px;
  font-size: 14px;
  color: #fbbf24;
  text-align: center;
}

.control-btn.micro {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.study-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1000px;
  width: 100%;
  padding: 20px;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mode-indicator {
  padding: 8px 20px;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
}

.mode-indicator.break {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
}

.timer-ring {
  position: relative;
  width: 260px;
  height: 260px;
  margin-bottom: 32px;
}

.progress-ring {
  width: 100%;
  height: 100%;
}

.progress-ring-bg {
  stroke: var(--bg-secondary);
}

.progress-ring-progress {
  stroke: var(--accent-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.progress-ring-progress.break {
  stroke: var(--accent-success);
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-display {
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
}

.timer-label {
  font-size: 14px;
  color: var(--text-muted);
}

.timer-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  color: white;
}

.control-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.control-btn.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: white;
}

.control-btn.warning:hover {
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
}

.control-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 14px;
}

.control-btn.secondary:hover {
  border-color: var(--accent-primary);
}

.control-btn.tertiary {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
}

.session-stats {
  display: flex;
  gap: 24px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  color: var(--accent-primary);
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.current-task-card,
.ai-reminder-card,
.task-select-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
}

.task-name {
  font-size: 15px;
  color: var(--text-primary);
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.ai-tips {
  margin-bottom: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tip-icon {
  flex-shrink: 0;
}

.ai-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-message {
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.task-option {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-option:hover {
  background: var(--bg-primary);
  border: 1px solid var(--accent-primary);
}

.task-option.active {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid var(--accent-primary);
}

.no-tasks {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .study-container {
    grid-template-columns: 1fr;
  }
}
</style>
