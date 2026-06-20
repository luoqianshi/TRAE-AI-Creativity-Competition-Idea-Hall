/**
 * 数据访问层
 *
 * 统一出口,根据 Supabase 是否配置自动选择:
 *   - 已配置 supabaseUrl + supabaseKey → 使用 Supabase PostgreSQL
 *   - 未配置 → 回退到本地 JSON 文件存储
 *
 * 业务侧(server.js / 路由)无需关心后端存储,所有函数保持原签名。
 */
const fs = require('fs');
const path = require('path');

const supa = require('./db/supabase');

const DATA_DIR = path.join(__dirname, 'db');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============================================================
// 本地 JSON 存储(原实现,作为 fallback)
// ============================================================
function ensureLocalFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(CARDS_FILE)) {
    fs.writeFileSync(CARDS_FILE, JSON.stringify({ cards: [] }, null, 2), 'utf-8');
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ home_bg: '', detail_bg: '' }, null, 2), 'utf-8');
  }
}
function readLocalCards() {
  ensureLocalFiles();
  return JSON.parse(fs.readFileSync(CARDS_FILE, 'utf-8'));
}
function writeLocalCards(data) {
  ensureLocalFiles();
  fs.writeFileSync(CARDS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
function readLocalConfig() {
  ensureLocalFiles();
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}
function writeLocalConfig(cfg) {
  ensureLocalFiles();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

function ensureDataFiles() {
  if (supa.isEnabled()) {
    // Supabase 由远端管理表,无需本地建表
    ensureLocalFiles();
    return;
  }
  ensureLocalFiles();
}

// ============================================================
// 统一业务函数
// ============================================================
async function getAllCardsAsync() {
  if (supa.isEnabled()) {
    const { data, error } = await supa.getClient()
      .from('card_info')
      .select('*')
      .order('create_time', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return readLocalCards().cards;
}

function getAllCards() {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 getAllCardsAsync');
  }
  return readLocalCards().cards.slice().sort((a, b) =>
    (b.create_time || '').localeCompare(a.create_time || '')
  );
}

async function getCardByIdAsync(id) {
  if (supa.isEnabled()) {
    const { data, error } = await supa.getClient()
      .from('card_info')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
  return readLocalCards().cards.find(c => c.id === id) || null;
}

function getCardById(id) {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 getCardByIdAsync');
  }
  return readLocalCards().cards.find(c => c.id === id) || null;
}

async function addCardAsync(payload) {
  const card = {
    id: genId(),
    card_name: payload.card_name,
    card_no: payload.card_no,
    inner_no: payload.inner_no,
    score: payload.score,
    version: payload.version,
    img_front: payload.img_front,
    img_back: payload.img_back
  };

  if (supa.isEnabled()) {
    const { data, error } = await supa.getClient()
      .from('card_info')
      .insert([card])
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        const e = new Error('内部编号已存在,请使用唯一编号');
        e.code = 'DUP_INNER_NO';
        throw e;
      }
      throw error;
    }
    return data;
  }

  const local = readLocalCards();
  if (local.cards.find(c => c.inner_no === payload.inner_no)) {
    const e = new Error('内部编号已存在,请使用唯一编号');
    e.code = 'DUP_INNER_NO';
    throw e;
  }
  card.create_time = new Date().toISOString();
  local.cards.push(card);
  writeLocalCards(local);
  return card;
}

function addCard(payload) {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 addCardAsync');
  }
  // 同步 fallback(保留原行为)
  const card = { id: genId(), ...payload, create_time: new Date().toISOString() };
  const local = readLocalCards();
  if (local.cards.find(c => c.inner_no === payload.inner_no)) {
    const e = new Error('内部编号已存在,请使用唯一编号');
    e.code = 'DUP_INNER_NO';
    throw e;
  }
  local.cards.push(card);
  writeLocalCards(local);
  return card;
}

async function updateCardAsync(id, payload) {
  if (supa.isEnabled()) {
    const update = {
      card_name: payload.card_name,
      card_no: payload.card_no,
      inner_no: payload.inner_no,
      score: payload.score,
      version: payload.version,
      img_front: payload.img_front,
      img_back: payload.img_back
    };
    const { data, error } = await supa.getClient()
      .from('card_info')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        const e = new Error('内部编号已被其他卡牌使用');
        e.code = 'DUP_INNER_NO';
        throw e;
      }
      if (error.code === 'PGRST116') {
        const e = new Error('卡牌不存在');
        e.code = 'NOT_FOUND';
        throw e;
      }
      throw error;
    }
    return data;
  }
  const local = readLocalCards();
  const idx = local.cards.findIndex(c => c.id === id);
  if (idx === -1) {
    const e = new Error('卡牌不存在');
    e.code = 'NOT_FOUND';
    throw e;
  }
  if (local.cards.find(c => c.inner_no === payload.inner_no && c.id !== id)) {
    const e = new Error('内部编号已被其他卡牌使用');
    e.code = 'DUP_INNER_NO';
    throw e;
  }
  local.cards[idx] = { ...local.cards[idx], ...payload };
  writeLocalCards(local);
  return local.cards[idx];
}

function updateCard(id, payload) {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 updateCardAsync');
  }
  const local = readLocalCards();
  const idx = local.cards.findIndex(c => c.id === id);
  if (idx === -1) {
    const e = new Error('卡牌不存在');
    e.code = 'NOT_FOUND';
    throw e;
  }
  if (local.cards.find(c => c.inner_no === payload.inner_no && c.id !== id)) {
    const e = new Error('内部编号已被其他卡牌使用');
    e.code = 'DUP_INNER_NO';
    throw e;
  }
  local.cards[idx] = { ...local.cards[idx], ...payload };
  writeLocalCards(local);
  return local.cards[idx];
}

async function deleteCardAsync(id) {
  if (supa.isEnabled()) {
    const { data, error } = await supa.getClient()
      .from('card_info')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
  const local = readLocalCards();
  const idx = local.cards.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const removed = local.cards[idx];
  local.cards.splice(idx, 1);
  writeLocalCards(local);
  return removed;
}

function deleteCard(id) {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 deleteCardAsync');
  }
  const local = readLocalCards();
  const idx = local.cards.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const removed = local.cards[idx];
  local.cards.splice(idx, 1);
  writeLocalCards(local);
  return removed;
}

async function queryByInnerNoAsync(innerNo) {
  if (supa.isEnabled()) {
    const { data, error } = await supa.getClient()
      .from('card_info')
      .select('*')
      .eq('inner_no', innerNo)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
  return readLocalCards().cards.find(c => c.inner_no === innerNo) || null;
}

function getCardByInnerNo(innerNo) {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 queryByInnerNoAsync');
  }
  return readLocalCards().cards.find(c => c.inner_no === innerNo) || null;
}

async function getConfigAsync() {
  if (supa.isEnabled()) {
    const { data, error } = await supa.getClient()
      .from('sys_config')
      .select('key, value');
    if (error) throw error;
    const cfg = { home_bg: '', detail_bg: '' };
    (data || []).forEach(row => { cfg[row.key] = row.value || ''; });
    return cfg;
  }
  return readLocalConfig();
}

function getConfig() {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 getConfigAsync');
  }
  return readLocalConfig();
}

async function setConfigAsync(partial) {
  const entries = Object.entries(partial);
  if (supa.isEnabled()) {
    for (const [key, value] of entries) {
      const { error } = await supa.getClient()
        .from('sys_config')
        .upsert({ key, value, update_time: new Date().toISOString() });
      if (error) throw error;
    }
    return getConfigAsync();
  }
  const cfg = readLocalConfig();
  const next = { ...cfg, ...partial };
  writeLocalConfig(next);
  return next;
}

function setConfig(partial) {
  if (supa.isEnabled()) {
    throw new Error('Supabase 模式下请使用 setConfigAsync');
  }
  const cfg = readLocalConfig();
  const next = { ...cfg, ...partial };
  writeLocalConfig(next);
  return next;
}

function removeFileIfExists(url) {
  if (!url) return;
  const filename = path.basename(url);
  const filepath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filepath)) {
    try { fs.unlinkSync(filepath); } catch (e) { /* ignore */ }
  }
}
function removeFileByUrl(url) { return removeFileIfExists(url); }

function getStorageMode() {
  return supa.isEnabled() ? 'supabase' : 'json';
}

module.exports = {
  ensureDataFiles,
  getStorageMode,
  // sync (JSON mode only)
  getAllCards,
  getCardById,
  getCardByInnerNo,
  addCard,
  updateCard,
  deleteCard,
  getConfig,
  setConfig,
  removeFileIfExists,
  removeFileByUrl,
  // async (Supabase + JSON)
  getAllCardsAsync,
  getCardByIdAsync,
  addCardAsync,
  updateCardAsync,
  deleteCardAsync,
  queryByInnerNoAsync,
  getConfigAsync,
  setConfigAsync,
  UPLOAD_DIR
};
