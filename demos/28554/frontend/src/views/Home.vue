<template>
  <div class="home-layout">
    <!-- 顶部导航 -->
    <van-sticky>
      <van-nav-bar
        :title="pageTitle"
        left-arrow
        @click-left="onClickLeft"
        @click-right="onClickRight"
      >
        <template #right>
          <van-icon name="ellipsis" size="18" />
        </template>
      </van-nav-bar>
    </van-sticky>

    <!-- 右上角菜单（含退出） -->
    <van-action-sheet
      v-model:show="showMenu"
      :actions="menuActions"
      cancel-text="取消"
      @select="onMenuSelect"
    />

    <!-- 内容区域 -->
    <div class="page-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" route active-color="#1989fa" inactive-color="#7d7e80">
      <van-tabbar-item replace to="/dashboard" icon="chart-trending-o">看板</van-tabbar-item>
      <van-tabbar-item replace to="/expenses" icon="balance-list-o">费用</van-tabbar-item>
      <van-tabbar-item replace to="/statistics" icon="bar-chart-o">统计</van-tabbar-item>
      <van-tabbar-item
        v-if="authStore.isLoggedIn"
        replace
        to="/categories"
        icon="apps-o"
      >
        类目
      </van-tabbar-item>
      <van-tabbar-item
        v-if="authStore.isAdmin"
        replace
        to="/admins"
        icon="manager-o"
      >
        管理
      </van-tabbar-item>
      <van-tabbar-item replace to="/logs" icon="records">日志</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref(0)
const showMenu = ref(false)

const menuActions = computed(() => {
  if (!authStore.isLoggedIn) return []
  return [{ name: '退出登录', value: 'logout' }]
})

const pageTitle = computed(() => {
  return (route.meta.title as string) || '首页'
})

const onClickLeft = () => {
  router.back()
}

const onClickRight = () => {
  if (authStore.isLoggedIn) showMenu.value = true
}

const onMenuSelect = async (item: { value?: string }) => {
  showMenu.value = false
  if (item.value === 'logout') {
    try {
      await showConfirmDialog({ title: '确认退出', message: '确定要退出登录吗？' })
      authStore.logout()
      router.replace('/login')
    } catch {
      // 用户取消
    }
  }
}

// 根据路由更新底部导航激活状态
watch(
  () => route.path,
  (path) => {
    const tabRoutes = ['/dashboard', '/expenses', '/statistics', '/categories', '/admins', '/organizations', '/logs']
    const index = tabRoutes.findIndex(route => path.startsWith(route))
    if (index !== -1) {
      activeTab.value = index
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.home-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  padding-bottom: 50px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
