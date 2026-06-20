(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: AI Capability Radar ---
  (function() {
    var el = document.getElementById('chart-radar');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: { appendToBody: true },
      legend: {
        data: ['GPT-5.5', 'Gemini 3.1 Pro', 'Claude Opus 4.7'],
        bottom: 0,
        textStyle: { color: ink, fontFamily: 'WorkSans' }
      },
      radar: {
        center: ['50%', '48%'],
        radius: '65%',
        indicator: [
          { name: '多模态理解', max: 100 },
          { name: '视频处理', max: 100 },
          { name: '代码/Agent', max: 100 },
          { name: '上下文窗口', max: 100 },
          { name: '图像精度', max: 100 },
          { name: '性价比', max: 100 }
        ],
        axisName: { color: muted, fontSize: 11, fontFamily: 'WorkSans' },
        splitArea: { areaStyle: { color: ['rgba(99,102,241,0.02)', 'rgba(99,102,241,0.04)'] } },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        name: 'GPT-5.5',
        data: [{ value: [90, 70, 95, 50, 80, 35], name: 'GPT-5.5' }],
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: accent, width: 2 },
        areaStyle: { color: accent, opacity: 0.08 },
        itemStyle: { color: accent }
      }, {
        type: 'radar',
        name: 'Gemini 3.1 Pro',
        data: [{ value: [95, 98, 75, 100, 88, 85], name: 'Gemini 3.1 Pro' }],
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: accent2, width: 2 },
        areaStyle: { color: accent2, opacity: 0.08 },
        itemStyle: { color: accent2 }
      }, {
        type: 'radar',
        name: 'Claude Opus 4.7',
        data: [{ value: [72, 20, 90, 50, 95, 40], name: 'Claude Opus 4.7' }],
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#F97316', width: 2 },
        areaStyle: { color: '#F97316', opacity: 0.08 },
        itemStyle: { color: '#F97316' }
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // --- Chart 2: Creator Pain Points Bar ---
  (function() {
    var el = document.getElementById('chart-pain');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        formatter: '{b}: {c}%'
      },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', color: muted, fontSize: 11, fontFamily: 'WorkSans' },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: ['全职创作者倦怠', '创作者月收入波动>30%', '选题枯竭', '依赖热点搬运', '无应急储蓄', '周工作超50小时'],
        axisLabel: { color: ink, fontSize: 12, fontFamily: 'WorkSans' },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: [62, 68, 78, 63, 54, 81],
        itemStyle: {
          color: function(params) {
            var colors = [accent, '#F97316', accent, muted, muted, '#F97316'];
            return colors[params.dataIndex];
          },
          borderRadius: [0, 6, 6, 0]
        },
        barWidth: 18,
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: ink,
          fontSize: 11,
          fontFamily: 'WorkSans',
          fontWeight: 600
        }
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // --- Chart 3: AI Content Attitude Shift ---
  (function() {
    var el = document.getElementById('chart-attitude');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'axis'
      },
      grid: { left: '3%', right: '5%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['2023', '2024', '2025'],
        axisLabel: { color: muted, fontSize: 12, fontFamily: 'WorkSans' },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', color: muted, fontSize: 11, fontFamily: 'WorkSans' },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'line',
        name: '消费者对AI内容接受度',
        data: [60, 42, 26],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        symbol: 'circle',
        symbolSize: 10,
        areaStyle: { color: accent, opacity: 0.06 },
        label: {
          show: true,
          formatter: '{c}%',
          color: accent,
          fontSize: 13,
          fontFamily: 'Outfit',
          fontWeight: 700,
          position: 'top',
          distance: 15
        }
      }, {
        type: 'line',
        name: 'Gen Z对AI内容负面态度',
        data: [35, 55, 72],
        lineStyle: { color: '#F97316', width: 3 },
        itemStyle: { color: '#F97316' },
        symbol: 'circle',
        symbolSize: 10,
        areaStyle: { color: '#F97316', opacity: 0.04 },
        label: {
          show: true,
          formatter: '{c}%',
          color: '#F97316',
          fontSize: 13,
          fontFamily: 'Outfit',
          fontWeight: 700,
          position: 'top',
          distance: 15
        }
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // --- Chart 4: Platform Burnout Comparison ---
  (function() {
    var el = document.getElementById('chart-burnout');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        formatter: '{b}: {c}%'
      },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', color: muted, fontSize: 11, fontFamily: 'WorkSans' },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: ['TikTok', 'Instagram', 'YouTube'],
        axisLabel: { color: ink, fontSize: 13, fontFamily: 'WorkSans', fontWeight: 600 },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: [68, 61, 59],
        itemStyle: {
          color: function(params) {
            return [accent, accent + 'cc', accent2][params.dataIndex];
          },
          borderRadius: [0, 8, 8, 0]
        },
        barWidth: 24,
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: ink,
          fontSize: 13,
          fontFamily: 'Outfit',
          fontWeight: 700
        }
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // --- Chart 5: AI Social Platform Market Growth ---
  (function() {
    var el = document.getElementById('chart-market');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        formatter: function(p) { return p.name + ': ' + p.value + '亿美元'; }
      },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['2024', '2025', '2026E', '2027E', '2028E'],
        axisLabel: { color: muted, fontSize: 12, fontFamily: 'WorkSans' },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}亿', color: muted, fontSize: 11, fontFamily: 'WorkSans' },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'bar',
        data: [
          { value: 282, itemStyle: { color: accent + '66' } },
          { value: 380, itemStyle: { color: accent + '99' } },
          { value: 486, itemStyle: { color: accent } },
          { value: 620, itemStyle: { color: accent2 } },
          { value: 800, itemStyle: { color: accent2 + 'cc' } }
        ],
        barWidth: 32,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: ink,
          fontSize: 12,
          fontFamily: 'Outfit',
          fontWeight: 700
        },
        emphasis: {
          itemStyle: { color: accent }
        }
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();
})();