<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-2xl font-bold text-world-cup-blue mb-6">小组赛结果</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(teams, group) in groups" :key="group" class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-world-cup-red mb-3 text-center">Group {{ group }}</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-gray-600">
              <th class="text-left py-2">球队</th>
              <th class="text-center py-2">P</th>
              <th class="text-center py-2">W</th>
              <th class="text-center py-2">D</th>
              <th class="text-center py-2">L</th>
              <th class="text-center py-2">GD</th>
              <th class="text-center py-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in sortedGroups[group]" :key="team.code" :class="getRowClass(team, teams)">
              <td class="py-2 font-medium">{{ team.team }}</td>
              <td class="text-center">{{ team.played }}</td>
              <td class="text-center text-green-600">{{ team.won }}</td>
              <td class="text-center text-yellow-600">{{ team.drawn }}</td>
              <td class="text-center text-red-600">{{ team.lost }}</td>
              <td class="text-center" :class="team.goalDiff >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ team.goalDiff >= 0 ? '+' : '' }}{{ team.goalDiff }}
              </td>
              <td class="text-center font-bold text-world-cup-blue">{{ team.points }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <span class="text-green-600 font-medium">{{ sortedGroups[group][0].team }}</span> 小组第一
          <span class="ml-2 text-blue-600 font-medium">{{ sortedGroups[group][1].team }}</span> 小组第二
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { groups } from '../data/worldCupData'

const sortedGroups = computed(() => {
  const result = {}
  Object.keys(groups).forEach(group => {
    result[group] = [...groups[group]].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.goalDiff - a.goalDiff
    })
  })
  return result
})

const getRowClass = (team, groupTeams) => {
  const sorted = [...groupTeams].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff)
  const index = sorted.findIndex(t => t.code === team.code)
  if (index === 0) return 'bg-green-50 font-semibold'
  if (index === 1) return 'bg-blue-50 font-semibold'
  return ''
}
</script>
