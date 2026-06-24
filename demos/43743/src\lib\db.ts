// SQLite 单例 — 使用 Node 24 内置 node:sqlite
// 必须运行在服务端！永远不要在客户端组件中 import

import 'server-only';
import { DatabaseSync, type StatementSync, type SupportedValueType } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'dev.db');

// 确保 data 目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let _db: DatabaseSync | null = null;

export function getDB(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    _db.exec('PRAGMA foreign_keys = ON');
    _db.exec('PRAGMA journal_mode = WAL');
  }
  return _db;
}

// node:sqlite 接受 string | number | bigint | null | Uint8Array
type SqlParam = SupportedValueType;

function toParams(p: Record<string, unknown> | unknown[]): SqlParam[] | Record<string, SqlParam> {
  if (Array.isArray(p)) {
    return p.map((v) => normalize(v));
  }
  const out: Record<string, SqlParam> = {};
  for (const k of Object.keys(p)) {
    out[k] = normalize((p as Record<string, unknown>)[k]);
  }
  return out;
}

function normalize(v: unknown): SqlParam {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint') return v as SqlParam;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v instanceof Uint8Array) return v;
  // 对象/数组 → JSON
  return JSON.stringify(v);
}

// 便捷查询封装
export function query<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> | unknown[] = []
): T[] {
  const stmt: StatementSync = getDB().prepare(sql);
  try {
    const p = toParams(params);
    const result = Array.isArray(p) ? stmt.all(...p) : stmt.all(p);
    return result as T[];
  } finally {
    // node:sqlite 的 StatementSync 无 reset；自动随 GC 释放
  }
}

export function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: Record<string, unknown> | unknown[] = []
): T | undefined {
  const stmt: StatementSync = getDB().prepare(sql);
  try {
    const p = toParams(params);
    const result = Array.isArray(p) ? stmt.get(...p) : stmt.get(p);
    return result as T | undefined;
  } finally {
    // 同上
  }
}

export function execute(
  sql: string,
  params: Record<string, unknown> | unknown[] = []
): { changes: number; lastInsertRowid: number | bigint } {
  const stmt: StatementSync = getDB().prepare(sql);
  try {
    const p = toParams(params);
    const result = Array.isArray(p) ? stmt.run(...p) : stmt.run(p);
    return {
      changes: Number(result.changes),
      lastInsertRowid: result.lastInsertRowid,
    };
  } finally {
    // 同上
  }
}

export function transaction<T>(fn: () => T): T {
  getDB().exec('BEGIN');
  try {
    const result = fn();
    getDB().exec('COMMIT');
    return result;
  } catch (err) {
    getDB().exec('ROLLBACK');
    throw err;
  }
}

// 工具：行转 camelCase
export function toCamel<T extends Record<string, unknown>>(row: Record<string, unknown> | undefined): T | undefined {
  if (!row) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = row[k];
  }
  return out as T;
}
