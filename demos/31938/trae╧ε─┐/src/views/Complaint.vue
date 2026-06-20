<template>
  <div class="animate-fade-in">
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl font-bold text-gray-800">投诉中心</h1>
        <p class="text-gray-500 mt-1">一键拍照投诉，实时跟踪处理进度</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText class="w-5 h-5 mr-2 text-primary-500" />
              提交投诉
            </h2>
            <form @submit.prevent="submitComplaint" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">投诉类型</label>
                <select v-model="form.type" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">请选择投诉类型</option>
                  <option v-for="type in complaintTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">投诉描述</label>
                <textarea v-model="form.description" rows="4" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="请详细描述您的问题..."></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">上传图片（可选）</label>
                <div class="flex items-center space-x-4">
                  <label class="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                    <Camera class="w-5 h-5 text-gray-600" />
                    <span class="text-sm text-gray-700">拍照/上传</span>
                    <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                  </label>
                  <div v-if="form.images.length > 0" class="flex space-x-2">
                    <div v-for="(img, index) in form.images" :key="index" class="relative">
                      <img :src="img" class="w-16 h-16 object-cover rounded-lg" />
                      <button type="button" @click="removeImage(index)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2">
                <Send class="w-5 h-5" />
                <span>提交投诉</span>
              </button>
            </form>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                <History class="w-5 h-5 mr-2 text-gray-600" />
                投诉历史
              </h2>
              <select v-model="filterStatus" class="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                <option value="">全部状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
            <div class="space-y-4">
              <div v-for="complaint in filteredComplaints" :key="complaint.id" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span :class="[
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        complaint.status === 'completed' ? 'bg-green-100 text-green-700' : complaint.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      ]">
                        {{ getStatusText(complaint.status) }}
                      </span>
                      <span class="text-xs text-gray-500">{{ complaint.type }}</span>
                    </div>
                    <p class="text-gray-700">{{ complaint.description }}</p>
                    <div class="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                      <span>{{ complaint.createdAt }}</span>
                      <span v-if="complaint.updatedAt !== complaint.createdAt">更新于 {{ complaint.updatedAt }}</span>
                    </div>
                  </div>
                  <button @click="viewComplaint(complaint)" class="p-2 hover:bg-white rounded-lg transition-colors">
                    <ChevronRight class="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div v-if="complaint.images.length > 0" class="flex space-x-2 mt-3">
                  <img v-for="(img, index) in complaint.images" :key="index" :src="img" class="w-20 h-20 object-cover rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">投诉统计</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-red-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-red-600">{{ complaints.length }}</p>
                <p class="text-sm text-gray-500">总投诉</p>
              </div>
              <div class="bg-yellow-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</p>
                <p class="text-sm text-gray-500">待处理</p>
              </div>
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-blue-600">{{ processingCount }}</p>
                <p class="text-sm text-gray-500">处理中</p>
              </div>
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-green-600">{{ completedCount }}</p>
                <p class="text-sm text-gray-500">已完成</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">投诉类型分布</h3>
            <div class="chart-container h-48">
              <canvas ref="typeChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showDetailModal = false">
      <div class="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold">投诉详情</h3>
          <button @click="showDetailModal = false" class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4" v-if="selectedComplaint">
          <div class="flex items-center space-x-2">
            <span :class="[
              'px-2 py-0.5 rounded-full text-xs font-medium',
              selectedComplaint.status === 'completed' ? 'bg-green-100 text-green-700' : selectedComplaint.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            ]">
              {{ getStatusText(selectedComplaint.status) }}
            </span>
            <span class="text-sm text-gray-500">{{ selectedComplaint.type }}</span>
          </div>
          <p class="text-gray-700">{{ selectedComplaint.description }}</p>
          <div v-if="selectedComplaint.images.length > 0" class="flex space-x-2">
            <img v-for="(img, index) in selectedComplaint.images" :key="index" :src="img" class="w-24 h-24 object-cover rounded-lg" />
          </div>
          <div class="text-sm text-gray-400 space-y-1">
            <p>提交时间: {{ selectedComplaint.createdAt }}</p>
            <p v-if="selectedComplaint.updatedAt !== selectedComplaint.createdAt">更新时间: {{ selectedComplaint.updatedAt }}</p>
          </div>
          <div v-if="selectedComplaint.status === 'completed' && !selectedComplaint.rating" class="border-t border-gray-100 pt-4">
            <p class="text-sm font-medium text-gray-700 mb-3">满意度评价</p>
            <div class="flex items-center space-x-2">
              <button v-for="i in 5" :key="i" @click="submitRating(i)" class="hover:scale-110 transition-transform">
                <Star :class="['w-8 h-8', i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200']" />
              </button>
            </div>
          </div>
          <div v-if="selectedComplaint.rating" class="border-t border-gray-100 pt-4">
            <p class="text-sm text-gray-600">您的评价:</p>
            <div class="flex items-center space-x-1 mt-2">
              <Star v-for="i in 5" :key="i" :class="['w-6 h-6', i <= selectedComplaint.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200']" />
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
import { FileText, Camera, X, Send, History, ChevronRight, Star } from 'lucide-vue-next'
import { mockData } from '../data/mockData.js'

Chart.register(...registerables)

const typeChart = ref(null)
const complaintTypes = mockData.complaintTypes
const complaints = ref([...mockData.complaints])

const form = ref({
  type: '',
  description: '',
  images: []
})

const filterStatus = ref('')
const showDetailModal = ref(false)
const selectedComplaint = ref(null)
const rating = ref(0)

const filteredComplaints = computed(() => {
  if (!filterStatus.value) return complaints.value
  return complaints.value.filter(c => c.status === filterStatus.value)
})

const pendingCount = computed(() => complaints.value.filter(c => c.status === 'pending').length)
const processingCount = computed(() => complaints.value.filter(c => c.status === 'processing').length)
const completedCount = computed(() => complaints.value.filter(c => c.status === 'completed').length)

const getStatusText = (status) => {
  const map = { pending: '待处理', processing: '处理中', completed: '已完成' }
  return map[status] || status
}

const handleImageUpload = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.images.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

const submitComplaint = () => {
  if (!form.value.type || !form.value.description) {
    alert('请填写投诉类型和描述')
    return
  }
  const newComplaint = {
    id: Date.now(),
    type: form.value.type,
    description: form.value.description,
    images: [...form.value.images],
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  }
  complaints.value.unshift(newComplaint)
  form.value = { type: '', description: '', images: [] }
  alert('投诉提交成功')
}

const viewComplaint = (complaint) => {
  selectedComplaint.value = complaint
  rating.value = complaint.rating || 0
  showDetailModal.value = true
}

const submitRating = (score) => {
  rating.value = score
  const index = complaints.value.findIndex(c => c.id === selectedComplaint.value.id)
  if (index !== -1) {
    complaints.value[index].rating = score
    selectedComplaint.value.rating = score
  }
  alert('评价成功')
}

onMounted(() => {
  if (typeChart.value) {
    const typeCounts = complaintTypes.map(type => 
      complaints.value.filter(c => c.type === type).length
    )
    new Chart(typeChart.value, {
      type: 'bar',
      data: {
        labels: complaintTypes,
        datasets: [{
          label: '投诉数量',
          data: typeCounts,
          backgroundColor: '#3b82f6',
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
})
</script>
