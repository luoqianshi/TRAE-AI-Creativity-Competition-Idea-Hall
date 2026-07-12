(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var capabilityEl = document.getElementById('chart-capability');
  if (!capabilityEl || typeof echarts === 'undefined') return;

  var capability = echarts.init(capabilityEl, null, { renderer: 'svg' });
  capability.setOption({
    animation: false,
    color: [accent, accent2],
    tooltip: {
      appendToBody: true,
      trigger: 'item'
    },
    radar: {
      center: ['50%', '52%'],
      radius: '68%',
      splitNumber: 4,
      axisName: {
        color: muted,
        fontSize: 12
      },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        areaStyle: {
          color: [bg2, 'transparent']
        }
      },
      axisLine: { lineStyle: { color: rule } },
      indicator: [
        { name: '全球动作更新', max: 100 },
        { name: '动作模式识别', max: 100 },
        { name: '肌群部位判断', max: 100 },
        { name: '多运动项目覆盖', max: 100 },
        { name: '个人动作沉淀', max: 100 },
        { name: '商业化扩展', max: 100 }
      ]
    },
    series: [{
      name: 'ActionPro 能力模型',
      type: 'radar',
      data: [{
        value: [96, 92, 90, 88, 82, 86],
        name: '核心能力',
        areaStyle: {
          color: accent + '26'
        },
        lineStyle: {
          color: accent,
          width: 3
        },
        itemStyle: {
          color: accent,
          borderColor: ink
        },
        label: {
          show: false,
          color: ink
        }
      }]
    }]
  });

  window.addEventListener('resize', function() {
    capability.resize();
  });
})();
