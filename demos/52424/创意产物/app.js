/* ============================================================
   情绪急救箱 · app.js
   状态管理 + 本地存储 + 呼吸引擎 + 语音 + 白噪音 + 危机干预
   ============================================================ */

(function(){
'use strict';

/* ---------- 工具函数 ---------- */
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));
const app = $('#app');

function toast(msg,ms=2000){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),ms);
}

/* ---------- 日夜模式 ---------- */
function applyTimeMode(){
  const h=new Date().getHours();
  const night = h>=22 || h<6;
  app.classList.toggle('night',night);
  app.classList.toggle('day',!night);
  $('#timeIcon').textContent = night ? '🌙' : '☀️';
}
applyTimeMode();
setInterval(applyTimeMode,60000);

/* ---------- 情绪定义 ---------- */
const EMOTIONS = {
  anxiety:{name:'焦虑',color:'var(--c-anxiety)',icon:'😰'},
  anger:  {name:'愤怒',color:'var(--c-anger)',  icon:'😡'},
  sadness:{name:'难过',color:'var(--c-sadness)',icon:'😢'},
  panic:  {name:'恐慌',color:'var(--c-panic)',  icon:'😨'},
  tired:  {name:'疲惫',color:'var(--c-tired)',  icon:'😔'},
};

/* ---------- 内置急救方案（兜底，无需 API） ---------- */
const DEFAULT_PLANS = {
  anxiety:{
    validation:'听起来你现在很不安，心跳很快，这种感觉确实很难受。',
    breathing:{type:'4-7-8 呼吸法',inhale:4,hold:7,exhale:8,rounds:4},
    cognitive:['这种感觉会过去的，它曾经来过也走了。','你现在很安全，只是身体在报警而已。','焦虑的顶峰通常只持续 20 分钟，你正在度过它。'],
    affirmation:'你做得很好，这种感觉正在消退。',
    whiteNoise:'雨夜窗边'
  },
  anger:{
    validation:'我能感觉到你现在很愤怒，这种情绪是有原因的。',
    breathing:{type:'盒式呼吸法',inhale:4,hold:4,exhale:4,rounds:4},
    cognitive:['愤怒是在保护你，但你可以选择如何回应。','深呼吸三次，给自己 10 秒再做决定。','这种情绪像海浪，涨潮后会退去的。'],
    affirmation:'你有力量选择平静，这本身就是一种强大。',
    whiteNoise:'森林溪流'
  },
  sadness:{
    validation:'你现在一定很难过，想哭就哭出来吧，没关系。',
    breathing:{type:'温柔呼吸法',inhale:5,hold:2,exhale:6,rounds:4},
    cognitive:['难过是因为你在乎，这说明你是个有温度的人。','允许自己悲伤，就像允许天下雨一样自然。','现在的黑暗，不代表明天不会有光。'],
    affirmation:'你不需要马上好起来，慢慢来，我陪着你。',
    whiteNoise:'深夜海浪'
  },
  panic:{
    validation:'我知道你现在很恐慌，感觉快要失控了，但请相信我，你会没事的。',
    breathing:{type:'Grounding 呼吸法',inhale:4,hold:4,exhale:6,rounds:4},
    cognitive:['恐慌发作不会伤害你，它只是肾上腺素在作祟。','专注于我的声音，跟着呼吸，你正在掌控局面。','这种感觉会在 10 分钟内达到顶峰然后消退。'],
    affirmation:'你度过了，你比恐慌更强大。',
    whiteNoise:'白噪音'
  },
  tired:{
    validation:'你看起来真的很累了，不只是身体，心也累了。',
    breathing:{type:'恢复呼吸法',inhale:3,hold:3,exhale:6,rounds:4},
    cognitive:['累了就休息，这不是放弃，是为了更好地出发。','你已经很努力了，不需要一直坚强。','给自己一点温柔，就像你会对朋友做的那样。'],
    affirmation:'休息不是懒惰，是智慧。',
    whiteNoise:'篝火夜晚'
  }
};

/* ---------- 危机关键词检测 ---------- */
const CRISIS_KEYWORDS = ['想死','自杀','不想活','活不下去','结束自己','了结','跳楼','割腕','没意义活'];
function detectCrisis(text){
  if(!text) return false;
  return CRISIS_KEYWORDS.some(k=>text.includes(k));
}

/* ---------- 状态 ---------- */
const state = {
  currentEmotion:null,
  currentDesc:'',
  currentPlan:null,
  sessionStart:0,
  rating:0,
  records: loadRecords(),
  apiKey: localStorage.getItem('mk_api_key') || '',
  remind: localStorage.getItem('mk_remind') === '1',
  remindTime: localStorage.getItem('mk_remind_time') || '21:00',
  viewMonth: new Date(),
};

function loadRecords(){
  try{ return JSON.parse(localStorage.getItem('mk_records')||'[]'); }
  catch(e){ return []; }
}
function saveRecords(){
  localStorage.setItem('mk_records',JSON.stringify(state.records.slice(0,100)));
}

/* ---------- 页面切换 ---------- */
const pages = {
  home:$('#pageHome'),
  emergency:$('#pageEmergency'),
  feedback:$('#pageFeedback'),
  diary:$('#pageDiary'),
};
function go(page){
  Object.values(pages).forEach(p=>p.classList.remove('active'));
  pages[page].classList.add('active');
  pages[page].scrollTop = 0;
  window.scrollTo(0,0);
  $('#progressBar').classList.toggle('show', page==='emergency');
}

/* ============================================================
   首页
   ============================================================ */
const descInput = $('#descInput');

// 情绪卡片选择
$$('.emotion-card').forEach(card=>{
  card.addEventListener('click',()=>{
    const emo = card.dataset.emotion;
    const desc = descInput.value.trim();
    // 危机检测
    if(detectCrisis(desc)){
      showCrisis();
      return;
    }
    $$('.emotion-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    setTimeout(()=>startEmergency(emo, desc), 300);
  });
});

// 语音输入
let recognition=null;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if(SpeechRecognition){
  recognition = new SpeechRecognition();
  recognition.lang='zh-CN';recognition.continuous=false;recognition.interimResults=true;
  recognition.onresult = (e)=>{
    const txt = Array.from(e.results).map(r=>r[0].transcript).join('');
    $('#voiceResult').textContent = '"'+txt+'"';
    descInput.value = txt;
  };
  recognition.onend = ()=>{
    $('#voiceBtn').classList.remove('recording');
    $('#voiceText').textContent='说出来...';
    const txt = descInput.value.trim();
    if(txt){
      if(detectCrisis(txt)){ showCrisis(); return; }
      const matched = matchEmotion(txt);
      toast('识别到情绪：'+EMOTIONS[matched].name);
      setTimeout(()=>startEmergency(matched, txt), 600);
    }
  };
  recognition.onerror = ()=>{
    $('#voiceBtn').classList.remove('recording');
    $('#voiceText').textContent='说出来...';
    toast('语音识别失败，请改用文字');
  };
}
function matchEmotion(text){
  const kw = {
    anxiety:['焦虑','紧张','不安','担心','害怕','心慌','忐忑'],
    anger:['生气','愤怒','火大','烦躁','气','恼火','烦'],
    sadness:['难过','伤心','想哭','失落','痛苦','委屈','emo'],
    panic:['恐慌','惊恐','窒息','失控','崩溃','害怕'],
    tired:['累','疲惫','倦怠','没劲','无力','撑不住'],
  };
  for(const t in kw){ if(kw[t].some(w=>text.includes(w))) return t; }
  return 'anxiety';
}

const voiceBtn=$('#voiceBtn');
function startVoice(){
  if(!recognition){ toast('当前浏览器不支持语音输入'); return; }
  // 危机词不在 startVoice 检测，识别结束后在 onend 检测
  voiceBtn.classList.add('recording');
  $('#voiceText').textContent='松开结束';
  descInput.value='';
  $('#voiceResult').textContent='';
  try{ recognition.start(); }catch(e){ /* 已在录音 */ }
}
function stopVoice(){
  if(!recognition) return;
  try{ recognition.stop(); }catch(e){}
}
// 长按录音（移动端 + 桌面端）
voiceBtn.addEventListener('touchstart',e=>{e.preventDefault();startVoice();},{passive:false});
voiceBtn.addEventListener('touchend',e=>{e.preventDefault();stopVoice();},{passive:false});
voiceBtn.addEventListener('mousedown',e=>{e.preventDefault();startVoice();});
voiceBtn.addEventListener('mouseup',e=>{e.preventDefault();stopVoice();});
voiceBtn.addEventListener('mouseleave',stopVoice);

// 底部导航
$('#goDiary').addEventListener('click',()=>{ renderDiary(); go('diary'); });
$('#goSettings').addEventListener('click',()=>openSettings());

/* ============================================================
   急救室
   ============================================================ */
function startEmergency(emotion, desc){
  state.currentEmotion = emotion;
  state.currentDesc = desc || '';
  state.sessionStart = Date.now();
  // 取方案：有 API Key 则尝试调用，否则用默认
  if(state.apiKey){
    generatePlanViaAPI(emotion, desc).then(plan=>{
      state.currentPlan = plan;
      runEmergency();
    }).catch(()=>{
      state.currentPlan = DEFAULT_PLANS[emotion];
      runEmergency();
    });
  } else {
    state.currentPlan = DEFAULT_PLANS[emotion];
    runEmergency();
  }
  go('emergency');
  // 先展示 loading 占位
  showERStep('validation');
  $('#aiValidation').innerHTML = '<span class="cursor"></span>';
  if(!state.currentPlan){
    $('#aiValidation').textContent = '正在为你准备急救方案…';
  }
}

function runEmergency(){
  const plan = state.currentPlan;
  // 阶段1：确认（打字机）
  typewriter($('#aiValidation'), plan.validation, 45, ()=>{
    // 打字完成后保留光标
    $('#aiValidation').innerHTML += '<span class="cursor"></span>';
  });
  // 朗读确认语
  speak(plan.validation);
}

/* —— 生成方案阶段控制 —— */
function showERStep(step){
  $$('.er-step').forEach(s=>s.classList.remove('active'));
  const map={validation:'#erValidation',breathing:'#erBreathing',cognitive:'#erCognitive',affirmation:'#erAffirmation'};
  $(map[step]).classList.add('active');
  updateProgress(step);
}

function updateProgress(step){
  const map={validation:15,breathing:55,cognitive:80,affirmation:100};
  $('#progressFill').style.width = (map[step]||0)+'%';
}

// 开始呼吸
$('#startBreathing').addEventListener('click',()=>{
  showERStep('breathing');
  startBreathing(state.currentPlan.breathing);
});
$('#skipBreathing').addEventListener('click',()=>{
  stopBreathing();
  goCognitive();
});

// 进入认知重构
function goCognitive(){
  showERStep('cognitive');
  renderCognitiveCards(state.currentPlan.cognitive);
}
$('#goAffirmation').addEventListener('click',()=>{
  showERStep('affirmation');
  $('#affirmText').textContent = state.currentPlan.affirmation;
  $('#wnScene').textContent = state.currentPlan.whiteNoise;
  speak(state.currentPlan.affirmation);
});

// 完成急救 → 结束页
$('#goFeedback').addEventListener('click',()=>{
  stopWhiteNoise();
  stopSpeak();
  go('feedback');
});

// 返回
$('#backHome').addEventListener('click',()=>{
  if(confirm('确定要离开吗？你的急救进度不会保存。')){
    stopBreathing();stopWhiteNoise();stopSpeak();
    go('home');
  }
});

/* —— 打字机效果 —— */
function typewriter(el, text, speed=45, done){
  el.textContent='';
  let i=0;
  const tick=()=>{
    if(i<text.length){
      el.textContent += text[i++];
      setTimeout(tick, speed);
    } else if(done){ done(); }
  };
  tick();
}

/* ============================================================
   呼吸引擎（4-7-8 等）
   ============================================================ */
let breathTimer=null;
function startBreathing(cfg){
  const orb=$('#breathOrb');
  const phaseEl=$('#breathPhase');
  const countEl=$('#breathCount');
  const methodEl=$('#breathMethod');
  methodEl.textContent = cfg.type;
  orb.style.setProperty('--inhale', cfg.inhale+'s');
  orb.style.setProperty('--hold', cfg.hold+'s');
  orb.style.setProperty('--exhale', cfg.exhale+'s');

  let round=0;
  const totalRounds = cfg.rounds || 4;

  function runRound(){
    if(round>=totalRounds){
      phaseEl.textContent='做得很好';
      countEl.textContent='呼吸练习完成';
      setTimeout(goCognitive, 1200);
      return;
    }
    round++;
    countEl.textContent=`第 ${round} / ${totalRounds} 轮`;

    // 吸气
    phaseEl.textContent='吸气...';
    orb.classList.remove('hold','exhale');orb.classList.add('inhale');
    speak('');
    breathTimer=setTimeout(()=>{
      // 屏息
      phaseEl.textContent='屏住...';
      orb.classList.remove('inhale','exhale');orb.classList.add('hold');
      breathTimer=setTimeout(()=>{
        // 呼气
        phaseEl.textContent='呼气...';
        orb.classList.remove('inhale','hold');orb.classList.add('exhale');
        breathTimer=setTimeout(runRound, cfg.exhale*1000);
      }, cfg.hold*1000);
    }, cfg.inhale*1000);
  }
  // 起始提示
  phaseEl.textContent='准备好了吗？';
  setTimeout(runRound, 1000);
}
function stopBreathing(){
  if(breathTimer){clearTimeout(breathTimer);breathTimer=null;}
  const orb=$('#breathOrb');
  if(orb){orb.classList.remove('inhale','hold','exhale');}
}

/* ============================================================
   认知重构卡片（逐条滑入 + 翻转收藏）
   ============================================================ */
function renderCognitiveCards(list){
  const wrap=$('#cognitiveCards');
  wrap.innerHTML='';
  list.forEach((text,i)=>{
    const card=document.createElement('div');
    card.className='cog-card';
    card.innerHTML=`<p class="cog-text">${text}</p><p class="back">💛 已记住</p>`;
    card.addEventListener('click',()=>card.classList.toggle('flipped'));
    wrap.appendChild(card);
    setTimeout(()=>card.classList.add('show'), 400 + i*1200);
  });
}

/* ============================================================
   结束页
   ============================================================ */
let fbRating=0;
$$('.star').forEach(star=>{
  star.addEventListener('click',()=>{
    fbRating = parseInt(star.dataset.v);
    $$('.star').forEach(s=>{
      s.classList.toggle('active', parseInt(s.dataset.v)<=fbRating);
    });
  });
});

$('#feelBetter').addEventListener('click',()=>{
  saveRecord(fbRating, $('#fbText').value.trim());
  toast('已记录到情绪日记 💛');
  resetFeedback();
  go('home');
});

$('#needHelp').addEventListener('click',()=>{
  saveRecord(fbRating, $('#fbText').value.trim());
  $('#helpExpand').classList.toggle('show');
  $('#hotlineCard').scrollIntoView({behavior:'smooth',block:'center'});
});

$('#redoFirstAid').addEventListener('click',()=>{
  resetFeedback();
  go('home');
});
$('#callHotline').addEventListener('click',()=>{
  $('#hotlineCard').scrollIntoView({behavior:'smooth',block:'center'});
  toast('拨打 010-82951332（24 小时免费）');
});
$('#endlessBreath').addEventListener('click',()=>{
  resetFeedback();
  startEmergency('anxiety','');
  setTimeout(()=>{
    showERStep('breathing');
    startBreathing(DEFAULT_PLANS.anxiety.breathing);
  },500);
});

function resetFeedback(){
  fbRating=0;
  $$('.star').forEach(s=>s.classList.remove('active'));
  $('#fbText').value='';
  $('#helpExpand').classList.remove('show');
}

function saveRecord(rating, feedback){
  const rec={
    id:Date.now(),
    emotion:state.currentEmotion||'anxiety',
    desc:state.currentDesc||'',
    time:Date.now(),
    rating:rating||0,
    feedback:feedback||'',
    duration: Math.round((Date.now()-state.sessionStart)/1000),
  };
  state.records.unshift(rec);
  saveRecords();
}

/* ============================================================
   情绪日记
   ============================================================ */
function renderDiary(){
  renderCalendar();
  renderStats();
  renderRecordsList();
}

function renderCalendar(){
  const grid=$('#calGrid');
  grid.innerHTML='';
  const vm = state.viewMonth;
  const year=vm.getFullYear(), month=vm.getMonth();
  $('#monthLabel').textContent = `${year}年${month+1}月`;

  const first = new Date(year,month,1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const today = new Date();

  // 空格
  for(let i=0;i<startDay;i++){
    const e=document.createElement('div');e.className='cal-cell empty';grid.appendChild(e);
  }
  // 日期
  for(let d=1; d<=daysInMonth; d++){
    const cell=document.createElement('div');
    cell.className='cal-cell';
    if(year===today.getFullYear() && month===today.getMonth() && d===today.getDate()){
      cell.classList.add('today');
    }
    cell.innerHTML = `<span>${d}</span><span class="dot"></span>`;
    // 找当天记录
    const dayRecs = state.records.filter(r=>{
      const t=new Date(r.time);
      return t.getFullYear()===year && t.getMonth()===month && t.getDate()===d;
    });
    if(dayRecs.length){
      cell.classList.add('has-record');
      // 用最近一条的情绪类型作为颜色
      cell.dataset.emotion = dayRecs[0].emotion;
      cell.title = dayRecs.map(r=>EMOTIONS[r.emotion].name).join('、');
    }
    grid.appendChild(cell);
  }
}

function renderStats(){
  const vm=state.viewMonth;
  const year=vm.getFullYear(), month=vm.getMonth();
  const monthRecs = state.records.filter(r=>{
    const t=new Date(r.time);return t.getFullYear()===year && t.getMonth()===month;
  });
  const grid=$('#statsGrid');
  if(!monthRecs.length){
    grid.innerHTML = `<div class="stat-item" style="grid-column:1/-1"><div class="stat-num">—</div><div class="stat-label">本月还没有记录，每一次急救都会被记下</div></div>`;
    return;
  }
  // 平均缓解效果
  const rated = monthRecs.filter(r=>r.rating>0);
  const avg = rated.length ? (rated.reduce((s,r)=>s+r.rating,0)/rated.length).toFixed(1) : '—';
  // 最常出现
  const emoCount={};
  monthRecs.forEach(r=>emoCount[r.emotion]=(emoCount[r.emotion]||0)+1);
  const topEmo = Object.entries(emoCount).sort((a,b)=>b[1]-a[1])[0];
  const topEmoName = topEmo ? EMOTIONS[topEmo[0]].name : '—';
  const totalMin = Math.round(monthRecs.reduce((s,r)=>s+(r.duration||0),0)/60);

  grid.innerHTML = `
    <div class="stat-item"><div class="stat-num">${monthRecs.length}</div><div class="stat-label">急救次数</div></div>
    <div class="stat-item"><div class="stat-num">${avg}</div><div class="stat-label">平均缓解效果 / 5</div></div>
    <div class="stat-item"><div class="stat-num">${topEmoName}</div><div class="stat-label">最常出现情绪</div></div>
    <div class="stat-item"><div class="stat-num">${totalMin}</div><div class="stat-label">累计急救分钟</div></div>
  `;
}

function renderRecordsList(){
  const list=$('#recordsList');
  if(!state.records.length){
    list.innerHTML = `<div class="records-empty">还没有记录。当你下次情绪崩溃时，这里会留下你走过的痕迹。</div>`;
    return;
  }
  list.innerHTML='';
  state.records.slice(0,20).forEach(r=>{
    const item=document.createElement('div');
    item.className='record-item';
    const emo=EMOTIONS[r.emotion]||EMOTIONS.anxiety;
    const t=new Date(r.time);
    const timeStr = `${t.getMonth()+1}/${t.getDate()} ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
    item.innerHTML = `
      <span class="record-dot" style="background:${emo.color}"></span>
      <div class="record-info">
        <div class="record-emotion">${emo.icon} ${emo.name}${r.desc?' · '+r.desc.slice(0,18):''}</div>
        <div class="record-time">${timeStr} · 用时 ${r.duration||0}s</div>
      </div>
      <div class="record-rating">${r.rating?('⭐'.repeat(r.rating)):''}</div>
    `;
    list.appendChild(item);
  });
}

// 月份切换
$('#prevMonth').addEventListener('click',()=>{
  state.viewMonth = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth()-1, 1);
  renderDiary();
});
$('#nextMonth').addEventListener('click',()=>{
  state.viewMonth = new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth()+1, 1);
  renderDiary();
});

// 导出月报（生成图片可下载）
$('#exportReport').addEventListener('click',()=>{
  const vm=state.viewMonth;
  const year=vm.getFullYear(), month=vm.getMonth()+1;
  const monthRecs = state.records.filter(r=>{
    const t=new Date(r.time);return t.getFullYear()===year && t.getMonth()+1===month;
  });
  if(!monthRecs.length){ toast('本月暂无记录可导出'); return; }
  const rated = monthRecs.filter(r=>r.rating>0);
  const avg = rated.length ? (rated.reduce((s,r)=>s+r.rating,0)/rated.length).toFixed(1) : '—';
  const emoCount={};
  monthRecs.forEach(r=>emoCount[r.emotion]=(emoCount[r.emotion]||0)+1);
  const topEmo = Object.entries(emoCount).sort((a,b)=>b[1]-a[1])[0];
  const topEmoName = topEmo ? EMOTIONS[topEmo[0]].name : '—';

  // 用 canvas 生成报告图
  const c=document.createElement('canvas');
  c.width=750;c.height=1000;
  const ctx=c.getContext('2d');
  // 背景
  const grad=ctx.createLinearGradient(0,0,0,1000);
  grad.addColorStop(0,'#131730');grad.addColorStop(1,'#0c0f24');
  ctx.fillStyle=grad;ctx.fillRect(0,0,750,1000);
  // 标题
  ctx.fillStyle='#ff8a5c';ctx.font='italic 600 26px Fraunces,serif';
  ctx.fillText('Emotion First Aid',40,70);
  ctx.fillStyle='#f0f1fa';ctx.font='900 40px "Noto Serif SC",serif';
  ctx.fillText(`${year}年${month}月 情绪报告`,40,120);
  ctx.strokeStyle='rgba(255,255,255,.1)';ctx.beginPath();ctx.moveTo(40,150);ctx.lineTo(710,150);ctx.stroke();
  // 统计
  ctx.fillStyle='#8a90b8';ctx.font='14px "Noto Sans SC",sans-serif';
  ctx.fillText('本月统计',40,190);
  const stats=[
    [`急救次数`, monthRecs.length],
    [`平均缓解`, avg+' / 5'],
    [`最常出现`, topEmoName],
    [`累计分钟`, Math.round(monthRecs.reduce((s,r)=>s+(r.duration||0),0)/60)],
  ];
  stats.forEach((s,i)=>{
    const y=240+i*90;
    ctx.fillStyle='rgba(28,33,72,.6)';ctx.fillRect(40,y,310,70);
    ctx.fillStyle='#ffb27a';ctx.font='600 32px Fraunces,serif';
    ctx.fillText(String(s[1]),60,y+44);
    ctx.fillStyle='#8a90b8';ctx.font='13px "Noto Sans SC",sans-serif';
    ctx.fillText(s[0],60,y+62);
  });
  // 情绪分布
  ctx.fillStyle='#8a90b8';ctx.font='14px "Noto Sans SC",sans-serif';
  ctx.fillText('情绪分布',400,190);
  const colors={anxiety:'#ffd166',anger:'#ff8a5c',panic:'#ff5c7a',sadness:'#5cb8ff',tired:'#7ee8d0'};
  let oy=220;
  Object.entries(emoCount).forEach(([e,cnt])=>{
    ctx.fillStyle=colors[e]||'#fff';ctx.beginPath();ctx.arc(415,oy+8,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c8cbe0';ctx.font='15px "Noto Sans SC",sans-serif';
    ctx.fillText(`${EMOTIONS[e].name} × ${cnt}`,435,oy+13);
    // 条形
    const w=Math.min(260, cnt*40);
    ctx.fillStyle=colors[e]||'#fff';ctx.globalAlpha=.25;ctx.fillRect(435,oy+22,w,6);ctx.globalAlpha=1;
    oy+=48;
  });
  // 底部
  ctx.fillStyle='#5a6088';ctx.font='italic 13px Fraunces,serif';
  ctx.fillText('情绪急救箱 · 你走过的每一步都算数',40,960);

  // 下载
  c.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`情绪报告_${year}${String(month).padStart(2,'0')}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast('月报已导出 📤');
  });
});

// 清空记录
$('#clearRecords').addEventListener('click',()=>{
  if(!state.records.length){ toast('暂无记录'); return; }
  if(confirm('确定清空所有情绪日记吗？此操作不可恢复。')){
    state.records=[];
    saveRecords();
    renderDiary();
    toast('已清空');
  }
});

$('#backHomeFromDiary').addEventListener('click',()=>go('home'));

/* ============================================================
   设置弹窗
   ============================================================ */
function openSettings(){
  $('#apiKeyInput').value = state.apiKey;
  $('#remindCheck').checked = state.remind;
  $('#remindTime').value = state.remindTime;
  $('#settingsModal').classList.add('show');
}
$('#closeSettings').addEventListener('click',()=>$('#settingsModal').classList.remove('show'));
$('#settingsModal').addEventListener('click',e=>{
  if(e.target===$('#settingsModal')) $('#settingsModal').classList.remove('show');
});
$('#saveSettings').addEventListener('click',()=>{
  state.apiKey = $('#apiKeyInput').value.trim();
  state.remind = $('#remindCheck').checked;
  state.remindTime = $('#remindTime').value || '21:00';
  localStorage.setItem('mk_api_key', state.apiKey);
  localStorage.setItem('mk_remind', state.remind?'1':'0');
  localStorage.setItem('mk_remind_time', state.remindTime);
  $('#settingsModal').classList.remove('show');
  toast('设置已保存');
  setupReminder();
});

/* ============================================================
   AI 方案生成（Moonshot API，可选）
   ============================================================ */
async function generatePlanViaAPI(emotion, desc){
  const prompt = `你是一位温柔的心理急救助手。用户当前情绪状态：${EMOTIONS[emotion].name}。${desc?'用户描述：'+desc:''}

请生成一个JSON格式的情绪急救方案，包含以下字段：
{
  "validation":"确认用户感受的话术（1-2句，像朋友一样温柔）",
  "breathing":{"type":"呼吸法名称","inhale":4,"hold":7,"exhale":8,"rounds":4},
  "cognitive":["去灾难化话术1","去灾难化话术2","去灾难化话术3"],
  "affirmation":"收尾安抚语（1句，给人力量）",
  "whiteNoise":"推荐的放松场景描述（如'雨夜窗边'）"
}
要求：语气像知心朋友，不用医学术语，不诊断，不建议就医，话术要具体有画面感，总时长5分钟内。只返回JSON。`;

  const res = await fetch('https://api.moonshot.cn/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${state.apiKey}`},
    body:JSON.stringify({
      model:'moonshot-v1-8k',
      messages:[{role:'user',content:prompt}],
      temperature:0.7,
      max_tokens:800
    })
  });
  if(!res.ok) throw new Error('API失败');
  const data = await res.json();
  const content = data.choices[0].message.content;
  const m = content.match(/\{[\s\S]*\}/);
  if(!m) throw new Error('解析失败');
  const plan = JSON.parse(m[0]);
  // 补全字段
  if(!plan.breathing.rounds) plan.breathing.rounds=4;
  return plan;
}

/* ============================================================
   语音合成 TTS（朗读安抚语）
   ============================================================ */
let ttsUtter=null;
function speak(text){
  if(!text) return;
  if(!('speechSynthesis' in window)) return;
  try{
    window.speechSynthesis.cancel();
    ttsUtter = new SpeechSynthesisUtterance(text);
    ttsUtter.lang='zh-CN';
    ttsUtter.rate=0.9;
    ttsUtter.pitch=1.05;
    ttsUtter.volume=0.9;
    window.speechSynthesis.speak(ttsUtter);
  }catch(e){}
}
function stopSpeak(){
  if('speechSynthesis' in window){ try{window.speechSynthesis.cancel();}catch(e){} }
}

/* ============================================================
   白噪音生成（Web Audio API，无音频文件）
   ============================================================ */
let audioCtx=null, wnNodes=[], wnPlaying=false;
function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  }
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}
// 用白噪音 + 低通滤波模拟不同场景
function startWhiteNoise(scene){
  ensureAudio();
  stopWhiteNoise();
  const ctx=audioCtx;
  const bufferSize = 2*ctx.sampleRate;
  const buffer = ctx.createBuffer(1,bufferSize,ctx.sampleRate);
  const out = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){ out[i]=Math.random()*2-1; }
  const src = ctx.createBufferSource();
  src.buffer=buffer;src.loop=true;

  // 根据场景调滤波
  const filter = ctx.createBiquadFilter();
  filter.type='lowpass';
  let freq=800, type='white';
  if(scene && scene.indexOf('雨')>=0){ freq=1200; }
  else if(scene && scene.indexOf('海')>=0){ freq=500; }
  else if(scene && scene.indexOf('溪')>=0 || scene.indexOf('森林')>=0){ freq=900; }
  else if(scene && scene.indexOf('篝火')>=0){ freq=600; }
  filter.frequency.value=freq;

  const gain = ctx.createGain();
  gain.gain.value = ($('#wnVolume').value/100)*0.4;

  src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
  src.start();
  wnNodes=[src,filter,gain];
  wnPlaying=true;

  // 加入缓慢起伏模拟海浪/篝火
  if(scene && (scene.indexOf('海')>=0||scene.indexOf('篝火')>=0)){
    const lfo=ctx.createOscillator();const lfoGain=ctx.createGain();
    lfo.frequency.value=0.15;lfoGain.gain.value=0.15;
    lfo.connect(lfoGain);lfoGain.connect(gain.gain);
    lfo.start();wnNodes.push(lfo,lfoGain);
  }
}
function stopWhiteNoise(){
  wnNodes.forEach(n=>{ try{n.stop&&n.stop();n.disconnect&&n.disconnect();}catch(e){} });
  wnNodes=[];wnPlaying=false;
  $('#wnToggle').classList.remove('playing');
  $('#wnIcon').textContent='🔊';
  $('#wnLabel').textContent='播放白噪音';
}
$('#wnToggle').addEventListener('click',()=>{
  if(wnPlaying){
    stopWhiteNoise();
  } else {
    startWhiteNoise(state.currentPlan?.whiteNoise || '雨夜窗边');
    $('#wnToggle').classList.add('playing');
    $('#wnIcon').textContent='🎵';
    $('#wnLabel').textContent='正在播放';
  }
});
$('#wnVolume').addEventListener('input',()=>{
  if(wnNodes.length){
    const g = wnNodes.find(n=>n.gain);
    if(g) g.gain.value = ($('#wnVolume').value/100)*0.4;
  }
});

/* ============================================================
   危机干预
   ============================================================ */
function showCrisis(){
  $('#crisisModal').classList.add('show');
}
$('#crisisClose').addEventListener('click',()=>$('#crisisModal').classList.remove('show'));

/* ============================================================
   首次引导
   ============================================================ */
if(!localStorage.getItem('mk_onboarded')){
  $('#onboard').classList.add('show');
}
$('#onboardClose').addEventListener('click',()=>{
  $('#onboard').classList.remove('show');
  localStorage.setItem('mk_onboarded','1');
});

/* ============================================================
   每日提醒（Notification API）
   ============================================================ */
function setupReminder(){
  if(!state.remind || !('Notification' in window)) return;
  if(Notification.permission!=='granted'){
    Notification.requestPermission();
  }
  // 每 30 分钟检查一次时间
  setInterval(()=>{
    if(!state.remind) return;
    const now=new Date();
    const [h,m]=state.remindTime.split(':').map(Number);
    if(now.getHours()===h && now.getMinutes()===m){
      if(Notification.permission==='granted'){
        new Notification('情绪急救箱',{body:'今天感觉怎么样？花 1 分钟关心一下自己 🌿'});
      }
    }
  }, 30000);
}
setupReminder();

/* ---------- 初始化 ---------- */
renderDiary();

})();
