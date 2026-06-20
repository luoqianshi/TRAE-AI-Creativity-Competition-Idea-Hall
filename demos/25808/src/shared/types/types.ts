export type AppRoute =
  | "登录"
  | "能效大盘"
  | "日常抄表"
  | "月度大盘"
  | "字典配置"
  | "用电看板"
  | "用水看板"
  | "用气看板"
  | "历史抄表库";

/**
 * 能源分类配置
 */
export interface 能源分类配置 {
  id: string;
  name: string;
  icon: string;
  defaultUnit: string;
  color: string;
  description?: string;
}

export interface 抄表记录 {
  日期: string;
  李体线电表?: number; // 单位：度
  午沙线电表?: number; // 单位：度
  酒店水表?: number; // 单位：吨
  喷泉水表?: number; // 单位：吨
  天然气表?: number; // 保留兼容历史
  气_锅炉1?: number;
  气_锅炉2?: number;
  气_锅炉3?: number;
  气_3F宴会?: number;
  气_4F自助?: number;
  气_4F拾鲜?: number;
  [key: string]: any; // Index signature for dynamic fields
}

export interface 单价变动事件 {
  id: string;
  生效日期: string; // YYYY-MM-DD
  结束日期?: string; // YYYY-MM-DD, 为空或 undefined 则代表"至今"
  电费单价: number; // 元 / 度
  水费单价: number; // 元 / 吨
  气费单价: number; // 元 / 立方米
  备注?: string;
  操作人?: string;
}

/**
 * 价格查询结果
 */
export interface 价格查询结果 {
  单价: number;
  状态: 'found' | 'not_found' | 'unconfigured';
  回路名称?: string;
  告警信息?: string;
  建议单价?: number;
}

/**
 * 回路价格历史
 */
export interface 回路价格历史 {
  回路id: string;
  回路名称: string;
  默认单价: number;
  历史记录: 单价变动事件[];
}

/**
 * 字段允许误差配置
 */
export interface 字段允许误差配置 {
  fieldId: string;
  delta: number; // 默认回退差值
}

/**
 * 字典配置
 */
export interface 字典配置 {
  /** 能源分类列表（支持自定义行业分类） */
  能源分类列表?: 能源分类配置[];
  李体线电表上限: number;
  午沙线电表上限: number;
  酒店水表上限: number;
  喷泉水表上限: number;
  天然气表上限: number;
  /** 各字段允许误差配置 */
  允许误差配置?: 字段允许误差配置[];
  电费单价: number; // 元 / 度
  水费单价: number; // 元 / 吨
  气费单价: number; // 元 / 立方米
  日常汇总配置: string;
  月度汇总配置: string;
  对账日?: number; // 酒店用电对账日 (e.g., 28代表每月28日进行对账)
  酒店名称?: string;
  电费户号?: string;
  李体线表号?: string;
  午沙线表号?: string;
  电表换算基数?: number;
  /** 各回路的价格历史列表 */
  回路价格历史列表?: 回路价格历史[];
}

export interface 当前用户 {
  账号: string;
  姓名: string;
  角色: "超级管理员" | "工程总监" | "工程主管";
  状态: "启用" | "禁用";
}

export interface 月度抄表记录 {
  月份: string; // 格式: YYYY-MM
  抄表人: string;
  数据: { [key: string]: any };
}

export interface DailyFieldConfig {
  id: string;
  name: string;
  category: "电" | "水" | "气" | string;
  unit: string;
  limit: number;
  [key: string]: any;
}

export interface GasGroupConfig {
  id: string;
  name: string;
  memberIds: string[];
}

export interface MonthlyCircuitConfig {
  category: string;
  id: string;
  name: string;
  [key: string]: any;
}
