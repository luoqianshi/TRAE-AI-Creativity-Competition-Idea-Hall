<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="header-title">个人设置</h1>
    </div>

    <div class="settings-container">
      <div class="settings-section">
        <h2 class="section-title">⚙️ 参数设置</h2>
        
        <div class="setting-item">
          <div class="item-label">
            <span class="label-text">日复利利率</span>
            <span class="label-hint">当前: {{ (config.dailyInterestRate * 100).toFixed(2) }}%</span>
          </div>
          <input
            v-model.number="editForm.dailyInterestRate"
            type="number"
            step="0.01"
            class="setting-input"
            placeholder="请输入利率"
          />
        </div>

        <div class="setting-item">
          <div class="item-label">
            <span class="label-text">正向宣言</span>
          </div>
          <textarea
            v-model="editForm.positiveDeclaration"
            class="setting-textarea"
            placeholder="写下你的心灵宣言..."
            rows="3"
          ></textarea>
        </div>

        <button class="save-btn" @click="saveSettings">
          💾 保存设置
        </button>
      </div>

      <div class="settings-section">
        <h2 class="section-title">📊 账户信息</h2>
        
        <div class="info-list">
          <div class="info-item">
            <span class="info-icon">📅</span>
            <div class="info-content">
              <span class="info-label">开户日期</span>
              <span class="info-value">{{ config.accountCreatedAt }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">💎</span>
            <div class="info-content">
              <span class="info-label">年度心灵币</span>
              <span class="info-value">{{ config.totalHeartCoins }} 枚</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">🌴</span>
            <div class="info-content">
              <span class="info-label">年度休息日</span>
              <span class="info-value">{{ config.restDays }} 天</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">📈</span>
            <div class="info-content">
              <span class="info-label">每日基础本金</span>
              <span class="info-value">{{ config.dailyBaseCapital.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">🧹 数据管理</h2>
        
        <button class="action-btn secondary" @click="viewContract">
          📜 查看心灵契约
        </button>
        
        <button class="action-btn secondary" @click="clearDataConfirm">
          🗑️ 清空所有数据
        </button>
      </div>

      <div class="settings-section">
        <h2 class="section-title">ℹ️ 关于</h2>
        
        <div class="about-content">
          <div class="about-item">
            <span class="about-label">版本</span>
            <span class="about-value">v1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">名称</span>
            <span class="about-value">心灵账本</span>
          </div>
          <div class="about-item">
            <span class="about-label">描述</span>
            <span class="about-value">轻量化自律工具</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-space"></div>
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '@/utils/storage'
import type { AccountConfig } from '@/types'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const config = ref<AccountConfig>(storage.getAccountConfig() || {} as AccountConfig)

const editForm = reactive({
  dailyInterestRate: 0,
  positiveDeclaration: ''
})

onMounted(() => {
  editForm.dailyInterestRate = config.value.dailyInterestRate * 100
  editForm.positiveDeclaration = config.value.positiveDeclaration
})

function saveSettings() {
  if (editForm.dailyInterestRate < 0 || editForm.dailyInterestRate > 10) {
    alert('利率范围应在 0% - 10% 之间')
    return
  }

  const newConfig = {
    ...config.value,
    dailyInterestRate: editForm.dailyInterestRate / 100,
    positiveDeclaration: editForm.positiveDeclaration
  }

  storage.setAccountConfig(newConfig)
  config.value = newConfig

  alert('设置已保存')
}

function viewContract() {
  router.push('/contract')
}

function clearDataConfirm() {
  if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
    storage.clearAllData()
    router.push('/open')
  }
}
</script>

<style scoped>
.settings-page {
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

.settings-container {
  padding: 20px;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.setting-item {
  margin-bottom: 16px;
}

.item-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.label-hint {
  font-size: 12px;
  color: #9ca3af;
}

.setting-input,
.setting-textarea {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.setting-input:focus,
.setting-textarea:focus {
  outline: none;
  border-color: #0ea5e9;
}

.setting-textarea {
  resize: none;
}

.save-btn {
  width: 100%;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.save-btn:active {
  transform: scale(0.98);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
}

.info-icon {
  font-size: 20px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-bottom: 2px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.action-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 10px;
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.action-btn.secondary:active {
  background: #e5e7eb;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.about-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.about-item:last-child {
  border-bottom: none;
}

.about-label {
  font-size: 14px;
  color: #6b7280;
}

.about-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.bottom-space {
  height: 20px;
}
</style>
