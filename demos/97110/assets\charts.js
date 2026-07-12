// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var paper = style.getPropertyValue('--paper').trim();

  // --- Chart: Two types of regret ---
  var chartTypes = echarts.init(document.getElementById('chart-types'), null, { renderer: 'svg' });

  chartTypes.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function(params) {
        return params.name + '<br/>权重: ' + params.value + '%';
      }
    },
    legend: {
      show: false
    },
    series: [
      {
        name: '残念类型分布',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['30%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 2,
          borderColor: paper,
          borderWidth: 3
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 60, name: '未发生型', itemStyle: { color: accent } },
          { value: 40, name: '已发生型', itemStyle: { color: accent2 } }
        ]
      }
    ],
    graphic: [
      {
        type: 'group',
        left: '58%',
        top: 'center',
        children: [
          {
            type: 'text',
            left: 0,
            top: 0,
            style: {
              text: '两类残念',
              font: '400 18px InstrumentSerif, serif',
              fill: ink,
              textAlign: 'left'
            }
          },
          {
            type: 'rect',
            left: 0,
            top: 30,
            shape: {
              width: 12,
              height: 12
            },
            style: {
              fill: accent
            }
          },
          {
            type: 'text',
            left: 22,
            top: 28,
            style: {
              text: '未发生型  60%',
              font: '400 14px InstrumentSans, sans-serif',
              fill: ink,
              textAlign: 'left'
            }
          },
          {
            type: 'text',
            left: 22,
            top: 48,
            style: {
              text: '自我叙事为主，缺乏外部锚定',
              font: '400 12px InstrumentSans, sans-serif',
              fill: muted,
              textAlign: 'left'
            }
          },
          {
            type: 'rect',
            left: 0,
            top: 80,
            shape: {
              width: 12,
              height: 12
            },
            style: {
              fill: accent2
            }
          },
          {
            type: 'text',
            left: 22,
            top: 78,
            style: {
              text: '已发生型  40%',
              font: '400 14px InstrumentSans, sans-serif',
              fill: ink,
              textAlign: 'left'
            }
          },
          {
            type: 'text',
            left: 22,
            top: 98,
            style: {
              text: '可核验事实丰富，核心是对账',
              font: '400 12px InstrumentSans, sans-serif',
              fill: muted,
              textAlign: 'left'
            }
          }
        ]
      }
    ]
  });

  window.addEventListener('resize', function() {
    chartTypes.resize();
  });
})();
