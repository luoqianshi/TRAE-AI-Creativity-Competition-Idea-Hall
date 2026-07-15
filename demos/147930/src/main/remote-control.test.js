import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter, once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import WebSocket from 'ws'

import { createQrMatrix } from './qr-code.js'
import { RemoteServiceController, buildConnectionInfo } from './remote-service-controller.js'
import { createRemoteCoreServer } from '../remote-control/cloud-server.js'
import { normalizeRemoteConfig } from '../remote-control/remote-config.js'
import {
  RemoteLocalDaemon,
  getClaudeGlobalMemoryPath,
  readClaudeGlobalMemory,
  writeClaudeGlobalMemory
} from '../remote-control/local-daemon.js'
import {
  REMOTE_ERROR_CODES,
  REMOTE_MESSAGE_TYPES,
  buildRuntimeRequestFromTask,
  createRemoteError,
  createRemoteMessage,
  parseRemoteMessage
} from '../remote-control/protocol.js'

test('remote protocol creates messages and validates malformed input', () => {
  const message = createRemoteMessage('task.event', { taskId: 'task-1' }, { timestamp: 100 })

  assert.equal(message.type, 'task.event')
  assert.equal(message.timestamp, 100)
  assert.equal(message.payload.taskId, 'task-1')
  assert.ok(message.id.startsWith('msg_'))

  assert.equal(parseRemoteMessage('{').ok, false)
  assert.equal(parseRemoteMessage('{}').error.error.code, REMOTE_ERROR_CODES.BAD_REQUEST)
  assert.deepEqual(createRemoteError('NOPE', 'Nope.'), {
    error: {
      code: 'NOPE',
      message: 'Nope.'
    }
  })
})

test('remote config normalizes string booleans and rejects incomplete TLS configuration', () => {
  const normalized = normalizeRemoteConfig({
    cloud: {
      tls: {
        enabled: 'false'
      }
    }
  })

  assert.equal(normalized.cloud.tls.enabled, false)
  assert.throws(
    () =>
      createRemoteCoreServer({
        config: {
          cloud: {
            tls: {
              enabled: true,
              keyPath: 'missing-key.pem',
              certPath: 'missing-cert.pem'
            }
          }
        }
      }),
    (error) => error?.code === 'TLS_CONFIG_INVALID'
  )
})

test('remote protocol builds runtime requests from task payloads', () => {
  const request = buildRuntimeRequestFromTask(
    {
      taskId: 'task-1',
      prompt: 'read README',
      mode: 'auto',
      permissions: { approvalMode: 'manual' },
      options: { expertMode: 'expert_team' }
    },
    {
      workspace: {
        id: 'workspace-xoder',
        name: 'xoder',
        path: 'F:/workspace'
      }
    }
  )

  assert.equal(request.questId, 'task-1')
  assert.equal(request.prompt, 'read README')
  assert.equal(request.workspace.path, 'F:/workspace')
  assert.equal(request.permissions.approvalMode, 'manual')
  assert.equal(request.options.expertMode, 'expert_team')
})

test('remote cloud API registers daemon, relays tasks, and stores events', async () => {
  const app = createRemoteCoreServer({ pairingCode: '123456' })
  const address = await app.listen(0, '127.0.0.1')
  const baseUrl = `http://127.0.0.1:${address.port}`
  const daemon = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)

  try {
    await once(daemon, 'open')
    const readyPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_READY)
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
          pairingCode: '123456',
          device: {
            id: 'device_win_admin',
            name: 'Windows',
            platform: 'win32',
            workspace: {
              id: 'workspace_xoder',
              name: 'xoder',
              path: 'F:/workspace'
            }
          },
          capabilities: {
            provider: 'claude-code',
            globalMemory: true
          }
        })
      )
    )

    const ready = await readyPromise
    assert.equal(ready.payload.deviceId, 'device_win_admin')

    const unauthorized = await fetchJson(`${baseUrl}/api/devices`)
    assert.equal(unauthorized.status, 401)
    assert.equal(unauthorized.body.error.code, REMOTE_ERROR_CODES.UNAUTHORIZED)

    const devices = await fetchJson(`${baseUrl}/api/devices`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(devices.status, 200)
    assert.equal(devices.body.devices[0].id, 'device_win_admin')
    assert.equal(devices.body.devices[0].online, true)

    const config = await fetchJson(`${baseUrl}/api/config`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(config.status, 200)
    assert.equal(config.body.auth.tokenConfigured, true)
    assert.equal(config.body.auth.tokenPreview, '****')

    const updatedConfig = await fetchJson(`${baseUrl}/api/config`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        taskDefaults: {
          mode: 'fast',
          permissions: {
            allowNetwork: true
          }
        }
      })
    })
    assert.equal(updatedConfig.status, 200)
    assert.equal(updatedConfig.body.taskDefaults.mode, 'fast')
    assert.equal(updatedConfig.body.taskDefaults.permissions.allowNetwork, true)

    const daemonFilesPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_FS_LIST)
    const filesResponsePromise = fetchJson(
      `${baseUrl}/api/devices/device_win_admin/files?path=${encodeURIComponent('F:/workspace')}`,
      {
        headers: { 'x-xoder-token': '123456' }
      }
    )
    const daemonFiles = await daemonFilesPromise
    assert.equal(daemonFiles.payload.path, 'F:/workspace')
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_FS_RESULT, {
          requestId: daemonFiles.payload.requestId,
          path: 'F:/workspace',
          parentPath: 'F:/',
          entries: [
            {
              name: 'project-a',
              path: 'F:/workspace/project-a',
              kind: 'directory',
              isDirectory: true
            }
          ]
        })
      )
    )
    const filesResponse = await filesResponsePromise
    assert.equal(filesResponse.status, 200)
    assert.equal(filesResponse.body.entries[0].path, 'F:/workspace/project-a')

    const daemonGlobalMemoryGetPromise = waitForWsMessage(
      daemon,
      REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_GET
    )
    const globalMemoryGetPromise = fetchJson(`${baseUrl}/api/devices/device_win_admin/global-memory`, {
      headers: { 'x-xoder-token': '123456' }
    })
    const daemonGlobalMemoryGet = await daemonGlobalMemoryGetPromise
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_RESULT, {
          requestId: daemonGlobalMemoryGet.payload.requestId,
          path: 'C:/Users/Admin/.claude/CLAUDE.md',
          content: 'Use pnpm.',
          exists: true,
          size: 9,
          modifiedAt: 100
        })
      )
    )
    const globalMemoryGet = await globalMemoryGetPromise
    assert.equal(globalMemoryGet.status, 200)
    assert.equal(globalMemoryGet.body.content, 'Use pnpm.')

    const daemonGlobalMemorySetPromise = waitForWsMessage(
      daemon,
      REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_SET
    )
    const globalMemorySetPromise = fetchJson(`${baseUrl}/api/devices/device_win_admin/global-memory`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        content: 'Use bun for Claude Code.'
      })
    })
    const daemonGlobalMemorySet = await daemonGlobalMemorySetPromise
    assert.equal(daemonGlobalMemorySet.payload.content, 'Use bun for Claude Code.')
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_GLOBAL_MEMORY_RESULT, {
          requestId: daemonGlobalMemorySet.payload.requestId,
          path: 'C:/Users/Admin/.claude/CLAUDE.md',
          content: 'Use bun for Claude Code.',
          exists: true,
          size: 24,
          modifiedAt: 200,
          savedAt: 201
        })
      )
    )
    const globalMemorySet = await globalMemorySetPromise
    assert.equal(globalMemorySet.status, 200)
    assert.equal(globalMemorySet.body.savedAt, 201)

    const savedWorkspace = await fetchJson(`${baseUrl}/api/workspaces`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        deviceId: 'device_win_admin',
        workspace: {
          name: 'project-a',
          path: 'F:/workspace/project-a'
        }
      })
    })
    assert.equal(savedWorkspace.status, 200)
    assert.equal(savedWorkspace.body.workspace.path, 'F:/workspace/project-a')

    const savedWorkspaces = await fetchJson(`${baseUrl}/api/workspaces`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(savedWorkspaces.status, 200)
    assert.equal(savedWorkspaces.body.workspaces[0].workspace.path, 'F:/workspace/project-a')

    const remoteWindow = await fetchJson(`${baseUrl}/api/windows`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        deviceId: 'device_win_admin',
        workspace: {
          name: 'project-a',
          path: 'F:/workspace/project-a'
        }
      })
    })
    assert.equal(remoteWindow.status, 200)
    assert.ok(remoteWindow.body.windowId.startsWith('window_'))

    const daemonTaskPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_TASK_START)
    const started = await fetchJson(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        deviceId: 'device_win_admin',
        windowId: remoteWindow.body.windowId,
        prompt: 'only reply OK',
        permissions: {
          approvalMode: 'auto'
        }
      })
    })
    assert.equal(started.status, 200)
    assert.equal(started.body.status, 'queued')

    const daemonTask = await daemonTaskPromise
    assert.equal(daemonTask.payload.taskId, started.body.taskId)
    assert.equal(daemonTask.payload.request.prompt, 'only reply OK')
    assert.equal(daemonTask.payload.request.workspace.path, 'F:/workspace/project-a')
    assert.equal(daemonTask.payload.request.options.windowId, remoteWindow.body.windowId)
    assert.equal(daemonTask.payload.request.mode, 'fast')
    assert.equal(daemonTask.payload.request.permissions.approvalMode, 'auto')
    assert.equal(daemonTask.payload.request.permissions.allowNetwork, true)

    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED, {
          taskId: started.body.taskId,
          sessionId: 'session-1'
        })
      )
    )
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.TASK_EVENT, {
          taskId: started.body.taskId,
          sessionId: 'session-1',
          event: {
            id: 'event-1',
            sessionId: 'session-1',
            type: 'session.completed',
            timestamp: 100,
            payload: { result: 'OK' }
          }
        })
      )
    )

    await waitForCondition(() => app.state.tasks.get(started.body.taskId)?.eventCount === 1)
    const task = await fetchJson(`${baseUrl}/api/tasks/${started.body.taskId}`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(task.body.sessionId, 'session-1')
    assert.equal(task.body.status, 'completed')

    const events = await fetchJson(`${baseUrl}/api/tasks/${started.body.taskId}/events`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(events.body.events[0].type, 'session.completed')

    const daemonPermissionPromise = waitForWsMessage(
      daemon,
      REMOTE_MESSAGE_TYPES.DAEMON_PERMISSION_RESPONSE
    )
    const permission = await fetchJson(
      `${baseUrl}/api/tasks/${started.body.taskId}/permissions/perm-1`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-xoder-token': '123456'
        },
        body: JSON.stringify({ allow: true, behavior: 'allow' })
      }
    )
    assert.equal(permission.status, 200)
    const daemonPermission = await daemonPermissionPromise
    assert.equal(daemonPermission.payload.requestId, 'perm-1')

    const audit = await fetchJson(`${baseUrl}/api/tasks/${started.body.taskId}/audit`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(audit.status, 200)
    assert.equal(audit.body.entries.some((event) => event.type === 'permission.decision'), true)

    const daemonStopPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_TASK_STOP)
    const stop = await fetchJson(`${baseUrl}/api/tasks/${started.body.taskId}/stop`, {
      method: 'POST',
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(stop.status, 200)
    const daemonStop = await daemonStopPromise
    assert.equal(daemonStop.payload.sessionId, 'session-1')
  } finally {
    daemon.close()
    await app.close()
  }
})

test('remote event websocket can subscribe to task snapshots and live events', async () => {
  const app = createRemoteCoreServer({ pairingCode: '123456' })
  const address = await app.listen(0, '127.0.0.1')
  const events = new WebSocket(`ws://127.0.0.1:${address.port}/ws/events?token=123456`)
  const devicesPromise = waitForWsMessage(events, REMOTE_MESSAGE_TYPES.DEVICES_UPDATED)

  try {
    app.state.tasks.set('task-1', {
      taskId: 'task-1',
      deviceId: 'device-1',
      sessionId: 'session-1',
      status: 'running',
      createdAt: 1,
      updatedAt: 1,
      eventCount: 1,
      request: {},
      events: [
        {
          id: 'event-1',
          sessionId: 'session-1',
          type: 'message.user',
          timestamp: 1,
          payload: { text: 'hi' }
        }
      ]
    })

    await once(events, 'open')
    await devicesPromise
    const snapshotPromise = waitForWsMessage(events, REMOTE_MESSAGE_TYPES.EVENTS_SNAPSHOT)
    events.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.EVENTS_SUBSCRIBE, {
          taskId: 'task-1'
        })
      )
    )
    const snapshot = await snapshotPromise
    assert.equal(snapshot.payload.events[0].type, 'message.user')
    assert.equal(snapshot.payload.status, 'running')
    assert.equal(snapshot.payload.sessionId, 'session-1')
    assert.equal(snapshot.payload.eventCount, 1)
  } finally {
    events.close()
    await app.close()
  }
})

test('remote cloud marks disconnected tasks interrupted and resumes them after daemon reconnect', async () => {
  const app = createRemoteCoreServer({ pairingCode: '123456' })
  const address = await app.listen(0, '127.0.0.1')
  const baseUrl = `http://127.0.0.1:${address.port}`
  const connectDaemon = () => new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
  const daemon = connectDaemon()
  let taskId = ''

  try {
    await once(daemon, 'open')
    const readyPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_READY)
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
          pairingCode: '123456',
          device: {
            id: 'device-recovery',
            name: 'Recovery Windows',
            platform: 'win32',
            workspace: { name: 'workspace', path: 'F:/workspace' }
          },
          capabilities: {}
        })
      )
    )
    await readyPromise

    const startPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_TASK_START)
    const started = await fetchJson(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        deviceId: 'device-recovery',
        prompt: 'continue after reconnect',
        workspace: { name: 'workspace', path: 'F:/workspace' }
      })
    })
    taskId = started.body.taskId
    await startPromise
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED, {
          taskId,
          sessionId: 'session-recovery'
        })
      )
    )
    await waitForCondition(() => app.state.tasks.get(taskId)?.status === 'running')

    daemon.close()
    await waitForCondition(() => app.state.tasks.get(taskId)?.status === 'interrupted')

    const reconnectedDaemon = connectDaemon()
    try {
      await once(reconnectedDaemon, 'open')
      const recoveredPromise = waitForWsMessage(
        reconnectedDaemon,
        REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVER
      )
      reconnectedDaemon.send(
        JSON.stringify(
          createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
            pairingCode: '123456',
            device: {
              id: 'device-recovery',
              name: 'Recovery Windows',
              platform: 'win32',
              workspace: { name: 'workspace', path: 'F:/workspace' }
            },
            capabilities: {}
          })
        )
      )

      const recovered = await recoveredPromise
      assert.equal(recovered.payload.taskId, taskId)
      assert.equal(recovered.payload.sessionId, 'session-recovery')

      reconnectedDaemon.send(
        JSON.stringify(
          createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED, {
            taskId,
            sessionId: 'session-recovery'
          })
        )
      )
      await waitForCondition(() => app.state.tasks.get(taskId)?.status === 'running')

      const events = await fetchJson(`${baseUrl}/api/tasks/${taskId}/events`, {
        headers: { 'x-xoder-token': '123456' }
      })
      assert.equal(events.body.events.some((event) => event.type === 'session.interrupted'), true)
      assert.equal(events.body.events.some((event) => event.type === 'session.resumed'), true)
    } finally {
      reconnectedDaemon.close()
    }
  } finally {
    daemon.close()
    await app.close()
  }
})

test('remote task summary aggregates files, validation, git, and open questions', async () => {
  const app = createRemoteCoreServer({ pairingCode: '123456' })
  const address = await app.listen(0, '127.0.0.1')
  const baseUrl = `http://127.0.0.1:${address.port}`

  try {
    app.state.tasks.set('task-summary', {
      taskId: 'task-summary',
      deviceId: 'device-1',
      sessionId: 'session-1',
      status: 'completed',
      createdAt: 1,
      updatedAt: 5,
      eventCount: 7,
      request: {
        prompt: 'Implement the morning review.',
        workspace: { name: 'xoder', path: 'F:/workspace/xoder' }
      },
      events: [
        {
          type: 'digital.git.workspace',
          payload: { branch: 'xoder/employee-1', baseBranch: 'main', remote: 'origin' }
        },
        {
          type: 'digital.git.summary',
          payload: {
            status: ' M src/App.tsx\n?? src/Review.tsx',
            diffStat: '2 files changed',
            changedFiles: [' D old.txt']
          }
        },
        {
          type: 'test.completed',
          payload: { name: 'npm test', status: 'passed', summary: '47 passed' }
        },
        {
          type: 'digital.git.committed',
          payload: { hash: 'abc123', title: 'feat: morning review', branch: 'xoder/employee-1' }
        },
        {
          type: 'digital.git.pushed',
          payload: { remote: 'origin', branch: 'xoder/employee-1' }
        },
        {
          type: 'digital.pr.created',
          payload: { url: 'https://github.com/example/xoder/pull/1', title: 'Morning review', number: 1 }
        },
        {
          type: 'digital.question.created',
          payload: { requestId: 'question-1', title: 'Confirm release', summary: 'Review the diff.' }
        }
      ]
    })

    const summary = await fetchJson(`${baseUrl}/api/tasks/task-summary/summary`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(summary.status, 200)
    assert.equal(summary.body.summary.goal, 'Implement the morning review.')
    assert.deepEqual(summary.body.summary.addedFiles, ['src/Review.tsx'])
    assert.deepEqual(summary.body.summary.deletedFiles, ['old.txt'])
    assert.equal(summary.body.summary.git.commitHash, 'abc123')
    assert.equal(summary.body.summary.git.pushed, true)
    assert.equal(summary.body.summary.git.prUrl, 'https://github.com/example/xoder/pull/1')
    assert.equal(summary.body.summary.tests[0].name, 'npm test')
    assert.equal(summary.body.summary.questions[0].status, 'pending')

    const task = await fetchJson(`${baseUrl}/api/tasks/task-summary`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(task.status, 200)
    assert.equal(task.body.summary.git.branch, 'xoder/employee-1')
  } finally {
    await app.close()
  }
})

test('remote cloud persists tasks and events across restarts', async () => {
  const tempRoot = await mkdtemp(join(process.cwd(), '.tmp-remote-core-'))
  const storage = { enabled: true, dataDir: join(tempRoot, 'remote-core-data') }
  let app = createRemoteCoreServer({ pairingCode: '123456', storage })
  let address = await app.listen(0, '127.0.0.1')
  let baseUrl = `http://127.0.0.1:${address.port}`
  const daemon = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)

  try {
    await once(daemon, 'open')
    const readyPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_READY)
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
          pairingCode: '123456',
          device: {
            id: 'device_win_admin',
            name: 'Windows',
            platform: 'win32',
            workspaceMode: 'dynamic'
          },
          capabilities: {
            provider: 'claude-code'
          }
        })
      )
    )
    await readyPromise

    const daemonTaskPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_TASK_START)
    const started = await fetchJson(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        deviceId: 'device_win_admin',
        prompt: 'only reply OK',
        workspace: {
          id: 'workspace_xoder',
          name: 'xoder',
          path: 'F:/workspace/xoder'
        },
        permissions: {
          approvalMode: 'manual'
        }
      })
    })
    assert.equal(started.status, 200)
    await daemonTaskPromise

    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED, {
          taskId: started.body.taskId,
          sessionId: 'session-persisted'
        })
      )
    )
    await waitForCondition(() => app.state.tasks.get(started.body.taskId)?.sessionId === 'session-persisted')

    const daemonPermissionPromise = waitForWsMessage(
      daemon,
      REMOTE_MESSAGE_TYPES.DAEMON_PERMISSION_RESPONSE
    )
    const permission = await fetchJson(
      `${baseUrl}/api/tasks/${started.body.taskId}/permissions/perm-persisted`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-xoder-token': '123456'
        },
        body: JSON.stringify({
          allow: true,
          behavior: 'allow',
          decisionClassification: 'user_temporary'
        })
      }
    )
    assert.equal(permission.status, 200)
    await daemonPermissionPromise

    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.TASK_EVENT, {
          taskId: started.body.taskId,
          sessionId: 'session-persisted',
          event: {
            id: 'event-persisted',
            sessionId: 'session-persisted',
            type: 'session.completed',
            timestamp: 123,
            payload: { result: 'OK' }
          }
        })
      )
    )

    await waitForCondition(() => app.state.tasks.get(started.body.taskId)?.eventCount === 2)
    daemon.close()
    await app.close()

    app = createRemoteCoreServer({ pairingCode: '123456', storage })
    address = await app.listen(0, '127.0.0.1')
    baseUrl = `http://127.0.0.1:${address.port}`

    const task = await fetchJson(`${baseUrl}/api/tasks/${started.body.taskId}`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(task.status, 200)
    assert.equal(task.body.sessionId, 'session-persisted')
    assert.equal(task.body.status, 'completed')
    assert.equal(task.body.eventCount, 2)
    assert.equal(task.body.workspace.path, 'F:/workspace/xoder')

    const tasks = await fetchJson(`${baseUrl}/api/tasks?workspaceId=workspace_xoder`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(tasks.status, 200)
    assert.equal(tasks.body.tasks[0].taskId, started.body.taskId)
    assert.equal(tasks.body.tasks[0].request.prompt, 'only reply OK')

    const events = await fetchJson(`${baseUrl}/api/tasks/${started.body.taskId}/events`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(events.status, 200)
    assert.equal(events.body.events[0].type, 'permission.decision')
    assert.equal(events.body.events[0].payload.requestId, 'perm-persisted')
    assert.equal(events.body.events[1].type, 'session.completed')
  } finally {
    daemon.close()
    await app.close()
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('remote cloud recovers persisted active tasks after a cloud restart', async () => {
  const tempRoot = await mkdtemp(join(process.cwd(), '.tmp-remote-core-restart-'))
  const storage = { enabled: true, dataDir: join(tempRoot, 'remote-core-data') }
  let app = createRemoteCoreServer({ pairingCode: '123456', storage })
  let address = await app.listen(0, '127.0.0.1')
  let baseUrl = `http://127.0.0.1:${address.port}`
  const daemon = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
  let taskId = ''

  try {
    await once(daemon, 'open')
    const ready = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_READY)
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
          pairingCode: '123456',
          device: {
            id: 'device-cloud-restart',
            name: 'Cloud Restart Windows',
            platform: 'win32',
            workspaceMode: 'dynamic'
          },
          capabilities: { provider: 'claude-code' }
        })
      )
    )
    await ready

    const start = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_TASK_START)
    const response = await fetchJson(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        deviceId: 'device-cloud-restart',
        prompt: 'resume after cloud restart',
        workspace: { name: 'workspace', path: 'F:/workspace' }
      })
    })
    taskId = response.body.taskId
    await start
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED, {
          taskId,
          sessionId: 'session-cloud-restart'
        })
      )
    )
    await waitForCondition(() => app.state.tasks.get(taskId)?.status === 'running')

    daemon.close()
    await app.close()

    app = createRemoteCoreServer({ pairingCode: '123456', storage })
    address = await app.listen(0, '127.0.0.1')
    baseUrl = `http://127.0.0.1:${address.port}`

    const restored = await fetchJson(`${baseUrl}/api/tasks/${taskId}`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(restored.body.status, 'interrupted')
    const restoredEvents = await fetchJson(`${baseUrl}/api/tasks/${taskId}/events`, {
      headers: { 'x-xoder-token': '123456' }
    })
    assert.equal(
      restoredEvents.body.events.some((event) => event.type === 'session.interrupted'),
      true
    )

    const reconnected = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
    try {
      await once(reconnected, 'open')
      const recovered = waitForWsMessage(reconnected, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVER)
      reconnected.send(
        JSON.stringify(
          createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
            pairingCode: '123456',
            device: {
              id: 'device-cloud-restart',
              name: 'Cloud Restart Windows',
              platform: 'win32',
              workspaceMode: 'dynamic'
            },
            capabilities: { provider: 'claude-code' }
          })
        )
      )
      const recoverMessage = await recovered
      assert.equal(recoverMessage.payload.taskId, taskId)
      assert.equal(recoverMessage.payload.sessionId, 'session-cloud-restart')

      reconnected.send(
        JSON.stringify(
          createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED, {
            taskId,
            sessionId: 'session-cloud-restart-2'
          })
        )
      )
      await waitForCondition(() => app.state.tasks.get(taskId)?.status === 'running')
    } finally {
      reconnected.close()
    }
  } finally {
    daemon.close()
    await app.close()
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('remote local daemon bridges cloud messages to AgentRuntimeManager', () => {
  const manager = new FakeRuntimeManager()
  const daemon = new RemoteLocalDaemon({
    cloudUrl: 'ws://example.invalid/ws/daemon',
    pairingCode: '123456',
    workspace: 'F:/workspace',
    device: 'Windows',
    manager
  })
  const socket = new FakeSocket()
  daemon.ws = socket

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_START, {
        taskId: 'task-1',
        request: {
          prompt: 'hello',
          workspace: {
            path: 'F:/workspace'
          }
        }
      })
    )
  )

  assert.equal(manager.started[0].prompt, 'hello')
  assert.equal(socket.messages[0].type, REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED)

  manager.emit('event', {
    id: 'event-1',
    sessionId: 'session-1',
    type: 'message.assistant.delta',
    timestamp: 1,
    payload: { text: 'OK' }
  })
  assert.equal(socket.messages[1].type, REMOTE_MESSAGE_TYPES.TASK_EVENT)
  assert.equal(socket.messages[1].payload.taskId, 'task-1')

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_PERMISSION_RESPONSE, {
        taskId: 'task-1',
        sessionId: 'session-1',
        requestId: 'perm-1',
        response: { allow: true }
      })
    )
  )
  assert.deepEqual(manager.permissionResponses[0], {
    sessionId: 'session-1',
    requestId: 'perm-1',
    response: { allow: true }
  })

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_STOP, {
        taskId: 'task-1',
        sessionId: 'session-1'
      })
    )
  )
  assert.equal(manager.stopped[0], 'session-1')
})

test('remote local daemon reuses an existing session when recovering after reconnect', () => {
  const manager = new FakeRuntimeManager()
  const daemon = new RemoteLocalDaemon({
    cloudUrl: 'ws://example.invalid/ws/daemon',
    pairingCode: '123456',
    workspace: 'F:/workspace',
    device: 'Windows',
    manager
  })
  const socket = new FakeSocket()
  daemon.ws = socket
  daemon.taskToSession.set('task-recover-1', 'existing-session')

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVER, {
        taskId: 'task-recover-1',
        sessionId: 'existing-session',
        request: {
          prompt: 'continue the task',
          workspace: { path: 'F:/workspace' }
        }
      })
    )
  )

  assert.equal(manager.started.length, 0)
  assert.equal(socket.messages[0].type, REMOTE_MESSAGE_TYPES.DAEMON_TASK_RECOVERED)
  assert.equal(socket.messages[0].payload.sessionId, 'existing-session')
})

test('remote device lock stops execution and survives daemon reconnect', async () => {
  const app = createRemoteCoreServer({ pairingCode: '123456' })
  const address = await app.listen(0, '127.0.0.1')
  const baseUrl = `http://127.0.0.1:${address.port}`
  const connectDaemon = () => new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
  const daemon = connectDaemon()

  const register = async (socket) => {
    await once(socket, 'open')
    socket.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
          pairingCode: '123456',
          device: {
            id: 'device-lock',
            name: 'Locked Windows',
            platform: 'win32',
            workspace: { name: 'workspace', path: 'F:/workspace' }
          },
          capabilities: { provider: 'fake' }
        })
      )
    )
  }

  try {
    await register(daemon)
    await waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_READY)

    const lockMessagePromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_EXECUTION_LOCK)
    const locked = await fetchJson(`${baseUrl}/api/devices/device-lock/lock`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({ locked: true, reason: 'Night mode lock.' })
    })
    const lockMessage = await lockMessagePromise
    assert.equal(locked.status, 200)
    assert.equal(locked.body.device.locked, true)
    assert.equal(lockMessage.payload.locked, true)

    const rejected = await fetchJson(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xoder-token': '123456'
      },
      body: JSON.stringify({
        deviceId: 'device-lock',
        prompt: 'should be rejected',
        workspace: { path: 'F:/workspace' }
      })
    })
    assert.equal(rejected.status, 423)
    assert.equal(rejected.body.error.code, REMOTE_ERROR_CODES.DEVICE_LOCKED)

    daemon.close()
    await waitForCondition(() => app.state.devices.get('device-lock')?.online === false)

    const reconnected = connectDaemon()
    try {
      const reconnectLockPromise = waitForWsMessage(
        reconnected,
        REMOTE_MESSAGE_TYPES.DAEMON_EXECUTION_LOCK
      )
      await register(reconnected)
      const reconnectLock = await reconnectLockPromise
      assert.equal(reconnectLock.payload.locked, true)
    } finally {
      reconnected.close()
    }
  } finally {
    daemon.close()
    await app.close()
  }
})

test('remote device token rotation binds reconnect authentication', async () => {
  const app = createRemoteCoreServer({ pairingCode: '123456' })
  const address = await app.listen(0, '127.0.0.1')
  const baseUrl = `http://127.0.0.1:${address.port}`
  const daemon = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)

  try {
    await once(daemon, 'open')
    const readyPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_READY)
    daemon.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
          pairingCode: '123456',
          device: { id: 'device-token', name: 'Token Windows', platform: 'win32' },
          capabilities: {}
        })
      )
    )
    await readyPromise

    const tokenMessagePromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_DEVICE_TOKEN)
    const rotated = await fetchJson(`${baseUrl}/api/devices/device-token/token`, {
      method: 'POST',
      headers: { 'x-xoder-token': '123456' },
      body: '{}'
    })
    const tokenMessage = await tokenMessagePromise
    assert.equal(rotated.status, 200)
    assert.equal(rotated.body.deviceToken, tokenMessage.payload.deviceToken)

    daemon.close()
    await waitForCondition(() => app.state.devices.get('device-token')?.online === false)

    const rejected = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
    try {
      await once(rejected, 'open')
      const errorPromise = waitForWsMessage(rejected, REMOTE_MESSAGE_TYPES.ERROR)
      rejected.send(
        JSON.stringify(
          createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
            pairingCode: '123456',
            device: { id: 'device-token', name: 'Token Windows', platform: 'win32' },
            capabilities: {}
          })
        )
      )
      const error = await errorPromise
      assert.equal(error.payload.error.code, REMOTE_ERROR_CODES.UNAUTHORIZED)
    } finally {
      rejected.close()
    }

    const reconnected = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
    try {
      await once(reconnected, 'open')
      const readyWithToken = waitForWsMessage(reconnected, REMOTE_MESSAGE_TYPES.DAEMON_READY)
      reconnected.send(
        JSON.stringify(
          createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
            pairingCode: 'wrong-old-pairing-code',
            deviceToken: rotated.body.deviceToken,
            device: { id: 'device-token', name: 'Token Windows', platform: 'win32' },
            capabilities: {}
          })
        )
      )
      const ready = await readyWithToken
      assert.equal(ready.payload.deviceId, 'device-token')
    } finally {
      reconnected.close()
    }
  } finally {
    daemon.close()
    await app.close()
  }
})

test('remote device token and execution lock survive cloud restart', async () => {
  const tempRoot = await mkdtemp(join(process.cwd(), '.tmp-device-security-'))
  const storage = { enabled: true, dataDir: join(tempRoot, 'remote-core-data') }
  let app = createRemoteCoreServer({ pairingCode: '123456', storage })
  let address = await app.listen(0, '127.0.0.1')
  let daemon = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
  let deviceToken = ''

  const register = async (socket, token = '') => {
    await once(socket, 'open')
    const readyPromise = waitForWsMessage(socket, REMOTE_MESSAGE_TYPES.DAEMON_READY)
    const lockPromise = token
      ? waitForWsMessage(socket, REMOTE_MESSAGE_TYPES.DAEMON_EXECUTION_LOCK)
      : null
    socket.send(
      JSON.stringify(
        createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_HELLO, {
          pairingCode: token ? 'old-pairing-is-ignored' : '123456',
          deviceToken: token,
          device: {
            id: 'device-persisted-security',
            name: 'Persisted Windows',
            platform: 'win32',
            workspaceMode: 'dynamic'
          },
          capabilities: {}
        })
      )
    )

    return {
      ready: await readyPromise,
      lock: lockPromise ? await lockPromise : null
    }
  }

  try {
    await register(daemon)

    const rotated = await fetchJson(`${`http://127.0.0.1:${address.port}`}/api/devices/device-persisted-security/token`, {
      method: 'POST',
      headers: { 'x-xoder-token': '123456' },
      body: '{}'
    })
    assert.equal(rotated.status, 200)
    deviceToken = rotated.body.deviceToken

    const lockPromise = waitForWsMessage(daemon, REMOTE_MESSAGE_TYPES.DAEMON_EXECUTION_LOCK)
    const locked = await fetchJson(
      `${`http://127.0.0.1:${address.port}`}/api/devices/device-persisted-security/lock`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-xoder-token': '123456'
        },
        body: JSON.stringify({ locked: true, reason: 'Persist this lock.' })
      }
    )
    await lockPromise
    assert.equal(locked.body.device.locked, true)

    daemon.close()
    await app.close()

    app = createRemoteCoreServer({ pairingCode: '123456', storage })
    address = await app.listen(0, '127.0.0.1')
    daemon = new WebSocket(`ws://127.0.0.1:${address.port}/ws/daemon`)
    const recovered = await register(daemon, deviceToken)

    assert.equal(recovered.ready.payload.deviceId, 'device-persisted-security')
    assert.equal(recovered.ready.payload.deviceToken, deviceToken)
    assert.equal(recovered.lock.payload.locked, true)
    assert.equal(recovered.lock.payload.reason, 'Persist this lock.')
  } finally {
    daemon.close()
    await app.close()
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('remote local daemon routes digital employee tasks and question responses', () => {
  const manager = new FakeRuntimeManager()
  const digitalEmployeeManager = new FakeDigitalEmployeeManager()
  const daemon = new RemoteLocalDaemon({
    cloudUrl: 'ws://example.invalid/ws/daemon',
    pairingCode: '123456',
    workspace: 'F:/workspace',
    device: 'Windows',
    manager,
    digitalEmployeeManager
  })
  const socket = new FakeSocket()
  daemon.ws = socket

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_START, {
        taskId: 'task-digital-1',
        request: {
          prompt: 'ship it',
          workspace: {
            path: 'F:/workspace'
          },
          permissions: {
            approvalMode: 'manual'
          },
          options: {
            executionMode: 'digital_employee',
            expertMode: 'xoder_digital_team'
          }
        }
      })
    )
  )

  assert.equal(digitalEmployeeManager.started[0].goal, 'ship it')
  assert.equal(socket.messages[0].type, REMOTE_MESSAGE_TYPES.DAEMON_TASK_STARTED)
  assert.equal(socket.messages[0].payload.sessionId, 'job-1')

  digitalEmployeeManager.emit('event', {
    id: 'digital-event-1',
    jobId: 'job-1',
    sessionId: '',
    type: 'digital.question.created',
    timestamp: 1,
    payload: {
      requestId: 'digital-question-1',
      title: 'Confirm push'
    }
  })
  assert.equal(socket.messages[1].type, REMOTE_MESSAGE_TYPES.TASK_EVENT)
  assert.equal(socket.messages[1].payload.taskId, 'task-digital-1')
  assert.equal(socket.messages[1].payload.event.type, 'digital.question.created')

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_PERMISSION_RESPONSE, {
        taskId: 'task-digital-1',
        sessionId: 'job-1',
        requestId: 'digital-question-1',
        response: {
          behavior: 'allow_once'
        }
      })
    )
  )
  assert.deepEqual(digitalEmployeeManager.questionResponses[0], {
    jobId: 'job-1',
    requestId: 'digital-question-1',
    response: {
      behavior: 'allow_once'
    }
  })

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_STOP, {
        taskId: 'task-digital-1'
      })
    )
  )
  assert.equal(digitalEmployeeManager.stopped[0], 'job-1')

  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_PAUSE, {
        taskId: 'task-digital-1'
      })
    )
  )
  daemon.handleSocketMessage(
    JSON.stringify(
      createRemoteMessage(REMOTE_MESSAGE_TYPES.DAEMON_TASK_RESUME, {
        taskId: 'task-digital-1'
      })
    )
  )
  assert.equal(digitalEmployeeManager.paused[0], 'job-1')
  assert.equal(digitalEmployeeManager.resumed[0], 'job-1')
  assert.equal(manager.started.length, 0)
})

test('remote local daemon reads and writes Claude global memory from configured home', async () => {
  const previousConfigDir = process.env.CLAUDE_CONFIG_DIR
  const configDir = await mkdtemp(join(process.cwd(), '.tmp-claude-global-'))
  process.env.CLAUDE_CONFIG_DIR = configDir

  try {
    assert.equal(getClaudeGlobalMemoryPath(), join(configDir, 'CLAUDE.md'))

    const initial = await readClaudeGlobalMemory()
    assert.equal(initial.exists, false)
    assert.equal(initial.content, '')

    const saved = await writeClaudeGlobalMemory('Use bun for Claude Code.')
    assert.equal(saved.exists, true)
    assert.equal(saved.content, 'Use bun for Claude Code.')

    const next = await readClaudeGlobalMemory()
    assert.equal(next.content, 'Use bun for Claude Code.')
    assert.equal(next.path, join(configDir, 'CLAUDE.md'))
  } finally {
    if (previousConfigDir === undefined) {
      delete process.env.CLAUDE_CONFIG_DIR
    } else {
      process.env.CLAUDE_CONFIG_DIR = previousConfigDir
    }

    await rm(configDir, { recursive: true, force: true })
  }
})

test('remote service controller reports three-layer connection status', async () => {
  const controller = new RemoteServiceController({
    projectRoot: process.cwd(),
    getLoginItemSettings: () => ({
      openAtLogin: true,
      openAsHidden: false
    }),
    fetchImpl: async (url) => {
      if (String(url).endsWith('/health')) {
        return jsonResponse({
          ok: true,
          service: 'xoder-remote-core',
          timestamp: 1
        })
      }

      if (String(url).endsWith('/api/devices')) {
        return jsonResponse({
          devices: [
            {
              id: 'device_win_admin',
              name: 'Windows',
              online: true,
              capabilities: {
                provider: 'claude-code',
                tools: ['Read']
              }
            }
          ]
        })
      }

      return jsonResponse({ error: { message: 'not found' } }, 404)
    }
  })

  const status = await controller.getStatus({
    auth: {
      token: '123456'
    },
    cloud: {
      host: '127.0.0.1',
      port: 8787
    },
    daemon: {
      deviceId: 'device_win_admin',
      workspaceMode: 'dynamic'
    }
  })

  assert.equal(status.ok, true)
  assert.equal(status.connection.cloud.ok, true)
  assert.equal(status.connection.daemon.ok, true)
  assert.equal(status.connection.agent.ok, true)
  assert.equal(status.connection.daemon.selectedDevice.name, 'Windows')
  assert.equal(status.connectionInfo.daemonWebSocket, 'ws://127.0.0.1:8787/ws/daemon')
  assert.equal(status.config.loginItem.openAtLogin, true)
})

test('remote service controller builds mobile connection payload', () => {
  const info = buildConnectionInfo({
    auth: {
      token: 'abcdef123456'
    },
    cloud: {
      publicBaseUrl: 'http://192.168.18.13:8787',
      port: 8787
    },
    daemon: {
      cloudUrl: 'ws://127.0.0.1:8787/ws/daemon'
    }
  })

  assert.equal(info.mobileBaseUrl, 'http://192.168.18.13:8787')
  assert.equal(info.tokenPreview, 'abcd...3456')
  assert.match(info.copyText, /Base URL: http:\/\/192\.168\.18\.13:8787/)
  assert.match(info.qrSvg, /^<svg /)
  assert.match(info.qrSvg, /data-qr-standard="true"/)
  assert.match(info.qrSvg, /data-error-correction="L"/)
  assert.match(info.qrSvg, /shape-rendering="crispEdges"/)
  assert.deepEqual(JSON.parse(info.qrPayload), {
    baseUrl: 'http://192.168.18.13:8787',
    token: 'abcdef123456'
  })
})

test('remote service controller switches connection payload to TLS endpoints', () => {
  const info = buildConnectionInfo({
    auth: {
      token: 'abcdef123456'
    },
    cloud: {
      host: '127.0.0.1',
      port: 8787,
      tls: {
        enabled: true
      }
    },
    daemon: {}
  })

  assert.equal(info.apiBaseUrl, 'https://127.0.0.1:8787')
  assert.equal(info.daemonWebSocket, 'wss://127.0.0.1:8787/ws/daemon')
  assert.equal(info.mobileBaseUrl.startsWith('https://'), true)
  assert.equal(info.qrPayload.includes('https://'), true)
})

test('remote service controller reports login item errors without breaking status', async () => {
  const controller = new RemoteServiceController({
    projectRoot: process.cwd(),
    getLoginItemSettings: () => {
      throw new Error('login item unavailable')
    },
    fetchImpl: async (url) => {
      if (String(url).endsWith('/health')) {
        return jsonResponse({ ok: true, service: 'xoder-remote-core', timestamp: 1 })
      }

      return jsonResponse({ devices: [] })
    }
  })

  const status = await controller.getStatus({
    service: {
      autoStart: true,
      startCloudOnAppLaunch: true,
      startDaemonOnAppLaunch: true,
      restartOnCrash: true
    }
  })

  assert.equal(status.config.autoStart, true)
  assert.equal(status.config.startCloudOnAppLaunch, true)
  assert.equal(status.config.startDaemonOnAppLaunch, true)
  assert.equal(status.config.loginItem.openAtLogin, false)
  assert.equal(status.config.loginItem.error, 'login item unavailable')
})

test('remote service controller restarts crashed services but respects manual stop', async () => {
  const children = []
  let spawnAttempts = 0
  const controller = new RemoteServiceController({
    projectRoot: process.cwd(),
    restartDelayMs: 5,
    spawnImpl: () => {
      spawnAttempts += 1

      if (spawnAttempts === 1) {
        throw Object.assign(new Error('temporary spawn failure'), { code: 'EAGAIN' })
      }

      const child = new EventEmitter()
      child.pid = 1000 + spawnAttempts
      child.killed = false
      child.exitCode = null
      child.signalCode = null
      child.stdout = new EventEmitter()
      child.stderr = new EventEmitter()
      child.kill = (signal) => {
        if (child.killed) {
          return
        }

        child.killed = true
        child.exitCode = 0
        child.signalCode = signal || null
        child.emit('exit', 0, signal || null)
      }
      children.push(child)
      return child
    }
  })

  const first = await controller.startService('cloud', 'src/remote-control/cloud-server.js', {
    restartOnCrash: true
  })

  assert.equal(first.ok, false)
  assert.equal(first.error.code, 'EAGAIN')
  await waitForCondition(() => children.length === 1)

  children[0].emit('exit', 1, null)
  await waitForCondition(() => children.length === 2)
  assert.equal(controller.services.cloud.restartCount, 2)

  await controller.stopCloud()
  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(children.length, 2)
  assert.equal(controller.services.cloud.status, 'stopped')
})

test('remote service start waits for cloud health and daemon registration', async () => {
  const children = []
  let healthCalls = 0
  let deviceCalls = 0
  const controller = new RemoteServiceController({
    projectRoot: process.cwd(),
    restartDelayMs: 5,
    fetchImpl: async (url) => {
      if (String(url).endsWith('/health')) {
        healthCalls += 1
        return jsonResponse({ ok: healthCalls >= 2, service: 'xoder-remote-core' })
      }

      deviceCalls += 1
      return jsonResponse({
        devices: deviceCalls >= 2
          ? [{ id: 'device-ready', online: true, capabilities: { provider: 'claude-code' } }]
          : []
      })
    },
    spawnImpl: () => {
      const child = new EventEmitter()
      child.pid = 2000 + children.length
      child.killed = false
      child.exitCode = null
      child.signalCode = null
      child.stdout = new EventEmitter()
      child.stderr = new EventEmitter()
      child.kill = (signal) => {
        child.killed = true
        child.exitCode = 0
        child.signalCode = signal || null
        child.emit('exit', 0, signal || null)
      }
      children.push(child)
      return child
    }
  })
  const config = {
    auth: { token: 'ready-token' },
    cloud: { host: '127.0.0.1', port: 8787 },
    daemon: { deviceId: 'device-ready', workspaceMode: 'dynamic' }
  }

  const cloud = await controller.startCloud({ config, readyTimeoutMs: 500 })
  assert.equal(cloud.ok, true)
  assert.equal(cloud.ready.ok, true)
  assert.ok(healthCalls >= 2)

  const daemon = await controller.startDaemon({ config, readyTimeoutMs: 500 })
  assert.equal(daemon.ok, true)
  assert.equal(daemon.ready.ok, true)
  assert.ok(deviceCalls >= 2)

  await controller.stopAll()
  assert.equal(controller.services.cloud.status, 'stopped')
  assert.equal(controller.services.daemon.status, 'stopped')
})

test('remote service controller reads service log tails and builds diagnostics', async () => {
  const tempRoot = await mkdtemp(join(process.cwd(), '.tmp-remote-logs-'))
  const controller = new RemoteServiceController({
    projectRoot: process.cwd(),
    logsDir: tempRoot,
    configPath: join(tempRoot, 'remote-daemon.config.json'),
    fetchImpl: async (url) => {
      if (String(url).endsWith('/health')) {
        return jsonResponse({ ok: true, service: 'xoder-remote-core', timestamp: 1 })
      }

      return jsonResponse({
        devices: [
          {
            id: 'device-win',
            name: 'Windows',
            online: true,
            capabilities: { provider: 'claude-code', tools: ['Read'] }
          }
        ]
      })
    }
  })

  try {
    await writeFile(join(tempRoot, '.xoder-remote-cloud.log'), 'cloud stdout\n')
    await writeFile(join(tempRoot, '.xoder-remote-cloud.err.log'), 'cloud stderr\n')
    await writeFile(join(tempRoot, '.xoder-remote-daemon.log'), 'daemon stdout\n')
    await writeFile(join(tempRoot, '.xoder-remote-daemon.err.log'), 'daemon stderr\n')

    const logs = await controller.getLogs({ tailBytes: 8 })
    assert.equal(logs.ok, true)
    assert.equal(logs.logsDir, tempRoot)
    assert.equal(logs.services.cloud.stdout.exists, true)
    assert.equal(logs.services.cloud.stdout.truncated, true)
    assert.match(logs.services.cloud.stdout.text, /stdout\n$/)
    assert.match(logs.services.daemon.stderr.text, /stderr\n$/)

    const diagnostics = await controller.buildDiagnostics({
      auth: { token: '123456' },
      daemon: { deviceId: 'device-win', workspaceMode: 'dynamic' },
      cloud: { host: '127.0.0.1', port: 8787 }
    })
    assert.equal(diagnostics.ok, true)
    assert.match(diagnostics.text, /# Xoder Remote Diagnostics/)
    assert.match(diagnostics.text, /Cloud: ok/)
    assert.match(diagnostics.text, /Agent: ok provider=claude-code/)
    assert.match(diagnostics.text, /cloud stderr/)
    assert.match(diagnostics.text, /daemon stdout/)
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('qr encoder creates standard matrix large enough for xoder connection payloads', () => {
  const payload = JSON.stringify({
    baseUrl: 'http://192.168.18.13:8787',
    token: 'abcdef123456'
  })
  const qr = createQrMatrix(payload)

  assert.ok(qr.version >= 4)
  assert.equal(qr.size, qr.version * 4 + 17)
  assert.equal(qr.modules.length, qr.size)
  assert.equal(qr.modules[0].length, qr.size)
  assert.equal(qr.modules[3][3], true)
  assert.equal(qr.modules[3][qr.size - 4], true)
  assert.equal(qr.modules[qr.size - 4][3], true)
})

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  return {
    status: response.status,
    body: await response.json()
  }
}

function jsonResponse(body, status = 200) {
  return {
    status,
    text: async () => JSON.stringify(body)
  }
}

function waitForWsMessage(ws, type) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Timed out waiting for ${type}.`))
    }, 5000)

    function cleanup() {
      clearTimeout(timer)
      ws.off('message', onMessage)
      ws.off('error', onError)
    }

    function onError(error) {
      cleanup()
      reject(error)
    }

    function onMessage(data) {
      const parsed = parseRemoteMessage(data)

      if (parsed.ok && parsed.message.type === type) {
        cleanup()
        resolve(parsed.message)
      }
    }

    ws.on('message', onMessage)
    ws.on('error', onError)
  })
}

async function waitForCondition(predicate) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < 5000) {
    if (predicate()) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error('Timed out waiting for condition.')
}

class FakeRuntimeManager extends EventEmitter {
  constructor() {
    super()
    this.started = []
    this.stopped = []
    this.permissionResponses = []
  }

  startSession(request) {
    this.started.push(request)
    return {
      id: 'session-1'
    }
  }

  stopSession(sessionId) {
    this.stopped.push(sessionId)
    return true
  }

  respondToPermission(sessionId, requestId, response) {
    this.permissionResponses.push({ sessionId, requestId, response })
    return true
  }

  listCapabilities() {
    return {
      provider: 'fake'
    }
  }
}

class FakeDigitalEmployeeManager extends EventEmitter {
  constructor() {
    super()
    this.started = []
    this.stopped = []
    this.paused = []
    this.resumed = []
    this.questionResponses = []
  }

  startJob(request) {
    this.started.push(request)
    return {
      id: 'job-1',
      status: 'queued'
    }
  }

  stopJob(jobId) {
    this.stopped.push(jobId)
    return true
  }

  pauseJob(jobId) {
    this.paused.push(jobId)
    return true
  }

  resumeJob(jobId) {
    this.resumed.push(jobId)
    return true
  }

  respondToQuestion(jobId, requestId, response) {
    this.questionResponses.push({ jobId, requestId, response })
    return true
  }

  stopAll() {}
}

class FakeSocket {
  constructor() {
    this.readyState = 1
    this.messages = []
  }

  send(message) {
    this.messages.push(JSON.parse(message))
  }
}
