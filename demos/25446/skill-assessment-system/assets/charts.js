// assets/charts.js
// SkillChain - 全产业链个人技能精准定位系统 图表逻辑
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#0284c7';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#7c3aed';
  var accent3 = style.getPropertyValue('--accent3').trim() || '#059669';
  var accentWarn = style.getPropertyValue('--accent-warn').trim() || '#ea580c';
  var ink = style.getPropertyValue('--ink').trim() || '#0f172a';
  var muted = style.getPropertyValue('--muted').trim() || '#64748b';
  var rule = style.getPropertyValue('--rule').trim() || '#e2e8f0';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#ffffff';

  // ============================================================
  // Chart 1: 中国产业生态全景 Treemap (GB/T 4754-2017)
  // ============================================================
  (function() {
    var dom = document.getElementById('chart-industry-tree');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });

    var treemapData = [
      // 第一产业
      { name: 'A 农、林、牧、渔业', value: 8, industry: '第一产业' },
      // 第二产业
      { name: 'B 采矿业', value: 4, industry: '第二产业' },
      { name: 'C 制造业', value: 28, industry: '第二产业' },
      { name: 'D 电力/热力/燃气/水', value: 5, industry: '第二产业' },
      { name: 'E 建筑业', value: 7, industry: '第二产业' },
      // 第三产业
      { name: 'F 批发和零售业', value: 10, industry: '第三产业' },
      { name: 'G 交通运输/仓储/邮政', value: 6, industry: '第三产业' },
      { name: 'H 住宿和餐饮业', value: 4, industry: '第三产业' },
      { name: 'I 信息技术/软件服务', value: 14, industry: '第三产业' },
      { name: 'J 金融业', value: 9, industry: '第三产业' },
      { name: 'K 房地产业', value: 6, industry: '第三产业' },
      { name: 'L 租赁和商务服务业', value: 5, industry: '第三产业' },
      { name: 'M 科研和技术服务业', value: 8, industry: '第三产业' },
      { name: 'N 水利/环境/公共设施', value: 3, industry: '第三产业' },
      { name: 'O 居民服务/修理/其他', value: 5, industry: '第三产业' },
      { name: 'P 教育', value: 7, industry: '第三产业' },
      { name: 'Q 卫生和社会工作', value: 6, industry: '第三产业' },
      { name: 'R 文化/体育和娱乐业', value: 5, industry: '第三产业' },
      { name: 'S 公共管理/社会保障', value: 7, industry: '第三产业' },
      { name: 'T 国际组织', value: 1, industry: '第三产业' }
    ];

    var indColors = {
      '第一产业': '#16a34a',
      '第二产业': accent,
      '第三产业': accent2
    };

    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        formatter: function(p) {
          return '<strong>' + p.name + '</strong><br/>产业大类：' + p.data.industry +
            '<br/>经济权重指数：' + p.value;
        }
      },
      series: [{
        type: 'treemap',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: true, height: 28, bottom: 0, itemStyle: { color: bg2, borderColor: rule, textStyle: { color: ink } } },
        label: {
          show: true,
          formatter: function(p) { return p.name.length > 8 ? p.name.substring(0, 8) + '...' : p.name; },
          fontSize: 11,
          color: '#fff',
          fontWeight: 'bold'
        },
        itemStyle: { borderColor: bg2, borderWidth: 2, gapWidth: 2 },
        levels: [
          {
            // root
            itemStyle: { borderWidth: 0, gapWidth: 0 },
            upperLabel: { show: true, height: 30, fontSize: 14, fontWeight: 'bold', color: ink }
          },
          {
            // industry groups
            itemStyle: { borderWidth: 3, gapWidth: 3, borderColor: bg2 },
            label: { fontSize: 12, fontWeight: 'bold' },
            upperLabel: { show: true }
          }
        ],
        data: [
          {
            name: '第一产业',
            itemStyle: { color: indColors['第一产业'] },
            children: treemapData.filter(function(d) { return d.industry === '第一产业'; }).map(function(d) {
              return { name: d.name, value: d.value };
            })
          },
          {
            name: '第二产业',
            itemStyle: { color: indColors['第二产业'] },
            children: treemapData.filter(function(d) { return d.industry === '第二产业'; }).map(function(d) {
              return { name: d.name, value: d.value };
            })
          },
          {
            name: '第三产业（服务业）',
            itemStyle: { color: indColors['第三产业'] },
            children: treemapData.filter(function(d) { return d.industry === '第三产业'; }).map(function(d) {
              return { name: d.name, value: d.value };
            })
          }
        ]
      }]
    });

    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // ============================================================
  // Chart 2: 个人技能雷达图
  // ============================================================
  var radarChart = null;
  function initRadar() {
    var dom = document.getElementById('chart-radar');
    if (!dom) return;
    radarChart = echarts.init(dom, null, { renderer: 'svg' });
    window.addEventListener('resize', function() { if (radarChart) radarChart.resize(); });
  }
  initRadar();

  window.updateRadar = function() {
    if (!radarChart) initRadar();
    if (!radarChart) return;

    var dims = ['专业技术', '创新研发', '沟通协作', '管理领导', '学习适应', '行业知识', '数字素养', '跨界融合'];
    var ids = ['tech', 'innov', 'comm', 'mgmt', 'learn', 'know', 'digi', 'cross'];
    var userValues = [];
    for (var i = 0; i < ids.length; i++) {
      var val = parseInt(document.getElementById('slider-' + ids[i]).value);
      document.getElementById('val-' + ids[i]).textContent = val;
      userValues.push(val);
    }

    // Industry benchmark (example: IT industry benchmark)
    var benchmark = [75, 70, 65, 55, 70, 72, 80, 60];

    radarChart.setOption({
      animation: true,
      tooltip: { appendToBody: true },
      legend: {
        data: ['我的技能', 'IT行业基准'],
        bottom: 0,
        textStyle: { color: ink, fontSize: 12 }
      },
      radar: {
        center: ['50%', '48%'],
        radius: '65%',
        indicator: dims.map(function(d) { return { name: d, max: 100 }; }),
        axisName: { color: ink, fontSize: 11, fontWeight: 'bold' },
        splitArea: { areaStyle: { color: ['transparent'] } },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } }
      },
      series: [
        {
          name: 'IT行业基准',
          type: 'radar',
          symbol: 'none',
          lineStyle: { color: accent2 + '66', width: 2, type: 'dashed' },
          areaStyle: { color: accent2 + '15' },
          itemStyle: { color: accent2 },
          data: [{ value: benchmark, name: 'IT行业基准' }]
        },
        {
          name: '我的技能',
          type: 'radar',
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: accent, width: 2.5 },
          areaStyle: { color: accent + '30' },
          itemStyle: { color: accent, borderColor: '#fff', borderWidth: 2 },
          data: [{ value: userValues, name: '我的技能' }]
        }
      ]
    });
  };
  updateRadar();

  window.randomizeSkills = function() {
    var ids = ['tech', 'innov', 'comm', 'mgmt', 'learn', 'know', 'digi', 'cross'];
    for (var i = 0; i < ids.length; i++) {
      var v = Math.floor(Math.random() * 71) + 20;
      document.getElementById('slider-' + ids[i]).value = v;
    }
    updateRadar();
  };

  // ============================================================
  // Chart 3: 技能-产业热力匹配图
  // ============================================================
  (function() {
    var dom = document.getElementById('chart-heatmap');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });

    var skills = ['专业技术', '创新研发', '沟通协作', '管理领导', '学习适应', '行业知识', '数字素养', '跨界融合'];
    var industries = [
      'A农林牧渔', 'B采矿', 'C制造', 'D电力燃气',
      'E建筑', 'F批发零售', 'G交通仓储', 'H住宿餐饮',
      'I信息技术', 'J金融', 'K房地产', 'L租赁商务',
      'M科研技术', 'N水利环境', 'O居民服务', 'P教育',
      'Q卫生社工', 'R文体娱乐', 'S公共管理', 'T国际组织'
    ];

    var data = [];
    // Generate match scores based on realistic industry-skill relationships
    var baseScores = {
      'I信息技术': [90, 85, 65, 55, 80, 78, 95, 70],
      'J金融': [75, 65, 60, 70, 70, 85, 70, 55],
      'C制造': [85, 70, 55, 60, 65, 72, 60, 50],
      'M科研技术': [88, 92, 55, 50, 80, 82, 75, 65],
      'P教育': [65, 60, 80, 65, 85, 70, 55, 60],
      'Q卫生社工': [80, 55, 75, 50, 70, 82, 50, 45],
      'A农林牧渔': [70, 45, 40, 40, 50, 65, 30, 35],
      'F批发零售': [40, 50, 75, 60, 55, 60, 50, 50],
      'G交通仓储': [55, 40, 55, 55, 50, 55, 45, 40],
      'E建筑': [75, 55, 50, 55, 50, 60, 45, 40],
      'B采矿': [70, 40, 40, 45, 45, 55, 35, 30],
      'D电力燃气': [68, 45, 40, 45, 45, 55, 40, 30],
      'H住宿餐饮': [30, 35, 70, 55, 50, 45, 30, 40],
      'K房地产': [45, 40, 65, 60, 50, 60, 40, 45],
      'L租赁商务': [40, 45, 70, 65, 55, 50, 45, 50],
      'N水利环境': [65, 50, 45, 40, 50, 55, 40, 35],
      'O居民服务': [35, 30, 75, 40, 45, 40, 25, 35],
      'R文体娱乐': [50, 75, 65, 45, 60, 50, 55, 60],
      'S公共管理': [40, 35, 75, 80, 55, 60, 45, 50],
      'T国际组织': [45, 50, 85, 80, 70, 65, 60, 75]
    };

    for (var si = 0; si < skills.length; si++) {
      for (var ii = 0; ii < industries.length; ii++) {
        var score = baseScores[industries[ii]] ? baseScores[industries[ii]][si] : 50;
        data.push([si, ii, score]);
      }
    }

    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        formatter: function(p) {
          return '<strong>' + skills[p.value[0]] + '</strong> × <strong>' + industries[p.value[1]] + '</strong><br/>匹配度：<b>' + p.value[2] + '</b> / 100';
        }
      },
      grid: { left: 110, right: 60, top: 20, bottom: 40 },
      xAxis: {
        type: 'category',
        data: skills,
        axisLabel: { rotate: 0, fontSize: 11, color: ink, fontWeight: 'bold' },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: industries,
        axisLabel: { fontSize: 10, color: muted },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { show: false }
      },
      visualMap: {
        show: true,
        min: 0,
        max: 100,
        calculable: true,
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: ink, fontSize: 10 },
        inRange: { color: [bg2, accent2 + '66', accent2, accent] }
      },
      series: [{
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          fontSize: 9,
          color: function(p) { return p.value[2] > 70 ? '#fff' : muted; },
          fontWeight: function(p) { return p.value[2] > 70 ? 'bold' : 'normal'; }
        },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,.3)' }
        },
        itemStyle: { borderColor: bg2, borderWidth: 1 }
      }]
    });

    window.addEventListener('resize', function() { chart.resize(); });

    // Store heatmap references for external highlight
    window._heatmapChart = chart;
    window._heatmapIndustries = industries;
    window._heatmapSkills = skills;
    window._heatmapData = data;
  })();

  // Dynamic industry row highlight for heatmap
  window.updateHeatmapWithIndustry = function(matchCodes) {
    var hmChart = window._heatmapChart;
    var hmIndustries = window._heatmapIndustries;
    var hmData = window._heatmapData;
    if (!hmChart || !hmIndustries || !matchCodes) return;

    var hlIdx = [];
    matchCodes.forEach(function(c) {
      for (var i = 0; i < hmIndustries.length; i++) {
        if (hmIndustries[i].charAt(0) === c) { hlIdx.push(i); break; }
      }
    });

    var nd = hmData.map(function(d) {
      return {
        value: d,
        itemStyle: hlIdx.indexOf(d[1]) >= 0
          ? { borderColor: accentWarn, borderWidth: 2.5, shadowBlur: 8, shadowColor: accentWarn + '55' }
          : { borderColor: bg2, borderWidth: 1 }
      };
    });

    var yLabels = hmIndustries.map(function(ind) {
      var c = ind.charAt(0);
      return matchCodes.indexOf(c) >= 0 ? '{hl|⭐ ' + ind + '}' : ind;
    });

    hmChart.setOption({
      yAxis: {
        type: 'category', data: yLabels,
        axisLabel: { fontSize: 10, color: muted, rich: { hl: { color: accentWarn, fontWeight: 'bold', fontSize: 11 } } },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { show: false }
      },
      series: [{
        type: 'heatmap', data: nd,
        label: {
          show: true, fontSize: 9,
          color: function(p) { return hlIdx.indexOf(p.value[1]) >= 0 ? accentWarn : (p.value[2] > 70 ? '#fff' : muted); },
          fontWeight: function(p) { return hlIdx.indexOf(p.value[1]) >= 0 ? 'bold' : (p.value[2] > 70 ? 'bold' : 'normal'); }
        },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,.3)' } },
        itemStyle: { borderColor: bg2, borderWidth: 1 }
      }]
    });
  };

  // ============================================================
  // Chart 4: 技能差距分析柱状图
  // ============================================================
  (function() {
    var dom = document.getElementById('chart-gap');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });

    var dims = ['专业技术', '创新研发', '沟通协作', '管理领导', '学习适应', '行业知识', '数字素养', '跨界融合'];
    var current = [52, 48, 65, 38, 72, 55, 60, 40];
    var required = [78, 72, 68, 62, 70, 75, 82, 58];
    var gaps = [];
    var gapPcts = [];
    for (var i = 0; i < dims.length; i++) {
      gaps.push(required[i] - current[i]);
      gapPcts.push(Math.round((required[i] - current[i]) / required[i] * 100));
    }

    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          var idx = params[0].dataIndex;
          return '<strong>' + dims[idx] + '</strong><br/>' +
            '当前水平：<b>' + current[idx] + '</b><br/>' +
            '目标基准：<b>' + required[idx] + '</b><br/>' +
            '差距：<b style="color:' + accentWarn + '">-' + gaps[idx] + '</b>（' + gapPcts[idx] + '%）';
        }
      },
      legend: {
        data: ['当前水平', '目标基准'],
        bottom: 0,
        textStyle: { color: ink, fontSize: 11 }
      },
      grid: { left: 20, right: 20, top: 30, bottom: 40 },
      xAxis: {
        type: 'category',
        data: dims,
        axisLabel: { rotate: 35, fontSize: 10, color: muted },
        axisLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { fontSize: 10, color: muted },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      series: [
        {
          name: '当前水平',
          type: 'bar',
          data: current,
          itemStyle: {
            color: accent,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%',
          barGap: '20%',
          label: {
            show: true,
            position: 'top',
            fontSize: 9,
            color: accent,
            fontWeight: 'bold',
            formatter: function(p) { return p.value; }
          }
        },
        {
          name: '目标基准',
          type: 'bar',
          data: required,
          itemStyle: {
            color: accent2 + '44',
            borderColor: accent2,
            borderWidth: 1.5,
            borderType: 'dashed',
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            fontSize: 9,
            color: accent2,
            fontWeight: 'bold',
            formatter: function(p) { return p.value; }
          }
        }
      ]
    });

    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // ============================================================
  // Chart 5: 职业发展路径 Sankey 图
  // ============================================================
  (function() {
    var dom = document.getElementById('chart-sankey');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });

    // 职业大类: 基于《中华人民共和国职业分类大典（2022年版）》
    // 1-国家机关/党群组织/企业/事业单位负责人
    // 2-专业技术人员 3-办事人员 4-社会生产服务和生活服务人员
    // 5-农林牧渔生产人员 6-生产制造人员 7-军人 8-不便分类

    var nodes = [
      { name: '初级技术岗', itemStyle: { color: accent + 'cc' } },
      { name: '中级专业技术人员', itemStyle: { color: accent } },
      { name: '高级专业技术人员', itemStyle: { color: '#0369a1' } },
      { name: '技术管理岗', itemStyle: { color: accent2 + 'aa' } },
      { name: '项目管理人员', itemStyle: { color: accent2 } },
      { name: '企业/事业负责人', itemStyle: { color: '#5b21b6' } },
      { name: '产品/运营岗', itemStyle: { color: accent3 + 'aa' } },
      { name: '社会服务岗', itemStyle: { color: accent3 } },
      { name: '教育培训岗', itemStyle: { color: accentWarn + 'aa' } },
      { name: '自主创业', itemStyle: { color: accentWarn } }
    ];

    var links = [
      { source: '初级技术岗', target: '中级专业技术人员', value: 60 },
      { source: '初级技术岗', target: '产品/运营岗', value: 25 },
      { source: '初级技术岗', target: '社会服务岗', value: 15 },
      { source: '中级专业技术人员', target: '高级专业技术人员', value: 40 },
      { source: '中级专业技术人员', target: '技术管理岗', value: 30 },
      { source: '中级专业技术人员', target: '项目管理人员', value: 20 },
      { source: '中级专业技术人员', target: '自主创业', value: 10 },
      { source: '高级专业技术人员', target: '技术管理岗', value: 25 },
      { source: '高级专业技术人员', target: '企业/事业负责人', value: 20 },
      { source: '高级专业技术人员', target: '自主创业', value: 15 },
      { source: '技术管理岗', target: '企业/事业负责人', value: 30 },
      { source: '项目管理人员', target: '企业/事业负责人', value: 25 },
      { source: '项目管理人员', target: '自主创业', value: 15 },
      { source: '产品/运营岗', target: '项目管理人员', value: 20 },
      { source: '产品/运营岗', target: '自主创业', value: 15 },
      { source: '社会服务岗', target: '教育培训岗', value: 15 },
      { source: '社会服务岗', target: '项目管理人员', value: 10 },
      { source: '教育培训岗', target: '项目管理人员', value: 10 }
    ];

    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'item',
        formatter: function(p) {
          if (p.dataType === 'edge') {
            return p.data.source + ' → ' + p.data.target + '<br/>发展潜力：<b>' + p.data.value + '</b>';
          }
          return p.name;
        }
      },
      series: [{
        type: 'sankey',
        layoutIterations: 0,
        emphasis: {
          focus: 'adjacency',
          lineStyle: { opacity: 0.6 }
        },
        lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.2 },
        label: {
          fontSize: 10,
          color: ink,
          fontWeight: 'bold'
        },
        nodeWidth: 18,
        nodeGap: 14,
        layout: 'right',
        data: nodes,
        links: links
      }]
    });

    window.addEventListener('resize', function() { chart.resize(); });
  })();

})();
