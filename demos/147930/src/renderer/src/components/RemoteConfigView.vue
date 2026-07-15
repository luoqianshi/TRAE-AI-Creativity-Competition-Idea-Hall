<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Copy,
  Monitor,
  Play,
  QrCode,
  RefreshCw,
  Save,
  ShieldCheck,
  Square,
  Wifi
} from 'lucide-vue-next'

const props = defineProps({
  workspace: {
    type: Object,
    default: () => ({})
  }
})

const localConfigPath = ref('')
const localBusy = ref(false)
const cloudBusy = ref(false)
const serviceBusy = ref(false)
const logsBusy = ref(false)
const devices = ref([])
const serviceStatus = ref(null)
const serviceLogs = ref(null)
const localStatus = reactive({
  kind: 'idle',
  text: '等待读取本机配置'
})
const cloudStatus = reactive({
  kind: 'idle',
  text: '等待测试云端连接'
})
const serviceActionStatus = reactive({
  kind: 'idle',
  text: 'Cloud / daemon 尚未由桌面端托管'
})

const localForm = reactive({
  cloudUrl: '',
  token: '',
  deviceId: '',
  deviceName: ''
})

const cloudForm = reactive({
  apiBaseUrl: '',
  token: '',
  publicBaseUrl: '',
  mode: 'auto',
  approvalMode: 'manual',
  allowShell: false,
  allowWrite: true,
  allowNetwork: false,
  model: 'default',
  eventHistoryLimit: 500,
  tlsEnabled: false,
  tlsKeyPath: '',
  tlsCertPath: ''
})

const serviceForm = reactive({
  autoStart: false,
  restartOnCrash: true
})

const effectiveApiBaseUrl = computed(() => {
  return cloudForm.apiBaseUrl || deriveApiBaseUrl(localForm.cloudUrl)
})
const hasRemoteConfigApi = computed(() => Boolean(window.api?.remoteConfig))
const hasRemoteServiceApi = computed(() => Boolean(window.api?.remoteService))
const connectionInfo = computed(() => serviceStatus.value?.connectionInfo || {})
const cloudLayer = computed(() => serviceStatus.value?.connection?.cloud || {})
const daemonLayer = computed(() => serviceStatus.value?.connection?.daemon || {})
const agentLayer = computed(() => serviceStatus.value?.connection?.agent || {})
const loginItem = computed(() => serviceStatus.value?.config?.loginItem || null)
const loginItemText = computed(() => {
  if (!loginItem.value) {
    return '系统启动项状态待刷新'
  }

  if (loginItem.value.error) {
    return loginItem.value.error
  }

  return loginItem.value.openAtLogin ? '系统登录后会自动启动' : '系统登录项未启用'
})
const remoteConnectionSummary = computed(() => {
  if (serviceStatus.value?.ok) {
    return '远程链路已就绪'
  }

  if (cloudLayer.value.ok && daemonLayer.value.ok) {
    return '电脑在线，Agent 待检查'
  }

  if (cloudLayer.value.ok) {
    return 'Cloud 在线，等待 daemon'
  }

  return effectiveApiBaseUrl.value ? '已填写，待连接' : '未配置'
})

onMounted(async () => {
  await loadLocalConfig()
  await refreshServiceStatus()
  await refreshServiceLogs()
})

async function loadLocalConfig() {
  if (!hasRemoteConfigApi.value) {
    applyDesktopApiFallback()
    return
  }

  localBusy.value = true
  setStatus(localStatus, 'loading', '正在读取本机配置')

  try {
    const result = await window.api?.remoteConfig?.getLocal?.(props.workspace)

    if (!result?.ok) {
      throw new Error(result?.error?.message || '读取本机配置失败')
    }

    localConfigPath.value = result.configPath || ''
    applyLocalConfig(result.config)
    setStatus(localStatus, 'success', result.exists ? '已加载本机配置' : '已创建默认配置草稿')
  } catch (error) {
    setStatus(localStatus, 'error', error?.message || '读取本机配置失败')
  } finally {
    localBusy.value = false
  }
}

async function saveLocalConfig() {
  if (!hasRemoteConfigApi.value) {
    setStatus(localStatus, 'error', '需要在 Xoder 桌面端保存')
    return
  }

  localBusy.value = true
  setStatus(localStatus, 'loading', '正在保存本机配置')

  try {
    const result = await window.api?.remoteConfig?.saveLocal?.(buildLocalConfig())

    if (!result?.ok) {
      throw new Error(result?.error?.message || '保存本机配置失败')
    }

    localConfigPath.value = result.configPath || localConfigPath.value
    applyLocalConfig(result.config)
    setStatus(localStatus, 'success', '本机配置已保存')
    await refreshServiceStatus()
  } catch (error) {
    setStatus(localStatus, 'error', error?.message || '保存本机配置失败')
  } finally {
    localBusy.value = false
  }
}

async function refreshServiceStatus() {
  if (!hasRemoteServiceApi.value) {
    return
  }

  try {
    const result = await window.api?.remoteService?.getStatus?.()
    serviceStatus.value = result
    devices.value = result?.connection?.daemon?.selectedDevice
      ? [result.connection.daemon.selectedDevice]
      : devices.value
    serviceForm.autoStart = Boolean(result?.config?.autoStart)
    serviceForm.restartOnCrash = result?.config?.restartOnCrash !== false
    setStatus(
      serviceActionStatus,
      result?.ok ? 'success' : 'idle',
      result?.ok ? 'Cloud / daemon / Agent 都已就绪' : buildServiceIssueText(result)
    )
  } catch (error) {
    setStatus(serviceActionStatus, 'error', error?.message || '读取服务状态失败')
  }
}

async function refreshServiceLogs() {
  if (!hasRemoteServiceApi.value) {
    return
  }

  logsBusy.value = true

  try {
    const result = await window.api?.remoteService?.getLogs?.()

    if (!result?.ok) {
      throw new Error(result?.error?.message || '读取服务日志失败')
    }

    serviceLogs.value = result
  } catch (error) {
    setStatus(serviceActionStatus, 'error', error?.message || '读取服务日志失败')
  } finally {
    logsBusy.value = false
  }
}

async function copyDiagnostics() {
  if (!hasRemoteServiceApi.value) {
    setStatus(serviceActionStatus, 'error', '当前环境没有 remoteService API')
    return
  }

  logsBusy.value = true

  try {
    const result = await window.api?.remoteService?.copyDiagnostics?.()

    if (!result?.ok) {
      throw new Error(result?.error?.message || '复制诊断信息失败')
    }

    setStatus(serviceActionStatus, 'success', '完整诊断信息已复制')
  } catch (error) {
    setStatus(serviceActionStatus, 'error', error?.message || '复制诊断信息失败')
  } finally {
    logsBusy.value = false
  }
}

async function exportDiagnostics() {
  if (!hasRemoteServiceApi.value) {
    setStatus(serviceActionStatus, 'error', '当前环境没有 remoteService API')
    return
  }

  logsBusy.value = true

  try {
    const result = await window.api?.remoteService?.exportDiagnostics?.()

    if (!result?.ok) {
      throw new Error(result?.error?.message || '导出诊断信息失败')
    }

    setStatus(serviceActionStatus, 'success', `诊断包已导出：${result.path}`)
  } catch (error) {
    setStatus(serviceActionStatus, 'error', error?.message || '导出诊断信息失败')
  } finally {
    logsBusy.value = false
  }
}

async function runServiceAction(action, label) {
  if (!hasRemoteServiceApi.value) {
    setStatus(serviceActionStatus, 'error', '当前环境没有 remoteService API')
    return
  }

  serviceBusy.value = true
  setStatus(serviceActionStatus, 'loading', `${label}中`)

  try {
    const result = await window.api.remoteService[action]()
    serviceStatus.value = result?.status || result
    setStatus(serviceActionStatus, result?.ok === false ? 'error' : 'success', `${label}完成`)
    await refreshServiceStatus()
    await refreshServiceLogs()
  } catch (error) {
    setStatus(serviceActionStatus, 'error', error?.message || `${label}失败`)
  } finally {
    serviceBusy.value = false
  }
}

async function toggleAutoStart() {
  if (!hasRemoteServiceApi.value) {
    setStatus(serviceActionStatus, 'error', '当前环境没有 remoteService API')
    return
  }

  serviceBusy.value = true
  const nextValue = !serviceForm.autoStart
  setStatus(serviceActionStatus, 'loading', nextValue ? '正在开启开机自启动' : '正在关闭开机自启动')

  try {
    const result = await window.api.remoteService.setAutoStart(nextValue)
    serviceStatus.value = result?.status || serviceStatus.value
    serviceForm.autoStart = nextValue
    setStatus(
      serviceActionStatus,
      result?.ok ? 'success' : 'error',
      result?.ok ? '开机自启动设置已更新' : result?.error?.message || '开机自启动设置失败'
    )
    await loadLocalConfig()
  } catch (error) {
    setStatus(serviceActionStatus, 'error', error?.message || '开机自启动设置失败')
  } finally {
    serviceBusy.value = false
  }
}

async function copyConnectionInfo() {
  if (!hasRemoteServiceApi.value) {
    setStatus(serviceActionStatus, 'error', '当前环境没有 remoteService API')
    return
  }

  serviceBusy.value = true

  try {
    const result = await window.api.remoteService.copyConnection()
    serviceStatus.value = result?.status || serviceStatus.value
    setStatus(serviceActionStatus, 'success', '手机连接信息已复制')
  } catch (error) {
    setStatus(serviceActionStatus, 'error', error?.message || '复制连接信息失败')
  } finally {
    serviceBusy.value = false
  }
}

async function testCloudConnection() {
  if (!hasRemoteConfigApi.value) {
    setStatus(cloudStatus, 'error', '需要在 Xoder 桌面端测试')
    return
  }

  cloudBusy.value = true
  setStatus(cloudStatus, 'loading', '正在测试云端连接')

  try {
    const result = await window.api?.remoteConfig?.testCloud?.({
      apiBaseUrl: effectiveApiBaseUrl.value,
      token: cloudForm.token || localForm.token
    })

    devices.value = result?.devices || []

    if (!result?.ok) {
      throw new Error(result?.error?.message || '云端连接失败')
    }

    cloudForm.apiBaseUrl = result.apiBaseUrl || effectiveApiBaseUrl.value
    setStatus(cloudStatus, 'success', '云端连接正常')
    await refreshServiceStatus()
  } catch (error) {
    setStatus(cloudStatus, 'error', error?.message || '云端连接失败')
  } finally {
    cloudBusy.value = false
  }
}

async function loadCloudConfig() {
  if (!hasRemoteConfigApi.value) {
    setStatus(cloudStatus, 'error', '需要在 Xoder 桌面端读取')
    return
  }

  cloudBusy.value = true
  setStatus(cloudStatus, 'loading', '正在读取云端配置')

  try {
    const result = await window.api?.remoteConfig?.getCloud?.({
      apiBaseUrl: effectiveApiBaseUrl.value,
      token: cloudForm.token || localForm.token
    })

    if (!result?.ok) {
      throw new Error(result?.error?.message || '读取云端配置失败')
    }

    applyCloudConfig(result.config)
    setStatus(cloudStatus, 'success', '云端配置已加载')
  } catch (error) {
    setStatus(cloudStatus, 'error', error?.message || '读取云端配置失败')
  } finally {
    cloudBusy.value = false
  }
}

async function saveCloudConfig() {
  if (!hasRemoteConfigApi.value) {
    setStatus(cloudStatus, 'error', '需要在 Xoder 桌面端保存')
    return
  }

  cloudBusy.value = true
  setStatus(cloudStatus, 'loading', '正在保存云端配置')

  try {
    const result = await window.api?.remoteConfig?.saveCloud?.({
      apiBaseUrl: effectiveApiBaseUrl.value,
      token: cloudForm.token || localForm.token,
      patch: buildCloudPatch()
    })

    if (!result?.ok) {
      throw new Error(result?.error?.message || '保存云端配置失败')
    }

    applyCloudConfig(result.config)
    setStatus(cloudStatus, 'success', '云端配置已保存')
    await refreshServiceStatus()
  } catch (error) {
    setStatus(cloudStatus, 'error', error?.message || '保存云端配置失败')
  } finally {
    cloudBusy.value = false
  }
}

function syncCloudFromDaemon() {
  cloudForm.apiBaseUrl = deriveApiBaseUrl(localForm.cloudUrl)
  cloudForm.token = localForm.token
  cloudForm.publicBaseUrl = cloudForm.apiBaseUrl
  setStatus(cloudStatus, 'idle', '已从本机连接信息填充')
}

function applyDesktopApiFallback() {
  localConfigPath.value = 'Xoder 用户数据目录 / remote-daemon.config.json'
  setStatus(localStatus, 'idle', '桌面端可保存本机配置')
  setStatus(cloudStatus, 'idle', '桌面端可测试云端连接')
}

function applyLocalConfig(config = {}) {
  const daemon = config.daemon || {}
  const taskDefaults = config.taskDefaults || {}
  const permissions = taskDefaults.permissions || {}
  const agent = taskDefaults.agent || {}
  const service = config.service || {}
  const tls = config.cloud?.tls || {}

  localForm.cloudUrl = daemon.cloudUrl || ''
  localForm.token = daemon.pairingCode || config.auth?.token || ''
  localForm.deviceId = daemon.deviceId || ''
  localForm.deviceName = daemon.deviceName || ''

  serviceForm.autoStart = Boolean(service.autoStart)
  serviceForm.restartOnCrash = service.restartOnCrash !== false
  cloudForm.token = cloudForm.token || localForm.token
  cloudForm.apiBaseUrl = cloudForm.apiBaseUrl || deriveApiBaseUrl(localForm.cloudUrl)
  cloudForm.publicBaseUrl = cloudForm.publicBaseUrl || cloudForm.apiBaseUrl
  cloudForm.mode = taskDefaults.mode || cloudForm.mode
  cloudForm.approvalMode = permissions.approvalMode || cloudForm.approvalMode
  cloudForm.allowShell = Boolean(permissions.allowShell)
  cloudForm.allowWrite = permissions.allowWrite !== false
  cloudForm.allowNetwork = Boolean(permissions.allowNetwork)
  cloudForm.model = agent.model || cloudForm.model
  cloudForm.tlsEnabled = Boolean(tls.enabled)
  cloudForm.tlsKeyPath = tls.keyPath || ''
  cloudForm.tlsCertPath = tls.certPath || ''
}

function applyCloudConfig(config = {}) {
  const cloud = config.cloud || {}
  const tls = cloud.tls || {}
  const taskDefaults = config.taskDefaults || {}
  const permissions = taskDefaults.permissions || {}
  const agent = taskDefaults.agent || {}

  cloudForm.publicBaseUrl = cloud.publicBaseUrl || cloudForm.publicBaseUrl || effectiveApiBaseUrl.value
  cloudForm.eventHistoryLimit = Number(cloud.eventHistoryLimit || cloudForm.eventHistoryLimit || 500)
  cloudForm.mode = taskDefaults.mode || cloudForm.mode
  cloudForm.approvalMode = permissions.approvalMode || cloudForm.approvalMode
  cloudForm.allowShell = Boolean(permissions.allowShell)
  cloudForm.allowWrite = permissions.allowWrite !== false
  cloudForm.allowNetwork = Boolean(permissions.allowNetwork)
  cloudForm.model = agent.model || cloudForm.model
  cloudForm.tlsEnabled = Boolean(tls.enabled)
  cloudForm.tlsKeyPath = tls.keyPath || ''
  cloudForm.tlsCertPath = tls.certPath || ''
}

function buildLocalConfig() {
  return {
    cloud: {
      publicBaseUrl: cloudForm.publicBaseUrl,
      tls: {
        enabled: cloudForm.tlsEnabled,
        keyPath: cloudForm.tlsKeyPath,
        certPath: cloudForm.tlsCertPath
      }
    },
    auth: {
      token: localForm.token
    },
    taskDefaults: {
      mode: cloudForm.mode,
      permissions: {
        approvalMode: cloudForm.approvalMode,
        allowShell: cloudForm.allowShell,
        allowWrite: cloudForm.allowWrite,
        allowNetwork: cloudForm.allowNetwork
      },
      agent: {
        provider: 'claude-code',
        model: cloudForm.model || 'default'
      }
    },
    daemon: {
      cloudUrl: localForm.cloudUrl,
      pairingCode: localForm.token,
      deviceId: localForm.deviceId,
      deviceName: localForm.deviceName,
      workspaceMode: 'dynamic',
      workspace: {
        id: '',
        name: '',
        path: ''
      }
    },
    service: {
      autoStart: serviceForm.autoStart,
      startCloudOnAppLaunch: serviceForm.autoStart,
      startDaemonOnAppLaunch: serviceForm.autoStart,
      restartOnCrash: serviceForm.restartOnCrash
    }
  }
}

function buildCloudPatch() {
  const patch = {
    cloud: {
      publicBaseUrl: cloudForm.publicBaseUrl,
      eventHistoryLimit: Number(cloudForm.eventHistoryLimit || 500),
      tls: {
        enabled: cloudForm.tlsEnabled,
        keyPath: cloudForm.tlsKeyPath,
        certPath: cloudForm.tlsCertPath
      }
    },
    taskDefaults: {
      mode: cloudForm.mode,
      permissions: {
        approvalMode: cloudForm.approvalMode,
        allowShell: cloudForm.allowShell,
        allowWrite: cloudForm.allowWrite,
        allowNetwork: cloudForm.allowNetwork
      },
      agent: {
        provider: 'claude-code',
        model: cloudForm.model || 'default'
      }
    }
  }
  const token = cloudForm.token || localForm.token

  if (token) {
    patch.auth = {
      token
    }
  }

  return patch
}

function toggleCloudPermission(key) {
  cloudForm[key] = !cloudForm[key]
}

function setStatus(target, kind, text) {
  target.kind = kind
  target.text = text
}

function serviceState(name) {
  return serviceStatus.value?.services?.[name] || {}
}

function serviceStatusText(name) {
  const status = serviceState(name)

  if (status.running) {
    return `运行中 PID ${status.pid || '--'}`
  }

  if (status.status === 'crashed') {
    return `已崩溃，重启 ${status.restartCount || 0} 次`
  }

  return status.status || '未启动'
}

function serviceLogText(name, stream) {
  const log = serviceLogs.value?.services?.[name]?.[stream]

  if (!log?.exists) {
    return '暂无日志'
  }

  return log.text || '日志文件为空'
}

function serviceLogMeta(name, stream) {
  const log = serviceLogs.value?.services?.[name]?.[stream]

  if (!log?.exists) {
    return '未生成'
  }

  return log.truncated ? '显示末尾内容' : `${log.size || 0} bytes`
}

function buildServiceIssueText(status) {
  if (!status) {
    return '等待读取服务状态'
  }

  if (!status.connection?.cloud?.ok) {
    return `Cloud 未连接：${status.connection?.cloud?.error || '未启动'}`
  }

  if (!status.connection?.daemon?.ok) {
    return `电脑 daemon 未在线：${status.connection?.daemon?.error || '等待连接'}`
  }

  if (!status.connection?.agent?.ok) {
    return `Agent 未就绪：${status.connection?.agent?.error || '能力未知'}`
  }

  return '远程链路可用'
}

function deriveApiBaseUrl(cloudUrl = '') {
  const value = String(cloudUrl || '').trim()

  if (!value) {
    return ''
  }

  try {
    const url = new URL(value)

    if (url.pathname.endsWith('/ws/daemon')) {
      url.pathname = url.pathname.slice(0, -'/ws/daemon'.length) || '/'
    }

    if (url.protocol === 'ws:') {
      url.protocol = 'http:'
    }

    if (url.protocol === 'wss:') {
      url.protocol = 'https:'
    }

    url.search = ''
    url.hash = ''

    return url.toString().replace(/\/$/, '')
  } catch {
    return value.replace(/\/ws\/daemon$/, '').replace(/^wss:/, 'https:').replace(/^ws:/, 'http:')
  }
}
</script>

<template>
  <section class="settings-page remote-config-page">
    <div class="settings-page-head">
      <div>
        <h1>远程连接</h1>
        <p>管理 Cloud Relay、本机 daemon、手机连接地址和默认权限策略。</p>
      </div>
      <span class="settings-status-pill">{{ remoteConnectionSummary }}</span>
    </div>

    <section class="settings-section remote-config-overview">
      <div class="remote-config-metric">
        <Cloud :size="18" />
        <div>
          <strong>Cloud</strong>
          <span>{{ cloudLayer.ok ? '已连接' : cloudLayer.error || '未连接' }}</span>
        </div>
      </div>
      <div class="remote-config-metric">
        <Monitor :size="18" />
        <div>
          <strong>电脑 daemon</strong>
          <span>{{ daemonLayer.ok ? daemonLayer.selectedDevice?.name || '在线' : '未在线' }}</span>
        </div>
      </div>
      <div class="remote-config-metric">
        <ShieldCheck :size="18" />
        <div>
          <strong>Agent</strong>
          <span>{{ agentLayer.ok ? agentLayer.provider || '可用' : agentLayer.error || '未就绪' }}</span>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-section-title-row">
        <h2>一键运行</h2>
        <div class="agent-config-actions is-inline">
          <button class="settings-small-button" type="button" :disabled="serviceBusy" @click="refreshServiceStatus">
            <RefreshCw :size="13" />
            刷新
          </button>
          <button class="settings-primary-button" type="button" :disabled="serviceBusy" @click="runServiceAction('startAll', '启动全部')">
            <Play :size="13" />
            启动全部
          </button>
          <button class="settings-small-button" type="button" :disabled="serviceBusy" @click="runServiceAction('stopAll', '停止全部')">
            <Square :size="13" />
            停止全部
          </button>
        </div>
      </div>

      <div class="settings-card remote-config-card">
        <div class="remote-config-form">
          <div class="remote-config-metric">
            <Cloud :size="18" />
            <div>
              <strong>Cloud Relay</strong>
              <span>{{ serviceStatusText('cloud') }}</span>
            </div>
          </div>
          <div class="remote-config-metric">
            <Monitor :size="18" />
            <div>
              <strong>Local daemon</strong>
              <span>{{ serviceStatusText('daemon') }}</span>
            </div>
          </div>
          <button class="settings-small-button" type="button" :disabled="serviceBusy" @click="runServiceAction('startCloud', '启动 Cloud')">
            <Play :size="13" />
            启动 Cloud
          </button>
          <button class="settings-small-button" type="button" :disabled="serviceBusy" @click="runServiceAction('startDaemon', '启动 daemon')">
            <Play :size="13" />
            启动 daemon
          </button>
          <button class="settings-switch" type="button" :class="{ 'is-on': serviceForm.autoStart }" :disabled="serviceBusy" @click="toggleAutoStart">
            <span />
          </button>
        </div>
        <div class="settings-row remote-config-path-row">
          <div>
            <strong>开机自启动</strong>
            <p>开启后，Xoder 启动时会自动拉起 Cloud 和 daemon，并在崩溃后自动重启。</p>
            <p>{{ loginItemText }}</p>
          </div>
          <span class="settings-status-pill" :class="`is-${serviceActionStatus.kind}`">{{ serviceActionStatus.text }}</span>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-section-title-row">
        <h2>手机连接</h2>
        <div class="agent-config-actions is-inline">
          <button class="settings-small-button" type="button" :disabled="serviceBusy" @click="copyConnectionInfo">
            <Copy :size="13" />
            复制连接信息
          </button>
        </div>
      </div>

      <div class="settings-card remote-config-card">
        <div class="remote-config-form">
          <label class="settings-field">
            <span>手机 Base URL</span>
            <input :value="connectionInfo.mobileBaseUrl || effectiveApiBaseUrl || '--'" readonly />
          </label>
          <label class="settings-field">
            <span>Token</span>
            <input :value="connectionInfo.token || localForm.token || '--'" readonly />
          </label>
          <label class="settings-field">
            <span>Daemon WebSocket</span>
            <input :value="connectionInfo.daemonWebSocket || localForm.cloudUrl || '--'" readonly />
          </label>
          <label class="settings-field">
            <span>二维码内容</span>
            <textarea :value="connectionInfo.qrPayload || '--'" readonly rows="3" />
          </label>
          <div class="remote-config-qr" v-html="connectionInfo.qrSvg || ''" />
          <div v-if="connectionInfo.lanBaseUrls?.length > 1" class="remote-config-note">
            <strong>局域网候选地址</strong>
            <p>{{ connectionInfo.lanBaseUrls.join(' | ') }}</p>
          </div>
        </div>
        <div class="remote-config-note">
          <QrCode :size="18" />
          <div>
            <strong>二维码连接</strong>
            <p>手机端后续扫码后可直接读取 Base URL 和 Token；当前也可以一键复制连接信息手动填入。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-section-title-row">
        <div>
          <h2>日志和诊断</h2>
          <p class="settings-section-caption">排查手机未连接、Cloud 启动失败和 daemon 断线时，先看这里。</p>
        </div>
        <div class="agent-config-actions is-inline">
          <button class="settings-small-button" type="button" :disabled="logsBusy" @click="refreshServiceLogs">
            <RefreshCw :size="13" />
            刷新日志
          </button>
          <button class="settings-small-button" type="button" :disabled="logsBusy" @click="exportDiagnostics">
            <Save :size="13" />
            Export package
          </button>
          <button class="settings-small-button" type="button" :disabled="logsBusy" @click="copyDiagnostics">
            <Copy :size="13" />
            复制诊断
          </button>
        </div>
      </div>

      <div class="settings-card remote-config-card remote-logs-card">
        <div class="remote-config-path-row settings-row">
          <div>
            <strong>日志目录</strong>
            <p>{{ serviceLogs?.logsDir || '桌面端服务日志目录待读取' }}</p>
          </div>
          <span class="settings-status-pill" :class="`is-${logsBusy ? 'loading' : 'idle'}`">
            {{ logsBusy ? '读取中' : '仅显示最近日志' }}
          </span>
        </div>

        <div class="remote-logs-grid">
          <article v-for="entry in [{ name: 'cloud', label: 'Cloud stdout', stream: 'stdout' }, { name: 'cloud', label: 'Cloud stderr', stream: 'stderr' }, { name: 'daemon', label: 'daemon stdout', stream: 'stdout' }, { name: 'daemon', label: 'daemon stderr', stream: 'stderr' }]" :key="`${entry.name}-${entry.stream}`" class="remote-log-panel">
            <div class="remote-log-panel-head">
              <strong>{{ entry.label }}</strong>
              <span>{{ serviceLogMeta(entry.name, entry.stream) }}</span>
            </div>
            <pre>{{ serviceLogText(entry.name, entry.stream) }}</pre>
            <p class="remote-log-path">{{ serviceLogs?.services?.[entry.name]?.[entry.stream]?.path || '--' }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-section-title-row">
        <h2>本机 daemon 配置</h2>
        <div class="agent-config-actions is-inline">
          <button class="settings-small-button" type="button" :disabled="localBusy" @click="loadLocalConfig">
            <RefreshCw :size="13" />
            读取
          </button>
          <button class="settings-primary-button" type="button" :disabled="localBusy" @click="saveLocalConfig">
            <Save :size="13" />
            保存本机
          </button>
        </div>
      </div>

      <div class="settings-card remote-config-card">
        <div class="remote-config-form">
          <label class="settings-field">
            <span>Daemon WebSocket</span>
            <input v-model.trim="localForm.cloudUrl" placeholder="ws://127.0.0.1:8787/ws/daemon" />
          </label>
          <label class="settings-field">
            <span>连接 Token</span>
            <input v-model.trim="localForm.token" type="password" placeholder="启动时可自动生成" />
          </label>
          <label class="settings-field">
            <span>设备名称</span>
            <input v-model.trim="localForm.deviceName" placeholder="我的 Windows 电脑" />
          </label>
          <label class="settings-field">
            <span>设备 ID</span>
            <input v-model.trim="localForm.deviceId" placeholder="device_win_admin" />
          </label>
          <div class="remote-config-note">
            <strong>工作区不在这里固定</strong>
            <p>手机端会浏览本机磁盘，选择目录后创建 Xoder 窗口；后续任务使用该窗口 workspace。</p>
          </div>
        </div>
        <div class="settings-row remote-config-path-row">
          <div>
            <strong>配置文件</strong>
            <p>{{ localConfigPath || '--' }}</p>
          </div>
          <span class="settings-status-pill" :class="`is-${localStatus.kind}`">{{ localStatus.text }}</span>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-section-title-row">
        <h2>云端 Remote Core</h2>
        <div class="agent-config-actions is-inline">
          <button class="settings-small-button" type="button" @click="syncCloudFromDaemon">
            <Wifi :size="13" />
            填充
          </button>
          <button class="settings-small-button" type="button" :disabled="cloudBusy" @click="testCloudConnection">
            <RefreshCw :size="13" />
            测试
          </button>
          <button class="settings-small-button" type="button" :disabled="cloudBusy" @click="loadCloudConfig">
            读取云端
          </button>
          <button class="settings-primary-button" type="button" :disabled="cloudBusy" @click="saveCloudConfig">
            <Save :size="13" />
            保存云端
          </button>
        </div>
      </div>

      <div class="settings-card remote-config-card">
        <div class="remote-config-form">
          <label class="settings-field">
            <span>HTTP API</span>
            <input v-model.trim="cloudForm.apiBaseUrl" placeholder="http://127.0.0.1:8787" />
          </label>
          <label class="settings-field">
            <span>云端 Token</span>
            <input v-model.trim="cloudForm.token" type="password" placeholder="x-xoder-token" />
          </label>
          <label class="settings-field">
            <span>公开地址</span>
            <input v-model.trim="cloudForm.publicBaseUrl" placeholder="http://192.168.x.x:8787" />
          </label>
          <div class="settings-row remote-config-tls-row">
            <div>
              <strong>HTTPS / WSS</strong>
              <p>Enable TLS only when both certificate files are configured.</p>
            </div>
            <button
              class="settings-switch"
              type="button"
              :class="{ 'is-on': cloudForm.tlsEnabled }"
              @click="cloudForm.tlsEnabled = !cloudForm.tlsEnabled">
              <span />
            </button>
          </div>
          <label v-if="cloudForm.tlsEnabled" class="settings-field">
            <span>TLS key path</span>
            <input v-model.trim="cloudForm.tlsKeyPath" placeholder="F:\\certs\\server.key" />
          </label>
          <label v-if="cloudForm.tlsEnabled" class="settings-field">
            <span>TLS certificate path</span>
            <input v-model.trim="cloudForm.tlsCertPath" placeholder="F:\\certs\\server.crt" />
          </label>
          <label class="settings-field">
            <span>事件保留</span>
            <input v-model.number="cloudForm.eventHistoryLimit" min="50" step="50" type="number" />
          </label>
        </div>
        <div class="remote-config-status-line" :class="`is-${cloudStatus.kind}`">
          <CheckCircle2 v-if="cloudStatus.kind === 'success'" :size="15" />
          <AlertCircle v-else :size="15" />
          <span>{{ cloudStatus.text }}</span>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2>默认任务策略</h2>
      <div class="settings-card">
        <div class="settings-row">
          <div>
            <strong>运行模式</strong>
            <p>下一次远程任务默认使用该模式。</p>
          </div>
          <label class="settings-select">
            <select v-model="cloudForm.mode">
              <option value="auto">Auto</option>
              <option value="plan">Plan</option>
              <option value="fast">Fast</option>
            </select>
          </label>
        </div>
        <div class="settings-row">
          <div>
            <strong>权限审批</strong>
            <p>{{ cloudForm.approvalMode === 'auto' ? '交给 AI 在本地策略内自动审批' : '敏感操作回到你这里确认' }}</p>
          </div>
          <label class="settings-select">
            <select v-model="cloudForm.approvalMode">
              <option value="manual">人工确认</option>
              <option value="auto">自动审批</option>
            </select>
          </label>
        </div>
        <div class="settings-row">
          <div>
            <strong>Shell 命令</strong>
            <p>控制远程任务默认是否允许命令执行。</p>
          </div>
          <button class="settings-switch" type="button" :class="{ 'is-on': cloudForm.allowShell }" @click="toggleCloudPermission('allowShell')">
            <span />
          </button>
        </div>
        <div class="settings-row">
          <div>
            <strong>文件写入</strong>
            <p>控制远程任务默认是否允许写入工作区文件。</p>
          </div>
          <button class="settings-switch" type="button" :class="{ 'is-on': cloudForm.allowWrite }" @click="toggleCloudPermission('allowWrite')">
            <span />
          </button>
        </div>
        <div class="settings-row">
          <div>
            <strong>网络访问</strong>
            <p>控制远程任务默认是否允许访问外部网络。</p>
          </div>
          <button class="settings-switch" type="button" :class="{ 'is-on': cloudForm.allowNetwork }" @click="toggleCloudPermission('allowNetwork')">
            <span />
          </button>
        </div>
        <div class="settings-row">
          <div>
            <strong>模型</strong>
            <p>写入云端 Remote Core 的默认 agent.model。</p>
          </div>
          <label class="settings-field is-inline-input">
            <input v-model.trim="cloudForm.model" placeholder="default" />
          </label>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2>在线设备</h2>
      <div class="settings-card workspace-overview-list-card">
        <div v-if="devices.length" class="workspace-overview-list">
          <article v-for="device in devices" :key="device.id" class="workspace-overview-item">
            <div class="workspace-overview-item-head">
              <strong>{{ device.name || device.id }}</strong>
              <span>{{ device.online ? 'online' : 'offline' }}</span>
            </div>
            <p>{{ device.workspaceMode === 'dynamic' ? '手机端选择目录' : device.workspace?.path || '--' }}</p>
            <div class="desktop-node-task-meta">
              <span>{{ device.id }}</span>
              <span>{{ device.platform || '--' }}</span>
            </div>
          </article>
        </div>
        <div v-else class="remote-config-empty">
          <Cloud :size="22" />
          <span>暂无设备数据</span>
        </div>
      </div>
    </section>
  </section>
</template>
