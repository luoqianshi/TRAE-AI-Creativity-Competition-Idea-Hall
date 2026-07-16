(function () {
  'use strict';

  const STORAGE_KEYS = {
    PROFILE: 'petProfile',
    MOMENTS: 'petMoments',
    HEALTH: 'healthRecords'
  };

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
  const MAX_MOMENT_IMAGES = 4;
  const MAX_HEALTH_IMAGES = 2;

  let momentImagesCache = [];
  let healthImagesCache = [];
  let healthEditingId = null;
  let currentHealthFilter = 'all';

  function uuid() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function formatDate(date) {
    const d = new Date(date);
    const pad = n => (n < 10 ? '0' + n : '' + n);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function formatDateInput(date) {
    const d = new Date(date);
    const pad = n => (n < 10 ? '0' + n : '' + n);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function relativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return mins + '分钟前';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + '小时前';
    const days = Math.floor(hours / 24);
    if (days < 7) return days + '天前';
    const d = new Date(timestamp);
    const pad = n => (n < 10 ? '0' + n : '' + n);
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function toast(message, type) {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.remove(); }, 2400);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.indexOf('image/') !== 0 && !/^image\//.test(file.type)) {
        reject(new Error('仅支持图片格式'));
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        reject(new Error('图片大小不能超过 2MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => reject(new Error('读取图片失败'));
      reader.readAsDataURL(file);
    });
  }

  function Storage() {}

  Storage.getProfile = function () {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      avatar: '',
      name: '豆包',
      age: 2,
      ageUnit: '岁',
      gender: '♂',
      breed: '柯基',
      motto: '今天也要开心摇尾巴 🐾',
      lastUpdated: new Date().toISOString()
    };
  };

  Storage.saveProfile = function (profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  };

  Storage.getMoments = function () {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MOMENTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const now = Date.now();
    return [
      {
        id: uuid(),
        text: '今天学会了握手！奖励了一块小饼干，开心得转圈圈~ 🐶💕',
        images: [],
        timestamp: now - 1000 * 60 * 30
      },
      {
        id: uuid(),
        text: '第一次带它去公园，追着蝴蝶跑了一下午，回家秒睡zzZ',
        images: [],
        timestamp: now - 1000 * 60 * 60 * 26
      }
    ];
  };

  Storage.saveMoments = function (list) {
    localStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(list));
  };

  Storage.getHealth = function () {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HEALTH);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const today = formatDateInput(new Date());
    const yesterday = formatDateInput(new Date(Date.now() - 86400000));
    return [
      {
        id: uuid(),
        date: yesterday,
        type: 'checkup',
        title: '年度体检',
        description: '各项指标都很正常，体重略有超标，需要多运动啦～',
        images: [],
        createdAt: Date.now() - 86400000
      },
      {
        id: uuid(),
        date: formatDateInput(new Date(Date.now() - 86400000 * 20)),
        type: 'treatment',
        title: '第三次疫苗',
        description: '接种狂犬疫苗，观察30分钟无异常后回家。',
        images: [],
        createdAt: Date.now() - 86400000 * 20
      }
    ];
  };

  Storage.saveHealth = function (list) {
    localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(list));
  };

  function initStorageDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      Storage.saveProfile(Storage.getProfile());
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOMENTS)) {
      Storage.saveMoments(Storage.getMoments());
    }
    if (!localStorage.getItem(STORAGE_KEYS.HEALTH)) {
      Storage.saveHealth(Storage.getHealth());
    }
  }

  function switchView(viewName) {
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.view === viewName);
    });
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('active', v.id === 'view-' + viewName);
    });
    if (viewName === 'circle') renderMoments();
    if (viewName === 'health') renderHealth();
    if (location.hash !== '#' + viewName) {
      history.replaceState(null, '', '#' + viewName);
    }
  }

  function bindRouter() {
    const hash = (location.hash || '#home').slice(1);
    const valid = ['home', 'circle', 'health'];
    switchView(valid.indexOf(hash) >= 0 ? hash : 'home');
  }

  /* ============== Profile ============== */

  function renderProfile() {
    const profile = Storage.getProfile();
    const avatarEl = document.getElementById('avatarDisplay');
    if (profile.avatar) {
      avatarEl.innerHTML = '<img src="' + profile.avatar + '" alt="avatar">';
    } else {
      avatarEl.innerHTML = '<span class="avatar-placeholder">🐶</span>';
    }
    document.getElementById('viewName').textContent = profile.name || '-';
    document.getElementById('viewAge').textContent =
      (profile.age != null ? profile.age : '-') + (profile.ageUnit || '');
    document.getElementById('viewGender').textContent = profile.gender || '-';
    document.getElementById('viewBreed').textContent = profile.breed || '-';
    document.getElementById('viewMotto').textContent = profile.motto || '-';
    if (profile.lastUpdated) {
      document.getElementById('lastUpdated').textContent = '最后更新于：' + formatDate(profile.lastUpdated);
    } else {
      document.getElementById('lastUpdated').textContent = '';
    }
  }

  function enterEditMode() {
    const profile = Storage.getProfile();
    document.getElementById('inputName').value = profile.name || '';
    document.getElementById('inputAge').value = profile.age != null ? profile.age : '';
    document.getElementById('inputAgeUnit').value = profile.ageUnit || '岁';
    document.getElementById('inputBreed').value = profile.breed || '';
    document.getElementById('inputMotto').value = profile.motto || '';
    const radios = document.querySelectorAll('#inputGender input[type="radio"]');
    radios.forEach(r => { r.checked = (r.value === profile.gender); });
    document.getElementById('profileView').classList.add('hidden');
    document.getElementById('profileEdit').classList.remove('hidden');
  }

  function exitEditMode() {
    document.getElementById('profileView').classList.remove('hidden');
    document.getElementById('profileEdit').classList.add('hidden');
  }

  function saveProfile() {
    const name = document.getElementById('inputName').value.trim();
    if (!name) { toast('昵称不能为空哦', 'error'); return; }
    const ageStr = document.getElementById('inputAge').value;
    const age = ageStr === '' ? null : parseInt(ageStr, 10);
    if (age != null && (isNaN(age) || age < 0)) {
      toast('请输入有效的年龄', 'error'); return;
    }
    const ageUnit = document.getElementById('inputAgeUnit').value;
    let gender = '未知';
    const radioCheck = document.querySelector('#inputGender input[type="radio"]:checked');
    if (radioCheck) gender = radioCheck.value;
    const breed = document.getElementById('inputBreed').value.trim();
    const motto = document.getElementById('inputMotto').value.trim();
    const profile = Storage.getProfile();
    const updated = Object.assign({}, profile, {
      name, age, ageUnit, gender, breed, motto,
      lastUpdated: new Date().toISOString()
    });
    Storage.saveProfile(updated);
    renderProfile();
    exitEditMode();
    toast('已保存 ✅', 'success');
  }

  function bindProfile() {
    document.getElementById('editProfileBtn').addEventListener('click', enterEditMode);
    document.getElementById('cancelEditBtn').addEventListener('click', exitEditMode);
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);

    document.getElementById('avatarEditBtn').addEventListener('click', () => {
      document.getElementById('avatarInput').click();
    });
    document.getElementById('avatarInput').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await readFileAsDataURL(file);
        const profile = Storage.getProfile();
        profile.avatar = dataUrl;
        profile.lastUpdated = new Date().toISOString();
        Storage.saveProfile(profile);
        renderProfile();
        toast('头像已更新 🐾', 'success');
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  /* ============== Moments ============== */

  function renderImagesPreview(container, cache) {
    container.innerHTML = '';
    cache.forEach((src, idx) => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      const img = document.createElement('img');
      img.src = src;
      img.addEventListener('click', () => openLightbox(src));
      const btn = document.createElement('button');
      btn.className = 'preview-remove';
      btn.textContent = '×';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cache.splice(idx, 1);
        renderImagesPreview(container, cache);
      });
      item.appendChild(img);
      item.appendChild(btn);
      container.appendChild(item);
    });
  }

  function bindMomentImagesGrid(images) {
    const len = images.length;
    const wrap = document.createElement('div');
    const gridClass = len === 1 ? '1' : (len === 2 ? '2' : (len === 3 ? '3' : '4'));
    wrap.className = 'moment-images grid-' + gridClass;
    images.forEach(src => {
      const img = document.createElement('img');
      img.className = 'moment-image';
      img.src = src;
      img.addEventListener('click', () => openLightbox(src));
      wrap.appendChild(img);
    });
    return wrap;
  }

  function renderMoments() {
    const list = Storage.getMoments().slice().sort((a, b) => b.timestamp - a.timestamp);
    const container = document.getElementById('momentsList');
    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">还没有动态，快为毛孩子记录第一刻吧 ✨</div></div>';
      return;
    }
    list.forEach(m => {
      const card = document.createElement('div');
      card.className = 'moment-card';

      const header = document.createElement('div');
      header.className = 'moment-header';
      const time = document.createElement('span');
      time.className = 'moment-time';
      time.textContent = relativeTime(m.timestamp);
      const del = document.createElement('button');
      del.className = 'moment-delete';
      del.innerHTML = '🗑️';
      del.title = '删除动态';
      del.addEventListener('click', () => {
        if (confirm('确定删除这条动态吗？')) {
          const all = Storage.getMoments().filter(x => x.id !== m.id);
          Storage.saveMoments(all);
          renderMoments();
          toast('已删除', 'success');
        }
      });
      header.appendChild(time);
      header.appendChild(del);

      const text = document.createElement('div');
      text.className = 'moment-text';
      text.textContent = m.text;

      card.appendChild(header);
      if (m.text) card.appendChild(text);
      if (m.images && m.images.length) {
        card.appendChild(bindMomentImagesGrid(m.images));
      }
      container.appendChild(card);
    });
  }

  async function publishMoment() {
    const textEl = document.getElementById('momentText');
    const text = textEl.value.trim();
    if (!text && momentImagesCache.length === 0) {
      toast('写点什么再发布吧~', 'error');
      return;
    }
    const moment = {
      id: uuid(),
      text,
      images: momentImagesCache.slice(),
      timestamp: Date.now()
    };
    const list = Storage.getMoments();
    list.unshift(moment);
    Storage.saveMoments(list);
    textEl.value = '';
    momentImagesCache = [];
    renderImagesPreview(document.getElementById('momentImagesPreview'), momentImagesCache);
    renderMoments();
    toast('发布成功 🎉', 'success');
  }

  function bindMoments() {
    document.getElementById('publishMomentBtn').addEventListener('click', publishMoment);
    document.getElementById('momentImageInput').addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      const remain = MAX_MOMENT_IMAGES - momentImagesCache.length;
      if (remain <= 0) { toast('最多上传 ' + MAX_MOMENT_IMAGES + ' 张图片', 'error'); e.target.value=''; return; }
      const pick = files.slice(0, remain);
      try {
        for (const f of pick) {
          const d = await readFileAsDataURL(f);
          momentImagesCache.push(d);
        }
        renderImagesPreview(document.getElementById('momentImagesPreview'), momentImagesCache);
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  /* ============== Health ============== */

  const HEALTH_TYPE_MAP = {
    clinic: { label: '就医 🏥' },
    treatment: { label: '治疗 💊' },
    checkup: { label: '体检 🩺' },
    other: { label: '其他 📌' }
  };

  function renderHealth() {
    let list = Storage.getHealth().slice();
    if (currentHealthFilter !== 'all') {
      list = list.filter(x => x.type === currentHealthFilter);
    }
    list.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt));
    document.getElementById('healthCount').textContent = Storage.getHealth().length;
    const container = document.getElementById('healthList');
    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">🩺</div><div class="empty-state-text">还没有健康记录，愿毛孩子一直健康快乐 ✨</div></div>';
      return;
    }
    list.forEach(r => {
      const card = document.createElement('div');
      card.className = 'health-card type-' + r.type;

      const header = document.createElement('div');
      header.className = 'health-header';
      const left = document.createElement('div');
      left.className = 'health-header-left';
      const tag = document.createElement('span');
      tag.className = 'health-type-tag';
      tag.textContent = (HEALTH_TYPE_MAP[r.type] || HEALTH_TYPE_MAP.other).label;
      const title = document.createElement('div');
      title.className = 'health-title';
      title.textContent = r.title;
      left.appendChild(tag);
      left.appendChild(title);
      const date = document.createElement('div');
      date.className = 'health-date';
      date.textContent = r.date;
      header.appendChild(left);
      header.appendChild(date);

      card.appendChild(header);

      if (r.description) {
        const desc = document.createElement('div');
        desc.className = 'health-description';
        desc.textContent = r.description;
        card.appendChild(desc);
      }

      if (r.images && r.images.length) {
        const imgsWrap = document.createElement('div');
        imgsWrap.className = 'health-images';
        r.images.forEach(src => {
          const img = document.createElement('img');
          img.className = 'health-image';
          img.src = src;
          img.addEventListener('click', () => openLightbox(src));
          imgsWrap.appendChild(img);
        });
        card.appendChild(imgsWrap);
      }

      const actions = document.createElement('div');
      actions.className = 'health-actions';
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary btn-sm';
      editBtn.textContent = '✏️ 编辑';
      editBtn.addEventListener('click', () => openHealthModal(r));
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.textContent = '🗑️ 删除';
      delBtn.addEventListener('click', () => {
        if (confirm('确定删除这条健康记录吗？')) {
          const all = Storage.getHealth().filter(x => x.id !== r.id);
          Storage.saveHealth(all);
          renderHealth();
          toast('已删除', 'success');
        }
      });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      card.appendChild(actions);

      container.appendChild(card);
    });
  }

  function openHealthModal(record) {
    healthEditingId = record ? record.id : null;
    healthImagesCache = record && record.images ? record.images.slice() : [];
    document.getElementById('healthModalTitle').textContent = record ? '编辑健康记录' : '添加健康记录';
    document.getElementById('healthDate').value = record ? record.date : formatDateInput(new Date());
    document.getElementById('healthType').value = record ? record.type : 'clinic';
    document.getElementById('healthTitle').value = record ? record.title : '';
    document.getElementById('healthDescription').value = record ? record.description : '';
    renderImagesPreview(document.getElementById('healthImagesPreview'), healthImagesCache);
    document.getElementById('healthModal').classList.remove('hidden');
  }

  function closeHealthModal() {
    document.getElementById('healthModal').classList.add('hidden');
    healthEditingId = null;
    healthImagesCache = [];
  }

  function saveHealthRecord() {
    const date = document.getElementById('healthDate').value;
    const type = document.getElementById('healthType').value;
    const title = document.getElementById('healthTitle').value.trim();
    const description = document.getElementById('healthDescription').value.trim();
    if (!date) { toast('请选择日期', 'error'); return; }
    if (!title) { toast('请填写标题', 'error'); return; }
    const list = Storage.getHealth();
    if (healthEditingId) {
      const idx = list.findIndex(x => x.id === healthEditingId);
      if (idx >= 0) {
        list[idx] = Object.assign({}, list[idx], { date, type, title, description, images: healthImagesCache.slice() });
      }
    } else {
      list.unshift({
      id: uuid(),
      date, type, title, description,
      images: healthImagesCache.slice(),
      createdAt: Date.now()
      });
    }
    Storage.saveHealth(list);
    closeHealthModal();
    renderHealth();
    toast(healthEditingId ? '已更新 ✅' : '添加成功 ✅', 'success');
  }

  function bindHealth() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentHealthFilter = tab.dataset.filter;
        renderHealth();
      });
    });
    document.getElementById('addHealthBtn').addEventListener('click', () => openHealthModal(null));
    document.getElementById('healthModalClose').addEventListener('click', closeHealthModal);
    document.getElementById('healthModalCancel').addEventListener('click', closeHealthModal);
    document.querySelector('#healthModal .modal-mask').addEventListener('click', closeHealthModal);
    document.getElementById('healthModalSave').addEventListener('click', saveHealthRecord);
    document.getElementById('healthImageInput').addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      const remain = MAX_HEALTH_IMAGES - healthImagesCache.length;
      if (remain <= 0) { toast('最多上传 ' + MAX_HEALTH_IMAGES + ' 张图片', 'error'); e.target.value=''; return; }
      const pick = files.slice(0, remain);
      try {
        for (const f of pick) {
          const d = await readFileAsDataURL(f);
          healthImagesCache.push(d);
        }
        renderImagesPreview(document.getElementById('healthImagesPreview'), healthImagesCache);
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  /* ============== Lightbox ============== */

  function openLightbox(src) {
    document.getElementById('lightboxImage').src = src;
    document.getElementById('imageLightbox').classList.remove('hidden');
  }

  function closeLightbox() {
    document.getElementById('imageLightbox').classList.add('hidden');
    document.getElementById('lightboxImage').src = '';
  }

  function bindLightbox() {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-mask').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ============== Init ============== */

  function bindTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(tab.dataset.view);
      });
    });
    window.addEventListener('hashchange', bindRouter);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initStorageDefaults();
    renderProfile();
    bindTabs();
    bindRouter();
    bindProfile();
    bindMoments();
    bindHealth();
    bindLightbox();
  });

})();
