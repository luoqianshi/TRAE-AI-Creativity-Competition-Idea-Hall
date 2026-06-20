import React from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Save, RefreshCw } from 'lucide-react';
import { DailyFieldConfig, 抄表记录, 字典配置 } from '../../shared/types';

interface DailyFormProps {
  快速清空抄表表单: () => void;
  提交日常抄表: (e: React.FormEvent) => void;
  输入日期: string;
  set输入日期: (val: string) => void;
  日常回路配置: DailyFieldConfig[];
  最新记录: 抄表记录;
  日常抄表输入: { [key: string]: string };
  set日常抄表输入: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  抄表反馈: string;
  限额配置: 字典配置;
}

export const DailyForm: React.FC<DailyFormProps> = ({
  快速清空抄表表单,
  提交日常抄表,
  输入日期,
  set输入日期,
  日常回路配置,
  最新记录,
  日常抄表输入,
  set输入日期: _unused_set输入日期,
  set日常抄表输入,
  抄表反馈,
  限额配置,
}) => {
  return (
    <>
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-sans">
            日常抄表数值登记柜
          </h2>
          <p className="text-sm text-zinc-500 mt-1 font-sans">
            各回路测算子表累计读底核对录入。系统自动根据上期表底折算单日净耗量并核算能效。
          </p>
        </div>
        <button
          id="reset_daily_form_btn"
          type="button"
          onClick={快速清空抄表表单}
          className="flex items-center space-x-1.5 px-3.5 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-sm font-bold text-zinc-600 transition cursor-pointer shadow-xs active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>重置表单</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 bg-white border border-zinc-200/60 rounded-2xl shadow-sm p-6 relative overflow-hidden">
          <form onSubmit={提交日常抄表} className="space-y-6">
            <div className="space-y-8">
              <div className="space-y-2 max-w-xs select-none">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  抄表登记日期
                </label>
                <input
                  type="date"
                  value={输入日期}
                  onChange={(e) => set输入日期(e.target.value)}
                  className="block w-full py-2.5 px-3.5 border border-zinc-200 rounded-xl text-zinc-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-sans"
                />
              </div>

              {[
                { key: '电', label: '电能回路计量表底底数 (度)', accentClass: 'text-cyan-600 border-cyan-500' },
                { key: '水', label: '水管回路计量表底底数 (吨)', accentClass: 'text-emerald-600 border-emerald-500' },
                { key: '气', label: '燃气及锅炉设备表底底数 (立方)', accentClass: 'text-orange-600 border-orange-500' }
              ].map(section => {
                const fields = 日常回路配置.filter(f => f.category === section.key);
                if (fields.length === 0) return null;

                return (
                  <div key={section.key} className="space-y-4 pt-4 border-t border-zinc-100 first:border-0 first:pt-0">
                    <h3 className={`text-sm font-bold uppercase tracking-wider border-l-3 pl-2.5 ${section.accentClass} flex items-center`}>
                      {section.label}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {fields.map(field => {
                        const lastValue = 最新记录[field.id] !== undefined ? Number(最新记录[field.id]) : 0;
                        const currentInput = 日常抄表输入[field.id] || '';
                        
                        const isSwapped = 日常抄表输入[`swap_${field.id}`] === "true";
                        const oldFinalVal = 日常抄表输入[`old_final_${field.id}`] !== undefined && 日常抄表输入[`old_final_${field.id}`] !== ""
                          ? Number(日常抄表输入[`old_final_${field.id}`])
                          : lastValue;
                        const newStartVal = 日常抄表输入[`new_start_${field.id}`] !== undefined && 日常抄表输入[`new_start_${field.id}`] !== ""
                          ? Number(日常抄表输入[`new_start_${field.id}`])
                          : 0;

                        const consumption = currentInput 
                          ? (isSwapped 
                              ? Math.max(0, oldFinalVal - lastValue) + Math.max(0, Number(currentInput) - newStartVal)
                              : Number(currentInput) - lastValue)
                          : 0;

                        const ratio = 限额配置?.电表换算基数 ?? 3500;
                        const totalKwh = field.category === "电" ? consumption * ratio : consumption;

                        return (
                          <div 
                            key={field.id} 
                            className="p-4 rounded-2xl border transition-all duration-300 bg-zinc-50/20 border-zinc-200/60 hover:bg-zinc-50/40 hover:border-zinc-300 shadow-xs"
                          >
                            <label className="block text-sm font-bold text-zinc-800 tracking-tight flex items-center justify-between select-none">
                              <span>{field.name}</span>
                              <span className="text-xs text-zinc-500 font-semibold font-sans">
                                上期底数: <span className="font-mono font-bold text-zinc-600">{lastValue.toFixed(1)}</span>
                              </span>
                            </label>

                            <div className="relative mt-2.5">
                              <input
                                type="number"
                                step="0.1"
                                value={currentInput}
                                onChange={(e) => {
                                  set日常抄表输入(prev => ({
                                    ...prev,
                                    [field.id]: e.target.value
                                  }));
                                }}
                                placeholder="请输入最新累积表底读数"
                                className="block w-full py-2.5 px-3.5 pr-12 border border-zinc-200 rounded-xl text-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-sans font-medium"
                              />
                              <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-extrabold text-zinc-400 uppercase tracking-widest font-sans">
                                {field.unit}
                              </span>
                            </div>

                            {/* Meter Rollover & Swap Assistant Toggle */}
                            <div className="mt-3 flex items-center justify-between">
                              <label className="flex items-center space-x-2 text-[11px] text-zinc-500 font-semibold hover:text-zinc-800 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isSwapped}
                                  onChange={(e) => {
                                    set日常抄表输入(prev => ({
                                      ...prev,
                                      [`swap_${field.id}`]: e.target.checked ? "true" : "false",
                                      ...(!e.target.checked && {
                                        [`old_final_${field.id}`]: "",
                                        [`new_start_${field.id}`]: ""
                                      })
                                    }));
                                  }}
                                  className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500/20 cursor-pointer h-3.5 w-3.5"
                                />
                                <span className="flex items-center gap-1 font-sans">
                                  <RefreshCw className={`h-3 w-3 text-amber-500 ${isSwapped ? "animate-spin" : ""}`} style={{ height: '11px', width: '11px' }} />
                                  <span>换表 / 清零校准标记</span>
                                </span>
                              </label>
                            </div>

                            {/* Swap Inputs fields */}
                            {isSwapped && (
                              <div className="mt-2.5 p-3 rounded-xl bg-amber-50/40 border border-amber-200/50 space-y-2 animate-fade-in">
                                <p className="text-[10px] leading-tight font-semibold text-amber-800 font-sans">
                                  💡 自动扣减历史底数：从 {lastValue.toFixed(1)} 累加到 [旧表止码]，再从 [新表起码] 算起。
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 mb-1">旧表最后止码</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={日常抄表输入[`old_final_${field.id}`] || ''}
                                      onChange={(e) => {
                                        set日常抄表输入(prev => ({
                                          ...prev,
                                          [`old_final_${field.id}`]: e.target.value
                                        }));
                                      }}
                                      placeholder={lastValue.toString()}
                                      className="block w-full py-1 px-2 border border-zinc-300 rounded-lg text-zinc-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 mb-1">新表初始起码</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={日常抄表输入[`new_start_${field.id}`] || ''}
                                      onChange={(e) => {
                                        set日常抄表输入(prev => ({
                                          ...prev,
                                          [`new_start_${field.id}`]: e.target.value
                                        }));
                                      }}
                                      placeholder="0.0"
                                      className="block w-full py-1 px-2 border border-zinc-300 rounded-lg text-zinc-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {currentInput && (
                              <div className="mt-3.5 flex flex-col space-y-1 text-xs border-t border-dashed border-zinc-200/80 pt-2.5 font-sans">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-500 font-semibold">折算单日抄见差量：</span>
                                  {consumption < 0 ? (
                                    <span className="text-rose-500 font-bold">⚠️ 读数低于上期 (负差报警)</span>
                                  ) : (
                                    <span className="font-bold font-mono text-zinc-700">
                                      {consumption.toFixed(1)} {field.unit}
                                    </span>
                                  )}
                                </div>
                                {field.category === "电" && consumption >= 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 font-semibold">结合倍率实际用能：</span>
                                    <span className="font-extrabold font-mono text-emerald-600">
                                      {totalKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })} 度
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {抄表反馈 && (
              <div
                className={`flex items-start space-x-2.5 p-3.5 rounded-2xl text-xs leading-relaxed border transition-all ${
                  评论包含错误(抄表反馈)
                    ? 'bg-rose-50/50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50/50 text-emerald-800 border-emerald-200'
                }`}
              >
                {评论包含错误(抄表反馈) ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                )}
                <span>{抄表反馈}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 flex items-center justify-center space-x-2 border border-transparent rounded-2xl text-sm font-bold text-white bg-zinc-950 hover:bg-zinc-900 active:scale-[0.99] transition cursor-pointer shadow-lg"
            >
              <Save className="h-4 w-4" />
              <span>确认填报并封存计量仓</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

function 评论包含错误(text: string) {
  return text.includes('错误') || text.includes('失败') || text.includes('未填');
}
