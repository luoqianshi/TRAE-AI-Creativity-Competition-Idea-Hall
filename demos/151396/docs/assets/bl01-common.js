/* ========== BL-01 公共脚本（所有页面共享） ========== */

/* ---------- Toast 通知系统（统一反馈） ---------- */
window.toast = function(type, title, msg, duration){
  duration = duration || 3000;
  const c = document.getElementById('toastContainer');
  if(!c) return;
  const icons = {success:'✅', warning:'⚠️', error:'❌', info:'ℹ️'};
  const el = document.createElement('div');
  el.className = 'toast toast--'+type;
  el.innerHTML = `
    <div class="toast__icon">${icons[type]||'ℹ️'}</div>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      ${msg ? `<div class="toast__msg">${msg}</div>` : ''}
    </div>
    <button class="toast__close" type="button">✕</button>`;
  el.querySelector('.toast__close').addEventListener('click', ()=>el.remove());
  c.appendChild(el);
  setTimeout(()=>{
    el.style.animation = 'toastIn 0.3s ease reverse';
    setTimeout(()=>el.remove(), 280);
  }, duration);
};

/* ---------- 通用顶部全局入口 ---------- */
window.openCompanySwitch = function(){
  toast('info', '公司主体切换', '已切换至：巨龙安总公司（含其他子公司数据隔离）');
};
window.openMsgCenter = function(){
  toast('info', '消息中心', '当前 9 条未读消息待处理（目标页面将在阶段6 全局整合中实现）');
};
window.openAlertCenter = function(){
  toast('warning', '预警中心', '本模块预警告警已嵌入相关 KPI 卡，无需跳转独立页');
};
window.openProfile = function(){
  toast('info', '个人中心', '张明（商务部业务员）· 服务于消防行业 3 年');
};
window.goOtherModule = function(name){
  toast('info', '跳转提示', '"'+name+'" 模块页面在 BL-02/BL-09/BL-12 等后续模块阶段3 中生成。当前阶段演示版仅含 BL-01。');
};

/* ---------- 移动端导航（Bottom Sheet） ---------- */
window.openMobileNav = function(){
  const o = document.getElementById('mobileNavOverlay');
  const s = document.getElementById('mobileNavSheet');
  if(o) o.classList.add('active');
  if(s) s.classList.add('active');
};
window.closeMobileNav = function(){
  const o = document.getElementById('mobileNavOverlay');
  const s = document.getElementById('mobileNavSheet');
  if(o) o.classList.remove('active');
  if(s) s.classList.remove('active');
};

/* ---------- 真实文件上传组件（核心修复） ---------- */
/*
  用法：任意上传按钮调用 window.openUploader(config)
  config = {
    accept: 'image/*,application/pdf',
    multiple: true,
    title: '上传附件',
    onSelect: function(files){ ... }
  }
  或是页面内置上传区，给 .upload-trigger 容器加 id 和 accept 属性，自动绑定。
*/
window.openUploader = function(config){
  config = config || {};
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = config.multiple !== false;
  if(config.accept) input.accept = config.accept;
  input.addEventListener('change', function(){
    if(this.files && this.files.length){
      const files = Array.from(this.files);
      if(config.onSelect) config.onSelect(files);
      else toast('success','文件已选择','已选择 '+files.length+' 个文件 · 共 '+formatSize(files.reduce((s,f)=>s+f.size,0)));
    }
  });
  input.click();
};

window.formatSize = function(bytes){
  if(bytes<1024) return bytes+' B';
  if(bytes<1024*1024) return (bytes/1024).toFixed(1)+' KB';
  return (bytes/1024/1024).toFixed(2)+' MB';
};

window.readImageDataUrl = function(file, callback){
  const reader = new FileReader();
  reader.onload = function(e){ callback(e.target.result); };
  reader.readAsDataURL(file);
};

/* ---------- 通用：绑定现有 .upload-trigger 容器为真实上传 ---------- */
window.bindUploadTriggers = function(){
  document.querySelectorAll('.upload-trigger').forEach(function(el, idx){
    if(el.dataset.bound) return;
    el.dataset.bound = '1';
    const accept = el.dataset.accept || '*/*';
    const multiple = el.dataset.multiple !== '0';
    const targetId = el.dataset.target;
    el.addEventListener('click', function(e){
      if(e.target.tagName==='INPUT') return;
      const input = el.querySelector('input[type=file]');
      if(input){ input.click(); return; }
      // 否则动态创建 input
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.multiple = multiple;
      inp.accept = accept;
      inp.style.display = 'none';
      el.appendChild(inp);
      inp.addEventListener('change', function(){
        if(!this.files || !this.files.length) return;
        handleUploadedFiles(this.files, el, targetId);
      });
      inp.click();
    });
    // 已经在容器内的 input 也绑定
    const innerInp = el.querySelector('input[type=file]');
    if(innerInp && !innerInp.dataset.bound){
      innerInp.dataset.bound = '1';
      innerInp.addEventListener('change', function(){
        if(!this.files || !this.files.length) return;
        handleUploadedFiles(this.files, el, targetId);
      });
    }
  });
};

function handleUploadedFiles(files, triggerEl, targetId){
  const list = targetId ? document.getElementById(targetId) : (triggerEl.parentElement.querySelector('.upload-list') || triggerEl.parentElement);
  if(!list) return;
  Array.from(files).forEach(function(file){
    const item = document.createElement('div');
    item.className = 'upload-item';
    const isImage = file.type.startsWith('image/');
    const preview = isImage ? '<div class="upload-item__preview"><img src=""></div>' : '<div class="upload-item__preview">📄</div>';
    item.innerHTML = preview +
      '<div class="upload-item__info">' +
      '  <div class="upload-item__name">' + escapeHtml(file.name) + '</div>' +
      '  <div class="upload-item__size">' + formatSize(file.size) + '</div>' +
      '</div>' +
      '<button class="upload-item__del" type="button">删除</button>';
    if(isImage){
      readImageDataUrl(file, function(dataUrl){
        const img = item.querySelector('img');
        if(img) img.src = dataUrl;
      });
    }
    item.querySelector('.upload-item__del').addEventListener('click', function(){ item.remove(); });
    list.appendChild(item);
  });
  toast('success','上传成功','已成功上传 '+files.length+' 个文件');
  // 触发 change 事件让页面上相关计数器刷新
  const evt = new CustomEvent('upload-complete', { detail:{ count: files.length }});
  document.dispatchEvent(evt);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
}

/* ---------- 通用：Tab 切换 ---------- */
window.switchTab = function(tab, group){
  const root = group ? document.querySelector(group) : document;
  root.querySelectorAll('.tab[data-tab]').forEach(function(t){ t.classList.remove('active'); });
  const tabEl = root.querySelector('.tab[data-tab="'+tab+'"]') || document.querySelector('.tab[data-tab="'+tab+'"]');
  if(tabEl) tabEl.classList.add('active');
  document.querySelectorAll('.panel[data-panel], .panel[id^="panel-"]').forEach(function(p){
    if(p.id === 'panel-'+tab || p.dataset.panel === tab) p.style.display='block';
    else p.style.display='none';
  });
};

/* ---------- ESC 关闭所有层 ---------- */
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){
    // 关闭所有可能打开的层
    document.querySelectorAll('.mobile-nav-overlay.active, .drawer-overlay.active, .modal-overlay.active').forEach(function(o){
      o.classList.remove('active');
    });
    document.querySelectorAll('.mobile-nav-sheet.active, .drawer.active, .modal-overlay.active').forEach(function(o){
      o.classList.remove('active');
    });
  }
});

/* ---------- 自动绑定：DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', function(){
  bindUploadTriggers();
});
