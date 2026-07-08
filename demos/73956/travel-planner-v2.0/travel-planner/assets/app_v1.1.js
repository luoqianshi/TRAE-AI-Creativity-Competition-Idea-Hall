/** 周末行 v1.1 - 3D立体出行规划主逻辑 */
(function() {
  'use strict';

  // ===================== 数据 =====================
  const CITY_COORDS = {
    '北京': [116.4074, 39.9042],
    '上海': [121.4737, 31.2304],
    '杭州': [120.1551, 30.2741],
    '西安': [108.9398, 34.3416],
    '成都': [104.0668, 30.5728],
    '广州': [113.2644, 23.1291],
    '深圳': [114.0579, 22.5431],
    '武汉': [114.3054, 30.5931],
    '南京': [118.7969, 32.0603],
    '重庆': [106.5516, 29.5630],
    '天津': [117.2009, 39.0842],
    '郑州': [113.6253, 34.7466],
    '长沙': [112.9388, 28.2282],
    '青岛': [120.3826, 36.0671],
    '厦门': [118.0894, 24.4798],
    '昆明': [102.8329, 24.8801],
    '贵阳': [106.6302, 26.6477],
    '济南': [117.1205, 36.6510],
    '福州': [119.2965, 26.0745],
    '合肥': [117.2272, 31.8206],
    '南昌': [115.8540, 28.6830],
    '石家庄': [114.5149, 38.0423],
    '太原': [112.5489, 37.8706],
    '沈阳': [123.4315, 41.8057],
    '长春': [125.3235, 43.8171],
    '哈尔滨': [126.5340, 45.8038],
    '兰州': [103.8343, 36.0611],
    '银川': [106.2309, 38.4872],
    '西宁': [101.7782, 36.6171],
    '乌鲁木齐': [87.6168, 43.8256],
    '拉萨': [91.1409, 29.6456],
    '南宁': [108.3661, 22.8172],
    '海口': [110.3492, 20.0174],
    '呼和浩特': [111.7492, 40.8426],
  };

  const ROUTES_DB = {
    '北京-上海': [
      { type: 'train', name: 'G1 复兴号', dep: '06:00', arr: '10:28', duration: '4小时28分', price: 553, badge: 'fastest', comfort: 5, value: 4 },
      { type: 'train', name: 'G3 复兴号', dep: '07:00', arr: '11:28', duration: '4小时28分', price: 553, badge: '', comfort: 5, value: 4 },
      { type: 'train', name: 'G101 高铁', dep: '07:30', arr: '13:05', duration: '5小时35分', price: 518, badge: 'cheapest', comfort: 4, value: 5 },
      { type: 'plane', name: 'MU5101', dep: '08:00', arr: '10:15', duration: '2小时15分', price: 680, badge: '', comfort: 4, value: 3 },
      { type: 'plane', name: 'CA1515', dep: '09:30', arr: '11:45', duration: '2小时15分', price: 720, badge: '', comfort: 4, value: 3 },
      { type: 'bus', name: '长途大巴', dep: '08:00', arr: '18:00', duration: '10小时', price: 280, badge: 'cheapest', comfort: 2, value: 3 },
    ],
    '北京-杭州': [
      { type: 'train', name: 'G31 复兴号', dep: '07:30', arr: '12:30', duration: '5小时', price: 580, badge: '', comfort: 5, value: 4 },
      { type: 'plane', name: 'MU5135', dep: '08:00', arr: '10:20', duration: '2小时20分', price: 650, badge: 'fastest', comfort: 4, value: 4 },
      { type: 'train', name: 'G33 高铁', dep: '09:00', arr: '14:30', duration: '5小时30分', price: 540, badge: 'cheapest', comfort: 4, value: 5 },
    ],
    '上海-杭州': [
      { type: 'train', name: 'G7501', dep: '06:45', arr: '07:45', duration: '1小时', price: 73, badge: 'fastest', comfort: 5, value: 5 },
      { type: 'train', name: 'G7503', dep: '07:15', arr: '08:15', duration: '1小时', price: 73, badge: '', comfort: 5, value: 5 },
      { type: 'bus', name: '城际大巴', dep: '08:00', arr: '11:00', duration: '3小时', price: 45, badge: 'cheapest', comfort: 3, value: 4 },
    ],
    '北京-西安': [
      { type: 'train', name: 'G87 复兴号', dep: '14:00', arr: '18:20', duration: '4小时20分', price: 515, badge: 'fastest', comfort: 5, value: 5 },
      { type: 'plane', name: 'MU2103', dep: '07:30', arr: '09:45', duration: '2小时15分', price: 620, badge: '', comfort: 4, value: 4 },
      { type: 'train', name: 'G89 高铁', dep: '15:00', arr: '19:45', duration: '4小时45分', price: 490, badge: 'cheapest', comfort: 4, value: 5 },
    ],
    '上海-成都': [
      { type: 'plane', name: 'MU5401', dep: '08:00', arr: '11:20', duration: '3小时20分', price: 890, badge: 'fastest', comfort: 4, value: 3 },
      { type: 'train', name: 'D952 动车', dep: '08:30', arr: '20:30', duration: '12小时', price: 606, badge: 'cheapest', comfort: 3, value: 4 },
    ],
    '北京-广州': [
      { type: 'train', name: 'G79 复兴号', dep: '08:00', arr: '16:30', duration: '8小时30分', price: 862, badge: '', comfort: 5, value: 4 },
      { type: 'plane', name: 'CZ3101', dep: '07:30', arr: '10:45', duration: '3小时15分', price: 950, badge: 'fastest', comfort: 4, value: 3 },
      { type: 'plane', name: 'MU5181', dep: '09:00', arr: '12:15', duration: '3小时15分', price: 880, badge: 'cheapest', comfort: 4, value: 4 },
    ],
    '上海-深圳': [
      { type: 'plane', name: 'ZH9506', dep: '08:00', arr: '10:30', duration: '2小时30分', price: 780, badge: 'fastest', comfort: 4, value: 4 },
      { type: 'train', name: 'G99 高铁', dep: '14:00', arr: '22:30', duration: '8小时30分', price: 680, badge: 'cheapest', comfort: 5, value: 5 },
    ],
  };

  const ATTRACTIONS_DB = {
    '上海': [
      { name: '外滩', location: '黄浦区', tags: ['夜景', '历史建筑'], img: 'assets/attr_shanghai_bund.jpg' },
      { name: '东方明珠', location: '浦东新区', tags: ['地标', '观光'], img: 'assets/attr_shanghai_pearl.jpg' },
      { name: '豫园', location: '黄浦区', tags: ['园林', '美食'], img: 'assets/attr_shanghai_yuyuan.jpg' },
      { name: '迪士尼乐园', location: '浦东新区', tags: ['亲子', '娱乐'], img: 'assets/attr_shanghai_disney.jpg' },
    ],
    '杭州': [
      { name: '西湖', location: '西湖区', tags: ['自然风光', '徒步'], img: 'assets/attr_hangzhou_westlake.jpg' },
      { name: '灵隐寺', location: '西湖区', tags: ['佛教', '古迹'], img: 'assets/attr_hangzhou_lingyin.jpg' },
      { name: '千岛湖', location: '淳安县', tags: ['湖景', '度假'], img: 'assets/attr_hangzhou_qiandao.jpg' },
      { name: '宋城', location: '西湖区', tags: ['演艺', '文化'], img: 'assets/attr_hangzhou_songcheng.jpg' },
    ],
    '北京': [
      { name: '故宫博物院', location: '东城区', tags: ['历史', '皇家'], img: 'assets/attr_beijing_forbidden.jpg' },
      { name: '长城', location: '延庆区', tags: ['世界遗产', '登山'], img: 'assets/attr_beijing_greatwall.jpg' },
      { name: '颐和园', location: '海淀区', tags: ['园林', '湖景'], img: 'assets/attr_beijing_summer.jpg' },
      { name: '天坛', location: '东城区', tags: ['祭祀', '建筑'], img: 'assets/attr_beijing_temple.jpg' },
    ],
    '西安': [
      { name: '兵马俑', location: '临潼区', tags: ['世界遗产', '历史'], img: 'assets/attr_xian_warriors.jpg' },
      { name: '大雁塔', location: '雁塔区', tags: ['佛教', '古迹'], img: 'assets/attr_xian_pagoda.jpg' },
      { name: '回民街', location: '莲湖区', tags: ['美食', '夜市'], img: 'assets/attr_xian_muslim.jpg' },
      { name: '古城墙', location: '碑林区', tags: ['骑行', '历史'], img: 'assets/attr_xian_wall.jpg' },
    ],
    '成都': [
      { name: '大熊猫基地', location: '成华区', tags: ['亲子', '动物'], img: 'assets/attr_chengdu_panda.jpg' },
      { name: '宽窄巷子', location: '青羊区', tags: ['美食', '老街'], img: 'assets/attr_chengdu_kuanzhai.jpg' },
      { name: '锦里', location: '武侯区', tags: ['夜景', '文化'], img: 'assets/attr_chengdu_jinli.jpg' },
      { name: '都江堰', location: '都江堰市', tags: ['水利', '自然'], img: 'assets/attr_chengdu_dujiangyan.jpg' },
    ],
  };

  const HOLIDAYS_2026 = [
    { name: '端午节', date: '2026-06-19', days: 3 },
    { name: '中秋节', date: '2026-09-25', days: 3 },
    { name: '国庆节', date: '2026-10-01', days: 7 },
    { name: '元旦', date: '2027-01-01', days: 3 },
    { name: '春节', date: '2027-02-17', days: 7 },
  ];

  // ===================== 工具函数 =====================
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function formatDate(d) {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function getNextWeekend() {
    const today = new Date();
    const day = today.getDay();
    const sat = new Date(today);
    sat.setDate(today.getDate() + (6 - day + 7) % 7 || 7);
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
    return [sat, sun];
  }

  function getNextHolidays(n) {
    const today = formatDate(new Date());
    return HOLIDAYS_2026.filter(h => h.date >= today).slice(0, n);
  }

  function getCityPair(from, to) {
    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;
    if (ROUTES_DB[key1]) return { key: key1, routes: ROUTES_DB[key1] };
    if (ROUTES_DB[key2]) return { key: key2, routes: ROUTES_DB[key2].map(r => ({...r, dep: r.arr, arr: r.dep})) };
    return null;
  }

  function randomRoutes(from, to) {
    const types = ['train', 'plane', 'bus'];
    const names = {
      train: ['G101高铁', 'G103复兴号', 'D701动车', 'K51快速'],
      plane: ['MU5101', 'CA1515', 'CZ3101', 'HU7601'],
      bus: ['长途大巴', '城际快线', '旅游专线']
    };
    const durations = { train: '4-6小时', plane: '2-3小时', bus: '8-12小时' };
    const prices = { train: [350,650], plane: [500,900], bus: [200,350] };
    const routes = [];
    for (let i = 0; i < 5; i++) {
      const t = types[Math.floor(Math.random()*types.length)];
      const price = Math.floor(prices[t][0] + Math.random()*(prices[t][1]-prices[t][0]));
      routes.push({
        type: t,
        name: names[t][Math.floor(Math.random()*names[t].length)],
        dep: `${6+Math.floor(Math.random()*12)}:${Math.floor(Math.random()*6)*10}`,
        arr: `${9+Math.floor(Math.random()*12)}:${Math.floor(Math.random()*6)*10}`,
        duration: durations[t],
        price: price,
        badge: i === 0 ? 'cheapest' : (i === 1 ? 'fastest' : ''),
        comfort: t === 'plane' ? 4 : (t === 'train' ? 5 : 2),
        value: t === 'train' ? 5 : (t === 'plane' ? 3 : 3)
      });
    }
    return routes.sort((a,b) => a.price - b.price);
  }

  function randomAttractions(city) {
    if (ATTRACTIONS_DB[city]) return ATTRACTIONS_DB[city];
    const pool = [
      { name: '古城街区', location: '市中心', tags: ['历史', '漫步'] },
      { name: '国家博物馆', location: '文化区', tags: ['艺术', '展览'] },
      { name: '山水公园', location: '郊区', tags: ['自然', '徒步'] },
      { name: '夜市美食街', location: '老城区', tags: ['美食', '夜景'] },
    ];
    return pool.map(a => ({...a, name: city + a.name})).slice(0, 4);
  }

  // ===================== 3D Map =====================
  let map3dChart = null;
  let isRotating = true;

  function init3DMap() {
    const container = $('#map3dContainer');
    if (!container || !window.echarts || !window.echarts.graphic) {
      container.innerHTML = '<p style="padding:40px;text-align:center;color:var(--muted)">3D地图加载中...</p>';
      return;
    }

    map3dChart = echarts.init(container);

    const typeColors = { train: '#3b6cf6', plane: '#f59e0b', bus: '#10b981' };
    const allRoutes = [];
    Object.keys(ROUTES_DB).forEach(key => {
      const [from, to] = key.split('-');
      const fc = CITY_COORDS[from], tc = CITY_COORDS[to];
      if (!fc || !tc) return;
      ROUTES_DB[key].forEach(r => {
        allRoutes.push({
          from: from, to: to,
          coords: [fc, tc],
          type: r.type,
          price: r.price,
          name: r.name
        });
      });
    });

    // 城市散点数据
    const cityData = Object.keys(CITY_COORDS).map(name => ({
      name: name,
      value: [...CITY_COORDS[name], Math.random() * 100 + 50]
    }));

    // 航线数据按类型分组
    const trainLines = allRoutes.filter(r => r.type === 'train').map(r => ({ coords: r.coords }));
    const planeLines = allRoutes.filter(r => r.type === 'plane').map(r => ({ coords: r.coords }));
    const busLines = allRoutes.filter(r => r.type === 'bus').map(r => ({ coords: r.coords }));

    const option = {
      backgroundColor: '#0b1021',
      geo3D: {
        map: 'china',
        shading: 'realistic',
        silent: true,
        realisticMaterial: {
          roughness: 0.8,
          metalness: 0.1
        },
        postEffect: {
          enable: true,
          bloom: { enable: true, intensity: 0.3 },
          SSAO: { enable: true, radius: 2, intensity: 1.2, quality: 'high' }
        },
        groundPlane: { show: false },
        light: {
          main: { intensity: 1.2, shadow: true, shadowQuality: 'high', alpha: 30, beta: 40 },
          ambient: { intensity: 0.4 }
        },
        viewControl: {
          autoRotate: isRotating,
          autoRotateSpeed: 3,
          distance: 90,
          minDistance: 50,
          maxDistance: 150,
          alpha: 40,
          beta: 10,
          panMouseButton: 'left',
          rotateMouseButton: 'left'
        },
        itemStyle: { color: '#1e3a5f', borderColor: '#2a5a8c', borderWidth: 1 },
        regionHeight: 0.8,
        emphasis: { label: { show: false } }
      },
      series: [
        {
          type: 'lines3D',
          coordinateSystem: 'geo3D',
          effect: { show: true, period: 3, trailWidth: 3, trailLength: 0.4, trailOpacity: 0.8, trailColor: typeColors.train },
          lineStyle: { color: typeColors.train, width: 2, opacity: 0.6 },
          blendMode: 'lighter',
          data: trainLines
        },
        {
          type: 'lines3D',
          coordinateSystem: 'geo3D',
          effect: { show: true, period: 2, trailWidth: 3, trailLength: 0.4, trailOpacity: 0.8, trailColor: typeColors.plane },
          lineStyle: { color: typeColors.plane, width: 2, opacity: 0.6 },
          blendMode: 'lighter',
          data: planeLines
        },
        {
          type: 'lines3D',
          coordinateSystem: 'geo3D',
          effect: { show: true, period: 4, trailWidth: 2, trailLength: 0.3, trailOpacity: 0.6, trailColor: typeColors.bus },
          lineStyle: { color: typeColors.bus, width: 1.5, opacity: 0.5 },
          blendMode: 'lighter',
          data: busLines
        },
        {
          type: 'scatter3D',
          coordinateSystem: 'geo3D',
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#fff', opacity: 0.9 },
          label: { show: true, formatter: '{b}', position: 'top', distance: 6, textStyle: { color: '#fff', fontSize: 11, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.4)', padding: [2,6], borderRadius: 4 } },
          data: cityData
        }
      ]
    };

    // 加载中国地图
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(r => r.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson);
        map3dChart.setOption(option);
      })
      .catch(() => {
        // 降级到2D地图
        container.innerHTML = '';
        init2DMapFallback(container, allRoutes, cityData, typeColors);
      });

    window.addEventListener('resize', () => map3dChart && map3dChart.resize());
  }

  function init2DMapFallback(container, allRoutes, cityData, typeColors) {
    map3dChart = echarts.init(container);
    const trainLines = allRoutes.filter(r => r.type === 'train').map(r => ({ coords: r.coords }));
    const planeLines = allRoutes.filter(r => r.type === 'plane').map(r => ({ coords: r.coords }));
    const busLines = allRoutes.filter(r => r.type === 'bus').map(r => ({ coords: r.coords }));

    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(r => r.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson);
        map3dChart.setOption({
          backgroundColor: '#0b1021',
          geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            label: { show: true, color: '#fff', fontSize: 10 },
            itemStyle: { areaColor: '#1e3a5f', borderColor: '#2a5a8c' },
            emphasis: { itemStyle: { areaColor: '#2a5a8c' } }
          },
          series: [
            {
              type: 'lines',
              coordinateSystem: 'geo',
              effect: { show: true, period: 3, trailWidth: 2, trailLength: 0.4, color: typeColors.train },
              lineStyle: { color: typeColors.train, width: 1, opacity: 0.6, curveness: 0.2 },
              data: trainLines
            },
            {
              type: 'lines',
              coordinateSystem: 'geo',
              effect: { show: true, period: 2, trailWidth: 2, trailLength: 0.4, color: typeColors.plane },
              lineStyle: { color: typeColors.plane, width: 1, opacity: 0.6, curveness: 0.2 },
              data: planeLines
            },
            {
              type: 'lines',
              coordinateSystem: 'geo',
              effect: { show: true, period: 4, trailWidth: 1, trailLength: 0.3, color: typeColors.bus },
              lineStyle: { color: typeColors.bus, width: 1, opacity: 0.5, curveness: 0.2 },
              data: busLines
            },
            {
              type: 'effectScatter',
              coordinateSystem: 'geo',
              symbolSize: 8,
              itemStyle: { color: '#fff' },
              label: { show: true, formatter: '{b}', position: 'top', color: '#fff', fontSize: 10 },
              data: cityData.map(d => ({ name: d.name, value: d.value }))
            }
          ]
        });
      });
  }

  function update3DMapView(view) {
    if (!map3dChart) return;
    const views = {
      china: { distance: 90, alpha: 40, beta: 10 },
      east: { distance: 60, alpha: 35, beta: 80 },
      north: { distance: 60, alpha: 35, beta: -10 },
      southwest: { distance: 65, alpha: 40, beta: -60 }
    };
    const v = views[view] || views.china;
    map3dChart.setOption({
      geo3D: { viewControl: { ...v, autoRotate: isRotating } }
    });
  }

  function toggleRotate() {
    isRotating = !isRotating;
    if (map3dChart) {
      map3dChart.setOption({ geo3D: { viewControl: { autoRotate: isRotating } } });
    }
    $('#btnRotate').classList.toggle('active', isRotating);
  }

  function resetView() {
    if (map3dChart) {
      map3dChart.setOption({
        geo3D: { viewControl: { distance: 90, alpha: 40, beta: 10, autoRotate: isRotating } }
      });
    }
  }

  // ===================== UI 渲染 =====================
  function renderQuickDates() {
    const container = $('#quickDates');
    const [sat, sun] = getNextWeekend();
    const holidays = getNextHolidays(3);
    let html = '';
    html += `<button class="date-chip active" data-date="${formatDate(sat)}">本周六 <span class="tag">周末</span></button>`;
    html += `<button class="date-chip" data-date="${formatDate(sun)}">本周日 <span class="tag">周末</span></button>`;
    holidays.forEach(h => {
      html += `<button class="date-chip" data-date="${h.date}">${h.name} <span class="tag">${h.days}天</span></button>`;
    });
    container.innerHTML = html;

    const depart = $('#departDate');
    const ret = $('#returnDate');
    if (depart) depart.value = formatDate(sat);
    if (ret) {
      const nextDay = new Date(sat); nextDay.setDate(sat.getDate()+1);
      ret.value = formatDate(nextDay);
    }

    container.querySelectorAll('.date-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const d = chip.dataset.date;
        if (depart) depart.value = d;
        if (ret) {
          const r = new Date(d); r.setDate(r.getDate()+2);
          ret.value = formatDate(r);
        }
      });
    });
  }

  function renderTicketCard(route, index) {
    const icons = { train: '&#128646;', plane: '&#9992;', bus: '&#128652;' };
    const iconClass = { train: 'icon-train', plane: 'icon-plane', bus: 'icon-bus' };
    const typeNames = { train: '高铁/动车', plane: '飞机', bus: '大巴' };
    const badgeHtml = route.badge ? `<span class="badge badge-${route.badge}">${route.badge === 'cheapest' ? '最低价' : '最快'}</span>` : '';
    return `
      <div class="ticket-card animate-in" style="animation-delay:${index*0.05}s">
        ${badgeHtml}
        <div class="ticket-header">
          <div class="transport-icon ${iconClass[route.type]}">${icons[route.type]}</div>
          <div class="info">
            <h3>${route.name}</h3>
            <div class="meta">${typeNames[route.type]}</div>
          </div>
        </div>
        <div class="ticket-route">
          <div class="route-point">
            <div class="time">${route.dep}</div>
            <div class="station">出发</div>
          </div>
          <div class="route-line">
            <div class="line"></div>
            <div class="duration">${route.duration}</div>
          </div>
          <div class="route-point">
            <div class="time">${route.arr}</div>
            <div class="station">到达</div>
          </div>
        </div>
        <div class="ticket-footer">
          <div class="price">&yen;${route.price}<span class="unit"> 起</span></div>
          <button class="book-btn">预订</button>
        </div>
      </div>
    `;
  }

  function renderResults(routes) {
    const grid = $('#resultsGrid');
    if (!routes || routes.length === 0) {
      grid.innerHTML = '<p style="color:var(--muted);padding:20px;">暂无该路线的数据，试试其他城市组合。</p>';
      return;
    }
    grid.innerHTML = routes.map((r, i) => renderTicketCard(r, i)).join('');

    const cheapest = Math.min(...routes.map(r => r.price));
    const fastest = routes.reduce((a,b) => {
      const ah = parseFloat(a.duration)||99, bh = parseFloat(b.duration)||99;
      return ah < bh ? a : b;
    });
    $('#insightRoutes').textContent = routes.length;
    $('#insightPrice').textContent = cheapest;
    $('#insightTime').textContent = parseFloat(fastest.duration) || 4.5;
  }

  function renderComparison(routes) {
    const tbody = $('#compareBody');
    if (!routes || routes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:20px;">暂无数据</td></tr>';
      return;
    }
    const cheapest = Math.min(...routes.map(r => r.price));
    const fastest = routes.reduce((a,b) => {
      const ah = parseFloat(a.duration)||99, bh = parseFloat(b.duration)||99;
      return ah < bh ? a : b;
    });
    const typeNames = { train: '高铁/动车', plane: '飞机', bus: '大巴' };
    const stars = n => '&#9733;'.repeat(n) + '&#9734;'.repeat(5-n);
    tbody.innerHTML = routes.map(r => {
      const isCheapest = r.price === cheapest;
      const isFastest = r === fastest;
      return `
        <tr>
          <td><strong>${typeNames[r.type]}</strong><br><span style="font-size:0.8rem;color:var(--muted)">${r.name}</span></td>
          <td>${r.dep}</td>
          <td>${r.arr}</td>
          <td class="${isFastest?'best':''}">${r.duration}</td>
          <td class="price-col ${isCheapest?'best':''}">&yen;${r.price}</td>
          <td>${stars(r.comfort)}</td>
          <td>${stars(r.value)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderAttractions(city) {
    const grid = $('#attractionsGrid');
    const list = randomAttractions(city);
    $('#insightSpots').textContent = list.length;
    grid.innerHTML = list.map((a, i) => `
      <div class="attraction-card animate-in" style="animation-delay:${i*0.05}s">
        <div class="attraction-img">
          <img src="${a.img || ''}" alt="${a.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'padding:20px;color:var(--muted);font-size:0.85rem;\\'>${a.name}</div>'">
        </div>
        <div class="attraction-body">
          <h4>${a.name}</h4>
          <div class="location">&#128205; ${a.location}</div>
          <div class="tags">${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
      </div>
    `).join('');
  }

  function renderRouteTimeline(start, end, stops, days) {
    const container = $('#routeTimeline');
    const cities = [start, ...stops, end];
    const dayPerCity = Math.max(1, Math.floor(days / cities.length));
    let html = '';
    cities.forEach((city, i) => {
      const isLast = i === cities.length - 1;
      html += `
        <div class="timeline-item">
          <div class="city">${city}</div>
          <div class="detail">${isLast ? '终点' : (i === 0 ? '起点' : '途经')}</div>
          ${!isLast ? `<span class="stay">停留约 ${dayPerCity} 天</span>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  }

  // ===================== 事件绑定 =====================
  function bindEvents() {
    $('#swapBtn').addEventListener('click', () => {
      const f = $('#fromCity'), t = $('#toCity');
      const tmp = f.value; f.value = t.value; t.value = tmp;
    });

    $('#searchBtn').addEventListener('click', () => {
      const from = $('#fromCity').value.trim();
      const to = $('#toCity').value.trim();
      if (!from || !to) { alert('请输入出发地和目的地'); return; }
      const data = getCityPair(from, to);
      const routes = data ? data.routes : randomRoutes(from, to);
      renderResults(routes);
      renderComparison(routes);
      renderAttractions(to);
      // 高亮3D地图上的路线
      highlightRouteOnMap(from, to);
    });

    $$('.filter-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        $$('.ticket-card').forEach(card => {
          const type = card.querySelector('.meta').textContent;
          const map = { '高铁/动车': 'train', '飞机': 'plane', '大巴': 'bus' };
          const cardType = Object.keys(map).find(k => type.includes(k));
          const t = map[cardType];
          card.style.display = (filter === 'all' || t === filter) ? '' : 'none';
        });
      });
    });

    // 3D地图控制
    $('#mapView').addEventListener('change', (e) => update3DMapView(e.target.value));
    $('#btnRotate').addEventListener('click', toggleRotate);
    $('#btnReset').addEventListener('click', resetView);

    // 路线规划
    let stopCount = 0;
    $('#addStopBtn').addEventListener('click', () => {
      if (stopCount >= 3) { alert('最多添加3个途经城市'); return; }
      const div = document.createElement('div');
      div.className = 'form-row';
      div.innerHTML = `<input type="text" class="stop-input" placeholder="途经城市 ${stopCount+1}"><button type="button" class="remove-stop" style="padding:0 12px;border:1px solid var(--rule);background:var(--bg2);border-radius:8px;cursor:pointer;color:var(--danger);">&#10005;</button>`;
      $('#stopsContainer').appendChild(div);
      stopCount++;
      div.querySelector('.remove-stop').addEventListener('click', () => { div.remove(); stopCount--; });
    });

    $('#planBtn').addEventListener('click', () => {
      const start = $('#planStart').value.trim();
      const end = $('#planEnd').value.trim();
      const stops = Array.from($$('.stop-input')).map(i => i.value.trim()).filter(Boolean);
      const days = parseInt($('#planDays').value, 10);
      if (!start || !end) { alert('请输入起点和终点'); return; }
      renderRouteTimeline(start, end, stops, days);
      // 在3D地图上展示规划路线
      showPlanRouteOnMap(start, end, stops);
    });

    // 导航高亮
    const navLinks = $$('.nav a');
    window.addEventListener('scroll', () => {
      const sections = ['search', 'map3d', 'planner', 'attractions', 'compare'];
      let current = sections[0];
      sections.forEach(id => {
        const el = $('#' + id);
        if (el && el.getBoundingClientRect().top <= 100) current = id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    });
  }

  function highlightRouteOnMap(from, to) {
    if (!map3dChart) return;
    const fc = CITY_COORDS[from], tc = CITY_COORDS[to];
    if (!fc || !tc) return;
    // 添加高亮路线
    const highlightLine = {
      type: 'lines3D',
      coordinateSystem: 'geo3D',
      effect: { show: true, period: 1.5, trailWidth: 6, trailLength: 0.5, trailOpacity: 1, trailColor: '#ff4757' },
      lineStyle: { color: '#ff4757', width: 4, opacity: 1 },
      blendMode: 'lighter',
      data: [{ coords: [fc, tc] }],
      zlevel: 10
    };
    // 获取当前option并追加
    const opt = map3dChart.getOption();
    if (opt.series) {
      // 移除之前的高亮
      opt.series = opt.series.filter(s => !s._highlight);
      highlightLine._highlight = true;
      opt.series.push(highlightLine);
      map3dChart.setOption(opt);
    }
  }

  function showPlanRouteOnMap(start, end, stops) {
    if (!map3dChart) return;
    const cities = [start, ...stops, end];
    const coords = [];
    for (let i = 0; i < cities.length - 1; i++) {
      const fc = CITY_COORDS[cities[i]], tc = CITY_COORDS[cities[i+1]];
      if (fc && tc) coords.push({ coords: [fc, tc] });
    }
    if (coords.length === 0) return;
    const opt = map3dChart.getOption();
    if (opt.series) {
      opt.series = opt.series.filter(s => !s._plan);
      const planLine = {
        type: 'lines3D',
        coordinateSystem: 'geo3D',
        effect: { show: true, period: 2, trailWidth: 5, trailLength: 0.4, trailOpacity: 0.9, trailColor: '#2ed573' },
        lineStyle: { color: '#2ed573', width: 3, opacity: 0.8 },
        blendMode: 'lighter',
        data: coords,
        _plan: true,
        zlevel: 10
      };
      opt.series.push(planLine);
      map3dChart.setOption(opt);
    }
  }

  // ===================== 初始化 =====================
  function init() {
    renderQuickDates();
    bindEvents();
    $('#searchBtn').click();
    // 延迟初始化3D地图，确保DOM就绪
    setTimeout(init3DMap, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
