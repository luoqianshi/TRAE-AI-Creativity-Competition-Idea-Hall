import React from 'react';
import { motion } from 'motion/react';
import { DailyFieldConfig, MonthlyCircuitConfig, 抄表记录, 字典配置 } from '../../shared/types';
import { DailyForm } from './DailyForm';
import { MonthlyForm } from './MonthlyForm';

interface DailyEntryViewProps {
  抄表子路由: '日常' | '月度';
  set抄表子路由: (route: '日常' | '月度') => void;
  快速清空抄表表单: () => void;
  提交日常抄表: (e: React.FormEvent) => void;
  输入日期: string;
  set输入日期: (val: string) => void;
  日常回路配置: DailyFieldConfig[];
  最新记录: 抄表记录;
  日常抄表输入: { [key: string]: string };
  set日常抄表输入: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  抄表反馈: string;
  
  快速清空月度表单: () => void;
  选中月度月份: string;
  set选中月度月份: (val: string) => void;
  circuitData: MonthlyCircuitConfig[];
  月度回路输入: { [key: string]: string };
  set月度回路输入: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  当前回路分类: string;
  set当前回路分类: (val: string) => void;
  提交月度抄表: (e: React.FormEvent) => void;
  月度抄表反馈: string;
  填充单条月度数据: (项: any) => void;
  自定义大类映射: { [key: string]: string[] };
  限额配置: 字典配置;
  月度历史: any[];
}

export const DailyEntryView: React.FC<DailyEntryViewProps> = ({
  抄表子路由,
  set抄表子路由,
  快速清空抄表表单,
  提交日常抄表,
  输入日期,
  set输入日期,
  日常回路配置,
  最新记录,
  日常抄表输入,
  set日常抄表输入,
  抄表反馈,
  
  快速清空月度表单,
  选中月度月份,
  set选中月度月份,
  circuitData,
  月度回路输入,
  set月度回路输入,
  当前回路分类,
  set当前回路分类,
  提交月度抄表,
  月度抄表反馈,
  自定义大类映射,
  限额配置,
  月度历史,
}) => {
  return (
    <motion.div
      key="日常抄表内容"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
      id="daily_entry_root"
    >
      {/* Tab Selectors with simple pill layout style */}
      <div className="flex space-x-1 bg-zinc-100/80 p-0.5 rounded-xl self-start w-fit">
        <button
          id="tab_daily_entry"
          type="button"
          onClick={() => set抄表子路由('日常')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            抄表子路由 === '日常'
              ? 'bg-white text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          日常主表录入
        </button>
        <button
          id="tab_monthly_entry"
          type="button"
          onClick={() => set抄表子路由('月度')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
            抄表子路由 === '月度'
              ? 'bg-white text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          月度抄表录入
        </button>
      </div>

      {抄表子路由 === '日常' ? (
        <DailyForm
          快速清空抄表表单={快速清空抄表表单}
          提交日常抄表={提交日常抄表}
          输入日期={输入日期}
          set输入日期={set输入日期}
          日常回路配置={日常回路配置}
          最新记录={最新记录}
          日常抄表输入={日常抄表输入}
          set日常抄表输入={set日常抄表输入}
          抄表反馈={抄表反馈}
          限额配置={限额配置}
        />
      ) : (
        <MonthlyForm
          快速清空月度表单={快速清空月度表单}
          选中月度月份={选中月度月份}
          set选中月度月份={set选中月度月份}
          circuitData={circuitData}
          月度回路输入={月度回路输入}
          set月度回路输入={set月度回路输入}
          当前回路分类={当前回路分类}
          set当前回路分类={set当前回路分类}
          提交月度抄表={提交月度抄表}
          月度抄表反馈={月度抄表反馈}
          自定义大类映射={自定义大类映射}
          月度历史={月度历史}
        />
      )}
    </motion.div>
  );
};
