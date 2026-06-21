import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

interface DailyStats {
  total_minutes: number
  tasks_completed: number
  streak_days: number
  date: string
}

interface StatsData {
  study_history: Array<{
    date: string
    minutes: number
  }>
  task_stats: {
    completed: number
    total: number
  }
}

export const useStatsStore = defineStore('stats', () => {
  const dailyStats = ref<DailyStats | null>(null)
  const statsData = ref<StatsData | null>(null)

  async function fetchDailyStats() {
    const authStore = useAuthStore()
    try {
      const response = await fetch('http://localhost:3000/api/stats/daily', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        dailyStats.value = data.data
      }
    } catch (error) {
      console.error('Failed to fetch daily stats:', error)
    }
  }

  async function fetchStats(range: 'today' | 'week' | 'month' = 'week') {
    const authStore = useAuthStore()
    try {
      const response = await fetch(`http://localhost:3000/api/stats?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        statsData.value = data.data
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  async function recordStudySession(session: { minutes: number; task_id?: number }) {
    const authStore = useAuthStore()
    try {
      const response = await fetch('http://localhost:3000/api/stats/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(session)
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message)
      }
      await fetchDailyStats()
      return data
    } catch (error) {
      console.error('Failed to record study session:', error)
      throw error
    }
  }

  return {
    dailyStats,
    statsData,
    fetchDailyStats,
    fetchStats,
    recordStudySession
  }
})
