/* ============================================================
   Storage 模块 - 数据持久化层
   基于 localStorage 实现胶囊数据和设置的 CRUD
   ============================================================ */

const Storage = (() => {
  const KEYS = {
    CAPSULES: 'shengxi_capsules',
    SETTINGS: 'shengxi_settings',
    PASSWORD_VERIFIED: 'shengxi_pwd_verified'
  };

  // ---------- 默认设置 ----------
  const DEFAULT_SETTINGS = {
    theme: 'light',
    password: null,
    aiEnabled: true
  };

  // ---------- 内部方法 ----------
  function getJSON(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  function setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage 写入失败:', e);
      return false;
    }
  }

  // ---------- 胶囊操作 ----------

  /** 获取所有胶囊，按解锁时间降序（最近的在上面） */
  function getCapsules() {
    const capsules = getJSON(KEYS.CAPSULES, []);
    // 排序：最近的解锁时间在上
    return capsules.sort((a, b) => b.unlockTime - a.unlockTime);
  }

  /** 获取单个胶囊 */
  function getCapsule(id) {
    const capsules = getJSON(KEYS.CAPSULES, []);
    return capsules.find(c => c.id === id) || null;
  }

  /** 保存胶囊（新增/更新） */
  function saveCapsule(capsule) {
    const capsules = getJSON(KEYS.CAPSULES, []);
    const index = capsules.findIndex(c => c.id === capsule.id);
    if (index >= 0) {
      capsules[index] = { ...capsules[index], ...capsule };
    } else {
      capsules.push(capsule);
    }
    return setJSON(KEYS.CAPSULES, capsules);
  }

  /** 删除胶囊 */
  function deleteCapsule(id) {
    let capsules = getJSON(KEYS.CAPSULES, []);
    capsules = capsules.filter(c => c.id !== id);
    return setJSON(KEYS.CAPSULES, capsules);
  }

  /** 更新胶囊的部分字段 */
  function updateCapsule(id, updates) {
    const capsules = getJSON(KEYS.CAPSULES, []);
    const index = capsules.findIndex(c => c.id === id);
    if (index < 0) return false;
    capsules[index] = { ...capsules[index], ...updates };
    return setJSON(KEYS.CAPSULES, capsules);
  }

  // ---------- 设置操作 ----------

  /** 获取应用设置 */
  function getSettings() {
    return { ...DEFAULT_SETTINGS, ...getJSON(KEYS.SETTINGS, {}) };
  }

  /** 保存设置 */
  function saveSettings(settings) {
    const current = getSettings();
    return setJSON(KEYS.SETTINGS, { ...current, ...settings });
  }

  // ---------- 密码验证 ----------

  function isPasswordVerified() {
    return sessionStorage.getItem(KEYS.PASSWORD_VERIFIED) === 'true';
  }

  function setPasswordVerified(verified) {
    if (verified) {
      sessionStorage.setItem(KEYS.PASSWORD_VERIFIED, 'true');
    } else {
      sessionStorage.removeItem(KEYS.PASSWORD_VERIFIED);
    }
  }

  // ---------- 数据导入导出 ----------

  /** 导出所有数据为 JSON 字符串 */
  function exportData() {
    return JSON.stringify({
      capsules: getJSON(KEYS.CAPSULES, []),
      settings: getJSON(KEYS.SETTINGS, {}),
      exportTime: Date.now(),
      version: '1.0.0'
    }, null, 2);
  }

  /** 从 JSON 字符串导入数据 */
  function importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.capsules || !Array.isArray(data.capsules)) {
        return { success: false, error: '数据格式不正确' };
      }
      // 合并现有胶囊（不覆盖已有ID）
      const existing = getJSON(KEYS.CAPSULES, []);
      const existingIds = new Set(existing.map(c => c.id));
      const merged = [...existing];
      for (const cap of data.capsules) {
        if (!existingIds.has(cap.id)) {
          merged.push(cap);
        }
      }
      setJSON(KEYS.CAPSULES, merged);
      if (data.settings) {
        saveSettings(data.settings);
      }
      return { success: true, count: merged.length - existing.length };
    } catch (e) {
      return { success: false, error: 'JSON 解析失败' };
    }
  }

  // ---------- 公开 API ----------
  return {
    getCapsules,
    getCapsule,
    saveCapsule,
    deleteCapsule,
    updateCapsule,
    getSettings,
    saveSettings,
    isPasswordVerified,
    setPasswordVerified,
    exportData,
    importData
  };
})();
