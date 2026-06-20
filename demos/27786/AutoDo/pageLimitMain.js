/**
 * Runs in the page MAIN world so it can patch page-owned globals such as UE/editorPaste.
 * Also handles devtools anti-debug bypass when enabled in pageLimitGuard.js.
 */
(function () {
  const STORAGE_KEY = 'autoDo-page-limit';

  function readEffective() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return (JSON.parse(raw) || {}).effective || {};
    } catch (_) {
      return {};
    }
  }

  function isDevToolsAllowed() {
    const effective = readEffective();
    if (typeof effective.allowDevTools === 'boolean') {
      return effective.allowDevTools;
    }
    return /exam-ans\/exam\//i.test(window.location.pathname || '');
  }

  function sanitizeDebuggerCode(code) {
    return String(code).replace(/\bdebugger\b/g, 'void 0');
  }

  function safeFnToString(fn) {
    try {
      return Function.prototype.toString.call(fn);
    } catch (_) {
      return '';
    }
  }

  function shouldBypassDebuggerCallback(fn) {
    return isDevToolsAllowed() && typeof fn === 'function' && /\bdebugger\b/.test(safeFnToString(fn));
  }

  function installDevToolsBypass() {
    if (window.__autoDoDevToolsBypassCore) return;
    window.__autoDoDevToolsBypassCore = true;

    const NativeFunction = Function;
    const functionProxy = function (...args) {
      if (isDevToolsAllowed() && args.length) {
        const lastIndex = args.length - 1;
        if (typeof args[lastIndex] === 'string') {
          args = args.slice();
          args[lastIndex] = sanitizeDebuggerCode(args[lastIndex]);
        }
      }
      return NativeFunction.apply(this, args);
    };
    functionProxy.prototype = NativeFunction.prototype;
    try {
      Object.defineProperty(functionProxy, 'name', { value: 'Function' });
      Object.defineProperty(functionProxy, 'length', { value: NativeFunction.length });
    } catch (_) {}
    window.Function = functionProxy;

    const nativeEval = window.eval;
    window.eval = function (code) {
      if (isDevToolsAllowed() && typeof code === 'string') {
        code = sanitizeDebuggerCode(code);
      }
      return nativeEval.call(this, code);
    };

    ['setInterval', 'setTimeout'].forEach((name) => {
      const native = window[name];
      if (!native || native.__autoDoDevToolsPatched) return;
      const wrapped = function (handler, delay) {
        let fn = handler;
        if (shouldBypassDebuggerCallback(fn)) {
          fn = function autoDoDevToolsNoop() {};
        }
        return native.apply(this, [fn, delay].concat([].slice.call(arguments, 2)));
      };
      wrapped.__autoDoDevToolsPatched = true;
      window[name] = wrapped;
    });
  }

  installDevToolsBypass();

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

  function patchEditorPasteGlobal() {
    if (!isCopyPasteAllowed()) return;
    if (typeof window.editorPaste !== 'function' || window.editorPaste.__autoDoPatched) return;

    const noop = function () {
      return true;
    };
    noop.__autoDoPatched = true;
    window.editorPaste = noop;
  }

  function cleanEditor(editor) {
    if (!editor || !editor.__allListeners || !editor.__allListeners.beforepaste) return;
    editor.__allListeners.beforepaste = editor.__allListeners.beforepaste.filter((fn) => {
      return !(isCopyPasteAllowed() && isEditorPasteGuard(fn));
    });
  }

  function cleanAllEditors() {
    if (!isCopyPasteAllowed()) return;
    patchEditorPasteGlobal();

    try {
      if (window.UE && window.UE.instants) {
        Object.keys(window.UE.instants).forEach((key) => {
          cleanEditor(window.UE.instants[key]);
        });
      }
    } catch (_) {}
  }

  function patchUEEventBase() {
    if (!window.UE || !window.UE.EventBase || !window.UE.EventBase.prototype) return;
    const proto = window.UE.EventBase.prototype;
    if (proto.__autoDoPastePatched) return;

    const originalAddListener = proto.addListener;
    proto.addListener = function (types, listener) {
      const typeList = String(types || '').split(/\s+/);
      if (
        isCopyPasteAllowed() &&
        typeList.indexOf('beforepaste') !== -1 &&
        isEditorPasteGuard(listener)
      ) {
        return;
      }
      return originalAddListener.apply(this, arguments);
    };

    const originalFireEvent = proto.fireEvent;
    proto.fireEvent = function () {
      if (isCopyPasteAllowed() && arguments[0] === 'beforepaste') {
        cleanEditor(this);
      }
      return originalFireEvent.apply(this, arguments);
    };

    proto.__autoDoPastePatched = true;
  }

  function patchUEGetEditor() {
    if (!window.UE || typeof window.UE.getEditor !== 'function') return;
    if (window.UE.getEditor.__autoDoPastePatched) return;

    const originalGetEditor = window.UE.getEditor;
    window.UE.getEditor = function () {
      const editor = originalGetEditor.apply(this, arguments);
      cleanEditor(editor);
      return editor;
    };
    window.UE.getEditor.__autoDoPastePatched = true;
  }

  function tick() {
    patchEditorPasteGlobal();
    patchUEEventBase();
    patchUEGetEditor();
    cleanAllEditors();
  }

  window.addEventListener('autoDoPageLimitChanged', tick);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) tick();
  });

  setInterval(tick, 250);
  tick();

  if (!window.__autoDoImageBridgeReady) {
    window.__autoDoImageBridgeReady = true;

    const MSG_REQUEST = 'autoDoImageFetchRequest';
    const MSG_RESULT = 'autoDoImageFetchResult';

    function blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.onerror = function () {
          reject(new Error('图片解码失败'));
        };
        reader.readAsDataURL(blob);
      });
    }

    async function fetchImageDataUrl(url, cacheOnly) {
      const res = await fetch(url, {
        credentials: 'include',
        cache: cacheOnly ? 'only-if-cached' : 'force-cache',
      });
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      return blobToDataUrl(await res.blob());
    }

    window.addEventListener('message', function (event) {
      if (event.source !== window || !event.data || event.data.type !== MSG_REQUEST) return;

      const requestId = event.data.requestId;
      const url = event.data.url;
      const cacheOnly = !!event.data.cacheOnly;

      function reply(detail) {
        window.postMessage(
          Object.assign({ type: MSG_RESULT, requestId: requestId }, detail),
          '*'
        );
      }

      fetchImageDataUrl(url, cacheOnly)
        .then(function (dataUrl) {
          reply({ ok: true, dataUrl: dataUrl });
        })
        .catch(function (err) {
          reply({ ok: false, error: (err && err.message) || '读取失败' });
        });
    });
  }
})();
