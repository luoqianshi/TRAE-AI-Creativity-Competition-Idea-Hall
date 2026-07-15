<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  CircleDot,
  ExternalLink,
  LayoutPanelLeft,
  Maximize2,
  Minimize2,
  Minus,
  Monitor,
  Plus,
  X
} from 'lucide-vue-next'

const props = defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  rightPanelCollapsed: {
    type: Boolean,
    default: false
  },
  canToggleRightPanel: {
    type: Boolean,
    default: false
  },
  workspaceName: {
    type: String,
    default: '默认工作区'
  },
  desktopNodeState: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['create-quest', 'toggle-right-panel', 'toggle-sidebar'])

const editorOpen = ref(false)
const isWindowMaximized = ref(false)
let removeMaximizedListener

const nodeStatusLabel = computed(() => props.desktopNodeState?.node?.statusLabel || '本地待命')
const nodeStatusTone = computed(() => {
  const status = props.desktopNodeState?.node?.status

  if (status === 'running') {
    return 'running'
  }

  if (status === 'connected') {
    return 'connected'
  }

  if (status === 'configured' || status === 'registering' || status === 'syncing') {
    return 'configured'
  }

  if (status === 'error') {
    return 'error'
  }

  return 'idle'
})

function openEditor() {
  editorOpen.value = !editorOpen.value
}

function minimizeWindow() {
  window.api?.windowControls?.minimize()
}

async function toggleMaximizeWindow() {
  const nextState = await window.api?.windowControls?.toggleMaximize()

  if (typeof nextState === 'boolean') {
    isWindowMaximized.value = nextState
  }
}

function closeWindow() {
  window.api?.windowControls?.close()
}

onMounted(async () => {
  const currentState = await window.api?.windowControls?.isMaximized?.()

  if (typeof currentState === 'boolean') {
    isWindowMaximized.value = currentState
  }

  removeMaximizedListener = window.api?.windowControls?.onMaximizedChange?.((nextState) => {
    isWindowMaximized.value = nextState
  })
})

onBeforeUnmount(() => {
  removeMaximizedListener?.()
})
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-left">
      <button
        class="icon-button"
        type="button"
        :aria-label="sidebarCollapsed ? '展开左侧边栏' : '收起左侧边栏'"
        @click="emit('toggle-sidebar')"
      >
        <LayoutPanelLeft :size="15" />
      </button>
      <button class="icon-button" type="button" aria-label="创建任务" @click="emit('create-quest')">
        <Plus :size="15" />
      </button>
      <div class="top-bar-title">
        <strong>当前工作区</strong>
        <span>{{ workspaceName }}</span>
        <Monitor :size="13" />
      </div>
      <div
        class="desktop-node-badge"
        :class="`is-${nodeStatusTone}`"
        :title="nodeStatusLabel"
      >
        <CircleDot :size="12" />
        <span>{{ nodeStatusLabel }}</span>
      </div>
    </div>

    <div class="top-bar-right">
      <Transition name="fade">
        <span v-if="editorOpen" class="top-status">编辑器预览已打开</span>
      </Transition>
      <button class="open-editor" type="button" :class="{ 'is-active': editorOpen }" @click="openEditor">
        打开编辑器
        <ExternalLink :size="13" />
      </button>
      <button
        v-if="canToggleRightPanel"
        class="icon-button"
        type="button"
        :aria-label="rightPanelCollapsed ? '展开右侧边栏' : '收起右侧边栏'"
        :class="{ 'is-active': !rightPanelCollapsed }"
        @click="emit('toggle-right-panel')"
      >
        <LayoutPanelLeft class="flip-horizontal" :size="15" />
      </button>
      <div class="window-controls" aria-label="窗口控制">
        <button type="button" aria-label="最小化" @click="minimizeWindow">
          <Minus :size="14" />
        </button>
        <button
          type="button"
          :aria-label="isWindowMaximized ? '还原窗口' : '最大化'"
          @click="toggleMaximizeWindow"
        >
          <Minimize2 v-if="isWindowMaximized" :size="13" />
          <Maximize2 v-else :size="13" />
        </button>
        <button class="close" type="button" aria-label="关闭" @click="closeWindow">
          <X :size="15" />
        </button>
      </div>
    </div>
  </header>
</template>
