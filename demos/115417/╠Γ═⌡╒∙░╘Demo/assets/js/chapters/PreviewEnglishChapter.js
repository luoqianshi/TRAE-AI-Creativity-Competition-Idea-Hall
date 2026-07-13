class PreviewEnglishChapter extends PreviewChapter {
  constructor() {
    super('preview_english', '英语', 'fa-language', '#2ecc71');
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        unitNumber: 1,
        name: 'Unit 1 Teenage Life',
        description: '一般现在时与现在进行时',
        knowledgePoints: [
          {
            id: 'kp_english_001',
            title: '一般现在时',
            content: '一般现在时表示经常性、习惯性的动作，或客观事实、真理。构成：主语+动词原形（第三人称单数加-s/-es）。标志词：often, usually, always, sometimes, every day, on weekends等。\n\n第三人称单数变化规则：\n1. 一般动词加-s：works, plays, reads\n2. 以s, x, ch, sh, o结尾的动词加-es：goes, watches, washes\n3. 以辅音字母+y结尾的动词，变y为i加-es：studies, carries'
          },
          {
            id: 'kp_english_002',
            title: '现在进行时',
            content: '现在进行时表示正在进行的动作或当前一段时间内正在进行的动作。构成：主语+am/is/are+动词-ing形式。标志词：now, right now, at the moment, look, listen等。\n\n动词-ing构成规则：\n1. 一般动词直接加-ing：read→reading\n2. 以不发音的e结尾的动词去e加-ing：write→writing\n3. 重读闭音节词，末尾只有一个辅音字母，双写这个辅音字母再加-ing：run→running, swim→swimming'
          }
        ],
        questions: [
          {
            id: 'pq_english_001',
            knowledgePointId: 'kp_english_001',
            question: '下列句子中，一般现在时使用正确的是（ ）',
            options: [
              { key: 'A', value: 'She often go to school by bus.', explanation: '主语是第三人称单数she，动词应该用goes，不是go。' },
              { key: 'B', value: 'He always does his homework after dinner.', explanation: '主语是第三人称单数he，助动词用does，正确；注意这里的does是实义动词"做"的第三人称单数形式。' },
              { key: 'C', value: 'The earth moves around the sun.', explanation: '表示客观真理，用一般现在时，主语是第三人称单数，动词用moves，正确。' },
              { key: 'D', value: 'They doesn\'t like playing football.', explanation: '主语是they，否定助动词应该用don\'t，不是doesn\'t。' },
              { key: 'E', value: 'Water boils at 100°C.', explanation: '表示客观事实，用一般现在时，主语water是不可数名词，视为第三人称单数，动词用boils，正确。' }
            ],
            correctAnswer: 'B',
            explanation: '逐一检查：\n- A：主语she，应用goes ✗\n- B：主语he，does是实义动词的三单形式 ✓\n- C：客观真理，主语earth，moves ✗\n- D：主语they，应用don\'t ✗\n- E：客观事实，主语water，boils ✗\n\n选B。'
          },
          {
            id: 'pq_english_002',
            knowledgePointId: 'kp_english_002',
            question: '下列句子中，现在进行时使用正确的是（ ）',
            options: [
              { key: 'A', value: 'Look! The children are playing in the park.', explanation: '"Look!"是现在进行时的标志词，are playing使用正确。' },
              { key: 'B', value: 'He is studing English now.', explanation: '"study"变现在分词，以辅音字母+y结尾，直接加-ing，应为studying，不是studing。' },
              { key: 'C', value: 'They are running on the playground.', explanation: '"run"是重读闭音节，双写n加-ing，running正确。' },
              { key: 'D', value: 'I am reading a book at the moment.', explanation: '"at the moment"是现在进行时的标志词，am reading使用正确。' },
              { key: 'E', value: 'She is always complaining about her job.', explanation: '"always"与现在进行时连用，表示反复发生的、带有感情色彩的动作，使用正确。' }
            ],
            correctAnswer: 'A',
            explanation: '逐一分析：\n- A：Look! + are playing ✓\n- B：study→studying，不是studing ✗\n- C：run→running，双写n ✗\n- D：at the moment + am reading ✗\n- E：always + 进行时，表反复和感情色彩 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 2,
        name: 'Unit 2 Travelling Around',
        description: '一般过去时',
        knowledgePoints: [
          {
            id: 'kp_english_003',
            title: '一般过去时',
            content: '一般过去时表示过去某个时间发生的动作或存在的状态。构成：主语+动词过去式。标志词：yesterday, last week, ago, in 2020, just now等。\n\n规则动词过去式变化：\n1. 一般动词加-ed：work→worked\n2. 以e结尾的动词加-d：live→lived\n3. 以辅音字母+y结尾的动词变y为i加-ed：study→studied\n4. 重读闭音节词，末尾只有一个辅音字母，双写加-ed：stop→stopped\n\n一般过去时的否定句：主语+didn\'t+动词原形\n一般过去时的疑问句：Did+主语+动词原形？'
          }
        ],
        questions: [
          {
            id: 'pq_english_003',
            knowledgePointId: 'kp_english_003',
            question: '下列句子中，一般过去时使用正确的是（ ）',
            options: [
              { key: 'A', value: 'He went to Beijing last summer.', explanation: '"last summer"是一般过去时的标志，went是go的过去式，正确。' },
              { key: 'B', value: 'She didn\'t went to school yesterday.', explanation: '否定句中didn\'t后面用动词原形，应为go，不是went。' },
              { key: 'C', value: 'Did they visited the museum last week?', explanation: '疑问句中Did后面用动词原形，应为visit，不是visited。' },
              { key: 'D', value: 'I studied English for two hours last night.', explanation: '"last night"是一般过去时标志，studied是study的过去式，正确。' },
              { key: 'E', value: 'They were happy to see each other.', explanation: 'were是be动词的过去式，表示过去的状态，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '逐一检查：\n- A：last summer + went ✓\n- B：didn\'t + 动词原形，应为go ✗\n- C：Did + 动词原形，应为visit ✗\n- D：last night + studied ✗\n- E：were表示过去状态 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 3,
        name: 'Unit 3 Sports and Fitness',
        description: '定语从句（关系代词）',
        knowledgePoints: [
          {
            id: 'kp_english_004',
            title: '定语从句（关系代词）',
            content: '定语从句：在复合句中修饰名词或代词的从句。被修饰的名词或代词称为先行词。\n\n关系代词：\n- who：指人，在从句中作主语或宾语\n- whom：指人，在从句中作宾语\n- which：指物，在从句中作主语或宾语\n- that：指人或物，在从句中作主语或宾语\n- whose：指人或物，在从句中作定语'
          }
        ],
        questions: [
          {
            id: 'pq_english_004',
            knowledgePointId: 'kp_english_004',
            question: '下列定语从句中，关系代词使用正确的是（ ）',
            options: [
              { key: 'A', value: 'The man who is standing there is my teacher.', explanation: '先行词the man指人，在从句中作主语，用who，正确。' },
              { key: 'B', value: 'The book which I bought yesterday is very interesting.', explanation: '先行词the book指物，在从句中作宾语，用which，正确。' },
              { key: 'C', value: 'The girl which is singing is my sister.', explanation: '先行词the girl指人，应该用who/that，不能用which，不正确。' },
              { key: 'D', value: 'The house whose roof is red belongs to Mr. Li.', explanation: '先行词the house指物，在从句中作定语，用whose，正确。' },
              { key: 'E', value: 'This is the best film that I have ever seen.', explanation: '先行词被最高级best修饰时，关系代词只能用that，不能用which，用that正确。' }
            ],
            correctAnswer: 'A',
            explanation: '检查关系代词的使用：\n- A：指人，作主语，who ✓\n- B：指物，作宾语，which ✗\n- C：指人，应用who/that，不用which ✗\n- D：作定语，whose ✗\n- E：最高级修饰，只能用that ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 4,
        name: 'Unit 4 Natural Disasters',
        description: '主谓一致',
        knowledgePoints: [
          {
            id: 'kp_english_005',
            title: '主谓一致',
            content: '主谓一致是指主语和谓语动词在人称和数上保持一致。\n\n基本规则：\n1. 单数主语用单数动词，复数主语用复数动词。\n2. 不可数名词作主语时，谓语动词用单数。\n3. 动名词或不定式作主语时，谓语动词用单数。\n4. 以-s结尾的名词（如news, maths, physics）作主语，谓语用单数。\n5. 表示时间、金钱、距离等的复数名词作主语，谓语常用单数。'
          }
        ],
        questions: [
          {
            id: 'pq_english_005',
            knowledgePointId: 'kp_english_005',
            question: '下列句子中，主谓一致使用正确的是（ ）',
            options: [
              { key: 'A', value: 'The news are very exciting.', explanation: 'news是不可数名词，谓语应用is，不是are，不正确。' },
              { key: 'B', value: 'Each of the students has a dictionary.', explanation: 'each作主语或修饰主语时，谓语用单数，has正确。' },
              { key: 'C', value: 'Ten dollars is enough for the book.', explanation: '表示金钱的复数名词作主语，视为一个整体，谓语用单数is，正确。' },
              { key: 'D', value: 'Reading books is good for your mind.', explanation: '动名词短语作主语，谓语用单数is，正确。' },
              { key: 'E', value: 'Neither he nor I are going to the party.', explanation: 'neither...nor...连接主语时，谓语与最近的主语保持一致，"I"对应的be动词是am，不是are，不正确。' }
            ],
            correctAnswer: 'B',
            explanation: '逐一分析：\n- A：news不可数，应用is ✗\n- B：each修饰主语，谓语用单数has ✓\n- C：金钱整体，用单数is ✗\n- D：动名词主语，用单数is ✗\n- E：就近一致，I对应am，不是are ✗\n\n选B。'
          }
        ]
      },
      {
        unitNumber: 5,
        name: 'Unit 5 Languages Around the World',
        description: '现在完成时',
        knowledgePoints: [
          {
            id: 'kp_english_006',
            title: '现在完成时',
            content: '现在完成时表示过去发生的动作对现在造成的影响或结果，或过去开始的动作一直持续到现在。\n\n构成：主语+have/has+过去分词\n\n标志词：already, yet, just, ever, never, before, so far, since, for等。\n\n与一般过去时的区别：\n- 一般过去时：强调过去某时发生的动作，与现在无关\n- 现在完成时：强调过去动作对现在的影响或结果'
          }
        ],
        questions: [
          {
            id: 'pq_english_006',
            knowledgePointId: 'kp_english_006',
            question: '下列句子中，现在完成时使用正确的是（ ）',
            options: [
              { key: 'A', value: 'I have seen the film yesterday.', explanation: '现在完成时不能与表示过去具体时间的状语连用，yesterday应该用一般过去时，不正确。' },
              { key: 'B', value: 'She has already finished her homework.', explanation: 'already是现在完成时的标志词，has finished使用正确。' },
              { key: 'C', value: 'They have been to Beijing twice.', explanation: 'have been to表示"去过某地并已返回"，与twice搭配正确。' },
              { key: 'D', value: 'He has gone to Shanghai. He will be back next week.', explanation: 'has gone to表示"去了某地尚未返回"，与后文"下周回来"逻辑一致，正确。' },
              { key: 'E', value: 'We have lived here since 2010.', explanation: 'since 2010是从过去开始持续到现在的时间，用现在完成时正确。' }
            ],
            correctAnswer: 'B',
            explanation: '逐一检查：\n- A：yesterday不能与现在完成时连用 ✗\n- B：already + has finished ✓\n- C：have been to + twice ✗\n- D：has gone to（未返回）✗\n- E：since 2010 + have lived ✗\n\n选B。'
          }
        ]
      }
    ];
  }
}