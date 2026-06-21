<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStatsStore } from '../stores/stats'
import { useAuthStore } from '../stores/auth'
import * as echarts from 'echarts'
import { Calendar, TrendingUp, Award, Target, Filter } from 'lucide-vue-next'

const statsStore = useStatsStore()
const authStore = useAuthStore()

const timeRange = ref<'today' | 'week' | 'month'>('week')
const chartContainer = ref<HTMLDivElement | null>(null)
const pieChartContainer = ref<HTMLDivElement | null>(null)

let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const totalMinutes = computed(() => {
  const data = statsStore.statsData
  if (!data?.study_history) return 0
  return data.study_history.reduce((sum, item) => sum + item.minutes, 0)
})

const avgDaily = computed(() => {
  const data = statsStore.statsData
  if (!data?.study_history?.length) return 0
  return Math.round(totalMinutes.value / data.study_history.length)
})

const completionRate = computed(() => {
  const data = statsStore.statsData
  if (!data?.task_stats) return 0
  const { completed, total } = data.task_stats
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

function initCharts() {
  if (chartContainer.value) {
    trendChart = echarts.init(chartContainer.value)
    updateTrendChart()
  }
  
  if (pieChartContainer.value) {
    pieChart = echarts.init(pieChartContainer.value)
    updatePieChart()
  }
}

function updateTrendChart() {
  if (!trendChart) return
  
  const data = statsStore.statsData?.study_history || []
  const dates = data.map(item => item.date)
  const minutes = data.map(item => item.minutes)
  
  trendChart.setOption({
    backgroundColor: 'transparent',
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#9CA3AF' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1F2937' } },
      axisLabel: { color: '#9CA3AF' }
    },
    series: [{
      type: 'line',
      data: minutes,
      smooth: true,
      lineStyle: {
        color: '#6366F1',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(99, 102, 241, 0.4)' },
          { offset: 1, color: 'rgba(99, 102, 241, 0)' }
        ])
      },
      itemStyle: {
        color: '#6366F1'
      },
      symbol: 'circle',
      symbolSize: 8
    }]
  })
}

function updatePieChart() {
  if (!pieChart) return
  
  const data = statsStore.statsData?.task_stats || { completed: 0, total: 0 }
  const remaining = Math.max(data.total - data.completed, 0)
  
  pieChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: '#9CA3AF' }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#0F172A',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      data: [
        { 
          value: data.completed, 
          name: '已完成',
          itemStyle: { color: '#10B981' }
        },
        { 
          value: remaining, 
          name: '未完成',
          itemStyle: { color: '#374151' }
        }
      ]
    }]
  })
}

async function changeTimeRange(range: 'today' | 'week' | 'month') {
  timeRange.value = range
  await statsStore.fetchStats(range)
  updateTrendChart()
  updatePieChart()
}

onMounted(async () => {
  await Promise.all([
    statsStore.fetchStats('week'),
    authStore.fetchAchievements()
  ])
  
  setTimeout(initCharts, 100)
  
  window.addEventListener('resize', () => {
    trendChart?.resize()
    pieChart?.resize()
  })
})
</script>

<template>
  <div class="stats-page">
    <div class="page-header">
      <h1 class="page-title">数据统计</h1>
      <div class="time-filter">
        <button 
          v-for="range in ['today', 'week', 'month'] as const" 
          :key="range"
          class="filter-btn"
          :class="{ active: timeRange === range }"
          @click="changeTimeRange(range)"
        >
          {{ { today: '今日', week: '本周', month: '本月' }[range] }}
        </button>
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon" style="background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);">
          <Calendar :size="24" />
        </div>
        <div class="card-content">
          <span class="card-value">{{ totalMinutes }}</span>
          <span class="card-label">总学习时长（分钟）</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon" style="background: linear-gradient(135deg, #10b981 0%, #22d3ee 100%);">
          <TrendingUp :size="24" />
        </div>
        <div class="card-content">
          <span class="card-value">{{ avgDaily }}</span>
          <span class="card-label">日均学习（分钟）</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);">
          <Target :size="24" />
        </div>
        <div class="card-content">
          <span class="card-value">{{ completionRate }}%</span>
          <span class="card-label">任务完成率</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);">
          <Award :size="24" />
        </div>
        <div class="card-content">
          <span class="card-value">{{ authStore.achievements?.length || 0 }}</span>
          <span class="card-label">已解锁成就</span>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">学习时长趋势</h3>
        <div ref="chartContainer" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">任务完成情况</h3>
        <div ref="pieChartContainer" class="chart-container pie"></div>
      </div>
    </div>

    <div class="achievements-section">
      <h3 class="section-title">成就进度</h3>
      <div class="achievements-grid">
        <div 
          v-for="achievement in authStore.achievements" 
          :key="achievement.id"
          class="achievement-item"
          :class="{ unlocked: achievement.unlocked }"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-info">
            <span class="achievement-name">{{ achievement.name }}</span>
            <span class="achievement-desc">{{ achievement.description }}</span>
          </div>
          <div v-if="achievement.unlocked" class="unlocked-badge">已解锁</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  color: var(--text-primary);
}

.time-filter {
  display: flex;
  background: var(--bg-card);
  border-radius: 10px;
  padding: 4px;
  border: 1px solid var(--border-color);
}

.filter-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--accent-primary);
  color: white;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.card-label {
  font-size: 13px;
  color: var(--text-muted);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.chart-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.chart-container.pie {
  height: 280px;
}

.achievements-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  opacity: 1;
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.achievement-name {
  font-weight: 500;
  color: var(--text-primary);
}

.achievement-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.unlocked-badge {
  padding: 4px 10px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
