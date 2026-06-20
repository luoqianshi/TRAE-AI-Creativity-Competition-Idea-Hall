import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TrendProps {
  title: string;
  subtitle: string;
  data: { date: string; value: number }[];
  unit: string;
  color: string;
}

export const CombinedTrendChart: React.FC<TrendProps> = ({ title, subtitle, data, unit, color }) => {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs p-6 h-[450px]">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
      </div>
      <div className="h-[calc(100%-60px)]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              margin={{ top: 10, right: 15, left: 40, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis 
                dataKey="date" 
                interval={3} 
                tick={{fontSize: 10}} 
                stroke="#a1a1aa"
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{fontSize: 10}} stroke="#a1a1aa" unit={unit} width={60} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', borderColor: '#e4e4e7' }}
                itemStyle={{ color: '#09090b', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2 }}
                activeDot={{ fill: color, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
};
