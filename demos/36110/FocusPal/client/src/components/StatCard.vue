<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string | number
  icon: any
  trend?: number
  gradient?: string
}>()

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<template>
  <div class="stat-card" :style="{ '--card-gradient': gradient || 'var(--gradient-primary)' }">
    <div class="stat-header">
      <div class="stat-icon">
        <component :is="icon" :size="24" />
      </div>
      <div class="stat-trend" v-if="trend !== undefined" :class="{ positive: trend > 0, negative: trend < 0 }">
        {{ trend > 0 ? '+' : '' }}{{ trend }}%
      </div>
    </div>
    <div class="stat-value">{{ displayValue }}</div>
    <div class="stat-title">{{ title }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-gradient);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.stat-trend {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-trend.positive {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
}

.stat-trend.negative {
  background: rgba(239, 68, 68, 0.15);
  color: var(--accent-danger);
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: var(--text-muted);
}
</style>
