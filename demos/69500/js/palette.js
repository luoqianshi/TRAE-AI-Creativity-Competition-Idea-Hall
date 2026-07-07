(function () {
  // 可选颜色池
  var COLOR_POOL = [
    '#0a0e12', '#0f1419', '#1a2028', '#232c38', '#2d3845',
    '#e8e6e0', '#f8f6f0', '#ffffff', '#8a949f', '#5a6470',
    '#f0a040', '#d48820', '#ffc070', '#ff8c42', '#ff6b35',
    '#3db5d0', '#2a9ab5', '#7ed8ea', '#5b8c5a', '#d49080',
    '#9b59b6', '#e74c3c', '#3498db', '#1abc9c', '#f39c12',
    '#e91e63', '#00bcd4', '#8bc34a', '#ff5722', '#673ab7'
  ];

  // 主题角色：CSS 变量名 -> 中文名
  var THEME_ROLES = [
    { key: 'bg', label: '背景', vars: ['--bg', '--bg-dark'], default: '#0f1419' },
    { key: 'card', label: '卡片', vars: ['--bg2'], default: '#1a2028' },
    { key: 'input', label: '输入', vars: ['--bg3'], default: '#232c38' },
    { key: 'accent', label: '主色', vars: ['--accent', '--accent-dark', '--accent-light'], default: '#f0a040' },
    { key: 'accent2', label: '副色', vars: ['--accent2', '--accent2-light'], default: '#3db5d0' },
    { key: 'ink', label: '文字', vars: ['--ink'], default: '#e8e6e0' },
    { key: 'muted', label: '次文字', vars: ['--muted'], default: '#8a949f' },
    { key: 'rule', label: '边框', vars: ['--rule'], default: '#2d3845' }
  ];

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  function hexToRgba(hex, alpha) {
    var rgb = hexToRgb(hex);
    return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
  }

  // 保存原始值用于重置
  var originalValues = {};

  function init() {
    var toggle = document.getElementById('palette-toggle');
    var panel = document.getElementById('palette-panel');
    if (!toggle || !panel) return;

    var root = document.documentElement;
    var currentRole = THEME_ROLES[3]; // 默认选中"主色"

    // 保存原始 CSS 变量值
    THEME_ROLES.forEach(function (role) {
      originalValues[role.key] = role.default;
      role.vars.forEach(function (v) {
        var val = getComputedStyle(root).getPropertyValue(v).trim();
        if (val) originalValues[role.key] = val;
      });
    });

    // 构建角色选择栏
    var rolesBar = document.createElement('div');
    rolesBar.className = 'palette-roles';
    THEME_ROLES.forEach(function (role) {
      var btn = document.createElement('button');
      btn.className = 'palette-role-btn';
      btn.dataset.role = role.key;
      btn.innerHTML = '<span class="role-dot" style="background:' + originalValues[role.key] + ';"></span>' + role.label;
      btn.addEventListener('click', function () {
        currentRole = role;
        document.querySelectorAll('.palette-role-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        updateDetail(role);
      });
      rolesBar.appendChild(btn);
    });
    // 默认选中主色
    rolesBar.querySelector('.palette-role-btn').classList.remove('active');
    var accentBtn = rolesBar.querySelector('[data-role="accent"]');
    if (accentBtn) accentBtn.classList.add('active');

    // 构建色块网格
    var swatchesContainer = document.createElement('div');
    swatchesContainer.className = 'palette-swatches';
    COLOR_POOL.forEach(function (hex) {
      var sw = document.createElement('div');
      sw.className = 'palette-swatch';
      sw.style.background = hex;
      sw.title = hex.toUpperCase();
      sw.dataset.hex = hex;
      sw.addEventListener('click', function () {
        applyColor(currentRole, hex);
      });
      swatchesContainer.appendChild(sw);
    });

    // 构建详情区
    var detail = document.createElement('div');
    detail.className = 'palette-detail';
    detail.id = 'palette-detail';
    detail.innerHTML =
      '<div class="palette-color-preview" id="palette-preview"></div>' +
      '<div class="palette-color-name" id="palette-name"><span class="dot" id="palette-name-dot"></span><span id="palette-name-text">主色</span></div>' +
      '<div class="palette-values">' +
        '<div class="palette-row"><span class="palette-label">HEX</span><span class="palette-value" id="palette-hex">-</span><button class="palette-copy" data-copy="hex">复制</button></div>' +
        '<div class="palette-row"><span class="palette-label">RGB</span><span class="palette-value" id="palette-rgb">-</span><button class="palette-copy" data-copy="rgb">复制</button></div>' +
      '</div>' +
      '<div class="palette-actions">' +
        '<button class="palette-reset-btn" id="palette-reset">重置主题</button>' +
      '</div>';

    // 清空旧内容，注入新结构
    var panelContent = document.getElementById('palette-panel');
    panelContent.innerHTML = '';
    panelContent.appendChild(rolesBar);
    panelContent.appendChild(swatchesContainer);
    panelContent.appendChild(detail);

    // 更新详情区显示
    function updateDetail(role) {
      var hex = originalValues[role.key];
      var rgb = hexToRgb(hex);
      document.getElementById('palette-preview').style.background = hex;
      document.getElementById('palette-name-text').textContent = role.label;
      document.getElementById('palette-name-dot').style.background = hex;
      document.getElementById('palette-hex').textContent = hex.toUpperCase();
      document.getElementById('palette-rgb').textContent = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
      document.getElementById('palette-hex').dataset.value = hex;
      document.getElementById('palette-rgb').dataset.value = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';

      // 高亮当前色块
      document.querySelectorAll('.palette-swatch').forEach(function (s) {
        s.classList.toggle('selected', s.dataset.hex.toLowerCase() === hex.toLowerCase());
      });

      // 更新角色按钮上的小圆点
      document.querySelectorAll('.palette-role-btn').forEach(function (b) {
        if (b.dataset.role === role.key) {
          var dot = b.querySelector('.role-dot');
          if (dot) dot.style.background = hex;
        }
      });
    }

    // 应用颜色到 CSS 变量
    function applyColor(role, hex) {
      var upperHex = hex.toUpperCase();
      var rgb = hexToRgb(hex);

      role.vars.forEach(function (varName) {
        root.style.setProperty(varName, hex);
      });

      // 联动更新 soft 变量
      if (role.key === 'accent') {
        root.style.setProperty('--accent-soft', hexToRgba(hex, 0.12));
      } else if (role.key === 'accent2') {
        root.style.setProperty('--accent2-soft', hexToRgba(hex, 0.12));
      } else if (role.key === 'card' || role.key === 'bg') {
        root.style.setProperty('--bg-dark', hex);
      }

      // 更新详情
      document.getElementById('palette-preview').style.background = hex;
      document.getElementById('palette-name-text').textContent = role.label;
      document.getElementById('palette-name-dot').style.background = hex;
      document.getElementById('palette-hex').textContent = upperHex;
      document.getElementById('palette-rgb').textContent = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
      document.getElementById('palette-hex').dataset.value = hex;
      document.getElementById('palette-rgb').dataset.value = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';

      // 高亮色块
      document.querySelectorAll('.palette-swatch').forEach(function (s) {
        s.classList.toggle('selected', s.dataset.hex.toLowerCase() === hex.toLowerCase());
      });

      // 更新角色按钮上的小圆点
      document.querySelectorAll('.palette-role-btn').forEach(function (b) {
        if (b.dataset.role === role.key) {
          var dot = b.querySelector('.role-dot');
          if (dot) dot.style.background = hex;
        }
      });

      showToast(role.label + ' 已更新为 ' + upperHex);
    }

    // 初始化详情
    updateDetail(currentRole);

    // 重置按钮
    document.getElementById('palette-reset').addEventListener('click', function () {
      THEME_ROLES.forEach(function (role) {
        var hex = originalValues[role.key];
        role.vars.forEach(function (varName) {
          root.style.setProperty(varName, hex);
        });
        if (role.key === 'accent') {
          root.style.setProperty('--accent-soft', hexToRgba(hex, 0.12));
        } else if (role.key === 'accent2') {
          root.style.setProperty('--accent2-soft', hexToRgba(hex, 0.12));
        }
      });
      updateDetail(currentRole);
      // 更新所有角色按钮的小圆点
      THEME_ROLES.forEach(function (role) {
        var btn = document.querySelector('[data-role="' + role.key + '"]');
        if (btn) {
          var dot = btn.querySelector('.role-dot');
          if (dot) dot.style.background = originalValues[role.key];
        }
      });
      showToast('主题已重置');
    });

    // 切换展开/收起
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('show');
      toggle.classList.toggle('active');
    });

    // 点击外部收起
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.palette-widget')) {
        panel.classList.remove('show');
        toggle.classList.remove('active');
      }
    });

    // 复制功能
    panel.addEventListener('click', function (e) {
      var btn = e.target.closest('.palette-copy');
      if (!btn) return;
      var type = btn.dataset.copy;
      var valueEl = type === 'hex' ? document.getElementById('palette-hex') : document.getElementById('palette-rgb');
      var value = valueEl.dataset.value || valueEl.textContent;
      copyToClipboard(value);
      btn.classList.add('copied');
      btn.textContent = '已复制';
      showToast('已复制: ' + value);
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.textContent = '复制';
      }, 1500);
    });

    function copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    }

    function showToast(msg) {
      var existing = document.querySelector('.palette-toast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.className = 'palette-toast';
      toast.textContent = msg;
      document.body.appendChild(toast);
      requestAnimationFrame(function () {
        toast.classList.add('show');
      });
      setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 200);
      }, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
