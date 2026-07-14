<template>
  <div class="home-page">
    <div class="page-header">
      <div class="header-content">
        <div class="greeting">
          <h1 class="greeting-text">{{ greeting }}，心灵旅行者</h1>
          <p class="greeting-date">{{ currentDate }}</p>
        </div>
        <div class="header-avatar">👤</div>
      </div>
    </div>

    <div class="balance-section">
      <div class="total-balance">
        <div class="balance-label">总资产</div>
        <div class="balance-amount">
          <span class="amount-symbol">💎</span>
          <span class="amount-value">{{ formatMoney(balance.total) }}</span>
        </div>
        <div class="balance-change" :class="todayNetIncome >= 0 ? 'positive' : 'negative'">
          今日{{ todayNetIncome >= 0 ? '+' : '' }}{{ formatMoney(todayNetIncome) }}
        </div>
      </div>
    </div>

    <div class="accounts-section">
      <div class="section-header">
        <h2 class="section-title">我的账户</h2>
      </div>
      <div class="accounts-grid">
        <AccountCard
          v-if="config.wealthEnabled"
          type="wealth"
          name="财富账户"
          icon="💰"
          :balance="balance.wealth"
          :trend="accountTrends.wealth"
          @click="navigateToAdd('wealth')"
        />
        <AccountCard
          v-if="config.healthEnabled"
          type="health"
          name="健康账户"
          icon="❤️"
          :balance="balance.health"
          :trend="accountTrends.health"
          @click="navigateToAdd('health')"
        />
        <AccountCard
          v-if="config.emotionEnabled"
          type="emotion"
          name="情感账户"
          icon="💝"
          :balance="balance.emotion"
          :trend="accountTrends.emotion"
          @click="navigateToAdd('emotion')"
        />
      </div>
    </div>

    <div class="statistics-section">
      <div class="section-header">
        <h2 class="section-title">今日统计</h2>
      </div>
      <div class="stats-grid">
        <StatCard
          icon="📥"
          label="今日收入"
          :value="todayIncome"
          prefix="+"
          bg-gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
        />
        <StatCard
          icon="📤"
          label="今日支出"
          :value="todayExpense"
          prefix="-"
          bg-gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
        />
        <StatCard
          icon="📈"
          label="今日利息"
          :value="todayInterest"
          prefix="+"
          bg-gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
        />
      </div>
    </div>

    <div class="recent-section">
      <div class="section-header">
        <h2 class="section-title">最近记录</h2>
        <span class="section-link" @click="goToReport">查看全部</span>
      </div>
      <TransactionList :transactions="recentTransactions" />
    </div>

    <div class="bottom-space"></div>
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage, formatDate } from '@/utils/storage'
import { calculator } from '@/utils/calculator'
import type { AccountConfig, AccountBalance, Transaction } from '@/types'
import AccountCard from '@/components/AccountCard.vue'
import StatCard from '@/components/StatCard.vue'
import TransactionList from '@/components/TransactionList.vue'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()

const config = ref<AccountConfig>(storage.getAccountConfig() || {} as AccountConfig)
const balance = ref<AccountBalance>(storage.getAccountBalance() || { wealth: 0, health: 0, emotion: 0, total: 0 })
const transactions = ref<Transaction[]>(storage.getTransactions())

const currentDate = computed(() => {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${formatDate(now)} ${weekdays[now.getDay()]}`
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const todayTransactions = computed(() => {
  const today = formatDate(new Date())
  return transactions.value.filter(t => t.createdAt.startsWith(today))
})

const todayIncome = computed(() => {
  return todayTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
})

const todayExpense = computed(() => {
  return todayTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

const todayNetIncome = computed(() => todayIncome.value - todayExpense.value)

const todayInterest = computed(() => {
  const settlements = storage.getDailySettlements()
  const today = formatDate(new Date())
  const todaySettlement = settlements.find(s => s.date === today)
  return todaySettlement?.totalInterest || 0
})

const accountTrends = computed(() => {
  const today = formatDate(new Date())
  const todayTrans = transactions.value.filter(t => t.createdAt.startsWith(today))
  
  const trends: Record<string, number> = { wealth: 0, health: 0, emotion: 0 }
  
  todayTrans.forEach(t => {
    const amount = t.type === 'income' ? t.amount : -t.amount
    trends[t.accountType] += amount
  })
  
  return trends
})

const recentTransactions = computed(() => transactions.value.slice(0, 10))

function navigateToAdd(accountType: string) {
  router.push(`/add?type=${accountType}`)
}

function goToReport() {
  router.push('/report')
}

onMounted(() => {
  checkDailySettlement()
})

function checkDailySettlement() {
  const result = calculator.checkAndPerformSettlement(config.value, balance.value)
  if (result.needsSettlement && result.newBalance && result.settlement) {
    balance.value = result.newBalance
    storage.addDailySettlement(result.settlement)
    storage.setAccountBalance(balance.value)
    storage.updateLastSettlementDate(formatDate(new Date()))
  }
}

function formatMoney(val: number): string {
  return val.toFixed(2)
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 20px;
  padding-top: calc(24px + env(safe-area-inset-top));
  border-radius: 0 0 24px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.greeting-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.header-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.balance-section {
  padding: 0 20px;
  margin-top: -30px;
}

.total-balance {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.balance-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.amount-symbol {
  font-size: 24px;
}

.amount-value {
  font-size: 40px;
  font-weight: 700;
  color: #1f2937;
}

.balance-change {
  font-size: 14px;
  margin-top: 8px;
}

.balance-change.positive {
  color: #10b981;
}

.balance-change.negative {
  color: #ef4444;
}

.accounts-section,
.statistics-section,
.recent-section {
  padding: 0 20px;
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.section-link {
  font-size: 13px;
  color: #0ea5e9;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.bottom-space {
  height: 20px;
}
</style>
