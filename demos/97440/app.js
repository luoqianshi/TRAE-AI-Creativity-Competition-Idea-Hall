const API = "/api";
let currentPage = "home";

function $(id) { return document.getElementById(id); }

function cityIcon(city) {
  const tags = (city.tags || []).join("") + (city.description || "");
  const n = city.name || "";
  const a = city.altitude || 0;
  if (tags.includes("海") || tags.includes("银滩") || tags.includes("海滨") || tags.includes("海岛")) return "🌊";
  if (tags.includes("竹海") || tags.includes("森林") || tags.includes("生态")) return "🌲";
  if (tags.includes("温泉") || tags.includes("康养")) return "♨️";
  if (tags.includes("苗寨") || tags.includes("侗寨") || tags.includes("民族") || tags.includes("土家")) return "🏮";
  if (tags.includes("古村") || tags.includes("古镇") || tags.includes("古城") || tags.includes("徽派") || tags.includes("古都")) return "🏘️";
  if (tags.includes("避暑山庄") || tags.includes("园林")) return "🏯";
  if (tags.includes("世界遗产") || tags.includes("风景区")) return "🏔️";
  if (tags.includes("瀑布") || tags.includes("大峡谷")) return "🌊";
  if (a > 1500) return "⛰️";
  if (a > 800) return "🏔️";
  if (tags.includes("省会") || tags.includes("交通枢纽")) return "🏙️";
  if (tags.includes("长寿")) return "🍃";
  if (tags.includes("美食")) return "🍜";
  if (tags.includes("茶叶") || tags.includes("普洱") || tags.includes("茶")) return "🍵";
  if (tags.includes("油菜花") || tags.includes("田园")) return "🌾";
  if (tags.includes("海鲜")) return "🦐";
  if (tags.includes("热带")) return "🌴";
  return "🏡";
}

function navigate(page, params) {
  currentPage = page;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  const tab = document.querySelector(`.tab[data-page="${page}"]`);
  if (tab) tab.classList.add("active");
  renderPage(page, params);
  window.scrollTo(0, 0);
}

function renderPage(page, params) {
  const el = $("main-content");
  el.innerHTML = '<div class="loading">加载中...</div>';
  if (page === "home") renderHome(el);
  else if (page === "summer") renderCityList(el, "避暑");
  else if (page === "winter") renderCityList(el, "避寒");
  else if (page === "houses") renderHouseList(el, params);
  else if (page === "recommend") renderRecommend(el);
  else if (page === "search") renderSearch(el);
  else if (page === "city-list") renderCityList(el, params);
  else if (page === "rural") renderRural(el);
  else if (page === "guides") renderGuides(el);
}

async function renderRural(el) {
  el.innerHTML = `
    <div class="section">
      <div class="section-title">🌾 全国农村房源平台 · 美丽新乡村</div>
      <div class="rural-intro" style="background:#f1f8e9;border-radius:12px;padding:20px;margin-bottom:20px;line-height:1.8;color:#333;">
        <p><strong>美丽新乡村</strong>（<a href="https://myxiangcun.com" target="_blank" style="color:#2e7d32;">myxiangcun.com</a>）是国内领先的农村宅基地和房屋出租信息平台，提供全国50,000+套农村闲置房屋、农家院、宅基地出租信息。</p>
        <p style="margin-top:8px;">📞 客服电话：<strong>010-56247008</strong>（工作日09:30-17:30）</p>
        <p>📱 微信公众号：<strong>meilixxc</strong>（关注后随时随地查看最新房源）</p>
        <p>🏘️ 平台特色：全国31省市农房信息、正规租赁合同范本下载、农房设计改造服务、村域盘活项目</p>
      </div>

      <div class="section-title">🔍 按省份查找农村房源</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;">
        ${["北京","天津","河北","山西","内蒙古","辽宁","吉林","黑龙江","上海","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","广西","海南","重庆","四川","贵州","云南","西藏","陕西","甘肃","青海","宁夏","新疆"].map(p =>
          `<a href="https://myxiangcun.com/m/anjialist.html" target="_blank" class="filter-btn" style="text-decoration:none;font-size:13px;padding:6px 12px;">${p}</a>`
        ).join("")}
      </div>

      <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f5f5f5;border-bottom:1px solid #eee;">
          <span style="font-weight:600;font-size:14px;">🌐 美丽新乡村 · 最新农村房源</span>
          <a href="https://myxiangcun.com" target="_blank" style="font-size:13px;color:#2e7d32;text-decoration:none;font-weight:600;">在新窗口打开 →</a>
        </div>
        <div style="position:relative;width:100%;height:600px;overflow:hidden;background:#fafafa;">
          <iframe src="https://myxiangcun.com/m/anjialist.html" style="width:100%;height:100%;border:none;" loading="lazy" onerror="this.style.display='none'"></iframe>
        </div>
      </div>

      <div style="background:#fff3e0;border-radius:12px;padding:20px;margin-bottom:20px;">
        <div class="section-title" style="margin-bottom:8px;">💡 使用小贴士</div>
        <ul style="line-height:2;color:#555;padding-left:20px;margin:0;font-size:14px;">
          <li>在上方嵌入窗口中，选择所在<strong>省份和城市</strong>筛选当地农村房源</li>
          <li>候鸟旅居推荐搜索<strong>云南、海南、广西、贵州、浙江、安徽</strong>等省的农村房源</li>
          <li>联系房东时说明是通过美丽新乡村平台看到的，方便确认房源有效性</li>
          <li>如嵌入窗口未正常加载，请点击"在新窗口打开"直接在浏览器中访问</li>
          <li>本平台已收录美丽新乡村客服电话 <strong>010-56247008</strong>，方便您快速联系</li>
        </ul>
      </div>
    </div>`;
}

function stars(n) {
  const full = Math.floor(n);
  const half = n % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(empty);
}

function renderStars(n) {
  return '<span class="stars">' + stars(n) + '</span>';
}

async function renderHome(el) {
  try {
    const res = await fetch(API + "/categories");
    const data = await res.json();
    el.innerHTML = `
      <div class="section">
        <div class="section-title">🔍 快速查找</div>
        <div class="quick-buttons">
          <button class="quick-btn summer" onclick="navigate('summer')">🌿 我要避暑</button>
          <button class="quick-btn winter" onclick="navigate('winter')">☀️ 我要避寒</button>
          <button class="quick-btn price" onclick="navigate('city-list','cheap')">💰 我要看低价房</button>
          <button class="quick-btn medical" onclick="navigate('city-list','medical')">🏥 医疗方便</button>
          <button class="quick-btn quiet" onclick="navigate('city-list','quiet')">🌳 安静养老</button>
        </div>
      </div>
      <div class="section">
        <div class="section-title">🌿 夏季避暑推荐 <span class="section-subtitle">${data.summer.length}个城市</span></div>
        <div class="city-grid">${data.summer.map(c => cityCard(c, '凉快', '避暑')).join("")}</div>
      </div>
      <div class="section">
        <div class="section-title">☀️ 冬季避寒推荐 <span class="section-subtitle">${data.winter.length}个城市</span></div>
        <div class="city-grid">${data.winter.map(c => cityCard(c, '温暖', '避寒')).join("")}</div>
      </div>
      <div class="section">
        <div class="section-title">💰 最低价城市推荐</div>
        <div class="city-grid">${data.cheapest.slice(0,4).map(c => cityCard(c)).join("")}</div>
      </div>
      <div class="section">
        <div class="section-title">🏥 医疗最好城市</div>
        <div class="city-grid">${data.best_medical.slice(0,4).map(c => cityCard(c)).join("")}</div>
      </div>
    `;
  } catch(e) {
    el.innerHTML = `<div class="loading">加载失败，请刷新重试</div>`;
  }
}

function cityCard(c, tagType, season) {
  const tag = c.tags && c.tags[0] ? `<span class="tag ${tagType === '温暖' ? 'orange' : 'green'}">${c.tags[0]}</span>` : "";
  const icon = cityIcon(c);
  let statTemp;
  if (season === '避暑') {
    statTemp = `<span class="stat"><span class="stat-icon">☀️</span> 夏季${c.summer_temp || ""}</span>`;
  } else if (season === '避寒') {
    statTemp = `<span class="stat"><span class="stat-icon">☀️</span> 冬季${c.winter_temp || ""}</span>`;
  } else {
    const t = c.summer_temp && c.winter_temp ? `${c.summer_temp}/${c.winter_temp}` : (c.summer_temp || c.winter_temp || "");
    statTemp = `<span class="stat"><span class="stat-icon">🌡️</span> ${t}</span>`;
  }
  return `
    <div class="city-card" onclick="openCityDetail(${c.id})">
      <div class="city-card-img" style="font-size:48px;">${icon}</div>
      <div class="city-card-body">
        <div class="city-card-name">${c.name}</div>
        <div class="city-card-province">${c.province || "中国"} · 海拔${c.altitude || "-"}m</div>
        <div class="city-card-tags">${tag}</div>
        <div class="city-card-stats">
          ${statTemp}
          <span class="stat"><span class="stat-icon">💰</span> ¥${c.rent_avg}/月</span>
          <span class="stat"><span class="stat-icon">⛰️</span> ${c.altitude || "-"}m</span>
          <span class="stat"><span class="stat-icon">⭐</span> ${c.elderly_score}分</span>
        </div>
      </div>
    </div>`;
}

async function renderCityList(el, type) {
  const category = (type === "避暑" || type === "避寒") ? type : null;
  let url = API + "/cities";
  if (category) url += "?category=" + category;
  if (type === "cheap") url += "?sort=price";
  if (type === "medical") url += "?sort=medical";
  if (type === "quiet") url += "?sort=elderly";
  try {
    const res = await fetch(url);
    const cities = await res.json();
    const season = category || null;
    const title = category ? (category === "避暑" ? "🌿 避暑城市" : "☀️ 避寒城市")
      : type === "cheap" ? "💰 低价城市排行"
      : type === "medical" ? "🏥 医疗最优城市"
      : "🌳 最安静宜居城市";
    el.innerHTML = `
      <div class="section">
        <div class="section-title">${title} <span class="section-subtitle">共${cities.length}个城市</span></div>
        <div class="city-grid">${cities.map(c => cityCard(c, null, season)).join("")}</div>
      </div>
    `;
  } catch(e) {
    el.innerHTML = `<div class="loading">加载失败</div>`;
  }
}

async function renderHouseList(el) {
  try {
    const res = await fetch(API + "/houses");
    const houses = await res.json();
    el.innerHTML = `
      <div class="section">
        <div class="section-title">🏘️ 全部房源 <span class="section-subtitle">共${houses.length}套</span></div>
        <div class="filter-bar">
          <button class="filter-btn active" onclick="filterHouses(this,'all')">全部</button>
          <button class="filter-btn" onclick="filterHouses(this,'公寓')">公寓</button>
          <button class="filter-btn" onclick="filterHouses(this,'民宿')">民宿</button>
          <button class="filter-btn" onclick="filterHouses(this,'康养社区')">康养社区</button>
          <button class="filter-btn" onclick="filterHouses(this,'1000')">¥1000以下</button>
          <button class="filter-btn" onclick="filterHouses(this,'2000')">¥1000-2000</button>
          <button class="filter-btn" onclick="filterHouses(this,'4000')">¥2000-4000</button>
        </div>
        <div id="house-list">${houses.map(h => houseCard(h)).join("")}</div>
      </div>
    `;
    window._allHouses = houses;
  } catch(e) {
    el.innerHTML = `<div class="loading">加载失败</div>`;
  }
}

function filterHouses(btn, filter) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const houses = window._allHouses || [];
  let filtered = houses;
  if (filter === "公寓" || filter === "民宿" || filter === "康养社区") {
    filtered = houses.filter(h => h.category === filter);
  } else if (filter === "1000") {
    filtered = houses.filter(h => h.price <= 1000);
  } else if (filter === "2000") {
    filtered = houses.filter(h => h.price > 1000 && h.price <= 2000);
  } else if (filter === "4000") {
    filtered = houses.filter(h => h.price > 2000 && h.price <= 4000);
  }
  $("house-list").innerHTML = filtered.map(h => houseCard(h)).join("");
  if (!filtered.length) $("house-list").innerHTML = '<div style="text-align:center;padding:40px;color:#999;">没有符合条件的房源</div>';
}

function houseCard(h) {
  return `
    <div class="house-card">
      <h4>${h.title}</h4>
      <div class="house-price">¥${h.price}<span>/月</span></div>
      <div class="house-details">
        <span>🏠 ${h.house_type}</span>
        <span>📐 ${h.area}</span>
        <span>📋 ${h.category}</span>
        <span>⏱ ${h.min_rent}</span>
      </div>
      <div class="house-details">
        <span>🏥 ${h.nearby_hospital || "未知"}</span>
        <span>🛒 ${h.nearby_market || "未知"}</span>
      </div>
      <div class="house-details">
        <span>⭐ ${renderStars(h.rating)} ${h.rating}</span>
      </div>
      ${h.description ? `<p style="font-size:14px;color:#555;margin:8px 0;">${h.description}</p>` : ""}
      <button class="contact-btn" onclick="alert('联系人：${h.contact}')">📞 联系房东</button>
    </div>`;
}

async function renderRecommend(el) {
  const months = Array.from({length:12}, (_,i) => `<option value="${i+1}">${i+1}月</option>`).join("");
  const budgets = [1000,1500,2000,2500,3000,4000,5000].map(b => `<option value="${b}">¥${b}</option>`).join("");
  el.innerHTML = `
    <div class="section">
      <div class="section-title">🤖 AI旅居推荐</div>
      <p style="color:#666;margin-bottom:16px;">告诉我您的情况，为您推荐最佳旅居目的地</p>
      <div class="recommend-form">
        <div class="form-group">
          <label>年龄</label>
          <select id="r-age"><option value="55">55-60岁</option><option value="65" selected>60-70岁</option><option value="75">70-80岁</option><option value="85">80岁以上</option></select>
        </div>
        <div class="form-group">
          <label>月预算</label>
          <select id="r-budget">${budgets}</select>
        </div>
        <div class="form-group">
          <label>居住月份</label>
          <select id="r-month">${months}</select>
        </div>
        <div class="form-group">
          <label>健康情况（选填）</label>
          <select id="r-health"><option value="">无特殊</option><option value="高血压">高血压</option><option value="心脏病">心脏病</option><option value="呼吸道疾病">呼吸道疾病</option></select>
        </div>
        <div class="form-group">
          <label>偏好（选填）</label>
          <select id="r-pref"><option value="">无偏好</option><option value="安静">安静</option><option value="热闹">热闹</option><option value="山区">山区</option><option value="海边">海边</option></select>
        </div>
        <button class="submit-btn" onclick="doRecommend()">🤖 开始推荐</button>
      </div>
      <div id="recommend-result"></div>
    </div>`;
}

async function doRecommend() {
  const age = $("r-age").value;
  const budget = $("r-budget").value;
  const month = parseInt($("r-month").value);
  const health = $("r-health").value;
  const pref = $("r-pref").value;
  const season = (month >= 5 && month <= 9) ? '避暑' : '避寒';
  const el = $("recommend-result");
  el.innerHTML = '<div class="loading">正在分析推荐...</div>';
  try {
    let url = `${API}/recommend?age=${age}&budget=${budget}&month=${month}`;
    if (health) url += `&health=${health}`;
    if (pref) url += `&preference=${pref}`;
    const res = await fetch(url);
    const cities = await res.json();
    el.innerHTML = `
      <div class="section-title">🎯 为您推荐以下城市</div>
      <div class="city-grid">${cities.map((c,i) => `
        <div class="city-card" onclick="openCityDetail(${c.id})">
          <div class="city-card-img" style="font-size:48px;">${cityIcon(c)}</div>
          <div class="city-card-body">
            <div class="city-card-name">${c.name}</div>
            <div class="city-card-province">${c.province || "中国"} · 海拔${c.altitude || "-"}m</div>
            <div class="city-card-tags">${(c.tags||[]).slice(0,2).map(t => `<span class="tag">${t}</span>`).join("")}</div>
            <div class="city-card-stats">
              <span class="stat"><span class="stat-icon">☀️</span> ${season === '避暑' ? '夏季' : '冬季'}${season === '避暑' ? (c.summer_temp || '') : (c.winter_temp || '')}</span>
              <span class="stat"><span class="stat-icon">💰</span> ¥${c.rent_avg}/月</span>
              <span class="stat"><span class="stat-icon">⛰️</span> ${c.altitude || "-"}m</span>
              <span class="stat"><span class="stat-icon">⭐</span> ${c.elderly_score}分</span>
              <span class="stat"><span class="stat-icon">🎯</span> 匹配${c.recommend_score}</span>
            </div>
          </div>
        </div>`).join("")}
      </div>
    `;
  } catch(e) {
    el.innerHTML = '<div class="loading">推荐失败，请重试</div>';
  }
}

const PROVINCES = ["安徽","浙江","贵州","云南","广西","江西","福建","广东","海南","四川","湖南","湖北","山东","江苏","河南","河北","山西","陕西","甘肃","辽宁","吉林","黑龙江"];

async function renderSearch(el) {
  el.innerHTML = `
    <div class="section">
      <div class="section-title">🔍 搜索目的地 / 房源</div>
      <div class="search-input-wrap">
        <input class="search-input" id="search-input" placeholder="输入省份或城市名..." onkeydown="if(event.key==='Enter') doSearch()">
        <button class="search-btn" onclick="doSearch()">搜索</button>
      </div>
      <div class="section-title" style="font-size:15px;margin-top:16px;">🌾 按省份找低价乡村旅居地</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
        ${PROVINCES.map(p => `<button class="filter-btn" onclick="searchProvince('${p}')">${p}</button>`).join("")}
      </div>
      <div id="search-results"></div>
    </div>`;
}

async function searchProvince(province) {
  const el = $("search-results");
  window._currentProvince = province;
  window._provinceFilter = {};
  el.innerHTML = '<div class="loading">查找' + province + '适合旅居的地方...</div>';
  try {
    const res = await fetch(API + "/province/" + province);
    const data = await res.json();
    window._provinceData = data;
    renderProvinceResults(el, data, province);
  } catch(e) {
    el.innerHTML = '<div class="loading">查找失败</div>';
  }
}

function renderProvinceResults(el, data, province, filter) {
  filter = filter || {};
  let cities = data.cities;
  if (filter.price === "cheap") cities = cities.filter(c => c.rent_avg <= 1000);
  if (filter.price === "mid") cities = cities.filter(c => c.rent_avg > 1000 && c.rent_avg <= 2500);
  if (filter.medical === "good") cities = cities.filter(c => c.medical_score >= 3.5);
  if (filter.category === "summer") cities = cities.filter(c => c.category === "避暑");
  if (filter.category === "winter") cities = cities.filter(c => c.category === "避寒");
  if (filter.air === "good") cities = cities.filter(c => c.air_quality === "优");
  if (filter.rural === "yes") cities = cities.filter(c => c.is_rural);
  const season = filter.category === "summer" ? "避暑" : filter.category === "winter" ? "避寒" : null;

  el.innerHTML = `
    <div class="section-title" style="font-size:17px;">🏘️ ${province} · 共${data.total}个城市</div>
    <div class="filter-bar">
      <button class="filter-btn ${!filter.price ? 'active' : ''}" onclick="setProvinceFilter('price','')">全部价格</button>
      <button class="filter-btn ${filter.price === 'cheap' ? 'active' : ''}" onclick="setProvinceFilter('price','cheap')">¥1000以下</button>
      <button class="filter-btn ${filter.price === 'mid' ? 'active' : ''}" onclick="setProvinceFilter('price','mid')">¥1000-2500</button>
      <button class="filter-btn ${filter.medical === 'good' ? 'active' : ''}" onclick="setProvinceFilter('medical','good')">医疗好</button>
      <button class="filter-btn ${filter.air === 'good' ? 'active' : ''}" onclick="setProvinceFilter('air','good')">空气优</button>
      <button class="filter-btn ${filter.rural === 'yes' ? 'active' : ''}" onclick="setProvinceFilter('rural','yes')">🌾乡村推荐</button>
      <button class="filter-btn ${filter.category === 'summer' ? 'active' : ''}" onclick="setProvinceFilter('category','summer')">避暑</button>
      <button class="filter-btn ${filter.category === 'winter' ? 'active' : ''}" onclick="setProvinceFilter('category','winter')">避寒</button>
      <button class="filter-btn" onclick="setProvinceFilter('sort','price')">按价格</button>
      <button class="filter-btn" onclick="setProvinceFilter('sort','elderly')">按评分</button>
    </div>
    ${cities.length === 0 ? '<div style="text-align:center;padding:40px;color:#999;">没有符合条件的城市</div>' : `
    <div class="city-grid">${cities.map(c => {
      let statTemp;
      if (season === '避暑') {
        statTemp = `<span class="stat"><span class="stat-icon">☀️</span> 夏季${c.summer_temp || ""}</span>`;
      } else if (season === '避寒') {
        statTemp = `<span class="stat"><span class="stat-icon">☀️</span> 冬季${c.winter_temp || ""}</span>`;
      } else {
        const t = c.summer_temp && c.winter_temp ? `${c.summer_temp}/${c.winter_temp}` : (c.summer_temp || c.winter_temp || "");
        statTemp = `<span class="stat"><span class="stat-icon">🌡️</span> ${t}</span>`;
      }
      return `<div class="city-card" onclick="openCityDetail(${c.id})">
        <div class="city-card-img" style="font-size:48px;">${cityIcon(c)}</div>
        <div class="city-card-body">
          <div class="city-card-name">${c.name} ${c.is_rural ? '<span style="font-size:11px;background:#e8f5e9;color:#2e7d32;padding:1px 6px;border-radius:4px;">乡村推荐</span>' : ''}</div>
          <div class="city-card-province">${province} · ${c.category} · 海拔${c.altitude || "-"}m</div>
          <div class="city-card-tags">${(c.tags||[]).slice(0,3).map(t => `<span class="tag">${t}</span>`).join("")}</div>
          <div class="city-card-stats">
            <span class="stat"><span class="stat-icon">💰</span> ¥${c.rent_avg}/月</span>
            <span class="stat"><span class="stat-icon">⛰️</span> ${c.altitude || "-"}m</span>
            ${statTemp}
            <span class="stat"><span class="stat-icon">🏥</span> ${c.medical_score}分</span>
            <span class="stat"><span class="stat-icon">⭐</span> ${c.elderly_score}分</span>
            <span class="stat"><span class="stat-icon">💚</span> ${c.air_quality}</span>
          </div>
          ${c.description ? `<p style="font-size:13px;color:#888;margin-top:6px;line-height:1.5;">${c.description.substring(0,40)}...</p>` : ""}
        </div>
      </div>`;
    }).join("")}</div>`}
  `;
}

function setProvinceFilter(key, value) {
  if (key === "sort") {
    const data = window._provinceData;
    const cities = [...data.cities];
    if (value === "price") cities.sort((a,b) => a.rent_avg - b.rent_avg);
    if (value === "elderly") cities.sort((a,b) => b.elderly_score - a.elderly_score);
    window._provinceData.cities = cities;
    renderProvinceResults($("search-results"), window._provinceData, window._currentProvince, window._provinceFilter);
    return;
  }
  const f = window._provinceFilter || {};
  if (f[key] === value) delete f[key];
  else f[key] = value;
  window._provinceFilter = f;
  renderProvinceResults($("search-results"), window._provinceData, window._currentProvince, f);
}

async function doSearch() {
  const q = $("search-input").value.trim();
  if (!q) return;
  const el = $("search-results");
  el.innerHTML = '<div class="loading">搜索中...</div>';
  try {
    const res = await fetch(API + "/search?q=" + q);
    const data = await res.json();
    let html = "";
    if (data.rural && data.rural.length) {
      html += '<div class="section-title" style="font-size:17px;margin-top:16px;">🌾 低价乡村旅居推荐</div>';
      html += '<div class="city-grid">' + data.rural.map(c => {
        const t = c.summer_temp && c.winter_temp ? `${c.summer_temp}/${c.winter_temp}` : (c.summer_temp || c.winter_temp || "");
        return `<div class="city-card" onclick="openCityDetail(${c.id})">
          <div class="city-card-img" style="font-size:48px;">${cityIcon(c)}</div>
          <div class="city-card-body">
            <div class="city-card-name">${c.name}</div>
            <div class="city-card-province">${c.province} · 海拔${c.altitude || "-"}m</div>
            <div class="city-card-tags">${(c.tags||[]).slice(0,3).map(t => `<span class="tag green">${t}</span>`).join("")}</div>
            <div class="city-card-stats">
              <span class="stat"><span class="stat-icon">💰</span> ¥${c.rent_avg}/月</span>
              <span class="stat"><span class="stat-icon">⛰️</span> ${c.altitude || "-"}m</span>
              <span class="stat"><span class="stat-icon">🌡️</span> ${t}</span>
              <span class="stat"><span class="stat-icon">⭐</span> ${c.elderly_score}分</span>
            </div>
          </div>
        </div>`;
      }).join("") + '</div>';
    }
    if (data.cities.length) {
      html += '<div class="section-title" style="font-size:16px;margin-top:16px;">🏙️ 城市</div>';
      html += data.cities.map(c => `
        <div class="search-result-item" onclick="openCityDetail(${c.id})">
          <strong>${c.name}</strong> ${c.province || ""} · ${c.category} · ⭐${c.elderly_score}分
        </div>`).join("");
    }
    if (data.houses.length) {
      html += '<div class="section-title" style="font-size:16px;margin-top:16px;">🏘️ 房源</div>';
      html += data.houses.map(h => `
        <div class="search-result-item">
          <strong>${h.title}</strong> · ¥${h.price}/月 · ${h.house_type}
        </div>`).join("");
    }
    if (!data.cities.length && !data.houses.length && !(data.rural && data.rural.length)) {
      html = '<div style="text-align:center;padding:40px;color:#999;">没有找到结果</div>';
    }
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<div class="loading">搜索失败</div>';
  }
}

async function renderGuides(el) {
  try {
    const res = await fetch(API + "/guides");
    const allGuides = await res.json();
    const pitfall = allGuides.filter(g => g.category === "避坑攻略");
    const travel = allGuides.filter(g => g.category === "出行攻略");
    const notice = allGuides.filter(g => g.category === "注意事项");
    el.innerHTML = `
      <div class="section">
        <div class="section-title">📖 旅居攻略大全 <span class="section-subtitle">共${allGuides.length}篇</span></div>
        <div class="guide-tabs" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
          <button class="guide-tab-btn active" data-gtab="pitfall" onclick="switchGuideTab(this,'pitfall')">⚠️ 避坑攻略 (${pitfall.length})</button>
          <button class="guide-tab-btn" data-gtab="travel" onclick="switchGuideTab(this,'travel')">🚗 出行攻略 (${travel.length})</button>
          <button class="guide-tab-btn" data-gtab="notice" onclick="switchGuideTab(this,'notice')">📋 注意事项 (${notice.length})</button>
        </div>
        <div id="guide-list">
          ${pitfall.map(g => guideCard(g)).join("")}
        </div>
      </div>`;
  } catch(e) {
    el.innerHTML = '<div class="loading">加载失败</div>';
  }
}

function switchGuideTab(btn, tab) {
  document.querySelectorAll(".guide-tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  fetch(API + "/guides?category=" + (tab === "pitfall" ? "避坑攻略" : tab === "travel" ? "出行攻略" : "注意事项"))
    .then(r => r.json())
    .then(guides => {
      $("guide-list").innerHTML = guides.map(g => guideCard(g)).join("");
    });
}

let _expandedGuide = null;

function guideCard(g) {
  const exp = _expandedGuide === g.id;
  return '<div class="guide-card" data-gid="' + g.id + '" onclick="toggleGuide(' + g.id + ')">' +
    '<div class="guide-header">' +
    '<span class="guide-cat ' + (g.category === '避坑攻略' ? 'cat-red' : g.category === '出行攻略' ? 'cat-blue' : 'cat-green') + '">' +
    (g.category === '避坑攻略' ? '⚠️' : g.category === '出行攻略' ? '🚗' : '📋') + ' ' + g.category + '</span>' +
    '<span class="guide-title">' + g.title + '</span>' +
    '<span class="guide-toggle">' + (exp ? '▲' : '▼') + '</span></div>' +
    '<div class="guide-body" style="display:' + (exp ? 'block' : 'none') + '">' +
    '<div class="guide-content">' + g.content.replace(/\n/g, '<br>') + '</div>' +
    (g.tags && g.tags.length ? '<div class="guide-tags">' + g.tags.map(t => '<span class="tag">' + t + '</span>').join("") + '</div>' : '') +
    (g.source ? '<div class="guide-source">📌 来源：' + g.source + '</div>' : '') +
    '</div></div>';
}

function toggleGuide(id) {
  _expandedGuide = _expandedGuide === id ? null : id;
  document.querySelectorAll(".guide-card").forEach(card => {
    const body = card.querySelector(".guide-body");
    const toggle = card.querySelector(".guide-toggle");
    const isTarget = parseInt(card.dataset.gid) === id;
    if (isTarget) {
      const exp = _expandedGuide === id;
      body.style.display = exp ? "block" : "none";
      toggle.textContent = exp ? "▲" : "▼";
    } else {
      body.style.display = "none";
      toggle.textContent = "▼";
    }
  });
}

async function openCityDetail(id) {
  const overlay = $("city-detail");
  overlay.classList.remove("hidden");
  $("detail-body").innerHTML = '<div class="loading">加载中...</div>';
  try {
    const res = await fetch(API + "/cities/" + id);
    const data = await res.json();
    const c = data.city;
    const h = data.houses;
    const r = data.reviews;
    const avgRating = r.length ? r.reduce((s,rv) => s + (rv.rating_living + rv.rating_medical + rv.rating_market + rv.rating_elderly) / 4, 0) / r.length : 0;
    $("detail-body").innerHTML = `
      <div class="detail-header">
        <div class="detail-name">${c.name}</div>
        <div class="detail-province">${c.province} · ${c.category === "避暑" ? "🌿避暑城市" : "☀️避寒城市"}</div>
        <div class="detail-score">⭐ ${c.elderly_score}分</div>
        <div style="margin-top:8px;">${(c.tags||[]).map(t => `<span class="tag">${t}</span>`).join(" ")}</div>
      </div>
      <p style="font-size:16px;color:#555;margin-bottom:20px;line-height:1.8;">${c.description || ""}</p>
      <div class="detail-section">
        <h3>🌡️ 气候环境</h3>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-item-label">夏季温度</div><div class="detail-item-value">${c.summer_temp || "-"}</div></div>
          <div class="detail-item"><div class="detail-item-label">冬季温度</div><div class="detail-item-value">${c.winter_temp || "-"}</div></div>
          <div class="detail-item"><div class="detail-item-label">海拔</div><div class="detail-item-value">${c.altitude || "-"}米</div></div>
          <div class="detail-item"><div class="detail-item-label">空气质量</div><div class="detail-item-value">${c.air_quality || "-"}</div></div>
          <div class="detail-item"><div class="detail-item-label">湿度</div><div class="detail-item-value">${c.humidity || "-"}</div></div>
        </div>
      </div>
      <div class="detail-section">
        <h3>💰 居住成本</h3>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-item-label">月租均价</div><div class="detail-item-value" style="color:#e65100;">¥${c.rent_avg}</div></div>
          <div class="detail-item"><div class="detail-item-label">房租范围</div><div class="detail-item-value">${c.rent_desc || "-"}</div></div>
          <div class="detail-item"><div class="detail-item-label">生活便利</div><div class="detail-item-value">${renderStars(c.living_score)}</div></div>
        </div>
      </div>
      <div class="detail-section">
        <h3>🏥 医疗资源</h3>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-item-label">医疗评分</div><div class="detail-item-value">${renderStars(c.medical_score)}</div></div>
          <div class="detail-item"><div class="detail-item-label">三甲医院</div><div class="detail-item-value">${c.hospitals_3a || 0}家</div></div>
        </div>
      </div>
      <div class="detail-section">
        <h3>🚄 交通</h3>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-item-label">交通评分</div><div class="detail-item-value">${renderStars(c.transport_score)}</div></div>
          <div class="detail-item"><div class="detail-item-label">高铁</div><div class="detail-item-value">${c.has_high_speed_rail ? "✅ 有" : "❌ 无"}</div></div>
          <div class="detail-item"><div class="detail-item-label">机场距离</div><div class="detail-item-value">${c.airport_distance ? c.airport_distance + "km" : "-"}</div></div>
        </div>
      </div>
      ${h.length ? `
      <div class="detail-section">
        <h3>🏘️ 推荐房源 (${h.length})</h3>
        ${h.map(hc => houseCard(hc)).join("")}
      </div>` : ""}
      ${r.length ? `
      <div class="detail-section">
        <h3>💬 老人真实评价 (${r.length})</h3>
        <div style="margin-bottom:12px;padding:12px;background:#fff8e1;border-radius:8px;">
          <span style="font-size:15px;">综合评分 ${renderStars(Math.round(avgRating))} (${avgRating.toFixed(1)})</span>
        </div>
        ${r.map(rv => `
          <div class="review-card">
            <div class="review-user">${rv.user_name}</div>
            <div class="review-stay">居住${rv.stay_duration || ""} · ${rv.created_at ? new Date(rv.created_at).toLocaleDateString() : ""}</div>
            <div style="margin-bottom:6px;">
              居住${renderStars(rv.rating_living)} 医疗${renderStars(rv.rating_medical)} 买菜${renderStars(rv.rating_market)} 友好${renderStars(rv.rating_elderly)}
            </div>
            <div class="review-content">${rv.content}</div>
          </div>
        `).join("")}
      </div>` : `
      <div class="detail-section">
        <h3>💬 老人评价</h3>
        <p style="color:#999;">暂无评价，来成为第一个评价的人吧</p>
      </div>`}
      <div class="detail-section" id="detail-guides-${c.id}">
        <h3>📖 相关攻略</h3>
        <div id="detail-guide-list-${c.id}"><div class="loading" style="padding:12px;">加载攻略中...</div></div>
      </div>
    `;
    // Load guides for this city
    fetch(API + "/guides?city_id=" + c.id)
      .then(r => r.json())
      .then(guides => {
        const el = $("detail-guide-list-" + c.id);
        if (guides.length) {
          el.innerHTML = guides.map(g => guideCard(g)).join("");
        } else {
          el.innerHTML = '<p style="color:#999;font-size:14px;">暂未收录本城市专项攻略，点击顶部"📖 攻略"查看更多通用攻略</p>';
        }
      });
  } catch(e) {
    $("detail-body").innerHTML = '<div class="loading">加载失败</div>';
  }
}

function closeCityDetail(e) {
  if (e && e.target !== $("city-detail")) return;
  $("city-detail").classList.add("hidden");
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => navigate(tab.dataset.page));
});

navigate("home");
