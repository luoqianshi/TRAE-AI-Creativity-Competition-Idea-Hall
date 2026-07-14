<template>
  <div class="base-card" :class="[shadowClass, { 'rounded-none': !rounded }]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  shadow?: 'sm' | 'md' | 'lg' | 'none'
  rounded?: boolean
}>()

const shadowClass = {
  'sm': 'shadow-sm',
  'md': 'shadow-md',
  'lg': 'shadow-lg',
  'none': 'shadow-none'
}
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
}
</style>
