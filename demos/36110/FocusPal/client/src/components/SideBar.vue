<script setup lang="ts">
import { useRoute } from 'vue-router'
import { 
  LayoutDashboard, 
  ListTodo, 
  Timer, 
  BarChart3, 
  Trophy, 
  UserCircle 
} from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { path: '/', name: '首页仪表盘', icon: LayoutDashboard },
  { path: '/tasks', name: '学习任务', icon: ListTodo },
  { path: '/study', name: 'AI 监督', icon: Timer },
  { path: '/stats', name: '数据统计', icon: BarChart3 },
  { path: '/achievements', name: '成就中心', icon: Trophy },
  { path: '/profile', name: '个人中心', icon: UserCircle }
]
</script>

<template>
  <aside class="sidebar">
    <nav class="nav-menu">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: route.path === item.path }"
      >
        <component :is="item.icon" :size="20" />
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: rgba(17, 24, 39, 0.8);
  border-right: 1px solid var(--border-color);
  padding: 24px 12px;
  min-height: calc(100vh - 60px);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%);
  color: var(--accent-primary);
  border-left: 3px solid var(--accent-primary);
}
</style>
