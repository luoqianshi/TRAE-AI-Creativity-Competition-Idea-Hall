import React from 'react';
import { 字典配置, MonthlyCircuitConfig } from '../shared/types';
import { CategoryMappingCard } from './config/CategoryMappingCard';

interface ConfigViewProps {
  配置输入: 字典配置;
  set配置输入: (配置: 字典配置) => void;
  保存配置: (e: React.FormEvent) => void;
  自定义大类映射: { [key: string]: string[] };
  set自定义大类映射: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  临时月度配置: MonthlyCircuitConfig[];
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openPrompt: (title: string, onConfirm: (val: string) => void) => void;
  配置反馈: string;
  onAddCategory: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  自定义大类映射,
  set自定义大类映射,
  临时月度配置,
  openConfirm,
  openPrompt,
  配置反馈,
  onAddCategory,
}) => {
  const 可用分类选项 = Array.from(new Set(临时月度配置.map(c => c.category).filter(Boolean)));

  return (
    <CategoryMappingCard
      自定义大类映射={自定义大类映射}
      set自定义大类映射={set自定义大类映射}
      可用分类选项={可用分类选项}
      openConfirm={openConfirm}
      openPrompt={openPrompt}
      onAddCategory={onAddCategory}
      配置反馈={配置反馈}
    />
  );
};
