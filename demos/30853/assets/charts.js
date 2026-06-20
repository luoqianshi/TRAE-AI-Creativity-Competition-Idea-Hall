// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accentLight = style.getPropertyValue('--accent-light').trim();
  var accent2Light = style.getPropertyValue('--accent2-light').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: 人口趋势 (Bar) ---
  (function() {
    var el = document.getElementById('chart-population');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        formatter: function(params) {
          return params[0].name + '<br/>' + params[0].marker + ' 60岁以上人口: <strong>' + params[0].value + ' 亿人</strong>';
        }
      },
      grid: { left: 50, right: 20, top: 20, bottom: 40 },
      xAxis: {
        type: 'category',
        data: ['2020', '2022', '2024', '2026E', '2028E', '2030E', '2035E'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 12 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '亿人',
        nameTextStyle: { color: muted, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontSize: 11 }
      },
      series: [{
        type: 'bar',
        data: [2.64, 2.80, 2.97, 3.10, 3.24, 3.40, 3.82],
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent },
              { offset: 1, color: accentLight }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          color: accent,
          fontWeight: 700,
          fontSize: 12,
          formatter: '{c}'
        }
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // --- Chart 2: 就医困难分布 (Pie) ---
  (function() {
    var el = document.getElementById('chart-difficulties');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: function(params) {
          return params.name + '<br/>占比: <strong>' + params.percent + '%</strong>';
        }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: bg2,
          borderWidth: 2
        },
        label: {
          show: true,
          color: ink,
          fontSize: 11,
          formatter: function(p) {
            return p.name + '\n' + p.percent + '%';
          }
        },
        emphasis: {
          label: { show: true, fontWeight: 'bold', fontSize: 13 }
        },
        data: [
          { value: 32, name: '线上操作困难', itemStyle: { color: accent } },
          { value: 28, name: '无人陪同就医', itemStyle: { color: accent2 } },
          { value: 18, name: '看不懂报告单据', itemStyle: { color: accentLight } },
          { value: 14, name: '预约流程复杂', itemStyle: { color: accent2Light } },
          { value: 8, name: '其他困难', itemStyle: { color: muted } }
        ]
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();

  // --- Chart 3: 市场规模预测 (Line + Bar) ---
  (function() {
    var el = document.getElementById('chart-market');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        formatter: function(params) {
          var s = params[0].name + '<br/>';
          params.forEach(function(p) {
            s += p.marker + ' ' + p.seriesName + ': <strong>' + p.value + ' 亿元</strong><br/>';
          });
          return s;
        }
      },
      legend: {
        data: ['市场规模', '年度增长率'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 12 }
      },
      grid: { left: 55, right: 55, top: 20, bottom: 50 },
      xAxis: {
        type: 'category',
        data: ['2024', '2025E', '2026E', '2027E', '2028E'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 12 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: '亿元',
          nameTextStyle: { color: muted, fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: rule, type: 'dashed' } },
          axisLabel: { color: muted, fontSize: 11 }
        },
        {
          type: 'value',
          name: '增长率',
          nameTextStyle: { color: muted, fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            color: muted,
            fontSize: 11,
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '市场规模',
          type: 'bar',
          data: [5800, 6800, 7900, 9200, 10800],
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: accent },
                { offset: 1, color: accentLight }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            color: accent,
            fontWeight: 700,
            fontSize: 11,
            formatter: '{c}'
          }
        },
        {
          name: '年度增长率',
          type: 'line',
          yAxisIndex: 1,
          data: [15.2, 17.2, 16.2, 16.5, 17.4],
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: accent2, width: 3 },
          itemStyle: { color: accent2 },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: accent2 + '33' },
                { offset: 1, color: accent2 + '05' }
              ]
            }
          },
          label: {
            show: true,
            position: 'top',
            color: accent2,
            fontWeight: 600,
            fontSize: 11,
            formatter: '{c}%'
          }
        }
      ]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  })();

})();