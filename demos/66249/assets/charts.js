(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  function axisBase() {
    return {
      axisLine: { lineStyle: { color: rule } },
      axisTick: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    };
  }

  var riskEl = document.getElementById('chart-risk');
  if (riskEl) {
    var riskChart = echarts.init(riskEl, null, { renderer: 'svg' });
    riskChart.setOption({
      animation: false,
      color: [accent, accent2, muted, accent + '99'],
      tooltip: { trigger: 'item', appendToBody: true },
      legend: { bottom: 0, textStyle: { color: muted } },
      radar: {
        radius: '62%',
        center: ['50%', '45%'],
        axisName: { color: ink, fontWeight: 700 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
        axisLine: { lineStyle: { color: rule } },
        indicator: [
          { name: '超时离场', max: 100 },
          { name: '临时取消', max: 100 },
          { name: '位置不实', max: 100 },
          { name: '车辆小摩擦', max: 100 },
          { name: '物业准入', max: 100 }
        ]
      },
      series: [{
        name: '保障强度',
        type: 'radar',
        data: [
          {
            value: [92, 82, 86, 70, 76],
            name: 'MVP 保障覆盖',
            areaStyle: { color: accent + '33' },
            lineStyle: { color: accent, width: 3 },
            itemStyle: { color: accent }
          }
        ]
      }]
    });
    window.addEventListener('resize', function () { riskChart.resize(); });
  }

  var revenueEl = document.getElementById('chart-revenue');
  if (revenueEl) {
    var revenueChart = echarts.init(revenueEl, null, { renderer: 'svg' });
    revenueChart.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: { trigger: 'axis', appendToBody: true },
      grid: { left: 44, right: 20, top: 24, bottom: 46 },
      xAxis: Object.assign({
        type: 'category',
        data: ['15%抽佣', '18%抽佣', '20%抽佣', '+保险服务', '+物业合作'],
        axisLabel: { rotate: 18 }
      }, axisBase()),
      yAxis: Object.assign({
        type: 'value',
        name: '日收入 / 元',
        nameTextStyle: { color: muted }
      }, axisBase()),
      series: [{
        name: '日收入估算',
        type: 'bar',
        barWidth: '42%',
        data: [22500, 27000, 30000, 37000, 45000],
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: function (params) {
            return params.dataIndex < 3 ? accent : accent2;
          }
        },
        label: {
          show: true,
          position: 'top',
          color: ink,
          formatter: function (p) {
            return Math.round(p.value / 1000) + 'k';
          }
        }
      }]
    });
    window.addEventListener('resize', function () { revenueChart.resize(); });
  }
})();
