// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--pp-primary').trim();
  var ink = style.getPropertyValue('--pp-ink').trim();
  var muted = style.getPropertyValue('--pp-ink-mute').trim();
  var rule = style.getPropertyValue('--pp-border').trim();
  var bg2 = style.getPropertyValue('--pp-surface-2').trim();
  var walk = style.getPropertyValue('--pp-walk').trim();
  var bath = style.getPropertyValue('--pp-bath').trim();
  var deworm = style.getPropertyValue('--pp-deworm').trim();
  var birthday = style.getPropertyValue('--pp-birthday').trim();

  // --- Chart 1: Radar (PAW PAW vs 4 竞品) ---
  var radarChart = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  radarChart.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: { data: ['PAW PAW', 'BarkHappy', '11pets', 'PetDesk', '宠物备忘录'], bottom: 0, textStyle: { color: ink, fontSize: 12 } },
    radar: {
      indicator: [
        { name: '60fps 动效', max: 5 },
        { name: '离线可用', max: 5 },
        { name: '遛狗轨迹', max: 5 },
        { name: '多宠物', max: 5 },
        { name: '庆祝动效', max: 5 },
        { name: '0¥ 免费', max: 5 }
      ],
      splitArea: { areaStyle: { color: ['transparent', bg2] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } },
      name: { textStyle: { color: ink, fontSize: 11 } }
    },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 6,
      data: [
        { value: [5, 5, 5, 5, 5, 5], name: 'PAW PAW', lineStyle: { color: accent, width: 3 }, areaStyle: { color: accent + '33' }, itemStyle: { color: accent } },
        { value: [2, 3, 1, 4, 1, 2], name: 'BarkHappy', lineStyle: { color: deworm, width: 2 }, areaStyle: { color: deworm + '22' }, itemStyle: { color: deworm } },
        { value: [3, 2, 2, 5, 2, 3], name: '11pets', lineStyle: { color: bath, width: 2 }, areaStyle: { color: bath + '22' }, itemStyle: { color: bath } },
        { value: [2, 1, 1, 4, 1, 3], name: 'PetDesk', lineStyle: { color: birthday, width: 2 }, areaStyle: { color: birthday + '22' }, itemStyle: { color: birthday } },
        { value: [1, 4, 1, 2, 1, 5], name: '宠物备忘录', lineStyle: { color: walk, width: 2 }, areaStyle: { color: walk + '22' }, itemStyle: { color: walk } }
      ]
    }]
  });
  window.addEventListener('resize', function() { radarChart.resize(); });

  // --- Chart 2: Funnel (用户行为漏斗) ---
  var funnelChart = echarts.init(document.getElementById('chart-funnel'), null, { renderer: 'svg' });
  funnelChart.setOption({
    animation: false,
    tooltip: { trigger: 'item', formatter: '{b}: {c}万', appendToBody: true },
    series: [{
      type: 'funnel',
      left: '10%', right: '10%', top: 20, bottom: 20,
      width: '80%',
      min: 0, max: 5343, minSize: '20%', maxSize: '100%',
      sort: 'descending', gap: 4,
      label: { show: true, position: 'inside', color: '#fff', fontWeight: 600, fontSize: 13, formatter: '{b}\n{c}万' },
      labelLine: { length: 10, lineStyle: { width: 1 } },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: 5343, name: '中国城市犬总数', itemStyle: { color: accent } },
        { value: 3206, name: '智能手机主人', itemStyle: { color: '#FF6B4A' } },
        { value: 1603, name: '宠物 App 装机', itemStyle: { color: deworm } },
        { value: 481, name: '留存 7 日', itemStyle: { color: bath } },
        { value: 96, name: '周活跃使用', itemStyle: { color: birthday } },
        { value: 12, name: '深度玩家 (遛狗轨迹)', itemStyle: { color: walk } }
      ]
    }]
  });
  window.addEventListener('resize', function() { funnelChart.resize(); });
})();
