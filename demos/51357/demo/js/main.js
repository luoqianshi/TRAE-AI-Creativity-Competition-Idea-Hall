/* ============================================================
   主逻辑：模块配置 → 渲染章节/卡片 → 弹窗 → 滚动动画
   ============================================================ */
(function () {
  /* ---------- 静态界面预览（教师端 / 教材库 / 报告等）---------- */
  const MOCK = {
    cefrReport: `
      <div class="demo-stage">
        <div class="cefr-result">
          <div style="color:#6e6e73;font-size:14px;">本次词汇量</div>
          <div class="big">3,650</div>
          <div class="cefr-badge" style="background:#e67e22">CEFR B1</div>
        </div>
        <div class="cefr-bars">
          ${[["A1", "#2ecc71", 96], ["A2", "#1283F3", 90], ["B1", "#e67e22", 72], ["B2", "#e74c3c", 38], ["C1", "#9b59b6", 15]]
        .map(([l, c, v]) => `<div class="row"><span class="lv" style="color:${c}">${l}</span><div class="track"><div class="fill" style="width:${v}%;background:${c}"></div></div><span style="width:42px;font-size:13px;color:#6e6e73">${v}%</span></div>`).join("")}
        </div>
        <p style="font-size:14px;color:#6e6e73;margin-top:16px;line-height:1.7;">📊 含词汇量大数字、CEFR 等级徽章、各等级表现进度、能力画像雷达图与专属 AI 分析报告。</p>
      </div>`,
    wordList: `
      <div class="demo-stage">
        <div class="mock">
          ${[["apple", "/ˈæpl/", "苹果", "已掌握", "#2ecc71"], ["banana", "/bəˈnɑːnə/", "香蕉", "学习中", "#1283F3"], ["elephant", "/ˈelɪfənt/", "大象", "未掌握", "#e74c3c"], ["computer", "/kəmˈpjuːtər/", "计算机", "未掌握", "#e74c3c"]]
        .map(([w, p, z, s, c]) => `<div class="mock-row"><div class="av" style="background:#e8f3ff">🔤</div><div class="info"><b>${w}</b> <span style="color:#86868b;font-family:Arial;font-size:13px">${p}</span><small>${z}</small></div><span class="pill" style="background:${c}1a;color:${c}">${s}</span></div>`).join("")}
        </div>
        <p style="font-size:13px;color:#86868b;margin-top:12px;">按教材单元加载单词，标注掌握状态，支持拼读、拓展、自然拼读拆音节。</p>
      </div>`,
    afterCheck: `
      <div class="demo-stage" style="text-align:center;">
        <div style="font-size:54px;">🏅</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">课后检测 · 达标</div>
        <div class="stat-cards" style="margin-top:18px;">
          <div class="stat-card" style="background:#e1f3d8"><div class="n" style="color:#00b96b">18</div><div class="t" style="color:#00b96b">已掌握</div></div>
          <div class="stat-card" style="background:#fdf6ec"><div class="n" style="color:#e6a23c">2</div><div class="t" style="color:#e6a23c">需复习</div></div>
          <div class="stat-card" style="background:#eef2ff"><div class="n" style="color:#5c6ac4">90%</div><div class="t" style="color:#5c6ac4">正确率</div></div>
        </div>
        <p style="font-size:13px;color:#86868b;margin-top:16px;">检测结果回传后端，未掌握单词自动进入抗遗忘复习计划。</p>
      </div>`,
    starter: `
      <div class="demo-stage" style="text-align:center;">
        <div class="book" style="max-width:420px;margin:0 auto;">
          <div class="book-page" style="grid-template-columns:1fr;">
            <div class="book-illus" style="background:#FFF3E0;font-size:80px;padding:24px 0;">🐤</div>
            <div class="book-content" style="text-align:center;">
              <div class="en">A <span class="hl">duck</span>. Quack, quack!</div>
              <div class="zh">一只鸭子。嘎，嘎！</div>
            </div>
          </div>
        </div>
        <p style="font-size:13px;color:#86868b;margin-top:14px;">启蒙绘本（Starter）：超大插画 + 极简句式 + 自然拼读，专为零基础低龄学习者设计。</p>
      </div>`,
    exportPdf: `
      <div class="demo-stage" style="text-align:center;">
        <div style="display:inline-flex;gap:14px;flex-wrap:wrap;justify-content:center;">
          ${["🖼️ 封面", "📖 内文", "🔤 单词表", "📄 PDF"].map((t, i) => `<div style="width:90px;height:120px;background:#fff;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.1);display:grid;place-items:center;font-size:13px;color:#6e6e73;transform:rotate(${i % 2 ? 3 : -3}deg);">${t}</div>`).join("")}
        </div>
        <p style="font-size:13px;color:#86868b;margin-top:20px;">一键将绘本导出为高清 PDF，支持打印成实体读物，配套单词表随行复习。</p>
      </div>`,
    teacherCal: `
      <div class="demo-stage">
        <div class="mock-cal">
          ${["一", "二", "三", "四", "五", "六", "日"].map((d) => `<div class="day head">${d}</div>`).join("")}
          ${[24, 25, 26, 27, 28, 29, 30].map((n) => {
          const cls = n === 28 ? "day today" : [26, 29].includes(n) ? "day busy" : "day";
          return `<div class="${cls}">${n}</div>`;
        }).join("")}
        </div>
        <div class="mock" style="margin-top:14px;">
          <div class="mock-row"><div class="av" style="background:#e1f3d8">📅</div><div class="info"><b>09:00 正课 · 小明</b><small>抗遗忘训练 · Unit 3</small></div><span class="pill" style="background:#e8f3ff;color:#1283F3">可进入</span></div>
          <div class="mock-row"><div class="av" style="background:#fdf6ec">🕒</div><div class="info"><b>空闲时间已上传</b><small>本周可约 12 个时段</small></div><span class="pill" style="background:#fdf6ec;color:#e6a23c">待预约</span></div>
        </div>
      </div>`,
    students: `
      <div class="demo-stage">
        <div class="mock">
          ${[["小明", "男", "三年级 · 剩 24 课时", "#ecf5ff", "#409eff", "👦"], ["朵朵", "女", "一年级 · 剩 36 课时", "#ffeef5", "#ff6b9b", "👧"], ["Leo", "男", "五年级 · 剩 12 课时", "#ecf5ff", "#409eff", "🧒"]]
        .map(([n, g, info, bg, c, e]) => `<div class="mock-row"><div class="av" style="background:${bg}">${e}</div><div class="info"><b>${n}</b> <span class="pill" style="background:${bg};color:${c};font-size:11px">${g}</span><small>${info}</small></div><span class="pill" style="background:#e8f3ff;color:#1283F3">排课</span></div>`).join("")}
        </div>
        <p style="font-size:13px;color:#86868b;margin-top:12px;">学员列表、课程表、学习进度、陪练记录一站式管理。</p>
      </div>`,
    records: `
      <div class="demo-stage">
        <div class="stat-cards">
          <div class="stat-card" style="background:#e1f3d8"><div class="n" style="color:#00b96b">6</div><div class="t" style="color:#00b96b">体验课</div></div>
          <div class="stat-card" style="background:#eef2ff"><div class="n" style="color:#5c6ac4">128h</div><div class="t" style="color:#5c6ac4">累计时长</div></div>
          <div class="stat-card" style="background:#fdf6ec"><div class="n" style="color:#e6a23c">96</div><div class="t" style="color:#e6a23c">总课数</div></div>
          <div class="stat-card" style="background:#f4ecf8"><div class="n" style="color:#8e44ad">¥3.2k</div><div class="t" style="color:#8e44ad">佣金</div></div>
        </div>
        <div class="mock" style="margin-top:14px;">
          <div class="mock-row"><div class="av" style="background:#e1f3d8">📝</div><div class="info"><b>正课记录 · 小明</b><small>Unit 3 · 45min · 已生成学习诊断单</small></div><span class="pill" style="background:#e8f3ff;color:#1283F3">复习</span></div>
          <div class="mock-row"><div class="av" style="background:#fdf6ec">🔁</div><div class="info"><b>抗遗忘记录 · 朵朵</b><small>第 2 轮复习 · 30min</small></div><span class="pill" style="background:#fdf6ec;color:#e6a23c">评价</span></div>
        </div>
      </div>`,
    material: `
      <div class="demo-stage">
        <div class="tree">
          <div class="node">📁 人教版 PEP</div>
          <div class="node lv2">📂 三年级上册</div>
          <div class="node lv3">📄 Unit 1 · Hello! （32 词）</div>
          <div class="node lv3">📄 Unit 2 · Colours （28 词）</div>
          <div class="node lv2">📂 三年级下册</div>
          <div class="node">📁 外研版 / 剑桥 / 牛津 …</div>
        </div>
        <p style="font-size:13px;color:#86868b;margin-top:12px;">树形分类管理教材，支持封面上传、Excel 批量导入词库、教材详情与内容维护。</p>
      </div>`,
  };

  /* ---------- 模块配置 ---------- */
  const G = {
    student: "linear-gradient(135deg,#ff6a88,#ff99ac)",
    words: "linear-gradient(135deg,#9b6cd1,#7b5cc4)",
    train: "linear-gradient(135deg,#0ea5a0,#3bb78f)",
    book: "linear-gradient(135deg,#2a7bd6,#5ea3db)",
    ai: "linear-gradient(135deg,#9b59b6,#d56fae)",
    teacher: "linear-gradient(135deg,#1283F3,#0a64d8)",
    material: "linear-gradient(135deg,#e67e22,#f39c12)",
  };
  const T = {
    student: "#ffe3ea", words: "#efe6fb", train: "#dcf6ef",
    book: "#e3f0fb", ai: "#f6e6f2", teacher: "#e8f3ff", material: "#fdeede",
  };

  const MODULES = [
    { tier: "一 · 学生端", tierDesc: "把枯燥的背单词，变成一关关想通关的游戏。" },
    {
      id: "student", grad: G.student, tint: T.student, icon: "🎯",
      title: "首页 · 学习中心", en: "Learning Center",
      tagline: "从一次能力测试开始，为每个孩子定标专属起点。",
      cards: [
        { icon: "📐", title: "能力测试 · 词力定标", en: "Vocabulary Calibration", desc: "自适应词汇测评，精准定位 CEFR 等级。", demo: "ability", badge: "play",
          modalDesc: "通过自适应出题快速定位词汇量与 CEFR 等级，为后续学习路径定标。下面这道迷你测评，做完会生成你的等级与能力画像。",
          features: ["自适应难度，越答越准", "输出词汇量估算与 CEFR（A1–C2）等级", "生成能力画像与 AI 学习建议"] },
        { icon: "📊", title: "能力测试报告", en: "Ability Report", desc: "词汇量、等级、画像与 AI 分析一图看懂。", static: MOCK.cefrReport, badge: "view",
          modalDesc: "报告中心沉淀每一次测评，用大数字、等级徽章、进度条与雷达图直观呈现成长曲线。",
          features: ["词汇量大数字 + CEFR 徽章", "各等级掌握度进度条", "Markdown 渲染的专属 AI 分析"] },
      ],
    },
    {
      id: "words", grad: G.words, tint: T.words, icon: "🎮",
      title: "单词学习", en: "Word Games",
      tagline: "四款单词游戏，让记忆在点击与拖拽间自然发生。",
      cards: [
        { icon: "🧩", title: "单词消消乐", en: "Word Match", desc: "英文与中文配对消除，越消越上头。", demo: "match", badge: "play",
          modalDesc: "左侧英文、右侧中文，点一点把它们配对消除。配对成功即时消失，错误则抖动提示。",
          features: ["左右配对消除玩法", "即时正误反馈与动画", "全部消除即挑战成功"] },
        { icon: "🔗", title: "连词成句", en: "Sentence Building", desc: "打乱的词块，拼出正确语序。", demo: "sentence", badge: "play",
          modalDesc: "把打乱的单词块按正确语序拼成句子，提交即判定，错误自动重置重练。",
          features: ["点击词块上下移动", "提交即时判定语序", "答对朗读整句强化语感"] },
        { icon: "🖼️", title: "看图选单词", en: "Picture Learning", desc: "看图选词，童趣启蒙。", demo: "picture", badge: "play",
          modalDesc: "看图片选出正确单词，答对显示释义并朗读，答错高亮正确答案，自动进入下一题。",
          features: ["图文对应记忆", "选错即时纠正", "自动连贯出题"] },
        { icon: "✍️", title: "选词生文", en: "Words to Text", desc: "挑几个单词，AI 编成小短文。", demo: "genText", badge: "play",
          modalDesc: "选择想巩固的单词，AI 即时把它们编织成一段连贯的小短文，让记忆有了上下文。",
          features: ["自由勾选目标单词", "AI 流式生成短文", "命中单词自动高亮"] },
      ],
    },
    {
      id: "train", grad: G.train, tint: T.train, icon: "🕵️",
      title: "单词训练", en: "Word Training",
      tagline: "七个环节闭环式训练：从识别到达标，一个都不放过。",
      cards: [
        { icon: "📋", title: "教材单词列表", en: "Word List", desc: "按单元加载，标注掌握状态。", static: MOCK.wordList, badge: "view",
          modalDesc: "按教材单元加载单词，标注掌握状态，并提供拼读、拓展、自然拼读拆音节。",
          features: ["按教材单元组织", "掌握状态一目了然", "拼读 / 拓展 / 拆音节"] },
        { icon: "🔍", title: "学前检测", en: "Pretest", desc: "先识别已掌握 / 未掌握单词。", demo: "pretest", badge: "play",
          modalDesc: "每 5 个一组，逐个判断认识与否。系统据此挑出生词，只学你不会的。",
          features: ["YES / NO 自评", "自动挑出生词", "已全部掌握则直接跳过"] },
        { icon: "🕵️", title: "全能侦探", en: "Detective", desc: "看字形猜发音，见词能读。", demo: "detective", badge: "play",
          modalDesc: "看到单词先自己读，点击卡片逐步揭晓音标、释义，再进入盲测，训练见词能读。",
          features: ["三态词卡逐步揭晓", "点击发音校准", "盲测巩固"] },
        { icon: "⚡", title: "黄金三秒", en: "Speed Memory", desc: "快速看词听音，秒答中文。", demo: "speed", badge: "play",
          modalDesc: "限时三秒看词秒答中文，训练条件反射式的快速提取。",
          features: ["3 秒倒计时", "听音 + 秒答中文", "超时自动揭晓答案"] },
        { icon: "🙈", title: "盲盒听力", en: "Listening", desc: "捂眼听声音，脱稿磨耳朵。", demo: "listening", badge: "play",
          modalDesc: "藏起单词，只靠耳朵听音辨词，脱离字幕磨练听力。",
          features: ["纯听力辨词", "可反复播放发音", "强化音义对应"] },
        { icon: "🏆", title: "完美结案", en: "Final Test", desc: "全单元综测，达标过关。", demo: "finalCase", badge: "play",
          modalDesc: "全单元单词打乱重测，必须全部标记后方可达标过关。",
          features: ["打乱顺序综合测", "未标记不可提交", "达标解锁后续内容"] },
        { icon: "✅", title: "课后检测", en: "After-class Check", desc: "结果回传，生成复习计划。", static: MOCK.afterCheck, badge: "view",
          modalDesc: "检测结果回传后端，未掌握单词自动编入抗遗忘复习计划。",
          features: ["掌握度统计", "正确率汇总", "未掌握词进入抗遗忘"] },
        { icon: "📚", title: "AI 生成绘本", en: "AI Storybook", desc: "用本单元单词，一键生成绘本。", demo: "aiBookGen", badge: "play",
          modalDesc: "体验课 / 启蒙课支持：用本单元核心单词一键生成专属绘本，学过的词立刻读进故事里。",
          features: ["一键生成插画 + 故事", "复用本单元核心单词", "生成即可翻页阅读"] },
      ],
    },
    {
      id: "book", grad: G.book, tint: T.book, icon: "📖",
      title: "绘本库 · 绘本课", en: "Storybooks",
      tagline: "让单词住进故事，让阅读看得见、读得出、带得走。",
      cards: [
        { icon: "📖", title: "普通绘本阅读", en: "Reading", desc: "翻页阅读，核心词高亮朗读。", demo: "storybook", badge: "play",
          modalDesc: "沉浸式翻页绘本，核心单词高亮，可逐句朗读，图文同步理解。",
          features: ["翻页阅读体验", "核心词高亮", "逐句点读发音"] },
        { icon: "🐤", title: "启蒙绘本（Starter）", en: "Starter Reading", desc: "超大插画 + 极简句式。", static: MOCK.starter, badge: "view",
          modalDesc: "为零基础低龄学习者设计：超大插画、极简句式、自然拼读引导。",
          features: ["低龄友好排版", "极简句式", "自然拼读引导"] },
        { icon: "🖨️", title: "绘本导出 / PDF 打印", en: "Export & Print", desc: "导出高清 PDF，打印成实体书。", static: MOCK.exportPdf, badge: "view",
          modalDesc: "一键导出高清 PDF，可打印成实体读物，配套单词表随行复习。",
          features: ["高清 PDF 导出", "可打印成册", "配套单词表"] },
      ],
    },
    {
      id: "ai", grad: G.ai, tint: T.ai, icon: "🤖",
      title: "AI 英语助手", en: "AI Assistant",
      tagline: "随时开口、随手批改 —— 一位 24 小时在线的英语伙伴。",
      cards: [
        { icon: "💬", title: "AI 对话陪练", en: "Speaking Partner", desc: "随时随地，用英文聊起来。", demo: "aiChat", badge: "play",
          modalDesc: "AI 对话陪练随时开聊，给出地道回应并引导你多说一句，敢开口才学得会。",
          features: ["自然语言对话", "推荐话题快捷开聊", "回应朗读 + 反问引导"] },
        { icon: "🖊️", title: "AI 作文批改", en: "Essay Grading", desc: "圈出问题，给出修改与评分。", demo: "aiEssay", badge: "play",
          modalDesc: "AI 逐句批改作文，标出错误、给出修改建议与评分，并附整体点评。",
          features: ["逐句标注错误", "给出修正与原因", "评分 + 整体点评"] },
      ],
    },

    { tier: "二 · 教师端", tierDesc: "陪练老师（含大学生兼职家教）的高效工作台。" },
    {
      id: "teacher", grad: G.teacher, tint: T.teacher, icon: "👩‍🏫",
      title: "教师工作台", en: "Teacher Console",
      tagline: "约课、排课、带学员、记陪练 —— 一个台子全搞定。",
      cards: [
        { icon: "📅", title: "预约课程", en: "Booking", desc: "上传空闲时间，学生在线预约。", static: MOCK.teacherCal, badge: "view",
          modalDesc: "查看学生预约、上传空闲时间、安排课程，约课流程一目了然。",
          features: ["查看学生预约", "上传空闲时段", "灵活安排课程"] },
        { icon: "🗓️", title: "课程表", en: "Schedule", desc: "日历视图 + 抗遗忘课程列表。", static: MOCK.teacherCal, badge: "view",
          modalDesc: "日历 / 列表双视图掌握每日课程，抗遗忘训练单独成列。",
          features: ["日历视图", "抗遗忘课程列表", "一键进入上课"] },
        { icon: "👨‍👩‍👧", title: "学员管理", en: "Students", desc: "学员列表、课表、进度、记录。", static: MOCK.students, badge: "view",
          modalDesc: "卡片式学员管理：列表、课程表、学习进度与陪练记录一站直达。",
          features: ["学员列表与档案", "学习进度跟踪", "陪练记录回看"] },
        { icon: "📒", title: "陪练记录", en: "Coaching Logs", desc: "正课 / 抗遗忘 / 体验反馈 / 诊断单。", static: MOCK.records, badge: "view",
          modalDesc: "统计卡片 + 记录列表，沉淀正课、抗遗忘、体验课反馈与学习诊断单。",
          features: ["正课 & 抗遗忘记录", "体验课情况反馈", "学习诊断单生成"] },
      ],
    },

    { tier: "三 · 教研 / 管理", tierDesc: "支撑全平台内容的教材中枢。" },
    {
      id: "material", grad: G.material, tint: T.material, icon: "🗂️",
      title: "教材库", en: "Material Library",
      tagline: "树形组织、批量导入，让每一本教材都可管理、可复用。",
      cards: [
        { icon: "🗂️", title: "教材列表", en: "Material List", desc: "树形分类，多版本教材统一管理。", static: MOCK.material, badge: "view",
          modalDesc: "树形分类目录组织各版本教材，支持搜索、新建类型与教材。",
          features: ["树形分类目录", "多版本教材", "搜索与新建"] },
        { icon: "📕", title: "教材详情", en: "Material Detail", desc: "封面、年级、分类与词库。", static: MOCK.material, badge: "view",
          modalDesc: "教材详情含封面、年级、分类信息，支持封面拖拽上传与词库查看。",
          features: ["封面拖拽上传", "年级 / 分类标注", "词库一览"] },
        { icon: "🛠️", title: "教材内容管理", en: "Content Manage", desc: "Excel 批量导入词库。", static: MOCK.material, badge: "view",
          modalDesc: "通过 Excel 批量导入与维护词库，高效管理教材内容。",
          features: ["Excel 批量导入", "单元 / 词条维护", "内容版本管理"] },
      ],
    },
  ];

  /* ---------- 渲染 ---------- */
  const app = document.getElementById("app");
  let altFlag = false;

  MODULES.forEach((m) => {
    if (m.tier) {
      const band = document.createElement("div");
      band.className = "tier-band reveal";
      band.innerHTML = `<span class="tier-tag">${m.tier}</span><h2>${m.tier.split("·").pop().split(" ").pop()}</h2><p>${m.tierDesc}</p>`;
      // 标题用更友好的中文
      band.querySelector("h2").textContent = m.tier.replace(/^[一二三]\s*·\s*/, "");
      app.appendChild(band);
      return;
    }
    const sec = document.createElement("section");
    sec.id = m.id;
    sec.className = "section" + (altFlag ? " alt" : "");
    altFlag = !altFlag;
    sec.innerHTML = `
      <div class="section-inner">
        <div class="module-head reveal">
          <div class="icon-badge" style="background:${m.tint}">${m.icon}</div>
          <h3>${m.title}</h3>
          <div class="en">${m.en}</div>
          <div class="tagline">${m.tagline}</div>
        </div>
        <div class="card-grid"></div>
      </div>`;
    const grid = sec.querySelector(".card-grid");
    m.cards.forEach((card, i) => {
      const el = document.createElement("div");
      el.className = "card reveal";
      el.style.setProperty("--card-accent", m.grad);
      el.style.setProperty("--d", (i % 4) * 0.06 + "s");
      const badgeText = card.badge === "play" ? "▶ 可体验" : card.badge === "soon" ? "敬请期待" : "界面预览";
      el.innerHTML = `
        <span class="badge ${card.badge}">${badgeText}</span>
        <div class="c-icon">${card.icon}</div>
        <h4>${card.title}</h4>
        <div class="c-en">${card.en}</div>
        <div class="c-desc">${card.desc}</div>
        <div class="c-foot">${card.badge === "play" ? "立即体验" : "查看详情"} <span class="arrow">→</span></div>`;
      el.onclick = () => openModal(card, m);
      grid.appendChild(el);
    });
    app.appendChild(sec);
  });

  /* ---------- 弹窗 ---------- */
  const mask = document.getElementById("modalMask");
  const heroEl = document.getElementById("modalHero");
  const bodyEl = document.getElementById("modalBody");

  function openModal(card, m) {
    heroEl.style.background = m.grad;
    document.getElementById("mIcon").textContent = card.icon;
    document.getElementById("mTitle").textContent = card.title;
    document.getElementById("mEn").textContent = card.en;
    document.getElementById("mDesc").textContent = card.modalDesc || card.desc;

    const isPlay = !!card.demo;
    const featHtml = (card.features || []).map((f) => `<li><span class="tick">✓</span><span>${f}</span></li>`).join("");
    bodyEl.innerHTML = `
      <div class="demo-label">${isPlay ? "▶ 可互动示例 · 直接点击体验" : "🖥 界面预览"}</div>
      <ul class="feature-list">${featHtml}</ul>
      <div id="demoHost" style="margin-top:22px;"></div>`;
    const hostEl = bodyEl.querySelector("#demoHost");
    if (card.demo && window.DEMOS[card.demo]) {
      window.DEMOS[card.demo](hostEl);
      window.__bindSpeak(hostEl);
    } else if (card.static) {
      hostEl.innerHTML = card.static;
      window.__bindSpeak(hostEl);
    }

    mask.classList.add("open");
    document.body.style.overflow = "hidden";
    mask.scrollTop = 0;
  }
  function closeModal() {
    mask.classList.remove("open");
    document.body.style.overflow = "";
    try { window.speechSynthesis.cancel(); } catch (e) {}
    setTimeout(() => { bodyEl.innerHTML = ""; }, 350);
  }
  document.getElementById("modalClose").onclick = closeModal;
  mask.addEventListener("click", (e) => { if (e.target === mask) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && mask.classList.contains("open")) closeModal(); });

  /* ---------- 滚动揭示动画 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
        // 动画结束后移除 reveal，恢复卡片自身的快速 hover 过渡
        setTimeout(() => en.target.classList.remove("reveal", "in"), 850);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
