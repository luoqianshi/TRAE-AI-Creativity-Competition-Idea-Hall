// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Market Size (Bar + Line) ---
  var chartMarket = echarts.init(document.getElementById('chart-market-size'), null, { renderer: 'svg' });
  var years = ['2024', '2025', '2026E', '2027E', '2028E', '2029E', '2030E'];
  var marketData = [43.3, 48.6, 54.6, 61.3, 68.9, 77.4, 88.0];
  var growthData = [null, 12.2, 12.3, 12.3, 12.4, 12.3, 12.3];

  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var html = '<strong>' + params[0].axisValue + '</strong><br/>';
        params.forEach(function(p) {
          if (p.value !== null && p.value !== undefined) {
            html += p.marker + ' ' + p.seriesName + '：';
            if (p.seriesName.indexOf('增长率') >= 0) {
              html += p.value.toFixed(1) + '%';
            } else {
              html += p.value.toFixed(1) + '亿元';
            }
            html += '<br/>';
          }
        });
        return html;
      }
    },
    legend: {
      data: ['市场规模', '同比增长率'],
      top: 0,
      right: 0,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { top: 40, left: 60, right: 60, bottom: 30 },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '市场规模（亿元）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      {
        type: 'value',
        name: '同比增长率（%）',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
      }
    ],
    series: [
      {
        name: '市场规模',
        type: 'bar',
        barWidth: '40%',
        data: marketData,
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}亿',
          color: ink,
          fontSize: 11,
          fontWeight: 600
        }
      },
      {
        name: '同比增长率',
        type: 'line',
        yAxisIndex: 1,
        data: growthData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 2.5 },
        itemStyle: { color: accent2, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          position: 'top',
          formatter: function(p) { return p.value !== null ? p.value.toFixed(1) + '%' : ''; },
          color: accent2,
          fontSize: 11,
          fontWeight: 600
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });

  // --- Chart 2: Competition Radar ---
  var chartComp = echarts.init(document.getElementById('chart-competition'), null, { renderer: 'svg' });
  var indicators = [
    { name: '记录功能', max: 5 },
    { name: '生长曲线', max: 5 },
    { name: 'AI能力', max: 5 },
    { name: '家庭共享', max: 5 },
    { name: '体验纯净度', max: 5 },
    { name: '小程序形态', max: 5 }
  ];

  chartComp.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['亲宝宝', '宝宝树', '一木宝宝', '你的产品（定位）'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 }
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      radius: '65%',
      axisName: { color: ink, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg2 + '66', bg2 + '33'] } },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: '亲宝宝',
          value: [5, 4, 5, 5, 1, 1],
          lineStyle: { color: '#E8A87C', width: 2 },
          areaStyle: { color: '#E8A87C', opacity: 0.1 },
          itemStyle: { color: '#E8A87C' }
        },
        {
          name: '宝宝树',
          value: [3, 3, 4, 3, 1, 2],
          lineStyle: { color: '#95B8D1', width: 2 },
          areaStyle: { color: '#95B8D1', opacity: 0.1 },
          itemStyle: { color: '#95B8D1' }
        },
        {
          name: '一木宝宝',
          value: [4, 4, 1, 4, 5, 2],
          lineStyle: { color: '#B5C99A', width: 2 },
          areaStyle: { color: '#B5C99A', opacity: 0.1 },
          itemStyle: { color: '#B5C99A' }
        },
        {
          name: '你的产品（定位）',
          value: [4, 5, 4, 5, 5, 5],
          lineStyle: { color: accent, width: 3 },
          areaStyle: { color: accent, opacity: 0.15 },
          itemStyle: { color: accent, borderColor: '#fff', borderWidth: 1 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartComp.resize(); });
})();
