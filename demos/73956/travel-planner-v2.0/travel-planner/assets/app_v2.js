/** 周末行 v2.0 - 沉浸式3D出行规划主逻辑 */
(function() {
  'use strict';

  // ===================== 城市坐标数据 =====================
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
    '大连': [121.6147, 38.9140],
    '苏州': [120.5853, 31.2989],
    '无锡': [120.3119, 31.4912],
    '宁波': [121.5499, 29.8684],
    '三亚': [109.5082, 18.2479],
    '桂林': [110.2993, 25.2742],
    '丽江': [100.2330, 26.8721],
    '大理': [100.2290, 25.6065],
    '张家界': [110.4792, 29.1170],
    '黄山': [118.3385, 30.1312],
  };

  const ROUTES_DB = {
    '北京-上海': [
      { type: 'train', name: 'G1 复兴号', dep: '06:00', arr: '10:28', duration: '4小时28分', price: 553, badge: 'fastest', comfort: 5, value: 4 },
      { type: 'train', name: 'G3 复兴号', dep: '07:00', arr: '11:28', duration: '4小时28分', price: 553, badge: '', comfort: 5, value: 4 },
      { type: 'train', name: 'G101 高铁', dep: '07:30', arr: '13:05', duration: '5小时35分', price: 518, badge: 'cheapest', comfort: 4, value: 5 },
      { type: 'plane', name: 'MU5101 东航', dep: '08:00', arr: '10:15', duration: '2小时15分', price: 680, badge: '', comfort: 4, value: 3 },
      { type: 'plane', name: 'CA1515 国航', dep: '09:30', arr: '11:45', duration: '2小时15分', price: 720, badge: '', comfort: 4, value: 3 },
      { type: 'bus', name: '长途客运', dep: '08:00', arr: '18:00', duration: '10小时', price: 280, badge: 'cheapest', comfort: 2, value: 3 },
    ],
    '北京-杭州': [
      { type: 'train', name: 'G31 复兴号', dep: '07:30', arr: '12:30', duration: '5小时', price: 580, badge: '', comfort: 5, value: 4 },
      { type: 'plane', name: 'MU5135 东航', dep: '08:00', arr: '10:20', duration: '2小时20分', price: 650, badge: 'fastest', comfort: 4, value: 4 },
      { type: 'train', name: 'G33 高铁', dep: '09:00', arr: '14:30', duration: '5小时30分', price: 540, badge: 'cheapest', comfort: 4, value: 5 },
    ],
    '上海-杭州': [
      { type: 'train', name: 'G7501', dep: '06:45', arr: '07:45', duration: '1小时', price: 73, badge: 'fastest', comfort: 5, value: 5 },
      { type: 'train', name: 'G7503', dep: '07:15', arr: '08:15', duration: '1小时', price: 73, badge: '', comfort: 5, value: 5 },
      { type: 'bus', name: '城际快线', dep: '08:00', arr: '11:00', duration: '3小时', price: 45, badge: 'cheapest', comfort: 3, value: 4 },
    ],
    '北京-西安': [
      { type: 'train', name: 'G87 复兴号', dep: '14:00', arr: '18:20', duration: '4小时20分', price: 515, badge: 'fastest', comfort: 5, value: 5 },
      { type: 'plane', name: 'MU2103 东航', dep: '07:30', arr: '09:45', duration: '2小时15分', price: 620, badge: '', comfort: 4, value: 4 },
      { type: 'train', name: 'G89 高铁', dep: '15:00', arr: '19:45', duration: '4小时45分', price: 490, badge: 'cheapest', comfort: 4, value: 5 },
    ],
    '上海-成都': [
      { type: 'plane', name: 'MU5401 东航', dep: '08:00', arr: '11:20', duration: '3小时20分', price: 890, badge: 'fastest', comfort: 4, value: 3 },
      { type: 'train', name: 'D952 动车', dep: '08:30', arr: '20:30', duration: '12小时', price: 606, badge: 'cheapest', comfort: 3, value: 4 },
    ],
    '北京-广州': [
      { type: 'train', name: 'G79 复兴号', dep: '08:00', arr: '16:30', duration: '8小时30分', price: 862, badge: '', comfort: 5, value: 4 },
      { type: 'plane', name: 'CZ3101 南航', dep: '07:30', arr: '10:45', duration: '3小时15分', price: 950, badge: 'fastest', comfort: 4, value: 3 },
      { type: 'plane', name: 'MU5181 东航', dep: '09:00', arr: '12:15', duration: '3小时15分', price: 880, badge: 'cheapest', comfort: 4, value: 4 },
    ],
    '上海-深圳': [
      { type: 'plane', name: 'ZH9506 深航', dep: '08:00', arr: '10:30', duration: '2小时30分', price: 780, badge: 'fastest', comfort: 4, value: 4 },
      { type: 'train', name: 'G99 高铁', dep: '14:00', arr: '22:30', duration: '8小时30分', price: 680, badge: 'cheapest', comfort: 5, value: 5 },
    ],
    '北京-成都': [
      { type: 'plane', name: 'CA4102 国航', dep: '07:30', arr: '10:30', duration: '3小时', price: 1050, badge: 'fastest', comfort: 4, value: 3 },
      { type: 'train', name: 'G89 高铁', dep: '08:00', arr: '17:00', duration: '9小时', price: 778, badge: 'cheapest', comfort: 4, value: 4 },
    ],
    '上海-厦门': [
      { type: 'plane', name: 'MU5665 东航', dep: '08:00', arr: '10:00', duration: '2小时', price: 520, badge: 'fastest', comfort: 4, value: 4 },
      { type: 'train', name: 'D3201 动车', dep: '07:30', arr: '14:00', duration: '6小时30分', price: 328, badge: 'cheapest', comfort: 4, value: 5 },
    ],
    '杭州-厦门': [
      { type: 'plane', name: 'MF8128 厦航', dep: '09:00', arr: '10:40', duration: '1小时40分', price: 450, badge: 'fastest', comfort: 4, value: 4 },
      { type: 'train', name: 'D3231 动车', dep: '08:00', arr: '13:30', duration: '5小时30分', price: 278, badge: 'cheapest', comfort: 4, value: 5 },
    ],
    '北京-青岛': [
      { type: 'train', name: 'G177 复兴号', dep: '07:30', arr: '11:30', duration: '4小时', price: 314, badge: 'fastest', comfort: 5, value: 5 },
      { type: 'plane', name: 'SC4655 山航', dep: '08:00', arr: '09:20', duration: '1小时20分', price: 580, badge: '', comfort: 4, value: 3 },
      { type: 'bus', name: '长途客运', dep: '07:00', arr: '14:00', duration: '7小时', price: 180, badge: 'cheapest', comfort: 2, value: 3 },
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
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

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
      plane: ['MU5101 东航', 'CA1515 国航', 'CZ3101 南航', 'HU7601 海航'],
      bus: ['长途客运', '城际快线', '旅游专线']
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

  // ===================== 3D Map (伪3D增强) =====================
  let map3dChart = null;
  let isRotating = true;

  function init3DMap() {
    const container = $('#map3dContainer');
    if (!container || !window.echarts) return;

    map3dChart = echarts.init(container);

    const typeColors = { train: '#60a5fa', plane: '#f59e0b', bus: '#10b981' };
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

    // 城市散点
    const cityData = Object.keys(CITY_COORDS).slice(0, 35).map(name => ({
      name: name,
      value: [...CITY_COORDS[name], Math.random() * 80 + 40]
    }));

    const trainLines = allRoutes.filter(r => r.type === 'train').map(r => ({ coords: r.coords }));
    const planeLines = allRoutes.filter(r => r.type === 'plane').map(r => ({ coords: r.coords }));
    const busLines = allRoutes.filter(r => r.type === 'bus').map(r => ({ coords: r.coords }));

    // 伪3D效果：使用2D地图 + 阴影 + 渐变 + 动态特效营造立体感
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(96, 165, 250, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#e0e7ff' },
        padding: [10, 14],
        borderRadius: 8
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.15,
        scaleLimit: { min: 0.8, max: 5 },
        label: {
          show: true,
          color: '#94a3b8',
          fontSize: 10,
          fontWeight: 500
        },
        itemStyle: {
          areaColor: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.8,
            colorStops: [
              { offset: 0, color: '#1e3a5f' },
              { offset: 0.5, color: '#162d4a' },
              { offset: 1, color: '#0f1e36' }
            ]
          },
          borderColor: 'rgba(96, 165, 250, 0.5)',
          borderWidth: 1.2,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowOffsetY: 8
        },
        emphasis: {
          itemStyle: {
            areaColor: '#2a4a7a',
            borderColor: '#60a5fa',
            borderWidth: 2,
            shadowColor: 'rgba(96, 165, 250, 0.6)',
            shadowBlur: 30
          },
          label: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
        },
        select: {
          itemStyle: { areaColor: '#3b5998' },
          label: { color: '#fff' }
        }
      },
      series: [
        // 高铁线路
        {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          effect: {
            show: true,
            period: 4,
            trailWidth: 3,
            trailLength: 0.35,
            trailOpacity: 0.8,
            color: typeColors.train,
            symbol: 'arrow',
            symbolSize: 8
          },
          lineStyle: {
            color: typeColors.train,
            width: 1.5,
            opacity: 0.6,
            curveness: 0.25,
            shadowColor: typeColors.train,
            shadowBlur: 8
          },
          data: trainLines
        },
        // 航空航线
        {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 3,
          effect: {
            show: true,
            period: 3,
            trailWidth: 3.5,
            trailLength: 0.4,
            trailOpacity: 0.9,
            color: typeColors.plane,
            symbol: 'arrow',
            symbolSize: 9
          },
          lineStyle: {
            color: typeColors.plane,
            width: 1.8,
            opacity: 0.7,
            curveness: 0.35,
            shadowColor: typeColors.plane,
            shadowBlur: 10
          },
          data: planeLines
        },
        // 公路客运
        {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 1,
          effect: {
            show: true,
            period: 6,
            trailWidth: 2,
            trailLength: 0.25,
            trailOpacity: 0.6,
            color: typeColors.bus,
            symbol: 'arrow',
            symbolSize: 6
          },
          lineStyle: {
            color: typeColors.bus,
            width: 1,
            opacity: 0.5,
            curveness: 0.15,
            shadowColor: typeColors.bus,
            shadowBlur: 5
          },
          data: busLines
        },
        // 城市点 - 底层光晕
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 4,
          symbolSize: 18,
          itemStyle: {
            color: 'rgba(96, 165, 250, 0.15)',
            shadowColor: 'rgba(96, 165, 250, 0.8)',
            shadowBlur: 20
          },
          data: cityData.map(d => ({ name: d.name, value: d.value }))
        },
        // 城市点 - 核心
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 5,
          symbolSize: 7,
          rippleEffect: {
            period: 3,
            scale: 3,
            brushType: 'stroke'
          },
          itemStyle: {
            color: '#fff',
            shadowColor: '#60a5fa',
            shadowBlur: 12
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            distance: 6,
            color: '#e0e7ff',
            fontSize: 11,
            fontWeight: 600,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            padding: [3, 7],
            borderRadius: 4,
            borderColor: 'rgba(96, 165, 250, 0.25)',
            borderWidth: 1
          },
          data: cityData.map(d => ({ name: d.name, value: d.value }))
        }
      ]
    };

    // 加载中国地图GeoJSON - 多源重试
    const geoSources = [
      'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
      'https://cdn.jsdelivr.net/gh/apache/echarts@5.4.3/test/data/map/json/china.json',
    ];

    function tryLoadGeoJson(index) {
      if (index >= geoSources.length) {
        console.warn('所有地图数据源加载失败，使用Canvas降级方案');
        initCanvasMapFallback(container, allRoutes, cityData, typeColors);
        return;
      }
      fetch(geoSources[index])
        .then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(geoJson => {
          echarts.registerMap('china', geoJson);
          map3dChart.setOption(option);
        })
        .catch(err => {
          console.warn('地图源 ' + geoSources[index] + ' 加载失败，尝试下一个:', err);
          tryLoadGeoJson(index + 1);
        });
    }

    tryLoadGeoJson(0);

    window.addEventListener('resize', () => map3dChart && map3dChart.resize());

    // 点击城市事件
    map3dChart.on('click', function(params) {
      if (params.seriesType === 'effectScatter' && params.name) {
        const toCity = params.name;
        const fromCity = $('#fromCity').value.trim() || '北京';
        if (toCity !== fromCity) {
          $('#toCity').value = toCity;
          $('#searchBtn').click();
          document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
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
          backgroundColor: 'transparent',
          geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            label: { show: true, color: '#94a3b8', fontSize: 10 },
            itemStyle: {
              areaColor: '#1a2a4a',
              borderColor: '#3b5998',
              borderWidth: 0.5
            },
            emphasis: {
              itemStyle: { areaColor: '#2a4a7a' },
              label: { color: '#fff' }
            }
          },
          series: [
            {
              type: 'lines',
              coordinateSystem: 'geo',
              effect: { show: true, period: 3, trailWidth: 2, trailLength: 0.4, color: typeColors.train },
              lineStyle: { color: typeColors.train, width: 1, opacity: 0.6, curveness: 0.25 },
              data: trainLines
            },
            {
              type: 'lines',
              coordinateSystem: 'geo',
              effect: { show: true, period: 2, trailWidth: 2, trailLength: 0.4, color: typeColors.plane },
              lineStyle: { color: typeColors.plane, width: 1, opacity: 0.6, curveness: 0.25 },
              data: planeLines
            },
            {
              type: 'lines',
              coordinateSystem: 'geo',
              effect: { show: true, period: 4, trailWidth: 1, trailLength: 0.3, color: typeColors.bus },
              lineStyle: { color: typeColors.bus, width: 1, opacity: 0.5, curveness: 0.25 },
              data: busLines
            },
            {
              type: 'effectScatter',
              coordinateSystem: 'geo',
              symbolSize: 7,
              itemStyle: { color: '#fff', shadowBlur: 10, shadowColor: '#60a5fa' },
              label: { show: true, formatter: '{b}', position: 'right', color: '#cbd5e1', fontSize: 10 },
              data: cityData.map(d => ({ name: d.name, value: d.value }))
            }
          ]
        });
      });
  }

  function initCanvasMapFallback(container, allRoutes, cityData, typeColors) {
    // 纯Canvas绘制的简化地图作为最终降级方案
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = container.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };

    const W = () => container.clientWidth;
    const H = () => container.clientHeight;

    // 将经纬度转换为画布坐标
    function proj(lon, lat) {
      const x = (lon - 73) / 65 * W();
      const y = (54 - lat) / 35 * H();
      return [x, y];
    }

    let animTime = 0;
    const particles = [];

    // 初始化粒子
    allRoutes.forEach((r, ri) => {
      const [c1, c2] = r.coords;
      const [x1, y1] = proj(c1[0], c1[1]);
      const [x2, y2] = proj(c2[0], c2[1]);
      const count = r.type === 'plane' ? 3 : (r.type === 'train' ? 2 : 1);
      for (let i = 0; i < count; i++) {
        particles.push({
          x1, y1, x2, y2,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
          color: typeColors[r.type],
          size: r.type === 'plane' ? 4 : 3
        });
      }
    });

    function draw() {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // 绘制简化的中国轮廓（示意性）
      ctx.save();
      ctx.fillStyle = 'rgba(26, 42, 74, 0.6)';
      ctx.strokeStyle = 'rgba(59, 89, 152, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // 简化的中国边界点
      const outline = [
        [75, 40], [80, 45], [88, 48], [95, 50], [105, 53], [115, 50], [122, 45],
        [125, 40], [123, 35], [120, 30], [117, 25], [112, 22], [108, 20], [104, 22],
        [100, 25], [98, 30], [95, 35], [90, 38], [85, 38], [80, 36], [76, 38]
      ];
      outline.forEach((p, i) => {
        const [x, y] = proj(p[0], p[1]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 绘制路线
      allRoutes.forEach(r => {
        const [c1, c2] = r.coords;
        const [x1, y1] = proj(c1[0], c1[1]);
        const [x2, y2] = proj(c2[0], c2[1]);
        ctx.save();
        ctx.strokeStyle = typeColors[r.type] + '50';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        // 贝塞尔曲线
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 40;
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
        ctx.restore();
      });

      // 绘制移动粒子
      particles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const t = p.progress;
        const midX = (p.x1 + p.x2) / 2;
        const midY = (p.y1 + p.y2) / 2 - 40;
        const x = (1-t)*(1-t)*p.x1 + 2*(1-t)*t*midX + t*t*p.x2;
        const y = (1-t)*(1-t)*p.y1 + 2*(1-t)*t*midY + t*t*p.y2;
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 绘制城市点
      cityData.forEach(c => {
        const [lon, lat] = [c.value[0], c.value[1]];
        const [x, y] = proj(lon, lat);
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#e0e7ff';
        ctx.font = '10px sans-serif';
        ctx.fillText(c.name, x + 8, y + 4);
      });

      // 提示文字
      ctx.fillStyle = 'rgba(136, 146, 176, 0.6)';
      ctx.font = '12px sans-serif';
      ctx.fillText('3D地图加载中，当前为简化示意模式', 16, 24);

      animTime++;
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
  }

  function update3DMapView(view) {
    if (!map3dChart) return;
    const views = {
      china: { zoom: 1.15, center: [104, 35] },
      east: { zoom: 2.5, center: [119, 31] },
      north: { zoom: 2.2, center: [116, 39] },
      south: { zoom: 2.2, center: [113, 24] },
      southwest: { zoom: 2.0, center: [105, 28] },
      northwest: { zoom: 1.8, center: [100, 38] }
    };
    const v = views[view] || views.china;
    map3dChart.setOption({
      geo: { ...v }
    });
  }

  function toggleRotate() {
    isRotating = !isRotating;
    $('#btnRotate').classList.toggle('active', isRotating);
    // 2D地图不支持自动旋转，用呼吸缩放效果代替
    if (map3dChart) {
      if (isRotating) {
        startBreathingEffect();
      } else {
        stopBreathingEffect();
      }
    }
  }

  let breathingTimer = null;
  function startBreathingEffect() {
    if (breathingTimer) return;
    let t = 0;
    breathingTimer = setInterval(() => {
      if (!map3dChart) return;
      t += 0.02;
      const scale = 1 + Math.sin(t) * 0.03;
      try {
        const opt = map3dChart.getOption();
        if (opt && opt.geo && opt.geo[0]) {
          const baseZoom = 1.15;
          map3dChart.setOption({ geo: { zoom: baseZoom * scale } });
        }
      } catch(e) {}
    }, 50);
  }

  function stopBreathingEffect() {
    if (breathingTimer) {
      clearInterval(breathingTimer);
      breathingTimer = null;
    }
  }

  function resetView() {
    if (map3dChart) {
      map3dChart.setOption({
        geo: { zoom: 1.15, center: [104, 35] }
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
      <div class="ticket-card glass animate-in" style="animation-delay:${index*0.06}s">
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
          <button class="book-btn">立即预订</button>
        </div>
      </div>
    `;
  }

  function renderResults(routes) {
    const grid = $('#resultsGrid');
    if (!routes || routes.length === 0) {
      grid.innerHTML = '<p style="color:var(--muted);padding:40px;text-align:center;">暂无该路线的数据，试试其他城市组合。</p>';
      return;
    }
    grid.innerHTML = routes.map((r, i) => renderTicketCard(r, i)).join('');

    const cheapest = Math.min(...routes.map(r => r.price));
    const fastest = routes.reduce((a,b) => {
      const ah = parseFloat(a.duration)||99, bh = parseFloat(b.duration)||99;
      return ah < bh ? a : b;
    });
    const ir = $('#insightRoutes'); if (ir) ir.textContent = routes.length;
    const ip = $('#insightPrice'); if (ip) ip.textContent = cheapest;
    const it = $('#insightTime'); if (it) it.textContent = parseFloat(fastest.duration) || 4.5;
  }

  function renderComparison(routes) {
    const tbody = $('#compareBody');
    if (!routes || routes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px;">暂无数据</td></tr>';
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
    const is_el = $('#insightSpots'); if (is_el) is_el.textContent = list.length;
    grid.innerHTML = list.map((a, i) => `
      <div class="attraction-card animate-in" style="animation-delay:${i*0.08}s">
        <div class="attraction-img">
          <img src="${a.img || ''}" alt="${a.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'padding:20px;color:var(--muted);font-size:0.9rem;\\'>${a.name}</div>'">
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
        <div class="timeline-item animate-in" style="animation-delay:${i*0.1}s">
          <div class="city">${city}</div>
          <div class="detail">${isLast ? '终点城市' : (i === 0 ? '出发城市' : '途经城市')}</div>
          ${!isLast ? `<span class="stay">停留 ${dayPerCity} 天</span>` : ''}
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
      highlightRouteOnMap(from, to);
    });

    // 交通方式筛选
    $$('.filter-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.section-title');
        if (!parent) return;
        const filter = btn.dataset.filter;
        if (!filter) return;

        parent.querySelectorAll('.filter-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cards = $$('.ticket-card');
        cards.forEach(card => {
          const type = card.querySelector('.meta').textContent;
          const map = { '高铁/动车': 'train', '飞机': 'plane', '大巴': 'bus' };
          const cardType = Object.keys(map).find(k => type.includes(k));
          const t = map[cardType];
          card.style.display = (filter === 'all' || t === filter) ? '' : 'none';
        });
      });
    });

    // 3D地图控制
    $('#mapView').addEventListener('change', e => update3DMapView(e.target.value));
    $('#btnRotate').addEventListener('click', toggleRotate);
    $('#btnReset').addEventListener('click', resetView);

    // 路线规划
    let stopCount = 0;
    $('#addStopBtn').addEventListener('click', () => {
      if (stopCount >= 3) { alert('最多添加3个途经城市'); return; }
      const div = document.createElement('div');
      div.className = 'form-row';
      div.innerHTML = `<input type="text" class="stop-input" placeholder="途经城市 ${stopCount+1}"><button type="button" class="remove-stop" style="padding:0 14px;border:1px solid var(--glass-border);background:rgba(30,41,66,0.6);border-radius:10px;cursor:pointer;color:#ef4444;font-size:1.1rem;">&#10005;</button>`;
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
      showPlanRouteOnMap(start, end, stops);
    });

    // 导航高亮
    const navLinks = $$('.nav a');
    window.addEventListener('scroll', () => {
      const sections = ['search', 'map3d', 'planner', 'attractions', 'compare'];
      let current = sections[0];
      sections.forEach(id => {
        const el = $('#' + id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
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

    const highlightLine = {
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 10,
      effect: {
        show: true,
        period: 1.5,
        trailWidth: 8,
        trailLength: 0.5,
        trailOpacity: 1,
        color: '#f472b6',
        symbol: 'arrow',
        symbolSize: 12
      },
      lineStyle: {
        color: '#ec4899',
        width: 4,
        opacity: 1,
        curveness: 0.3,
        shadowColor: '#ec4899',
        shadowBlur: 20
      },
      data: [{ coords: [fc, tc] }],
      _highlight: true
    };

    try {
      const opt = map3dChart.getOption();
      if (opt.series) {
        opt.series = opt.series.filter(s => !s._highlight);
        opt.series.push(highlightLine);
        map3dChart.setOption(opt);

        // 调整视角聚焦到路线
        const midLon = (fc[0] + tc[0]) / 2;
        const midLat = (fc[1] + tc[1]) / 2;
        const dist = Math.abs(fc[0] - tc[0]) + Math.abs(fc[1] - tc[1]);
        const zoom = Math.max(1.5, Math.min(4, 50 / dist * 1.15));
        map3dChart.setOption({
          geo: { center: [midLon, midLat], zoom: zoom }
        });
        stopBreathingEffect();
        isRotating = false;
        $('#btnRotate').classList.remove('active');
      }
    } catch(e) {
      console.warn('高亮路线失败', e);
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

    try {
      const opt = map3dChart.getOption();
      if (opt.series) {
        opt.series = opt.series.filter(s => !s._plan);
        const planLine = {
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 9,
          effect: {
            show: true,
            period: 2.5,
            trailWidth: 6,
            trailLength: 0.45,
            trailOpacity: 0.9,
            color: '#34d399',
            symbol: 'arrow',
            symbolSize: 10
          },
          lineStyle: {
            color: '#10b981',
            width: 3,
            opacity: 0.9,
            curveness: 0.25,
            shadowColor: '#10b981',
            shadowBlur: 15
          },
          data: coords,
          _plan: true
        };
        opt.series.push(planLine);
        map3dChart.setOption(opt);
      }
    } catch(e) {
      console.warn('规划路线显示失败', e);
    }
  }

  // ===================== 初始化 =====================
  function init() {
    renderQuickDates();
    bindEvents();
    $('#searchBtn').click();
    setTimeout(init3DMap, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
