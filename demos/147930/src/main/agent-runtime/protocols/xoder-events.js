import { randomUUID } from 'node:crypto'

export const XODER_AGENT_EVENT_TYPES = Object.freeze({
  SESSION_STARTED: 'session.started',
  SESSION_METADATA: 'session.metadata',
  MESSAGE_USER: 'message.user',
  MESSAGE_ASSISTANT_DELTA: 'message.assistant.delta',
  MESSAGE_ASSISTANT_COMPLETED: 'message.assistant.completed',
  THINKING_DELTA: 'thinking.delta',
  TOOL_STARTED: 'tool.started',
  TOOL_OUTPUT: 'tool.output',
  TOOL_COMPLETED: 'tool.completed',
  TOOL_FAILED: 'tool.failed',
  TODO_UPDATED: 'todo.updated',
  ARTIFACT_CHANGED: 'artifact.changed',
  QUESTION_REQUESTED: 'question.requested',
  QUESTION_ANSWERED: 'question.answered',
  QUESTION_DECLINED: 'question.declined',
  PLAN_UPDATED: 'plan.updated',
  PLAN_REQUESTED: 'plan.requested',
  PLAN_APPROVED: 'plan.approved',
  PLAN_REJECTED: 'plan.rejected',
  TASK_CREATED: 'task.created',
  TASK_STARTED: 'task.started',
  TASK_UPDATED: 'task.updated',
  TASK_PROGRESS: 'task.progress',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  AGENT_ASSIGNED: 'agent.assigned',
  AGENT_PROGRESS: 'agent.progress',
  SPEC_CREATED: 'spec.created',
  SPEC_UPDATED: 'spec.updated',
  REVIEW_UPDATED: 'review.updated',
  PERMISSION_REQUESTED: 'permission.requested',
  PERMISSION_GRANTED: 'permission.granted',
  PERMISSION_DENIED: 'permission.denied',
  SESSION_COMPLETED: 'session.completed',
  SESSION_FAILED: 'session.failed',
  SESSION_CANCELLED: 'session.cancelled',
  RUNTIME_RAW: 'runtime.raw',
  RUNTIME_STDERR: 'runtime.stderr',
  RUNTIME_STALLED: 'runtime.stalled',
  RUNTIME_RESTARTING: 'runtime.restarting'
})

const ARTIFACT_TOOL_NAMES = new Set(['Edit', 'Write', 'NotebookEdit'])
const QUESTION_TOOL_NAMES = new Set(['AskUserQuestion'])
const PLAN_TOOL_NAMES = new Set(['ExitPlanMode', 'ExitPlanModeV2', 'exit_plan_mode', 'exit_plan_mode_v2'])
const TASK_TOOL_NAMES = new Set(['Task', 'Agent'])
const TASK_LIST_TOOL_NAMES = new Set(['TaskCreate', 'TaskUpdate', 'TaskList', 'TaskGet'])

export function createXoderEvent(sessionId, type, payload = {}, options = {}) {
  return {
    id: options.id || randomUUID(),
    sessionId,
    type,
    timestamp: options.timestamp || Date.now(),
    payload
  }
}

export function normalizeRuntimeRequest(request = {}) {
  const prompt = String(request.prompt || '').trim()
  const workspace = request.workspace || {}

  return {
    questId: String(request.questId || '').trim(),
    prompt,
    workspace: {
      id: String(workspace.id || '').trim(),
      name: String(workspace.name || '').trim(),
      path: String(workspace.path || request.workspacePath || '').trim()
    },
    mode: normalizeRunMode(request.mode || request.options?.runMode || request.runMode || 'auto'),
    permissions: normalizePermissions(request),
    options: {
      intentMode: String(request.options?.intentMode || request.intentMode || 'auto'),
      expertMode: String(request.options?.expertMode || request.expertMode || 'single_agent'),
      employeeKey: String(request.options?.employeeKey || request.employeeKey || ''),
      assignedUnitId: String(request.options?.assignedUnitId || request.assignedUnitId || '')
    },
    agent: {
      provider: String(request.agent?.provider || 'claude-code'),
      model: String(request.agent?.model || 'default')
    }
  }
}

export function buildClaudeCodePrompt(request) {
  const workspaceLines = request.workspace.path
    ? [
        `Workspace name JSON string: ${toAsciiJsonString(request.workspace.name || 'current workspace')}`,
        `Workspace path JSON string: ${toAsciiJsonString(request.workspace.path)}`,
        'Decode JSON unicode escape sequences before using workspace fields. When you need to read, edit, or run project files, use the decoded workspace path as the target. Prefer absolute paths when possible.'
      ]
    : ['No workspace path was provided. Ask for one if the task requires project files.']
  const shellPolicy = request.permissions.allowShell
    ? 'Shell use is allowed when it is useful for the task.'
    : 'Shell use was not enabled in the Xoder UI. Avoid Bash unless the task cannot be completed otherwise.'
  const writePolicy = request.permissions.allowWrite
    ? 'File write/edit tools are allowed when they are necessary for the requested task.'
    : 'File write/edit tools were not enabled in the Xoder UI. Prefer read-only analysis.'
  const modePolicy = buildModePolicy(request.mode)
  const expertPolicy = buildExpertPolicy(request.options)

  return [
    'You are running as Xoder backup agent runtime through a black-box Claude Code CLI adapter.',
    'The user request is encoded as a JavaScript JSON string to preserve non-ASCII text.',
    'Decode the UserRequestJson string and obey the decoded request exactly.',
    'Do not inspect files, call tools, or use the workspace unless the decoded user request explicitly asks for project work.',
    'Do not modify the backup agent runtime implementation unless the decoded user task explicitly asks for that.',
    'This session runs through headless stream-json. Do not invoke slash commands such as /team or /employee, and do not call a Skill named "team" or "employee"; use available tools directly instead.',
    '',
    `UserRequestJson = ${toAsciiJsonString(request.prompt)}`,
    '',
    'Workspace context, only if the decoded request needs project files:',
    ...workspaceLines,
    `Run mode: ${request.mode}`,
    `Intent mode: ${request.options.intentMode}`,
    `Expert mode: ${request.options.expertMode}`,
    request.options.employeeKey
      ? `Assigned employee key JSON string: ${toAsciiJsonString(request.options.employeeKey)}`
      : '',
    modePolicy,
    expertPolicy,
    'When requirements are unclear, use AskUserQuestion instead of guessing. Prefer structured options so the Xoder UI can render an inline question card.',
    'For multi-step project work, maintain progress with TodoWrite. If a sub-agent is useful, use Task with a clear description and subagent_type when available.',
    'When you create or update a markdown specification, use a .md file name that includes Spec, Plan, or the task topic when appropriate.',
    shellPolicy,
    writePolicy
  ]
    .filter(Boolean)
    .join('\n')
}

function buildModePolicy(mode) {
  if (mode === 'plan') {
    return 'Run mode policy: Plan. Clarify requirements first, produce a plan/spec before implementation, and avoid writes except plan/spec artifacts until the user approves execution.'
  }

  if (mode === 'fast') {
    return 'Run mode policy: Fast. Keep reasoning concise, avoid unnecessary exploration, and use the smallest tool set that can complete the task safely.'
  }

  return 'Run mode policy: Auto. Choose between clarification, planning, implementation, and review based on task risk and ambiguity.'
}

function buildExpertPolicy(options = {}) {
  const expertMode = String(options.expertMode || '').trim()

  if (expertMode === 'expert_team') {
    return 'Expert mode policy: expert_team. Do not call /team or /employee in this headless runtime. Use TodoWrite to make the expert workflow visible, then use Task/Agent sub-agents for independent specialist work when those tools are available. Report each specialist result back in the final answer.'
  }

  if (expertMode === 'digital_employee') {
    return 'Expert mode policy: digital_employee. Do not call /employee in this headless runtime. Follow the assigned employee identity when present, and keep progress visible through tasks and tool events.'
  }

  if (expertMode === 'reviewer') {
    return 'Expert mode policy: reviewer. Prioritize review findings, diffs, risks, and verification evidence.'
  }

  return 'Expert mode policy: single_agent. Work as one agent unless delegation clearly reduces risk or latency.'
}

function getRuntimeResultFailure(rawEvent = {}) {
  const resultText = String(rawEvent.result || '').trim()
  const unknownSkillMatch = resultText.match(/^Unknown skill:\s*(.+)$/i)

  if (unknownSkillMatch) {
    return {
      code: 'UNKNOWN_SKILL',
      message: `Unknown skill: ${unknownSkillMatch[1].trim()}`
    }
  }

  return null
}

export function toAsciiJsonString(value) {
  return Array.from(JSON.stringify(String(value ?? '')), (character) => {
    const codePoint = character.codePointAt(0)

    if (codePoint <= 0x7f) {
      return character
    }

    if (codePoint <= 0xffff) {
      return `\\u${codePoint.toString(16).padStart(4, '0')}`
    }

    const normalized = codePoint - 0x10000
    const high = 0xd800 + (normalized >> 10)
    const low = 0xdc00 + (normalized & 0x3ff)

    return `\\u${high.toString(16).padStart(4, '0')}\\u${low.toString(16).padStart(4, '0')}`
  }).join('')
}

export function mapClaudeStreamEvent(rawEvent, sessionState, options = {}) {
  const events = []
  const sessionId = sessionState.id

  if (rawEvent?.type === 'system' && rawEvent.subtype === 'init') {
    sessionState.rawSessionId = rawEvent.session_id || sessionState.rawSessionId
    const metadata = {
      provider: 'claude-code',
      model: rawEvent.model || '',
      cwd: rawEvent.cwd || '',
      permissionMode: rawEvent.permissionMode || '',
      tools: Array.isArray(rawEvent.tools) ? rawEvent.tools : [],
      agents: Array.isArray(rawEvent.agents) ? rawEvent.agents : [],
      skills: Array.isArray(rawEvent.skills) ? rawEvent.skills : [],
      mcpServers: Array.isArray(rawEvent.mcp_servers) ? rawEvent.mcp_servers : [],
      slashCommands: Array.isArray(rawEvent.slash_commands) ? rawEvent.slash_commands : [],
      rawSessionId: rawEvent.session_id || '',
      apiKeySource: rawEvent.apiKeySource || '',
      version: rawEvent.claude_code_version || ''
    }

    events.push(
      createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.SESSION_STARTED, {
        provider: 'claude-code',
        rawSessionId: metadata.rawSessionId,
        cwd: metadata.cwd
      })
    )
    events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.SESSION_METADATA, metadata))
    return events
  }

  if (rawEvent?.type === 'assistant') {
    for (const content of getMessageContent(rawEvent)) {
      if (content.type === 'text' && content.text) {
        sessionState.assistantMessageId = rawEvent.message?.id || sessionState.assistantMessageId
        events.push(
          createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_DELTA, {
            messageId: sessionState.assistantMessageId,
            text: content.text
          })
        )
      }

      if (content.type === 'thinking' && content.thinking) {
        const thinkingPayload = {
          messageId: rawEvent.message?.id || sessionState.assistantMessageId,
          text: content.thinking,
          hidden: false
        }
        events.push(
          createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_DELTA, {
            messageId: rawEvent.message?.id || sessionState.assistantMessageId,
            text: '',
            thinking: content.thinking,
            hidden: true
          })
        )
        events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.THINKING_DELTA, thinkingPayload))
      }

      if (content.type === 'tool_use') {
        const input = content.input || {}
        const artifact = ARTIFACT_TOOL_NAMES.has(content.name)
          ? buildArtifactPayload(content.id, content.name, input, 'pending')
          : null
        const tool = {
          id: content.id,
          name: content.name || 'Tool',
          input,
          summary: summarizeToolInput(content.name, input),
          inputPreview: summarizeToolInputDetails(content.name, input),
          artifact
        }

        sessionState.pendingTools.set(tool.id, tool)
        events.push(
          createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.TOOL_STARTED, {
            toolUseId: tool.id,
            name: tool.name,
            input: tool.input,
            inputPreview: tool.inputPreview,
            artifact,
            summary: tool.summary,
            status: 'running'
          })
        )

        if (tool.name === 'TodoWrite') {
          events.push(
            createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.TODO_UPDATED, {
              toolUseId: tool.id,
              todos: Array.isArray(tool.input.todos) ? tool.input.todos : []
            })
          )
          events.push(...buildTodoPlanEvents(sessionId, tool))
        }

        if (QUESTION_TOOL_NAMES.has(tool.name)) {
          events.push(
            createXoderEvent(
              sessionId,
              XODER_AGENT_EVENT_TYPES.QUESTION_REQUESTED,
              buildQuestionPayload(tool, {
                status: 'pending',
                source: 'tool_use'
              })
            )
          )
        }

        if (PLAN_TOOL_NAMES.has(tool.name)) {
          events.push(
            createXoderEvent(
              sessionId,
              XODER_AGENT_EVENT_TYPES.PLAN_REQUESTED,
              buildPlanPayload(tool, {
                status: 'pending',
                source: 'tool_use'
              })
            )
          )
        }

        if (TASK_TOOL_NAMES.has(tool.name)) {
          const taskPayload = buildAgentTaskPayload(tool, {
            status: 'running',
            source: 'tool_use'
          })
          events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.TASK_STARTED, taskPayload))
          events.push(
            createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.AGENT_ASSIGNED, {
              ...taskPayload,
              agentType: taskPayload.agentType || 'general-purpose'
            })
          )
        }

        if (TASK_LIST_TOOL_NAMES.has(tool.name)) {
          events.push(
            createXoderEvent(
              sessionId,
              tool.name === 'TaskCreate'
                ? XODER_AGENT_EVENT_TYPES.TASK_CREATED
                : XODER_AGENT_EVENT_TYPES.TASK_UPDATED,
              buildStructuredTaskPayload(tool, {
                status: tool.input.status || 'pending',
                source: 'tool_use'
              })
            )
          )
        }

        if (ARTIFACT_TOOL_NAMES.has(tool.name)) {
          const artifactPayload = buildArtifactPayload(tool.id, tool.name, tool.input, 'pending')
          events.push(
            createXoderEvent(
              sessionId,
              XODER_AGENT_EVENT_TYPES.ARTIFACT_CHANGED,
              artifactPayload
            )
          )
          events.push(...buildArtifactDerivedEvents(sessionId, artifactPayload, tool.input))
        }
      }
    }

    return events
  }

  if (rawEvent?.type === 'user') {
    for (const content of getMessageContent(rawEvent)) {
      if (content.type !== 'tool_result') {
        continue
      }

      const tool = sessionState.pendingTools.get(content.tool_use_id) || {
        id: content.tool_use_id,
        name: 'Tool',
        input: {},
        summary: '',
        inputPreview: '',
        artifact: null
      }
      const failed = Boolean(content.is_error)
      const eventType = failed
        ? XODER_AGENT_EVENT_TYPES.TOOL_FAILED
        : XODER_AGENT_EVENT_TYPES.TOOL_COMPLETED
      const output = normalizeToolResultContent(content.content)

      events.push(
        createXoderEvent(sessionId, eventType, {
          toolUseId: tool.id,
          name: tool.name,
          input: tool.input,
          inputPreview: tool.inputPreview || summarizeToolInputDetails(tool.name, tool.input || {}),
          content: output,
          outputPreview: trimForPreview(output, 1200),
          artifact: tool.artifact,
          summary: tool.summary,
          status: failed ? 'failed' : 'completed'
        })
      )

      if (ARTIFACT_TOOL_NAMES.has(tool.name)) {
        const artifactPayload = buildArtifactPayload(
          tool.id,
          tool.name,
          tool.input,
          failed ? 'failed' : 'completed'
        )
        events.push(
          createXoderEvent(
            sessionId,
            XODER_AGENT_EVENT_TYPES.ARTIFACT_CHANGED,
            artifactPayload
          )
        )
        events.push(...buildArtifactDerivedEvents(sessionId, artifactPayload, tool.input))
      }

      if (QUESTION_TOOL_NAMES.has(tool.name)) {
        const questionPayload = buildQuestionPayload(tool, {
          status: failed ? 'failed' : 'completed',
          answers: extractQuestionAnswers(output, tool.input),
          output,
          source: 'tool_result'
        })

        events.push(
          createXoderEvent(
            sessionId,
            failed ? XODER_AGENT_EVENT_TYPES.QUESTION_DECLINED : XODER_AGENT_EVENT_TYPES.QUESTION_ANSWERED,
            questionPayload
          )
        )
      }

      if (PLAN_TOOL_NAMES.has(tool.name)) {
        events.push(
          createXoderEvent(
            sessionId,
            failed ? XODER_AGENT_EVENT_TYPES.PLAN_REJECTED : XODER_AGENT_EVENT_TYPES.PLAN_APPROVED,
            buildPlanPayload(tool, {
              status: failed ? 'failed' : 'completed',
              output,
              source: 'tool_result'
            })
          )
        )
      }

      if (TASK_TOOL_NAMES.has(tool.name)) {
        const eventType = failed
          ? XODER_AGENT_EVENT_TYPES.TASK_FAILED
          : XODER_AGENT_EVENT_TYPES.TASK_COMPLETED
        events.push(
          createXoderEvent(
            sessionId,
            eventType,
            buildAgentTaskPayload(tool, {
              status: failed ? 'failed' : 'completed',
              output,
              source: 'tool_result'
            })
          )
        )
      }

      if (TASK_LIST_TOOL_NAMES.has(tool.name)) {
        events.push(
          createXoderEvent(
            sessionId,
            failed ? XODER_AGENT_EVENT_TYPES.TASK_FAILED : XODER_AGENT_EVENT_TYPES.TASK_UPDATED,
            buildStructuredTaskPayload(tool, {
              status: failed ? 'failed' : 'completed',
              output,
              source: 'tool_result'
            })
          )
        )
      }
    }

    return events
  }

  if (rawEvent?.type === 'system') {
    if (rawEvent.subtype === 'task_started') {
      const payload = buildSystemTaskPayload(rawEvent, {
        status: 'running'
      })
      events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.TASK_STARTED, payload))
      events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.AGENT_ASSIGNED, payload))
      return events
    }

    if (rawEvent.subtype === 'task_progress') {
      const payload = buildSystemTaskPayload(rawEvent, {
        status: 'running'
      })
      events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.TASK_PROGRESS, payload))
      events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.AGENT_PROGRESS, payload))
      return events
    }

    if (rawEvent.subtype === 'task_notification') {
      const payload = buildSystemTaskPayload(rawEvent, {
        status: normalizeTaskStatus(rawEvent.status)
      })
      const eventType =
        payload.status === 'failed'
          ? XODER_AGENT_EVENT_TYPES.TASK_FAILED
          : XODER_AGENT_EVENT_TYPES.TASK_COMPLETED
      events.push(createXoderEvent(sessionId, eventType, payload))
      return events
    }
  }

  if (rawEvent?.type === 'result') {
    const runtimeFailure = getRuntimeResultFailure(rawEvent)
    const failed = Boolean(rawEvent.is_error) || rawEvent.subtype === 'error' || Boolean(runtimeFailure)
    const teamResult = options.holdTeamWaitingResult ? parseTeamCliResult(rawEvent.result) : null

    if (failed) {
      sessionState.finalResultSeen = true
      events.push(
        createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.SESSION_FAILED, {
          code: runtimeFailure?.code || '',
          message: runtimeFailure?.message || rawEvent.result || rawEvent.error || 'Agent run failed.',
          raw: rawEvent
        })
      )
      return events
    }

    events.push(
      createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.MESSAGE_ASSISTANT_COMPLETED, {
        text: rawEvent.result || '',
        stopReason: rawEvent.stop_reason || ''
      })
    )

    if (teamResult?.status === 'waiting_for_user') {
      sessionState.teamRunId = teamResult.runId || sessionState.teamRunId || ''
      sessionState.finalResultSeen = false
      return events
    }

    if (teamResult?.status === 'blocked') {
      sessionState.finalResultSeen = true
      events.push(
        createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.SESSION_FAILED, {
          message: rawEvent.result || 'Team run was blocked.',
          raw: rawEvent
        })
      )
      return events
    }

    if (teamResult?.status === 'stopped') {
      sessionState.finalResultSeen = true
      events.push(
        createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.SESSION_CANCELLED, {
          message: rawEvent.result || 'Team run was stopped.',
          raw: rawEvent
        })
      )
      return events
    }

    sessionState.finalResultSeen = true
    events.push(
      createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.SESSION_COMPLETED, {
        result: rawEvent.result || '',
        durationMs: rawEvent.duration_ms || 0,
        durationApiMs: rawEvent.duration_api_ms || 0,
        totalCostUsd: rawEvent.total_cost_usd || 0,
        usage: rawEvent.usage || null,
        modelUsage: rawEvent.modelUsage || null,
        stopReason: rawEvent.stop_reason || '',
        rawSessionId: rawEvent.session_id || sessionState.rawSessionId || ''
      })
    )
  }

  return events
}

export function parseTeamCliResult(value = '') {
  const text = String(value || '').trim()
  const match = text.match(/^Team\s+([^:\s]+):\s*([^\n\r]+)/i)

  if (!match) {
    return null
  }

  return {
    runId: match[1] === '(none)' ? '' : match[1],
    status: String(match[2] || '').trim()
  }
}

export function summarizeToolInput(name, input = {}) {
  if (name === 'Bash') {
    return String(input.command || input.cmd || '').trim() || 'Run shell command'
  }

  if (name === 'Read') {
    return String(input.file_path || input.path || '').trim() || 'Read file'
  }

  if (name === 'Grep') {
    return String(input.pattern || input.query || '').trim() || 'Search text'
  }

  if (name === 'Glob') {
    return String(input.pattern || '').trim() || 'Find files'
  }

  if (name === 'Edit' || name === 'Write' || name === 'NotebookEdit') {
    return getArtifactPath(input) || `${name} artifact`
  }

  if (name === 'Task') {
    return String(input.description || input.prompt || '').trim() || 'Run sub-agent task'
  }

  if (name === 'TodoWrite') {
    const todos = Array.isArray(input.todos) ? input.todos.length : 0
    return `${todos} todo${todos === 1 ? '' : 's'}`
  }

  const json = JSON.stringify(input)
  return json && json.length > 160 ? `${json.slice(0, 157)}...` : json || name || 'Tool'
}

export function summarizeToolInputDetails(name, input = {}) {
  if (name === 'Edit') {
    return formatEditPreview(input)
  }

  if (name === 'Write') {
    return formatWritePreview(input)
  }

  if (name === 'NotebookEdit') {
    return formatNotebookEditPreview(input)
  }

  if (name === 'Bash') {
    return trimForPreview(String(input.command || input.cmd || ''), 1200)
  }

  if (name === 'Read') {
    return String(input.file_path || input.path || '').trim()
  }

  return trimForPreview(safeJsonStringify(input), 1200)
}

function buildArtifactPayload(toolUseId, toolName, input = {}, status = 'pending') {
  const artifactPath = getArtifactPath(input)
  const reviewStats = estimateReviewStats(toolName, input)

  return {
    toolUseId,
    name: getArtifactName(input),
    path: artifactPath,
    toolName,
    operation: getArtifactOperation(toolName, input),
    preview: summarizeToolInputDetails(toolName, input),
    kind: getArtifactKind(artifactPath, input),
    reviewStats,
    status
  }
}

function buildQuestionPayload(tool = {}, extra = {}) {
  const input = isPlainRecord(tool.input) ? tool.input : {}
  const questions = normalizeQuestions(input.questions)
  const answers = isPlainRecord(extra.answers)
    ? extra.answers
    : isPlainRecord(input.answers)
      ? input.answers
      : {}

  return {
    toolUseId: tool.id || tool.toolUseId || '',
    requestId: extra.requestId || tool.requestId || '',
    name: 'Question',
    toolName: tool.name || tool.toolName || 'AskUserQuestion',
    title: questions[0]?.header || 'Question',
    summary: questions[0]?.question || summarizeToolInput(tool.name, input),
    questions,
    answers,
    annotations: isPlainRecord(input.annotations) ? input.annotations : {},
    input,
    inputPreview: summarizeToolInputDetails(tool.name, input),
    status: extra.status || 'pending',
    source: extra.source || 'tool',
    output: extra.output || ''
  }
}

function buildPlanPayload(tool = {}, extra = {}) {
  const input = isPlainRecord(tool.input) ? tool.input : {}
  const plan = String(input.plan || input.content || input.markdown || '').trim()
  const planFilePath = String(input.planFilePath || input.file_path || input.path || '').trim()

  return {
    toolUseId: tool.id || tool.toolUseId || '',
    requestId: extra.requestId || tool.requestId || '',
    name: 'Plan',
    toolName: tool.name || tool.toolName || 'ExitPlanMode',
    title: planFilePath ? getArtifactName({ file_path: planFilePath }) : 'Plan approval',
    summary: plan ? trimForPreview(plan.replace(/\s+/g, ' '), 220) : summarizeToolInput(tool.name, input),
    plan,
    planFilePath,
    allowedPrompts: Array.isArray(input.allowedPrompts) ? input.allowedPrompts : [],
    input,
    inputPreview: summarizeToolInputDetails(tool.name, input),
    status: extra.status || 'pending',
    source: extra.source || 'tool',
    output: extra.output || ''
  }
}

function buildTodoPlanEvents(sessionId, tool) {
  const todos = Array.isArray(tool.input?.todos) ? tool.input.todos : []
  const tasks = todos.map((todo, index) => normalizeTodoTask(todo, index, tool.id))
  const events = [
    createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.PLAN_UPDATED, {
      toolUseId: tool.id,
      source: 'TodoWrite',
      status: 'updated',
      summary: `${tasks.length} task${tasks.length === 1 ? '' : 's'}`,
      todos,
      tasks
    })
  ]

  for (const task of tasks) {
    events.push(createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.TASK_UPDATED, task))
  }

  return events
}

function normalizeTodoTask(todo = {}, index = 0, toolUseId = '') {
  const content = String(todo.content || todo.text || todo.title || `Task ${index + 1}`).trim()
  const status = normalizeTaskStatus(todo.status || 'pending')

  return {
    taskId: String(todo.id || todo.taskId || `${toolUseId || 'todo'}-${index + 1}`),
    toolUseId,
    title: content,
    description: content,
    status,
    priority: String(todo.priority || '').trim(),
    source: 'TodoWrite',
    raw: todo
  }
}

function buildAgentTaskPayload(tool = {}, extra = {}) {
  const input = isPlainRecord(tool.input) ? tool.input : {}
  const description = String(input.description || input.prompt || input.task || tool.summary || '').trim()
  const agentType = String(
    input.subagent_type || input.subagentType || input.agent_type || input.agentType || input.agent || ''
  ).trim()

  return {
    taskId: String(extra.taskId || input.task_id || input.taskId || tool.id || tool.toolUseId || ''),
    toolUseId: tool.id || tool.toolUseId || '',
    title: String(input.description || input.subject || description || 'Sub-agent task').trim(),
    description,
    prompt: String(input.prompt || '').trim(),
    agentType,
    status: extra.status || 'running',
    summary: extra.summary || description || summarizeToolInput(tool.name, input),
    usage: extra.usage || null,
    output: extra.output || '',
    source: extra.source || 'Task',
    lastToolName: extra.lastToolName || '',
    outputFile: extra.outputFile || '',
    raw: extra.raw || null
  }
}

function buildStructuredTaskPayload(tool = {}, extra = {}) {
  const input = isPlainRecord(tool.input) ? tool.input : {}
  const title = String(input.subject || input.description || input.taskId || tool.summary || '').trim()

  return {
    taskId: String(input.taskId || input.id || tool.id || tool.toolUseId || ''),
    toolUseId: tool.id || tool.toolUseId || '',
    title,
    description: String(input.description || '').trim(),
    status: normalizeTaskStatus(extra.status || input.status || 'pending'),
    owner: String(input.owner || '').trim(),
    metadata: isPlainRecord(input.metadata) ? input.metadata : {},
    output: extra.output || '',
    source: extra.source || tool.name || 'TaskTool'
  }
}

function buildSystemTaskPayload(rawEvent = {}, extra = {}) {
  const status = normalizeTaskStatus(extra.status || rawEvent.status || 'running')

  return {
    taskId: String(rawEvent.task_id || rawEvent.taskId || rawEvent.id || ''),
    toolUseId: String(rawEvent.tool_use_id || rawEvent.toolUseId || ''),
    title: String(rawEvent.summary || rawEvent.description || rawEvent.task_id || 'Agent task').trim(),
    description: String(rawEvent.description || rawEvent.summary || '').trim(),
    status,
    summary: String(rawEvent.summary || rawEvent.description || status).trim(),
    usage: rawEvent.usage || null,
    lastToolName: String(rawEvent.last_tool_name || rawEvent.lastToolName || '').trim(),
    outputFile: String(rawEvent.output_file || rawEvent.outputFile || '').trim(),
    workflowProgress: Array.isArray(rawEvent.workflow_progress) ? rawEvent.workflow_progress : [],
    source: rawEvent.subtype || 'system',
    raw: rawEvent
  }
}

function buildArtifactDerivedEvents(sessionId, artifactPayload, input = {}) {
  const events = []

  if (isSpecArtifact(artifactPayload)) {
    const eventType =
      artifactPayload.operation === 'write' && artifactPayload.status === 'pending'
        ? XODER_AGENT_EVENT_TYPES.SPEC_CREATED
        : XODER_AGENT_EVENT_TYPES.SPEC_UPDATED

    events.push(
      createXoderEvent(sessionId, eventType, {
        ...artifactPayload,
        title: artifactPayload.name || 'Spec',
        contentPreview: getArtifactContentPreview(input),
        status: artifactPayload.status
      })
    )
  }

  if (artifactPayload.reviewStats.additions || artifactPayload.reviewStats.deletions) {
    events.push(
      createXoderEvent(sessionId, XODER_AGENT_EVENT_TYPES.REVIEW_UPDATED, {
        files: [
          {
            toolUseId: artifactPayload.toolUseId,
            path: artifactPayload.path,
            name: artifactPayload.name,
            toolName: artifactPayload.toolName,
            operation: artifactPayload.operation,
            additions: artifactPayload.reviewStats.additions,
            deletions: artifactPayload.reviewStats.deletions,
            status: artifactPayload.status
          }
        ],
        additions: artifactPayload.reviewStats.additions,
        deletions: artifactPayload.reviewStats.deletions,
        summary: `+${artifactPayload.reviewStats.additions} -${artifactPayload.reviewStats.deletions}`,
        status: artifactPayload.status
      })
    )
  }

  return events
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return []
  }

  return questions.map((question, index) => ({
    id: String(question.id || question.question || `question-${index + 1}`),
    header: String(question.header || `Question ${index + 1}`).slice(0, 32),
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

function extractQuestionAnswers(output, input = {}) {
  if (isPlainRecord(input.answers)) {
    return input.answers
  }

  const parsed = parseMaybeJson(output)

  if (isPlainRecord(parsed?.answers)) {
    return parsed.answers
  }

  if (isPlainRecord(parsed?.data?.answers)) {
    return parsed.data.answers
  }

  return {}
}

function parseMaybeJson(value) {
  const text = String(value || '').trim()

  if (!text || (!text.startsWith('{') && !text.startsWith('['))) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function getArtifactKind(artifactPath, input = {}) {
  const path = String(artifactPath || '').toLowerCase()

  if (isMarkdownPath(path)) {
    return 'markdown'
  }

  if (String(input.content || input.new_string || input.new_source || '').trim().startsWith('#')) {
    return 'markdown'
  }

  return 'file'
}

function isSpecArtifact(artifactPayload = {}) {
  const path = String(artifactPayload.path || artifactPayload.name || '').toLowerCase()

  return (
    artifactPayload.kind === 'markdown' &&
    (path.endsWith('.md') ||
      path.endsWith('.markdown') ||
      path.includes('spec') ||
      path.includes('plan') ||
      path.includes('requirements'))
  )
}

function isMarkdownPath(path) {
  return /\.m(?:d|arkdown)$/i.test(String(path || ''))
}

function getArtifactContentPreview(input = {}) {
  return trimForPreview(
    String(input.content || input.new_string || input.new_source || input.replacement || ''),
    2000
  )
}

function estimateReviewStats(toolName, input = {}) {
  if (toolName === 'Write') {
    return {
      additions: countMeaningfulLines(input.content),
      deletions: 0
    }
  }

  if (toolName === 'Edit') {
    return {
      additions: countMeaningfulLines(input.new_string),
      deletions: countMeaningfulLines(input.old_string)
    }
  }

  if (toolName === 'NotebookEdit') {
    return {
      additions: countMeaningfulLines(input.new_source),
      deletions: 0
    }
  }

  return {
    additions: 0,
    deletions: 0
  }
}

function countMeaningfulLines(value) {
  const text = String(value || '')

  if (!text) {
    return 0
  }

  return text.split(/\r?\n/).filter((line) => line.length > 0).length
}

function normalizeTaskStatus(status) {
  const normalized = String(status || '').trim().toLowerCase()

  if (['completed', 'complete', 'done', 'success', 'succeeded'].includes(normalized)) {
    return 'completed'
  }

  if (['failed', 'error', 'errored'].includes(normalized)) {
    return 'failed'
  }

  if (['stopped', 'cancelled', 'canceled'].includes(normalized)) {
    return 'cancelled'
  }

  if (['in_progress', 'running', 'active', 'started'].includes(normalized)) {
    return 'running'
  }

  return normalized || 'pending'
}

function getArtifactOperation(toolName, input = {}) {
  if (toolName === 'Edit') {
    return input.replace_all ? 'replace_all' : 'edit'
  }

  if (toolName === 'Write') {
    return 'write'
  }

  if (toolName === 'NotebookEdit') {
    return input.edit_mode || 'notebook_edit'
  }

  return toolName || 'change'
}

function formatEditPreview(input = {}) {
  return [
    `file: ${getArtifactPath(input) || '(unknown)'}`,
    input.replace_all ? 'mode: replace_all' : '',
    input.old_string ? `old:\n${trimForPreview(input.old_string, 800)}` : '',
    input.new_string ? `new:\n${trimForPreview(input.new_string, 800)}` : ''
  ]
    .filter(Boolean)
    .join('\n')
}

function formatWritePreview(input = {}) {
  return [
    `file: ${getArtifactPath(input) || '(unknown)'}`,
    input.content ? `content:\n${trimForPreview(input.content, 1200)}` : ''
  ]
    .filter(Boolean)
    .join('\n')
}

function formatNotebookEditPreview(input = {}) {
  return [
    `notebook: ${getArtifactPath(input) || '(unknown)'}`,
    input.cell_id ? `cell: ${input.cell_id}` : '',
    input.edit_mode ? `mode: ${input.edit_mode}` : '',
    input.new_source ? `source:\n${trimForPreview(input.new_source, 1000)}` : ''
  ]
    .filter(Boolean)
    .join('\n')
}

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value || '')
  }
}

function trimForPreview(value, limit = 1200) {
  const text = String(value ?? '')

  if (text.length <= limit) {
    return text
  }

  return `${text.slice(0, limit)}\n... truncated ${text.length - limit} chars`
}

function normalizeRunMode(mode) {
  const normalized = String(mode || 'auto').trim().toLowerCase()

  if (normalized === 'plan') {
    return 'plan'
  }

  if (normalized === 'fast') {
    return 'fast'
  }

  return 'auto'
}

function normalizeApprovalMode(mode) {
  const normalized = String(mode || 'auto').trim().toLowerCase()

  if (normalized === 'fullaccess') {
    return 'fullAccess'
  }

  if (['manual', 'auto', 'custom', 'semi_auto', 'workspace_auto', 'overnight'].includes(normalized)) {
    return normalized
  }

  return 'auto'
}

function normalizePermissions(request = {}) {
  const permissions = request.permissions || {}
  const options = request.options || {}
  const approvalMode = normalizeApprovalMode(permissions.approvalMode ?? options.approvalMode)
  const fullAccess = approvalMode === 'fullAccess'
  const defaultPolicy = ['manual', 'semi_auto', 'workspace_auto', 'overnight'].includes(approvalMode)
    ? approvalMode
    : 'auto'
  const policy = normalizePermissionPolicy(
    permissions.policy ?? options.permissionPolicy ?? defaultPolicy
  )
  const workspaceAuto = policy === 'workspace_auto'
  const overnight = policy === 'overnight'
  const allowNetwork = fullAccess || Boolean(permissions.allowNetwork ?? options.allowNetwork ?? true)

  return {
    approvalMode,
    policy,
    workspaceAuto,
    overnight,
    allowRead: Boolean(permissions.allowRead ?? options.allowRead ?? true),
    allowShell: fullAccess || Boolean(permissions.allowShell ?? options.allowShell),
    allowWrite: fullAccess || Boolean(permissions.allowWrite ?? options.allowApplyPatch ?? true),
    allowNetwork,
    allowWebSearch: Boolean(
      permissions.allowWebSearch ?? options.allowWebSearch ?? allowNetwork ?? true
    ),
    allowWebFetch: Boolean(permissions.allowWebFetch ?? options.allowWebFetch ?? allowNetwork ?? true),
    autoApproveAll:
      approvalMode === 'manual' || policy === 'semi_auto'
        ? false
        : Boolean(permissions.autoApproveAll ?? options.autoApproveAll ?? options.autoApprove ?? true),
    allowTask: Boolean(permissions.allowTask ?? options.allowTask ?? true),
    allowSkill: Boolean(permissions.allowSkill ?? options.allowSkill ?? true),
    allowDangerouslyApproveAll: fullAccess || Boolean(
      permissions.allowDangerouslyApproveAll ?? options.allowDangerouslyApproveAll
    ),
    allowTools: Array.isArray(permissions.allowTools) ? permissions.allowTools.map(String) : [],
    denyTools: Array.isArray(permissions.denyTools) ? permissions.denyTools.map(String) : [],
    denyAll: Boolean(permissions.denyAll ?? options.denyAll)
  }
}

function normalizePermissionPolicy(value) {
  const normalized = String(value || '').trim().toLowerCase()

  if (['auto', 'manual', 'semi_auto', 'workspace_auto', 'overnight'].includes(normalized)) {
    return normalized
  }

  return 'manual'
}

function getMessageContent(rawEvent) {
  const content = rawEvent?.message?.content
  return Array.isArray(content) ? content : []
}

function normalizeToolResultContent(content) {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item?.text) {
          return item.text
        }

        return JSON.stringify(item)
      })
      .join('\n')
  }

  return content ? JSON.stringify(content) : ''
}

function getArtifactPath(input = {}) {
  return String(input.file_path || input.path || input.notebook_path || '').trim()
}

function getArtifactName(input = {}) {
  const artifactPath = getArtifactPath(input)
  return artifactPath.split(/[\\/]/).filter(Boolean).pop() || artifactPath || 'artifact'
}

function isPlainRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
