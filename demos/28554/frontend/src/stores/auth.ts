import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Admin, RoleItem, User } from '@/types'
import { authApi } from '@/api'

/** 从用户对象提取角色名列表 */
function getRoleNames(u: Admin | User): string[] {
  const admin = u as Admin
  if (admin.roles && Array.isArray(admin.roles)) {
    return admin.roles.map((r: RoleItem) => r.name)
  }
  if (admin.role) {
    return [admin.role]
  }
  if ((u as User).role) {
    return [(u as User).role]
  }
  return []
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<Admin | User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || 'null') : null
  )

  const isLoggedIn = ref<boolean>(!!token.value)
  const isSuperAdmin = ref<boolean>(false)
  const isAdmin = ref<boolean>(false)

  if (user.value) {
    const roles = getRoleNames(user.value)
    isSuperAdmin.value = roles.includes('SuperAdmin')
    isAdmin.value = roles.includes('Admin') || roles.includes('SuperAdmin')
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser: Admin | User) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
    const roles = getRoleNames(newUser)
    isSuperAdmin.value = roles.includes('SuperAdmin')
    isAdmin.value = roles.includes('Admin') || roles.includes('SuperAdmin')
  }

  const login = async (phone: string, password: string) => {
    try {
      const res = await authApi.login({ phone, password })
      if (res.code === 200) {
        setToken(res.data.token)
        setUser(res.data.admin)
        return { success: true }
      }
      return { success: false, message: res.message }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '登录失败' }
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    isLoggedIn.value = false
    isSuperAdmin.value = false
    isAdmin.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /** 基于角色检查（兼容旧用法） */
  const hasRole = (requiredRole: 'SuperAdmin' | 'Admin' | 'Parent'): boolean => {
    if (!user.value) return false
    if (requiredRole === 'Parent') return true
    if (requiredRole === 'Admin') return isAdmin.value
    if (requiredRole === 'SuperAdmin') return isSuperAdmin.value
    return false
  }

  /** 主角色名（用于路由守卫等） */
  const roleName = (): string => {
    if (!user.value) return ''
    const roles = getRoleNames(user.value)
    if (roles.includes('SuperAdmin')) return 'SuperAdmin'
    if (roles.includes('Admin')) return 'Admin'
    if (roles.includes('Viewer')) return 'Viewer'
    return roles[0] || ''
  }

  /** 基于权限代码的细粒度检查（如 expense:create, org:manage） */
  const hasPermission = (permissionCode: string): boolean => {
    if (!user.value) return false
    if (isSuperAdmin.value) return true
    const admin = user.value as Admin
    const perms = admin.permissions
    if (perms && Array.isArray(perms)) {
      return perms.includes(permissionCode)
    }
    return false
  }

  return {
    token,
    user,
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    roleName,
    setToken,
    setUser,
    login,
    logout,
    hasRole,
    hasPermission
  }
})
