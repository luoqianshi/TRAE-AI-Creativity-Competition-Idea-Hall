(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var chartEl = document.getElementById('chart-efficiency');
  if (!chartEl) return;

  var chart = echarts.init(chartEl, null, { renderer: 'svg' });

  chart.setOption({
    backgroundColor: 'transparent',
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink, fontSize: 13 },
      appendToBody: true,
      formatter: function(params) {
        var html = '<div style="font-weight:600;margin-bottom:6px;">' + params[0].name + '</div>';
        params.forEach(function(p) {
          html += '<div style="margin:2px 0;">' +
            '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + p.color + ';margin-right:6px;"></span>' +
            p.seriesName + ': <strong>' + p.value + '</strong> 步</div>';
        });
        return html;
      }
    },
    legend: {
      data: ['传统交互', '智眼交互'],
      textStyle: { color: muted, fontSize: 13 },
      top: 0,
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 24
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 50,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['跨应用\n信息提取', '复杂文档\n格式调整', '多窗口\n数据对比', '填写\n表单', '系统\n设置修改'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: {
        color: muted,
        fontSize: 12,
        lineHeight: 16,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '操作步骤数',
      nameTextStyle: { color: muted, fontSize: 12, padding: [0, 0, 0, 30] },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    series: [
      {
        name: '传统交互',
        type: 'bar',
        data: [12, 15, 18, 10, 8],
        itemStyle: {
          color: accent2 + '55',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '28%',
        barGap: '15%'
      },
      {
        name: '智眼交互',
        type: 'bar',
        data: [3, 4, 5, 2, 2],
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0],
          shadowColor: accent + '44',
          shadowBlur: 8
        },
        barWidth: '28%',
        label: {
          show: true,
          position: 'top',
          color: accent,
          fontSize: 11,
          fontFamily: 'JetBrainsMono, monospace',
          formatter: function(p) {
            var trad = p.dataIndex;
            var tradVal = [12, 15, 18, 10, 8][trad];
            var reduction = Math.round((1 - p.value / tradVal) * 100);
            return '↓' + reduction + '%';
          }
        }
      }
    ]
  });

  window.addEventListener('resize', function() { chart.resize(); });
})();
