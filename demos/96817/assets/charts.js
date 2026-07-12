// ============================================
// Cube Realm GDD - ECharts 图表
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  // ---------- 通用配色 ----------
  var NEON_CYAN = '#00d4ff';
  var NEON_PINK = '#ff6b9d';
  var NEON_GREEN = '#00ff88';
  var NEON_YELLOW = '#ffd700';
  var NEON_PURPLE = '#b44dff';
  var NEON_ORANGE = '#ff8c42';
  var BG_DARK = '#0a0e1a';
  var GRID_COLOR = '#1e2740';
  var TEXT_COLOR = '#6b7394';

  // ========== 4.3 难度曲线图 ==========
  var chart43 = echarts.init(document.getElementById('chart-difficulty-curve'));
  chart43.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#141b2d',
      borderColor: NEON_CYAN,
      textStyle: { color: '#e8eaf0', fontFamily: 'JetBrainsMono' }
    },
    legend: {
      data: ['步数复杂度', '弹幕密度', '步数上限'],
      textStyle: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono', fontSize: 12 },
      top: 10
    },
    grid: { left: 60, right: 40, top: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['房间1\n白色荒原', '房间2\n绿色密林', '房间3\n蓝色水域', '房间4\n红色熔心', '房间5\n黄昏丘陵', '房间6\n紫色深渊', '房间7\n金色圣殿', 'Boss\n原初核心'],
      axisLabel: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono', fontSize: 10, interval: 0 },
      axisLine: { lineStyle: { color: GRID_COLOR } },
      splitLine: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '步数',
        nameTextStyle: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono' },
        axisLabel: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono' },
        axisLine: { lineStyle: { color: GRID_COLOR } },
        splitLine: { lineStyle: { color: GRID_COLOR, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '弹幕密度(颗/波)',
        nameTextStyle: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono' },
        axisLabel: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono' },
        axisLine: { lineStyle: { color: GRID_COLOR } },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '步数复杂度',
        type: 'line',
        yAxisIndex: 0,
        data: [4, 6, 10, 12, 14, 16, 20, 25],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: NEON_CYAN, width: 3 },
        itemStyle: { color: NEON_CYAN },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,212,255,0.3)' },
            { offset: 1, color: 'rgba(0,212,255,0.02)' }
          ])
        }
      },
      {
        name: '弹幕密度',
        type: 'line',
        yAxisIndex: 1,
        data: [5, 8, 12, 16, 22, 28, 35, 50],
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: { color: NEON_PINK, width: 3 },
        itemStyle: { color: NEON_PINK },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,107,157,0.25)' },
            { offset: 1, color: 'rgba(255,107,157,0.02)' }
          ])
        }
      },
      {
        name: '步数上限',
        type: 'line',
        yAxisIndex: 0,
        data: [20, 25, 30, 30, 35, 40, 50, 60],
        smooth: false,
        symbol: 'triangle',
        symbolSize: 8,
        lineStyle: { color: NEON_YELLOW, width: 2, type: 'dashed' },
        itemStyle: { color: NEON_YELLOW }
      }
    ]
  });

  // ========== 11.1 属性成长雷达图（备选展示） ==========
  var chartAttr = echarts.init(document.getElementById('chart-attr-growth'));
  chartAttr.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#141b2d',
      borderColor: NEON_CYAN,
      textStyle: { color: '#e8eaf0', fontFamily: 'JetBrainsMono' }
    },
    radar: {
      indicator: [
        { name: 'HP', max: 200 },
        { name: 'MP', max: 150 },
        { name: 'SPD', max: 10 },
        { name: 'INT', max: 10 }
      ],
      axisName: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono', fontSize: 12 },
      splitArea: { areaStyle: { color: ['rgba(30,39,64,0.3)', 'rgba(30,39,64,0.1)'] } },
      splitLine: { lineStyle: { color: GRID_COLOR } },
      axisLine: { lineStyle: { color: GRID_COLOR } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [100, 50, 3, 1],
          name: '初始状态',
          lineStyle: { color: NEON_CYAN, width: 2 },
          itemStyle: { color: NEON_CYAN },
          areaStyle: { color: 'rgba(0,212,255,0.15)' }
        },
        {
          value: [160, 120, 5, 5],
          name: '满级状态',
          lineStyle: { color: NEON_PINK, width: 2 },
          itemStyle: { color: NEON_PINK },
          areaStyle: { color: 'rgba(255,107,157,0.15)' }
        }
      ]
    }],
    legend: {
      data: ['初始状态', '满级状态'],
      bottom: 5,
      textStyle: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono', fontSize: 11 }
    }
  });

  // ========== 弹幕模式对比柱状图 ==========
  var chartBullet = echarts.init(document.getElementById('chart-bullet-patterns'));
  chartBullet.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#141b2d',
      borderColor: NEON_CYAN,
      textStyle: { color: '#e8eaf0', fontFamily: 'JetBrainsMono' }
    },
    legend: {
      data: ['弹幕数量', '速度(px/f)', '危险等级'],
      textStyle: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono', fontSize: 11 },
      top: 5
    },
    grid: { left: 60, right: 40, top: 50, bottom: 35 },
    xAxis: {
      type: 'category',
      data: ['直线扫射', '扇形散射', '螺旋弹幕', '追踪弹', '墙壁生成'],
      axisLabel: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono', fontSize: 11 },
      axisLine: { lineStyle: { color: GRID_COLOR } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: TEXT_COLOR, fontFamily: 'JetBrainsMono' },
      axisLine: { lineStyle: { color: GRID_COLOR } },
      splitLine: { lineStyle: { color: GRID_COLOR, type: 'dashed' } }
    },
    series: [
      {
        name: '弹幕数量',
        type: 'bar',
        data: [8, 12, 20, 3, 15],
        itemStyle: { color: NEON_CYAN, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '速度(px/f)',
        type: 'bar',
        data: [4, 3, 2, 2.5, 0],
        itemStyle: { color: NEON_GREEN, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '危险等级',
        type: 'bar',
        data: [2, 3, 4, 5, 3],
        itemStyle: { color: NEON_PINK, borderRadius: [4, 4, 0, 0] }
      }
    ]
  });

  // ========== 道具效果对比图 ==========
  var chartItems = echarts.init(document.getElementById('chart-item-effects'));
  chartItems.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#141b2d',
      borderColor: NEON_CYAN,
      textStyle: { color: '#e8eaf0', fontFamily: 'JetBrainsMono' }
    },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: BG_DARK, borderWidth: 2 },
      label: {
        color: TEXT_COLOR,
        fontFamily: 'JetBrainsMono',
        fontSize: 11,
        formatter: '{b}\n{d}%'
      },
      labelLine: { lineStyle: { color: TEXT_COLOR } },
      data: [
        { value: 3, name: 'HP回复药水', itemStyle: { color: NEON_GREEN } },
        { value: 3, name: 'MP回复药水', itemStyle: { color: NEON_CYAN } },
        { value: 3, name: '净化水晶', itemStyle: { color: NEON_PURPLE } },
        { value: 2, name: '疾风之靴', itemStyle: { color: NEON_YELLOW } },
        { value: 2, name: '贤者护符', itemStyle: { color: NEON_PINK } },
        { value: 2, name: '魔方之心', itemStyle: { color: NEON_ORANGE } }
      ]
    }]
  });

  // ========== 响应式 ==========
  window.addEventListener('resize', function () {
    chart43.resize();
    chartAttr.resize();
    chartBullet.resize();
    chartItems.resize();
  });
});
