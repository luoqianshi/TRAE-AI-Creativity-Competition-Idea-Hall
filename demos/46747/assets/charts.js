(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var safe = style.getPropertyValue('--safe').trim();
  var caution = style.getPropertyValue('--caution').trim();
  var danger = style.getPropertyValue('--danger').trim();

  // --- Chart: User Scene Distribution ---
  var chartScene = echarts.init(document.getElementById('chart-user-scene'), null, { renderer: 'svg' });
  chartScene.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: muted }
    },
    series: [{
      name: '用户场景',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        show: true,
        color: muted,
        formatter: '{b}\n{d}%'
      },
      labelLine: { lineStyle: { color: rule } },
      data: [
        { value: 35, name: '项目依赖清理', itemStyle: { color: accent } },
        { value: 25, name: '系统缓存清理', itemStyle: { color: accent2 } },
        { value: 20, name: '构建产物清理', itemStyle: { color: safe } },
        { value: 12, name: '日志文件清理', itemStyle: { color: caution } },
        { value: 8, name: '其他临时文件', itemStyle: { color: muted } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartScene.resize(); });

  // --- Chart: Disk Usage Analysis ---
  var chartDisk = echarts.init(document.getElementById('chart-disk-usage'), null, { renderer: 'svg' });
  chartDisk.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink },
      formatter: function(params) {
        return params.marker + ' ' + params.name + '<br/>' +
               '大小: <b>' + params.value + ' GB</b><br/>' +
               '占比: <b>' + params.percent + '%</b>';
      }
    },
    series: [{
      name: '磁盘空间分布',
      type: 'sunburst',
      radius: ['15%', '85%'],
      itemStyle: {
        borderRadius: 6,
        borderColor: bg2,
        borderWidth: 2
      },
      label: {
        color: ink,
        rotate: 'radial',
        minAngle: 5
      },
      levels: [
        {},
        {
          r0: '15%',
          r: '45%',
          label: { rotate: 'tangential', fontSize: 12, fontWeight: 'bold' }
        },
        {
          r0: '45%',
          r: '80%',
          label: { align: 'right', fontSize: 11 }
        }
      ],
      data: [
        {
          name: '可清理',
          itemStyle: { color: accent },
          children: [
            {
              name: '依赖目录',
              value: 8.5,
              itemStyle: { color: '#0891b2' },
              children: [
                { name: 'node_modules', value: 3.2, itemStyle: { color: '#0e7490' } },
                { name: '.gradle', value: 2.1, itemStyle: { color: '#155e75' } },
                { name: '.m2', value: 1.8, itemStyle: { color: '#164e63' } },
                { name: 'venv', value: 1.4, itemStyle: { color: '#1e3a5f' } }
              ]
            },
            {
              name: '构建产物',
              value: 4.2,
              itemStyle: { color: '#06b6d4' },
              children: [
                { name: 'dist/', value: 1.8, itemStyle: { color: '#22d3ee' } },
                { name: 'target/', value: 1.5, itemStyle: { color: '#67e8f9' } },
                { name: 'build/', value: 0.9, itemStyle: { color: '#a5f3fc' } }
              ]
            },
            {
              name: '缓存文件',
              value: 3.8,
              itemStyle: { color: '#2dd4bf' },
              children: [
                { name: 'npm cache', value: 1.5, itemStyle: { color: '#14b8a6' } },
                { name: '系统缓存', value: 1.3, itemStyle: { color: '#0d9488' } },
                { name: '浏览器缓存', value: 1.0, itemStyle: { color: '#115e59' } }
              ]
            }
          ]
        },
        {
          name: '需谨慎',
          itemStyle: { color: caution },
          children: [
            { name: '日志文件', value: 2.5, itemStyle: { color: '#d97706' } },
            { name: 'Git历史', value: 1.8, itemStyle: { color: '#b45309' } },
            { name: '备份文件', value: 1.2, itemStyle: { color: '#92400e' } }
          ]
        },
        {
          name: '保留',
          itemStyle: { color: muted },
          children: [
            { name: '系统文件', value: 15.2, itemStyle: { color: '#64748b' } },
            { name: '用户文档', value: 8.6, itemStyle: { color: '#475569' } },
            { name: '源代码', value: 5.4, itemStyle: { color: '#334155' } }
          ]
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartDisk.resize(); });

  // --- Chart: Market Growth ---
  var chartMarket = echarts.init(document.getElementById('chart-market'), null, { renderer: 'svg' });
  chartMarket.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg2,
      borderColor: rule,
      textStyle: { color: ink }
    },
    legend: {
      data: ['开发者工具市场规模', '预估产品份额'],
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
      data: ['2024', '2025', '2026', '2027', '2028'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted }
    },
    yAxis: {
      type: 'value',
      name: '亿美元',
      nameTextStyle: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '开发者工具市场规模',
        type: 'bar',
        barWidth: '30%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: accent },
            { offset: 1, color: accent + '44' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: [85, 102, 125, 152, 185]
      },
      {
        name: '预估产品份额',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: accent2, width: 3 },
        itemStyle: { color: accent2, borderColor: bg2, borderWidth: 2 },
        data: [0.5, 1.8, 4.5, 9.2, 16.5]
      }
    ]
  });
  window.addEventListener('resize', function() { chartMarket.resize(); });
})();
