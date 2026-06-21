<script setup lang="ts">
// FocusPal AI学习监督官 - 主应用组件
// 作者：[你的名字]
// 版本：v1.0.0
// 创建时间：2024年

import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import SideBar from './components/SideBar.vue'
import { useAuthStore } from './stores/auth'

// 获取认证状态
const authStore = useAuthStore()
</script>

<template>
  <div class="app-container" v-if="authStore.isAuthenticated">
    <NavBar />
    <div class="main-layout">
      <SideBar />
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
  <RouterView v-else />
</template>

<style>
.app-container {
  min-height: 100vh;
  background: #0a0e17;
}

.main-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>