<template>
  <div class="animate-fade-in">
    <div class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">欢迎来到物业监管平台</h1>
            <p class="text-primary-200">实时了解小区服务动态，共建美好家园</p>
          </div>
          <div class="mt-6 md:mt-0 flex items-center space-x-4">
            <button @click="$emit('navigate', 'complaint')" class="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-2">
              <FileText class="w-5 h-5" />
              <span>提交投诉</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-gray-500 text-sm">小区服务评分</p>
              <div class="flex items-baseline mt-2">
                <span class="text-4xl font-bold text-primary-600">{{ score }}</span>
                <span class="text-gray-400 ml-1">/5.0</span>
              </div>
            </div>
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Star class="w-8 h-8 text-primary-500" />
            </div>
          </div>
          <div class="flex space-x-1">
            <Star v-for="i in 5" :key="i" :class="['w-5 h-5', i <= Math.floor(score) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200']" />
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">卫生</p>
                <p class="font-semibold text-gray-800">{{ scoreDetails.hygiene }}</p>
              </div>
              <div>
                <p class="text-gray-500">维修</p>
                <p class="font-semibold text-gray-800">{{ scoreDetails.maintenance }}</p>
              </div>
              <div>
                <p class="text-gray-500">安保</p>
                <p class="font-semibold text-gray-800">{{ scoreDetails.security }}</p>
              </div>
              <div>
                <p class="text-gray-500">服务</p>
                <p class="font-semibold text-gray-800">{{ scoreDetails.service }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-gray-500 text-sm">投诉趋势</p>
              <p class="text-xl font-bold text-gray-800 mt-2">近6个月</p>
            </div>
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingUp class="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div class="chart-container h-40">
            <canvas ref="trendChart"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-gray-500 text-sm">费用公示状态</p>
              <p class="text-xl font-bold text-gray-800 mt-2">最新更新: {{ financeStatus.lastUpdate }}</p>
            </div>
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet class="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">物业费收缴率</span>
                <span class="font-semibold text-gray-800">{{ financeStatus.collectionRate }}%</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500 rounded-full transition-all duration-500" :style="{ width: financeStatus.collectionRate + '%' }"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-green-50 rounded-lg p-3">
                <p class="text-green-600 text-sm">公共收益</p>
                <p class="text-xl font-bold text-green-700">{{ formatMoney(financeStatus.publicIncome) }}</p>
              </div>
              <div class="bg-blue-50 rounded-lg p-3">
                <p class="text-blue-600 text-sm">公共支出</p>
                <p class="text-xl font-bold text-blue-700">{{ formatMoney(financeStatus.publicExpense) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <button @click="$emit('navigate', 'finance')" class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-lg group">
          <Wallet class="w-10 h-10 mb-3 mx-auto group-hover:scale-110 transition-transform" />
          <h3 class="font-semibold">费用透明</h3>
          <p class="text-blue-100 text-sm mt-1">查看收支明细</p>
        </button>
        <button @click="$emit('navigate', 'complaint')" class="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all hover:shadow-lg group">
          <MessageSquare class="w-10 h-10 mb-3 mx-auto group-hover:scale-110 transition-transform" />
          <h3 class="font-semibold">投诉中心</h3>
          <p class="text-red-100 text-sm mt-1">提交投诉建议</p>
        </button>
        <button @click="$emit('navigate', 'service')" class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg group">
          <ClipboardList class="w-10 h-10 mb-3 mx-auto group-hover:scale-110 transition-transform" />
          <h3 class="font-semibold">服务记录</h3>
          <p class="text-green-100 text-sm mt-1">查看服务履约</p>
        </button>
        <button @click="$emit('navigate', 'dashboard')" class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all hover:shadow-lg group">
          <BarChart3 class="w-10 h-10 mb-3 mx-auto group-hover:scale-110 transition-transform" />
          <h3 class="font-semibold">监管看板</h3>
          <p class="text-purple-100 text-sm mt-1">数据分析统计</p>
        </button>
      </div>

      <div class="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">最新投诉动态</h2>
        <div class="space-y-4">
          <div v-for="complaint in latestComplaints" :key="complaint.id" class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              complaint.status === 'completed' ? 'bg-green-100' : complaint.status === 'processing' ? 'bg-yellow-100' : 'bg-red-100'
            ]">
              <AlertCircle :class="[
                'w-5 h-5',
                complaint.status === 'completed' ? 'text-green-600' : complaint.status === 'processing' ? 'text-yellow-600' : 'text-red-600'
              ]" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <span :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  complaint.status === 'completed' ? 'bg-green-100 text-green-700' : complaint.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                ]">
                  {{ getStatusText(complaint.status) }}
                </span>
                <span class="text-xs text-gray-400">{{ complaint.type }}</span>
              </div>
              <p class="text-gray-700 text-sm line-clamp-2">{{ complaint.description }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ complaint.createdAt }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import { Star, TrendingUp, Wallet, FileText, MessageSquare, ClipboardList, BarChart3, AlertCircle } from 'lucide-vue-next';
import { mockData } from '../data/mockData.js';
Chart.register(...registerables);
const trendChart = ref(null);
const score = mockData.score;
const scoreDetails = mockData.scoreDetails;
const financeStatus = mockData.financeStatus;
const complaintTrend = mockData.complaintTrend;
const latestComplaints = mockData.complaints.slice(0, 3);
defineEmits(['navigate']);
const formatMoney = (amount) => {
 return '¥' + amount.toLocaleString();
};
const getStatusText = (status) => {
 const map = {
 pending: '待处理',
 processing: '处理中',
 completed: '已完成'
 };
 return map[status] || status;
};
onMounted(() => {
 if (trendChart.value) {
 new Chart(trendChart.value, {
 type: 'line',
 data: {
 labels: complaintTrend.map(item => item.month),
 datasets: [{
 label: '投诉数量',
 data: complaintTrend.map(item => item.count),
 borderColor: '#ef4444',
 backgroundColor: 'rgba(239, 68, 68, 0.1)',
 fill: true,
 tension: 0.4,
 pointBackgroundColor: '#ef4444',
 pointBorderColor: '#fff',
 pointBorderWidth: 2,
 pointRadius: 4,
 pointHoverRadius: 6
 }]
 },
 options: {
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: {
 display: false
 }
 },
 scales: {
 x: {
 grid: {
 display: false
 }
 },
 y: {
 beginAtZero: true,
 grid: {
 color: 'rgba(0, 0, 0, 0.05)'
 }
 }
 }
 }
 });
 }
});
</script>
