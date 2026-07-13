// assets/charts.js — 守望银龄创意提案图表
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var accentLight = style.getPropertyValue('--accent-light').trim();
  var accent2Light = style.getPropertyValue('--accent2-light').trim();

  // ===== Mermaid 初始化 =====
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: accentLight,
        primaryTextColor: ink,
        primaryBorderColor: accent,
        lineColor: muted,
        secondaryColor: accent2Light,
        tertiaryColor: bg2,
        fontFamily: "'WorkSans','PingFang SC','Microsoft YaHei',sans-serif",
        fontSize: '14px'
      },
      securityLevel: 'loose',
      flowchart: { curve: 'basis', padding: 20 }
    });
  }

  // ===== Chart 1: 中国老年人口增长趋势 =====
  var agingEl = document.getElementById('chart-aging');
  if (agingEl && typeof echarts !== 'undefined') {
    var chart1 = echarts.init(agingEl, null, { renderer: 'svg' });
    chart1.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 }
      },
      legend: {
        data: ['60岁以上人口（亿）', '老龄化率（%）'],
        top: 5,
        textStyle: { color: muted, fontSize: 12 },
        itemWidth: 16,
        itemHeight: 10
      },
      grid: { left: 50, right: 55, top: 55, bottom: 40 },
      xAxis: {
        type: 'category',
        data: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 12 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: '人口（亿）',
          nameTextStyle: { color: muted, fontSize: 11 },
          axisLine: { show: false },
          axisLabel: { color: muted, fontSize: 11 },
          splitLine: { lineStyle: { color: rule, type: 'dashed' } },
          axisTick: { show: false },
          min: 2.0,
          max: 3.5
        },
        {
          type: 'value',
          name: '老龄化率（%）',
          nameTextStyle: { color: muted, fontSize: 11 },
          axisLine: { show: false },
          axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' },
          splitLine: { show: false },
          axisTick: { show: false },
          min: 17,
          max: 22
        }
      ],
      series: [
        {
          name: '60岁以上人口（亿）',
          type: 'bar',
          data: [2.55, 2.67, 2.80, 2.93, 3.02, 3.10, 3.18],
          itemStyle: {
            color: accent,
            borderRadius: [6, 6, 0, 0]
          },
          barWidth: '45%',
          label: {
            show: true,
            position: 'top',
            color: ink,
            fontSize: 11,
            formatter: '{c}亿'
          }
        },
        {
          name: '老龄化率（%）',
          type: 'line',
          yAxisIndex: 1,
          data: [18.1, 18.9, 19.8, 20.3, 20.6, 20.8, 21.1],
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: accent2, width: 3 },
          itemStyle: { color: accent2 },
          label: {
            show: true,
            position: 'top',
            color: accent2,
            fontSize: 11,
            formatter: '{c}%'
          }
        }
      ]
    });
    window.addEventListener('resize', function () { chart1.resize(); });
  }

  // ===== Chart 2: 老年人核心服务需求分布 =====
  var demandEl = document.getElementById('chart-demand');
  if (demandEl && typeof echarts !== 'undefined') {
    var chart2 = echarts.init(demandEl, null, { renderer: 'svg' });
    chart2.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 },
        formatter: '{b}<br/>需求占比: {c}%'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        textStyle: { color: muted, fontSize: 12 },
        itemWidth: 14,
        itemHeight: 10
      },
      series: [
        {
          name: '养老服务需求分布',
          type: 'pie',
          radius: ['38%', '65%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: bg2,
            borderWidth: 3
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            color: ink,
            fontSize: 12,
            fontWeight: 600
          },
          labelLine: { length: 12, length2: 10 },
          data: [
            { value: 32, name: '生活照料', itemStyle: { color: accent } },
            { value: 26, name: '健康护理', itemStyle: { color: accent2 } },
            { value: 18, name: '精神慰藉', itemStyle: { color: '#E6A817' } },
            { value: 14, name: '代办跑腿', itemStyle: { color: '#8B7AA8' } },
            { value: 10, name: '紧急救助', itemStyle: { color: '#C0392B' } }
          ]
        }
      ]
    });
    window.addEventListener('resize', function () { chart2.resize(); });
  }
})();
