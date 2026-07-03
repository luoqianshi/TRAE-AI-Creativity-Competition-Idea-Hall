(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: 调整前后持仓结构对比 ---
  var chartCompare = echarts.init(document.getElementById('chart-compare'), null, { renderer: 'svg' });
  chartCompare.setOption({
    animation: false,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: '{b}: {c}元 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: { color: ink }
    },
    grid: [
      { left: '55%', top: '10%', width: '40%', height: '80%' }
    ],
    series: [
      {
        name: '调整前',
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['28%', '50%'],
        data: [
          { value: 3328, name: '永赢科技', itemStyle: { color: accent } },
          { value: 3666, name: '华夏芯片', itemStyle: { color: '#0ea5e9' } },
          { value: 4489, name: '兴全和润', itemStyle: { color: '#8b5cf6' } },
          { value: 6193, name: '中欧时代', itemStyle: { color: '#f59e0b' } },
          { value: 1961, name: '广发成长', itemStyle: { color: '#10b981' } },
          { value: 4425, name: '富国天惠', itemStyle: { color: '#64748b' } },
          { value: 2466, name: '交银新成长', itemStyle: { color: '#94a3b8' } },
          { value: 1127, name: '易方达蓝筹', itemStyle: { color: '#cbd5e1' } },
          { value: 1339, name: '前海开源', itemStyle: { color: '#e2e8f0' } },
          { value: 1063, name: '招商白酒', itemStyle: { color: '#f1f5f9' } }
        ],
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: ink
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      {
        name: '调整后',
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['72%', '50%'],
        data: [
          { value: 3328, name: '永赢科技', itemStyle: { color: accent } },
          { value: 4666, name: '华夏芯片', itemStyle: { color: '#0ea5e9' } },
          { value: 4489, name: '兴全和润', itemStyle: { color: '#8b5cf6' } },
          { value: 6193, name: '中欧时代', itemStyle: { color: '#f59e0b' } },
          { value: 1961, name: '广发成长', itemStyle: { color: '#10b981' } },
          { value: 2212, name: '富国天惠(剩)', itemStyle: { color: '#64748b' } },
          { value: 1233, name: '交银新成长(剩)', itemStyle: { color: '#94a3b8' } },
          { value: 2000, name: '双创50ETF', itemStyle: { color: '#ef4444' } },
          { value: 1500, name: '创业板AI', itemStyle: { color: '#f97316' } },
          { value: 1500, name: '景顺稳健', itemStyle: { color: '#ec4899' } },
          { value: 974, name: '现金储备', itemStyle: { color: '#e2e8f0' } }
        ],
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: ink
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    graphic: [
      {
        type: 'text',
        left: '22%',
        top: '5%',
        style: {
          text: '调整前',
          fontSize: 16,
          fontWeight: 'bold',
          fill: ink
        }
      },
      {
        type: 'text',
        left: '66%',
        top: '5%',
        style: {
          text: '调整后（优化版）',
          fontSize: 16,
          fontWeight: 'bold',
          fill: accent
        }
      }
    ]
  });
  window.addEventListener('resize', function() { chartCompare.resize(); });
})();
