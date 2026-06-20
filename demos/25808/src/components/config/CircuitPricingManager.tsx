import React, { useState, useMemo } from "react";
import { Plus, Trash2, CalendarRange, AlertTriangle, Check } from "lucide-react";
import { 字典配置, DailyFieldConfig, 回路价格历史, 单价变动事件 } from "../../shared/types";
import { getChinaDateStr } from "../../shared/utils/dateUtils";
import { getCurrentPrice } from "../../shared/utils/pricing";

interface CircuitPricingManagerProps {
  配置输入: 字典配置;
  set配置输入: (val: 字典配置) => void;
  日常回路配置: DailyFieldConfig[];
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openAlert: (title: string, message: string) => void;
}

// 获取某回路当前生效价格
function getCurrentCircuitPrice(回路id: string, 配置输入: 字典配置, 日常回路配置?: DailyFieldConfig[]) {
  const result = getCurrentPrice(回路id, 配置输入, 日常回路配置);
  return { 单价: result.单价, 状态: result.状态 };
}

// 获取某回路的价格配置
function getCircuitPriceConfig(回路id: string, 配置输入: 字典配置): 回路价格历史 | undefined {
  return (配置输入.回路价格历史列表 || []).find(h => h.回路id === 回路id);
}

export const CircuitPricingManager: React.FC<CircuitPricingManagerProps> = ({
  配置输入,
  set配置输入,
  日常回路配置,
  openConfirm,
  openAlert,
}) => {
  const [编辑回路id, set编辑回路id] = useState<string | null>(null);
  
  // 编辑弹窗状态
  const [新生效日期, set新生效日期] = useState<string>("");
  const [新结束日期, set新结束日期] = useState<string>("");
  const [直至如今, set直至如今] = useState<boolean>(true);
  const [新单价, set新单价] = useState<string>("");
  const [新备注, set新备注] = useState<string>("");

  // 按分类分组回路
  const groupedCircuits = useMemo(() => {
    const groups: Record<string, DailyFieldConfig[]> = { 电: [], 水: [], 气: [] };
    日常回路配置.forEach(c => {
      const cat = c.category || "电";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }, [日常回路配置]);

  // 获取分类名称和单位
  const categoryInfo = {
    电: { name: "电类回路价格", unit: "元/度", priceField: "电费单价" as const },
    水: { name: "水类回路价格", unit: "元/吨", priceField: "水费单价" as const },
    气: { name: "气类回路价格", unit: "元/m³", priceField: "气费单价" as const },
  };

  // 打开编辑弹窗
  const handleOpenEdit = (回路id: string) => {
    set编辑回路id(回路id);
    set新生效日期(getChinaDateStr());
    set新结束日期("");
    set直至如今(true);
    
    // 初始化单价为当前值
    const current = getCurrentCircuitPrice(回路id, 配置输入, 日常回路配置);
    set新单价(current.单价 > 0 ? current.单价.toString() : "");
    set新备注("");
  };

  // 关闭编辑弹窗
  const handleCloseEdit = () => {
    set编辑回路id(null);
  };

  // 获取当前编辑的回路配置
  const editingCircuit = 编辑回路id ? 日常回路配置.find(c => c.id === 编辑回路id) : null;
  const editingPriceConfig = 编辑回路id ? getCircuitPriceConfig(编辑回路id, 配置输入) : null;
  const editingCategory = editingCircuit?.category || "电";

  // 获取当前编辑回路的价格历史
  const priceHistory = useMemo(() => {
    if (!editingPriceConfig) return [];
    return [...editingPriceConfig.历史记录].sort((a, b) => 
      b.生效日期.localeCompare(a.生效日期)
    );
  }, [editingPriceConfig]);

  // 添加价格记录
  const handleAddPriceRecord = () => {
    if (!编辑回路id || !新生效日期) return;
    
    const priceValue = parseFloat(新单价) || 0;
    
    if (priceValue <= 0) {
      openAlert("输入错误", "请输入有效的价格数值");
      return;
    }

    const newRecord: 单价变动事件 = {
      id: "price_" + Date.now(),
      生效日期: 新生效日期,
      结束日期: 直至如今 ? undefined : 新结束日期 || undefined,
      电费单价: editingCategory === "电" ? priceValue : 0,
      水费单价: editingCategory === "水" ? priceValue : 0,
      气费单价: editingCategory === "气" ? priceValue : 0,
      备注: 新备注.trim() || "价格调整",
      操作人: "工程总监",
    };

    // 更新回路价格历史列表
    const currentList = 配置输入.回路价格历史列表 || [];
    const existingIndex = currentList.findIndex(h => h.回路id === 编辑回路id);
    
    let newList: 回路价格历史[];
    if (existingIndex >= 0) {
      // 更新现有回路
      newList = [...currentList];
      newList[existingIndex] = {
        ...newList[existingIndex],
        默认单价: priceValue,
        历史记录: [...newList[existingIndex].历史记录, newRecord],
      };
    } else {
      // 新增回路
      const circuit = editingCircuit!;
      newList = [...currentList, {
        回路id: 编辑回路id,
        回路名称: circuit.name,
        默认单价: priceValue,
        历史记录: [newRecord],
      }];
    }

    set配置输入({
      ...配置输入,
      回路价格历史列表: newList,
    });

    // 重置输入
    set新单价("");
    set新备注("");
  };

  // 删除价格记录
  const handleDeleteRecord = (recordId: string) => {
    openConfirm(
      "删除确认",
      "确定要删除这条价格记录吗？",
      () => {
        if (!编辑回路id) return;
        
        const currentList = 配置输入.回路价格历史列表 || [];
        const existingIndex = currentList.findIndex(h => h.回路id === 编辑回路id);
        if (existingIndex < 0) return;

        const updatedHistory = currentList[existingIndex].历史记录.filter(r => r.id !== recordId);
        
        const newList = [...currentList];
        newList[existingIndex] = {
          ...newList[existingIndex],
          历史记录: updatedHistory,
        };

        set配置输入({
          ...配置输入,
          回路价格历史列表: newList,
        });
      }
    );
  };

  // 渲染回路卡片
  const renderCircuitCard = (circuit: DailyFieldConfig) => {
    const { 单价, 状态 } = getCurrentCircuitPrice(circuit.id, 配置输入, 日常回路配置);
    const category = circuit.category || "电";
    const unit = categoryInfo[category as keyof typeof categoryInfo].unit;
    
    return (
      <div 
        key={circuit.id} 
        className={`p-4 rounded-xl border ${
          状态 === 'found' 
            ? 'bg-white border-zinc-200' 
            : 'bg-amber-50 border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-zinc-800">{circuit.name}</div>
            <div className="text-sm text-zinc-500 mt-1">
              {状态 === 'found' ? (
                <span className="text-emerald-600 font-medium">
                  当前单价：¥{单价.toFixed(2)}/{unit.replace("元/", "")}
                </span>
              ) : (
                <span className="flex items-center text-amber-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  未配置价格
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleOpenEdit(circuit.id)}
            className="px-3 py-1.5 text-sm font-medium bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition"
          >
            编辑时光轴
          </button>
        </div>
      </div>
    );
  };

  // 渲染编辑弹窗
  const renderEditModal = () => {
    if (!编辑回路id || !editingCircuit) return null;
    
    const category = editingCircuit.category || "电";
    const unit = categoryInfo[category as keyof typeof categoryInfo].unit;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* 弹窗头部 */}
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-800">编辑回路价格时光轴</h3>
            <button onClick={handleCloseEdit} className="text-zinc-400 hover:text-zinc-600">
              ✕
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* 回路信息 */}
            <div className="mb-6 p-4 bg-zinc-50 rounded-xl">
              <div className="font-semibold text-zinc-800">{editingCircuit.name}</div>
              <div className="text-sm text-zinc-500 mt-1">
                类型：{category === '电' ? '⚡ 电费' : category === '水' ? '💧 水费' : '🔥 气费'}
              </div>
            </div>

            {/* 新增价格记录 */}
            <div className="mb-6 p-4 bg-cyan-50/50 border border-cyan-200 rounded-xl">
              <h4 className="font-semibold text-zinc-800 mb-3">新增价格记录</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">生效日期</label>
                  <input
                    type="date"
                    value={新生效日期}
                    onChange={(e) => set新生效日期(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 flex justify-between">
                    <span>结束日期</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={直至如今}
                        onChange={(e) => set直至如今(e.target.checked)}
                        className="w-3 h-3"
                      />
                      <span className="text-[10px]">至今</span>
                    </label>
                  </label>
                  <input
                    type="date"
                    value={新结束日期}
                    disabled={直至如今}
                    onChange={(e) => set新结束日期(e.target.value)}
                    className={`w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm ${
                      直至如今 ? 'bg-zinc-100 text-zinc-400' : ''
                    }`}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-zinc-500 mb-1">
                  价格（{unit}）
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={新单价}
                  onChange={(e) => set新单价(e.target.value)}
                  placeholder="请输入价格"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                />
              </div>
              <div className="mt-4">
                <label className="block text-xs text-zinc-500 mb-1">备注</label>
                <input
                  type="text"
                  value={新备注}
                  onChange={(e) => set新备注(e.target.value)}
                  placeholder="如：2025年电价调整"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={handleAddPriceRecord}
                disabled={!新生效日期 || !新单价}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                添加
              </button>
            </div>

            {/* 价格历史 */}
            <div>
              <h4 className="font-semibold text-zinc-800 mb-3">价格时光轴历史</h4>
              {priceHistory.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  暂无价格记录
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-zinc-600">生效日期</th>
                        <th className="px-4 py-2 text-left font-medium text-zinc-600">结束日期</th>
                        <th className="px-4 py-2 text-right font-medium text-zinc-600">单价</th>
                        <th className="px-4 py-2 text-center font-medium text-zinc-600">状态</th>
                        <th className="px-4 py-2 text-center font-medium text-zinc-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {priceHistory.map((record) => {
                        const isActive = !record.结束日期 || record.结束日期 >= getChinaDateStr();
                        const priceField = categoryInfo[category as keyof typeof categoryInfo].priceField;
                        return (
                          <tr key={record.id} className="hover:bg-zinc-50">
                            <td className="px-4 py-2 font-mono text-zinc-700">{record.生效日期}</td>
                            <td className="px-4 py-2 font-mono text-zinc-700">
                              {record.结束日期 || '至今'}
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-medium">
                              ¥{(record[priceField] as number).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  <Check className="h-3 w-3 mr-1" />
                                  当前
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500">
                                  已归档
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className="text-zinc-400 hover:text-red-500 transition"
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 弹窗底部 */}
          <div className="px-6 py-4 border-t border-zinc-200 flex justify-end">
            <button
              onClick={handleCloseEdit}
              className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-300 transition"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
          <CalendarRange className="h-4.5 w-4.5 text-zinc-400" />
          回路价格管理
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          为本系统的各个回路设置独立的单价策略，支持时间维度追溯。所有板块自动同步调用。
        </p>
      </div>

      {/* 电类回路 */}
      {groupedCircuits.电.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span>⚡</span> {categoryInfo.电.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedCircuits.电.map(renderCircuitCard)}
          </div>
        </div>
      )}

      {/* 水类回路 */}
      {groupedCircuits.水.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span>💧</span> {categoryInfo.水.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedCircuits.水.map(renderCircuitCard)}
          </div>
        </div>
      )}

      {/* 气类回路 */}
      {groupedCircuits.气.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <span>🔥</span> {categoryInfo.气.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedCircuits.气.map(renderCircuitCard)}
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {renderEditModal()}
    </div>
  );
};
