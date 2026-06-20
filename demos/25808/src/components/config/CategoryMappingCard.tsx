import React from 'react';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';

export interface CategoryMappingCardProps {
  自定义大类映射: { [key: string]: string[] };
  set自定义大类映射: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  可用分类选项: string[];
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openPrompt: (title: string, onConfirm: (val: string) => void) => void;
  onAddCategory: () => void;
  配置反馈: string;
}

export const CategoryMappingCard: React.FC<CategoryMappingCardProps> = ({
  自定义大类映射,
  set自定义大类映射,
  可用分类选项,
  openConfirm,
  openPrompt,
  onAddCategory,
  配置反馈,
}) => {
  const handleEditCategoryName = (className: string) => {
    openPrompt(`修改大类名称「${className}」为：`, (newName) => {
      if (newName && newName.trim() !== '' && newName !== className) {
        set自定义大类映射(prev => {
          const next = { ...prev };
          if (next[newName]) return prev;
          next[newName] = next[className];
          delete next[className];
          return next;
        });
      }
    });
  };

  const handleDeleteCategory = (className: string) => {
    openConfirm("确认删除大类", `确定要彻底删除大类「${className}」吗？`, () => {
      set自定义大类映射(prev => {
        const next = { ...prev };
        delete next[className];
        return next;
      });
    });
  };

  const handleToggleCategory = (className: string, cat: string) => {
    set自定义大类映射(prev => {
      const originalList = prev[className] || [];
      const isChecked = originalList.includes(cat);
      const updatedList = isChecked
        ? originalList.filter(item => item !== cat)
        : [...originalList, cat];
      return {
        ...prev,
        [className]: updatedList
      };
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5 pt-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-3">二、自定义汇总大类映射</h3>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={onAddCategory}
            className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50/70 hover:bg-cyan-100 transition-colors px-3 py-1.5 rounded-lg flex items-center space-x-1"
          >
            <Plus className="h-3 w-3" />
            <span>创建自定义归并大类</span>
          </button>
        </div>

        {Object.keys(自定义大类映射).length === 0 ? (
          <p className="text-xxs text-zinc-400 py-6 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 font-sans">
            当前暂无自定义大类划分。请点击右侧「创建自定义归并大类」进行设定。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(自定义大类映射).map((className) => {
              const selectedCategories = 自定义大类映射[className] || [];

              return (
                <div key={className} className="p-4 border border-zinc-200/80 rounded-xl bg-zinc-50/20 hover:bg-white hover:border-zinc-300 hover:shadow-xxs transition duration-150 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800">{className}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditCategoryName(className)}
                          className="text-[10px] font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 px-2 py-0.5 rounded transition"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(className)}
                          className="text-[10px] font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                    {可用分类选项.map(cat => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <label key={cat} className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-[10px] font-sans font-medium transition select-none ${
                          isChecked ? 'bg-cyan-50 border-cyan-200 text-cyan-800 font-semibold' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCategory(className, cat)}
                            className="rounded text-cyan-600 focus:ring-cyan-500 h-2.5 w-2.5 border-zinc-300 focus:ring-offset-0"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {配置反馈 && (
        <div className={`flex items-start space-x-2 p-3 rounded-lg text-xs leading-relaxed transition ${配置反馈.includes('错误') ? 'bg-red-50 text-red-700 border border-red-105' : 'bg-emerald-50 text-emerald-850 border border-emerald-105'}`}>
          {配置反馈.includes('错误') ? <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" /> : <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />}
          <span>{配置反馈}</span>
        </div>
      )}
    </div>
  );
};