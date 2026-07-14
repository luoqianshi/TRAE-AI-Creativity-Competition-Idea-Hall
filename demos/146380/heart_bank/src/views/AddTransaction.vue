<template>
  <div class="add-transaction-page">
    <div class="page-header">
      <div class="header-back" @click="goBack">←</div>
      <h1 class="header-title">记账</h1>
      <div class="header-placeholder"></div>
    </div>

    <div class="form-container">
      <div class="type-tabs">
        <button
          class="type-tab"
          :class="{ active: form.type === 'income' }"
          @click="form.type = 'income'"
        >
          📥 收入
        </button>
        <button
          class="type-tab"
          :class="{ active: form.type === 'expense' }"
          @click="form.type = 'expense'"
        >
          📤 支出
        </button>
      </div>

      <div class="form-section">
        <label class="form-label">选择账户</label>
        <div class="account-selector">
          <button
            v-if="config.wealthEnabled"
            class="account-btn"
            :class="{ active: form.accountType === 'wealth' }"
            @click="selectAccount('wealth')"
          >
            <span class="btn-icon">💰</span>
            <span class="btn-text">财富</span>
          </button>
          <button
            v-if="config.healthEnabled"
            class="account-btn"
            :class="{ active: form.accountType === 'health' }"
            @click="selectAccount('health')"
          >
            <span class="btn-icon">❤️</span>
            <span class="btn-text">健康</span>
          </button>
          <button
            v-if="config.emotionEnabled"
            class="account-btn"
            :class="{ active: form.accountType === 'emotion' }"
            @click="selectAccount('emotion')"
          >
            <span class="btn-icon">💝</span>
            <span class="btn-text">情感</span>
          </button>
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">事件描述</label>
        <input
          v-model="form.description"
          type="text"
          class="form-input"
          placeholder="请输入事件描述"
        />
      </div>

      <div class="form-section">
        <label class="form-label">投入时间（小时）</label>
        <input
          v-model.number="form.hours"
          type="number"
          step="0.5"
          class="form-input"
          placeholder="请输入投入时间"
          @input="calculateAmount"
        />
      </div>

      <div class="form-section">
        <label class="form-label">心灵币金额</label>
        <div class="amount-input-group">
          <span class="amount-symbol">💎</span>
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            class="form-input amount-input"
            placeholder="0.00"
          />
        </div>
        <p class="form-hint">系统自动计算：{{ calculatedAmount.toFixed(4) }}</p>
      </div>

      <div class="preview-section">
        <div class="preview-title">记账预览</div>
        <div class="preview-content">
          <div class="preview-item">
            <span class="preview-label">账户</span>
            <span class="preview-value">{{ getAccountName(form.accountType) }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">类型</span>
            <span class="preview-value" :class="form.type">{{ form.type === 'income' ? '收入' : '支出' }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">描述</span>
            <span class="preview-value">{{ form.description || '未填写' }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">金额</span>
            <span class="preview-value amount" :class="form.type">
              {{ form.type === 'income' ? '+' : '-' }}{{ formatMoney(form.amount) }}
            </span>
          </div>
        </div>
      </div>

      <button class="submit-btn" @click="submitForm">
        ✅ 确认记账
      </button>
    </div>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storage, generateId, formatDateTime } from '@/utils/storage'
import { calculator } from '@/utils/calculator'
import type { AccountConfig, AccountBalance, Transaction } from '@/types'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const route = useRoute()

const config = storage.getAccountConfig() || {} as AccountConfig
const balance = storage.getAccountBalance() || { wealth: 0, health: 0, emotion: 0, total: 0 }

const form = reactive({
  accountType: 'wealth' as 'wealth' | 'health' | 'emotion',
  type: 'income' as 'income' | 'expense',
  description: '',
  hours: 0,
  amount: 0
})

const calculatedAmount = computed(() => {
  return form.hours * (config.hourlyValue || 0)
})

function selectAccount(type: 'wealth' | 'health' | 'emotion') {
  form.accountType = type
  calculateAmount()
}

function calculateAmount() {
  if (form.hours > 0) {
    form.amount = calculatedAmount.value
  }
}

function getAccountName(type: string): string {
  const names: Record<string, string> = {
    wealth: '财富账户',
    health: '健康账户',
    emotion: '情感账户'
  }
  return names[type] || '未知账户'
}

function submitForm() {
  if (!form.description.trim()) {
    alert('请输入事件描述')
    return
  }
  if (form.amount <= 0) {
    alert('请输入有效金额')
    return
  }

  const transaction: Transaction = {
    id: generateId(),
    accountType: form.accountType,
    type: form.type,
    description: form.description,
    hours: form.hours,
    amount: form.amount,
    createdAt: formatDateTime(new Date())
  }

  if (form.type === 'expense' && balance[form.accountType] < form.amount) {
    alert('账户余额不足')
    return
  }

  const newBalance = calculator.updateBalanceAfterTransaction(balance, transaction)

  storage.addTransaction(transaction)
  storage.setAccountBalance(newBalance)

  router.push('/')
}

function goBack() {
  router.back()
}

function formatMoney(val: number): string {
  return val.toFixed(2)
}

onMounted(() => {
  const type = route.query.type as string
  if (type && ['wealth', 'health', 'emotion'].includes(type)) {
    form.accountType = type as 'wealth' | 'health' | 'emotion'
  }
})
</script>

<style scoped>
.add-transaction-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.page-header {
  background: white;
  padding: 16px 20px;
  padding-top: calc(16px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #1f2937;
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-placeholder {
  width: 40px;
}

.form-container {
  padding: 20px;
}

.type-tabs {
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
}

.type-tab {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
}

.type-tab.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.type-tab.active:first-child {
  color: #10b981;
}

.type-tab.active:last-child {
  color: #ef4444;
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #0ea5e9;
}

.account-selector {
  display: flex;
  gap: 12px;
}

.account-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.account-btn.active {
  border-color: #0ea5e9;
  background: #f0f9ff;
}

.btn-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.btn-text {
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
}

.amount-input-group {
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.amount-input-group:focus-within {
  border-color: #0ea5e9;
}

.amount-symbol {
  padding: 0 14px;
  font-size: 18px;
}

.amount-input {
  border: none;
  padding: 14px 16px;
  font-size: 18px;
  font-weight: 600;
  width: 100%;
}

.amount-input:focus {
  outline: none;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

.preview-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-label {
  font-size: 13px;
  color: #6b7280;
}

.preview-value {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.preview-value.income {
  color: #10b981;
}

.preview-value.expense {
  color: #ef4444;
}

.preview-value.amount {
  font-size: 16px;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:active {
  transform: scale(0.98);
}
</style>
