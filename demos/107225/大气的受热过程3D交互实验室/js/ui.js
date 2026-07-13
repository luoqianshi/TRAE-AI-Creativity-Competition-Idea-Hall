// UI控制模块 - 基于物理过程的三阶段交互
function updateParam(param, value) {
  state[param] = parseInt(value);
  const fills = { angle:'angleFill', cloud:'cloudFill', dust:'dustFill', vapor:'vaporFill', co2:'co2Fill' };
  const vals = { angle:'angleVal', cloud:'cloudVal', dust:'dustVal', vapor:'vaporVal', co2:'co2Val' };
  
  if (fills[param]) document.getElementById(fills[param]).style.width = value+'%';
  
  if (param==='angle') {
    document.getElementById(vals[param]).textContent = value+'°';
  } else if (param==='co2') {
    const labels = ['极低','低','中','高','极高'];
    document.getElementById(vals[param]).textContent = labels[Math.min(4,Math.floor(value/20))];
  } else {
    document.getElementById(vals[param]).textContent = value+'%';
  }
  
  if (param==='cloud') createClouds();
  if (param==='dust') particles.forEach(p => { 
    if(p.userData.type==='dust') p.material.opacity = value/100*0.5; 
  });
  updateDataPanel();
}

function setSurface(s, el) {
  state.surface = s;
  document.querySelectorAll('.surface-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  if (terrain) { scene.remove(terrain); terrain = null; }
  surfaceObjects.forEach(o => { scene.remove(o); });
  surfaceObjects = [];

  createTerrain();
  createSurfaceObjects();
  updateDataPanel();
}

function setTime(t, el) {
  state.time = t;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  updateDataPanel();
}

// 时间轴滑条控制 - 联动时段和太阳高度角
function updateTimeSlider(value) {
  const v = parseInt(value);
  state.timeSlider = v;
  
  // 更新填充条
  document.getElementById('timeFill').style.width = v + '%';
  
  // 根据时间轴位置确定时段和太阳高度角
  let timeOfDay, angle, label;
  
  if (v <= 33) {
    // 白天（0-33）：清晨→正午
    timeOfDay = 'day';
    angle = 15 + (v / 33) * 65; // 15° → 80°
    if (v < 10) label = '清晨';
    else if (v < 20) label = '上午';
    else if (v < 28) label = '正午';
    else label = '下午';
  } else if (v <= 66) {
    // 傍晚（34-66）：下午→日落
    timeOfDay = 'dusk';
    angle = 45 - ((v - 33) / 33) * 35; // 45° → 10°
    if (v < 45) label = '下午';
    else if (v < 55) label = '傍晚';
    else label = '日落';
  } else {
    // 夜晚（67-100）：日落后→深夜
    timeOfDay = 'night';
    angle = 10 - ((v - 66) / 34) * 5; // 10° → 5°
    if (v < 80) label = '入夜';
    else if (v < 90) label = '深夜';
    else label = '凌晨';
  }
  
  // 更新显示
  document.getElementById('timeVal').textContent = label;
  
  // 更新时段按钮
  if (state.time !== timeOfDay) {
    state.time = timeOfDay;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-time="${timeOfDay}"]`).classList.add('active');
  }
  
  // 更新太阳高度角
  state.angle = Math.round(angle);
  document.getElementById('angleSlider').value = state.angle;
  document.getElementById('angleVal').textContent = state.angle + '°';
  document.getElementById('angleFill').style.width = state.angle + '%';
  
  // 更新数据面板
  updateDataPanel();
}

function switchMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

  // 严谨科普版说明文本
  // 科学口诀：太阳定入口，地面定调性，大气定存留
  const exps = {
    solar: { 
      t:'第一阶段：太阳暖大地（太阳定入口）', 
      x:'太阳以短波辐射（黄色箭头）向地球输送能量。太阳高度角和云尘决定"入口能量"的多少：角度↑→路径↓→削弱↓→S↓↑；云量↑→反射↑→S↓↓。大气对短波吸收弱，大部分直达地面。地面吸收后升温。' 
    },
    ground: { 
      t:'第二阶段：大地暖大气（地面定调性）', 
      x:'地面增温后以长波辐射（橙红色箭头）把热量传给大气。地面类型决定"调性"：沙漠热容量0.8→白天R地↑飙升极快；湖泊热容量4.2→升温慢、辐射稳；冰雪反照率85%→吸收极少、R地↑全天微弱。地面是大气的主要、直接热源。' 
    },
    atmosphere: { 
      t:'第三阶段：大气还大地（大气定存留）', 
      x:'大气辐射中射向地面的部分=大气逆辐射（紫色箭头）。水汽和CO₂决定"热量能留存多久"：数值越高→吸收R地↑越多→R逆↓越强→保温越显著。云量白天管"遮阳"（反射短波），夜晚管"盖被"（增强逆辐射）。' 
    },
    weakening: { 
      t:'大气削弱作用（太阳定入口）', 
      x:'黄色箭头=太阳短波入射，白色箭头=被反射回太空。太阳高度角和尘埃管"入口能量"：云量↑→反射↑→S↓↓；尘埃↑→散射↑→S↓↓；角度↓→路径↑→削弱↑。白天增云，削弱短波的冷却效应远大于保温效应，总效应为净降温。' 
    },
    insulation: { 
      t:'大气保温作用（大气定存留）', 
      x:'橙红色箭头=R地↑，紫色箭头=R逆↓。水汽和CO₂管"出口锁温"：切换到夜晚，无短波输入，此时云量/水汽/CO₂是唯一变量→数值越高→R逆↓越强→地面冷却速率越低→昼夜温差越小。' 
    },
    life: { 
      t:'科学口诀·综合展示', 
      x:'三种辐射同时展示。科学口诀：太阳定入口（角度+云尘→输入多少）；地面定调性（反照率+热容量→如何转化释放）；大气定存留（水汽+CO₂→留存多久）。沙漠瓶颈在"锁不住"，冰雪瓶颈在"吃不进"，湖泊/森林多云"三环通畅"，城市夜晚=额外热源。' 
    }
  };
  
  const e = exps[mode];
  document.getElementById('expTitle').textContent = e.t;
  document.getElementById('expText').textContent = e.x;

  if (mode === 'life') openModal('lifeModal');
  updateDataPanel();
}

// 完整演示：从白天到夜晚的大气受热过程
function startDemo() {
  if(state.demoRunning) return;
  state.demoRunning = true;
  
  const btn = document.getElementById('demoBtn');
  btn.textContent = '⏸ 演示中...'; 
  btn.style.background = 'linear-gradient(135deg,#666,#444)';
  
  // 重置场景到初始状态
  resetScene();
  
  // 演示时间轴（单位：秒）
  const demoTimeline = [
    // 阶段1：清晨日出（太阳高度角低，短波辐射弱）
    { time: 0, angle: 15, timeOfDay: 'day', mode: 'solar', 
      desc: '清晨：太阳高度角低，短波辐射穿过大气路径长，削弱多，地面获得能量少' },
    
    // 阶段2：上午升温（太阳升高，短波辐射增强）
    { time: 4, angle: 45, timeOfDay: 'day', mode: 'solar',
      desc: '上午：太阳升高，短波辐射增强，地面吸收能量增多，温度开始上升' },
    
    // 阶段3：正午最强（太阳高度角最大，短波辐射最强）
    { time: 8, angle: 80, timeOfDay: 'day', mode: 'solar',
      desc: '正午：太阳高度角最大，短波辐射最强，地面吸收大量能量，温度快速升高' },
    
    // 阶段4：地面辐射增强（大地暖大气）
    { time: 12, angle: 75, timeOfDay: 'day', mode: 'ground',
      desc: '地面升温后，以长波辐射形式向大气传递热量（大地暖大气）' },
    
    // 阶段5：大气逆辐射（大气还大地）
    { time: 16, angle: 70, timeOfDay: 'day', mode: 'atmosphere',
      desc: '大气吸收地面长波辐射后升温，向下发射大气逆辐射（大气还大地）' },
    
    // 阶段6：下午太阳降低
    { time: 20, angle: 45, timeOfDay: 'day', mode: 'life',
      desc: '下午：太阳高度角降低，短波辐射减弱，地面获得能量减少' },
    
    // 阶段7：傍晚过渡
    { time: 24, angle: 20, timeOfDay: 'dusk', mode: 'weakening',
      desc: '傍晚：太阳接近地平线，短波辐射急剧减弱，地面长波辐射成为主要热源' },
    
    // 阶段8：夜晚开始（无短波辐射，只有长波辐射）
    { time: 28, angle: 5, timeOfDay: 'night', mode: 'insulation',
      desc: '夜晚：无太阳短波辐射，地面持续向外发射长波辐射，温度下降' },
    
    // 阶段9：深夜保温效应
    { time: 32, angle: 5, timeOfDay: 'night', mode: 'insulation',
      desc: '深夜：大气逆辐射将部分热量返还地面，减缓地面降温速度（保温作用）' },
    
    // 阶段10：综合总结
    { time: 36, angle: 5, timeOfDay: 'night', mode: 'life',
      desc: '完整过程：太阳暖大地→大地暖大气→大气还大地，三环耦合形成地球温度系统' }
  ];
  
  let currentTime = 0;
  const totalDuration = 40; // 总时长40秒
  
  const demoInterval = setInterval(() => {
    currentTime += 0.1;
    
    if (currentTime >= totalDuration) {
      clearInterval(demoInterval);
      state.demoRunning = false;
      btn.textContent = '▶ 一键演示完整过程';
      btn.style.background = 'linear-gradient(135deg,#ff8c00,#ff6b00)';
      return;
    }
    
    // 找到当前时间点应该展示的阶段
    let currentStage = demoTimeline[0];
    for (let i = 0; i < demoTimeline.length; i++) {
      if (currentTime >= demoTimeline[i].time) {
        currentStage = demoTimeline[i];
      }
    }
    
    // 更新太阳高度角（平滑过渡）
    const targetAngle = currentStage.angle;
    const angleDiff = targetAngle - state.angle;
    state.angle += angleDiff * 0.05; // 平滑插值
    
    // 更新滑块显示
    document.getElementById('angleSlider').value = Math.round(state.angle);
    document.getElementById('angleVal').textContent = Math.round(state.angle) + '°';
    document.getElementById('angleFill').style.width = state.angle + '%';
    
    // 更新时段
    if (state.time !== currentStage.timeOfDay) {
      state.time = currentStage.timeOfDay;
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      document.querySelector(`[data-time="${currentStage.timeOfDay}"]`).classList.add('active');
    }
    
    // 更新模式
    if (state.mode !== currentStage.mode) {
      switchMode(currentStage.mode);
    }
    
    // 更新说明文本
    document.getElementById('expTitle').textContent = currentStage.desc.split('：')[0];
    document.getElementById('expText').textContent = currentStage.desc.split('：')[1];
    
    // 更新物理数据面板
    updateDataPanel();
    
  }, 100); // 每100ms更新一次
}

function toggleMusic(){ 
  state.musicOn=!state.musicOn; 
  document.getElementById('musicBtn').classList.toggle('active',state.musicOn); 
}

function toggleNarration(){ 
  state.narrationOn=!state.narrationOn; 
  document.getElementById('narrateBtn').classList.toggle('active',state.narrationOn); 
}

function resetScene() {
  state.angle=50; state.cloud=30; state.dust=20; state.vapor=40; state.co2=50;
  state.surface='forest'; state.time='day'; state.mode='solar';
  document.getElementById('angleSlider').value=50;
  document.getElementById('cloudSlider').value=30;
  document.getElementById('dustSlider').value=20;
  document.getElementById('vaporSlider').value=40;
  document.getElementById('co2Slider').value=50;
  document.querySelectorAll('.surface-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('[data-surface="forest"]').classList.add('active');
  document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('[data-time="day"]').classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('[data-mode="solar"]').classList.add('active');

  if(terrain){ scene.remove(terrain); terrain=null; }
  surfaceObjects.forEach(o=>scene.remove(o)); 
  surfaceObjects=[];
  createTerrain(); 
  createSurfaceObjects();
  createClouds(); 
  createRadiationArrows();
  switchMode('solar'); 
  updateDataPanel();
}
