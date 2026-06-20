import React, { useState } from 'react';
import { Save, Download } from 'lucide-react';
import { ConfigView } from '../ConfigView';
import { MonthlyCircuitConfig, 字典配置 } from '../../shared/types';
import { ConfigTableEditor, ColumnConfig } from './ConfigTableEditor';
import { TemplateSelector } from './TemplateSelector';

interface MonthlyCircuitConfigTabProps {
  临时月度配置: MonthlyCircuitConfig[];
  set临时月度配置: React.Dispatch<React.SetStateAction<MonthlyCircuitConfig[]>>;
  sortedMonthlyCols: any[];
  addMonthlyCol: () => void;
  removeMonthlyCol: (id: string) => void;
  insertMonthlyRow: (idx: number) => void;
  保存月度回路: (e: React.FormEvent) => void;
  set月度列顺序: React.Dispatch<React.SetStateAction<string[]>>;
  配置输入: 字典配置;
  set配置输入: (val: 字典配置) => void;
  保存配置: (e: React.FormEvent) => void;
  自定义大类映射: { [key: string]: string[] };
  set自定义大类映射: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openPrompt: (title: string, onConfirm: (val: string) => void) => void;
  openAlert: (title: string, message: string) => void;
  配置反馈: string;
}

const monthlyColumns: ColumnConfig[] = [
  { id: 'id', name: '代码ID (唯一)', isSystem: true },
  { id: 'name', name: '回路名称', isSystem: true },
  { id: 'category', name: '层级分类', isSystem: true },
];

export const MonthlyCircuitConfigTab: React.FC<MonthlyCircuitConfigTabProps> = ({
  临时月度配置,
  set临时月度配置,
  sortedMonthlyCols,
  addMonthlyCol,
  removeMonthlyCol,
  insertMonthlyRow,
  保存月度回路,
  set月度列顺序,
  配置输入,
  set配置输入,
  保存配置,
  自定义大类映射,
  set自定义大类映射,
  openConfirm,
  openPrompt,
  openAlert,
  配置反馈,
}) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleTemplateSelect = (circuits: MonthlyCircuitConfig[]) => {
    openConfirm(
      '导入模板确认',
      `确定要导入包含 ${circuits.length} 个月度回路的行业模板吗？当前配置将被替换。`,
      () => {
        set临时月度配置(circuits);
      }
    );
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            当前配置包含 <span className="font-bold text-zinc-700">{临时月度配置.length}</span> 个月度回路
          </span>
        </div>
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          导入行业模板
        </button>
      </div>

      <form onSubmit={保存月度回路} className="space-y-6">
      <ConfigTableEditor
        title="一、月度二级回路节点分类及明细设定"
        data={临时月度配置}
        setData={set临时月度配置}
        columns={sortedMonthlyCols.length > 0 ? sortedMonthlyCols : monthlyColumns}
        columnOrder={sortedMonthlyCols.map(c => c.id)}
        setColumnOrder={set月度列顺序}
        addColumn={addMonthlyCol}
        removeColumn={removeMonthlyCol}
        insertRow={insertMonthlyRow}
        onSave={() => {}}
        openConfirm={openConfirm}
        dragPrefix="monthly"
      />

      <ConfigView
        配置输入={配置输入}
        set配置输入={set配置输入}
        保存配置={保存配置}
        自定义大类映射={自定义大类映射}
        set自定义大类映射={set自定义大类映射}
        临时月度配置={临时月度配置}
        openConfirm={openConfirm}
        openPrompt={openPrompt}
        配置反馈={配置反馈}
        onAddCategory={() => {
          openPrompt("请输入自定义合并大类的名称（例如：非经营性基础老旧负荷）：", (className) => {
            if (className && className.trim() !== '') {
              const trimmed = className.trim();
              if (自定义大类映射[trimmed]) {
                openAlert("提示", "该分类大类已存在");
              } else {
                set自定义大类映射(prev => ({
                  ...prev,
                  [trimmed]: []
                }));
              }
            }
          });
        }}
      />

      <button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition"
      >
        <Save className="h-4 w-4" />
        <span>保存月度二级回路及归并大类配置</span>
      </button>
    </form>

    <TemplateSelector
      isOpen={showTemplateSelector}
      onClose={() => setShowTemplateSelector(false)}
      onSelectDailyFields={() => {}}
      onSelectMonthlyCircuits={handleTemplateSelect}
      mode="monthly"
    />
  </>
  );
};
