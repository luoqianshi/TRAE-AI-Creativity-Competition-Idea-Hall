/* ECharts 图表初始化逻辑 - 明眸 AI 视觉辅助系统 */
;(function () {
  'use strict';

  /* ---------- 工具函数 ---------- */
  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  var C = {
    bg:      getCSSVar('--bg')      || '#0D1117',
    bg2:     getCSSVar('--bg2')     || '#161B22',
    ink:     getCSSVar('--ink')     || '#E6EDF3',
    muted:   getCSSVar('--muted')   || '#8B949E',
    rule:    getCSSVar('--rule')    || '#30363D',
    accent:  getCSSVar('--accent')  || '#1A73E8',
    accent2: getCSSVar('--accent2') || '#34A853',
    warn:    getCSSVar('--warn')    || '#FBBC05'
  };

  /* 通用 tooltip 样式 */
  var tooltipStyle = {
    backgroundColor: C.bg2,
    borderColor: C.rule,
    textStyle: { color: C.ink, fontSize: 13 }
  };

  /* 通用配置 */
  var baseOpt = {
    animation: false,
    renderer: 'svg',
    textStyle: { fontFamily: '-apple-system, "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif', color: C.ink },
    tooltip: tooltipStyle
  };

  /* ---------- Section 2: 视障群体构成饼图 ---------- */
  function initPieChart() {
    var dom = document.getElementById('chart-pie');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    var option = Object.assign({}, baseOpt, {
      title: {
        text: '中国视障群体构成',
        left: 'center',
        top: 10,
        textStyle: { color: C.ink, fontSize: 16, fontWeight: 600 }
      },
      legend: {
        bottom: 10,
        textStyle: { color: C.muted },
        itemWidth: 14,
        itemHeight: 14
      },
      series: [{
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: C.bg,
          borderWidth: 2
        },
        label: {
          show: true,
          color: C.ink,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' }
        },
        data: [
          { value: 500, name: '全盲', itemStyle: { color: '#E74C3C' } },
          { value: 800, name: '低视力', itemStyle: { color: C.accent } },
          { value: 400, name: '老年退化', itemStyle: { color: C.warn } }
        ]
      }]
    });
    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- Section 2: 日常活动困难评分柱状图 ---------- */
  function initBarDiffChart() {
    var dom = document.getElementById('chart-bar-diff');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    var categories = ['出行', '阅读', '购物', '社交', '就医'];
    var values = [9.2, 8.7, 8.1, 7.8, 7.5];
    var option = Object.assign({}, baseOpt, {
      title: {
        text: '视障者日常活动困难评分（满分10）',
        left: 'center',
        top: 10,
        textStyle: { color: C.ink, fontSize: 16, fontWeight: 600 }
      },
      grid: { left: 60, right: 30, top: 60, bottom: 40 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: C.rule } },
        axisLabel: { color: C.muted },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 10,
        splitLine: { lineStyle: { color: C.rule, type: 'dashed' } },
        axisLine: { show: false },
        axisLabel: { color: C.muted }
      },
      series: [{
        type: 'bar',
        barWidth: 36,
        data: values.map(function (v, i) {
          var colors = ['#E74C3C', '#F39C12', '#E67E22', '#D35400', '#C0392B'];
          return {
            value: v,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colors[i] },
                { offset: 1, color: colors[i] + '66' }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          };
        }),
        label: {
          show: true,
          position: 'top',
          color: C.ink,
          fontWeight: 600,
          formatter: '{c}'
        }
      }]
    });
    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- Section 6: AI模型对比雷达图 ---------- */
  function initRadarChart() {
    var dom = document.getElementById('chart-radar');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    var indicators = [
      { name: '推理速度', max: 100 },
      { name: '检测精度', max: 100 },
      { name: '模型大小\n(越小越好)', max: 100 },
      { name: '功耗效率', max: 100 }
    ];
    var option = Object.assign({}, baseOpt, {
      title: {
        text: 'AI 目标检测模型对比',
        left: 'center',
        top: 10,
        textStyle: { color: C.ink, fontSize: 16, fontWeight: 600 }
      },
      legend: {
        bottom: 10,
        textStyle: { color: C.muted },
        itemWidth: 14,
        itemHeight: 14
      },
      radar: {
        indicator: indicators,
        shape: 'circle',
        splitNumber: 4,
        axisName: { color: C.muted, fontSize: 12 },
        splitLine: { lineStyle: { color: C.rule } },
        splitArea: { areaStyle: { color: ['rgba(26,115,232,0.05)', 'rgba(26,115,232,0.1)'] } },
        axisLine: { lineStyle: { color: C.rule } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [85, 92, 75, 80],
            name: 'YOLOv8',
            lineStyle: { color: C.accent },
            areaStyle: { color: 'rgba(26,115,232,0.15)' },
            itemStyle: { color: C.accent }
          },
          {
            value: [90, 95, 70, 85],
            name: 'YOLOv11',
            lineStyle: { color: C.accent2 },
            areaStyle: { color: 'rgba(52,168,83,0.15)' },
            itemStyle: { color: C.accent2 }
          },
          {
            value: [70, 78, 85, 75],
            name: 'SSD',
            lineStyle: { color: C.warn },
            areaStyle: { color: 'rgba(251,188,5,0.15)' },
            itemStyle: { color: C.warn }
          },
          {
            value: [40, 96, 30, 50],
            name: 'Faster R-CNN',
            lineStyle: { color: '#E74C3C' },
            areaStyle: { color: 'rgba(231,76,60,0.15)' },
            itemStyle: { color: '#E74C3C' }
          }
        ]
      }]
    });
    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- Section 6: 端侧推理耗时柱状图 ---------- */
  function initBarInferChart() {
    var dom = document.getElementById('chart-bar-infer');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    var categories = ['障碍物检测', 'OCR', '人脸识别', '语音唤醒', 'TTS'];
    var values = [45, 80, 35, 20, 50];
    var option = Object.assign({}, baseOpt, {
      title: {
        text: '端侧推理耗时（毫秒）',
        left: 'center',
        top: 10,
        textStyle: { color: C.ink, fontSize: 16, fontWeight: 600 }
      },
      grid: { left: 80, right: 30, top: 60, bottom: 40 },
      xAxis: {
        type: 'value',
        name: 'ms',
        nameTextStyle: { color: C.muted },
        splitLine: { lineStyle: { color: C.rule, type: 'dashed' } },
        axisLine: { show: false },
        axisLabel: { color: C.muted }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: C.rule } },
        axisLabel: { color: C.muted },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        barWidth: 24,
        data: values.map(function (v) {
          var clr = v < 50 ? C.accent2 : v < 70 ? C.accent : C.warn;
          return {
            value: v,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: clr },
                { offset: 1, color: clr + '66' }
              ]),
              borderRadius: [0, 4, 4, 0]
            }
          };
        }),
        label: {
          show: true,
          position: 'right',
          color: C.ink,
          formatter: '{c}ms'
        }
      }]
    });
    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- Section 6: 距离估计精度折线图 ---------- */
  function initLineChart() {
    var dom = document.getElementById('chart-line');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    var distances = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var actual = distances.slice();
    var estimated = [1.02, 2.05, 2.9, 4.12, 4.85, 6.2, 6.75, 8.3, 8.9, 10.15];
    var option = Object.assign({}, baseOpt, {
      title: {
        text: '距离估计精度（实际 vs 估计）',
        left: 'center',
        top: 10,
        textStyle: { color: C.ink, fontSize: 16, fontWeight: 600 }
      },
      legend: {
        bottom: 10,
        textStyle: { color: C.muted },
        itemWidth: 14,
        itemHeight: 14
      },
      grid: { left: 50, right: 30, top: 60, bottom: 50 },
      xAxis: {
        type: 'category',
        data: distances.map(function (d) { return d + 'm'; }),
        axisLine: { lineStyle: { color: C.rule } },
        axisLabel: { color: C.muted },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '距离(m)',
        nameTextStyle: { color: C.muted },
        splitLine: { lineStyle: { color: C.rule, type: 'dashed' } },
        axisLine: { show: false },
        axisLabel: { color: C.muted }
      },
      series: [
        {
          name: '实际距离',
          type: 'line',
          data: actual,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: C.accent2, width: 2 },
          itemStyle: { color: C.accent2 }
        },
        {
          name: '估计距离',
          type: 'line',
          data: estimated,
          smooth: true,
          symbol: 'diamond',
          symbolSize: 8,
          lineStyle: { color: C.accent, width: 2 },
          itemStyle: { color: C.accent }
        }
      ]
    });
    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- Section 6: 系统响应延迟仪表盘 ---------- */
  function initGaugeChart() {
    var dom = document.getElementById('chart-gauge');
    if (!dom) return;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    var option = Object.assign({}, baseOpt, {
      title: {
        text: '系统响应延迟',
        left: 'center',
        top: 10,
        textStyle: { color: C.ink, fontSize: 16, fontWeight: 600 }
      },
      series: [{
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '80%',
        min: 0,
        max: 400,
        splitNumber: 4,
        progress: {
          show: true,
          width: 16,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: C.accent2 },
              { offset: 1, color: C.accent }
            ])
          }
        },
        axisLine: {
          lineStyle: {
            width: 16,
            color: [[0.5, C.accent2], [0.75, C.accent], [1, '#E74C3C']]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          distance: 20,
          color: C.muted,
          fontSize: 12,
          formatter: function (v) { return v + 'ms'; }
        },
        pointer: {
          length: '60%',
          width: 6,
          itemStyle: { color: C.ink }
        },
        anchor: {
          show: true,
          size: 12,
          itemStyle: { color: C.ink, borderColor: C.rule, borderWidth: 2 }
        },
        title: {
          offsetCenter: [0, '72%'],
          color: C.muted,
          fontSize: 14
        },
        detail: {
          valueAnimation: false,
          offsetCenter: [0, '45%'],
          fontSize: 32,
          fontWeight: 700,
          color: C.ink,
          formatter: '{value}ms'
        },
        data: [{ value: 185, name: '当前延迟' }]
      }]
    });
    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- 初始化所有图表 ---------- */
  function initAll() {
    initPieChart();
    initBarDiffChart();
    initRadarChart();
    initBarInferChart();
    initLineChart();
    initGaugeChart();
  }

  /* DOM Ready 后初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
