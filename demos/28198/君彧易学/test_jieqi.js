/**
 * 节气计算对比测试
 * 对比新数据表 + 标准数据
 * 
 * 使用方法：
 *   1. 在微信开发者工具中打开项目
 *   2. 在控制台执行: require('./test_jieqi.js')
 *   3. 或者在 app.js 中引用此文件
 */

const { getYearJieQi, JIEQI_NAMES } = require('./miniprogram/utils/calendar-data');

// ============ 万年历标准数据（从网上获取） ============
const STANDARD_DATA = {
  2000: [
    {n:'小寒',m:1,d:6,h:8}, {n:'大寒',m:1,d:21,h:2}, {n:'立春',m:2,d:4,h:20}, {n:'雨水',m:2,d:19,h:16},
    {n:'惊蛰',m:3,d:5,h:14}, {n:'春分',m:3,d:20,h:15}, {n:'清明',m:4,d:4,h:19}, {n:'谷雨',m:4,d:20,h:2},
    {n:'立夏',m:5,d:5,h:12}, {n:'小满',m:5,d:21,h:1}, {n:'芒种',m:6,d:5,h:16}, {n:'夏至',m:6,d:21,h:9},
    {n:'小暑',m:7,d:7,h:2}, {n:'大暑',m:7,d:22,h:20}, {n:'立秋',m:8,d:7,h:12}, {n:'处暑',m:8,d:23,h:3},
    {n:'白露',m:9,d:7,h:15}, {n:'秋分',m:9,d:23,h:1}, {n:'寒露',m:10,d:8,h:7}, {n:'霜降',m:10,d:23,h:10},
    {n:'立冬',m:11,d:7,h:10}, {n:'小雪',m:11,d:22,h:8}, {n:'大雪',m:12,d:7,h:3}, {n:'冬至',m:12,d:21,h:21}
  ],
  2007: [
    {n:'小寒',m:1,d:6,h:1}, {n:'大寒',m:1,d:20,h:19}, {n:'立春',m:2,d:4,h:13}, {n:'雨水',m:2,d:19,h:9},
    {n:'惊蛰',m:3,d:6,h:7}, {n:'春分',m:3,d:21,h:8}, {n:'清明',m:4,d:5,h:12}, {n:'谷雨',m:4,d:20,h:19},
    {n:'立夏',m:5,d:6,h:5}, {n:'小满',m:5,d:21,h:18}, {n:'芒种',m:6,d:6,h:9}, {n:'夏至',m:6,d:22,h:2},
    {n:'小暑',m:7,d:7,h:19}, {n:'大暑',m:7,d:23,h:12}, {n:'立秋',m:8,d:8,h:5}, {n:'处暑',m:8,d:23,h:20},
    {n:'白露',m:9,d:8,h:8}, {n:'秋分',m:9,d:23,h:17}, {n:'寒露',m:10,d:9,h:0}, {n:'霜降',m:10,d:24,h:3},
    {n:'立冬',m:11,d:8,h:3}, {n:'小雪',m:11,d:23,h:0}, {n:'大雪',m:12,d:7,h:20}, {n:'冬至',m:12,d:22,h:14}
  ],
  2023: [
    {n:'小寒',m:1,d:5,h:22}, {n:'大寒',m:1,d:20,h:16}, {n:'立春',m:2,d:4,h:10}, {n:'雨水',m:2,d:19,h:6},
    {n:'惊蛰',m:3,d:6,h:4}, {n:'春分',m:3,d:21,h:5}, {n:'清明',m:4,d:5,h:9}, {n:'谷雨',m:4,d:20,h:16},
    {n:'立夏',m:5,d:6,h:2}, {n:'小满',m:5,d:21,h:15}, {n:'芒种',m:6,d:6,h:6}, {n:'夏至',m:6,d:21,h:22},
    {n:'小暑',m:7,d:7,h:16}, {n:'大暑',m:7,d:23,h:9}, {n:'立秋',m:8,d:8,h:2}, {n:'处暑',m:8,d:23,h:16},
    {n:'白露',m:9,d:8,h:5}, {n:'秋分',m:9,d:23,h:14}, {n:'寒露',m:10,d:8,h:21}, {n:'霜降',m:10,d:24,h:0},
    {n:'立冬',m:11,d:8,h:0}, {n:'小雪',m:11,d:22,h:21}, {n:'大雪',m:12,d:7,h:17}, {n:'冬至',m:12,d:22,h:11}
  ],
  2024: [
    {n:'小寒',m:1,d:6,h:4}, {n:'大寒',m:1,d:20,h:22}, {n:'立春',m:2,d:4,h:16}, {n:'雨水',m:2,d:19,h:12},
    {n:'惊蛰',m:3,d:5,h:10}, {n:'春分',m:3,d:20,h:11}, {n:'清明',m:4,d:4,h:14}, {n:'谷雨',m:4,d:19,h:21},
    {n:'立夏',m:5,d:5,h:8}, {n:'小满',m:5,d:20,h:20}, {n:'芒种',m:6,d:5,h:12}, {n:'夏至',m:6,d:21,h:4},
    {n:'小暑',m:7,d:6,h:22}, {n:'大暑',m:7,d:22,h:15}, {n:'立秋',m:8,d:7,h:7}, {n:'处暑',m:8,d:22,h:22},
    {n:'白露',m:9,d:7,h:11}, {n:'秋分',m:9,d:22,h:20}, {n:'寒露',m:10,d:8,h:2}, {n:'霜降',m:10,d:23,h:6},
    {n:'立冬',m:11,d:7,h:6}, {n:'小雪',m:11,d:22,h:3}, {n:'大雪',m:12,d:6,h:23}, {n:'冬至',m:12,d:21,h:17}
  ]
};

// ============ 运行对比 ============
console.log('========== 节气数据表 vs 万年历标准数据 对比 ==========\n');

const years = [2000, 2007, 2023, 2024];

years.forEach(year => {
  console.log(`\n--- ${year}年 ---`);
  console.log('节气名     | 数据表(月/日/时)    | 万年历(月/日/时)   | 匹配');
  console.log('-----------|--------------------|--------------------|------');
  
  const calculated = getYearJieQi(year);
  const standard = STANDARD_DATA[year];
  
  let matchCount = 0;
  
  calculated.forEach((calc, i) => {
    const std = standard[i];
    const name = calc.n.padEnd(4, ' ');
    const calcStr = `${String(calc.m).padStart(2,'0')}/${String(calc.d).padStart(2,'0')} ${String(calc.h).padStart(2,'0')}h`;
    const stdStr = `${String(std.m).padStart(2,'0')}/${String(std.d).padStart(2,'0')} ${String(std.h).padStart(2,'0')}h`;
    
    const monthMatch = calc.m === std.m;
    const dayMatch = calc.d === std.d;
    const hourMatch = calc.h === std.h;
    const allMatch = monthMatch && dayMatch && hourMatch;
    
    if (allMatch) matchCount++;
    
    const marker = allMatch ? '✅' : (monthMatch && dayMatch ? `⚠️差${Math.abs(calc.h-std.h)}h` : '❌');
    
    console.log(`${name}     | ${calcStr}              | ${stdStr}           | ${marker}`);
  });
  
  console.log(`\n  汇总: ${matchCount}/24 完全匹配`);
});

// ============ 特别验证：2007年大雪月柱判断 ============
console.log('\n\n========== 2007年大雪月柱判断验证 ==========\n');

const jq2007 = getYearJieQi(2007);
const daxue = jq2007[22]; // 大雪
const lidong = jq2007[20]; // 立冬

console.log(`立冬: ${lidong.m}月${lidong.d}日 ${lidong.h}时`);
console.log(`大雪: ${daxue.m}月${daxue.d}日 ${daxue.h}时`);
console.log('');

// 模拟出生时间判断
const testTimes = [
  { month: 12, day: 7, hour: 0, desc: '12月7日 00:00' },
  { month: 12, day: 7, hour: 12, desc: '12月7日 12:00 (中午)' },
  { month: 12, day: 7, hour: 19, desc: '12月7日 19:00' },
  { month: 12, day: 7, hour: 20, desc: '12月7日 20:00' },
  { month: 12, day: 7, hour: 21, desc: '12月7日 21:00' },
  { month: 12, day: 8, hour: 0, desc: '12月8日 00:00' },
];

testTimes.forEach(t => {
  const isAfter = (t.month > daxue.m) || 
                  (t.month === daxue.m && t.day > daxue.d) ||
                  (t.month === daxue.m && t.day === daxue.d && t.hour >= daxue.h);
  const monthName = isAfter ? '子月(壬子)' : '亥月(辛亥)';
  console.log(`${t.desc}: ${isAfter ? '>= 大雪' : '< 大雪'} → ${monthName}`);
});

// ============ 范围测试 ============
console.log('\n\n========== 1900-2100范围测试 ==========\n');

// 测试边界年份
const boundaryYears = [1900, 1950, 2000, 2050, 2100];
boundaryYears.forEach(year => {
  try {
    const jq = getYearJieQi(year);
    console.log(`${year}年: ✅ ${jq.length}个节气 (立春=${jq[2].m}/${jq[2].d}, 冬至=${jq[23].m}/${jq[23].d})`);
  } catch(e) {
    console.log(`${year}年: ❌ ${e.message}`);
  }
});

// 测试超出范围
try {
  getYearJieQi(1899);
  console.log('1899年: ⚠️ 未报错（预期应报错或回退）');
} catch(e) {
  console.log('1899年: ✅ 正确报错/回退');
}

try {
  getYearJieQi(2101);
  console.log('2101年: ⚠️ 未报错（预期应回退到算法）');
} catch(e) {
  console.log('2101年: ✅ 正确报错/回退');
}

console.log('\n========== 对比完成 ==========');
