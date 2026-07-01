/* ============================================================
   互动示例 —— 每个 demo 把真实交互浓缩成可点击的迷你版
   每个函数签名：fn(host)  把 DOM 渲染进 host 并绑定事件
   ============================================================ */
(function () {
  const D = window.DEMO_DATA;

  /* ---------- 工具 ---------- */
  function speak(text, lang) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function audioBtn(word) {
    return `<button class="audio-btn" data-speak="${word}" title="播放发音">🔊</button>`;
  }
  // 事件委托：点击带 data-speak 的元素就发音
  function bindSpeak(host) {
    host.addEventListener("click", (e) => {
      const b = e.target.closest("[data-speak]");
      if (b) speak(b.getAttribute("data-speak"));
    });
  }

  const DEMOS = {};

  /* ========== 单词消消乐 ========== */
  DEMOS.match = function (host) {
    const pairs = D.match;
    const ens = shuffle(pairs.map((p, i) => ({ t: p.en, id: i })));
    const zhs = shuffle(pairs.map((p, i) => ({ t: p.zh, id: i })));
    host.innerHTML = `
      <div class="demo-stage">
        <div class="match-grid">
          <div class="match-col" id="colEn"></div>
          <div class="match-col" id="colZh"></div>
        </div>
      </div>
      <div class="demo-toolbar">
        <span class="d-progress" id="mProg">已消除 0 / ${pairs.length}</span>
        <span class="d-feedback" id="mFb"></span>
      </div>`;
    const colEn = host.querySelector("#colEn");
    const colZh = host.querySelector("#colZh");
    ens.forEach((o) => colEn.appendChild(cell(o, "en")));
    zhs.forEach((o) => colZh.appendChild(cell(o, "zh")));
    let sel = null, done = 0;
    function cell(o, side) {
      const d = document.createElement("div");
      d.className = "match-cell " + side;
      d.textContent = o.t;
      d.dataset.id = o.id;
      d.onclick = () => pick(d, side);
      return d;
    }
    function pick(d, side) {
      if (d.classList.contains("gone")) return;
      if (sel && sel.side === side) sel.el.classList.remove("sel");
      if (sel && sel.side !== side) {
        // 已选另一边 -> 判定
        if (sel.el.dataset.id === d.dataset.id) {
          sel.el.classList.add("gone"); d.classList.add("gone");
          sel.el.classList.remove("sel");
          done++;
          host.querySelector("#mProg").textContent = `已消除 ${done} / ${pairs.length}`;
          fb("配对成功！🎉", "ok");
          if (done === pairs.length) fb("全部消除，挑战成功！🏆", "ok");
          sel = null;
          return;
        } else {
          const a = sel.el, b = d;
          a.classList.add("err"); b.classList.add("err");
          fb("不匹配，再试试", "no");
          setTimeout(() => { a.classList.remove("err", "sel"); b.classList.remove("err"); }, 450);
          sel = null;
          return;
        }
      }
      d.classList.add("sel");
      sel = { el: d, side };
    }
    function fb(t, c) {
      const e = host.querySelector("#mFb");
      e.textContent = t; e.className = "d-feedback " + c;
    }
  };

  /* ========== 连词成句 ========== */
  DEMOS.sentence = function (host) {
    let idx = 0;
    host.innerHTML = `
      <div class="demo-stage">
        <div class="sent-target" id="sTarget"></div>
        <div class="sent-pool" id="sPool"></div>
      </div>
      <div class="demo-toolbar">
        <button class="d-btn" id="sSubmit">提交</button>
        <button class="d-btn sec" id="sReset">重置</button>
        <button class="d-btn sec" id="sNext">下一句 ›</button>
        <span class="d-feedback" id="sFb"></span>
      </div>`;
    const target = host.querySelector("#sTarget");
    const pool = host.querySelector("#sPool");
    const fb = host.querySelector("#sFb");
    function load() {
      const item = D.sentences[idx];
      target.className = "sent-target";
      target.innerHTML = ""; pool.innerHTML = ""; fb.textContent = "";
      shuffle(item.blocks).forEach((w) => {
        const c = document.createElement("div");
        c.className = "chip"; c.textContent = w;
        c.onclick = () => move(c);
        pool.appendChild(c);
      });
    }
    function move(c) {
      if (c.parentNode === pool) { c.classList.add("in-target"); target.appendChild(c); }
      else { c.classList.remove("in-target"); pool.appendChild(c); }
    }
    host.querySelector("#sSubmit").onclick = () => {
      const item = D.sentences[idx];
      const got = [...target.children].map((c) => c.textContent).join(" ");
      if (got === item.answer) {
        target.className = "sent-target ok";
        fb.textContent = "✓ 正确！「" + item.zh + "」"; fb.className = "d-feedback ok";
        speak(item.answer);
      } else {
        target.className = "sent-target no";
        fb.textContent = "✗ 语序不对，再调整一下"; fb.className = "d-feedback no";
        setTimeout(load, 1400);
      }
    };
    host.querySelector("#sReset").onclick = load;
    host.querySelector("#sNext").onclick = () => { idx = (idx + 1) % D.sentences.length; load(); };
    load();
  };

  /* ========== 看图选单词 ========== */
  DEMOS.picture = function (host) {
    let idx = 0;
    host.innerHTML = `
      <div class="demo-stage pic-stage">
        <span class="d-progress" id="pProg"></span>
        <div class="pic-frame" id="pFrame"></div>
        <div class="pic-mean" id="pMean"></div>
        <div class="pic-options" id="pOpts"></div>
      </div>`;
    function load() {
      const it = D.picture[idx];
      host.querySelector("#pProg").textContent = `${idx + 1} / ${D.picture.length}`;
      const frame = host.querySelector("#pFrame");
      frame.style.background = it.bg; frame.textContent = it.emoji;
      host.querySelector("#pMean").textContent = "";
      const opts = host.querySelector("#pOpts");
      opts.innerHTML = "";
      shuffle(it.opts).forEach((w) => {
        const b = document.createElement("button");
        b.className = "pic-opt"; b.textContent = w;
        b.onclick = () => choose(b, w, it, opts);
        opts.appendChild(b);
      });
    }
    function choose(b, w, it, opts) {
      [...opts.children].forEach((o) => o.classList.add("lock"));
      if (w === it.answer) {
        b.classList.add("ok");
        host.querySelector("#pMean").textContent = `${it.answer} — ${it.zh}`;
        speak(it.answer);
      } else {
        b.classList.add("no");
        [...opts.children].forEach((o) => { if (o.textContent === it.answer) o.classList.add("ok"); });
        host.querySelector("#pMean").textContent = `正确答案：${it.answer} — ${it.zh}`;
      }
      setTimeout(() => { idx = (idx + 1) % D.picture.length; load(); }, 1600);
    }
    load();
  };

  /* ========== 选词生文 ========== */
  DEMOS.genText = function (host) {
    const selected = new Set(D.genWords);
    host.innerHTML = `
      <div class="demo-stage">
        <div style="font-size:14px;color:#6e6e73;margin-bottom:8px;">选择想用到的单词（已默认全选）：</div>
        <div class="gen-words" id="gWords"></div>
        <div class="gen-out" id="gOut">点击下方按钮，AI 会用你选中的单词生成一段小短文…</div>
      </div>
      <div class="demo-toolbar">
        <button class="d-btn" id="gGo">✨ AI 生成短文</button>
        <span class="d-feedback" id="gFb"></span>
      </div>`;
    const wrap = host.querySelector("#gWords");
    D.genWords.forEach((w) => {
      const b = document.createElement("button");
      b.className = "gen-word on"; b.textContent = w;
      b.onclick = () => { b.classList.toggle("on"); b.classList.contains("on") ? selected.add(w) : selected.delete(w); };
      wrap.appendChild(b);
    });
    host.querySelector("#gGo").onclick = () => {
      const out = host.querySelector("#gOut");
      // 用模板生成，命中选中词高亮
      const html = D.genTemplate.replace(/\{(\w+)\}/g, (m, key) => {
        const hit = [...selected].find((w) => w.toLowerCase().startsWith(key.toLowerCase()) || key.toLowerCase().startsWith(w.toLowerCase()));
        return `<span class="hl">${hit || key}</span>`;
      });
      typewriter(out, html);
    };
    function typewriter(node, html) {
      node.classList.add("cursor");
      // 拆成 token：标签整体 + 单字符
      const tokens = html.match(/<[^>]+>|[\s\S]/g) || [];
      node.innerHTML = ""; let i = 0; let buf = "";
      (function tick() {
        if (i >= tokens.length) { node.classList.remove("cursor"); return; }
        buf += tokens[i++]; node.innerHTML = buf;
        setTimeout(tick, tokens[i - 1].length > 1 ? 0 : 22);
      })();
    }
  };

  /* ========== 通用 YES/NO 检测（学前检测 / 完美结案） ========== */
  function ynDemo(host, words, opts) {
    opts = opts || {};
    host.innerHTML = `
      <div class="demo-stage">
        <div style="font-size:14px;color:#6e6e73;margin-bottom:12px;">${opts.hint || "认识就点 YES，不认识点 NO："}</div>
        <div id="ynList"></div>
      </div>
      <div class="demo-toolbar">
        <span class="d-progress" id="ynStat">Yes 0 · No 0</span>
        <button class="d-btn" id="ynDone">${opts.btn || "完成检测"}</button>
        <span class="d-feedback" id="ynFb"></span>
      </div>`;
    const list = host.querySelector("#ynList");
    const state = {};
    words.forEach((w, i) => {
      const row = document.createElement("div");
      row.className = "yn-row";
      row.innerHTML = `
        <div class="yn-word"><b>${w.word}</b><span>${w.ipa || ""}</span><em>${w.zh}</em></div>
        <div class="yn-btns">
          <button class="yes" data-i="${i}" data-v="yes">YES</button>
          <button class="no" data-i="${i}" data-v="no">NO</button>
        </div>`;
      list.appendChild(row);
    });
    list.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const i = b.dataset.i, v = b.dataset.v;
      state[i] = state[i] === v ? null : v;
      const grp = b.parentNode;
      grp.querySelector(".yes").classList.toggle("on", state[i] === "yes");
      grp.querySelector(".no").classList.toggle("on", state[i] === "no");
      const yes = Object.values(state).filter((x) => x === "yes").length;
      const no = Object.values(state).filter((x) => x === "no").length;
      host.querySelector("#ynStat").textContent = `Yes ${yes} · No ${no}`;
    });
    host.querySelector("#ynDone").onclick = () => {
      const marked = Object.values(state).filter(Boolean).length;
      const fb = host.querySelector("#ynFb");
      if (marked < words.length) { fb.textContent = `还有 ${words.length - marked} 个未标记`; fb.className = "d-feedback no"; return; }
      const no = Object.values(state).filter((x) => x === "no").length;
      if (no === 0) { fb.textContent = "全部掌握，无需学习新词 🎉"; fb.className = "d-feedback ok"; }
      else { fb.textContent = `已挑出 ${no} 个生词，进入学习环节 →`; fb.className = "d-feedback ok"; }
    };
  }
  DEMOS.pretest = (host) => ynDemo(host, D.pretest, { hint: "逐个判断你是否认识，系统据此挑出生词：", btn: "完成检测" });
  DEMOS.finalCase = (host) => ynDemo(host, shuffle(D.trainWords), { hint: "全单元综测，所有单词打乱重测，全部标记后达标过关：", btn: "提交综测" });

  /* ========== 全能侦探（三态词卡） ========== */
  DEMOS.detective = function (host) {
    let idx = 0, step = 0; // 0 单词 / 1 +音标 / 2 +释义 / 3 隐藏
    host.innerHTML = `
      <div class="demo-stage">
        <div class="wcard" id="wc">
          <div class="w-word" id="wWord"></div>
          <div class="w-ipa" id="wIpa"></div>
          <div class="w-zh" id="wZh"></div>
          <div class="w-tip" id="wTip">看字形先自己读，点击卡片逐步揭晓</div>
        </div>
      </div>
      <div class="demo-toolbar">
        ${audioBtn("")}<span style="flex:1"></span>
        <button class="d-btn sec" id="wPrev">‹ 上一个</button>
        <span class="d-progress" id="wProg"></span>
        <button class="d-btn" id="wNext">下一个 ›</button>
      </div>`;
    const wc = host.querySelector("#wc");
    const elW = host.querySelector("#wWord"), elI = host.querySelector("#wIpa"),
      elZ = host.querySelector("#wZh"), elT = host.querySelector("#wTip");
    function render() {
      const w = D.trainWords[idx];
      host.querySelector("[data-speak]").setAttribute("data-speak", w.word);
      host.querySelector("#wProg").textContent = `${idx + 1} / ${D.trainWords.length}`;
      wc.classList.toggle("active", step > 0 && step < 3);
      elW.textContent = w.word;
      elW.style.opacity = step === 3 ? 0 : 1;
      elI.textContent = step >= 1 && step < 3 ? w.ipa : "";
      elZ.textContent = step === 2 ? w.zh : "";
      elT.textContent = ["看字形先自己读，点击卡片揭晓音标", "再点一下显示中文释义", "再点一下进入盲测（隐藏）", "盲测中：再点恢复"][step];
    }
    wc.onclick = () => { step = (step + 1) % 4; if (step === 1) speak(D.trainWords[idx].word); render(); };
    host.querySelector("#wNext").onclick = () => { idx = (idx + 1) % D.trainWords.length; step = 0; render(); };
    host.querySelector("#wPrev").onclick = () => { idx = (idx - 1 + D.trainWords.length) % D.trainWords.length; step = 0; render(); };
    render();
  };

  /* ========== 黄金三秒（限时秒答中文） ========== */
  DEMOS.speed = function (host) {
    let idx = 0, timer = null, locked = false;
    host.innerHTML = `
      <div class="demo-stage" style="text-align:center;">
        <div style="height:6px;background:#ececf0;border-radius:980px;overflow:hidden;margin-bottom:18px;">
          <div id="spBar" style="height:100%;background:#1283F3;width:100%;transition:width .1s linear;"></div>
        </div>
        <div class="quiz-q"><span class="qword" id="spWord"></span></div>
        <div style="font-size:13px;color:#86868b;">3 秒内选出中文意思</div>
        <div class="quiz-opts" id="spOpts"></div>
      </div>
      <div class="demo-toolbar"><span class="d-progress" id="spProg"></span><span class="d-feedback" id="spFb"></span></div>`;
    function load() {
      clearInterval(timer); locked = false;
      const it = D.speed[idx];
      host.querySelector("#spWord").textContent = it.word;
      host.querySelector("#spProg").textContent = `${idx + 1} / ${D.speed.length}`;
      host.querySelector("#spFb").textContent = "";
      speak(it.word);
      const opts = host.querySelector("#spOpts"); opts.innerHTML = "";
      shuffle(it.opts).forEach((o) => {
        const b = document.createElement("button");
        b.className = "quiz-opt"; b.textContent = o;
        b.onclick = () => answer(b, o, it);
        opts.appendChild(b);
      });
      // 计时
      const bar = host.querySelector("#spBar"); let t = 3000; bar.style.width = "100%";
      const t0 = t;
      timer = setInterval(() => {
        t -= 100; bar.style.width = Math.max(0, (t / t0) * 100) + "%";
        if (t <= 0) { clearInterval(timer); if (!locked) timeout(it); }
      }, 100);
    }
    function answer(b, o, it) {
      if (locked) return; locked = true; clearInterval(timer);
      const fb = host.querySelector("#spFb");
      if (o === it.zh) { b.classList.add("ok"); fb.textContent = "✓ 秒答正确！"; fb.className = "d-feedback ok"; }
      else { b.classList.add("no"); markRight(it); fb.textContent = `✗ 应为「${it.zh}」`; fb.className = "d-feedback no"; }
      next();
    }
    function timeout(it) {
      locked = true; markRight(it);
      const fb = host.querySelector("#spFb"); fb.textContent = `⏱ 超时！应为「${it.zh}」`; fb.className = "d-feedback no";
      next();
    }
    function markRight(it) {
      [...host.querySelectorAll("#spOpts .quiz-opt")].forEach((b) => { if (b.textContent === it.zh) b.classList.add("ok"); });
    }
    function next() { setTimeout(() => { idx = (idx + 1) % D.speed.length; load(); }, 1500); }
    load();
  };

  /* ========== 盲盒听力（听音选词） ========== */
  DEMOS.listening = function (host) {
    let idx = 0, locked = false;
    host.innerHTML = `
      <div class="demo-stage" style="text-align:center;">
        <div style="font-size:64px;">🙈</div>
        <div style="font-size:14px;color:#6e6e73;margin:6px 0 16px;">捂眼听声音，脱稿磨耳朵 —— 听发音，选出正确的单词</div>
        <button class="d-btn" id="lsPlay">🔊 播放发音</button>
        <div class="quiz-opts" id="lsOpts" style="max-width:360px;margin:18px auto 0;"></div>
      </div>
      <div class="demo-toolbar"><span class="d-progress" id="lsProg"></span><span class="d-feedback" id="lsFb"></span></div>`;
    function load() {
      locked = false;
      const it = D.listening[idx];
      host.querySelector("#lsProg").textContent = `${idx + 1} / ${D.listening.length}`;
      host.querySelector("#lsFb").textContent = "";
      const opts = host.querySelector("#lsOpts"); opts.innerHTML = "";
      shuffle(it.opts).forEach((o) => {
        const b = document.createElement("button");
        b.className = "quiz-opt"; b.textContent = o;
        b.onclick = () => answer(b, o, it);
        opts.appendChild(b);
      });
      setTimeout(() => speak(it.word), 300);
    }
    host.querySelector("#lsPlay").onclick = () => speak(D.listening[idx].word);
    function answer(b, o, it) {
      if (locked) return; locked = true;
      const fb = host.querySelector("#lsFb");
      if (o === it.word) { b.classList.add("ok"); fb.textContent = `✓ 正确！${it.word} — ${it.zh}`; fb.className = "d-feedback ok"; }
      else {
        b.classList.add("no");
        [...host.querySelectorAll("#lsOpts .quiz-opt")].forEach((x) => { if (x.textContent === it.word) x.classList.add("ok"); });
        fb.textContent = `✗ 应为「${it.word}」`; fb.className = "d-feedback no";
      }
      setTimeout(() => { idx = (idx + 1) % D.listening.length; load(); }, 1600);
    }
    load();
  };

  /* ========== 能力测试（词力定标） ========== */
  DEMOS.ability = function (host) {
    let idx = 0, correct = 0, locked = false;
    host.innerHTML = `<div id="abWrap"></div>`;
    function question() {
      locked = false;
      const it = D.abilityQuiz[idx];
      host.querySelector("#abWrap").innerHTML = `
        <div class="demo-stage">
          <span class="d-progress">第 ${idx + 1} / ${D.abilityQuiz.length} 题</span>
          <div class="quiz-q" style="margin-top:14px;">${it.q.replace(it.word, `<span class="qword">${it.word}</span>`)}</div>
          <div class="quiz-opts" id="abOpts"></div>
        </div>`;
      const opts = host.querySelector("#abOpts");
      it.opts.forEach((o, i) => {
        const b = document.createElement("button");
        b.className = "quiz-opt"; b.textContent = o;
        b.onclick = () => answer(b, i, it);
        opts.appendChild(b);
      });
      speak(it.word);
    }
    function answer(b, i, it) {
      if (locked) return; locked = true;
      const opts = [...host.querySelectorAll("#abOpts .quiz-opt")];
      if (i === it.answer) { b.classList.add("ok"); correct++; }
      else { b.classList.add("no"); opts[it.answer].classList.add("ok"); }
      setTimeout(() => { idx++; idx < D.abilityQuiz.length ? question() : report(); }, 1100);
    }
    function report() {
      const levels = ["A1", "A1", "A2", "B1", "B2", "C1"];
      const lv = levels[correct];
      const colors = { A1: "#2ecc71", A2: "#1283F3", B1: "#e67e22", B2: "#e74c3c", C1: "#9b59b6" };
      const vocab = 800 + correct * 950;
      host.querySelector("#abWrap").innerHTML = `
        <div class="demo-stage">
          <div class="cefr-result">
            <div style="color:#6e6e73;font-size:14px;">预估词汇量</div>
            <div class="big">${vocab.toLocaleString()}</div>
            <div class="cefr-badge" style="background:${colors[lv]}">CEFR ${lv}</div>
          </div>
          <div class="cefr-bars" id="abBars"></div>
          <p style="font-size:14px;color:#6e6e73;margin-top:18px;line-height:1.7;">
            根据自适应作答，系统为你定标到 <b>${lv}</b> 等级，并生成专属能力画像与 AI 学习建议报告。
          </p>
        </div>`;
      const bars = [["A1", 95], ["A2", 88], ["B1", 70], ["B2", 45], ["C1", 22]];
      const wrap = host.querySelector("#abBars");
      bars.forEach(([l, v], i) => {
        const reached = levels.indexOf(l) <= correct;
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<span class="lv" style="color:${colors[l]}">${l}</span>
          <div class="track"><div class="fill" style="background:${colors[l]}"></div></div>
          <span style="width:42px;font-size:13px;color:#6e6e73;">${reached ? v : Math.round(v * .4)}%</span>`;
        wrap.appendChild(row);
        setTimeout(() => { row.querySelector(".fill").style.width = (reached ? v : Math.round(v * .4)) + "%"; }, 100 + i * 120);
      });
    }
    question();
  };

  /* ========== AI 对话陪练 ========== */
  DEMOS.aiChat = function (host) {
    host.innerHTML = `
      <div class="demo-stage" style="padding:18px;">
        <div class="chat-win" id="chatWin"></div>
        <div class="chat-quick" id="chatQuick"></div>
        <div class="chat-input">
          <input id="chatIn" placeholder="用英文输入你想说的…" />
          <button class="d-btn" id="chatSend">发送</button>
        </div>
      </div>`;
    const win = host.querySelector("#chatWin");
    add("ai", D.chat.greet);
    const quick = host.querySelector("#chatQuick");
    D.chat.quick.forEach((q) => {
      const b = document.createElement("button"); b.textContent = q;
      b.onclick = () => send(q); quick.appendChild(b);
    });
    function add(who, text) {
      const b = document.createElement("div"); b.className = "bubble " + who; b.textContent = text;
      win.appendChild(b); win.scrollTop = win.scrollHeight; return b;
    }
    function send(text) {
      const v = (text || host.querySelector("#chatIn").value).trim(); if (!v) return;
      host.querySelector("#chatIn").value = "";
      add("me", v);
      const typing = add("ai", ""); typing.classList.add("typing");
      typing.innerHTML = "<span></span><span></span><span></span>";
      setTimeout(() => {
        const key = v.toLowerCase().replace(/[?.!]/g, "").trim();
        const reply = D.chat.replies[v.toLowerCase()] || D.chat.replies[key] || D.chat.replies._default;
        typing.classList.remove("typing"); typing.textContent = reply;
        win.scrollTop = win.scrollHeight; speak(reply.replace(/[^\x00-\x7F]+/g, " "));
      }, 900);
    }
    host.querySelector("#chatSend").onclick = () => send();
    host.querySelector("#chatIn").addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  };

  /* ========== AI 作文批改 ========== */
  DEMOS.aiEssay = function (host) {
    const e = D.essay;
    host.innerHTML = `
      <div class="demo-stage">
        <div style="font-weight:600;font-size:17px;margin-bottom:10px;">📝 ${e.title}</div>
        <div class="essay-text" id="essayText"></div>
        <div class="demo-toolbar">
          <button class="d-btn" id="essayGo">✨ 开始 AI 批改</button>
          <span class="d-feedback" id="essayFb"></span>
        </div>
        <div id="essayReport"></div>
      </div>`;
    const text = host.querySelector("#essayText");
    function renderText(fixed) {
      text.innerHTML = e.parts.map((p) => {
        if (p.t) return p.t;
        if (p.good) return fixed ? `<span class="fix">${p.good}</span>` : p.good;
        if (p.err) return fixed ? `<span class="fix">${p.fix}</span>` : `<span class="err" title="${p.note}">${p.err}</span>`;
        return "";
      }).join("");
    }
    renderText(false);
    host.querySelector("#essayGo").onclick = () => {
      renderText(true);
      host.querySelector("#essayFb").textContent = "批改完成，已标出修改建议";
      host.querySelector("#essayFb").className = "d-feedback ok";
      const rep = host.querySelector("#essayReport");
      rep.innerHTML = `
        <div class="essay-score">
          <div class="ring" style="--p:${e.score}%"><i>${e.score}</i></div>
          <div style="font-size:14px;color:#6e6e73;line-height:1.6;">${e.summary}</div>
        </div>
        <div class="essay-cards"></div>`;
      const cards = rep.querySelector(".essay-cards");
      e.parts.filter((p) => p.err).forEach((p) => {
        const c = document.createElement("div"); c.className = "essay-card";
        c.innerHTML = `<b>${p.err}</b><span class="arrow2">→</span><span class="good">${p.fix}</span><div style="margin-top:6px;color:#6e6e73;">${p.note}</div>`;
        cards.appendChild(c);
      });
      const ring = rep.querySelector(".ring");
      ring.style.setProperty("--p", "0%");
      setTimeout(() => { ring.style.transition = "background 1.1s ease"; ring.style.setProperty("--p", e.score + "%"); }, 60);
    };
  };

  /* ========== 绘本阅读 ========== */
  function bookReader(host, pages) {
    let i = 0;
    host.innerHTML = `
      <div class="book">
        <div class="book-page" id="bkPage"></div>
        <div class="book-nav">
          <button class="d-btn sec" id="bkPrev">‹ 上一页</button>
          <div class="book-dots" id="bkDots"></div>
          <button class="d-btn" id="bkNext">下一页 ›</button>
        </div>
      </div>`;
    const page = host.querySelector("#bkPage");
    const dots = host.querySelector("#bkDots");
    pages.forEach(() => { const d = document.createElement("i"); dots.appendChild(d); });
    function render() {
      const p = pages[i];
      const en = p.en.map((x) => (typeof x === "string" ? x : `<span class="hl">${x.hl}</span>`)).join("");
      const plain = p.en.map((x) => (typeof x === "string" ? x : x.hl)).join("");
      page.classList.remove("flip"); void page.offsetWidth; page.classList.add("flip");
      page.innerHTML = `
        <div class="book-illus" style="background:${p.bg}">${p.emoji}</div>
        <div class="book-content">
          <div class="en">${en} ${audioBtn(plain)}</div>
          <div class="zh">${p.zh}</div>
        </div>`;
      [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
      speak(plain);
    }
    host.querySelector("#bkNext").onclick = () => { i = (i + 1) % pages.length; render(); };
    host.querySelector("#bkPrev").onclick = () => { i = (i - 1 + pages.length) % pages.length; render(); };
    render();
  }
  DEMOS.storybook = (host) => bookReader(host, D.storybook);

  /* ========== AI 生成绘本（生成动画 → 阅读） ========== */
  DEMOS.aiBookGen = function (host) {
    host.innerHTML = `
      <div class="demo-stage" id="genStage" style="text-align:center;">
        <div style="font-size:14px;color:#6e6e73;margin-bottom:10px;">用本单元的核心单词，一键生成专属绘本</div>
        <div class="gen-words" style="justify-content:center;">
          ${D.storybook.map((p) => `<span class="gen-word on">${typeof p.en[1] === "object" ? p.en[1].hl : ""}</span>`).join("")}
        </div>
        <button class="d-btn" id="genBtn" style="margin-top:20px;">✨ 生成绘本</button>
        <div id="genStatus" style="margin-top:18px;font-size:15px;color:#1283F3;font-weight:600;min-height:24px;"></div>
      </div>
      <div id="bookHost"></div>`;
    host.querySelector("#genBtn").onclick = () => {
      const btn = host.querySelector("#genBtn"); btn.disabled = true;
      const st = host.querySelector("#genStatus");
      const steps = ["⏳ 排队中…", "🎨 AI 绘制插画中…", "✍️ 编写故事文本中…", "✅ 绘本生成完成！"];
      let k = 0;
      (function run() {
        st.textContent = steps[k];
        if (k === steps.length - 1) {
          setTimeout(() => { host.querySelector("#genStage").style.display = "none"; bookReader(host.querySelector("#bookHost"), D.storybook); }, 700);
          return;
        }
        k++; setTimeout(run, 1100);
      })();
    };
  };

  window.DEMOS = DEMOS;
  window.__bindSpeak = bindSpeak;
})();
