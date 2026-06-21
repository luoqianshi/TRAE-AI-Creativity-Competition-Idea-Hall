import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  email: string
  nickname: string
  level: number
  exp: number
  avatar?: string
  created_at: string
}

interface AuthData {
  user: User
  token: string
}

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  category: string
  requirement: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const achievements = ref<Achievement[]>([])

  const isLoggedIn = computed(() => !!token.value)
  const isAuthenticated = isLoggedIn // Alias for compatibility

  function setAuth(data: AuthData) {
    user.value = data.user
    token.value = data.token
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
  }

  function loadFromStorage() {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  async function updateProfile(form: { nickname: string; email: string; avatar?: string }) {
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(form)
    })
    const data = await response.json()
    if (data.success) {
      user.value = { ...user.value, ...form }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    } else {
      throw new Error(data.message)
    }
  }

  async function fetchAchievements() {
    try {
      const response = await fetch('http://localhost:3000/api/achievements', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      const data = await response.json()
      if (data.success) {
        achievements.value = data.data
        return data.data
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    }
    return null
  }

  // Initialize on store creation
  loadFromStorage()

  return {
    user,
    token,
    achievements,
    isLoggedIn,
    isAuthenticated,
    setAuth,
    loadFromStorage,
    logout,
    updateProfile,
    fetchAchievements
  }
})
