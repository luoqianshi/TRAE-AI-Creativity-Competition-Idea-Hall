(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const innerNo = params.get('inner_no');

  const hero = document.getElementById('detailHero');
  const badgeNum = document.getElementById('badgeNum');
  const cardName = document.getElementById('cardName');
  const cardNameEn = document.getElementById('cardNameEn');
  const fName = document.getElementById('fName');
  const fNo = document.getElementById('fNo');
  const fInner = document.getElementById('fInner');
  const fScore = document.getElementById('fScore');
  const fVer = document.getElementById('fVer');
  const thumbFront = document.getElementById('thumbFront');
  const thumbBack = document.getElementById('thumbBack');
  const thumbFrontPh = document.getElementById('thumbFrontPh');
  const thumbBackPh = document.getElementById('thumbBackPh');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const loading = document.getElementById('loading');

  function applyDetailBg(url) {
    if (url) hero.style.backgroundImage = `url('${url}')`;
  }

  function setThumb(el, ph, url, label) {
    if (url) {
      ph.innerHTML = '';
      const img = document.createElement('img');
      img.src = url;
      img.alt = label;
      img.onerror = function () {
        ph.innerHTML = '图片加载失败';
      };
      ph.appendChild(img);
    } else {
      ph.innerHTML = '暂无图片';
    }
  }

  function openLightbox(url, caption) {
    if (!url) return;
    lbImg.src = url;
    lbCaption.textContent = caption || '';
    lightbox.classList.add('show');
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    setTimeout(() => { lbImg.src = ''; }, 200);
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  function goEmpty() {
    document.body.innerHTML = `
      <div class="app">
        <div class="h5-empty">
          <div class="empty-icon-wrap">
            <div class="empty-icon-ring"></div>
            <div class="empty-icon-ring inner"></div>
            <div class="empty-icon-search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
          </div>
          <div class="empty-title">未查询到该编号</div>
          <div class="empty-desc">您输入的内部编号暂无对应卡牌信息<br>请核对编号后重新查询</div>
          <a class="empty-back-btn" href="index.html">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            返回查询
          </a>
        </div>
      </div>
    `;
  }

  function renderCard(card) {
    document.title = (card.card_name || '卡牌详情') + ' · AGC 鉴真';
    cardName.textContent = card.card_name || '—';
    cardNameEn.textContent = (card.card_no || '') + (card.score ? ' · ' + card.score : '');
    fName.textContent = card.card_name || '—';
    fNo.textContent = card.card_no || '—';
    fInner.textContent = card.inner_no || '—';
    fScore.textContent = card.score || '—';
    fVer.textContent = card.version || '—';

    const scoreText = (card.score || '').toString();
    const numMatch = scoreText.match(/(\d+(\.\d+)?)/);
    badgeNum.textContent = numMatch ? numMatch[1] : (scoreText.length > 8 ? scoreText.slice(0, 6) : scoreText) || '10';

    setThumb(thumbFront, thumbFrontPh, card.img_front, '卡牌正面');
    setThumb(thumbBack, thumbBackPh, card.img_back, '卡牌背面');

    thumbFront.addEventListener('click', function () {
      openLightbox(card.img_front, (card.card_name || '') + ' · 正面');
    });
    thumbBack.addEventListener('click', function () {
      openLightbox(card.img_back, (card.card_name || '') + ' · 背面');
    });
  }

  let bgReady = false, cardReady = false;
  function tryHideLoading() {
    if (bgReady && cardReady) loading.classList.remove('show');
  }

  fetch('/api/config').then(r => r.json()).then(res => {
    if (res.ok && res.data) {
      applyDetailBg(res.data.detail_bg);
    }
    bgReady = true;
    tryHideLoading();
  }).catch(() => { bgReady = true; tryHideLoading(); });

  function loadCard() {
    let url = '/api/cards/' + encodeURIComponent(id);
    fetch(url)
      .then(r => r.json().then(j => ({ status: r.status, body: j })))
      .then(({ status, body }) => {
        cardReady = true;
        tryHideLoading();
        if (status === 200 && body.ok) {
          renderCard(body.data);
        } else {
          goEmpty();
        }
      })
      .catch(() => {
        cardReady = true;
        tryHideLoading();
        goEmpty();
      });
  }

  if (id) {
    loadCard();
  } else {
    goEmpty();
  }
})();
