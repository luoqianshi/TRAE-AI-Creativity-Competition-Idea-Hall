<template>
  <div class="page logs-page">
    <div class="log-list">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group inset v-for="log in logs" :key="log.id" class="log-item">
          <van-cell>
            <template #title>
              <div class="log-operation">{{ log.operation }}</div>
            </template>
            <template #label>
              <div class="log-info">
                <div class="log-operator">
                  <van-icon name="user-o" size="14" />
                  <span>{{ log.operator }}</span>
                </div>
                <div class="log-time">
                  <van-icon name="clock-o" size="14" />
                  <span>{{ formatDate(log.created_at, 'YYYY-MM-DD HH:mm:ss') }}</span>
                </div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>

        <div v-if="logs.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无操作日志" />
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { logApi } from '@/api'
import type { OperationLog } from '@/types'
import { formatDate } from '@/utils'

const logs = ref<OperationLog[]>([])
const loading = ref(false)
const finished = ref(false)
const pageSize = 30

const loadData = async () => {
  try {
    const res = await logApi.getAll({ limit: pageSize })
    if (res.code === 200) {
      logs.value = res.data
      finished.value = true
    }
  } catch (error) {
    console.error('加载操作日志失败:', error)
  } finally {
    loading.value = false
  }
}

const onLoad = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.logs-page {
  padding-bottom: 70px;
}

.log-list {
  padding: 12px 0;
}

.log-item {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.log-item .van-cell {
  padding: 12px 16px;
}

.log-operation {
  font-size: 14px;
  color: #323233;
  margin-bottom: 8px;
}

.log-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-operator,
.log-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
}

.empty-state {
  padding: 40px 0;
}
</style>
