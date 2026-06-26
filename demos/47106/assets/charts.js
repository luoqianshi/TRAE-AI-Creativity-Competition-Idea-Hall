// 暖守产品数据可视化图表
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#FF8C42';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#2D5A27';
  var ink = style.getPropertyValue('--ink').trim() || '#3D2C1E';
  var muted = style.getPropertyValue('--muted').trim() || '#8B7355';
  var rule = style.getPropertyValue('--rule').trim() || '#F0E6D6';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#FFFBF5';
  var accentSoft = style.getPropertyValue('--accent-soft').trim() || '#FFB07A';
  var accentLight = style.getPropertyValue('--accent-light').trim() || '#FFE8D6';
  var accent2Light = style.getPropertyValue('--accent2-light').trim() || '#D4E8D1';

  // 通用配置
  var commonOption = {
    animation: false,
    textStyle: {
      fontFamily: "'InstrumentSans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: ink
    }
  };

  // ==========================================
  // 图表1: 未来20年独守老人规模趋势
  // ==========================================
  var chartTrend = echarts.init(document.getElementById('chart-trend'), null, { renderer: 'svg' });

  var years = ['2025年', '2030年', '2035年', '2040年', '2045年'];

  chartTrend.setOption({
    ...commonOption,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var result = '<div style="font-weight:600;margin-bottom:8px;">' + params[0].axisValue + '</div>';
        params.forEach(function(item) {
          result += '<div style="display:flex;align-items:center;gap:8px;margin:4px 0;">'
            + '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + item.color + ';"></span>'
            + item.seriesName + '：<strong>' + item.value + '万</strong>'
            + '</div>';
        });
        return result;
      }
    },
    legend: {
      data: ['独守老人总数', '80岁以上高龄独守老人', '乡村独守老人'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 8
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '18%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: years,
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '万人',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '独守老人总数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: accent },
        itemStyle: { color: accent, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent + '30' },
            { offset: 1, color: accent + '05' }
          ])
        },
        data: [16000, 21000, 28000, 32000, 33000]
      },
      {
        name: '80岁以上高龄独守老人',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: accent2 },
        itemStyle: { color: accent2, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent2 + '25' },
            { offset: 1, color: accent2 + '05' }
          ])
        },
        data: [1200, 1800, 2600, 3500, 4200]
      },
      {
        name: '乡村独守老人',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 2.5, color: muted, type: 'dashed' },
        itemStyle: { color: muted, borderColor: '#fff', borderWidth: 2 },
        data: [3200, 3800, 4200, 4100, 3800]
      }
    ]
  });

  // ==========================================
  // 图表2: 独守老人健康风险对比
  // ==========================================
  var chartRisk = echarts.init(document.getElementById('chart-risk'), null, { renderer: 'svg' });

  chartRisk.setOption({
    ...commonOption,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 },
      formatter: function(params) {
        var result = '<div style="font-weight:600;margin-bottom:8px;">' + params[0].axisValue + '</div>';
        params.forEach(function(item) {
          result += '<div style="display:flex;align-items:center;gap:8px;margin:4px 0;">'
            + '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + item.color + ';"></span>'
            + item.seriesName + '：<strong>' + item.value + '%</strong>'
            + '</div>';
        });
        return result;
      }
    },
    legend: {
      data: ['乡村老人', '城镇老人'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 12
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '18%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['跌倒摔伤', '心脑血管事件', '慢性病急性发作', '用药意外'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted, fontSize: 11, interval: 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '年发生率(%)',
      nameTextStyle: { color: muted, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 12 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '乡村老人',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accentSoft }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: [48, 12.2, 28.3, 22.5]
      },
      {
        name: '城镇老人',
        type: 'bar',
        barWidth: '28%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent2 },
            { offset: 1, color: accent2 + '99' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: [32, 8.7, 24, 18]
      }
    ]
  });

  // ==========================================
  // 图表3: 乡村 vs 城镇独守老人状况对比
  // ==========================================
  var chartCompare = echarts.init(document.getElementById('chart-compare'), null, { renderer: 'svg' });

  var indicators = [
    { name: '高龄占比(80+)', max: 40 },
    { name: '慢性病患病率', max: 100 },
    { name: '行动不便比例', max: 40 },
    { name: '智能手机使用率', max: 60 },
    { name: '子女年均探望(次)', max: 8 },
    { name: '急救响应时间(分钟)', max: 100 }
  ];

  chartCompare.setOption({
    ...commonOption,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: '#fff',
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      data: ['乡村独守老人', '城镇独守老人'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemWidth: 16,
      itemHeight: 8
    },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 500
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: [bg2, 'transparent']
        }
      },
      axisLine: {
        lineStyle: { color: rule }
      },
      radius: '65%',
      center: ['50%', '48%']
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 6,
        data: [
          {
            value: [28.6, 78.4, 31.5, 12.3, 1.8, 90],
            name: '乡村独守老人',
            lineStyle: { width: 2.5, color: accent },
            itemStyle: { color: accent, borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: accent + '15' },
                { offset: 1, color: accent + '30' }
              ])
            }
          },
          {
            value: [19.3, 71.2, 18.7, 47.8, 5.2, 25],
            name: '城镇独守老人',
            lineStyle: { width: 2.5, color: accent2 },
            itemStyle: { color: accent2, borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: accent2 + '10' },
                { offset: 1, color: accent2 + '25' }
              ])
            }
          }
        ]
      }
    ]
  });

  // ==========================================
  // 响应式调整
  // ==========================================
  var resizeTimer = null;
  window.addEventListener('resize', function() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      chartTrend.resize();
      chartRisk.resize();
      chartCompare.resize();
    }, 100);
  });
})();
