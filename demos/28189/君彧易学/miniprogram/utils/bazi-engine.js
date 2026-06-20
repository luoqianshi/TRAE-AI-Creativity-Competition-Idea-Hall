/**
 * 特质解读系统 - 核心排盘引擎
 * 
 * 功能：
 *   1. 年柱计算（以立春为界）
 *   2. 月柱计算（五虎遁，以节气为界）
 *   3. 日柱计算（基姆拉尔森变体 + 基准日偏移）
 *   4. 时柱计算（五鼠遁）
 *   5. 十神分析
 *   6. 大运起运 + 流年
 *   7. 五行/纳音/藏干/神煞
 */

const {
  TIAN_GAN, DI_ZHI, SIXTY_JIAZI, SHI_CHEN,
  WU_XING_MAP, WU_XING_SHENG, WU_XING_KE,
  YIN_YANG, SHI_SHEN_NAMES, CANG_GAN_MAP, NAYIN_MAP,
  WU_HU_DUN, WU_SHU_DUN, JIE_QI_MONTH_MAP,
  TIAN_YI_GUI_REN, TAO_HUA, YI_MA, HUA_GAI, WEN_CHANG,
  YANG_REN, LU_SHEN, KONG_WANG, TIAN_LUO, DI_WANG,
  JIANG_XING, ZAI_SHA, JIE_SHA, GU_CHEN, GUA_SU,
  XUE_TANG, CI_GUAN, TAI_JI, FU_XING, TIAN_CHU,
  KUI_GANG, JIN_YU, TIAN_DE, YUE_DE, TIAN_SHE,
  HONG_LUAN, TIAN_XI, YUAN_CHEN,
  SAN_QI_TIAN, SAN_QI_REN, SAN_QI_DI,
  DE_XIU_GAN, DE_XIU_ZHI, JIN_SHEN, LIU_XIU_RI, SHI_LING_RI,
  JIN_SHEN_RI, RI_GUI, RI_DE, SI_FEI,
  GOU_JIAO_GOU, GOU_JIAO_JIAO, WANG_SHEN, LIU_E,
  TIAN_XING, DI_XING, SANG_MEN, DIAO_KE, PI_MA,
  XUE_REN, ZHI_BEI, GE_JIAO, BA_ZHUAN, JIU_CHOU,
  YIN_CHA_YANG_CUO, TIAN_HUO, DI_HUO, TIAN_GOU,
  SHI_ER_CHANG_SHENG,
  WU_XING_COLOR, GAN_ZHI_COLOR
} = require('./constants');
const { getYearJieQi, getSpringFestival } = require('./calendar-data');

// ==================== 1. 辅助函数 ====================

/**
 * 计算两个日期之间的天数差
 */
function daysBetween(y1, m1, d1, y2, m2, d2) {
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
}

/**
 * 将 (年偏移, 月, 日, 时) 转换为一个可比较的数值
 * 年偏移：相对于基准年（0=当年, -1=前一年, +1=后一年）
 * 格式：年偏移 * 100000000 + 月 * 10000 + 日 * 100 + 时
 * 这样确保 前一年12月 < 当年1月 < 当年12月 < 后一年1月
 */
function dateToComparable(yearOffset, m, d, h) {
  return yearOffset * 100000000 + m * 10000 + d * 100 + h;
}

/**
 * 判断 (m,d,h) 是否 >= 节气 (yearOffset, jqM, jqD, jqH)
 * yearOffset: -1=前一年, 0=当年, +1=后一年
 */
function isAfterOrEqualJieQi(m, d, h, yearOffset, jqM, jqD, jqH) {
  return dateToComparable(0, m, d, h) >= dateToComparable(yearOffset, jqM, jqD, jqH);
}

/**
 * 判断 (m,d,h) 是否 < 节气
 */
function isBeforeJieQi(m, d, h, yearOffset, jqM, jqD, jqH) {
  return !isAfterOrEqualJieQi(m, d, h, yearOffset, jqM, jqD, jqH);
}

/**
 * 获取时辰索引（子时=0, 丑时=1, ..., 亥时=11）
 */
function getShiChenIndex(hour) {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

// ==================== 2. 日柱计算 ====================

/**
 * 日柱计算
 * 基准: 1900-01-01 = 甲戌 (60甲子索引=10)
 * 验证: 2000-01-01 = 戊午 (60甲子索引=54)
 */
function getDayPillar(year, month, day) {
  const baseYear = 1900, baseMonth = 1, baseDay = 1;
  const baseIndex = 10; // 甲戌
  
  const days = daysBetween(baseYear, baseMonth, baseDay, year, month, day);
  const index = ((baseIndex + days) % 60 + 60) % 60;
  
  return {
    ganZhi: SIXTY_JIAZI[index],
    gan: TIAN_GAN[index % 10],
    zhi: DI_ZHI[index % 12],
    index: index
  };
}

// ==================== 3. 年柱计算 ====================

/**
 * 年柱以立春为界，立春前属于上一年
 */
function getYearPillar(year, month, day, hour) {
  const jieQi = getYearJieQi(year);
  if (!jieQi || jieQi.length < 3) {
    throw new Error(`年份 ${year} 不在支持范围内`);
  }
  
  const lichun = jieQi.find(j => j.n === '立春');
  if (!lichun) throw new Error(`无法获取 ${year} 年立春数据`);
  
  const isBeforeLC = isBeforeJieQi(month, day, hour, 0, lichun.m, lichun.d, lichun.h);
  const effectiveYear = isBeforeLC ? year - 1 : year;
  
  // 年干支: (year - 4) % 60
  const index = ((effectiveYear - 4) % 60 + 60) % 60;
  
  return {
    ganZhi: SIXTY_JIAZI[index],
    gan: TIAN_GAN[index % 10],
    zhi: DI_ZHI[index % 12],
    index: index,
    effectiveYear: effectiveYear
  };
}

// ==================== 4. 月柱计算（五虎遁） ====================

/**
 * 节气月地支：寅=0, 卯=1, 辰=2, 巳=3, 午=4, 未=5, 申=6, 酉=7, 戌=8, 亥=9, 子=10, 丑=11
 * 节气月以"节"（偶数索引）为起点：
 *   0=立春(寅月)  1=惊蛰(卯月)  2=清明(辰月)  3=立夏(巳月)
 *   4=芒种(午月)  5=小暑(未月)  6=立秋(申月)  7=白露(酉月)
 *   8=寒露(戌月)  9=立冬(亥月)  10=大雪(子月)  11=小寒(丑月)
 */
const JIE_QI_MONTH_ZHI = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

/**
 * 月柱以节气为界，寅月=立春~惊蛰
 * 五虎遁: 甲己之年丙作首, 乙庚之年戊为头, 丙辛之岁庚寅起, 丁壬壬寅顺水流, 戊癸甲寅定可求
 * 
 * 算法：
 *   1. 构建连续3年的"节"列表（只取偶数索引的12个节），确保跨年覆盖
 *   2. 用 dateToComparable 找到出生时间落在哪个节之后
 *   3. 五虎遁求月干
 * 
 * @param {string} yearGan - 年柱天干（已根据立春调整）
 * @param {number} year - 原始公历年（用于查节气）
 * @param {number} month - 公历月
 * @param {number} day - 公历日
 * @param {number} hour - 小时
 */
function getMonthPillar(yearGan, year, month, day, hour) {
  // 取连续3年的节气数据
  const prevJQ = getYearJieQi(year - 1) || [];
  const curJQ = getYearJieQi(year);
  const nextJQ = getYearJieQi(year + 1) || [];
  
  if (!curJQ || curJQ.length < 24) {
    throw new Error(`年份 ${year} 节气数据缺失`);
  }
  
  // 只取"节"（偶数索引的节气），共12个：
  // index: 0=小寒, 2=立春, 4=惊蛰, 6=清明, 8=立夏, 10=芒种,
  //        12=小暑, 14=立秋, 16=白露, 18=寒露, 20=立冬, 22=大雪
  // 对应的节气月: 11=丑, 0=寅, 1=卯, 2=辰, 3=巳, 4=午, 5=未, 6=申, 7=酉, 8=戌, 9=亥, 10=子
  const JIE_TO_MONTH = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 按24节气偶数索引顺序
  
  // 构建连续"节"列表，按时间顺序排列：
  // 前一年大雪(12月) → 当年小寒(1月) → 当年立春(2月) → ... → 当年大雪(12月) → 后一年小寒(1月) → 后一年立春(2月)
  const jieList = [];
  
  // 前一年大雪(index=22)，公历 year-1 年12月
  if (prevJQ[22]) jieList.push({ ...prevJQ[22], yearOffset: -1, jieIndex: 10 });
  
  // 当年的12个节（只取偶数索引：0=小寒, 2=立春, 4=惊蛰, ..., 22=大雪）
  for (let i = 0; i < 12; i++) {
    const qi24Index = i * 2;
    if (curJQ[qi24Index]) {
      jieList.push({ ...curJQ[qi24Index], yearOffset: 0, jieIndex: i });
    }
  }
  
  // 后一年小寒(index=0, 公历 year+1 年1月) + 后一年立春(index=2)
  if (nextJQ[0]) jieList.push({ ...nextJQ[0], yearOffset: 1, jieIndex: 0 });
  if (nextJQ[2]) jieList.push({ ...nextJQ[2], yearOffset: 1, jieIndex: 1 });
  
  // 从后往前找到第一个满足"当前时间 >= 节的时间"的节
  let foundIndex = -1;
  for (let i = jieList.length - 1; i >= 0; i--) {
    const jie = jieList[i];
    if (isAfterOrEqualJieQi(month, day, hour, jie.yearOffset, jie.m, jie.d, jie.h)) {
      foundIndex = i;
      break;
    }
  }
  
  if (foundIndex === -1) {
    // 极端情况：出生在1月1日~前一年大雪之前（不可能，因为前一年大雪在12月初）
    foundIndex = 0;
  }
  
  const foundJie = jieList[foundIndex];
  const monthIndex = JIE_TO_MONTH[foundJie.jieIndex]; // 0=寅月...11=丑月
  
  // 五虎遁: 根据年干确定寅月天干
  const yinYueGanStart = TIAN_GAN.indexOf(WU_HU_DUN[yearGan]);
  const yueGan = TIAN_GAN[(yinYueGanStart + monthIndex) % 10];
  const yueZhi = JIE_QI_MONTH_ZHI[monthIndex];
  
  // JIE_QI_MONTH_MAP: 0=丑月, 1=寅月...11=子月
  const mapIndex = (monthIndex + 1) % 12;
  return {
    ganZhi: yueGan + yueZhi,
    gan: yueGan,
    zhi: yueZhi,
    monthIndex: monthIndex,
    monthName: JIE_QI_MONTH_MAP[mapIndex] ? JIE_QI_MONTH_MAP[mapIndex].jie + '月' : ''
  };
}

// ==================== 5. 时柱计算（五鼠遁） ====================

/**
 * 时柱计算
 * 五鼠遁: 甲己还加甲, 乙庚丙作初, 丙辛从戊起, 丁壬庚子居, 戊癸何方发, 壬子是真途
 * 
 * 子时(23:00-1:00)跨日处理：
 * - 流派1（默认）：晚子时(23:00-0:00)日柱算当天，时柱天干按当天日干起算
 * - 流派2：晚子时日柱算次日，时柱天干按次日日干起算
 * 这里采用流派1（主流）
 * 
 * @param {string} dayGan - 日柱天干
 * @param {number} hour - 小时(0-23)
 */
function getHourPillar(dayGan, hour) {
  const shiChenIndex = getShiChenIndex(hour);
  
  // 五鼠遁: 根据日干确定子时天干
  // 甲己日 → 甲子时(索引0)
  // 乙庚日 → 丙子时(索引2)
  // 丙辛日 → 戊子时(索引4)
  // 丁壬日 → 庚子时(索引6)
  // 戊癸日 → 壬子时(索引8)
  const shiGanStart = TIAN_GAN.indexOf(WU_SHU_DUN[dayGan]);
  const shiGan = TIAN_GAN[(shiGanStart + shiChenIndex) % 10];
  const shiZhi = DI_ZHI[shiChenIndex];
  
  return {
    ganZhi: shiGan + shiZhi,
    gan: shiGan,
    zhi: shiZhi,
    shiChenIndex: shiChenIndex,
    shiChenName: SHI_CHEN[shiChenIndex].name
  };
}

// ==================== 6. 十神计算 ====================

/**
 * 天干五行分组映射：0=木, 1=火, 2=土, 3=金, 4=水
 */
const GAN_WX_GROUP = {
  '甲': 0, '乙': 0,  // 木
  '丙': 1, '丁': 1,  // 火
  '戊': 2, '己': 2,  // 土
  '庚': 3, '辛': 3,  // 金
  '壬': 4, '癸': 4   // 水
};

function getShiShen(riGan, targetGan) {
  if (!riGan || !targetGan) return '';
  
  const riWx = GAN_WX_GROUP[riGan];
  const tgWx = GAN_WX_GROUP[targetGan];
  if (riWx === undefined || tgWx === undefined) return '';
  
  const riYY = YIN_YANG[riGan];
  const tgYY = YIN_YANG[targetGan];
  const sameYY = riYY === tgYY;
  
  // 五行关系: 同我=比劫, 我生=食伤, 我克=财, 克我=官杀, 生我=印
  // 生克链: 木→火→土→金→水→木  (生)
  // 克链:   木→土→水→火→金→木  (克)
  const diffWx = (tgWx - riWx + 5) % 5;
  
  // diffWx: 0=同我(比劫), 1=我生(食伤), 2=我克(财), 3=克我(官杀), 4=生我(印)
  switch (diffWx) {
    case 0: // 同我 → 比肩/劫财
      return sameYY ? SHI_SHEN_NAMES.biJian : SHI_SHEN_NAMES.jieCai;
    case 1: // 我生 → 食神/伤官
      return sameYY ? SHI_SHEN_NAMES.shiShen : SHI_SHEN_NAMES.shangGuan;
    case 2: // 我克 → 偏财/正财
      return sameYY ? SHI_SHEN_NAMES.pianCai : SHI_SHEN_NAMES.zhengCai;
    case 3: // 克我 → 七杀/正官
      return sameYY ? SHI_SHEN_NAMES.qiSha : SHI_SHEN_NAMES.zhengGuan;
    case 4: // 生我 → 偏印/正印
      return sameYY ? SHI_SHEN_NAMES.pianYin : SHI_SHEN_NAMES.zhengYin;
    default:
      return '';
  }
}

// ==================== 7. 五行/纳音/藏干 ====================

function getWuXing(ganOrZhi) {
  return WU_XING_MAP[ganOrZhi] || '';
}

function getNaYin(jiaziIndex) {
  return NAYIN_MAP[jiaziIndex] || '';
}

function getCangGan(zhi) {
  return CANG_GAN_MAP[zhi] || [];
}

// ==================== 8. 神煞计算 ====================

/**
 * 工具：根据年支/日支找到对应的三合局key
 */
function getSanHeKey(zhi) {
  const sanHeMap = {
    '寅': '寅午戌', '午': '寅午戌', '戌': '寅午戌',
    '申': '申子辰', '子': '申子辰', '辰': '申子辰',
    '亥': '亥卯未', '卯': '亥卯未', '未': '亥卯未',
    '巳': '巳酉丑', '酉': '巳酉丑', '丑': '巳酉丑'
  };
  return sanHeMap[zhi] || null;
}

/**
 * 工具：根据年支/日支找到对应的四季节气组key
 */
function getSeasonKey(zhi) {
  const seasonMap = {
    '寅': '寅卯辰', '卯': '寅卯辰', '辰': '寅卯辰',
    '巳': '巳午未', '午': '巳午未', '未': '巳午未',
    '申': '申酉戌', '酉': '申酉戌', '戌': '申酉戌',
    '亥': '亥子丑', '子': '亥子丑', '丑': '亥子丑'
  };
  return seasonMap[zhi] || null;
}

/**
 * 季节（用于天赦等）
 */
function getSeason(monthZhi) {
  if (['寅','卯','辰'].includes(monthZhi)) return '春';
  if (['巳','午','未'].includes(monthZhi)) return '夏';
  if (['申','酉','戌'].includes(monthZhi)) return '秋';
  return '冬';
}

/**
 * 工具：检查三合局key中是否包含某地支
 */
function checkSanHeMatch(key, zhi, targetZhi, map) {
  if (!key || !zhi) return false;
  return map[key] === targetZhi;
}

/**
 * 工具：检查季节组key中是否包含某地支
 */
function checkSeasonMatch(key, zhi, targetZhi, map) {
  if (!key || !zhi) return false;
  return map[key] === targetZhi;
}

function getShenSha(yearZhi, monthZhi, dayZhi, hourZhi, dayGan, yearGan, monthGan, hourGan, gender) {
  const shenShaList = [];
  const dayGanZhi = dayGan + dayZhi;
  const hourGanZhi = hourGan + hourZhi;

  // ========== 吉神 ==========

  // 1. 天乙贵人（以日干/年干查四柱地支）
  const tianYiZhi = TIAN_YI_GUI_REN[dayGan] || [];
  if (tianYiZhi.includes(yearZhi)) shenShaList.push({ name: '天乙贵人', pillar: '年', type: '吉' });
  if (tianYiZhi.includes(monthZhi)) shenShaList.push({ name: '天乙贵人', pillar: '月', type: '吉' });
  if (tianYiZhi.includes(dayZhi)) shenShaList.push({ name: '天乙贵人', pillar: '日', type: '吉' });
  if (tianYiZhi.includes(hourZhi)) shenShaList.push({ name: '天乙贵人', pillar: '时', type: '吉' });

  // 2. 太极贵人（以日干/年干查四柱地支）
  const taiJiZhi = TAI_JI[dayGan] || [];
  if (taiJiZhi.includes(yearZhi)) shenShaList.push({ name: '太极贵人', pillar: '年', type: '吉' });
  if (taiJiZhi.includes(monthZhi)) shenShaList.push({ name: '太极贵人', pillar: '月', type: '吉' });
  if (taiJiZhi.includes(dayZhi)) shenShaList.push({ name: '太极贵人', pillar: '日', type: '吉' });
  if (taiJiZhi.includes(hourZhi)) shenShaList.push({ name: '太极贵人', pillar: '时', type: '吉' });

  // 3. 福星贵人（以日干查四柱地支）
  const fuXingZhi = FU_XING[dayGan];
  if (fuXingZhi && fuXingZhi === yearZhi) shenShaList.push({ name: '福星贵人', pillar: '年', type: '吉' });
  if (fuXingZhi && fuXingZhi === monthZhi) shenShaList.push({ name: '福星贵人', pillar: '月', type: '吉' });
  if (fuXingZhi && fuXingZhi === dayZhi) shenShaList.push({ name: '福星贵人', pillar: '日', type: '吉' });
  if (fuXingZhi && fuXingZhi === hourZhi) shenShaList.push({ name: '福星贵人', pillar: '时', type: '吉' });

  // 4. 文昌贵人（以日干查四柱地支）
  const wenChangZhi = WEN_CHANG[dayGan];
  if (wenChangZhi && wenChangZhi === yearZhi) shenShaList.push({ name: '文昌贵人', pillar: '年', type: '吉' });
  if (wenChangZhi && wenChangZhi === monthZhi) shenShaList.push({ name: '文昌贵人', pillar: '月', type: '吉' });
  if (wenChangZhi && wenChangZhi === dayZhi) shenShaList.push({ name: '文昌贵人', pillar: '日', type: '吉' });
  if (wenChangZhi && wenChangZhi === hourZhi) shenShaList.push({ name: '文昌贵人', pillar: '时', type: '吉' });

  // 5. 学堂（以日干查四柱地支）
  const xueTangZhi = XUE_TANG[dayGan];
  if (xueTangZhi && xueTangZhi === yearZhi) shenShaList.push({ name: '学堂', pillar: '年', type: '吉' });
  if (xueTangZhi && xueTangZhi === monthZhi) shenShaList.push({ name: '学堂', pillar: '月', type: '吉' });
  if (xueTangZhi && xueTangZhi === dayZhi) shenShaList.push({ name: '学堂', pillar: '日', type: '吉' });
  if (xueTangZhi && xueTangZhi === hourZhi) shenShaList.push({ name: '学堂', pillar: '时', type: '吉' });

  // 6. 词馆（以日干查四柱地支）
  const ciGuanZhi = CI_GUAN[dayGan];
  if (ciGuanZhi && ciGuanZhi === yearZhi) shenShaList.push({ name: '词馆', pillar: '年', type: '吉' });
  if (ciGuanZhi && ciGuanZhi === monthZhi) shenShaList.push({ name: '词馆', pillar: '月', type: '吉' });
  if (ciGuanZhi && ciGuanZhi === dayZhi) shenShaList.push({ name: '词馆', pillar: '日', type: '吉' });
  if (ciGuanZhi && ciGuanZhi === hourZhi) shenShaList.push({ name: '词馆', pillar: '时', type: '吉' });

  // 7. 天厨贵人（以日干查四柱地支）
  const tianChuZhi = TIAN_CHU[dayGan];
  if (tianChuZhi && tianChuZhi === yearZhi) shenShaList.push({ name: '天厨贵人', pillar: '年', type: '吉' });
  if (tianChuZhi && tianChuZhi === monthZhi) shenShaList.push({ name: '天厨贵人', pillar: '月', type: '吉' });
  if (tianChuZhi && tianChuZhi === dayZhi) shenShaList.push({ name: '天厨贵人', pillar: '日', type: '吉' });
  if (tianChuZhi && tianChuZhi === hourZhi) shenShaList.push({ name: '天厨贵人', pillar: '时', type: '吉' });

  // 8. 禄神（以日干查四柱地支）
  const luShenZhi = LU_SHEN[dayGan];
  if (luShenZhi && luShenZhi === yearZhi) shenShaList.push({ name: '禄神', pillar: '年', type: '吉' });
  if (luShenZhi && luShenZhi === monthZhi) shenShaList.push({ name: '禄神', pillar: '月', type: '吉' });
  if (luShenZhi && luShenZhi === dayZhi) shenShaList.push({ name: '禄神', pillar: '日', type: '吉' });
  if (luShenZhi && luShenZhi === hourZhi) shenShaList.push({ name: '禄神', pillar: '时', type: '吉' });

  // 9. 金舆（以日干查四柱地支）
  const jinYuZhi = JIN_YU[dayGan];
  if (jinYuZhi && jinYuZhi === yearZhi) shenShaList.push({ name: '金舆', pillar: '年', type: '吉' });
  if (jinYuZhi && jinYuZhi === monthZhi) shenShaList.push({ name: '金舆', pillar: '月', type: '吉' });
  if (jinYuZhi && jinYuZhi === dayZhi) shenShaList.push({ name: '金舆', pillar: '日', type: '吉' });
  if (jinYuZhi && jinYuZhi === hourZhi) shenShaList.push({ name: '金舆', pillar: '时', type: '吉' });

  // 10. 天德贵人（以月支查四柱天干）
  const tianDeGan = TIAN_DE[monthZhi];
  if (tianDeGan) {
    if (tianDeGan === yearGan) shenShaList.push({ name: '天德贵人', pillar: '年', type: '吉' });
    if (tianDeGan === monthGan) shenShaList.push({ name: '天德贵人', pillar: '月', type: '吉' });
    if (tianDeGan === dayGan) shenShaList.push({ name: '天德贵人', pillar: '日', type: '吉' });
  }

  // 11. 月德贵人（以月支三合局查四柱天干）
  const sanHeKey = getSanHeKey(monthZhi);
  if (sanHeKey && YUE_DE[sanHeKey]) {
    const yueDeGan = YUE_DE[sanHeKey];
    if (yueDeGan === yearGan) shenShaList.push({ name: '月德贵人', pillar: '年', type: '吉' });
    if (yueDeGan === monthGan) shenShaList.push({ name: '月德贵人', pillar: '月', type: '吉' });
    if (yueDeGan === dayGan) shenShaList.push({ name: '月德贵人', pillar: '日', type: '吉' });
  }

  // 12. 三奇贵人（年、月、日天干齐全）
  const yearMonthDayGans = [yearGan, monthGan, dayGan];
  const hasTianSanQi = SAN_QI_TIAN.every(g => yearMonthDayGans.includes(g));
  const hasRenSanQi = SAN_QI_REN.every(g => yearMonthDayGans.includes(g));
  const hasDiSanQi = SAN_QI_DI.every(g => yearMonthDayGans.includes(g));
  if (hasTianSanQi) shenShaList.push({ name: '三奇贵人(天上)', pillar: '全局', type: '吉' });
  if (hasRenSanQi) shenShaList.push({ name: '三奇贵人(人中)', pillar: '全局', type: '吉' });
  if (hasDiSanQi) shenShaList.push({ name: '三奇贵人(地下)', pillar: '全局', type: '吉' });

  // 13. 天赦（以月支季节 + 日柱干支查）
  const season = getSeason(monthZhi);
  if (TIAN_SHE[season] && TIAN_SHE[season] === dayGanZhi) {
    shenShaList.push({ name: '天赦', pillar: '日', type: '吉' });
  }

  // 14. 魁罡（日柱为特定四柱）
  if (KUI_GANG.includes(dayGanZhi)) {
    shenShaList.push({ name: '魁罡', pillar: '日', type: '中性' });
  }

  // 15. 将星（以年支三合局查四柱地支）
  const yearSanHeKey = getSanHeKey(yearZhi);
  if (yearSanHeKey && JIANG_XING[yearSanHeKey]) {
    const jiangXingZhi = JIANG_XING[yearSanHeKey];
    if (jiangXingZhi === yearZhi) shenShaList.push({ name: '将星', pillar: '年', type: '吉' });
    if (jiangXingZhi === monthZhi) shenShaList.push({ name: '将星', pillar: '月', type: '吉' });
    if (jiangXingZhi === dayZhi) shenShaList.push({ name: '将星', pillar: '日', type: '吉' });
    if (jiangXingZhi === hourZhi) shenShaList.push({ name: '将星', pillar: '时', type: '吉' });
  }

  // 16. 华盖（以年支/日支三合局查四柱地支）
  const daySanHeKey = getSanHeKey(dayZhi);
  if (yearSanHeKey && HUA_GAI[yearSanHeKey]) {
    const hgZhi = HUA_GAI[yearSanHeKey];
    if (hgZhi === yearZhi) shenShaList.push({ name: '华盖', pillar: '年', type: '中性' });
    if (hgZhi === monthZhi) shenShaList.push({ name: '华盖', pillar: '月', type: '中性' });
    if (hgZhi === dayZhi) shenShaList.push({ name: '华盖', pillar: '日', type: '中性' });
    if (hgZhi === hourZhi) shenShaList.push({ name: '华盖', pillar: '时', type: '中性' });
  }
  if (daySanHeKey && HUA_GAI[daySanHeKey] && HUA_GAI[daySanHeKey] !== HUA_GAI[yearSanHeKey]) {
    const hgZhi2 = HUA_GAI[daySanHeKey];
    if (hgZhi2 === yearZhi) shenShaList.push({ name: '华盖', pillar: '年', type: '中性' });
    if (hgZhi2 === monthZhi) shenShaList.push({ name: '华盖', pillar: '月', type: '中性' });
    if (hgZhi2 === dayZhi) shenShaList.push({ name: '华盖', pillar: '日', type: '中性' });
    if (hgZhi2 === hourZhi) shenShaList.push({ name: '华盖', pillar: '时', type: '中性' });
  }

  // 17. 红鸾（以年支查四柱地支）
  const yearSeasonKey = getSeasonKey(yearZhi);
  if (yearSeasonKey && HONG_LUAN[yearSeasonKey]) {
    const hlZhi = HONG_LUAN[yearSeasonKey];
    if (hlZhi === yearZhi) shenShaList.push({ name: '红鸾', pillar: '年', type: '吉' });
    if (hlZhi === monthZhi) shenShaList.push({ name: '红鸾', pillar: '月', type: '吉' });
    if (hlZhi === dayZhi) shenShaList.push({ name: '红鸾', pillar: '日', type: '吉' });
    if (hlZhi === hourZhi) shenShaList.push({ name: '红鸾', pillar: '时', type: '吉' });
  }

  // 18. 天喜（以年支查四柱地支）
  if (yearSeasonKey && TIAN_XI[yearSeasonKey]) {
    const txZhi = TIAN_XI[yearSeasonKey];
    if (txZhi === yearZhi) shenShaList.push({ name: '天喜', pillar: '年', type: '吉' });
    if (txZhi === monthZhi) shenShaList.push({ name: '天喜', pillar: '月', type: '吉' });
    if (txZhi === dayZhi) shenShaList.push({ name: '天喜', pillar: '日', type: '吉' });
    if (txZhi === hourZhi) shenShaList.push({ name: '天喜', pillar: '时', type: '吉' });
  }

  // ========== 中性/凶神 ==========

  // 19. 桃花（咸池，以年支/日支三合局查四柱地支）
  if (yearSanHeKey && TAO_HUA[yearSanHeKey]) {
    const thZhi = TAO_HUA[yearSanHeKey];
    if (thZhi === yearZhi) shenShaList.push({ name: '桃花', pillar: '年', type: '中性' });
    if (thZhi === monthZhi) shenShaList.push({ name: '桃花', pillar: '月', type: '中性' });
    if (thZhi === dayZhi) shenShaList.push({ name: '桃花', pillar: '日', type: '中性' });
    if (thZhi === hourZhi) shenShaList.push({ name: '桃花', pillar: '时', type: '中性' });
  }
  if (daySanHeKey && TAO_HUA[daySanHeKey] && TAO_HUA[daySanHeKey] !== TAO_HUA[yearSanHeKey]) {
    const thZhi2 = TAO_HUA[daySanHeKey];
    if (thZhi2 === yearZhi) shenShaList.push({ name: '桃花', pillar: '年', type: '中性' });
    if (thZhi2 === monthZhi) shenShaList.push({ name: '桃花', pillar: '月', type: '中性' });
    if (thZhi2 === dayZhi) shenShaList.push({ name: '桃花', pillar: '日', type: '中性' });
    if (thZhi2 === hourZhi) shenShaList.push({ name: '桃花', pillar: '时', type: '中性' });
  }

  // 20. 驿马（以年支/日支三合局查四柱地支）
  if (yearSanHeKey && YI_MA[yearSanHeKey]) {
    const ymZhi = YI_MA[yearSanHeKey];
    if (ymZhi === yearZhi) shenShaList.push({ name: '驿马', pillar: '年', type: '中性' });
    if (ymZhi === monthZhi) shenShaList.push({ name: '驿马', pillar: '月', type: '中性' });
    if (ymZhi === dayZhi) shenShaList.push({ name: '驿马', pillar: '日', type: '中性' });
    if (ymZhi === hourZhi) shenShaList.push({ name: '驿马', pillar: '时', type: '中性' });
  }
  if (daySanHeKey && YI_MA[daySanHeKey] && YI_MA[daySanHeKey] !== YI_MA[yearSanHeKey]) {
    const ymZhi2 = YI_MA[daySanHeKey];
    if (ymZhi2 === yearZhi) shenShaList.push({ name: '驿马', pillar: '年', type: '中性' });
    if (ymZhi2 === monthZhi) shenShaList.push({ name: '驿马', pillar: '月', type: '中性' });
    if (ymZhi2 === dayZhi) shenShaList.push({ name: '驿马', pillar: '日', type: '中性' });
    if (ymZhi2 === hourZhi) shenShaList.push({ name: '驿马', pillar: '时', type: '中性' });
  }

  // 21. 劫煞（以年支/日支三合局查四柱地支）
  if (yearSanHeKey && JIE_SHA[yearSanHeKey]) {
    const jsZhi = JIE_SHA[yearSanHeKey];
    if (jsZhi === yearZhi) shenShaList.push({ name: '劫煞', pillar: '年', type: '凶' });
    if (jsZhi === monthZhi) shenShaList.push({ name: '劫煞', pillar: '月', type: '凶' });
    if (jsZhi === dayZhi) shenShaList.push({ name: '劫煞', pillar: '日', type: '凶' });
    if (jsZhi === hourZhi) shenShaList.push({ name: '劫煞', pillar: '时', type: '凶' });
  }

  // 22. 灾煞（以年支/日支三合局查四柱地支）
  if (yearSanHeKey && ZAI_SHA[yearSanHeKey]) {
    const zsZhi = ZAI_SHA[yearSanHeKey];
    if (zsZhi === yearZhi) shenShaList.push({ name: '灾煞', pillar: '年', type: '凶' });
    if (zsZhi === monthZhi) shenShaList.push({ name: '灾煞', pillar: '月', type: '凶' });
    if (zsZhi === dayZhi) shenShaList.push({ name: '灾煞', pillar: '日', type: '凶' });
    if (zsZhi === hourZhi) shenShaList.push({ name: '灾煞', pillar: '时', type: '凶' });
  }

  // 23. 羊刃（以日干查四柱地支）
  const yangRenZhi = YANG_REN[dayGan];
  if (yangRenZhi) {
    if (yangRenZhi === yearZhi) shenShaList.push({ name: '羊刃', pillar: '年', type: '凶' });
    if (yangRenZhi === monthZhi) shenShaList.push({ name: '羊刃', pillar: '月', type: '凶' });
    if (yangRenZhi === dayZhi) shenShaList.push({ name: '羊刃', pillar: '日', type: '凶' });
    if (yangRenZhi === hourZhi) shenShaList.push({ name: '羊刃', pillar: '时', type: '凶' });
  }

  // 24. 孤辰（以年支查四柱地支）
  const yearSeasonKey2 = getSeasonKey(yearZhi);
  if (yearSeasonKey2 && GU_CHEN[yearSeasonKey2]) {
    const gcZhi = GU_CHEN[yearSeasonKey2];
    if (gcZhi === yearZhi) shenShaList.push({ name: '孤辰', pillar: '年', type: '凶' });
    if (gcZhi === monthZhi) shenShaList.push({ name: '孤辰', pillar: '月', type: '凶' });
    if (gcZhi === dayZhi) shenShaList.push({ name: '孤辰', pillar: '日', type: '凶' });
    if (gcZhi === hourZhi) shenShaList.push({ name: '孤辰', pillar: '时', type: '凶' });
  }

  // 25. 寡宿（以年支查四柱地支）
  if (yearSeasonKey2 && GUA_SU[yearSeasonKey2]) {
    const gsZhi = GUA_SU[yearSeasonKey2];
    if (gsZhi === yearZhi) shenShaList.push({ name: '寡宿', pillar: '年', type: '凶' });
    if (gsZhi === monthZhi) shenShaList.push({ name: '寡宿', pillar: '月', type: '凶' });
    if (gsZhi === dayZhi) shenShaList.push({ name: '寡宿', pillar: '日', type: '凶' });
    if (gsZhi === hourZhi) shenShaList.push({ name: '寡宿', pillar: '时', type: '凶' });
  }

  // 26. 元辰（以年支查四柱地支）
  const yuanChenZhi = YUAN_CHEN[yearZhi];
  if (yuanChenZhi) {
    if (yuanChenZhi === monthZhi) shenShaList.push({ name: '元辰', pillar: '月', type: '凶' });
    if (yuanChenZhi === dayZhi) shenShaList.push({ name: '元辰', pillar: '日', type: '凶' });
    if (yuanChenZhi === hourZhi) shenShaList.push({ name: '元辰', pillar: '时', type: '凶' });
  }

  // 27. 空亡（以日柱旬空查四柱地支）
  const dayIndex60 = SIXTY_JIAZI.indexOf(dayGanZhi);
  const xunStart = Math.floor(dayIndex60 / 10) * 10;
  const kongWangZhi = KONG_WANG[xunStart] || [];
  if (kongWangZhi.includes(yearZhi)) shenShaList.push({ name: '空亡', pillar: '年', type: '中性' });
  if (kongWangZhi.includes(monthZhi)) shenShaList.push({ name: '空亡', pillar: '月', type: '中性' });
  if (kongWangZhi.includes(dayZhi)) shenShaList.push({ name: '空亡', pillar: '日', type: '中性' });
  if (kongWangZhi.includes(hourZhi)) shenShaList.push({ name: '空亡', pillar: '时', type: '中性' });

  // 28. 天罗地网（以日支查）
  if (gender === '男' && TIAN_LUO.includes(dayZhi)) {
    shenShaList.push({ name: '天罗', pillar: '日', type: '凶' });
  }
  if (gender === '女' && DI_WANG.includes(dayZhi)) {
    shenShaList.push({ name: '地网', pillar: '日', type: '凶' });
  }

  // ========== 新增神煞 ==========

  // 29. 德秀贵人（以月支季节查四柱天干和地支）
  const monthSeasonKey = getSeasonKey(monthZhi);
  if (monthSeasonKey && DE_XIU_GAN[monthSeasonKey]) {
    const dexGans = DE_XIU_GAN[monthSeasonKey];
    if (dexGans.includes(yearGan)) shenShaList.push({ name: '德秀贵人', pillar: '年', type: '吉' });
    if (dexGans.includes(monthGan)) shenShaList.push({ name: '德秀贵人', pillar: '月', type: '吉' });
    if (dexGans.includes(dayGan)) shenShaList.push({ name: '德秀贵人', pillar: '日', type: '吉' });
  }
  if (monthSeasonKey && DE_XIU_ZHI[monthSeasonKey]) {
    const dexZhis = DE_XIU_ZHI[monthSeasonKey];
    if (dexZhis.includes(yearZhi)) shenShaList.push({ name: '德秀贵人', pillar: '年', type: '吉' });
    if (dexZhis.includes(monthZhi)) shenShaList.push({ name: '德秀贵人', pillar: '月', type: '吉' });
    if (dexZhis.includes(dayZhi)) shenShaList.push({ name: '德秀贵人', pillar: '日', type: '吉' });
    if (dexZhis.includes(hourZhi)) shenShaList.push({ name: '德秀贵人', pillar: '时', type: '吉' });
  }

  // 30. 金神（日柱或时柱见之）
  if (JIN_SHEN.includes(dayGanZhi)) shenShaList.push({ name: '金神', pillar: '日', type: '中性' });
  if (JIN_SHEN.includes(hourGanZhi)) shenShaList.push({ name: '金神', pillar: '时', type: '中性' });

  // 31. 六秀日（日柱）
  if (LIU_XIU_RI.includes(dayGanZhi)) shenShaList.push({ name: '六秀', pillar: '日', type: '吉' });

  // 32. 十灵日（日柱）
  if (SHI_LING_RI.includes(dayGanZhi)) shenShaList.push({ name: '十灵日', pillar: '日', type: '吉' });

  // 33. 进神（日柱）
  if (JIN_SHEN_RI.includes(dayGanZhi)) shenShaList.push({ name: '进神', pillar: '日', type: '吉' });

  // 34. 日贵（日柱）
  if (RI_GUI.includes(dayGanZhi)) shenShaList.push({ name: '日贵', pillar: '日', type: '吉' });

  // 35. 日德（日柱）
  if (RI_DE.includes(dayGanZhi)) shenShaList.push({ name: '日德', pillar: '日', type: '吉' });

  // 36. 四废（以月支季节查日柱）
  if (monthSeasonKey && SI_FEI[monthSeasonKey]) {
    const siFeiDays = SI_FEI[monthSeasonKey];
    if (siFeiDays.includes(dayGanZhi)) shenShaList.push({ name: '四废', pillar: '日', type: '凶' });
  }

  // 37. 勾绞 - 勾（以年支季节查四柱地支）
  if (yearSeasonKey2 && GOU_JIAO_GOU[yearSeasonKey2]) {
    const gouZhi = GOU_JIAO_GOU[yearSeasonKey2];
    if (gouZhi === yearZhi) shenShaList.push({ name: '勾煞', pillar: '年', type: '凶' });
    if (gouZhi === monthZhi) shenShaList.push({ name: '勾煞', pillar: '月', type: '凶' });
    if (gouZhi === dayZhi) shenShaList.push({ name: '勾煞', pillar: '日', type: '凶' });
    if (gouZhi === hourZhi) shenShaList.push({ name: '勾煞', pillar: '时', type: '凶' });
  }

  // 38. 勾绞 - 绞（以年支季节查四柱地支）
  if (yearSeasonKey2 && GOU_JIAO_JIAO[yearSeasonKey2]) {
    const jiaoZhi = GOU_JIAO_JIAO[yearSeasonKey2];
    if (jiaoZhi === yearZhi) shenShaList.push({ name: '绞煞', pillar: '年', type: '凶' });
    if (jiaoZhi === monthZhi) shenShaList.push({ name: '绞煞', pillar: '月', type: '凶' });
    if (jiaoZhi === dayZhi) shenShaList.push({ name: '绞煞', pillar: '日', type: '凶' });
    if (jiaoZhi === hourZhi) shenShaList.push({ name: '绞煞', pillar: '时', type: '凶' });
  }

  // 39. 亡神（以年支/日支三合局查四柱地支）
  if (yearSanHeKey && WANG_SHEN[yearSanHeKey]) {
    const wsZhi = WANG_SHEN[yearSanHeKey];
    if (wsZhi === yearZhi) shenShaList.push({ name: '亡神', pillar: '年', type: '凶' });
    if (wsZhi === monthZhi) shenShaList.push({ name: '亡神', pillar: '月', type: '凶' });
    if (wsZhi === dayZhi) shenShaList.push({ name: '亡神', pillar: '日', type: '凶' });
    if (wsZhi === hourZhi) shenShaList.push({ name: '亡神', pillar: '时', type: '凶' });
  }

  // 40. 六厄（以年支三合局查四柱地支）
  if (yearSanHeKey && LIU_E[yearSanHeKey]) {
    const leZhi = LIU_E[yearSanHeKey];
    if (leZhi === yearZhi) shenShaList.push({ name: '六厄', pillar: '年', type: '凶' });
    if (leZhi === monthZhi) shenShaList.push({ name: '六厄', pillar: '月', type: '凶' });
    if (leZhi === dayZhi) shenShaList.push({ name: '六厄', pillar: '日', type: '凶' });
    if (leZhi === hourZhi) shenShaList.push({ name: '六厄', pillar: '时', type: '凶' });
  }

  // 41. 天刑（以年支三合局查四柱地支）
  if (yearSanHeKey && TIAN_XING[yearSanHeKey]) {
    const txZhi2 = TIAN_XING[yearSanHeKey];
    if (txZhi2 === yearZhi) shenShaList.push({ name: '天刑', pillar: '年', type: '凶' });
    if (txZhi2 === monthZhi) shenShaList.push({ name: '天刑', pillar: '月', type: '凶' });
    if (txZhi2 === dayZhi) shenShaList.push({ name: '天刑', pillar: '日', type: '凶' });
    if (txZhi2 === hourZhi) shenShaList.push({ name: '天刑', pillar: '时', type: '凶' });
  }

  // 42. 地刑（以年支三合局查四柱地支）
  if (yearSanHeKey && DI_XING[yearSanHeKey]) {
    const dxZhi = DI_XING[yearSanHeKey];
    if (dxZhi === yearZhi) shenShaList.push({ name: '地刑', pillar: '年', type: '凶' });
    if (dxZhi === monthZhi) shenShaList.push({ name: '地刑', pillar: '月', type: '凶' });
    if (dxZhi === dayZhi) shenShaList.push({ name: '地刑', pillar: '日', type: '凶' });
    if (dxZhi === hourZhi) shenShaList.push({ name: '地刑', pillar: '时', type: '凶' });
  }

  // 43. 丧门（以年支查四柱地支）
  const sangMenZhi = SANG_MEN[yearZhi];
  if (sangMenZhi) {
    if (sangMenZhi === yearZhi) shenShaList.push({ name: '丧门', pillar: '年', type: '凶' });
    if (sangMenZhi === monthZhi) shenShaList.push({ name: '丧门', pillar: '月', type: '凶' });
    if (sangMenZhi === dayZhi) shenShaList.push({ name: '丧门', pillar: '日', type: '凶' });
    if (sangMenZhi === hourZhi) shenShaList.push({ name: '丧门', pillar: '时', type: '凶' });
  }

  // 44. 吊客（以年支查四柱地支）
  const diaoKeZhi = DIAO_KE[yearZhi];
  if (diaoKeZhi) {
    if (diaoKeZhi === yearZhi) shenShaList.push({ name: '吊客', pillar: '年', type: '凶' });
    if (diaoKeZhi === monthZhi) shenShaList.push({ name: '吊客', pillar: '月', type: '凶' });
    if (diaoKeZhi === dayZhi) shenShaList.push({ name: '吊客', pillar: '日', type: '凶' });
    if (diaoKeZhi === hourZhi) shenShaList.push({ name: '吊客', pillar: '时', type: '凶' });
  }

  // 45. 披麻（以年支查四柱地支）
  const piMaZhi = PI_MA[yearZhi];
  if (piMaZhi) {
    if (piMaZhi === yearZhi) shenShaList.push({ name: '披麻', pillar: '年', type: '凶' });
    if (piMaZhi === monthZhi) shenShaList.push({ name: '披麻', pillar: '月', type: '凶' });
    if (piMaZhi === dayZhi) shenShaList.push({ name: '披麻', pillar: '日', type: '凶' });
    if (piMaZhi === hourZhi) shenShaList.push({ name: '披麻', pillar: '时', type: '凶' });
  }

  // 46. 血刃（以月支查四柱地支）
  const xueRenZhi = XUE_REN[monthZhi];
  if (xueRenZhi) {
    if (xueRenZhi === yearZhi) shenShaList.push({ name: '血刃', pillar: '年', type: '凶' });
    if (xueRenZhi === monthZhi) shenShaList.push({ name: '血刃', pillar: '月', type: '凶' });
    if (xueRenZhi === dayZhi) shenShaList.push({ name: '血刃', pillar: '日', type: '凶' });
    if (xueRenZhi === hourZhi) shenShaList.push({ name: '血刃', pillar: '时', type: '凶' });
  }

  // 47. 指背（以年支查四柱地支）
  const zhiBeiZhi = ZHI_BEI[yearZhi];
  if (zhiBeiZhi) {
    if (zhiBeiZhi === yearZhi) shenShaList.push({ name: '指背', pillar: '年', type: '凶' });
    if (zhiBeiZhi === monthZhi) shenShaList.push({ name: '指背', pillar: '月', type: '凶' });
    if (zhiBeiZhi === dayZhi) shenShaList.push({ name: '指背', pillar: '日', type: '凶' });
    if (zhiBeiZhi === hourZhi) shenShaList.push({ name: '指背', pillar: '时', type: '凶' });
  }

  // 48. 隔角（以年支查四柱地支）
  const geJiaoZhi = GE_JIAO[yearZhi];
  if (geJiaoZhi) {
    if (geJiaoZhi === yearZhi) shenShaList.push({ name: '隔角', pillar: '年', type: '凶' });
    if (geJiaoZhi === monthZhi) shenShaList.push({ name: '隔角', pillar: '月', type: '凶' });
    if (geJiaoZhi === dayZhi) shenShaList.push({ name: '隔角', pillar: '日', type: '凶' });
    if (geJiaoZhi === hourZhi) shenShaList.push({ name: '隔角', pillar: '时', type: '凶' });
  }

  // 49. 八专（日柱）
  if (BA_ZHUAN.includes(dayGanZhi)) shenShaList.push({ name: '八专', pillar: '日', type: '中性' });

  // 50. 九丑（日柱）
  if (JIU_CHOU.includes(dayGanZhi)) shenShaList.push({ name: '九丑', pillar: '日', type: '凶' });

  // 51. 阴差阳错（日柱）
  if (YIN_CHA_YANG_CUO.includes(dayGanZhi)) shenShaList.push({ name: '阴差阳错', pillar: '日', type: '凶' });

  // 52. 天火煞（以月支查四柱地支）
  const tianHuoZhi = TIAN_HUO[monthZhi];
  if (tianHuoZhi) {
    if (tianHuoZhi === yearZhi) shenShaList.push({ name: '天火', pillar: '年', type: '凶' });
    if (tianHuoZhi === monthZhi) shenShaList.push({ name: '天火', pillar: '月', type: '凶' });
    if (tianHuoZhi === dayZhi) shenShaList.push({ name: '天火', pillar: '日', type: '凶' });
    if (tianHuoZhi === hourZhi) shenShaList.push({ name: '天火', pillar: '时', type: '凶' });
  }

  // 53. 地火煞（以月支查四柱地支）
  const diHuoZhi = DI_HUO[monthZhi];
  if (diHuoZhi) {
    if (diHuoZhi === yearZhi) shenShaList.push({ name: '地火', pillar: '年', type: '凶' });
    if (diHuoZhi === monthZhi) shenShaList.push({ name: '地火', pillar: '月', type: '凶' });
    if (diHuoZhi === dayZhi) shenShaList.push({ name: '地火', pillar: '日', type: '凶' });
    if (diHuoZhi === hourZhi) shenShaList.push({ name: '地火', pillar: '时', type: '凶' });
  }

  // 54. 天狗煞（以月支查四柱地支）
  const tianGouZhi = TIAN_GOU[monthZhi];
  if (tianGouZhi) {
    if (tianGouZhi === yearZhi) shenShaList.push({ name: '天狗', pillar: '年', type: '凶' });
    if (tianGouZhi === monthZhi) shenShaList.push({ name: '天狗', pillar: '月', type: '凶' });
    if (tianGouZhi === dayZhi) shenShaList.push({ name: '天狗', pillar: '日', type: '凶' });
    if (tianGouZhi === hourZhi) shenShaList.push({ name: '天狗', pillar: '时', type: '凶' });
  }

  // 55. 伏吟（四柱地支中任意两柱相同）
  const zhiList = [yearZhi, monthZhi, dayZhi, hourZhi];
  const zhiCount = {};
  zhiList.forEach(z => { zhiCount[z] = (zhiCount[z] || 0) + 1; });
  for (const [zhi, count] of Object.entries(zhiCount)) {
    if (count >= 2) {
      const pillars = [];
      if (yearZhi === zhi) pillars.push('年');
      if (monthZhi === zhi) pillars.push('月');
      if (dayZhi === zhi) pillars.push('日');
      if (hourZhi === zhi) pillars.push('时');
      shenShaList.push({ name: `伏吟(${zhi})`, pillar: pillars.join('/'), type: '凶' });
    }
  }

  // 去重：同名称+同柱位只保留一条
  const seen = new Set();
  return shenShaList.filter(item => {
    const key = `${item.name}|${item.pillar}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ==================== 9. 大运计算 ====================

/**
 * 起运岁数计算
 * 阳男阴女顺排，从出生日到下一个节（或上一个节）
 * 3天 = 1岁，1天 = 4个月，1时辰 = 10天
 */
function calculateQiYunAge(yearGan, gender, year, month, day, hour) {
  const yearYY = YIN_YANG[yearGan];
  const isShunPai = (gender === '男' && yearYY === '阳') || (gender === '女' && yearYY === '阴');
  
  const jieQi = getYearJieQi(year);
  if (!jieQi) return 1;
  
  // 找到当前所处的节气区间，然后确定目标节气
  let targetJieQi = null;
  let targetYear = year;
  
  if (isShunPai) {
    // 顺排：找下一个"节"（偶数索引的节气）
    for (let i = 0; i < 24; i++) {
      const jq = jieQi[i];
      if (isBeforeJieQi(month, day, hour, 0, jq.m, jq.d, jq.h)) {
        // 出生在这个节气之前，这个节就是下一个节
        // 需要找偶数索引（节），如果当前是奇数索引（气），找下一个偶数
        if (i % 2 === 0) {
          targetJieQi = jq;
        } else if (i + 1 < 24) {
          targetJieQi = jieQi[i + 1];
        }
        break;
      }
    }
    // 如果在当年所有节气之后，查下一年第一个节（立春 = index 2）
    if (!targetJieQi) {
      const nextJieQi = getYearJieQi(year + 1);
      if (nextJieQi) {
        targetJieQi = nextJieQi[2]; // 下一年立春
        targetYear = year + 1;
      }
    }
  } else {
    // 逆排：找上一个"节"
    for (let i = 23; i >= 0; i--) {
      const jq = jieQi[i];
      if (isAfterOrEqualJieQi(month, day, hour, 0, jq.m, jq.d, jq.h)) {
        // 出生在这个节气之后（含当天），这个节就是上一个节
        if (i % 2 === 0) {
          targetJieQi = jq;
        } else if (i - 1 >= 0) {
          targetJieQi = jieQi[i - 1];
        }
        break;
      }
    }
    // 如果在当年所有节气之前，查上一年最后一个节（大雪 = index 22）
    if (!targetJieQi) {
      const prevJieQi = getYearJieQi(year - 1);
      if (prevJieQi) {
        targetJieQi = prevJieQi[22]; // 上一年大雪
        targetYear = year - 1;
      }
    }
  }
  
  if (!targetJieQi) return 1;
  
  // 计算出生日期到目标节气的天数差
  const birthDate = new Date(year, month - 1, day, hour);
  const targetDate = new Date(targetYear, targetJieQi.m - 1, targetJieQi.d, targetJieQi.h);
  
  // 防御：无效日期检查
  if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) return 1;
  
  const diffMs = Math.abs(targetDate - birthDate);
  const daysDiff = diffMs / (1000 * 60 * 60 * 24);
  
  // 3天=1岁
  const age = daysDiff / 3;
  var result = Math.round(age * 10) / 10;
  if (isNaN(result)) result = 1;
  return result;
}

/**
 * 大运列表：从月柱起，顺排或逆排
 */
function getDaYun(yearGan, monthPillar, gender, year, month, day, hour) {
  const yearYY = YIN_YANG[yearGan];
  const isShunPai = (gender === '男' && yearYY === '阳') || (gender === '女' && yearYY === '阴');
  
  const monthGan = monthPillar.gan;
  const monthZhi = monthPillar.zhi;
  const ganIndex = TIAN_GAN.indexOf(monthGan);
  const zhiIndex = DI_ZHI.indexOf(monthZhi);
  
  const qiYunAge = calculateQiYunAge(yearGan, gender, year, month, day, hour);
  
  const daYunList = [];
  for (let i = 1; i <= 8; i++) {
    const newGanIndex = isShunPai ? (ganIndex + i) % 10 : (ganIndex - i + 10) % 10;
    const newZhiIndex = isShunPai ? (zhiIndex + i) % 12 : (zhiIndex - i + 12) % 12;
    
    daYunList.push({
      ganZhi: TIAN_GAN[newGanIndex] + DI_ZHI[newZhiIndex],
      gan: TIAN_GAN[newGanIndex],
      zhi: DI_ZHI[newZhiIndex],
      age: Math.round(qiYunAge + (i - 1) * 10),
      year: year + Math.round(qiYunAge + (i - 1) * 10)
    });
  }
  
  return { qiYunAge, daYunList, isShunPai };
}

// ==================== 10. 流年排盘 ====================

/**
 * 计算某流年的四柱
 * 流年只用年柱和月柱（简化版）
 */
function getLiuNian(targetYear) {
  const yearIndex = ((targetYear - 4) % 60 + 60) % 60;
  return {
    year: targetYear,
    yearGanZhi: SIXTY_JIAZI[yearIndex],
    yearGan: TIAN_GAN[yearIndex % 10],
    yearZhi: DI_ZHI[yearIndex % 12]
  };
}

// ==================== 11. 完整排盘入口 ====================

/**
 * 解读主函数
 * @param {Object} params - { year, month, day, hour, gender }
 * @returns {Object} 完整解读结果
 */
function paipan({ year, month, day, hour, gender }) {
  // 参数验证
  if (!year || !month || !day || hour === undefined || !gender) {
    throw new Error('参数不完整：需要 year, month, day, hour, gender');
  }
  if (!['男', '女'].includes(gender)) {
    throw new Error('性别参数错误：只支持 "男" 或 "女"');
  }
  
  // Step 1: 年柱
  const yearPillar = getYearPillar(year, month, day, hour);
  
  // Step 2: 月柱（year使用原始公历年，用于查节气）
  const monthPillar = getMonthPillar(yearPillar.gan, year, month, day, hour);
  
  // Step 3: 日柱
  const dayPillar = getDayPillar(year, month, day);
  
  // Step 4: 时柱
  const hourPillar = getHourPillar(dayPillar.gan, hour);
  
  // Step 5: 组装四柱
  const riGan = dayPillar.gan;
  const dayIndex60 = dayPillar.index;
  const xunStart = Math.floor(dayIndex60 / 10) * 10;
  const kongWangZhi = KONG_WANG[xunStart] || [];

  function buildPillar(name, ganZhi, gan, zhi, index, extra = {}) {
    const naYin = getNaYin(index !== undefined ? index : SIXTY_JIAZI.indexOf(ganZhi));
    const cangGan = getCangGan(zhi).map(g => ({ gan: g, shiShen: getShiShen(riGan, g) }));
    const xingYun = SHI_ER_CHANG_SHENG[riGan] ? (SHI_ER_CHANG_SHENG[riGan][zhi] || '') : '';
    const ziZuo = SHI_ER_CHANG_SHENG[gan] ? (SHI_ER_CHANG_SHENG[gan][zhi] || '') : '';
    const isKongWang = kongWangZhi.includes(zhi);
    return {
      name,
      ganZhi,
      gan,
      zhi,
      shiShen: name === '日柱' ? '日主' : getShiShen(riGan, gan),
      wuXing: getWuXing(gan),
      yinYang: YIN_YANG[gan],
      ganColor: GAN_ZHI_COLOR[gan] || '#333',
      zhiColor: GAN_ZHI_COLOR[zhi] || '#333',
      cangGan: cangGan.map(cg => ({ ...cg, color: GAN_ZHI_COLOR[cg.gan] || '#333' })),
      naYin,
      xingYun,
      ziZuo,
      isKongWang,
      ...extra
    };
  }

  const pillars = [
    buildPillar('年柱', yearPillar.ganZhi, yearPillar.gan, yearPillar.zhi, yearPillar.index),
    buildPillar('月柱', monthPillar.ganZhi, monthPillar.gan, monthPillar.zhi, SIXTY_JIAZI.indexOf(monthPillar.ganZhi), { monthName: monthPillar.monthName }),
    buildPillar('日柱', dayPillar.ganZhi, dayPillar.gan, dayPillar.zhi, dayPillar.index, { isDayMaster: true }),
    buildPillar('时柱', hourPillar.ganZhi, hourPillar.gan, hourPillar.zhi, SIXTY_JIAZI.indexOf(hourPillar.ganZhi), { shiChen: hourPillar.shiChenName })
  ];
  
  // Step 6: 大运
  const daYunResult = getDaYun(yearPillar.gan, monthPillar, gender, year, month, day, hour);
  
  // Step 7: 神煞
  const shenSha = getShenSha(
    yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi,
    dayPillar.gan, yearPillar.gan, monthPillar.gan, hourPillar.gan, gender
  );
  
  // Step 8: 当前流年
  const currentYear = new Date().getFullYear();
  const liuNian = getLiuNian(currentYear);
  
  // Step 9: 日主五行强弱简评
  const riWx = getWuXing(dayPillar.gan);
  const wxCount = {};
  pillars.forEach(p => {
    const wx = p.wuXing;
    wxCount[wx] = (wxCount[wx] || 0) + 1;
    if (p.cangGan) {
      p.cangGan.forEach(cg => {
        const cgWx = getWuXing(cg.gan);
        wxCount[cgWx] = (wxCount[cgWx] || 0) + 0.5;
      });
    }
  });
  
  // 月令旺衰
  const monthZhi = monthPillar.zhi;
  const monthWuXing = getWuXing(monthZhi);
  const isMonthLing = riWx === monthWuXing;

  // Step 10: 干支关系
  const pillarRelations = getPillarRelations(pillars);

  // Step 11: 核心能量偏向判定
  const yongShen = getYongShen({
    riWuXing: riWx,
    wuXingStats: wxCount,
    monthZhi: monthZhi,
    pillars: pillars,
    isMonthLing: isMonthLing
  });

  // Step 12: 格局判定
  const geJu = getGeJu({
    pillars: pillars,
    riGan: dayPillar.gan,
    monthZhi: monthZhi
  });

  // 日主对象（供深度分析和返回数据共用）
  const riZhuObj = {
    ganZhi: dayPillar.ganZhi,
    gan: dayPillar.gan,
    zhi: dayPillar.zhi,
    wuXing: riWx,
    yinYang: YIN_YANG[dayPillar.gan]
  };

  // 深度分析参数（供专属解读页按需懒加载计算，避免首页超时）
  const _deepAnalysisParams = {
    pillars: pillars,
    riZhu: riZhuObj,
    yongShen: yongShen,
    geJu: geJu,
    pillarRelations: pillarRelations,
    wuXingStats: wxCount,
    daYun: daYunResult,
    shenShaByPillar: {
      year: shenSha.filter(s => s.pillar.includes('年')).map(s => s.name),
      month: shenSha.filter(s => s.pillar.includes('月')).map(s => s.name),
      day: shenSha.filter(s => s.pillar.includes('日')).map(s => s.name),
      hour: shenSha.filter(s => s.pillar.includes('时')).map(s => s.name),
      global: shenSha.filter(s => s.pillar === '全局').map(s => s.name)
    }
  };
  
  const resultData = {
    // 基本信息
    input: { year, month, day, hour, gender },
    
    // 八字
    baZi: `${yearPillar.ganZhi} ${monthPillar.ganZhi} ${dayPillar.ganZhi} ${hourPillar.ganZhi}`,
    baZiShort: `${yearPillar.ganZhi}${monthPillar.ganZhi}${dayPillar.ganZhi}${hourPillar.ganZhi}`,
    
    // 四柱详情
    pillars,
    
    // 日主
    riZhu: riZhuObj,
    
    // 大运
    daYun: daYunResult,
    
    // 神煞（按柱位分组）
    shenSha,
    shenShaByPillar: {
      year: shenSha.filter(s => s.pillar.includes('年')).map(s => s.name),
      month: shenSha.filter(s => s.pillar.includes('月')).map(s => s.name),
      day: shenSha.filter(s => s.pillar.includes('日')).map(s => s.name),
      hour: shenSha.filter(s => s.pillar.includes('时')).map(s => s.name),
      global: shenSha.filter(s => s.pillar === '全局').map(s => s.name)
    },

    // 当前流年
    currentLiuNian: liuNian,
    
    // 五行统计
    wuXingStats: wxCount,
    monthLing: monthWuXing,
    isMonthLing,

    // 深度分析参数（懒加载）
    pillarRelations: pillarRelations,
    yongShen: yongShen,
    geJu: geJu,
    _deepAnalysisParams: _deepAnalysisParams,
    
    // 排盘元数据
    meta: {
      algorithm: 'bazi-engine-v2.0',
      calendarRange: '1900-2100',
      timestamp: new Date().toISOString()
    }
  };

  return resultData;
}

/**
 * 获取指定流年的详细排盘
 */
function getLiuNianDetail(baZiResult, targetYear) {
  const liuNian = getLiuNian(targetYear);
  const riGan = baZiResult.riZhu.gan;
  
  return {
    ...liuNian,
    shiShen: getShiShen(riGan, liuNian.yearGan),
    wuXing: getWuXing(liuNian.yearGan),
    // 与大运的关系
    daYunInteraction: baZiResult.daYun.daYunList.find(d => d.year <= targetYear && d.year + 9 >= targetYear) || null
  };
}

// ==================== 12. 干支关系（合冲刑害） ====================

/**
 * 天干五合
 * 甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火
 */
const GAN_HE = {
  '甲': { he: '己', hua: '土' },
  '己': { he: '甲', hua: '土' },
  '乙': { he: '庚', hua: '金' },
  '庚': { he: '乙', hua: '金' },
  '丙': { he: '辛', hua: '水' },
  '辛': { he: '丙', hua: '水' },
  '丁': { he: '壬', hua: '木' },
  '壬': { he: '丁', hua: '木' },
  '戊': { he: '癸', hua: '火' },
  '癸': { he: '戊', hua: '火' }
};

/**
 * 地支六合
 * 子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合日月
 */
const ZHI_LIU_HE = {
  '子': { he: '丑', hua: '土' },
  '丑': { he: '子', hua: '土' },
  '寅': { he: '亥', hua: '木' },
  '亥': { he: '寅', hua: '木' },
  '卯': { he: '戌', hua: '火' },
  '戌': { he: '卯', hua: '火' },
  '辰': { he: '酉', hua: '金' },
  '酉': { he: '辰', hua: '金' },
  '巳': { he: '申', hua: '水' },
  '申': { he: '巳', hua: '水' },
  '午': { he: '未', hua: '日月' },
  '未': { he: '午', hua: '日月' }
};

/**
 * 地支三合
 */
const ZHI_SAN_HE = {
  '申子辰': '水局',
  '亥卯未': '木局',
  '寅午戌': '火局',
  '巳酉丑': '金局'
};

/**
 * 地支六冲
 */
const ZHI_LIU_CHONG = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳'
};

/**
 * 地支相刑
 */
const ZHI_XING = {
  '寅': ['巳'], '巳': ['申','寅'], '申': ['寅'],  // 寅巳申三刑
  '丑': ['戌'], '戌': ['未'], '未': ['丑'],        // 丑戌未三刑
  '子': ['卯'], '卯': ['子'],                        // 子卯刑
  '辰': ['辰'], '午': ['午'], '酉': ['酉'], '亥': ['亥']  // 自刑
};

/**
 * 地支相害
 */
const ZHI_HAI = {
  '子': ['未'], '未': ['子'],
  '丑': ['午'], '午': ['丑'],
  '寅': ['巳'], '巳': ['寅'],
  '卯': ['辰'], '辰': ['卯'],
  '申': ['亥'], '亥': ['申'],
  '酉': ['戌'], '戌': ['酉']
};

/**
 * 计算四柱之间的干支关系
 * @param {Array} pillars - 四柱数组
 * @returns {Object} 合冲刑害结果
 */
function getPillarRelations(pillars) {
  // 柱位名
  const posNames = ['年柱', '月柱', '日柱', '时柱'];

  // 收集所有天干和地支的位置
  var ganPositions = [];  // [{gan, pos, pillarName}]
  var zhiPositions = [];  // [{zhi, pos, pillarName}]
  for (var i = 0; i < pillars.length; i++) {
    ganPositions.push({ gan: pillars[i].gan, pos: i, name: posNames[i] });
    zhiPositions.push({ zhi: pillars[i].zhi, pos: i, name: posNames[i] });
  }

  var relations = {
    ganHe: [],       // 天干合
    zhiLiuHe: [],    // 地支六合
    zhiSanHe: [],    // 地支三合
    zhiLiuChong: [], // 地支六冲
    zhiXing: [],     // 地支相刑
    zhiHai: [],      // 地支相害
    summary: ''      // 综合概述
  };

  // 天干五合
  for (var i = 0; i < ganPositions.length; i++) {
    for (var j = i + 1; j < ganPositions.length; j++) {
      var a = ganPositions[i];
      var b = ganPositions[j];
      var heInfo = GAN_HE[a.gan];
      if (heInfo && heInfo.he === b.gan) {
        relations.ganHe.push({
          gan1: a.gan, gan2: b.gan,
          pos1: a.name, pos2: b.name,
          hua: heInfo.hua,
          desc: a.name + '(' + a.gan + ')与' + b.name + '(' + b.gan + ')天干五合，化' + heInfo.hua
        });
      }
    }
  }

  // 地支六合
  for (var i = 0; i < zhiPositions.length; i++) {
    for (var j = i + 1; j < zhiPositions.length; j++) {
      var a = zhiPositions[i];
      var b = zhiPositions[j];
      var heInfo = ZHI_LIU_HE[a.zhi];
      if (heInfo && heInfo.he === b.zhi) {
        relations.zhiLiuHe.push({
          zhi1: a.zhi, zhi2: b.zhi,
          pos1: a.name, pos2: b.name,
          hua: heInfo.hua,
          desc: a.name + '与' + b.name + '地支六合，化' + heInfo.hua
        });
      }
    }
  }

  // 地支三合（需要三个地支全部出现）
  var allZhi = zhiPositions.map(function(z) { return z.zhi; });
  for (var key in ZHI_SAN_HE) {
    var parts = key.split(''); // 申子辰 → ['申','子','辰']
    if (parts.length === 3) {
      var found = parts.every(function(z) { return allZhi.indexOf(z) >= 0; });
      if (found) {
        relations.zhiSanHe.push({
          zhi: parts,
          hua: ZHI_SAN_HE[key],
          desc: '地支' + parts.join('') + '三合' + ZHI_SAN_HE[key]
        });
      }
    }
  }

  // 地支六冲
  for (var i = 0; i < zhiPositions.length; i++) {
    for (var j = i + 1; j < zhiPositions.length; j++) {
      var a = zhiPositions[i];
      var b = zhiPositions[j];
      if (ZHI_LIU_CHONG[a.zhi] === b.zhi) {
        relations.zhiLiuChong.push({
          zhi1: a.zhi, zhi2: b.zhi,
          pos1: a.name, pos2: b.name,
          desc: a.name + '与' + b.name + '地支六冲(' + a.zhi + b.zhi + '冲)'
        });
      }
    }
  }

  // 地支相刑
  for (var i = 0; i < zhiPositions.length; i++) {
    for (var j = i + 1; j < zhiPositions.length; j++) {
      var xingList = ZHI_XING[zhiPositions[i].zhi] || [];
      if (xingList.indexOf(zhiPositions[j].zhi) >= 0) {
        relations.zhiXing.push({
          zhi1: zhiPositions[i].zhi, zhi2: zhiPositions[j].zhi,
          pos1: zhiPositions[i].name, pos2: zhiPositions[j].name,
          desc: zhiPositions[i].name + '与' + zhiPositions[j].name + '克制'
        });
      }
    }
  }

  // 地支相害
  for (var i = 0; i < zhiPositions.length; i++) {
    for (var j = i + 1; j < zhiPositions.length; j++) {
      var haiList = ZHI_HAI[zhiPositions[i].zhi] || [];
      if (haiList.indexOf(zhiPositions[j].zhi) >= 0) {
        relations.zhiHai.push({
          zhi1: zhiPositions[i].zhi, zhi2: zhiPositions[j].zhi,
          pos1: zhiPositions[i].name, pos2: zhiPositions[j].name,
          desc: zhiPositions[i].name + '与' + zhiPositions[j].name + '相害'
        });
      }
    }
  }

  // 综合概述
  var summaryParts = [];
  if (relations.ganHe.length > 0) summaryParts.push('天干有合(' + relations.ganHe.length + '处)');
  if (relations.zhiLiuHe.length > 0) summaryParts.push('地支有合(' + relations.zhiLiuHe.length + '处)');
  if (relations.zhiLiuChong.length > 0) summaryParts.push('地支有冲(' + relations.zhiLiuChong.length + '处)');
  if (relations.zhiXing.length > 0) summaryParts.push('地支有刑(' + relations.zhiXing.length + '处)');
  if (relations.zhiHai.length > 0) summaryParts.push('地支有害(' + relations.zhiHai.length + '处)');
  if (relations.zhiSanHe.length > 0) summaryParts.push('地支三合' + relations.zhiSanHe[0].hua);

  if (summaryParts.length === 0) {
    relations.summary = '四柱干支安静，无合冲刑害，特质组合清纯。';
  } else {
    relations.summary = '特质组合' + summaryParts.join('，') + '。';
    // 补充解读：冲多主动荡、合多主人缘
    var chongCount = relations.zhiLiuChong.length;
    var heCount = relations.ganHe.length + relations.zhiLiuHe.length + relations.zhiSanHe.length;
    if (chongCount > 0 && heCount > 0) {
      relations.summary += '合冲并存，人生起伏中亦有贵人相助。';
    } else if (chongCount > 1) {
      relations.summary += '冲多主动，一生多有变动，宜随遇而安。';
    } else if (heCount > 1) {
      relations.summary += '合多人缘佳，善于协调合作，然亦需保持独立判断。';
    }
  }

  return relations;
}

// ==================== 13. 核心能量偏向判定 ====================

/**
 * 核心能量偏向综合判定
 * 1. 扶抑核心能量偏向：身强宜泄耗(食伤→财→官杀)，身弱宜生扶(印→比劫)
 * 2. 平衡状态核心能量偏向：冬喜火暖、夏喜水润、春喜金裁、秋喜木舒
 * 3. 辅助避免继续强化忌神
 * 
 * @param {Object} params - { riWuXing, wuXingStats, monthZhi, pillars, isMonthLing }
 * @returns {Object} 核心能量偏向分析结果
 */
function getYongShen(params) {
  var riWuXing = params.riWuXing;
  var wuXingStats = params.wuXingStats;
  var monthZhi = params.monthZhi;
  var pillars = params.pillars;
  var isMonthLing = params.isMonthLing;

  // 日主自身力量
  var selfPower = wuXingStats[riWuXing] || 0;

  // 五行数组
  var allWuXing = ['木', '火', '土', '金', '水'];
  var riIndex = allWuXing.indexOf(riWuXing);

  // 生克关系
  var shengWo = allWuXing[(riIndex + 4) % 5]; // 生我=印
  var woSheng = allWuXing[(riIndex + 1) % 5]; // 我生=食伤
  var keWo = allWuXing[(riIndex + 3) % 5];    // 克我=官杀
  var woKe = allWuXing[(riIndex + 2) % 5];    // 我克=财

  // 各五行力量
  var wxPower = {};
  allWuXing.forEach(function(wx) {
    wxPower[wx] = wuXingStats[wx] || 0;
  });

  // === 1. 扶抑核心能量偏向 ===
  var yongShen = [];
  var jiShen = [];
  var xianShen = [];

  if (selfPower >= 4) {
    // 身强 → 喜泄耗
    yongShen.push(woSheng);  // 食伤泄秀最喜
    yongShen.push(woKe);     // 财耗
    yongShen.push(keWo);     // 官杀制
    // 忌生扶
    jiShen.push(shengWo);    // 忌印再生
    jiShen.push(riWuXing);   // 忌比劫帮扶
    xianShen.push(riWuXing);
  } else if (selfPower >= 2.5) {
    // 中和偏强 → 略喜泄耗
    yongShen.push(woSheng);
    yongShen.push(woKe);
    jiShen.push(riWuXing);
    xianShen.push(riWuXing);
  } else if (selfPower >= 1.5) {
    // 中和偏弱 → 喜生扶
    yongShen.push(shengWo);  // 印生最喜
    yongShen.push(riWuXing); // 比劫帮
    jiShen.push(keWo);       // 忌官杀克
    jiShen.push(woKe);       // 忌财耗
    xianShen.push(keWo);
  } else {
    // 身弱 → 急需帮扶
    yongShen.push(shengWo);
    yongShen.push(riWuXing);
    jiShen.push(keWo);
    jiShen.push(woKe);
    jiShen.push(woSheng);
    xianShen.push(keWo);
    xianShen.push(woKe);
  }

  // === 2. 平衡状态核心能量偏向 ===
  var tiaoHou = null;
  var tiaoHouDesc = '';
  var seasonZhi = monthZhi;
  if (['亥','子','丑'].indexOf(seasonZhi) >= 0) {
    tiaoHou = '火';
    tiaoHouDesc = '寒冬水冷，急需火来暖局平衡状态，使五行流通。';
  } else if (['巳','午','未'].indexOf(seasonZhi) >= 0) {
    tiaoHou = '水';
    tiaoHouDesc = '盛夏火炎，需水润燥降温，水火既济方为美。';
  } else if (['寅','卯','辰'].indexOf(seasonZhi) >= 0) {
    tiaoHou = '金';
    tiaoHouDesc = '春木旺盛，需金裁剪以防过盛无制。';
  } else if (['申','酉','戌'].indexOf(seasonZhi) >= 0) {
    tiaoHou = '木';
    tiaoHouDesc = '秋金肃杀，需木疏土生火以通五行之气。';
  }

  // 平衡状态核心能量偏向优先级处理：如果平衡状态与扶抑核心能量偏向一致则强化，如果平衡状态是忌神则降低权重
  var tiaoHouInYong = yongShen.indexOf(tiaoHou) >= 0;
  var tiaoHouInJi = jiShen.indexOf(tiaoHou) >= 0;

  if (tiaoHou && !tiaoHouInYong && !tiaoHouInJi) {
    // 平衡状态既非用也非忌，加入用神
    yongShen.unshift(tiaoHou);
  }
  if (tiaoHou && tiaoHouInJi) {
    tiaoHouDesc += '（注：平衡状态需' + tiaoHou + '，但与扶抑忌神冲突，大运流年逢之为利弊参半）';
  }

  // === 3. 病药核心能量偏向（找出最威胁日主的五行） ===
  var sickElement = null;
  var sickDesc = '';
  var maxJiPower = 0;
  for (var k = 0; k < jiShen.length; k++) {
    var power = wxPower[jiShen[k]] || 0;
    if (power > maxJiPower) {
      maxJiPower = power;
      sickElement = jiShen[k];
    }
  }
  if (sickElement && maxJiPower >= 2) {
    // 找出能克制病神或化解病神的元素
    var cureElement = null;
    if (sickElement === keWo || sickElement === woKe) {
      // 病在官杀或财 → 以印化解或以食伤克制
      cureElement = shengWo; // 印化官杀、印耗财（通过盗财之气间接缓解）
    } else if (sickElement === woSheng || sickElement === shengWo || sickElement === riWuXing) {
      cureElement = keWo; // 官杀克制比劫食伤
    }
    if (cureElement) {
      sickDesc = '特质组合病在' + sickElement + '过旺，以' + cureElement + '为药。大运流年逢' + cureElement + '之运则为去病之机。';
    }
  }

  // === 4. 通关核心能量偏向（解决相冲矛盾） ===
  var tongGuanList = [];
  var pillarRelations = getPillarRelations(pillars);
  pillarRelations.zhiLiuChong.forEach(function(chong) {
    var wx1 = getWuXing(chong.zhi1);
    var wx2 = getWuXing(chong.zhi2);
    // 找通关元素：生wx1同时也生wx2（即两个五行的共同"母亲"——谁生它们两个？）
    // 木火冲 → 通关需水(水生木且水没有直接关系，需要更细致的分析)
    // 简化：找通关五行 — 这是一个复杂五行算法，简化处理
    // 金木冲(卯酉、寅申) → 水通关
    // 水火冲(子午、巳亥) → 木通关
    // 土水冲(辰戌、丑未) → 金通关
    var set1 = [wx1, wx2].sort().join('');
    var tongGuanMap = {
      '金木': '水',
      '木金': '水',
      '水火': '木',
      '火水': '木',
      '土水': '金',
      '水土': '金'
    };
    var tongGuanWx = tongGuanMap[set1];
    if (tongGuanWx && tongGuanList.indexOf(tongGuanWx) < 0) {
      tongGuanList.push(tongGuanWx);
    }
  });

  // === 5. 综合输出 ===
  // 核心能量偏向去重
  var uniqueYong = [];
  yongShen.forEach(function(wx) {
    if (uniqueYong.indexOf(wx) < 0) uniqueYong.push(wx);
  });
  var uniqueJi = [];
  jiShen.forEach(function(wx) {
    if (uniqueJi.indexOf(wx) < 0) uniqueJi.push(wx);
  });

  // 用神五行对应的行业/方位/颜色
  var wxGuidance = {
    '木': { direction: '东方', color: '青/绿色', industries: '教育、文化、医疗、出版、园林、木艺、中药', trait: '宜培养仁爱之心，拓宽视野，以柔克刚' },
    '火': { direction: '南方', color: '红/紫色', industries: '能源、餐饮、传媒、演艺、互联网、美容、照明', trait: '宜保持热情积极，发挥创造力，注意控制急躁' },
    '土': { direction: '中央/本地', color: '黄/棕色', industries: '房地产、建筑、农业、金融、保险、仓储、顾问', trait: '宜稳重踏实，以诚信立身，注重积累与规划' },
    '金': { direction: '西方', color: '白/金色', industries: '机械、汽车、五金、法律、金融、军警、精密制造', trait: '宜锤炼意志，坚守原则，刚柔并济以成大事' },
    '水': { direction: '北方', color: '黑/蓝色', industries: '物流、旅游、贸易、咨询、科研、水产、医药', trait: '宜灵活变通，智慧处事，沉静中见深远' }
  };

  // 喜核心能量偏向综合描述
  var primaryYong = uniqueYong[0] || '';
  var guide = wxGuidance[primaryYong] || {};
  var yongDesc = '喜用神为' + uniqueYong.join('、') + '。';
  if (primaryYong) {
    yongDesc += '最喜' + primaryYong + '，宜' + guide.direction + '发展，' + guide.color + '有利，适合' + guide.industries + '等领域。' + guide.trait + '。';
  }
  yongDesc += '忌' + uniqueJi.join('、') + '，遇之宜谨慎。';
  if (tiaoHouDesc) yongDesc += tiaoHouDesc;

  return {
    yongShen: uniqueYong,
    jiShen: uniqueJi,
    xianShen: xianShen,
    primaryYong: primaryYong,
    tiaoHou: tiaoHou,
    tiaoHouDesc: tiaoHouDesc,
    sickElement: sickElement,
    sickDesc: sickDesc,
    tongGuan: tongGuanList,
    desc: yongDesc,
    guidance: guide
  };
}

// ==================== 14. 格局判定 ====================

/**
 * 格局判定
 * 以月令为主，看月支藏干透出与否，结合十神定格局
 * 
 * @param {Object} params - { pillars, riGan, monthZhi }
 * @returns {Object} 格局分析
 */
function getGeJu(params) {
  var pillars = params.pillars;
  var riGan = params.riGan;
  var monthZhi = params.monthZhi;

  // 月支藏干
  var monthCangGan = getCangGan(monthZhi);
  var monthPillar = pillars[1]; // 月柱

  // 检查月支藏干是否在天干透出
  var touChuGan = []; // 透出的天干
  var allGan = pillars.map(function(p) { return p.gan; });
  monthCangGan.forEach(function(cg) {
    if (allGan.indexOf(cg) >= 0) {
      touChuGan.push(cg);
    }
  });

  // 格局名称映射（月令本气十神 → 格局名）
  var geJuMap = {
    '正官': '正官格', '七杀': '七杀格',
    '正财': '正财格', '偏财': '偏财格',
    '正印': '正印格', '偏印': '偏印格',
    '食神': '食神格', '伤官': '伤官格'
  };

  // 取月令本气十神
  var monthBenQi = monthCangGan[0]; // 本气
  var monthBenQiShiShen = getShiShen(riGan, monthBenQi);
  var geJu = geJuMap[monthBenQiShiShen] || '';

  // 如果透出其他藏干，可能兼格
  var jianGe = [];
  touChuGan.forEach(function(gan) {
    if (gan !== monthBenQi) {
      var shiShen = getShiShen(riGan, gan);
      var name = geJuMap[shiShen];
      if (name && jianGe.indexOf(name) < 0) {
        jianGe.push(name);
      }
    }
  });

  // 格局描述
  var geJuDescriptions = {
    '正官格': '以正官立格，为人正直守纪，重名节讲原则，适合公职与管理岗位。官星清透则仕途亨通，官多混杂则压力重重。',
    '七杀格': '以七杀立格，果敢刚毅，不畏艰难，有开拓精神。杀需制化——食神制杀为上将，印化杀为权柄，无制则凶危。',
    '正财格': '以正财立格，重视物质基础，勤劳务实，善于经营理财。财星宜藏不宜露，财旺身能任则富裕。',
    '偏财格': '以偏财立格，善于把握机会，慷慨大方，有投资眼光。偏财活跃则财来财去，宜以稳健为基。',
    '正印格': '以正印立格，温厚仁慈，好学博闻，有长辈福荫。印星为贵气，旺则得人敬重，过旺则依赖心重。',
    '偏印格': '以偏印立格，思维独特，悟性高，善于钻研冷门领域。偏印过旺则孤僻多思，宜以正财调和。',
    '食神格': '以食神立格，性情温和，有才艺天赋，善于享受生活。食神制杀为福将，食神生财为富足之基。',
    '伤官格': '以伤官立格，才华横溢，思维敏捷，创造力强。伤官宜配印以收敛锋芒，见官则易生冲突。'
  };

  // 综合判定（考虑身强身弱对格局的影响）
  var geJuDesc = geJuDescriptions[geJu] || '';
  var jianGeDesc = '';
  if (jianGe.length > 0) {
    jianGeDesc = '兼' + jianGe.join('兼') + '，气质更为复杂多元。';
  }

  // 格局高低评价
  var geJuLevel = '';
  if (touChuGan.length >= 2) {
    geJuLevel = '格局多透，层次较高，然亦需大运配合方能发挥。';
  } else if (touChuGan.length === 1) {
    geJuLevel = '格局清透，人生方向明确，专注一域可成大器。';
  } else {
    geJuLevel = '月令藏而不透，格局隐而不显，需大运引出方能显贵。';
  }

  return {
    geJu: geJu,
    jianGe: jianGe,
    geJuDesc: geJuDesc,
    jianGeDesc: jianGeDesc,
    geJuLevel: geJuLevel,
    monthCangGan: monthCangGan,
    touChuGan: touChuGan,
    fullDesc: (geJuDesc + jianGeDesc + geJuLevel)
  };
}

// ==================== 15. 深度综合分析 ====================

/**
 * 爱情婚姻综合分析
 */
function analyzeMarriage(riZhu, pillars, yongShen, allShenSha, keyDaYun, wuXingStats, riGan, riWuXing, geJuType, pillarRelations) {
  var spouseZhi = riZhu.zhi;
  var spouseCangGan = getCangGan(spouseZhi);
  var spouseZhiWx = getWuXing(spouseZhi);
  var isYongSpouse = yongShen.yongShen.indexOf(spouseZhiWx) >= 0;
  var isJiSpouse = yongShen.jiShen.indexOf(spouseZhiWx) >= 0;
  var spousePalaceDesc = '日支' + spouseZhi + '为婚姻宫';
  if (isYongSpouse) spousePalaceDesc += '，五行为喜用（' + spouseZhiWx + '），配偶对命主有助益，婚姻是加分项。';
  else if (isJiSpouse) spousePalaceDesc += '，五行为忌神（' + spouseZhiWx + '），婚后需磨合调适，配偶性格或生活方式与命主有冲突之处。';
  else spousePalaceDesc += '，五行中平，婚姻平淡稳定，配偶缘中等。';
  var spouseShiShen = getShiShen(riGan, spouseZhi);
  var shiShenMarriageMap = {
    '正官': '配偶稳重正直、有责任心，多为传统型伴侣，婚姻结构稳定。',
    '七杀': '配偶个性强势果断、敢作敢为，婚姻中需学会相互包容，忌针锋相对。',
    '正财': '配偶务实顾家，重视物质基础，贤惠持家型。',
    '偏财': '配偶慷慨大方、善交际，财运不错但需注意感情中勿过于现实。',
    '正印': '配偶通情达理、有文化修养，能给予精神支持与温柔守护。',
    '偏印': '配偶思维独特、有专长，需注意沟通方式避免冷战。',
    '食神': '配偶温和善良，会生活懂情趣，婚姻温馨和谐。',
    '伤官': '配偶才华横溢、有个性魅力，但婚姻中需克制情绪化，互留空间。',
    '比肩': '配偶与己相似，相处如知己，但竞争感强，宜共同成长。',
    '劫财': '配偶行动力强，但婚姻中易因金钱或外界因素生变，需信任沟通。'
  };
  var spouseShenDesc = '婚姻宫「' + spouseShiShen + '」，' + (shiShenMarriageMap[spouseShiShen] || '配偶个性鲜明，婚姻经营需双方共同努力。');
  var spouseStars = [];
  pillars.forEach(function(p, i) {
    var ss = getShiShen(riGan, p.gan);
    if (ss === '正财' || ss === '偏财') spouseStars.push({ pillar: ['年','月','日','时'][i], star: ss, loc: '天干' });
    if (ss === '正官' || ss === '七杀') spouseStars.push({ pillar: ['年','月','日','时'][i], star: ss, loc: '天干' });
  });
  var starDesc = '';
  if (spouseStars.length >= 2) starDesc = '配偶星多现（' + spouseStars.map(function(s){return s.pillar+s.star}).join('、') + '），感情经历可能较为丰富，婚姻需稳定心性。';
  else if (spouseStars.length === 1) starDesc = '配偶星单一（' + spouseStars[0].pillar + spouseStars[0].star + '），感情专注稳定，晚婚更能持久。';
  else starDesc = '配偶星藏而不露，感情较为内敛被动，多为晚婚之命，姻缘需主动争取或他人牵线。';
  var peachTips = [];
  if (allShenSha.indexOf('桃花') >= 0) peachTips.push('命带桃花星，异性缘佳，感情路上容易吸引异性注意，但需分辨真情与烂桃花');
  if (allShenSha.indexOf('红鸾') >= 0) peachTips.push('带红鸾星，婚恋运顺遂，易有美好姻缘');
  if (allShenSha.indexOf('天喜') >= 0) peachTips.push('带天喜星，婚后生活愉悦，有添丁之喜');
  if (allShenSha.indexOf('寡宿') >= 0) peachTips.push('带寡宿星，性格偏内向，需主动拓展社交圈，避免孤独终老');
  if (peachTips.length === 0) peachTips.push('桃花运中平，顺其自然，缘到自有良人相伴');
  var loveStyle = '';
  if (geJuType === '伤官格') loveStyle = '才华洋溢、个性鲜明，在感情中需学会克制言语锋芒。伤官见官，女性尤需注意婚姻经营。';
  else if (geJuType === '正官格') loveStyle = '对待感情认真负责，追求稳定长久，对伴侣有较高要求但自身也愿意付出。';
  else if (geJuType === '食神格') loveStyle = '温和包容型，在感情中懂得享受生活与制造浪漫，婚姻满意度通常较高。';
  else if (geJuType === '七杀格') loveStyle = '敢爱敢恨，感情中不畏艰难，但个性太强需注意给对方空间。';
  else if (geJuType === '正财格') loveStyle = '重视实际，择偶偏向务实可靠型，一旦认定便稳定长久。';
  else loveStyle = '感情随缘，遇良人则安，需在大运助力时把握姻缘契机。';
  var bestMarriagePeriod = '';
  for (var mi = 0; mi < keyDaYun.length; mi++) {
    if (keyDaYun[mi].score >= 2) {
      bestMarriagePeriod = keyDaYun[mi].ageStart + '–' + keyDaYun[mi].ageEnd + '岁（' + keyDaYun[mi].ganZhi + '大运）为良缘佳期，桃花姻缘运旺';
      break;
    }
  }
  if (!bestMarriagePeriod && keyDaYun.length > 0) bestMarriagePeriod = keyDaYun[0].ageStart + '–' + keyDaYun[0].ageEnd + '岁期间可遇良缘，但需谨慎选择对象';
  if (!bestMarriagePeriod) bestMarriagePeriod = '缘定之年，需结合流年具体分析';
  var marriageScore = 0;
  if (isYongSpouse) marriageScore += 3;
  if (isJiSpouse) marriageScore -= 2;
  if (allShenSha.indexOf('桃花') >= 0) marriageScore += 1;
  if (allShenSha.indexOf('红鸾') >= 0 || allShenSha.indexOf('天喜') >= 0) marriageScore += 1;
  if (allShenSha.indexOf('寡宿') >= 0) marriageScore -= 1;
  if (pillarRelations.zhiLiuHe.length > 0) marriageScore += 1;
  if (pillarRelations.zhiLiuChong.length > 0) marriageScore -= 1;
  var marriageLevel = marriageScore >= 3 ? '上等姻缘' : (marriageScore >= 1 ? '中上姻缘' : (marriageScore >= -1 ? '中等姻缘' : '需多经营'));
  var marriageLevelColor = marriageScore >= 3 ? 'yong' : (marriageScore >= 1 ? 'yong-light' : (marriageScore >= -1 ? 'neutral' : 'ji'));
  var marriageCautions = [];
  if (isJiSpouse) marriageCautions.push('配偶五行属忌神，婚后宜互相理解包容，减少以五行相克的方式相处，多寻找共同爱好增进感情');
  if (spouseShiShen === '七杀') marriageCautions.push('七杀在夫妻宫，婚姻中控制欲不可太强，给对方适度的自由空间是长久之道');
  if (spouseShiShen === '伤官') marriageCautions.push('伤官在夫妻宫最忌见正官，已婚者注意避免与异性走得过近，以免引发误解');
  if (spouseShiShen === '劫财') marriageCautions.push('劫财在夫妻宫暗示需防第三者介入，建立共同理财规划有助于婚姻稳定');
  if (allShenSha.indexOf('桃花') >= 0 && (allShenSha.indexOf('元辰') >= 0 || allShenSha.indexOf('劫煞') >= 0)) marriageCautions.push('桃花带煞，需防烂桃花或婚外情诱惑，保持清醒理智');
  if (pillarRelations.zhiHai.length > 0) marriageCautions.push('命中有相害关系，夫妻间易有误解，沟通需坦诚直接，切忌猜疑');
  if (marriageCautions.length === 0) marriageCautions.push('婚姻阶段总体良好，以真诚相待、互相尊重为基础，必能经营出幸福美满的婚姻关系');
  return {
    spousePalace: spousePalaceDesc, spouseShen: spouseShenDesc, starDesc: starDesc,
    peachTips: peachTips, loveStyle: loveStyle, bestPeriod: bestMarriagePeriod,
    marriageLevel: marriageLevel, marriageLevelColor: marriageLevelColor,
    marriageScore: marriageScore, cautions: marriageCautions,
    spouseWuxing: spouseZhiWx, isYong: isYongSpouse, isJi: isJiSpouse
  };
}

/**
 * 学业考试综合分析
 */
function analyzeAcademics(pillars, riZhu, yongShen, allShenSha, keyDaYun, wuXingStats, riGan, riWuXing, geJuType) {
  var yinStars = []; var shiShangStars = [];
  pillars.forEach(function(p, i) {
    var ss = getShiShen(riGan, p.gan);
    if (ss === '正印' || ss === '偏印') yinStars.push({ pillar: ['年','月','日','时'][i], star: ss });
    if (ss === '食神' || ss === '伤官') shiShangStars.push({ pillar: ['年','月','日','时'][i], star: ss });
  });
  var yinPower = 0;
  yinStars.forEach(function(y) { if (y.star === '正印') yinPower += 2; else yinPower += 1.5; });
  var shiShangPower = shiShangStars.length * 1.8;
  var talentDesc = '';
  if (yinPower >= 3) talentDesc = '文星旺盛（印星有力），学习能力强，善于系统吸收知识，适合深造的学术型人才。记忆力佳，考试运不弱。';
  else if (yinPower >= 1.5) talentDesc = '印星有气，有一定学习底子，专注时能取得较好成绩，宜养成持续学习的习惯。';
  else if (shiShangPower >= 2.5) talentDesc = '虽印星不旺，但食伤有力，才华外露型，善于表达与创作，适合实践性强、需要创意的科目。';
  else talentDesc = '学业需后天努力补先天不足，或在大运走印运时奋起直追，终有所成。贵在坚持。';
  if (yinPower < 1 && shiShangPower < 1.5) talentDesc += '天道酬勤，学习之事不在一朝一夕，持之以恒依然能有所建树。';
  var riWx = riWuXing;
  var subjects = [];
  if (riWx === '木') subjects = ['文学、哲学、语言学、法学、教育学'];
  else if (riWx === '火') subjects = ['计算机科学、传媒学、设计艺术、心理学、表演艺术'];
  else if (riWx === '土') subjects = ['管理学、经济学、建筑学、历史考古、农学'];
  else if (riWx === '金') subjects = ['工程学、数学、物理学、金融会计、医学'];
  else subjects = ['外语、国际关系、海洋科学、物流管理、新闻学'];
  var yongSubjects = [];
  (yongShen.yongShen || []).forEach(function(yw) {
    if (yw === '木') yongSubjects.push('教育学、生态学、中医学、园艺');
    if (yw === '火') yongSubjects.push('计算机、传媒、电子工程、化学');
    if (yw === '土') yongSubjects.push('商科、经济管理、土木工程、农学');
    if (yw === '金') yongSubjects.push('金融、精算、机械工程、法学');
    if (yw === '水') yongSubjects.push('外语、国际贸易、水产、航海');
  });
  var studyStyle = '';
  if (yinPower >= 2) studyStyle = '适合系统性、长期性的深度学习模式，善用笔记与思维导图。安静环境最利于专注。';
  else if (shiShangPower >= 2) studyStyle = '喜欢互动式、实践式学习，讨论与动手操作能让知识事半功倍，辅以碎片化时间巩固。';
  else studyStyle = '需用「少量多餐」的方式坚持学习，每天固定时段，辅以学习伙伴互相监督效果更佳。';
  var hasWenChang = allShenSha.indexOf('文昌贵人') >= 0;
  var hasXueTang = allShenSha.indexOf('学堂') >= 0 || allShenSha.indexOf('词馆') >= 0;
  var mentorDesc = '';
  if (hasWenChang && hasXueTang) mentorDesc = '命带文昌贵人+学堂，学术天赋得天独厚，一生多得名师指点，同学缘好，如鱼得水。';
  else if (hasWenChang) mentorDesc = '命带文昌贵人，关键时刻易遇良师，考试有文曲星照拂，但自身努力仍不可少。';
  else if (hasXueTang) mentorDesc = '命带学堂，学习氛围好，适合在校持续深造，有吸收新知识的天赋。';
  else mentorDesc = '师缘中平，需主动寻找良师益友，自学能力将是你的核心优势。';
  var examLuck = [];
  for (var ei = 0; ei < (keyDaYun ? keyDaYun.length : 0); ei++) {
    if (keyDaYun[ei].ageStart <= 30 && keyDaYun[ei].score >= 1.5) examLuck.push(keyDaYun[ei].ageStart + '–' + keyDaYun[ei].ageEnd + '岁考试运佳（' + keyDaYun[ei].ganZhi + '运）');
  }
  if (examLuck.length === 0) examLuck.push('考试阶段依赖平时积累，大考之年宜提前一年系统准备，以勤补运');
  var eduLevel = '';
  if (yinPower >= 3.5) eduLevel = '博硕之象，学术之路通畅，有拿高等学历的潜力';
  else if (yinPower >= 2) eduLevel = '本科以上，学业方向上可追求研究生层次';
  else if (yinPower >= 1) eduLevel = '大专至本科，适合专业技术路线';
  else if (shiShangPower >= 2.5) eduLevel = '不以学历论英雄，实践型才干更突出，技能证书与实操经验是核心竞争力';
  else eduLevel = '学历基础稳固，凭持续进修与社会经验可走出特色之路';
  return {
    talentDesc: talentDesc, subjects: subjects, yongSubjects: yongSubjects,
    studyStyle: studyStyle, mentorDesc: mentorDesc, examLuck: examLuck,
    eduLevel: eduLevel, yinPower: yinPower, shiShangPower: shiShangPower,
    hasWenChang: hasWenChang, hasXueTang: hasXueTang,
    yinStars: yinStars.map(function(y){return y.pillar + y.star}),
    shiShangStars: shiShangStars.map(function(s){return s.pillar + s.star})
  };
}

/**
 * 深度综合分析 — 原盘结构/大运节点/健康/职业/婚姻/学业/地域/幸运色数/生活宜忌
 * 
 * @param {Object} params - 完整解读结果
 * @returns {Object} 深度分析
 */
function getDeepAnalysis(params) {
  var pillars = params.pillars;
  var riZhu = params.riZhu;
  var yongShen = params.yongShen;
  var geJu = params.geJu;
  var pillarRelations = params.pillarRelations;
  var wuXingStats = params.wuXingStats;
  var daYunData = params.daYun;
  var shenShaByPillar = params.shenShaByPillar;

  var riGan = riZhu.gan;
  var riWuXing = riZhu.wuXing;
  var allWuXing = ['木', '火', '土', '金', '水'];
  var riIndex = allWuXing.indexOf(riWuXing);

  // ====== A. 原盘结构深度解析 ======
  var shiShenConfig = [];
  var pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  var roleDescs = [];
  for (var i = 0; i < pillars.length; i++) {
    var p = pillars[i];
    var ss = getShiShen(riGan, p.gan);
    var zhiSs = [];
    var cangGan = getCangGan(p.zhi);
    for (var c = 0; c < cangGan.length; c++) {
      zhiSs.push(getShiShen(riGan, cangGan[c]));
    }
    shiShenConfig.push({
      name: pillarNames[i],
      gan: p.gan, zhi: p.zhi,
      ganZhi: p.ganZhi,
      shiShen: ss,
      zhiShiShen: zhiSs.join('/'),
      cangGan: cangGan,
      naYin: getNaYin(p.ganZhi)
    });

    // 角色描述
    if (i === 0) roleDescs.push('年柱' + p.ganZhi + '为根基，代表祖业与早年环境，' + ss + '主' + (ss.indexOf('财') >= 0 ? '财源背景' : ss.indexOf('官') >= 0 || ss.indexOf('杀') >= 0 ? '管束压力' : ss.indexOf('印') >= 0 ? '庇护滋养' : '先天禀赋'));
    else if (i === 1) roleDescs.push('月柱' + p.ganZhi + '为提纲，主宰中年事业与父母宫，月令' + p.zhi + '藏' + cangGan.join('、') + '，' + ss + '立格局之基');
    else if (i === 2) roleDescs.push('日柱' + p.ganZhi + '为命主本身，日干' + p.gan + '+日支' + p.zhi + '构成夫妻宫，' + (cangGan.length > 0 ? '支藏' + cangGan.join('、') : '') + '为内在底蕴');
    else roleDescs.push('时柱' + p.ganZhi + '为归宿，主晚运与子女宫，' + ss + '主' + (ss.indexOf('食') >= 0 || ss.indexOf('伤') >= 0 ? '才华发挥与晚年福泽' : '最终成就'));
  }

  // 日主强弱评述
  var selfPower = wuXingStats[riWuXing] || 0;
  var strongWeakDesc = '';
  if (selfPower >= 4) strongWeakDesc = '日主' + riGan + '(' + riWuXing + ')得令多助，力量雄厚（' + selfPower + '分），属身强之命。行事果断自信，然过刚易折，宜知进退。';
  else if (selfPower >= 2.5) strongWeakDesc = '日主' + riGan + '(' + riWuXing + ')力量中等偏强（' + selfPower + '分），属中和偏强。能任财官，亦需印比适时扶身。';
  else if (selfPower >= 1.5) strongWeakDesc = '日主' + riGan + '(' + riWuXing + ')力量中和偏弱（' + selfPower + '分），属中和偏弱。宜借运助身，方能担财担官。';
  else strongWeakDesc = '日主' + riGan + '(' + riWuXing + ')力量偏弱（' + selfPower + '分），属身弱之命。宜行印比之运以补自身不足，不宜冒险急进。';

  // 特殊组合特征
  var features = [];
  if (pillarRelations.ganHe.length > 0) features.push('天干有合（' + pillarRelations.ganHe.length + '处），主人缘聚合');
  if (pillarRelations.zhiLiuHe.length > 0) features.push('地支六合暗合，内有玄机');
  if (pillarRelations.zhiSanHe.length > 0) features.push('地支成三合' + pillarRelations.zhiSanHe[0].hua + '，气势汇聚');
  if (pillarRelations.zhiLiuChong.length > 0) features.push('六冲' + pillarRelations.zhiLiuChong.length + '处，人生多有变动起伏');
  

  var yuanPan = {
    desc: strongWeakDesc + '四柱干支组合参考：' + shiShenConfig.map(function(s){return s.name+s.shiShen}).join('－'),
    shiShenConfig: shiShenConfig,
    strongWeakLevel: selfPower >= 4 ? '身强' : selfPower >= 2.5 ? '偏强' : selfPower >= 1.5 ? '偏弱' : '身弱',
    strongWeakDesc: strongWeakDesc,
    roleDescs: roleDescs,
    features: features
  };

  // ====== B. 关键大运节点 ======
  var daYunList = (daYunData && daYunData.daYunList) || [];
  var qiYunAge = (daYunData && daYunData.qiYunAge) || 0;
  // 防御：若 qiYunAge 异常，从 daYunList 反推
  if (!qiYunAge || isNaN(qiYunAge)) {
    qiYunAge = (daYunList.length > 0 && daYunList[0].age != null && !isNaN(daYunList[0].age))
      ? daYunList[0].age : 1;
  }
  var keyDaYun = [];

  // 用神/忌神集合（快速查找）
  var yongSet = {};
  (yongShen.yongShen || []).forEach(function(w) { yongSet[w] = true; });
  var jiSet = {};
  (yongShen.jiShen || []).forEach(function(w) { jiSet[w] = true; });

  for (var d = 0; d < daYunList.length; d++) {
    var dy = daYunList[d];
    var dyGanWx = getWuXing(dy.gan);
    var dyZhiWx = getWuXing(dy.zhi);

    // 判断这步大运的五行属性对用神的影响
    var isYongGan = !!yongSet[dyGanWx];
    var isYongZhi = !!yongSet[dyZhiWx];
    var isJiGan = !!jiSet[dyGanWx];
    var isJiZhi = !!jiSet[dyZhiWx];

    // 综合评分
    var score = 0;
    if (isYongGan) score += 2;
    if (isYongZhi) score += 3; // 地支权重更高
    if (isJiGan) score -= 2;
    if (isJiZhi) score -= 3;

    // 平衡状态加成/扣分
    if (yongShen.tiaoHou) {
      if (dyGanWx === yongShen.tiaoHou || dyZhiWx === yongShen.tiaoHou) {
        // 平衡状态是忌神的情况：分数折半
        if (jiSet[yongShen.tiaoHou]) score += 0.5; // 利弊参半
        else score += 1.5;
      }
    }

    // 病药判断
    var isCure = false;
    if (yongShen.sickElement && (dyGanWx === yongShen.sickElement || dyZhiWx === yongShen.sickElement)) {
      // 如果病药五行恰是用神则加分，是忌神则减分
      if (yongSet[yongShen.sickElement]) score += 2;
      else score -= 1;
    }
    // 通关判断
    var hasTongGuan = false;
    if (yongShen.tongGuan && yongShen.tongGuan.length > 0) {
      for (var t = 0; t < yongShen.tongGuan.length; t++) {
        if (dyGanWx === yongShen.tongGuan[t] || dyZhiWx === yongShen.tongGuan[t]) {
          hasTongGuan = true;
          score += 1.5;
          break;
        }
      }
    }

    var type = '';
    var typeTag = '';
    var typeColor = '';
    if (score >= 4) { type = '大吉'; typeTag = '吉'; typeColor = 'yong'; }
    else if (score >= 1.5) { type = '小吉'; typeTag = '平吉'; typeColor = 'yong-light'; }
    else if (score >= -1) { type = '平稳过渡'; typeTag = '平'; typeColor = 'neutral'; }
    else if (score >= -3.5) { type = '多事之秋'; typeTag = '小凶'; typeColor = 'ji-light'; }
    else { type = '坎坷考验'; typeTag = '凶'; typeColor = 'ji'; }

    // 阶段解读
    var dyDesc = '';
    var dyElements = [];
    if (isYongGan) dyElements.push(dy.gan + '(' + dyGanWx + '·用)');
    else if (isJiGan) dyElements.push(dy.gan + '(' + dyGanWx + '·忌)');
    else dyElements.push(dy.gan + '(' + dyGanWx + ')');
    if (isYongZhi) dyElements.push(dy.zhi + '(' + dyZhiWx + '·用)');
    else if (isJiZhi) dyElements.push(dy.zhi + '(' + dyZhiWx + '·忌)');
    else dyElements.push(dy.zhi + '(' + dyZhiWx + ')');

    if (score >= 4) {
      dyDesc = '此阶段天干地支皆得核心能量偏向之力（' + dyElements.join('、') + '），可谓顺风顺水。事业上可大胆开拓，财运亨通，贵人多助。宜把握机遇，积极进取，十年黄金期。';
    } else if (score >= 1.5) {
      dyDesc = '此阶段总体向好（' + dyElements.join('、') + '），虽有波折但大势有利。稳步推进为宜，不躁不馁，积累待发。';
    } else if (score >= -1) {
      dyDesc = '此阶段平淡（' + dyElements.join('、') + '），利弊参半。宜守成为上，稳住基本盘，等待转机。';
    } else if (score >= -3.5) {
      dyDesc = '此阶段压力较大（' + dyElements.join('、') + '），忌神较旺。凡事三思后行，注意健康与人际，不宜冒进投资。';
    } else {
      dyDesc = '此阶段严峻（' + dyElements.join('、') + '），忌神重重。务必谨慎低调，保重身体，以守为攻，静待时机流转。';
    }

    // 补充特殊说明
    if (hasTongGuan) dyDesc += '另此阶段含通关五行，可化解原局冲战矛盾，内忧外患得以缓解。';
    if (yongShen.sickElement && (dyGanWx === yongShen.sickElement || dyZhiWx === yongShen.sickElement)) {
      if (yongSet[yongShen.sickElement]) dyDesc += '逢去病之运，宿疾可解，旧困得脱。';
    }

    keyDaYun.push({
      index: d + 1,
      ganZhi: dy.ganZhi,
      gan: dy.gan, zhi: dy.zhi,
      ganWuXing: dyGanWx, zhiWuXing: dyZhiWx,
      ageStart: (dy.age != null && !isNaN(dy.age)) ? dy.age : Math.round(qiYunAge + d * 10),
      ageEnd: (dy.age != null && !isNaN(dy.age)) ? (dy.age + 9) : Math.round(qiYunAge + d * 10 + 9),
      yearStart: (dy.year != null && !isNaN(dy.year)) ? dy.year : (0),
      type: type, typeTag: typeTag, typeColor: typeColor,
      score: score,
      desc: dyDesc
    });
  }

  // 标注关键转折点
  var turningPoints = [];
  for (var k = 1; k < keyDaYun.length; k++) {
    var prevScore = keyDaYun[k-1].score;
    var currScore = keyDaYun[k].score;
    if (Math.abs(currScore - prevScore) >= 3) {
      turningPoints.push({
        year: keyDaYun[k].yearStart,
        age: keyDaYun[k].ageStart,
        from: keyDaYun[k-1].ganZhi + '(' + keyDaYun[k-1].typeTag + ')',
        to: keyDaYun[k].ganZhi + '(' + keyDaYun[k].typeTag + ')',
        desc: (currScore > prevScore ? '转运向上' : '阶段转折下行') + '，约' + keyDaYun[k].ageStart + '岁前后（' + keyDaYun[k].yearStart + '年）进入' + keyDaYun[k].ganZhi + '运，由「' + keyDaYun[k-1].type + '」转为「' + keyDaYun[k].type + '」，人生轨迹将出现明显变化，宜提前布局。'
      });
    }
  }

  // 找出最佳/最差运
  var bestDaYun = null, worstDaYun = null;
  for (var b = 0; b < keyDaYun.length; b++) {
    if (!bestDaYun || keyDaYun[b].score > bestDaYun.score) bestDaYun = keyDaYun[b];
    if (!worstDaYun || keyDaYun[b].score < worstDaYun.score) worstDaYun = keyDaYun[b];
  }

  // ====== C. 健康分析 ======
  // 五行对应脏腑
  var wxHealthMap = {
    '木': { organs: '肝胆、筋腱、眼睛、神经系统', weak: '肝气不舒、视力疲劳、筋骨酸痛、情绪郁结', strong: '肝火旺、易怒、头痛眩晕', advice: '保持规律作息，避免熬夜，多做户外活动舒展筋骨' },
    '火': { organs: '心脏、血脉、小肠、舌头', weak: '心血不足、手脚冰凉、精神萎靡', strong: '心火旺、高血压、失眠焦躁', advice: '控制情绪波动，避免过度兴奋，午间小憩养心' },
    '土': { organs: '脾胃、肌肉、口唇、消化系统', weak: '脾胃虚弱、消化不良、乏力倦怠', strong: '湿热重、肥胖、血糖异常', advice: '饮食清淡规律，少食生冷油腻，细嚼慢咽' },
    '金': { organs: '肺、大肠、皮肤、鼻、呼吸系统', weak: '肺气虚、易感冒、皮肤干燥', strong: '呼吸道敏感、便秘、皮肤过敏', advice: '注意空气质量，秋季尤重润肺，适度运动增强呼吸功能' },
    '水': { organs: '肾、膀胱、骨骼、耳朵、生殖系统', weak: '肾气不足、腰膝酸软、听力减退、畏寒', strong: '水泛、水肿、肾阳过亢', advice: '避免受寒凉，节制房劳，冬季注重腰部保暖' }
  };

  var healthItems = [];
  var healthSummaryParts = [];
  allWuXing.forEach(function(wx) {
    var power = wuXingStats[wx] || 0;
    var hInfo = wxHealthMap[wx];
    var status = '';
    if (power <= 0.5) { status = '偏弱'; healthSummaryParts.push(wx + '(' + hInfo.organs.split('、')[0] + '等)偏弱'); }
    else if (power >= 3.5) { status = '偏旺'; healthSummaryParts.push(wx + '(' + hInfo.organs.split('、')[0] + '等)偏旺'); }
    else status = '平衡';

    healthItems.push({
      wuXing: wx,
      power: power,
      organs: hInfo.organs,
      status: status,
      advice: hInfo.advice,
      weakSymptoms: hInfo.weak,
      strongSymptoms: hInfo.strong
    });
  });

  // 神煞健康提示
  var healthShenShaTips = [];
  var allShenSha = [];
  ['year','month','day','hour'].forEach(function(pos) {
    (shenShaByPillar[pos] || []).forEach(function(s) { allShenSha.push(s); });
  });
  (shenShaByPillar.global || []).forEach(function(s) { allShenSha.push(s); });
  
  if (allShenSha.indexOf('桃花') >= 0) healthShenShaTips.push('带桃花星，注意情感波动对身心的影响');
  if (allShenSha.indexOf('驿马') >= 0) healthShenShaTips.push('带驿马星，奔波劳碌，注意休息与交通安全');
  if (allShenSha.indexOf('元辰') >= 0) healthShenShaTips.push('带元辰，偶有意外小灾，出行需谨慎');
  if (allShenSha.indexOf('寡宿') >= 0) healthShenShaTips.push('带寡宿，注意心理健康，保持社交活跃');

  // 体质总评
  var constitution = '';
  var maxWx = '', maxPower = 0, minWx = '', minPower = 10;
  allWuXing.forEach(function(wx) {
    var p = wuXingStats[wx] || 0;
    if (p > maxPower) { maxPower = p; maxWx = wx; }
    if (p < minPower) { minPower = p; minWx = wx; }
  });
  if (maxPower >= 3.5) constitution = '体质偏' + maxWx + '型，' + maxWx + '气旺盛。重点养护' + (maxWx === '火' ? '心脏血管' : maxWx === '木' ? '肝胆' : maxWx === '土' ? '脾胃' : maxWx === '金' ? '肺呼吸' : '肾泌尿') + '系统，避免' + maxWx + '气过亢引发的相关病症。';
  else if (minPower <= 0.5) constitution = '体质偏' + minWx + '弱，' + minWx + '气不足。重点补养' + (minWx === '火' ? '心脏血脉' : minWx === '木' ? '肝胆' : minWx === '土' ? '消化系统' : minWx === '金' ? '呼吸系统' : '肾脏骨骼') + '，增强体质从' + minWx + '性食物和运动入手。';
  else constitution = '五行尚算均衡，体质中等，各脏腑功能协调。保持良好的生活习惯即可维持健康状态。';
  if (healthShenShaTips.length > 0) constitution += '但' + healthShenShaTips.join('；') + '。';

  // 运动养生建议
  var sportAdvice = [];
  if (maxWx === '木') sportAdvice = ['瑜伽、太极（柔韧调和）', '户外徒步、慢跑（舒展筋骨）', '避免高强度对抗运动'];
  else if (maxWx === '火') sportAdvice = ['游泳、水上运动（水火既济）', '球类运动（释放精力）', '避免高温暴晒锻炼'];
  else if (maxWx === '土') sportAdvice = ['登山、远足（接土气）', '举重、力量训练（增肌）', '避免久坐不动'];
  else if (maxWx === '金') sportAdvice = ['呼吸法、冥想（调肺气）', '骑行、室内健身（适度）', '选择空气清新场所'];
  else sportAdvice = ['慢跑、散步（温和有氧）', '太极拳、八段锦（养肾补气）', '避免大汗淋漓伤津液'];

  // 情绪健康
  var emotionAdvice = '';
  if (riWuXing === '木') emotionAdvice = '此命情绪敏感细腻，易受环境影响而波动。建议通过艺术表达（写作、绘画）或大自然疗愈来平衡情绪。';
  else if (riWuXing === '火') emotionAdvice = '情绪来得快走得快，激情四溢但缺乏持久。建议练习正念冥想，学会「观呼吸」来调伏心火。';
  else if (riWuXing === '土') emotionAdvice = '情绪稳定忠厚，但有事喜闷在心里。建议适当倾诉，学会表达内心感受，避免郁结成疾。';
  else if (riWuXing === '金') emotionAdvice = '外表冷静内心敏感，容易内耗。建议通过理性整理思绪（写日记）释压，不宜长期压抑。';
  else emotionAdvice = '情绪深沉内敛，内心世界丰富。建议保持适度社交，避免独处时胡思乱想，多与人交流分享。';

  // 各年龄段健康重点
  var ageHealth = [];
  if (keyDaYun.length >= 2) {
    ageHealth.push('青少年期（' + keyDaYun[0].ageStart + '-' + keyDaYun[0].ageEnd + '岁）：打好身体底子，培养运动习惯，此期' + (keyDaYun[0].score >= 1.5 ? '身体状况良好，发育顺利' : '体质偏弱，需加强锻炼和营养'));
  }
  if (keyDaYun.length >= 5) {
    ageHealth.push('中年期（' + keyDaYun[4].ageStart + '-' + keyDaYun[4].ageEnd + '岁）：' + (keyDaYun[4].score >= 0 ? '此阶段身体尚佳，但工作压力大，注意心血管健康和日常体检' : '此阶段劳心劳力，身体容易亮红灯，务必定期体检，劳逸结合'));
  }
  if (keyDaYun.length >= 7) {
    ageHealth.push('中老年期（' + keyDaYun[6].ageStart + '-' + keyDaYun[6].ageEnd + '岁）：' + (keyDaYun[6].score >= 0 ? '此阶段尚可安享，注意饮食清淡，保持适度运动即可' : '注意骨骼关节和慢性病管理，养生以静养为主'));
  }
  if (healthShenShaTips.indexOf('元辰') >= 0) ageHealth.push('命带灾煞，以上各阶段中出行需格外注意安全，尤其在换运之年');

  var health = {
    items: healthItems,
    summary: healthSummaryParts.length > 0 ? '五行健康提示：' + healthSummaryParts.join('；') + '，宜针对性调养。' : '五行分布较为均衡，整体健康底子不错。',
    shenShaTips: healthShenShaTips,
    constitution: constitution,
    sportAdvice: sportAdvice,
    emotionAdvice: emotionAdvice,
    ageHealth: ageHealth,
    maxWuXing: maxWx,
    minWuXing: minWx
  };

  // ====== D. 职业规划 ======
  var primaryYong = yongShen.primaryYong || '';
  var geJuType = geJu.geJu || '';

  // 格局→职业倾向
  var geJuCareerHints = {
    '正官格': '适合体制内、大型企业、管理岗位，循序渐进升迁，稳定性强',
    '七杀格': '适合竞争性行业、创业、军警武职，敢闯敢拼，以魄力取胜',
    '正财格': '适合实业经营、财务管理、稳健投资，积少成多',
    '偏财格': '适合贸易、金融投机、销售、互联网，善抓机会，流动性收入为主',
    '正印格': '适合学术研究、教育、文化、顾问咨询，以知识立身',
    '偏印格': '适合专业技术、研发、冷门领域、艺术创作，独辟蹊径',
    '食神格': '适合美食、设计、演艺、服务业，以才艺和享受见长',
    '伤官格': '适合创意、自媒体、技术革新、自由职业，才华外露但需配印'
  };

  // 五行→行业细分（更详细）
  var wxCareerDetail = {
    '木': { best: ['教育培训', '文化传播', '医疗健康', '出版编辑', '园林景观', '中药中医', '公益慈善', '人力资源'], good: ['服装纺织', '家具家居', '纸张文具'] },
    '火': { best: ['互联网科技', '电子信息', '餐饮美食', '传媒广告', '演艺娱乐', '能源化工', '光学照明', '美妆美容'], good: ['心理咨询', '培训演讲'] },
    '土': { best: ['房地产建筑', '农业矿产', '银行保险', '仓储物流', '管理咨询', '中介服务', '公共服务', '陶瓷古玩'], good: ['食品加工', '酒店餐饮管理'] },
    '金': { best: ['机械制造', '汽车行业', '五金金属', '法律法务', '金融投资', '军警安保', '精密仪器', '珠宝首饰'], good: ['审计会计', '体育竞技', '手术医疗'] },
    '水': { best: ['国际贸易', '物流运输', '旅游酒店', '咨询服务', '科研开发', '水产养殖', '医药制药', '新闻传播'], good: ['航运航海', '清洁环保', '饮料酒业'] }
  };

  var careerBest = [], careerGood = [], careerAvoid = [];
  (yongShen.yongShen || []).forEach(function(yw) {
    var detail = wxCareerDetail[yw];
    if (detail) {
      detail.best.forEach(function(b) { if (careerBest.indexOf(b) < 0) careerBest.push(b); });
      detail.good.forEach(function(g) { if (careerGood.indexOf(g) < 0) careerGood.push(g); });
    }
  });
  (yongShen.jiShen || []).forEach(function(jw) {
    var detail = wxCareerDetail[jw];
    if (detail) {
      detail.best.concat(detail.good).forEach(function(a) { if (careerAvoid.indexOf(a) < 0) careerAvoid.push(a); });
    }
  });

  // 工作方式建议
  var workStyle = '';
  if (geJuType === '正官格' || geJuType === '正财格' || geJuType === '正印格') {
    workStyle = '宜走稳健路线，选择有制度保障的平台，按部就班积累资历与信誉，不宜频繁跳槽。';
  } else if (geJuType === '七杀格' || geJuType === '偏财格' || geJuType === '伤官格') {
    workStyle = '适合灵活多变的工作模式，自主性强的项目制或创业更为合适，需在变化中寻找机会。';
  } else if (geJuType === '食神格' || geJuType === '偏印格') {
    workStyle = '宜发展一技之长，以专业能力立足，可选择自由职业或专业领域的深耕路线。';
  } else {
    workStyle = '根据大运走向灵活调整方向，好运期进取开拓，平运期稳扎稳打。';
  }

  // 事业财富格局
  var caiXing = [];    // 财星（正财/偏财）
  var guanXing = [];   // 官星（正官/七杀）
  shiShenConfig.forEach(function(sc) {
    if (sc.shiShen === '正财' || sc.shiShen === '偏财') caiXing.push(sc.name + sc.shiShen);
    if (sc.shiShen === '正官' || sc.shiShen === '七杀') guanXing.push(sc.name + sc.shiShen);
  });
  var wealthDesc = '';
  if (caiXing.length >= 2) wealthDesc = '财星透出（' + caiXing.join('、') + '），生财有道，物质追求积极。一生财富来源多元，经济独立性强。';
  else if (caiXing.length === 1) wealthDesc = '财星有制（' + caiXing.join('') + '），对财富有规划能守财，虽不安于小富亦能积少成多。';
  else wealthDesc = '财星藏而不透，对金钱欲望不强，理财意识偏淡，一生以安贫乐道居多，适合稳守型财富积累。';
  if (selfPower < 2 && caiXing.length >= 2) wealthDesc += '但身弱财旺，富屋贫人，易为财所累，需印比运助身方可担财。';
  if (selfPower >= 4 && caiXing.length >= 2) wealthDesc += '身强财亦旺，能任财富，财运亨通之象。';
  // 贵人/小人
  var guiRenTips = [];
  if (allShenSha.indexOf('天乙贵人') >= 0) guiRenTips.push('天乙贵人在命，遇难呈祥，终有贵人相助');
  if (allShenSha.indexOf('文昌贵人') >= 0) guiRenTips.push('文昌贵人相随，以文以技得贵人之助');
  if (allShenSha.indexOf('福星贵人') >= 0) guiRenTips.push('福星贵人护佑，一生少有极端苦难');
  if (allShenSha.indexOf('劫煞') >= 0 || allShenSha.indexOf('元辰') >= 0) guiRenTips.push(guiRenTips.length > 0 ? '虽有吉星照拂，亦需提防小人暗算' : '命带煞气，职场需防小人暗算，择友宜慎');
  if (guiRenTips.length === 0) guiRenTips.push('以诚待人，自可得人缘；持身正直，吉人自有天相');
  // 创业建议
  var startupHint = '';
  if (geJuType === '七杀格' || geJuType === '偏财格' || geJuType === '伤官格') {
    startupHint = '特质组合中有创业基因，敢闯敢拼，适合自主创业或在创新型公司担纲。关键大运期间可大胆尝试。';
  } else if (geJuType === '正官格' || geJuType === '正财格' || geJuType === '正印格') {
    startupHint = '格局正统稳健，更适合在大平台、体制内深耕，待积累足够资源后再考虑独当一面。';
  } else {
    startupHint = '宜先积累行业经验与资本，待中年大运支持时，可尝试创业或职业赛道切换。';
  }

  var career = {
    best: careerBest.slice(0, 8),
    good: careerGood.slice(0, 5),
    avoid: careerAvoid.slice(0, 5),
    workStyle: workStyle,
    geJuHint: geJuCareerHints[geJuType] || '',
    summary: (primaryYong ? '最宜向' + primaryYong + '性五行行业发展。' : '') + (geJuCareerHints[geJuType] || ''),
    wealthDesc: wealthDesc,
    guiRenTips: guiRenTips,
    startupHint: startupHint,
    caiXingDesc: (caiXing.length > 0 ? '财星：' + caiXing.join('、') : '财星不透，重视精神多于物质'),
    guanXingDesc: (guanXing.length > 0 ? '官星：' + guanXing.join('、') + '，' + (guanXing.length >= 2 ? '官多压力大，领导缘强' : '仕途有方向，稳中求进') : '官星不显，对权位野心不大')
  };

  // ====== E. 爱情婚姻 ======
  var marriageAnalysis = analyzeMarriage(riZhu, pillars, yongShen, allShenSha, keyDaYun, wuXingStats, riGan, riWuXing, geJuType, pillarRelations);

  // ====== F. 学业分析 ======
  var academicsAnalysis = analyzeAcademics(pillars, riZhu, yongShen, allShenSha, keyDaYun, wuXingStats, riGan, riWuXing, geJuType);

  // ====== G. 地域发展 ======
  var regionMap = {
    '木': { direction: '东方', regions: ['江浙沪', '沿海东部', '日本韩国'], cities: '上海、杭州、苏州、青岛等', climate: '温润多绿之地' },
    '火': { direction: '南方', regions: ['珠三角', '华南地区', '东南亚'], cities: '深圳、广州、长沙、厦门等', climate: '温暖明亮之城' },
    '土': { direction: '中央/中原', regions: ['中原腹地', '西南山区', '本地发展'], cities: '郑州、武汉、成都、西安等', climate: '厚重安稳之都' },
    '金': { direction: '西方', regions: ['环渤海', '西部工业城', '欧美方向'], cities: '北京、天津、成都、乌鲁木齐等',气候: '干燥爽朗之所' },
    '水': { direction: '北方', regions: ['东北', '华北', '北欧方向'], cities: '北京、大连、哈尔滨、哥本哈根等', climate: '寒冷清净之地' }
  };

  var regionBest = [], regionGood = [], regionAvoid = [];
  (yongShen.yongShen || []).forEach(function(yw) {
    var r = regionMap[yw];
    if (r && regionBest.indexOf(r.direction) < 0) {
      regionBest.push({ wuXing: yw, direction: r.direction, regions: r.regions, cities: r.cities, climate: r.climate });
    }
  });
  (yongShen.jiShen || []).forEach(function(jw) {
    var r = regionMap[jw];
    if (r && regionAvoid.indexOf(r.direction) < 0) {
      regionAvoid.push({ wuXing: jw, direction: r.direction });
    }
  });

  var region = {
    best: regionBest,
    avoid: regionAvoid,
    summary: (regionBest.length > 0 ? '最佳发展方向：' + regionBest.map(function(r){return r.direction+'（'+r.cities+'）'}).join('；') : '')
  };

  // ====== F. 幸运数字/颜色/饰品 ======
  // 数字→五行：1,6水 / 2,7火 / 3,8木 / 4,9金 / 5,0土
  var numWuXingMap = {
    '水': [1, 6], '火': [2, 7], '木': [3, 8], '金': [4, 9], '土': [5, 0]
  };
  var luckyNumbers = [], unluckyNumbers = [];
  var luckyColors = [], unluckyColors = [];

  (yongShen.yongShen || []).forEach(function(yw) {
    var nums = numWuXingMap[yw];
    if (nums) nums.forEach(function(n) { if (luckyNumbers.indexOf(n) < 0) luckyNumbers.push(n); });
  });
  (yongShen.jiShen || []).forEach(function(jw) {
    var nums = numWuXingMap[jw];
    if (nums) nums.forEach(function(n) { if (unluckyNumbers.indexOf(n) < 0) unluckyNumbers.push(n); });
  });

  var colorMap = {
    '木': [{name:'绿色',cls:'green'}, {name:'青色',cls:'cyan'}, {name:'翠色',cls:'emerald'}],
    '火': [{name:'红色',cls:'red'}, {name:'紫色',cls:'purple'}, {name:'橙色',cls:'orange'}],
    '土': [{name:'黄色',cls:'yellow'}, {name:'棕色',cls:'brown'}, {name:'咖色',cls:'coffee'}],
    '金': [{name:'白色',cls:'white'}, {name:'金色',cls:'gold'}, {name:'银色',cls:'silver'}],
    '水': [{name:'黑色',cls:'black'}, {name:'蓝色',cls:'blue'}, {name:'灰色',cls:'gray'}]
  };
  (yongShen.yongShen || []).forEach(function(yw) {
    var cols = colorMap[yw];
    if (cols) cols.forEach(function(c) { if (luckyColors.indexOf(c) < 0) luckyColors.push(c); });
  });
  (yongShen.jiShen || []).forEach(function(jw) {
    var cols = colorMap[jw];
    if (cols) cols.forEach(function(c) { if (unluckyColors.indexOf(c) < 0) unluckyColors.push(c); });
  });

  // 幸运饰品/宝石
  var stoneMap = {
    '木': ['翡翠', '绿松石', '橄榄石', '玉石'],
    '火': ['红宝石', '石榴石', '紫水晶', '玛瑙'],
    '土': ['黄玉', '虎眼石', '琥珀', '和田玉'],
    '金': ['钻石', '白水晶', '铂金', '银饰'],
    '水': ['黑曜石', '蓝宝石', '珍珠', '海蓝宝']
  };
  var luckyStones = [];
  (yongShen.yongShen || []).forEach(function(yw) {
    var stones = stoneMap[yw];
    if (stones) stones.forEach(function(s) { if (luckyStones.indexOf(s) < 0) luckyStones.push(s); });
  });

  var luck = {
    numbers: luckyNumbers,
    avoidNumbers: unluckyNumbers,
    colors: luckyColors,
    avoidColors: unluckyColors,
    avoidColorsText: unluckyColors.map(function(c) { return c.name; }).join('、'),
    stones: luckyStones.slice(0, 6)
  };

  // ====== G. 生活宜忌 ======
  var lifeTips = [
    {
      category: '饮食调养',
      icon: '🍃',
      tips: []
    },
    {
      category: '作息起居',
      icon: '🌙',
      tips: []
    },
    {
      category: '人际社交',
      icon: '🤝',
      tips: []
    },
    {
      category: '决策时机',
      icon: '⏰',
      tips: []
    }
  ];

  // 根据五行生成饮食建议
  var dietMap = {
    '木': '多食绿色蔬菜、酸味食物（柠檬、山楂）、草本茶饮',
    '火': '适量苦味食物（苦瓜、莲子），红色蔬果（西红柿、红枣）',
    '土': '甘味食物（山药、南瓜、小米粥）养脾胃，少食甜腻',
    '金': '辛味食物（生姜、葱白、白萝卜）宣肺，白色食物润燥',
    '水': '咸味适中（海带、紫菜），黑色食物（黑芝麻、黑木耳）补肾'
  };
  (yongShen.yongShen || []).forEach(function(yw) {
    if (dietMap[yw]) lifeTips[0].tips.push(dietMap[yw]);
  });
  if (lifeTips[0].tips.length === 0) lifeTips[0].tips.push('饮食均衡，顺应季节而食');

  // 作息建议 — 基于日主和火水平衡
  var firePower = wuXingStats['火'] || 0;
  var waterPower = wuXingStats['水'] || 0;
  if (firePower > waterPower + 1.5) {
    lifeTips[1].tips.push('火旺水弱，易失眠焦躁，睡前宜冥想或泡脚降火');
  } else if (waterPower > firePower + 1.5) {
    lifeTips[1].tips.push('水盛火弱，精神易低迷，宜晨起晒太阳补充阳气');
  }
  lifeTips[1].tips.push(selfPower >= 3 ? '身强者精力充沛，但切忌透支过度，子时（23-1点）前必寝' : '身弱者更需充足睡眠养精蓄锐，午时可小憩20分钟回血');

  // 人际建议 — 基于格局
  if (geJuType === '正官格' || geJuType === '正印格') {
    lifeTips[2].tips.push('格局正统，宜结交稳重诚信之人，远离浮夸之辈');
  } else if (geJuType === '偏财格' || geJuType === '七杀格') {
    lifeTips[2].tips.push('性格外放，人缘广泛但需辨别真心，三五知己胜过万千泛交');
  } else if (geJuType === '伤官格') {
    lifeTips[2].tips.push('才华外露易招嫉，言谈留三分余地，学会倾听他人');
  }
  if (pillarRelations.ganHe.length > 0) {
    lifeTips[2].tips.push('命中带合，天生有人缘魅力，善于合作共赢');
  }
  if (pillarRelations.zhiLiuChong.length > 0) {
    lifeTips[2].tips.push('命中带冲，人际关系易有波折，遇争执宜退一步');
  }
  if (lifeTips[2].tips.length === 0) lifeTips[2].tips.push('以诚待人，远近有度，亲君子远小人');

  // 决策建议
  if (bestDaYun) {
    lifeTips[3].tips.push('最佳大运在' + bestDaYun.ageStart + '-' + bestDaYun.ageEnd + '岁（' + bestDaYun.yearStart + '年起' + bestDaYun.ganZhi + '运），重大决策宜在此期间做出');
  }
  if (worstDaYun && worstDaYun.score < -2) {
    lifeTips[3].tips.push(worstDaYun.ageStart + '-' + worstDaYun.ageEnd + '岁（' + worstDaYun.ganZhi + '运）阶段较弱，宜守不宜攻，不宜做高风险决策');
  }
  if (turningPoints.length > 0) {
    lifeTips[3].tips.push('约' + turningPoints[0].age + '岁（' + turningPoints[0].year + '年）为阶段转折点，前后两年宜做好过渡准备');
  }
  lifeTips[3].tips.push((yongShen.yongShen && yongShen.yongShen[0]) ? '每逢' + (yongShen.yongShen[0]) + '年（流年五行属' + (yongShen.yongShen[0]) + '者）为吉利年份，宜启动新计划' : '');

  return {
    yuanPan: yuanPan,
    keyDaYun: keyDaYun,
    turningPoints: turningPoints,
    bestDaYun: bestDaYun,
    worstDaYun: worstDaYun,
    health: health,
    career: career,
    marriage: marriageAnalysis,
    academics: academicsAnalysis,
    region: region,
    luck: luck,
    lifeTips: lifeTips
  };
}

module.exports = {
  paipan,
  getDayPillar,
  getYearPillar,
  getMonthPillar,
  getHourPillar,
  getShiShen,
  getWuXing,
  getNaYin,
  getCangGan,
  getShenSha,
  getDaYun,
  getLiuNian,
  getLiuNianDetail,
  getPillarRelations,
  getYongShen,
  getGeJu,
  getDeepAnalysis
};
