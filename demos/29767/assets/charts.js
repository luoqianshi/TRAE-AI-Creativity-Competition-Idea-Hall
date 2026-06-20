(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart: Prevalence ---
  var chart1 = echarts.init(document.getElementById('chart-prevalence'), null, { renderer: 'svg' });
  chart1.setOption({
    animation: false,
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['患病率'], bottom: 0, textStyle: { color: muted } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['高血压', '糖尿病', '糖尿病前期', '高脂血症', '高尿酸血症'],
      axisLine: { lineStyle: { color: rule } },
      axisLabel: { color: ink, fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      name: '患病率 (%)',
      nameTextStyle: { color: muted },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } },
      axisLabel: { color: muted }
    },
    series: [{
      name: '患病率',
      type: 'bar',
      barWidth: '50%',
      data: [
        { value: 27.5, itemStyle: { color: accent } },
        { value: 11.9, itemStyle: { color: accent2 } },
        { value: 35.2, itemStyle: { color: '#d97706' } },
        { value: 35.6, itemStyle: { color: '#7c3aed' } },
        { value: 13.3, itemStyle: { color: '#dc2626' } }
      ],
      label: { show: true, position: 'top', formatter: '{c}%', color: ink, fontWeight: 700 }
    }]
  });
  window.addEventListener('resize', function() { chart1.resize(); });

  // --- Chart: Service Flow (Sankey) ---
  var chart2 = echarts.init(document.getElementById('chart-flow'), null, { renderer: 'svg' });
  chart2.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      nodeAlign: 'left',
      data: [
        { name: '居民健康档案', itemStyle: { color: accent } },
        { name: '慢病筛查', itemStyle: { color: accent } },
        { name: '确诊患者', itemStyle: { color: accent } },
        { name: '分类分级管理', itemStyle: { color: accent2 } },
        { name: '稳定期随访', itemStyle: { color: '#0891b2' } },
        { name: '控制不佳干预', itemStyle: { color: '#d97706' } },
        { name: '向上转诊', itemStyle: { color: '#dc2626' } },
        { name: '上级医院治疗', itemStyle: { color: '#dc2626' } },
        { name: '转回基层', itemStyle: { color: accent2 } },
        { name: '健康教育与指导', itemStyle: { color: '#7c3aed' } }
      ],
      links: [
        { source: '居民健康档案', target: '慢病筛查', value: 10 },
        { source: '慢病筛查', target: '确诊患者', value: 6 },
        { source: '确诊患者', target: '分类分级管理', value: 6 },
        { source: '分类分级管理', target: '稳定期随访', value: 4 },
        { source: '分类分级管理', target: '控制不佳干预', value: 2 },
        { source: '控制不佳干预', target: '向上转诊', value: 1 },
        { source: '向上转诊', target: '上级医院治疗', value: 1 },
        { source: '上级医院治疗', target: '转回基层', value: 1 },
        { source: '转回基层', target: '稳定期随访', value: 1 },
        { source: '稳定期随访', target: '健康教育与指导', value: 5 },
        { source: '控制不佳干预', target: '健康教育与指导', value: 1 }
      ],
      lineStyle: { color: 'source', curveness: 0.5, opacity: 0.4 },
      label: { color: ink, fontSize: 12, fontWeight: 600 }
    }]
  });
  window.addEventListener('resize', function() { chart2.resize(); });
})();
