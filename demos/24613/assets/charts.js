(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#00e5ff';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#ff7a3d';
  var ink = style.getPropertyValue('--ink').trim() || '#e8edf5';
  var muted = style.getPropertyValue('--muted').trim() || '#7d889e';
  var rule = style.getPropertyValue('--rule').trim() || '#232b40';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#131826';

  var commonText = {
    fontFamily: 'InstrumentSans, sans-serif',
    color: muted,
    fontSize: 12
  };

  // --- Chart: Pain (耗时分布饼图) ---
  var painEl = document.getElementById('chart-pain');
  if (painEl) {
    var painChart = echarts.init(painEl, null, { renderer: 'svg' });
    painChart.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: accent,
        textStyle: { color: ink, fontFamily: commonText.fontFamily },
        formatter: '{b}<br/><strong style="color:' + accent + '">{c}%</strong>'
      },
      legend: {
        bottom: 0,
        textStyle: { color: muted, fontFamily: commonText.fontFamily, fontSize: 12 },
        itemWidth: 12,
        itemHeight: 12,
        icon: 'rect'
      },
      series: [{
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: bg2,
          borderWidth: 2
        },
        label: {
          color: ink,
          fontFamily: commonText.fontFamily,
          fontSize: 12,
          formatter: '{b}\n{d}%'
        },
        labelLine: { lineStyle: { color: muted } },
        data: [
          { value: 35, name: '零件几何建模', itemStyle: { color: accent } },
          { value: 25, name: '装配关系约束', itemStyle: { color: accent2 } },
          { value: 18, name: '试打 / 误差迭代', itemStyle: { color: accent + 'aa' } },
          { value: 12, name: '间隙补偿调整', itemStyle: { color: accent2 + 'aa' } },
          { value: 10, name: '其他', itemStyle: { color: muted } }
        ]
      }]
    });
    window.addEventListener('resize', function () { painChart.resize(); });
  }

  // --- Chart: Time (角色耗时对比柱状图) ---
  var timeEl = document.getElementById('chart-time');
  if (timeEl) {
    var timeChart = echarts.init(timeEl, null, { renderer: 'svg' });
    timeChart.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: accent,
        textStyle: { color: ink, fontFamily: commonText.fontFamily },
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,229,255,0.06)' } }
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: muted, fontFamily: commonText.fontFamily, fontSize: 12 },
        itemWidth: 14,
        itemHeight: 10,
        icon: 'rect'
      },
      grid: { left: 50, right: 20, top: 50, bottom: 40 },
      xAxis: {
        type: 'category',
        data: ['3D 打印创客', '原型设计师', '机械结构工程师', 'Maker 社区用户'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontFamily: commonText.fontFamily, fontSize: 12 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '小时',
        nameTextStyle: { color: muted, fontFamily: commonText.fontFamily, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false },
        axisLabel: { color: muted, fontFamily: commonText.fontFamily, fontSize: 11 }
      },
      series: [
        {
          name: '传统流程',
          type: 'bar',
          data: [40, 18, 12, 30],
          itemStyle: { color: accent2, borderRadius: [2, 2, 0, 0] },
          barWidth: 26,
          label: {
            show: true,
            position: 'top',
            color: accent2,
            fontFamily: commonText.fontFamily,
            fontSize: 11,
            formatter: '{c}h'
          }
        },
        {
          name: '使用 Forgent3D',
          type: 'bar',
          data: [3, 4, 5, 2],
          itemStyle: { color: accent, borderRadius: [2, 2, 0, 0] },
          barWidth: 26,
          label: {
            show: true,
            position: 'top',
            color: accent,
            fontFamily: commonText.fontFamily,
            fontSize: 11,
            formatter: '{c}h'
          }
        }
      ]
    });
    window.addEventListener('resize', function () { timeChart.resize(); });
  }
})();
