// assets/charts.js
(function() {
  'use strict';

  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ============================================================
  // Chart 1: Radar — 六大痛点严重程度评估
  // ============================================================
  var radarContainer = document.getElementById('chart-pain-radar');
  if (radarContainer) {
    var radarChart = echarts.init(radarContainer, null, { renderer: 'svg' });
    radarChart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'item'
      },
      radar: {
        indicator: [
          { name: '建模门槛高', max: 10 },
          { name: '无法复用', max: 10 },
          { name: '模型不可控', max: 10 },
          { name: '维护成本高', max: 10 },
          { name: '工具复杂', max: 10 },
          { name: '缺少标准底座', max: 10 }
        ],
        shape: 'circle',
        center: ['50%', '50%'],
        radius: '70%',
        axisName: {
          color: ink,
          fontSize: 12,
          fontWeight: 600
        },
        splitArea: {
          areaStyle: {
            color: [bg2 + '66', bg2 + '33']
          }
        },
        axisLine: {
          lineStyle: {
            color: rule
          }
        },
        splitLine: {
          lineStyle: {
            color: rule
          }
        }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [9.2, 8.5, 9.0, 8.8, 8.0, 8.6],
            name: '严重程度',
            areaStyle: {
              color: accent + '33'
            },
            lineStyle: {
              color: accent,
              width: 2
            },
            itemStyle: {
              color: accent
            }
          }
        ],
        symbol: 'circle',
        symbolSize: 8
      }]
    });
    window.addEventListener('resize', function() { radarChart.resize(); });
  }

  // ============================================================
  // Chart 2: Bar — 效率提升对比
  // ============================================================
  var effContainer = document.getElementById('chart-efficiency');
  if (effContainer) {
    var effChart = echarts.init(effContainer, null, { renderer: 'svg' });
    effChart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['传统方式', '元启知门'],
        bottom: 0,
        textStyle: { color: muted, fontSize: 13 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '14%',
        top: '4%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['本体搭建周期\n（天）', '人工维护\n（人月/年）', '跨业务复用\n（套数）', '知识对齐\n（准确率%）'],
        axisLabel: {
          color: muted,
          fontSize: 12,
          interval: 0
        },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '传统方式',
          type: 'bar',
          barWidth: '30%',
          barGap: '20%',
          data: [120, 24, 1, 65],
          itemStyle: {
            color: muted,
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            color: muted,
            fontSize: 11,
            formatter: function(p) {
              return p.value + (p.dataIndex === 3 ? '%' : '');
            }
          }
        },
        {
          name: '元启知门',
          type: 'bar',
          barWidth: '30%',
          data: [5, 7, 8, 96],
          itemStyle: {
            color: accent,
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            color: accent,
            fontSize: 11,
            fontWeight: 600,
            formatter: function(p) {
              return p.value + (p.dataIndex === 3 ? '%' : '');
            }
          }
        }
      ]
    });
    window.addEventListener('resize', function() { effChart.resize(); });
  }

})();