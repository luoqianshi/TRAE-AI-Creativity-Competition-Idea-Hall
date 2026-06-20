/**
 * Supabase 客户端封装
 *
 * 启动时自动检测 config.local.js 是否填写了凭证:
 *   - 已填写 → 使用 Supabase PostgreSQL
 *   - 未填写 → 回退到本地 JSON 文件存储(原行为)
 */
const { createClient } = require('@supabase/supabase-js');
const local = require('../config.local');

let client = null;
let enabled = false;

function init() {
  const url = (local.supabaseUrl || '').trim();
  const key = (local.supabaseKey || '').trim();
  if (!url || !key || url === '' || key === '') {
    enabled = false;
    client = null;
    return;
  }
  if (!/^https?:\/\//.test(url)) {
    console.warn('[Supabase] URL 格式不正确,已回退到 JSON 存储:', url);
    enabled = false;
    client = null;
    return;
  }
  try {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    enabled = true;
  } catch (e) {
    console.error('[Supabase] 客户端创建失败,回退到 JSON 存储:', e.message);
    enabled = false;
    client = null;
  }
}

init();

function isEnabled() {
  return enabled;
}

function getClient() {
  return client;
}

module.exports = { init, isEnabled, getClient };
