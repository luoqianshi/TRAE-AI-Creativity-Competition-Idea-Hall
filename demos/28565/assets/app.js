/**
 * 编程题库系统 - 前端应用
 * 包含：首页数据渲染、题库筛选、答题交互、页面路由
 */

const app = {
  // 状态
  state: {
    currentPage: 'home',
    currentExam: 'all',
    currentType: 'all',
    currentDiff: 'all',
    searchQuery: '',
    currentPageNum: 1,
    pageSize: 10,
    practiceQuestions: [],
    practiceIndex: 0,
    practiceAnswers: {},
    practiceSubmitted: false
  },

  // 模拟题库数据
  questions: [
    // Scratch 单选题
    {
      id: 1,
      exam: 'scratch',
      type: 'single',
      difficulty: 'easy',
      title: '在Scratch中，要让角色移动10步，应该使用哪个积木？',
      options: ['移动10步', '旋转10度', '等待1秒', '重复执行10次'],
      answer: 0,
      explanation: '「移动10步」积木可以让角色向当前方向移动指定的步数。'
    },
    {
      id: 2,
      exam: 'scratch',
      type: 'single',
      difficulty: 'easy',
      title: 'Scratch中，「当绿旗被点击」事件属于哪一类积木？',
      options: ['运动', '外观', '事件', '控制'],
      answer: 2,
      explanation: '「当绿旗被点击」属于事件类积木，用于触发程序的开始。'
    },
    {
      id: 3,
      exam: 'scratch',
      type: 'judge',
      difficulty: 'easy',
      title: 'Scratch中的「重复执行」积木可以无限循环。',
      options: ['正确', '错误'],
      answer: 0,
      explanation: '「重复执行」积木确实会无限循环，直到程序停止或满足停止条件。'
    },
    {
      id: 4,
      exam: 'scratch',
      type: 'single',
      difficulty: 'medium',
      title: '在Scratch中，以下哪个积木可以实现条件判断？',
      options: ['重复执行', '如果...那么', '等待1秒', '广播消息'],
      answer: 1,
      explanation: '「如果...那么」积木用于条件判断，根据条件是否成立执行不同的代码。'
    },
    {
      id: 5,
      exam: 'scratch',
      type: 'multiple',
      difficulty: 'medium',
      title: 'Scratch中，以下哪些属于「运动」类积木？',
      options: ['移动10步', '旋转15度', '说你好2秒', '移到随机位置'],
      answer: [0, 1, 3],
      explanation: '「说你好2秒」属于外观类积木，其他三个都属于运动类。'
    },
    // Python 单选题
    {
      id: 6,
      exam: 'python',
      type: 'single',
      difficulty: 'easy',
      title: '小航用Python统计偶像的名字"王一博"的字符长度，执行len("王一博")得到的结果是（）',
      options: ['1', '3', '6', '9'],
      answer: 1,
      explanation: '在Python中，len()函数统计的是字符个数，"王一博"有3个字符。'
    },
    {
      id: 7,
      exam: 'python',
      type: 'single',
      difficulty: 'easy',
      title: '以下选项中，Python语言中代码注释使用的符号是？',
      options: ['//', '/* */', '#', '--'],
      answer: 2,
      explanation: 'Python使用井号「#」作为单行注释符号。'
    },
    {
      id: 8,
      exam: 'python',
      type: 'judge',
      difficulty: 'easy',
      title: '在Python程序中，range(10)生成的序列会包含数字10。',
      options: ['正确', '错误'],
      answer: 1,
      explanation: 'range(10)生成0到9的序列，不包含10。'
    },
    {
      id: 9,
      exam: 'python',
      type: 'single',
      difficulty: 'medium',
      title: '使用下面中的（）函数接收输入的数据。',
      options: ['print()', 'input()', 'len()', 'range()'],
      answer: 1,
      explanation: 'input()函数用于接收用户从键盘输入的数据。'
    },
    {
      id: 10,
      exam: 'python',
      type: 'multiple',
      difficulty: 'medium',
      title: '草药体验包的价格由药材费用和包装费组成。已知代码如下：\nprice=6\nnum=4\npack=5\nans=price*num+pack\n下列说法正确的是',
      options: ['ans的值是29', 'price*num表示药材总价', 'pack是包装费', 'ans的值是54'],
      answer: [0, 1, 2],
      explanation: 'price*num=24，加上pack=5，ans=29。'
    },
    {
      id: 11,
      exam: 'python',
      type: 'judge',
      difficulty: 'easy',
      title: '小明想要重复打印自己的名字5次，这种情况下应该使用if语句。',
      options: ['正确', '错误'],
      answer: 1,
      explanation: '重复执行应该使用for或while循环，if语句用于条件判断。'
    },
    {
      id: 12,
      exam: 'python',
      type: 'code',
      difficulty: 'medium',
      title: '健康饮食计划\n【故事背景】小林是一位健身爱好者，他希望通过一个健康饮食计划程序来跟踪自己的日常饮食。这个程序需要记录每餐的食物种类和卡路里摄入。\n\n请编写一个程序，输入食物名称和卡路里，输出当天的总卡路里。',
      options: [],
      answer: '',
      explanation: '使用字典存储食物和卡路里，然后累加计算总和。'
    },
    {
      id: 13,
      exam: 'python',
      type: 'single',
      difficulty: 'medium',
      title: '当需要判断变量Q是否等于20时，可以采用Q==20表达。',
      options: ['正确', '错误'],
      answer: 0,
      explanation: '「==」是Python中的等于比较运算符。'
    },
    {
      id: 14,
      exam: 'python',
      type: 'fill',
      difficulty: 'medium',
      title: '在Python中，列表用______符号表示，元组用______符号表示。',
      options: [],
      answer: '[],()',
      explanation: '列表使用方括号[]，元组使用圆括号()。'
    },
    {
      id: 15,
      exam: 'python',
      type: 'single',
      difficulty: 'hard',
      title: '以下代码的输出结果是？\nfor i in range(3):\n    print(i**2)',
      options: ['0 1 4', '1 4 9', '0 1 8', '1 2 3'],
      answer: 0,
      explanation: 'range(3)产生0,1,2，平方后输出0,1,4。'
    },
    // GESP
    {
      id: 16,
      exam: 'gesp',
      type: 'single',
      difficulty: 'easy',
      title: 'GESP认证中，Python一级考试主要考察什么内容？',
      options: ['面向对象编程', '基础语法和简单程序', '网络编程', '数据库操作'],
      answer: 1,
      explanation: 'GESP Python一级主要考察基础语法、变量、输入输出等。'
    },
    {
      id: 17,
      exam: 'gesp',
      type: 'single',
      difficulty: 'medium',
      title: '以下哪个不是Python的基本数据类型？',
      options: ['int', 'str', 'array', 'float'],
      answer: 2,
      explanation: 'array不是Python内置的基本数据类型，需要导入array模块。'
    },
    // 电子学会
    {
      id: 18,
      exam: 'elec',
      type: 'single',
      difficulty: 'easy',
      title: '电子学会青少年软件编程等级考试Scratch一级，主要适合什么年龄段？',
      options: ['小学1-3年级', '小学4-6年级', '初中生', '高中生'],
      answer: 0,
      explanation: 'Scratch一级主要面向小学低年级学生。'
    },
    {
      id: 19,
      exam: 'elec',
      type: 'judge',
      difficulty: 'medium',
      title: '电子学会等级考试中，Python三级需要掌握函数和模块的使用。',
      options: ['正确', '错误'],
      answer: 0,
      explanation: 'Python三级确实要求掌握函数定义、调用以及模块的导入使用。'
    },
    // 蓝桥杯
    {
      id: 20,
      exam: 'lanqiao',
      type: 'single',
      difficulty: 'hard',
      title: '蓝桥杯Python组比赛中，以下哪个算法常用于解决最短路径问题？',
      options: ['冒泡排序', 'Dijkstra算法', '二分查找', '递归'],
      answer: 1,
      explanation: 'Dijkstra算法是经典的最短路径算法。'
    }
  ],

  // 试卷数据
  exams: [
    {
      id: 1,
      title: '2026年全国信息素养大赛Python编程_初赛_(模拟1)',
      count: 25,
      users: 1250,
      tags: ['初赛', '热门'],
      isNew: true
    },
    {
      id: 2,
      title: '2026年全国信息素养大赛Scratch图形化_初赛_(模拟1)',
      count: 20,
      users: 980,
      tags: ['初赛', '热门'],
      isNew: true
    },
    {
      id: 3,
      title: 'GESP Python编程能力认证_一级_模拟试卷',
      count: 30,
      users: 2100,
      tags: ['GESP', '一级'],
      isNew: false
    },
    {
      id: 4,
      title: '电子学会Scratch等级考试_一级_真题',
      count: 18,
      users: 3500,
      tags: ['等级考试', '真题'],
      isNew: false
    },
    {
      id: 5,
      title: '蓝桥杯Python组_省赛_模拟试卷',
      count: 15,
      users: 890,
      tags: ['蓝桥杯', '省赛'],
      isNew: true
    },
    {
      id: 6,
      title: '2026年粤港澳信息学大赛Python编程_初赛',
      count: 22,
      users: 650,
      tags: ['粤港澳', '初赛'],
      isNew: true
    }
  ],

  // 新闻数据
  news: {
    edu: [
      '科技特长生招生新标准：编程考试的崛起',
      '2025年新疆部分学生科技特长生招生政策',
      '2025年北京地区部分学校科技特长生招生政策',
      '2025-2028学年面向中小学的全国性竞赛活动名单',
      '广东省中考科技特长生政策正式落地'
    ],
    exam: [
      'CCF GESP第十次认证合格证书领取方式的通知',
      '2025年9月全国青少年软件编程等级考试时间安排',
      '关于CCF GESP第11次认证开启报名的通知',
      'GESP衔接CSP-J/S申请通道开启',
      '关于CCF GESP第十次认证考试注意事项的通知'
    ],
    comp: [
      '开赛在即！2026年全国青少年信息素养大赛',
      '广州市白名单 | 第三届广州市青少年科技创客大赛赛果公布',
      '《羊城青少年人工智能创新实践挑战赛》比赛时长及题型部分调整',
      '关于粤港澳青少年信息学创新大赛总决赛考务安排紧急调整的通知',
      '关于粤港澳青少年信息学创新大赛总决赛线下考点和时间变更的通知'
    ]
  },

  // 专项训练
  trainings: [
    { name: 'Scratch基础语法', count: 120, exam: 'scratch' },
    { name: 'Scratch循环与判断', count: 85, exam: 'scratch' },
    { name: 'Python变量与数据类型', count: 150, exam: 'python' },
    { name: 'Python条件与循环', count: 130, exam: 'python' },
    { name: 'Python列表与字典', count: 100, exam: 'python' },
    { name: 'Python函数与模块', count: 90, exam: 'python' },
    { name: 'GESP一级冲刺', count: 200, exam: 'gesp' },
    { name: '蓝桥杯算法基础', count: 80, exam: 'lanqiao' }
  ],

  // 初始化
  init() {
    this.bindEvents();
    this.renderHome();
    this.handleRoute();
  },

  // 事件绑定
  bindEvents() {
    // 导航切换
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigateTo(page);
      });
    });

    // 分类卡片点击
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        this.state.currentExam = category === 'exam' ? 'elec' : category === 'competition' ? 'lanqiao' : category;
        this.navigateTo('bank');
      });
    });

    // 题库侧边栏分类
    document.querySelectorAll('.exam-categories li').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.exam-categories li').forEach(li => li.classList.remove('active'));
        item.classList.add('active');
        this.state.currentExam = item.dataset.exam;
        this.state.currentPageNum = 1;
        this.renderQuestionList();
      });
    });

    // 题目类型筛选
    document.querySelectorAll('.filter-tag[data-type]').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag[data-type]').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.state.currentType = tag.dataset.type;
        this.state.currentPageNum = 1;
        this.renderQuestionList();
      });
    });

    // 难度筛选
    document.querySelectorAll('.filter-tag[data-diff]').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag[data-diff]').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.state.currentDiff = tag.dataset.diff;
        this.state.currentPageNum = 1;
        this.renderQuestionList();
      });
    });

    // 搜索
    document.querySelector('.btn-search')?.addEventListener('click', () => {
      this.state.searchQuery = document.getElementById('search-input').value.trim();
      this.state.currentPageNum = 1;
      this.renderQuestionList();
    });

    document.getElementById('search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.state.searchQuery = e.target.value.trim();
        this.state.currentPageNum = 1;
        this.renderQuestionList();
      }
    });

    // 练习按钮
    document.getElementById('btn-prev')?.addEventListener('click', () => this.prevQuestion());
    document.getElementById('btn-next')?.addEventListener('click', () => this.nextQuestion());
    document.getElementById('btn-submit')?.addEventListener('click', () => this.submitAnswer());

    // 浏览器前进后退
    window.addEventListener('popstate', () => this.handleRoute());
  },

  // 路由处理
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const pageMap = {
      'home': 'home',
      'bank': 'bank',
      'exam': 'exam',
      'training': 'training',
      'news': 'news',
      'practice': 'practice'
    };
    const page = pageMap[hash] || 'home';
    this.showPage(page);
  },

  // 页面导航
  navigateTo(page) {
    window.location.hash = page;
    this.showPage(page);
  },

  // 显示页面
  showPage(page) {
    this.state.currentPage = page;

    // 切换页面显示
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page)?.classList.add('active');

    // 更新导航高亮
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // 页面特定渲染
    switch(page) {
      case 'home':
        this.renderHome();
        break;
      case 'bank':
        this.renderQuestionList();
        break;
      case 'exam':
        this.renderExams();
        break;
      case 'training':
        this.renderTraining();
        break;
      case 'news':
        this.renderNewsFull();
        break;
      case 'practice':
        this.renderPractice();
        break;
    }

    window.scrollTo(0, 0);
  },

  // 渲染首页
  renderHome() {
    // 最新试卷
    const examList = document.getElementById('latest-exams');
    if (examList) {
      examList.innerHTML = this.exams.map(exam => `
        <div class="exam-card" onclick="app.startExam(${exam.id})">
          <div class="exam-meta">
            ${exam.tags.map(tag => `<span class="badge badge-primary">${tag}</span>`).join('')}
            ${exam.isNew ? '<span class="badge badge-new">最新</span>' : ''}
          </div>
          <h4>${exam.title}</h4>
          <div class="exam-info">
            <span>题目数量: ${exam.count}题</span>
            <span>练习人数: ${exam.users}</span>
          </div>
        </div>
      `).join('');
    }

    // 新闻
    this.renderNewsList('news-edu', this.news.edu);
    this.renderNewsList('news-exam', this.news.exam);
    this.renderNewsList('news-comp', this.news.comp);
  },

  renderNewsList(id, items) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = items.map((item, i) => `
        <li><span class="num">${i + 1}</span><a href="#">${item}</a></li>
      `).join('');
    }
  },

  // 渲染题库列表
  renderQuestionList() {
    const list = document.getElementById('question-list');
    const pagination = document.getElementById('pagination');
    const currentCategory = document.getElementById('current-category');
    if (!list) return;

    // 筛选
    let filtered = this.questions.filter(q => {
      if (this.state.currentExam !== 'all' && q.exam !== this.state.currentExam) return false;
      if (this.state.currentType !== 'all' && q.type !== this.state.currentType) return false;
      if (this.state.currentDiff !== 'all' && q.difficulty !== this.state.currentDiff) return false;
      if (this.state.searchQuery && !q.title.includes(this.state.searchQuery)) return false;
      return true;
    });

    // 更新分类标题
    const examNames = {
      all: '全部题库',
      scratch: 'Scratch图形化编程',
      python: 'Python编程',
      gesp: 'GESP等级认证',
      elec: '电子学会等级考试',
      lanqiao: '蓝桥杯竞赛'
    };
    if (currentCategory) currentCategory.textContent = examNames[this.state.currentExam] || '全部';

    // 分页
    const totalPages = Math.ceil(filtered.length / this.state.pageSize) || 1;
    const start = (this.state.currentPageNum - 1) * this.state.pageSize;
    const pageItems = filtered.slice(start, start + this.state.pageSize);

    // 渲染题目
    const typeLabels = {
      single: '单选题',
      multiple: '多选题',
      judge: '判断题',
      fill: '填空题',
      code: '编程题'
    };

    const diffLabels = {
      easy: '容易',
      medium: '适中',
      hard: '困难'
    };

    list.innerHTML = pageItems.map(q => `
      <div class="question-item" onclick="app.startPractice(${q.id})">
        <span class="q-type ${q.type}">${typeLabels[q.type]}</span>
        <div class="q-title">${q.title.replace(/\n/g, '<br>')}</div>
        <div class="q-meta">
          <span>难度: ${diffLabels[q.difficulty]}</span>
          <span>考试: ${examNames[q.exam]}</span>
        </div>
      </div>
    `).join('');

    if (filtered.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:48px;color:var(--muted)">暂无符合条件的题目</div>';
    }

    // 渲染分页
    this.renderPagination(pagination, totalPages);
  },

  renderPagination(el, totalPages) {
    if (!el) return;
    let html = '';

    html += `<button ${this.state.currentPageNum === 1 ? 'disabled' : ''} onclick="app.goPage(${this.state.currentPageNum - 1})">上一页</button>`;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.state.currentPageNum - 2 && i <= this.state.currentPageNum + 2)) {
        html += `<span class="${i === this.state.currentPageNum ? 'active' : ''}" onclick="app.goPage(${i})">${i}</span>`;
      } else if (i === this.state.currentPageNum - 3 || i === this.state.currentPageNum + 3) {
        html += `<span>...</span>`;
      }
    }

    html += `<button ${this.state.currentPageNum === totalPages ? 'disabled' : ''} onclick="app.goPage(${this.state.currentPageNum + 1})">下一页</button>`;
    el.innerHTML = html;
  },

  goPage(page) {
    this.state.currentPageNum = page;
    this.renderQuestionList();
  },

  // 渲染试卷页面
  renderExams() {
    const grid = document.getElementById('exam-grid');
    if (!grid) return;

    grid.innerHTML = this.exams.map(exam => `
      <div class="exam-card" onclick="app.startExam(${exam.id})">
        <div class="exam-meta">
          ${exam.tags.map(tag => `<span class="badge badge-primary">${tag}</span>`).join('')}
          ${exam.isNew ? '<span class="badge badge-new">最新</span>' : ''}
        </div>
        <h4>${exam.title}</h4>
        <div class="exam-info">
          <span>题目数量: ${exam.count}题</span>
          <span>练习人数: ${exam.users}</span>
        </div>
      </div>
    `).join('');
  },

  // 渲染专项训练
  renderTraining() {
    const list = document.getElementById('training-list');
    if (!list) return;

    list.innerHTML = this.trainings.map(t => `
      <div class="training-card" onclick="app.startTraining('${t.exam}')">
        <div class="category-icon ${t.exam === 'scratch' ? 'scratch-icon' : t.exam === 'python' ? 'python-icon' : 'exam-icon'}">
          ${t.exam === 'scratch' ? 'S' : t.exam === 'python' ? 'P' : 'T'}
        </div>
        <h3>${t.name}</h3>
        <p>共 ${t.count} 题</p>
      </div>
    `).join('');
  },

  // 渲染资讯
  renderNewsFull() {
    const list = document.getElementById('news-full');
    if (!list) return;

    const allNews = [
      ...this.news.edu.map(n => ({ title: n, category: '编程教育' })),
      ...this.news.exam.map(n => ({ title: n, category: '考级通知' })),
      ...this.news.comp.map(n => ({ title: n, category: '赛事资讯' }))
    ];

    list.innerHTML = allNews.map(n => `
      <div class="question-item" style="margin-bottom:12px">
        <span class="q-type single">${n.category}</span>
        <div class="q-title">${n.title}</div>
      </div>
    `).join('');
  },

  // 开始练习
  startPractice(questionId) {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;

    this.state.practiceQuestions = [question];
    this.state.practiceIndex = 0;
    this.state.practiceAnswers = {};
    this.state.practiceSubmitted = false;
    this.navigateTo('practice');
  },

  // 开始考试/训练
  startExam(examId) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return;

    // 随机选取题目
    const examQuestions = this.questions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(exam.count, this.questions.length));

    this.state.practiceQuestions = examQuestions;
    this.state.practiceIndex = 0;
    this.state.practiceAnswers = {};
    this.state.practiceSubmitted = false;
    this.navigateTo('practice');
  },

  startTraining(examType) {
    const trainingQuestions = this.questions
      .filter(q => q.exam === examType)
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    this.state.practiceQuestions = trainingQuestions.length > 0 ? trainingQuestions : this.questions.slice(0, 10);
    this.state.practiceIndex = 0;
    this.state.practiceAnswers = {};
    this.state.practiceSubmitted = false;
    this.navigateTo('practice');
  },

  // 渲染练习页面
  renderPractice() {
    const questions = this.state.practiceQuestions;
    if (questions.length === 0) return;

    const q = questions[this.state.practiceIndex];
    const total = questions.length;
    const current = this.state.practiceIndex + 1;

    document.getElementById('practice-title').textContent =
      this.state.practiceQuestions.length > 1 ? '模拟考试' : '练习模式';
    document.getElementById('current-num').textContent = current;
    document.getElementById('total-num').textContent = total;

    // 题目区域
    const typeLabels = {
      single: '单选题',
      multiple: '多选题',
      judge: '判断题',
      fill: '填空题',
      code: '编程题'
    };

    const questionArea = document.getElementById('question-area');
    questionArea.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <span class="q-number">${current}</span>
        <span class="q-type ${q.type}">${typeLabels[q.type]}</span>
      </div>
      <div class="q-content">${q.title.replace(/\n/g, '<br>').replace(/`(.*?)`/g, '<code>$1</code>')}</div>
    `;

    // 答案区域
    const answerArea = document.getElementById('answer-area');
    const savedAnswer = this.state.practiceAnswers[q.id];

    if (q.type === 'single' || q.type === 'judge') {
      answerArea.innerHTML = q.options.map((opt, i) => `
        <div class="option ${savedAnswer === i ? 'selected' : ''} ${this.getOptionClass(q, i)}"
             onclick="app.selectOption(${i})">
          <span class="option-label">${String.fromCharCode(65 + i)}</span>
          <span class="option-text">${opt}</span>
        </div>
      `).join('');
    } else if (q.type === 'multiple') {
      answerArea.innerHTML = q.options.map((opt, i) => {
        const selected = savedAnswer && savedAnswer.includes(i);
        return `
          <div class="option ${selected ? 'selected' : ''} ${this.getOptionClass(q, i)}"
               onclick="app.selectMultiple(${i})">
            <span class="option-label">${String.fromCharCode(65 + i)}</span>
            <span class="option-text">${opt}</span>
          </div>
        `;
      }).join('');
    } else if (q.type === 'fill') {
      answerArea.innerHTML = `
        <input type="text" class="bank-search" style="width:100%;padding:16px;font-size:1rem"
               placeholder="请输入答案，多个答案用逗号分隔"
               value="${savedAnswer || ''}" onchange="app.saveFill(this.value)">
      `;
    } else if (q.type === 'code') {
      answerArea.innerHTML = `
        <textarea class="bank-search" style="width:100%;min-height:200px;padding:16px;font-family:JetBrainsMono,monospace;font-size:0.875rem"
                  placeholder="请在此编写代码...">${savedAnswer || ''}</textarea>
        <button class="btn-submit" style="margin-top:12px" onclick="app.saveCode()">保存代码</button>
      `;
    }

    // 显示结果
    const existingResult = answerArea.querySelector('.result-panel');
    if (existingResult) existingResult.remove();

    if (this.state.practiceSubmitted) {
      const isCorrect = this.checkAnswer(q, savedAnswer);
      const resultDiv = document.createElement('div');
      resultDiv.className = `result-panel ${isCorrect ? '' : 'wrong'}`;
      resultDiv.innerHTML = `
        <h4>${isCorrect ? '回答正确！' : '回答错误'}</h4>
        <p><strong>解析：</strong>${q.explanation}</p>
        ${!isCorrect && q.options ? `<p><strong>正确答案：</strong>${this.formatAnswer(q)}</p>` : ''}
      `;
      answerArea.appendChild(resultDiv);
    }

    // 按钮状态
    document.getElementById('btn-prev').disabled = this.state.practiceIndex === 0;
    document.getElementById('btn-next').disabled = this.state.practiceIndex === total - 1;
    document.getElementById('btn-submit').textContent =
      this.state.practiceSubmitted ? '已提交' : '提交答案';
    document.getElementById('btn-submit').disabled = this.state.practiceSubmitted;
  },

  getOptionClass(q, index) {
    if (!this.state.practiceSubmitted) return '';

    if (q.type === 'single' || q.type === 'judge') {
      if (index === q.answer) return 'correct';
      if (this.state.practiceAnswers[q.id] === index && index !== q.answer) return 'wrong';
    } else if (q.type === 'multiple') {
      const answer = this.state.practiceAnswers[q.id] || [];
      if (q.answer.includes(index)) return 'correct';
      if (answer.includes(index) && !q.answer.includes(index)) return 'wrong';
    }
    return '';
  },

  selectOption(index) {
    if (this.state.practiceSubmitted) return;
    const q = this.state.practiceQuestions[this.state.practiceIndex];
    this.state.practiceAnswers[q.id] = index;
    this.renderPractice();
  },

  selectMultiple(index) {
    if (this.state.practiceSubmitted) return;
    const q = this.state.practiceQuestions[this.state.practiceIndex];
    let current = this.state.practiceAnswers[q.id] || [];

    if (current.includes(index)) {
      current = current.filter(i => i !== index);
    } else {
      current = [...current, index];
    }
    this.state.practiceAnswers[q.id] = current;
    this.renderPractice();
  },

  saveFill(value) {
    const q = this.state.practiceQuestions[this.state.practiceIndex];
    this.state.practiceAnswers[q.id] = value;
  },

  saveCode() {
    const textarea = document.querySelector('#answer-area textarea');
    if (textarea) {
      const q = this.state.practiceQuestions[this.state.practiceIndex];
      this.state.practiceAnswers[q.id] = textarea.value;
      alert('代码已保存');
    }
  },

  checkAnswer(q, answer) {
    if (answer === undefined || answer === null || answer === '') return false;

    if (q.type === 'single' || q.type === 'judge') {
      return answer === q.answer;
    } else if (q.type === 'multiple') {
      if (!Array.isArray(answer)) return false;
      const correct = q.answer;
      return answer.length === correct.length && answer.every(a => correct.includes(a));
    } else if (q.type === 'fill') {
      return answer.toString().trim() === q.answer.toString().trim();
    }
    return false;
  },

  formatAnswer(q) {
    if (q.type === 'single' || q.type === 'judge') {
      return q.options[q.answer];
    } else if (q.type === 'multiple') {
      return q.answer.map(i => q.options[i]).join('、');
    }
    return q.answer;
  },

  submitAnswer() {
    const q = this.state.practiceQuestions[this.state.practiceIndex];
    const answer = this.state.practiceAnswers[q.id];

    if (answer === undefined || answer === null || answer === '') {
      alert('请先选择或填写答案');
      return;
    }

    this.state.practiceSubmitted = true;
    this.renderPractice();
  },

  prevQuestion() {
    if (this.state.practiceIndex > 0) {
      this.state.practiceIndex--;
      this.state.practiceSubmitted = false;
      this.renderPractice();
    }
  },

  nextQuestion() {
    if (this.state.practiceIndex < this.state.practiceQuestions.length - 1) {
      this.state.practiceIndex++;
      this.state.practiceSubmitted = false;
      this.renderPractice();
    }
  },

  goBack() {
    this.navigateTo('bank');
  }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
