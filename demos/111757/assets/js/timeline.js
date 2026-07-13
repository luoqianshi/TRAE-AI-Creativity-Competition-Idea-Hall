// timeline.js - 帝王一日时间轴
// 十二时辰 + 初正细分,覆盖完整 24 小时
// 配色:寅/卯/辰/巳/午/未/申/酉/戌/亥 12 段,每段 2h,初/正各 1h

const Timeline = (() => {
  // 24 段,每段 1 小时,初/正细分
  // 时间区间 [start, end),end 可为 24(代表次日 0 点)
  const STAGES = [
    // 子(23:00-01:00)
    { id: 'zi-chu', shichen: '子', part: '初', label: '夜半安寝', icon: '🌙', range: [23, 24], color: '#1A1A1A', type: 'rest' },
    { id: 'zi-zheng', shichen: '子', part: '正', label: '夜半安寝', icon: '🌙', range: [0, 1], color: '#1A1A1A', type: 'rest' },
    // 丑(01:00-03:00)
    { id: 'chou-chu', shichen: '丑', part: '初', label: '鸡鸣深眠', icon: '🛌', range: [1, 2], color: '#2A2A3A', type: 'rest' },
    { id: 'chou-zheng', shichen: '丑', part: '正', label: '鸡鸣深眠', icon: '🛌', range: [2, 3], color: '#2A2A3A', type: 'rest' },
    // 寅(03:00-05:00)
    { id: 'yin-chu', shichen: '寅', part: '初', label: '内侍备驾', icon: '🕯️', range: [3, 4], color: '#7B4A3A', type: 'prepare' },
    { id: 'yin-zheng', shichen: '寅', part: '正', label: '御驾起身', icon: '🌅', range: [4, 5], color: '#A4243B', type: 'wake' },
    // 卯(05:00-07:00)
    { id: 'mao-chu', shichen: '卯', part: '初', label: '御书房早读', icon: '📖', range: [5, 6], color: '#7BA67D', type: 'study' },
    { id: 'mao-zheng', shichen: '卯', part: '正', label: '御书房早读', icon: '📖', range: [6, 7], color: '#7BA67D', type: 'study' },
    // 辰(07:00-09:00)
    { id: 'chen-chu', shichen: '辰', part: '初', label: '御膳早膳', icon: '🍵', range: [7, 8], color: '#D4A24C', type: 'life' },
    { id: 'chen-zheng', shichen: '辰', part: '正', label: '御膳早膳', icon: '🍵', range: [8, 9], color: '#D4A24C', type: 'life' },
    // 巳(09:00-11:00)
    { id: 'si-chu', shichen: '巳', part: '初', label: '御门听政', icon: '📜', range: [9, 10], color: '#A4243B', type: 'work' },
    { id: 'si-zheng', shichen: '巳', part: '正', label: '御门听政', icon: '📜', range: [10, 11], color: '#A4243B', type: 'work' },
    // 午(11:00-13:00)
    { id: 'wu-chu', shichen: '午', part: '初', label: '午朝议事', icon: '⛩️', range: [11, 12], color: '#C8A45C', type: 'work' },
    { id: 'wu-zheng', shichen: '午', part: '正', label: '午膳休憩', icon: '🍱', range: [12, 13], color: '#C8A45C', type: 'rest' },
    // 未(13:00-15:00)
    { id: 'wei-chu', shichen: '未', part: '初', label: '书房理政', icon: '🖌️', range: [13, 14], color: '#5C6E7A', type: 'work' },
    { id: 'wei-zheng', shichen: '未', part: '正', label: '书房理政', icon: '🖌️', range: [14, 15], color: '#5C6E7A', type: 'work' },
    // 申(15:00-17:00)
    { id: 'shen-chu', shichen: '申', part: '初', label: '御批奏章', icon: '✍️', range: [15, 16], color: '#7B5A3A', type: 'todo' },
    { id: 'shen-zheng', shichen: '申', part: '正', label: '御批奏章', icon: '✍️', range: [16, 17], color: '#7B5A3A', type: 'todo' },
    // 酉(17:00-19:00)
    { id: 'you-chu', shichen: '酉', part: '初', label: '晚课静修', icon: '🧘', range: [17, 18], color: '#8B6F47', type: 'review' },
    { id: 'you-zheng', shichen: '酉', part: '正', label: '晚课静修', icon: '🧘', range: [18, 19], color: '#8B6F47', type: 'review' },
    // 戌(19:00-21:00)
    { id: 'xu-chu', shichen: '戌', part: '初', label: '宫闱休闲', icon: '🎭', range: [19, 20], color: '#C8A45C', type: 'leisure' },
    { id: 'xu-zheng', shichen: '戌', part: '正', label: '宫闱休闲', icon: '🎭', range: [20, 21], color: '#C8A45C', type: 'leisure' },
    // 亥(21:00-23:00)
    { id: 'hai-chu', shichen: '亥', part: '初', label: '安寝就寝', icon: '🛏️', range: [21, 22], color: '#2A2A3A', type: 'rest' },
    { id: 'hai-zheng', shichen: '亥', part: '正', label: '安寝就寝', icon: '🛏️', range: [22, 23], color: '#1A1A1A', type: 'rest' }
  ];

  let lastShichenNotified = null;
  let onStageChangeCallbacks = [];

  // 给定小时数,找当前阶段
  function getCurrentStage(date) {
    const h = date.getHours();
    const m = date.getMinutes();
    // 23:00-24:00 是子初,0:00-1:00 是子正
    return STAGES.find(s => {
      if (s.range[0] === 23) {
        return h === 23;
      }
      return h >= s.range[0] && h < s.range[1];
    }) || STAGES[0];
  }

  function getStageProgress(date) {
    const stage = getCurrentStage(date);
    if (!stage) return { stage: null, progress: 0, percent: 0 };
    const h = date.getHours();
    const m = date.getMinutes();
    // 子初 [23, 24): 已过分钟 = (h-23)*60 + m
    let elapsed;
    if (stage.range[0] === 23) {
      elapsed = (h - 23) * 60 + m;
    } else {
      elapsed = (h - stage.range[0]) * 60 + m;
    }
    const total = 60; // 每段 60 分钟
    return { stage, progress: elapsed, percent: (elapsed / total) * 100 };
  }

  // 获取当前 shichen(子丑寅...),用于变化通知
  function getCurrentShichen(date) {
    return getCurrentStage(date).shichen;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // 缓存 DOM 节点,首次构建后只更新文本和宽度
  let _stageNodes = null;
  function _buildOnce() {
    const wrap = document.getElementById('timeline-stages');
    if (!wrap) return null;
    if (_stageNodes && _stageNodes.wrap === wrap && _stageNodes.nodes.length === STAGES.length) {
      return _stageNodes;
    }
    wrap.innerHTML = '';
    const nodes = STAGES.map((s, i) => {
      const div = document.createElement('div');
      div.className = 'relative flex-1 min-w-0 group';
      const inner = document.createElement('div');
      inner.className = 'flex flex-col items-center h-full';

      const bar = document.createElement('div');
      bar.className = 'w-full h-1 bg-gradient-to-r from-amber-700/40 via-amber-500/60 to-amber-700/40 rounded-t mb-1';
      inner.appendChild(bar);

      const shichenEl = document.createElement('div');
      shichenEl.className = 'font-kai text-sm text-amber-100/40';
      shichenEl.textContent = s.shichen + s.part;
      inner.appendChild(shichenEl);

      const iconEl = document.createElement('div');
      iconEl.className = 'text-xl my-1 transition-transform';
      iconEl.textContent = s.icon;
      inner.appendChild(iconEl);

      const labelEl = document.createElement('div');
      labelEl.className = 'font-kai text-[10px] text-center leading-tight text-amber-100/70 px-1';
      labelEl.style.minHeight = '2.5em';
      labelEl.textContent = (s.type === 'rest' && s.part === '初') ? '' : s.label;
      inner.appendChild(labelEl);

      const progressWrap = document.createElement('div');
      progressWrap.className = 'w-full h-2 bg-amber-900/40 rounded-full overflow-hidden mt-2 border border-amber-700/40';
      const progressBar = document.createElement('div');
      progressBar.className = 'h-full rounded-full transition-all duration-700 bg-transparent';
      progressBar.style.width = '0%';
      progressWrap.appendChild(progressBar);
      inner.appendChild(progressWrap);

      const rangeEl = document.createElement('div');
      rangeEl.className = 'text-[9px] text-amber-200/40 mt-1 font-mono';
      rangeEl.textContent = String(s.range[0]).padStart(2, '0') + ':00-' + (s.range[1] === 24 ? '24:00' : String(s.range[1]).padStart(2, '0') + ':00');
      inner.appendChild(rangeEl);

      div.appendChild(inner);
      wrap.appendChild(div);

      return { div, shichenEl, iconEl, labelEl, progressBar, current: -1, past: -1, s };
    });
    _stageNodes = { wrap, nodes };
    return _stageNodes;
  }

  // 增量更新:只改当前段与已过段的 className/width
  function render() {
    const built = _buildOnce();
    if (!built) return;
    const now = new Date();
    const { stage: current, percent } = getStageProgress(now);
    const curId = current ? current.id : '';
    STAGES.forEach((s, i) => {
      const n = built.nodes[i];
      const isCurrent = current && current.id === s.id;
      const isPast = current ? isStagePast(s, current) : false;
      const stagePercent = isCurrent ? percent : (isPast ? 100 : 0);
      // 仅在状态变化时改 className,避免每次都重设 class
      if (n.current !== (isCurrent ? 1 : 0) || n.past !== (isPast ? 1 : 0)) {
        n.current = isCurrent ? 1 : 0;
        n.past = isPast ? 1 : 0;
        n.div.className = 'relative flex-1 min-w-0 group ' + (isCurrent ? 'z-10' : '');
        n.shichenEl.className = 'font-kai text-sm ' + (isCurrent ? 'text-yellow-200 text-xl' : isPast ? 'text-amber-200/60' : 'text-amber-100/40');
        n.iconEl.className = 'text-xl my-1 ' + (isCurrent ? 'scale-125' : '') + ' transition-transform';
        n.labelEl.className = 'font-kai text-[10px] text-center leading-tight ' + (isCurrent ? 'text-yellow-100 font-bold' : 'text-amber-100/70') + ' px-1';
        n.progressBar.className = 'h-full rounded-full transition-all duration-700 ' +
          (isCurrent ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 shadow-lg' : isPast ? 'bg-amber-600/80' : 'bg-transparent');
        if (isCurrent) {
          n.progressBar.style.backgroundSize = '200% 100%';
          n.progressBar.style.animation = 'shimmer 2s linear infinite';
        } else {
          n.progressBar.style.backgroundSize = '';
          n.progressBar.style.animation = '';
        }
      }
      // 宽度变化就更新
      const w = stagePercent + '%';
      if (n.progressBar.style.width !== w) n.progressBar.style.width = w;
    });
  }

  // 判断 s 是否在 current 之前(已过)
  function isStagePast(s, current) {
    // 把 24 当作 0 处理:子初 [23, 24) 是昨日末尾
    const sStart = s.range[0] === 23 ? -1 : s.range[0];
    const cStart = current.range[0] === 23 ? -1 : current.range[0];
    return sStart < cStart;
  }

  function checkShichenChange(date) {
    const shichen = getCurrentShichen(date);
    if (!shichen) return;
    if (lastShichenNotified === shichen) return;
    const last = lastShichenNotified;
    lastShichenNotified = shichen;
    if (last !== null) {
      Audio.chuanzhi();
      const stage = getCurrentStage(date);
      onStageChangeCallbacks.forEach(cb => cb(stage, last));
    }
  }

  function tick() {
    render();
    checkShichenChange(new Date());
  }

  function onStageChange(cb) { onStageChangeCallbacks.push(cb); }

  function start() {
    lastShichenNotified = null;
    tick();
    if (window.__timelineTimer) clearInterval(window.__timelineTimer);
    window.__timelineTimer = setInterval(tick, 30000);
  }

  return { STAGES, getCurrentStage, getStageProgress, getCurrentShichen, render, start, onStageChange };
})();
