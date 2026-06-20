<template>
  <div class="animate-fade-in">
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl font-bold text-gray-800">服务记录</h1>
        <p class="text-gray-500 mt-1">查看物业公司服务履约记录与信用评分</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white mb-8">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div>
            <p class="text-primary-200 text-sm">物业公司信用评分</p>
            <div class="flex items-baseline mt-2">
              <span class="text-5xl font-bold">{{ creditScore.score }}</span>
              <span class="text-primary-100 ml-2">/100</span>
            </div>
            <div class="flex items-center space-x-2 mt-2">
              <span :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                creditScore.level === '优秀' ? 'bg-green-500/30 text-green-100' :
                creditScore.level === '良好' ? 'bg-yellow-500/30 text-yellow-100' :
                'bg-red-500/30 text-red-100'
              ]">
                {{ creditScore.level }}
              </span>
              <p class="text-primary-100">{{ creditScore.evaluation }}</p>
            </div>
          </div>
          <div class="mt-6 md:mt-0">
            <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Award class="w-12 h-12" />
            </div>
          </div>
        </div>
        <div class="mt-6 pt-6 border-t border-white/20">
          <h3 class="text-sm font-medium mb-4">评分详情</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="item in creditScore.details" :key="item.name" class="bg-white/10 rounded-lg p-3">
              <p class="text-xs text-primary-200">{{ item.name }}</p>
              <p class="text-xl font-bold mt-1">{{ item.score }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                <ClipboardList class="w-5 h-5 mr-2 text-primary-500" />
                服务履约记录
              </h2>
              <select v-model="filterType" class="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                <option value="">全部类型</option>
                <option v-for="type in serviceTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div class="space-y-4">
              <div v-for="service in filteredServices" :key="service.id" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span :class="[
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        service.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      ]">
                        {{ service.status === 'completed' ? '已完成' : '进行中' }}
                      </span>
                      <span class="text-xs text-gray-500">{{ service.serviceType }}</span>
                    </div>
                    <h3 class="font-medium text-gray-800">{{ service.title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ service.description }}</p>
                    <div class="flex items-center space-x-4 mt-3">
                      <span class="text-sm text-gray-400">{{ service.completedAt || '预计完成时间待定' }}</span>
                      <div v-if="service.rating" class="flex items-center space-x-1">
                        <Star v-for="i in 5" :key="i" :class="['w-4 h-4', i <= Math.floor(service.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200']" />
                        <span class="text-sm text-gray-600 ml-1">{{ service.rating }}</span>
                      </div>
                    </div>
                  </div>
                  <div :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    service.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                  ]">
                    <CheckCircle v-if="service.status === 'completed'" class="w-6 h-6 text-green-600" />
                    <Clock v-else class="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Star class="w-5 h-5 mr-2 text-yellow-500" />
              服务评价统计
            </h2>
            <div class="chart-container h-48">
              <canvas ref="ratingChart"></canvas>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">服务类型分布</h3>
            <div class="chart-container h-48">
              <canvas ref="typeChart"></canvas>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">服务概览</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClipboardList class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">总服务项</p>
                    <p class="font-semibold text-gray-800">{{ serviceRecords.length }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">已完成</p>
                    <p class="font-semibold text-gray-800">{{ completedServices }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock class="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">进行中</p>
                    <p class="font-semibold text-gray-800">{{ pendingServices }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star class="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">平均评分</p>
                    <p class="font-semibold text-gray-800">{{ averageRating }}</p>
                  </div>
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
import { Award, ClipboardList, Star, CheckCircle, Clock } from 'lucide-vue-next'
import { mockData } from '../data/mockData.js'

Chart.register(...registerables)

const ratingChart = ref(null)
const typeChart = ref(null)

const creditScore = mockData.creditScore
const serviceRecords = mockData.serviceRecords
const serviceTypes = [...new Set(serviceRecords.map(s => s.serviceType))]

const filterType = ref('')

const filteredServices = computed(() => {
  if (!filterType.value) return serviceRecords
  return serviceRecords.filter(s => s.serviceType === filterType.value)
})

const completedServices = computed(() => serviceRecords.filter(s => s.status === 'completed').length)
const pendingServices = computed(() => serviceRecords.filter(s => s.status === 'pending').length)
const averageRating = computed(() => {
  const rated = serviceRecords.filter(s => s.rating)
  if (rated.length === 0) return 'N/A'
  return (rated.reduce((sum, s) => sum + s.rating, 0) / rated.length).toFixed(1)
})

onMounted(() => {
  if (ratingChart.value) {
    const ratingCounts = [0, 0, 0, 0, 0]
    serviceRecords.forEach(s => {
      if (s.rating) {
        const index = Math.floor(s.rating) - 1
        if (index >= 0 && index < 5) {
          ratingCounts[index]++
        }
      }
    })
    
    new Chart(ratingChart.value, {
      type: 'bar',
      data: {
        labels: ['1星', '2星', '3星', '4星', '5星'],
        datasets: [{
          label: '评价数量',
          data: ratingCounts,
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    })
  }

  if (typeChart.value) {
    const typeCounts = serviceTypes.map(type => 
      serviceRecords.filter(s => s.serviceType === type).length
    )
    
    new Chart(typeChart.value, {
      type: 'doughnut',
      data: {
        labels: serviceTypes,
        datasets: [{
          data: typeCounts,
          backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 10, usePointStyle: true }
          }
        },
        cutout: '60%'
      }
    })
  }
})
</script>
