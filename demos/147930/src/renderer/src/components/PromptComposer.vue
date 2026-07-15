<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  Bot,
  Check,
  ChevronDown,
  Hand,
  SearchCheck,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRoundCheck,
  Users
} from 'lucide-vue-next'

const emit = defineEmits(['submit-prompt'])
const props = defineProps({
  workspace: {
    type: Object,
    default: () => ({
      id: '',
      name: '',
      path: ''
    })
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledHint: {
    type: String,
    default: 'Agent 正在处理当前任务'
  }
})

const prompt = ref('')
const intentMode = ref('auto')
const expertMode = ref('expert_team')
const employeeKey = ref('')
const runMode = ref('Auto')
const approvalMode = ref('auto')
const openMenu = ref('')
const allowShell = ref(false)
const notice = ref('')
const runtimeCapabilities = ref(null)

const canSubmit = computed(() => !props.disabled && prompt.value.trim().length > 0)
const supportsNativeTeamRuntime = computed(() =>
  Boolean(runtimeCapabilities.value?.modes?.nativeTeamRuntime)
)
const supportsEmployeeRuntime = computed(() =>
  Boolean(runtimeCapabilities.value?.modes?.digitalEmployee)
)
const runtimeEmployees = computed(() =>
  Array.isArray(runtimeCapabilities.value?.employees) ? runtimeCapabilities.value.employees : []
)
const selectedApprovalMode = computed(
  () => approvalModes.find((mode) => mode.id === approvalMode.value) || approvalModes[1]
)
const selectedAgentMode = computed(
  () => agentModeOptions.value.find((mode) => mode.id === getCurrentAgentModeId()) || agentModeOptions.value[0]
)
const isDigitalEmployeeMode = computed(
  () => selectedAgentMode.value?.executionMode === 'digital_employee'
)
const agentModeOptions = computed(() => {
  const modes = [
    {
      id: 'digital_team',
      label: '数字员工团队',
      description: 'Xoder 本地编排阶段式团队：隔离 worktree、写代码、QA、Review、提交报告。',
      icon: Users,
      expertMode: 'xoder_digital_team',
      employeeKey: '',
      executionMode: 'digital_employee',
      enabled: true
    },
    {
      id: 'expert_team',
      label: '专家团',
      description: supportsNativeTeamRuntime.value
        ? '调用基座 headless /team，leader 拆任务，多员工并行执行。'
        : '使用当前 headless 通道可用的 Task/TodoWrite 专家协作流程，不发送 /team。',
      icon: Users,
      expertMode: 'expert_team',
      employeeKey: '',
      enabled: true
    },
    {
      id: 'single_agent',
      label: '智能体',
      description: '单个备用 agent 直接处理当前任务。',
      icon: Bot,
      expertMode: 'single_agent',
      employeeKey: '',
      enabled: true
    },
    {
      id: 'reviewer',
      label: '审阅者',
      description: '偏向审查、风险、diff 和验证结论。',
      icon: SearchCheck,
      expertMode: 'reviewer',
      employeeKey: '',
      enabled: true
    }
  ]

  if (supportsEmployeeRuntime.value && runtimeEmployees.value.length) {
    for (const employee of runtimeEmployees.value) {
      modes.push({
        id: `employee:${employee.name}`,
        label: `员工: ${employee.name}`,
        description: employee.description || `调用基座 headless /employee ${employee.name}`,
        icon: UserRoundCheck,
        expertMode: 'digital_employee',
        employeeKey: employee.name,
        enabled: true
      })
    }
  }

  return modes
})

const approvalModes = [
  {
    id: 'manual',
    label: '请求批准',
    description: '所有需要确认的操作都交给用户逐个批准。',
    icon: Hand
  },
  {
    id: 'auto',
    label: '替我审批',
    description: '常规安全操作自动放行，问题和计划仍在卡片里确认。',
    icon: Shield
  },
  {
    id: 'fullAccess',
    label: '完全访问',
    description: '允许读写、Shell 和网络，适合你明确要全自动执行的任务。',
    icon: ShieldCheck
  },
  {
    id: 'custom',
    label: '自定义',
    description: '使用当前工具栏开关组合出的权限。',
    icon: Settings
  }
]

const intentModes = [
  { id: 'auto', label: '自动判断' },
  { id: 'chat', label: '聊天问答' },
  { id: 'code', label: '改代码' }
]

const runModes = ['Auto', 'Plan', 'Fast']

onMounted(async () => {
  try {
    runtimeCapabilities.value = await window.api?.agentRuntime?.listCapabilities?.()
  } catch {
    runtimeCapabilities.value = null
  }
})

function toggleMenu(name) {
  if (props.disabled) {
    showStaticNotice()
    return
  }

  openMenu.value = openMenu.value === name ? '' : name
}

function setAgentMode(mode) {
  if (!mode?.enabled) {
    showStaticNotice('这个基座能力当前不可用')
    return
  }

  expertMode.value = mode.expertMode
  employeeKey.value = mode.employeeKey || ''
  openMenu.value = ''
}

function setIntentMode(value) {
  intentMode.value = value
  openMenu.value = ''
}

function setRunMode(value) {
  runMode.value = value
  openMenu.value = ''
}

function setApprovalMode(value) {
  approvalMode.value = value
  openMenu.value = ''

  if (value === 'fullAccess') {
    allowShell.value = true
  }
}

function getCurrentAgentModeId() {
  if (expertMode.value === 'xoder_digital_team') {
    return 'digital_team'
  }

  if (expertMode.value === 'digital_employee' && employeeKey.value) {
    return `employee:${employeeKey.value}`
  }

  return expertMode.value
}

function showStaticNotice(message = props.disabledHint) {
  notice.value = message
  window.setTimeout(() => {
    if (notice.value === message) {
      notice.value = ''
    }
  }, 1800)
}

function submitPrompt() {
  if (props.disabled) {
    showStaticNotice()
    return
  }

  if (!canSubmit.value) {
    return
  }

  emit('submit-prompt', prompt.value.trim(), {
    allowShell: allowShell.value,
    approvalMode: approvalMode.value,
    allowApplyPatch: intentMode.value !== 'chat',
    intentMode: intentMode.value,
    expertMode: expertMode.value,
    employeeKey: employeeKey.value,
    assignedUnitId: employeeKey.value,
    executionMode: selectedAgentMode.value.executionMode || 'agent_runtime',
    runMode: runMode.value
  })
  prompt.value = ''
}
</script>

<template>
  <form
    class="prompt-composer"
    :class="{
      'is-focused': prompt,
      'is-disabled': disabled
    }"
    @submit.prevent="submitPrompt"
  >
    <textarea
      v-model="prompt"
      placeholder="描述你想让 Xoder 处理的任务"
      aria-label="输入消息"
      @keydown.ctrl.enter.prevent="submitPrompt"
    />
    <div class="composer-toolbar">
      <div class="composer-options">
        <label class="composer-shell-toggle" :class="{ 'is-on': allowShell }">
          <input v-model="allowShell" type="checkbox" :disabled="disabled" />
          <Terminal :size="14" />
          <span>Shell</span>
        </label>

        <div class="composer-menu-wrap">
          <button
            class="composer-select composer-approval-select"
            type="button"
            :title="selectedApprovalMode.description"
            @click="toggleMenu('approval')"
          >
            <component :is="selectedApprovalMode.icon" :size="14" />
            {{ selectedApprovalMode.label }}
            <ChevronDown :size="13" />
          </button>
          <div v-if="openMenu === 'approval'" class="floating-menu composer-menu approval-mode-menu">
            <button
              v-for="mode in approvalModes"
              :key="mode.id"
              type="button"
              :class="{ 'is-selected': approvalMode === mode.id }"
              @click="setApprovalMode(mode.id)"
            >
              <component :is="mode.icon" :size="15" />
              <span>
                <strong>{{ mode.label }}</strong>
                <small>{{ mode.description }}</small>
              </span>
              <Check v-if="approvalMode === mode.id" :size="14" />
            </button>
          </div>
        </div>

        <div class="composer-menu-wrap">
          <button class="composer-select" type="button" @click="toggleMenu('intent')">
            {{ intentModes.find((mode) => mode.id === intentMode)?.label || '自动判断' }}
            <ChevronDown :size="13" />
          </button>
          <div v-if="openMenu === 'intent'" class="floating-menu composer-menu">
            <button
              v-for="mode in intentModes"
              :key="mode.id"
              type="button"
              :class="{ 'is-selected': intentMode === mode.id }"
              @click="setIntentMode(mode.id)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="composer-menu-wrap">
          <button
            class="composer-select composer-agent-select"
            type="button"
            :title="selectedAgentMode.description"
            @click="toggleMenu('agent')"
          >
            <component :is="selectedAgentMode.icon || Sparkles" :size="15" />
            {{ selectedAgentMode.label }}
            <ChevronDown :size="13" />
          </button>
          <div v-if="openMenu === 'agent'" class="floating-menu composer-menu agent-mode-menu">
            <button
              v-for="mode in agentModeOptions"
              :key="mode.id"
              type="button"
              :class="{
                'is-selected': getCurrentAgentModeId() === mode.id,
                'is-disabled': !mode.enabled
              }"
              :disabled="!mode.enabled"
              @click="setAgentMode(mode)"
            >
              <component :is="mode.icon" :size="15" />
              <span>
                <strong>{{ mode.label }}</strong>
                <small>{{ mode.description }}</small>
              </span>
              <Check v-if="getCurrentAgentModeId() === mode.id" :size="14" />
            </button>
          </div>
        </div>

        <div class="composer-menu-wrap">
          <button class="composer-select" type="button" @click="toggleMenu('run')">
            {{ runMode }}
            <ChevronDown :size="13" />
          </button>
          <div v-if="openMenu === 'run'" class="floating-menu composer-menu">
            <button
              v-for="mode in runModes"
              :key="mode"
              type="button"
              :class="{ 'is-selected': runMode === mode }"
              @click="setRunMode(mode)"
            >
              {{ mode }}
            </button>
          </div>
        </div>
      </div>

      <div class="composer-actions">
        <button
          class="send-button"
          type="submit"
          :aria-label="isDigitalEmployeeMode ? '开始工作' : '发送'"
          :disabled="disabled || !prompt.trim()"
          :class="{ 'is-ready': canSubmit, 'is-work-mode': isDigitalEmployeeMode }"
          :title="isDigitalEmployeeMode ? '开始数字员工团队工作' : '发送到 Xoder agent runtime'"
        >
          <span v-if="isDigitalEmployeeMode">开始工作</span>
          <Send :size="15" />
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="notice" class="composer-hint is-error">
        {{ notice }}
      </div>
    </Transition>
  </form>
</template>
