import * as XLSX from 'xlsx-js-style';

export function exportGasTemplate(historyData: any[], config: any) {
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
  const bgLightGray = { fgColor: { rgb: "E7E6E6" } };
  const bgTan = { fgColor: { rgb: "F2E8DC" } };

  const gasSheetData = [];

  gasSheetData.push([
    { v: `${config.酒店名称 || "国信金融酒店"}${year}年${month}月天然气每日能耗汇总`, s: { font: { sz: 16, bold: true }, alignment: alignCenter, fill: bgTan } },
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);

  gasSheetData.push([
    { v: '日期', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '锅炉房1', s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '',
    { v: '锅炉房2', s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '',
    { v: '锅炉房3', s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '',
    { v: '锅炉房总用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '锅炉房总费用', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '3楼宴会厨房', s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '',
    { v: '四楼自助', s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '',
    { v: '四楼早茶', s: { alignment: alignCenter, fill: bgLightGray } }, '', '', '',
    { v: '厨房总用量', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '厨房总费用', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '天然气总单价', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '燃气每日总量', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } },
    { v: '每日总费用', s: { font: fontRed, alignment: alignCenter, fill: bgLightGray } }
  ]);

  gasSheetData.push([
    '',
    { v: '表数', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '费用', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '余量（元）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '表数', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '费用', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '余量（元）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '表数', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '费用', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '余量（元）', s: { alignment: alignCenter, fill: bgLightGray } },
    '', '',
    { v: '表数', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '费用', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '余量（元）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '表数', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '费用', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '余量（元）', s: { alignment: alignCenter, fill: bgLightGray } },
    { v: '表数', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '用量', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '费用', s: { alignment: alignCenter, fill: bgLightGray } }, { v: '余量（元）', s: { alignment: alignCenter, fill: bgLightGray } },
    '', '', '', '', ''
  ]);

  let initBoiler1 = sortedData.length > 0 ? (sortedData[0].气_锅炉1 || 780590) : 780590;
  let initBoiler2 = sortedData.length > 0 ? (sortedData[0].气_锅炉2 || 799145) : 799145;
  let initBoiler3 = sortedData.length > 0 ? (sortedData[0].气_锅炉3 || 748639) : 748639;
  let initKitchen1 = sortedData.length > 0 ? (sortedData[0].气_3F宴会 || 78681) : 78681;
  let initKitchen2 = sortedData.length > 0 ? (sortedData[0].气_4F自助 || 67438) : 67438;
  let initKitchen3 = sortedData.length > 0 ? (sortedData[0].气_4F拾鲜 || 116130) : 116130;

  gasSheetData.push([
    { v: '表底数', s: { font: fontRed, alignment: alignCenter } },
    { v: initBoiler1, s: { alignment: alignCenter } }, '', '', '',
    { v: initBoiler2, s: { alignment: alignCenter } }, '', '', '',
    { v: initBoiler3, s: { alignment: alignCenter } }, '', '', '',
    '', '',
    { v: initKitchen1, s: { alignment: alignCenter } }, '', '', '',
    { v: initKitchen2, s: { alignment: alignCenter } }, '', '', '',
    { v: initKitchen3, s: { alignment: alignCenter } }, '', '', '',
    '', '', '', '', ''
  ]);

  const loopData = sortedData.length > 0 ? sortedData : [
    { 日期: `${year}-${String(month).padStart(2, '0')}-01`, 气_锅炉1: initBoiler1, 气_锅炉2: initBoiler2 + 463, 气_锅炉3: initBoiler3, 气_3F宴会: initKitchen1 + 71, 气_4F自助: initKitchen2 + 79, 气_4F拾鲜: initKitchen3 + 84 }
  ];

  let rB1 = initBoiler1, rB2 = initBoiler2, rB3 = initBoiler3;
  let rK1 = initKitchen1, rK2 = initKitchen2, rK3 = initKitchen3;

  loopData.forEach((row) => {
    let b1 = Number(row.气_锅炉1 || rB1);
    let b2 = Number(row.气_锅炉2 || rB2);
    let b3 = Number(row.气_锅炉3 || rB3);
    let k1 = Number(row.气_3F宴会 || rK1);
    let k2 = Number(row.气_4F自助 || rK2);
    let k3 = Number(row.气_4F拾鲜 || rK3);

    let uB1 = Math.max(0, b1 - rB1);
    let uB2 = Math.max(0, b2 - rB2);
    let uB3 = Math.max(0, b3 - rB3);
    let uK1 = Math.max(0, k1 - rK1);
    let uK2 = Math.max(0, k2 - rK2);
    let uK3 = Math.max(0, k3 - rK3);

    const usePrice = config.气费单价 || 4.60;

    let cB1 = uB1 * usePrice;
    let cB2 = uB2 * usePrice;
    let cB3 = uB3 * usePrice;
    let cK1 = uK1 * usePrice;
    let cK2 = uK2 * usePrice;
    let cK3 = uK3 * usePrice;

    let sumBoilerVol = uB1 + uB2 + uB3;
    let sumBoilerCost = cB1 + cB2 + cB3;

    let sumKitchenVol = uK1 + uK2 + uK3;
    let sumKitchenCost = cK1 + cK2 + cK3;

    let totalVol = sumBoilerVol + sumKitchenVol;
    let totalCost = sumBoilerCost + sumKitchenCost;

    const dateObj = new Date(row.日期);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;

    gasSheetData.push([
      { v: dateStr, s: { alignment: alignCenter } },
      { v: b1.toFixed(0), s: { alignment: alignCenter } }, { v: uB1.toFixed(0), s: { alignment: alignCenter } }, { v: cB1.toFixed(1), s: { alignment: alignCenter } }, '',
      { v: b2.toFixed(0), s: { alignment: alignCenter } }, { v: uB2.toFixed(0), s: { alignment: alignCenter } }, { v: cB2.toFixed(1), s: { alignment: alignCenter } }, '',
      { v: b3.toFixed(0), s: { alignment: alignCenter } }, { v: uB3.toFixed(0), s: { alignment: alignCenter } }, { v: cB3.toFixed(1), s: { alignment: alignCenter } }, '',
      { v: sumBoilerVol.toFixed(0), s: { alignment: alignCenter } },
      { v: sumBoilerCost.toFixed(1), s: { font: fontRed, alignment: alignCenter } },
      { v: k1.toFixed(0), s: { alignment: alignCenter } }, { v: uK1.toFixed(0), s: { alignment: alignCenter } }, { v: cK1.toFixed(1), s: { alignment: alignCenter } }, '',
      { v: k2.toFixed(0), s: { alignment: alignCenter } }, { v: uK2.toFixed(0), s: { alignment: alignCenter } }, { v: cK2.toFixed(1), s: { alignment: alignCenter } }, '',
      { v: k3.toFixed(0), s: { alignment: alignCenter } }, { v: uK3.toFixed(0), s: { alignment: alignCenter } }, { v: cK3.toFixed(1), s: { alignment: alignCenter } }, '',
      { v: sumKitchenVol.toFixed(0), s: { alignment: alignCenter } },
      { v: sumKitchenCost.toFixed(1), s: { font: fontRed, alignment: alignCenter } },
      { v: usePrice.toFixed(2), s: { alignment: alignCenter } },
      { v: totalVol.toFixed(0), s: { font: fontRed, alignment: alignCenter } },
      { v: totalCost.toFixed(1), s: { font: fontRed, alignment: alignCenter } }
    ]);

    rB1 = b1; rB2 = b2; rB3 = b3;
    rK1 = k1; rK2 = k2; rK3 = k3;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(gasSheetData);

  ws['!cols'] = Array(32).fill({ wch: 10 });
  ws['!cols'][0] = { wch: 12 };

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 31 } },
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },
    { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },
    { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } },
    { s: { r: 1, c: 9 }, e: { r: 1, c: 12 } },
    { s: { r: 1, c: 13 }, e: { r: 2, c: 13 } },
    { s: { r: 1, c: 14 }, e: { r: 2, c: 14 } },
    { s: { r: 1, c: 15 }, e: { r: 1, c: 18 } },
    { s: { r: 1, c: 19 }, e: { r: 1, c: 22 } },
    { s: { r: 1, c: 23 }, e: { r: 1, c: 26 } },
    { s: { r: 1, c: 27 }, e: { r: 2, c: 27 } },
    { s: { r: 1, c: 28 }, e: { r: 2, c: 28 } },
    { s: { r: 1, c: 29 }, e: { r: 2, c: 29 } },
    { s: { r: 1, c: 30 }, e: { r: 2, c: 30 } },
    { s: { r: 1, c: 31 }, e: { r: 2, c: 31 } }
  ];

  for (let i in ws) {
    if (i === '!merges' || i === '!ref' || i === '!cols') continue;
    if (!ws[i].s) ws[i].s = {};
    ws[i].s.border = borderAll;
  }

  XLSX.utils.book_append_sheet(wb, ws, "天然气每日能耗汇总");
  XLSX.writeFile(wb, `${config.酒店名称 || "国信金融酒店"}${year}年${month}月天然气每日能耗汇总.xlsx`);
}
