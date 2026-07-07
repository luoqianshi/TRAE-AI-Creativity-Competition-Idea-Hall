/* ========== 水性墨水配方管理系统 - 数据存储层 ========== */

const STORAGE_KEY_MATERIALS = 'ink_materials';
const STORAGE_KEY_FORMULAS = 'ink_formulas';

const CATEGORIES = ['溶剂', '助剂', '树脂', '色浆'];
const CATEGORY_COLORS = {
  '溶剂': 'solvent',
  '助剂': 'additive',
  '树脂': 'resin',
  '色浆': 'colorant'
};

const COLOR_MAP = {
  '蓝': '#3b82f6', '青': '#06b6d4', '绿': '#10b981', '黄': '#f59e0b',
  '橙': '#f97316', '红': '#ef4444', '品红': '#ec4899', '紫': '#8b5cf6',
  '黑': '#1e293b', '白': '#e2e8f0', '灰': '#94a3b8', '棕': '#78350f',
  '透明': '#cbd5e1'
};

// ========== UUID Generator ==========
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ========== Generic Storage (with Guest Isolation) ==========
function _guestPrefix(key) {
  // If currentUser has guest role, remap keys to a guest-only namespace
  if (typeof isGuest === 'function' && isGuest()) {
    if (key.startsWith('ink_') && !key.startsWith('ink_guest_') && key !== 'ink_session' && key !== 'ink_users' && key !== 'ink_doubao_config') {
      return 'ink_guest_' + key.substring(4);
    }
  }
  return key;
}

function loadData(key) {
  try {
    const raw = localStorage.getItem(_guestPrefix(key));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load data:', e);
    return [];
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(_guestPrefix(key), JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
    if (e.name === 'QuotaExceededError') {
      showToast('存储空间不足！请清理部分图片数据', 'error');
    }
  }
}

// ========== Materials CRUD ==========
function getMaterials() {
  return loadData(STORAGE_KEY_MATERIALS);
}

function getMaterialById(id) {
  return getMaterials().find(m => m.id === id);
}

function saveMaterial(material) {
  const materials = getMaterials();
  const idx = materials.findIndex(m => m.id === material.id);
  if (idx >= 0) {
    materials[idx] = { ...materials[idx], ...material };
  } else {
    material.id = material.id || genId();
    material.createdAt = material.createdAt || new Date().toISOString();
    materials.push(material);
  }
  saveData(STORAGE_KEY_MATERIALS, materials);
  return material;
}

function deleteMaterial(id) {
  const materials = getMaterials().filter(m => m.id !== id);
  saveData(STORAGE_KEY_MATERIALS, materials);
}

function getMaterialsByCategory() {
  const materials = getMaterials();
  const grouped = {};
  CATEGORIES.forEach(cat => { grouped[cat] = []; });
  materials.forEach(m => {
    if (grouped[m.category]) {
      grouped[m.category].push(m);
    }
  });
  return grouped;
}

// ========== Formulas CRUD ==========
function getFormulas() {
  return loadData(STORAGE_KEY_FORMULAS);
}

function getFormulaById(id) {
  return getFormulas().find(f => f.id === id);
}

function saveFormula(formula) {
  const formulas = getFormulas();
  const idx = formulas.findIndex(f => f.id === formula.id);
  const now = new Date().toISOString();
  if (idx >= 0) {
    formulas[idx] = { ...formulas[idx], ...formula, updatedAt: now };
  } else {
    formula.id = formula.id || genId();
    formula.createdAt = formula.createdAt || now;
    formula.updatedAt = now;
    formulas.push(formula);
  }
  saveData(STORAGE_KEY_FORMULAS, formulas);
  return formula;
}

function deleteFormula(id) {
  const formulas = getFormulas().filter(f => f.id !== id);
  saveData(STORAGE_KEY_FORMULAS, formulas);
}

// ========== Initialize Demo Data ==========
function initDemoData() {
  if (getMaterials().length === 0) {
    const demos = [
      // 溶剂 — L 开头编号
      { id: genId(), name: '纯水', code: '', category: '溶剂', specs: '电导率 ≤2μS/cm', manufacturer: '-', customInfo: { '产地':'本地自制','批号':'','有效期':'无限制' } },
      { id: genId(), name: '异丙醇', code: 'L-001', category: '溶剂', specs: '99.7% 工业级', manufacturer: '扬子石化', customInfo: { 'CAS号':'67-63-0','批号':'','储存':'阴凉通风' } },
      { id: genId(), name: '乙二醇丁醚', code: 'L-002', category: '溶剂', specs: '99% 工业级', manufacturer: '陶氏化学', customInfo: { 'CAS号':'111-76-2','批号':'','储存':'密封干燥' } },
      { id: genId(), name: '二乙二醇乙醚', code: 'L-003', category: '溶剂', specs: '98.5% 工业级', manufacturer: '巴斯夫', customInfo: { 'CAS号':'111-90-0','批号':'','储存':'常温密封' } },
      { id: genId(), name: '丙二醇甲醚', code: 'L-004', category: '溶剂', specs: '99.5% 电子级', manufacturer: '陶氏化学', customInfo: { 'CAS号':'107-98-2','批号':'','储存':'密封避光' } },
      // 助剂 — A / B 开头编号
      { id: genId(), name: 'BYK-024 消泡剂', code: 'A-001', category: '助剂', specs: 'BYK 原装', manufacturer: '毕克化学', customInfo: { '批号':'','添加量':'0.1-0.5%','储存':'5-35℃' } },
      { id: genId(), name: 'TEGO Wet 270 润湿剂', code: 'A-002', category: '助剂', specs: '100% 有效成分', manufacturer: '赢创', customInfo: { '批号':'','添加量':'0.2-1.0%','HLB值':'12-14' } },
      { id: genId(), name: 'BYK-190 分散剂', code: 'A-003', category: '助剂', specs: '固含40%', manufacturer: '毕克化学', customInfo: { '批号':'','添加量':'颜料量的15-40%' } },
      { id: genId(), name: 'AMP-95 pH调节剂', code: 'B-001', category: '助剂', specs: '95% 有效成分', manufacturer: 'Angus', customInfo: { '批号':'','添加量':'0.05-0.2%','pH范围':'8-10' } },
      { id: genId(), name: 'Surfynol 104E 流平剂', code: 'B-002', category: '助剂', specs: '50% 乙二醇溶液', manufacturer: '赢创', customInfo: { '批号':'','添加量':'0.1-0.5%','动态表面张力':'低' } },
      // 树脂 — R 开头编号
      { id: genId(), name: '水性丙烯酸树脂 A-639', code: 'R-001', category: '树脂', specs: '固含45%, Tg 25℃', manufacturer: '万华化学', customInfo: { '批号':'','酸值':'55 mgKOH/g','粘度':'800-1500 mPa·s' } },
      { id: genId(), name: '水性聚氨酯树脂 PU-330', code: 'R-002', category: '树脂', specs: '固含35%, 阴离子型', manufacturer: '科思创', customInfo: { '批号':'','断裂伸长率':'>400%','pH':'7-9' } },
      { id: genId(), name: '水性苯丙乳液 SA-200', code: 'R-003', category: '树脂', specs: '固含48%, Tg -10℃', manufacturer: '巴德富', customInfo: { '批号':'','MFFT':'<5℃','钙离子稳定性':'优' } },
      // 色浆 — C500/K500/M500/Y500 风格
      { id: genId(), name: '酞菁蓝色浆 PB-15:3', code: 'C500', category: '色浆', specs: '颜料含量35%, 耐光8级', manufacturer: '克莱恩', customInfo: { '批号':'','耐温':'220℃','粒径 D50':'≤0.3μm' } },
      { id: genId(), name: '炭黑色浆 CB-7', code: 'K500', category: '色浆', specs: '颜料含量30%, 高色素', manufacturer: '欧励隆', customInfo: { '批号':'','比表面积':'560 m²/g','DBP吸收':'120 ml/100g' } },
      { id: genId(), name: '品红色浆 PR-122', code: 'M500', category: '色浆', specs: '颜料含量30%, 耐光7级', manufacturer: '克莱恩', customInfo: { '批号':'','耐温':'180℃','粒径 D50':'≤0.2μm' } },
      { id: genId(), name: '联苯胺黄色浆 PY-13', code: 'Y500', category: '色浆', specs: '颜料含量28%, 耐光6级', manufacturer: 'DIC', customInfo: { '批号':'','耐温':'160℃','透明度':'高' } },
    ];
    saveData(STORAGE_KEY_MATERIALS, demos);
  }
}

// ========== Export / Import ==========
function exportAllData() {
  if (typeof isAdmin === 'function' && !isAdmin()) {
    showToast('仅管理员可导出数据', 'error');
    return;
  }
  const data = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    materials: getMaterials(),
    formulas: getFormulas(),
    users: getUsers().map(u => ({ ...u, password: undefined, passwordHash: undefined }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ink-formula-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('数据已导出（不含密码）', 'success');
}

function importAllData(file) {
  if (typeof isAdmin === 'function' && !isAdmin()) {
    showToast('仅管理员可导入数据', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.materials || !data.formulas) throw new Error('Invalid format');
      if (!confirm(`将导入 ${data.materials.length} 种原料和 ${data.formulas.length} 个配方，当前数据将被覆盖，确认？`)) return;
      saveData(STORAGE_KEY_MATERIALS, data.materials);
      saveData(STORAGE_KEY_FORMULAS, data.formulas);
      if (data.users && data.users.length > 0) {
        saveData(STORAGE_KEY_USERS, data.users);
      }
      showToast('数据导入成功', 'success');
      location.reload();
    } catch (err) {
      showToast('导入失败：文件格式不正确', 'error');
    }
  };
  reader.readAsText(file);
}

// ========== Material Display Helper (role-aware) ==========
// Admin sees full name; regular users see only company code
function matDisplayLabel(m) {
  if (!m) return '未知';
  if (typeof isAdmin === 'function' && isAdmin()) {
    return escHtml(m.name);
  }
  return m.code ? escHtml(m.code) : ('原料-' + (m.id || m.materialId || '').toString().substring(0, 6));
}

// Same but for select options (includes specs for admin context)
function matOptionLabel(m) {
  if (!m) return '未知';
  const specsSuffix = m.specs ? ' (' + escHtml(m.specs) + ')' : '';
  if (typeof isAdmin === 'function' && isAdmin()) {
    return (m.code ? '[' + escHtml(m.code) + '] ' : '') + escHtml(m.name) + specsSuffix;
  }
  return (m.code ? escHtml(m.code) : ('原料-' + (m.id || m.materialId || '').toString().substring(0, 6))) + specsSuffix;
}
