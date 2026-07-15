// store.js — reads, parses and tails Claude Code session transcripts.
// The on-disk transcripts under ~/.claude/projects are the single source of
// truth for message *content*, so both sessions launched by this tool and
// sessions launched from a real terminal are monitored uniformly.

import fs from 'fs';
import path from 'path';
import os from 'os';

export function projectsDir() {
  return path.join(os.homedir(), '.claude', 'projects');
}

// Claude encodes a cwd into a project folder name by replacing "/" and "." etc.
// with "-". That is lossy, so we prefer reading the real cwd from inside the
// transcript and only fall back to a best-effort decode of the folder name.
function decodeProjectDir(name) {
  // Leading dash represents the leading "/". Remaining dashes -> "/".
  let p = name.replace(/^-/, '/').replace(/-/g, '/');
  return p;
}

function textFromContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((b) => b && b.type === 'text')
    .map((b) => b.text || '')
    .join('\n');
}

// Convert one transcript line object into zero or more normalized UI messages.
export function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return [];
  if (entry.isMeta) return [];
  const ts = entry.timestamp || null;
  const baseId = entry.uuid || `${entry.type}-${ts || ''}`;
  const out = [];

  if (entry.type === 'user' && entry.message) {
    const content = entry.message.content;
    if (Array.isArray(content)) {
      content.forEach((block, i) => {
        if (block.type === 'tool_result') {
          out.push({
            id: `${baseId}:tr:${i}`,
            role: 'tool',
            kind: 'tool_result',
            text: extractToolResultText(block.content),
            isError: !!block.is_error,
            toolUseId: block.tool_use_id,
            ts,
          });
        } else if (block.type === 'text' && block.text && block.text.trim()) {
          out.push({ id: `${baseId}:u:${i}`, role: 'user', kind: 'text', text: block.text, ts });
        }
      });
    } else if (typeof content === 'string' && content.trim()) {
      out.push({ id: `${baseId}:u`, role: 'user', kind: 'text', text: content, ts });
    }
  } else if (entry.type === 'assistant' && entry.message) {
    const content = entry.message.content || [];
    const model = entry.message.model;
    (Array.isArray(content) ? content : []).forEach((block, i) => {
      if (block.type === 'text' && block.text) {
        out.push({ id: `${baseId}:a:${i}`, role: 'assistant', kind: 'text', text: block.text, model, ts });
      } else if (block.type === 'thinking' && block.thinking) {
        out.push({ id: `${baseId}:t:${i}`, role: 'assistant', kind: 'thinking', text: block.thinking, model, ts });
      } else if (block.type === 'tool_use') {
        out.push({
          id: `${baseId}:tu:${i}`,
          role: 'assistant',
          kind: 'tool_use',
          tool: { id: block.id, name: block.name, input: block.input },
          model,
          ts,
        });
      }
    });
  } else if (entry.type === 'result') {
    out.push({
      id: `${baseId}:r`,
      role: 'system',
      kind: 'result',
      text: entry.result || (entry.is_error ? 'Error' : 'Done'),
      isError: !!entry.is_error,
      result: { duration_ms: entry.duration_ms, cost: entry.total_cost_usd, num_turns: entry.num_turns },
      ts,
    });
  }
  return out;
}

function extractToolResultText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((b) => (typeof b === 'string' ? b : b.type === 'text' ? b.text : ''))
      .join('\n');
  }
  return '';
}

function readHead(file, bytes = 65536) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const len = Math.min(bytes, size);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, 0);
    return { text: buf.toString('utf8'), truncated: size > len };
  } finally {
    fs.closeSync(fd);
  }
}

function parseLines(text, dropLast) {
  const lines = text.split('\n');
  if (dropLast) lines.pop(); // drop possibly-partial final line
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    try {
      out.push(JSON.parse(t));
    } catch {
      /* ignore malformed / partial */
    }
  }
  return out;
}

// Build a lightweight metadata record for a single transcript file.
function sessionMeta(dir, fileName) {
  const file = path.join(dir, fileName);
  const sessionId = fileName.replace(/\.jsonl$/, '');
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return null;
  }
  let cwd = decodeProjectDir(path.basename(dir));
  let title = '';
  try {
    const { text, truncated } = readHead(file);
    const entries = parseLines(text, truncated);
    for (const e of entries) {
      if (e.cwd && typeof e.cwd === 'string') cwd = e.cwd;
      if (!title && e.type === 'summary' && e.summary) title = e.summary;
    }
    if (!title) {
      for (const e of entries) {
        if (e.type === 'user' && e.message) {
          const txt = textFromContent(e.message.content).trim();
          if (txt && !txt.startsWith('<')) {
            title = txt.replace(/\s+/g, ' ').slice(0, 80);
            break;
          }
        }
      }
    }
  } catch {
    /* ignore */
  }
  if (!title) title = path.basename(cwd) || sessionId.slice(0, 8);
  return {
    sessionId,
    cwd,
    project: path.basename(cwd) || cwd,
    title,
    mtime: stat.mtimeMs,
    size: stat.size,
    file,
  };
}

export function listSessions() {
  const root = projectsDir();
  let dirs = [];
  try {
    dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch {
    return [];
  }
  const sessions = [];
  for (const d of dirs) {
    const dir = path.join(root, d.name);
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl'));
    } catch {
      continue;
    }
    for (const f of files) {
      const m = sessionMeta(dir, f);
      if (m) sessions.push(m);
    }
  }
  sessions.sort((a, b) => b.mtime - a.mtime);
  return sessions;
}

export function findSessionFile(sessionId) {
  const root = projectsDir();
  let dirs = [];
  try {
    dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch {
    return null;
  }
  for (const d of dirs) {
    const file = path.join(root, d.name, `${sessionId}.jsonl`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

export function readHistory(sessionId) {
  const file = findSessionFile(sessionId);
  if (!file) return { messages: [], cwd: null, file: null };
  let raw = '';
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return { messages: [], cwd: null, file };
  }
  const entries = parseLines(raw, false);
  let cwd = null;
  const messages = [];
  for (const e of entries) {
    if (e.cwd) cwd = e.cwd;
    for (const m of normalizeEntry(e)) messages.push(m);
  }
  return { messages, cwd, file };
}

// Tailer: watches a single transcript file and emits normalized messages for
// every newly appended line. One tailer per session, ref-counted by callers.
export class Tailer {
  constructor(sessionId, onMessages) {
    this.sessionId = sessionId;
    this.onMessages = onMessages;
    this.offset = 0;
    this.buffer = '';
    this.file = findSessionFile(sessionId);
    this.timer = null;
    this.refs = 0;
  }

  start() {
    if (this.file) {
      try {
        this.offset = fs.statSync(this.file).size;
      } catch {
        this.offset = 0;
      }
    }
    this.timer = setInterval(() => this.poll(), 500);
  }

  poll() {
    // Locate the file lazily — a freshly created session's file may not exist
    // at open time.
    if (!this.file) {
      this.file = findSessionFile(this.sessionId);
      if (!this.file) return;
      this.offset = 0;
    }
    let stat;
    try {
      stat = fs.statSync(this.file);
    } catch {
      return;
    }
    if (stat.size < this.offset) {
      // File truncated/rotated — restart from beginning.
      this.offset = 0;
      this.buffer = '';
    }
    if (stat.size === this.offset) return;
    let fd;
    try {
      fd = fs.openSync(this.file, 'r');
      const len = stat.size - this.offset;
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, this.offset);
      this.offset = stat.size;
      this.buffer += buf.toString('utf8');
    } catch {
      return;
    } finally {
      if (fd !== undefined) fs.closeSync(fd);
    }
    const parts = this.buffer.split('\n');
    this.buffer = parts.pop(); // keep trailing partial line
    const msgs = [];
    for (const line of parts) {
      const t = line.trim();
      if (!t) continue;
      try {
        const entry = JSON.parse(t);
        for (const m of normalizeEntry(entry)) msgs.push(m);
      } catch {
        /* partial/invalid */
      }
    }
    if (msgs.length) this.onMessages(msgs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
