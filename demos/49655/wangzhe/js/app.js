let currentFilter = '全部';
let searchKeyword = '';

function init() {
  renderHeroList();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchKeyword = e.target.value;
    renderHeroList();
  });

  roles.forEach(role => {
    document.querySelector(`[data-role="${role}"]`).addEventListener('click', () => {
      currentFilter = role;
      document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelector(`[data-role="${role}"]`).classList.add('active');
      renderHeroList();
    });
  });

  document.getElementById('hero-modal').addEventListener('click', (e) => {
    if (e.target.id === 'hero-modal') {
      closeModal();
    }
  });
}

function getRoleCount(role) {
  if (role === '全部') return heroes.length;
  return heroes.filter(h => h.role === role).length;
}

function renderHeroList() {
  const heroGrid = document.getElementById('hero-grid');
  heroGrid.innerHTML = '';

  const filteredHeroes = heroes.filter(hero => {
    const matchRole = currentFilter === '全部' || hero.role === currentFilter;
    const matchSearch = hero.name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchRole && matchSearch;
  });

  if (filteredHeroes.length === 0) {
    heroGrid.innerHTML = `
      <div class="no-results">
        <p>没有找到匹配的英雄</p>
      </div>
    `;
    return;
  }

  filteredHeroes.forEach(hero => {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.innerHTML = `
      <div class="hero-avatar">
        <img src="${hero.avatar}" alt="${hero.name}" />
        <div class="hero-role">${hero.role}</div>
      </div>
      <div class="hero-info">
        <h3>${hero.name}</h3>
      </div>
    `;
    card.addEventListener('click', () => showHeroDetail(hero));
    heroGrid.appendChild(card);
  });
}

function showHeroDetail(hero) {
  const modal = document.getElementById('hero-modal');
  const modalContent = document.getElementById('modal-content');

  modalContent.innerHTML = `
    <div class="modal-header">
      <div class="hero-main-info">
        <img src="${hero.avatar}" alt="${hero.name}" class="modal-avatar" />
        <div class="hero-title">
          <h2>${hero.name}</h2>
          <span class="role-tag">${hero.role}</span>
        </div>
      </div>
      <button id="close-modal" class="close-btn">&times;</button>
    </div>
    <div class="modal-body">
      <p class="hero-desc">${hero.description}</p>
      
      <div class="section">
        <h3 class="section-title">技能介绍</h3>
        <div class="skills-grid">
          ${hero.skills.map((skill, index) => `
            <div class="skill-card">
              <div class="skill-icon">
                <img src="${skill.icon}" alt="${skill.name}" />
                <span class="skill-index">${index + 1}</span>
              </div>
              <div class="skill-info">
                <h4>${skill.name}</h4>
                <p>${skill.description}</p>
                <span class="skill-tip">${skill.tip}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">出装推荐</h3>
        <div class="builds-list">
          ${hero.builds.map(build => `
            <div class="build-item">
              <div class="build-dot"></div>
              <span class="build-name">${build.name}</span>
              <span class="build-desc">${build.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">铭文搭配</h3>
        <div class="arcana-list">
          ${hero.arcana.map(arcana => `
            <div class="arcana-item">
              <span class="arcana-name">${arcana.name}</span>
              <span class="arcana-count">x${arcana.count}</span>
              <span class="arcana-desc">${arcana.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">对战技巧</h3>
        <ul class="tips-list">
          ${hero.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>

      <div class="section">
        <h3 class="section-title">克制关系</h3>
        <div class="counters-grid">
          <div class="counter-item strong">
            <h4>压制英雄</h4>
            <div class="counter-names">
              ${hero.counters.strong.map(name => `<span>${name}</span>`).join('')}
            </div>
          </div>
          <div class="counter-item weak">
            <h4>被克制</h4>
            <div class="counter-names">
              ${hero.counters.weak.map(name => `<span>${name}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  document.getElementById('close-modal').addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.getElementById('hero-modal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', init);