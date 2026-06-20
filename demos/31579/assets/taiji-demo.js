// 太极智学 - 视频 Demo 控制逻辑
// 使用 B 站真实太极教学视频，按招式与视角切换
// 同时配有 SVG 卡通人物招式要点示意图

const poseData = {
  wuji: {
    name: '起势 · 无极式',
    desc: '两脚平行、松肩沉肘、意守丹田。作为二十四式的开端，起势帮助练习者调身、调息、调心，进入太极状态。',
    breath: '自然呼吸 · 起势',
    start: 1,
    end: 28,
    points: [
      { dot: 'head', text: '<strong>头：</strong>头正颈直，目视前方，下颌微收' },
      { dot: 'hand', text: '<strong>手：</strong>两臂自然下垂，松肩坠肘' },
      { dot: 'leg', text: '<strong>腿：</strong>两脚平行，与肩同宽，双膝微屈' },
      { dot: 'body', text: '<strong>身：</strong>含胸拔背，气沉丹田' }
    ],
    hints: { head: true, handL: false, handR: false, leg: true },
    figure: {
      head: [140, 85], neck: [140, 115],
      shoulderL: [120, 125], shoulderR: [160, 125],
      elbowL: [105, 165], elbowR: [175, 165],
      wristL: [95, 205], wristR: [185, 205],
      hipL: [125, 210], hipR: [155, 210],
      kneeL: [115, 265], kneeR: [165, 265],
      footL: [110, 325], footR: [170, 325]
    }
  },
  lanquewei: {
    name: '揽雀尾',
    desc: '由掤、捋、挤、按四法组成，是太极推手与拳架的核心招式，讲究以柔克刚、引进落空。',
    breath: '掤吸按呼 · 沉肩坠肘',
    start: 134,
    end: 185,
    points: [
      { dot: 'head', text: '<strong>头：</strong>头随腰转，眼看左手方向' },
      { dot: 'hand', text: '<strong>手：</strong>左手前掤，右手后按，形成对拉' },
      { dot: 'leg', text: '<strong>腿：</strong>前腿弓、后腿蹬，重心四分在前' },
      { dot: 'body', text: '<strong>身：</strong>腰胯旋转，以身带手' }
    ],
    hints: { head: true, handL: true, handR: true, leg: true },
    figure: {
      head: [150, 82], neck: [145, 112],
      shoulderL: [125, 122], shoulderR: [165, 128],
      elbowL: [110, 150], elbowR: [190, 170],
      wristL: [95, 130], wristR: [210, 205],
      hipL: [130, 210], hipR: [160, 210],
      kneeL: [115, 265], kneeR: [180, 260],
      footL: [105, 325], footR: [185, 315]
    }
  },
  yunshou: {
    name: '云手',
    desc: '双手如行云般在体前交替画圆，配合腰胯转动，训练上下相随、以身带手的协调能力。',
    breath: '开吸合呼 · 腰胯相随',
    start: 200,
    end: 222,
    points: [
      { dot: 'head', text: '<strong>头：</strong>头随手动，眼随手转' },
      { dot: 'hand', text: '<strong>手：</strong>两手在体前交替画立圆' },
      { dot: 'leg', text: '<strong>腿：</strong>马步稳定，重心左右平移' },
      { dot: 'body', text: '<strong>身：</strong>腰胯为主轴，以身带手' }
    ],
    hints: { head: true, handL: true, handR: true, leg: true },
    figure: {
      head: [140, 82], neck: [140, 112],
      shoulderL: [115, 125], shoulderR: [165, 125],
      elbowL: [85, 140], elbowR: [170, 145],
      wristL: [60, 120], wristR: [190, 160],
      hipL: [120, 215], hipR: [160, 215],
      kneeL: [110, 270], kneeR: [170, 270],
      footL: [105, 325], footR: [175, 325]
    }
  },
  danbian: {
    name: '单鞭',
    desc: '一手勾手、一手前推，身形展开如鞭，锻炼脊柱拧转与四肢协调。',
    breath: '转身吸气 · 推掌呼气',
    start: 188,
    end: 198,
    points: [
      { dot: 'head', text: '<strong>头：</strong>头转向左侧，眼看左手' },
      { dot: 'hand', text: '<strong>手：</strong>左手前推，右手勾手后伸' },
      { dot: 'leg', text: '<strong>腿：</strong>左弓步，右腿蹬直' },
      { dot: 'body', text: '<strong>身：</strong>身体侧展，脊柱拧转' }
    ],
    hints: { head: true, handL: true, handR: true, leg: true },
    figure: {
      head: [160, 78], neck: [150, 108],
      shoulderL: [130, 118], shoulderR: [175, 125],
      elbowL: [95, 155], elbowR: [215, 135],
      wristL: [55, 200], wristR: [250, 115],
      hipL: [135, 210], hipR: [165, 210],
      kneeL: [110, 265], kneeR: [190, 255],
      footL: [100, 325], footR: [200, 310]
    }
  },
  yemafenzong: {
    name: '野马分鬃',
    desc: '如野马扬鬃分披，双手抱球后弓步分手，训练腰胯转动与上下相随。',
    breath: '抱球吸气 · 分手呼气',
    start: 30,
    end: 50,
    points: [
      { dot: 'head', text: '<strong>头：</strong>上体中正，眼看分手方向' },
      { dot: 'hand', text: '<strong>手：</strong>一手前掤斜向上，一手下按于胯旁' },
      { dot: 'leg', text: '<strong>腿：</strong>前腿弓、后腿蹬，横向距离保持 10–30 厘米' },
      { dot: 'body', text: '<strong>身：</strong>以腰为轴，分手与弓步协调一致' }
    ],
    hints: { head: true, handL: true, handR: true, leg: true },
    figure: {
      head: [145, 80], neck: [140, 110],
      shoulderL: [120, 120], shoulderR: [160, 125],
      elbowL: [90, 140], elbowR: [175, 150],
      wristL: [60, 115], wristR: [185, 200],
      hipL: [125, 210], hipR: [155, 210],
      kneeL: [105, 265], kneeR: [170, 260],
      footL: [90, 325], footR: [180, 315]
    }
  },
  baiheliangchi: {
    name: '白鹤亮翅',
    desc: '如白鹤展翅，一手上提额前、一手下按胯前，形成上下对拉的虚步架势。',
    breath: '跟步吸气 · 分手呼气',
    start: 52,
    end: 70,
    points: [
      { dot: 'head', text: '<strong>头：</strong>上体转正，眼平视前方' },
      { dot: 'hand', text: '<strong>手：</strong>右手上提于右额前，左手下按于左胯前' },
      { dot: 'leg', text: '<strong>腿：</strong>左脚虚步脚尖点地，重心落于右腿' },
      { dot: 'body', text: '<strong>身：</strong>含胸拔背，两臂保持半圆形' }
    ],
    hints: { head: true, handL: true, handR: true, leg: true },
    figure: {
      head: [140, 80], neck: [140, 110],
      shoulderL: [120, 125], shoulderR: [160, 125],
      elbowL: [115, 170], elbowR: [180, 110],
      wristL: [120, 215], wristR: [200, 75],
      hipL: [125, 215], hipR: [155, 210],
      kneeL: [125, 270], kneeR: [165, 260],
      footL: [125, 325], footR: [175, 315]
    }
  },
  louxi_aobu: {
    name: '搂膝拗步',
    desc: '一手经膝前搂过，另一手由耳侧向前推出，形成弓步推掌。',
    breath: '转体吸气 · 推掌呼气',
    start: 72,
    end: 95,
    points: [
      { dot: 'head', text: '<strong>头：</strong>眼看推掌方向，不可前俯后仰' },
      { dot: 'hand', text: '<strong>手：</strong>一手搂膝下落，一手前推高与耳平' },
      { dot: 'leg', text: '<strong>腿：</strong>前腿弓步，后腿自然蹬直' },
      { dot: 'body', text: '<strong>身：</strong>沉肩坠肘，坐腕舒掌，上下协调' }
    ],
    hints: { head: true, handL: true, handR: true, leg: true },
    figure: {
      head: [150, 80], neck: [145, 110],
      shoulderL: [125, 122], shoulderR: [165, 125],
      elbowL: [120, 175], elbowR: [185, 150],
      wristL: [120, 220], wristR: [210, 145],
      hipL: [130, 210], hipR: [160, 210],
      kneeL: [110, 265], kneeR: [175, 260],
      footL: [100, 325], footR: [180, 315]
    }
  },
  shouhuipipa: {
    name: '手挥琵琶',
    desc: '右脚跟步、左脚虚步，两手合抱如弹琵琶，训练虚实转换与身法协调。',
    breath: '跟步吸气 · 合手呼气',
    start: 97,
    end: 115,
    points: [
      { dot: 'head', text: '<strong>头：</strong>上体正直，眼平视前方' },
      { dot: 'hand', text: '<strong>手：</strong>左手上挑高与鼻平，右手下落于腹旁' },
      { dot: 'leg', text: '<strong>腿：</strong>左脚虚步脚跟着地，重心坐于右腿' },
      { dot: 'body', text: '<strong>身：</strong>沉肩垂肘，掌心相对，合臂虚腋' }
    ],
    hints: { head: true, handL: true, handR: true, leg: true },
    figure: {
      head: [140, 80], neck: [140, 110],
      shoulderL: [120, 125], shoulderR: [160, 125],
      elbowL: [110, 145], elbowR: [165, 165],
      wristL: [105, 110], wristR: [155, 205],
      hipL: [125, 215], hipR: [155, 210],
      kneeL: [125, 270], kneeR: [165, 260],
      footL: [125, 325], footR: [175, 315]
    }
  }
};

const videoSources = {
  front: 'BV1fLEb68EuW',
  back: 'BV19oPwzdErU'
};

let currentPose = 'wuji';
let currentView = 'front';
let isLooping = true;

const videoFrame = document.getElementById('taiji-video');
const poseInfo = document.getElementById('video-pose-info');
const breathHint = document.getElementById('video-breath-hint');
const pointsList = document.getElementById('diagram-points-list');

function buildVideoUrl(bvid, start, loop) {
  const loopParam = loop ? '&loop=1' : '';
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&autoplay=1&t=${start}${loopParam}`;
}

function updatePoseInfo(pose) {
  const data = poseData[pose];
  poseInfo.innerHTML = '<h4>' + data.name + '</h4><p>' + data.desc + '</p>';
  breathHint.textContent = data.breath;

  // 更新要点列表
  if (pointsList) {
    pointsList.innerHTML = data.points.map(p =>
      '<div class="point-item"><span class="point-dot ' + p.dot + '"></span><span>' + p.text + '</span></div>'
    ).join('');
  }
}

function setLine(id, x1, y1, x2, y2) {
  const el = document.getElementById(id);
  if (el) { el.setAttribute('x1', x1); el.setAttribute('y1', y1); el.setAttribute('x2', x2); el.setAttribute('y2', y2); }
}

function setCircle(id, cx, cy) {
  const el = document.getElementById(id);
  if (el) { el.setAttribute('cx', cx); el.setAttribute('cy', cy); }
}

function setEllipse(id, cx, cy) {
  const el = document.getElementById(id);
  if (el) { el.setAttribute('cx', cx); el.setAttribute('cy', cy); }
}

function updateFigure(pose) {
  const f = poseData[pose].figure;
  if (!f) return;

  // 头、颈
  setCircle('joint-head', f.head[0], f.head[1]);
  setCircle('joint-neck', f.neck[0], f.neck[1]);

  // 躯干用路径：从腰到肩的梯形/曲线
  const torso = document.getElementById('torso');
  if (torso) {
    const d = `M ${f.hipL[0]} ${f.hipL[1]} Q ${(f.hipL[0]+f.hipR[0])/2} ${f.hipL[1]-5} ${f.hipR[0]} ${f.hipR[1]} L ${f.shoulderR[0]} ${f.shoulderR[1]} Q ${(f.shoulderL[0]+f.shoulderR[0])/2} ${f.shoulderL[1]-5} ${f.shoulderL[0]} ${f.shoulderL[1]} Z`;
    torso.setAttribute('d', d);
  }

  // 腰带
  const belt = document.getElementById('belt');
  if (belt) {
    const bx = (f.hipL[0] + f.hipR[0]) / 2;
    const by = (f.hipL[1] + f.shoulderL[1]) / 2;
    belt.setAttribute('d', `M ${f.hipL[0]} ${by} Q ${bx} ${by+3} ${f.hipR[0]} ${by}`);
  }

  // 手臂
  setLine('arm-l-upper', f.shoulderL[0], f.shoulderL[1], f.elbowL[0], f.elbowL[1]);
  setLine('arm-l-lower', f.elbowL[0], f.elbowL[1], f.wristL[0], f.wristL[1]);
  setLine('arm-r-upper', f.shoulderR[0], f.shoulderR[1], f.elbowR[0], f.elbowR[1]);
  setLine('arm-r-lower', f.elbowR[0], f.elbowR[1], f.wristR[0], f.wristR[1]);

  // 腿
  setLine('leg-l-thigh', f.hipL[0], f.hipL[1], f.kneeL[0], f.kneeL[1]);
  setLine('leg-l-calf', f.kneeL[0], f.kneeL[1], f.footL[0], f.footL[1]);
  setLine('leg-r-thigh', f.hipR[0], f.hipR[1], f.kneeR[0], f.kneeR[1]);
  setLine('leg-r-calf', f.kneeR[0], f.kneeR[1], f.footR[0], f.footR[1]);

  // 关节点
  setCircle('joint-shoulder-l', f.shoulderL[0], f.shoulderL[1]);
  setCircle('joint-shoulder-r', f.shoulderR[0], f.shoulderR[1]);
  setCircle('joint-elbow-l', f.elbowL[0], f.elbowL[1]);
  setCircle('joint-elbow-r', f.elbowR[0], f.elbowR[1]);
  setCircle('joint-wrist-l', f.wristL[0], f.wristL[1]);
  setCircle('joint-wrist-r', f.wristR[0], f.wristR[1]);
  setCircle('joint-hip-l', f.hipL[0], f.hipL[1]);
  setCircle('joint-hip-r', f.hipR[0], f.hipR[1]);
  setCircle('joint-knee-l', f.kneeL[0], f.kneeL[1]);
  setCircle('joint-knee-r', f.kneeR[0], f.kneeR[1]);

  // 手部高亮
  setCircle('hand-l', f.wristL[0], f.wristL[1]);
  setCircle('hand-r', f.wristR[0], f.wristR[1]);

  // 脚部
  setEllipse('foot-l', f.footL[0], f.footL[1]);
  setEllipse('foot-r', f.footR[0], f.footR[1]);

  // 要点标注线位置跟随
  updateHintLines(f, poseData[pose].hints);
}

function setHintOpacity(id, opacity) {
  const el = document.getElementById(id);
  if (el) el.setAttribute('opacity', opacity);
}

function updateHintLines(f, hints) {
  // 躯干左右边界与中部，用于把文字标注放在身体附近，避免超出 SVG
  const torsoLeft = Math.min(f.shoulderL[0], f.hipL[0]) - 12;
  const torsoRight = Math.max(f.shoulderR[0], f.hipR[0]) + 12;
  const torsoMidY = (f.shoulderL[1] + f.hipL[1]) / 2;

  // 头标注：优先右侧，若太靠右则放到左侧
  if (hints.head) {
    const hl = document.getElementById('hint-line-head');
    const ht = document.getElementById('hint-text-head');
    const headR = f.head[0] + 22;
    const headY = f.head[1];
    if (headR + 80 <= 270) {
      if (hl) { hl.setAttribute('x1', headR); hl.setAttribute('y1', headY); hl.setAttribute('x2', headR + 45); hl.setAttribute('y2', headY); }
      if (ht) { ht.setAttribute('x', headR + 50); ht.setAttribute('y', headY + 5); }
    } else {
      if (hl) { hl.setAttribute('x1', f.head[0] - 22); hl.setAttribute('y1', headY); hl.setAttribute('x2', f.head[0] - 65); hl.setAttribute('y2', headY); }
      if (ht) { ht.setAttribute('x', f.head[0] - 105); ht.setAttribute('y', headY + 5); }
    }
  }
  setHintOpacity('hint-line-head', hints.head ? 1 : 0);
  setHintOpacity('hint-text-head', hints.head ? 1 : 0);

  // 左手标注：文字放在躯干左侧，引线从左手腕连过来
  if (hints.handL) {
    const hl = document.getElementById('hint-line-hand-l');
    const ht = document.getElementById('hint-text-hand-l');
    const tx = torsoLeft - 50;
    const ty = torsoMidY - 18;
    if (hl) { hl.setAttribute('x1', f.wristL[0]); hl.setAttribute('y1', f.wristL[1]); hl.setAttribute('x2', torsoLeft - 8); hl.setAttribute('y2', ty); }
    if (ht) { ht.setAttribute('x', tx); ht.setAttribute('y', ty + 5); }
  }
  setHintOpacity('hint-line-hand-l', hints.handL ? 1 : 0);
  setHintOpacity('hint-text-hand-l', hints.handL ? 1 : 0);

  // 右手标注：文字放在躯干右侧
  if (hints.handR) {
    const hl = document.getElementById('hint-line-hand-r');
    const ht = document.getElementById('hint-text-hand-r');
    const tx = torsoRight + 10;
    const ty = torsoMidY - 18;
    if (hl) { hl.setAttribute('x1', f.wristR[0]); hl.setAttribute('y1', f.wristR[1]); hl.setAttribute('x2', torsoRight + 8); hl.setAttribute('y2', ty); }
    if (ht) { ht.setAttribute('x', tx); ht.setAttribute('y', ty + 5); }
  }
  setHintOpacity('hint-line-hand-r', hints.handR ? 1 : 0);
  setHintOpacity('hint-text-hand-r', hints.handR ? 1 : 0);

  // 腿标注：放在膝盖中间右侧，若超出则左侧
  if (hints.leg) {
    const kx = (f.kneeL[0] + f.kneeR[0]) / 2;
    const ky = (f.kneeL[1] + f.kneeR[1]) / 2;
    const hl = document.getElementById('hint-line-leg');
    const ht = document.getElementById('hint-text-leg');
    if (kx + 80 <= 270) {
      if (hl) { hl.setAttribute('x1', kx); hl.setAttribute('y1', ky); hl.setAttribute('x2', kx + 55); hl.setAttribute('y2', ky + 10); }
      if (ht) { ht.setAttribute('x', kx + 60); ht.setAttribute('y', ky + 15); }
    } else {
      if (hl) { hl.setAttribute('x1', kx); hl.setAttribute('y1', ky); hl.setAttribute('x2', kx - 55); hl.setAttribute('y2', ky + 10); }
      if (ht) { ht.setAttribute('x', kx - 110); ht.setAttribute('y', ky + 15); }
    }
  }
  setHintOpacity('hint-line-leg', hints.leg ? 1 : 0);
  setHintOpacity('hint-text-leg', hints.leg ? 1 : 0);
}

function loadVideo() {
  const data = poseData[currentPose];
  const bvid = videoSources[currentView];
  const url = buildVideoUrl(bvid, data.start, isLooping);
  // 先更新文字与示意图，再切换 iframe，避免视频加载阻塞 UI
  updatePoseInfo(currentPose);
  updateFigure(currentPose);
  setTimeout(() => {
    videoFrame.src = url;
  }, 80);
}

window.setPoseVideo = function(pose, btn) {
  currentPose = pose;
  loadVideo();

  // 同步更新 3D 模型姿态
  if (typeof window.update3DPose === 'function') {
    window.update3DPose(pose);
  }

  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

window.setViewVideo = function(view, btn) {
  currentView = view;
  loadVideo();

  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

window.toggleLoop = function(btn) {
  isLooping = !isLooping;
  btn.classList.toggle('active', isLooping);
  btn.textContent = isLooping ? '循环当前招式' : '播放完整套路';
  loadVideo();
};

// 初始化加载（仅在包含视频播放器的页面）
if (videoFrame) {
  loadVideo();
}
// 将招式数据暴露给 3D 模型脚本
window.poseData = poseData;
