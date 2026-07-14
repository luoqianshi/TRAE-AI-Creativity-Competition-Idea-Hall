import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '@/utils/storage'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/open',
    name: 'OpenAccount',
    component: () => import('@/views/OpenAccount.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/add',
    name: 'AddTransaction',
    component: () => import('@/views/AddTransaction.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/views/Report.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contract',
    name: 'Contract',
    component: () => import('@/views/Contract.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const isOpened = storage.isAccountOpened()
  if (to.meta.requiresAuth && !isOpened) {
    return { name: 'OpenAccount' }
  }
  if (to.name === 'OpenAccount' && isOpened) {
    return { name: 'Home' }
  }
})

export default router
