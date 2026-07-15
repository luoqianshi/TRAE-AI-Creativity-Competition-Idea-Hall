import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

import { AgentRuntimeManager } from '../agent-runtime/index.js'

const execFileAsync = promisify(execFile)
const DEFAULT_TIMEOUT_MS = 120000
const TERMINAL_SESSION_EVENTS = new Set([
  'session.completed',
  'session.failed',
  'session.cancelled'
])

export class DigitalEmployeeManager extends EventEmitter {
  constructor(options = {}) {
    super()
    this.agentRuntimeManager = options.agentRuntimeManager || new AgentRuntimeManager()
    this.jobs = new Map()
    this.sessionToJob = new Map()
    this.jobRoot = resolve(options.jobRoot || join(process.cwd(), '.xoder', 'digital-employee-jobs'))

    this.agentRuntimeManager.on('event', (event) => {
      this.forwardAgentEvent(event)
    })
  }

  startJob(input = {}, context = {}) {
    const request = normalizeDigitalEmployeeRequest(input)

    if (!request.goal) {
      const error = new Error('Digital employee goal is required.')
      error.code = 'GOAL_REQUIRED'
      throw error
    }

    if (!request.workspace.path) {
      const error = new Error('Workspace path is required.')
      error.code = 'NO_WORKSPACE'
      throw error
    }

    const now = Date.now()
    const jobId = String(request.jobId || `job_${now}_${randomUUID().slice(0, 8)}`)
    const persisted = request.resume ? readPersistedJobSnapshot(this.jobRoot, jobId) : null
    const stages = mergePersistedStages(persisted?.stages)
    const job = {
      id: jobId,
      status: 'queued',
      request,
      webContentsId: context.webContentsId || 0,
      sessionId: '',
      originalWorkspace: request.workspace,
      executionWorkspace: persisted?.executionWorkspace || null,
      git: persisted?.git || null,
      release: persisted?.release || null,
      stages,
      events: [],
      pendingQuestions: new Map(),
      waitingQuestionId: '',
      report: null,
      cancelRequested: false,
      paused: false,
      pauseRequested: false,
      pauseSessionIds: new Set(),
      resumeWaiters: [],
      resume: Boolean(request.resume),
      persistChain: Promise.resolve(),
      createdAt: now,
      updatedAt: now
    }

    this.jobs.set(job.id, job)
    this.persistJob(job)
    setImmediate(() => {
      this.runJob(job).catch((error) => {
        this.failJob(job, 'digital.job.failed', {
          code: error?.code || 'DIGITAL_JOB_FAILED',
          message: error?.message || 'Digital employee job failed.'
        })
      })
    })

    return this.serializeJob(job)
  }

  stopJob(jobId) {
    const job = this.jobs.get(String(jobId || ''))

    if (!job) {
      return false
    }

    job.cancelRequested = true
    job.pauseRequested = false
    job.paused = false
    this.resolveResumeWaiters(job)

    if (job.sessionId) {
      this.agentRuntimeManager.stopSession(job.sessionId)
    }

    this.cancelPendingQuestions(job, 'Digital employee job was cancelled by the user.')

    if (!['completed', 'failed', 'cancelled'].includes(job.status)) {
      job.status = 'cancelled'
      this.emitJobEvent(job, 'digital.job.cancelled', {
        message: 'Digital employee job was cancelled by the user.'
      })
    }

    return true
  }

  pauseJob(jobId) {
    const job = this.jobs.get(String(jobId || ''))

    if (!job || ['completed', 'failed', 'cancelled'].includes(job.status)) {
      return false
    }

    if (job.paused) {
      return true
    }

    job.paused = true
    job.pauseRequested = true
    job.status = 'paused'
    this.emitJobEvent(job, 'digital.job.paused', {
      stageId: this.getCurrentStage(job)?.id || '',
      message: 'Digital employee job paused by user.'
    })

    if (job.sessionId) {
      job.pauseSessionIds.add(job.sessionId)
      this.agentRuntimeManager.stopSession(job.sessionId)
    }

    return true
  }

  resumeJob(jobId) {
    const job = this.jobs.get(String(jobId || ''))

    if (!job || ['completed', 'failed', 'cancelled'].includes(job.status)) {
      return false
    }

    job.paused = false
    job.pauseRequested = false
    job.status = 'running'
    this.emitJobEvent(job, 'digital.job.resumed', {
      stageId: this.getCurrentStage(job)?.id || '',
      message: 'Digital employee job resumed by user.'
    })
    this.resolveResumeWaiters(job)
    return true
  }

  getJob(jobId) {
    const job = this.jobs.get(String(jobId || ''))
    return job ? this.serializeJob(job) : null
  }

  stopAll() {
    for (const job of this.jobs.values()) {
      this.stopJob(job.id)
    }
  }

  getCurrentStage(job) {
    return job?.stages?.find((stage) => stage.status === 'running') ||
      job?.stages?.find((stage) => stage.status === 'pending') ||
      job?.stages?.at(-1) ||
      null
  }

  persistJob(job) {
    if (!job?.id) {
      return Promise.resolve()
    }

    const snapshot = this.serializeJob(job)
    const statePath = join(this.jobRoot, job.id, 'state.json')
    job.persistChain = (job.persistChain || Promise.resolve())
      .catch(() => {})
      .then(async () => {
        await mkdir(dirname(statePath), { recursive: true })
        await writeFile(statePath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
      })
      .catch((error) => {
        job.persistenceError = error?.message || 'Failed to persist digital employee state.'
      })

    return job.persistChain
  }

  waitForResume(job) {
    if (!job?.paused) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      job.resumeWaiters.push(resolve)
    })
  }

  resolveResumeWaiters(job) {
    const waiters = Array.isArray(job?.resumeWaiters) ? job.resumeWaiters.splice(0) : []
    for (const resolveWaiter of waiters) {
      resolveWaiter()
    }
  }

  respondToQuestion(jobId, requestId, response = {}) {
    const job = this.jobs.get(String(jobId || ''))
    const id = String(requestId || '')
    const pending = job?.pendingQuestions?.get(id)

    if (!pending) {
      return false
    }

    const decision = normalizeQuestionDecision(response, pending.payload)
    job.pendingQuestions.delete(id)

    if (job.waitingQuestionId === id) {
      job.waitingQuestionId = ''
    }

    this.emitJobEvent(job, 'digital.question.resolved', {
      ...pending.payload,
      ...decision,
      answeredAt: Date.now()
    })
    pending.resolve(decision)
    return true
  }

  async runJob(job) {
    await this.waitForResume(job)
    this.ensureJobActive(job)
    job.status = 'running'
    this.emitJobEvent(job, 'digital.job.started', {
      title: '数字员工团队开始工作',
      goal: job.request.goal,
      teamMode: job.request.teamMode,
      resumed: Boolean(job.resume),
      workspace: job.request.workspace
    })

    const workspaceInfo = await this.runStage(job, 'prepare_workspace', async () => {
      return prepareWorkspace(job.request)
    })

    job.executionWorkspace = workspaceInfo.workspace
    job.git = workspaceInfo.git

    this.emitJobEvent(job, 'digital.git.workspace', workspaceInfo)

    const agentResult = await this.runStage(job, 'agent_team', async () => {
      return this.runAgentTeam(job, workspaceInfo)
    })

    this.emitJobEvent(job, 'digital.agent.completed', agentResult)

    const gitSummary = await this.runStage(job, 'review_changes', async () => {
      return collectGitSummary(workspaceInfo.workspace.path)
    })

    this.emitJobEvent(job, 'digital.git.summary', gitSummary)

    const release = await this.runStage(job, 'release_prepare', async () => {
      return this.prepareRelease(job, workspaceInfo, gitSummary)
    })

    const report = await this.runStage(job, 'report', async () => {
      return writeJobReport(job, workspaceInfo, gitSummary, release, this.jobRoot)
    })

    job.report = report
    job.status = 'completed'
    this.emitJobEvent(job, 'digital.report.created', report)
    this.emitJobEvent(job, 'digital.job.completed', {
      status: job.status,
      branch: workspaceInfo.git?.branch || '',
      worktreePath: workspaceInfo.workspace.path,
      git: release,
      report
    })

    return this.serializeJob(job)
  }

  async runStage(job, stageId, runner) {
    await this.waitForResume(job)
    this.ensureJobActive(job)
    const existingStage = job.stages.find((stage) => stage.id === stageId)

    if (job.resume && existingStage?.status === 'completed' && existingStage.result !== undefined) {
      if (
        stageId === 'prepare_workspace' &&
        !existsSync(String(existingStage.result?.workspace?.path || ''))
      ) {
        const error = new Error('The persisted digital employee execution workspace no longer exists.')
        error.code = 'EXECUTION_WORKSPACE_MISSING'
        throw error
      }

      return existingStage.result
    }

    if (existingStage?.status === 'running') {
      existingStage.status = 'pending'
      existingStage.startedAt = 0
      existingStage.completedAt = 0
    }

    this.updateStage(job, stageId, 'running')
    this.emitJobEvent(job, 'digital.stage.started', getStagePayload(job, stageId))

    try {
      const result = await runner()
      this.ensureJobActive(job)
      this.updateStage(job, stageId, 'completed', result)
      this.emitJobEvent(job, 'digital.stage.completed', {
        ...getStagePayload(job, stageId),
        result
      })
      return result
    } catch (error) {
      this.updateStage(job, stageId, 'failed', {
        code: error?.code || 'STAGE_FAILED',
        message: error?.message || 'Stage failed.'
      })
      this.emitJobEvent(job, 'digital.stage.failed', {
        ...getStagePayload(job, stageId),
        error: {
          code: error?.code || 'STAGE_FAILED',
          message: error?.message || 'Stage failed.'
        }
      })
      throw error
    }
  }

  runAgentTeam(job, workspaceInfo) {
    return this.runAgentSessionLoop(job, workspaceInfo)
  }

  async runAgentSessionLoop(job, workspaceInfo) {
    let resumeCount = job.resume ? 1 : 0

    while (true) {
      await this.waitForResume(job)
      this.ensureJobActive(job)

      const prompt = buildDigitalEmployeePrompt(job, workspaceInfo, resumeCount)
      const session = this.agentRuntimeManager.startSession(
        {
          questId: job.id,
          prompt,
          workspace: workspaceInfo.workspace,
          mode: 'auto',
          permissions: job.request.permissions,
          options: {
            intentMode: 'code',
            expertMode: 'expert_team',
            digitalEmployeeJobId: job.id,
            resumeCount
          },
          agent: {
            provider: 'claude-code',
            model: 'default'
          }
        },
        {
          webContentsId: 0
        }
      )

      job.sessionId = session.id
      this.sessionToJob.set(session.id, job.id)
      this.emitJobEvent(job, 'digital.agent.session.started', {
        sessionId: session.id,
        workspace: workspaceInfo.workspace,
        resumeCount
      })

      const result = await this.waitForAgentSession(job, session)

      if (result.status === 'paused') {
        resumeCount += 1
        continue
      }

      return result
    }
  }

  waitForAgentSession(job, session) {
    return new Promise((resolveSession, rejectSession) => {
      const listener = (event) => {
        if (event.sessionId !== session.id || !TERMINAL_SESSION_EVENTS.has(event.type)) {
          return
        }

        this.agentRuntimeManager.off('event', listener)

        if (event.type === 'session.completed') {
          resolveSession({
            sessionId: session.id,
            status: 'completed',
            result: event.payload?.result || ''
          })
          return
        }

        if (
          event.type === 'session.cancelled' &&
          job.pauseSessionIds.delete(session.id) &&
          !job.cancelRequested
        ) {
          resolveSession({
            sessionId: session.id,
            status: 'paused',
            result: event.payload?.message || ''
          })
          return
        }

        const error = new Error(event.payload?.message || `Agent session ended with ${event.type}.`)
        error.code = event.type === 'session.cancelled' ? 'JOB_CANCELLED' : 'AGENT_SESSION_FAILED'
        rejectSession(error)
      }

      this.agentRuntimeManager.on('event', listener)
    })
  }

  async prepareRelease(job, workspaceInfo, gitSummary) {
    const release = {
      hasChanges: gitSummary.hasChanges,
      committed: false,
      pushed: false,
      prCreated: false,
      commit: null,
      push: null,
      pr: null,
      skipped: []
    }
    job.release = release

    if (!gitSummary.hasChanges) {
      release.skipped.push('No file changes were detected.')
      this.emitJobEvent(job, 'digital.git.skipped', {
        reason: 'No file changes were detected.'
      })
      return release
    }

    if (job.request.git.autoCommit) {
      const approval = await this.confirmReleaseAction(job, 'commit', {
        gitSummary,
        workspaceInfo,
        release
      })

      if (approval.allow) {
        const commit = await commitGitChanges(workspaceInfo.workspace.path, job.request, workspaceInfo.git)
        release.committed = true
        release.commit = commit
        this.emitJobEvent(job, 'digital.git.committed', commit)
      } else {
        const reason = approval.message || 'Commit was skipped by user decision.'
        release.skipped.push(reason)
        this.emitJobEvent(job, 'digital.git.skipped', {
          reason
        })
      }
    } else {
      release.skipped.push('autoCommit is disabled.')
      this.emitJobEvent(job, 'digital.git.skipped', {
        reason: 'autoCommit is disabled.'
      })
    }

    if (job.request.git.autoPush && release.committed) {
      const approval = await this.confirmReleaseAction(job, 'push', {
        gitSummary,
        workspaceInfo,
        release
      })

      if (approval.allow) {
        const push = await pushGitBranch(workspaceInfo.workspace.path, job.request, workspaceInfo.git)
        release.pushed = true
        release.push = push
        this.emitJobEvent(job, 'digital.git.pushed', push)
      } else {
        const reason = approval.message || 'Push was skipped by user decision.'
        release.skipped.push(reason)
        this.emitJobEvent(job, 'digital.git.skipped', {
          reason
        })
      }
    } else if (job.request.git.autoPush) {
      release.skipped.push('Push requires a commit.')
      this.emitJobEvent(job, 'digital.git.skipped', {
        reason: 'Push requires a commit.'
      })
    } else {
      release.skipped.push('autoPush is disabled.')
    }

    if (job.request.git.createPr && release.pushed) {
      const approval = await this.confirmReleaseAction(job, 'create_pr', {
        gitSummary,
        workspaceInfo,
        release
      })

      if (approval.allow) {
        const pr = await createPullRequest(job.request, workspaceInfo.git, release)
        release.prCreated = Boolean(pr?.url)
        release.pr = pr
        this.emitJobEvent(job, pr?.url ? 'digital.pr.created' : 'digital.pr.skipped', pr)
      } else {
        const skipped = {
          reason: approval.message || 'PR creation was skipped by user decision.'
        }
        release.skipped.push(skipped.reason)
        this.emitJobEvent(job, 'digital.pr.skipped', skipped)
      }
    } else if (job.request.git.createPr) {
      const skipped = {
        reason: 'PR creation requires a pushed branch.'
      }
      release.skipped.push(skipped.reason)
      this.emitJobEvent(job, 'digital.pr.skipped', skipped)
    } else {
      release.skipped.push('createPr is disabled.')
    }

    return release
  }

  async confirmReleaseAction(job, action, context = {}) {
    if (!shouldAskReleaseQuestion(job, action)) {
      return {
        allow: true,
        behavior: 'allow',
        message: ''
      }
    }

    const decision = await this.askQuestion(job, buildReleaseQuestion(job, action, context))

    if (decision.behavior === 'stop') {
      job.cancelRequested = true
      const error = new Error(decision.message || 'Digital employee job was stopped by user decision.')
      error.code = 'JOB_CANCELLED'
      throw error
    }

    return decision
  }

  askQuestion(job, definition = {}) {
    this.ensureJobActive(job)

    const requestId = String(definition.requestId || `digital_question_${randomUUID()}`)
    const payload = {
      id: requestId,
      requestId,
      questionId: requestId,
      jobId: job.id,
      sessionId: job.sessionId || '',
      source: 'xoder-digital-employee',
      stageId: definition.stageId || 'release_prepare',
      category: definition.category || 'approval',
      severity: definition.severity || 'medium',
      title: definition.title || 'Digital employee question',
      summary: definition.summary || '',
      description: definition.description || definition.summary || '',
      questions: Array.isArray(definition.questions) ? definition.questions : [],
      defaultAction: definition.defaultAction || 'deny',
      timeoutMs: Number(definition.timeoutMs || 0),
      input: definition.input || {},
      inputPreview: definition.inputPreview || '',
      metadata: definition.metadata || {}
    }

    job.waitingQuestionId = requestId

    return new Promise((resolveQuestion, rejectQuestion) => {
      job.pendingQuestions.set(requestId, {
        payload,
        resolve: resolveQuestion,
        reject: rejectQuestion,
        createdAt: Date.now()
      })
      this.emitJobEvent(job, 'digital.question.created', payload)
    })
  }

  cancelPendingQuestions(job, message = 'Digital employee question was cancelled.') {
    if (!job?.pendingQuestions?.size) {
      return
    }

    const error = new Error(message)
    error.code = 'JOB_CANCELLED'

    for (const [requestId, pending] of job.pendingQuestions.entries()) {
      this.emitJobEvent(job, 'digital.question.cancelled', {
        ...pending.payload,
        status: 'cancelled',
        message
      })
      pending.reject(error)
      job.pendingQuestions.delete(requestId)
    }

    job.waitingQuestionId = ''
  }

  ensureJobActive(job) {
    if (job.cancelRequested || job.status === 'cancelled') {
      const error = new Error('Digital employee job was cancelled.')
      error.code = 'JOB_CANCELLED'
      throw error
    }
  }

  updateStage(job, stageId, status, result = null) {
    const stage = job.stages.find((item) => item.id === stageId)

    if (!stage) {
      return
    }

    stage.status = status
    stage.updatedAt = Date.now()

    if (status === 'running' && !stage.startedAt) {
      stage.startedAt = Date.now()
    }

    if (['completed', 'failed'].includes(status)) {
      stage.completedAt = Date.now()
      stage.result = result
    }
  }

  failJob(job, type, payload) {
    if (job.status === 'cancelled') {
      return
    }

    job.status = payload?.code === 'JOB_CANCELLED' ? 'cancelled' : 'failed'
    this.emitJobEvent(job, type, {
      ...payload,
      stageId: this.getFailureStage(job)?.id || '',
      workspace: job.executionWorkspace || job.originalWorkspace,
      git: job.git
    })
    this.writeFailureReport(job, payload).catch((error) => {
      this.emitJobEvent(job, 'digital.report.failed', {
        code: error?.code || 'REPORT_FAILED',
        message: error?.message || 'Failed to write the digital employee failure report.',
        workspace: job.executionWorkspace || job.originalWorkspace,
        git: job.git
      })
    })
  }

  getFailureStage(job) {
    return job?.stages?.find((stage) => stage.status === 'failed') || this.getCurrentStage(job)
  }

  async writeFailureReport(job, failure = {}) {
    const workspace = job.executionWorkspace || job.originalWorkspace
    let gitSummary = {
      hasChanges: false,
      status: 'Git summary unavailable.',
      diffStat: '',
      diffNameStatus: '',
      changedFiles: []
    }

    try {
      if (workspace?.path) {
        gitSummary = await collectGitSummary(workspace.path)
      }
    } catch (error) {
      gitSummary.status = `Git summary failed: ${error?.message || 'unknown error'}`
    }

    const release = {
      ...(job.release || {}),
      skipped: [
        ...(job.release?.skipped || []),
        `${failure.code || 'DIGITAL_JOB_FAILED'}: ${failure.message || 'Digital employee job failed.'}`
      ]
    }
    const report = await writeJobReport(
      job,
      {
        workspace,
        git: job.git || {}
      },
      gitSummary,
      release,
      this.jobRoot
    )

    job.report = report
    this.emitJobEvent(job, 'digital.report.created', {
      ...report,
      failure: true,
      status: job.status
    })
    return report
  }

  forwardAgentEvent(event = {}) {
    const jobId = this.sessionToJob.get(event.sessionId)
    const job = jobId ? this.jobs.get(jobId) : null

    if (!job) {
      return
    }

    this.emitJobEvent(job, 'digital.agent.event', {
      sessionId: event.sessionId,
      event
    })
  }

  emitJobEvent(job, type, payload = {}) {
    job.updatedAt = Date.now()
    const event = {
      id: `digital_event_${randomUUID()}`,
      jobId: job.id,
      sessionId: job.sessionId || '',
      type,
      timestamp: Date.now(),
      payload
    }

    job.events.push(event)
    this.emit('event', event)
    this.persistJob(job)
    return event
  }

  serializeJob(job) {
    return {
      id: job.id,
      status: job.status,
      sessionId: job.sessionId,
      workspace: job.originalWorkspace,
      executionWorkspace: job.executionWorkspace,
      git: job.git,
      release: job.release,
      stages: job.stages,
      questions: Array.from(job.pendingQuestions?.values?.() || []).map((item) => item.payload),
      report: job.report,
      paused: Boolean(job.paused),
      currentStage: this.getCurrentStage(job),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      eventCount: job.events.length
    }
  }
}

export function normalizeDigitalEmployeeRequest(input = {}) {
  const workspace = input.workspace || {}
  const approvalPolicy = String(input.approvalPolicy || input.permissions?.approvalMode || 'auto')
  const fullAccess = approvalPolicy === 'fullAccess' || approvalPolicy === 'overnight_auto'
  const git = input.git || {}

  return {
    jobId: String(input.jobId || '').trim(),
    resume: Boolean(input.resume),
    resumeFromSessionId: String(input.resumeFromSessionId || '').trim(),
    goal: String(input.goal || input.prompt || '').trim(),
    teamMode: String(input.teamMode || 'staged_team'),
    approvalPolicy,
    workspace: {
      id: String(workspace.id || '').trim(),
      name: String(workspace.name || basename(String(workspace.path || 'workspace'))).trim(),
      path: String(workspace.path || input.workspacePath || '').trim()
    },
    permissions: {
      approvalMode: fullAccess ? 'fullAccess' : approvalPolicy === 'manual' ? 'manual' : 'auto',
      allowShell: fullAccess || Boolean(input.permissions?.allowShell ?? true),
      allowWrite: Boolean(input.permissions?.allowWrite ?? true),
      allowNetwork: fullAccess || Boolean(input.permissions?.allowNetwork ?? true),
      allowWebSearch: Boolean(input.permissions?.allowWebSearch ?? true),
      allowWebFetch: Boolean(input.permissions?.allowWebFetch ?? true),
      autoApproveAll: approvalPolicy !== 'manual',
      allowDangerouslyApproveAll: fullAccess
    },
    git: {
      isolation: String(git.isolation || 'worktree'),
      requireIsolation: git.requireIsolation !== false,
      autoCommit: git.autoCommit !== false,
      autoPush: Boolean(git.autoPush),
      createPr: Boolean(git.createPr),
      provider: normalizeGitProvider(git.provider || git.prProvider || 'auto'),
      remote: String(git.remote || 'auto').trim() || 'auto',
      baseBranch: String(git.baseBranch || '').trim(),
      branchPrefix: String(git.branchPrefix || 'xoder/employee').trim(),
      githubToken: String(git.githubToken || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim(),
      giteeToken: String(git.giteeToken || process.env.GITEE_TOKEN || '').trim(),
      gitlabToken: String(git.gitlabToken || process.env.GITLAB_TOKEN || '').trim(),
      prCreationMode: normalizePrCreationMode(git.prCreationMode),
      apiFallback: Boolean(git.apiFallback),
      customPrCommand: String(git.customPrCommand || '').trim(),
      prDraft: git.prDraft !== false
    }
  }
}

function createDefaultStages() {
  return [
    {
      id: 'prepare_workspace',
      title: '准备隔离工作区',
      detail: '检查 Git 仓库并创建数字员工专用 worktree。',
      status: 'pending'
    },
    {
      id: 'agent_team',
      title: '团队执行',
      detail: 'Leader、开发、QA、Review 通过 Xoder prompt 流程完成任务。',
      status: 'pending'
    },
    {
      id: 'review_changes',
      title: '收集改动',
      detail: '汇总 git status、diff stat 和变更文件。',
      status: 'pending'
    },
    {
      id: 'release_prepare',
      title: '提交与发布准备',
      detail: '按配置 commit、push、创建 Draft PR。',
      status: 'pending'
    },
    {
      id: 'report',
      title: '生成早晨核对报告',
      detail: '输出 PR、分支、改动、验证结果和风险。',
      status: 'pending'
    }
  ]
}

function mergePersistedStages(persistedStages) {
  const defaults = createDefaultStages()

  if (!Array.isArray(persistedStages)) {
    return defaults
  }

  return defaults.map((stage) => {
    const persisted = persistedStages.find((item) => item?.id === stage.id)

    if (!persisted) {
      return stage
    }

    return {
      ...stage,
      ...persisted,
      status: persisted.status === 'running' ? 'pending' : persisted.status
    }
  })
}

function readPersistedJobSnapshot(jobRoot, jobId) {
  const statePath = join(jobRoot, String(jobId || ''), 'state.json')

  if (!jobId || !existsSync(statePath)) {
    return null
  }

  try {
    const parsed = JSON.parse(readFileSync(statePath, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function getStagePayload(job, stageId) {
  const stage = job.stages.find((item) => item.id === stageId) || {
    id: stageId,
    title: stageId,
    status: 'pending'
  }

  return {
    stageId: stage.id,
    title: stage.title,
    detail: stage.detail,
    status: stage.status,
    stages: job.stages
  }
}

async function prepareWorkspace(request) {
  if (request.git.isolation === 'none') {
    const remote = await resolveGitRemoteIfAvailable(request.workspace.path, request.git)

    return {
      workspace: request.workspace,
      git: {
        isolated: false,
        branch: '',
        baseBranch: '',
        repoRoot: request.workspace.path,
        worktreePath: request.workspace.path,
        dirtyStatus: '',
        remote
      }
    }
  }

  try {
    const repoRoot = await getGitRoot(request.workspace.path)
    const remote = await resolveGitRemote(repoRoot, request.git.remote, request.git.provider)
    const currentBranch = (await git(['branch', '--show-current'], repoRoot)).stdout.trim()
    const baseBranch =
      request.git.baseBranch || (await resolveGitBaseBranch(repoRoot, remote, currentBranch)) || 'HEAD'
    const dirtyStatus = (await git(['status', '--porcelain'], repoRoot)).stdout.trim()
    const suffix = `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${randomUUID().slice(0, 6)}`
    const branch = `${request.git.branchPrefix}-${suffix}`.replace(/[^A-Za-z0-9/_-]+/g, '-')
    const worktreePath = join(dirname(repoRoot), '.xoder-worktrees', suffix)
    const startPoint = request.git.baseBranch || 'HEAD'

    await mkdir(dirname(worktreePath), { recursive: true })
    await git(['worktree', 'add', '-b', branch, worktreePath, startPoint], repoRoot)

    return {
      workspace: {
        id: request.workspace.id,
        name: `${request.workspace.name || basename(repoRoot)} worktree`,
        path: worktreePath
      },
      git: {
        isolated: true,
        repoRoot,
        worktreePath,
        branch,
        baseBranch,
        dirtyStatus,
        remote
      }
    }
  } catch (error) {
    if (request.git.requireIsolation) {
      error.code = error.code || 'WORKTREE_CREATE_FAILED'
      throw error
    }

    return {
      workspace: request.workspace,
      git: {
        isolated: false,
        branch: '',
        baseBranch: '',
        repoRoot: request.workspace.path,
        worktreePath: request.workspace.path,
        dirtyStatus: '',
        warning: error?.message || 'Failed to create isolated worktree.'
      }
    }
  }
}

async function getGitRoot(workspacePath) {
  const result = await git(['rev-parse', '--show-toplevel'], workspacePath)
  return result.stdout.trim()
}

async function resolveGitRemoteIfAvailable(workspacePath, gitConfig = {}) {
  try {
    const repoRoot = await getGitRoot(workspacePath)
    return await resolveGitRemote(repoRoot, gitConfig.remote, gitConfig.provider)
  } catch {
    return String(gitConfig.remote || '').trim() === 'auto' ? '' : String(gitConfig.remote || '').trim()
  }
}

async function resolveGitRemote(repoRoot, configuredRemote = 'auto', configuredProvider = 'auto') {
  const requested = String(configuredRemote || '').trim()

  if (requested && requested !== 'auto') {
    return requested
  }

  const result = await git(['remote'], repoRoot)
  const names = result.stdout
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean)

  if (!names.length) {
    return ''
  }

  const candidates = []

  for (const name of names) {
    try {
      const url = (await git(['remote', 'get-url', name], repoRoot)).stdout.trim()
      candidates.push({ name, url })
    } catch {
      candidates.push({ name, url: '' })
    }
  }

  const configured = normalizeGitProvider(configuredProvider)
  const providerMatch =
    configured !== 'auto' && configured !== 'generic'
      ? candidates.find(
          (candidate) =>
            candidate.url && resolveGitProvider(configured, candidate.url) === configured
        )
      : null
  const preferred =
    candidates.find((candidate) => candidate.name === 'origin') ||
    candidates.find((candidate) => candidate.name === 'upstream') ||
    candidates[0]

  return (providerMatch || preferred)?.name || ''
}

async function resolveGitBaseBranch(repoRoot, remote, fallbackBranch = '') {
  const remoteName = String(remote || '').trim()

  if (!remoteName) {
    return fallbackBranch
  }

  try {
    const symbolicRef = (
      await git(['symbolic-ref', '--quiet', '--short', `refs/remotes/${remoteName}/HEAD`], repoRoot)
    ).stdout.trim()
    const branch = symbolicRef.replace(new RegExp(`^${escapeRegExp(remoteName)}/`), '').trim()

    if (branch) {
      return branch
    }
  } catch {
    // Fall back to cached remote metadata below.
  }

  try {
    const remoteInfo = (await git(['remote', 'show', '-n', remoteName], repoRoot)).stdout
    const match = remoteInfo.match(/^\s*HEAD branch:\s*(.+)$/im)
    const branch = String(match?.[1] || '').trim()

    if (branch && branch !== '(unknown)') {
      return branch
    }
  } catch {
    // A remote may be unavailable or not have fetched HEAD metadata.
  }

  return fallbackBranch
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function collectGitSummary(workspacePath) {
  const status = (await git(['status', '--porcelain'], workspacePath)).stdout.trim()
  const diffStat = (await git(['diff', '--stat'], workspacePath)).stdout.trim()
  const diffNameStatus = (await git(['diff', '--name-status'], workspacePath)).stdout.trim()

  return {
    hasChanges: Boolean(status),
    status,
    diffStat,
    diffNameStatus,
    changedFiles: status
      ? status.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      : []
  }
}

async function commitGitChanges(workspacePath, request, gitInfo = {}) {
  await git(['add', '-A'], workspacePath)
  const title = buildCommitTitle(request.goal)
  await git(['commit', '-m', title], workspacePath)
  const commitHash = (await git(['rev-parse', 'HEAD'], workspacePath)).stdout.trim()

  return {
    hash: commitHash,
    title,
    branch: gitInfo.branch || ''
  }
}

async function pushGitBranch(workspacePath, request, gitInfo = {}) {
  const remote = gitInfo.remote || request.git.remote || 'origin'
  const branch = gitInfo.branch

  if (!branch) {
    const error = new Error('Cannot push because branch name is empty.')
    error.code = 'NO_BRANCH'
    throw error
  }

  await git(['push', '-u', remote, branch], workspacePath, {
    timeout: 300000
  })

  return {
    remote,
    branch
  }
}

async function createPullRequest(request, gitInfo = {}, release = {}) {
  const remote = gitInfo.remote || request.git.remote || 'origin'
  const remoteUrl = await getRemoteUrl(gitInfo.worktreePath, remote)
  const provider = resolveGitProvider(request.git.provider, remoteUrl)
  const mode = normalizePrCreationMode(request.git.prCreationMode)

  if (provider === 'none') {
    return {
      provider,
      reason: 'PR creation is disabled for this Git provider.'
    }
  }

  if (mode !== 'api') {
    const localResult = await createPullRequestWithLocalCli({
      provider,
      request,
      gitInfo,
      release,
      remoteUrl
    })

    if (localResult.url || localResult.created) {
      return localResult
    }

    if (mode === 'localCli' && !request.git.apiFallback) {
      return localResult
    }
  }

  if (provider === 'generic') {
    return {
      provider,
      reason:
        'Automatic PR creation requires a known provider API or a custom local PR command. Commit and push were completed.'
    }
  }

  const token = resolvePrToken(request.git, provider)

  if (!token) {
    return {
      provider,
      reason:
        'Local PR command did not create a PR/MR, and API token is not configured. Commit and push were completed.'
    }
  }

  if (provider === 'github') {
    return createGitHubPullRequest({
      request,
      gitInfo,
      release,
      remoteUrl,
      token
    })
  }

  if (provider === 'gitee') {
    return createGiteePullRequest({
      request,
      gitInfo,
      release,
      remoteUrl,
      token
    })
  }

  if (provider === 'gitlab') {
    return createGitLabMergeRequest({
      request,
      gitInfo,
      release,
      remoteUrl,
      token
    })
  }

  return {
    provider,
    reason: `Automatic PR creation for ${provider} remotes is not supported yet. Commit and push were completed.`
  }
}

async function createGitHubPullRequest({ request, gitInfo, release, remoteUrl, token }) {
  const repository = parseGitHubRepository(remoteUrl)

  if (!repository) {
    return {
      provider: 'github',
      reason: `Remote ${request.git.remote} is not a GitHub repository.`
    }
  }

  const title = buildPullRequestTitle(request.goal)
  const body = buildPullRequestBody(request, gitInfo, release)
  const response = await fetch(`https://api.github.com/repos/${repository.owner}/${repository.repo}/pulls`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'xoder-digital-employee'
    },
    body: JSON.stringify({
      title,
      head: gitInfo.branch,
      base: gitInfo.baseBranch || 'main',
      body,
      draft: request.git.prDraft
    })
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      provider: 'github',
      reason: payload?.message || `GitHub API returned ${response.status}.`,
      status: response.status
    }
  }

  return {
    provider: 'github',
    url: payload.html_url || '',
    number: payload.number || 0,
    title
  }
}

async function createPullRequestWithLocalCli({ provider, request, gitInfo, release }) {
  const title = buildPullRequestTitle(request.goal)
  const body = buildPullRequestBody(request, gitInfo, release)
  const base = gitInfo.baseBranch || (provider === 'gitee' ? 'master' : 'main')
  const context = {
    provider,
    title,
    body,
    base,
    head: gitInfo.branch,
    branch: gitInfo.branch,
    remote: gitInfo.remote || request.git.remote || 'origin',
    worktreePath: gitInfo.worktreePath || '',
    repoRoot: gitInfo.repoRoot || ''
  }

  if (request.git.customPrCommand) {
    return runCustomPrCommand(request.git.customPrCommand, context)
  }

  if (provider === 'github') {
    return runGitHubCliPrCreate({ request, gitInfo, title, body, base })
  }

  if (provider === 'gitlab') {
    return runGitLabCliMrCreate({ request, gitInfo, title, body, base })
  }

  return {
    provider,
    via: 'local-cli',
    reason:
      provider === 'gitee'
        ? 'No standard Gitee local PR CLI command is configured. Set a custom local PR command or enable API fallback.'
        : `No local PR CLI integration is configured for ${provider}.`
  }
}

async function runGitHubCliPrCreate({ request, gitInfo, title, body, base }) {
  const args = [
    'pr',
    'create',
    '--title',
    title,
    '--body',
    body,
    '--base',
    base,
    '--head',
    gitInfo.branch
  ]

  if (request.git.prDraft) {
    args.push('--draft')
  }

  return runLocalPrTool('gh', args, gitInfo.worktreePath, 'github', title)
}

async function runGitLabCliMrCreate({ request, gitInfo, title, body, base }) {
  const args = [
    'mr',
    'create',
    '--title',
    title,
    '--description',
    body,
    '--source-branch',
    gitInfo.branch,
    '--target-branch',
    base,
    '--yes'
  ]

  if (request.git.prDraft) {
    args.push('--draft')
  }

  return runLocalPrTool('glab', args, gitInfo.worktreePath, 'gitlab', title)
}

async function runLocalPrTool(command, args, cwd, provider, title) {
  try {
    const result = await execFileAsync(command, args, {
      cwd,
      timeout: 300000,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 10
    })
    const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim()
    const url = extractFirstUrl(output)

    return {
      provider,
      via: 'local-cli',
      created: Boolean(url),
      url,
      title,
      output,
      ...(url ? {} : { reason: `${command} completed without returning a PR/MR URL.` })
    }
  } catch (error) {
    return {
      provider,
      via: 'local-cli',
      reason: `${command} failed or is not installed: ${error?.message || 'unknown error'}`
    }
  }
}

async function runCustomPrCommand(template, context) {
  const command = renderCustomPrCommand(template, context)

  try {
    const result = await execFileAsync(getShellCommand(), getShellArgs(command), {
      cwd: context.worktreePath || context.repoRoot || process.cwd(),
      timeout: 300000,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 10
    })
    const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim()
    const url = extractFirstUrl(output)

    return {
      provider: context.provider,
      via: 'custom-local-command',
      created: Boolean(url),
      url,
      title: context.title,
      output,
      ...(url ? {} : { reason: 'Custom PR command completed without returning a PR/MR URL.' })
    }
  } catch (error) {
    return {
      provider: context.provider,
      via: 'custom-local-command',
      reason: `Custom PR command failed: ${error?.message || 'unknown error'}`
    }
  }
}

function renderCustomPrCommand(template, context) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) =>
    quoteForShell(context[key] ?? '')
  )
}

function quoteForShell(value) {
  const raw = String(value ?? '')

  if (process.platform === 'win32') {
    return `"${raw.replace(/`/g, '``').replace(/"/g, '`"')}"`
  }

  return `'${raw.replace(/'/g, `'\\''`)}'`
}

function getShellCommand() {
  return process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/sh'
}

function getShellArgs(command) {
  return process.platform === 'win32'
    ? ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command]
    : ['-lc', command]
}

function extractFirstUrl(output = '') {
  const match = String(output || '').match(/https?:\/\/[^\s"'<>]+/i)

  return match ? match[0] : ''
}

async function createGiteePullRequest({ request, gitInfo, release, remoteUrl, token }) {
  const repository = parseGiteeRepository(remoteUrl)

  if (!repository) {
    return {
      provider: 'gitee',
      reason: `Remote ${request.git.remote} is not a Gitee repository.`
    }
  }

  const title = buildPullRequestTitle(request.goal)
  const body = buildPullRequestBody(request, gitInfo, release)
  const form = new URLSearchParams({
    access_token: token,
    title,
    head: gitInfo.branch,
    base: gitInfo.baseBranch || 'master',
    body,
    draft: request.git.prDraft ? 'true' : 'false'
  })
  const response = await fetch(
    `https://gitee.com/api/v5/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}/pulls`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'xoder-digital-employee'
      },
      body: form
    }
  )
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      provider: 'gitee',
      reason: payload?.message || `Gitee API returned ${response.status}.`,
      status: response.status
    }
  }

  return {
    provider: 'gitee',
    url: payload.html_url || payload.url || '',
    number: payload.number || payload.id || 0,
    title: payload.title || title
  }
}

async function createGitLabMergeRequest({ request, gitInfo, release, remoteUrl, token }) {
  const repository = parseGitLabRepository(remoteUrl)

  if (!repository) {
    return {
      provider: 'gitlab',
      reason: `Remote ${request.git.remote} is not a GitLab repository.`
    }
  }

  const rawTitle = buildPullRequestTitle(request.goal)
  const title = request.git.prDraft && !/^draft:/i.test(rawTitle) ? `Draft: ${rawTitle}` : rawTitle
  const body = buildPullRequestBody(request, gitInfo, release)
  const response = await fetch(
    `${repository.apiBaseUrl}/projects/${encodeURIComponent(repository.projectPath)}/merge_requests`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'PRIVATE-TOKEN': token,
        'Content-Type': 'application/json',
        'User-Agent': 'xoder-digital-employee'
      },
      body: JSON.stringify({
        source_branch: gitInfo.branch,
        target_branch: gitInfo.baseBranch || 'main',
        title,
        description: body
      })
    }
  )
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      provider: 'gitlab',
      reason: payload?.message || `GitLab API returned ${response.status}.`,
      status: response.status
    }
  }

  return {
    provider: 'gitlab',
    url: payload.web_url || '',
    number: payload.iid || payload.id || 0,
    title: payload.title || title
  }
}

async function getRemoteUrl(workspacePath, remote) {
  return (await git(['remote', 'get-url', remote || 'origin'], workspacePath)).stdout.trim()
}

function parseGitHubRepository(remoteUrl = '') {
  const parsed = parseGitRemoteUrl(remoteUrl)

  if (!parsed || parsed.host.toLowerCase() !== 'github.com') {
    return null
  }

  const segments = parsed.projectPath.split('/').filter(Boolean)

  if (segments.length < 2) {
    return null
  }

  return {
    owner: segments[0],
    repo: segments.slice(1).join('/')
  }
}

function parseGiteeRepository(remoteUrl = '') {
  const parsed = parseGitRemoteUrl(remoteUrl)

  if (!parsed || parsed.host.toLowerCase() !== 'gitee.com') {
    return null
  }

  const segments = parsed.projectPath.split('/').filter(Boolean)

  if (segments.length < 2) {
    return null
  }

  return {
    owner: segments[0],
    repo: segments.slice(1).join('/')
  }
}

function parseGitLabRepository(remoteUrl = '') {
  const parsed = parseGitRemoteUrl(remoteUrl)

  if (!parsed) {
    return null
  }

  return {
    host: parsed.host,
    projectPath: parsed.projectPath,
    apiBaseUrl: `${parsed.protocol === 'http:' ? 'http' : 'https'}://${parsed.host}/api/v4`
  }
}

function parseGitRemoteUrl(remoteUrl = '') {
  const normalized = String(remoteUrl || '').trim()

  if (!normalized) {
    return null
  }

  try {
    const url = new URL(normalized)
    const projectPath = normalizeRepositoryPath(url.pathname.replace(/^\/+/, ''))

    if (!url.hostname || !projectPath) {
      return null
    }

    return {
      protocol: url.protocol,
      host: url.hostname,
      projectPath
    }
  } catch {
    const scpLike = normalized.match(/^(?:[^@]+@)?([^:]+):(.+)$/)

    if (!scpLike) {
      return null
    }

    return {
      protocol: 'ssh:',
      host: scpLike[1],
      projectPath: normalizeRepositoryPath(scpLike[2])
    }
  }
}

function normalizeRepositoryPath(value = '') {
  return String(value || '')
    .replace(/^\/+/, '')
    .replace(/\.git$/i, '')
    .split('/')
    .filter(Boolean)
    .join('/')
}

function resolveGitProvider(configuredProvider = 'auto', remoteUrl = '') {
  const configured = normalizeGitProvider(configuredProvider)

  if (configured !== 'auto') {
    return configured
  }

  const normalized = String(remoteUrl || '').toLowerCase()

  if (normalized.includes('github.com')) {
    return 'github'
  }

  if (normalized.includes('gitee.com')) {
    return 'gitee'
  }

  if (normalized.includes('gitlab.') || normalized.includes('gitlab:')) {
    return 'gitlab'
  }

  return 'generic'
}

function normalizeGitProvider(value = '') {
  const normalized = String(value || '').trim().toLowerCase()

  return ['auto', 'github', 'gitee', 'gitlab', 'generic', 'none'].includes(normalized)
    ? normalized
    : 'auto'
}

function resolvePrToken(git = {}, provider = 'generic') {
  if (provider === 'gitee') {
    return String(git.giteeToken || git.githubToken || '').trim()
  }

  if (provider === 'gitlab') {
    return String(git.gitlabToken || git.githubToken || '').trim()
  }

  return String(git.githubToken || '').trim()
}

function normalizePrCreationMode(value = '') {
  const normalized = String(value || '').trim()

  return ['localCli', 'api', 'localThenApi'].includes(normalized) ? normalized : 'localCli'
}

function shouldAskReleaseQuestion(job, action) {
  if (job.request.permissions?.allowDangerouslyApproveAll) {
    return false
  }

  if (['fullAccess', 'overnight_auto'].includes(job.request.approvalPolicy)) {
    return false
  }

  if (job.request.approvalPolicy === 'manual') {
    return true
  }

  return ['push', 'create_pr'].includes(action)
}

function buildReleaseQuestion(job, action, context = {}) {
  const actionConfig = {
    commit: {
      title: '确认创建本地 commit',
      question: '是否允许数字员工把当前改动创建为一个本地 commit？',
      summary: '这会在隔离工作区中执行 git add 和 git commit，不会推送到远程。',
      allowDescription: '创建本地 commit，后续可继续 push / PR。',
      skipDescription: '保留文件改动，不创建 commit。'
    },
    push: {
      title: '确认 push 远程分支',
      question: `是否允许数字员工 push 到 ${job.request.git.remote || 'origin'} / ${context.workspaceInfo?.git?.branch || '当前分支'}？`,
      summary: 'push 会把数字员工生成的分支上传到远程仓库。',
      allowDescription: '推送当前数字员工分支。',
      skipDescription: '保留本地 commit，不上传远程。'
    },
    create_pr: {
      title: '确认创建 PR / MR',
      question: '是否允许数字员工使用本机 CLI 或已配置兜底方式创建 Draft PR / MR？',
      summary: 'PR / MR 会提交到代码托管平台，默认 Draft，方便你第二天核对。',
      allowDescription: '创建 Draft PR / MR。',
      skipDescription: '只保留已推送分支，不创建 PR / MR。'
    }
  }
  const config = actionConfig[action] || actionConfig.commit
  const changedFiles = Array.isArray(context.gitSummary?.changedFiles)
    ? context.gitSummary.changedFiles
    : []

  return {
    stageId: 'release_prepare',
    category: 'release_approval',
    severity: action === 'commit' ? 'medium' : 'high',
    title: config.title,
    summary: config.summary,
    inputPreview: [
      `workspace: ${context.workspaceInfo?.workspace?.path || job.request.workspace.path}`,
      `branch: ${context.workspaceInfo?.git?.branch || ''}`,
      `changed files: ${changedFiles.length}`
    ]
      .filter(Boolean)
      .join('\n'),
    metadata: {
      action,
      remote: context.workspaceInfo?.git?.remote || job.request.git.remote || 'origin',
      branch: context.workspaceInfo?.git?.branch || '',
      changedFiles
    },
    questions: [
      {
        id: 'decision',
        question: config.question,
        options: [
          {
            id: 'allow_once',
            value: 'allow_once',
            label: '允许这一步',
            description: config.allowDescription
          },
          {
            id: 'skip_action',
            value: 'skip_action',
            label: '跳过这一步',
            description: config.skipDescription
          },
          {
            id: 'stop_job',
            value: 'stop_job',
            label: '停止任务',
            description: '停止数字员工，保留当前工作区和已有改动。'
          }
        ]
      }
    ],
    defaultAction: 'skip_action',
    timeoutMs: 0
  }
}

function normalizeQuestionDecision(response = {}, question = {}) {
  const answers =
    response.answers ||
    response.updatedInput?.answers ||
    response.input?.answers ||
    {}
  const answerText = Object.values(answers)
    .flat()
    .map((item) => String(item || ''))
    .join(' ')
  const explicitBehavior = String(response.behavior || response.decision || '').trim()
  const behavior = normalizeQuestionBehavior(
    explicitBehavior || answerText || (response.allow === true ? 'allow' : '')
  )
  const allow = response.allow === true || ['allow', 'allow_once'].includes(behavior)
  const finalBehavior =
    behavior || (response.allow === false ? 'deny' : allow ? 'allow' : question.defaultAction || 'deny')
  const message =
    response.message ||
    getQuestionDecisionMessage(question, finalBehavior, allow)

  return {
    allow,
    behavior: finalBehavior,
    decisionClassification: response.decisionClassification || 'user_temporary',
    status: allow ? 'approved' : finalBehavior === 'stop' ? 'stopped' : 'skipped',
    answers,
    message
  }
}

function normalizeQuestionBehavior(value = '') {
  const normalized = String(value || '').trim().toLowerCase()

  if (!normalized) {
    return ''
  }

  if (['allow', 'allow_once', 'approve', 'yes'].includes(normalized)) {
    return normalized === 'allow_once' ? 'allow_once' : 'allow'
  }

  if (['skip', 'skip_action', 'deny', 'decline', 'no'].includes(normalized)) {
    return normalized === 'skip_action' ? 'skip_action' : 'deny'
  }

  if (['stop', 'stop_job', 'cancel', 'cancel_job'].includes(normalized)) {
    return 'stop'
  }

  if (/允许|同意|批准|approve|allow|yes/.test(normalized)) {
    return 'allow'
  }

  if (/停止|终止|取消|stop|cancel/.test(normalized)) {
    return 'stop'
  }

  if (/跳过|拒绝|不要|deny|decline|skip|no/.test(normalized)) {
    return 'skip_action'
  }

  return ''
}

function getQuestionDecisionMessage(question = {}, behavior, allow) {
  if (allow) {
    return 'User approved this digital employee action.'
  }

  if (behavior === 'stop') {
    return 'Digital employee job was stopped by user decision.'
  }

  return `${question.title || 'Digital employee action'} was skipped by user decision.`
}

async function writeJobReport(job, workspaceInfo, gitSummary, release, jobRoot) {
  const dir = join(jobRoot, job.id)
  const reportPath = join(dir, 'report.md')
  const content = buildJobReportMarkdown(job, workspaceInfo, gitSummary, release)

  await mkdir(dir, { recursive: true })
  await writeFile(reportPath, content, 'utf8')

  return {
    path: reportPath,
    content,
    createdAt: Date.now()
  }
}

function buildDigitalEmployeePrompt(job, workspaceInfo, resumeCount = 0) {
  const stages = [
    'Leader: understand the goal, inspect the existing project, and maintain a concise TodoWrite plan.',
    'Architect: choose the lowest-risk implementation path that fits the existing codebase.',
    'Developer: implement the requested change in the isolated worktree.',
    'QA: run targeted validation commands and fix failures when possible.',
    'Reviewer: review git diff, risks, compatibility, and test coverage.',
    'Release assistant: do not commit, push, or create PR yourself; Xoder will handle release after the agent session completes.'
  ]

  return [
    'You are the execution engine for a Xoder Digital Employee staged team.',
    'Operate as a coordinated local software team, but do not invoke /team or /employee slash commands.',
    'The user expects unattended office work: write code in the workspace, validate it, and leave a clear handoff.',
    '',
    `Digital employee job id: ${job.id}`,
    `Goal: ${job.request.goal}`,
    `Original workspace: ${job.originalWorkspace.path}`,
    `Execution workspace: ${workspaceInfo.workspace.path}`,
    `Git branch: ${workspaceInfo.git?.branch || 'current branch'}`,
    ...(resumeCount > 0
      ? [
          '',
          `This is resume attempt ${resumeCount}. Continue from the current files and git state; do not discard prior work.`,
          'Inspect the latest changes and validation state before choosing the next action.'
        ]
      : []),
    '',
    'Team workflow:',
    ...stages.map((stage, index) => `${index + 1}. ${stage}`),
    '',
    'Rules:',
    '- Use the execution workspace path for all reads, edits, and commands.',
    '- Prefer incremental, localized changes that match the existing project style.',
    '- Keep progress visible with TodoWrite.',
    '- Run relevant tests/build/type checks when practical.',
    '- If validation cannot run, explain exactly why.',
    '- Do not run git commit, git push, gh pr create, or merge commands. Xoder will do release operations.',
    '- Do not modify files outside the execution workspace unless the user explicitly asked for it.',
    '',
    'Final response format:',
    '## Summary',
    '## Changed Files',
    '## Validation',
    '## Risks / Follow-up'
  ].join('\n')
}

function buildJobReportMarkdown(job, workspaceInfo, gitSummary, release) {
  return [
    `# Xoder Digital Employee Report`,
    '',
    `- Job: ${job.id}`,
    `- Status: ${job.status}`,
    `- Goal: ${job.request.goal}`,
    `- Original workspace: ${job.originalWorkspace.path}`,
    `- Execution workspace: ${workspaceInfo.workspace.path}`,
    `- Branch: ${workspaceInfo.git?.branch || ''}`,
    `- Commit: ${release.commit?.hash || 'not created'}`,
    `- PR: ${release.pr?.url || release.pr?.reason || 'not created'}`,
    '',
    '## Stages',
    ...job.stages.map((stage) => `- ${stage.title}: ${stage.status}`),
    '',
    '## Git Status',
    '```text',
    gitSummary.status || 'No changes detected.',
    '```',
    '',
    '## Diff Stat',
    '```text',
    gitSummary.diffStat || 'No diff stat.',
    '```',
    '',
    '## Release',
    '```json',
    JSON.stringify(release, null, 2),
    '```'
  ].join('\n')
}

function buildCommitTitle(goal) {
  const normalized = String(goal || 'digital employee work')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64)

  return `chore: ${normalized || 'digital employee work'}`
}

function buildPullRequestTitle(goal) {
  const normalized = String(goal || 'Digital employee work')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)

  return normalized || 'Digital employee work'
}

function buildPullRequestBody(request, gitInfo, release) {
  return [
    'Generated by Xoder Digital Employee.',
    '',
    `Goal: ${request.goal}`,
    `Branch: ${gitInfo.branch}`,
    `Commit: ${release.commit?.hash || ''}`,
    '',
    'Please review the generated report in Xoder before merging.'
  ].join('\n')
}

async function git(args, cwd, options = {}) {
  try {
    const result = await execFileAsync('git', args, {
      cwd,
      timeout: options.timeout || DEFAULT_TIMEOUT_MS,
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 20
    })

    return {
      stdout: result.stdout || '',
      stderr: result.stderr || ''
    }
  } catch (error) {
    const message = [
      `git ${args.join(' ')} failed.`,
      error?.stdout ? `stdout:\n${error.stdout}` : '',
      error?.stderr ? `stderr:\n${error.stderr}` : '',
      error?.message || ''
    ]
      .filter(Boolean)
      .join('\n')
    const nextError = new Error(message)
    nextError.code = error?.code || 'GIT_COMMAND_FAILED'
    throw nextError
  }
}
