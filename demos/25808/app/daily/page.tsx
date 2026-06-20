'use client';

import { useState, useEffect } from 'react';

interface DailyRecord {
  date: string;
  power1: number | null;
  power2: number | null;
  water1: number | null;
  water2: number | null;
  gas: number | null;
}

export default function DailyEntryPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [formData, setFormData] = useState({
    power1: '',
    power2: '',
    water1: '',
    water2: '',
    gas: ''
  });
  const [yesterdayData, setYesterdayData] = useState<Partial<DailyRecord>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  }, []);

  useEffect(() => {
    if (!currentDate) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/daily?date=${currentDate}`);
        if (response.ok) {
          const result = await response.json();
          if (result.yesterday) {
            setYesterdayData(result.yesterday);
          } else {
            setYesterdayData({});
          }
          if (result.today) {
            setFormData({
              power1: result.today.power1?.toString() || '',
              power2: result.today.power2?.toString() || '',
              water1: result.today.water1?.toString() || '',
              water2: result.today.water2?.toString() || '',
              gas: result.today.gas?.toString() || ''
            });
          } else {
            setFormData({ power1: '', power2: '', water1: '', water2: '', gas: '' });
          }
        }
      } catch (err) {
        // 静默处理错误，不打扰极简交互
      }
    };

    fetchData();
  }, [currentDate]);

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: currentDate,
          ...formData
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 p-12 relative overflow-hidden">
        
        {/* 极简状态提示 */}
        <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ease-out ${
          submitStatus === 'success' ? 'bg-cyan-400' : submitStatus === 'error' ? 'bg-red-400' : 'bg-transparent'
        }`} />
        
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out ${
          submitStatus === 'success' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="bg-cyan-50 text-cyan-700 text-sm py-1.5 px-4 rounded-full border border-cyan-100">
            保存成功
          </div>
        </div>

        <div className="flex flex-col items-center mb-12">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="text-2xl text-center text-zinc-900 bg-transparent outline-none cursor-pointer border-b border-transparent hover:border-zinc-200 focus:border-cyan-400 transition-colors pb-1"
          />
        </div>

        <div className="space-y-8">
          <ItemRow 
            label="总电表一表底" 
            value={formData.power1} 
            onChange={handleInputChange('power1')} 
            yesterdayValue={yesterdayData.power1} 
          />
          <ItemRow 
            label="总电表二表底" 
            value={formData.power2} 
            onChange={handleInputChange('power2')} 
            yesterdayValue={yesterdayData.power2} 
          />
          <ItemRow 
            label="总水表一表底" 
            value={formData.water1} 
            onChange={handleInputChange('water1')} 
            yesterdayValue={yesterdayData.water1} 
          />
          <ItemRow 
            label="总水表二表底" 
            value={formData.water2} 
            onChange={handleInputChange('water2')} 
            yesterdayValue={yesterdayData.water2} 
          />
          <ItemRow 
            label="天然气当日用量" 
            value={formData.gas} 
            onChange={handleInputChange('gas')} 
            yesterdayValue={yesterdayData.gas} 
          />
        </div>

        <div className="mt-16 flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-zinc-900 text-white px-10 py-4 rounded-full text-[15px] hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-200 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-zinc-100"
          >
            确认提交当日数据
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ label, value, onChange, yesterdayValue }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, yesterdayValue?: number | null }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-[15px] font-medium text-zinc-800">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder="请输入今日数值..."
        className="w-full px-4 py-3 bg-white border border-zinc-200/60 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 test-zinc-900 placeholder:text-zinc-300"
      />
      <div className="text-[13px] text-zinc-400 pl-1">
        昨日表底：{yesterdayValue !== undefined && yesterdayValue !== null ? yesterdayValue : '暂无'}
      </div>
    </div>
  );
}
