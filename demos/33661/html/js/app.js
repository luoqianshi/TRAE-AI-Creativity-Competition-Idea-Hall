/* ============================================================
   诗笺·打工志 —— 主应用
   路由 · 页面渲染 · 交互
   ============================================================ */

const App = {
  currentPage: 'home',
  currentTerm: null,

  /* —— 工种预设 —— */
  CRAFTS: ['搬砖', '走单', '外卖', '快递', '网约车', '装配', '焊接', '站台', '服务', '保洁', '搬运', '其他'],

  /* —— 心情 —— */
  MOODS: [
    { v: 1, glyph: '疲', label: '疲惫' },
    { v: 2, glyph: '平', label: '平常' },
    { v: 3, glyph: '可', label: '尚可' },
    { v: 4, glyph: '慰', label: '欣慰' },
    { v: 5, glyph: '喜', label: '喜悦' }
  ],

  /* —— 境界 —— */
  REALMS: ['初学', '入门', '精进', '大成'],

  init() {
    this.currentTerm = SolarTerms.getCurrentTerm();
    this.bindTabbar();
    this.bindFab();
    this.bindModal();
    this.render();
  },

  /* —— 路由 —— */
  go(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-page="${page}"]`).classList.add('active');
    // FAB 仅在四时志页显示
    const fab = document.getElementById('fab');
    fab.style.display = (page === 'chronicle') ? 'flex' : 'none';
    this.renderPage(page);
    window.scrollTo(0, 0);
  },

  bindTabbar() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.go(tab.dataset.page));
    });
  },

  bindFab() {
    document.getElementById('fab').addEventListener('click', () => this.openChronicleModal());
  },

  bindModal() {
    const mask = document.getElementById('modal-mask');
    mask.addEventListener('click', e => {
      if (e.target === mask) this.closeModal();
    });
  },

  /* —— 渲染 —— */
  render() {
    ['home', 'chronicle', 'salary', 'craft', 'me'].forEach(p => this.renderPage(p));
    this.go('home');
  },

  renderPage(page) {
    const fn = this['render_' + page];
    if (fn) fn.call(this);
  },

  /* ============== 首页·今日 ============== */
  render_home() {
    const term = this.currentTerm;
    const stats = Store.getStats();
    const today = new Date();
    const todayStr = this.fmtDate(today);
    const chronicles = Store.getChronicles();
    const todayEntry = chronicles.find(c => this.fmtDate(new Date(c.entryDate)) === todayStr);

    const html = `
      <div class="page-header">
        <div class="page-title">今日<span class="sub">${todayStr} · ${this.weekday(today)}</span></div>
        <div class="seal">诗</div>
      </div>

      <div class="term-bar">
        <div class="term-name">${term.name}</div>
        <div class="term-pentad">${SolarTerms.getCurrentPentad(today)} · 第${this.termIndex(term)+1}气</div>
        <div class="term-poem">${term.poem}</div>
        <div class="term-author">—— ${term.author}</div>
      </div>

      <div class="card">
        <div class="card-title">今日诗笺</div>
        ${todayEntry ? `
          <div class="poem-card" style="margin-bottom:0">
            <div class="poem-line">${this.poemText(todayEntry.poemId)}</div>
            <div class="poem-meta">${this.poemMeta(todayEntry.poemId)}</div>
            ${todayEntry.note ? `<div class="poem-note">${this.esc(todayEntry.note)}</div>` : ''}
            <div class="flex justify-between mt-3 text-tiny text-light">
              <span>工时 ${todayEntry.workHours || 0}时 · ${this.craftLabel(todayEntry.craftTag)}</span>
              <span>${this.moodLabel(todayEntry.mood)}</span>
            </div>
          </div>
        ` : `
          <div class="empty" style="padding:var(--sp-5)">
            <div class="empty-glyph" style="font-size:32px">笺</div>
            <div class="empty-text">今日尚未撰笺</div>
            <button class="btn btn-primary btn-sm mt-3" onclick="App.openChronicleModal()">展卷撰笺</button>
          </div>
        `}
      </div>

      <div class="card">
        <div class="card-title">本月概览</div>
        <div class="stat-grid">
          <div class="stat-cell">
            <div class="stat-num ochre">¥${this.fmtNum(stats.monthSalary)}</div>
            <div class="stat-label">本月薪火</div>
          </div>
          <div class="stat-cell">
            <div class="stat-num celadon">${this.fmtNum(stats.monthHours)}</div>
            <div class="stat-label">本月工时</div>
          </div>
          <div class="stat-cell">
            <div class="stat-num">${stats.chronicleCount}</div>
            <div class="stat-label">诗笺总数</div>
          </div>
          <div class="stat-cell">
            <div class="stat-num">${stats.skillCount}</div>
            <div class="stat-label">匠心技能</div>
          </div>
        </div>
      </div>

      ${stats.dreamCount > 0 ? this.renderHomeDream(stats) : ''}
    `;
    document.getElementById('page-home').innerHTML = html;
  },

  renderHomeDream(stats) {
    const dreams = Store.getDreams();
    const main = dreams[0];
    const pct = Math.min(100, Math.round((main.allocated / main.targetAmount) * 100));
    return `
      <div class="card">
        <div class="card-title">归园田</div>
        <div class="text-xiaowei" style="font-size:17px;color:var(--ink-deep);margin-bottom:var(--sp-2)">${this.esc(main.title)}</div>
        <div class="progress mb-2"><div class="progress-fill ochre" style="width:${pct}%"></div></div>
        <div class="flex justify-between text-tiny text-light">
          <span>¥${this.fmtNum(main.allocated)} / ¥${this.fmtNum(main.targetAmount)}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  },

  /* ============== 四时志 ============== */
  render_chronicle() {
    const list = Store.getChronicles();
    const term = this.currentTerm;
    const html = `
      <div class="page-header">
        <div class="page-title">四时志<span class="sub">节气工作日记</span></div>
      </div>
      <div class="term-bar" style="padding:var(--sp-4)">
        <div class="term-name" style="font-size:22px">${term.name}</div>
        <div class="term-poem" style="font-size:16px">${term.poem}</div>
      </div>
      ${list.length === 0 ? `
        <div class="empty">
          <div class="empty-glyph">笺</div>
          <div class="empty-text">尚无诗笺，点右下「落墨」开始</div>
        </div>
      ` : list.map(c => this.chronicleCard(c)).join('')}
    `;
    document.getElementById('page-chronicle').innerHTML = html;
  },

  chronicleCard(c) {
    const d = new Date(c.entryDate);
    const t = SolarTerms.getCurrentTerm(d);
    return `
      <div class="poem-card" onclick="App.viewChronicle('${c.id}')">
        <div class="flex justify-between text-tiny text-light mb-2">
          <span>${this.fmtDate(d)} · ${t.name}</span>
          <span>${this.moodLabel(c.mood)}</span>
        </div>
        <div class="poem-line">${this.poemText(c.poemId)}</div>
        <div class="poem-meta">${this.poemMeta(c.poemId)}</div>
        ${c.note ? `<div class="poem-note">${this.esc(c.note).slice(0,60)}${c.note.length>60?'…':''}</div>` : ''}
        <div class="flex justify-between mt-3 text-tiny text-light">
          <span>${c.workHours || 0}时 · ${this.craftLabel(c.craftTag)}</span>
          <span class="text-cinnabar" onclick="event.stopPropagation();App.delChronicle('${c.id}')">弃笺</span>
        </div>
      </div>
    `;
  },

  /* —— 撰笺弹层 —— */
  openChronicleModal(id) {
    const editing = id ? Store.getChronicles().find(c => c.id === id) : null;
    const term = this.currentTerm;
    const poem = PoemDB.match({ scene: 'diary', term: term.name, mood: 3 });
    const html = `
      <div class="modal-handle"></div>
      <div class="modal-title">${editing ? '改笺' : '撰笺'}</div>
      <div class="term-bar" style="padding:var(--sp-4);margin-bottom:var(--sp-4)">
        <div class="term-name" style="font-size:20px">${term.name} · ${this.fmtDate(new Date())}</div>
        <div class="term-pentad">${SolarTerms.getCurrentPentad()}</div>
      </div>

      <div class="field">
        <label class="field-label">工时（小时）</label>
        <input class="input" type="number" id="m-hours" placeholder="如 8" value="${editing?.workHours || ''}" min="0" step="0.5">
      </div>

      <div class="field">
        <label class="field-label">工种</label>
        <div class="craft-chips" id="m-crafts">
          ${this.CRAFTS.map(c => `<span class="craft-chip ${editing?.craftTag===c?'active':''}" data-craft="${c}">${c}</span>`).join('')}
        </div>
      </div>

      <div class="field">
        <label class="field-label">心情</label>
        <div class="mood-row" id="m-moods">
          ${this.MOODS.map(m => `<div class="mood-item ${editing?.mood===m.v?'active':''}" data-mood="${m.v}"><span class="mood-glyph">${m.glyph}</span><span>${m.label}</span></div>`).join('')}
        </div>
      </div>

      <div class="field">
        <label class="field-label">记事（200字内）</label>
        <textarea class="textarea" id="m-note" maxlength="200" placeholder="今日所历，所感…">${this.esc(editing?.note || '')}</textarea>
        <div class="text-tiny text-light text-right mt-2" id="m-count">${(editing?.note||'').length}/200</div>
      </div>

      <div class="field">
        <label class="field-label">配诗（点击换一首）</label>
        <div class="poem-card" id="m-poem" style="margin:0;cursor:pointer" onclick="App.rerollPoem()">
          <div class="poem-line" id="m-poem-line">${poem.poem}</div>
          <div class="poem-meta" id="m-poem-meta">—— ${poem.author}（${poem.dynasty}）《${poem.title}》</div>
          <div class="poem-annotation" id="m-poem-anno">${poem.annotation}</div>
        </div>
      </div>

      <button class="btn btn-primary btn-block mt-4" onclick="App.saveChronicle('${id||''}')">落墨</button>
    `;
    this.openModal(html);
    this._modalPoem = poem;
    this._modalCraft = editing?.craftTag || '';
    this._modalMood = editing?.mood || 3;

    // 工种选择
    document.querySelectorAll('#m-crafts .craft-chip').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('#m-crafts .craft-chip').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        this._modalCraft = el.dataset.craft;
      };
    });
    // 心情选择
    document.querySelectorAll('#m-moods .mood-item').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('#m-moods .mood-item').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        this._modalMood = parseInt(el.dataset.mood);
        this.rerollPoem();
      };
    });
    // 字数
    document.getElementById('m-note').oninput = e => {
      document.getElementById('m-count').textContent = e.target.value.length + '/200';
    };
  },

  rerollPoem() {
    const poem = PoemDB.match({ scene: 'diary', term: this.currentTerm.name, mood: this._modalMood });
    this._modalPoem = poem;
    document.getElementById('m-poem-line').textContent = poem.poem;
    document.getElementById('m-poem-meta').textContent = `—— ${poem.author}（${poem.dynasty}）《${poem.title}》`;
    document.getElementById('m-poem-anno').textContent = poem.annotation;
  },

  saveChronicle(id) {
    const hours = parseFloat(document.getElementById('m-hours').value) || 0;
    const note = document.getElementById('m-note').value.trim();
    if (hours === 0 && !note) { this.toast('请填写工时或记事'); return; }
    const data = {
      workHours: hours,
      craftTag: this._modalCraft,
      mood: this._modalMood,
      note,
      poemId: this._modalPoem.id,
      entryDate: id ? Store.getChronicles().find(c=>c.id===id).entryDate : Date.now()
    };
    if (id) {
      Store.updateChronicle(id, data);
      this.toast('诗笺已改');
    } else {
      Store.addChronicle(data);
      Store.addUsedPoem(data.poemId);
      this.toast('落墨成笺');
    }
    this.closeModal();
    this.renderPage('chronicle');
    this.renderPage('home');
  },

  viewChronicle(id) {
    const c = Store.getChronicles().find(x => x.id === id);
    if (!c) return;
    const poem = PoemDB.getById(c.poemId);
    const d = new Date(c.entryDate);
    const t = SolarTerms.getCurrentTerm(d);
    const html = `
      <div class="modal-handle"></div>
      <div class="modal-title">诗笺</div>
      <div class="poem-card">
        <div class="flex justify-between text-tiny text-light mb-2">
          <span>${this.fmtDate(d)} · ${t.name}</span>
          <span>${this.moodLabel(c.mood)}</span>
        </div>
        <div class="poem-line">${poem.poem}</div>
        <div class="poem-meta">—— ${poem.author}（${poem.dynasty}）《${poem.title}》</div>
        <div class="poem-annotation">${poem.annotation}</div>
        ${c.note ? `<div class="poem-note">${this.esc(c.note)}</div>` : ''}
        <div class="flex justify-between mt-4 text-tiny text-light">
          <span>工时 ${c.workHours||0}时 · ${this.craftLabel(c.craftTag)}</span>
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button class="btn btn-ghost" style="flex:1" onclick="App.openChronicleModal('${id}')">改</button>
        <button class="btn btn-ghost" style="flex:1;color:var(--cinnabar)" onclick="App.delChronicle('${id}')">弃笺</button>
      </div>
    `;
    this.openModal(html);
  },

  delChronicle(id) {
    if (!confirm('确定弃去此笺？')) return;
    Store.deleteChronicle(id);
    this.closeModal();
    this.renderPage('chronicle');
    this.renderPage('home');
    this.toast('已弃笺');
  },

  /* ============== 薪火录 ============== */
  render_salary() {
    const list = Store.getSalaries();
    const stats = Store.getStats();
    const now = new Date();
    const monthSalaries = list.filter(s => {
      const d = new Date(s.payDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // 火苗：本月每日
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = now.getDate();
    let flames = '';
    for (let i = 1; i <= daysInMonth; i++) {
      const daySalaries = monthSalaries.filter(s => new Date(s.payDate).getDate() === i);
      const total = daySalaries.reduce((sum, s) => sum + s.amount, 0);
      if (total > 0) {
        const h = Math.min(70, 10 + Math.sqrt(total) * 3);
        flames += `<div class="fire-flame" style="height:${h}px" title="${i}日 ¥${total}"></div>`;
      } else if (i <= today) {
        flames += `<div class="fire-empty"></div>`;
      } else {
        flames += `<div class="fire-empty" style="opacity:0.2"></div>`;
      }
    }

    const html = `
      <div class="page-header">
        <div class="page-title">薪火录<span class="sub">工资收入追踪</span></div>
      </div>

      <div class="card">
        <div class="card-title">本月薪火</div>
        <div class="text-xiaowei text-ochre" style="font-size:32px;text-align:center;padding:var(--sp-3) 0">¥${this.fmtNum(stats.monthSalary)}</div>
        <div class="fire-row">${flames}</div>
        <div class="flex justify-between text-tiny text-light">
          <span>${now.getMonth()+1}月1日</span>
          <span>${now.getMonth()+1}月${daysInMonth}日</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">薪俸簿</div>
        ${list.length === 0 ? `
          <div class="empty" style="padding:var(--sp-5)">
            <div class="empty-glyph" style="font-size:32px">薪</div>
            <div class="empty-text">尚无薪火记录</div>
          </div>
        ` : list.slice(0, 50).map(s => this.salaryItem(s)).join('')}
      </div>

      <button class="btn btn-ochre btn-block" onclick="App.openSalaryModal()">记一笔薪</button>
    `;
    document.getElementById('page-salary').innerHTML = html;
  },

  salaryItem(s) {
    const poem = PoemDB.getById(s.poemId);
    return `
      <div class="list-item">
        <div class="list-item-main">
          <div class="list-item-title">${this.esc(s.payer || '收入')} · ${this.esc(s.taskName || s.payType || '')}</div>
          <div class="list-item-sub">${this.fmtDate(new Date(s.payDate))} · ${poem ? poem.poem.slice(0,8) : ''}</div>
        </div>
        <div class="list-item-right">
          <div class="text-ochre text-xiaowei" style="font-size:18px">¥${this.fmtNum(s.amount)}</div>
          <div class="text-tiny text-light" onclick="App.delSalary('${s.id}')">删除</div>
        </div>
      </div>
    `;
  },

  openSalaryModal() {
    const poem = PoemDB.match({ scene: 'salary', mood: 4 });
    const html = `
      <div class="modal-handle"></div>
      <div class="modal-title">记一笔薪</div>

      <div class="field">
        <label class="field-label">金额（元）</label>
        <input class="input" type="number" id="s-amount" placeholder="如 3500" min="0" step="0.01">
      </div>

      <div class="field">
        <label class="field-label">发薪方</label>
        <input class="input" id="s-payer" placeholder="如 某某公司 / 现金">
      </div>

      <div class="field">
        <label class="field-label">任务/项目名（选填）</label>
        <input class="input" id="s-task" placeholder="如 装配线A班">
      </div>

      <div class="field">
        <label class="field-label">发薪日期</label>
        <input class="input" type="date" id="s-date" value="${new Date().toISOString().slice(0,10)}">
      </div>

      <div class="field">
        <label class="field-label">类型</label>
        <div class="craft-chips" id="s-types">
          ${['计时','计件','日结','月结','现结'].map(t => `<span class="craft-chip" data-type="${t}">${t}</span>`).join('')}
        </div>
      </div>

      <div class="field">
        <label class="field-label">配诗</label>
        <div class="poem-card" id="s-poem" style="margin:0;cursor:pointer" onclick="App.rerollSalaryPoem()">
          <div class="poem-line" id="s-poem-line">${poem.poem}</div>
          <div class="poem-meta" id="s-poem-meta">—— ${poem.author}（${poem.dynasty}）《${poem.title}》</div>
        </div>
      </div>

      <button class="btn btn-ochre btn-block mt-4" onclick="App.saveSalary()">入薪火簿</button>
    `;
    this.openModal(html);
    this._salaryPoem = poem;
    this._salaryType = '月结';
    document.querySelector('#s-types .craft-chip[data-type="月结"]').classList.add('active');
    document.querySelectorAll('#s-types .craft-chip').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('#s-types .craft-chip').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        this._salaryType = el.dataset.type;
      };
    });
  },

  rerollSalaryPoem() {
    const poem = PoemDB.match({ scene: 'salary', mood: 4 });
    this._salaryPoem = poem;
    document.getElementById('s-poem-line').textContent = poem.poem;
    document.getElementById('s-poem-meta').textContent = `—— ${poem.author}（${poem.dynasty}）《${poem.title}》`;
  },

  saveSalary() {
    const amount = parseFloat(document.getElementById('s-amount').value);
    if (!amount || amount <= 0) { this.toast('请填写金额'); return; }
    const data = {
      amount,
      payer: document.getElementById('s-payer').value.trim(),
      taskName: document.getElementById('s-task').value.trim(),
      payDate: new Date(document.getElementById('s-date').value).getTime(),
      payType: this._salaryType,
      poemId: this._salaryPoem.id
    };
    Store.addSalary(data);
    Store.addUsedPoem(data.poemId);
    // 自动划拨梦想基金
    const settings = Store.getSettings();
    const rate = settings.allocateRate / 100;
    const dreams = Store.getDreams().filter(d => !d.fulfilled);
    if (dreams.length > 0 && rate > 0) {
      const alloc = Math.round(amount * rate);
      Store.allocateToDream(dreams[0].id, alloc);
      this.toast(`入薪 ¥${amount}，划拨归园田 ¥${alloc}`);
    } else {
      this.toast('薪火已入簿');
    }
    this.closeModal();
    this.renderPage('salary');
    this.renderPage('home');
    this.renderPage('me');
  },

  delSalary(id) {
    if (!confirm('删除此笔薪火？')) return;
    Store.deleteSalary(id);
    this.renderPage('salary');
    this.renderPage('home');
    this.toast('已删除');
  },

  /* ============== 匠心谱 ============== */
  render_craft() {
    const skills = Store.getSkills();
    const html = `
      <div class="page-header">
        <div class="page-title">匠心谱<span class="sub">技能成长四境</span></div>
      </div>

      <div class="card">
        <div class="card-title">四境</div>
        <div class="flex justify-between text-center">
          ${this.REALMS.map((r, i) => `
            <div style="flex:1">
              <div class="realm-badge realm-${i}" style="margin-bottom:4px">${r}</div>
              <div class="text-tiny text-light">${['0','30时/10次','100时/50次','500时/200次'][i]}</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${skills.length === 0 ? `
        <div class="empty">
          <div class="empty-glyph">匠</div>
          <div class="empty-text">尚无技能，点下方录入</div>
        </div>
      ` : skills.map(s => this.skillCard(s)).join('')}

      <button class="btn btn-primary btn-block mt-4" onclick="App.openSkillModal()">录入新技</button>
    `;
    document.getElementById('page-craft').innerHTML = html;
  },

  skillCard(s) {
    const realm = s.realm || 0;
    const thresholds = [0, 30, 100, 500];
    const nextThreshold = realm < 3 ? thresholds[realm + 1] : thresholds[3];
    const progress = realm < 3 ? Math.min(100, (s.totalHours / nextThreshold) * 100) : 100;
    return `
      <div class="card">
        <div class="flex justify-between items-center mb-3">
          <div class="text-xiaowei" style="font-size:18px;color:var(--ink-black)">${this.esc(s.name)}</div>
          <span class="realm-badge realm-${realm}">${this.REALMS[realm]}</span>
        </div>
        ${s.certLevel ? `<div class="mb-2"><span class="tag tag-ochre">${s.certLevel}</span></div>` : ''}
        <div class="progress mb-2"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="flex justify-between text-tiny text-light mb-3">
          <span>累计 ${this.fmtNum(s.totalHours||0)}时 / ${s.totalSessions||0}次</span>
          <span>${realm < 3 ? '距'+this.REALMS[realm+1]+'境 '+(nextThreshold-(s.totalHours||0)).toFixed(0)+'时' : '已至大成'}</span>
        </div>
        ${s.insight ? `<div class="text-note text-light" style="padding:var(--sp-2);background:rgba(216,213,201,0.15);border-radius:6px;margin-bottom:var(--sp-3)">${this.esc(s.insight)}</div>` : ''}
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="App.practice('${s.id}')">修炼</button>
          <button class="btn btn-ghost btn-sm" style="flex:1;color:var(--cinnabar)" onclick="App.delSkill('${s.id}')">删</button>
        </div>
      </div>
    `;
  },

  openSkillModal() {
    const html = `
      <div class="modal-handle"></div>
      <div class="modal-title">录入新技</div>
      <div class="field">
        <label class="field-label">技能名</label>
        <input class="input" id="k-name" placeholder="如 电焊 / 叉车 / 月嫂护理">
      </div>
      <div class="field">
        <label class="field-label">初始境界</label>
        <div class="craft-chips" id="k-realms">
          ${this.REALMS.map((r,i) => `<span class="craft-chip ${i===0?'active':''}" data-realm="${i}">${r}</span>`).join('')}
        </div>
      </div>
      <div class="field">
        <label class="field-label">证书级别（选填）</label>
        <select class="select" id="k-cert">
          <option value="">无</option>
          <option>初级</option>
          <option>中级</option>
          <option>高级</option>
          <option>技师</option>
        </select>
      </div>
      <div class="field">
        <label class="field-label">心得（选填）</label>
        <textarea class="textarea" id="k-insight" maxlength="200" placeholder="学艺心得…"></textarea>
      </div>
      <button class="btn btn-primary btn-block mt-4" onclick="App.saveSkill()">入匠心谱</button>
    `;
    this.openModal(html);
    this._skillRealm = 0;
    document.querySelectorAll('#k-realms .craft-chip').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('#k-realms .craft-chip').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        this._skillRealm = parseInt(el.dataset.realm);
      };
    });
  },

  saveSkill() {
    const name = document.getElementById('k-name').value.trim();
    if (!name) { this.toast('请填写技能名'); return; }
    Store.addSkill({
      name,
      realm: this._skillRealm,
      realmName: this.REALMS[this._skillRealm],
      certLevel: document.getElementById('k-cert').value,
      insight: document.getElementById('k-insight').value.trim()
    });
    this.closeModal();
    this.renderPage('craft');
    this.renderPage('home');
    this.toast('已入匠心谱');
  },

  practice(id) {
    const hours = prompt('本次修炼多少小时？', '2');
    if (hours === null) return;
    const h = parseFloat(hours);
    if (!h || h <= 0) { this.toast('请输入有效时长'); return; }
    const result = Store.practiceSkill(id, h);
    if (result.broke) {
      const poem = PoemDB.match({ scene: 'breakthrough', mood: 5 });
      this.toast(`突破至「${result.skill.realmName}」境！${poem.poem}`, 3000);
    } else {
      this.toast(`修炼 ${h}时，累计 ${this.fmtNum(result.skill.totalHours)}时`);
    }
    this.renderPage('craft');
    this.renderPage('home');
  },

  delSkill(id) {
    if (!confirm('删除此技能？')) return;
    Store.deleteSkill(id);
    this.renderPage('craft');
    this.renderPage('home');
    this.toast('已删除');
  },

  /* ============== 我 ============== */
  render_me() {
    const profile = Store.getProfile();
    const stats = Store.getStats();
    const dreams = Store.getDreams();
    const settings = Store.getSettings();
    const html = `
      <div class="page-header">
        <div class="page-title">我<span class="sub">归园田 · 诗笺集 · 设置</span></div>
      </div>

      <div class="card text-center">
        <div class="seal" style="margin:0 auto var(--sp-3);width:56px;height:56px;font-size:22px">${profile.nickname.slice(0,1)}</div>
        <div class="text-xiaowei" style="font-size:20px">${this.esc(profile.nickname)}</div>
        <div class="text-tiny text-light mt-2">${profile.craft ? this.esc(profile.craft) + ' · ' : ''}${profile.hometown ? '故乡 ' + this.esc(profile.hometown) : '尚未立户'}</div>
        <button class="btn btn-ghost btn-sm mt-3" onclick="App.openProfileModal()">改档案</button>
      </div>

      <div class="card">
        <div class="card-title">归园田 · 归乡路</div>
        ${dreams.length === 0 ? `
          <div class="empty" style="padding:var(--sp-4)">
            <div class="empty-glyph" style="font-size:32px">田</div>
            <div class="empty-text">尚未立愿</div>
            <button class="btn btn-ochre btn-sm mt-3" onclick="App.openDreamModal()">立一个愿</button>
          </div>
        ` : dreams.map(d => this.dreamCard(d, settings)).join('')}
      </div>

      <div class="card">
        <div class="card-title">诗笺集</div>
        <div class="stat-grid">
          <div class="stat-cell" onclick="App.go('chronicle')">
            <div class="stat-num">${stats.chronicleCount}</div>
            <div class="stat-label">诗笺</div>
          </div>
          <div class="stat-cell" onclick="App.go('salary')">
            <div class="stat-num ochre">${stats.salaryCount}</div>
            <div class="stat-label">薪火</div>
          </div>
          <div class="stat-cell" onclick="App.go('craft')">
            <div class="stat-num celadon">${stats.skillCount}</div>
            <div class="stat-label">匠心</div>
          </div>
          <div class="stat-cell">
            <div class="stat-num">${this.fmtNum(stats.totalHours)}</div>
            <div class="stat-label">总工时</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">设置</div>
        <div class="list-item" onclick="App.toggleSetting('remindDaily')">
          <div class="list-item-main">
            <div class="list-item-title">每日撰笺提醒</div>
            <div class="list-item-sub">收工后提醒记录</div>
          </div>
          <div class="list-item-right text-${settings.remindDaily?'celadon':'light'}">${settings.remindDaily?'开':'关'}</div>
        </div>
        <div class="list-item" onclick="App.toggleSetting('remindTerm')">
          <div class="list-item-main">
            <div class="list-item-title">节气切换提醒</div>
            <div class="list-item-sub">每 15 天提醒</div>
          </div>
          <div class="list-item-right text-${settings.remindTerm?'celadon':'light'}">${settings.remindTerm?'开':'关'}</div>
        </div>
        <div class="list-item" onclick="App.setAllocateRate()">
          <div class="list-item-main">
            <div class="list-item-title">归园田划拨比例</div>
            <div class="list-item-sub">每笔薪火自动划入梦想</div>
          </div>
          <div class="list-item-right text-ochre">${settings.allocateRate}%</div>
        </div>
        <div class="list-item" onclick="App.exportData()">
          <div class="list-item-main"><div class="list-item-title">导出全部数据</div></div>
          <div class="list-item-right text-light">›</div>
        </div>
        <div class="list-item" onclick="App.resetData()">
          <div class="list-item-main"><div class="list-item-title" style="color:var(--cinnabar)">清空全部数据</div></div>
          <div class="list-item-right text-light">›</div>
        </div>
      </div>

      <div class="text-center text-tiny text-light mt-5">
        诗笺·打工志 v1.0<br>
        不为赋新词强说愁，只为打工路上留一笔
      </div>
    `;
    document.getElementById('page-me').innerHTML = html;
  },

  dreamCard(d, settings) {
    const pct = Math.min(100, Math.round((d.allocated / d.targetAmount) * 100));
    const poem = PoemDB.getById(d.poemId);
    const stops = ['打工城', '', '', '', '', '归园田'];
    const walkerPos = `calc(${pct}% )`;
    return `
      <div style="margin-bottom:var(--sp-5)">
        <div class="flex justify-between items-center mb-2">
          <div class="text-xiaowei" style="font-size:17px">${this.esc(d.title)}</div>
          ${d.fulfilled ? '<span class="tag tag-cinnabar">圆愿</span>' : ''}
        </div>
        ${poem ? `<div class="text-kai text-note text-light mb-3" style="text-align:center">${poem.poem}</div>` : ''}
        <div class="journey">
          <div class="journey-track">
            <div class="journey-fill" style="width:${pct}%"></div>
            <div class="journey-walker" style="left:${pct}%">🚶</div>
          </div>
          <div class="journey-stops">
            ${stops.map((s,i) => {
              const reached = pct >= (i/5*100);
              const cls = (i===0?'start':i===5?'end':'') + (reached?' reached':'');
              return `<div class="journey-stop ${cls}"><div class="journey-stop-dot"></div><span>${s||''}</span></div>`;
            }).join('')}
          </div>
        </div>
        <div class="flex justify-between text-tiny text-light mt-3">
          <span>¥${this.fmtNum(d.allocated)} / ¥${this.fmtNum(d.targetAmount)}</span>
          <span>${pct}%</span>
        </div>
        ${d.targetDate ? `<div class="text-tiny text-light text-center mt-2">期 ${this.fmtDate(new Date(d.targetDate))}</div>` : ''}
        <div class="flex gap-2 mt-3">
          ${d.fulfilled ? '' : `<button class="btn btn-ghost btn-sm" style="flex:1" onclick="App.allocManual('${d.id}')">手划拨</button>`}
          <button class="btn btn-ghost btn-sm" style="flex:1;color:var(--cinnabar)" onclick="App.delDream('${d.id}')">删</button>
        </div>
      </div>
    `;
  },

  openProfileModal() {
    const p = Store.getProfile();
    const html = `
      <div class="modal-handle"></div>
      <div class="modal-title">立户档案</div>
      <div class="field">
        <label class="field-label">昵称</label>
        <input class="input" id="p-nick" value="${this.esc(p.nickname)}">
      </div>
      <div class="field">
        <label class="field-label">工种（选填）</label>
        <input class="input" id="p-craft" value="${this.esc(p.craft)}" placeholder="如 装配工">
      </div>
      <div class="field">
        <label class="field-label">故乡（选填）</label>
        <input class="input" id="p-home" value="${this.esc(p.hometown)}" placeholder="如 河南信阳">
      </div>
      <div class="field">
        <label class="field-label">目标（选填）</label>
        <input class="input" id="p-goal" value="${this.esc(p.goal)}" placeholder="如 攒钱回乡开小卖部">
      </div>
      <button class="btn btn-primary btn-block mt-4" onclick="App.saveProfile()">落定</button>
    `;
    this.openModal(html);
  },

  saveProfile() {
    Store.setProfile({
      nickname: document.getElementById('p-nick').value.trim() || '打工人',
      craft: document.getElementById('p-craft').value.trim(),
      hometown: document.getElementById('p-home').value.trim(),
      goal: document.getElementById('p-goal').value.trim()
    });
    this.closeModal();
    this.renderPage('me');
    this.renderPage('home');
    this.toast('档案已落定');
  },

  openDreamModal() {
    const poem = PoemDB.match({ scene: 'dream', mood: 4 });
    const html = `
      <div class="modal-handle"></div>
      <div class="modal-title">立一个愿</div>
      <div class="field">
        <label class="field-label">愿景名</label>
        <input class="input" id="d-title" placeholder="如 回乡开小卖部 / 给爸妈盖新房">
      </div>
      <div class="field">
        <label class="field-label">目标金额（元）</label>
        <input class="input" type="number" id="d-amount" placeholder="如 100000" min="0">
      </div>
      <div class="field">
        <label class="field-label">计划达成日期（选填）</label>
        <input class="input" type="date" id="d-date">
      </div>
      <div class="field">
        <label class="field-label">配诗</label>
        <div class="poem-card" id="d-poem" style="margin:0;cursor:pointer" onclick="App.rerollDreamPoem()">
          <div class="poem-line" id="d-poem-line">${poem.poem}</div>
          <div class="poem-meta" id="d-poem-meta">—— ${poem.author}（${poem.dynasty}）《${poem.title}》</div>
        </div>
      </div>
      <button class="btn btn-ochre btn-block mt-4" onclick="App.saveDream()">立愿</button>
    `;
    this.openModal(html);
    this._dreamPoem = poem;
  },

  rerollDreamPoem() {
    const poem = PoemDB.match({ scene: 'dream', mood: 4 });
    this._dreamPoem = poem;
    document.getElementById('d-poem-line').textContent = poem.poem;
    document.getElementById('d-poem-meta').textContent = `—— ${poem.author}（${poem.dynasty}）《${poem.title}》`;
  },

  saveDream() {
    const title = document.getElementById('d-title').value.trim();
    const amount = parseFloat(document.getElementById('d-amount').value);
    if (!title || !amount) { this.toast('请填写愿景与金额'); return; }
    const dateStr = document.getElementById('d-date').value;
    Store.addDream({
      title,
      targetAmount: amount,
      targetDate: dateStr ? new Date(dateStr).getTime() : null,
      poemId: this._dreamPoem.id
    });
    this.closeModal();
    this.renderPage('me');
    this.renderPage('home');
    this.toast('愿已立，归乡路始');
  },

  allocManual(id) {
    const amt = prompt('手动划拨多少元？', '100');
    if (amt === null) return;
    const n = parseFloat(amt);
    if (!n || n <= 0) { this.toast('请输入有效金额'); return; }
    Store.allocateToDream(id, n);
    const d = Store.getDreams().find(x => x.id === id);
    if (d && d.fulfilled) {
      this.toast('圆愿！归园田居成', 3000);
    } else {
      this.toast(`已划拨 ¥${n}`);
    }
    this.renderPage('me');
    this.renderPage('home');
  },

  delDream(id) {
    if (!confirm('删除此愿？')) return;
    Store.deleteDream(id);
    this.renderPage('me');
    this.renderPage('home');
    this.toast('已删除');
  },

  toggleSetting(key) {
    const s = Store.getSettings();
    Store.setSettings({ [key]: !s[key] });
    this.renderPage('me');
    this.toast(s[key] ? '已关' : '已开');
  },

  setAllocateRate() {
    const r = prompt('划拨比例（0-100）', String(Store.getSettings().allocateRate));
    if (r === null) return;
    const n = parseInt(r);
    if (isNaN(n) || n < 0 || n > 100) { this.toast('请输入 0-100'); return; }
    Store.setSettings({ allocateRate: n });
    this.renderPage('me');
    this.toast('已设 ' + n + '%');
  },

  exportData() {
    const data = Store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `诗笺打工志_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    this.toast('已导出');
  },

  resetData() {
    if (!confirm('确定清空全部数据？此操作不可恢复。')) return;
    if (!confirm('再次确认：所有诗笺、薪火、匠心、归园田将被清空。')) return;
    Store.clearAll();
    this.render();
    this.toast('已清空');
  },

  /* ============== 工具 ============== */
  openModal(html) {
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-mask').classList.add('show');
  },
  closeModal() {
    document.getElementById('modal-mask').classList.remove('show');
  },
  toast(msg, dur = 2000) {
    let t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), dur);
  },
  esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  fmtDate(d) { return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; },
  fmtNum(n) { return (n || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 }); },
  weekday(d) { return ['日','一','二','三','四','五','六'][d.getDay()]; },
  termIndex(t) { return SolarTerms.getTermIndex(t.name); },
  poemText(id) { const p = PoemDB.getById(id); return p ? p.poem : '——'; },
  poemMeta(id) { const p = PoemDB.getById(id); return p ? `—— ${p.author}（${p.dynasty}）《${p.title}》` : ''; },
  craftLabel(c) { return c || '未选'; },
  moodLabel(v) { const m = this.MOODS.find(x => x.v === v); return m ? m.label : '平常'; }
};

document.addEventListener('DOMContentLoaded', () => App.init());
