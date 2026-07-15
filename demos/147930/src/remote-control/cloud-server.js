import { createServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import { randomUUID } from 'node:crypto'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { WebSocketServer } = require('ws')

import {
  DEFAULT_EVENT_HISTORY_LIMIT,
  DEFAULT_REMOTE_PORT,
  REMOTE_CORE_SERVICE,
  REMOTE_ERROR_CODES,
  REMOTE_MESSAGE_TYPES,
  buildRuntimeRequestFromTask,
  createRemoteError,
  isRecord,
  normalizeWorkspace,
  parseCliArgs,
  parseRemoteMessage,
  sanitizeForRemote,
  sendRemoteError,
  sendRemoteMessage
} from './protocol.js'
import {
  RemoteConfigStore,
  applyTaskDefaults,
  buildCloudRuntimeOverrides,
  createMemoryRemoteConfigStore
} from './remote-config.js'

export function createRemoteCoreServer(options = {}) {
  const configStore = options.configStore || createMemoryRemoteConfigStore(options.config || {})
  configStore.applyRuntimeOverrides({
    cloud: {
      eventHistoryLimit: options.eventHistoryLimit
    },
    auth: {
      token: options.pairingCode || options.token
    }
  })
  const storage = createTaskStorage(options.storage || {}, configStore)
  const state = {
    configStore,
    storage,
    devices: new Map(),
    tasks: new Map(),
    windows: new Map(),
    pendingFsRequests: new Map(),
    pendingGlobalMemoryRequests: new Map(),
    deviceLocks: new Map(),
    deviceTokens: new Map(),
    deviceBindings: new Map(),
    eventClients: new Set()
  }

  loadPersistedTasks(state)
  loadPersistedDeviceRegistry(state)

  const requestHandler = (request, response) => {
    handleHttpRequest(request, response, state)
  }
  const server = createCloudServer(configStore.get(), options.tls, requestHandler)
  const daemonWss = new WebSocketServer({ noServer: true })
  const eventsWss = new WebSocketServer({ noServer: true })

  daemonWss.on('connection', (ws) => {
    setupDaemonSocket(ws, state)
  })

  eventsWss.on('connection', (ws) => {
    setupEventsSocket(ws, state)
  })

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', 'http://localhost')

    if (url.pathname === '/ws/daemon') {
      daemonWss.handleUpgrade(request, socket, head, (ws) => {
        daemonWss.emit('connection', ws, request)
      })
      return
    }

    if (url.pathname === '/ws/events') {
      if (!isRequestAuthorized(request, state, url)) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      eventsWss.handleUpgrade(request, socket, head, (ws) => {
        eventsWss.emit('connection', ws, request)
      })
      return
    }

    socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
    socket.destroy()
  })

  return {
    server,
    daemonWss,
    eventsWss,
    state,
    listen(port = DEFAULT_REMOTE_PORT, host = '0.0.0.0') {
      return new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, host, () => {
          server.off('error', reject)
          resolve(server.address())
        })
      })
    },
    close() {
      for (const device of state.devices.values()) {
        device.ws?.close?.()
      }

      for (const client of state.eventClients) {
        client.ws?.close?.()
      }

      daemonWss.close()
      eventsWss.close()

      return new Promise((resolve) => {
        server.close(() => resolve())
      })
    }
  }
}

async function handleHttpRequest(request, response, state) {
  const url = new URL(request.url || '/', 'http://localhost')

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, {
      ok: true,
      service: REMOTE_CORE_SERVICE,
      timestamp: Date.now()
    })
    return
  }

  if (!url.pathname.startsWith('/api/')) {
    sendJson(response, 404, createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Route not found.'))
    return
  }

  if (!isRequestAuthorized(request, state, url)) {
    sendJson(
      response,
      401,
      createRemoteError(REMOTE_ERROR_CODES.UNAUTHORIZED, 'Invalid Xoder token.')
    )
    return
  }

  try {
    await handleApiRequest(request, response, url, state)
  } catch (error) {
    if (error?.code === REMOTE_ERROR_CODES.BAD_REQUEST) {
      sendJson(
        response,
        400,
        createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, error.message || 'Bad request.')
      )
      return
    }

    sendJson(
      response,
      500,
      createRemoteError(REMOTE_ERROR_CODES.RUNTIME_ERROR, error?.message || 'Remote core error.')
    )
  }
}

async function handleApiRequest(request, response, url, state) {
  if (request.method === 'GET' && url.pathname === '/api/config') {
    sendJson(response, 200, state.configStore.getPublic())
    return
  }

  if (request.method === 'PATCH' && url.pathname === '/api/config') {
    const body = await readJsonBody(request)
    await state.configStore.update(body)
    sendJson(response, 200, state.configStore.getPublic())
    broadcastConfigUpdated(state)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/devices') {
    sendJson(response, 200, {
      devices: Array.from(state.devices.values()).map(serializeDevice)
    })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/diagnostics') {
    sendJson(response, 200, buildRemoteDiagnostics(state))
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/workspaces') {
    sendJson(response, 200, {
      workspaces: getSavedWorkspaces(state)
    })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/workspaces') {
    const body = await readJsonBody(request)
    const result = await saveWorkspace(body, state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  const deviceFilesMatch = url.pathname.match(/^\/api\/devices\/([^/]+)\/files$/)

  const deviceLockMatch = url.pathname.match(/^\/api\/devices\/([^/]+)\/lock$/)

  if (request.method === 'POST' && deviceLockMatch) {
    const body = await readJsonBody(request)
    const result = setDeviceExecutionLock(
      decodeURIComponent(deviceLockMatch[1]),
      body,
      state
    )
    sendJson(response, result.statusCode, result.body)
    return
  }

  const deviceSecurityMatch = url.pathname.match(/^\/api\/devices\/([^/]+)\/(token|bind|unbind)$/)

  if (request.method === 'POST' && deviceSecurityMatch) {
    const deviceId = decodeURIComponent(deviceSecurityMatch[1])
    const action = deviceSecurityMatch[2]
    const body = await readJsonBody(request)
    const result =
      action === 'token'
        ? rotateDeviceToken(deviceId, state)
        : setDeviceBinding(deviceId, action === 'bind', state, body)
    sendJson(response, result.statusCode, result.body)
    return
  }

  if (request.method === 'GET' && deviceFilesMatch) {
    const result = await listDeviceFiles(decodeURIComponent(deviceFilesMatch[1]), url.searchParams.get('path'), state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  if (request.method === 'POST' && deviceFilesMatch) {
    const body = await readJsonBody(request)
    const result = await listDeviceFiles(decodeURIComponent(deviceFilesMatch[1]), body.path, state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  const deviceGlobalMemoryMatch = url.pathname.match(/^\/api\/devices\/([^/]+)\/global-memory$/)

  if (request.method === 'GET' && deviceGlobalMemoryMatch) {
    const result = await getDeviceGlobalMemory(decodeURIComponent(deviceGlobalMemoryMatch[1]), state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  if (request.method === 'PUT' && deviceGlobalMemoryMatch) {
    const body = await readJsonBody(request)
    const result = await setDeviceGlobalMemory(decodeURIComponent(deviceGlobalMemoryMatch[1]), body, state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/windows') {
    sendJson(response, 200, {
      windows: Array.from(state.windows.values()).map(serializeRemoteWindow)
    })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/windows') {
    const body = await readJsonBody(request)
    const result = createRemoteWindow(body, state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/tasks') {
    sendJson(response, 200, listTasks(url, state))
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/tasks') {
    const body = await readJsonBody(request)
    const result = startTask(body, state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  const taskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)$/)

  if (request.method === 'GET' && taskMatch) {
    const task = state.tasks.get(decodeURIComponent(taskMatch[1]))

    if (!task) {
      sendJson(response, 404, createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.'))
      return
    }

    sendJson(response, 200, serializeTask(task))
    return
  }

  const taskSummaryMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/summary$/)

  if (request.method === 'GET' && taskSummaryMatch) {
    const task = state.tasks.get(decodeURIComponent(taskSummaryMatch[1]))

    if (!task) {
      sendJson(response, 404, createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.'))
      return
    }

    sendJson(response, 200, {
      taskId: task.taskId,
      summary: buildTaskSummary(task, { includeReport: true })
    })
    return
  }

  const stopMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/stop$/)

  if (request.method === 'POST' && stopMatch) {
    const result = stopTask(decodeURIComponent(stopMatch[1]), state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  const pauseMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/pause$/)

  if (request.method === 'POST' && pauseMatch) {
    const result = pauseTask(decodeURIComponent(pauseMatch[1]), state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  const resumeMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/resume$/)

  if (request.method === 'POST' && resumeMatch) {
    const result = resumeTask(decodeURIComponent(resumeMatch[1]), state)
    sendJson(response, result.statusCode, result.body)
    return
  }

  const permissionMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/permissions\/([^/]+)$/)

  if (request.method === 'POST' && permissionMatch) {
    const body = await readJsonBody(request)
    const result = respondToPermission(
      decodeURIComponent(permissionMatch[1]),
      decodeURIComponent(permissionMatch[2]),
      body,
      state
    )
    sendJson(response, result.statusCode, result.body)
    return
  }

  const eventsMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/events$/)

  if (request.method === 'GET' && eventsMatch) {
    const task = state.tasks.get(decodeURIComponent(eventsMatch[1]))

    if (!task) {
      sendJson(response, 404, createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.'))
      return
    }

    sendJson(response, 200, {
      taskId: task.taskId,
      events: task.events
    })
    return
  }

  const auditMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/audit$/)

  if (request.method === 'GET' && auditMatch) {
    const task = state.tasks.get(decodeURIComponent(auditMatch[1]))

    if (!task) {
      sendJson(response, 404, createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.'))
      return
    }

    sendJson(response, 200, {
      taskId: task.taskId,
      entries: buildTaskAudit(task)
    })
    return
  }

  sendJson(response, 404, createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Route not found.'))
}

function startTask(body = {}, state) {
  if (!isRecord(body) || !String(body.prompt || '').trim()) {
    return {
      statusCode: 400,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Prompt is required.')
    }
  }

  const windowId = String(body.windowId || '').trim()
  const remoteWindow = windowId ? state.windows.get(windowId) : null
  const workspaceId = String(body.workspaceId || '').trim()
  const savedWorkspace = workspaceId
    ? getSavedWorkspaces(state).find((workspace) => workspace.id === workspaceId)
    : null

  if (windowId && !remoteWindow) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Remote window not found.')
    }
  }

  if (workspaceId && !savedWorkspace) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Saved workspace not found.')
    }
  }

  if (remoteWindow && body.deviceId && String(body.deviceId).trim() !== remoteWindow.deviceId) {
    return {
      statusCode: 400,
      body: createRemoteError(
        REMOTE_ERROR_CODES.BAD_REQUEST,
        'Task deviceId does not match the selected remote window.'
      )
    }
  }

  if (savedWorkspace && body.deviceId && String(body.deviceId).trim() !== savedWorkspace.deviceId) {
    return {
      statusCode: 400,
      body: createRemoteError(
        REMOTE_ERROR_CODES.BAD_REQUEST,
        'Task deviceId does not match the selected saved workspace.'
      )
    }
  }

  const deviceId = String(body.deviceId || remoteWindow?.deviceId || savedWorkspace?.deviceId || '').trim()
  const device = state.devices.get(deviceId)

  if (state.configStore.get().security?.remoteControlEnabled === false) {
    return {
      statusCode: 423,
      body: createRemoteError(
        REMOTE_ERROR_CODES.REMOTE_CONTROL_DISABLED,
        'Remote control is disabled by the local security policy.'
      )
    }
  }

  if (!device) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  if (!device.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  if (device.locked) {
    return {
      statusCode: 423,
      body: createRemoteError(
        REMOTE_ERROR_CODES.DEVICE_LOCKED,
        'Remote execution is locked for this device.'
      )
    }
  }

  const now = Date.now()
  const taskId = String(body.taskId || `task_${randomUUID()}`)
  const taskPayload = applyTaskDefaults(
    {
      ...body,
      workspace: body.workspace || remoteWindow?.workspace || savedWorkspace?.workspace,
      options: {
        ...(isRecord(body.options) ? body.options : {}),
        ...(remoteWindow
          ? {
              windowId: remoteWindow.windowId
            }
          : {}),
        ...(savedWorkspace
          ? {
              workspaceId: savedWorkspace.id
            }
          : {})
      }
    },
    state.configStore.get().taskDefaults
  )
  const request = buildRuntimeRequestFromTask({ ...taskPayload, taskId }, device)

  if (!request.workspace.path) {
    return {
      statusCode: 400,
      body: createRemoteError(
        REMOTE_ERROR_CODES.BAD_REQUEST,
        'Workspace path is required. Browse the device disk and create a remote window, or pass workspace.path with the task.'
      )
    }
  }

  const task = {
    taskId,
    deviceId,
    sessionId: '',
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    windowId: remoteWindow?.windowId || '',
    eventCount: 0,
    request,
    events: []
  }

  state.tasks.set(taskId, task)
  persistTask(state, task)
  sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_START, {
    taskId,
    request
  })

  return {
    statusCode: 200,
    body: {
      taskId,
      status: task.status,
      deviceId,
      createdAt: task.createdAt
    }
  }
}

function stopTask(taskId, state) {
  const task = state.tasks.get(taskId)

  if (!task) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.')
    }
  }

  const device = state.devices.get(task.deviceId)

  if (!device?.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  task.status = 'cancelling'
  task.updatedAt = Date.now()
  persistTask(state, task)
  sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_STOP, {
    taskId,
    sessionId: task.sessionId
  })

  return {
    statusCode: 200,
    body: {
      ok: true,
      taskId,
      status: task.status
    }
  }
}

function pauseTask(taskId, state) {
  const task = state.tasks.get(taskId)

  if (!task) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.')
    }
  }

  const device = state.devices.get(task.deviceId)

  if (!device?.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  if (!task.sessionId) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.SESSION_NOT_READY, 'Task session is not ready.')
    }
  }

  task.status = 'pausing'
  task.updatedAt = Date.now()
  persistTask(state, task)
  sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_PAUSE, {
    taskId,
    sessionId: task.sessionId
  })

  return {
    statusCode: 200,
    body: { ok: true, taskId, status: task.status }
  }
}

function resumeTask(taskId, state) {
  const task = state.tasks.get(taskId)

  if (!task) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.')
    }
  }

  const device = state.devices.get(task.deviceId)

  if (!device?.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  task.status = 'resuming'
  task.updatedAt = Date.now()
  persistTask(state, task)
  sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RESUME, {
    taskId,
    sessionId: task.sessionId
  })

  return {
    statusCode: 200,
    body: { ok: true, taskId, status: task.status }
  }
}

function respondToPermission(taskId, requestId, responseBody, state) {
  const task = state.tasks.get(taskId)

  if (!task) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.')
    }
  }

  if (!task.sessionId) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.SESSION_NOT_READY, 'Task session is not ready.')
    }
  }

  const device = state.devices.get(task.deviceId)

  if (!device?.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  const decisionEvent = appendTaskEvent(
    state,
    task,
    buildPermissionDecisionEvent(task, requestId, responseBody)
  )

  if (decisionEvent) {
    broadcastTaskEvent(state, task, decisionEvent)
  }

  sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_PERMISSION_RESPONSE, {
    taskId,
    sessionId: task.sessionId,
    requestId,
    response: isRecord(responseBody) ? responseBody : {}
  })

  return {
    statusCode: 200,
    body: {
      ok: true,
      taskId,
      requestId
    }
  }
}

function createRemoteWindow(body = {}, state) {
  if (!isRecord(body)) {
    return {
      statusCode: 400,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Window payload is required.')
    }
  }

  const deviceId = String(body.deviceId || '').trim()
  const device = state.devices.get(deviceId)

  if (!device) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  if (!device.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  const workspace = normalizeWorkspace(body.workspace)

  if (!workspace.path) {
    return {
      statusCode: 400,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Workspace path is required.')
    }
  }

  const now = Date.now()
  const remoteWindow = {
    windowId: String(body.windowId || `window_${randomUUID()}`),
    deviceId,
    title: String(body.title || workspace.name || 'Xoder Window').trim(),
    workspace,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }

  state.windows.set(remoteWindow.windowId, remoteWindow)

  return {
    statusCode: 200,
    body: serializeRemoteWindow(remoteWindow)
  }
}

async function saveWorkspace(body = {}, state) {
  if (!isRecord(body)) {
    return {
      statusCode: 400,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Workspace payload is required.')
    }
  }

  const workspace = normalizeWorkspace(body.workspace || body)

  if (!workspace.path) {
    return {
      statusCode: 400,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Workspace path is required.')
    }
  }

  const deviceId = String(body.deviceId || '').trim()

  if (deviceId && !state.devices.has(deviceId)) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  const now = Date.now()
  const workspaces = getSavedWorkspaces(state)
  const existingIndex = workspaces.findIndex(
    (item) =>
      item.id === workspace.id ||
      (item.deviceId === deviceId &&
        item.workspace.path.toLowerCase() === workspace.path.toLowerCase())
  )
  const previous = existingIndex >= 0 ? workspaces[existingIndex] : null
  const savedWorkspace = {
    id: String(body.id || previous?.id || workspace.id || `workspace_${randomUUID()}`).trim(),
    deviceId: deviceId || previous?.deviceId || '',
    title: String(body.title || previous?.title || workspace.name || workspace.path).trim(),
    workspace,
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    lastOpenedAt: now
  }

  if (existingIndex >= 0) {
    workspaces[existingIndex] = savedWorkspace
  } else {
    workspaces.unshift(savedWorkspace)
  }

  await state.configStore.update({ workspaces })

  return {
    statusCode: 200,
    body: savedWorkspace
  }
}

function getSavedWorkspaces(state) {
  const config = state.configStore.get()
  return Array.isArray(config.workspaces) ? config.workspaces : []
}

function listDeviceFiles(deviceId, targetPath, state) {
  const device = state.devices.get(deviceId)

  if (!device) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  if (!device.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  const requestId = `fs_${randomUUID()}`

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      state.pendingFsRequests.delete(requestId)
      resolve({
        statusCode: 504,
        body: createRemoteError(REMOTE_ERROR_CODES.RUNTIME_ERROR, 'Timed out waiting for device file list.')
      })
    }, 10000)

    state.pendingFsRequests.set(requestId, {
      deviceId,
      resolve: (payload = {}) => {
        clearTimeout(timeout)

        if (payload.error) {
          resolve({
            statusCode: 500,
            body: createRemoteError(
              payload.error.code || REMOTE_ERROR_CODES.RUNTIME_ERROR,
              payload.error.message || 'Failed to list device files.'
            )
          })
          return
        }

        resolve({
          statusCode: 200,
          body: {
            deviceId,
            requestId,
            path: String(payload.path || targetPath || ''),
            parentPath: String(payload.parentPath || ''),
            entries: Array.isArray(payload.entries) ? payload.entries : []
          }
        })
      }
    })

    sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_FS_LIST, {
      requestId,
      path: String(targetPath || '')
    })
  })
}

function getDeviceGlobalMemory(deviceId, state) {
  return requestDeviceGlobalMemory(deviceId, { action: 'get' }, state)
}

function setDeviceGlobalMemory(deviceId, body = {}, state) {
  if (!isRecord(body) || typeof body.content !== 'string') {
    return {
      statusCode: 400,
      body: createRemoteError(REMOTE_ERROR_CODES.BAD_REQUEST, 'Global memory content is required.')
    }
  }

  return requestDeviceGlobalMemory(deviceId, { action: 'set', content: body.content }, state)
}

function requestDeviceGlobalMemory(deviceId, requestPayload, state) {
  const device = state.devices.get(deviceId)

  if (!device) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  if (!device.online || !device.ws) {
    return {
      statusCode: 409,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_OFFLINE, 'Target device is offline.')
    }
  }

  if (!deviceSupportsGlobalMemory(device)) {
    return {
      statusCode: 409,
      body: createRemoteError(
        REMOTE_ERROR_CODES.RUNTIME_ERROR,
        'The connected local daemon does not support Global Memory yet. Restart xoder local daemon and try again.'
      )
    }
  }

  const requestId = `global_memory_${randomUUID()}`
  const type =
    requestPayload.action === 'set'
      ? REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_SET
      : REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_GET

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      state.pendingGlobalMemoryRequests.delete(requestId)
      resolve({
        statusCode: 504,
        body: createRemoteError(REMOTE_ERROR_CODES.RUNTIME_ERROR, 'Timed out waiting for global memory.')
      })
    }, 10000)

    state.pendingGlobalMemoryRequests.set(requestId, {
      deviceId,
      resolve: (payload = {}) => {
        clearTimeout(timeout)

        if (payload.error) {
          resolve({
            statusCode: 500,
            body: createRemoteError(
              payload.error.code || REMOTE_ERROR_CODES.RUNTIME_ERROR,
              payload.error.message || 'Failed to access global memory.'
            )
          })
          return
        }

        resolve({
          statusCode: 200,
          body: {
            deviceId,
            requestId,
            path: String(payload.path || ''),
            content: String(payload.content || ''),
            exists: Boolean(payload.exists),
            size: Number(payload.size || 0),
            modifiedAt: Number(payload.modifiedAt || 0),
            savedAt: Number(payload.savedAt || 0)
          }
        })
      }
    })

    sendRemoteMessage(device.ws, type, {
      requestId,
      ...(requestPayload.action === 'set' ? { content: requestPayload.content } : {})
    })
  })
}

function listTasks(url, state) {
  const deviceId = String(url.searchParams.get('deviceId') || '').trim()
  const workspaceId = String(url.searchParams.get('workspaceId') || '').trim()
  const status = String(url.searchParams.get('status') || '').trim()
  const limit = readPositiveInteger(url.searchParams.get('limit'), 100)
  const tasks = Array.from(state.tasks.values())
    .filter((task) => !deviceId || task.deviceId === deviceId)
    .filter((task) => !workspaceId || task.request?.workspace?.id === workspaceId)
    .filter((task) => !status || task.status === status)
    .sort((left, right) => Number(right.createdAt || 0) - Number(left.createdAt || 0))
    .slice(0, limit)
    .map(serializeTask)

  return {
    tasks
  }
}

function buildRemoteDiagnostics(state) {
  const recentErrors = []

  for (const task of state.tasks.values()) {
    for (const event of task.events || []) {
      const type = String(event?.type || '')

      if (
        type === 'session.failed' ||
        type === 'session.cancelled' ||
        type === 'runtime.stderr' ||
        type === 'permission.denied' ||
        type === 'digital.job.failed'
      ) {
        recentErrors.push({
          taskId: task.taskId,
          timestamp: event.timestamp || task.updatedAt,
          type,
          payload: sanitizeForRemote(event.payload || {})
        })
      }
    }
  }

  recentErrors.sort((left, right) => Number(right.timestamp || 0) - Number(left.timestamp || 0))

  const statusCounts = {}

  for (const task of state.tasks.values()) {
    statusCounts[task.status] = Number(statusCounts[task.status] || 0) + 1
  }

  return {
    ok: true,
    service: REMOTE_CORE_SERVICE,
    generatedAt: Date.now(),
    security: {
      remoteControlEnabled: state.configStore.get().security?.remoteControlEnabled !== false
    },
    storage: {
      enabled: Boolean(state.storage.enabled),
      dataDir: state.storage.dataDir || '',
      errors: Array.isArray(state.storage.errors) ? state.storage.errors.slice(-20) : []
    },
    devices: Array.from(state.devices.values()).map(serializeDevice),
    tasks: {
      total: state.tasks.size,
      statusCounts
    },
    recentErrors: recentErrors.slice(0, 50)
  }
}

function deviceSupportsGlobalMemory(device = {}) {
  const capabilities = isRecord(device.capabilities) ? device.capabilities : {}
  const remoteCore = isRecord(capabilities.remoteCore) ? capabilities.remoteCore : {}

  return capabilities.globalMemory === true || remoteCore.globalMemory === true
}

function setupDaemonSocket(ws, state) {
  let deviceId = ''

  ws.on('message', (data) => {
    const parsed = parseRemoteMessage(data)

    if (!parsed.ok) {
      sendRemoteError(ws, parsed.error.error.code, parsed.error.error.message)
      return
    }

    const message = parsed.message

    if (message.type === REMOTE_MESSAGE_TYPES.DAEMON_HELLO) {
      const registered = registerDaemon(ws, message.payload, state)

      if (!registered.ok) {
        sendRemoteError(ws, registered.code, registered.message)
        ws.close(1008, registered.code)
        return
      }

      deviceId = registered.device.id
      sendRemoteMessage(ws, REMOTE_MESSAGE_TYPES.DAEMON_READY, {
        deviceId,
        deviceToken: state.deviceTokens.get(deviceId) || ''
      })
      recoverDeviceTasks(deviceId, state)
      broadcastDevices(state)
      return
    }

    if (!deviceId) {
      sendRemoteError(ws, REMOTE_ERROR_CODES.UNAUTHORIZED, 'Daemon must register first.')
      return
    }

    handleDaemonMessage(deviceId, message, state)
  })

  ws.on('close', () => {
    if (!deviceId) {
      return
    }

    const device = state.devices.get(deviceId)

    if (device?.ws === ws) {
      device.online = false
      device.ws = null
      device.lastSeenAt = Date.now()
      markDeviceTasksInterrupted(deviceId, state)
      broadcastDevices(state)
    }
  })
}

function registerDaemon(ws, payload = {}, state) {
  const pairingCode = String(payload.pairingCode || '').trim()
  const incomingDevicePayload = isRecord(payload.device) ? payload.device : {}
  const incomingDeviceId = String(incomingDevicePayload.id || 'device_' + randomUUID()).trim()
  const suppliedDeviceToken = String(payload.deviceToken || '').trim()
  const authToken = getAuthToken(state)
  const expectedDeviceToken = String(state.deviceTokens.get(incomingDeviceId) || '').trim()
  const previousDevice = state.devices.get(incomingDeviceId)
  const boundDevice = Boolean(state.deviceBindings.get(incomingDeviceId) ?? previousDevice?.bound)
  const validPairingCode = !authToken || pairingCode === authToken
  const validDeviceToken = Boolean(expectedDeviceToken && suppliedDeviceToken === expectedDeviceToken)

  if (authToken && ((boundDevice && !validDeviceToken) || (!boundDevice && !validPairingCode && !validDeviceToken))) {
    return {
      ok: false,
      code: REMOTE_ERROR_CODES.UNAUTHORIZED,
      message: 'Invalid daemon pairing code.'
    }
  }

  const devicePayload = isRecord(payload.device) ? payload.device : {}
  const workspaceMode = normalizeDeviceWorkspaceMode(devicePayload.workspaceMode, devicePayload.workspace)
  const workspace =
    workspaceMode === 'default'
      ? normalizeWorkspace(devicePayload.workspace)
      : {
          id: '',
          name: '按任务动态指定',
          path: ''
        }
  const deviceId = String(devicePayload.id || `device_${randomUUID()}`).trim()
  const now = Date.now()
  const previous = state.devices.get(deviceId)
  const lockState = state.deviceLocks.get(deviceId) || {}
  const device = {
    id: deviceId,
    name: String(devicePayload.name || deviceId).trim(),
    platform: String(devicePayload.platform || process.platform).trim(),
    workspaceMode,
    online: true,
    connectedAt: previous?.connectedAt || now,
    lastSeenAt: now,
    workspace,
    capabilities: isRecord(payload.capabilities) ? payload.capabilities : {},
    locked: Boolean(lockState.locked ?? previous?.locked),
    lockReason: String(lockState.reason || previous?.lockReason || '').trim(),
    lockUpdatedAt: Number(lockState.updatedAt || previous?.lockUpdatedAt || 0),
    bound: Boolean(state.deviceBindings.get(deviceId) ?? previous?.bound),
    deviceTokenConfigured: Boolean(expectedDeviceToken),
    ws
  }

  previous?.ws?.close?.(1000, 'Device reconnected.')
  state.devices.set(deviceId, device)

  if (device.locked) {
    sendRemoteMessage(ws, REMOTE_MESSAGE_TYPES.DAEMON_EXECUTION_LOCK, {
      locked: true,
      reason: device.lockReason || 'Remote execution is locked.',
      stopActive: true
    })
  }

  return {
    ok: true,
    device
  }
}

function handleDaemonMessage(deviceId, message, state) {
  if (message.type === REMOTE_MESSAGE_TYPES.DAEMON_FS_RESULT) {
    const requestId = String(message.payload.requestId || '').trim()
    const pending = state.pendingFsRequests.get(requestId)

    if (pending && pending.deviceId === deviceId) {
      state.pendingFsRequests.delete(requestId)
      pending.resolve(message.payload)
    }

    return
  }

  if (message.type === REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_RESULT) {
    const requestId = String(message.payload.requestId || '').trim()
    const pending = state.pendingGlobalMemoryRequests.get(requestId)

    if (pending && pending.deviceId === deviceId) {
      state.pendingGlobalMemoryRequests.delete(requestId)
      pending.resolve(message.payload)
    }

    return
  }

  if (message.type === REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED) {
    const taskId = String(message.payload.taskId || '').trim()
    const task = state.tasks.get(taskId)

    if (task) {
      task.sessionId = String(message.payload.sessionId || '').trim()
      task.status = 'running'
      task.updatedAt = Date.now()
      persistTask(state, task)
    }

    return
  }

  if (message.type === REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED) {
    const taskId = String(message.payload.taskId || '').trim()
    const task = state.tasks.get(taskId)

    if (task && task.deviceId === deviceId) {
      const previousSessionId = task.sessionId
      task.sessionId = String(message.payload.sessionId || task.sessionId || '')
      task.status = 'running'
      task.updatedAt = Date.now()
      const event = {
        id: `event_${randomUUID()}`,
        sessionId: task.sessionId,
        type: 'session.resumed',
        timestamp: Date.now(),
        payload: {
          reason: 'daemon_reconnected',
          previousSessionId,
          sessionId: task.sessionId,
          message: 'Local daemon reconnected and the interrupted task resumed.'
        }
      }
      appendTaskEvent(state, task, event)
      broadcastTaskEvent(state, task, event)
    }

    return
  }

  if (message.type === REMOTE_MESSAGE_TYPES.TASK_EVENT) {
    const taskId = String(message.payload.taskId || '').trim()
    const task = state.tasks.get(taskId)

    if (!task || task.deviceId !== deviceId) {
      return
    }

    const event = sanitizeForRemote(message.payload.event)

    if (!event) {
      return
    }

    task.sessionId = String(message.payload.sessionId || event.sessionId || task.sessionId || '')
    task.status = getTaskStatusFromEventType(event.type, task.status)
    task.updatedAt = Date.now()
    appendTaskEvent(state, task, event)
    broadcastTaskEvent(state, task, event)
  }
}

function setDeviceExecutionLock(deviceId, body = {}, state) {
  const device = state.devices.get(deviceId)

  if (!device) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  const locked = body.locked !== false
  const reason = String(body.reason || (locked ? 'Locked by remote user.' : 'Unlocked by remote user.')).trim()
  const updatedAt = Date.now()
  const lockState = { locked, reason, updatedAt }
  state.deviceLocks.set(deviceId, lockState)
  persistDeviceRegistry(state)
  device.locked = locked
  device.lockReason = reason
  device.lockUpdatedAt = updatedAt

  if (device.online && device.ws) {
    sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_EXECUTION_LOCK, {
      locked,
      reason,
      stopActive: body.stopActive !== false
    })
  }

  broadcastDevices(state)

  return {
    statusCode: 200,
    body: {
      ok: true,
      device: serializeDevice(device)
    }
  }
}

function markDeviceTasksInterrupted(deviceId, state) {
  for (const task of state.tasks.values()) {
    if (
      task.deviceId !== deviceId ||
      !['queued', 'running', 'cancelling', 'pausing', 'resuming'].includes(task.status)
    ) {
      continue
    }

    task.status = 'interrupted'
    task.updatedAt = Date.now()
    const event = {
      id: `event_${randomUUID()}`,
      sessionId: task.sessionId,
      type: 'session.interrupted',
      timestamp: Date.now(),
      payload: {
        reason: 'daemon_disconnected',
        message: 'Local daemon disconnected. The task can be recovered after reconnect.'
      }
    }
    appendTaskEvent(state, task, event)
    broadcastTaskEvent(state, task, event)
  }
}

function recoverDeviceTasks(deviceId, state) {
  const device = state.devices.get(deviceId)

  if (!device?.ws) {
    return
  }

  for (const task of state.tasks.values()) {
    if (task.deviceId !== deviceId || !['interrupted', 'queued'].includes(task.status)) {
      continue
    }

    task.status = 'resuming'
    task.updatedAt = Date.now()
    persistTask(state, task)
    sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVER, {
      taskId: task.taskId,
      sessionId: task.sessionId,
      request: task.request
    })
  }
}

function setupEventsSocket(ws, state) {
  const client = {
    ws,
    subscriptions: new Set()
  }

  state.eventClients.add(client)
  sendRemoteMessage(ws, REMOTE_MESSAGE_TYPES.DEVICES_UPDATED, {
    devices: Array.from(state.devices.values()).map(serializeDevice)
  })

  ws.on('message', (data) => {
    const parsed = parseRemoteMessage(data)

    if (!parsed.ok) {
      sendRemoteError(ws, parsed.error.error.code, parsed.error.error.message)
      return
    }

    if (parsed.message.type !== REMOTE_MESSAGE_TYPES.EVENTS_SUBSCRIBE) {
      sendRemoteError(ws, REMOTE_ERROR_CODES.BAD_REQUEST, 'Unsupported events socket message.')
      return
    }

    const taskId = String(parsed.message.payload.taskId || '').trim()
    const task = state.tasks.get(taskId)

    if (!task) {
      sendRemoteError(ws, REMOTE_ERROR_CODES.TASK_NOT_FOUND, 'Task not found.')
      return
    }

    client.subscriptions.add(taskId)
    sendRemoteMessage(ws, REMOTE_MESSAGE_TYPES.EVENTS_SNAPSHOT, {
      taskId,
      sessionId: task.sessionId,
      status: task.status,
      eventCount: task.eventCount,
      updatedAt: task.updatedAt,
      events: task.events
    })
  })

  ws.on('close', () => {
    state.eventClients.delete(client)
  })
}

function broadcastTaskEvent(state, task, event) {
  for (const client of state.eventClients) {
    if (client.subscriptions.has(task.taskId)) {
      sendRemoteMessage(client.ws, REMOTE_MESSAGE_TYPES.TASK_EVENT, {
        taskId: task.taskId,
        sessionId: task.sessionId,
        status: task.status,
        eventCount: task.eventCount,
        updatedAt: task.updatedAt,
        event
      })
    }
  }
}

function broadcastDevices(state) {
  const payload = {
    devices: Array.from(state.devices.values()).map(serializeDevice)
  }

  for (const client of state.eventClients) {
    sendRemoteMessage(client.ws, REMOTE_MESSAGE_TYPES.DEVICES_UPDATED, payload)
  }
}

function broadcastConfigUpdated(state) {
  const payload = {
    config: state.configStore.getPublic()
  }

  for (const client of state.eventClients) {
    sendRemoteMessage(client.ws, REMOTE_MESSAGE_TYPES.CONFIG_UPDATED, payload)
  }
}

function serializeDevice(device) {
  return {
    id: device.id,
    name: device.name,
    platform: device.platform,
    workspaceMode: device.workspaceMode || 'default',
    online: Boolean(device.online),
    connectedAt: device.connectedAt,
    lastSeenAt: device.lastSeenAt,
    locked: Boolean(device.locked),
    lockReason: device.lockReason || '',
    lockUpdatedAt: device.lockUpdatedAt || 0,
    bound: Boolean(device.bound),
    deviceTokenConfigured: Boolean(device.deviceTokenConfigured),
    workspace: device.workspace,
    capabilities: device.capabilities || {}
  }
}

function rotateDeviceToken(deviceId, state) {
  const device = state.devices.get(deviceId)

  if (!device) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  const token = `xdt_${randomUUID().replace(/-/g, '')}`
  state.deviceTokens.set(deviceId, token)
  state.deviceBindings.set(deviceId, true)
  persistDeviceRegistry(state)
  device.bound = true
  device.deviceTokenConfigured = true

  if (device.online && device.ws) {
    sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_DEVICE_TOKEN, {
      deviceToken: token
    })
  }

  broadcastDevices(state)

  return {
    statusCode: 200,
    body: { ok: true, deviceId, deviceToken: token, rotatedAt: Date.now() }
  }
}

function setDeviceBinding(deviceId, bound, state) {
  const device = state.devices.get(deviceId)

  if (!device) {
    return {
      statusCode: 404,
      body: createRemoteError(REMOTE_ERROR_CODES.DEVICE_NOT_FOUND, 'Target device was not found.')
    }
  }

  let token = state.deviceTokens.get(deviceId) || ''

  if (bound && !token) {
    token = `xdt_${randomUUID().replace(/-/g, '')}`
    state.deviceTokens.set(deviceId, token)
  }

  state.deviceBindings.set(deviceId, bound)
  device.bound = bound
  device.deviceTokenConfigured = bound && Boolean(token)

  if (device.online && device.ws) {
    sendRemoteMessage(device.ws, REMOTE_MESSAGE_TYPES.DAEMON_DEVICE_TOKEN, {
      deviceToken: bound ? token : '',
      clear: !bound
    })
  }

  if (!bound) {
    state.deviceTokens.delete(deviceId)
  }

  persistDeviceRegistry(state)

  broadcastDevices(state)

  return {
    statusCode: 200,
    body: {
      ok: true,
      device: serializeDevice(device),
      ...(bound && token ? { deviceToken: token } : {})
    }
  }
}

function buildTaskAudit(task = {}) {
  const events = Array.isArray(task.events) ? task.events : []

  return events
    .filter((event) => {
      const type = String(event?.type || '')
      return (
        type.startsWith('permission.') ||
        type === 'permission.requested' ||
        type === 'permission.granted' ||
        type === 'permission.denied' ||
        type.startsWith('runtime.') ||
        type.startsWith('digital.git.') ||
        type.startsWith('digital.pr.') ||
        type === 'session.failed' ||
        type === 'session.cancelled'
      )
    })
    .map((event) => sanitizeForRemote(event))
    .filter(Boolean)
}

function serializeTask(task) {
  return {
    taskId: task.taskId,
    sessionId: task.sessionId,
    deviceId: task.deviceId,
    windowId: task.windowId || '',
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    eventCount: task.eventCount,
    workspace: sanitizeForRemote(task.request?.workspace || {}),
    request: sanitizeForRemote(task.request || {}),
    summary: buildTaskSummary(task)
  }
}

function buildTaskSummary(task = {}, options = {}) {
  const events = Array.isArray(task.events) ? task.events : []
  const changedFiles = new Map()
  const tests = []
  const risks = []
  const questions = []
  const git = {
    branch: '',
    baseBranch: '',
    remote: '',
    commitHash: '',
    commitTitle: '',
    pushed: false,
    prUrl: '',
    prTitle: '',
    prNumber: 0
  }
  let diffStat = ''
  let finalText = ''
  let report = null

  for (const event of events) {
    const type = String(event?.type || '')
    const payload = isRecord(event?.payload) ? event.payload : {}

    if (type === 'message.assistant.delta') {
      finalText += String(payload.text || '')
    }

    if (type === 'message.assistant.completed') {
      finalText = String(payload.text || payload.content || finalText)
    }

    if (type === 'artifact.changed') {
      addChangedFile(changedFiles, payload.path || payload.name, payload.operation || payload.action || 'modified')
    }

    if (type === 'digital.git.summary') {
      diffStat = String(payload.diffStat || payload.diff || diffStat)
      const status = String(payload.status || '')
      for (const line of status.split(/\r?\n/)) {
        addChangedFileFromGitStatus(changedFiles, line)
      }
      for (const line of String(payload.diffNameStatus || '').split(/\r?\n/)) {
        addChangedFileFromNameStatus(changedFiles, line)
      }
      for (const file of Array.isArray(payload.changedFiles) ? payload.changedFiles : []) {
        addChangedFileFromGitStatus(changedFiles, file)
      }
    }

    if (type === 'digital.git.workspace') {
      git.branch = String(payload.git?.branch || payload.branch || git.branch)
      git.baseBranch = String(payload.git?.baseBranch || payload.baseBranch || git.baseBranch)
      git.remote = String(payload.git?.remote || payload.remote || git.remote)
    }

    if (type === 'digital.git.committed') {
      git.commitHash = String(payload.hash || payload.commitHash || git.commitHash)
      git.commitTitle = String(payload.title || git.commitTitle)
      git.branch = String(payload.branch || git.branch)
    }

    if (type === 'digital.git.pushed') {
      git.pushed = true
      git.remote = String(payload.remote || git.remote)
      git.branch = String(payload.branch || git.branch)
    }

    if (type === 'digital.pr.created') {
      git.prUrl = String(payload.url || payload.webUrl || git.prUrl)
      git.prTitle = String(payload.title || git.prTitle)
      git.prNumber = Number(payload.number || payload.iid || git.prNumber || 0)
    }

    if (type === 'digital.job.completed') {
      git.branch = String(payload.branch || payload.git?.branch || git.branch)
      git.prUrl = String(payload.git?.pr?.url || payload.report?.prUrl || git.prUrl)
      git.commitHash = String(payload.git?.commit?.hash || git.commitHash)
    }

    if (type === 'digital.report.created') {
      report = {
        path: String(payload.path || ''),
        content: String(payload.content || ''),
        createdAt: Number(payload.createdAt || event.timestamp || 0)
      }
    }

    if (type.startsWith('test.') || type.startsWith('validation.')) {
      tests.push({
        type,
        status: String(payload.status || (type.endsWith('.failed') ? 'failed' : 'completed')),
        name: String(payload.name || payload.command || payload.title || type),
        summary: String(payload.summary || payload.message || payload.output || '')
      })
    }

    if (type === 'digital.agent.event') {
      const agentEvent = isRecord(payload.event) ? payload.event : {}
      if (agentEvent.type === 'tool.completed' || agentEvent.type === 'tool.failed') {
        const toolPayload = isRecord(agentEvent.payload) ? agentEvent.payload : {}
        const toolName = String(toolPayload.name || toolPayload.tool || 'tool')
        if (/test|lint|build|typecheck|check/i.test(toolName)) {
          tests.push({
            type: agentEvent.type,
            status: agentEvent.type === 'tool.failed' ? 'failed' : 'completed',
            name: toolName,
            summary: String(toolPayload.output || toolPayload.result || toolPayload.error || '')
          })
        }
      }
    }

    if (type === 'permission.requested' || type === 'digital.question.created') {
      questions.push({
        requestId: String(payload.requestId || payload.questionId || payload.id || ''),
        title: String(payload.title || '需要确认'),
        summary: String(payload.summary || payload.description || ''),
        status: 'pending'
      })
    }

    if (type === 'permission.decision' || type === 'digital.question.resolved' || type === 'digital.question.cancelled') {
      const requestId = String(payload.requestId || payload.questionId || payload.id || '')
      const question = questions.find(item => item.requestId === requestId)
      if (question) {
        question.status = type === 'digital.question.cancelled' || payload.allow === false ? 'denied' : 'approved'
      }
    }

    if (type === 'digital.stage.failed' || type === 'digital.job.failed' || type === 'session.failed') {
      const error = isRecord(payload.error) ? payload.error : payload
      const message = String(error.message || payload.message || type)
      if (message && !risks.includes(message)) {
        risks.push(message)
      }
    }

    if (type === 'digital.git.skipped' || type === 'digital.pr.skipped') {
      const reason = String(payload.reason || '')
      if (reason && !risks.includes(reason)) {
        risks.push(reason)
      }
    }
  }

  const files = Array.from(changedFiles.values())
  const status = String(task.status || '')

  return {
    status,
    goal: String(task.request?.prompt || ''),
    workspace: sanitizeForRemote(task.request?.workspace || {}),
    changedFiles: files,
    addedFiles: files.filter(file => file.operation === 'added').map(file => file.path),
    modifiedFiles: files.filter(file => file.operation === 'modified').map(file => file.path),
    deletedFiles: files.filter(file => file.operation === 'deleted').map(file => file.path),
    diffStat,
    tests: dedupeSummaryItems(tests),
    risks: risks.slice(0, 20),
    questions,
    git,
    finalText: trimSummaryText(finalText),
    report: options.includeReport
      ? report
      : report
        ? { path: report.path, createdAt: report.createdAt }
        : null,
    eventCount: Number(task.eventCount || events.length),
    createdAt: Number(task.createdAt || 0),
    updatedAt: Number(task.updatedAt || 0)
  }
}

function addChangedFile(changedFiles, rawPath, operation = 'modified') {
  const path = String(rawPath || '').trim()
  if (!path) {
    return
  }

  const normalizedOperation = normalizeFileOperation(operation)
  changedFiles.set(path, {
    path,
    name: path.replace(/\\/g, '/').split('/').filter(Boolean).at(-1) || path,
    operation: normalizedOperation
  })
}

function addChangedFileFromGitStatus(changedFiles, rawLine) {
  const line = String(rawLine || '').trimEnd()
  if (!line) {
    return
  }

  const status = line.slice(0, 2).trim() || line.slice(0, 1)
  const path = line.slice(2).trim() || line.trim()
  addChangedFile(changedFiles, path, status)
}

function addChangedFileFromNameStatus(changedFiles, rawLine) {
  const parts = String(rawLine || '').trim().split(/\s+/)
  if (parts.length < 2) {
    return
  }

  addChangedFile(changedFiles, parts.slice(1).join(' '), parts[0])
}

function normalizeFileOperation(operation = '') {
  const value = String(operation || '').trim().toLowerCase()
  if (value === 'a' || value.includes('?') || value.includes('add') || value.includes('create') || value.includes('new')) {
    return 'added'
  }
  if (value === 'd' || value.includes('delete') || value.includes('remove')) {
    return 'deleted'
  }
  return 'modified'
}

function dedupeSummaryItems(items = []) {
  const seen = new Set()
  return items.filter(item => {
    const key = `${item.type}:${item.name}:${item.status}:${item.summary}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function trimSummaryText(value = '') {
  return String(value || '').trim().slice(-12000)
}

function serializeRemoteWindow(remoteWindow) {
  return {
    windowId: remoteWindow.windowId,
    deviceId: remoteWindow.deviceId,
    title: remoteWindow.title,
    workspace: remoteWindow.workspace,
    status: remoteWindow.status,
    createdAt: remoteWindow.createdAt,
    updatedAt: remoteWindow.updatedAt
  }
}

function getTaskStatusFromEventType(eventType, fallback = 'running') {
  if (eventType === 'session.completed' || eventType === 'digital.job.completed') {
    return 'completed'
  }

  if (eventType === 'session.failed' || eventType === 'digital.job.failed') {
    return 'failed'
  }

  if (eventType === 'session.cancelled' || eventType === 'digital.job.cancelled') {
    return 'cancelled'
  }

  if (eventType === 'digital.job.paused') {
    return 'paused'
  }

  if (eventType === 'digital.job.resumed') {
    return 'running'
  }

  return fallback === 'queued' ? 'running' : fallback
}

function normalizeDeviceWorkspaceMode(value, workspace = {}) {
  const mode = String(value || '').trim()

  if (mode === 'default' || mode === 'dynamic') {
    return mode
  }

  return isRecord(workspace) && String(workspace.path || '').trim() ? 'default' : 'dynamic'
}

function createTaskStorage(options = {}, configStore) {
  const config = configStore.get()
  const cloud = isRecord(config.cloud) ? config.cloud : {}
  const storageOptions = isRecord(options) ? options : {}
  const explicitDir = readString(storageOptions.dataDir || storageOptions.dir || cloud.dataDir)
  const enabled =
    storageOptions.enabled !== undefined
      ? Boolean(storageOptions.enabled)
      : Boolean(explicitDir || configStore.persist)

  if (!enabled) {
    return {
      enabled: false,
      dataDir: '',
      tasksDir: '',
      devicesPath: '',
      errors: []
    }
  }

  const configDir = dirname(configStore.configPath || resolve('.xoder/remote-core.config.json'))
  const dataDir = resolve(explicitDir || join(configDir, 'remote-core-data'))

  return {
    enabled: true,
    dataDir,
    tasksDir: join(dataDir, 'tasks'),
    devicesPath: join(dataDir, 'devices.json'),
    errors: []
  }
}

function loadPersistedDeviceRegistry(state) {
  const registryPath = state.storage.devicesPath

  if (!state.storage.enabled || !registryPath || !existsSync(registryPath)) {
    return
  }

  try {
    const records = JSON.parse(readFileSync(registryPath, 'utf8'))

    for (const record of Array.isArray(records) ? records : []) {
      const deviceId = String(record?.deviceId || '').trim()

      if (!deviceId) {
        continue
      }

      if (record.deviceToken) {
        state.deviceTokens.set(deviceId, String(record.deviceToken))
      }

      state.deviceBindings.set(deviceId, Boolean(record.bound))
      state.deviceLocks.set(deviceId, {
        locked: Boolean(record.locked),
        reason: String(record.lockReason || '').trim(),
        updatedAt: Number(record.lockUpdatedAt || 0)
      })
    }
  } catch (error) {
    recordStorageError(state, error)
  }
}

function persistDeviceRegistry(state) {
  if (!state.storage.enabled || !state.storage.devicesPath) {
    return
  }

  try {
    const deviceIds = new Set([
      ...state.deviceTokens.keys(),
      ...state.deviceBindings.keys(),
      ...state.deviceLocks.keys()
    ])
    const records = Array.from(deviceIds).map((deviceId) => {
      const device = state.devices.get(deviceId)
      const lock = state.deviceLocks.get(deviceId) || {}

      return {
        deviceId,
        deviceToken: state.deviceTokens.get(deviceId) || '',
        bound: Boolean(state.deviceBindings.get(deviceId) ?? device?.bound),
        locked: Boolean(lock.locked ?? device?.locked),
        lockReason: String(lock.reason || device?.lockReason || '').trim(),
        lockUpdatedAt: Number(lock.updatedAt || device?.lockUpdatedAt || 0),
        updatedAt: Date.now()
      }
    })
    mkdirSync(dirname(state.storage.devicesPath), { recursive: true })
    writeFileSync(state.storage.devicesPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
  } catch (error) {
    recordStorageError(state, error)
  }
}

function loadPersistedTasks(state) {
  if (!state.storage.enabled) {
    return
  }

  try {
    mkdirSync(state.storage.tasksDir, { recursive: true })

    for (const entry of readdirSync(state.storage.tasksDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue
      }

      const taskDir = join(state.storage.tasksDir, entry.name)
      const taskPath = join(taskDir, 'task.json')

      if (!existsSync(taskPath)) {
        continue
      }

      const task = normalizePersistedTask(JSON.parse(readFileSync(taskPath, 'utf8')))

      if (!task.taskId) {
        continue
      }

      task.events = readPersistedTaskEvents(taskDir, getEventHistoryLimit(state))
      state.tasks.set(task.taskId, task)

      if (['running', 'cancelling', 'pausing', 'resuming'].includes(task.status)) {
        task.status = 'interrupted'
        task.updatedAt = Date.now()
        appendTaskEvent(state, task, {
          id: `event_${randomUUID()}`,
          sessionId: task.sessionId,
          type: 'session.interrupted',
          timestamp: task.updatedAt,
          payload: {
            reason: 'cloud_restarted',
            message: 'Cloud restarted while the task was active. The task can resume when the daemon reconnects.'
          }
        })
      }
    }
  } catch (error) {
    recordStorageError(state, error)
  }
}

function normalizePersistedTask(input = {}) {
  const task = isRecord(input) ? input : {}
  const createdAt = readPositiveInteger(task.createdAt, Date.now())

  return {
    taskId: String(task.taskId || '').trim(),
    deviceId: String(task.deviceId || '').trim(),
    sessionId: String(task.sessionId || '').trim(),
    status: String(task.status || 'queued').trim(),
    createdAt,
    updatedAt: readPositiveInteger(task.updatedAt, createdAt),
    windowId: String(task.windowId || '').trim(),
    eventCount: readPositiveInteger(task.eventCount, 0),
    request: isRecord(task.request) ? task.request : {},
    events: []
  }
}

function readPersistedTaskEvents(taskDir, limit) {
  const eventsPath = join(taskDir, 'events.jsonl')

  if (!existsSync(eventsPath)) {
    return []
  }

  const events = []
  const raw = readFileSync(eventsPath, 'utf8')

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) {
      continue
    }

    try {
      const event = sanitizeForRemote(JSON.parse(line))

      if (event) {
        events.push(event)
      }
    } catch {
      // Keep loading the rest of the task history when one JSONL line is damaged.
    }
  }

  return events.slice(-limit)
}

function appendTaskEvent(state, task, rawEvent) {
  const event = sanitizeForRemote(rawEvent)

  if (!event) {
    return null
  }

  task.updatedAt = Date.now()
  task.events.push(event)

  const eventHistoryLimit = getEventHistoryLimit(state)

  if (task.events.length > eventHistoryLimit) {
    task.events.splice(0, task.events.length - eventHistoryLimit)
  }

  task.eventCount = Number(task.eventCount || 0) + 1
  persistTaskEvent(state, task, event)
  persistTask(state, task)
  return event
}

function persistTask(state, task) {
  if (!state.storage.enabled || !task?.taskId) {
    return
  }

  try {
    const taskDir = getPersistedTaskDir(state, task.taskId)
    mkdirSync(taskDir, { recursive: true })
    writeFileSync(
      join(taskDir, 'task.json'),
      `${JSON.stringify(serializePersistedTask(task), null, 2)}\n`,
      'utf8'
    )
  } catch (error) {
    recordStorageError(state, error)
  }
}

function persistTaskEvent(state, task, event) {
  if (!state.storage.enabled || !task?.taskId) {
    return
  }

  try {
    const taskDir = getPersistedTaskDir(state, task.taskId)
    mkdirSync(taskDir, { recursive: true })
    appendFileSync(join(taskDir, 'events.jsonl'), `${JSON.stringify(event)}\n`, 'utf8')
  } catch (error) {
    recordStorageError(state, error)
  }
}

function serializePersistedTask(task) {
  return {
    taskId: task.taskId,
    deviceId: task.deviceId,
    sessionId: task.sessionId,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    windowId: task.windowId || '',
    eventCount: task.eventCount,
    request: sanitizeForRemote(task.request || {})
  }
}

function buildPermissionDecisionEvent(task, requestId, responseBody) {
  const response = isRecord(responseBody) ? responseBody : {}
  const requestEvent = [...(task.events || [])]
    .reverse()
    .find(
      (event) =>
        event?.type === 'permission.requested' &&
        String(event.payload?.requestId || '') === String(requestId || '')
    )

  return {
    id: `event_${randomUUID()}`,
    sessionId: task.sessionId,
    type: 'permission.decision',
    timestamp: Date.now(),
    payload: {
      requestId,
      toolName: String(requestEvent?.payload?.toolName || '').trim(),
      risk: sanitizeForRemote(requestEvent?.payload?.risk || {}),
      allow: response.allow === true || response.behavior === 'allow',
      behavior: String(response.behavior || '').trim(),
      decisionClassification: String(response.decisionClassification || '').trim(),
      message: String(response.message || '').trim(),
      interrupt: Boolean(response.interrupt),
      response: sanitizeForRemote(response)
    }
  }
}

function getPersistedTaskDir(state, taskId) {
  return join(state.storage.tasksDir, encodeURIComponent(String(taskId || '').trim()))
}

function recordStorageError(state, error) {
  state.storage.errors.push({
    message: error?.message || String(error),
    timestamp: Date.now()
  })

  if (state.storage.errors.length > 20) {
    state.storage.errors.splice(0, state.storage.errors.length - 20)
  }
}

function readString(value, fallback = '') {
  if (value === undefined || value === null) {
    return String(fallback || '').trim()
  }

  return String(value).trim()
}

function readPositiveInteger(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback
}

async function readJsonBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim()

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch {
    const error = new Error('Invalid JSON body.')
    error.code = REMOTE_ERROR_CODES.BAD_REQUEST
    throw error
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, x-xoder-token',
    'access-control-allow-methods': 'GET, POST, PUT, PATCH, OPTIONS'
  })
  response.end(JSON.stringify(body))
}

function isRequestAuthorized(request, state, url = new URL(request.url || '/', 'http://localhost')) {
  const token = getAuthToken(state)

  if (!token) {
    return true
  }

  const headerToken = String(request.headers['x-xoder-token'] || '').trim()
  const queryToken = String(url.searchParams.get('token') || '').trim()

  return headerToken === token || queryToken === token
}

async function main() {
  const args = parseCliArgs()
  const configStore = new RemoteConfigStore({ configPath: args.config })
  await configStore.load()
  configStore.applyRuntimeOverrides(buildCloudRuntimeOverrides(args))

  const config = configStore.get()
  const port = Number(config.cloud.port || DEFAULT_REMOTE_PORT)
  const host = String(config.cloud.host || '0.0.0.0')
  const app = createRemoteCoreServer({ configStore })
  const address = await app.listen(port, host)

  console.log(
    `${REMOTE_CORE_SERVICE} listening on ${config.cloud.tls?.enabled ? 'https' : 'http'}://${address.address}:${address.port}; auth ${
      getAuthToken(app.state) ? 'enabled' : 'disabled'
    }; config ${configStore.configPath}`
  )
}

function getAuthToken(state) {
  return String(state.configStore.get().auth.token || '').trim()
}

function createCloudServer(config = {}, tlsOverride, requestHandler) {
  const tls = isRecord(tlsOverride) ? tlsOverride : config.cloud?.tls

  if (!tls?.enabled) {
    return createServer(requestHandler)
  }

  const keyPath = resolve(String(tls.keyPath || '').trim())
  const certPath = resolve(String(tls.certPath || '').trim())

  if (!keyPath || !certPath || !existsSync(keyPath) || !existsSync(certPath)) {
    const error = new Error('TLS is enabled but cloud keyPath/certPath is missing or invalid.')
    error.code = 'TLS_CONFIG_INVALID'
    throw error
  }

  return createHttpsServer(
    {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath)
    },
    requestHandler
  )
}

function getEventHistoryLimit(state) {
  return Number(state.configStore.get().cloud.eventHistoryLimit || DEFAULT_EVENT_HISTORY_LIMIT)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
