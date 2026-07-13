(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // 中文图表字体
  var CN_FONT = 'Noto Sans CJK SC, WenQuanYi Micro Hei, sans-serif';

  // --- Chart 1: 多行业降本增效对比 ---
  var costEl = document.getElementById('chart-cost');
  if (costEl) {
    var chart1 = echarts.init(costEl, null, { renderer: 'svg' });
    chart1.setOption({
      textStyle: { fontFamily: CN_FONT, color: muted },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontFamily: CN_FONT },
        valueFormatter: function(v) { return v + '%'; }
      },
      legend: {
        data: ['运营成本下降', '运营效率提升'],
        top: 0,
        textStyle: { color: muted, fontFamily: CN_FONT },
        itemGap: 28
      },
      grid: { left: 48, right: 28, top: 52, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['餐饮', '制造', '文旅', '零售'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontFamily: CN_FONT, fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        name: '百分比 (%)',
        nameTextStyle: { color: muted, fontFamily: CN_FONT, fontSize: 11, padding: [0, 0, 0, 36] },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: CN_FONT, fontSize: 11, formatter: '{value}%' }
      },
      series: [
        {
          name: '运营成本下降',
          type: 'bar',
          data: [55, 48, 52, 50],
          itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
          barWidth: 26,
          label: { show: true, position: 'top', color: accent, fontFamily: CN_FONT, fontSize: 11, formatter: '{c}%' }
        },
        {
          name: '运营效率提升',
          type: 'bar',
          data: [180, 160, 210, 175],
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: accent2 },
                { offset: 1, color: 'rgba(139, 92, 246, 0.4)' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: 26,
          label: { show: true, position: 'top', color: accent2, fontFamily: CN_FONT, fontSize: 11, formatter: '{c}%' }
        }
      ],
      animation: false
    });
    window.addEventListener('resize', function() { chart1.resize(); });
  }

  // --- Chart 2: AI 劳动力替代率 ---
  var repEl = document.getElementById('chart-replace');
  if (repEl) {
    var chart2 = echarts.init(repEl, null, { renderer: 'svg' });
    chart2.setOption({
      textStyle: { fontFamily: CN_FONT, color: muted },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontFamily: CN_FONT },
        valueFormatter: function(v) { return v + '%'; }
      },
      legend: { show: false },
      grid: { left: 110, right: 60, top: 20, bottom: 30, containLabel: false },
      xAxis: {
        type: 'value',
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: CN_FONT, fontSize: 11, formatter: '{value}%' }
      },
      yAxis: {
        type: 'category',
        data: ['营销策划', '推广投放', '数据分析', '口碑处理', '智能客服', '内容生产'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontFamily: CN_FONT, fontSize: 12 }
      },
      series: [
        {
          name: 'AI 替代率',
          type: 'bar',
          data: [62, 68, 75, 80, 88, 92],
          barWidth: 18,
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: 'rgba(0, 194, 255, 0.3)' },
                { offset: 1, color: accent }
              ]
            },
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: accent,
            fontFamily: CN_FONT,
            fontSize: 11,
            formatter: '{c}%'
          }
        }
      ],
      animation: false
    });
    window.addEventListener('resize', function() { chart2.resize(); });
  }
})();
