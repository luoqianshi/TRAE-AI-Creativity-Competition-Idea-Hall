import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Wallet() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  
  // Mock交易记录
  const transactions = [
    { id: '1', type: 'income', amount: 30, desc: '家电维修服务', time: '2024-03-10 14:30' },
    { id: '2', type: 'income', amount: 50, desc: '辅导作业服务', time: '2024-03-08 16:00' },
    { id: '3', type: 'expense', amount: 20, desc: '手机教学服务', time: '2024-03-05 10:00' },
    { id: '4', type: 'income', amount: 15, desc: '理发服务', time: '2024-03-01 09:00' },
  ];
  
  const filteredTransactions = transactions.filter((t) => t.type === activeTab);
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  
  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-primary to-primary-light px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">我的钱包</h1>
          <div className="w-5" />
        </div>
        
        {/* 余额卡片 */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white" />
            <span className="text-white/80 text-sm">账户余额</span>
          </div>
          <div className="text-white text-3xl font-bold">
            ¥{totalIncome - totalExpense}
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <ArrowDownToLine className="w-3 h-3 text-secondary" />
                <span className="text-white/80 text-xs">总收入</span>
              </div>
              <p className="text-white text-lg font-bold mt-1">¥{totalIncome}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <ArrowUpFromLine className="w-3 h-3 text-red-400" />
                <span className="text-white/80 text-xs">总支出</span>
              </div>
              <p className="text-white text-lg font-bold mt-1">¥{totalExpense}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex gap-3">
          <button className="flex-1 flex flex-col items-center gap-2 py-3 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors">
            <ArrowDownToLine className="w-6 h-6 text-secondary" />
            <span className="text-sm text-gray-600">提现</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-2 py-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-sm text-gray-600">收益明细</span>
          </button>
        </div>
      </div>
      
      {/* 交易记录 */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm">
          {/* Tab切换 */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'income' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500'
              }`}
            >
              收入记录
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'expense' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500'
              }`}
            >
              支出记录
            </button>
          </div>
          
          {/* 记录列表 */}
          <div className="p-4">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'income' 
                        ? 'bg-secondary/10' 
                        : 'bg-red-50'
                    }`}>
                      {t.type === 'income' 
                        ? <ArrowDownToLine className="w-5 h-5 text-secondary" />
                        : <ArrowUpFromLine className="w-5 h-5 text-red-500" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{t.desc}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{t.time}</span>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${
                      t.type === 'income' 
                        ? 'text-secondary' 
                        : 'text-red-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}¥{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400">暂无记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}