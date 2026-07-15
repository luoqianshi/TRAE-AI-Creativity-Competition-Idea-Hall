import { randomUUID } from 'node:crypto'

export const REMOTE_CORE_SERVICE = 'xoder-remote-core'
export const DEFAULT_REMOTE_PORT = 8787
export const DEFAULT_EVENT_HISTORY_LIMIT = 500

export const REMOTE_MESSAGE_TYPES = Object.freeze({
  DAEMON_HELLO: 'daemon.hello',
  DAEMON_READY: 'daemon.ready',
  DAEMON_TASK_START: 'daemon.task.start',
  DAEMON_TASK_STARTED: 'daemon.task.started',
  DAEMON_TASK_RECOVER: 'daemon.task.recover',
  DAEMON_TASK_RECOVERED: 'daemon.task.recovered',
  DAEMON_TASK_PAUSE: 'daemon.task.pause',
  DAEMON_TASK_RESUME: 'daemon.task.resume',
  DAEMON_TASK_STOP: 'daemon.task.stop',
  DAEMON_PERMISSION_RESPONSE: 'daemon.permission.response',
  DAEMON_FS_LIST: 'daemon.fs.list',
  DAEMON_FS_RESULT: 'daemon.fs.result',
  DAEMON_GLOBAL_MEMORY_GET: 'daemon.global-memory.get',
  DAEMON_GLOBAL_MEMORY_SET: 'daemon.global-memory.set',
  DAEMON_GLOBAL_MEMORY_RESULT: 'daemon.global-memory.result',
  DAEMON_EXECUTION_LOCK: 'daemon.execution.lock',
  DAEMON_DEVICE_TOKEN: 'daemon.device-token',
  TASK_EVENT: 'task.event',
  EVENTS_SUBSCRIBE: 'events.subscribe',
  EVENTS_SNAPSHOT: 'events.snapshot',
  DEVICES_UPDATED: 'devices.updated',
  CONFIG_UPDATED: 'config.updated',
  ERROR: 'error'
})

export const REMOTE_ERROR_CODES = Object.freeze({
  UNAUTHORIZED: 'UNAUTHORIZED',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  DEVICE_OFFLINE: 'DEVICE_OFFLINE',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  SESSION_NOT_READY: 'SESSION_NOT_READY',
  BAD_REQUEST: 'BAD_REQUEST',
  DAEMON_NOT_CONNECTED: 'DAEMON_NOT_CONNECTED',
  DEVICE_LOCKED: 'DEVICE_LOCKED',
  REMOTE_CONTROL_DISABLED: 'REMOTE_CONTROL_DISABLED',
  RUNTIME_ERROR: 'RUNTIME_ERROR'
})

export function createRemoteMessage(type, payload = {}, options = {}) {
  return {
    id: options.id || `msg_${randomUUID()}`,
    type: String(type || ''),
    timestamp: options.timestamp || Date.now(),
    payload: isRecord(payload) || Array.isArray(payload) ? payload : {}
  }
}

export function parseRemoteMessage(data) {
  let parsed

  try {
    parsed = JSON.parse(Buffer.isBuffer(data) ? data.toString('utf8') : String(data || ''))
  } catch {
    return {
      ok: false,
      error: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Invalid JSON message.')
    }
  }

  if (!isRecord(parsed) || !String(parsed.type || '').trim()) {
    return {
      ok: false,
      error: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Message type is required.')
    }
  }

  return {
    ok: true,
    message: {
      id: String(parsed.id || `msg_${randomUUID()}`),
      type: String(parsed.type),
      timestamp: Number(parsed.timestamp || Date.now()),
      payload: isRecord(parsed.payload) || Array.isArray(parsed.payload) ? parsed.payload : {}
    }
  }
}

export function createRemoteError(code, message, details = {}) {
  return {
    error: {
      code: String(code || REMOTE_ERROR_CODES.BAD_REQUEST),
      message: String(message || 'Bad request.'),
      ...(Object.keys(details).length ? { details } : {})
    }
  }
}

export function sendRemoteMessage(ws, type, payload = {}, options = {}) {
  if (!ws || ws.readyState !== 1) {
    return false
  }

  ws.send(JSON.stringify(createRemoteMessage(type, payload, options)))
  return true
}

export function sendRemoteError(ws, code, message, details = {}) {
  return sendRemoteMessage(ws, REMOTE_MESSAGE_TYPES.ERROR, createRemoteError(code, message, details))
}

export function normalizeWorkspace(input = {}, fallback = {}) {
  const workspace = isRecord(input) ? input : {}
  const fallbackWorkspace = isRecord(fallback) ? fallback : {}
  const path = String(workspace.path || fallbackWorkspace.path || '').trim()
  const name = String(workspace.name || fallbackWorkspace.name || deriveWorkspaceName(path)).trim()

  return {
    id: String(workspace.id || fallbackWorkspace.id || deriveWorkspaceId(name, path)).trim(),
    name,
    path
  }
}

export function buildRuntimeRequestFromTask(task = {}, device = {}) {
  const workspace = normalizeWorkspace(task.workspace, device.workspace)

  return {
    questId: String(task.taskId || task.questId || '').trim(),
    prompt: String(task.prompt || '').trim(),
    workspace,
    mode: String(task.mode || 'auto').trim(),
    permissions: isRecord(task.permissions) ? task.permissions : {},
    options: isRecord(task.options) ? task.options : {},
    agent: isRecord(task.agent) ? task.agent : { provider: 'claude-code', model: 'default' }
  }
}

export function sanitizeForRemote(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

export function parseCliArgs(argv = process.argv.slice(2)) {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const item = String(argv[index] || '')

    if (!item.startsWith('--')) {
      continue
    }

    const [rawKey, inlineValue] = item.slice(2).split(/=(.*)/s)
    const key = rawKey.trim()

    if (!key) {
      continue
    }

    if (inlineValue !== undefined) {
      args[key] = inlineValue
      continue
    }

    const next = argv[index + 1]

    if (next !== undefined && !String(next).startsWith('--')) {
      args[key] = String(next)
      index += 1
    } else {
      args[key] = true
    }
  }

  return args
}

export function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function deriveWorkspaceName(workspacePath = '') {
  const normalized = String(workspacePath || '').replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  return parts.at(-1) || 'workspace'
}

function deriveWorkspaceId(name = '', workspacePath = '') {
  const seed = String(name || workspacePath || 'workspace')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return seed ? `workspace_${seed}` : 'workspace_default'
}
