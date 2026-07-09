(function() {
  'use strict';

  var canvas = document.getElementById('foodWheel');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var spinBtn = document.getElementById('spinBtn');
  var resultBox = document.getElementById('wheelResult');

  var size = canvas.width;
  var center = size / 2;
  var radius = center - 16;

  var segments = [
    { label: '优质蛋白', color: '#E85D4E', text: '#fff', desc: '推荐：鸡胸肉、三文鱼、豆腐、虾仁', icon: '🥩' },
    { label: '复合碳水', color: '#F5A623', text: '#fff', desc: '推荐：糙米饭、全麦面包、红薯、燕麦', icon: '🍠' },
    { label: '膳食纤维', color: '#4CAF7A', text: '#fff', desc: '推荐：西兰花、菠菜、芹菜、菌菇', icon: '🥦' },
    { label: '维生素 C', color: '#FF8C42', text: '#fff', desc: '推荐：柑橘、猕猴桃、彩椒、草莓', icon: '🍊' },
    { label: '优质脂肪', color: '#7D6E5D', text: '#fff', desc: '推荐：牛油果、坚果、橄榄油、深海鱼', icon: '🥑' },
    { label: '钙质补充', color: '#5B8DB8', text: '#fff', desc: '推荐：牛奶、酸奶、奶酪、深绿叶菜', icon: '🥛' },
    { label: '益生菌', color: '#C17CE9', text: '#fff', desc: '推荐：无糖酸奶、泡菜、味噌、康普茶', icon: '🍶' },
    { label: '水分补给', color: '#45B7D1', text: '#fff', desc: '推荐：温水、淡茶、清汤、椰子水', icon: '💧' }
  ];

  var currentAngle = 0;
  var isSpinning = false;

  function drawWheel() {
    ctx.clearRect(0, 0, size, size);
    var arc = (2 * Math.PI) / segments.length;

    segments.forEach(function(seg, i) {
      var angle = currentAngle + i * arc;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.text;
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.fillText(seg.label, radius - 36, 10);
      ctx.font = '36px sans-serif';
      ctx.fillText(seg.icon, radius - 100, 12);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#E85D4E';
    ctx.stroke();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function spin() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    resultBox.innerHTML = '';

    var extraSpins = 5 + Math.random() * 3;
    var targetAngle = currentAngle + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
    var duration = 3500;
    var start = performance.now();
    var startAngle = currentAngle;

    function animate(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      currentAngle = startAngle + (targetAngle - startAngle) * eased;
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        spinBtn.disabled = false;
        showResult();
      }
    }
    requestAnimationFrame(animate);
  }

  function showResult() {
    var arc = (2 * Math.PI) / segments.length;
    var pointerAngle = (3 * Math.PI / 2 - currentAngle) % (2 * Math.PI);
    if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
    var index = Math.floor(pointerAngle / arc);
    var seg = segments[index];

    resultBox.innerHTML =
      '<div class="result-title">今日主角：' + seg.icon + ' ' + seg.label + '</div>' +
      '<div class="result-desc">' + seg.desc + '</div>';
  }

  drawWheel();
  if (spinBtn) spinBtn.addEventListener('click', spin);
})();
