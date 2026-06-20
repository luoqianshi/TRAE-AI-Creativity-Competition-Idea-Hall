<template>
  <div class="animate-fade-in">
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl font-bold text-gray-800">监管看板</h1>
        <p class="text-gray-500 mt-1">面向街道/社区的投诉热力图与数据统计</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">总投诉数</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">{{ dashboardStats.totalComplaints }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">已解决</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ dashboardStats.resolvedComplaints }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">解决率</p>
              <p class="text-3xl font-bold text-blue-600 mt-2">{{ dashboardStats.resolutionRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">满意度</p>
              <p class="text-3xl font-bold text-yellow-600 mt-2">{{ dashboardStats.satisfactionRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin class="w-5 h-5 mr-2 text-red-500" />
            投诉热力图
          </h2>
          <div class="relative h-80 bg-gray-50 rounded-lg overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="relative w-full h-full p-8">
                <div class="grid grid-cols-4 grid-rows-2 gap-4 w-full h-full">
                  <div v-for="item in heatmapData" :key="item.district" 
                    :class="[
                      'rounded-lg flex items-center justify-center text-white font-medium transition-all duration-300',
                      getHeatColor(item.count)
                    ]"
                    :style="{ opacity: Math.min(item.count / maxComplaintCount, 1) }">
                    <div class="text-center">
                      <p>{{ item.district }}</p>
                      <p class="text-xl">{{ item.count }}件</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-lg shadow-sm">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">投诉密度:</span>
                <div class="flex items-center space-x-1">
                  <div class="w-4 h-4 rounded bg-green-400"></div>
                  <span class="text-xs text-gray-600">低</span>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-4 h-4 rounded bg-yellow-400"></div>
                  <span class="text-xs text-gray-600">中</span>
                </div>
                <div class="flex items-center space-x-1">
                  <div class="w-4 h-4 rounded bg-red-500"></div>
                  <span class="text-xs text-gray-600">高</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock class="w-5 h-5 mr-2 text-gray-600" />
            实时数据
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span class="text-gray-700">待处理投诉</span>
              </div>
              <span class="text-xl font-bold text-red-600">{{ dashboardStats.pendingCount }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center space-x-2">
                <Activity class="w-5 h-5 text-blue-600" />
                <span class="text-gray-700">平均响应时间</span>
              </div>
              <span class="text-xl font-bold text-blue-600">{{ dashboardStats.avgResponseTime }}</span>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <h3 class="text-sm font-medium text-gray-600 mb-3">投诉类型分布</h3>
            <div class="space-y-3">
              <div v-for="item in complaintTypeStats" :key="item.type" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ item.type }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500 rounded-full" :style="{ width: item.percentage + '%' }"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-800 w-12 text-right">{{ item.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp class="w-5 h-5 mr-2 text-gray-600" />
            月度投诉趋势
          </h2>
          <div class="chart-container">
            <canvas ref="trendChart"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Trophy class="w-5 h-5 mr-2 text-yellow-500" />
            物业公司排行榜
          </h2>
          <div class="space-y-3">
            <div v-for="item in companyRanking" :key="item.rank" 
              :class="[
                'flex items-center justify-between p-3 rounded-lg',
                item.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
              ]">
              <div class="flex items-center space-x-3">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                  item.rank === 1 ? 'bg-yellow-400 text-white' :
                  item.rank === 2 ? 'bg-gray-300 text-white' :
                  item.rank === 3 ? 'bg-orange-400 text-white' :
                  'bg-gray-100 text-gray-600'
                ]">
                  {{ item.rank }}
                </div>
                <span class="font-medium text-gray-800">{{ item.name }}</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p class="text-sm text-gray-500">评分</p>
                  <p class="font-semibold text-primary-600">{{ item.score }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">投诉</p>
                  <p class="font-semibold" :class="item.complaints < 20 ? 'text-green-600' : 'text-red-600'">{{ item.complaints }}件</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { AlertTriangle, CheckCircle, TrendingUp, Star, MapPin, Clock, Activity, Trophy } from 'lucide-vue-next'
import { mockData } from '../data/mockData.js'

Chart.register(...registerables)

const trendChart = ref(null)

const dashboardStats = mockData.dashboardStats
const heatmapData = mockData.heatmapData
const monthlyStats = mockData.monthlyStats
const complaintTypeStats = mockData.complaintTypeStats
const companyRanking = mockData.companyRanking

const maxComplaintCount = computed(() => Math.max(...heatmapData.map(item => item.count)))

const getHeatColor = (count) => {
  const ratio = count / maxComplaintCount.value
  if (ratio > 0.7) return 'bg-gradient-to-br from-red-500 to-red-700'
  if (ratio > 0.4) return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
  return 'bg-gradient-to-br from-green-400 to-green-600'
}

onMounted(() => {
  if (trendChart.value) {
    new Chart(trendChart.value, {
      type: 'line',
      data: {
        labels: monthlyStats.map(item => item.month),
        datasets: [
          {
            label: '投诉数',
            data: monthlyStats.map(item => item.complaints),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: '已解决',
            data: monthlyStats.map(item => item.resolved),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    })
  }
})
</script>
