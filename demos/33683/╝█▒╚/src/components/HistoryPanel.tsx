import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, RotateCcw, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatUnitPrice } from '@/utils/calculator';
import type { HistoryRecord } from '@/types';

export default function HistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { history, loadFromHistory, clearHistory } = useAppStore();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getBestProduct = (record: HistoryRecord) => {
    const best = record.results.find((r) => r.isBest);
    if (!best) return null;
    return record.products.find((p) => p.id === best.productId);
  };

  return (
    <section className="px-4 mt-6 mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">历史记录</span>
          {history.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{history.length}</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && (
        <div className="mt-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">暂无历史记录</div>
          ) : (
            <>
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {history.map((record) => {
                  const bestProduct = getBestProduct(record);
                  return (
                    <div key={record.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{formatTime(record.timestamp)}</span>
                        <button
                          onClick={() => loadFromHistory(record.products)}
                          className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          重新对比
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {record.products.map((p) => {
                          const result = record.results.find((r) => r.productId === p.id);
                          if (!result || !p.quantity || !p.unit || !p.price) return null;
                          return (
                            <span
                              key={p.id}
                              className={`text-xs px-2 py-1 rounded-lg ${
                                result.isBest
                                  ? 'bg-emerald-100 text-emerald-700 font-medium'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {p.name || '商品'} {formatUnitPrice(result.unitPrice, result.normalizedUnit)}
                            </span>
                          );
                        })}
                      </div>
                      {bestProduct && (
                        <div className="text-xs text-emerald-600 mt-1.5">
                          最划算：「{bestProduct.name || '商品'}」
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-gray-50">
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  清空历史
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}