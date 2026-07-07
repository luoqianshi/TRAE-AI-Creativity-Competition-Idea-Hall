export const civilizationsData = {
  civilizations: [
    {
      id: "china",
      name: "中国文明",
      name_en: "Chinese Civilization",
      era: "商代—北宋",
      tagline: "连续性与制度创新的东方范本",
      description: "从甲骨青铜到活字印刷，中国文明以罕见的连续性积累了独特的制度、技术与文化范式。其演化路径强调大一统政治、知识传播网络的效率，以及对书写技术的高度依赖。",
      color: "#B7410E",
      thumbnail: "",
      stats: { total_nodes: 9, time_span: "前1300年 — 1040年", key_branches: ["政治制度", "技术发明", "文化思想"], world_connections: 2 },
      nodes: [
        { id: "oracle_bronze", title: "甲骨文与青铜文明", time_label: "前1300年", year: -1300, category: "culture", subcategory: "文字与礼器", summary: "商代晚期形成系统的文字记录与青铜礼器铸造技术，奠定东亚文明底色。", detail: "甲骨文是目前发现的中国最早成熟文字体系，主要用于王室占卜记录；同期的青铜铸造技术达到了极高水准，礼器成为政治权力与宗教仪式的核心象征。文字与金属技术的结合，使大规模行政管理和知识代际传承成为可能。", impact_tags: ["文化认同", "社会分层"], related_nodes: ["zhou_ritual"], prerequisites: [], unlocks: ["zhou_ritual"], world_event_links: ["writing_revolution"], layout: { layer: 0, lane: "main", role: "root" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Oracle_bone_script" }] },
        { id: "zhou_ritual", title: "周礼与宗法制度", time_label: "前1046年", year: -1046, category: "politics", subcategory: "宗法分封", summary: "以血缘为纽带的宗法分封制度确立，构建了中国古代社会的伦理与政治框架。", detail: "周朝以血缘关系为基础建立分封体系，配合礼乐制度规范社会秩序。这种将家族伦理扩展为国家治理逻辑的范式，深刻影响了此后三千年中国政治结构，形成‘家国同构’的独特传统。", impact_tags: ["制度整合", "社会分层"], related_nodes: ["oracle_bronze", "hundred_schools", "iron_agriculture", "qin_unification"], prerequisites: ["oracle_bronze"], unlocks: ["hundred_schools", "iron_agriculture"], world_event_links: [], layout: { layer: 1, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Fengjian" }] },
        { id: "hundred_schools", title: "百家争鸣", time_label: "前500年", year: -500, category: "culture", subcategory: "思想运动", summary: "春秋战国时期思想爆发，儒、道、法等学派奠定东亚哲学与政治思想基础。", detail: "周王室衰微后，列国竞争催生了空前的思想自由。儒家强调伦理秩序，法家专注制度效率，道家追问自然本源。这些思想不仅塑造了中国的文化认同，也为后来的统一帝国提供了不同的治理工具箱。", impact_tags: ["文化认同", "知识传播"], related_nodes: ["zhou_ritual", "qin_unification", "imperial_exam"], prerequisites: ["zhou_ritual"], unlocks: ["qin_unification"], world_event_links: [], layout: { layer: 2, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Hundred_Schools_of_Thought" }] },
        { id: "iron_agriculture", title: "铁器农具普及", time_label: "前500年", year: -500, category: "technology", subcategory: "农业技术", summary: "铁制农具与牛耕推广，极大提升农业产出，支撑人口增长与城邦发展。", detail: "春秋战国时期，冶铁技术从青铜冶炼中分化出来并快速成熟。铁犁、铁锄的普及使开垦效率成倍提升，支撑了更大规模的城市和更复杂的社会分工，为后来的统一帝国奠定了物质基础。", impact_tags: ["技术扩散", "城市化"], related_nodes: ["zhou_ritual", "qin_unification"], prerequisites: ["zhou_ritual"], unlocks: [], world_event_links: ["iron_age_diffusion"], layout: { layer: 2, lane: "branch_1", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Iron_Age" }] },
        { id: "qin_unification", title: "秦统一与中央集权", time_label: "前221年", year: -221, category: "politics", subcategory: "大一统制度", summary: "结束战国分裂，建立郡县制、统一文字与度量衡，开创大一统政治范式。", detail: "秦始皇以法家思想为指导，废除分封、推行郡县，统一文字、货币、度量衡和车轨标准。这套高度标准化的中央集权模式，成为此后中国两千年政治演化的底层操作系统。", impact_tags: ["制度整合", "行政效率提升"], related_nodes: ["hundred_schools", "paper_invention", "silk_road", "imperial_exam"], prerequisites: ["hundred_schools"], unlocks: ["paper_invention", "silk_road"], world_event_links: [], layout: { layer: 3, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Qin_dynasty" }] },
        { id: "paper_invention", title: "造纸术", time_label: "105年", year: 105, category: "technology", subcategory: "书写技术", summary: "蔡伦改进造纸工艺，大幅降低知识记录与传播成本，推动文明积累速度。", detail: "东汉蔡伦系统改进造纸术，以树皮、麻头、破布为原料，造出质地优良、成本低廉的纸张。相比竹简和丝绸，纸张使信息复制成本下降了两个数量级，为知识的大众化传播和官僚行政效率提供了物质基础。", impact_tags: ["知识传播", "技术扩散"], related_nodes: ["qin_unification", "movable_type", "silk_road"], prerequisites: ["qin_unification"], unlocks: ["movable_type"], world_event_links: [], layout: { layer: 4, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Paper" }] },
        { id: "silk_road", title: "丝绸之路", time_label: "前114年", year: -114, category: "economy", subcategory: "跨大陆贸易", summary: "张骞通西域后形成的跨大陆贸易通道，连接中国与中亚、地中海世界。", detail: "汉武帝时期张骞两次出使西域，打通了从长安经中亚至地中海东岸的贸易通道。丝绸、茶叶、瓷器西传，葡萄、胡桃、佛教东渐。这条通道不仅是商品网络，更是技术、宗教与疾病传播的走廊。", impact_tags: ["贸易网络", "文化认同"], related_nodes: ["qin_unification", "paper_invention"], prerequisites: ["qin_unification"], unlocks: [], world_event_links: [], layout: { layer: 4, lane: "branch_1", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Silk_Road" }] },
        { id: "movable_type", title: "活字印刷", time_label: "1040年", year: 1040, category: "technology", subcategory: "信息复制", summary: "毕昇发明泥活字印刷，进一步提升信息复制效率，为知识大众化奠基。", detail: "北宋毕昇发明胶泥活字印刷术，单字可重复使用，排版灵活。相比雕版，活字大幅降低了多品种、小批量文本的复制成本。这一技术后来西传，与造纸术共同构成欧洲知识爆炸的关键基础设施。", impact_tags: ["知识传播", "技术扩散"], related_nodes: ["paper_invention"], prerequisites: ["paper_invention"], unlocks: [], world_event_links: [], layout: { layer: 5, lane: "main", role: "leaf" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Movable_type" }] },
        { id: "imperial_exam", title: "科举制度", time_label: "605年", year: 605, category: "politics", subcategory: "选官制度", summary: "以考试选拔官员的制度化，打破门阀垄断，塑造了千年文官治理体系。", detail: "隋朝开创、唐朝完善的科举制度，使社会流动不再完全依赖血统。通过标准化考试选拔文官，既保证了行政体系的知识水平，也将儒家经典内化为全社会共同的文化契约。这一制度持续运作至1905年。", impact_tags: ["制度整合", "行政效率提升"], related_nodes: ["qin_unification", "hundred_schools"], prerequisites: ["qin_unification"], unlocks: [], world_event_links: [], layout: { layer: 5, lane: "branch_2", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Imperial_examination" }] }
      ]
    },
    {
      id: "ancient_greece",
      name: "古希腊文明",
      name_en: "Ancient Greek Civilization",
      era: "古风—希腊化",
      tagline: "城邦竞争与理性精神的西方源头",
      description: "从爱琴海城邦到亚历山大帝国，古希腊在政治实验、哲学追问与科学方法上开辟了独特的传统。其演化由竞争驱动，以理性为工具，最终通过征服与融合将成果播撒至整个地中海世界。",
      color: "#1E6091",
      thumbnail: "",
      stats: { total_nodes: 8, time_span: "前800年 — 前283年", key_branches: ["政治制度", "科学技术", "文化艺术"], world_connections: 3 },
      nodes: [
        { id: "city_states", title: "城邦制度兴起", time_label: "前800年", year: -800, category: "politics", subcategory: "城邦政治", summary: "希腊半岛形成众多独立城邦，为独特政治实验与文化竞争提供土壤。", detail: "多山地形与海洋环境使希腊难以形成统一帝国，反而催生了数百个独立城邦。每个城邦都是完整的政治、经济与军事单元，彼此竞争又共享语言与宗教。这种‘分而不裂’的格局，为政治制度多样化实验提供了空间。", impact_tags: ["制度整合", "文化认同"], related_nodes: ["homer_epics", "athenian_democracy"], prerequisites: [], unlocks: ["homer_epics", "athenian_democracy"], world_event_links: ["iron_age_diffusion"], layout: { layer: 0, lane: "main", role: "root" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Polis" }] },
        { id: "homer_epics", title: "荷马史诗与神话体系", time_label: "前750年", year: -750, category: "culture", subcategory: "史诗文学", summary: "《伊利亚特》《奥德赛》确立共同文化记忆，构建希腊民族认同基础。", detail: "虽然荷马其人是否真实存在仍有争议，但两部史诗在希腊世界广泛流传，为分散的城邦提供了共同的神谱、价值观与英雄范本。奥林匹克运动会等泛希腊仪式也依托这一共享神话体系得以维系。", impact_tags: ["文化认同", "知识传播"], related_nodes: ["city_states", "athenian_democracy"], prerequisites: ["city_states"], unlocks: ["athenian_democracy"], world_event_links: [], layout: { layer: 1, lane: "branch_1", role: "branch" }, confidence: "medium", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Homer" }] },
        { id: "athenian_democracy", title: "雅典民主", time_label: "前508年", year: -508, category: "politics", subcategory: "公民民主", summary: "公民大会与抽签选举制度的确立，成为西方民主政治的思想源头。", detail: "克里斯提尼改革后，雅典建立了以公民大会为核心的直接民主制度。虽然仅成年男性公民享有政治权利，但抽签选举、轮番为治的原则打破了贵族世袭垄断。这一制度实验为后世政治哲学提供了最持久的参照系之一。", impact_tags: ["制度整合", "行政效率提升"], related_nodes: ["city_states", "parthenon", "alexander_conquest", "hippocratic_medicine"], prerequisites: ["city_states"], unlocks: ["parthenon", "hippocratic_medicine"], world_event_links: [], layout: { layer: 1, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Athenian_democracy" }] },
        { id: "parthenon", title: "帕特农与古典建筑", time_label: "前447年", year: -447, category: "culture", subcategory: "古典艺术", summary: "雅典卫城建筑群代表古典希腊艺术巅峰，影响西方建筑两千年。", detail: "帕特农神庙以精确的黄金比例、视觉矫正技术和叙事性浮雕，将建筑、雕塑与政治宣传融为一体。其柱式结构成为此后西方公共建筑的原型，从罗马万神殿到美国国会大厦，皆可追溯至此。", impact_tags: ["文化认同", "城市化"], related_nodes: ["athenian_democracy", "library_alexandria"], prerequisites: ["athenian_democracy"], unlocks: [], world_event_links: [], layout: { layer: 2, lane: "branch_1", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Parthenon" }] },
        { id: "hippocratic_medicine", title: "希波克拉底医学", time_label: "前400年", year: -400, category: "technology", subcategory: "医学科学", summary: "将医学从神谕中分离，建立观察与理性诊断的早期科学方法论。", detail: "希波克拉底学派提出疾病源于体液失衡而非神罚，强调临床观察、病例记录与经验总结。医师誓言确立了医疗伦理的基本底线。这种将自然现象去神秘化、以理性解释因果的思维方式，是希腊科学精神在医学领域的最早体现。", impact_tags: ["科学方法论", "知识传播"], related_nodes: ["athenian_democracy", "euclid_elements"], prerequisites: ["athenian_democracy"], unlocks: ["euclid_elements"], world_event_links: [], layout: { layer: 2, lane: "branch_2", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Hippocrates" }] },
        { id: "alexander_conquest", title: "亚历山大东征", time_label: "前334年", year: -334, category: "military", subcategory: "军事扩张", summary: "横跨欧亚非的军事远征，开启希腊化时代，促进东西方知识大融合。", detail: "马其顿的亚历山大以卓越的战略与后勤能力，十年间征服波斯、埃及直抵印度河流域。虽然帝国在他死后迅速分裂，但希腊语、城市建制与希腊艺术随军事足迹扩散，开启了持续近三百年的希腊化时代。", impact_tags: ["军事优势", "文化认同"], related_nodes: ["athenian_democracy", "library_alexandria", "euclid_elements"], prerequisites: ["athenian_democracy"], unlocks: ["library_alexandria", "euclid_elements"], world_event_links: ["alexander_conquest_event", "hellenistic_period"], layout: { layer: 3, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Alexander_the_Great" }] },
        { id: "library_alexandria", title: "亚历山大图书馆", time_label: "前283年", year: -283, category: "culture", subcategory: "知识机构", summary: "古代世界最大知识中心，系统收藏与翻译各地文献，推动学术系统化。", detail: "托勒密一世在埃及亚历山大里亚建立的图书馆，目标是‘收藏全世界书籍’。馆内学者从事文本校勘、翻译与原创研究，欧几里得、阿基米德都曾在此工作。它代表了前现代世界对知识系统化的最高追求。", impact_tags: ["知识传播", "文化认同"], related_nodes: ["alexander_conquest", "euclid_elements"], prerequisites: ["alexander_conquest"], unlocks: [], world_event_links: ["hellenistic_period"], layout: { layer: 4, lane: "main", role: "leaf" }, confidence: "medium", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Library_of_Alexandria" }] },
        { id: "euclid_elements", title: "欧几里得几何原本", time_label: "前300年", year: -300, category: "technology", subcategory: "数学公理化", summary: "公理化方法的奠基之作，定义了西方数学与逻辑推理的基本范式。", detail: "《几何原本》从五条公设出发，以严密的逻辑演绎构建起整个平面几何体系。这种‘从不证自明的前提出发，通过逻辑推导获得确定知识’的方法论，成为西方科学传统的核心基因，影响远超数学本身。", impact_tags: ["科学方法论", "知识传播"], related_nodes: ["alexander_conquest", "library_alexandria", "hippocratic_medicine"], prerequisites: ["alexander_conquest", "hippocratic_medicine"], unlocks: [], world_event_links: ["hellenistic_period"], layout: { layer: 4, lane: "branch_2", role: "leaf" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Euclid%27s_Elements" }] }
      ]
    },
    {
      id: "ancient_egypt",
      name: "古埃及文明",
      name_en: "Ancient Egyptian Civilization",
      era: "早王朝—托勒密",
      tagline: "尼罗河畔的永恒秩序",
      description: "依托尼罗河的定期泛滥，古埃及建立了人类最早的大型集权国家之一。其演化围绕‘永恒’展开——通过文字记录、巨石建筑和复杂的来世信仰，试图在时间中固定秩序与身份。",
      color: "#C9A227",
      thumbnail: "",
      stats: { total_nodes: 8, time_span: "前3200年 — 前196年", key_branches: ["政治制度", "文化艺术", "科学技术"], world_connections: 3 },
      nodes: [
        { id: "hieroglyphics", title: "象形文字", time_label: "前3200年", year: -3200, category: "culture", subcategory: "书写系统", summary: "世界上最早的文字系统之一，为行政、宗教与历史记录提供工具。", detail: "古埃及象形文字融合了表意与表音符号，可书写在神庙墙壁、石碑和纸莎草纸上。它不仅是沟通工具，更是神圣知识的载体——书写本身被认为具有魔法力量，掌握文字的书吏属于社会上层精英。", impact_tags: ["文化认同", "知识传播"], related_nodes: ["pharaoh_divine", "papyrus"], prerequisites: [], unlocks: ["pharaoh_divine", "papyrus"], world_event_links: ["writing_revolution"], layout: { layer: 0, lane: "main", role: "root" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Egyptian_hieroglyphs" }] },
        { id: "pharaoh_divine", title: "法老神权专制", time_label: "前3100年", year: -3100, category: "politics", subcategory: "神王统治", summary: "国王即神的代理人，建立高度集权的行政与宗教合一统治体系。", detail: "美尼斯统一上下埃及后，法老被视为人间之神，是维持宇宙秩序的关键。以宰相为首的庞大官僚体系管理税收、灌溉和工程。这种将政治权力与宗教合法性完全绑定的模式，使古埃及保持了超长期的政治稳定。", impact_tags: ["制度整合", "社会分层"], related_nodes: ["hieroglyphics", "pyramids", "mummification"], prerequisites: ["hieroglyphics"], unlocks: ["pyramids", "mummification"], world_event_links: [], layout: { layer: 1, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Pharaoh" }] },
        { id: "papyrus", title: "纸莎草纸", time_label: "前3000年", year: -3000, category: "technology", subcategory: "书写材料", summary: "轻便书写材料的发明，使知识记录与行政效率远超泥板时代。", detail: "将纸莎草茎切片压合而成的书写介质，轻便、可卷曲、易于携带。相比美索不达米亚的泥板，纸莎草纸使长篇文本的创作、存储和传输成本大幅降低，支撑了古埃及复杂的行政管理和学术活动。", impact_tags: ["知识传播", "行政效率提升"], related_nodes: ["hieroglyphics", "rosetta_stone"], prerequisites: ["hieroglyphics"], unlocks: ["rosetta_stone"], world_event_links: ["writing_revolution"], layout: { layer: 1, lane: "branch_1", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Papyrus" }] },
        { id: "pyramids", title: "金字塔建造", time_label: "前2560年", year: -2560, category: "culture", subcategory: "巨型建筑", summary: "吉萨大金字塔代表古埃及工程、数学与组织能力的巅峰成就。", detail: "胡夫金字塔在约前2560年建成，高146米，由230万块巨石精确堆叠。它不仅需要先进的数学计算和工程组织，更反映了法老对‘永恒’的终极追求——巨石建筑被视为通向永生的物质载体。", impact_tags: ["城市化", "技术扩散"], related_nodes: ["pharaoh_divine", "mummification", "solar_calendar"], prerequisites: ["pharaoh_divine"], unlocks: ["solar_calendar"], world_event_links: [], layout: { layer: 2, lane: "main", role: "milestone" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza" }] },
        { id: "mummification", title: "木乃伊与来世信仰", time_label: "前2600年", year: -2600, category: "culture", subcategory: "丧葬宗教", summary: "复杂的防腐技术与来世观念，推动医学、化学与宗教艺术发展。", detail: "古埃及人相信灵魂需要 recognizable 的身体作为来世居所。木乃伊化过程涉及复杂的化学处理、解剖知识和仪式程序。围绕来世的信仰体系，催生了《亡灵书》、葬礼艺术和神庙经济，深刻影响了社会资源配置。", impact_tags: ["文化认同", "知识传播"], related_nodes: ["pharaoh_divine", "pyramids"], prerequisites: ["pharaoh_divine"], unlocks: [], world_event_links: [], layout: { layer: 2, lane: "branch_2", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mummy" }] },
        { id: "solar_calendar", title: "太阳历", time_label: "前3000年", year: -3000, category: "technology", subcategory: "天文历法", summary: "365天历法的早期形式，为农业、宗教节日与尼罗河泛滥预测提供依据。", detail: "古埃及人通过观测天狼星偕日升与尼罗河泛滥周期，确立了以365天为一年的太阳历。他们将一年分为三季（泛滥季、播种季、收获季），每月30天，年末附加5天宗教节日。这一历法后来经儒略历传承，成为现代公历的远古前身。", impact_tags: ["技术扩散", "知识传播"], related_nodes: ["pyramids", "papyrus"], prerequisites: ["pyramids"], unlocks: [], world_event_links: [], layout: { layer: 3, lane: "branch_1", role: "branch" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Egyptian_calendar" }] },
        { id: "rosetta_stone", title: "罗塞塔石碑", time_label: "前196年", year: -196, category: "culture", subcategory: "文化遗产", summary: "三语铭文成为破译象形文字的关键，让失落文明重新被世界读懂。", detail: "托勒密五世诏令以象形文字、世俗体与希腊语三种文字刻写。1799年发现后，法国学者商博良借助希腊语对照，于1822年成功破译象形文字。这块石碑不仅是政治文件，更是一座跨越两千年的文明解码器。", impact_tags: ["文化认同", "知识传播"], related_nodes: ["papyrus", "hieroglyphics"], prerequisites: ["papyrus"], unlocks: [], world_event_links: ["hellenistic_period"], layout: { layer: 4, lane: "branch_1", role: "leaf" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Rosetta_Stone" }] },
        { id: "ptolemy_library", title: "亚历山大图书馆(埃及传承)", time_label: "前283年", year: -283, category: "culture", subcategory: "知识融合", summary: "托勒密王朝在埃及建立的知识殿堂，融合埃及、希腊与东方学术传统。", detail: "亚历山大图书馆不仅是希腊化世界的知识中心，也系统收藏并翻译了埃及祭司文献。它标志着两种古老文明传统——埃及的宗教智慧与希腊的理性方法——在制度层面的正式交汇，是文明互鉴的早期典范。", impact_tags: ["知识传播", "文化认同"], related_nodes: ["pyramids", "rosetta_stone"], prerequisites: ["pyramids"], unlocks: [], world_event_links: ["hellenistic_period", "alexander_conquest_event"], layout: { layer: 4, lane: "main", role: "leaf" }, confidence: "high", sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Library_of_Alexandria" }] }
      ]
    }
  ]
};

export const worldEventsData = {
  world_events: [
    { id: "writing_revolution", title: "书写技术革命", time_label: "前3200年 — 前3000年", year_start: -3200, year_end: -3000, description: "从尼罗河到黄河，独立发明的书写系统标志着人类从口头社会迈向记录社会。文字使法律、税收、历史和宗教教义得以跨代积累和远距离传播。", impact_summary: "书写技术使行政复杂度、知识传承密度和文化认同强度同时跃升，是文明诞生的基础设施。", affected_civilizations: ["ancient_egypt", "china"], linked_nodes: { ancient_egypt: ["hieroglyphics", "papyrus"], china: ["oracle_bronze"] }, type: "technology_diffusion" },
    { id: "iron_age_diffusion", title: "铁器时代传播", time_label: "前1200年 — 前500年", year_start: -1200, year_end: -500, description: "冶铁技术从安纳托利亚和近东向外扩散，铁制工具和武器逐渐取代青铜。铁器的普及降低了金属成本，使农业精耕细作和军事平民化成为可能。", impact_summary: "铁器使工具和武器的生产成本大幅下降，推动了农业革命、军事民主化和社会结构的重组。", affected_civilizations: ["china", "ancient_greece"], linked_nodes: { china: ["iron_agriculture"], ancient_greece: ["city_states"] }, type: "technology_diffusion" },
    { id: "alexander_conquest_event", title: "亚历山大东征", time_label: "前334年 — 前323年", year_start: -334, year_end: -323, description: "马其顿国王亚历山大三世率领联军东征，摧毁波斯帝国，征服埃及，兵锋直抵印度河流域。这场征服不仅是军事事件，更引发了希腊文化与东方文明的大规模碰撞与融合。", impact_summary: "军事征服打破了文明间的地理隔离，开启了希腊化时代，使希腊语言、艺术和城市建制覆盖从地中海到中亚的广阔区域。", affected_civilizations: ["ancient_greece", "ancient_egypt"], linked_nodes: { ancient_greece: ["alexander_conquest"], ancient_egypt: ["ptolemy_library"] }, type: "war" },
    { id: "hellenistic_period", title: "希腊化时代", time_label: "前323年 — 前31年", year_start: -323, year_end: -31, description: "亚历山大帝国分裂后，托勒密、塞琉古和马其顿等希腊化王国统治了东地中海与近东地区。希腊语成为通用语，希腊城市遍布欧亚非，埃及、巴比伦与希腊的学术传统在亚历山大里亚等交汇点深度融合。", impact_summary: "希腊化时代创造了第一个跨文明的‘知识公共空间’，希腊理性方法与东方积累性知识在此结合，催生了系统化的数学、天文学和地理学。", affected_civilizations: ["ancient_greece", "ancient_egypt"], linked_nodes: { ancient_greece: ["alexander_conquest", "library_alexandria", "euclid_elements"], ancient_egypt: ["ptolemy_library", "rosetta_stone"] }, type: "cultural_exchange" }
  ]
};

export const categoryColors = {
  politics: "#8B4513",
  technology: "#2E5984",
  culture: "#7B5EA7",
  economy: "#2E7D32",
  military: "#B71C1C"
};

export const categoryIcons = {
  politics: "landmark",
  technology: "flask-conical",
  culture: "scroll-text",
  economy: "trending-up",
  military: "swords"
};

export const comparisonDimensions = [
  { id: "technology", name: "技术演进", filter: (n) => n.category === "technology" },
  { id: "politics", name: "制度变迁", filter: (n) => n.category === "politics" },
  { id: "culture", name: "文化传播", filter: (n) => n.category === "culture" },
  { id: "economy", name: "经济网络", filter: (n) => n.category === "economy" }
];
