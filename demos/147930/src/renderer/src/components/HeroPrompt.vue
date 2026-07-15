<script setup>
import { computed, ref } from 'vue'
import FeatureNotice from './FeatureNotice.vue'
import PromptComposer from './PromptComposer.vue'
import { ChevronDown, Folder, FolderPlus, Monitor } from 'lucide-vue-next'
import heroLogo from '../assets/logo.png'

const props = defineProps({
  workspace: {
    type: Object,
    default: () => ({
      name: 'NLP课程',
      path: 'f:/学习/ai学习/NLP课程'
    })
  },
  workspaces: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['start-quest', 'open-workspace-folder', 'select-workspace'])

const runMode = ref('本地模式')
const openMenu = ref('')
const showNotice = ref(true)
const submittedPrompt = ref('')
const logoHoverArea = ref('')

const runModes = ['本地模式', '云端沙盒', '只读预览']
const workspaceName = computed(() => props.workspace?.name || 'NLP课程')
const workspaceOptions = computed(() => {
  if (props.workspaces.length > 0) {
    return props.workspaces
  }

  return [props.workspace]
})

function toggleMenu(name) {
  openMenu.value = openMenu.value === name ? '' : name
}

function openWorkspaceFolder() {
  openMenu.value = ''
  emit('open-workspace-folder')
}

function selectWorkspace(workspaceId) {
  openMenu.value = ''
  emit('select-workspace', workspaceId)
}

function selectMode(value) {
  runMode.value = value
  openMenu.value = ''
}

function handleSubmit(value, options = {}) {
  submittedPrompt.value = value
  emit('start-quest', value, options)
}

function updateLogoHoverArea(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left - rect.width / 2
  const y = event.clientY - rect.top - rect.height / 2
  const radius = Math.min(rect.width, rect.height) / 2

  if (x * x + y * y > radius * radius) {
    logoHoverArea.value = ''
    return
  }

  logoHoverArea.value = y < 0 ? 'top' : 'bottom'
}

function clearLogoHoverArea() {
  logoHoverArea.value = ''
}
</script>

<template>
  <section class="hero-prompt">
    <div class="heroPromptContainer">
      <div
        class="hero-logo"
        :class="{
          'is-hovering-top': logoHoverArea === 'top',
          'is-hovering-bottom': logoHoverArea === 'bottom'
        }"
        role="img"
        aria-label="Xoder"
        @mouseenter="updateLogoHoverArea"
        @mousemove="updateLogoHoverArea"
        @mouseleave="clearLogoHoverArea"
      >
        <img class="hero-logo-image" :src="heroLogo" alt="" draggable="false" />
      </div>
      <h1>Xoder, Change World</h1>
      <div class="hero-meta">
        <span>运行于</span>
        <div class="meta-menu-wrap">
          <button class="meta-select" type="button" @click="toggleMenu('workspace')">
            <Folder :size="14" />
            <span class="meta-select-label">{{ workspaceName }}</span>
            <ChevronDown :size="12" />
          </button>
          <div v-if="openMenu === 'workspace'" class="floating-menu workspace-menu">
            <button
              v-for="item in workspaceOptions"
              :key="item.id || item.path"
              type="button"
              :class="{ 'is-active': item.id === props.workspace?.id }"
              @click="selectWorkspace(item.id)"
            >
              <Folder :size="14" />
              <span>{{ item.name }}</span>
            </button>
            <span class="floating-menu-separator" />
            <button type="button" @click="openWorkspaceFolder">
              <FolderPlus :size="14" />
              打开文件夹
            </button>
          </div>
        </div>
        <div class="meta-menu-wrap">
          <button class="meta-select" type="button" @click="toggleMenu('mode')">
            <Monitor :size="14" />
            {{ runMode }}
            <ChevronDown :size="12" />
          </button>
          <div v-if="openMenu === 'mode'" class="floating-menu">
            <button v-for="item in runModes" :key="item" type="button" @click="selectMode(item)">
              {{ item }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <PromptComposer :workspace="workspace" @submit-prompt="handleSubmit" />

    <Transition name="fade-slide">
      <div v-if="submittedPrompt" class="submit-preview">
        <strong>Quest 草稿已生成</strong>
        <span>{{ submittedPrompt }}</span>
      </div>
    </Transition>

    <FeatureNotice v-if="showNotice" @close="showNotice = false" />
  </section>
</template>
