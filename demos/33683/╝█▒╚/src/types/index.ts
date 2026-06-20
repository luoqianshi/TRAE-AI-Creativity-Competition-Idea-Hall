export type UnitType = 'volume' | 'weight' | 'count' | 'times';

export interface UnitDef {
  id: string;
  label: string;
  type: UnitType;
  toBase: number;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface CompareResult {
  productId: string;
  unitPrice: number;
  normalizedUnit: string;
  rank: number;
  isBest: boolean;
  priceDiffPercent: number | null;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  products: Product[];
  results: CompareResult[];
}