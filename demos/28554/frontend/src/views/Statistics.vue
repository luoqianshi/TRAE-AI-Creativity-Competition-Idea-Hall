<template>
  <div class="page statistics-page">
    <!-- 筛选栏 -->
    <van-cell-group inset class="filter-section">
      <van-field
        v-model="selectedOrgName"
        is-link
        readonly
        label="机构"
        placeholder="全部"
        @click="showOrgPicker = true"
      />
      <van-field
        v-model="selectedClassName"
        is-link
        readonly
        label="班级"
        placeholder="全部"
        @click="showClassPicker = true"
      />
    </van-cell-group>

    <!-- 按类目统计 -->
    <div class="card category-stats">
      <div class="card-header">
        <van-icon name="apps-o" size="18" />
        <span class="card-title">按类目统计</span>
      </div>
      <div v-if="categoryStats.length === 0" class="empty-state">
        <van-empty description="暂无数据" />
      </div>
      <div v-else class="stats-list">
        <div
          v-for="stat in categoryStats"
          :key="stat.name"
          class="stat-item"
        >
          <div class="stat-header">
            <span class="stat-name">{{ stat.name }}</span>
            <span class="stat-amount">{{ formatAmount(stat.total) }}</span>
          </div>
          <div class="stat-bar">
            <div
              class="stat-progress"
              :style="{ width: stat.percentage + '%', backgroundColor: stat.color }"
            />
            <span class="stat-percentage">{{ stat.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 按状态统计 -->
    <div class="card status-stats">
      <div class="card-header">
        <van-icon name="balance-list-o" size="18" />
        <span class="card-title">按状态统计</span>
      </div>
      <div v-if="statusStats.length === 0" class="empty-state">
        <van-empty description="暂无数据" />
      </div>
      <div v-else class="status-cards">
        <div
          v-for="stat in statusStats"
          :key="stat.name"
          class="status-card"
          :style="{ borderColor: getStatusColor(stat.name) }"
        >
          <div class="status-name">{{ stat.name }}</div>
          <div class="status-amount" :style="{ color: getStatusColor(stat.name) }">
            {{ formatAmount(stat.total) }}
          </div>
          <div class="status-percentage">{{ stat.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- 按班级统计 -->
    <div class="card class-stats">
      <div class="card-header">
        <van-icon name="friends-o" size="18" />
        <span class="card-title">按班级统计</span>
      </div>
      <div v-if="classStats.length === 0" class="empty-state">
        <van-empty description="暂无数据" />
      </div>
      <div v-else class="class-list">
        <div
          v-for="stat in classStats"
          :key="stat.id"
          class="class-item"
        >
          <div class="class-info">
            <div class="class-name">{{ stat.name }}</div>
            <div class="class-total">{{ formatAmount(stat.total) }}</div>
          </div>
          <div class="class-bar">
            <div
              class="class-progress"
              :style="{ width: getPercentage(stat.total) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { statsApi } from '@/api'
import type { CategoryStats, StatusStats, ClassStats } from '@/types'
import { formatAmount, getStatusColor } from '@/utils'

const appStore = useAppStore()

const categoryStats = ref<CategoryStats[]>([])
const statusStats = ref<StatusStats[]>([])
const classStats = ref<ClassStats[]>([])

const selectedOrgName = computed(() => {
  if (!appStore.selectedOrgId) return ''
  const org = appStore.organizations.find(o => o.id === appStore.selectedOrgId)
  return org?.name || ''
})

const selectedClassName = computed(() => {
  if (!appStore.selectedClassId) return ''
  const cls = appStore.classes.find(c => c.id === appStore.selectedClassId)
  return cls?.name || ''
})

const showOrgPicker = ref(false)
const showClassPicker = ref(false)

// 计算班级统计的百分比（相对于总费用）
const getPercentage = (classTotal: number): number => {
  if (classStats.value.length === 0) return 0
  const total = classStats.value.reduce((sum, stat) => sum + stat.total, 0)
  return total > 0 ? Math.round((classTotal / total) * 100) : 0
}

const loadStats = async () => {
  try {
    const params: any = {}
    if (appStore.selectedOrgId) params.org_id = appStore.selectedOrgId
    if (appStore.selectedClassId) params.class_id = appStore.selectedClassId

    const res = await statsApi.getOverview(params)

    if (res.code === 200) {
      categoryStats.value = res.data.categoryStats
      statusStats.value = res.data.statusStats
      classStats.value = res.data.classStats
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

watch(
  () => [appStore.selectedOrgId, appStore.selectedClassId],
  () => {
    loadStats()
  }
)

onMounted(async () => {
  await appStore.initData()
  await loadStats()
})
</script>

<style scoped>
.statistics-page {
  padding-bottom: 70px;
}

.filter-section {
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.card {
  margin: 12px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebedf0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.empty-state {
  padding: 40px 0;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-name {
  font-size: 14px;
  color: #323233;
}

.stat-amount {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.stat-bar {
  position: relative;
  height: 20px;
  background: #ebedf0;
  border-radius: 10px;
  overflow: hidden;
}

.stat-progress {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.stat-percentage {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #969799;
  z-index: 1;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.status-card {
  padding: 16px;
  border: 2px solid;
  border-radius: 8px;
  text-align: center;
}

.status-name {
  font-size: 14px;
  color: #969799;
  margin-bottom: 8px;
}

.status-amount {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-percentage {
  font-size: 12px;
  color: #969799;
}

/* 班级统计样式 */
.class-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.class-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-name {
  font-size: 14px;
  color: #323233;
}

.class-total {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.class-bar {
  position: relative;
  height: 16px;
  background: #ebedf0;
  border-radius: 8px;
  overflow: hidden;
}

.class-progress {
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, #1989fa, #07c160);
  transition: width 0.3s ease;
}
</style>
