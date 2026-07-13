(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#4B3FE3';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#27D2BF';
  var ink = style.getPropertyValue('--ink').trim() || '#1A1A2E';
  var muted = style.getPropertyValue('--muted').trim() || '#6B6B80';
  var rule = style.getPropertyValue('--rule').trim() || 'rgba(26,26,46,0.1)';
  var bg2 = style.getPropertyValue('--bg2').trim() || '#F0F0F4';
  var warn = style.getPropertyValue('--warn').trim() || '#EFAA17';

  // --- Radar Chart: 三项目综合能力对比 ---
  var radarDom = document.getElementById('radar-chart');
  if (radarDom && typeof echarts !== 'undefined') {
    var radarChart = echarts.init(radarDom, null, { renderer: 'svg' });

    var radarOption = {
      animation: false,
      tooltip: {
        show: true,
        appendToBody: true,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: rule,
        borderWidth: 1,
        textStyle: {
          color: ink,
          fontSize: 13
        }
      },
      legend: {
        data: ['心晴小屋', '银龄学堂', '古籍智读'],
        bottom: 0,
        textStyle: {
          color: muted,
          fontSize: 13
        },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 24
      },
      radar: {
        indicator: [
          { name: '获奖潜力', max: 100 },
          { name: '实现难度', max: 100 },
          { name: '社会价值', max: 100 },
          { name: '功能完整度', max: 100 },
          { name: '创意独特性', max: 100 },
          { name: '技术匹配度', max: 100 }
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: muted,
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: rule
          }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(0,0,0,0.01)', 'rgba(0,0,0,0.02)']
          }
        },
        axisLine: {
          lineStyle: {
            color: rule
          }
        }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [92, 70, 95, 88, 85, 90],
            name: '心晴小屋',
            areaStyle: {
              color: accent + '25'
            },
            lineStyle: {
              color: accent,
              width: 2
            },
            itemStyle: {
              color: accent
            }
          },
          {
            value: [88, 68, 98, 85, 75, 82],
            name: '银龄学堂',
            areaStyle: {
              color: accent2 + '20'
            },
            lineStyle: {
              color: accent2,
              width: 2
            },
            itemStyle: {
              color: accent2
            }
          },
          {
            value: [85, 55, 90, 80, 92, 72],
            name: '古籍智读',
            areaStyle: {
              color: warn + '20'
            },
            lineStyle: {
              color: warn,
              width: 2
            },
            itemStyle: {
              color: warn
            }
          }
        ]
      }]
    };

    radarChart.setOption(radarOption);

    window.addEventListener('resize', function() {
      radarChart.resize();
    });
  }
})();
