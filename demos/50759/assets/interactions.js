(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  var metaRow = document.querySelector('.meta-row');
  var progress = document.querySelector('.progress-bar');

  var nav = document.createElement('nav');
  nav.className = 'quick-nav';
  nav.setAttribute('aria-label', '章节导航');

  sections.forEach(function (section, index) {
    var h2 = section.querySelector('h2');
    if (!h2) return;

    var id = 'section-' + (index + 1);
    section.id = id;

    var body = document.createElement('div');
    body.className = 'section-body';
    while (h2.nextSibling) body.appendChild(h2.nextSibling);

    var head = document.createElement('div');
    head.className = 'section-head';
    h2.parentNode.insertBefore(head, h2);
    head.appendChild(h2);

    var toggle = document.createElement('button');
    toggle.className = 'section-toggle';
    toggle.type = 'button';
    toggle.textContent = '收起';
    toggle.setAttribute('aria-expanded', 'true');
    head.appendChild(toggle);
    section.appendChild(body);

    toggle.addEventListener('click', function () {
      var collapsed = section.classList.toggle('collapsed');
      toggle.textContent = collapsed ? '展开' : '收起';
      toggle.setAttribute('aria-expanded', String(!collapsed));
    });

    var link = document.createElement('a');
    link.href = '#' + id;
    link.textContent = h2.textContent.replace(/^[一二三四五六七]、/, '');
    nav.appendChild(link);
  });

  var spacer = document.createElement('span');
  spacer.className = 'nav-spacer';
  nav.appendChild(spacer);

  var expandAll = document.createElement('button');
  expandAll.className = 'control-btn';
  expandAll.type = 'button';
  expandAll.textContent = '全部展开';
  nav.appendChild(expandAll);

  var collapseAll = document.createElement('button');
  collapseAll.className = 'control-btn';
  collapseAll.type = 'button';
  collapseAll.textContent = '全部收起';
  nav.appendChild(collapseAll);

  if (metaRow) metaRow.insertAdjacentElement('afterend', nav);

  expandAll.addEventListener('click', function () {
    sections.forEach(function (section) {
      section.classList.remove('collapsed');
      var btn = section.querySelector('.section-toggle');
      if (btn) {
        btn.textContent = '收起';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  collapseAll.addEventListener('click', function () {
    sections.forEach(function (section) {
      section.classList.add('collapsed');
      var btn = section.querySelector('.section-toggle');
      if (btn) {
        btn.textContent = '展开';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  var roleData = {
    investor: {
      label: '投资者视角',
      title: '投资者：识别政策、行业与资产价格的传导关系',
      copy: '系统优先呈现事件的市场影响、产业链位置、风险变量与后续观察指标，帮助用户避免只看单条资讯带来的判断偏差。',
      metrics: [
        ['影响判断', 92],
        ['风险提示', 84],
        ['长期跟踪', 88]
      ]
    },
    professional: {
      label: '职场人视角',
      title: '职场人：判断产业变化与职业能力的关联',
      copy: '系统将宏观事件转化为行业变化、岗位影响、能力要求和机会窗口，使信息从新闻阅读进入职业规划。',
      metrics: [
        ['行业关联', 86],
        ['岗位影响', 78],
        ['行动参考', 82]
      ]
    },
    parent: {
      label: '父母视角',
      title: '父母：理解公共政策、教育趋势与家庭决策',
      copy: '系统把教育、科技、公共政策等信息转译为家庭层面的影响分析，支持更稳健的育儿与教育选择。',
      metrics: [
        ['家庭影响', 89],
        ['政策解读', 80],
        ['决策辅助', 76]
      ]
    },
    student: {
      label: '学生视角',
      title: '学生：把热点事件转化为知识路径',
      copy: '系统补齐背景概念、关键人物、学科联系和延伸阅读路径，帮助学生从热点理解走向系统学习。',
      metrics: [
        ['知识补全', 91],
        ['跨学科联系', 83],
        ['学习路径', 87]
      ]
    }
  };

  function renderRole(key, panel) {
    var data = roleData[key];
    if (!data) return;
    panel.querySelector('.role-copy h3').textContent = data.title;
    panel.querySelector('.role-copy p').textContent = data.copy;
    panel.querySelector('.role-metrics').innerHTML = data.metrics.map(function (item) {
      return '<div class="metric-line"><span><b>' + item[0] + '</b><em>' + item[1] + '%</em></span><i style="--w:' + item[1] + '%"></i></div>';
    }).join('');
    Array.prototype.forEach.call(panel.querySelectorAll('.role-tab'), function (button) {
      button.classList.toggle('active', button.dataset.role === key);
    });
  }

  var audienceSection = sections.find(function (section) {
    var title = section.querySelector('h2');
    return title && title.textContent.indexOf('目标用户') > -1;
  });

  if (audienceSection) {
    var audienceBody = audienceSection.querySelector('.section-body');
    var panel = document.createElement('div');
    panel.className = 'role-panel';
    panel.innerHTML = '<div class="role-tabs"></div><div class="role-content"><div class="role-copy"><h3></h3><p></p></div><div class="role-metrics"></div></div>';
    Object.keys(roleData).forEach(function (key) {
      var button = document.createElement('button');
      button.className = 'role-tab';
      button.type = 'button';
      button.dataset.role = key;
      button.textContent = roleData[key].label;
      panel.querySelector('.role-tabs').appendChild(button);
      button.addEventListener('click', function () {
        renderRole(key, panel);
      });
    });
    audienceBody.appendChild(panel);
    renderRole('investor', panel);
  }

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    if (progress) progress.style.width = pct + '%';

    var activeId = sections[0] && sections[0].id;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= 140) activeId = section.id;
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
