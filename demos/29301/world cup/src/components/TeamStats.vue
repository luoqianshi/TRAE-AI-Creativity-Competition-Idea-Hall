<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-2xl font-bold text-world-cup-blue mb-6">球队数据统计</h2>
    
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        v-for="team in filteredTeams"
        :key="team"
        @click="selectedTeam = team"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-all',
          selectedTeam === team
            ? 'bg-world-cup-blue text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ team }}
      </button>
    </div>

    <div v-if="selectedTeam && teamData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-world-cup-blue to-blue-800 text-white rounded-lg p-4">
        <div class="text-sm opacity-80">国际排名</div>
        <div class="text-3xl font-bold">{{ teamData.rank }}</div>
      </div>
      <div class="bg-gradient-to-br from-world-cup-gold to-yellow-700 text-white rounded-lg p-4">
        <div class="text-sm opacity-80">世界杯冠军</div>
        <div class="text-3xl font-bold">{{ teamData.worldCupTitles }}</div>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-800 text-white rounded-lg p-4">
        <div class="text-sm opacity-80">最佳成绩</div>
        <div class="text-2xl font-bold">{{ teamData.bestFinish }}</div>
      </div>
      <div class="bg-gradient-to-br from-teal-500 to-teal-800 text-white rounded-lg p-4">
        <div class="text-sm opacity-80">平均年龄</div>
        <div class="text-3xl font-bold">{{ teamData.avgAge }}</div>
      </div>
    </div>

    <div v-if="selectedTeam && teamData" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-world-cup-blue mb-3">关键球员</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="player in teamData.keyPlayers"
            :key="player"
            class="px-3 py-1 bg-world-cup-gold text-gray-800 rounded-full text-sm font-medium"
          >
            {{ player }}
          </span>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-green-600 mb-3">优势</h3>
        <p class="text-gray-700">{{ teamData.strength }}</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-red-600 mb-3">劣势</h3>
        <p class="text-gray-700">{{ teamData.weakness }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { teamStats } from '../data/worldCupData'

const selectedTeam = ref('阿根廷')
const filteredTeams = computed(() => Object.keys(teamStats))
const teamData = computed(() => teamStats[selectedTeam.value])
</script>
