(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: User Journey Funnel ---
  var funnelChart = echarts.init(document.getElementById('chart-user-journey'), null, { renderer: 'svg' });
  if (funnelChart) {
    funnelChart.setOption({
      animation: false,
      tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
      color: [accent, accent + 'cc', accent + '99', accent + '66', accent + '44'],
      series: [{
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}%',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600
        },
        labelLine: { show: false },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        data: [
          { value: 100, name: '注册用户' },
          { value: 75, name: '完成画像' },
          { value: 60, name: '通过心理评估' },
          { value: 45, name: '匹配创业教练' },
          { value: 25, name: '启动商业验证' },
          { value: 12, name: '达成首笔收入' }
        ]
      }]
    });
    window.addEventListener('resize', function() { funnelChart.resize(); });
  }

  // --- Chart: Revenue Model Projection ---
  var revenueChart = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  if (revenueChart) {
    revenueChart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { data: ['标准层', '进阶层', '尊享层', '增值收入'], bottom: 0, textStyle: { color: muted } },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted }
      },
      yAxis: {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: muted },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted }
      },
      color: [accent, accent2, muted, accent + '88'],
      series: [
        { name: '标准层', type: 'bar', stack: 'total', data: [2, 5, 10, 18, 28, 40, 55, 70] },
        { name: '进阶层', type: 'bar', stack: 'total', data: [1, 3, 8, 15, 25, 38, 50, 65] },
        { name: '尊享层', type: 'bar', stack: 'total', data: [0.5, 2, 5, 10, 18, 28, 40, 52] },
        { name: '增值收入', type: 'bar', stack: 'total', data: [0.2, 1, 3, 7, 12, 20, 30, 42] }
      ]
    });
    window.addEventListener('resize', function() { revenueChart.resize(); });
  }
})();
