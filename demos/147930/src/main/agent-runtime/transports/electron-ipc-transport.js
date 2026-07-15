import { AgentRuntimeManager } from '../runtime-manager.js'

export function registerAgentRuntimeIpc({ ipcMain, manager = new AgentRuntimeManager() }) {
  const webContentsById = new Map()

  manager.on('event', (event) => {
    const session = manager.getSession(event.sessionId)
    const target = session ? webContentsById.get(session.webContentsId) : null

    if (target && !target.isDestroyed()) {
      target.send('agent-runtime:event', sanitizeForIpc(event))
    }
  })

  ipcMain.handle('agent-runtime:start', (event, payload) => {
    webContentsById.set(event.sender.id, event.sender)
    return manager.startSession(payload, {
      webContentsId: event.sender.id
    })
  })

  ipcMain.handle('agent-runtime:stop', (_, sessionId) => {
    return manager.stopSession(sessionId)
  })

  ipcMain.handle('agent-runtime:respond-permission', (_, payload = {}) => {
    const sessionId = String(payload.sessionId || '')
    const requestId = String(payload.requestId || payload.response?.requestId || '')
    return manager.respondToPermission(sessionId, requestId, payload.response || {})
  })

  ipcMain.handle('agent-runtime:run-command', (_, payload = {}) => {
    return manager.runSlashCommand(
      String(payload.sessionId || ''),
      String(payload.command || ''),
      String(payload.args || '')
    )
  })

  ipcMain.handle('agent-runtime:get-session', (_, sessionId) => {
    return manager.getSession(sessionId)
  })

  ipcMain.handle('agent-runtime:list-capabilities', () => {
    return manager.listCapabilities()
  })

  return {
    manager,
    stopSessionsForWebContents(webContentsId) {
      manager.stopSessionsForWebContents(webContentsId)
      webContentsById.delete(webContentsId)
    },
    stopAll() {
      manager.stopAll()
      webContentsById.clear()
    }
  }
}

function sanitizeForIpc(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return {
      id: '',
      sessionId: String(value?.sessionId || ''),
      type: 'runtime.stderr',
      timestamp: Date.now(),
      payload: {
        source: 'main',
        message: 'Failed to serialize agent runtime event for IPC.'
      }
    }
  }
}
