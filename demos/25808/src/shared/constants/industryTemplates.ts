import { DailyFieldConfig, MonthlyCircuitConfig } from '../types';

/**
 * 酒店行业默认日常回路模板
 * 适用于：星级酒店、商务酒店、度假酒店等
 */
export const HOTEL_DAILY_FIELDS: DailyFieldConfig[] = [
  { id: 'elec_main_1', name: '主配电室电表1', category: '电', unit: '度', limit: 5000 },
  { id: 'elec_main_2', name: '主配电室电表2', category: '电', unit: '度', limit: 5000 },
  { id: 'elec_guest_east', name: '东客房楼层电表', category: '电', unit: '度', limit: 2000 },
  { id: 'elec_guest_west', name: '西客房楼层电表', category: '电', unit: '度', limit: 2000 },
  { id: 'elec_banquet', name: '宴会厅电表', category: '电', unit: '度', limit: 1500 },
  { id: 'elec_chiller', name: '冷水机组电表', category: '电', unit: '度', limit: 3000 },
  { id: 'water_main', name: '主水表', category: '水', unit: '吨', limit: 500 },
  { id: 'water_guest', name: '客房区域水表', category: '水', unit: '吨', limit: 200 },
  { id: 'water_landscape', name: '景观水表', category: '水', unit: '吨', limit: 100 },
  { id: 'gas_boiler', name: '锅炉燃气表', category: '气', unit: '立方米', limit: 5000 },
  { id: 'gas_kitchen', name: '厨房燃气表', category: '气', unit: '立方米', limit: 2000 },
];

/**
 * 医院行业默认日常回路模板
 * 适用于：综合医院、专科医院、医疗中心等
 */
export const HOSPITAL_DAILY_FIELDS: DailyFieldConfig[] = [
  { id: 'elec_main', name: '主配电室电表', category: '电', unit: '度', limit: 8000 },
  { id: 'elec_icu', name: 'ICU病房电表', category: '电', unit: '度', limit: 2000 },
  { id: 'elec_operation', name: '手术室电表', category: '电', unit: '度', limit: 1500 },
  { id: 'elec_laboratory', name: '检验科电表', category: '电', unit: '度', limit: 1000 },
  { id: 'elec_mri', name: 'MRI电表', category: '电', unit: '度', limit: 3000 },
  { id: 'water_medical', name: '医疗用水表', category: '水', unit: '吨', limit: 300 },
  { id: 'water_cooling', name: '冷却塔水表', category: '水', unit: '吨', limit: 400 },
  { id: 'gas_medical', name: '医疗气体表', category: '气', unit: '立方米', limit: 1000 },
  { id: 'gas_sterilizer', name: '灭菌设备燃气表', category: '气', unit: '立方米', limit: 800 },
];

/**
 * 写字楼/商业综合体默认日常回路模板
 * 适用于：甲级写字楼、购物中心、商业广场等
 */
export const OFFICE_DAILY_FIELDS: DailyFieldConfig[] = [
  { id: 'elec_main', name: '主配电室电表', category: '电', unit: '度', limit: 10000 },
  { id: 'elec_floor_1_10', name: '1-10层电表', category: '电', unit: '度', limit: 3000 },
  { id: 'elec_floor_11_20', name: '11-20层电表', category: '电', unit: '度', limit: 3000 },
  { id: 'elec_floor_21_30', name: '21-30层电表', category: '电', unit: '度', limit: 3000 },
  { id: 'elec_hvac', name: '中央空调电表', category: '电', unit: '度', limit: 5000 },
  { id: 'elec_escalator', name: '扶梯电表', category: '电', unit: '度', limit: 500 },
  { id: 'water_cooling', name: '冷却塔水表', category: '水', unit: '吨', limit: 600 },
  { id: 'water_landscape', name: '景观用水表', category: '水', unit: '吨', limit: 150 },
  { id: 'water_toilet', name: '卫生间水表', category: '水', unit: '吨', limit: 300 },
];

/**
 * 工厂/工业园区默认日常回路模板
 * 适用于：生产制造园区、工业厂房等
 */
export const FACTORY_DAILY_FIELDS: DailyFieldConfig[] = [
  { id: 'elec_main', name: '主配电室电表', category: '电', unit: '度', limit: 20000 },
  { id: 'elec_prod_line_a', name: '生产线A电表', category: '电', unit: '度', limit: 8000 },
  { id: 'elec_prod_line_b', name: '生产线B电表', category: '电', unit: '度', limit: 8000 },
  { id: 'elec_prod_line_c', name: '生产线C电表', category: '电', unit: '度', limit: 8000 },
  { id: 'elec_air_compressor', name: '空压机电表', category: '电', unit: '度', limit: 3000 },
  { id: 'elec_welding', name: '焊接设备电表', category: '电', unit: '度', limit: 1500 },
  { id: 'water_industrial', name: '工业用水表', category: '水', unit: '吨', limit: 1000 },
  { id: 'water_cooling', name: '冷却循环水表', category: '水', unit: '吨', limit: 800 },
  { id: 'gas_process', name: '工艺用气表', category: '气', unit: '立方米', limit: 5000 },
  { id: 'gas_boiler', name: '锅炉燃气表', category: '气', unit: '立方米', limit: 8000 },
];

/**
 * 通用基础模板（最小配置）
 * 适用于：快速初始化、简单场景
 */
export const BASIC_DAILY_FIELDS: DailyFieldConfig[] = [
  { id: 'elec_total', name: '总电表', category: '电', unit: '度', limit: 10000 },
  { id: 'water_total', name: '总水表', category: '水', unit: '吨', limit: 500 },
  { id: 'gas_total', name: '总气表', category: '气', unit: '立方米', limit: 2000 },
];

/**
 * 酒店行业默认月度回路模板
 */
export const HOTEL_MONTHLY_CIRCUITS: MonthlyCircuitConfig[] = [
  { category: '客房区域', id: 'room_floor_5_7', name: '5-7F客房' },
  { category: '客房区域', id: 'room_floor_8_10', name: '8-10F客房' },
  { category: '客房区域', id: 'room_floor_11_13', name: '11-13F客房' },
  { category: '客房区域', id: 'room_floor_14_15', name: '14-15F客房' },
  { category: '宴会会议', id: 'banq_hall_1', name: '宴会厅1号' },
  { category: '宴会会议', id: 'banq_hall_2', name: '宴会厅2号' },
  { category: '宴会会议', id: 'banq_hall_3', name: '宴会厅3号' },
  { category: '宴会会议', id: 'banq_meeting', name: '会议室区' },
  { category: '餐饮区域', id: 'rest_chinese', name: '中餐厅' },
  { category: '餐饮区域', id: 'rest_western', name: '西餐厅' },
  { category: '餐饮区域', id: 'rest_buffet', name: '自助餐厅' },
  { category: '中央空调', id: 'hvac_chiller_1', name: '冷水机组1号' },
  { category: '中央空调', id: 'hvac_chiller_2', name: '冷水机组2号' },
  { category: '中央空调', id: 'hvac_cooling_tower', name: '冷却塔' },
  { category: '中央空调', id: 'hvac_air_handling', name: '空气处理机组' },
  { category: '电梯系统', id: 'elev_guest_high', name: '客梯高层' },
  { category: '电梯系统', id: 'elev_guest_low', name: '客梯低层' },
  { category: '电梯系统', id: 'elev_service', name: '服务电梯' },
  { category: '电梯系统', id: 'elev_escalator', name: '自动扶梯' },
  { category: '配套设备', id: 'equip_laundry', name: '洗衣房' },
  { category: '配套设备', id: 'equip_kitchen_central', name: '中央厨房' },
  { category: '配套设备', id: 'equip_gym', name: '健身房' },
  { category: '配套设备', id: 'equip_pool', name: '游泳池' },
  { category: '配套设备', id: 'equip_spa', name: '水疗中心' },
  { category: '后勤区域', id: 'maint_b1', name: 'B1层设备区' },
  { category: '后勤区域', id: 'maint_boiler', name: '锅炉房' },
  { category: '后勤区域', id: 'maint_transformer', name: '配电室' },
];

/**
 * 医院行业默认月度回路模板
 */
export const HOSPITAL_MONTHLY_CIRCUITS: MonthlyCircuitConfig[] = [
  { category: '住院部', id: 'hosp_ipd_floor_3_5', name: '3-5F住院部' },
  { category: '住院部', id: 'hosp_ipd_floor_6_8', name: '6-8F住院部' },
  { category: '住院部', id: 'hosp_ipd_floor_9_12', name: '9-12F住院部' },
  { category: '门诊部', id: 'hosp_opd_floor_1', name: '1F门诊大堂' },
  { category: '门诊部', id: 'hosp_opd_floor_2', name: '2F门诊区' },
  { category: '门诊部', id: 'hosp_opd_floor_3', name: '3F门诊区' },
  { category: '手术室', id: 'hosp_or_block', name: '手术室楼' },
  { category: 'ICU/急诊', id: 'hosp_icu', name: 'ICU病房' },
  { category: 'ICU/急诊', id: 'hosp_emergency', name: '急诊区域' },
  { category: '医技科室', id: 'hosp_lab', name: '检验科' },
  { category: '医技科室', id: 'hosp_imaging', name: '影像科' },
  { category: '医技科室', id: 'hosp_mri', name: 'MRI室' },
  { category: '中央供应', id: 'hosp_sterilize', name: '消毒供应中心' },
  { category: '后勤保障', id: 'hosp_laundry', name: '洗衣房' },
  { category: '后勤保障', id: 'hosp_kitchen', name: '营养食堂' },
  { category: '后勤保障', id: 'hosp_boiler', name: '锅炉房' },
  { category: '后勤保障', id: 'hosp_cooling', name: '冷却塔' },
  { category: '医疗设备', id: 'hosp_ct', name: 'CT设备' },
  { category: '医疗设备', id: 'hosp_mri_device', name: 'MRI设备' },
  { category: '医疗设备', id: 'hosp_dialysis', name: '血液透析设备' },
];

/**
 * 写字楼默认月度回路模板
 */
export const OFFICE_MONTHLY_CIRCUITS: MonthlyCircuitConfig[] = [
  { category: '低区', id: 'office_floor_1_5', name: '1-5F' },
  { category: '中区', id: 'office_floor_6_15', name: '6-15F' },
  { category: '高区', id: 'office_floor_16_25', name: '16-25F' },
  { category: '高区', id: 'office_floor_26_30', name: '26-30F' },
  { category: '公共区域', id: 'office_lobby', name: '大堂' },
  { category: '公共区域', id: 'office_parking_b1', name: 'B1停车场' },
  { category: '公共区域', id: 'office_parking_b2', name: 'B2停车场' },
  { category: '配套商业', id: 'office_retail_1', name: '商业1区' },
  { category: '配套商业', id: 'office_retail_2', name: '商业2区' },
  { category: '配套商业', id: 'office_restaurant', name: '餐饮区' },
  { category: '暖通空调', id: 'office_hvac_chiller', name: '冷水机组' },
  { category: '暖通空调', id: 'office_hvac_ahu', name: '空气处理机组' },
  { category: '暖通空调', id: 'office_hvac_fan', name: '风机盘管' },
  { category: '电梯系统', id: 'office_elev_low', name: '低区电梯' },
  { category: '电梯系统', id: 'office_elev_mid', name: '中区电梯' },
  { category: '电梯系统', id: 'office_elev_high', name: '高区电梯' },
  { category: '数据中心', id: 'office_server_room', name: '服务器机房' },
];

/**
 * 工厂默认月度回路模板
 */
export const FACTORY_MONTHLY_CIRCUITS: MonthlyCircuitConfig[] = [
  { category: '生产车间', id: 'factory_prod_zone_a', name: '生产车间A区' },
  { category: '生产车间', id: 'factory_prod_zone_b', name: '生产车间B区' },
  { category: '生产车间', id: 'factory_prod_zone_c', name: '生产车间C区' },
  { category: '生产车间', id: 'factory_assembly', name: '装配车间' },
  { category: '仓储物流', id: 'factory_warehouse_1', name: '原料仓库' },
  { category: '仓储物流', id: 'factory_warehouse_2', name: '成品仓库' },
  { category: '仓储物流', id: 'factory_logistics', name: '物流装卸区' },
  { category: '动力站房', id: 'factory_power_station', name: '配电站' },
  { category: '动力站房', id: 'factory_compressed_air', name: '空压站' },
  { category: '动力站房', id: 'factory_boiler_station', name: '锅炉房' },
  { category: '动力站房', id: 'factory_water_treatment', name: '水处理站' },
  { category: '办公生活', id: 'factory_office', name: '办公区' },
  { category: '办公生活', id: 'factory_dorm_a', name: '宿舍A区' },
  { category: '办公生活', id: 'factory_dorm_b', name: '宿舍B区' },
  { category: '办公生活', id: 'factory_canteen', name: '员工食堂' },
  { category: '环保设施', id: 'factory_wastewater', name: '污水处理站' },
  { category: '环保设施', id: 'factory_ventilation', name: '废气处理' },
];

/**
 * 基础月度回路模板
 */
export const BASIC_MONTHLY_CIRCUITS: MonthlyCircuitConfig[] = [
  { category: '区域一', id: 'basic_zone_1', name: '区域一' },
  { category: '区域二', id: 'basic_zone_2', name: '区域二' },
  { category: '区域三', id: 'basic_zone_3', name: '区域三' },
  { category: '公共设备', id: 'basic_common', name: '公共设备' },
];

/**
 * 行业模板注册表
 */
export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  dailyFields: DailyFieldConfig[];
  monthlyCircuits: MonthlyCircuitConfig[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'hotel',
    name: '酒店行业',
    description: '星级酒店、商务酒店、度假酒店等',
    dailyFields: HOTEL_DAILY_FIELDS,
    monthlyCircuits: HOTEL_MONTHLY_CIRCUITS,
  },
  {
    id: 'hospital',
    name: '医院行业',
    description: '综合医院、专科医院、医疗中心等',
    dailyFields: HOSPITAL_DAILY_FIELDS,
    monthlyCircuits: HOSPITAL_MONTHLY_CIRCUITS,
  },
  {
    id: 'office',
    name: '写字楼/商业',
    description: '甲级写字楼、购物中心、商业广场等',
    dailyFields: OFFICE_DAILY_FIELDS,
    monthlyCircuits: OFFICE_MONTHLY_CIRCUITS,
  },
  {
    id: 'factory',
    name: '工厂/工业',
    description: '生产制造园区、工业厂房等',
    dailyFields: FACTORY_DAILY_FIELDS,
    monthlyCircuits: FACTORY_MONTHLY_CIRCUITS,
  },
  {
    id: 'basic',
    name: '通用基础',
    description: '最小配置，适合快速初始化',
    dailyFields: BASIC_DAILY_FIELDS,
    monthlyCircuits: BASIC_MONTHLY_CIRCUITS,
  },
];

/**
 * 根据ID获取行业模板
 */
export const getTemplateById = (id: string): IndustryTemplate | undefined => {
  return INDUSTRY_TEMPLATES.find(t => t.id === id);
};
