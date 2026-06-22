/**
 * DIY装机大师 - ECharts 图表逻辑
 * 包含：技术能力雷达图、开发时间线甘特图
 */
(function () {
  'use strict';

  // ===== 从 CSS 变量读取颜色 =====
  function getCSSVar(name) {
    var style = getComputedStyle(document.documentElement);
    return style.getPropertyValue(name).trim();
  }

  var ACCENT = getCSSVar('--accent') || '#6366f1';
  var ACCENT2 = getCSSVar('--accent2') || '#06b6d4';
  var BG = getCSSVar('--bg') || '#0a0e1a';
  var SURFACE = getCSSVar('--surface') || '#131a2e';
  var TEXT = getCSSVar('--text') || '#e8edf5';
  var TEXT_MUTED = getCSSVar('--text-muted') || '#7a8ba8';
  var BORDER = getCSSVar('--border') || '#1e2d4a';

  // ===== 工具函数 =====
  function initChart(domId) {
    var dom = document.getElementById(domId);
    if (!dom || typeof echarts === 'undefined') return null;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    return chart;
  }

  function addResizeListener(chart) {
    if (!chart) return;
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        chart.resize();
      }, 150);
    });
  }

  // ===== 1. 技术能力雷达图 =====
  function createRadarChart() {
    var chart = initChart('chart-radar');
    if (!chart) return;

    var indicators = [
      { name: '前端开发', max: 100 },
      { name: '3D渲染', max: 100 },
      { name: '状态管理', max: 100 },
      { name: 'UI设计', max: 100 },
      { name: '兼容逻辑', max: 100 },
      { name: '性能优化', max: 100 }
    ];

    var values = [92, 88, 85, 90, 82, 87];

    var option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(19, 26, 46, 0.9)',
        borderColor: BORDER,
        borderWidth: 1,
        textStyle: {
          color: TEXT,
          fontFamily: 'Outfit, sans-serif'
        },
        formatter: function (params) {
          var data = params.data;
          var result = '<div style="font-weight:600;margin-bottom:8px;">技术能力总览</div>';
          for (var i = 0; i < indicators.length; i++) {
            result += '<div style="display:flex;justify-content:space-between;gap:24px;margin:4px 0;">'
              + '<span style="color:' + TEXT_MUTED + ';">' + indicators[i].name + '</span>'
              + '<span style="color:' + ACCENT + ';font-weight:600;">' + data.value[i] + '</span>'
              + '</div>';
          }
          return result;
        }
      },
      radar: {
        indicator: indicators,
        shape: 'polygon',
        radius: '68%',
        center: ['50%', '50%'],
        axisName: {
          color: TEXT_MUTED,
          fontSize: 12,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500,
          padding: [0, 0, 0, 0]
        },
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            color: BORDER,
            width: 1
          }
        },
        splitLine: {
          lineStyle: {
            color: BORDER,
            width: 1
          }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: [
              'rgba(99, 102, 241, 0.02)',
              'rgba(99, 102, 241, 0.04)',
              'rgba(99, 102, 241, 0.06)',
              'rgba(99, 102, 241, 0.08)'
            ]
          }
        }
      },
      series: [
        {
          type: 'radar',
          symbol: 'circle',
          symbolSize: 6,
          data: [
            {
              value: values,
              name: '技术能力',
              lineStyle: {
                width: 2,
                color: ACCENT
              },
              itemStyle: {
                color: ACCENT,
                borderColor: ACCENT,
                borderWidth: 2
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(99, 102, 241, 0.35)' },
                    { offset: 1, color: 'rgba(6, 182, 212, 0.15)' }
                  ]
                }
              }
            }
          ]
        }
      ]
    };

    chart.setOption(option);
    addResizeListener(chart);
  }

  // ===== 2. 开发时间线（横向柱状图模拟甘特图） =====
  function createTimelineChart() {
    var chart = initChart('chart-timeline');
    if (!chart) return;

    var phases = ['优化迭代', '功能开发', '框架搭建', '技术选型', '需求分析'];
    var durations = [1, 2, 1, 0.5, 1];
    var starts = [3.5, 1.5, 0.5, 0, 0];

    // 计算颜色渐变
    var barColors = [];
    for (var i = 0; i < phases.length; i++) {
      var ratio = i / (phases.length - 1);
      barColors.push({
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: ACCENT },
          { offset: 1, color: ACCENT2 }
        ]
      });
    }

    var option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(19, 26, 46, 0.9)',
        borderColor: BORDER,
        borderWidth: 1,
        textStyle: {
          color: TEXT,
          fontFamily: 'Outfit, sans-serif'
        },
        formatter: function (params) {
          var data = params[0];
          return '<div style="font-weight:600;">' + data.name + '</div>'
            + '<div style="color:' + TEXT_MUTED + ';margin-top:4px;">耗时: '
            + '<span style="color:' + ACCENT + ';font-weight:600;">' + data.value + ' 天</span></div>';
        }
      },
      grid: {
        left: '12%',
        right: '8%',
        top: '8%',
        bottom: '12%'
      },
      xAxis: {
        type: 'value',
        max: 5.5,
        name: '天数',
        nameTextStyle: {
          color: TEXT_MUTED,
          fontSize: 11,
          fontFamily: 'Outfit, sans-serif'
        },
        axisLine: {
          lineStyle: {
            color: BORDER
          }
        },
        axisTick: {
          lineStyle: {
            color: BORDER
          }
        },
        axisLabel: {
          color: TEXT_MUTED,
          fontSize: 11,
          fontFamily: 'Outfit, sans-serif',
          formatter: function (val) {
            return val % 1 === 0 ? val : '';
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(30, 45, 74, 0.5)',
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: phases,
        axisLine: {
          lineStyle: {
            color: BORDER
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: TEXT_MUTED,
          fontSize: 12,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: '45%',
          data: durations.map(function (val, idx) {
            return {
              value: val,
              itemStyle: {
                color: barColors[idx],
                borderRadius: [0, 6, 6, 0],
                shadowColor: 'rgba(99, 102, 241, 0.3)',
                shadowBlur: 12
              }
            };
          }),
          label: {
            show: true,
            position: 'right',
            color: TEXT_MUTED,
            fontSize: 11,
            fontFamily: 'Outfit, sans-serif',
            formatter: function (params) {
              return params.value + '天';
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(99, 102, 241, 0.5)'
            }
          }
        }
      ]
    };

    chart.setOption(option);
    addResizeListener(chart);
  }

  // ===== 3. 开发历程甘特图 =====
  function createGanttChart() {
    var chart = initChart('chart-gantt');
    if (!chart) return;

    var phases = ['优化迭代', '功能开发', '框架搭建', '技术选型', '需求分析'];
    var durations = [1, 2, 1, 0.5, 1];
    var starts = [3.5, 1.5, 0.5, 0, 0];

    var option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(19, 26, 46, 0.9)',
        borderColor: BORDER,
        borderWidth: 1,
        textStyle: {
          color: TEXT,
          fontFamily: 'Outfit, sans-serif'
        },
        formatter: function (params) {
          var data = params[0];
          var idx = data.dataIndex;
          return '<div style="font-weight:600;">' + phases[idx] + '</div>'
            + '<div style="color:' + TEXT_MUTED + ';margin-top:4px;">'
            + '起始: 第' + starts[idx] + '天 | 耗时: '
            + '<span style="color:' + ACCENT + ';font-weight:600;">' + durations[idx] + ' 天</span></div>';
        }
      },
      grid: {
        left: '12%',
        right: '8%',
        top: '8%',
        bottom: '12%'
      },
      xAxis: {
        type: 'value',
        max: 5.5,
        name: '天数',
        nameTextStyle: {
          color: TEXT_MUTED,
          fontSize: 11,
          fontFamily: 'Outfit, sans-serif'
        },
        axisLine: {
          lineStyle: {
            color: BORDER
          }
        },
        axisTick: {
          lineStyle: {
            color: BORDER
          }
        },
        axisLabel: {
          color: TEXT_MUTED,
          fontSize: 11,
          fontFamily: 'Outfit, sans-serif',
          formatter: function (val) {
            return val % 1 === 0 ? 'Day ' + val : '';
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(30, 45, 74, 0.5)',
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: phases,
        axisLine: {
          lineStyle: {
            color: BORDER
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: TEXT_MUTED,
          fontSize: 12,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: '50%',
          stack: 'total',
          data: starts.map(function (val, idx) {
            return {
              value: val,
              itemStyle: {
                color: 'transparent'
              },
              label: { show: false }
            };
          })
        },
        {
          type: 'bar',
          barWidth: '50%',
          stack: 'total',
          data: durations.map(function (val, idx) {
            var ratio = idx / (phases.length - 1);
            var r1 = parseInt(ACCENT.slice(1, 3), 16);
            var g1 = parseInt(ACCENT.slice(3, 5), 16);
            var b1 = parseInt(ACCENT.slice(5, 7), 16);
            var r2 = parseInt(ACCENT2.slice(1, 3), 16);
            var g2 = parseInt(ACCENT2.slice(3, 5), 16);
            var b2 = parseInt(ACCENT2.slice(5, 7), 16);
            var r = Math.round(r1 + (r2 - r1) * ratio);
            var g = Math.round(g1 + (g2 - g1) * ratio);
            var b = Math.round(b1 + (b2 - b1) * ratio);
            var color = 'rgb(' + r + ',' + g + ',' + b + ')';

            return {
              value: val,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    { offset: 0, color: color },
                    { offset: 1, color: ACCENT2 }
                  ]
                },
                borderRadius: [0, 6, 6, 0],
                shadowColor: 'rgba(99, 102, 241, 0.25)',
                shadowBlur: 10
              },
              label: {
                show: true,
                position: 'right',
                color: TEXT_MUTED,
                fontSize: 11,
                fontFamily: 'Outfit, sans-serif',
                formatter: function (params) {
                  return params.value + '天';
                }
              }
            };
          }),
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(99, 102, 241, 0.5)'
            }
          }
        }
      ]
    };

    chart.setOption(option);
    addResizeListener(chart);
  }

  // ===== 初始化所有图表 =====
  function init() {
    createRadarChart();
    createTimelineChart();
    createGanttChart();
  }

  // DOM Ready 后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
