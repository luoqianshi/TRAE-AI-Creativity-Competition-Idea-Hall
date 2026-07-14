<template>
  <div class="transaction-list">
    <div
      v-for="item in transactions"
      :key="item.id"
      class="transaction-item"
    >
      <div class="transaction-icon" :class="[`icon-${item.accountType}`]">
        {{ getAccountIcon(item.accountType) }}
      </div>
      <div class="transaction-info">
        <div class="transaction-desc">{{ item.description }}</div>
        <div class="transaction-meta">
          <span class="meta-time">{{ formatTime(item.createdAt) }}</span>
          <span class="meta-hours">{{ item.hours }}小时</span>
        </div>
      </div>
      <div class="transaction-amount" :class="[item.type]">
        {{ item.type === 'income' ? '+' : '-' }}{{ formatMoney(item.amount) }}
      </div>
    </div>
    <div v-if="transactions.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <span class="empty-text">暂无记录</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types'

defineProps<{
  transactions: Transaction[]
}>()

function getAccountIcon(type: string): string {
  const icons: Record<string, string> = {
    wealth: '💰',
    health: '❤️',
    emotion: '💝'
  }
  return icons[type] || '📝'
}

function formatMoney(val: number): string {
  return val.toFixed(2)
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 10px;
  gap: 12px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.icon-wealth {
  background: #fef3c7;
}

.icon-health {
  background: #d1fae5;
}

.icon-emotion {
  background: #fce7f3;
}

.transaction-info {
  flex: 1;
}

.transaction-desc {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.transaction-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
}

.transaction-amount.income {
  color: #10b981;
}

.transaction-amount.expense {
  color: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}
</style>
