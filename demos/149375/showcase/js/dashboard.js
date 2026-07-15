(function () {
  'use strict';

  // ===== API 配置 =====
  const API_BASE = 'http://localhost:8000';
  const USER_ID = 'richard';

  // ===== DOM 引用 =====
  const app = document.querySelector('.app');
  const leftSidebar = document.getElementById('leftSidebar');
  const rightSidebar = document.getElementById('rightSidebar');
  const rightSidebarHandle = document.getElementById('rightSidebarHandle');
  const collapseLeft = document.getElementById('collapseLeft');
  const expandLeft = document.getElementById('expandLeft');
  const collapseRight = document.getElementById('collapseRight');
  const expandRight = document.getElementById('expandRight');
  const expandRightMini = document.getElementById('expandRightMini');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const modeTitle = document.getElementById('modeTitle');
  const modeTag = document.getElementById('modeTag');
  const navItems = document.querySelectorAll('.nav-item[data-mode]');
  const panels = document.querySelectorAll('[data-panel]');
  const views = document.querySelectorAll('[data-view]');
  const chatInputArea = document.getElementById('chatInputArea');

  // ===== 题库配置 =====
  // 硬编码的 books 数组，API 失败时回退使用
  const FALLBACK_BOOKS = [21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9];
  let books = FALLBACK_BOOKS;

  const listeningPartTypes = ['填空', '单选 匹配', '多选 匹配', '填空'];
  const readingPartTypes = ['填词 判断', '段落配对 填词', '单选 匹配 判断', '判断 摘要'];
  const writingPartTypes = ['Task 1 图表', 'Task 2 议论', 'Task 1 流程', 'Task 2 观点'];
  const speakingPartTypes = ['Part 1 日常', 'Part 2 经历', 'Part 3 议论'];

  const modeLabels = {
    home: { title: '我的', tag: '总览', tagClass: 'mode-tag--chat' },
    listening: { title: '听力', tag: '真题练习', tagClass: 'mode-tag--writing' },
    reading: { title: '阅读', tag: '真题练习', tagClass: 'mode-tag--writing' },
    writing: { title: '作文', tag: '真题练习', tagClass: 'mode-tag--writing' },
    speaking: { title: '口语', tag: '题库练习', tagClass: 'mode-tag--speaking' },
    word: { title: '单词', tag: '词汇本', tagClass: 'mode-tag--speaking' },
    mock: { title: '全真模考', tag: '倒计时', tagClass: 'mode-tag--mock' },
    chat: { title: '自由对话', tag: 'AI 助教', tagClass: 'mode-tag--chat' },
    library: { title: '内容库', tag: '素材', tagClass: 'mode-tag--writing' },
    mistakes: { title: '错题档案', tag: '待复习', tagClass: 'mode-tag--chat' },
    logs: { title: '日志进度', tag: '14 / 21 天', tagClass: 'mode-tag--writing' },
  };

  const practiceModes = ['listening', 'reading', 'writing', 'speaking'];
  let currentTimer = null;
  let currentPracticeMode = null;
  let currentPracticeMeta = null;
  let currentSectionData = null; // 缓存当前练习的 section 数据，用于提交评分

  // ===== Sidebar collapse =====
  function isMobile() {
    return window.innerWidth <= 1024;
  }

  function setLeftSidebarOpen(isOpen) {
    if (isMobile()) {
      leftSidebar.classList.toggle('is-open', isOpen);
    } else {
      app.classList.toggle('is-left-collapsed', !isOpen);
    }
  }

  function setRightSidebarOpen(isOpen) {
    app.classList.toggle('is-right-collapsed', !isOpen);
    rightSidebar.classList.toggle('is-open', isOpen);
  }

  if (collapseLeft) collapseLeft.addEventListener('click', () => setLeftSidebarOpen(false));
  if (expandLeft) expandLeft.addEventListener('click', () => setLeftSidebarOpen(true));
  if (collapseRight) collapseRight.addEventListener('click', () => setRightSidebarOpen(false));
  if (expandRight) expandRight.addEventListener('click', () => setRightSidebarOpen(true));
  if (rightSidebarHandle) {
    rightSidebarHandle.addEventListener('click', () => setRightSidebarOpen(true));
  }
  if (expandRightMini) {
    expandRightMini.addEventListener('click', () => setRightSidebarOpen(true));
  }

  // ===== Mobile menu =====
  if (mobileMenuToggle && leftSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      leftSidebar.classList.toggle('is-open');
    });

    leftSidebar.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        if (isMobile()) leftSidebar.classList.remove('is-open');
      });
    });
  }

  // ===== Mode switching =====
  function switchMode(mode) {
    if (!mode || !modeLabels[mode]) return;

    app.setAttribute('data-mode', mode);

    app.classList.forEach((cls) => {
      if (cls.startsWith('mode-')) app.classList.remove(cls);
    });
    app.classList.add(`mode-${mode}`);

    // 退出练习模式
    app.classList.remove('is-practice');
    stopTimer();

    navItems.forEach((item) => {
      item.classList.toggle('is-active', item.dataset.mode === mode);
    });

    const config = modeLabels[mode];
    modeTitle.textContent = config.title;
    modeTag.textContent = config.tag;
    modeTag.className = `mode-tag ${config.tagClass}`;

    views.forEach((view) => {
      view.classList.toggle('is-active', view.dataset.view === mode);
    });

    if (practiceModes.includes(mode)) {
      resetPracticeView(mode);
      renderLibrary(mode);
      setLeftSidebarOpen(true);
      setRightSidebarOpen(false);
    } else {
      renderDashboard(mode);
      setLeftSidebarOpen(true);
      const activePanel = document.querySelector(`[data-panel="${mode}"]`);
      if (activePanel && !activePanel.classList.contains('panel--empty')) {
        setRightSidebarOpen(!isMobile());
      } else {
        setRightSidebarOpen(false);
      }
    }

    panels.forEach((panel) => {
      const targetPanel = practiceModes.includes(mode) ? `${mode}-library` : mode;
      panel.hidden = panel.dataset.panel !== targetPanel;
    });

    const activePanel = document.querySelector(`[data-panel="${practiceModes.includes(mode) ? `${mode}-library` : mode}"]`);
    if (activePanel) {
      const tabs = activePanel.querySelectorAll('.panel__tab');
      const contents = activePanel.querySelectorAll('.tab-content');
      tabs.forEach((tab, index) => tab.classList.toggle('is-active', index === 0));
      contents.forEach((content, index) => content.classList.toggle('is-active', index === 0));
    }
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => switchMode(item.dataset.mode));
  });

  // ===== 静态 Mock 数据（离线展示用，无后端依赖） =====
  const MOCK_BOOKS = ['cambridge10','cambridge11','cambridge12','cambridge13','cambridge14','cambridge15','cambridge16','cambridge17','cambridge18','cambridge19','cambridge20','cambridge21','cambridge9'];

  const MOCK_PORTRAIT = {
    user_id: 'richard',
    portrait: {
      version: 'v1', user_id: 'richard', tier: 2, template_mode: 'novice',
      daily_available_minutes: 450, peak_hours: [14, 20, 23],
      target_level: { listening: 5.5, reading: 5.5, writing: 5.5, speaking: 5.0 },
      current_level: { listening: 5.0, reading: 5.5, writing: 5.0, speaking: 5.0 },
      summary: { total_sessions: 16, total_minutes: 490, last_7_days_sessions: 16, last_7_days_minutes: 490, error_count: 9, pattern_error_count: 4 },
      subject_minutes: { 'Subject.SPEAKING': 40, 'Subject.READING': 60, 'Subject.WRITING': 240, 'Subject.LISTENING': 150 },
      weak_knowledge_areas: { 'subject-verb_agreement': 16, 'time_guessing': 13, 'grammar': 10, 'synonym_or_wrong_word': 7, 'listening_comprehension': 3 },
      weak_question_types: { 'task_1': 24, 'tfng': 13, 'part_1': 1, 'part_2': 1 },
      error_patterns: { 'misheard': 1, 'missed': 2, 'spelling_or_format': 2, 'subject-verb agreement': 16, 'synonym_or_wrong_word': 7 },
      recommendations: [
        { type: 'knowledge', focus: 'subject-verb_agreement', action: '优先补 subject-verb_agreement，做错题归因 + 针对性内容推荐' },
        { type: 'question_type', focus: 'task_1', action: '集中训练 task_1 题型，提升解题套路熟练度' },
        { type: 'error_pattern', focus: 'misheard', action: '重点纠 misheard，同类型错误第 3 次抄写 50 遍' }
      ]
    }
  };

  // 写作评分 mock（基于 MockProvider 真实返回结构）
  const MOCK_WRITING_RESULT = {
    ta_tr: { score: 6.0, feedback: 'Addresses the task but ideas underdeveloped.' },
    cc: { score: 5.5, feedback: 'Some cohesion, limited paragraphing.' },
    lr: { score: 5.5, feedback: 'Repetitive vocabulary.' },
    gra: { score: 5.0, feedback: 'Frequent subject-verb agreement and tense errors.' },
    overall: 5.5,
    errors: [
      { type: 'subject-verb agreement', context: 'technology become', correction: 'technology becomes' },
      { type: 'subject-verb agreement', context: 'it help us', correction: 'it helps us' },
      { type: 'tense', context: 'I go yesterday', correction: 'I went yesterday' }
    ],
    suggestions: ['Review third-person singular verbs.', 'Use specific examples.']
  };

  // 口语评分 mock
  const MOCK_SPEAKING_RESULT = {
    fc: { score: 6.0, feedback: 'Fluent with some hesitation.' },
    lr: { score: 5.5, feedback: 'Adequate vocabulary.' },
    gra: { score: 6.0, feedback: 'Good range but minor tense slips.' },
    p: { score: 5.5, feedback: 'Generally clear.' },
    overall: 5.75,
    errors: [{ type: 'tense', context: 'I go yesterday', correction: 'I went yesterday' }],
    better_version: 'I went to the park yesterday and it was relaxing.'
  };

  // Coach 日计划 mock
  const MOCK_COACH_PLAN = {
    tasks: [
      { subject: 'writing', type: 'essay', duration_minutes: 40, focus: 'task response' },
      { subject: 'listening', type: 'matching', duration_minutes: 30, focus: 'listening_matching' },
      { subject: 'speaking', type: 'p2', duration_minutes: 20, focus: 'fluency' }
    ],
    learner_portrait: MOCK_PORTRAIT.portrait,
    recommended_focus: ['subject-verb_agreement', 'task_1', 'misheard'],
    task_ids: [63, 64, 65]
  };

  // ===== 题库静态数据 =====
  // 嵌入剑10 test1 四科第一个 section（真实题库快照）
  const MOCK_SECTIONS = {"cambridge10/test1/listening/part1":{"section_id":"cambridge10_test1_l_part1","exam_type":"ielts","subject":"listening","section":"part1","book":"cambridge10","test":"test1","title":"Listening PART1","instructions":"Listen and answer questions 1-10","media":[{"type":"audio","url":"https://cap.bczcdn.com/adult/a137e7fb9b04e1841c486ff40c09e257b4c4.mp3","duration":null,"caption":""}],"questions":[{"question_id":"cambridge10_test1_l_part1_q1","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":1,"question_text":"SELF-DRIVE TOURS INTHE USAName:  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Andrea Brown &nbsp; &nbsp;\nAddress: &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;24 1. Road\nPostcode: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;BH52OP\nPhone: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (mobile) 077 8664 3091\nHeard about company from: &nbsp; &nbsp;2. \nPossible self-drive tours\nTrip One:\n• Los Angeles: customer wants to visit some 3. parks with her children\n•Yosemite Park: customer wants to stay in a lodge, not a 4. \n \nTrip Two:\n• Customer wants to see the 5. on the way to Cambria\n• At Santa Monica: not interested in shopping\n• At San Diego, wants to spend time on the 6.","stimulus":"","options":null,"correct_answer":"Ardleigh","explanation":{"text":"1-6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。\n2.定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。\n3.定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。\n4.定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。\n5.定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。\n6.定位： San Diego, spend time预判：根据空格前的spend time on得知，填一个名词，表示地点答案解析：本题可以用San Diego定位。Andrea 先提及good for beaches,旅游公司工作人员推荐zoo，后被I don't think so 否决。后文提及的sunbathing和swimming指在beach要做的事情。并且答案字数要求是ONE WORD,故无法填写sunbathing and swimming。","key_points":["6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。","定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。","定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。","定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。","定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283691},{"question_id":"cambridge10_test1_l_part1_q2","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":2,"question_text":"SELF-DRIVE TOURS INTHE USAName:  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Andrea Brown &nbsp; &nbsp;\nAddress: &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;24 1. Road\nPostcode: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;BH52OP\nPhone: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (mobile) 077 8664 3091\nHeard about company from: &nbsp; &nbsp;2. \nPossible self-drive tours\nTrip One:\n• Los Angeles: customer wants to visit some 3. parks with her children\n•Yosemite Park: customer wants to stay in a lodge, not a 4. \n \nTrip Two:\n• Customer wants to see the 5. on the way to Cambria\n• At Santa Monica: not interested in shopping\n• At San Diego, wants to spend time on the 6.","stimulus":"","options":null,"correct_answer":"newspaper","explanation":{"text":"1-6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。\n2.定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。\n3.定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。\n4.定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。\n5.定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。\n6.定位： San Diego, spend time预判：根据空格前的spend time on得知，填一个名词，表示地点答案解析：本题可以用San Diego定位。Andrea 先提及good for beaches,旅游公司工作人员推荐zoo，后被I don't think so 否决。后文提及的sunbathing和swimming指在beach要做的事情。并且答案字数要求是ONE WORD,故无法填写sunbathing and swimming。","key_points":["6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。","定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。","定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。","定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。","定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283691},{"question_id":"cambridge10_test1_l_part1_q3","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":3,"question_text":"SELF-DRIVE TOURS INTHE USAName:  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Andrea Brown &nbsp; &nbsp;\nAddress: &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;24 1. Road\nPostcode: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;BH52OP\nPhone: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (mobile) 077 8664 3091\nHeard about company from: &nbsp; &nbsp;2. \nPossible self-drive tours\nTrip One:\n• Los Angeles: customer wants to visit some 3. parks with her children\n•Yosemite Park: customer wants to stay in a lodge, not a 4. \n \nTrip Two:\n• Customer wants to see the 5. on the way to Cambria\n• At Santa Monica: not interested in shopping\n• At San Diego, wants to spend time on the 6.","stimulus":"","options":null,"correct_answer":"theme","explanation":{"text":"1-6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。\n2.定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。\n3.定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。\n4.定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。\n5.定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。\n6.定位： San Diego, spend time预判：根据空格前的spend time on得知，填一个名词，表示地点答案解析：本题可以用San Diego定位。Andrea 先提及good for beaches,旅游公司工作人员推荐zoo，后被I don't think so 否决。后文提及的sunbathing和swimming指在beach要做的事情。并且答案字数要求是ONE WORD,故无法填写sunbathing and swimming。","key_points":["6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。","定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。","定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。","定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。","定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283691},{"question_id":"cambridge10_test1_l_part1_q4","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":4,"question_text":"SELF-DRIVE TOURS INTHE USAName:  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Andrea Brown &nbsp; &nbsp;\nAddress: &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;24 1. Road\nPostcode: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;BH52OP\nPhone: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (mobile) 077 8664 3091\nHeard about company from: &nbsp; &nbsp;2. \nPossible self-drive tours\nTrip One:\n• Los Angeles: customer wants to visit some 3. parks with her children\n•Yosemite Park: customer wants to stay in a lodge, not a 4. \n \nTrip Two:\n• Customer wants to see the 5. on the way to Cambria\n• At Santa Monica: not interested in shopping\n• At San Diego, wants to spend time on the 6.","stimulus":"","options":null,"correct_answer":"tent","explanation":{"text":"1-6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。\n2.定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。\n3.定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。\n4.定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。\n5.定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。\n6.定位： San Diego, spend time预判：根据空格前的spend time on得知，填一个名词，表示地点答案解析：本题可以用San Diego定位。Andrea 先提及good for beaches,旅游公司工作人员推荐zoo，后被I don't think so 否决。后文提及的sunbathing和swimming指在beach要做的事情。并且答案字数要求是ONE WORD,故无法填写sunbathing and swimming。","key_points":["6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。","定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。","定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。","定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。","定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283691},{"question_id":"cambridge10_test1_l_part1_q5","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":5,"question_text":"SELF-DRIVE TOURS INTHE USAName:  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Andrea Brown &nbsp; &nbsp;\nAddress: &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;24 1. Road\nPostcode: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;BH52OP\nPhone: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (mobile) 077 8664 3091\nHeard about company from: &nbsp; &nbsp;2. \nPossible self-drive tours\nTrip One:\n• Los Angeles: customer wants to visit some 3. parks with her children\n•Yosemite Park: customer wants to stay in a lodge, not a 4. \n \nTrip Two:\n• Customer wants to see the 5. on the way to Cambria\n• At Santa Monica: not interested in shopping\n• At San Diego, wants to spend time on the 6.","stimulus":"","options":null,"correct_answer":"castle","explanation":{"text":"1-6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。\n2.定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。\n3.定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。\n4.定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。\n5.定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。\n6.定位： San Diego, spend time预判：根据空格前的spend time on得知，填一个名词，表示地点答案解析：本题可以用San Diego定位。Andrea 先提及good for beaches,旅游公司工作人员推荐zoo，后被I don't think so 否决。后文提及的sunbathing和swimming指在beach要做的事情。并且答案字数要求是ONE WORD,故无法填写sunbathing and swimming。","key_points":["6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。","定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。","定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。","定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。","定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283691},{"question_id":"cambridge10_test1_l_part1_q6","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":6,"question_text":"SELF-DRIVE TOURS INTHE USAName:  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Andrea Brown &nbsp; &nbsp;\nAddress: &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;24 1. Road\nPostcode: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;BH52OP\nPhone: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; (mobile) 077 8664 3091\nHeard about company from: &nbsp; &nbsp;2. \nPossible self-drive tours\nTrip One:\n• Los Angeles: customer wants to visit some 3. parks with her children\n•Yosemite Park: customer wants to stay in a lodge, not a 4. \n \nTrip Two:\n• Customer wants to see the 5. on the way to Cambria\n• At Santa Monica: not interested in shopping\n• At San Diego, wants to spend time on the 6.","stimulus":"","options":null,"correct_answer":"beach | beaches","explanation":{"text":"1-6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。\n2.定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。\n3.定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。\n4.定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。\n5.定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。\n6.定位： San Diego, spend time预判：根据空格前的spend time on得知，填一个名词，表示地点答案解析：本题可以用San Diego定位。Andrea 先提及good for beaches,旅游公司工作人员推荐zoo，后被I don't think so 否决。后文提及的sunbathing和swimming指在beach要做的事情。并且答案字数要求是ONE WORD,故无法填写sunbathing and swimming。","key_points":["6 正确答案：1.定位：Address, 24, Road预判：根据空格前的address和后面的road得知，填一个名词，表示路名答案解析：题干词address原文重现。本题定位简单。拼写中的gh可能对部分考生造成困扰，gh组合通常不发音。","定位：Heard about, company, from预判：根据空格前的heard about ...from得知，填一个名词，表示“从哪里听说的”答案解析：本题定位较容易。原文中虽出现了friends, advert两个信息混淆考生，但最终也比较明确地强调了是通过newspaper。","定位：Trip One, Los Angeles, customer, visit, parks, children预判：根据空格前的visit和后面的parks得知，填一个名词或者形容词，修饰parks，表示“游览什么/什么样子的公园”答案解析：本题用Los Angeles可以清晰定位。theme park以词组的形式出现，可能有的考生不了解该词组的含义而无法填写。theme park意为“主题公园”。","定位：Yosemite Park, customer, stay in a lodge, not a 预判：根据空格前的not a得知，填一个单数名词，表示“不是住在什么地方”答案解析：本题同样可以用题干专有名词Yosemite Park 定位，lodge一词提示答案将至。Andrea 直接表示不喜欢staying in a tent。","定位：Trip Two, Customer, see, way to Cambria预判：根据空格前的see the得知，填一个名词答案解析：本题题干中的on the way to Cambria和原文中的near Cambria是同义替换，会给考生制造难度。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283691},{"question_id":"cambridge10_test1_l_part1_q1","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":7,"question_text":"Number\nof daysTotal distancePrice\n(per person)IncludesTrip One12 days7. km£525• accommodation\n• car\n• one 8. Trip Two9 days980km£ 9. &nbsp;• accommodation\n• car \n• 10. &nbsp;","stimulus":"","options":null,"correct_answer":"2020","explanation":{"text":"7-10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。\n8.定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。\n9.定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。\n10.定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。","key_points":["10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。","定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。","定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。","定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283734},{"question_id":"cambridge10_test1_l_part1_q2","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":8,"question_text":"Number\nof daysTotal distancePrice\n(per person)IncludesTrip One12 days7. km£525• accommodation\n• car\n• one 8. Trip Two9 days980km£ 9. &nbsp;• accommodation\n• car \n• 10. &nbsp;","stimulus":"","options":null,"correct_answer":"flight","explanation":{"text":"7-10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。\n8.定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。\n9.定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。\n10.定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。","key_points":["10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。","定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。","定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。","定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283734},{"question_id":"cambridge10_test1_l_part1_q3","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":9,"question_text":"Number\nof daysTotal distancePrice\n(per person)IncludesTrip One12 days7. km£525• accommodation\n• car\n• one 8. Trip Two9 days980km£ 9. &nbsp;• accommodation\n• car \n• 10. &nbsp;","stimulus":"","options":null,"correct_answer":"429","explanation":{"text":"7-10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。\n8.定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。\n9.定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。\n10.定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。","key_points":["10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。","定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。","定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。","定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283734},{"question_id":"cambridge10_test1_l_part1_q4","exam_type":"ielts","subject":"listening","section":"part1","question_type":"fill_blank","order":10,"question_text":"Number\nof daysTotal distancePrice\n(per person)IncludesTrip One12 days7. km£525• accommodation\n• car\n• one 8. Trip Two9 days980km£ 9. &nbsp;• accommodation\n• car \n• 10. &nbsp;","stimulus":"","options":null,"correct_answer":"dinner","explanation":{"text":"7-10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。\n8.定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。\n9.定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。\n10.定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。","key_points":["10 正确答案：7.定位：Trip One, 12 days, Total distance预判：根据空格后的km和表头的total distance得知，填一个数字，表示“多少公里的总路程”答案解析：本题可预测答案为数字，与distance有关。2020 在已知信息twelve之后出现。","定位：£525, &nbsp;accommodation, car, one 预判：根据空格前的accommodation, car和one得知，填一个单数名词答案解析：本题较易定位。 题干已知信息accommodation和car之后原文紧跟出现a fight。","定位：Trip Two, 9 days, 980 km预判：根据空格前的英镑符合得知，填一个数字，表示金额答案解析：同第7题，定位数字、金额。已知信息提供了较好的定位依据。","定位：accommodation, car 预判：根据空格前的accommodation, car和并列结构得知，填一个名词答案解析：同第8题，但原文中的fights是混淆点，考生需要听清they aren't included。"],"related_skills":[],"common_mistakes":[]},"media":[],"knowledge_tags":["spelling","listening_detail"],"difficulty":5.0,"source":"cambridge10_test1_l_part1","raw_component_id":283734}],"topic_tags":[],"source":"cambridge10_test1_l_part1","difficulty":5.5,"time_limit_seconds":null},"cambridge10/test1/writing/task1":{"section_id":"cambridge10_test1_w_task1","exam_type":"ielts","subject":"writing","section":"task1","book":"cambridge10","test":"test1","title":"Writing TASK1","instructions":"","media":[],"questions":[{"question_id":"cambridge10_test1_w_task1_q1","exam_type":"ielts","subject":"writing","section":"task1","question_type":"essay_prompt","order":1,"question_text":"The first chart below shows how energy is used in an average Australian household. The second chart shows the greenhouse gas emissions which result from this energy use. \nSummarise the information by selecting and reporting the main features, and make comparisons where relevant. \nWrite at least 150 words.","stimulus":"","options":null,"correct_answer":null,"explanation":null,"media":[],"knowledge_tags":[],"difficulty":6.0,"source":"cambridge10_test1_w_task1","raw_component_id":null}],"topic_tags":[],"source":"cambridge10_test1_w_task1","difficulty":6.0,"time_limit_seconds":1200},"cambridge10/test1/speaking/part1":{"section_id":"cambridge10_test1_s_part1","exam_type":"ielts","subject":"speaking","section":"part1","book":"cambridge10","test":"test1","title":"Speaking PART1","instructions":"","media":[],"questions":[{"question_id":"cambridge10_test1_s_part1_q1","exam_type":"ielts","subject":"speaking","section":"part1","question_type":"speaking_prompt","order":1,"question_text":"Part1 Question1","stimulus":"","options":null,"correct_answer":null,"explanation":null,"media":[{"type":"audio","url":"https://cap.bczcdn.com/adult/7b2950962944054947377f834af62eafbe29.mp3","duration":null,"caption":""}],"knowledge_tags":[],"difficulty":5.5,"source":"cambridge10_test1_s_part1","raw_component_id":284566},{"question_id":"cambridge10_test1_s_part1_q2","exam_type":"ielts","subject":"speaking","section":"part1","question_type":"speaking_prompt","order":2,"question_text":"Part1 Question2","stimulus":"","options":null,"correct_answer":null,"explanation":null,"media":[{"type":"audio","url":"https://cap.bczcdn.com/adult/6727f289c63638b92340bfc298ae1fea75a3.mp3","duration":null,"caption":""}],"knowledge_tags":[],"difficulty":5.5,"source":"cambridge10_test1_s_part1","raw_component_id":284570},{"question_id":"cambridge10_test1_s_part1_q3","exam_type":"ielts","subject":"speaking","section":"part1","question_type":"speaking_prompt","order":3,"question_text":"Part1 Question3","stimulus":"","options":null,"correct_answer":null,"explanation":null,"media":[{"type":"audio","url":"https://cap.bczcdn.com/adult/87a7f49934b79a91e0083abaace150046afd.mp3","duration":null,"caption":""}],"knowledge_tags":[],"difficulty":5.5,"source":"cambridge10_test1_s_part1","raw_component_id":284572},{"question_id":"cambridge10_test1_s_part1_q4","exam_type":"ielts","subject":"speaking","section":"part1","question_type":"speaking_prompt","order":4,"question_text":"Part1 Question4","stimulus":"","options":null,"correct_answer":null,"explanation":null,"media":[{"type":"audio","url":"https://cap.bczcdn.com/adult/68383ea61e791e2edd208dfcb6a02a98eed6.mp3","duration":null,"caption":""}],"knowledge_tags":[],"difficulty":5.5,"source":"cambridge10_test1_s_part1","raw_component_id":284574}],"topic_tags":[],"source":"cambridge10_test1_s_part1","difficulty":6.0,"time_limit_seconds":null}};

  // ===== API 辅助函数（全部走静态 mock，无网络请求） =====
  async function apiGet(path) {
    // 模拟网络延迟
    await new Promise(r => setTimeout(r, 200 + Math.random() * 200));

    if (path.includes('/question-bank/ielts/books')) {
      return { books: MOCK_BOOKS };
    }
    if (path.includes('/question-bank/ielts/')) {
      // /api/question-bank/ielts/{book}/{test}/{subject}/{section}
      const parts = path.replace('/api/question-bank/ielts/', '').split('/');
      if (parts.length >= 4) {
        const [book, test, subject, section] = parts;
        const key = `${book}/${test}/${subject}/${section}`;
        if (MOCK_SECTIONS[key]) return MOCK_SECTIONS[key];
        // 未导出的 section：构造最小可用结构，保证前端不崩
        return _buildFallbackSection(book, test, subject, section);
      }
    }
    if (path.includes('/memory/profile')) {
      return MOCK_PORTRAIT;
    }
    throw new Error(`MOCK: unknown path ${path}`);
  }

  async function apiInvoke(route, payload) {
    // 模拟网络延迟
    await new Promise(r => setTimeout(r, 400 + Math.random() * 400));

    if (route === 'writing') {
      return { state: { writing_result: MOCK_WRITING_RESULT } };
    }
    if (route === 'speaking') {
      return { state: { speaking_result: MOCK_SPEAKING_RESULT } };
    }
    if (route === 'listening' || route === 'reading') {
      // 客观题：让 apiInvoke 抛错，前端会自动 fallback 到本地对比（showListeningLocalResult / showReadingLocalResult）
      throw new Error(`MOCK: ${route} scoring delegates to local comparison`);
    }
    if (route === 'dashboard') {
      return { state: { dashboard: { ui_payload: null } } };
    }
    throw new Error(`MOCK: unknown route ${route}`);
  }

  // 未导出 section 的 fallback 构造器：生成最小可用的题目结构
  function _buildFallbackSection(book, test, subject, section) {
    const subjectLabel = { listening: 'Part', reading: 'Passage', writing: 'Task', speaking: 'Part' }[subject] || 'Part';
    const sectionNum = (section.match(/\d+/) || ['1'])[0];
    const questions = [];
    const qCount = subject === 'writing' ? 1 : subject === 'speaking' ? 1 : 5;
    for (let i = 1; i <= qCount; i++) {
      questions.push({
        order: i,
        question_id: `${book}_${test}_${subject}_${section}_q${i}`,
        question_text: `${subjectLabel} ${sectionNum} - Question ${i}（离线 demo 样题 ${book}）`,
        question_type: subject === 'listening' || subject === 'reading' ? 'fill_blank' : 'open',
        correct_answer: subject === 'listening' || subject === 'reading' ? `answer_${i}` : ''
      });
    }
    return {
      section_id: `${book}_${test}_${subject}_${section}`,
      subject,
      book, test, section,
      title: `${book} ${test} ${subjectLabel} ${sectionNum}`,
      questions
    };
  }

  // ===== 名称转换 =====
  // "剑雅16" → "cambridge16"
  function parseBookName(book) {
    const match = (book || '').match(/\d+/);
    return match ? `cambridge${match[0]}` : book;
  }

  // "Test 1" → "test1"
  function parseTestName(test) {
    const match = (test || '').match(/\d+/);
    return match ? `test${match[0]}` : (test || '').toLowerCase().replace(/\s+/g, '');
  }

  // "Part 1" / "Passage 1" / "Task 1" → "part1" / "passage1" / "task1"
  function parseSectionName(part, subject) {
    const match = (part || '').match(/\d+/);
    if (!match) return (part || '').toLowerCase().replace(/\s+/g, '');
    if (subject === 'reading') return `passage${match[0]}`;
    if (subject === 'writing') return `task${match[0]}`;
    return `part${match[0]}`;
  }

  // ===== 题库加载 =====
  async function loadBooks() {
    try {
      const data = await apiGet('/api/question-bank/ielts/books');
      if (data && Array.isArray(data.books) && data.books.length) {
        const nums = data.books
          .map((b) => parseInt(String(b).replace('cambridge', ''), 10))
          .filter((n) => !isNaN(n));
        if (nums.length) return nums;
      }
    } catch (e) {
      console.warn('Books API 失败，回退到硬编码列表:', e);
    }
    return FALLBACK_BOOKS;
  }

  // ===== 题目获取 =====
  async function fetchSection(book, test, subject, section) {
    const url = `/api/question-bank/ielts/${book}/${test}/${subject}/${section}`;
    return await apiGet(url);
  }

  // ===== Memory Profile =====
  async function fetchMemoryProfile() {
    try {
      return await apiGet(`/api/memory/profile?user_id=${USER_ID}`);
    } catch (e) {
      console.warn('Memory profile 获取失败:', e);
      return null;
    }
  }

  // ===== Library rendering =====
  function renderLibrary(mode) {
    if (mode === 'listening') renderListeningLibrary();
    if (mode === 'reading') renderReadingLibrary();
    if (mode === 'writing') renderWritingLibrary();
    if (mode === 'speaking') renderSpeakingLibrary();
  }

  // ===== Dashboard rendering =====
  function renderDashboard(mode) {
    if (mode === 'home') renderHomeDashboard();
    if (mode === 'library') renderLibraryDashboard();
    if (mode === 'mistakes') renderMistakesDashboard();
    if (mode === 'logs') renderLogsDashboard();
    if (mode === 'word') renderWordView();
  }

  // ===== Agent-driven Dashboard UI Payload =====
  const mockDashboardPayload = {
    title: '今日学习概览',
    subtitle: '目标 5.5 · 连续打卡 14 天',
    components: [
      { type: 'metric', id: 'total_sessions', title: '总练习次数', value: 42, hint: '累计训练' },
      { type: 'metric', id: 'today_minutes', title: '今日时长', value: '195 min', hint: '比昨日 +23' },
      { type: 'metric', id: 'error_count', title: '待复习错题', value: 12, hint: '3 个顽固错误' },
      {
        type: 'chart',
        id: 'subject_scores',
        chart_type: 'bar',
        title: '四科当前水平',
        x_label: '科目',
        y_label: 'Band',
        data: [
          { label: 'Listening', value: 5.5 },
          { label: 'Reading', value: 5.5 },
          { label: 'Writing', value: 5.0 },
          { label: 'Speaking', value: 5.0 },
        ],
      },
      {
        type: 'task_list',
        id: 'today_tasks',
        title: '今日任务',
        tasks: [
          { id: 't1', title: '听力 Part 1 练习', subject: 'listening', status: 'completed', estimated_minutes: 25 },
          { id: 't2', title: '阅读 Passage 1', subject: 'reading', status: 'pending', estimated_minutes: 30 },
          { id: 't3', title: '背诵 20 个单词', subject: 'vocabulary', status: 'pending', estimated_minutes: 20 },
          { id: 't4', title: '口语 Part 2 录音', subject: 'speaking', status: 'pending', estimated_minutes: 20 },
        ],
      },
      {
        type: 'error_list',
        id: 'pattern_errors',
        title: '重点关注错误',
        errors: [
          { id: 'e1', error_type: 'third-person singular', subject: 'speaking', context: 'holidays is...', occurrence_count: 3 },
          { id: 'e2', error_type: 'matching', subject: 'listening', context: 'S2 匹配题连续错', occurrence_count: 4 },
          { id: 'e3', error_type: 'task response', subject: 'writing', context: 'Task 2 立场不够明确', occurrence_count: 2 },
        ],
      },
      {
        type: 'content_card',
        id: 'c1',
        title: '听力 S2 匹配题策略',
        subject: 'listening',
        preview: '先读题干划关键词，听时抓同义替换，排除明显干扰项。',
        tags: ['matching', 'listening', 'S2'],
        action_label: '查看',
      },
      {
        type: 'content_card',
        id: 'c2',
        title: 'Task 2 让步段模板',
        subject: 'writing',
        preview: 'Admittedly, ... Nevertheless, ... 用于承认对方观点后转回自己立场。',
        tags: ['template', 'writing', 'task2'],
        action_label: '查看',
      },
    ],
  };

  async function fetchDashboardPayload() {
    // 离线模式：直接返回已有的 mockDashboardPayload
    await new Promise(r => setTimeout(r, 300));
    return mockDashboardPayload;
  }

  function renderBarChart(component) {
    const data = component.data || [];
    const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);
    return `
      <div class="ui-chart dash-card--wide">
        <div class="ui-chart__header">
          <div class="ui-chart__title">${escapeHtml(component.title || '')}</div>
          <div class="ui-chart__labels">${component.x_label || ''}${component.y_label ? ' · ' + component.y_label : ''}</div>
        </div>
        <div class="ui-chart__body">
          ${data.map((d) => `
            <div class="ui-chart__bar-wrap">
              <div class="ui-chart__bar" style="height: ${Math.max(4, (Number(d.value) / max) * 100)}%">
                <span class="ui-chart__bar-value">${d.value}</span>
              </div>
              <span class="ui-chart__bar-label">${escapeHtml(d.label)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderMetric(component) {
    return `
      <div class="ui-metric">
        <div class="ui-metric__title">${escapeHtml(component.title || '')}</div>
        <div class="ui-metric__value">${escapeHtml(String(component.value ?? ''))}</div>
        ${component.hint ? `<div class="ui-metric__hint">${escapeHtml(component.hint)}</div>` : ''}
      </div>
    `;
  }

  function renderTaskList(component) {
    const tasks = component.tasks || [];
    return `
      <div class="dash-card dash-card--wide">
        <h3 class="dash-card__title">${escapeHtml(component.title || '')}</h3>
        <div class="ui-task-list">
          ${tasks.map((t) => `
            <div class="ui-task-item ${t.status === 'completed' ? 'is-completed' : ''}" data-task-id="${escapeHtml(t.id || '')}">
              <span class="ui-task-item__check"></span>
              <div class="ui-task-item__text">
                <span class="ui-task-item__title">${escapeHtml(t.title || '')}</span>
                <span class="ui-task-item__meta">${t.subject ? escapeHtml(t.subject) + ' · ' : ''}${t.estimated_minutes ? t.estimated_minutes + ' min' : ''}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderErrorList(component) {
    const errors = component.errors || [];
    return `
      <div class="dash-card dash-card--wide">
        <h3 class="dash-card__title">${escapeHtml(component.title || '')}</h3>
        <div class="ui-error-list">
          ${errors.map((e) => `
            <div class="ui-error-item">
              <span class="ui-error-item__badge ui-error-item__badge--${escapeHtml(e.subject || 'other')}">${escapeHtml(e.subject || 'other')}</span>
              <div class="ui-error-item__text">
                <span class="ui-error-item__type">${escapeHtml(e.error_type || '')}</span>
                <span class="ui-error-item__context">${escapeHtml(e.context || '')}</span>
              </div>
              <span class="ui-error-item__count">×${e.occurrence_count || 1}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderContentCard(component) {
    const tags = component.tags || [];
    return `
      <div class="ui-content-card">
        <div class="ui-content-card__header">
          <span class="ui-content-card__title">${escapeHtml(component.title || '')}</span>
          ${component.subject ? `<span class="ui-content-card__subject">${escapeHtml(component.subject)}</span>` : ''}
        </div>
        <p class="ui-content-card__preview">${escapeHtml(component.preview || '')}</p>
        ${tags.length ? `
          <div class="ui-content-card__tags">
            ${tags.map((tag) => `<span class="ui-content-card__tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
        ${component.action_label ? `<button class="ui-content-card__action">${escapeHtml(component.action_label)}</button>` : ''}
      </div>
    `;
  }

  function renderUIPayload(container, payload) {
    if (!payload || !payload.components) return;
    const components = payload.components;
    const metrics = components.filter((c) => c.type === 'metric');
    const charts = components.filter((c) => c.type === 'chart');
    const lists = components.filter((c) => ['task_list', 'error_list'].includes(c.type));
    const cards = components.filter((c) => c.type === 'content_card');

    let html = '';
    if (payload.title) {
      html += `<div class="dash-hero"><h2 class="dash-hero__title">${escapeHtml(payload.title)}</h2>`;
      if (payload.subtitle) html += `<p class="dash-hero__subtitle">${escapeHtml(payload.subtitle)}</p>`;
      html += '</div>';
    }

    html += '<div class="dash-grid">';

    if (metrics.length) {
      html += `<div class="dash-card dash-card--wide"><div class="ui-metric-grid">${metrics.map(renderMetric).join('')}</div></div>`;
    }

    charts.forEach((c) => {
      html += renderBarChart(c);
    });

    lists.forEach((c) => {
      if (c.type === 'task_list') html += renderTaskList(c);
      if (c.type === 'error_list') html += renderErrorList(c);
    });

    if (cards.length) {
      html += `<div class="dash-card dash-card--wide"><h3 class="dash-card__title">推荐内容</h3><div class="ui-content-list">${cards.map(renderContentCard).join('')}</div></div>`;
    }

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.ui-task-item__check').forEach((check) => {
      check.addEventListener('click', () => {
        check.closest('.ui-task-item').classList.toggle('is-completed');
      });
    });
  }

  async function renderHomeDashboard() {
    const container = document.getElementById('homeView');
    if (!container) return;
    const payload = await fetchDashboardPayload();
    renderUIPayload(container, payload || mockDashboardPayload);
  }

  function renderLibraryDashboard() {
    const container = document.getElementById('libraryView');
    if (!container) return;
    container.innerHTML = `
      <div class="dash-hero">
        <h2 class="dash-hero__title">内容库</h2>
        <p class="dash-hero__subtitle">模板、素材、论点与范文</p>
      </div>
      <div class="dash-grid">
        <div class="dash-card">
          <h3 class="dash-card__title">写作模板</h3>
          <p class="dash-card__caption">Task 1 / Task 2 开头、让步、结尾段模板。</p>
          <button class="dash-card__action">查看模板</button>
        </div>
        <div class="dash-card">
          <h3 class="dash-card__title">口语串题稿</h3>
          <p class="dash-card__caption">可复用经历与物品素材，覆盖 80% Part 2 题目。</p>
          <button class="dash-card__action">查看串题稿</button>
        </div>
        <div class="dash-card">
          <h3 class="dash-card__title">阅读同替词</h3>
          <p class="dash-card__caption">高频同义替换整理，按话题分类。</p>
          <button class="dash-card__action">查看词表</button>
        </div>
        <div class="dash-card">
          <h3 class="dash-card__title">听力场景词</h3>
          <p class="dash-card__caption">租房、求职、旅游、学术场景核心词汇。</p>
          <button class="dash-card__action">查看词表</button>
        </div>
        <div class="dash-card dash-card--wide">
          <h3 class="dash-card__title">近期收藏</h3>
          <ul class="dash-list dash-list--clean">
            <li>Task 2 犯罪类论点</li>
            <li>口语 P2 毕业旅行串题</li>
            <li>听力租房场景高频词</li>
          </ul>
        </div>
      </div>
    `;
  }

  // 错题档案：优先用 memory profile 数据，失败回退到 mock
  async function renderMistakesDashboard() {
    const container = document.getElementById('mistakesView');
    if (!container) return;

    // 默认 mock 数据
    let mistakeItems = [
      { subject: '听力', label: '剑雅 17 Test 2 Part 1 Q4', action: '重刷' },
      { subject: '阅读', label: '剑雅 16 Test 3 Passage 2 Q7', action: '重刷' },
      { subject: '写作', label: 'Task 2 主语一致性错误', action: '查看' },
    ];
    let errorPatterns = ['同义替换未识别', '单复数错误', '定位句遗漏', '时态混淆'];

    // 尝试从 memory profile 获取真实数据
    const profile = await fetchMemoryProfile();
    if (profile) {
      if (Array.isArray(profile.mistakes) && profile.mistakes.length) {
        mistakeItems = profile.mistakes.map((m) => ({
          subject: m.subject || '其他',
          label: m.label || m.description || '',
          action: '重刷',
        }));
      }
      if (Array.isArray(profile.error_patterns) && profile.error_patterns.length) {
        errorPatterns = profile.error_patterns.map((e) => (typeof e === 'string' ? e : e.pattern || e.description || ''));
      }
    }

    container.innerHTML = `
      <div class="dash-hero">
        <h2 class="dash-hero__title">错题档案</h2>
        <p class="dash-hero__subtitle">${mistakeItems.length} 题待复习</p>
      </div>
      <div class="dash-grid">
        <div class="dash-card dash-card--wide">
          <h3 class="dash-card__title">待复习</h3>
          <ul class="dash-mistake-list">
            ${mistakeItems.map((m) => `
              <li>
                <span class="dash-tag dash-tag--${m.subject === '听力' ? 'red' : m.subject === '阅读' ? 'blue' : 'green'}">${escapeHtml(m.subject)}</span>
                <span>${escapeHtml(m.label)}</span>
                <button class="dash-card__action">${escapeHtml(m.action)}</button>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="dash-card">
          <h3 class="dash-card__title">高频错因</h3>
          <ul class="dash-list dash-list--clean">
            ${errorPatterns.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>
        <div class="dash-card">
          <h3 class="dash-card__title">复习计划</h3>
          <p class="dash-card__caption">按艾宾浩斯曲线推送，今日需复习 ${mistakeItems.length} 题。</p>
          <button class="dash-card__action">开始复习</button>
        </div>
      </div>
    `;
  }

  // 日志进度：优先用 memory profile 数据
  async function renderLogsDashboard() {
    const container = document.getElementById('logsView');
    if (!container) return;

    let streakDays = 14;
    let totalDays = 21;
    let weeklyHours = 18.5;
    let weeklyFocus = ['听力填空正确率提升 12%', '写作 Task 2 完成 2 篇', '单词新学 140 个'];

    const profile = await fetchMemoryProfile();
    if (profile) {
      if (profile.streak_days != null) streakDays = profile.streak_days;
      if (profile.total_days != null) totalDays = profile.total_days;
      if (profile.weekly_hours != null) weeklyHours = profile.weekly_hours;
      if (Array.isArray(profile.weekly_focus) && profile.weekly_focus.length) {
        weeklyFocus = profile.weekly_focus;
      }
    }

    container.innerHTML = `
      <div class="dash-hero">
        <h2 class="dash-hero__title">日志进度</h2>
        <p class="dash-hero__subtitle">${streakDays} / ${totalDays} 天 · 连续打卡</p>
      </div>
      <div class="dash-grid">
        <div class="dash-card dash-card--wide">
          <h3 class="dash-card__title">本周学习</h3>
          <div class="dash-weekly">
            ${['一', '二', '三', '四', '五', '六', '日'].map((d, i) => `
              <div class="dash-day ${i < 5 ? 'is-active' : ''}">
                <span class="dash-day__bar" style="height: ${[60, 80, 45, 90, 70, 0, 0][i]}%"></span>
                <span class="dash-day__label">${d}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="dash-card">
          <h3 class="dash-card__title">本周焦点</h3>
          <ul class="dash-list dash-list--clean">
            ${weeklyFocus.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
          </ul>
        </div>
        <div class="dash-card">
          <h3 class="dash-card__title">学习时长</h3>
          <div class="dash-card__metric">
            <span class="dash-card__value">${weeklyHours}</span>
            <span class="dash-card__unit">小时</span>
          </div>
          <p class="dash-card__caption">本周累计</p>
        </div>
      </div>
    `;
  }

  // 单词视图：优先用 memory profile 数据
  async function renderWordView() {
    const container = document.getElementById('wordView');
    if (!container) return;

    // 默认 mock 单词数据
    let words = [
      { word: 'accommodation', meaning: 'n. 住宿', status: 'mastered' },
      { word: 'ambivalent', meaning: 'adj. 矛盾的', status: 'learning' },
      { word: 'bureaucracy', meaning: 'n. 官僚机构', status: 'review' },
      { word: 'commence', meaning: 'v. 开始', status: 'learning' },
      { word: 'detrimental', meaning: 'adj. 有害的', status: 'mastered' },
      { word: 'empirical', meaning: 'adj. 实证的', status: 'review' },
      { word: 'fluctuate', meaning: 'v. 波动', status: 'learning' },
      { word: 'hypothesis', meaning: 'n. 假设', status: 'mastered' },
    ];

    const profile = await fetchMemoryProfile();
    if (profile && Array.isArray(profile.words) && profile.words.length) {
      words = profile.words.map((w) => ({
        word: w.word || '',
        meaning: w.meaning || w.translation || '',
        status: w.status || 'learning',
      }));
    }

    const masteredCount = words.filter((w) => w.status === 'mastered').length;
    const learningCount = words.filter((w) => w.status === 'learning').length;
    const reviewCount = words.filter((w) => w.status === 'review').length;

    container.innerHTML = `
      <div class="dash-hero">
        <h2 class="dash-hero__title">单词</h2>
        <p class="dash-hero__subtitle">${masteredCount} 已掌握 · ${learningCount} 学习中 · ${reviewCount} 待复习</p>
      </div>
      <div class="word-toolbar">
        <button class="dash-card__action is-active" data-filter="all">全部</button>
        <button class="dash-card__action" data-filter="learning">学习中</button>
        <button class="dash-card__action" data-filter="mastered">已掌握</button>
        <button class="dash-card__action" data-filter="review">待复习</button>
      </div>
      <div class="word-grid">
        ${words.map((item) => `
          <div class="word-card" data-status="${escapeHtml(item.status)}">
            <div class="word-card__word">${escapeHtml(item.word)}</div>
            <div class="word-card__meaning">${escapeHtml(item.meaning)}</div>
            <span class="word-card__status word-card__status--${escapeHtml(item.status)}">${{
              mastered: '已掌握',
              learning: '学习中',
              review: '待复习',
            }[item.status] || '学习中'}</span>
          </div>
        `).join('')}
      </div>
    `;

    const buttons = container.querySelectorAll('.word-toolbar button');
    const cards = container.querySelectorAll('.word-card');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          card.hidden = filter !== 'all' && card.dataset.status !== filter;
        });
      });
    });
  }

  function renderListeningLibrary() {
    const container = document.getElementById('listeningLibrary');
    container.innerHTML = `
      <div class="library-header">
        <h2 class="library-header__title">听力真题</h2>
        <div class="filter-bar">
          <span class="filter-bar__label">题型：</span>
          <button class="filter-btn is-active" data-filter="all">全部</button>
          <button class="filter-btn" data-filter="填空">填空</button>
          <button class="filter-btn" data-filter="单选">单选</button>
          <button class="filter-btn" data-filter="多选">多选</button>
          <button class="filter-btn" data-filter="匹配">匹配</button>
          <button class="filter-btn" data-filter="地图">地图</button>
        </div>
      </div>
      <div class="book-list">
        ${books.map((book) => renderBookCard(book, 4, listeningPartTypes, 'Part')).join('')}
      </div>
    `;
    attachFilterEvents(container, 'listening');
    attachPartEvents(container, 'listening');
  }

  function renderReadingLibrary() {
    const container = document.getElementById('readingLibrary');
    container.innerHTML = `
      <div class="library-header">
        <h2 class="library-header__title">阅读真题</h2>
        <div class="filter-bar">
          <span class="filter-bar__label">题型：</span>
          <button class="filter-btn is-active" data-filter="all">全部</button>
          <button class="filter-btn" data-filter="填词">填词</button>
          <button class="filter-btn" data-filter="判断">判断</button>
          <button class="filter-btn" data-filter="单选">单选</button>
          <button class="filter-btn" data-filter="段落配对">段落配对</button>
        </div>
      </div>
      <div class="book-list">
        ${books.map((book) => renderBookCard(book, 4, readingPartTypes, 'Passage')).join('')}
      </div>
    `;
    attachFilterEvents(container, 'reading');
    attachPartEvents(container, 'reading');
  }

  function renderWritingLibrary() {
    const container = document.getElementById('writingLibrary');
    container.innerHTML = `
      <div class="library-header">
        <h2 class="library-header__title">写作真题</h2>
      </div>
      <div class="book-list">
        ${books.map((book) => renderBookCard(book, 4, writingPartTypes, 'Task', true)).join('')}
      </div>
    `;
    attachPartEvents(container, 'writing');
  }

  function renderSpeakingLibrary() {
    const container = document.getElementById('speakingLibrary');
    container.innerHTML = `
      <div class="library-header">
        <h2 class="library-header__title">口语真题</h2>
      </div>
      <div class="book-list">
        ${books.map((book) => renderBookCard(book, 4, speakingPartTypes, 'Part', true)).join('')}
      </div>
    `;
    attachPartEvents(container, 'speaking');
  }

  function renderBookCard(book, testCount, partTypes, partLabel, isWriting = false) {
    const partCount = partTypes.length;
    const totalParts = testCount * partCount;
    return `
      <div class="book-card">
        <div class="book-card__header">
          <h3 class="book-card__title">剑雅 ${book}</h3>
          <span class="book-card__meta">${testCount} Tests · ${totalParts} ${isWriting ? 'Tasks' : 'Parts'}</span>
        </div>
        <div class="test-grid">
          ${Array.from({ length: testCount }, (_, i) => i + 1).map((test) => `
            <div class="test-card">
              <div class="test-card__title">Test ${test}</div>
              <div class="part-list">
                ${partTypes.map((type, idx) => {
                  // 写作/口语：(Task|Part) N + 描述 → partName='Task 1'/'Part 1', typeName='图表'/'日常'
                  // 其他：partName='Part 1', typeName=type
                  let partName, typeName;
                  if (isWriting) {
                    const m = type.match(/^((?:Task|Part)\s*\d+)\s*(.*)$/i);
                    if (m) { partName = m[1].replace(/\s+/, ' '); typeName = m[2] || ''; }
                    else { partName = type; typeName = ''; }
                  } else {
                    partName = `${partLabel} ${idx + 1}`;
                    typeName = type;
                  }
                  return `
                    <button class="part-item" data-book="剑雅${book}" data-test="Test ${test}" data-part="${partName}" data-type="${typeName}">
                      <span class="part-item__name">${partName} ${typeName}</span>
                      <span class="part-item__status">未开始</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function attachFilterEvents(container, mode) {
    const filters = container.querySelectorAll('.filter-btn');
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.forEach((f) => f.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        container.querySelectorAll('.part-item').forEach((item) => {
          const type = item.dataset.type || '';
          const shouldShow = filter === 'all' || type.includes(filter);
          item.style.display = shouldShow ? '' : 'none';
        });
      });
    });
  }

  function attachPartEvents(container, mode) {
    container.querySelectorAll('.part-item').forEach((item) => {
      item.addEventListener('click', () => {
        const book = item.dataset.book;
        const test = item.dataset.test;
        const part = item.dataset.part;
        const type = item.dataset.type;
        enterConfirm(mode, book, test, part, type);
      });
    });
  }

  // ===== Practice view =====
  function setPracticePanel(mode, isPractice) {
    const libraryPanel = document.querySelector(`[data-panel="${mode}-library"]`);
    const practicePanel = document.querySelector(`[data-panel="${mode}"]`);
    if (libraryPanel) libraryPanel.hidden = isPractice;
    if (practicePanel) practicePanel.hidden = !isPractice;
  }

  function resetPracticeView(mode) {
    const view = document.querySelector(`.view[data-view="${mode}"]`);
    if (!view) return;
    const library = view.querySelector('[data-stage="library"]');
    const confirm = view.querySelector('[data-stage="confirm"]');
    const practice = view.querySelector('[data-stage="practice"]');
    if (library && practice) {
      library.hidden = false;
      practice.hidden = true;
    }
    if (confirm) confirm.hidden = true;
    app.classList.remove('is-practice');
    stopTimer();

    setLeftSidebarOpen(true);
    setRightSidebarOpen(false);
    setPracticePanel(mode, false);
    currentSectionData = null;
  }

  function enterConfirm(mode, book, test, part, type) {
    currentPracticeMode = mode;
    currentPracticeMeta = { book, test, part, type };

    const view = document.querySelector(`.view[data-view="${mode}"]`);
    if (!view) return;
    const library = view.querySelector('[data-stage="library"]');
    const confirm = view.querySelector('[data-stage="confirm"]');
    if (!library || !confirm) return;

    library.hidden = true;
    confirm.hidden = false;

    renderConfirmPage(mode, book, test, part, type);
  }

  function enterPractice(mode, book, test, part, type) {
    const view = document.querySelector(`.view[data-view="${mode}"]`);
    if (!view) return;
    const confirm = view.querySelector('[data-stage="confirm"]');
    const practice = view.querySelector('[data-stage="practice"]');
    if (!confirm || !practice) return;

    confirm.hidden = true;
    practice.hidden = false;

    app.classList.add('is-practice');
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
    setPracticePanel(mode, true);

    renderPracticePage(mode, book, test, part, type);
    startTimer();
  }

  // 渲染练习页面（异步加载题目）
  function renderPracticePage(mode, book, test, part, type) {
    if (mode === 'listening') renderListeningPractice(book, test, part, type);
    if (mode === 'reading') renderReadingPractice(book, test, part, type);
    if (mode === 'writing') renderWritingPractice(book, test, part, type);
    if (mode === 'speaking') renderSpeakingPractice(book, test, part, type);
  }

  const confirmAgents = {
    listening: { name: '听力 Agent', exam: '听力' },
    reading: { name: '阅读 Agent', exam: '阅读' },
    writing: { name: '写作 Agent', exam: '写作' },
    speaking: { name: '口语 Agent', exam: '口语' },
  };

  function renderConfirmPage(mode, book, test, part, type) {
    const container = document.getElementById(`${mode}ConfirmPage`);
    if (!container) return;
    const agent = confirmAgents[mode];
    container.innerHTML = `
      <div class="confirm-card">
        <div class="confirm-card__avatar"></div>
        <div class="confirm-card__agent">${agent.name}</div>
        <div class="confirm-card__messages">
          <p>欢迎同学来到剑雅真题模拟。</p>
          <p>如果你准备好，点击下方按钮，开始${agent.exam}考试。</p>
        </div>
        <button class="btn btn--primary confirm-card__start" id="startPractice">开始答题</button>
      </div>
    `;

    const startBtn = container.querySelector('#startPractice');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        enterPractice(mode, book, test, part, type);
      });
    }
  }

  // ===== 题目渲染辅助函数 =====

  // 渲染填空题：将 question_text 中的 "数字. " 标记替换为 input
  function renderFillBlankText(text, qOrder) {
    const safe = escapeHtml(text || '');
    // 检查是否有数字标记（如 "1. " "2. "）
    if (/\b(\d+)\.\s/.test(text || '')) {
      // 有数字标记，替换为 input
      return `<p class="question-text">${safe.replace(/\b(\d+)\.\s/g, (match, num) =>
        `<input type="text" class="blank-input" data-q="${num}" placeholder="answer"> `
      )}</p>`;
    }
    // 无标记，追加 input
    return `
      <p class="question-text">${qOrder || ''}. ${safe}</p>
      <input type="text" class="blank-input" data-q="${qOrder}" placeholder="answer">
    `;
  }

  // 渲染选择题（单选/多选/TFNG）
  function renderChoiceQuestion(q) {
    const options = q.options || [];
    const inputType = q.question_type === 'multiple_choice_multiple' ? 'checkbox' : 'radio';
    return `
      <div class="choice-item">
        <p class="choice-item__q">${q.order || ''}. ${escapeHtml(q.question_text || '')}</p>
        <div class="choices">
          ${options.map((opt) => `
            <label class="choice">
              <input type="${inputType}" name="q${q.order}" value="${escapeHtml(opt)}"> ${escapeHtml(opt)}
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 渲染听力题目列表
  function renderListeningQuestions(questions) {
    if (!questions || !questions.length) return '<p class="empty-tip">暂无题目数据</p>';

    const sorted = [...questions].sort((a, b) => (a.order || 0) - (b.order || 0));

    // 听力填空题：多道题共享同一 question_text，去重后只渲染一次
    const seenTexts = new Set();
    const htmlParts = [];
    let blankCount = 0;

    for (const q of sorted) {
      if (q.question_type === 'fill_blank' || (!q.options && q.question_text)) {
        // 填空题：按 question_text 去重
        const textKey = q.question_text || '';
        if (textKey && !seenTexts.has(textKey)) {
          seenTexts.add(textKey);
          htmlParts.push(`<div class="question-block">${renderFillBlankText(q.question_text, q.order)}</div>`);
        }
        // 统计填空数量（用于题号导航）
        const blanks = textKey.match(/\b\d+\.\s/g);
        if (blanks) blankCount += blanks.length;
      } else if (['multiple_choice', 'tfng', 'matching', 'multiple_choice_multiple'].includes(q.question_type)) {
        htmlParts.push(`<div class="question-block">${renderChoiceQuestion(q)}</div>`);
      } else {
        htmlParts.push(`<div class="question-block">${renderFillBlankText(q.question_text, q.order)}</div>`);
      }
    }

    return htmlParts.join('');
  }

  // 渲染阅读题目（stimulus 共享，只渲染一次）
  function renderReadingQuestions(questions) {
    if (!questions || !questions.length) return '<p class="empty-tip">暂无题目数据</p>';

    const sorted = [...questions].sort((a, b) => (a.order || 0) - (b.order || 0));

    return sorted.map((q) => {
      if (q.question_type === 'fill_blank') {
        return `<div class="question-block">${renderFillBlankText(q.question_text, q.order)}</div>`;
      }
      if (['multiple_choice', 'tfng', 'matching', 'multiple_choice_multiple'].includes(q.question_type)) {
        return renderChoiceQuestion(q);
      }
      return `<div class="question-block"><p>${q.order || ''}. ${escapeHtml(q.question_text || '')}</p></div>`;
    }).join('');
  }

  // ===== 听力练习页面（异步加载真实题目） =====
  async function renderListeningPractice(book, test, part, type) {
    const container = document.getElementById('listeningPracticePage');
    if (!container) return;

    // 先渲染骨架，显示加载状态
    container.innerHTML = `
      <header class="practice-page__header">
        <button class="practice-page__back" id="backToLibrary">← 返回选题</button>
        <div class="practice-page__part">${part}</div>
        <div class="practice-page__audio">
          <button class="audio-play-btn" id="audioPlayBtn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="audio-track">
            <div class="audio-track__progress" id="audioProgress"></div>
          </div>
          <span class="audio-track__time" id="audioTime">00:00 / 00:00</span>
        </div>
        <div class="practice-page__timer" id="practiceTimer">00:00</div>
      </header>
      <div class="practice-page__body" id="practiceBody">
        <div class="practice-page__path">
          <span>${book}</span>
          <span>${test}</span>
          <span>${part} ${type}</span>
        </div>
        <p class="empty-tip">加载题目中...</p>
      </div>
      <footer class="practice-page__footer">
        <label class="review-check">
          <input type="checkbox" id="reviewCheck">
          <span>Review</span>
        </label>
        <div class="part-tabs">
          <button class="part-tab is-active">${part}</button>
        </div>
        <div class="nav-arrows">
          <button class="nav-arrow" id="prevQuestion" aria-label="上一题">←</button>
          <button class="nav-arrow" id="nextQuestion" aria-label="下一题">→</button>
        </div>
      </footer>
      <div class="practice-page__submit-bar">
        <button class="btn btn--primary" id="submitPractice">提交答案</button>
      </div>
    `;
    attachPracticeEvents(container, 'listening');

    // 异步加载题目
    const body = container.querySelector('#practiceBody');
    const apiBook = parseBookName(book);
    const apiTest = parseTestName(test);
    const apiSection = parseSectionName(part, 'listening');

    try {
      const sectionData = await fetchSection(apiBook, apiTest, 'listening', apiSection);
      currentSectionData = sectionData;

      // 渲染题目内容
      const instructions = sectionData.instructions || 'Listen and answer the questions.';
      const questionsHtml = renderListeningQuestions(sectionData.questions);

      body.innerHTML = `
        <div class="practice-page__path">
          <span>${book}</span>
          <span>${test}</span>
          <span>${part} ${type}</span>
        </div>
        <div class="question-block">
          <p class="question-block__instruction">${escapeHtml(instructions)}</p>
        </div>
        ${questionsHtml}
      `;

      // 绑定音频
      const audioUrl = sectionData.media && sectionData.media[0] ? sectionData.media[0].url : null;
      startAudio(audioUrl);
    } catch (e) {
      console.warn('加载听力题目失败:', e);
      currentSectionData = null;
      body.innerHTML = `
        <div class="practice-page__path">
          <span>${book}</span>
          <span>${test}</span>
          <span>${part} ${type}</span>
        </div>
        <p class="empty-tip">题目加载失败，请检查后端服务是否运行。</p>
      `;
      startAudioMock();
    }
  }

  // ===== 阅读练习页面 =====
  async function renderReadingPractice(book, test, part, type) {
    const container = document.getElementById('readingPracticePage');
    if (!container) return;

    container.innerHTML = `
      <header class="practice-page__header">
        <button class="practice-page__back" id="backToLibrary">← 返回选题</button>
        <div class="practice-page__part">${part}</div>
        <div class="practice-page__timer" id="practiceTimer">00:00</div>
      </header>
      <div class="practice-page__body reading-split">
        <div class="passage-panel">
          <div class="practice-page__path">
            <span>${book}</span>
            <span>${test}</span>
            <span>${part} ${type}</span>
          </div>
          <p class="empty-tip">加载文章中...</p>
        </div>
        <div class="questions-panel">
          <p class="empty-tip">加载题目中...</p>
        </div>
      </div>
      <footer class="practice-page__footer">
        <label class="review-check"><input type="checkbox" id="reviewCheck"><span>Review</span></label>
        <div class="part-tabs"><button class="part-tab is-active">${part}</button></div>
        <div class="nav-arrows">
          <button class="nav-arrow" id="prevQuestion">←</button>
          <button class="nav-arrow" id="nextQuestion">→</button>
        </div>
      </footer>
      <div class="practice-page__submit-bar">
        <button class="btn btn--primary" id="submitPractice">提交答案</button>
      </div>
    `;
    attachPracticeEvents(container, 'reading');

    const passagePanel = container.querySelector('.passage-panel');
    const questionsPanel = container.querySelector('.questions-panel');
    const apiBook = parseBookName(book);
    const apiTest = parseTestName(test);
    const apiSection = parseSectionName(part, 'reading');

    try {
      const sectionData = await fetchSection(apiBook, apiTest, 'reading', apiSection);
      currentSectionData = sectionData;

      // stimulus 是共享文章，只渲染一次
      const stimulus = sectionData.questions && sectionData.questions[0]
        ? (sectionData.questions[0].stimulus || '')
        : '';
      const instructions = sectionData.instructions || '';

      passagePanel.innerHTML = `
        <div class="practice-page__path">
          <span>${book}</span>
          <span>${test}</span>
          <span>${part} ${type}</span>
        </div>
        ${stimulus ? stimulus.split(/\n\n+/).map((p) => `<p>${escapeHtml(p)}</p>`).join('') : '<p class="empty-tip">无文章内容</p>'}
      `;

      questionsPanel.innerHTML = `
        <div class="question-block">
          <p class="question-block__instruction">${escapeHtml(instructions)}</p>
        </div>
        ${renderReadingQuestions(sectionData.questions)}
      `;
    } catch (e) {
      console.warn('加载阅读题目失败:', e);
      currentSectionData = null;
      passagePanel.innerHTML = `
        <div class="practice-page__path">
          <span>${book}</span>
          <span>${test}</span>
          <span>${part} ${type}</span>
        </div>
        <p class="empty-tip">文章加载失败，请检查后端服务是否运行。</p>
      `;
      questionsPanel.innerHTML = '<p class="empty-tip">题目加载失败。</p>';
    }
  }

  // ===== 写作练习页面 =====
  async function renderWritingPractice(book, test, part, type) {
    const container = document.getElementById('writingPracticePage');
    if (!container) return;
    const isTask1 = part === 'Task 1';

    container.innerHTML = `
      <header class="practice-page__header">
        <button class="practice-page__back" id="backToLibrary">← 返回选题</button>
        <div class="practice-page__part">${part}</div>
        <div class="practice-page__timer" id="practiceTimer">${isTask1 ? '20:00' : '40:00'}</div>
      </header>
      <div class="practice-page__body">
        <div class="practice-page__path">
          <span>${book}</span>
          <span>${test}</span>
          <span>${part} ${type}</span>
        </div>
        <div class="question-block">
          <p class="empty-tip">加载题目中...</p>
        </div>
        <textarea class="writing-area" id="writingAnswer" placeholder="在此输入你的作文..."></textarea>
        <div class="writing-meta">
          <span id="wordCount">字数：0</span>
          <span>目标：${isTask1 ? '≥150' : '≥250'} 词</span>
        </div>
      </div>
      <footer class="practice-page__footer">
        <label class="review-check"><input type="checkbox" id="reviewCheck"><span>Review</span></label>
        <div class="part-tabs"><button class="part-tab is-active">${part}</button></div>
      </footer>
      <div class="practice-page__submit-bar">
        <button class="btn btn--primary" id="submitPractice">提交作文</button>
      </div>
    `;
    attachPracticeEvents(container, 'writing');

    // 字数统计
    const writingArea = container.querySelector('#writingAnswer');
    const wordCount = container.querySelector('#wordCount');
    if (writingArea && wordCount) {
      writingArea.addEventListener('input', () => {
        const count = writingArea.value.trim().split(/\s+/).filter(Boolean).length;
        wordCount.textContent = `字数：${count}`;
      });
    }

    // 异步加载题目
    const questionBlock = container.querySelector('.question-block');
    const apiBook = parseBookName(book);
    const apiTest = parseTestName(test);
    const apiSection = parseSectionName(part, 'writing');

    try {
      const sectionData = await fetchSection(apiBook, apiTest, 'writing', apiSection);
      currentSectionData = sectionData;

      // 写作题目：取第一道题的 question_text 作为写作题目
      const firstQuestion = sectionData.questions && sectionData.questions[0];
      const questionText = firstQuestion ? (firstQuestion.question_text || '') : '';
      const instructions = sectionData.instructions || (isTask1
        ? 'You should spend about 20 minutes on this task. Summarise the information by selecting and reporting the main features.'
        : 'Write about the following topic. Give reasons for your answer and include any relevant examples.');

      questionBlock.innerHTML = `
        <p class="question-block__instruction"><strong>${part}</strong> — ${escapeHtml(instructions)}</p>
        <div class="question-prompt">${escapeHtml(questionText)}</div>
      `;
    } catch (e) {
      console.warn('加载写作题目失败:', e);
      currentSectionData = null;
      questionBlock.innerHTML = `
        <p class="question-block__instruction"><strong>${part}</strong> — ${isTask1 ? 'Summarise the information.' : 'Write about the following topic.'}</p>
        <div class="question-prompt">题目加载失败，请检查后端服务。</div>
      `;
    }
  }

  // ===== 口语练习页面 =====
  async function renderSpeakingPractice(book, test, part, type) {
    const container = document.getElementById('speakingPracticePage');
    if (!container) return;
    const isPart2 = part === 'Part 2';

    container.innerHTML = `
      <header class="practice-page__header">
        <button class="practice-page__back" id="backToLibrary">← 返回选题</button>
        <div class="practice-page__part">${part}</div>
        <div class="practice-page__timer" id="practiceTimer">02:00</div>
      </header>
      <div class="practice-page__body">
        <div class="practice-page__path">
          <span>${book}</span>
          <span>${test}</span>
          <span>${type}</span>
        </div>
        <div class="question-block">
          <p class="empty-tip">加载题目中...</p>
        </div>
        <div class="recorder">
          <button class="recorder__btn" id="recordBtn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
          <p class="recorder__hint" id="recordHint">点击开始录音</p>
        </div>
        <textarea class="writing-area" id="speakingAnswer" placeholder="或在此输入你说的内容（用于文本评分）..." style="min-height: 120px; margin-top: 16px;"></textarea>
      </div>
      <footer class="practice-page__footer">
        <label class="review-check"><input type="checkbox" id="reviewCheck"><span>Review</span></label>
        <div class="part-tabs"><button class="part-tab is-active">${part}</button></div>
      </footer>
      <div class="practice-page__submit-bar">
        <button class="btn btn--primary" id="submitPractice">提交回答</button>
      </div>
    `;
    attachPracticeEvents(container, 'speaking');

    // 录音按钮 mock
    const recordBtn = container.querySelector('#recordBtn');
    const recordHint = container.querySelector('#recordHint');
    if (recordBtn && recordHint) {
      let isRecording = false;
      recordBtn.addEventListener('click', () => {
        isRecording = !isRecording;
        recordBtn.classList.toggle('is-recording', isRecording);
        recordHint.textContent = isRecording ? '录音中... 再次点击结束' : '点击开始录音';
      });
    }

    // 异步加载题目
    const questionBlock = container.querySelector('.question-block');
    const apiBook = parseBookName(book);
    const apiTest = parseTestName(test);
    const apiSection = parseSectionName(part, 'speaking');

    try {
      const sectionData = await fetchSection(apiBook, apiTest, 'speaking', apiSection);
      currentSectionData = sectionData;

      const firstQuestion = sectionData.questions && sectionData.questions[0];
      const questionText = firstQuestion ? (firstQuestion.question_text || '') : '';
      const instructions = sectionData.instructions || (isPart2
        ? 'You will have 1 minute to prepare and 1-2 minutes to speak.'
        : 'Answer the questions below.');

      questionBlock.innerHTML = `
        <p class="question-block__instruction"><strong>${part}</strong> — ${escapeHtml(instructions)}</p>
        <div class="question-prompt">${escapeHtml(questionText)}</div>
      `;
    } catch (e) {
      console.warn('加载口语题目失败:', e);
      currentSectionData = null;
      questionBlock.innerHTML = `
        <p class="question-block__instruction"><strong>${part}</strong> — ${isPart2 ? 'You will have 1 minute to prepare.' : 'Answer the questions.'}</p>
        <div class="question-prompt">题目加载失败，请检查后端服务。</div>
      `;
    }
  }

  function attachPracticeEvents(container, mode) {
    // 返回按钮
    const backBtn = container.querySelector('#backToLibrary');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (currentPracticeMode) resetPracticeView(currentPracticeMode);
      });
    }

    // 提交按钮
    const submitBtn = container.querySelector('#submitPractice');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => submitPractice(mode));
    }

    // 上一题/下一题（聚焦到对应 input）
    const prevBtn = container.querySelector('#prevQuestion');
    const nextBtn = container.querySelector('#nextQuestion');
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => navigateBlank(container, -1));
      nextBtn.addEventListener('click', () => navigateBlank(container, 1));
    }
  }

  // 在填空 input 之间导航
  function navigateBlank(container, delta) {
    const inputs = Array.from(container.querySelectorAll('.blank-input, input[type="radio"], input[type="checkbox"]'));
    if (!inputs.length) return;
    const active = document.activeElement;
    const currentIndex = inputs.indexOf(active);
    const nextIndex = Math.max(0, Math.min(inputs.length - 1, (currentIndex < 0 ? 0 : currentIndex) + delta));
    inputs[nextIndex].focus();
  }

  // ===== Timer =====
  function startTimer() {
    stopTimer();
    const timerEl = document.getElementById('practiceTimer');
    if (!timerEl) return;
    let seconds = 0;
    timerEl.textContent = formatTime(seconds);
    currentTimer = setInterval(() => {
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    if (currentTimer) {
      clearInterval(currentTimer);
      currentTimer = null;
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ===== Audio 播放 =====
  // 真实音频播放（使用 HTML5 Audio 对象）
  function startAudio(audioUrl) {
    const btn = document.getElementById('audioPlayBtn');
    const progress = document.getElementById('audioProgress');
    const time = document.getElementById('audioTime');
    if (!btn || !progress || !time) return;

    if (!audioUrl) {
      startAudioMock();
      return;
    }

    let audio = null;
    let isPlaying = false;

    try {
      audio = new Audio(audioUrl);
    } catch (e) {
      console.warn('音频对象创建失败，回退到 mock:', e);
      startAudioMock();
      return;
    }

    audio.addEventListener('timeupdate', () => {
      const dur = audio.duration || 0;
      const cur = audio.currentTime || 0;
      const pct = dur > 0 ? (cur / dur) * 100 : 0;
      progress.style.width = `${pct}%`;
      time.textContent = `${formatTime(Math.floor(cur))} / ${formatTime(Math.floor(dur))}`;
    });

    audio.addEventListener('ended', () => {
      isPlaying = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    });

    audio.addEventListener('error', () => {
      console.warn('音频加载失败，回退到 mock 播放');
      startAudioMock();
    });

    btn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btn.innerHTML = isPlaying
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      if (isPlaying) {
        audio.play().catch((e) => {
          console.warn('音频播放失败:', e);
          isPlaying = false;
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        });
      } else {
        audio.pause();
      }
    });
  }

  // Audio mock（API 无音频时回退使用）
  function startAudioMock() {
    const btn = document.getElementById('audioPlayBtn');
    const progress = document.getElementById('audioProgress');
    const time = document.getElementById('audioTime');
    if (!btn || !progress || !time) return;

    let isPlaying = false;
    let audioSeconds = 0;
    let audioInterval = null;
    const totalSeconds = 332;

    btn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btn.innerHTML = isPlaying
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

      if (isPlaying) {
        audioInterval = setInterval(() => {
          audioSeconds++;
          if (audioSeconds > totalSeconds) audioSeconds = totalSeconds;
          const pct = (audioSeconds / totalSeconds) * 100;
          progress.style.width = `${pct}%`;
          time.textContent = `${formatTime(audioSeconds)} / ${formatTime(totalSeconds)}`;
          if (audioSeconds >= totalSeconds) {
            clearInterval(audioInterval);
            isPlaying = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
          }
        }, 1000);
      } else {
        clearInterval(audioInterval);
      }
    });
  }

  // ===== Submit =====
  async function submitPractice(mode) {
    stopTimer();
    const container = document.querySelector(`.view[data-view="${mode}"] .practice-page`);
    if (!container) return;

    if (mode === 'listening') await submitListeningPractice(container);
    if (mode === 'reading') await submitReadingPractice(container);
    if (mode === 'writing') await submitWritingPractice(container);
    if (mode === 'speaking') await submitSpeakingPractice(container);

    // 标记提示状态
    const practiceView = container.closest('.practice-view');
    if (practiceView && practiceView.dataset.hinted === 'true') {
      console.log('本题已标记【提示】');
    }
  }

  // 提交听力：调用后端评分，失败回退到本地对比
  async function submitListeningPractice(container) {
    // 收集填空答案
    const answers = {};
    container.querySelectorAll('.blank-input').forEach((input) => {
      const q = input.dataset.q;
      if (q) answers[q] = input.value.trim();
    });
    // 收集 radio/checkbox 答案
    container.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked').forEach((input) => {
      const name = input.name || '';
      const qNum = name.replace('q', '');
      if (qNum) {
        if (!answers[qNum]) answers[qNum] = input.value;
        else answers[qNum] += ',' + input.value;
      }
    });

    // 尝试调用后端评分
    if (currentSectionData && currentSectionData.questions) {
      // 转换为后端期望的格式：user_answers 和 correct_answers 列表
      const sortedQuestions = [...currentSectionData.questions].sort((a, b) => (a.order || 0) - (b.order || 0));
      const userAnswers = sortedQuestions.map((q) => answers[String(q.order)] || '');
      const correctAnswers = sortedQuestions.map((q) => q.correct_answer || '');
      try {
        const result = await apiInvoke('listening', {
          user_answers: userAnswers,
          correct_answers: correctAnswers,
          section_id: currentSectionData.section_id,
        });
        const listeningResult = result?.state?.listening_result;
        if (listeningResult) {
          showListeningBackendResult(container, listeningResult);
          return;
        }
      } catch (e) {
        console.warn('听力后端评分失败，回退到本地对比:', e);
      }
      // 回退到本地对比
      showListeningLocalResult(container, answers);
      return;
    }

    // 无 section 数据，仅显示已提交
    showResult(container, '已提交', '未加载到题目数据，无法评分。');
  }

  // 显示后端返回的听力评分结果
  function showListeningBackendResult(container, result) {
    const score = result.score ?? 0;
    const total = result.total ?? 0;
    const pct = result.percentage ?? 0;
    const band = result.band_estimate ?? 0;
    let html = `<h4>得分：${score}/${total} (${Math.round(pct)}%) · 预估 Band ${band}</h4>`;
    // 如果后端返回了逐题详情
    const details = result.details || result.question_results;
    if (Array.isArray(details) && details.length) {
      html += '<pre>';
      details.forEach((d) => {
        const isCorrect = d.correct || d.is_correct;
        html += `Q${d.question || d.order}: ${isCorrect ? '✅' : '❌'} 你的答案 "${d.user_answer || '(空)'}"，正确答案 "${d.correct_answer || d.answer || ''}"\n`;
      });
      html += '</pre>';
    } else {
      // 后端没有逐题详情，用本地数据补充
      const errors = result.errors || [];
      if (errors.length) {
        html += '<pre>';
        errors.forEach((e) => {
          html += `❌ Q${e.question || '?'}: 你的答案 "${e.user_answer || '(空)'}"，正确答案 "${e.correct_answer || ''}"\n`;
          const etype = e.error_type || e.type;
          if (etype) html += `  错误类型：${etype}${e.explanation ? ' (' + e.explanation + ')' : ''}\n`;
        });
        html += '</pre>';
      } else if (score === total && total > 0) {
        html += '<pre>全部正确！</pre>';
      }
    }
    showResultHtml(container, html);
  }

  // 本地对比听力答案
  function showListeningLocalResult(container, answers) {
    if (!currentSectionData || !currentSectionData.questions) {
      showResult(container, '已提交', '未加载到题目数据，无法评分。');
      return;
    }

    let correct = 0;
    let total = 0;
    const resultItems = [];

    currentSectionData.questions.forEach((q) => {
      const qNum = String(q.order);
      const userAnswer = (answers[qNum] || '').trim().toLowerCase();
      const correctAnswer = (q.correct_answer || '').trim().toLowerCase();
      const isCorrect = userAnswer && correctAnswer && userAnswer === correctAnswer;
      if (isCorrect) correct++;
      total++;
      resultItems.push(`Q${qNum}: ${isCorrect ? '✅' : '❌'} 你的答案 "${userAnswer || '(空)'}"，正确答案 "${correctAnswer || '-'}"`);

      // 高亮 input
      const input = container.querySelector(`.blank-input[data-q="${qNum}"]`);
      if (input) {
        input.classList.toggle('is-correct', isCorrect);
        input.classList.toggle('is-wrong', !isCorrect);
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    showResult(container, `得分：${correct}/${total} (${score}%)`, resultItems.join('\n'));
  }

  // 提交阅读：调用后端评分，失败回退到本地对比
  async function submitReadingPractice(container) {
    const answers = {};
    container.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked').forEach((input) => {
      const name = input.name || '';
      const qNum = name.replace('q', '');
      if (qNum) {
        if (!answers[qNum]) answers[qNum] = input.value;
        else answers[qNum] += ',' + input.value;
      }
    });
    // 也收集填空
    container.querySelectorAll('.blank-input').forEach((input) => {
      const q = input.dataset.q;
      if (q && !answers[q]) answers[q] = input.value.trim();
    });

    if (currentSectionData && currentSectionData.questions) {
      // 转换为后端期望的格式
      const sortedQuestions = [...currentSectionData.questions].sort((a, b) => (a.order || 0) - (b.order || 0));
      const userAnswers = sortedQuestions.map((q) => answers[String(q.order)] || '');
      const correctAnswers = sortedQuestions.map((q) => q.correct_answer || '');
      const questionTypes = sortedQuestions.map((q) => q.question_type || '');
      try {
        const result = await apiInvoke('reading', {
          user_answers: userAnswers,
          correct_answers: correctAnswers,
          question_types: questionTypes,
          section_id: currentSectionData.section_id,
        });
        const readingResult = result?.state?.reading_result;
        if (readingResult) {
          showReadingBackendResult(container, readingResult);
          return;
        }
      } catch (e) {
        console.warn('阅读后端评分失败，回退到本地对比:', e);
      }
      showReadingLocalResult(container, answers);
      return;
    }

    showResult(container, '已提交', '未加载到题目数据，无法评分。');
  }

  function showReadingBackendResult(container, result) {
    const score = result.score ?? 0;
    const total = result.total ?? 0;
    const pct = result.percentage ?? 0;
    const band = result.band_estimate ?? result.estimated_band ?? 0;
    let html = `<h4>得分：${score}/${total} (${Math.round(pct)}%) · 预估 Band ${band}</h4>`;
    const details = result.details || result.question_results;
    if (Array.isArray(details) && details.length) {
      html += '<pre>';
      details.forEach((d) => {
        const isCorrect = d.correct || d.is_correct;
        html += `Q${d.question || d.order}: ${isCorrect ? '✅' : '❌'} 你的答案 "${d.user_answer || '(未选)'}"，正确答案 "${d.correct_answer || d.answer || ''}"\n`;
      });
      html += '</pre>';
    } else {
      const errors = result.errors || [];
      if (errors.length) {
        html += '<pre>';
        errors.forEach((e) => {
          html += `❌ Q${e.question || '?'}: 你的答案 "${e.user_answer || '(未选)'}"，正确答案 "${e.correct_answer || ''}"\n`;
          const etype = e.error_type || e.type;
          if (etype) html += `  错误类型：${etype}${e.explanation ? ' (' + e.explanation + ')' : ''}\n`;
        });
        html += '</pre>';
      } else if (score === total && total > 0) {
        html += '<pre>全部正确！</pre>';
      }
    }
    showResultHtml(container, html);
  }

  function showReadingLocalResult(container, answers) {
    if (!currentSectionData || !currentSectionData.questions) {
      showResult(container, '已提交', '未加载到题目数据，无法评分。');
      return;
    }

    let correct = 0;
    let total = 0;
    const resultItems = [];

    currentSectionData.questions.forEach((q) => {
      const qNum = String(q.order);
      const userAnswer = (answers[qNum] || '').trim();
      const correctAnswer = (q.correct_answer || '').trim();
      const isCorrect = userAnswer && correctAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase();
      if (isCorrect) correct++;
      total++;
      resultItems.push(`Q${qNum}: ${isCorrect ? '✅' : '❌'} 你的答案 "${userAnswer || '(未选)'}"，正确答案 "${correctAnswer || '-'}"`);
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    showResult(container, `得分：${correct}/${total} (${score}%)`, resultItems.join('\n'));
  }

  // 提交写作：调用后端评分，失败只显示字数
  async function submitWritingPractice(container) {
    const text = container.querySelector('#writingAnswer')?.value.trim() || '';
    const count = text.split(/\s+/).filter(Boolean).length;

    // 获取题目文本
    let questionText = '';
    if (currentSectionData && currentSectionData.questions && currentSectionData.questions[0]) {
      questionText = currentSectionData.questions[0].question_text || '';
    }

    const taskNum = (currentPracticeMeta && currentPracticeMeta.part === 'Task 1') ? 1 : 2;

    if (text) {
      try {
        const result = await apiInvoke('writing', {
          essay_text: text,
          question: questionText,
          task: taskNum,
        });
        const writingResult = result?.state?.writing_result;
        if (writingResult) {
          showWritingBackendResult(container, writingResult, count);
          return;
        }
      } catch (e) {
        console.warn('写作后端评分失败:', e);
      }
    }

    // 回退：只显示字数
    showResult(container, '已提交', `字数：${count}\n评分服务暂时不可用，请稍后重试。`);
  }

  function showWritingBackendResult(container, result, wordCount) {
    let html = `<h4>写作评分</h4>`;
    html += `<p>字数：${wordCount}</p>`;
    const dim = (d) => (d && typeof d === 'object') ? `${d.score ?? '-'} — ${escapeHtml(d.feedback || '')}` : String(d ?? '-');
    const overall = result.overall ?? result.band ?? '-';
    if (result.template_penalty && result.template_penalty > 0) {
      html += `<p class="result-warning">⚠ 模板痕迹扣分：原 ${result.original_score ?? '-'} → 现 ${overall}（扣 ${result.template_penalty}）</p>`;
    }
    html += `<pre>总分 Band：${escapeHtml(String(overall))}
TA/TR: ${dim(result.ta_tr ?? result.task_achievement)}
CC:    ${dim(result.cc ?? result.coherence_cohesion)}
LR:    ${dim(result.lr ?? result.lexical_resource)}
GRA:   ${dim(result.gra ?? result.grammatical_range_accuracy)}
</pre>`;
    if (result.writing_feedback || result.feedback) {
      html += `<pre>${escapeHtml(result.writing_feedback || result.feedback)}</pre>`;
    }
    const errors = result.errors || result.grammar_errors || [];
    if (Array.isArray(errors) && errors.length) {
      html += '<pre>错误清单：\n';
      errors.forEach((e) => {
        if (typeof e === 'string') {
          html += `- ${escapeHtml(e)}\n`;
        } else {
          const t = e.type || e.error_type || '?';
          const ctx = e.context || e.description || '';
          const cor = e.correction || e.suggestion || '';
          html += `- [${escapeHtml(String(t))}] '${escapeHtml(String(ctx))}' → '${escapeHtml(String(cor))}'\n`;
        }
      });
      html += '</pre>';
    }
    if (Array.isArray(result.suggestions) && result.suggestions.length) {
      html += '<pre>改进建议：\n';
      result.suggestions.forEach((s) => { html += `- ${escapeHtml(typeof s === 'string' ? s : JSON.stringify(s))}\n`; });
      html += '</pre>';
    }
    showResultHtml(container, html);
  }

  // 提交口语：调用后端评分，失败只显示提示
  async function submitSpeakingPractice(container) {
    const text = container.querySelector('#speakingAnswer')?.value.trim() || '';

    // 获取题目文本
    let questionText = '';
    if (currentSectionData && currentSectionData.questions && currentSectionData.questions[0]) {
      questionText = currentSectionData.questions[0].question_text || '';
    }

    // 后端期望 part 为整数 1/2/3
    const partStr = (currentPracticeMeta && currentPracticeMeta.part) || 'Part 1';
    const partMatch = String(partStr).match(/\d+/);
    const partNum = partMatch ? parseInt(partMatch[0], 10) : 1;

    if (text) {
      try {
        const result = await apiInvoke('speaking', {
          transcript: text,
          question: questionText,
          part: partNum,
        });
        const speakingResult = result?.state?.speaking_result;
        if (speakingResult) {
          showSpeakingBackendResult(container, speakingResult);
          return;
        }
      } catch (e) {
        console.warn('口语后端评分失败:', e);
      }
    }

    showResult(container, '已提交', '评分服务暂时不可用，请稍后重试。');
  }

  function showSpeakingBackendResult(container, result) {
    let html = `<h4>口语评分</h4>`;
    const dim = (d) => (d && typeof d === 'object') ? `${d.score ?? '-'} — ${escapeHtml(d.feedback || '')}` : String(d ?? '-');
    const overall = result.overall ?? result.band ?? '-';
    if (result.template_penalty && result.template_penalty > 0) {
      html += `<p class="result-warning">⚠ 背稿痕迹扣分：原 ${result.original_score ?? '-'} → 现 ${overall}（扣 ${result.template_penalty}）</p>`;
    }
    html += `<pre>总分 Band：${escapeHtml(String(overall))}
FC 流利度与连贯性: ${dim(result.fc ?? result.fluency_coherence)}
LR 词汇多样性:       ${dim(result.lr ?? result.lexical_resource)}
GRA 语法多样性:      ${dim(result.gra ?? result.grammatical_range)}
P 发音:              ${dim(result.p ?? result.pronunciation)}
</pre>`;
    if (result.speaking_feedback || result.feedback) {
      html += `<pre>${escapeHtml(result.speaking_feedback || result.feedback)}</pre>`;
    }
    const errors = result.errors || [];
    if (Array.isArray(errors) && errors.length) {
      html += '<pre>错误清单：\n';
      errors.forEach((e) => {
        if (typeof e === 'string') {
          html += `- ${escapeHtml(e)}\n`;
        } else {
          const t = e.type || e.error_type || '?';
          const ctx = e.context || '';
          const cor = e.correction || '';
          html += `- [${escapeHtml(String(t))}] '${escapeHtml(String(ctx))}' → '${escapeHtml(String(cor))}'\n`;
        }
      });
      html += '</pre>';
    }
    if (result.better_version) {
      html += `<pre>升级版回答：\n${escapeHtml(result.better_version)}</pre>`;
    }
    showResultHtml(container, html);
  }

  function showResult(container, title, detail) {
    let resultBox = container.querySelector('.result-box');
    if (!resultBox) {
      resultBox = document.createElement('div');
      resultBox.className = 'result-box';
      container.appendChild(resultBox);
    }
    resultBox.innerHTML = `<h4>${escapeHtml(title)}</h4><pre>${escapeHtml(detail)}</pre>`;
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 显示 HTML 格式的结果（用于后端返回的富文本）
  function showResultHtml(container, html) {
    let resultBox = container.querySelector('.result-box');
    if (!resultBox) {
      resultBox = document.createElement('div');
      resultBox.className = 'result-box';
      container.appendChild(resultBox);
    }
    resultBox.innerHTML = html;
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ===== Right panel close buttons =====
  document.querySelectorAll('.panel__tabs').forEach((tabList) => {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'panel__tab panel__tab--close';
    closeBtn.setAttribute('aria-label', '收起辅助面板');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setRightSidebarOpen(false);
    });
    tabList.appendChild(closeBtn);
  });

  // ===== Right panel tabs =====
  document.querySelectorAll('.panel__tabs').forEach((tabList) => {
    const panel = tabList.closest('.panel');
    const tabs = tabList.querySelectorAll('.panel__tab');
    const contents = panel.querySelectorAll('.tab-content');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        contents.forEach((content) => {
          content.classList.toggle('is-active', content.dataset.tabContent === target);
        });
      });
    });
  });

  // ===== Hint buttons =====
  function setupHint(btnId, stateId, contentId) {
    const btn = document.getElementById(btnId);
    const state = document.getElementById(stateId);
    const content = document.getElementById(contentId);
    if (!btn || !state || !content) return;

    btn.addEventListener('click', () => {
      state.hidden = true;
      content.hidden = false;
      const practiceView = document.querySelector('.view.is-active .practice-view:not([hidden])');
      if (practiceView) practiceView.dataset.hinted = 'true';
    });
  }

  setupHint('listeningHintBtn', 'listeningHintState', 'listeningHintContent');
  setupHint('readingHintBtn', 'readingHintState', 'readingHintContent');

  // ===== Chat (SSE 流式对话) =====
  const textarea = document.querySelector('.input-area__textarea');
  const chatArea = document.getElementById('chatArea');

  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    });
  }

  const sendBtn = document.querySelector('.input-area__send');

  // 将 coach 路由返回的 daily_plan 结构渲染成可读 HTML
  function _renderDailyPlan(plan) {
    const tasks = plan.tasks || [];
    const lines = [];
    if (tasks.length) {
      lines.push(`<strong>今日训练计划</strong>（共 ${tasks.length} 项）`);
      lines.push('');
      tasks.forEach((t, i) => {
        const subj = t.subject || '?';
        const type = t.type || '';
        const dur = t.duration_minutes ? ` · ${t.duration_minutes}min` : '';
        const focus = t.focus ? ` — <span style="color:#5f6368">重点：${escapeHtml(t.focus)}</span>` : '';
        lines.push(`${i + 1}. <strong>[${escapeHtml(subj)}]</strong> ${escapeHtml(type)}${dur}${focus}`);
      });
    }
    // 推荐重点
    const recFocus = plan.recommended_focus;
    if (Array.isArray(recFocus) && recFocus.length) {
      if (lines.length) lines.push('');
      lines.push(`<span style="color:#1a73e8">推荐重点：</span>${recFocus.map(escapeHtml).join('、')}`);
    }
    // 学习者画像摘要
    const portrait = plan.learner_portrait;
    if (portrait && typeof portrait === 'object') {
      // 画像概要统计
      const summary = portrait.summary;
      if (summary && typeof summary === 'object') {
        const totalSessions = summary.total_sessions ?? 0;
        const totalMinutes = summary.total_minutes ?? 0;
        const errorCount = summary.error_count ?? 0;
        const patternErrors = summary.pattern_error_count ?? 0;
        if (totalSessions || totalMinutes || errorCount) {
          if (lines.length) lines.push('');
          lines.push(`<span style="color:#1a73e8">学习画像</span>（${totalSessions} 次 / ${totalMinutes}min / ${errorCount} 错题，其中 ${patternErrors} 个反复错）`);
        }
      }
      // 当前水平 vs 目标
      const cur = portrait.current_level || {};
      const tgt = portrait.target_level || {};
      const subjects = ['listening', 'reading', 'writing', 'speaking'];
      const levelParts = subjects.map(s => `${s.slice(0,3)}: ${cur[s] ?? '-'}→${tgt[s] ?? '-'}`);
      if (levelParts.length) {
        lines.push(`<span style="color:#5f6368">水平：${escapeHtml(levelParts.join(' | '))}</span>`);
      }
      // 弱项知识点
      const weak = portrait.weak_knowledge_areas || {};
      const weakTop = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (weakTop.length) {
        lines.push(`<span style="color:#5f6368">弱项：${weakTop.map(([k, v]) => escapeHtml(k) + '(' + v + ')').join('、')}</span>`);
      }
      // 推荐项
      const recs = portrait.recommendations;
      if (Array.isArray(recs) && recs.length) {
        lines.push('');
        lines.push('<span style="color:#1a73e8">改进建议：</span>');
        recs.slice(0, 3).forEach((r, i) => {
          const f = r.focus || r.title || '';
          const action = r.action || r.reason || r.detail || '';
          if (f) {
            lines.push(`  ${i + 1}. <strong>${escapeHtml(f)}</strong>${action ? ` — ${escapeHtml(action)}` : ''}`);
          }
        });
      }
    }
    return lines.length ? lines.join('<br>') : '<span style="color:#5f6368">（暂无可用画像或计划）</span>';
  }

  // SSE 流式对话：本地模拟 SSE 事件流（离线模式，无后端）
  async function streamChatMessage(text, onEvent) {
    // 模拟 SSE 事件序列：workflow.started → node.completed → workflow.completed
    const events = [
      { type: 'workflow.started', data: { route: 'coach', workflow_type: 'coach', user_id: USER_ID, exam_type: 'ielts' }, delay: 200 },
      { type: 'node.completed', data: { node: 'coach_node', keys: ['route', 'user_id', 'message', 'daily_plan'] }, delay: 600 },
      { type: 'workflow.completed', data: { route: 'coach', result: MOCK_COACH_PLAN }, delay: 400 },
    ];
    for (const evt of events) {
      await new Promise(r => setTimeout(r, evt.delay));
      onEvent(evt.type, evt.data);
    }
  }

  // 发送聊天消息
  async function sendChatMessage(text) {
    // 显示用户消息
    const userMessage = document.createElement('div');
    userMessage.className = 'message message--user';
    userMessage.innerHTML = `
      <div class="message__avatar">R</div>
      <div class="message__content"><p>${escapeHtml(text)}</p></div>
    `;
    chatArea.appendChild(userMessage);
    userMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // 创建 AI 消息元素
    const aiMessage = document.createElement('div');
    aiMessage.className = 'message message--ai';
    aiMessage.innerHTML = `
      <div class="message__avatar">Dr</div>
      <div class="message__content"><p class="chat-loading">思考中...</p></div>
    `;
    chatArea.appendChild(aiMessage);
    const contentP = aiMessage.querySelector('p');

    let fullText = '';

    try {
      await streamChatMessage(text, (eventType, data) => {
        // node.completed 事件：追加内容
        if (eventType === 'node.completed') {
          // 尝试多个可能的字段名
          const chunk = data.text || data.content || data.message || data.output || data.delta || '';
          if (chunk) {
            if (fullText === '') {
              fullText = chunk;
            } else {
              fullText += chunk;
            }
            contentP.textContent = fullText;
          }
        }
        // workflow.completed 事件：最终结果
        if (eventType === 'workflow.completed') {
          const result = data.result || data;
          // coach 路由：result 是 daily_plan 结构，可能含 tasks 数组、
          // learner_portrait、recommended_focus 等字段
          if (result && (Array.isArray(result.tasks) || result.learner_portrait || result.recommended_focus)) {
            fullText = _renderDailyPlan(result);
            contentP.innerHTML = fullText;
          } else {
            const finalText = result.text || result.content || result.message || result.output || '';
            if (finalText && (!fullText || fullText === '思考中...')) {
              fullText = finalText;
              contentP.textContent = fullText;
            }
          }
        }
        aiMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });

      // 如果流式没有产生内容，显示 fallback
      if (!fullText || fullText === '思考中...') {
        contentP.textContent = '已收到。继续推进，下一题开始计时。';
      }
    } catch (e) {
      console.warn('SSE 对话失败，回退到 mock 回复:', e);
      // 回退：模拟延迟后给出固定回复
      setTimeout(() => {
        contentP.textContent = '已收到。继续推进，下一题开始计时。';
      }, 600);
    }
  }

  if (sendBtn && textarea && chatArea) {
    sendBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (!text) return;
      textarea.value = '';
      textarea.style.height = 'auto';
      sendChatMessage(text);
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== Initialize =====
  // 异步加载 books 列表，加载完成后如果当前在 library 视图则重新渲染
  loadBooks().then((loadedBooks) => {
    books = loadedBooks;
    const currentMode = app.getAttribute('data-mode');
    if (practiceModes.includes(currentMode)) {
      renderLibrary(currentMode);
    }
  });

  const initialMode = app.getAttribute('data-mode') || 'listening';
  switchMode(initialMode);
})();
