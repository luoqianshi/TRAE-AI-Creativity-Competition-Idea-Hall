// ============================================================
// TRAE AI 创造力大赛 · 灵感 Demo Hall
// 前端交互：粒子动画、卡片网格、筛选、搜索、排序
// ============================================================

/* ---------- Configuration ---------- */
const BATCH_SIZE = 50;
const MAX_DOM_CARDS = 200;
const BUFFER_CARDS = 150;

/* ---------- Data Access ---------- */
const allDemos = window.DEMOS_DATA || [];

// --- Bad case cleanup ---
// 1. Remove deleted topics
const DELETED_RE = /话题已被作者删除/;
for (let i = allDemos.length - 1; i >= 0; i--) {
  if (DELETED_RE.test(allDemos[i].title) || DELETED_RE.test(allDemos[i].excerpt)) {
    allDemos.splice(i, 1);
  }
}
// 2. Assign fallback tag for cards without category
allDemos.forEach(d => {
  if (!d.tags || d.tags.length === 0) {
    d.tags = ['野蛮生长'];
  }
});

/* ---------- Particle Canvas Background ---------- */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  const particles = [];
  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 120;
  const MOUSE_DIST = 150;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 1.5 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  let mouseX = -1000, mouseY = -1000;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, i) => {
      p.update();
      p.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < MOUSE_DIST) {
        const opacity = (1 - mDist / MOUSE_DIST) * 0.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });

    requestAnimationFrame(animate);
  }

  // Delay particle animation start to avoid competing with initial render
  setTimeout(() => animate(), 500);
})();

/* ---------- Navbar Scroll Effect ---------- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
})();

/* ---------- Card Factory ---------- */
const TAG_SVG_MAP = {
  '野蛮生长': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2-.4-3.5.4-4.8 1.8"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4"/><path d="M18 2h-3v3"/><path d="M18 5l-3-3"/></svg>',
  '生活娱乐': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  '学习工作': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="m9 9 2 2 4-4"/></svg>',
  '社会服务': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  '硬件交互': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
  '社会公益': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
};

/* --- HTML Sanitization Utilities --- */
function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHTML(str) {
  return String(str || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&\w+;/gi, '')
    .replace(/\s{3,}/g, ' ')
    .trim();
}

function createCardHTML(demo) {
  const tag = demo.tags && demo.tags[0] ? demo.tags[0] : '';
  const tagSvg = TAG_SVG_MAP[tag] || '';
  const approvedBadge = demo.approved
    ? '<span class="approved-badge" title="官方审核通过">&#10003;</span>'
    : '';

  const safeTitle = stripHTML(demo.title);
  // Prefer insight (one-sentence summary), fallback to excerpt
  const insightText = (demo.insight || '').trim();
  const safeExcerpt = insightText || stripHTML(demo.excerpt);

  let demoBtn = '';
  if (demo.has_demo) {
    if (demo.demo_url) {
      demoBtn = `<a href="${escapeAttr(demo.demo_url)}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 查看 Demo</a>`;
    } else if (demo.external_url) {
      demoBtn = `<a href="${escapeAttr(demo.external_url)}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 查看 Demo</a>`;
    }
  } else {
    demoBtn = '<button class="btn btn-primary btn-sm disabled" disabled><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 暂无 Demo</button>';
  }

  const forumUrl = `https://forum.trae.cn/t/topic/${demo.topic_id}`;

  return `<div class="card"
    data-tags="${escapeAttr((demo.tags || []).join(','))}"
    data-title="${escapeAttr(safeTitle)}"
    data-excerpt="${escapeAttr(safeExcerpt)}"
    data-created="${escapeAttr(demo.created_at)}"
    data-views="${demo.views || 0}"
    data-likes="${demo.like_count || 0}"
    data-approved="${demo.approved ? 'true' : 'false'}">
    <div class="card-tag-row">
      ${tagSvg ? `<span class="card-tag-icon" title="${escapeAttr(tag)}">${tagSvg}</span>` : ''}
      <span class="card-tag-text">${escapeAttr(tag)}</span>
      ${approvedBadge}
    </div>
    <h3 class="card-title">${escapeAttr(safeTitle)}</h3>
    <p class="card-excerpt">${safeExcerpt ? escapeAttr(safeExcerpt) : '<span class="no-desc">暂无描述</span>'}</p>
    <div class="card-meta">
      <span class="meta-item"><img src="assets/icons/eye.svg" class="meta-icon" alt="views" loading="lazy"> ${demo.views || 0}</span>
      <span class="meta-item"><img src="assets/icons/heart.svg" class="meta-icon" alt="likes" loading="lazy"> ${demo.like_count || 0}</span>
      <span class="meta-item"><img src="assets/icons/user.svg" class="meta-icon" alt="author" loading="lazy"> ${escapeAttr(demo.author)}</span>
    </div>
    <div class="card-actions">
      ${demoBtn}
      <a href="${forumUrl}" target="_blank" class="btn btn-secondary btn-sm"><img src="assets/icons/external.svg" class="btn-icon" alt="" loading="lazy"> 社区帖子</a>
    </div>
  </div>`;
}

/* ---------- Card Grid Engine ---------- */
(function initCardGrid() {
  const grid = document.getElementById('cards-grid');
  const loadingEl = document.getElementById('loading');
  const noResultsEl = document.getElementById('no-results');
  if (!grid) return;

  let filteredDemos = [...allDemos];
  let renderedCount = 0;
  let isLoading = false;
  let revealObserver = null;
  let loadMoreBtn = null;

  /* --- "Load More" Button --- */
  function createLoadMoreButton() {
    if (loadMoreBtn) loadMoreBtn.remove();
    loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.addEventListener('click', () => loadMore());
    updateLoadMoreButton();
    grid.parentElement.appendChild(loadMoreBtn);
  }

  function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    if (isLoading) {
      loadMoreBtn.className = 'load-more-btn loading';
      loadMoreBtn.innerHTML = '<span class="load-more-spinner"></span> 加载中...';
      loadMoreBtn.disabled = true;
    } else if (renderedCount >= filteredDemos.length) {
      loadMoreBtn.className = 'load-more-btn done';
      loadMoreBtn.textContent = `已展示全部 ${filteredDemos.length} 个作品`;
      loadMoreBtn.disabled = true;
    } else {
      loadMoreBtn.className = 'load-more-btn';
      loadMoreBtn.textContent = `加载更多（已加载 ${renderedCount} / ${filteredDemos.length}）`;
      loadMoreBtn.disabled = false;
    }
  }

  function setupRevealObserver() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 30);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  }

  function renderBatch(count) {
    const end = Math.min(renderedCount + count, filteredDemos.length);
    const batch = filteredDemos.slice(renderedCount, end);

    const fragment = document.createDocumentFragment();
    batch.forEach(demo => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = createCardHTML(demo);
      const card = wrapper.firstElementChild;
      fragment.appendChild(card);
      if (revealObserver) revealObserver.observe(card);
    });

    grid.appendChild(fragment);
    renderedCount = end;

    // DOM recycling: remove top batches if too many cards
    const cards = grid.querySelectorAll('.card');
    if (cards.length > MAX_DOM_CARDS) {
      const toRemove = cards.length - BUFFER_CARDS;
      for (let i = 0; i < toRemove; i++) {
        if (revealObserver) revealObserver.unobserve(cards[i]);
        cards[i].remove();
      }
    }
  }

  function loadMore() {
    if (isLoading || renderedCount >= filteredDemos.length) return;
    isLoading = true;
    if (loadingEl) loadingEl.style.display = 'flex';
    updateLoadMoreButton();

    requestAnimationFrame(() => {
      renderBatch(BATCH_SIZE);
      isLoading = false;
      if (loadingEl) loadingEl.style.display = 'none';
      updateLoadMoreButton();
    });
  }

  function resetAndRender() {
    grid.innerHTML = '';
    renderedCount = 0;

    if (filteredDemos.length === 0) {
      if (noResultsEl) noResultsEl.style.display = 'block';
      if (loadingEl) loadingEl.style.display = 'none';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    if (noResultsEl) noResultsEl.style.display = 'none';

    setupRevealObserver();
    renderBatch(BATCH_SIZE);
    createLoadMoreButton();
  }

  // Expose reset function for filters
  window.resetInfiniteScroll = resetAndRender;
  window.setFilteredDemos = (demos) => {
    filteredDemos = demos;
    resetAndRender();
  };

  // Initial render
  resetAndRender();
})();

/* ---------- Banner Close Button ---------- */
(function initBannerClose() {
  const closeBtn = document.getElementById('banner-close');
  const banner = document.getElementById('contest-banner');
  if (!closeBtn || !banner) return;

  closeBtn.addEventListener('click', () => {
    banner.style.display = 'none';
  });
})();

/* ---------- Filter, Search, Sort (Data Layer) ---------- */
(function initFilters() {
  const tagPills = document.querySelectorAll('.tag-pill');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const approvedOnlyCheckbox = document.getElementById('approved-only');

  let activeTag = 'all';
  let searchQuery = '';
  let sortBy = 'newest';
  let approvedOnly = true;

  function getFilteredSorted() {
    let result = [...allDemos];

    // Approval filter
    if (approvedOnly) {
      result = result.filter(d => d.approved);
    }

    // Tag filter
    if (activeTag !== 'all') {
      result = result.filter(d => d.tags && d.tags.includes(activeTag));
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.excerpt || '').toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
      case 'views':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'likes':
        result.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        break;
    }

    return result;
  }

  function applyFilters() {
    const filtered = getFilteredSorted();
    if (window.setFilteredDemos) {
      window.setFilteredDemos(filtered);
    }
  }

  // Tag click
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tagPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeTag = pill.dataset.tag;
      applyFilters();
    });
  });

  // Search input
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
      }, 300);
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      applyFilters();
    });
  }

  // Approval toggle
  if (approvedOnlyCheckbox) {
    approvedOnlyCheckbox.addEventListener('change', (e) => {
      approvedOnly = e.target.checked;
      applyFilters();
    });
  }
})();
