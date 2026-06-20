import { useRef, useCallback, useEffect } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Product } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { compareProducts, formatUnitPrice } from '@/utils/calculator';
import RankRow from './RankRow';

export default function CompareResultPanel() {
  const { products, addHistory } = useAppStore();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const hasSavedRef = useRef(false);

  const comparison = compareProducts(products);
  const results = comparison?.results ?? [];
  const resultKey = results.map((r) => r.productId).join(',');

  // 自动存入历史记录（必须在 early return 之前调用）
  useEffect(() => {
    if (!comparison || hasSavedRef.current) return;
    hasSavedRef.current = true;
    const timer = setTimeout(() => {
      addHistory(products, results);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey]);

  const handleExportImage = useCallback(async () => {
    if (!shareCardRef.current) return;
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `价比结果_${new Date().toLocaleDateString('zh-CN')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // fallback: do nothing
    }
  }, []);

  if (!comparison) {
    // 显示各商品单独单价
    const hasAnyComplete = products.some((p) => p.quantity > 0 && p.unit && p.price > 0);
    if (!hasAnyComplete) return null;

    return (
      <section className="px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">各商品单价</h3>
          {products.map((p) => {
            if (!(p.quantity > 0 && p.unit && p.price > 0)) return null;
            const unitPrice = p.price / p.quantity;
            return (
              <div key={p.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">
                  {p.name || '未命名'} · {p.quantity}{p.unit}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  ¥{unitPrice.toFixed(2)}/{p.unit}
                </span>
              </div>
            );
          })}
          <p className="text-xs text-gray-400 mt-3 text-center">
            添加至少 2 个完整商品后显示对比结果
          </p>
        </div>
      </section>
    );
  }

  const { message } = comparison;
  const maxPrice = Math.max(...results.map((r) => r.unitPrice));
  const bestPrice = results[0].unitPrice;

  const productMap = new Map<string, Product>();
  products.forEach((p) => productMap.set(p.id, p));

  const bestProduct = productMap.get(results[0].productId);
  const secondBest = results.length > 1 ? productMap.get(results[1].productId) : null;
  const secondBestResult = results.length > 1 ? results[1] : null;

  // 省钱速算
  let savingText = '';
  if (bestProduct && secondBest && secondBestResult && secondBestResult.priceDiffPercent) {
    const diffPerUnit = secondBestResult.unitPrice - bestPrice;
    const unitLabel = results[0].normalizedUnit;
    const commonQty = 5;
    const totalSave = diffPerUnit * commonQty;
    savingText = `买「${bestProduct.name || '最优商品'}」比「${secondBest.name || '次优商品'}」每${unitLabel}省 ¥${diffPerUnit.toFixed(2)}，买 ${commonQty}${unitLabel} 的量总共能省 ¥${totalSave.toFixed(2)}`;
  }

  return (
    <section className="px-4 mt-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 标题栏 */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            对比结果
            {message && (
              <span className="text-[10px] font-normal text-emerald-100 bg-white/20 px-2 py-0.5 rounded-full">
                {message}
              </span>
            )}
          </h2>
        </div>

        {/* 排名表 */}
        <div className="divide-y divide-gray-50">
          {results.map((result) => {
            const product = productMap.get(result.productId);
            if (!product) return null;
            return (
              <RankRow
                key={result.productId}
                result={result}
                product={product}
                maxPrice={maxPrice}
                bestPrice={bestPrice}
              />
            );
          })}
        </div>

        {/* 省钱速算 */}
        {savingText && (
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-800 leading-relaxed">{savingText}</p>
          </div>
        )}

        {/* 分享按钮 */}
        <div className="px-4 py-3 border-t border-gray-50 flex gap-2">
          <button
            onClick={handleExportImage}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            生成对比图
          </button>
        </div>
      </div>

      {/* 隐藏的分享卡片（用于截图） */}
      <div
        ref={shareCardRef}
        className="fixed left-[-9999px] top-0 w-[375px] bg-white p-5"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <div className="text-center mb-4">
          <div className="text-lg font-bold text-gray-900">价比 · UnitPrice</div>
          <div className="text-xs text-gray-400 mt-1">对比结果</div>
        </div>
        <div className="space-y-2 mb-4">
          {results.map((result) => {
            const product = productMap.get(result.productId);
            if (!product) return null;
            return (
              <div key={result.productId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  {result.isBest ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">最划算</span>
                  ) : (
                    <span className="text-xs text-gray-400 w-12 text-center">#{result.rank}</span>
                  )}
                  <span className="text-sm font-medium text-gray-800">
                    {product.name || '商品'} · {product.quantity}{product.unit}
                  </span>
                </div>
                <span className={`text-sm font-bold ${result.isBest ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {formatUnitPrice(result.unitPrice, result.normalizedUnit)}
                </span>
              </div>
            );
          })}
        </div>
        {savingText && (
          <div className="text-xs text-gray-600 text-center mb-4 px-2">{savingText}</div>
        )}
        <div className="text-[10px] text-gray-300 text-center">价比 · UnitPrice</div>
      </div>
    </section>
  );
}