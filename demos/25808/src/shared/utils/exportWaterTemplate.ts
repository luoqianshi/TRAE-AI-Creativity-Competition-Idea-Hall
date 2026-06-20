import * as XLSX from 'xlsx-js-style';
import { getDynamicMeterNames } from './excelHelpers';

export function exportWaterTemplate(historyData: any[], config: any) {
  const { hotelWaterName, fountainWaterName } = getDynamicMeterNames();
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
  const bgLightBlue = { fgColor: { rgb: "DCE6F1" } };
  const bgLightGray = { fgColor: { rgb: "E7E6E6" } };

  const waterSheetData = [];

  waterSheetData.push([
    { v: `${config.酒店名称 || "国信金融酒店"}${year}年${month}月每日用水能耗汇总`, s: { font: { sz: 16, bold: true }, alignment: alignCenter, fill: bgLightBlue } },
    '', '', '', '', '', '', '', '', ''
  ]);

  waterSheetData.push([
    { v: '日期', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: hotelWaterName, s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '用水量（立方）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '费用', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: fountainWaterName, s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '用水量（立方）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '费用', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '单价', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '总用量', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '总费用', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } }
  ]);

  let lastWater1 = sortedData.length > 0 ? (sortedData[0].酒店水表 || 27798) : 27798;
  let lastWater2 = sortedData.length > 0 ? (sortedData[0].喷泉水表 || 2849) : 2849;

  waterSheetData.push([
    { v: '上月表底数', s: { font: fontRed, alignment: alignCenter } },
    { v: lastWater1, s: { alignment: alignCenter } }, '', '',
    { v: lastWater2, s: { alignment: alignCenter } }, '', '',
    { v: (config.水费单价 || 5.45) + '元/吨', s: { font: fontRed, alignment: alignCenter } },
    '', ''
  ]);

  const loopData = sortedData.length > 0 ? sortedData : [
    { 日期: `${year}-${String(month).padStart(2, '0')}-01`, 酒店水表: lastWater1 + 172, 喷泉水表: lastWater2 + 5 }
  ];

  let running1 = lastWater1;
  let running2 = lastWater2;

  loopData.forEach((row) => {
    let w1 = Number(row.酒店水表 || running1);
    let w2 = Number(row.喷泉水表 || running2);
    let uW1 = Math.max(0, w1 - running1);
    let uW2 = Math.max(0, w2 - running2);

    const usePrice = config.水费单价 || 5.45;

    let cost1 = uW1 * usePrice;
    let cost2 = uW2 * usePrice;

    let totalVol = uW1 + uW2;
    let totalCost = cost1 + cost2;

    const dateObj = new Date(row.日期);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;

    waterSheetData.push([
      { v: dateStr, s: { alignment: alignCenter } },
      { v: w1.toFixed(0), s: { alignment: alignCenter } },
      { v: uW1.toFixed(0), s: { alignment: alignCenter } },
      { v: cost1.toFixed(2), s: { font: fontRed, alignment: alignCenter } },
      { v: w2.toFixed(0), s: { alignment: alignCenter } },
      { v: uW2.toFixed(0), s: { alignment: alignCenter } },
      { v: cost2.toFixed(2), s: { font: fontRed, alignment: alignCenter } },
      { v: usePrice.toFixed(2), s: { alignment: alignCenter } },
      { v: totalVol.toFixed(0), s: { font: fontRed, alignment: alignCenter } },
      { v: totalCost.toFixed(2), s: { font: fontRed, alignment: alignCenter } }
    ]);

    running1 = w1;
    running2 = w2;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(waterSheetData);

  ws['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 11 }, { wch: 12 }, { wch: 14 },
    { wch: 11 }, { wch: 11 }, { wch: 12 }, { wch: 12 }
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }
  ];

  for (let i in ws) {
    if (i === '!merges' || i === '!ref' || i === '!cols') continue;
    if (!ws[i].s) ws[i].s = {};
    ws[i].s.border = borderAll;
  }

  XLSX.utils.book_append_sheet(wb, ws, "每日用水能耗汇总");
  XLSX.writeFile(wb, `${config.酒店名称 || "国信金融酒店"}${year}年${month}月每日用水能耗汇总.xlsx`);
}
