import Header from '@/components/Header';
import ProductInputPanel from '@/components/ProductInputPanel';
import CompareResultPanel from '@/components/CompareResultPanel';
import HistoryPanel from '@/components/HistoryPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-8">
      <div className="max-w-[480px] mx-auto">
        <Header />
        <ProductInputPanel />
        <CompareResultPanel />
        <HistoryPanel />
      </div>
    </div>
  );
}