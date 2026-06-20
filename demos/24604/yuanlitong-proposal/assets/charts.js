(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Module Completion ---
  var chartModules = echarts.init(document.getElementById('chart-modules'), null, { renderer: 'svg' });
  chartModules.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['认证鉴权','队伍管理','救援任务','装备管理','培训证书','紧急求助','受灾定位','资源调配','多队协同','物资捐赠','志愿者招募','知识库','消息公告','报表仪表盘','系统管理'], axisLabel: { color: muted, fontSize: 11, rotate: 30 }, axisLine: { lineStyle: { color: rule } } },
    yAxis: { type: 'value', max: 10, axisLabel: { color: muted }, splitLine: { lineStyle: { color: rule, type: 'dashed' } } },
    series: [{
      type: 'bar',
      data: [
        { value: 7, itemStyle: { color: accent } },
        { value: 7, itemStyle: { color: accent } },
        { value: 9, itemStyle: { color: accent } },
        { value: 8, itemStyle: { color: accent } },
        { value: 7, itemStyle: { color: accent } },
        { value: 6, itemStyle: { color: accent } },
        { value: 5, itemStyle: { color: accent } },
        { value: 4, itemStyle: { color: accent2 } },
        { value: 4, itemStyle: { color: accent2 } },
        { value: 4, itemStyle: { color: accent2 } },
        { value: 5, itemStyle: { color: accent2 } },
        { value: 5, itemStyle: { color: accent2 } },
        { value: 6, itemStyle: { color: accent } },
        { value: 9, itemStyle: { color: accent } },
        { value: 7, itemStyle: { color: accent } }
      ],
      barWidth: '60%',
      label: { show: true, position: 'top', color: ink, fontSize: 12 }
    }]
  });
  window.addEventListener('resize', function() { chartModules.resize(); });

  // --- Chart: Tech Stack ---
  var chartTech = echarts.init(document.getElementById('chart-tech'), null, { renderer: 'svg' });
  chartTech.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      itemStyle: { borderRadius: 8, borderColor: bg2, borderWidth: 2 },
      label: { color: ink, fontSize: 13 },
      data: [
        { value: 35, name: '后端服务 (Java/SpringBoot)', itemStyle: { color: accent } },
        { value: 25, name: '管理后台 (Vue3)', itemStyle: { color: accent2 } },
        { value: 25, name: '微信小程序', itemStyle: { color: muted } },
        { value: 15, name: '基础设施 (Docker/CI/CD)', itemStyle: { color: rule.replace('#','').length===6 ? rule : '#cbd5e1' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartTech.resize(); });

  // --- Chart: User Roles ---
  var chartRoles = echarts.init(document.getElementById('chart-roles'), null, { renderer: 'svg' });
  chartRoles.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    radar: {
      indicator: [
        { name: '任务执行', max: 100 },
        { name: '装备管理', max: 100 },
        { name: '人员管理', max: 100 },
        { name: '数据查看', max: 100 },
        { name: '系统配置', max: 100 },
        { name: '求助发布', max: 100 }
      ],
      axisName: { color: muted, fontSize: 12 },
      splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
      axisLine: { lineStyle: { color: rule } },
      splitLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [95, 80, 30, 60, 10, 20], name: '救援队员', itemStyle: { color: accent }, areaStyle: { color: accent + '33' } },
        { value: [70, 90, 85, 80, 40, 50], name: '队伍管理员', itemStyle: { color: accent2 }, areaStyle: { color: accent2 + '33' } },
        { value: [50, 60, 95, 100, 90, 70], name: '平台管理员', itemStyle: { color: muted }, areaStyle: { color: muted + '33' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartRoles.resize(); });
})();
