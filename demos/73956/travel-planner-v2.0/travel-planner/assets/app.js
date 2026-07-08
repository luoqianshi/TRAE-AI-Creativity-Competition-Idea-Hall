/** 周末行 - 出行规划主逻辑 */
(function() {
  'use strict';

  // ===================== 数据 =====================
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
      { name: '摩天轮乐园', location: '滨江区', tags: ['亲子', '娱乐'] },
      { name: '寺庙古刹', location: '山区', tags: ['佛教', '静谧'] },
    ];
    return pool.map(a => ({...a, name: city + a.name})).slice(0, 4);
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

    // 默认选中本周六
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

    // 更新统计
    const cheapest = Math.min(...routes.map(r => r.price));
    const fastest = routes.reduce((a,b) => {
      const ah = parseFloat(a.duration), bh = parseFloat(b.duration);
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
    // 交换城市
    $('#swapBtn').addEventListener('click', () => {
      const f = $('#fromCity'), t = $('#toCity');
      const tmp = f.value; f.value = t.value; t.value = tmp;
    });

    // 查询
    $('#searchBtn').addEventListener('click', () => {
      const from = $('#fromCity').value.trim();
      const to = $('#toCity').value.trim();
      if (!from || !to) { alert('请输入出发地和目的地'); return; }
      const data = getCityPair(from, to);
      const routes = data ? data.routes : randomRoutes(from, to);
      renderResults(routes);
      renderComparison(routes);
      renderAttractions(to);
    });

    // 筛选标签
    $$('.filter-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
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

    // 路线规划 - 添加途经点
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

    // 生成路线
    $('#planBtn').addEventListener('click', () => {
      const start = $('#planStart').value.trim();
      const end = $('#planEnd').value.trim();
      const stops = $$('.stop-input').map ? $$('.stop-input').map(i => i.value.trim()).filter(Boolean) : Array.from($$('.stop-input')).map(i => i.value.trim()).filter(Boolean);
      const days = parseInt($('#planDays').value, 10);
      if (!start || !end) { alert('请输入起点和终点'); return; }
      renderRouteTimeline(start, end, stops, days);
    });

    // 导航高亮
    const navLinks = $$('.nav a');
    window.addEventListener('scroll', () => {
      const sections = ['search', 'planner', 'attractions', 'compare'];
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

  // ===================== 初始化 =====================
  function init() {
    renderQuickDates();
    bindEvents();
    // 默认查询一次
    $('#searchBtn').click();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
