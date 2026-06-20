import { Upload, FileText } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '@/types';
import { usePlannerStore } from '@/store/plannerStore';

export default function BatchImport() {
  const { importTasks } = usePlannerStore();
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState('');

  const handleImport = () => {
    const lines = text.trim().split('\n').filter((l) => l.trim());
    const tasks: Task[] = lines.map((line) => {
      const parts = line.split(/[,，;；\t]/).map((s) => s.trim());
      const name = parts[0] || '未命名任务';
      const estimatedMinutes = parseInt(parts[1]) || 60;
      const urgencyMap: Record<string, Task['urgency']> = { '紧急': 'high', '高': 'high', '一般': 'medium', '中': 'medium', '不急': 'low', '低': 'low' };
      const difficultyMap: Record<string, Task['difficulty']> = { '困难': 'hard', '难': 'hard', '高': 'hard', '中等': 'medium', '中': 'medium', '简单': 'easy', '易': 'easy', '低': 'easy' };
      const urgency = urgencyMap[parts[2]] || 'medium';
      const difficulty = difficultyMap[parts[3]] || 'medium';
      const category = parts[4] || '其他';

      return {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        estimatedMinutes: Math.max(15, Math.min(240, estimatedMinutes)),
        urgency,
        difficulty,
        category,
        notes: '',
      };
    });

    if (tasks.length > 0) {
      importTasks(tasks);
      setText('');
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-all duration-200"
      >
        <Upload className="w-4 h-4" />
        批量导入
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 border border-slate-700/50 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              批量导入任务
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              每行一个任务，格式：任务名, 时长(分钟), 紧急程度, 难度, 分类
            </p>
            <p className="text-xs text-slate-500 mb-3">
              示例：完成数学作业, 90, 紧急, 困难, 学习
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"完成数学作业, 90, 紧急, 困难, 学习\n复习英语单词, 30, 一般, 简单, 学习\n整理会议纪要, 45, 紧急, 中等, 工作"}
              className="w-full h-40 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleImport}
                disabled={!text.trim()}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg transition-all duration-200"
              >
                导入 ({text.trim().split('\n').filter((l) => l.trim()).length} 个任务)
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-all duration-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
