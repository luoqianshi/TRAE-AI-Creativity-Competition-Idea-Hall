/**
 * 城市探险游戏生成器 - 主应用逻辑 v2
 * 新增：自动定位、自动天气识别、自动时段识别、Leaflet 地图交互选址
 */
var App = (function () {

  // === 城市主题色彩辅助：十六进制色值 → rgba / 加深色 ===
  function hexToRgba(hex, alpha) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(function (c) { return c + c; }).join('');
    }
    var r = parseInt(h.substring(0, 2), 16) || 0;
    var g = parseInt(h.substring(2, 4), 16) || 0;
    var b = parseInt(h.substring(4, 6), 16) || 0;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }
  function darkenHex(hex, amount) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(function (c) { return c + c; }).join('');
    }
    var r = Math.max(0, Math.round((parseInt(h.substring(0, 2), 16) || 0) * (1 - amount)));
    var g = Math.max(0, Math.round((parseInt(h.substring(2, 4), 16) || 0) * (1 - amount)));
    var b = Math.max(0, Math.round((parseInt(h.substring(4, 6), 16) || 0) * (1 - amount)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  var state = {
    city: 'beijing',
    customLat: null,
    customLng: null,
    customCityName: null,
    theme: 'history',
    weather: 'sunny',
    weatherTemp: null,
    timeSlot: 'day',
    duration: 60,
    autoDetected: false,
    // 个性化偏好
    preference: 'culture',
    party: 'solo',
    energy: 'normal',
    // 探险模式：classic / challenge / free
    explorationMode: 'classic'
  };

  var currentQuest = null;
  var selectedCity = null; // 欢迎页选中的城市

  // === 探险模式状态 ===
  var explorationState = {
    active: false,           // 是否处于探险模式
    currentSeq: 0,           // 当前解锁到第几个任务
    completedSeqs: {},       // 已完成的任务序号
    challengeTimerId: null,  // 限时挑战计时器
    challengeStartTs: 0,     // 挑战开始时间戳
    challengeDurationMs: 0   // 挑战总时长（毫秒）
  };

  // === 初始化 ===
  function init() {
    initWelcomeScreen();
    renderOptionButtons();
    bindEvents();
  }

  // === 欢迎页逻辑 ===
  function initWelcomeScreen() {
    var strips = document.querySelectorAll('.city-strip');
    strips.forEach(function (strip) {
      strip.addEventListener('click', function () {
        // 移除其他选中
        strips.forEach(function (s) { s.classList.remove('selected'); });
        strip.classList.add('selected');
        selectedCity = strip.dataset.city;
      });

      // 双击直接进入
      strip.addEventListener('dblclick', function () {
        selectedCity = strip.dataset.city;
        enterApp();
      });
    });

    // 鼠标视差：背景光晕跟随鼠标轻微移动
    var welcomeScreen = document.getElementById('welcome-screen');
    var orbs = document.querySelector('.welcome-bg-orbs');
    if (orbs) {
      welcomeScreen.addEventListener('mousemove', function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 30;
        var y = (e.clientY / window.innerHeight - 0.5) * 30;
        orbs.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
    }

    // 进入按钮
    document.getElementById('enter-app').addEventListener('click', enterApp);

    // 使用当前位置
    document.getElementById('enter-custom').addEventListener('click', function () {
      selectedCity = null; // 标记为使用当前位置
      enterApp();
    });
  }

  function enterApp() {
    var welcome = document.getElementById('welcome-screen');
    var mainApp = document.getElementById('main-app');

    // 如果选了城市，设置 state 并飞到该城市
    if (selectedCity && POI_DATABASE[selectedCity]) {
      var city = POI_DATABASE[selectedCity];
      state.city = selectedCity;
      state.customLat = null;
      state.customLng = null;
      state.customCityName = null;

      // 淡出欢迎页
      welcome.classList.add('fade-out');
      setTimeout(function () {
        welcome.style.display = 'none';
        mainApp.style.display = 'block';

        // 初始化地图
        initMap();

        // 飞到选中城市
        MapManager.flyTo(city.center[0], city.center[1], 12);
        updateAutoStatus('location', city.name + '（已选择）', true);
        updateLocationLabel(city.name, city.center[0], city.center[1]);

        // 更新快捷城市按钮
        document.querySelectorAll('.quick-city').forEach(function (b) {
          b.classList.remove('active');
          if (b.dataset.city === selectedCity) b.classList.add('active');
        });

        // 选中城市时：用城市坐标获取天气，不尝试 GPS
        autoDetectForCity(city.center[0], city.center[1], city.name);
      }, 600);
    } else {
      // 使用当前位置
      welcome.classList.add('fade-out');
      setTimeout(function () {
        welcome.style.display = 'none';
        mainApp.style.display = 'block';
        initMap();
        autoDetectWithFallback();
      }, 600);
    }
  }

  // === 渲染选项按钮 ===
  function renderOptionButtons() {
    var themeGroup = document.getElementById('theme-group');
    themeGroup.innerHTML = THEME_LIST.map(function (t) {
      return '<button class="option-btn' + (t.id === state.theme ? ' active' : '') + '" data-group="theme" data-value="' + t.id + '">' +
        '<span class="icon">' + t.icon + '</span>' + t.name + '</button>';
    }).join('');

    var durationGroup = document.getElementById('duration-group');
    durationGroup.innerHTML = DURATION_LIST.map(function (d) {
      return '<button class="option-btn' + (d.id === state.duration ? ' active' : '') + '" data-group="duration" data-value="' + d.id + '">' + d.name + '</button>';
    }).join('');

    // 天气和时段按钮（自动检测后可手动切换）
    var weatherGroup = document.getElementById('weather-group');
    weatherGroup.innerHTML = WEATHER_LIST.map(function (w) {
      return '<button class="option-btn' + (w.id === state.weather ? ' active' : '') + '" data-group="weather" data-value="' + w.id + '">' +
        '<span class="icon">' + w.icon + '</span>' + w.name + '</button>';
    }).join('');

    var timeGroup = document.getElementById('time-group');
    timeGroup.innerHTML = TIME_LIST.map(function (t) {
      return '<button class="option-btn' + (t.id === state.timeSlot ? ' active' : '') + '" data-group="timeSlot" data-value="' + t.id + '">' +
        '<span class="icon">' + t.icon + '</span>' + t.name + '</button>';
    }).join('');

    // 个性化偏好
    var PREFERENCE_LIST = [
      { value: 'culture', label: '人文历史', icon: '🏛️' },
      { value: 'nature', label: '自然风光', icon: '🌿' },
      { value: 'food', label: '美食探索', icon: '🍴' },
      { value: 'photo', label: '摄影打卡', icon: '📸' },
      { value: 'leisure', label: '休闲漫步', icon: '☕' }
    ];
    var preferenceGroup = document.getElementById('preference-group');
    preferenceGroup.innerHTML = PREFERENCE_LIST.map(function (p) {
      return '<button class="option-btn' + (p.value === state.preference ? ' active' : '') + '" data-group="preference" data-value="' + p.value + '">' +
        '<span class="icon">' + p.icon + '</span>' + p.label + '</button>';
    }).join('');

    // 同行人数
    var PARTY_LIST = [
      { value: 'solo', label: '独自探险' },
      { value: 'couple', label: '两人同行' },
      { value: 'family', label: '家庭出游' },
      { value: 'friends', label: '朋友组队' }
    ];
    var partyGroup = document.getElementById('party-group');
    partyGroup.innerHTML = PARTY_LIST.map(function (p) {
      return '<button class="option-btn' + (p.value === state.party ? ' active' : '') + '" data-group="party" data-value="' + p.value + '">' +
        p.label + '</button>';
    }).join('');

    // 体力水平
    var ENERGY_LIST = [
      { value: 'relaxed', label: '轻松' },
      { value: 'normal', label: '适中' },
      { value: 'active', label: '高强度' }
    ];
    var energyGroup = document.getElementById('energy-group');
    energyGroup.innerHTML = ENERGY_LIST.map(function (e) {
      return '<button class="option-btn' + (e.value === state.energy ? ' active' : '') + '" data-group="energy" data-value="' + e.value + '">' +
        e.label + '</button>';
    }).join('');

    // 探险模式
    var MODE_LIST = [
      { value: 'classic', label: '经典模式', icon: '🗺️' },
      { value: 'challenge', label: '限时挑战', icon: '⏱️' },
      { value: 'free', label: '自由探索', icon: '🕊️' }
    ];
    var modeGroup = document.getElementById('mode-group');
    modeGroup.innerHTML = MODE_LIST.map(function (m) {
      return '<button class="option-btn' + (m.value === state.explorationMode ? ' active' : '') + '" data-group="explorationMode" data-value="' + m.value + '">' +
        '<span class="icon">' + m.icon + '</span>' + m.label + '</button>';
    }).join('');
  }

  // === 初始化地图 ===
  function initMap() {
    MapManager.initInputMap(39.9163, 116.3972, 11);
  }

  // === 自动检测：时段（纯本地，无需网络）===
  function detectTimeSlot() {
    var timeSlot = GeoSensor.getTimeSlot();
    state.timeSlot = timeSlot.id;
    state.autoDetected = true;
    updateAutoStatus('time', timeSlot.icon + ' ' + timeSlot.name, true);
    updateOptionButtons('timeSlot', timeSlot.id);
  }

  // === 选中城市：用城市坐标获取天气 ===
  function autoDetectForCity(lat, lng, cityName) {
    detectTimeSlot();

    // 用城市坐标获取天气
    showDetectingStatus();
    GeoSensor.getWeather(lat, lng).then(function (w) {
      state.weather = w.weather;
      state.weatherTemp = w.temp;
      updateAutoStatus('weather', w.icon + ' ' + w.desc + (w.temp !== null ? ' ' + w.temp + '°C' : ''), true);
      updateOptionButtons('weather', w.weather);
      hideDetectingStatus();
      showDetectedSummary();
    }).catch(function () {
      hideDetectingStatus();
      updateAutoStatus('weather', '天气获取失败', false);
      showDetectedSummary();
    });
  }

  // === 使用当前位置：GPS 定位 + IP 降级 ===
  function autoDetectWithFallback() {
    detectTimeSlot();
    showDetectingStatus();

    // 1. 先尝试浏览器 GPS 定位
    GeoSensor.getPosition().then(function (pos) {
      handleLocationSuccess(pos.lat, pos.lng, 'GPS');
    }).catch(function (gpsErr) {
      console.warn('GPS 定位失败，尝试 IP 定位:', gpsErr.message);
      updateAutoStatus('location', 'GPS 不可用，尝试 IP 定位...', false);

      // 2. GPS 失败，降级为 IP 定位
      return GeoSensor.getIPLocation().then(function (ipPos) {
        handleLocationSuccess(ipPos.lat, ipPos.lng, 'IP');
      }).catch(function (ipErr) {
        console.warn('IP 定位也失败:', ipErr.message);
        // 3. 全部失败，使用默认城市
        hideDetectingStatus();
        var defaultCity = POI_DATABASE[state.city];
        updateAutoStatus('location', '定位失败，使用默认城市 ' + defaultCity.name, false);
        updateLocationLabel(defaultCity.name, defaultCity.center[0], defaultCity.center[1]);
        MapManager.flyTo(defaultCity.center[0], defaultCity.center[1], 12);

        // 仍然用默认城市坐标获取天气
        GeoSensor.getWeather(defaultCity.center[0], defaultCity.center[1]).then(function (w) {
          state.weather = w.weather;
          state.weatherTemp = w.temp;
          updateAutoStatus('weather', w.icon + ' ' + w.desc + (w.temp !== null ? ' ' + w.temp + '°C' : ''), true);
          updateOptionButtons('weather', w.weather);
        }).catch(function () {
          updateAutoStatus('weather', '天气获取失败', false);
        });
        showDetectedSummary();
      });
    });
  }

  // === 定位成功后的统一处理 ===
  function handleLocationSuccess(lat, lng, source) {
    var sourceLabel = source === 'GPS' ? '（GPS 定位）' : '（IP 定位）';
    MapManager.flyTo(lat, lng, 13);

    // 逆地理编码
    GeoSensor.reverseGeocode(lat, lng).then(function (geo) {
      state.customLat = lat;
      state.customLng = lng;
      state.customCityName = geo.city;
      updateAutoStatus('location', geo.city + sourceLabel, true);
      updateLocationLabel(geo.city, lat, lng);

      // 获取天气
      return GeoSensor.getWeather(lat, lng);
    }).then(function (w) {
      state.weather = w.weather;
      state.weatherTemp = w.temp;
      updateAutoStatus('weather', w.icon + ' ' + w.desc + (w.temp !== null ? ' ' + w.temp + '°C' : ''), true);
      updateOptionButtons('weather', w.weather);
      hideDetectingStatus();
      showDetectedSummary();
    }).catch(function () {
      hideDetectingStatus();
      updateAutoStatus('weather', '天气获取失败', false);
      showDetectedSummary();
    });
  }

  function showDetectingStatus() {
    document.getElementById('detect-status').style.display = 'flex';
  }
  function hideDetectingStatus() {
    document.getElementById('detect-status').style.display = 'none';
  }
  function showDetectedSummary() {
    document.getElementById('detected-summary').style.display = 'flex';
  }

  function updateAutoStatus(type, text, success) {
    var el = document.getElementById('auto-' + type);
    if (!el) return;
    el.textContent = text;
    el.classList.add('detected');
    if (!success) el.classList.add('warn');
  }

  function updateLocationLabel(cityName, lat, lng) {
    var el = document.getElementById('location-label');
    if (el) {
      el.textContent = cityName + ' (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')';
    }
  }

  function updateOptionButtons(group, value) {
    document.querySelectorAll('[data-group="' + group + '"]').forEach(function (b) {
      b.classList.remove('active');
      if (b.dataset.value == value) b.classList.add('active');
    });
  }

  // === 地图选址回调 ===
  function onMapSelect(lat, lng) {
    state.customLat = lat;
    state.customLng = lng;
    updateAutoStatus('location', '获取地名中...', true);

    GeoSensor.reverseGeocode(lat, lng).then(function (geo) {
      state.customCityName = geo.city;
      updateAutoStatus('location', geo.city, true);
      updateLocationLabel(geo.city, lat, lng);
    });
  }

  // === 地图搜索功能 ===
  function initMapSearch() {
    var input = document.getElementById('map-search-input');
    var btn = document.getElementById('map-search-btn');
    var resultsBox = document.getElementById('map-search-results');
    if (!input || !btn) return;

    var searchTimer = null;
    var searchSeq = 0; // 搜索请求序号，防止竞态

    function doSearch() {
      var query = input.value.trim();
      if (!query) return;

      var currentSeq = ++searchSeq;
      btn.textContent = '搜索中...';
      btn.disabled = true;

      GeoSensor.searchPlace(query).then(function (results) {
        // 如果已经有更新的搜索请求，忽略这次结果
        if (currentSeq !== searchSeq) return;

        btn.textContent = '搜索';
        btn.disabled = false;
        resultsBox.innerHTML = '';

        if (results.length === 0) {
          resultsBox.innerHTML = '<div class="result-item"><div class="result-name">未找到相关地点</div></div>';
          resultsBox.classList.add('show');
          return;
        }

        // 所有结果都在地图上标记编号，包括单结果（不自动跳转）
        MapManager.showSearchMarkers(results, function (r) {
          selectSearchResult(r);
          // 更新下方列表选中状态
          var items = resultsBox.querySelectorAll('.result-item');
          items.forEach(function (el, i) {
            el.classList.toggle('active', results[i].lat === r.lat && results[i].lng === r.lng);
          });
        });

        // 下方列表显示，可点击选择
        results.forEach(function (r, idx) {
          var item = document.createElement('div');
          item.className = 'result-item';
          item.innerHTML = '<span class="result-num">' + (idx + 1) + '</span>' +
            '<div class="result-detail">' +
            '<div class="result-name">' + r.name + '</div>' +
            '<div class="result-addr">' + r.address + '</div>' +
            '</div>';
          item.addEventListener('click', function () {
            selectSearchResult(r);
            resultsBox.classList.remove('show');
            input.value = r.name;
          });
          resultsBox.appendChild(item);
        });
        resultsBox.classList.add('show');
      }).catch(function (err) {
        if (currentSeq !== searchSeq) return;
        console.error('Search error:', err);
        btn.textContent = '搜索';
        btn.disabled = false;
        resultsBox.innerHTML = '<div class="result-item"><div class="result-name">搜索出错，请重试</div></div>';
        resultsBox.classList.add('show');
      });
    }

    btn.addEventListener('click', doSearch);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        doSearch();
      }
    });

    // 输入时防抖搜索
    input.addEventListener('input', function () {
      clearTimeout(searchTimer);
      var query = input.value.trim();
      if (query.length < 2) {
        resultsBox.classList.remove('show');
        return;
      }
      searchTimer = setTimeout(doSearch, 600);
    });

    // 点击外部关闭结果
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.map-search-bar')) {
        resultsBox.classList.remove('show');
      }
    });
  }

  function selectSearchResult(result) {
    var input = document.getElementById('map-search-input');
    if (input) input.value = result.name;

    // 清除搜索标记，飞到选中位置
    MapManager.clearSearchMarkers();
    MapManager.flyTo(result.lat, result.lng, 15);
    updateAutoStatus('location', result.name, true);
    updateLocationLabel(result.name, result.lat, result.lng);

    // 更新状态
    state.customLat = result.lat;
    state.customLng = result.lng;
    state.customCityName = result.name;

    // 取消快捷城市按钮选中
    document.querySelectorAll('.quick-city').forEach(function (b) { b.classList.remove('active'); });
  }

  // === 事件绑定 ===
  function bindEvents() {
    document.querySelectorAll('.option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.dataset.group;
        var value = btn.dataset.value;
        if (group === 'duration') value = parseInt(value, 10);
        state[group] = value;
        updateOptionButtons(group, value);
      });
    });

    // 地图搜索
    initMapSearch();

    // 快捷城市按钮
    document.querySelectorAll('.quick-city').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cityKey = btn.dataset.city;
        var city = POI_DATABASE[cityKey];
        if (city) {
          state.city = cityKey;
          state.customLat = null;
          state.customLng = null;
          state.customCityName = null;
          MapManager.flyTo(city.center[0], city.center[1], 12);
          updateAutoStatus('location', city.name + '（预设）', true);
          updateLocationLabel(city.name, city.center[0], city.center[1]);
          document.querySelectorAll('.quick-city').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        }
      });
    });

    // 重新定位按钮
    document.getElementById('relocate-btn').addEventListener('click', function () {
      updateAutoStatus('location', '重新定位中...', true);
      autoDetectWithFallback();
    });

    // 生成按钮
    document.getElementById('generate-btn').addEventListener('click', onGenerate);
    document.getElementById('regen-btn').addEventListener('click', onGenerate);

    // 导出
    document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);
    document.getElementById('export-json-btn').addEventListener('click', exportJSON);

    // 开始探险
    var startBtn = document.getElementById('start-exploration-btn');
    if (startBtn) startBtn.addEventListener('click', startExploration);

    // 分享探险
    var shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.addEventListener('click', shareQuest);

    // 庆祝横幅关闭
    var celebrationClose = document.getElementById('celebration-close');
    if (celebrationClose) celebrationClose.addEventListener('click', closeCelebration);

    // === AI 实时重新规划：偏离对话框按钮 ===
    var devContinueBtn = document.getElementById('deviation-continue');
    if (devContinueBtn) devContinueBtn.addEventListener('click', function () {
      hideDeviationDialog();
      showToast('好的，继续沿原路线前进');
      // 偏离检测仍在运行，触发标志已置位，靠近任务点后会自动重新武装
    });
    var devRerouteBtn = document.getElementById('deviation-reroute');
    if (devRerouteBtn) devRerouteBtn.addEventListener('click', performReroute);
  }

  // === SVG 元素创建辅助 ===
  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
      }
    }
    return el;
  }

  // === 生成探险（沉浸式 AI 可视化）===
  function onGenerate() {
    var btn = document.getElementById('generate-btn');
    btn.disabled = true;
    btn.textContent = '生成中...';
    showLoading(true);

    // 重置探险模式状态
    explorationState.active = false;
    explorationState.currentSeq = 0;
    explorationState.completedSeqs = {};
    stopChallengeTimer();
    var prog = document.getElementById('exploration-progress');
    if (prog) prog.style.display = 'none';
    var banner = document.getElementById('celebration-banner');
    if (banner) { banner.classList.remove('show'); banner.style.display = 'none'; }
    MapManager.hideArrivalPrompt();
    MapManager.clearActiveMarker();
    MapManager.stopDeviationWatch();

    // 生成数据
    currentQuest = QuestGenerator.generate(state);
    var dbg = currentQuest.debug;
    var tasks = currentQuest.tasks;

    // --- SVG 迷你地图可视化 ---
    var SVG_W = 400, SVG_H = 300, PAD = 35;
    var svg = document.getElementById('gen-minimap');
    if (!svg) { finishGeneration(); return; }
    svg.innerHTML = '';

    // 背景网格
    var bg = svgEl('rect', { x: 0, y: 0, width: SVG_W, height: SVG_H, fill: 'rgba(35,44,56,0.5)', rx: 6 });
    svg.appendChild(bg);
    // 网格线
    for (var gx = PAD; gx < SVG_W; gx += 40) {
      svg.appendChild(svgEl('line', { x1: gx, y1: PAD, x2: gx, y2: SVG_H - PAD, stroke: 'rgba(45,56,69,0.4)', 'stroke-width': 0.5 }));
    }
    for (var gy = PAD; gy < SVG_H; gy += 40) {
      svg.appendChild(svgEl('line', { x1: PAD, y1: gy, x2: SVG_W - PAD, y2: gy, stroke: 'rgba(45,56,69,0.4)', 'stroke-width': 0.5 }));
    }

    // 计算坐标边界（从真实 POI 坐标推算）
    var minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    tasks.forEach(function (t) {
      if (t.lat < minLat) minLat = t.lat;
      if (t.lat > maxLat) maxLat = t.lat;
      if (t.lng < minLng) minLng = t.lng;
      if (t.lng > maxLng) maxLng = t.lng;
    });
    var latRange = (maxLat - minLat) || 0.01;
    var lngRange = (maxLng - minLng) || 0.01;
    var bMinLat = minLat - latRange * 0.5, bMaxLat = maxLat + latRange * 0.5;
    var bMinLng = minLng - lngRange * 0.5, bMaxLng = maxLng + lngRange * 0.5;

    function toXY(lat, lng) {
      var x = PAD + ((lng - bMinLng) / (bMaxLng - bMinLng)) * (SVG_W - 2 * PAD);
      var y = PAD + ((bMaxLat - lat) / (bMaxLat - bMinLat)) * (SVG_H - 2 * PAD);
      return { x: x, y: y };
    }

    // 生成候选点数据
    var allDots = [];
    tasks.forEach(function (task) {
      var p = toXY(task.lat, task.lng);
      allDots.push({
        x: p.x, y: p.y, selected: true, seq: task.seq,
        poiName: task.poiName, taskType: task.taskTypeName,
        taskIcon: task.taskIcon, score: 0.85 + Math.random() * 0.15
      });
    });
    var remaining = Math.max(0, dbg.totalCandidates - tasks.length);
    for (var i = 0; i < remaining; i++) {
      allDots.push({
        x: PAD + 10 + Math.random() * (SVG_W - 2 * PAD - 20),
        y: PAD + 10 + Math.random() * (SVG_H - 2 * PAD - 20),
        selected: false, score: 0.1 + Math.random() * 0.5
      });
    }
    // 打乱顺序
    for (var i = allDots.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = allDots[i]; allDots[i] = allDots[j]; allDots[j] = tmp;
    }

    // 步骤定义
    var steps = [
      { text: '扫描 POI 候选集', detail: dbg.totalCandidates + ' 个候选地点', icon: '🔍' },
      { text: '评分与筛选', detail: '主题 × 天气 × 时段', icon: '🎯' },
      { text: '选定最优 POI', detail: dbg.selectedCount + ' 个入选', icon: '✨' },
      { text: '规划探险路线', detail: '环形路线优化', icon: '🗺️' },
      { text: '分配任务模板', detail: dbg.taskTypes.join(' · '), icon: '📋' },
      { text: 'AI 叙事生成', detail: '《' + currentQuest.narrative.gameTitle + '》', icon: '✍️' }
    ];

    var stepsContainer = document.getElementById('gen-steps');
    stepsContainer.innerHTML = steps.map(function (s) {
      return '<div class="step-item">' +
        '<span class="dot"></span>' +
        '<span class="step-icon">' + s.icon + '</span>' +
        '<span class="step-text">' + s.text + '</span>' +
        '<span class="step-detail"></span>' +
        '</div>';
    }).join('');

    var stepEls = document.querySelectorAll('.loading .step-item');
    var progressBar = document.getElementById('gen-progress-bar');
    var progressText = document.getElementById('gen-progress-text');
    var statusEl = document.getElementById('gen-viz-status');
    var statCandidates = document.getElementById('gen-stat-candidates');
    var statSelected = document.getElementById('gen-stat-selected');
    var statScore = document.getElementById('gen-stat-score');

    var themeInfo = THEME_LIST.filter(function (t) { return t.id === state.theme; })[0];
    var themeColor = (themeInfo && themeInfo.color) ? themeInfo.color : '#f0a040';

    var dotEls = [];

    function setProgress(pct) {
      if (progressBar) progressBar.style.width = pct + '%';
      if (progressText) progressText.textContent = pct + '%';
    }

    function activateStep(idx) {
      if (idx > 0 && stepEls[idx - 1]) {
        stepEls[idx - 1].classList.remove('active');
        stepEls[idx - 1].classList.add('done');
        stepEls[idx - 1].querySelector('.step-detail').textContent = steps[idx - 1].detail;
      }
      if (idx < steps.length && stepEls[idx]) {
        stepEls[idx].classList.add('active');
      }
    }

    function animateCount(el, from, to, duration) {
      if (!el) return;
      var start = Date.now();
      function tick() {
        var t = Math.min(1, (Date.now() - start) / duration);
        el.textContent = Math.round(from + (to - from) * t);
        if (t < 1) requestAnimationFrame(tick);
      }
      tick();
    }

    function animateScore(el, duration, finalScore) {
      if (!el) return;
      var start = Date.now();
      function tick() {
        var t = Math.min(1, (Date.now() - start) / duration);
        el.textContent = (finalScore * t).toFixed(2);
        if (t < 1) requestAnimationFrame(tick);
      }
      tick();
    }

    // === Phase 1: 扫描候选点 ===
    function phase1() {
      statusEl.textContent = '正在扫描 POI 数据库...';
      activateStep(0);
      setProgress(5);
      statCandidates.textContent = '0';
      statSelected.textContent = '0';
      statScore.textContent = '0.00';

      var shown = 0;
      var batchSize = Math.max(1, Math.ceil(allDots.length / 10));

      function showBatch() {
        var end = Math.min(shown + batchSize, allDots.length);
        for (var i = shown; i < end; i++) {
          (function (idx) {
            var d = allDots[idx];
            var circle = svgEl('circle', {
              cx: d.x, cy: d.y, r: 0,
              fill: '#5a6a7a', 'fill-opacity': 0,
              stroke: 'none'
            });
            circle.style.transition = 'r 0.3s ease, fill-opacity 0.3s ease';
            svg.appendChild(circle);
            dotEls.push({ el: circle, data: d });
            setTimeout(function () {
              circle.setAttribute('r', '3');
              circle.setAttribute('fill-opacity', '0.5');
            }, 30);
          })(i);
        }
        shown = end;
        statCandidates.textContent = shown;
        setProgress(5 + Math.round((shown / allDots.length) * 20));

        if (shown < allDots.length) {
          setTimeout(showBatch, 100);
        } else {
          animateCount(statCandidates, 0, allDots.length, 400);
          setProgress(25);
          setTimeout(phase2, 400);
        }
      }
      showBatch();
    }

    // === Phase 2: 评分与筛选 ===
    function phase2() {
      statusEl.textContent = '计算匹配评分：主题相关度 × 天气适配 × 时段开放...';
      activateStep(1);
      setProgress(30);

      dotEls.forEach(function (dotObj) {
        var d = dotObj.data;
        var c = dotObj.el;
        c.style.transition = 'r 0.4s ease, fill-opacity 0.4s ease, fill 0.4s ease';
        var targetR = 2 + d.score * 5;
        setTimeout(function () {
          c.setAttribute('r', targetR);
          if (d.score > 0.7) {
            c.setAttribute('fill', themeColor);
            c.setAttribute('fill-opacity', '0.6');
          } else {
            c.setAttribute('fill-opacity', '0.15');
          }
        }, Math.random() * 400);
      });

      animateScore(statScore, 1000, 0.87);
      setProgress(42);

      setTimeout(function () {
        statScore.textContent = '0.87';
        setProgress(48);
        setTimeout(phase3, 300);
      }, 1100);
    }

    // === Phase 3: 选定最优 POI ===
    function phase3() {
      statusEl.textContent = '选定最优 POI，生成环形路线...';
      activateStep(2);
      setProgress(50);

      dotEls.forEach(function (dotObj) {
        var d = dotObj.data;
        var c = dotObj.el;
        if (d.selected) {
          c.style.transition = 'r 0.4s cubic-bezier(0.34,1.56,0.64,1), fill-opacity 0.4s ease, fill 0.4s ease, stroke 0.4s ease';
          c.setAttribute('r', '7');
          c.setAttribute('fill', themeColor);
          c.setAttribute('fill-opacity', '0.9');
          c.setAttribute('stroke', '#fff');
          c.setAttribute('stroke-width', '2');
          c.setAttribute('stroke-opacity', '0.8');
          // 脉冲环
          var ring = svgEl('circle', {
            cx: d.x, cy: d.y, r: 7,
            fill: 'none', stroke: themeColor,
            'stroke-width': 2, 'stroke-opacity': 0.6,
            'class': 'gen-pulse-ring'
          });
          svg.appendChild(ring);
        } else {
          c.style.transition = 'r 0.5s ease, fill-opacity 0.5s ease';
          c.setAttribute('r', '2');
          c.setAttribute('fill-opacity', '0.08');
        }
      });

      animateCount(statSelected, 0, tasks.length, 700);
      setProgress(62);
      setTimeout(phase4, 900);
    }

    // === Phase 4: 规划路线 ===
    function phase4() {
      statusEl.textContent = '规划环形探险路线，连接各 POI...';
      activateStep(3);
      setProgress(68);

      var selectedDots = dotEls.filter(function (d) { return d.data.selected; })
        .sort(function (a, b) { return a.data.seq - b.data.seq; });
      var routePoints = selectedDots.map(function (d) { return { x: d.data.x, y: d.data.y }; });
      routePoints.push(routePoints[0]);

      var lineIdx = 0;
      function drawNextLine() {
        if (lineIdx < routePoints.length - 1) {
          var p1 = routePoints[lineIdx];
          var p2 = routePoints[lineIdx + 1];
          var line = svgEl('line', {
            x1: p1.x, y1: p1.y, x2: p1.x, y2: p1.y,
            stroke: themeColor, 'stroke-width': 2,
            'stroke-opacity': 0.8, 'stroke-dasharray': '5 3'
          });
          line.style.transition = 'x2 0.3s ease, y2 0.3s ease';
          svg.appendChild(line);
          setTimeout(function () {
            line.setAttribute('x2', p2.x);
            line.setAttribute('y2', p2.y);
          }, 20);
          lineIdx++;
          setProgress(68 + Math.round((lineIdx / (routePoints.length - 1)) * 14));
          setTimeout(drawNextLine, 240);
        } else {
          setProgress(82);
          setTimeout(phase5, 300);
        }
      }
      drawNextLine();
    }

    // === Phase 5: 分配任务模板 ===
    function phase5() {
      statusEl.textContent = '为每个 POI 分配任务模板...';
      activateStep(4);
      setProgress(86);

      var selDots = dotEls.filter(function (d) { return d.data.selected; })
        .sort(function (a, b) { return a.data.seq - b.data.seq; });

      selDots.forEach(function (dotObj, idx) {
        setTimeout(function () {
          var d = dotObj.data;
          var text = svgEl('text', {
            x: d.x, y: d.y + 4,
            'text-anchor': 'middle',
            'font-size': '10', 'font-weight': '700',
            fill: '#fff', 'fill-opacity': 0
          });
          text.textContent = d.seq;
          text.style.transition = 'fill-opacity 0.3s ease';
          svg.appendChild(text);
          setTimeout(function () { text.setAttribute('fill-opacity', '1'); }, 20);
        }, idx * 100);
      });

      setProgress(92);
      setTimeout(phase6, 700);
    }

    // === Phase 6: AI 叙事生成 ===
    function phase6() {
      statusEl.textContent = 'AI 正在编织探险叙事...';
      activateStep(5);
      setProgress(95);

      setTimeout(function () {
        activateStep(6);
        setProgress(100);
        statusEl.textContent = '探险生成完成！';

        setTimeout(function () {
          finishGeneration();
        }, 400);
      }, 700);
    }

    function finishGeneration() {
      showLoading(false);
      renderResult(currentQuest);
      btn.disabled = false;
      btn.textContent = '重新生成探险';
    }

    // 启动可视化
    phase1();
  }

  function showLoading(show) {
    var loading = document.getElementById('loading');
    var result = document.getElementById('result-area');
    var empty = document.getElementById('empty-state');
    if (show) {
      loading.classList.add('show');
      result.classList.remove('show');
      empty.style.display = 'none';
      document.querySelectorAll('.loading .step-item').forEach(function (s) {
        s.classList.remove('active', 'done');
      });
    } else {
      loading.classList.remove('show');
    }
  }

  // === 生成洞察可视化 ===
  function renderGenInsight(quest) {
    var container = document.getElementById('gen-insight');
    if (!container) return;
    var dbg = quest.debug;

    // POI 类型分布
    var typeCount = {};
    dbg.poiTypes.forEach(function (t) {
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    var typeNames = { ancient: '古建', street: '街巷', garden: '园林', lake: '湖泊', nature: '自然', modern: '现代' };

    var typeBars = Object.keys(typeCount).map(function (t) {
      var pct = Math.round((typeCount[t] / dbg.poiTypes.length) * 100);
      return '<div class="insight-bar-item">' +
        '<span class="bar-label">' + (typeNames[t] || t) + '</span>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;"></div></div>' +
        '<span class="bar-value">' + typeCount[t] + '</span>' +
      '</div>';
    }).join('');

    // 任务类型分布
    var taskTypeCount = {};
    dbg.taskTypes.forEach(function (t) {
      taskTypeCount[t] = (taskTypeCount[t] || 0) + 1;
    });

    var taskChips = dbg.taskTypes.map(function (t, i) {
      return '<span class="insight-chip">' + (i + 1) + '. ' + t + '</span>';
    }).join('');

    // === AI 决策解释 ===
    var poiScores = dbg.poiScores || [];
    var scoreBars = poiScores.map(function (item, idx) {
      var s = item.scores || { theme: 0, weather: 0, time: 0, distance: 0, total: 0, reason: '' };
      var pct = function (v) { return Math.max(2, Math.round(v * 100)); };
      return '<div class="ai-poi-card">' +
        '<div class="ai-poi-header">' +
          '<span class="ai-poi-seq">' + (idx + 1) + '</span>' +
          '<span class="ai-poi-name">' + item.name + '</span>' +
          '<span class="ai-poi-total">综合 ' + s.total.toFixed(2) + '</span>' +
        '</div>' +
        '<div class="ai-poi-reason">' +
          '<span class="ai-reason-icon">📝</span>' +
          '<span class="ai-reason-text">' + s.reason + '</span>' +
        '</div>' +
        '<div class="ai-score-bars">' +
          '<div class="ai-score-bar-item">' +
            '<span class="ai-score-bar-label">主题相关度</span>' +
            '<div class="ai-score-bar-track"><div class="ai-score-bar-fill theme" style="width:' + pct(s.theme) + '%;"></div></div>' +
            '<span class="ai-score-bar-value">' + s.theme.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="ai-score-bar-item">' +
            '<span class="ai-score-bar-label">天气适配</span>' +
            '<div class="ai-score-bar-track"><div class="ai-score-bar-fill weather" style="width:' + pct(s.weather) + '%;"></div></div>' +
            '<span class="ai-score-bar-value">' + s.weather.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="ai-score-bar-item">' +
            '<span class="ai-score-bar-label">时段适配</span>' +
            '<div class="ai-score-bar-track"><div class="ai-score-bar-fill time" style="width:' + pct(s.time) + '%;"></div></div>' +
            '<span class="ai-score-bar-value">' + s.time.toFixed(2) + '</span>' +
          '</div>' +
          '<div class="ai-score-bar-item">' +
            '<span class="ai-score-bar-label">距离</span>' +
            '<div class="ai-score-bar-track"><div class="ai-score-bar-fill distance" style="width:' + pct(s.distance) + '%;"></div></div>' +
            '<span class="ai-score-bar-value">' + s.distance.toFixed(2) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    var generationReason = dbg.generationReason || '';

    container.innerHTML =
      '<div class="insight-header panel-header"><span class="section-icon">🔍</span>生成洞察</div>' +
      '<div class="insight-grid">' +
        '<div class="insight-card">' +
          '<div class="insight-card-title">POI 筛选</div>' +
          '<div class="insight-stat">' +
            '<span class="stat-num">' + dbg.totalCandidates + '</span>' +
            '<span class="stat-arrow">→</span>' +
            '<span class="stat-num accent">' + dbg.selectedCount + '</span>' +
            '<span class="stat-label">个候选地点入选</span>' +
          '</div>' +
          '<div class="insight-bars">' + typeBars + '</div>' +
        '</div>' +
        '<div class="insight-card">' +
          '<div class="insight-card-title">任务类型</div>' +
          '<div class="insight-task-flow">' + taskChips + '</div>' +
          '<div class="insight-coherence">' +
            '<span class="coherence-icon ' + (quest.coherence.passed ? 'pass' : 'warn') + '">' +
              (quest.coherence.passed ? '✓' : '⚠') +
            '</span>' +
            '<span>连贯性: ' + (quest.coherence.passed ? '通过' : '已优化') + ' · 多样性 ' + quest.coherence.typeDiversity + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ai-explain">' +
        '<div class="ai-explain-header panel-header"><span class="section-icon">🧠</span>AI 决策解释</div>' +
        '<div class="ai-explain-reason">' +
          '<span class="ai-reason-icon">💡</span>' +
          '<span class="ai-reason-text">' + generationReason + '</span>' +
        '</div>' +
        '<div class="ai-poi-list">' + scoreBars + '</div>' +
      '</div>';
  }

  // === 渲染任务卡片（独立函数，可被 Agent 重排后调用）===
  function renderTaskCards(quest) {
    var taskCards = document.getElementById('task-cards');
    taskCards.innerHTML = quest.tasks.map(function (task) {
      var interactionHtml = '';

      if (task.verify === '拍照验证') {
        interactionHtml =
          '<div class="task-interaction photo-upload" data-seq="' + task.seq + '">' +
            '<label class="upload-zone" data-seq="' + task.seq + '">' +
              '<input type="file" accept="image/*" class="photo-input" data-seq="' + task.seq + '" style="display:none;">' +
              '<div class="upload-placeholder" data-seq="' + task.seq + '">' +
                '<span class="upload-icon">📷</span>' +
                '<span>点击上传照片</span>' +
              '</div>' +
              '<img class="upload-preview" data-seq="' + task.seq + '" style="display:none;">' +
            '</label>' +
            '<button class="clear-photo-btn" data-seq="' + task.seq + '" style="display:none;">删除照片</button>' +
          '</div>';
      } else if (task.verify === 'AI 评分' || task.verify === '文字描述' || task.verify === '开放作答') {
        var placeholder = task.verify === 'AI 评分' ? '在此输入你的创作内容，AI 将为你评分...' :
                         task.verify === '文字描述' ? '在此输入你的描述...' :
                         '在此输入你的答案...';
        interactionHtml =
          '<div class="task-interaction text-answer" data-seq="' + task.seq + '">' +
            '<textarea class="answer-textarea" data-seq="' + task.seq + '" placeholder="' + placeholder + '" rows="3"></textarea>' +
            '<div class="answer-bar">' +
              '<span class="char-count" data-seq="' + task.seq + '">0 字</span>' +
              (task.verify === 'AI 评分' ?
                '<button class="ai-score-btn" data-seq="' + task.seq + '">AI 评分</button>' :
                '<button class="submit-answer-btn" data-seq="' + task.seq + '">提交答案</button>') +
            '</div>' +
            '<div class="ai-score-result" data-seq="' + task.seq + '"></div>' +
          '</div>';
      } else if (task.verify === '协作验证') {
        interactionHtml =
          '<div class="task-interaction count-answer" data-seq="' + task.seq + '">' +
            '<input type="number" class="count-input" data-seq="' + task.seq + '" placeholder="输入你数到的数字">' +
            '<button class="submit-count-btn" data-seq="' + task.seq + '">提交</button>' +
            '<div class="count-result" data-seq="' + task.seq + '"></div>' +
          '</div>';
      }

      var tState = getTaskState(task.seq);
      var stateClass = tState === 'pending' ? ' pending' : (tState === 'locked' ? ' locked' : '');
      var skipBadge = task.skipped ? '<div class="skipped-badge">⏭️ AI 已跳过</div>' : '';
      var lockOverlay = tState === 'locked' ?
        '<div class="lock-overlay"><span class="lock-icon">🔒</span><span class="lock-text">到达此处解锁</span></div>' : '';
      var pendingBadge = tState === 'pending' ?
        '<div class="pending-badge"><span class="badge-icon">📍</span> 到达地图标记处解锁任务详情</div>' : '';

      var causalHtml = '';
      if (task.isSpecialTask) {
        causalHtml = '<div class="causal-link causal-end">' +
          '<span class="causal-icon">🗝️</span>' +
          '<span class="causal-text">' + (task.causalHint || '终极秘令') + '</span>' +
        '</div>';
        if (task.storyFragment) {
          causalHtml += '<div class="causal-link causal-trigger">' +
            '<span class="causal-icon">✨</span>' +
            '<span class="causal-text">' + task.storyFragment + '</span>' +
          '</div>';
        }
      } else if (task.causalRole === 'origin' || task.causalRole === 'solo') {
        causalHtml = '<div class="causal-link causal-start">' +
          '<span class="causal-icon">🌟</span>' +
          '<span class="causal-text">' + (task.causalHint || '探险的起点') + '</span>' +
        '</div>';
      } else if (task.causalRole === 'finale') {
        causalHtml = '<div class="causal-link causal-end">' +
          '<span class="causal-icon">🏁</span>' +
          '<span class="causal-text">' + (task.causalHint || '故事的终章') + '</span>' +
        '</div>';
        if (task.causalEvent) {
          causalHtml += '<div class="causal-link causal-trigger">' +
            '<span class="causal-icon">🔗</span>' +
            '<span class="causal-text">' + task.causalEvent + '</span>' +
          '</div>';
        }
      } else {
        var roleIcon = task.causalEffect === 'unlock' ? '🔓' :
                       task.causalEffect === 'discover' ? '🔍' :
                       task.causalEffect === 'inspire' ? '💡' :
                       task.causalEffect === 'prove' ? '⚔️' :
                       task.causalEffect === 'reveal' ? '📖' :
                       task.causalEffect === 'evidence' ? '📸' :
                       task.causalEffect === 'truth' ? '🔑' : '🔗';
        causalHtml = '<div class="causal-link causal-consequence">' +
          '<span class="causal-icon">' + roleIcon + '</span>' +
          '<span class="causal-text">' + (task.causalSummary || '') + '</span>' +
        '</div>';
        if (task.causalEvent) {
          causalHtml += '<div class="causal-link causal-trigger">' +
            '<span class="causal-icon">✨</span>' +
            '<span class="causal-text">' + task.causalEvent + '</span>' +
          '</div>';
        }
      }

      if (!task.isSpecialTask && task.storyFragment) {
        causalHtml += '<div class="causal-link causal-trigger">' +
          '<span class="causal-icon">🧩</span>' +
          '<span class="causal-text">' + task.storyFragment + '</span>' +
        '</div>';
      }

      return '<div class="task-card' + stateClass + (task.skipped ? ' skipped' : '') + '" id="task-' + task.seq + '" data-seq="' + task.seq + '" data-lat="' + task.lat + '" data-lng="' + task.lng + '">' +
        lockOverlay + skipBadge +
        '<div class="seq">' + task.seq + '</div>' +
        '<div class="body">' +
          '<h4>' + task.taskIcon + ' ' + task.title + '</h4>' +
          '<div class="poi-name">' + task.poiName + ' — ' + task.poiDesc + '</div>' +
          '<div class="chips">' +
            '<span class="chip type">' + task.taskTypeName + '</span>' +
            '<span class="chip verify">' + task.verify + '</span>' +
          '</div>' +
          causalHtml +
          pendingBadge +
          '<div class="task-card-details">' +
            '<div class="prompt">' + task.prompt + '</div>' +
            interactionHtml +
          '</div>' +
        '</div>' +
        '<div class="actions">' +
          '<button class="task-toggle" data-seq="' + task.seq + '">标记完成</button>' +
          '<button class="task-detail" data-seq="' + task.seq + '">展开 <span class="detail-arrow">▾</span></button>' +
        '</div>' +
      '</div>';
    }).join('');

    // 探险模式：已解锁任务自动展开
    if (explorationState.active && state.explorationMode !== 'free') {
      quest.tasks.forEach(function (task) {
        var card = document.getElementById('task-' + task.seq);
        if (!card) return;
        var st = getTaskState(task.seq);
        var detailBtn = card.querySelector('.task-detail');
        if (st === 'unlocked') {
          card.classList.add('expanded');
          if (detailBtn) detailBtn.innerHTML = '收起 <span class="detail-arrow">▾</span>';
        } else {
          card.classList.remove('expanded');
          if (detailBtn) detailBtn.innerHTML = '展开 <span class="detail-arrow">▾</span>';
        }
      });
    }

    bindTaskInteractions(quest);
    bindTaskCardEvents();
  }

  // === 绑定任务卡片事件（标记完成/展开收起/悬停/点击）===
  function bindTaskCardEvents() {
    // 标记完成
    document.querySelectorAll('.task-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var seq = parseInt(btn.dataset.seq, 10);
        if (btn.classList.contains('done')) {
          btn.classList.remove('done');
          btn.textContent = '标记完成';
          uncompleteTask(seq);
        } else {
          btn.classList.add('done');
          btn.textContent = '已完成 ✓';
          completeTask(seq);
        }
      });
    });

    // 展开/收起详情
    document.querySelectorAll('.task-detail').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var seq = parseInt(btn.dataset.seq, 10);
        var card = document.getElementById('task-' + seq);
        if (!card) return;
        var st = getTaskState(seq);
        if (st !== 'unlocked') {
          showToast(st === 'pending' ? '到达地图标记处后再查看任务详情' : '该任务尚未解锁');
          return;
        }
        card.classList.toggle('expanded');
        var label = card.classList.contains('expanded') ? '收起' : '展开';
        btn.innerHTML = label + ' <span class="detail-arrow">▾</span>';
      });
    });

    // 悬停高亮 + 点击飞行
    document.querySelectorAll('.task-card').forEach(function (card) {
      var seq = parseInt(card.dataset.seq, 10);

      card.addEventListener('mouseenter', function () {
        card.classList.add('linked-highlight');
        MapManager.highlightMarker(seq);
        MapManager.panToMarker(seq);
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('linked-highlight');
        MapManager.unhighlightMarker(seq);
      });

      card.addEventListener('click', function (e) {
        if (e.target.closest('button') || e.target.closest('input') ||
            e.target.closest('textarea') || e.target.closest('label')) return;
        MapManager.flyToMarker(seq);
        if (explorationState.active && state.explorationMode !== 'free' &&
            seq === explorationState.currentSeq) {
          MapManager.showArrivalPrompt(seq, function () {
            unlockTask(seq);
          });
        }
      });
    });
  }

  // === 渲染结果 ===
  function renderResult(quest) {
    var resultArea = document.getElementById('result-area');
    resultArea.classList.add('show');

    // 故事面板
    var storyPanel = document.getElementById('story-panel');

    // 应用城市专属主题色：动态覆盖 CSS 变量（主色/副色及其柔和、底色变体）
    var ct = quest.meta.cityTheme;
    if (ct) {
      var root = document.documentElement;
      root.style.setProperty('--accent', ct.accentColor);
      root.style.setProperty('--accent2', ct.accent2Color);
      root.style.setProperty('--accent-soft', hexToRgba(ct.accentColor, 0.12));
      root.style.setProperty('--accent2-soft', hexToRgba(ct.accent2Color, 0.12));
      root.style.setProperty('--accent-tint', ct.bgTint);
      root.style.setProperty('--accent-dark', darkenHex(ct.accentColor, 0.18));
    }

    // 故事标题与副标题（优先使用城市专属命名）
    var titleEl = storyPanel.querySelector('.quest-title');
    titleEl.textContent = ct ? ct.title : '《' + quest.narrative.gameTitle + '》';

    var subtitleEl = storyPanel.querySelector('.quest-subtitle');
    if (!subtitleEl) {
      subtitleEl = document.createElement('div');
      subtitleEl.className = 'quest-subtitle';
      titleEl.insertAdjacentElement('afterend', subtitleEl);
    }
    subtitleEl.textContent = ct ? ct.subtitle : '';

    // 城市氛围横幅：展示城市音乐情绪与当前天气意象
    var panelHeader = storyPanel.querySelector('.panel-header');
    var atmoEl = storyPanel.querySelector('.city-atmosphere');
    if (ct) {
      var weatherId = quest.meta.weatherId || 'sunny';
      var weatherEffect = (ct.weatherEffects && (ct.weatherEffects[weatherId] || ct.weatherEffects.sunny)) || '';
      if (!atmoEl) {
        atmoEl = document.createElement('div');
        atmoEl.className = 'city-atmosphere';
        panelHeader.insertAdjacentElement('afterend', atmoEl);
      }
      atmoEl.innerHTML =
        '<span class="atmo-label">城市氛围</span>' +
        '<span class="atmo-mood">🎵 ' + ct.musicMood + '</span>' +
        '<span class="atmo-divider">·</span>' +
        '<span class="atmo-weather">🌤️ ' + weatherEffect + '</span>' +
        '<span class="atmo-tag">' + ct.taskStyle + '</span>';
    } else if (atmoEl) {
      atmoEl.remove();
    }

    var weatherText = quest.meta.weatherIcon + ' ' + quest.meta.weather;
    if (quest.meta.weatherTemp !== null) weatherText += ' ' + quest.meta.weatherTemp + '°C';
    storyPanel.querySelector('.quest-meta').innerHTML =
      '<span>' + quest.meta.city + '</span>' +
      '<span>' + quest.meta.themeIcon + ' ' + quest.meta.theme + '</span>' +
      '<span>' + weatherText + '</span>' +
      '<span>' + quest.meta.timeIcon + ' ' + quest.meta.timeSlot + '</span>' +
      '<span>' + quest.meta.duration + '</span>' +
      '<span>' + quest.narrative.totalTasks + ' 个任务</span>' +
      '<span>' + quest.meta.generatedAt + '</span>';
    storyPanel.querySelector('.quest-intro').textContent = quest.narrative.intro;
    storyPanel.querySelector('.quest-ending').textContent = quest.narrative.ending;

    // 生成洞察面板
    renderGenInsight(quest);

    // Leaflet 结果地图
    MapManager.renderResultMap(quest);

    renderTaskCards(quest);

    // 绑定交互事件
    bindTaskInteractions(quest);

    // 探险模式：已解锁任务自动展开详情；pending/locked 折叠
    if (explorationState.active && state.explorationMode !== 'free') {
      quest.tasks.forEach(function (task) {
        var card = document.getElementById('task-' + task.seq);
        if (!card) return;
        var st = getTaskState(task.seq);
        var detailBtn = card.querySelector('.task-detail');
        if (st === 'unlocked') {
          card.classList.add('expanded');
          if (detailBtn) detailBtn.innerHTML = '收起 <span class="detail-arrow">▾</span>';
        } else {
          card.classList.remove('expanded');
          if (detailBtn) detailBtn.innerHTML = '展开 <span class="detail-arrow">▾</span>';
        }
      });
    }

    bindTaskCardEvents();

    var coherenceInfo = document.getElementById('coherence-info');
    if (quest.coherence.passed) {
      coherenceInfo.innerHTML = '<span class="coherence-pass">✓ 故事线连贯性检查通过</span> · 任务类型多样性: ' + quest.coherence.typeDiversity;
    } else {
      coherenceInfo.innerHTML = '<span class="coherence-warn">⚠ 连贯性提示: ' + quest.coherence.issues.join('; ') + '</span>';
    }

    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // === 任务交互绑定 ===
  function bindTaskInteractions(quest) {
    var taskState = {}; // 存储每个任务的完成状态

    // --- 照片上传 ---
    document.querySelectorAll('.photo-input').forEach(function (input) {
      input.addEventListener('change', function (e) {
        var seq = parseInt(input.dataset.seq, 10);
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (ev) {
          var preview = document.querySelector('.upload-preview[data-seq="' + seq + '"]');
          var placeholder = document.querySelector('.upload-placeholder[data-seq="' + seq + '"]');
          var clearBtn = document.querySelector('.clear-photo-btn[data-seq="' + seq + '"]');

          if (preview && placeholder) {
            preview.src = ev.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
          }
          if (clearBtn) clearBtn.style.display = 'inline-block';

          taskState[seq] = { type: 'photo', data: ev.target.result, done: true };
          autoMarkComplete(seq);
        };
        reader.readAsDataURL(file);
      });
    });

    // --- 删除照片 ---
    document.querySelectorAll('.clear-photo-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var seq = parseInt(btn.dataset.seq, 10);
        var preview = document.querySelector('.upload-preview[data-seq="' + seq + '"]');
        var placeholder = document.querySelector('.upload-placeholder[data-seq="' + seq + '"]');
        var input = document.querySelector('.photo-input[data-seq="' + seq + '"]');

        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (placeholder) placeholder.style.display = 'flex';
        if (input) input.value = '';
        btn.style.display = 'none';

        taskState[seq] = null;
        autoUnmarkComplete(seq);
      });
    });

    // --- 文字输入字数统计 ---
    document.querySelectorAll('.answer-textarea').forEach(function (ta) {
      ta.addEventListener('input', function () {
        var seq = parseInt(ta.dataset.seq, 10);
        var count = document.querySelector('.char-count[data-seq="' + seq + '"]');
        if (count) count.textContent = ta.value.length + ' 字';
      });
    });

    // --- AI 评分 ---
    document.querySelectorAll('.ai-score-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var seq = parseInt(btn.dataset.seq, 10);
        var textarea = document.querySelector('.answer-textarea[data-seq="' + seq + '"]');
        var resultBox = document.querySelector('.ai-score-result[data-seq="' + seq + '"]');
        var task = quest.tasks.filter(function (t) { return t.seq === seq; })[0];
        if (!textarea || !task) return;

        var text = textarea.value.trim();
        if (text.length < 5) {
          if (resultBox) {
            resultBox.innerHTML = '<div class="score-feedback warn">内容太短，至少写 5 个字哦</div>';
          }
          return;
        }

        btn.disabled = true;
        btn.textContent = '评分中...';
        if (resultBox) resultBox.innerHTML = '<div class="score-feedback loading">AI 正在阅读你的作品...</div>';

        // 模拟 AI 评分（基于文本长度、关键词匹配等）
        setTimeout(function () {
          var score = calculateAIScore(text, task);
          var feedback = generateFeedback(score, task);

          if (resultBox) {
            resultBox.innerHTML =
              '<div class="score-feedback">' +
                '<div class="score-stars">' + '★'.repeat(score.stars) + '☆'.repeat(5 - score.stars) + '</div>' +
                '<div class="score-num">AI 评分: ' + score.total + '/100</div>' +
                '<div class="score-comment">' + feedback + '</div>' +
              '</div>';
          }

          btn.disabled = false;
          btn.textContent = '重新评分';

          taskState[seq] = { type: 'text', data: text, score: score, done: true };
          autoMarkComplete(seq);
        }, 1500);
      });
    });

    // --- 提交文字答案（非AI评分类）---
    document.querySelectorAll('.submit-answer-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var seq = parseInt(btn.dataset.seq, 10);
        var textarea = document.querySelector('.answer-textarea[data-seq="' + seq + '"]');
        var resultBox = document.querySelector('.ai-score-result[data-seq="' + seq + '"]');
        if (!textarea) return;

        var text = textarea.value.trim();
        if (text.length < 2) {
          if (resultBox) resultBox.innerHTML = '<div class="score-feedback warn">写点内容再提交吧</div>';
          return;
        }

        btn.disabled = true;
        btn.textContent = '已提交';
        if (resultBox) resultBox.innerHTML = '<div class="score-feedback success">已保存你的回答（' + text.length + ' 字）</div>';

        taskState[seq] = { type: 'text', data: text, done: true };
        autoMarkComplete(seq);
      });
    });

    // --- 计数题提交 ---
    document.querySelectorAll('.submit-count-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var seq = parseInt(btn.dataset.seq, 10);
        var input = document.querySelector('.count-input[data-seq="' + seq + '"]');
        var resultBox = document.querySelector('.count-result[data-seq="' + seq + '"]');
        if (!input) return;

        var val = parseInt(input.value, 10);
        if (isNaN(val)) {
          if (resultBox) resultBox.innerHTML = '<span class="score-feedback warn">请输入数字</span>';
          return;
        }

        btn.disabled = true;
        btn.textContent = '已提交';
        if (resultBox) resultBox.innerHTML = '<span class="score-feedback success">已记录: ' + val + '（去和队友对比答案吧）</span>';

        taskState[seq] = { type: 'count', data: val, done: true };
        autoMarkComplete(seq);
      });
    });

    // --- 自动标记完成 ---
    function autoMarkComplete(seq) {
      var toggleBtn = document.querySelector('.task-toggle[data-seq="' + seq + '"]');
      if (toggleBtn && !toggleBtn.classList.contains('done')) {
        toggleBtn.classList.add('done');
        toggleBtn.textContent = '已完成 ✓';
      }
      completeTask(seq);
    }

    function autoUnmarkComplete(seq) {
      var toggleBtn = document.querySelector('.task-toggle[data-seq="' + seq + '"]');
      if (toggleBtn && toggleBtn.classList.contains('done')) {
        toggleBtn.classList.remove('done');
        toggleBtn.textContent = '标记完成';
      }
      uncompleteTask(seq);
    }
  }

  // === AI 评分逻辑（模拟）===
  function calculateAIScore(text, task) {
    var total = 0;
    var stars = 0;

    // 基础分：字数
    var lenScore = Math.min(30, Math.floor(text.length / 3));
    total += lenScore;

    // 丰富度：标点、修辞
    var punctCount = (text.match(/[，。！？、；：""''（）]/g) || []).length;
    var richScore = Math.min(20, punctCount * 4);
    total += richScore;

    // 关键词匹配（与任务相关）
    var keywords = [];
    if (task.poiName) keywords.push(task.poiName);
    if (task.prompt) {
      var matches = task.prompt.match(/[\u4e00-\u9fa5]{2,4}/g);
      if (matches) keywords = keywords.concat(matches.slice(0, 3));
    }
    var keywordHits = keywords.filter(function (k) { return text.indexOf(k) >= 0; }).length;
    var keywordScore = Math.min(25, keywordHits * 10);
    total += keywordScore;

    // 创意分：独特用词
    var uniqueWords = new Set(text.split(/[\s，。！？、；：""''（）]/).filter(function (w) { return w.length >= 2; }));
    var creativeScore = Math.min(25, Math.floor(uniqueWords.size * 2));
    total += creativeScore;

    total = Math.min(100, total);
    stars = Math.round(total / 20);

    return { total: total, stars: stars, lenScore: lenScore, richScore: richScore, keywordScore: keywordScore, creativeScore: creativeScore };
  }

  function generateFeedback(score, task) {
    if (score.total >= 85) return '太棒了！你的观察细腻、文字生动，充分展现了' + task.poiName + '的独特魅力。';
    if (score.total >= 65) return '不错！你抓住了' + task.poiName + '的精髓，如果能再多一些细节描写就更完美了。';
    if (score.total >= 45) return '还行，基本表达了你的感受。试着多用比喻和感官描写来丰富你的作品吧。';
    return '继续加油！多观察周围的环境，用更多具体的词语来描述你看到的一切。';
  }

  // === 探险模式：任务状态机 ===
  // 返回 'unlocked' | 'pending' | 'locked'
  function getTaskState(seq) {
    if (!explorationState.active || state.explorationMode === 'free') return 'unlocked';
    if (seq < explorationState.currentSeq) return 'unlocked';
    if (seq === explorationState.currentSeq) return 'pending';
    return 'locked';
  }

  // 应用探险状态到已渲染的任务卡片（不重渲染，保留交互数据）
  function applyExplorationStates() {
    if (!currentQuest) return;
    currentQuest.tasks.forEach(function (task) {
      var card = document.getElementById('task-' + task.seq);
      if (!card) return;
      var st = getTaskState(task.seq);
      // 先记录变化前的状态，再清除旧 class（仅对"新解锁"的任务播放动画）
      var wasLocked = card.classList.contains('locked');
      var wasPending = card.classList.contains('pending');
      var wasUnlocked = !wasLocked && !wasPending;

      card.classList.remove('locked', 'pending', 'unlocking');

      // 移除旧的覆盖层/徽章
      var oldLock = card.querySelector('.lock-overlay');
      if (oldLock) oldLock.remove();
      var oldBadge = card.querySelector('.pending-badge');
      if (oldBadge) oldBadge.remove();

      var detailBtn = card.querySelector('.task-detail');
      var body = card.querySelector('.body');

      if (st === 'locked') {
        card.classList.add('locked');
        var lockEl = document.createElement('div');
        lockEl.className = 'lock-overlay';
        lockEl.innerHTML = '<span class="lock-icon">🔒</span><span class="lock-text">到达此处解锁</span>';
        card.insertBefore(lockEl, card.firstChild);
        card.classList.remove('expanded');
        if (detailBtn) detailBtn.innerHTML = '展开 <span class="detail-arrow">▾</span>';
      } else if (st === 'pending') {
        card.classList.add('pending');
        var badge = document.createElement('div');
        badge.className = 'pending-badge';
        badge.innerHTML = '<span class="badge-icon">📍</span> 到达地图标记处解锁任务详情';
        if (body) body.appendChild(badge);
        card.classList.remove('expanded');
        if (detailBtn) detailBtn.innerHTML = '展开 <span class="detail-arrow">▾</span>';
      } else {
        // unlocked
        if (!wasUnlocked) {
          card.classList.add('unlocking');
          setTimeout(function () { card.classList.remove('unlocking'); }, 600);
        }
        card.classList.add('expanded');
        if (detailBtn) detailBtn.innerHTML = '收起 <span class="detail-arrow">▾</span>';
      }
    });

    // 更新地图激活标记
    if (explorationState.active && state.explorationMode !== 'free') {
      MapManager.setActiveMarker(explorationState.currentSeq);
    } else {
      MapManager.clearActiveMarker();
    }

    updateExplorationProgress();
  }

  // ============================================================
  //  AI 实时重新规划：偏离检测响应 + 路线重规划
  // ============================================================

  var deviationPending = null; // {lat, lng, task} 待处理的偏离

  // 已到达（已解锁）的任务数：seq 1..N 连续
  function getArrivedCount() {
    if (!currentQuest) return 0;
    var n = 0;
    for (var i = 0; i < currentQuest.tasks.length; i++) {
      var seq = currentQuest.tasks[i].seq;
      if (seq <= explorationState.currentSeq - 1) n = seq;
      else break;
    }
    return n;
  }

  // 开启/重置偏离检测，跟踪当前目标任务
  function restartDeviationWatch() {
    if (!explorationState.active || !currentQuest) {
      MapManager.stopDeviationWatch();
      return;
    }
    if (state.explorationMode === 'free') {
      MapManager.stopDeviationWatch();
      return;
    }
    var curTask = currentQuest.tasks[explorationState.currentSeq - 1];
    if (!curTask) {
      MapManager.stopDeviationWatch();
      return;
    }
    MapManager.startDeviationWatch(curTask, currentQuest.tasks, handleDeviation);
  }

  // 偏离回调：弹出对话框
  function handleDeviation(userLat, userLng, currentTask) {
    var dialog = document.getElementById('deviation-dialog');
    if (!dialog) return;
    // 避免重复弹窗
    if (dialog.style.display === 'flex') return;
    deviationPending = { lat: userLat, lng: userLng, task: currentTask };

    var msg = dialog.querySelector('.deviation-msg');
    if (msg && currentTask) {
      msg.textContent = '当前位置距离任务点「' + currentTask.poiName + '」已超过500米';
    }

    dialog.style.display = 'flex';
    // 触发淡入动画
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { dialog.classList.add('show'); });
    });
  }

  function hideDeviationDialog() {
    var dialog = document.getElementById('deviation-dialog');
    if (!dialog) return;
    dialog.classList.remove('show');
    setTimeout(function () { dialog.style.display = 'none'; }, 300);
    deviationPending = null;
  }

  function showRerouteLoading(show) {
    var overlay = document.getElementById('reroute-loading');
    if (!overlay) return;
    overlay.style.display = show ? 'flex' : 'none';
  }

  // 以用户当前位置为中心重新规划：保留已到达任务，替换后续任务
  function rerouteFromLocation(userLat, userLng, completedSeqs) {
    if (!currentQuest) return null;

    // 保留已到达任务（seq 1..completedSeqs）
    var completedTasks = currentQuest.tasks.filter(function (t) {
      return t.seq <= completedSeqs;
    });

    // 以用户当前位置为新中心构造参数
    var params = Object.assign({}, state, {
      customLat: userLat,
      customLng: userLng,
      customCityName: state.customCityName || currentQuest.meta.city || '当前位置附近'
    });

    // 重规划前先停止偏离检测，避免重渲染期间重复触发
    MapManager.stopDeviationWatch();

    var newQuest = QuestGenerator.reroute(params, completedTasks);
    currentQuest = newQuest;

    // 探险状态：已完成/已到达保留，当前指向第一个新任务
    explorationState.currentSeq = completedSeqs + 1;

    // 重渲染地图与任务卡片
    renderResult(currentQuest);
    applyExplorationStates();
    updateExplorationProgress();

    // 重启偏离检测，跟踪新的当前目标任务
    restartDeviationWatch();

    // 飞到新的当前任务并显示到达提示
    var curTask = currentQuest.tasks[explorationState.currentSeq - 1];
    if (curTask) {
      MapManager.setActiveMarker(curTask.seq);
      setTimeout(function () {
        MapManager.flyToMarker(curTask.seq);
        MapManager.showArrivalPrompt(curTask.seq, function () {
          unlockTask(curTask.seq);
        });
      }, 500);
    }

    return newQuest;
  }

  // 用户点击 "AI 重新规划"
  function performReroute() {
    if (!deviationPending || !currentQuest) {
      hideDeviationDialog();
      return;
    }
    var lat = deviationPending.lat;
    var lng = deviationPending.lng;
    hideDeviationDialog();

    // 保留已到达任务（含已完成），替换当前目标任务及之后
    var keepSeqs = getArrivedCount();

    showRerouteLoading(true);
    // 略作延迟以展示 "AI 正在重新规划" 动画
    setTimeout(function () {
      try {
        rerouteFromLocation(lat, lng, keepSeqs);
        showToast('AI 已为你重新规划路线，故事迎来了新的转折');
      } catch (e) {
        console.error('重新规划失败：', e);
        showToast('重新规划失败，请稍后重试');
        restartDeviationWatch();
      } finally {
        showRerouteLoading(false);
      }
    }, 1300);
  }

  // 开始探险
  function startExploration() {
    if (!currentQuest) {
      showToast('请先生成探险路线');
      return;
    }
    var total = currentQuest.tasks.length;
    explorationState.active = true;
    explorationState.currentSeq = 1;
    explorationState.completedSeqs = {};

    // 显示进度条
    var prog = document.getElementById('exploration-progress');
    if (prog) prog.style.display = 'block';
    var modeLabel = document.getElementById('exp-progress-mode');
    if (modeLabel) {
      var modeNames = { classic: '经典模式', challenge: '限时挑战', free: '自由探索' };
      modeLabel.textContent = modeNames[state.explorationMode] || '';
    }

    // 限时挑战：启动计时器
    if (state.explorationMode === 'challenge') {
      startChallengeTimer();
    } else {
      stopChallengeTimer();
    }

    // 自由探索：全部解锁，无需到达流程
    if (state.explorationMode === 'free') {
      applyExplorationStates();
      showToast('自由探索已开启，所有任务均可查看');
      // 隐藏到达提示（如有）
      MapManager.hideArrivalPrompt();
      return;
    }

    // 经典 / 限时挑战：锁定流程
    applyExplorationStates();

    // 飞到第一个任务并显示到达提示
    var firstTask = currentQuest.tasks[0];
    if (firstTask) {
      MapManager.flyToMarker(firstTask.seq);
      MapManager.showArrivalPrompt(firstTask.seq, function () {
        unlockTask(firstTask.seq);
      });
    }

    // 开启 AI 实时偏离检测（跟踪当前目标任务）
    restartDeviationWatch();
    showToast('已开启实时偏离检测，地图上的蓝点即你的位置');

    // 滚动到结果区域顶部
    var resultArea = document.getElementById('result-area');
    if (resultArea) resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // 解锁任务（到达此处回调）
  function unlockTask(seq) {
    if (!currentQuest) return;
    var total = currentQuest.tasks.length;

    // 隐藏当前到达提示
    MapManager.hideArrivalPrompt();

    // 当前任务转为已解锁
    explorationState.currentSeq = seq + 1;
    applyExplorationStates();

    // 如果还有下一个任务，飞过去并显示到达提示
    if (explorationState.currentSeq <= total) {
      var nextTask = currentQuest.tasks[explorationState.currentSeq - 1];
      if (nextTask) {
        // 重新指向新的目标任务，重置偏离检测窗口
        restartDeviationWatch();
        setTimeout(function () {
          MapManager.flyToMarker(nextTask.seq);
          MapManager.showArrivalPrompt(nextTask.seq, function () {
            unlockTask(nextTask.seq);
          });
        }, 600);
      }
    } else {
      // 全部到达
      MapManager.stopDeviationWatch();
      showToast('已到达所有任务地点，完成挑战即可通关');
    }

    updateExplorationProgress();
  }

  // 完成任务（标记完成）
  function completeTask(seq) {
    explorationState.completedSeqs[seq] = true;
    updateExplorationProgress();

    if (!currentQuest) return;
    var total = currentQuest.tasks.length;
    var doneCount = Object.keys(explorationState.completedSeqs).length;

    if (doneCount >= total && explorationState.active) {
      // 全部完成
      stopChallengeTimer();
      MapManager.stopDeviationWatch();
      showCelebration();
    } else if (explorationState.active) {
      // AI Agent 主动决策
      QuestAgent.onTaskCompleted(seq, currentQuest, state, {
        onReorder: function (decision, ctx) {
          // 执行任务重排
          var fromIdx = -1, toIdx = -1;
          currentQuest.tasks.forEach(function (t, i) {
            if (t.seq === decision.moveTaskFrom) fromIdx = i;
            if (t.seq === decision.moveTaskTo) toIdx = i;
          });
          if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
            // 交换任务顺序
            var tmp = currentQuest.tasks[fromIdx];
            currentQuest.tasks[fromIdx] = currentQuest.tasks[toIdx];
            currentQuest.tasks[toIdx] = tmp;
            // 重新编号
            currentQuest.tasks.forEach(function (t, i) { t.seq = i + 1; });
            // 更新当前任务指针
            explorationState.currentSeq = seq + 1;
            // 重新渲染任务卡片和地图
            renderTaskCards(currentQuest);
            MapManager.renderResultMap(currentQuest);
            // 飞到新任务位置
            setTimeout(function () {
              MapManager.flyToMarker(seq + 1);
              MapManager.showArrivalPrompt(seq + 1, function () {
                unlockTask(seq + 1);
              });
            }, 800);
          }
        },
        onSkip: function (decision, ctx) {
          // 跳过可选任务
          var skipSeq = decision.skipTaskSeq;
          var skipIdx = -1;
          currentQuest.tasks.forEach(function (t, i) {
            if (t.seq === skipSeq) skipIdx = i;
          });
          if (skipIdx >= 0) {
            // 标记为已跳过
            currentQuest.tasks[skipIdx].skipped = true;
            explorationState.completedSeqs[skipSeq] = true;
            explorationState.currentSeq = skipSeq + 1;
            updateExplorationProgress();
            // 解锁下一个
            unlockTask(skipSeq + 1);
          }
        },
        onNarrative: function (decision, ctx) {
          // 纯叙事，解锁下一个任务
          unlockTask(seq + 1);
        },
        onNoAction: function () {
          unlockTask(seq + 1);
        }
      });
    }
  }

  function uncompleteTask(seq) {
    delete explorationState.completedSeqs[seq];
    updateExplorationProgress();
  }

  // 更新探险进度条
  function updateExplorationProgress() {
    if (!currentQuest) return;
    var total = currentQuest.tasks.length;
    var progBar = document.getElementById('exp-progress-bar');
    var progLabel = document.getElementById('exp-progress-label');

    if (state.explorationMode === 'free') {
      // 自由探索：按完成数显示
      var doneCount = Object.keys(explorationState.completedSeqs).length;
      if (progLabel) progLabel.textContent = '已完成 ' + doneCount + '/' + total;
      if (progBar) progBar.style.width = (total > 0 ? (doneCount / total * 100) : 0) + '%';
    } else {
      // 经典/限时：按已到达数显示
      var reached = Math.min(explorationState.currentSeq - 1, total);
      if (progLabel) {
        if (reached >= total) {
          progLabel.textContent = '任务 ' + total + '/' + total + ' · 已全部到达';
        } else {
          progLabel.textContent = '任务 ' + explorationState.currentSeq + '/' + total;
        }
      }
      var pct = total > 0 ? (reached / total * 100) : 0;
      if (progBar) progBar.style.width = pct + '%';
    }
  }

  // 限时挑战计时器
  function startChallengeTimer() {
    stopChallengeTimer();
    if (!currentQuest) return;

    var timerBox = document.getElementById('challenge-timer');
    var timerVal = document.getElementById('timer-value');
    if (!timerBox || !timerVal) return;

    // 挑战时长：基于游戏时长配置（分钟转毫秒），最少 5 分钟
    var minutes = Math.max(5, state.duration || 30);
    explorationState.challengeDurationMs = minutes * 60 * 1000;
    explorationState.challengeStartTs = Date.now();

    timerBox.style.display = 'flex';
    timerBox.classList.remove('timeup');

    function tick() {
      var elapsed = Date.now() - explorationState.challengeStartTs;
      var remain = explorationState.challengeDurationMs - elapsed;
      if (remain <= 0) {
        remain = 0;
        timerVal.textContent = '00:00';
        timerBox.classList.add('timeup');
        stopChallengeTimer();
        showToast('时间到！挑战结束');
        return;
      }
      var mins = Math.floor(remain / 60000);
      var secs = Math.floor((remain % 60000) / 1000);
      timerVal.textContent =
        (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
    tick();
    explorationState.challengeTimerId = setInterval(tick, 1000);
  }

  function stopChallengeTimer() {
    if (explorationState.challengeTimerId) {
      clearInterval(explorationState.challengeTimerId);
      explorationState.challengeTimerId = null;
    }
    var timerBox = document.getElementById('challenge-timer');
    if (timerBox) timerBox.style.display = 'none';
  }

  // 庆祝横幅
  function showCelebration() {
    var banner = document.getElementById('celebration-banner');
    var text = document.getElementById('celebration-text');
    if (!banner || !currentQuest) return;

    var doneCount = Object.keys(explorationState.completedSeqs).length;
    if (text) {
      text.textContent = '你已完成全部 ' + doneCount + ' 个探险任务，《' +
        currentQuest.narrative.gameTitle + '》的故事因你而完整。';
    }
    banner.style.display = 'flex';
    banner.classList.add('show');
  }

  function closeCelebration() {
    var banner = document.getElementById('celebration-banner');
    if (banner) {
      banner.classList.remove('show');
      banner.style.display = 'none';
    }
  }

  // 分享探险
  function shareQuest() {
    if (!currentQuest) {
      showToast('请先生成探险路线');
      return;
    }
    var q = currentQuest;
    var doneCount = Object.keys(explorationState.completedSeqs).length;
    var total = q.tasks.length;
    var completion = explorationState.active ?
      ('已完成 ' + doneCount + '/' + total + ' 个任务') :
      '尚未开始探险';

    var lines = [];
    lines.push('【城市探险】《' + q.narrative.gameTitle + '》');
    lines.push('城市：' + q.meta.city);
    lines.push('主题：' + q.meta.theme + ' · 时长：' + q.meta.duration);
    lines.push('任务数：' + total + ' 个');
    lines.push('进度：' + completion);
    lines.push('');
    lines.push('任务清单：');
    q.tasks.forEach(function (t) {
      lines.push(t.seq + '. ' + t.taskIcon + ' ' + t.title + '（' + t.poiName + '）');
    });
    lines.push('');
    lines.push('—— 城市探险游戏生成器');

    var text = lines.join('\n');

    function fallbackCopy(str) {
      var ta = document.createElement('textarea');
      ta.value = str;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('已复制到剪贴板');
      }).catch(function () {
        fallbackCopy(text);
        showToast('已复制到剪贴板');
      });
    } else {
      fallbackCopy(text);
      showToast('已复制到剪贴板');
    }
  }

  // Toast 通知
  var toastTimer = null;
  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2500);
  }

  // === 导出 ===
  function exportPDF() {
    if (!currentQuest) return;
    var q = currentQuest;
    var win = window.open('', '_blank');
    win.document.write(generatePrintableHTML(q));
    win.document.close();
    setTimeout(function () { win.print(); }, 500);
  }

  function exportJSON() {
    if (!currentQuest) return;
    var blob = new Blob([JSON.stringify(currentQuest, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '城市探险-' + currentQuest.meta.city + '-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function generatePrintableHTML(q) {
    var tasksHTML = q.tasks.map(function (t) {
      return '<div style="margin-bottom:1.2rem;padding:1rem;border:1px solid #ddd;border-radius:8px;">' +
        '<h4 style="color:#c2691f;">任务 ' + t.seq + ': ' + t.title + '</h4>' +
        '<p><strong>地点:</strong> ' + t.poiName + '</p>' +
        '<p><strong>描述:</strong> ' + t.poiDesc + '</p>' +
        '<p><strong>任务:</strong> ' + t.prompt + '</p>' +
        '<p><strong>类型:</strong> ' + t.taskTypeName + ' | <strong>验证:</strong> ' + t.verify + '</p>' +
        '</div>';
    }).join('');

    var weatherStr = q.meta.weatherIcon + ' ' + q.meta.weather;
    if (q.meta.weatherTemp !== null) weatherStr += ' ' + q.meta.weatherTemp + '°C';

    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + q.narrative.gameTitle + ' - 探险指南</title>' +
      '<style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:2rem;color:#333;}h1{color:#c2691f;}' +
      '.meta{background:#f5f0e8;padding:1rem;border-radius:8px;margin:1rem 0;font-size:0.9rem;}' +
      '.intro{font-style:italic;color:#666;margin:1rem 0;}.ending{border-top:1px dashed #ccc;padding-top:1rem;margin-top:2rem;color:#999;}' +
      '@media print{.no-print{display:none;}}</style></head><body>' +
      '<h1>' + q.narrative.gameTitle + '</h1>' +
      '<div class="meta">' + q.meta.city + ' | ' + q.meta.theme + ' | ' + weatherStr +
      ' | ' + q.meta.timeSlot + ' | ' + q.meta.duration + ' | ' + q.narrative.totalTasks + ' 个任务<br>' +
      '生成时间: ' + q.meta.generatedAt + '</div>' +
      '<p class="intro">' + q.narrative.intro + '</p>' +
      '<h2>任务清单</h2>' + tasksHTML +
      '<p class="ending">' + q.narrative.ending + '</p>' +
      '<p style="text-align:center;color:#ccc;font-size:0.8rem;margin-top:3rem;">城市探险游戏生成器 · 探险指南</p>' +
      '<div class="no-print" style="text-align:center;margin-top:2rem;"><button onclick="window.print()" style="padding:0.6rem 2rem;font-size:1rem;cursor:pointer;">打印 / 保存为 PDF</button></div>' +
      '</body></html>';
  }

  return {
    init: init,
    onMapSelect: onMapSelect
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
