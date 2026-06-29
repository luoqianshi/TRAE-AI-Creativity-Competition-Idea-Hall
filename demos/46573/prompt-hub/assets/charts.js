// 学语 Prompt Hub - ECharts 图表配置
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#3B5BFE';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#8B5CF6';
  var accent3 = style.getPropertyValue('--accent3').trim() || '#10B981';
  var ink = style.getPropertyValue('--ink').trim() || '#0F172A';
  var muted = style.getPropertyValue('--muted').trim() || '#64748B';
  var rule = style.getPropertyValue('--rule').trim() || '#E2E8F0';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#FFFFFF';

  // 通用字体配置
  var fontFamily = "'Outfit', 'PingFang SC', 'Microsoft YaHei', sans-serif";

  // ============ 图表 1: 8 大学习场景优先级 ============
  var chartScenarios = echarts.init(document.getElementById('chart-scenarios'), null, { renderer: 'svg' });
  chartScenarios.setOption({
    color: [accent, accent2, muted],
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}% ({d}%)',
      backgroundColor: '#FFFFFF',
      borderColor: rule,
      textStyle: { color: ink, fontFamily: fontFamily, fontSize: 13 }
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: muted, fontFamily: fontFamily, fontSize: 12 }
    },
    series: [{
      name: '场景优先级',
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 3 },
      label: {
        show: true,
        formatter: '{b}\n{c}%',
        fontFamily: fontFamily,
        fontSize: 11,
        color: ink,
        lineHeight: 16
      },
      labelLine: { length: 12, length2: 8 },
      data: [
        { value: 35, name: '论文写作 (P0)' },
        { value: 25, name: '作业答疑 (P0)' },
        { value: 20, name: '备考刷题 (P0)' },
        { value: 10, name: '英语学习 (P1)' },
        { value: 6, name: '求职准备 (P1)' },
        { value: 4, name: '其他场景 (P2)' }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartScenarios.resize(); });

  // ============ 图表 2: 效率提升对比 ============
  var chartEfficiency = echarts.init(document.getElementById('chart-efficiency'), null, { renderer: 'svg' });
  chartEfficiency.setOption({
    color: [muted, accent],
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: '#FFFFFF',
      borderColor: rule,
      textStyle: { color: ink, fontFamily: fontFamily, fontSize: 13 }
    },
    legend: {
      data: ['使用前 (分钟)', '使用后 (分钟)'],
      bottom: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: muted, fontFamily: fontFamily, fontSize: 12 }
    },
    grid: { top: 30, left: 50, right: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: ['论文润色', '错题分析', '模拟面试', '代码 Debug', '英语口语', '求职简历'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontFamily: fontFamily, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '耗时 (分钟)',
      nameTextStyle: { color: muted, fontSize: 11, fontFamily: fontFamily },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontFamily: fontFamily, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '使用前 (分钟)',
        type: 'bar',
        data: [30, 25, 45, 40, 30, 35],
        barWidth: 18,
        itemStyle: { color: muted, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '使用后 (分钟)',
        type: 'bar',
        data: [5, 4, 8, 6, 5, 6],
        barWidth: 18,
        itemStyle: {
          color: accent,
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '节省 {c}min',
          color: accent,
          fontWeight: 600,
          fontSize: 10,
          fontFamily: fontFamily
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartEfficiency.resize(); });

  // ============ 图表 3: MVP 功能价值分布 ============
  var chartMvpValue = echarts.init(document.getElementById('chart-mvp-value'), null, { renderer: 'svg' });
  chartMvpValue.setOption({
    color: [accent],
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: '#FFFFFF',
      borderColor: rule,
      textStyle: { color: ink, fontFamily: fontFamily, fontSize: 13 },
      formatter: '{b}<br/>用户价值评分: <strong>{c}</strong>/10'
    },
    grid: { top: 20, left: 130, right: 50, bottom: 30 },
    xAxis: {
      type: 'value',
      max: 10,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontFamily: fontFamily, fontSize: 11 },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['一键复制提示词', '关键词搜索', '提示词详情页', '首页/分类页', '个人收藏夹', '响应式设计'],
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
      axisLabel: { color: ink, fontFamily: fontFamily, fontSize: 12 }
    },
    series: [{
      name: '用户价值',
      type: 'bar',
      data: [9.5, 9.2, 8.8, 8.5, 7.5, 7.0],
      barWidth: 18,
      itemStyle: {
        color: function(params) {
          var colors = [accent, accent, accent2, accent2, accent3, accent3];
          return colors[params.dataIndex] || accent;
        },
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}',
        color: ink,
        fontWeight: 600,
        fontSize: 11,
        fontFamily: fontFamily
      }
    }]
  });
  window.addEventListener('resize', function() { chartMvpValue.resize(); });

  // ============ 图表 4: 技术栈雷达图 ============
  var chartTech = echarts.init(document.getElementById('chart-tech'), null, { renderer: 'svg' });
  chartTech.setOption({
    color: [accent, accent2],
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: '#FFFFFF',
      borderColor: rule,
      textStyle: { color: ink, fontFamily: fontFamily, fontSize: 13 }
    },
    legend: {
      data: ['本项目技术栈', '传统全栈方案'],
      bottom: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: muted, fontFamily: fontFamily, fontSize: 12 }
    },
    radar: {
      indicator: [
        { name: '开发速度', max: 100 },
        { name: '学习成本', max: 100 },
        { name: '部署便捷', max: 100 },
        { name: '可维护性', max: 100 },
        { name: '扩展能力', max: 100 },
        { name: '成本控制', max: 100 }
      ],
      center: ['50%', '50%'],
      radius: '65%',
      splitNumber: 4,
      axisName: { color: ink, fontFamily: fontFamily, fontSize: 12, fontWeight: 600 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: ['rgba(238, 242, 255, 0.3)', 'rgba(238, 242, 255, 0.6)'] } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: '本项目技术栈',
          value: [95, 90, 95, 85, 80, 95],
          areaStyle: { color: 'rgba(59, 91, 254, 0.25)' },
          lineStyle: { color: accent, width: 2 }
        },
        {
          name: '传统全栈方案',
          value: [60, 50, 50, 80, 90, 60],
          areaStyle: { color: 'rgba(139, 92, 246, 0.15)' },
          lineStyle: { color: accent2, width: 2 }
        }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartTech.resize(); });

})();
