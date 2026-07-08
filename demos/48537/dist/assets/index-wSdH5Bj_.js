(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}})();function m(t){return t.map(e=>`<span class="semantic-tag">${e}</span>`).join("")}function d(t,e,s,r){return`
    <section class="filter-group">
      <h3>${t}</h3>
      <div class="chip-list">
        ${s.map(n=>`
              <button
                class="chip ${r===n?"is-active":""}"
                data-filter-group="${e}"
                data-filter-value="${n}"
                type="button"
              >
                ${n}
              </button>
            `).join("")}
      </div>
    </section>
  `}function g(t){return t?`
    <div class="wave-row" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
  `:""}function y(t,e){const s=e.playingId===t.id,r=e.exportedId===t.id;return`
    <article class="preset-card ${t.isRecommended?"is-recommended":""} ${s?"is-playing":""}">
      <div class="card-top">
        <div>
          <p class="eyebrow">${t.plugin} · ${t.type}</p>
          <h3>${t.name}</h3>
        </div>
        <span class="score">${t.matchScore}%</span>
      </div>
      <p class="description">${t.description}</p>
      ${g(s)}
      <div class="tag-row">
        ${t.tags.map(a=>`<span class="tag">${a}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="ghost-button" data-play-id="${t.id}" type="button">
          ${s?"播放中":"试听"}
        </button>
        <button class="primary-button" data-export-id="${t.id}" type="button">
          ${r?"已导出":"导出到 Ableton"}
        </button>
      </div>
    </article>
  `}function f(t,e){const s=e.exportedId?'<div class="toast">已模拟导出到 Ableton 工程</div>':"",r={"scifi-pad":"更接近你需求的结果偏向宽阔、缓启动、带模拟老化质感。","cyber-bass":"这一组结果更强调力度、失真边缘和电子攻击性。","cinematic-fx":"这一组结果更适合转场、铺垫和大场景冲击。"};t.innerHTML=`
    <div class="page-shell">
      ${s}
      <header class="topbar">
        <div>
          <p class="brand">SoundCraft AI</p>
          <p class="subcopy">用语义搜索瞬间找到对的声音</p>
        </div>
        <div class="status-pill">中文原型 Demo</div>
      </header>

      <main class="workspace">
        <section class="hero-search">
          <label for="prompt" class="section-label">提示词搜索</label>
          <div class="search-row">
            <input
              id="prompt"
              value="${e.prompt}"
              placeholder="描述你脑海里的声音"
            />
            <button id="search-button" class="primary-button" type="button">
              智能搜索
            </button>
          </div>
          <div class="semantic-row">${m(e.semanticTags)}</div>
        </section>

        <section class="layout-grid">
          <aside class="filters">
            ${d("音色类型","type",["低音","主音","铺底","特效"],e.filters.type)}
            ${d("情绪氛围","mood",["冷冽","温暖","颗粒","电影感"],e.filters.mood)}
            ${d("插件来源","plugin",["Serum","Reason","Ableton"],e.filters.plugin)}
          </aside>

          <section class="results-panel">
            <div class="results-header">
              <div>
                <p class="section-label">搜索结果</p>
                <h2>为你找到 ${e.results.length} 个匹配结果</h2>
              </div>
              <p class="recommendation">${r[e.datasetKey]}</p>
            </div>
            <div class="active-filters">
              <span>已筛选：</span>
              <strong>${e.filters.type||"不限"} / ${e.filters.mood||"不限"} / ${e.filters.plugin||"不限"}</strong>
            </div>
            <div class="results-grid">
              ${e.results.length?e.results.map(n=>y(n,e)).join(""):'<div class="empty-state">没有完全匹配的结果，试试放宽情绪或插件筛选。</div>'}
            </div>
          </section>
        </section>
      </main>
    </div>
  `}const h={"scifi-pad":[{id:"pad-aurora-drift",name:"极光漂移 Pad",plugin:"Serum",type:"铺底",tags:["科幻感","温暖","轻失真"],description:"宽阔、柔和，带一点老化磁带感。",matchScore:98,isRecommended:!0},{id:"pad-neon-cloud",name:"霓虹云层",plugin:"Ableton",type:"铺底",tags:["科幻感","电影感","宽阔"],description:"慢起音，适合堆叠未来感空间氛围。",matchScore:95},{id:"pad-tape-stardust",name:"磁带星尘",plugin:"Reason",type:"铺底",tags:["温暖","颗粒","轻失真"],description:"更有颗粒质感，适合偏 Lo-fi 的科技氛围。",matchScore:93},{id:"pad-cold-flame",name:"冷焰大气层",plugin:"Serum",type:"铺底",tags:["冷冽","科幻感","宽阔"],description:"高频更亮，适合偏未来城市的场景音乐。",matchScore:91},{id:"pad-horizon-glass",name:"地平线玻璃",plugin:"Ableton",type:"铺底",tags:["温暖","电影感","宽阔"],description:"更柔顺的电影铺底，适合主歌背景。",matchScore:89},{id:"pad-orbit-haze",name:"轨道雾层",plugin:"Serum",type:"铺底",tags:["科幻感","颗粒","宽阔"],description:"微颗粒起伏，适合营造轨道漂浮感。",matchScore:88},{id:"pad-slow-signal",name:"慢速讯号",plugin:"Reason",type:"铺底",tags:["温暖","轻失真","电影感"],description:"比默认推荐更柔和，适合人声下方铺陈。",matchScore:86},{id:"pad-deep-cyan",name:"深青海平面",plugin:"Serum",type:"铺底",tags:["科幻感","温暖","宽阔"],description:"频谱更完整，适合做主氛围底色。",matchScore:84}],"cyber-bass":[{id:"bass-iron-pulse",name:"钢脉低压",plugin:"Serum",type:"低音",tags:["赛博朋克","温暖","失真"],description:"厚重而不糊，适合电子和游戏战斗场景。",matchScore:97,isRecommended:!0},{id:"bass-dark-grid",name:"暗网栅格",plugin:"Reason",type:"低音",tags:["赛博朋克","冷冽","失真"],description:"攻击性更强，适合速度感更高的段落。",matchScore:92},{id:"bass-chrome-heart",name:"铬心低频",plugin:"Ableton",type:"低音",tags:["赛博朋克","温暖","颗粒"],description:"更圆润，适合兼顾律动和厚度的段落。",matchScore:88}],"cinematic-fx":[{id:"fx-falling-sun",name:"坠日尾迹",plugin:"Ableton",type:"特效",tags:["电影感","空间","冲击"],description:"适合转场和大场景推进。",matchScore:96,isRecommended:!0},{id:"fx-metallic-gate",name:"金属闸门",plugin:"Serum",type:"特效",tags:["电影感","冷冽","颗粒"],description:"颗粒更强，适合悬疑或机械场景。",matchScore:90},{id:"fx-deep-reverb-fall",name:"深空回坠",plugin:"Reason",type:"特效",tags:["电影感","空间","冷冽"],description:"尾音更长，适合做情绪堆叠和场景铺垫。",matchScore:87}]},v=h,b=[{key:"cyber-bass",keywords:["赛博","低音","bass"]},{key:"cinematic-fx",keywords:["电影","特效","fx"]}],S=["科幻感","温暖","轻失真","铺底","赛博朋克","低音","电影感","特效","颗粒","冷冽"];function $(t){const e=t.trim().toLowerCase(),s=b.find(n=>n.keywords.some(a=>e.includes(a))),r=s?s.key:"scifi-pad";return{key:r,items:v[r]}}function E(t){return S.filter(e=>t.includes(e))}function T(t,e){return t.filter(s=>{const r=!e.type||s.type===e.type,n=!e.mood||s.tags.includes(e.mood),a=!e.plugin||s.plugin===e.plugin;return r&&n&&a})}const p="想找一个科幻感、温暖、带轻微失真的合成器铺底";function l(t,e){const s=$(t),r=E(t),n=T(s.items,e);return{datasetKey:s.key,semanticTags:r,results:n}}function A(){const t={type:"",mood:"",plugin:""},e=l(p,t);return{prompt:p,filters:t,datasetKey:e.datasetKey,semanticTags:e.semanticTags,results:e.results,playingId:"",exportedId:""}}function u(t,e){const s=l(e,t.filters);return{...t,prompt:e,datasetKey:s.datasetKey,semanticTags:s.semanticTags,results:s.results,playingId:"",exportedId:""}}function x(t,e,s){const r=t.filters[e]===s?"":s,n={...t.filters,[e]:r},a=l(t.prompt,n);return{...t,filters:n,datasetKey:a.datasetKey,semanticTags:a.semanticTags,results:a.results}}function I(t,e){return{...t,playingId:t.playingId===e?"":e}}function L(t,e){return{...t,exportedId:e}}const P=document.querySelector("#app");let i=A();function c(t){i=t,f(P,i),R()}function R(){const t=document.querySelector("#search-button"),e=document.querySelector("#prompt");t?.addEventListener("click",()=>{c(u(i,e.value))}),e?.addEventListener("keydown",s=>{s.key==="Enter"&&c(u(i,e.value))}),document.querySelectorAll("[data-filter-group]").forEach(s=>{s.addEventListener("click",()=>{c(x(i,s.dataset.filterGroup,s.dataset.filterValue))})}),document.querySelectorAll("[data-play-id]").forEach(s=>{s.addEventListener("click",()=>{c(I(i,s.dataset.playId))})}),document.querySelectorAll("[data-export-id]").forEach(s=>{s.addEventListener("click",()=>{c(L(i,s.dataset.exportId))})})}c(i);
