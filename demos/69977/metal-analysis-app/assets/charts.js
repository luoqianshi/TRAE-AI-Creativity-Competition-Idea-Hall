(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var success = style.getPropertyValue('--success').trim();
  var danger = style.getPropertyValue('--danger').trim();

  // --- Chart: Algorithm Comparison (Radar) ---
  var chartAlgo = echarts.init(document.getElementById('chart-algo'), null, { renderer: 'svg' });
  chartAlgo.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    legend: {
      data: ['XGBoost', '随机森林', 'SVR', 'MLP', '线性回归'],
      textStyle: { color: muted },
      bottom: 0
    },
    radar: {
      indicator: [
        { name: '预测精度', max: 100 },
        { name: '训练效率', max: 100 },
        { name: '可解释性', max: 100 },
        { name: '多目标支持', max: 100 },
        { name: '小样本适应', max: 100 },
        { name: '鲁棒性', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: [96, 88, 72, 94, 85, 90], name: 'XGBoost', itemStyle: { color: accent }, areaStyle: { color: accent + '33' } },
        { value: [92, 82, 68, 88, 80, 86], name: '随机森林', itemStyle: { color: accent2 }, areaStyle: { color: accent2 + '33' } },
        { value: [87, 75, 55, 78, 70, 82], name: 'SVR', itemStyle: { color: success }, areaStyle: { color: success + '33' } },
        { value: [83, 65, 40, 85, 60, 75], name: 'MLP', itemStyle: { color: muted }, areaStyle: { color: muted + '33' } },
        { value: [71, 95, 90, 50, 55, 60], name: '线性回归', itemStyle: { color: danger }, areaStyle: { color: danger + '33' } }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartAlgo.resize(); });

  // --- Chart: Composition-Performance Heatmap ---
  var chartHeat = echarts.init(document.getElementById('chart-heatmap'), null, { renderer: 'svg' });
  var crData = ['11.0%', '11.5%', '12.0%', '12.5%', '13.0%', '13.5%', '14.0%'];
  var niData = ['1.0%', '1.5%', '2.0%', '2.5%', '3.0%', '3.5%'];
  var heatData = [
    [0,0,720],[0,1,750],[0,2,780],[0,3,810],[0,4,800],[0,5,790],
    [1,0,740],[1,1,770],[1,2,805],[1,3,830],[1,4,825],[1,5,815],
    [2,0,765],[2,1,795],[2,2,835],[2,3,860],[2,4,855],[2,5,840],
    [3,0,790],[3,1,820],[3,2,860],[3,3,890],[3,4,885],[3,5,870],
    [4,0,815],[4,1,845],[4,2,880],[4,3,910],[4,4,905],[4,5,890],
    [5,0,830],[5,1,860],[5,2,895],[5,3,920],[5,4,915],[5,5,900],
    [6,0,845],[6,1,870],[6,2,905],[6,3,930],[6,4,925],[6,5,910]
  ];

  chartHeat.setOption({
    animation: false,
    tooltip: {
      position: 'top',
      appendToBody: true,
      formatter: function(p) {
        return 'Cr: ' + crData[p.value[0]] + '<br>Ni: ' + niData[p.value[1]] + '<br>抗拉强度: ' + p.value[2] + ' MPa';
      }
    },
    grid: { top: 30, bottom: 60, left: 70, right: 30 },
    xAxis: {
      type: 'category',
      data: crData,
      name: 'Cr (铬)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitArea: { show: false }
    },
    yAxis: {
      type: 'category',
      data: niData,
      name: 'Ni (镍)',
      axisLabel: { color: muted },
      axisLine: { lineStyle: { color: rule } },
      splitArea: { show: false }
    },
    visualMap: {
      min: 700,
      max: 940,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: { color: muted },
      inRange: { color: [bg2, accent, accent2] },
      outOfRange: { color: 'transparent' }
    },
    series: [{
      type: 'heatmap',
      data: heatData,
      label: {
        show: true,
        formatter: function(p) { return p.value[2]; },
        color: ink,
        fontSize: 11
      },
      itemStyle: { borderColor: rule, borderWidth: 1 }
    }]
  });
  window.addEventListener('resize', function() { chartHeat.resize(); });

  // --- Chart: Architecture Sankey ---
  var chartArch = echarts.init(document.getElementById('chart-arch'), null, { renderer: 'svg' });
  chartArch.setOption({
    animation: false,
    tooltip: { trigger: 'item', triggerOn: 'mousemove', appendToBody: true },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      label: { color: ink, fontSize: 12 },
      lineStyle: { color: 'source', curveness: 0.5, opacity: 0.3 },
      itemStyle: { borderWidth: 0 },
      data: [
        { name: '原料数据', itemStyle: { color: muted } },
        { name: '工艺参数', itemStyle: { color: muted } },
        { name: '性能指标', itemStyle: { color: muted } },
        { name: '数据上传', itemStyle: { color: accent } },
        { name: '清洗预处理', itemStyle: { color: accent } },
        { name: '特征工程', itemStyle: { color: accent } },
        { name: '算法引擎', itemStyle: { color: accent2 } },
        { name: '模型训练', itemStyle: { color: accent2 } },
        { name: '预测分析', itemStyle: { color: accent2 } },
        { name: '成分预测', itemStyle: { color: success } },
        { name: '调整建议', itemStyle: { color: success } },
        { name: '可视化', itemStyle: { color: success } },
        { name: '用户决策', itemStyle: { color: ink } }
      ],
      links: [
        { source: '原料数据', target: '数据上传', value: 5 },
        { source: '工艺参数', target: '数据上传', value: 5 },
        { source: '性能指标', target: '数据上传', value: 5 },
        { source: '数据上传', target: '清洗预处理', value: 15 },
        { source: '清洗预处理', target: '特征工程', value: 15 },
        { source: '特征工程', target: '算法引擎', value: 15 },
        { source: '算法引擎', target: '模型训练', value: 8 },
        { source: '算法引擎', target: '预测分析', value: 7 },
        { source: '模型训练', target: '预测分析', value: 8 },
        { source: '预测分析', target: '成分预测', value: 6 },
        { source: '预测分析', target: '调整建议', value: 5 },
        { source: '预测分析', target: '可视化', value: 4 },
        { source: '成分预测', target: '用户决策', value: 6 },
        { source: '调整建议', target: '用户决策', value: 5 },
        { source: '可视化', target: '用户决策', value: 4 }
      ]
    }]
  });
  window.addEventListener('resize', function() { chartArch.resize(); });

})();
