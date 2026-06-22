/**
 * 智学错题本 - 主应用逻辑
 */
const App = {
  currentTab: 'home',
  reviewQueue: [],
  reviewIndex: 0,

  /** 初始化 */
  init() {
    const user = Store.getUser();
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.avatar;

    // 填充学科筛选
    const filterSubject = document.getElementById('filterSubject');
    Store.getSubjects().forEach(s => {
      filterSubject.innerHTML += `<option value="${s.id}">${s.icon} ${s.name}</option>`;
    });

    this.renderHome();
  },

  /** 切换 Tab */
  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    document.getElementById(`page-${tab}`).classList.add('active');

    // 隐藏/显示 FAB 按钮
    document.querySelector('.add-fab').style.display = tab === 'review' ? 'none' : 'flex';

    if (tab === 'home') this.renderHome();
    if (tab === 'questions') this.renderQuestions();
    if (tab === 'review') this.renderReview();
    if (tab === 'stats') this.renderStats();
  },

  // ==================== 首页 ====================
  renderHome() {
    const user = Store.getUser();
    const stats = Store.getStats();

    document.getElementById('checkinStreak').textContent = `连续打卡 ${user.streak} 天`;
    document.getElementById('checkinTotal').textContent = `累计学习 ${user.totalStudyDays} 天 · 加油！`;

    // 检查今日是否已打卡
    const today = new Date(); today.setHours(0,0,0,0);
    const last = new Date(user.lastCheckIn); last.setHours(0,0,0,0);
    if (today.getTime() === last.getTime()) {
      const btn = document.getElementById('checkinBtn');
      btn.textContent = '已打卡 ✓';
      btn.disabled = true;
    }

    // 统计
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statMastered').textContent = stats.mastered;
    document.getElementById('statLearning').textContent = stats.learning;
    document.getElementById('statMastery').textContent = stats.masteryRate + '%';

    // 今日复习
    document.getElementById('reviewDesc').textContent = `${stats.todayReviewCount} 道错题需要复习`;

    // 学习曲线
    this.renderWeekChart(stats.recent7Days);

    // 最近添加
    const recent = Store.getQuestions().slice(0, 3);
    const container = document.getElementById('recentQuestions');
    if (recent.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">📝</div><p>还没有错题，点击右下角 + 添加</p></div>';
    } else {
      container.innerHTML = recent.map(q => this._questionCardHTML(q)).join('');
    }
  },

  /** 学习曲线图 */
  renderWeekChart(data) {
    const maxDuration = Math.max(...data.map(d => d.duration), 60);
    const totalMin = data.reduce((sum, d) => sum + d.duration, 0);
    document.getElementById('weekTotal').textContent = `本周 ${totalMin} 分钟`;

    document.getElementById('weekChart').innerHTML = data.map(d => {
      const height = maxDuration > 0 ? (d.duration / maxDuration) * 80 : 0;
      const isEmpty = d.duration === 0;
      return `
        <div class="chart-bar-wrap">
          <span class="chart-value">${d.duration > 0 ? d.duration : ''}</span>
          <div class="chart-bar ${isEmpty ? 'empty' : ''}" style="height:${height}px;" title="${d.duration}分钟"></div>
          <span class="chart-label">${d.label}</span>
        </div>
      `;
    }).join('');
  },

  /** 打卡 */
  checkIn() {
    const result = Store.checkIn();
    if (result.success) {
      App.toast(`✅ 打卡成功！连续 ${result.streak} 天`);
      this.renderHome();
    } else {
      App.toast(result.msg);
    }
  },

  // ==================== 错题本 ====================
  renderQuestions() {
    const filter = {};
    const subjectId = document.getElementById('filterSubject').value;
    const status = document.getElementById('filterStatus').value;
    const keyword = document.getElementById('searchInput').value.trim();

    if (subjectId) filter.subjectId = subjectId;
    if (status) filter.status = status;
    if (keyword) filter.keyword = keyword;

    const questions = Store.getQuestions(filter);
    document.getElementById('questionCount').textContent = `${questions.length} 道`;

    const container = document.getElementById('questionList');
    if (questions.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">📝</div><p>暂无错题，点击右下角 + 添加</p></div>';
      return;
    }
    container.innerHTML = questions.map(q => this._questionCardHTML(q)).join('');
  },

  /** 错题卡片 HTML */
  _questionCardHTML(q) {
    const subject = Store.getSubjectById(q.subjectId);
    const stars = '★'.repeat(q.difficulty) + '☆'.repeat(3 - q.difficulty);
    const statusTag = q.status === 'mastered'
      ? '<span class="tag tag-green">已掌握</span>'
      : '<span class="tag tag-orange">学习中</span>';

    return `
      <div class="question-card status-${q.status}" onclick="App.showQuestionDetail('${q.id}')">
        <div class="question-header">
          <span class="question-subject">
            ${subject ? subject.icon : ''} ${q.subjectName}
          </span>
          ${statusTag}
        </div>
        <div class="question-body">${App.escape(q.question)}</div>
        <div class="question-footer">
          <div class="question-tags">
            <span class="tag tag-gray">${App.escape(q.knowledgePoint)}</span>
            <span class="tag tag-red">${App.escape(q.errorType)}</span>
          </div>
          <span class="difficulty-stars">${stars}</span>
        </div>
      </div>
    `;
  },

  /** 错题详情 */
  showQuestionDetail(id) {
    const q = Store.getQuestionById(id);
    if (!q) return;
    const subject = Store.getSubjectById(q.subjectId);
    const stars = '★'.repeat(q.difficulty) + '☆'.repeat(3 - q.difficulty);

    App.showModal(`
      <div class="modal-title">
        <span>${subject ? subject.icon + ' ' : ''}${q.subjectName} · ${q.knowledgePoint}</span>
        <button class="modal-close" onclick="App.closeModal()">&times;</button>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="flex-between mb-10">
          <span class="tag tag-red">${App.escape(q.errorType)}</span>
          <span class="difficulty-stars">${stars}</span>
        </div>
        <div style="font-size:16px;font-weight:600;margin-bottom:12px;">${App.escape(q.question)}</div>
      </div>
      <div class="review-answer wrong" style="margin-bottom:10px;">
        <div class="label">❌ 我的答案</div>
        <div class="content">${App.escape(q.myAnswer)}</div>
      </div>
      <div class="review-answer correct" style="margin-bottom:10px;">
        <div class="label">✅ 正确答案</div>
        <div class="content">${App.escape(q.correctAnswer)}</div>
      </div>
      ${q.note ? `<div class="review-note">💡 ${App.escape(q.note)}</div>` : ''}
      <div class="card" style="padding:12px;">
        <div class="info-row"><span class="text-light text-sm">添加时间</span><span class="text-sm">${App.formatDate(q.addDate)}</span></div>
        <div class="info-row"><span class="text-light text-sm">复习次数</span><span class="text-sm">${q.reviewCount} 次</span></div>
        <div class="info-row"><span class="text-light text-sm">下次复习</span><span class="text-sm">${q.status === 'mastered' ? App.formatDate(q.nextReview) : '今天'}</span></div>
      </div>
      <div class="modal-actions">
        ${q.status === 'learning' ? `<button class="btn btn-green btn-block" onclick="App.markMastered('${q.id}')">标记已掌握</button>` : ''}
        <button class="btn btn-outline" onclick="App.showEditModal('${q.id}')">编辑</button>
        <button class="btn btn-red" onclick="App.deleteQuestion('${q.id}')">删除</button>
      </div>
    `);
  },

  /** 标记已掌握 */
  markMastered(id) {
    Store.reviewQuestion(id, 'mastered');
    App.closeModal();
    App.toast('🎉 恭喜！已标记为掌握');
    this.renderQuestions();
  },

  /** 删除错题 */
  deleteQuestion(id) {
    if (!confirm('确认删除这道错题？')) return;
    Store.deleteQuestion(id);
    App.closeModal();
    App.toast('已删除');
    this.renderQuestions();
  },

  // ==================== 添加/编辑错题 ====================
  showAddModal() {
    const subjects = Store.getSubjects();
    App.showModal(`
      <div class="modal-title">
        <span>添加错题</span>
        <button class="modal-close" onclick="App.closeModal()">&times;</button>
      </div>
      <div class="photo-upload" onclick="document.getElementById('photoInput').click()">
        <div class="icon">📷</div>
        <p>点击拍照或上传错题图片</p>
        <input type="file" id="photoInput" accept="image/*" capture="camera" style="display:none;" onchange="App.handlePhoto(this)">
        <img id="photoPreview" class="photo-preview hidden" style="max-height:200px;">
      </div>
      <div class="form-group mt-20">
        <label>学科</label>
        <select id="addSubject">
          ${subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>知识点</label>
        <input id="addKnowledge" placeholder="如：一元二次方程" list="knowledgeList">
        <datalist id="knowledgeList">
          ${Store.db.tags.map(t => `<option value="${App.escape(t)}">`).join('')}
        </datalist>
      </div>
      <div class="form-group">
        <label>题目内容</label>
        <textarea id="addQuestion" placeholder="输入题目内容..."></textarea>
      </div>
      <div class="form-group">
        <label>我的答案</label>
        <textarea id="addMyAnswer" placeholder="输入你的答案..."></textarea>
      </div>
      <div class="form-group">
        <label>正确答案</label>
        <textarea id="addCorrectAnswer" placeholder="输入正确答案..."></textarea>
      </div>
      <div class="form-group">
        <label>错误类型</label>
        <select id="addErrorType">
          <option value="计算错误">计算错误</option>
          <option value="概念错误">概念错误</option>
          <option value="思路不清">思路不清</option>
          <option value="语法混淆">语法混淆</option>
          <option value="理解偏差">理解偏差</option>
          <option value="粗心大意">粗心大意</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div class="form-group">
        <label>难度</label>
        <select id="addDifficulty">
          <option value="1">★ 简单</option>
          <option value="2" selected>★★ 中等</option>
          <option value="3">★★★ 困难</option>
        </select>
      </div>
      <div class="form-group">
        <label>笔记（选填）</label>
        <textarea id="addNote" placeholder="记录解题思路、易错点等..."></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-gray btn-block" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary btn-block" onclick="App.submitAdd()">保存</button>
      </div>
    `);
  },

  /** 处理照片上传 */
  currentPhoto: '',
  handlePhoto(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentPhoto = e.target.result;
      const preview = document.getElementById('photoPreview');
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  },

  /** 提交添加 */
  submitAdd() {
    const subjectId = document.getElementById('addSubject').value;
    const knowledge = document.getElementById('addKnowledge').value.trim();
    const question = document.getElementById('addQuestion').value.trim();
    const myAnswer = document.getElementById('addMyAnswer').value.trim();
    const correctAnswer = document.getElementById('addCorrectAnswer').value.trim();

    if (!question) { App.toast('请输入题目内容'); return; }
    if (!correctAnswer) { App.toast('请输入正确答案'); return; }

    Store.addQuestion({
      subjectId,
      knowledgePoint: knowledge || '未分类',
      question,
      myAnswer: myAnswer || '未作答',
      correctAnswer,
      errorType: document.getElementById('addErrorType').value,
      difficulty: parseInt(document.getElementById('addDifficulty').value),
      note: document.getElementById('addNote').value.trim(),
      photo: this.currentPhoto,
    });

    Store.addStudyLog({ duration: 5, type: 'add', count: 1, note: '添加错题' });
    this.currentPhoto = '';
    App.closeModal();
    App.toast('✅ 错题已添加');
    this.renderQuestions();
  },

  /** 编辑错题 */
  showEditModal(id) {
    const q = Store.getQuestionById(id);
    if (!q) return;
    App.closeModal();
    const subjects = Store.getSubjects();
    App.showModal(`
      <div class="modal-title">
        <span>编辑错题</span>
        <button class="modal-close" onclick="App.closeModal()">&times;</button>
      </div>
      <div class="form-group">
        <label>学科</label>
        <select id="editSubject">
          ${subjects.map(s => `<option value="${s.id}" ${s.id === q.subjectId ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>知识点</label>
        <input id="editKnowledge" value="${App.escape(q.knowledgePoint)}">
      </div>
      <div class="form-group">
        <label>题目内容</label>
        <textarea id="editQuestion">${App.escape(q.question)}</textarea>
      </div>
      <div class="form-group">
        <label>我的答案</label>
        <textarea id="editMyAnswer">${App.escape(q.myAnswer)}</textarea>
      </div>
      <div class="form-group">
        <label>正确答案</label>
        <textarea id="editCorrectAnswer">${App.escape(q.correctAnswer)}</textarea>
      </div>
      <div class="form-group">
        <label>错误类型</label>
        <select id="editErrorType">
          ${['计算错误','概念错误','思路不清','语法混淆','理解偏差','粗心大意','其他'].map(t =>
            `<option value="${t}" ${t === q.errorType ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>难度</label>
        <select id="editDifficulty">
          <option value="1" ${q.difficulty === 1 ? 'selected' : ''}>★ 简单</option>
          <option value="2" ${q.difficulty === 2 ? 'selected' : ''}>★★ 中等</option>
          <option value="3" ${q.difficulty === 3 ? 'selected' : ''}>★★★ 困难</option>
        </select>
      </div>
      <div class="form-group">
        <label>笔记</label>
        <textarea id="editNote">${App.escape(q.note || '')}</textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-gray btn-block" onclick="App.closeModal()">取消</button>
        <button class="btn btn-primary btn-block" onclick="App.submitEdit('${q.id}')">保存</button>
      </div>
    `);
  },

  submitEdit(id) {
    Store.updateQuestion(id, {
      subjectId: document.getElementById('editSubject').value,
      knowledgePoint: document.getElementById('editKnowledge').value.trim(),
      question: document.getElementById('editQuestion').value.trim(),
      myAnswer: document.getElementById('editMyAnswer').value.trim(),
      correctAnswer: document.getElementById('editCorrectAnswer').value.trim(),
      errorType: document.getElementById('editErrorType').value,
      difficulty: parseInt(document.getElementById('editDifficulty').value),
      note: document.getElementById('editNote').value.trim(),
    });
    const subject = Store.getSubjectById(document.getElementById('editSubject').value);
    if (subject) Store.updateQuestion(id, { subjectName: subject.name });
    App.closeModal();
    App.toast('✅ 已保存修改');
    this.renderQuestions();
  },

  // ==================== 复习模式 ====================
  renderReview() {
    const todayReview = Store.getTodayReview();
    this.reviewQueue = todayReview;
    this.reviewIndex = 0;

    if (todayReview.length === 0) {
      document.getElementById('reviewContainer').innerHTML = `
        <div class="empty-state" style="padding:80px 20px;">
          <div class="icon">🎉</div>
          <h3 style="margin-bottom:8px;">今日复习已完成！</h3>
          <p>没有需要复习的错题，继续保持！</p>
        </div>
      `;
      return;
    }
    this._renderReviewCard();
  },

  _renderReviewCard() {
    if (this.reviewIndex >= this.reviewQueue.length) {
      document.getElementById('reviewContainer').innerHTML = `
        <div class="empty-state" style="padding:80px 20px;">
          <div class="icon">🎊</div>
          <h3 style="margin-bottom:8px;">全部复习完成！</h3>
          <p>今天完成了 ${this.reviewQueue.length} 道错题的复习</p>
          <button class="btn btn-primary mt-20" onclick="App.switchTab('home')">返回首页</button>
        </div>
      `;
      Store.addStudyLog({ duration: this.reviewQueue.length * 3, type: 'review', count: this.reviewQueue.length, note: '完成今日复习' });
      return;
    }

    const q = this.reviewQueue[this.reviewIndex];
    const subject = Store.getSubjectById(q.subjectId);
    const progress = ((this.reviewIndex) / this.reviewQueue.length) * 100;

    document.getElementById('reviewContainer').innerHTML = `
      <div class="review-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%;"></div></div>
        <span class="progress-text">${this.reviewIndex + 1} / ${this.reviewQueue.length}</span>
      </div>
      <div class="review-card">
        <div class="flex-between mb-10">
          <span class="tag tag-blue">${subject ? subject.icon : ''} ${q.subjectName}</span>
          <span class="tag tag-gray">${App.escape(q.knowledgePoint)}</span>
        </div>
        <div class="review-question">${App.escape(q.question)}</div>

        <div class="review-answer wrong" style="margin-bottom:12px;">
          <div class="label">❌ 我的答案</div>
          <div class="content">${App.escape(q.myAnswer)}</div>
        </div>

        <div class="review-answer correct" style="margin-bottom:12px; display:none;" id="correctAnswerBox">
          <div class="label">✅ 正确答案</div>
          <div class="content">${App.escape(q.correctAnswer)}</div>
        </div>

        <div class="review-note" style="display:none;" id="reviewNoteBox">
          💡 ${App.escape(q.note || '暂无笔记')}
        </div>

        <div id="reviewActionArea">
          <button class="btn btn-outline btn-block" onclick="App.showReviewAnswer()">查看答案</button>
        </div>
      </div>
    `;
  },

  showReviewAnswer() {
    document.getElementById('correctAnswerBox').style.display = 'block';
    const noteBox = document.getElementById('reviewNoteBox');
    if (noteBox) noteBox.style.display = 'block';
    document.getElementById('reviewActionArea').innerHTML = `
      <p class="text-center text-sm text-light mb-10">这道题你掌握了吗？</p>
      <div class="review-actions">
        <button class="btn btn-orange" onclick="App.reviewNext('learning')">还没掌握</button>
        <button class="btn btn-green" onclick="App.reviewNext('mastered')">已掌握</button>
      </div>
    `;
  },

  reviewNext(result) {
    const q = this.reviewQueue[this.reviewIndex];
    Store.reviewQuestion(q.id, result);
    this.reviewIndex++;
    this._renderReviewCard();
  },

  /** 从首页开始复习 */
  startReview() {
    this.switchTab('review');
  },

  // ==================== 统计页 ====================
  renderStats() {
    const stats = Store.getStats();

    // 掌握率环形图
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (stats.masteryRate / 100) * circumference;
    document.getElementById('masteryRing').innerHTML = `
      <svg width="120" height="120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#EAEAEA" stroke-width="10"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#4CAF7D" stroke-width="10"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          stroke-linecap="round" style="transition:stroke-dashoffset 0.5s;"/>
      </svg>
      <div class="ring-text">
        <div class="ring-num">${stats.masteryRate}%</div>
        <div class="ring-label">掌握率</div>
      </div>
    `;
    document.getElementById('masteryDetail').textContent =
      `共 ${stats.total} 道错题，已掌握 ${stats.mastered} 道，学习中 ${stats.learning} 道`;

    // 学科分布
    document.getElementById('subjectProgress').innerHTML = stats.bySubject.map(s => {
      const rate = s.total > 0 ? Math.round((s.mastered / s.total) * 100) : 0;
      return `
        <div class="subject-progress">
          <div class="sp-header">
            <span class="sp-name">${s.icon} ${s.name}</span>
            <span class="sp-count">${s.mastered}/${s.total} · ${rate}%</span>
          </div>
          <div class="sp-bar">
            <div class="sp-fill" style="width:${rate}%;background:${s.color};"></div>
          </div>
        </div>
      `;
    }).join('');

    // 错误类型
    const errorTypes = stats.errorTypes;
    const maxCount = Math.max(...Object.values(errorTypes), 1);
    const colors = ['#E84A4A', '#F5A623', '#4A90D9', '#9B6BCD', '#4CAF7D', '#E8654A'];
    document.getElementById('errorTypeList').innerHTML = Object.entries(errorTypes).map(([type, count], i) => {
      const width = (count / maxCount) * 100;
      return `
        <li class="error-type-item">
          <div class="error-type-bar">
            <div class="error-type-fill" style="width:${width}%;background:${colors[i % colors.length]};"></div>
            <span class="error-type-label">${App.escape(type)}</span>
          </div>
          <span class="error-type-count">${count}</span>
        </li>
      `;
    }).join('');

    // 学习记录
    const logs = Store.getStudyLogs().slice(0, 10);
    document.getElementById('studyLogList').innerHTML = logs.map(l => `
      <div class="info-row">
        <span class="text-sm">${l.type === 'review' ? '🔄 复习' : '📝 添加'} · ${App.escape(l.note)}</span>
        <span class="text-sm text-light">${App.formatDate(l.date)} · ${l.duration}分钟</span>
      </div>
    `).join('');
  },

  // ==================== 公共方法 ====================
  toast(msg, duration = 2000) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
  },

  showModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('show');
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
  },

  formatDate(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const day = 86400000;
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < day) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 7 * day) return Math.floor(diff / day) + '天前';
    const d = new Date(timestamp);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  },

  escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
};

// 点击遮罩关闭弹窗
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') App.closeModal();
});
