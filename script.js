// ============================================================
// TRAE AI 创造力大赛 · 灵感 Demo Hall
// 前端交互：粒子动画、筛选、搜索、排序、滚动入场
// ============================================================

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

      // Connect nearby particles
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

      // Mouse interaction
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
  animate();
})();

/* ---------- Navbar Scroll Effect ---------- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
})();

/* ---------- Card Scroll Animation ---------- */
(function initScrollReveal() {
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 50);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
})();

/* ---------- Filter, Search, Sort ---------- */
(function initFilters() {
  const cards = Array.from(document.querySelectorAll('.card'));
  const tagPills = document.querySelectorAll('.tag-pill');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const approvedOnlyCheckbox = document.getElementById('approved-only');

  let activeTag = 'all';
  let searchQuery = '';
  let sortBy = 'newest';
  let approvedOnly = true;

  function filterAndSort() {
    let visible = cards.filter(card => {
      // Approval filter
      if (approvedOnly) {
        if (card.dataset.approved !== 'true') return false;
      }
      // Tag filter
      if (activeTag !== 'all') {
        const cardTags = (card.dataset.tags || '').split(',').map(t => t.trim());
        if (!cardTags.includes(activeTag)) return false;
      }
      // Search filter
      if (searchQuery) {
        const text = (card.dataset.title + ' ' + card.dataset.excerpt).toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    // Sort
    visible.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dataset.created) - new Date(a.dataset.created);
      } else if (sortBy === 'views') {
        return parseInt(b.dataset.views) - parseInt(a.dataset.views);
      } else if (sortBy === 'likes') {
        return parseInt(b.dataset.likes) - parseInt(a.dataset.likes);
      }
      return 0;
    });

    // Update DOM
    const grid = document.querySelector('.cards-grid');
    visible.forEach(card => {
      card.classList.remove('hidden');
      grid.appendChild(card);
    });
    cards.filter(c => !visible.includes(c)).forEach(c => c.classList.add('hidden'));
  }

  // Tag click
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tagPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeTag = pill.dataset.tag;
      filterAndSort();
    });
  });

  // Search input
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterAndSort();
      }, 300);
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      filterAndSort();
    });
  }

  // Approval toggle
  if (approvedOnlyCheckbox) {
    approvedOnlyCheckbox.addEventListener('change', (e) => {
      approvedOnly = e.target.checked;
      filterAndSort();
    });
  }

  // Initial filter
  filterAndSort();
})();
