import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

function sanitizeForIpc(value) {
  if (value === undefined) {
    return undefined
  }

  return JSON.parse(JSON.stringify(value))
}

// Custom APIs for renderer
const api = {
  windowControls: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    close: () => ipcRenderer.invoke('window:close'),
    onMaximizedChange: (callback) => {
      const listener = (_, isMaximized) => callback(isMaximized)

      ipcRenderer.on('window:maximized-change', listener)

      return () => ipcRenderer.removeListener('window:maximized-change', listener)
    }
  },
  workspace: {
    openFolder: () => ipcRenderer.invoke('workspace:open-folder')
  },
  xoder: {
    getDeepLink: () => ipcRenderer.invoke('xoder:get-deep-link'),
    onDeepLink: (callback) => {
      const listener = (_, payload) => callback(payload)

      ipcRenderer.on('xoder:deep-link', listener)

      return () => ipcRenderer.removeListener('xoder:deep-link', listener)
    }
  },
  remoteConfig: {
    getLocal: (workspace) =>
      ipcRenderer.invoke(
        'remote-config:get-local',
        sanitizeForIpc({
          workspace
        })
      ),
    saveLocal: (config) =>
      ipcRenderer.invoke(
        'remote-config:save-local',
        sanitizeForIpc({
          config
        })
      ),
    testCloud: (request) => ipcRenderer.invoke('remote-config:test-cloud', sanitizeForIpc(request)),
    getCloud: (request) => ipcRenderer.invoke('remote-config:get-cloud', sanitizeForIpc(request)),
    saveCloud: (request) => ipcRenderer.invoke('remote-config:save-cloud', sanitizeForIpc(request))
  },
  remoteService: {
    getStatus: () => ipcRenderer.invoke('remote-service:get-status'),
    startCloud: () => ipcRenderer.invoke('remote-service:start-cloud'),
    startDaemon: () => ipcRenderer.invoke('remote-service:start-daemon'),
    startAll: () => ipcRenderer.invoke('remote-service:start-all'),
    stopCloud: () => ipcRenderer.invoke('remote-service:stop-cloud'),
    stopDaemon: () => ipcRenderer.invoke('remote-service:stop-daemon'),
    stopAll: () => ipcRenderer.invoke('remote-service:stop-all'),
    setAutoStart: (enabled) =>
      ipcRenderer.invoke(
        'remote-service:set-auto-start',
        sanitizeForIpc({
          enabled: Boolean(enabled)
        })
      ),
    copyConnection: () => ipcRenderer.invoke('remote-service:copy-connection'),
    getLogs: () => ipcRenderer.invoke('remote-service:get-logs'),
    copyDiagnostics: () => ipcRenderer.invoke('remote-service:copy-diagnostics'),
    exportDiagnostics: () => ipcRenderer.invoke('remote-service:export-diagnostics')
  },
  fileSystem: {
    listDirectory: (rootPath, directoryPath) =>
      ipcRenderer.invoke('fs:list-directory', { rootPath, directoryPath }),
    readFile: (rootPath, filePath, options) =>
      ipcRenderer.invoke('fs:read-file', { rootPath, filePath, options }),
    readFileRange: (rootPath, filePath, options) =>
      ipcRenderer.invoke('fs:read-file-range', { rootPath, filePath, options }),
    writeFile: (rootPath, filePath, content) =>
      ipcRenderer.invoke('fs:write-file', { rootPath, filePath, content }),
    createEntry: (rootPath, parentPath, name, kind) =>
      ipcRenderer.invoke('fs:create-entry', { rootPath, parentPath, name, kind }),
    renameEntry: (rootPath, targetPath, name) =>
      ipcRenderer.invoke('fs:rename-entry', { rootPath, targetPath, name }),
    deleteEntry: (rootPath, targetPath) =>
      ipcRenderer.invoke('fs:delete-entry', { rootPath, targetPath })
  },
  terminal: {
    create: (options) => ipcRenderer.invoke('terminal:create', options),
    write: (id, data) => ipcRenderer.invoke('terminal:write', { id, data }),
    complete: (id, input) => ipcRenderer.invoke('terminal:complete', { id, input }),
    kill: (id) => ipcRenderer.invoke('terminal:kill', id),
    onData: (callback) => {
      const listener = (_, payload) => callback(payload)

      ipcRenderer.on('terminal:data', listener)

      return () => ipcRenderer.removeListener('terminal:data', listener)
    },
    onExit: (callback) => {
      const listener = (_, payload) => callback(payload)

      ipcRenderer.on('terminal:exit', listener)

      return () => ipcRenderer.removeListener('terminal:exit', listener)
    }
  },
  agentRuntime: {
    start: (request) => ipcRenderer.invoke('agent-runtime:start', sanitizeForIpc(request)),
    stop: (sessionId) => ipcRenderer.invoke('agent-runtime:stop', String(sessionId || '')),
    respondPermission: (sessionId, requestId, response = {}) =>
      ipcRenderer.invoke(
        'agent-runtime:respond-permission',
        sanitizeForIpc({
          sessionId: String(sessionId || ''),
          requestId: String(requestId || ''),
          response
        })
      ),
    runCommand: (sessionId, command, args = '') =>
      ipcRenderer.invoke(
        'agent-runtime:run-command',
        sanitizeForIpc({
          sessionId: String(sessionId || ''),
          command: String(command || ''),
          args: String(args || '')
        })
      ),
    getSession: (sessionId) =>
      ipcRenderer.invoke('agent-runtime:get-session', String(sessionId || '')),
    listCapabilities: () => ipcRenderer.invoke('agent-runtime:list-capabilities'),
    onEvent: (callback) => {
      const listener = (_, event) => callback(event)

      ipcRenderer.on('agent-runtime:event', listener)

      return () => ipcRenderer.removeListener('agent-runtime:event', listener)
    }
  },
  digitalEmployee: {
    start: (request) => ipcRenderer.invoke('digital-employee:start', sanitizeForIpc(request)),
    stop: (jobId) => ipcRenderer.invoke('digital-employee:stop', String(jobId || '')),
    pause: (jobId) => ipcRenderer.invoke('digital-employee:pause', String(jobId || '')),
    resume: (jobId) => ipcRenderer.invoke('digital-employee:resume', String(jobId || '')),
    getJob: (jobId) => ipcRenderer.invoke('digital-employee:get-job', String(jobId || '')),
    respondQuestion: (jobId, requestId, response = {}) =>
      ipcRenderer.invoke(
        'digital-employee:respond-question',
        sanitizeForIpc({
          jobId: String(jobId || ''),
          requestId: String(requestId || ''),
          response
        })
      ),
    onEvent: (callback) => {
      const listener = (_, event) => callback(event)

      ipcRenderer.on('digital-employee:event', listener)

      return () => ipcRenderer.removeListener('digital-employee:event', listener)
    }
  },
  digitalEmployeeConfig: {
    get: (workspace = null, options = {}) =>
      ipcRenderer.invoke(
        'digital-employee-config:get',
        sanitizeForIpc({
          workspace,
          ...options
        })
      ),
    save: (config, options = {}) =>
      ipcRenderer.invoke(
        'digital-employee-config:save',
        sanitizeForIpc({
          config,
          ...options
        })
      ),
    detectGit: (workspace) =>
      ipcRenderer.invoke(
        'digital-employee-config:detect-git',
        sanitizeForIpc({
          workspace
        })
      )
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
