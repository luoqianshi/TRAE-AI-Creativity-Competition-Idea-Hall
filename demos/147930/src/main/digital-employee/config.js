import { promises as fs } from 'node:fs'
import { dirname } from 'node:path'

const DEFAULT_DIGITAL_EMPLOYEE_CONFIG = {
  schemaVersion: 1,
  git: {
    isolation: 'worktree',
    requireIsolation: true,
    provider: 'auto',
    remote: 'auto',
    baseBranch: '',
    branchPrefix: 'xoder/employee',
    autoCommit: true,
    autoPush: false,
    createPr: false,
    prCreationMode: 'localCli',
    apiFallback: false,
    customPrCommand: '',
    prDraft: true
  },
  github: {
    token: ''
  },
  policy: {
    approvalPolicy: 'auto',
    allowOvernightFullAccess: false
  },
  workspaceProfiles: {},
  updatedAt: 0
}

export function createDefaultDigitalEmployeeConfig(overrides = {}) {
  return normalizeDigitalEmployeeConfig(overrides)
}

export function normalizeDigitalEmployeeConfig(input = {}, previous = {}) {
  const git = {
    ...DEFAULT_DIGITAL_EMPLOYEE_CONFIG.git,
    ...(previous.git || {}),
    ...(input.git || {})
  }
  const policy = {
    ...DEFAULT_DIGITAL_EMPLOYEE_CONFIG.policy,
    ...(previous.policy || {}),
    ...(input.policy || {})
  }
  const previousToken = String(previous.github?.token || '')
  const hasIncomingToken = Object.prototype.hasOwnProperty.call(input.github || {}, 'token')
  const incomingToken = hasIncomingToken ? String(input.github?.token || '').trim() : ''
  const token = input.github?.clearToken ? '' : incomingToken || previousToken
  const workspaceProfiles = normalizeWorkspaceProfiles(
    input.workspaceProfiles || {},
    previous.workspaceProfiles || {}
  )

  return {
    schemaVersion: 1,
    git: {
      isolation: normalizeChoice(git.isolation, ['worktree', 'none'], 'worktree'),
      requireIsolation: git.requireIsolation !== false,
      provider: normalizeGitProvider(git.provider || git.prProvider || 'auto'),
      remote: String(git.remote || 'auto').trim() || 'auto',
      baseBranch: String(git.baseBranch || '').trim(),
      branchPrefix: String(git.branchPrefix || 'xoder/employee').trim() || 'xoder/employee',
      autoCommit: git.autoCommit !== false,
      autoPush: Boolean(git.autoPush),
      createPr: Boolean(git.createPr),
      prCreationMode: normalizeChoice(
        git.prCreationMode,
        ['localCli', 'api', 'localThenApi'],
        'localCli'
      ),
      apiFallback: Boolean(git.apiFallback),
      customPrCommand: String(git.customPrCommand || '').trim(),
      prDraft: git.prDraft !== false
    },
    github: {
      token
    },
    policy: {
      approvalPolicy: normalizeChoice(policy.approvalPolicy, ['manual', 'auto', 'fullAccess'], 'auto'),
      allowOvernightFullAccess: Boolean(policy.allowOvernightFullAccess)
    },
    workspaceProfiles,
    updatedAt: Number(input.updatedAt || previous.updatedAt || 0)
  }
}

export async function readDigitalEmployeeConfigFile(configPath) {
  const fallback = createDefaultDigitalEmployeeConfig()

  try {
    const raw = await fs.readFile(configPath, 'utf8')
    const parsed = raw.trim() ? JSON.parse(raw) : {}

    return {
      ok: true,
      exists: true,
      configPath,
      config: normalizeDigitalEmployeeConfig(
        {
          ...fallback,
          ...parsed,
          git: {
            ...fallback.git,
            ...(parsed.git || {})
          },
          github: {
            ...fallback.github,
            ...(parsed.github || {})
          },
          policy: {
            ...fallback.policy,
            ...(parsed.policy || {})
          },
          workspaceProfiles: {
            ...fallback.workspaceProfiles,
            ...(parsed.workspaceProfiles || {})
          }
        },
        fallback
      )
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

export async function saveDigitalEmployeeConfigFile(configPath, payload = {}) {
  const current = await readDigitalEmployeeConfigFile(configPath)
  const input = payload?.config || payload || {}
  const config = normalizeDigitalEmployeeConfig(
    {
      ...input,
      updatedAt: Date.now()
    },
    current.config
  )

  await fs.mkdir(dirname(configPath), { recursive: true })
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')

  return {
    ok: true,
    exists: true,
    configPath,
    config
  }
}

export function toPublicDigitalEmployeeConfig(config = {}) {
  const normalized = normalizeDigitalEmployeeConfig(config)
  const token = normalized.github.token
  const activeProfile = config.activeProfile ? normalizeWorkspaceProfile(config.activeProfile) : null

  return {
    ...normalized,
    github: {
      token: '',
      tokenConfigured: Boolean(token),
      tokenPreview: maskSecret(token)
    },
    activeProfile
  }
}

export function toPublicDigitalEmployeeConfigResult(result = {}) {
  return {
    ...result,
    config: toPublicDigitalEmployeeConfig(result.config)
  }
}

export function getEffectiveDigitalEmployeeConfig(config = {}, profileKey = '') {
  const normalizedConfig = normalizeDigitalEmployeeConfig(config)
  const key = String(profileKey || '').trim()
  const activeProfile = key ? normalizedConfig.workspaceProfiles[key] || null : null

  if (!activeProfile) {
    return {
      ...normalizedConfig,
      activeProfile: null
    }
  }

  return {
    ...normalizedConfig,
    git: {
      ...normalizedConfig.git,
      ...(activeProfile.git || {})
    },
    policy: {
      ...normalizedConfig.policy,
      ...(activeProfile.policy || {})
    },
    activeProfile
  }
}

export function upsertDigitalEmployeeWorkspaceProfile(config = {}, scope = {}, input = {}) {
  const normalizedConfig = normalizeDigitalEmployeeConfig(config)
  const key = String(scope.key || '').trim()

  if (!key) {
    return normalizeDigitalEmployeeConfig(
      {
        ...input,
        updatedAt: Date.now()
      },
      normalizedConfig
    )
  }

  const currentProfile = normalizedConfig.workspaceProfiles[key] || {}
  const effectiveBeforeSave = getEffectiveDigitalEmployeeConfig(normalizedConfig, key)
  const nextEffective = normalizeDigitalEmployeeConfig(input, effectiveBeforeSave)
  const globalWithToken = normalizeDigitalEmployeeConfig(
    {
      github: input.github || {},
      updatedAt: Date.now()
    },
    normalizedConfig
  )

  return {
    ...globalWithToken,
    workspaceProfiles: {
      ...globalWithToken.workspaceProfiles,
      [key]: normalizeWorkspaceProfile(
        {
          ...currentProfile,
          key,
          name: scope.name || currentProfile.name || '',
          workspacePath: scope.workspacePath || currentProfile.workspacePath || '',
          repoRoot: scope.repoRoot || currentProfile.repoRoot || '',
          git: nextEffective.git,
          policy: nextEffective.policy,
          updatedAt: Date.now()
        },
        currentProfile
      )
    }
  }
}

export function mergeDigitalEmployeeStartRequestWithConfig(request = {}, config = {}, options = {}) {
  const normalizedConfig = getEffectiveDigitalEmployeeConfig(config, options.profileKey)
  const requestGit = request.git || {}
  const explicitApprovalPolicy = String(request.approvalPolicy || '').trim()
  let approvalPolicy = explicitApprovalPolicy || normalizedConfig.policy.approvalPolicy

  if (
    !explicitApprovalPolicy &&
    approvalPolicy === 'fullAccess' &&
    !normalizedConfig.policy.allowOvernightFullAccess
  ) {
    approvalPolicy = 'auto'
  }

  return {
    ...request,
    approvalPolicy,
    git: {
      ...normalizedConfig.git,
      ...requestGit,
      githubToken:
        String(requestGit.githubToken || requestGit.prToken || '').trim() ||
        normalizedConfig.github.token ||
        getEnvPrToken(requestGit.provider || normalizedConfig.git.provider),
      giteeToken:
        String(requestGit.giteeToken || '').trim() ||
        getEnvPrToken('gitee'),
      gitlabToken:
        String(requestGit.gitlabToken || '').trim() ||
        getEnvPrToken('gitlab')
    }
  }
}

function normalizeChoice(value, allowed, fallback) {
  const normalized = String(value || '').trim()

  return allowed.includes(normalized) ? normalized : fallback
}

function normalizeGitProvider(value) {
  return normalizeChoice(
    String(value || '').trim().toLowerCase(),
    ['auto', 'github', 'gitee', 'gitlab', 'generic', 'none'],
    'auto'
  )
}

function getEnvPrToken(provider = 'auto') {
  const normalizedProvider = normalizeGitProvider(provider)

  if (normalizedProvider === 'gitee') {
    return process.env.GITEE_TOKEN || ''
  }

  if (normalizedProvider === 'gitlab') {
    return process.env.GITLAB_TOKEN || ''
  }

  if (normalizedProvider === 'github') {
    return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
  }

  return (
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITEE_TOKEN ||
    process.env.GITLAB_TOKEN ||
    ''
  )
}

function normalizeWorkspaceProfiles(inputProfiles = {}, previousProfiles = {}) {
  const profiles = {
    ...(previousProfiles || {}),
    ...(inputProfiles || {})
  }
  const normalized = {}

  for (const [key, profile] of Object.entries(profiles)) {
    const normalizedProfile = normalizeWorkspaceProfile(
      {
        ...(profile || {}),
        key: profile?.key || key
      },
      previousProfiles[key] || {}
    )

    if (normalizedProfile.key) {
      normalized[normalizedProfile.key] = normalizedProfile
    }
  }

  return normalized
}

function normalizeWorkspaceProfile(input = {}, previous = {}) {
  const profileGit = {
    ...DEFAULT_DIGITAL_EMPLOYEE_CONFIG.git,
    ...(previous.git || {}),
    ...(input.git || {})
  }
  const profilePolicy = {
    ...DEFAULT_DIGITAL_EMPLOYEE_CONFIG.policy,
    ...(previous.policy || {}),
    ...(input.policy || {})
  }

  return {
    key: String(input.key || previous.key || '').trim(),
    name: String(input.name || previous.name || '').trim(),
    workspacePath: String(input.workspacePath || previous.workspacePath || '').trim(),
    repoRoot: String(input.repoRoot || previous.repoRoot || '').trim(),
    git: {
      isolation: normalizeChoice(profileGit.isolation, ['worktree', 'none'], 'worktree'),
      requireIsolation: profileGit.requireIsolation !== false,
      provider: normalizeGitProvider(profileGit.provider || profileGit.prProvider || 'auto'),
      remote: String(profileGit.remote || 'auto').trim() || 'auto',
      baseBranch: String(profileGit.baseBranch || '').trim(),
      branchPrefix: String(profileGit.branchPrefix || 'xoder/employee').trim() || 'xoder/employee',
      autoCommit: profileGit.autoCommit !== false,
      autoPush: Boolean(profileGit.autoPush),
      createPr: Boolean(profileGit.createPr),
      prCreationMode: normalizeChoice(
        profileGit.prCreationMode,
        ['localCli', 'api', 'localThenApi'],
        'localCli'
      ),
      apiFallback: Boolean(profileGit.apiFallback),
      customPrCommand: String(profileGit.customPrCommand || '').trim(),
      prDraft: profileGit.prDraft !== false
    },
    policy: {
      approvalPolicy: normalizeChoice(
        profilePolicy.approvalPolicy,
        ['manual', 'auto', 'fullAccess'],
        'auto'
      ),
      allowOvernightFullAccess: Boolean(profilePolicy.allowOvernightFullAccess)
    },
    updatedAt: Number(input.updatedAt || previous.updatedAt || 0)
  }
}

function maskSecret(value = '') {
  const secret = String(value || '').trim()

  if (!secret) {
    return ''
  }

  if (secret.length <= 8) {
    return `${secret.slice(0, 2)}****${secret.slice(-2)}`
  }

  return `${secret.slice(0, 4)}****${secret.slice(-4)}`
}
