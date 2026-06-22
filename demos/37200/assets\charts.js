// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var primary = '#122e8a';
  var accent = '#91c53a';
  var danger = '#d94040';
  var muted = '#6b7280';
  var mutedLight = '#9ca3af';

  // --- Sentiment Trend Chart ---
  var chartEl = document.getElementById('chart-sentiment');
  if (chartEl) {
    var chart = echarts.init(chartEl, null, { renderer: 'svg' });

    var hours = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
    var positive = [78, 76, 75, 74, 73, 71, 68, 62, 55, 48, 52, 58];
    var negative = [5, 4, 5, 6, 7, 8, 12, 18, 28, 35, 30, 22];
    var neutral = [17, 20, 20, 20, 20, 21, 20, 20, 17, 17, 18, 20];

    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#1a1a1a', fontSize: 12 }
      },
      legend: {
        data: ['正面', '负面', '中性'],
        top: 0,
        right: 0,
        textStyle: { color: mutedLight, fontSize: 11 },
        itemWidth: 16,
        itemHeight: 8
      },
      grid: {
        left: 40,
        right: 16,
        top: 36,
        bottom: 28
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: mutedLight, fontSize: 10 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { color: mutedLight, fontSize: 10, formatter: '{value}%' },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '正面',
          type: 'line',
          data: positive,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: accent },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(145,197,58,0.2)' },
                { offset: 1, color: 'rgba(145,197,58,0)' }
              ]
            }
          }
        },
        {
          name: '负面',
          type: 'line',
          data: negative,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: danger },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(217,64,64,0.2)' },
                { offset: 1, color: 'rgba(217,64,64,0)' }
              ]
            }
          }
        },
        {
          name: '中性',
          type: 'line',
          data: neutral,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: mutedLight, type: 'dashed' }
        }
      ]
    });

    // Mark the crisis spike area
    chart.setOption({
      series: [{
        markArea: {
          silent: true,
          data: [[
            { xAxis: '14:00', itemStyle: { color: 'rgba(217,64,64,0.06)' } },
            { xAxis: '20:00' }
          ]]
        }
      }]
    });

    window.addEventListener('resize', function() { chart.resize(); });
  }

  // --- Scroll fade-in animation ---
  var fadeEls = document.querySelectorAll('.fade-in');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(function(el) {
    observer.observe(el);
  });

  // --- Number counter animation ---
  var counterEls = document.querySelectorAll('.market-number[data-target]');
  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-target'));
        var suffix = el.getAttribute('data-suffix') || '';
        var decimal = parseInt(el.getAttribute('data-decimal')) || 0;
        var duration = 2000;
        var startTime = null;

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = eased * target;
          el.textContent = current.toFixed(decimal) + suffix;
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(function(el) {
    counterObserver.observe(el);
  });
})();
