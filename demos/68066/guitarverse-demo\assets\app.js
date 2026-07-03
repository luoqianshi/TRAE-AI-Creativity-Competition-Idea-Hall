(function () {
  var chords = ["C", "G", "Am", "F", "Em", "D", "A7"];
  var pitches = ["E4", "G3", "C4", "A3", "D4", "B3", "F#4"];
  var feedback = [
    "第 2 拍略微提前，右手拨弦可以放松一些；当前 C 和弦整体稳定。",
    "左手食指按弦角度偏平，建议指尖更垂直，减少相邻弦杂音。",
    "节奏稳定性提升明显，下一轮可以尝试跟随 AI 伴奏完成副歌。",
    "当前和弦转换稍慢，建议提前半拍准备下一组手型。",
    "右手扫弦力度均匀，注意第 4 拍不要拖拍。"
  ];

  var heroChord = document.getElementById("heroChord");
  var heroPitch = document.getElementById("heroPitch");
  var heroBeat = document.getElementById("heroBeat");
  var pitch = document.getElementById("pitch");
  var chord = document.getElementById("chord");
  var bpm = document.getElementById("bpm");
  var leftScore = document.getElementById("leftScore");
  var rightScore = document.getElementById("rightScore");
  var rhythmScore = document.getElementById("rhythmScore");
  var leftMeter = document.getElementById("leftMeter");
  var rightMeter = document.getElementById("rightMeter");
  var rhythmMeter = document.getElementById("rhythmMeter");
  var feedbackText = document.getElementById("feedbackText");
  var captureBtn = document.getElementById("captureBtn");
  var particles = document.getElementById("particles");

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateRealtime() {
    var currentChord = chords[rand(0, chords.length - 1)];
    var currentPitch = pitches[rand(0, pitches.length - 1)];
    var left = rand(82, 97);
    var right = rand(78, 95);
    var rhythm = rand(80, 96);
    var beat = rand(86, 104);

    heroChord.textContent = currentChord;
    heroPitch.textContent = left + "%";
    heroBeat.textContent = rhythm + "%";
    pitch.textContent = currentPitch;
    chord.textContent = currentChord;
    bpm.textContent = beat + " BPM";
    leftScore.textContent = left + "%";
    rightScore.textContent = right + "%";
    rhythmScore.textContent = rhythm + "%";
    leftMeter.style.setProperty("--w", left + "%");
    rightMeter.style.setProperty("--w", right + "%");
    rhythmMeter.style.setProperty("--w", rhythm + "%");
    feedbackText.textContent = feedback[rand(0, feedback.length - 1)];
  }

  function buildParticles() {
    if (!particles) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 40; i += 1) {
      var node = document.createElement("span");
      node.className = "particle";
      node.style.setProperty("--x", rand(6, 94) + "%");
      node.style.setProperty("--y", rand(8, 88) + "%");
      node.style.setProperty("--s", rand(2, 6) + "px");
      node.style.setProperty("--d", rand(2600, 7600) + "ms");
      node.style.setProperty("--delay", "-" + rand(0, 4800) + "ms");
      frag.appendChild(node);
    }
    particles.appendChild(frag);
  }

  if (captureBtn) {
    captureBtn.addEventListener("click", function () {
      captureBtn.textContent = "捕捉中...";
      updateRealtime();
      setTimeout(function () {
        captureBtn.textContent = "重新捕捉";
      }, 650);
    });
  }

  setInterval(updateRealtime, 2600);
  buildParticles();

  var songs = [
    {
      title: "晴天 · 民谣入门",
      desc: "适合初学者练习基础开放和弦转换，AI 会重点检查左手换和弦速度与右手扫弦均匀度。",
      score: 89,
      bars: ["C", "G", "Am", "F", "C", "G", "F", "C"],
      active: 2,
      tip: "下一小节切换到 G 和弦，提前把无名指移动到 6 弦 3 品。"
    },
    {
      title: "夜空节拍 · 流行弹唱",
      desc: "适合练习流行歌曲常见分解节奏，系统会检测低音根音是否清晰、节拍是否贴合。",
      score: 92,
      bars: ["Em", "D", "C", "G", "Em", "D", "C", "D"],
      active: 4,
      tip: "当前分解节奏稳定，下一小节注意 D 和弦高音弦不要漏弹。"
    },
    {
      title: "Rock Loop · 摇滚练习",
      desc: "适合练习 Power Chord 与右手闷音，AI 会重点分析扫弦力度和弱拍控制。",
      score: 86,
      bars: ["A5", "A5", "D5", "E5", "A5", "D5", "E5", "A5"],
      active: 5,
      tip: "保持手腕放松，下一小节 E5 可略微加强重音，形成摇滚推进感。"
    }
  ];

  var songButtons = Array.prototype.slice.call(document.querySelectorAll(".song"));
  var songTitle = document.getElementById("songTitle");
  var songDesc = document.getElementById("songDesc");
  var songScore = document.getElementById("songScore");
  var songTip = document.getElementById("songTip");
  var timeline = document.getElementById("timeline");

  function renderSong(index) {
    var song = songs[index];
    songTitle.textContent = song.title;
    songDesc.textContent = song.desc;
    songScore.textContent = "当前评分 " + song.score;
    songTip.textContent = song.tip;
    timeline.innerHTML = "";

    song.bars.forEach(function (bar, i) {
      var item = document.createElement("div");
      item.className = "bar" + (i === song.active ? " active" : "");
      item.innerHTML = "<small>Bar " + (i + 1) + "</small><b>" + bar + "</b>";
      timeline.appendChild(item);
    });

    songButtons.forEach(function (button) {
      var selected = Number(button.getAttribute("data-song")) === index;
      button.classList.toggle("active", selected);
    });
  }

  songButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      renderSong(Number(button.getAttribute("data-song")));
    });
  });

  renderSong(0);
})();
