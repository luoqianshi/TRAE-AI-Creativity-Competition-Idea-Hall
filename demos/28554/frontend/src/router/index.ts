import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: ('SuperAdmin' | 'Admin' | 'Parent')[]
}

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', requiresAuth: false }
      },
      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('@/views/Expenses.vue'),
        meta: { title: '费用明细', requiresAuth: true }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: { title: '统计分析', requiresAuth: true }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: { title: '类目管理', requiresAuth: true }
      },
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('@/views/Admins.vue'),
        meta: { title: '管理员管理', requiresAuth: true, roles: ['SuperAdmin', 'Admin'] }
      },
      {
        path: 'organizations',
        name: 'Organizations',
        component: () => import('@/views/Organizations.vue'),
        meta: { title: '机构管理', requiresAuth: true, roles: ['SuperAdmin'] }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/Logs.vue'),
        meta: { title: '操作日志', requiresAuth: false }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes as RouteRecordRaw[]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 幼儿园财务管理系统`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // 需要认证但未登录，跳转到登录页
      next('/login')
      return
    }

    // 检查角色权限
    const meta = to.meta as RouteMeta
    const currentRole = authStore.roleName()
    if (meta.roles && currentRole && !meta.roles.includes(currentRole as any)) {
      // 无权限，跳转到首页
      next('/')
      return
    }
  } else {
    // 已登录用户访问登录页，重定向到首页
    if (authStore.isLoggedIn && to.path === '/login') {
      next('/')
      return
    }
  }

  next()
})

export default router
