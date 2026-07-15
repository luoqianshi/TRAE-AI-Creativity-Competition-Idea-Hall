import { EventEmitter } from 'node:events'
import { randomUUID } from 'node:crypto'

import { ClaudeCodeAdapter } from './adapters/claude-code-adapter.js'
import {
  createXoderEvent,
  normalizeRuntimeRequest,
  XODER_AGENT_EVENT_TYPES
} from './protocols/xoder-events.js'

export class AgentRuntimeManager extends EventEmitter {
  constructor(options = {}) {
    super()
    this.adapter = options.adapter || new ClaudeCodeAdapter(options.claudeCode || {})
    this.eventHistoryLimit = normalizeEventHistoryLimit(
      options.eventHistoryLimit ?? process.env.XODER_AGENT_EVENT_HISTORY_LIMIT,
      5000
    )
    this.sessions = new Map()
  }

  startSession(inputRequest = {}, context = {}) {
    const request = normalizeRuntimeRequest(inputRequest)

    if (!request.prompt) {
      const error = new Error('Prompt is required.')
      error.code = 'PROMPT_REQUIRED'
      throw error
    }

    if (!request.workspace.path) {
      const error = new Error('Workspace path is required.')
      error.code = 'NO_WORKSPACE'
      throw error
    }

    const session = {
      id: randomUUID(),
      rawSessionId: '',
      status: 'starting',
      request,
      webContentsId: context.webContentsId || 0,
      events: [],
      eventCount: 0,
      metadata: null,
      pendingTools: new Map(),
      finalResultSeen: false,
      cancelRequested: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      adapterHandle: null,
      process: null
    }

    this.sessions.set(session.id, session)
    this.recordEvent(
      session,
      createXoderEvent(session.id, XODER_AGENT_EVENT_TYPES.MESSAGE_USER, {
        text: request.prompt,
        questId: request.questId,
        workspace: request.workspace
      })
    )
    session.adapterHandle = this.adapter.start(session, (event) => {
      this.recordEvent(session, event)
    })

    return this.serializeSession(session)
  }

  stopSession(sessionId) {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return false
    }

    if (session.status === 'completed' || session.status === 'failed' || session.status === 'cancelled') {
      return true
    }

    session.cancelRequested = true
    session.adapterHandle?.stop?.()
    this.recordEvent(
      session,
      createXoderEvent(session.id, XODER_AGENT_EVENT_TYPES.SESSION_CANCELLED, {
        message: 'Agent run was cancelled by the user.'
      })
    )
    return true
  }

  respondToPermission(sessionId, requestId, response = {}) {
    const session = this.sessions.get(sessionId)

    if (!session || session.status !== 'running') {
      return false
    }

    return Boolean(session.adapterHandle?.respondToPermission?.(requestId, response))
  }

  runSlashCommand(sessionId, command, args = '') {
    const session = this.sessions.get(sessionId)

    if (!session || session.status !== 'running') {
      return false
    }

    return Boolean(session.adapterHandle?.runSlashCommand?.(command, args))
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId)
    return session ? this.serializeSession(session) : null
  }

  stopSessionsForWebContents(webContentsId) {
    for (const session of this.sessions.values()) {
      if (session.webContentsId === webContentsId) {
        this.stopSession(session.id)
      }
    }
  }

  stopAll() {
    for (const session of this.sessions.values()) {
      this.stopSession(session.id)
    }

    this.adapter.stopAll?.()
  }

  listCapabilities() {
    return this.adapter.listCapabilities()
  }

  recordEvent(session, event) {
    session.updatedAt = Date.now()
    session.eventCount += 1
    session.events.push(event)

    if (session.events.length > this.eventHistoryLimit) {
      session.events.splice(0, session.events.length - this.eventHistoryLimit)
    }

    if (event.type === XODER_AGENT_EVENT_TYPES.SESSION_STARTED) {
      session.status = 'running'
    }

    if (event.type === XODER_AGENT_EVENT_TYPES.SESSION_METADATA) {
      session.metadata = event.payload
    }

    if (event.type === XODER_AGENT_EVENT_TYPES.SESSION_COMPLETED) {
      session.status = 'completed'
    }

    if (event.type === XODER_AGENT_EVENT_TYPES.SESSION_FAILED) {
      session.status = 'failed'
    }

    if (event.type === XODER_AGENT_EVENT_TYPES.SESSION_CANCELLED) {
      session.status = 'cancelled'
    }

    this.emit('event', event)
  }

  serializeSession(session) {
    return {
      id: session.id,
      status: session.status,
      questId: session.request.questId,
      workspace: session.request.workspace,
      webContentsId: session.webContentsId,
      metadata: session.metadata,
      eventCount: session.eventCount,
      retainedEventCount: session.events.length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }
  }
}

function normalizeEventHistoryLimit(value, fallback) {
  const limit = Number(value)
  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : fallback
}
