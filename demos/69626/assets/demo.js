// assets/demo.js - Thinking Broadcast Simulation
(function() {
  var el = document.getElementById('typing-text');
  var prog = document.getElementById('progress-fill');
  var progLabel = document.getElementById('progress-label');

  var el2 = document.getElementById('typing-text-2');
  var prog2 = document.getElementById('progress-fill-2');
  var progLabel2 = document.getElementById('progress-label-2');

  // Wang's thinking process
  var phases = [
    { text: '我觉得', speed: 120, progress: 10 },
    { text: '性能是关键，', speed: 80, progress: 20 },
    { text: '但团队目前没有 Rust 经验...', speed: 100, progress: 30 },
    { text: '等一下，', speed: 150, progress: 38 },
    { text: '\u200b', speed: 0, progress: 40 }, // pause
    { action: 'delete', count: 0, speed: 60, progress: 42 },
    { text: '让我重新想想，', speed: 100, progress: 50 },
    { text: '如果用 Go 的话，学习成本更低，', speed: 70, progress: 62 },
    { text: '但并发模型确实不如 Rust 成熟...', speed: 90, progress: 72 },
    { text: '我倾向 Rust，', speed: 100, progress: 82 },
    { text: '可以分阶段迁移。', speed: 80, progress: 90 },
    { text: ' ✓', speed: 60, progress: 100 }
  ];

  var fullText = '';
  var phaseIdx = 0;
  var charIdx = 0;

  function typePhase() {
    if (phaseIdx >= phases.length) return;

    var phase = phases[phaseIdx];

    if (phase.action === 'delete') {
      // Delete previous character
      if (fullText.length > 0) {
        fullText = fullText.slice(0, -1);
        el.textContent = fullText;
        updateProgress(phase.progress);
        setTimeout(typePhase, phase.speed);
      } else {
        phaseIdx++;
        setTimeout(typePhase, 200);
      }
      return;
    }

    if (phase.text === '\u200b') {
      // Pause
      updateProgress(phase.progress);
      phaseIdx++;
      setTimeout(typePhase, 800);
      return;
    }

    if (charIdx < phase.text.length) {
      fullText += phase.text[charIdx];
      el.textContent = fullText;
      charIdx++;

      // Calculate progress within this phase
      var phaseProgress = phase.progress - (phaseIdx > 0 ? phases[Math.max(0, phaseIdx - 1)].progress : 0);
      var charProgress = (charIdx / phase.text.length) * phaseProgress;
      var baseProgress = phaseIdx > 0 ? phases[Math.max(0, phaseIdx - 1)].progress : 0;
      updateProgress(Math.round(baseProgress + charProgress));

      // Variable speed for natural feel
      var speed = phase.speed + (Math.random() * 60 - 30);
      setTimeout(typePhase, speed);
    } else {
      charIdx = 0;
      phaseIdx++;
      setTimeout(typePhase, 300 + Math.random() * 400);
    }
  }

  function updateProgress(p) {
    prog.style.width = p + '%';
    progLabel.textContent = p >= 100 ? '思考完成 ✓' : '思考中 ' + p + '%';
  }

  // Start after a short delay
  setTimeout(typePhase, 1500);

  // Zhang's thinking process (simpler, starts later)
  var phases2 = [
    { text: '从产品角度，', speed: 130, progress: 15 },
    { text: '交付速度比极致性能更重要，', speed: 90, progress: 35 },
    { text: '建议先 MVP 用 Go，', speed: 85, progress: 55 },
    { text: '后续有性能瓶颈再迁移。', speed: 75, progress: 75 },
    { text: '\u200b', speed: 0, progress: 78 },
    { text: '不过李工说的分阶段迁移也有道理...', speed: 80, progress: 100 }
  ];

  var fullText2 = '';
  var phaseIdx2 = 0;
  var charIdx2 = 0;

  function typePhase2() {
    if (phaseIdx2 >= phases2.length) return;
    var phase = phases2[phaseIdx2];

    if (phase.text === '\u200b') {
      updateProgress2(phase.progress);
      phaseIdx2++;
      setTimeout(typePhase2, 600);
      return;
    }

    if (charIdx2 < phase.text.length) {
      fullText2 += phase.text[charIdx2];
      el2.textContent = fullText2;
      charIdx2++;

      var phaseProgress2 = phase.progress - (phaseIdx2 > 0 ? phases2[Math.max(0, phaseIdx2 - 1)].progress : 0);
      var charProgress2 = (charIdx2 / phase.text.length) * phaseProgress2;
      var baseProgress2 = phaseIdx2 > 0 ? phases2[Math.max(0, phaseIdx2 - 1)].progress : 0;
      updateProgress2(Math.round(baseProgress2 + charProgress2));

      var speed2 = phase.speed + (Math.random() * 50 - 25);
      setTimeout(typePhase2, speed2);
    } else {
      charIdx2 = 0;
      phaseIdx2++;
      setTimeout(typePhase2, 400 + Math.random() * 500);
    }
  }

  function updateProgress2(p) {
    prog2.style.width = p + '%';
    progLabel2.textContent = p >= 100 ? '思考完成 ✓' : '思考中 ' + p + '%';
  }

  setTimeout(typePhase2, 3000);
})();
