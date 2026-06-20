import { Plus, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ProductRow from './ProductRow';

export default function ProductInputPanel() {
  const { products, addProduct, removeProduct, updateProduct, clearAll } = useAppStore();

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">添加商品</h2>
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          全部清空
        </button>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            index={index}
            canDelete={products.length > 2}
            onUpdate={updateProduct}
            onDelete={removeProduct}
          />
        ))}
      </div>

      {products.length < 6 && (
        <button
          onClick={addProduct}
          className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          添加商品（{products.length}/6）
        </button>
      )}
    </section>
  );
}