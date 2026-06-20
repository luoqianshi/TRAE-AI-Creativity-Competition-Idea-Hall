import { Sparkles, Check, Circle, Coffee, Sun, Moon, Clock } from 'lucide-react';
import type { ScheduleBlock } from '@/types';
import { usePlannerStore } from '@/store/plannerStore';

function getBlockStyle(block: ScheduleBlock) {
  if (block.taskId === 'wakeup') return { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-300', icon: <Sun className="w-3.5 h-3.5" /> };
  if (block.taskId === 'sleep') return { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-300', icon: <Moon className="w-3.5 h-3.5" /> };
  if (block.taskId === 'lunch' || block.taskId === 'break') return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-300', icon: <Coffee className="w-3.5 h-3.5" /> };
  if (block.taskId.startsWith('fixed-')) return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-300', icon: <Clock className="w-3.5 h-3.5" /> };

  const urgencyColors = {
    high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300' },
    medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300' },
    low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  };
  const c = urgencyColors[block.urgency];
  return { ...c, icon: <Sparkles className="w-3.5 h-3.5" /> };
}

function getPriorityLabel(priority: number) {
  if (priority === 0) return null;
  if (priority === 3) return { label: '高优', color: 'bg-red-500/20 text-red-300' };
  if (priority === 2) return { label: '中优', color: 'bg-amber-500/20 text-amber-300' };
  return { label: '低优', color: 'bg-emerald-500/20 text-emerald-300' };
}

export default function SchedulePreview() {
  const { scheduleResult, toggleBlockCompleted } = usePlannerStore();

  if (!scheduleResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-sm font-medium">添加待办并点击智能规划</p>
        <p className="text-xs mt-1 text-slate-600">AI将为你生成科学的时间计划表</p>
      </div>
    );
  }

  const taskBlocks = scheduleResult.blocks.filter(
    (b) => b.taskId !== 'wakeup' && b.taskId !== 'sleep'
  );

  const completedCount = taskBlocks.filter((b) => b.completed).length;
  const totalCount = taskBlocks.filter(
    (b) => b.taskId !== 'lunch' && b.taskId !== 'break' && !b.taskId.startsWith('fixed-')
  ).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">今日进度</span>
            <span className="text-xs text-indigo-300 font-mono">
              {completedCount}/{totalCount} 已完成
            </span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative space-y-1">
        {scheduleResult.blocks.map((block, index) => {
          const style = getBlockStyle(block);
          const priorityInfo = getPriorityLabel(block.priority);
          const isMarker = block.taskId === 'wakeup' || block.taskId === 'sleep';
          const isRest = block.taskId === 'lunch' || block.taskId === 'break';

          if (isMarker) {
            return (
              <div key={block.id} className="flex items-center gap-3 py-1">
                <div className={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center ${style.text}`}>
                  {style.icon}
                </div>
                <span className={`text-xs font-medium ${style.text}`}>
                  {block.taskName}
                </span>
                <span className="text-xs text-slate-600 font-mono">
                  {block.startTime}
                </span>
              </div>
            );
          }

          return (
            <div
              key={block.id}
              className={`group relative flex items-start gap-3 rounded-lg px-3 py-2.5 border transition-all duration-200 ${
                block.completed
                  ? 'bg-slate-800/30 border-slate-700/20 opacity-60'
                  : `${style.bg} ${style.border} hover:${style.border}`
              }`}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-0.5">
                <button
                  onClick={() => toggleBlockCompleted(block.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    block.completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : `border-slate-600 hover:border-indigo-400`
                  }`}
                >
                  {block.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                {index < scheduleResult.blocks.length - 1 && (
                  <div className="w-px h-4 bg-slate-700/50 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      block.completed ? 'line-through text-slate-500' : style.text
                    }`}
                  >
                    {block.taskName}
                  </span>
                  {priorityInfo && !isRest && !block.taskId.startsWith('fixed-') && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </span>
                  )}
                  {!isRest && !block.taskId.startsWith('fixed-') && block.category && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300">
                      {block.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 font-mono">
                    {block.startTime} - {block.endTime}
                  </span>
                  {!isRest && !block.taskId.startsWith('fixed-') && block.notes && (
                    <>
                      <span className="text-xs text-slate-700">·</span>
                      <span className="text-xs text-slate-500 truncate">{block.notes}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Time duration */}
              {!isMarker && (
                <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">
                  {getTimeDiff(block.startTime, block.endTime)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeDiff(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return '';
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}
