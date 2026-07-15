<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import HeroPrompt from './components/HeroPrompt.vue'
import QuestChatView from './components/QuestChatView.vue'
import QuestSidebar from './components/QuestSidebar.vue'
import SettingsView from './components/SettingsView.vue'
import TopBar from './components/TopBar.vue'
import { staticDesktopNodeState, staticQuests, staticWorkspaces } from './static-data.js'

const SIDEBAR_DEFAULT_WIDTH = 272
const SIDEBAR_MIN_WIDTH = 220
const SIDEBAR_MAX_WIDTH = 420
const NARROW_WINDOW_BREAKPOINT = 1100
const COMPACT_WINDOW_BREAKPOINT = 760
const NARROW_SIDEBAR_WIDTH = 240
const RIGHT_PANEL_AUTO_COLLAPSE_WIDTH = 1180

const activeQuest = ref({ ...staticQuests[0] })
const sidebarQuestRequest = ref(null)
const workspaceFolders = ref(staticWorkspaces.map((workspace) => ({ ...workspace })))
const selectedWorkspaceId = ref(activeQuest.value.workspaceId || workspaceFolders.value[0]?.id || '')
const sidebarWidth = ref(SIDEBAR_DEFAULT_WIDTH)
const sidebarCollapsed = ref(false)
const rightPanelCollapsed = ref(false)
const rightPanelForcedOpen = ref(false)
const isResizingSidebar = ref(false)
const viewportWidth = ref(window.innerWidth)
const activeView = ref('workbench')
const settingsNavigation = ref(null)
let nextStandaloneQuestId = 100
let stopXoderDeepLink = null

const shellStyle = computed(() => ({
  '--sidebar-width': `${effectiveSidebarWidth.value}px`
}))

const hasActiveQuest = computed(() => Boolean(activeQuest.value))
const shouldShowHeroPrompt = computed(() => !activeQuest.value || activeQuest.value.isEmpty)
const isNarrowWindow = computed(() => viewportWidth.value <= NARROW_WINDOW_BREAKPOINT)
const isCompactWindow = computed(() => viewportWidth.value <= COMPACT_WINDOW_BREAKPOINT)
const isRightPanelAutoCollapsed = computed(
  () => viewportWidth.value <= RIGHT_PANEL_AUTO_COLLAPSE_WIDTH
)
const effectiveSidebarWidth = computed(() => {
  if (isCompactWindow.value) {
    return 0
  }

  return isNarrowWindow.value
    ? Math.min(sidebarWidth.value, NARROW_SIDEBAR_WIDTH)
    : sidebarWidth.value
})
const effectiveSidebarCollapsed = computed(() => sidebarCollapsed.value || isCompactWindow.value)
const effectiveRightPanelCollapsed = computed(
  () =>
    (rightPanelCollapsed.value || isRightPanelAutoCollapsed.value) && !rightPanelForcedOpen.value
)
const selectedWorkspace = computed(() => {
  return (
    workspaceFolders.value.find((folder) => folder.id === selectedWorkspaceId.value) ??
    workspaceFolders.value[0] ??
    staticWorkspaces[0]
  )
})

const workspaceStyle = computed(() => ({
  marginLeft: effectiveSidebarCollapsed.value ? '0px' : `${effectiveSidebarWidth.value}px`,
  borderRadius: effectiveSidebarCollapsed.value ? '0' : '9px 0 0 0'
}))

const sidebarStyle = computed(() => ({
  opacity: effectiveSidebarCollapsed.value ? 0 : 1,
  pointerEvents: effectiveSidebarCollapsed.value ? 'none' : 'auto',
  transform: effectiveSidebarCollapsed.value
    ? `translateX(-${effectiveSidebarWidth.value}px)`
    : 'translateX(0)'
}))

function createEmptyQuest(quest) {
  const workspace = selectedWorkspace.value
  const nextQuest = {
    id: quest?.id ?? createQuestId(),
    title: quest?.title || '新 Quest',
    prompt: '',
    intentMode: quest?.intentMode ?? 'auto',
    workspaceId: quest?.workspaceId ?? workspace.id,
    project: quest?.project ?? workspace.name,
    path: quest?.path ?? workspace.path,
    isEmpty: true
  }

  activeQuest.value = nextQuest

  if (!quest?.id) {
    sidebarQuestRequest.value = { ...nextQuest }
  }
}

async function openWorkspaceFolder() {
  try {
    const result = await window.api?.workspace?.openFolder?.()

    if (!result || result.canceled || !result.path) {
      return
    }

    const openedFolders =
      result.folders?.length > 0
        ? result.folders
        : [
            {
              name: result.name || getFolderName(result.path),
              path: result.path
            }
          ]

    openedFolders.forEach((folder) => {
      const nextWorkspace = normalizeWorkspaceFolder(folder)
      const existingWorkspace = workspaceFolders.value.find(
        (item) => normalizePath(item.path) === normalizePath(nextWorkspace.path)
      )

      if (existingWorkspace) {
        existingWorkspace.name = nextWorkspace.name
        existingWorkspace.path = nextWorkspace.path
        selectedWorkspaceId.value = existingWorkspace.id
        return
      }

      workspaceFolders.value.push(nextWorkspace)
      selectedWorkspaceId.value = nextWorkspace.id
    })
  } catch (error) {
    console.error('Failed to open workspace folder:', error)
  }
}

function selectWorkspaceFolder(workspaceId) {
  if (!workspaceFolders.value.some((folder) => folder.id === workspaceId)) {
    return
  }

  selectedWorkspaceId.value = workspaceId
}

function openQuest(quest) {
  if (typeof quest === 'string') {
    startQuest(quest)
    return
  }

  activeQuest.value = {
    id: quest?.id ?? 'local',
    title: quest?.title || '新 Quest',
    prompt: quest?.prompt ?? '',
    intentMode: quest?.intentMode ?? 'auto',
    workspaceId: quest?.workspaceId ?? selectedWorkspace.value.id,
    project: quest?.project ?? selectedWorkspace.value.name,
    path: quest?.path ?? selectedWorkspace.value.path,
    isEmpty: Boolean(quest?.isEmpty),
    runtimeRequestId: quest?.runtimeRequestId ?? ''
  }
}

function startQuest(prompt, options = {}) {
  const normalizedPrompt = prompt?.trim?.() ?? ''

  if (!normalizedPrompt) {
    return
  }

  const workspace = selectedWorkspace.value
  const shouldCreateRuntimeQuest = !activeQuest.value || activeQuest.value.isEmpty
  const promptTitle = normalizedPrompt.replace(/\s+/g, ' ').slice(0, 32)
  const nextQuest = {
    id: shouldCreateRuntimeQuest ? createQuestId() : activeQuest.value?.id ?? createQuestId(),
    title: shouldCreateRuntimeQuest ? promptTitle || '新 Quest' : activeQuest.value?.title || promptTitle || '新 Quest',
    prompt: normalizedPrompt,
    intentMode: options.intentMode ?? activeQuest.value?.intentMode ?? 'auto',
    workspaceId: activeQuest.value?.workspaceId ?? workspace.id,
    project: activeQuest.value?.project ?? workspace.name,
    path: activeQuest.value?.path ?? workspace.path,
    isEmpty: false,
    runtimeRequestId: `runtime-${Date.now()}`
  }

  activeQuest.value = nextQuest
  sidebarQuestRequest.value = { ...nextQuest, time: '本地' }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeWorkspaceFolder(folder) {
  const path = folder?.path || staticWorkspaces[0].path

  return {
    id: folder?.id || createWorkspaceId(path),
    name: folder?.name || getFolderName(path),
    path
  }
}

function createWorkspaceId(folderPath) {
  const normalizedPath = normalizePath(folderPath)
  let hash = 0

  for (let index = 0; index < normalizedPath.length; index += 1) {
    hash = Math.imul(31, hash) + normalizedPath.charCodeAt(index)
    hash |= 0
  }

  return `workspace-${Math.abs(hash)}`
}

function normalizePath(folderPath) {
  return String(folderPath || '')
    .replace(/\\/g, '/')
    .toLowerCase()
}

function getFolderName(folderPath) {
  return String(folderPath || '').split(/[\\/]/).filter(Boolean).pop() || folderPath
}

function createQuestId() {
  const id = `local-${Date.now()}-${nextStandaloneQuestId}`
  nextStandaloneQuestId += 1
  return id
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleRightPanel() {
  rightPanelForcedOpen.value = false
  rightPanelCollapsed.value = !rightPanelCollapsed.value
}

function openRightPanel() {
  rightPanelForcedOpen.value = true

  if (rightPanelCollapsed.value) {
    rightPanelCollapsed.value = false
  }
}

function openSettingsView() {
  settingsNavigation.value = null
  activeView.value = 'settings'
}

function openWorkbenchTaskInSettings(payload = {}) {
  settingsNavigation.value = {
    category: 'agent',
    taskId: String(payload.taskId || '').trim(),
    threadId: String(payload.threadId || '').trim(),
    sessionId: String(payload.sessionId || '').trim(),
    unitId: String(payload.unitId || '').trim(),
    workspace: payload.workspace || selectedWorkspace.value,
    requestedAt: Date.now()
  }
  activeView.value = 'settings'
}

function handleXoderDeepLink(payload = {}) {
  const taskId = String(payload.taskId || '').trim()

  if (!taskId) {
    return
  }

  openWorkbenchTaskInSettings({
    taskId,
    requestedAt: Date.now()
  })
}

function closeSettingsView() {
  activeView.value = 'workbench'
}

function startSidebarResize(event) {
  if (effectiveSidebarCollapsed.value || event.button !== 0) {
    return
  }

  event.preventDefault()
  const startX = event.clientX
  const startWidth = sidebarWidth.value
  isResizingSidebar.value = true
  document.body.classList.add('is-column-resizing')

  function handlePointerMove(moveEvent) {
    const nextWidth = startWidth + moveEvent.clientX - startX
    sidebarWidth.value = clamp(nextWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH)
  }

  function stopResize() {
    isResizingSidebar.value = false
    document.body.classList.remove('is-column-resizing')
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}

function resetSidebarWidth() {
  sidebarWidth.value = SIDEBAR_DEFAULT_WIDTH
}

function handleWindowResize() {
  viewportWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
  stopXoderDeepLink = window.api?.xoder?.onDeepLink?.(handleXoderDeepLink) || null
  window.api?.xoder?.getDeepLink?.().then(handleXoderDeepLink).catch(() => {})
})

onBeforeUnmount(() => {
  document.body.classList.remove('is-column-resizing')
  window.removeEventListener('resize', handleWindowResize)
  stopXoderDeepLink?.()
  stopXoderDeepLink = null
})
</script>

<template>
  <SettingsView
    v-if="activeView === 'settings'"
    :desktop-node-state="staticDesktopNodeState"
    :navigation-target="settingsNavigation"
    :workspace="selectedWorkspace"
    @back="closeSettingsView"
  />
  <div
    v-else
    class="workbench-shell"
    :class="{
      'is-resizing-sidebar': isResizingSidebar,
      'is-sidebar-collapsed': sidebarCollapsed
    }"
    :style="shellStyle"
  >
    <QuestSidebar
      :active-workspace-id="selectedWorkspace.id"
      :quest-request="sidebarQuestRequest"
      :workspaces="workspaceFolders"
      :style="sidebarStyle"
      @create-quest="createEmptyQuest"
      @open-quest="openQuest"
      @open-workspace-folder="openWorkspaceFolder"
      @select-workspace="selectWorkspaceFolder"
      @open-settings="openSettingsView"
      @toggle-sidebar="toggleSidebar"
    />
    <div
      v-if="!sidebarCollapsed"
      class="sidebar-resize-handle"
      role="separator"
      aria-label="调整左侧边栏宽度"
      aria-orientation="vertical"
      @pointerdown="startSidebarResize"
      @dblclick.prevent="resetSidebarWidth"
    />
    <main class="workspace-panel" :style="workspaceStyle">
      <TopBar
        :workspace-name="selectedWorkspace.name"
        :desktop-node-state="staticDesktopNodeState"
        :sidebar-collapsed="effectiveSidebarCollapsed"
        :can-toggle-right-panel="
          hasActiveQuest && (!isRightPanelAutoCollapsed || rightPanelForcedOpen)
        "
        :right-panel-collapsed="effectiveRightPanelCollapsed"
        @create-quest="createEmptyQuest"
        @toggle-sidebar="toggleSidebar"
        @toggle-right-panel="toggleRightPanel"
      />
      <QuestChatView
        v-if="!shouldShowHeroPrompt"
        :quest="activeQuest"
        :workspace="selectedWorkspace"
        :workspace-name="selectedWorkspace.name"
        :right-panel-collapsed="effectiveRightPanelCollapsed"
        @open-right-panel="openRightPanel"
        @open-workbench-task="openWorkbenchTaskInSettings"
      />
      <HeroPrompt
        v-else
        :workspace="selectedWorkspace"
        :workspaces="workspaceFolders"
        @open-workspace-folder="openWorkspaceFolder"
        @select-workspace="selectWorkspaceFolder"
        @start-quest="startQuest"
      />
    </main>
  </div>
</template>
