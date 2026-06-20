const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const WU_XING_MAP = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const SHI_SHEN_MAP = {
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
};

const SHI_SHEN_SCORE = {
  '比肩': { overall: 70, career: 65, wealth: 60, love: 75 },
  '劫财': { overall: 55, career: 50, wealth: 45, love: 60 },
  '食神': { overall: 85, career: 75, wealth: 70, love: 90 },
  '伤官': { overall: 70, career: 80, wealth: 60, love: 65 },
  '偏财': { overall: 75, career: 65, wealth: 90, love: 70 },
  '正财': { overall: 80, career: 75, wealth: 85, love: 75 },
  '七杀': { overall: 50, career: 60, wealth: 55, love: 45 },
  '正官': { overall: 70, career: 85, wealth: 65, love: 60 },
  '偏印': { overall: 65, career: 70, wealth: 55, love: 60 },
  '正印': { overall: 80, career: 75, wealth: 65, love: 75 }
};

const YI_MAP = {
  '食神': ['出行', '旅游', '娱乐', '创作', '宴会', '访友'],
  '伤官': ['创新', '设计', '演讲', '学习', '突破', '求职'],
  '正财': ['理财', '投资', '签约', '求职', '开店', '交易'],
  '偏财': ['投机', '合作', '谈判', '交友', '采购', '销售'],
  '正官': ['求职', '面试', '晋升', '考试', '诉讼', '公务'],
  '七杀': ['挑战', '竞争', '变革', '拓展', '决断', '启动'],
  '正印': ['学习', '拜师', '修行', '策划', '冥想', '祈福'],
  '偏印': ['研究', '思考', '独处', '创作', '咨询', '分析'],
  '比肩': ['聚会', '合作', '互助', '交流', '运动', '联谊'],
  '劫财': ['谨慎', '守财', '反思', '储蓄', '稳守', '内省']
};

const JI_MAP = {
  '食神': ['动土', '安葬', '诉讼', '讨债', '签约', '借贷'],
  '伤官': ['结婚', '签约', '合作', '妥协', '保守', '投资'],
  '正财': ['借贷', '投资风险项目', '盲目扩张', '投机', '赌博'],
  '偏财': ['赌博', '轻信', '大额支出', '借贷', '担保', '冒险'],
  '正官': ['叛逆', '违规', '跳槽', '争执', '冒险', '辞职'],
  '七杀': ['结婚', '搬家', '投资', '放松', '妥协', '签约'],
  '正印': ['冲动', '冒险', '投机', '张扬', '争吵', '动土'],
  '偏印': ['社交', '聚会', '合作', '随众', '轻信', '投资'],
  '比肩': ['独处', '猜忌', '垄断', '固执', '偷懒', '争执'],
  '劫财': ['投资', '借贷', '担保', '合作', '冒险', '创业']
};

const LUCKY_MAP = {
  '木': { direction: ['东方'], numbers: ['3', '8'], colors: ['青色', '绿色'] },
  '火': { direction: ['南方'], numbers: ['2', '7'], colors: ['红色', '紫色'] },
  '土': { direction: ['中央'], numbers: ['5', '0'], colors: ['黄色', '棕色'] },
  '金': { direction: ['西方'], numbers: ['4', '9'], colors: ['白色', '金色'] },
  '水': { direction: ['北方'], numbers: ['1', '6'], colors: ['黑色', '蓝色'] }
};

const SHI_SHEN_HINT = {
  '比肩': '今日日主与天干同类相助，利于合作共事，朋友助力，但亦可能有竞争出现，宜保持谦逊。',
  '劫财': '今日劫财主事，财星受克，宜谨慎理财，避免盲目投资。适合反思内省，稳守为上。',
  '食神': '今日食神当旺，才华得以施展，心情愉悦。适合娱乐休闲、创意创作、宴请宾客。',
  '伤官': '今日伤官透出，思维活跃，创意迸发。适合学习新技能、表达观点，但需注意言辞分寸。',
  '偏财': '今日偏财临身，有意外之喜，财运亨通。适合商业谈判、合作洽谈，但切忌贪婪过度。',
  '正财': '今日正财主事，财运稳定，适合规划财务、求职面试、签订合同等正事。',
  '七杀': '今日七杀当头，压力较大，但也暗藏机遇。适合迎接挑战、突破自我，不宜贪图安逸。',
  '正官': '今日正官得位，贵人相助，事业顺利。适合求职晋升、处理公务，但需保持正直操守。',
  '偏印': '今日偏印主事，思维深邃，适合研究思考、独自创作。不宜参与社交活动，独处为宜。',
  '正印': '今日正印护身，贵人运佳，学业事业皆有提升。适合学习进修、策划规划、祈福修行。'
};

const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const XING_ZUO = [
  { name: '摩羯座', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: '水瓶座', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: '双鱼座', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: '白羊座', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: '金牛座', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: '双子座', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { name: '巨蟹座', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { name: '狮子座', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: '处女座', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: '天秤座', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { name: '天蝎座', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { name: '射手座', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 }
];

const SOLAR_FESTIVALS = {
  '01-01': '元旦',
  '02-14': '情人节',
  '03-08': '妇女节',
  '03-12': '植树节',
  '04-01': '愚人节',
  '05-01': '劳动节',
  '05-04': '青年节',
  '06-01': '儿童节',
  '07-01': '建党节',
  '08-01': '建军节',
  '09-10': '教师节',
  '10-01': '国庆节',
  '10-24': '程序员节',
  '11-11': '光棍节',
  '12-25': '圣诞节'
};

const LUNAR_FESTIVALS = {
  '01-01': '春节',
  '01-15': '元宵节',
  '05-05': '端午节',
  '07-07': '七夕节',
  '08-15': '中秋节',
  '09-09': '重阳节',
  '12-08': '腊八节',
  '12-23': '小年',
  '12-30': '除夕'
};

function getDayGanZhi(year, month, day) {
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const baseIndex = 10;
  const index = ((baseIndex + days) % 60 + 60) % 60;
  
  return {
    gan: GAN[index % 10],
    zhi: ZHI[index % 12],
    wuXing: WU_XING_MAP[GAN[index % 10]]
  };
}

function getMonthWuXingWangShuai(month) {
  const season = Math.ceil(month / 3);
  const wangShuaiMap = {
    1: { '木': '旺', '火': '相', '水': '休', '金': '囚', '土': '死' },
    2: { '火': '旺', '土': '相', '木': '休', '水': '囚', '金': '死' },
    3: { '金': '旺', '水': '相', '土': '休', '火': '囚', '木': '死' },
    4: { '水': '旺', '木': '相', '金': '休', '土': '囚', '火': '死' }
  };
  return wangShuaiMap[season];
}

function getShiShen(riGan, dayGan) {
  return SHI_SHEN_MAP[riGan] && SHI_SHEN_MAP[riGan][dayGan] ? SHI_SHEN_MAP[riGan][dayGan] : '比肩';
}

function calculateWuXingModifier(userWuXing, dayWuXing) {
  const sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const ke = { '木': '土', '火': '水', '土': '木', '金': '木', '水': '火' };
  
  if (sheng[userWuXing] === dayWuXing) return 10;
  if (ke[userWuXing] === dayWuXing) return -10;
  if (sheng[dayWuXing] === userWuXing) return 5;
  if (ke[dayWuXing] === userWuXing) return -5;
  return 0;
}

function getShengXiao(year) {
  return SHENG_XIAO[(year - 4) % 12];
}

function getXingZuo(month, day) {
  return XING_ZUO.find(xz => {
    if (xz.startMonth === xz.endMonth) {
      return day >= xz.startDay && day <= xz.endDay;
    }
    if (month === xz.startMonth) {
      return day >= xz.startDay;
    }
    if (month === xz.endMonth) {
      return day <= xz.endDay;
    }
    return false;
  })?.name || '摩羯座';
}

function getSolarFestival(month, day) {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return SOLAR_FESTIVALS[key] || null;
}

function getLunarFestival(lunarMonth, lunarDay) {
  const key = `${String(Math.abs(lunarMonth)).padStart(2, '0')}-${String(lunarDay).padStart(2, '0')}`;
  return LUNAR_FESTIVALS[key] || null;
}

function calculateFortune(userBaZi, date) {
  const { riGan, riWuXing } = userBaZi;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const dayGanZhi = getDayGanZhi(year, month, day);
  const shiShen = getShiShen(riGan, dayGanZhi.gan);
  const baseScores = SHI_SHEN_SCORE[shiShen];
  const modifier = calculateWuXingModifier(riWuXing, dayGanZhi.wuXing);
  
  const scores = {
    overall: Math.min(100, Math.max(0, baseScores.overall + modifier)),
    career: Math.min(100, Math.max(0, baseScores.career + modifier)),
    wealth: Math.min(100, Math.max(0, baseScores.wealth + modifier)),
    love: Math.min(100, Math.max(0, baseScores.love + modifier))
  };
  
  const yiJi = {
    yi: YI_MAP[shiShen].slice(0, 3),
    ji: JI_MAP[shiShen].slice(0, 3)
  };
  
  const lucky = LUCKY_MAP[dayGanZhi.wuXing] || { direction: ['东方'], numbers: ['1', '6'], colors: ['白色', '灰色'] };
  const wangShuai = getMonthWuXingWangShuai(month);
  
  const wangShuaiText = `木${wangShuai.木} 火${wangShuai.火} 土${wangShuai.土} 金${wangShuai.金} 水${wangShuai.水}`;
  const luckyDirection = lucky.direction.join('、');
  const luckyNumbers = lucky.numbers.join('、');
  const luckyColors = lucky.colors.join('、');
  
  return {
    date: { year, month, day },
    ganZhi: dayGanZhi,
    shiShen,
    scores,
    yiJi,
    lucky,
    luckyDirection,
    luckyNumbers,
    luckyColors,
    wangShuai,
    wangShuaiText,
    hint: SHI_SHEN_HINT[shiShen],
    shengXiao: getShengXiao(year),
    xingZuo: getXingZuo(month, day),
    solarFestival: getSolarFestival(month, day)
  };
}

module.exports = {
  GAN,
  ZHI,
  WU_XING_MAP,
  SHENG_XIAO,
  XING_ZUO,
  SOLAR_FESTIVALS,
  LUNAR_FESTIVALS,
  getDayGanZhi,
  getMonthWuXingWangShuai,
  getShiShen,
  getShengXiao,
  getXingZuo,
  getSolarFestival,
  getLunarFestival,
  calculateFortune
};
