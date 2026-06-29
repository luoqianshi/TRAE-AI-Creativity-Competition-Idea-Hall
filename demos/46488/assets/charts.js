(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var good = style.getPropertyValue('--good').trim();
  var warn = style.getPropertyValue('--warn').trim();

  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      securityLevel: 'loose',
      themeVariables: {
        background: bg2,
        primaryColor: bg2,
        primaryTextColor: ink,
        primaryBorderColor: accent,
        lineColor: accent2,
        secondaryColor: bg2,
        tertiaryColor: bg2,
        fontFamily: 'Outfit'
      }
    });
  }

  function baseText() {
    return {
      color: muted,
      fontFamily: 'Outfit'
    };
  }

  function initChart(id, option) {
    var el = document.getElementById(id);
    if (!el || !window.echarts) return null;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption(option);
    window.addEventListener('resize', function() { chart.resize(); });
    return chart;
  }

  initChart('chart-capability', {
    animation: false,
    color: [accent, accent2],
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      bottom: 0,
      textStyle: baseText()
    },
    radar: {
      radius: '62%',
      center: ['50%', '47%'],
      axisName: {
        color: ink,
        fontSize: 13
      },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        areaStyle: {
          color: [bg2, 'transparent']
        }
      },
      axisLine: { lineStyle: { color: rule } },
      indicator: [
        { name: '数据融合', max: 100 },
        { name: '态势可视', max: 100 },
        { name: '链群研判', max: 100 },
        { name: '风险预警', max: 100 },
        { name: '趋势预测', max: 100 },
        { name: '报告生成', max: 100 }
      ]
    },
    series: [{
      name: '平台能力',
      type: 'radar',
      data: [
        {
          value: [92, 88, 84, 86, 78, 90],
          name: '目标能力',
          areaStyle: { color: accent + '33' },
          lineStyle: { color: accent, width: 3 },
          itemStyle: { color: accent }
        },
        {
          value: [45, 50, 36, 32, 28, 40],
          name: '传统方式',
          areaStyle: { color: accent2 + '22' },
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 }
        }
      ]
    }]
  });

  initChart('chart-efficiency', {
    animation: false,
    color: [accent, accent2],
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      valueFormatter: function(value) {
        return value + ' 小时';
      }
    },
    grid: { left: 54, right: 24, top: 32, bottom: 42 },
    xAxis: {
      type: 'category',
      data: ['人工跨部门调取', '人工清洗对表', '人工撰写报告', '平台自动分析'],
      axisLabel: { color: muted, interval: 0 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '耗时（小时）',
      nameTextStyle: { color: muted },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      name: '典型耗时',
      type: 'bar',
      data: [24, 20, 16, 0.25],
      barWidth: 34,
      itemStyle: {
        borderRadius: [10, 10, 0, 0],
        color: function(params) {
          return params.dataIndex === 3 ? good : accent2;
        }
      },
      label: {
        show: true,
        position: 'top',
        color: ink,
        formatter: function(p) {
          return p.dataIndex === 3 ? '分钟级' : p.value + 'h';
        }
      }
    }]
  });

  initChart('chart-index', {
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: {
      top: 0,
      textStyle: baseText()
    },
    grid: { left: 54, right: 32, top: 58, bottom: 44 },
    xAxis: {
      type: 'category',
      data: ['人工智能', '量子信息', '生物制造', '先进材料', '低空经济'],
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '产业景气',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: [86, 74, 79, 68, 72],
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: { color: accent + '20' }
      },
      {
        name: '创新动能',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: [90, 82, 76, 71, 66],
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2 },
        areaStyle: { color: accent2 + '18' }
      },
      {
        name: '链条安全',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: [70, 62, 75, 73, 58],
        lineStyle: { color: warn, width: 3 },
        itemStyle: { color: warn },
        areaStyle: { color: warn + '18' }
      }
    ]
  });
})();
