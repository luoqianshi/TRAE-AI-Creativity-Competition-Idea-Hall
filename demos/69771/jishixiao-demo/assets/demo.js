// =============================================
// 及时晓 Demo - 响应式H5 交互逻辑
// =============================================
(function() {
  'use strict';

  // --- Category Config ---
  var CATEGORIES = [
    { id: 'social', name: '社会人文', color: '#6366f1', icon: 'S' },
    { id: 'fraud',  name: '电诈园区', color: '#e63946', icon: 'F' },
    { id: 'agent',  name: '中介',     color: '#f59e0b', icon: 'Z' },
    { id: 'scenic', name: '景点',     color: '#10b981', icon: 'J' },
    { id: 'travel', name: '旅行',     color: '#3b82f6', icon: 'L' },
    { id: 'beauty', name: '美容理发', color: '#ec4899', icon: 'M' },
    { id: 'medical',name: '医疗整容', color: '#8b5cf6', icon: 'Y' },
    { id: 'elderly', name: '老年人',  color: '#f97316', icon: 'O' },
    { id: 'mom',    name: '宝妈',     color: '#14b8a6', icon: 'B' }
  ];

  var catMap = {};
  CATEGORIES.forEach(function(c) { catMap[c.id] = c; });

  // --- Mock News Data ---
  var NEWS = [
    { id:1,  cat:'fraud',  title:'警方破获特大电信诈骗团伙 涉案金额超2000万元', source:'XX市公安局', date:'2026-06-28', loc:'城东科技园区', x:72, y:38, phase:1, url:'#', desc:'XX市公安局成功破获一个以"投资理财"为名义的电信诈骗团伙，抓获犯罪嫌疑人15名，涉案金额超过2000万元。目前案件正在进一步审理中。' },
    { id:2,  cat:'beauty',  title:'某连锁美容院涉嫌预付卡欺诈 被市场监管部门立案', source:'XX市市场监督管理局', date:'2026-06-25', loc:'中心商业区', x:38, y:28, phase:1, url:'#', desc:'XX市市场监督管理局接到多名消费者投诉，反映某连锁美容院在收取大额预付款后突然闭店。监管部门已对此立案调查，并发布消费预警公告。' },
    { id:3,  cat:'agent',  title:'租房中介违规操作曝光 多名租客权益受损', source:'XX电视台', date:'2026-06-22', loc:'大学城片区', x:15, y:42, phase:1, url:'#', desc:'XX电视台《消费观察》栏目接到多名大学毕业生投诉，反映部分房屋中介存在虚假宣传房源、违规收取中介费等问题。记者实地暗访核实后进行了报道。' },
    { id:4,  cat:'travel',  title:'低价旅游团强制购物案 旅行社被吊销执照', source:'XX省文化和旅游厅', date:'2026-06-20', loc:'旅游景区', x:82, y:18, phase:1, url:'#', desc:'XX省文化和旅游厅通报，某旅行社以"999元五日游"吸引游客后，在行程中多次强制游客购物，涉及金额较大。监管部门依法吊销该旅行社经营许可证。' },
    { id:5,  cat:'elderly', title:'针对老年人的"免费体检"骗局被曝光', source:'XX日报', date:'2026-06-18', loc:'城南新区', x:52, y:68, phase:1, url:'#', desc:'XX日报报道，有不法分子在社区以"免费体检"为名，针对老年人推销高价保健品。多名老年人被骗取数千至数万元。社区居委会已发布预警通知。' },
    { id:6,  cat:'mom',    title:'母婴店销售过期奶粉 消费者举报后被查处', source:'XX市市场监管局', date:'2026-06-15', loc:'中心商业区', x:35, y:35, phase:1, url:'#', desc:'XX市市场监督管理局接到宝妈举报，某母婴店销售的婴幼儿奶粉已过保质期。执法人员现场查扣过期产品32罐，并对该店处以行政处罚。' },
    { id:7,  cat:'medical', title:'某整形机构无证经营被卫健委取缔', source:'XX市卫生健康委员会', date:'2026-06-12', loc:'火车站商圈', x:68, y:50, phase:1, url:'#', desc:'XX市卫生健康委员会联合执法部门，取缔一家无医疗机构执业许可证的整形美容机构。该机构在社交媒体发布广告吸引消费者，多名消费者术后出现并发症。' },
    { id:8,  cat:'scenic',  title:'景区"天价餐饮"被消费者投诉 物价部门介入', source:'XX省消费者协会', date:'2026-06-10', loc:'旅游景区', x:80, y:22, phase:1, url:'#', desc:'多名消费者投诉某景区内餐厅存在"天价菜"现象，一份普通炒饭售价128元。省消费者协会介入调查后，景区管理方已对涉事餐厅进行整顿。' },
    { id:9,  cat:'social',  title:'社区健身馆预售跑路 涉及会员超300人', source:'XX电视台', date:'2026-06-08', loc:'城南新区', x:55, y:72, phase:1, url:'#', desc:'XX电视台报道，某社区健身馆在大量促销预售会员卡后突然关门停业，涉及会员超过300人，涉案金额约50万元。目前相关部门已介入处理。' },
    { id:10, cat:'fraud',  title:'"刷单返利"网络诈骗猖獗 警方发布防骗提示', source:'XX市公安局反诈中心', date:'2026-06-05', loc:'大学城片区', x:18, y:38, phase:1, url:'#', desc:'XX市公安局反诈中心通报，近期"刷单返利"类网络诈骗案件高发，受害人多为大学生和年轻上班族。警方提醒市民提高警惕，切勿轻信"轻松赚钱"的信息。' },
    { id:11, cat:'elderly', title:'保健品推销员冒充"专家"骗取老人信任', source:'XX省消费者协会', date:'2026-06-02', loc:'城东科技园区', x:75, y:42, phase:1, url:'#', desc:'省消协发布消费警示，有不法分子冒充"健康专家"，以免费讲座形式向老年人推销高价保健品，声称能治疗多种慢性疾病。多名老人被骗。' },
    { id:12, cat:'beauty',  title:'理发店"充值陷阱"曝光 预付金额翻倍后闭店', source:'XX市消费者委员会', date:'2026-05-30', loc:'中心商业区', x:42, y:22, phase:1, url:'#', desc:'市消委会接到群体投诉，某连锁理发店以"充值翻倍"活动诱导消费者充值，充值金额从数千到数万元不等，随后突然关闭所有门店。' },
    { id:13, cat:'travel',  title:'在线旅游平台"大数据杀熟"被监管部门约谈', source:'XX市市场监督管理局', date:'2026-05-28', loc:'火车站商圈', x:65, y:55, phase:1, url:'#', desc:'市市场监管局对某在线旅游平台涉嫌"大数据杀熟"行为进行约谈。消费者反映，同一酒店同一日期，不同用户显示的价格差异明显。平台承诺整改。' },
    { id:14, cat:'medical', title:'祛斑产品含违禁成分 消费者使用后面部红肿', source:'XX省药品监督管理局', date:'2026-05-25', loc:'城南新区', x:48, y:65, phase:1, url:'#', desc:'省药监局发布消费警示，某品牌祛斑面霜被检测出含有违禁成分氢醌。多名消费者使用后出现面部红肿、脱皮等不良反应。监管部门已责令下架并立案调查。' },
    { id:15, cat:'agent',  title:'"串串房"甲醛超标 租客维权遭遇推诿', source:'XX电视台', date:'2026-05-22', loc:'大学城片区', x:12, y:50, phase:1, url:'#', desc:'XX电视台报道，多名租客反映入住新装修的出租房后出现身体不适，经检测甲醛超标严重。房屋中介和房东互相推诿，维权困难。住建部门已介入调查。' },
    { id:16, cat:'mom',    title:'早教机构突然关门 预付学费无法退还', source:'XX市市场监督管理局', date:'2026-05-18', loc:'中心商业区', x:30, y:32, phase:1, url:'#', desc:'市市场监管局接到群体投诉，某早教机构在收取大量家长预付学费后突然停止运营，涉及金额超过200万元。部分家长已向法院提起诉讼。' },
    { id:17, cat:'scenic', title:'景区"假门票"诈骗团伙被抓获', source:'XX市公安局', date:'2026-05-15', loc:'旅游景区', x:85, y:15, phase:1, url:'#', desc:'市公安局旅游警察支队抓获一个在景区周边销售"假门票"的诈骗团伙，团伙成员以"内部渠道低价票"为诱饵，骗取游客钱财。抓获嫌疑人8名。' },
    { id:18, cat:'social',  title:'物业公司违规收取"装修押金" 业主投诉获退回', source:'XX市住建局', date:'2026-05-12', loc:'城南新区', x:58, y:75, phase:1, url:'#', desc:'市住建局接到业主投诉，某物业公司在没有法律依据的情况下强制收取"装修押金"。经监管部门介入，物业公司已将违规收取的费用全部退还。' },
    { id:19, cat:'fraud',  title:'"消除不良记录"骗局针对网贷人群', source:'XX市公安局', date:'2026-05-08', loc:'城东科技园区', x:70, y:45, phase:1, url:'#', desc:'警方通报，有不法分子在网上发布"帮你消除征信不良记录"的广告，诱骗有网贷记录的人群缴纳"服务费"。多名受害人被骗取数千元。警方提醒：征信记录无法人为删除。' },
    { id:20, cat:'elderly', title:'"以房养老"诈骗案宣判 主犯获刑12年', source:'XX省高级人民法院', date:'2026-05-05', loc:'火车站商圈', x:72, y:58, phase:1, url:'#', desc:'省高院通报，一起以"以房养老"为名针对老年人的诈骗案宣判，主犯被判处有期徒刑12年。该团伙以高回报率为诱饵，诱骗多名老年人将房产抵押借款，造成巨额损失。' },
    { id:21, cat:'beauty',  title:'美容院注射"不明填充物"致消费者面部变形', source:'XX市卫生健康委员会', date:'2026-05-02', loc:'中心商业区', x:33, y:25, phase:1, url:'#', desc:'市卫健委通报，某消费者在无资质美容院注射"不明填充物"后出现面部变形、持续疼痛等症状。经调查，该美容院使用的注射材料来源不明，涉嫌非法行医。' },
    { id:22, cat:'travel',  title:'"旅游预付卡"陷阱 消费者预存金额无法消费', source:'XX省消费者协会', date:'2026-04-28', loc:'旅游景区', x:78, y:28, phase:1, url:'#', desc:'省消协通报，多名消费者购买某旅游公司的"预付旅游卡"后，在消费时被告知"卡内余额不足以支付"，需额外补缴费用。部分消费者预存金额超过1万元。' },
    { id:23, cat:'medical', title:'某医美机构虚假宣传"韩国专家"被处罚', source:'XX市市场监督管理局', date:'2026-04-25', loc:'中心商业区', x:40, y:20, phase:1, url:'#', desc:'市市场监管局查处某医美机构虚假宣传行为，该机构在广告中宣称拥有"韩国顶级专家团队"，实际并无任何外籍医师。监管部门处以罚款并责令整改。' },
    { id:24, cat:'mom',    title:'网购儿童玩具存在安全隐患 监管部门召回', source:'XX省市场监督管理局', date:'2026-04-22', loc:'城南新区', x:50, y:70, phase:1, url:'#', desc:'省市场监管局发布召回公告，某品牌儿童玩具经检测存在小零件脱落、锐利边缘等安全隐患，可能对儿童造成伤害。消费者可凭购买凭证办理退货退款。' }
  ];

  // --- State ---
  var activePage = 'home';    // home, nearby, guide, about, profile
  var activeCat = 'all';
  var activePopup = null;
  var searchKeyword = '';
  var activeCity = 'beijing';

  // --- City Config ---
  var CITIES = [
    { id: 'beijing',  name: '北京',  label: 'BJ' },
    { id: 'shanghai', name: '上海',  label: 'SH' },
    { id: 'guangzhou', name: '广州', label: 'GZ' },
    { id: 'shenzhen',  name: '深圳',  label: 'SZ' },
    { id: 'chengdu',   name: '成都',  label: 'CD' },
    { id: 'wuhan',     name: '武汉',  label: 'WH' },
    { id: 'hangzhou',  name: '杭州',  label: 'HZ' },
    { id: 'nanjing',   name: '南京',  label: 'NJ' }
  ];

  // --- DOM refs ---
  var $sidebarNav   = document.getElementById('sidebarNav');
  var $channelTabs  = document.getElementById('channelTabs');
  var $feedList     = document.getElementById('feedList');
  var $pageHome     = document.getElementById('pageHome');
  var $pageNearby   = document.getElementById('pageNearby');
  var $pageGuide    = document.getElementById('pageGuide');
  var $pageAbout    = document.getElementById('pageAbout');
  var $pageProfile  = document.getElementById('pageProfile');
  var $pinsContainer = document.getElementById('pinsContainer');
  var $nearbyToggle = document.getElementById('nearbyToggle');
  var $nearbyViewMap = document.getElementById('nearbyViewMap');
  var $nearbyViewArticles = document.getElementById('nearbyViewArticles');
  var $nearbyFeed  = document.getElementById('nearbyFeed');
  var $citySelect   = document.getElementById('citySelect');
  var $cityName     = document.getElementById('cityName');
  var $cityDropdown = document.getElementById('cityDropdown');
  var $bottomNav    = document.getElementById('bottomNav');
  var $modalOverlay = document.getElementById('modalOverlay');
  var $modalContent = document.getElementById('modalContent');
  var $searchInput  = document.getElementById('searchInput');
  var $carousel     = document.getElementById('carousel');
  var $carouselTrack = document.getElementById('carouselTrack');
  var $carouselDots = document.getElementById('carouselDots');
  var $carPrev      = document.getElementById('carPrev');
  var $carNext      = document.getElementById('carNext');

  // Page elements map
  var pageMap = {
    home: $pageHome,
    nearby: $pageNearby,
    guide: $pageGuide,
    about: $pageAbout,
    profile: $pageProfile
  };

  // --- Init ---
  function init() {
    renderFeed();
    renderPins();
    renderNearbyArticles();
    renderCityDropdown();
    initCarousel();
    bindEvents();
  }

  // --- Page Switching ---
  function switchPage(pageName) {
    activePage = pageName;

    // Toggle page views
    Object.keys(pageMap).forEach(function(key) {
      pageMap[key].classList.toggle('active', key === pageName);
    });

    // Show/hide carousel & channel tabs (only on home page)
    $carousel.style.display = (pageName === 'home') ? 'block' : 'none';
    $channelTabs.style.display = (pageName === 'home') ? 'flex' : 'none';

    // Sync sidebar nav
    var sideLinks = $sidebarNav.querySelectorAll('a');
    sideLinks.forEach(function(link) {
      link.classList.toggle('active', link.getAttribute('data-page') === pageName);
    });

    // Sync bottom nav
    var navItems = $bottomNav.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
      item.classList.toggle('active', item.getAttribute('data-page') === pageName);
    });

    // Sync channel tabs
    if (pageName === 'home') {
      var tabs = $channelTabs.querySelectorAll('.channel-tab');
      tabs.forEach(function(tab) {
        var tabCat = tab.getAttribute('data-cat');
        if (activeCat === 'all') {
          tab.classList.toggle('active', !tabCat);
        } else {
          tab.classList.toggle('active', tabCat === activeCat);
        }
      });
    }

    // Scroll content to top
    var contentEl = document.querySelector('.content');
    if (contentEl) contentEl.scrollTop = 0;
  }

  // --- Category Filter Chips ---
  function setCatFilter(catId) {
    activeCat = catId;
    // Sync channel tabs
    var tabs = $channelTabs.querySelectorAll('.channel-tab');
    tabs.forEach(function(tab) {
      var tabCat = tab.getAttribute('data-cat');
      if (catId === 'all') {
        tab.classList.toggle('active', !tabCat);
      } else {
        tab.classList.toggle('active', tabCat === catId);
      }
    });
    renderFeed();
  }

  // --- Feed Cards ---
  function getFilteredNews() {
    var list = NEWS;
    if (activeCat !== 'all') {
      list = list.filter(function(n) { return n.cat === activeCat; });
    }
    if (searchKeyword) {
      var kw = searchKeyword.toLowerCase();
      list = list.filter(function(n) {
        return n.title.toLowerCase().indexOf(kw) >= 0 ||
               n.desc.toLowerCase().indexOf(kw) >= 0 ||
               n.source.toLowerCase().indexOf(kw) >= 0 ||
               n.loc.toLowerCase().indexOf(kw) >= 0;
      });
    }
    return list;
  }

  function renderFeed() {
    var items = getFilteredNews();
    if (items.length === 0) {
      $feedList.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--muted);font-size:.85rem;">暂无相关消费风险标记</div>';
      return;
    }
    var html = '';
    items.forEach(function(n, i) {
      var cat = catMap[n.cat];
      var hasThumb = (i % 2 === 1);
      html += '<div class="feed-card" data-id="' + n.id + '">';
      html += '  <div class="card-body">';
      html += '    <span class="card-tag" style="background:' + cat.color + '">' + cat.name + '</span>';
      html += '    <div class="card-title">' + n.title + '</div>';
      html += '    <div class="card-meta">';
      html += '      <span>' + n.source + '</span>';
      html += '      <span>' + n.date + '</span>';
      html += '      <span>&#128205; ' + n.loc + '</span>';
      html += '    </div>';
      if (!hasThumb) {
        html += '  <div class="card-desc">' + n.desc + '</div>';
      }
      html += '  </div>';
      if (hasThumb) {
        html += '  <div class="card-thumb" style="background:' + cat.color + '22">';
        html += '    <span class="thumb-icon">' + cat.icon + '</span>';
        html += '    <span class="thumb-cat" style="background:' + cat.color + '">' + cat.name.substring(0, 2) + '</span>';
        html += '  </div>';
      }
      html += '</div>';
    });
    $feedList.innerHTML = html;
  }

  // --- Map Pins ---
  function renderPins() {
    var used = {};
    var clusters = [];
    NEWS.forEach(function(n) {
      if (used[n.id]) return;
      var cluster = [n];
      used[n.id] = true;
      NEWS.forEach(function(m) {
        if (!used[m.id] && Math.abs(m.x - n.x) < 8 && Math.abs(m.y - n.y) < 8) {
          cluster.push(m);
          used[m.id] = true;
        }
      });
      clusters.push({ items: cluster, x: cluster[0].x, y: cluster[0].y, cat: cluster[0].cat });
    });
    var html = '';
    clusters.forEach(function(cl) {
      var cat = catMap[cl.cat];
      html += '<div class="pin" data-x="' + cl.x + '" data-y="' + cl.y + '" style="left:' + cl.x + '%;top:' + cl.y + '%;margin-left:-14px;margin-top:-14px;background:' + cat.color + '">';
      html += '  <span class="pin-icon">' + cat.icon + '</span>';
      if (cl.items.length > 1) {
        html += '  <span class="pin-count">' + cl.items.length + '</span>';
      }
      html += '  <div class="pin-popup">';
      html += '    <div class="pop-title">' + cl.items[0].title + '</div>';
      html += '    <div class="pop-meta">' + cl.items[0].source + ' | ' + cl.items[0].loc + '</div>';
      html += '    <a class="pop-link" href="javascript:void(0)" data-id="' + cl.items[0].id + '">查看详情 &#8594;</a>';
      if (cl.items.length > 1) {
        html += '    <div style="font-size:.68rem;color:var(--muted);margin-top:3px;">附近还有 ' + (cl.items.length - 1) + ' 条标记</div>';
      }
      html += '  </div>';
      html += '</div>';
    });
    $pinsContainer.innerHTML = html;
  }

  // --- Nearby Articles View (文章卡片) ---
  function renderNearbyArticles() {
    var html = '';
    NEWS.forEach(function(n, i) {
      var cat = catMap[n.cat];
      var hasThumb = (i % 2 === 1);
      html += '<div class="feed-card" data-id="' + n.id + '">';
      html += '  <div class="card-body">';
      html += '    <span class="card-tag" style="background:' + cat.color + '">' + cat.name + '</span>';
      html += '    <div class="card-title">' + n.title + '</div>';
      html += '    <div class="card-meta">';
      html += '      <span>' + n.source + '</span>';
      html += '      <span>' + n.date + '</span>';
      html += '      <span>&#128205; ' + n.loc + '</span>';
      html += '    </div>';
      if (!hasThumb) {
        html += '  <div class="card-desc">' + n.desc + '</div>';
      }
      html += '  </div>';
      if (hasThumb) {
        html += '  <div class="card-thumb" style="background:' + cat.color + '22">';
        html += '    <span class="thumb-icon">' + cat.icon + '</span>';
        html += '    <span class="thumb-cat" style="background:' + cat.color + '">' + cat.name.substring(0, 2) + '</span>';
        html += '  </div>';
      }
      html += '</div>';
    });
    $nearbyFeed.innerHTML = html;
  }

  // --- City Dropdown ---
  function renderCityDropdown() {
    var html = '';
    CITIES.forEach(function(c) {
      var isActive = c.id === activeCity;
      html += '<div class="city-dropdown-item' + (isActive ? ' active' : '') + '" data-city="' + c.id + '" data-name="' + c.name + '">';
      html += '  <span class="cd-dot"></span>' + c.name + ' (' + c.label + ')';
      html += '</div>';
    });
    $cityDropdown.innerHTML = html;
  }

  function selectCity(cityId, cityName) {
    activeCity = cityId;
    $cityName.textContent = cityName;
    $cityDropdown.classList.remove('show');
    $citySelect.classList.remove('open');
    renderCityDropdown();
    // Demo: re-render with same data (in production, would fetch city-specific data)
    renderPins();
    renderNearbyArticles();
  }

  // --- Carousel ---
  var carIdx = 0;
  var carTimer = null;
  var carSlides = 0;

  function initCarousel() {
    carSlides = $carouselTrack.children.length;
    if (carSlides === 0) return;

    // Render dots
    var html = '';
    for (var i = 0; i < carSlides; i++) {
      html += '<span class="carousel-dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"></span>';
    }
    $carouselDots.innerHTML = html;

    // Auto play
    startCarousel();

    // Click events
    $carouselDots.addEventListener('click', function(e) {
      var dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      goToSlide(parseInt(dot.getAttribute('data-idx')));
    });

    $carPrev.addEventListener('click', function() {
      goToSlide(carIdx - 1 < 0 ? carSlides - 1 : carIdx - 1);
    });

    $carNext.addEventListener('click', function() {
      goToSlide(carIdx + 1 >= carSlides ? 0 : carIdx + 1);
    });

    // Pause on hover
    $carousel.addEventListener('mouseenter', stopCarousel);
    $carousel.addEventListener('mouseleave', startCarousel);
  }

  function goToSlide(idx) {
    carIdx = idx;
    $carouselTrack.style.transform = 'translateX(-' + (idx * 100) + '%)';
    var dots = $carouselDots.querySelectorAll('.carousel-dot');
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  function startCarousel() {
    if (carTimer) clearInterval(carTimer);
    carTimer = setInterval(function() {
      goToSlide(carIdx + 1 >= carSlides ? 0 : carIdx + 1);
    }, 4000);
  }

  function stopCarousel() {
    if (carTimer) {
      clearInterval(carTimer);
      carTimer = null;
    }
  }

  // --- Modal ---
  function showModal(newsId) {
    var n = NEWS.find(function(item) { return item.id === newsId; });
    if (!n) return;
    var cat = catMap[n.cat];
    var html = '<span class="modal-tag" style="background:' + cat.color + '">' + cat.name + '</span>';
    html += '<div class="modal-title">' + n.title + '</div>';
    html += '<div class="modal-meta">';
    html += '  <span>&#128197; ' + n.date + '</span>';
    html += '  <span>&#127968; ' + n.source + '</span>';
    html += '  <span>&#128205; ' + n.loc + '</span>';
    if (n.phase === 1) {
      html += '  <span>&#9989; 阶段一 · 官媒来源</span>';
    } else {
      html += '  <span>&#128270; 阶段二 · 已审核</span>';
    }
    html += '</div>';
    html += '<div class="modal-desc">' + n.desc + '</div>';
    html += '<a class="modal-link" href="' + n.url + '" target="_blank">&#128279; 查看原文报道 &#8594;</a>';
    html += '<div class="modal-disclaimer">声明：以上信息来源于政府公告及权威媒体报道，及时晓仅做信息索引与地理标记，不发布任何原始内容。点击"查看原文"将跳转至来源网站阅读完整报道。</div>';
    $modalContent.innerHTML = html;
    $modalOverlay.classList.add('show');
  }

  function hideModal() {
    $modalOverlay.classList.remove('show');
  }

  // --- Events ---
  function bindEvents() {

    // Sidebar nav click (PC)
    $sidebarNav.addEventListener('click', function(e) {
      var link = e.target.closest('a[data-page]');
      if (!link) return;
      var page = link.getAttribute('data-page');
      switchPage(page);
    });

    // Channel tabs click
    $channelTabs.addEventListener('click', function(e) {
      var tab = e.target.closest('.channel-tab');
      if (!tab) return;
      var tabCat = tab.getAttribute('data-cat');
      // Ensure on home page
      switchPage('home');
      if (tabCat) {
        setCatFilter(tabCat);
      } else {
        setCatFilter('all');
      }
    });

    // Bottom nav click (mobile)
    $bottomNav.addEventListener('click', function(e) {
      var item = e.target.closest('.nav-item');
      if (!item) return;
      var page = item.getAttribute('data-page');
      if (page) switchPage(page);
    });

    // Nearby toggle (地图/文章)
    $nearbyToggle.addEventListener('click', function(e) {
      var btn = e.target.closest('.nearby-toggle-btn');
      if (!btn) return;
      var view = btn.getAttribute('data-view');
      $nearbyToggle.querySelectorAll('.nearby-toggle-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      $nearbyViewMap.style.display = (view === 'map') ? 'block' : 'none';
      $nearbyViewArticles.style.display = (view === 'articles') ? 'block' : 'none';
    });

    // City select toggle
    $citySelect.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = $cityDropdown.classList.contains('show');
      $cityDropdown.classList.toggle('show', !isOpen);
      $citySelect.classList.toggle('open', !isOpen);
    });

    // City dropdown item click
    $cityDropdown.addEventListener('click', function(e) {
      var item = e.target.closest('.city-dropdown-item');
      if (!item) return;
      e.stopPropagation();
      selectCity(item.getAttribute('data-city'), item.getAttribute('data-name'));
    });

    // Close city dropdown on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#citySelect')) {
        $cityDropdown.classList.remove('show');
        $citySelect.classList.remove('open');
      }
    });

    // Feed card click
    $feedList.addEventListener('click', function(e) {
      var card = e.target.closest('.feed-card');
      if (!card) return;
      showModal(parseInt(card.getAttribute('data-id')));
    });

    // Nearby articles feed card click
    $nearbyFeed.addEventListener('click', function(e) {
      var card = e.target.closest('.feed-card');
      if (!card) return;
      showModal(parseInt(card.getAttribute('data-id')));
    });

    // Pin click (map)
    $pinsContainer.addEventListener('click', function(e) {
      var pin = e.target.closest('.pin');
      if (!pin) return;
      var link = e.target.closest('.pop-link[data-id]');
      if (link) {
        e.stopPropagation();
        showModal(parseInt(link.getAttribute('data-id')));
        return;
      }
      var popup = pin.querySelector('.pin-popup');
      if (activePopup && activePopup !== popup) {
        activePopup.classList.remove('show');
      }
      popup.classList.toggle('show');
      activePopup = popup.classList.contains('show') ? popup : null;
    });

    // Close popup on map outside click
    document.getElementById('mapContainer').addEventListener('click', function(e) {
      if (!e.target.closest('.pin') && activePopup) {
        activePopup.classList.remove('show');
        activePopup = null;
      }
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', hideModal);
    $modalOverlay.addEventListener('click', function(e) {
      if (e.target === this) hideModal();
    });

    // Search input
    $searchInput.addEventListener('input', function() {
      searchKeyword = this.value.trim();
      if (activePage === 'home') {
        renderFeed();
      }
    });

    // ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideModal();
        if (activePopup) {
          activePopup.classList.remove('show');
          activePopup = null;
        }
      }
    });
  }

  // --- Boot ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
