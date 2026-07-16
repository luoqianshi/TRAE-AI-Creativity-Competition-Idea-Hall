(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();const ve="fangzi-happy-v2",ke=3;function A(){return{stateVersion:ke,screen:"onboarding",onboardingStep:0,onboardingMode:"",onboardingEffort:"",hasSeenOnboarding:!1,hasSeenSwipeHint:!1,homeStage:"input",ingredientText:"",ingredients:[],feeling:"",recommendations:[],selectedRecipeId:null,cooking:null,history:[],wanted:[],favorites:[],archive:{},libraryTab:"wanted",modal:null,lastDismissedRecipeId:null,preferences:{mode:"balance",maxMinutes:"20",cleanup:"one",cookware:["炒锅"],staples:["盐","油","生抽"],allergies:[],dislikes:[]}}}function Be(e){if(!e)return!1;const{history:t,wanted:a,favorites:s,preferences:i}=e;if(Array.isArray(t)&&t.length>0||Array.isArray(a)&&a.length>0||Array.isArray(s)&&s.length>0)return!0;if(i){const{allergies:r=[],dislikes:c=[],cookware:u=[]}=i;if(r.length||c.length||u.length>1||i.mode&&i.mode!=="balance"||i.maxMinutes&&i.maxMinutes!=="20")return!0}return!1}function Ce(e){if(!e||typeof e!="object")return A();if(e.stateVersion===ke)return Oe(e);const t=A(),a={...t};return["screen","history","wanted","favorites","archive","ingredientText","ingredients","feeling","cooking","selectedRecipeId","libraryTab"].forEach(i=>{e[i]!==void 0&&e[i]!==null&&(a[i]=e[i])}),e.preferences&&typeof e.preferences=="object"&&(a.preferences={...t.preferences,...e.preferences}),a.hasSeenOnboarding=!!Be(e),a.screen==="loading"&&(a.screen="home"),a.hasSeenOnboarding&&a.screen==="onboarding"&&(a.screen="home"),a.screen=ye(a.screen,a.selectedRecipeId),a.onboardingStep=0,a}function Oe(e){const t=A(),a={...t,...e};return a.preferences={...t.preferences,...e.preferences||{}},a.screen==="loading"&&(a.screen="home"),a.screen=ye(a.screen,a.selectedRecipeId),a}function ye(e,t){return e==="preflight"&&!t||e==="cooking"&&!t?"home":["onboarding","home","loading","recommendations","preflight","cooking","complete","library","profile"].includes(e)?e:"home"}function Pe(){try{const e=localStorage.getItem(ve);if(!e)return A();const t=JSON.parse(e);return Ce(t)}catch(e){return console.warn("[方子] 本地状态读取失败，使用默认状态启动。",e),A()}}function He(e){try{return localStorage.setItem(ve,JSON.stringify(e)),!0}catch(t){return console.warn("[方子] 本地状态写入失败，本次会话继续使用，刷新可能丢失。",t),!1}}const ze=["几个","半个","半盒","半袋","一点点","一点","一些","一小把","一把","两三个","一两个","若干"],Ne=/^(还有|以及|外加|另外|和|跟|加上|顺带|剩下的?|剩的?)/;function De(e){return e.split(/[,，、;；\n]+/).map(t=>t.trim()).filter(Boolean)}function Fe(e){for(const t of ze){if(e.startsWith(t)){const a=e.slice(t.length).trim();return{amount:t,name:a||"食材"}}if(e.endsWith(t)){const a=e.slice(0,-t.length).trim();return{amount:t,name:a||"食材"}}}return null}function Ke(e){const t=e.match(/^([两二三三四五六七八九1-9]+|[半])?(个|盒|袋|根|颗|片|块|把|勺)?(.+)$/);if(!t)return null;const[,a,s,i]=t;return!a&&!s?null:{amount:`${a||""}${s||""}`.trim(),name:(i||"").trim()||"食材"}}function he(e){if(!e||typeof e!="string")return[];const t=De(e),a=[];for(const s of t){const i=s.replace(Ne,"").trim()||s;let r=Fe(i);r||(r=Ke(i)),r||(r={name:i,amount:""}),a.push({name:r.name||i,amount:r.amount||"",raw:s})}return a}const ae=[{id:"corn-egg",title:"焦香玉米抱蛋",subtitle:"甜甜焦香，软乎乎的。不是'忍一忍'的减脂餐。",illustration:"corn-egg-plate",minutes:12,calories:"约 320 千卡",protein:"约 18 克",cleanup:"one",cookware:["平底锅","碗"],feeling:"warm",texture:"软糯焦香",form:"煎蛋盘",method:"煎",matchKeywords:["玉米","鸡蛋","牛奶","蛋"],have:["玉米","鸡蛋","牛奶"],miss:["葱"],substitutions:{葱:"可以不放",牛奶:"无糖豆浆或清水，口感会更清爽"},whyToday:"用一锅煎出软乎乎的蛋和焦香玉米，暖乎乎的刚好。",steps:[{label:"备料",title:"把玉米粒取下来",body:"玉米竖着放，用刀贴着玉米芯切下来。不用切得很干净，差不多就好。鸡蛋打散，加一点点牛奶会更嫩。",criteria:"玉米粒能平铺一层就好",illustration:"prep",timer:null},{label:"煎",title:"热锅下玉米粒",body:"小火，锅热了倒一点点油，把玉米粒铺平。先别翻它，让它煎到有一点点焦边。",criteria:"玉米粒底部出现金黄色焦边",illustration:"pan",timer:120},{label:"倒蛋液",title:"把蛋液淋进去",body:"蛋液绕着圈倒进锅里，让它自己流平。盖盖子小火焖一会，蛋会慢慢凝固成软乎乎的一层。",criteria:"蛋液表面不再流动",illustration:"stir",timer:180},{label:"装盘",title:"滑到盘子里",body:"关火，晃一晃锅让蛋饼松动，倾斜锅子滑进盘子。撒点葱绿就好看了，没有也无所谓。",criteria:"完整滑进盘子，不破也没关系",illustration:"plate_up",timer:null}]},{id:"tofu-egg",title:"嫩滑豆腐抱蛋",subtitle:"一口下去都是软的，像是给自己按了个暂停键。",illustration:"tofu-egg-plate",minutes:10,calories:"约 260 千卡",protein:"约 20 克",cleanup:"one",cookware:["平底锅","碗"],feeling:"warm",texture:"嫩滑",form:"煎蛋盘",method:"煎",matchKeywords:["豆腐","鸡蛋","蛋"],have:["豆腐","鸡蛋"],miss:["生抽"],substitutions:{生抽:"一点点盐加水也行",葱:"可以不放"},whyToday:"豆腐和蛋一起煎，软上加软，十分钟就能上桌。",steps:[{label:"备料",title:"把豆腐切小块",body:"豆腐切成麻将大小的块，不用很整齐。鸡蛋打散备用。",criteria:"豆腐大概一口大小",illustration:"prep",timer:null},{label:"煎豆腐",title:"小火煎豆腐两面",body:"锅里一点油，豆腐块铺平，小火煎到两面微黄。不要急着翻，等底面定型了再动它。",criteria:"豆腐两面都有一层薄薄的黄壳",illustration:"pan",timer:180},{label:"倒蛋液",title:"蛋液绕圈淋进去",body:"把蛋液倒进锅里，晃一晃锅让蛋液流到缝隙里。盖盖子小火焖到蛋凝固。",criteria:"蛋液不再流动，表面微微鼓起",illustration:"stir",timer:150},{label:"装盘",title:"滑出来装盘",body:"晃锅让整块松动，滑进盘子。淋一点生抽提味，没有就撒点盐。",criteria:"整块滑进盘子",illustration:"plate_up",timer:null}]},{id:"milk-toast",title:"牛奶鸡蛋烤吐司",subtitle:"酥酥脆脆，奶香一点点，像早餐店但更轻。",illustration:"milk-toast-plate",minutes:15,calories:"约 340 千卡",protein:"约 16 克",cleanup:"one",cookware:["烤箱/空气炸锅","碗"],feeling:"crispy",texture:"酥脆",form:"烤吐司",method:"烤",matchKeywords:["牛奶","鸡蛋","吐司","面包","蛋"],have:["牛奶","鸡蛋","吐司"],miss:[],substitutions:{牛奶:"无糖豆浆或清水，口感会更清爽"},whyToday:"吐司吸饱蛋奶液，烤到边角酥脆，咬下去咯吱咯吱的。",steps:[{label:"调蛋液",title:"牛奶和鸡蛋搅匀",body:"一个鸡蛋加两勺牛奶，打散搅匀。不用打很久，看不见蛋清就好。",criteria:"蛋液颜色均匀",illustration:"prep",timer:null},{label:"浸吐司",title:"吐司吸饱蛋液",body:"吐司放进蛋液里，两面各浸十秒，让它吸进去。别浸太久，会太软散掉。",criteria:"吐司表面都沾上蛋液，但还能拿起来",illustration:"stir",timer:20},{label:"烤",title:"送进烤箱或空气炸锅",body:"180 度烤 8 到 10 分钟，中间翻一次面。烤到两面金黄、边角微焦。",criteria:"两面金黄，按压有酥脆感",illustration:"pan",timer:480},{label:"装盘",title:"切块装盘",body:"拿出来稍微晾十秒，对角切两块，摆盘就好。喜欢甜的撒点糖，喜欢咸的撒点盐。",criteria:"切口能看到层次",illustration:"plate_up",timer:null}]},{id:"tomato-noodle",title:"番茄鸡蛋汤面",subtitle:"酸酸甜甜一碗下肚，整个人都暖和了。",illustration:"tomato-noodle-bowl",minutes:15,calories:"约 380 千卡",protein:"约 15 克",cleanup:"two",cookware:["锅","碗"],feeling:"warm",texture:"汤汤水水",form:"汤面",method:"煮",matchKeywords:["番茄","西红柿","鸡蛋","蛋","面","挂面"],have:["番茄","鸡蛋","挂面"],miss:["葱"],substitutions:{葱:"可以不放",番茄:"番茄酱加水也可以，但味道会更甜"},whyToday:"一碗热汤面，酸酸甜甜，吃完从胃暖到手。",steps:[{label:"备料",title:"番茄切块，鸡蛋打散",body:"番茄切成小块，不用去皮。鸡蛋打散备用。",criteria:"番茄大概一口大小",illustration:"prep",timer:null},{label:"炒番茄",title:"番茄炒出汁",body:"锅里一点油，下番茄块翻炒，用锅铲压一压让它出汁。炒到番茄软烂、汤汁变红。",criteria:"锅里能看到红色的汤汁",illustration:"pan",timer:150},{label:"煮面",title:"加水煮面",body:"倒两碗水，烧开后下挂面。煮到面变软但还有点嚼劲。",criteria:"面能用筷子夹断",illustration:"stir",timer:240},{label:"淋蛋花",title:"蛋液绕圈淋进去",body:"把蛋液细细地绕圈淋到汤里，别搅动，等十秒蛋花自己浮起来。",criteria:"蛋花成絮状浮起",illustration:"plate_up",timer:30}]},{id:"veggie-salad",title:"凉拌黄瓜生菜碗",subtitle:"咔嚓咔嚓的脆，吃完不油腻，胃里轻一点。",illustration:"veggie-salad-bowl",minutes:8,calories:"约 120 千卡",protein:"约 4 克",cleanup:"one",cookware:["碗"],feeling:"fresh",texture:"爽脆",form:"沙拉碗",method:"拌",matchKeywords:["黄瓜","生菜","蔬菜"],have:["黄瓜","生菜"],miss:["醋"],substitutions:{醋:"少量柠檬汁",生菜:"黄瓜或其他可生食蔬菜"},whyToday:"不用开火，洗洗切切拌一拌，清爽又解腻。",steps:[{label:"备料",title:"洗净切好",body:"黄瓜拍几下切成小段，生菜撕成一口大小。洗一洗沥干水。",criteria:"蔬菜表面没水珠",illustration:"prep",timer:null},{label:"调汁",title:"调一个简单的汁",body:"一勺醋、一勺生抽、一点点糖和油，搅匀就好。没有醋用柠檬汁。",criteria:"汁的味道尝起来酸甜咸平衡",illustration:"stir",timer:null},{label:"拌",title:"蔬菜和汁混匀",body:"蔬菜放进碗里，淋上调好的汁，用筷子从底下往上翻拌几下。",criteria:"每片蔬菜都沾到一点汁",illustration:"plate_up",timer:null}]},{id:"egg-veggie",title:"煎蛋时蔬小碗",subtitle:"一个煎蛋加几片绿叶，简单但不敷衍。",illustration:"egg-veggie-bowl",minutes:10,calories:"约 220 千卡",protein:"约 12 克",cleanup:"one",cookware:["平底锅","碗"],feeling:"fresh",texture:"清爽",form:"煎蛋碗",method:"煎",matchKeywords:["鸡蛋","蛋","生菜","黄瓜","蔬菜"],have:["鸡蛋","生菜"],miss:["黑胡椒"],substitutions:{黑胡椒:"可以不放",生菜:"黄瓜或其他可生食蔬菜"},whyToday:"煎一个蛋配点绿叶，十分钟的清爽晚餐。",steps:[{label:"备料",title:"生菜洗净撕好",body:"生菜撕成小片，沥干水。鸡蛋备用。",criteria:"生菜没水珠",illustration:"prep",timer:null},{label:"煎蛋",title:"小火煎一个蛋",body:"锅热一点点油，打入鸡蛋。小火煎到蛋白凝固、蛋黄还软软的。",criteria:"蛋白完全凝固，蛋黄还能晃",illustration:"pan",timer:150},{label:"装盘",title:"生菜垫底，蛋放上去",body:"生菜铺在碗底，撒点盐和油拌一下，把煎蛋放上去。撒点黑胡椒，没有就算了。",criteria:"蛋稳稳坐在生菜上",illustration:"plate_up",timer:null}]}],de={prep:[{q:"食材切不好怎么办",a:"切不齐没关系，大小差不多就行。重点是别切到手，慢慢来。"},{q:"我没有量杯",a:"用家里普通的汤勺就行，一勺大概 15 毫升。差不多就好，不用精确。"}],pan:[{q:"火好像太大了",a:"先关小火，把锅移开十秒降降温，再放回去。煎东西宁可小火慢一点。"},{q:"锅里快溢出来了",a:"立刻关火，把锅盖留个缝。等液面下去了再开小火继续。"},{q:"看起来不够熟",a:"盖盖子再焖一会，小火。用筷子戳一下中心，没有液体流出就是熟了。"}],stir:[{q:"蛋液散了不成形",a:"没关系，蛋碎也很好吃。继续小火，等它都凝固就好。"},{q:"看起来不够浓",a:"开大火收汁十秒，边收边晃锅。看到汤汁变稠就可以关火了。"}],plate_up:[{q:"装盘的时候破了",a:"没关系，碎了味道一样。摆进碗里就好，反正最后都要进肚子。"},{q:"味道好像淡了",a:"撒一小撮盐，或者淋一点生抽。少一点再加，比一次放多好补救。"}]};function Ve(e){const t=e.illustration||"plate_up";return de[t]||de.plate_up}const Ze={warm:"warm",crispy:"crispy",fresh:"fresh",surprise:"any","":"any"},z={one:1,two:2,any:3};function Xe(e){return[e.title,e.subtitle,e.whyToday,(e.have||[]).join(" "),(e.miss||[]).join(" "),(e.steps||[]).map(t=>`${t.title} ${t.body}`).join(" ")].filter(Boolean).join(" ")}function Ye(e,t){return!t||t.length===0?e:e.filter(a=>{const s=Xe(a);return!t.some(i=>i&&s.includes(i))})}function Ue(e,t){const a=e.matchKeywords||[];let s=0;for(const i of t)i&&a.some(r=>i.includes(r)||r.includes(i))&&(s+=2);return s}function Ge(e,t){const a=(t||[]).slice(0,7);let s=0;return a.forEach(i=>{const r=ae.find(c=>c.id===i.recipeId);r&&(r.texture!==e.texture&&(s+=1),r.form!==e.form&&(s+=1),r.method!==e.method&&(s+=1))}),s}function xe(e,t,a,s){const i=s||{},r=i.allergies||[],c=parseInt(i.maxMinutes||"20",10),u=i.cleanup||"one",f=z[u]||1,h=(e||[]).map(o=>o.name).filter(Boolean),v=Ze[t]||"any";let _=Ye(ae,r).map(o=>({recipe:o,score:Ue(o,h)})).filter(o=>o.score>0||h.length===0),k=_.filter(o=>o.recipe.minutes<=c&&z[o.recipe.cleanup]<=f),S="none";if(k.length<3&&(k=_.filter(o=>z[o.recipe.cleanup]<=f),S="time"),k.length<3&&(k=_.slice(),S="cleanup"),k.length===0)return{recipes:[],empty:!0};const T=k.map(o=>{const d=o.recipe,$=v==="any"||d.feeling===v||d.feeling==="any"?3:0,R=Ge(d,a);return{recipe:d,total:o.score+$+R*.5}}).sort((o,d)=>d.total-o.total),g=[],m=new Set,I=T.find(o=>{const d=o.recipe;return(v==="any"||d.feeling===v)&&!m.has(d.id)})||T.find(o=>!m.has(o.recipe.id));I&&(g.push({...I.recipe,recommendationType:"最符合今天"}),m.add(I.recipe.id));const P=T.filter(o=>!m.has(o.recipe.id)),L=P.slice().sort((o,d)=>{const b=o.recipe.minutes*2+z[o.recipe.cleanup],$=d.recipe.minutes*2+z[d.recipe.cleanup];return b-$}).find(o=>pe(o.recipe,g))||P[0];L&&(g.push({...L.recipe,recommendationType:"更省事"}),m.add(L.recipe.id));const H=T.filter(o=>!m.has(o.recipe.id)),q=H.slice().sort((o,d)=>{const b=te(o.recipe,g);return te(d.recipe,g)-b}).find(o=>pe(o.recipe,g))||H[0];return q&&(g.push({...q.recipe,recommendationType:"换一种口感"}),m.add(q.recipe.id)),{recipes:g,empty:!1,relaxed:S}}function te(e,t){let a=0;return t.forEach(s=>{s.method!==e.method&&(a+=1),s.texture!==e.texture&&(a+=1),s.form!==e.form&&(a+=1),s.minutes!==e.minutes&&(a+=1),s.cleanup!==e.cleanup&&(a+=1)}),a}function pe(e,t){return t.length===0?!0:t.some(a=>te(e,[a])>=2)}function x(e){return ae.find(t=>t.id===e)||null}const ue=[{note:"先认识一下以后要一起吃饭的你。",title:"你想怎么瘦，才不会太委屈？",options:[{value:"easy",label:"好吃第一，顺便轻一点",badge:!1},{value:"balance",label:"稳稳减脂，但别太难吃",badge:!0},{value:"serious",label:"这阵子想认真一点",badge:!1}]},{note:"不用太逞强，差不多就好。",title:"一顿饭，你愿意付出多少力气？",options:[{value:"10",label:"10 分钟，最好一口锅",badge:!1},{value:"15",label:"15 分钟，可以切切炒炒",badge:!1},{value:"20",label:"20 分钟，只要值得就行",badge:!1}]},{note:"没有也没关系，以后可以在“我的”里修改。",title:"有什么一定要绕开？"}];function Qe(e){const t=ue[e.onboardingStep]||ue[0],a=e.onboardingStep===2,s=[0,1,2].map(u=>`<span class="progress__dot ${u<=e.onboardingStep?"progress__dot--active":""}"></span>`).join("");let i="";a?i=Je(e):i=We(e,t);const r=a?"记住啦，开始找吃的":"下一题",c=a?"没有，直接开始":"稍后再说";return`
  <section class="page page--no-nav page-enter" aria-label="首次引导">
    <div class="progress">
      <span class="brand-mark progress__brand">方子。</span>
      <span class="progress__text">${e.onboardingStep+1} / 3</span>
      <span class="progress__dots" aria-hidden="true">${s}</span>
    </div>
    <p class="note-text page__note">${t.note}</p>
    <h1 class="page__title">${t.title}</h1>
    ${i}
    <div style="margin-top: var(--gap-lg); display:flex; flex-direction:column; gap: var(--gap-xs);">
      <button class="btn btn--primary btn--block btn--lg" data-action="onboarding-next">${r}</button>
      <button class="btn btn--ghost btn--block" data-action="onboarding-skip">${c}</button>
    </div>
  </section>`}function We(e,t){const a=e.onboardingStep===0?e.onboardingMode:e.onboardingEffort;return`<div class="options" style="margin-top: var(--gap-md);">
    ${t.options.map(s=>`
      <button class="option ${a===s.value?"option--selected":""}" data-onboarding-choice="${s.value}">
        <span>${s.label}</span>
        ${s.badge?'<span class="option__badge">比较推荐</span>':""}
      </button>`).join("")}
  </div>`}function Je(e){const t=(e.preferences.allergies||[]).join("、"),a=(e.preferences.dislikes||[]).join("、");return`<div style="margin-top: var(--gap-md);">
    <div class="field">
      <label class="field__label" for="ob-allergies">过敏或不能吃的食材</label>
      <input class="input" id="ob-allergies" type="text" placeholder="例如：牛奶、花生" value="${me(t)}" data-onboarding-input="allergies" />
    </div>
    <div class="field">
      <label class="field__label" for="ob-dislikes">我不喜欢的食材</label>
      <input class="input" id="ob-dislikes" type="text" placeholder="例如：香菜、洋葱" value="${me(a)}" data-onboarding-input="dislikes" />
    </div>
    <p class="note-text">提示：过敏信息请自行核对配料，方子只是参考。</p>
  </div>`}function me(e){return String(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}let Y=null;function K(e,t,a,s=3e3){J();const i=et(),r=document.createElement("div");if(r.className="toast",r.setAttribute("role","status"),r.setAttribute("aria-live","polite"),r.innerHTML=`<span>${tt(e)}</span>`,t&&a){const c=document.createElement("button");c.className="toast__action",c.textContent=t,c.addEventListener("click",()=>{a(),J()}),r.appendChild(c)}i.appendChild(r),Y=setTimeout(J,s)}function J(){Y&&(clearTimeout(Y),Y=null);const e=document.querySelector(".toast-container");e&&(e.innerHTML="")}function et(){let e=document.querySelector(".toast-container");return e||(e=document.createElement("div"),e.className="toast-container",document.body.appendChild(e)),e}function tt(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ne(e){return`<nav class="tabbar" aria-label="主导航">
    ${[{key:"home",label:"今天吃什么"},{key:"library",label:"我的方子"},{key:"profile",label:"我的"}].map(a=>`
      <button class="tabbar__btn ${e===a.key?"tabbar__btn--active":""}" data-nav="${a.key}" aria-label="${a.label}">
        ${at(a.key)}
        <span>${a.label}</span>
      </button>`).join("")}
  </nav>`}function at(e){return{home:'<svg viewBox="0 0 24 24" class="tabbar__icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11 L12 4 L20 11 V20 H4 Z"/><path d="M10 20 V14 H14 V20"/></svg>',library:'<svg viewBox="0 0 24 24" class="tabbar__icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4 H8 V20 H5 Z"/><path d="M10 4 H13 V20 H10 Z"/><path d="M16 5 L19 6 L15 20 L12 19 Z"/></svg>',profile:'<svg viewBox="0 0 24 24" class="tabbar__icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="4"/><path d="M5 20 q1 -6 7 -6 t7 6"/></svg>'}[e]||""}function V(e){return{one:"一口锅",two:"两口锅",any:"随便洗"}[e]||"一口锅"}const nt=[{value:"warm",label:"暖乎乎"},{value:"crispy",label:"香香脆脆"},{value:"fresh",label:"清爽一点"},{value:"surprise",label:"随便，帮我选"}];function fe(e){const t=e.ingredients||[],a=t.length>0,s=e.feeling||"",i=a?`<div class="tag-list" role="list" aria-label="已确认食材">
        ${t.map((r,c)=>`
          <span class="tag" role="listitem">
            ${r.name}${r.amount?" "+r.amount:""}
            <button class="tag__remove" data-remove-ingredient="${c}" aria-label="删除 ${r.name}">×</button>
          </span>`).join("")}
      </div>`:"";return`
  <section class="page page-enter" aria-label="食材输入">
    <p class="note-text page__note">今晚，不吃无聊减脂餐</p>
    <h1 class="page__title">冰箱里，谁在等你带它回家？</h1>
    <p class="muted" style="margin-bottom: var(--gap-md);">随便写，几颗、半盒、一点点都听得懂。</p>

    <div class="field">
      <label class="field__label" for="ingredient-text">输入你手上的食材</label>
      <textarea class="textarea" id="ingredient-text" placeholder="例如：几个玉米、两个鸡蛋，还有一点牛奶" data-input="ingredientText">${st(e.ingredientText)}</textarea>
      <p class="field__hint">不用称重，差不多就好。</p>
    </div>

    <button class="btn btn--outline btn--block" data-action="confirm-ingredients" style="margin-bottom: var(--gap-md);">确认食材</button>

    ${i}

    <div class="section" style="margin-top: var(--gap-lg);">
      <div class="section__title">今天想吃什么感觉？</div>
      <div class="feeling-grid" role="radiogroup" aria-label="当下胃口">
        ${nt.map(r=>`
          <button class="feeling-btn ${s===r.value?"feeling-btn--selected":""}" data-feeling="${r.value}" role="radio" aria-checked="${s===r.value}">
            ${r.label}
          </button>`).join("")}
      </div>
      <p class="note-text" style="margin-top: var(--gap-xs);">不选也行，就当随便。</p>
    </div>

    <div style="margin-top: var(--gap-lg);">
      <button class="btn btn--primary btn--block btn--lg" data-action="generate" ${a?"":"disabled"}>给我三个不无聊的方子</button>
      ${a?"":'<p class="note-text" style="margin-top: var(--gap-xs); text-align:center;">先确认食材，再开始找方子。</p>'}
    </div>

    ${ne("home")}
  </section>`}function st(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function B(){return'<ellipse cx="50" cy="62" rx="38" ry="12" class="fill-paper stroke-ink stroke-aux"/>'}function _e(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
    ${B()}
    <ellipse cx="50" cy="58" rx="30" ry="9" class="fill-corn stroke-ink stroke-main"/>
    <!-- 蛋 -->
    <ellipse cx="50" cy="54" rx="20" ry="7" class="fill-paper stroke-ink stroke-main"/>
    <ellipse cx="50" cy="52" rx="6" ry="4.5" class="fill-tomato stroke-ink stroke-aux"/>
    <!-- 玉米粒 -->
    <circle cx="38" cy="56" r="2.2" class="fill-corn stroke-ink stroke-aux"/>
    <circle cx="62" cy="56" r="2.2" class="fill-corn stroke-ink stroke-aux"/>
    <circle cx="44" cy="58" r="2" class="fill-corn stroke-ink stroke-aux"/>
    <circle cx="56" cy="58" r="2" class="fill-corn stroke-ink stroke-aux"/>
    <!-- 葱绿 -->
    <path d="M34 50 q-3 -6 1 -9 M66 50 q3 -6 -1 -9" class="fill-leaf stroke-ink stroke-aux"/>
    <!-- 小表情蒸汽 -->
    <path d="M48 44 q-2 -4 2 -6 M52 44 q2 -4 -2 -6" class="steam-line stroke-ink stroke-aux"/>
  </svg>`}function it(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
    ${B()}
    <rect x="26" y="50" width="48" height="14" rx="4" class="fill-paper stroke-ink stroke-main"/>
    <rect x="30" y="52" width="14" height="10" rx="2" class="fill-leaf stroke-ink stroke-aux"/>
    <rect x="56" y="52" width="14" height="10" rx="2" class="fill-leaf stroke-ink stroke-aux"/>
    <ellipse cx="50" cy="50" rx="14" ry="4" class="fill-corn stroke-ink stroke-aux"/>
    <circle cx="50" cy="49" r="2.4" class="fill-tomato stroke-ink stroke-aux"/>
    <path d="M46 44 q-1 -4 2 -5 M54 44 q1 -4 -2 -5" class="steam-line stroke-ink stroke-aux"/>
  </svg>`}function rt(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
    ${B()}
    <rect x="30" y="46" width="40" height="18" rx="3" class="fill-corn stroke-ink stroke-main"/>
    <path d="M30 46 L70 46 L66 40 L34 40 Z" class="fill-corn stroke-ink stroke-main"/>
    <ellipse cx="50" cy="50" rx="10" ry="3" class="fill-tomato stroke-ink stroke-aux"/>
    <circle cx="44" cy="52" r="1.6" class="fill-leaf stroke-ink stroke-aux"/>
    <circle cx="56" cy="52" r="1.6" class="fill-leaf stroke-ink stroke-aux"/>
    <path d="M44 38 q-2 -3 1 -4 M50 38 q-2 -3 1 -4 M56 38 q-2 -3 1 -4" class="steam-line stroke-ink stroke-aux"/>
  </svg>`}function ot(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
    <ellipse cx="50" cy="62" rx="38" ry="13" class="fill-paper stroke-ink stroke-main"/>
    <ellipse cx="50" cy="60" rx="34" ry="9" class="fill-tomato stroke-ink stroke-aux"/>
    <!-- 面条 -->
    <path d="M28 56 q8 -4 16 0 t16 0 t16 0" class="fill-paper stroke-ink stroke-aux"/>
    <path d="M30 58 q8 -3 16 0 t16 0 t14 0" class="fill-paper stroke-ink stroke-aux"/>
    <circle cx="44" cy="56" r="2.4" class="fill-leaf stroke-ink stroke-aux"/>
    <circle cx="58" cy="56" r="2.4" class="fill-leaf stroke-ink stroke-aux"/>
    <ellipse cx="50" cy="53" rx="5" ry="2" class="fill-paper stroke-ink stroke-aux"/>
    <path d="M46 48 q-2 -3 1 -4 M54 48 q2 -3 -1 -4" class="steam-line stroke-ink stroke-aux"/>
  </svg>`}function lt(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
    ${B()}
    <ellipse cx="50" cy="58" rx="30" ry="9" class="fill-leaf stroke-ink stroke-main"/>
    <path d="M30 56 q6 -8 14 -2 q8 -8 16 0 q8 -6 12 2" class="fill-leaf stroke-ink stroke-aux"/>
    <circle cx="42" cy="56" r="3" class="fill-leaf stroke-ink stroke-aux"/>
    <circle cx="58" cy="56" r="3" class="fill-leaf stroke-ink stroke-aux"/>
    <circle cx="50" cy="54" r="2.4" class="fill-tomato stroke-ink stroke-aux"/>
    <circle cx="36" cy="58" r="2" class="fill-corn stroke-ink stroke-aux"/>
    <circle cx="64" cy="58" r="2" class="fill-corn stroke-ink stroke-aux"/>
  </svg>`}function ct(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
    <ellipse cx="50" cy="64" rx="34" ry="11" class="fill-paper stroke-ink stroke-main"/>
    <ellipse cx="50" cy="62" rx="30" ry="8" class="fill-sky stroke-ink stroke-aux"/>
    <ellipse cx="50" cy="58" rx="14" ry="5" class="fill-paper stroke-ink stroke-main"/>
    <circle cx="50" cy="57" r="3" class="fill-tomato stroke-ink stroke-aux"/>
    <circle cx="36" cy="60" r="2.4" class="fill-leaf stroke-ink stroke-aux"/>
    <circle cx="64" cy="60" r="2.4" class="fill-leaf stroke-ink stroke-aux"/>
    <path d="M44 50 q-2 -3 1 -4 M56 50 q2 -3 -1 -4" class="steam-line stroke-ink stroke-aux"/>
  </svg>`}function $e(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg" aria-hidden="true">
    ${B()}
    <ellipse cx="50" cy="56" rx="26" ry="8" class="fill-corn stroke-ink stroke-main"/>
    <ellipse cx="50" cy="52" rx="14" ry="5" class="fill-paper stroke-ink stroke-aux"/>
    <circle cx="50" cy="51" r="2.6" class="fill-tomato stroke-ink stroke-aux"/>
    <!-- 爱心 -->
    <path d="M50 30 c-3 -6 -10 -3 -8 3 c2 5 8 6 8 6 s6 -1 8 -6 c2 -6 -5 -9 -8 -3 Z" class="fill-tomato stroke-ink stroke-aux"/>
    <path d="M70 38 c-1 -2 -4 -1 -3 1 c1 2 3 2 3 2 s2 0 3 -2 c1 -2 -2 -3 -3 -1 Z" class="fill-tomato stroke-ink stroke-aux"/>
    <path d="M30 38 c-1 -2 -4 -1 -3 1 c1 2 3 2 3 2 s2 0 3 -2 c1 -2 -2 -3 -3 -1 Z" class="fill-tomato stroke-ink stroke-aux"/>
  </svg>`}function dt(){return`<svg viewBox="0 0 100 100" class="food-svg illust-svg" aria-hidden="true">
    <ellipse cx="50" cy="68" rx="40" ry="12" class="fill-paper stroke-ink stroke-main"/>
    <ellipse cx="50" cy="66" rx="34" ry="8" class="fill-sky stroke-ink stroke-aux"/>
    <!-- 食材在跳动 -->
    <g class="food-bob">
      <circle cx="38" cy="58" r="5" class="fill-corn stroke-ink stroke-aux"/>
    </g>
    <g class="food-bob food-bob--2">
      <ellipse cx="50" cy="56" rx="6" ry="5" class="fill-tomato stroke-ink stroke-aux"/>
    </g>
    <g class="food-bob food-bob--3">
      <circle cx="62" cy="58" r="4.5" class="fill-leaf stroke-ink stroke-aux"/>
    </g>
    <path d="M44 48 q-2 -4 1 -5 M52 48 q2 -4 -1 -5" class="steam-line stroke-ink stroke-aux"/>
  </svg>`}function pt(e){const t={prep:`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
      <path d="M30 40 L70 40 L66 64 L34 64 Z" class="fill-paper stroke-ink stroke-main"/>
      <circle cx="44" cy="52" r="3" class="fill-corn stroke-ink stroke-aux"/>
      <circle cx="56" cy="52" r="3" class="fill-corn stroke-ink stroke-aux"/>
      <path d="M50 30 v8" class="stroke-ink stroke-aux"/>
    </svg>`,pan:`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
      <ellipse cx="50" cy="58" rx="32" ry="10" class="fill-paper stroke-ink stroke-main"/>
      <path d="M82 58 q8 0 8 4" class="stroke-ink stroke-main" fill="none"/>
      <ellipse cx="50" cy="56" rx="24" ry="7" class="fill-corn stroke-ink stroke-aux"/>
      <path d="M44 48 q-2 -4 1 -5 M56 48 q2 -4 -1 -5" class="steam-line stroke-ink stroke-aux"/>
    </svg>`,stir:`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
      <ellipse cx="50" cy="62" rx="32" ry="10" class="fill-paper stroke-ink stroke-main"/>
      <path d="M40 56 q10 -6 20 0" class="stroke-ink stroke-main" fill="none"/>
      <path d="M70 30 q4 6 -2 14 l-14 18" class="stroke-ink stroke-aux" fill="none"/>
      <path d="M44 48 q-2 -3 1 -4 M56 48 q2 -3 -1 -4" class="steam-line stroke-ink stroke-aux"/>
    </svg>`,plate_up:`<svg viewBox="0 0 100 100" class="food-svg illust-svg illust-svg--contain" aria-hidden="true">
      ${B()}
      <ellipse cx="50" cy="58" rx="28" ry="8" class="fill-corn stroke-ink stroke-aux"/>
      <circle cx="50" cy="55" r="3" class="fill-tomato stroke-ink stroke-aux"/>
    </svg>`};return t[e]||t.plate_up}const ut={"corn-egg-plate":_e,"tofu-egg-plate":it,"milk-toast-plate":rt,"tomato-noodle-bowl":ot,"veggie-salad-bowl":lt,"egg-veggie-bowl":ct};function C(e){return(ut[e]||_e)()}function mt(){return`
  <section class="loading-stage page-enter" aria-label="正在生成方子" role="status" aria-live="polite">
    <div class="loading-illust">${dt()}</div>
    <p class="loading-line loading-line--1">先看看它们适合怎样在一起……</p>
    <p class="loading-line loading-line--2">再挑三种不无聊的做法。</p>
  </section>`}function ft(e){const t=e.recommendations||[];if(t.length===0)return`
    <section class="page page-enter" aria-label="没有合适的方子">
      <div class="topbar">
        <button class="topbar__back" data-action="back-home">← 改一下食材</button>
      </div>
      <div class="empty">
        <div class="illust-bg illust-bg--lg" style="margin: 0 auto var(--gap-md);">${C("egg-veggie-bowl")}</div>
        <p class="empty__title">这些条件放在一起有点难</p>
        <p class="empty__desc">我不想随便推荐。改一两样食材再试试？</p>
        <button class="btn btn--primary btn--block" data-action="back-home" style="margin-top: var(--gap-lg);">回去改食材</button>
      </div>
    </section>`;const a=t[0],s=t[1],i=t[2],r=t.length,c=e.hasSeenSwipeHint?"":`<div class="swipe-hint" aria-label="划卡提示">
        <span>左划换个口味，右划就吃它</span>
        <span class="swipe-hint__arrow">← 换 / 选 →</span>
      </div>`;return`
  <section class="page page--no-nav page-enter" aria-label="推荐牌组">
    <div class="topbar">
      <button class="topbar__back" data-action="back-home">← 改一下食材</button>
    </div>
    <h1 class="page__title" style="margin-bottom: var(--gap-sm);">今晚吃这个？</h1>
    <p class="note-text" style="margin-bottom: var(--gap-sm);">第 1 张，共 ${r} 张</p>

    ${c}

    <div class="deck" id="deck" aria-label="推荐卡片，可拖动">
      ${i?ge(i,2):""}
      ${s?ge(s,1):""}
      ${gt(a)}
    </div>

    <div style="display:flex; gap: var(--gap-sm); margin-top: var(--gap-md);">
      <button class="btn btn--outline" data-action="rotate-deck" style="flex:1;">换一个</button>
      <button class="btn btn--primary" data-action="pick-deck" style="flex:1;">就吃它</button>
    </div>
    <p class="note-text" style="margin-top: var(--gap-sm); text-align:center;">也可以轻点卡片，先看看完整做法。</p>
  </section>`}function gt(e){return`
  <article class="deck__card deck__card--main card card--tilt" id="main-card"
    role="button" tabindex="0"
    aria-label="${e.title}，${e.recommendationType}">
    <div class="tape" aria-hidden="true"></div>
    <span class="stamp stamp--pass">换个口味</span>
    <span class="stamp stamp--pick">就吃它！</span>

    <span class="angle-tag">${e.recommendationType}</span>
    <div class="illust-bg illust-bg--card">${C(e.illustration)}</div>
    <h2 style="font-size: var(--fs-card-title); margin-bottom: 6px;">${e.title}</h2>
    <p class="muted" style="margin-bottom: var(--gap-sm); font-size: var(--fs-small);">${e.subtitle}</p>

    <div class="meta-row" style="margin-bottom: var(--gap-sm);">
      <span class="meta-item"><span class="meta-item__value">${e.minutes}</span> 分钟</span>
      <span class="meta-item">估算 <span class="meta-item__value">${e.calories}</span></span>
      <span class="meta-item">蛋白质 <span class="meta-item__value">${e.protein}</span></span>
      <span class="meta-item">清洗 <span class="meta-item__value">${V(e.cleanup)}</span></span>
    </div>

    <div class="section">
      <div class="section__title">为什么适合今天</div>
      <p style="font-size: var(--fs-small);">${e.whyToday}</p>
    </div>

    <div class="section">
      <div class="section__title">已有食材</div>
      <div>${(e.have||[]).map(t=>`<span class="ingredient-row ingredient-row--have">${t}</span>`).join("")}</div>
    </div>

    ${e.miss&&e.miss.length?`
    <div class="section">
      <div class="section__title">可能缺少</div>
      <div>${e.miss.map(t=>`<span class="ingredient-row ingredient-row--miss">${t}</span>`).join("")}</div>
    </div>`:""}
  </article>`}function ge(e,t){return`
  <div class="deck__card deck__card--bg${t} card" aria-hidden="true">
    <div class="illust-bg illust-bg--card" style="opacity: 0.6;">${C(e.illustration)}</div>
    <h2 style="font-size: 20px; margin-top: var(--gap-sm);">${e.title}</h2>
    <p class="note-text">${e.recommendationType}</p>
  </div>`}function bt(e){const t=(e.recommendations||[])[0];if(!t)return"";const a=t.steps||[];return`
  <div class="modal-overlay" data-modal-overlay="recipe-detail">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title">
      <div class="modal__header">
        <h2 class="modal__title" id="recipe-detail-title">${t.title}</h2>
        <button class="modal__close" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <p class="note-text" style="margin-bottom: var(--gap-sm);">${t.recommendationType} · ${t.minutes} 分钟 · 估算 ${t.calories}</p>
      <p style="margin-bottom: var(--gap-md); font-size: var(--fs-small); color: var(--muted);">${t.subtitle}</p>
      <ol style="padding-left: 0;">
        ${a.map((s,i)=>`
        <li style="margin-bottom: var(--gap-md); padding-bottom: var(--gap-sm); border-bottom: 1.4px dashed var(--line);">
          <div style="display:flex; align-items:baseline; gap: 6px; margin-bottom: 4px;">
            <span class="angle-tag">${i+1}</span>
            <strong style="font-family: var(--font-round);">${s.title}</strong>
          </div>
          <p style="font-size: var(--fs-small); color: var(--muted);">${s.body}</p>
          ${s.criteria?`<p class="note-text" style="margin-top: 4px;">做到这样就可以：${s.criteria}</p>`:""}
        </li>`).join("")}
      </ol>
    </div>
  </div>`}function vt(e){const t=x(e.selectedRecipeId);if(!t)return'<section class="page"><p class="muted">找不到这个菜，回首页再看看。</p><button class="btn btn--primary" data-action="back-home">回首页</button></section>';const a=t.have||[],s=t.miss||[],i=t.substitutions||{},r=Object.keys(i).length>0,c=t.cookware||[];return`
  <section class="page page--no-nav page-enter" aria-label="开做前确认">
    <div class="topbar">
      <button class="topbar__back" data-action="back-to-deck">← 继续翻菜单</button>
    </div>
    <h1 class="page__title" style="margin-bottom: var(--gap-md);">开做前，看看还差什么。</h1>

    <div class="card" style="margin-bottom: var(--gap-md);">
      <div style="display:flex; align-items:center; gap: var(--gap-md);">
        <div class="illust-bg illust-bg--sm" style="flex-shrink:0;">${C(t.illustration)}</div>
        <div>
          <h2 style="font-size: 22px;">${t.title}</h2>
          <p class="note-text">${t.recommendationType||""}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__title">已有食材</div>
      <div>${a.length?a.map(u=>`<span class="ingredient-row ingredient-row--have">${u}</span>`).join(""):'<span class="muted" style="font-size: var(--fs-small);">空着也没事</span>'}</div>
    </div>

    <div class="section">
      <div class="section__title">可能缺少</div>
      <div>${s.length?s.map(u=>`<span class="ingredient-row ingredient-row--miss">${u}</span>`).join(""):'<span class="muted" style="font-size: var(--fs-small);">看起来都有了</span>'}</div>
    </div>

    <div class="section">
      <div class="section__title">厨具</div>
      <p style="font-size: var(--fs-small);">${c.join("、")}</p>
    </div>

    <div class="meta-row" style="margin-bottom: var(--gap-lg); padding: var(--gap-sm) 0; border-top: 1.4px dashed var(--line); border-bottom: 1.4px dashed var(--line);">
      <span class="meta-item">时间 <span class="meta-item__value">${t.minutes}</span> 分钟</span>
      <span class="meta-item">估算 <span class="meta-item__value">${t.calories}</span></span>
      <span class="meta-item">清洗 <span class="meta-item__value">${V(t.cleanup)}</span></span>
    </div>

    ${r?`
    <div class="card card--alt" style="margin-bottom: var(--gap-md); background: var(--paper-warm);">
      <div class="section__title">替代建议</div>
      ${Object.entries(i).map(([u,f])=>`<p style="font-size: var(--fs-small); margin-bottom: 6px;"><strong>${u}</strong> → ${f}</p>`).join("")}
    </div>`:""}

    <button class="btn btn--primary btn--block btn--lg" data-action="start-cooking" style="margin-bottom: var(--gap-sm);">这些都有，开始做</button>
    <button class="btn btn--ghost btn--block" data-action="back-to-deck">${s.length?"我缺东西，帮我换一下":"再想想"}</button>
  </section>`}let N=null;function kt(e){(!Number.isFinite(e)||e<0)&&(e=0);const t=Math.floor(e/60),a=Math.floor(e%60);return`${String(t).padStart(2,"0")}:${String(a).padStart(2,"0")}`}function se(e){return e?Math.max(0,Math.floor((e-Date.now())/1e3)):0}function yt(e,t,a){const s=Date.now()+e*1e3;D();const i=()=>{const r=se(s);t&&t(r,s),r<=0&&(D(),a&&a())};return i(),N=setInterval(i,1e3),s}function D(){N&&(clearInterval(N),N=null)}function ht(e,t,a){if(!e)return;D();const s=()=>{const i=se(e);t&&t(i,e),i<=0&&(D(),a&&a())};s(),N=setInterval(s,1e3)}function xt(e){const t=x(e.selectedRecipeId),a=e.cooking;if(!t||!a)return'<section class="page"><p class="muted">还没有在做的菜。</p><button class="btn btn--primary" data-action="back-home">回首页</button></section>';const s=a.stepIndex||0,i=t.steps||[],r=i[s],c=i.length,u=s===c-1,f=i.map((v,M)=>`<span class="step-progress__segment ${M<=s?"step-progress__segment--done":""}"></span>`).join(""),h=r.timer?_t(e,a,r):"";return`
  <section class="page page--no-nav page-enter" aria-label="做菜步骤">
    <div class="topbar">
      <button class="topbar__back" data-action="exit-cooking">← 退出陪做</button>
      <span class="topbar__title">${t.title}</span>
    </div>

    <p class="note-text" style="margin-bottom: var(--gap-xs);">第 ${s+1} 步，共 ${c} 步</p>
    <div class="step-progress" aria-hidden="true">${f}</div>

    <div class="card step-card" id="step-card">
      <div class="illust-bg illust-bg--card" style="height: 140px;">${pt(r.illustration)}</div>
      <span class="angle-tag">${r.label}</span>
      <h2 style="font-size: 22px; margin-bottom: var(--gap-sm);">${r.title}</h2>
      <p style="margin-bottom: var(--gap-md);">${r.body}</p>
      <div class="card card--alt" style="background: var(--paper-warm); margin-bottom: var(--gap-md);">
        <div class="section__title">做到这样就可以</div>
        <p style="font-size: var(--fs-small);">${r.criteria}</p>
      </div>
      ${h}
    </div>

    <div style="margin-top: var(--gap-md); display:flex; flex-direction:column; gap: var(--gap-xs);">
      <button class="btn btn--primary btn--block btn--lg" data-action="complete-step">${u?"完成方子":"完成这一步"}</button>
      <div style="display:flex; gap: var(--gap-sm);">
        <button class="btn btn--ghost" data-action="open-rescue" style="flex:1;">我遇到问题了</button>
        <button class="btn btn--ghost" data-action="open-all-steps" style="flex:1;">查看全部步骤</button>
      </div>
    </div>
  </section>`}function _t(e,t,a){const s=t.timerEndsAt,i=s?se(s):a.timer,r=s&&i<=0;return`
  <div class="timer" id="timer-block">
    <div class="timer__display ${r?"timer__display--done":""}" id="timer-display">${kt(i)}</div>
    <div class="timer__label">${r?"时间到了，看看现在的状态吧。":"计时中，别走开"}</div>
    ${r?'<button class="btn btn--outline" data-action="restart-timer" style="margin-top: var(--gap-sm);">重新计时</button>':s?"":`<button class="btn btn--outline" data-action="start-timer" style="margin-top: var(--gap-sm);">开始计时 ${a.timer} 秒</button>`}
  </div>`}function $t(e){const t=x(e.selectedRecipeId);if(!t)return"";const a=e.cooking?e.cooking.stepIndex:0;return`
  <div class="modal-overlay" data-modal-overlay="all-steps">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="all-steps-title">
      <div class="modal__header">
        <h2 class="modal__title" id="all-steps-title">全部步骤</h2>
        <button class="modal__close" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <ol style="padding-left: 0;">
        ${(t.steps||[]).map((s,i)=>`
          <li style="margin-bottom: var(--gap-md); padding-bottom: var(--gap-sm); border-bottom: 1.4px dashed var(--line);">
            <div style="display:flex; align-items:baseline; gap: 6px; margin-bottom: 4px;">
              <span class="angle-tag">${i+1}</span>
              <strong style="font-family: var(--font-round);">${s.title}</strong>
              ${i===a?'<span class="note-text" style="color: var(--tomato-dark);">当前</span>':""}
            </div>
            <p style="font-size: var(--fs-small); color: var(--muted);">${s.body}</p>
          </li>`).join("")}
      </ol>
    </div>
  </div>`}function wt(e){const t=x(e.selectedRecipeId),a=e.cooking;if(!t||!a)return"";const s=t.steps[a.stepIndex]||{};return`
  <div class="modal-overlay" data-modal-overlay="rescue">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="rescue-title">
      <div class="modal__header">
        <h2 class="modal__title" id="rescue-title">没关系，还能补救。</h2>
        <button class="modal__close" data-action="close-modal" aria-label="关闭">×</button>
      </div>
      <p class="note-text" style="margin-bottom: var(--gap-md);">这里是几个常见问题，都有能立刻做的事。</p>
      ${Ve(s).map(r=>`
        <div class="rescue-q">
          <div class="rescue-q__title">${r.q}</div>
          <p class="rescue-q__answer">${r.a}</p>
        </div>`).join("")}
      <button class="btn btn--outline btn--block" data-action="close-modal" style="margin-top: var(--gap-sm);">继续做这一步</button>
    </div>
  </div>`}function Mt(e){const t=x(e.selectedRecipeId);return t?`
  <section class="page page--no-nav page-enter" aria-label="完成">
    <div class="complete-illust">${$e()}</div>
    <h1 class="page__title" style="text-align:center;">热乎乎的一顿，做好啦。</h1>
    <p class="muted" style="text-align:center; margin-bottom: var(--gap-lg);">今天也有好好照顾自己。先尝一口，再告诉我这顿怎么样。</p>

    <div class="card" style="margin-bottom: var(--gap-lg);">
      <h2 style="font-size: 22px; text-align:center; margin-bottom: var(--gap-sm);">${t.title}</h2>
      <div class="meta-row" style="justify-content:center;">
        <span class="meta-item">时间 <span class="meta-item__value">${t.minutes}</span> 分钟</span>
        <span class="meta-item">估算 <span class="meta-item__value">${t.calories}</span></span>
        <span class="meta-item">清洗 <span class="meta-item__value">${V(t.cleanup)}</span></span>
      </div>
    </div>

    <div class="section">
      <div class="section__title">这顿怎么样</div>
      <div style="display:flex; flex-direction:column; gap: var(--gap-sm);">
        <button class="btn btn--primary btn--block" data-rate="great">好吃，下次还做</button>
        <button class="btn btn--outline btn--block" data-rate="ok">还行</button>
        <button class="btn btn--ghost btn--block" data-rate="nope">不太适合我</button>
      </div>
    </div>
  </section>`:'<section class="page"><p class="muted">没有完成的菜。</p><button class="btn btn--primary" data-action="back-home">回首页</button></section>'}function St(e){return`
  <section class="page page--no-nav page-enter" aria-label="完成">
    <div class="complete-illust">${$e()}</div>
    <h1 class="page__title" style="text-align:center;">已经记住啦</h1>
    <p class="muted" style="text-align:center; margin-bottom: var(--gap-lg);">下一次我会继续帮你换一种味道。</p>
    <button class="btn btn--primary btn--block btn--lg" data-action="back-home" style="margin-bottom: var(--gap-sm);">看看剩下的食材还能做什么</button>
    <button class="btn btn--ghost btn--block" data-action="goto-library">收进我的方子</button>
  </section>`}const Tt=[{key:"wanted",label:"想做"},{key:"done",label:"做过"},{key:"favorites",label:"收藏"}];function It(e){const t=e.libraryTab||"wanted",a=Lt(e,t);return`
  <section class="page page-enter" aria-label="我的方子">
    <h1 class="page__title" style="margin-bottom: var(--gap-md);">我的方子</h1>
    <div class="tabs" role="tablist">
      ${Tt.map(s=>`
        <button class="tab ${t===s.key?"tab--active":""}" data-library-tab="${s.key}" role="tab" aria-selected="${t===s.key}">${s.label}</button>`).join("")}
    </div>

    ${a.length?qt(a):Rt(t)}

    ${ne("library")}
  </section>`}function Lt(e,t){return t==="wanted"?e.wanted||[]:t==="favorites"?e.favorites||[]:t==="done"?(e.history||[]).map(a=>a.recipeId).reverse():[]}function qt(e){const t=new Set;return`<div>
    ${e.filter(s=>t.has(s)?!1:(t.add(s),!0)).map(s=>{const i=x(s);return i?`
      <div class="list-item">
        <div class="list-item__thumb">${C(i.illustration)}</div>
        <div class="list-item__body">
          <div class="list-item__title">${i.title}</div>
          <div class="list-item__meta">${i.minutes} 分钟 · ${i.texture} · ${V(i.cleanup)}清洗</div>
        </div>
        <button class="btn btn--outline" data-again="${s}" style="padding: 8px 14px; font-size: 13px;">再做一次</button>
      </div>`:""}).join("")}
  </div>`}function Rt(e){const t={wanted:"想做",done:"做过",favorites:"收藏"};return`<div class="empty">
    <div class="illust-bg illust-bg--lg" style="margin: 0 auto var(--gap-md); width: 120px; height: 120px;">${C("veggie-salad-bowl")}</div>
    <p class="empty__title">${t[e]||""}还是空的</p>
    <p class="empty__desc">去首页看看今晚吃什么，喜欢的可以收进来。</p>
    <button class="btn btn--primary" data-action="back-home" style="margin-top: var(--gap-md);">去找方子</button>
  </div>`}const be={easy:"好吃第一，顺便轻一点",balance:"稳稳减脂，但别太难吃",serious:"这阵子想认真一点"},y={10:{maxMinutes:"10",cleanup:"one"},15:{maxMinutes:"15",cleanup:"two"},20:{maxMinutes:"20",cleanup:"any"}};function jt(e){const t=e.preferences||{},a=Object.keys(y).find(s=>y[s].maxMinutes===t.maxMinutes&&y[s].cleanup===t.cleanup)||"20";return`
  <section class="page page-enter" aria-label="我的">
    <h1 class="page__title" style="margin-bottom: var(--gap-md);">我的</h1>

    <div class="pref-item">
      <div class="pref-item__label">减脂方式</div>
      <div class="pref-item__value">${be[t.mode]||"稳稳减脂"}</div>
      <div class="pref-item__control">
        <select class="input" data-pref="mode">
          ${Object.entries(be).map(([s,i])=>`<option value="${s}" ${t.mode===s?"selected":""}>${i}</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="pref-item">
      <div class="pref-item__label">可接受时间</div>
      <div class="pref-item__value">${t.maxMinutes} 分钟</div>
      <div class="pref-item__control">
        <select class="input" data-pref-effort>
          <option value="10" ${a==="10"?"selected":""}>10 分钟，最好一口锅</option>
          <option value="15" ${a==="15"?"selected":""}>15 分钟，可以切切炒炒</option>
          <option value="20" ${a==="20"?"selected":""}>20 分钟，只要值得就行</option>
        </select>
      </div>
    </div>

    <div class="pref-item">
      <div class="pref-item__label">清洗偏好</div>
      <div class="pref-item__value">${V(t.cleanup)}</div>
      <div class="pref-item__control">
        <select class="input" data-pref="cleanup">
          <option value="one" ${t.cleanup==="one"?"selected":""}>一口锅</option>
          <option value="two" ${t.cleanup==="two"?"selected":""}>两口锅</option>
          <option value="any" ${t.cleanup==="any"?"selected":""}>随便洗</option>
        </select>
      </div>
    </div>

    <div class="pref-item">
      <div class="pref-item__label">常用厨具</div>
      <div class="pref-item__value">${(t.cookware||[]).join("、")||"还没设置"}</div>
      <div class="pref-item__control">
        <input class="input" type="text" placeholder="用顿号分隔，例如：炒锅、平底锅" value="${(t.cookware||[]).join("、")}" data-pref-list="cookware" />
      </div>
    </div>

    <div class="pref-item">
      <div class="pref-item__label">过敏食材</div>
      <div class="pref-item__value">${(t.allergies||[]).join("、")||"没有"}</div>
      <div class="pref-item__control">
        <input class="input" type="text" placeholder="用顿号分隔，例如：牛奶、花生" value="${(t.allergies||[]).join("、")}" data-pref-list="allergies" />
      </div>
      <p class="field__hint">过敏信息请自行核对配料，方子只是参考。</p>
    </div>

    <div class="pref-item">
      <div class="pref-item__label">不喜欢的食材</div>
      <div class="pref-item__value">${(t.dislikes||[]).join("、")||"没有"}</div>
      <div class="pref-item__control">
        <input class="input" type="text" placeholder="用顿号分隔，例如：香菜、洋葱" value="${(t.dislikes||[]).join("、")}" data-pref-list="dislikes" />
      </div>
    </div>

    <div style="margin-top: var(--gap-lg); padding-top: var(--gap-md); border-top: 1.4px dashed var(--line);">
      <button class="btn btn--outline btn--block" data-action="replay-onboarding" style="margin-bottom: var(--gap-sm);">重新看首次设置</button>
      <button class="btn btn--ghost btn--block" data-action="replay-swipe-hint">再看一次划卡提示</button>
    </div>

    ${ne("profile")}
  </section>`}const ee=8,Et=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function At(e,t={}){if(!e)return;const{onPass:a,onPick:s,onClick:i}=t;let r=0,c=0,u=0,f=!1,h=!1,v=null,M=!1;const _=Et(),O=()=>Math.max(84,e.offsetWidth*.24),k=e.querySelector(".stamp--pass"),S=e.querySelector(".stamp--pick"),T=(o,d)=>{if(_){e.style.opacity=String(Math.max(.3,1-Math.abs(o)/600));return}e.style.transform=`translateX(${o}px) rotate(${d}deg)`},g=()=>{e.style.transition="transform 0.24s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.2s",e.style.transform="",e.style.opacity="",m(null)},m=o=>{k&&k.classList.toggle("stamp--show",o==="pass"),S&&S.classList.toggle("stamp--show",o==="pick")},I=o=>{h||(f=!0,M=!1,v=o.pointerId,r=o.clientX,c=o.clientY,u=0,e.setPointerCapture(v),e.classList.add("deck__card--dragging"),e.style.transition="none")},P=o=>{if(!f||o.pointerId!==v)return;const d=o.clientX-r,b=o.clientY-c;(Math.abs(d)>ee||Math.abs(b)>ee)&&(M=!0),u=d;const $=_?0:Math.max(-12,Math.min(12,d*.04));T(d,$),_?Math.abs(d)>=O()?m(d<0?"pass":"pick"):m(null):d<=-O()?m("pass"):d>=O()?m("pick"):m(null)},L=(o,d)=>{if(!f)return;f=!1;try{e.releasePointerCapture(v)}catch{}if(e.classList.remove("deck__card--dragging"),d){g();return}const b=u;if(!M&&Math.abs(b)<ee){g(),i&&i(o);return}if(Math.abs(b)>=O()){h=!0;const R=b<0?"left":"right";e.classList.add(R==="left"?"deck__card--fly-left":"deck__card--fly-right"),setTimeout(()=>{e.classList.remove("deck__card--fly-left","deck__card--fly-right"),e.style.transform="",e.style.opacity="",e.style.transition="",h=!1,R==="left"&&a&&a(),R==="right"&&s&&s()},240)}else e.style.transition="transform 0.22s cubic-bezier(0.2, 0.8, 0.3, 1)",e.style.transform="",e.style.opacity="",m(null),setTimeout(()=>{e.style.transition=""},240)},H=o=>L(o,!1),q=o=>L(o,!0);return e.addEventListener("pointerdown",I),e.addEventListener("pointermove",P),e.addEventListener("pointerup",H),e.addEventListener("pointercancel",q),()=>{e.removeEventListener("pointerdown",I),e.removeEventListener("pointermove",P),e.removeEventListener("pointerup",H),e.removeEventListener("pointercancel",q)}}let X=null;function Bt(){setTimeout(()=>{const e=document.querySelector(".modal__close");e&&e.focus()},30)}function we(e=!0){e&&X&&typeof X.focus=="function"&&setTimeout(()=>X.focus(),30),X=null}function Ct(e){const t=a=>{a.key==="Escape"&&document.querySelector(".modal-overlay")&&(e(),document.removeEventListener("keydown",t))};return document.addEventListener("keydown",t),t}let n=Pe(),U=null,E=null,G=null;const Z=document.getElementById("app");function p(){n.screen!=="cooking"&&D(),n.screen!=="loading"&&Me();let e="";switch(n.screen){case"onboarding":e=Qe(n);break;case"home":e=fe(n);break;case"loading":e=mt();break;case"recommendations":e=ft(n);break;case"preflight":e=vt(n);break;case"cooking":e=xt(n);break;case"complete":e=n.cooking&&n.cooking.rated?St():Mt(n);break;case"library":e=It(n);break;case"profile":e=jt(n);break;default:e=fe(n)}Z.innerHTML=e,Ot(),Pt()}function Ot(){let e="";n.modal==="all-steps"&&(e=$t(n)),n.modal==="rescue"&&(e=wt(n)),n.modal==="recipe-detail"&&(e=bt(n)),e&&(Z.insertAdjacentHTML("beforeend",e),Bt(),E&&document.removeEventListener("keydown",E),E=Ct(()=>W()))}function Pt(){if(n.screen==="recommendations"){const e=document.getElementById("main-card");e&&At(e,{onPass:()=>re(),onPick:()=>{const t=(n.recommendations||[])[0];t&&oe(t.id)},onClick:()=>F("recipe-detail")})}n.screen==="cooking"&&n.cooking&&n.cooking.timerEndsAt&&Ft()}function w(e){n.screen=e,l(),p()}function l(){He(n)}function Ht(e,t){if(e===0)n.onboardingMode=t,n.preferences.mode=t;else if(e===1){n.onboardingEffort=t;const a=y[t]||y[20];n.preferences.maxMinutes=a.maxMinutes,n.preferences.cleanup=a.cleanup}l()}function ie(){n.hasSeenOnboarding=!0,n.onboardingStep=0,n.screen="home",l(),p(),K("记住啦。以后你只管说冰箱里有什么。",null,null,2600)}function zt(){const e=n.ingredientText||"";if(!e.trim()){K("先告诉我一两样食材就好。",null,null,2400);return}n.ingredients=he(e),l(),p()}function Nt(e){n.ingredients.splice(e,1),n.ingredientText=n.ingredients.map(t=>t.raw).join("、"),l(),p()}function Dt(){if(!(n.ingredients||[]).length)return;const e=n.feeling||"surprise",t=xe(n.ingredients,e,n.history,n.preferences);n.recommendations=t.recipes||[],n.screen="loading",l(),p(),Me(),G=setTimeout(()=>{n.screen="recommendations",l(),p()},620)}function Me(){G&&(clearTimeout(G),G=null)}function re(){const e=n.recommendations||[];if(e.length<2)return;U=e.slice();const[t,...a]=e;n.recommendations=[...a,t],n.hasSeenSwipeHint=!0,l(),p(),K("先放到后面。","撤回",()=>Se(),3e3)}function Se(){U&&(n.recommendations=U,U=null,l(),p())}function oe(e){n.selectedRecipeId=e,n.hasSeenSwipeHint=!0,n.screen="preflight",l(),p()}function Te(e){const t=e||n.selectedRecipeId;t&&(n.selectedRecipeId=t,n.cooking={recipeId:t,stepIndex:0,timerEndsAt:null,rated:!1},n.screen="cooking",n.wanted.includes(t)||n.wanted.push(t),n.archive[t]={lastCooked:Date.now()},l(),p())}function Ie(){if(!n.cooking)return;const e=x(n.selectedRecipeId);if(!e)return;const t=e.steps||[],a=n.cooking.stepIndex+1;if(a>=t.length){Re();return}n.cooking.stepIndex=a,n.cooking.timerEndsAt=null,l(),p()}function le(){if(!n.cooking)return;const e=x(n.selectedRecipeId);if(!e)return;const t=e.steps[n.cooking.stepIndex];if(!t||!t.timer)return;const a=yt(t.timer,s=>{const i=document.getElementById("timer-display");i&&(i.textContent=qe(s))},Le);n.cooking.timerEndsAt=a,l(),p()}function Ft(){!n.cooking||!n.cooking.timerEndsAt||ht(n.cooking.timerEndsAt,e=>{const t=document.getElementById("timer-display");t&&(t.textContent=qe(e))},Le)}function Le(){p()}function Kt(){n.cooking&&(n.cooking.timerEndsAt=null,l(),le())}function qe(e){(!Number.isFinite(e)||e<0)&&(e=0);const t=Math.floor(e/60),a=Math.floor(e%60);return`${String(t).padStart(2,"0")}:${String(a).padStart(2,"0")}`}function Re(){n.screen="complete",n.cooking.rated=!1,l(),p()}function je(e){if(!n.cooking)return;const t=n.selectedRecipeId;if(!t)return;const a=Date.now(),s=(n.history||[])[0];if(s&&a-s.date<6e4&&s.recipeId===t){K("刚刚记过了，歇一会再评。",null,null,2400);return}n.history.unshift({recipeId:t,date:a,rating:e}),e==="great"&&!n.favorites.includes(t)&&n.favorites.push(t),n.cooking.rated=!0,l(),p()}function F(e,t){n.modal=e,t&&(we._trigger=t),l(),p()}function W(){const e=we._trigger;n.modal=null,l(),p(),E&&(document.removeEventListener("keydown",E),E=null),e&&typeof e.focus=="function"&&setTimeout(()=>e.focus(),30)}Z.addEventListener("click",e=>{const t=e.target.closest("[data-action], [data-nav], [data-feeling], [data-onboarding-choice], [data-remove-ingredient], [data-rate], [data-library-tab], [data-again], [data-modal-overlay]");if(!t)return;if(t.dataset.modalOverlay){W();return}const a=t.dataset.action;if(a){Vt(a,t);return}if(t.dataset.nav){w(t.dataset.nav==="home"?"home":t.dataset.nav);return}if(t.dataset.feeling!==void 0){n.feeling=t.dataset.feeling,l(),p();return}if(t.dataset.onboardingChoice!==void 0){ce(t.dataset.onboardingChoice);return}if(t.dataset.removeIngredient!==void 0){Nt(parseInt(t.dataset.removeIngredient,10));return}if(t.dataset.rate){je(t.dataset.rate);return}if(t.dataset.libraryTab){n.libraryTab=t.dataset.libraryTab,l(),p();return}if(t.dataset.again){n.selectedRecipeId=t.dataset.again,n.screen="preflight",l(),p();return}});function Vt(e,t){switch(e){case"onboarding-next":Zt();break;case"onboarding-skip":Xt();break;case"confirm-ingredients":zt();break;case"generate":Dt();break;case"back-home":w("home");break;case"back-to-deck":w("recommendations");break;case"rotate-deck":re();break;case"pick-deck":{const a=(n.recommendations||[])[0];a&&oe(a.id);break}case"start-cooking":Te(n.selectedRecipeId);break;case"complete-step":Ie();break;case"start-timer":le();break;case"restart-timer":Kt();break;case"exit-cooking":n.cooking=null,n.selectedRecipeId=null,w("home");break;case"open-rescue":F("rescue",t);break;case"open-all-steps":F("all-steps",t);break;case"close-modal":W();break;case"goto-library":w("library");break;case"replay-onboarding":n.onboardingStep=0,w("onboarding");break;case"replay-swipe-hint":n.hasSeenSwipeHint=!1,l(),K("划卡提示已重置，下次进推荐时会再显示。",null,null,2600);break}}function ce(e){if(n.onboardingStep===0)n.onboardingMode=e,n.preferences.mode=e;else if(n.onboardingStep===1){n.onboardingEffort=e;const t=y[e]||y[20];n.preferences.maxMinutes=t.maxMinutes,n.preferences.cleanup=t.cleanup}l(),p()}function Ee(){n.onboardingEffort=n.onboardingEffort||"20",n.preferences.maxMinutes="20",n.preferences.cleanup="one"}function Zt(){n.onboardingStep<2?(n.onboardingStep===0&&!n.onboardingMode&&ce("balance"),n.onboardingStep===1&&!n.onboardingEffort&&Ee(),n.onboardingStep+=1,l(),p()):(Ae(),ie())}function Xt(){n.onboardingStep<2?(n.onboardingStep===0&&ce("balance"),n.onboardingStep===1&&Ee(),n.onboardingStep+=1,l(),p()):(Ae(),ie())}function Ae(){const e=document.querySelector('[data-onboarding-input="allergies"]'),t=document.querySelector('[data-onboarding-input="dislikes"]');e&&(n.preferences.allergies=Q(e.value)),t&&(n.preferences.dislikes=Q(t.value)),l()}function Q(e){return e?e.split(/[,，、;；\n]+/).map(t=>t.trim()).filter(Boolean):[]}Z.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.input==="ingredientText"&&(n.ingredientText=t.value,clearTimeout(j),j=setTimeout(l,400)),t.dataset&&t.dataset.onboardingInput&&(clearTimeout(j),j=setTimeout(()=>{const a=Q(t.value);t.dataset.onboardingInput==="allergies"&&(n.preferences.allergies=a),t.dataset.onboardingInput==="dislikes"&&(n.preferences.dislikes=a),l()},400)),t.dataset&&t.dataset.pref&&(n.preferences[t.dataset.pref]=t.value,l()),t.dataset&&t.dataset.prefEffort){const a=y[t.dataset.prefEffort]||y[20];n.preferences.maxMinutes=a.maxMinutes,n.preferences.cleanup=a.cleanup,l(),p()}t.dataset&&t.dataset.prefList&&(clearTimeout(j),j=setTimeout(()=>{n.preferences[t.dataset.prefList]=Q(t.value),l()},400))});let j=null;Z.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){const t=e.target.closest&&e.target.closest("#main-card");t&&n.screen==="recommendations"&&(e.preventDefault(),F("all-steps-card",t))}});window.FangziApp={get state(){return n},set state(e){n=e},render:p,navigate:w,parseIngredients:he,generateRecommendations:xe,saveOnboardingAnswer:Ht,finishOnboarding:ie,rotateRecommendation:re,undoRecommendationRotation:Se,chooseRecipeForPreflight:oe,startCooking:Te,completeStep:Ie,startTimer:le,completeRecipe:Re,rateRecipe:je,openModal:F,closeModal:W,persist:l,defaults:A};p();
