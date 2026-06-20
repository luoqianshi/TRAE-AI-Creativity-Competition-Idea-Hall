import { Sparkles, RotateCcw, Brain, Zap, Target, Clock } from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';
import TaskInput from '@/components/TaskInput';
import ScheduleConfigPanel from '@/components/ScheduleConfigPanel';
import SchedulePreview from '@/components/SchedulePreview';
import BatchImport from '@/components/BatchImport';
import ExportPanel from '@/components/ExportPanel';

export default function Home() {
  const { tasks, generatePlan, scheduleResult, clearSchedule } = usePlannerStore();

  const handleGenerate = () => {
    if (tasks.length === 0) return;
    generatePlan();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-violet-950/60 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl" />
          <div className="absolute top-20 right-40 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
              AI日程智能规划助手
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            输入待办事项，AI自动根据紧急程度、任务难度、耗时长短，智能生成科学时间计划表。告别拖延，高效管理每一天。
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { icon: <Zap className="w-3 h-3" />, text: '智能优先级排序' },
              { icon: <Target className="w-3 h-3" />, text: '科学时间分配' },
              { icon: <Clock className="w-3 h-3" />, text: '自动休息安排' },
            ].map((f) => (
              <span
                key={f.text}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/60 border border-slate-700/50 rounded-full text-xs text-slate-400"
              >
                {f.icon} {f.text}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          {/* Left Panel - Input */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">任务录入</h2>
                <BatchImport />
              </div>
              <TaskInput />
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/60 p-5">
              <ScheduleConfigPanel />
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                disabled={tasks.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                {scheduleResult ? '重新规划' : '智能规划'}
              </button>
              {scheduleResult && (
                <button
                  onClick={clearSchedule}
                  className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  清除计划
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Schedule Preview */}
          <div className="lg:col-span-3">
            <div
              id="schedule-preview"
              className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/60 p-5 min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">计划表</h2>
                <ExportPanel />
              </div>
              <SchedulePreview />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-6">
        <p className="text-center text-xs text-slate-600">
          AI日程智能规划助手 · 让每一天都有计划
        </p>
      </footer>
    </div>
  );
}
