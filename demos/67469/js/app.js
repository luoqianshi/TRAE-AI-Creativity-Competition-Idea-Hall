const App = {
  init() {
    Storage.init();
    this.renderNavbar();
    this.renderFooter();
    this.initPage();
  },

  renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const currentUser = Auth.getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navbar.innerHTML = `
      <nav class="navbar">
        <div class="container">
          <a href="index.html" class="logo">
            <span class="logo-icon">✨</span>
            <span>趣享</span>
          </a>
          <div class="nav-links">
            <a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">首页</a>
            <a href="community.html" class="${currentPage === 'community.html' ? 'active' : ''}">社区</a>
            <a href="create.html" class="${currentPage === 'create.html' ? 'active' : ''}">创作</a>
          </div>
          <div class="nav-actions">
            ${currentUser ? `
              <div class="avatar" onclick="location.href='profile.html'" title="${currentUser.username}">
                ${currentUser.avatar}
              </div>
            ` : `
              <a href="login.html" class="btn btn-primary">登录 / 注册</a>
            `}
          </div>
        </div>
      </nav>
    `;
  },

  renderFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    footer.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="logo">
            <span class="logo-icon">✨</span>
            <span>趣享</span>
          </div>
          <p>发现兴趣，分享快乐 · 零基础轻松学新技能</p>
          <p style="margin-top: 8px; font-size: 12px;">© 2026 趣享 QuXiang - 让兴趣点亮生活</p>
        </div>
      </footer>
    `;
  },

  initPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    switch (currentPage) {
      case 'index.html':
        this.initHomePage();
        break;
      case 'course.html':
        this.initCoursePage();
        break;
      case 'create.html':
        this.initCreatePage();
        break;
      case 'profile.html':
        this.initProfilePage();
        break;
      case 'community.html':
        this.initCommunityPage();
        break;
      case 'login.html':
        this.initLoginPage();
        break;
    }
  },

  initHomePage() {
    this.renderCategories();
    this.renderDifficultyTabs();
    this.renderCoursesByDifficulty('beginner');
    this.renderRecommendedCourses();
    this.renderContinueLearning();
    this.renderTeachers();
    this.renderGalleryTabs();
    this.renderGalleryWorks('all');
    this.renderRankingTabs();
    this.renderRankingList('difficulty');
    this.renderHotWorks();
  },

  renderDifficultyTabs() {
    const container = document.getElementById('difficulty-tabs');
    if (!container) return;

    const levels = Utils.getDifficultyLevels();
    const allCourses = Storage.getCourses();

    container.innerHTML = levels.map((level, i) => {
      const count = allCourses.filter(c => c.difficulty === level.key).length;
      return `
        <div class="difficulty-tab ${i === 0 ? 'active' : ''}" data-difficulty="${level.key}" onclick="App.switchDifficulty('${level.key}', this)">
          <span>${level.icon}</span>
          <span>${level.label}</span>
          <span style="opacity: 0.7; font-size: 12px;">(${count})</span>
        </div>
      `;
    }).join('');
  },

  switchDifficulty(difficulty, tabEl) {
    const tabs = document.querySelectorAll('.difficulty-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    this.renderCoursesByDifficulty(difficulty);
  },

  renderCoursesByDifficulty(difficulty) {
    const container = document.getElementById('level-courses');
    if (!container) return;

    const allCourses = Storage.getCourses();
    const filteredCourses = allCourses.filter(c => c.difficulty === difficulty);
    const currentUser = Auth.getCurrentUser();

    if (filteredCourses.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
          <p>该难度等级的课程正在精心准备中，敬请期待~</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredCourses.map((course, i) => {
      const color = Utils.getCategoryColor(course.category);
      const userProgress = currentUser ? Storage.getCourseProgress(currentUser.id, course.id) : null;
      
      return `
        <div class="course-card card fade-in" style="animation-delay: ${i * 0.05}s;" onclick="location.href='course.html?id=${course.id}'">
          <div class="course-cover" style="background: ${color.bg};">
            <span style="font-size: 56px;">${course.cover}</span>
            <span class="badge ${Utils.getDifficultyClass(course.difficulty)} course-badge">
              ${Utils.getDifficultyLabel(course.difficulty)}
            </span>
          </div>
          <div class="course-info">
            <div class="course-title" style="font-size: 15px;">${course.title}</div>
            <div class="course-meta">
              <span style="font-size: 12px;">${Utils.getCategoryName(course.category)}</span>
              <span>⏱ ${Utils.formatTime(course.duration)}</span>
            </div>
            <div class="course-meta" style="margin-top: 4px;">
              <span>👥 ${course.learners.toLocaleString()} 人学习</span>
            </div>
            ${userProgress && userProgress.progress > 0 ? `
              <div class="course-progress" style="margin-top: 10px;">
                <div class="course-progress-bar progress-animate" style="width: ${userProgress.progress}%"></div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  renderCategories() {
    const container = document.getElementById('category-grid');
    if (!container) return;

    const categories = MockData.categories;
    const courses = Storage.getCourses();

    container.innerHTML = categories.map((cat, i) => {
      const count = courses.filter(c => c.category === cat.id).length;
      return `
        <div class="category-card ${cat.color} slide-up stagger-${i + 1}" onclick="location.href='index.html?category=${cat.id}'">
          <div class="category-icon">${cat.icon}</div>
          <div class="category-name">${cat.name}</div>
          <div class="category-count">${count} 门课程</div>
        </div>
      `;
    }).join('');
  },

  renderRecommendedCourses() {
    const container = document.getElementById('recommended-courses');
    if (!container) return;

    const currentUser = Auth.getCurrentUser();
    const courses = Storage.getRecommendedCourses(currentUser?.id, 8);

    container.innerHTML = courses.map((course, i) => {
      const color = Utils.getCategoryColor(course.category);
      const userProgress = currentUser ? Storage.getCourseProgress(currentUser.id, course.id) : null;
      
      return `
        <div class="course-card card slide-up stagger-${(i % 6) + 1}" onclick="location.href='course.html?id=${course.id}'">
          <div class="course-cover" style="background: ${color.bg};">
            <span>${course.cover}</span>
            <span class="badge ${Utils.getDifficultyClass(course.difficulty)} course-badge">
              ${Utils.getDifficultyLabel(course.difficulty)}
            </span>
          </div>
          <div class="course-info">
            <div class="course-title">${course.title}</div>
            <div class="course-meta">
              <span>👥 ${course.learners.toLocaleString()} 人学习</span>
              <span>⏱ ${Utils.formatTime(course.duration)}</span>
            </div>
            ${userProgress && userProgress.progress > 0 ? `
              <div class="course-progress">
                <div class="course-progress-bar" style="width: ${userProgress.progress}%"></div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  renderContinueLearning() {
    const container = document.getElementById('continue-learning');
    const section = document.getElementById('continue-section');
    if (!container || !section) return;

    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      section.style.display = 'none';
      return;
    }

    const courses = Storage.getContinueLearning(currentUser.id, 6);
    
    if (courses.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    container.innerHTML = courses.map((course, i) => {
      const color = Utils.getCategoryColor(course.category);
      const progress = course.userProgress.progress;
      
      return `
        <div class="course-card card" onclick="location.href='course.html?id=${course.id}'">
          <div class="course-cover" style="background: ${color.bg};">
            <span>${course.cover}</span>
            <span class="badge ${Utils.getDifficultyClass(course.difficulty)} course-badge">
              ${Utils.getDifficultyLabel(course.difficulty)}
            </span>
          </div>
          <div class="course-info">
            <div class="course-title">${course.title}</div>
            <div class="course-meta">
              <span>继续学习</span>
              <span>${progress}%</span>
            </div>
            <div class="course-progress">
              <div class="course-progress-bar progress-animate" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderTeachers() {
    const container = document.getElementById('teacher-grid');
    if (!container) return;

    const teachers = MockData.teachers;

    container.innerHTML = teachers.map((teacher, i) => {
      const categoryName = Utils.getCategoryName(teacher.category);
      return `
        <div class="teacher-card card slide-up stagger-${(i % 4) + 1}" style="--card-color: ${teacher.coverColor};">
          <div class="teacher-cover" style="background: ${teacher.coverColor};">
            <div class="teacher-avatar">${teacher.avatar}</div>
            <div class="teacher-category">${categoryName}</div>
          </div>
          <div class="teacher-info">
            <div class="teacher-name">${teacher.name}</div>
            <div class="teacher-title">${teacher.title}</div>
            <div class="teacher-tagline">"${teacher.tagline}"</div>
            <div class="teacher-stats">
              <div class="teacher-stat">
                <div class="teacher-stat-value">${teacher.students.toLocaleString()}</div>
                <div class="teacher-stat-label">学员</div>
              </div>
              <div class="teacher-stat">
                <div class="teacher-stat-value">${teacher.courses}</div>
                <div class="teacher-stat-label">课程</div>
              </div>
              <div class="teacher-stat">
                <div class="teacher-stat-value">⭐ ${teacher.rating}</div>
                <div class="teacher-stat-label">评分</div>
              </div>
            </div>
            <div class="teacher-specialties">
              ${teacher.specialties.map(s => `<span class="teacher-tag">${s}</span>`).join('')}
            </div>
            <button class="btn btn-primary btn-sm teacher-btn" onclick="Utils.toast('关注 ${teacher.name} 老师成功~', 'success')">
              + 关注老师
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderGalleryTabs() {
    const container = document.getElementById('gallery-tabs');
    if (!container) return;

    const categories = [
      { key: 'all', label: '全部', icon: '🌟' },
      { key: 'handmade', label: '手工', icon: '🧶' },
      { key: 'painting', label: '绘画', icon: '🎨' },
      { key: 'photography', label: '摄影', icon: '📷' },
      { key: 'cooking', label: '美食', icon: '🍳' },
      { key: 'editing', label: '剪辑', icon: '🎬' }
    ];

    container.innerHTML = categories.map((cat, i) => `
      <div class="gallery-tab ${i === 0 ? 'active' : ''}" data-category="${cat.key}" onclick="App.switchGallery('${cat.key}', this)">
        <span>${cat.icon}</span>
        <span>${cat.label}</span>
      </div>
    `).join('');
  },

  switchGallery(category, tabEl) {
    const tabs = document.querySelectorAll('.gallery-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    this.renderGalleryWorks(category);
  },

  renderGalleryWorks(category) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    let works = Storage.getWorks();
    if (category !== 'all') {
      works = works.filter(w => w.category === category);
    }

    works = works.slice(0, 12);

    if (works.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-muted); grid-column: 1 / -1;">
          <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
          <p>该分类暂无作品，敬请期待~</p>
        </div>
      `;
      return;
    }

    const heights = ['tall', 'normal', 'short', 'normal', 'short', 'tall', 'normal', 'short', 'tall', 'normal', 'short', 'normal'];

    container.innerHTML = works.map((work, i) => {
      const heightClass = heights[i % heights.length];
      const categoryName = Utils.getCategoryName(work.category);
      return `
        <div class="gallery-item gallery-${heightClass} fade-in" style="animation-delay: ${i * 0.05}s;" onclick="Utils.toast('查看作品详情~', 'info')">
          <div class="gallery-image" style="background: ${work.imageColor};">
            <span style="font-size: ${heightClass === 'tall' ? '72' : heightClass === 'short' ? '48' : '60'}px;">${work.imageEmoji}</span>
            <div class="gallery-overlay">
              <div class="gallery-actions">
                <span class="gallery-action">❤️ ${work.likes}</span>
                <span class="gallery-action">💬 ${work.comments.length}</span>
              </div>
            </div>
          </div>
          <div class="gallery-info">
            <div class="gallery-title">${work.title}</div>
            <div class="gallery-author">
              <span class="gallery-avatar">${work.userAvatar}</span>
              <span class="gallery-username">${work.username}</span>
              <span class="gallery-category">${categoryName}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderRankingTabs() {
    const container = document.getElementById('ranking-tabs');
    if (!container) return;

    const tabs = [
      { key: 'difficulty', label: '难度榜', icon: '⚡' },
      { key: 'quantity', label: '数量榜', icon: '📚' },
      { key: 'checkin', label: '签到榜', icon: '📅' }
    ];

    container.innerHTML = tabs.map((tab, i) => `
      <div class="ranking-tab ${i === 0 ? 'active' : ''}" data-type="${tab.key}" onclick="App.switchRanking('${tab.key}', this)">
        <span>${tab.icon}</span>
        <span>${tab.label}</span>
      </div>
    `).join('');
  },

  switchRanking(type, tabEl) {
    const tabs = document.querySelectorAll('.ranking-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
    this.renderRankingList(type);
  },

  renderRankingList(type) {
    const container = document.getElementById('ranking-list');
    if (!container) return;

    const users = MockData.leaderboardUsers;
    const courses = Storage.getCourses();
    const currentUser = Auth.getCurrentUser();

    let rankedUsers = users.map(user => {
      let score = 0;
      let displayValue = '';
      let unit = '';

      switch (type) {
        case 'difficulty':
          score = Utils.calculateUserDifficultyScore(user, courses);
          displayValue = score;
          unit = '难度分';
          break;
        case 'quantity':
          score = user.completedCourses.length;
          displayValue = score;
          unit = '门课程';
          break;
        case 'checkin':
          score = user.signInDays;
          displayValue = score;
          unit = '天';
          break;
      }

      return { ...user, score, displayValue, unit };
    });

    rankedUsers.sort((a, b) => b.score - a.score);

    if (currentUser) {
      const userScore = Utils.calculateUserDifficultyScore(currentUser, courses);
      let myScore = 0;
      let myDisplayValue = '';
      let myUnit = '';

      switch (type) {
        case 'difficulty':
          myScore = userScore;
          myDisplayValue = myScore;
          myUnit = '难度分';
          break;
        case 'quantity':
          myScore = currentUser.completedCourses.length;
          myDisplayValue = myScore;
          myUnit = '门课程';
          break;
        case 'checkin':
          myScore = currentUser.signInDays || 0;
          myDisplayValue = myScore;
          myUnit = '天';
          break;
      }

      const myRank = rankedUsers.filter(u => u.score > myScore).length + 1;
      const myRankingItem = {
        ...currentUser,
        score: myScore,
        displayValue: myDisplayValue,
        unit: myUnit,
        rank: myRank,
        isMe: true
      };

      if (myRank > 10) {
        rankedUsers = rankedUsers.slice(0, 9);
        rankedUsers.push(myRankingItem);
      }
    }

    const topThree = rankedUsers.slice(0, 3);
    const rest = rankedUsers.slice(3, 10);

    container.innerHTML = `
      <div class="ranking-podium">
        ${[topThree[1], topThree[0], topThree[2]].map((user, i) => {
          if (!user) return '<div style="width: 30%;"></div>';
          const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const medalColors = ['silver', 'gold', 'bronze'];
          const medalColor = medalColors[i];
          return `
            <div class="podium-item podium-${rank}">
              <div class="podium-avatar">${user.avatar}</div>
              <div class="podium-name">${user.username}</div>
              <div class="podium-score">${user.displayValue} ${user.unit}</div>
              <div class="podium-medal medal-${medalColor}">
                ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'} 第${rank}名
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="ranking-items">
        ${rest.map((user, i) => {
          const rank = i + 4;
          return `
            <div class="ranking-item ${user.isMe ? 'is-me' : ''}">
              <div class="ranking-rank">${rank}</div>
              <div class="ranking-avatar">${user.avatar}</div>
              <div class="ranking-info">
                <div class="ranking-name">
                  ${user.username}
                  ${user.isMe ? '<span class="badge-me">我</span>' : ''}
                </div>
                <div class="ranking-sub">Lv.${user.level} · 已完成 ${user.completedCourses.length} 门课程</div>
              </div>
              <div class="ranking-value">
                <span class="ranking-score">${user.displayValue}</span>
                <span class="ranking-unit">${user.unit}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderHotWorks() {
    const container = document.getElementById('hot-works');
    if (!container) return;

    const works = Storage.getWorks().sort((a, b) => b.likes - a.likes).slice(0, 8);

    container.innerHTML = works.map((work, i) => {
      return `
        <div class="work-card slide-up stagger-${(i % 6) + 1}" onclick="App.openWorkDetail('${work.id}')">
          <div class="work-cover" style="background: ${work.imageColor};">
            <span style="font-size: 64px;">${work.imageEmoji}</span>
            <div class="work-overlay">
              <div class="work-stats">
                <span>❤️ ${work.likes}</span>
                <span>💬 ${work.comments.length}</span>
              </div>
            </div>
          </div>
          <div class="work-title">${work.title}</div>
          <div class="work-author">${work.username}</div>
        </div>
      `;
    }).join('');
  },

  openWorkDetail(workId) {
    const work = Storage.getWorkById(workId);
    if (!work) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content scale-in">
        <div class="modal-header">
          <div class="modal-title">作品详情</div>
          <div class="modal-close" onclick="this.closest('.modal').remove()">✕</div>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="height: 250px; border-radius: var(--radius-md); background: ${work.imageColor}; display: flex; align-items: center; justify-content: center; font-size: 100px; margin-bottom: 16px;">
            ${work.imageEmoji}
          </div>
          <h3 style="margin-bottom: 8px;">${work.title}</h3>
          <p class="text-muted" style="margin-bottom: 12px;">
            作者：${work.username} · ${Utils.formatDate(work.createdAt)} · ${Utils.getCategoryName(work.category)}
          </p>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">${work.description}</p>
          <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="App.likeWork('${workId}', this)">
              ❤️ <span>${work.likes}</span>
            </button>
            <button class="btn btn-secondary">💬 ${work.comments.length} 评论</button>
          </div>
        </div>
        <div style="border-top: 1px solid var(--border); padding-top: 16px;">
          <h4 style="margin-bottom: 12px;">评论 (${work.comments.length})</h4>
          <div class="comment-list">
            ${work.comments.length === 0 ? '<p class="text-muted" style="text-align: center; padding: 20px;">暂无评论</p>' : 
              work.comments.map(c => `
                <div class="comment-item">
                  <div class="comment-header">
                    <div class="comment-avatar">👤</div>
                    <div>
                      <div class="comment-author">${c.username}</div>
                      <div class="comment-time">${Utils.formatDate(c.time)}</div>
                    </div>
                  </div>
                  <div class="comment-text">${c.text}</div>
                </div>
              `).join('')
            }
          </div>
          <div class="comment-input">
            <input type="text" id="comment-input" placeholder="说点什么吧..." />
            <button class="btn btn-primary" onclick="App.addComment('${workId}')">发送</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  likeWork(workId, btn) {
    if (!Auth.isLoggedIn()) {
      Utils.toast('请先登录', 'warning');
      location.href = 'login.html';
      return;
    }
    
    Storage.likeWork(workId);
    const span = btn.querySelector('span');
    if (span) {
      const current = parseInt(span.textContent);
      span.textContent = current + 1;
    }
    Utils.toast('点赞成功 ❤️', 'success');
  },

  addComment(workId) {
    if (!Auth.isLoggedIn()) {
      Utils.toast('请先登录', 'warning');
      location.href = 'login.html';
      return;
    }
    
    const input = document.getElementById('comment-input');
    const text = input?.value.trim();
    
    if (!text) {
      Utils.toast('请输入评论内容', 'warning');
      return;
    }
    
    const user = Auth.getCurrentUser();
    const comment = {
      userId: user.id,
      username: user.username,
      text,
      time: Date.now()
    };
    
    Storage.addComment(workId, comment);
    Utils.toast('评论成功', 'success');
    
    document.querySelector('.modal')?.remove();
    this.openWorkDetail(workId);
  },

  initCoursePage() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    
    if (!courseId) {
      location.href = 'index.html';
      return;
    }
    
    const course = Storage.getCourseById(courseId);
    if (!course) {
      location.href = 'index.html';
      return;
    }
    
    this.renderCourseDetail(course);
    this.initLevelTabs(course);
    this.initPracticeArea(course);
  },

  renderCourseDetail(course) {
    const container = document.getElementById('course-detail');
    if (!container) return;

    const color = Utils.getCategoryColor(course.category);
    const currentUser = Auth.getCurrentUser();
    const progress = currentUser ? Storage.getCourseProgress(currentUser.id, course.id) : null;

    container.innerHTML = `
      <div class="course-header fade-in">
        <div>
          <div class="course-detail-cover" style="background: ${color.bg};">
            <span>${course.cover}</span>
          </div>
        </div>
        <div class="course-detail-info">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span class="badge ${Utils.getDifficultyClass(course.difficulty)}">
              ${Utils.getDifficultyLabel(course.difficulty)}
            </span>
            <span class="text-muted">${Utils.getCategoryName(course.category)}</span>
          </div>
          <h1>${course.title}</h1>
          <p class="text-secondary" style="margin: 16px 0 24px;">${course.description}</p>
          <div class="course-stats">
            <div class="stat-item">
              <div class="stat-value">${course.learners.toLocaleString()}</div>
              <div class="stat-label">学习人数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${course.chapters.length}</div>
              <div class="stat-label">章节数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${Utils.formatTime(course.duration)}</div>
              <div class="stat-label">预计时长</div>
            </div>
          </div>
          ${progress ? `
            <div style="margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span class="text-muted">学习进度</span>
                <span class="text-muted">${progress.progress}%</span>
              </div>
              <div class="course-progress">
                <div class="course-progress-bar progress-animate" style="width: ${progress.progress}%"></div>
              </div>
            </div>
          ` : ''}
          <button class="btn btn-primary" style="margin-top: 24px; width: 100%;" onclick="App.startLearning('${course.id}')">
            ${progress && progress.progress > 0 ? '继续学习' : '开始学习'} 🚀
          </button>
        </div>
      </div>
      <div class="course-tabs">
        <div class="course-tab active" data-tab="chapters">章节目录</div>
        <div class="course-tab" data-tab="practice">互动练习</div>
      </div>
      <div id="tab-content"></div>
    `;

    const tabs = container.querySelectorAll('.course-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderCourseTab(course, tab.dataset.tab);
      });
    });

    this.renderCourseTab(course, 'chapters');
  },

  renderCourseTab(course, tabName) {
    const container = document.getElementById('tab-content');
    if (!container) return;

    if (tabName === 'chapters') {
      const currentUser = Auth.getCurrentUser();
      const progress = currentUser ? Storage.getCourseProgress(currentUser.id, course.id) : null;
      const completedChapters = progress?.completedChapters || [];

      container.innerHTML = `
        <div class="level-tabs" id="level-tabs">
          <div class="level-tab active" data-level="all">全部</div>
          <div class="level-tab" data-level="1">初级</div>
          <div class="level-tab" data-level="2">中级</div>
          <div class="level-tab" data-level="3">高级</div>
        </div>
        <div class="chapter-list" id="chapter-list">
          ${course.chapters.map((chapter, i) => {
            const isCompleted = completedChapters.includes(i);
            return `
              <div class="chapter-item ${isCompleted ? 'completed' : ''}" data-chapter="${i}" data-level="${chapter.level}">
                <div class="chapter-header">
                  <div class="chapter-title">
                    <div class="chapter-number">${isCompleted ? '✓' : i + 1}</div>
                    <span>${chapter.title}</span>
                  </div>
                  <span class="text-muted">第 ${chapter.level} 级 · ${chapter.steps.length} 个步骤</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      const levelTabs = container.querySelectorAll('.level-tab');
      levelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          levelTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.filterChapters(course, tab.dataset.level, completedChapters);
        });
      });

      const chapterItems = container.querySelectorAll('.chapter-item');
      chapterItems.forEach(item => {
        item.addEventListener('click', () => {
          const chapterIndex = parseInt(item.dataset.chapter);
          this.startChapter(course, chapterIndex);
        });
      });
    } else if (tabName === 'practice') {
      this.renderPracticeTab(course);
    }
  },

  filterChapters(course, level, completedChapters) {
    const items = document.querySelectorAll('.chapter-item');
    items.forEach(item => {
      if (level === 'all' || item.dataset.level === level) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  },

  startLearning(courseId) {
    if (!Auth.isLoggedIn()) {
      Utils.toast('请先登录再学习', 'warning');
      location.href = 'login.html';
      return;
    }
    
    const course = Storage.getCourseById(courseId);
    const currentUser = Auth.getCurrentUser();
    const progress = Storage.getCourseProgress(currentUser.id, courseId);
    
    const startChapter = progress.currentChapter || 0;
    this.startChapter(course, startChapter);
  },

  startChapter(course, chapterIndex) {
    if (!Auth.isLoggedIn()) {
      Utils.toast('请先登录再学习', 'warning');
      location.href = 'login.html';
      return;
    }

    const chapter = course.chapters[chapterIndex];
    if (!chapter) return;

    const tabs = document.querySelectorAll('.course-tab');
    tabs.forEach(t => {
      t.classList.remove('active');
      if (t.dataset.tab === 'practice') t.classList.add('active');
    });

    this.currentCourse = course;
    this.currentChapter = chapterIndex;
    this.currentStep = 0;
    this.renderPracticeTab(course, chapterIndex);
  },

  initLevelTabs(course) {},

  initPracticeArea(course) {},

  renderPracticeTab(course, chapterIndex = 0) {
    const container = document.getElementById('tab-content');
    if (!container) return;

    this.currentCourse = course;
    this.currentChapter = chapterIndex;
    this.currentStep = 0;

    const chapter = course.chapters[chapterIndex];
    
    container.innerHTML = `
      <div class="practice-area fade-in">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin-bottom: 8px;">${chapter.title}</h2>
          <p class="text-muted">${chapter.content}</p>
        </div>
        <div class="step-indicator" id="step-indicator">
          ${chapter.steps.map((s, i) => `
            <div class="step-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>
          `).join('')}
        </div>
        <div id="practice-content" style="min-height: 300px;">
          ${this.renderStepContent(chapter, 0)}
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 24px;">
          <button class="btn btn-ghost" id="prev-btn" onclick="App.prevStep()" disabled style="visibility: hidden;">
            ← 上一步
          </button>
          <button class="btn btn-primary" id="next-btn" onclick="App.nextStep()">
            ${chapter.steps.length > 1 ? '下一步 →' : '完成学习 ✓'}
          </button>
        </div>
      </div>
    `;
  },

  renderStepContent(chapter, stepIndex) {
    const step = chapter.steps[stepIndex];
    const practice = chapter.practice;

    return `
      <div class="fade-in" style="text-align: center;">
        <h3 style="margin-bottom: 16px; font-size: 20px;">
          步骤 ${stepIndex + 1}：${step.title}
        </h3>
        <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 16px;">${step.desc}</p>
        
        ${practice?.type === 'drawing' ? `
          <div style="background: white; border-radius: var(--radius-md); padding: 20px; border: 2px dashed var(--border);">
            <canvas id="practice-canvas" width="600" height="300" style="width: 100%; max-width: 600px; height: 300px; background: #fafafa; border-radius: var(--radius-sm); cursor: crosshair;"></canvas>
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 16px; flex-wrap: wrap;">
              <button class="tool-btn active" onclick="App.setCanvasColor(this, '#333333')">✏️</button>
              <button class="tool-btn" onclick="App.setCanvasColor(this, '#FF8C42')">🟠</button>
              <button class="tool-btn" onclick="App.setCanvasColor(this, '#4ECDC4')">🟢</button>
              <button class="tool-btn" onclick="App.setCanvasColor(this, '#9B89B3')">🟣</button>
              <button class="tool-btn" onclick="App.clearCanvas()">🗑️</button>
            </div>
          </div>
        ` : practice?.type === 'quiz' ? `
          <div style="background: var(--bg); border-radius: var(--radius-md); padding: 32px; max-width: 500px; margin: 0 auto;">
            <div style="font-size: 48px; margin-bottom: 16px;">❓</div>
            <p style="font-weight: 600; margin-bottom: 20px;">小测验：以下哪种是本节课学习的内容？</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${['选项A：这是正确答案', '选项B：这是错误答案', '选项C：这也是错误答案'].map((opt, i) => `
                <button class="btn btn-ghost" style="justify-content: flex-start; width: 100%;" onclick="App.checkAnswer(this, ${i === 0})">
                  ${opt}
                </button>
              `).join('')}
            </div>
          </div>
        ` : practice?.type === 'stepbystep' ? `
          <div style="background: var(--bg); border-radius: var(--radius-md); padding: 32px;">
            <div style="font-size: 64px; margin-bottom: 16px;">📝</div>
            <p style="color: var(--text-secondary);">按照教程指导完成本步骤的练习</p>
            <p style="color: var(--text-muted); font-size: 14px; margin-top: 12px;">
              提示：可以准备好所需材料，跟着步骤一起动手操作
            </p>
          </div>
        ` : `
          <div style="background: var(--bg); border-radius: var(--radius-md); padding: 40px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 16px;">📖</div>
            <p style="color: var(--text-secondary);">仔细阅读并理解本步骤内容</p>
          </div>
        `}
      </div>
    `;
  },

  setCanvasColor(btn, color) {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.canvasColor = color;
  },

  clearCanvas() {
    const canvas = document.getElementById('practice-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },

  checkAnswer(btn, isCorrect) {
    const buttons = btn.parentElement.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    
    if (isCorrect) {
      btn.style.background = 'var(--secondary)';
      btn.style.color = 'white';
      btn.style.borderColor = 'var(--secondary)';
      Utils.toast('回答正确！🎉', 'success');
    } else {
      btn.style.background = '#FF6B6B';
      btn.style.color = 'white';
      buttons[0].style.background = 'var(--secondary)';
      buttons[0].style.color = 'white';
      Utils.toast('回答错误，正确答案是A哦', 'warning');
    }
  },

  nextStep() {
    if (!this.currentCourse || this.currentChapter === undefined) return;

    const chapter = this.currentCourse.chapters[this.currentChapter];
    const totalSteps = chapter.steps.length;

    if (this.currentStep < totalSteps - 1) {
      this.currentStep++;
      this.updateStepUI(chapter);
    } else {
      this.completeChapter();
    }
  },

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      const chapter = this.currentCourse.chapters[this.currentChapter];
      this.updateStepUI(chapter);
    }
  },

  updateStepUI(chapter) {
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i < this.currentStep) dot.classList.add('completed');
      if (i === this.currentStep) dot.classList.add('active');
    });

    const content = document.getElementById('practice-content');
    if (content) {
      content.innerHTML = this.renderStepContent(chapter, this.currentStep);
    }

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) {
      prevBtn.style.visibility = this.currentStep > 0 ? 'visible' : 'hidden';
    }
    if (nextBtn) {
      nextBtn.textContent = this.currentStep === chapter.steps.length - 1 ? '完成学习 ✓' : '下一步 →';
    }
  },

  completeChapter() {
    if (!Auth.isLoggedIn() || !this.currentCourse) return;

    const currentUser = Auth.getCurrentUser();
    const courseId = this.currentCourse.id;
    const chapterIndex = this.currentChapter;
    const totalChapters = this.currentCourse.chapters.length;

    const progress = Storage.completeChapter(currentUser.id, courseId, chapterIndex);
    
    Auth.addExp(10);
    Auth.addLearnTime(Math.round(this.currentCourse.duration / totalChapters));

    if (progress.progress === 100) {
      Auth.completeCourse(courseId);
      Utils.celebrate();
      Utils.toast('🎉 恭喜完成全部课程！获得50经验值', 'success');
    } else {
      Utils.toast(`完成本章学习！+10经验`, 'success');
    }

    setTimeout(() => {
      this.renderCourseDetail(this.currentCourse);
    }, 1000);
  },

  initCreatePage() {
    if (!Auth.isLoggedIn()) {
      Utils.toast('请先登录再创作', 'warning');
      setTimeout(() => {
        location.href = 'login.html';
      }, 1500);
      return;
    }

    this.initDrawingCanvas();
    this.initCreateForm();
  },

  initDrawingCanvas() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;
    
    this.currentColor = '#333333';
    this.currentSize = 5;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 500;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e) => {
      drawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      e.preventDefault();
    };

    const draw = (e) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = this.currentColor;
      ctx.lineWidth = this.currentSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      e.preventDefault();
    };

    const endDraw = () => {
      drawing = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', endDraw);

    this.drawingCanvas = canvas;
  },

  setDrawColor(btn, color) {
    document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.currentColor = color;
  },

  setDrawSize(size) {
    this.currentSize = parseInt(size);
    document.getElementById('size-value').textContent = size + 'px';
  },

  clearDrawing() {
    if (!this.drawingCanvas) return;
    const ctx = this.drawingCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
  },

  initCreateForm() {
    const form = document.getElementById('publish-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.publishWork();
    });
  },

  publishWork() {
    const title = document.getElementById('work-title').value.trim();
    const description = document.getElementById('work-desc').value.trim();
    const category = document.getElementById('work-category').value;

    if (!title) {
      Utils.toast('请输入作品标题', 'warning');
      return;
    }

    if (!this.drawingCanvas) return;

    const imageData = this.drawingCanvas.toDataURL('image/png');
    const user = Auth.getCurrentUser();

    const colors = {
      handmade: '#FFE0D0',
      painting: '#D0F0EE',
      photo: '#E0D4EF',
      food: '#FFE4D0',
      video: '#D4E8FF'
    };
    const emojis = {
      handmade: '🧶',
      painting: '🎨',
      photo: '📷',
      food: '🍳',
      video: '🎬'
    };

    const work = {
      id: Utils.generateId(),
      userId: user.id,
      username: user.username,
      title,
      description,
      category,
      image: imageData,
      imageColor: colors[category] || '#F0F0F0',
      imageEmoji: emojis[category] || '✨',
      likes: 0,
      comments: [],
      createdAt: Date.now()
    };

    Storage.addWork(work);
    Auth.addWork(work.id);
    Auth.addExp(20);
    
    Utils.celebrate();
    Utils.toast('作品发布成功！+20经验', 'success');

    setTimeout(() => {
      location.href = 'community.html';
    }, 1500);
  },

  initProfilePage() {
    if (!Auth.isLoggedIn()) {
      Utils.toast('请先登录', 'warning');
      setTimeout(() => {
        location.href = 'login.html';
      }, 1500);
      return;
    }

    this.renderProfileHeader();
    this.renderStats();
    this.initSectionTabs();
    this.renderProgressSection();
  },

  renderProfileHeader() {
    const container = document.getElementById('profile-header');
    if (!container) return;

    const user = Auth.getCurrentUser();
    const level = Utils.levelFromExp(user.exp);
    const expProgress = Utils.expProgress(user.exp);

    container.innerHTML = `
      <div class="profile-avatar bounce">${user.avatar}</div>
      <div class="profile-info">
        <h2>${user.username}</h2>
        <p class="text-muted">兴趣：${user.interests.map(i => Utils.getCategoryName(i)).join('、') || '还没有选择'}</p>
        <div class="level-info">
          <span class="level-badge">Lv.${level}</span>
          <div class="exp-bar">
            <div class="exp-fill progress-animate" style="width: ${expProgress}%"></div>
          </div>
          <span class="text-muted" style="font-size: 13px;">${user.exp} EXP</span>
        </div>
      </div>
      <div style="margin-left: auto;">
        <button class="btn btn-ghost" onclick="Auth.logout(); location.href='index.html'">退出登录</button>
      </div>
    `;
  },

  renderStats() {
    const container = document.getElementById('stats-grid');
    if (!container) return;

    const user = Auth.getCurrentUser();
    const works = Storage.getWorksByUser(user.id);
    const totalLikes = works.reduce((sum, w) => sum + w.likes, 0);
    const level = Utils.levelFromExp(user.exp);

    const stats = [
      { icon: '⏱️', number: Utils.formatTime(user.totalLearnTime), desc: '累计学习' },
      { icon: '📚', number: user.completedCourses.length, desc: '完成课程' },
      { icon: '🎨', number: works.length, desc: '发布作品' },
      { icon: '❤️', number: totalLikes, desc: '获得点赞' }
    ];

    container.innerHTML = stats.map((stat, i) => `
      <div class="stat-card slide-up stagger-${i + 1}">
        <div class="stat-icon">${stat.icon}</div>
        <div class="stat-number">${stat.number}</div>
        <div class="stat-desc">${stat.desc}</div>
      </div>
    `).join('');
  },

  initSectionTabs() {
    const tabs = document.querySelectorAll('.section-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderSection(tab.dataset.section);
      });
    });
  },

  renderSection(section) {
    const sections = ['progress', 'badges', 'works'];
    sections.forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.style.display = s === section ? 'block' : 'none';
    });

    if (section === 'badges') {
      this.renderBadges();
    } else if (section === 'works') {
      this.renderMyWorks();
    }
  },

  renderProgressSection() {
    const container = document.getElementById('section-progress');
    if (!container) return;

    const user = Auth.getCurrentUser();
    const userProgress = Storage.getUserProgress(user.id);
    const inProgressCourses = [];
    const completedCourses = [];

    for (const [courseId, progress] of Object.entries(userProgress)) {
      const course = Storage.getCourseById(courseId);
      if (!course) continue;
      
      const courseData = { ...course, userProgress: progress };
      if (progress.progress === 100) {
        completedCourses.push(courseData);
      } else {
        inProgressCourses.push(courseData);
      }
    }

    inProgressCourses.sort((a, b) => 
      new Date(b.userProgress.lastLearnTime) - new Date(a.userProgress.lastLearnTime)
    );

    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">📖 正在学习 (${inProgressCourses.length})</h3>
      ${inProgressCourses.length === 0 ? 
        '<p class="text-muted" style="text-align: center; padding: 40px;">还没有开始学习的课程，<a href="index.html" style="color: var(--primary);">去发现感兴趣的课程吧</a></p>' :
        inProgressCourses.map(course => {
          const color = Utils.getCategoryColor(course.category);
          return `
            <div class="course-progress-item" onclick="location.href='course.html?id=${course.id}'">
              <div class="course-progress-icon" style="background: ${color.bg};">
                ${course.cover}
              </div>
              <div class="course-progress-info">
                <div class="course-progress-title">${course.title}</div>
                <div class="text-muted" style="font-size: 13px;">
                  ${Utils.getDifficultyLabel(course.difficulty)} · ${Utils.formatTime(course.duration)}
                </div>
                <div class="progress-bar-sm">
                  <div class="progress-bar-sm-fill progress-animate" style="width: ${course.userProgress.progress}%"></div>
                </div>
              </div>
              <div class="course-progress-percent">${course.userProgress.progress}%</div>
            </div>
          `;
        }).join('')
      }
      
      <h3 style="margin: 32px 0 16px;">✅ 已完成 (${completedCourses.length})</h3>
      ${completedCourses.length === 0 ?
        '<p class="text-muted" style="text-align: center; padding: 20px;">暂无完成的课程</p>' :
        completedCourses.map(course => {
          const color = Utils.getCategoryColor(course.category);
          return `
            <div class="course-progress-item" onclick="location.href='course.html?id=${course.id}'">
              <div class="course-progress-icon" style="background: ${color.bg};">
                ${course.cover}
              </div>
              <div class="course-progress-info">
                <div class="course-progress-title">${course.title}</div>
                <div class="text-muted" style="font-size: 13px;">
                  ${Utils.getDifficultyLabel(course.difficulty)} · 已完成 ✓
                </div>
              </div>
              <div style="color: var(--secondary); font-weight: 700;">✓ 已完成</div>
            </div>
          `;
        }).join('')
      }
    `;
  },

  renderBadges() {
    const container = document.getElementById('section-badges');
    if (!container) return;

    const user = Auth.getCurrentUser();
    const allBadges = Storage.getBadges();

    container.innerHTML = `
      <div class="badge-grid">
        ${allBadges.map((badge, i) => {
          const earned = user.badges.includes(badge.id);
          return `
            <div class="badge-item ${earned ? '' : 'locked'} slide-up stagger-${(i % 6) + 1}" title="${badge.desc}">
              <div class="badge-icon">${badge.icon}</div>
              <div class="badge-name">${badge.name}</div>
              <div class="text-muted" style="font-size: 11px; margin-top: 4px;">${badge.condition}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderMyWorks() {
    const container = document.getElementById('section-works');
    if (!container) return;

    const user = Auth.getCurrentUser();
    const works = Storage.getWorksByUser(user.id);

    container.innerHTML = `
      ${works.length === 0 ?
        '<p class="text-muted" style="text-align: center; padding: 40px;">还没有发布作品，<a href="create.html" style="color: var(--primary);">去创作第一个作品吧</a></p>' :
        `<div class="work-grid">
          ${works.map(work => `
            <div class="work-card" onclick="App.openWorkDetail('${work.id}')">
              <div class="work-cover" style="background: ${work.imageColor};">
                ${work.image ? 
                  `<img src="${work.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);" />` :
                  `<span style="font-size: 64px;">${work.imageEmoji}</span>`
                }
                <div class="work-overlay">
                  <div class="work-stats">
                    <span>❤️ ${work.likes}</span>
                    <span>💬 ${work.comments.length}</span>
                  </div>
                </div>
              </div>
              <div class="work-title">${work.title}</div>
              <div class="work-author">${Utils.formatDate(work.createdAt)}</div>
            </div>
          `).join('')}
        </div>`
      }
    `;
  },

  initCommunityPage() {
    this.renderWorks('all');
    this.initFilters();
  },

  initFilters() {
    const tags = document.querySelectorAll('.filter-tag');
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        tags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.renderWorks(tag.dataset.category);
      });
    });

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const activeTag = document.querySelector('.filter-tag.active');
        this.renderWorks(activeTag?.dataset.category || 'all', sortSelect.value);
      });
    }
  },

  renderWorks(category = 'all', sort = 'latest') {
    const container = document.getElementById('community-works');
    if (!container) return;

    let works = Storage.getWorksByCategory(category);

    if (sort === 'hot') {
      works.sort((a, b) => b.likes - a.likes);
    } else {
      works.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    container.innerHTML = `
      <div class="masonry-grid">
        ${works.map((work, i) => `
          <div class="masonry-item slide-up stagger-${(i % 6) + 1}">
            <div class="work-card" onclick="App.openWorkDetail('${work.id}')">
              <div class="work-cover" style="background: ${work.imageColor}; aspect-ratio: ${1 + Math.random() * 0.5};">
                ${work.image ? 
                  `<img src="${work.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);" />` :
                  `<span style="font-size: ${48 + Math.random() * 32}px;">${work.imageEmoji}</span>`
                }
                <div class="work-overlay">
                  <div class="work-stats">
                    <span>❤️ ${work.likes}</span>
                    <span>💬 ${work.comments.length}</span>
                  </div>
                </div>
              </div>
              <div class="work-title">${work.title}</div>
              <div class="work-author">${work.username} · ${Utils.formatDate(work.createdAt)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  initLoginPage() {
    this.initLoginTabs();
    this.initLoginForm();
    this.initRegisterForm();
  },

  initLoginTabs() {
    const tabs = document.querySelectorAll('.login-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const form = tab.dataset.form;
        document.getElementById('login-form').style.display = form === 'login' ? 'block' : 'none';
        document.getElementById('register-form').style.display = form === 'register' ? 'block' : 'none';
      });
    });
  },

  initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;

      const result = Auth.login(username, password);
      if (result.success) {
        Utils.toast(result.message, 'success');
        setTimeout(() => {
          location.href = 'index.html';
        }, 1000);
      } else {
        Utils.toast(result.message, 'error');
      }
    });
  },

  initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    this.selectedInterests = [];

    const interestOptions = document.querySelectorAll('.interest-option');
    interestOptions.forEach(option => {
      option.addEventListener('click', () => {
        const category = option.dataset.category;
        if (this.selectedInterests.includes(category)) {
          this.selectedInterests = this.selectedInterests.filter(i => i !== category);
          option.classList.remove('selected');
        } else {
          this.selectedInterests.push(category);
          option.classList.add('selected');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm').value;

      if (password !== confirmPassword) {
        Utils.toast('两次密码输入不一致', 'error');
        return;
      }

      const result = Auth.register(username, password, this.selectedInterests);
      if (result.success) {
        Utils.celebrate();
        Utils.toast('注册成功！欢迎加入趣享 🎉', 'success');
        setTimeout(() => {
          location.href = 'index.html';
        }, 1500);
      } else {
        Utils.toast(result.message, 'error');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
