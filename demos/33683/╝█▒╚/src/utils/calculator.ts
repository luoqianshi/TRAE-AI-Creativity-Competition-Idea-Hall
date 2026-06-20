import type { Product, CompareResult } from '@/types';
import { getUnit, getUnitType, canCompare, getBaseUnit } from './units';

/**
 * 宽容解析价格字符串
 * 支持 "12.5"、"12.5元"、"￥12.5"、"¥12.5"
 */
export function parsePrice(input: string): number | null {
  if (!input.trim()) return null;
  const cleaned = input.replace(/[¥￥\s元]/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * 100) / 100;
}

/**
 * 计算单个商品的单价（元/基准单位）
 */
export function calcUnitPrice(product: Product): number | null {
  const unit = getUnit(product.unit);
  if (!unit) return null;
  if (product.quantity <= 0) return null;
  const baseQuantity = product.quantity * unit.toBase;
  return product.price / baseQuantity;
}

/**
 * 判断商品是否完整填写（可参与对比）
 */
export function isProductComplete(product: Product): boolean {
  return product.quantity > 0 && product.unit !== '' && product.price > 0;
}

/**
 * 对比多个商品，返回排序结果
 * 返回 null 表示无法对比（单位不统一或不足2个商品）
 */
export function compareProducts(products: Product[]): {
  results: CompareResult[];
  unitType: string;
  comparable: boolean;
  message: string | null;
} | null {
  const complete = products.filter(isProductComplete);

  if (complete.length < 2) {
    return null;
  }

  // 检查单位类型是否统一
  const types = new Set(complete.map((p) => getUnitType(p.unit)));
  if (types.size > 1) {
    return null;
  }

  const unitType = getUnitType(complete[0].unit)!;
  const baseUnit = getBaseUnit(unitType);

  // 计算每个商品的单价
  const withPrices = complete.map((p) => {
    const unitPrice = calcUnitPrice(p);
    return { product: p, unitPrice: unitPrice! };
  });

  // 按单价排序（升序）
  withPrices.sort((a, b) => a.unitPrice - b.unitPrice);

  const bestPrice = withPrices[0].unitPrice;

  const results: CompareResult[] = withPrices.map((item, index) => {
    const isBest = item.unitPrice === bestPrice;
    const priceDiffPercent = isBest
      ? null
      : Math.round(((item.unitPrice - bestPrice) / bestPrice) * 100);

    return {
      productId: item.product.id,
      unitPrice: item.unitPrice,
      normalizedUnit: baseUnit,
      rank: index + 1,
      isBest,
      priceDiffPercent,
    };
  });

  // 检查是否需要换算提示
  let message: string | null = null;
  const hasConversion = complete.some((p) => {
    const unit = getUnit(p.unit);
    return unit && unit.id !== baseUnit;
  });
  if (hasConversion) {
    message = '已自动换算为统一单位';
  }

  return { results, unitType, comparable: true, message };
}

/**
 * 格式化单价显示
 */
export function formatUnitPrice(unitPrice: number, baseUnit: string): string {
  if (unitPrice < 0.01) {
    return `¥${unitPrice.toFixed(4)}/${baseUnit}`;
  }
  if (unitPrice < 1) {
    return `¥${unitPrice.toFixed(3)}/${baseUnit}`;
  }
  return `¥${unitPrice.toFixed(2)}/${baseUnit}`;
}

/**
 * 格式化单价显示（智能选择合适单位）
 */
export function formatUnitPriceSmart(unitPrice: number, _baseUnit: string): string {
  // 如果数值很大，转为更大单位显示
  if (unitPrice >= 1000) {
    return `¥${(unitPrice / 1000).toFixed(2)}/kg`;
  }
  return formatUnitPrice(unitPrice, _baseUnit);
}