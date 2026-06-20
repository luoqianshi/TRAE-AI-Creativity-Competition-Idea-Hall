import { useState } from 'react';
import { Plus, Clock, AlertTriangle, BarChart3, Tag, FileText, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { usePlannerStore } from '@/store/plannerStore';

const CATEGORIES = ['学习', '工作', '生活', '运动', '阅读', '其他'];

export default function TaskInput() {
  const { addTask, removeTask, tasks } = usePlannerStore();
  const [name, setName] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [urgency, setUrgency] = useState<Task['urgency']>('medium');
  const [difficulty, setDifficulty] = useState<Task['difficulty']>('medium');
  const [category, setCategory] = useState('学习');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    addTask({
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      estimatedMinutes,
      urgency,
      difficulty,
      category,
      notes,
    });
    setName('');
    setEstimatedMinutes(60);
    setUrgency('medium');
    setDifficulty('medium');
    setNotes('');
    setShowForm(false);
  };

  const urgencyConfig = {
    high: { label: '紧急', color: 'bg-red-500', ring: 'ring-red-500/30' },
    medium: { label: '一般', color: 'bg-amber-500', ring: 'ring-amber-500/30' },
    low: { label: '不急', color: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  };

  const difficultyConfig = {
    hard: { label: '困难', color: 'text-red-400' },
    medium: { label: '中等', color: 'text-amber-400' },
    easy: { label: '简单', color: 'text-emerald-400' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-400" />
          待办事项
          {tasks.length > 0 && (
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          添加任务
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 space-y-3 animate-in fade-in duration-200">
          <input
            type="text"
            placeholder="任务名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 预估时长
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={15}
                  max={240}
                  step={15}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-sm text-indigo-300 font-mono w-12 text-right">
                  {estimatedMinutes}m
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> 分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 紧急程度
              </label>
              <div className="flex gap-1.5">
                {(['high', 'medium', 'low'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                      urgency === u
                        ? `${urgencyConfig[u].color} text-white ring-2 ${urgencyConfig[u].ring}`
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {urgencyConfig[u].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" /> 难度
              </label>
              <div className="flex gap-1.5">
                {(['hard', 'medium', 'easy'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                      difficulty === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {difficultyConfig[d].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <FileText className="w-3 h-3" /> 备注
            </label>
            <input
              type="text"
              placeholder="可选备注"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg transition-all duration-200"
            >
              确认添加
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-all duration-200"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {tasks.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800/90 rounded-lg px-3 py-2.5 border border-slate-700/40 transition-all duration-200"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${urgencyConfig[task.urgency].color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 font-medium truncate">{task.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">{task.estimatedMinutes}分钟</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-indigo-400/80">{task.category}</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className={`text-xs ${difficultyConfig[task.difficulty].color}`}>
                    {difficultyConfig[task.difficulty].label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && !showForm && (
        <div className="text-center py-8 text-slate-500">
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">还没有待办事项</p>
          <p className="text-xs mt-1">点击上方按钮添加任务</p>
        </div>
      )}
    </div>
  );
}
