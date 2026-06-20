import React from 'react';
import { Download, Upload } from 'lucide-react';
import { MonthlyCircuitConfig, 月度抄表记录 } from '../types';
import { parseCSV } from './utils';

interface MonthlyImporterProps {
  circuitData: MonthlyCircuitConfig[];
  月度历史: 月度抄表记录[];
  更新月度抄表数据: (新数据: 月度抄表记录[]) => void;
  自定义大类映射: { [key: string]: string[] };
  openAlert: (title: string, message: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const MonthlyImporter: React.FC<MonthlyImporterProps> = ({
  circuitData,
  月度历史,
  更新月度抄表数据,
  自定义大类映射,
  openAlert,
  openConfirm,
}) => {
  const downloadMonthlyTemplate = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const circuitToClass = new Map<string, string>();
    for (const [className, circuitIds] of Object.entries(自定义大类映射 as { [key: string]: string[] })) {
      for (const id of (circuitIds as string[])) {
        circuitToClass.set(id, className);
      }
    }
    // Header setup
    // Based on the user requirements, only show columns that exist in circuitData config.
    // Assuming MonthlyCircuitConfig has at least id, name, category, and possibly others.
    
    // 1. Get all unique keys from all circuitData items to be safe, or just use predefined ones.
    // The user wants columns dynamically based on what's defined.
    const allExampleKeys = circuitData.length > 0 ? Object.keys(circuitData[0]) : ['id', 'name', 'category'];
    
    // Mapping keys to Chinese headers
    const keyToHeader: { [key: string]: string } = {
        'id': '回路ID',
        'name': '回路名称',
        'category': '分类',
        // Add others if needed based on circuitData schema
    };
    
    // Filter keys: 大类 (mapped), then others from config excluding mapping keys if any
    const headers = ['大类', ...allExampleKeys.map(k => keyToHeader[k] || k), '读数'];
    
    const csvLines = [
        ['月份', currentMonth],
        ['抄表人', ''],
        [''],
        headers
    ];
    for (const circuit of circuitData) {
        const className = circuitToClass.get(circuit.id) || '未分类';
        const row = [
            className,
            ...allExampleKeys.map(k => (circuit as any)[k] || ''),
            ''
        ];
        csvLines.push(row);
    }
    const csvContent = "\uFEFF" + csvLines.map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "酒店能耗数仓_月度二级回路批量导入模板.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportMonthlyCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 3) {
          openAlert("导入失败", "月度CSV文件缺少必要的数据和结构。");
          return;
        }

        const monthRow = rows.find(r => r[0] === '月份');
        const reporterRow = rows.find(r => r[0] === '抄表人');
        const monthRaw = monthRow ? monthRow[1] : '';
        const recorder = reporterRow ? reporterRow[1] : '导入对账';

        if (!monthRaw) {
          openAlert("导入失败", "未找到有效的「月份」数据。");
          return;
        }

        const normalizedMonth = monthRaw.replace(/\//g, '-');
        if (!/^\d{4}-\d{2}$/.test(normalizedMonth)) {
            openAlert("导入失败", "月份格式不正确，应为 YYYY-MM。");
            return;
        }

        const headerRowIdx = rows.findIndex(r => r.includes('大类') && r.includes('回路名称'));
        if (headerRowIdx === -1) {
          openAlert("导入失败", "未找到标准数据表头（包含「大类」和「回路名称」）。");
          return;
        }

        const headerRow = rows[headerRowIdx];
        const circuitNameIdx = headerRow.findIndex(h => h === '回路名称');
        const readingIdx = headerRow.findIndex(h => h === '读数');
        
        if (circuitNameIdx === -1 || readingIdx === -1) {
            openAlert("导入失败", "CSV格式错误，无法定位「回路名称」或「读数」列。");
            return;
        }

        const dataVals: { [key: string]: number } = {};
        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length <= Math.max(circuitNameIdx, readingIdx)) continue;
          
          const circuitName = row[circuitNameIdx];
          const readingStr = row[readingIdx] || '0';
          const reading = parseFloat(readingStr.replace(/,/g, ''));
          
          const matchedCircuit = circuitData.find(c => c.name === circuitName);
          if (matchedCircuit && !isNaN(reading)) {
            dataVals[matchedCircuit.id] = reading;
          }
        }

        const newRecords: 月度抄表记录[] = [{
            月份: normalizedMonth,
            抄表人: recorder,
            数据: dataVals
        }];

        openConfirm(
          "月度抄表序列合并入库",
          `成功重构并解析 ${newRecords.length} 个历史月度核账期的回路底数。如果是已抄月份，将覆写并合并读底以执行滚动偏差比对。确定导入吗？`,
          () => {
            const monthlyMap = new Map<string, 月度抄表记录>(月度历史.map(item => [item.月份, item]));
            newRecords.forEach(newItem => {
              const oldItem = monthlyMap.get(newItem.月份);
              if (oldItem) {
                monthlyMap.set(newItem.月份, {
                  ...oldItem,
                  抄表人: newItem.抄表人,
                  数据: { ...oldItem.数据, ...newItem.数据 }
                });
              } else {
                monthlyMap.set(newItem.月份, newItem);
              }
            });

            const sortedList = Array.from(monthlyMap.values()).sort(
              (a, b) => b.月份.localeCompare(a.月份)
            );

            更新月度抄表数据(sortedList);
            openAlert("月度级拓扑导入成功", `成功配置、匹配与融合历史周期二级配电表，费率对账系统已就绪。`);
          }
        );
      } catch (err) {
        openAlert("导入异常", "请确认文件为标准的.csv后缀且格式对齐系统模型");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-5 border border-zinc-150 rounded-xl bg-zinc-50/40 hover:bg-zinc-50/70 transition space-y-4 flex flex-col justify-between">
        <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600">
                <span className="text-xs font-bold text-zinc-700">月度二级回路抄表导入</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                用于批量导入月度考核核销所需的各二级考核表（客房、暖通、泵房等二级分表）的历史读数。
            </p>
        </div>
        <div className="space-y-3">
            <button
                type="button"
                onClick={downloadMonthlyTemplate}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 border border-zinc-200 bg-white hover:bg-zinc-100 rounded-lg text-[11px] font-bold text-zinc-650 tracking-wide transition cursor-pointer"
            >
                <Download className="h-3 w-3 text-emerald-500" />
                <span>下载月度二级回路 CSV 模板</span>
            </button>
            <div className="relative border border-dashed border-zinc-300 rounded-lg p-3 text-center cursor-pointer hover:border-emerald-500 bg-white transition group">
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportMonthlyCSV(file);
                        e.target.value = '';
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1">
                    <Upload className="h-4 w-4 text-zinc-400 mx-auto group-hover:text-emerald-500 transition-colors" />
                    <div className="text-[10px] text-zinc-650 font-bold">
                        选择或拖入月度二级回路抄表 <b>.csv</b> 文件
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
