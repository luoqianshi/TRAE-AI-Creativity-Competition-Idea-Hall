// assets/charts.js — AI 学习任务拆解助手图表
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 学习坚持率对比 ---
  var el = document.getElementById('chart-compare');
  if (!el || typeof echarts === 'undefined') return;

  var chart = echarts.init(el, null, { renderer: 'svg' });

  var days = ['第1天', '第3天', '第5天', '第7天', '第10天', '第14天', '第18天', '第22天', '第26天', '第30天'];
  // 传统自学坚持率随时间快速下降
  var tradition = [100, 88, 74, 60, 46, 34, 25, 18, 12, 8];
  // AI 助手陪伴下坚持率保持较高水平
  var aiAssist = [100, 98, 95, 91, 88, 84, 80, 77, 73, 70];

  chart.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var html = '<div style="font-weight:700;margin-bottom:6px;">' + params[0].axisValue + '</div>';
        params.forEach(function(p) {
          html += '<div style="display:flex;align-items:center;gap:6px;margin:3px 0;">'
            + '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + p.color + ';"></span>'
            + p.seriesName + '：<b>' + p.value + '%</b></div>';
        });
        return html;
      }
    },
    legend: {
      data: ['传统自学', 'AI 助手陪伴'],
      bottom: 0,
      icon: 'circle',
      itemWidth: 9,
      itemHeight: 9,
      textStyle: { color: muted, fontSize: 13 }
    },
    grid: {
      left: '3%',
      right: '4%',
      top: 20,
      bottom: 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days,
      boundaryGap: false,
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 12, interval: 1 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      min: 0,
      axisLabel: { color: muted, fontSize: 12, formatter: '{value}%' },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '传统自学',
        type: 'line',
        data: tradition,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: muted, width: 2.5 },
        itemStyle: { color: muted },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(91,100,120,0.15)' },
              { offset: 1, color: 'rgba(91,100,120,0.02)' }
            ]
          }
        }
      },
      {
        name: 'AI 助手陪伴',
        type: 'line',
        data: aiAssist,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(91,108,255,0.25)' },
              { offset: 1, color: 'rgba(91,108,255,0.02)' }
            ]
          }
        }
      }
    ]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
