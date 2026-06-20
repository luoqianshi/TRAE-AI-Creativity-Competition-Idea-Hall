<template>
  <div class="animate-fade-in">
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl font-bold text-gray-800">费用透明</h1>
        <p class="text-gray-500 mt-1">实时查看物业费收支明细与公共收益流向</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">总收入</p>
              <p class="text-3xl font-bold mt-2">{{ formatMoney(totalIncome) }}</p>
            </div>
            <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp class="w-7 h-7" />
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 text-sm">总支出</p>
              <p class="text-3xl font-bold mt-2">{{ formatMoney(totalExpense) }}</p>
            </div>
            <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingDown class="w-7 h-7" />
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">收支结余</p>
              <p class="text-3xl font-bold mt-2">{{ formatMoney(totalIncome - totalExpense) }}</p>
            </div>
            <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet class="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ArrowUpLeft class="w-5 h-5 mr-2 text-green-500" />
            收入明细
          </h2>
          <div class="space-y-3">
            <div v-for="item in incomeList" :key="item.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-medium text-gray-800">{{ item.category }}</p>
                <p class="text-sm text-gray-500">{{ item.description }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-green-600">+{{ formatMoney(item.amount) }}</p>
                <p class="text-xs text-gray-400">{{ item.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ArrowDownRight class="w-5 h-5 mr-2 text-red-500" />
            支出明细
          </h2>
          <div class="space-y-3">
            <div v-for="item in expenseList" :key="item.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-medium text-gray-800">{{ item.category }}</p>
                <p class="text-sm text-gray-500">{{ item.description }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-red-600">-{{ formatMoney(item.amount) }}</p>
                <p class="text-xs text-gray-400">{{ item.date }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PieChart class="w-5 h-5 mr-2 text-primary-500" />
            收支统计
          </h2>
          <div class="chart-container">
            <canvas ref="financeChart"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Globe class="w-5 h-5 mr-2 text-purple-500" />
            公共收益流向
          </h2>
          <div class="space-y-4">
            <div v-for="(item, index) in publicIncomeFlow" :key="index" class="relative">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">{{ item.source }}</span>
                <span class="text-sm font-semibold text-green-600">+{{ formatMoney(item.amount) }}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500" :style="{ width: (item.amount / maxPublicIncome * 100) + '%' }"></div>
              </div>
              <p class="text-xs text-gray-400 mt-1">用途: {{ item.use }}</p>
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
import { TrendingUp, TrendingDown, Wallet, ArrowUpLeft, ArrowDownRight, PieChart, Globe } from 'lucide-vue-next'
import { mockData } from '../data/mockData.js'

Chart.register(...registerables)

const financeChart = ref(null)
const incomeList = mockData.incomeList
const expenseList = mockData.expenseList
const publicIncomeFlow = mockData.publicIncomeFlow

const totalIncome = computed(() => incomeList.reduce((sum, item) => sum + item.amount, 0))
const totalExpense = computed(() => expenseList.reduce((sum, item) => sum + item.amount, 0))
const maxPublicIncome = computed(() => Math.max(...publicIncomeFlow.map(item => item.amount)))

const formatMoney = (amount) => {
  return '¥' + Math.abs(amount).toLocaleString()
}

onMounted(() => {
  if (financeChart.value) {
    new Chart(financeChart.value, {
      type: 'doughnut',
      data: {
        labels: ['物业费', '公共收益', '其他收入', '人员工资', '设施维护', '水电费用', '其他支出'],
        datasets: [{
          data: [
            incomeList.find(i => i.category === '物业费')?.amount || 0,
            incomeList.find(i => i.category === '公共收益')?.amount || 0,
            incomeList.find(i => i.category === '其他收入')?.amount || 0,
            expenseList.find(i => i.category === '人员工资')?.amount || 0,
            expenseList.find(i => i.category === '公共设施维护')?.amount || 0,
            expenseList.find(i => i.category === '水电费')?.amount || 0,
            expenseList.reduce((sum, i) => ['人员工资', '公共设施维护', '水电费'].includes(i.category) ? sum : sum + i.amount, 0)
          ],
          backgroundColor: [
            '#22c55e', '#10b981', '#84cc16',
            '#ef4444', '#f97316', '#eab308', '#6b7280'
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              usePointStyle: true
            }
          }
        },
        cutout: '60%'
      }
    })
  }
})
</script>
