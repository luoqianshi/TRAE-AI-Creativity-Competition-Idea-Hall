import * as XLSX from 'xlsx-js-style';
import { getDynamicMeterNames } from './excelHelpers';

export function exportElectricityTemplate(historyData: any[], config: any) {
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
    { v: `单价：${config.电费单价 || 0.68}元/Kwh`, s: { font: fontBold, alignment: { horizontal: 'right', vertical: 'center' } } }, ''
  ]);

  electricSheetData.push([
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

  let lastElec1 = sortedData.length > 0 ? (sortedData[0].李体线电表 || 4025.69) : 4022.00;
  let lastElec2 = sortedData.length > 0 ? (sortedData[0].午沙线电表 || 0) : 0;

  electricSheetData.push([
    { v: '上月表底数', s: { font: fontRed, alignment: alignCenter } },
    { v: lastElec1, s: { alignment: alignCenter } },
    { v: 0, s: { alignment: alignCenter } }, { v: 0, s: { alignment: alignCenter } }, { v: config.电费单价 || 0.68, s: { alignment: alignCenter } }, { v: 0, s: { font: fontRed, alignment: alignCenter } },
    { v: lastElec2, s: { alignment: alignCenter } },
    { v: 0, s: { alignment: alignCenter } }, { v: 0, s: { alignment: alignCenter } }, { v: config.电费单价 || 0.68, s: { alignment: alignCenter } }, { v: 0, s: { font: fontRed, alignment: alignCenter } },
    { v: 0, s: { font: fontRed, alignment: alignCenter } }, { v: 0, s: { font: fontRed, alignment: alignCenter } }
  ]);

  const ratio = config.电表换算基数 ?? 3500;
  const loopData = sortedData.length > 0 ? sortedData : [
    { 日期: `${year}-${String(month).padStart(2, '0')}-01`, 李体线电表: lastElec1 + 3.33 / ratio, 午沙线电表: lastElec2 }
  ];

  let running1 = lastElec1;
  let running2 = lastElec2;

  loopData.forEach((row) => {
    const hasE1 = row.李体线电表 !== undefined && row.李体线电表 !== null && row.李体线电表 !== "";
    const hasE2 = row.午沙线电表 !== undefined && row.午沙线电表 !== null && row.午沙线电表 !== "";

    let e1 = hasE1 ? Number(row.李体线电表) : running1;
    let e2 = hasE2 ? Number(row.午沙线电表) : running2;

    let u1 = hasE1 ? Math.max(0, e1 - running1) : 0;
    let u2 = hasE2 ? Math.max(0, e2 - running2) : 0;

    let kwh1 = u1 * ratio;
    let kwh2 = u2 * ratio;

    const useElecPrice = config.电费单价 || 0.68;

    let cost1 = kwh1 * useElecPrice;
    let cost2 = kwh2 * useElecPrice;

    let totalKwh = kwh1 + kwh2;
    let totalCost = cost1 + cost2;

    const dateObj = new Date(row.日期);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;

    electricSheetData.push([
      { v: dateStr, s: { alignment: alignCenter } },
      { v: hasE1 ? e1.toFixed(2) : "", s: { alignment: alignCenter } },
      { v: hasE1 ? u1.toFixed(2) : "", s: { alignment: alignCenter } },
      { v: hasE1 ? kwh1.toFixed(0) : "", s: { alignment: alignCenter } },
      { v: useElecPrice.toFixed(2), s: { alignment: alignCenter } },
      { v: hasE1 ? cost1.toFixed(1) : "", s: { font: fontRed, alignment: alignCenter } },
      { v: hasE2 ? e2.toFixed(2) : "", s: { alignment: alignCenter } },
      { v: hasE2 ? u2.toFixed(2) : "", s: { alignment: alignCenter } },
      { v: hasE2 ? kwh2.toFixed(0) : "", s: { alignment: alignCenter } },
      { v: useElecPrice.toFixed(2), s: { alignment: alignCenter } },
      { v: hasE2 ? cost2.toFixed(1) : "", s: { font: fontRed, alignment: alignCenter } },
      { v: totalKwh.toFixed(0), s: { font: fontRed, alignment: alignCenter } },
      { v: totalCost.toFixed(1), s: { font: fontRed, alignment: alignCenter } }
    ]);

    if (hasE1) running1 = e1;
    if (hasE2) running2 = e2;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(electricSheetData);

  ws['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 13 }, { wch: 8 }, { wch: 11 },
    { wch: 10 }, { wch: 8 }, { wch: 13 }, { wch: 8 }, { wch: 11 },
    { wch: 18 }, { wch: 14 }
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
    { s: { r: 2, c: 1 }, e: { r: 2, c: 5 } },
    { s: { r: 2, c: 6 }, e: { r: 2, c: 10 } },
    { s: { r: 2, c: 11 }, e: { r: 2, c: 12 } },
  ];

  for (let i in ws) {
    if (i === '!merges' || i === '!ref' || i === '!cols') continue;
    if (!ws[i].s) ws[i].s = {};
    ws[i].s.border = borderAll;
  }

  XLSX.utils.book_append_sheet(wb, ws, "每日用电能耗汇总");
  XLSX.writeFile(wb, `${config.酒店名称 || "国信金融酒店"}${year}年${month}月每日用电能耗汇总.xlsx`);
}
