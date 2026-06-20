import { 字典配置 } from "../types";

export interface DailyPricing {
  电费单价: number;
  水费单价: number;
  气费单价: number;
}

export function getBillingPriceAtDate(
  _dateStr: string,
  config: 字典配置,
): DailyPricing {
  return {
    电费单价: config.电费单价 || 0,
    水费单价: config.水费单价 || 0,
    气费单价: config.气费单价 || 0,
  };
}

export function getFieldConsumption(
  record: any,
  prevRecord: any | null,
  fieldId: string,
  category: string,
  ratio: number
): number {
  const currentVal = record[fieldId] !== undefined && record[fieldId] !== null ? Number(record[fieldId]) : 0;
  let prevVal = prevRecord && prevRecord[fieldId] !== undefined && prevRecord[fieldId] !== null ? Number(prevRecord[fieldId]) : 0;

  if (!prevRecord) {
    let delta = 0;
    if (category === "电") {
      delta = fieldId === "李体线电表" ? 10 : 5;
    } else if (category === "水") {
      delta = fieldId === "酒店水表" ? 5 : 2;
    } else if (category === "气") {
      delta = 10;
    }
    prevVal = Math.max(0, currentVal - delta);
  }

  let rawDiff = 0;
  const isSwapped = record[`swap_${fieldId}`] === true || record[`swap_${fieldId}`] === "true";

  if (isSwapped) {
    const oldFinal = record[`old_final_${fieldId}`] !== undefined && record[`old_final_${fieldId}`] !== null && record[`old_final_${fieldId}`] !== ""
      ? Number(record[`old_final_${fieldId}`]) 
      : prevVal;
    const newStart = record[`new_start_${fieldId}`] !== undefined && record[`new_start_${fieldId}`] !== null && record[`new_start_${fieldId}`] !== ""
      ? Number(record[`new_start_${fieldId}`]) 
      : 0;

    rawDiff = Math.max(0, oldFinal - prevVal) + Math.max(0, currentVal - newStart);
  } else {
    rawDiff = Math.max(0, currentVal - prevVal);
  }

  if (category === "电") {
    return rawDiff * ratio;
  }
  return rawDiff;
}
