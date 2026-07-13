// ============================================================
// 智盈A股 - 数据中心
// 数据日期: 2026-07-11 (周五盘后)
// ============================================================

// --- K线数据生成器 ---
function genKline(basePrice, days, volatility, trend) {
  var data = [], price = basePrice;
  var startDate = new Date('2026-04-14');
  for (var i = 0; i < days; i++) {
    var d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    var open = price;
    var change = (Math.random() - 0.5 + trend) * volatility * price;
    var close = open + change;
    var high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
    var low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
    var vol = Math.floor(Math.random() * 80000000 + 20000000);
    var dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    data.push({ date: dateStr, open: +open.toFixed(2), close: +close.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), volume: vol });
    price = close;
  }
  return data;
}

// --- 宏观市场数据 ---
var MarketData = {
  date: "2026-07-11",
  weekday: "周五",
  indices: [
    { name: "上证指数", code: "000001", value: 3998.12, change: -38.25, changePct: -0.95, volume: 3856, amount: 4125 },
    { name: "深证成指", code: "399001", value: 14985.23, change: -200.35, changePct: -1.32, volume: 4521, amount: 5238 },
    { name: "创业板指", code: "399006", value: 3965.45, change: -63.78, changePct: -1.58, volume: 1856, amount: 2103 },
    { name: "科创50", code: "000688", value: 1085.67, change: -15.32, changePct: -1.39, volume: 562, amount: 825 }
  ],
  sentiment: {
    score: 42,
    label: "偏弱",
    description: "市场情绪指标降至42，处于偏弱区间。周五尾盘跳水打击做多信心，但7月9日放量反弹证明底部有支撑。",
    fearGreed: 35,
    turnover: 11363,
    northBound: 28.5,
    limitUp: 32,
    limitDown: 18
  },
  macro: {
    fed: {
      title: "美联储政策",
      status: "维持利率概率大",
      detail: "7月28-29日议息会议预计维持联邦基金利率3.50%-3.75%不变，降息概率不足10%。7月10日发布半年度货币政策报告，指出春季通胀再度抬升，重申维持价格稳定承诺。主席沃什表态偏鹰，抗通胀仍是主线。",
      impact: "中性偏空",
      impactLevel: "negative",
      keyPoints: ["利率维持3.50%-3.75%", "通胀春季抬升", "沃什表态偏鹰", "9月降息预期升温"]
    },
    middleEast: {
      title: "中东地缘",
      status: "冲突缓和但暗流涌动",
      detail: "布伦特原油从年初120美元回落至78美元附近，霍尔木兹海峡航运恢复正常，地缘冲突溢价基本出清。但7月8日美伊局势再度紧张，油价单日大涨5.2%，地缘风险仍未完全消除。",
      impact: "中性",
      impactLevel: "neutral",
      keyPoints: ["布伦特原油~$78", "航运恢复正常", "美伊仍有摩擦", "油价三连跌后反弹"]
    },
    chinaUS: {
      title: "中美关系",
      status: "结构性减压，科技竞争持续",
      detail: "中美经贸出现积极信号，中方国企采购1200万吨美国大豆，关税实施结构性减免。但7月10日商务部禁止氦气出口，凸显芯片领域博弈加剧。总体呈'经贸缓和、科技竞争'格局。",
      impact: "结构性利好",
      impactLevel: "positive",
      keyPoints: ["中方采购1200万吨大豆", "关税结构性减免", "氦气出口禁令", "半导体自主可控加速"]
    }
  },
  sectorFlow: [
    { name: "半导体", inflow: 94.99, color: "red" },
    { name: "计算机", inflow: 76.45, color: "red" },
    { name: "通信", inflow: 42.71, color: "red" },
    { name: "石油石化", inflow: 2.19, color: "red" },
    { name: "煤炭", inflow: 1.45, color: "red" },
    { name: "钢铁", inflow: 0.35, color: "red" },
    { name: "医药生物", inflow: -15.32, color: "green" },
    { name: "食品饮料", inflow: -28.67, color: "green" },
    { name: "房地产", inflow: -45.21, color: "green" },
    { name: "银行", inflow: -52.18, color: "green" },
    { name: "非银金融", inflow: -68.45, color: "green" },
    { name: "电力设备", inflow: -85.33, color: "green" }
  ],
  hotConcepts: [
    { name: "HBM存储", change: 5.82, stocks: 48 },
    { name: "先进封装", change: 4.67, stocks: 35 },
    { name: "AI算力", change: 4.12, stocks: 62 },
    { name: "光模块", change: 3.85, stocks: 28 },
    { name: "国产芯片", change: 3.21, stocks: 85 },
    { name: "脑机接口", change: 2.98, stocks: 22 },
    { name: "卫星互联网", change: 2.45, stocks: 31 },
    { name: "固态电池", change: 1.87, stocks: 19 },
    { name: "低空经济", change: 1.52, stocks: 25 },
    { name: "可控核聚变", change: -0.85, stocks: 12 }
  ],
  marketBreadth: {
    up: 1825,
    down: 2856,
    flat: 312,
    strongUp: 32,
    strongDown: 18
  }
};

// --- 短线策略股票 (10只) ---
// 选股逻辑: 量比>2 + MACD金叉 + 暗盘流入 + 可能拉升信号
var ShortTermStocks = [
  {
    rank: 1, code: "002185", name: "华天科技", sector: "半导体封测",
    price: 18.52, changePct: 5.23, volumeRatio: 3.2,
    macdSignal: "金叉确认", darkPoolInflow: 15.76, mainForceInflow: 93.11,
    pullUpSignal: "强烈", chipConcentration: 68, turnover: 8.5, pe: 32.5, score: 88,
    signals: ["量比放大3.2倍", "MACD零轴上方金叉", "主力净流入15.76亿", "暗盘资金持续流入", "筹码单峰密集待突破"],
    kline: genKline(15.5, 60, 0.035, 0.008)
  },
  {
    rank: 2, code: "300502", name: "新易盛", sector: "光模块",
    price: 62.38, changePct: 4.87, volumeRatio: 2.8,
    macdSignal: "金叉确认", darkPoolInflow: 12.30, mainForceInflow: 115.20,
    pullUpSignal: "较强", chipConcentration: 72, turnover: 6.2, pe: 45.8, score: 86,
    signals: ["量比放大2.8倍", "MACD水下金叉", "主力净流入12.3亿", "800G光模块放量", "筹码峰上移"],
    kline: genKline(55, 60, 0.04, 0.006)
  },
  {
    rank: 3, code: "688012", name: "中微公司", sector: "半导体设备",
    price: 185.60, changePct: 3.92, volumeRatio: 2.5,
    macdSignal: "即将金叉", darkPoolInflow: 8.50, mainForceInflow: 45.30,
    pullUpSignal: "较强", chipConcentration: 65, turnover: 3.8, pe: 68.2, score: 84,
    signals: ["量比放大2.5倍", "MACD即将金叉", "主力净流入8.5亿", "刻蚀设备订单放量", "筹码趋于集中"],
    kline: genKline(170, 60, 0.03, 0.005)
  },
  {
    rank: 4, code: "002371", name: "北方华创", sector: "半导体设备",
    price: 312.45, changePct: 3.56, volumeRatio: 2.1,
    macdSignal: "金叉确认", darkPoolInflow: 6.80, mainForceInflow: 38.50,
    pullUpSignal: "中等", chipConcentration: 70, turnover: 2.5, pe: 55.3, score: 83,
    signals: ["量比放大2.1倍", "MACD金叉确认", "主力净流入6.8亿", "薄膜设备国产替代", "筹码双峰合并中"],
    kline: genKline(290, 60, 0.028, 0.004)
  },
  {
    rank: 5, code: "688981", name: "中芯国际", sector: "晶圆代工",
    price: 98.65, changePct: 2.89, volumeRatio: 2.3,
    macdSignal: "金叉确认", darkPoolInflow: 5.20, mainForceInflow: 32.10,
    pullUpSignal: "中等", chipConcentration: 75, turnover: 4.2, pe: 42.1, score: 82,
    signals: ["量比放大2.3倍", "MACD金叉确认", "主力净流入5.2亿", "14nm产能扩产", "筹码高度密集"],
    kline: genKline(92, 60, 0.025, 0.003)
  },
  {
    rank: 6, code: "002384", name: "东山精密", sector: "PCB/封装",
    price: 35.68, changePct: 2.45, volumeRatio: 2.7,
    macdSignal: "即将金叉", darkPoolInflow: 4.30, mainForceInflow: 28.50,
    pullUpSignal: "较强", chipConcentration: 63, turnover: 5.5, pe: 28.6, score: 80,
    signals: ["量比放大2.7倍", "MACD即将金叉", "主力净流入4.3亿", "AI服务器PCB放量", "底部放量突破"],
    kline: genKline(32, 60, 0.032, 0.005)
  },
  {
    rank: 7, code: "603501", name: "韦尔股份", sector: "芯片设计",
    price: 128.50, changePct: 2.12, volumeRatio: 2.0,
    macdSignal: "金叉确认", darkPoolInflow: 3.80, mainForceInflow: 22.80,
    pullUpSignal: "中等", chipConcentration: 67, turnover: 3.2, pe: 38.5, score: 79,
    signals: ["量比放大2.0倍", "MACD金叉确认", "主力净流入3.8亿", "CIS手机需求回暖", "筹码单峰密集"],
    kline: genKline(120, 60, 0.028, 0.003)
  },
  {
    rank: 8, code: "603986", name: "兆易创新", sector: "存储芯片",
    price: 95.30, changePct: 1.89, volumeRatio: 2.4,
    macdSignal: "金叉确认", darkPoolInflow: 3.20, mainForceInflow: 18.60,
    pullUpSignal: "中等", chipConcentration: 71, turnover: 2.8, pe: 35.2, score: 78,
    signals: ["量比放大2.4倍", "MACD金叉确认", "主力净流入3.2亿", "存储芯片涨价周期", "筹码集中度提升"],
    kline: genKline(88, 60, 0.026, 0.004)
  },
  {
    rank: 9, code: "600584", name: "长电科技", sector: "封测",
    price: 38.75, changePct: 1.56, volumeRatio: 2.6,
    macdSignal: "即将金叉", darkPoolInflow: 2.80, mainForceInflow: 15.30,
    pullUpSignal: "中等", chipConcentration: 64, turnover: 3.5, pe: 26.8, score: 77,
    signals: ["量比放大2.6倍", "MACD即将金叉", "主力净流入2.8亿", "先进封装产能释放", "底部筹码收集中"],
    kline: genKline(36, 60, 0.024, 0.003)
  },
  {
    rank: 10, code: "300661", name: "圣邦股份", sector: "模拟芯片",
    price: 165.20, changePct: 1.23, volumeRatio: 2.2,
    macdSignal: "金叉确认", darkPoolInflow: 2.10, mainForceInflow: 12.50,
    pullUpSignal: "中等", chipConcentration: 69, turnover: 1.8, pe: 52.3, score: 76,
    signals: ["量比放大2.2倍", "MACD金叉确认", "主力净流入2.1亿", "模拟芯片国产替代", "筹码趋于集中"],
    kline: genKline(155, 60, 0.022, 0.002)
  }
];

// --- 中线策略股票 (10只) ---
// 选股逻辑: 主力建仓 + 筹码密集度>70% + 量价配合 + 行业景气
var MidTermStocks = [
  {
    rank: 1, code: "300750", name: "宁德时代", sector: "动力电池",
    price: 218.50, changePct: 0.85, volumeRatio: 1.5,
    chipConcentration: 78, mainForceDays: 12, mainForceInflow: 5.60,
    positionChange: "增持", trendScore: 85, pe: 22.5, pb: 4.2,
    signals: ["主力连续12日建仓", "筹码密集度78%", "储能业务放量", "麒麟电池量产", "海外市场扩张"],
    kline: genKline(205, 60, 0.025, 0.003)
  },
  {
    rank: 2, code: "002594", name: "比亚迪", sector: "新能源汽车",
    price: 268.30, changePct: 0.62, volumeRatio: 1.3,
    chipConcentration: 72, mainForceDays: 8, mainForceInflow: 4.20,
    positionChange: "增持", trendScore: 82, pe: 20.8, pb: 3.8,
    signals: ["主力连续8日建仓", "筹码密集度72%", "月销突破50万辆", "出海加速", "DM5.0技术领先"],
    kline: genKline(255, 60, 0.022, 0.002)
  },
  {
    rank: 3, code: "601012", name: "隆基绿能", sector: "光伏",
    price: 22.35, changePct: -0.45, volumeRatio: 1.8,
    chipConcentration: 75, mainForceDays: 15, mainForceInflow: 3.50,
    positionChange: "增持", trendScore: 78, pe: 15.2, pb: 2.1,
    signals: ["主力连续15日建仓", "筹码密集度75%", "BC电池技术突破", "底部放量", "行业去库存尾声"],
    kline: genKline(21, 60, 0.03, 0.001)
  },
  {
    rank: 4, code: "300274", name: "阳光电源", sector: "逆变器",
    price: 68.50, changePct: 0.32, volumeRatio: 1.4,
    chipConcentration: 70, mainForceDays: 10, mainForceInflow: 2.80,
    positionChange: "增持", trendScore: 80, pe: 18.6, pb: 3.5,
    signals: ["主力连续10日建仓", "筹码密集度70%", "储能逆变器全球第一", "海外订单充足", "盈利能力提升"],
    kline: genKline(64, 60, 0.024, 0.003)
  },
  {
    rank: 5, code: "300124", name: "汇川技术", sector: "工控",
    price: 52.80, changePct: 0.58, volumeRatio: 1.2,
    chipConcentration: 76, mainForceDays: 14, mainForceInflow: 2.30,
    positionChange: "增持", trendScore: 83, pe: 32.5, pb: 5.8,
    signals: ["主力连续14日建仓", "筹码密集度76%", "工控龙头地位稳固", "新能源汽车电控放量", "机器人业务布局"],
    kline: genKline(49, 60, 0.02, 0.002)
  },
  {
    rank: 6, code: "600276", name: "恒瑞医药", sector: "创新药",
    price: 48.60, changePct: 0.25, volumeRatio: 1.1,
    chipConcentration: 73, mainForceDays: 9, mainForceInflow: 1.80,
    positionChange: "增持", trendScore: 79, pe: 28.2, pb: 4.5,
    signals: ["主力连续9日建仓", "筹码密集度73%", "创新药管线丰富", "海外临床推进", "集采影响出清"],
    kline: genKline(46, 60, 0.018, 0.002)
  },
  {
    rank: 7, code: "300760", name: "迈瑞医疗", sector: "医疗器械",
    price: 285.50, changePct: 0.18, volumeRatio: 1.0,
    chipConcentration: 71, mainForceDays: 7, mainForceInflow: 1.50,
    positionChange: "增持", trendScore: 81, pe: 30.8, pb: 8.2,
    signals: ["主力连续7日建仓", "筹码密集度71%", "器械龙头全球布局", "海外营收占比提升", "集采后盈利恢复"],
    kline: genKline(275, 60, 0.016, 0.002)
  },
  {
    rank: 8, code: "600036", name: "招商银行", sector: "银行",
    price: 38.25, changePct: -0.32, volumeRatio: 0.8,
    chipConcentration: 80, mainForceDays: 20, mainForceInflow: 1.20,
    positionChange: "增持", trendScore: 75, pe: 6.5, pb: 0.95,
    signals: ["主力连续20日建仓", "筹码密集度80%", "零售银行龙头", "股息率5.2%", "低估值高安全边际"],
    kline: genKline(37, 60, 0.012, 0.001)
  },
  {
    rank: 9, code: "600519", name: "贵州茅台", sector: "白酒",
    price: 1685.00, changePct: -0.15, volumeRatio: 0.9,
    chipConcentration: 82, mainForceDays: 18, mainForceInflow: 0.85,
    positionChange: "增持", trendScore: 77, pe: 25.6, pb: 8.5,
    signals: ["主力连续18日建仓", "筹码密集度82%", "白酒龙头价值回归", "批价企稳回升", "分红率提升"],
    kline: genKline(1650, 60, 0.015, 0.001)
  },
  {
    rank: 10, code: "002475", name: "立讯精密", sector: "消费电子",
    price: 42.50, changePct: 0.42, volumeRatio: 1.6,
    chipConcentration: 74, mainForceDays: 11, mainForceInflow: 2.60,
    positionChange: "增持", trendScore: 80, pe: 24.5, pb: 4.8,
    signals: ["主力连续11日建仓", "筹码密集度74%", "苹果产业链核心", "汽车电子新增长极", "通信业务拓展"],
    kline: genKline(40, 60, 0.022, 0.002)
  }
];

// --- 长线策略股票 (10只) ---
// 选股逻辑: 基本面优秀 + 政策导向 + 行业趋势 + 护城河深
var LongTermStocks = [
  {
    rank: 1, code: "688981", name: "中芯国际", sector: "晶圆代工",
    price: 98.65, changePct: 2.89, pe: 42.1, pb: 3.8,
    roe: 9.2, growth: 15.8, policyScore: 95, moatScore: 88,
    dividend: 0.5, marketCap: 7850, score: 92,
    signals: ["半导体自主可控核心", "国产替代加速", "14nm量产+7nm研发", "政策强力扶持", "长期战略价值"],
    kline: genKline(92, 60, 0.025, 0.003)
  },
  {
    rank: 2, code: "688256", name: "寒武纪", sector: "AI芯片",
    price: 235.80, changePct: 3.12, pe: 0, pb: 12.5,
    roe: -5.2, growth: 85.6, policyScore: 92, moatScore: 85,
    dividend: 0, marketCap: 9850, score: 88,
    signals: ["国产AI芯片龙头", "思元系列量产", "大模型训练刚需", "生态逐步完善", "长期成长空间巨大"],
    kline: genKline(210, 60, 0.035, 0.005)
  },
  {
    rank: 3, code: "688041", name: "海光信息", sector: "国产CPU/DCU",
    price: 85.60, changePct: 2.56, pe: 125.8, pb: 15.2,
    roe: 3.5, growth: 45.2, policyScore: 90, moatScore: 82,
    dividend: 0, marketCap: 1980, score: 87,
    signals: ["国产CPU/DCU双轮驱动", "信创核心标的", "数据中心加速放量", "x86生态兼容", "政策驱动确定性强"],
    kline: genKline(78, 60, 0.03, 0.004)
  },
  {
    rank: 4, code: "300750", name: "宁德时代", sector: "动力电池",
    price: 218.50, changePct: 0.85, pe: 22.5, pb: 4.2,
    roe: 22.8, growth: 18.5, policyScore: 85, moatScore: 90,
    dividend: 0.3, marketCap: 9610, score: 90,
    signals: ["全球动力电池龙头", "市占率37%+持续提升", "储能第二增长曲线", "技术壁垒深厚", "全球化产能布局"],
    kline: genKline(205, 60, 0.025, 0.003)
  },
  {
    rank: 5, code: "002594", name: "比亚迪", sector: "新能源汽车",
    price: 268.30, changePct: 0.62, pe: 20.8, pb: 3.8,
    roe: 24.5, growth: 22.3, policyScore: 82, moatScore: 87,
    dividend: 0.5, marketCap: 7810, score: 89,
    signals: ["新能源车销量全球第一", "垂直整合优势", "DM5.0技术领先", "出海战略加速", "品牌力持续提升"],
    kline: genKline(255, 60, 0.022, 0.002)
  },
  {
    rank: 6, code: "601012", name: "隆基绿能", sector: "光伏",
    price: 22.35, changePct: -0.45, pe: 15.2, pb: 2.1,
    roe: 16.8, growth: 8.5, policyScore: 80, moatScore: 85,
    dividend: 1.2, marketCap: 1690, score: 85,
    signals: ["全球光伏龙头", "BC电池技术突破", "成本优势显著", "行业出清后集中度提升", "碳中和长期受益"],
    kline: genKline(21, 60, 0.03, 0.001)
  },
  {
    rank: 7, code: "600276", name: "恒瑞医药", sector: "创新药",
    price: 48.60, changePct: 0.25, pe: 28.2, pb: 4.5,
    roe: 15.6, growth: 12.5, policyScore: 78, moatScore: 86,
    dividend: 0.4, marketCap: 3100, score: 86,
    signals: ["创新药龙头", "管线储备丰富", "海外临床推进", "集采影响出清", "人口老龄化长期受益"],
    kline: genKline(46, 60, 0.018, 0.002)
  },
  {
    rank: 8, code: "300760", name: "迈瑞医疗", sector: "医疗器械",
    price: 285.50, changePct: 0.18, pe: 30.8, pb: 8.2,
    roe: 25.2, growth: 16.8, policyScore: 75, moatScore: 88,
    dividend: 0.6, marketCap: 3460, score: 87,
    signals: ["医疗器械龙头", "全球化布局加速", "研发投入持续加大", "集采后集中度提升", "国产替代+出海双轮"],
    kline: genKline(275, 60, 0.016, 0.002)
  },
  {
    rank: 9, code: "688012", name: "中微公司", sector: "半导体设备",
    price: 185.60, changePct: 3.92, pe: 68.2, pb: 6.5,
    roe: 10.5, growth: 25.6, policyScore: 93, moatScore: 84,
    dividend: 0, marketCap: 1150, score: 88,
    signals: ["刻蚀设备国产龙头", "5nm技术验证通过", "订单持续高增长", "国产替代核心标的", "设备自主可控战略"],
    kline: genKline(170, 60, 0.03, 0.005)
  },
  {
    rank: 10, code: "002371", name: "北方华创", sector: "半导体设备",
    price: 312.45, changePct: 3.56, pe: 55.3, pb: 5.8,
    roe: 12.8, growth: 28.5, policyScore: 92, moatScore: 86,
    dividend: 0.3, marketCap: 1660, score: 89,
    signals: ["平台型半导体设备龙头", "薄膜/刻蚀/清洗全覆盖", "订单饱满", "国产替代空间巨大", "政策强力扶持"],
    kline: genKline(290, 60, 0.028, 0.004)
  }
];

// --- 监控预警数据 ---
var AlertData = [
  { time: "14:58:32", code: "002185", name: "华天科技", type: "放量突破", level: "high", message: "尾盘放量突破18.50压力位，量比达3.2倍", price: 18.52 },
  { time: "14:52:15", code: "300502", name: "新易盛", type: "MACD金叉", level: "high", message: "60分钟MACD零轴上方金叉，短线信号确认", price: 62.38 },
  { time: "14:45:08", code: "688012", name: "中微公司", type: "主力流入", level: "medium", message: "主力资金净流入超8亿元，大单买入占比35%", price: 185.60 },
  { time: "14:38:42", code: "300750", name: "宁德时代", type: "筹码集中", level: "medium", message: "筹码密集度提升至78%，主力建仓信号", price: 218.50 },
  { time: "14:30:25", code: "002371", name: "北方华创", type: "量比放大", level: "medium", message: "量比突破2.1倍，成交活跃度显著提升", price: 312.45 },
  { time: "14:22:18", code: "688256", name: "寒武纪", type: "涨幅预警", level: "low", message: "日内涨幅达3.12%，接近5%警戒线", price: 235.80 },
  { time: "14:15:05", code: "600519", name: "贵州茅台", type: "资金流出", level: "low", message: "主力小幅流出0.3亿，关注支撑位1680", price: 1685.00 },
  { time: "14:08:32", code: "002594", name: "比亚迪", type: "主力建仓", level: "medium", message: "连续8日主力净流入，建仓信号持续", price: 268.30 },
  { time: "13:58:15", code: "688041", name: "海光信息", type: "量价齐升", level: "high", message: "成交量放大1.5倍伴随股价上涨2.56%", price: 85.60 },
  { time: "13:45:02", code: "601012", name: "隆基绿能", type: "底部放量", level: "medium", message: "底部连续3日放量，关注反弹信号", price: 22.35 }
];

// --- 自选股监控列表 ---
var WatchList = [
  { code: "002185", name: "华天科技", price: 18.52, changePct: 5.23, alert: "18.80", stopLoss: "17.50", status: "持有" },
  { code: "300502", name: "新易盛", price: 62.38, changePct: 4.87, alert: "65.00", stopLoss: "59.00", status: "持有" },
  { code: "688012", name: "中微公司", price: 185.60, changePct: 3.92, alert: "192.00", stopLoss: "178.00", status: "持有" },
  { code: "300750", name: "宁德时代", price: 218.50, changePct: 0.85, alert: "228.00", stopLoss: "208.00", status: "建仓中" },
  { code: "002594", name: "比亚迪", price: 268.30, changePct: 0.62, alert: "278.00", stopLoss: "258.00", status: "建仓中" },
  { code: "688256", name: "寒武纪", price: 235.80, changePct: 3.12, alert: "245.00", stopLoss: "220.00", status: "观察" }
];

// --- 股票体检数据 ---
var HealthCheckData = {
  // 默认展示华天科技的体检报告
  "002185": {
    name: "华天科技", code: "002185", sector: "半导体封测",
    price: 18.52, changePct: 5.23,
    overallScore: 82,
    recommendation: "推荐关注",
    radar: [
      { name: "资金面", score: 88, max: 100 },
      { name: "技术面", score: 82, max: 100 },
      { name: "基本面", score: 75, max: 100 },
      { name: "消息面", score: 80, max: 100 },
      { name: "量价配合", score: 85, max: 100 },
      { name: "筹码分布", score: 78, max: 100 },
      { name: "主力控盘", score: 90, max: 100 },
      { name: "市场情绪", score: 75, max: 100 }
    ],
    details: {
      资金面: { score: 88, status: "优秀", items: [
        { label: "主力净流入", value: "15.76亿", rating: "positive" },
        { label: "暗盘资金流入", value: "持续3日", rating: "positive" },
        { label: "北向资金", value: "+2.3亿", rating: "positive" },
        { label: "融资余额变化", value: "+8.5%", rating: "positive" }
      ]},
      技术面: { score: 82, status: "良好", items: [
        { label: "MACD", value: "金叉确认", rating: "positive" },
        { label: "KDJ", value: "J值85超买", rating: "warning" },
        { label: "布林带", value: "突破上轨", rating: "positive" },
        { label: "均线", value: "多头排列", rating: "positive" }
      ]},
      基本面: { score: 75, status: "中等", items: [
        { label: "PE(TTM)", value: "32.5", rating: "neutral" },
        { label: "营收增速", value: "+18.5%", rating: "positive" },
        { label: "净利润增速", value: "+25.2%", rating: "positive" },
        { label: "ROE", value: "8.5%", rating: "neutral" }
      ]},
      消息面: { score: 80, status: "良好", items: [
        { label: "行业政策", value: "半导体扶持", rating: "positive" },
        { label: "公司公告", value: "定增获批", rating: "positive" },
        { label: "机构评级", value: "买入+增持", rating: "positive" },
        { label: "市场热点", value: "先进封装", rating: "positive" }
      ]},
      量价配合: { score: 85, status: "优秀", items: [
        { label: "量比", value: "3.2倍", rating: "positive" },
        { label: "换手率", value: "8.5%", rating: "positive" },
        { label: "量价关系", value: "量增价升", rating: "positive" },
        { label: "资金流向", value: "大单净买入", rating: "positive" }
      ]},
      筹码分布: { score: 78, status: "良好", items: [
        { label: "筹码密集度", value: "68%", rating: "positive" },
        { label: "获利盘比例", value: "72%", rating: "neutral" },
        { label: "平均成本", value: "16.8元", rating: "positive" },
        { label: "筹码峰", value: "单峰密集", rating: "positive" }
      ]},
      主力控盘: { score: 90, status: "优秀", items: [
        { label: "主力控盘度", value: "高", rating: "positive" },
        { label: "建仓天数", value: "5日", rating: "positive" },
        { label: "大单买入占比", value: "35%", rating: "positive" },
        { label: "主力成本", value: "16.5元", rating: "positive" }
      ]},
      市场情绪: { score: 75, status: "中等", items: [
        { label: "板块热度", value: "半导体升温", rating: "positive" },
        { label: "市场情绪", value: "偏弱(42)", rating: "warning" },
        { label: "融资情绪", value: "活跃", rating: "positive" },
        { label: "舆情热度", value: "高", rating: "positive" }
      ]}
    },
    diagnosis: "华天科技综合体检得分82分，推荐关注。资金面表现优秀，主力资金大幅流入15.76亿，暗盘资金持续3日流入。技术面MACD金叉确认，均线多头排列，短线信号明确。量比放大3.2倍，量价配合良好。主力控盘度高，筹码趋于集中。主要风险点：KDJ J值85进入超买区间，市场整体情绪偏弱。建议回调至18.0元附近逢低介入，止损位17.5元，目标位20.0元。",
    kline: genKline(15.5, 60, 0.035, 0.008)
  },
  "300750": {
    name: "宁德时代", code: "300750", sector: "动力电池",
    price: 218.50, changePct: 0.85,
    overallScore: 85,
    recommendation: "中线推荐",
    radar: [
      { name: "资金面", score: 80, max: 100 },
      { name: "技术面", score: 78, max: 100 },
      { name: "基本面", score: 92, max: 100 },
      { name: "消息面", value: 82, max: 100 },
      { name: "量价配合", score: 75, max: 100 },
      { name: "筹码分布", score: 85, max: 100 },
      { name: "主力控盘", score: 82, max: 100 },
      { name: "市场情绪", score: 78, max: 100 }
    ],
    details: {
      资金面: { score: 80, status: "良好", items: [
        { label: "主力净流入", value: "5.6亿", rating: "positive" },
        { label: "北向资金", value: "+8.2亿", rating: "positive" },
        { label: "融资余额", value: "稳定增长", rating: "positive" },
        { label: "机构增减持", value: "增持", rating: "positive" }
      ]},
      技术面: { score: 78, status: "良好", items: [
        { label: "MACD", value: "零轴上方", rating: "positive" },
        { label: "KDJ", value: "中性区间", rating: "neutral" },
        { label: "布林带", value: "中轨附近", rating: "neutral" },
        { label: "均线", value: "20日线支撑", rating: "positive" }
      ]},
      基本面: { score: 92, status: "优秀", items: [
        { label: "PE(TTM)", value: "22.5", rating: "positive" },
        { label: "营收增速", value: "+15.8%", rating: "positive" },
        { label: "净利润增速", value: "+18.5%", rating: "positive" },
        { label: "ROE", value: "22.8%", rating: "positive" }
      ]},
      消息面: { score: 82, status: "良好", items: [
        { label: "行业政策", value: "新能源扶持", rating: "positive" },
        { label: "公司公告", value: "海外扩产", rating: "positive" },
        { label: "机构评级", value: "买入", rating: "positive" },
        { label: "市场热点", value: "储能+麒麟电池", rating: "positive" }
      ]},
      量价配合: { score: 75, status: "中等", items: [
        { label: "量比", value: "1.5倍", rating: "neutral" },
        { label: "换手率", value: "1.2%", rating: "neutral" },
        { label: "量价关系", value: "温和放量", rating: "positive" },
        { label: "资金流向", value: "持续流入", rating: "positive" }
      ]},
      筹码分布: { score: 85, status: "优秀", items: [
        { label: "筹码密集度", value: "78%", rating: "positive" },
        { label: "获利盘比例", value: "65%", rating: "neutral" },
        { label: "平均成本", value: "205元", rating: "positive" },
        { label: "筹码峰", value: "高度集中", rating: "positive" }
      ]},
      主力控盘: { score: 82, status: "良好", items: [
        { label: "主力控盘度", value: "中高", rating: "positive" },
        { label: "建仓天数", value: "12日", rating: "positive" },
        { label: "大单买入占比", value: "28%", rating: "positive" },
        { label: "主力成本", value: "208元", rating: "positive" }
      ]},
      市场情绪: { score: 78, status: "良好", items: [
        { label: "板块热度", value: "新能源升温", rating: "positive" },
        { label: "市场情绪", value: "偏弱(42)", rating: "warning" },
        { label: "融资情绪", value: "稳定", rating: "neutral" },
        { label: "舆情热度", value: "中等", rating: "neutral" }
      ]}
    },
    diagnosis: "宁德时代综合体检得分85分，中线推荐。基本面优秀，ROE达22.8%，营收和净利润双位数增长。主力连续12日建仓，筹码密集度78%。PE仅22.5倍，估值合理。麒麟电池量产+储能业务放量构成双重增长引擎。主要风险：市场整体情绪偏弱，短期量能不足。建议215-220元区间分批建仓，中线目标250元。",
    kline: genKline(205, 60, 0.025, 0.003)
  },
  "688256": {
    name: "寒武纪", code: "688256", sector: "AI芯片",
    price: 235.80, changePct: 3.12,
    overallScore: 78,
    recommendation: "长线推荐",
    radar: [
      { name: "资金面", score: 85, max: 100 },
      { name: "技术面", score: 80, max: 100 },
      { name: "基本面", score: 58, max: 100 },
      { name: "消息面", score: 88, max: 100 },
      { name: "量价配合", score: 82, max: 100 },
      { name: "筹码分布", score: 72, max: 100 },
      { name: "主力控盘", score: 85, max: 100 },
      { name: "市场情绪", score: 75, max: 100 }
    ],
    details: {
      资金面: { score: 85, status: "优秀", items: [
        { label: "主力净流入", value: "6.8亿", rating: "positive" },
        { label: "北向资金", value: "+3.5亿", rating: "positive" },
        { label: "融资余额", value: "高位", rating: "warning" },
        { label: "机构持仓", value: "增加", rating: "positive" }
      ]},
      技术面: { score: 80, status: "良好", items: [
        { label: "MACD", value: "金叉", rating: "positive" },
        { label: "KDJ", value: "J值88超买", rating: "warning" },
        { label: "布林带", value: "突破上轨", rating: "positive" },
        { label: "均线", value: "多头排列", rating: "positive" }
      ]},
      基本面: { score: 58, status: "偏弱", items: [
        { label: "PE(TTM)", value: "亏损", rating: "negative" },
        { label: "营收增速", value: "+85.6%", rating: "positive" },
        { label: "净利润", value: "亏损收窄", rating: "neutral" },
        { label: "ROE", value: "-5.2%", rating: "negative" }
      ]},
      消息面: { score: 88, status: "优秀", items: [
        { label: "行业政策", value: "AI芯片扶持", rating: "positive" },
        { label: "公司公告", value: "大模型合作", rating: "positive" },
        { label: "机构评级", value: "买入", rating: "positive" },
        { label: "市场热点", value: "AI算力核心", rating: "positive" }
      ]},
      量价配合: { score: 82, status: "良好", items: [
        { label: "量比", value: "2.5倍", rating: "positive" },
        { label: "换手率", value: "5.8%", rating: "positive" },
        { label: "量价关系", value: "量增价升", rating: "positive" },
        { label: "资金流向", value: "大单流入", rating: "positive" }
      ]},
      筹码分布: { score: 72, status: "良好", items: [
        { label: "筹码密集度", value: "65%", rating: "neutral" },
        { label: "获利盘比例", value: "78%", rating: "positive" },
        { label: "平均成本", value: "210元", rating: "positive" },
        { label: "筹码峰", value: "上移中", rating: "positive" }
      ]},
      主力控盘: { score: 85, status: "优秀", items: [
        { label: "主力控盘度", value: "高", rating: "positive" },
        { label: "建仓天数", value: "8日", rating: "positive" },
        { label: "大单买入占比", value: "32%", rating: "positive" },
        { label: "主力成本", value: "215元", rating: "positive" }
      ]},
      市场情绪: { score: 75, status: "中等", items: [
        { label: "板块热度", value: "AI算力升温", rating: "positive" },
        { label: "市场情绪", value: "偏弱(42)", rating: "warning" },
        { label: "融资情绪", value: "活跃", rating: "positive" },
        { label: "舆情热度", value: "极高", rating: "positive" }
      ]}
    },
    diagnosis: "寒武纪综合体检得分78分，长线推荐。作为国产AI芯片龙头，受益于大模型训练刚需，营收增速85.6%极为亮眼。消息面和资金面表现优秀，主力控盘度高。主要风险：公司仍处亏损期，PE不适用，估值靠预期支撑。KDJ超买需警惕短线回调。适合风险承受能力较强的长线投资者，建议回调至220元附近分批介入。",
    kline: genKline(210, 60, 0.035, 0.005)
  }
};

// --- 板块资金流向时间序列 ---
var SectorFlowTimeline = {
  dates: ["07-01","07-02","07-03","07-04","07-05","07-08","07-09","07-10","07-11"],
  semiconductor: [45.2, 52.8, 38.5, 62.3, 55.1, 76.4, 94.9, 88.5, 72.3],
  computer: [32.1, 28.5, 35.2, 42.8, 38.6, 76.4, 68.5, 55.2, 48.3],
  communication: [15.2, 18.6, 22.3, 28.5, 25.6, 42.7, 38.5, 32.1, 28.6],
  newEnergy: [-25.3, -18.5, -32.1, -28.6, -22.3, -15.2, 8.5, -12.3, -18.5],
  finance: [-35.2, -28.6, -42.1, -38.5, -32.8, -25.6, 15.2, -22.3, -28.5]
};

// --- 上证指数近期走势 ---
var IndexTrend = {
  dates: ["07-01","07-02","07-03","07-04","07-05","07-08","07-09","07-10","07-11"],
  values: [3952.3, 3978.5, 3965.2, 4001.8, 4015.6, 3985.2, 4036.5, 3998.1, 3998.1],
  volumes: [3256, 3521, 3125, 3856, 3654, 3421, 4256, 3856, 3856]
};
