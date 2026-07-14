<template>
  <div class="report-page">
    <div class="page-header">
      <h1 class="header-title">资产报表</h1>
    </div>

    <div class="period-tabs">
      <button
        v-for="period in periods"
        :key="period.value"
        class="period-tab"
        :class="{ active: currentPeriod === period.value }"
        @click="currentPeriod = period.value"
      >
        {{ period.label }}
      </button>
    </div>

    <div class="summary-section">
      <div class="summary-card">
        <div class="summary-item">
          <span class="summary-icon">📥</span>
          <div class="summary-info">
            <span class="summary-label">总收入</span>
            <span class="summary-value income">+{{ formatMoney(statistics.income.total) }}</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">📤</span>
          <div class="summary-info">
            <span class="summary-label">总支出</span>
            <span class="summary-value expense">-{{ formatMoney(statistics.expense.total) }}</span>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">📈</span>
          <div class="summary-info">
            <span class="summary-label">净收益</span>
            <span class="summary-value" :class="statistics.netIncome >= 0 ? 'income' : 'expense'">
              {{ statistics.netIncome >= 0 ? '+' : '' }}{{ formatMoney(statistics.netIncome) }}
            </span>
          </div>
        </div>
        <div class="summary-item">
          <span class="summary-icon">💎</span>
          <div class="summary-info">
            <span class="summary-label">利息收入</span>
            <span class="summary-value income">+{{ formatMoney(statistics.interest) }}</span>
          </div>
        </div>
        <div class="summary-item total">
          <span class="summary-icon">🏦</span>
          <div class="summary-info">
            <span class="summary-label">期末余额</span>
            <span class="summary-value total">{{ formatMoney(statistics.finalBalance) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h2 class="section-title">趋势走势图</h2>
      <div class="chart-container">
        <LineChart :data="chartData" :labels="chartLabels" color="#0ea5e9" />
      </div>
    </div>

    <div class="breakdown-section">
      <h2 class="section-title">账户明细</h2>
      <div class="breakdown-grid">
        <div class="breakdown-card wealth">
          <div class="breakdown-header">
            <span class="breakdown-icon">💰</span>
            <span class="breakdown-name">财富账户</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">收入</span>
            <span class="row-value income">+{{ formatMoney(statistics.income.wealth) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">支出</span>
            <span class="row-value expense">-{{ formatMoney(statistics.expense.wealth) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">余额</span>
            <span class="row-value total">{{ formatMoney(balance.wealth) }}</span>
          </div>
        </div>

        <div class="breakdown-card health">
          <div class="breakdown-header">
            <span class="breakdown-icon">❤️</span>
            <span class="breakdown-name">健康账户</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">收入</span>
            <span class="row-value income">+{{ formatMoney(statistics.income.health) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">支出</span>
            <span class="row-value expense">-{{ formatMoney(statistics.expense.health) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">余额</span>
            <span class="row-value total">{{ formatMoney(balance.health) }}</span>
          </div>
        </div>

        <div class="breakdown-card emotion">
          <div class="breakdown-header">
            <span class="breakdown-icon">💝</span>
            <span class="breakdown-name">情感账户</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">收入</span>
            <span class="row-value income">+{{ formatMoney(statistics.income.emotion) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">支出</span>
            <span class="row-value expense">-{{ formatMoney(statistics.expense.emotion) }}</span>
          </div>
          <div class="breakdown-row">
            <span class="row-label">余额</span>
            <span class="row-value total">{{ formatMoney(balance.emotion) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-space"></div>
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storage } from '@/utils/storage'
import { calculator } from '@/utils/calculator'
import type { AccountBalance, Transaction, DailySettlement } from '@/types'
import LineChart from '@/components/LineChart.vue'
import TabBar from '@/components/TabBar.vue'

const balance = ref<AccountBalance>(storage.getAccountBalance() || { wealth: 0, health: 0, emotion: 0, total: 0 })
const transactions = ref<Transaction[]>(storage.getTransactions())
const settlements = ref<DailySettlement[]>(storage.getDailySettlements())

const periods = [
  { label: '今日', value: 'today' as const },
  { label: '本周', value: 'week' as const },
  { label: '本月', value: 'month' as const }
]

const currentPeriod = ref<'today' | 'week' | 'month'>('today')

const statistics = computed(() => {
  return calculator.calculateStatistics(
    transactions.value,
    settlements.value,
    balance.value,
    currentPeriod.value
  )
})

const chartData = computed(() => {
  const result = calculator.calculateDailyChanges(
    transactions.value,
    settlements.value,
    currentPeriod.value
  )
  return result.data
})

const chartLabels = computed(() => {
  const result = calculator.calculateDailyChanges(
    transactions.value,
    settlements.value,
    currentPeriod.value
  )
  return result.labels
})

function formatMoney(val: number): string {
  return val.toFixed(2)
}

onMounted(() => {
  balance.value = storage.getAccountBalance() || { wealth: 0, health: 0, emotion: 0, total: 0 }
  transactions.value = storage.getTransactions()
  settlements.value = storage.getDailySettlements()
})
</script>

<style scoped>
.report-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 20px;
  padding-top: calc(24px + env(safe-area-inset-top));
}

.header-title {
  font-size: 22px;
  font-weight: 600;
  color: white;
}

.period-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: white;
}

.period-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
}

.period-tab.active {
  background: #0ea5e9;
  color: white;
}

.summary-section,
.chart-section,
.breakdown-section {
  padding: 0 20px;
  margin-top: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  padding-top: 16px;
}

.summary-icon {
  font-size: 24px;
  margin-right: 12px;
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
}

.summary-value.income {
  color: #10b981;
}

.summary-value.expense {
  color: #ef4444;
}

.summary-value.total {
  color: #0ea5e9;
  font-size: 24px;
}

.chart-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.breakdown-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid;
}

.breakdown-card.wealth {
  border-color: #f59e0b;
}

.breakdown-card.health {
  border-color: #10b981;
}

.breakdown-card.emotion {
  border-color: #ec4899;
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.breakdown-icon {
  font-size: 18px;
}

.breakdown-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.row-label {
  font-size: 13px;
  color: #6b7280;
}

.row-value {
  font-size: 14px;
  font-weight: 500;
}

.row-value.income {
  color: #10b981;
}

.row-value.expense {
  color: #ef4444;
}

.row-value.total {
  color: #1f2937;
  font-weight: 600;
}

.bottom-space {
  height: 20px;
}
</style>
