// 游戏聊天翻译器 创意展示 - 图表脚本
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- 游戏品类覆盖雷达图 ---
  var chartValue = echarts.init(document.getElementById('chart-value'), null, { renderer: 'svg' });
  chartValue.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true
    },
    radar: {
      center: ['50%', '50%'],
      radius: '65%',
      indicator: [
        { name: 'MMO 网游', max: 100 },
        { name: 'FPS 射击', max: 100 },
        { name: 'MOBA 竞技', max: 100 },
        { name: 'Steam 联机', max: 100 },
        { name: '独立游戏', max: 100 }
      ],
      axisName: {
        color: muted,
        fontSize: 11,
        fontWeight: 600
      },
      splitArea: {
        areaStyle: {
          color: [bg2, bg2]
        }
      },
      splitLine: {
        lineStyle: { color: rule }
      },
      axisLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: accent,
        width: 2
      },
      areaStyle: {
        color: accent + '33'
      },
      itemStyle: {
        color: accent
      },
      data: [{
        value: [95, 80, 85, 90, 70],
        name: '游戏聊天翻译器 覆盖度',
        label: {
          show: false
        }
      }]
    }]
  });

  window.addEventListener('resize', function() { chartValue.resize(); });
})();