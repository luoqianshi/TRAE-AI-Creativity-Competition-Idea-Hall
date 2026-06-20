/**
 * 页面限制保护：复制/粘贴、文本选中、附件下载、页面离开检测、反调试暂停。
 * 不介入切屏次数、人脸、截屏等其它监考逻辑。
 */
(function () {
  const STORAGE_KEY = 'autoDo-page-limit';
  const STYLE_ID = 'autoDo-page-limit-style';
  const MAIN_WORLD_SCRIPT_ID = 'autoDo-page-limit-main-world';

  let nativeHiddenDesc;
  let nativeVisibilityDesc;
  let originalDetected = null;
  let applied = {
    allowCopyPaste: false,
    allowTextSelect: false,
    allowMouseLeaveMonitor: false,
    allowDownload: false,
    allowDevTools: false,
  };
  let savedFieldValues = {};
  let mainWorldInjected = false;

  function readStoredState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function writeStoredState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function detectPageLimits() {
    const allowPasteEl = document.getElementById('allowPaste');
    const allowDownloadEl = document.getElementById('allowDownloadAttachment');
    const switchScreenEl = document.getElementById('switchScreenControl');

    const copyPasteRestricted = allowPasteEl ? allowPasteEl.value === '0' : false;
    const downloadRestricted = allowDownloadEl ? allowDownloadEl.value === '0' : false;
    const mouseLeaveMonitored = switchScreenEl ? switchScreenEl.value === '1' : false;

    let textSelectRestricted = false;
    const htmlStyle = document.documentElement && window.getComputedStyle(document.documentElement);
    const bodyStyle = document.body && window.getComputedStyle(document.body);
    if (
      (htmlStyle && htmlStyle.userSelect === 'none') ||
      (bodyStyle && bodyStyle.userSelect === 'none')
    ) {
      textSelectRestricted = true;
    }
    if (!textSelectRestricted) {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      for (const link of links) {
        const href = link.getAttribute('href') || '';
        if (/notAllowCopy/i.test(href)) {
          textSelectRestricted = true;
          break;
        }
      }
    }

    let debugToolRestricted = false;
    if (/exam-ans\/exam\//i.test(window.location.pathname || '')) {
      debugToolRestricted = true;
    }
    if (!debugToolRestricted) {
      const scripts = document.querySelectorAll('script[src]');
      for (const script of scripts) {
        const src = script.getAttribute('src') || '';
        if (/enc_js_exam/i.test(src)) {
          debugToolRestricted = true;
          break;
        }
      }
    }

    return {
      copyPasteRestricted,
      textSelectRestricted,
      downloadRestricted,
      mouseLeaveMonitored,
      debugToolRestricted,
    };
  }

  function getOriginalDetected() {
    if (!originalDetected) {
      originalDetected = detectPageLimits();
    }
    return originalDetected;
  }

  function refreshOriginalDetection() {
    originalDetected = detectPageLimits();
    return originalDetected;
  }

  function resolveToggleValue(key, detected, userOverride) {
    if (userOverride && typeof userOverride[key] === 'boolean') {
      return userOverride[key];
    }
    if (key === 'allowCopyPaste') return detected.copyPasteRestricted;
    if (key === 'allowTextSelect') return detected.textSelectRestricted;
    if (key === 'allowDownload') return detected.downloadRestricted;
    if (key === 'allowMouseLeaveMonitor') return detected.mouseLeaveMonitored;
    if (key === 'allowDevTools') return detected.debugToolRestricted;
    return false;
  }

  function getEffectiveState(userOverride) {
    const detected = getOriginalDetected();
    return {
      detected,
      allowCopyPaste: resolveToggleValue('allowCopyPaste', detected, userOverride),
      allowTextSelect: resolveToggleValue('allowTextSelect', detected, userOverride),
      allowMouseLeaveMonitor: resolveToggleValue('allowMouseLeaveMonitor', detected, userOverride),
      allowDownload: resolveToggleValue('allowDownload', detected, userOverride),
      allowDevTools: resolveToggleValue('allowDevTools', detected, userOverride),
    };
  }

  function setHiddenFieldValue(id, enabled) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!(id in savedFieldValues)) {
      savedFieldValues[id] = el.value;
    }
    if (enabled) {
      el.value = '1';
    } else if (savedFieldValues[id] !== undefined) {
      el.value = savedFieldValues[id];
    }
  }

  function installVisibilityOverride() {
    if (nativeHiddenDesc) return;
    try {
      nativeHiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
      nativeVisibilityDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: function () {
          return false;
        },
      });
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: function () {
          return 'visible';
        },
      });
    } catch (err) {
      console.warn('[AutoDo] 页面限制保护: 无法覆盖 visibility', err);
    }
  }

  function removeVisibilityOverride() {
    try {
      if (nativeHiddenDesc) {
        Object.defineProperty(document, 'hidden', nativeHiddenDesc);
      }
      if (nativeVisibilityDesc) {
        Object.defineProperty(document, 'visibilityState', nativeVisibilityDesc);
      }
    } catch (_) {}
    nativeHiddenDesc = null;
    nativeVisibilityDesc = null;
  }

  function onCopyPasteCapture(e) {
    if (!applied.allowCopyPaste) return;
    e.stopImmediatePropagation();
  }

  function onTextSelectCapture(e) {
    if (!applied.allowTextSelect) return;
    e.stopImmediatePropagation();
  }

  function injectMainWorldPatch() {
    if (mainWorldInjected || document.getElementById(MAIN_WORLD_SCRIPT_ID)) return;
    mainWorldInjected = true;

    const script = document.createElement('script');
    script.id = MAIN_WORLD_SCRIPT_ID;
    script.textContent = `(${function (storageKey) {
      function readEffective() {
        try {
          var raw = localStorage.getItem(storageKey);
          if (!raw) return {};
          return (JSON.parse(raw) || {}).effective || {};
        } catch (_) {
          return {};
        }
      }

      function isCopyPasteAllowed() {
        return !!readEffective().allowCopyPaste;
      }

      function isEditorPasteGuard(fn) {
        return !!(
          fn &&
          (fn === window.editorPaste ||
            fn.name === 'editorPaste' ||
            String(fn).indexOf('只能录入不能粘贴') !== -1)
        );
      }

      function cleanEditor(editor) {
        if (!editor || !editor.__allListeners || !editor.__allListeners.beforepaste) return;
        editor.__allListeners.beforepaste = editor.__allListeners.beforepaste.filter(function (fn) {
          return !isEditorPasteGuard(fn);
        });
      }

      function cleanAllEditors() {
        if (!isCopyPasteAllowed()) return;

        try {
          if (typeof window.editorPaste === 'function' && !window.editorPaste.__autoDoPatched) {
            var noop = function () {
              return true;
            };
            noop.__autoDoPatched = true;
            window.editorPaste = noop;
          }
        } catch (_) {}

        try {
          if (window.UE && window.UE.instants) {
            Object.keys(window.UE.instants).forEach(function (key) {
              cleanEditor(window.UE.instants[key]);
            });
          }
        } catch (_) {}
      }

      function patchUE() {
        if (!window.UE) return;

        if (window.UE.EventBase && window.UE.EventBase.prototype && !window.UE.EventBase.prototype.__autoDoPastePatched) {
          var originalAddListener = window.UE.EventBase.prototype.addListener;
          window.UE.EventBase.prototype.addListener = function (types, listener) {
            if (isCopyPasteAllowed() && String(types || '').split(/\\s+/).indexOf('beforepaste') !== -1 && isEditorPasteGuard(listener)) {
              return;
            }
            return originalAddListener.apply(this, arguments);
          };
          window.UE.EventBase.prototype.__autoDoPastePatched = true;
        }

        if (typeof window.UE.getEditor === 'function' && !window.UE.getEditor.__autoDoPastePatched) {
          var originalGetEditor = window.UE.getEditor;
          window.UE.getEditor = function () {
            var editor = originalGetEditor.apply(this, arguments);
            cleanEditor(editor);
            return editor;
          };
          window.UE.getEditor.__autoDoPastePatched = true;
        }
      }

      function tick() {
        patchUE();
        cleanAllEditors();
      }

      window.addEventListener('autoDoPageLimitChanged', tick);
      setInterval(tick, 500);
      tick();
    }.toString()})(${JSON.stringify(STORAGE_KEY)});`;

    (document.documentElement || document.head || document.body).appendChild(script);
    script.remove();
  }

  function applyStyle(enableSelect) {
    let style = document.getElementById(STYLE_ID);
    if (!enableSelect) {
      document.documentElement.classList.remove('autoDo-page-limit-select');
      if (style) style.remove();
      return;
    }
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.documentElement.appendChild(style);
    }
    style.textContent =
      'html.autoDo-page-limit-select, html.autoDo-page-limit-select * {' +
      '-webkit-user-select: text !important;' +
      'user-select: text !important;' +
      '-webkit-touch-callout: default !important;' +
      '}';
    document.documentElement.classList.add('autoDo-page-limit-select');
  }

  function apply(state) {
    const next = {
      allowCopyPaste: !!state.allowCopyPaste,
      allowTextSelect: !!state.allowTextSelect,
      allowMouseLeaveMonitor: !!state.allowMouseLeaveMonitor,
      allowDownload: !!state.allowDownload,
      allowDevTools: !!state.allowDevTools,
    };

    if (next.allowTextSelect !== applied.allowTextSelect) {
      applyStyle(next.allowTextSelect);
      applied.allowTextSelect = next.allowTextSelect;
    }

    if (next.allowCopyPaste !== applied.allowCopyPaste) {
      ['copy', 'cut', 'paste'].forEach((type) => {
        window.removeEventListener(type, onCopyPasteCapture, true);
        document.removeEventListener(type, onCopyPasteCapture, true);
      });
      if (next.allowCopyPaste) {
        ['copy', 'cut', 'paste'].forEach((type) => {
          window.addEventListener(type, onCopyPasteCapture, true);
          document.addEventListener(type, onCopyPasteCapture, true);
        });
        document.oncopy = null;
        document.oncut = null;
        document.onpaste = null;
        if (document.body) {
          document.body.oncopy = null;
          document.body.oncut = null;
          document.body.onpaste = null;
        }
      }
      applied.allowCopyPaste = next.allowCopyPaste;
    }

    ['selectstart', 'contextmenu'].forEach((type) => {
      window.removeEventListener(type, onTextSelectCapture, true);
      document.removeEventListener(type, onTextSelectCapture, true);
    });
    if (next.allowTextSelect) {
      ['selectstart', 'contextmenu'].forEach((type) => {
        window.addEventListener(type, onTextSelectCapture, true);
        document.addEventListener(type, onTextSelectCapture, true);
      });
      document.onselectstart = null;
      document.oncontextmenu = null;
      if (document.body) {
        document.body.onselectstart = null;
        document.body.oncontextmenu = null;
      }
    }

    if (next.allowCopyPaste) {
      setHiddenFieldValue('allowPaste', true);
    } else if (!next.allowCopyPaste && 'allowPaste' in savedFieldValues) {
      setHiddenFieldValue('allowPaste', false);
    }

    if (next.allowDownload) {
      setHiddenFieldValue('allowDownloadAttachment', true);
    } else if (!next.allowDownload && 'allowDownloadAttachment' in savedFieldValues) {
      setHiddenFieldValue('allowDownloadAttachment', false);
    }
    applied.allowDownload = next.allowDownload;
    applied.allowDevTools = next.allowDevTools;

    if (next.allowMouseLeaveMonitor !== applied.allowMouseLeaveMonitor) {
      if (!next.allowMouseLeaveMonitor) {
        installVisibilityOverride();
      } else {
        removeVisibilityOverride();
      }
      applied.allowMouseLeaveMonitor = next.allowMouseLeaveMonitor;
    }

    writeStoredState({
      userOverride: state.userOverride || null,
      effective: next,
      detected: state.detected || getOriginalDetected(),
      updatedAt: Date.now(),
    });
    try {
      window.dispatchEvent(new CustomEvent('autoDoPageLimitChanged'));
    } catch (_) {}
  }

  function initFromStorage() {
    const stored = readStoredState();
    if (stored && stored.effective) {
      apply({
        userOverride: stored.userOverride,
        detected: stored.detected,
        allowCopyPaste: stored.effective.allowCopyPaste,
        allowTextSelect: stored.effective.allowTextSelect,
        allowMouseLeaveMonitor: stored.effective.allowMouseLeaveMonitor,
        allowDownload: stored.effective.allowDownload,
        allowDevTools: stored.effective.allowDevTools,
      });
      return;
    }

    const detected = refreshOriginalDetection();
    const effective = getEffectiveState(null);
    apply(
      Object.assign({ userOverride: null, detected: detected }, effective, {
        detected: detected,
      })
    );
  }

  window.AutoDoPageLimitGuard = {
    STORAGE_KEY,
    detectPageLimits,
    getOriginalDetected,
    refreshOriginalDetection,
    getEffectiveState,
    apply,
    readStoredState,
    writeStoredState,
    initFromStorage,
  };

  initFromStorage();
})();
