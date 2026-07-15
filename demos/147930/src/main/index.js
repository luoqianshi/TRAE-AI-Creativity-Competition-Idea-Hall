import { app, shell, BrowserWindow, dialog, ipcMain, session, clipboard } from 'electron'
import { execFile, spawn } from 'child_process'
import { randomBytes } from 'crypto'
import { existsSync, statSync, promises as fs } from 'fs'
import { homedir } from 'os'
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/logoPublic.png?asset'
import { registerAgentRuntimeIpc } from './agent-runtime/index.js'
import { registerDigitalEmployeeIpc } from './digital-employee/index.js'
import {
  getEffectiveDigitalEmployeeConfig,
  mergeDigitalEmployeeStartRequestWithConfig,
  readDigitalEmployeeConfigFile,
  saveDigitalEmployeeConfigFile,
  toPublicDigitalEmployeeConfigResult,
  upsertDigitalEmployeeWorkspaceProfile
} from './digital-employee/config.js'
import { configureElectronStorage } from './electron-storage.js'
import { RemoteServiceController } from './remote-service-controller.js'
import { parseXoderDeepLink } from './deep-link.js'
import { normalizeRemoteConfig } from '../remote-control/remote-config.js'
import { protectWindowCloseShortcut } from './window-shortcuts.js'

// Keep Chromium session data isolated from app config files and dev runs.
configureElectronStorage(app, {
  appName: 'xoder',
  isDev: is.dev
})

if (is.dev) {
  app.commandLine.appendSwitch('disable-http-cache')
}

const terminalSessions = new Map()
let nextTerminalSessionId = 1
let agentRuntimeIpc = null
let digitalEmployeeIpc = null
let remoteServiceController = null
let pendingXoderDeepLink = process.argv.find((value) => String(value).startsWith('xoder://')) || ''
const hasSingleInstanceLock = app.requestSingleInstanceLock()
const FILE_PREVIEW_LIMIT = 1024 * 128
const FILE_RANGE_READ_LIMIT = 1024 * 512
const TEXT_FILE_LIMIT = 1024 * 1024
const FULL_TEXT_FILE_LIMIT = 1024 * 1024 * 20
const IMAGE_PREVIEW_LIMIT = 1024 * 1024 * 12
const IGNORED_DIRECTORY_NAMES = new Set(['.git', 'node_modules', 'out', 'dist'])
const PROTECTED_FILE_NAMES = new Set(['.env'])
const IMAGE_MIME_BY_EXTENSION = new Map([
  ['avif', 'image/avif'],
  ['bmp', 'image/bmp'],
  ['gif', 'image/gif'],
  ['ico', 'image/x-icon'],
  ['jpeg', 'image/jpeg'],
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
  ['svg', 'image/svg+xml'],
  ['webp', 'image/webp']
])

function sendXoderDeepLink(value = '') {
  const payload = parseXoderDeepLink(value)

  if (!payload) {
    return false
  }

  const window = BrowserWindow.getAllWindows()[0]

  if (!window || window.isDestroyed()) {
    return false
  }

  if (window.isMinimized()) {
    window.restore()
  }

  window.focus()
  window.webContents.send('xoder:deep-link', payload)
  return true
}

function isWindowExpanded(window) {
  return Boolean(window?.isMaximized() || window?.isFullScreen())
}

function notifyWindowExpanded(window) {
  if (!window || window.isDestroyed()) {
    return
  }

  window.webContents.send('window:maximized-change', isWindowExpanded(window))
}

function scheduleWindowExpandedUpdate(window) {
  notifyWindowExpanded(window)
  setTimeout(() => notifyWindowExpanded(window), 100)
}

function getTerminalShell() {
  if (process.platform === 'win32') {
    return {
      command: 'cmd.exe',
      args: ['/d', '/k', 'chcp 65001 > nul'],
      name: 'cmd'
    }
  }

  return {
    command: process.env.SHELL || '/bin/bash',
    args: ['-l'],
    name: basename(process.env.SHELL || '/bin/bash')
  }
}

function resolveTerminalCwd(cwd) {
  try {
    if (cwd && existsSync(cwd) && statSync(cwd).isDirectory()) {
      return cwd
    }
  } catch {
    // Fall through to a stable home directory.
  }

  return homedir()
}

function sendTerminalEvent(session, channel, payload) {
  if (!session.webContents || session.webContents.isDestroyed()) {
    return
  }

  session.webContents.send(channel, payload)
}

function createTerminalSession(webContents, options = {}) {
  const shellConfig = getTerminalShell()
  const cwd = resolveTerminalCwd(options.cwd)
  const id = `terminal-${Date.now()}-${nextTerminalSessionId}`
  const name = `${shellConfig.name} ${nextTerminalSessionId}`
  nextTerminalSessionId += 1

  const child = spawn(shellConfig.command, shellConfig.args, {
    cwd,
    env: {
      ...process.env,
      FORCE_COLOR: '1',
      TERM: 'xterm-256color'
    },
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true
  })

  const session = {
    id,
    name,
    cwd,
    shell: shellConfig.name,
    child,
    webContents,
    webContentsId: webContents.id,
    isRunning: true
  }

  terminalSessions.set(id, session)

  child.stdout.on('data', (data) => {
    sendTerminalEvent(session, 'terminal:data', { id, data: data.toString('utf8') })
  })

  child.stderr.on('data', (data) => {
    sendTerminalEvent(session, 'terminal:data', { id, data: data.toString('utf8') })
  })

  child.on('error', (error) => {
    sendTerminalEvent(session, 'terminal:data', {
      id,
      data: `\r\n[terminal error] ${error.message}\r\n`
    })
  })

  child.on('exit', (code, signal) => {
    session.isRunning = false
    terminalSessions.delete(id)
    sendTerminalEvent(session, 'terminal:exit', { id, code, signal })
  })

  return {
    id,
    name,
    cwd,
    shell: shellConfig.name
  }
}

function writeTerminal(id, data) {
  const session = terminalSessions.get(id)

  if (!session || !session.isRunning || session.child.killed) {
    return false
  }

  session.child.stdin.write(data)
  return true
}

function completeTerminalInput(id, input) {
  const session = terminalSessions.get(id)

  if (!session || !session.isRunning || session.child.killed) {
    return { input, matches: [] }
  }

  if (process.platform !== 'win32' || session.shell !== 'powershell') {
    return { input, matches: [] }
  }

  return new Promise((resolveCompletion) => {
    const completionScript = [
      '$payload = [Console]::In.ReadToEnd() | ConvertFrom-Json',
      '$result = TabExpansion2 -inputScript $payload.input -cursorColumn $payload.input.Length',
      '$matches = @($result.CompletionMatches | ForEach-Object { $_.CompletionText })',
      '[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)',
      '[Console]::Out.Write(($matches | ConvertTo-Json -Compress))'
    ].join(';')
    const child = spawn(
      'powershell.exe',
      ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', completionScript],
      {
        cwd: session.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
      }
    )
    let output = ''

    child.stdout.on('data', (data) => {
      output += data.toString('utf8')
    })

    child.on('error', () => {
      resolveCompletion({ input, matches: [] })
    })

    child.on('exit', () => {
      try {
        const parsed = output.trim() ? JSON.parse(output) : []
        const matches = (Array.isArray(parsed) ? parsed : [parsed])
          .map((item) => String(item || '').trim())
          .filter(Boolean)

        resolveCompletion({
          input,
          matches: [...new Set(matches)].slice(0, 30)
        })
      } catch {
        resolveCompletion({ input, matches: [] })
      }
    })

    child.stdin.end(
      JSON.stringify({
        input: String(input || '')
      })
    )
  })
}

function killTerminal(id) {
  const session = terminalSessions.get(id)

  if (!session) {
    return false
  }

  session.isRunning = false
  session.child.kill()
  return true
}

function killTerminalsForWebContents(webContentsId) {
  terminalSessions.forEach((session) => {
    if (session.webContentsId === webContentsId) {
      killTerminal(session.id)
    }
  })
}

function createFileSystemError(message, code = 'FS_ERROR') {
  const error = new Error(message)
  error.code = code
  return error
}

function isPathInside(parentPath, childPath) {
  const pathDifference = relative(parentPath, childPath)

  return Boolean(
    pathDifference === '' || (!pathDifference.startsWith('..') && !isAbsolute(pathDifference))
  )
}

function assertAllowedFileName(name) {
  const normalizedName = String(name || '').trim()
  const normalizedNameLower = normalizedName.toLowerCase()

  if (!normalizedName || normalizedName === '.' || normalizedName === '..') {
    throw createFileSystemError('文件名不能为空', 'INVALID_NAME')
  }

  if (normalizedName.includes('/') || normalizedName.includes('\\')) {
    throw createFileSystemError('文件名不能包含路径分隔符', 'INVALID_NAME')
  }

  if (PROTECTED_FILE_NAMES.has(normalizedNameLower) || normalizedNameLower.startsWith('.env.')) {
    throw createFileSystemError('受保护文件不能操作', 'PROTECTED_FILE')
  }

  return normalizedName
}

function assertNotProtectedPath(targetPath) {
  const segments = resolve(targetPath)
    .split(sep)
    .map((segment) => segment.toLowerCase())

  if (
    segments.some((segment) => PROTECTED_FILE_NAMES.has(segment) || segment.startsWith('.env.'))
  ) {
    throw createFileSystemError('受保护文件不能操作', 'PROTECTED_FILE')
  }
}

async function resolveWorkspaceTarget(rootPath, targetPath, options = {}) {
  if (!rootPath) {
    throw createFileSystemError('未选择工作区', 'NO_WORKSPACE')
  }

  const rootRealPath = await fs.realpath(rootPath)
  const absoluteTargetPath = resolve(targetPath || rootRealPath)
  const pathToCheck = options.parentMustExist
    ? await fs.realpath(dirname(absoluteTargetPath))
    : await fs.realpath(absoluteTargetPath)

  if (!isPathInside(rootRealPath, pathToCheck)) {
    throw createFileSystemError('只能操作当前工作区内的文件', 'OUTSIDE_WORKSPACE')
  }

  assertNotProtectedPath(absoluteTargetPath)

  return {
    rootPath: rootRealPath,
    targetPath: absoluteTargetPath
  }
}

function toFileNode(entry, parentPath) {
  const entryPath = join(parentPath, entry.name)
  const isDirectory = entry.isDirectory()

  return {
    id: entryPath,
    path: entryPath,
    parentPath,
    name: entry.name,
    kind: isDirectory ? 'directory' : 'file',
    extension: isDirectory ? '' : extname(entry.name).slice(1).toLowerCase()
  }
}

async function listWorkspaceDirectory(rootPath, directoryPath) {
  const { targetPath } = await resolveWorkspaceTarget(rootPath, directoryPath || rootPath)
  const stats = await fs.stat(targetPath)

  if (!stats.isDirectory()) {
    throw createFileSystemError('目标不是文件夹', 'NOT_DIRECTORY')
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true })
  const visibleEntries = entries
    .filter((entry) => {
      const entryName = entry.name.toLowerCase()
      return !PROTECTED_FILE_NAMES.has(entryName) && !entryName.startsWith('.env.')
    })
    .filter((entry) => !(entry.isDirectory() && IGNORED_DIRECTORY_NAMES.has(entry.name)))
    .sort((left, right) => {
      if (left.isDirectory() !== right.isDirectory()) {
        return left.isDirectory() ? -1 : 1
      }

      return left.name.localeCompare(right.name, 'zh-Hans-CN', { numeric: true })
    })
  return {
    path: targetPath,
    name: basename(targetPath) || targetPath,
    truncated: false,
    children: visibleEntries.map((entry) => toFileNode(entry, targetPath))
  }
}

async function readWorkspaceFile(rootPath, filePath, options = {}) {
  const { targetPath } = await resolveWorkspaceTarget(rootPath, filePath)
  const stats = await fs.stat(targetPath)
  const shouldReadFull = Boolean(options.full)
  const extension = extname(targetPath).slice(1).toLowerCase()
  const imageMimeType = IMAGE_MIME_BY_EXTENSION.get(extension)

  if (!stats.isFile()) {
    throw createFileSystemError('目标不是文件', 'NOT_FILE')
  }

  if (imageMimeType) {
    if (stats.size > IMAGE_PREVIEW_LIMIT) {
      return {
        path: targetPath,
        name: basename(targetPath),
        binary: true,
        previewType: 'image',
        previewTooLarge: true,
        mimeType: imageMimeType,
        size: stats.size,
        modifiedAt: stats.mtimeMs,
        partial: false,
        loadedSize: 0,
        content: ''
      }
    }

    const imageBuffer = await fs.readFile(targetPath)

    return {
      path: targetPath,
      name: basename(targetPath),
      binary: false,
      previewType: 'image',
      mimeType: imageMimeType,
      size: stats.size,
      modifiedAt: stats.mtimeMs,
      partial: false,
      loadedSize: imageBuffer.length,
      content: '',
      dataUrl: `data:${imageMimeType};base64,${imageBuffer.toString('base64')}`
    }
  }

  if (shouldReadFull && stats.size > FULL_TEXT_FILE_LIMIT) {
    throw createFileSystemError('文件过大，暂不直接打开', 'FILE_TOO_LARGE')
  }

  const shouldPreview = !shouldReadFull && stats.size > TEXT_FILE_LIMIT
  const bytesToRead = shouldPreview ? Math.min(stats.size, FILE_PREVIEW_LIMIT) : stats.size
  const buffer = Buffer.alloc(bytesToRead)
  const fileHandle = await fs.open(targetPath, 'r')
  let bytesRead = 0

  try {
    const result = await fileHandle.read(buffer, 0, bytesToRead, 0)
    bytesRead = result.bytesRead
  } finally {
    await fileHandle.close()
  }

  const contentBuffer = buffer.subarray(0, bytesRead)
  const sample = contentBuffer.subarray(0, Math.min(contentBuffer.length, 8000))

  if (sample.includes(0)) {
    return {
      path: targetPath,
      name: basename(targetPath),
      binary: true,
      size: stats.size,
      modifiedAt: stats.mtimeMs,
      partial: false,
      loadedSize: 0,
      content: ''
    }
  }

  return {
    path: targetPath,
    name: basename(targetPath),
    binary: false,
    size: stats.size,
    modifiedAt: stats.mtimeMs,
    partial: shouldPreview,
    chunkSize: FILE_PREVIEW_LIMIT,
    startOffset: 0,
    endOffset: contentBuffer.length,
    loadedSize: contentBuffer.length,
    content: contentBuffer.toString('utf8')
  }
}

async function readWorkspaceFileRange(rootPath, filePath, options = {}) {
  const { targetPath } = await resolveWorkspaceTarget(rootPath, filePath)
  const stats = await fs.stat(targetPath)
  const extension = extname(targetPath).slice(1).toLowerCase()

  if (!stats.isFile()) {
    throw createFileSystemError('目标不是文件', 'NOT_FILE')
  }

  if (IMAGE_MIME_BY_EXTENSION.has(extension)) {
    throw createFileSystemError('图片文件不支持文本分块读取', 'UNSUPPORTED_PREVIEW')
  }

  const requestedOffset = Math.max(0, Math.floor(Number(options.offset) || 0))
  const requestedLength = Math.max(1, Math.floor(Number(options.length) || FILE_PREVIEW_LIMIT))
  const safeLength = Math.min(requestedLength, FILE_RANGE_READ_LIMIT)
  const startOffset = Math.min(requestedOffset, stats.size)
  const bytesToRead = Math.min(safeLength, Math.max(0, stats.size - startOffset))

  if (bytesToRead === 0) {
    return {
      path: targetPath,
      name: basename(targetPath),
      binary: false,
      size: stats.size,
      modifiedAt: stats.mtimeMs,
      partial: true,
      startOffset,
      endOffset: startOffset,
      loadedSize: 0,
      content: ''
    }
  }

  const buffer = Buffer.alloc(bytesToRead)
  const fileHandle = await fs.open(targetPath, 'r')
  let bytesRead = 0

  try {
    const result = await fileHandle.read(buffer, 0, bytesToRead, startOffset)
    bytesRead = result.bytesRead
  } finally {
    await fileHandle.close()
  }

  const contentBuffer = buffer.subarray(0, bytesRead)
  const sample = contentBuffer.subarray(0, Math.min(contentBuffer.length, 8000))

  if (sample.includes(0)) {
    throw createFileSystemError('二进制文件不支持文本分块读取', 'BINARY_FILE')
  }

  return {
    path: targetPath,
    name: basename(targetPath),
    binary: false,
    size: stats.size,
    modifiedAt: stats.mtimeMs,
    partial: true,
    chunkSize: FILE_PREVIEW_LIMIT,
    startOffset,
    endOffset: startOffset + contentBuffer.length,
    loadedSize: contentBuffer.length,
    content: contentBuffer.toString('utf8')
  }
}

async function writeWorkspaceFile(rootPath, filePath, content) {
  const { targetPath } = await resolveWorkspaceTarget(rootPath, filePath)
  const stats = await fs.stat(targetPath)

  if (!stats.isFile()) {
    throw createFileSystemError('目标不是文件', 'NOT_FILE')
  }

  await fs.writeFile(targetPath, String(content ?? ''), 'utf8')
  const nextStats = await fs.stat(targetPath)

  return {
    path: targetPath,
    name: basename(targetPath),
    size: nextStats.size,
    modifiedAt: nextStats.mtimeMs
  }
}

async function createWorkspaceEntry(rootPath, parentPath, name, kind) {
  const safeName = assertAllowedFileName(name)
  const { targetPath: safeParentPath } = await resolveWorkspaceTarget(rootPath, parentPath, {
    parentMustExist: false
  })
  const parentStats = await fs.stat(safeParentPath)

  if (!parentStats.isDirectory()) {
    throw createFileSystemError('父级不是文件夹', 'NOT_DIRECTORY')
  }

  const newPath = join(safeParentPath, safeName)
  await resolveWorkspaceTarget(rootPath, newPath, { parentMustExist: true })

  if (existsSync(newPath)) {
    throw createFileSystemError('同名文件已存在', 'ALREADY_EXISTS')
  }

  if (kind === 'directory') {
    await fs.mkdir(newPath)
  } else {
    await fs.writeFile(newPath, '', 'utf8')
  }

  return toFileNode(
    {
      name: safeName,
      isDirectory: () => kind === 'directory'
    },
    safeParentPath
  )
}

async function renameWorkspaceEntry(rootPath, targetPath, name) {
  const safeName = assertAllowedFileName(name)
  const { targetPath: safeTargetPath } = await resolveWorkspaceTarget(rootPath, targetPath)
  const stats = await fs.stat(safeTargetPath)
  const parentPath = dirname(safeTargetPath)
  const nextPath = join(parentPath, safeName)

  await resolveWorkspaceTarget(rootPath, nextPath, { parentMustExist: true })

  if (existsSync(nextPath)) {
    throw createFileSystemError('同名文件已存在', 'ALREADY_EXISTS')
  }

  await fs.rename(safeTargetPath, nextPath)

  return {
    ...toFileNode(
      {
        name: safeName,
        isDirectory: () => stats.isDirectory()
      },
      parentPath
    ),
    oldPath: safeTargetPath
  }
}

async function deleteWorkspaceEntry(rootPath, targetPath) {
  const { rootPath: safeRootPath, targetPath: safeTargetPath } = await resolveWorkspaceTarget(
    rootPath,
    targetPath
  )

  if (safeRootPath === safeTargetPath) {
    throw createFileSystemError('不能删除工作区根目录', 'ROOT_DELETE')
  }

  await shell.trashItem(safeTargetPath)

  return {
    path: safeTargetPath,
    parentPath: dirname(safeTargetPath)
  }
}

function getRemoteDaemonConfigPath() {
  return join(app.getPath('userData'), 'remote-daemon.config.json')
}

function createDefaultRemoteDaemonConfig() {
  const deviceName = String(process.env.COMPUTERNAME || process.env.HOSTNAME || 'Local computer').trim()
  const deviceId = `device_${deviceName
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'local'}`

  return normalizeRemoteConfig({
    auth: {
      token: ''
    },
    taskDefaults: {
      mode: 'auto',
      permissions: {
        approvalMode: 'manual',
        allowShell: false,
        allowWrite: true,
        allowNetwork: false
      },
      agent: {
        provider: 'claude-code',
        model: 'default'
      }
    },
    daemon: {
      cloudUrl: '',
      pairingCode: '',
      deviceId,
      deviceName,
      workspaceMode: 'dynamic',
      workspace: {
        id: '',
        name: '',
        path: ''
      }
    },
    service: {
      autoStart: false,
      startCloudOnAppLaunch: false,
      startDaemonOnAppLaunch: false,
      restartOnCrash: true
    }
  })
}

async function readRemoteDaemonConfig() {
  const configPath = getRemoteDaemonConfigPath()
  const fallback = createDefaultRemoteDaemonConfig()

  try {
    const raw = await fs.readFile(configPath, 'utf8')
    const parsed = raw.trim() ? JSON.parse(raw) : {}

    return {
      ok: true,
      exists: true,
      configPath,
      config: normalizeRemoteConfig({
        ...fallback,
        ...parsed,
        auth: {
          ...fallback.auth,
          ...(parsed.auth || {})
        },
        taskDefaults: {
          ...fallback.taskDefaults,
          ...(parsed.taskDefaults || {}),
          permissions: {
            ...fallback.taskDefaults.permissions,
            ...(parsed.taskDefaults?.permissions || {})
          },
          agent: {
            ...fallback.taskDefaults.agent,
            ...(parsed.taskDefaults?.agent || {})
          }
        },
        daemon: {
          ...fallback.daemon,
          ...(parsed.daemon || {}),
          workspace: {
            ...fallback.daemon.workspace,
            ...(parsed.daemon?.workspace || {})
          }
        },
        service: {
          ...fallback.service,
          ...(parsed.service || {})
        }
      })
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error
    }

    return {
      ok: true,
      exists: false,
      configPath,
      config: fallback
    }
  }
}

async function saveRemoteDaemonConfig(payload = {}) {
  const configPath = getRemoteDaemonConfigPath()
  const config = normalizeRemoteConfig(payload?.config || payload || {})

  await fs.mkdir(dirname(configPath), { recursive: true })
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')

  return {
    ok: true,
    exists: true,
    configPath,
    config
  }
}

function getRemoteServiceLogsDir() {
  return join(app.getPath('userData'), 'remote-service-logs')
}

function getRemoteServiceController() {
  if (!remoteServiceController) {
    remoteServiceController = new RemoteServiceController({
      projectRoot: getRemoteServiceProjectRoot(),
      configPath: getRemoteDaemonConfigPath(),
      logsDir: getRemoteServiceLogsDir(),
      getLoginItemSettings: (options) => app.getLoginItemSettings(options)
    })
  }

  remoteServiceController.setConfigPath(getRemoteDaemonConfigPath())
  return remoteServiceController
}

function getRemoteServiceProjectRoot() {
  const packagedRoot = process.resourcesPath ? join(process.resourcesPath, 'remote-core') : ''

  if (packagedRoot && existsSync(join(packagedRoot, 'src', 'remote-control', 'cloud-server.js'))) {
    return packagedRoot
  }

  return resolve(__dirname, '../..')
}

function createRemotePairingToken() {
  return randomBytes(12).toString('hex')
}

async function ensureRemoteServiceConfig(overrides = {}) {
  const current = await readRemoteDaemonConfig()
  const configPath = current.configPath || getRemoteDaemonConfigPath()
  const config = normalizeRemoteConfig(current.config)
  const token = config.auth.token || config.daemon.pairingCode || createRemotePairingToken()
  const port = config.cloud.port || 8787
  const cloudUrl =
    config.daemon.cloudUrl ||
    `${config.cloud.tls?.enabled ? 'wss' : 'ws'}://127.0.0.1:${port}/ws/daemon`
  const nextConfig = normalizeRemoteConfig({
    ...config,
    ...overrides,
    auth: {
      ...config.auth,
      ...(overrides.auth || {}),
      token: overrides.auth?.token || token
    },
    daemon: {
      ...config.daemon,
      ...(overrides.daemon || {}),
      cloudUrl: overrides.daemon?.cloudUrl || cloudUrl,
      pairingCode: overrides.daemon?.pairingCode || config.daemon.pairingCode || token,
      workspaceMode: 'dynamic',
      workspace: {
        id: '',
        name: '',
        path: ''
      }
    },
    service: {
      ...config.service,
      restartOnCrash: true,
      ...(overrides.service || {})
    }
  })

  if (JSON.stringify(config) !== JSON.stringify(nextConfig)) {
    await saveRemoteDaemonConfig({ config: nextConfig })
  } else if (!existsSync(configPath)) {
    await saveRemoteDaemonConfig({ config: nextConfig })
  }

  return {
    configPath,
    config: nextConfig
  }
}

async function getRemoteServiceStatus() {
  const controller = getRemoteServiceController()
  const current = await readRemoteDaemonConfig()
  return controller.getStatus(current.config)
}

async function startRemoteCloud() {
  const { configPath, config } = await ensureRemoteServiceConfig()
  const controller = getRemoteServiceController()
  controller.setConfigPath(configPath)
  const result = await controller.startCloud({
    configPath,
    config,
    restartOnCrash: config.service.restartOnCrash
  })

  return {
    ...result,
    status: await controller.getStatus(config)
  }
}

async function startRemoteDaemon() {
  const { configPath, config } = await ensureRemoteServiceConfig()
  const controller = getRemoteServiceController()
  controller.setConfigPath(configPath)
  const result = await controller.startDaemon({
    configPath,
    config,
    restartOnCrash: config.service.restartOnCrash
  })

  return {
    ...result,
    status: await controller.getStatus(config)
  }
}

async function startRemoteServices() {
  const { configPath, config } = await ensureRemoteServiceConfig()
  const controller = getRemoteServiceController()
  controller.setConfigPath(configPath)
  return controller.startAll({
    configPath,
    config,
    restartOnCrash: config.service.restartOnCrash
  })
}

async function stopRemoteCloud() {
  const controller = getRemoteServiceController()
  const result = await controller.stopCloud()
  return {
    ...result,
    status: await controller.getStatus()
  }
}

async function stopRemoteDaemon() {
  const controller = getRemoteServiceController()
  const result = await controller.stopDaemon()
  return {
    ...result,
    status: await controller.getStatus()
  }
}

async function stopRemoteServices() {
  return getRemoteServiceController().stopAll()
}

async function setRemoteServiceAutoStart(payload = {}) {
  const enabled = Boolean(payload.enabled)
  const { configPath, config } = await ensureRemoteServiceConfig({
    service: {
      autoStart: enabled,
      startCloudOnAppLaunch: enabled,
      startDaemonOnAppLaunch: enabled,
      restartOnCrash: true
    }
  })

  let loginItem = null
  let loginItemError = ''

  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      args: ['--xoder-start-remote']
    })
    loginItem = app.getLoginItemSettings({ args: ['--xoder-start-remote'] })
  } catch (error) {
    loginItemError = error?.message || 'Failed to update login item settings.'
  }

  const controller = getRemoteServiceController()
  controller.setConfigPath(configPath)

  return {
    ok: !loginItemError,
    enabled,
    loginItem,
    error: loginItemError ? { code: 'LOGIN_ITEM_FAILED', message: loginItemError } : null,
    status: await controller.getStatus(config)
  }
}

async function copyRemoteConnectionInfo() {
  const { config } = await ensureRemoteServiceConfig()
  const status = await getRemoteServiceController().getStatus(config)
  clipboard.writeText(status.connectionInfo.copyText || status.connectionInfo.qrPayload || '')

  return {
    ok: true,
    copied: status.connectionInfo.copyText,
    status
  }
}

async function getRemoteServiceLogs() {
  return getRemoteServiceController().getLogs()
}

async function copyRemoteDiagnostics() {
  const { config } = await ensureRemoteServiceConfig()
  const diagnostics = await getRemoteServiceController().buildDiagnostics(config)
  clipboard.writeText(diagnostics.text || '')

  return {
    ok: true,
    copied: diagnostics.text,
    diagnostics
  }
}

async function exportRemoteDiagnostics() {
  const { config } = await ensureRemoteServiceConfig()
  return getRemoteServiceController().exportDiagnostics(config)
}

async function maybeAutoStartRemoteServices() {
  const current = await readRemoteDaemonConfig()
  const config = normalizeRemoteConfig(current.config)
  const launchedForRemote = process.argv.includes('--xoder-start-remote')
  const shouldStart =
    launchedForRemote ||
    config.service.autoStart ||
    config.service.startCloudOnAppLaunch ||
    config.service.startDaemonOnAppLaunch

  if (!shouldStart) {
    return
  }

  const { configPath, config: ensuredConfig } = await ensureRemoteServiceConfig()
  const controller = getRemoteServiceController()
  controller.setConfigPath(configPath)

  if (launchedForRemote || ensuredConfig.service.startCloudOnAppLaunch || ensuredConfig.service.autoStart) {
    await controller.startCloud({
      configPath,
      config: ensuredConfig,
      restartOnCrash: ensuredConfig.service.restartOnCrash
    })
  }

  if (launchedForRemote || ensuredConfig.service.startDaemonOnAppLaunch || ensuredConfig.service.autoStart) {
    await controller.startDaemon({
      configPath,
      config: ensuredConfig,
      restartOnCrash: ensuredConfig.service.restartOnCrash
    })
  }
}

function getDigitalEmployeeConfigPath() {
  return join(app.getPath('userData'), 'digital-employee.config.json')
}

async function readDigitalEmployeeConfig(options = {}) {
  const result = await readDigitalEmployeeConfigFile(getDigitalEmployeeConfigPath())
  const scope = await resolveDigitalEmployeeConfigScope(options.workspace)
  const config =
    scope.mode === 'workspace'
      ? getEffectiveDigitalEmployeeConfig(result.config, scope.key)
      : result.config
  const scopedResult = {
    ...result,
    scope,
    config
  }

  return options.includeSecrets ? scopedResult : toPublicDigitalEmployeeConfigResult(scopedResult)
}

async function saveDigitalEmployeeConfig(payload = {}) {
  const configPath = getDigitalEmployeeConfigPath()
  const input = payload?.config || payload || {}
  const scopeMode = String(payload?.scope || input.scope || 'global')
  const workspace = payload?.workspace || input.workspace || null

  if (scopeMode === 'workspace') {
    const current = await readDigitalEmployeeConfigFile(configPath)
    const scope = await resolveDigitalEmployeeConfigScope(workspace)

    if (scope.mode !== 'workspace') {
      const error = new Error('Workspace path is required for workspace digital employee config.')
      error.code = 'NO_WORKSPACE'
      throw error
    }

    const config = upsertDigitalEmployeeWorkspaceProfile(current.config, scope, input)
    const saved = await saveDigitalEmployeeConfigFile(configPath, config)
    const scopedResult = {
      ...saved,
      scope,
      config: getEffectiveDigitalEmployeeConfig(saved.config, scope.key)
    }

    return toPublicDigitalEmployeeConfigResult(scopedResult)
  }

  const result = await saveDigitalEmployeeConfigFile(configPath, input)

  return toPublicDigitalEmployeeConfigResult(result)
}

async function prepareDigitalEmployeeStartRequest(payload = {}) {
  const result = await readDigitalEmployeeConfig({
    includeSecrets: true,
    workspace: payload?.workspace
  })

  return mergeDigitalEmployeeStartRequestWithConfig(payload, result.config)
}

async function detectDigitalEmployeeGitInfo(payload = {}) {
  const workspace = payload?.workspace || payload || {}
  const workspacePath = String(workspace?.path || '').trim()

  if (!workspacePath) {
    return {
      ok: false,
      error: {
        code: 'NO_WORKSPACE',
        message: 'Workspace path is required.'
      }
    }
  }

  const repoRoot = await detectGitRoot(workspacePath)

  if (!repoRoot) {
    return {
      ok: false,
      workspace,
      error: {
        code: 'NO_GIT_REPOSITORY',
        message: 'Current workspace is not inside a Git repository.'
      }
    }
  }

  const [remoteOutput, currentBranchOutput] = await Promise.all([
    execGit(['remote', '-v'], repoRoot).catch(() => ''),
    execGit(['branch', '--show-current'], repoRoot).catch(() => '')
  ])
  const remotes = parseGitRemotes(remoteOutput)
  const selectedRemote = choosePreferredGitRemote(remotes)
  const defaultBranch = selectedRemote?.name
    ? await detectGitDefaultBranch(repoRoot, selectedRemote.name, currentBranchOutput.trim())
    : currentBranchOutput.trim()
  const provider = selectedRemote ? detectGitProvider(selectedRemote.fetchUrl || selectedRemote.pushUrl) : 'generic'

  return {
    ok: true,
    workspace,
    repo: {
      root: repoRoot,
      currentBranch: currentBranchOutput.trim(),
      defaultBranch,
      provider
    },
    remotes,
    selectedRemote,
    suggested: {
      provider,
      remote: selectedRemote?.name || '',
      baseBranch: defaultBranch,
      branchPrefix: `xoder/${basename(repoRoot).replace(/[^A-Za-z0-9_-]+/g, '-').toLowerCase() || 'employee'}`
    }
  }
}

async function resolveDigitalEmployeeConfigScope(workspace = {}) {
  const workspacePath = String(workspace?.path || '').trim()

  if (!workspacePath) {
    return {
      mode: 'global',
      key: '',
      name: 'Global defaults',
      workspacePath: '',
      repoRoot: ''
    }
  }

  const repoRoot = await detectGitRoot(workspacePath)
  const rootPath = repoRoot || workspacePath
  const resolvedRoot = resolve(rootPath)

  return {
    mode: 'workspace',
    key: resolvedRoot.toLowerCase(),
    name: String(workspace?.name || basename(resolvedRoot) || resolvedRoot).trim(),
    workspacePath,
    repoRoot: resolvedRoot
  }
}

function detectGitRoot(workspacePath) {
  return new Promise((resolveRoot) => {
    if (!workspacePath || !existsSync(workspacePath)) {
      resolveRoot('')
      return
    }

    execFile(
      'git',
      ['rev-parse', '--show-toplevel'],
      {
        cwd: workspacePath,
        windowsHide: true,
        timeout: 8000
      },
      (error, stdout) => {
        resolveRoot(error ? '' : String(stdout || '').trim())
      }
    )
  })
}

function execGit(args, cwd) {
  return new Promise((resolveOutput, rejectOutput) => {
    execFile(
      'git',
      args,
      {
        cwd,
        windowsHide: true,
        timeout: 8000
      },
      (error, stdout) => {
        if (error) {
          rejectOutput(error)
          return
        }

        resolveOutput(String(stdout || '').trim())
      }
    )
  })
}

function parseGitRemotes(output = '') {
  const remotesByName = new Map()

  for (const line of String(output || '').split(/\r?\n/)) {
    const match = line.trim().match(/^(\S+)\s+(.+?)\s+\((fetch|push)\)$/)

    if (!match) {
      continue
    }

    const [, name, url, kind] = match
    const current = remotesByName.get(name) || {
      name,
      fetchUrl: '',
      pushUrl: '',
      provider: 'generic'
    }

    if (kind === 'fetch') {
      current.fetchUrl = url
    } else {
      current.pushUrl = url
    }

    current.provider = detectGitProvider(current.fetchUrl || current.pushUrl)
    remotesByName.set(name, current)
  }

  return [...remotesByName.values()]
}

function choosePreferredGitRemote(remotes = []) {
  return (
    remotes.find((remote) => remote.name === 'github') ||
    remotes.find((remote) => remote.name === 'origin') ||
    remotes.find((remote) => remote.provider === 'github') ||
    remotes[0] ||
    null
  )
}

async function detectGitDefaultBranch(repoRoot, remoteName, currentBranch = '') {
  const symbolicRef = await execGit(['symbolic-ref', `refs/remotes/${remoteName}/HEAD`], repoRoot).catch(
    () => ''
  )

  if (symbolicRef) {
    return symbolicRef.replace(`refs/remotes/${remoteName}/`, '').trim()
  }

  const configuredMerge = await execGit(['config', '--get', 'branch.main.merge'], repoRoot).catch(
    () => ''
  )

  if (configuredMerge) {
    return configuredMerge.replace('refs/heads/', '').trim()
  }

  if (currentBranch) {
    return currentBranch
  }

  return 'main'
}

function detectGitProvider(remoteUrl = '') {
  const value = String(remoteUrl || '').toLowerCase()

  if (value.includes('github.com')) {
    return 'github'
  }

  if (value.includes('gitee.com')) {
    return 'gitee'
  }

  if (value.includes('gitlab.')) {
    return 'gitlab'
  }

  return 'generic'
}

async function testRemoteCloudConnection(payload = {}) {
  const apiBaseUrl = normalizeRemoteApiBaseUrl(payload.apiBaseUrl || payload.publicBaseUrl || '')
  const token = String(payload.token || '').trim()

  if (!apiBaseUrl) {
    return {
      ok: false,
      error: {
        code: 'NO_REMOTE_URL',
        message: 'Remote API URL is required.'
      }
    }
  }

  try {
    const health = await fetchRemoteJson(`${apiBaseUrl}/health`)
    const devices = token
      ? await fetchRemoteJson(`${apiBaseUrl}/api/devices`, { token })
      : {
          status: 0,
          body: {
            devices: []
          }
        }

    return {
      ok: health.status >= 200 && health.status < 300 && (!token || devices.status < 400),
      apiBaseUrl,
      health: health.body,
      devices: devices.body?.devices || [],
      status: {
        health: health.status,
        devices: devices.status
      }
    }
  } catch (error) {
    return {
      ok: false,
      apiBaseUrl,
      error: {
        code: 'REMOTE_CONNECT_FAILED',
        message: error?.message || 'Failed to connect remote core.'
      }
    }
  }
}

async function getRemoteCloudConfig(payload = {}) {
  const apiBaseUrl = normalizeRemoteApiBaseUrl(payload.apiBaseUrl || payload.publicBaseUrl || '')
  const token = String(payload.token || '').trim()

  if (!apiBaseUrl) {
    return {
      ok: false,
      status: 0,
      config: null,
      error: {
        code: 'NO_REMOTE_URL',
        message: 'Remote API URL is required.'
      }
    }
  }

  const response = await fetchRemoteJson(`${apiBaseUrl}/api/config`, { token })

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    config: response.body,
    error: response.status >= 400 ? response.body?.error : null
  }
}

async function saveRemoteCloudConfig(payload = {}) {
  const apiBaseUrl = normalizeRemoteApiBaseUrl(payload.apiBaseUrl || payload.publicBaseUrl || '')
  const token = String(payload.token || '').trim()

  if (!apiBaseUrl) {
    return {
      ok: false,
      status: 0,
      config: null,
      error: {
        code: 'NO_REMOTE_URL',
        message: 'Remote API URL is required.'
      }
    }
  }

  const response = await fetchRemoteJson(`${apiBaseUrl}/api/config`, {
    method: 'PATCH',
    token,
    body: payload.patch || payload.config || {}
  })

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    config: response.body,
    error: response.status >= 400 ? response.body?.error : null
  }
}

function normalizeRemoteApiBaseUrl(value = '') {
  const raw = String(value || '').trim()

  if (!raw) {
    return ''
  }

  try {
    const url = new URL(raw)

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
    return raw.replace(/\/$/, '')
  }
}

async function fetchRemoteJson(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeout || 8000)

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...(options.token ? { 'x-xoder-token': options.token } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    })
    const text = await response.text()

    let body = {}

    try {
      body = text ? JSON.parse(text) : {}
    } catch {
      body = {
        error: {
          code: 'INVALID_REMOTE_RESPONSE',
          message: text || 'Remote server returned a non-JSON response.'
        }
      }
    }

    return {
      status: response.status,
      body
    }
  } finally {
    clearTimeout(timeout)
  }
}

function toIpcPayload(value) {
  if (value === undefined) {
    return undefined
  }

  return JSON.parse(JSON.stringify(value))
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  protectWindowCloseShortcut(mainWindow)
  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingXoderDeepLink) {
      const deepLink = pendingXoderDeepLink
      setTimeout(() => sendXoderDeepLink(deepLink), 250)
    }
  })
  ;['maximize', 'unmaximize', 'enter-full-screen', 'leave-full-screen', 'resize'].forEach(
    (eventName) => {
      mainWindow.on(eventName, () => scheduleWindowExpandedUpdate(mainWindow))
    }
  )

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

}

function registerXoderProtocol() {
  try {
    if (process.defaultApp && process.argv[1]) {
      app.setAsDefaultProtocolClient('xoder', process.execPath, [resolve(process.argv[1])])
    } else {
      app.setAsDefaultProtocolClient('xoder')
    }
  } catch (error) {
    console.warn('Failed to register xoder:// protocol:', error?.message || error)
  }
}

function configureMediaPermissions() {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback, details) => {
      const isAudioRequest =
        permission === 'media' &&
        Array.isArray(details?.mediaTypes) &&
        details.mediaTypes.includes('audio') &&
        !details.mediaTypes.includes('video')

      callback(isAudioRequest)
    }
  )
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if (hasSingleInstanceLock) {
  app.on('second-instance', (_event, commandLine) => {
    const deepLink = commandLine.find((value) => String(value).startsWith('xoder://'))

    if (deepLink) {
      pendingXoderDeepLink = deepLink
      sendXoderDeepLink(deepLink)
    }
  })
}

app.whenReady().then(() => {
  if (!hasSingleInstanceLock) {
    app.quit()
    return
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  registerXoderProtocol()
  configureMediaPermissions()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('xoder:get-deep-link', () => {
    const payload = parseXoderDeepLink(pendingXoderDeepLink)
    pendingXoderDeepLink = ''
    return payload
  })
  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.handle('window:toggle-maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)

    if (!window) {
      return false
    }

    if (window.isFullScreen()) {
      window.setFullScreen(false)
    } else if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }

    return isWindowExpanded(window)
  })
  ipcMain.handle('window:is-maximized', (event) => {
    return isWindowExpanded(BrowserWindow.fromWebContents(event.sender))
  })
  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
  ipcMain.handle('workspace:open-folder', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const options = {
      title: '打开文件夹',
      properties: ['openDirectory', 'createDirectory', 'multiSelections']
    }
    const result = window
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true }
    }

    const folders = result.filePaths.map((folderPath) => ({
      path: folderPath,
      name: basename(folderPath) || folderPath
    }))
    const firstFolder = folders[0]

    return {
      canceled: false,
      folders,
      path: firstFolder.path,
      name: firstFolder.name
    }
  })
  ipcMain.handle('remote-config:get-local', async (_, payload) => {
    return toIpcPayload(await readRemoteDaemonConfig(payload?.workspace))
  })
  ipcMain.handle('remote-config:save-local', async (_, payload) => {
    return toIpcPayload(await saveRemoteDaemonConfig(payload))
  })
  ipcMain.handle('remote-config:test-cloud', async (_, payload) => {
    return toIpcPayload(await testRemoteCloudConnection(payload))
  })
  ipcMain.handle('remote-config:get-cloud', async (_, payload) => {
    return toIpcPayload(await getRemoteCloudConfig(payload))
  })
  ipcMain.handle('remote-config:save-cloud', async (_, payload) => {
    return toIpcPayload(await saveRemoteCloudConfig(payload))
  })
  ipcMain.handle('remote-service:get-status', async () => {
    return toIpcPayload(await getRemoteServiceStatus())
  })
  ipcMain.handle('remote-service:start-cloud', async () => {
    return toIpcPayload(await startRemoteCloud())
  })
  ipcMain.handle('remote-service:start-daemon', async () => {
    return toIpcPayload(await startRemoteDaemon())
  })
  ipcMain.handle('remote-service:start-all', async () => {
    return toIpcPayload(await startRemoteServices())
  })
  ipcMain.handle('remote-service:stop-cloud', async () => {
    return toIpcPayload(await stopRemoteCloud())
  })
  ipcMain.handle('remote-service:stop-daemon', async () => {
    return toIpcPayload(await stopRemoteDaemon())
  })
  ipcMain.handle('remote-service:stop-all', async () => {
    return toIpcPayload(await stopRemoteServices())
  })
  ipcMain.handle('remote-service:set-auto-start', async (_, payload) => {
    return toIpcPayload(await setRemoteServiceAutoStart(payload))
  })
  ipcMain.handle('remote-service:copy-connection', async () => {
    return toIpcPayload(await copyRemoteConnectionInfo())
  })
  ipcMain.handle('remote-service:get-logs', async () => {
    return toIpcPayload(await getRemoteServiceLogs())
  })
  ipcMain.handle('remote-service:copy-diagnostics', async () => {
    return toIpcPayload(await copyRemoteDiagnostics())
  })
  ipcMain.handle('remote-service:export-diagnostics', async () => {
    return toIpcPayload(await exportRemoteDiagnostics())
  })
  ipcMain.handle('digital-employee-config:get', (_, payload) => {
    return readDigitalEmployeeConfig(payload || {})
  })
  ipcMain.handle('digital-employee-config:save', (_, payload) => {
    return saveDigitalEmployeeConfig(payload)
  })
  ipcMain.handle('digital-employee-config:detect-git', (_, payload) => {
    return detectDigitalEmployeeGitInfo(payload)
  })
  ipcMain.handle('fs:list-directory', (_, payload) => {
    return listWorkspaceDirectory(payload?.rootPath, payload?.directoryPath)
  })
  ipcMain.handle('fs:read-file', (_, payload) => {
    return readWorkspaceFile(payload?.rootPath, payload?.filePath, payload?.options)
  })
  ipcMain.handle('fs:read-file-range', (_, payload) => {
    return readWorkspaceFileRange(payload?.rootPath, payload?.filePath, payload?.options)
  })
  ipcMain.handle('fs:write-file', (_, payload) => {
    return writeWorkspaceFile(payload?.rootPath, payload?.filePath, payload?.content)
  })
  ipcMain.handle('fs:create-entry', (_, payload) => {
    return createWorkspaceEntry(
      payload?.rootPath,
      payload?.parentPath,
      payload?.name,
      payload?.kind
    )
  })
  ipcMain.handle('fs:rename-entry', (_, payload) => {
    return renameWorkspaceEntry(payload?.rootPath, payload?.targetPath, payload?.name)
  })
  ipcMain.handle('fs:delete-entry', (_, payload) => {
    return deleteWorkspaceEntry(payload?.rootPath, payload?.targetPath)
  })
  ipcMain.handle('terminal:create', (event, options) => {
    return createTerminalSession(event.sender, options)
  })
  ipcMain.handle('terminal:write', (_, payload) => {
    return writeTerminal(payload?.id, payload?.data ?? '')
  })
  ipcMain.handle('terminal:complete', (_, payload) => {
    return completeTerminalInput(payload?.id, payload?.input ?? '')
  })
  ipcMain.handle('terminal:kill', (_, id) => {
    return killTerminal(id)
  })
  agentRuntimeIpc = registerAgentRuntimeIpc({ ipcMain })
  digitalEmployeeIpc = registerDigitalEmployeeIpc({
    ipcMain,
    agentRuntimeManager: agentRuntimeIpc.manager,
    prepareRequest: prepareDigitalEmployeeStartRequest
  })
  maybeAutoStartRemoteServices().catch((error) => {
    console.error('Failed to auto-start Xoder remote services:', error)
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('web-contents-created', (_, contents) => {
  contents.on('destroyed', () => {
    killTerminalsForWebContents(contents.id)
    agentRuntimeIpc?.stopSessionsForWebContents(contents.id)
    digitalEmployeeIpc?.stopJobsForWebContents(contents.id)
  })
})

app.on('before-quit', () => {
  terminalSessions.forEach((session) => {
    killTerminal(session.id)
  })
  agentRuntimeIpc?.stopAll()
  digitalEmployeeIpc?.stopAll()
  remoteServiceController?.stopAll?.()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
