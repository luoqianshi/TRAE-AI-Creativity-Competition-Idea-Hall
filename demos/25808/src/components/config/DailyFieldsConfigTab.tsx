import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { DailyFieldConfig } from '../../shared/types';
import { ConfigTableEditor, ColumnConfig } from './ConfigTableEditor';
import { TemplateSelector } from './TemplateSelector';

interface DailyFieldsConfigTabProps {
  临时日常配置: DailyFieldConfig[];
  set临时日常配置: React.Dispatch<React.SetStateAction<DailyFieldConfig[]>>;
  sortedDailyCols: any[];
  addDailyCol: () => void;
  removeDailyCol: (id: string) => void;
  insertDailyRow: (idx: number) => void;
  保存日常表字段: (e: React.FormEvent) => void;
  set日常列顺序: React.Dispatch<React.SetStateAction<string[]>>;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const dailyColumns: ColumnConfig[] = [
  { id: 'id', name: '代码ID (唯一)', isSystem: true },
  { id: 'name', name: '回路名称', isSystem: true },
  { id: 'category', name: '分类', isSystem: true, type: 'select', options: [
    { value: '电', label: '电 (Electricity)' },
    { value: '水', label: '水 (Water)' },
    { value: '气', label: '气 (Gas)' },
  ]},
  { id: 'unit', name: '计量单位', isSystem: true },
  { id: 'limit', name: '阈值上限', isSystem: true, type: 'number' },
];

export const DailyFieldsConfigTab: React.FC<DailyFieldsConfigTabProps> = ({
  临时日常配置,
  set临时日常配置,
  sortedDailyCols,
  addDailyCol,
  removeDailyCol,
  insertDailyRow,
  保存日常表字段,
  set日常列顺序,
  openConfirm,
}) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleTemplateSelect = (fields: DailyFieldConfig[]) => {
    openConfirm(
      '导入模板确认',
      `确定要导入包含 ${fields.length} 个回路的行业模板吗？当前配置将被替换。`,
      () => {
        set临时日常配置(fields);
      }
    );
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            当前配置包含 <span className="font-bold text-zinc-700">{临时日常配置.length}</span> 个回路字段
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

      <ConfigTableEditor
        title="一、日常主表配置字段及架构重构 (拖放列重构顺序)"
        data={临时日常配置}
        setData={set临时日常配置}
        columns={sortedDailyCols.length > 0 ? sortedDailyCols : dailyColumns}
        columnOrder={sortedDailyCols.map(c => c.id)}
        setColumnOrder={set日常列顺序}
        addColumn={addDailyCol}
        removeColumn={removeDailyCol}
        insertRow={insertDailyRow}
        onSave={保存日常表字段}
        openConfirm={openConfirm}
        dragPrefix="daily"
      />

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectDailyFields={handleTemplateSelect}
        onSelectMonthlyCircuits={() => {}}
        mode="daily"
      />
    </>
  );
};
