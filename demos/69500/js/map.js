/**
 * 城市探险游戏生成器 - Leaflet 地图管理器
 * 管理配置面板的选址地图 + 结果面板的路线地图
 */
var MapManager = (function () {

  var inputMap = null;      // 配置面板地图
  var inputMarker = null;   // 选址标记
  var resultMap = null;       // 结果地图
  var resultMarkers = [];   // 结果 POI 标记
  var resultMarkerMap = {};  // 结果 POI 标记 (按 seq 索引)
  var resultRoute = null;    // 结果路线
  var activeMarkerSeq = null; // 探险模式当前激活标记 seq

  // 主题颜色
  var THEME_COLORS = {
    history: '#c2691f',
    food: '#e8593c',
    art: '#7c3aed',
    mystery: '#2d6e7e',
    nature: '#5b8c5a',
    culture: '#8a6d3b'
  };

  // === 初始化配置面板选址地图 ===
  function initInputMap(lat, lng, zoom) {
    lat = lat || 39.9163;
    lng = lng || 116.3972;
    zoom = zoom || 12;

    if (inputMap) {
      inputMap.setView([lat, lng], zoom);
      return;
    }

    inputMap = L.map('input-map', { zoomControl: true, attributionControl: false }).setView([lat, lng], zoom);

    // 使用高德地图瓦片（更符合中国用户习惯）
    var amapLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      crossOrigin: true
    });
    var osmFallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 18,
      crossOrigin: true
    });
    amapLayer.addTo(inputMap);

    // 瓦片加载失败计数，超过阈值切换到 OSM
    var tileErrors = 0;
    amapLayer.on('tileerror', function () {
      tileErrors++;
      if (tileErrors > 5) {
        inputMap.removeLayer(amapLayer);
        osmFallback.addTo(inputMap);
      }
    });

    // 添加全屏按钮
    addFullscreenButton();

    // 点击地图选址
    inputMap.on('click', function (e) {
      setLocationMarker(e.latlng.lat, e.latlng.lng);
      if (window.App && App.onMapSelect) {
        App.onMapSelect(e.latlng.lat, e.latlng.lng);
      }
    });

    // 默认放一个标记
    setLocationMarker(lat, lng);
  }

  // === 全屏按钮 ===
  function addFullscreenButton() {
    var mapContainer = document.getElementById('input-map');
    if (!mapContainer || mapContainer.querySelector('.map-fullscreen-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'map-fullscreen-btn';
    btn.innerHTML = '全屏';
    btn.addEventListener('click', toggleFullscreen);
    mapContainer.appendChild(btn);
  }

  function toggleFullscreen() {
    var mapContainer = document.getElementById('input-map');
    if (!mapContainer) return;
    var btn = mapContainer.querySelector('.map-fullscreen-btn');
    var searchBar = document.querySelector('.map-search-bar');

    if (mapContainer.classList.contains('map-fullscreen-active')) {
      // 退出全屏
      mapContainer.classList.remove('map-fullscreen-active');
      document.body.classList.remove('map-fullscreen-body');
      if (btn) btn.innerHTML = '全屏';
    } else {
      // 进入全屏
      mapContainer.classList.add('map-fullscreen-active');
      document.body.classList.add('map-fullscreen-body');
      if (btn) btn.innerHTML = '退出全屏';
    }

    // 延迟刷新地图尺寸
    setTimeout(function () {
      if (inputMap) inputMap.invalidateSize();
    }, 100);
  }

  // ESC 退出全屏
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var inputEl = document.getElementById('input-map');
      if (inputEl && inputEl.classList.contains('map-fullscreen-active')) {
        toggleFullscreen();
      }
      var resultEl = document.getElementById('result-map');
      if (resultEl && resultEl.classList.contains('map-fullscreen-active')) {
        toggleResultFullscreen();
      }
    }
  });

  // === 结果地图全屏 ===
  function addResultFullscreenButton() {
    var mapContainer = document.getElementById('result-map');
    if (!mapContainer || mapContainer.querySelector('.map-fullscreen-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'map-fullscreen-btn';
    btn.innerHTML = '全屏';
    btn.addEventListener('click', toggleResultFullscreen);
    mapContainer.appendChild(btn);
  }

  function toggleResultFullscreen() {
    var mapContainer = document.getElementById('result-map');
    if (!mapContainer) return;
    var btn = mapContainer.querySelector('.map-fullscreen-btn');

    if (mapContainer.classList.contains('map-fullscreen-active')) {
      mapContainer.classList.remove('map-fullscreen-active');
      document.body.classList.remove('map-fullscreen-body');
      if (btn) btn.innerHTML = '全屏';
    } else {
      mapContainer.classList.add('map-fullscreen-active');
      document.body.classList.add('map-fullscreen-body');
      if (btn) btn.innerHTML = '退出全屏';
    }

    setTimeout(function () {
      if (resultMap) resultMap.invalidateSize();
    }, 100);
  }

  // === 设置选址标记 ===
  function setLocationMarker(lat, lng) {
    if (inputMarker) {
      inputMarker.setLatLng([lat, lng]);
    } else {
      var icon = L.divIcon({
        className: 'custom-pin',
        html: '<div class="pin-icon">📍</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      inputMarker = L.marker([lat, lng], { icon: icon, draggable: true }).addTo(inputMap);

      inputMarker.on('dragend', function (e) {
        var pos = e.target.getLatLng();
        if (window.App && App.onMapSelect) {
          App.onMapSelect(pos.lat, pos.lng);
        }
      });
    }
  }

  // === 移动到指定位置 ===
  function flyTo(lat, lng, zoom) {
    if (!inputMap) return;
    inputMap.flyTo([lat, lng], zoom || 14, { duration: 1.2 });
    setLocationMarker(lat, lng);
  }

  // === 搜索结果标记管理 ===
  var searchMarkers = [];
  function clearSearchMarkers() {
    searchMarkers.forEach(function (m) { inputMap.removeLayer(m); });
    searchMarkers = [];
  }

  function showSearchMarkers(results, onSelectCallback) {
    clearSearchMarkers();

    // 隐藏默认选址标记
    if (inputMarker) inputMarker.setOpacity(0);

    var bounds = [];
    results.forEach(function (r, idx) {
      var num = idx + 1;
      var icon = L.divIcon({
        className: 'search-result-pin',
        html: '<div class="search-pin-inner"><span class="search-pin-num">' + num + '</span></div><div class="search-pin-label">' + r.name + '</div>',
        iconSize: [40, 52],
        iconAnchor: [20, 42]
      });
      var marker = L.marker([r.lat, r.lng], { icon: icon }).addTo(inputMap);
      marker.on('click', function () {
        selectSearchMarker(idx, results, onSelectCallback);
      });
      searchMarkers.push(marker);
      bounds.push([r.lat, r.lng]);
    });

    // 自适应视野到所有标记
    if (bounds.length > 1) {
      inputMap.fitBounds(bounds, { padding: [60, 60] });
    } else if (bounds.length === 1) {
      inputMap.flyTo(bounds[0], 14, { duration: 0.8 });
    }
  }

  function selectSearchMarker(idx, results, onSelectCallback) {
    var r = results[idx];
    // 清除搜索标记
    clearSearchMarkers();
    // 恢复默认标记
    if (inputMarker) {
      inputMarker.setOpacity(1);
      inputMarker.setLatLng([r.lat, r.lng]);
    } else {
      setLocationMarker(r.lat, r.lng);
    }
    inputMap.flyTo([r.lat, r.lng], 15, { duration: 0.8 });
    if (onSelectCallback) onSelectCallback(r);
  }

  // === 渲染结果路线地图（带动画）===
  function renderResultMap(quest) {
    var container = document.getElementById('result-map');
    if (!container) return;

    // 销毁旧地图
    if (resultMap) {
      resultMap.remove();
      resultMap = null;
      resultMarkers = [];
      resultMarkerMap = {};
      resultRoute = null;
      // 用户位置标记随地图销毁一并重置（引用已失效）
      userPositionMarker = null;
      userAccuracyCircle = null;
    }

    var tasks = quest.tasks;
    var center = quest.meta.center;

    resultMap = L.map('result-map', { zoomControl: true, attributionControl: false }).setView(center, 13);

    // 高德地图瓦片
    var amapResult = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      crossOrigin: true
    });
    var osmResultFallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 18,
      crossOrigin: true
    });
    amapResult.addTo(resultMap);

    var resultTileErrors = 0;
    amapResult.on('tileerror', function () {
      resultTileErrors++;
      if (resultTileErrors > 5) {
        resultMap.removeLayer(amapResult);
        osmResultFallback.addTo(resultMap);
      }
    });

    // 添加全屏按钮
    addResultFullscreenButton();

    var themeColor = THEME_COLORS[quest.meta.themeId] || '#f0a040';
    var latlngs = [];

    // 预创建所有标记（但不立即添加到地图）
    tasks.forEach(function (task) {
      latlngs.push([task.lat, task.lng]);

      var numIcon = L.divIcon({
        className: 'poi-pin',
        html: '<div class="poi-pin-wrap marker-animate">' +
              '<a class="poi-pin-inner" href="https://uri.amap.com/marker?position=' + task.lng + ',' + task.lat + '&name=' + encodeURIComponent(task.poiName) + '" target="_blank" rel="noopener" style="border-color:' + themeColor + ';background:' + themeColor + '20;" onclick="event.stopPropagation();">' +
                '<span style="color:' + themeColor + ';">' + task.seq + '</span>' +
              '</a>' +
              '<div class="poi-pin-label" style="color:' + themeColor + ';">' + task.poiName + '</div>' +
              '</div>',
        iconSize: [36, 52],
        iconAnchor: [18, 18]
      });

      var marker = L.marker([task.lat, task.lng], { icon: numIcon });

      // 生成外链
      var poiName = encodeURIComponent(task.poiName);
      var baikeUrl = 'https://baike.baidu.com/item/' + poiName;
      var amapUrl = 'https://uri.amap.com/marker?position=' + task.lng + ',' + task.lat + '&name=' + poiName;
      var searchUrl = 'https://www.baidu.com/s?wd=' + poiName + '+' + encodeURIComponent(quest.meta.city);

      var popupContent =
        '<div class="poi-popup">' +
          '<div class="poi-popup-tag" style="color:' + themeColor + ';border-color:' + themeColor + ';">任务 ' + task.seq + '</div>' +
          '<div class="poi-popup-title" style="color:' + themeColor + ';">' +
            task.taskIcon + ' ' + task.title +
          '</div>' +
          '<div class="poi-popup-name">' + task.poiName + '</div>' +
          '<div class="poi-popup-desc">' + task.poiDesc + '</div>' +
          '<div class="poi-popup-prompt">' + task.prompt + '</div>' +
          '<div class="poi-popup-chips">' +
            '<span class="chip type" style="background:' + themeColor + '20;color:' + themeColor + ';">' + task.taskTypeName + '</span>' +
            '<span class="chip verify">' + task.verify + '</span>' +
          '</div>' +
          '<div class="poi-popup-actions">' +
            '<button class="poi-popup-nav-btn" data-seq="' + task.seq + '" style="background:' + themeColor + ';">导航至此</button>' +
          '</div>' +
          '<div class="poi-popup-links">' +
            '<a href="' + baikeUrl + '" target="_blank" rel="noopener">百科介绍</a>' +
            '<a href="' + amapUrl + '" target="_blank" rel="noopener">高德导航</a>' +
            '<a href="' + searchUrl + '" target="_blank" rel="noopener">搜索更多</a>' +
          '</div>' +
        '</div>';

      marker.bindPopup(popupContent, { maxWidth: 200, minWidth: 0, autoPanPadding: [10, 10] });

      // "导航至此" 按钮：打开高德导航
      marker.on('popupopen', function () {
        var navBtn = document.querySelector('.poi-popup-nav-btn[data-seq="' + task.seq + '"]');
        if (navBtn) {
          navBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.open(amapUrl, '_blank', 'noopener');
          });
        }
      });

      resultMarkerMap[task.seq] = marker;
      resultMarkers.push(marker);
    });

    // 自动调整视野
    if (latlngs.length > 0) {
      resultMap.fitBounds(L.latLngBounds(latlngs).pad(0.2));
    }

    // 逐个添加标记（带掉落动画）
    tasks.forEach(function (task, idx) {
      setTimeout(function () {
        var marker = resultMarkerMap[task.seq];
        if (!marker || !resultMap) return;
        marker.addTo(resultMap);

        // 添加掉落动画
        var el = marker.getElement();
        if (el) {
          var wrap = el.querySelector('.poi-pin-wrap');
          if (wrap) wrap.classList.add('marker-animate');
        }

        // 最后一个标记添加后，绘制动画路线
        if (idx === tasks.length - 1) {
          setTimeout(function () {
            drawAnimatedRoute(latlngs, themeColor);
          }, 350);
        }
      }, idx * 280);
    });

    // 延迟修复尺寸
    setTimeout(function () { if (resultMap) resultMap.invalidateSize(); }, 200);
  }

  // === 动画绘制路线 ===
  function drawAnimatedRoute(latlngs, themeColor) {
    if (!resultMap || latlngs.length < 2) return;

    // 闭合路线：首尾相连
    var closedLatLngs = latlngs.slice();
    closedLatLngs.push(latlngs[0]);

    // 创建动画折线（初始只有第一个点）
    resultRoute = L.polyline([closedLatLngs[0]], {
      color: themeColor,
      weight: 3,
      opacity: 0.8,
      dashArray: '8 6'
    }).addTo(resultMap);

    // 逐点添加，形成"绘制"效果
    var idx = 1;
    function addNextPoint() {
      if (idx < closedLatLngs.length) {
        resultRoute.addLatLng(closedLatLngs[idx]);
        idx++;
        setTimeout(addNextPoint, 220);
      } else {
        // 路线完成 - 添加多边形填充
        if (latlngs.length >= 3) {
          L.polygon(latlngs, {
            color: themeColor,
            weight: 0,
            fillColor: themeColor,
            fillOpacity: 0.06,
            dashArray: null
          }).addTo(resultMap);
        }

        // 添加出发点/终点标记
        var startPoint = latlngs[0];
        var startIcon = L.divIcon({
          className: 'start-end-pin',
          html: '<div class="start-end-inner" style="border-color:' + themeColor + ';">' +
                '<span>起/终</span></div>',
          iconSize: [48, 20],
          iconAnchor: [24, -28]
        });
        L.marker(startPoint, { icon: startIcon, interactive: false, zIndexOffset: -100 }).addTo(resultMap);
      }
    }
    setTimeout(addNextPoint, 200);
  }

  // === 高亮指定标记 ===
  function highlightMarker(seq) {
    var marker = resultMarkerMap[seq];
    if (!marker) return;
    var el = marker.getElement();
    if (el) {
      var wrap = el.querySelector('.poi-pin-wrap');
      if (wrap) wrap.classList.add('marker-highlight');
    }
  }

  // === 取消高亮标记 ===
  function unhighlightMarker(seq) {
    var marker = resultMarkerMap[seq];
    if (!marker) return;
    var el = marker.getElement();
    if (el) {
      var wrap = el.querySelector('.poi-pin-wrap');
      if (wrap) wrap.classList.remove('marker-highlight');
    }
  }

  // === 飞行到指定标记 ===
  function flyToMarker(seq) {
    var marker = resultMarkerMap[seq];
    if (!marker || !resultMap) return;
    var latlng = marker.getLatLng();
    resultMap.flyTo([latlng.lat, latlng.lng], 16, { duration: 1.2 });
    setTimeout(function () { marker.openPopup(); }, 700);
  }

  // === 平移到指定标记 ===
  function panToMarker(seq) {
    var marker = resultMarkerMap[seq];
    if (!marker || !resultMap) return;
    var latlng = marker.getLatLng();
    resultMap.panTo([latlng.lat, latlng.lng], { animate: true, duration: 0.5 });
  }

  // === 探险模式：到达提示浮层 ===
  var arrivalMarker = null;
  function showArrivalPrompt(seq, callback) {
    hideArrivalPrompt();
    var marker = resultMarkerMap[seq];
    if (!marker || !resultMap) return;
    var latlng = marker.getLatLng();

    var icon = L.divIcon({
      className: 'arrival-prompt-pin',
      html: '<div class="arrival-prompt">' +
              '<button class="arrival-prompt-btn">到达此处</button>' +
              '<span class="arrival-prompt-arrow">▼</span>' +
            '</div>',
      iconSize: [120, 50],
      iconAnchor: [60, 50]
    });
    arrivalMarker = L.marker([latlng.lat, latlng.lng], {
      icon: icon,
      interactive: true,
      zIndexOffset: 1000
    }).addTo(resultMap);

    // 绑定点击（延迟以确保 DOM 已就绪）
    function bindArrivalBtn() {
      var el = arrivalMarker.getElement();
      if (!el) {
        setTimeout(bindArrivalBtn, 50);
        return;
      }
      var btn = el.querySelector('.arrival-prompt-btn');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (callback) callback();
        });
      }
    }
    setTimeout(bindArrivalBtn, 30);
  }

  function hideArrivalPrompt() {
    if (arrivalMarker && resultMap) {
      resultMap.removeLayer(arrivalMarker);
      arrivalMarker = null;
    }
  }

  // === 探险模式：激活标记脉冲 ===
  function setActiveMarker(seq) {
    clearActiveMarker();
    var marker = resultMarkerMap[seq];
    if (!marker) return;
    var el = marker.getElement();
    if (el) {
      var wrap = el.querySelector('.poi-pin-wrap');
      if (wrap) wrap.classList.add('marker-active');
    }
    // 记录当前激活 seq，便于重渲染后恢复
    activeMarkerSeq = seq;
  }

  function clearActiveMarker() {
    activeMarkerSeq = null;
    if (!resultMarkers) return;
    resultMarkers.forEach(function (m) {
      var el = m.getElement();
      if (el) {
        var wrap = el.querySelector('.poi-pin-wrap');
        if (wrap) wrap.classList.remove('marker-active');
      }
    });
  }

  // === 刷新地图尺寸 ===
  function invalidateSize() {
    if (inputMap) inputMap.invalidateSize();
    if (resultMap) resultMap.invalidateSize();
  }

  // ============================================================
  //  AI 实时重新规划：偏离检测 + 实时位置可视化
  // ============================================================

  // 偏离检测参数
  var DEVIATION_THRESHOLD = 500;          // 偏离阈值（米）
  var DEVIATION_WINDOW = 2 * 60 * 1000;    // 2 分钟观察窗口
  var DEVIATION_REARM = 400;               // 重新武装阈值（米）

  var deviationWatchId = null;             // watchPosition 句柄
  var deviationTimerId = null;             // 兜底定时器
  var userPositionMarker = null;           // 蓝点标记
  var userAccuracyCircle = null;           // 精度圆
  var lastKnownUserPos = null;             // 最近一次定位（跨 stop/start 保留）
  var deviationState = {
    distances: [],   // {ts, dist, lat, lng} 历史记录
    triggered: false // 是否已触发偏离（冷却中）
  };

  // Haversine 距离（米）
  function haversineMeters(lat1, lng1, lat2, lng2) {
    var R = 6371000;
    var toRad = function (d) { return d * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // 更新/创建用户实时位置蓝点 + 精度圆
  function updateUserPositionMarker(lat, lng, accuracy) {
    if (!resultMap) return;

    if (!userPositionMarker) {
      userPositionMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'user-location-pin',
          html: '<div class="user-location-dot"><span class="user-location-pulse"></span></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        }),
        interactive: false,
        zIndexOffset: 9000
      }).addTo(resultMap);
    } else {
      userPositionMarker.setLatLng([lat, lng]);
    }

    var acc = accuracy || 30;
    if (!userAccuracyCircle) {
      userAccuracyCircle = L.circle([lat, lng], {
        radius: acc,
        color: '#3db5d0',
        weight: 1,
        opacity: 0.6,
        fillColor: '#3db5d0',
        fillOpacity: 0.12
      }).addTo(resultMap);
    } else {
      userAccuracyCircle.setLatLng([lat, lng]);
      userAccuracyCircle.setRadius(acc);
    }
  }

  // 清除用户位置可视化
  function clearUserPositionMarker() {
    if (userPositionMarker && resultMap) {
      resultMap.removeLayer(userPositionMarker);
    }
    if (userAccuracyCircle && resultMap) {
      resultMap.removeLayer(userAccuracyCircle);
    }
    userPositionMarker = null;
    userAccuracyCircle = null;
  }

  // 开启偏离检测：跟踪用户位置，若远离当前任务 POI 超过 500 米且 2 分钟内未靠近则触发回调
  // 返回 stopWatch() 用于清理
  function startDeviationWatch(currentTask, allTasks, onDeviate) {
    stopDeviationWatch();
    if (!currentTask || !navigator.geolocation) return null;

    deviationState = { distances: [], triggered: false };

    // 若已有最近定位，立即在地图上还原蓝点
    if (lastKnownUserPos) {
      updateUserPositionMarker(lastKnownUserPos.lat, lastKnownUserPos.lng, lastKnownUserPos.acc);
    }

    function checkDeviation() {
      var now = Date.now();
      // 清理过期记录
      deviationState.distances = deviationState.distances.filter(function (r) {
        return now - r.ts <= DEVIATION_WINDOW + 10000;
      });
      if (deviationState.distances.length === 0) return;

      var latest = deviationState.distances[deviationState.distances.length - 1];

      // 已触发过：等用户重新靠近后再武装
      if (deviationState.triggered) {
        if (latest.dist < DEVIATION_REARM) deviationState.triggered = false;
        return;
      }

      // 距离未超阈值，不触发
      if (latest.dist <= DEVIATION_THRESHOLD) return;

      // 观察窗口需覆盖约 2 分钟
      var earliest = deviationState.distances[0];
      if (latest.ts - earliest.ts < DEVIATION_WINDOW - 10000) return;

      // 判定：2 分钟内未显著靠近目标
      // 若当前距离 >= 2 分钟前距离 - 50m（噪声容忍），即视为"未在靠近"，触发偏离
      if (latest.dist > earliest.dist - 50) {
        deviationState.triggered = true;
        if (onDeviate) onDeviate(latest.lat, latest.lng, currentTask);
      }
    }

    function onSuccess(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      var acc = pos.coords.accuracy;
      lastKnownUserPos = { lat: lat, lng: lng, acc: acc };
      updateUserPositionMarker(lat, lng, acc);

      var dist = haversineMeters(lat, lng, currentTask.lat, currentTask.lng);
      deviationState.distances.push({ ts: Date.now(), dist: dist, lat: lat, lng: lng });
      checkDeviation();
    }

    function onError(err) {
      // 权限被拒绝时优雅降级：停止监听并提示
      if (err && err.code === err.PERMISSION_DENIED) {
        console.warn('偏离检测：定位权限被拒绝，已暂停实时偏离监测。');
        if (window.App && typeof App.showToast === 'function') {
          App.showToast('未获得定位权限，实时偏离检测暂不可用');
        }
        stopDeviationWatch();
      } else {
        console.warn('偏离检测定位失败：', err && err.message);
      }
    }

    deviationWatchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    });

    // 兜底定时器：即使 watchPosition 未持续回调，也按窗口周期记录并判定
    deviationTimerId = setInterval(function () {
      if (lastKnownUserPos) {
        var d = haversineMeters(lastKnownUserPos.lat, lastKnownUserPos.lng, currentTask.lat, currentTask.lng);
        deviationState.distances.push({ ts: Date.now(), dist: d, lat: lastKnownUserPos.lat, lng: lastKnownUserPos.lng });
      }
      checkDeviation();
    }, 30000);

    return function stopWatch() {
      stopDeviationWatch();
    };
  }

  // 停止偏离检测并清理
  function stopDeviationWatch() {
    if (deviationWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(deviationWatchId);
      deviationWatchId = null;
    }
    if (deviationTimerId) {
      clearInterval(deviationTimerId);
      deviationTimerId = null;
    }
    clearUserPositionMarker();
    deviationState = { distances: [], triggered: false };
  }

  return {
    initInputMap: initInputMap,
    setLocationMarker: setLocationMarker,
    flyTo: flyTo,
    renderResultMap: renderResultMap,
    invalidateSize: invalidateSize,
    showSearchMarkers: showSearchMarkers,
    clearSearchMarkers: clearSearchMarkers,
    highlightMarker: highlightMarker,
    unhighlightMarker: unhighlightMarker,
    flyToMarker: flyToMarker,
    panToMarker: panToMarker,
    showArrivalPrompt: showArrivalPrompt,
    hideArrivalPrompt: hideArrivalPrompt,
    setActiveMarker: setActiveMarker,
    clearActiveMarker: clearActiveMarker,
    startDeviationWatch: startDeviationWatch,
    stopDeviationWatch: stopDeviationWatch
  };
})();
