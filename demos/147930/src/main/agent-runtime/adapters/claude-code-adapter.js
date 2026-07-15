import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildClaudeCodePrompt,
  createXoderEvent,
  mapClaudeStreamEvent,
  parseTeamCliResult,
  summarizeToolInput,
  summarizeToolInputDetails,
  XODER_AGENT_EVENT_TYPES
} from '../protocols/xoder-events.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const CLAUDE_CODE_RELATIVE_PARTS = [
  '备用',
  'claude-code',
  'Claude-Code',
  'Claude-Code',
  'claude-code'
]
const CLI_ENTRY = join('src', 'entrypoints', 'cli.tsx')
const DIST_ENTRY = join('dist', 'cli.js')
const TEAM_COMMAND_ENTRY = join('src', 'commands', 'team', 'index.ts')
const EMPLOYEE_COMMAND_ENTRY = join('src', 'commands', 'employee', 'index.ts')
const TEAM_DIST_ENTRY = join('dist', 'commands', 'team', 'index.js')
const EMPLOYEE_DIST_ENTRY = join('dist', 'commands', 'employee', 'index.js')
const TEAM_RUN_ROOT = join('.claude', 'team-runs')
const CANCEL_GRACE_MS = 12000
const TEAM_STATE_POLL_MS = 850
const READ_TOOL_NAMES = new Set(['Read', 'Grep', 'Glob', 'LS'])
const WRITE_TOOL_NAMES = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])
const SHELL_TOOL_NAMES = new Set(['Bash'])
const WEB_SEARCH_TOOL_NAMES = new Set(['WebSearch'])
const WEB_FETCH_TOOL_NAMES = new Set(['WebFetch'])
const NETWORK_TOOL_NAMES = new Set(['WebFetch', 'WebSearch', 'SandboxNetworkAccess'])
const TASK_TOOL_NAMES = new Set(['Task', 'Agent'])
const SAFE_SESSION_TOOL_NAMES = new Set(['TodoWrite'])
const SKILL_TOOL_NAMES = new Set(['Skill'])
const QUESTION_TOOL_NAMES = new Set(['AskUserQuestion'])
const PLAN_TOOL_NAMES = new Set(['ExitPlanMode', 'ExitPlanModeV2', 'exit_plan_mode', 'exit_plan_mode_v2'])

export class ClaudeCodeAdapter {
  constructor(options = {}) {
    this.runtimePath = options.runtimePath || ''
    this.bunCommand = options.bunCommand || process.env.XODER_BUN_COMMAND || 'bun'
    this.idleWarningMs = readDuration(
      options.idleWarningMs ?? process.env.XODER_AGENT_IDLE_WARNING_MS,
      120000
    )
    this.idleTimeoutMs = readDuration(
      options.idleTimeoutMs ?? process.env.XODER_AGENT_IDLE_TIMEOUT_MS,
      0
    )
    this.maxRuntimeRestarts = readDuration(
      options.maxRuntimeRestarts ?? process.env.XODER_AGENT_MAX_RESTARTS,
      1
    )
    this.maxConcurrentSessions = readConcurrentSessionLimit(
      options.maxConcurrentSessions ?? process.env.XODER_AGENT_MAX_CONCURRENT_SESSIONS,
      2
    )
    this.workers = new Map()
    this.workerSequence = 0
  }

  listCapabilities() {
    const runtimeCapabilities = this.detectRuntimeCapabilities()

    return {
      provider: 'claude-code',
      transport: 'stdio-stream-json-long-running',
      modes: {
        singleAgent: true,
        expertTeam: true,
        nativeTeamRuntime: runtimeCapabilities.team?.headlessSupported === true,
        digitalEmployee: runtimeCapabilities.employee?.headlessSupported === true,
        nativeEmployeeRuntime: runtimeCapabilities.employee?.headlessSupported === true,
        reviewer: true
      },
      commands: runtimeCapabilities.commands,
      employees: runtimeCapabilities.employees,
      slashCommands: runtimeCapabilities.slashCommands,
      reliability: {
        idleWarningMs: this.idleWarningMs,
        idleTimeoutMs: this.idleTimeoutMs,
        maxRuntimeRestarts: this.maxRuntimeRestarts,
        maxConcurrentSessions: this.maxConcurrentSessions,
        sessionIsolation: true
      },
      tools: [
        'Task',
        'AskUserQuestion',
        'Bash',
        'Edit',
        'Glob',
        'Grep',
        'NotebookEdit',
        'Read',
        'Skill',
        'TodoWrite',
        'WebFetch',
        'WebSearch',
        'Write'
      ]
    }
  }

  detectRuntimeCapabilities() {
    try {
      const runtimePath = this.resolveRuntimePath()

      return detectClaudeCodeRuntimeCapabilities(runtimePath)
    } catch {
      return {
        hasTeamRuntime: false,
        hasEmployeeRuntime: false,
        team: createRuntimeCommandCapability('team'),
        employee: createRuntimeCommandCapability('employee'),
        commands: {
          team: createRuntimeCommandCapability('team'),
          employee: createRuntimeCommandCapability('employee')
        },
        employees: [],
        slashCommands: []
      }
    }
  }

  resolveRuntimePath() {
    return resolveClaudeCodeRuntimePath(this.runtimePath)
  }

  start(sessionState, emit) {
    const runtimePath = this.resolveRuntimePath()
    const agentCwd = resolveAgentCwd(sessionState.request, runtimePath)
    const worker = this.getWorker(runtimePath, agentCwd, sessionState.request)

    sessionState.runtimePath = runtimePath
    sessionState.agentCwd = agentCwd
    sessionState.workerKey = worker.key
    worker.enqueue(sessionState, emit)

    return {
      stop() {
        sessionState.cancelRequested = true
        worker.cancel(sessionState.id)
      },
      respondToPermission(requestId, response) {
        return worker.respondToPermission(sessionState.id, requestId, response)
      },
      runSlashCommand(command, args) {
        return worker.runSlashCommand(sessionState.id, command, args)
      }
    }
  }

  getWorker(runtimePath, agentCwd, request = {}) {
    const baseKey = `${runtimePath}\0${agentCwd}`
    const matching = [...this.workers.values()].filter(
      (worker) => worker.baseKey === baseKey && !worker.disposed
    )
    const isolate = shouldIsolateSession(request)

    if (!isolate) {
      const existing = matching[0]

      if (existing) {
        return existing
      }
    } else {
      const idle = matching.find((worker) => worker.isIdle())

      if (idle) {
        return idle
      }

      if (matching.length >= this.maxConcurrentSessions) {
        return matching.sort((left, right) => left.load() - right.load())[0]
      }
    }

    const workerKey = `${baseKey}\0worker-${++this.workerSequence}`
    const worker = new ClaudeCodeLongRunningWorker({
      key: workerKey,
      baseKey,
      runtimePath,
      agentCwd,
      bunCommand: this.bunCommand,
      idleWarningMs: this.idleWarningMs,
      idleTimeoutMs: this.idleTimeoutMs,
      maxRuntimeRestarts: this.maxRuntimeRestarts,
      onDisposed: () => {
        if (this.workers.get(workerKey) === worker) {
          this.workers.delete(workerKey)
        }
      }
    })

    this.workers.set(workerKey, worker)
    return worker
  }

  stopAll() {
    for (const worker of this.workers.values()) {
      worker.dispose()
    }

    this.workers.clear()
  }
}

class ClaudeCodeLongRunningWorker {
  constructor({
    key,
    baseKey,
    runtimePath,
    agentCwd,
    bunCommand,
    idleWarningMs,
    idleTimeoutMs,
    maxRuntimeRestarts,
    onDisposed
  }) {
    this.key = key
    this.baseKey = baseKey || key
    this.runtimePath = runtimePath
    this.agentCwd = agentCwd
    this.bunCommand = bunCommand
    this.idleWarningMs = idleWarningMs
    this.idleTimeoutMs = idleTimeoutMs
    this.maxRuntimeRestarts = maxRuntimeRestarts
    this.onDisposed = onDisposed
    this.queue = []
    this.active = null
    this.child = null
    this.stdoutBuffer = ''
    this.stderrBuffer = ''
    this.disposed = false
    this.spawning = false
    this.spawnFailed = false
    this.idleTimer = null
    this.lastActivityAt = 0
    this.stallWarningSent = false
  }

  isIdle() {
    return !this.active && this.queue.length === 0
  }

  load() {
    return this.queue.length + (this.active ? 1 : 0)
  }

  enqueue(sessionState, emit) {
    if (this.disposed) {
      emit(
        createXoderEvent(sessionState.id, XODER_AGENT_EVENT_TYPES.SESSION_FAILED, {
          code: 'RUNTIME_DISPOSED',
          message: 'Agent runtime worker has been disposed.'
        })
      )
      return
    }

    if (this.spawnFailed) {
      emit(
        createXoderEvent(sessionState.id, XODER_AGENT_EVENT_TYPES.SESSION_FAILED, {
          code: 'RUNTIME_UNAVAILABLE',
          message: 'Agent runtime worker is unavailable after a spawn failure.'
        })
      )
      return
    }

    this.queue.push({
      sessionState,
      emit,
      started: false,
      cancelTimer: null,
      pendingPermissions: new Map(),
      pendingTeamQuestions: new Map(),
      teamPollTimer: null,
      teamLastSignature: '',
      teamLastQuestionText: '',
      teamTaskStatuses: new Map(),
      teamArtifactKeys: new Set()
    })
    this.drain()
  }

  cancel(sessionId) {
    const queuedIndex = this.queue.findIndex((item) => item.sessionState.id === sessionId)

    if (queuedIndex >= 0) {
      this.queue.splice(queuedIndex, 1)
      return
    }

    if (!this.active || this.active.sessionState.id !== sessionId) {
      return
    }

    this.active.sessionState.cancelRequested = true
    this.stopTeamRun(this.active)
    this.writeControlRequest('interrupt', {
      reason: 'cancelled by Xoder user'
    })
    this.active.cancelTimer = setTimeout(() => {
      if (this.active?.sessionState.id === sessionId) {
        this.restartAfterCancelTimeout()
      }
    }, CANCEL_GRACE_MS)
  }

  respondToPermission(sessionId, requestId, response = {}) {
    const item = this.active

    if (!item || item.sessionState.id !== sessionId) {
      return false
    }

    const pending = item.pendingPermissions.get(String(requestId || ''))

    if (!pending) {
      const teamPending = item.pendingTeamQuestions.get(String(requestId || ''))

      if (teamPending) {
        return this.resolveTeamQuestion(item, teamPending, response)
      }

      return false
    }

    const decision = createClaudeCodePermissionDecisionFromResponse(response, pending.permission)
    this.resolvePermissionRequest(item, pending, decision)
    return true
  }

  runSlashCommand(sessionId, command, args = '') {
    const item = this.active

    if (!item || item.sessionState.id !== sessionId) {
      return false
    }

    const slashCommand = buildSafeSlashCommand(command, args)

    if (!slashCommand) {
      return false
    }

    return this.writeJsonLine(createClaudeCodeSdkUserMessage(slashCommand))
  }

  drain() {
    if (this.disposed || this.active || this.queue.length === 0) {
      return
    }

    if (!this.ensureProcess()) {
      return
    }

    this.active = this.queue.shift()
    this.active.started = true
    this.active.sessionState.process = this.child
    this.writeUserMessage(this.active.sessionState)
    this.startIdleMonitor()
    this.startTeamStateWatcher(this.active)
  }

  ensureProcess() {
    if (this.child && !this.child.killed) {
      return true
    }

    if (this.spawning || this.spawnFailed) {
      return false
    }

    this.spawnProcess()
    return Boolean(this.child && !this.child.killed)
  }

  spawnProcess() {
    const cliArgs = getClaudeCodeCliArgs(this.runtimePath)
    const bunSpawn = resolveBunSpawn(this.bunCommand)
    const child = spawn(bunSpawn.command, [...bunSpawn.argsPrefix, ...cliArgs], {
      cwd: this.agentCwd,
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        NO_COLOR: '1'
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    })

    this.child = child
    this.spawning = true
    this.stdoutBuffer = ''
    this.stderrBuffer = ''

    child.stdout.on('data', (data) => {
      this.touchActivity()
      this.stdoutBuffer = consumeLines(this.stdoutBuffer + data.toString('utf8'), (line) => {
        this.handleStdoutLine(line)
      })
    })

    child.stderr.on('data', (data) => {
      this.touchActivity()
      this.stderrBuffer = consumeLines(this.stderrBuffer + data.toString('utf8'), (line) => {
        this.emitToActiveRuntimeStderr(line, 'stderr')
      })
    })

    child.stdout.on('end', () => {
      if (this.stdoutBuffer.trim()) {
        this.handleStdoutLine(this.stdoutBuffer)
        this.stdoutBuffer = ''
      }
    })

    child.stderr.on('end', () => {
      if (this.stderrBuffer.trim()) {
        this.emitToActiveRuntimeStderr(this.stderrBuffer, 'stderr')
        this.stderrBuffer = ''
      }
    })

    child.on('spawn', () => {
      this.spawning = false
    })

    child.on('error', (error) => {
      this.spawning = false
      this.spawnFailed = true
      this.failActiveAndQueued({
        code: error.code === 'ENOENT' ? 'BUN_NOT_FOUND' : error.code || 'SPAWN_ERROR',
        message:
          error.code === 'ENOENT'
            ? 'Bun was not found. Install Bun or set XODER_BUN_COMMAND.'
            : error.message
      })
    })

    child.on('exit', (code, signal) => {
      if (this.child === child) {
        this.child = null
      }

      this.spawning = false

      if (this.disposed) {
        return
      }

      if (this.active && !this.active.sessionState.cancelRequested) {
        const item = this.active
        const timedOut = Boolean(item.sessionState.runtimeIdleTimeout)
        const restartAttempt = Number(item.sessionState.runtimeRestartAttempts || 0)

        if (!timedOut && restartAttempt < this.maxRuntimeRestarts) {
          item.sessionState.runtimeRestartAttempts = restartAttempt + 1
          item.emit(
            createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.RUNTIME_RESTARTING, {
              attempt: item.sessionState.runtimeRestartAttempts,
              maxAttempts: this.maxRuntimeRestarts,
              exitCode: code,
              signal,
              message: 'Agent runtime exited unexpectedly. Restarting the same session.'
            })
          )
          this.finishActive()
          item.started = false
          item.cancelTimer = null
          this.queue.unshift(item)
          this.drain()
          return
        }

        item.sessionState.finalResultSeen = true
        item.emit(
          createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.SESSION_FAILED, {
            code: timedOut ? 'RUNTIME_IDLE_TIMEOUT' : 'RUNTIME_EXITED',
            message: timedOut
              ? `Agent runtime produced no output for ${this.idleTimeoutMs}ms and was stopped.`
              : `Agent runtime exited with code ${code ?? 'null'}${signal ? ` and signal ${signal}` : ''}.`,
            exitCode: code,
            signal,
            idleMs: timedOut ? Date.now() - item.sessionState.runtimeLastActivityAt : 0,
            restartAttempts: restartAttempt
          })
        )
      }

      this.finishActive()
      this.drain()
    })
  }

  writeUserMessage(sessionState) {
    this.touchActivity()
    this.writeSessionControls(sessionState)
    const runtimeInput = buildClaudeCodeRuntimeInput(sessionState.request, this.runtimePath)
    sessionState.bridgeMode = runtimeInput.mode
    const content = sessionState.runtimeRestartAttempts
      ? `${runtimeInput.content}\n\nThe previous agent process exited unexpectedly. Continue the same task from the current workspace and preserve existing changes.`
      : runtimeInput.content
    const message = createClaudeCodeSdkUserMessage(content)
    this.writeJsonLine(message)
  }

  writeSessionControls(sessionState) {
    const permissionMode = getRequestedPermissionMode(sessionState.request)
    const maxThinkingTokens = getRequestedMaxThinkingTokens(sessionState.request)

    this.writeControlRequest('set_permission_mode', {
      mode: permissionMode
    })

    if (maxThinkingTokens !== undefined) {
      this.writeControlRequest('set_max_thinking_tokens', {
        max_thinking_tokens: maxThinkingTokens
      })
    }
  }

  writeControlRequest(subtype, extra = {}) {
    this.writeJsonLine({
      type: 'control_request',
      request_id: randomUUID(),
      request: {
        subtype,
        ...extra
      }
    })
  }

  writeJsonLine(message) {
    if (!this.child?.stdin || this.child.stdin.destroyed || this.child.killed) {
      return false
    }

    this.child.stdin.write(`${JSON.stringify(message)}\n`, 'utf8')
    return true
  }

  handleStdoutLine(line) {
    const item = this.active

    if (!item) {
      return
    }

    const result = handleStdoutLine(item.sessionState, line, item.emit, {
      suppressEvents: item.sessionState.cancelRequested,
      holdTeamWaitingResult: isTeamRuntimeItem(item)
    })

    if (result?.rawEvent?.type === 'result') {
      this.pollTeamState(item)

      if (shouldHoldTeamSessionForAnswer(item, result.rawEvent)) {
        return
      }

      this.finishActive()
      this.drain()
      return
    }

    if (result?.rawEvent?.type === 'control_request') {
      this.handleControlRequest(item, result.rawEvent)
    }
  }

  startTeamStateWatcher(item) {
    if (!isTeamRuntimeItem(item)) {
      return
    }

    this.pollTeamState(item)
    item.teamPollTimer = setInterval(() => {
      this.pollTeamState(item)
    }, TEAM_STATE_POLL_MS)
    item.teamPollTimer.unref?.()
  }

  pollTeamState(item) {
    if (!item || item !== this.active || item.sessionState.cancelRequested) {
      return
    }

    const state = readCurrentTeamState(this.agentCwd, item.sessionState)

    if (!state) {
      return
    }

    item.sessionState.teamRunId = state.runId || item.sessionState.teamRunId || ''
    item.sessionState.teamRuntime = {
      runId: state.runId || '',
      status: state.status || '',
      runDir: state.runDir || '',
      updatedAt: state.updatedAt || ''
    }

    const signature = getTeamStateSignature(state)

    if (signature === item.teamLastSignature) {
      return
    }

    item.teamLastSignature = signature

    for (const event of mapTeamRunStateToXoderEvents(state, item)) {
      item.emit(event)
    }
  }

  resolveTeamQuestion(item, pending, response = {}) {
    const allow = response.allow === true || ['allow', 'approve'].includes(
      String(response.behavior || response.action || '').trim().toLowerCase()
    )

    item.pendingTeamQuestions.delete(pending.requestId)

    if (!allow) {
      const wrote = this.stopTeamRun(item)

      item.emit(
        createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.QUESTION_DECLINED, {
          ...pending.payload,
          status: 'failed',
          message: wrote ? 'Team run was stopped by Xoder user.' : 'Failed to stop team run.'
        })
      )
      return wrote
    }

    const answer = extractTeamQuestionAnswer(response, pending.payload)

    if (!answer) {
      return false
    }

    const wrote = this.writeJsonLine(createClaudeCodeSdkUserMessage(buildTeamAnswerCommand(answer)))

    item.emit(
      createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.QUESTION_ANSWERED, {
        ...pending.payload,
        status: wrote ? 'completed' : 'failed',
        answers: {
          [pending.question || 'answer']: answer
        },
        message: wrote ? 'Answered team clarification.' : 'Failed to write team answer.'
      })
    )

    return wrote
  }

  stopTeamRun(item) {
    if (!isTeamRuntimeItem(item)) {
      return false
    }

    const runId = item.sessionState.teamRunId || item.sessionState.teamRuntime?.runId || ''
    const command = runId ? `/team stop ${runId}` : '/team stop'

    return this.writeJsonLine(createClaudeCodeSdkUserMessage(command))
  }

  handleControlRequest(item, rawEvent) {
    const permission = getClaudeCodePermissionRequest(rawEvent)

    if (!permission || item.sessionState.cancelRequested) {
      return
    }

    const risk = classifyClaudeCodePermission(item.sessionState.request, permission)
    const pending = {
      rawEvent,
      permission,
      risk
    }
    const interactiveKind = getInteractivePermissionKind(permission)
    const shouldAutoApprove =
      !interactiveKind &&
      shouldAutoApprovePermission(item.sessionState.request, permission)

    if (!shouldAutoApprove) {
      item.pendingPermissions.set(permission.requestId, pending)
    }

    if (interactiveKind === 'question') {
      item.emit(
        createXoderEvent(
          item.sessionState.id,
          XODER_AGENT_EVENT_TYPES.QUESTION_REQUESTED,
          createQuestionEventPayload(permission, {
            risk,
            status: 'pending',
            source: 'control_request'
          })
        )
      )
    } else if (interactiveKind === 'plan') {
      item.emit(
        createXoderEvent(
          item.sessionState.id,
          XODER_AGENT_EVENT_TYPES.PLAN_REQUESTED,
          createPlanEventPayload(permission, {
            risk,
            status: 'pending',
            source: 'control_request'
          })
        )
      )
    } else {
      item.emit(
        createXoderEvent(
          item.sessionState.id,
        XODER_AGENT_EVENT_TYPES.PERMISSION_REQUESTED,
        createPermissionEventPayload(permission, {
            risk,
            status: 'running'
          })
        )
      )
    }

    if (shouldAutoApprove) {
      const decision = decideClaudeCodePermission(item.sessionState.request, permission)
      this.resolvePermissionRequest(item, pending, decision)
    }
  }

  resolvePermissionRequest(item, pending, decision) {
    const { rawEvent, permission } = pending
    const risk = pending.risk || classifyClaudeCodePermission(item.sessionState.request, permission)
    const response = createClaudeCodePermissionResponse(rawEvent, decision)

    item.pendingPermissions.delete(permission.requestId)

    if (!response) {
      item.emit(
        createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.PERMISSION_DENIED, {
          ...createPermissionEventPayload(permission, {
            risk,
            status: 'failed',
            decision
          }),
          message: 'Could not build a Claude Code permission response.'
        })
      )
      return
    }

    const wrote = this.writeJsonLine(response)
    const interactiveKind = getInteractivePermissionKind(permission)
    const eventType = getPermissionResolutionEventType(interactiveKind, wrote, decision)
    const status = wrote && decision.allow ? 'completed' : 'failed'
    const eventPayload =
      interactiveKind === 'question'
        ? createQuestionEventPayload(permission, {
            risk,
            status,
            decision,
            response: response.response?.response,
            answers: response.response?.response?.updatedInput?.answers || {},
            message: wrote ? decision.message : 'Failed to write question response to runtime stdin.'
          })
        : interactiveKind === 'plan'
          ? createPlanEventPayload(permission, {
              risk,
              status,
              decision,
              response: response.response?.response,
              message: wrote ? decision.message : 'Failed to write plan response to runtime stdin.'
            })
          : createPermissionEventPayload(permission, {
              risk,
              status,
              decision,
              response: response.response?.response,
              message: wrote ? decision.message : 'Failed to write permission response to runtime stdin.'
            })

    item.emit(createXoderEvent(item.sessionState.id, eventType, eventPayload))

    if (!wrote) {
      emitRuntimeStderr(
        item.sessionState,
        item.emit,
        `Failed to write permission response for ${permission.toolName}.`,
        'adapter'
      )
    }
  }

  emitToActiveRuntimeStderr(line, source) {
    if (!this.active || this.active.sessionState.cancelRequested) {
      return
    }

    emitRuntimeStderr(this.active.sessionState, this.active.emit, line, source)
  }

  touchActivity() {
    this.lastActivityAt = Date.now()
    this.stallWarningSent = false

    if (this.active) {
      this.active.sessionState.runtimeLastActivityAt = this.lastActivityAt
    }
  }

  startIdleMonitor() {
    if (this.idleTimer || (!this.idleWarningMs && !this.idleTimeoutMs)) {
      return
    }

    this.touchActivity()
    const intervalMs = Math.max(25, Math.min(this.idleWarningMs || this.idleTimeoutMs, 1000))
    this.idleTimer = setInterval(() => this.checkIdle(), intervalMs)
    this.idleTimer.unref?.()
  }

  checkIdle() {
    const item = this.active

    if (!item || item.sessionState.cancelRequested || !this.lastActivityAt) {
      return
    }

    const idleMs = Date.now() - this.lastActivityAt

    if (this.idleTimeoutMs > 0 && idleMs >= this.idleTimeoutMs) {
      item.sessionState.runtimeIdleTimeout = true
      item.sessionState.runtimeLastActivityAt = this.lastActivityAt
      item.emit(
        createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.RUNTIME_STALLED, {
          status: 'timeout',
          code: 'RUNTIME_IDLE_TIMEOUT',
          idleMs,
          timeoutMs: this.idleTimeoutMs,
          message: `Agent runtime produced no output for ${idleMs}ms and will be stopped.`
        })
      )

      if (this.child && !this.child.killed) {
        this.child.kill()
      }
      return
    }

    if (this.idleWarningMs > 0 && idleMs >= this.idleWarningMs && !this.stallWarningSent) {
      this.stallWarningSent = true
      item.emit(
        createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.RUNTIME_STALLED, {
          status: 'warning',
          code: 'RUNTIME_IDLE_WARNING',
          idleMs,
          timeoutMs: this.idleTimeoutMs,
          message: `Agent runtime has produced no output for ${idleMs}ms.`
        })
      )
    }
  }

  finishActive() {
    if (!this.active) {
      return
    }

    if (this.active.cancelTimer) {
      clearTimeout(this.active.cancelTimer)
    }

    if (this.active.teamPollTimer) {
      clearInterval(this.active.teamPollTimer)
    }

    if (this.idleTimer) {
      clearInterval(this.idleTimer)
      this.idleTimer = null
    }

    this.active.pendingPermissions.clear()
    this.active.pendingTeamQuestions.clear()
    this.lastActivityAt = 0
    this.stallWarningSent = false
    this.active = null
  }

  restartAfterCancelTimeout() {
    const child = this.child

    this.finishActive()

    if (child && !child.killed) {
      child.kill()
    }

    this.drain()
  }

  failActiveAndQueued(payload) {
    if (this.active && !this.active.sessionState.cancelRequested) {
      this.active.sessionState.finalResultSeen = true
      this.active.emit(
        createXoderEvent(
          this.active.sessionState.id,
          XODER_AGENT_EVENT_TYPES.SESSION_FAILED,
          payload
        )
      )
    }

    this.finishActive()

    for (const item of this.queue.splice(0)) {
      if (!item.sessionState.cancelRequested) {
        item.sessionState.finalResultSeen = true
        item.emit(
          createXoderEvent(item.sessionState.id, XODER_AGENT_EVENT_TYPES.SESSION_FAILED, payload)
        )
      }
    }
  }

  dispose() {
    this.disposed = true
    this.failActiveAndQueued({
      code: 'RUNTIME_DISPOSED',
      message: 'Agent runtime worker was stopped.'
    })

    if (this.child && !this.child.killed) {
      this.writeControlRequest('end_session', {
        reason: 'xoder runtime shutdown'
      })
      setTimeout(() => {
        if (this.child && !this.child.killed) {
          this.child.kill()
        }
      }, 500)
    }

    this.onDisposed?.()
  }
}

export function buildClaudeCodeRuntimeInput(request = {}, runtimePath = '') {
  if (shouldUseTeamRuntime(request, runtimePath)) {
    return {
      mode: 'team',
      content: `/team ${buildTeamRuntimeRequest(request)}`
    }
  }

  if (shouldUseEmployeeRuntime(request, runtimePath)) {
    return {
      mode: 'employee',
      content: `/employee ${sanitizeSlashArg(request.options.employeeKey)} ${buildEmployeeRuntimeTask(request)}`
    }
  }

  return {
    mode: 'single-agent',
    content: buildClaudeCodePrompt(request)
  }
}

export function resolveClaudeCodeRuntimePath(explicitPath = '') {
  const candidates = [
    explicitPath,
    process.env.XODER_CLAUDE_CODE_PATH,
    process.resourcesPath ? join(process.resourcesPath, 'services', 'claude-code') : '',
    resolve(process.cwd(), 'services', 'claude-code'),
    resolve(process.cwd(), '..', '..', ...CLAUDE_CODE_RELATIVE_PARTS),
    resolve(currentDir, '..', '..', '..', '..', '..', '..', ...CLAUDE_CODE_RELATIVE_PARTS)
  ].filter(Boolean)
  const found = candidates.find(isClaudeCodeRuntimePath)

  if (found) {
    return found
  }

  const error = new Error(
    `Claude Code runtime was not found. Checked: ${candidates.map((item) => `"${item}"`).join(', ')}`
  )
  error.code = 'RUNTIME_NOT_FOUND'
  throw error
}

function isClaudeCodeRuntimePath(candidate) {
  return Boolean(
    candidate &&
      existsSync(candidate) &&
      (existsSync(join(candidate, CLI_ENTRY)) || existsSync(join(candidate, DIST_ENTRY)))
  )
}

function detectClaudeCodeRuntimeCapabilities(runtimePath) {
  const team = detectRuntimeCommand(runtimePath, 'team', TEAM_COMMAND_ENTRY, TEAM_DIST_ENTRY)
  const employee = detectRuntimeCommand(
    runtimePath,
    'employee',
    EMPLOYEE_COMMAND_ENTRY,
    EMPLOYEE_DIST_ENTRY
  )
  const hasTeamRuntime = team.headlessSupported
  const hasEmployeeRuntime = employee.headlessSupported
  const slashCommands = []

  if (employee.headlessSupported) {
    slashCommands.push({
      name: 'employee',
      aliases: ['employees'],
      description: 'Run and manage digital employees backed by agents',
      commands: ['list', 'status', 'log', 'experience', 'resume', '<name> <task>']
    })
  }

  if (team.headlessSupported) {
    slashCommands.push({
      name: 'team',
      aliases: ['teams'],
      description: 'Run a leader-led team of digital employees',
      commands: ['<request>', 'answer <answer>', 'status [runId]', 'log [runId]', 'result [runId]', 'stop [runId]', 'list']
    })
  }

  return {
    hasTeamRuntime,
    hasEmployeeRuntime,
    team,
    employee,
    commands: {
      team,
      employee
    },
    employees: employee.headlessSupported ? readRuntimeEmployees(runtimePath) : [],
    slashCommands
  }
}

function readRuntimeEmployees(runtimePath) {
  const settingsPath = join(runtimePath, '.claude', 'settings.local.json')

  try {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
    const employees = isRecord(settings.employees) ? settings.employees : {}

    return Object.entries(employees)
      .map(([name, config]) => ({
        name,
        agent: String(config?.agent || ''),
        description: String(config?.description || ''),
        memory: String(config?.memory || ''),
        worktreeIsolation: Boolean(config?.worktreeIsolation)
      }))
      .sort((left, right) => left.name.localeCompare(right.name))
  } catch {
    return []
  }
}

function shouldUseTeamRuntime(request = {}, runtimePath = '') {
  return (
    request.options?.expertMode === 'expert_team' &&
    hasHeadlessRuntimeCommand(runtimePath, 'team', TEAM_COMMAND_ENTRY, TEAM_DIST_ENTRY)
  )
}

function shouldUseEmployeeRuntime(request = {}, runtimePath = '') {
  return (
    request.options?.expertMode === 'digital_employee' &&
    Boolean(request.options?.employeeKey) &&
    hasHeadlessRuntimeCommand(runtimePath, 'employee', EMPLOYEE_COMMAND_ENTRY, EMPLOYEE_DIST_ENTRY)
  )
}

function hasHeadlessRuntimeCommand(runtimePath, name, sourceEntry, distEntry) {
  return detectRuntimeCommand(runtimePath, name, sourceEntry, distEntry).headlessSupported
}

function detectRuntimeCommand(runtimePath, name, sourceEntry, distEntry) {
  const sourcePath = join(runtimePath, sourceEntry)
  const distPath = join(runtimePath, distEntry)
  const sourceExists = existsSync(sourcePath)
  const distExists = existsSync(distPath)
  const filePath = sourceExists ? sourcePath : distExists ? distPath : ''
  const capability = createRuntimeCommandCapability(name, {
    detected: sourceExists || distExists,
    source: sourceExists ? sourceEntry : distExists ? distEntry : '',
    commandType: filePath ? readRuntimeCommandType(filePath) : ''
  })

  capability.headlessSupported = isHeadlessSafeCommandType(capability.commandType)
  capability.reason = getRuntimeCommandReason(capability)

  return capability
}

function createRuntimeCommandCapability(name, overrides = {}) {
  return {
    name,
    detected: false,
    headlessSupported: false,
    commandType: '',
    source: '',
    reason: '',
    ...overrides
  }
}

function readRuntimeCommandType(filePath) {
  try {
    const source = readFileSync(filePath, 'utf8')
    const match = source.match(/\btype\s*:\s*['"`]([^'"`]+)['"`]/)

    return match?.[1] || ''
  } catch {
    return ''
  }
}

function isHeadlessSafeCommandType(commandType) {
  return commandType === 'prompt'
}

function getRuntimeCommandReason(capability) {
  if (!capability.detected) {
    return 'Command source was not found in the runtime.'
  }

  if (capability.headlessSupported) {
    return 'Command type is safe for stream-json headless execution.'
  }

  if (capability.commandType === 'local-jsx') {
    return 'local-jsx commands require the interactive UI and are not available through stream-json headless execution.'
  }

  return 'Command type is not verified as stream-json headless safe.'
}

function buildTeamRuntimeRequest(request = {}) {
  return [
    request.prompt,
    '',
    'Xoder runtime context:',
    request.workspace?.path ? `Workspace path: ${request.workspace.path}` : '',
    request.workspace?.name ? `Workspace name: ${request.workspace.name}` : '',
    `Run mode: ${request.mode || 'auto'}`,
    `Intent mode: ${request.options?.intentMode || 'auto'}`,
    `Approval mode: ${request.permissions?.approvalMode || 'auto'}`,
    request.permissions?.allowShell ? 'Shell: allowed by Xoder UI.' : 'Shell: avoid unless necessary.',
    request.permissions?.allowWrite ? 'Writes: allowed by Xoder UI.' : 'Writes: prefer read-only work.',
    'Use the runtime team mode normally: ask clarification when needed, split independent work into employee tasks, and keep result files in the team run directory.'
  ]
    .filter(Boolean)
    .join('\n')
}

function buildEmployeeRuntimeTask(request = {}) {
  return [
    request.prompt,
    '',
    request.workspace?.path ? `Workspace path: ${request.workspace.path}` : '',
    `Run mode: ${request.mode || 'auto'}`
  ]
    .filter(Boolean)
    .join('\n')
}

function sanitizeSlashArg(value = '') {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
}

function buildSafeSlashCommand(command, args = '') {
  const name = sanitizeSlashArg(command)

  if (!name || !['team', 'employee'].includes(name)) {
    return ''
  }

  return `/${name}${String(args || '').trim() ? ` ${String(args).trim()}` : ''}`
}

function getClaudeCodeCliArgs(runtimePath) {
  const commonArgs = [
    '--verbose',
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--permission-prompt-tool',
    'stdio',
    '-p'
  ]

  if (existsSync(join(runtimePath, CLI_ENTRY))) {
    return ['run', join(runtimePath, CLI_ENTRY), ...commonArgs]
  }

  return [join(runtimePath, DIST_ENTRY), ...commonArgs]
}

function isTeamRuntimeItem(item) {
  return item?.sessionState?.bridgeMode === 'team'
}

function shouldHoldTeamSessionForAnswer(item, rawEvent = {}) {
  if (!isTeamRuntimeItem(item)) {
    return false
  }

  const result = parseTeamCliResult(rawEvent.result)
  const status = result?.status || item.sessionState.teamRuntime?.status || ''

  if (result?.runId) {
    item.sessionState.teamRunId = result.runId
  }

  return status === 'waiting_for_user'
}

function readCurrentTeamState(agentCwd, sessionState = {}) {
  const teamRoot = join(agentCwd, TEAM_RUN_ROOT)

  if (!existsSync(teamRoot)) {
    return null
  }

  const requestedRunId = String(sessionState.teamRunId || '').trim()

  if (requestedRunId) {
    const state = readTeamStateFile(join(teamRoot, requestedRunId, 'state.json'))

    if (state) {
      return state
    }
  }

  let entries = []

  try {
    entries = readdirSync(teamRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  } catch {
    return null
  }

  const prompt = String(sessionState.request?.prompt || '').trim()
  const createdAfter = Number(sessionState.createdAt || Date.now()) - 30000
  const states = entries
    .map((entry) => {
      const statePath = join(teamRoot, entry.name, 'state.json')
      const state = readTeamStateFile(statePath)

      if (!state) {
        return null
      }

      const stat = safeStat(statePath)
      const createdAt = Date.parse(state.createdAt || '') || stat?.ctimeMs || 0
      const updatedAt = Date.parse(state.updatedAt || '') || stat?.mtimeMs || 0
      const requestMatches = prompt && String(state.request || '').includes(prompt.slice(0, 80))
      const recentEnough = createdAt >= createdAfter || updatedAt >= createdAfter

      if (!requestMatches && !recentEnough) {
        return null
      }

      return {
        state,
        score: (requestMatches ? 10_000_000_000 : 0) + Math.max(createdAt, updatedAt)
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score)

  return states[0]?.state || null
}

function readTeamStateFile(statePath) {
  try {
    return JSON.parse(readFileSync(statePath, 'utf8'))
  } catch {
    return null
  }
}

function safeStat(filePath) {
  try {
    return statSync(filePath)
  } catch {
    return null
  }
}

function getTeamStateSignature(state = {}) {
  return JSON.stringify({
    runId: state.runId,
    status: state.status,
    updatedAt: state.updatedAt,
    currentQuestion: state.currentQuestion,
    planSummary: state.planSummary,
    resultSummary: state.resultSummary,
    blockedReason: state.blockedReason,
    tasks: Array.isArray(state.tasks)
      ? state.tasks.map((task) => ({
          id: task.id,
          employee: task.employee,
          status: task.status,
          summary: task.summary,
          question: task.question,
          error: task.error,
          diffPath: task.diffPath,
          changedFiles: task.changedFiles
        }))
      : []
  })
}

function mapTeamRunStateToXoderEvents(state = {}, item) {
  const sessionId = item.sessionState.id
  const events = []
  const runId = String(state.runId || '').trim()
  const tasks = Array.isArray(state.tasks) ? state.tasks : []
  const normalizedTasks = tasks.map((task) => buildTeamTaskPayload(state, task))

  events.push(
    createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.PLAN_UPDATED, {
      source: 'claude-code-team',
      runId,
      runDir: state.runDir || '',
      status: normalizeTeamRunStatus(state.status),
      summary: state.planSummary || state.resultSummary || state.blockedReason || state.request || '',
      request: state.request || '',
      execution: state.execution || '',
      mergeStrategy: state.mergeStrategy || '',
      autoCreatedEmployees: Array.isArray(state.autoCreatedEmployees) ? state.autoCreatedEmployees : [],
      tasks: normalizedTasks
    })
  )

  for (const task of tasks) {
    const payload = buildTeamTaskPayload(state, task)
    const previousStatus = item.teamTaskStatuses.get(payload.taskId)
    const eventType = getTeamTaskEventType(payload.status, previousStatus)

    events.push(createXoderEvent(sessionId, eventType, payload))

    if (!previousStatus) {
      events.push(
        createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.AGENT_ASSIGNED, {
          ...payload,
          source: 'claude-code-team'
        })
      )
    }

    item.teamTaskStatuses.set(payload.taskId, payload.status)
  }

  const reviewFiles = []

  for (const task of tasks) {
    const taskPayload = buildTeamTaskPayload(state, task)
    const changedFiles = Array.isArray(task.changedFiles) ? task.changedFiles : []

    for (const changedFile of changedFiles) {
      const key = `${runId}:${task.id}:file:${changedFile}`

      if (item.teamArtifactKeys.has(key)) {
        continue
      }

      item.teamArtifactKeys.add(key)
      const artifactPayload = {
        toolUseId: key,
        name: getFileName(changedFile),
        path: changedFile,
        toolName: 'Team',
        operation: 'team-change',
        preview: task.summary || '',
        kind: getArtifactKind(changedFile),
        status: taskPayload.status,
        source: 'claude-code-team',
        metadata: taskPayload.metadata
      }

      events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.ARTIFACT_CHANGED, artifactPayload))
      reviewFiles.push({
        id: key,
        path: changedFile,
        name: getFileName(changedFile),
        operation: 'team-change',
        toolName: 'Team',
        additions: 0,
        deletions: 0,
        status: taskPayload.status
      })
    }

    if (task.diffPath) {
      const key = `${runId}:${task.id}:diff:${task.diffPath}`

      if (!item.teamArtifactKeys.has(key)) {
        item.teamArtifactKeys.add(key)
        events.push(
          createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.ARTIFACT_CHANGED, {
            toolUseId: key,
            name: getFileName(task.diffPath),
            path: task.diffPath,
            toolName: 'Team',
            operation: 'diff',
            preview: task.summary || task.error || '',
            kind: 'diff',
            status: taskPayload.status,
            source: 'claude-code-team',
            metadata: taskPayload.metadata
          })
        )
      }
    }
  }

  if (reviewFiles.length) {
    events.push(
      createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.REVIEW_UPDATED, {
        files: reviewFiles,
        additions: 0,
        deletions: 0,
        summary: `${reviewFiles.length} team changed file event(s)`,
        status: normalizeTeamRunStatus(state.status),
        source: 'claude-code-team',
        runId
      })
    )
  }

  if (['completed', 'blocked', 'stopped'].includes(String(state.status || ''))) {
    const resultPath = state.runDir ? join(state.runDir, 'result.md') : ''
    const key = `${runId}:result:${resultPath}`

    if (resultPath && !item.teamArtifactKeys.has(key)) {
      item.teamArtifactKeys.add(key)
      events.push(
        createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.ARTIFACT_CHANGED, {
          toolUseId: key,
          name: 'result.md',
          path: resultPath,
          toolName: 'Team',
          operation: 'result',
          preview: state.resultSummary || state.blockedReason || '',
          kind: 'markdown',
          status: normalizeTeamRunStatus(state.status),
          source: 'claude-code-team',
          metadata: {
            runId,
            runDir: state.runDir || ''
          }
        })
      )
    }
  }

  const question = String(state.currentQuestion || '').trim()

  if (state.status === 'waiting_for_user' && question) {
    const requestId = `team:${runId}:question`
    const payload = {
      requestId,
      toolUseId: requestId,
      name: 'Team clarification',
      toolName: 'TeamMode',
      title: 'Team needs input',
      summary: question.replace(/\s+/g, ' ').slice(0, 220),
      questions: [
        {
          id: 'team-question',
          header: 'Team',
          question,
          multiSelect: false,
          options: []
        }
      ],
      answers: {},
      annotations: {
        runId,
        runDir: state.runDir || ''
      },
      input: {
        runId,
        question
      },
      inputPreview: question,
      status: 'pending',
      source: 'claude-code-team'
    }

    item.pendingTeamQuestions.set(requestId, {
      requestId,
      question,
      payload
    })

    if (item.teamLastQuestionText !== question) {
      item.teamLastQuestionText = question
      events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.QUESTION_REQUESTED, payload))
    }
  } else {
    item.teamLastQuestionText = ''
  }

  return events
}

function buildTeamTaskPayload(state = {}, task = {}) {
  const runId = String(state.runId || '').trim()
  const taskId = `${runId}:${task.id || task.title || 'task'}`
  const status = normalizeTeamTaskStatus(task.status)
  const output = task.summary || task.error || task.question || ''

  return {
    taskId,
    toolUseId: taskId,
    title: task.title || task.id || 'Team task',
    description: output || task.title || '',
    summary: output || status,
    detail: output || status,
    preview: task.diffPath || task.worktreePath || task.taskDir || '',
    output,
    agentType: task.employee || '',
    owner: task.employee || '',
    status,
    source: 'claude-code-team',
    outputFile: task.diffPath || task.taskDir || '',
    metadata: {
      runId,
      runDir: state.runDir || '',
      teamStatus: state.status || '',
      taskDir: task.taskDir || '',
      worktreePath: task.worktreePath || '',
      worktreeBranch: task.worktreeBranch || '',
      diffPath: task.diffPath || '',
      plannedFiles: Array.isArray(task.plannedFiles) ? task.plannedFiles : [],
      changedFiles: Array.isArray(task.changedFiles) ? task.changedFiles : []
    },
    raw: task
  }
}

function getTeamTaskEventType(status, previousStatus) {
  if (status === 'completed') {
    return XODER_AGENT_EVENT_TYPES.TASK_COMPLETED
  }

  if (status === 'failed') {
    return XODER_AGENT_EVENT_TYPES.TASK_FAILED
  }

  if (!previousStatus && status === 'pending') {
    return XODER_AGENT_EVENT_TYPES.TASK_CREATED
  }

  if (!previousStatus || status === 'running') {
    return XODER_AGENT_EVENT_TYPES.TASK_STARTED
  }

  return XODER_AGENT_EVENT_TYPES.TASK_UPDATED
}

function normalizeTeamTaskStatus(status = '') {
  const normalized = String(status || '').trim()

  if (normalized === 'merged' || normalized === 'completed') {
    return 'completed'
  }

  if (normalized === 'blocked') {
    return 'failed'
  }

  if (normalized === 'needs_leader_decision') {
    return 'pending'
  }

  if (normalized === 'running') {
    return 'running'
  }

  return normalized || 'pending'
}

function normalizeTeamRunStatus(status = '') {
  const normalized = String(status || '').trim()

  if (normalized === 'stopped') {
    return 'cancelled'
  }

  if (normalized === 'blocked') {
    return 'failed'
  }

  return normalized || 'pending'
}

function getArtifactKind(filePath = '') {
  const path = String(filePath || '').toLowerCase()

  if (path.endsWith('.md') || path.endsWith('.markdown')) {
    return 'markdown'
  }

  if (path.endsWith('.diff') || path.endsWith('.patch')) {
    return 'diff'
  }

  return 'file'
}

function extractTeamQuestionAnswer(response = {}, payload = {}) {
  const updatedInput = isRecord(response.updatedInput) ? response.updatedInput : {}
  const answers = isRecord(updatedInput.answers)
    ? updatedInput.answers
    : isRecord(response.answers)
      ? response.answers
      : {}
  const answerText = [
    ...Object.values(answers).flatMap((value) => (Array.isArray(value) ? value : [value])),
    updatedInput.answer,
    response.answer,
    response.message
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join('\n')

  if (answerText) {
    return answerText
  }

  return String(payload.input?.answer || '').trim()
}

function buildTeamAnswerCommand(answer = '') {
  return `/team answer ${String(answer || '').replace(/\s+/g, ' ').trim()}`
}

export function createClaudeCodeSdkUserMessage(content) {
  const uuid = randomUUID()

  return {
    type: 'user',
    content,
    uuid,
    session_id: '',
    message: {
      role: 'user',
      content
    },
    parent_tool_use_id: null
  }
}

export function getClaudeCodePermissionRequest(rawEvent) {
  if (rawEvent?.type !== 'control_request') {
    return null
  }

  const request = rawEvent.request || {}

  if (request.subtype !== 'can_use_tool') {
    return null
  }

  const requestId = String(rawEvent.request_id || request.request_id || '').trim()

  if (!requestId) {
    return null
  }

  const toolName = String(request.tool_name || request.toolName || request.name || 'Tool').trim()
  const input = isRecord(request.input) ? request.input : {}

  return {
    requestId,
    subtype: request.subtype,
    toolName: toolName || 'Tool',
    input,
    toolUseId: String(request.tool_use_id || request.toolUseID || request.toolUseId || '').trim(),
    actionDescription: String(
      request.action_description || request.description || request.actionDescription || ''
    ).trim(),
    permissionSuggestions: Array.isArray(request.permission_suggestions)
      ? request.permission_suggestions
      : [],
    blockedPath: String(request.blocked_path || request.blockedPath || '').trim(),
    raw: request
  }
}

export function decideClaudeCodePermission(runtimeRequest = {}, permission = {}) {
  const permissions = runtimeRequest.permissions || {}
  const toolName = String(permission.toolName || '').trim()
  const policy = String(permissions.policy || '').trim().toLowerCase()
  const risk = classifyClaudeCodePermission(runtimeRequest, permission)

  if (permissions.denyAll) {
    return denyPermission('Denied by Xoder denyAll permission setting.', risk)
  }

  if (matchesToolName(permissions.denyTools, toolName)) {
    return denyPermission(`Denied by Xoder denyTools permission setting for ${toolName}.`, risk)
  }

  if (permissions.allowDangerouslyApproveAll) {
    return allowPermission(
      permission,
      'Dangerously auto-approved by Xoder runtime permission bridge.',
      risk
    )
  }

  if (risk.requiresApproval) {
    return denyPermission(risk.reason, risk)
  }

  if (policy === 'semi_auto' && !READ_TOOL_NAMES.has(toolName) && SAFE_SESSION_TOOL_NAMES.has(toolName) === false) {
    return denyPermission(`Semi-auto policy requires approval for ${toolName || 'this tool'}.`, risk)
  }

  if (policy === 'overnight' && (SHELL_TOOL_NAMES.has(toolName) || WRITE_TOOL_NAMES.has(toolName) || NETWORK_TOOL_NAMES.has(toolName))) {
    return denyPermission(`Overnight policy requires morning approval for ${toolName || 'this tool'}.`, risk)
  }

  if (permissions.workspaceAuto && isOutsideWorkspace(permission, runtimeRequest.workspace?.path)) {
    return denyPermission('Workspace auto policy blocked an operation outside the selected workspace.', risk)
  }

  if (matchesToolName(permissions.allowTools, toolName)) {
    return allowPermission(
      permission,
      `Allowed by Xoder allowTools permission setting for ${toolName}.`,
      risk
    )
  }

  if (READ_TOOL_NAMES.has(toolName) && permissions.allowRead) {
    return allowPermission(permission, 'Allowed by Xoder read permission setting.', risk)
  }

  if (WRITE_TOOL_NAMES.has(toolName) && permissions.allowWrite) {
    return allowPermission(permission, 'Allowed by Xoder write permission setting.', risk)
  }

  if (SHELL_TOOL_NAMES.has(toolName) && permissions.allowShell) {
    return allowPermission(permission, 'Allowed by Xoder shell permission setting.', risk)
  }

  if (WEB_SEARCH_TOOL_NAMES.has(toolName) && permissions.allowWebSearch) {
    return allowPermission(permission, 'Allowed by Xoder web search permission setting.', risk)
  }

  if (WEB_FETCH_TOOL_NAMES.has(toolName) && permissions.allowWebFetch) {
    return allowPermission(permission, 'Allowed by Xoder web fetch permission setting.', risk)
  }

  if (NETWORK_TOOL_NAMES.has(toolName) && permissions.allowNetwork) {
    return allowPermission(permission, 'Allowed by Xoder network permission setting.', risk)
  }

  if (SAFE_SESSION_TOOL_NAMES.has(toolName)) {
    return allowPermission(permission, 'Allowed by Xoder safe session tool policy.', risk)
  }

  if (TASK_TOOL_NAMES.has(toolName) && permissions.allowTask !== false) {
    return allowPermission(permission, 'Allowed by Xoder task delegation policy.', risk)
  }

  if (SKILL_TOOL_NAMES.has(toolName) && permissions.allowSkill !== false) {
    return allowPermission(permission, 'Allowed by Xoder skill policy.', risk)
  }

  return denyPermission(`Permission for ${toolName || 'this tool'} was not allowed by Xoder settings.`, risk)
}

export function classifyClaudeCodePermission(runtimeRequest = {}, permission = {}) {
  const toolName = String(permission.toolName || '').trim()
  const input = isRecord(permission.input) ? permission.input : {}
  const command = String(input.command || input.cmd || '').trim()
  const paths = [
    input.file_path,
    input.path,
    input.cwd,
    input.workdir,
    permission.blockedPath
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
  const kinds = new Set()

  if (SHELL_TOOL_NAMES.has(toolName) || command) {
    kinds.add('shell')
  }

  if (NETWORK_TOOL_NAMES.has(toolName) || /\b(?:curl|wget|Invoke-WebRequest|npm\s+publish|pip\s+install)\b/i.test(command)) {
    kinds.add('network')
  }

  if (/\b(?:git\s+push|git\s+send-email)\b/i.test(command)) {
    kinds.add('git_push')
  }

  if (
    /\b(?:gh\s+pr\s+create|glab\s+mr\s+create|gitee.*pull.?request|pull.?request.*create|merge.?request.*create)\b/i.test(
      command
    )
  ) {
    kinds.add('pr_create')
  }

  if (isDeleteCommand(command)) {
    kinds.add(isDirectoryDeleteCommand(command) ? 'delete_directory' : 'delete_file')
  }

  if (paths.some((value) => isSensitivePath(value))) {
    kinds.add('sensitive_file')
  }

  if (runtimeRequest.workspace?.path && paths.some((value) => !isWithinWorkspace(value, runtimeRequest.workspace.path))) {
    kinds.add('outside_workspace')
  }

  const normalizedKinds = Array.from(kinds)
  const criticalKinds = new Set(['delete_directory', 'git_push', 'pr_create', 'sensitive_file'])
  const highKinds = new Set(['delete_file', 'outside_workspace', 'network', 'shell'])
  const riskLevel = normalizedKinds.some((kind) => criticalKinds.has(kind))
    ? 'critical'
    : normalizedKinds.some((kind) => highKinds.has(kind))
      ? 'high'
      : normalizedKinds.length
        ? 'medium'
        : 'low'
  const policy = String(runtimeRequest.permissions?.policy || '').trim().toLowerCase()
  const requiresApproval =
    riskLevel === 'critical' ||
    policy === 'manual' ||
    (policy === 'overnight' && riskLevel !== 'low') ||
    (policy === 'workspace_auto' && normalizedKinds.includes('outside_workspace')) ||
    (policy === 'semi_auto' && !READ_TOOL_NAMES.has(toolName) && !SAFE_SESSION_TOOL_NAMES.has(toolName))

  return {
    riskLevel,
    kinds: normalizedKinds,
    requiresApproval,
    reason: buildPermissionRiskReason(normalizedKinds, toolName),
    paths,
    command
  }
}

function shouldAutoApprovePermission(runtimeRequest = {}, permission = {}) {
  const permissions = runtimeRequest.permissions || {}
  const policy = String(permissions.policy || '').trim().toLowerCase()
  const toolName = String(permission.toolName || '').trim()
  const risk = classifyClaudeCodePermission(runtimeRequest, permission)

  if (permissions.autoApproveAll === false || permissions.denyAll) {
    return false
  }

  if (matchesToolName(permissions.denyTools, toolName)) {
    return true
  }

  if (risk.requiresApproval) {
    return false
  }

  if (policy === 'semi_auto') {
    return READ_TOOL_NAMES.has(toolName) || SAFE_SESSION_TOOL_NAMES.has(toolName)
  }

  if (policy === 'overnight') {
    return (
      READ_TOOL_NAMES.has(toolName) ||
      SAFE_SESSION_TOOL_NAMES.has(toolName) ||
      TASK_TOOL_NAMES.has(toolName) ||
      SKILL_TOOL_NAMES.has(toolName)
    )
  }

  if (policy === 'workspace_auto' && isOutsideWorkspace(permission, runtimeRequest.workspace?.path)) {
    return false
  }

  return permissions.autoApproveAll !== false
}

function isOutsideWorkspace(permission = {}, workspacePath = '') {
  const root = normalizePermissionPath(workspacePath)

  if (!root) {
    return false
  }

  const input = permission.input || {}
  const candidates = [input.file_path, input.path, input.cwd, input.workdir, permission.blockedPath]
    .map((value) => normalizePermissionPath(value))
    .filter((value) => value && isAbsolutePermissionPath(value))

  return candidates.some((candidate) => candidate !== root && !candidate.startsWith(`${root}/`))
}

function isWithinWorkspace(value, workspacePath) {
  const root = normalizePermissionPath(workspacePath)
  const candidate = normalizePermissionPath(value)

  return (
    !candidate ||
    !root ||
    !isAbsolutePermissionPath(candidate) ||
    candidate === root ||
    candidate.startsWith(`${root}/`)
  )
}

function isSensitivePath(value = '') {
  const normalized = String(value || '').replace(/\\/g, '/').toLowerCase()
  const name = normalized.split('/').filter(Boolean).pop() || ''

  return (
    name === '.env' ||
    name.startsWith('.env.') ||
    name === 'id_rsa' ||
    name === 'id_ed25519' ||
    name.includes('secret') ||
    name.includes('credential') ||
    name.includes('private-key')
  )
}

function isDeleteCommand(command = '') {
  return /\b(?:rm|rmdir|del|erase|Remove-Item|git\s+rm|git\s+clean)\b/i.test(command)
}

function isDirectoryDeleteCommand(command = '') {
  return /(?:\brmdir\b|\bRemove-Item\b.*(?:-Recurse|-Force)|\brm\s+-[^\s]*r[^\s]*|\bgit\s+clean\s+-[^\s]*d[^\s]*)/i.test(
    command
  )
}

function buildPermissionRiskReason(kinds = [], toolName = '') {
  if (!kinds.length) {
    return `Permission requested for ${toolName || 'this tool'}.`
  }

  const labels = {
    shell: 'shell command',
    network: 'network access',
    git_push: 'git push',
    pr_create: 'PR/MR creation',
    delete_file: 'file deletion',
    delete_directory: 'directory deletion',
    sensitive_file: 'sensitive file access',
    outside_workspace: 'workspace-outside path'
  }

  return `Explicit approval required: ${kinds.map((kind) => labels[kind] || kind).join(', ')}.`
}

function isAbsolutePermissionPath(value = '') {
  return /^(?:[a-z]:\/|\/|\\\\)/i.test(String(value || ''))
}

function normalizePermissionPath(value = '') {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase()
}

export function createClaudeCodePermissionResponse(rawEvent, decision = {}) {
  const permission = getClaudeCodePermissionRequest(rawEvent)

  if (!permission) {
    return null
  }

  const allow = decision.allow !== false
  const responsePayload = allow
    ? {
        behavior: 'allow',
        updatedInput: isRecord(decision.updatedInput) ? decision.updatedInput : permission.input,
        toolUseID: permission.toolUseId || undefined,
        decisionClassification: decision.decisionClassification || 'user_temporary'
      }
    : {
        behavior: 'deny',
        message: decision.message || 'Denied by Xoder runtime permission bridge.',
        interrupt: decision.interrupt || undefined,
        toolUseID: permission.toolUseId || undefined,
        decisionClassification: decision.decisionClassification || 'user_reject'
      }

  return {
    type: 'control_response',
    response: {
      subtype: 'success',
      request_id: permission.requestId,
      response: responsePayload
    }
  }
}

export function createClaudeCodePermissionDecisionFromResponse(response = {}, permission = {}) {
  const behavior = String(response.behavior || response.action || '').trim().toLowerCase()
  const allow = response.allow === true || behavior === 'allow' || behavior === 'approve'

  if (allow) {
    return {
      allow: true,
      message: response.message || 'Approved by Xoder user.',
      updatedInput: isRecord(response.updatedInput) ? response.updatedInput : permission.input || {},
      decisionClassification: response.decisionClassification || 'user_temporary',
      autoApproved: false
    }
  }

  return {
    allow: false,
    message: response.message || 'Denied by Xoder user.',
    interrupt: Boolean(response.interrupt),
    decisionClassification: response.decisionClassification || 'user_reject',
    autoApproved: false
  }
}

function allowPermission(permission, message, risk = {}) {
  return {
    allow: true,
    message,
    risk,
    updatedInput: isRecord(permission.input) ? permission.input : {},
    decisionClassification: 'user_temporary',
    autoApproved: true
  }
}

function denyPermission(message, risk = {}) {
  return {
    allow: false,
    message,
    risk,
    decisionClassification: 'user_reject',
    autoApproved: false
  }
}

function createPermissionEventPayload(permission, extra = {}) {
  return {
    requestId: permission.requestId,
    toolUseId: permission.toolUseId,
    name: `Permission: ${permission.toolName}`,
    toolName: permission.toolName,
    input: permission.input,
    inputPreview: summarizeToolInputDetails(permission.toolName, permission.input),
    summary:
      permission.actionDescription ||
      summarizeToolInput(permission.toolName, permission.input) ||
      permission.toolName,
    actionDescription: permission.actionDescription,
    permissionSuggestions: permission.permissionSuggestions,
    blockedPath: permission.blockedPath,
    ...extra
  }
}

function createQuestionEventPayload(permission, extra = {}) {
  const input = isRecord(permission.input) ? permission.input : {}
  const questions = normalizeQuestions(input.questions)

  return {
    requestId: permission.requestId,
    toolUseId: permission.toolUseId,
    name: 'Question',
    toolName: permission.toolName,
    title: questions[0]?.header || 'Question',
    summary:
      permission.actionDescription ||
      questions[0]?.question ||
      summarizeToolInput(permission.toolName, input),
    actionDescription: permission.actionDescription,
    questions,
    answers: isRecord(extra.answers) ? extra.answers : isRecord(input.answers) ? input.answers : {},
    annotations: isRecord(input.annotations) ? input.annotations : {},
    input,
    inputPreview: summarizeToolInputDetails(permission.toolName, input),
    raw: permission.raw,
    ...extra
  }
}

function createPlanEventPayload(permission, extra = {}) {
  const input = isRecord(permission.input) ? permission.input : {}
  const plan = String(input.plan || input.content || input.markdown || '').trim()
  const planFilePath = String(input.planFilePath || input.file_path || input.path || '').trim()

  return {
    requestId: permission.requestId,
    toolUseId: permission.toolUseId,
    name: 'Plan',
    toolName: permission.toolName,
    title: planFilePath ? getFileName(planFilePath) : 'Plan approval',
    summary:
      permission.actionDescription ||
      (plan ? trimForPreview(plan.replace(/\s+/g, ' '), 240) : summarizeToolInput(permission.toolName, input)),
    actionDescription: permission.actionDescription,
    plan,
    planFilePath,
    allowedPrompts: Array.isArray(input.allowedPrompts) ? input.allowedPrompts : [],
    input,
    inputPreview: summarizeToolInputDetails(permission.toolName, input),
    raw: permission.raw,
    ...extra
  }
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return []
  }

  return questions.map((question, questionIndex) => ({
    id: String(question.id || question.question || `question-${questionIndex + 1}`),
    header: String(question.header || `Question ${questionIndex + 1}`).slice(0, 32),
    question: String(question.question || '').trim(),
    multiSelect: Boolean(question.multiSelect),
    options: Array.isArray(question.options)
      ? question.options.map((option, optionIndex) => ({
          id: String(option.id || option.label || `option-${optionIndex + 1}`),
          label: String(option.label || `Option ${optionIndex + 1}`).trim(),
          description: String(option.description || '').trim(),
          preview: String(option.preview || '').trim()
        }))
      : []
  }))
}

function getInteractivePermissionKind(permission) {
  if (QUESTION_TOOL_NAMES.has(permission.toolName)) {
    return 'question'
  }

  if (PLAN_TOOL_NAMES.has(permission.toolName)) {
    return 'plan'
  }

  return ''
}

function getPermissionResolutionEventType(kind, wrote, decision = {}) {
  if (kind === 'question') {
    return wrote && decision.allow
      ? XODER_AGENT_EVENT_TYPES.QUESTION_ANSWERED
      : XODER_AGENT_EVENT_TYPES.QUESTION_DECLINED
  }

  if (kind === 'plan') {
    return wrote && decision.allow
      ? XODER_AGENT_EVENT_TYPES.PLAN_APPROVED
      : XODER_AGENT_EVENT_TYPES.PLAN_REJECTED
  }

  return wrote && decision.allow
    ? XODER_AGENT_EVENT_TYPES.PERMISSION_GRANTED
    : XODER_AGENT_EVENT_TYPES.PERMISSION_DENIED
}

function getRequestedPermissionMode(request = {}) {
  if (request.mode === 'plan') {
    return 'plan'
  }

  if (request.mode === 'fast') {
    return 'acceptEdits'
  }

  return 'default'
}

function getRequestedMaxThinkingTokens(request = {}) {
  if (request.mode === 'fast') {
    return 0
  }

  return null
}

function getFileName(filePath = '') {
  return String(filePath).split(/[\\/]/).filter(Boolean).pop() || ''
}

function trimForPreview(value, limit = 1200) {
  const text = String(value ?? '')

  if (text.length <= limit) {
    return text
  }

  return `${text.slice(0, limit)}\n... truncated ${text.length - limit} chars`
}

function matchesToolName(list, toolName) {
  if (!Array.isArray(list) || !toolName) {
    return false
  }

  return list.some((item) => String(item).trim().toLowerCase() === toolName.toLowerCase())
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function readDuration(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const duration = Number(value)
  return Number.isFinite(duration) && duration >= 0 ? Math.floor(duration) : fallback
}

function readConcurrentSessionLimit(value, fallback = 2) {
  const limit = Number(value)

  if (!Number.isFinite(limit) || limit < 1) {
    return fallback
  }

  return Math.min(Math.floor(limit), 8)
}

function shouldIsolateSession(request = {}) {
  const options = isRecord(request.options) ? request.options : {}

  return options.sessionIsolation === true || options.concurrent === true
}

function resolveBunSpawn(configuredCommand) {
  if (process.platform !== 'win32') {
    return {
      command: configuredCommand,
      argsPrefix: []
    }
  }

  const directCandidates = [
    process.env.XODER_BUN_EXE,
    configuredCommand && configuredCommand.toLowerCase().endsWith('.exe') ? configuredCommand : ''
  ].filter(Boolean)
  const directCommand = directCandidates.find((candidate) => existsSync(candidate))

  if (directCommand) {
    return {
      command: directCommand,
      argsPrefix: []
    }
  }

  return {
    command: 'cmd.exe',
    argsPrefix: ['/d', '/s', '/c', configuredCommand || 'bun']
  }
}

function resolveAgentCwd(request, runtimePath) {
  const workspacePath = request?.workspace?.path

  if (workspacePath && existsSync(workspacePath)) {
    return workspacePath
  }

  return runtimePath
}

function consumeLines(buffer, onLine) {
  const lines = buffer.split(/\r?\n/)
  const tail = lines.pop() ?? ''

  for (const line of lines) {
    if (line.trim()) {
      onLine(line)
    }
  }

  return tail
}

function handleStdoutLine(sessionState, line, emit, options = {}) {
  const trimmed = String(line || '').trim()

  if (!trimmed) {
    return null
  }

  try {
    const rawEvent = JSON.parse(trimmed)
    const events = mapClaudeStreamEvent(rawEvent, sessionState, {
      holdTeamWaitingResult: Boolean(options.holdTeamWaitingResult)
    })

    if (!options.suppressEvents) {
      emitRuntimeRaw(sessionState, emit, trimmed, rawEvent)
      for (const event of events) {
        emit(event)
      }
    }

    return {
      rawEvent,
      events
    }
  } catch {
    if (!options.suppressEvents) {
      emitRuntimeStderr(sessionState, emit, trimmed, 'stdout')
    }

    return null
  }
}

function emitRuntimeRaw(sessionState, emit, line, rawEvent) {
  emit(
    createXoderEvent(sessionState.id, XODER_AGENT_EVENT_TYPES.RUNTIME_RAW, {
      source: 'stdout',
      rawType: rawEvent?.type || '',
      rawSubtype: rawEvent?.subtype || '',
      rawSessionId: rawEvent?.session_id || rawEvent?.message?.id || '',
      line,
      raw: rawEvent
    })
  )
}

function emitRuntimeStderr(sessionState, emit, line, source) {
  const message = String(line || '').trim()

  if (!message) {
    return
  }

  emit(
    createXoderEvent(sessionState.id, XODER_AGENT_EVENT_TYPES.RUNTIME_STDERR, {
      source,
      message
    })
  )
}
