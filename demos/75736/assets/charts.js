(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var soft = style.getPropertyValue('--soft').trim();

  function axisBase() {
    return {
      axisLabel: { color: muted, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    };
  }

  function makeResize(chart) {
    window.addEventListener('resize', function() { chart.resize(); });
  }

  var marketEl = document.getElementById('chart-market');
  if (marketEl) {
    var market = echarts.init(marketEl, null, { renderer: 'svg' });
    market.setOption({
      animation: false,
      color: [accent],
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: soft,
        borderColor: rule,
        textStyle: { color: ink },
        valueFormatter: function(value) { return value + ' 亿元'; }
      },
      grid: { top: 28, right: 24, bottom: 42, left: 58 },
      xAxis: Object.assign(axisBase(), {
        type: 'category',
        data: ['2025', '2026', '2027', '2028']
      }),
      yAxis: Object.assign(axisBase(), {
        type: 'value',
        name: '亿元',
        nameTextStyle: { color: muted }
      }),
      series: [{
        name: '市场规模',
        type: 'line',
        smooth: true,
        symbolSize: 9,
        lineStyle: { width: 4, color: accent },
        itemStyle: { color: accent },
        areaStyle: { color: accent + '26' },
        data: [38.66, 96.8, 243.6, 595.06],
        markPoint: {
          symbolSize: 54,
          label: { color: soft, fontWeight: 700 },
          itemStyle: { color: accent2 },
          data: [{ type: 'max', name: '2028' }]
        }
      }]
    });
    makeResize(market);
  }

  var revenueEl = document.getElementById('chart-revenue');
  if (revenueEl) {
    var revenue = echarts.init(revenueEl, null, { renderer: 'svg' });
    revenue.setOption({
      animation: false,
      color: [accent, accent2, accent3],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        appendToBody: true,
        backgroundColor: soft,
        borderColor: rule,
        textStyle: { color: ink },
        valueFormatter: function(value) { return value + ' 万元'; }
      },
      legend: {
        top: 0,
        textStyle: { color: muted }
      },
      grid: { top: 52, right: 22, bottom: 42, left: 68 },
      xAxis: Object.assign(axisBase(), {
        type: 'category',
        data: ['保守硬件', '乐观硬件', '年度订阅']
      }),
      yAxis: Object.assign(axisBase(), {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: muted }
      }),
      series: [{
        name: '收入测算',
        type: 'bar',
        barWidth: 42,
        data: [
          { value: 4000, itemStyle: { color: accent } },
          { value: 6000, itemStyle: { color: accent2 } },
          { value: 950, itemStyle: { color: accent3 } }
        ],
        label: {
          show: true,
          position: 'top',
          color: ink,
          formatter: function(p) { return p.value + '万'; }
        }
      }]
    });
    makeResize(revenue);
  }
})();
