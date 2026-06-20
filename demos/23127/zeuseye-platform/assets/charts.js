// assets/charts.js — ZeusEye Platform Charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  // --- Chart: Threat Landscape Radar ---
  var chartThreat = echarts.init(document.getElementById('chart-threat'), null, { renderer: 'svg' });
  chartThreat.setOption({
    animation: false,
    tooltip: { appendToBody: true, trigger: 'item' },
    legend: {
      bottom: 10,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8
    },
    radar: {
      indicator: [
        { name: '钓鱼攻击', max: 100 },
        { name: '勒索软件', max: 100 },
        { name: '漏洞利用', max: 100 },
        { name: '横向移动', max: 100 },
        { name: '数据泄露', max: 100 },
        { name: 'DDoS攻击', max: 100 },
        { name: '供应链攻击', max: 100 },
        { name: '内部威胁', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 72, 90, 65, 78, 55, 68, 45],
          name: '威胁频率',
          lineStyle: { color: accent, width: 2 },
          areaStyle: { color: accent + '30' },
          itemStyle: { color: accent },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [70, 88, 75, 82, 90, 60, 55, 70],
          name: '危害程度',
          lineStyle: { color: accent2, width: 2 },
          areaStyle: { color: accent2 + '30' },
          itemStyle: { color: accent2 },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartThreat.resize(); });

  // --- Chart: Platform Architecture (Tree) ---
  var chartArch = echarts.init(document.getElementById('chart-arch'), null, { renderer: 'svg' });
  chartArch.setOption({
    animation: false,
    tooltip: { appendToBody: true, trigger: 'item', formatter: '{b}' },
    series: [{
      type: 'tree',
      data: [{
        name: 'ZeusEye 平台',
        children: [
          {
            name: '数据采集层',
            children: [
              { name: '防火墙日志' },
              { name: 'WAF日志' },
              { name: '终端EDR' },
              { name: '云安全组' },
              { name: '流量探针' }
            ]
          },
          {
            name: '数据处理层',
            children: [
              { name: '数据清洗' },
              { name: '关联分析' },
              { name: '威胁情报' },
              { name: '资产建模' }
            ]
          },
          {
            name: '可视化层',
            children: [
              { name: '3D拓扑引擎' },
              { name: '攻击路径渲染' },
              { name: '风险扩散算法' },
              { name: '大屏适配' }
            ]
          },
          {
            name: '应用层',
            children: [
              { name: '态势感知大屏' },
              { name: 'Web管理端' },
              { name: '移动端' },
              { name: 'API接口' }
            ]
          }
        ]
      }],
      top: '5%',
      left: '12%',
      bottom: '5%',
      right: '18%',
      symbol: 'roundRect',
      symbolSize: [100, 32],
      orient: 'LR',
      label: {
        position: 'inside',
        color: ink,
        fontSize: 11,
        fontFamily: 'Outfit, sans-serif'
      },
      leaves: {
        label: { position: 'inside', fontSize: 10 }
      },
      itemStyle: {
        color: bg3,
        borderColor: accent,
        borderWidth: 1,
        borderRadius: 6
      },
      lineStyle: {
        color: rule,
        width: 1.5,
        curveness: 0.5
      },
      expandAndCollapse: false,
      initialTreeDepth: 3
    }]
  });
  window.addEventListener('resize', function() { chartArch.resize(); });

  // --- Chart: Alert Fatigue (Bar + Line) ---
  var chartAlerts = echarts.init(document.getElementById('chart-alerts'), null, { renderer: 'svg' });
  chartAlerts.setOption({
    animation: false,
    tooltip: { appendToBody: true, trigger: 'axis' },
    legend: {
      bottom: 10,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8
    },
    grid: { top: 40, right: 60, bottom: 50, left: 60 },
    xAxis: {
      type: 'category',
      data: ['防火墙', 'WAF', 'IDS/IPS', '终端杀毒', '云安全组', '邮件网关', 'SIEM聚合'],
      axisLabel: { color: muted, fontSize: 11, rotate: 20 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '日均告警量',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false }
      },
      {
        type: 'value',
        name: '有效率 (%)',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '日均告警量',
        type: 'bar',
        data: [85000, 42000, 67000, 120000, 35000, 28000, 95000],
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '40' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '有效率',
        type: 'line',
        yAxisIndex: 1,
        data: [3.2, 5.8, 4.1, 1.5, 6.3, 7.2, 2.8],
        lineStyle: { color: accent2, width: 2 },
        itemStyle: { color: accent2 },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  });
  window.addEventListener('resize', function() { chartAlerts.resize(); });

  // --- Chart: MTTR Comparison (Grouped Bar) ---
  var chartMttr = echarts.init(document.getElementById('chart-mttr'), null, { renderer: 'svg' });
  chartMttr.setOption({
    animation: false,
    tooltip: { appendToBody: true, trigger: 'axis' },
    legend: {
      bottom: 10,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 14,
      itemHeight: 8
    },
    grid: { top: 40, right: 40, bottom: 50, left: 60 },
    xAxis: {
      type: 'category',
      data: ['威胁发现', '攻击溯源', '影响评估', '响应处置', '复盘报告'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '平均耗时（分钟）',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLine: { show: false }
    },
    series: [
      {
        name: '使用前',
        type: 'bar',
        data: [120, 180, 90, 150, 240],
        barWidth: '30%',
        itemStyle: {
          color: accent2 + '80',
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '使用后',
        type: 'bar',
        data: [15, 25, 10, 20, 30],
        barWidth: '30%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '50' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMttr.resize(); });

})();