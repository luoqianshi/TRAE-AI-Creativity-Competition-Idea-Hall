(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // Dark theme colors for dashboard section
  var darkText = '#CBD5E1';
  var darkMuted = '#94A3B8';
  var darkGrid = 'rgba(255,255,255,0.08)';

  // --- Chart: Monthly Trend ---
  var chartTrend = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });
  chartTrend.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: darkGrid } },
      axisLabel: { color: darkMuted }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: darkGrid } },
      axisLabel: { color: darkMuted }
    },
    series: [{
      name: '销售额',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: accent, width: 3 },
      itemStyle: { color: accent, borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59,130,246,0.3)' },
            { offset: 1, color: 'rgba(59,130,246,0.02)' }
          ]
        }
      },
      data: [8200, 9320, 9010, 11340, 12900, 15300, 14200, 15800, 17500, 19200, 21000, 24500]
    }, {
      name: '目标',
      type: 'line',
      smooth: true,
      lineStyle: { color: accent2, width: 2, type: 'dashed' },
      itemStyle: { color: accent2 },
      data: [8000, 9000, 9500, 10500, 11500, 12500, 13500, 14500, 15500, 16500, 18000, 20000]
    }]
  });
  window.addEventListener('resize', function() { chartTrend.resize(); });

  // --- Chart: Category Pie ---
  var chartPie = echarts.init(document.getElementById('chart-pie'), null, { renderer: 'svg' });
  chartPie.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true, backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' } },
    legend: { show: false },
    series: [{
      name: '品类占比',
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#1E293B', borderWidth: 2 },
      label: { show: true, color: darkText, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: darkMuted } },
      data: [
        { value: 4350, name: '电子产品', itemStyle: { color: accent } },
        { value: 3100, name: '服装配饰', itemStyle: { color: accent2 } },
        { value: 2340, name: '家居用品', itemStyle: { color: '#F59E0B' } },
        { value: 1850, name: '食品饮料', itemStyle: { color: '#8B5CF6' } },
        { value: 1200, name: '其他', itemStyle: { color: '#64748B' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartPie.resize(); });

  // --- Chart: Region Bar ---
  var chartBar = echarts.init(document.getElementById('chart-bar'), null, { renderer: 'svg' });
  chartBar.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true, backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: darkGrid } },
      axisLabel: { color: darkMuted }
    },
    yAxis: {
      type: 'category',
      data: ['西南', '东北', '西北', '华中', '华南', '华北', '华东'],
      axisLine: { lineStyle: { color: darkGrid } },
      axisLabel: { color: darkMuted }
    },
    series: [{
      name: '销售额',
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: accent + '88' },
            { offset: 1, color: accent }
          ]
        },
        borderRadius: [0, 4, 4, 0]
      },
      data: [8200, 10500, 12800, 15600, 18900, 22100, 28400]
    }]
  });
  window.addEventListener('resize', function() { chartBar.resize(); });

  // --- Chart: Radar ---
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true, backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' } },
    radar: {
      indicator: [
        { name: '产品质量', max: 5 },
        { name: '物流服务', max: 5 },
        { name: '客服态度', max: 5 },
        { name: '价格合理', max: 5 },
        { name: '购物体验', max: 5 },
        { name: '售后保障', max: 5 }
      ],
      axisName: { color: darkMuted },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] } },
      axisLine: { lineStyle: { color: darkGrid } },
      splitLine: { lineStyle: { color: darkGrid } }
    },
    series: [{
      name: '满意度评分',
      type: 'radar',
      data: [{
        value: [4.5, 4.2, 4.6, 4.0, 4.3, 4.1],
        name: '本季度',
        areaStyle: { color: 'rgba(59,130,246,0.2)' },
        lineStyle: { color: accent, width: 2 },
        itemStyle: { color: accent }
      }, {
        value: [4.2, 3.9, 4.3, 3.8, 4.0, 3.9],
        name: '上季度',
        areaStyle: { color: 'rgba(16,185,129,0.15)' },
        lineStyle: { color: accent2, width: 2, type: 'dashed' },
        itemStyle: { color: accent2 }
      }]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
