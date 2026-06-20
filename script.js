// ============================================================
// TRAE AI 创造力大赛 · 灵感 Demo Hall
// 前端交互：粒子动画、无限滚动、筛选、搜索、排序
// ============================================================

/* ---------- Configuration ---------- */
const BATCH_SIZE = 50;
const PRELOAD_THRESHOLD = 500; // px from bottom to trigger next batch
const MAX_DOM_CARDS = 200;
const BUFFER_CARDS = 150;

/* ---------- Data Access ---------- */
const allDemos = window.DEMOS_DATA || [];

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
const TAG_IMG_MAP = {
  '生活娱乐': 'life-default.png',
  '学习工作': 'study-default.png',
  '社会服务': 'common-env-default.png',
  '硬件交互': 'hardware-default.png',
  '社会公益': 'special-default.png'
};

function createCardHTML(demo) {
  const tag = demo.tags && demo.tags[0] ? demo.tags[0] : '';
  const tagImg = TAG_IMG_MAP[tag] || '';
  const approvedBadge = demo.approved
    ? '<span class="approved-badge" title="官方审核通过">&#10003;</span>'
    : '';

  let demoBtn = '';
  if (demo.has_demo) {
    if (demo.demo_url) {
      demoBtn = `<a href="${demo.demo_url}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 查看 Demo</a>`;
    } else if (demo.external_url) {
      demoBtn = `<a href="${demo.external_url}" target="_blank" class="btn btn-primary btn-sm"><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 查看 Demo</a>`;
    }
  } else {
    demoBtn = '<button class="btn btn-primary btn-sm disabled" disabled><img src="assets/icons/play.svg" class="btn-icon" alt="" loading="lazy"> 暂无 Demo</button>';
  }

  const forumUrl = `https://forum.trae.cn/t/topic/${demo.topic_id}`;

  return `<div class="card"
    data-tags="${(demo.tags || []).join(',')}"
    data-title="${demo.title}"
    data-excerpt="${demo.excerpt || ''}"
    data-created="${demo.created_at}"
    data-views="${demo.views}"
    data-likes="${demo.like_count}"
    data-approved="${demo.approved ? 'true' : 'false'}">
    <div class="card-tag-row">
      ${tagImg ? `<img src="assets/tracks/${tagImg}" alt="${tag}" class="card-tag-img" loading="lazy">` : ''}
      <span class="card-tag-text">${tag}</span>
      ${approvedBadge}
    </div>
    <h3 class="card-title">${demo.title}</h3>
    <p class="card-excerpt">${demo.excerpt || '暂无描述'}</p>
    <div class="card-meta">
      <span class="meta-item"><img src="assets/icons/eye.svg" class="meta-icon" alt="views" loading="lazy"> ${demo.views}</span>
      <span class="meta-item"><img src="assets/icons/heart.svg" class="meta-icon" alt="likes" loading="lazy"> ${demo.like_count}</span>
      <span class="meta-item"><img src="assets/icons/user.svg" class="meta-icon" alt="author" loading="lazy"> ${demo.author}</span>
    </div>
    <div class="card-actions">
      ${demoBtn}
      <a href="${forumUrl}" target="_blank" class="btn btn-secondary btn-sm"><img src="assets/icons/external.svg" class="btn-icon" alt="" loading="lazy"> 社区帖子</a>
    </div>
  </div>`;
}

/* ---------- Infinite Scroll Engine ---------- */
(function initInfiniteScroll() {
  const grid = document.getElementById('cards-grid');
  const loadingEl = document.getElementById('loading');
  const noResultsEl = document.getElementById('no-results');
  if (!grid) return;

  let filteredDemos = [...allDemos];
  let renderedCount = 0;
  let isLoading = false;
  let scrollObserver = null;
  let revealObserver = null;

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

  function setupScrollTrigger() {
    if (scrollObserver) scrollObserver.disconnect();

    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    grid.appendChild(sentinel);

    scrollObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && renderedCount < filteredDemos.length) {
        isLoading = true;
        if (loadingEl) loadingEl.style.display = 'flex';

        requestAnimationFrame(() => {
          renderBatch(BATCH_SIZE);
          isLoading = false;
          if (loadingEl) loadingEl.style.display = 'none';
        });
      }
    }, { rootMargin: `${PRELOAD_THRESHOLD}px` });

    scrollObserver.observe(sentinel);
  }

  function resetAndRender() {
    grid.innerHTML = '';
    renderedCount = 0;

    if (filteredDemos.length === 0) {
      if (noResultsEl) noResultsEl.style.display = 'block';
      if (loadingEl) loadingEl.style.display = 'none';
      return;
    }

    if (noResultsEl) noResultsEl.style.display = 'none';

    setupRevealObserver();
    renderBatch(BATCH_SIZE);
    setupScrollTrigger();
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
