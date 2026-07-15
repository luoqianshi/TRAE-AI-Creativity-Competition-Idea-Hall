import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, parse, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import os from 'node:os'

const require = createRequire(import.meta.url)
const WebSocket = require('ws')

import { AgentRuntimeManager } from '../main/agent-runtime/index.js'
import { DigitalEmployeeManager } from '../main/digital-employee/index.js'
import {
  REMOTE_MESSAGE_TYPES,
  isRecord,
  normalizeWorkspace,
  parseCliArgs,
  parseRemoteMessage,
  sendRemoteError,
  sendRemoteMessage
} from './protocol.js'
import { RemoteConfigStore, buildDaemonRuntimeOptions } from './remote-config.js'

export class RemoteLocalDaemon {
  constructor(options = {}) {
    this.cloudUrl = String(options.cloudUrl || options.cloud || '').trim()
    this.pairingCode = String(options.pairingCode || options.code || '').trim()
    this.deviceToken = String(options.deviceToken || '').trim()
    this.configStore = options.configStore || null
    this.device = normalizeDevice(options)
    this.manager = options.manager || new AgentRuntimeManager(options.runtime || {})
    this.digitalEmployeeManager =
      options.digitalEmployeeManager ||
      new DigitalEmployeeManager({
        agentRuntimeManager: this.manager,
        jobRoot:
          options.digitalEmployeeJobRoot ||
          process.env.XODER_DIGITAL_EMPLOYEE_JOB_ROOT ||
          undefined
      })
    this.WebSocketImpl = options.WebSocketImpl || WebSocket
    this.reconnectDelays = options.reconnectDelays || [1000, 2000, 5000, 10000]
    this.reconnectAttempt = 0
    this.stopped = false
    this.ws = null
    this.taskToSession = new Map()
    this.sessionToTask = new Map()
    this.taskToDigitalJob = new Map()
    this.digitalJobToTask = new Map()
    this.pendingTaskEvents = []
    this.executionLocked = Boolean(options.executionLocked)
    this.executionLockReason = String(options.executionLockReason || '').trim()

    this.manager.on('event', (event) => {
      this.forwardRuntimeEvent(event)
    })

    this.digitalEmployeeManager.on('event', (event) => {
      this.forwardDigitalEmployeeEvent(event)
    })
  }

  start() {
    if (!this.cloudUrl) {
      throw new Error('Cloud WebSocket URL is required.')
    }

    this.stopped = false
    this.connect()
  }

  stop() {
    this.stopped = true
    this.ws?.close?.()
    this.digitalEmployeeManager.stopAll?.()
    this.manager.stopAll?.()
  }

  connect() {
    if (this.stopped) {
      return
    }

    const ws = new this.WebSocketImpl(this.cloudUrl)
    this.ws = ws

    ws.on('open', () => {
      this.reconnectAttempt = 0
      this.sendHello()
      this.flushPendingTaskEvents()
    })

    ws.on('message', (data) => {
      this.handleSocketMessage(data)
    })

    ws.on('close', () => {
      if (this.ws === ws) {
        this.ws = null
      }

      this.scheduleReconnect()
    })

    ws.on('error', () => {})
  }

  sendHello() {
    sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
      pairingCode: this.pairingCode,
      deviceToken: this.deviceToken,
      device: this.device,
      capabilities: {
        ...(this.manager.listCapabilities?.() || {}),
        digitalEmployee: true,
        globalMemory: true,
        remoteCore: {
          digitalEmployee: true,
          fileBrowser: true,
          globalMemory: true
        },
        executionLocked: this.executionLocked
      }
    })
  }

  handleSocketMessage(data) {
    const parsed = parseRemoteMessage(data)

    if (!parsed.ok) {
      sendRemoteError(this.ws, parsed.error.error.code, parsed.error.error.message)
      return
    }

    const { type, payload } = parsed.message

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_TASK_START) {
      this.startTask(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVER) {
      this.recoverTask(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_TASK_STOP) {
      this.stopTask(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_TASK_PAUSE) {
      this.pauseTask(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_TASK_RESUME) {
      this.resumeTask(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_PERMISSION_RESPONSE) {
      this.respondToPermission(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_EXECUTION_LOCK) {
      this.setExecutionLock(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_DEVICE_TOKEN) {
      this.setDeviceToken(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_FS_LIST) {
      this.listFiles(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_GET) {
      this.readGlobalMemory(payload)
      return
    }

    if (type === REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_SET) {
      this.writeGlobalMemory(payload)
    }
  }

  startTask(payload = {}) {
    const taskId = String(payload.taskId || '').trim()
    const request = isRecord(payload.request) ? payload.request : {}

    if (this.executionLocked) {
      this.emitTaskFailure(
        taskId,
        '',
        'EXECUTION_LOCKED',
        this.executionLockReason || 'Remote execution is locked.'
      )
      return
    }

    try {
      if (isDigitalEmployeeRuntimeRequest(request)) {
        const job = this.digitalEmployeeManager.startJob(
          {
            ...request,
            jobId: taskId,
            goal: request.prompt || request.goal,
            teamMode: 'staged_team',
            approvalPolicy: request.permissions?.approvalMode || request.approvalPolicy || 'auto'
          },
          {
            remoteTaskId: taskId
          }
        )
        this.taskToDigitalJob.set(taskId, job.id)
        this.digitalJobToTask.set(job.id, taskId)
        sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED, {
          taskId,
          sessionId: job.id
        })
        return
      }

      const session = this.manager.startSession(request)
      this.taskToSession.set(taskId, session.id)
      this.sessionToTask.set(session.id, taskId)
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED, {
        taskId,
        sessionId: session.id
      })
    } catch (error) {
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.TASK_EVENT, {
        taskId,
        sessionId: '',
        event: {
          id: `event_${Date.now()}`,
          sessionId: '',
          type: 'session.failed',
          timestamp: Date.now(),
          payload: {
            code: error?.code || 'RUNTIME_ERROR',
            message: error?.message || 'Failed to start local runtime session.'
          }
        }
      })
    }
  }

  recoverTask(payload = {}) {
    const taskId = String(payload.taskId || '').trim()
    const request = isRecord(payload.request) ? payload.request : {}

    if (!taskId || !request.prompt) {
      return
    }

    const existingDigitalJobId = String(this.taskToDigitalJob.get(taskId) || '').trim()

    if (existingDigitalJobId) {
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED, {
        taskId,
        sessionId: existingDigitalJobId
      })
      return
    }

    const existingSessionId = String(this.taskToSession.get(taskId) || '').trim()

    if (existingSessionId) {
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED, {
        taskId,
        sessionId: existingSessionId
      })
      return
    }

    if (isDigitalEmployeeRuntimeRequest(request)) {
      const job = this.digitalEmployeeManager.startJob({
        ...request,
        jobId: taskId,
        goal: request.prompt || request.goal,
        teamMode: 'staged_team',
        approvalPolicy: request.permissions?.approvalMode || request.approvalPolicy || 'auto',
        resume: true,
        resumeFromSessionId: payload.sessionId || ''
      }, { remoteTaskId: taskId })
      this.taskToDigitalJob.set(taskId, job.id)
      this.digitalJobToTask.set(job.id, taskId)
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED, {
        taskId,
        sessionId: job.id
      })
      return
    }

    const session = this.manager.startSession({
      ...request,
      prompt: `${request.prompt}\n\nContinue from the previous interrupted run. Inspect the current workspace and preserve existing work.`
    })
    this.taskToSession.set(taskId, session.id)
    this.sessionToTask.set(session.id, taskId)
    sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED, {
      taskId,
      sessionId: session.id
    })
  }

  stopTask(payload = {}) {
    const taskId = String(payload.taskId || '').trim()
    const digitalJobId = String(this.taskToDigitalJob.get(taskId) || '').trim()

    if (digitalJobId) {
      this.digitalEmployeeManager.stopJob(digitalJobId)
      return
    }

    const sessionId = String(payload.sessionId || this.taskToSession.get(taskId) || '').trim()

    if (sessionId) {
      this.manager.stopSession(sessionId)
    }
  }

  pauseTask(payload = {}) {
    const taskId = String(payload.taskId || '').trim()
    const digitalJobId = String(this.taskToDigitalJob.get(taskId) || '').trim()

    if (digitalJobId) {
      this.digitalEmployeeManager.pauseJob?.(digitalJobId)
      return
    }

    sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.TASK_EVENT, {
      taskId,
      sessionId: String(payload.sessionId || this.taskToSession.get(taskId) || ''),
      event: {
        id: `event_${Date.now()}`,
        sessionId: String(payload.sessionId || this.taskToSession.get(taskId) || ''),
        type: 'session.paused',
        timestamp: Date.now(),
        payload: { message: 'Only digital employee tasks support pause/resume.' }
      }
    })
  }

  resumeTask(payload = {}) {
    const taskId = String(payload.taskId || '').trim()
    const digitalJobId = String(this.taskToDigitalJob.get(taskId) || '').trim()

    if (digitalJobId) {
      this.digitalEmployeeManager.resumeJob?.(digitalJobId)
      return
    }

    sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.TASK_EVENT, {
      taskId,
      sessionId: String(payload.sessionId || this.taskToSession.get(taskId) || ''),
      event: {
        id: `event_${Date.now()}`,
        sessionId: String(payload.sessionId || this.taskToSession.get(taskId) || ''),
        type: 'session.resumed',
        timestamp: Date.now(),
        payload: { message: 'Only digital employee tasks support pause/resume.' }
      }
    })
  }

  respondToPermission(payload = {}) {
    const taskId = String(payload.taskId || '').trim()
    const requestId = String(payload.requestId || '').trim()
    const digitalJobId = String(this.taskToDigitalJob.get(taskId) || '').trim()

    if (digitalJobId && requestId) {
      this.digitalEmployeeManager.respondToQuestion(digitalJobId, requestId, payload.response || {})
      return
    }

    const sessionId = String(payload.sessionId || this.taskToSession.get(taskId) || '').trim()

    if (sessionId && requestId) {
      this.manager.respondToPermission(sessionId, requestId, payload.response || {})
    }
  }

  setExecutionLock(payload = {}) {
    this.executionLocked = Boolean(payload.locked)
    this.executionLockReason = String(payload.reason || '').trim()

    if (this.executionLocked && payload.stopActive !== false) {
      this.digitalEmployeeManager.stopAll?.()
      this.manager.stopAll?.()
    }

    for (const taskId of this.taskToSession.keys()) {
      const sessionId = this.taskToSession.get(taskId) || ''
      this.queueOrSendTaskMessage({
        taskId,
        sessionId,
        event: {
          id: `event_${Date.now()}`,
          sessionId,
          type: this.executionLocked ? 'runtime.locked' : 'runtime.unlocked',
          timestamp: Date.now(),
          payload: {
            reason: this.executionLockReason || 'Remote execution lock changed.',
            locked: this.executionLocked
          }
        }
      })
    }
 }

  setDeviceToken(payload = {}) {
    const nextToken = String(payload.deviceToken || '').trim()

    if (!nextToken && !payload.clear) {
      return
    }

    this.deviceToken = nextToken
    const update = this.configStore?.update?.({ daemon: { deviceToken: nextToken } })
    update?.catch?.(() => {})
  }

  emitTaskFailure(taskId, sessionId, code, message) {
    this.queueOrSendTaskMessage({
      taskId,
      sessionId,
      event: {
        id: `event_${Date.now()}`,
        sessionId,
        type: 'session.failed',
        timestamp: Date.now(),
        payload: { code, message }
      }
    })
  }

  async listFiles(payload = {}) {
    const requestId = String(payload.requestId || '').trim()

    if (!requestId) {
      return
    }

    try {
      const result = await listFileSystemEntries(payload.path)
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_FS_RESULT, {
        requestId,
        ...result
      })
    } catch (error) {
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_FS_RESULT, {
        requestId,
        path: String(payload.path || ''),
        error: {
          code: error?.code || 'FS_LIST_FAILED',
          message: error?.message || 'Failed to list local files.'
        }
      })
    }
  }

  async readGlobalMemory(payload = {}) {
    const requestId = String(payload.requestId || '').trim()

    if (!requestId) {
      return
    }

    try {
      const result = await readClaudeGlobalMemory()
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_RESULT, {
        requestId,
        ...result
      })
    } catch (error) {
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_RESULT, {
        requestId,
        error: {
          code: error?.code || 'GLOBAL_MEMORY_READ_FAILED',
          message: error?.message || 'Failed to read Claude global memory.'
        }
      })
    }
  }

  async writeGlobalMemory(payload = {}) {
    const requestId = String(payload.requestId || '').trim()

    if (!requestId) {
      return
    }

    try {
      const result = await writeClaudeGlobalMemory(String(payload.content || ''))
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_RESULT, {
        requestId,
        ...result
      })
    } catch (error) {
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_RESULT, {
        requestId,
        error: {
          code: error?.code || 'GLOBAL_MEMORY_WRITE_FAILED',
          message: error?.message || 'Failed to write Claude global memory.'
        }
      })
    }
  }

  forwardRuntimeEvent(event = {}) {
    const taskId = this.sessionToTask.get(event.sessionId)

    if (!taskId) {
      return
    }

    this.queueOrSendTaskMessage({
      taskId,
      sessionId: event.sessionId,
      event
    })
  }

  queueOrSendTaskMessage(payload) {
    if (!this.ws || this.ws.readyState !== 1) {
      this.pendingTaskEvents = this.pendingTaskEvents || []
      this.pendingTaskEvents.push(payload)
      if (this.pendingTaskEvents.length > 500) {
        this.pendingTaskEvents.splice(0, this.pendingTaskEvents.length - 500)
      }
      return false
    }

    sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.TASK_EVENT, payload)
    return true
  }

  flushPendingTaskEvents() {
    const events = this.pendingTaskEvents || []
    this.pendingTaskEvents = []
    for (const payload of events) {
      sendRemoteMessage(this.ws, REMOTE_MESSAGE_TYPES.TASK_EVENT, payload)
    }
  }

  forwardDigitalEmployeeEvent(event = {}) {
    const taskId = this.digitalJobToTask.get(event.jobId)

    if (!taskId) {
      return
    }

    this.queueOrSendTaskMessage({
      taskId,
      sessionId: event.sessionId || event.jobId || '',
      event
    })
  }

  scheduleReconnect() {
    if (this.stopped) {
      return
    }

    const delay =
      this.reconnectDelays[Math.min(this.reconnectAttempt, this.reconnectDelays.length - 1)] || 10000
    this.reconnectAttempt += 1

    setTimeout(() => {
      this.connect()
    }, delay).unref?.()
  }
}

function isDigitalEmployeeRuntimeRequest(request = {}) {
  const options = isRecord(request.options) ? request.options : {}

  return (
    options.executionMode === 'digital_employee' ||
    options.expertMode === 'xoder_digital_team' ||
    options.expertMode === 'digital_team' ||
    request.executionMode === 'digital_employee'
  )
}

export function normalizeDevice(options = {}) {
  const workspacePath = String(options.workspace || options.workspacePath || '').trim()
  const workspaceMode = normalizeWorkspaceMode(options.workspaceMode, workspacePath)
  const resolvedWorkspace = workspacePath ? resolve(workspacePath) : ''
  const deviceName = String(options.device || options.name || os.hostname() || 'Local computer').trim()
  const deviceId = String(options.deviceId || deriveDeviceId(deviceName)).trim()

  return {
    id: deviceId,
    name: deviceName,
    platform: os.platform(),
    workspaceMode,
    workspace:
      workspaceMode === 'default'
        ? normalizeWorkspace({
            id: String(options.workspaceId || '').trim(),
            name: String(options.workspaceName || basename(resolvedWorkspace)).trim(),
            path: resolvedWorkspace
          })
        : {
            id: '',
            name: '按任务动态指定',
            path: ''
          }
  }
}

export async function listFileSystemEntries(targetPath = '') {
  const rawPath = String(targetPath || '').trim()

  if (process.platform === 'win32' && !rawPath) {
    return {
      path: '',
      parentPath: '',
      entries: await listWindowsDrives()
    }
  }

  const resolvedPath = normalizeListPath(rawPath)
  const targetStats = await stat(resolvedPath)

  if (!targetStats.isDirectory()) {
    const error = new Error('Target path is not a directory.')
    error.code = 'NOT_DIRECTORY'
    throw error
  }

  const entries = await readdir(resolvedPath, { withFileTypes: true })
  const listed = await Promise.all(
    entries.slice(0, 500).map(async (entry) => {
      const entryPath = resolve(resolvedPath, entry.name)
      let entryStats = null

      try {
        entryStats = await stat(entryPath)
      } catch {
        // Keep unreadable entries visible; the mobile side can decide how to present them.
      }

      const isDirectory = entry.isDirectory()

      return {
        name: entry.name,
        path: entryPath,
        kind: isDirectory ? 'directory' : 'file',
        isDirectory,
        extension: isDirectory ? '' : extname(entry.name),
        size: entryStats?.size || 0,
        modifiedAt: entryStats?.mtimeMs || 0
      }
    })
  )

  listed.sort((left, right) => {
    if (left.isDirectory !== right.isDirectory) {
      return left.isDirectory ? -1 : 1
    }

    return left.name.localeCompare(right.name, 'zh-CN')
  })

  const parsedPath = parse(resolvedPath)

  return {
    path: resolvedPath,
    parentPath: resolvedPath === parsedPath.root ? '' : dirname(resolvedPath),
    entries: listed
  }
}

export function getClaudeGlobalMemoryPath(env = process.env) {
  const configDir = String(env.CLAUDE_CONFIG_DIR || '').trim()
  return join(configDir || join(os.homedir(), '.claude'), 'CLAUDE.md')
}

export async function readClaudeGlobalMemory() {
  const memoryPath = getClaudeGlobalMemoryPath()

  try {
    const [content, stats] = await Promise.all([readFile(memoryPath, 'utf8'), stat(memoryPath)])

    return {
      path: memoryPath,
      content,
      exists: true,
      size: stats.size,
      modifiedAt: stats.mtimeMs
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        path: memoryPath,
        content: '',
        exists: false,
        size: 0,
        modifiedAt: 0
      }
    }

    throw error
  }
}

export async function writeClaudeGlobalMemory(content = '') {
  const memoryPath = getClaudeGlobalMemoryPath()
  await mkdir(dirname(memoryPath), { recursive: true })
  await writeFile(memoryPath, String(content), 'utf8')
  const stats = await stat(memoryPath)

  return {
    path: memoryPath,
    content: String(content),
    exists: true,
    size: stats.size,
    modifiedAt: stats.mtimeMs,
    savedAt: Date.now()
  }
}

function deriveDeviceId(name = '') {
  const normalized = String(name || os.hostname() || 'local')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized ? `device_${normalized}` : 'device_local'
}

async function listWindowsDrives() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const entries = []

  await Promise.all(
    letters.map(async (letter) => {
      const drivePath = `${letter}:\\`

      try {
        const driveStats = await stat(drivePath)

        if (driveStats.isDirectory()) {
          entries.push({
            name: drivePath,
            path: drivePath,
            kind: 'drive',
            isDirectory: true,
            extension: '',
            size: 0,
            modifiedAt: driveStats.mtimeMs || 0
          })
        }
      } catch {
        // Drive does not exist or is not currently available.
      }
    })
  )

  entries.sort((left, right) => left.path.localeCompare(right.path))
  return entries
}

function normalizeListPath(targetPath = '') {
  const rawPath = String(targetPath || '').trim()

  if (process.platform === 'win32' && /^[a-z]:$/i.test(rawPath)) {
    return `${rawPath}\\`
  }

  return resolve(rawPath || (process.platform === 'win32' ? os.homedir() : '/'))
}

function normalizeWorkspaceMode(value, workspacePath = '') {
  const mode = String(value || '').trim()

  if (mode === 'default' || mode === 'dynamic') {
    return mode
  }

  return workspacePath ? 'default' : 'dynamic'
}

async function main() {
  const args = parseCliArgs()
  const configStore = new RemoteConfigStore({ configPath: args.config })
  await configStore.load()
  const daemonOptions = buildDaemonRuntimeOptions(args, configStore.get())
  daemonOptions.configStore = configStore
  const daemon = new RemoteLocalDaemon(daemonOptions)

  daemon.start()
  console.log(`xoder local daemon connected to ${daemon.cloudUrl}; config ${configStore.configPath}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
