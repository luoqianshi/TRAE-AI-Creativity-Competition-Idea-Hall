import * as XLSX from 'xlsx-js-style';
import { getDynamicMeterNames } from './excelHelpers';

export function exportDailyHistoryToExcel(historyData: any[], config: any) {
  const { litixianName, wushaxianName } = getDynamicMeterNames();
  const sortedData = [...historyData].sort((a, b) => new Date(a.日期).getTime() - new Date(b.日期).getTime());

  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  if (sortedData.length > 0 && sortedData[0].日期) {
    const parts = sortedData[0].日期.split('-');
    if (parts.length >= 2) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    }
  }

  const borderAll = {
    top: { style: 'thin', color: { rgb: "000000" } },
    bottom: { style: 'thin', color: { rgb: "000000" } },
    left: { style: 'thin', color: { rgb: "000000" } },
    right: { style: 'thin', color: { rgb: "000000" } }
  };
  const alignCenter = { horizontal: 'center', vertical: 'center' };
  const fontRed = { color: { rgb: "FF0000" } };
  const fontBold = { bold: true };
  const bgLightBlue = { fgColor: { rgb: "DCE6F1" } };
  const bgLightGray = { fgColor: { rgb: "E7E6E6" } };
  const bgLightYellow = { fgColor: { rgb: "Fdf4d6" } };

  const electricSheetData = [];

  electricSheetData.push([
    { v: `${config.酒店名称 || "国信金融酒店"}${year}年${month}月每日用电能耗汇总`, s: { font: { sz: 16, bold: true }, alignment: alignCenter, fill: bgLightBlue } },
    '', '', '', '', '', '', '', '', '', '', '', ''
  ]);

  electricSheetData.push([
    { v: '户号：' + (config.电费户号 || "1001624686"), s: { font: fontRed, alignment: alignCenter, fill: bgLightBlue } },
    '', '', '', '', '', '', '', '', '', '', '', ''
  ]);

  electricSheetData.push([
    '',
    { v: '表号：' + (config.李体线表号 || "000000536129444"), s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '', '',
    { v: '表号：' + (config.午沙线表号 || "000000536114945"), s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '', '',
    { v: `单价：${config.电费单价}元/Kwh`, s: { font: fontBold, alignment: { horizontal: 'right', vertical: 'center' } } }, ''
  ]);

  electricSheetData.push([
    { v: '序号', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '日期', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: litixianName, s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '用电量（度）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '单价', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '费用/元', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: wushaxianName, s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '用电量（度）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '单价', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '费用/元', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '每日总用量/Kwh', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '每日总价/元', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } }
  ]);

  let lastElec1 = sortedData.length > 0 ? sortedData[0].李体线电表 - 10 : 0;
  let lastElec2 = sortedData.length > 0 ? sortedData[0].午沙线电表 - 5 : 0;

  electricSheetData.push([
    '',
    { v: '上月表底数', s: { font: fontRed, alignment: alignCenter } },
    { v: lastElec1, s: { alignment: alignCenter } },
    '', '', '', { v: 0, s: { font: fontRed, alignment: alignCenter } },
    { v: lastElec2, s: { alignment: alignCenter } },
    '', '', '', { v: 0, s: { font: fontRed, alignment: alignCenter } },
    '', ''
  ]);

  sortedData.forEach((row, index) => {
    let e1 = Number(row.李体线电表);
    let e2 = Number(row.午沙线电表);
    let u1 = e1 - lastElec1;
    let u2 = Math.max(0, e2 - lastElec2);

    const ratio = config.电表换算基数 ?? 3500;
    let kwh1 = u1 * ratio;
    let cost1 = kwh1 * (config.电费单价 || 0);
    let kwh2 = u2 * ratio;
    let cost2 = kwh2 * (config.电费单价 || 0);
    let totalKwh = kwh1 + kwh2;
    let totalCost = cost1 + cost2;

    const dateObj = new Date(row.日期);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;

    electricSheetData.push([
      { v: index + 1, s: { alignment: alignCenter } },
      { v: dateStr, s: { alignment: alignCenter } },
      { v: e1.toFixed(2), s: { alignment: alignCenter } },
      { v: u1.toFixed(2), s: { alignment: alignCenter } },
      { v: kwh1.toFixed(0), s: { alignment: alignCenter } },
      { v: (config.电费单价 || 0).toFixed(2), s: { alignment: alignCenter } },
      { v: cost1.toFixed(1), s: { font: fontRed, alignment: alignCenter } },
      { v: e2.toFixed(2), s: { alignment: alignCenter } },
      { v: u2.toFixed(2), s: { alignment: alignCenter } },
      { v: kwh2.toFixed(0), s: { alignment: alignCenter } },
      { v: (config.电费单价 || 0).toFixed(2), s: { alignment: alignCenter } },
      { v: cost2.toFixed(1), s: { font: fontRed, alignment: alignCenter } },
      { v: totalKwh.toFixed(0), s: { font: fontRed, alignment: alignCenter } },
      { v: totalCost.toFixed(1), s: { font: fontRed, alignment: alignCenter } }
    ]);

    lastElec1 = e1;
    lastElec2 = e2;
  });

  const summarySheetData = [];

  summarySheetData.push([
    { v: `${config.酒店名称 || "国信金融酒店"}${year}年${month}月份每日能耗汇总统计表`, s: { font: { sz: 16, bold: true }, alignment: alignCenter, fill: bgLightBlue } },
    '', '', '', '', '', '', '', '', '', '', ''
  ]);

  summarySheetData.push([
    { v: '序号', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '日期', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '自来水（立方）', s: { alignment: alignCenter, fill: bgLightGray } }, '',
    { v: '电（度）', s: { alignment: alignCenter, fill: bgLightGray } }, '',
    { v: '天然气（立方）', s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '', '', '',
    { v: '每日总能耗金额', s: { font: fontRed, alignment: alignCenter, fill: bgLightYellow } }
  ]);

  summarySheetData.push([
    '',
    '',
    { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '金额', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '金额', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '锅炉房用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '金额', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '厨房用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '金额', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '总用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '总费用合计', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    ''
  ]);

  let lastWater1 = sortedData.length > 0 ? sortedData[0].酒店水表 - 10 : 0;
  let lastWater2 = sortedData.length > 0 ? sortedData[0].喷泉水表 - 5 : 0;
  lastElec1 = sortedData.length > 0 ? sortedData[0].李体线电表 - 10 : 0;
  lastElec2 = sortedData.length > 0 ? sortedData[0].午沙线电表 - 5 : 0;

  let sumWaterVol = 0, sumWaterCost = 0;
  let sumElecKwh = 0, sumElecCost = 0;
  let sumBoilerVol = 0, sumBoilerCost = 0;
  let sumKitchenVol = 0, sumKitchenCost = 0;
  let sumGasVol = 0, sumGasCost = 0;
  let sumDailyTotal = 0;

  sortedData.forEach((row, index) => {
    const dateObj = new Date(row.日期);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;

    let w1 = Number(row.酒店水表);
    let w2 = Number(row.喷泉水表);
    let uW1 = Math.max(0, w1 - lastWater1);
    let uW2 = Math.max(0, w2 - lastWater2);
    let waterUsage = uW1 + uW2;
    let waterCost = waterUsage * (config.水费单价 || 0);

    let e1 = Number(row.李体线电表);
    let e2 = Number(row.午沙线电表);
    let u1 = e1 - lastElec1;
    let u2 = Math.max(0, e2 - lastElec2);
    const ratio = config.电表换算基数 ?? 3500;
    let kwh1 = u1 * ratio;
    let kwh2 = u2 * ratio;
    let elecUsage = kwh1 + kwh2;
    let elecCost = elecUsage * (config.电费单价 || 0);

    let gasUsageTotal = Number(row.天然气表);
    let boilerUsage = gasUsageTotal;
    let kitchenUsage = 0;
    let boilerCost = boilerUsage * (config.气费单价 || 0);
    let kitchenCost = kitchenUsage * (config.气费单价 || 0);
    let gasTotalCost = gasUsageTotal * (config.气费单价 || 0);

    let totalDailyCost = waterCost + elecCost + gasTotalCost;

    summarySheetData.push([
      { v: index + 1, s: { alignment: alignCenter } },
      { v: dateStr, s: { alignment: alignCenter } },
      { v: waterUsage.toFixed(0), s: { alignment: alignCenter } },
      { v: waterCost.toFixed(2), s: { font: fontRed, alignment: alignCenter } },
      { v: elecUsage.toFixed(0), s: { alignment: alignCenter } },
      { v: elecCost.toFixed(1), s: { font: fontRed, alignment: alignCenter } },
      { v: boilerUsage.toFixed(0), s: { alignment: alignCenter } },
      { v: boilerCost.toFixed(1), s: { font: fontRed, alignment: alignCenter } },
      { v: kitchenUsage.toFixed(0), s: { alignment: alignCenter } },
      { v: kitchenCost.toFixed(2), s: { font: fontRed, alignment: alignCenter } },
      { v: gasUsageTotal.toFixed(0), s: { alignment: alignCenter } },
      { v: gasTotalCost.toFixed(2), s: { font: fontRed, alignment: alignCenter } },
      { v: totalDailyCost.toFixed(2), s: { font: fontRed, alignment: alignCenter } }
    ]);

    sumWaterVol += waterUsage;
    sumWaterCost += waterCost;
    sumElecKwh += elecUsage;
    sumElecCost += elecCost;
    sumBoilerVol += boilerUsage;
    sumBoilerCost += boilerCost;
    sumKitchenVol += kitchenUsage;
    sumKitchenCost += kitchenCost;
    sumGasVol += gasUsageTotal;
    sumGasCost += gasTotalCost;
    sumDailyTotal += totalDailyCost;

    lastWater1 = w1;
    lastWater2 = w2;
    lastElec1 = e1;
    lastElec2 = e2;
  });

  summarySheetData.push([
    '',
    { v: '合计', s: { font: fontBold, alignment: alignCenter } },
    { v: sumWaterVol.toFixed(0), s: { font: fontBold, alignment: alignCenter } },
    { v: sumWaterCost.toFixed(2), s: { font: { bold: true, color: { rgb: "FF0000" } }, alignment: alignCenter } },
    { v: sumElecKwh.toFixed(0), s: { font: fontBold, alignment: alignCenter } },
    { v: sumElecCost.toFixed(1), s: { font: { bold: true, color: { rgb: "FF0000" } }, alignment: alignCenter } },
    { v: sumBoilerVol.toFixed(0), s: { font: fontBold, alignment: alignCenter } },
    { v: sumBoilerCost.toFixed(1), s: { font: { bold: true, color: { rgb: "FF0000" } }, alignment: alignCenter } },
    { v: sumKitchenVol.toFixed(0), s: { font: fontBold, alignment: alignCenter } },
    { v: sumKitchenCost.toFixed(2), s: { font: { bold: true, color: { rgb: "FF0000" } }, alignment: alignCenter } },
    { v: sumGasVol.toFixed(0), s: { font: fontBold, alignment: alignCenter } },
    { v: sumGasCost.toFixed(2), s: { font: { bold: true, color: { rgb: "FF0000" } }, alignment: alignCenter } },
    { v: sumDailyTotal.toFixed(2), s: { font: { bold: true, color: { rgb: "FF0000" } }, alignment: alignCenter } }
  ]);

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(electricSheetData);
  const ws2 = XLSX.utils.aoa_to_sheet(summarySheetData);

  ws1['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 13 }, { wch: 8 }, { wch: 11 },
    { wch: 10 }, { wch: 8 }, { wch: 13 }, { wch: 8 }, { wch: 11 },
    { wch: 18 }, { wch: 14 }
  ];
  ws2['!cols'] = [
    { wch: 6 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 16 }
  ];

  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
    { s: { r: 2, c: 2 }, e: { r: 2, c: 6 } },
    { s: { r: 2, c: 7 }, e: { r: 2, c: 11 } },
    { s: { r: 2, c: 12 }, e: { r: 2, c: 13 } },
  ];
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },
    { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } },
    { s: { r: 1, c: 2 }, e: { r: 1, c: 3 } },
    { s: { r: 1, c: 4 }, e: { r: 1, c: 5 } },
    { s: { r: 1, c: 6 }, e: { r: 1, c: 11 } },
    { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } },
  ];

  for (let i in ws1) {
    if (i === '!merges' || i === '!ref' || i === '!cols') continue;
    if (!ws1[i].s) ws1[i].s = {};
    ws1[i].s.border = borderAll;
  }
  for (let i in ws2) {
    if (i === '!merges' || i === '!ref' || i === '!cols') continue;
    if (!ws2[i].s) ws2[i].s = {};
    ws2[i].s.border = borderAll;
  }

  XLSX.utils.book_append_sheet(wb, ws1, "每日用电能耗汇总");
  XLSX.utils.book_append_sheet(wb, ws2, "能耗汇总统计");
  XLSX.writeFile(wb, `${config.酒店名称 || "国信金融酒店"}${year}年${month}月能耗汇总.xlsx`);
}
