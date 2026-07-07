const state = {
  panel: "home",
  city: "上海",
  category: "全部",
  tag: "全部",
  query: "",
  located: false,
  profile: {
    nickname: "刚到这座城",
    avatar: "旅",
    role: "独自旅行 · 第一次来"
  }
};

const panelTitles = {
  home: "城市广场",
  posts: "本城帖子",
  nearby: "附近小抄",
  ai: "AI 总结",
  profile: "我的身份"
};

const categories = [
  { id: "全部", desc: "所有城市经验" },
  { id: "应急补给", desc: "充电、厕所、寄存" },
  { id: "城市交通", desc: "地铁、打车、换乘" },
  { id: "游玩打卡", desc: "路线、机位、排队" },
  { id: "生活落脚", desc: "吃饭、办公、休息" },
  { id: "避坑安全", desc: "夜间、黑车、套路" }
];

const tags = [
  "全部", "手机低电量", "公共卫生间", "免费充电", "行李寄存", "夜间路线", "地铁出口",
  "一个人", "拖着行李", "雨天", "看演唱会", "赶时间", "本地人实测", "少排队", "替代方案"
];

const cityStats = {
  上海: { short: "沪", posts: 128, resources: 46, avoids: 18, ai: 9, location: "人民广场", hot: "手机只剩 12%，人民广场附近哪里能充电？", coord: [121.47, 31.23] },
  成都: { short: "蓉", posts: 96, resources: 39, avoids: 11, ai: 7, location: "春熙路", hot: "春熙路附近有没有一个人吃饭不尴尬的店？", coord: [104.06, 30.67] },
  杭州: { short: "杭", posts: 88, resources: 34, avoids: 14, ai: 6, location: "龙翔桥", hot: "西湖边晚上走哪条路线更亮更安全？", coord: [120.15, 30.27] },
  北京: { short: "京", posts: 112, resources: 42, avoids: 16, ai: 8, location: "北京南站", hot: "北京南站到三里屯怎么坐地铁不绕？", coord: [116.41, 39.90] },
  广州: { short: "穗", posts: 76, resources: 30, avoids: 10, ai: 5, location: "广州塔", hot: "广州塔附近哪里寄存行李比较稳？", coord: [113.26, 23.13] },
  海口: { short: "海", posts: 42, resources: 18, avoids: 8, ai: 4, location: "骑楼老街", hot: "骑楼老街附近哪里能避雨和充电？", coord: [110.32, 20.03] },
  台北: { short: "北", posts: 39, resources: 16, avoids: 7, ai: 3, location: "台北车站", hot: "台北车站第一次换乘怎么不迷路？", coord: [121.56, 25.04] }
};

let posts = [
  { city: "上海", category: "应急补给", title: "人民广场附近免费充电实测", body: "来福士服务台可以问应急充电，部分咖啡店也有插座。手机低于 15% 建议先补电再去外滩。", author: "短停旅人", replies: 26, tags: ["免费充电", "手机低电量", "本地人实测"], hot: true },
  { city: "上海", category: "应急补给", title: "南京东路步行街卫生间怎么找", body: "商场和地铁站比临街店稳定。晚上建议优先去商场，动线更清楚，也更亮。", author: "本地向导", replies: 14, tags: ["公共卫生间", "夜间路线"], hot: false },
  { city: "上海", category: "城市交通", title: "人民广场去外滩别只看 2 号线", body: "第一次来建议从南京东路 7 号口出，沿主路走。夜间更亮，人也更多。", author: "地铁通勤者", replies: 31, tags: ["地铁出口", "夜间路线", "替代方案"], hot: true },
  { city: "上海", category: "避坑安全", title: "外滩主动拍照要先问价格", body: "有人主动拉拍照或送小礼物时，先问清价格。想拍照可以去游客中心附近公开机位。", author: "周末摄影", replies: 9, tags: ["避坑", "本地人实测"], hot: false },
  { city: "上海", category: "游玩打卡", title: "一小时只够去哪儿", body: "只有一小时就别排队上高楼，人民广场到南京东路再到外滩这一段更稳。", author: "一小时路线", replies: 18, tags: ["赶时间", "少排队", "替代方案"], hot: false },
  { city: "上海", category: "生活落脚", title: "一个人吃饭不尴尬的位置", body: "南京东路附近找有吧台位或窗口位的小店，翻台快，不需要等大桌。", author: "独行饭友", replies: 21, tags: ["一个人", "少排队"], hot: false },
  { city: "成都", category: "游玩打卡", title: "第一次来成都别把行程排太满", body: "春熙路、太古里、望平街可以连起来，晚上吃饭别只看排队最长的店。", author: "蓉城散步", replies: 22, tags: ["少排队", "替代方案"], hot: true },
  { city: "成都", category: "生活落脚", title: "春熙路一个人吃饭友好点", body: "商场里吧台位更多，雨天也不用跑太远。晚上尽量不要为了网红店跨太多街区。", author: "饭点观察员", replies: 13, tags: ["一个人", "雨天"], hot: false },
  { city: "杭州", category: "避坑安全", title: "西湖夜游不要走太偏的湖边小路", body: "晚上优先走人多和灯光足的路段，打车点提前选在主路。", author: "夜游杭州", replies: 19, tags: ["夜间路线", "一个人"], hot: true },
  { city: "杭州", category: "应急补给", title: "龙翔桥附近寄存行李怎么选", body: "地铁站附近柜子满得快，商场寄存柜更稳，节假日先问服务台。", author: "拖箱实测", replies: 10, tags: ["行李寄存", "拖着行李"], hot: false },
  { city: "北京", category: "城市交通", title: "北京南站第一次换乘先看方向", body: "别急着进闸，先看你要去的线和终点方向。大站换乘距离长，预留 15 分钟。", author: "北漂地图", replies: 17, tags: ["地铁出口", "赶时间"], hot: false },
  { city: "广州", category: "应急补给", title: "广州塔附近可休息补电点", body: "游客中心和部分商场比较稳，夜间江边风大，手机低电量先回商圈。", author: "珠江边", replies: 12, tags: ["免费充电", "夜间路线"], hot: false },
  { city: "海口", category: "应急补给", title: "骑楼老街下雨时怎么走", body: "雨季建议先找骑楼檐下和商场，电动车多，过街慢一点。", author: "岛民提醒", replies: 7, tags: ["雨天", "避雨"], hot: false },
  { city: "台北", category: "城市交通", title: "台北车站别硬找出口", body: "第一次来先看站内区域标识，约人最好约在明确出口或服务台。", author: "换乘记录", replies: 6, tags: ["地铁出口", "第一次来"], hot: false }
];

const resourceTemplates = {
  上海: [
    ["免费充电", "来福士服务台", "步行 6 分钟", "可借应急线，适合低电量先补 15 分钟。"],
    ["公共卫生间", "商场 B1 卫生间", "步行 5 分钟", "比地铁站更好找，夜间更亮。"],
    ["行李寄存", "南京东路寄存柜", "步行 12 分钟", "大箱建议先问服务台，节假日容易满。"],
    ["夜间少走", "偏僻河边小路", "绕开", "去外滩优先走南京东路主路。"]
  ],
  成都: [
    ["一个人吃饭", "春熙路吧台位小店", "步行 4 分钟", "不用等大桌，翻台快。"],
    ["雨天休息", "太古里连廊", "步行 8 分钟", "雨天动线更顺。"],
    ["公共卫生间", "商场 3 楼", "步行 5 分钟", "指引清楚，人流可控。"],
    ["避坑提醒", "超长队网红店", "替代", "排队超过 45 分钟建议换同类型店。"]
  ],
  杭州: [
    ["夜间路线", "湖滨主路", "步行 3 分钟", "灯光足，适合独行。"],
    ["行李寄存", "龙翔桥商场柜", "步行 7 分钟", "比地铁站柜子更稳。"],
    ["公共卫生间", "湖滨银泰", "步行 6 分钟", "商场动线清楚。"],
    ["避坑提醒", "偏僻湖边小路", "绕开", "夜间不建议独行。"]
  ],
  北京: [
    ["地铁换乘", "北京南站服务台", "站内", "第一次来先问方向再进闸。"],
    ["行李寄存", "车站寄存点", "步行 4 分钟", "赶时间时优先站内。"],
    ["公共卫生间", "候车层卫生间", "站内", "人多但稳定。"],
    ["打车提醒", "网约车上车点", "步行 9 分钟", "不要跟随拉客。"]
  ],
  广州: [
    ["免费充电", "游客中心", "步行 6 分钟", "夜间江边风大，先回商圈补电。"],
    ["行李寄存", "商场寄存柜", "步行 8 分钟", "广州塔周边步行前先寄存。"],
    ["公共卫生间", "地铁站内", "步行 5 分钟", "高峰期排队略久。"],
    ["夜间路线", "珠江主路", "推荐", "少走江边偏暗支路。"]
  ],
  海口: [
    ["避雨休息", "骑楼檐下", "步行 2 分钟", "雨季先避雨再规划路线。"],
    ["免费充电", "街区咖啡店", "步行 5 分钟", "点单前问插座。"],
    ["公共卫生间", "游客中心", "步行 9 分钟", "比小店稳定。"],
    ["交通提醒", "电动车密集路口", "慢行", "过街不要只看红绿灯。"]
  ],
  台北: [
    ["换乘咨询", "台北车站服务台", "站内", "先确认区域再找出口。"],
    ["行李寄存", "车站寄物柜", "站内", "热门时间容易满。"],
    ["公共卫生间", "站内卫生间", "站内", "跟随楼层标识。"],
    ["约见提醒", "明确出口见面", "建议", "不要只说台北车站见。"]
  ]
};

let mapChart;

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function switchPanel(panel) {
  state.panel = panel;
  qsa(".panel-view").forEach(view => view.classList.toggle("active", view.id === panel));
  qsa(".nav button").forEach(button => button.classList.toggle("active", button.dataset.panel === panel));
  qs("#panelTitle").textContent = panelTitles[panel];
  if (panel === "home" && mapChart) setTimeout(() => mapChart.resize(), 50);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function initMap() {
  const el = qs("#chinaMap");
  if (!window.echarts || !el) {
    el.textContent = "地图组件加载中。";
    return;
  }
  mapChart = echarts.init(el);
  try {
    let geoJson = window.CHINA_GEO_JSON;
    if (!geoJson) {
      const response = await fetch("./assets/china.geojson");
      geoJson = await response.json();
    }
    echarts.registerMap("china-local", geoJson);
    renderMap();
    mapChart.on("click", params => {
      if (params.seriesType === "effectScatter" && params.data && params.data.name) {
        setCity(params.data.name);
      }
    });
    window.addEventListener("resize", () => mapChart.resize());
  } catch (error) {
    el.textContent = "中国地图数据加载失败，请检查 assets/china.geojson 是否存在。";
  }
}

function renderMap() {
  if (!mapChart) return;
  const cityData = Object.entries(cityStats).map(([name, info]) => ({
    name,
    value: [...info.coord, info.posts],
    itemStyle: { color: name === state.city ? "#f3c64f" : "#6d35d4" }
  }));

  mapChart.setOption({
    tooltip: {
      trigger: "item",
      formatter: params => params.seriesType === "effectScatter"
        ? `${params.name}<br/>今日帖子：${cityStats[params.name].posts}<br/>点击切换城市`
        : params.name
    },
    geo: {
      map: "china-local",
      roam: true,
      zoom: 1.18,
      label: { show: false },
      itemStyle: {
        areaColor: "#cabcf5",
        borderColor: "#ffffff",
        borderWidth: 1.2
      },
      emphasis: {
        label: { show: true, color: "#21143f", fontWeight: 700 },
        itemStyle: { areaColor: "#dcd2ff" }
      }
    },
    series: [
      {
        type: "map",
        map: "china-local",
        geoIndex: 0,
        data: []
      },
      {
        name: "城市入口",
        type: "effectScatter",
        coordinateSystem: "geo",
        rippleEffect: { brushType: "stroke", scale: 3.2 },
        symbolSize: value => Math.max(12, Math.min(24, value[2] / 5)),
        label: {
          show: true,
          formatter: "{b}",
          position: "right",
          color: "#21143f",
          fontWeight: 800
        },
        data: cityData
      }
    ]
  });
}

function setCity(city) {
  state.city = city;
  const info = cityStats[city];
  qs("#currentCityBadge").textContent = `当前：${city}`;
  qs("#cityAvatar").textContent = info.short;
  qs("#cityBriefTitle").textContent = `${city}小抄广场`;
  qs("#cityBriefSub").textContent = `今天 ${info.posts} 条城市经验更新`;
  qs("#hotQuestion").textContent = info.hot;
  qs("#metricPosts").textContent = info.posts;
  qs("#metricResources").textContent = info.resources;
  qs("#metricAvoids").textContent = info.avoids;
  qs("#metricAi").textContent = info.ai;
  qs("#feedTitle").textContent = `${city}本城帖子`;
  qs("#nearbyTitle").textContent = `${city}附近小抄`;
  qs("#locationBadge").textContent = `${state.located ? "已定位" : "模拟定位"}：${info.location}`;
  qs("#composeLocation").value = info.location;
  renderMap();
  renderPosts();
  renderResources();
}

function renderCategories() {
  qs("#categoryGrid").innerHTML = categories.map(category => `
    <button class="${state.category === category.id ? "active" : ""}" data-category="${category.id}">
      ${category.id}<span>${category.desc}</span>
    </button>
  `).join("");
  qsa("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      renderCategories();
      renderPosts();
    });
  });
  qs("#composeCategory").innerHTML = categories.filter(item => item.id !== "全部").map(item => `<option>${item.id}</option>`).join("");
}

function renderTags() {
  qs("#tagStrip").innerHTML = tags.map(tag => `
    <button class="${state.tag === tag ? "active" : ""}" data-tag="${tag}">${tag}</button>
  `).join("");
  qsa("[data-tag]").forEach(button => {
    button.addEventListener("click", () => {
      state.tag = button.dataset.tag;
      renderTags();
      renderPosts();
    });
  });
}

function filteredPosts() {
  const query = state.query.trim().toLowerCase();
  return posts.filter(post => {
    const cityMatch = post.city === state.city;
    const categoryMatch = state.category === "全部" || post.category === state.category;
    const tagMatch = state.tag === "全部" || post.tags.includes(state.tag);
    const text = `${post.title} ${post.body} ${post.category} ${post.tags.join(" ")}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    return cityMatch && categoryMatch && tagMatch && queryMatch;
  });
}

function renderPosts() {
  const list = filteredPosts();
  qs("#postList").innerHTML = list.length ? list.map(post => `
    <article class="post">
      <div class="post-head">
        <h4>${post.title}</h4>
        <span class="tag ${post.hot ? "hot" : ""}">${post.category}</span>
      </div>
      <p>${post.body}</p>
      <div class="post-tags">${post.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      <div class="post-meta">
        <span>${post.author}</span>
        <span>${post.replies} 条回复</span>
        <span>${post.city}</span>
      </div>
    </article>
  `).join("") : `<div class="ai-note">暂时没有匹配帖子。可以发帖求助，让本地人补充经验。</div>`;
}

function renderResources() {
  const list = resourceTemplates[state.city] || [];
  qs("#resourceList").innerHTML = list.map(item => `
    <div class="resource">
      <strong>${item[0]} · ${item[1]}</strong>
      <span>${item[2]}</span>
      <span>${item[3]}</span>
    </div>
  `).join("");
}

function summarizeFeed() {
  const list = filteredPosts();
  if (!list.length) {
    qs("#feedSummary").textContent = "当前没有足够帖子。建议先发帖说明城市、位置、电量、是否独行和想去哪里。";
    return;
  }
  const categoriesText = [...new Set(list.map(post => post.category))].join("、");
  const tagsText = [...new Set(list.flatMap(post => post.tags))].slice(0, 6).join("、");
  qs("#feedSummary").textContent = `基于 ${state.city} 的 ${list.length} 条帖子：当前主要问题集中在 ${categoriesText}。高频标签是 ${tagsText}。建议先解决最近资源，再选择主路或公共交通，最后保存同行卡。`;
}

function askAi() {
  const question = qs("#aiQuestion").value.trim() || `我第一次来${state.city}，现在不知道下一步怎么办。`;
  const info = cityStats[state.city];
  qs("#aiResult").innerHTML = `
    <div class="ai-step"><strong>你的问题</strong><span>${question}</span></div>
    <div class="ai-step"><strong>先做</strong><span>先确认电量、当前位置和最近公共设施。若手机低于 20%，优先去服务台、地铁客服中心或商场补电。</span></div>
    <div class="ai-step"><strong>最近去哪</strong><span>你当前在 ${info.location} 附近，先查看附近小抄里的充电点、公共卫生间和寄存点。</span></div>
    <div class="ai-step"><strong>怎么走</strong><span>第一次坐地铁时先看方向，再看出口。夜间优先主路、商圈和地铁站路线。</span></div>
    <div class="ai-step"><strong>避开什么</strong><span>避开主动拉客拍照、黑车、夜间偏僻小路和超过 45 分钟排队的网红点。</span></div>
    <div class="ai-step"><strong>发给朋友</strong><span>我在${state.city}${info.location}附近，准备按陌城小抄路线走。如果 30 分钟没回复，请联系我。</span></div>
  `;
}

function openModal(id) {
  qs(`#${id}`).classList.add("open");
  qs(`#${id}`).setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  qs(`#${id}`).classList.remove("open");
  qs(`#${id}`).setAttribute("aria-hidden", "true");
}

function publishPost() {
  const checked = qsa(".checkbox-grid input:checked").map(input => input.value);
  posts.unshift({
    city: state.city,
    category: qs("#composeCategory").value,
    title: qs("#composeTitle").value || "新求助",
    body: qs("#composeBody").value || "想问问本地人有没有更稳的建议。",
    author: state.profile.nickname,
    replies: 0,
    tags: checked.filter(tag => tag !== "允许AI总结"),
    hot: false
  });
  closeModal("composerModal");
  switchPanel("posts");
  renderPosts();
  showToast(`已发布到${state.city}本城帖子`);
}

function saveProfile() {
  state.profile.nickname = qs("#nicknameInput").value || "刚到这座城";
  state.profile.avatar = qs("#avatarInput").value.slice(0, 1) || "旅";
  state.profile.role = qs("#roleInput").value;
  syncProfile();
  closeModal("profileModal");
  showToast("身份资料已保存");
}

function syncProfile() {
  qs("#topAvatar").textContent = state.profile.avatar;
  qs("#topNickname").textContent = state.profile.nickname;
  qs("#profileAvatar").textContent = state.profile.avatar;
  qs("#profileName").textContent = state.profile.nickname;
  qs("#profileRole").textContent = state.profile.role;
}

function showToast(text) {
  const toast = qs("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function bindEvents() {
  qsa("[data-panel]").forEach(button => button.addEventListener("click", () => switchPanel(button.dataset.panel)));
  qs("#openComposer").addEventListener("click", () => openModal("composerModal"));
  qs("#openProfile").addEventListener("click", () => openModal("profileModal"));
  qs("#editProfile").addEventListener("click", () => openModal("profileModal"));
  qsa("[data-close]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.close)));
  qsa(".modal").forEach(modal => modal.addEventListener("click", event => {
    if (event.target === modal) closeModal(modal.id);
  }));

  qs("#searchInput").addEventListener("input", event => {
    state.query = event.target.value;
    switchPanel("posts");
    renderPosts();
  });

  qs("#resetFilters").addEventListener("click", () => {
    state.category = "全部";
    state.tag = "全部";
    state.query = "";
    qs("#searchInput").value = "";
    renderCategories();
    renderTags();
    renderPosts();
  });

  qsa("[data-quick]").forEach(button => button.addEventListener("click", () => {
    state.query = button.dataset.quick;
    qs("#searchInput").value = state.query;
    switchPanel("posts");
    renderPosts();
  }));

  qs("#locateBtn").addEventListener("click", () => {
    state.located = true;
    qs("#locationBadge").textContent = `已定位：${cityStats[state.city].location}`;
    switchPanel("nearby");
    showToast("已模拟授权定位，附近资源按距离优先显示");
  });

  qs("#summarizeFeed").addEventListener("click", summarizeFeed);
  qs("#askAi").addEventListener("click", askAi);
  qs("#publishPost").addEventListener("click", publishPost);
  qs("#saveProfile").addEventListener("click", saveProfile);
}

function init() {
  bindEvents();
  renderCategories();
  renderTags();
  renderPosts();
  renderResources();
  askAi();
  syncProfile();
  setCity(state.city);
  initMap();
  if (window.lucide) window.lucide.createIcons();
}

init();
