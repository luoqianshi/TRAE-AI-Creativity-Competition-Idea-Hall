<template>
  <div class="open-account-page">
    <div class="page-header">
      <div class="header-icon">💎</div>
      <h1 class="header-title">心灵账本</h1>
      <p class="header-subtitle">开启你的财富心灵之旅</p>
    </div>

    <div class="form-container">
      <div class="form-section">
        <h2 class="section-title">📊 基础设置</h2>
        <div class="form-item">
          <label class="form-label">年度心灵币基数</label>
          <input
            v-model.number="form.totalHeartCoins"
            type="number"
            class="form-input"
            placeholder="请输入年度心灵币总额"
          />
          <p class="form-hint">建议设定：3650枚（每天10枚）</p>
        </div>

        <div class="form-item">
          <label class="form-label">年度休息日</label>
          <input
            v-model.number="form.restDays"
            type="number"
            class="form-input"
            placeholder="请输入年度休息日天数"
          />
          <p class="form-hint">周末+节假日，建议设定：104天</p>
        </div>
      </div>

      <div class="calculation-preview">
        <div class="calc-item">
          <span class="calc-label">年度有效天数</span>
          <span class="calc-value">{{ effectiveDays }}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">每日基础本金</span>
          <span class="calc-value">{{ dailyBaseCapital.toFixed(2) }}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">每小时心灵币价值</span>
          <span class="calc-value">{{ hourlyValue.toFixed(4) }}</span>
        </div>
      </div>

      <div class="form-section">
        <h2 class="section-title">🏦 子账户选择</h2>
        <div class="account-options">
          <label class="account-option">
            <input v-model="form.wealthEnabled" type="checkbox" />
            <span class="option-icon">💰</span>
            <span class="option-text">财富账户</span>
            <span class="option-desc">记录金钱相关收支</span>
          </label>

          <label class="account-option">
            <input v-model="form.healthEnabled" type="checkbox" />
            <span class="option-icon">❤️</span>
            <span class="option-text">健康账户</span>
            <span class="option-desc">记录健康相关收支</span>
          </label>

          <label class="account-option">
            <input v-model="form.emotionEnabled" type="checkbox" />
            <span class="option-icon">💝</span>
            <span class="option-text">情感账户</span>
            <span class="option-desc">记录情感相关收支</span>
          </label>
        </div>
      </div>

      <div class="form-section">
        <h2 class="section-title">✨ 初始设定</h2>
        <div class="form-item">
          <label class="form-label">日复利利率 (%)</label>
          <input
            v-model.number="form.dailyInterestRate"
            type="number"
            step="0.01"
            class="form-input"
            placeholder="请输入日复利利率"
          />
          <p class="form-hint">建议设定：0.1% - 0.5%</p>
        </div>

        <div class="form-item">
          <label class="form-label">正向宣言</label>
          <textarea
            v-model="form.positiveDeclaration"
            class="form-textarea"
            placeholder="写下你的心灵宣言..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <button class="submit-btn" @click="submitForm">
        🚀 开启心灵账户
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { storage, formatDate } from '@/utils/storage'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  totalHeartCoins: 3650,
  restDays: 104,
  wealthEnabled: true,
  healthEnabled: true,
  emotionEnabled: true,
  dailyInterestRate: 0.1,
  positiveDeclaration: '每一天都是新的开始，用心经营我的心灵财富！'
})

const effectiveDays = computed(() => Math.max(1, 365 - form.restDays))
const dailyBaseCapital = computed(() => form.totalHeartCoins / effectiveDays.value)
const hourlyValue = computed(() => dailyBaseCapital.value / 24)

function submitForm() {
  if (form.totalHeartCoins <= 0) {
    alert('年度心灵币基数必须大于0')
    return
  }
  if (form.restDays < 0 || form.restDays >= 365) {
    alert('年度休息日必须在0-365之间')
    return
  }
  if (form.dailyInterestRate < 0 || form.dailyInterestRate > 10) {
    alert('日复利利率应在0%-10%之间')
    return
  }
  if (!form.wealthEnabled && !form.healthEnabled && !form.emotionEnabled) {
    alert('请至少选择一个子账户')
    return
  }

  const today = new Date()
  const config = {
    totalHeartCoins: form.totalHeartCoins,
    restDays: form.restDays,
    dailyBaseCapital: dailyBaseCapital.value,
    hourlyValue: hourlyValue.value,
    wealthEnabled: form.wealthEnabled,
    healthEnabled: form.healthEnabled,
    emotionEnabled: form.emotionEnabled,
    dailyInterestRate: form.dailyInterestRate / 100,
    positiveDeclaration: form.positiveDeclaration,
    accountCreatedAt: formatDate(today),
    lastSettlementDate: formatDate(today)
  }

  const balance = {
    wealth: form.wealthEnabled ? dailyBaseCapital.value : 0,
    health: form.healthEnabled ? dailyBaseCapital.value : 0,
    emotion: form.emotionEnabled ? dailyBaseCapital.value : 0,
    total: dailyBaseCapital.value * (form.wealthEnabled ? 1 : 0) +
           dailyBaseCapital.value * (form.healthEnabled ? 1 : 0) +
           dailyBaseCapital.value * (form.emotionEnabled ? 1 : 0)
  }

  storage.setAccountConfig(config)
  storage.setAccountBalance(balance)
  storage.setAccountOpened(true)

  router.push('/')
}
</script>

<style scoped>
.open-account-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 40px;
}

.page-header {
  text-align: center;
  padding: 40px 0;
  color: white;
}

.header-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0ea5e9;
}

.form-textarea {
  resize: none;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

.calculation-preview {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.calc-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.calc-item:last-child {
  border-bottom: none;
}

.calc-label {
  font-size: 13px;
  color: #6b7280;
}

.calc-value {
  font-size: 14px;
  font-weight: 600;
  color: #0ea5e9;
}

.account-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-option {
  display: flex;
  align-items: center;
  padding: 14px;
  background: #f9fafb;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}

.account-option:hover {
  background: #f3f4f6;
}

.account-option input {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}

.account-option:has(input:checked) {
  border-color: #0ea5e9;
  background: #f0f9ff;
}

.option-icon {
  font-size: 20px;
  margin-right: 10px;
}

.option-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.option-desc {
  font-size: 12px;
  color: #9ca3af;
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
