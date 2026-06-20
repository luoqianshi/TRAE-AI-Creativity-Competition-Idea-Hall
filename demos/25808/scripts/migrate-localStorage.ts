import { writeFileSync } from 'fs';

interface MigrationReport {
  success: boolean;
  records: {
    daily: number;
    monthly: number;
  };
  errors: string[];
  timestamp: string;
}

// 模拟 localStorage 读取（在 Node 环境中）
function getLocalStorage(key: string): any {
  // 实际运行在浏览器，导出模板供后续使用
  return null;
}

async function migrate(): Promise<MigrationReport> {
  const report: MigrationReport = {
    success: true,
    records: { daily: 0, monthly: 0 },
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    const dailyHistory = getLocalStorage('酒店抄表历史');
    const monthlyHistory = getLocalStorage('酒店月度抄表历史');
    const systemConfig = getLocalStorage('系统字典限额');
    const dailyFields = getLocalStorage('酒店日常回路配置');
    const monthlyCircuits = getLocalStorage('酒店月度回路配置');
    const categoryMapping = getLocalStorage('酒店月度自定义大类映射');

    const migrationData = {
      dailyHistory,
      monthlyHistory,
      systemConfig,
      dailyFields,
      monthlyCircuits,
      categoryMapping,
    };

    writeFileSync(
      './migration-backup.json',
      JSON.stringify(migrationData, null, 2)
    );

    report.records.daily = Array.isArray(dailyHistory) ? dailyHistory.length : 0;
    report.records.monthly = Array.isArray(monthlyHistory) ? monthlyHistory.length : 0;

    console.log('[迁移] 数据已导出至 migration-backup.json');
    console.log(`[迁移] 日常记录: ${report.records.daily} 条`);
    console.log(`[迁移] 月度记录: ${report.records.monthly} 条`);

    return report;
  } catch (error) {
    report.success = false;
    report.errors.push(`迁移失败: ${error}`);
    return report;
  }
}

migrate().then(console.log).catch(console.error);
