<template>
  <div class="stat-card" :style="{ background: bgGradient }">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value" :class="{ 'text-green-300': isPositive, 'text-red-300': isNegative }">
        {{ prefix }}{{ formatValue(value) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  value: number
  prefix?: string
  bgGradient?: string
}>()

const isPositive = computed(() => props.value > 0)
const isNegative = computed(() => props.value < 0)

function formatValue(val: number): string {
  return val.toFixed(2)
}
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
}
</style>
