(function() {
  var root = document.documentElement;
  var style = getComputedStyle(root);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var el = document.getElementById('chart-capability');
  if (!el || typeof echarts === 'undefined') return;

  var chart = echarts.init(el, null, { renderer: 'svg' });
  chart.setOption({
    animation: false,
    color: [accent, accent2, muted],
    tooltip: {
      appendToBody: true,
      trigger: 'item'
    },
    radar: {
      radius: '68%',
      center: ['50%', '54%'],
      splitNumber: 4,
      axisName: {
        color: ink,
        fontSize: 13,
        lineHeight: 18
      },
      axisLine: {
        lineStyle: { color: rule }
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      splitArea: {
        areaStyle: {
          color: [bg2, 'transparent']
        }
      },
      indicator: [
        { name: '识别能力', max: 5 },
        { name: '使用门槛', max: 5 },
        { name: '公益属性', max: 5 },
        { name: '开发效率', max: 5 },
        { name: '反馈迭代', max: 5 },
        { name: '推广潜力', max: 5 }
      ]
    },
    series: [{
      name: '项目能力结构',
      type: 'radar',
      data: [{
        value: [4.4, 4.8, 5, 4.7, 4.5, 4.2],
        name: '南部县AI柑橘病虫害识别工具',
        areaStyle: {
          color: accent2 + '33'
        },
        lineStyle: {
          color: accent2,
          width: 3
        },
        itemStyle: {
          color: accent
        },
        label: {
          show: false,
          color: muted
        }
      }]
    }]
  });

  window.addEventListener('resize', function() {
    chart.resize();
  });
})();
