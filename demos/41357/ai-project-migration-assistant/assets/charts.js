// ECharts visualizations for AI 项目迁移助手 showcase
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var inkSoft = style.getPropertyValue('--ink-soft').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();
  var danger = style.getPropertyValue('--danger').trim();

  var baseTextStyle = {
    fontFamily: 'Bricolage, sans-serif',
    color: inkSoft
  };

  // ============== Chart 1: 迁移各阶段耗时占比（饼图） ==============
  var chart1 = echarts.init(document.getElementById('chart-time'), null, { renderer: 'svg' });
  chart1.setOption({
    backgroundColor: 'transparent',
    color: [accent, accent2, accent3, muted, danger],
    textStyle: baseTextStyle,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'Bricolage, sans-serif' },
      formatter: '{b}<br/>占比 <strong>{c}%</strong> （{d}%）'
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: inkSoft, fontFamily: 'Bricolage, sans-serif', fontSize: 13 },
      itemWidth: 12,
      itemHeight: 12,
      icon: 'roundRect'
    },
    series: [{
      name: '耗时占比',
      type: 'pie',
      radius: ['52%', '78%'],
      center: ['50%', '46%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: bg2,
        borderWidth: 3
      },
      label: {
        show: true,
        position: 'outside',
        color: ink,
        fontFamily: 'GeistMono, monospace',
        fontSize: 13,
        fontWeight: 600,
        formatter: '{b}\n{c}%'
      },
      labelLine: {
        length: 12,
        length2: 14,
        lineStyle: { color: rule }
      },
      data: [
        { value: 35, name: '理解旧项目结构' },
        { value: 25, name: '排查兼容性问题' },
        { value: 10, name: '整理需求给 AI' },
        { value: 20, name: '实际编码迁移' },
        { value: 10, name: '测试与回归' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // ============== Chart 2: 迁移痛点严重度评分（横向条形图） ==============
  var chart2 = echarts.init(document.getElementById('chart-pain'), null, { renderer: 'svg' });
  chart2.setOption({
    backgroundColor: 'transparent',
    textStyle: baseTextStyle,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'Bricolage, sans-serif' },
      axisPointer: { type: 'shadow' },
      formatter: '{b}<br/>严重度评分：<strong>{c}</strong> / 10'
    },
    grid: { left: 10, right: 36, top: 12, bottom: 6, containLabel: true },
    xAxis: {
      type: 'value',
      max: 10,
      show: false,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: [
        '依赖关系复杂',
        'API 差异巨大',
        '缺乏文档',
        '团队认知不一致',
        '无 AI 上下文',
        '回归测试成本高'
      ],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: ink,
        fontFamily: 'Bricolage, sans-serif',
        fontSize: 13
      }
    },
    series: [{
      type: 'bar',
      data: [9.2, 8.7, 8.3, 7.5, 7.1, 6.4],
      barWidth: 18,
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: function(params) {
          var palette = [accent, accent2, accent3, accent, accent2, muted];
          return palette[params.dataIndex];
        }
      },
      label: {
        show: true,
        position: 'right',
        color: ink,
        fontFamily: 'GeistMono, monospace',
        fontSize: 12,
        fontWeight: 600,
        formatter: '{c}'
      }
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });

  // ============== Chart 3: 不同迁移路径工作量分布（雷达图） ==============
  var chart3 = echarts.init(document.getElementById('chart-paths'), null, { renderer: 'svg' });
  chart3.setOption({
    backgroundColor: 'transparent',
    textStyle: baseTextStyle,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'Bricolage, sans-serif' }
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: inkSoft, fontFamily: 'Bricolage, sans-serif', fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
      icon: 'roundRect'
    },
    radar: {
      center: ['50%', '48%'],
      radius: '62%',
      indicator: [
        { name: '代码改动', max: 100 },
        { name: 'API 适配', max: 100 },
        { name: '测试回归', max: 100 },
        { name: '文档更新', max: 100 },
        { name: '团队培训', max: 100 }
      ],
      axisName: {
        color: inkSoft,
        fontFamily: 'Bricolage, sans-serif',
        fontSize: 12
      },
      splitLine: { lineStyle: { color: rule } },
      splitArea: {
        areaStyle: {
          color: ['rgba(20,23,31,0.4)', 'rgba(20,23,31,0.2)'],
          shadowBlur: 0
        }
      },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 6,
      emphasis: { focus: 'series' },
      data: [
        {
          name: 'H5 → 小程序',
          value: [85, 90, 75, 60, 70],
          itemStyle: { color: accent },
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.18 }
        },
        {
          name: '框架升级',
          value: [80, 75, 85, 70, 50],
          itemStyle: { color: accent2 },
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.18 }
        },
        {
          name: 'Web → 移动端',
          value: [90, 70, 80, 65, 80],
          itemStyle: { color: accent3 },
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.18 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chart3.resize(); });

  // ============== Chart 4: 引入迁移助手前后的时间对比（分组条形图） ==============
  var chart4 = echarts.init(document.getElementById('chart-roi'), null, { renderer: 'svg' });
  chart4.setOption({
    backgroundColor: 'transparent',
    color: [danger, accent2],
    textStyle: baseTextStyle,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: bg3,
      borderColor: rule,
      textStyle: { color: ink, fontFamily: 'Bricolage, sans-serif' },
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        var html = '<div style="font-weight:600;margin-bottom:4px">' + params[0].name + '</div>';
        params.forEach(function(p) {
          html += '<div>' + p.markerName + '：' + p.value + ' 天</div>';
        });
        return html;
      }
    },
    legend: {
      top: 4,
      right: 0,
      data: ['传统流程', '使用 AI 迁移助手'],
      textStyle: { color: inkSoft, fontFamily: 'Bricolage, sans-serif', fontSize: 13 },
      itemWidth: 12,
      itemHeight: 12,
      icon: 'roundRect'
    },
    grid: { left: 16, right: 32, top: 44, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['前期分析', '实际编码', '测试回归', '总计'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: {
        color: ink,
        fontFamily: 'Bricolage, sans-serif',
        fontSize: 13
      }
    },
    yAxis: {
      type: 'value',
      name: '天',
      nameTextStyle: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted, fontFamily: 'GeistMono, monospace', fontSize: 11 }
    },
    series: [
      {
        name: '传统流程',
        type: 'bar',
        barGap: '15%',
        barWidth: 28,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: [7, 14, 5, 26],
        label: {
          show: true,
          position: 'top',
          color: ink,
          fontFamily: 'GeistMono, monospace',
          fontSize: 12,
          fontWeight: 600
        }
      },
      {
        name: '使用 AI 迁移助手',
        type: 'bar',
        barWidth: 28,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: [0.5, 6, 2, 8.5],
        label: {
          show: true,
          position: 'top',
          color: ink,
          fontFamily: 'GeistMono, monospace',
          fontSize: 12,
          fontWeight: 600
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chart4.resize(); });

})();
