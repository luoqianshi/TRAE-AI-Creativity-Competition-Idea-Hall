<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  ArrowLeft,
  BadgeInfo,
  BookOpen,
  Bot,
  Box,
  ChevronDown,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  GitBranch,
  Github,
  Maximize2,
  Minimize2,
  Minus,
  Plug,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Upload,
  Users,
  Wifi,
  Workflow,
  X,
  Zap
} from 'lucide-vue-next'
import RemoteConfigView from './RemoteConfigView.vue'
import {
  staticDesktopNodeState,
  staticSettings,
  staticWorkspaces
} from '../static-data.js'

const props = defineProps({
  desktopNodeState: {
    type: Object,
    default: () => staticDesktopNodeState
  },
  navigationTarget: {
    type: Object,
    default: null
  },
  workspace: {
    type: Object,
    default: () => staticWorkspaces[0]
  }
})

const emit = defineEmits(['back'])

const activeCategory = ref('remote')
const language = ref('简体中文')
const browserType = ref('外部 Chrome')
const isWindowMaximized = ref(false)
const notificationToggles = ref({
  session: true,
  quest: true,
  repo: true
})
const modelToggles = ref({
  pro: true,
  flash: true
})
const indexAutoUpdate = ref(false)
const selectedStaticTaskId = ref(staticSettings.tasks[0]?.id || '')
const selectedControlPlaneTaskId = ref(
  staticDesktopNodeState.controlPlaneOverview.tasks[0]?.id || ''
)
const localStatus = ref('静态模式：不会保存、同步、入队或运行任何任务。')
const digitalEmployeeConfigPath = ref('')
const digitalEmployeeConfigExists = ref(false)
const digitalEmployeeBusy = ref(false)
const digitalEmployeeConfigScope = ref(props.workspace?.path ? 'workspace' : 'global')
const digitalEmployeeResolvedScope = ref(null)
const digitalEmployeeGitInfo = ref(null)
const digitalEmployeeGitStatus = reactive({
  kind: 'idle',
  text: '等待读取 Git 信息'
})
const digitalEmployeeTokenInput = ref('')
const digitalEmployeeClearToken = ref(false)
const digitalEmployeeStatus = reactive({
  kind: 'idle',
  text: '等待读取数字员工配置'
})
const digitalEmployeeForm = reactive({
  isolation: 'worktree',
  requireIsolation: true,
  provider: 'auto',
  remote: 'github',
  baseBranch: '',
  branchPrefix: 'xoder/employee',
  autoCommit: true,
  autoPush: false,
  createPr: false,
  prCreationMode: 'localCli',
  apiFallback: false,
  customPrCommand: '',
  prDraft: true,
  approvalPolicy: 'auto',
  allowOvernightFullAccess: false,
  tokenConfigured: false,
  tokenPreview: ''
})
let removeMaximizedListener

const navGroups = [
  [
    { id: 'general', label: '通用', icon: Settings },
    { id: 'remote', label: '远程连接', icon: Wifi },
    { id: 'mobile', label: '桌面节点', icon: Smartphone }
  ],
  [
    { id: 'model', label: '模型', icon: Box },
    { id: 'agent', label: '智能体', icon: Bot },
    { id: 'digital-employee', label: '数字员工', icon: Users },
    { id: 'skills', label: '技能与指令', icon: BookOpen },
    { id: 'control-plane', label: '控制平面', icon: Workflow },
    { id: 'worktree', label: 'Worktree', icon: GitBranch },
    { id: 'mcp', label: 'MCP 服务', icon: Workflow }
  ],
  [
    { id: 'index', label: '代码索引', icon: Database },
    { id: 'integrations', label: '集成', icon: Plug },
    { id: 'network', label: '网络诊断', icon: Wifi },
    { id: 'advanced', label: '高级', icon: BadgeInfo }
  ]
]

const allNavItems = computed(() => navGroups.flat())
const activeNavItem = computed(
  () => allNavItems.value.find((item) => item.id === activeCategory.value) ?? allNavItems.value[0]
)
const desktopNodeState = computed(() => props.desktopNodeState || staticDesktopNodeState)
const desktopNodeInfo = computed(() => desktopNodeState.value.node || staticDesktopNodeState.node)
const desktopNodeRuntime = computed(
  () => desktopNodeState.value.runtime || staticDesktopNodeState.runtime
)
const desktopNodeTasks = computed(() => desktopNodeState.value.tasks || staticDesktopNodeState.tasks)
const desktopNodeControlPlane = computed(
  () => desktopNodeState.value.controlPlane || staticDesktopNodeState.controlPlane
)
const controlPlaneNodes = computed(
  () => desktopNodeState.value.controlPlaneOverview?.nodes || staticDesktopNodeState.controlPlaneOverview.nodes
)
const controlPlaneTasks = computed(
  () => desktopNodeState.value.controlPlaneOverview?.tasks || staticDesktopNodeState.controlPlaneOverview.tasks
)
const selectedStaticTask = computed(
  () => staticSettings.tasks.find((task) => task.id === selectedStaticTaskId.value) || staticSettings.tasks[0]
)
const selectedControlPlaneTask = computed(
  () =>
    controlPlaneTasks.value.find((task) => task.id === selectedControlPlaneTaskId.value) ||
    controlPlaneTasks.value[0]
)
const hasDigitalEmployeeConfigApi = computed(() => Boolean(window.api?.digitalEmployeeConfig))
const digitalEmployeeWorkspaceLabel = computed(() => {
  const scope = digitalEmployeeResolvedScope.value

  if (digitalEmployeeConfigScope.value === 'global') {
    return '全局默认'
  }

  return scope?.repoRoot || props.workspace?.path || '当前工作区'
})
const digitalEmployeeDetectedRemotes = computed(() =>
  Array.isArray(digitalEmployeeGitInfo.value?.remotes) ? digitalEmployeeGitInfo.value.remotes : []
)
const digitalEmployeeProviderLabel = computed(() => {
  const provider =
    digitalEmployeeForm.provider === 'auto'
      ? digitalEmployeeGitInfo.value?.repo?.provider || 'auto'
      : digitalEmployeeForm.provider
  const labels = {
    auto: '自动识别',
    github: 'GitHub',
    gitee: 'Gitee',
    gitlab: 'GitLab',
    generic: '通用 Git',
    none: '不创建 PR'
  }

  return labels[provider] || provider
})
const digitalEmployeeReleaseSummary = computed(() => {
  if (digitalEmployeeForm.createPr) {
    return digitalEmployeeForm.prDraft ? '提交 + 推送 + Draft PR' : '提交 + 推送 + PR'
  }

  if (digitalEmployeeForm.autoPush) {
    return '提交 + 推送分支'
  }

  if (digitalEmployeeForm.autoCommit) {
    return '只提交本地分支'
  }

  return '只保留 worktree 和报告'
})
const digitalEmployeeApprovalSummary = computed(() => {
  if (digitalEmployeeForm.approvalPolicy === 'manual') {
    return '人工逐项确认'
  }

  if (digitalEmployeeForm.approvalPolicy === 'fullAccess') {
    return '全自动权限'
  }

  return 'AI 自动处理常规权限'
})

function setCategory(category) {
  activeCategory.value = category
}

function toggleNotification(key) {
  notificationToggles.value = {
    ...notificationToggles.value,
    [key]: !notificationToggles.value[key]
  }
}

function toggleModel(key) {
  modelToggles.value = {
    ...modelToggles.value,
    [key]: !modelToggles.value[key]
  }
}

function selectStaticTask(taskId) {
  selectedStaticTaskId.value = String(taskId || '').trim()
}

function selectControlPlaneTask(taskId) {
  selectedControlPlaneTaskId.value = String(taskId || '').trim()
}

async function loadDigitalEmployeeConfig() {
  if (!hasDigitalEmployeeConfigApi.value) {
    digitalEmployeeConfigPath.value = 'Xoder 用户数据目录 / digital-employee.config.json'
    digitalEmployeeStatus.kind = 'idle'
    digitalEmployeeStatus.text = '桌面端可保存数字员工配置'
    return
  }

  digitalEmployeeBusy.value = true
  digitalEmployeeStatus.kind = 'loading'
  digitalEmployeeStatus.text = '正在读取数字员工配置'

  try {
    const result = await window.api.digitalEmployeeConfig.get(
      digitalEmployeeConfigScope.value === 'workspace' ? props.workspace : null,
      {
        scope: digitalEmployeeConfigScope.value
      }
    )

    if (!result?.ok) {
      throw new Error(result?.error?.message || '读取数字员工配置失败')
    }

    digitalEmployeeConfigPath.value = result.configPath || ''
    digitalEmployeeConfigExists.value = Boolean(result.exists)
    digitalEmployeeResolvedScope.value = result.scope || null
    applyDigitalEmployeeConfig(result.config)
    if (digitalEmployeeConfigScope.value === 'workspace') {
      await detectDigitalEmployeeGitInfo({
        applySuggestion: !result.config?.activeProfile
      })
    }
    digitalEmployeeStatus.kind = 'success'
    digitalEmployeeStatus.text =
      digitalEmployeeConfigScope.value === 'workspace'
        ? result.exists
          ? '已加载当前仓库配置'
          : '已生成当前仓库配置草稿'
        : result.exists
          ? '已加载全局默认配置'
          : '已生成全局默认配置草稿'
  } catch (error) {
    digitalEmployeeStatus.kind = 'error'
    digitalEmployeeStatus.text = error?.message || '读取数字员工配置失败'
  } finally {
    digitalEmployeeBusy.value = false
  }
}

async function saveDigitalEmployeeConfig() {
  if (!hasDigitalEmployeeConfigApi.value) {
    digitalEmployeeStatus.kind = 'error'
    digitalEmployeeStatus.text = '需要在 Xoder 桌面端保存'
    return
  }

  digitalEmployeeBusy.value = true
  digitalEmployeeStatus.kind = 'loading'
  digitalEmployeeStatus.text = '正在保存数字员工配置'

  try {
    const result = await window.api.digitalEmployeeConfig.save(buildDigitalEmployeeConfig(), {
      scope: digitalEmployeeConfigScope.value,
      workspace: digitalEmployeeConfigScope.value === 'workspace' ? props.workspace : null
    })

    if (!result?.ok) {
      throw new Error(result?.error?.message || '保存数字员工配置失败')
    }

    digitalEmployeeConfigPath.value = result.configPath || digitalEmployeeConfigPath.value
    digitalEmployeeConfigExists.value = true
    digitalEmployeeResolvedScope.value = result.scope || digitalEmployeeResolvedScope.value
    applyDigitalEmployeeConfig(result.config)
    digitalEmployeeStatus.kind = 'success'
    digitalEmployeeStatus.text =
      digitalEmployeeConfigScope.value === 'workspace'
        ? '当前仓库配置已保存，下一次开始工作自动生效'
        : '全局默认配置已保存，下一次开始工作自动生效'
  } catch (error) {
    digitalEmployeeStatus.kind = 'error'
    digitalEmployeeStatus.text = error?.message || '保存数字员工配置失败'
  } finally {
    digitalEmployeeBusy.value = false
  }
}

async function detectDigitalEmployeeGitInfo(options = {}) {
  if (!hasDigitalEmployeeConfigApi.value || !window.api?.digitalEmployeeConfig?.detectGit) {
    digitalEmployeeGitStatus.kind = 'error'
    digitalEmployeeGitStatus.text = '桌面端暂不支持 Git 自动读取'
    return null
  }

  if (!props.workspace?.path) {
    digitalEmployeeGitStatus.kind = 'error'
    digitalEmployeeGitStatus.text = '请先选择工作区'
    return null
  }

  digitalEmployeeGitStatus.kind = 'loading'
  digitalEmployeeGitStatus.text = '正在读取当前仓库 Git 信息'

  try {
    const result = await window.api.digitalEmployeeConfig.detectGit(props.workspace)

    if (!result?.ok) {
      throw new Error(result?.error?.message || '读取 Git 信息失败')
    }

    digitalEmployeeGitInfo.value = result
    digitalEmployeeGitStatus.kind = 'success'
    digitalEmployeeGitStatus.text = `${result.repo?.provider || 'git'} / ${result.selectedRemote?.name || '无 remote'} / ${result.repo?.defaultBranch || '--'}`

    if (options.applySuggestion) {
      applyDetectedDigitalEmployeeGitInfo(result)
    }

    return result
  } catch (error) {
    digitalEmployeeGitInfo.value = null
    digitalEmployeeGitStatus.kind = 'error'
    digitalEmployeeGitStatus.text = error?.message || '读取 Git 信息失败'
    return null
  }
}

function applyDetectedDigitalEmployeeGitInfo(info = digitalEmployeeGitInfo.value) {
  const suggested = info?.suggested || {}

  if (!suggested.remote && !suggested.baseBranch && !suggested.provider) {
    return
  }

  digitalEmployeeForm.provider = suggested.provider || digitalEmployeeForm.provider || 'auto'
  digitalEmployeeForm.remote = suggested.remote || digitalEmployeeForm.remote
  digitalEmployeeForm.baseBranch = suggested.baseBranch || digitalEmployeeForm.baseBranch
  digitalEmployeeForm.branchPrefix = suggested.branchPrefix || digitalEmployeeForm.branchPrefix
}

function applyDigitalEmployeeConfig(config = {}) {
  const git = config.git || {}
  const github = config.github || {}
  const policy = config.policy || {}

  digitalEmployeeForm.isolation = git.isolation || 'worktree'
  digitalEmployeeForm.requireIsolation = git.requireIsolation !== false
  digitalEmployeeForm.provider = git.provider || 'auto'
  digitalEmployeeForm.remote = git.remote || 'github'
  digitalEmployeeForm.baseBranch = git.baseBranch || ''
  digitalEmployeeForm.branchPrefix = git.branchPrefix || 'xoder/employee'
  digitalEmployeeForm.autoCommit = git.autoCommit !== false
  digitalEmployeeForm.autoPush = Boolean(git.autoPush)
  digitalEmployeeForm.createPr = Boolean(git.createPr)
  digitalEmployeeForm.prCreationMode = git.prCreationMode || 'localCli'
  digitalEmployeeForm.apiFallback = Boolean(git.apiFallback)
  digitalEmployeeForm.customPrCommand = git.customPrCommand || ''
  digitalEmployeeForm.prDraft = git.prDraft !== false
  digitalEmployeeForm.approvalPolicy = policy.approvalPolicy || 'auto'
  digitalEmployeeForm.allowOvernightFullAccess = Boolean(policy.allowOvernightFullAccess)
  digitalEmployeeForm.tokenConfigured = Boolean(github.tokenConfigured)
  digitalEmployeeForm.tokenPreview = github.tokenPreview || ''
  digitalEmployeeTokenInput.value = ''
  digitalEmployeeClearToken.value = false
}

function buildDigitalEmployeeConfig() {
  return {
    git: {
      isolation: digitalEmployeeForm.isolation,
      requireIsolation: digitalEmployeeForm.requireIsolation,
      provider: digitalEmployeeForm.provider,
      remote: digitalEmployeeForm.remote,
      baseBranch: digitalEmployeeForm.baseBranch,
      branchPrefix: digitalEmployeeForm.branchPrefix,
      autoCommit: digitalEmployeeForm.autoCommit,
      autoPush: digitalEmployeeForm.autoPush,
      createPr: digitalEmployeeForm.createPr,
      prCreationMode: digitalEmployeeForm.prCreationMode,
      apiFallback: digitalEmployeeForm.apiFallback,
      customPrCommand: digitalEmployeeForm.customPrCommand,
      prDraft: digitalEmployeeForm.prDraft
    },
    github: {
      token: digitalEmployeeTokenInput.value,
      clearToken: digitalEmployeeClearToken.value
    },
    policy: {
      approvalPolicy: digitalEmployeeForm.approvalPolicy,
      allowOvernightFullAccess: digitalEmployeeForm.allowOvernightFullAccess
    }
  }
}

function toggleDigitalEmployeeGit(key) {
  digitalEmployeeForm[key] = !digitalEmployeeForm[key]

  if (key === 'autoCommit' && !digitalEmployeeForm.autoCommit) {
    digitalEmployeeForm.autoPush = false
    digitalEmployeeForm.createPr = false
  }

  if (key === 'autoPush' && !digitalEmployeeForm.autoPush) {
    digitalEmployeeForm.createPr = false
  }

  if (key === 'createPr' && digitalEmployeeForm.createPr) {
    digitalEmployeeForm.autoCommit = true
    digitalEmployeeForm.autoPush = true
  }
}

function toggleDigitalEmployeePolicy(key) {
  digitalEmployeeForm[key] = !digitalEmployeeForm[key]
}

function clearDigitalEmployeeToken() {
  digitalEmployeeTokenInput.value = ''
  digitalEmployeeClearToken.value = true
  digitalEmployeeForm.tokenConfigured = false
  digitalEmployeeForm.tokenPreview = ''
}

function showNoop(message) {
  localStatus.value = message
  window.setTimeout(() => {
    if (localStatus.value === message) {
      localStatus.value = '静态模式：不会保存、同步、入队或运行任何任务。'
    }
  }, 2200)
}

function formatStatus(value) {
  const labels = {
    completed: '已完成',
    planned: '计划中',
    preview: '预览',
    idle: '待命',
    static: '静态'
  }

  return labels[value] || value || '静态'
}

function formatDateTime(value) {
  if (!value) {
    return '--'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

watch(
  () => props.navigationTarget,
  (target) => {
    if (target?.category) {
      activeCategory.value = target.category
    }

    if (target?.taskId) {
      selectedStaticTaskId.value = target.taskId
    }
  },
  { immediate: true }
)

watch(activeCategory, (category) => {
  if (category === 'digital-employee' && !digitalEmployeeConfigPath.value) {
    loadDigitalEmployeeConfig()
  }
})

watch(digitalEmployeeConfigScope, () => {
  if (activeCategory.value === 'digital-employee') {
    loadDigitalEmployeeConfig()
  }
})

watch(
  () => props.workspace?.path,
  () => {
    if (activeCategory.value === 'digital-employee') {
      loadDigitalEmployeeConfig()
    }
  }
)

onMounted(async () => {
  const currentState = await window.api?.windowControls?.isMaximized?.()

  if (typeof currentState === 'boolean') {
    isWindowMaximized.value = currentState
  }

  removeMaximizedListener = window.api?.windowControls?.onMaximizedChange?.((nextState) => {
    isWindowMaximized.value = nextState
  })

  loadDigitalEmployeeConfig()
})

onBeforeUnmount(() => {
  removeMaximizedListener?.()
})
</script>

<template>
  <section class="settings-shell">
    <aside class="settings-sidebar">
      <button class="settings-back" type="button" @click="emit('back')">
        <ArrowLeft :size="16" />
        返回
      </button>

      <div class="settings-nav">
        <nav v-for="(group, groupIndex) in navGroups" :key="groupIndex" class="settings-nav-group">
          <button
            v-for="item in group"
            :key="item.id"
            class="settings-nav-item"
            type="button"
            :class="{ 'is-active': activeCategory === item.id }"
            @click="setCategory(item.id)"
          >
            <component :is="item.icon" :size="16" />
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </div>
    </aside>

    <main class="settings-main">
      <header class="settings-titlebar">
        <div class="settings-titlebar-left">
          <component :is="activeNavItem.icon" :size="15" />
          <strong>{{ activeNavItem.label }}</strong>
          <span>{{ localStatus }}</span>
        </div>
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
      </header>

      <div class="settings-content">
        <section v-if="activeCategory === 'general'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>通用</h1>
              <p>通用偏好保留为本地内存状态，刷新后恢复默认 fixture。</p>
            </div>
          </div>

          <div class="settings-card">
            <div class="settings-row">
              <div>
                <strong>界面语言</strong>
                <p>只影响当前页面展示，不写入配置文件。</p>
              </div>
              <label class="settings-select">
                <select v-model="language">
                  <option>简体中文</option>
                  <option>English</option>
                </select>
                <ChevronDown :size="14" />
              </label>
            </div>
            <div class="settings-row">
              <div>
                <strong>通知</strong>
                <p>本地开关，仅用于静态展示。</p>
              </div>
              <div class="agent-config-actions">
                <button
                  v-for="(_, key) in notificationToggles"
                  :key="key"
                  class="settings-small-button"
                  type="button"
                  :class="{ 'is-active': notificationToggles[key] }"
                  @click="toggleNotification(key)"
                >
                  {{ key }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <RemoteConfigView
          v-else-if="activeCategory === 'remote'"
          :workspace="workspace"
        />

        <section v-else-if="activeCategory === 'mobile'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>桌面节点</h1>
              <p>节点状态来自静态 fixture，不注册、不同步、不拉取远程任务。</p>
            </div>
            <button class="settings-small-button" type="button" disabled>
              <CheckCircle2 :size="13" />
              静态模式
            </button>
          </div>

          <section class="settings-section">
            <h2>本地节点</h2>
            <div class="settings-card">
              <div class="settings-row">
                <div>
                  <strong>{{ desktopNodeInfo.deviceName }}</strong>
                  <p>{{ desktopNodeInfo.statusLabel }}</p>
                </div>
                <span class="settings-status-pill">{{ formatStatus(desktopNodeInfo.status) }}</span>
              </div>
              <div class="settings-row">
                <div>
                  <strong>队列</strong>
                  <p>排队 {{ desktopNodeRuntime.queuedCount }} / 运行 {{ desktopNodeRuntime.runningCount }} / 完成 {{ desktopNodeRuntime.completedCount }}</p>
                </div>
                <button class="settings-small-button" type="button" disabled>立即执行</button>
              </div>
              <div class="settings-row">
                <div>
                  <strong>节点配置</strong>
                  <p>保存、远程控制、保活和自动运行都已禁用。</p>
                </div>
                <button
                  class="settings-secondary-button"
                  type="button"
                  disabled
                  @click="showNoop('静态模式：不会保存桌面节点配置。')"
                >
                  保存节点配置
                </button>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>最近任务</h2>
            <div class="settings-stack desktop-node-task-stack">
              <article
                v-for="task in desktopNodeTasks"
                :key="task.id"
                class="desktop-node-task-card"
              >
                <div class="workspace-overview-item-head">
                  <strong>{{ task.title }}</strong>
                  <span>{{ formatStatus(task.status) }}</span>
                </div>
                <p>{{ task.summary }}</p>
                <div class="desktop-node-task-meta">
                  <span>{{ task.source }}</span>
                  <span>{{ formatDateTime(task.updatedAt) }}</span>
                </div>
              </article>
            </div>
          </section>
        </section>

        <section v-else-if="activeCategory === 'model'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>模型</h1>
              <p>模型配置只读展示，不读取或保存 API Key。</p>
            </div>
          </div>

          <div class="settings-card">
            <div
              v-for="row in staticSettings.modelRows"
              :key="row.key"
              class="settings-row"
            >
              <div>
                <strong>{{ row.name }}</strong>
                <p>{{ row.provider }} · {{ row.billing }}</p>
              </div>
              <button
                class="settings-switch"
                type="button"
                :class="{ 'is-on': modelToggles[row.key] }"
                @click="toggleModel(row.key)"
              >
                <span />
              </button>
            </div>
            <div class="settings-row">
              <div>
                <strong>OpenAI-Compatible 配置</strong>
                <p>Base URL、Model、API Key 保存入口已移除。</p>
              </div>
              <button class="settings-secondary-button" type="button" disabled>保存模型配置</button>
            </div>
          </div>
        </section>

        <section v-else-if="activeCategory === 'agent'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>智能体</h1>
              <p>这里展示固定任务视图，不连接 conversation runtime 或 workbench。</p>
            </div>
            <button class="settings-small-button" type="button" disabled>
              <Plus :size="13" />
              新建任务
            </button>
          </div>

          <section class="settings-section">
            <h2>静态任务</h2>
            <div class="settings-stack desktop-node-task-stack">
              <article
                v-for="task in staticSettings.tasks"
                :key="task.id"
                class="desktop-node-task-card"
                :class="{ 'is-selected': selectedStaticTask?.id === task.id }"
                @click="selectStaticTask(task.id)"
              >
                <div class="workspace-overview-item-head">
                  <strong>{{ task.title }}</strong>
                  <span>{{ formatStatus(task.status) }}</span>
                </div>
                <p>{{ task.summary }}</p>
              </article>
            </div>
            <div v-if="selectedStaticTask" class="settings-card task-detail-card">
              <div class="settings-row">
                <div>
                  <strong>{{ selectedStaticTask.title }}</strong>
                  <p>{{ selectedStaticTask.summary }}</p>
                </div>
                <button class="settings-small-button" type="button" disabled>运行</button>
              </div>
            </div>
          </section>
        </section>

        <section v-else-if="activeCategory === 'digital-employee'" class="settings-page digital-employee-page">
          <div class="settings-page-head">
            <div>
              <h1>数字员工</h1>
              <p>配置本地阶段式团队、隔离工作区、自动提交、推送和 PR。Git remote 会自动识别 GitHub、Gitee、GitLab 或通用 Git。</p>
            </div>
            <div class="agent-config-actions is-inline">
              <button
                class="settings-small-button"
                type="button"
                :disabled="digitalEmployeeBusy"
                @click="loadDigitalEmployeeConfig"
              >
                <RefreshCw :size="13" />
                读取
              </button>
              <button
                class="settings-small-button"
                type="button"
                :disabled="digitalEmployeeBusy || digitalEmployeeConfigScope !== 'workspace'"
                @click="detectDigitalEmployeeGitInfo({ applySuggestion: true })"
              >
                <GitBranch :size="13" />
                自动读取 Git
              </button>
              <button
                class="settings-primary-button"
                type="button"
                :disabled="digitalEmployeeBusy"
                @click="saveDigitalEmployeeConfig"
              >
                <Save :size="13" />
                保存配置
              </button>
            </div>
          </div>

          <section class="settings-section remote-config-overview">
            <div class="remote-config-metric">
              <Users :size="18" />
              <div>
                <strong>Xoder 阶段式团队</strong>
                <span>Leader / Architect / Dev / QA / Review</span>
              </div>
            </div>
            <div class="remote-config-metric">
              <GitBranch :size="18" />
              <div>
                <strong>{{ digitalEmployeeReleaseSummary }}</strong>
                <span>{{ digitalEmployeeForm.remote || 'github' }} / {{ digitalEmployeeForm.branchPrefix }}</span>
              </div>
            </div>
            <div class="remote-config-metric">
              <ShieldCheck :size="18" />
              <div>
                <strong>{{ digitalEmployeeApprovalSummary }}</strong>
                <span>{{ digitalEmployeeProviderLabel }} / {{ digitalEmployeeForm.tokenConfigured ? `Token ${digitalEmployeeForm.tokenPreview}` : 'Token 未配置' }}</span>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>团队运行方式</h2>
            <div class="settings-card">
              <div class="settings-row">
                <div>
                  <strong>当前实现</strong>
                  <p>备用 agent 的原生 /team、/employee 属于交互 UI 命令，headless stream-json 下不能稳定调用；Xoder 现在用本地编排的阶段式团队实现。</p>
                </div>
                <span class="settings-status-pill is-success">可用</span>
              </div>
              <div class="settings-row">
                <div>
                  <strong>隔离工作区</strong>
                  <p>默认在仓库旁创建 .xoder-worktrees，数字员工只在隔离分支里写代码，方便你第二天核对。</p>
                </div>
                <label class="settings-select">
                  <select v-model="digitalEmployeeForm.isolation">
                    <option value="worktree">Git worktree</option>
                    <option value="none">直接使用当前工作区</option>
                  </select>
                  <ChevronDown :size="14" />
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <strong>强制隔离</strong>
                  <p>开启后 worktree 创建失败就停止任务；关闭后会退回当前工作区执行。</p>
                </div>
                <button
                  class="settings-switch"
                  type="button"
                  :class="{ 'is-on': digitalEmployeeForm.requireIsolation }"
                  @click="toggleDigitalEmployeeGit('requireIsolation')"
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>Git 与 PR 发布</h2>
            <div class="settings-card remote-config-card">
              <div class="settings-row">
                <div>
                  <strong>配置作用域</strong>
                  <p>{{ digitalEmployeeWorkspaceLabel }}</p>
                </div>
                <label class="settings-select">
                  <select v-model="digitalEmployeeConfigScope">
                    <option value="workspace">当前仓库</option>
                    <option value="global">全局默认</option>
                  </select>
                  <ChevronDown :size="14" />
                </label>
              </div>
              <div class="remote-config-form">
                <label class="settings-field">
                  <span>托管平台</span>
                  <select v-model="digitalEmployeeForm.provider">
                    <option value="auto">自动识别</option>
                    <option value="github">GitHub</option>
                    <option value="gitee">Gitee</option>
                    <option value="gitlab">GitLab</option>
                    <option value="generic">通用 Git</option>
                    <option value="none">不创建 PR</option>
                  </select>
                </label>
                <label class="settings-field">
                  <span>Git remote</span>
                  <select v-if="digitalEmployeeDetectedRemotes.length" v-model="digitalEmployeeForm.remote">
                    <option
                      v-for="remote in digitalEmployeeDetectedRemotes"
                      :key="remote.name"
                      :value="remote.name"
                    >
                      {{ remote.name }} - {{ remote.provider }}
                    </option>
                  </select>
                  <input v-else v-model.trim="digitalEmployeeForm.remote" placeholder="github / origin / gitee" />
                </label>
                <label class="settings-field">
                  <span>Base branch</span>
                  <input v-model.trim="digitalEmployeeForm.baseBranch" placeholder="留空则从当前 HEAD 创建，或填 main / origin/main" />
                </label>
                <label class="settings-field">
                  <span>分支前缀</span>
                  <input v-model.trim="digitalEmployeeForm.branchPrefix" placeholder="xoder/employee" />
                </label>
                <label class="settings-field">
                  <span>API 兜底 Token</span>
                  <input
                    v-model.trim="digitalEmployeeTokenInput"
                    type="password"
                    :placeholder="digitalEmployeeForm.tokenConfigured ? `已配置 ${digitalEmployeeForm.tokenPreview}，留空则保留` : '本地 CLI 不需要；API 兜底才需要'"
                    @input="digitalEmployeeClearToken = false"
                  />
                </label>
                <label class="settings-field">
                  <span>PR 创建方式</span>
                  <select v-model="digitalEmployeeForm.prCreationMode">
                    <option value="localCli">只用本地 CLI</option>
                    <option value="localThenApi">本地 CLI 优先，失败后 API</option>
                    <option value="api">只用 API</option>
                  </select>
                </label>
                <label class="settings-field">
                  <span>自定义本地 PR 命令</span>
                  <input
                    v-model.trim="digitalEmployeeForm.customPrCommand"
                    placeholder="例如: your-cli pr create --title {title} --base {base} --head {head}"
                  />
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <strong>自动读取 Git</strong>
                  <p>{{ digitalEmployeeGitInfo?.selectedRemote?.fetchUrl || digitalEmployeeGitInfo?.repo?.root || '当前工作区未读取 Git 信息' }}</p>
                </div>
                <span class="settings-status-pill" :class="`is-${digitalEmployeeGitStatus.kind}`">
                  {{ digitalEmployeeGitStatus.text }}
                </span>
              </div>
              <div class="settings-row">
                <div>
                  <strong>本地环境优先</strong>
                  <p>GitHub 使用 gh，GitLab 使用 glab，自定义平台使用命令模板；API Token 只在你选择 API 或 API 兜底时使用。</p>
                </div>
                <span class="settings-status-pill">
                  {{ digitalEmployeeForm.prCreationMode === 'api' ? 'API' : 'Local CLI' }}
                </span>
              </div>
              <div class="settings-row">
                <div>
                  <strong>API 兜底 Token</strong>
                  <p>{{ digitalEmployeeForm.tokenConfigured ? `已配置 ${digitalEmployeeForm.tokenPreview}` : '未配置；本地 CLI 创建 PR/MR 不受影响。' }}</p>
                </div>
                <button
                  class="settings-small-button"
                  type="button"
                  :disabled="!digitalEmployeeForm.tokenConfigured && !digitalEmployeeTokenInput"
                  @click="clearDigitalEmployeeToken"
                >
                  清除 Token
                </button>
              </div>
              <div class="settings-row">
                <div>
                  <strong>API 失败兜底</strong>
                  <p>仅在“只用本地 CLI”模式下可选；打开后本地命令失败会尝试平台 API。</p>
                </div>
                <button
                  class="settings-switch"
                  type="button"
                  :class="{ 'is-on': digitalEmployeeForm.apiFallback }"
                  @click="toggleDigitalEmployeeGit('apiFallback')"
                >
                  <span />
                </button>
              </div>
              <div class="settings-row">
                <div>
                  <strong>配置文件</strong>
                  <p>{{ digitalEmployeeConfigPath || '--' }}</p>
                </div>
                <span class="settings-status-pill" :class="`is-${digitalEmployeeStatus.kind}`">
                  {{ digitalEmployeeStatus.text }}
                </span>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>自动发布策略</h2>
            <div class="settings-card">
              <div class="settings-row">
                <div>
                  <strong>自动提交 Commit</strong>
                  <p>agent 完成后由 Xoder 收集改动并创建本地 commit。</p>
                </div>
                <button
                  class="settings-switch"
                  type="button"
                  :class="{ 'is-on': digitalEmployeeForm.autoCommit }"
                  @click="toggleDigitalEmployeeGit('autoCommit')"
                >
                  <span />
                </button>
              </div>
              <div class="settings-row">
                <div>
                  <strong>自动 Push</strong>
                  <p>commit 成功后推送到配置的 remote；没有 commit 时会自动跳过。</p>
                </div>
                <button
                  class="settings-switch"
                  type="button"
                  :class="{ 'is-on': digitalEmployeeForm.autoPush }"
                  @click="toggleDigitalEmployeeGit('autoPush')"
                >
                  <span />
                </button>
              </div>
              <div class="settings-row">
                <div>
                  <strong>创建 PR</strong>
                  <p>push 成功后优先用本机 gh/glab 或自定义命令创建 PR/MR；需要时才走平台 API。</p>
                </div>
                <button
                  class="settings-switch"
                  type="button"
                  :class="{ 'is-on': digitalEmployeeForm.createPr }"
                  @click="toggleDigitalEmployeeGit('createPr')"
                >
                  <span />
                </button>
              </div>
              <div class="settings-row">
                <div>
                  <strong>Draft PR</strong>
                  <p>默认创建 Draft PR，适合第二天早上核对后再转为 Ready。</p>
                </div>
                <button
                  class="settings-switch"
                  type="button"
                  :class="{ 'is-on': digitalEmployeeForm.prDraft }"
                  @click="toggleDigitalEmployeeGit('prDraft')"
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>权限策略</h2>
            <div class="settings-card">
              <div class="settings-row">
                <div>
                  <strong>默认审批模式</strong>
                  <p>控制数字员工发起任务时的默认权限意图；聊天输入框里的模式仍可覆盖本次任务。</p>
                </div>
                <label class="settings-select">
                  <select v-model="digitalEmployeeForm.approvalPolicy">
                    <option value="manual">人工确认</option>
                    <option value="auto">AI 自动处理常规权限</option>
                    <option value="fullAccess">全自动权限</option>
                  </select>
                  <ChevronDown :size="14" />
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <strong>允许通宵全自动</strong>
                  <p>这是一个显式风险开关，用来标记你允许“无人值守写代码 + 发布准备”的工作流。</p>
                </div>
                <button
                  class="settings-switch"
                  type="button"
                  :class="{ 'is-on': digitalEmployeeForm.allowOvernightFullAccess }"
                  @click="toggleDigitalEmployeePolicy('allowOvernightFullAccess')"
                >
                  <span />
                </button>
              </div>
              <div class="settings-row">
                <div>
                  <strong>当前状态</strong>
                  <p>{{ digitalEmployeeConfigExists ? '本机配置已持久化，打包后修改仍然生效。' : '当前是默认草稿，保存后会写入用户数据目录。' }}</p>
                </div>
                <CheckCircle2 :size="17" />
              </div>
            </div>
          </section>
        </section>

        <section v-else-if="activeCategory === 'control-plane'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>控制平面</h1>
              <p>控制平面只读展示，不连接服务器、不下发命令。</p>
            </div>
            <button class="settings-small-button" type="button" disabled>同步节点</button>
          </div>

          <section class="settings-section">
            <h2>连接状态</h2>
            <div class="settings-card">
              <div class="settings-row">
                <div>
                  <strong>{{ desktopNodeControlPlane.statusLabel }}</strong>
                  <p>远程节点 ID：{{ desktopNodeControlPlane.remoteNodeId }}</p>
                </div>
                <span class="settings-status-pill">{{ formatStatus(desktopNodeControlPlane.status) }}</span>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>节点</h2>
            <div class="settings-card workspace-overview-list-card">
              <div class="workspace-overview-list">
                <article
                  v-for="node in controlPlaneNodes"
                  :key="node.id"
                  class="workspace-overview-item"
                >
                  <div class="workspace-overview-item-head">
                    <strong>{{ node.name }}</strong>
                    <span>{{ formatStatus(node.status) }}</span>
                  </div>
                  <p>{{ node.logs?.[0]?.message || '静态节点示例' }}</p>
                  <div class="desktop-node-task-meta">
                    <span>{{ node.id }}</span>
                    <span>{{ formatDateTime(node.updatedAt) }}</span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>服务端任务</h2>
            <div class="settings-card workspace-overview-list-card">
              <div class="workspace-overview-list">
                <article
                  v-for="task in controlPlaneTasks"
                  :key="task.id"
                  class="workspace-overview-item"
                  :class="{ 'is-selected': selectedControlPlaneTask?.id === task.id }"
                  @click="selectControlPlaneTask(task.id)"
                >
                  <div class="workspace-overview-item-head">
                    <strong>{{ task.title }}</strong>
                    <span>{{ formatStatus(task.status) }}</span>
                  </div>
                  <p>{{ task.prompt }}</p>
                  <div class="desktop-node-task-meta">
                    <span>{{ task.assignedNodeId || task.targetNodeId || '未分配' }}</span>
                    <span>{{ formatDateTime(task.updatedAt) }}</span>
                  </div>
                </article>
              </div>
            </div>
            <div v-if="selectedControlPlaneTask" class="settings-card task-detail-card">
              <div class="settings-row">
                <div>
                  <strong>{{ selectedControlPlaneTask.title }}</strong>
                  <p>{{ selectedControlPlaneTask.result?.handoff?.nextAction }}</p>
                </div>
                <button class="settings-small-button" type="button" disabled>下发命令</button>
              </div>
            </div>
          </section>
        </section>

        <section v-else-if="activeCategory === 'skills'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>技能与指令</h1>
              <p>技能和指令管理暂保留静态占位。</p>
            </div>
          </div>

          <section class="settings-section">
            <h2>技能</h2>
            <div class="settings-empty-card is-compact">
              <strong>当前没有接入技能管理</strong>
              <p>导入、新建和同步都已禁用。</p>
              <div>
                <button class="settings-small-button" type="button" disabled>
                  <Upload :size="13" />
                  导入
                </button>
                <button class="settings-small-button" type="button" disabled>
                  <Plus :size="13" />
                  新建
                </button>
              </div>
            </div>
          </section>
        </section>

        <section v-else-if="activeCategory === 'mcp'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>MCP 服务</h1>
              <p>MCP 服务列表为静态占位，不注册工具。</p>
            </div>
            <button class="settings-small-button" type="button" disabled>
              <Plus :size="13" />
              添加
            </button>
          </div>

          <section class="settings-section">
            <h2 class="is-underlined">我的服务</h2>
            <div class="settings-empty-card mcp-empty">
              <div class="empty-illustration">
                <FileText :size="34" />
              </div>
              <p>当前没有已配置的 MCP 服务。</p>
            </div>
          </section>
        </section>

        <section v-else-if="activeCategory === 'index'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>代码索引</h1>
              <p>索引能力静态展示，不扫描、不持久化。</p>
            </div>
          </div>

          <div class="settings-card">
            <div class="settings-row">
              <div>
                <strong>代码索引</strong>
                <p class="success-line">
                  <CheckCircle2 :size="13" />
                  静态索引展示
                </p>
              </div>
              <button class="settings-small-button" type="button" disabled>更新</button>
            </div>
            <div class="settings-row">
              <div>
                <strong>自动更新</strong>
                <p>本地开关，不触发扫描。</p>
              </div>
              <button
                class="settings-switch"
                type="button"
                :class="{ 'is-on': indexAutoUpdate }"
                @click="indexAutoUpdate = !indexAutoUpdate"
              >
                <span />
              </button>
            </div>
          </div>
        </section>

        <section v-else-if="activeCategory === 'integrations'" class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>集成</h1>
              <p>第三方连接入口只读展示。</p>
            </div>
          </div>

          <section class="settings-section">
            <h2>内置能力</h2>
            <div class="settings-card">
              <div class="settings-row">
                <div>
                  <strong>浏览器类型</strong>
                  <p>仅作为本地展示选项。</p>
                </div>
                <label class="settings-select">
                  <select v-model="browserType">
                    <option>外部 Chrome</option>
                    <option>内置浏览器</option>
                  </select>
                  <ChevronDown :size="14" />
                </label>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>第三方服务</h2>
            <div class="settings-card">
              <div class="integration-row">
                <Github :size="24" />
                <div>
                  <strong>GitHub</strong>
                  <p>{{ staticSettings.integrations[0].detail }}</p>
                </div>
                <button class="settings-small-button" type="button" disabled>
                  连接
                  <ExternalLink :size="12" />
                </button>
              </div>
              <div class="integration-row">
                <Zap :size="24" />
                <div>
                  <strong>Supabase</strong>
                  <p>{{ staticSettings.integrations[1].detail }}</p>
                </div>
                <button class="settings-small-button" type="button" disabled>
                  连接
                  <ExternalLink :size="12" />
                </button>
              </div>
            </div>
          </section>
        </section>

        <section v-else class="settings-page">
          <div class="settings-page-head">
            <div>
              <h1>{{ activeNavItem.label }}</h1>
              <p>该页面保留静态占位，不接入动态服务。</p>
            </div>
          </div>
          <div class="settings-empty-card">
            <component :is="activeNavItem.icon" :size="28" />
            <strong>当前暂无动态配置</strong>
            <p>{{ activeNavItem.label }} 已静态化。</p>
          </div>
        </section>
      </div>
    </main>
  </section>
</template>
