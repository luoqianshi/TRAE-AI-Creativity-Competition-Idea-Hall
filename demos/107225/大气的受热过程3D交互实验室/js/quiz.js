// 测验游戏模块 - 基于科学口诀的三阶段挑战
// 科学口诀：太阳定入口，地面定调性，大气定存留
const quizLevels = [
  { 
    title:'关卡1：冰雪破局', 
    desc:'【瓶颈：吃不进】冰雪反照率高达85%，S↓被大量拒之门外。调节参数使地面吸收能量≥150 W/m²。提示：提高太阳高度角（增加入口能量），降低云量（减少削弱）。', 
    target:'groundEnergy', 
    targetLabel:'地面吸收能量', 
    targetMin:150, 
    sliders:['angle','cloud','dust'], 
    defaults:{angle:50,cloud:30,dust:20},
    forceSurface:'snow',
    forceTime:'day' 
  },
  { 
    title:'关卡2：沙漠锁温', 
    desc:'【瓶颈：锁不住】沙漠热容量0.8，白天R地↑飙升但R逆↓极弱。调节参数使大气逆辐射比例≥55%，减小昼夜温差。提示：增加云量/水汽/CO₂（大气定存留）。', 
    target:'atmoIRPercent', 
    targetLabel:'大气逆辐射比例', 
    targetMin:55, 
    sliders:['vapor','co2','cloud'], 
    defaults:{vapor:40,co2:50,cloud:30},
    forceSurface:'desert',
    forceTime:'day' 
  },
  { 
    title:'关卡3：湖泊三环通畅', 
    desc:'【无瓶颈】湖泊热容量4.2，反照率8%，吸收S↓高效。调节参数使昼夜温差≤8°C。提示：增加云量/水汽（增强逆辐射保温），湖泊本身惯性大，配合保温因子实现温度平缓。', 
    target:'tempDiff', 
    targetLabel:'昼夜温差', 
    targetMin:0, 
    targetMax:8, 
    sliders:['cloud','vapor'], 
    defaults:{cloud:30,vapor:40}, 
    forceSurface:'lake' 
  },
  { 
    title:'关卡4：城市夜间热源', 
    desc:'【额外增强】城市热容量2.8，夜间蓄热释放使R地↑反常强劲。调节参数使近地面气温≥18°C。提示：增加水汽/CO₂（增强R逆↓），配合城市夜间额外热源。', 
    target:'airTemp', 
    targetLabel:'近地面气温', 
    targetMin:18, 
    sliders:['vapor','co2','cloud'], 
    defaults:{vapor:40,co2:50,cloud:30},
    forceSurface:'city',
    forceTime:'night' 
  },
  { 
    title:'关卡5：综合挑战', 
    desc:'【科学口诀】太阳定入口（角度+云尘→输入多少），地面定调性（反照率+热容量→如何转化），大气定存留（水汽+CO₂→留存多久）。选择森林地表，使地面吸收能量≥400 W/m²。', 
    target:'groundEnergy', 
    targetLabel:'地面吸收能量', 
    targetMin:400, 
    sliders:['angle','cloud','dust','vapor'], 
    defaults:{angle:50,cloud:30,dust:20,vapor:40},
    forceSurface:'forest'
  }
];

let quizState = { 
  level:0, 
  score:0, 
  completed:[false,false,false,false,false], 
  quizParams:{} 
};

function openQuiz() { 
  openModal('quizModal'); 
  switchLevel(0, document.querySelector('[data-level="0"]')); 
}

function switchLevel(idx, el) {
  quizState.level = idx;
  document.querySelectorAll('.quiz-level-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const lv = quizLevels[idx];
  document.getElementById('quizDesc').innerHTML = `<strong>${lv.title}</strong><br>${lv.desc}`;
  quizState.quizParams = {...lv.defaults};

  const sliderLabels = { 
    angle:'太阳高度角', 
    cloud:'云量', 
    dust:'尘埃浓度', 
    vapor:'水汽含量', 
    co2:'CO₂浓度' 
  };
  
  let html = '';
  lv.sliders.forEach(key => {
    const val = quizState.quizParams[key]||50;
    const max = key==='angle'?90:100, min = key==='angle'?10:0;
    const unit = key==='angle'?'°':'%';
    const pct = key==='angle'?(val-10)/80*100:val;
    html += `<div class="quiz-slider-row"><span class="quiz-slider-label">${sliderLabels[key]}</span><div class="quiz-slider-track"><div class="quiz-slider-fill" id="q${key}Fill" style="width:${pct}%"></div><input type="range" min="${min}" max="${max}" value="${val}" id="q${key}Slider" oninput="updateQuizSlider('${key}',this.value)"></div><span class="quiz-slider-val" id="q${key}Val">${val}${unit}</span></div>`;
  });
  document.getElementById('quizSliders').innerHTML = html;

  if(lv.forceSurface) state.surface = lv.forceSurface;
  if(lv.forceTime) state.time = lv.forceTime;

  document.getElementById('quizFeedback').className = 'quiz-feedback';
  document.getElementById('quizFeedback').style.display = 'none';
  updateQuizResult();
}

function updateQuizSlider(key, value) {
  const val = parseInt(value);
  quizState.quizParams[key] = val;
  const max=key==='angle'?90:100, min=key==='angle'?10:0;
  const pct=(val-min)/(max-min)*100;
  const unit=key==='angle'?'°':'%';
  const fill=document.getElementById('q'+key.charAt(0).toUpperCase()+key.slice(1)+'Fill');
  const valEl=document.getElementById('q'+key.charAt(0).toUpperCase()+key.slice(1)+'Val');
  if(fill) fill.style.width=pct+'%';
  if(valEl) valEl.textContent=val+unit;
  state[key]=val;
  updateQuizResult();
}

function updateQuizResult() {
  const lv=quizLevels[quizState.level], d=calculateData();
  let resultVal, resultPct;
  
  if(lv.target==='groundRatio'){
    resultVal=d.groundRatio;
    resultPct=d.groundRatio;
  }
  else if(lv.target==='groundLW'){
    resultVal=d.groundLW;
    resultPct=Math.min(100, resultVal/400*100);
  }
  else if(lv.target==='atmoIRPercent'){
    resultVal=d.atmoIRPercent;
    resultPct=d.atmoIRPercent;
  }
  else if(lv.target==='tempDiff'){
    resultVal=parseFloat(d.tempDiff);
    resultPct=Math.max(0,30-resultVal)/30*100;
  }
  else if(lv.target==='groundEnergy'){
    resultVal=d.groundEnergy;
    resultPct=Math.min(100,resultVal/700*100);
  }
  
  document.getElementById('quizResultLabel').textContent=lv.targetLabel;
  document.getElementById('quizResultVal').textContent=typeof resultVal==='number'&&!Number.isInteger(resultVal)?resultVal.toFixed(1):resultVal;
  document.getElementById('quizResultFill').style.width=Math.min(100,resultPct)+'%';
}

function submitQuiz() {
  const lv=quizLevels[quizState.level], d=calculateData();
  let passed=false;
  
  if(lv.target==='groundRatio') passed=d.groundRatio>=lv.targetMin;
  else if(lv.target==='groundLW') passed=d.groundLW>=lv.targetMin;
  else if(lv.target==='atmoIRPercent') passed=d.atmoIRPercent>=lv.targetMin;
  else if(lv.target==='tempDiff') passed=parseFloat(d.tempDiff)<=(lv.targetMax||10);
  else if(lv.target==='groundEnergy') passed=d.groundEnergy>=lv.targetMin;

  const fb=document.getElementById('quizFeedback');
  if(passed){
    if(!quizState.completed[quizState.level]){
      quizState.completed[quizState.level]=true;
      quizState.score+=20;
    }
    fb.className='quiz-feedback success'; 
    fb.style.display='block';
    fb.innerHTML=`✅ 恭喜通过！${lv.targetLabel}达到要求。得分 +20，当前总分：${quizState.score}`;
    document.querySelectorAll('.quiz-level-btn')[quizState.level].classList.add('completed');
  } else {
    fb.className='quiz-feedback fail'; 
    fb.style.display='block';
    let hint='';
    if(lv.target==='groundRatio') hint='当前到达地面比例为'+d.groundRatio+'%，需要≥'+lv.targetMin+'%。尝试降低云量和尘埃，提高太阳高度角。';
    else if(lv.target==='groundLW') hint='当前地面长波辐射为'+d.groundLW+' W/m²，需要≥'+lv.targetMin+' W/m²。尝试提高太阳高度角、减少云量、选择沙漠地表。';
    else if(lv.target==='atmoIRPercent') hint='当前大气逆辐射比例为'+d.atmoIRPercent+'%，需要≥'+lv.targetMin+'%。尝试增加水汽、CO₂和云量。';
    else if(lv.target==='tempDiff') hint='当前昼夜温差为'+d.tempDiff+'°C，需要≤'+(lv.targetMax||10)+'°C。尝试增加云量和水汽。';
    else if(lv.target==='groundEnergy') hint='当前地面吸收能量为'+d.groundEnergy+' W/m²，需要≥'+lv.targetMin+' W/m²。综合调整各参数。';
    fb.innerHTML=`❌ 未达到目标。${hint}`;
  }
  document.getElementById('quizScore').textContent='总分：'+quizState.score;
}

function resetQuizLevel() {
  const lv=quizLevels[quizState.level];
  quizState.quizParams={...lv.defaults};
  switchLevel(quizState.level, document.querySelector(`[data-level="${quizState.level}"]`));
}
