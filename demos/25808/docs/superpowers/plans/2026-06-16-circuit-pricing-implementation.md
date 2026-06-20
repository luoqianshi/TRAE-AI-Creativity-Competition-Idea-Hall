# 回路级价格管理实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现回路级价格管理，支持一处配置、全系统同步、历史追溯和未配置告警

**Architecture:** 采用统一价格查询 API 模式，在系统字典配置中集中管理所有回路的价格历史，各消费端统一调用 getPrice() 获取价格

**Tech Stack:** React + TypeScript + TailwindCSS + Lucide Icons

---

## 文件结构

| 类型 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/shared/types/types.ts` | 新增价格查询结果和回路价格历史类型 |
| 重写 | `src/shared/utils/pricing.ts` | 实现统一价格查询 API |
| 新增 | `src/components/config/CircuitPricingManager.tsx` | 回路价格管理组件 |
| 修改 | `src/components/config/SystemConfigView.tsx` | 添加回路价格管理标签页 |
| 修改 | `src/components/history/HistoryDailyDetailList.tsx` | 接入新 API |
| 修改 | `src/components/history/HistoryCalculations.ts` | 接入新 API |
| 修改 | `src/components/dashboard/PriceReferenceCard.tsx` | 接入新 API |

---

## 实施任务

---

### Task 1: P1 - 数据结构定义

**Files:**
- Modify: `src/shared/types/types.ts`

- [ ] **Step 1: 添加价格查询结果接口**

在 `src/shared/types/types.ts` 中添加：

```typescript
// 价格查询结果
export interface 价格查询结果 {
  单价: number;
  状态: 'found' | 'not_found' | 'unconfigured';
  回路名称?: string;
  告警信息?: string;
  建议单价?: number;
}

// 回路价格历史
export interface 回路价格历史 {
  回路id: string;
  回路名称: string;
  默认单价: number;
  历史记录: 单价变动事件[];
}
```

- [ ] **Step 2: 扩展字典配置接口**

在 `字典配置` 接口中添加：

```typescript
// 在现有字段之后添加
回路价格历史列表?: 回路价格历史[];
```

---

### Task 2: P2 - 统一价格查询 API

**Files:**
- Modify: `src/shared/utils/pricing.ts`

- [ ] **Step 1: 重写 pricing.ts，移除旧的 getBillingPriceAtDate 逻辑**

将 `src/shared/utils/pricing.ts` 完整重写为：

```typescript
import { 字典配置, DailyFieldConfig, 单价变动事件, 价格查询结果, 回路价格历史 } from "../types";

/**
 * 根据回路类型获取对应单价字段名
 */
function getPriceFieldByCategory(category: string): keyof 单价变动事件 {
  switch (category) {
    case "电":
      return "电费单价";
    case "水":
      return "水费单价";
    case "气":
      return "气费单价";
    default:
      return "电费单价";
  }
}

/**
 * 获取回路的能源分类
 */
function getCircuitCategory(回路id: string, 回路配置列表: DailyFieldConfig[]): string {
  const config = 回路配置列表.find(f => f.id === 回路id);
  return config?.category || "电";
}

/**
 * 创建未配置结果
 */
function createUnconfiguredResult(category: string): 价格查询结果 {
  return {
    单价: 0,
    状态: 'unconfigured',
    回路名称: category,
    告警信息: `⚠️ 回路未配置价格，请在系统字典-回路价格管理中设置`,
  };
}

/**
 * 创建未找到结果
 */
function createNotFoundResult(回路名称: string, 日期: string, 建议单价: number): 价格查询结果 {
  return {
    单价: 0,
    状态: 'not_found',
    回路名称: 回路名称,
    告警信息: `⚠️ 回路"${回路名称}"在${日期}无生效价格，请检查价格时光轴配置`,
    建议单价: 建议单价,
  };
}

/**
 * 统一价格查询入口
 * 所有板块统一调用此函数获取回路单价
 */
export function getPrice(
  回路id: string,
  日期: string,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[]
): 价格查询结果 {
  
  // 1. 获取回路配置
  const 回路列表 = 限额配置.回路价格历史列表 || [];
  const 回路配置 = 回路列表.find(h => h.回路id === 回路id);
  
  // 2. 获取回路类型
  const category = 回路配置列表 
    ? getCircuitCategory(回路id, 回路配置列表) 
    : "电";
  const 单价字段 = getPriceFieldByCategory(category);
  
  // 3. 情况1：回路未配置
  if (!回路配置) {
    return {
      单价: 0,
      状态: 'unconfigured',
      回路名称: 回路id,
      告警信息: `⚠️ 回路"${回路id}"未配置价格，请在系统字典-回路价格管理中设置`,
      建议单价: 限额配置.电费单价, // 全局兜底参考值
    };
  }
  
  // 4. 查找生效中的价格记录
  const 有效记录 = 回路配置.历史记录.find(
    r => r.生效日期 <= 日期 && (!r.结束日期 || r.结束日期 >= 日期)
  );
  
  if (有效记录) {
    return {
      单价: 有效记录[单价字段] as number,
      状态: 'found',
      回路名称: 回路配置.回路名称,
    };
  }
  
  // 5. 情况3：未找到对应日期的价格
  return createNotFoundResult(回路配置.回路名称, 日期, 回路配置.默认单价);
}

/**
 * 获取某回路当前生效的价格
 */
export function getCurrentPrice(
  回路id: string,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[]
): 价格查询结果 {
  const today = new Date().toISOString().split('T')[0];
  return getPrice(回路id, today, 限额配置, 回路配置列表);
}

/**
 * 获取某日所有回路的汇总价格（用于大盘展示）
 */
export function getDailyPrices(
  日期: string,
  限额配置: 字典配置,
  回路配置列表: DailyFieldConfig[]
): { 电: 价格查询结果; 水: 价格查询结果; 气: 价格查询结果 } {
  
  const 电回路 = 回路配置列表.find(f => f.category === '电');
  const 水回路 = 回路配置列表.find(f => f.category === '水');
  const 气回路 = 回路配置列表.find(f => f.category === '气');
  
  return {
    电: 电回路 ? getPrice(电回路.id, 日期, 限额配置, 回路配置列表) : createUnconfiguredResult('电'),
    水: 水回路 ? getPrice(水回路.id, 日期, 限额配置, 回路配置列表) : createUnconfiguredResult('水'),
    气: 气回路 ? getPrice(气回路.id, 日期, 限额配置, 回路配置列表) : createUnconfiguredResult('气'),
  };
}

/**
 * 获取回路的当前单价数值（便捷函数，用于兼容旧代码）
 */
export function getCircuitPrice(
  回路id: string,
  日期: string,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[]
): number {
  const result = getPrice(回路id, 日期, 限额配置, 回路配置列表);
  return result.单价;
}
```

---

### Task 3: P3 - 回路价格管理 UI（新增组件）

**Files:**
- Create: `src/components/config/CircuitPricingManager.tsx`

- [ ] **Step 1: 创建回路价格管理组件**

创建 `src/components/config/CircuitPricingManager.tsx`：

```typescript
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
function getCurrentCircuitPrice(回路id: string, 配置输入: 字典配置): { 单价: number; 状态: string } {
  const result = getCurrentPrice(回路id, 配置输入);
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
    const current = getCurrentCircuitPrice(回路id, 配置输入);
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
    
    const priceField = categoryInfo[editingCategory as keyof typeof categoryInfo].priceField;
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
    const { 单价, 状态 } = getCurrentCircuitPrice(circuit.id, 配置输入);
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
                        return (
                          <tr key={record.id} className="hover:bg-zinc-50">
                            <td className="px-4 py-2 font-mono text-zinc-700">{record.生效日期}</td>
                            <td className="px-4 py-2 font-mono text-zinc-700">
                              {record.结束日期 || '至今'}
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-medium">
                              ¥{record[categoryInfo[category as keyof typeof categoryInfo].priceField].toFixed(2)}
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
```

---

### Task 4: P3 - 添加回路价格管理标签页到 SystemConfigView

**Files:**
- Modify: `src/components/config/SystemConfigView.tsx`

- [ ] **Step 1: 在 SystemConfigView.tsx 中添加回路价格管理标签页**

找到标签页定义，添加新的标签页：

```typescript
// 在现有标签页中添加
{ id: "回路价格管理", label: "回路价格管理", icon: "⚡" },
```

- [ ] **Step 2: 在组件中导入并渲染 CircuitPricingManager**

```typescript
import { CircuitPricingManager } from "./CircuitPricingManager";

// 在标签页内容渲染部分添加 case
case "回路价格管理":
  return (
    <CircuitPricingManager
      配置输入={配置输入}
      set配置输入={set配置输入}
      日常回路配置={配置输入.日常回路配置 || []}
      openConfirm={openConfirm}
      openAlert={openAlert}
    />
  );
```

---

### Task 5: P4 - 历史抄表库接入新 API

**Files:**
- Modify: `src/components/history/HistoryCalculations.ts`
- Modify: `src/components/history/HistoryDailyDetailList.tsx`

- [ ] **Step 1: 修改 historyCalculations.ts 中的 getElectricUsageAndKwh 函数**

找到 `getElectricUsageAndKwh` 函数，修改价格获取逻辑：

```typescript
import { getCircuitPrice } from "../../shared/utils/pricing";

// 在函数内部修改
export function getElectricUsageAndKwh(
  dateStr: string,
  parentId: string,
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[],  // 新增参数
) {
  // ... 现有逻辑 ...

  const usage = Math.max(0, e_today - e_yesterday);
  const kwh = usage * (限额配置?.电表换算基数 ?? 3500);
  
  // 修改这里：使用统一 API 获取价格
  const price = getCircuitPrice(parentId, dateStr, 限额配置, 回路配置列表);
  const cost = kwh * price;

  return { usage, kwh, price, cost };
}
```

- [ ] **Step 2: 同样修改 getWaterUsageAndCost 和 getGasUsageAndCost 函数**

类似修改水和气的计算函数：

```typescript
export function getWaterUsageAndCost(
  dateStr: string,
  parentId: string,
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[],  // 新增参数
) {
  // ... 现有逻辑 ...
  
  const usage = Math.max(0, w_today - w_yesterday);
  const price = getCircuitPrice(parentId, dateStr, 限额配置, 回路配置列表);
  const cost = usage * price;

  return { usage, price, cost };
}

export function getGasUsageAndCost(
  dateStr: string,
  parentId: string,
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[],  // 新增参数
) {
  // ... 现有逻辑 ...
  
  const usage = Math.max(0, g_today - g_yesterday);
  const price = getCircuitPrice(parentId, dateStr, 限额配置, 回路配置列表);
  const cost = usage * price;

  return { usage, price, cost };
}
```

- [ ] **Step 3: 修改 getDailyTotalElectric, getDailyTotalWater, getDailyTotalGas 函数**

为这些汇总函数添加回路配置参数并传递：

```typescript
export function getDailyTotalElectric(
  dateStr: string,
  日常回路配置: DailyFieldConfig[],
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
) {
  // 传递回路配置
  日常回路配置
    .filter((f) => f.category === "电")
    .forEach((f) => {
      const res = getElectricUsageAndKwh(dateStr, f.id, currentDataMap, 限额配置, 日常回路配置);
      // ...
    });
}
```

- [ ] **Step 4: 修改 HistoryDailyDetailList.tsx 中的 calcCell 函数**

更新 `calcCell` 函数中调用计算函数的地方，传递回路配置列表。

---

### Task 6: P5 - PriceReferenceCard 接入新 API

**Files:**
- Modify: `src/components/dashboard/PriceReferenceCard.tsx`

- [ ] **Step 1: 修改 PriceReferenceCard 使用 getDailyPrices**

```typescript
import { getDailyPrices } from "../../shared/utils/pricing";

// 在组件内部
const 价格 = getDailyPrices(dashboardDate, 限额配置, 回路配置列表);
```

---

## 验收标准检查

- [ ] 回路价格管理标签页可正常访问
- [ ] 可为各回路设置独立单价
- [ ] 可为回路添加价格历史时光轴
- [ ] 历史抄表库正确显示各回路当时生效的单价
- [ ] 回路未配置价格时显示告警提示
- [ ] 用电/用水/用气看板单价与配置同步
- [ ] 综合能耗大盘单价与配置同步
