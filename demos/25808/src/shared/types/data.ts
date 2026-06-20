
import { DailyFieldConfig, MonthlyCircuitConfig, 抄表记录, 月度抄表记录, 字典配置 } from './types';

export const DEFAULT_DAILY_FIELDS: DailyFieldConfig[] = [
  { id: "李体线电表", name: "李体线电表", category: "电", unit: "度", limit: 1300 },
  { id: "午沙线电表", name: "午沙线电表", category: "电", unit: "度", limit: 850 },
  { id: "酒店水表", name: "酒店水表", category: "水", unit: "吨", limit: 45 },
  { id: "喷泉水表", name: "喷泉水表", category: "水", unit: "吨", limit: 32 },
  { id: "气_锅炉1", name: "锅炉房1", category: "气", unit: "立方米", limit: 3000 },
  { id: "气_锅炉2", name: "锅炉房2", category: "气", unit: "立方米", limit: 3000 },
  { id: "气_锅炉3", name: "锅炉房3", category: "气", unit: "立方米", limit: 3000 },
  { id: "气_3F宴会", name: "3楼宴会厨房", category: "气", unit: "立方米", limit: 1000 },
  { id: "气_4F自助", name: "4楼自助", category: "气", unit: "立方米", limit: 1000 },
  { id: "气_4F拾鲜", name: "4楼拾鲜", category: "气", unit: "立方米", limit: 1500 },
];

export const DEFAULT_CIRCUITS: MonthlyCircuitConfig[] = [
  { category: "客房区域", id: "room_d05_1", name: "8-10F东客房" },
  { category: "客房区域", id: "room_d5_2", name: "1/2/3F公区照明" },
  { category: "客房区域", id: "room_d05_3", name: "5-7F西公区" },
  { category: "客房区域", id: "room_d13_2", name: "8-10F西公区" },
  { category: "客房区域", id: "room_d13_3", name: "5-10F东公区照明" },
  { category: "客房区域", id: "room_d14_1", name: "8-10F西客房" },
  { category: "客房区域", id: "room_d14_2", name: "5-7F西客房" },
  { category: "客房区域", id: "room_d15_1", name: "5-7F东客房" },

  { category: "宴会区域", id: "banq_d07_6", name: "1号宴会厅" },
  { category: "宴会区域", id: "banq_d08_1", name: "2号宴会厅" },
  { category: "宴会区域", id: "banq_d08_2", name: "3号宴会厅" },
  { category: "宴会区域", id: "banq_d08_5", name: "4号宴会厅" },
  { category: "宴会区域", id: "banq_d13_4", name: "宴会布展接电1" },
  { category: "宴会区域", id: "banq_d27_7", name: "宴会布展接电2" },
  { category: "宴会区域", id: "banq_d36_5", name: "宴会布展接电3" },
  { category: "宴会区域", id: "banq_d42_6", name: "宴会布展接电4" },

  { category: "酒店电梯", id: "elev_d28_2", name: "1-3号电梯主" },
  { category: "酒店电梯", id: "elev_d44_3", name: "1-3号电梯备" },
  { category: "酒店电梯", id: "elev_d24_3", name: "4-5号电梯主" },
  { category: "酒店电梯", id: "elev_d44_1", name: "4-5号电梯备" },
  { category: "酒店电梯", id: "elev_d28_1", name: "6-7号电梯主" },
  { category: "酒店电梯", id: "elev_d44_2", name: "6-7号电梯备" },
  { category: "酒店电梯", id: "elev_d46_3", name: "8号电梯主" },
  { category: "酒店电梯", id: "elev_d31_3", name: "8号电梯备" },
  { category: "酒店电梯", id: "elev_d46_4", name: "9号电梯主" },
  { category: "酒店电梯", id: "elev_d31_4", name: "9号电梯备" },
  { category: "酒店电梯", id: "elev_d46_6", name: "13号电梯主" },
  { category: "酒店电梯", id: "elev_d31_7", name: "13号电梯备" },
  { category: "酒店电梯", id: "elev_d46_5", name: "12号电梯主" },
  { category: "酒店电梯", id: "elev_d31_5", name: "12号电梯备" },
  { category: "酒店电梯", id: "elev_d37_4", name: "楼层普通扶梯" },
  { category: "酒店电梯", id: "elev_d31_2", name: "15号电梯主" },
  { category: "酒店电梯", id: "elev_d46_2", name: "15号电梯备" },
  { category: "酒店电梯", id: "elev_d27_5", name: "14号电梯主" },
  { category: "酒店电梯", id: "elev_d43_4", name: "14号电梯备" },

  { category: "中央空调", id: "chil_d07_2", name: "冷却塔主" },
  { category: "中央空调", id: "chil_d18_6", name: "冷却塔备" },
  { category: "中央空调", id: "chil_d38_1", name: "B3层空调1号主机" },
  { category: "中央空调", id: "chil_d24_1", name: "B3层空调2号主机" },
  { category: "中央空调", id: "chil_d24_2", name: "B3层空调3号主机" },
  { category: "中央空调", id: "chil_d39_1", name: "空调机房循环泵" },

  { category: "重点机房", id: "equip_d07_8", name: "B1层配电室空调" },
  { category: "重点机房", id: "equip_d36_4", name: "B3层生活水泵房主" },
  { category: "重点机房", id: "equip_d26_1", name: "B3层生活水泵房备" },
  { category: "重点机房", id: "equip_d36_3", name: "B3层换热机房主" },
  { category: "重点机房", id: "equip_d25_6", name: "B3层换热机房备" },
  { category: "重点机房", id: "equip_d08_3", name: "B3层冷库水泵房主" },
  { category: "重点机房", id: "equip_d18_4", name: "B3层冷库水泵房备" },
  { category: "重点机房", id: "equip_d25_5", name: "B1层锅炉房备" },
  { category: "重点机房", id: "equip_d36_1", name: "B1层锅炉房主" },

  { category: "餐饮厨房", id: "kit_d12_8", name: "大堂吧动力" },
  { category: "餐饮厨房", id: "kit_d14_3", name: "4F自助照明" },
  { category: "餐饮厨房", id: "kit_d05_6", name: "B1层厨房动力1" },
  { category: "餐饮厨房", id: "kit_d06_8", name: "自助明档动力" },
  { category: "餐饮厨房", id: "kit_d07_7", name: "3-4F冷库" },
  { category: "餐饮厨房", id: "kit_d08_6", name: "3F宴会厨房动力" },
  { category: "餐饮厨房", id: "kit_d14_4", name: "3F厨房照明" },
  { category: "餐饮厨房", id: "kit_d15_2", name: "早茶餐厅照明" },
  { category: "餐饮厨房", id: "kit_d18_8", name: "2F茶歇间" },
  { category: "餐饮厨房", id: "kit_d25_1", name: "B1层厨房动力2" },
  { category: "餐饮厨房", id: "kit_d25_2", name: "B1层厨房动力3" },
  { category: "餐饮厨房", id: "kit_d25_7", name: "4F面点厨房" },
  { category: "餐饮厨房", id: "kit_d27_9", name: "4F中餐厨房" },
  { category: "餐饮厨房", id: "kit_d28_4", name: "4F早茶明档" },
  { category: "餐饮厨房", id: "kit_d30_4", name: "4F自助明档动力" },
  { category: "餐饮厨房", id: "kit_d31_7", name: "4F自助餐厨房" },
  { category: "餐饮厨房", id: "kit_d38_3", name: "员工餐厅" },
  { category: "餐饮厨房", id: "kit_d38_4", name: "B1层外包餐厅动力" },
  { category: "餐饮厨房", id: "kit_d08_7", name: "厨房通用回路19" },
  { category: "餐饮厨房", id: "kit_d30_5", name: "厨房通用回路20" },
  { category: "餐饮厨房", id: "kit_d45_7", name: "4号电井双电源" }
];

export const 默认抄表历史: 抄表记录[] = [
  { 日期: '2026-06-03', 李体线电表: 1120.5, 午沙线电表: 780.2, 酒店水表: 41.5, 喷泉水表: 28.5, 天然气表: 105.4, 气_锅炉1: 780590, 气_锅炉2: 800675, 气_锅炉3: 748639, 气_3F宴会: 78941, 气_4F自助: 67690, 气_4F拾鲜: 116448 },
  { 日期: '2026-06-04', 李体线电表: 1160.8, 午沙线电表: 795.1, 酒店水表: 43.1, 喷泉水表: 29.8, 天然气表: 108.6, 气_锅炉1: 780590, 气_锅炉2: 800675, 气_锅炉3: 748639, 气_3F宴会: 78941, 气_4F自助: 67690, 气_4F拾鲜: 116448 },
  { 日期: '2026-06-05', 李体线电表: 1195.4, 午沙线电表: 810.0, 酒店水表: 45.3, 喷泉水表: 31.0, 天然气表: 112.5, 气_锅炉1: 780590, 气_锅炉2: 800675, 气_锅炉3: 748639, 气_3F宴会: 78941, 气_4F自助: 67690, 气_4F拾鲜: 116448 },
  { 日期: '2026-06-06', 李体线电表: 1230.1, 午沙线电表: 825.4, 酒店水表: 46.8, 喷泉水表: 32.4, 天然气表: 115.0, 气_锅炉1: 780590, 气_锅炉2: 800675, 气_锅炉3: 748639, 气_3F宴会: 78941, 气_4F自助: 67690, 气_4F拾鲜: 116448 },
  { 日期: '2026-06-07', 李体线电表: 1265.5, 午沙线电表: 840.6, 酒店水表: 44.2, 喷泉水表: 30.5, 天然气表: 120.2, 气_锅炉1: 780590, 气_锅炉2: 800675, 气_锅炉3: 748639, 气_3F宴会: 78941, 气_4F自助: 67690, 气_4F拾鲜: 116448 },
  { 日期: '2026-06-08', 李体线电表: 1310.2, 午沙线电表: 865.8, 酒店水表: 48.4, 喷泉水表: 34.1, 天然气表: 128.5, 气_锅炉1: 780590, 气_锅炉2: 800675, 气_锅炉3: 748639, 气_3F宴会: 78941, 气_4F自助: 67690, 气_4F拾鲜: 116448 }
];

export const 默认月度抄表历史: 月度抄表记录[] = [
  {
    月份: '2026-05',
    抄表人: '工程总监',
    数据: {
      "room_d05_1": 1250.3, "room_d5_2": 820.6, "room_d05_3": 540.2, "room_d13_2": 612.4, "room_d13_3": 905.1, "room_d14_1": 1340.5, "room_d14_2": 1150.2, "room_d15_1": 1420.8,
      "banq_d07_6": 450.2, "banq_d08_1": 380.1, "banq_d08_2": 412.5, "banq_d08_5": 305.6, "banq_d13_4": 150.2, "banq_d27_7": 210.4, "banq_d36_5": 180.2, "banq_d42_6": 165.4,
      "elev_d28_2": 210.5, "elev_d44_3": 208.2, "elev_d24_3": 175.4, "elev_d44_1": 172.1, "elev_d28_1": 190.8, "elev_d44_2": 188.5, "elev_d46_3": 95.2, "elev_d31_3": 91.0,
      "elev_d46_4": 88.5, "elev_d31_4": 85.2, "elev_d46_6": 74.2, "elev_d31_7": 72.1, "elev_d46_5": 79.5, "elev_d31_5": 78.0, "elev_d37_4": 155.4, "elev_d31_2": 82.5,
      "elev_d46_2": 81.0, "elev_d27_5": 90.4, "elev_d43_4": 89.1,
      "chil_d07_2": 4500.5, "chil_d18_6": 4450.2, "chil_d38_1": 15600.4, "chil_d24_1": 16200.2, "chil_d24_2": 15900.5, "chil_d39_1": 2400.8,
      "equip_d07_8": 890.5, "equip_d36_4": 1250.4, "equip_d26_1": 1205.1, "equip_d36_3": 940.8, "equip_d25_6": 915.2, "equip_d08_3": 612.4, "equip_d18_4": 598.2, "equip_d25_5": 780.5, "equip_d36_1": 812.4,
      "kit_d12_8": 240.5, "kit_d14_3": 310.2, "kit_d05_6": 450.8, "kit_d06_8": 180.4, "kit_d07_7": 590.2, "kit_d08_6": 380.5, "kit_d14_4": 290.1, "kit_d15_2": 150.4, "kit_d18_8": 115.2,
      "kit_d25_1": 420.5, "kit_d25_2": 435.1, "kit_d25_7": 195.4, "kit_d27_9": 280.6, "kit_d28_4": 145.2, "kit_d30_4": 165.8, "kit_d31_7": 210.4, "kit_d38_3": 320.5, "kit_d38_4": 275.4,
      "kit_d08_7": 110.2, "kit_d30_5": 105.4, "kit_d45_7": 85.6
    }
  }
];

export const 默认配置: 字典配置 = {
  /** 能源分类列表 */
  能源分类列表: [
    { id: "electricity", name: "电力", icon: "zap", defaultUnit: "度", color: "#f59e0b", description: "电力消耗" },
    { id: "water", name: "给水", icon: "droplet", defaultUnit: "吨", color: "#3b82f6", description: "水资源消耗" },
    { id: "gas", name: "燃气", icon: "flame", defaultUnit: "立方米", color: "#ef4444", description: "燃气消耗" },
  ],
  /** 允许误差配置（用于处理首条记录的回退计算） */
  允许误差配置: [
    { fieldId: "李体线电表", delta: 10 },
    { fieldId: "午沙线电表", delta: 5 },
    { fieldId: "酒店水表", delta: 5 },
    { fieldId: "喷泉水表", delta: 2 },
    { fieldId: "天然气表", delta: 10 },
    { fieldId: "气_锅炉1", delta: 100 },
    { fieldId: "气_锅炉2", delta: 100 },
    { fieldId: "气_锅炉3", delta: 100 },
    { fieldId: "气_3F宴会", delta: 20 },
    { fieldId: "气_4F自助", delta: 20 },
    { fieldId: "气_4F拾鲜", delta: 20 },
  ],
  李体线电表上限: 1300,
  午沙线电表上限: 850,
  酒店水表上限: 45,
  喷泉水表上限: 32,
  天然气表上限: 120,
  电费单价: 1.25,
  水费单价: 4.80,
  气费单价: 3.50,
  日常汇总配置: "日常能耗汇总",
  月度汇总配置: "月度能效分析",
  对账日: 28,
  酒店名称: "国信金融酒店",
  电费户号: "1001624686",
  李体线表号: "000000536129444",
  午沙线表号: "000000536114945",
  电表换算基数: 3500,
};
