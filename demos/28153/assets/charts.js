// assets/charts.js - ECharts for Know-Drive Cockpit-AI
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var accent3 = style.getPropertyValue('--accent3').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var bg = style.getPropertyValue('--bg').trim();

  // =====================
  // Kalman Filter Chart
  // =====================
  var kalmanChart = echarts.init(document.getElementById('chart-kalman'), null, { renderer: 'svg' });
  window.kalmanChart = kalmanChart;

  function generateKalmanData(Q, R, P0) {
    var n = 100;
    var trueVal = [];
    var measurement = [];
    var estimate = [];
    var error = [];

    var x = 0;
    var v = 0.5;
    var p = P0;
    var q = Q;
    var r = R;
    var f = 1;
    var h = 1;

    for (var i = 0; i < n; i++) {
      var t = i * 0.1;
      var truePos = 5 * Math.sin(0.3 * t) + 2 * t;
      trueVal.push([t, truePos]);

      var noise = (Math.random() - 0.5) * 2 * Math.sqrt(r);
      measurement.push([t, truePos + noise]);

      // Prediction
      x = f * x + v * 0.1;
      p = f * p * f + q;

      // Update
      var k = p * h / (h * p * h + r);
      x = x + k * (truePos + noise - h * x);
      p = (1 - k * h) * p;

      estimate.push([t, x]);
      error.push([t, Math.abs(truePos - x)]);
    }
    return { trueVal: trueVal, measurement: measurement, estimate: estimate, error: error };
  }

  function renderKalmanChart() {
    var Q = parseFloat(document.getElementById('q-slider').value);
    var R = parseFloat(document.getElementById('r-slider').value);
    var P0 = parseFloat(document.getElementById('p-slider').value);
    var data = generateKalmanData(Q, R, P0);

    kalmanChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink }
      },
      legend: {
        data: ['真实值', '测量值', '卡尔曼估计', '估计误差'],
        textStyle: { color: muted },
        top: 10
      },
      grid: { left: 60, right: 60, top: 60, bottom: 50 },
      xAxis: {
        type: 'value',
        name: '时间 (s)',
        nameTextStyle: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
      },
      yAxis: [
        {
          type: 'value',
          name: '位置 (m)',
          nameTextStyle: { color: muted },
          axisLine: { lineStyle: { color: rule } },
          axisLabel: { color: muted },
          splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
        },
        {
          type: 'value',
          name: '误差 (m)',
          nameTextStyle: { color: muted },
          axisLine: { lineStyle: { color: rule } },
          axisLabel: { color: muted },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '真实值',
          type: 'line',
          data: data.trueVal,
          smooth: true,
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          showSymbol: false
        },
        {
          name: '测量值',
          type: 'scatter',
          data: data.measurement,
          symbolSize: 4,
          itemStyle: { color: muted, opacity: 0.5 }
        },
        {
          name: '卡尔曼估计',
          type: 'line',
          data: data.estimate,
          smooth: true,
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          showSymbol: false
        },
        {
          name: '估计误差',
          type: 'line',
          yAxisIndex: 1,
          data: data.error,
          smooth: true,
          lineStyle: { color: accent3, width: 1.5, type: 'dashed' },
          itemStyle: { color: accent3 },
          showSymbol: false,
          areaStyle: { color: accent3 + '20' }
        }
      ]
    });
  }

  window.updateKalmanChart = renderKalmanChart;
  renderKalmanChart();
  window.addEventListener('resize', function() { kalmanChart.resize(); });

  // =====================
  // PID Control Chart
  // =====================
  var controlChart = echarts.init(document.getElementById('chart-control'), null, { renderer: 'svg' });
  window.controlChart = controlChart;

  function generateControlData(Kp, Ki, Kd) {
    var dt = 0.05;
    var n = 200;
    var target = [];
    var actual = [];
    var error = [];
    var control = [];

    var y = 0;
    var vy = 0;
    var integral = 0;
    var prevErr = 0;

    for (var i = 0; i < n; i++) {
      var t = i * dt;
      var ref = t < 2 ? 0 : (t < 8 ? 5 : (t < 14 ? 10 : 5));
      target.push([t, ref]);

      var err = ref - y;
      integral += err * dt;
      var derivative = (err - prevErr) / dt;
      var u = Kp * err + Ki * integral + Kd * derivative;
      u = Math.max(-10, Math.min(10, u));

      vy += u * dt;
      vy *= 0.95;
      y += vy * dt;

      actual.push([t, y]);
      error.push([t, err]);
      control.push([t, u]);
      prevErr = err;
    }
    return { target: target, actual: actual, error: error, control: control };
  }

  function renderControlChart() {
    var Kp = parseFloat(document.getElementById('p-pid').value);
    var Ki = parseFloat(document.getElementById('i-pid').value);
    var Kd = parseFloat(document.getElementById('d-pid').value);
    var data = generateControlData(Kp, Ki, Kd);

    controlChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: bg2,
        borderColor: rule,
        textStyle: { color: ink }
      },
      legend: {
        data: ['目标轨迹', '实际轨迹', '控制量'],
        textStyle: { color: muted },
        top: 10
      },
      grid: { left: 60, right: 60, top: 60, bottom: 50 },
      xAxis: {
        type: 'value',
        name: '时间 (s)',
        nameTextStyle: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
      },
      yAxis: [
        {
          type: 'value',
          name: '位置 (m)',
          nameTextStyle: { color: muted },
          axisLine: { lineStyle: { color: rule } },
          axisLabel: { color: muted },
          splitLine: { lineStyle: { color: rule, opacity: 0.3 } }
        },
        {
          type: 'value',
          name: '控制量',
          nameTextStyle: { color: muted },
          axisLine: { lineStyle: { color: rule } },
          axisLabel: { color: muted },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '目标轨迹',
          type: 'line',
          data: data.target,
          step: 'middle',
          lineStyle: { color: accent2, width: 2 },
          itemStyle: { color: accent2 },
          showSymbol: false
        },
        {
          name: '实际轨迹',
          type: 'line',
          data: data.actual,
          smooth: true,
          lineStyle: { color: accent, width: 2.5 },
          itemStyle: { color: accent },
          showSymbol: false,
          areaStyle: { color: accent + '15' }
        },
        {
          name: '控制量',
          type: 'line',
          yAxisIndex: 1,
          data: data.control,
          smooth: true,
          lineStyle: { color: accent3, width: 1.5, type: 'dashed' },
          itemStyle: { color: accent3 },
          showSymbol: false
        }
      ]
    });
  }

  window.updateControlChart = renderControlChart;
  renderControlChart();
  window.addEventListener('resize', function() { controlChart.resize(); });

})();
