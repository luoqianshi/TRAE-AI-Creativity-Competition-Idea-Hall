import * as XLSX from 'xlsx-js-style';
import { getPrice, getFieldConsumption } from './pricing';
import { DailyFieldConfig } from '../types';

export function exportAllToExcel(
  month: string,
  year: string,
  config: any,
  dailyFields: DailyFieldConfig[],
  dailyData: any[],
  dailySummaries: any[],
  monthlyDetailData: any[],
  monthlySummaries: any[]
) {
  const wb = XLSX.utils.book_new();

  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const allDaysForMonth = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return `${y}-${String(m).padStart(2, '0')}-${d}`;
  });

  const getRecordForDate = (date: string) => dailyData.find(d => d.日期 === date) || { 日期: date };
  const getPrevRecord = (date: string) => {
    const sorted = [...dailyData].sort((a, b) => a.日期.localeCompare(b.日期));
    const idx = sorted.findIndex(r => r.日期 === date);
    return idx > 0 ? sorted[idx - 1] : null;
  };

  const createDailyDetailSheet = (fields: DailyFieldConfig[], sheetName: string) => {
    const headers = ['日期'];
    fields.forEach(f => {
      headers.push(`${f.name} (底数)`, `${f.name} (上次底数)`, `${f.name} (用量)`, `${f.name} (单价)`, `${f.name} (费用)`);
    });

    const sheetData = allDaysForMonth.map(date => {
      const record = getRecordForDate(date);
      const prevRecord = getPrevRecord(date);

      const row = [date];
      fields.forEach(f => {
        const ratio = config.电表换算基数 ?? 3500;
        const usage = getFieldConsumption(record, prevRecord, f.id, f.category, ratio);
        const priceResult = getPrice(f.id, date, config, fields);
        const price = priceResult.单价 > 0 ? priceResult.单价 : 0;

        const currentReading = record[f.id] ?? 0;
        const prevReading = prevRecord ? (prevRecord[f.id] ?? 0) : 0;

        row.push(currentReading, prevReading, usage.toFixed(2), price.toFixed(2), (usage * price).toFixed(2));
      });
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sheetData]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  createDailyDetailSheet(dailyFields.filter(f => f.category === '电'), "日常电表明细");
  createDailyDetailSheet(dailyFields.filter(f => f.category === '水'), "日常水表明细");
  createDailyDetailSheet(dailyFields.filter(f => f.category === '气'), "日常气表明细");

  const wsDailySummary = XLSX.utils.json_to_sheet(dailySummaries.filter(d => d.日期.startsWith(month)));
  XLSX.utils.book_append_sheet(wb, wsDailySummary, "日常汇总");

  const wsMonthlyDetail = XLSX.utils.json_to_sheet(monthlyDetailData.filter(m => m.月份 === month));
  XLSX.utils.book_append_sheet(wb, wsMonthlyDetail, "月度明细");

  const wsMonthlySummary = XLSX.utils.json_to_sheet(monthlySummaries.filter(m => m.月份.startsWith(year)));
  XLSX.utils.book_append_sheet(wb, wsMonthlySummary, "月度汇总");

  XLSX.writeFile(wb, `${month}全部数据导出.xlsx`);
}
