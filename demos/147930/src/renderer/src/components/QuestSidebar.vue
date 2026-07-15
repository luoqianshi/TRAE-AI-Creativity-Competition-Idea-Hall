<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  BookOpen,
  Box,
  ChevronDown,
  ChevronRight,
  CircleGauge,
  Crown,
  FileClock,
  Folder,
  GitBranch,
  HelpCircle,
  Languages,
  LayoutPanelLeft,
  LogOut,
  MessageSquareWarning,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  SquarePen,
  SunMedium,
  X
} from 'lucide-vue-next'
import logo from '../assets/logoQ-header.png'
import { staticQuests, staticWorkspaces } from '../static-data.js'

const props = defineProps({
  workspaces: {
    type: Array,
    default: () => staticWorkspaces
  },
  activeWorkspaceId: {
    type: String,
    default: 'workspace-default'
  },
  questRequest: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'create-quest',
  'open-quest',
  'open-settings',
  'open-workspace-folder',
  'select-workspace',
  'toggle-sidebar'
])

const showSearch = ref(false)
const searchQuery = ref('')
const folderOpenState = ref({ 'workspace-default': true })
const showAllState = ref({})
const selectedQuestId = ref(staticQuests[0]?.id || '')
const hoveredQuestId = ref(null)
const hoveredQuestTop = ref(null)
const selectedQuestTop = ref(142)
const toast = ref('')
const settingsMenuOpen = ref(false)
const usagePopoverOpen = ref(false)
const usageButtonRef = ref(null)
const usagePopoverStyle = ref({
  left: '14px',
  top: '14px',
  width: '398px'
})
let nextQuestId = 200

const workspaceFolders = computed(() => {
  return props.workspaces.length > 0 ? props.workspaces : staticWorkspaces
})
const activeWorkspace = computed(() => {
  return (
    workspaceFolders.value.find((folder) => folder.id === props.activeWorkspaceId) ??
    workspaceFolders.value[0]
  )
})
const questItems = ref(staticQuests.map((quest) => normalizeQuestItem(quest)).filter(Boolean))
const filteredQuests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return questItems.value
  }

  return questItems.value.filter((item) => {
    const folder = getWorkspaceForQuest(item)

    return (
      item.title.toLowerCase().includes(query) ||
      folder.name.toLowerCase().includes(query) ||
      folder.path.toLowerCase().includes(query)
    )
  })
})

const groupedFolders = computed(() => {
  return workspaceFolders.value.map((folder) => ({
    ...folder,
    quests: filteredQuests.value.filter((quest) => quest.workspaceId === folder.id)
  }))
})

const previewQuest = computed(() => {
  const id = hoveredQuestId.value ?? selectedQuestId.value

  return questItems.value.find((item) => item.id === id) ?? null
})

const previewTop = computed(() => hoveredQuestTop.value ?? selectedQuestTop.value)
const previewWorkspace = computed(() =>
  previewQuest.value ? getWorkspaceForQuest(previewQuest.value) : null
)
const settingsMenuItems = [
  { label: '设置', icon: Settings, action: '设置', route: 'settings' },
  { label: '界面语言', icon: Languages, action: '界面语言', hasSubmenu: true },
  { label: '主题', icon: SunMedium, action: '主题', hasSubmenu: true },
  { divider: true },
  { label: '升级计划', icon: Crown, action: '升级计划' },
  { label: '帮助文档', icon: HelpCircle, action: '帮助文档' },
  { label: '更新日志', icon: FileClock, action: '更新日志' },
  { label: '检查更新', icon: RefreshCcw, action: '检查更新' },
  { label: '问题反馈', icon: MessageSquareWarning, action: '问题反馈' },
  { divider: true },
  { label: '退出登录', icon: LogOut, action: '退出登录', danger: true }
]

watch(
  workspaceFolders,
  (folders) => {
    const nextOpenState = { ...folderOpenState.value }

    folders.forEach((folder) => {
      if (nextOpenState[folder.id] === undefined) {
        nextOpenState[folder.id] = true
      }
    })

    folderOpenState.value = nextOpenState
  },
  { immediate: true }
)

watch(
  () => props.questRequest,
  (quest) => {
    if (quest) {
      upsertQuest(quest, {
        select: true,
        openFolder: true
      })
    }
  },
  { deep: true }
)

function showToast(message) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) {
      toast.value = ''
    }
  }, 1800)
}

function toggleSettingsMenu() {
  settingsMenuOpen.value = !settingsMenuOpen.value

  if (settingsMenuOpen.value) {
    closeUsagePopover()
  }
}

function closeSettingsMenu() {
  settingsMenuOpen.value = false
}

function toggleUsagePopover() {
  if (usagePopoverOpen.value) {
    closeUsagePopover()
    return
  }

  updateUsagePopoverPosition()
  usagePopoverOpen.value = true
  closeSettingsMenu()
}

function closeUsagePopover() {
  usagePopoverOpen.value = false
}

function updateUsagePopoverPosition() {
  const button = usageButtonRef.value

  if (!button) {
    return
  }

  const rect = button.getBoundingClientRect()
  const sidebarRect = button.closest?.('.quest-sidebar')?.getBoundingClientRect()
  const width = Math.min(398, Math.max(180, window.innerWidth - 28))
  const leftLimit = Math.max(8, window.innerWidth - width - 14)
  const preferredLeft = (sidebarRect?.left ?? rect.left) + 14
  const left = Math.min(Math.max(preferredLeft, 14), leftLimit)
  const estimatedHeight = 196
  const topLimit = Math.max(14, window.innerHeight - estimatedHeight - 14)
  const top = Math.min(Math.max(rect.top - estimatedHeight - 8, 14), topLimit)

  usagePopoverStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`
  }
}

function openUsageDetails() {
  showToast('用量详情为静态预览')
}

function refreshUsage() {
  showToast('静态模式不会刷新远程用量')
}

function selectSettingsMenuItem(item) {
  if (!item || item.divider) {
    return
  }

  closeSettingsMenu()

  if (item.route === 'settings') {
    emit('open-settings')
    return
  }

  showToast(`${item.action} 为静态入口`)
}

function createQuest() {
  const workspace = activeWorkspace.value
  const quest = {
    id: `local-static-${nextQuestId++}`,
    title: '新 Quest',
    time: '本地',
    workspaceId: workspace.id,
    project: workspace.name,
    path: workspace.path,
    prompt: '',
    intentMode: 'auto',
    isEmpty: true
  }

  questItems.value.unshift(quest)
  selectedQuestId.value = quest.id
  folderOpenState.value = { ...folderOpenState.value, [workspace.id]: true }
  showToast('已创建本地静态 Quest')
  emit('create-quest', quest)
}

function openWorkspaceFolder() {
  emit('open-workspace-folder')
}

function selectQuest(id, event) {
  selectedQuestId.value = id
  selectedQuestTop.value = getQuestItemTop(event)
  const quest = questItems.value.find((item) => item.id === id)

  if (quest) {
    emit('select-workspace', quest.workspaceId)
    emit('open-quest', {
      id: quest.id,
      title: quest.title,
      prompt: quest.prompt,
      intentMode: quest.intentMode,
      workspaceId: quest.workspaceId,
      project: quest.project,
      path: quest.path,
      isEmpty: Boolean(quest.isEmpty)
    })
  }
}

function upsertQuest(quest, options = {}) {
  const workspace =
    workspaceFolders.value.find((folder) => folder.id === quest.workspaceId) ?? activeWorkspace.value
  const normalizedQuest = normalizeQuestItem({
    ...quest,
    workspaceId: quest.workspaceId ?? workspace.id,
    project: quest.project ?? workspace.name,
    path: quest.path ?? workspace.path,
    time: quest.time ?? '本地'
  })
  const index = questItems.value.findIndex((item) => String(item.id) === String(normalizedQuest.id))

  if (index >= 0) {
    questItems.value[index] = {
      ...questItems.value[index],
      ...normalizedQuest
    }
  } else {
    questItems.value.unshift(normalizedQuest)
  }

  if (options.select) {
    selectedQuestId.value = normalizedQuest.id
  }

  if (options.openFolder) {
    folderOpenState.value = {
      ...folderOpenState.value,
      [normalizedQuest.workspaceId]: true
    }
  }
}

function handleFolderClick(folder) {
  emit('select-workspace', folder.id)

  if (props.activeWorkspaceId === folder.id) {
    folderOpenState.value = {
      ...folderOpenState.value,
      [folder.id]: !isFolderOpen(folder.id)
    }
    return
  }

  folderOpenState.value = { ...folderOpenState.value, [folder.id]: true }
}

function isFolderOpen(folderId) {
  return folderOpenState.value[folderId] !== false
}

function visibleQuestsFor(folder) {
  if (!isFolderOpen(folder.id)) {
    return []
  }

  return showAllState.value[folder.id] ? folder.quests : folder.quests.slice(0, 5)
}

function hasHiddenQuests(folder) {
  return folder.quests.length > 5
}

function toggleShowAll(folderId) {
  showAllState.value = {
    ...showAllState.value,
    [folderId]: !showAllState.value[folderId]
  }
}

function isShowingAll(folderId) {
  return Boolean(showAllState.value[folderId])
}

function hoverQuest(id, event) {
  hoveredQuestId.value = id
  hoveredQuestTop.value = getQuestItemTop(event)
}

function clearHoveredQuest() {
  hoveredQuestId.value = null
  hoveredQuestTop.value = null
}

function getWorkspaceForQuest(quest) {
  return (
    workspaceFolders.value.find((folder) => folder.id === quest.workspaceId) ?? {
      id: quest.workspaceId,
      name: quest.project || staticWorkspaces[0].name,
      path: quest.path || staticWorkspaces[0].path
    }
  )
}

function getQuestItemTop(event) {
  const target = event?.currentTarget
  const sidebar = target?.closest?.('.quest-sidebar')

  if (!target || !sidebar) {
    return selectedQuestTop.value
  }

  return target.getBoundingClientRect().top - sidebar.getBoundingClientRect().top
}

function normalizeQuestItem(quest) {
  if (!quest || typeof quest !== 'object') {
    return null
  }

  const workspace = workspaceFolders.value.find((folder) => folder.id === quest.workspaceId)

  return {
    id: quest.id ?? `local-static-${nextQuestId++}`,
    title: String(quest.title || '新 Quest'),
    time: String(quest.time ?? ''),
    workspaceId: String(quest.workspaceId ?? workspace?.id ?? staticWorkspaces[0].id),
    project: String(quest.project ?? workspace?.name ?? staticWorkspaces[0].name),
    path: String(quest.path ?? workspace?.path ?? staticWorkspaces[0].path),
    prompt: String(quest.prompt ?? ''),
    intentMode: String(quest.intentMode ?? 'auto'),
    isEmpty: Boolean(quest.isEmpty)
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeSettingsMenu()
    closeUsagePopover()
    return
  }

  if (!event.ctrlKey || event.key.toLowerCase() !== 'n') {
    return
  }

  event.preventDefault()
  createQuest()
}

function handleDocumentPointerDown(event) {
  if (!settingsMenuOpen.value && !usagePopoverOpen.value) {
    return
  }

  if (
    event.target?.closest?.('.settings-menu-wrap') ||
    event.target?.closest?.('.usage-popover-wrap') ||
    event.target?.closest?.('.usage-popover')
  ) {
    return
  }

  closeSettingsMenu()
  closeUsagePopover()
}

function handleWindowResize() {
  if (usagePopoverOpen.value) {
    updateUsagePopoverPosition()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleWindowResize)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleWindowResize)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>

<template>
  <aside class="quest-sidebar">
    <div class="sidebar-toolbar">
      <button
        class="icon-button"
        type="button"
        aria-label="收起左侧边栏"
        @click="emit('toggle-sidebar')"
      >
        <LayoutPanelLeft :size="16" />
      </button>
      <button class="icon-button" type="button" aria-label="搜索" @click="showSearch = !showSearch">
        <Search :size="17" />
      </button>
    </div>

    <div v-if="showSearch" class="sidebar-search">
      <Search :size="14" />
      <input v-model="searchQuery" type="text" placeholder="搜索 Quest" />
      <button
        v-if="searchQuery"
        class="search-clear"
        type="button"
        aria-label="清空搜索"
        @click="searchQuery = ''"
      >
        <X :size="13" />
      </button>
    </div>

    <button class="create-quest" type="button" @click="createQuest">
      <span class="create-label">
        <Plus :size="15" />
        创建 Quest
      </span>
      <span class="shortcut">Ctrl N</span>
    </button>

    <section class="quest-section" aria-label="Quests">
      <div class="section-heading">
        <span>Quests</span>
        <span class="section-actions">
          <button
            class="tiny-icon"
            type="button"
            aria-label="切换视图"
            @click="showToast('列表视图为静态模式')"
          >
            <LayoutPanelLeft :size="14" />
          </button>
          <button
            class="tiny-icon"
            type="button"
            aria-label="打开文件夹"
            @click="openWorkspaceFolder"
          >
            <SquarePen :size="14" />
          </button>
        </span>
      </div>

      <div class="folder-groups">
        <div v-for="folder in groupedFolders" :key="folder.id" class="folder-group">
          <button
            class="folder-row"
            type="button"
            :class="{
              'is-open': isFolderOpen(folder.id),
              'is-active': activeWorkspace?.id === folder.id
            }"
            @click="handleFolderClick(folder)"
          >
            <Folder :size="15" />
            <span>{{ folder.name }}</span>
            <small>{{ folder.quests.length }}</small>
            <ChevronDown v-if="isFolderOpen(folder.id)" :size="13" />
            <ChevronRight v-else :size="13" />
          </button>

          <ul v-if="isFolderOpen(folder.id)" class="quest-list">
            <li
              v-for="item in visibleQuestsFor(folder)"
              :key="item.id"
              @mouseenter="hoverQuest(item.id, $event)"
              @mouseleave="clearHoveredQuest"
            >
              <div
                class="quest-item"
                role="button"
                tabindex="0"
                :class="{ 'is-active': selectedQuestId === item.id }"
                @click="selectQuest(item.id, $event)"
                @keydown.enter.prevent="selectQuest(item.id)"
                @keydown.space.prevent="selectQuest(item.id)"
              >
                <span class="quest-leading">
                  <Sparkles
                    v-if="selectedQuestId === item.id || hoveredQuestId === item.id"
                    :size="15"
                  />
                  <span v-else class="quest-dot" />
                </span>
                <span class="quest-title">{{ item.title }}</span>
                <span
                  v-if="selectedQuestId !== item.id && hoveredQuestId !== item.id"
                  class="quest-time"
                >
                  {{ item.time }}
                </span>
                <button
                  v-else
                  class="quest-more"
                  type="button"
                  aria-label="更多操作"
                  @click.stop="showToast('更多操作为静态演示')"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </div>
            </li>
          </ul>

          <p v-if="isFolderOpen(folder.id) && folder.quests.length === 0" class="empty-quests">
            暂无 Quest
          </p>

          <button
            v-if="isFolderOpen(folder.id) && hasHiddenQuests(folder)"
            class="more-quests"
            type="button"
            @click="toggleShowAll(folder.id)"
          >
            <span>...</span>
            {{ isShowingAll(folder.id) ? '收起' : '展示更多' }}
          </button>
        </div>
      </div>
    </section>

    <Transition name="fade-slide">
      <aside
        v-if="previewQuest"
        class="quest-preview"
        :style="{ top: `${previewTop}px` }"
        @mouseenter="hoveredQuestId = previewQuest.id"
        @mouseleave="hoveredQuestId = null"
      >
        <strong>{{ previewQuest.title }}</strong>
        <span>
          <GitBranch :size="13" />
          {{ previewWorkspace?.name }}
        </span>
        <span>
          <Folder :size="13" />
          {{ previewWorkspace?.path }}
        </span>
      </aside>
    </Transition>

    <div class="sidebar-footer">
      <nav class="footer-links" aria-label="辅助导航">
        <button class="footer-link" type="button" @click="showToast('知识中心为静态入口')">
          <BookOpen :size="16" />
          知识中心
        </button>
        <button class="footer-link" type="button" @click="showToast('插件市场为静态入口')">
          <Box :size="16" />
          插件市场
        </button>
      </nav>

      <div class="profile-row">
        <img class="profile-logo" :src="logo" alt="Xoder" />
        <div class="profile-copy">
          <strong>xy x</strong>
          <span>Community</span>
        </div>
        <div class="usage-popover-wrap">
          <button
            ref="usageButtonRef"
            class="icon-button subtle"
            type="button"
            aria-label="我的用量"
            aria-haspopup="dialog"
            :aria-expanded="usagePopoverOpen"
            :class="{ 'is-active': usagePopoverOpen }"
            @click.stop="toggleUsagePopover"
          >
            <CircleGauge :size="16" />
          </button>
        </div>
        <div class="settings-menu-wrap">
          <button
            class="icon-button subtle"
            type="button"
            aria-label="设置"
            aria-haspopup="menu"
            :aria-expanded="settingsMenuOpen"
            :class="{ 'is-active': settingsMenuOpen }"
            @click.stop="toggleSettingsMenu"
          >
            <Settings :size="16" />
          </button>

          <Transition name="settings-menu">
            <div v-if="settingsMenuOpen" class="settings-popover" role="menu">
              <template v-for="(item, index) in settingsMenuItems" :key="item.label || index">
                <span v-if="item.divider" class="settings-menu-divider" />
                <button
                  v-else
                  class="settings-menu-item"
                  type="button"
                  role="menuitem"
                  :class="{ 'is-danger': item.danger }"
                  @click="selectSettingsMenuItem(item)"
                >
                  <component :is="item.icon" :size="14" />
                  <span>{{ item.label }}</span>
                  <ChevronRight v-if="item.hasSubmenu" :size="13" />
                </button>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <Transition name="fade-slide">
      <div v-if="toast" class="sidebar-toast">{{ toast }}</div>
    </Transition>
  </aside>

  <Teleport to="body">
    <Transition name="settings-menu">
      <aside
        v-if="usagePopoverOpen"
        class="usage-popover"
        :style="usagePopoverStyle"
        role="dialog"
        aria-label="我的用量"
      >
        <header class="usage-popover-header">
          <strong>我的用量</strong>
          <div class="usage-actions">
            <button class="usage-detail-link" type="button" @click="openUsageDetails">
              查看详情
            </button>
            <button
              class="usage-refresh-button"
              type="button"
              aria-label="刷新用量"
              @click="refreshUsage"
            >
              <RefreshCcw :size="14" />
            </button>
          </div>
        </header>

        <div class="usage-plan-row">
          <strong>静态 Credits</strong>
          <span>Community</span>
        </div>

        <div class="usage-progress" aria-hidden="true">
          <span />
        </div>

        <div class="usage-meter-row">
          <span>0 / 0 (已使用 0%)</span>
          <span>剩余 0</span>
        </div>

        <footer class="usage-popover-footer">
          <span>静态模式不连接计费或账户服务</span>
          <button type="button" @click="showToast('升级入口已静态化')">升级</button>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>
