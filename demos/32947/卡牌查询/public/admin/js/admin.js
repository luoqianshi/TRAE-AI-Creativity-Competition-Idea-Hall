(function () {
  'use strict';

  const navItems = document.querySelectorAll('.nav li[data-view]');
  const views = document.querySelectorAll('.view');

  function switchView(name) {
    navItems.forEach(li => li.classList.toggle('active', li.dataset.view === name));
    views.forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    if (name === 'library') refreshLibrary();
    if (name === 'bg') refreshBackgrounds();
    if (name === 'add') resetAddForm();
  }

  navItems.forEach(li => {
    li.addEventListener('click', () => switchView(li.dataset.view));
  });

  document.getElementById('btnGotoAdd').addEventListener('click', () => switchView('add'));

  function toast(type, title, desc) {
    const wrap = document.getElementById('toastWrap');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const ic = {
      success: '<polyline points="20 6 9 17 4 12"/>',
      error: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
      info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
    };
    el.innerHTML = `
      <div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ic[type] || ic.info}</svg></div>
      <div class="text">
        <div class="title">${title}</div>
        ${desc ? `<div class="desc">${desc}</div>` : ''}
      </div>
    `;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-12px)';
      el.style.transition = 'all 0.2s';
      setTimeout(() => el.remove(), 220);
    }, 2400);
  }

  function confirmAction(title, desc, onOk) {
    const mask = document.getElementById('confirmMask');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmDesc').textContent = desc;
    mask.classList.add('show');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    const close = () => mask.classList.remove('show');
    const okHandler = () => { close(); okBtn.removeEventListener('click', okHandler); cancelBtn.removeEventListener('click', cancelHandler); onOk(); };
    const cancelHandler = () => { close(); okBtn.removeEventListener('click', okHandler); cancelBtn.removeEventListener('click', cancelHandler); };
    okBtn.addEventListener('click', okHandler);
    cancelBtn.addEventListener('click', cancelHandler);
  }

  function initUploadArea(area) {
    const input = area.querySelector('input[type="file"]');
    area.addEventListener('click', e => {
      if (e.target.closest('.replace')) return;
      input.click();
    });
    area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = 'var(--gold-400)'; });
    area.addEventListener('dragleave', e => { e.preventDefault(); area.style.borderColor = ''; });
    area.addEventListener('drop', e => {
      e.preventDefault();
      area.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) {
        toast('error', '文件过大', '图片需 ≤ 5MB');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => renderAreaPreview(area, ev.target.result, f.name);
      reader.readAsDataURL(f);
    });
  }

  function renderAreaPreview(area, dataUrl, name) {
    const icon = area.querySelector('.upload-icon');
    const titleEl = area.querySelector('.upload-title');
    const subEl = area.querySelector('.upload-sub');
    const specEl = area.querySelector('.upload-spec');
    if (icon) icon.style.display = 'none';
    if (specEl) specEl.style.display = 'none';
    if (titleEl) titleEl.innerHTML = `<img class="preview-img" src="${dataUrl}">`;
    if (subEl) subEl.innerHTML = `已选择: ${name} <span class="replace">[重新选择]</span>`;
    area.classList.add('has-image');
  }

  function clearAreaPreview(area) {
    const icon = area.querySelector('.upload-icon');
    const titleEl = area.querySelector('.upload-title');
    const subEl = area.querySelector('.upload-sub');
    const specEl = area.querySelector('.upload-spec');
    if (icon) icon.style.display = '';
    if (specEl) specEl.style.display = '';
    if (titleEl) titleEl.textContent = '点击或拖拽上传';
    if (subEl) subEl.textContent = '支持 JPG / PNG / WebP';
    const fileInput = area.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    area.classList.remove('has-image');
  }

  function renderEditPreview(area, url) {
    const icon = area.querySelector('.upload-icon');
    const titleEl = area.querySelector('.upload-title');
    const subEl = area.querySelector('.upload-sub');
    if (icon) icon.style.display = 'none';
    if (titleEl) titleEl.innerHTML = `<img class="preview-img" src="${url}">`;
    if (subEl) subEl.innerHTML = `当前图片 · 重新上传可替换 <span class="replace">[重新选择]</span>`;
    area.classList.add('has-image');
  }

  document.querySelectorAll('#view-add .upload-area, #editForm .upload-area').forEach(initUploadArea);

  const cardForm = document.getElementById('cardForm');
  const btnReset = document.getElementById('btnReset');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnSubmitText = document.getElementById('btnSubmitText');

  function resetAddForm() {
    cardForm.reset();
    document.querySelectorAll('#view-add .upload-area').forEach(clearAreaPreview);
    btnSubmitText.textContent = '确认录入';
    cardForm.dataset.editingId = '';
  }

  btnReset.addEventListener('click', resetAddForm);

  cardForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(cardForm);
    const data = {};
    for (const [k, v] of fd.entries()) {
      if (v && typeof v === 'string') data[k] = v.trim();
    }
    if (!data.card_name || !data.card_no || !data.inner_no || !data.score || !data.version) {
      toast('error', '提交失败', '请填写所有必填项');
      return;
    }
    const editingId = cardForm.dataset.editingId || '';
    if (!editingId) {
      if (!fd.get('img_front') || !fd.get('img_back')) {
        toast('error', '提交失败', '请上传正反面图片');
        return;
      }
    }
    btnSubmit.disabled = true;
    const oldText = btnSubmitText.textContent;
    btnSubmitText.textContent = '提交中...';
    try {
      let res, body;
      if (editingId) {
        res = await fetch('/api/cards/' + editingId, { method: 'PUT', body: fd });
      } else {
        res = await fetch('/api/cards', { method: 'POST', body: fd });
      }
      body = await res.json();
      if (res.ok && body.ok) {
        toast('success', editingId ? '更新成功' : '录入成功', body.data && body.data.card_name);
        resetAddForm();
        switchView('library');
      } else {
        toast('error', '提交失败', body.msg || '请检查输入');
      }
    } catch (err) {
      toast('error', '网络错误', err.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmitText.textContent = oldText;
    }
  });

  // ============ Library ============
  const libSearch = document.getElementById('libSearch');
  const libTbody = document.getElementById('libTbody');
  const pageInfo = document.getElementById('pageInfo');
  const pageControls = document.getElementById('pageControls');
  const statTotal = document.getElementById('statTotal');
  const statMonth = document.getElementById('statMonth');
  const statLastInner = document.getElementById('statLastInner');

  let libState = { page: 1, pageSize: 10, keyword: '', total: 0 };

  let searchDebounce;
  libSearch.addEventListener('input', function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      libState.keyword = libSearch.value.trim();
      libState.page = 1;
      loadLibrary();
    }, 300);
  });

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatTime(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) { return iso; }
  }

  function renderLibrary(items, total) {
    libState.total = total;
    if (!items.length) {
      libTbody.innerHTML = '<tr><td colspan="7" class="empty-row">暂无数据</td></tr>';
    } else {
      libTbody.innerHTML = items.map((c, i) => {
        const idx = (libState.page - 1) * libState.pageSize + i + 1;
        return `
          <tr>
            <td><span class="cell-id">#${String(idx).padStart(5, '0')}</span></td>
            <td>
              <div class="cell-thumb">
                <div class="cell-thumb-img">
                  ${c.img_front ? `<img src="${escapeHtml(c.img_front)}" alt="">` : ''}
                </div>
                <div class="cell-thumb-info">
                  <div class="name">${escapeHtml(c.card_name)}</div>
                  <div class="sub">${escapeHtml(c.card_no)}</div>
                </div>
              </div>
            </td>
            <td><span class="cell-inner">${escapeHtml(c.inner_no)}</span></td>
            <td><div class="cell-score"><span class="gem"></span>${escapeHtml(c.score)}</div></td>
            <td><span class="cell-version">${escapeHtml(c.version)}</span></td>
            <td><span class="cell-time">${formatTime(c.create_time)}</span></td>
            <td>
              <div class="cell-actions">
                <button class="icon-action" data-action="edit" data-id="${c.id}" title="编辑">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="icon-action danger" data-action="delete" data-id="${c.id}" title="删除">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
    const totalPages = Math.max(1, Math.ceil(total / libState.pageSize));
    pageInfo.textContent = `共 ${total} 条 · 第 ${libState.page} / ${totalPages} 页`;

    pageControls.innerHTML = '';
    const mkBtn = (label, page, opts) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (opts && opts.active) b.classList.add('active');
      if (opts && opts.disabled) b.disabled = true;
      b.addEventListener('click', () => {
        libState.page = page;
        loadLibrary();
      });
      return b;
    };
    pageControls.appendChild(mkBtn('‹', Math.max(1, libState.page - 1), { disabled: libState.page <= 1 }));
    const start = Math.max(1, libState.page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p++) {
      pageControls.appendChild(mkBtn(String(p), p, { active: p === libState.page }));
    }
    pageControls.appendChild(mkBtn('›', Math.min(totalPages, libState.page + 1), { disabled: libState.page >= totalPages }));
  }

  function updateStats(items, total) {
    statTotal.innerHTML = `${total}<span class="unit">张</span>`;
    const now = new Date();
    const ym = `${now.getFullYear()}-${now.getMonth()}`;
    const monthCount = items.filter(c => (c.create_time || '').startsWith(ym)).length;
    statMonth.innerHTML = `${monthCount}<span class="unit">张</span>`;
    if (items[0]) {
      statLastInner.textContent = items[0].inner_no || '—';
    } else {
      statLastInner.textContent = '—';
    }
  }

  async function loadLibrary() {
    libTbody.innerHTML = '<tr><td colspan="7" class="empty-row">加载中...</td></tr>';
    const params = new URLSearchParams({
      page: libState.page,
      pageSize: libState.pageSize
    });
    if (libState.keyword) params.set('inner_no', libState.keyword);
    try {
      const res = await fetch('/api/cards?' + params);
      const body = await res.json();
      if (body.ok) {
        renderLibrary(body.data.items, body.data.total);
        updateStats(body.data.items, body.data.total);
      } else {
        toast('error', '加载失败', body.msg || '');
        libTbody.innerHTML = '<tr><td colspan="7" class="empty-row">加载失败</td></tr>';
      }
    } catch (e) {
      libTbody.innerHTML = '<tr><td colspan="7" class="empty-row">网络错误</td></tr>';
    }
  }

  function refreshLibrary() { loadLibrary(); }

  libTbody.addEventListener('click', async function (e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'delete') {
      confirmAction('删除卡牌', '确定要删除该卡牌吗?此操作不可恢复。', async () => {
        try {
          const res = await fetch('/api/cards/' + id, { method: 'DELETE' });
          const body = await res.json();
          if (body.ok) {
            toast('success', '删除成功');
            loadLibrary();
          } else {
            toast('error', '删除失败', body.msg || '');
          }
        } catch (e) { toast('error', '网络错误', e.message); }
      });
    } else if (btn.dataset.action === 'edit') {
      openEdit(id);
    }
  });

  // ============ Edit Modal ============
  const editMask = document.getElementById('editMask');
  const editForm = document.getElementById('editForm');
  const editClose = document.getElementById('editClose');
  const editCancel = document.getElementById('editCancel');
  const editSave = document.getElementById('editSave');

  function closeEdit() {
    editMask.classList.remove('show');
    editForm.reset();
    document.querySelectorAll('#editForm .upload-area').forEach(area => {
      const icon = area.querySelector('.upload-icon');
      const titleEl = area.querySelector('.upload-title');
      const subEl = area.querySelector('.upload-sub');
      if (icon) icon.style.display = '';
      if (titleEl) titleEl.textContent = '点击或拖拽上传';
      if (subEl) subEl.textContent = '不修改请留空';
      const fileInput = area.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      area.classList.remove('has-image');
    });
  }
  editClose.addEventListener('click', closeEdit);
  editCancel.addEventListener('click', closeEdit);
  editMask.addEventListener('click', e => { if (e.target === editMask) closeEdit(); });

  async function openEdit(id) {
    try {
      const res = await fetch('/api/cards/' + id);
      const body = await res.json();
      if (!body.ok) { toast('error', '加载失败', body.msg || ''); return; }
      const c = body.data;
      editForm.elements.id.value = c.id;
      editForm.elements.card_name.value = c.card_name || '';
      editForm.elements.card_no.value = c.card_no || '';
      editForm.elements.inner_no.value = c.inner_no || '';
      editForm.elements.score.value = c.score || '';
      editForm.elements.version.value = c.version || '';
      const fa = document.getElementById('editUploadFront');
      const ba = document.getElementById('editUploadBack');
      if (c.img_front) renderEditPreview(fa, c.img_front);
      if (c.img_back) renderEditPreview(ba, c.img_back);
      editMask.classList.add('show');
    } catch (e) { toast('error', '网络错误', e.message); }
  }

  editSave.addEventListener('click', async function () {
    const id = editForm.elements.id.value;
    if (!id) return;
    const data = {
      card_name: editForm.elements.card_name.value.trim(),
      card_no: editForm.elements.card_no.value.trim(),
      inner_no: editForm.elements.inner_no.value.trim(),
      score: editForm.elements.score.value.trim(),
      version: editForm.elements.version.value.trim()
    };
    if (!data.card_name || !data.card_no || !data.inner_no || !data.score || !data.version) {
      toast('error', '保存失败', '请填写所有必填项');
      return;
    }
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    const frontFile = editForm.querySelector('#editUploadFront input[type="file"]').files[0];
    const backFile = editForm.querySelector('#editUploadBack input[type="file"]').files[0];
    if (frontFile) fd.append('img_front', frontFile);
    if (backFile) fd.append('img_back', backFile);

    editSave.disabled = true;
    const oldText = editSave.innerHTML;
    editSave.innerHTML = '保存中...';
    try {
      const res = await fetch('/api/cards/' + id, { method: 'PUT', body: fd });
      const body = await res.json();
      if (body.ok) {
        toast('success', '更新成功');
        closeEdit();
        loadLibrary();
      } else {
        toast('error', '更新失败', body.msg || '');
      }
    } catch (e) {
      toast('error', '网络错误', e.message);
    } finally {
      editSave.disabled = false;
      editSave.innerHTML = oldText;
    }
  });

  // ============ Backgrounds ============
  const homePreview = document.getElementById('homePreview');
  const detailPreview = document.getElementById('detailPreview');
  const homeStatus = document.getElementById('homeStatus');
  const detailStatus = document.getElementById('detailStatus');
  const homeFile = document.getElementById('homeFile');
  const detailFile = document.getElementById('detailFile');
  const homeUploadBtn = document.getElementById('homeUploadBtn');
  const detailUploadBtn = document.getElementById('detailUploadBtn');
  const homeDeleteBtn = document.getElementById('homeDeleteBtn');
  const detailDeleteBtn = document.getElementById('detailDeleteBtn');
  const homeUploadText = document.getElementById('homeUploadText');
  const detailUploadText = document.getElementById('detailUploadText');

  async function refreshBackgrounds() {
    try {
      const res = await fetch('/api/config');
      const body = await res.json();
      if (body.ok) renderBg('home', body.data.home_bg);
      if (body.ok) renderBg('detail', body.data.detail_bg);
    } catch (e) { /* ignore */ }
  }

  function renderBg(scope, url) {
    const preview = scope === 'home' ? homePreview : detailPreview;
    const status = scope === 'home' ? homeStatus : detailStatus;
    const uploadText = scope === 'home' ? homeUploadText : detailUploadText;
    if (url) {
      preview.classList.remove('empty');
      preview.style.backgroundImage = `url('${url}')`;
      preview.innerHTML = '';
      status.textContent = '已启用';
      status.classList.remove('inactive');
      uploadText.textContent = '替换图片';
    } else {
      preview.classList.add('empty');
      preview.style.backgroundImage = '';
      preview.innerHTML = `
        <div class="ph">
          <div class="ic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <div>暂无背景图</div>
        </div>
      `;
      status.textContent = '未设置';
      status.classList.add('inactive');
      uploadText.textContent = '上传背景';
    }
  }

  homeUploadBtn.addEventListener('click', () => homeFile.click());
  detailUploadBtn.addEventListener('click', () => detailFile.click());
  homeFile.addEventListener('change', () => uploadBg('home', homeFile));
  detailFile.addEventListener('change', () => uploadBg('detail', detailFile));

  async function uploadBg(scope, fileInput) {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast('error', '文件过大', '图片需 ≤ 10MB');
      fileInput.value = '';
      return;
    }
    const fd = new FormData();
    fd.append('file', f);
    try {
      const res = await fetch('/api/bg/' + scope, { method: 'POST', body: fd });
      const body = await res.json();
      if (body.ok) {
        toast('success', '背景已更新', 'H5 端已即时生效');
        renderBg(scope, body.data[scope + '_bg']);
      } else {
        toast('error', '上传失败', body.msg || '');
      }
    } catch (e) { toast('error', '网络错误', e.message); }
    fileInput.value = '';
  }

  homeDeleteBtn.addEventListener('click', () => deleteBg('home'));
  detailDeleteBtn.addEventListener('click', () => deleteBg('detail'));

  async function deleteBg(scope) {
    confirmAction('删除背景图', '确定要删除该背景图吗?删除后将恢复默认渐变。', async () => {
      try {
        const res = await fetch('/api/bg/' + scope, { method: 'DELETE' });
        const body = await res.json();
        if (body.ok) {
          toast('success', '已删除');
          renderBg(scope, '');
        } else {
          toast('error', '删除失败', body.msg || '');
        }
      } catch (e) { toast('error', '网络错误', e.message); }
    });
  }

  // ============ Init ============
  resetAddForm();
  refreshBackgrounds();
})();
