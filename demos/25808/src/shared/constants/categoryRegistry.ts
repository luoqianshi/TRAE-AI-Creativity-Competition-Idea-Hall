/**
 * 能源分类注册表
 * 用于定义系统中支持的能源类型，支持行业通用化改造
 */
export interface EnergyCategory {
  /** 分类唯一标识（英文） */
  id: string;
  /** 分类显示名称（中文） */
  name: string;
  /** 分类图标 */
  icon: string;
  /** 默认单位 */
  defaultUnit: string;
  /** 分类颜色 */
  color: string;
  /** 分类描述 */
  description?: string;
}

/**
 * 默认能源分类注册表
 * 酒店行业默认包含：电力、给水、燃气
 */
export const DEFAULT_ENERGY_CATEGORIES: EnergyCategory[] = [
  {
    id: 'electricity',
    name: '电力',
    icon: 'zap',
    defaultUnit: '度',
    color: '#f59e0b',
    description: '电力消耗',
  },
  {
    id: 'water',
    name: '给水',
    icon: 'droplet',
    defaultUnit: '吨',
    color: '#3b82f6',
    description: '水资源消耗',
  },
  {
    id: 'gas',
    name: '燃气',
    icon: 'flame',
    defaultUnit: '立方米',
    color: '#ef4444',
    description: '燃气消耗',
  },
];

/**
 * 获取分类映射（兼容旧代码）
 */
export const CATEGORY_MAPPING: Record<string, "电" | "水" | "气"> = {
  electricity: "电",
  water: "水",
  gas: "气",
};

/**
 * 反向分类映射
 */
export const REVERSE_CATEGORY_MAPPING: Record<"电" | "水" | "气", string> = {
  "电": "electricity",
  "水": "water",
  "气": "gas",
};

/**
 * 根据分类ID获取分类信息
 */
export function getCategoryById(id: string): EnergyCategory | undefined {
  return DEFAULT_ENERGY_CATEGORIES.find(c => c.id === id);
}

/**
 * 根据分类名称获取分类信息
 */
export function getCategoryByName(name: string): EnergyCategory | undefined {
  return DEFAULT_ENERGY_CATEGORIES.find(c => c.name === name);
}

/**
 * 将旧版分类标识（电/水/气）转换为新版分类ID
 */
export function legacyToCategoryId(legacy: "电" | "水" | "气"): string {
  return REVERSE_CATEGORY_MAPPING[legacy] || legacy;
}

/**
 * 将新版分类ID转换为旧版分类标识
 */
export function categoryIdToLegacy(id: string): "电" | "水" | "气" | string {
  return CATEGORY_MAPPING[id] || id;
}
