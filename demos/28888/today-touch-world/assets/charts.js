(function () {
  if (typeof echarts === 'undefined') return;
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();
  var warn = style.getPropertyValue('--warn').trim();

  var fontFamily = 'Instrument Sans, PingFang SC, sans-serif';

  // ============ 1. Pie: Task type distribution ============
  var elTypes = document.getElementById('chart-types');
  if (elTypes) {
    var c1 = echarts.init(elTypes, null, { renderer: 'svg' });
    c1.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true, textStyle: { fontFamily: fontFamily } },
      legend: {
        bottom: 4,
        left: 'center',
        textStyle: { color: muted, fontSize: 11, fontFamily: fontFamily },
        itemWidth: 10,
        itemHeight: 10
      },
      color: [accent, accent2, accent3, warn, muted],
      series: [{
        name: '任务类型',
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: bg3, borderWidth: 2 },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: ink,
          fontSize: 11,
          fontFamily: fontFamily,
          lineHeight: 16
        },
        labelLine: { length: 8, length2: 8, lineStyle: { color: rule } },
        data: [
          { value: 28, name: '感官唤醒' },
          { value: 24, name: '微小成就' },
          { value: 20, name: '身体开机' },
          { value: 16, name: '低压力连接' },
          { value: 12, name: '现实微冒险' }
        ]
      }]
    });
    window.addEventListener('resize', function () { c1.resize(); });
  }

  // ============ 2. Heatmap: 5 types × 4 dimensions ============
  var elHeat = document.getElementById('chart-heat');
  if (elHeat) {
    var c2 = echarts.init(elHeat, null, { renderer: 'svg' });
    var xCats = ['身体开机', '感官唤醒', '微小成就', '低压力连接', '现实微冒险'];
    var yCats = ['身体维度', '感官维度', '行动维度', '连接维度'];
    // raw: [xIdx, yIdx, value 0-100]
    var raw = [
      [0,0,90],[0,1,30],[0,2,40],[0,3,10],
      [1,0,30],[1,1,95],[1,2,35],[1,3,15],
      [2,0,25],[2,1,45],[2,2,90],[2,3,25],
      [3,0,15],[3,1,35],[3,2,55],[3,3,90],
      [4,0,55],[4,1,75],[4,2,70],[4,3,60]
    ];
    c2.setOption({
      animation: false,
      tooltip: {
        position: 'top',
        appendToBody: true,
        textStyle: { fontFamily: fontFamily },
        formatter: function (p) {
          return xCats[p.value[0]] + ' × ' + yCats[p.value[1]] + '<br/>贡献度：' + p.value[2];
        }
      },
      grid: { left: 70, right: 30, top: 30, bottom: 70 },
      xAxis: {
        type: 'category',
        data: xCats,
        splitArea: { show: false },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 11, fontFamily: fontFamily, interval: 0, rotate: 25 }
      },
      yAxis: {
        type: 'category',
        data: yCats,
        splitArea: { show: false },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontSize: 11, fontFamily: fontFamily }
      },
      visualMap: {
        min: 0, max: 100, calculable: false, show: false,
        inRange: { color: [bg2, accent3, accent] }
      },
      series: [{
        name: '匹配度', type: 'heatmap', data: raw,
        label: { show: true, color: '#fff', fontSize: 11, fontFamily: fontFamily,
          formatter: function (p) { return p.value[2]; } },
        emphasis: { itemStyle: { borderColor: ink, borderWidth: 1 } },
        itemStyle: { borderRadius: 4, borderColor: bg3, borderWidth: 2 }
      }]
    });
    window.addEventListener('resize', function () { c2.resize(); });
  }

  // ============ 3. Line: Energy → task difficulty ============
  var elEnergy = document.getElementById('chart-energy');
  if (elEnergy) {
    var c3 = echarts.init(elEnergy, null, { renderer: 'svg' });
    c3.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis', appendToBody: true, textStyle: { fontFamily: fontFamily },
        valueFormatter: function (v) { return v + ' / 100 难度系数'; }
      },
      legend: {
        top: 0, right: 0, textStyle: { color: muted, fontFamily: fontFamily, fontSize: 12 },
        itemWidth: 16, itemHeight: 8
      },
      grid: { left: 50, right: 30, top: 40, bottom: 40 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['1 格', '2 格', '3 格', '4 格', '5 格'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontFamily: fontFamily, fontSize: 12 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value', max: 100,
        axisLine: { show: false }, axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: fontFamily, fontSize: 11 }
      },
      series: [
        {
          name: '原任务难度',
          type: 'line',
          smooth: true,
          symbol: 'circle', symbolSize: 8,
          data: [22, 38, 55, 72, 88],
          itemStyle: { color: accent },
          lineStyle: { color: accent, width: 2.5 },
          areaStyle: { color: 'rgba(197,106,74,0.12)' }
        },
        {
          name: '降级后实际可执行难度',
          type: 'line',
          smooth: true,
          symbol: 'circle', symbolSize: 8,
          data: [8, 18, 35, 55, 72],
          itemStyle: { color: accent2 },
          lineStyle: { color: accent2, width: 2.5, type: 'dashed' }
        }
      ]
    });
    window.addEventListener('resize', function () { c3.resize(); });
  }

  // ============ 4. Bar: Revenue structure ============
  var elRev = document.getElementById('chart-rev');
  if (elRev) {
    var c4 = echarts.init(elRev, null, { renderer: 'svg' });
    var revData = [
      { name: '个性化订阅', y1: 35, y3: 58 },
      { name: '本地生活合作', y1: 22, y3: 24 },
      { name: '生活碎片模板', y1: 18, y3: 8 },
      { name: 'B 端温和场景', y1: 15, y3: 6 },
      { name: '其他', y1: 10, y3: 4 }
    ];
    c4.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true, textStyle: { fontFamily: fontFamily },
        valueFormatter: function (v) { return v + '%'; } },
      legend: { top: 0, right: 0, textStyle: { color: muted, fontFamily: fontFamily, fontSize: 12 } },
      grid: { left: 50, right: 30, top: 40, bottom: 40 },
      xAxis: {
        type: 'category',
        data: revData.map(function (d) { return d.name; }),
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontFamily: fontFamily, fontSize: 11, interval: 0 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false }, axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: fontFamily, fontSize: 11, formatter: '{value}%' }
      },
      series: [
        {
          name: 'Y1 早期阶段', type: 'bar', barGap: 0, data: revData.map(function (d) { return d.y1; }),
          itemStyle: { color: accent3, borderRadius: [4,4,0,0] }
        },
        {
          name: 'Y3 成熟阶段', type: 'bar', data: revData.map(function (d) { return d.y3; }),
          itemStyle: { color: accent, borderRadius: [4,4,0,0] }
        }
      ]
    });
    window.addEventListener('resize', function () { c4.resize(); });
  }
})();
