import React from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { MonthlyCircuitConfig } from '../../shared/types';

interface MonthlyFormProps {
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
  自定义大类映射: { [key: string]: string[] };
  月度历史: any[];
}

export const MonthlyForm: React.FC<MonthlyFormProps> = ({
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
  月度历史,
}) => {
  // Helper to find the custom summary major category name for a given secondary category
  const getMajorCategoryOfCircuit = (circuitCat: string) => {
    for (const [majorCat, subCats] of Object.entries(自定义大类映射 || {})) {
      if (Array.isArray(subCats) && subCats.includes(circuitCat)) {
        return majorCat;
      }
    }
    return circuitCat || "未分类";
  };

  // Get all unique major categories
  const activeMajorCategories = Array.from(
    new Set(circuitData.map((c) => getMajorCategoryOfCircuit(c.category)))
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            月度回路全量录入
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            对酒店内精细化二级支路仪表进行全量核对录入，数据按自然月进行全周期归档。
          </p>
        </div>
        <button
          id="reset_monthly_btn"
          type="button"
          onClick={快速清空月度表单}
          className="flex items-center space-x-2 px-3.5 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-sm font-bold text-zinc-600 transition cursor-pointer shadow-xs active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>重置当前单据</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 bg-white border border-zinc-200/60 rounded-2xl shadow-xs p-6 flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div className="space-y-1.5">
              <span className="text-sm font-bold text-zinc-650 uppercase block">当前抄表月份</span>
              <input
                type="month"
                value={选中月度月份}
                onChange={(e) => set选中月度月份(e.target.value)}
                className="px-3.5 py-2 border border-zinc-200 rounded-xl text-zinc-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/10 font-mono bg-zinc-50/50"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeMajorCategories.map((cat) => {
                const catCount = circuitData.filter(c => getMajorCategoryOfCircuit(c.category) === cat).length;
                const selectedCount = circuitData.filter(c => getMajorCategoryOfCircuit(c.category) === cat && 月度回路输入[c.id] !== undefined && 月度回路输入[c.id] !== '').length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set当前回路分类(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 relative cursor-pointer ${
                      当前回路分类 === cat
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="ml-1 text-xs opacity-80 font-semibold font-sans">
                      ({selectedCount}/{catCount})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={提交月度抄表} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {circuitData
                .filter(c => getMajorCategoryOfCircuit(c.category) === 当前回路分类)
                .map((circuit) => {
                  const findPreviousReading = (circuitId: string): number => {
                    const pastRecords = 月度历史
                      .filter((item) => item.月份 < 选中月度月份)
                      .sort((a, b) => b.月份.localeCompare(a.月份));

                    if (pastRecords.length > 0) {
                      const closestRecord = pastRecords[0];
                      if (closestRecord.数据 && closestRecord.数据[circuitId] !== undefined) {
                        return Number(closestRecord.数据[circuitId]);
                      }
                    }
                    return 0;
                  };

                  const prevReading = findPreviousReading(circuit.id);
                  const currentInput = 月度回路输入[circuit.id] || '';
                  const isSwapped = 月度回路输入[`swap_${circuit.id}`] === "true";

                  const oldFinalVal = 月度回路输入[`old_final_${circuit.id}`] !== undefined && 月度回路输入[`old_final_${circuit.id}`] !== ""
                    ? Number(月度回路输入[`old_final_${circuit.id}`])
                    : prevReading;
                  const newStartVal = 月度回路输入[`new_start_${circuit.id}`] !== undefined && 月度回路输入[`new_start_${circuit.id}`] !== ""
                    ? Number(月度回路输入[`new_start_${circuit.id}`])
                    : 0;

                  const consumption = currentInput
                    ? (isSwapped
                        ? Math.max(0, oldFinalVal - prevReading) + Math.max(0, Number(currentInput) - newStartVal)
                        : Number(currentInput) - prevReading)
                    : 0;

                  return (
                    <div key={circuit.id} className="p-3 border border-zinc-200 rounded-xl bg-zinc-50/30 hover:bg-white hover:border-zinc-300 transition-all duration-150 flex flex-col justify-between space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-900">{circuit.name}</span>
                        <span className="text-[10px] text-zinc-400 font-bold font-sans">
                          上期底码: <span className="font-mono text-zinc-600">{prevReading.toFixed(1)}</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="请输入本月读数..."
                          value={currentInput}
                          onChange={(e) => {
                            set月度回路输入(prev => ({
                              ...prev,
                               [circuit.id]: e.target.value
                            }));
                          }}
                          className="block w-full py-1.5 pl-3 pr-12 border border-zinc-200 rounded-lg text-zinc-900 text-sm font-mono font-bold focus:outline-none focus:border-zinc-900 bg-white"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-zinc-400 font-sans">
                          Kwh
                        </span>
                      </div>

                      {/* Swap and Rollover assistant */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-1.5 text-[10px] text-zinc-500 font-semibold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSwapped}
                            onChange={(e) => {
                              set月度回路输入(prev => ({
                                ...prev,
                                [`swap_${circuit.id}`]: e.target.checked ? "true" : "false",
                                ...(!e.target.checked && {
                                  [`old_final_${circuit.id}`]: "",
                                  [`new_start_${circuit.id}`]: ""
                                })
                              }));
                            }}
                            className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500/20 h-3 w-3"
                          />
                          <span>换表/清零校准</span>
                        </label>
                      </div>

                      {isSwapped && (
                        <div className="p-2 bg-amber-50/50 border border-amber-200/50 rounded-lg space-y-1.5 text-[10px]">
                          <div className="grid grid-cols-2 gap-1.5 font-sans">
                            <div>
                              <span className="block font-semibold text-zinc-500">旧表止码</span>
                              <input
                                type="number"
                                step="0.1"
                                placeholder={prevReading.toString()}
                                value={月度回路输入[`old_final_${circuit.id}`] || ''}
                                onChange={(e) => {
                                  set月度回路输入(prev => ({
                                    ...prev,
                                    [`old_final_${circuit.id}`]: e.target.value
                                  }));
                                }}
                                className="w-full mt-0.5 border border-zinc-300 rounded px-1.5 py-0.5 font-mono text-zinc-900 font-bold focus:outline-none"
                              />
                            </div>
                            <div>
                              <span className="block font-semibold text-zinc-500">新表起码</span>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={月度回路输入[`new_start_${circuit.id}`] || ''}
                                onChange={(e) => {
                                  set月度回路输入(prev => ({
                                    ...prev,
                                    [`new_start_${circuit.id}`]: e.target.value
                                  }));
                                }}
                                className="w-full mt-0.5 border border-zinc-300 rounded px-1.5 py-0.5 font-mono text-zinc-900 font-bold focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {currentInput && (
                        <div className="flex items-center justify-between text-[11px] font-sans border-t border-dashed border-zinc-100 pt-1.5 mt-0.5">
                          <span className="text-zinc-400 font-medium">本月折算用量：</span>
                          {consumption < 0 ? (
                            <span className="text-rose-500 font-bold">⚠️ 负差报警</span>
                          ) : (
                            <span className="font-extrabold font-mono text-emerald-600">
                              {consumption.toLocaleString(undefined, { maximumFractionDigits: 2 })} Kwh
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {月度抄表反馈 && (
              <div
                className={`flex items-start space-x-2 p-3 rounded-lg text-xs leading-relaxed transition ${
                  月度抄表反馈.includes('错误')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                <span>{月度抄表反馈}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 flex items-center justify-center space-x-2 border border-transparent rounded-2xl text-sm font-bold text-white bg-zinc-950 hover:bg-zinc-900 active:scale-[0.99] transition cursor-pointer shadow-lg"
            >
              <Save className="h-4 w-4" />
              <span>保存并提交「{选中月度月份}」全量计量数据</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
