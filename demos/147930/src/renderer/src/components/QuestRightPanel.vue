<script setup>
import { computed, ref } from 'vue'
import MarkdownContent from './MarkdownContent.vue'
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  GitBranch,
  ListChecks,
  Sparkles,
  Workflow
} from 'lucide-vue-next'
import { staticEmployees, staticRightPanel } from '../static-data.js'

const props = defineProps({
  workspace: {
    type: Object,
    default: () => ({
      name: 'NLP 课程',
      path: 'F:/学习/AI学习/NLP课程'
    })
  },
  runState: {
    type: Object,
    default: null
  }
})

const activeTab = ref('overview')
const selectedEmployeeKey = ref(staticEmployees[0]?.employeeKey || '')

const panelData = computed(() => ({
  ...staticRightPanel,
  ...(props.runState || {})
}))
const tabs = [
  { id: 'overview', label: '概览', icon: Sparkles },
  { id: 'steps', label: '步骤', icon: ListChecks },
  { id: 'artifacts', label: '产物', icon: FileText },
  { id: 'logs', label: '日志', icon: Workflow },
  { id: 'employees', label: '员工', icon: GitBranch }
]
const selectedEmployee = computed(
  () =>
    staticEmployees.find((employee) => employee.employeeKey === selectedEmployeeKey.value) ||
    staticEmployees[0] ||
    null
)

function setTab(tabId) {
  activeTab.value = tabId
}

function openSpecTab() {
  activeTab.value = 'artifacts'
}

function selectEmployee(employeeKey) {
  selectedEmployeeKey.value = employeeKey
}

defineExpose({
  openSpecTab
})
</script>

<template>
  <aside class="quest-right-panel">
    <header class="right-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ 'is-active': activeTab === tab.id }"
        @click="setTab(tab.id)"
      >
        <component :is="tab.icon" :size="15" />
        <span>{{ tab.label }}</span>
      </button>
    </header>

    <section v-if="activeTab === 'overview'" class="right-content">
      <div class="panel-section live-summary-section">
        <div class="panel-section-title">
          <span>实时摘要</span>
          <em class="live-summary-source">{{ panelData.liveSummary.source }}</em>
        </div>
        <div class="live-summary-meta">
          <span>{{ panelData.liveSummary.stageLabel }}</span>
          <span>{{ panelData.statusLabel }}</span>
        </div>
        <MarkdownContent
          class="live-summary-text"
          :text="panelData.liveSummary.text"
          compact
        />
        <div v-if="panelData.metadata?.model" class="live-summary-evidence">
          <span>{{ panelData.metadata.model }}</span>
          <span>{{ panelData.metadata.permissionMode || 'default' }}</span>
          <span>{{ panelData.sessionId || 'local-session' }}</span>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-section-title">
          <span>任务进展</span>
          <ChevronDown :size="14" />
        </div>
        <div class="progress-list">
          <div
            v-for="task in panelData.progressTasks"
            :key="task.id"
            class="progress-item"
            :class="{ 'is-failed': task.status === 'failed' }"
          >
            <CheckCircle2 :size="15" />
            <div>
              <strong>{{ task.title }}</strong>
              <span>{{ task.detail }}</span>
            </div>
          </div>
        </div>
        <button class="adhoc-button" type="button">
          {{ panelData.status === 'static' ? '静态模式：不运行任务' : 'agent-runtime 事件流' }}
        </button>
      </div>

      <div v-if="panelData.thoughts?.length" class="panel-section compact">
        <div class="panel-section-title">
          <span>思考过程</span>
          <ChevronDown :size="14" />
        </div>
        <div class="runtime-thought-list is-panel">
          <article
            v-for="thought in panelData.thoughts.slice(-3)"
            :key="thought.id"
            class="runtime-thought-item"
          >
            <strong>{{ thought.title }}</strong>
            <p>{{ thought.text }}</p>
          </article>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-section-title">
          <span>产物</span>
          <ChevronDown :size="14" />
        </div>
        <div
          v-for="artifact in panelData.artifacts"
          :key="artifact.id"
          class="artifact-line"
          @click="setTab('artifacts')"
        >
          <span class="file-type-icon artifact-file-icon">F</span>
          {{ artifact.name }}
        </div>
      </div>

      <div class="panel-section compact">
        <div class="panel-section-title">
          <span>引用</span>
          <ChevronDown :size="14" />
        </div>
        <div
          v-for="reference in panelData.references"
          :key="reference.id"
          class="memory-line"
          :title="reference.detail"
        >
          {{ reference.title }}
        </div>
      </div>
    </section>

    <section v-else-if="activeTab === 'steps'" class="right-content worklog-panel">
      <div class="worklog-summary-card">
        <div>
          <span>{{ panelData.status === 'static' ? '静态步骤' : '运行步骤' }}</span>
          <strong>{{ panelData.title || '当前 Quest' }}</strong>
        </div>
        <em>{{ panelData.status === 'static' ? '所有步骤来自 fixture，不订阅实时事件。' : panelData.sessionId || '等待 session 初始化' }}</em>
      </div>

      <div class="worklog-timeline">
        <article
          v-for="task in panelData.progressTasks"
          :key="task.id"
          class="worklog-event"
        >
          <div class="worklog-event-marker">
            <span />
          </div>
          <div class="worklog-event-body">
            <header>
              <strong>{{ task.title }}</strong>
              <em>{{ task.status }}</em>
            </header>
            <p>{{ task.detail }}</p>
            <pre v-if="task.preview" class="runtime-preview-block">{{ task.preview }}</pre>
          </div>
        </article>
      </div>
    </section>

    <section v-else-if="activeTab === 'artifacts'" class="right-content">
      <div class="panel-section">
        <div class="panel-section-title">
          <span>{{ panelData.status === 'static' ? '静态产物' : '运行产物' }}</span>
          <ChevronDown :size="14" />
        </div>
        <div class="changed-files">
          <div v-for="artifact in panelData.artifacts" :key="artifact.id">
            <span class="file-type-icon artifact-file-icon">F</span>
            <span>{{ artifact.path }}</span>
            <em>{{ artifact.diff }}</em>
            <pre v-if="artifact.preview" class="runtime-preview-block">{{ artifact.preview }}</pre>
          </div>
        </div>
      </div>

      <div class="panel-section compact">
        <div class="panel-section-title">
          <span>说明</span>
          <ChevronDown :size="14" />
        </div>
        <p class="small-muted">
          {{
            panelData.status === 'static'
              ? '这里不读取文件系统、不打开编辑器、不保存文档，只展示固定产物名称。'
              : '这里展示 Write/Edit/NotebookEdit 等工具上报的产物事件。'
          }}
        </p>
      </div>
    </section>

    <section v-else-if="activeTab === 'logs'" class="right-content worklog-panel">
      <div class="worklog-summary-card">
        <div>
          <span>运行日志</span>
          <strong>{{ panelData.status === 'static' ? '静态事件' : 'Runtime 事件' }}</strong>
        </div>
        <em>{{ panelData.status === 'static' ? '无 runtime、无审批、无 trace。' : '来自 agent-runtime 标准事件协议。' }}</em>
      </div>
      <div class="task-log-list">
        <article v-for="log in panelData.logs" :key="log.id" class="task-log-item">
          <div class="task-log-marker" />
          <div class="task-log-body">
            <div class="task-log-head">
              <strong>{{ log.type }}</strong>
              <span>{{ log.time }}</span>
            </div>
            <p>{{ log.message }}</p>
            <pre v-if="log.detail" class="runtime-preview-block">{{ log.detail }}</pre>
            <details v-if="log.rawJson" class="runtime-raw-details">
              <summary>原始 JSON</summary>
              <pre>{{ log.rawJson }}</pre>
            </details>
          </div>
        </article>
      </div>
    </section>

    <section v-else class="right-content">
      <div class="panel-section">
        <div class="panel-section-title">
          <span>数字员工</span>
          <ChevronDown :size="14" />
        </div>
        <div class="worklog-expert-list">
          <button
            v-for="employee in staticEmployees"
            :key="employee.employeeKey"
            class="worklog-expert-card"
            type="button"
            :class="{ 'is-selected': employee.employeeKey === selectedEmployeeKey }"
            @click="selectEmployee(employee.employeeKey)"
          >
            <div>
              <strong>{{ employee.displayName }}</strong>
              <span>{{ employee.roleName }}</span>
              <small>{{ employee.description }}</small>
            </div>
            <em>fixture</em>
          </button>
        </div>
      </div>

      <div v-if="selectedEmployee" class="panel-section compact">
        <div class="panel-section-title">
          <span>{{ selectedEmployee.displayName }}</span>
          <ChevronDown :size="14" />
        </div>
        <div class="worklog-mini-list">
          <div
            v-for="capability in selectedEmployee.coreCapabilities?.ZH || []"
            :key="capability"
          >
            <strong>{{ capability }}</strong>
            <span>静态能力标签</span>
          </div>
        </div>
      </div>
    </section>
  </aside>
</template>
