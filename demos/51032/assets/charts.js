(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ===== Chart 1: Time comparison (stacked bar) =====
  var chartTime = echarts.init(document.getElementById('chart-time'), null, { renderer: 'svg' });
  chartTime.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
      formatter: function(params) {
        var total = 0;
        var html = '<div style="font-weight:700;margin-bottom:6px">' + params[0].name + '</div>';
        params.forEach(function(p) {
          total += p.value;
          html += p.marker + ' ' + p.seriesName + '：<b>' + p.value + ' 分钟</b><br/>';
        });
        html += '<div style="margin-top:6px;border-top:1px solid #eee;padding-top:6px">合计：<b>' + total + ' 分钟</b></div>';
        return html;
      }
    },
    legend: {
      data: ['条款比对', '影响分析', '备忘录起草'],
      top: 0,
      right: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['传统人工流程', '合规雷达'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontSize: 14, fontWeight: 600, margin: 14 }
    },
    yAxis: {
      type: 'value',
      name: '耗时（分钟）',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12 }
    },
    series: [
      {
        name: '条款比对',
        type: 'bar',
        stack: 'total',
        barWidth: '38%',
        data: [150, 1.5],
        itemStyle: { color: accent, borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '影响分析',
        type: 'bar',
        stack: 'total',
        data: [90, 1.5],
        itemStyle: { color: accent2 }
      },
      {
        name: '备忘录起草',
        type: 'bar',
        stack: 'total',
        data: [120, 2],
        itemStyle: {
          color: '#7aa7d9',
          borderRadius: [6, 6, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: function(params) {
            var idx = params.dataIndex;
            var totals = [360, 5];
            return '合计 ' + totals[idx] + ' 分钟';
          },
          color: ink,
          fontSize: 13,
          fontWeight: 700
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartTime.resize(); });

  // ===== Chart 2: Capability radar =====
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    animation: false,
    tooltip: { appendToBody: true },
    legend: {
      data: ['新规解析', '条款对照表生成', '备忘录一键起草'],
      top: 0,
      textStyle: { color: muted, fontSize: 13 }
    },
    radar: {
      center: ['50%', '56%'],
      radius: '62%',
      indicator: [
        { name: '自动化程度', max: 100 },
        { name: '准确率', max: 100 },
        { name: '专业度', max: 100 },
        { name: '易用性', max: 100 },
        { name: '可扩展性', max: 100 }
      ],
      axisName: { color: ink, fontSize: 13, fontWeight: 600 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: ['rgba(30,91,184,0.02)', 'rgba(30,91,184,0.05)'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      symbolSize: 6,
      data: [
        {
          value: [92, 88, 85, 90, 86],
          name: '新规解析',
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          areaStyle: { color: 'rgba(30,91,184,0.12)' }
        },
        {
          value: [95, 93, 90, 92, 84],
          name: '条款对照表生成',
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          areaStyle: { color: 'rgba(0,168,168,0.12)' }
        },
        {
          value: [90, 86, 94, 88, 88],
          name: '备忘录一键起草',
          lineStyle: { color: '#7aa7d9', width: 2 },
          itemStyle: { color: '#7aa7d9' },
          areaStyle: { color: 'rgba(122,167,217,0.12)' }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRadar.resize(); });
})();
