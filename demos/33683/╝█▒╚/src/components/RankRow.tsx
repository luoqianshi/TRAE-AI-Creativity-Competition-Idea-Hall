import type { CompareResult, Product } from '@/types';
import { formatUnitPrice } from '@/utils/calculator';

interface RankRowProps {
  result: CompareResult;
  product: Product;
  maxPrice: number;
  bestPrice: number;
}

export default function RankRow({ result, product, maxPrice, bestPrice }: RankRowProps) {
  const barWidth = maxPrice > 0 ? (result.unitPrice / maxPrice) * 100 : 100;
  const displayName = product.name || `商品 ${result.rank}`;

  return (
    <div className="relative">
      {/* 条形图背景 */}
      <div className="flex items-center gap-3 py-3 px-4 relative z-10">
        {/* 排名标签 */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          result.isBest
            ? 'bg-emerald-500 text-white'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {result.rank}
        </div>

        {/* 商品信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800 truncate">{displayName}</span>
            {result.isBest && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                最划算
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {product.quantity}{product.unit} · ¥{product.price}
          </div>
        </div>

        {/* 单价 */}
        <div className="text-right shrink-0">
          <div className={`text-sm font-bold ${result.isBest ? 'text-emerald-600' : 'text-gray-700'}`}>
            {formatUnitPrice(result.unitPrice, result.normalizedUnit)}
          </div>
          {result.priceDiffPercent !== null && (
            <div className="text-[10px] text-orange-500 font-medium">
              比第1名贵 {result.priceDiffPercent}%
            </div>
          )}
        </div>
      </div>

      {/* 条形 */}
      <div className="absolute inset-y-0 left-0 rounded-xl overflow-hidden" style={{ width: `${barWidth}%` }}>
        <div className={`h-full transition-all duration-700 ease-out ${
          result.isBest ? 'bg-emerald-100' : 'bg-gray-100'
        }`} />
      </div>
    </div>
  );
}