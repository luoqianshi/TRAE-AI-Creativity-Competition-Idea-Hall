<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MarkdownContent from './MarkdownContent.vue'
import PromptComposer from './PromptComposer.vue'
import QuestRightPanel from './QuestRightPanel.vue'
import {
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CornerDownRight,
  Download,
  FileDiff,
  FileText,
  GitBranch,
  Monitor,
  Pause,
  Play,
  Sparkles
} from 'lucide-vue-next'
import { getStaticMessagesForQuest, staticRightPanel } from '../static-data.js'

const props = defineProps({
  quest: {
    type: Object,
    required: true
  },
  rightPanelCollapsed: {
    type: Boolean,
    default: false
  },
  workspace: {
    type: Object,
    default: () => ({
      name: 'NLP 课程',
      path: 'F:/学习/AI学习/NLP课程'
    })
  },
  workspaceName: {
    type: String,
    default: 'NLP 课程'
  }
})

const emit = defineEmits(['open-right-panel', 'open-workbench-task'])

const RIGHT_PANEL_DEFAULT_WIDTH = 480
const RIGHT_PANEL_MIN_WIDTH = 360
const RIGHT_PANEL_MAX_WIDTH = 760
const CHAT_MIN_WIDTH = 420
const RIGHT_PANEL_MIN_VIEWPORT = 1180

const chatShell = ref(null)
const chatScroll = ref(null)
const rightPanel = ref(null)
const rightPanelWidth = ref(RIGHT_PANEL_DEFAULT_WIDTH)
const isResizingRightPanel = ref(false)
const messages = ref([])
const runtimeSessionId = ref('')
const runtimeStatus = ref('idle')
const runtimeMetadata = ref(null)
const runtimeEvents = ref([])
const runtimeTools = ref([])
const runtimeArtifacts = ref([])
const runtimeLogs = ref([])
const runtimeThoughts = ref([])
const runtimePermissions = ref([])
const runtimeQuestions = ref([])
const runtimePlans = ref([])
const runtimeTasks = ref([])
const runtimeRunOptions = ref({})
const digitalJobId = ref('')
const digitalJob = ref(null)
const runtimeReview = ref({
  additions: 0,
  deletions: 0,
  files: []
})
const currentAssistantMessageId = ref('')
const startedRuntimeRequestIds = new Set()
let unsubscribeAgentRuntime = null
let unsubscribeDigitalEmployee = null

const AGENT_DISPLAY_NAMES = ['Lee', 'Taylor', 'Felix', 'Jay', 'Robin', 'Morgan', 'Casey']
const AGENT_TONES = ['tone-pink', 'tone-green', 'tone-cyan', 'tone-mint']

const workspaceDisplayName = computed(
  () => props.workspaceName || props.workspace?.name || '当前工作区'
)
const questTitle = computed(() => props.quest?.title || '新 Quest')
const latestAssistantMessage = computed(() =>
  [...messages.value].reverse().find((message) => message.role === 'assistant')
)
const pendingRuntimeQuestions = computed(() =>
  runtimeQuestions.value.filter((question) => question.status === 'pending')
)
const pinnedQuestionCard = computed(() => pendingRuntimeQuestions.value.at(-1) || null)
const hasRuntimeActivity = computed(
  () =>
    Boolean(runtimeSessionId.value) ||
    Boolean(digitalJobId.value) ||
    runtimeStatus.value !== 'idle' ||
    Boolean(props.quest?.runtimeRequestId)
)
const isRuntimeBusy = computed(
  () => ['starting', 'running', 'paused'].includes(runtimeStatus.value)
)
const runtimeStatusLabel = computed(() => {
  const labels = {
    idle: '静态模式',
    starting: '启动中',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已停止'
  }

  return labels[runtimeStatus.value] || runtimeStatus.value
})
const rightPanelRunState = computed(() => {
  if (!hasRuntimeActivity.value) {
    return {
      ...staticRightPanel,
      title: questTitle.value,
      workspace: props.workspace,
      status: 'static',
      statusLabel: '静态模式',
      message: latestAssistantMessage.value || null
    }
  }

  const metadata = runtimeMetadata.value || {}
  const taskItems = runtimeTasks.value.map((task) => ({
    id: task.id,
    title: task.title || task.agentType || 'Agent task',
    detail: task.detail || task.description || task.summary || task.status,
    preview: task.preview || task.output || '',
    status: task.status,
    agentType: task.agentType || '',
    source: task.source || ''
  }))
  const toolItems = runtimeTools.value.map((tool) => ({
    id: tool.id,
    title: tool.name,
    detail: tool.summary || tool.detail || tool.status,
    preview: tool.inputPreview || tool.outputPreview || tool.detail || '',
    status: tool.status
  }))
  const progressItems = taskItems.length
    ? [...taskItems, ...toolItems.slice(-4)]
    : toolItems.length
      ? toolItems
      : [
          {
            id: 'runtime-starting',
            title: 'Waiting for agent events',
            detail: runtimeStatusLabel.value,
            status: runtimeStatus.value === 'failed' ? 'failed' : 'running'
          }
        ]

  return {
    ...staticRightPanel,
    title: questTitle.value,
    workspace: props.workspace,
    status: runtimeStatus.value,
    statusLabel: runtimeStatusLabel.value,
    sessionId: runtimeSessionId.value,
    metadata,
    message: latestAssistantMessage.value || null,
    liveSummary: {
      source:
        metadata.provider === 'xoder-digital-employee' ? 'digital-employee' : 'agent-runtime',
      stageLabel:
        metadata.teamMode || metadata.branch || metadata.model || 'Claude Code Adapter',
      status: runtimeStatus.value,
      text:
        latestAssistantMessage.value?.content ||
        runtimeThoughts.value.at(-1)?.text ||
        runtimeLogs.value.at(-1)?.message ||
        'Xoder 正在等待备用 agent 的流式事件。'
    },
    progressTasks: progressItems,
    artifacts: runtimeArtifacts.value,
    review: runtimeReview.value,
    questions: runtimeQuestions.value,
    plans: runtimePlans.value,
    tasks: runtimeTasks.value,
    references: [
      {
        id: 'runtime-model',
        title: metadata.model ? `模型：${metadata.model}` : '模型：等待初始化',
        detail: metadata.version ? `Claude Code ${metadata.version}` : '来自备用 agent runtime'
      },
      {
        id: 'runtime-tools',
        title: `工具：${Array.isArray(metadata.tools) ? metadata.tools.length : 0}`,
        detail: Array.isArray(metadata.tools) ? metadata.tools.slice(0, 10).join(', ') : ''
      },
      {
        id: 'runtime-review',
        title: `Review +${runtimeReview.value.additions || 0} -${runtimeReview.value.deletions || 0}`,
        detail: `${runtimeReview.value.files?.length || 0} changed file event(s)`
      }
    ],
    logs: runtimeLogs.value.length ? runtimeLogs.value : staticRightPanel.logs,
    thoughts: runtimeThoughts.value,
    tools: runtimeTools.value,
    events: runtimeEvents.value
  }
})

const chatStyle = computed(() => ({
  '--right-panel-width': `${rightPanelWidth.value}px`
}))

const chatMainStyle = computed(() => ({
  marginRight: props.rightPanelCollapsed ? '0px' : `${rightPanelWidth.value}px`,
  borderRightColor: props.rightPanelCollapsed ? 'transparent' : '#e7e7e6'
}))

const rightPanelStyle = computed(() => ({
  opacity: props.rightPanelCollapsed ? 0 : 1,
  pointerEvents: props.rightPanelCollapsed ? 'none' : 'auto',
  transform: props.rightPanelCollapsed ? `translateX(${rightPanelWidth.value}px)` : 'translateX(0)'
}))

const rightPanelResizeStyle = computed(() => ({
  opacity: props.rightPanelCollapsed ? 0 : 1,
  pointerEvents: props.rightPanelCollapsed ? 'none' : 'auto'
}))

function cloneMessages(questId) {
  return getStaticMessagesForQuest(questId).map((message) => ({
    ...message,
    bullets: Array.isArray(message.bullets) ? [...message.bullets] : []
  }))
}

function hydrateQuestConversation() {
  resetRuntimeState()
  messages.value = props.quest?.runtimeRequestId ? [] : cloneMessages(props.quest?.id)

  if (
    props.quest?.prompt &&
    !props.quest?.runtimeRequestId &&
    !messages.value.some((message) => message.role === 'user')
  ) {
    messages.value.unshift({
      id: `user-${props.quest.id}`,
      role: 'user',
      content: props.quest.prompt
    })
  }

  nextTick(scrollChatToBottom)
}

function resetRuntimeState() {
  runtimeSessionId.value = ''
  runtimeStatus.value = 'idle'
  runtimeMetadata.value = null
  runtimeEvents.value = []
  runtimeTools.value = []
  runtimeArtifacts.value = []
  runtimeLogs.value = []
  runtimeThoughts.value = []
  runtimePermissions.value = []
  runtimeQuestions.value = []
  runtimePlans.value = []
  runtimeTasks.value = []
  runtimeRunOptions.value = {}
  digitalJobId.value = ''
  digitalJob.value = null
  runtimeReview.value = {
    additions: 0,
    deletions: 0,
    files: []
  }
  currentAssistantMessageId.value = ''
}

function maybeStartRuntimeQuest() {
  const requestId = props.quest?.runtimeRequestId

  if (!requestId || startedRuntimeRequestIds.has(requestId) || !props.quest?.prompt) {
    return
  }

  startedRuntimeRequestIds.add(requestId)
  startAgentRun(props.quest.prompt, {
    intentMode: props.quest.intentMode || 'auto',
    runMode: 'Auto',
    allowShell: false,
    allowApplyPatch: true,
    approvalMode: 'auto'
  })
}

function scrollChatToBottom() {
  const element = chatScroll.value

  if (!element) {
    return
  }

  element.scrollTop = element.scrollHeight
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getRightPanelMaxWidth() {
  const shellWidth = chatShell.value?.clientWidth ?? window.innerWidth

  if (shellWidth <= RIGHT_PANEL_MIN_VIEWPORT) {
    return RIGHT_PANEL_MIN_WIDTH
  }

  return clamp(shellWidth - CHAT_MIN_WIDTH, RIGHT_PANEL_MIN_WIDTH, RIGHT_PANEL_MAX_WIDTH)
}

function startRightPanelResize(event) {
  if (event.button !== 0) {
    return
  }

  event.preventDefault()
  const startX = event.clientX
  const startWidth = rightPanelWidth.value
  isResizingRightPanel.value = true
  document.body.classList.add('is-column-resizing')

  function handlePointerMove(moveEvent) {
    const nextWidth = startWidth - (moveEvent.clientX - startX)
    rightPanelWidth.value = clamp(nextWidth, RIGHT_PANEL_MIN_WIDTH, getRightPanelMaxWidth())
  }

  function stopResize() {
    isResizingRightPanel.value = false
    document.body.classList.remove('is-column-resizing')
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}

function resetRightPanelWidth() {
  rightPanelWidth.value = Math.min(RIGHT_PANEL_DEFAULT_WIDTH, getRightPanelMaxWidth())
}

function fitRightPanelToViewport() {
  rightPanelWidth.value = Math.min(rightPanelWidth.value, getRightPanelMaxWidth())
}

async function openSpecDetails() {
  if (props.rightPanelCollapsed) {
    emit('open-right-panel')
    await nextTick()
  }

  rightPanel.value?.openSpecTab?.()
}

function openRuntimeSettings() {
  emit('open-workbench-task', {
    taskId: runtimeSessionId.value || 'runtime-session',
    threadId: '',
    sessionId: runtimeSessionId.value,
    unitId: '',
    workspace: getPlainWorkspace()
  })
}

function submitChatPrompt(prompt, options = {}) {
  if (options.executionMode === 'digital_employee') {
    startDigitalEmployeeJob(prompt, options)
    return
  }

  startAgentRun(prompt, options)
}

async function startDigitalEmployeeJob(prompt, options = {}) {
  const normalizedPrompt = String(prompt || '').trim()

  if (!normalizedPrompt || isRuntimeBusy.value) {
    return
  }

  resetRuntimeState()
  runtimeRunOptions.value = {
    ...getPlainRunOptions(options),
    executionMode: 'digital_employee'
  }
  runtimeStatus.value = 'starting'
  messages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    content: normalizedPrompt
  })
  updateAssistantMessage({
    status: 'streaming',
    step: '数字员工团队正在准备',
    content: 'Xoder 正在创建隔离工作区并启动阶段式数字员工团队。'
  })
  await nextTick(scrollChatToBottom)

  try {
    if (!window.api?.digitalEmployee?.start) {
      throw new Error('digitalEmployee preload API is unavailable.')
    }

    const permissions = buildRuntimePermissions({
      ...options,
      allowShell: true,
      allowApplyPatch: true
    })
    const approvalPolicy = normalizeApprovalMode(options.approvalMode)
    const job = await window.api.digitalEmployee.start({
      goal: normalizedPrompt,
      workspace: getPlainWorkspace(),
      teamMode: 'staged_team',
      approvalPolicy: approvalPolicy === 'auto' ? '' : approvalPolicy,
      permissions
    })

    digitalJobId.value = job.id
    digitalJob.value = job
    runtimeStatus.value = job.status === 'queued' ? 'starting' : job.status
  } catch (error) {
    runtimeStatus.value = 'failed'
    const message = getErrorMessage(error)
    appendRuntimeLog('digital.job.failed', message)
    updateAssistantMessage({
      status: 'failed',
      step: '数字员工启动失败',
      content: message
    })
  }
}

async function startAgentRun(prompt, options = {}) {
  const normalizedPrompt = String(prompt || '').trim()

  if (!normalizedPrompt || isRuntimeBusy.value) {
    return
  }

  resetRuntimeState()
  runtimeRunOptions.value = getPlainRunOptions(options)
  runtimeStatus.value = 'starting'
  messages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    content: normalizedPrompt
  })
  ensureAssistantMessage()
  await nextTick(scrollChatToBottom)

  try {
    if (!window.api?.agentRuntime?.start) {
      throw new Error('agentRuntime preload API is unavailable.')
    }

    const session = await window.api.agentRuntime.start({
      questId: String(props.quest?.id || ''),
      prompt: normalizedPrompt,
      workspace: getPlainWorkspace(),
      mode: options.runMode || 'Auto',
      permissions: buildRuntimePermissions(options),
      options: getPlainRunOptions(options),
      agent: {
        provider: 'claude-code',
        model: 'default'
      }
    })

    runtimeSessionId.value = session.id
    runtimeStatus.value = session.status === 'starting' ? 'running' : session.status
  } catch (error) {
    runtimeStatus.value = 'failed'
    const message = getErrorMessage(error)
    appendRuntimeLog('session.failed', message)
    updateAssistantMessage({
      status: 'failed',
      step: 'Agent 启动失败',
      content: message
    })
  }
}

async function stopRuntime() {
  if (!isRuntimeBusy.value) {
    return
  }

  if (digitalJobId.value) {
    await window.api?.digitalEmployee?.stop?.(digitalJobId.value)
    return
  }

  if (runtimeSessionId.value) {
    await window.api?.agentRuntime?.stop?.(runtimeSessionId.value)
  }
}

async function pauseDigitalEmployee() {
  if (!digitalJobId.value || runtimeStatus.value !== 'running') {
    return
  }

  const paused = await window.api?.digitalEmployee?.pause?.(digitalJobId.value)

  if (paused) {
    runtimeStatus.value = 'paused'
    digitalJob.value = {
      ...(digitalJob.value || {}),
      paused: true,
      status: 'paused'
    }
  }
}

async function resumeDigitalEmployee() {
  if (!digitalJobId.value || runtimeStatus.value !== 'paused') {
    return
  }

  const resumed = await window.api?.digitalEmployee?.resume?.(digitalJobId.value)

  if (resumed) {
    runtimeStatus.value = 'running'
    digitalJob.value = {
      ...(digitalJob.value || {}),
      paused: false,
      status: 'running'
    }
  }
}

function handleDigitalEmployeeEvent(event) {
  if (!event?.jobId) {
    return
  }

  if (digitalJobId.value && event.jobId !== digitalJobId.value) {
    return
  }

  if (!digitalJobId.value) {
    digitalJobId.value = event.jobId
  }

  runtimeEvents.value = [...runtimeEvents.value, event].slice(-220)
  appendRuntimeLog(event.type, summarizeRuntimeEvent(event), getRuntimeLogDetail(event))

  if (event.type === 'digital.job.started') {
    runtimeStatus.value = 'running'
    runtimeMetadata.value = {
      ...(runtimeMetadata.value || {}),
      provider: 'xoder-digital-employee',
      jobId: event.jobId,
      teamMode: event.payload?.teamMode || 'staged_team'
    }
    updateAssistantMessage({
      status: 'streaming',
      step: '数字员工团队已开始',
      content: latestAssistantMessage.value?.content || '数字员工团队已接管这个工作区任务。'
    })
  } else if (event.type === 'digital.stage.started') {
    upsertRuntimeTask(
      {
        id: `digital:${event.payload?.stageId}`,
        title: event.payload?.title,
        detail: event.payload?.detail,
        source: 'xoder-digital-employee'
      },
      'running'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.stage.completed') {
    upsertRuntimeTask(
      {
        id: `digital:${event.payload?.stageId}`,
        title: event.payload?.title,
        detail: event.payload?.detail,
        preview: event.payload?.result ? formatJson(event.payload.result) : '',
        source: 'xoder-digital-employee'
      },
      'completed'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.stage.failed') {
    upsertRuntimeTask(
      {
        id: `digital:${event.payload?.stageId}`,
        title: event.payload?.title,
        detail: event.payload?.error?.message || event.payload?.detail,
        source: 'xoder-digital-employee'
      },
      'failed'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.question.created') {
    upsertRuntimeQuestion(event.payload, 'pending')
    upsertRuntimeTask(
      {
        id: `digital:question:${event.payload?.requestId || event.id}`,
        title: event.payload?.title || '等待确认',
        detail: event.payload?.summary || event.payload?.description || '',
        source: 'xoder-digital-employee'
      },
      'pending'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.question.resolved') {
    upsertRuntimeQuestion(event.payload, 'completed')
    upsertRuntimeTask(
      {
        id: `digital:question:${event.payload?.requestId || event.id}`,
        title: event.payload?.title || '确认已处理',
        detail: event.payload?.message || event.payload?.summary || '',
        source: 'xoder-digital-employee'
      },
      'completed'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.question.cancelled') {
    upsertRuntimeQuestion(event.payload, 'failed')
    upsertRuntimeTask(
      {
        id: `digital:question:${event.payload?.requestId || event.id}`,
        title: event.payload?.title || '确认已取消',
        detail: event.payload?.message || event.payload?.summary || '',
        source: 'xoder-digital-employee'
      },
      'failed'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.git.workspace') {
    runtimeMetadata.value = {
      ...(runtimeMetadata.value || {}),
      branch: event.payload?.git?.branch || '',
      worktreePath: event.payload?.workspace?.path || ''
    }
    upsertArtifact({
      id: `worktree:${event.jobId}`,
      name: 'isolated-worktree',
      path: event.payload?.workspace?.path || '',
      operation: 'workspace',
      status: 'completed',
      preview: event.payload?.git?.branch || ''
    })
    updateAssistantInteractions()
  } else if (event.type === 'digital.agent.session.started') {
    runtimeSessionId.value = event.payload?.sessionId || runtimeSessionId.value
  } else if (event.type === 'digital.agent.event') {
    const agentEvent = event.payload?.event

    if (agentEvent) {
      handleRuntimeEvent(agentEvent)
    }
  } else if (event.type === 'digital.git.summary') {
    const changedFiles = Array.isArray(event.payload?.changedFiles) ? event.payload.changedFiles : []
    runtimeReview.value = {
      additions: 0,
      deletions: 0,
      files: changedFiles.map((line, index) => ({
        id: `git-change-${index}`,
        name: line,
        path: line,
        status: 'changed'
      }))
    }
    updateAssistantInteractions()
  } else if (event.type === 'digital.git.committed') {
    upsertRuntimeTask(
      {
        id: `digital:commit:${event.jobId}`,
        title: 'Git commit',
        detail: event.payload?.title || event.payload?.hash,
        preview: event.payload?.hash || '',
        source: 'xoder-digital-employee'
      },
      'completed'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.git.pushed') {
    upsertRuntimeTask(
      {
        id: `digital:push:${event.jobId}`,
        title: 'Git push',
        detail: `${event.payload?.remote || ''} ${event.payload?.branch || ''}`.trim(),
        source: 'xoder-digital-employee'
      },
      'completed'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.pr.created' || event.type === 'digital.pr.skipped') {
    upsertRuntimeTask(
      {
        id: `digital:pr:${event.jobId}`,
        title: event.type === 'digital.pr.created' ? 'Draft PR created' : 'Draft PR skipped',
        detail: event.payload?.url || event.payload?.reason || '',
        source: 'xoder-digital-employee'
      },
      event.type === 'digital.pr.created' ? 'completed' : 'pending'
    )
    updateAssistantInteractions()
  } else if (event.type === 'digital.report.created') {
    upsertArtifact({
      id: `report:${event.jobId}`,
      name: 'report.md',
      path: event.payload?.path || '',
      operation: 'result',
      status: 'completed',
      preview: event.payload?.content || ''
    })
    updateAssistantInteractions()
  } else if (event.type === 'digital.job.completed') {
    runtimeStatus.value = 'completed'
    const reportText = event.payload?.report?.content || latestAssistantMessage.value?.content || ''
    updateAssistantMessage({
      status: 'completed',
      step: '数字员工团队已完成',
      content: reportText,
      finalContent: reportText
    })
  } else if (event.type === 'digital.job.failed') {
    runtimeStatus.value = 'failed'
    updateAssistantMessage({
      status: 'failed',
      step: '数字员工团队失败',
      content: event.payload?.message || 'Digital employee job failed.'
    })
  } else if (event.type === 'digital.job.cancelled') {
    runtimeStatus.value = 'cancelled'
    updateAssistantMessage({
      status: 'warning',
      step: '数字员工团队已停止',
      content: latestAssistantMessage.value?.content || '本次数字员工工作已停止。'
    })
  }

  if (event.type === 'digital.job.paused') {
    runtimeStatus.value = 'paused'
    digitalJob.value = { ...(digitalJob.value || {}), paused: true, status: 'paused' }
  } else if (event.type === 'digital.job.resumed') {
    runtimeStatus.value = 'running'
    digitalJob.value = { ...(digitalJob.value || {}), paused: false, status: 'running' }
  }

  nextTick(scrollChatToBottom)
}

function handleRuntimeEvent(event) {
  if (!event?.sessionId) {
    return
  }

  if (runtimeSessionId.value && event.sessionId !== runtimeSessionId.value) {
    return
  }

  if (!runtimeSessionId.value && event.type !== 'message.user') {
    runtimeSessionId.value = event.sessionId
  }

  runtimeEvents.value = [...runtimeEvents.value, event].slice(-220)
  appendRuntimeLog(event.type, summarizeRuntimeEvent(event), getRuntimeLogDetail(event))

  if (event.type === 'session.started') {
    runtimeStatus.value = 'running'
    updateAssistantMessage({
      status: 'streaming',
      step: 'Agent 已启动'
    })
  } else if (event.type === 'session.metadata') {
    runtimeMetadata.value = event.payload || {}
  } else if (event.type === 'message.assistant.delta') {
    if (!event.payload?.hidden && event.payload?.text) {
      appendAssistantText(event.payload.text)
    } else if (event.payload?.thinking) {
      appendAssistantThinking(event.payload.thinking)
    }
  } else if (event.type === 'message.assistant.completed') {
    updateAssistantMessage({
      finalContent: event.payload?.text || latestAssistantMessage.value?.content || ''
    })
  } else if (event.type === 'tool.started') {
    upsertTool(event.payload, 'running')
    updateAssistantTools()
  } else if (event.type === 'tool.completed') {
    upsertTool(event.payload, 'completed')
    updateAssistantTools()
  } else if (event.type === 'tool.failed') {
    upsertTool(event.payload, 'failed')
    updateAssistantTools()
  } else if (event.type === 'permission.requested') {
    upsertRuntimePermission(event.payload, 'pending')
    upsertTool(event.payload, 'pending')
    updateAssistantTools()
  } else if (event.type === 'permission.granted') {
    removeRuntimePermission(event.payload)
    upsertTool(event.payload, 'completed')
    updateAssistantTools()
  } else if (event.type === 'permission.denied') {
    removeRuntimePermission(event.payload)
    upsertTool(event.payload, 'failed')
    updateAssistantTools()
  } else if (event.type === 'question.requested') {
    upsertRuntimeQuestion(event.payload, 'pending')
    updateAssistantInteractions()
  } else if (event.type === 'question.answered') {
    upsertRuntimeQuestion(event.payload, 'completed')
    updateAssistantInteractions()
  } else if (event.type === 'question.declined') {
    upsertRuntimeQuestion(event.payload, 'failed')
    updateAssistantInteractions()
  } else if (event.type === 'plan.updated' || event.type === 'plan.requested') {
    upsertRuntimePlan(event.payload, event.payload?.status || 'pending')
    updateAssistantInteractions()
  } else if (event.type === 'plan.approved') {
    upsertRuntimePlan(event.payload, 'completed')
    updateAssistantInteractions()
  } else if (event.type === 'plan.rejected') {
    upsertRuntimePlan(event.payload, 'failed')
    updateAssistantInteractions()
  } else if (event.type.startsWith('task.') || event.type.startsWith('agent.')) {
    upsertRuntimeTask(event.payload, getRuntimeTaskStatus(event))
    updateAssistantInteractions()
  } else if (event.type === 'spec.created' || event.type === 'spec.updated') {
    upsertArtifact(event.payload)
    updateAssistantInteractions()
  } else if (event.type === 'review.updated') {
    updateRuntimeReview(event.payload)
    updateAssistantInteractions()
  } else if (event.type === 'artifact.changed') {
    upsertArtifact(event.payload)
    updateAssistantInteractions()
  } else if (event.type === 'session.completed') {
    runtimeStatus.value = 'completed'
    updateAssistantMessage({
      status: 'completed',
      step: 'Agent 已完成',
      content: latestAssistantMessage.value?.content || event.payload?.result || '',
      finalContent: latestAssistantMessage.value?.finalContent || event.payload?.result || ''
    })
  } else if (event.type === 'session.failed') {
    runtimeStatus.value = 'failed'
    updateAssistantMessage({
      status: 'failed',
      step: 'Agent 运行失败',
      content: event.payload?.message || 'Agent runtime failed.'
    })
  } else if (event.type === 'session.cancelled') {
    runtimeStatus.value = 'cancelled'
    updateAssistantMessage({
      status: 'warning',
      step: 'Agent 已停止',
      content: latestAssistantMessage.value?.content || '本次运行已停止。'
    })
  }

  nextTick(scrollChatToBottom)
}

function ensureAssistantMessage() {
  const existing = messages.value.find((message) => message.id === currentAssistantMessageId.value)

  if (existing) {
    return existing
  }

  const message = {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    status: 'streaming',
    step: 'Agent 正在处理',
    content: '',
    finalContent: '',
    flowLead: '',
    createdAt: Date.now(),
    runOptions: { ...runtimeRunOptions.value },
    thoughts: [],
    tools: [],
    questions: [],
    plans: [],
    tasks: [],
    artifacts: [],
    review: null
  }

  currentAssistantMessageId.value = message.id
  messages.value.push(message)
  return message
}

function appendAssistantText(text) {
  const message = ensureAssistantMessage()

  message.content = `${message.content || ''}${text}`
  message.status = 'streaming'
  message.step = 'Agent 正在回复'
}

function appendAssistantThinking(thinking) {
  const text = String(thinking || '').trim()

  if (!text) {
    return
  }

  const thought = {
    id: `thought-${Date.now()}-${runtimeThoughts.value.length}`,
    title: '思考过程',
    text,
    createdAt: Date.now()
  }
  const message = ensureAssistantMessage()

  runtimeThoughts.value = [...runtimeThoughts.value, thought].slice(-40)
  message.thoughts = [...(message.thoughts || []), thought].slice(-8)
  message.status = 'streaming'
  message.step = 'Agent 正在思考'
}

function updateAssistantMessage(patch) {
  const message = ensureAssistantMessage()

  Object.assign(message, patch)
}

function upsertTool(payload = {}, status) {
  const id = payload.toolUseId || payload.id || `tool-${Date.now()}`
  const permissionState = payload.requestId ? getRuntimePermissionByPayload(payload) : null
  const nextTool = {
    id,
    name: payload.name || 'Tool',
    summary: payload.summary || payload.content || status,
    detail: payload.outputPreview || payload.content || payload.inputPreview || payload.summary || '',
    input: payload.input || null,
    inputPreview: payload.inputPreview || payload.artifact?.preview || '',
    outputPreview: payload.outputPreview || '',
    artifact: payload.artifact || null,
    requestId: payload.requestId || '',
    toolName: payload.toolName || '',
    isPermission: Boolean(payload.requestId),
    submitting: Boolean(permissionState?.submitting),
    error: permissionState?.error || '',
    status
  }
  const existingIndex = runtimeTools.value.findIndex((tool) => tool.id === id)

  if (existingIndex >= 0) {
    runtimeTools.value.splice(existingIndex, 1, {
      ...runtimeTools.value[existingIndex],
      ...nextTool
    })
  } else {
    runtimeTools.value.push(nextTool)
  }
}

function upsertRuntimePermission(payload = {}, status = 'pending') {
  const id = getRuntimePermissionId(payload)

  if (!id) {
    return
  }

  const nextPermission = {
    id,
    requestId: payload.requestId || '',
    toolUseId: payload.toolUseId || '',
    toolName: payload.toolName || payload.name || 'Tool',
    name: payload.name || `Permission: ${payload.toolName || 'Tool'}`,
    summary: payload.summary || payload.actionDescription || '',
    input: payload.input || {},
    inputPreview: payload.inputPreview || '',
    message: payload.message || '',
    error: '',
    status,
    submitting: false
  }
  const existingIndex = runtimePermissions.value.findIndex((permission) => permission.id === id)

  if (existingIndex >= 0) {
    runtimePermissions.value.splice(existingIndex, 1, {
      ...runtimePermissions.value[existingIndex],
      ...nextPermission
    })
  } else {
    runtimePermissions.value.push(nextPermission)
  }
}

function removeRuntimePermission(payload = {}) {
  const id = getRuntimePermissionId(payload)

  if (!id) {
    return
  }

  runtimePermissions.value = runtimePermissions.value.filter((permission) => permission.id !== id)
}

function getRuntimePermissionId(payload = {}) {
  return String(payload.requestId || payload.toolUseId || payload.id || '').trim()
}

function getRuntimePermissionByPayload(payload = {}) {
  const id = getRuntimePermissionId(payload)

  return runtimePermissions.value.find((permission) => permission.id === id) || null
}

function syncRuntimePermissionTool(permission) {
  if (!permission) {
    return
  }

  upsertTool(
    {
      requestId: permission.requestId,
      toolUseId: permission.toolUseId,
      name: permission.name,
      toolName: permission.toolName,
      summary: permission.summary,
      input: permission.input,
      inputPreview: permission.inputPreview
    },
    permission.status || 'pending'
  )
  updateAssistantTools()
}

async function respondRuntimePermission(payload, allow) {
  const permission = getRuntimePermissionByPayload(payload) || payload

  if (!permission?.requestId || permission.submitting) {
    return
  }

  permission.submitting = true
  permission.error = ''
  syncRuntimePermissionTool(permission)

  try {
    const response = toPlainIpcValue({
      behavior: allow ? 'allow' : 'deny',
      updatedInput: permission.input || {},
      message: allow ? 'Approved by Xoder user.' : 'Denied by Xoder user.'
    })
    const ok = await window.api?.agentRuntime?.respondPermission?.(
      String(runtimeSessionId.value || ''),
      String(permission.requestId || ''),
      response
    )

    if (!ok) {
      throw new Error('Permission response was not accepted by the runtime.')
    }
  } catch (error) {
    permission.submitting = false
    permission.error = getErrorMessage(error)
    syncRuntimePermissionTool(permission)
    appendRuntimeLog('permission.failed', getErrorMessage(error), {
      rawJson: formatJson(permission)
    })
  }
}

function upsertRuntimeQuestion(payload = {}, status = 'pending') {
  const id = getRuntimeInteractiveId(payload)

  if (!id) {
    return
  }

  const existing = runtimeQuestions.value.find((question) => question.id === id)
  const selectedAnswers = existing?.selectedAnswers || buildSelectedAnswers(payload)
  const nextQuestion = {
    id,
    requestId: payload.requestId || '',
    questionId: payload.questionId || payload.requestId || '',
    jobId: payload.jobId || existing?.jobId || '',
    toolUseId: payload.toolUseId || '',
    title: payload.title || payload.summary || 'Question',
    summary: payload.summary || '',
    description: payload.description || existing?.description || '',
    severity: payload.severity || existing?.severity || '',
    category: payload.category || existing?.category || '',
    stageId: payload.stageId || existing?.stageId || '',
    questions: Array.isArray(payload.questions) ? payload.questions : [],
    answers: payload.answers || existing?.answers || {},
    selectedAnswers,
    freeformAnswer: existing?.freeformAnswer || payload.answer || '',
    input: payload.input || existing?.input || {},
    inputPreview: payload.inputPreview || '',
    metadata: payload.metadata || existing?.metadata || null,
    status,
    submitting: status === 'pending' ? existing?.submitting || false : false,
    error: status === 'pending' ? existing?.error || '' : '',
    source: payload.source || existing?.source || ''
  }
  const existingIndex = runtimeQuestions.value.findIndex((question) => question.id === id)

  if (existingIndex >= 0) {
    runtimeQuestions.value.splice(existingIndex, 1, {
      ...runtimeQuestions.value[existingIndex],
      ...nextQuestion
    })
  } else {
    runtimeQuestions.value.push(nextQuestion)
  }
}

function toggleRuntimeQuestionOption(questionCard, questionItem, option) {
  if (!questionCard || questionCard.status !== 'pending' || questionCard.submitting) {
    return
  }

  const key = getQuestionAnswerKey(questionItem)
  const value = getQuestionOptionValue(questionCard, option)
  const current = Array.isArray(questionCard.selectedAnswers[key])
    ? [...questionCard.selectedAnswers[key]]
    : []

  if (questionItem.multiSelect) {
    const index = current.indexOf(value)

    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(value)
    }

    questionCard.selectedAnswers[key] = current
  } else {
    questionCard.selectedAnswers[key] = [value]
  }

  runtimeQuestions.value = [...runtimeQuestions.value]
  updateAssistantInteractions()
}

function isRuntimeQuestionOptionSelected(questionCard, questionItem, option) {
  const selected = questionCard?.selectedAnswers?.[getQuestionAnswerKey(questionItem)]

  return Array.isArray(selected) && selected.includes(getQuestionOptionValue(questionCard, option))
}

function questionHasOptions(questionItem = {}) {
  return Array.isArray(questionItem.options) && questionItem.options.length > 0
}

function getQuestionOptionValue(questionCard, option = {}) {
  if (isDigitalEmployeeQuestion(questionCard)) {
    return String(option.value || option.id || option.label || '').trim()
  }

  return String(option.label || option.value || option.id || '').trim()
}

async function submitRuntimeQuestion(questionCard) {
  if (!questionCard?.requestId || questionCard.submitting || questionCard.status !== 'pending') {
    return
  }

  const answers = buildQuestionAnswers(questionCard)

  if (!Object.keys(answers).length) {
    questionCard.error = 'Please select or enter an answer first.'
    runtimeQuestions.value = [...runtimeQuestions.value]
    updateAssistantInteractions()
    return
  }

  questionCard.submitting = true
  questionCard.error = ''
  runtimeQuestions.value = [...runtimeQuestions.value]
  updateAssistantInteractions()

  try {
    const behavior = isDigitalEmployeeQuestion(questionCard)
      ? getDigitalQuestionBehavior(answers)
      : 'allow'
    const response = toPlainIpcValue({
      behavior,
      allow: behavior === 'allow' || behavior === 'allow_once',
      answers,
      updatedInput: {
        ...(questionCard.input || {}),
        answers
      },
      message: 'Answered by Xoder user.'
    })
    const ok = isDigitalEmployeeQuestion(questionCard)
      ? await window.api?.digitalEmployee?.respondQuestion?.(
          String(questionCard.jobId || digitalJobId.value || ''),
          String(questionCard.requestId || ''),
          response
        )
      : await window.api?.agentRuntime?.respondPermission?.(
          String(runtimeSessionId.value || ''),
          String(questionCard.requestId || ''),
          response
        )

    if (!ok) {
      throw new Error('Question response was not accepted by the runtime.')
    }
  } catch (error) {
    questionCard.submitting = false
    questionCard.error = getErrorMessage(error)
    runtimeQuestions.value = [...runtimeQuestions.value]
    updateAssistantInteractions()
    appendRuntimeLog('question.failed', getErrorMessage(error), {
      rawJson: formatJson(questionCard)
    })
  }
}

async function declineRuntimeQuestion(questionCard) {
  if (!questionCard?.requestId || questionCard.submitting || questionCard.status !== 'pending') {
    return
  }

  questionCard.submitting = true
  questionCard.error = ''
  runtimeQuestions.value = [...runtimeQuestions.value]
  updateAssistantInteractions()

  try {
    const response = toPlainIpcValue({
      behavior: 'deny',
      allow: false,
      answers: {},
      message: 'User declined to answer in Xoder.'
    })
    const ok = isDigitalEmployeeQuestion(questionCard)
      ? await window.api?.digitalEmployee?.respondQuestion?.(
          String(questionCard.jobId || digitalJobId.value || ''),
          String(questionCard.requestId || ''),
          response
        )
      : await window.api?.agentRuntime?.respondPermission?.(
          String(runtimeSessionId.value || ''),
          String(questionCard.requestId || ''),
          response
        )

    if (!ok) {
      throw new Error('Question decline was not accepted by the runtime.')
    }
  } catch (error) {
    questionCard.submitting = false
    questionCard.error = getErrorMessage(error)
    runtimeQuestions.value = [...runtimeQuestions.value]
    updateAssistantInteractions()
  }
}

function upsertRuntimePlan(payload = {}, status = 'pending') {
  const id = getRuntimeInteractiveId(payload) || `plan-${Date.now()}`
  const existingIndex = runtimePlans.value.findIndex((plan) => plan.id === id)
  const existing = existingIndex >= 0 ? runtimePlans.value[existingIndex] : null
  const nextPlan = {
    id,
    requestId: payload.requestId || '',
    toolUseId: payload.toolUseId || '',
    title: payload.title || 'Plan',
    summary: payload.summary || payload.plan || payload.inputPreview || '',
    plan: payload.plan || existing?.plan || '',
    planFilePath: payload.planFilePath || existing?.planFilePath || '',
    allowedPrompts: Array.isArray(payload.allowedPrompts) ? payload.allowedPrompts : [],
    input: payload.input || existing?.input || {},
    inputPreview: payload.inputPreview || '',
    status,
    submitting: status === 'pending' ? existing?.submitting || false : false,
    error: status === 'pending' ? existing?.error || '' : ''
  }

  if (existingIndex >= 0) {
    runtimePlans.value.splice(existingIndex, 1, {
      ...runtimePlans.value[existingIndex],
      ...nextPlan
    })
  } else {
    runtimePlans.value.push(nextPlan)
  }
}

async function respondRuntimePlan(plan, allow) {
  if (!plan?.requestId || plan.submitting || plan.status !== 'pending') {
    return
  }

  plan.submitting = true
  plan.error = ''
  runtimePlans.value = [...runtimePlans.value]
  updateAssistantInteractions()

  try {
    const ok = await window.api?.agentRuntime?.respondPermission?.(
      String(runtimeSessionId.value || ''),
      String(plan.requestId || ''),
      toPlainIpcValue({
        behavior: allow ? 'allow' : 'deny',
        updatedInput: plan.input || {},
        message: allow ? 'Plan approved by Xoder user.' : 'Plan rejected by Xoder user.'
      })
    )

    if (!ok) {
      throw new Error('Plan response was not accepted by the runtime.')
    }
  } catch (error) {
    plan.submitting = false
    plan.error = getErrorMessage(error)
    runtimePlans.value = [...runtimePlans.value]
    updateAssistantInteractions()
  }
}

function upsertRuntimeTask(payload = {}, status = 'running') {
  const id = String(payload.taskId || payload.toolUseId || payload.id || '').trim()

  if (!id) {
    return
  }

  const nextTask = {
    id,
    taskId: payload.taskId || id,
    toolUseId: payload.toolUseId || '',
    title: payload.title || payload.summary || payload.description || 'Agent task',
    description: payload.description || payload.summary || '',
    summary: payload.summary || '',
    detail: payload.detail || payload.description || payload.summary || '',
    preview: payload.preview || payload.output || '',
    output: payload.output || '',
    agentType: payload.agentType || '',
    owner: payload.owner || '',
    priority: payload.priority || '',
    lastToolName: payload.lastToolName || '',
    outputFile: payload.outputFile || '',
    usage: payload.usage || null,
    workflowProgress: Array.isArray(payload.workflowProgress) ? payload.workflowProgress : [],
    metadata: payload.metadata || null,
    raw: payload.raw || null,
    source: payload.source || '',
    status
  }
  const existingIndex = runtimeTasks.value.findIndex((task) => task.id === id)

  if (existingIndex >= 0) {
    runtimeTasks.value.splice(existingIndex, 1, {
      ...runtimeTasks.value[existingIndex],
      ...nextTask
    })
  } else {
    runtimeTasks.value.push(nextTask)
  }
}

function updateRuntimeReview(payload = {}) {
  const files = Array.isArray(payload.files) ? payload.files : []
  const nextFiles = [...(runtimeReview.value.files || [])]

  for (const file of files) {
    const id = String(
      file.id ||
        `${file.toolUseId || file.path || file.name || 'file'}:${file.operation || ''}:${file.toolName || ''}`
    )
    const nextFile = {
      id,
      toolUseId: file.toolUseId || '',
      path: file.path || '',
      name: file.name || getFileName(file.path) || 'file',
      additions: Number(file.additions || 0),
      deletions: Number(file.deletions || 0),
      status: file.status || payload.status || 'changed',
      operation: file.operation || '',
      toolName: file.toolName || ''
    }
    const existingIndex = nextFiles.findIndex((item) => item.id === id)

    if (existingIndex >= 0) {
      nextFiles.splice(existingIndex, 1, nextFile)
    } else {
      nextFiles.push(nextFile)
    }
  }

  runtimeReview.value = {
    additions: nextFiles.reduce((sum, file) => sum + Number(file.additions || 0), 0),
    deletions: nextFiles.reduce((sum, file) => sum + Number(file.deletions || 0), 0),
    files: nextFiles
  }
}

function getRuntimeInteractiveId(payload = {}) {
  return String(payload.toolUseId || payload.requestId || payload.id || '').trim()
}

function buildSelectedAnswers(payload = {}) {
  const selectedAnswers = {}
  const answers = payload.answers || {}

  for (const question of Array.isArray(payload.questions) ? payload.questions : []) {
    const key = getQuestionAnswerKey(question)
    const answer = String(answers[key] || answers[question.question] || '').trim()

    selectedAnswers[key] = answer ? answer.split(',').map((item) => item.trim()).filter(Boolean) : []
  }

  return selectedAnswers
}

function buildQuestionAnswers(questionCard) {
  const answers = {}

  for (const question of questionCard.questions || []) {
    const key = getQuestionAnswerKey(question)
    const selected = questionCard.selectedAnswers?.[key] || []

    if (selected.length) {
      answers[question.question || key] = selected.join(', ')
    } else if (!questionHasOptions(question) && String(questionCard.freeformAnswer || '').trim()) {
      answers[question.question || key] = String(questionCard.freeformAnswer || '').trim()
    }
  }

  return answers
}

function getQuestionAnswerKey(question = {}) {
  return String(question.question || question.id || question.header || '').trim()
}

function isDigitalEmployeeQuestion(questionCard = {}) {
  return (
    questionCard.source === 'xoder-digital-employee' ||
    Boolean(questionCard.jobId) ||
    String(questionCard.requestId || '').startsWith('digital_question_')
  )
}

function getDigitalQuestionBehavior(answers = {}) {
  const answerText = Object.values(answers)
    .flat()
    .map((item) => String(item || ''))
    .join(' ')

  if (/stop_job|stop|cancel|停止|取消/.test(answerText)) {
    return 'stop'
  }

  if (/skip_action|skip|deny|decline|跳过|拒绝/.test(answerText)) {
    return 'skip_action'
  }

  if (/allow_once|allow|approve|允许|同意|批准/.test(answerText)) {
    return 'allow_once'
  }

  return 'allow'
}

function getRuntimeTaskStatus(event) {
  if (event.type === 'task.completed') {
    return 'completed'
  }

  if (event.type === 'task.failed') {
    return 'failed'
  }

  if (event.type === 'task.updated') {
    return event.payload?.status || 'pending'
  }

  return event.payload?.status || 'running'
}

function getPlainWorkspace() {
  return {
    id: String(props.workspace?.id || ''),
    name: String(props.workspace?.name || ''),
    path: String(props.workspace?.path || '')
  }
}

function getPlainRunOptions(options = {}) {
  return {
    allowShell: Boolean(options.allowShell),
    approvalMode: normalizeApprovalMode(options.approvalMode),
    allowApplyPatch: Boolean(options.allowApplyPatch ?? true),
    intentMode: String(options.intentMode || 'auto'),
    expertMode: String(options.expertMode || 'single_agent'),
    employeeKey: String(options.employeeKey || ''),
    assignedUnitId: String(options.assignedUnitId || ''),
    runMode: String(options.runMode || 'Auto')
  }
}

function buildRuntimePermissions(options = {}) {
  const approvalMode = normalizeApprovalMode(options.approvalMode)
  const allowShell = Boolean(options.allowShell)
  const allowWrite = Boolean(options.allowApplyPatch ?? true)

  if (approvalMode === 'manual') {
    return {
      approvalMode,
      allowShell,
      allowWrite,
      allowNetwork: true,
      autoApproveAll: false,
      allowDangerouslyApproveAll: false
    }
  }

  if (approvalMode === 'fullAccess') {
    return {
      approvalMode,
      allowShell: true,
      allowWrite: true,
      allowNetwork: true,
      allowWebSearch: true,
      allowWebFetch: true,
      autoApproveAll: true,
      allowDangerouslyApproveAll: true
    }
  }

  return {
    approvalMode,
    allowShell,
    allowWrite,
    allowNetwork: true,
    allowWebSearch: true,
    allowWebFetch: true,
    autoApproveAll: true,
    allowDangerouslyApproveAll: false
  }
}

function normalizeApprovalMode(value) {
  const normalized = String(value || 'auto').trim()

  if (['manual', 'auto', 'fullAccess', 'custom'].includes(normalized)) {
    return normalized
  }

  return 'auto'
}

function updateAssistantTools() {
  const message = ensureAssistantMessage()

  rememberAssistantLead(message)
  message.tools = runtimeTools.value.slice(-6).map((tool) => ({ ...tool }))
}

function updateAssistantInteractions() {
  const message = ensureAssistantMessage()

  rememberAssistantLead(message)
  message.questions = runtimeQuestions.value.slice(-4)
  message.plans = runtimePlans.value.slice(-3)
  message.tasks = runtimeTasks.value.slice(-8)
  message.runOptions = { ...runtimeRunOptions.value }
  message.artifacts = runtimeArtifacts.value.slice(-8).map((artifact) => ({ ...artifact }))
  message.review =
    runtimeReview.value.files?.length || runtimeReview.value.additions || runtimeReview.value.deletions
      ? { ...runtimeReview.value, files: [...(runtimeReview.value.files || [])] }
      : null
}

function rememberAssistantLead(message) {
  const lead = String(message?.content || '').trim()

  if (message && !message.flowLead && lead) {
    message.flowLead = lead
  }
}

function upsertArtifact(payload = {}) {
  const id = payload.toolUseId || payload.path || `artifact-${Date.now()}`
  const artifact = {
    id,
    title: payload.title || payload.name || getFileName(payload.path) || 'artifact',
    name: payload.name || payload.title || getFileName(payload.path) || 'artifact',
    path: payload.path || '',
    diff: payload.operation || payload.status || payload.toolName || 'changed',
    operation: payload.operation || '',
    preview: payload.contentPreview || payload.preview || '',
    contentPreview: payload.contentPreview || payload.preview || '',
    kind: payload.kind || '',
    reviewStats: payload.reviewStats || null,
    toolName: payload.toolName || '',
    status: payload.status || 'changed'
  }
  const existingIndex = runtimeArtifacts.value.findIndex((item) => item.id === id)

  if (existingIndex >= 0) {
    runtimeArtifacts.value.splice(existingIndex, 1, artifact)
  } else {
    runtimeArtifacts.value.push(artifact)
  }
}

function appendRuntimeLog(type, message, detail = {}) {
  runtimeLogs.value = [
    ...runtimeLogs.value,
    {
      id: `log-${Date.now()}-${runtimeLogs.value.length}`,
      type,
      message,
      rawJson: detail.rawJson || '',
      detail: detail.detail || '',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  ].slice(-160)
}

function summarizeRuntimeEvent(event) {
  const payload = event.payload || {}

  if (event.type === 'runtime.raw') {
    return `raw ${payload.rawType || 'event'}${payload.rawSubtype ? `/${payload.rawSubtype}` : ''}`
  }

  if (event.type === 'session.metadata') {
    return payload.model ? `模型 ${payload.model}，工具 ${payload.tools?.length || 0} 个` : '收到 runtime metadata'
  }

  if (event.type.startsWith('tool.')) {
    return `${payload.name || 'Tool'} ${payload.summary || payload.status || ''}`.trim()
  }

  if (event.type.startsWith('permission.')) {
    return `${payload.name || 'Permission'} ${payload.summary || payload.status || ''}`.trim()
  }

  if (event.type.startsWith('question.') || event.type.startsWith('digital.question.')) {
    return `${payload.title || 'Question'} ${payload.summary || payload.status || ''}`.trim()
  }

  if (event.type.startsWith('plan.')) {
    return `${payload.title || 'Plan'} ${payload.summary || payload.status || ''}`.trim()
  }

  if (event.type.startsWith('task.') || event.type.startsWith('agent.')) {
    return `${payload.title || payload.taskId || 'Task'} ${payload.status || ''}`.trim()
  }

  if (event.type === 'review.updated') {
    return payload.summary || `+${payload.additions || 0} -${payload.deletions || 0}`
  }

  if (event.type === 'spec.created' || event.type === 'spec.updated') {
    return `${payload.name || payload.title || 'Spec'} ${payload.status || ''}`.trim()
  }

  if (event.type === 'message.assistant.delta') {
    return payload.hidden
      ? `thinking: ${String(payload.thinking || '').slice(0, 160)}`
      : (payload.text || '').slice(0, 120)
  }

  if (event.type === 'runtime.stderr') {
    return payload.message || 'stderr'
  }

  if (event.type === 'runtime.stalled') {
    return payload.message || `runtime idle (${payload.idleMs || 0}ms)`
  }

  if (event.type === 'session.completed') {
    return payload.result ? payload.result.slice(0, 160) : '运行完成'
  }

  if (event.type === 'session.failed') {
    return payload.message || '运行失败'
  }

  return event.type
}

function getRuntimeLogDetail(event) {
  if (event.type === 'runtime.raw') {
    return {
      rawJson: event.payload?.line || formatJson(event.payload?.raw)
    }
  }

  if (event.type === 'tool.started' || event.type === 'tool.completed' || event.type === 'tool.failed') {
    return {
      detail: event.payload?.inputPreview || event.payload?.outputPreview || '',
      rawJson: formatJson(event.payload)
    }
  }

  if (event.type.startsWith('permission.')) {
    return {
      detail: event.payload?.inputPreview || event.payload?.message || '',
      rawJson: formatJson(event.payload)
    }
  }

  if (
    event.type.startsWith('question.') ||
    event.type.startsWith('digital.question.') ||
    event.type.startsWith('plan.') ||
    event.type.startsWith('task.') ||
    event.type.startsWith('agent.') ||
    event.type === 'review.updated' ||
    event.type === 'spec.created' ||
    event.type === 'spec.updated'
  ) {
    return {
      detail: event.payload?.inputPreview || event.payload?.description || event.payload?.summary || '',
      rawJson: formatJson(event.payload)
    }
  }

  if (event.type === 'artifact.changed') {
    return {
      detail: event.payload?.preview || '',
      rawJson: formatJson(event.payload)
    }
  }

  if (event.payload?.thinking) {
    return {
      detail: event.payload.thinking
    }
  }

  return {}
}

function formatJson(value) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ''
  }
}

function toPlainIpcValue(value) {
  try {
    return JSON.parse(JSON.stringify(value ?? null))
  } catch {
    return null
  }
}

function getFileName(filePath = '') {
  return String(filePath).split(/[\\/]/).filter(Boolean).pop() || ''
}

function hasAgentFlowBlocks(message = {}) {
  return Boolean(
    message.thoughts?.length ||
      message.questions?.length ||
      message.plans?.length ||
      message.tasks?.length ||
      message.artifacts?.length ||
      message.review ||
      message.tools?.some((tool) => tool.isPermission)
  )
}

function getAssistantIntroText(message = {}) {
  if (!hasAgentFlowBlocks(message)) {
    return ''
  }

  return String(message.flowLead || '').trim()
}

function getAssistantFinalText(message = {}) {
  const text = String(message.finalContent || message.content || '').trim()

  if (!text) {
    return message.status === 'streaming' && !hasAgentFlowBlocks(message) ? '正在等待 agent 输出...' : ''
  }

  const lead = String(message.flowLead || '').trim()

  if (lead && text.startsWith(lead)) {
    return text.slice(lead.length).trim()
  }

  if (hasAgentFlowBlocks(message) && message.status === 'streaming' && !message.finalContent) {
    return ''
  }

  return text
}

function getFlowSpecArtifacts(message = {}) {
  const artifacts = Array.isArray(message.artifacts) ? message.artifacts : []

  return artifacts.filter(isSpecLikeArtifact).slice(0, 3)
}

function isSpecLikeArtifact(artifact = {}) {
  const text = `${artifact.kind || ''} ${artifact.name || ''} ${artifact.title || ''} ${artifact.path || ''}`.toLowerCase()

  return (
    text.includes('markdown') ||
    /\.m(?:d|arkdown)\b/i.test(text) ||
    text.includes('spec') ||
    text.includes('plan')
  )
}

function getArtifactDisplayName(artifact = {}) {
  const name = artifact.name || artifact.title || getFileName(artifact.path) || 'artifact'

  if (/^spec\b/i.test(name)) {
    return name
  }

  return isSpecLikeArtifact(artifact) ? `Spec ${name}` : name
}

function getArtifactPreview(artifact = {}) {
  const preview = String(artifact.contentPreview || artifact.preview || '').trim()

  return trimDisplayText(
    preview
      .replace(/^file:\s*.*?\ncontent:\s*/isu, '')
      .replace(/^content:\s*/iu, '')
      .trim(),
    360
  )
}

function getArtifactStatusLabel(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'failed') {
    return '失败'
  }

  if (normalized === 'completed' || normalized === 'changed') {
    return '已完成'
  }

  return '已运行'
}

function getCreatedTasks(message = {}) {
  const tasks = Array.isArray(message.tasks) ? message.tasks : []
  const todoTasks = tasks.filter(isTodoLikeTask)

  if (todoTasks.length) {
    return todoTasks
  }

  const structuredTasks = tasks.filter((task) => !isAgentLikeTask(task))

  if (structuredTasks.length) {
    return structuredTasks
  }

  return tasks.length > 1 ? tasks.slice(0, 6) : []
}

function isTodoLikeTask(task = {}) {
  const source = String(task.source || '').toLowerCase()

  return (
    source === 'todowrite' ||
    source.includes('todo') ||
    Boolean(task.priority) ||
    /^todo[-:]/iu.test(String(task.id || task.taskId || ''))
  )
}

function isAgentLikeTask(task = {}) {
  const source = String(task.source || '').toLowerCase()

  return Boolean(
    task.agentType ||
      task.prompt ||
      task.output ||
      task.workflowProgress?.length ||
      source === 'task' ||
      source === 'tool_use' ||
      source === 'tool_result' ||
      source.includes('task_') ||
      source.includes('agent')
  )
}

function getAgentCards(message = {}) {
  const tasks = Array.isArray(message.tasks) ? message.tasks : []
  const agentTasks = tasks.filter(isAgentLikeTask)

  if (agentTasks.length) {
    return agentTasks.slice(0, 8)
  }

  if (!isExpertTeamMode(message)) {
    return []
  }

  return getCreatedTasks(message)
    .slice(0, 8)
    .map((task, index) => ({
      ...task,
      id: `expert-${task.id || task.taskId || index}`,
      virtualAgent: true,
      agentType: task.agentType || getVirtualAgentType(index),
      owner: task.owner || AGENT_DISPLAY_NAMES[index % AGENT_DISPLAY_NAMES.length],
      source: task.source || 'expert_team_virtual',
      status: task.status || 'pending'
    }))
}

function isExpertTeamMode(message = {}) {
  return String(message.runOptions?.expertMode || '').trim() === 'expert_team'
}

function getVirtualAgentType(index = 0) {
  return ['product-planner', 'frontend-engineer', 'backend-engineer', 'qa-reviewer', 'fullstack-engineer'][
    index % 5
  ]
}

function getTaskTitle(task = {}, index = 0) {
  const title = String(task.title || task.description || task.summary || `任务 ${index + 1}`).trim()

  return trimDisplayText(title, 180)
}

function getAgentTaskTitle(task = {}, index = 0) {
  const title = String(task.title || task.description || task.summary || task.output || `任务 ${index + 1}`).trim()

  return trimDisplayText(title.replace(/\s+/gu, ' '), 180)
}

function getAgentDisplayName(task = {}, index = 0) {
  return task.owner || task.metadata?.owner || AGENT_DISPLAY_NAMES[index % AGENT_DISPLAY_NAMES.length]
}

function getAgentToneClass(index = 0) {
  return AGENT_TONES[index % AGENT_TONES.length]
}

function getAgentRoleLabel(task = {}) {
  const agentType = String(task.agentType || task.metadata?.agentType || '').toLowerCase()

  if (agentType.includes('review')) {
    return '审查工程师'
  }

  if (agentType.includes('frontend') || agentType.includes('ui')) {
    return '前端工程师'
  }

  if (agentType.includes('qa') || agentType.includes('test')) {
    return '测试工程师'
  }

  if (agentType.includes('product') || agentType.includes('plan')) {
    return '产品工程师'
  }

  return '全栈工程师'
}

function getTaskStatusLabel(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'completed') {
    return '已完成'
  }

  if (normalized === 'failed') {
    return '失败'
  }

  if (normalized === 'cancelled' || normalized === 'canceled') {
    return '已取消'
  }

  if (normalized === 'pending') {
    return '等待中'
  }

  return '运行中'
}

function getTaskStatusClass(status) {
  const normalized = String(status || '').toLowerCase()

  return {
    'is-completed': normalized === 'completed',
    'is-failed': normalized === 'failed',
    'is-running': normalized === 'running',
    'is-pending': normalized === 'pending',
    'is-cancelled': normalized === 'cancelled' || normalized === 'canceled'
  }
}

function getThinkingDurationLabel(message = {}) {
  const thoughts = Array.isArray(message.thoughts) ? message.thoughts : []
  const totalChars = thoughts.reduce((sum, thought) => sum + String(thought.text || '').length, 0)
  const seconds = Math.max(1, Math.min(99, Math.round(totalChars / 180) || thoughts.length || 1))

  return `深度思考 · ${seconds}s`
}

function getProcessedSummary(message = {}) {
  const cards = getAgentCards(message).filter((task) =>
    ['completed', 'failed', 'cancelled'].includes(String(task.status || '').toLowerCase())
  )

  if (!cards.length) {
    return []
  }

  return cards.slice(-5).map((task, index) => {
    const output = trimDisplayText(String(task.output || task.preview || '').replace(/\s+/gu, ' ').trim(), 160)
    const title = getAgentTaskTitle(task, index)
    const status = getTaskStatusLabel(task.status)

    return output || `${title}：${status}`
  })
}

function getFlowPermissionTools(message = {}) {
  const tools = Array.isArray(message.tools) ? message.tools : []

  return tools.filter((tool) => tool.isPermission)
}

function getInlineRuntimeQuestions(message = {}) {
  const questions = Array.isArray(message.questions) ? message.questions : []

  return questions.filter((question) => question.status !== 'pending')
}

function getToolStatusLabel(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'completed') {
    return '已批准'
  }

  if (normalized === 'failed') {
    return '已拒绝'
  }

  if (normalized === 'pending') {
    return '等待确认'
  }

  return '请求权限'
}

function getReviewFiles(review = {}) {
  return Array.isArray(review.files) ? review.files : []
}

function getReviewFileStatusLabel(file = {}) {
  const operation = String(file.operation || '').toLowerCase()
  const status = String(file.status || '').toLowerCase()

  if (operation.includes('delete') || status.includes('delete')) {
    return 'D'
  }

  if (operation.includes('write') || operation.includes('create')) {
    return 'A'
  }

  return 'M'
}

function getReviewFileName(file = {}) {
  return file.name || getFileName(file.path) || 'file'
}

function trimDisplayText(value, limit = 220) {
  const text = String(value || '').trim()

  if (text.length <= limit) {
    return text
  }

  return `${text.slice(0, limit - 1)}…`
}

function getErrorMessage(error) {
  return error?.message || String(error || 'Agent runtime failed.')
}

watch(
  () => [props.quest?.id, props.quest?.runtimeRequestId],
  () => {
    hydrateQuestConversation()
    nextTick(maybeStartRuntimeQuest)
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('resize', fitRightPanelToViewport)
  unsubscribeAgentRuntime = window.api?.agentRuntime?.onEvent?.(handleRuntimeEvent) || null
  unsubscribeDigitalEmployee = window.api?.digitalEmployee?.onEvent?.(handleDigitalEmployeeEvent) || null
  fitRightPanelToViewport()
  nextTick(scrollChatToBottom)
})

onBeforeUnmount(() => {
  document.body.classList.remove('is-column-resizing')
  window.removeEventListener('resize', fitRightPanelToViewport)
  unsubscribeAgentRuntime?.()
  unsubscribeDigitalEmployee?.()
  if (isRuntimeBusy.value && digitalJobId.value) {
    window.api?.digitalEmployee?.stop?.(digitalJobId.value)
  } else if (isRuntimeBusy.value && runtimeSessionId.value) {
    window.api?.agentRuntime?.stop?.(runtimeSessionId.value)
  }
})
</script>

<template>
  <section
    ref="chatShell"
    class="quest-chat"
    :class="{
      'is-resizing-right-panel': isResizingRightPanel,
      'is-right-panel-collapsed': rightPanelCollapsed
    }"
    :style="chatStyle"
  >
    <div
      class="quest-chat-main"
      :class="{ 'has-pinned-question': pinnedQuestionCard }"
      :style="chatMainStyle"
    >
      <header class="chat-titlebar">
        <strong>{{ questTitle }}</strong>
        <span>{{ workspaceDisplayName }}</span>
        <Monitor :size="14" />
      </header>

      <div ref="chatScroll" class="chat-scroll">
        <template v-for="message in messages" :key="message.id">
          <article v-if="message.role === 'user'" class="chat-user-message">
            {{ message.content }}
          </article>

          <article
            v-else
            class="assistant-message chat-assistant-message"
            :class="{
              'is-warning': message.status === 'warning',
              'is-streaming': message.status === 'streaming',
              'is-failed': message.status === 'failed'
            }"
          >
            <section
              class="answer-summary-card"
              :class="{ 'is-agent-flow-card': hasAgentFlowBlocks(message) }"
            >
              <template v-if="hasAgentFlowBlocks(message)">
                <MarkdownContent
                  v-if="getAssistantIntroText(message)"
                  class="agent-flow-lead"
                  :text="getAssistantIntroText(message)"
                  compact
                />

                <div v-if="getFlowSpecArtifacts(message).length" class="agent-flow-section">
                  <article
                    v-for="artifact in getFlowSpecArtifacts(message)"
                    :key="artifact.id"
                    class="spec-card flow-spec-card agent-spec-card"
                  >
                    <header>
                      <span>
                        <FileText :size="14" />
                        <strong>{{ getArtifactDisplayName(artifact) }}</strong>
                      </span>
                      <button type="button" aria-label="下载产物" @click.stop="openSpecDetails">
                        <Download :size="15" />
                      </button>
                    </header>
                    <p>{{ getArtifactPreview(artifact) || 'Spec 文件已更新。' }}</p>
                    <footer>
                      <button type="button" @click.stop="openSpecDetails">查看详情</button>
                      <span>{{ getArtifactStatusLabel(artifact.status) }}</span>
                    </footer>
                  </article>
                </div>

                <details v-if="message.thoughts?.length" class="agent-thinking-block" open>
                  <summary>
                    <Brain :size="13" />
                    <span>{{ getThinkingDurationLabel(message) }}</span>
                    <ChevronDown :size="13" />
                  </summary>
                  <div class="agent-thinking-raw-list">
                    <p v-for="thought in message.thoughts" :key="thought.id">
                      {{ thought.text }}
                    </p>
                  </div>
                </details>

                <div v-if="getInlineRuntimeQuestions(message).length" class="runtime-card-list agent-inline-runtime-list">
                  <article
                    v-for="questionCard in getInlineRuntimeQuestions(message)"
                    :key="questionCard.id"
                    class="runtime-question-card"
                    :class="{
                      'is-completed': questionCard.status === 'completed',
                      'is-failed': questionCard.status === 'failed'
                    }"
                  >
                    <header>
                      <strong>{{ questionCard.title || 'Question' }}</strong>
                      <em>{{ questionCard.status }}</em>
                    </header>
                    <section
                      v-for="questionItem in questionCard.questions"
                      :key="questionItem.id"
                      class="runtime-question-item"
                    >
                      <strong>{{ questionItem.question }}</strong>
                      <div class="runtime-question-options">
                        <button
                          v-for="option in questionItem.options"
                          :key="option.id"
                          type="button"
                          :class="{
                            'is-selected': isRuntimeQuestionOptionSelected(questionCard, questionItem, option)
                          }"
                          :disabled="questionCard.status !== 'pending' || questionCard.submitting"
                          @click.stop="toggleRuntimeQuestionOption(questionCard, questionItem, option)"
                        >
                          <span>{{ option.label }}</span>
                          <small v-if="option.description">{{ option.description }}</small>
                        </button>
                      </div>
                    </section>
                    <footer v-if="questionCard.status === 'pending'" class="runtime-card-actions">
                      <em v-if="questionCard.error">{{ questionCard.error }}</em>
                      <button
                        type="button"
                        :disabled="questionCard.submitting"
                        @click.stop="declineRuntimeQuestion(questionCard)"
                      >
                        跳过
                      </button>
                      <button
                        type="button"
                        class="is-primary"
                        :disabled="questionCard.submitting"
                        @click.stop="submitRuntimeQuestion(questionCard)"
                      >
                        {{ questionCard.submitting ? '发送中' : '发送' }}
                      </button>
                    </footer>
                  </article>
                </div>

                <div v-if="message.plans?.length" class="runtime-card-list agent-inline-runtime-list">
                  <article
                    v-for="plan in message.plans"
                    :key="plan.id"
                    class="runtime-plan-card"
                    :class="{
                      'is-completed': plan.status === 'completed',
                      'is-failed': plan.status === 'failed'
                    }"
                  >
                    <header>
                      <strong>{{ plan.title || 'Plan' }}</strong>
                      <em>{{ plan.status }}</em>
                    </header>
                    <MarkdownContent
                      class="runtime-plan-preview"
                      :text="plan.plan || plan.summary || plan.inputPreview"
                      compact
                    />
                    <footer v-if="plan.status === 'pending'" class="runtime-card-actions">
                      <em v-if="plan.error">{{ plan.error }}</em>
                      <button
                        type="button"
                        :disabled="plan.submitting"
                        @click.stop="respondRuntimePlan(plan, false)"
                      >
                        拒绝
                      </button>
                      <button
                        type="button"
                        class="is-primary"
                        :disabled="plan.submitting"
                        @click.stop="respondRuntimePlan(plan, true)"
                      >
                        {{ plan.submitting ? '发送中' : '批准' }}
                      </button>
                    </footer>
                  </article>
                </div>

                <div v-if="getFlowPermissionTools(message).length" class="agent-permission-list">
                  <article
                    v-for="tool in getFlowPermissionTools(message)"
                    :key="tool.id"
                    class="agent-permission-card"
                    :class="{
                      'is-completed': tool.status === 'completed',
                      'is-failed': tool.status === 'failed'
                    }"
                  >
                    <header>
                      <span>
                        <Sparkles :size="13" />
                        <strong>{{ tool.name }}</strong>
                      </span>
                      <em>{{ getToolStatusLabel(tool.status) }}</em>
                    </header>
                    <p>{{ tool.summary || tool.inputPreview || tool.detail || 'Agent 请求执行权限。' }}</p>
                    <em v-if="tool.error" class="permission-inline-error">{{ tool.error }}</em>
                    <footer v-if="tool.status === 'pending'" class="permission-inline-actions">
                      <button
                        type="button"
                        :disabled="tool.submitting"
                        @click.stop="respondRuntimePermission(tool, false)"
                      >
                        拒绝
                      </button>
                      <button
                        type="button"
                        class="is-primary"
                        :disabled="tool.submitting"
                        @click.stop="respondRuntimePermission(tool, true)"
                      >
                        {{ tool.submitting ? '处理中' : '允许' }}
                      </button>
                    </footer>
                  </article>
                </div>

                <section v-if="getCreatedTasks(message).length" class="agent-created-tasks">
                  <header class="agent-flow-meta">
                    <ClipboardList :size="13" />
                    <span>已创建 {{ getCreatedTasks(message).length }} 个任务</span>
                    <ChevronDown :size="13" />
                  </header>
                  <ol>
                    <li v-for="(task, index) in getCreatedTasks(message)" :key="task.id">
                      <span>任务 {{ index + 1 }}：</span>{{ getTaskTitle(task, index) }}
                    </li>
                  </ol>
                </section>

                <div v-if="getAgentCards(message).length" class="agent-task-stack">
                  <article
                    v-for="(task, index) in getAgentCards(message)"
                    :key="task.id"
                    class="task-card agent-task-card"
                    :class="getTaskStatusClass(task.status)"
                  >
                    <span class="task-avatar" :class="getAgentToneClass(index)">
                      {{ getAgentDisplayName(task, index).slice(0, 1) }}
                    </span>
                    <div class="task-copy">
                      <span>{{ getAgentRoleLabel(task) }} {{ getAgentDisplayName(task, index) }}</span>
                      <strong>{{ getAgentTaskTitle(task, index) }}</strong>
                      <small v-if="task.lastToolName || task.outputFile">
                        {{ task.lastToolName || task.outputFile }}
                      </small>
                    </div>
                    <span class="task-status" :class="{ 'is-failed': task.status === 'failed' }">
                      {{ getTaskStatusLabel(task.status) }}
                    </span>
                  </article>
                </div>

                <section v-if="getProcessedSummary(message).length" class="agent-processed-block">
                  <header class="agent-flow-meta">
                    <Bot :size="13" />
                    <span>已处理</span>
                    <ChevronDown :size="13" />
                  </header>
                  <div>
                    <p v-for="item in getProcessedSummary(message)" :key="item">{{ item }}</p>
                  </div>
                </section>

                <MarkdownContent
                  v-if="getAssistantFinalText(message)"
                  class="agent-final-markdown"
                  :text="getAssistantFinalText(message)"
                />

                <article v-if="message.review" class="agent-review-card">
                  <header>
                    <span>
                      <FileDiff :size="15" />
                      <strong>{{ getReviewFiles(message.review).length }} 个文件已变更</strong>
                      <em class="change-file-additions">+{{ message.review.additions || 0 }}</em>
                      <em class="change-file-deletions">-{{ message.review.deletions || 0 }}</em>
                    </span>
                    <button type="button" @click.stop="openSpecDetails">审查</button>
                  </header>
                  <div class="change-file-list">
                    <div
                      v-for="file in getReviewFiles(message.review).slice(0, 5)"
                      :key="file.id"
                      class="change-file-row"
                    >
                      <span class="change-file-main">
                        <FileText :size="14" class="change-file-icon" />
                        <span class="change-file-name">{{ getReviewFileName(file) }}</span>
                      </span>
                      <span class="change-file-stats">
                        <span v-if="file.additions" class="change-file-additions">+{{ file.additions }}</span>
                        <span v-if="file.deletions" class="change-file-deletions">-{{ file.deletions }}</span>
                        <span class="change-file-neutral">{{ getReviewFileStatusLabel(file) }}</span>
                      </span>
                    </div>
                  </div>
                  <footer v-if="getReviewFiles(message.review).length > 5">
                    <ChevronDown :size="14" />
                  </footer>
                </article>
              </template>
              <template v-else>
              <div class="answer-summary-head">
                <strong>{{ message.step || 'Agent 回复' }}</strong>
              </div>
              <MarkdownContent
                class="answer-summary-lead"
                :text="message.content || (message.status === 'streaming' ? '正在等待 agent 输出...' : '')"
                compact
              />
              <div v-if="message.thoughts?.length" class="runtime-thought-list">
                <article
                  v-for="thought in message.thoughts"
                  :key="thought.id"
                  class="runtime-thought-item"
                >
                  <strong>{{ thought.title }}</strong>
                  <p>{{ thought.text }}</p>
                </article>
              </div>
              <div v-if="getInlineRuntimeQuestions(message).length" class="runtime-card-list">
                <article
                  v-for="questionCard in getInlineRuntimeQuestions(message)"
                  :key="questionCard.id"
                  class="runtime-question-card"
                  :class="{
                    'is-completed': questionCard.status === 'completed',
                    'is-failed': questionCard.status === 'failed'
                  }"
                >
                  <header>
                    <strong>{{ questionCard.title || 'Question' }}</strong>
                    <em>{{ questionCard.status }}</em>
                  </header>
                  <section
                    v-for="questionItem in questionCard.questions"
                    :key="questionItem.id"
                    class="runtime-question-item"
                  >
                    <strong>{{ questionItem.question }}</strong>
                    <div v-if="questionHasOptions(questionItem)" class="runtime-question-options">
                      <button
                        v-for="option in questionItem.options"
                        :key="option.id"
                        type="button"
                        :class="{
                          'is-selected': isRuntimeQuestionOptionSelected(questionCard, questionItem, option)
                        }"
                        :disabled="questionCard.status !== 'pending' || questionCard.submitting"
                        @click.stop="toggleRuntimeQuestionOption(questionCard, questionItem, option)"
                      >
                        <span>{{ option.label }}</span>
                        <small v-if="option.description">{{ option.description }}</small>
                      </button>
                    </div>
                    <textarea
                      v-else
                      v-model="questionCard.freeformAnswer"
                      class="runtime-question-input"
                      rows="3"
                      placeholder="输入你的回答"
                      :disabled="questionCard.status !== 'pending' || questionCard.submitting"
                    />
                  </section>
                  <footer v-if="questionCard.status === 'pending'" class="runtime-card-actions">
                    <em v-if="questionCard.error">{{ questionCard.error }}</em>
                    <button
                      type="button"
                      :disabled="questionCard.submitting"
                      @click.stop="declineRuntimeQuestion(questionCard)"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      class="is-primary"
                      :disabled="questionCard.submitting"
                      @click.stop="submitRuntimeQuestion(questionCard)"
                    >
                      {{ questionCard.submitting ? 'Sending' : 'Answer' }}
                    </button>
                  </footer>
                  <p v-else-if="Object.keys(questionCard.answers || {}).length" class="runtime-card-result">
                    {{ Object.entries(questionCard.answers).map(([key, value]) => `${key}: ${value}`).join(' · ') }}
                  </p>
                </article>
              </div>
              <div v-if="message.plans?.length" class="runtime-card-list">
                <article
                  v-for="plan in message.plans"
                  :key="plan.id"
                  class="runtime-plan-card"
                  :class="{
                    'is-completed': plan.status === 'completed',
                    'is-failed': plan.status === 'failed'
                  }"
                >
                  <header>
                    <strong>{{ plan.title || 'Plan' }}</strong>
                    <em>{{ plan.status }}</em>
                  </header>
                  <MarkdownContent
                    class="runtime-plan-preview"
                    :text="plan.plan || plan.summary || plan.inputPreview"
                    compact
                  />
                  <footer v-if="plan.status === 'pending'" class="runtime-card-actions">
                    <em v-if="plan.error">{{ plan.error }}</em>
                    <button
                      type="button"
                      :disabled="plan.submitting"
                      @click.stop="respondRuntimePlan(plan, false)"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      class="is-primary"
                      :disabled="plan.submitting"
                      @click.stop="respondRuntimePlan(plan, true)"
                    >
                      {{ plan.submitting ? 'Sending' : 'Approve' }}
                    </button>
                  </footer>
                </article>
              </div>
              <div v-if="message.tasks?.length" class="run-panel runtime-task-panel">
                <div class="run-step-list">
                  <div
                    v-for="task in message.tasks"
                    :key="task.id"
                    class="run-step-row"
                  >
                    <span
                      class="run-step-dot"
                      :class="{
                        'is-done': task.status === 'completed',
                        'is-error': task.status === 'failed',
                        'is-tool': task.status === 'running' || task.status === 'pending'
                      }"
                    />
                    <span class="run-step-text">
                      <strong>{{ task.agentType || task.title || 'Agent task' }}</strong>
                      {{ task.description || task.summary || task.status }}
                      <small v-if="task.lastToolName || task.preview || task.output">
                        {{ task.lastToolName || task.preview || task.output }}
                      </small>
                    </span>
                  </div>
                </div>
              </div>
              <article v-if="message.review" class="runtime-review-card">
                <strong>Review</strong>
                <span class="review-pill">
                  <span class="plus">+{{ message.review.additions || 0 }}</span>
                  <span class="minus">-{{ message.review.deletions || 0 }}</span>
                </span>
                <small>{{ message.review.files?.length || 0 }} file event(s)</small>
              </article>
              <div v-if="message.bullets?.length" class="answer-summary-list">
                <div
                  v-for="item in message.bullets"
                  :key="item"
                  class="answer-summary-row"
                >
                  <span class="answer-summary-dot" />
                  <MarkdownContent :text="item" compact />
                </div>
              </div>
              <div v-if="message.tools?.length" class="run-panel is-compact">
                <div class="run-step-list">
                  <div v-for="tool in message.tools" :key="tool.id" class="run-step-row">
                    <span
                      class="run-step-dot"
                      :class="{
                        'is-done': tool.status === 'completed',
                        'is-error': tool.status === 'failed',
                        'is-tool': tool.status === 'running' || tool.status === 'pending'
                      }"
                    />
                    <span class="run-step-text">
                      <strong>{{ tool.name }}</strong>
                      {{ tool.isPermission && tool.status === 'pending' ? '等待批准' : tool.summary || tool.status }}
                      <small v-if="tool.inputPreview || tool.outputPreview || tool.detail">
                        {{ tool.outputPreview || tool.inputPreview || tool.detail }}
                      </small>
                      <em v-if="tool.error" class="permission-inline-error">{{ tool.error }}</em>
                      <span
                        v-if="tool.isPermission && tool.status === 'pending'"
                        class="permission-inline-actions"
                      >
                        <button
                          type="button"
                          :disabled="tool.submitting"
                          @click.stop="respondRuntimePermission(tool, false)"
                        >
                          拒绝
                        </button>
                        <button
                          type="button"
                          class="is-primary"
                          :disabled="tool.submitting"
                          @click.stop="respondRuntimePermission(tool, true)"
                        >
                          {{ tool.submitting ? '处理中' : '允许' }}
                        </button>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              </template>
            </section>
          </article>
        </template>

        <article v-if="!messages.length" class="question-card">
          <h2>
            <GitBranch :size="16" />
            Xoder Quest
          </h2>
          <p class="question-strong">
            当前没有会话历史。输入任务后，Xoder 会通过 agent runtime 中间层启动备用 agent。
          </p>
          <p>前端只消费标准事件，不直接依赖 Bun 或 Claude Code 的原始 stream-json。</p>
        </article>
      </div>

      <Transition name="pinned-question">
        <section v-if="pinnedQuestionCard" class="pinned-question-layer" aria-live="polite">
          <article
            class="runtime-question-card pinned-question-card"
            :class="{ 'is-submitting': pinnedQuestionCard.submitting }"
          >
            <header>
              <span>
                <Sparkles :size="14" />
                <strong>{{ pinnedQuestionCard.title || '需要你确认' }}</strong>
              </span>
              <em>
                {{
                  pendingRuntimeQuestions.length > 1
                    ? `${pendingRuntimeQuestions.length} 个待回答`
                    : 'PENDING'
                }}
              </em>
            </header>
            <div class="pinned-question-body">
              <section
                v-for="questionItem in pinnedQuestionCard.questions"
                :key="questionItem.id"
                class="runtime-question-item"
              >
                <strong>{{ questionItem.question }}</strong>
                <div v-if="questionHasOptions(questionItem)" class="runtime-question-options">
                  <button
                    v-for="option in questionItem.options"
                    :key="option.id"
                    type="button"
                    :class="{
                      'is-selected': isRuntimeQuestionOptionSelected(pinnedQuestionCard, questionItem, option)
                    }"
                    :disabled="pinnedQuestionCard.submitting"
                    @click.stop="toggleRuntimeQuestionOption(pinnedQuestionCard, questionItem, option)"
                  >
                    <span>{{ option.label }}</span>
                    <small v-if="option.description">{{ option.description }}</small>
                  </button>
                </div>
                <textarea
                  v-else
                  v-model="pinnedQuestionCard.freeformAnswer"
                  class="runtime-question-input"
                  rows="3"
                  placeholder="输入你的回答"
                  :disabled="pinnedQuestionCard.submitting"
                />
              </section>
            </div>
            <footer class="runtime-card-actions pinned-question-actions">
              <em v-if="pinnedQuestionCard.error">{{ pinnedQuestionCard.error }}</em>
              <button
                type="button"
                :disabled="pinnedQuestionCard.submitting"
                @click.stop="declineRuntimeQuestion(pinnedQuestionCard)"
              >
                跳过
              </button>
              <button
                type="button"
                class="is-primary"
                :disabled="pinnedQuestionCard.submitting"
                @click.stop="submitRuntimeQuestion(pinnedQuestionCard)"
              >
                {{ pinnedQuestionCard.submitting ? '发送中' : '发送' }}
              </button>
            </footer>
          </article>
        </section>
      </Transition>

      <div class="chat-composer-dock">
        <div class="review-pill">
          {{ runtimeStatusLabel }}
          <span class="plus">+{{ runtimeReview.additions || 0 }}</span>
          <span class="minus">-{{ runtimeReview.deletions || 0 }}</span>
        </div>
        <div class="composer-context-line">
          <CheckCircle2 :size="13" />
          <span>
            {{
              hasRuntimeActivity
                ? `Runtime ${runtimeSessionId || '准备中'} · ${runtimeTools.length} 个工具事件`
                : '发送后将通过 agent-runtime 中间层调用备用 agent。'
            }}
          </span>
          <div class="composer-context-right">
            <button
              v-if="digitalJobId && runtimeStatus === 'running'"
              type="button"
              @click="pauseDigitalEmployee"
            >
              <Pause :size="13" />
              暂停
            </button>
            <button
              v-if="digitalJobId && runtimeStatus === 'paused'"
              type="button"
              @click="resumeDigitalEmployee"
            >
              <Play :size="13" />
              继续
            </button>
            <button v-if="isRuntimeBusy" type="button" @click="stopRuntime">
              停止
              <CornerDownRight :size="13" />
            </button>
            <button type="button" @click="openRuntimeSettings">
              打开运行详情
              <CornerDownRight :size="13" />
            </button>
            <button type="button" @click="openSpecDetails">
              查看摘要
              <CornerDownRight :size="13" />
            </button>
          </div>
        </div>
        <PromptComposer
          :workspace="workspace"
          :disabled="isRuntimeBusy"
          disabled-hint="Agent 正在处理当前任务"
          @submit-prompt="submitChatPrompt"
        />
      </div>
    </div>

    <div
      class="right-panel-resize-handle"
      :style="rightPanelResizeStyle"
      role="separator"
      aria-label="调整右侧工作台宽度"
      aria-orientation="vertical"
      @pointerdown="startRightPanelResize"
      @dblclick.prevent="resetRightPanelWidth"
    />
    <QuestRightPanel
      ref="rightPanel"
      :style="rightPanelStyle"
      :workspace="props.workspace"
      :run-state="rightPanelRunState"
    />
  </section>
</template>
