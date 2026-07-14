<template>
  <div class="account-card" :class="[`account-${type}`]" @click="$emit('click')">
    <div class="account-header">
      <span class="account-icon">{{ icon }}</span>
      <span class="account-name">{{ name }}</span>
    </div>
    <div class="account-balance">
      <span class="balance-symbol">💎</span>
      <span class="balance-value">{{ formatMoney(balance) }}</span>
    </div>
    <div class="account-trend" v-if="trend !== undefined">
      <span :class="trend >= 0 ? 'trend-up' : 'trend-down'">
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend).toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'wealth' | 'health' | 'emotion'
  name: string
  icon: string
  balance: number
  trend?: number
}>()

defineEmits<{
  click: []
}>()

function formatMoney(val: number): string {
  return val.toFixed(2)
}
</script>

<style scoped>
.account-card {
  border-radius: 12px;
  padding: 16px;
  color: white;
  transition: transform 0.2s;
}

.account-card:active {
  transform: scale(0.98);
}

.account-wealth {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.account-health {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.account-emotion {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.account-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.account-icon {
  font-size: 18px;
}

.account-name {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.account-balance {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.balance-symbol {
  font-size: 16px;
}

.balance-value {
  font-size: 28px;
  font-weight: 700;
}

.account-trend {
  margin-top: 8px;
  font-size: 12px;
}

.trend-up {
  color: #86efac;
}

.trend-down {
  color: #fca5a5;
}
</style>
