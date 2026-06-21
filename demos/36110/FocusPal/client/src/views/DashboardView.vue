<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useStatsStore } from '../stores/stats'
import { useTaskStore } from '../stores/tasks'
import StatCard from '../components/StatCard.vue'
import { Clock, CheckCircle, Flame, Award, Play, Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const statsStore = useStatsStore()
const taskStore = useTaskStore()
const router = useRouter()

const levelProgress = computed(() => {
  const level = authStore.user?.level || 1
  const exp = authStore.user?.exp || 0
  const levelExp = [0, 500, 1500, 3500, 7000]
  const currentLevelExp = levelExp[level - 1] || 0
  const nextLevelExp = levelExp[level] || 7000
  const progress = ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  return Math.min(Math.max(progress, 0), 100)
})

const todayMinutes = computed(() => statsStore.dailyStats?.total_minutes || 0)
const tasksCompleted = computed(() => statsStore.dailyStats?.tasks_completed || 0)
const streakDays = computed(() => statsStore.dailyStats?.streak_days || 0)

onMounted(async () => {
  await Promise.all([
    statsStore.fetchDailyStats(),
    taskStore.fetchTasks()
  ])
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header fade-in">
      <div>
        <h1 class="welcome-text">欢迎回来，{{ authStore.user?.nickname || '学员' }}</h1>
        <p class="date-text">{{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>
      <div class="level-progress">
        <div class="level-info">
          <span class="level-label">Lv{{ authStore.user?.level || 1 }}</span>
          <span class="level-name">{{ ['新手学员', '自律达人', '学霸', '学神', '卷王之王'][authStore.user?.level - 1] || '新手学员' }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: levelProgress + '%' }"></div>
        </div>
        <div class="exp-text">{{ authStore.user?.exp || 0 }} / {{ [500, 1500, 3500, 7000][authStore.user?.level - 1] || 7000 }} EXP</div>
      </div>
    </div>

    <div class="stats-grid fade-in">
      <StatCard 
        title="今日学习" 
        :value="`${todayMinutes} 分钟`"
        :icon="Clock"
        :gradient="'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)'"
      />
      <StatCard 
        title="完成任务" 
        :value="tasksCompleted"
        :icon="CheckCircle"
        :gradient="'linear-gradient(135deg, #10b981 0%, #22d3ee 100%)'"
      />
      <StatCard 
        title="连续打卡" 
        :value="`${streakDays} 天`"
        :icon="Flame"
        :gradient="'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'"
      />
      <StatCard 
        title="当前等级" 
        :value="`Lv${authStore.user?.level || 1}`"
        :icon="Award"
        :gradient="'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'"
      />
    </div>

    <div class="quick-actions fade-in">
      <h2 class="section-title">快捷操作</h2>
      <div class="action-buttons">
        <button class="action-btn primary" @click="router.push('/study')">
          <Play :size="20" />
          <span>开始学习</span>
        </button>
        <button class="action-btn secondary" @click="router.push('/tasks')">
          <Plus :size="20" />
          <span>创建任务</span>
        </button>
      </div>
    </div>

    <div class="recent-tasks fade-in">
      <div class="section-header">
        <h2 class="section-title">最近任务</h2>
        <router-link to="/tasks" class="view-all">查看全部</router-link>
      </div>
      <div class="task-list">
        <div v-if="taskStore.tasks.length === 0" class="empty-state">
          <p>暂无任务，<router-link to="/tasks">创建第一个任务</router-link></p>
        </div>
        <div v-for="task in taskStore.tasks.slice(0, 5)" :key="task.id" class="task-item">
          <div class="task-info">
            <span class="task-title">{{ task.title }}</span>
            <span class="task-meta">{{ taskStore.countNodes(task.phases || []).total }} 项行动 · {{ taskStore.countNodes(task.phases || []).done }} 已完成</span>
          </div>
          <div class="task-status" :class="{ completed: task.completed }">
            {{ task.completed ? '已完成' : '进行中' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.date-text {
  color: var(--text-muted);
  font-size: 14px;
}

.level-progress {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 280px;
  border: 1px solid var(--border-color);
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.level-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.level-name {
  color: var(--text-secondary);
  font-size: 14px;
}

.progress-bar {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.exp-text {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-all {
  color: var(--accent-primary);
  text-decoration: none;
  font-size: 14px;
}

.view-all:hover {
  text-decoration: underline;
}

.quick-actions {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid var(--border-color);
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn.secondary:hover {
  border-color: var(--accent-primary);
}

.recent-tasks {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.empty-state a {
  color: var(--accent-primary);
  text-decoration: none;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.task-item:hover {
  transform: translateX(4px);
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-weight: 500;
  color: var(--text-primary);
}

.task-meta {
  font-size: 13px;
  color: var(--text-muted);
}

.task-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
}

.task-status.completed {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
}
</style>
