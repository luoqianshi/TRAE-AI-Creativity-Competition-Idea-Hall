// manager.js — control layer. Spawns and reuses `claude` stream-json child
// processes to send messages, create sessions and continue existing ones.
// Message *content* is surfaced by tailing transcripts (see store.js); the
// process stdout here is used only to track run status and capture the
// session id assigned to a freshly created session.

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import crypto from 'crypto';
import os from 'os';
import { findSessionFile } from './store.js';

export class Manager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.procs = new Map(); // sessionId -> { proc, status, cwd, model, stdoutBuf }
  }

  childEnv() {
    return { ...process.env, ...(this.config.env || {}) };
  }

  status(sessionId) {
    const p = this.procs.get(sessionId);
    if (!p) return 'idle';
    return p.status;
  }

  liveStatuses() {
    const out = {};
    for (const [id, p] of this.procs) out[id] = p.status;
    return out;
  }

  buildArgs({ sessionId, isNew, model }) {
    const args = [
      '-p',
      '--input-format', 'stream-json',
      '--output-format', 'stream-json',
      '--verbose',
      '--dangerously-skip-permissions',
      '--model', model || this.config.defaultModel || 'opus',
    ];
    if (isNew) {
      args.push('--session-id', sessionId);
    } else {
      args.push('--resume', sessionId);
    }
    return args;
  }

  spawnProcess({ sessionId, cwd, model, isNew }) {
    const args = this.buildArgs({ sessionId, isNew, model });
    const proc = spawn(this.config.claudeBin || 'claude', args, {
      cwd: cwd || os.homedir(),
      env: this.childEnv(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const rec = { proc, status: 'starting', cwd, model, stdoutBuf: '' };
    this.procs.set(sessionId, rec);

    proc.stdout.on('data', (chunk) => {
      rec.stdoutBuf += chunk.toString('utf8');
      const lines = rec.stdoutBuf.split('\n');
      rec.stdoutBuf = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        let evt;
        try {
          evt = JSON.parse(t);
        } catch {
          continue;
        }
        this.handleStdout(sessionId, rec, evt);
      }
    });

    proc.stderr.on('data', (chunk) => {
      const s = chunk.toString('utf8');
      // Surface real errors but ignore routine noise.
      if (/error|fatal|denied|invalid/i.test(s)) {
        this.emit('log', { sessionId, level: 'error', text: s.trim().slice(0, 500) });
      }
    });

    proc.on('exit', (code) => {
      rec.status = 'idle';
      this.procs.delete(sessionId);
      this.emit('status', { sessionId, status: 'idle' });
      if (code && code !== 0) {
        this.emit('log', { sessionId, level: 'error', text: `claude exited with code ${code}` });
      }
    });

    proc.on('error', (err) => {
      this.emit('log', { sessionId, level: 'error', text: `spawn error: ${err.message}` });
      this.procs.delete(sessionId);
      this.emit('status', { sessionId, status: 'idle' });
    });

    return rec;
  }

  handleStdout(sessionId, rec, evt) {
    if (evt.type === 'system' && evt.subtype === 'init') {
      rec.status = 'running';
      if (evt.cwd) rec.cwd = evt.cwd;
      if (evt.session_id && evt.session_id !== sessionId) {
        // A forked/renamed id — remap.
        this.procs.delete(sessionId);
        this.procs.set(evt.session_id, rec);
        this.emit('remap', { from: sessionId, to: evt.session_id });
        sessionId = evt.session_id;
      }
      this.emit('status', { sessionId, status: 'running', cwd: rec.cwd, model: rec.model });
    } else if (evt.type === 'assistant' || (evt.type === 'system' && evt.subtype === 'thinking_tokens')) {
      if (rec.status !== 'running') {
        rec.status = 'running';
        this.emit('status', { sessionId, status: 'running' });
      }
    } else if (evt.type === 'result') {
      rec.status = 'idle';
      this.emit('status', { sessionId, status: 'idle' });
      this.emit('turn_complete', {
        sessionId,
        isError: !!evt.is_error,
        cost: evt.total_cost_usd,
        duration_ms: evt.duration_ms,
      });
    }
  }

  // Ensure a live process exists for the session, then write a user message.
  send(sessionId, text, { model } = {}) {
    let rec = this.procs.get(sessionId);
    if (!rec || !rec.proc || rec.proc.exitCode !== null || rec.proc.killed) {
      const exists = !!findSessionFile(sessionId);
      const cwd = rec?.cwd;
      rec = this.spawnProcess({ sessionId, cwd, model, isNew: !exists });
    }
    rec.status = 'running';
    this.emit('status', { sessionId, status: 'running' });
    const payload = {
      type: 'user',
      message: { role: 'user', content: [{ type: 'text', text }] },
    };
    try {
      rec.proc.stdin.write(JSON.stringify(payload) + '\n');
    } catch (e) {
      this.emit('log', { sessionId, level: 'error', text: `write failed: ${e.message}` });
      return false;
    }
    return true;
  }

  // Create a brand-new session in a given cwd with an initial message.
  create({ cwd, text, model }) {
    const sessionId = crypto.randomUUID();
    const rec = this.spawnProcess({ sessionId, cwd, model, isNew: true });
    rec.status = 'running';
    const payload = {
      type: 'user',
      message: { role: 'user', content: [{ type: 'text', text }] },
    };
    try {
      rec.proc.stdin.write(JSON.stringify(payload) + '\n');
    } catch (e) {
      this.emit('log', { sessionId, level: 'error', text: `write failed: ${e.message}` });
    }
    this.emit('status', { sessionId, status: 'running', cwd, model });
    return sessionId;
  }

  stop(sessionId) {
    const rec = this.procs.get(sessionId);
    if (rec && rec.proc) {
      try {
        rec.proc.kill('SIGTERM');
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  }

  shutdown() {
    for (const [, rec] of this.procs) {
      try {
        rec.proc.kill('SIGTERM');
      } catch {
        /* ignore */
      }
    }
  }
}
