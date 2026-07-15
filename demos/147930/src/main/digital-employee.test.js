import { strict as assert } from 'node:assert'
import { execFile } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { promisify } from 'node:util'

import { DigitalEmployeeManager } from './digital-employee/index.js'
import {
  getEffectiveDigitalEmployeeConfig,
  mergeDigitalEmployeeStartRequestWithConfig,
  saveDigitalEmployeeConfigFile,
  toPublicDigitalEmployeeConfig,
  upsertDigitalEmployeeWorkspaceProfile
} from './digital-employee/config.js'

const execFileAsync = promisify(execFile)

test('digital employee job runs staged team flow and creates a report', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-job-'))
  const repoPath = join(tempRoot, 'repo')

  await mkdir(repoPath, { recursive: true })
  await git(['init'], repoPath)
  await git(['config', 'user.email', 'xoder@example.com'], repoPath)
  await git(['config', 'user.name', 'Xoder Test'], repoPath)
  await writeFile(join(repoPath, 'README.md'), '# Test\n', 'utf8')
  await git(['add', 'README.md'], repoPath)
  await git(['commit', '-m', 'initial'], repoPath)

  const fakeRuntime = new FakeRuntimeManager()
  const manager = new DigitalEmployeeManager({
    agentRuntimeManager: fakeRuntime,
    jobRoot: join(tempRoot, 'jobs')
  })
  const completed = onceJobEvent(manager, 'digital.job.completed')
  const seenTypes = []

  manager.on('event', (event) => {
    seenTypes.push(event.type)
  })

  const job = manager.startJob({
    goal: 'Update the test project',
    workspace: {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: {
      isolation: 'none',
      autoCommit: true,
      autoPush: false,
      createPr: false
    }
  })
  const completedEvent = await completed

  assert.equal(job.status, 'queued')
  assert.equal(fakeRuntime.lastRequest.workspace.path, repoPath)
  assert.match(fakeRuntime.lastRequest.prompt, /Xoder Digital Employee staged team/)
  assert.equal(completedEvent.payload.report.content.includes('Xoder Digital Employee Report'), true)
  assert.equal(seenTypes.includes('digital.stage.started'), true)
  assert.equal(seenTypes.includes('digital.agent.event'), true)
  assert.equal(seenTypes.includes('digital.report.created'), true)
})

test('digital employee waits for release question before committing in manual mode', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-question-'))
  const repoPath = join(tempRoot, 'repo')

  await mkdir(repoPath, { recursive: true })
  await git(['init'], repoPath)
  await git(['config', 'user.email', 'xoder@example.com'], repoPath)
  await git(['config', 'user.name', 'Xoder Test'], repoPath)
  await writeFile(join(repoPath, 'README.md'), '# Test\n', 'utf8')
  await git(['add', 'README.md'], repoPath)
  await git(['commit', '-m', 'initial'], repoPath)

  const fakeRuntime = new FakeRuntimeManager({
    async onStart(request) {
      await writeFile(join(request.workspace.path, 'feature.txt'), 'digital employee change\n', 'utf8')
    }
  })
  const manager = new DigitalEmployeeManager({
    agentRuntimeManager: fakeRuntime,
    jobRoot: join(tempRoot, 'jobs')
  })
  const question = onceJobEvent(manager, 'digital.question.created')
  const completed = onceJobEvent(manager, 'digital.job.completed')
  const seenTypes = []

  manager.on('event', (event) => {
    seenTypes.push(event.type)
  })

  const job = manager.startJob({
    goal: 'Create a commit after asking',
    approvalPolicy: 'manual',
    workspace: {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: {
      isolation: 'none',
      autoCommit: true,
      autoPush: false,
      createPr: false
    }
  })
  const questionEvent = await question

  assert.equal(questionEvent.payload.source, 'xoder-digital-employee')
  assert.equal(questionEvent.payload.stageId, 'release_prepare')
  assert.equal(questionEvent.payload.metadata.action, 'commit')
  assert.equal(
    manager.respondToQuestion(job.id, questionEvent.payload.requestId, {
      behavior: 'allow_once',
      answers: {
        decision: 'allow_once'
      }
    }),
    true
  )

  await completed

  const latestCommit = (await git(['log', '-1', '--pretty=%s'], repoPath)).stdout.trim()
  assert.match(latestCommit, /Create a commit after asking/)
  assert.equal(seenTypes.includes('digital.question.resolved'), true)
  assert.equal(seenTypes.includes('digital.git.committed'), true)
})

test('digital employee can pause and resume the agent stage', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-pause-'))
  const repoPath = join(tempRoot, 'repo')

  await mkdir(repoPath, { recursive: true })
  await git(['init'], repoPath)
  await git(['config', 'user.email', 'xoder@example.com'], repoPath)
  await git(['config', 'user.name', 'Xoder Test'], repoPath)
  await writeFile(join(repoPath, 'README.md'), '# Test\n', 'utf8')
  await git(['add', 'README.md'], repoPath)
  await git(['commit', '-m', 'initial'], repoPath)

  const fakeRuntime = new PausableRuntimeManager()
  const manager = new DigitalEmployeeManager({
    agentRuntimeManager: fakeRuntime,
    jobRoot: join(tempRoot, 'jobs')
  })
  const firstSession = onceJobEvent(manager, 'digital.agent.session.started')
  const paused = onceJobEvent(manager, 'digital.job.paused')
  const resumed = onceJobEvent(manager, 'digital.job.resumed')
  const completed = onceJobEvent(manager, 'digital.job.completed')
  const job = manager.startJob({
    goal: 'Pause and resume the test project',
    workspace: {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: {
      isolation: 'none',
      autoCommit: false,
      autoPush: false,
      createPr: false
    }
  })

  await firstSession
  assert.equal(manager.pauseJob(job.id), true)
  await paused
  assert.equal(manager.getJob(job.id).paused, true)
  assert.equal(manager.resumeJob(job.id), true)
  await resumed
  const completedEvent = await completed

  assert.equal(completedEvent.payload.status, 'completed')
  assert.equal(fakeRuntime.startCount, 2)
})

test('digital employee resumes from a persisted worktree after daemon restart', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-restart-'))
  const repoPath = join(tempRoot, 'repo')
  const jobRoot = join(tempRoot, 'jobs')

  await mkdir(repoPath, { recursive: true })
  await git(['init', repoPath])
  await git(['config', 'user.email', 'xoder@example.com'], repoPath)
  await git(['config', 'user.name', 'Xoder Test'], repoPath)
  await writeFile(join(repoPath, 'README.md'), '# Test\n', 'utf8')
  await git(['add', 'README.md'], repoPath)
  await git(['commit', '-m', 'initial'], repoPath)

  const firstRuntime = new HangingRuntimeManager()
  const firstManager = new DigitalEmployeeManager({
    agentRuntimeManager: firstRuntime,
    jobRoot
  })
  const firstSession = onceJobEvent(firstManager, 'digital.agent.session.started')
  const originalJob = firstManager.startJob({
    jobId: 'job_restart_test',
    goal: 'Resume after daemon restart',
    workspace: {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: {
      isolation: 'worktree',
      autoCommit: false,
      autoPush: false,
      createPr: false
    }
  })

  await firstSession
  await firstManager.jobs.get(originalJob.id).persistChain
  const persistedJob = firstManager.getJob(originalJob.id)

  const secondManager = new DigitalEmployeeManager({
    agentRuntimeManager: new FakeRuntimeManager(),
    jobRoot
  })
  const resumed = onceJobEvent(secondManager, 'digital.job.started')
  const completed = onceJobEvent(secondManager, 'digital.job.completed')
  secondManager.startJob({
    jobId: originalJob.id,
    resume: true,
    resumeFromSessionId: 'old-session',
    goal: originalJob.request?.goal || 'Resume after daemon restart',
    workspace: originalJob.request?.workspace || {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: originalJob.request?.git || {
      isolation: 'worktree',
      autoCommit: false,
      autoPush: false,
      createPr: false
    }
  })

  const resumedEvent = await resumed
  const completedEvent = await completed
  const resumedJob = secondManager.getJob(originalJob.id)

  assert.equal(resumedEvent.payload.resumed, true)
  assert.equal(completedEvent.payload.status, 'completed')
  assert.equal(resumedJob.executionWorkspace.path, persistedJob.executionWorkspace.path)
  assert.equal(resumedJob.stages.find(stage => stage.id === 'prepare_workspace').status, 'completed')
})

test('digital employee config masks token and merges release settings into start request', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-config-'))
  const configPath = join(tempRoot, 'digital-employee.config.json')
  const saved = await saveDigitalEmployeeConfigFile(configPath, {
    git: {
      remote: 'origin',
      baseBranch: 'main',
      branchPrefix: 'xoder/night',
      autoCommit: true,
      autoPush: true,
      createPr: true,
      prDraft: true
    },
    github: {
      token: 'ghp_test1234567890'
    },
    policy: {
      approvalPolicy: 'auto',
      allowOvernightFullAccess: true
    }
  })
  const publicConfig = toPublicDigitalEmployeeConfig(saved.config)
  const merged = mergeDigitalEmployeeStartRequestWithConfig(
    {
      goal: 'Ship a change',
      workspace: {
        path: tempRoot
      }
    },
    saved.config
  )
  const kept = await saveDigitalEmployeeConfigFile(configPath, {
    github: {
      token: ''
    }
  })
  const cleared = await saveDigitalEmployeeConfigFile(configPath, {
    github: {
      clearToken: true
    }
  })

  assert.equal(publicConfig.github.token, '')
  assert.equal(publicConfig.github.tokenConfigured, true)
  assert.equal(publicConfig.github.tokenPreview, 'ghp_****7890')
  assert.equal(merged.git.remote, 'origin')
  assert.equal(merged.git.baseBranch, 'main')
  assert.equal(merged.git.createPr, true)
  assert.equal(merged.git.githubToken, 'ghp_test1234567890')
  assert.equal(kept.config.github.token, 'ghp_test1234567890')
  assert.equal(cleared.config.github.token, '')
})

test('digital employee config requires overnight flag before default full access', () => {
  const guarded = mergeDigitalEmployeeStartRequestWithConfig(
    {
      goal: 'Run overnight',
      workspace: {
        path: 'repo'
      }
    },
    {
      policy: {
        approvalPolicy: 'fullAccess',
        allowOvernightFullAccess: false
      }
    }
  )
  const explicit = mergeDigitalEmployeeStartRequestWithConfig(
    {
      goal: 'Run now',
      approvalPolicy: 'fullAccess',
      workspace: {
        path: 'repo'
      }
    },
    {
      policy: {
        approvalPolicy: 'auto',
        allowOvernightFullAccess: false
      }
    }
  )

  assert.equal(guarded.approvalPolicy, 'auto')
  assert.equal(explicit.approvalPolicy, 'fullAccess')
})

test('digital employee config supports per-workspace git profile overrides', () => {
  const config = upsertDigitalEmployeeWorkspaceProfile(
    {
      git: {
        provider: 'github',
        remote: 'github',
        baseBranch: 'main',
        branchPrefix: 'xoder/global'
      }
    },
    {
      key: 'f:\\repo-a',
      name: 'repo-a',
      workspacePath: 'F:\\repo-a\\packages\\app',
      repoRoot: 'F:\\repo-a'
    },
    {
      git: {
        provider: 'gitee',
        remote: 'origin',
        baseBranch: 'develop',
        branchPrefix: 'xoder/repo-a',
        autoPush: true
      },
      policy: {
        approvalPolicy: 'manual'
      }
    }
  )
  const effective = getEffectiveDigitalEmployeeConfig(config, 'f:\\repo-a')
  const fallback = getEffectiveDigitalEmployeeConfig(config, 'f:\\repo-b')
  const request = mergeDigitalEmployeeStartRequestWithConfig(
    {
      goal: 'Work in repo A',
      workspace: {
        path: 'F:\\repo-a'
      }
    },
    config,
    {
      profileKey: 'f:\\repo-a'
    }
  )

  assert.equal(effective.git.remote, 'origin')
  assert.equal(effective.git.provider, 'gitee')
  assert.equal(effective.git.baseBranch, 'develop')
  assert.equal(effective.git.branchPrefix, 'xoder/repo-a')
  assert.equal(effective.policy.approvalPolicy, 'manual')
  assert.equal(fallback.git.remote, 'github')
  assert.equal(request.git.remote, 'origin')
})

test('digital employee automatically selects the repository remote when remote is auto', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-remote-'))
  const repoPath = join(tempRoot, 'repo')

  await mkdir(repoPath, { recursive: true })
  await git(['init'], repoPath)
  await git(['config', 'user.email', 'xoder@example.com'], repoPath)
  await git(['config', 'user.name', 'Xoder Test'], repoPath)
  await writeFile(join(repoPath, 'README.md'), '# Test\n', 'utf8')
  await git(['add', 'README.md'], repoPath)
  await git(['commit', '-m', 'initial'], repoPath)
  await git(['remote', 'add', 'gitee', 'https://gitee.com/example/xoder.git'], repoPath)

  const manager = new DigitalEmployeeManager({
    agentRuntimeManager: new FakeRuntimeManager(),
    jobRoot: join(tempRoot, 'jobs')
  })
  const workspaceEvent = onceJobEvent(manager, 'digital.git.workspace')
  const completed = onceJobEvent(manager, 'digital.job.completed')

  manager.startJob({
    goal: 'Inspect the repository remote',
    workspace: {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: {
      isolation: 'none',
      remote: 'auto',
      autoCommit: false,
      autoPush: false,
      createPr: false
    }
  })

  const workspacePayload = await workspaceEvent
  await completed

  assert.equal(workspacePayload.payload.git.remote, 'gitee')
})

test('digital employee detects the remote default branch for isolated worktrees', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-default-branch-'))
  const repoPath = join(tempRoot, 'repo')
  const bareRemote = join(tempRoot, 'origin.git')

  await mkdir(repoPath, { recursive: true })
  await git(['init', '--bare', bareRemote], tempRoot)
  await git(['init', repoPath])
  await git(['config', 'user.email', 'xoder@example.com'], repoPath)
  await git(['config', 'user.name', 'Xoder Test'], repoPath)
  await writeFile(join(repoPath, 'README.md'), '# Test\n', 'utf8')
  await git(['add', 'README.md'], repoPath)
  await git(['commit', '-m', 'initial'], repoPath)
  await git(['branch', '-M', 'main'], repoPath)
  await git(['remote', 'add', 'origin', bareRemote], repoPath)
  await git(['push', '-u', 'origin', 'main'], repoPath)
  await git(['fetch', 'origin'], repoPath)
  await git(['remote', 'set-head', 'origin', 'main'], repoPath)

  const manager = new DigitalEmployeeManager({
    agentRuntimeManager: new FakeRuntimeManager(),
    jobRoot: join(tempRoot, 'jobs')
  })
  const workspaceEvent = onceJobEvent(manager, 'digital.git.workspace')
  const completed = onceJobEvent(manager, 'digital.job.completed')

  manager.startJob({
    goal: 'Use the repository default branch',
    workspace: {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: {
      isolation: 'worktree',
      remote: 'auto',
      autoCommit: false,
      autoPush: false,
      createPr: false
    }
  })

  const workspacePayload = await workspaceEvent
  await completed

  assert.equal(workspacePayload.payload.git.remote, 'origin')
  assert.equal(workspacePayload.payload.git.baseBranch, 'main')
})

test('digital employee writes a failure report after release push failure', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'xoder-digital-release-failure-'))
  const repoPath = join(tempRoot, 'repo')
  const missingRemote = join(tempRoot, 'missing.git')

  await mkdir(repoPath, { recursive: true })
  await git(['init', repoPath])
  await git(['config', 'user.email', 'xoder@example.com'], repoPath)
  await git(['config', 'user.name', 'Xoder Test'], repoPath)
  await writeFile(join(repoPath, 'README.md'), '# Test\n', 'utf8')
  await git(['add', 'README.md'], repoPath)
  await git(['commit', '-m', 'initial'], repoPath)
  await git(['branch', '-M', 'main'], repoPath)
  await git(['remote', 'add', 'origin', missingRemote], repoPath)

  const fakeRuntime = new FakeRuntimeManager({
    async onStart(request) {
      await writeFile(join(request.workspace.path, 'release.txt'), 'release failure\n', 'utf8')
    }
  })
  const manager = new DigitalEmployeeManager({
    agentRuntimeManager: fakeRuntime,
    jobRoot: join(tempRoot, 'jobs')
  })
  const failed = onceJobEvent(manager, 'digital.job.failed')
  const reportCreated = onceJobEvent(manager, 'digital.report.created')
  const job = manager.startJob({
    goal: 'Preserve release state when push fails',
    approvalPolicy: 'fullAccess',
    workspace: {
      id: 'workspace-test',
      name: 'repo',
      path: repoPath
    },
    git: {
      isolation: 'worktree',
      remote: 'origin',
      autoCommit: true,
      autoPush: true,
      createPr: false
    }
  })

  const failureEvent = await failed
  const reportEvent = await reportCreated
  const serialized = manager.getJob(job.id)

  assert.equal(failureEvent.payload.stageId, 'release_prepare')
  assert.equal(reportEvent.payload.failure, true)
  assert.equal(serialized.release.committed, true)
  assert.equal(serialized.release.pushed, false)
  assert.match(reportEvent.payload.content, /Commit: [0-9a-f]+/)
  assert.match(reportEvent.payload.content, /DIGITAL_JOB_FAILED|128|push/i)
})

class FakeRuntimeManager extends EventEmitter {
  constructor(options = {}) {
    super()
    this.onStart = options.onStart || null
    this.lastRequest = null
  }

  startSession(request) {
    this.lastRequest = request
    const session = {
      id: 'session-test',
      status: 'running'
    }

    setImmediate(async () => {
      if (this.onStart) {
        await this.onStart(request)
      }

      this.emit('event', {
        id: 'event-started',
        sessionId: session.id,
        type: 'session.started',
        timestamp: Date.now(),
        payload: {}
      })
      this.emit('event', {
        id: 'event-completed',
        sessionId: session.id,
        type: 'session.completed',
        timestamp: Date.now(),
        payload: {
          result: 'done'
        }
      })
    })

    return session
  }

  stopSession() {
    return true
  }
}

class PausableRuntimeManager extends EventEmitter {
  constructor() {
    super()
    this.startCount = 0
    this.sessions = new Map()
  }

  startSession() {
    this.startCount += 1
    const sessionNumber = this.startCount
    const session = { id: `session-${sessionNumber}`, status: 'running' }
    this.sessions.set(session.id, session)

    setImmediate(() => {
      this.emit('event', {
        id: `${session.id}-started`,
        sessionId: session.id,
        type: 'session.started',
        timestamp: Date.now(),
        payload: {}
      })

      if (sessionNumber > 1) {
        this.emit('event', {
          id: `${session.id}-completed`,
          sessionId: session.id,
          type: 'session.completed',
          timestamp: Date.now(),
          payload: { result: 'resumed and completed' }
        })
      }
    })

    return session
  }

  stopSession(sessionId) {
    setImmediate(() => {
      this.emit('event', {
        id: `${sessionId}-cancelled`,
        sessionId,
        type: 'session.cancelled',
        timestamp: Date.now(),
        payload: { message: 'paused' }
      })
    })
    return true
  }
}

class HangingRuntimeManager extends EventEmitter {
  startSession() {
    const session = { id: 'session-hanging', status: 'running' }
    setImmediate(() => {
      this.emit('event', {
        id: 'session-hanging-started',
        sessionId: session.id,
        type: 'session.started',
        timestamp: Date.now(),
        payload: {}
      })
    })
    return session
  }

  stopSession() {
    return true
  }
}

function onceJobEvent(manager, type) {
  return new Promise((resolve) => {
    const listener = (event) => {
      if (event.type === type) {
        manager.off('event', listener)
        resolve(event)
      }
    }

    manager.on('event', listener)
  })
}

async function git(args, cwd) {
  return execFileAsync('git', args, {
    cwd,
    windowsHide: true
  })
}
