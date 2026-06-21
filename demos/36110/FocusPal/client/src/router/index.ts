// FocusPal 路由配置
// 作者：[你的名字]
// 路由说明：
// - 公开页面：/login, /register（无需登录）
// - 私密页面：其余页面（需登录验证）

import { createRouter, createWebHistory } from 'vue-router'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TasksView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/study',
      name: 'study',
      component: () => import('../views/StudyView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('../views/AchievementsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 导航守卫：登录验证中间件
// 功能说明：确保只有已登录用户才能访问私密页面
router.beforeEach((to, from, next) => {
  // 从本地存储获取认证令牌（JWT）
  const token = localStorage.getItem('auth_token')
  const isAuthenticated = !!token
  
  // 路由保护逻辑
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 未登录用户访问私密页面，重定向到登录页
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // 已登录用户访问登录/注册页，重定向到首页仪表盘
    next('/')
  } else {
    // 正常导航继续
    next()
  }
})

// 导出路由实例
export default router