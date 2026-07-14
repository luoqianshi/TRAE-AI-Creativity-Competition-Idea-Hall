<template>
  <div class="tab-bar">
    <div
      v-for="item in tabs"
      :key="item.path"
      class="tab-item"
      :class="{ active: currentPath === item.path }"
      @click="navigate(item.path)"
    >
      <div class="tab-icon">{{ item.icon }}</div>
      <span class="tab-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/add', label: '记账', icon: '📝' },
  { path: '/report', label: '报表', icon: '📊' },
  { path: '/contract', label: '契约', icon: '📜' },
  { path: '/settings', label: '设置', icon: '⚙️' }
]

const currentPath = computed(() => route.path)

function navigate(path: string) {
  router.push(path)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  transition: all 0.3s;
}

.tab-item.active {
  color: #0ea5e9;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
}
</style>
