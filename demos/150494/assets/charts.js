// assets/charts.js — Parent dashboard charts
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var pink = style.getPropertyValue('--pink').trim();
  var pink2 = style.getPropertyValue('--pink2').trim();
  var mint = style.getPropertyValue('--mint').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var ink2 = style.getPropertyValue('--ink2').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  window.initParentCharts = function() {
    if (window._parentChartsInit) return;
    window._parentChartsInit = true;

    // --- Chart: Relationship Temperature Trend ---
    var elRelation = document.getElementById('chart-relation');
    if (elRelation) {
      var chartRelation = echarts.init(elRelation, null, { renderer: 'svg' });
      var days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      var tempData = [25, 28, 24, 30, 32, 35, 40];

      chartRelation.setOption({
        animation: false,
        tooltip: {
          trigger: 'axis',
          appendToBody: true,
          backgroundColor: '#FFF8F0',
          borderColor: rule,
          textStyle: { color: ink, fontFamily: 'sans-serif', fontSize: 12 },
          formatter: function(p) {
            return p[0].axisValue + '<br/>' +
              '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + accent + ';margin-right:6px;"></span>' +
              '关系温度: <b>' + p[0].value + '°C</b>';
          }
        },
        grid: { top: 30, right: 20, bottom: 30, left: 45 },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: { lineStyle: { color: rule } },
          axisTick: { show: false },
          axisLabel: { color: muted, fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          min: 0, max: 100,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: rule, type: 'dashed' } },
          axisLabel: { color: muted, fontSize: 11, formatter: '{value}°C' }
        },
        series: [{
          type: 'line',
          data: tempData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: accent },
          itemStyle: { color: accent, borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: accent + '40' },
              { offset: 1, color: accent + '05' }
            ])
          },
          markPoint: {
            data: [{ type: 'max', name: '最高', symbolSize: 40, label: { fontSize: 10 } }],
            itemStyle: { color: accent }
          }
        }]
      });
      window.addEventListener('resize', function() { chartRelation.resize(); });
    }

    // --- Chart: Emotion Change (Bar + Line) ---
    var elEmotion = document.getElementById('chart-emotion');
    if (elEmotion) {
      var chartEmotion = echarts.init(elEmotion, null, { renderer: 'svg' });
      var emotionDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      var emotionScore = [3.2, 2.8, 2.5, 3.0, 2.2, 3.5, 4.0];
      var avgLine = [3.2, 3.2, 3.2, 3.2, 3.2, 3.2, 3.2];

      function getEmotionColor(val) {
        if (val >= 3.5) return mint;
        if (val >= 2.5) return accent2;
        return accent;
      }

      chartEmotion.setOption({
        animation: false,
        tooltip: {
          trigger: 'axis',
          appendToBody: true,
          backgroundColor: '#FFF8F0',
          borderColor: rule,
          textStyle: { color: ink, fontFamily: 'sans-serif', fontSize: 12 },
          formatter: function(params) {
            var bar = params[0];
            var labels = { 1: '很低落', 2: '有点低落', 3: '一般般', 4: '还不错', 5: '很开心' };
            var v = bar.value;
            var label = v < 2 ? labels[1] : v < 3 ? labels[2] : v < 4 ? labels[3] : labels[4];
            return bar.axisValue + '<br/>' +
              '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + bar.color + ';margin-right:6px;"></span>' +
              '情绪指数: <b>' + v + '</b> (' + label + ')';
          }
        },
        legend: {
          data: ['情绪指数', '周均值'],
          top: 0, right: 0,
          textStyle: { color: muted, fontSize: 11 },
          itemWidth: 16, itemHeight: 3
        },
        grid: { top: 30, right: 20, bottom: 30, left: 45 },
        xAxis: {
          type: 'category',
          data: emotionDays,
          axisLine: { lineStyle: { color: rule } },
          axisTick: { show: false },
          axisLabel: { color: muted, fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          min: 0, max: 5,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: rule, type: 'dashed' } },
          axisLabel: { color: muted, fontSize: 11 }
        },
        series: [
          {
            name: '情绪指数',
            type: 'bar',
            data: emotionScore.map(function(v) {
              return {
                value: v,
                itemStyle: { color: getEmotionColor(v), borderRadius: [6, 6, 0, 0] }
              };
            }),
            barWidth: '40%',
            markPoint: {
              data: [{ type: 'min', name: '最低', symbolSize: 40, label: { fontSize: 10 } }],
              itemStyle: { color: accent }
            }
          },
          {
            name: '周均值',
            type: 'line',
            data: avgLine,
            smooth: false,
            symbol: 'none',
            lineStyle: { width: 1.5, color: muted, type: 'dashed' }
          }
        ]
      });
      window.addEventListener('resize', function() { chartEmotion.resize(); });
    }
  };
})();
