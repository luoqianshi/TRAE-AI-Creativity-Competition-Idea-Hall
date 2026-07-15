import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { DEFAULT_EVENT_HISTORY_LIMIT, DEFAULT_REMOTE_PORT, isRecord, normalizeWorkspace } from './protocol.js'

export const DEFAULT_REMOTE_CONFIG = Object.freeze({
  schemaVersion: 1,
  cloud: {
    host: '0.0.0.0',
    port: DEFAULT_REMOTE_PORT,
    publicBaseUrl: '',
    eventHistoryLimit: DEFAULT_EVENT_HISTORY_LIMIT,
    dataDir: '',
    tls: {
      enabled: false,
      keyPath: '',
      certPath: ''
    }
  },
  auth: {
    token: ''
  },
  security: {
    remoteControlEnabled: true
  },
  taskDefaults: {
    mode: 'auto',
    permissions: {
      approvalMode: 'manual',
      allowShell: false,
      allowWrite: true,
      allowNetwork: false
    },
    options: {},
    agent: {
      provider: 'claude-code',
      model: 'default'
    }
  },
  daemon: {
    cloudUrl: '',
    pairingCode: '',
    deviceToken: '',
    deviceId: '',
    deviceName: '',
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
  },
  workspaces: [],
  updatedAt: 0
})

export class RemoteConfigStore {
  constructor(options = {}) {
    this.configPath = resolveRemoteConfigPath(options.configPath || options.path)
    this.persist = options.persist !== false
    this.config = normalizeRemoteConfig(options.initialConfig)
  }

  async load() {
    if (!this.persist || !existsSync(this.configPath)) {
      return this.config
    }

    const raw = await readFile(this.configPath, 'utf8')
    const fileConfig = raw.trim() ? JSON.parse(raw) : {}
    this.config = normalizeRemoteConfig(deepMerge(this.config, fileConfig))
    return this.config
  }

  get() {
    return this.config
  }

  getPublic() {
    return serializeRemoteConfig(this.config, this.configPath)
  }

  applyRuntimeOverrides(overrides = {}) {
    this.config = normalizeRemoteConfig(deepMerge(this.config, cleanRemoteConfigPatch(overrides)))
    return this.config
  }

  async update(patch = {}) {
    this.config = normalizeRemoteConfig(
      deepMerge(this.config, {
        ...cleanRemoteConfigPatch(patch),
        updatedAt: Date.now()
      })
    )

    if (this.persist) {
      await this.save()
    }

    return this.config
  }

  async save() {
    if (!this.persist) {
      return
    }

    await mkdir(dirname(this.configPath), { recursive: true })
    await writeFile(this.configPath, `${JSON.stringify(this.config, null, 2)}\n`, 'utf8')
  }
}

export function createMemoryRemoteConfigStore(initialConfig = {}) {
  return new RemoteConfigStore({
    initialConfig,
    persist: false
  })
}

export function resolveRemoteConfigPath(configPath = '') {
  const rawPath =
    String(configPath || '').trim() ||
    String(process.env.XODER_REMOTE_CONFIG || '').trim() ||
    '.xoder/remote-core.config.json'

  return resolve(rawPath)
}

export function normalizeRemoteConfig(input = {}) {
  const source = isRecord(input) ? input : {}
  const cloud = isRecord(source.cloud) ? source.cloud : {}
  const tls = isRecord(cloud.tls) ? cloud.tls : {}
  const auth = isRecord(source.auth) ? source.auth : {}
  const security = isRecord(source.security) ? source.security : {}
  const taskDefaults = isRecord(source.taskDefaults) ? source.taskDefaults : {}
  const permissions = isRecord(taskDefaults.permissions) ? taskDefaults.permissions : {}
  const options = isRecord(taskDefaults.options) ? taskDefaults.options : {}
  const agent = isRecord(taskDefaults.agent) ? taskDefaults.agent : {}
  const daemon = isRecord(source.daemon) ? source.daemon : {}
  const service = isRecord(source.service) ? source.service : {}
  const daemonWorkspace = normalizeWorkspace(daemon.workspace, DEFAULT_REMOTE_CONFIG.daemon.workspace)
  const workspaces = Array.isArray(source.workspaces)
    ? source.workspaces.map(normalizeSavedWorkspace).filter((workspace) => workspace.workspace.path)
    : DEFAULT_REMOTE_CONFIG.workspaces

  return {
    schemaVersion: 1,
    cloud: {
      host: readString(cloud.host, DEFAULT_REMOTE_CONFIG.cloud.host),
      port: readNumber(cloud.port, DEFAULT_REMOTE_CONFIG.cloud.port),
      publicBaseUrl: readString(cloud.publicBaseUrl, DEFAULT_REMOTE_CONFIG.cloud.publicBaseUrl),
      eventHistoryLimit: readNumber(
        cloud.eventHistoryLimit,
        DEFAULT_REMOTE_CONFIG.cloud.eventHistoryLimit
      ),
      dataDir: readString(cloud.dataDir, DEFAULT_REMOTE_CONFIG.cloud.dataDir),
      tls: {
        enabled: readBoolean(tls.enabled, DEFAULT_REMOTE_CONFIG.cloud.tls.enabled),
        keyPath: readString(tls.keyPath, DEFAULT_REMOTE_CONFIG.cloud.tls.keyPath),
        certPath: readString(tls.certPath, DEFAULT_REMOTE_CONFIG.cloud.tls.certPath)
      }
    },
    auth: {
      token: readString(auth.token ?? source.token, DEFAULT_REMOTE_CONFIG.auth.token)
    },
    security: {
      remoteControlEnabled: readBoolean(
        security.remoteControlEnabled,
        DEFAULT_REMOTE_CONFIG.security.remoteControlEnabled
      )
    },
    taskDefaults: {
      mode: readString(taskDefaults.mode, DEFAULT_REMOTE_CONFIG.taskDefaults.mode),
      permissions: {
        ...DEFAULT_REMOTE_CONFIG.taskDefaults.permissions,
        ...permissions
      },
      options: {
        ...options
      },
      agent: {
        ...DEFAULT_REMOTE_CONFIG.taskDefaults.agent,
        ...agent
      }
    },
    daemon: {
      cloudUrl: readString(daemon.cloudUrl, DEFAULT_REMOTE_CONFIG.daemon.cloudUrl),
      pairingCode: readString(daemon.pairingCode, DEFAULT_REMOTE_CONFIG.daemon.pairingCode),
      deviceToken: readString(daemon.deviceToken, DEFAULT_REMOTE_CONFIG.daemon.deviceToken),
      deviceId: readString(daemon.deviceId, DEFAULT_REMOTE_CONFIG.daemon.deviceId),
      deviceName: readString(daemon.deviceName, DEFAULT_REMOTE_CONFIG.daemon.deviceName),
      workspaceMode: normalizeWorkspaceMode(daemon.workspaceMode, daemonWorkspace.path),
      workspace: daemonWorkspace
    },
    service: {
      autoStart: readBoolean(service.autoStart, DEFAULT_REMOTE_CONFIG.service.autoStart),
      startCloudOnAppLaunch: readBoolean(
        service.startCloudOnAppLaunch,
        DEFAULT_REMOTE_CONFIG.service.startCloudOnAppLaunch
      ),
      startDaemonOnAppLaunch: readBoolean(
        service.startDaemonOnAppLaunch,
        DEFAULT_REMOTE_CONFIG.service.startDaemonOnAppLaunch
      ),
      restartOnCrash: readBoolean(service.restartOnCrash, DEFAULT_REMOTE_CONFIG.service.restartOnCrash)
    },
    workspaces,
    updatedAt: readNumber(source.updatedAt, DEFAULT_REMOTE_CONFIG.updatedAt)
  }
}

export function applyTaskDefaults(task = {}, defaults = {}) {
  const taskPayload = isRecord(task) ? task : {}
  const defaultPayload = isRecord(defaults) ? defaults : {}

  return {
    ...defaultPayload,
    ...taskPayload,
    permissions: {
      ...(isRecord(defaultPayload.permissions) ? defaultPayload.permissions : {}),
      ...(isRecord(taskPayload.permissions) ? taskPayload.permissions : {})
    },
    options: {
      ...(isRecord(defaultPayload.options) ? defaultPayload.options : {}),
      ...(isRecord(taskPayload.options) ? taskPayload.options : {})
    },
    agent: {
      ...(isRecord(defaultPayload.agent) ? defaultPayload.agent : {}),
      ...(isRecord(taskPayload.agent) ? taskPayload.agent : {})
    }
  }
}

export function serializeRemoteConfig(config = {}, configPath = '') {
  const normalized = normalizeRemoteConfig(config)
  const token = normalized.auth.token

  return {
    ...normalized,
    configPath,
    auth: {
      tokenConfigured: Boolean(token),
      tokenPreview: token ? maskSecret(token) : ''
    }
  }
}

export function buildCloudRuntimeOverrides(args = {}, env = process.env) {
  const overrides = {
    cloud: {},
    auth: {}
  }

  assignIfPresent(overrides.cloud, 'host', args.host ?? env.XODER_REMOTE_HOST)
  assignIfPresent(overrides.cloud, 'port', args.port ?? env.XODER_REMOTE_PORT)
  assignIfPresent(overrides.cloud, 'dataDir', args['data-dir'] ?? args.dataDir ?? env.XODER_REMOTE_DATA_DIR)
  assignIfPresent(
    overrides.auth,
    'token',
    args['pairing-code'] ?? args.code ?? args.token ?? env.XODER_REMOTE_TOKEN
  )

  return overrides
}

export function buildDaemonRuntimeOptions(args = {}, config = {}, env = process.env) {
  const normalized = normalizeRemoteConfig(config)
  const daemon = normalized.daemon

  return {
    cloudUrl: readString(args.cloud ?? args.url ?? env.XODER_REMOTE_CLOUD, daemon.cloudUrl),
    pairingCode: readString(
      args['pairing-code'] ?? args.code ?? args.token ?? env.XODER_REMOTE_TOKEN,
      daemon.pairingCode || normalized.auth.token
    ),
    deviceToken: readString(args['device-token'] ?? env.XODER_REMOTE_DEVICE_TOKEN, daemon.deviceToken),
    workspace: readString(args.workspace ?? env.XODER_REMOTE_WORKSPACE, daemon.workspace.path),
    workspaceId: readString(args['workspace-id'], daemon.workspace.id),
    workspaceName: readString(args['workspace-name'], daemon.workspace.name),
    workspaceMode: readString(args['workspace-mode'], daemon.workspaceMode),
    device: readString(args.device, daemon.deviceName),
    deviceId: readString(args['device-id'], daemon.deviceId),
    digitalEmployeeJobRoot: readString(
      args['digital-employee-job-root'] ?? env.XODER_DIGITAL_EMPLOYEE_JOB_ROOT,
      ''
    )
  }
}

function cleanRemoteConfigPatch(input = {}) {
  const patch = isRecord(input) ? input : {}
  const cleaned = {}

  if (isRecord(patch.cloud)) {
    cleaned.cloud = pickKnownKeys(patch.cloud, [
      'host',
      'port',
      'publicBaseUrl',
      'eventHistoryLimit',
      'dataDir',
      'tls'
    ])
  }

  if (isRecord(patch.auth)) {
    cleaned.auth = pickKnownKeys(patch.auth, ['token'])
  }

  if (isRecord(patch.security)) {
    cleaned.security = pickKnownKeys(patch.security, ['remoteControlEnabled'])
  }

  if (isRecord(patch.taskDefaults)) {
    cleaned.taskDefaults = {}

    assignIfPresent(cleaned.taskDefaults, 'mode', patch.taskDefaults.mode)

    if (isRecord(patch.taskDefaults.permissions)) {
      cleaned.taskDefaults.permissions = { ...patch.taskDefaults.permissions }
    }

    if (isRecord(patch.taskDefaults.options)) {
      cleaned.taskDefaults.options = { ...patch.taskDefaults.options }
    }

    if (isRecord(patch.taskDefaults.agent)) {
      cleaned.taskDefaults.agent = { ...patch.taskDefaults.agent }
    }
  }

  if (isRecord(patch.daemon)) {
    cleaned.daemon = pickKnownKeys(patch.daemon, [
      'cloudUrl',
      'pairingCode',
      'deviceToken',
      'deviceId',
      'deviceName',
      'workspaceMode',
      'workspace'
    ])
  }

  if (isRecord(patch.service)) {
    cleaned.service = pickKnownKeys(patch.service, [
      'autoStart',
      'startCloudOnAppLaunch',
      'startDaemonOnAppLaunch',
      'restartOnCrash'
    ])
  }

  if (Array.isArray(patch.workspaces)) {
    cleaned.workspaces = patch.workspaces.map(normalizeSavedWorkspace)
  }

  if (patch.token !== undefined) {
    cleaned.auth = {
      ...(cleaned.auth || {}),
      token: patch.token
    }
  }

  return cleaned
}

function deepMerge(base = {}, patch = {}) {
  const output = { ...(isRecord(base) ? base : {}) }

  for (const [key, value] of Object.entries(isRecord(patch) ? patch : {})) {
    if (isRecord(value) && isRecord(output[key])) {
      output[key] = deepMerge(output[key], value)
    } else if (value !== undefined) {
      output[key] = value
    }
  }

  return output
}

function pickKnownKeys(source = {}, keys = []) {
  const output = {}

  for (const key of keys) {
    if (source[key] !== undefined) {
      output[key] = source[key]
    }
  }

  return output
}

function assignIfPresent(target, key, value) {
  if (value !== undefined && value !== null && value !== '') {
    target[key] = value
  }
}

function readString(value, fallback = '') {
  if (value === undefined || value === null) {
    return String(fallback || '').trim()
  }

  return String(value).trim()
}

function readNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

function readBoolean(value, fallback = false) {
  if (value === undefined || value === null) {
    return Boolean(fallback)
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false
    }

    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true
    }
  }

  return Boolean(value)
}

function maskSecret(value = '') {
  const secret = String(value)

  if (secret.length <= 8) {
    return '****'
  }

  return `${secret.slice(0, 4)}...${secret.slice(-4)}`
}

function normalizeWorkspaceMode(value, workspacePath = '') {
  const mode = String(value || '').trim()

  if (mode === 'default' || mode === 'dynamic') {
    return mode
  }

  return workspacePath ? 'default' : 'dynamic'
}

function normalizeSavedWorkspace(input = {}) {
  const source = isRecord(input) ? input : {}
  const workspace = normalizeWorkspace(source.workspace || source)
  const now = Date.now()

  return {
    id: readString(source.id, workspace.id),
    deviceId: readString(source.deviceId, ''),
    title: readString(source.title, workspace.name || workspace.path),
    workspace,
    createdAt: readNumber(source.createdAt, now),
    updatedAt: readNumber(source.updatedAt, now),
    lastOpenedAt: readNumber(source.lastOpenedAt, 0)
  }
}
