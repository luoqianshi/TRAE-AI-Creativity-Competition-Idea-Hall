(function () {
  "use strict";

  var STORAGE_KEY = "securevault.prototype.encrypted";
  var ITERATIONS = 250000;
  var state = {
    masterPassword: "",
    entries: [],
    encryptedEnvelope: null,
    revealIds: new Set(),
    pendingDeleteId: null
  };

  var el = {
    lockScreen: document.getElementById("lockScreen"),
    unlockForm: document.getElementById("unlockForm"),
    masterPassword: document.getElementById("masterPassword"),
    lockStatus: document.getElementById("lockStatus"),
    demoDataBtn: document.getElementById("demoDataBtn"),
    entryForm: document.getElementById("entryForm"),
    entryId: document.getElementById("entryId"),
    platform: document.getElementById("platform"),
    account: document.getElementById("account"),
    password: document.getElementById("password"),
    note: document.getElementById("note"),
    formTitle: document.getElementById("formTitle"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    togglePasswordBtn: document.getElementById("togglePasswordBtn"),
    generateBtn: document.getElementById("generateBtn"),
    passwordLength: document.getElementById("passwordLength"),
    passwordMode: document.getElementById("passwordMode"),
    useUpper: document.getElementById("useUpper"),
    useLower: document.getElementById("useLower"),
    useNumber: document.getElementById("useNumber"),
    useSymbol: document.getElementById("useSymbol"),
    vaultList: document.getElementById("vaultList"),
    vaultCount: document.getElementById("vaultCount"),
    searchInput: document.getElementById("searchInput"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    importFile: document.getElementById("importFile"),
    lockBtn: document.getElementById("lockBtn"),
    toast: document.getElementById("toast"),
    confirmModal: document.getElementById("confirmModal"),
    modalCancel: document.getElementById("modalCancel"),
    modalConfirm: document.getElementById("modalConfirm")
  };

  function textEncoder(value) {
    return new TextEncoder().encode(value);
  }

  function textDecoder(value) {
    return new TextDecoder().decode(value);
  }

  function bytesToBase64(bytes) {
    var binary = "";
    var chunkSize = 8192;
    for (var i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.slice(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function base64ToBytes(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function randomBytes(length) {
    var bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  async function deriveKey(masterPassword, salt) {
    var baseKey = await crypto.subtle.importKey(
      "raw",
      textEncoder(masterPassword),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: ITERATIONS,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptVault(entries, masterPassword) {
    var salt = randomBytes(16);
    var iv = randomBytes(12);
    var key = await deriveKey(masterPassword, salt);
    var payload = JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      entries: entries
    });
    var cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      textEncoder(payload)
    );

    return {
      app: "SecureVault HTML Prototype",
      crypto: "AES-GCM",
      kdf: "PBKDF2-SHA256",
      iterations: ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      data: bytesToBase64(new Uint8Array(cipher))
    };
  }

  async function decryptVault(envelope, masterPassword) {
    var salt = base64ToBytes(envelope.salt);
    var iv = base64ToBytes(envelope.iv);
    var cipher = base64ToBytes(envelope.data);
    var key = await deriveKey(masterPassword, salt);
    var plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      cipher
    );
    return JSON.parse(textDecoder(plain));
  }

  async function persistVault() {
    state.encryptedEnvelope = await encryptVault(state.entries, state.masterPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.encryptedEnvelope));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getInitial(platform) {
    var value = String(platform || "密").trim();
    return value ? value.slice(0, 1).toUpperCase() : "密";
  }

  function maskPassword(password) {
    var length = Math.max(8, Math.min(16, String(password || "").length));
    return "•".repeat(length);
  }

  function calculateStrength(password) {
    var score = 0;
    if (password.length >= 12) score += 1;
    if (password.length >= 18) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score >= 6) return "强";
    if (score >= 4) return "中";
    return "弱";
  }

  function formatDate(iso) {
    if (!iso) return "刚刚";
    try {
      return new Intl.DateTimeFormat("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(iso));
    } catch (error) {
      return "刚刚";
    }
  }

  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () {
      el.toast.classList.remove("show");
    }, 1800);
  }

  function setStatus(message, type) {
    el.lockStatus.textContent = message || "";
    el.lockStatus.className = "status" + (type ? " " + type : "");
  }

  function renderVault() {
    var keyword = normalize(el.searchInput.value);
    var entries = state.entries
      .filter(function (item) {
        var haystack = normalize([item.platform, item.account, item.note].join(" "));
        return !keyword || haystack.indexOf(keyword) >= 0;
      })
      .sort(function (a, b) {
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      });

    el.vaultCount.textContent = state.entries.length + " 条记录";

    if (!entries.length) {
      el.vaultList.innerHTML = [
        '<div class="empty-state">',
        '  <div>',
        '    <div class="empty-icon" aria-hidden="true">',
        '      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">',
        '        <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        '        <path d="M6 11h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2"/>',
        '      </svg>',
        '    </div>',
        '    <h3>暂无匹配记录</h3>',
        '    <p>添加一个平台账号，或调整搜索关键词。</p>',
        '  </div>',
        '</div>'
      ].join("");
      return;
    }

    el.vaultList.innerHTML = entries.map(function (item) {
      var revealed = state.revealIds.has(item.id);
      var note = item.note ? escapeHTML(item.note) : "无备注";
      var passwordText = revealed ? escapeHTML(item.password) : maskPassword(item.password);
      return [
        '<article class="entry" data-id="' + escapeHTML(item.id) + '">',
        '  <div class="entry-main">',
        '    <div class="entry-title">',
        '      <div class="favicon">' + escapeHTML(getInitial(item.platform)) + '</div>',
        '      <div class="entry-copy">',
        '        <h3>' + escapeHTML(item.platform) + '</h3>',
        '        <div class="account">' + escapeHTML(item.account) + '</div>',
        '      </div>',
        '    </div>',
        '    <div class="entry-meta">',
        '      <span class="pill">密码：<span class="masked">' + passwordText + '</span></span>',
        '      <span class="pill">强度：' + escapeHTML(calculateStrength(item.password)) + '</span>',
        '      <span class="pill">更新：' + escapeHTML(formatDate(item.updatedAt)) + '</span>',
        '      <span class="pill">备注：' + note + '</span>',
        '    </div>',
        '  </div>',
        '  <div class="entry-actions">',
        '    <button class="btn small" type="button" data-action="copy-account">复制账号</button>',
        '    <button class="btn small primary" type="button" data-action="copy-password">复制密码</button>',
        '    <button class="btn small" type="button" data-action="toggle-reveal">' + (revealed ? "隐藏" : "显示") + '</button>',
        '    <button class="btn small" type="button" data-action="edit">编辑</button>',
        '    <button class="btn small danger" type="button" data-action="delete">删除</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function resetForm() {
    el.entryForm.reset();
    el.entryId.value = "";
    el.passwordLength.value = "20";
    el.useUpper.checked = true;
    el.useLower.checked = true;
    el.useNumber.checked = true;
    el.useSymbol.checked = true;
    el.formTitle.textContent = "新增密码";
    el.saveBtn && (el.saveBtn.textContent = "保存到加密库");
    el.cancelEditBtn.classList.add("hidden");
    el.password.type = "password";
    el.togglePasswordBtn.textContent = "显示";
  }

  function getEntryById(id) {
    return state.entries.find(function (item) {
      return item.id === id;
    });
  }

  function createId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function generateRandomPassword() {
    var length = Math.max(12, Math.min(64, Number(el.passwordLength.value || 20)));
    var mode = el.passwordMode.value;

    if (mode === "readable") {
      var words = ["river", "cloud", "stone", "orbit", "forest", "silver", "north", "amber", "matrix", "pixel", "secure", "vault"];
      var selected = [];
      for (var w = 0; w < 4; w += 1) {
        selected.push(words[randomInt(words.length)]);
      }
      return selected.join("-") + "-" + (10 + randomInt(90)) + "!";
    }

    var groups = [];
    if (el.useUpper.checked) groups.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
    if (el.useLower.checked) groups.push("abcdefghijkmnopqrstuvwxyz");
    if (el.useNumber.checked) groups.push("23456789");
    if (el.useSymbol.checked) groups.push("!@#$%^&*()-_=+[]{}?");
    if (!groups.length) {
      el.useLower.checked = true;
      groups.push("abcdefghijkmnopqrstuvwxyz");
    }

    var all = groups.join("");
    var chars = groups.map(function (group) {
      return group[randomInt(group.length)];
    });

    while (chars.length < length) {
      chars.push(all[randomInt(all.length)]);
    }

    return shuffle(chars).join("");
  }

  function randomInt(max) {
    var bytes = randomBytes(4);
    var value = new DataView(bytes.buffer).getUint32(0);
    return value % max;
  }

  function shuffle(items) {
    var result = items.slice();
    for (var i = result.length - 1; i > 0; i -= 1) {
      var j = randomInt(i + 1);
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast(label + "已复制");
    } catch (error) {
      toast("复制失败，请检查浏览器权限");
    }
  }

  async function unlock(masterPassword) {
    if (masterPassword.length < 8) {
      setStatus("主密码至少需要 8 位。", "error");
      return;
    }

    setStatus("正在解锁，请稍候…");
    var stored = localStorage.getItem(STORAGE_KEY);

    try {
      if (stored) {
        var envelope = JSON.parse(stored);
        var vault = await decryptVault(envelope, masterPassword);
        state.entries = Array.isArray(vault.entries) ? vault.entries : [];
        state.encryptedEnvelope = envelope;
      } else {
        state.entries = [];
        state.encryptedEnvelope = null;
      }
      state.masterPassword = masterPassword;
      el.lockScreen.classList.add("hidden");
      setStatus("");
      renderVault();
      toast("密码库已解锁");
    } catch (error) {
      setStatus("解锁失败：主密码不正确，或本地加密库已损坏。", "error");
    }
  }

  async function saveEntry(event) {
    event.preventDefault();
    var now = new Date().toISOString();
    var id = el.entryId.value || createId();
    var entry = {
      id: id,
      platform: el.platform.value.trim(),
      account: el.account.value.trim(),
      password: el.password.value,
      note: el.note.value.trim(),
      createdAt: now,
      updatedAt: now
    };

    if (!entry.platform || !entry.account || !entry.password) {
      toast("请填写平台、账号和密码");
      return;
    }

    var existing = getEntryById(id);
    if (existing) {
      entry.createdAt = existing.createdAt || now;
      Object.assign(existing, entry);
    } else {
      state.entries.push(entry);
    }

    try {
      await persistVault();
      resetForm();
      renderVault();
      toast("已保存到加密库");
    } catch (error) {
      toast("保存失败，浏览器加密能力不可用");
    }
  }

  function editEntry(id) {
    var entry = getEntryById(id);
    if (!entry) return;
    el.entryId.value = entry.id;
    el.platform.value = entry.platform;
    el.account.value = entry.account;
    el.password.value = entry.password;
    el.note.value = entry.note || "";
    el.formTitle.textContent = "编辑密码";
    el.cancelEditBtn.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDeleteModal(id) {
    state.pendingDeleteId = id;
    el.confirmModal.classList.remove("hidden");
  }

  async function deletePendingEntry() {
    var id = state.pendingDeleteId;
    state.pendingDeleteId = null;
    el.confirmModal.classList.add("hidden");
    state.entries = state.entries.filter(function (item) {
      return item.id !== id;
    });
    state.revealIds.delete(id);
    await persistVault();
    renderVault();
    toast("记录已删除");
  }

  function exportVault() {
    var encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      toast("暂无可导出的加密库");
      return;
    }
    var blob = new Blob([encrypted], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "securevault-encrypted-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("加密库已导出");
  }

  function importVault(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = async function () {
      try {
        var envelope = JSON.parse(String(reader.result || ""));
        if (!envelope.salt || !envelope.iv || !envelope.data) {
          throw new Error("invalid");
        }
        var vault = await decryptVault(envelope, state.masterPassword);
        state.entries = Array.isArray(vault.entries) ? vault.entries : [];
        state.encryptedEnvelope = envelope;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
        renderVault();
        toast("导入成功，已使用当前主密码解密验证");
      } catch (error) {
        toast("导入失败：文件格式错误或主密码不匹配");
      } finally {
        el.importFile.value = "";
      }
    };
    reader.readAsText(file);
  }

  async function loadDemoData() {
    var demoPassword = el.masterPassword.value;
    if (demoPassword.length < 8) {
      setStatus("请先输入至少 8 位主密码，再载入演示数据。", "error");
      return;
    }
    state.masterPassword = demoPassword;
    state.entries = [
      {
        id: createId(),
        platform: "GitHub",
        account: "dev@example.com",
        password: "River-Cloud-Matrix-42!",
        note: "已开启二次验证",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: createId(),
        platform: "银行 App",
        account: "138****0000",
        password: "N8!qP2@zL6#vS9",
        note: "仅作界面演示，请勿保存真实银行密码",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    await persistVault();
    el.lockScreen.classList.add("hidden");
    setStatus("");
    renderVault();
    toast("演示数据已载入");
  }

  function lockVault() {
    state.masterPassword = "";
    state.entries = [];
    state.revealIds.clear();
    resetForm();
    renderVault();
    el.masterPassword.value = "";
    el.lockScreen.classList.remove("hidden");
    toast("已锁定");
  }

  function handleListClick(event) {
    var button = event.target.closest("button[data-action]");
    if (!button) return;
    var article = event.target.closest(".entry");
    if (!article) return;
    var id = article.dataset.id;
    var entry = getEntryById(id);
    if (!entry) return;

    var action = button.dataset.action;
    if (action === "copy-account") copyText(entry.account, "账号");
    if (action === "copy-password") copyText(entry.password, "密码");
    if (action === "toggle-reveal") {
      if (state.revealIds.has(id)) {
        state.revealIds.delete(id);
      } else {
        state.revealIds.add(id);
      }
      renderVault();
    }
    if (action === "edit") editEntry(id);
    if (action === "delete") openDeleteModal(id);
  }

  function bindEvents() {
    el.unlockForm.addEventListener("submit", function (event) {
      event.preventDefault();
      unlock(el.masterPassword.value);
    });
    el.demoDataBtn.addEventListener("click", loadDemoData);
    el.entryForm.addEventListener("submit", saveEntry);
    el.generateBtn.addEventListener("click", function () {
      el.password.value = generateRandomPassword();
      el.password.type = "text";
      el.togglePasswordBtn.textContent = "隐藏";
      toast("已生成强密码");
    });
    el.togglePasswordBtn.addEventListener("click", function () {
      var visible = el.password.type === "text";
      el.password.type = visible ? "password" : "text";
      el.togglePasswordBtn.textContent = visible ? "显示" : "隐藏";
    });
    el.cancelEditBtn.addEventListener("click", resetForm);
    el.searchInput.addEventListener("input", renderVault);
    el.vaultList.addEventListener("click", handleListClick);
    el.exportBtn.addEventListener("click", exportVault);
    el.importBtn.addEventListener("click", function () {
      el.importFile.click();
    });
    el.importFile.addEventListener("change", function () {
      importVault(el.importFile.files[0]);
    });
    el.lockBtn.addEventListener("click", lockVault);
    el.modalCancel.addEventListener("click", function () {
      state.pendingDeleteId = null;
      el.confirmModal.classList.add("hidden");
    });
    el.modalConfirm.addEventListener("click", deletePendingEntry);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        el.confirmModal.classList.add("hidden");
        state.pendingDeleteId = null;
      }
    });
  }

  function boot() {
    if (!window.crypto || !window.crypto.subtle) {
      setStatus("当前浏览器不支持 Web Crypto，无法运行安全原型。", "error");
      return;
    }
    bindEvents();
    renderVault();
    if (localStorage.getItem(STORAGE_KEY)) {
      setStatus("检测到本地加密库，请输入主密码解锁。");
    } else {
      setStatus("首次使用：输入主密码后即可创建本地加密库。");
    }
  }

  boot();
})();
