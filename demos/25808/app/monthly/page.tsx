'use client';

import { useState, useEffect, useMemo } from 'react';

const circuitData = [
  { category: "客房区域", id: "room_d05_1", name: "8-10F东客房" },
  { category: "客房区域", id: "room_d5_2", name: "1/2/3F公区照明" },
  { category: "客房区域", id: "room_d05_3", name: "5-7F西公区" },
  { category: "客房区域", id: "room_d13_2", name: "客房回路 d13_2" },
  { category: "客房区域", id: "room_d13_3", name: "5-10F东公区照明" },
  { category: "客房区域", id: "room_d14_1", name: "客房回路 d14_1" },
  { category: "客房区域", id: "room_d14_2", name: "客房回路 d14_2" },
  { category: "客房区域", id: "room_d15_1", name: "客房回路 d15_1" },
  { category: "宴会区域", id: "banq_d07_6", name: "宴会回路 d07_6" },
  { category: "宴会区域", id: "banq_d08_1", name: "宴会回路 d08_1" },
  { category: "宴会区域", id: "banq_d08_2", name: "宴会回路 d08_2" },
  { category: "宴会区域", id: "banq_d08_5", name: "宴会回路 d08_5" },
  { category: "宴会区域", id: "banq_d13_4", name: "宴会回路 d13_4" },
  { category: "宴会区域", id: "banq_d27_7", name: "宴会回路 d27_7" },
  { category: "宴会区域", id: "banq_d36_5", name: "宴会回路 d36_5" },
  { category: "宴会区域", id: "banq_d42_6", name: "宴会回路 d42_6" },
  { category: "电梯区域", id: "elev_d28_2", name: "电梯回路 d28_2" },
  { category: "电梯区域", id: "elev_d44_3", name: "电梯回路 d44_3" },
  { category: "电梯区域", id: "elev_d24_3", name: "电梯回路 d24_3" },
  { category: "电梯区域", id: "elev_d44_1", name: "电梯回路 d44_1" },
  { category: "电梯区域", id: "elev_d28_1", name: "电梯回路 d28_1" },
  { category: "电梯区域", id: "elev_d44_2", name: "电梯回路 d44_2" },
  { category: "电梯区域", id: "elev_d46_3", name: "电梯回路 d46_3" },
  { category: "电梯区域", id: "elev_d31_3", name: "电梯回路 d31_3" },
  { category: "电梯区域", id: "elev_d46_4", name: "电梯回路 d46_4" },
  { category: "电梯区域", id: "elev_d31_4", name: "电梯回路 d31_4" },
  { category: "电梯区域", id: "elev_d46_6", name: "电梯回路 d46_6" },
  { category: "电梯区域", id: "elev_d31_7", name: "电梯回路 d31_7" },
  { category: "电梯区域", id: "elev_d46_5", name: "电梯回路 d46_5" },
  { category: "电梯区域", id: "elev_d31_5", name: "电梯回路 d31_5" },
  { category: "电梯区域", id: "elev_d37_4", name: "电梯回路 d37_4" },
  { category: "电梯区域", id: "elev_d31_2", name: "电梯回路 d31_2" },
  { category: "电梯区域", id: "elev_d46_2", name: "电梯回路 d46_2" },
  { category: "电梯区域", id: "elev_d27_5", name: "电梯回路 d27_5" },
  { category: "电梯区域", id: "elev_d43_4", name: "电梯回路 d43_4" },
  { category: "制冷空调区域", id: "chil_d07_2", name: "制冷空调回路 d07_2" },
  { category: "制冷空调区域", id: "chil_d18_6", name: "制冷空调回路 d18_6" },
  { category: "制冷空调区域", id: "chil_d38_1", name: "B3层空调1号主机" },
  { category: "制冷空调区域", id: "chil_d24_1", name: "B3层空调2号主机" },
  { category: "制冷空调区域", id: "chil_d24_2", name: "B3层空调3号主机" },
  { category: "制冷空调区域", id: "chil_d39_1", name: "制冷空调回路 d39_1" },
  { category: "综合设备区域", id: "equip_d07_8", name: "综合设备回路 d07_8" },
  { category: "综合设备区域", id: "equip_d36_4", name: "综合设备回路 d36_4" },
  { category: "综合设备区域", id: "equip_d26_1", name: "综合设备回路 d26_1" },
  { category: "综合设备区域", id: "equip_d36_3", name: "综合设备回路 d36_3" },
  { category: "综合设备区域", id: "equip_d25_6", name: "综合设备回路 d25_6" },
  { category: "综合设备区域", id: "equip_d08_3", name: "综合设备回路 d08_3" },
  { category: "综合设备区域", id: "equip_d18_4", name: "综合设备回路 d18_4" },
  { category: "综合设备区域", id: "equip_d25_5", name: "综合设备回路 d25_5" },
  { category: "综合设备区域", id: "equip_d36_1", name: "综合设备回路 d36_1" },
  { category: "厨房区域", id: "kit_d12_8", name: "厨房回路 d12_8" },
  { category: "厨房区域", id: "kit_d14_3", name: "厨房回路 d14_3" },
  { category: "厨房区域", id: "kit_d05_6", name: "B1层厨房动力1" },
  { category: "厨房区域", id: "kit_d06_8", name: "厨房回路 d06_8" },
  { category: "厨房区域", id: "kit_d07_7", name: "3-4F冷库" },
  { category: "厨房区域", id: "kit_d08_6", name: "厨房回路 d08_6" },
  { category: "厨房区域", id: "kit_d14_4", name: "厨房回路 d14_4" },
  { category: "厨房区域", id: "kit_d15_2", name: "厨房回路 d15_2" },
  { category: "厨房区域", id: "kit_d18_8", name: "厨房回路 d18_8" },
  { category: "厨房区域", id: "kit_d25_1", name: "B1层厨房动力2" },
  { category: "厨房区域", id: "kit_d25_2", name: "B1层厨房动力3" },
  { category: "厨房区域", id: "kit_d25_7", name: "厨房回路 d25_7" },
  { category: "厨房区域", id: "kit_d27_9", name: "厨房回路 d27_9" },
  { category: "厨房区域", id: "kit_d28_4", name: "厨房回路 d28_4" },
  { category: "厨房区域", id: "kit_d30_4", name: "厨房回路 d30_4" },
  { category: "厨房区域", id: "kit_d31_7", name: "厨房回路 d31_7" },
  { category: "厨房区域", id: "kit_d38_3", name: "厨房回路 d38_3" },
  { category: "厨房区域", id: "kit_d38_4", name: "厨房回路 d38_4" },
  { category: "厨房区域", id: "kit_d08_7", name: "厨房回路 d08_7" },
  { category: "厨房区域", id: "kit_d30_5", name: "厨房回路 d30_5" },
  { category: "厨房区域", id: "kit_d45_7", name: "厨房回路 d45_7" }
];

const categories = Array.from(new Set(circuitData.map(c => c.category)));

export default function MonthlyEntryPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [prevValues, setPrevValues] = useState<Record<string, number>>({});
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split('-');
    
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/monthly?year=${year}&month=${month}`);
        if (!res.ok) return;
        const result = await res.json();
        
        const currentInputs: Record<string, string> = {};
        if (result.current && Array.isArray(result.current)) {
          result.current.forEach((item: any) => {
            currentInputs[item.circuitId] = item.value.toString();
          });
        }
        setInputValues(currentInputs);

        const prevRecords: Record<string, number> = {};
        if (result.previous && Array.isArray(result.previous)) {
          result.previous.forEach((item: any) => {
            prevRecords[item.circuitId] = item.value;
          });
        }
        setPrevValues(prevRecords);
      } catch (e) {
        
      }
    };
    
    fetchData();
  }, [selectedMonth]);

  const handleInputChange = (id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  };

  const calculateProgress = (category: string) => {
    const ids = circuitData.filter(c => c.category === category).map(c => c.id);
    const filled = ids.filter(id => inputValues[id] && inputValues[id].trim() !== '').length;
    return { filled, total: ids.length, complete: filled === ids.length };
  };

  const handleSave = async () => {
    setStatusMessage('');
    const [year, month] = selectedMonth.split('-');
    
    const records = Object.entries(inputValues)
      .filter(([_, value]) => value.trim() !== '')
      .map(([circuitId, value]) => ({ circuitId, value: Number(value) }));
      
    if (records.length === 0) {
      setStatusMessage('当前没有任何输入数据');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, records })
      });
      if (res.ok) {
        setStatusMessage('保存成功');
      } else {
        setStatusMessage('保存失败，请稍后重试');
      }
    } catch (e) {
      setStatusMessage('保存发生异常');
    }
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans select-none">
      
      {/* 左侧分栏 */}
      <div className="w-64 bg-white border-r border-zinc-200/60 p-8 flex flex-col items-center fixed h-full shrink-0">
        <h2 className="text-lg font-medium text-zinc-800 mb-10 w-full text-center">盘点进度</h2>
        <div className="flex flex-col space-y-6 w-full">
          {categories.map(cat => {
            const progress = calculateProgress(cat);
            return (
              <div 
                key={cat} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors"
                onClick={() => setExpandedCategory(cat)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${progress.complete ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-zinc-200'}`} />
                  <span className="text-[15px] text-zinc-700">{cat}</span>
                </div>
                <span className={`text-[13px] ${progress.complete ? 'text-green-600 font-medium' : 'text-zinc-400'}`}>
                  已抄录 {progress.filled}/{progress.total}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 ml-64 p-12 pb-32 max-w-4xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-medium text-zinc-900">月度大盘盘点表</h1>
          <div className="flex items-center space-x-3 bg-white px-5 py-2.5 rounded-full border border-zinc-200/60 shadow-sm">
            <span className="text-zinc-500 text-sm">盘点月份</span>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="outline-none text-[15px] text-zinc-900 bg-transparent cursor-pointer font-medium"
            />
            <span className="text-zinc-400 text-sm pl-2 border-l border-zinc-100">锁定 28 号</span>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map(cat => {
            const isExpanded = expandedCategory === cat;
            const items = circuitData.filter(c => c.category === cat);
            const progress = calculateProgress(cat);

            return (
              <div key={cat} className="bg-white rounded-2xl border border-zinc-200/60 overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300">
                <div 
                  className="px-8 py-5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50"
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                >
                  <h3 className="text-[17px] font-medium text-zinc-800">{cat}</h3>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm ${progress.complete ? 'text-green-600' : 'text-zinc-400'}`}>
                      {progress.filled} / {progress.total}
                    </span>
                    <svg className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div 
                  className="transition-all duration-500 ease-in-out"
                  style={{ maxHeight: isExpanded ? '2000px' : '0', opacity: isExpanded ? 1 : 0 }}
                >
                  <div className="p-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {items.map(item => {
                      const curVal = inputValues[item.id] || '';
                      const prevVal = prevValues[item.id];
                      
                      let diffStr = '';
                      if (curVal && !isNaN(Number(curVal)) && prevVal !== undefined && prevVal !== null) {
                        const diff = Number(curVal) - prevVal;
                        diffStr = `本月走字：${diff > 0 ? '+' : ''}${diff.toFixed(2)}`;
                      }

                      return (
                        <div key={item.id} className="flex flex-col space-y-2">
                          <label className="text-[14px] font-medium text-zinc-700">{item.name}</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={curVal}
                              onChange={(e) => handleInputChange(item.id, e.target.value)}
                              placeholder="请输入本月数值..."
                              className="w-full px-4 py-2.5 bg-zinc-50/50 border border-zinc-200/60 rounded-xl outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 text-zinc-900 placeholder:text-zinc-300 text-[15px]"
                            />
                            {diffStr && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-cyan-600 font-medium">
                                {diffStr}
                              </div>
                            )}
                          </div>
                          <div className="text-[12px] text-zinc-400 pl-1 h-4">
                            {prevVal !== undefined && prevVal !== null ? `上月表底：${prevVal}` : '上月表底：暂无'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部悬浮操作栏 */}
      <div className="fixed bottom-0 left-64 right-0 pb-8 pt-10 px-12 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent flex justify-between items-end pointer-events-none">
        
        <div className={`transition-all duration-500 ease-out transform ${statusMessage ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} pointer-events-auto`}>
          {statusMessage && (
            <div className={`text-sm py-2 px-5 rounded-full border ${statusMessage === '保存成功' ? 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-[0_4px_14px_rgba(6,182,212,0.15)]' : statusMessage === '当前没有任何输入数据' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {statusMessage}
            </div>
          )}
        </div>

        <div className="flex space-x-4 pointer-events-auto">
          <button 
            onClick={handleSave}
            className="px-8 py-3.5 bg-white text-zinc-700 border border-zinc-200/80 rounded-full text-[15px] font-medium hover:bg-zinc-50 hover:shadow-sm transition-all duration-300 active:scale-[0.98] outline-none"
          >
            暂存当前数据
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3.5 bg-zinc-900 text-white rounded-full text-[15px] font-medium hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-zinc-100"
          >
            确认提交大盘
          </button>
        </div>
      </div>
    </div>
  );
}
