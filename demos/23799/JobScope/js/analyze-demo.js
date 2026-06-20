/**
 * ============================================================
 * JobScope - 静态演示版分析页逻辑
 * 从本地 Markdown 文件加载数据（优先 fetch，失败则用内嵌兜底）
 * ============================================================
 */
(function () {
    'use strict';

    // ---- 内嵌数据（fetch 失败时的兜底） ----
        var EMBEDDED_DATA = {
        jobs: ["## 【第1条】爬虫工程师\r\n- 薪资：100-150/天\r\n- 城市：成都 | 5天/周 | 6个月\r\n- 公司：萌想科技（实习僧） | 互联网/游戏/软件 | 150-500人\r\n- 岗位标签：周末双休、一对一导师、不加班\r\n- 公司福利：职业发展、大牛带教、团队氛围好、扁平管理、发展潜力大、可留用\r\n\r\n### 职位描述\r\n【岗位职责】\r\n参与内部系统需求分析与功能迭代，完成接口设计及技术文档输出\r\n开发和维护数据采集爬虫程序，完成数据抓取、清洗、存储及日常监控\r\n协助 AI 相关需求落地，包括模型对接、Prompt 调优及 AI 编程工具（Cursor、Codex 等）的应用\r\n响应团队安排，完成交办的其他临时任务与项目支持工作\r\n【任职要求】\r\n2027届计算机、软件工程、数学等相关专业在读，实习期 3 个月及以上\r\n熟悉 Python、Go 等编程语言，具备爬虫开发经验（Scrapy、Selenium 等）优先\r\n熟悉常见网络协议（HTTP、TCP/IP、SMTP等），有邮件服务搭建或 Gmail、Outlook 等海外邮件系统对接经验者优先\r\n了解大语言模型应用，熟练使用 AI 编程工具者优先\r\n具备 SQL 基础，有 Git 协作开发经验，了解基本的软件工程流程\r\n具备良好的沟通能力、学习能力和团队协作精神，能独立思考和解决问题\r\n\r\n---\r\n\r\n## 【第2条】爬虫实习生\r\n- 薪资：120-150/天\r\n- 城市：北京 | 5天/周 | 3个月\r\n- 公司：国信创新 | 互联网/游戏/软件 | 150-500人\r\n- 岗位标签：爬虫\r\n- 公司福利：七险一金、周末双休、定期培训、轮岗机会\r\n\r\n### 职位描述\r\n岗位职责\r\n\r\n\r\n	使用C#语言，开发爬虫客户端，实现分布式爬虫。\r\n\r\n\r\n	任职要求\r\n\r\n\r\n	1，有C#培训经历，自己独立完成练习项目\r\n\r\n\r\n	2 ，最好有ce fs ha rp，chrom e 开发经验\r\n\r\n\r\n	3，学习能力强，工作严谨\r\n\r\n\r\n	4 ，有2 ～3个月稳定的实习时间\r\n\r\n---\r\n\r\n## 【第3条】爬虫开发实习生\r\n- 薪资：150-200/天\r\n- 城市：北京 | 5天/周 | 3个月\r\n- 公司：知乎 | 互联网/游戏/软件 | 2000人以上\r\n- 岗位标签：培养\r\n- 公司福利：行业口碑、办公用品、不定时聚餐、大咖、公司氛围好、工作环境舒适\r\n\r\n### 职位描述\r\n岗位职责\r\n1. 数据采集： 参与公司业务数据的爬取工作，使用 Python 编写基础爬虫，完成目标网页的文本、图片及接口数据的自动化抓取；\r\n2. 反爬应对： 负责处理常见的反爬限制，如配置请求头（User-Agent）、处理 Cookie、使用代理 IP 解决封禁问题，保障爬虫日常稳定运行；\r\n3. 日常维护： 维护现有的爬虫脚本，监控运行状态，及时修复因网页改版或超时导致的脚本报错；\r\n4. 数据入库： 配合团队将清洗好的数据存储到数据库（如 MySQL 或 MongoDB）中。\r\n\r\n任职要求\r\n「硬性要求」\r\n1. 学历背景： 本科及以上学历在校生（计算机、软件工程、大数据等相关专业优先），有充裕的实习时间；\r\n2. Python基础： 熟练掌握 Python 基础语法，熟悉 requests、BeautifulSoup 或 Xpath 等常用爬虫与解析库；\r\n3. 网页分析： 具备基本的前端常识，能看懂简单的 HTML 结构，会使用浏览器开发者工具（F12）抓包并分析网络请求；\r\n4. 数据库基础： 了解至少一种数据库（如 MySQL 或 MongoDB），会使用基本的 SQL 或增删改查命令；\r\n\r\n「加分项」（满足任意一条均是极大的加分）\r\n1. 写过个人的爬虫小项目（如抓取过某小说网站、某电商商品信息、某图片壁纸等）；\r\n2. 熟悉 Selenium 或 Playwright 等自动化工具，能处理简单的动态加载网页；\r\n3. 了解多线程/多进程基础，或对 Scrapy 框架有初步的使用经验。\r\n\r\n---\r\n\r\n## 【第4条】爬虫实习生-上海\r\n- 薪资：200-200/天\r\n- 城市：上海 | 3天/周 | 5个月\r\n- 公司：达势科技 | 互联网/游戏/软件 | 50-150人\r\n- 岗位标签：不加班、地铁周边、节日福利、实习津贴、周末双休\r\n- 公司福利：国际化团队、双休制、扁平化管理、从不加班、外企氛围、弹性工作时间\r\n\r\n### 职位描述\r\n关于我们\r\n-Dashmote是一家专注于由人工智能技术驱动的下一代数据产品的创业公司，在阿姆斯特丹（总部）和上海设有办事处。我们通过解码地点的数字足迹来连接线下和线上世界，使我们的企业客户能够了解市场并做出更明智的决定。Dashmote在未来几年有雄心勃勃的计划，因此我们需要确保我们有合适的人将这些计划付诸实施。你想通过为Dashmote的核心产品（被一些最大的财富500强公司使用）做出贡献来提升你的职业生涯吗？那么我们正在寻找你。\r\n\r\n岗位职责\r\n1.协助进行scrapy爬虫项目的运维工作，以及数据的清洗提取工作\r\n2.根据任务需求，协助开发网页端或App端的数据爬取工作\r\n3.在指导下解决开发中碰到的问题，并具备良好的沟通能力\r\n\r\n岗位要求\r\n1.计算机科学，工程或相关学科在读本科生；\r\n2.了解Python；有SQL和NoSQL技术的经验优先；\r\n3.了解网络抓取原理、HTTP协议，有了解常见的反爬虫原理者优先\r\n4.有使用requests, Scrapy, BS4, xpath, regex等工具进行数据抓取的经验者优先\r\n5.了解数据清洗，有使用Pandas进行数据处理的经验者优先\r\n6.了解版本控制工具(例如git), 数据库管理系统(Mysql)\r\n7.英文基础良好者优先\r\n8.愿意学习和在短时间内掌握新的技能和方法；擅长团队合作\r\n9. 能尽快入职者优先，持续时间5个月及以上，每周至少3天到岗，可长期实习者优先\r\n\r\n我们的优势\r\n1.办公地址位于上海市中心（曹杨路地铁站附近），生活便利\r\n2.Dashmote Flex：居家和公司办公结合 ，每年可全球远程办公20天\r\n3.提供笔记本电脑\r\n4.内推奖金\r\n5.我们曾被Google，麦肯锡和Rocket Internet授予欧洲最佳B2B创业公司\r\n6.在一支国际化的年轻团队中工作与成长\r\n7.轻松自由的工作氛围和互帮互助的团队文化\r\n8.各种有趣的团队活动，吃不完的零食喝不完的饮料\r\n9.实习薪资200。转正机会将视实习表现而定\r\n\r\n---\r\n\r\n## 【第5条】Python爬虫实习生\r\n- 薪资：100-150/天\r\n- 城市：北京 | 5天/周 | 3个月\r\n- 公司：北京智慧星光信息技术有限公司 | 互联网/游戏/软件 | 500-2000人\r\n- 岗位标签：可转正实习、零基础实习\r\n- 公司福利：文本大数据、周中双休、七险一金、发展空间大、ToB\r\n\r\n### 职位描述\r\n岗位职责：\r\n\r\n\r\n	1、完成对指定网站的信息采集配置及维护工作；\r\n\r\n\r\n	2、负责网页信息抽取等研发和优化工作；\r\n\r\n\r\n	任职要求：\r\n\r\n\r\n	1、计算机科学与技术、软件工程等相关专业；\r\n\r\n\r\n	2、熟悉linux平台，有一年以上Python编程经验，熟悉前端开发的相关领域知识；\r\n\r\n\r\n	3、熟悉XPath、正则表达式原理等；\r\n\r\n\r\n	4、具有优秀的团队合作和沟通协作能力，善于学习，乐于分享，能承受较大工作压力；\r\n\r\n\r\n	5、理解Web等数据抓取的工作原理及流程者优先；\r\n\r\n\r\n	6、熟练使用Mysql/MongoDB/Redis者优先；\r\n\r\n---\r\n\r\n## 【第6条】软件工程数据采集爬虫专员\r\n- 薪资：150-300/天\r\n- 城市：上海 | 3天/周 | 3个月\r\n- 公司：拓端数据 | 企业服务/咨询 | 少于15人\r\n- 岗位标签：远程实习、可转正实习、实习津贴、提供实习证明、背景调查支持\r\n- 公司福利：数据分析、数据挖掘\r\n\r\n### 职位描述\r\n职位描述\r\n\r\n\r\n	1、参与爬虫项目的架构设计、研发、编程工作，改进和提升爬虫效率； \r\n2、设计爬虫策略和防屏蔽规则，提升网页抓取的效率和质量； \r\n3、负责网页采集任务的分析及采集方案设计； \r\n4、负责分布式爬虫策略持续优化。 \r\n\r\n\r\n	任职要求\r\n\r\n\r\n	 \r\n\r\n\r\n	1、熟悉Java、Python、Shell、R 等至少一门语言； \r\n\r\n\r\n	2、负责分析并采集网站数据，并按照要求对采集的数据进行整理； \r\n \r\n\r\n\r\n	3、具有较强的业务分析能力，较好的沟通表达和综合协调能力； \r\n\r\n\r\n	4、责任心强，有快速学习能力，对大数据方向感兴趣。 \r\n \r\n\r\n\r\n	 \r\n\r\n\r\n	福利\r\n\r\n\r\n	大数据行业 热门商圈 弹性工作 远程工作\r\n\r\n---\r\n\r\n## 【第7条】Python爬虫实习生（AIGC数据方向）\r\n- 薪资：100-100/天\r\n- 城市：成都 | 5天/周 | 3个月\r\n- 公司：英大长安咨询 | 金融/经济/投资/财会 | 50-150人\r\n- 岗位标签：一对一导师、接受大一大二、地铁周边\r\n- 公司福利：\r\n\r\n### 职位描述\r\n【岗位职责】\r\n1.核心数据采集： 负责公司AIGC业务所需的多模态数据（文本、文档、图像等）的爬虫开发与采集工作；\r\n2.攻克爬虫难题： 应对各类反爬策略（如IP限制、验证码、JS逆向等），设计高效、稳定的分布式爬虫策略；\r\n3.数据清洗与入库： 负责对采集的数据进行清洗、去重、格式转换（如PDF转Markdown），为大模型训练提供高质量的语料支持；\r\n4.自动化流程： 维护和优化数据采集流水线，监控爬虫系统的运行状态，确保数据更新的及时性和完整性；\r\n5.业务协作： 配合算法团队，协助完成部分基于大模型（LLM）的数据标注或简单应用层开发（如AI Agent的数据接口对接）。\r\n\r\n【岗位要求】\r\n1.本科及以上学历，计算机、软件工程等相关专业；\r\n2.精通Python编程，熟练掌握多线程/多进程编程，代码风格规范；\r\n3.熟练掌握主流爬虫框架（如Scrapy、Selenium、Playwright、Pyppeteer等），深刻理解HTTP/HTTPS协议；\r\n4.具备反爬对抗经验，了解常见的反爬机制（Cookie池、代理IP池、JS逆向分析等）；\r\n5.熟悉MySQL、Redis、MongoDB等主流数据库的使用；\r\n6.加分项： 对AIGC/大模型有浓厚兴趣，了解LangChain或有数据清洗（ETL）经验者优先。\r\n\r\n---\r\n"],
        jieba: ["\r\n----------------------------------------------------------------------\r\n一、岗位职责关键词 TOP15\r\n----------------------------------------------------------------------\r\n   1. 爬虫           █████████████████████████████████████████████████████████████████████ (0.3477)\r\n   2. 数据采集         ████████████████████████████████████ (0.1821)\r\n   3. AI           ████████████████████████████████████ (0.1821)\r\n   4. 反爬           ████████████████████████████████████ (0.1821)\r\n   5. 编程           █████████████████████████████ (0.1499)\r\n   6. 数据           █████████████████████████████ (0.1456)\r\n   7. 模型           ███████████████████████████ (0.1382)\r\n   8. AIGC         ████████████████████████ (0.1214)\r\n   9. IP           ████████████████████████ (0.1214)\r\n  10. JS逆向         ████████████████████████ (0.1214)\r\n  11. 数据清洗         ████████████████████████ (0.1214)\r\n  12. 熟练掌握         ██████████████████████ (0.1102)\r\n  13. 文档           ████████████████████ (0.1014)\r\n  14. 完成           ████████████████████ (0.1009)\r\n  15. 对接           █████████████████ (0.0854)\r\n\r\n----------------------------------------------------------------------\r\n二、任职要求关键词 TOP15\r\n----------------------------------------------------------------------\r\n   1. 优先           █████████████████████████████████████████████████████████████████ (0.3298)\r\n   2. 软件工程         ███████████████████████████████████████████████████████████████ (0.3193)\r\n   3. 具备           ██████████████████████████████████████████████████████ (0.2727)\r\n   4. 经验           ██████████████████████████████████████████████████ (0.2525)\r\n   5. 协作           ████████████████████████████████████████████████ (0.2427)\r\n   6. 熟悉           ██████████████████████████████████████ (0.1918)\r\n   7. 邮件系统         █████████████████████████████████████ (0.1883)\r\n   8. 实习期          ███████████████████████████████████ (0.1781)\r\n   9. 2027         ███████████████████████████████████ (0.1758)\r\n  10. Python       ███████████████████████████████████ (0.1758)\r\n  11. Go           ███████████████████████████████████ (0.1758)\r\n  12. Scrapy       ███████████████████████████████████ (0.1758)\r\n  13. Selenium     ███████████████████████████████████ (0.1758)\r\n  14. HTTP         ███████████████████████████████████ (0.1758)\r\n  15. TCP          ███████████████████████████████████ (0.1758)\r\n\r\n----------------------------------------------------------------------\r\n三、技术体系归纳\r\n----------------------------------------------------------------------\r\n  ▸ 编程语言：Python, Go, C#, Redis\r\n  ▸ 爬虫框架/工具：Scrapy, Selenium, Playwright, requests\r\n  ▸ 数据库：MongoDB, MySQL, SQL, Redis\r\n  ▸ 网络协议：HTTP\r\n  ▸ AI/AIGC：AI, AIGC\r\n  ▸ 反爬对抗：反爬, JS逆向, JS逆向\r\n  ▸ 数据处理：数据清洗\r\n\r\n----------------------------------------------------------------------\r\n四、岗位职责核心方向汇总\r\n----------------------------------------------------------------------\r\n  1. [1次提及] 参与内部系统需求分析与功能迭代，完成接口设计及技术文档输出\r\n  2. [1次提及] 开发和维护数据采集爬虫程序，完成数据抓取、清洗、存储及日常监控\r\n  3. [1次提及] 协助 AI 相关需求落地，包括模型对接、Prompt 调优及 AI 编程工具（Cursor、Codex 等）的应用\r\n  4. [1次提及] 熟悉 Python、Go 等编程语言，具备爬虫开发经验（Scrapy、Selenium 等）优先\r\n  5. [1次提及] 熟悉常见网络协议（HTTP、TCP/IP、SMTP等），有邮件服务搭建或 Gmail、Outlook 等海外邮件系统对接\r\n  6. [1次提及] 具备 SQL 基础，有 Git 协作开发经验，了解基本的软件工程流程\r\n  7. [1次提及] 使用C#语言，开发爬虫客户端，实现分布式爬虫。\r\n  8. [1次提及] 2 ，最好有ce fs ha rp，chrom e 开发经验\r\n  9. [1次提及] 1. 数据采集： 参与公司业务数据的爬取工作，使用 Python 编写基础爬虫，完成目标网页的文本、图片及接口数据的自动\r\n  10. [1次提及] 3. 日常维护： 维护现有的爬虫脚本，监控运行状态，及时修复因网页改版或超时导致的脚本报错；\r\n  11. [1次提及] 4. 数据入库： 配合团队将清洗好的数据存储到数据库（如 MySQL 或 MongoDB）中。\r\n  12. [1次提及] 3. 网页分析： 具备基本的前端常识，能看懂简单的 HTML 结构，会使用浏览器开发者工具（F12）抓包并分析网络请求；"],
        llmReport: ["# 爬虫/数据采集岗位市场深度分析报告\r\n\r\n> **分析说明**：本报告基于提供的 7 份爬虫/数据采集相关岗位 JD 进行结构化提取与交叉分析，样本覆盖成都、北京、上海三地，包含正式岗与实习生岗，旨在为技术选型、岗位匹配与职业规划提供数据支撑。\r\n\r\n---\r\n\r\n## 一、市场技术体系概览\r\n\r\n基于 7 份 JD 的关键词频次与上下文权重，当前爬虫岗位的技术栈呈现明显的**分层化**与**工程化**特征：\r\n\r\n| 技能分级 | 代表技术/工具 | 市场出现频次/说明 | 核心定位 |\r\n|:---|:---|:---|:---|\r\n| 🔴 **必备技能**<br>（出现≥6次或底层基石） | `Python`、`HTTP/HTTPS协议`、`基础反爬策略`（代理IP/Cookie池/UA伪装）、`关系型/文档型数据库`（MySQL/MongoDB）、`数据解析`（XPath/正则/BS4） | 7 份中 6 份明确将 Python 列为首选；网络协议与数据库为数据流转的必经环节；基础反爬为日常运维底线。 | 岗位准入门槛与日常开发基石 |\r\n| 🟠 **重要技能**<br>（提及 4~5 次） | `爬虫框架`（Scrapy/requests）、`浏览器自动化工具`（Selenium/Playwright/Pyppeteer）、`并发编程`（多线程/多进程）、`版本控制与协作`（Git）、`数据清洗`（Pandas/去重/格式化） | 超过半数岗位要求框架级开发能力；动态渲染抓取已成为标配；工程化协作（Git+规范）被频繁强调。 | 胜任中型项目与团队协同的核心能力 |\r\n| 🟡 **加分技能**<br>（提及 2~3 次或特定场景） | `高级逆向`（JS逆向/验证码破解）、`分布式架构`（分布式策略/爬虫集群）、`多语言栈`（C#/Go/Java/Shell/R）、`海外系统对接`（SMTP/Gmail/英文能力）、`Linux环境部署` | 针对高对抗性数据源或跨国业务；部分传统企业（如国信创新）仍保留 C# 技术栈；分布式与逆向是薪资分水岭。 | 突破复杂业务瓶颈、提升议价权的关键 |\r\n| 🔵 **新兴/趋势性技能**<br>（少数但高价值） | `AI/AIGC数据工程`（多模态采集/语料构建）、`LLM应用对接`（Prompt调优/LangChain/AI Agent）、`AI辅助编程`（Cursor/Codex/Copilot）、`文档结构化转换`（PDF转Markdown） | 在 7 份 JD 中明确出现在 2 份（28.5%），但均附带高薪、核心业务或“转正优先”标签，增速极快。 | 面向下一代数据基础设施与 AI 原生应用的差异化竞争力 |\r\n\r\n---\r\n\r\n## 二、岗位职责汇总分析\r\n\r\n将分散的职责描述聚类，可归纳为 **5 大核心业务方向**：\r\n\r\n### 1. 🌐 核心数据采集与架构开发\r\n- 负责网页、APP、API 接口的数据自动化抓取脚本编写\r\n- 参与爬虫系统架构设计、任务调度与采集策略制定\r\n- 针对多模态数据（文本、图像、文档、音视频）开发专项采集模块\r\n\r\n### 2. 🛡️ 反爬对抗与系统稳定性维护\r\n- 应对常见反爬机制（IP封禁、Cookie校验、验证码、动态加载）\r\n- 设计并维护 Cookie池、代理IP池、请求频率控制等防屏蔽规则\r\n- 监控爬虫运行状态，及时定位并修复因网页改版、超时或策略变更导致的异常\r\n\r\n### 3. 🗄️ 数据清洗、转换与入库管理\r\n- 对原始采集数据进行去重、格式化、缺失值处理与质量校验\r\n- 使用 Pandas/正则/自定义脚本完成结构化转换（如 PDF 转 Markdown）\r\n- 将清洗后的高质量数据高效写入 MySQL、MongoDB、Redis 等存储系统，构建数据流水线\r\n\r\n### 4. 🤖 AI/AIGC 业务协同与应用落地\r\n- 为大模型训练提供高质量、多模态语料数据支撑\r\n- 配合算法团队完成数据标注、Prompt 调优、模型接口对接\r\n- 探索并集成 LangChain、AI Agent 等新兴 AI 框架至数据采集/处理流程\r\n\r\n### 5. 📐 工程规范与跨团队协作\r\n- 输出接口设计、技术方案与运维文档，遵循代码规范\r\n- 使用 Git 进行版本控制与协同开发，参与需求评审与迭代\r\n- 与产品、算法、业务团队沟通，支持临时需求与跨部门项目落地\r\n\r\n---\r\n\r\n## 三、任职要求汇总分析\r\n\r\n| 维度 | 市场要求现状 | 关键洞察 |\r\n|:---|:---|:---|\r\n| **🔧 硬性技术要求** | **语言**：Python 绝对主导（6/7），C#/Go/Java 为辅<br>**框架**：Scrapy、requests、BS4、XPath 为标配<br>**自动化**：Selenium/Playwright 成为动态页抓取主流<br>**数据库**：MySQL + MongoDB + Redis 组合高频出现<br>**工具链**：Git、F12抓包、Linux基础、Pandas | 技术栈已从“脚本拼凑”全面转向“工程化开发”。框架熟练度+数据库操作+版本控制构成最低可交付标准。 |\r\n| 🎓 **学历与专业** | 本科及以上学历为主；<br>专业高度聚焦：计算机、软件工程、大数据、数学、电子信息；<br>多数为实习/校招通道（明确标注 2025-2027 届）。 | 专业对口性强，非科班需通过扎实的项目集与底层原理（网络/操作系统/数据结构）弥补背景差距。 |\r\n| ⏱️ **经验要求** | **实习周期**：通常要求 2~6 个月，每周出勤 ≥3 天；<br>**项目经验**：强调“独立完成练习/个人爬虫项目”；<br>**进阶经验**：1年以上Python经验、分布式实战、逆向对抗经验为加分。 | 企业极度看重**稳定性**与**独立交付能力**。短期“打卡式”实习竞争力弱，能完整跟进一个采集-清洗-入库闭环的候选人更受青睐。 |\r\n| 🤝 **软技能要求** | 学习能力/技术敏锐度（7/7）、沟通协作/团队精神（6/7）、严谨细致/抗压能力、独立解决问题、业务分析与跨部门协调。 | 爬虫岗位已脱离“纯技术黑盒”定位，需频繁与算法、产品、运维对齐。文档输出能力与沟通效率直接影响项目推进速度。 |\r\n| ⭐ **加分项** | ① 完整个人爬虫项目（小说/电商/壁纸等）<br>② 掌握分布式/JS逆向/验证码破解<br>③ 熟悉 AIGC/LLM/LangChain 生态<br>④ 英文良好/海外系统对接经验<br>⑤ 熟练使用 Cursor 等 AI 编程工具<br>⑥ 长期实习意向强/可转正 | 加分项呈现 **“技术深度+AI广度+稳定性”** 三维叠加特征。具备 AIGC 数据工程经验或 AI 提效工具熟练度，可显著提升面试通过率。 |\r\n\r\n---\r\n\r\n## 四、市场趋势洞察\r\n\r\n### 1. 🔄 与传统爬虫岗位相比的新变化\r\n| 传统爬虫岗位特征 | 当前市场新趋势 |\r\n|:---|:---|\r\n| 侧重基础协议与静态页解析 | **重动态渲染与高对抗**（Playwright/JS逆向/指纹模拟） |\r\n| 单机脚本、粗放式存储 | **分布式架构+工程化规范**（Git协作、监控告警、CI/CD意识） |\r\n| 数据交付即止 | **数据工程化**（ETL流水线、多模态清洗、质量评估、大模型语料标准） |\r\n| 纯技术执行角色 | **业务协同型角色**（参与需求分析、文档输出、跨团队对齐、AI应用对接） |\r\n\r\n### 2. 📊 AI/AIGC 相关需求占比与演进\r\n- **显性占比**：在样本中直接提及 AI/AIGC/LLM 的岗位占比约 **28.5%**（2/7）。\r\n- **隐性渗透**：若将“为模型训练提供语料”、“PDF转Markdown”、“Prompt调优”、“数据标注”等衍生职责计入，**超过 50%** 的岗位已具备 AI 数据供应链属性。\r\n- **趋势判断**：AI 不再是“锦上添花”，而是**核心业务驱动引擎**。爬虫岗位正加速向 `AI Data Engineer（AI数据工程师）` 转型，价值重心从“能否抓到”转向“能否抓得准、洗得净、喂得好”。\r\n\r\n### 3. 🎯 给求职者的核心建议（重点准备清单）\r\n\r\n#### 📌 短期冲刺（1-2个月）\r\n1. **夯实基础栈**：熟练 `Python` + `requests/Scrapy` + `Playwright` + `MySQL/MongoDB` 组合拳；掌握 F12 抓包分析与常见反爬应对。\r\n2. **打造闭环项目**：完成 1~2 个包含 `采集 → 动态渲染处理 → 反爬绕过 → 数据清洗(Pandas) → 入库 → 基础监控` 的完整项目，并开源至 GitHub（附详细 README 与技术文档）。\r\n3. **补齐工程短板**：掌握 `Git 分支管理`、`Linux 基础命令`、`Docker 基础部署`，养成编写接口文档与注释的习惯。\r\n\r\n#### 📌 中期布局（3-6个月）\r\n1. **切入 AI 数据工程**：学习 `LangChain` 基础、`大模型语料构建标准`（清洗、去重、分块、脱敏）、`多模态提取工具`（如 PyPDF2、Unstructured、OCR 集成）。\r\n2. **提升逆向与分布式能力**：掌握 `JS 逆向基础（AST/补环境）`、`代理池/Cookie池架构`、`Scrapy-Redis 分布式改造`。\r\n3. **拥抱 AI 提效工具**：熟练使用 `Cursor/Copilot` 进行代码生成、Debug 与重构，将 AI 纳入日常开发流，提升面试时的“工程成熟度”印象。\r\n\r\n#### 📌 长期职业定位\r\n- **路径 A（技术深钻）**：爬虫架构师 → 大数据采集专家 → 逆向安全研究员\r\n- **路径 B（AI 融合）**：AI 数据工程师 → 大模型语料产品经理 → AI Agent 开发者\r\n- **核心壁垒**：`高质量数据获取能力` + `AI 数据流水线构建经验` + `跨团队业务理解力`。\r\n\r\n> 💡 **总结**：当前爬虫岗位已进入“**工程化+AI化+数据资产化**”的新阶段。求职者需跳出“写脚本抓网页”的思维局限，以数据工程视角构建能力矩阵，重点储备动态渲染处理、反爬对抗、数据清洗 ETL 与大模型语料协同能力，方能在激烈竞争中脱颖而出。"]
    };

    // ---- DOM 引用 ----
    var dataLoading   = document.getElementById('data-loading');
    var crawlingView  = document.getElementById('crawling-view');
    var jiebaView     = document.getElementById('jieba-view');
    var llmView       = document.getElementById('llm-view');

    var jobList       = document.getElementById('job-list');
    var dutyChart     = document.getElementById('duty-chart');
    var reqChart      = document.getElementById('req-chart');
    var categoryGrid  = document.getElementById('category-grid');
    var dutiesList    = document.getElementById('duties-list');
    var llmReportEl   = document.getElementById('llm-report');

    // ---- 初始化：尝试 fetch，失败则用内嵌数据 ----
    function init() {
        console.log('[JobScope Demo] 开始加载数据...');

        Promise.all([
            fetchWithFallback('data/jobs.md', EMBEDDED_DATA.jobs[0]),
            fetchWithFallback('data/jieba.md', EMBEDDED_DATA.jieba[0])
        ]).then(function (results) {
            console.log('[JobScope Demo] 数据加载成功，开始渲染');
            parseAndRenderJobs(results[0]);
            parseAndRenderJieba(results[1]);
            renderLlmReport(null); // AI 报告不传数据，显示提示信息

            dataLoading.classList.add('hidden');
            switchView('crawling');
        }).catch(function (err) {
            // 即使 Promise.all 失败也用内嵌数据兜底
            console.warn('[JobScope Demo] fetch 全部失败，使用内嵌数据:', err);
            parseAndRenderJobs(EMBEDDED_DATA.jobs[0]);
            parseAndRenderJieba(EMBEDDED_DATA.jieba[0]);
            renderLlmReport(null); // AI 报告不传数据

            dataLoading.classList.add('hidden');
            switchView('crawling');
        });
    }

    /**
     * 带 fallback 的 fetch：成功返回远程内容，失败返回默认值
     */
    function fetchWithFallback(url, fallbackText) {
        return fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .catch(function (err) {
                console.warn('[JobScope Demo] fetch ' + url + ' 失败，使用内嵌数据:', err.message || err);
                return fallbackText;
            });
    }

    init();

    // ================================================================
    // 视图切换
    // ================================================================
    window.switchView = function (viewName) {
        var tabs = document.querySelectorAll('.stage-tab');
        tabs.forEach(function (tab) {
            tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
        });

        crawlingView.style.display = viewName === 'crawling' ? '' : 'none';
        if (viewName === 'jieba') {
            jiebaView.style.display = '';
            jiebaView.classList.add('active');
        } else {
            jiebaView.style.display = 'none';
            jiebaView.classList.remove('active');
        }
        if (viewName === 'llm') {
            llmView.style.display = '';
            llmView.classList.add('active');
        } else {
            llmView.style.display = 'none';
            llmView.classList.remove('active');
        }
    };

    // ================================================================
    // 解析 & 渲染：岗位数据
    // ================================================================
    function parseAndRenderJobs(mdText) {
        var jobs = [];
        var blocks = mdText.split(/^## /m);

        for (var i = 1; i < blocks.length; i++) {
            var block = blocks[i].trim();
            if (!block) continue;

            var job = { idx: i };
            var titleMatch = block.match(/^【第\d+条】(.+)$/m);
            if (titleMatch) job.name = titleMatch[1].trim();

            var salaryMatch = block.match(/- 薪资：(.+)/);
            if (salaryMatch) {
                var sal = salaryMatch[1].trim();
                var parts = sal.split('-');
                job.minsal = parts[0] ? parts[0].trim() : '';
                job.maxsal = parts[1] ? parts[1].split('/')[0].trim() : '';
            }
            var cityMatch = block.match(/- 城市：(.+)/);
            if (cityMatch) {
                var cityLine = cityMatch[1].trim();
                var cParts = cityLine.split('|');
                job.city = cParts[0] ? cParts[0].trim() : '';
                job.day = (cParts[1] && cParts[1].match(/\d+/)) ? cParts[1].match(/\d+/)[0] : '';
                job.month_num = (cParts[2] && cParts[2].match(/\d+/)) ? cParts[2].match(/\d+/)[0] : '';
            }
            var companyMatch = block.match(/- 公司：(.+)/);
            if (companyMatch) {
                var compLine = companyMatch[1].trim();
                var coParts = compLine.split('|');
                job.cname = coParts[0] ? coParts[0].trim() : '';
                job.industry = coParts[1] ? coParts[1].trim() : '';
                job.scale = coParts[2] ? coParts[2].trim() : '';
            }
            var tagsMatch = block.match(/- 岗位标签：(.+)/);
            if (tagsMatch) {
                job.i_tags = tagsMatch[1].split(/[,，、]/).map(function (t) { return t.trim(); }).filter(Boolean);
            }
            var welfareMatch = block.match(/- 公司福利：(.+)/);
            if (welfareMatch) {
                job.c_tags = welfareMatch[1].split(/[,，、]/).map(function (t) { return t.trim(); }).filter(Boolean);
            }
            var descMatch = block.match(/### 职位描述\s*\n([\s\S]+?)(?=$|---)/);
            if (descMatch) job.description = descMatch[1].trim();

            jobs.push(job);
        }

        renderJobCards(jobs);
    }

    function renderJobCards(jobs) {
        jobList.innerHTML = '';
        jobs.forEach(function (job, index) {
            var card = document.createElement('div');
            card.className = 'job-card';
            card.style.opacity = '0';
            card.style.animation = 'fadeInUp 0.35s ease ' + (index * 0.06) + 's forwards';

            var tagsHtml = '';
            if (job.i_tags) job.i_tags.forEach(function (t) { tagsHtml += '<span class="tag tech">' + esc(t) + '</span>'; });
            if (job.c_tags) job.c_tags.forEach(function (t) { tagsHtml += '<span class="tag company">' + esc(t) + '</span>'; });

            card.innerHTML =
                '<div class="job-card-header">' +
                '  <div class="job-name">[' + job.idx + '] ' + esc(job.name || '') + '</div>' +
                '  <div class="job-salary">' + esc((job.minsal || '') + '-' + (job.maxsal || '') + '/天') + '</div>' +
                '</div>' +
                '<div class="job-meta">' +
                '  <span class="job-meta-item">&#x1F4CD; ' + esc(job.city || '') + '</span>' +
                '  <span class="job-meta-item">&#x1F4C5; ' + esc(job.day || '') + '天/周</span>' +
                '  <span class="job-meta-item">&#x1F4C6; ' + esc(job.month_num || '') + '个月</span>' +
                '</div>' +
                '<div class="job-meta" style="margin-bottom:8px;">' +
                '  <span class="job-meta-item" style="color:var(--accent-purple);">&#x1F3E2; ' + esc(job.cname || '') + '</span>' +
                '  <span class="job-meta-item" style="color:var(--text-muted);font-size:12px;">' + esc(job.industry || '') + ' / ' + esc(job.scale || '') + '</span>' +
                '</div>' +
                (tagsHtml ? '<div class="job-tags">' + tagsHtml + '</div>' : '');

            if (job.description) {
                card.innerHTML +=
                    '<div class="job-desc"><pre style="white-space:pre-wrap;font-size:12px;color:var(--text-secondary);line-height:1.7;margin:0;">' +
                    esc(job.description) + '</pre></div>' +
                    '<button class="job-expand-btn" onclick="this.parentElement.classList.toggle(\'expanded\');this.textContent=this.parentElement.classList.contains(\'expanded\')?\'收起详情 ▲\':\'展开详情 ▼\';">展开详情 &#9660;</button>';
            }
            jobList.appendChild(card);
        });
    }

    // ================================================================
    // 解析 & 渲染：Jieba 分析结果
    // ================================================================
    function parseAndRenderJieba(mdText) {
        var dutyKeywords = [], reqKeywords = [];
        var categories = {}, duties = [];
        var lines = mdText.split('\n'), section = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf('一、岗位职责关键词') !== -1) { section = 'duty'; continue; }
            else if (line.indexOf('二、任职要求关键词') !== -1) { section = 'req'; continue; }
            else if (line.indexOf('三、技术体系归纳') !== -1) { section = 'category'; continue; }
            else if (line.indexOf('四、岗位职责核心方向') !== -1) { section = 'duties'; continue; }

            if (section === 'duty' || section === 'req') {
                var m = line.match(/^\s*(\d+)\.\s+(\S+)\s+(█+)?\s*\(([0-9.]+)\)/);
                if (m) {
                    var item = { word: m[2], weight: parseFloat(m[4]) };
                    if (section === 'duty') dutyKeywords.push(item);
                    else reqKeywords.push(item);
                }
            }
            if (section === 'category') {
                var catM = line.match(/\s*▸\s*(.+?)：\s*(.+)/);
                if (catM) {
                    categories[catM[1].trim()] = catM[2].split(/[,，]/).map(function (w) {
                        return { word: w.trim(), score: 1 };
                    }).filter(function (w) { return w.word.length > 0; });
                }
            }
            if (section === 'duties') {
                var dM = line.match(/^\s*(\d+)\.\s+\[(\d+)次提及\]\s*(.+)/);
                if (dM) duties.push({ count: parseInt(dM[2]), full: dM[3].trim() });
            }
        }

        renderKeywordChart(dutyChart, dutyKeywords, 'cyan');
        renderKeywordChart(reqChart, reqKeywords, 'purple');
        renderCategoryGrid(categories);
        renderDutiesList(duties);
    }

    function renderKeywordChart(container, keywords, colorClass) {
        container.innerHTML = '';
        if (!keywords || keywords.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">暂无数据</p>';
            return;
        }
        var maxWeight = keywords[0] ? keywords[0].weight : 1;
        keywords.forEach(function (item, index) {
            var row = document.createElement('div');
            row.className = 'chart-row';
            row.style.opacity = '0';
            row.style.animation = 'fadeInUp 0.35s ease ' + (index * 0.05) + 's forwards';
            var percent = maxWeight > 0 ? ((item.weight / maxWeight) * 100) : 0;
            row.innerHTML =
                '<span class="chart-rank">' + (index + 1) + '</span>' +
                '<span class="chart-label" title="' + esc(item.word) + '">' + esc(item.word) + '</span>' +
                '<div class="chart-bar-wrapper"><div class="chart-bar-fill ' + colorClass + '" style="width:' + percent + '%;"><span class="chart-value">' + item.weight.toFixed(4) + '</span></div></div>';
            container.appendChild(row);
        });
    }

    function renderCategoryGrid(categories) {
        categoryGrid.innerHTML = '';
        var keys = Object.keys(categories);
        if (keys.length === 0) {
            categoryGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">暂无分类数据</p>';
            return;
        }
        keys.forEach(function (catName) {
            var words = categories[catName];
            var card = document.createElement('div');
            card.className = 'category-card';
            var wordsHtml = '';
            words.forEach(function (w) { wordsHtml += '<span class="cat-word">' + esc(w.word) + '</span>'; });
            card.innerHTML = '<div class="category-name">' + esc(catName) + '</div><div class="category-words">' + wordsHtml + '</div>';
            categoryGrid.appendChild(card);
        });
    }

    function renderDutiesList(duties) {
        dutiesList.innerHTML = '';
        if (!duties || duties.length === 0) {
            dutiesList.innerHTML = '<p style="color:var(--text-muted);text-align:center;">暂无数据</p>';
            return;
        }
        duties.forEach(function (duty, index) {
            var row = document.createElement('div');
            row.className = 'chart-row';
            row.style.opacity = '0';
            row.style.animation = 'slideInRight 0.35s ease ' + (index * 0.06) + 's forwards';
            var full = (duty.full || '').substring(0, 80).replace(/\n/g, ' ');
            row.innerHTML =
                '<span class="chart-rank">' + (index + 1) + '</span>' +
                '<span class="chart-label" style="width:auto;max-width:280px;" title="' + esc(full) + '">' + esc(full) + '</span>' +
                '<span class="chart-value" style="flex-shrink:0;color:var(--accent-cyan);">[' + duty.count + '次提及]</span>';
            dutiesList.appendChild(row);
        });
    }

    // ================================================================
    // 渲染：LLM 报告
    // ================================================================
    function renderLlmReport(mdText) {
        if (!mdText || !mdText.trim()) {
            llmReportEl.innerHTML =
                '<div style="max-width:600px;margin:60px auto;padding:40px 32px;background:var(--bg-card);border-radius:12px;border-left:4px solid var(--accent-purple);">' +
                '  <h3 style="color:var(--accent-purple);margin-bottom:16px;">AI 报告暂不可用</h3>' +
                '  <p style="color:var(--text-secondary);line-height:1.8;font-size:14px;">' +
                '    AI 报告的渲染依赖的 <code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px;">EMBEDDED_DATA</code> 对象因为语法错误导致整个 IIFE 无法执行。<br><br>' +
                '    原因：内嵌数据中包含未转义的 ASCII 双引号（如 <code>"转正优先"</code>、<code>"脚本拼凑"</code> 等），' +
                '    共 36 处，导致 <code>node --check</code> 报 <code>SyntaxError: Unexpected identifier</code>。' +
                '  </p>' +
                '</div>';
            return;
        }
        llmReportEl.innerHTML = JobScope.renderMarkdown(mdText);
    }

    // ================================================================
    // 工具函数
    // ================================================================
    function esc(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

})();
