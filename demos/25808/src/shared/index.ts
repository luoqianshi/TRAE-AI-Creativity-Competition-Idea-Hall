// Shared 共享模块
// 统一导出所有共享组件、hooks、工具函数

// Components
export { EnergyCard } from './components';
export { TrendBarChart } from './components';
export { Header } from './components';
export { Sidebar } from './components';
export { UserMenu } from './components';
export { SystemDialogWrapper } from './components';
export { MonthlyImporter } from './components';

// Hooks
export { useAuth } from './hooks';
export { useEnergyConfig } from './hooks';
export { useMeterRecords } from './hooks';
export { useGasGroups } from './hooks';
export { useSystemDialog } from './hooks';

// Services
export { apiService } from './services';

// Utils - 值导出 (functions/constants)
export {
  exportDailyHistoryToExcel,
  exportElectricityTemplate,
  exportWaterTemplate,
  exportGasTemplate,
  exportAllToExcel,
  getBillingPriceAtDate,
  getFieldConsumption,
  getEnrichedDailyRecords,
} from './utils';

// Utils - 类型导出 (interfaces)
export type {
  DailyPricing,
  EnrichedRecord,
} from './utils';

// Types - 值导出 (constants/default data)
export {
  DEFAULT_DAILY_FIELDS,
  DEFAULT_CIRCUITS,
  默认抄表历史,
  默认月度抄表历史,
  默认配置,
} from './types';

// Types - 类型导出 (interfaces)
export type {
  抄表记录,
  单价变动事件,
  字典配置,
  当前用户,
  月度抄表记录,
  DailyFieldConfig,
  GasGroupConfig,
  MonthlyCircuitConfig,
} from './types';
