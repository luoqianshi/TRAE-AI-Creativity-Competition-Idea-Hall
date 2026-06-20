import { dailyRepository } from '../repositories/dailyRepository';
import { monthlyRepository } from '../repositories/monthlyRepository';
import { configRepository } from '../repositories/configRepository';
import logger from '../utils/logger';

const ELECTRICITY_FIELDS = ['李体线电表', '午沙线电表'];
const WATER_FIELDS = ['酒店水表', '喷泉水表'];
const GAS_FIELDS = ['天然气表', '气_锅炉1', '气_锅炉2', '气_锅炉3', '气_3F宴会', '气_4F自助', '气_4F拾鲜'];
const DEFAULT_RATIO = 3500;

export const recordsService = {
  async getRatio() {
    try {
      const config = await configRepository.findByKey('限额配置');
      if (config) {
        const parsed = JSON.parse(config.value);
        return parsed.电表换算基数 ?? DEFAULT_RATIO;
      }
    } catch (error) {
      logger.error('获取电表换算基数失败:', error);
    }
    return DEFAULT_RATIO;
  },

  async getDailyStatistics(month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    
    const records = await dailyRepository.findAll(startDate, endDate);
    const daysInMonth = endDate.getDate();
    const ratio = await this.getRatio();
    
    const result: { date: string; electricity: number; water: number; gas: number }[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const record = records.find(r => {
        const recordDate = new Date(r.date);
        return recordDate.getFullYear() === year && 
               recordDate.getMonth() + 1 === monthNum && 
               recordDate.getDate() === day;
      });
      
      let electricity = 0;
      let water = 0;
      let gas = 0;
      
      if (record) {
        const readings = JSON.parse(record.readings);
        
        ELECTRICITY_FIELDS.forEach(field => {
          if (readings[field] !== undefined) {
            electricity += Number(readings[field]) * ratio;
          }
        });
        
        WATER_FIELDS.forEach(field => {
          if (readings[field] !== undefined) {
            water += Number(readings[field]);
          }
        });
        
        GAS_FIELDS.forEach(field => {
          if (readings[field] !== undefined) {
            gas += Number(readings[field]);
          }
        });
      }
      
      result.push({
        date: String(day),
        electricity,
        water,
        gas
      });
    }
    
    return result;
  },

  async getDailyRecords(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const records = await dailyRepository.findAll(start, end);

    return records.map((r) => ({
      ...r,
      readings: JSON.parse(r.readings),
    }));
  },

  async getDailyRecordByDate(date: string) {
    const d = new Date(date);
    const record = await dailyRepository.findByDate(d);
    if (!record) return null;
    return {
      ...record,
      readings: JSON.parse(record.readings),
    };
  },

  async saveDailyRecord(date: string, readings: Record<string, any>) {
    const d = new Date(date);
    return dailyRepository.upsert(d, readings);
  },

  async getMonthlyRecords(month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const monthDate = new Date(year, monthNum - 1, 1);
    return monthlyRepository.findByMonth(monthDate);
  },

  async saveMonthlyRecords(month: string, records: Array<{
    circuitId: string;
    value: number;
    swap?: boolean;
    oldFinal?: number;
    newStart?: number;
  }>) {
    const [year, monthNum] = month.split('-').map(Number);
    const monthDate = new Date(year, monthNum - 1, 1);
    return monthlyRepository.upsertBatch(monthDate, records);
  },
};
