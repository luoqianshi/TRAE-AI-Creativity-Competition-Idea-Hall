<template>
  <div class="contract-page">
    <div class="page-header">
      <h1 class="header-title">心灵契约</h1>
    </div>

    <div class="contract-container">
      <div class="contract-header">
        <div class="contract-seal">📜</div>
        <h2 class="contract-title">心灵账本契约书</h2>
        <p class="contract-subtitle">心灵财富管理协议</p>
      </div>

      <div class="contract-content">
        <div class="contract-section">
          <h3 class="section-title">一、协议宗旨</h3>
          <p class="section-text">
            本契约旨在通过量化记录每日心灵活动，实现财富、健康、情感三大维度的平衡发展，
            通过复利机制激励持续积累，最终达成心灵富足的人生目标。
          </p>
        </div>

        <div class="contract-section">
          <h3 class="section-title">二、账户体系</h3>
          <ul class="section-list">
            <li>💰 <strong>财富账户</strong>：记录与金钱相关的收支行为</li>
            <li>❤️ <strong>健康账户</strong>：记录与身心健康相关的收支行为</li>
            <li>💝 <strong>情感账户</strong>：记录与人际关系相关的收支行为</li>
          </ul>
        </div>

        <div class="contract-section">
          <h3 class="section-title">三、计算规则</h3>
          <ul class="section-list">
            <li><strong>年度有效天数</strong> = 365 - 年度休息日</li>
            <li><strong>每日基础本金</strong> = 年度总心灵币 / 年度有效天数</li>
            <li><strong>小时单位价值</strong> = 每日基础本金 / 24</li>
            <li><strong>日复利利息</strong> = 当日账户余额 × 日利率</li>
          </ul>
        </div>

        <div class="contract-section">
          <h3 class="section-title">四、我的宣言</h3>
          <div class="declaration-box">
            <p class="declaration-text">{{ config.positiveDeclaration }}</p>
          </div>
        </div>

        <div class="contract-section">
          <h3 class="section-title">五、账户信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">开户日期</span>
              <span class="info-value">{{ config.accountCreatedAt }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">年度心灵币</span>
              <span class="info-value">{{ config.totalHeartCoins }} 枚</span>
            </div>
            <div class="info-item">
              <span class="info-label">年度休息日</span>
              <span class="info-value">{{ config.restDays }} 天</span>
            </div>
            <div class="info-item">
              <span class="info-label">日复利利率</span>
              <span class="info-value">{{ (config.dailyInterestRate * 100).toFixed(2) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">每日基础本金</span>
              <span class="info-value">{{ config.dailyBaseCapital.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">每小时价值</span>
              <span class="info-value">{{ config.hourlyValue.toFixed(4) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="contract-footer">
        <div class="footer-line"></div>
        <p class="footer-text">已阅读并同意本契约</p>
        <p class="footer-date">{{ currentDate }}</p>
      </div>
    </div>

    <button class="screenshot-btn" @click="showScreenshot">
      📸 预览截图
    </button>

    <div class="bottom-space"></div>
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storage, formatDate } from '@/utils/storage'
import type { AccountConfig } from '@/types'
import TabBar from '@/components/TabBar.vue'

const config = ref<AccountConfig>(storage.getAccountConfig() || {} as AccountConfig)

const currentDate = computed(() => formatDate(new Date()))

function showScreenshot() {
  alert('截图功能已就绪，请使用手机截图功能保存您的心灵契约')
}
</script>

<style scoped>
.contract-page {
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

.contract-container {
  margin: 20px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.contract-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #667eea;
}

.contract-seal {
  font-size: 48px;
  margin-bottom: 12px;
}

.contract-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.contract-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.contract-content {
  margin-bottom: 24px;
}

.contract-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.section-text {
  font-size: 13px;
  line-height: 1.8;
  color: #4b5563;
  text-align: justify;
}

.section-list {
  list-style: none;
  padding: 0;
}

.section-list li {
  font-size: 13px;
  line-height: 2;
  color: #4b5563;
  padding-left: 8px;
}

.declaration-box {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 10px;
  padding: 16px;
  border-left: 4px solid #0ea5e9;
}

.declaration-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  font-style: italic;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px;
}

.info-label {
  font-size: 11px;
  color: #9ca3af;
  display: block;
  margin-bottom: 4px;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.contract-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px dashed #e5e7eb;
}

.footer-line {
  width: 80px;
  height: 2px;
  background: #1f2937;
  margin: 0 auto 12px;
}

.footer-text {
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 4px;
}

.footer-date {
  font-size: 12px;
  color: #9ca3af;
}

.screenshot-btn {
  margin: 0 20px;
  width: calc(100% - 40px);
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

.screenshot-btn:active {
  transform: scale(0.98);
}

.bottom-space {
  height: 20px;
}
</style>
