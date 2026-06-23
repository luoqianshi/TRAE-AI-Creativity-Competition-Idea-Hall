// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 农村中老年精神疾病患者认知与治疗现状 ---
  var chart1 = echarts.init(document.getElementById('chart-rural-treatment'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        var tip = '<strong>' + params[0].axisValue + '</strong><br/>';
        params.forEach(function(p) {
          tip += p.marker + ' ' + p.seriesName + '：<strong>' + p.value + '%</strong><br/>';
        });
        return tip;
      }
    },
    legend: {
      data: ['知晓患病', '正在服药'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemGap: 24
    },
    grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['抑郁患者', '焦虑患者'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 25,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12, formatter: '{value}%' }
    },
    series: [
      {
        name: '知晓患病',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        data: [10.3, 20.0],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: ink,
          fontSize: 12,
          fontWeight: 600
        }
      },
      {
        name: '正在服药',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] },
        data: [5.6, 11.1],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: ink,
          fontSize: 12,
          fontWeight: 600
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: 三省份农村中老年抑郁与焦虑患病率对比 ---
  var chart2 = echarts.init(document.getElementById('chart-province-comparison'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        var tip = '<strong>' + params[0].axisValue + '</strong><br/>';
        params.forEach(function(p) {
          tip += p.marker + ' ' + p.seriesName + '：<strong>' + p.value + '%</strong><br/>';
        });
        return tip;
      }
    },
    legend: {
      data: ['抑郁患病率', '焦虑患病率'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemGap: 24
    },
    grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['黑龙江', '山西', '湖北'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 10,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontSize: 12, formatter: '{value}%' }
    },
    series: [
      {
        name: '抑郁患病率',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        data: [8.5, 4.6, 1.7],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: ink,
          fontSize: 12,
          fontWeight: 600
        }
      },
      {
        name: '焦虑患病率',
        type: 'bar',
        barWidth: '28%',
        itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] },
        data: [4.6, 2.8, 1.3],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: ink,
          fontSize: 12,
          fontWeight: 600
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();