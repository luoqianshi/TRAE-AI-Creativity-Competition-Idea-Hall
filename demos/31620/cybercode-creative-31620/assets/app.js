(function () {
  'use strict';

  // --- Mermaid init ---
  try {
    if (window.mermaid && typeof window.mermaid.initialize === 'function') {
      window.mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose'
      });
    }
  } catch (e) {
    // no-op
  }

  // --- Faction interaction ---
  var factionData = {
    netwatch: {
      role: '防御型 · 适配：端侧硬件安全基线',
      title: 'NetWatch',
      body:
        '把“安全”做成端侧硬件协同的第一层：设备接入时自动做风险指纹、固件与协议审计、异常行为检测，并在批量部署时提供可回滚的修复策略。'
    },
    voodoo: {
      role: '解析型 · 适配：协议/神经链接研究',
      title: '巫毒帮',
      body:
        '面向深层网络与旧网研究：黑墙破解、神经链接协议解析、碎片数据解码、流浪 AI 交互。它更像“深网译码器”，把未知接口变成可调用能力。'
    },
    bartmoss: {
      role: '渗透型 · 适配：企业内网与设备侧通道',
      title: '巴特莫斯集体',
      body:
        '企业内网匿名渗透、权限绕过、无痕后门部署、批量数据爬取。放到端侧协同里，它负责“找路与打通链路”，让设备在复杂网络里仍能被统一调度。'
    },
    arasaka: {
      role: '加密型 · 适配：人格/记忆/神经数据',
      title: '荒坂网络部',
      body:
        '神经加密与数字永生方向：Relic 芯片解析、神舆系统模拟、人格存储迁移。它把高阶数据结构与加密策略沉到终端里，成为可复用的能力模块。'
    },
    militech: {
      role: '军工型 · 适配：集群调度与高强度攻防',
      title: '军用科技',
      body:
        '军工级网络与智能武器开发：战地集群调度、无人机劫持、军工加密解析。映射到 CyberCode，它是“规模化执行”的能力来源。'
    },
    nightcorp: {
      role: '城市底层 · 适配：IoT 与神经底层控制',
      title: '夜氏网络科',
      body:
        '城市基建与神经底层操控：物联网劫持、隐形后门调试、轻量化记忆模拟。它让终端具备“控制城市级系统”的想象空间与接口抽象。'
    },
    solo: {
      role: '入门通用 · 适配：学习、脚本、基础调试',
      title: '孤网行者',
      body:
        '免费通用编码体系：基础脚本、业务代码生成与简易调试。它是所有用户进入体系的入口，也是最小可用的端侧控制脚本层。'
    }
  };

  var cardsWrap = document.getElementById('faction-cards');
  var detail = document.getElementById('faction-detail');

  function setActiveCard(card) {
    if (!card) return;
    var key = card.getAttribute('data-key');
    var data = factionData[key];
    if (!data) return;

    var cards = cardsWrap ? cardsWrap.querySelectorAll('.card') : [];
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove('active');
    card.classList.add('active');

    if (detail) {
      detail.innerHTML =
        '<div class="line">权限风格：<span class="pill">' +
        escapeHtml(data.role) +
        '</span></div>' +
        '<h3>' +
        escapeHtml(data.title) +
        '</h3>' +
        '<p>' +
        escapeHtml(data.body) +
        '<sup><a href="#cite-1">[1]</a></sup>' +
        '</p>';
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function onCardActivate(e) {
    var el = e.target;
    var card = el && el.closest ? el.closest('.card') : null;
    if (card) setActiveCard(card);
  }

  if (cardsWrap) {
    cardsWrap.addEventListener('click', onCardActivate);
    cardsWrap.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target && e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      e.preventDefault();
      setActiveCard(card);
    });
  }

  // --- CLI demo ---
  var cli = document.getElementById('cli-output');
  if (cli) {
    var lines = [
      '<span class="muted">link://night-city … ok</span>',
      '<span class="prompt">$</span> cybercode init night-city',
      '<span class="ok">✓</span> profile loaded: <span class="pill">T3</span> <span class="pill magenta">巫毒帮</span> / <span class="pill">NetWatch</span>',
      '<span class="prompt">$</span> cybercode device scan --nearby',
      '<span class="ok">✓</span> found 3 devices: optic-eye-01, mech-arm-02, neuro-link-07',
      '<span class="prompt">$</span> cybercode device pair --id mech-arm-02',
      '<span class="ok">✓</span> paired: mech-arm-02 (protocol: CAN+BLE, policy: NetWatch)',
      '<span class="prompt">$</span> cybercode compose --scenario \"协同义体动作\" --devices optic-eye-01,mech-arm-02',
      '<span class="ok">✓</span> generated: /scenes/gesture_sync.cy',
      '<span class="prompt">$</span> cybercode build --target prosthetics --batch --strategy canary',
      '<span class="ok">✓</span> build: 2 artifacts, signed',
      '<span class="prompt">$</span> cybercode deploy --batch --rollback-point auto',
      '<span class="warn">!</span> mech-arm-02 latency spike detected → apply safe mode',
      '<span class="ok">✓</span> rollout complete (1/2 safe mode) · report written to audit log'
    ];

    var i = 0;
    cli.innerHTML = '';

    function pushLine() {
      if (i >= lines.length) return;
      var div = document.createElement('div');
      div.innerHTML = lines[i++];
      cli.appendChild(div);
      cli.parentElement.scrollTop = cli.parentElement.scrollHeight;
      window.setTimeout(pushLine, 520);
    }

    window.setTimeout(pushLine, 650);
  }
})();

