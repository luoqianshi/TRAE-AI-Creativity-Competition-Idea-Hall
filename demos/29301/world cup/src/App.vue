<template>
  <div class="min-h-screen bg-gradient-to-br from-world-cup-blue via-blue-900 to-world-cup-red">
    <header class="bg-black/50 backdrop-blur-sm text-white py-6">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-world-cup-gold rounded-full flex items-center justify-center">
              <span class="text-2xl">🏆</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold">世界杯冠军预测</h1>
              <p class="text-gray-400">基于数据的科学预测</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-sm text-gray-400">2022 卡塔尔世界杯</div>
              <div class="text-lg font-semibold">预测进行中...</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <nav class="bg-white/10 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex gap-2 py-3 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-world-cup-gold text-gray-800'
                : 'text-white hover:bg-white/20'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="activeTab === 'groups'">
        <GroupTable />
      </div>
      
      <div v-if="activeTab === 'teams'">
        <TeamStats />
      </div>
      
      <div v-if="activeTab === 'knockout'">
        <KnockoutBracket />
      </div>
      
      <div v-if="activeTab === 'charts'">
        <Charts />
      </div>
    </main>

    <footer class="bg-black/50 text-white py-6 mt-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-gray-400">© 2024 世界杯冠军预测系统 | 数据仅供参考</p>
        <p class="text-gray-500 text-sm mt-2">基于各队历史数据和小组赛表现进行预测</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GroupTable from './components/GroupTable.vue'
import TeamStats from './components/TeamStats.vue'
import KnockoutBracket from './components/KnockoutBracket.vue'
import Charts from './components/Charts.vue'

const tabs = [
  { key: 'groups', label: '小组赛结果' },
  { key: 'teams', label: '球队数据' },
  { key: 'knockout', label: '淘汰赛预测' },
  { key: 'charts', label: '数据可视化' }
]

const activeTab = ref('groups')
</script>
