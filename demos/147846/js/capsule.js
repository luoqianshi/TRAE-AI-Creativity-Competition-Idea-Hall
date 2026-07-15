/* ============================================================
   Capsule 模块 - 胶囊业务逻辑
   创建、保存、解锁、回信等功能
   ============================================================ */

const Capsule = (() => {

  // ---------- 保存创建中的胶囊 ----------
  async function createCapsule(formData) {
    const { type, voiceContent, voiceDuration, textContent, coverColor, coverIcon,
            unlockTime, aiEnabled, title } = formData;

    const capsule = {
      id: UI.generateId(),
      type: type,
      title: title || '未命名',
      content: null,        // text 时为文字内容，voice 时为 base64
      duration: null,       // voice 时有值
      coverColor: coverColor || '#D4733A',
      coverIcon: coverIcon || 'star',
      createTime: Date.now(),
      unlockTime: unlockTime,
      aiMessage: null,
      reply: null,
      isUnlocked: false
    };

    // 处理内容
    if (type === 'voice') {
      if (voiceContent) {
        // voiceContent 是 Blob，转 Base64 存储
        try {
          capsule.content = await Recorder.blobToBase64(voiceContent);
          capsule.duration = voiceDuration || 0;
        } catch (e) {
          console.error('音频转 Base64 失败:', e);
          UI.showToast('音频处理失败');
          return null;
        }
      } else {
        UI.showToast('请先录制声音');
        return null;
      }
    } else {
      if (!textContent || !textContent.trim()) {
        UI.showToast('请输入文字内容');
        return null;
      }
      capsule.content = textContent.trim();
    }

    // 处理 AI 寄语
    if (aiEnabled) {
      // 使用预设库（降级方案）
      capsule.aiMessage = UI.getRandomAI();
    }

    // 保存
    const saved = Storage.saveCapsule(capsule);
    if (!saved) {
      UI.showToast('保存失败，请重试');
      return null;
    }

    return capsule;
  }

  // ---------- 解锁胶囊 ----------
  function unlockCapsule(id) {
    const capsule = Storage.getCapsule(id);
    if (!capsule) return null;

    // 检查是否到解锁时间
    if (Date.now() < capsule.unlockTime) {
      return null; // 还没到时间
    }

    // 标记为已解锁
    Storage.updateCapsule(id, { isUnlocked: true });
    return { ...capsule, isUnlocked: true };
  }

  // ---------- 保存回信 ----------
  function saveReply(id, replyText) {
    if (!replyText || !replyText.trim()) {
      UI.showToast('请输入回信内容');
      return false;
    }
    const saved = Storage.updateCapsule(id, { reply: replyText.trim() });
    if (saved) {
      UI.showToast('回信已保存 💌');
    }
    return saved;
  }

  // ---------- 删除胶囊 ----------
  function deleteCapsule(id) {
    return Storage.deleteCapsule(id);
  }

  // ---------- 获取所有胶囊 ----------
  function getAll() {
    return Storage.getCapsules();
  }

  // ---------- 按解锁状态分组 ----------
  function getGrouped() {
    const all = Storage.getCapsules();
    const now = Date.now();
    const locked = [];
    const unlocked = [];
    for (const cap of all) {
      if (now < cap.unlockTime) {
        locked.push(cap);
      } else {
        unlocked.push(cap);
      }
    }
    return { locked, unlocked, all };
  }

  // ---------- 年度统计 ----------
  function getYearStats(year) {
    const y = year || new Date().getFullYear();
    const capsules = Storage.getCapsules();
    const now = Date.now();
    const yearStart = new Date(y, 0, 1).getTime();
    const yearEnd = new Date(y + 1, 0, 1).getTime();

    const yearCapsules = capsules.filter(c =>
      c.createTime >= yearStart && c.createTime < yearEnd
    );

    const unlocked = yearCapsules.filter(c => now >= c.unlockTime || c.isUnlocked);
    const waiting = yearCapsules.filter(c => now < c.unlockTime);

    return {
      total: yearCapsules.length,
      unlocked: unlocked.length,
      waiting: waiting.length,
      all: yearCapsules.sort((a, b) => a.createTime - b.createTime)
    };
  }

  // ---------- 公开 API ----------
  return {
    createCapsule,
    unlockCapsule,
    saveReply,
    deleteCapsule,
    getAll,
    getGrouped,
    getYearStats
  };
})();
