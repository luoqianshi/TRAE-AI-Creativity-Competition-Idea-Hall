import { Sparkles, Edit3 } from 'lucide-react';
import type { AIDiaryContent } from '../data/types';

interface AIDiaryProps {
  content: string | AIDiaryContent;
}

export function AIDiary({ content }: AIDiaryProps) {
  const data: AIDiaryContent = typeof content === 'string' ? { summary: content, entries: [] } : content;

  return (
    <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 rounded-3xl p-6 md:p-8 shadow-sm border border-orange-100/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">AI 旅行日记</h3>
            <p className="text-xs text-gray-500">由 AI 根据你的照片和位置数据自动生成</p>
          </div>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-orange-500 transition-colors rounded-full hover:bg-orange-50">
          <Edit3 size={14} />
          <span>编辑</span>
        </button>
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-white/60 border border-orange-100/60 text-sm text-gray-700 leading-relaxed italic">
        <Sparkles size={14} className="inline-block mr-1.5 text-orange-500 -mt-0.5" />
        {data.summary}
      </div>

      <div className="space-y-6">
        {data.entries.map((entry, idx) => {
          const date = new Date(entry.date);
          const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`;
          const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
          return (
            <article key={idx} className="relative pl-6 border-l-2 border-orange-200/70">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-orange-400" />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-gray-800">{monthDay}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                  星期{weekday}
                </span>
              </div>
              <div className="space-y-2.5">
                {entry.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-[15px] text-gray-700 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
