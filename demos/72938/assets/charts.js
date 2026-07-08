// assets/charts.js
// 图表逻辑必须放在外部文件，避免污染全局作用域
(function () {
  if (typeof echarts === 'undefined') return;

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  function initValueRadar() {
    var el = document.getElementById('chart-value-radar');
    if (!el) return;
    var chart = echarts.init(el, null, { renderer: 'svg' });

    var option = {
      animation: false,
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', appendToBody: true },
      radar: {
        radius: '68%',
        splitNumber: 4,
        axisName: { color: muted, fontSize: 12 },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['transparent', bg2] } },
        indicator: [
          { name: '无障碍可达性', max: 10 },
          { name: '隐私默认值', max: 10 },
          { name: '学习成本', max: 10 },
          { name: '实时性', max: 10 },
          { name: '硬件成本', max: 10 }
        ]
      },
      series: [
        {
          name: '设计取舍（示意）',
          type: 'radar',
          data: [
            {
              value: [9, 9, 6, 8, 6],
              name: 'MVP 目标'
            }
          ],
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          areaStyle: { color: accent2, opacity: 0.18 },
          label: {
            show: true,
            color: ink,
            formatter: function (p) { return String(p.value); }
          }
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  initValueRadar();
})();

