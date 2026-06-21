<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { LogOut, User, Award } from 'lucide-vue-next'

const authStore = useAuthStore()
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <span class="logo">FocusPal</span>
      <span class="logo-sub">AI 学习监督官</span>
    </div>
    <div class="navbar-actions">
      <div class="level-badge" v-if="authStore.user?.level">
        <Award :size="16" />
        <span>Lv{{ authStore.user.level }}</span>
      </div>
      <div class="user-info">
        <User :size="20" />
        <span>{{ authStore.user?.nickname || '用户' }}</span>
      </div>
      <button class="btn-logout" @click="authStore.logout()">
        <LogOut :size="18" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  height: 60px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-sub {
  font-size: 12px;
  color: var(--text-muted);
  padding-left: 12px;
  border-left: 1px solid var(--border-color);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  border-radius: 20px;
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.btn-logout {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  border-color: var(--accent-danger);
  color: var(--accent-danger);
}
</style>
