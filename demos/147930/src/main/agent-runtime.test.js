import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import {
  AgentRuntimeManager,
  buildClaudeCodeRuntimeInput,
  ClaudeCodeAdapter,
  classifyClaudeCodePermission,
  createClaudeCodePermissionDecisionFromResponse,
  createClaudeCodePermissionResponse,
  createClaudeCodeSdkUserMessage,
  decideClaudeCodePermission,
  getClaudeCodePermissionRequest,
  mapClaudeStreamEvent,
  normalizeRuntimeRequest,
  parseTeamCliResult,
  XODER_AGENT_EVENT_TYPES
} from './agent-runtime/index.js'

function createSessionState() {
  return {
    id: 'session-1',
    pendingTools: new Map(),
    finalResultSeen: false,
    rawSessionId: ''
  }
}

test('maps Claude Code init event to Xoder session metadata', () => {
  const events = mapClaudeStreamEvent(
    {
      type: 'system',
      subtype: 'init',
      cwd: 'F:/workspace',
      session_id: 'raw-session',
      tools: ['Read', 'Bash'],
      agents: ['general-purpose'],
      skills: ['debug'],
      mcp_servers: [],
      slash_commands: ['review'],
      model: 'deepseek-v4-pro[1m]',
      permissionMode: 'default',
      apiKeySource: 'customProvider',
      claude_code_version: '2.2.0'
    },
    createSessionState()
  )

  assert.deepEqual(
    events.map((event) => event.type),
    [XODER_AGENT_EVENT_TYPES.SESSION_STARTED, XODER_AGENT_EVENT_TYPES.SESSION_METADATA]
  )
  assert.equal(events[1].payload.provider, 'claude-code')
  assert.equal(events[1].payload.model, 'deepseek-v4-pro[1m]')
  assert.deepEqual(events[1].payload.tools, ['Read', 'Bash'])
})

test('maps assistant text and tool calls to Xoder events', () => {
  const state = createSessionState()
  const events = mapClaudeStreamEvent(
    {
      type: 'assistant',
      message: {
        id: 'assistant-message',
        content: [
          { type: 'text', text: 'OK' },
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'Read',
            input: { file_path: 'README.md' }
          }
        ]
      }
    },
    state
  )

  assert.deepEqual(
    events.map((event) => event.type),
    [XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_DELTA, XODER_AGENT_EVENT_TYPES.TOOL_STARTED]
  )
  assert.equal(events[0].payload.text, 'OK')
  assert.equal(events[1].payload.name, 'Read')
  assert.equal(events[1].payload.summary, 'README.md')
})

test('maps assistant thinking and edit input previews', () => {
  const state = createSessionState()
  const events = mapClaudeStreamEvent(
    {
      type: 'assistant',
      message: {
        id: 'assistant-message',
        content: [
          { type: 'thinking', thinking: 'I should inspect the file before editing.' },
          {
            type: 'tool_use',
            id: 'tool-edit-1',
            name: 'Edit',
            input: {
              file_path: 'src/main.js',
              old_string: 'const oldValue = true',
              new_string: 'const oldValue = false'
            }
          }
        ]
      }
    },
    state
  )

  assert.deepEqual(
    events.map((event) => event.type),
    [
      XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_DELTA,
      XODER_AGENT_EVENT_TYPES.THINKING_DELTA,
      XODER_AGENT_EVENT_TYPES.TOOL_STARTED,
      XODER_AGENT_EVENT_TYPES.ARTIFACT_CHANGED,
      XODER_AGENT_EVENT_TYPES.REVIEW_UPDATED
    ]
  )
  assert.equal(events[0].payload.hidden, true)
  assert.equal(events[0].payload.thinking, 'I should inspect the file before editing.')
  assert.equal(events[2].payload.inputPreview.includes('oldValue'), true)
  assert.equal(events[3].payload.operation, 'edit')
  assert.equal(events[3].payload.preview.includes('src/main.js'), true)
})

test('maps AskUserQuestion tool use to an inline question event', () => {
  const state = createSessionState()
  const events = mapClaudeStreamEvent(
    {
      type: 'assistant',
      message: {
        id: 'assistant-message',
        content: [
          {
            type: 'tool_use',
            id: 'question-tool-1',
            name: 'AskUserQuestion',
            input: {
              questions: [
                {
                  header: 'Mode',
                  question: 'Which mode should Xoder use?',
                  options: [
                    { label: 'Plan', description: 'Create a plan first.' },
                    { label: 'Auto', description: 'Let the agent decide.' }
                  ],
                  multiSelect: false
                }
              ]
            }
          }
        ]
      }
    },
    state
  )

  assert.deepEqual(
    events.map((event) => event.type),
    [XODER_AGENT_EVENT_TYPES.TOOL_STARTED, XODER_AGENT_EVENT_TYPES.QUESTION_REQUESTED]
  )
  assert.equal(events[1].payload.questions[0].header, 'Mode')
  assert.equal(events[1].payload.questions[0].options[0].label, 'Plan')
})

test('maps TodoWrite and system task progress to plan and task events', () => {
  const state = createSessionState()
  const todoEvents = mapClaudeStreamEvent(
    {
      type: 'assistant',
      message: {
        content: [
          {
            type: 'tool_use',
            id: 'todo-tool-1',
            name: 'TodoWrite',
            input: {
              todos: [
                { content: 'Create spec', status: 'pending' },
                { content: 'Implement UI', status: 'in_progress' }
              ]
            }
          }
        ]
      }
    },
    state
  )
  const progressEvents = mapClaudeStreamEvent(
    {
      type: 'system',
      subtype: 'task_progress',
      task_id: 'task-1',
      tool_use_id: 'tool-1',
      description: 'Reading files',
      last_tool_name: 'Read',
      usage: {
        total_tokens: 100,
        tool_uses: 2,
        duration_ms: 10
      }
    },
    state
  )

  assert.equal(todoEvents.some((event) => event.type === XODER_AGENT_EVENT_TYPES.PLAN_UPDATED), true)
  assert.equal(
    todoEvents.filter((event) => event.type === XODER_AGENT_EVENT_TYPES.TASK_UPDATED).length,
    2
  )
  assert.deepEqual(
    progressEvents.map((event) => event.type),
    [XODER_AGENT_EVENT_TYPES.TASK_PROGRESS, XODER_AGENT_EVENT_TYPES.AGENT_PROGRESS]
  )
  assert.equal(progressEvents[0].payload.lastToolName, 'Read')
})

test('maps markdown writes to spec and review events', () => {
  const state = createSessionState()
  const events = mapClaudeStreamEvent(
    {
      type: 'assistant',
      message: {
        content: [
          {
            type: 'tool_use',
            id: 'write-tool-1',
            name: 'Write',
            input: {
              file_path: 'docs/Spec Unit6.md',
              content: '# Unit6\n\n- Lesson 17\n- Lesson 18'
            }
          }
        ]
      }
    },
    state
  )

  assert.equal(events.some((event) => event.type === XODER_AGENT_EVENT_TYPES.SPEC_CREATED), true)
  const reviewEvent = events.find((event) => event.type === XODER_AGENT_EVENT_TYPES.REVIEW_UPDATED)
  assert.equal(Boolean(reviewEvent), true)
  assert.equal(reviewEvent.payload.additions, 3)
  assert.equal(reviewEvent.payload.deletions, 0)
})

test('maps tool results and final result to completed events', () => {
  const state = createSessionState()

  mapClaudeStreamEvent(
    {
      type: 'assistant',
      message: {
        content: [
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'Read',
            input: { file_path: 'README.md' }
          }
        ]
      }
    },
    state
  )

  const toolEvents = mapClaudeStreamEvent(
    {
      type: 'user',
      message: {
        content: [{ type: 'tool_result', tool_use_id: 'tool-1', content: 'file contents' }]
      }
    },
    state
  )
  const resultEvents = mapClaudeStreamEvent(
    {
      type: 'result',
      subtype: 'success',
      result: 'Done',
      session_id: 'raw-session',
      duration_ms: 10,
      total_cost_usd: 0.01
    },
    state
  )

  assert.equal(toolEvents[0].type, XODER_AGENT_EVENT_TYPES.TOOL_COMPLETED)
  assert.equal(toolEvents[0].payload.content, 'file contents')
  assert.deepEqual(
    resultEvents.map((event) => event.type),
    [
      XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_COMPLETED,
      XODER_AGENT_EVENT_TYPES.SESSION_COMPLETED
    ]
  )
  assert.equal(resultEvents[1].payload.result, 'Done')
})

test('maps unknown slash skill result to a failed session', () => {
  const state = createSessionState()
  const events = mapClaudeStreamEvent(
    {
      type: 'result',
      subtype: 'success',
      is_error: false,
      result: 'Unknown skill: team'
    },
    state
  )

  assert.deepEqual(events.map((event) => event.type), [XODER_AGENT_EVENT_TYPES.SESSION_FAILED])
  assert.equal(events[0].payload.code, 'UNKNOWN_SKILL')
  assert.equal(events[0].payload.message, 'Unknown skill: team')
})

test('runtime manager validates workspace and can cancel running sessions', () => {
  class FakeAdapter {
    start(session, emit) {
      emit({
        id: 'event-1',
        sessionId: session.id,
        type: XODER_AGENT_EVENT_TYPES.SESSION_STARTED,
        timestamp: Date.now(),
        payload: {}
      })

      return {
        stop() {
          session.stopped = true
        }
      }
    }

    listCapabilities() {
      return { provider: 'fake' }
    }
  }

  const manager = new AgentRuntimeManager({ adapter: new FakeAdapter() })

  assert.throws(
    () => manager.startSession({ prompt: 'hi' }),
    (error) => error.code === 'NO_WORKSPACE'
  )

  const session = manager.startSession({
    prompt: 'hi',
    workspace: { id: 'w1', name: 'workspace', path: 'F:/workspace' }
  })

  assert.equal(session.status, 'running')
  assert.equal(manager.stopSession(session.id), true)
  assert.equal(manager.getSession(session.id).status, 'cancelled')
})

test('Claude Code adapter declares long-running stream transport', () => {
  const adapter = new ClaudeCodeAdapter()

  assert.equal(adapter.listCapabilities().transport, 'stdio-stream-json-long-running')
})

test('Claude Code adapter supports opt-in concurrent session isolation while reusing idle workers', () => {
  const adapter = new ClaudeCodeAdapter({ maxConcurrentSessions: 2 })
  const isolatedRequest = { options: { sessionIsolation: true } }
  const first = adapter.getWorker('runtime', 'workspace', isolatedRequest)
  first.active = {}
  const second = adapter.getWorker('runtime', 'workspace', isolatedRequest)
  const reused = adapter.getWorker('runtime', 'workspace', isolatedRequest)
  const normal = adapter.getWorker('runtime', 'workspace', {})

  assert.notEqual(first.key, second.key)
  assert.equal(reused.key, second.key)
  assert.equal(normal.key, first.key)
  assert.equal(adapter.listCapabilities().reliability.maxConcurrentSessions, 2)
  assert.equal(adapter.listCapabilities().reliability.sessionIsolation, true)
  first.active = null
  adapter.stopAll()
})

test('Claude Code adapter reports idle runtime and stops it after configured timeout', async () => {
  const runtimePath = await mkdtemp(join(tmpdir(), 'xoder-runtime-idle-'))
  const workspacePath = await mkdtemp(join(tmpdir(), 'xoder-runtime-workspace-'))
  await mkdir(join(runtimePath, 'dist'), { recursive: true })
  await writeFile(join(runtimePath, 'dist', 'cli.js'), 'setInterval(() => {}, 1000)\n', 'utf8')

  const manager = new AgentRuntimeManager({
    adapter: new ClaudeCodeAdapter({
      runtimePath,
      bunCommand: process.execPath,
      idleWarningMs: 30,
      idleTimeoutMs: 100
    })
  })
  const events = []
  manager.on('event', (event) => events.push(event))

  try {
    const session = manager.startSession({
      prompt: 'wait for idle detection',
      workspace: {
        id: 'idle-workspace',
        name: 'idle workspace',
        path: workspacePath
      }
    })

    await waitForCondition(() => events.some((event) => event.type === XODER_AGENT_EVENT_TYPES.RUNTIME_STALLED))
    await waitForCondition(() => events.some((event) => event.type === XODER_AGENT_EVENT_TYPES.SESSION_FAILED))

    const stalled = events.find((event) => event.type === XODER_AGENT_EVENT_TYPES.RUNTIME_STALLED)
    const failed = events.find((event) => event.type === XODER_AGENT_EVENT_TYPES.SESSION_FAILED)
    assert.equal(stalled.payload.status, 'warning')
    assert.equal(failed.payload.code, 'RUNTIME_IDLE_TIMEOUT')
    assert.equal(manager.getSession(session.id).status, 'failed')
  } finally {
    manager.stopAll()
    await rm(runtimePath, { recursive: true, force: true, maxRetries: 6, retryDelay: 100 })
    await rm(workspacePath, { recursive: true, force: true, maxRetries: 6, retryDelay: 100 })
  }
})

test('Claude Code adapter recovers the same session after an unexpected CLI exit', async () => {
  const runtimePath = await mkdtemp(join(tmpdir(), 'xoder-runtime-restart-'))
  const workspacePath = await mkdtemp(join(tmpdir(), 'xoder-runtime-restart-workspace-'))
  await mkdir(join(runtimePath, 'dist'), { recursive: true })
  await writeFile(
    join(runtimePath, 'dist', 'cli.js'),
    [
      "const fs = require('node:fs')",
      "const path = require('node:path')",
      "const marker = path.join(process.cwd(), '.xoder-restart-count')",
      "const count = Number(fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8') : 0)",
      "fs.writeFileSync(marker, String(count + 1))",
      "if (count === 0) { setTimeout(() => process.exit(7), 25) }",
      "else {",
      "  console.log(JSON.stringify({ type: 'system', subtype: 'init', session_id: 'recovered-raw' }))",
      "  setTimeout(() => console.log(JSON.stringify({ type: 'result', subtype: 'success', result: 'recovered' })), 25)",
      "}",
      "setInterval(() => {}, 1000)"
    ].join('\n'),
    'utf8'
  )

  const manager = new AgentRuntimeManager({
    adapter: new ClaudeCodeAdapter({
      runtimePath,
      bunCommand: process.execPath,
      idleWarningMs: 0,
      idleTimeoutMs: 0,
      maxRuntimeRestarts: 1
    })
  })
  const events = []
  manager.on('event', event => events.push(event))

  try {
    const session = manager.startSession({
      prompt: 'recover this task',
      workspace: {
        id: 'restart-workspace',
        name: 'restart workspace',
        path: workspacePath
      }
    })

    await waitForCondition(() => events.some(event => event.type === XODER_AGENT_EVENT_TYPES.SESSION_COMPLETED))

    assert.equal(events.some(event => event.type === XODER_AGENT_EVENT_TYPES.RUNTIME_RESTARTING), true)
    assert.equal(manager.getSession(session.id).status, 'completed')
  } finally {
    manager.stopAll()
    await rm(runtimePath, { recursive: true, force: true, maxRetries: 6, retryDelay: 100 })
    await rm(workspacePath, { recursive: true, force: true, maxRetries: 6, retryDelay: 100 })
  }
})

test('Claude Code adapter reports local-jsx team and employee commands as not headless-safe', async () => {
  const runtimePath = await mkdtemp(join(tmpdir(), 'xoder-runtime-capabilities-'))
  await mkdir(join(runtimePath, 'src', 'entrypoints'), { recursive: true })
  await mkdir(join(runtimePath, 'src', 'commands', 'team'), { recursive: true })
  await mkdir(join(runtimePath, 'src', 'commands', 'employee'), { recursive: true })
  await mkdir(join(runtimePath, '.claude'), { recursive: true })
  await writeFile(join(runtimePath, 'src', 'entrypoints', 'cli.tsx'), '')
  await writeFile(
    join(runtimePath, 'src', 'commands', 'team', 'index.ts'),
    "export default { type: 'local-jsx', name: 'team' }"
  )
  await writeFile(
    join(runtimePath, 'src', 'commands', 'employee', 'index.ts'),
    "export default { type: 'local-jsx', name: 'employee' }"
  )
  await writeFile(
    join(runtimePath, '.claude', 'settings.local.json'),
    JSON.stringify({
      employees: {
        backend: {
          agent: 'general-purpose',
          description: 'Backend employee',
          memory: 'project',
          worktreeIsolation: true
        }
      }
    })
  )

  const capabilities = new ClaudeCodeAdapter({ runtimePath }).listCapabilities()

  assert.equal(capabilities.modes.expertTeam, true)
  assert.equal(capabilities.modes.nativeTeamRuntime, false)
  assert.equal(capabilities.modes.digitalEmployee, false)
  assert.equal(capabilities.modes.nativeEmployeeRuntime, false)
  assert.equal(capabilities.commands.team.detected, true)
  assert.equal(capabilities.commands.team.commandType, 'local-jsx')
  assert.equal(capabilities.commands.team.headlessSupported, false)
  assert.equal(capabilities.commands.employee.detected, true)
  assert.equal(capabilities.commands.employee.commandType, 'local-jsx')
  assert.equal(capabilities.commands.employee.headlessSupported, false)
  assert.equal(
    capabilities.slashCommands.some((command) => command.name === 'team'),
    false
  )
  assert.equal(
    capabilities.slashCommands.some((command) => command.name === 'employee'),
    false
  )
  assert.deepEqual(capabilities.employees, [])
})

async function waitForCondition(predicate, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (predicate()) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  throw new Error('Timed out waiting for test condition.')
}

test('expert team mode does not send local-jsx /team through headless runtime', async () => {
  const runtimePath = await mkdtemp(join(tmpdir(), 'xoder-team-runtime-'))
  await mkdir(join(runtimePath, 'src', 'commands', 'team'), { recursive: true })
  await writeFile(
    join(runtimePath, 'src', 'commands', 'team', 'index.ts'),
    "export default { type: 'local-jsx', name: 'team' }"
  )

  const runtimeInput = buildClaudeCodeRuntimeInput(
    {
      prompt: 'build the app',
      workspace: {
        name: 'xoder',
        path: 'F:/workspace'
      },
      mode: 'auto',
      permissions: {
        approvalMode: 'auto',
        allowShell: false,
        allowWrite: true
      },
      options: {
        intentMode: 'code',
        expertMode: 'expert_team'
      }
    },
    runtimePath
  )

  assert.equal(runtimeInput.mode, 'single-agent')
  assert.equal(runtimeInput.content.startsWith('/team'), false)
  assert.equal(runtimeInput.content.includes('Do not call /team or /employee'), true)
  assert.equal(runtimeInput.content.includes('Task/Agent sub-agents'), true)
  assert.equal(runtimeInput.content.includes('Workspace path JSON string: "F:/workspace"'), true)
})

test('maps waiting team CLI results without completing the session', () => {
  const state = createSessionState()
  const events = mapClaudeStreamEvent(
    {
      type: 'result',
      subtype: 'success',
      result:
        'Team team-20260708-120000: waiting_for_user\nLeader needs clarification:\nWhich UI?'
    },
    state,
    {
      holdTeamWaitingResult: true
    }
  )

  assert.deepEqual(
    events.map((event) => event.type),
    [XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_COMPLETED]
  )
  assert.equal(state.finalResultSeen, false)
  assert.equal(state.teamRunId, 'team-20260708-120000')
})

test('maps blocked and stopped team CLI results to terminal session states', () => {
  const blockedEvents = mapClaudeStreamEvent(
    {
      type: 'result',
      subtype: 'success',
      result: 'Team team-1: blocked\nTeam run blocked: patch conflict'
    },
    createSessionState(),
    {
      holdTeamWaitingResult: true
    }
  )
  const stoppedEvents = mapClaudeStreamEvent(
    {
      type: 'result',
      subtype: 'success',
      result: 'Team team-1: stopped\nStopped team run team-1.'
    },
    createSessionState(),
    {
      holdTeamWaitingResult: true
    }
  )

  assert.deepEqual(
    blockedEvents.map((event) => event.type),
    [XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_COMPLETED, XODER_AGENT_EVENT_TYPES.SESSION_FAILED]
  )
  assert.deepEqual(
    stoppedEvents.map((event) => event.type),
    [
      XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_COMPLETED,
      XODER_AGENT_EVENT_TYPES.SESSION_CANCELLED
    ]
  )
})

test('parses team CLI result headers', () => {
  assert.deepEqual(parseTeamCliResult('Team team-1: completed\nDone'), {
    runId: 'team-1',
    status: 'completed'
  })
  assert.equal(parseTeamCliResult('plain answer'), null)
})

test('creates SDK user messages for the long-running stdin protocol', () => {
  const message = createClaudeCodeSdkUserMessage('hello')

  assert.equal(message.type, 'user')
  assert.equal(message.content, 'hello')
  assert.equal(message.message.role, 'user')
  assert.equal(message.message.content, 'hello')
  assert.equal(typeof message.uuid, 'string')
  assert.equal(message.uuid.length > 0, true)
})

test('parses Claude Code can_use_tool permission requests', () => {
  const request = getClaudeCodePermissionRequest({
    type: 'control_request',
    request_id: 'permission-request-1',
    request: {
      subtype: 'can_use_tool',
      tool_name: 'WebSearch',
      input: { query: 'Tianjin weather' },
      tool_use_id: 'tool-use-1',
      action_description: 'Allow WebSearch?'
    }
  })

  assert.equal(request.requestId, 'permission-request-1')
  assert.equal(request.toolName, 'WebSearch')
  assert.deepEqual(request.input, { query: 'Tianjin weather' })
  assert.equal(request.toolUseId, 'tool-use-1')
  assert.equal(request.actionDescription, 'Allow WebSearch?')
})

test('auto approval follows Xoder permission switches', () => {
  const deniedShell = decideClaudeCodePermission(
    {
      permissions: {
        allowShell: false,
        allowWrite: true,
        autoApproveAll: true
      }
    },
    {
      toolName: 'Bash',
      input: { command: 'echo OK' }
    }
  )
  const allowedShell = decideClaudeCodePermission(
    {
      permissions: {
        allowShell: true,
        allowWrite: false,
        autoApproveAll: true
      }
    },
    {
      toolName: 'Bash',
      input: { command: 'echo OK' }
    }
  )
  const allowedWrite = decideClaudeCodePermission(
    {
      permissions: {
        allowShell: false,
        allowWrite: true,
        autoApproveAll: true
      }
    },
    {
      toolName: 'Write',
      input: { file_path: 'README.md', content: 'OK' }
    }
  )

  assert.equal(deniedShell.allow, false)
  assert.equal(allowedShell.allow, true)
  assert.equal(allowedShell.autoApproved, true)
  assert.deepEqual(allowedShell.updatedInput, { command: 'echo OK' })
  assert.equal(allowedWrite.allow, true)
  assert.deepEqual(allowedWrite.updatedInput, { file_path: 'README.md', content: 'OK' })
})

test('permission policies distinguish safe, workspace, and overnight actions', () => {
  const readRequest = { toolName: 'Read', input: { file_path: 'F:/workspace/README.md' } }
  const writeRequest = { toolName: 'Write', input: { file_path: 'F:/workspace/README.md' } }
  const shellRequest = { toolName: 'Bash', input: { command: 'npm test' } }

  assert.equal(
    decideClaudeCodePermission(
      { permissions: { policy: 'semi_auto', allowRead: true, allowWrite: true, allowShell: true } },
      readRequest
    ).allow,
    true
  )
  assert.equal(
    decideClaudeCodePermission(
      { permissions: { policy: 'semi_auto', allowRead: true, allowWrite: true, allowShell: true } },
      writeRequest
    ).allow,
    false
  )
  assert.equal(
    decideClaudeCodePermission(
      {
        workspace: { path: 'F:/workspace' },
        permissions: {
          policy: 'workspace_auto',
          workspaceAuto: true,
          allowWrite: true,
          allowShell: true
        }
      },
      { toolName: 'Write', input: { file_path: 'F:/workspace/src/app.js' } }
    ).allow,
    true
  )
  assert.equal(
    decideClaudeCodePermission(
      {
        workspace: { path: 'F:/workspace' },
        permissions: {
          policy: 'workspace_auto',
          workspaceAuto: true,
          allowWrite: true,
          allowShell: true
        }
      },
      { toolName: 'Write', input: { file_path: 'F:/other/app.js' } }
    ).allow,
    false
  )
  assert.equal(
    decideClaudeCodePermission(
      { permissions: { policy: 'overnight', allowShell: true, allowWrite: true, allowNetwork: true } },
      shellRequest
    ).allow,
    false
  )
})

test('normalizes mobile approval policies without losing their selected mode', () => {
  const request = normalizeRuntimeRequest({
    prompt: 'continue overnight',
    workspace: { path: 'F:/workspace' },
    permissions: {
      approvalMode: 'overnight'
    }
  })

  assert.equal(request.permissions.approvalMode, 'overnight')
  assert.equal(request.permissions.policy, 'overnight')
  assert.equal(request.permissions.autoApproveAll, true)

  const fullAccess = normalizeRuntimeRequest({
    prompt: 'run with full access',
    workspace: { path: 'F:/workspace' },
    permissions: {
      approvalMode: 'fullAccess'
    }
  })

  assert.equal(fullAccess.permissions.approvalMode, 'fullAccess')
  assert.equal(fullAccess.permissions.policy, 'auto')
  assert.equal(fullAccess.permissions.allowDangerouslyApproveAll, true)
})

test('classifies shell, deletion, release, network, and workspace risks', () => {
  const request = {
    workspace: { path: 'F:/workspace' },
    permissions: { policy: 'auto', allowShell: true, allowWrite: true, allowNetwork: true }
  }

  const gitPush = classifyClaudeCodePermission(request, {
    toolName: 'Bash',
    input: { command: 'git push origin xoder/fix' }
  })
  const directoryDelete = classifyClaudeCodePermission(request, {
    toolName: 'Bash',
    input: { command: 'rm -rf F:/workspace/tmp' }
  })
  const pullRequest = classifyClaudeCodePermission(request, {
    toolName: 'Bash',
    input: { command: 'gh pr create --draft' }
  })
  const externalWrite = classifyClaudeCodePermission(request, {
    toolName: 'Write',
    input: { file_path: 'F:/other/README.md' }
  })
  const relativeWrite = classifyClaudeCodePermission(request, {
    toolName: 'Write',
    input: { file_path: 'README.md' }
  })

  assert.equal(gitPush.riskLevel, 'critical')
  assert.equal(gitPush.kinds.includes('git_push'), true)
  assert.equal(gitPush.requiresApproval, true)
  assert.equal(directoryDelete.kinds.includes('delete_directory'), true)
  assert.equal(pullRequest.kinds.includes('pr_create'), true)
  assert.equal(externalWrite.kinds.includes('outside_workspace'), true)
  assert.equal(relativeWrite.kinds.includes('outside_workspace'), false)
})

test('creates Claude Code permission allow responses', () => {
  const response = createClaudeCodePermissionResponse(
    {
      type: 'control_request',
      request_id: 'permission-request-1',
      request: {
        subtype: 'can_use_tool',
        tool_name: 'WebSearch',
        input: { query: 'Tianjin weather' },
        tool_use_id: 'tool-use-1'
      }
    },
    {
      allow: true,
      updatedInput: { query: 'Tianjin weather' },
      decisionClassification: 'user_temporary'
    }
  )

  assert.deepEqual(response, {
    type: 'control_response',
    response: {
      subtype: 'success',
      request_id: 'permission-request-1',
      response: {
        behavior: 'allow',
        updatedInput: { query: 'Tianjin weather' },
        toolUseID: 'tool-use-1',
        decisionClassification: 'user_temporary'
      }
    }
  })
})

test('creates Claude Code permission deny responses', () => {
  const response = createClaudeCodePermissionResponse(
    {
      type: 'control_request',
      request_id: 'permission-request-2',
      request: {
        subtype: 'can_use_tool',
        tool_name: 'Bash',
        input: { command: 'echo OK' },
        tool_use_id: 'tool-use-2'
      }
    },
    {
      allow: false,
      message: 'Denied in test.',
      decisionClassification: 'user_reject'
    }
  )

  assert.deepEqual(response, {
    type: 'control_response',
    response: {
      subtype: 'success',
      request_id: 'permission-request-2',
      response: {
        behavior: 'deny',
        message: 'Denied in test.',
        interrupt: undefined,
        toolUseID: 'tool-use-2',
        decisionClassification: 'user_reject'
      }
    }
  })
})

test('creates manual permission decisions from renderer responses', () => {
  const allowDecision = createClaudeCodePermissionDecisionFromResponse(
    { behavior: 'allow' },
    {
      toolName: 'Bash',
      input: { command: 'echo OK' }
    }
  )
  const denyDecision = createClaudeCodePermissionDecisionFromResponse(
    { behavior: 'deny', message: 'No.' },
    {
      toolName: 'Bash',
      input: { command: 'echo OK' }
    }
  )

  assert.equal(allowDecision.allow, true)
  assert.equal(allowDecision.autoApproved, false)
  assert.deepEqual(allowDecision.updatedInput, { command: 'echo OK' })
  assert.equal(denyDecision.allow, false)
  assert.equal(denyDecision.message, 'No.')
})

test('runtime manager forwards renderer permission responses to the adapter handle', () => {
  const calls = []

  class FakeAdapter {
    start(session, emit) {
      emit({
        id: 'event-1',
        sessionId: session.id,
        type: XODER_AGENT_EVENT_TYPES.SESSION_STARTED,
        timestamp: Date.now(),
        payload: {}
      })

      return {
        stop() {},
        respondToPermission(requestId, response) {
          calls.push({ requestId, response })
          return true
        }
      }
    }

    listCapabilities() {
      return { provider: 'fake' }
    }
  }

  const manager = new AgentRuntimeManager({ adapter: new FakeAdapter() })
  const session = manager.startSession({
    prompt: 'hi',
    workspace: { id: 'w1', name: 'workspace', path: 'F:/workspace' }
  })

  assert.equal(
    manager.respondToPermission(session.id, 'permission-request-1', { behavior: 'allow' }),
    true
  )
  assert.deepEqual(calls, [
    {
      requestId: 'permission-request-1',
      response: { behavior: 'allow' }
    }
  ])
})

test('runtime manager shuts down adapter workers on stopAll', () => {
  class FakeAdapter {
    constructor() {
      this.stopped = false
    }

    start() {
      return {
        stop() {}
      }
    }

    stopAll() {
      this.stopped = true
    }

    listCapabilities() {
      return { provider: 'fake' }
    }
  }

  const adapter = new FakeAdapter()
  const manager = new AgentRuntimeManager({ adapter })

  manager.stopAll()

  assert.equal(adapter.stopped, true)
})

test('runtime manager bounds retained event history while preserving total count', () => {
  class ChattyAdapter {
    start(session, emit) {
      for (let index = 0; index < 8; index += 1) {
        emit({
          id: `event-${index}`,
          sessionId: session.id,
          type: XODER_AGENT_EVENT_TYPES.RUNTIME_RAW,
          timestamp: Date.now(),
          payload: { index }
        })
      }

      return { stop() {} }
    }

    listCapabilities() {
      return { provider: 'fake' }
    }
  }

  const manager = new AgentRuntimeManager({ adapter: new ChattyAdapter(), eventHistoryLimit: 3 })
  const session = manager.startSession({
    prompt: 'retain only recent events',
    workspace: { id: 'w1', name: 'workspace', path: 'F:/workspace' }
  })
  const stored = manager.sessions.get(session.id)

  assert.equal(stored.events.length, 3)
  assert.equal(manager.getSession(session.id).eventCount, 9)
  assert.equal(manager.getSession(session.id).retainedEventCount, 3)
})
