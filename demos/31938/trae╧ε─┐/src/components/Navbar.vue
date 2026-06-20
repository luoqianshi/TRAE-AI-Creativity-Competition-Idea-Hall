<template>
  <nav class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Building2 class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-gray-800">物业监管平台</span>
        </div>
        
        <div class="hidden md:flex items-center space-x-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="$emit('tab-change', tab.key)"
            :class="[
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
              activeTab === tab.key
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div class="flex items-center space-x-4">
          <div class="hidden sm:flex items-center space-x-2 text-gray-500">
            <User class="w-5 h-5" />
            <span class="text-sm">业主用户</span>
          </div>
          <button class="md:hidden p-2 rounded-lg hover:bg-gray-100" @click="mobileMenuOpen = !mobileMenuOpen">
            <Menu class="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-gray-100">
      <div class="px-2 py-2 space-y-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="$emit('tab-change', tab.key); mobileMenuOpen = false"
          :class="[
            'flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all',
            activeTab === tab.key
              ? 'bg-primary-50 text-primary-600 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          <component :is="tab.icon" class="w-5 h-5" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { Building2, Home, Wallet, MessageSquare, ClipboardList, BarChart3, User, Menu } from 'lucide-vue-next'

defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
})

defineEmits(['tab-change'])

const mobileMenuOpen = ref(false)

const tabs = [
  { key: 'home', label: '首页总览', icon: markRaw(Home) },
  { key: 'finance', label: '费用透明', icon: markRaw(Wallet) },
  { key: 'complaint', label: '投诉中心', icon: markRaw(MessageSquare) },
  { key: 'service', label: '服务记录', icon: markRaw(ClipboardList) },
  { key: 'dashboard', label: '监管看板', icon: markRaw(BarChart3) }
]
</script>
