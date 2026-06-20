import { Trash2 } from 'lucide-react';
import type { Product } from '@/types';
import { UNITS, QUICK_QUANTITIES } from '@/utils/units';
import { parsePrice } from '@/utils/calculator';
import { useState, useCallback } from 'react';

interface ProductRowProps {
  product: Product;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: keyof Product, value: string | number) => void;
  onDelete: (id: string) => void;
}

export default function ProductRow({ product, index, canDelete, onUpdate, onDelete }: ProductRowProps) {
  const [priceInput, setPriceInput] = useState(product.price > 0 ? String(product.price) : '');
  const [showQuickQty, setShowQuickQty] = useState(false);

  const handlePriceChange = useCallback((value: string) => {
    setPriceInput(value);
    const parsed = parsePrice(value);
    onUpdate(product.id, 'price', parsed ?? 0);
  }, [product.id, onUpdate]);

  const handleQuantityChange = useCallback((value: string) => {
    const num = value === '' ? 0 : parseFloat(value);
    onUpdate(product.id, 'quantity', isNaN(num) ? 0 : num);
  }, [product.id, onUpdate]);

  const handleQuickQuantity = useCallback((qty: number) => {
    onUpdate(product.id, 'quantity', qty);
    setShowQuickQty(false);
  }, [product.id, onUpdate]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 transition-all duration-200">
      {/* 行号标题 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
          商品 {index + 1}
        </span>
        {canDelete && (
          <button
            onClick={() => onDelete(product.id)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
            aria-label="删除商品"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 商品名称 */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">商品名称（选填）</label>
        <input
          type="text"
          value={product.name}
          onChange={(e) => onUpdate(product.id, 'name', e.target.value)}
          placeholder="如：伊利纯牛奶"
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-300"
        />
      </div>

      {/* 规格 + 单位 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <label className="block text-xs font-medium text-gray-500 mb-1">规格</label>
          <input
            type="number"
            value={product.quantity || ''}
            onChange={(e) => handleQuantityChange(e.target.value)}
            onFocus={() => setShowQuickQty(true)}
            onBlur={() => setTimeout(() => setShowQuickQty(false), 200)}
            placeholder="500"
            min="0"
            step="any"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-300"
          />
          {showQuickQty && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-1 flex gap-1 z-10">
              {QUICK_QUANTITIES.map((qty) => (
                <button
                  key={qty}
                  onMouseDown={(e) => { e.preventDefault(); handleQuickQuantity(qty); }}
                  className="px-2 py-1 text-xs rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  {qty}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-gray-500 mb-1">单位</label>
          <select
            value={product.unit}
            onChange={(e) => onUpdate(product.id, 'unit', e.target.value)}
            className="w-full px-2 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white text-gray-700"
          >
            <option value="">选择</option>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 价格 */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">价格（元）</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">¥</span>
          <input
            type="text"
            inputMode="decimal"
            value={priceInput}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="12.5"
            className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* 实时单价预览 */}
      {product.quantity > 0 && product.unit && product.price > 0 && (
        <div className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5 font-medium">
          单价：¥{(product.price / product.quantity).toFixed(2)}/{product.unit}
        </div>
      )}
    </div>
  );
}