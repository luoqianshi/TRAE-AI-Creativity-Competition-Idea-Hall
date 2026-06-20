
function qs(sel, root=document){return root.querySelector(sel)}
function qsa(sel, root=document){return [...root.querySelectorAll(sel)]}
function showToast(text){let t=qs('.toast'); if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)} t.textContent=text;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1800)}
function init(){
  qsa('[data-toggle="favorite"]').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active'); const label=btn.classList.contains('active')?'已收藏到暖心片段':'已取消收藏'; showToast(label)}));
  qsa('[data-toggle="like"]').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active'); showToast(btn.classList.contains('active')?'这一刻被点亮了':'已收回点亮')}));
  qsa('[data-chip]').forEach(chip=>chip.addEventListener('click',()=>chip.classList.toggle('selected')));
  qsa('.choice').forEach(ch=>ch.addEventListener('click',()=>{const group=ch.dataset.group; if(group){qsa(`.choice[data-group="${group}"]`).forEach(x=>x.classList.remove('selected'))} ch.classList.add('selected')}));
  qsa('.segmented button').forEach(b=>b.addEventListener('click',()=>{qsa('.segmented button').forEach(x=>x.classList.remove('active'));b.classList.add('active');showToast(`已切换到${b.textContent.trim()}视图`)}));
  qsa('.switch').forEach(sw=>sw.addEventListener('click',()=>{sw.classList.toggle('on');showToast(sw.classList.contains('on')?'已开启':'已关闭')}));
  const area=qs('[data-count]'); if(area){const out=qs('[data-count-out]'); const update=()=>out&&(out.textContent=`${area.value.length}/800`);area.addEventListener('input',update);update()}
  qsa('[data-toast]').forEach(el=>el.addEventListener('click',()=>showToast(el.dataset.toast)));
  qsa('[data-open-sheet]').forEach(el=>el.addEventListener('click',()=>qs(el.dataset.openSheet)?.classList.add('show')));
  qsa('[data-close-sheet]').forEach(el=>el.addEventListener('click',()=>el.closest('.sheet-mask')?.classList.remove('show')));
  qsa('[data-link]').forEach(el=>el.addEventListener('click',()=>{location.href=el.dataset.link}));
  qsa('.field input').forEach(input=>{input.addEventListener('focus',()=>input.closest('.field')?.classList.add('ring')); input.addEventListener('blur',()=>input.closest('.field')?.classList.remove('ring'))});
}
document.addEventListener('DOMContentLoaded',init);
