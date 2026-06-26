(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var plans = {
    muscle: {
      title: '增肌塑形 · 上肢推拉日',
      score: 78,
      kcal: 684,
      items: [
        ['杠铃卧推', '4 组 × 8 次 · 休息 90 秒', '推'],
        ['坐姿划船', '4 组 × 10 次 · 保持肩胛收紧', '拉'],
        ['哑铃肩推', '3 组 × 10 次 · 控制离心', '肩'],
        ['绳索下压', '3 组 × 12 次 · 顶峰收缩', '臂']
      ]
    },
    fatloss: {
      title: '减脂燃脂 · 全身循环日',
      score: 84,
      kcal: 736,
      items: [
        ['划船机热身', '8 分钟 · 中等强度', '热'],
        ['壶铃摆动', '5 轮 × 15 次 · 休息 45 秒', '燃'],
        ['波比跳', '4 轮 × 12 次 · 保持节奏', 'HI'],
        ['坡度快走', '18 分钟 · 心率二区', '有']
      ]
    },
    strength: {
      title: '力量提升 · 下肢主项日',
      score: 72,
      kcal: 612,
      items: [
        ['深蹲', '5 组 × 5 次 · 逐组加重', '蹲'],
        ['罗马尼亚硬拉', '4 组 × 6 次 · 髋主导', '拉'],
        ['保加利亚分腿蹲', '3 组 × 8 次 / 侧', '稳'],
        ['核心抗旋转', '3 组 × 30 秒 / 侧', '核']
      ]
    }
  };

  function showToast(message) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(function () {
      toast.classList.remove('show');
    }, 1800);
  }

  function renderPlan() {
    var goal = document.getElementById('goal').value;
    var days = document.getElementById('days').value;
    var plan = plans[goal];
    var list = document.getElementById('plan-list');
    document.getElementById('plan-title').textContent = plan.title + ' · 每周 ' + days + ' 天';
    document.getElementById('score').textContent = plan.score;
    document.getElementById('kcal').textContent = plan.kcal;
    list.innerHTML = plan.items.map(function (item, index) {
      return [
        '<article class="workout">',
        '<div class="icon">' + item[2] + '</div>',
        '<div><strong>' + item[0] + '</strong><small>' + item[1] + '</small></div>',
        '<button class="check" aria-label="完成' + item[0] + '" data-index="' + index + '">✓</button>',
        '</article>'
      ].join('');
    }).join('');
    Array.prototype.forEach.call(document.querySelectorAll('.check'), function (button) {
      button.addEventListener('click', function () {
        button.classList.toggle('done');
        showToast(button.classList.contains('done') ? '已完成该训练动作' : '已取消完成状态');
      });
    });
  }

  document.getElementById('goal').addEventListener('change', renderPlan);
  document.getElementById('days').addEventListener('input', renderPlan);
  document.getElementById('generate').addEventListener('click', function () {
    renderPlan();
    showToast('已根据当前目标重新生成训练计划');
  });
  renderPlan();

  var energyEl = document.getElementById('chart-energy');
  var abilityEl = document.getElementById('chart-ability');
  var charts = [];

  if (energyEl) {
    var energyChart = echarts.init(energyEl, null, { renderer: 'svg' });
    energyChart.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: { trigger: 'axis', appendToBody: true },
      legend: { top: 0, textStyle: { color: muted } },
      grid: { left: 42, right: 28, top: 58, bottom: 34 },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: { color: muted },
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: 'kcal',
          nameTextStyle: { color: muted },
          axisLabel: { color: muted },
          splitLine: { lineStyle: { color: rule } }
        },
        {
          type: 'value',
          name: '分钟',
          nameTextStyle: { color: muted },
          axisLabel: { color: muted },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '消耗',
          type: 'bar',
          data: [520, 430, 684, 350, 610, 760, 480],
          barWidth: 18,
          itemStyle: { borderRadius: [8, 8, 0, 0], color: accent }
        },
        {
          name: '时长',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: accent2 },
          itemStyle: { color: accent2 },
          areaStyle: { color: accent2 + '22' },
          data: [38, 32, 42, 28, 46, 58, 35]
        }
      ]
    });
    charts.push(energyChart);
  }

  if (abilityEl) {
    var abilityChart = echarts.init(abilityEl, null, { renderer: 'svg' });
    abilityChart.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: { appendToBody: true },
      radar: {
        radius: '68%',
        axisName: { color: muted },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
        axisLine: { lineStyle: { color: rule } },
        indicator: [
          { name: '力量', max: 100 },
          { name: '耐力', max: 100 },
          { name: '柔韧', max: 100 },
          { name: '恢复', max: 100 },
          { name: '饮食', max: 100 },
          { name: '稳定性', max: 100 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{
          value: [76, 82, 62, 70, 84, 74],
          name: '本周状态',
          areaStyle: { color: accent + '24' },
          lineStyle: { color: accent, width: 3 },
          itemStyle: { color: accent }
        }]
      }]
    });
    charts.push(abilityChart);
  }

  window.addEventListener('resize', function () {
    charts.forEach(function (chart) {
      chart.resize();
    });
  });
})();
