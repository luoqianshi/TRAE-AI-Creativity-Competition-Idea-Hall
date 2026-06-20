(function () {
  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  var scenarios = {
    elder: {
      label: '老人陪伴',
      mode: '交互（移动）模式',
      status: '用户正在手动遥控小车',
      screen: '小跑处于远程遥控中',
      phoneTitle: '远程手动控制',
      phoneSub: '通过前进、后退、左转、右转查看家中情况',
      command: '前进 / 后退 / 左转 / 右转',
      textPlaceholder: '例如：爷爷，我来看你啦，记得按时吃药。',
      textHint: '老人陪伴场景建议播报：爷爷，我来看你啦，记得按时吃药。',
      defaultText: '爷爷，我来看你啦，记得按时吃药。',
      image: 'assets/demo_grandpa_remote_v2.jpg',
      imageAlt: '爷爷陪伴场景示意图',
      log: [
        '子女打开 App，选择老人陪伴场景',
        '用户通过方向键手动控制小车移动',
        '选择已生成的家人定制音色',
        '顶屏显示来电身份，等待接听'
      ],
      stage: '手动遥控与通话',
      privacy: '摄像头开启 · 顶屏提示中',
      action: '用定制音色问候'
    },
    pet: {
      label: '宠物陪伴',
      mode: '交互（移动）模式',
      status: '用户正在手动遥控查看',
      screen: '小跑处于远程遥控中',
      phoneTitle: '远程手动查看宠物',
      phoneSub: '通过方向键控制小车前进、后退、左转、右转',
      command: '播放主人定制音色：小橘过来',
      textPlaceholder: '例如：小橘，过来看看我，乖乖待在家里哦。',
      textHint: '宠物陪伴场景建议播报：小橘，过来看看我，乖乖待在家里哦。',
      defaultText: '小橘，过来看看我，乖乖待在家里哦。',
      image: 'assets/demo_pet_remote.jpg',
      imageAlt: '宠物陪伴场景示意图',
      log: [
        '主人远程进入宠物陪伴场景',
        '用户手动控制小车前进、后退、左转、右转',
        '选择主人自定义录制的声音素材',
        '生成定制音色并播放呼唤'
      ],
      stage: '手动查看与呼唤',
      privacy: '仅开启摄像头 · 麦克风关闭',
      action: '播放定制音色'
    },
    still: {
      label: '静止陪伴',
      mode: '静默模式（AI助手）',
      status: '固定停靠在床头柜旁',
      screen: '小跑正在陪伴中',
      phoneTitle: '固定视角陪伴',
      phoneSub: '适合用家人音色做吃药提醒和简短问候',
      command: '19:30 用家人定制音色播报吃药提醒',
      textPlaceholder: '例如：爷爷，现在该休息啦，有事可以按呼叫按钮。',
      textHint: '静止陪伴场景建议播报：爷爷，现在该休息啦，有事可以按呼叫按钮。',
      defaultText: '爷爷，现在该休息啦，有事可以按呼叫按钮。',
      image: 'assets/demo_still_assistant.jpg',
      imageAlt: '静止陪伴场景示意图',
      log: [
        '家人选择静止陪伴场景',
        '选择自定义录制生成的家人音色',
        '小车停靠在床头柜旁不移动',
        '到点后顶屏亮起并用定制音色播报提醒'
      ],
      stage: '提醒与陪伴',
      privacy: '移动关闭 · 语音提醒开启',
      action: '设置音色提醒'
    }
  };

  function renderScenario(key) {
    var data = scenarios[key] || scenarios.elder;
    $all('[data-scenario]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-scenario') === key);
    });
    $('#demo-mode').textContent = data.mode;
    $('#demo-status').textContent = data.status;
    $('#demo-screen').textContent = data.screen;
    $('#phone-title').textContent = data.phoneTitle;
    $('#phone-sub').textContent = data.phoneSub;
    $('#command-text').textContent = data.command;
    $('#stage-text').textContent = data.stage;
    $('#privacy-text').textContent = data.privacy;
    $('#primary-action').textContent = data.action;
    var stage = $('#demo-stage');
    if (stage) {
      stage.className = 'car-stage scene-' + key;
    }
    var input = $('#custom-text');
    if (input) {
      input.placeholder = data.textPlaceholder;
      if (!input.value.trim()) {
        input.value = '';
      }
    }
    var hint = $('#text-suggestion');
    if (hint) {
      hint.textContent = data.textHint;
    }
    var sceneImg = $('#demo-scene-img');
    if (sceneImg) {
      sceneImg.src = data.image;
      sceneImg.alt = data.imageAlt;
    }
    $('#demo-log').innerHTML = data.log.map(function (item, index) {
      return '<li><span>' + String(index + 1).padStart(2, '0') + '</span>' + item + '</li>';
    }).join('');
  }

  function bindPrototypeToggles() {
    $all('[data-panel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-panel');
        $all('[data-panel]').forEach(function (item) {
          item.classList.toggle('active', item === btn);
        });
        $all('.proto-screen').forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-screen') === target);
        });
      });
    });
  }

  function bindScenarioButtons() {
    $all('[data-scenario]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        renderScenario(btn.getAttribute('data-scenario'));
      });
    });
  }

  function bindTextPlayer() {
    var input = $('#custom-text');
    var button = $('#play-text');
    if (!input || !button) return;

    button.addEventListener('click', function () {
      var activeButton = $all('[data-scenario]').find(function (btn) {
        return btn.classList.contains('active');
      });
      var activeKey = activeButton ? activeButton.getAttribute('data-scenario') : 'elder';
      var current = scenarios[activeKey] || scenarios.elder;
      var text = input.value.trim() || current.defaultText;
      $('#command-text').textContent = '播放输入文本：' + text;
      $('#phone-sub').textContent = '已将输入文本发送给小车，准备使用定制音色播报';
      $('#demo-screen').textContent = '小跑正在播放文本';

      var log = $('#demo-log');
      var index = log ? log.querySelectorAll('li').length + 1 : 1;
      if (log) {
        var item = document.createElement('li');
        item.innerHTML = '<span>' + String(index).padStart(2, '0') + '</span>播放输入文本：' + text;
        log.appendChild(item);
      }
    });
  }

  function initMermaid() {
    if (window.mermaid) {
      var style = getComputedStyle(document.documentElement);
      var bg2 = style.getPropertyValue('--bg2').trim();
      var panel = style.getPropertyValue('--panel').trim();
      var ink = style.getPropertyValue('--ink').trim();
      var muted = style.getPropertyValue('--muted').trim();
      var rule = style.getPropertyValue('--rule').trim();
      var accent = style.getPropertyValue('--accent').trim();
      var accent2 = style.getPropertyValue('--accent2').trim();
      window.mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
          background: bg2,
          primaryColor: panel,
          primaryTextColor: ink,
          primaryBorderColor: accent,
          lineColor: accent,
          secondaryColor: bg2,
          tertiaryColor: panel,
          textColor: ink,
          nodeTextColor: ink,
          edgeLabelBackground: bg2,
          clusterBkg: panel,
          clusterBorder: rule,
          fontFamily: 'Instrument, system-ui, sans-serif',
          noteBkgColor: panel,
          noteTextColor: muted,
          noteBorderColor: accent2
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindScenarioButtons();
    bindPrototypeToggles();
    bindTextPlayer();
    renderScenario('elder');
    initMermaid();
  });
})();
