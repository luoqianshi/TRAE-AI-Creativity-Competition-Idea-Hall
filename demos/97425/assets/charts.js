(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Storage Comparison ---
  var chartStorage = echarts.init(document.getElementById('chart-storage'), null, { renderer: 'svg' });
  chartStorage.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      appendToBody: true
    },
    legend: {
      data: ['宽表方案', '长表方案'],
      textStyle: { color: muted },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['存储空间(GB)', '空值浪费(GB)', '索引效率', '扩展灵活性'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '相对值',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [
      {
        name: '宽表方案',
        type: 'bar',
        data: [100, 80, 30, 20],
        itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      },
      {
        name: '长表方案',
        type: 'bar',
        data: [25, 5, 95, 95],
        itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartStorage.resize(); });

  // --- Chart: Performance Optimization Layers ---
  var chartPerf = echarts.init(document.getElementById('chart-performance'), null, { renderer: 'svg' });
  chartPerf.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      appendToBody: true,
      formatter: function(params) {
        return '<strong>' + params.name + '</strong><br/>' + params.data.desc;
      }
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: '5%',
        bottom: '5%',
        width: '80%',
        sort: 'ascending',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          color: ink,
          fontSize: 13,
          fontWeight: 600,
          formatter: function(params) {
            return params.name + '\n' + params.data.value + '%';
          }
        },
        labelLine: { show: false },
        itemStyle: {
          borderColor: rule,
          borderWidth: 1
        },
        emphasis: {
          label: { fontSize: 14 }
        },
        data: [
          { value: 95, name: '数据库层优化', desc: '分区表、物化视图、复合索引、查询优化', itemStyle: { color: accent } },
          { value: 75, name: '后端服务优化', desc: '异步任务队列、Redis缓存、连接池', itemStyle: { color: accent2 } },
          { value: 55, name: '前端渲染优化', desc: '虚拟滚动、缓冲渲染、分页加载、CDN加速', itemStyle: { color: muted } },
          { value: 35, name: '架构弹性扩展', desc: '容器化部署、水平扩展、读写分离', itemStyle: { color: rule } }
        ]
      }
    ]
  });
  window.addEventListener('resize', function() { chartPerf.resize(); });
})();
