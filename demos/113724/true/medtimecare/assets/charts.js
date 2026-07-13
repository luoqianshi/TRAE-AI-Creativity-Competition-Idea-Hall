(function() {
  'use strict';

  // Check if ECharts is available
  if (typeof echarts === 'undefined') return;

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var warn = style.getPropertyValue('--warn').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  // === Chart 1: Pain Point Distribution (Pie/Ring) ===
  var chartPainEl = document.getElementById('chart-pain');
  if (chartPainEl) {
    var chartPain = echarts.init(chartPainEl, null, { renderer: 'svg' });
    chartPain.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: '{b}: {c}% ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        textStyle: { color: muted, fontSize: 11 },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10
      },
      color: [warn, accent, accent2, '#8b7ec8', '#e8a3c8'],
      series: [{
        name: '家庭用药痛点分布',
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: bg2,
          borderWidth: 3
        },
        label: {
          show: true,
          formatter: '{b}\n{c}%',
          fontSize: 11,
          color: ink,
          fontWeight: 600
        },
        labelLine: {
          length: 12,
          length2: 8,
          lineStyle: { color: rule }
        },
        data: [
          { value: 32, name: '漏服/错服' },
          { value: 24, name: '药品过期' },
          { value: 20, name: '库存不足' },
          { value: 14, name: '家人信息割裂' },
          { value: 10, name: '说明书难懂' }
        ]
      }]
    });
    window.addEventListener('resize', function() { chartPain.resize(); });
  }

  // === Chart 2: Compliance Rate Improvement (Bar) ===
  var chartCompEl = document.getElementById('chart-compliance');
  if (chartCompEl) {
    var chartComp = echarts.init(chartCompEl, null, { renderer: 'svg' });
    chartComp.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          var str = params[0].name + '<br/>';
          params.forEach(function(p) {
            str += p.marker + ' ' + p.seriesName + ': ' + p.value + '%<br/>';
          });
          return str;
        }
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: muted, fontSize: 11 },
        itemWidth: 12,
        itemHeight: 12
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['慢病长辈', '育儿家庭', '全体家庭成员'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }
      },
      series: [
        {
          name: '使用前',
          type: 'bar',
          data: [52, 61, 55],
          barWidth: '28%',
          barGap: '15%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: bg3
          },
          label: {
            show: true,
            position: 'top',
            color: muted,
            fontSize: 11,
            fontWeight: 600,
            formatter: '{c}%'
          }
        },
        {
          name: '使用后预期',
          type: 'bar',
          data: [88, 92, 85],
          barWidth: '28%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: accent
          },
          label: {
            show: true,
            position: 'top',
            color: accent,
            fontSize: 11,
            fontWeight: 600,
            formatter: '{c}%'
          }
        }
      ]
    });
    window.addEventListener('resize', function() { chartComp.resize(); });
  }

})();
