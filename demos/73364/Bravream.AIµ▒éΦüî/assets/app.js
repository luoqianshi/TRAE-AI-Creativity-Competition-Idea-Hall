if(!CanvasRenderingContext2D.prototype.roundRect){CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){if(w<2*r)r=w/2;if(h<2*r)r=h/2;this.beginPath();this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();return this}}

// ===== Stardust Background =====
const sCanvas=document.getElementById('stardust-canvas'),sCtx=sCanvas.getContext('2d');
let stardust=[],stardustFrame,pointerX=innerWidth*.5,pointerY=innerHeight*.42;
function resizeStardust(){const r=devicePixelRatio||1;sCanvas.width=Math.max(1,Math.floor(innerWidth*r));sCanvas.height=Math.max(1,Math.floor(innerHeight*r));sCanvas.style.width=innerWidth+'px';sCanvas.style.height=innerHeight+'px';sCtx.setTransform(r,0,0,r,0,0);createStardust()}
function createStardust(){const w=innerWidth,h=innerHeight;const n=Math.round(Math.min(360,Math.max(180,w/5.2)));stardust=Array.from({length:n},()=>({alpha:Math.random()*.7+.42,depth:Math.random()*.78+.34,drift:Math.random()*.46+.12,hue:Math.random()>.62?'255, 226, 160':Math.random()>.36?'148, 226, 255':'220, 203, 255',pulse:Math.random()*Math.PI*2,size:Math.random()*3.2+.9,x:Math.random()*w*.76,y:Math.random()*h*.7}))}
function drawStardust(now=0){const w=innerWidth,h=innerHeight;sCtx.clearRect(0,0,w,h);stardust.forEach(p=>{const pullX=(pointerX-p.x)*.00016*p.depth,pullY=(pointerY-p.y)*.0001*p.depth;p.x+=p.drift*p.depth+pullX;p.y+=Math.sin(now*.00078+p.pulse)*.075+pullY;if(p.x>w*.82){p.x=-8;p.y=Math.random()*h*.7}const tw=.42+Math.sin(now*.00235+p.pulse)*.58,a=Math.min(1,p.alpha*tw),radius=p.size*p.depth;sCtx.shadowBlur=18*p.depth;sCtx.shadowColor=`rgba(${p.hue}, ${Math.min(1,a*.9)})`;sCtx.fillStyle=`rgba(${p.hue}, ${a})`;sCtx.beginPath();sCtx.arc(p.x,p.y,radius,0,Math.PI*2);sCtx.fill();sCtx.shadowBlur=0;if(p.depth>.86&&a>.58){sCtx.globalAlpha=a*.42;sCtx.strokeStyle=`rgba(${p.hue}, 1)`;sCtx.lineWidth=.65;sCtx.beginPath();sCtx.moveTo(p.x-radius*2.4,p.y);sCtx.lineTo(p.x+radius*2.4,p.y);sCtx.moveTo(p.x,p.y-radius*2.4);sCtx.lineTo(p.x,p.y+radius*2.4);sCtx.stroke();sCtx.globalAlpha=1}});stardustFrame=requestAnimationFrame(drawStardust)}
addEventListener('pointermove',e=>{pointerX=e.clientX;pointerY=e.clientY});
addEventListener('resize',resizeStardust);resizeStardust();drawStardust();

// ===== Home Ambient Light (鼠标跟随效果) =====
const homeEl=document.getElementById('page-home');
homeEl.addEventListener('pointermove',e=>{
  const rect=document.body.getBoundingClientRect();
  const x=((e.clientX-rect.left)/rect.width*100).toFixed(1);
  const y=((e.clientY-rect.top)/rect.height*100).toFixed(1);
  document.documentElement.style.setProperty('--home-ambient-x',x+'%');
  document.documentElement.style.setProperty('--home-ambient-y',y+'%');
});

// ===== Home Title Rotation (瞬间替换，无动画) =====
const TITLES=['今天想聊聊哪些求职问题？','求职上遇到了哪些卡点？','今天想先解决哪个求职问题？','有什么求职难题需要我一起看看？','有什么求职难题我能帮你的吗？','有什么拿不准的，我陪你一起看看。','今天需要哪个求职顾问帮你解决问题？','最近找工作有什么拿不准的事情？','今天想让 Bravream 帮你看什么？','别急，今天先解决一个求职问题。'];
let titleIdx=Math.floor(Math.random()*TITLES.length);
document.getElementById('home-title').textContent=TITLES[titleIdx];
setInterval(()=>{titleIdx=(titleIdx+1)%TITLES.length;document.getElementById('home-title').textContent=TITLES[titleIdx]},30000);

// ===== Home Sender Particle Motion (粒子数量基于输入文本长度 + 安全超时) =====
const hPCanvas=document.getElementById('home-particle-canvas'),hPCtx=hPCanvas.getContext('2d');
let hPFrame,hMotionReset;
function pickHomeColor(){const r=Math.random();if(r>.68)return'255, 226, 160';if(r>.38)return'148, 226, 255';if(r>.16)return'240, 171, 252';return'124, 58, 237'}
function resizeHPCanvas(){const motion=document.getElementById('home-sender-motion');const sender=motion.querySelector('.home-sender');const rect=sender.getBoundingClientRect();const r=devicePixelRatio||1;hPCanvas.width=Math.max(1,Math.floor(rect.width*r));hPCanvas.height=Math.max(1,Math.floor(rect.height*r));hPCanvas.style.width=rect.width+'px';hPCanvas.style.height=rect.height+'px';hPCtx.setTransform(r,0,0,r,0,0);return rect}
function playHomeMotion(intro){
  const rect=resizeHPCanvas();
  const value=document.getElementById('home-input').value.trim()||'Bravream';
  // 粒子数量基于输入文本长度
  const count=intro?260:Math.max(120,Math.min(230,value.length*10));
  const ps=[];
  for(let i=0;i<count;i++){
    const c=pickHomeColor();let x,y;
    if(intro){const fromLeft=Math.random()>.5;x=fromLeft?Math.random()*42+10:rect.width-Math.random()*56-10;y=rect.height*(.24+Math.random()*.52)}
    else{x=58+Math.random()*Math.max(120,rect.width-136);y=rect.height*.36+Math.random()*Math.max(18,rect.height*.24)}
    ps.push({alpha:Math.random()*.52+.3,color:c,phase:'scatter',size:Math.random()*2.4+1.1,targetX:rect.width*(.18+Math.random()*.64),targetY:rect.height*(.34+Math.random()*.32),vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*6,x,y})
  }
  const start=performance.now(),duration=intro?2100:1550;
  const motion=document.getElementById('home-sender-motion');motion.classList.add('home-sender-motion--live');
  if(hPFrame)cancelAnimationFrame(hPFrame);
  if(hMotionReset)clearTimeout(hMotionReset);
  let didResolve=false;
  function finishMotion(){if(didResolve)return;didResolve=true;hPCtx.clearRect(0,0,rect.width,rect.height);hPFrame=undefined;motion.classList.remove('home-sender-motion--live')}
  function frame(now){
    const elapsed=now-start;hPCtx.clearRect(0,0,rect.width,rect.height);
    if(elapsed>(intro?360:520)){ps.forEach((p,i)=>{const row=i%3;p.phase='form';p.targetX=rect.width*(intro?.13:.16)+Math.random()*rect.width*(intro?.64:.55);p.targetY=rect.height*(.36+row*.13)+Math.random()*5})}
    const scale=intro?1.24:1,ab=intro?.18:0;
    ps.forEach(p=>{if(p.phase==='scatter'){p.x+=p.vx;p.y+=p.vy;p.vx*=.91;p.vy*=.91}else{p.x+=(p.targetX-p.x)*.075;p.y+=(p.targetY-p.y)*.075}hPCtx.fillStyle=`rgba(${p.color}, ${Math.min(1,p.alpha+ab)})`;hPCtx.beginPath();hPCtx.roundRect(p.x,p.y,p.size*scale,p.size*scale,1);hPCtx.fill()});
    if(elapsed<duration){hPFrame=requestAnimationFrame(frame);return}
    finishMotion()
  }
  hPFrame=requestAnimationFrame(frame);
  // 安全超时
  hMotionReset=setTimeout(finishMotion,intro?duration+150:1700)
}
// intro 动画延迟520ms
setTimeout(()=>playHomeMotion(true),520);

// ===== Chat Sender Particle Motion (精确参数) =====
const cPCanvas=document.getElementById('chat-particle-canvas'),cPCtx=cPCanvas.getContext('2d');
let cPFrame,cMotionReset;
// 颜色：紫色76%/粉紫24%
function pickChatColor(){return Math.random()>.24?'124, 58, 237':'240, 171, 252'}
function resizeCPCanvas(){const motion=document.getElementById('chat-sender-motion');const sender=motion.querySelector('.chat-sender');const rect=sender.getBoundingClientRect();const r=devicePixelRatio||1;cPCanvas.width=Math.max(1,Math.floor(rect.width*r));cPCanvas.height=Math.max(1,Math.floor(rect.height*r));cPCanvas.style.width=rect.width+'px';cPCanvas.style.height=rect.height+'px';cPCtx.setTransform(r,0,0,r,0,0);return rect}
function playChatMotion(intro){
  const rect=resizeCPCanvas();
  const value=document.getElementById('chat-input').value.trim()||'Bravream';
  // 粒子数量
  const count=intro?260:Math.max(120,Math.min(230,value.length*10));
  const ps=[];
  // textBox 精确参数
  const textBox={x:58,y:rect.height*.36,w:Math.max(120,rect.width-136),h:Math.max(18,rect.height*.24)};
  for(let i=0;i<count;i++){
    const c=pickChatColor();let x,y;
    if(intro){const fromLeft=Math.random()>.5;x=fromLeft?Math.random()*42+10:rect.width-Math.random()*56-10;y=rect.height*(.24+Math.random()*.52)}
    else{x=textBox.x+Math.random()*textBox.w;y=textBox.y+Math.random()*textBox.h}
    ps.push({alpha:Math.random()*.52+.3,color:c,phase:'scatter',size:Math.random()*2.4+1.1,targetX:rect.width*(.18+Math.random()*.64),targetY:rect.height*(.34+Math.random()*.32),vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*6,x,y})
  }
  const start=performance.now(),duration=intro?2100:1550;
  const motion=document.getElementById('chat-sender-motion');motion.classList.add('chat-sender-motion--live');
  if(cPFrame)cancelAnimationFrame(cPFrame);
  if(cMotionReset)clearTimeout(cMotionReset);
  let didResolve=false;
  function finishMotion(){if(didResolve)return;didResolve=true;cPCtx.clearRect(0,0,rect.width,rect.height);cPFrame=undefined;motion.classList.remove('chat-sender-motion--live')}
  function frame(now){
    const elapsed=now-start;cPCtx.clearRect(0,0,rect.width,rect.height);
    // 白色半透明背景层
    cPCtx.fillStyle='rgba(255, 255, 255, 0.12)';cPCtx.fillRect(2,2,rect.width-4,rect.height-4);
    // 520ms后切换到form阶段
    if(elapsed>520){ps.forEach((p,i)=>{const row=i%3;p.phase='form';p.targetX=rect.width*.16+Math.random()*rect.width*.55;p.targetY=rect.height*(.36+row*.13)+Math.random()*5})}
    ps.forEach(p=>{if(p.phase==='scatter'){p.x+=p.vx;p.y+=p.vy;p.vx*=.91;p.vy*=.91}else{p.x+=(p.targetX-p.x)*.075;p.y+=(p.targetY-p.y)*.075}cPCtx.fillStyle=`rgba(${p.color}, ${Math.min(1,p.alpha)})`;cPCtx.beginPath();cPCtx.roundRect(p.x,p.y,p.size,p.size,1);cPCtx.fill()});
    if(elapsed<duration){cPFrame=requestAnimationFrame(frame);return}
    finishMotion()
  }
  cPFrame=requestAnimationFrame(frame);
  // 安全超时
  cMotionReset=setTimeout(finishMotion,intro?duration+150:1700)
}

// ===== Navigation =====
function goHome(){
  document.getElementById('page-home').classList.remove('page--hidden');
  document.getElementById('page-chat').classList.add('page--hidden');
  document.getElementById('nav').style.display='';
  document.getElementById('nav').className='nav nav--dark';
  document.getElementById('nav-login-btn').style.display='inline-flex';
  document.getElementById('nav-profile-btn').style.display='none';
  setTimeout(()=>playHomeMotion(true),300)
}
function enterChat(){
  document.getElementById('page-home').classList.add('page--hidden');
  document.getElementById('page-chat').classList.remove('page--hidden');
  document.getElementById('nav').style.display='none';
  if(!chatInited)initChat()
}

// ===== Home Submit (先播放粒子动画，动画结束后再进入聊天页) =====
function homeSubmit(){
  const val=document.getElementById('home-input').value.trim()||'请帮我优化简历';
  playHomeMotion(false);
  // 动画结束后进入聊天页
  setTimeout(()=>{enterChat();setTimeout(()=>sendUserMessage(val,true),400)},1700)
}
function quickAction(label,text){document.getElementById('home-input').value=text;homeSubmit()}
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px'}
function toggleWeb(btn){btn.classList.toggle('home-sender__web-btn--active')}

// ===== Answer Trace =====
function playAnswerTrace(){
  const sendBtn=document.getElementById('home-send-btn');const rect=sendBtn.getBoundingClientRect();
  const startX=rect.left+rect.width/2,startY=rect.top+rect.height/2;
  const targetX=innerWidth*.235,targetY=innerHeight*.58;
  const dx=targetX-startX,dy=targetY-startY;const distance=Math.hypot(dx,dy);
  const angle=Math.atan2(dy,dx)*180/Math.PI;
  const trace=document.getElementById('answer-trace');
  trace.style.setProperty('--home-trace-x',startX+'px');
  trace.style.setProperty('--home-trace-y',startY+'px');
  trace.style.setProperty('--home-trace-angle',angle+'deg');
  trace.style.setProperty('--home-trace-length',Math.max(280,distance)+'px');
  trace.classList.remove('home__answer-trace--active');
  requestAnimationFrame(()=>{trace.classList.add('home__answer-trace--active');setTimeout(()=>trace.classList.remove('home__answer-trace--active'),2200)})
}

// ===== Chat =====
let isReplying=false,chatInited=false;
const MOCK={
  resume:{skill:'简历优化顾问 · Trae',text:'我已经分析了你的简历，整体评价如下：\n\n**✅ 优点：**\n- 有明确的产品方向，项目经验丰富\n- 经历了从0到1的产品搭建过程\n- 有数据支撑的成果展示\n\n**📝 待优化：**\n- 个人简介可以更精炼，突出核心优势\n- 项目经历的 STAR 法则可以更清晰\n- 技能部分可以更有针对性\n\n需要我帮你生成优化后的完整简历吗？',suggestions:['生成优化版简历','只优化项目经历','看看匹配职位','继续聊点别的']},
  position:{skill:'职位分析/排雷顾问 · Trae',text:'根据你的简历，我为你匹配了以下职位：\n\n共找到 **12 个** 高度匹配的职位，平均匹配度 87%。点击右侧面板可以查看详情。',suggestions:['查看推荐职位','按薪资筛选','按行业筛选','帮我分析差距']},
  default:{skill:'Trae 求职教练',text:'好的，我来帮你分析一下。根据你的情况，我建议从以下几个方向入手：\n\n- 明确目标岗位的核心要求\n- 梳理自身经历与岗位的匹配点\n- 针对性优化简历表达\n\n你希望我从哪个方面开始？',suggestions:['先看看整体评价','优化项目经历','生成完整简历','匹配适合的职位']}
};

function initChat(){
  chatInited=true;
  // 初始职业规划对话历史（带报告卡片）
  addMsg('user','请帮我做一次求职诊断和职业定位',null,null,true);
  addMsg('ai','职业规划顾问 · Trae\n你好李明！我是梦想想，你的求职顾问。\n\n今天想聊点什么？是简历、岗位、面试，还是有什么新的想法或卡点想一起看看？',null,null,true);
  addReportCard('职业定位/求职规划报告','已完成职业方向诊断、岗位分层和投递策略规划。','主线方向：AI产品负责人/产品总监(AI Native / HRTech)');
  addFeedback('这次回答你感觉 Bravream 有理解你的背景和求职状态吗？',['很懂我','基本懂我','不太懂我']);
  addFeedback('这次建议对你下一步求职行动有帮助吗？',['可以直接用','稍作调整可用','不太能用']);
  openResumePanel();
  // 聊天发送器 intro 动画延迟900ms
  setTimeout(()=>playChatMotion(true),900)
}

function addReportCard(title,meta,tag){
  const shell=document.getElementById('chat-messages-shell');
  const wrap=document.createElement('div');wrap.className='chat-msg chat-msg--ai';
  const avatar=document.createElement('div');avatar.className='chat-msg__avatar chat-msg__avatar--ai';avatar.textContent='AI';
  const body=document.createElement('div');body.className='chat-msg__body';
  const card=document.createElement('div');card.className='chat-report-card';card.onclick=openResumePanel;
  card.innerHTML='<div class="chat-report-card__cover"><span class="ms">analytics</span></div><div class="chat-report-card__main"><div class="chat-report-card__title">'+title+'</div><div class="chat-report-card__tags"><span class="chat-report-card__tag">'+tag+'</span></div><div class="chat-report-card__meta">'+meta+'</div></div><div class="chat-report-card__arrow"><span class="ms">chevron_right</span></div>';
  body.appendChild(card);wrap.appendChild(avatar);wrap.appendChild(body);shell.appendChild(wrap);
}

function addFeedback(label,options){
  const shell=document.getElementById('chat-messages-shell');
  const wrap=document.createElement('div');wrap.className='chat-msg chat-msg--ai';
  const avatar=document.createElement('div');avatar.className='chat-msg__avatar chat-msg__avatar--ai';avatar.textContent='AI';
  const body=document.createElement('div');body.className='chat-msg__body';
  const fb=document.createElement('div');fb.className='chat-feedback';
  const lbl=document.createElement('div');lbl.className='chat-feedback__label';lbl.textContent=label;
  fb.appendChild(lbl);
  options.forEach(opt=>{
    const btn=document.createElement('button');btn.className='chat-feedback__btn';btn.textContent=opt;
    btn.onclick=()=>{document.querySelectorAll('.chat-feedback__btn').forEach(b=>b.classList.remove('chat-feedback__btn--active'));btn.classList.add('chat-feedback__btn--active')};
    fb.appendChild(btn);
  });
  body.appendChild(fb);wrap.appendChild(avatar);wrap.appendChild(body);shell.appendChild(wrap);
}

function addMsg(role,text,suggestions,type,silent){
  const empty=document.getElementById('chat-message-empty');if(empty)empty.remove();
  const shell=document.getElementById('chat-messages-shell');
  const wrap=document.createElement('div');wrap.className=`chat-msg chat-msg--${role}`;
  // Vue Transition 类名
  if(!silent)wrap.classList.add('chat-message-list-enter-active','chat-message-list-enter-from');
  const avatar=document.createElement('div');avatar.className=`chat-msg__avatar chat-msg__avatar--${role}`;avatar.textContent=role==='ai'?'AI':'你';
  const body=document.createElement('div');body.className='chat-msg__body';
  if(type==='typing'){
    const bubble=document.createElement('div');bubble.className='chat-msg__bubble chat-msg__bubble--ai';
    bubble.innerHTML='<div class="chat-msg__typing"><span></span><span></span><span></span></div>';
    body.appendChild(bubble);wrap.appendChild(avatar);wrap.appendChild(body);shell.appendChild(wrap);scrollBottom();return wrap
  }
  if(role==='ai'&&text.includes('· Trae')){
    const label=document.createElement('div');label.className='chat-msg__skill-label';
    label.textContent=text.split('\n')[0];body.appendChild(label);
    text=text.split('\n').slice(1).join('\n')
  }
  const bubble=document.createElement('div');bubble.className=`chat-msg__bubble chat-msg__bubble--${role}`;
  const lines=text.split('\n');let html='',inList=false;
  lines.forEach(line=>{const t=line.trim();
    if(t.startsWith('- ')||t.startsWith('• ')){if(!inList){html+='<ul>';inList=true}html+=`<li>${t.substring(2).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</li>`}
    else{if(inList){html+='</ul>';inList=false}if(t)html+=`<p>${t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</p>`;else html+='<p style="height:.5em"></p>'}});
  if(inList)html+='</ul>';bubble.innerHTML=html;body.appendChild(bubble);
  if(suggestions&&suggestions.length){
    const s=document.createElement('div');s.className='chat-msg__suggestions';
    suggestions.forEach(sug=>{const chip=document.createElement('button');chip.className='chat-sender-agent__item';chip.style.height='30px';chip.style.fontSize='13px';chip.innerHTML=`<span class="chat-sender-agent__label">${sug}</span>`;chip.onclick=()=>sendUserMessage(sug);s.appendChild(chip)});
    body.appendChild(s)
  }
  wrap.appendChild(avatar);wrap.appendChild(body);shell.appendChild(wrap);
  if(!silent){requestAnimationFrame(()=>{wrap.classList.remove('chat-message-list-enter-from');wrap.classList.add('chat-message-list-enter-to')})}
  scrollBottom();return wrap
}
function scrollBottom(){const el=document.getElementById('chat-messages');el.scrollTop=el.scrollHeight}
function sendMessage(){if(isReplying)return;const input=document.getElementById('chat-input');const text=input.value.trim();if(!text)return;input.value='';autoResize(input);playChatMotion(false);setTimeout(()=>sendUserMessage(text),300)}
function quickActionChat(label,text){document.getElementById('chat-input').value=text;sendMessage()}
function sendUserMessage(text,fromHome){
  if(isReplying&&!fromHome)return;
  if(fromHome){isReplying=false}
  addMsg('user',text);
  isReplying=true;document.getElementById('chat-send-btn').disabled=true;
  const typing=addMsg('ai','','','typing');
  const delay=800+Math.random()*800;
  setTimeout(()=>{
    typing.remove();
    let r=MOCK.default;
    if(text.includes('简历')||text.includes('优化'))r=MOCK.resume;
    else if(text.includes('匹配')||text.includes('职位')||text.includes('岗位'))r=MOCK.position;
    const fullText=r.skill+'\n'+r.text;
    addMsg('ai',fullText,r.suggestions);
    if(text.includes('简历')||text.includes('优化'))setTimeout(showResumeCard,600);
    if(text.includes('匹配')||text.includes('职位')||text.includes('岗位'))setTimeout(showPositionCard,600);
    isReplying=false;document.getElementById('chat-send-btn').disabled=false
  },delay)
}
function showResumeCard(){
  const lastBubble=document.querySelector('.chat-msg:last-child .chat-msg__bubble');
  if(!lastBubble)return;
  const card=document.createElement('div');card.className='chat-resume-card';card.onclick=openResumePanel;
  card.innerHTML='<div class="chat-resume-card__icon"><span class="ms">description</span></div><div class="chat-resume-card__text"><div class="chat-resume-card__title">优化后的简历 · 李明</div><div class="chat-resume-card__desc">高级产品经理 · 5年经验 · 点击查看</div></div>';
  lastBubble.appendChild(card)
}
function showPositionCard(){
  const lastBubble=document.querySelector('.chat-msg:last-child .chat-msg__bubble');
  if(!lastBubble)return;
  const card=document.createElement('div');card.className='chat-resume-card';card.onclick=openPositionPanel;
  card.innerHTML='<div class="chat-resume-card__icon"><span class="ms">business_center</span></div><div class="chat-resume-card__text"><div class="chat-resume-card__title">推荐职位 · 12个结果</div><div class="chat-resume-card__desc">平均匹配度 87% · 点击查看</div></div>';
  lastBubble.appendChild(card)
}
function openResumePanel(){
  document.getElementById('panel-title').textContent='职业定位/求职规划报告';
  document.getElementById('panel-subtitle').textContent='职业方向诊断与投递策略';
  document.getElementById('panel-body').innerHTML=`
<div class="report-detail">
  <div class="report-detail__section">
    <div class="report-detail__section-title">职业规划顾问</div>
    <div class="report-detail__text">你当前最适合先围绕「AI产品负责人/产品总监(AI Native / HRTech)」建立主线岗位池，再用扩展和冲刺方向做小比例验证。</div>
    <div class="report-detail__meta">本科 / 网络信息安全 / 10年以上，求职类型：全职，期望城市：北京市，期望方向：产品经理，当前薪资：50k/月，期望薪资：55k-60k/月。</div>
  </div>
  <div class="report-detail__section">
    <div class="report-detail__section-title" style="display:flex;align-items:center;gap:6px"><span class="ms" style="font-size:18px;color:var(--mz-primary)">timeline</span>推荐方向</div>
    <div class="report-card report-card--main">
      <div class="report-card__badge">主线</div>
      <div class="report-card__title">AI产品负责人/产品总监(AI Native / HRTech)</div>
      <div class="report-card__desc">最贴近你当前画像、已有经历或已填写的求职意向，适合作为优先验证方向。</div>
      <div class="report-card__tip">难度：中等 · 先整理3段能支撑该方向的经历，再匹配岗位池。</div>
    </div>
    <div class="report-card report-card--expand">
      <div class="report-card__badge" style="background:color-mix(in srgb,#7c3aed 15%,transparent);color:#7c3aed">扩展</div>
      <div class="report-card__title">高级产品总监相邻方向</div>
      <div class="report-card__desc">可以利用最近经历降低转向成本，适合作为备选岗位池。</div>
      <div class="report-card__tip">难度：中等 · 用10-15个岗位测试是否有面试反馈。</div>
    </div>
    <div class="report-card report-card--sprint">
      <div class="report-card__badge" style="background:color-mix(in srgb,#f59e0b 15%,transparent);color:#f59e0b">冲刺</div>
      <div class="report-card__title">更高平台或更高薪资岗位</div>
      <div class="report-card__desc">可以保留少量冲刺，但需要更强项目结果或岗位相关证据支撑。</div>
      <div class="report-card__tip">难度：较高 · 控制投递比例，优先用内推或强匹配岗位验证。</div>
    </div>
    <div class="report-card report-card--avoid">
      <div class="report-card__badge" style="background:color-mix(in srgb,#ef4444 15%,transparent);color:#ef4444">不建议</div>
      <div class="report-card__title">与经历和底线冲突较大的方向</div>
      <div class="report-card__desc">短期投入产出比不稳定，容易消耗时间且难形成有效反馈。</div>
      <div class="report-card__tip">难度：高 · 等主线方向跑出反馈后再考虑。</div>
    </div>
  </div>
  <div class="report-detail__section">
    <div class="report-detail__section-title" style="display:flex;align-items:center;gap:6px"><span class="ms" style="font-size:18px;color:var(--mz-primary)">psychology</span>当前求职状态诊断</div>
    <div class="report-detail__list">
      <div class="report-detail__list-item">当前重点不是一次性投很多岗位，而是先把主线方向、扩展方向和不建议方向分清楚。</div>
      <div class="report-detail__list-item">如果投递无反馈，优先检查岗位池选择和简历证据是否支持目标方向。</div>
      <div class="report-detail__list-item">如果目标薪资和方向存在冲突，需要先明确薪资、稳定、成长、城市之间的优先级。</div>
    </div>
  </div>
</div>`;
  openPanel()
}
function openPositionPanel(){
  document.getElementById('panel-title').textContent='推荐职位（12个）';
  const jobs=[{t:'高级产品经理（B端SaaS）',s:'30-50K',c:'某知名科技公司',m:92,tags:['B端','SaaS','5年+']},{t:'AI产品经理',s:'35-55K',c:'某AI创业公司',m:88,tags:['AI产品','大模型']},{t:'产品专家 - 企业服务线',s:'40-60K',c:'某大厂',m:85,tags:['专家岗','8年+']},{t:'资深产品经理（CRM方向）',s:'28-45K',c:'某SaaS公司',m:83,tags:['CRM','SaaS']}];
  document.getElementById('panel-body').innerHTML=jobs.map(j=>`<div class="job-card"><div class="job-card__head"><span class="job-card__title">${j.t}</span><span class="job-card__salary">${j.s}</span></div><div class="job-card__company">${j.c}</div><div class="job-card__tags">${j.tags.map(t=>`<span class="resume-detail__tag">${t}</span>`).join('')}</div><div class="job-card__match"><div class="job-card__bar"><div class="job-card__bar-fill" style="width:${j.m}%"></div></div><span class="job-card__match-text">${j.m}% 匹配</span></div></div>`).join('');
  openPanel()
}
function openPanel(){document.getElementById('chat-page').classList.remove('chat-page--content-collapsed')}
function togglePanel(){document.getElementById('chat-page').classList.toggle('chat-page--content-collapsed')}
// ===== Chat Toolbar Tabs (消息/岗位/文件) =====
function switchTool(tool,btn){
  document.querySelectorAll('.chat-toolbar__item').forEach(i=>i.classList.remove('chat-toolbar__item--active'));
  if(btn)btn.classList.add('chat-toolbar__item--active');
  document.querySelectorAll('.chat-page__main > [data-tool]').forEach(el=>{el.style.display=el.getAttribute('data-tool')===tool?'':'none'});
  // 切到文件/岗位时折叠右侧内容面板
  if(tool!=='message')document.getElementById('chat-page').classList.add('chat-page--content-collapsed');
}

function newChat(){
  document.getElementById('chat-messages-shell').innerHTML='';
  document.querySelectorAll('.chat-conv-item').forEach(i=>i.classList.remove('chat-conv-item--active'));
  document.getElementById('chat-page').classList.add('chat-page--content-collapsed');
  showEmpty()
}
function switchConv(el){
  document.querySelectorAll('.chat-conv-item').forEach(i=>i.classList.remove('chat-conv-item--active'));
  el.classList.add('chat-conv-item--active');
  const title=el.querySelector('.chat-conv-item__title').textContent;
  if(title.includes('简历')){document.getElementById('chat-messages-shell').innerHTML='';addMsg('user','请帮我优化简历',null,null,true);addMsg('ai',MOCK.resume.skill+'\n'+MOCK.resume.text,MOCK.resume.suggestions,null,true);openResumePanel()}
  else if(title.includes('职位')){document.getElementById('chat-messages-shell').innerHTML='';addMsg('user','帮我匹配职位',null,null,true);addMsg('ai',MOCK.position.skill+'\n'+MOCK.position.text,MOCK.position.suggestions,null,true);openPositionPanel()}
  else{newChat()}
}
function delConv(btn){const item=btn.closest('.chat-conv-item');item.remove()}
function showEmpty(){
  const shell=document.getElementById('chat-messages-shell');shell.innerHTML='';
  // class名 chat-message-empty
  const empty=document.createElement('div');empty.className='chat-message-empty';empty.id='chat-message-empty';
  empty.innerHTML='<div class="chat-message-empty__inner"><h2 class="chat-message-empty__title"><span class="chat-message-empty__greeting">Hey！李明~</span><span class="chat-message-empty__question">今天想聊聊哪些求职问题？</span></h2></div>';
  shell.appendChild(empty);
  empty.addEventListener('pointermove',e=>{empty.style.setProperty('--chat-empty-ambient-x',e.clientX/innerWidth*100+'%');empty.style.setProperty('--chat-empty-ambient-y',e.clientY/innerHeight*100+'%')})
}
function toggleSidebar(){document.getElementById('chat-sidebar').classList.toggle('chat-sidebar--collapsed');document.getElementById('chat-page').classList.toggle('chat-page--sidebar-collapsed')}
function toggleGroup(el){el.parentElement.classList.toggle('chat-sidebar__group--collapsed')}

// ===== Resize Handle =====
let isResizing=false;
document.getElementById('resize-handle').addEventListener('mousedown',e=>{isResizing=true;document.body.style.cursor='col-resize';document.body.style.userSelect='none';document.getElementById('chat-page').classList.add('chat-page--resizing')});
document.addEventListener('mousemove',e=>{
  if(!isResizing)return;
  const page=document.getElementById('chat-page');const rect=page.getBoundingClientRect();
  const sidebarW=document.getElementById('chat-sidebar').classList.contains('chat-sidebar--collapsed')?64:260;
  const contentW=Math.max(350,Math.min(rect.width-sidebarW-350,rect.width-e.clientX-8));
  page.style.gridTemplateColumns=`${sidebarW}px minmax(350px,1fr) 0 ${contentW}px`
});
document.addEventListener('mouseup',()=>{if(isResizing){isResizing=false;document.body.style.cursor='';document.body.style.userSelect='';document.getElementById('chat-page').classList.remove('chat-page--resizing')}});

// ===== Init =====
// 默认停留在首页，展示星尘粒子、光柱、环境光等核心视觉
// 用户点击"登录"按钮或在首页发送框发送内容后，才进入聊天页
