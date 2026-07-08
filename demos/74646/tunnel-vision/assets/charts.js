(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var danger = style.getPropertyValue('--danger').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // --- Chart 1: Stress Field Heatmap (tunnel cross-section simulation) ---
  var chartStress = echarts.init(document.getElementById('chart-stress'), null, { renderer: 'svg' });

  // Simulate a tunnel cross-section stress field
  var xData = [];
  var yData = [];
  var stressData = [];
  var centerX = 24, centerY = 24, radius = 18;

  for (var i = 0; i <= 48; i++) {
    xData.push((i - 24).toFixed(1));
  }
  for (var j = 0; j <= 48; j++) {
    yData.push((24 - j).toFixed(1));
  }

  for (var xi = 0; xi <= 48; xi++) {
    for (var yi = 0; yi <= 48; yi++) {
      var dx = xi - centerX;
      var dy = yi - centerY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var val;
      if (dist < radius * 0.6) {
        // Inside tunnel cavity - low stress
        val = 0.5 + Math.random() * 0.3;
      } else if (dist < radius) {
        // Near wall - stress concentration
        var t = (dist - radius * 0.6) / (radius * 0.4);
        val = 0.8 + t * 5 + Math.random() * 0.5;
      } else {
        // Far field - decaying stress with some anomalies
        var base = 3.0 + 8.0 * Math.exp(-(dist - radius) / 8);
        // Add a high-stress anomaly zone (top-right)
        var anomDx = xi - 38;
        var anomDy = yi - 12;
        var anomDist = Math.sqrt(anomDx * anomDx + anomDy * anomDy);
        if (anomDist < 6) {
          base += 12 * Math.exp(-anomDist / 3);
        }
        val = base + Math.random() * 0.4;
      }
      stressData.push([xi, yi, parseFloat(val.toFixed(2))]);
    }
  }

  chartStress.setOption({
    animation: false,
    tooltip: {
      position: 'top',
      appendToBody: true,
      formatter: function(p) {
        return 'X: ' + xData[p.value[0]] + 'm<br>Y: ' + yData[p.value[1]] + 'm<br>应力: ' + p.value[2] + ' MPa';
      },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    grid: { top: 30, bottom: 60, left: 60, right: 100 },
    xAxis: {
      type: 'category',
      data: xData,
      name: '横向位置 (m)',
      nameLocation: 'middle',
      nameGap: 35,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted, interval: 7 },
      splitArea: { show: false }
    },
    yAxis: {
      type: 'category',
      data: yData,
      name: '纵向位置 (m)',
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted, interval: 7 },
      splitArea: { show: false }
    },
    visualMap: {
      min: 0,
      max: 18,
      calculable: true,
      orient: 'vertical',
      right: 10,
      top: 'center',
      text: ['高应力', '低应力'],
      textStyle: { color: muted },
      inRange: {
        color: [bg, '#0ea5e9', '#00d4ff', '#f59e0b', '#ef4444']
      },
      outOfRange: { color: 'transparent' }
    },
    series: [{
      type: 'heatmap',
      data: stressData,
      label: { show: false },
      emphasis: {
        itemStyle: { borderColor: ink, borderWidth: 1 }
      }
    }]
  });
  window.addEventListener('resize', function() { chartStress.resize(); });

  // --- Chart 2: Risk Level Evolution ---
  var chartRisk = echarts.init(document.getElementById('chart-risk'), null, { renderer: 'svg' });

  var hours = [];
  var riskLevel = [];
  var warningLine = [];
  var dangerLine = [];
  for (var h = 0; h <= 72; h += 2) {
    hours.push('T+' + h + 'h');
    // Simulate increasing risk then a drop after intervention
    var r;
    if (h < 36) {
      r = 1.5 + h * 0.06 + Math.sin(h * 0.3) * 0.4;
    } else if (h < 48) {
      r = 3.5 + (h - 36) * 0.15 + Math.random() * 0.3;
    } else {
      r = 5.3 - (h - 48) * 0.2 + Math.random() * 0.2;
    }
    riskLevel.push(parseFloat(r.toFixed(2)));
    warningLine.push(3.5);
    dangerLine.push(5.0);
  }

  chartRisk.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['风险指数', '预警阈值', '危险阈值'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: { top: 30, bottom: 50, left: 50, right: 30 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted, interval: 5 }
    },
    yAxis: {
      type: 'value',
      name: '风险指数',
      min: 0,
      max: 7,
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '风险指数',
        type: 'line',
        data: riskLevel,
        smooth: true,
        lineStyle: { color: accent, width: 3 },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '44' },
              { offset: 1, color: accent + '08' }
            ]
          }
        },
        markPoint: {
          data: [
            { type: 'max', name: '峰值', itemStyle: { color: danger } }
          ],
          label: { color: ink }
        }
      },
      {
        name: '预警阈值',
        type: 'line',
        data: warningLine,
        lineStyle: { color: accent2, type: 'dashed', width: 2 },
        itemStyle: { color: accent2 },
        symbol: 'none'
      },
      {
        name: '危险阈值',
        type: 'line',
        data: dangerLine,
        lineStyle: { color: danger, type: 'dashed', width: 2 },
        itemStyle: { color: danger },
        symbol: 'none'
      }
    ]
  });
  window.addEventListener('resize', function() { chartRisk.resize(); });

  // --- Chart 3: Cross-section Stress Comparison ---
  var chartCompare = echarts.init(document.getElementById('chart-compare'), null, { renderer: 'svg' });

  var sections = ['K12+100', 'K12+150', 'K12+200', 'K12+250', 'K12+300', 'K12+350', 'K12+400'];
  var maxStress = [8.5, 12.3, 15.7, 9.2, 6.8, 11.4, 7.5];
  var avgStress = [3.2, 4.8, 6.1, 3.5, 2.8, 4.2, 3.1];

  chartCompare.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['最大主应力', '平均应力'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: { top: 30, bottom: 50, left: 60, right: 30 },
    xAxis: {
      type: 'category',
      data: sections,
      name: '断面桩号',
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '应力 (MPa)',
      axisLine: { lineStyle: { color: muted } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '最大主应力',
        type: 'bar',
        data: maxStress,
        itemStyle: {
          color: function(params) {
            return params.value >= 12 ? danger : accent;
          },
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      },
      {
        name: '平均应力',
        type: 'bar',
        data: avgStress,
        itemStyle: {
          color: accent3,
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartCompare.resize(); });

})();
