(function () {
  var presets = [
    { id: 'p1', text: '我是聋人，请写字交流', size: 'xlarge', theme: 'white' },
    { id: 'p2', text: '我需要帮助', size: 'xlarge', theme: 'yellow' },
    { id: 'p3', text: '请问 XX 路怎么走', size: 'large', theme: 'white' },
    { id: 'p4', text: '我需要买药', size: 'xlarge', theme: 'yellow' },
    { id: 'p5', text: '请帮我拨打电话 XXX', size: 'large', theme: 'white' },
    { id: 'p6', text: '我听不到，请您说慢一点', size: 'large', theme: 'black' }
  ];

  var state = {
    custom: loadCustomCards(),
    currentIndex: 0,
    touchStartX: 0,
    touchStartY: 0,
    cardsInViewer: []
  };

  var presetGrid = document.getElementById('presetGrid');
  var customGrid = document.getElementById('customGrid');
  var viewer = document.getElementById('viewer');
  var viewerText = document.getElementById('viewerText');
  var viewerCounter = document.getElementById('viewerCounter');
  var brightnessNote = document.getElementById('brightnessNote');
  var cardText = document.getElementById('cardText');
  var cardSize = document.getElementById('cardSize');
  var cardTheme = document.getElementById('cardTheme');
  var emergencyPhone = document.getElementById('emergencyPhone');

  function loadCustomCards() {
    try {
      return JSON.parse(localStorage.getItem('silentCommCustomCards') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveCustomCards() {
    localStorage.setItem('silentCommCustomCards', JSON.stringify(state.custom));
  }

  function emergencyCard() {
    var phone = emergencyPhone.value.trim() || '138-0000-0000';
    return {
      id: 'emergency',
      text: '紧急情况：我需要帮助。请联系我的紧急联系人：' + phone + '。请帮我拨打 120 或 110。',
      size: 'large',
      theme: 'black'
    };
  }

  function allCards() {
    return [emergencyCard()].concat(presets, state.custom);
  }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern || 35);
    }
  }

  function createCardElement(card, index, list) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'comm-card theme-' + card.theme + ' size-' + card.size;
    button.textContent = card.text;
    button.addEventListener('click', function () {
      openViewer(list, index);
    });
    return button;
  }

  function renderCards() {
    presetGrid.innerHTML = '';
    presets.forEach(function (card, index) {
      presetGrid.appendChild(createCardElement(card, index, presets));
    });

    customGrid.innerHTML = '';
    if (!state.custom.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '还没有自定义卡片，右侧编辑后保存。';
      customGrid.appendChild(empty);
      return;
    }
    state.custom.forEach(function (card, index) {
      customGrid.appendChild(createCardElement(card, index, state.custom));
    });
  }

  function openViewer(list, index) {
    state.cardsInViewer = list.slice();
    state.currentIndex = index;
    viewer.classList.add('active');
    viewer.setAttribute('aria-hidden', 'false');
    renderViewerCard();
    showBrightnessNote();
    requestFullscreen();
    vibrate(50);
  }

  function requestFullscreen() {
    if (viewer.requestFullscreen) {
      viewer.requestFullscreen().catch(function () {});
    }
  }

  function closeViewer() {
    viewer.classList.remove('active', 'theme-white', 'theme-yellow', 'theme-black');
    viewer.setAttribute('aria-hidden', 'true');
    brightnessNote.classList.remove('active');
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
  }

  function renderViewerCard() {
    var card = state.cardsInViewer[state.currentIndex];
    if (!card) return;
    viewer.classList.remove('theme-white', 'theme-yellow', 'theme-black');
    viewer.classList.add('theme-' + card.theme);
    viewerText.className = 'viewer-text size-' + card.size;
    viewerText.textContent = card.text;
    viewerText.style.animation = 'none';
    viewerText.offsetHeight;
    viewerText.style.animation = '';
    viewerCounter.textContent = (state.currentIndex + 1) + ' / ' + state.cardsInViewer.length;
  }

  function switchCard(direction) {
    if (!state.cardsInViewer.length) return;
    var total = state.cardsInViewer.length;
    state.currentIndex = (state.currentIndex + direction + total) % total;
    renderViewerCard();
    vibrate(35);
  }

  function showBrightnessNote() {
    brightnessNote.classList.add('active');
  }

  function addCustomCard() {
    var text = cardText.value.trim();
    if (!text) {
      cardText.focus();
      vibrate([30, 40, 30]);
      return;
    }
    state.custom.unshift({
      id: 'c' + Date.now(),
      text: text,
      size: cardSize.value,
      theme: cardTheme.value
    });
    saveCustomCards();
    renderCards();
    cardText.value = '';
    vibrate(50);
  }

  document.getElementById('saveCard').addEventListener('click', addCustomCard);
  document.getElementById('clearCustom').addEventListener('click', function () {
    state.custom = [];
    saveCustomCards();
    renderCards();
    vibrate(50);
  });
  document.getElementById('emergencyBtn').addEventListener('click', function () {
    openViewer(allCards(), 0);
  });
  document.getElementById('fullscreenCurrent').addEventListener('click', function () {
    openViewer(allCards(), 1);
  });
  document.getElementById('closeViewer').addEventListener('click', closeViewer);
  document.getElementById('brightAgain').addEventListener('click', showBrightnessNote);
  document.getElementById('brightnessOk').addEventListener('click', function () {
    brightnessNote.classList.remove('active');
    vibrate(30);
  });

  viewer.addEventListener('pointerdown', function (event) {
    state.touchStartX = event.clientX;
    state.touchStartY = event.clientY;
  });
  viewer.addEventListener('pointerup', function (event) {
    var dx = event.clientX - state.touchStartX;
    var dy = event.clientY - state.touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      switchCard(dx < 0 ? 1 : -1);
    }
  });
  document.addEventListener('keydown', function (event) {
    if (!viewer.classList.contains('active')) return;
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowRight') switchCard(1);
    if (event.key === 'ArrowLeft') switchCard(-1);
  });

  renderCards();
})();
