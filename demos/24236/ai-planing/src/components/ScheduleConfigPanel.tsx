import { useState } from 'react';
import { Sun, Moon, Coffee, Calendar, Plus, X, Clock } from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';

export default function ScheduleConfig() {
  const { config, updateConfig, addFixedEvent, removeFixedEvent } = usePlannerStore();
  const [showFixedForm, setShowFixedForm] = useState(false);
  const [fixedName, setFixedName] = useState('');
  const [fixedStart, setFixedStart] = useState('08:00');
  const [fixedEnd, setFixedEnd] = useState('11:40');

  const handleAddFixed = () => {
    if (!fixedName.trim()) return;
    addFixedEvent({
      id: `fe-${Date.now()}`,
      name: fixedName.trim(),
      start: fixedStart,
      end: fixedEnd,
    });
    setFixedName('');
    setShowFixedForm(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-violet-400" />
        作息设置
      </h2>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> 起床时间
            </label>
            <input
              type="time"
              value={config.wakeUpTime}
              onChange={(e) => updateConfig({ wakeUpTime: e.target.value })}
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <Moon className="w-3 h-3 text-blue-400" /> 睡觉时间
            </label>
            <input
              type="time"
              value={config.sleepTime}
              onChange={(e) => updateConfig({ sleepTime: e.target.value })}
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <Coffee className="w-3 h-3 text-orange-400" /> 午休开始
            </label>
            <input
              type="time"
              value={config.lunchBreak.start}
              onChange={(e) =>
                updateConfig({
                  lunchBreak: { ...config.lunchBreak, start: e.target.value },
                })
              }
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <Coffee className="w-3 h-3 text-orange-400" /> 午休结束
            </label>
            <input
              type="time"
              value={config.lunchBreak.end}
              onChange={(e) =>
                updateConfig({
                  lunchBreak: { ...config.lunchBreak, end: e.target.value },
                })
              }
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>
      </div>

      {/* Fixed events */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> 固定事项
          </label>
          <button
            onClick={() => setShowFixedForm(!showFixedForm)}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            {showFixedForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showFixedForm ? '取消' : '添加'}
          </button>
        </div>

        {showFixedForm && (
          <div className="bg-slate-800/60 rounded-lg p-3 space-y-2 border border-slate-700/40">
            <input
              type="text"
              placeholder="事项名称（如：上课、会议）"
              value={fixedName}
              onChange={(e) => setFixedName(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleAddFixed()}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={fixedStart}
                onChange={(e) => setFixedStart(e.target.value)}
                className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <input
                type="time"
                value={fixedEnd}
                onChange={(e) => setFixedEnd(e.target.value)}
                className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <button
              onClick={handleAddFixed}
              disabled={!fixedName.trim()}
              className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded-lg transition-all duration-200"
            >
              确认添加
            </button>
          </div>
        )}

        {config.fixedEvents.map((event) => (
          <div
            key={event.id}
            className="group flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-sm text-slate-300 flex-1">{event.name}</span>
            <span className="text-xs text-slate-500 font-mono">
              {event.start}-{event.end}
            </span>
            <button
              onClick={() => removeFixedEvent(event.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-all duration-200"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
