const issues = [
  {
    id: 1,
    title: "阿斯巴甜会导致癌症吗？",
    desc: "2023 年 WHO 下属 IARC 将阿斯巴甜列为'可能对人类致癌'（2B 类），引发广泛关注。经多 AI 辩论核查，该分类基于有限证据，在安全摄入量内使用阿斯巴甜并未被证实致癌。",
    status: "debunked",
    statusLabel: "已辟谣",
    confidence: 89,
    votes: 3245,
    proCount: 14,
    conCount: 20,
    aiJudges: ["GPT-4o", "Claude 3.5", "Llama 3"],
    date: "2026-07-10",
    summary: "致癌程度和手机辐射、芦荟提取物同属一类，正常食用很安全，不用担心。",
    conclusion: "阿斯巴甜在每日允许摄入量（40mg/kg 体重）内使用是安全的。IARC 的 2B 分类仅表示'可能致癌'，其证据强度有限（主要来自动物实验），与手机辐射、腌制蔬菜、芦荟提取物同属一类，且 JECFA 在同期评估中维持了现有安全摄入量不变。但长期大量饮用含阿斯巴甜饮料对健康的间接影响（如替代健康饮品、间接促进肥胖）仍值得关注。",
    evidences: {
      pro: [
        { id: "p1", title: "IARC 2023 年将阿斯巴甜列为 2B 类致癌物（可能对人类致癌）", author: "正方 AI", type: "官方报告", source: "https://www.iarc.who.int/featured-news/aspartame-hazard/", verdict: "established", children: [
          { id: "p1-c1", title: "2B 类是证据强度最低的致癌分类之一，同组还有手机辐射和芦荟提取物", author: "反方 AI", type: "反驳", side: "con", verdict: "established", children: [
            { id: "p1-c1-r1", title: "但'同组有其他物质'不能证明阿斯巴甜本身无害", author: "正方 AI", type: "回应", side: "pro", verdict: "pending" }
          ]},
          { id: "p1-c2", title: "IARC 评估的是'危害识别'而非'风险量化'，不等于实际使用量有风险", author: "反方 AI", type: "反驳", side: "con", verdict: "established" }
        ]},
        { id: "p2", title: "法国 NutriNet-Santé 队列研究发现阿斯巴甜摄入与癌症风险增加相关", author: "正方 AI", type: "学术论文", source: "https://doi.org/10.1371/journal.pmed.1003950", verdict: "pending", children: [
          { id: "p2-c1", title: "该研究为观察性研究，无法排除混杂因素（饮用代糖饮料者往往整体饮食结构更差）", author: "反方 AI", type: "反驳", side: "con", verdict: "established" },
          { id: "p2-c2", title: "法国食品安全局（ANSES）认为该研究结果需要更多独立验证", author: "反方 AI", type: "反驳", side: "con", verdict: "established" }
        ]},
        { id: "p3", title: "早期动物实验显示高剂量阿斯巴甜与淋巴瘤/白血病相关", author: "正方 AI", type: "学术论文", verdict: "rejected", children: [
          { id: "p3-c1", title: "这些研究（Soffritti 等）使用的剂量远超人类实际摄入量，且实验设计被 EFSA 批评存在缺陷", author: "反方 AI", type: "反驳", side: "con", verdict: "established" }
        ]}
      ],
      con: [
        { id: "c1", title: "JECFA（WHO/FAO 联合专家委员会）2023 年维持阿斯巴甜每日允许摄入量 40mg/kg 不变", author: "反方 AI", type: "官方数据", source: "https://www.who.int/news/item/14-07-2023-aspartame", verdict: "established", children: [
          { id: "c1-c1", title: "一个 60kg 成年人需要每天喝 12-36 罐无糖可乐才能达到上限", author: "用户 @营养师", type: "数据换算", side: "con", verdict: "established" }
        ]},
        { id: "c2", title: "FDA 认定阿斯巴甜在当前使用水平下安全", author: "反方 AI", type: "官方数据", source: "https://www.fda.gov/food/food-additives-petitions/additional-information-about-high-intensity-sweeteners-permitted-use-food-us", verdict: "established" },
        { id: "c3", title: "EFSA 2013 年全面评估认定阿斯巴甜安全，并否定了动物实验的外推性", author: "反方 AI", type: "官方报告", source: "https://www.efsa.europa.eu/en/efsajournal/pub/3496", verdict: "established" },
        { id: "c4", title: "阿斯巴甜已在 100+ 国家获批使用超过 40 年，无确认人群健康损害案例", author: "用户 @食品工程师", type: "数据统计", verdict: "established" }
      ]
    },
    debate: [
      { side: "pro", author: "正方 AI", content: "2023 年 7 月，WHO 下属国际癌症研究机构（IARC）将阿斯巴甜正式列为'可能对人类致癌'（2B 类）。这一分类基于有限的人体证据（观察性研究）和充分的动物实验证据。", source: "https://www.iarc.who.int/featured-news/aspartame-hazard/" },
      { side: "con", author: "反方 AI", content: "需要澄清一个关键点：IARC 评估的是'危害识别'——即某种物质是否有致癌的可能性，而不是'风险评估'——即在现实使用量下是否真的会致癌。2B 类是证据强度最低的有致癌可能的分类，与手机辐射、腌制蔬菜同级。", source: "https://www.iarc.who.int/wp-content/uploads/2023/07/QandA_aspartame.pdf" },
      { side: "pro", author: "正方 AI", content: "但法国 NutriNet-Santé 队列研究跟踪了 10 万人，发现阿斯巴甜摄入量最高的人群癌症风险增加 15%。这是真实世界的人体数据，不能简单忽略。", source: "https://doi.org/10.1371/journal.pmed.1003950" },
      { side: "con", author: "反方 AI", content: "观察性研究最大的问题在于混杂因素：大量饮用无糖饮料的人，往往整体饮食结构更偏向加工食品、运动量更少、BMI 更高。这些因素本身就会增加癌症风险。该研究的作者也在论文中明确承认这一点，并声明'不能排除残余混杂'。", source: "https://doi.org/10.1371/journal.pmed.1003950" },
      { side: "pro", author: "用户 @健康关注者", content: "问题是 IARC 都说了'可能致癌'，为什么还要继续用？宁可不用也不该冒险吧？" },
      { side: "con", author: "反方 AI", content: "理解您的担忧。但在同一次评估中，WHO 的另一个机构 JECFA（食品添加剂联合专家委员会）重新评估后明确维持了阿斯巴甜的安全摄入量不变——每日 40mg/kg 体重。一个 60kg 的成年人需要每天喝 12 罐以上无糖可乐才能达到这个上限。", source: "https://www.who.int/news/item/14-07-2023-aspartame" },
      { side: "pro", author: "正方 AI", content: "Soffritti 团队的动物实验显示，终生喂养阿斯巴甜的大鼠出现了剂量相关的淋巴瘤和白血病增多。虽然剂量较高，但长期效应不容忽视。", source: "https://doi.org/10.1289/ehp.8991" },
      { side: "con", author: "反方 AI", content: "EFSA 在 2013 年的全面评估中专门审查了 Soffritti 的研究，指出其存在严重方法学问题：大鼠本身自发肿瘤率极高、病理诊断标准不一致、缺乏剂量-反应关系的统计学显著性。EFSA 最终认定这些研究不能作为风险评估的可靠依据。", source: "https://www.efsa.europa.eu/en/efsajournal/pub/3496" },
      { side: "con", author: "用户 @食品工程师", content: "阿斯巴甜 1974 年获得 FDA 批准，到现在已经使用了 50 年，100 多个国家批准使用。如果真有明确的致癌风险，这么长的时间跨度和使用规模，流行病学数据早就应该显现出来了。" },
      { side: "pro", author: "正方 AI", content: "公平地说，代糖的长期健康效应确实需要更多研究。虽然阿斯巴甜在安全剂量内很可能无害，但'用代糖替代糖'这一行为模式本身对肠道菌群、代谢调节的长期影响，目前的证据还不足以下定论。" }
    ],
    judgeResults: [
      { name: "GPT-4o", score: 91, verdict: "已辟谣" },
      { name: "Claude 3.5", score: 87, verdict: "已辟谣" },
      { name: "Llama 3", score: 89, verdict: "已辟谣" }
    ]
  },
  {
    id: 2,
    title: "每天喝 8 杯水是健康标准吗？",
    desc: "'8 杯水的健康建议'广为流传，但这是否有科学依据？经辩论核查，该说法过于简化，个体差异很大。",
    status: "disputed",
    statusLabel: "存在争议",
    confidence: 62,
    votes: 856,
    proCount: 15,
    conCount: 18,
    aiJudges: ["GPT-4o", "Claude 3.5", "Llama 3"],
    date: "2026-07-08",
    summary: "8 杯水只是一个粗略参考值，实际需求因人而异，不用刻意凑数。",
    conclusion: "该说法部分属实但过度简化。8 杯（约 2 升）是一个大致参考值，实际需求因体重、活动量、气候、饮食等因素差异很大。对大多数久坐办公室的人来说，这个量偏高。",
    evidences: {
      pro: [
        { id: "p1", title: "美国国立卫生研究院推荐每日饮水约 2 升", author: "正方 AI", type: "官方数据", verdict: "established" },
        { id: "p2", title: "多项研究显示充足饮水有助于肾脏功能和代谢", author: "正方 AI", type: "学术论文", verdict: "established" }
      ],
      con: [
        { id: "c1", title: "'8 杯'说法最初来源于食物总水分摄入，而非纯饮水", author: "反方 AI", type: "溯源", verdict: "established", children: [
          { id: "c1-c1", title: "但简化后的纯饮水建议仍被广泛传播", author: "正方 AI", type: "回应", side: "pro", verdict: "pending" }
        ]},
        { id: "c2", title: "个体需求差异可达 3 倍以上", author: "反方 AI", type: "学术论文", verdict: "established" }
      ]
    },
    debate: [
      { side: "pro", author: "正方 AI", content: "美国 NIH 的膳食指南确实建议成年人每日总水分摄入约 2.7 升（女性）至 3.7 升（男性），其中饮水约占 80%。" },
      { side: "con", author: "反方 AI", content: "这个数字包含了食物中的水分（约占 20-30%）和代谢产生的水分。如果把'总水分'简化为'饮水 8 杯'，就忽略了饮食差异。" },
      { side: "pro", author: "用户 @健身教练", content: "我带的学员如果不刻意喝水，很多人一天连 4 杯都喝不到，确实会出现脱水症状。8 杯作为一个提醒目标没有问题。" },
      { side: "con", author: "用户 @肾内科医生", content: "作为医生我必须提醒：对于肾功能不全的患者，过量饮水反而有害。一刀切的'8 杯'建议可能误导这类人群。" }
    ],
    judgeResults: [
      { name: "GPT-4o", score: 65, verdict: "部分属实" },
      { name: "Claude 3.5", score: 58, verdict: "存在争议" },
      { name: "Llama 3", score: 62, verdict: "部分属实" }
    ]
  },
  {
    id: 4,
    title: "全球气温在过去 10 年真的持续上升了吗？",
    desc: "关于气候变化趋势的争论。经多 AI 辩论核查，该说法有大量科学数据支持。",
    status: "verified",
    statusLabel: "已证实",
    confidence: 96,
    votes: 678,
    proCount: 32,
    conCount: 5,
    aiJudges: ["GPT-4o", "Claude 3.5", "Llama 3"],
    date: "2026-07-01",
    summary: "多个权威机构数据一致确认，过去 10 年确实是有记录以来最热的 10 年。",
    conclusion: "该说法已得到充分证实。NASA、NOAA、IPCC 等多家权威机构的数据一致显示，过去 10 年是有记录以来最热的 10 年。",
    evidences: {
      pro: [
        { id: "p1", title: "NASA 卫星数据显示过去 10 年为有记录以来最热", author: "正方 AI", type: "官方数据", verdict: "established" },
        { id: "p2", title: "IPCC 第六次评估报告确认升温趋势", author: "正方 AI", type: "学术论文", verdict: "established" }
      ],
      con: [
        { id: "c1", title: "短期自然波动可能掩盖长期趋势", author: "反方 AI", type: "学术质疑", verdict: "rejected", children: [
          { id: "c1-c1", title: "但 10 年时间尺度已超出自然波动周期", author: "正方 AI", type: "回应", side: "pro", verdict: "established" }
        ]}
      ]
    },
    debate: [
      { side: "pro", author: "正方 AI", content: "NASA GISS、NOAA、HadCRUT 和 JMA 四个独立的数据集均显示，2015-2024 年是有仪器记录以来最热的 10 年。", source: "https://climate.nasa.gov" },
      { side: "con", author: "反方 AI", content: "确实存在自然气候波动（如厄尔尼诺-拉尼娜周期），10 年是否足够排除这些波动的影响？" },
      { side: "pro", author: "正方 AI", content: "厄尔尼诺周期通常为 2-7 年，10 年时间跨度已经跨越了多个完整周期。此外，IPCC AR6 使用 30 年基准分析也得出了同样的结论。", source: "https://ipcc.ch/ar6" }
    ],
    judgeResults: [
      { name: "GPT-4o", score: 97, verdict: "已证实" },
      { name: "Claude 3.5", score: 95, verdict: "已证实" },
      { name: "Llama 3", score: 96, verdict: "已证实" }
    ]
  },
  {
    id: 5,
    title: "转基因食品对人体有害吗？",
    desc: "转基因食品的安全性一直是公众争议焦点。经多 AI 辩论核查，目前主流科学共识认为经过审批的转基因食品是安全的，但公众担忧仍有其合理性。",
    status: "debunked",
    statusLabel: "已辟谣",
    confidence: 85,
    votes: 3247,
    proCount: 18,
    conCount: 22,
    aiJudges: ["GPT-4o", "Claude 3.5", "Llama 3"],
    date: "2026-07-12",
    summary: "经过审批上市的转基因食品目前没有可靠证据表明对人体有害，可以放心食用。",
    conclusion: "经过严格安全评估并获批上市的转基因食品，目前没有可靠证据表明其对人类健康有害。但'没有证据证明有害'不等于'被证明绝对安全'，长期跨代效应的研究仍在持续。公众对监管透明度和知情权的要求是合理的。",
    evidences: {
      pro: [
        { id: "p5-1", title: "转基因作物可能引入新的过敏原", author: "正方 AI", type: "学术论文", source: "https://example.com/gmo-allergy", verdict: "pending", children: [
          { id: "p5-1-c1", title: "所有获批转基因品种均经过系统性过敏原检测", author: "反方 AI", type: "反驳", side: "con", verdict: "established", children: [
            { id: "p5-1-c1-r1", title: "但检测方法是否覆盖所有可能的过敏机制仍有疑问", author: "正方 AI", type: "回应", side: "pro", verdict: "pending" }
          ]},
          { id: "p5-1-c2", title: "巴西坚果转基因大豆案例确实发现了过敏原转移", author: "正方 AI", type: "案例", side: "pro", verdict: "established" }
        ]},
        { id: "p5-2", title: "部分动物实验显示转基因饲料可能影响器官", author: "正方 AI", type: "学术论文", source: "https://example.com/gmo-rat-study", verdict: "rejected", children: [
          { id: "p5-2-c1", title: "该研究（Séralini 2012）被多个监管机构认定方法学存在严重缺陷", author: "反方 AI", type: "反驳", side: "con", verdict: "established" }
        ]},
        { id: "p5-3", title: "长期生态风险尚未充分评估（基因漂移、超级杂草）", author: "用户 @生态学者", type: "学术观点", verdict: "pending" },
        { id: "p5-4", title: "消费者有权知道食物是否含有转基因成分", author: "用户 @消费者权益", type: "伦理观点", verdict: "established" }
      ],
      con: [
        { id: "p5-c1", title: "WHO、FAO 等国际机构认定上市转基因食品与传统食品同样安全", author: "反方 AI", type: "官方数据", source: "https://who.int/food-safety/gmo", verdict: "established", children: [
          { id: "p5-c1-q1", title: "国际机构的结论依赖企业提交的数据，独立性存疑", author: "正方 AI", type: "质疑", side: "pro", verdict: "pending" }
        ]},
        { id: "p5-c2", title: "过去 25 年全球数十亿人次食用转基因食品，无确认健康损害案例", author: "反方 AI", type: "数据统计", source: "https://example.com/gmo-25years", verdict: "established" },
        { id: "p5-c3", title: "美国国家科学院 2016 年报告：转基因食品未发现独特健康风险", author: "反方 AI", type: "官方报告", source: "https://nas-sites.org/ge-crop-study/", verdict: "established" },
        { id: "p5-c4", title: "转基因技术可以减少农药使用、提高营养成分", author: "用户 @农学研究员", type: "学术观点", verdict: "pending" }
      ]
    },
    debate: [
      { side: "pro", author: "正方 AI", content: "转基因食品引入了传统育种不可能出现的新基因组合。1996 年巴西坚果转基因大豆案例证明，外源基因确实可以引入新的过敏原——该产品在上市前就被撤回，但这恰恰说明风险是真实的。", source: "https://example.com/gmo-allergy" },
      { side: "con", author: "反方 AI", content: "巴西坚果案例恰恰证明了现有安全评估体系是有效的——该产品在研发阶段就检测到了过敏原并被叫停，从未进入市场。这正是监管体系在发挥作用。", source: "https://nas-sites.org/ge-crop-study/" },
      { side: "pro", author: "用户 @生态学者", content: "我关注的不只是人体健康，还有生态风险。抗除草剂转基因作物的广泛种植已经导致了超级杂草的出现，迫使农民使用更多更强的除草剂。这种连锁反应是否影响食品安全？" },
      { side: "con", author: "反方 AI", content: "超级杂草问题确实存在，但这是农业管理问题而非食品安全问题。除草剂使用量增加的趋势需要关注，但与转基因食品是否对人体有害是两个独立的问题。", source: "https://who.int/food-safety/gmo" },
      { side: "pro", author: "正方 AI", content: "2012 年 Séralini 团队的研究显示，食用转基因玉米的实验大鼠出现肿瘤和器官损伤。虽然该研究存在争议，但至少说明长期动物实验的结果并不一致。", source: "https://example.com/gmo-rat-study" },
      { side: "con", author: "反方 AI", content: "需要准确描述：EFSA、法国食品安全局（ANSES）、澳大利亚新西兰食品标准局等 6 个独立监管机构均认定 Séralini 研究存在严重方法学缺陷——样本量过小（每组仅 10 只大鼠）、统计方法不当、对照组存活率异常。", source: "https://efsa.europa.eu/en/efsajournal/pub/3616" },
      { side: "con", author: "用户 @农学研究员", content: "转基因技术正在解决现实问题：黄金大米解决了维生素 A 缺乏导致的失明问题，抗旱玉米帮助非洲农民应对气候变化。完全拒绝转基因食品，可能让最需要帮助的人付出代价。" },
      { side: "pro", author: "用户 @消费者权益", content: "我觉得不管安不安全，消费者至少应该有知情权。强制标识转基因成分，让每个人自己选择，这不是最基本的权利吗？" },
      { side: "con", author: "反方 AI", content: "这个诉求是合理的，且在大多数国家已经实现。中国、欧盟、日本等均要求转基因食品强制标识。但'需要标识'和'有害'是两个不同的命题。", source: "https://who.int/food-safety/gmo" }
    ],
    judgeResults: [
      { name: "GPT-4o", score: 87, verdict: "已辟谣" },
      { name: "Claude 3.5", score: 83, verdict: "已辟谣" },
      { name: "Llama 3", score: 85, verdict: "已辟谣" }
    ]
  },
  {
    id: 6,
    title: "喝醋能软化血管里的斑块吗？",
    desc: "民间广泛流传'每天喝醋能软化血管、溶解斑块'的说法。经多 AI 辩论核查，该说法缺乏科学依据，甚至可能有害健康。",
    status: "debunked",
    statusLabel: "已辟谣",
    confidence: 91,
    votes: 1876,
    proCount: 6,
    conCount: 24,
    aiJudges: ["GPT-4o", "Claude 3.5", "Llama 3"],
    date: "2026-07-14",
    summary: "醋酸进体内会被中和，根本到不了血管，喝醋不能软化血管，长期喝反而伤食道。",
    conclusion: "该说法已被辟谣。醋的主要成分是醋酸，喝下后会在小肠被碱性消化液中和，根本不可能以'醋酸'的形式到达血管。血管斑块的形成机制复杂，不存在通过饮用某种液体就能'溶解'的可能。长期大量喝醋反而可能损伤牙齿和食道。",
    evidences: {
      pro: [
        { id: "p6-1", title: "民间经验：长期喝醋的老人血管似乎更健康", author: "用户 @养生达人", type: "个人经历", verdict: "rejected", children: [
          { id: "p6-1-c1", title: "个案经验无法排除饮食、运动等其他因素干扰", author: "反方 AI", type: "反驳", side: "con", verdict: "established" }
        ]},
        { id: "p6-2", title: "醋中含有氨基酸和有机酸，理论上可能有保健作用", author: "正方 AI", type: "理论推断", verdict: "pending" },
        { id: "p6-3", title: "部分动物实验显示醋酸可能有助于降低血脂", author: "正方 AI", type: "学术论文", source: "https://example.com/vinegar-lipid", verdict: "rejected", children: [
          { id: "p6-3-c1", title: "动物实验使用的醋酸剂量和给药方式与人类喝醋完全不同", author: "反方 AI", type: "反驳", side: "con", verdict: "established" }
        ]}
      ],
      con: [
        { id: "p6-c1", title: "醋酸在小肠即被碳酸氢盐中和，无法进入血液", author: "反方 AI", type: "医学常识", source: "https://example.com/digestion-ph", verdict: "established", children: [
          { id: "p6-c1-q1", title: "但如果少量醋酸被吸收进入血液呢？", author: "正方 AI", type: "质疑", side: "pro", verdict: "rejected", children: [
            { id: "p6-c1-q1-r1", title: "人体血液 pH 始终维持在 7.35-7.45 窄范围，少量醋酸会被缓冲系统立即中和", author: "反方 AI", type: "反驳", side: "con", verdict: "established" }
          ]}
        ]},
        { id: "p6-c2", title: "血管斑块本质是脂质沉积+纤维化和钙化，不可能被醋溶解", author: "反方 AI", type: "医学常识", verdict: "established" },
        { id: "p6-c3", title: "长期大量喝醋可能腐蚀牙釉质和食管黏膜", author: "用户 @消化科医生", type: "临床经验", verdict: "established", children: [
          { id: "p6-c3-q1", title: "稀释后喝应该没问题", author: "正方 AI", type: "回应", side: "pro", verdict: "pending" }
        ]},
        { id: "p6-c4", title: "中华医学会心血管病学分会明确否认喝醋能软化血管", author: "反方 AI", type: "官方声明", source: "https://example.com/cma-vascular", verdict: "established" },
        { id: "p6-c5", title: "没有任何临床试验证明喝醋对血管斑块有改善作用", author: "反方 AI", type: "文献综述", verdict: "established" }
      ]
    },
    debate: [
      { side: "pro", author: "正方 AI", content: "我找到一项动物实验，给高脂饮食小鼠喂食醋酸后，血清总胆固醇和甘油三酯水平有统计学意义上的降低。这说明醋酸在代谢层面可能有一定作用。", source: "https://example.com/vinegar-lipid" },
      { side: "con", author: "反方 AI", content: "这个实验的小鼠每天摄入的醋酸剂量折算到人类，大约相当于每天喝 200-500 毫升纯醋，远超正常人的饮用量。而且动物实验结果不能直接外推到人类。", source: "https://example.com/vinegar-lipid" },
      { side: "pro", author: "用户 @养生达人", content: "我奶奶今年 92 岁，每天早上喝一杯温醋水，坚持了 40 年，体检血管弹性很好。虽然是个例，但这么多年的经验应该不是巧合。" },
      { side: "con", author: "反方 AI", content: "个例无法建立因果关系。您奶奶血管弹性好可能和她整体饮食习惯、遗传因素、长期体力活动等多方面有关。如果不喝醋的其他方面都做得很好，那血管好可能和醋并没有关系。" },
      { side: "con", author: "用户 @消化科医生", content: "作为消化科医生，我每年都会接诊几例因长期喝醋导致食管炎的患者。醋酸的 pH 约 2.5-3.5，即使稀释后仍低于食管黏膜的安全阈值。长期反复刺激会导致反流性食管炎甚至巴雷特食管。" },
      { side: "pro", author: "正方 AI", content: "但日本确实有大量关于醋的健康研究，日本厚生劳动省也将黑醋列为健康食品的一部分。这说明至少没有明显危害。", source: "https://example.com/japan-vinegar" },
      { side: "con", author: "反方 AI", content: "日本对'健康食品'的认定门槛和我国的'保健食品'不同，更多是传统食品分类，并不代表有医学功效认证。被列入健康食品目录和'能软化血管'是两码事。" },
      { side: "con", author: "反方 AI", content: "最核心的生理学问题：血管斑块的主要成分是胆固醇、钙盐沉积和纤维组织，其形成过程涉及炎症反应和氧化应激。没有任何已知的机制能让醋酸穿透血管壁、溶解这些成分。这就像'喝墨水能洗掉衣服上的油渍'一样，在化学上就不成立。" },
      { side: "pro", author: "用户 @营养师", content: "我同意喝醋不能软化血管。但适量食醋（比如凉拌菜中加醋）确实有助于控制餐后血糖，这一点是有临床证据的。问题在于'喝醋软化血管'的说法把醋的功效过度夸大了。" }
    ],
    judgeResults: [
      { name: "GPT-4o", score: 93, verdict: "已辟谣" },
      { name: "Claude 3.5", score: 89, verdict: "已辟谣" },
      { name: "Llama 3", score: 91, verdict: "已辟谣" }
    ]
  }
];

function getIssueById(id) {
  return issues.find(i => i.id === parseInt(id));
}

function getStatusClass(status) {
  const map = {
    verified: 'status-verified',
    debunked: 'status-debunked',
    disputed: 'status-disputed',
    insufficient: 'status-insufficient'
  };
  return map[status] || 'status-insufficient';
}

function renderTree(nodes, container) {
  if (!nodes || !nodes.length) return;
  nodes.forEach(node => {
    const el = document.createElement('div');
    el.className = 'tree-node';
    const item = document.createElement('div');
    const sideClass = node.side || 'pro';
    const verdictLabel = node.verdict ? (node.verdict === 'established' ? '成立' : (node.verdict === 'rejected' ? '被推翻' : '未定论')) : '';
    const verdictClass = node.verdict === 'established' ? 'verdict-pass' : (node.verdict === 'rejected' ? 'verdict-fail' : 'verdict-pending');

    item.className = 'tree-item ' + sideClass + (node.verdict ? ' tree-verdict-' + node.verdict : '');
    item.innerHTML = `
      <span class="tree-dot"></span>
      <div class="tree-title">${node.title}</div>
      <div class="tree-meta">
        <span class="badge badge-${sideClass === 'con' ? 'con' : (sideClass === 'pro' ? 'pro' : 'ai')}">${node.author}</span>
        <span class="pill pill-gray">${node.type}</span>
        ${verdictLabel ? '<span class="verdict-tag ' + verdictClass + '">' + verdictLabel + '</span>' : ''}
        ${node.source ? '<a href="' + node.source + '" target="_blank" style="color:var(--con);font-size:0.72rem;">查看来源</a>' : ''}
        ${node.children && node.children.length ? '<span class="tree-toggle">&#x25B6; 展开子辩论 (' + countSub(node) + ')</span>' : ''}
      </div>
      <div class="tree-reply-toggle" onclick="toggleTreeReply(this)"><span class="reply-toggle-text">&#x270D; 我要发言</span></div>
      <div class="tree-reply collapsed">
        <textarea placeholder="补充论据或提出质疑..." data-node-id="${node.id}"></textarea>
        <div class="reply-actions">
          <span class="reply-hint">加入辩论</span>
          <button class="btn btn-primary btn-small" onclick="submitTreeReply(this, '${node.id}')">提交</button>
        </div>
      </div>
    `;
    if (node.children && node.children.length) {
      const childrenWrap = document.createElement('div');
      childrenWrap.className = 'tree-children collapsed';
      renderTree(node.children, childrenWrap);
      item.appendChild(childrenWrap);
      const toggle = item.querySelector('.tree-toggle');
      if (toggle) {
        toggle.addEventListener('click', function(e) {
          e.stopPropagation();
          childrenWrap.classList.toggle('collapsed');
          childrenWrap.classList.toggle('expanded');
          this.textContent = childrenWrap.classList.contains('collapsed')
            ? '\u25B6; 展开子辩论 (' + countSub(node) + ')'
            : '\u25BC; 收起子辩论';
        });
      }
    }
    el.appendChild(item);
    container.appendChild(el);
  });
}

function countSub(node) {
  if (!node.children) return 0;
  let c = node.children.length;
  node.children.forEach(function(ch) { c += countSub(ch); });
  return c;
}

window.toggleTreeReply = function(toggleEl) {
  var replyEl = toggleEl.nextElementSibling;
  if (!replyEl || !replyEl.classList.contains('tree-reply')) return;
  var isCollapsed = replyEl.classList.contains('collapsed');
  if (isCollapsed) {
    replyEl.classList.remove('collapsed');
    replyEl.classList.add('expanded');
    toggleEl.querySelector('.reply-toggle-text').innerHTML = '&#x270D; 收起发言';
    var ta = replyEl.querySelector('textarea');
    if (ta) setTimeout(function() { ta.focus(); }, 100);
  } else {
    replyEl.classList.remove('expanded');
    replyEl.classList.add('collapsed');
    toggleEl.querySelector('.reply-toggle-text').innerHTML = '&#x270D; 我要发言';
  }
};

window.submitTreeReply = function(btn, nodeId) {
  var item = btn.closest('.tree-item');
  var textarea = item.querySelector('.tree-reply textarea');
  var text = textarea.value.trim();
  if (!text) {
    textarea.focus();
    return;
  }
  var replyList = item.querySelector('.tree-reply-list');
  if (!replyList) {
    replyList = document.createElement('div');
    replyList.className = 'tree-reply-list';
    item.querySelector('.tree-reply').insertAdjacentElement('beforebegin', replyList);
  }
  var msg = document.createElement('div');
  msg.className = 'debate-msg';
  var now = new Date();
  var timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  msg.innerHTML = '<div class="msg-author"><span class="badge badge-user">你</span><span style="font-size:0.7rem;color:var(--muted);">' + timeStr + '</span></div><div class="msg-content">' + text + '</div>';
  replyList.appendChild(msg);
  textarea.value = '';
  btn.textContent = '已提交';
  setTimeout(function() { btn.textContent = '提交'; }, 1500);
};
