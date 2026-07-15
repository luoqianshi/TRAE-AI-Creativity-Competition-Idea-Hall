import { spawn } from 'node:child_process'
import { createWriteStream, existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import { delimiter, dirname, join, resolve } from 'node:path'

import { DEFAULT_REMOTE_PORT } from '../remote-control/protocol.js'
import { normalizeRemoteConfig } from '../remote-control/remote-config.js'
import { createQrSvg } from './qr-code.js'

const SERVICE_NAMES = new Set(['cloud', 'daemon'])

export class RemoteServiceController {
  constructor(options = {}) {
    this.projectRoot = resolve(options.projectRoot || process.cwd())
    this.configPath = options.configPath || ''
    this.logsDir = options.logsDir || this.projectRoot
    this.spawnImpl = options.spawnImpl || spawn
    this.fetchImpl = options.fetchImpl || globalThis.fetch
    this.restartDelayMs = options.restartDelayMs || 1500
    this.getLoginItemSettings = options.getLoginItemSettings || null
    this.restartTimers = new Map()
    this.services = {
      cloud: createServiceState('cloud'),
      daemon: createServiceState('daemon')
    }
  }

  setConfigPath(configPath) {
    this.configPath = configPath || this.configPath
  }

  async startCloud(options = {}) {
    const result = await this.startService('cloud', 'src/remote-control/cloud-server.js', options)

    if (!result.ok || result.alreadyRunning || options.waitForReady === false || !options.config) {
      return result
    }

    return {
      ...result,
      ready: await this.waitForCloud(options.config, options.readyTimeoutMs)
    }
  }

  async startDaemon(options = {}) {
    const result = await this.startService('daemon', 'src/remote-control/local-daemon.js', options)

    if (!result.ok || result.alreadyRunning || options.waitForReady === false || !options.config) {
      return result
    }

    return {
      ...result,
      ready: await this.waitForDaemon(options.config, options.readyTimeoutMs)
    }
  }

  async startAll(options = {}) {
    const cloud = await this.startCloud(options)
    const daemon = await this.startDaemon(options)
    return {
      ok: cloud.ok && daemon.ok,
      cloud,
      daemon,
      status: await this.getStatus(options.config)
    }
  }

  async stopCloud() {
    return this.stopService('cloud')
  }

  async stopDaemon() {
    return this.stopService('daemon')
  }

  async stopAll() {
    const daemon = await this.stopDaemon()
    const cloud = await this.stopCloud()
    return {
      ok: cloud.ok && daemon.ok,
      cloud,
      daemon,
      status: await this.getStatus()
    }
  }

  async getLogs(options = {}) {
    const tailBytes = Number(options.tailBytes || 16 * 1024)

    return {
      ok: true,
      logsDir: this.logsDir,
      services: {
        cloud: await this.readServiceLogs('cloud', tailBytes),
        daemon: await this.readServiceLogs('daemon', tailBytes)
      }
    }
  }

  async readServiceLogs(name, tailBytes) {
    assertKnownService(name)
    const state = this.services[name]
    const logPath = state.logPath || join(this.logsDir, `.xoder-remote-${name}.log`)
    const errorLogPath = state.errorLogPath || join(this.logsDir, `.xoder-remote-${name}.err.log`)
    const [stdout, stderr] = await Promise.all([
      readTail(logPath, tailBytes),
      readTail(errorLogPath, tailBytes)
    ])

    return {
      status: serializeServiceState(state),
      logPath,
      errorLogPath,
      stdout,
      stderr
    }
  }

  async buildDiagnostics(configInput = null) {
    const [status, logs] = await Promise.all([this.getStatus(configInput), this.getLogs()])

    return {
      ok: true,
      generatedAt: Date.now(),
      status,
      logs,
      text: formatDiagnostics(status, logs)
    }
  }

  async exportDiagnostics(configInput = null) {
    const diagnostics = await this.buildDiagnostics(configInput)
    await mkdir(this.logsDir, { recursive: true })
    const filePath = join(this.logsDir, `xoder-diagnostics-${Date.now()}.json`)
    await writeFile(filePath, `${JSON.stringify(diagnostics, null, 2)}\n`, 'utf8')

    return {
      ok: true,
      path: filePath,
      diagnostics
    }
  }

  async startService(name, relativeScript, options = {}) {
    assertKnownService(name)
    const state = this.services[name]

    if (isProcessAlive(state.process)) {
      state.status = 'running'
      return {
        ok: true,
        service: name,
        alreadyRunning: true,
        status: serializeServiceState(state)
      }
    }

    const scriptPath = resolve(this.projectRoot, relativeScript)

    if (!existsSync(scriptPath)) {
      state.status = 'failed'
      state.lastError = `Runtime entry not found: ${scriptPath}`
      return {
        ok: false,
        service: name,
        error: {
          code: 'RUNTIME_NOT_FOUND',
          message: state.lastError
        },
        status: serializeServiceState(state)
      }
    }

    await mkdir(this.logsDir, { recursive: true })

    const nodeRuntime = getNodeRuntime()
    const configPath = options.configPath || this.configPath
    const args = [scriptPath]

    if (configPath) {
      args.push('--config', configPath)
    }

    const outPath = join(this.logsDir, `.xoder-remote-${name}.log`)
    const errPath = join(this.logsDir, `.xoder-remote-${name}.err.log`)
    const out = createWriteStream(outPath, { flags: 'a' })
    const err = createWriteStream(errPath, { flags: 'a' })
    clearRestartTimer(this.restartTimers, name)
    state.status = 'starting'
    state.managed = true
    state.startedAt = Date.now()
    state.stoppedByUser = false
    state.lastError = ''
    state.logPath = outPath
    state.errorLogPath = errPath
    state.restartOnCrash = options.restartOnCrash !== false

    let child

    try {
      child = this.spawnImpl(nodeRuntime.command, args, {
        cwd: this.projectRoot,
        env: {
          ...process.env,
          ...nodeRuntime.env,
          NODE_PATH: buildNodePath(this.projectRoot),
          XODER_DIGITAL_EMPLOYEE_JOB_ROOT: join(dirname(this.logsDir), 'digital-employee-jobs')
        },
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      })
    } catch (error) {
      out.end()
      err.end()
      state.process = null
      state.pid = 0
      state.status = 'failed'
      state.lastError = error?.message || 'Failed to start service.'
      state.crashCount += 1
      this.scheduleRestart(name, relativeScript, options)

      return {
        ok: false,
        service: name,
        error: {
          code: error?.code || 'SPAWN_ERROR',
          message: state.lastError
        },
        status: serializeServiceState(state)
      }
    }

    state.process = child
    state.pid = child.pid || 0

    child.stdout?.pipe?.(out)
    child.stderr?.pipe?.(err)

    child.once('spawn', () => {
      state.status = 'running'
    })

    child.once('error', (error) => {
      if (state.process === child) {
        state.process = null
        state.pid = 0
      }

      state.status = 'failed'
      state.lastError = error?.message || 'Failed to start service.'
      state.crashCount += 1
      this.scheduleRestart(name, relativeScript, options)
    })

    child.once('exit', (code, signal) => {
      out.end()
      err.end()

      if (state.process === child) {
        state.process = null
      }

      state.pid = 0
      state.lastExit = {
        code,
        signal,
        at: Date.now()
      }

      if (state.stoppedByUser) {
        state.status = 'stopped'
        return
      }

      state.status = 'crashed'
      state.crashCount += 1
      this.scheduleRestart(name, relativeScript, options)
    })

    return {
      ok: true,
      service: name,
      status: serializeServiceState(state)
    }
  }

  async waitForCloud(configInput = {}, timeoutMs = 4000) {
    const deadline = Date.now() + normalizeReadyTimeout(timeoutMs)
    const apiBaseUrl = getApiBaseUrl(configInput)
    let probe = await this.probeCloud(apiBaseUrl)

    while (!probe.ok && Date.now() < deadline) {
      await delay(100)
      probe = await this.probeCloud(apiBaseUrl)
    }

    return probe
  }

  async waitForDaemon(configInput = {}, timeoutMs = 5000) {
    const deadline = Date.now() + normalizeReadyTimeout(timeoutMs)
    const config = normalizeRemoteConfig(configInput)
    const apiBaseUrl = getApiBaseUrl(config)
    let probe = await this.probeDevices(apiBaseUrl, config.auth.token)

    while (!hasOnlineDevice(probe.devices, config.daemon.deviceId) && Date.now() < deadline) {
      await delay(100)
      probe = await this.probeDevices(apiBaseUrl, config.auth.token)
    }

    return {
      ok: hasOnlineDevice(probe.devices, config.daemon.deviceId),
      url: apiBaseUrl,
      ...probe
    }
  }

  scheduleRestart(name, relativeScript, options = {}) {
    const state = this.services[name]

    if (!state || state.stoppedByUser || !state.restartOnCrash || this.restartTimers.has(name)) {
      return
    }

    state.restartCount += 1
    const timer = setTimeout(async () => {
      this.restartTimers.delete(name)

      if (state.stoppedByUser || !state.restartOnCrash || isProcessAlive(state.process)) {
        return
      }

      try {
        await this.startService(name, relativeScript, options)
      } catch (error) {
        state.status = 'failed'
        state.lastError = error?.message || 'Failed to restart service.'
        this.scheduleRestart(name, relativeScript, options)
      }
    }, this.restartDelayMs)

    timer.unref?.()
    this.restartTimers.set(name, timer)
  }

  async stopService(name) {
    assertKnownService(name)
    const state = this.services[name]

    clearRestartTimer(this.restartTimers, name)
    state.stoppedByUser = true
    state.restartOnCrash = false

    if (!isProcessAlive(state.process)) {
      state.process = null
      state.pid = 0
      state.status = 'stopped'
      return {
        ok: true,
        service: name,
        alreadyStopped: true,
        status: serializeServiceState(state)
      }
    }

    const child = state.process
    child.kill()

    await waitForExit(child, 2500)

    if (isProcessAlive(child)) {
      child.kill('SIGKILL')
      await waitForExit(child, 1000)
    }

    state.process = null
    state.pid = 0
    state.status = 'stopped'

    return {
      ok: true,
      service: name,
      status: serializeServiceState(state)
    }
  }

  async getStatus(configInput = null) {
    const config = normalizeRemoteConfig(configInput || (await this.readConfig()))
    const apiBaseUrl = getApiBaseUrl(config)
    const token = config.auth.token
    const cloudProbe = await this.probeCloud(apiBaseUrl)
    const devicesProbe = cloudProbe.ok ? await this.probeDevices(apiBaseUrl, token) : emptyDevicesProbe()
    const selectedDeviceId = config.daemon.deviceId || devicesProbe.devices.find((device) => device.online)?.id || ''
    const selectedDevice =
      devicesProbe.devices.find((device) => device.id === selectedDeviceId) ||
      devicesProbe.devices.find((device) => device.online) ||
      null
    const agentProbe = getAgentProbe(selectedDevice)

    return {
      ok: cloudProbe.ok && Boolean(selectedDevice?.online) && agentProbe.ok,
      services: {
        cloud: serializeServiceState(this.services.cloud),
        daemon: serializeServiceState(this.services.daemon)
      },
      connection: {
        cloud: cloudProbe,
        daemon: {
          ok: Boolean(selectedDevice?.online),
          selectedDeviceId,
          selectedDevice,
          deviceCount: devicesProbe.devices.length,
          onlineDeviceCount: devicesProbe.devices.filter((device) => device.online).length,
          error: devicesProbe.error
        },
        agent: agentProbe
      },
      config: {
        configPath: this.configPath,
        tokenConfigured: Boolean(token),
        deviceId: config.daemon.deviceId,
        deviceName: config.daemon.deviceName,
        workspaceMode: config.daemon.workspaceMode,
        restartOnCrash: config.service.restartOnCrash,
        autoStart: config.service.autoStart,
        startCloudOnAppLaunch: config.service.startCloudOnAppLaunch,
        startDaemonOnAppLaunch: config.service.startDaemonOnAppLaunch,
        loginItem: this.getLoginItemStatus()
      },
      connectionInfo: buildConnectionInfo(config, apiBaseUrl)
    }
  }

  getLoginItemStatus() {
    if (!this.getLoginItemSettings) {
      return null
    }

    try {
      return this.getLoginItemSettings({ args: ['--xoder-start-remote'] })
    } catch (error) {
      return {
        openAtLogin: false,
        error: error?.message || 'Failed to read login item settings.'
      }
    }
  }

  async readConfig() {
    if (!this.configPath || !existsSync(this.configPath)) {
      return {}
    }

    const raw = await readFile(this.configPath, 'utf8')
    return raw.trim() ? JSON.parse(raw) : {}
  }

  async probeCloud(apiBaseUrl) {
    if (!this.fetchImpl || !apiBaseUrl) {
      return {
        ok: false,
        url: apiBaseUrl,
        error: 'Remote Core URL is empty.'
      }
    }

    try {
      const response = await fetchJson(this.fetchImpl, `${apiBaseUrl}/health`, {}, 2500)
      return {
        ok: response.status >= 200 && response.status < 300 && response.body?.ok !== false,
        url: apiBaseUrl,
        service: response.body?.service || '',
        timestamp: response.body?.timestamp || 0,
        status: response.status,
        error: response.status >= 400 ? response.body?.error?.message || 'Cloud health check failed.' : ''
      }
    } catch (error) {
      return {
        ok: false,
        url: apiBaseUrl,
        error: error?.message || 'Cloud health check failed.'
      }
    }
  }

  async probeDevices(apiBaseUrl, token) {
    try {
      const response = await fetchJson(
        this.fetchImpl,
        `${apiBaseUrl}/api/devices`,
        {
          headers: token ? { 'x-xoder-token': token } : {}
        },
        3000
      )

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        devices: Array.isArray(response.body?.devices) ? response.body.devices : [],
        error: response.status >= 400 ? response.body?.error?.message || 'Failed to query devices.' : ''
      }
    } catch (error) {
      return {
        ok: false,
        status: 0,
        devices: [],
        error: error?.message || 'Failed to query devices.'
      }
    }
  }
}

export function buildConnectionInfo(configInput = {}, apiBaseUrl = '') {
  const config = normalizeRemoteConfig(configInput)
  const port = config.cloud.port || DEFAULT_REMOTE_PORT
  const baseUrl = apiBaseUrl || getApiBaseUrl(config)
  const secure = Boolean(config.cloud.tls?.enabled)
  const lanBaseUrls = getLanBaseUrls(port, secure)
  const primaryMobileBaseUrl = config.cloud.publicBaseUrl || lanBaseUrls[0] || baseUrl
  const token = config.auth.token || config.daemon.pairingCode || ''
  const payload = {
    baseUrl: primaryMobileBaseUrl,
    token
  }

  return {
    apiBaseUrl: baseUrl,
    daemonWebSocket:
      config.daemon.cloudUrl || `${secure ? 'wss' : 'ws'}://127.0.0.1:${port}/ws/daemon`,
    mobileBaseUrl: primaryMobileBaseUrl,
    lanBaseUrls,
    token,
    tokenPreview: maskSecret(token),
    copyText: `Base URL: ${primaryMobileBaseUrl}\nToken: ${token}`,
    qrPayload: JSON.stringify(payload),
    qrSvg: createConnectionQrSvg(JSON.stringify(payload))
  }
}

export function createConnectionQrSvg(payload = '') {
  return createQrSvg(payload, {
    ariaLabel: 'Xoder mobile connection QR',
    moduleSize: 5,
    quietZone: 4
  })
}

function createServiceState(name) {
  return {
    name,
    managed: false,
    process: null,
    pid: 0,
    status: 'stopped',
    startedAt: 0,
    stoppedByUser: false,
    restartOnCrash: true,
    restartCount: 0,
    crashCount: 0,
    lastExit: null,
    lastError: '',
    logPath: '',
    errorLogPath: ''
  }
}

function serializeServiceState(state) {
  return {
    name: state.name,
    managed: state.managed,
    pid: state.pid,
    running: isProcessAlive(state.process),
    status: isProcessAlive(state.process) ? 'running' : state.status,
    startedAt: state.startedAt,
    restartOnCrash: state.restartOnCrash,
    restartCount: state.restartCount,
    crashCount: state.crashCount,
    lastExit: state.lastExit,
    lastError: state.lastError,
    logPath: state.logPath,
    errorLogPath: state.errorLogPath
  }
}

function assertKnownService(name) {
  if (!SERVICE_NAMES.has(name)) {
    throw new Error(`Unknown remote service: ${name}`)
  }
}

function isProcessAlive(child) {
  return Boolean(child && !child.killed && child.exitCode === null && child.signalCode === null)
}

function clearRestartTimer(timers, name) {
  const timer = timers.get(name)

  if (timer) {
    clearTimeout(timer)
    timers.delete(name)
  }
}

function normalizeReadyTimeout(value, fallback = 4000) {
  const timeout = Number(value)
  return Number.isFinite(timeout) && timeout >= 0 ? Math.min(Math.floor(timeout), 30000) : fallback
}

function delay(timeoutMs) {
  return new Promise((resolve) => setTimeout(resolve, timeoutMs))
}

function hasOnlineDevice(devices = [], selectedDeviceId = '') {
  const onlineDevices = Array.isArray(devices) ? devices.filter((device) => device?.online) : []

  if (!selectedDeviceId) {
    return onlineDevices.length > 0
  }

  return onlineDevices.some((device) => device.id === selectedDeviceId)
}

function waitForExit(child, timeoutMs) {
  return new Promise((resolve) => {
    if (!isProcessAlive(child)) {
      resolve()
      return
    }

    const timer = setTimeout(resolve, timeoutMs)
    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

function getNodeRuntime() {
  if (process.versions?.electron) {
    return {
      command: process.execPath,
      env: {
        ELECTRON_RUN_AS_NODE: '1'
      }
    }
  }

  return {
    command: process.execPath,
    env: {}
  }
}

function buildNodePath(projectRoot) {
  const entries = [
    process.env.NODE_PATH,
    process.resourcesPath ? join(process.resourcesPath, 'app.asar', 'node_modules') : '',
    process.resourcesPath ? join(process.resourcesPath, 'app.asar.unpacked', 'node_modules') : '',
    join(projectRoot, 'node_modules')
  ].filter(Boolean)

  return [...new Set(entries)].join(delimiter)
}

function getApiBaseUrl(configInput = {}) {
  const config = normalizeRemoteConfig(configInput)
  const publicBaseUrl = String(config.cloud.publicBaseUrl || '').trim()

  if (publicBaseUrl) {
    return publicBaseUrl.replace(/\/$/, '')
  }

  const host = config.cloud.host && config.cloud.host !== '0.0.0.0' ? config.cloud.host : '127.0.0.1'
  const port = config.cloud.port || DEFAULT_REMOTE_PORT
  return `${config.cloud.tls?.enabled ? 'https' : 'http'}://${host}:${port}`
}

function getLanBaseUrls(port = DEFAULT_REMOTE_PORT, secure = false) {
  const urls = []
  const scheme = secure ? 'https' : 'http'
  const interfaces = os.networkInterfaces()

  for (const [interfaceName, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family !== 'IPv4' || entry.internal || !entry.address) {
        continue
      }

      urls.push({
        url: `${scheme}://${entry.address}:${port}`,
        score: scoreLanInterface(interfaceName, entry.address)
      })
    }
  }

  return [...new Map(
    urls
      .sort((left, right) => right.score - left.score || left.url.localeCompare(right.url))
      .map((item) => [item.url, item])
  ).values()].map((item) => item.url)
}

function scoreLanInterface(interfaceName = '', address = '') {
  const name = String(interfaceName || '').toLowerCase()
  const value = String(address || '')
  let score = 0

  if (/(wi-?fi|wlan|wireless)/i.test(name)) {
    score += 100
  } else if (/ethernet/i.test(name)) {
    score += 80
  }

  if (/(vmware|virtual|hyper-v|vethernet|docker|loopback|vpn|teredo)/i.test(name)) {
    score -= 100
  }

  if (value.includes('192.168.')) {
    score += 30
  } else if (value.startsWith('10.')) {
    score += 20
  } else if (value.match(/^172\.(1[6-9]|2\d|3[0-1])\./)) {
    score += 10
  }

  return score
}

function emptyDevicesProbe() {
  return {
    ok: false,
    status: 0,
    devices: [],
    error: ''
  }
}

function getAgentProbe(device) {
  if (!device?.online) {
    return {
      ok: false,
      provider: '',
      tools: [],
      error: 'No online daemon device.'
    }
  }

  const capabilities = device.capabilities || {}
  const tools = Array.isArray(capabilities.tools) ? capabilities.tools : []
  const provider = String(capabilities.provider || '').trim()

  return {
    ok: Boolean(provider || tools.length || capabilities.remoteCore),
    provider,
    tools,
    modes: capabilities.modes || {},
    error: provider || tools.length || capabilities.remoteCore ? '' : 'Agent runtime capabilities are missing.'
  }
}

async function fetchJson(fetchImpl, url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(url, {
      ...options,
      signal: controller.signal
    })
    const text = await response.text()

    return {
      status: response.status,
      body: text ? JSON.parse(text) : {}
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function readTail(filePath, maxBytes = 16 * 1024) {
  try {
    if (!filePath || !existsSync(filePath)) {
      return {
        exists: false,
        path: filePath || '',
        text: '',
        size: 0,
        truncated: false
      }
    }

    const raw = await readFile(filePath)
    const truncated = raw.length > maxBytes
    const slice = truncated ? raw.subarray(raw.length - maxBytes) : raw

    return {
      exists: true,
      path: filePath,
      text: slice.toString('utf8'),
      size: raw.length,
      truncated
    }
  } catch (error) {
    return {
      exists: false,
      path: filePath || '',
      text: '',
      size: 0,
      truncated: false,
      error: error?.message || 'Failed to read log file.'
    }
  }
}

function formatDiagnostics(status, logs) {
  const cloud = status.connection?.cloud || {}
  const daemon = status.connection?.daemon || {}
  const agent = status.connection?.agent || {}
  const services = status.services || {}

  return [
    '# Xoder Remote Diagnostics',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Config: ${status.config?.configPath || ''}`,
    `Cloud: ${cloud.ok ? 'ok' : 'failed'} ${cloud.url || ''} ${cloud.error || ''}`.trim(),
    `Daemon: ${daemon.ok ? 'ok' : 'failed'} devices=${daemon.deviceCount || 0} online=${daemon.onlineDeviceCount || 0} ${daemon.error || ''}`.trim(),
    `Agent: ${agent.ok ? 'ok' : 'failed'} provider=${agent.provider || ''} ${agent.error || ''}`.trim(),
    `Cloud service: ${services.cloud?.status || 'unknown'} pid=${services.cloud?.pid || 0} restarts=${services.cloud?.restartCount || 0}`,
    `Daemon service: ${services.daemon?.status || 'unknown'} pid=${services.daemon?.pid || 0} restarts=${services.daemon?.restartCount || 0}`,
    `Login item: ${status.config?.loginItem?.openAtLogin ? 'enabled' : 'disabled'} ${status.config?.loginItem?.error || ''}`.trim(),
    '',
    '## Cloud stderr',
    logs.services?.cloud?.stderr?.text || '',
    '',
    '## Cloud stdout',
    logs.services?.cloud?.stdout?.text || '',
    '',
    '## Daemon stderr',
    logs.services?.daemon?.stderr?.text || '',
    '',
    '## Daemon stdout',
    logs.services?.daemon?.stdout?.text || ''
  ].join('\n')
}

function maskSecret(value = '') {
  const secret = String(value || '')

  if (!secret) {
    return ''
  }

  if (secret.length <= 8) {
    return '****'
  }

  return `${secret.slice(0, 4)}...${secret.slice(-4)}`
}
