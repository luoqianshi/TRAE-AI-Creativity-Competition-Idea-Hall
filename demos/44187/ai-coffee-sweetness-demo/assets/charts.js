(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var success = style.getPropertyValue('--success').trim();

  var form = document.getElementById('sweetForm');
  var fields = {
    coffee: document.getElementById('coffee'),
    mood: document.getElementById('mood'),
    food: document.getElementById('food'),
    goal: document.getElementById('goal'),
    history: document.getElementById('history')
  };

  var text = {
    coffee: {
      latte: '拿铁',
      americano: '美式',
      coldbrew: '冷萃',
      mocha: '摩卡',
      espresso: '意式浓缩'
    },
    mood: {
      relaxed: '放松',
      focused: '专注',
      tired: '疲惫',
      happy: '开心'
    },
    goal: {
      balanced: '轻控糖',
      strict: '严格控糖',
      enjoy: '享受优先'
    }
  };

  var coffeeFactor = {
    latte: { delta: 4, aroma: 72, bitter: 40, milk: 88 },
    americano: { delta: 9, aroma: 84, bitter: 78, milk: 15 },
    coldbrew: { delta: 2, aroma: 76, bitter: 46, milk: 22 },
    mocha: { delta: -8, aroma: 68, bitter: 34, milk: 70 },
    espresso: { delta: 12, aroma: 92, bitter: 90, milk: 8 }
  };
  var moodFactor = { relaxed: 4, focused: -5, tired: 8, happy: -1 };
  var foodFactor = { none: 0, croissant: 2, cake: -10, salad: -3, chocolate: 5 };
  var goalFactor = { balanced: -4, strict: -16, enjoy: 8 };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function calc() {
    var coffee = fields.coffee.value;
    var mood = fields.mood.value;
    var food = fields.food.value;
    var goal = fields.goal.value;
    var history = Number(fields.history.value);
    var base = history + coffeeFactor[coffee].delta + moodFactor[mood] + foodFactor[food] + goalFactor[goal];
    var score = Math.round(clamp(base, 8, 92));
    var grams = Number((score * 0.064).toFixed(1));
    var pumps = Number((grams / 5).toFixed(1));
    var kcal = Math.round(grams * 4);
    var taste = score < 28 ? '清苦低甜' : score < 48 ? '轻盈微甜' : score < 68 ? '均衡甜感' : '治愈甜感';
    var health = goal === 'strict' ? Math.max(20, 100 - score + 18) : goal === 'balanced' ? Math.max(16, 100 - score + 4) : Math.max(10, 92 - score);
    var match = Math.round(clamp(100 - Math.abs(history - score) * 1.2, 50, 99));
    return {
      coffee: coffee,
      mood: mood,
      food: food,
      goal: goal,
      history: history,
      score: score,
      grams: grams,
      pumps: pumps,
      kcal: kcal,
      taste: taste,
      aroma: coffeeFactor[coffee].aroma,
      bitter: coffeeFactor[coffee].bitter,
      milk: coffeeFactor[coffee].milk,
      health: Math.round(health),
      match: match
    };
  }

  function reason(data) {
    var foodNote = {
      none: '没有甜食搭配，系统会让甜味略微承担平衡苦感的作用',
      croissant: '牛角包有黄油香，少量糖能放大奶香和烘焙香',
      cake: '蛋糕本身偏甜，因此系统主动下调咖啡中的加糖量',
      salad: '轻食场景更适合清爽口感，所以甜度会略微降低',
      chocolate: '黑巧带来苦甜对比，适合用少量糖把尾韵拉圆润'
    };
    var goalNote = {
      balanced: '同时保留口感和控糖空间',
      strict: '优先减少糖分摄入，并避免甜味盖过咖啡风味',
      enjoy: '更偏向今天的愉悦感和治愈感'
    };
    return 'AI 判断你今天适合“' + data.taste + '”：' +
      text.coffee[data.coffee] + '与“' + text.mood[data.mood] + '”状态匹配，' +
      foodNote[data.food] + '；健康目标为“' + text.goal[data.goal] + '”，因此建议 ' +
      data.grams + ' 克糖，约 ' + data.pumps + ' 泵糖浆，预计增加约 ' + data.kcal + ' 千卡，' +
      goalNote[data.goal] + '。';
  }

  var chartEl = document.getElementById('chart-profile');
  var chart = echarts.init(chartEl, null, { renderer: 'svg' });

  function renderChart(data) {
    chart.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: {
        appendToBody: true,
        trigger: 'item'
      },
      legend: {
        bottom: 0,
        textStyle: { color: muted }
      },
      radar: {
        center: ['50%', '47%'],
        radius: '64%',
        axisName: { color: muted, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: [bg2, 'transparent'] } },
        axisLine: { lineStyle: { color: rule } },
        indicator: [
          { name: '甜感', max: 100 },
          { name: '香气保留', max: 100 },
          { name: '苦感平衡', max: 100 },
          { name: '奶香融合', max: 100 },
          { name: '控糖友好', max: 100 },
          { name: '偏好匹配', max: 100 }
        ]
      },
      series: [
        {
          name: '甜度画像',
          type: 'radar',
          data: [
            {
              name: '本次推荐',
              value: [
                data.score,
                data.aroma,
                100 - Math.abs(data.bitter - data.score),
                data.milk,
                data.health,
                data.match
              ],
              areaStyle: { color: accent + '26' },
              lineStyle: { color: accent, width: 3 },
              itemStyle: { color: accent }
            },
            {
              name: '历史偏好',
              value: [
                data.history,
                70,
                72,
                62,
                data.goal === 'strict' ? 88 : 68,
                82
              ],
              areaStyle: { color: accent2 + '18' },
              lineStyle: { color: accent2, width: 2, type: 'dashed' },
              itemStyle: { color: accent2 }
            }
          ]
        }
      ],
      textStyle: { color: ink }
    });
  }

  function update() {
    var data = calc();
    document.getElementById('historyValue').textContent = data.history;
    document.getElementById('sugarGram').textContent = data.grams + 'g';
    document.getElementById('pumpCount').textContent = data.pumps;
    document.getElementById('sweetScore').textContent = data.score;
    document.getElementById('reasonText').textContent = reason(data);
    document.getElementById('heroSugar').textContent = data.grams;
    document.getElementById('heroPump').textContent = '约 ' + data.pumps + ' 泵糖浆';
    document.getElementById('heroTaste').textContent = data.taste;
    document.getElementById('heroMood').textContent = text.mood[data.mood];
    document.getElementById('heroCoffee').textContent = text.coffee[data.coffee];
    document.getElementById('heroGoal').textContent = text.goal[data.goal];
    renderChart(data);
  }

  Array.prototype.forEach.call(form.elements, function (el) {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  document.getElementById('randomBtn').addEventListener('click', function () {
    Object.keys(fields).forEach(function (key) {
      if (key === 'history') {
        fields[key].value = Math.round(18 + Math.random() * 64);
      } else {
        var options = fields[key].options;
        fields[key].selectedIndex = Math.floor(Math.random() * options.length);
      }
    });
    update();
  });

  window.addEventListener('resize', function () {
    chart.resize();
  });

  update();
})();
