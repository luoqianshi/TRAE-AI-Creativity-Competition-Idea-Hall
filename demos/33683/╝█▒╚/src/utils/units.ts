import type { UnitDef, UnitType } from '@/types';

export const UNITS: UnitDef[] = [
  // 体积
  { id: 'ml', label: 'ml', type: 'volume', toBase: 1 },
  { id: 'L', label: 'L', type: 'volume', toBase: 1000 },
  // 重量
  { id: 'g', label: 'g', type: 'weight', toBase: 1 },
  { id: 'kg', label: 'kg', type: 'weight', toBase: 1000 },
  // 数量
  { id: '片', label: '片', type: 'count', toBase: 1 },
  { id: '包', label: '包', type: 'count', toBase: 1 },
  { id: '袋', label: '袋', type: 'count', toBase: 1 },
  { id: '个', label: '个', type: 'count', toBase: 1 },
  { id: '只', label: '只', type: 'count', toBase: 1 },
  { id: '条', label: '条', type: 'count', toBase: 1 },
  { id: '罐', label: '罐', type: 'count', toBase: 1 },
  { id: '瓶', label: '瓶', type: 'count', toBase: 1 },
  // 次数
  { id: '次', label: '次', type: 'times', toBase: 1 },
  { id: '回', label: '回', type: 'times', toBase: 1 },
  { id: '份', label: '份', type: 'times', toBase: 1 },
];

const UNIT_MAP = new Map<string, UnitDef>();
UNITS.forEach((u) => UNIT_MAP.set(u.id, u));

export function getUnit(id: string): UnitDef | undefined {
  return UNIT_MAP.get(id);
}

export function getUnitType(id: string): UnitType | undefined {
  return UNIT_MAP.get(id)?.type;
}

export function canCompare(unitA: string, unitB: string): boolean {
  const a = getUnit(unitA);
  const b = getUnit(unitB);
  if (!a || !b) return false;
  return a.type === b.type;
}

export function getAllUnitTypes(units: string[]): UnitType[] {
  const types = new Set<UnitType>();
  units.forEach((u) => {
    const def = getUnit(u);
    if (def) types.add(def.type);
  });
  return Array.from(types);
}

export function getBaseUnit(type: UnitType): string {
  switch (type) {
    case 'volume': return 'ml';
    case 'weight': return 'g';
    case 'count': return '个';
    case 'times': return '次';
  }
}

export const QUICK_QUANTITIES = [250, 500, 1000, 2000];