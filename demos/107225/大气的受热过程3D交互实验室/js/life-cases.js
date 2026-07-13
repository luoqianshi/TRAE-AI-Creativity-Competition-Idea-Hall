// 生活案例模块
const caseData = [
  { 
    title:'1. 多云夜晚为何更暖？', 
    html:`<ul><li>晴朗夜晚云量少，<strong>大气逆辐射弱</strong>，地面热量容易散失到太空；</li><li>多云夜晚云层厚，水汽多，<strong>大气逆辐射强</strong>，把很多热量"还给"地面；</li><li>因此地面降温慢，气温较高。</li></ul><div class="case-conclusion">结论：多云夜晚 → 大气保温(逆辐射)作用强 → 夜间更暖。</div>` 
  },
  { 
    title:'2. 沙漠昼夜温差为何大？', 
    html:`<ul><li>沙漠地区<strong>云量少、水汽少、植被稀疏</strong>，白天大气削弱作用弱，太阳辐射大量到达地面，地表迅速升温；</li><li>夜晚大气逆辐射极弱，地面长波辐射大量散失到太空，降温剧烈；</li><li>沙漠地表比热容小，升温降温都快，进一步放大温差。</li></ul><div class="case-conclusion">结论：沙漠 → 削弱弱+保温弱 → 昼夜温差极大（可达30°C以上）。</div>` 
  },
  { 
    title:'3. 霜冻为何多在晴朗无风夜？', 
    html:`<ul><li>晴朗夜晚<strong>云量极少</strong>，大气逆辐射非常弱，地面热量快速散失；</li><li>无风条件下，近地面冷空气无法与上层暖空气混合，<strong>辐射冷却效应</strong>更加显著；</li><li>地面温度降至0°C以下，水汽凝华形成霜冻。</li></ul><div class="case-conclusion">结论：晴朗无风夜 → 逆辐射极弱+无热量交换 → 地表温度骤降 → 霜冻。</div>` 
  },
  { 
    title:'4. 温室大棚为何能保温？', 
    html:`<ul><li>太阳短波辐射能透过玻璃/塑料薄膜进入大棚，被地面吸收；</li><li>地面增温后释放长波辐射；</li><li>玻璃/薄膜阻挡长波辐射散失(类似大气逆辐射的保温)；</li><li>热量被"困住"，棚内温度升高。</li></ul><div class="case-conclusion">结论：让短波进、挡长波出 —— 与大气保温作用原理一致。</div>` 
  },
  { 
    title:'5. 城市热岛与受热过程', 
    html:`<ul><li>城市地表(水泥、沥青)<strong>比热容小、反照率低</strong>，白天吸收更多太阳辐射，升温快；</li><li>城市排放大量<strong>CO₂和尘埃</strong>，增强大气逆辐射，夜间保温作用强；</li><li>城市建筑密集，通风差，热量不易散失；</li><li>因此城市气温始终高于周边郊区，形成"热岛效应"。</li></ul><div class="case-conclusion">结论：城市 → 吸热多+保温强+散热差 → 热岛效应。</div>` 
  }
];

function switchCase(idx, el) {
  document.querySelectorAll('.case-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('caseContent').innerHTML = caseData[idx].html;
}
