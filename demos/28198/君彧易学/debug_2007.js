/**
 * 调试2007年12月7日12时月柱计算
 */
const path = require('path');

// 模拟微信小程序环境
const calendarData = require('./miniprogram/utils/calendar-data');
const baziEngine = require('./miniprogram/utils/bazi-engine');

console.log('===== 测试: 2007年12月7日12时 =====\n');

// Step 1: 获取节气数据
console.log('--- 2007年节气数据 ---');
const jq2007 = calendarData.getYearJieQi(2007);
jq2007.forEach((j, i) => {
  if (i % 2 === 0) { // 只打印"节"
    console.log(`  [${i}] ${j.n}: ${j.m}月${j.d}日${j.h}时`);
  }
});

// Step 2: 年柱
console.log('\n--- 年柱 ---');
const yp = baziEngine.getYearPillar(2007, 12, 7, 12);
console.log(`  年柱 = ${yp.ganZhi}, effectiveYear = ${yp.effectiveYear}`);

// Step 3: 月柱 - 直接调用
console.log('\n--- 月柱 ---');
try {
  const mp = baziEngine.getMonthPillar(yp.gan, 2007, 12, 7, 12);
  console.log(`  月柱 = ${mp.ganZhi}, monthIndex = ${mp.monthIndex}, monthName = ${mp.monthName}`);
} catch(e) {
  console.error(`  错误: ${e.message}`);
}

// Step 4: 手动模拟 getMonthPillar 内部逻辑
console.log('\n--- 手动模拟 getMonthPillar ---');

function dateToComparable(yearOffset, m, d, h) {
  return yearOffset * 100000000 + m * 10000 + d * 100 + h;
}

function isAfterOrEqualJieQi(m, d, h, yearOffset, jqM, jqD, jqH) {
  const left = dateToComparable(0, m, d, h);
  const right = dateToComparable(yearOffset, jqM, jqD, jqH);
  const result = left >= right;
  // console.log(`    比较: (${m}/${d}/${h}h, yoff=0)=${left} vs (${jqM}/${jqD}/${jqH}h, yoff=${yearOffset})=${right} -> ${result}`);
  return result;
}

// 构建jieList
const prevJQ = calendarData.getYearJieQi(2006);
const curJQ = jq2007;
const nextJQ = calendarData.getYearJieQi(2008);

const JIE_TO_MONTH = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const jieList = [];

if (prevJQ[22]) jieList.push({ ...prevJQ[22], yearOffset: -1, jieIndex: 10 });
for (let i = 0; i < 12; i++) {
  const qi24Index = i * 2;
  if (curJQ[qi24Index]) {
    jieList.push({ ...curJQ[qi24Index], yearOffset: 0, jieIndex: i });
  }
}
if (nextJQ[0]) jieList.push({ ...nextJQ[0], yearOffset: 1, jieIndex: 0 });
if (nextJQ[2]) jieList.push({ ...nextJQ[2], yearOffset: 1, jieIndex: 1 });

console.log(`\n  jieList 共 ${jieList.length} 个节:`);
jieList.forEach((j, idx) => {
  const cmp = dateToComparable(j.yearOffset, j.m, j.d, j.h);
  console.log(`    [${idx}] ${j.n}(i=${j.jieIndex}): ${j.m}/${j.d}/${j.h}h (yoff=${j.yearOffset}) → comparable=${cmp}`);
});

// 从后往前找
console.log(`\n  从后往前遍历, birth = 12/7/12:`);
const birthCmp = dateToComparable(0, 12, 7, 12);
console.log(`  birth comparable = ${birthCmp}`);

let foundIndex = -1;
for (let i = jieList.length - 1; i >= 0; i--) {
  const jie = jieList[i];
  const result = isAfterOrEqualJieQi(12, 7, 12, jie.yearOffset, jie.m, jie.d, jie.h);
  const jieCmp = dateToComparable(jie.yearOffset, jie.m, jie.d, jie.h);
  console.log(`    [${i}] ${jie.n}: birth=${birthCmp} >= jie(${jie.yearOffset})=${jieCmp} ? ${result} ${result ? '✅找到!' : ''}`);
  if (result) {
    foundIndex = i;
    break;
  }
}

if (foundIndex === -1) foundIndex = 0;

const foundJie = jieList[foundIndex];
const monthIndex = JIE_TO_MONTH[foundJie.jieIndex];

console.log(`\n  找到: [${foundIndex}] ${foundJie.n}, jieIndex=${foundJie.jieIndex}`);
console.log(`  monthIndex = ${monthIndex} (0=寅...9=亥,10=子,11=丑)`);

// 五虎遁
const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const WU_HU_DUN = { '甲':'丙', '己':'丙', '乙':'戊', '庚':'戊', '丙':'庚', '辛':'庚', '丁':'壬', '壬':'壬', '戊':'甲', '癸':'甲' };
const JIE_QI_MONTH_ZHI = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

const yinYueGanStart = TIAN_GAN.indexOf(WU_HU_DUN[yp.gan]);
const yueGan = TIAN_GAN[(yinYueGanStart + monthIndex) % 10];
const yueZhi = JIE_QI_MONTH_ZHI[monthIndex];

console.log(`  年干=${yp.gan}, 五虎遁寅月起=${WU_HU_DUN[yp.gan]}, 寅月天干索引=${yinYueGanStart}`);
console.log(`  月干=${yueGan}, 月支=${yueZhi}`);
console.log(`  结果: ** ${yueGan}${yueZhi}月 **`);

console.log('\n===== 完整排盘结果 =====');
const result = baziEngine.paipan({ year: 2007, month: 12, day: 7, hour: 12, gender: '男' });
console.log(`八字: ${result.baZiShort}`);
result.pillars.forEach(p => {
  console.log(`  ${p.name}: ${p.ganZhi} (${p.shiShen})`);
});
