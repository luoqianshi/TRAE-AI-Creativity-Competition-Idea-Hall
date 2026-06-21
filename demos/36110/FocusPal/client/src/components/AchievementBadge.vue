<script setup lang="ts">
import { Award, Lock } from 'lucide-vue-next'

defineProps<{
  name: string
  description: string
  icon: string
  unlocked: boolean
  expReward?: number
}>()
</script>

<template>
  <div class="achievement-badge" :class="{ unlocked, locked: !unlocked }">
    <div class="badge-icon">
      <Award v-if="unlocked" :size="32" />
      <Lock v-else :size="32" />
    </div>
    <div class="badge-info">
      <div class="badge-name">{{ name }}</div>
      <div class="badge-desc">{{ description }}</div>
      <div class="badge-exp" v-if="unlocked">+{{ expReward }} EXP</div>
    </div>
  </div>
</template>

<style scoped>
.achievement-badge {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.achievement-badge.unlocked:hover {
  transform: scale(1.02);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.achievement-badge.locked {
  opacity: 0.6;
}

.badge-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unlocked .badge-icon {
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  color: white;
}

.locked .badge-icon {
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.badge-info {
  flex: 1;
  min-width: 0;
}

.badge-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.badge-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.badge-exp {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-secondary);
  font-family: 'Orbitron', sans-serif;
}
</style>
