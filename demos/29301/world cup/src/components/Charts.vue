<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-2xl font-bold text-world-cup-blue mb-6">数据可视化</h2>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-700 mb-4">各队积分分布</h3>
        <div class="h-64">
          <Bar :data="pointsChartData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-700 mb-4">冠军次数统计</h3>
        <div class="h-64">
          <Doughnut :data="titlesChartData" :options="doughnutOptions" />
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-700 mb-4">球队年龄分布</h3>
        <div class="h-64">
          <HorizontalBar :data="ageChartData" :options="horizontalOptions" />
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-700 mb-4">进攻效率对比</h3>
        <div class="h-64">
          <Radar :data="radarChartData" :options="radarOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar, Doughnut, HorizontalBar, Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
)

import { groups, teamStats } from '../data/worldCupData'

const pointsChartData = computed(() => {
  const teams = []
  const points = []
  Object.values(groups).forEach(group => {
    group.forEach(team => {
      teams.push(team.team)
      points.push(team.points)
    })
  })
  return {
    labels: teams,
    datasets: [{
      label: '积分',
      data: points,
      backgroundColor: 'rgba(30, 58, 95, 0.8)',
      borderColor: 'rgba(30, 58, 95, 1)',
      borderWidth: 1
    }]
  }
})

const titlesChartData = computed(() => {
  const titleCounts = {}
  Object.values(teamStats).forEach(stats => {
    if (stats.worldCupTitles > 0) {
      const teamName = Object.keys(teamStats).find(key => teamStats[key] === stats)
      titleCounts[teamName] = stats.worldCupTitles
    }
  })
  return {
    labels: Object.keys(titleCounts),
    datasets: [{
      data: Object.values(titleCounts),
      backgroundColor: [
        '#D4AF37',
        '#C0C0C0',
        '#CD7F32',
        '#1e3a5f',
        '#c8102e',
        '#228B22',
        '#8B4513'
      ],
      borderWidth: 2
    }]
  }
})

const ageChartData = computed(() => {
  const teams = []
  const ages = []
  Object.entries(teamStats).forEach(([name, stats]) => {
    teams.push(name)
    ages.push(stats.avgAge)
  })
  return {
    labels: teams,
    datasets: [{
      label: '平均年龄',
      data: ages,
      backgroundColor: 'rgba(212, 175, 55, 0.8)',
      borderColor: 'rgba(212, 175, 55, 1)',
      borderWidth: 1
    }]
  }
})

const radarChartData = computed(() => {
  const topTeams = ['阿根廷', '巴西', '法国', '英格兰', '西班牙', '葡萄牙']
  return {
    labels: ['进攻能力', '防守稳固', '中场控制', '大赛经验', '阵容深度', '状态稳定性'],
    datasets: topTeams.map((team, index) => ({
      label: team,
      data: [
        Math.random() * 30 + 70,
        Math.random() * 30 + 70,
        Math.random() * 30 + 70,
        Math.random() * 30 + 70,
        Math.random() * 30 + 70,
        Math.random() * 30 + 70
      ],
      backgroundColor: [
        'rgba(26, 188, 156, 0.2)',
        'rgba(52, 152, 219, 0.2)',
        'rgba(155, 89, 182, 0.2)',
        'rgba(231, 76, 60, 0.2)',
        'rgba(241, 196, 15, 0.2)',
        'rgba(46, 204, 113, 0.2)'
      ][index],
      borderColor: [
        'rgba(26, 188, 156, 1)',
        'rgba(52, 152, 219, 1)',
        'rgba(155, 89, 182, 1)',
        'rgba(231, 76, 60, 1)',
        'rgba(241, 196, 15, 1)',
        'rgba(46, 204, 113, 1)'
      ][index],
      borderWidth: 2
    }))
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 10
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    }
  }
}

const horizontalOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      max: 35
    }
  }
}

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 100
    }
  }
}
</script>
