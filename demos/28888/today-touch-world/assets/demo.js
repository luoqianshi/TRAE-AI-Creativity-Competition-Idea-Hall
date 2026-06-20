(function () {
  // ============ Task library ============
  // type: body / sense / micro / soft / adventure / words / blind
  var TASKS = {
    // 极低能量 · 不出门 · 不社交
    veryLow: [
      { t: '拉开窗帘，让自然光照在手背上停留 60 秒。', tag: 'SENSORY · 感官唤醒' },
      { t: '找一个很久没认真看过的物品，给它拍一张照片。', tag: 'MICRO · 微小成就' },
      { t: '完成一句话："今天虽然没什么大事，但我发现了______。"', tag: 'WORDS · 微小创作' },
      { t: '换一杯热水，慢慢喝完——只做这一件事。', tag: 'BODY · 身体开机' },
      { t: '打开窗户深呼吸三次，看一眼天空的颜色。', tag: 'SENSORY · 感官唤醒' },
      { t: '把手机放下两分钟，闭上眼睛听屋子里的声音。', tag: 'SENSORY · 感官唤醒' }
    ],
    // 低能量 · 可下楼 · 不社交
    low: [
      { t: '穿好鞋，下楼站 2 分钟，找一棵树看一会儿。', tag: 'BODY · 身体开机' },
      { t: '在小区里走 10 分钟，找一种平时没注意的声音。', tag: 'SENSORY · 感官唤醒' },
      { t: '给路过的一只猫、一朵花，或一个邮筒拍张照。', tag: 'MICRO · 微小成就' }
    ],
    // 中等能量 · 可下楼 · 轻度社交
    midSoft: [
      { t: '走一条平时没走过的小路。', tag: 'ADVENTURE · 现实微冒险' },
      { t: '找到今天最显眼的一种颜色并拍下来。', tag: 'SENSORY · 感官唤醒' },
      { t: '去便利店选一种没尝过的小食品，对店员说一句"谢谢"。', tag: 'SOFT TOUCH · 低压力连接' }
    ],
    // 中等能量 · 可下楼 · 不社交
    midNoSoc: [
      { t: '去一家没去过的咖啡店，点最简单的那杯。', tag: 'ADVENTURE · 现实微冒险' },
      { t: '在你常去的路上，找一个之前没注意过的细节拍下来。', tag: 'SENSORY · 感官唤醒' },
      { t: '给手机里某张老照片写一句话。', tag: 'WORDS · 微小创作' }
    ],
    // 高能量 · 可远走 · 可社交
    high: [
      { t: '坐一站不熟悉的公交车，到了哪里就在哪里下车。', tag: 'ADVENTURE · 现实微冒险' },
      { t: '挑一家路过却没进去过的小店，进去看一眼。', tag: 'ADVENTURE · 现实微冒险' },
      { t: '问一个店员一个真实的问题：你最推荐的是哪个？', tag: 'SOFT TOUCH · 低压力连接' },
      { t: '找一个公园长椅，坐 15 分钟，写下你听到的 3 件事。', tag: 'SENSORY · 感官唤醒' }
    ],
    // 生活盲盒（任意状态都可抽）
    blind: [
      { t: '寻找一扇你觉得"特别"的窗户，并拍下来。', tag: 'BLIND BOX · 生活盲盒' },
      { t: '拍下一处像电影画面的角落。', tag: 'BLIND BOX · 生活盲盒' },
      { t: '发现一种让你想到小时候的味道。', tag: 'BLIND BOX · 生活盲盒' },
      { t: '给一片你觉得好看的叶子拍照，记下今天的日期。', tag: 'BLIND BOX · 生活盲盒' },
      { t: '找一个让你愿意停下来 10 秒的声音。', tag: 'BLIND BOX · 生活盲盒' }
    ]
  };

  // ============ Degrade ladder per task (text → smaller text) ============
  // We use 4 levels by default; if the task already starts low, we still degrade.
  function buildLadder(text) {
    // Heuristic: shorten action by replacing high-effort verbs
    // Generic 4-step descent template
    return [
      text,
      softer(text, 1),
      softer(text, 2),
      softer(text, 3)
    ];
  }
  function softer(text, level) {
    // Simple deterministic softening map
    var map = [
      // L2
      [
        [/走\s*\d+\s*分钟/g, '走 2 分钟'],
        [/停留\s*\d+\s*秒/g, '停留 30 秒'],
        [/坐\s*\d+\s*分钟/g, '坐 5 分钟'],
        [/拍\s*张?\s*照片/g, '看一眼'],
        [/对店员说一句"谢谢"/g, '对店员点头致意'],
        [/挑一家.*?进去看一眼/g, '在店门口站 30 秒，看一眼里面'],
        [/坐一站不熟悉的公交车.*?下车/g, '走到公交站，看一下站牌名'],
        [/问.*?推荐.*?哪个？/g, '在店里走一圈，看一眼货架']
      ],
      // L3
      [
        [/走 2 分钟/g, '到门口站一会儿'],
        [/停留 30 秒/g, '停留 10 秒'],
        [/坐 5 分钟/g, '坐 1 分钟'],
        [/穿好鞋.*?树看一会儿/g, '穿好鞋，开门站在门口呼吸一下'],
        [/拉开窗帘.*?\d+\s*秒/g, '拉开窗帘，让光进来就好'],
        [/换一杯热水.*?完/g, '倒一杯水，喝一口'],
        [/打开窗户.*?颜色/g, '把窗户开一条缝'],
        [/找一个很久没认真看过的物品.*/g, '随手指一个东西，看它 10 秒'],
        [/找一种平时没注意的声音/g, '听一下屋子里现在的声音'],
        [/找一棵树看一会儿/g, '看一眼楼下的天空'],
        [/找一种.*?味道/g, '深呼吸一次，闻闻屋子里的味道'],
        [/找一片.*?叶子/g, '随手看向窗外的一处绿色'],
        [/写下.*?件事/g, '写一句"我现在听到 ____"'],
        [/到了哪里就在哪里下车/g, '走到楼下的站牌看一眼'],
        [/在店门口站 30 秒/g, '在那条街上站一会儿']
      ],
      // L4 — minimum
      [
        [/.*/, '深呼吸一次，告诉自己：今天这样就够了。']
      ]
    ];
    var rules = map[level - 1] || [];
    var out = text;
    for (var i = 0; i < rules.length; i++) {
      out = out.replace(rules[i][0], rules[i][1]);
    }
    return out;
  }

  // ============ State + selection logic ============
  var state = { energy: '1', out: '0', social: '0', time: '20', budget: '0' };
  var summaryEl = document.getElementById('state-summary');

  function updateSummary() {
    var e = ({1:'精力 1 格',2:'精力 2-3 格',3:'精力还行',4:'精力挺好'})[state.energy];
    var o = ({0:'不出门',1:'可下楼',2:'走远点'})[state.out];
    var s = ({0:'不社交',1:'轻度社交',2:'熟人聊天'})[state.social];
    summaryEl.textContent = e + ' · ' + o + ' · ' + s;
  }

  function pickPool() {
    var en = parseInt(state.energy);
    var out = parseInt(state.out);
    var soc = parseInt(state.social);
    if (en <= 1) return TASKS.veryLow;
    if (en === 2 && out === 0) return TASKS.veryLow;
    if (en === 2 && out >= 1 && soc === 0) return TASKS.low;
    if (en === 3 && soc === 0) return TASKS.midNoSoc;
    if (en === 3 && soc >= 1) return TASKS.midSoft;
    if (en >= 4) return TASKS.high;
    return TASKS.midSoft;
  }

  function generate(blind) {
    var pool = blind ? TASKS.blind : pickPool().slice();
    // shuffle
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var k = pool[i]; pool[i] = pool[j]; pool[j] = k;
    }
    var picked = pool.slice(0, 3);
    render(picked);
  }

  function render(items) {
    var box = document.getElementById('tasks');
    box.innerHTML = '';
    items.forEach(function (it, idx) {
      var el = document.createElement('div');
      el.className = 'task fade';
      el.innerHTML =
        '<div class="num">' + (idx + 1) + '</div>' +
        '<div class="body"><strong></strong><small>' + it.tag + '</small></div>' +
        '<div class="ease">我现在做不到 ↓</div>';
      el.querySelector('strong').textContent = it.t;
      var ladder = buildLadder(it.t);
      var lvl = 0;
      el.querySelector('.ease').addEventListener('click', function () {
        if (lvl < ladder.length - 1) {
          lvl++;
          el.querySelector('strong').textContent = ladder[lvl];
          el.classList.add('degraded');
          if (lvl === ladder.length - 1) {
            el.querySelector('.ease').textContent = '已是最小一步 ✦';
            el.querySelector('.ease').style.cursor = 'default';
          } else {
            el.querySelector('.ease').textContent = '还想再小一点 ↓';
          }
        }
      });
      box.appendChild(el);
    });
  }

  // ============ Event bindings ============
  document.querySelectorAll('.choices').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip'); if (!chip) return;
      var key = group.getAttribute('data-key');
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      state[key] = chip.getAttribute('data-v');
      updateSummary();
    });
  });

  document.getElementById('btn-gen').addEventListener('click', function () { generate(false); });
  document.getElementById('btn-blind').addEventListener('click', function () { generate(true); });

  // initial render
  updateSummary();
  generate(false);
})();
