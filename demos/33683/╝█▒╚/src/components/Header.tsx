import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center py-8 px-4">
      <div className="inline-flex items-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-emerald-500" />
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          价比 <span className="text-emerald-500 font-normal text-lg">· UnitPrice</span>
        </h1>
      </div>
      <p className="text-sm text-gray-400">输入规格和价格，立刻告诉你哪个更划算</p>
    </header>
  );
}