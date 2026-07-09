// charts.js — 韭菜星球创意提案图表逻辑
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg3 = style.getPropertyValue('--bg3').trim();

  // ========== Chart 1: 韭菜值 TOP10 示例 ==========
  var chart1El = document.getElementById('chart-leek-ranking');
  if (chart1El) {
    var chart1 = echarts.init(chart1El, null, { renderer: 'svg' });

    var stockData = [
      { name: 'ST明远 (688123)', value: 82.1 },
      { name: '退海控 (600789)', value: 78.5 },
      { name: '恒泰退 (300456)', value: 75.2 },
      { name: '中创信 (002345)', value: 71.8 },
      { name: '光华能 (000567)', value: 68.3 },
      { name: '通达电 (601234)', value: 65.7 },
      { name: '瑞康药 (300678)', value: 62.4 },
      { name: '控股集 (600890)', value: 59.1 },
      { name: '华新材 (002789)', value: 56.8 },
      { name: '能电力 (000123)', value: 53.2 }
    ];

    chart1.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 },
        formatter: function(params) {
          var p = params[0];
          return p.name + '<br/>韭菜值: <b style="color:' + accent2 + '">' + p.value + '%</b>';
        }
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          color: muted,
          fontSize: 11,
          formatter: '{value}%'
        },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: stockData.map(function(d) { return d.name; }),
        axisLabel: {
          color: ink,
          fontSize: 12
        },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        inverse: true
      },
      series: [{
        type: 'bar',
        data: stockData.map(function(d) {
          return {
            value: d.value,
            itemStyle: {
              color: d.value >= 70 ? accent2 : (d.value >= 50 ? accent : muted),
              borderRadius: [0, 4, 4, 0]
            }
          };
        }),
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          color: ink,
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}%'
        }
      }]
    });

    window.addEventListener('resize', function() { chart1.resize(); });
  }

  // ========== Chart 2: 五大论坛评论量分布 ==========
  var chart2El = document.getElementById('chart-forum-dist');
  if (chart2El) {
    var chart2 = echarts.init(chart2El, null, { renderer: 'svg' });

    chart2.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 },
        formatter: '{b}: {c}万条 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: muted, fontSize: 12 },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 12
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: bg2,
          borderWidth: 3
        },
        label: {
          show: true,
          color: ink,
          fontSize: 13,
          fontWeight: 600,
          formatter: '{d}%'
        },
        labelLine: {
          lineStyle: { color: muted }
        },
        data: [
          { value: 842, name: '东方财富网', itemStyle: { color: '#e74c3c' } },
          { value: 501, name: '同花顺', itemStyle: { color: '#3498db' } },
          { value: 301, name: '淘股吧', itemStyle: { color: '#9b59b6' } },
          { value: 200, name: '新浪财经', itemStyle: { color: '#f39c12' } },
          { value: 160, name: '腾讯财经', itemStyle: { color: '#1abc9c' } }
        ]
      }]
    });

    window.addEventListener('resize', function() { chart2.resize(); });
  }

  // ========== Chart 3: 负面关键词频次 TOP15 ==========
  var chart3El = document.getElementById('chart-keyword-freq');
  if (chart3El) {
    var chart3 = echarts.init(chart3El, null, { renderer: 'svg' });

    var keywords = [
      { name: '完蛋', value: 1987 },
      { name: '烂股', value: 2123 },
      { name: '狗屎', value: 2341 },
      { name: '黑幕', value: 2543 },
      { name: '跑路', value: 2987 },
      { name: '操纵', value: 3421 },
      { name: '坑爹', value: 3654 },
      { name: '血洗', value: 3987 },
      { name: '退市', value: 4567 },
      { name: '骗局', value: 4892 },
      { name: '暴跌', value: 5234 },
      { name: '庄家', value: 5876 },
      { name: '套牢', value: 6543 },
      { name: '割韭菜', value: 7651 },
      { name: '垃圾', value: 8932 }
    ];

    chart3.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink, fontSize: 13 },
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          var p = params[0];
          return '"' + p.name + '"<br/>出现频次: <b style="color:' + accent2 + '">' + p.value + '</b> 次';
        }
      },
      grid: {
        left: '3%',
        right: '12%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: muted,
          fontSize: 11
        },
        axisLine: { lineStyle: { color: rule } },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: keywords.map(function(d) { return d.name; }),
        axisLabel: {
          color: ink,
          fontSize: 13,
          fontWeight: 600
        },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: keywords.map(function(d) {
          return {
            value: d.value,
            itemStyle: {
              color: d.value >= 5000 ? accent2 : (d.value >= 3000 ? accent : muted),
              borderRadius: [0, 4, 4, 0]
            }
          };
        }),
        barWidth: '55%',
        label: {
          show: true,
          position: 'right',
          color: ink,
          fontSize: 11,
          formatter: '{c}'
        }
      }]
    });

    window.addEventListener('resize', function() { chart3.resize(); });
  }
})();
