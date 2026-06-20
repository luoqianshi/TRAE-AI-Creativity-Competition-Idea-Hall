/**
 * i18n.js — 中英文动态切换（核心逻辑）
 * 字典拆分至 ./i18n.zh.js 与 ./i18n.en.js，必须先于本文件加载。
 */
(function () {
  'use strict';

  const dict = {
    'zh': (window.I18N_ZH || {}),
    'en': (window.I18N_EN || {})
  };

  // localStorage 键名（新品牌 LFE = Laminar Flow Engineering；保留旧 rbr.lang 用于兼容老用户偏好）
  const STORAGE_KEYS = ['lfe.lang', 'rbr.lang'];

  function readSavedLang() {
    for (let i = 0; i < STORAGE_KEYS.length; i++) {
      try {
        const v = localStorage.getItem(STORAGE_KEYS[i]);
        if (v && dict[v]) return v;
      } catch (e) { /* ignore */ }
    }
    return null;
  }

  function writeSavedLang(lang) {
    try { localStorage.setItem(STORAGE_KEYS[0], lang); } catch (e) { /* ignore */ }
  }

  /**
   * 受信任 HTML 标签白名单 — 字典内容虽受控但保留深度防御。
   * 未来如从外部 API/用户输入注入翻译，可在此追加 escape 规则。
   * 使用构造函数而非字面量以避免 JS 解析器对 <\/ 序列的边界处理。
   * 注意 flags 必须作为第二参数传入（'i'），不能拼入 pattern 字符串，
   * 否则会被正则引擎当作字面字符，导致 .test() 永远返回 false。
   */
  const RICH_TEXT_TAGS = ['strong', 'em', 'b', 'i', 'u', 'br', 'sub', 'sup', 'small', 'code', 'span', 'mark'];
  const RICH_TEXT_PATTERN =
    '^(<' +
    '(\\/?(' + RICH_TEXT_TAGS.join('|') + ')( [^>]*)?>)' +
    '|[^<])' +
    '*$';
  const RICH_TEXT_ALLOWED = new RegExp(RICH_TEXT_PATTERN, 'i');

  function renderI18n(el, txt) {
    if (txt == null) return;
    if (typeof txt === 'string' && !RICH_TEXT_ALLOWED.test(txt)) {
      el.textContent = txt;
    } else {
      el.innerHTML = txt;
    }
  }

  let currentLang = 'zh';

  function applyLang(lang) {
    if (!dict[lang]) lang = 'zh';
    currentLang = lang;
    document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const txt = dict[lang][key];
      if (txt === undefined) return;
      renderI18n(el, txt);
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      const specs = el.getAttribute('data-i18n-attr').split(';');
      specs.forEach(function (spec) {
        const parts = spec.split(':');
        if (parts.length !== 2) return;
        const attr = parts[0].trim();
        const key = parts[1].trim();
        const txt = dict[lang][key];
        if (txt !== undefined) el.setAttribute(attr, txt);
      });
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      const active = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const titleEl = document.querySelector('title');
    if (titleEl) titleEl.textContent = dict[lang]['site.title'];
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', dict[lang]['site.description']);

    // 仅重渲 main 容器内的公式，避免整页扫描
    if (window.MathJax && MathJax.typesetPromise) {
      const mathRoot = document.querySelector('main') || document.body;
      try { MathJax.typesetPromise([mathRoot]); } catch (e) { /* ignore */ }
    }

    writeSavedLang(lang);
  }

  function init() {
    const saved = readSavedLang();
    if (saved) {
      currentLang = saved;
    } else {
      const browser = (navigator.language || 'zh').toLowerCase();
      currentLang = browser.startsWith('zh') ? 'zh' : 'en';
    }
    applyLang(currentLang);

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang-btn');
        applyLang(lang);
      });
    });

    window.setLang = applyLang;
    window.getLang = function () { return currentLang; };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
