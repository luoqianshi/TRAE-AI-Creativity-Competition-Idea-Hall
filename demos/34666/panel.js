(function () {
  let todos = [];
  const $ = (id) => document.getElementById(id);

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  async function loadAll() { todos = (await window.todoAPI.getTodos()) || []; render(); }
  async function persist() { await window.todoAPI.savetodos(todos); }

  let reorderState = null;
  let allowReorder = false;

  function startReorder(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    const li = e.currentTarget.closest('.todo-item');
    const rect = li.getBoundingClientRect();

    const ghost = document.createElement('div');
    ghost.className = 'ghost-item';
    ghost.textContent = todos[idx].text;
    ghost.style.width = Math.max(120, Math.round(rect.width * 0.6)) + 'px';
    ghost.style.maxWidth = '180px';
    ghost.style.height = Math.round(rect.height * 0.9) + 'px';
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    document.body.appendChild(ghost);

    reorderState = {
      startIdx: idx,
      startY: e.clientY,
      liHeight: rect.height,
      liCount: $('todoList').children.length,
      ghost: ghost,
      targetIdx: idx
    };

    li.classList.add('source-hidden');
    document.addEventListener('mousemove', onReorderMove, true);
    document.addEventListener('mouseup', endReorder, true);
  }

  function onReorderMove(e) {
    if (!reorderState) return;
    const rs = reorderState;
    const dy = e.clientY - rs.startY;
    const newIdx = Math.round(dy / rs.liHeight) + rs.startIdx;
    const clamped = Math.max(0, Math.min(rs.liCount - 1, newIdx));

    rs.ghost.style.left = (e.clientX - rs.ghost.offsetWidth / 2) + 'px';
    rs.ghost.style.top = (e.clientY - rs.ghost.offsetHeight / 2) + 'px';

    if (rs.targetIdx === clamped) return;
    rs.targetIdx = clamped;

    document.querySelectorAll('.reorder-before, .reorder-after').forEach(n => {
      n.classList.remove('reorder-before', 'reorder-after');
    });
    if (clamped !== rs.startIdx) {
      const targetLi = document.getElementById('todoList').children[clamped];
      if (targetLi && !targetLi.classList.contains('source-hidden')) {
        if (clamped < rs.startIdx) targetLi.classList.add('reorder-before');
        else targetLi.classList.add('reorder-after');
      }
    }
  }

  function endReorder() {
    if (!reorderState) return;
    const rs = reorderState;
    const ghost = rs.ghost;
    const finalIdx = typeof rs.targetIdx === 'number' ? rs.targetIdx : rs.startIdx;
    ghost.remove();
    reorderState = null;

    if (finalIdx !== rs.startIdx) {
      const [moved] = todos.splice(rs.startIdx, 1);
      todos.splice(finalIdx, 0, moved);
      persist();
    }
    document.removeEventListener('mousemove', onReorderMove, true);
    document.removeEventListener('mouseup', endReorder, true);
    render();
  }

  function render() {
    const list = $('todoList');
    const countText = $('countText');
    if (!list) return;
    list.innerHTML = '';
    if (todos.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="tip">✨ 空空如也</div><div>在底部加一条～</div></div>`;
    } else {
      todos.forEach((t, idx) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (t.done ? ' done' : '');

        if (allowReorder) {


          const handle = document.createElement('div');


          handle.className = 'drag-handle';


          handle.title = '拖拽排序';


          handle.innerHTML = `<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><circle cx=\"9\" cy=\"6\" r=\"1.4\"/><circle cx=\"15\" cy=\"6\" r=\"1.4\"/><circle cx=\"9\" cy=\"12\" r=\"1.4\"/><circle cx=\"15\" cy=\"12\" r=\"1.4\"/><circle cx=\"9\" cy=\"18\" r=\"1.4\"/><circle cx=\"15\" cy=\"18\" r=\"1.4\"/></svg>`;


          handle.addEventListener('mousedown', (e) => startReorder(e, idx));


        }

        const checkbox = document.createElement('button');
        checkbox.className = 'checkbox';
        checkbox.title = '点击完成';
        checkbox.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation(); todos[idx].done = !todos[idx].done; persist(); render();
        });

        const textEl = document.createElement('div');
        textEl.className = 'todo-text';
        textEl.textContent = t.text;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.title = '复制文本';
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.todoAPI && typeof window.todoAPI.copyText === 'function') {
            window.todoAPI.copyText(t.text);
            copyBtn.classList.add('copied');
            setTimeout(() => copyBtn.classList.remove('copied'), 800);
          }
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'del-btn';
        delBtn.title = '删除';
        delBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation(); todos.splice(idx, 1); persist(); render();
        });

        textEl.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          if (window.todoAPI && typeof window.todoAPI.copyText === 'function') {
            window.todoAPI.copyText(t.text);
            li.classList.add('copied-flash');
            setTimeout(() => li.classList.remove('copied-flash'), 600);
          }
        });
        li.appendChild(checkbox);
        li.appendChild(textEl);
        li.appendChild(copyBtn);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    }
    const remaining = todos.filter(t => !t.done).length;
    countText.textContent = `${todos.length} 项 · ${remaining} 待办`;
  }

  function addTodo(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return false;
    todos.push({ id: uid(), text: trimmed, done: false });
    persist();
    render();
    return true;
  }

  function setupEvents() {
    $('closeBtn').addEventListener('click', () => { window.todoAPI.hidePanel(); });
    const addInput = $('addInput');
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (addTodo(addInput.value)) addInput.value = ''; }
    });
    $('addBtn').addEventListener('click', () => { if (addTodo(addInput.value)) addInput.value = ''; });
    $('clearDone').addEventListener('click', () => {
      const before = todos.length;
      todos = todos.filter(t => !t.done);
      if (todos.length !== before) { persist(); render(); }
    });

    if (window.todoAPI) {
      window.todoAPI.getsettings().then(s => { allowReorder = !!(s && s.allowReorder); render(); });
      if (typeof window.todoAPI.onSettingsChanged === 'function') {
        window.todoAPI.onSettingsChanged(s => { allowReorder = !!(s && s.allowReorder); render(); });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { setupEvents(); loadAll(); });
  } else {
    setupEvents(); loadAll();
  }
})();
