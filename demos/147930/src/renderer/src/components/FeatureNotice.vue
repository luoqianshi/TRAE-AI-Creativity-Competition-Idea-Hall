<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

defineEmits(['close'])

const expanded = ref(false)
</script>

<template>
  <article class="feature-notice" :class="{ 'is-expanded': expanded }">
    <button class="notice-close" type="button" aria-label="关闭" @click="$emit('close')">
      <X :size="13" />
    </button>
    <button class="notice-thumb" type="button" aria-label="展开提示" @click="expanded = !expanded">
      <div class="thumb-sidebar" />
      <div class="thumb-main">
        <span />
        <span />
        <span />
      </div>
    </button>
    <div class="notice-copy">
      <h2>全新 Quest 视窗</h2>
      <p>你的 Agent-First 开发工作台，一览派任务、追踪状态、审查产物。</p>
      <p>智能体模式：智能体自主执行，端到端交付任务。</p>
      <p>专家团模式：多智能体协同并行，适合全栈开发、技术调研与疑难修复。</p>
      <p v-if="expanded" class="notice-extra">
        静态预览已展开：这里可以放版本说明、引导入口或演示数据。
      </p>
    </div>
  </article>
</template>
