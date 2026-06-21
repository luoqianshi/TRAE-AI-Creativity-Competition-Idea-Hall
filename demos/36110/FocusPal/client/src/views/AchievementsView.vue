<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { Award, Lock, CheckCircle, Star, Zap, Clock, Target, Flame } from 'lucide-vue-next'

const authStore = useAuthStore()

const selectedAchievement = ref<any>(null)
const filterType = ref<'all' | 'unlocked' | 'locked'>('all')

const allAchievements = ref([
  {
    id: 1,
    name: '初次打卡',
    description: '完成第一次学习任务',
    icon: '🎯',
    category: '学习',
    requirement: '完成1个任务',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 2,
    name: '番茄新手',
    description: '完成5个番茄钟',
    icon: '🍅',
    category: '专注',
    requirement: '累计5个番茄钟',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 3,
    name: '连续7天',
    description: '连续打卡7天',
    icon: '🔥',
    category: '坚持',
    requirement: '连续7天学习',
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: 4,
    name: '学霸初成',
    description: '累计学习100小时',
    icon: '📚',
    category: '学习',
    requirement: '累计100小时',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 5,
    name: '任务大师',
    description: '完成50个任务',
    icon: '🏆',
    category: '学习',
    requirement: '完成50个任务',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 6,
    name: '专注达人',
    description: '单日学习超过4小时',
    icon: '⏰',
    category: '专注',
    requirement: '单日4小时',
    unlocked: false,
    progress: 0,
    maxProgress: 4
  },
  {
    id: 7,
    name: '早起鸟',
    description: '在早上6点前开始学习',
    icon: '🐦',
    category: '习惯',
    requirement: '6点前学习',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 8,
    name: '完美主义者',
    description: '连续30天完成所有计划任务',
    icon: '💎',
    category: '坚持',
    requirement: '连续30天',
    unlocked: false,
    progress: 0,
    maxProgress: 30
  },
  {
    id: 9,
    name: '夜猫子',
    description: '在晚上12点后完成学习',
    icon: '🦉',
    category: '习惯',
    requirement: '24点后学习',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 10,
    name: '极速前进',
    description: '在番茄钟内提前完成任务',
    icon: '⚡',
    category: '专注',
    requirement: '提前完成5次',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 11,
    name: '学习狂人',
    description: '单周学习超过20小时',
    icon: '📈',
    category: '学习',
    requirement: '单周20小时',
    unlocked: false,
    progress: 0,
    maxProgress: 20
  },
  {
    id: 12,
    name: '坚持不懈',
    description: '连续打卡100天',
    icon: '💪',
    category: '坚持',
    requirement: '连续100天',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  }
])

const filteredAchievements = computed(() => {
  if (filterType.value === 'unlocked') {
    return allAchievements.value.filter(a => a.unlocked)
  } else if (filterType.value === 'locked') {
    return allAchievements.value.filter(a => !a.unlocked)
  }
  return allAchievements.value
})

const unlockedCount = computed(() => allAchievements.value.filter(a => a.unlocked).length)
const totalCount = computed(() => allAchievements.value.length)

const categoryStats = computed(() => {
  const categories = ['学习', '专注', '坚持', '习惯']
  return categories.map(cat => {
    const items = allAchievements.value.filter(a => a.category === cat)
    const unlocked = items.filter(a => a.unlocked).length
    return { name: cat, unlocked, total: items.length }
  })
})

function showDetail(achievement: any) {
  selectedAchievement.value = achievement
}

function closeDetail() {
  selectedAchievement.value = null
}

function getProgressPercent(achievement: any) {
  return Math.min((achievement.progress / achievement.maxProgress) * 100, 100)
}

onMounted(async () => {
  try {
    const data = await authStore.fetchAchievements()
    if (data) {
      allAchievements.value = allAchievements.value.map(a => {
        const userAch = data.find((u: any) => u.id === a.id)
        if (userAch) {
          return { ...a, ...userAch }
        }
        return a
      })
    }
  } catch (error) {
    console.error('Failed to fetch achievements')
  }
})
</script>

<template>
  <div class="achievements-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">成就中心</h1>
        <p class="page-subtitle">已解锁 {{ unlockedCount }} / {{ totalCount }} 个成就</p>
      </div>
      <div class="filter-tabs">
        <button 
          v-for="type in ['all', 'unlocked', 'locked'] as const" 
          :key="type"
          class="filter-tab"
          :class="{ active: filterType === type }"
          @click="filterType = type"
        >
          {{ { all: '全部', unlocked: '已解锁', locked: '未解锁' }[type] }}
        </button>
      </div>
    </div>

    <div class="stats-row">
      <div 
        v-for="stat in categoryStats" 
        :key="stat.name"
        class="category-stat"
      >
        <div class="category-header">
          <span class="category-name">{{ stat.name }}</span>
          <span class="category-count">{{ stat.unlocked }}/{{ stat.total }}</span>
        </div>
        <div class="category-progress">
          <div 
            class="category-progress-fill" 
            :style="{ width: (stat.unlocked / stat.total) * 100 + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="achievements-grid">
      <div 
        v-for="achievement in filteredAchievements" 
        :key="achievement.id"
        class="achievement-card"
        :class="{ unlocked: achievement.unlocked }"
        @click="showDetail(achievement)"
      >
        <div class="achievement-badge">
          <span class="achievement-icon">{{ achievement.icon }}</span>
          <div v-if="!achievement.unlocked" class="locked-overlay">
            <Lock :size="20" />
          </div>
        </div>
        <div class="achievement-content">
          <h3 class="achievement-name">{{ achievement.name }}</h3>
          <p class="achievement-desc">{{ achievement.description }}</p>
          <div class="achievement-progress" v-if="!achievement.unlocked">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getProgressPercent(achievement) + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ achievement.progress }}/{{ achievement.maxProgress }}</span>
          </div>
          <div v-else class="unlocked-tag">
            <CheckCircle :size="14" />
            <span>已解锁</span>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selectedAchievement" class="modal-overlay" @click="closeDetail">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeDetail">×</button>
          <div class="modal-badge">
            <span class="modal-icon">{{ selectedAchievement.icon }}</span>
            <div v-if="!selectedAchievement.unlocked" class="modal-locked">
              <Lock :size="32" />
            </div>
          </div>
          <h2 class="modal-title">{{ selectedAchievement.name }}</h2>
          <p class="modal-desc">{{ selectedAchievement.description }}</p>
          
          <div class="modal-info">
            <div class="info-item">
              <Star :size="18" />
              <span>分类：{{ selectedAchievement.category }}</span>
            </div>
            <div class="info-item">
              <Target :size="18" />
              <span>条件：{{ selectedAchievement.requirement }}</span>
            </div>
          </div>

          <div v-if="!selectedAchievement.unlocked" class="modal-progress">
            <div class="progress-label">进度</div>
            <div class="progress-bar large">
              <div 
                class="progress-fill" 
                :style="{ width: getProgressPercent(selectedAchievement) + '%' }"
              ></div>
            </div>
            <div class="progress-value">
              {{ selectedAchievement.progress }} / {{ selectedAchievement.maxProgress }}
            </div>
          </div>

          <div v-else class="modal-unlocked">
            <Award :size="24" />
            <span>恭喜你已解锁此成就！</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.achievements-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 14px;
}

.filter-tabs {
  display: flex;
  background: var(--bg-card);
  border-radius: 10px;
  padding: 4px;
  border: 1px solid var(--border-color);
}

.filter-tab {
  padding: 8px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--accent-primary);
  color: white;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.category-stat {
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.category-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.category-count {
  font-size: 13px;
  color: var(--text-muted);
}

.category-progress {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.category-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.achievement-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.achievement-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
}

.achievement-card.unlocked {
  opacity: 1;
  border-color: rgba(99, 102, 241, 0.3);
}

.achievement-badge {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-icon {
  font-size: 32px;
}

.locked-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.achievement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.achievement-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.achievement-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.unlocked-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 10px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 420px;
  padding: 40px;
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-color);
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 50%;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: var(--accent-primary);
  color: white;
}

.modal-badge {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: 24px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon {
  font-size: 48px;
}

.modal-locked {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.modal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.modal-desc {
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 24px;
}

.modal-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 14px;
}

.modal-progress {
  text-align: left;
}

.progress-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.progress-bar.large {
  height: 10px;
  border-radius: 5px;
}

.progress-value {
  text-align: right;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

.modal-unlocked {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  color: var(--accent-success);
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
